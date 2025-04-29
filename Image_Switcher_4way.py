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
                "图像2_注释": ("STRING", {"multiline": False, "default": ""}),
                "图像3_注释": ("STRING", {"multiline": False, "default": ""}),
                "图像4_注释": ("STRING", {"multiline": False, "default": ""})
            },
            "optional": {
                "图像1": ("IMAGE", {}),
                "图像2": ("IMAGE", {}),
                "图像3": ("IMAGE", {}),
                "图像4": ("IMAGE", {}),
                "选择图像": (["1", "2", "3", "4"], {"default": "1"})
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("输出图像",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/图像"

    def execute(self, 图像1_注释, 图像2_注释, 图像3_注释, 图像4_注释, 图像1=None, 图像2=None, 图像3=None, 图像4=None, 选择图像="1"):
        images = [图像1, 图像2, 图像3, 图像4]
        idx = int(选择图像)-1
        if idx < 0 or idx > 3: # 修正索引范围检查
            return (None,)
        if images[idx] is None:
            return (None,)
        return (images[idx],)