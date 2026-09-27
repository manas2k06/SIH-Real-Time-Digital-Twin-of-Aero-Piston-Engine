# Workflow: /implement — Task Implementation Workflow

## Purpose
Executes the approved technical plan with minimal, modular changes adhering to engineering standards.

## Mandatory Sequence
```
[1. Confirm Plan Approval]
              │
              ▼
[2. Implement Smallest Required Change]
              │
              ▼
[3. Enforce Architectural Boundaries]
              │
              ▼
[4. Parameterize Configs (No Hardcoded Sizes)]
              │
              ▼
[5. Immediately Trigger /verify Workflow]
```

## Step-by-Step Instructions

1. **Verify Approval**:
   - Ensure explicit user approval was obtained for the `/plan` before creating or modifying code.
2. **Implement Smallest Change**:
   - Write clean, type-annotated code in `src/` fulfilling only the active task scope.
   - Keep functions modular and testable with decoupled interfaces.
3. **Respect Boundaries**:
   - Ensure ML models do not perform deterministic calculations.
   - Ensure Qwen LLM is not invoked for mathematical calculations.
   - Ensure Python/NumPy logic handles authoritative numbers.
4. **Parameterize via Configs**:
   - Keep batch sizes, tile sizes, workers, and paths in YAML configs inside `configs/`.
5. **Proceed Directly to Verification**:
   - A task is **never** complete after writing files. Immediately invoke the `/verify` workflow.
