# Rule 02: Machine Learning Development Standards

## Core Directives
1. **Spatial Data Leakage Prevention**:
   - Training, validation, and test datasets must maintain strict geographic separation (spatial block holdout or distinct scenes).
   - Adjacent, nearby, or overlapping tiles from the same contiguous scene must **never** be split across train and test sets.
2. **Dataset Provenance & Tracking**:
   - Every dataset asset must track: sensor source, acquisition date, spatial resolution (GSD), spectral bands, CRS, annotation method, version tag, preprocessing configuration, split mapping, and random seeds.
3. **Mandatory Experiment Logging**:
   - Every ML experiment must record all 10 mandatory metadata fields in `experiments/<id>/README.md`:
     1. Dataset identifier & version
     2. Model architecture & configuration
     3. Hyperparameters (learning rates, batch sizes, optimizer, loss weights)
     4. Random seeds
     5. Hardware environment (GPU, VRAM, CPU, RAM)
     6. Software versions (Python, PyTorch, CUDA, Ultralytics)
     7. Training wall-clock duration & epochs
     8. Quantitative evaluation metrics (mIoU, mAP, precision, recall)
     9. Checkpoint file reference / artifact hash
     10. Notes, failure modes, and analytical observations
4. **Empirical Baseline Establishment**:
   - Performance targets (e.g., mIoU, mAP thresholds) must remain TBD until empirical baseline experiments are executed on test splits.
