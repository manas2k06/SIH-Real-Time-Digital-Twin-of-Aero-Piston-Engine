# GreenVision AI: Project Technical Specification

## 1. Project Overview & Core Mission
GreenVision AI is an AI- and GIS-powered green-cover assessment, tree inventory, and vegetation health analytics platform. It ingests high-resolution satellite and aerial imagery (multispectral / RGB / NIR), processes spatial data with deterministic and machine-learning models, validates all findings, and produces human-readable ecological intelligence reports.

---

## 2. Authoritative Technical Boundaries

The system strictly enforces separation of concerns across four fundamental domains:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            GREENVISION AI SYSTEM                            │
├──────────────────────────┬──────────────────────────┬───────────────────────┤
│ 1. Machine Learning      │ 2. Deterministic         │ 3. Language & Report  │
│    Inference Layer       │    Analytics Layer       │    Generation Layer   │
├──────────────────────────┼──────────────────────────┼───────────────────────┤
│ • YOLOv8n-Seg (Trees)    │ • NDVI Mathematical     │ • Qwen 2.5 (Small)    │
│ • U-Net (Woodland/Canopy)│   Formulas               │ • Factual synthesis   │
│ • Mask / Box Predictions │ • Canopy Area (m² / ha)  │   from validated JSON │
│                          │ • Tree Counting & Density│ • Natural-language    │
│                          │ • Statistical Histograms │   explanations        │
├──────────────────────────┴──────────────────────────┴───────────────────────┤
│                         4. VALIDATION GATEWAY LAYER                         │
│ • Strict schema enforcement & boundary checks (e.g., NDVI in [-1, 1])       │
│ • Eliminates hallucinations and verifies numerical consistency              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Model & Analytical Roles
1. **YOLOv8n-Seg**:
   - **Role**: Dedicated model for individual tree detection, bounding box localization, and **genuine instance segmentation** (crown boundary polygon delineation).
   - **Requirement**: Requires true individual crown polygon annotations (`class_id x1 y1 ... xn yn`). Bounding boxes alone cannot train instance segmentation heads.
   - **Outputs**: Bounding boxes, confidence scores, and individual tree crown polygon masks.
2. **U-Net**:
   - **Role**: Dedicated model for dense pixel-level **semantic segmentation of woodland and continuous canopy cover**.
   - **Outputs**: Binary / multi-class semantic woodland masks.
3. **NDVI (Normalized Difference Vegetation Index)**:
   - **Role**: Deterministic mathematical calculation of vegetation health based on Near-Infrared (NIR) and Red spectral bands.
   - **Formula**: $\text{NDVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}$
   - **Boundary**: NDVI is **never** a trained neural-network model. It is computed as a pure deterministic array operation. It **cannot** be computed from RGB-only imagery.
4. **Authoritative Numerical Calculations (Python & NumPy)**:
   - Python and NumPy perform all authoritative calculations (canopy area in square meters/hectares, percentage coverage, tree density, statistical distributions).
   - Numerical values must never be estimated by language models.
5. **Qwen 2.5 Language Model Role & Boundary**:
   - Qwen interprets and summarizes **validated, structured outputs** (JSON payloads).
   - Qwen **must not**:
     - Invent or estimate numerical measurements.
     - Perform authoritative mathematical calculations.
     - Infer spatial measurements directly from raw imagery.
     - Override predictions from vision models or deterministic analytics.
   - Qwen **must**:
     - Translate validated numbers, tree counts, and NDVI trends into coherent ecological summaries and executive reports.

---

## 3. Hardware & Platform Specifications

### 3.1 Training Environment
- **Hardware**: ASUS TUF A15
- **GPU**: NVIDIA GeForce RTX 3050 Laptop GPU (**4.0 GB VRAM**)
- **CPU**: AMD Ryzen 7 7445HS
- **RAM**: 16.0 GB System RAM
- **OS**: Windows 11 (64-bit)
- **Acceleration**: NVIDIA CUDA 12.4 with PyTorch Automatic Mixed Precision (AMP)

### 3.2 Deployment Target
- **Hardware**: Apple MacBook (M4 chip)
- **OS**: macOS
- **Acceleration**: Apple Silicon Metal Performance Shaders (MPS) or platform-appropriate runtime

---

## 4. Geospatial & Data Integrity Standards
- **Coordinate Reference Systems (CRS)**: All raster inputs (GeoTIFF) and vector outputs (GeoJSON) must carry valid CRS metadata with explicit EPSG identifiers.
- **Spatial Drift Control**: Any image tiling, windowed slicing, reprojection, or reassembly must remain within explicitly defined numerical and spatial tolerances without unintended drift.
- **Data Leakage Prevention**: Spatial autocorrelation leakage is strictly prohibited. Training, validation, and test splits must use geographic spatial block holdouts or distinct scene boundaries.
