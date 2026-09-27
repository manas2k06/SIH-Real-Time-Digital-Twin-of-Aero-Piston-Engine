"""
Module: bamforests_to_yolo.py
Converts BAMFORESTS COCO polygon annotations to Ultralytics YOLOv8-Seg format.
Supports both:
1. Full official BAMFORESTS structure (annotations/ with instances_tree_train2023.json,
   instances_tree_eval2023.json, instances_tree_TestSet12023.json, instances_tree_TestSet22023.json,
   and train2023/, val2023/, test2023/).
2. Single COCO JSON + images directory with automatic geographic plot partitioning.

Validates coordinate bounds, non-degeneracy, and image-annotation correspondence.
"""
import os
import json
import logging
import argparse
import shutil
from pathlib import Path
from typing import Dict, List, Any, Tuple, Optional, Set
import numpy as np
import cv2
import yaml

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def validate_and_normalize_polygon(
    polygon: List[float], 
    img_width: int, 
    img_height: int,
    min_vertices: int = 3
) -> Optional[List[float]]:
    """
    Validates a flat COCO polygon [x1, y1, x2, y2, ...] and converts to normalized [0.0, 1.0].
    
    Checks:
    1. Minimum vertex count (at least min_vertices pairs).
    2. Even number of coordinates.
    3. Non-zero area and valid planar geometry.
    4. Strict clamping within [0.0, 1.0].
    """
    if len(polygon) < min_vertices * 2 or len(polygon) % 2 != 0:
        logger.warning(f"Polygon has invalid coordinate count: {len(polygon)}")
        return None
        
    pts = np.array(polygon, dtype=np.float32).reshape(-1, 2)
    
    # Check for degenerate polygon (zero area)
    area = cv2.contourArea(pts.astype(np.int32))
    if area < 1.0:
        logger.warning(f"Degenerate polygon with area {area} < 1.0 px; skipping.")
        return None
        
    # Normalize coordinates
    normalized = []
    for pt in pts:
        norm_x = float(np.clip(pt[0] / img_width, 0.0, 1.0))
        norm_y = float(np.clip(pt[1] / img_height, 0.0, 1.0))
        normalized.extend([norm_x, norm_y])
        
    return normalized


def extract_plot_id(file_name: str) -> str:
    """
    Extracts geographic flight plot / compartment identifier from file name.
    Example: 'Stadtwald_115_0.tif' -> 'Stadtwald_115'
             'Hain_117_0.tif' -> 'Hain_117'
             'Tretzendorf_369_1931.tif' -> 'Tretzendorf_369'
    """
    stem = Path(file_name).stem
    parts = stem.split("_")
    if len(parts) >= 2:
        return f"{parts[0]}_{parts[1]}"
    return parts[0]


