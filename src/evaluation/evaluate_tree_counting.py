"""
Module: evaluate_tree_counting.py
Tree-counting baseline evaluation script for GreenVision-AI.
Evaluates tree crown count accuracy of trained YOLOv8n-Seg across the held-out test split.

Calculates:
- Per-image ground truth count, predicted count, signed error, and absolute error.
- Dataset-level MAE, RMSE, Bias, Exact Match %, ±1 tree %, ±2 trees %, MAPE (GT>0), sMAPE.
- Pearson correlation coefficient (r) and Coefficient of determination (R²).
- Domain-specific breakdown (Hain Urban Park vs Forestry Stands).
- Exports results to CSV, JSON, and visual regression scatter plot.
"""
import os
import sys
import json
import csv
import argparse
import logging
from pathlib import Path
from typing import Dict, List, Any, Tuple
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from ultralytics import YOLO

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Default verified paths
DEFAULT_WEIGHTS = r"C:\GreenVision-AI\runs\yolo_tree_seg\bamforests_baseline_100ep\weights\best.pt"
DEFAULT_TEST_IMAGES_DIR = r"C:\GreenVision-AI\data\processed\yolo_bamforests\images\test"
DEFAULT_TEST_LABELS_DIR = r"C:\GreenVision-AI\data\processed\yolo_bamforests\labels\test"
DEFAULT_OUTPUT_DIR = r"C:\GreenVision-AI\runs\yolo_tree_seg\bamforests_baseline_100ep\counting_evaluation"


def extract_plot_id(filename: str) -> str:
    """Extracts geographic plot prefix from filename (e.g. 'Hain', 'Stadtwald', 'Tretzendorf')."""
    return filename.split("_")[0]


def calculate_counting_metrics(
    gt_counts: np.ndarray,
    pred_counts: np.ndarray
) -> Dict[str, Any]:
    """
    Computes comprehensive dataset-level tree counting metrics.
    """
    n = len(gt_counts)
    if n == 0:
        return {}

    signed_errors = pred_counts - gt_counts
    abs_errors = np.abs(signed_errors)

    mae = float(np.mean(abs_errors))
    rmse = float(np.sqrt(np.mean(signed_errors ** 2)))
    bias = float(np.mean(signed_errors))
    
    exact_match_pct = float(np.sum(abs_errors == 0) / n * 100.0)
    within_1_pct = float(np.sum(abs_errors <= 1) / n * 100.0)
    within_2_pct = float(np.sum(abs_errors <= 2) / n * 100.0)

    # Safe MAPE on GT > 0
    gt_nonzero_mask = gt_counts > 0
    if np.any(gt_nonzero_mask):
        mape_nonzero = float(np.mean(abs_errors[gt_nonzero_mask] / gt_counts[gt_nonzero_mask]) * 100.0)
    else:
        mape_nonzero = 0.0

    # Symmetric MAPE across all images (Explicit handling: GT=0 and Pred=0 -> 0% error)
    denom = gt_counts.astype(np.float64) + pred_counts.astype(np.float64)
    smape_elements = np.zeros_like(denom)
    nonzero_mask = denom > 0
    smape_elements[nonzero_mask] = (2.0 * abs_errors[nonzero_mask] / denom[nonzero_mask]) * 100.0
    smape = float(np.mean(smape_elements))

    # Pearson Correlation (r)
    if np.std(gt_counts) > 1e-6 and np.std(pred_counts) > 1e-6:
        r = float(np.corrcoef(gt_counts, pred_counts)[0, 1])
    else:
        r = 0.0

    # Coefficient of Determination (R²)
    ss_tot = np.sum((gt_counts - np.mean(gt_counts)) ** 2)
    ss_res = np.sum((gt_counts - pred_counts) ** 2)
    r2 = float(1.0 - (ss_res / ss_tot)) if ss_tot > 1e-6 else 0.0

    return {
        "total_images": int(n),
        "total_ground_truth_trees": int(np.sum(gt_counts)),
        "total_predicted_trees": int(np.sum(pred_counts)),
        "mean_ground_truth_per_tile": float(np.mean(gt_counts)),
        "mean_predicted_per_tile": float(np.mean(pred_counts)),
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "bias": round(bias, 4),
        "exact_match_percentage": round(exact_match_pct, 2),
        "within_1_tree_percentage": round(within_1_pct, 2),
        "within_2_trees_percentage": round(within_2_pct, 2),
        "mape_nonzero_gt_percentage": round(mape_nonzero, 2),
        "smape_percentage": round(smape, 2),
        "pearson_correlation_r": round(r, 4),
        "r_squared": round(r2, 4)
    }


