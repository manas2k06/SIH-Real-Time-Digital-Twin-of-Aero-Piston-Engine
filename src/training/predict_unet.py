"""
Module: predict_unet.py
Inference and visualization script for U-Net binary canopy segmentation.
Generates binary segmentation masks and visual overlays from images.
"""
import argparse
import sys
from pathlib import Path
from typing import List

import cv2
import numpy as np
from PIL import Image
import torch
import torchvision.transforms.functional as TF

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.models.unet import create_unet

VALID_IMG_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}


def parse_args():
    parser = argparse.ArgumentParser(description="Predict canopy masks using trained U-Net.")
    parser.add_argument("--weights", type=str, required=True, help="Path to checkpoint .pt file.")
    parser.add_argument("--source", type=str, required=True, help="Path to image file or directory.")
    parser.add_argument("--output-dir", type=str, default="runs/unet/predictions", help="Output directory.")
    parser.add_argument("--image-size", type=int, nargs=2, default=[512, 512], help="Inference resolution (H W).")
    parser.add_argument("--threshold", type=float, default=0.5, help="Binary classification threshold.")
    parser.add_argument("--overlay", action="store_true", default=True, help="Generate visual alpha blend overlay.")
    parser.add_argument("--device", type=str, default="cuda:0", help="Inference compute device.")
    return parser.parse_args()


def predict_single_image(
    model: torch.nn.Module,
    img_path: Path,
    image_size: tuple,
    threshold: float,
    device: torch.device
) -> tuple:
    orig_img = Image.open(img_path).convert("RGB")
    orig_w, orig_h = orig_img.size

    # Resize and normalize
    resized_img = TF.resize(orig_img, image_size, interpolation=TF.InterpolationMode.BILINEAR)
    img_tensor = TF.to_tensor(resized_img)
    img_tensor = TF.normalize(img_tensor, mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    img_tensor = img_tensor.unsqueeze(0).to(device)

    with torch.no_grad(), torch.amp.autocast(device_type="cuda" if "cuda" in device.type else "cpu"):
        logits = model(img_tensor)
        probs = torch.sigmoid(logits)

    mask_prob = probs.squeeze().cpu().numpy()
    binary_mask = (mask_prob >= threshold).astype(np.uint8) * 255

    # Resize back to original dimensions
    binary_mask_orig = cv2.resize(binary_mask, (orig_w, orig_h), interpolation=cv2.INTER_NEAREST)
    return np.array(orig_img), binary_mask_orig


def main():
    args = parse_args()
    weights_path = Path(args.weights)
    if not weights_path.exists():
        raise FileNotFoundError(f"Checkpoint file not found: {weights_path}")

    device = torch.device(args.device if torch.cuda.is_available() and "cuda" in args.device else "cpu")
    print(f"[INFO] Loading model from {weights_path} on device {device}...")

    checkpoint = torch.load(weights_path, map_location=device)
    config = checkpoint.get("config", {})
    model_cfg = config.get("model", {})

    model = create_unet(
        in_channels=model_cfg.get("in_channels", 3),
        out_channels=model_cfg.get("out_channels", 1),
        base_channels=model_cfg.get("base_channels", 32),
        bilinear=model_cfg.get("bilinear", False)
    ).to(device)

    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    source_path = Path(args.source)
    if source_path.is_file():
        image_files = [source_path]
    elif source_path.is_dir():
        image_files = [p for p in sorted(source_path.iterdir()) if p.suffix.lower() in VALID_IMG_EXTENSIONS]
    else:
        raise FileNotFoundError(f"Source path not found: {source_path}")

    out_dir = Path(args.output_dir)
    masks_out = out_dir / "masks"
    overlays_out = out_dir / "overlays"
    masks_out.mkdir(parents=True, exist_ok=True)
    if args.overlay:
        overlays_out.mkdir(parents=True, exist_ok=True)

    print(f"[INFO] Processing {len(image_files)} image(s)...")
    for img_p in image_files:
        orig_np, bin_mask = predict_single_image(
            model=model,
            img_path=img_p,
            image_size=tuple(args.image_size),
            threshold=args.threshold,
            device=device
        )

        # Save binary mask
        cv2.imwrite(str(masks_out / f"{img_p.stem}_mask.png"), bin_mask)

        # Save visual overlay
        if args.overlay:
            bgr_img = cv2.cvtColor(orig_np, cv2.COLOR_RGB2BGR)
            green_color = np.zeros_like(bgr_img)
            green_color[:, :] = [0, 255, 0]  # Green in BGR
            
            mask_bool = (bin_mask > 0)
            overlay = bgr_img.copy()
            overlay[mask_bool] = cv2.addWeighted(bgr_img[mask_bool], 0.5, green_color[mask_bool], 0.5, 0)
            
            cv2.imwrite(str(overlays_out / f"{img_p.stem}_overlay.png"), overlay)

    print(f"[INFO] Predictions saved to {out_dir.resolve()}")


if __name__ == "__main__":
    main()