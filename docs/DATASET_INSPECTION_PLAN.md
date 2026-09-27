# GreenVision AI: Dataset Inspection Plan (Small-Sample Audit)

## 1. Objective & Scope
The objective of this stage is **Small-Sample Inspection Only**. It establishes the technical verification protocol to audit individual sample files from each shortlisted candidate dataset before any large-scale downloads or preprocessing pipelines are initiated.

### Strict Governance Constraints
- ❌ Do **not** download complete datasets.
- ❌ Do **not** train any machine learning models.
- ❌ Do **not** modify the validated Python virtual environment.
- ❌ Do **not** preprocess full-scene datasets.
- 💾 Only inspect single-file small samples ($< 50\text{ MB}$ per candidate).

---

## 2. Detailed Inspection Specifications by Candidate Source

### 2.1 Candidate A1: BAMFORESTS (YOLOv8n-Seg Instance Segmentation Candidate)
* **Target Sample**: A single high-resolution UAV RGB image tile and corresponding COCO format JSON annotation record.
* **Inspection Checklist**:
  1. **Image File**: Confirm file format (`.tif` / `.png`).
  2. **Image Dimensions**: Height $\times$ Width (e.g., $1024 \times 1024$ pixels).
  3. **Number of Channels**: Verify exactly 3 channels (R, G, B).
  4. **Data Type (dtype)**: Verify `uint8` ($[0, 255]$).
  5. **Coordinate Reference System (CRS)**: Extract EPSG projection code.
  6. **Affine Geotransform**: Verify $(a, b, c, d, e, f)$ matrix coefficients.
  7. **Spatial Resolution (GSD)**: Confirm pixel size $\approx 0.05 - 0.10\text{ m/pixel}$.
  8. **Annotation Geometry Type**: Verify presence of **genuine polygon vertices** (`segmentation: [[x1, y1, x2, y2, ...]]`), not just bounding boxes.
  9. **Object Count in Sample**: Count total individual tree crowns.
  10. **Polygon Validity**: Verify that polygon vertices define closed, non-self-intersecting planar boundaries.
  11. **YOLO-Seg Conversion Determinism**: Verify mapping from COCO polygon coordinates to normalized YOLO instance segmentation format:
      $$\text{class\_id } \frac{x_1}{W} \frac{y_1}{H} \frac{x_2}{W} \frac{y_2}{H} \dots \frac{x_n}{W} \frac{y_n}{H}$$

---

### 2.2 Candidate A2: NeonTreeEvaluation (YOLO Detection & Evaluation Benchmark)
* **Target Sample**: A single RGB orthophoto patch (e.g., `HARV_001.tif`) and corresponding Pascal VOC XML annotation file (`HARV_001.xml`).
* **Inspection Checklist**:
  1. **Image Dimensions & Channels**: Confirm $400 \times 400$ px, 3-channel RGB, uint8.
  2. **Annotation Format**: Confirm XML structure contains `<bndbox>` with `<xmin>`, `<ymin>`, `<xmax>`, `<ymax>`.
  3. **Role Demarcation**: Confirm that NEON XML annotations represent **2D bounding boxes suitable for object detection (`YOLOv8-Detect`)**, and explicitly confirm they are **not** genuine tree-crown instance segmentation masks.

---

### 2.3 Candidate B: LandCover.ai (U-Net Woodland Semantic Segmentation Candidate)
* **Target Sample**: A single orthophoto tile (e.g., `N-33-60-D-c-4-2.tif`) and corresponding mask file (`N-33-60-D-c-4-2_m.tif`).
* **Inspection Checklist**:
  1. **Image & Mask Dimensions**: Confirm matched dimensions (e.g., $9000 \times 9500$ px or tiled $512 \times 512$ px).
  2. **Number of Channels**: Image = 3 (RGB), Mask = 1 (Single-channel categorical).
  3. **Data Types**: Image = `uint8`, Mask = `uint8`.
  4. **CRS & Georeferencing**: Confirm `EPSG:2180` (Poland CS92).
  5. **Affine Geotransform**: Verify pixel-to-meter resolution ($0.25\text{ m/pixel}$ or $0.50\text{ m/pixel}$).
  6. **Mask Class IDs**:
     - `0`: Unclassified / Background
     - `1`: Buildings
     - `2`: **Woodland** (Cartographic forest stands & wooded areas $\ge 0.1\text{ ha}$)
     - `3`: Water
     - `4`: Roads
  7. **Woodland Semantic Suitability**: Confirm that binarizing Class ID `2` (`mask == 2`) yields clean ground-truth masks for **woodland semantic segmentation**.

