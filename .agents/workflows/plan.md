# Workflow: /plan — Task Planning Workflow

## Purpose
Prepares a detailed technical plan and defines acceptance criteria before modifying or creating code.

## Mandatory Sequence
```
[1. Inspect Repository & Task Backlog]
                 │
                 ▼
[2. Read Relevant Specifications, ADRs & Rules]
                 │
                 ▼
[3. Formulate Affected Files & Scope Boundary]
                 │
                 ▼
[4. Define Concrete Acceptance & Verification Criteria]
                 │
                 ▼
[5. Submit Plan for Review & Approval]
```

## Step-by-Step Instructions

1. **Inspect Repository**:
   - Check current working tree status (`git status`).
   - Identify active task card in `docs/TASKS.md` or `docs/tasks/`.
2. **Read Relevant Documentation**:
   - Review `docs/PROJECT_SPECIFICATION.md` for architectural boundaries.
   - Review relevant rules in `.agents/rules/` (e.g., 4GB VRAM guardrails, spatial leakage rules).
3. **Plan Affected Files**:
   - Explicitly list which files will be created or modified.
   - Ensure the plan maintains minimal dependencies and no extraneous infrastructure.
4. **Define Acceptance Criteria & Verification Commands**:
   - Write concrete, measurable test commands (e.g., `pytest tests/unit/test_xxx.py`).
   - Define expected inputs, outputs, and memory thresholds.
5. **Request Approval**:
   - Stop and wait for user approval before writing application code or starting training.