def process_single_coco_split(
    coco_json_path: str,
    images_source_dir: str,
    output_images_dir: str,
    output_labels_dir: str,
    target_class_id: int = 0,
    copy_images: bool = True
) -> Dict[str, Any]:
    """
    Processes one COCO JSON file and corresponding image directory into YOLOv8-Seg format.
    """
    if not os.path.exists(coco_json_path):
        raise FileNotFoundError(f"COCO annotation file not found: {coco_json_path}")
    if not os.path.exists(images_source_dir):
        raise FileNotFoundError(f"Source images directory not found: {images_source_dir}")

    os.makedirs(output_images_dir, exist_ok=True)
    os.makedirs(output_labels_dir, exist_ok=True)

    with open(coco_json_path, "r") as f:
        coco = json.load(f)

    images = coco.get("images", [])
    annotations = coco.get("annotations", [])

    # Index annotations by image_id
    img_id_to_anns: Dict[int, List[Dict[str, Any]]] = {}
    for ann in annotations:
        img_id_to_anns.setdefault(ann["image_id"], []).append(ann)

    # Set of files actually present on disk
    disk_files = set(os.listdir(images_source_dir))

    stats = {
        "json_images": len(images),
        "disk_images_found": 0,
        "missing_disk_images": 0,
        "instances_processed": 0,
        "rejected_degenerate_polygons": 0,
        "plots": {}
    }

    for img_info in images:
        img_id = img_info["id"]
        file_name = img_info["file_name"]
        
        # Verify image exists on disk
        if file_name not in disk_files:
            stats["missing_disk_images"] += 1
            continue

        stats["disk_images_found"] += 1
        plot_id = extract_plot_id(file_name)
        stats["plots"][plot_id] = stats["plots"].get(plot_id, 0) + 1

        img_w = img_info["width"]
        img_h = img_info["height"]

        # Extract and convert all polygon annotations for this image
        anns = img_id_to_anns.get(img_id, [])
        label_lines = []

        for ann in anns:
            seg = ann.get("segmentation", [])
            if not seg or not isinstance(seg, list):
                continue

            # Support both single polygon [[x1, y1, ...]] and multi-polygon lists
            for poly in seg:
                if not isinstance(poly, list) or len(poly) < 6:
                    continue
                normalized = validate_and_normalize_polygon(poly, img_w, img_h)
                if normalized is None:
                    stats["rejected_degenerate_polygons"] += 1
                    continue

                coords_str = " ".join([f"{v:.6f}" for v in normalized])
                label_lines.append(f"{target_class_id} {coords_str}")
                stats["instances_processed"] += 1

        # Write YOLO label .txt file
        label_stem = Path(file_name).stem
        label_file = Path(output_labels_dir) / f"{label_stem}.txt"
        with open(label_file, "w") as lf:
            lf.write("\n".join(label_lines) + "\n" if label_lines else "")

        # Copy and verify source image
        if copy_images:
            src_img = Path(images_source_dir) / file_name
            dst_img = Path(output_images_dir) / file_name
            if not dst_img.exists():
                shutil.copy2(src_img, dst_img)
                # Verify OpenCV readability; auto-repair if truncated/corrupted TIFF
                test_read = cv2.imread(str(dst_img))
                if test_read is None:
                    try:
                        from PIL import Image, ImageFile
                        ImageFile.LOAD_TRUNCATED_IMAGES = True
                        with Image.open(src_img) as pimg:
                            rgb_img = pimg.convert("RGB")
                            rgb_img.save(str(dst_img), format="TIFF")
                        logger.info(f"Auto-repaired corrupted TIFF on copy: {file_name}")
                    except Exception as err:
                        logger.warning(f"Failed to auto-repair image {file_name}: {err}")

    return stats


def convert_bamforests_official_dataset(
    bamforests_root_dir: str,
    output_dataset_dir: str,
    target_class_id: int = 0,
    copy_images: bool = True,
    generate_yaml: bool = True
) -> Dict[str, Any]:
    """
    Converts the official BAMFORESTS dataset directory structure:
      bamforests_root_dir/
        ├── annotations/
        │   ├── instances_tree_train2023.json
        │   ├── instances_tree_eval2023.json
        │   ├── instances_tree_TestSet12023.json
        │   └── instances_tree_TestSet22023.json
        ├── train2023/
        ├── val2023/
        └── test2023/
            ├── Test-Set-1/
            └── Test-Set-2/
            
    Into standard Ultralytics YOLOv8-Seg directory structure:
      output_dataset_dir/
        ├── dataset.yaml
        ├── stats.json
        ├── images/ (train/, val/, test/)
        └── labels/ (train/, val/, test/)
    """
    root = Path(bamforests_root_dir)
    out_path = Path(output_dataset_dir)
    
    ann_dir = root / "annotations"
    if not ann_dir.exists():
        raise FileNotFoundError(f"Annotations directory not found in: {root}")

    # Map BAMFORESTS splits to source annotations and image folders
    split_configs = [
        {
            "split_name": "train",
            "json": ann_dir / "instances_tree_train2023.json",
            "images_dir": root / "train2023"
        },
        {
            "split_name": "val",
            "json": ann_dir / "instances_tree_eval2023.json",
            "images_dir": root / "val2023"
        },
        {
            "split_name": "test",
            "json": ann_dir / "instances_tree_TestSet12023.json",
            "images_dir": root / "test2023" / "Test-Set-1"
        },
        {
            "split_name": "test",
            "json": ann_dir / "instances_tree_TestSet22023.json",
            "images_dir": root / "test2023" / "Test-Set-2"
        }
    ]

    total_stats = {
        "dataset_type": "BAMFORESTS_Official_COCO1024",
        "splits": {},
        "total_images": 0,
        "total_instances": 0,
        "total_rejected_polygons": 0
    }

    logger.info(f"Converting BAMFORESTS dataset from: {root}")
    logger.info(f"Target YOLO directory: {out_path}")

    for cfg in split_configs:
        split_name = cfg["split_name"]
        json_file = cfg["json"]
        img_dir = cfg["images_dir"]

        logger.info(f"Processing split '{split_name}' from {json_file.name}...")
        
        out_img_dir = out_path / "images" / split_name
        out_lbl_dir = out_path / "labels" / split_name

        split_stat = process_single_coco_split(
            coco_json_path=str(json_file),
            images_source_dir=str(img_dir),
            output_images_dir=str(out_img_dir),
            output_labels_dir=str(out_lbl_dir),
            target_class_id=target_class_id,
            copy_images=copy_images
        )

        if split_name not in total_stats["splits"]:
            total_stats["splits"][split_name] = {
                "images": 0,
                "instances": 0,
                "missing_disk_images": 0,
                "rejected_polygons": 0,
                "plots": {}
            }

        s_entry = total_stats["splits"][split_name]
        s_entry["images"] += split_stat["disk_images_found"]
        s_entry["instances"] += split_stat["instances_processed"]
        s_entry["missing_disk_images"] += split_stat["missing_disk_images"]
        s_entry["rejected_polygons"] += split_stat["rejected_degenerate_polygons"]
        for p, count in split_stat["plots"].items():
            s_entry["plots"][p] = s_entry["plots"].get(p, 0) + count

        total_stats["total_images"] += split_stat["disk_images_found"]
        total_stats["total_instances"] += split_stat["instances_processed"]
        total_stats["total_rejected_polygons"] += split_stat["rejected_degenerate_polygons"]

    # Generate dataset.yaml
    if generate_yaml:
        yaml_content = {
            "path": str(out_path.resolve()).replace("\\", "/"),
            "train": "images/train",
            "val": "images/val",
            "test": "images/test",
            "names": {
                target_class_id: "tree_crown"
            }
        }
        yaml_path = out_path / "dataset.yaml"
        with open(yaml_path, "w") as yf:
            yaml.dump(yaml_content, yf, default_flow_style=False, sort_keys=False)
        logger.info(f"Generated dataset.yaml at: {yaml_path}")

    # Write stats.json
    stats_path = out_path / "stats.json"
    with open(stats_path, "w") as sf:
        json.dump(total_stats, sf, indent=2)
    logger.info(f"Exported statistics to: {stats_path}")

    logger.info("=" * 60)
    logger.info("BAMFORESTS CONVERSION COMPLETED SUCCESSFULLY")
    logger.info(f"Total Images:    {total_stats['total_images']}")
    logger.info(f"Total Instances: {total_stats['total_instances']}")
    logger.info(f"Train Images:    {total_stats['splits'].get('train', {}).get('images', 0)}")
    logger.info(f"Val Images:      {total_stats['splits'].get('val', {}).get('images', 0)}")
    logger.info(f"Test Images:     {total_stats['splits'].get('test', {}).get('images', 0)}")
    logger.info("=" * 60)

    return total_stats


