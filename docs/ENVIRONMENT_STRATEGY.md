# Environment & Dependency Strategy

## 1. Strategy Overview
The environment and dependency management strategy for GreenVision AI is governed by the dual-platform requirement:
- **Training Workstation**: Windows 11 with NVIDIA RTX 3050 (CUDA 12.x / PyTorch CUDA build).
- **Deployment Workstation**: Apple Silicon MacBook (M4 chip) with macOS / Metal Performance Shaders (MPS) or compatible runtime.

No packages are currently installed, and no lockfiles/manifests (`pyproject.toml` or `requirements.txt`) are finalized yet. The final dependency strategy will be formulated after technical evaluation of cross-platform binary compatibility.

---

## 2. Key Component Areas to Evaluate

### 2.1 Geospatial Stack (Windows & macOS Compatibility)
- **Libraries**: `rasterio`, `shapely`, `geopandas`, `fiona`, `pyproj`.
- **Consideration**: Installing C-based GIS libraries on Windows requires binary wheels or Conda environments to prevent C++ compilation errors, while macOS requires ARM64 binary wheels.

### 2.2 Deep Learning Framework
- **Libraries**: `torch`, `torchvision`, `torchaudio`.
- **Training Target**: PyTorch with CUDA acceleration on Windows.
- **Deployment Target**: PyTorch with MPS acceleration or lightweight runtime on macOS.

### 2.3 Computer Vision & Segmentation
- **Libraries**: `ultralytics` (YOLOv8n-Seg), `segmentation-models-pytorch` / native PyTorch (U-Net), `opencv-python` / `albumentations` (augmentation).

### 2.4 Language Model Inference
- **Target**: Qwen 2.5 small model.
- **Evaluation Points**: Quantized inference engine (e.g., `llama-cpp-python`, `transformers` with 4-bit quantization, or GGUF runtime) optimized for low memory footprint on CPU/GPU.

---

## 3. Next Steps for Environment Formalization
1. Inspect local Python runtime version.
2. Formulate dependency manifest matrix (Windows CUDA vs. macOS Apple Silicon).
3. Establish reproducible virtual environment creation procedure.
