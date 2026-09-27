"""
Module: evaluate_unet.py
Evaluation script for trained U-Net checkpoints on validation/test datasets.
Calculates IoU, Dice, Precision, Recall, and Accuracy.
"""
import argparse
import json
import sys
from pathlib import Path
from typing import Dict, Any

import torch
import torch.nn as nn
from torch.utils.data import DataLoader

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.models.unet import create_unet
from src.data.dataset import SegmentationDataset
from src.data.transforms import get_val_transforms
from src.evaluation.metrics import SegmentationMetricMeter


def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate trained U-Net model.")
    parser.add_argument("--weights", type=str, required=True, help="Path to checkpoint .pt file.")
    parser.add_argument("--image-dir", type=str, required=True, help="Path to evaluation images.")
    parser.add_argument("--mask-dir", type=str, required=True, help="Path to evaluation masks.")
    parser.add_argument("--image-size", type=int, nargs=2, default=[512, 512], help="Evaluation image size (H W).")
    parser.add_argument("--batch-size", type=int, default=4, help="Batch size for evaluation.")
    parser.add_argument("--threshold", type=float, default=0.5, help="Binary classification threshold.")
    parser.add_argument("--device", type=str, default="cuda:0", help="Evaluation device.")
    parser.add_argument("--output-json", type=str, default=None, help="Optional output JSON path for metric dumping.")
    return parser.parse_args()


@torch.no_grad()
def evaluate_unet(
    model: nn.Module,
    loader: DataLoader,
    device: torch.device,
    threshold: float = 0.5
) -> Dict[str, float]:
    model.eval()
    meter = SegmentationMetricMeter(threshold=threshold)

    for images, masks, _ in loader:
        images = images.to(device, non_blocking=True)
        masks = masks.to(device, non_blocking=True)

        with torch.amp.autocast(device_type="cuda" if "cuda" in device.type else "cpu"):
            logits = model(images)

        meter.update(logits, masks)

    return meter.compute()


def main():
    args = parse_args()
    weights_path = Path(args.weights)
    if not weights_path.exists():
        raise FileNotFoundError(f"Checkpoint file not found: {weights_path}")

    device = torch.device(args.device if torch.cuda.is_available() and "cuda" in args.device else "cpu")
    print(f"[INFO] Loading checkpoint from {weights_path} on device {device}...")

    checkpoint = torch.load(weights_path, map_location=device)
    config = checkpoint.get("config", {})
    model_cfg = config.get("model", {})

    model = create_unet(
        in_channels=model_cfg.get("in_channels", 3),
        out_channels=model_cfg.get("out_channels", 1),
        base_channels=model_cfg.get("base_channels", 32),
        bilinear=model_cfg.get("bilinear", False)
    ).to(device)

    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    val_ds = SegmentationDataset(
        image_dir=args.image_dir,
        mask_dir=args.mask_dir,
        transform=get_val_transforms(image_size=tuple(args.image_size))
    )
    val_loader = DataLoader(
        val_ds,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=2,
        pin_memory=("cuda" in device.type)
    )

    print(f"[INFO] Evaluating {len(val_ds)} samples with threshold={args.threshold}...")
    metrics = evaluate_unet(model, val_loader, device, threshold=args.threshold)

    print("\n" + "=" * 50)
    print("           U-NET EVALUATION RESULTS")
    print("=" * 50)
    print(f" Samples Evaluated : {len(val_ds)}")
    print(f" Mean IoU (Jaccard): {metrics['iou']:.4f}")
    print(f" Mean Dice (F1)    : {metrics['dice']:.4f}")
    print(f" Precision         : {metrics['precision']:.4f}")
    print(f" Recall            : {metrics['recall']:.4f}")
    print(f" Pixel Accuracy    : {metrics['accuracy']:.4f}")
    print("=" * 50 + "\n")

    if args.output_json:
        out_p = Path(args.output_json)
        out_p.parent.mkdir(parents=True, exist_ok=True)
        with open(out_p, "w") as f:
            json.dump({"metrics": metrics, "checkpoint": str(weights_path), "samples": len(val_ds)}, f, indent=2)
        print(f"[INFO] Results saved to {out_p}")


if __name__ == "__main__":
    main()