# Maintain backward-compatible function for single-file conversions / unit tests
def partition_by_geographic_plots(
    images: List[Dict[str, Any]],
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    random_seed: int = 42
) -> Dict[str, str]:
    """Partitions a single COCO image list by geographic plot ID."""
    np.random.seed(random_seed)
    plot_to_images: Dict[str, List[int]] = {}
    for img in images:
        plot_id = extract_plot_id(img["file_name"])
        plot_to_images.setdefault(plot_id, []).append(img["id"])
        
    plots = sorted(list(plot_to_images.keys()))
    np.random.shuffle(plots)
    
    total_images = len(images)
    train_target = int(total_images * train_ratio)
    val_target = int(total_images * val_ratio)
    
    img_to_split: Dict[str, str] = {}
    current_train_count = 0
    current_val_count = 0
    
    for plot in plots:
        plot_imgs = plot_to_images[plot]
        count = len(plot_imgs)
        
        if current_train_count < train_target or len(img_to_split) == 0:
            target_split = "train"
            current_train_count += count
        elif current_val_count < val_target:
            target_split = "val"
            current_val_count += count
        else:
            target_split = "test"
            
        for img_id in plot_imgs:
            img_to_split[str(img_id)] = target_split
            
    return img_to_split


def convert_bamforests_coco_to_yolo(
    coco_json_path: str,
    images_source_dir: str,
    output_dataset_dir: str,
    target_class_id: int = 0,
    generate_yaml: bool = True
) -> Dict[str, Any]:
    """Converts a single COCO JSON + images directory with automatic geographic plot partition."""
    with open(coco_json_path, "r") as f:
        coco = json.load(f)
        
    images = coco["images"]
    annotations = coco["annotations"]
    
    img_id_to_anns: Dict[int, List[Dict[str, Any]]] = {}
    for ann in annotations:
        img_id_to_anns.setdefault(ann["image_id"], []).append(ann)
        
    img_to_split = partition_by_geographic_plots(images)
    
    out_path = Path(output_dataset_dir)
    splits = ["train", "val", "test"]
    for s in splits:
        (out_path / "images" / s).mkdir(parents=True, exist_ok=True)
        (out_path / "labels" / s).mkdir(parents=True, exist_ok=True)
        
    stats = {
        "total_images": len(images),
        "total_instances": len(annotations),
        "split_counts": {"train": 0, "val": 0, "test": 0},
        "instances_per_split": {"train": 0, "val": 0, "test": 0},
        "rejected_degenerate_polygons": 0,
        "plots_allocated": {}
    }
    
    for img in images:
        img_id = img["id"]
        file_name = img["file_name"]
        split = img_to_split[str(img_id)]
        plot_id = extract_plot_id(file_name)
        
        stats["plots_allocated"].setdefault(plot_id, split)
        stats["split_counts"][split] += 1
        
        img_w = img["width"]
        img_h = img["height"]
        
        anns = img_id_to_anns.get(img_id, [])
        label_lines = []
        
        for ann in anns:
            seg = ann.get("segmentation", [])
            if not seg or not isinstance(seg, list):
                continue
                
            for poly in seg:
                if not isinstance(poly, list) or len(poly) < 6:
                    continue
                normalized = validate_and_normalize_polygon(poly, img_w, img_h)
                if normalized is None:
                    stats["rejected_degenerate_polygons"] += 1
                    continue
                    
                coords_str = " ".join([f"{v:.6f}" for v in normalized])
                label_lines.append(f"{target_class_id} {coords_str}")
                stats["instances_per_split"][split] += 1
            
        label_stem = Path(file_name).stem
        label_file = out_path / "labels" / split / f"{label_stem}.txt"
        with open(label_file, "w") as lf:
            lf.write("\n".join(label_lines) + "\n" if label_lines else "")
            
        src_img_file = Path(images_source_dir) / file_name
        dest_img_file = out_path / "images" / split / file_name
        if src_img_file.exists() and not dest_img_file.exists():
            shutil.copy2(src_img_file, dest_img_file)
            
    if generate_yaml:
        yaml_content = {
            "path": str(out_path.resolve()).replace("\\", "/"),
            "train": "images/train",
            "val": "images/val",
            "test": "images/test",
            "names": {
                target_class_id: "tree_crown"
            }
        }
        yaml_path = out_path / "dataset.yaml"
        with open(yaml_path, "w") as yf:
            yaml.dump(yaml_content, yf, default_flow_style=False, sort_keys=False)
            
    with open(out_path / "stats.json", "w") as sf:
        json.dump(stats, sf, indent=2)
        
    logger.info(f"Conversion completed: {stats['total_instances']} instances processed across {stats['total_images']} images.")
    return stats


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Convert BAMFORESTS COCO dataset to Ultralytics YOLOv8-Seg format."
    )
    # Mode 1: Full BAMFORESTS official structure
    parser.add_argument(
        "--dataset_dir", "--dataset_root", type=str, default=None,
        help="Path to root BAMFORESTS directory containing annotations/ and train2023/, val2023/, test2023/."
    )
    # Mode 2: Single COCO JSON file + image directory
    parser.add_argument(
        "--coco_json", type=str, default=None,
        help="Path to a single COCO JSON file (for custom / single-split conversion)."
    )
    parser.add_argument(
        "--images_dir", type=str, default=None,
        help="Directory containing source images (used with --coco_json)."
    )
    # Common arguments
    parser.add_argument(
        "--output_dir", type=str, required=True,
        help="Target output directory for the converted YOLOv8-Seg dataset."
    )
    parser.add_argument(
        "--class_id", type=int, default=0,
        help="Target YOLO class ID for tree crowns (default: 0)."
    )
    parser.add_argument(
        "--no_copy", action="store_true",
        help="Skip copying images (generates label files only)."
    )
    args = parser.parse_args()

    if args.dataset_dir:
        convert_bamforests_official_dataset(
            bamforests_root_dir=args.dataset_dir,
            output_dataset_dir=args.output_dir,
            target_class_id=args.class_id,
            copy_images=not args.no_copy
        )
    elif args.coco_json and args.images_dir:
        convert_bamforests_coco_to_yolo(
            coco_json_path=args.coco_json,
            images_source_dir=args.images_dir,
            output_dataset_dir=args.output_dir,
            target_class_id=args.class_id
        )
    else:
        parser.error("Either --dataset_dir (for official BAMFORESTS) or both --coco_json and --images_dir must be provided.")
