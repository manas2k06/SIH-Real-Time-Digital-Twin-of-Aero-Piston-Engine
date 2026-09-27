"""
Module: dataset.py
Dataset definition for semantic segmentation in GreenVision-AI.
Supports generic image/mask pairing, robust file indexing, and synthetic dataset generation for validation.
"""
import os
from pathlib import Path
from typing import List, Tuple, Optional, Callable, Dict, Any
import numpy as np
from PIL import Image, ImageDraw
import torch
from torch.utils.data import Dataset


VALID_IMG_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}


class SegmentationDataset(Dataset):
    """
    Standard PyTorch Dataset for paired image and mask segmentation.
    
    Args:
        image_dir: Path to directory containing input RGB images.
        mask_dir: Path to directory containing corresponding segmentation masks.
        transform: Callable transformation pipeline accepting (image, mask) and returning (image, mask).
        strict_pairing: If True, raises FileNotFoundError if any image lacks a matching mask.
    """
    def __init__(
        self,
        image_dir: str,
        mask_dir: str,
        transform: Optional[Callable] = None,
        strict_pairing: bool = True
    ):
        super().__init__()
        self.image_dir = Path(image_dir)
        self.mask_dir = Path(mask_dir)
        self.transform = transform
        self.pairs: List[Tuple[Path, Path]] = []

        if not self.image_dir.exists():
            raise FileNotFoundError(f"Image directory does not exist: {self.image_dir}")
        if not self.mask_dir.exists():
            raise FileNotFoundError(f"Mask directory does not exist: {self.mask_dir}")

        self._index_pairs(strict_pairing)

    def _index_pairs(self, strict: bool):
        # Index all masks by stem for quick lookup
        mask_map: Dict[str, Path] = {}
        for p in self.mask_dir.iterdir():
            if p.is_file() and p.suffix.lower() in VALID_IMG_EXTENSIONS:
                mask_map[p.stem] = p

        # Find matching images
        for img_path in sorted(self.image_dir.iterdir()):
            if img_path.is_file() and img_path.suffix.lower() in VALID_IMG_EXTENSIONS:
                stem = img_path.stem
                if stem in mask_map:
                    self.pairs.append((img_path, mask_map[stem]))
                elif strict:
                    raise FileNotFoundError(
                        f"Matching mask for image '{img_path.name}' not found in {self.mask_dir}"
                    )

        if len(self.pairs) == 0:
            raise RuntimeError(
                f"No matching image-mask pairs found in {self.image_dir} and {self.mask_dir}"
            )

    def __len__(self) -> int:
        return len(self.pairs)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor, str]:
        img_path, mask_path = self.pairs[idx]
        
        # Load image as RGB and mask as Grayscale L
        img = Image.open(img_path).convert("RGB")
        mask = Image.open(mask_path).convert("L")

        if self.transform is not None:
            img_tensor, mask_tensor = self.transform(img, mask)
        else:
            # Basic fallback to tensor
            img_np = np.array(img, dtype=np.float32) / 255.0
            img_tensor = torch.from_numpy(img_np.transpose(2, 0, 1)).float()
            
            mask_np = np.array(mask, dtype=np.float32)
            mask_np = (mask_np > 127.5).astype(np.float32) if mask_np.max() > 1.0 else (mask_np > 0.5).astype(np.float32)
            mask_tensor = torch.from_numpy(mask_np).unsqueeze(0).float()

        return img_tensor, mask_tensor, img_path.stem


def generate_synthetic_segmentation_dataset(
    output_dir: str,
    num_samples: int = 16,
    img_size: Tuple[int, int] = (512, 512),
    split_name: str = "train"
) -> Tuple[str, str]:
    """
    Generates synthetic image and binary mask pairs (e.g. geometric tree canopy discs)
    for dry-run testing and memory sanity benchmarks.
    
    Returns:
        Tuple of (images_dir_path, masks_dir_path)
    """
    base_dir = Path(output_dir) / split_name
    img_dir = base_dir / "images"
    mask_dir = base_dir / "masks"

    img_dir.mkdir(parents=True, exist_ok=True)
    mask_dir.mkdir(parents=True, exist_ok=True)

    rng = np.random.RandomState(42)

    for i in range(num_samples):
        # Create synthetic RGB background with random forest-like green/brown noise
        w, h = img_size
        img_arr = rng.randint(30, 80, size=(h, w, 3), dtype=np.uint8)
        img_arr[:, :, 1] += rng.randint(40, 100, size=(h, w), dtype=np.uint8)  # greener
        img = Image.fromarray(img_arr, mode="RGB")
        draw_img = ImageDraw.Draw(img)

        # Create binary mask (0 = background, 255 = tree canopy)
        mask = Image.new("L", (w, h), 0)
        draw_mask = ImageDraw.Draw(mask)

        # Draw 5 to 15 synthetic circular/elliptical tree crowns
        num_trees = rng.randint(5, 15)
        for _ in range(num_trees):
            cx = rng.randint(20, w - 20)
            cy = rng.randint(20, h - 20)
            rx = rng.randint(15, 45)
            ry = rng.randint(15, 45)
            bbox = [cx - rx, cy - ry, cx + rx, cy + ry]

            # Draw green canopy circle on image
            crown_color = (rng.randint(20, 60), rng.randint(120, 220), rng.randint(20, 60))
            draw_img.ellipse(bbox, fill=crown_color, outline=(10, 80, 10))
            # Draw binary mask
            draw_mask.ellipse(bbox, fill=255)

        stem = f"syn_sample_{i:04d}"
        img.save(img_dir / f"{stem}.png")
        mask.save(mask_dir / f"{stem}.png")

    return str(img_dir), str(mask_dir)