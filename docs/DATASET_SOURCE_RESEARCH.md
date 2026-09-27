# GreenVision AI: Dataset Source Research & Candidate Evaluation

## 1. Executive Summary
This document provides a verified research audit of candidate remote sensing datasets for GreenVision AI. It establishes the technical boundaries across the four core pipeline capabilities:
1. **YOLOv8n-Seg**: High-resolution individual tree detection and **genuine instance segmentation** (requires true crown polygon boundaries, not bounding boxes).
2. **U-Net**: Semantic segmentation of **woodland / continuous canopy cover**.
3. **NDVI Engine**: Deterministic vegetation health index requiring physical Red + Near-Infrared (NIR) bands.
4. **Geospatial Analysis**: Spatial reassembly, area estimation, and coordinate integrity.

---

## 2. Comprehensive Candidate Dataset Matrix

| Dataset / Source | Provider & Location | Imagery Type | Bands & GSD | Georeferencing / CRS | Annotation Type & Geometry | NDVI Feasibility | License & Usage | Approximate Raw Size | Primary Suitability | Major Limitations |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NeonTreeEvaluation** | Weecology / NEON (22 sites across USA) | Airborne RGB + Hyperspectral + LiDAR | **RGB (0.1m)** + Hyperspectral (1m) | **Yes** (UTM GeoTIFF) | **Bounding Boxes (Pascal VOC XML & CSV)**; ~6,000+ image boxes, 424 field boxes | **Feasible** via co-registered hyperspectral | **CC BY 4.0** (Open Access with attribution) | ~10–25 GB (Zenodo: 5914554) | **YOLO Detection Benchmark** | **Bounding boxes only**; cannot be converted to genuine tree-crown instance segmentation masks |
| **BAMFORESTS** | TU Munich / DLR (Bamberg, Germany, 105 ha) | Very-High-Res UAV Orthomosaics | **3-band RGB (0.05m – 0.10m)** + DSM | **Yes** (UTM GeoTIFF) | **27,160 Individual Tree Crown Polygons (COCO format)** | **IMPOSSIBLE** (RGB only) | **CC BY 4.0** (Open Access) | ~3.5 GB (Modular tiles) | **YOLOv8n-Seg Instance Segmentation** | High-density broadleaf overlap in complex stands |
| **Broadleaf Forest Dataset** | Takeshi et al. (Japan & Borneo) | UAV Orthomosaics | **3-band RGB (0.05m)** | **Yes** (UTM GeoTIFF) | **18,507 Manually Delineated Crown Polygons** | **IMPOSSIBLE** (RGB only) | **CC BY 4.0** | ~4.0 GB | **YOLOv8n-Seg Instance Segmentation** | Complex tropical/temperate broadleaf canopy |
| **LandCover.ai** | Linux Polska (Poland, 216 km²) | High-Res Aerial Orthophotos | **3-band RGB (0.25m – 0.50m)** | **Yes** (EPSG:2180 GeoTIFF) | **Dense Semantic Pixel Masks** (Classes: 1=Building, 2=Woodland, 3=Water, 4=Road) | **IMPOSSIBLE** (No physical NIR band) | **CC BY-NC-SA 4.0** (Non-commercial research) | ~1.5 GB comp. / ~4.0 GB raw | **U-Net Woodland Semantic Target** | RGB-only; "Woodland" class follows cartographic definition ($\ge 0.1$ ha), not individual trees |
| **USDA NAIP Imagery (Paired with Chesapeake LULC)** | USDA FSA / Chesapeake Conservancy (USA) | 4-Band Airborne NAIP Orthophotos + 1m LULC Labels | **4-band RGB + NIR (0.6m – 1.0m)** for NAIP; 1-band categorical for LULC | **Yes** (UTM GeoTIFF) | **1m Categorical Semantic Raster Masks** (Class 2=Tree Canopy) | **EXCELLENT** (NAIP provides true measured NIR + Red) | **Public Domain (CC0)** for NAIP / **ODbL** for LULC | ~10–50 GB (Modular county tiles) | **U-Net & NDVI** (Shared 4-band baseline) | Must pair 4-band NAIP imagery with separate LULC label rasters; no instance labels |
| **Copernicus Sentinel-2** | European Space Agency (Global) | Satellite Multispectral | **13 bands (10m Red/NIR)** | **Yes** (UTM / WGS84) | None (Raw multispectral) | **EXCELLENT** (Macro NDVI) | **Copernicus Open Access** | Modular per granule | **Regional Macro-NDVI** | 10m GSD is far too coarse for individual tree crowns |

---

## 3. Critical Technical Distinctions

