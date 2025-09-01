import comfy
import comfy.sd
import comfy.utils
import torch

class ExtraOptions:
    
    def __init__(self):
        self.style_presets = {
            "描述性的": "Write a detailed description for this image.",
            "直截了当的":"Write a straightforward caption for this image. Begin with the main subject and medium. Mention pivotal elements—people, objects, scenery—using confident, definite language. Focus on concrete details like color, shape, texture, and spatial relationships. Show how elements interact. Omit mood and speculative wording. If text is present, quote it exactly. Note any watermarks, signatures, or compression artifacts. Never mention what's absent, resolution, or unobservable details. Vary your sentence structure and keep the description concise, without starting with “This image is…” or similar phrasing.",
            "训练提示词": "Write a stable diffusion prompt for this image.",
            "MidJourney提示词": "Write a MidJourney prompt for this image.",
            "Booru标签列表": "Write a list of Booru tags for this image.",
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
            "text16": "Only describe the most important elements of the image.",
            "text17": "If it is a work of art, do not include the artist's name or the title of the work.",
            "text18": "Identify the image orientation (portrait, landscape, or square) and aspect ratio if obvious.",
            "text19": """Use vulgar slang and profanity, such as (but not limited to) "fucking," "slut," "cock," etc.""",
            "text20": "Do NOT use polite euphemisms—lean into blunt, casual phrasing.",
            "text21": "Include information about the ages of any people/characters when applicable.",
            "text22": "Mention whether the image depicts an extreme close-up, close-up, medium close-up, medium shot, cowboy shot, medium wide shot, wide shot, or extreme wide shot.",
            "text23": "Do not mention the mood/feeling/etc of the image.",
            "text24": "Explicitly specify the vantage height (eye-level, low-angle worm’s-eye, bird’s-eye, drone, rooftop, etc.).",
            "text25": "If there is a watermark, you must mention it.",
            "text26": """Your response will be used by a text-to-image model, so avoid useless meta phrases like “This image shows…”, "You are looking at...", etc.""",
        }

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "引导词": ("STRING", {"multiline": True, "default": "Describe this image in detail."}),
                "反推类型": (["描述性的", "直截了当的", "训练提示词", "MidJourney提示词", "Booru标签列表", "自定义引导"], {"default": "描述性的"}),
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
                "只描述图片中最重要的元素": ("BOOLEAN", {"default": False}),
                "不包括艺术家的名字或头衔": ("BOOLEAN", {"default": False}),
                "识别图像方向": ("BOOLEAN", {"default": False}),
                "使用粗俗的俚语和脏话": ("BOOLEAN", {"default": False}),
                "不要使用礼貌的委婉语": ("BOOLEAN", {"default": False}),
                "包括角色年龄": ("BOOLEAN", {"default": False}),
                "包括相机拍摄类型": ("BOOLEAN", {"default": False}),
                "排除情绪感受": ("BOOLEAN", {"default": False}),
                "包括相机有利高度": ("BOOLEAN", {"default": False}),
                "提到水印": ("BOOLEAN", {"default": False}),
                "避免使用元描述性短语": ("BOOLEAN", {"default": False}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("引导输出",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/文本"
    DESCRIPTION = "额外选项节点：为图像反推提供详细的引导选项配置。支持多种反推类型（描述性、训练提示词、MidJourney提示词等），并提供丰富的可选参数来控制输出内容的细节，如灯光信息、摄像机角度、构图风格等，适用于精确的图像描述和提示词生成。"

    def execute(self, 引导词, 反推类型, 选项总开关, 不要包含不可更改的人物角色信息_如种族_性别等_但仍然包含可更改的属性_如发型=False, 包含灯光信息=False, 包含摄像机角度信息=False, 包含是否有水印的信息=False, 包括是否有JPEG伪影的信息=False, 如果是照片_必须包含可能使用的相机信息以及光圈_快门速度_ISO等详细信息=False, 不要包含任何性内容_保持PG=False, 不要提及图像的分辨率=False, 必须包含有关图像主观审美质量的信息_从低到高=False, 包括有关图像构图风格的信息_如引导线_三分法或对称=False, 不要提及图片中的任何文字=False, 指定景深和背景是对焦还是模糊=False, 如果适用_请提及可能使用的人工或自然光源=False, 不要使用任何模棱两可的语言=False, 包括图片是sfw_暗示性还是nsfw=False, 只描述图片中最重要的元素=False, 不包括艺术家的名字或头衔=False, 识别图像方向=False, 使用粗俗的俚语和脏话=False, 不要使用礼貌的委婉语=False, 包括角色年龄=False, 包括相机拍摄类型=False, 排除情绪感受=False, 包括相机有利高度=False, 提到水印=False, 避免使用元描述性短语=False, 顶部文本=""):
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
            if 不包括艺术家的名字或头衔: enabled_texts.append(self.preset_texts["text17"])
            if 识别图像方向: enabled_texts.append(self.preset_texts["text18"])
            if 使用粗俗的俚语和脏话: enabled_texts.append(self.preset_texts["text19"])
            if 不要使用礼貌的委婉语: enabled_texts.append(self.preset_texts["text20"])
            if 包括角色年龄: enabled_texts.append(self.preset_texts["text21"])
            if 包括相机拍摄类型: enabled_texts.append(self.preset_texts["text22"])
            if 排除情绪感受: enabled_texts.append(self.preset_texts["text23"])
            if 包括相机有利高度: enabled_texts.append(self.preset_texts["text24"])
            if 提到水印: enabled_texts.append(self.preset_texts["text25"])
            if 避免使用元描述性短语: enabled_texts.append(self.preset_texts["text26"])
        return ("\n".join(filter(None, enabled_texts)),)