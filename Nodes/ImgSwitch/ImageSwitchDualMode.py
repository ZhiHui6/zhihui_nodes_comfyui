import torch

class ImageSwitchDualMode:
    
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "模式": (["手动", "自动"], {"default": "手动"}),
                "选择图像": (["1", "2", "3", "4"], {"default": "1"}),
            },
            "optional": {
                "图像1": ("IMAGE", {}),
                "图像2": ("IMAGE", {}),
                "图像3": ("IMAGE", {}),
                "图像4": ("IMAGE", {}),
                "图像1_注释": ("STRING", {"multiline": False, "default": "", "placeholder": "图像1说明"}),
                "图像2_注释": ("STRING", {"multiline": False, "default": "", "placeholder": "图像2说明"}),
                "图像3_注释": ("STRING", {"multiline": False, "default": "", "placeholder": "图像3说明"}),
                "图像4_注释": ("STRING", {"multiline": False, "default": "", "placeholder": "图像4说明"}),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("输出图像",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/图像"

    def execute(self, 模式, 选择图像, 图像1=None, 图像2=None, 图像3=None, 图像4=None,
                图像1_注释="", 图像2_注释="", 图像3_注释="", 图像4_注释=""):
        
        images = [图像1, 图像2, 图像3, 图像4]
        
        if 模式 == "手动":
            idx = int(选择图像) - 1
            if idx < 0 or idx > 3:
                idx = 0
            
            if images[idx] is not None:
                return (images[idx],)
            else:
                for i, img in enumerate(images):
                    if img is not None:
                        return (img,)
                empty_image = torch.zeros(1, 64, 64, 3, dtype=torch.float32)
                return (empty_image,)
        
        else:
            connected_indices = [i+1 for i, img in enumerate(images) if img is not None]
            connected_count = len(connected_indices)
            
            if connected_count == 0:
                empty_image = torch.zeros(1, 64, 64, 3, dtype=torch.float32)
                return (empty_image,)
            elif connected_count >= 2:
                if connected_count == 2:
                    ports = f"图像{connected_indices[0]}和图像{connected_indices[1]}"
                elif connected_count == 3:
                    ports = f"图像{connected_indices[0]}、图像{connected_indices[1]}、图像{connected_indices[2]}"
                else:
                    ports = f"图像{connected_indices[0]}、图像{connected_indices[1]}、图像{connected_indices[2]}、图像{connected_indices[3]}"
                
                raise ValueError(
                    f"自动模式错误：检测到{ports}同时有输入。\n"
                    f"解决方案：\n"
                    f"1. 禁用其他上游节点的输出，仅保留一个图像输入\n"
                    f"2. 切换到手动模式，选择要输出的图像\n"
                )
            
            for i, img in enumerate(images):
                if img is not None:
                    return (img,)