class PromptReplace:
    @classmethod
    def INPUT_TYPES(s):  
        optional = {}
        for i in range(1, 11):
            optional[f"find_{i}"] = ("STRING", {"multiline": False, "default": ""})
            optional[f"replace_{i}"] = ("STRING", {"multiline": False, "default": ""})
        return {
            "required": {
                "text_input": ("STRING", {"forceInput": True, "multiline": True, "default": ""}),
                "inputcount": ("INT", {"default": 3, "min": 3, "max": 10, "step": 1}),
                "unify_replace": ("BOOLEAN", {"default": False}),
                "unified_replace": ("STRING", {"multiline": False, "default": ""}),
            },
            "optional": optional,
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text_output",)
    FUNCTION = "replace_text"
    OUTPUT_NODE = False
    CATEGORY = "Zhi.AI/Text"
    DESCRIPTION = "Prompt Replacement: Search and replace text with up to 10 pairs of strings."

    def replace_text(self, text_input, inputcount, unify_replace=False, unified_replace="", **kwargs):
        if text_input is None:
            text_input = ""
            
        out = text_input
        try:
            inputcount = int(inputcount)
        except Exception:
            inputcount = 0
        inputcount = max(0, min(10, inputcount))
        if unified_replace is None:
            unified_replace = ""
        
        for i in range(1, inputcount + 1):
            find_key = f"find_{i}"
            replace_key = f"replace_{i}"
            
            find_val = kwargs.get(find_key, "")
            if unify_replace:
                replace_val = unified_replace
            else:
                replace_val = kwargs.get(replace_key, "")
            if replace_val is None:
                replace_val = ""
            
            if find_val:
                out = out.replace(str(find_val), str(replace_val))
                
        return (out,)