---

### 2.4 Candidate C: USDA NAIP 4-Band Imagery (NDVI & 4-Band Segmentation)
* **Target Sample**: A single 4-band NAIP Quarter-Quad GeoTIFF tile ($0.6\text{ m}$ GSD).
* **Inspection Checklist**:
  1. **Band Count & Identification**: Verify exactly 4 channels.
  2. **Band Ordering Verification**:
     - Band 1: Red ($600 - 700\text{ nm}$)
     - Band 2: Green ($500 - 600\text{ nm}$)
     - Band 3: Blue ($400 - 500\text{ nm}$)
     - Band 4: **Near-Infrared (NIR)** ($750 - 900\text{ nm}$)
  3. **Data Type & Dynamic Range**: Verify `uint8` ($[0, 255]$ digital numbers).
  4. **CRS & Spatial Metadata**: Confirm Projected UTM CRS with explicit meter units.
  5. **Co-Registration**: Confirm that Band 1 (Red) and Band 4 (NIR) are pixel-aligned on the identical spatial grid.
  6. **NDVI Formula Viability**: Confirm calculation executes without error:
     $$\text{NDVI} = \frac{\text{Band 4} - \text{Band 1}}{\text{Band 4} + \text{Band 1} + 10^{-7}} \in [-1.0, 1.0]$$

---

## 3. Machine-Readable Inspection Result Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GreenVisionDatasetInspectionResult",
  "type": "object",
  "required": [
    "dataset_name",
    "sample_file",
    "image_dimensions",
    "channel_count",
    "dtype",
    "spatial_resolution_gsd",
    "crs",
    "annotation_type",
    "is_true_instance_polygon",
    "ndvi_feasible",
    "verification_status"
  ],
  "properties": {
    "dataset_name": { "type": "string" },
    "sample_file": { "type": "string" },
    "image_dimensions": {
      "type": "array",
      "items": { "type": "integer" }
    },
    "channel_count": { "type": "integer" },
    "dtype": { "type": "string" },
    "spatial_resolution_gsd": { "type": "number" },
    "crs": { "type": "string" },
    "has_valid_affine": { "type": "boolean" },
    "annotation_type": { "type": "string", "enum": ["instance_polygon", "bounding_box", "semantic_raster_mask", "none"] },
    "is_true_instance_polygon": { "type": "boolean" },
    "annotation_count": { "type": "integer" },
    "ndvi_feasible": { "type": "boolean" },
    "verification_status": { "type": "string", "enum": ["PASS", "FAIL"] },
    "notes": { "type": "string" }
  }
}
```

---

## 4. Key Questions & Verification Answers

| Core Research Question | Preliminary Verification Assessment | Transformation Required |
| :--- | :--- | :--- |
| **1. Can BAMFORESTS be converted to YOLOv8n-Seg?** | **YES**. COCO polygon vertices convert deterministically to normalized YOLO instance segmentation polygon format (`class x1 y1 ... xn yn`). | COCO JSON $\rightarrow$ YOLO segmentation `.txt`. |
| **2. Can NEON be converted to YOLOv8n-Seg?** | **NO for segmentation / YES for detection**. NEON primary annotations are bounding boxes (`xmin, ymin, xmax, ymax`). They can train `YOLOv8-Detect`, but cannot be converted to genuine crown masks. | Pascal VOC XML $\rightarrow$ YOLO detection `.txt` (`class x y w h`). |
| **3. Can LandCover.ai provide a woodland target?** | **YES**. Class ID `2` ("Woodland") isolates continuous forest stands and woodland cover for binary semantic segmentation. | Binarizer: `binary_mask = (mask == 2).astype(np.uint8)`. |
| **4. Can NAIP provide genuine Red + NIR for NDVI?** | **YES**. Band 4 (NIR) and Band 1 (Red) are physically measured optical channels co-registered on the same grid. | Direct array slice: `nir = img[3]`, `red = img[0]`. |
| **5. Are geospatial metadata sufficient for spatial fusion?** | **YES**. All candidate sources include standard GeoTIFF spatial metadata and EPSG projections. | Re-projection layer: Align layers to common target UTM EPSG. |

---

*Inspection plan updated with strict distinction between detection bounding boxes and instance segmentation polygons.*
