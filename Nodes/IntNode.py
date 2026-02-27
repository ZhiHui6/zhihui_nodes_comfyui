class IntNode:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "value": ("INT", {"default": 0, "min": -2147483648, "max": 2147483647, "step": 1}),
            }
        }

    RETURN_TYPES = ("INT",)
    RETURN_NAMES = ("int",)
    FUNCTION = "get_int"
    CATEGORY = "Zhi/Utils"
    DESCRIPTION = "Int Node: Output a configurable integer value for unified parameter control."

    def get_int(self, value):
        return (value,)