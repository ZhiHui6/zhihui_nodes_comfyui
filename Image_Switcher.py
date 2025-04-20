import comfy
import comfy.sd
import comfy.utils
import torch

class ImageSwitch:
        
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "图像1_注释": ("STRING", {"multiline": False, "default": ""}),
                "图像1": ("IMAGE", {"forceInput": True}),
                "图像2_注释": ("STRING", {"multiline": False, "default": ""}),
                "图像2": ("IMAGE", {"forceInput": True})
            },
            "optional": {
                "选择切换": (["1", "2"], {"default": "1"})
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("输出图像",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/图像"

    def execute(self, 图像1_注释, 图像2_注释, 图像1, 图像2, 选择切换):
        images = [图像1, 图像2]
        return (images[int(选择切换)-1],)

NODE_CLASS_MAPPINGS = {
    "ImageSwitch": ImageSwitch
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "ImageSwitch": "ImageSwitch"
}