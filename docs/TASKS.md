# GreenVision AI: Task System & Master Backlog

## 1. Task System Structure
Every engineering and research task in GreenVision AI must follow the mandatory task card schema:

```markdown
### TASK-XXX: <Title>
- **Objective**: <Clear statement of the problem and desired capability>
- **Inputs**: <Input data, configuration files, upstream artifacts>
- **Expected Outputs**: <Source modules, tests, output rasters, JSON metrics>
- **Files / Components Affected**: <Exact file paths in src/, tests/, configs/>
- **Constraints**: <Hardware limits (4GB VRAM), mathematical boundaries, minimal dependencies>
- **Dependencies**: <Preceding task IDs>
- **Acceptance Criteria**: <Measurable functional and architectural requirements>
- **Required Verification**: <Explicit verification commands and target outputs>
```

---

## 2. Master Milestone & Task Backlog

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MASTER MILESTONE BACKLOG                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ M0: Project Foundation (TASK-001 to TASK-007)                               │
│ M1: Dataset Infrastructure & Spatial Partitioning (TASK-101 to TASK-104)    │
│ M2: YOLOv8n-Seg Tree Detection Training Pipeline (TASK-201 to TASK-204)    │
│ M3: YOLOv8n-Seg Evaluation & Benchmark Suite (TASK-301 to TASK-303)        │
│ M4: U-Net Semantic Canopy Segmentation Pipeline (TASK-401 to TASK-404)     │
│ M5: U-Net Evaluation & Baseline Determination (TASK-501 to TASK-503)        │
│ M6: Deterministic NDVI & Health Analytics Engine (TASK-601 to TASK-603)     │
│ M7: Calculation, Spatial Fusion & Validation Layer (TASK-701 to TASK-704)   │
│ M8: Qwen 2.5 Natural-Language Reporting Module (TASK-801 to TASK-804)      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Milestone 0: Project Foundation & Control Architecture
*Status: In Progress*

#### TASK-001: Repository Architecture & Directory Scaffolding
- **Objective**: Establish the persistent directory layout and initial development controls.
- **Inputs**: Initial project repository.
- **Expected Outputs**: Verified repository directories (`src/`, `configs/`, `docs/`, `tests/`, `scripts/`).
- **Files / Components Affected**: Repository root layout, `docs/ARCHITECTURE.md`.
- **Constraints**: No application code or dependencies.
- **Dependencies**: None.
- **Acceptance Criteria**: Clean directory structure matching architecture documentation.
- **Required Verification**: Directory listing and structure audit.

#### TASK-002: Core Technical Specification & Definition of Done
- **Objective**: Formalize architectural boundaries (YOLO vs U-Net vs NDVI vs Qwen) and completion criteria.
- **Inputs**: Project requirements.
- **Expected Outputs**: `docs/PROJECT_SPECIFICATION.md`, `docs/DEFINITION_OF_DONE.md`.
- **Files / Components Affected**: `docs/`
- **Constraints**: Strict boundary enforcement; no LLM calculations.
- **Dependencies**: TASK-001.
- **Acceptance Criteria**: All 4 boundaries formally defined and approved.
- **Required Verification**: Specification consistency review.

#### TASK-003: Persistent Agent Rules & Workflows Configuration
- **Objective**: Implement Antigravity agent rules and reusable workflows (`/plan`, `/implement`, `/verify`, `/debug`, `/review`).
- **Inputs**: Project specifications and hardware constraints.
- **Expected Outputs**: `.agents/rules/` and `.agents/workflows/` markdown files.
- **Files / Components Affected**: `.agents/`
- **Constraints**: Hardware guardrails for 4GB RTX 3050.
- **Dependencies**: TASK-002.
- **Acceptance Criteria**: Discoverable rules and workflows enforcing inspection before modification.
- **Required Verification**: File existence and workflow format verification.

