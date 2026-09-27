"""
Module: evaluate_yolo.py
Evaluates a trained YOLOv8n-Seg model on a dataset split (val or test).
Extracts and reports both bounding-box detection metrics and polygon mask instance segmentation metrics.

Usage:
    python src/training/evaluate_yolo.py --weights E:/GreenVision-Data/experiments/yolo_tree_seg/bamforests_baseline_exp01/weights/best.pt
"""
import os
import sys
import argparse
import logging
from typing import Dict, Any
from ultralytics import YOLO

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DEFAULT_DATASET_YAML = "E:/GreenVision-Data/processed/yolo_bamforests/dataset.yaml"


def evaluate_tree_model(
    weights_path: str,
    dataset_yaml: str = DEFAULT_DATASET_YAML,
    split: str = "test",
    imgsz: int = 512,
    device: str = "0"
) -> Dict[str, float]:
    """
    Runs evaluation on the specified dataset split and extracts quantitative performance metrics.
    
    Parameters:
        weights_path: Path to trained weights (e.g. best.pt).
        dataset_yaml: Path to dataset YAML configuration.
        split: 'val' or 'test'.
        imgsz: Image resolution in pixels.
        device: '0' for GPU or 'cpu'.
        
    Returns:
        Dictionary of detection and mask metrics.
    """
    if not os.path.exists(weights_path):
        raise FileNotFoundError(f"Weights file not found at: {weights_path}")
    if not os.path.exists(dataset_yaml):
        raise FileNotFoundError(f"Dataset YAML not found at: {dataset_yaml}")

    logger.info("=" * 60)
    logger.info(f"EVALUATING YOLOV8N-SEG ON '{split.upper()}' SPLIT")
    logger.info("=" * 60)
    logger.info(f"Model Weights: {weights_path}")
    logger.info(f"Dataset YAML:  {dataset_yaml}")
    logger.info(f"Split:         {split}")
    logger.info(f"Device:        {device}")
    logger.info("=" * 60)

    model = YOLO(weights_path)
    metrics = model.val(
        data=dataset_yaml,
        split=split,
        imgsz=imgsz,
        device=device,
        plots=True,
        verbose=True
    )

    # Extract metrics safely from Ultralytics results object
    # Box Detection Metrics
    box_map50 = float(metrics.box.map50)
    box_map50_95 = float(metrics.box.map)
    box_precision = float(metrics.box.mp)
    box_recall = float(metrics.box.mr)

    # Mask Segmentation Metrics
    mask_map50 = float(metrics.seg.map50) if hasattr(metrics, "seg") else 0.0
    mask_map50_95 = float(metrics.seg.map) if hasattr(metrics, "seg") else 0.0
    mask_precision = float(metrics.seg.mp) if hasattr(metrics, "seg") else 0.0
    mask_recall = float(metrics.seg.mr) if hasattr(metrics, "seg") else 0.0

    logger.info("=" * 60)
    logger.info("QUANTITATIVE EVALUATION SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Detection Box mAP@50:       {box_map50:.4f}")
    logger.info(f"Detection Box mAP@50-95:    {box_map50_95:.4f}")
    logger.info(f"Detection Precision:        {box_precision:.4f}")
    logger.info(f"Detection Recall:           {box_recall:.4f}")
    logger.info("-" * 60)
    logger.info(f"Instance Mask mAP@50:       {mask_map50:.4f}")
    logger.info(f"Instance Mask mAP@50-95:    {mask_map50_95:.4f}")
    logger.info(f"Instance Mask Precision:    {mask_precision:.4f}")
    logger.info(f"Instance Mask Recall:       {mask_recall:.4f}")
    logger.info("=" * 60)

    return {
        "box_map50": box_map50,
        "box_map50_95": box_map50_95,
        "box_precision": box_precision,
        "box_recall": box_recall,
        "mask_map50": mask_map50,
        "mask_map50_95": mask_map50_95,
        "mask_precision": mask_precision,
        "mask_recall": mask_recall
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate trained YOLOv8n-Seg model on test/val set.")
    parser.add_argument("--weights", type=str, required=True, help="Path to best.pt weights file.")
    parser.add_argument("--data", type=str, default=DEFAULT_DATASET_YAML, help="Path to dataset.yaml.")
    parser.add_argument("--split", type=str, default="test", choices=["val", "test"], help="Split to evaluate.")
    parser.add_argument("--imgsz", type=int, default=512, help="Evaluation resolution.")
    parser.add_argument("--device", type=str, default="0", help="GPU device ID (0) or 'cpu'.")
    args = parser.parse_args()

    evaluate_tree_model(
        weights_path=args.weights,
        dataset_yaml=args.data,
        split=args.split,
        imgsz=args.imgsz,
        device=args.device
    )
