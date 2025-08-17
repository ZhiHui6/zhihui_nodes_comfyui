import torch

class PriorityImageSwitch:
    DESCRIPTION = "优先级图像切换节点：当同时接入图像A和图像B端口，优先输出B端口的内容；如果B端口无输入，则输出图像A端口的内容；如果两个端口都无输入，则弹出提示要求至少连接一个输入端口。"
    
    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("输出图像",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/图像"

    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "optional": {  
                "图像A": ("IMAGE", {}),
                "图像B": ("IMAGE", {}),
                "图像A_注释": ("STRING", {"multiline": False, "default": "", "placeholder": "图像A的用途或说明"}),
                "图像B_注释": ("STRING", {"multiline": False, "default": "", "placeholder": "图像B的用途或说明"}),
            },
        }

    def execute(self, 图像A=None, 图像A_注释="", 图像B=None, 图像B_注释=""):
        if 图像B is not None:
            return (图像B,)
        elif 图像A is not None:
            return (图像A,)
        else:
            return (None,)
