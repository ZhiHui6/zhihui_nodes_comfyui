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

    PRESETS_ZIMAGE = {
         "1:1(1024x1024)": (1024, 1024),
         "1:1(1280x1280)": (1280, 1280),
         "1:1(1536x1536)": (1536, 1536),
         "9:7(1152x896)": (1152, 896),
         "9:7(1440x1120)": (1440, 1120),
         "9:7(1728x1344)": (1728, 1344),
         "7:9(896x1152)": (896, 1152),
         "7:9(1120x1440)": (1120, 1440),
         "7:9(1344x1728)": (1344, 1728),
         "4:3(1152x864)": (1152, 864),
         "4:3(1472x1104)": (1472, 1104),
         "4:3(1728x1296)": (1728, 1296),
         "3:4(864x1152)": (864, 1152),
         "3:4(1104x1472)": (1104, 1472),
         "3:4(1296x1728)": (1296, 1728),
         "3:2(1248x832)": (1248, 832),
         "3:2(1536x1024)": (1536, 1024),
         "3:2(1872x1248)": (1872, 1248),
         "2:3(832x1248)": (832, 1248),
         "2:3(1024x1536)": (1024, 1536),
         "2:3(1248x1872)": (1248, 1872),
         "16:9(1280x720)": (1280, 720),
         "16:9(1536x864)": (1536, 864),
         "16:9(2048x1152)": (2048, 1152),
         "9:16(720x1280)": (720, 1280),
         "9:16(864x1536)": (864, 1536),
         "9:16(1152x2048)": (1152, 2048),
         "21:9(1344x576)": (1344, 576),
         "21:9(1680x720)": (1680, 720),
         "21:9(2016x864)": (2016, 864),
         "9:21(576x1344)": (576, 1344),
         "9:21(720x1680)": (720, 1680),
         "9:21(864x2016)": (864, 2016),
    }

    @classmethod
    def INPUT_TYPES(s):
        all_aspect_ratios = list(set(
            list(s.PRESETS_QWEN.keys()) +
            list(s.PRESETS_FLUX.keys()) +
            list(s.PRESETS_WAN.keys()) +
            list(s.PRESETS_SD.keys()) +
            list(s.PRESETS_ZIMAGE.keys())
        ))

        return {
            "required": {
                "preset_mode": (["Qwen image", "Flux", "Wan", "SDXL", "Z-image", "Custom Size"], {"default": "Z-image"}),
                "aspect_ratio": (all_aspect_ratios, {"default": "1:1(1328x1328)"}),
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
    CATEGORY = "Zhi.AI/Image"
    DESCRIPTION = "Smart image aspect ratio setting node, supporting preset dimensions for multiple models like Qwen, Flux, Wan, SDXL, with quick selection of common ratios or custom sizes"

    def get_dimensions(self, preset_mode, aspect_ratio, custom_width=1328, custom_height=1328, aspect_lock=False):
        if custom_width is None:
            custom_width = 1328
        if custom_height is None:
            custom_height = 1328

        if preset_mode == "Custom Size":
            return (custom_width, custom_height)

        preset_maps = {
            "Qwen image": self.PRESETS_QWEN,
            "Flux": self.PRESETS_FLUX,
            "Wan": self.PRESETS_WAN,
            "SDXL": self.PRESETS_SD,
            "Z-image": self.PRESETS_ZIMAGE
        }

        preset_map = preset_maps.get(preset_mode, self.PRESETS_QWEN)

        if aspect_ratio in preset_map:
            return preset_map[aspect_ratio]
        else:
            return (custom_width, custom_height)