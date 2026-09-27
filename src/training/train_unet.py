"""
Module: train_unet.py
Complete training pipeline for U-Net binary canopy segmentation.
Supports PyTorch 2.4+ AMP, AdamW, CosineAnnealingLR, CSV logging, checkpointing, and synthetic dry-runs.
"""
import argparse
import csv
import json
import os
import sys
import time
from pathlib import Path
from typing import Dict, Any, Tuple

import yaml
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.models.unet import create_unet
from src.data.dataset import SegmentationDataset, generate_synthetic_segmentation_dataset
from src.data.transforms import get_train_transforms, get_val_transforms
from src.training.losses import BCEDiceLoss
from src.evaluation.metrics import SegmentationMetricMeter


def parse_args():
    parser = argparse.ArgumentParser(description="Train U-Net for canopy segmentation.")
    parser.add_argument("--config", type=str, default="configs/training/unet.yaml", help="Path to YAML config.")
    parser.add_argument("--epochs", type=int, default=None, help="Override number of epochs.")
    parser.add_argument("--batch-size", type=int, default=None, help="Override batch size.")
    parser.add_argument("--lr", type=float, default=None, help="Override learning rate.")
    parser.add_argument("--device", type=str, default=None, help="Override compute device (e.g. cuda:0 or cpu).")
    parser.add_argument("--dry-run-synthetic", action="store_true", help="Run on synthetic data for pipeline validation.")
    parser.add_argument("--synthetic-samples", type=int, default=24, help="Number of synthetic samples per split.")
    parser.add_argument("--synthetic-dir", type=str, default="runs/synthetic_temp_data", help="Directory for synthetic data.")
    return parser.parse_args()


def load_config(config_path: str) -> Dict[str, Any]:
    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def train_one_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    optimizer: torch.optim.Optimizer,
    scaler: torch.amp.GradScaler,
    device: torch.device,
    amp_enabled: bool,
    grad_clip: float = 1.0
) -> Tuple[float, Dict[str, float]]:
    model.train()
    running_loss = 0.0
    meter = SegmentationMetricMeter(threshold=0.5)

    for images, masks, _ in loader:
        images = images.to(device, non_blocking=True)
        masks = masks.to(device, non_blocking=True)

        optimizer.zero_grad(set_to_none=True)

        with torch.amp.autocast(device_type="cuda" if "cuda" in device.type else "cpu", enabled=amp_enabled):
            logits = model(images)
            loss = criterion(logits, masks)

        scaler.scale(loss).backward()
        if grad_clip > 0:
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), grad_clip)
        scaler.step(optimizer)
        scaler.update()

        running_loss += loss.item() * images.size(0)
        meter.update(logits.detach(), masks)

    epoch_loss = running_loss / len(loader.dataset)
    metrics = meter.compute()
    return epoch_loss, metrics


@torch.no_grad()
def evaluate_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
    amp_enabled: bool
) -> Tuple[float, Dict[str, float]]:
    model.eval()
    running_loss = 0.0
    meter = SegmentationMetricMeter(threshold=0.5)

    for images, masks, _ in loader:
        images = images.to(device, non_blocking=True)
        masks = masks.to(device, non_blocking=True)

        with torch.amp.autocast(device_type="cuda" if "cuda" in device.type else "cpu", enabled=amp_enabled):
            logits = model(images)
            loss = criterion(logits, masks)

        running_loss += loss.item() * images.size(0)
        meter.update(logits, masks)

    epoch_loss = running_loss / len(loader.dataset)
    metrics = meter.compute()
    return epoch_loss, metrics