#### TASK-004: Python Environment Creation & Base Packaging
- **Objective**: Create isolated virtual environment with Python 3.10.11 and upgraded base packaging tools.
- **Inputs**: Host Python 3.10.11 runtime.
- **Expected Outputs**: `C:\GreenVision-AI\.venv`.
- **Files / Components Affected**: `.venv/`
- **Constraints**: Use `--no-cache-dir`; zero storage waste.
- **Dependencies**: TASK-001.
- **Acceptance Criteria**: Python 3.10.11 64-bit virtual environment active.
- **Required Verification**: Stage 1 environment inspection script.

#### TASK-005: PyTorch & CUDA Acceleration Validation
- **Objective**: Install and validate official PyTorch 2.4.1+cu124 and Torchvision 0.19.1+cu124 on RTX 3050.
- **Inputs**: `.venv`, PyTorch cu124 index.
- **Expected Outputs**: Validated PyTorch CUDA runtime, `scripts/verify_stage2_cuda.py`.
- **Files / Components Affected**: `.venv/`, `scripts/verify_stage2_cuda.py`.
- **Constraints**: Zero CPU fallback; peak VRAM measured.
- **Dependencies**: TASK-004.
- **Acceptance Criteria**: CUDA matmul and neural net forward/backward passes execute on `cuda:0`.
- **Required Verification**: Execution of `verify_stage2_cuda.py` returning PASS.

#### TASK-006: Computer Vision & YOLO Architecture Environment Validation
- **Objective**: Install and validate NumPy, OpenCV, PyYAML, and Ultralytics without PyTorch regressions.
- **Inputs**: `.venv`, Stage 2 environment.
- **Expected Outputs**: Installed CV packages, `scripts/verify_stage3_cv_yolo.py`.
- **Files / Components Affected**: `.venv/`, `scripts/verify_stage3_cv_yolo.py`.
- **Constraints**: No replacement of CUDA PyTorch; NumPy < 2.0.0.
- **Dependencies**: TASK-005.
- **Acceptance Criteria**: In-memory CV ops and YOLOv8n-Seg forward pass execute on `cuda:0`.
- **Required Verification**: Execution of `verify_stage3_cv_yolo.py` returning PASS.

#### TASK-007: Configuration Scaffolding & Logging Foundations
- **Objective**: Create modular YAML configuration templates for data, models, training, and inference.
- **Inputs**: Architecture specifications.
- **Expected Outputs**: `configs/base_config.yaml`, `configs/yolo/`, `configs/unet/`.
- **Files / Components Affected**: `configs/`
- **Constraints**: Fully parameterized dimensions, batch sizes, and devices.
- **Dependencies**: TASK-006.
- **Acceptance Criteria**: Valid YAML schema loadable by PyYAML without errors.
- **Required Verification**: Automated configuration loader test.

---

### Milestone 1: Dataset Infrastructure & Spatial Partitioning

#### TASK-101: Synthetic & Sample Multispectral Dataset Generator
- **Objective**: Generate synthetic 4-band (R, G, B, NIR) GeoTIFFs and GeoJSON annotations for local testing.
- **Inputs**: Synthetic parameters, spatial resolution definitions.
- **Expected Outputs**: Sample rasters and vector masks in `data/sample/`.
- **Files / Components Affected**: `scripts/generate_sample_data.py`, `data/sample/`.
- **Constraints**: Footprint < 500 MB; valid georeferencing metadata.
- **Dependencies**: TASK-007.
- **Acceptance Criteria**: Sample rasters readable by standard GIS and array tools.
- **Required Verification**: Automated raster validation test.

#### TASK-102: Windowed Tiling & Stride Module
- **Objective**: Implement configurable raster tiling with coordinate geotransform retention.
- **Inputs**: GeoTIFF rasters, tiling configuration.
- **Expected Outputs**: `src/gis/tiler.py`, unit tests in `tests/unit/test_tiler.py`.
- **Files / Components Affected**: `src/gis/tiler.py`, `tests/unit/test_tiler.py`.
- **Constraints**: Configurable tile dimensions and stride; no unhandled coordinate drift.
- **Dependencies**: TASK-101.
- **Acceptance Criteria**: Tile patches retain sub-window geospatial geotransforms within defined tolerances.
- **Required Verification**: Tiling roundtrip tests verifying coordinate alignment.

