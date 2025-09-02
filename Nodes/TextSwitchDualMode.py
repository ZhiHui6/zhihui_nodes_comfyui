class TextSwitchDualMode:
    
    def __init__(self):
        self.text_cache = {"文本1": "", "文本2": "", "文本3": "", "文本4": ""}

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "模式": (["手动", "自动"], {"default": "手动"}),
                "选择文本": (["1", "2", "3", "4"], {"default": "1"}),
                "文本1_注释": ("STRING", {"multiline": False, "default": ""}),
                "文本2_注释": ("STRING", {"multiline": False, "default": ""}),
                "文本3_注释": ("STRING", {"multiline": False, "default": ""}),
                "文本4_注释": ("STRING", {"multiline": False, "default": ""}),
            },
            "optional": {
                "文本1": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
                "文本2": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
                "文本3": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
                "文本4": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("输出文本",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/文本"
    DESCRIPTION = "文本切换器：根据布尔开关在两个文本输入之间进行选择。当开关为True时输出文本A，为False时输出文本B，适用于条件性文本选择和工作流程的分支控制。"

    def execute(self, 模式, 选择文本, 文本1_注释, 文本2_注释, 文本3_注释, 文本4_注释,
                文本1="", 文本2="", 文本3="", 文本4=""):
        
        texts = [文本1, 文本2, 文本3, 文本4]
        
        self.text_cache["文本1"] = 文本1
        self.text_cache["文本2"] = 文本2
        self.text_cache["文本3"] = 文本3
        self.text_cache["文本4"] = 文本4
        
        if 模式 == "手动":
            idx = int(选择文本) - 1
            if idx < 0 or idx > 3:
                idx = 0
            
            selected_text = texts[idx]
            if selected_text is not None and selected_text.strip() != "":
                return (selected_text,)
            else:
                for text in texts:
                    if text is not None and text.strip() != "":
                        return (text,)
                return ("",)
        
        else:
            valid_inputs = []
            for i, text in enumerate(texts):
                if text is not None and text.strip() != "":
                    valid_inputs.append((i+1, text))
            
            connected_count = len(valid_inputs)
            
            if connected_count == 0:
                return ("",)
            elif connected_count >= 2:
                if connected_count == 2:
                    ports = f"文本{valid_inputs[0][0]}和文本{valid_inputs[1][0]}"
                elif connected_count == 3:
                    ports = f"文本{valid_inputs[0][0]}、文本{valid_inputs[1][0]}、文本{valid_inputs[2][0]}"
                else:
                    ports = f"文本{valid_inputs[0][0]}、文本{valid_inputs[1][0]}、文本{valid_inputs[2][0]}、文本{valid_inputs[3][0]}"
                
                raise ValueError(
                    f"自动模式错误：检测到{ports}同时有输入。\n"
                    f"解决方案：\n"
                    f"1. 禁用其他上游节点的输出，仅保留一个文本输入\n"
                    f"2. 切换到手动模式，选择要输出的文本\n"
                )
            
            return (valid_inputs[0][1],)