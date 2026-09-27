# Rule 05: Git & Change Management Standards

## Core Directives
1. **Atomic & Focused Changes**:
   - Make small, incremental modifications scoped strictly to the active task card.
   - Do not bundle unrelated refactorings or speculative code into task commits.
2. **Git Hygiene & Clean Working Tree**:
   - Temporary test files, intermediate caches, `.pytest_cache`, and virtual environment files must never be committed to git.
   - Large raw/processed datasets (`data/raw/`, `data/processed/`) and heavy model checkpoints (`*.pt`, `*.pth`) must remain strictly gitignored.
   - Sample datasets in `data/sample/` must remain lightweight ($< 500\text{ MB}$).
3. **Commit Standards**:
   - Commits are permitted **only after** all acceptance criteria and verification gates are satisfied with passing test evidence.
