"""
Module: transforms.py
Synchronized spatial and photometric transformations for image-mask pairs in semantic segmentation.
Ensures identical geometric manipulations (flips, rotations, crops) while preserving mask discrete values via NEAREST interpolation.
"""
import random
from typing import Tuple, Optional, Sequence
import numpy as np
import torch
import torchvision.transforms.functional as TF
from PIL import Image


class Compose:
    """Composes several transforms together for (image, mask) pairs."""
    def __init__(self, transforms: Sequence):
        self.transforms = transforms

    def __call__(self, img: Image.Image, mask: Image.Image) -> Tuple[torch.Tensor, torch.Tensor]:
        for t in self.transforms:
            img, mask = t(img, mask)
        return img, mask


class Resize:
    """
    Resize image and mask.
    Image uses BILINEAR interpolation; Mask strictly uses NEAREST interpolation to preserve class IDs.
    """
    def __init__(self, size: Tuple[int, int]):
        self.size = size  # (H, W)

    def __call__(self, img: Image.Image, mask: Image.Image) -> Tuple[Image.Image, Image.Image]:
        img = TF.resize(img, self.size, interpolation=TF.InterpolationMode.BILINEAR)
        mask = TF.resize(mask, self.size, interpolation=TF.InterpolationMode.NEAREST)
        return img, mask


class RandomHorizontalFlip:
    """Random horizontal flip applied synchronously to image and mask."""
    def __init__(self, p: float = 0.5):
        self.p = p

    def __call__(self, img: Image.Image, mask: Image.Image) -> Tuple[Image.Image, Image.Image]:
        if random.random() < self.p:
            return TF.hflip(img), TF.hflip(mask)
        return img, mask


class RandomVerticalFlip:
    """Random vertical flip applied synchronously to image and mask."""
    def __init__(self, p: float = 0.5):
        self.p = p

    def __call__(self, img: Image.Image, mask: Image.Image) -> Tuple[Image.Image, Image.Image]:
        if random.random() < self.p:
            return TF.vflip(img), TF.vflip(mask)
        return img, mask


class RandomRotation90:
    """Random orthogonal rotation (0, 90, 180, 270 degrees) applied synchronously."""
    def __init__(self, p: float = 0.5):
        self.p = p

    def __call__(self, img: Image.Image, mask: Image.Image) -> Tuple[Image.Image, Image.Image]:
        if random.random() < self.p:
            angle = random.choice([90, 180, 270])
            img = TF.rotate(img, angle, interpolation=TF.InterpolationMode.BILINEAR)
            mask = TF.rotate(mask, angle, interpolation=TF.InterpolationMode.NEAREST)
        return img, mask


class ToTensor:
    """
    Converts PIL Image / numpy array to PyTorch Tensors.
    - Image: scaled to [0.0, 1.0] float32 tensor of shape (C, H, W)
    - Mask: converted to float32 tensor of shape (1, H, W) with discrete binary values {0.0, 1.0}
    """
    def __call__(self, img: Image.Image, mask: Image.Image) -> Tuple[torch.Tensor, torch.Tensor]:
        img_tensor = TF.to_tensor(img)  # (C, H, W) in [0, 1]
        
        # Mask conversion: ensure binary {0, 1} and shape (1, H, W)
        mask_np = np.array(mask, dtype=np.float32)
        if mask_np.ndim == 2:
            mask_np = np.expand_dims(mask_np, axis=0)  # (1, H, W)
        elif mask_np.ndim == 3:
            mask_np = mask_np[:, :, 0:1].transpose(2, 0, 1)
        
        # Binarize if mask contains 255
        if mask_np.max() > 1.0:
            mask_np = (mask_np > 127.5).astype(np.float32)
        else:
            mask_np = (mask_np > 0.5).astype(np.float32)

        mask_tensor = torch.from_numpy(mask_np).float()
        return img_tensor, mask_tensor


class Normalize:
    """Normalizes image tensor with given mean and std (mask is untouched)."""
    def __init__(
        self,
        mean: Sequence[float] = (0.485, 0.456, 0.406),
        std: Sequence[float] = (0.229, 0.224, 0.225)
    ):
        self.mean = mean
        self.std = std

    def __call__(self, img: torch.Tensor, mask: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        img = TF.normalize(img, mean=list(self.mean), std=list(self.std))
        return img, mask


def get_train_transforms(image_size: Tuple[int, int] = (512, 512)) -> Compose:
    """Default training augmentation pipeline."""
    return Compose([
        Resize(image_size),
        RandomHorizontalFlip(p=0.5),
        RandomVerticalFlip(p=0.5),
        RandomRotation90(p=0.5),
        ToTensor(),
        Normalize()
    ])


def get_val_transforms(image_size: Tuple[int, int] = (512, 512)) -> Compose:
    """Validation / evaluation transformation pipeline."""
    return Compose([
        Resize(image_size),
        ToTensor(),
        Normalize()
    ])