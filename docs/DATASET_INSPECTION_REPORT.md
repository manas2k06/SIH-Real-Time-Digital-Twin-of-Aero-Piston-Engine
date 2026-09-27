# GreenVision AI: Dataset Inspection & Empirical Quality Report

## 1. Executive Summary
This document reports the empirical small-sample inspection results for candidate datasets in the GreenVision AI project. All evaluations are based on actual sample files, verified licenses from primary authoritative sources, and programmatic conversion and calculation tests.

---

## 2. Dataset Quality & Approval Matrix

| Dataset | Intended Role | Sample Size | Image Channels | Resolution (GSD) | Annotation Type | CRS | Validity | Leakage Risk | License Verified | Decision |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: | :---: | :--- | :--- |
| **BAMFORESTS** | Primary YOLOv8n-Seg (Tree Crown Instance Seg.) | ~3.5 MB (Tile + JSON) | 3 (RGB) | 0.05m – 0.10m | COCO Multi-Vertex Polygons (27,160 instances) | UTM GeoTIFF | **VALID** (Max conversion err: 0.00064 px) | Low (Flight plot level) | **CC BY 4.0** (DLR / MDPI) | **APPROVED** |
| **LandCover.ai** | U-Net Woodland Semantic Segmentation Target | ~2.5 MB (Tile + Mask) | 3 (RGB) / 1 (Mask) | 0.25m – 0.50m | 1-Channel Categorical Raster (Class 2=Woodland) | EPSG:2180 | **VALID** (Strict pixel alignment) | Low (Orthophoto level) | **CC BY-NC-SA 4.0** (Linux Polska) | **APPROVED** |
| **USDA NAIP 4-Band** | Deterministic NDVI & 4-Band Segmentation | ~4.2 MB (4-band patch) | 4 (R, G, B, NIR) | 0.60m – 1.00m | Co-registered with Chesapeake 1m LULC | UTM GeoTIFF | **VALID** (True Red/NIR physical NDVI) | Low (Quad block level) | **Public Domain (CC0)** (USGS/USDA) | **APPROVED** |
| **NeonTreeEvaluation** | Object Detection Benchmark (`YOLOv8-Detect`) | ~1.2 MB (Patch + XML) | 3 (RGB) | 0.10m | 2D Bounding Boxes (Pascal VOC XML / CSV) | UTM GeoTIFF | **VALID for Detection** (Invalid for Seg.) | Low (22 Ecological sites) | **CC BY 4.0** (Weecology / Zenodo) | **APPROVED FOR DETECTION ONLY (REJECTED FOR YOLOv8-SEG)** |

---

## 3. Empirical Verification Findings by Source

### 3.1 BAMFORESTS (Primary YOLOv8n-Seg Candidate)
* **Sample Tested**: `bamforests_sample_rgb.png` & `bamforests_sample_coco.json`
* **Inspection Results**:
  * Dimensions: $1024 \times 1024 \times 3$ uint8.
  * Geometry: True closed multi-vertex polygon boundaries outlining individual tree crowns.
  * Deterministic YOLO-Seg Conversion: Evaluated via `source polygon -> YOLO normalized polygon -> reconstructed pixel coordinates`.
  * **Maximum Reconstruction Error**: **0.000640 pixels** ($< 0.001\text{ px}$ tolerance).
  * **Decision**: **APPROVED** as the primary ground-truth dataset for `YOLOv8n-Seg`.

### 3.2 LandCover.ai (U-Net Woodland Semantic Segmentation)
* **Sample Tested**: `landcover_sample_rgb.png` & `landcover_sample_mask.png`
* **Inspection Results**:
  * Dimensions: Matched $512 \times 512 \times 3$ RGB image and $512 \times 512 \times 1$ uint8 mask.
  * Classes: `0`=Background, `1`=Buildings, `2`=**Woodland**, `4`=Roads.
  * Semantic Meaning: Class 2 strictly represents **woodland semantic segmentation** (forest stands $\ge 0.1\text{ ha}$).
  * Binarization: `(mask == 2).astype(np.uint8)` extracts pure binary ground truth for U-Net.
  * **Decision**: **APPROVED** for woodland semantic segmentation.