def plot_counting_regression(
    gt_counts: np.ndarray,
    pred_counts: np.ndarray,
    metrics: Dict[str, Any],
    output_path: str
):
    """Generates a high-quality scatter plot of Ground Truth vs Predicted tree counts."""
    fig, ax = plt.subplots(figsize=(8, 8), dpi=150)
    
    max_val = max(int(np.max(gt_counts)), int(np.max(pred_counts))) + 5

    # Scatter points with slight jitter to visualize density
    jitter_gt = gt_counts + np.random.normal(0, 0.15, size=len(gt_counts))
    jitter_pred = pred_counts + np.random.normal(0, 0.15, size=len(pred_counts))

    ax.scatter(jitter_gt, jitter_pred, alpha=0.25, s=15, color="#1f77b4", edgecolors="none", label="Test Image Tiles (N=3,343)")
    
    # Identity line y = x
    ax.plot([0, max_val], [0, max_val], 'r--', linewidth=1.5, label="Perfect Agreement (y = x)")

    # Linear trendline
    if len(gt_counts) > 1:
        slope, intercept = np.polyfit(gt_counts, pred_counts, 1)
        x_vals = np.array([0, max_val])
        ax.plot(x_vals, slope * x_vals + intercept, 'g-', linewidth=1.5, label=f"Fit: y = {slope:.2f}x + {intercept:.2f}")

    ax.set_xlim(0, max_val)
    ax.set_ylim(0, max_val)
    ax.set_xlabel("Ground Truth Tree Count (per Tile)", fontsize=12, fontweight="bold")
    ax.set_ylabel("YOLOv8n-Seg Predicted Tree Count (per Tile)", fontsize=12, fontweight="bold")
    ax.set_title("GreenVision-AI: Tree-Counting Baseline (Held-Out Test Set)", fontsize=13, fontweight="bold")
    
    # Metrics annotation box
    text_str = (
        f"MAE: {metrics['mae']:.2f} trees\n"
        f"RMSE: {metrics['rmse']:.2f} trees\n"
        f"Bias: {metrics['bias']:+.2f} trees\n"
        f"Exact: {metrics['exact_match_percentage']:.1f}%\n"
        f"Within ±1: {metrics['within_1_tree_percentage']:.1f}%\n"
        f"Within ±2: {metrics['within_2_trees_percentage']:.1f}%\n"
        f"Pearson r: {metrics['pearson_correlation_r']:.3f}\n"
        f"R²: {metrics['r_squared']:.3f}"
    )
    props = dict(boxstyle='round,pad=0.6', facecolor='wheat', alpha=0.85)
    ax.text(0.04, 0.96, text_str, transform=ax.transAxes, fontsize=10,
            verticalalignment='top', bbox=props, family='monospace')

    ax.legend(loc="lower right", fontsize=10)
    ax.grid(True, linestyle="--", alpha=0.4)
    
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    logger.info(f"Saved scatter plot to: {output_path}")


