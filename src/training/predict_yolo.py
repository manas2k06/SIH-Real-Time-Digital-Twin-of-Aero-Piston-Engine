"""
Module: predict_yolo.py
Inference runner for individual tree-crown instance segmentation using trained YOLOv8n-Seg.
Processes input aerial / drone imagery, extracts discrete tree instances, and exports annotated images.

Usage:
    python src/training/predict_yolo.py --source data/test_images/test_tree.jpg --weights C:/GreenVision-AI/models/yolo/yolov8n-seg.pt
"""
import os
import sys
import argparse
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import cv2
import numpy as np
from ultralytics import YOLO

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DEFAULT_WEIGHTS = r"C:\GreenVision-AI\models\yolo\yolov8n-seg.pt"


def predict_tree_instances(
    source_image: str,
    weights_path: str = DEFAULT_WEIGHTS,
    output_path: Optional[str] = None,
    conf_threshold: float = 0.25,
    imgsz: int = 512,
    device: str = "0"
) -> Dict[str, Any]:
    """
    Runs instance segmentation on an input image and extracts tree crown instances.
    
    Parameters:
        source_image: Path to input RGB image (.jpg, .png, .tif).
        weights_path: Path to trained weights file (.pt).
        output_path: Path to save annotated image (defaults to data/sample/predictions/<filename>).
        conf_threshold: Minimum confidence score threshold.
        imgsz: Inference patch resolution.
        device: '0' for GPU or 'cpu'.
        
    Returns:
        Dictionary containing instance count, bounding boxes, polygon vertices, and confidence scores.
    """
    if not os.path.exists(source_image):
        raise FileNotFoundError(f"Source image not found at: {source_image}")
    if not os.path.exists(weights_path):
        raise FileNotFoundError(f"Weights file not found at: {weights_path}")

    if output_path is None:
        out_dir = Path("data/sample/predictions")
        out_dir.mkdir(parents=True, exist_ok=True)
        output_path = str(out_dir / f"pred_{Path(source_image).name}")

    logger.info("=" * 60)
    logger.info("RUNNING YOLOV8N-SEG TREE INSTANCE SEGMENTATION INFERENCE")
    logger.info("=" * 60)
    logger.info(f"Source Image:   {source_image}")
    logger.info(f"Model Weights:  {weights_path}")
    logger.info(f"Confidence Thresh: {conf_threshold}")
    logger.info(f"Device:         {device}")
    logger.info("=" * 60)

    model = YOLO(weights_path)
    results = model.predict(
        source=source_image,
        conf=conf_threshold,
        imgsz=imgsz,
        device=device,
        save=False,
        verbose=False
    )

    result = results[0]
    num_trees = len(result.boxes) if result.boxes is not None else 0
    
    # Extract bounding boxes, masks, and confidence scores
    boxes_list = []
    scores_list = []
    polygons_list = []

    if num_trees > 0:
        for idx in range(num_trees):
            box = result.boxes.xyxy[idx].cpu().numpy().tolist()
            score = float(result.boxes.conf[idx].cpu().numpy())
            boxes_list.append(box)
            scores_list.append(score)
            
            if result.masks is not None and len(result.masks.xy) > idx:
                poly = result.masks.xy[idx].tolist()
                polygons_list.append(poly)
            else:
                polygons_list.append([])

    # Render annotated image
    annotated_bgr = result.plot()
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(output_path, annotated_bgr)

    mean_conf = float(np.mean(scores_list)) if scores_list else 0.0
    logger.info(f"Detected Individual Trees: {num_trees}")
    logger.info(f"Mean Confidence Score:     {mean_conf:.3f}")
    logger.info(f"Annotated Image Saved:     {output_path}")
    logger.info("=" * 60)

    return {
        "source_image": source_image,
        "tree_count": num_trees,
        "mean_confidence": mean_conf,
        "boxes": boxes_list,
        "scores": scores_list,
        "polygons": polygons_list,
        "output_path": output_path
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run YOLOv8n-Seg tree crown instance segmentation.")
    parser.add_argument("--source", type=str, required=True, help="Path to input image.")
    parser.add_argument("--weights", type=str, default=DEFAULT_WEIGHTS, help="Path to weights (.pt).")
    parser.add_argument("--output", type=str, default=None, help="Output annotated image path.")
    parser.add_argument("--conf", type=float, default=0.25, help="Confidence threshold (default: 0.25).")
    parser.add_argument("--imgsz", type=int, default=512, help="Inference resolution.")
    parser.add_argument("--device", type=str, default="0", help="Device ID (default: 0).")
    args = parser.parse_args()

    predict_tree_instances(
        source_image=args.source,
        weights_path=args.weights,
        output_path=args.output,
        conf_threshold=args.conf,
        imgsz=args.imgsz,
        device=args.device
    )
