# GreenVision AI: Data Requirements & Ingestion Specification

## 1. Executive Summary
This document establishes the comprehensive data requirements, spectral specifications, annotation standards, geospatial metadata requirements, and spatial leakage prevention strategies across all GreenVision AI pipeline components.

---

## 2. Component-by-Component Data Requirements Matrix

| Pipeline Component | Required Spectral Bands | Minimum Spatial Resolution (GSD) | Spatial Georeferencing | Required Annotation / Ground Truth Format | RGB-Only Viability |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **YOLOv8n-Seg** (Tree Detection & Instance Segmentation) | Red, Green, Blue (RGB) *(NIR optional for enhanced canopy contrast)* | **$\le 0.1 - 0.3\text{ m/pixel}$** (High-res UAV / Aerial) | **Mandatory** for spatial GIS export; Optional for pure pixel-space training | Normalized polygon coordinate TXT files (`class x1 y1 x2 y2 ... xn yn`) | **Sufficient**: RGB aerial imagery at high resolution is sufficient for visual tree canopy delineation. |
| **U-Net** (Semantic Canopy Segmentation) | Red, Green, Blue (RGB) or 4-Band (RGB + NIR) | **$\le 0.2 - 0.5\text{ m/pixel}$** (UAV / High-res Satellite) | **Mandatory** for spatial reassembly & area computation | 2D Binary / Class Mask Rasters (`.png` / `.tif`, $0=\text{Background}, 1=\text{Canopy}$) or GeoJSON vector polygons | **Sufficient**: RGB imagery is sufficient for green canopy semantic segmentation; NIR adds spectral separability. |
| **NDVI Engine** (Deterministic Vegetation Index) | **Near-Infrared (NIR) & Red** | **$\le 0.5 - 10\text{ m/pixel}$** (Multispectral UAV / Sentinel-2 / Planet) | **Mandatory** (Pixel alignment with CRS & affine transform) | **None required** (Deterministic mathematical computation: $\frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}$) | **IMPOSSIBLE**: NDVI **cannot** be computed from RGB imagery without a true physical NIR band. |
| **Spatial Fusion & GIS Analysis** | Derived from upstream components | Native to input imagery | **Mandatory** (Consistent CRS, affine matrix, pixel bounds) | Georeferenced vector boundaries (GeoJSON / Shapefile) | Dependent on upstream imagery. |
| **Qwen 2.5 Reporting** | None (Consumes structured JSON metrics) | N/A | Metadata only (CRS name, acquisition date, bounding box) | Validated JSON Schema (`ValidatedGreenVisionReport`) | Consumes structured data. |

---

## 3. Spectral Requirements & Band Authority

### 3.1 Near-Infrared (NIR) vs. RGB Authority
1. **NDVI Inviolability**:
   - NDVI is mathematically defined as:
     $$\text{NDVI} = \frac{\rho_{\text{NIR}} - \rho_{\text{Red}}}{\rho_{\text{NIR}} + \rho_{\text{Red}}}$$
   - **Crucial Rule**: NDVI **strictly requires** a physical Near-Infrared band (typically $750\text{ nm} - 900\text{ nm}$).
   - Synthetic or pseudo-vegetation indices derived solely from RGB (such as VARI or GLI) are **not** NDVI and must not be misrepresented as NDVI.
   - If a dataset lacks a physical NIR channel, NDVI computation is **marked as impossible and disabled** for that dataset.
2. **Unified 4-Band (R-G-B-NIR) Ingestion**:
   - The ideal input source supporting YOLOv8n-Seg, U-Net, and NDVI concurrently is a **4-band multispectral GeoTIFF** (Band 1: Red, Band 2: Green, Band 3: Blue, Band 4: Near-Infrared) at sub-meter spatial resolution.
   - When 4-band imagery is ingested:
     - Bands 1–3 (RGB) or 1–4 are fed into YOLO / U-Net for detection and canopy segmentation.
     - Bands 4 & 1 (NIR & Red) are fed into the deterministic NDVI engine.

---

## 4. Geospatial & Metadata Requirements

### 4.1 Georeferencing & Orthorectification
- **Orthorectification**: Mandatory for all raw aerial/satellite survey data to remove terrain distortion and ensure geometric area fidelity.
- **Coordinate Reference System (CRS)**:
  - Must be explicitly defined via EPSG codes (e.g., Projected Coordinate Systems: UTM zones like `EPSG:32633`, or Geographic: `EPSG:4326`).
  - Projected Coordinate Systems (meters) are required for precise physical canopy area ($m^2$) and tree density calculations.
- **Affine Geotransform Matrix**:
  - Every raster tile must maintain its affine transform:
    $$\begin{bmatrix} X_{\text{geo}} \\ Y_{\text{geo}} \end{bmatrix} = \begin{bmatrix} c & a \\ f & d \end{bmatrix} \begin{bmatrix} X_{\text{pixel}} \\ Y_{\text{pixel}} \end{bmatrix} + \begin{bmatrix} e \\ b \end{bmatrix}$$
  - Tiling algorithms must calculate the exact sub-window affine transform to ensure that reconstructed tiles exhibit **no unintended spatial drift**.

