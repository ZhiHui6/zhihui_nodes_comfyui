class PriorityTextSwitch:
    DESCRIPTION = "Priority Text Switch: When both text A and text B ports are connected, prioritize output from port B; if port B has no input, output from text A port; if both ports have no input, prompt to connect at least one input port."

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("output_text",)
    FUNCTION = "execute"
    CATEGORY = "Zhi.AI/Text"

    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "optional": {
                "textA": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
                "textB": ("STRING", {"multiline": True, "default": "", "forceInput": True}),
                "textA_note": ("STRING", {"multiline": False, "default": "", "placeholder": "Purpose or description of text A"}),
                "textB_note": ("STRING", {"multiline": False, "default": "", "placeholder": "Purpose or description of text B"}),
            },
        }

    def execute(self, textA=None, textA_note="", textB=None, textB_note=""):
        if textB is not None and str(textB).strip() != "":
            return (textB,)
        elif textA is not None and str(textA).strip() != "":
            return (textA,)
        else:
            return ("",)
