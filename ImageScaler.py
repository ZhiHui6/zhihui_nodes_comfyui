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
                "image": ("IMAGE",),
                "scale_base": (["long edge", "short edge"], {"default": "long edge"}),
                "target_size": ("INT", {"default": 1024, "min": 1, "max": 99999, "step": 1}),
                "interpolation": (["nearest", "bilinear", "bicubic", "nearest exact"], {"default": "bilinear"}),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("image",)
    FUNCTION = "scale_image"
    CATEGORY = "image/processing"

    def scale_image(self, image, scale_base, target_size, interpolation):
        B, H, W, C = image.shape
        
        if scale_base == "long edge":
            ratio = target_size / max(W, H)
        else:
            ratio = target_size / min(W, H)
        
        new_width = int(W * ratio)
        new_height = int(H * ratio)

        image = image.permute(0, 3, 1, 2)
        mode = {
            "nearest": "nearest",
            "bilinear": "bilinear",
            "bicubic": "bicubic",
            "nearest exact": "nearest-exact"
        }[interpolation]

        scaled_image = F.interpolate(
            image,
            size=(new_height, new_width),
            mode=mode,
            align_corners=False if mode in ["bilinear", "bicubic"] else None
        )

        return (scaled_image.permute(0, 2, 3, 1),)

NODE_CLASS_MAPPINGS = {
    "ImageScaler": ImageScaler
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "ImageScaler": "图像缩放器"
}