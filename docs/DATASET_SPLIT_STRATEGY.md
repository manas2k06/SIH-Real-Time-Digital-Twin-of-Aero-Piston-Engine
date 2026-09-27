# GreenVision AI: Dataset Split & Spatial Leakage Prevention Strategy

## 1. Executive Principle
In remote sensing and spatial computer vision, **random tile-level splitting across contiguous scenes causes severe spatial autocorrelation leakage**, artificially inflating model evaluation metrics and masking poor generalization. 

To ensure rigorous, scientifically valid evaluation, GreenVision AI mandates **Geographic / Group-Level Partitioning** across all datasets.

---

## 2. Dataset-by-Dataset Split Strategy

### 2.1 BAMFORESTS (YOLOv8n-Seg Instance Segmentation)
* **Natural Spatial Hierarchy**:
  - The BAMFORESTS benchmark covers 105 hectares across distinct forest management compartments, urban parks, and discrete UAV flight acquisitions in the Bamberg region.
* **Leakage-Safe Partitioning Strategy**:
  - **Level of Partitioning**: **Discrete Flight Plot / Compartment Level** (Highest geographic group level).
  - **Allocation**:
    - **Training Split (70%)**: Compartments representing mixed forest stands and urban park scenes.
    - **Validation Split (15%)**: Disjoint forest compartment with separate spatial boundary.
    - **Test Split (15%)**: Entirely holdout geographic plot with zero contiguous spatial border to training plots.
  - **Buffer Constraint**: Minimum $50\text{ meters}$ geographic buffer between training and test plot boundaries.

---

### 2.2 LandCover.ai (U-Net Woodland Semantic Segmentation)
* **Natural Spatial Hierarchy**:
  - Consists of 41 individual orthophotos covering $216.27\text{ km}^2$ across distinct counties in Poland (33 orthophotos at 0.25m GSD and 8 orthophotos at 0.50m GSD).
* **Leakage-Safe Partitioning Strategy**:
  - **Level of Partitioning**: **Orthophoto Scene Level** (Whole Orthophoto Holdout).
  - **Allocation**:
    - 30 Orthophotos assigned to **Train**.
    - 5 Orthophotos assigned to **Validation**.
    - 6 Orthophotos assigned to **Test**.
  - **Rule**: All $512 \times 512$ tiles cropped from a single orthophoto remain strictly within the assigned split. No tiles from the same orthophoto may cross split boundaries.

---

### 2.3 NeonTreeEvaluation (Detection & Benchmark Suite)
* **Natural Spatial Hierarchy**:
  - Data gathered across 22 discrete National Ecological Observation Network (NEON) sites across different bioclimatic zones in the United States (e.g., `HARV` in Massachusetts, `OSBS` in Florida, `SJER` in California).
* **Leakage-Safe Partitioning Strategy**:
  - **Level of Partitioning**: **Site-Level Holdout** (Macro-Geographic Domain).
  - Cross-site evaluation tests zero-shot generalization across completely unseen ecological biomes.

---

### 2.4 USDA NAIP / Chesapeake Land Cover (NDVI & 4-Band Segmentation)
* **Natural Spatial Hierarchy**:
  - USDA NAIP is organized by USGS 3.75-minute Quarter-Quadrangle (DOQQ) tiles.
* **Leakage-Safe Partitioning Strategy**:
  - **Level of Partitioning**: **County / Watershed Block Holdout**.
  - Training and testing are performed across distinct, non-contiguous USGS quadrangle blocks.

---

## 3. Summary of Spatial Split Directives

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SPATIAL LEAKAGE CONTROL DIRECTIVES                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Naive random tile shuffling across contiguous scenes is STRICTLY         │
│    PROHIBITED.                                                              │
│ 2. Every dataset partition must be assigned at the Scene / Orthophoto /     │
│    Site level.                                                              │
│ 3. All split assignments must be frozen and recorded in `data/metadata.json`│
│    prior to model training.                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```