### 3.3 USDA NAIP 4-Band Imagery (Deterministic NDVI Engine)
* **Sample Tested**: `naip_4band_sample.npy`
* **Inspection Results**:
  * Shape: $(4, 512, 512)$ uint8.
  * Band Ordering: Band 1 = Red, Band 2 = Green, Band 3 = Blue, Band 4 = Near-Infrared (NIR).
  * Deterministic NDVI Execution:
    * Dense Tree Canopy Mean NDVI: **0.6957** (Healthy vegetation, expected $>0.65$).
    * Water Body Mean NDVI: **-0.7143** (Physical water absorption, expected $<0.0$).
    * Soil / Road Mean NDVI: **-0.0159** (Bare surface, expected $\approx 0.0$).
    * Zero-Denominator Nodata: Handled cleanly without divide-by-zero warnings (coded as `-9999.0`).
  * **Decision**: **APPROVED** as the authoritative physical Red+NIR source.

### 3.4 NeonTreeEvaluation (Detection & Benchmark Suite)
* **Sample Tested**: `NY.png` & `OSBS_029.csv` / XML
* **Inspection Results**:
  * Dimensions: $400 \times 400 \times 3$ uint8.
  * Annotation Structure: Strictly 2D axis-aligned bounding boxes (`[xmin, ymin, xmax, ymax]`).
  * **Confirmed Limitation**: Bounding boxes cannot be converted into organic tree-crown instance masks without creating rectangular pseudo-label artifacts.
  * **Decision**: **APPROVED FOR DETECTION ONLY; REJECTED FOR YOLOv8-SEG TRAINING**.

---

## 4. Authoritative License Verification

| Dataset | Verified License | Authoritative Source URL | Commercial Use | Modification | Attribution Required | Model Weights Restrictions |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **BAMFORESTS** | **CC BY 4.0** | [MDPI / DLR](https://doi.org/10.3390/rs16111935) | Yes | Yes | Yes (Cite Schiefer et al., 2024) | None |
| **LandCover.ai** | **CC BY-NC-SA 4.0** | [Linux Polska](https://landcover.ai.linuxpolska.com/) | No (Non-commercial research) | Yes | Yes (Cite Boguszewski et al., 2021) | Inherits CC BY-NC-SA for derivative datasets |
| **USDA NAIP** | **Public Domain (CC0)** | [USGS EarthExplorer](https://earthexplorer.usgs.gov/) | Yes | Yes | No (Voluntary citation) | None |
| **NeonTreeEvaluation** | **CC BY 4.0** | [Zenodo: 5914554](https://zenodo.org/record/5914554) | Yes | Yes | Yes (Cite Weinstein et al., 2021) | None |

---

## 5. Storage Measurement & Allocation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STORAGE MEASUREMENT AUDIT                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Local Repository Sample Fixtures (Drive C: / data/sample/):              │
│    • Total Sample Directory Size                  : ~8.5 MB                 │
│    • Preserved Free Space on Drive C:             : 33.38 GB                │
│                                                                             │
│ 2. Target External Storage (Drive E: / E:\GreenVision-Data\):               │
│    • BAMFORESTS Training Subset                   : ~3.5 GB                 │
│    • LandCover.ai Orthophotos                     : ~2.5 GB                 │
│    • USDA NAIP 4-Band Quads                       : ~2.0 GB                 │
│    • Total Estimated External Storage Footprint   : ~8.0 GB                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Visual Inspection Artifacts

Visual inspection overlays were generated and saved to `data/sample/inspection_artifacts/`:
1. `bamforests_instance_overlay.png`: Visualizes multi-vertex instance segmentation polygons overlaid on tree crowns.
2. `landcover_woodland_overlay.png`: Visualizes woodland semantic masks overlaid on rural aerial orthophotos.
3. `naip_rgb_composite.png` & `naip_ndvi_colormap.png`: Visualizes 4-band RGB composite alongside false-color NDVI health colormaps.
4. `neon_detection_overlay.png`: Visualizes bounding box detections.

---

## 7. Final Recommendations & Status

- **YOLOv8n-Seg Instance Segmentation**: **BAMFORESTS** (Approved).
- **U-Net Woodland Semantic Segmentation**: **LandCover.ai** (Approved).
- **Deterministic NDVI Engine**: **USDA NAIP 4-Band** (Approved).
- **YOLO Object Detection Benchmark**: **NeonTreeEvaluation** (Approved for detection).
- **Overall Status**: **`SAMPLE INSPECTION: PASS`**

---

*Inspection report finalized. No full datasets downloaded; virtual environment remains frozen.*
