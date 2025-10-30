class ImageAspectRatio:
    PRESETS_QWEN = {
         "1:1(1328x1328)": (1328, 1328),
         "16:9(1664x928)": (1664, 928),
         "9:16(928x1664)": (928, 1664),
         "4:3(1472x1104)": (1472, 1104),
         "3:4(1104x1472)": (1104, 1472),
         "3:2(1584x1056)": (1584, 1056),
         "2:3(1056x1584)": (1056, 1584),
    }

    PRESETS_FLUX = {
         "1:1(1024x1024)": (1024, 1024),
         "16:9(1344x768)": (1344, 768),
         "9:16(768x1344)": (768, 1344),
         "4:3(1152x864)": (1152, 864),
         "3:4(864x1152)": (864, 1152),
         "3:2(1216x832)": (1216, 832),
         "2:3(832x1216)": (832, 1216),
    }
    
    PRESETS_WAN = {
         "1:1(1024x1024)": (1024, 1024),
         "16:9(1280x720)": (1280, 720),
         "9:16(720x1280)": (720, 1280),
         "4:3(1024x768)": (1024, 768),
         "3:4(768x1024)": (768, 1024),
         "21:9(1344x576)": (1344, 576),
         "9:21(576x1344)": (576, 1344),
    }
    
    PRESETS_SD = {
         "1:1(1024x1024)": (1024, 1024),
         "9:8(1152x896)": (1152, 896),
         "8:9(896x1152)": (896, 1152),
         "3:2(1216x832)": (1216, 832),
         "2:3(832x1216)": (832, 1216),
         "7:4(1344x768)": (1344, 768),
         "4:7(768x1344)": (768, 1344),
         "12:5(1536x640)": (1536, 640),
         "5:12(640x1536)": (640, 1536),
    }

    @classmethod
    def INPUT_TYPES(s):
        ratio_list = (list(s.PRESETS_QWEN.keys()) + 
                     list(s.PRESETS_FLUX.keys()) + 
                     list(s.PRESETS_WAN.keys()) + 
                     list(s.PRESETS_SD.keys()))
        return {
            "required": {
                "preset_mode": (["Qwen image", "Flux", "Wan", "SDXL", "Custom Size"], {"default": "Qwen image"}),
                "aspect_ratio": (ratio_list, {"default": "1:1(1328x1328)"}),
            },
            "optional": {
                "custom_width": ("INT", {"default": 1328, "min": 1, "max": 8192, "step": 1}),
                "custom_height": ("INT", {"default": 1328, "min": 1, "max": 8192, "step": 1}),
                "aspect_lock": ("BOOLEAN", {"default": False}),
            }
        }

    RETURN_TYPES = ("INT", "INT")
    RETURN_NAMES = ("width", "height")
    FUNCTION = "get_dimensions"
    CATEGORY = "Zhi.AI/Toolkit"
    DESCRIPTION = "Smart image aspect ratio setting node, supporting preset dimensions for multiple models like Qwen, Flux, Wan, SDXL, with quick selection of common ratios or custom sizes"

    def get_dimensions(self, preset_mode, aspect_ratio, custom_width=1328, custom_height=1328, aspect_lock=False):
        if custom_width is None:
            custom_width = 1328
        if custom_height is None:
            custom_height = 1328
            
        if preset_mode == "Custom Size":
            width = custom_width
            height = custom_height
        else:
            preset_maps = {
                "Qwen image": self.PRESETS_QWEN,
                "Flux": self.PRESETS_FLUX,
                "Wan": self.PRESETS_WAN,
                "SDXL": self.PRESETS_SD
            }
            
            preset_map = preset_maps.get(preset_mode, self.PRESETS_QWEN)
            
            if aspect_ratio in preset_map:
                width, height = preset_map[aspect_ratio]
            else:
                for fallback_map in [self.PRESETS_QWEN, self.PRESETS_FLUX, self.PRESETS_WAN, self.PRESETS_SD]:
                    if aspect_ratio in fallback_map:
                        width, height = fallback_map[aspect_ratio]
                        break
                else:
                    width, height = (custom_width, custom_height)
        
        return (width, height)