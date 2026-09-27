# ADR-002: Role & Authority Boundary for Qwen 2.5 in Reporting

## Status
Accepted

## Context
GreenVision AI utilizes Qwen 2.5 (small model) to produce natural language reports from vision and GIS analysis. Large Language Models are non-deterministic and prone to hallucination when performing mathematical computations or spatial measurements directly.

## Decision
1. Qwen 2.5 **must never** be the authoritative source for numerical calculations, geometry operations, or spatial measurements.
2. Qwen 2.5 **must not** independently derive spatial measurements from raw imagery.
3. Deterministic Python/GIS modules produce all authoritative numerical metrics (areas, percentages, tree counts, NDVI distributions, georeferenced coordinates).
4. All metrics must pass schema and sanity validation before being passed to Qwen.
5. Qwen's role is strictly confined to converting validated structured data into clear, natural-language summaries, domain-specific insights, and formatted reports.

## Consequences
- The architecture requires a dedicated deterministic validation layer between analytics computation and the LLM reporting prompt generator.
- Prompt templates must enforce strict factual grounding against the provided JSON context.
