class TextSwitchDualMode:
    
    def __init__(self):
        self.text_cache = {"text1": "", "text2": "", "text3": "", "text4": ""}

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "mode": (["manual", "auto"], {"default": "manual"}),
                "select_text": (["1", "2", "3", "4"], {"default": "1"}),
                "text1_comment": ("STRING", {"multiline": False, "default": ""}),
                "text2_comment": ("STRING", {"multiline": False, "default": ""}),
                "text3_comment": ("STRING", {"multiline": False, "default": ""}),
                "text4_comment": ("STRING", {"multiline": False, "default": ""}),
            },
            "optional": {
                "text1": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
                "text2": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
                "text3": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
                "text4": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("output_text",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/Text"
    DESCRIPTION = "Text Switch: Selects between text inputs based on boolean switch. Outputs text A when switch is True, text B when False. Suitable for conditional text selection and workflow branch control."

    def execute(self, mode, select_text, text1_comment, text2_comment, text3_comment, text4_comment,
                text1="", text2="", text3="", text4=""):
        
        texts = [text1, text2, text3, text4]
        
        self.text_cache["text1"] = text1
        self.text_cache["text2"] = text2
        self.text_cache["text3"] = text3
        self.text_cache["text4"] = text4
        
        if mode == "manual":
            idx = int(select_text) - 1
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
                    ports = f"text{valid_inputs[0][0]} and text{valid_inputs[1][0]}"
                elif connected_count == 3:
                    ports = f"text{valid_inputs[0][0]}, text{valid_inputs[1][0]}, text{valid_inputs[2][0]}"
                else:
                    ports = f"text{valid_inputs[0][0]}, text{valid_inputs[1][0]}, text{valid_inputs[2][0]}, text{valid_inputs[3][0]}"
                
                raise ValueError(
                    f"Auto mode error: Detected {ports} with simultaneous inputs.\n"
                    f"Solutions:\n"
                    f"1. Disable other upstream node outputs, keep only one text input\n"
                    f"2. Switch to manual mode and select the text to output\n"
                )
            
            return (valid_inputs[0][1],)