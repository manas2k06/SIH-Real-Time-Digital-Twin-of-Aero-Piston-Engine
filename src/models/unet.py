"""
Module: unet.py
Standard 4-level U-Net architecture for semantic segmentation.
Designed for GreenVision-AI with configurable in/out channels and base filter capacity.
Compatible with PyTorch 2.4+ and CUDA mixed-precision (AMP).
"""
import torch
import torch.nn as nn
from typing import Dict, Any, Tuple


class DoubleConv(nn.Module):
    """
    [Conv2d -> BatchNorm2d -> ReLU] x 2
    Preserves spatial resolution (padding=1, kernel_size=3).
    """
    def __init__(self, in_channels: int, out_channels: int, mid_channels: int = None):
        super().__init__()
        if mid_channels is None:
            mid_channels = out_channels
        self.double_conv = nn.Sequential(
            nn.Conv2d(in_channels, mid_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(mid_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(mid_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.double_conv(x)


class Down(nn.Module):
    """
    Downscaling with MaxPool2d (stride=2) followed by DoubleConv.
    """
    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()
        self.maxpool_conv = nn.Sequential(
            nn.MaxPool2d(kernel_size=2, stride=2),
            DoubleConv(in_channels, out_channels)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.maxpool_conv(x)


class Up(nn.Module):
    """
    Upscaling with ConvTranspose2d (or Bilinear interpolation) + Skip Connection Concat + DoubleConv.
    """
    def __init__(self, in_channels: int, out_channels: int, bilinear: bool = False):
        super().__init__()
        if bilinear:
            self.up = nn.Upsample(scale_factor=2, mode='bilinear', align_corners=True)
            self.conv = DoubleConv(in_channels, out_channels, in_channels // 2)
        else:
            self.up = nn.ConvTranspose2d(in_channels, in_channels // 2, kernel_size=2, stride=2)
            self.conv = DoubleConv(in_channels, out_channels)

    def forward(self, x1: torch.Tensor, x2: torch.Tensor) -> torch.Tensor:
        """
        x1: Feature map from lower decoder level.
        x2: Skip connection feature map from encoder.
        """
        x1 = self.up(x1)
        
        # Handle potential odd dimension padding
        diff_y = x2.size()[2] - x1.size()[2]
        diff_x = x2.size()[3] - x1.size()[3]

        if diff_y != 0 or diff_x != 0:
            x1 = nn.functional.pad(
                x1, [diff_x // 2, diff_x - diff_x // 2, diff_y // 2, diff_y - diff_y // 2]
            )

        # Concatenate along channel dimension
        x = torch.cat([x2, x1], dim=1)
        return self.conv(x)


class OutConv(nn.Module):
    """
    Final 1x1 convolution mapping feature maps to class logits.
    Returns raw logits (no sigmoid or softmax).
    """
    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.conv(x)


class UNet(nn.Module):
    """
    Modular 4-level U-Net for semantic segmentation.
    
    Parameters:
        in_channels: Number of input spectral bands (e.g. 3 for RGB, 4 for RGB+NIR).
        out_channels: Number of target classes (1 for binary canopy segmentation).
        base_channels: Number of initial feature filters (default 32 for RTX 3050 4GB VRAM safety).
        bilinear: If True, uses bilinear interpolation instead of transposed conv for upsampling.
    """
    def __init__(
        self,
        in_channels: int = 3,
        out_channels: int = 1,
        base_channels: int = 32,
        bilinear: bool = False
    ):
        super().__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.base_channels = base_channels
        self.bilinear = bilinear

        b = base_channels  # e.g. 32 -> [32, 64, 128, 256, 512]

        # Encoder (Contracting Path)
        self.inc = DoubleConv(in_channels, b)
        self.down1 = Down(b, b * 2)
        self.down2 = Down(b * 2, b * 4)
        self.down3 = Down(b * 4, b * 8)
        factor = 2 if bilinear else 1
        self.down4 = Down(b * 8, (b * 16) // factor)

        # Decoder (Expanding Path)
        self.up1 = Up(b * 16, (b * 8) // factor, bilinear)
        self.up2 = Up(b * 8, (b * 4) // factor, bilinear)
        self.up3 = Up(b * 4, (b * 2) // factor, bilinear)
        self.up4 = Up(b * 2, b, bilinear)
        
        # Output Logits
        self.outc = OutConv(b, out_channels)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass returning raw logits of shape (B, out_channels, H, W).
        """
        x1 = self.inc(x)
        x2 = self.down1(x1)
        x3 = self.down2(x2)
        x4 = self.down3(x3)
        x5 = self.down4(x4)
        
        x = self.up1(x5, x4)
        x = self.up2(x, x3)
        x = self.up3(x, x2)
        x = self.up4(x, x1)
        
        logits = self.outc(x)
        return logits

    def get_parameter_count(self) -> Dict[str, int]:
        """Returns total and trainable parameter counts."""
        total = sum(p.numel() for p in self.parameters())
        trainable = sum(p.numel() for p in self.parameters() if p.requires_grad)
        return {"total_parameters": total, "trainable_parameters": trainable}


def create_unet(
    in_channels: int = 3,
    out_channels: int = 1,
    base_channels: int = 32,
    bilinear: bool = False
) -> UNet:
    """Factory helper to instantiate U-Net with parameter logging."""
    model = UNet(
        in_channels=in_channels,
        out_channels=out_channels,
        base_channels=base_channels,
        bilinear=bilinear
    )
    return model
