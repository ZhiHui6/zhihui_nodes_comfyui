class TriggerWordMerger:
    def __init__(self):
        self.cached_text = ""
        self.cached_trigger = ""
        
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "文本输入": ("STRING", {"multiline": True, "forceInput": True, "default": ""}),
                "触发词": ("STRING", {"multiline": False, "default": ""}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("文本输出",)
    FUNCTION = "merge_text"
    CATEGORY = "zhihui/文本"

    def merge_text(self, 触发词, 文本输入):

        self.cached_trigger = 触发词.strip()
        self.cached_text = 文本输入.strip() if 文本输入 else ""
        
        if not self.cached_trigger:
            return (self.cached_text,)
            
        if not self.cached_text:
            return (self.cached_trigger,)
            
        return (f"{self.cached_trigger}, {self.cached_text}",)

NODE_CLASS_MAPPINGS = {
    "TriggerWordMerger": TriggerWordMerger
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "TriggerWordMerger": "Trigger Word Merger"
}