#### TASK-103: Spatial Leakage Prevention & Geographic Splitter
- **Objective**: Implement spatial block holdout partitioning to prevent adjacent tile leakage.
- **Inputs**: Tiled raster dataset, spatial bounding coordinates.
- **Expected Outputs**: `src/data/spatial_split.py`, split metadata JSON.
- **Files / Components Affected**: `src/data/spatial_split.py`, `tests/unit/test_split.py`.
- **Constraints**: No overlapping or adjacent tiles from the same scene crossing split boundaries.
- **Dependencies**: TASK-102.
- **Acceptance Criteria**: Zero geographic overlap between train, val, and test splits.
- **Required Verification**: Spatial boundary intersection tests.

#### TASK-104: Data Provenance & Metadata Logger
- **Objective**: Implement automated provenance recording (source, GSD, bands, CRS, split assignments).
- **Inputs**: Ingested datasets.
- **Expected Outputs**: `src/data/provenance.py`, `data/metadata.json`.
- **Files / Components Affected**: `src/data/provenance.py`.
- **Constraints**: Complete logging of all 11 provenance fields.
- **Dependencies**: TASK-103.
- **Acceptance Criteria**: Schema validation of generated provenance JSON records.
- **Required Verification**: Provenance schema compliance test.

---

### Milestone 2: YOLOv8n-Seg Tree Detection Training Pipeline

#### TASK-201: YOLO Instance Segmentation Dataset Formatter
- **Objective**: Convert vector tree canopy polygons and tiled images into YOLO segmentation TXT format.
- **Inputs**: Tiled images, GeoJSON tree polygons.
- **Expected Outputs**: `src/data/yolo_formatter.py`, YOLO-formatted dataset directories.
- **Files / Components Affected**: `src/data/yolo_formatter.py`, `tests/unit/test_yolo_formatter.py`.
- **Constraints**: Normalized polygon coordinates $[0.0, 1.0]$.
- **Dependencies**: TASK-103.
- **Acceptance Criteria**: Formatted annotations pass Ultralytics dataset validator.
- **Required Verification**: Unit test verifying polygon normalization and bounding boxes.

#### TASK-202: Configurable YOLO Training Runner with AMP
- **Objective**: Implement training entry point for YOLOv8n-Seg with mixed precision on RTX 3050.
- **Inputs**: Formatted YOLO dataset, `configs/yolo/train_config.yaml`.
- **Expected Outputs**: `src/models/yolo/train.py`, `configs/yolo/train_config.yaml`.
- **Files / Components Affected**: `src/models/yolo/train.py`.
- **Constraints**: Peak VRAM strictly bounded under 4.0 GB; configurable batch size and image size.
- **Dependencies**: TASK-201.
- **Acceptance Criteria**: Training loop executes epochs without CUDA OOM.
- **Required Verification**: Dry-run training test on sample dataset logging VRAM usage.

#### TASK-203: Checkpoint & Metric Callback Integration
- **Objective**: Integrate checkpoint pruning (retaining only best/last weights) and experiment metric logging.
- **Inputs**: YOLO training runner.
- **Expected Outputs**: `src/models/yolo/callbacks.py`, experiment log records in `experiments/`.
- **Files / Components Affected**: `src/models/yolo/callbacks.py`.
- **Constraints**: Storage per run < 500 MB.
- **Dependencies**: TASK-202.
- **Acceptance Criteria**: Automatically records all 10 mandatory experiment metadata fields.
- **Required Verification**: Test verifying log creation and checkpoint pruning.

