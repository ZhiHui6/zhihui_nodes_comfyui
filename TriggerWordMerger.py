class TriggerWordMerger:
    def __init__(self):
        self.cached_text = ""
        self.cached_trigger = ""
        
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "触发词": ("STRING", {"multiline": False, "default": ""}),
                "添加权重": ("BOOLEAN", {"default": False}),
                "权重值": ("FLOAT", {"default": 1.0, "min": 0.1, "max": 2.0, "step": 0.1, "round": 0.1, "display": "slider"}),
            },

            "optional": {
                "文本输入": ("STRING", {"multiline": True, "default": "", "forceInput": True, "optional": True}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("文本输出",)
    FUNCTION = "merge_text"
    CATEGORY = "zhihui/文本"

    def merge_text(self, 触发词, 文本输入=None, 添加权重=False, 权重值=1.0):

        self.cached_trigger = 触发词.strip()
        self.cached_text = "" if 文本输入 is None else 文本输入.strip()
        
        if 添加权重 and self.cached_trigger:
            权重值 = round(权重值, 1)
            self.cached_trigger = f"({self.cached_trigger}:{权重值})"

        if not self.cached_trigger:
            return (self.cached_text,)
            
        if not self.cached_text:
            return (self.cached_trigger,)
            
        return (f"{self.cached_trigger}, {self.cached_text}",)