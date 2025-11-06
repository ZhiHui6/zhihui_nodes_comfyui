import hashlib
import os
import folder_paths
import torch
import numpy as np
from PIL import Image, ImageOps

class ImageLoader:
    CATEGORY = "Zhi.AI/Qwen3VL"
    RETURN_TYPES = ("PATH", "IMAGE", "MASK")
    RETURN_NAMES = ("image_path", "image", "mask")
    FUNCTION = "load_image"
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
            "required": {
                "enable_node": ("BOOLEAN", {"default": True}),
                "image": (sorted(files), {"image_upload": True}),
            },
        }

    def load_image(self, image, enable_node=True):
        if not enable_node:
            
            empty_image = torch.zeros((1, 64, 64, 3), dtype=torch.float32)
            empty_mask = torch.zeros((1, 1, 64, 64), dtype=torch.float32)
            return ("", empty_image, empty_mask)
            
        image_path = folder_paths.get_annotated_filepath(image)
        
        img = Image.open(image_path)
        
        if img.mode == 'RGBA':
            alpha = img.split()[-1]
            mask_array = np.array(alpha).astype(np.float32) / 255.0
            mask = torch.from_numpy(mask_array)[None, None, :, :]   
            img_rgb = img.convert('RGB')
        else:
            img_rgb = img.convert('RGB')
            mask_array = np.ones((img_rgb.height, img_rgb.width), dtype=np.float32)
            mask = torch.from_numpy(mask_array)[None, None, :, :]
        
        img_array = np.array(img_rgb).astype(np.float32) / 255.0
        image_tensor = torch.from_numpy(img_array)[None, :, :, :]
        
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
            return "无效的图片文件: {}".format(image)

        return True