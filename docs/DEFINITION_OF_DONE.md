# GreenVision AI: Definition of Done (DoD)

## 1. Core Principle
**No implementation is considered complete without verification.**
A task must **never** be reported as complete merely because source files, scripts, or documentation placeholders were created. Completion requires empirical, verifiable evidence that the code functions correctly, adheres to hardware boundaries, and satisfies all acceptance criteria.

---

## 2. Mandatory Verification Gates

To mark any task or feature as `COMPLETED`, all of the following gates must be satisfied:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DEFINITION OF DONE GATES                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Gate 1: Implementation & Architecture]                                     │
│  • Minimal, modular implementation fulfilling the specific task objective.  │
│  • Strictly complies with architectural boundaries (ML vs. Math vs. LLM).  │
│  • Zero hardcoded image sizes, batch sizes, device strings, or local paths. │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Gate 2: Automated Testing & Verification]                                  │
│  • Automated unit/integration tests executed with passing status.           │
│  • Deterministic formulas (e.g., NDVI, area calculations) mathematically    │
│    verified against known ground truth or numerical test fixtures.          │
│  • All edge cases (e.g., zero denominators, empty masks, nodata) tested.    │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Gate 3: Geospatial Fidelity]                                               │
│  • No unintended spatial drift: all transformations, tiling, reassembly,    │
│    or reprojections remain within explicitly defined numerical tolerances.  │
│  • Georeferencing matrices, affine transforms, and CRS metadata preserved.  │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Gate 4: Hardware & VRAM Compliance]                                        │
│  • Peak GPU VRAM allocation measured and verified within the 4.0 GB limit   │
│    on the NVIDIA RTX 3050.                                                  │
│  • PyTorch Automatic Mixed Precision (`torch.amp`) enabled for training.    │
│  • Memory cache properly released; zero memory leaks across iterations.     │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Gate 5: Validation Gateway Enforcement]                                    │
│  • Model predictions and calculated metrics pass schema validation before   │
│    being passed to downstream reporting modules.                            │
│  • Language models are strictly prevented from performing calculations.     │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Gate 6: Documentation & Evidence Recording]                                │
│  • Task card updated with actual terminal test outputs and execution logs.  │
│  • If machine learning experiments were conducted, all 10 mandatory         │
│    experiment fields are recorded in `experiments/<id>/README.md`.          │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Gate 7: Clean Repository & Git Hygiene]                                    │
│  • No temporary files, stale caches, or unapproved dependencies added.      │
│  • Working tree clean and properly tracked.                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Evidence Checklist Before Task Sign-Off

Every task report submitted for review must explicitly present:
1. **Command Executed**: The exact terminal command used to verify the code.
2. **Terminal Output Summary**: Verifiable output logs proving test success (`PASS`).
3. **Hardware / Resource Metric**: Peak VRAM allocated, execution time, and storage impact.
4. **Files Created or Modified**: Explicit list of touched files with baseline integrity checks.
