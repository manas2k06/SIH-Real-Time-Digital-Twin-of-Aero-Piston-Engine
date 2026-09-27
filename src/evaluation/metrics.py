"""
Module: metrics.py
Evaluation metrics for binary semantic segmentation canopy prediction in GreenVision-AI.
Computes IoU (Jaccard), Dice (F1), Accuracy, Precision, and Recall with zero-division safety.
"""
import torch
from typing import Dict, Optional


class SegmentationMetricMeter:
    """
    Online accumulator for binary segmentation evaluation metrics across validation/test batches.
    """
    def __init__(self, threshold: float = 0.5, eps: float = 1e-6):
        self.threshold = threshold
        self.eps = eps
        self.reset()

    def reset(self):
        self.total_tp = 0.0
        self.total_fp = 0.0
        self.total_fn = 0.0
        self.total_tn = 0.0
        self.sample_count = 0

    @torch.no_grad()
    def update(self, logits: torch.Tensor, targets: torch.Tensor):
        """
        logits: (B, 1, H, W) raw model predictions or probabilities.
        targets: (B, 1, H, W) binary ground truth {0.0, 1.0}.
        """
        probs = torch.sigmoid(logits) if (logits.min() < 0.0 or logits.max() > 1.0) else logits
        preds = (probs >= self.threshold).float()
        targets = (targets >= 0.5).float()

        tp = (preds * targets).sum().item()
        fp = (preds * (1.0 - targets)).sum().item()
        fn = ((1.0 - preds) * targets).sum().item()
        tn = ((1.0 - preds) * (1.0 - targets)).sum().item()

        self.total_tp += tp
        self.total_fp += fp
        self.total_fn += fn
        self.total_tn += tn
        self.sample_count += targets.shape[0]

    def compute(self) -> Dict[str, float]:
        """Calculates macro-aggregated metrics across all accumulated batches."""
        tp = self.total_tp
        fp = self.total_fp
        fn = self.total_fn
        tn = self.total_tn
        eps = self.eps

        # Metrics
        iou = (tp + eps) / (tp + fp + fn + eps)
        dice = (2.0 * tp + eps) / (2.0 * tp + fp + fn + eps)
        precision = (tp + eps) / (tp + fp + eps)
        recall = (tp + eps) / (tp + fn + eps)
        accuracy = (tp + tn + eps) / (tp + tn + fp + fn + eps)

        # In cases where ground-truth and prediction are completely empty (no foreground in batch):
        if (tp + fp + fn) == 0:
            iou = 1.0
            dice = 1.0
            precision = 1.0
            recall = 1.0

        return {
            "iou": float(iou),
            "dice": float(dice),
            "precision": float(precision),
            "recall": float(recall),
            "accuracy": float(accuracy)
        }


def compute_batch_metrics(
    logits: torch.Tensor,
    targets: torch.Tensor,
    threshold: float = 0.5,
    eps: float = 1e-6
) -> Dict[str, float]:
    """Single batch helper to compute segmentation metrics."""
    meter = SegmentationMetricMeter(threshold=threshold, eps=eps)
    meter.update(logits, targets)
    return meter.compute()