#### TASK-204: YOLOv8n-Seg Inference & Polygon Extraction Wrapper
- **Objective**: Implement inference module outputting georeferenced polygon masks and confidence scores.
- **Inputs**: Trained YOLO weights, input image tiles.
- **Expected Outputs**: `src/models/yolo/infer.py`, `tests/unit/test_yolo_infer.py`.
- **Files / Components Affected**: `src/models/yolo/infer.py`.
- **Constraints**: Device-agnostic (`cuda:0` or `cpu`).
- **Dependencies**: TASK-202.
- **Acceptance Criteria**: Inference yields structured detection dataclass with box, mask, and score.
- **Required Verification**: Inference test on sample fixture image.

---

### Milestone 3: YOLO Evaluation & Benchmark Suite

#### TASK-301: YOLO Quantitative Evaluation Engine
- **Objective**: Implement evaluation script computing mask mAP50, mAP50-95, box mAP, and precision/recall.
- **Inputs**: Test split dataset, trained YOLO weights.
- **Expected Outputs**: `src/models/yolo/evaluate.py`, metric evaluation report.
- **Files / Components Affected**: `src/models/yolo/evaluate.py`.
- **Constraints**: Evaluation executed on isolated test split.
- **Dependencies**: TASK-204.
- **Acceptance Criteria**: Generates quantitative validation report without data leakage.
- **Required Verification**: Test evaluation script returning complete metric dictionary.

#### TASK-302: Empirical Target Baseline Establishment for YOLO
- **Objective**: Run baseline benchmark on test dataset and record empirical performance targets (TBD resolution).
- **Inputs**: Trained baseline model.
- **Expected Outputs**: `docs/decisions/ADR-004-yolo-baseline-targets.md`.
- **Files / Components Affected**: `docs/decisions/`, `docs/EVALUATION_STANDARDS.md`.
- **Constraints**: Based on actual test data metrics.
- **Dependencies**: TASK-301.
- **Acceptance Criteria**: Formally defines numerical target thresholds for YOLO instance segmentation.
- **Required Verification**: Benchmark log verification.

#### TASK-303: YOLO Tree Count Error & Confusion Analysis
- **Objective**: Implement tree inventory counting verification comparing predicted count vs. ground truth.
- **Inputs**: Predicted instances, ground truth polygons.
- **Expected Outputs**: `src/models/yolo/count_metrics.py`, unit test.
- **Files / Components Affected**: `src/models/yolo/count_metrics.py`.
- **Constraints**: Pure deterministic metric calculation.
- **Dependencies**: TASK-301.
- **Acceptance Criteria**: Computes Mean Absolute Error (MAE) and Mean Percentage Error on tree inventory.
- **Required Verification**: Unit test with synthetic detection scenarios.

---

### Milestone 4: U-Net Semantic Canopy Segmentation Pipeline

#### TASK-401: Native PyTorch U-Net Architecture Implementation
- **Objective**: Implement lightweight, modular U-Net in pure PyTorch for canopy segmentation.
- **Inputs**: Architecture specifications.
- **Expected Outputs**: `src/models/unet/model.py`, `tests/unit/test_unet_model.py`.
- **Files / Components Affected**: `src/models/unet/model.py`.
- **Constraints**: Parameter count optimized for 4GB VRAM training; device agnostic.
- **Dependencies**: TASK-103.
- **Acceptance Criteria**: Forward pass tensor shapes verify correct spatial dimensions across depths.
- **Required Verification**: Unit test verifying input/output tensor shapes and gradient backpropagation.

#### TASK-402: U-Net Dataset Loader & Augmentation Pipeline
- **Objective**: Implement PyTorch Dataset for paired multispectral/RGB tiles and binary canopy masks.
- **Inputs**: Tiled rasters, binary mask images.
- **Expected Outputs**: `src/models/unet/dataset.py`, `tests/unit/test_unet_dataset.py`.
- **Files / Components Affected**: `src/models/unet/dataset.py`.
- **Constraints**: Memory-efficient batch collation; configurable augmentations.
- **Dependencies**: TASK-401.
- **Acceptance Criteria**: Dataset yields standardized `(B, C, H, W)` tensors on demand.
- **Required Verification**: DataLoader test verifying batch shapes and memory allocation.

