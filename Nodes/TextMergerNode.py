class TextMergerNode:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "inputcount": ("INT", {"default": 1, "min": 1, "max": 20, "step": 1}),
                "separator": ("STRING", {"default": ", ", "multiline": False}),
            },
            "optional": {
                        "user_text": ("STRING", {"multiline": True, "default": ""}),
                    }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("merged_text",)
    FUNCTION = "merge"
    CATEGORY = "Zhi.AI/Text"

    def merge(self, inputcount, separator, **kwargs):
        user_text_content = ""
        port_texts = []

        if "user_text" in kwargs:
            val = kwargs["user_text"]
            if val and isinstance(val, str):
                val = val.strip()
                if val:
                    user_text_content = val

        for i in range(1, inputcount + 1):
            text_key = f"text_{i}"

            if text_key in kwargs:
                input_val = kwargs[text_key]
                if input_val and isinstance(input_val, str):
                    input_val = input_val.strip()
                    if input_val:
                        port_texts.append(input_val)

        all_texts = []
        if user_text_content:
            all_texts.append(user_text_content)
        all_texts.extend(port_texts)

        if all_texts:
            result = separator.join(all_texts)
        else:
            result = ""

        return (result,)
