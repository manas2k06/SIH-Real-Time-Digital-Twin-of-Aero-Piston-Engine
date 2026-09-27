"""
Stage 2 Verification Script: PyTorch & CUDA Validation
Verifies PyTorch, Torchvision, CUDA runtime, GPU device properties,
CUDA tensor operations, neural network forward/backward passes, and VRAM metrics.
"""
import sys
import torch
import torchvision
import torch.nn as nn

def run_stage2_verification():
    print("=" * 60)
    print("STAGE 2: PYTORCH & CUDA VERIFICATION")
    print("=" * 60)

    # 1. Environment & Library Versions
    print(f"Python Version: {sys.version.split()[0]}")
    print(f"PyTorch Version: {torch.__version__}")
    print(f"Torchvision Version: {torchvision.__version__}")
    
    # 2. CUDA Availability & Driver/Runtime Versions
    cuda_available = torch.cuda.is_available()
    print(f"CUDA Available: {cuda_available}")
    if not cuda_available:
        print("[ERROR] CUDA is not available to PyTorch!")
        sys.exit(1)

    cuda_version = torch.version.cuda
    print(f"PyTorch Compiled CUDA Version: {cuda_version}")
    
    # 3. GPU Device Information
    device_count = torch.cuda.device_count()
    device_id = 0
    device_name = torch.cuda.get_device_name(device_id)
    compute_capability = torch.cuda.get_device_capability(device_id)
    total_memory_bytes = torch.cuda.get_device_properties(device_id).total_memory
    total_memory_gb = total_memory_bytes / (1024 ** 3)

    print(f"Detected GPU Count: {device_count}")
    print(f"Active GPU Device [{device_id}]: {device_name}")
    print(f"Compute Capability: {compute_capability[0]}.{compute_capability[1]}")
    print(f"Total VRAM: {total_memory_gb:.2f} GB ({total_memory_bytes} bytes)")
    
    # Reset peak memory stats before tests
    torch.cuda.reset_peak_memory_stats(device_id)
    initial_allocated = torch.cuda.memory_allocated(device_id)
    initial_reserved = torch.cuda.memory_reserved(device_id)
    print(f"Initial VRAM Allocated: {initial_allocated / (1024 ** 2):.2f} MB")
    print(f"Initial VRAM Reserved: {initial_reserved / (1024 ** 2):.2f} MB")

    # 4. CUDA Tensor Calculation Verification (Ensuring no CPU fallback)
    print("\n[Test 1] Executing pure CUDA Tensor Operation...")
    device = torch.device(f"cuda:{device_id}")
    a = torch.randn(1000, 1000, device=device, dtype=torch.float32)
    b = torch.randn(1000, 1000, device=device, dtype=torch.float32)
    c = torch.matmul(a, b)
    
    assert a.is_cuda, "Tensor A was not placed on CUDA!"
    assert b.is_cuda, "Tensor B was not placed on CUDA!"
    assert c.is_cuda, "Tensor C was not calculated on CUDA!"
    assert c.device.type == "cuda", "Tensor C device is not cuda!"
    print(f"  - Matmul shape: {tuple(c.shape)}, Device: {c.device}, is_cuda: {c.is_cuda} -> PASS")

    # 5. Small Neural Network Forward & Backward Pass Verification
    print("\n[Test 2] Executing Neural Network Forward & Backward Pass on CUDA...")
    class TinyConvNet(nn.Module):
        def __init__(self):
            super().__init__()
            self.conv = nn.Conv2d(3, 16, kernel_size=3, padding=1)
            self.bn = nn.BatchNorm2d(16)
            self.relu = nn.ReLU()
            self.fc = nn.Linear(16 * 32 * 32, 2)

        def forward(self, x):
            x = self.relu(self.bn(self.conv(x)))
            x = x.flatten(start_dim=1)
            return self.fc(x)

    model = TinyConvNet().to(device)
    for name, param in model.named_parameters():
        assert param.is_cuda, f"Model parameter {name} is not on CUDA!"
        assert param.device.type == "cuda", f"Model parameter {name} device is not cuda!"

    # Forward pass
    dummy_input = torch.randn(8, 3, 32, 32, device=device)
    dummy_target = torch.randint(0, 2, (8,), device=device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

    optimizer.zero_grad()
    outputs = model(dummy_input)
    assert outputs.is_cuda, "Forward pass output is not on CUDA!"
    assert outputs.device.type == "cuda", "Forward pass output device is not cuda!"
    print(f"  - Forward pass output shape: {tuple(outputs.shape)}, Device: {outputs.device} -> PASS")

    # Backward pass
    loss = criterion(outputs, dummy_target)
    assert loss.is_cuda, "Loss is not on CUDA!"
    loss.backward()
    optimizer.step()

    for name, param in model.named_parameters():
        assert param.grad is not None, f"Gradient for {name} was not computed!"
        assert param.grad.is_cuda, f"Gradient for {name} is not on CUDA!"
        assert param.grad.device.type == "cuda", f"Gradient for {name} device is not cuda!"
    print(f"  - Backward pass & gradient step completed on CUDA (Loss: {loss.item():.4f}) -> PASS")

    # 6. Memory Profiling Metrics
    peak_allocated = torch.cuda.max_memory_allocated(device_id)
    peak_reserved = torch.cuda.max_memory_reserved(device_id)
    final_allocated = torch.cuda.memory_allocated(device_id)
    final_reserved = torch.cuda.memory_reserved(device_id)

    print("\n[Memory Profiling]")
    print(f"  - Peak VRAM Allocated during test: {peak_allocated / (1024 ** 2):.2f} MB")
    print(f"  - Peak VRAM Reserved during test:  {peak_reserved / (1024 ** 2):.2f} MB")
    print(f"  - Final VRAM Allocated:             {final_allocated / (1024 ** 2):.2f} MB")
    print(f"  - Final VRAM Reserved:              {final_reserved / (1024 ** 2):.2f} MB")
    print("\n" + "=" * 60)
    print("STAGE 2 VERIFICATION RESULT: ALL CHECKS PASSED (CUDA ACCELERATED)")
    print("=" * 60)

if __name__ == "__main__":
    run_stage2_verification()