#### TASK-403: U-Net Training Engine with AMP & Loss Suite
- **Objective**: Implement training pipeline with combined BCE + Dice loss and PyTorch AMP.
- **Inputs**: U-Net DataLoader, `configs/unet/train_config.yaml`.
- **Expected Outputs**: `src/models/unet/train.py`, `src/models/unet/losses.py`.
- **Files / Components Affected**: `src/models/unet/train.py`, `src/models/unet/losses.py`.
- **Constraints**: Mixed precision active; peak VRAM within 4GB limit.
- **Dependencies**: TASK-402.
- **Acceptance Criteria**: Stable convergence on training batches with zero CUDA memory leaks.
- **Required Verification**: Execution of short training run logging loss descent and VRAM.

#### TASK-404: U-Net Inference & Patch Stitching Module
- **Objective**: Implement U-Net inference on arbitrary raster dimensions via windowed sliding inference.
- **Inputs**: Ingested GeoTIFF, trained U-Net checkpoint.
- **Expected Outputs**: `src/models/unet/infer.py`, output canopy probability GeoTIFF.
- **Files / Components Affected**: `src/models/unet/infer.py`.
- **Constraints**: Preserves exact input raster CRS and spatial extent.
- **Dependencies**: TASK-403.
- **Acceptance Criteria**: Generates full-scene georeferenced binary canopy mask.
- **Required Verification**: Verification test comparing spatial extent of mask against input raster.

---

### Milestone 5: U-Net Evaluation & Baseline Determination

#### TASK-501: U-Net Quantitative Metrics Suite
- **Objective**: Implement metric calculation for semantic segmentation: mIoU, Dice Coefficient, Precision, Recall.
- **Inputs**: Predicted masks, ground truth masks.
- **Expected Outputs**: `src/models/unet/metrics.py`, `tests/unit/test_unet_metrics.py`.
- **Files / Components Affected**: `src/models/unet/metrics.py`.
- **Constraints**: Deterministic array math in NumPy/PyTorch.
- **Dependencies**: TASK-404.
- **Acceptance Criteria**: Exact metric computation across confusion matrix quadrants.
- **Required Verification**: Unit test verifying known binary mask IoU calculation.

#### TASK-502: Empirical Target Baseline Establishment for U-Net
- **Objective**: Benchmark U-Net on test split and record empirical target thresholds (TBD resolution).
- **Inputs**: Trained U-Net model on test dataset.
- **Expected Outputs**: `docs/decisions/ADR-005-unet-baseline-targets.md`.
- **Files / Components Affected**: `docs/decisions/`, `docs/EVALUATION_STANDARDS.md`.
- **Constraints**: Empirical evidence from test partition.
- **Dependencies**: TASK-501.
- **Acceptance Criteria**: Formalizes numerical mIoU / Dice target thresholds.
- **Required Verification**: Benchmark report review.

#### TASK-503: Boundary Seam & Tiling Artifact Evaluator
- **Objective**: Verify whether sliding window reassembly introduces seam artifacts across tile boundaries.
- **Inputs**: Reassembled full-scene masks.
- **Expected Outputs**: `src/gis/seam_evaluator.py`, diagnostic report.
- **Files / Components Affected**: `src/gis/seam_evaluator.py`.
- **Constraints**: Checks boundary continuity within spatial tolerances.
- **Dependencies**: TASK-501.
- **Acceptance Criteria**: Validates that tile border discontinuities do not exceed defined thresholds.
- **Required Verification**: Seam continuity audit test.

---

### Milestone 6: Deterministic NDVI & Health Analytics Engine

