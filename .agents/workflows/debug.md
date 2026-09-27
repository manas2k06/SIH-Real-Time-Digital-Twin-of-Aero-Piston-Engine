# Workflow: /debug — Failure Diagnosis & Rectification Workflow

## Purpose
Systematically inspects failed tests, diagnoses root causes, implements targeted fixes, and re-triggers verification until a verified PASS is achieved.

## Mandatory Sequence
```
[1. Capture Failure Log & Traceback]
                 │
                 ▼
[2. Isolate Root Cause (Math / Memory / Coordinate / Logic)]
                 │
                 ▼
[3. Formulate Targeted Remediation]
                 │
                 ▼
[4. Apply Minimal Fix]
                 │
                 ▼
[5. Re-Run /verify Workflow]
```

## Step-by-Step Instructions

1. **Capture Failure Details**:
   - Record the full traceback, error message, and failing assertion.
2. **Diagnose Root Cause**:
   - *CUDA OOM*: Reduce batch size, decrease tile patch size, enable AMP, or free allocator cache.
   - *Spatial Drift*: Check affine transform scaling, sub-window pixel offset, or CRS reprojection tolerance.
   - *Numerical Error*: Inspect NDVI boundary conditions, NaN handling, or zero division.
   - *Schema Failure*: Check dataclass field types and missing mandatory keys.
3. **Apply Minimal Targeted Fix**:
   - Modify only the affected lines of code. Do not perform sweeping refactors during debugging.
4. **Re-Execute Verification**:
   - Re-run the `/verify` workflow. Repeat until all checks pass with clear evidence.
