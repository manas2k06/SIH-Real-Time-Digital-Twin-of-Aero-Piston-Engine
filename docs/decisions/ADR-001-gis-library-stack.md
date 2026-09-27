# ADR-001: Geospatial Library Stack Selection

## Status
Accepted

## Context
GreenVision AI requires robust ingestion, windowed tiling, reassembly, and coordinate transformation of geospatial rasters (GeoTIFFs) and vector geometries (GeoJSON/Shapefiles). Maintaining georeferencing matrices and CRS metadata without unintended spatial drift is critical.

## Decision
We select `rasterio` (backed by GDAL) for raster I/O, `shapely` for vector geometry operations, and `pyproj` for coordinate reference system transformations.

## Rationale
- `rasterio` provides a clean, idiomatic Python API for windowed reads and writes, allowing large GeoTIFFs to be tiled on-the-fly without loading entire gigabyte rasters into memory.
- `shapely` offers deterministic polygon operations, intersection checks, and area calculations.
- `pyproj` guarantees precise coordinate conversions with explicit numerical control.

## Consequences
- Windows environment setup must account for pre-compiled binary wheels or conda packaging to avoid local C++ compilation failures.
