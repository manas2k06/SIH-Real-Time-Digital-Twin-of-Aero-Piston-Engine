# GreenVision AI: Task Roadmap

## Phase 0: Project Foundations & Control Architecture (Current)
- [x] **Task 0.1**: Initialize development-control rules and agent workflows (`.agents/`).
- [x] **Task 0.2**: Initialize core system documentation and ADRs (`docs/`).
- [ ] **Task 0.3**: Formulate environment and dependency strategy (evaluate CUDA Windows & M4 macOS compatibility).
- [ ] **Task 0.4**: Create initial configuration templates (`configs/`).

## Phase 1: Geospatial Ingestion & Preprocessing Engine
- [ ] **Task 1.1**: Implement raster ingestion module supporting GeoTIFFs, CRS extraction, and band mapping.
- [ ] **Task 1.2**: Implement configurable windowed tiling and spatial reassembly engine (configurable patch dimensions & overlap).
- [ ] **Task 1.3**: Implement geospatial verification suite (validating no unintended spatial drift within defined numerical tolerances).
- [ ] **Task 1.4**: Implement dataset provenance metadata logger and geographic spatial split generator (leakage prevention).

## Phase 2: Deterministic Analytics & NDVI Engine
- [ ] **Task 2.1**: Implement deterministic NDVI formula and range-bounded array operations.
- [ ] **Task 2.2**: Implement statistical vegetation health index aggregator.
- [ ] **Task 2.3**: Verification suite for deterministic analytics (edge cases, nodata masking, zero division).

## Phase 3: U-Net Semantic Canopy Segmentation
- [ ] **Task 3.1**: Implement dataset loader with configurable patch sizing and augmentations.
- [ ] **Task 3.2**: Implement U-Net training pipeline with Automatic Mixed Precision (AMP) for 4 GB VRAM.
- [ ] **Task 3.3**: Execute baseline experiments, log run metadata, and determine empirical target metrics (mIoU / Dice).
- [ ] **Task 3.4**: Implement U-Net inference and raster mask export module.

## Phase 4: YOLOv8n-Seg Tree Instance Segmentation
- [ ] **Task 4.1**: Implement dataset formatting and annotation pipeline for YOLO instance segmentation.
- [ ] **Task 4.2**: Implement YOLOv8n-Seg training pipeline on local CUDA hardware.
- [ ] **Task 4.3**: Execute baseline experiments, log run metadata, and determine empirical target metrics (mAP50, mAP50-95).
- [ ] **Task 4.4**: Implement tree instance inference, polygon extraction, and counting module.

## Phase 5: Spatial Fusion & Metric Validation Layer
- [ ] **Task 5.1**: Implement spatial fusion combining U-Net canopy masks, YOLO tree instances, and NDVI distributions.
- [ ] **Task 5.2**: Implement deterministic validation layer (schema validation, physical range enforcement).
- [ ] **Task 5.3**: Implement GIS vector/raster export (GeoJSON, GeoTIFF masks).

## Phase 6: Qwen 2.5 Natural-Language Reporting Module
- [ ] **Task 6.1**: Define structured JSON schema for validated metrics.
- [ ] **Task 6.2**: Design constrained report-generation prompt templates.
- [ ] **Task 6.3**: Implement local quantized Qwen 2.5 inference execution (CPU/quantized).
- [ ] **Task 6.4**: Implement factual consistency audit suite verifying LLM text against input JSON.

## Phase 7: End-to-End Verification & Deployment Investigation
- [ ] **Task 7.1**: Full pipeline integration test across end-to-end sample datasets.
- [ ] **Task 7.2**: VRAM allocation profiling and latency benchmarking on RTX 3050.
- [ ] **Task 7.3**: Investigate and document Apple Silicon (M4) deployment runtime and model export paths (ONNX / CoreML / MLX).
