# ADR-003: Spatial Data Leakage Prevention and Split Strategy

## Status
Accepted

## Context
High-resolution aerial and satellite images exhibit strong spatial autocorrelation. If a large scene is cut into small tiles and partitioned using standard random splitting, neighboring or overlapping tiles will appear in both training and test sets, artificially inflating evaluation metrics and disguising overfitting.

## Decision
1. The project strictly forbids naive random tile-level train/validation/test splitting across contiguous scenes.
2. Dataset partitioning must enforce geographic separation (e.g., spatial block holdout or scene-level separation).
3. Overlapping or contiguous tiles from the same source region must not be treated as independent samples across different splits.
4. All split assignments and geographic boundaries must be recorded in dataset provenance metadata.

## Consequences
- Evaluation metrics will reflect true out-of-distribution / unseen spatial generalization.
- Preprocessing and dataset tooling must support spatial bounding box assignment for split creation.
