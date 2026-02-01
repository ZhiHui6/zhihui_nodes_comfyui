class PromptReplace:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "text_input": ("STRING", {"forceInput": True, "multiline": True, "default": ""}),
                "inputcount": ("INT", {"default": 3, "min": 3, "max": 10, "step": 1}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text_output",)
    FUNCTION = "replace_text"
    OUTPUT_NODE = False
    CATEGORY = "Zhi.AI/Text"
    DESCRIPTION = "Prompt Replacement: Search and replace text with up to 50 pairs of strings."

    def replace_text(self, text_input, inputcount, **kwargs):
        if text_input is None:
            text_input = ""
            
        out = text_input
        
        for i in range(1, inputcount + 1):
            find_key = f"find_{i}"
            replace_key = f"replace_{i}"
            
            find_val = kwargs.get(find_key, "")
            replace_val = kwargs.get(replace_key, "")
            
            if find_val:
                out = out.replace(str(find_val), str(replace_val))
                
        return (out,)
