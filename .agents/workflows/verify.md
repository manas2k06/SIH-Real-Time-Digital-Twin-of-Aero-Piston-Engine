# Workflow: /verify — Verification & Testing Workflow

## Purpose
Executes automated tests, gathers empirical execution evidence, profiles hardware usage, and determines PASS/FAIL status.

## Mandatory Sequence
```
[1. Execute Automated Unit / Integration Tests]
                       │
                       ▼
[2. Measure Hardware & VRAM Allocation on CUDA]
                       │
                       ▼
[3. Validate Geospatial Drift & Tolerances]
                       │
                       ▼
[4. If Test Fails ──► Trigger /debug Workflow]
                       │
             (If All Tests Pass)
                       │
                       ▼
[5. Record Execution Evidence Logs]
```

## Step-by-Step Instructions

1. **Run Test Suites**:
   - Run relevant unit tests: `pytest tests/unit/test_xxx.py` using `.venv\Scripts\python.exe`.
   - Ensure all assertions, edge cases, and exceptions execute without errors.
2. **Profile Hardware & Memory**:
   - For GPU tasks, measure peak VRAM allocated via `torch.cuda.max_memory_allocated()`.
   - Confirm execution occurred on `cuda:0` without CPU fallback.
3. **Check Geospatial Tolerances**:
   - For GIS operations, verify affine transform preservation and check for zero unintended spatial drift.
4. **Evaluate Results**:
   - **FAIL**: If any test fails, record error logs and immediately invoke the `/debug` workflow.
   - **PASS**: Gather full terminal log evidence for the `/review` workflow.
   - **Do not mark a task complete without passing execution logs.**
