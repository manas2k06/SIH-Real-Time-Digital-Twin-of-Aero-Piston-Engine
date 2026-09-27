# GreenVision AI: System Architecture

## 1. System Purpose & Scope
GreenVision AI is a modular, AI- and GIS-based green-cover assessment platform designed to process high-resolution aerial and satellite imagery, extract deterministic vegetation health metrics (NDVI), segment canopy cover (U-Net), detect individual tree instances (YOLOv8n-Seg), validate numerical and spatial metrics, and generate human-readable ecological reports (Qwen 2.5).

## 2. Architectural Design Principles
- **Minimalist & Modular**: Standard Python package design. No microservices, containerization frameworks, external databases, or message queues unless explicitly justified by future project requirements.
- **Strict Separation of Concerns**:
  - **Deterministic Components**: Pure Python / GIS logic produces all authoritative metrics (areas, tree counts, NDVI distributions, coordinate geometries).
  - **ML Prediction Components**: Vision models (U-Net, YOLOv8n-Seg) produce segmentation masks and bounding/instance predictions.
  - **Validation Layer**: Validates model predictions and statistical outputs against schema constraints and value bounds.
  - **Natural-Language Component**: Qwen 2.5 consumes validated structured summaries and generates factual explanations and executive reports without computing numerical values.
- **Geospatial Fidelity**: All raster tiling, transformation, and reassembly operations preserve Coordinate Reference System (CRS) metadata with no unintended spatial drift within explicitly defined numerical tolerances.

## 3. Component Flow Diagram

```
[Input Imagery: GeoTIFF / Aerial Rasters]
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│ 1. GIS Ingestion & Configurable Preprocessing Engine   │
│    - GeoTIFF ingestion & CRS retention                 │
│    - Configurable windowed tiling & stride             │
└──────────────┬───────────────────┬─────────────────────┘
               │                   │
               ▼                   ▼
┌─────────────────────────┐  ┌───────────────────────────┐
│ 2. U-Net Semantic       │  │ 3. YOLOv8n-Seg Instance   │
│    Segmentation Engine  │  │    Detection Engine       │
│    - Canopy cover mask  │  │    - Tree counts & masks  │
└──────────────┬──────────┘  └─────────────┬─────────────┘
               │                           │
               └─────────────┬─────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│ 4. Deterministic Analytics Engine                      │
│    - NDVI calculation: (NIR - Red) / (NIR + Red)       │
│    - Exact canopy area & coverage calculation          │
│    - Statistical health index distributions            │
└────────────────────────────┬───────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│ 5. Spatial Fusion & Reassembly Layer                   │
│    - Tiled mask reassembly within spatial tolerances   │
│    - Vector polygonization (GeoJSON / Shapefile)       │
└────────────────────────────┬───────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│ 6. Deterministic Validation Layer                      │
│    - Schema validation & range sanity checks           │
│    - Aggregates authoritative metrics into JSON payload│
└────────────────────────────┬───────────────────────────┘
                             │ [Validated Structured Data]
                             ▼
┌────────────────────────────────────────────────────────┐
│ 7. Qwen 2.5 Natural-Language Reporting Module          │
│    - Factual ecological synthesis & executive summary  │
│    - Formatted Markdown / PDF export                   │
└────────────────────────────────────────────────────────┘
```

## 4. Source Directory Layout (`src/`)

```
src/
├── gis/             # Raster I/O, band handling, CRS preservation, tiling, reassembly
├── analytics/       # Deterministic NDVI formulas, area computations, summary statistics
├── models/          # U-Net and YOLOv8n-Seg model definitions and inference runners
├── validation/      # Schema enforcement, metric range checks, boundary validators
├── reporting/       # Qwen 2.5 prompt builder and inference integration
└── utils/           # Configuration loaders, logging utilities, path managers
```

## 5. Storage and Artifact Convention
- `data/raw/`: Raw ingested raster and vector data (gitignored).
- `data/processed/`: Preprocessed, tiled, or partitioned datasets (gitignored).
- `data/sample/`: Lightweight synthetic or sample data for unit and integration testing.
- `models/`: Checkpoints and serialized model weights (gitignored).
- `experiments/`: Experiment configurations, run metadata, metric logs, and notes.
- `configs/`: YAML configuration files for data, training, inference, and reporting.
