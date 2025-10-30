class PathSwitch:

    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "mode": (["manual", "auto"], {"default": "manual"}),
                "select_channel": (["1", "2"], {"default": "1"}),
            },
            "optional": {
                "Path_1": ("PATH", {}),
                "Path_2": ("PATH", {}),
                "Path_1_comment": ("STRING", {"multiline": False, "default": "", "placeholder": "Purpose or description of Path 1"}),
                "Path_2_comment": ("STRING", {"multiline": False, "default": "", "placeholder": "Purpose or description of Path 2"}),
            }
        }

    RETURN_TYPES = ("PATH",)
    RETURN_NAMES = ("output_path",)
    FUNCTION = "execute"
    CATEGORY = "Zhi.AI/Qwen3VL"
    DESCRIPTION = "Dual-channel path switcher supporting manual and automatic modes. Can switch between 2 path inputs from MultiplePathsInput nodes, supports annotation tags for easy management, intelligently selects non-empty inputs in automatic mode, suitable for conditional branching and dynamic switching in workflows. Output can be connected to Qwen3VL source_path input."

    def execute(self, mode, select_channel, Path_1=None, Path_2=None, 
                Path_1_comment="", Path_2_comment=""):
        
        paths = [Path_1, Path_2]
        
        if mode == "manual":
            idx = int(select_channel) - 1
            if idx < 0 or idx > 1:
                idx = 0
            
            selected_path = paths[idx]
            if selected_path is None:
                raise ValueError(f"Selected channel {select_channel} has no input")
                
        else:  # auto mode
            selected_path = None
            for path in paths:
                if path is not None:
                    selected_path = path
                    break
            
            if selected_path is None:
                raise ValueError("No valid Path input found in automatic mode")
        
        return (selected_path,)