def main():
    args = parse_args()
    config = load_config(args.config) if Path(args.config).exists() else {}

    # Config resolution
    model_cfg = config.get("model", {})
    data_cfg = config.get("data", {})
    train_cfg = config.get("training", {})
    loss_cfg = config.get("loss", {})
    chkpt_cfg = config.get("checkpoint", {})

    epochs = args.epochs or train_cfg.get("epochs", 50)
    batch_size = args.batch_size or train_cfg.get("batch_size", 4)
    lr = args.lr or train_cfg.get("learning_rate", 0.001)
    min_lr = train_cfg.get("min_lr", 1e-5)
    weight_decay = train_cfg.get("weight_decay", 1e-4)
    img_size = tuple(data_cfg.get("image_size", [512, 512]))
    save_dir = Path(chkpt_cfg.get("save_dir", "runs/unet/baseline"))
    save_dir.mkdir(parents=True, exist_ok=True)

    device_str = args.device or train_cfg.get("device", "cuda:0")
    if "cuda" in device_str and not torch.cuda.is_available():
        print("[WARN] CUDA not available, falling back to CPU.")
        device = torch.device("cpu")
        amp_enabled = False
    else:
        device = torch.device(device_str)
        amp_enabled = train_cfg.get("amp", True) and ("cuda" in device.type)

    print("=" * 70)
    print(" GreenVision-AI: U-Net Training Initialization")
    print("=" * 70)
    print(f" Device          : {device} ({torch.cuda.get_device_name(0) if 'cuda' in device.type else 'CPU'})")
    print(f" Image Size      : {img_size}")
    print(f" Batch Size      : {batch_size}")
    print(f" Base Channels   : {model_cfg.get('base_channels', 32)}")
    print(f" Initial LR      : {lr}")
    print(f" AMP Enabled     : {amp_enabled}")
    print(f" Save Directory  : {save_dir.resolve()}")
    print("=" * 70)

    # Dataset Setup
    if args.dry_run_synthetic:
        print("[INFO] Generating synthetic dataset for validation dry-run...")
        train_img_dir, train_mask_dir = generate_synthetic_segmentation_dataset(
            args.synthetic_dir, num_samples=args.synthetic_samples, img_size=img_size, split_name="train"
        )
        val_img_dir, val_mask_dir = generate_synthetic_segmentation_dataset(
            args.synthetic_dir, num_samples=max(8, args.synthetic_samples // 3), img_size=img_size, split_name="val"
        )
    else:
        train_img_dir = data_cfg.get("train_image_dir")
        train_mask_dir = data_cfg.get("train_mask_dir")
        val_img_dir = data_cfg.get("val_image_dir")
        val_mask_dir = data_cfg.get("val_mask_dir")

    train_ds = SegmentationDataset(
        image_dir=train_img_dir,
        mask_dir=train_mask_dir,
        transform=get_train_transforms(image_size=img_size)
    )
    val_ds = SegmentationDataset(
        image_dir=val_img_dir,
        mask_dir=val_mask_dir,
        transform=get_val_transforms(image_size=img_size)
    )

    num_workers = min(train_cfg.get("num_workers", 2), os.cpu_count() or 1)
    train_loader = DataLoader(
        train_ds,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=("cuda" in device.type),
        drop_last=True if len(train_ds) > batch_size else False
    )
    val_loader = DataLoader(
        val_ds,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=("cuda" in device.type)
    )

    print(f" Dataset summary: {len(train_ds)} train samples, {len(val_ds)} val samples.")

    # Model & Optimization Setup
    model = create_unet(
        in_channels=model_cfg.get("in_channels", 3),
        out_channels=model_cfg.get("out_channels", 1),
        base_channels=model_cfg.get("base_channels", 32),
        bilinear=model_cfg.get("bilinear", False)
    ).to(device)

    params_info = model.get_parameter_count()
    print(f" Model parameters: {params_info['total_parameters']:,} total, {params_info['trainable_parameters']:,} trainable.")

    criterion = BCEDiceLoss(
        bce_weight=loss_cfg.get("bce_weight", 0.5),
        dice_weight=loss_cfg.get("dice_weight", 0.5),
        smooth=loss_cfg.get("smooth", 1e-6)
    )
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=min_lr)
    scaler = torch.amp.GradScaler(device="cuda" if "cuda" in device.type else "cpu", enabled=amp_enabled)

    # Logging Setup
    csv_path = save_dir / "training_metrics.csv"
    csv_fields = ["epoch", "train_loss", "train_iou", "train_dice", "val_loss", "val_iou", "val_dice", "val_precision", "val_recall", "val_accuracy", "lr", "epoch_time_sec"]
    with open(csv_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(csv_fields)

    best_iou = -1.0
    print("\nStarting training loop...\n")

    for epoch in range(1, epochs + 1):
        t0 = time.time()

        train_loss, train_metrics = train_one_epoch(
            model=model,
            loader=train_loader,
            criterion=criterion,
            optimizer=optimizer,
            scaler=scaler,
            device=device,
            amp_enabled=amp_enabled,
            grad_clip=train_cfg.get("gradient_clip", 1.0)
        )

        val_loss, val_metrics = evaluate_epoch(
            model=model,
            loader=val_loader,
            criterion=criterion,
            device=device,
            amp_enabled=amp_enabled
        )

        current_lr = optimizer.param_groups[0]["lr"]
        scheduler.step()
        epoch_time = time.time() - t0

        # Log CSV
        with open(csv_path, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                epoch,
                f"{train_loss:.4f}", f"{train_metrics['iou']:.4f}", f"{train_metrics['dice']:.4f}",
                f"{val_loss:.4f}", f"{val_metrics['iou']:.4f}", f"{val_metrics['dice']:.4f}",
                f"{val_metrics['precision']:.4f}", f"{val_metrics['recall']:.4f}", f"{val_metrics['accuracy']:.4f}",
                f"{current_lr:.6f}", f"{epoch_time:.2f}"
            ])

        print(
            f"Epoch [{epoch:02d}/{epochs:02d}] "
            f"Train Loss: {train_loss:.4f} | Train IoU: {train_metrics['iou']:.4f} | "
            f"Val Loss: {val_loss:.4f} | Val IoU: {val_metrics['iou']:.4f} | Val Dice: {val_metrics['dice']:.4f} | "
            f"Time: {epoch_time:.1f}s"
        )

        # Save last checkpoint
        checkpoint_data = {
            "epoch": epoch,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "scheduler_state_dict": scheduler.state_dict(),
            "scaler_state_dict": scaler.state_dict(),
            "best_iou": max(best_iou, val_metrics["iou"]),
            "config": config,
            "val_metrics": val_metrics
        }
        torch.save(checkpoint_data, save_dir / "last.pt")

        # Save best checkpoint
        if val_metrics["iou"] > best_iou:
            best_iou = val_metrics["iou"]
            torch.save(checkpoint_data, save_dir / "best.pt")
            print(f"  --> Saved new best model checkpoint (Val IoU: {best_iou:.4f})")

    print("\nTraining completed successfully.")
    print(f"Best Val IoU: {best_iou:.4f}")
    print(f"Artifacts saved in: {save_dir.resolve()}")


if __name__ == "__main__":
    main()