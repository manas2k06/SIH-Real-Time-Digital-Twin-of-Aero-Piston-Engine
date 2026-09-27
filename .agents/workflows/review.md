# Workflow: /review — Task Review & Sign-Off Workflow

## Purpose
Validates compliance with the Definition of Done, reviews code diffs, audits Git status, and prepares the final completion report.

## Mandatory Sequence
```
[1. Verify All Definition of Done Gates]
                   │
                   ▼
[2. Audit Git Diff & Check for Stray Files]
                   │
                   ▼
[3. Measure Storage & Memory Footprint]
                   │
                   ▼
[4. Compile Comprehensive Evidence Report]
                   │
                   ▼
[5. Request Sign-Off / Approval]
```

## Step-by-Step Instructions

1. **Audit Definition of Done Gates**:
   - Check off all 7 DoD gates from `docs/DEFINITION_OF_DONE.md`.
   - Confirm verification test logs demonstrate 100% passing status.
2. **Review Git Status & Diff**:
   - Run `git status` and inspect changed files.
   - Ensure no unintended packages, large binaries, datasets, or cache files were introduced.
3. **Record Storage & Resource Metrics**:
   - Record `.venv` size, free disk space on `C:`, and peak VRAM allocated.
4. **Compile Completion Report**:
   - Document files created/modified, verification outputs, and any remaining open decisions.
5. **Wait for Approval**:
   - Present the evidence report to the user and wait for formal sign-off before committing or moving to the next task.
