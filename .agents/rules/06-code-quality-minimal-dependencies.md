# Rule 06: Code Quality & Minimal Dependency Principles

## Core Directives
1. **Python Engineering Standards**:
   - Write clean, modular, and type-annotated Python.
   - Use Python's built-in `logging` module for status and diagnostics instead of unformatted `print()` statements.
   - Separate configuration parameters into YAML files; avoid hardcoding paths, thresholds, or dimensions in source code.
2. **Minimal Architecture & Infrastructure**:
   - Keep the system minimal and Python-native.
   - **Do not introduce** Docker containers, Kubernetes clusters, external databases (PostgreSQL/PostGIS), cloud services, microservices, or message queues unless a concrete requirement explicitly justifies them.
3. **Strict Dependency Discipline**:
   - Do not install new packages or upgrade existing dependencies without explicit approval and compatibility validation.
   - Ensure all C-extension libraries (`rasterio`, `shapely`, `pyproj`, `opencv-python`) use pre-compiled binary wheels on Windows.
