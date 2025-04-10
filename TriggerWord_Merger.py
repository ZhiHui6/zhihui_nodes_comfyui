class TriggerWordMerger:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "input_port": ("STRING", {"multiline": True, "forceInput": True}),
                "trigger_words": ("STRING", {"multiline": False, "default": ""}),
            },
            
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("merged_text",)
    FUNCTION = "merge_text"
    CATEGORY = "text"

    def merge_text(self, trigger_words, input_port, show_token_count=False):
        trigger_words = trigger_words.strip()
        merged_text = input_port if input_port else ""

        if trigger_words:
            separator = ", " if merged_text else ","
            merged_text = f"{trigger_words}{separator}{merged_text}"
        
        return (merged_text,)

NODE_CLASS_MAPPINGS = {
    "TriggerWordMerger": TriggerWordMerger
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "TriggerWordMerger": "Trigger Word Merger"
}

print("Loaded node: TriggerWordMerger (TriggerWord_Merger.py)")