#### TASK-601: Deterministic NDVI Computation Engine
- **Objective**: Implement pure NumPy/Python array calculation of NDVI from NIR and Red bands.
- **Inputs**: Multispectral raster arrays (NIR, Red channels).
- **Expected Outputs**: `src/analytics/ndvi.py`, `tests/unit/test_ndvi.py`.
- **Files / Components Affected**: `src/analytics/ndvi.py`, `tests/unit/test_ndvi.py`.
- **Constraints**: Strictly deterministic; zero division safe; values bounded in $[-1.0, 1.0]$.
- **Dependencies**: TASK-007.
- **Acceptance Criteria**: Correct handling of valid pixels, nodata masks, and zero-denominator pixels.
- **Required Verification**: Unit test with edge-case floating point fixtures.

#### TASK-602: Vegetation Health Categorization & Statistical Aggregator
- **Objective**: Categorize NDVI values into standard health tiers (Dense Canopy, Moderate, Sparse, Non-vegetated) and compute statistical distribution.
- **Inputs**: Computed NDVI array.
- **Expected Outputs**: `src/analytics/health_stats.py`, summary metrics dictionary.
- **Files / Components Affected**: `src/analytics/health_stats.py`.
- **Constraints**: Deterministic calculation.
- **Dependencies**: TASK-601.
- **Acceptance Criteria**: Calculates mean, median, standard deviation, and percentage per health class.
- **Required Verification**: Unit test verifying class sum percentages equal $100\%$.

#### TASK-603: NDVI Georeferenced Color-Map Exporter
- **Objective**: Export computed NDVI index as single-band georeferenced GeoTIFF with colormap metadata.
- **Inputs**: NDVI array, spatial geotransform and CRS.
- **Expected Outputs**: `src/gis/ndvi_exporter.py`, output GeoTIFF.
- **Files / Components Affected**: `src/gis/ndvi_exporter.py`.
- **Constraints**: Exact CRS preservation without spatial drift.
- **Dependencies**: TASK-602.
- **Acceptance Criteria**: Output GeoTIFF readable in QGIS with correct spatial placement.
- **Required Verification**: Spatial metadata verification test.

---

### Milestone 7: Calculation, Spatial Fusion & Validation Layer

#### TASK-701: Canopy Area & Physical Dimension Calculator
- **Objective**: Compute exact physical canopy area ($m^2$ and hectares) based on pixel counts and Ground Sample Distance (GSD).
- **Inputs**: Binary canopy mask, GSD resolution metadata.
- **Expected Outputs**: `src/analytics/area_calc.py`, `tests/unit/test_area_calc.py`.
- **Files / Components Affected**: `src/analytics/area_calc.py`.
- **Constraints**: Authoritative deterministic calculation.
- **Dependencies**: TASK-404.
- **Acceptance Criteria**: Exact area calculation verified against geometric polygon ground truth.
- **Required Verification**: Unit test with known area shapes.

#### TASK-702: Multi-Model Spatial Fusion Engine
- **Objective**: Combine U-Net continuous canopy masks, YOLO tree instances, and NDVI health layers into unified geospatial representation.
- **Inputs**: U-Net masks, YOLO instance polygons, NDVI arrays.
- **Expected Outputs**: `src/analytics/fusion.py`, `tests/unit/test_fusion.py`.
- **Files / Components Affected**: `src/analytics/fusion.py`.
- **Constraints**: Resolves overlap conflicts deterministically.
- **Dependencies**: TASK-204, TASK-404, TASK-602.
- **Acceptance Criteria**: Fuses tree counts, canopy extent, and health scores per detected tree.
- **Required Verification**: Spatial integration test verifying fused output dataclass.

