class TriggerWordMerger:
    def __init__(self):
        self.cached_text = ""
        self.cached_trigger = ""
        
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "trigger_word": ("STRING", {"multiline": False, "default": ""}),
                "add_weight": ("BOOLEAN", {"default": False}),
                "weight_value": ("FLOAT", {"default": 1.0, "min": 0.1, "max": 2.0, "step": 0.1, "round": 0.1, "display": "slider"}),
            },

            "optional": {
                "text_input": ("STRING", {"multiline": True, "default": "", "forceInput": True, "optional": True}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text_output",)
    FUNCTION = "merge_text"
    CATEGORY = "zhihui/Text"
    DESCRIPTION = "Trigger Word Merger: Intelligently merges trigger words with text input. Supports weight control by adding parentheses and weight values around trigger words, suitable for precise control of AI drawing prompts and text content combination processing."

    def merge_text(self, trigger_word, text_input=None, add_weight=False, weight_value=1.0):

        self.cached_trigger = trigger_word.strip()
        self.cached_text = "" if text_input is None else text_input.strip()
        
        if add_weight and self.cached_trigger:
            weight_value = round(weight_value, 1)
            self.cached_trigger = f"({self.cached_trigger}:{weight_value})"

        if not self.cached_trigger:
            return (self.cached_text,)
            
        if not self.cached_text:
            return (self.cached_trigger,)
            
        return (f"{self.cached_trigger}, {self.cached_text}",)