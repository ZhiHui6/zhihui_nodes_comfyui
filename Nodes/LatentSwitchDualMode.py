import torch

class LatentSwitchDualMode:

    
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "模式": (["手动", "自动"], {"default": "手动"}),
                "选择通道": (["1", "2", "3"], {"default": "1"}),
            },
            "optional": {
                "Latent_1": ("LATENT", {}),
                "Latent_2": ("LATENT", {}),
                "Latent_3": ("LATENT", {}),
                "Latent_1_注释": ("STRING", {"multiline": False, "default": "", "placeholder": "Latent 1的用途或说明"}),
                "Latent_2_注释": ("STRING", {"multiline": False, "default": "", "placeholder": "Latent 2的用途或说明"}),
                "Latent_3_注释": ("STRING", {"multiline": False, "default": "", "placeholder": "Latent 3的用途或说明"}),
            }
        }

    RETURN_TYPES = ("LATENT",)
    RETURN_NAMES = ("输出Latent",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/Latent"

    def execute(self, 模式, 选择通道, Latent_1=None, Latent_2=None, Latent_3=None, 
                Latent_1_注释="", Latent_2_注释="", Latent_3_注释=""):
        
        latents = [Latent_1, Latent_2, Latent_3]
        
        if 模式 == "手动":
            idx = int(选择通道) - 1
            if idx < 0 or idx > 2:
                idx = 0
            
            if latents[idx] is not None:
                return (latents[idx],)
            else:
                for i, latent in enumerate(latents):
                    if latent is not None:
                        return (latent,)
                return (None,)
        
        else:
            connected_indices = [i+1 for i, latent in enumerate(latents) if latent is not None]
            connected_count = len(connected_indices)
            
            if connected_count == 0:
                raise ValueError("自动模式错误：至少需要连接一个Latent输入")
            elif connected_count >= 2:
                if connected_count == 2:
                    ports = f"Latent_{connected_indices[0]}和Latent_{connected_indices[1]}"
                else:
                    ports = f"Latent_{connected_indices[0]}、Latent_{connected_indices[1]}、Latent_{connected_indices[2]}"
                
                raise ValueError(
                    f"自动模式错误：检测到{ports}同时有输入。\n"
                    f"解决方案：\n"
                    f"1. 禁用其他上游节点的输出，仅保留一个Latent输入\n"
                    f"2. 切换到手动模式，选择要输出的Latent\n"
                )
            
            for i, latent in enumerate(latents):
                if latent is not None:
                    return (latent,)