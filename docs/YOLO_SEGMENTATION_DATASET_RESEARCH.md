# GreenVision AI: YOLOv8-Seg Tree Crown Instance Segmentation Dataset Research

## 1. Executive Summary & Problem Formulation
The goal of the YOLOv8n-Seg component in GreenVision AI is **individual tree crown instance segmentation** (delineating precise crown perimeter polygons and isolating discrete individual trees).

### Critical Annotation Distinction
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ANNOTATION CATEGORY TAXONOMY                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Detection-Only (Bounding Boxes):                                         │
│    • Format: [xmin, ymin, xmax, ymax]                                       │
│    • Limitation: Cannot be converted into true tree crown perimeter masks.  │
│    • Example: NEON TreeEvaluation primary RGB benchmark.                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. True Instance Segmentation (Genuine Crown Polygons):                     │
│    • Format: [[x1, y1], [x2, y2], ..., [xn, yn]] per individual tree.       │
│    • Capability: Directly trains YOLOv8n-Seg instance segmentation heads.   │
│    • Examples: BAMFORESTS, Broadleaf Forest Dataset.                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. Pseudo-Labels (Automated / Weakly Supervised):                           │
│    • Format: Watershed segmentation from LiDAR or draped bounding boxes.    │
│    • Limitation: Carries segmentation artifacts; not pure ground truth.     │
│    • Example: DeepForest self-supervised crowns.                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. Semantic Vegetation Masks:                                               │
│    • Format: Binary pixel masks without instance separation.                │
│    • Capability: Trains U-Net semantic models; cannot train instance heads. │
│    • Examples: LandCover.ai, Chesapeake LULC.                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. In-Depth Analysis of NEON TreeEvaluation Annotations

A detailed technical audit of the **NeonTreeEvaluation** dataset (Weinstein et al., 2021) reveals:

* **Primary Ground Truth**: The standard benchmark annotations are **axis-aligned bounding boxes** stored in Pascal VOC XML and CSV formats across 22 NEON ecological sites.
* **Why Bounding Boxes Cannot Train YOLOv8-Seg**:
  * A bounding box defines only the bounding rectangle $[x_{\text{min}}, y_{\text{min}}, x_{\text{max}}, y_{\text{max}}]$.
  * Converting a bounding box into a 4-point rectangle (`[xmin, ymin, xmax, ymin, xmax, ymax, xmin, ymax]`) treats all four background corner areas (which often contain bare soil, shadows, roads, or neighboring tree leaves) as tree crown pixels.
  * Training YOLOv8-Seg on rectangular pseudo-polygons forces the instance mask head to predict rectangular masks, destroying its ability to delineate organic crown shapes.
* **NEON Polygon Data**: NEON includes LiDAR Canopy Height Model (CHM) watershed delineations (pseudo-labels) and a limited set of 424 field-annotated crowns across select evaluation plots. These are designed for multi-sensor benchmark scoring rather than large-scale instance segmentation training.
* **Explicit Conclusion on NEON**: **NeonTreeEvaluation is an outstanding benchmark for object detection (`YOLOv8-Detect`), but is INSUFFICIENT as the primary training dataset for `YOLOv8n-Seg` instance segmentation.**

---

## 3. Comparison of Candidate Instance Segmentation Datasets

| Dataset Name | Primary Category | Imagery & Resolution | Tree Instance Annotations | Georeferencing | License | Size | Suitability for RTX 3050 (4GB) | Primary Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BAMFORESTS** (Schiefer et al., 2020) | **True Instance Segmentation** | UAV RGB Orthomosaic (**0.05m – 0.10m GSD**) | **27,160 Manually Delineated Crown Polygons** (COCO format) | **Yes** (UTM GeoTIFF) | **CC BY 4.0** | ~3.5 GB | **Excellent** (Tiled to 640×640, batch size 8–16) | **Top Choice for YOLOv8n-Seg Training** |
| **Broadleaf Forest Dataset** (Takeshi et al., 2024) | **True Instance Segmentation** | UAV RGB Orthomosaic (**0.05m GSD**) | **18,507 Manually Delineated Crown Polygons** | **Yes** (UTM GeoTIFF) | **CC BY 4.0** | ~4.0 GB | **Excellent** (Tiled to 640×640) | Strong secondary / generalization dataset |
| **Haizhu Lake Urban Forest** (MDPI, 2024) | **True Instance Segmentation** | Multi-Temporal UAV RGB (**0.04m GSD**) | **47,754 Labeled Crown Polygons** (110 urban species) | **Yes** (GeoTIFF) | **Open Research** | ~6.0 GB | **Excellent** | Urban forestry instance segmentation |
| **NeonTreeEvaluation** (Weinstein et al., 2021) | **Detection-Only Benchmark** | Airborne RGB (**0.1m GSD**) | **~6,000+ Bounding Boxes** (VOC XML) | **Yes** (UTM GeoTIFF) | **CC BY 4.0** | ~10–25 GB | **Good** | Object Detection (`YOLOv8-Detect`) & Cross-Site Benchmark |
| **DeepForest Self-Supervised** | **Pseudo-Labels** | Airborne RGB (0.1m) | Automated LiDAR-watershed & model predictions | **Yes** | **MIT / CC BY** | Variable | Moderate | Pretraining / Semi-supervised only |
| **LandCover.ai** (Boguszewski et al.) | **Semantic Vegetation Mask** | Aerial RGB (0.25m – 0.50m) | Continuous Woodland raster masks (No individual crowns) | **Yes** (EPSG:2180) | **CC BY-NC-SA 4.0** | ~4.0 GB | **Excellent** | **U-Net Woodland Semantic Target** |
| **Chesapeake Land Cover** (Robinson et al.) | **Semantic Vegetation Mask** | 4-Band NAIP (0.6m – 1.0m) | 1m categorical Tree Canopy raster masks | **Yes** (UTM GeoTIFF) | **ODbL / CC0** | ~10–50 GB | **Excellent** | **U-Net & Deterministic NDVI** |

