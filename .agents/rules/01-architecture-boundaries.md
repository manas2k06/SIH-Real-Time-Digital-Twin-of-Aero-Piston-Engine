# Rule 01: Architecture Boundaries & Separation of Concerns

## Core Directives
1. **ML Prediction Layer**:
   - **YOLOv8n-Seg**: Dedicated exclusively to individual tree detection, bounding box localization, and instance segmentation.
   - **U-Net**: Dedicated exclusively to pixel-level semantic segmentation of continuous vegetation and canopy cover.
   - Vision models output raw spatial predictions (tensors, bounding coordinates, probability masks).
2. **Deterministic Analytics Layer**:
   - **NDVI**: Computed deterministically as $\frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}$. NDVI is **never** a machine-learning model.
   - All physical calculations (canopy area in $m^2$/hectares, tree counts, statistical distributions) are performed exclusively by deterministic Python/NumPy logic.
3. **Validation Gateway Layer**:
   - All predictions and calculated values must pass schema and physical range validation before reaching downstream reporting.
   - Out-of-bounds metrics, NaN values, and invalid geometries must be intercepted and rejected.
4. **Natural-Language Layer (Qwen 2.5)**:
   - Qwen 2.5 is strictly confined to interpreting validated structured JSON inputs.
   - Qwen **must never** perform mathematical calculations, invent spatial measurements, estimate numbers from raw imagery, or override vision model predictions.
