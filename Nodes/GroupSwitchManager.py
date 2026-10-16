class GroupSwitchManager:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {},
            "optional": {},
            "hidden": {
                "unique_id": "UNIQUE_ID"
            }
        }

    RETURN_TYPES = ()
    RETURN_NAMES = ()
    FUNCTION = "execute"
    CATEGORY = "Zhi.AI/Toolkit"
    DESCRIPTION = "Visually toggles groups on or off and configures linkage rules between groups."
    OUTPUT_NODE = True

    @classmethod
    def VALIDATE_INPUTS(cls, input_types):
        return True

    def execute(self, unique_id=None):
        return ()