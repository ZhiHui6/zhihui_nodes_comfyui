import torch

class AutoImageSwitch:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {},
            "optional": {
                "图像A": ("IMAGE", {}),
                "图像B": ("IMAGE", {}),
                "图像C": ("IMAGE", {})
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("输出图像",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/图像"

    def execute(self, 图像A=None, 图像B=None, 图像C=None):
        images = [图像A, 图像B, 图像C]
        
        valid_inputs = []
        for i, img in enumerate(images):
            if img is not None:
                valid_inputs.append((i, img))
        
        if len(valid_inputs) > 1:
            raise ValueError("只能有一个端口输入图像，检测到多个端口同时有输入，请先禁用前端多余的输入源")
        
        if len(valid_inputs) == 0:
            empty_image = torch.zeros(1, 64, 64, 3, dtype=torch.float32)
            return (empty_image,)
        
        return (valid_inputs[0][1],)