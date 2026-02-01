class TextMergerNode:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "separator": ("STRING", {"default": ", ", "multiline": False}),
                "inputcount": ("INT", {"default": 2, "min": 2, "max": 20, "step": 1}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("merged_text",)
    FUNCTION = "merge"
    CATEGORY = "Zhi.AI/Text"

    def merge(self, inputcount, separator, **kwargs):
        port_texts = []

        for i in range(1, inputcount + 1):
            text_key = f"text_{i}"

            if text_key in kwargs:
                input_val = kwargs[text_key]
                if input_val and isinstance(input_val, str):
                    input_val = input_val.strip()
                    if input_val:
                        port_texts.append(input_val)

        all_texts = []
        all_texts.extend(port_texts)

        if all_texts:
            result = separator.join(all_texts)
        else:
            result = ""

        return (result,)