# Hardware Specifications and Resource Constraints

## 1. Target Hardware Environments

### 1.1 Training Environment
- **Machine**: ASUS TUF A15
- **Operating System**: Windows 11
- **CPU**: AMD Ryzen 7 7445HS
- **System Memory**: 16 GB RAM
- **GPU**: NVIDIA GeForce RTX 3050 Laptop GPU
- **Dedicated Video Memory (VRAM)**: **4.0 GB**
- **Acceleration Backend**: NVIDIA CUDA

### 1.2 Deployment Target
- **Machine**: Apple MacBook (M4 chip)
- **Operating System**: macOS
- **System Architecture**: Apple Silicon (Unified Memory)
- **Acceleration Backend**: Metal Performance Shaders (MPS) or platform-appropriate runtime

---

## 2. Hardware-Driven Constraints & Guidelines

### 2.1 4 GB VRAM Training Guardrails
The primary physical bottleneck during development and model training is the 4.0 GB VRAM limit on the RTX 3050. To prevent CUDA Out-Of-Memory (OOM) failures:

1. **Configurable Parameters**:
   - Patch dimensions, batch sizes, and data loader workers must remain configurable via YAML configuration files rather than hardcoded.
   - The optimal training resolution will be determined experimentally based on task requirements and the 4 GB limit.
2. **Automatic Mixed Precision (AMP)**:
   - PyTorch training routines for U-Net and YOLOv8n-Seg must support mixed precision (`torch.cuda.amp.autocast()`) to reduce memory footprint.
3. **Sequential Pipeline Execution**:
   - Vision models and language models must not reside simultaneously in GPU VRAM during local execution.
   - Scripts must trigger memory cache releases (`torch.cuda.empty_cache()` and garbage collection) between pipeline stages.
4. **Memory Allocation Limits**:
   - Exact numerical peak VRAM thresholds remain **TBD** until initial baseline profiling is conducted.

---

## 3. Cross-Platform Runtime Requirements

- **Device Agnostic Design**:
  - The codebase must support execution on CUDA for the training workstation and Apple Silicon (MPS / CPU) for deployment.
  - Hardcoded device strings (such as `device = "cuda"`) are prohibited.
  - A formalized device abstraction layer will be introduced at a later phase.

---

## 4. Future Investigations (Deployment)

- **Model Serialization & Export**:
  - Investigating ONNX Runtime, CoreML, or MLX formats for optimized execution on Apple Silicon M4.
  - Export investigations will follow successful training and validation of the baseline PyTorch and Ultralytics models.
