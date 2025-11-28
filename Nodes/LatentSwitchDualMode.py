class LatentSwitchDualMode:

    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "mode": (["manual", "auto"], {"default": "auto"}),
                "select_channel": ([str(i) for i in range(2, 1024)], {"default": "2"}),
                "inputcount": ("INT", {"default": 2, "min": 2, "max": 1000, "step": 1}),
                "Latent_1_comment": ("STRING", {"multiline": False, "default": ""}),
                "Latent_2_comment": ("STRING", {"multiline": False, "default": ""}),
            },
            "optional": {
                "Latent_1": ("LATENT", {}),
                "Latent_2": ("LATENT", {}),
            }
        }

    RETURN_TYPES = ("LATENT",)
    RETURN_NAMES = ("output_latent",)
    FUNCTION = "execute"
    CATEGORY = "Zhi.AI/Latent"
    DESCRIPTION = "Dynamic Latent Switcher: Switches among a dynamic number of latent inputs. Supports manual mode (select by index) and auto mode (outputs the single non-empty input, errors if multiple). Input count is controlled via 'inputcount', and the UI can update ports accordingly. Newly added inputs are optional."

    def execute(self, mode, select_channel, inputcount, Latent_1=None, Latent_2=None, Latent_1_comment="", Latent_2_comment="", **kwargs):
        
        count = int(inputcount) if inputcount is not None else 2
        count = max(1, count)
        latents = []
        for i in range(1, count + 1):
            key = f"Latent_{i}"
            latents.append(kwargs.get(key, locals().get(key, None)))
        
        if mode == "manual":
            idx = int(select_channel) - 1
            if idx < 0 or idx >= len(latents):
                idx = 0
            selected = latents[idx]
            if selected is None:
                for lt in latents:
                    if lt is not None:
                        return (lt,)
                return (None,)
            return (selected,)

        valid = [(i + 1, lt) for i, lt in enumerate(latents) if lt is not None]
        if len(valid) == 0:
            return (None,)
        if len(valid) >= 2:
            if len(valid) == 2:
                ports = f"Latent_{valid[0][0]} and Latent_{valid[1][0]}"
            elif len(valid) == 3:
                ports = f"Latent_{valid[0][0]}, Latent_{valid[1][0]}, Latent_{valid[2][0]}"
            else:
                ports = ", ".join([f"Latent_{n}" for n, _ in valid])
            raise ValueError(
                f"Auto mode error: Detected {ports} with simultaneous inputs.\n"
                f"Solutions:\n"
                f"1. Disable other upstream node outputs, keep only one latent input\n"
                f"2. Switch to manual mode and select the latent to output\n"
            )
        return (valid[0][1],)
