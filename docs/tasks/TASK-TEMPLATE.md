# TASK-XXX: <Task Title>

- **Status**: [TODO | IN_PROGRESS | VERIFYING | COMPLETED]
- **Component**: [GIS | Analytics | Models | Validation | Reporting | Infra]
- **Target Hardware**: [RTX 3050 4GB (Training) | Apple Silicon M4 (Deployment)]

---

## 1. Objective & Scope
<Clear description of what will be built, modified, or verified>

---

## 2. Technical Prerequisites & Dependencies
- Input files or configurations required:
- Preceding tasks completed:

---

## 3. Implementation Plan & Steps
1. ...
2. ...

---

## 4. Hardware & Resource Constraints
- **VRAM Budget**: Must operate within 4.0 GB VRAM on NVIDIA RTX 3050.
- **Configurability**: Dimensions, batch size, and worker counts must remain configurable via configs.

---

## 5. Verification & Acceptance Criteria
- [ ] **Unit / Mathematical Verification**: Unit tests pass (`pytest tests/unit/...`).
- [ ] **Geospatial Integrity**: Transformations remain within defined numerical tolerances with no unintended spatial drift.
- [ ] **Data Leakage Check**: Spatial train/val/test partitions strictly enforce geographic separation where applicable.
- [ ] **Validation Layer Gate**: All outputs pass deterministic validation prior to any reporting.
- [ ] **Hardware Compliance**: Peak memory consumption profiled and confirmed safe.

---

## 6. Review & Verification Log
```text
<Paste output of verification commands, test runs, and performance logs here>
```
