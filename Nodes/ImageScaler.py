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
                "图像输入": ("IMAGE",),
                "缩放依据": (["长边", "短边"], {"default": "长边"}),
                "目标尺寸": ("INT", {"default": 1024, "min": 1, "max": 99999, "step": 1}),
                "插值方式": (["nearest", "bilinear", "bicubic", "nearest exact", "area"], {"default": "bilinear"}),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("图像输出",)
    FUNCTION = "scale_image"
    CATEGORY = "zhihui/图像"

    def scale_image(self, 图像输入, 缩放依据, 目标尺寸, 插值方式):
        B, H, W, C = 图像输入.shape
        
        if 缩放依据 == "长边":
            ratio = 目标尺寸 / max(W, H)
        else:
            ratio = 目标尺寸 / min(W, H)
        
        new_width = int(W * ratio)
        new_height = int(H * ratio)

        image = 图像输入.permute(0, 3, 1, 2)
        mode = {
            "nearest": "nearest",
            "bilinear": "bilinear",
            "bicubic": "bicubic",
            "nearest exact": "nearest-exact",
            "area": "area"
        }[插值方式]

        scaled_image = F.interpolate(
            image,
            size=(new_height, new_width),
            mode=mode,
            align_corners=False if mode in ["bilinear", "bicubic"] else None
        )

        return (scaled_image.permute(0, 2, 3, 1),)