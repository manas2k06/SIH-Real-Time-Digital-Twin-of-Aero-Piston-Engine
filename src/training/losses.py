"""
Module: losses.py
Loss functions for binary semantic segmentation in GreenVision-AI.
Implements SoftDiceLoss and BCEDiceLoss with numerical stability safeguards and AMP compatibility.
"""
import torch
import torch.nn as nn
from typing import Optional, Dict, Tuple


class SoftDiceLoss(nn.Module):
    """
    Soft Dice Loss for binary segmentation from raw logits.
    
    Args:
        smooth: Smoothing constant epsilon to prevent zero division and laplace smoothing.
        reduction: 'mean', 'sum', or 'none'.
    """
    def __init__(self, smooth: float = 1e-6, reduction: str = "mean"):
        super().__init__()
        self.smooth = smooth
        self.reduction = reduction

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        """
        logits: (B, 1, H, W) raw unscaled network outputs.
        targets: (B, 1, H, W) binary ground truth tensor {0.0, 1.0}.
        """
        probs = torch.sigmoid(logits)

        # Flatten batch elements across spatial dimensions: (B, N)
        probs_flat = probs.view(probs.shape[0], -1)
        targets_flat = targets.view(targets.shape[0], -1)

        intersection = (probs_flat * targets_flat).sum(dim=1)
        cardinality = probs_flat.sum(dim=1) + targets_flat.sum(dim=1)

        dice = (2.0 * intersection + self.smooth) / (cardinality + self.smooth)
        loss = 1.0 - dice

        if self.reduction == "mean":
            return loss.mean()
        elif self.reduction == "sum":
            return loss.sum()
        else:
            return loss


class BCEDiceLoss(nn.Module):
    """
    Combined Binary Cross Entropy (with logits) and Soft Dice Loss.
    
    Args:
        bce_weight: Scaling weight for BCE loss.
        dice_weight: Scaling weight for Soft Dice loss.
        pos_weight: Optional positive class weighting for BCE to balance severe foreground sparsity.
        smooth: Smoothing epsilon for Dice loss.
    """
    def __init__(
        self,
        bce_weight: float = 0.5,
        dice_weight: float = 0.5,
        pos_weight: Optional[float] = None,
        smooth: float = 1e-6
    ):
        super().__init__()
        self.bce_weight = bce_weight
        self.dice_weight = dice_weight
        pos_weight_tensor = torch.tensor([pos_weight]) if pos_weight is not None else None
        self.bce_loss = nn.BCEWithLogitsLoss(pos_weight=pos_weight_tensor)
        self.dice_loss = SoftDiceLoss(smooth=smooth, reduction="mean")

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        bce = self.bce_loss(logits, targets)
        dice = self.dice_loss(logits, targets)
        total_loss = self.bce_weight * bce + self.dice_weight * dice
        return total_loss

    def compute_components(self, logits: torch.Tensor, targets: torch.Tensor) -> Dict[str, torch.Tensor]:
        """Returns individual loss components for detailed telemetry logging."""
        bce = self.bce_loss(logits, targets)
        dice = self.dice_loss(logits, targets)
        total = self.bce_weight * bce + self.dice_weight * dice
        return {
            "total_loss": total,
            "bce_loss": bce,
            "dice_loss": dice
        }