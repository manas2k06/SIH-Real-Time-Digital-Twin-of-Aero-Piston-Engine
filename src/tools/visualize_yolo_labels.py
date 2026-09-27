"""
Tool: visualize_yolo_labels.py
Inspects and visualizes converted YOLOv8-Seg polygon instance labels overlaid on RGB imagery.
Verifies polygon alignment, vertex order, and label integrity prior to model training.
"""
import os
import sys
import argparse
from pathlib import Path
from typing import List, Tuple
import numpy as np
import cv2


def load_yolo_seg_label(label_path: str, img_width: int, img_height: int) -> List[Tuple[int, np.ndarray]]:
    """
    Parses a YOLOv8-Seg label file into a list of (class_id, polygon_pixel_pts).
    Format: class_id x1_norm y1_norm x2_norm y2_norm ...
    """
    instances = []
    if not os.path.exists(label_path):
        return instances
        
    with open(label_path, "r") as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
        
    for line in lines:
        parts = line.split()
        if len(parts) < 7: # class_id + at least 3 (x, y) pairs
            continue
            
        class_id = int(parts[0])
        coords = [float(p) for p in parts[1:]]
        
        pts = []
        for i in range(0, len(coords), 2):
            px = int(np.clip(coords[i] * img_width, 0, img_width - 1))
            py = int(np.clip(coords[i+1] * img_height, 0, img_height - 1))
            pts.append([px, py])
            
        instances.append((class_id, np.array(pts, dtype=np.int32)))
        
    return instances


def draw_yolo_overlays(
    image: np.ndarray,
    instances: List[Tuple[int, np.ndarray]],
    class_names: dict = None,
    alpha: float = 0.35
) -> np.ndarray:
    """
    Draws semi-transparent polygon fills and crisp boundaries for each tree crown instance.
    """
    if class_names is None:
        class_names = {0: "tree_crown"}
        
    vis = image.copy()
    overlay = image.copy()
    
    # Palette of distinct colors for instances
    colors = [
        (0, 255, 255), (0, 255, 0), (255, 128, 0), (0, 165, 255),
        (255, 0, 255), (255, 255, 0), (128, 255, 0), (0, 200, 255)
    ]
    
    for idx, (class_id, pts) in enumerate(instances):
        color = colors[idx % len(colors)]
        
        # Draw filled polygon on overlay
        cv2.fillPoly(overlay, [pts], color)
        # Draw crisp outline on base
        cv2.polylines(vis, [pts], isClosed=True, color=color, thickness=2)
        
        # Label centroid
        M = cv2.moments(pts)
        if M["m00"] != 0:
            cx = int(M["m10"] / M["m00"])
            cy = int(M["m01"] / M["m00"])
            name = class_names.get(class_id, f"cls_{class_id}")
            label_txt = f"#{idx+1} {name}"
            cv2.putText(vis, label_txt, (cx - 15, cy), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 2)
            cv2.putText(vis, label_txt, (cx - 15, cy), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 0), 1)
            
    # Blend overlay with alpha transparency
    cv2.addWeighted(overlay, alpha, vis, 1 - alpha, 0, vis)
    return vis


def visualize_single_sample(image_path: str, label_path: str, output_path: str):
    """Visualizes a single image-label pair and saves output image."""
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Could not load image at {image_path}")
        
    h, w = img.shape[:2]
    instances = load_yolo_seg_label(label_path, w, h)
    vis = draw_yolo_overlays(img, instances)
    
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(output_path, vis)
    print(f"Visual inspection artifact generated: {output_path} ({len(instances)} instances)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Visualize YOLOv8-Seg polygon annotations on imagery.")
    parser.add_argument("--image", type=str, required=True, help="Path to RGB image file.")
    parser.add_argument("--label", type=str, required=True, help="Path to YOLO .txt label file.")
    parser.add_argument("--output", type=str, required=True, help="Path to save visualization image.")
    args = parser.parse_args()
    
    visualize_single_sample(args.image, args.label, args.output)
