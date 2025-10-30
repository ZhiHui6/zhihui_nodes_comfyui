import comfy
import comfy.utils
import torch
from torch.nn import functional as F

class ImageScaler:
    
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image_input": ("IMAGE",),
                "scale_basis": (["Long Side", "Short Side"], {"default": "Long Side"}),
                "target_size": ("INT", {"default": 1024, "min": 1, "max": 99999, "step": 1}),
                "interpolation_method": (["nearest", "bilinear", "bicubic", "nearest exact", "area"], {"default": "bilinear"}),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("image_output",)
    FUNCTION = "scale_image"
    CATEGORY = "Zhi.AI/image"
    DESCRIPTION = "Image Scaler: Intelligently scales images to specified dimensions based on long side or short side. Supports multiple interpolation methods (nearest neighbor, bilinear, bicubic, etc.), adjusting size while maintaining image proportions. Suitable for image preprocessing, size standardization and batch processing."

    def scale_image(self, image_input, scale_basis, target_size, interpolation_method):
        B, H, W, C = image_input.shape
        
        if scale_basis == "Long Side":
            ratio = target_size / max(W, H)
        else:
            ratio = target_size / min(W, H)
        
        new_width = int(W * ratio)
        new_height = int(H * ratio)

        image = image_input.permute(0, 3, 1, 2)
        mode = {
            "nearest": "nearest",
            "bilinear": "bilinear",
            "bicubic": "bicubic",
            "nearest exact": "nearest-exact",
            "area": "area"
        }[interpolation_method]

        scaled_image = F.interpolate(
            image,
            size=(new_height, new_width),
            mode=mode,
            align_corners=False if mode in ["bilinear", "bicubic"] else None
        )

        return (scaled_image.permute(0, 2, 3, 1),)