---

## 4. Ranked Shortlist for YOLOv8n-Seg

### 🥇 Rank 1: BAMFORESTS (Bamberg Forest Benchmark)
* **Provider**: Technical University of Munich / German Aerospace Center (DLR)
* **Why Ranked #1**:
  1. Contains **27,160 individually delineated tree crown polygons** across 105 hectares of UAV imagery.
  2. Native **COCO instance segmentation format** (`annotations.json`), which maps deterministically and losslessly to normalized YOLOv8-Seg polygon format (`class_id x1 y1 x2 y2 ... xn yn`).
  3. Covers mixed, coniferous, deciduous, and park tree species at ultra-high resolution ($0.05 - 0.10\text{ m/pixel}$).
  4. Fully permissive **CC BY 4.0** open-access license.
  5. Compact, modular dataset size ($\approx 3.5\text{ GB}$), easily managed on external storage.

### 🥈 Rank 2: Broadleaf Forest Dataset
* **Provider**: Takeshi et al. (Japan & Borneo)
* **Why Ranked #2**: Provides **18,507 manual crown polygons** in complex broadleaf canopies with high boundary precision. Excellent for verifying model generalization to dense closed canopies.

### 🥉 Rank 3: NeonTreeEvaluation Benchmark (Evaluation Role)
* **Provider**: Weecology / NEON
* **Role in GreenVision AI**: Retained specifically as a **detection evaluation benchmark** to test tree localization accuracy and counting precision across 22 ecological sites.

---

## 5. Conversion Protocol: COCO Polygons to YOLOv8-Seg TXT

BAMFORESTS COCO annotations are converted to normalized YOLOv8-Seg format using pure deterministic Python:

```python
def coco_polygon_to_yolo_seg(polygon_coords, img_width, img_height, class_id=0):
    """
    Converts COCO flat polygon coordinates [x1, y1, x2, y2, ...] to
    normalized YOLOv8-Seg format: class_id x1_norm y1_norm x2_norm y2_norm ...
    """
    normalized = []
    for i in range(0, len(polygon_coords), 2):
        x = polygon_coords[i] / img_width
        y = polygon_coords[i + 1] / img_height
        # Clamp to [0.0, 1.0] to guarantee validity
        x = max(0.0, min(1.0, x))
        y = max(0.0, min(1.0, y))
        normalized.extend([f"{x:.6f}", f"{y:.6f}"])
    return f"{class_id} " + " ".join(normalized)
```

---

## 6. Summary of Architectural Alignment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GREENVISION AI DATASET ALLOCATION                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. YOLOv8n-Seg (Tree Crown Instance Segmentation):                          │
│    • Primary Ground Truth: BAMFORESTS (27,160 genuine polygons, CC BY 4.0)  │
│    • Detection Benchmark: NEON TreeEvaluation (Bounding boxes)              │
│                                                                             │
│ 2. U-Net (Woodland Semantic Segmentation):                                  │
│    • Primary Ground Truth: LandCover.ai (0.25m woodland masks, CC BY-NC-SA) │
│    • 4-Band Validation: USDA NAIP + Chesapeake 1m Tree Canopy masks         │
│                                                                             │
│ 3. Deterministic NDVI Engine:                                               │
│    • USDA NAIP 4-Band GeoTIFFs (Physical Red Band 1 + NIR Band 4)           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*Research document completed. All distinctions between detection, true instance segmentation, pseudo-labels, and semantic masks verified.*