### 3.1 Detection vs. Instance Segmentation (NEON vs. BAMFORESTS)
1. **NEON TreeEvaluation Primary Annotations**:
   - The primary annotations in the NeonTreeEvaluation benchmark are **2D axis-aligned bounding boxes** stored in Pascal VOC XML and CSV formats.
   - **Critical Fact**: Bounding boxes represent the spatial extents of tree crowns and are suitable for **object detection (`YOLOv8-Detect`)**. They **cannot** be deterministically converted into genuine tree-crown polygon masks.
   - Converting bounding boxes into 4-point rectangles or rasterizing them as solid boxes produces rectangular pseudo-masks that teach segmentation models incorrect crown boundaries and background false-positives.
   - NEON also provides LiDAR-derived watershed pseudo-polygons and a small subset of 424 field-annotated crowns, but these are evaluation benchmarks rather than exhaustive training ground truth for instance segmentation.
2. **Genuine Instance Segmentation Datasets**:
   - Datasets such as **BAMFORESTS** (27,160 manually delineated crown polygons in COCO format) and the **Broadleaf Forest Dataset** (18,507 manual crown polygons) provide true polygon vertices following physical tree-crown perimeters.
   - These are required to train `YOLOv8n-Seg` for genuine crown boundary delineation.

### 3.2 LandCover.ai Label Semantics (Woodland Semantic Target)
- LandCover.ai annotations represent a **cartographic woodland semantic segmentation target**, defined according to Polish surveying standards (forest stands, groves, and wooded land $\ge 0.1\text{ ha}$).
- It is an ideal benchmark for training U-Net to segment continuous woodland and forest cover, but it is **not** a biological micro-canopy or individual tree crown dataset.

### 3.3 Chesapeake LULC vs. USDA NAIP (Imagery vs. Label Distinction)
- The **Chesapeake Bay Land Cover product** is a **single-channel categorical label raster** (1m GSD, Class 2 = Tree Canopy). It contains no spectral reflectance data.
- The **USDA NAIP imagery** is a **4-band aerial orthomosaic** (Bands: 1=Red, 2=Green, 3=Blue, 4=Near-Infrared).
- To train 4-band U-Net models or calculate physical NDVI, the NAIP 4-band GeoTIFFs must be ingested and paired with the co-registered Chesapeake LULC raster masks.

### 3.4 Physical NDVI vs. Color Approximations
- **True Physical NDVI**: Calculated exclusively from physical Near-Infrared (Band 4) and Red (Band 1) optical measurements:
  $$\text{NDVI} = \frac{\text{Band 4} - \text{Band 1}}{\text{Band 4} + \text{Band 1}}$$
- **RGB Approximations** (e.g., VARI, GLI): Mathematical color ratios that do not measure physical cellular chlorophyll scattering in the NIR spectrum ($750 - 900\text{ nm}$). **They must never be represented as NDVI.**
- **NDVI Disabled / Impossible**: LandCover.ai and BAMFORESTS (strictly 3-band RGB).

---

## 4. Architectural Strategy & Dataset Allocation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VERIFIED DATASET ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. YOLOv8n-Seg Instance Segmentation Pipeline:                              │
│    • Primary Training: BAMFORESTS (27,160 genuine crown polygons, CC BY 4.0)│
│    • Detection Benchmark: NEON TreeEvaluation (Bounding boxes, CC BY 4.0)   │
│                                                                             │
│ 2. U-Net Woodland Semantic Segmentation Pipeline:                           │
│    • Primary Training: LandCover.ai (0.25m RGB woodland masks, CC BY-NC-SA) │
│    • 4-Band Validation: Paired 4-band NAIP + Chesapeake 1m Tree Canopy      │
│                                                                             │
│ 3. Deterministic NDVI Health Analytics Engine:                              │
│    • USDA NAIP 4-Band (True Red Band 1 + NIR Band 4 at 0.6m–1.0m)            │
│                                                                             │
│ 4. Integrated End-to-End Demonstration Scene:                               │
│    • Sample 4-band NAIP scene for full spatial fusion & Qwen reporting      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Storage Strategy & Target Location

* **Drive `C:` Isolation**:
  * Drive `C:` remains strictly reserved for repository source code, the virtual environment, and lightweight sample fixtures in `data/sample/` ($< 500\text{ MB}$).
* **External Storage Target**:
  * Full raw datasets, tiled training sets, and model checkpoints must reside on external storage:
    * Primary path: `E:\GreenVision-Data\` (or configurable `data_root: E:/GreenVision-Data/`).
  * Estimated Raw Storage Footprint:
    * BAMFORESTS subset: $\approx 3.5\text{ GB}$
    * LandCover.ai: $\approx 2.5\text{ GB}$
    * NAIP 4-band sample quads: $\approx 2.0\text{ GB}$
    * **Total Initial Storage Budget**: $\approx 8.0\text{ GB}$ on external storage.
