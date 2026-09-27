# Rule 04: Testing and Verification Standards

## Core Directives
1. **Verification-First Principle**:
   - No task or code change is complete without executing automated tests and recording empirical verification evidence.
   - Creating files or writing code without running tests is a violation of the Definition of Done.
2. **Multi-Tier Testing Suite**:
   - **Unit Tests (`tests/unit/`)**: Verify deterministic mathematics (NDVI formulas, area sums, schema checks) against known analytical fixtures.
   - **Geospatial Tests (`tests/gis/`)**: Verify that tiling, reprojections, and reassembly introduce **no unintended spatial drift** within explicitly defined numerical tolerances. Lossless operations must preserve exact geotransforms.
   - **Hardware / Memory Profiling (`tests/benchmarks/`)**: Verify peak GPU VRAM allocation remains within the 4.0 GB envelope on RTX 3050.
   - **Integration Tests (`tests/integration/`)**: Test end-to-end data flow using sample fixtures in `data/sample/`.
3. **Execution Evidence Requirement**:
   - Task completion reports must include the exact terminal execution commands, pass/fail status, and resource metrics.
