"""
Module: train_yolo.py
Ultralytics YOLOv8n-Seg training and continuation script for tree crown instance segmentation.
Configured with verified guardrails for NVIDIA GeForce RTX 3050 (4 GB VRAM) on Windows.

Features:
- Supports starting fresh from pretrained weights (yolov8n-seg.pt).
- Supports resuming / continuing from an explicit checkpoint (--resume-from <path>).
- Strict enforcement of cache=False (prevents 22+ GB .npy disk cache creation).
- Dry-run verification mode (--dry-run) to inspect configuration without launching training.
"""
import os
import sys
import argparse
import logging
from pathlib import Path
from typing import Optional, Dict, Any
import torch
from ultralytics import YOLO

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Default verified paths
DEFAULT_PRETRAINED_WEIGHTS = r"C:\GreenVision-AI\models\yolo\yolov8n-seg.pt"
DEFAULT_DATASET_YAML = r"C:\GreenVision-AI\data\processed\yolo_bamforests\dataset.yaml"
DEFAULT_PROJECT_DIR = r"C:\GreenVision-AI\runs\yolo_tree_seg"
DEFAULT_EXP_NAME = "bamforests_baseline_exp016"


def verify_and_print_config(
    model_weights: str,
    dataset_yaml: str,
    epochs: int,
    imgsz: int,
    batch: int,
    workers: int,
    device: str,
    amp: bool,
    cache: bool,
    lr0: float,
    project: str,
    name: str,
    resume_mode: bool,
    exist_ok: bool
) -> Dict[str, Any]:
    """
    Validates all prerequisite files and prints a comprehensive configuration table.
    """
    print("\n" + "=" * 70)
    print("GREENVISION-AI: YOLOV8N-SEG TRAINING CONFIGURATION VERIFICATION")
    print("=" * 70)

    # 1. Check Model Weights / Checkpoint
    if not os.path.exists(model_weights):
        raise FileNotFoundError(f"Model weights/checkpoint not found at: '{model_weights}'")
    
    weights_size_mb = os.path.getsize(model_weights) / (1024 * 1024)
    print(f"  Model Weights / Checkpoint: {model_weights}")
    print(f"  Weights File Size:          {weights_size_mb:.2f} MB")
    
    # Inspect checkpoint metadata safely
    try:
        ckpt_meta = torch.load(model_weights, map_location="cpu")
        stored_epoch = ckpt_meta.get("epoch", "N/A")
        has_opt = ckpt_meta.get("optimizer") is not None
        has_ema = ckpt_meta.get("ema") is not None
        print(f"  Stored Checkpoint Epoch:    {stored_epoch} (has_optimizer={has_opt}, has_ema={has_ema})")
    except Exception as e:
        print(f"  Checkpoint metadata notice: {e}")

    # 2. Check Dataset YAML
    if not os.path.exists(dataset_yaml):
        raise FileNotFoundError(f"Dataset YAML not found at: '{dataset_yaml}'")
    print(f"  Dataset Configuration YAML: {dataset_yaml} -> OK")

    # 3. Check GPU / Hardware Settings
    cuda_avail = torch.cuda.is_available()
    gpu_name = torch.cuda.get_device_name(0) if cuda_avail else "CPU"
    print(f"  Compute Device:             device='{device}' ({gpu_name})")
    print(f"  Automatic Mixed Precision:  amp={amp} (FP16)")
    print(f"  DataLoader Subprocesses:    workers={workers} (Windows-safe)")
    print(f"  Image Resolution (imgsz):   {imgsz}x{imgsz}")
    print(f"  Batch Size (batch):         {batch} (RTX 3050 4GB tuned)")
    
    # 4. Strict Cache Verification
    print(f"  Dataset RAM/Disk Caching:   cache={cache} (STRICT: Disk caching disabled)")
    if cache is not False:
        raise ValueError("CRITICAL: 'cache' must be False to prevent .npy disk cache creation!")

    # 5. Training Schedule & Output Directory
    print(f"  Target Epochs:              epochs={epochs}")
    print(f"  Learning Rate (lr0):        {lr0}")
    print(f"  Output Project Directory:   {project}")
    print(f"  Experiment Run Name:        {name} (exist_ok={exist_ok})")
    print(f"  Resume Mode:                resume={resume_mode}")
    print("=" * 70 + "\n")

    return {
        "model_weights": model_weights,
        "dataset_yaml": dataset_yaml,
        "epochs": epochs,
        "imgsz": imgsz,
        "batch": batch,
        "workers": workers,
        "device": device,
        "amp": amp,
        "cache": cache,
        "project": project,
        "name": name,
        "exist_ok": exist_ok
    }


