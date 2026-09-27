# Evaluation Standards & Experiment Logging

## 1. Metric Definitions & Evaluation Criteria

All quantitative targets are explicitly marked **TBD** and will be determined empirically after inspecting the training datasets and conducting initial baseline experiments.

### 1.1 U-Net Semantic Segmentation (Canopy Cover)
- **Primary Metric**: Mean Intersection over Union (mIoU) across canopy and background classes.
- **Secondary Metrics**: Dice Similarity Coefficient (F1-score), Precision, Recall.
- **Numerical Target**: `[TBD — Pending baseline experiments]`

### 1.2 YOLOv8n-Seg Instance Detection (Tree Inventory)
- **Primary Metric**: Mask mean Average Precision at IoU thresholds 0.50 and 0.50:0.95 (mAP50, mAP50-95).
- **Secondary Metrics**: Box mAP50-95, Object Precision, Object Recall, Tree Count Error.
- **Numerical Target**: `[TBD — Pending baseline experiments]`

### 1.3 Deterministic NDVI & Health Analysis
- **Evaluation Criteria**:
  - Exact formula fidelity: $\text{NDVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}$
  - Strict value range bounding within $[-1.0, 1.0]$.
  - Correct handling of invalid pixels, zero-denominator conditions, and nodata masks.
  - Zero tolerance for calculation errors in deterministic Python modules.

### 1.4 System Performance & Memory Bounds
- **Inference Latency Target**: `[TBD — Pending profiling on RTX 3050 and M4]`
- **Peak VRAM Training Target**: `[TBD — Experimentally bounded safely below 4.0 GB limit]`

---

## 2. Machine Learning Experiment Logging Standards

Every ML experiment executed in the repository must be documented in `experiments/<experiment_id>/` with the following mandatory fields:

1. **Dataset Information**: Dataset identifier, version, GSD, and spatial split strategy.
2. **Model Configuration**: Model architecture, backbone, input channels, and config file reference.
3. **Hyperparameters**: Learning rate, optimizer, scheduler, loss weights, batch size, and augmentations.
4. **Random Seeds**: Explicit seeds used for Python, NumPy, and PyTorch.
5. **Hardware Environment**: GPU model (RTX 3050), VRAM allocated, CPU, and RAM.
6. **Software Environment**: OS, Python version, PyTorch version, CUDA version, and key library versions.
7. **Training Duration**: Total wall-clock time and number of training epochs.
8. **Evaluation Metrics**: Quantitative results on validation and test partitions.
9. **Checkpoint Reference**: Path to the saved weights file or model artifact.
10. **Notes & Observations**: Qualitative findings, failure modes, and analytical insights.

---

## 3. Reporting Validation & Factual Consistency

Prior to generating natural language summaries with Qwen 2.5:
1. **Schema Validation**: Deterministic analytics must be validated against a typed schema ensuring all values fall within physical bounds (e.g., canopy area $\ge 0$, tree counts $\ge 0$, NDVI in $[-1.0, 1.0]$).
2. **Factual Verification**: Generated textual reports must be audited against the input JSON payload to ensure 100% factual consistency and zero hallucination of numerical metrics.
