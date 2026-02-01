import re

class PromptDelete:
    @classmethod
    def INPUT_TYPES(s):  
        optional = {}
        for i in range(1, 11):
            optional[f"find_{i}"] = ("STRING", {"multiline": False, "default": ""})
        return {
            "required": {
                "text_input": ("STRING", {"forceInput": True, "multiline": True, "default": ""}),
                "inputcount": ("INT", {"default": 3, "min": 1, "max": 10, "step": 1}),
                "auto_format": ("BOOLEAN", {"default": False}),
            },
            "optional": optional,
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text_output",)
    FUNCTION = "delete_text"
    OUTPUT_NODE = False
    CATEGORY = "Zhi.AI/Text"
    DESCRIPTION = "Prompt Deletion: Search and delete text with up to 10 search strings. Optional auto-formatting."

    def delete_text(self, text_input, inputcount, auto_format=False, **kwargs):
        if text_input is None:
            text_input = ""
            
        out = text_input
        try:
            inputcount = int(inputcount)
        except Exception:
            inputcount = 0
        inputcount = max(0, min(10, inputcount))
        
        # Deletion logic
        for i in range(1, inputcount + 1):
            find_key = f"find_{i}"
            find_val = kwargs.get(find_key, "")
            
            if find_val:
                out = out.replace(str(find_val), "")
        
        if auto_format:
            out = out.replace('，', ',')
            out = re.sub(r'(?<!\d)\.(?!\d)', ',', out)
            out = re.sub(r'\s+', ' ', out)
            out = re.sub(r'\s*,\s*', ',', out)
            out = re.sub(r',+', ',', out)
            out = out.replace(',', ', ')
            out = out.strip().strip(',').strip()
        return (out,)