def train_tree_segmentation(
    model_weights: str = DEFAULT_PRETRAINED_WEIGHTS,
    dataset_yaml: str = DEFAULT_DATASET_YAML,
    epochs: int = 40,
    imgsz: int = 512,
    batch: int = 8,
    workers: int = 2,
    device: str = "0",
    lr0: float = 0.002,
    project: str = DEFAULT_PROJECT_DIR,
    name: str = DEFAULT_EXP_NAME,
    amp: bool = True,
    resume: bool = False,
    exist_ok: bool = True,
    patience: int = 15,
    dry_run: bool = False
) -> Optional[YOLO]:
    """
    Executes or verifies YOLOv8n-Seg instance segmentation training.
    """
    # 1. Validate configuration
    config = verify_and_print_config(
        model_weights=model_weights,
        dataset_yaml=dataset_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        workers=workers,
        device=device,
        amp=amp,
        cache=False,  # strictly enforce False
        lr0=lr0,
        project=project,
        name=name,
        resume_mode=resume,
        exist_ok=exist_ok
    )

    if dry_run:
        logger.info("[DRY-RUN] Configuration successfully verified. Training was NOT launched.")
        return None

    # 2. Load model
    logger.info(f"Loading weights from: {model_weights}")
    model = YOLO(model_weights)

    # 3. Launch training
    logger.info("Launching YOLO training run...")
    results = model.train(
        data=dataset_yaml,
        epochs=epochs,
        patience=patience,
        batch=batch,
        imgsz=imgsz,
        device=device,
        workers=workers,
        project=project,
        name=name,
        exist_ok=exist_ok,
        amp=amp,
        cache=False,             # Strictly False
        lr0=lr0,
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3.0,
        save=True,
        save_period=5,
        plots=True,
        verbose=True,
        resume=resume,
        # Nadir aerial augmentations
        degrees=180.0,
        flipud=0.5,
        fliplr=0.5,
        mosaic=1.0,
        mixup=0.1
    )

    logger.info("Training completed successfully.")
    return model


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Train or continue YOLOv8n-Seg on BAMFORESTS tree crown instance segmentation."
    )
    # Weights / Checkpoint selection
    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        "--resume-from", type=str, default=None,
        help="Path to an explicit checkpoint to resume/continue training from (e.g., exp016/weights/last.pt)."
    )
    group.add_argument(
        "--weights", type=str, default=None,
        help=f"Path to starting pretrained weights (default: {DEFAULT_PRETRAINED_WEIGHTS})."
    )

    # Training parameters
    parser.add_argument(
        "--data", type=str, default=DEFAULT_DATASET_YAML,
        help=f"Path to dataset.yaml (default: {DEFAULT_DATASET_YAML})."
    )
    parser.add_argument("--epochs", type=int, default=40, help="Target total epochs (default: 40).")
    parser.add_argument("--imgsz", type=int, default=512, help="Image resolution in pixels (default: 512).")
    parser.add_argument("--batch", type=int, default=8, help="Batch size (default: 8).")
    parser.add_argument("--workers", type=int, default=2, help="DataLoader subprocess workers (default: 2).")
    parser.add_argument("--device", type=str, default="0", help="GPU device ID (default: 0).")
    parser.add_argument("--lr0", type=float, default=0.002, help="Learning rate (default: 0.002).")
    parser.add_argument(
        "--project", type=str, default=DEFAULT_PROJECT_DIR,
        help=f"Output experiment directory (default: {DEFAULT_PROJECT_DIR})."
    )
    parser.add_argument(
        "--name", type=str, default=DEFAULT_EXP_NAME,
        help=f"Run name (default: {DEFAULT_EXP_NAME})."
    )
    parser.add_argument(
        "--exist-ok", action="store_true", default=True,
        help="Allow existing project/name directory to be updated (default: True)."
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Validate and print configuration without starting training."
    )

    args = parser.parse_args()

    # Determine active weights path
    if args.resume_from:
        active_weights = args.resume_from
    elif args.weights:
        active_weights = args.weights
    else:
        active_weights = DEFAULT_PRETRAINED_WEIGHTS

    train_tree_segmentation(
        model_weights=active_weights,
        dataset_yaml=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        workers=args.workers,
        device=args.device,
        lr0=args.lr0,
        project=args.project,
        name=args.name,
        exist_ok=args.exist_ok,
        dry_run=args.dry_run
    )