#### TASK-703: Deterministic Schema & Value Validation Gateway
- **Objective**: Implement strict validation gateway enforcing range checks, physical bounds, and NaN/null rejection.
- **Inputs**: Fused analytical results dictionary.
- **Expected Outputs**: `src/validation/gateway.py`, `src/validation/schemas.py`.
- **Files / Components Affected**: `src/validation/gateway.py`, `src/validation/schemas.py`.
- **Constraints**: Rejects any invalid, out-of-bounds, or NaN metric before reporting.
- **Dependencies**: TASK-702.
- **Acceptance Criteria**: Validated payload conforms to typed schema (`ValidatedGreenVisionReport`).
- **Required Verification**: Test suite with intentionally malformed inputs verifying rejection.

#### TASK-704: Unified GIS Vector & GeoJSON Exporter
- **Objective**: Export validated tree instances and canopy boundaries as georeferenced GeoJSON.
- **Inputs**: Validated analytical outputs, CRS metadata.
- **Expected Outputs**: `src/gis/geojson_exporter.py`, output `.geojson` files.
- **Files / Components Affected**: `src/gis/geojson_exporter.py`.
- **Constraints**: Valid RFC 7946 GeoJSON format with exact coordinates.
- **Dependencies**: TASK-703.
- **Acceptance Criteria**: Output passes GeoJSON geometry schema validation.
- **Required Verification**: GeoJSON schema validation test.

---

### Milestone 8: Qwen 2.5 Natural-Language Reporting Module

#### TASK-801: Structured JSON Input Schema for Ecological Reporting
- **Objective**: Define JSON reporting payload schema fed into Qwen 2.5.
- **Inputs**: Validated analytical dataclass from TASK-703.
- **Expected Outputs**: `src/reporting/schema.py`, sample reporting payloads.
- **Files / Components Affected**: `src/reporting/schema.py`.
- **Constraints**: Contains only authoritative deterministic metrics.
- **Dependencies**: TASK-703.
- **Acceptance Criteria**: Clean JSON serialization of tree counts, canopy area, NDVI distribution.
- **Required Verification**: Schema serialization unit test.

#### TASK-802: Constrained Prompt Engineering & Template Design
- **Objective**: Design system and user prompt templates that constrain Qwen 2.5 strictly to input facts.
- **Inputs**: Reporting JSON schema.
- **Expected Outputs**: `src/reporting/prompts.py`, `configs/reporting/prompt_templates.yaml`.
- **Files / Components Affected**: `src/reporting/prompts.py`.
- **Constraints**: Prohibits LLM numerical calculation, hallucination, or metric overriding.
- **Dependencies**: TASK-801.
- **Acceptance Criteria**: Prompts enforce structured executive summary, health assessment, and recommendations based solely on JSON context.
- **Required Verification**: Prompt template linting and parameter verification.

#### TASK-803: Local Qwen 2.5 Inference Execution Module
- **Objective**: Implement local execution wrapper for Qwen 2.5 (quantized/CPU/isolated GPU) generating Markdown reports.
- **Inputs**: Validated JSON payload, prompt templates, local Qwen 2.5 model weights.
- **Expected Outputs**: `src/reporting/qwen_runner.py`, output Markdown reports.
- **Files / Components Affected**: `src/reporting/qwen_runner.py`.
- **Constraints**: Zero memory contention with vision models; sequential execution.
- **Dependencies**: TASK-802.
- **Acceptance Criteria**: Produces clean Markdown report from validated input.
- **Required Verification**: Dry-run report generation test.

#### TASK-804: Factual Consistency & Hallucination Audit Suite
- **Objective**: Implement automated audit verifying that every numerical value cited in the LLM text matches the input JSON.
- **Inputs**: Generated Markdown report, input validated JSON payload.
- **Expected Outputs**: `src/reporting/audit.py`, `tests/unit/test_report_audit.py`.
- **Files / Components Affected**: `src/reporting/audit.py`.
- **Constraints**: Regex/numerical entity extraction and comparison.
- **Dependencies**: TASK-803.
- **Acceptance Criteria**: Fails if any cited number in text deviates from input JSON values.
- **Required Verification**: Audit test with intentional discrepancy verifying failure detection.
