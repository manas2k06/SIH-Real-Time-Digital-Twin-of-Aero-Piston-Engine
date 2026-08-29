GreenVision AI

GreenVision AI is an AI and GIS-based green-cover assessment system.

Core AI Models
YOLOv8n-Seg — Individual tree detection and segmentation.
U-Net — Vegetation segmentation.
Qwen 2.5 small model — Natural-language analysis and reporting.
NDVI — Deterministic vegetation health analysis.
Hardware
Training
ASUS TUF A15
NVIDIA RTX 3050 — 4 GB VRAM
AMD Ryzen 7 7445HS
16 GB RAM
Deployment
Apple MacBook M4
Repository Structure
.agents/       Antigravity rules, workflows and skills
configs/       Configuration files
data/          Datasets and sample data
docs/          Project documentation and decisions
experiments/   Experiment metadata and outputs
models/        Model-related files
scripts/       Utility scripts
src/           Application source code
tests/         Automated tests
Development Principle

The project follows:

Requirement → Plan → Implement → Test → Verify → Review → Commit

No implementation is considered complete without verification.