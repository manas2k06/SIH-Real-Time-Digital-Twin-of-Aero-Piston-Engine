# Rule 03: Hardware Constraints & Resource Guardrails

## Core Directives
1. **Physical Resource Envelope**:
   - **Training Workstation**: ASUS TUF A15 with NVIDIA RTX 3050 (**4.0 GB Dedicated VRAM**), AMD Ryzen 7 7445HS, 16.0 GB System RAM.
   - **Deployment Workstation**: Apple Silicon MacBook (M4 chip).
2. **Prevent Assumptions of Large GPU Memory**:
   - Code and training pipelines must **never** assume infinite or large (>4 GB) GPU memory.
   - Batch sizes, tile/image dimensions, and data loader workers must remain **strictly configurable** via YAML configurations. Hardcoding sizes is prohibited.
3. **Mandatory VRAM Optimizations**:
   - Training routines must support **PyTorch Automatic Mixed Precision** (`torch.cuda.amp.autocast()` / `torch.amp`).
   - DataLoaders on Windows must use `num_workers = 0` or `2` with `pin_memory = True` to prevent RAM exhaustion.
   - Sequential execution: Vision models and language models must never run concurrently on the GPU during local workflows.
   - Explicit memory allocator management: Trigger `torch.cuda.empty_cache()` and garbage collection when transitioning between pipeline stages.
4. **Checkpointing & Resumable Training**:
   - Training loops must support checkpoint saving, auto-resumption (`resume=True`), and pruning (retaining only `best.pt` and `last.pt`) to conserve disk space on Drive `C:`.
