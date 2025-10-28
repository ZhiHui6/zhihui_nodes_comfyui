import hashlib
import os
import folder_paths
import torch
import numpy as np
from PIL import Image, ImageOps

class ImageLoader:
    @classmethod
    def INPUT_TYPES(s):
        input_dir = folder_paths.get_input_directory()
        files = [
            f
            for f in os.listdir(input_dir)
            if os.path.isfile(os.path.join(input_dir, f))
            and f.split(".")[-1] in ["jpg", "jpeg", "png", "bmp", "tiff", "webp"]
        ]
        return {
            "required": {"image": (sorted(files), {"image_upload": True})},
        }

    CATEGORY = "Comfyui_Qwen3VL"
    RETURN_TYPES = ("PATH", "IMAGE", "MASK")
    RETURN_NAMES = ("image_path", "image", "mask")
    FUNCTION = "load_image"

    def load_image(self, image):
        image_path = folder_paths.get_annotated_filepath(image)
        
        # Load image using PIL
        img = Image.open(image_path)
        
        # Handle different image modes
        if img.mode == 'RGBA':
            # Extract alpha channel for mask
            alpha = img.split()[-1]
            # Convert alpha to mask tensor (1 channel, values 0-1)
            mask_array = np.array(alpha).astype(np.float32) / 255.0
            mask = torch.from_numpy(mask_array)[None, None, :, :]  # [1, 1, H, W]
            
            # Convert RGBA to RGB for image output
            img_rgb = img.convert('RGB')
        else:
            # Convert to RGB if not already
            img_rgb = img.convert('RGB')
            
            # Create default mask (all white/opaque)
            mask_array = np.ones((img_rgb.height, img_rgb.width), dtype=np.float32)
            mask = torch.from_numpy(mask_array)[None, None, :, :]  # [1, 1, H, W]
        
        # Convert PIL image to tensor
        img_array = np.array(img_rgb).astype(np.float32) / 255.0
        image_tensor = torch.from_numpy(img_array)[None, :, :, :]  # [1, H, W, C]
        
        return (image_path, image_tensor, mask)

    @classmethod
    def IS_CHANGED(s, image):
        image_path = folder_paths.get_annotated_filepath(image)
        m = hashlib.sha256()
        with open(image_path, "rb") as f:
            m.update(f.read())
        return m.digest().hex()

    @classmethod
    def VALIDATE_INPUTS(s, image):
        if not folder_paths.exists_annotated_filepath(image):
            return "Invalid image file: {}".format(image)

        return True