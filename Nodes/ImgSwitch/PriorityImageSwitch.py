import torch

class PriorityImageSwitch:
    DESCRIPTION = "Outputs image B when both inputs are connected, falls back to image A, and warns when neither is connected."
    
    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("output_image",)
    FUNCTION = "execute"
    CATEGORY = "Zhi.AI/Image"

    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "optional": {  
                "imageA": ("IMAGE", {}),
                "imageB": ("IMAGE", {}),
                "imageA_note": ("STRING", {"multiline": False, "default": "", "placeholder": "Purpose or description of image A"}),
                "imageB_note": ("STRING", {"multiline": False, "default": "", "placeholder": "Purpose or description of image B"}),
            },
        }

    def execute(self, imageA=None, imageA_note="", imageB=None, imageB_note=""):
        if imageB is not None:
            return (imageB,)
        elif imageA is not None:
            return (imageA,)
        else:
            return (None,)
