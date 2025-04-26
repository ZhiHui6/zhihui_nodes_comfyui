import comfy
import comfy.sd
import comfy.utils
import torch

class ExtraOptions:
    
    def __init__(self):
        self.style_presets = {
            "描述性": "Write a descriptive caption for this image in a formal tone.",
            "训练提示词": "Write a stable diffusion prompt for this image.",
            "MidJourney提示词": "Write a MidJourney prompt for this image.",
            "Booru标签列表": "Write a list of Booru tags for this image.",
            "类似booru的标签列表": "Write a list of Booru-like tags for this image.",
            "自定义引导": "", 

        }
        self.preset_texts = {
            "text1": "Do not include information about people/characters that cannot be changed (like ethnicity, gender, etc), but do still include changeable attributes (like hair style).",
            "text2": "Include information about lighting.",
            "text3": "Include information about camera angle.",
            "text4": "Include information about whether there is a watermark or not.",
            "text5": "Include information about whether there are JPEG artifacts or not.",
            "text6": "If it is a photo you MUST include information about what camera was likely used and details such as aperture, shutter speed, ISO, etc.",
            "text7": "Do not include anything sexual; keep it PG.",
            "text8": "Do not mention the image's resolution.",
            "text9": "You must include information about the subjective aesthetic quality of the image from low to very high.",
            "text10": "Include information on the image's composition style, such as leading lines, rule of thirds, or symmetry.",
            "text11": "Do not mention any text that is in the image.",
            "text12": "Specify the depth of field and whether the background is in focus or blurred.",
            "text13": "If applicable, mention the likely use of artificial or natural lighting sources.",
            "text14": "Do not use any ambiguous language.",
            "text15": "Include whether the image is sfw, suggestive, or nsfw.",
            "text16": "Only describe the most important elements of the image."
        }

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "引导词": ("STRING", {"multiline": True, "default": "Describe this image in detail."}),
                "反推类型": (["描述性", "训练提示词", "MidJourney提示词", "Booru标签列表", "类似booru的标签列表", "自定义引导"], {"default": "描述性"}),
                "选项总开关": ("BOOLEAN", {"default": True})
            },
            "optional": {
                "不要包含不可更改的人物角色信息_如种族_性别等_但仍然包含可更改的属性_如发型": ("BOOLEAN", {"default": False}),
                "包含灯光信息": ("BOOLEAN", {"default": False}),
                "包含摄像机角度信息": ("BOOLEAN", {"default": False}),
                "包含是否有水印的信息": ("BOOLEAN", {"default": False}),
                "包括是否有JPEG伪影的信息": ("BOOLEAN", {"default": False}),
                "如果是照片_必须包含可能使用的相机信息以及光圈_快门速度_ISO等详细信息": ("BOOLEAN", {"default": False}),
                "不要包含任何性内容_保持PG": ("BOOLEAN", {"default": False}),
                "不要提及图像的分辨率": ("BOOLEAN", {"default": False}),
                "必须包含有关图像主观审美质量的信息_从低到高": ("BOOLEAN", {"default": False}),
                "包括有关图像构图风格的信息_如引导线_三分法或对称": ("BOOLEAN", {"default": False}),
                "不要提及图片中的任何文字": ("BOOLEAN", {"default": False}),
                "指定景深和背景是对焦还是模糊": ("BOOLEAN", {"default": False}),
                "如果适用_请提及可能使用的人工或自然光源": ("BOOLEAN", {"default": False}),
                "不要使用任何模棱两可的语言": ("BOOLEAN", {"default": False}),
                "包括图片是sfw_暗示性还是nsfw": ("BOOLEAN", {"default": False}),
                "只描述图片中最重要的元素": ("BOOLEAN", {"default": False})
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("输出文本",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/文本"

    def execute(self, 引导词, 反推类型, 选项总开关, 不要包含不可更改的人物角色信息_如种族_性别等_但仍然包含可更改的属性_如发型=False, 包含灯光信息=False, 包含摄像机角度信息=False, 包含是否有水印的信息=False, 包括是否有JPEG伪影的信息=False, 如果是照片_必须包含可能使用的相机信息以及光圈_快门速度_ISO等详细信息=False, 不要包含任何性内容_保持PG=False, 不要提及图像的分辨率=False, 必须包含有关图像主观审美质量的信息_从低到高=False, 包括有关图像构图风格的信息_如引导线_三分法或对称=False, 不要提及图片中的任何文字=False, 指定景深和背景是对焦还是模糊=False, 如果适用_请提及可能使用的人工或自然光源=False, 不要使用任何模棱两可的语言=False, 包括图片是sfw_暗示性还是nsfw=False, 只描述图片中最重要的元素=False, 顶部文本=""):
        if 反推类型 == "自定义引导" and not 引导词.strip():
            raise ValueError("当选择'自定义引导'时，必须在引导词框中输入内容")
        enabled_texts = []
        if 反推类型 == "自定义引导" and 引导词:
            enabled_texts.append(引导词)
        elif 反推类型 and 反推类型 != "自定义引导":
            enabled_texts.append(self.style_presets[反推类型])
        
        if 选项总开关:
            if 不要包含不可更改的人物角色信息_如种族_性别等_但仍然包含可更改的属性_如发型: enabled_texts.append(self.preset_texts["text1"])
            if 包含灯光信息: enabled_texts.append(self.preset_texts["text2"])
            if 包含摄像机角度信息: enabled_texts.append(self.preset_texts["text3"])
            if 包含是否有水印的信息: enabled_texts.append(self.preset_texts["text4"])
            if 包括是否有JPEG伪影的信息: enabled_texts.append(self.preset_texts["text5"])
            if 如果是照片_必须包含可能使用的相机信息以及光圈_快门速度_ISO等详细信息: enabled_texts.append(self.preset_texts["text6"])
            if 不要包含任何性内容_保持PG: enabled_texts.append(self.preset_texts["text7"])
            if 不要提及图像的分辨率: enabled_texts.append(self.preset_texts["text8"])
            if 必须包含有关图像主观审美质量的信息_从低到高: enabled_texts.append(self.preset_texts["text9"])
            if 包括有关图像构图风格的信息_如引导线_三分法或对称: enabled_texts.append(self.preset_texts["text10"])
            if 不要提及图片中的任何文字: enabled_texts.append(self.preset_texts["text11"])
            if 指定景深和背景是对焦还是模糊: enabled_texts.append(self.preset_texts["text12"])
            if 如果适用_请提及可能使用的人工或自然光源: enabled_texts.append(self.preset_texts["text13"])
            if 不要使用任何模棱两可的语言: enabled_texts.append(self.preset_texts["text14"])
            if 包括图片是sfw_暗示性还是nsfw: enabled_texts.append(self.preset_texts["text15"])
            if 只描述图片中最重要的元素: enabled_texts.append(self.preset_texts["text16"])
        return ("\n".join(filter(None, enabled_texts)),)