def run_tree_counting_evaluation(
    weights_path: str = DEFAULT_WEIGHTS,
    images_dir: str = DEFAULT_TEST_IMAGES_DIR,
    labels_dir: str = DEFAULT_TEST_LABELS_DIR,
    output_dir: str = DEFAULT_OUTPUT_DIR,
    conf_threshold: float = 0.25,
    imgsz: int = 512,
    device: str = "0",
    batch_size: int = 16
) -> Dict[str, Any]:
    """
    Executes the full tree counting evaluation across all test image tiles.
    """
    if not os.path.exists(weights_path):
        raise FileNotFoundError(f"Model weights not found at: {weights_path}")
    if not os.path.exists(images_dir):
        raise FileNotFoundError(f"Images directory not found at: {images_dir}")
    if not os.path.exists(labels_dir):
        raise FileNotFoundError(f"Labels directory not found at: {labels_dir}")

    os.makedirs(output_dir, exist_ok=True)

    logger.info("=" * 65)
    logger.info("GREENVISION-AI: TREE-COUNTING BASELINE EVALUATION")
    logger.info("=" * 65)
    logger.info(f"Model Checkpoint:    {weights_path}")
    logger.info(f"Test Images Dir:     {images_dir}")
    logger.info(f"Test Labels Dir:     {labels_dir}")
    logger.info(f"Output Directory:    {output_dir}")
    logger.info(f"Resolution:          {imgsz}x{imgsz}")
    logger.info(f"Confidence Thresh:   {conf_threshold}")
    logger.info(f"Compute Device:      {device}")
    logger.info("=" * 65)

    # 1. Gather all test files
    img_files = sorted([f for f in os.listdir(images_dir) if f.lower().endswith(('.tif', '.tiff', '.png', '.jpg'))])
    logger.info(f"Found {len(img_files)} test images to evaluate.")

    # 2. Load model
    model = YOLO(weights_path)

    records = []
    gt_list = []
    pred_list = []
    plot_records: Dict[str, Dict[str, List[int]]] = {}

    # 3. Run chunked inference to respect 4GB VRAM limit
    chunk_size = 32
    logger.info(f"Running YOLO inference in chunks of {chunk_size} tiles...")

    for i in range(0, len(img_files), chunk_size):
        chunk_files = img_files[i : i + chunk_size]
        chunk_paths = [os.path.join(images_dir, f) for f in chunk_files]

        results = model.predict(
            source=chunk_paths,
            conf=conf_threshold,
            imgsz=imgsz,
            device=device,
            verbose=False
        )

        for img_name, result in zip(chunk_files, results):
            stem = os.path.splitext(img_name)[0]
            lbl_path = os.path.join(labels_dir, f"{stem}.txt")
            
            # Ground truth count
            gt_count = 0
            if os.path.exists(lbl_path):
                with open(lbl_path, "r") as lf:
                    gt_count = len([l.strip() for l in lf.readlines() if l.strip()])

            # Predicted count
            pred_count = len(result.boxes) if result.boxes is not None else 0
            
            signed_error = pred_count - gt_count
            abs_error = abs(signed_error)
            plot_id = extract_plot_id(img_name)

            records.append({
                "filename": img_name,
                "plot_id": plot_id,
                "ground_truth_count": gt_count,
                "predicted_count": pred_count,
                "signed_error": signed_error,
                "absolute_error": abs_error
            })

            gt_list.append(gt_count)
            pred_list.append(pred_count)

            if plot_id not in plot_records:
                plot_records[plot_id] = {"gt": [], "pred": []}
            plot_records[plot_id]["gt"].append(gt_count)
            plot_records[plot_id]["pred"].append(pred_count)

        if (i + chunk_size) % 500 < chunk_size or (i + chunk_size) >= len(img_files):
            processed_so_far = min(i + chunk_size, len(img_files))
            logger.info(f"  Processed {processed_so_far}/{len(img_files)} test tiles...")

    gt_arr = np.array(gt_list, dtype=np.int32)
    pred_arr = np.array(pred_list, dtype=np.int32)

    # 4. Compute overall metrics
    overall_metrics = calculate_counting_metrics(gt_arr, pred_arr)

    # 5. Compute sub-domain breakdown metrics
    domain_metrics = {}
    for plot_id, data in sorted(plot_records.items()):
        domain_metrics[plot_id] = calculate_counting_metrics(
            np.array(data["gt"], dtype=np.int32),
            np.array(data["pred"], dtype=np.int32)
        )

    # Group into Hain (Parkland Domain Shift) vs Forestry Stands (Stadtwald + Tretzendorf)
    forestry_gt = [r["ground_truth_count"] for r in records if r["plot_id"] in ("Stadtwald", "Tretzendorf")]
    forestry_pred = [r["predicted_count"] for r in records if r["plot_id"] in ("Stadtwald", "Tretzendorf")]
    if forestry_gt:
        domain_metrics["Forestry_Combined (Stadtwald + Tretzendorf)"] = calculate_counting_metrics(
            np.array(forestry_gt, dtype=np.int32),
            np.array(forestry_pred, dtype=np.int32)
        )

    # 6. Save results to CSV
    csv_path = os.path.join(output_dir, "tree_counting_results.csv")
    with open(csv_path, "w", newline="") as cf:
        fieldnames = ["filename", "plot_id", "ground_truth_count", "predicted_count", "signed_error", "absolute_error"]
        writer = csv.DictWriter(cf, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
    logger.info(f"Exported per-image counting results to: {csv_path}")

    # 7. Save metrics to JSON
    json_path = os.path.join(output_dir, "tree_counting_metrics.json")
    final_output = {
        "model_weights": weights_path,
        "evaluation_resolution": imgsz,
        "confidence_threshold": conf_threshold,
        "overall_metrics": overall_metrics,
        "domain_breakdown": domain_metrics
    }
    with open(json_path, "w") as jf:
        json.dump(final_output, jf, indent=2)
    logger.info(f"Exported counting metrics summary to: {json_path}")

    # 8. Generate scatter plot
    plot_path = os.path.join(output_dir, "ground_truth_vs_predicted_scatter.png")
    plot_counting_regression(gt_arr, pred_arr, overall_metrics, plot_path)

    # 9. Print concise summary to console
    print("\n" + "=" * 65)
    print("GREENVISION-AI: TREE-COUNTING BASELINE METRICS")
    print("=" * 65)
    print(f"Total Test Tiles:               {overall_metrics['total_images']}")
    print(f"Total Ground Truth Trees:       {overall_metrics['total_ground_truth_trees']}")
    print(f"Total Predicted Trees:          {overall_metrics['total_predicted_trees']}")
    print(f"Mean GT Trees / Tile:           {overall_metrics['mean_ground_truth_per_tile']:.2f}")
    print(f"Mean Pred Trees / Tile:         {overall_metrics['mean_predicted_per_tile']:.2f}")
    print("-" * 65)
    print(f"Mean Absolute Error (MAE):      {overall_metrics['mae']:.3f} trees/tile")
    print(f"Root Mean Squared Error (RMSE): {overall_metrics['rmse']:.3f} trees/tile")
    print(f"Mean Signed Bias:               {overall_metrics['bias']:+.3f} trees/tile")
    print("-" * 65)
    print(f"Exact Count Accuracy:           {overall_metrics['exact_match_percentage']:.2f}%")
    print(f"Within ±1 Tree Accuracy:        {overall_metrics['within_1_tree_percentage']:.2f}%")
    print(f"Within ±2 Trees Accuracy:       {overall_metrics['within_2_trees_percentage']:.2f}%")
    print(f"Non-Zero MAPE:                  {overall_metrics['mape_nonzero_gt_percentage']:.2f}%")
    print(f"Symmetric MAPE (sMAPE):         {overall_metrics['smape_percentage']:.2f}%")
    print("-" * 65)
    print(f"Pearson Correlation (r):        {overall_metrics['pearson_correlation_r']:.4f}")
    print(f"Coefficient of Determ. (R²):    {overall_metrics['r_squared']:.4f}")
    print("=" * 65 + "\n")

    return final_output


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate YOLOv8n-Seg tree crown counting accuracy on BAMFORESTS.")
    parser.add_argument("--weights", type=str, default=DEFAULT_WEIGHTS, help="Path to best.pt weights.")
    parser.add_argument("--images_dir", type=str, default=DEFAULT_TEST_IMAGES_DIR, help="Path to test images dir.")
    parser.add_argument("--labels_dir", type=str, default=DEFAULT_TEST_LABELS_DIR, help="Path to test labels dir.")
    parser.add_argument("--output_dir", type=str, default=DEFAULT_OUTPUT_DIR, help="Output directory.")
    parser.add_argument("--conf", type=float, default=0.25, help="Confidence threshold (default: 0.25).")
    parser.add_argument("--imgsz", type=int, default=512, help="Evaluation resolution (default: 512).")
    parser.add_argument("--device", type=str, default="0", help="Device ID ('0' or 'cpu').")
    parser.add_argument("--batch", type=int, default=16, help="Batch size for streaming (default: 16).")
    args = parser.parse_args()

    run_tree_counting_evaluation(
        weights_path=args.weights,
        images_dir=args.images_dir,
        labels_dir=args.labels_dir,
        output_dir=args.output_dir,
        conf_threshold=args.conf,
        imgsz=args.imgsz,
        device=args.device,
        batch_size=args.batch
    )