---

## 5. Annotation & Label Specifications

### 5.1 YOLOv8n-Seg (Instance Segmentation)
- **Format**: Standard Ultralytics YOLO segmentation text files (`<image_name>.txt`).
- **Structure**: Each row represents one tree instance:
  ```text
  <class_id> <x1> <y1> <x2> <y2> <x3> <y3> ... <xn> <yn>
  ```
  where coordinates are normalized to $[0.0, 1.0]$ relative to the tile dimensions.
- **Classes**: Class 0 = `tree_canopy`.

### 5.2 U-Net (Semantic Segmentation)
- **Format**: Single-channel binary raster masks (`.png` or single-band `.tif`).
- **Pixel Values**: `0` = Background / Non-vegetated, `1` = Tree / Canopy Cover, `255` = Nodata / Ignore.
- **Dimensions**: Matched 1:1 to image tile dimensions (e.g., $512 \times 512$ or $640 \times 640$).

---

## 6. Recommended Dataset Directory Organization

To ensure complete modularity, datasets must follow this standardized filesystem layout:

```
data/
├── raw/                                # Raw un-tiled survey imagery (gitignored)
│   ├── scene_01_orthomosaic.tif
│   └── scene_01_annotations.geojson
├── processed/                          # Processed & spatially partitioned tiles (gitignored)
│   ├── metadata.json                   # Provenance and split assignment records
│   ├── yolo/                           # Ultralytics directory format
│   │   ├── train/ (images/, labels/)
│   │   ├── val/   (images/, labels/)
│   │   └── test/  (images/, labels/)
│   └── unet/                           # Semantic segmentation format
│       ├── train/ (images/, masks/)
│       ├── val/   (images/, masks/)
│       └── test/  (images/, masks/)
└── sample/                             # Lightweight synthetic test fixtures (<500 MB, tracked)
    ├── sample_multispectral_patch.tif
    ├── sample_canopy_mask.png
    └── sample_tree_labels.txt
```

---

## 7. Spatial Data Leakage Prevention Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   GEOGRAPHIC SPATIAL BLOCK PARTITIONING                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Scene Region A: Train Split]    [Buffer Zone]    [Scene Region B: Test]   │
│  ┌─────────┐ ┌─────────┐                           ┌─────────┐ ┌─────────┐  │
│  │ Tile A1 │ │ Tile A2 │        (Minimum 50m       │ Tile B1 │ │ Tile B2 │  │
│  └─────────┘ └─────────┘         Separation)       └─────────┘ └─────────┘  │
│  ┌─────────┐ ┌─────────┐                           ┌─────────┐ ┌─────────┐  │
│  │ Tile A3 │ │ Tile A4 │                           │ Tile B3 │ │ Tile B4 │  │
│  └─────────┘ └─────────┘                           └─────────┘ └─────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.1 Leakage Prevention Directives
1. **Forbidden**: Naive random shuffling of image tiles across train/val/test splits. Contiguous tiles share spatial autocorrelation and spectral similarity, resulting in inflated evaluation metrics.
2. **Mandatory**: Spatial block holdout splitting.
   - Large survey scenes must be divided into contiguous geographic spatial blocks.
   - Entire blocks (or distinct separate flight paths/scenes) are assigned exclusively to `train`, `val`, or `test`.
   - A spatial buffer zone (minimum $50\text{ meters}$) must be maintained between training and test block boundaries where applicable.

---

## 8. Storage & Compute Budget Considerations

* **Tile Dimensions**: Configurable via YAML ($512 \times 512$ or $640 \times 640$ pixels).
* **Storage Footprint**:
  * Raw sample scene ($10,000 \times 10,000$ pixels, 4-band Float32): $\approx 1.5\text{ GB}$.
  * Ingested active development dataset: Restricted to **$3.0 - 5.0\text{ GB}$** on Drive `C:` to preserve the remaining $33\text{ GB}$ free disk buffer.
  * Intermediate tiled patches must use uint8 / uint16 compression (`TILED=YES`, `COMPRESS=DEFLATE`).

---

## 9. Assumptions & Unresolved Decisions

1. **Assumptions**:
   - Operational datasets will provide calibrated top-of-atmosphere or surface reflectance for accurate NDVI computation.
   - High-resolution drone imagery will have Ground Sample Distance $\le 0.15\text{ m/pixel}$ to resolve individual tree canopies.
2. **Unresolved Decisions (TBD Post-Dataset Inspection)**:
   - Optimal tile overlap stride ($10\% - 25\%$) to be benchmarked during sliding window inference in Milestone M1.
   - Multi-class canopy taxonomy (single class `tree` vs. multi-class `tree_dense`, `tree_sparse`, `shrub`) to be determined upon inspecting target annotation datasets.
