# Data Specification, Provenance & Leakage Control

## 1. Input Data Formats & Geospatial Specifications

### 1.1 Raster Imagery
- **File Format**: Georeferenced TIFF (`.tif` / `.tiff` / GeoTIFF).
- **Spectral Bands**:
  - Minimum requirement for NDVI: Red band and Near-Infrared (NIR) band.
  - Standard inputs: 4-band multispectral (Red, Green, Blue, NIR) or 3-band high-resolution RGB imagery.
- **Georeferencing & Spatial Metadata**:
  - Must include valid Coordinate Reference System (CRS) metadata (e.g., EPSG:4326, EPSG:326XX / UTM).
  - Must include affine geotransform coefficients defining pixel-to-world mapping.
- **Ground Sample Distance (GSD)**:
  - Spatial resolution (e.g., $0.1\text{ m/pixel}$ to $0.5\text{ m/pixel}$) must be recorded per dataset.

### 1.2 Vector & Annotation Data
- **File Formats**: GeoJSON (`.geojson`) or Shapefiles (`.shp`).
- **Polygon Representation**:
  - Canopy cover polygons (for semantic segmentation).
  - Individual tree canopy polygons / bounding geometries (for YOLOv8n-Seg).

---

## 2. Configurable Tiling & Geospatial Fidelity

### 2.1 Configurable Tiling Engine
- Large geospatial rasters must be partitioned into windowed patches for model ingestion.
- Patch dimensions (e.g., width, height), stride, and overlap percentages must be **fully configurable** via YAML configurations.
- Optimal patch sizing will be determined experimentally based on task requirements, image resolution, and hardware limits.

### 2.2 Spatial Drift & Tolerance Control
- **No Unintended Spatial Drift**:
  - Any transformation, tiling, reassembly, or reprojection must remain within explicitly defined numerical/geospatial tolerances.
  - Exact metadata preservation is required for lossless operations (e.g., identity slicing, direct window extraction).
  - Operations involving interpolation, resampling, or coordinate reprojections must document and test against defined numerical tolerances.

---

## 3. Data Provenance Standards

For every dataset ingested, generated, or partitioned, the system and associated metadata files must track:
1. **Imagery Source**: Satellite sensor, aerial survey platform, or open-source repository.
2. **Acquisition Information**: Capture date, time, sensor angle, and environmental conditions.
3. **Spatial Resolution (GSD)**: Ground distance represented per pixel.
4. **Available Spectral Bands**: Exact channel indices and wavelength mappings.
5. **Coordinate Reference System (CRS)**: EPSG identifier and projection details.
6. **Annotation Source & Method**: Manual labeling protocol, semi-automated GIS tooling, or open benchmarks.
7. **Dataset Version**: Semantic version tag for reproducible referencing.
8. **Preprocessing Configuration**: Normalization values, nodata handling, tiling parameters.
9. **Train / Validation / Test Splits**: Explicit assignment mappings.
10. **Random Seeds**: Seeds used for any randomized partitioning.
11. **Geographic Separation**: Documentation of spatial boundaries separating splits.

---

## 4. Spatial Data Leakage Prevention

- **Problem Definition**: In spatial datasets, adjacent or overlapping tiles from the same geographic scene share high spatial autocorrelation. Assigning neighboring tiles randomly across training and validation/test splits causes severe optimistic bias (spatial leakage).
- **Mandatory Directives**:
  - The system must explicitly prevent spatial and data leakage between training, validation, and test sets.
  - Nearby or overlapping tiles originating from the same contiguous source scene or spatial region must **not** be treated as independent samples across different splits without explicit justification.
  - Partitioning must be conducted via **geographic spatial block splitting** or distinct scene-level separation rather than naive random tile shuffling.
