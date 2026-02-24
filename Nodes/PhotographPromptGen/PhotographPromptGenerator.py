import random
import time
import os
import json

class PhotographPromptGenerator:

    def __init__(self):
        pass

    @classmethod
    def _load_options(cls, filename):
        options = ["Ignore"]

        try:
            with open(os.path.join(os.path.dirname(__file__), "options", filename), encoding="utf-8") as f:
                options.extend(line.strip() for line in f if line.strip() and not line.strip().startswith('#'))
        except FileNotFoundError:
            pass

        category_name = filename.replace("_options.txt", "")
        user_json_path = os.path.join(os.path.dirname(__file__), "user_options.json")

        try:
            if os.path.exists(user_json_path):
                with open(user_json_path, "r", encoding="utf-8") as f:
                    user_data = json.load(f)
                    user_options = user_data.get(category_name, [])
                    if user_options:
                        options.extend(user_options)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Warning: Could not load user options for {category_name}: {e}")

        options.append("Random")
        return options

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "output_mode": (["Standard-Tags-CN", "Structured-Tags-CN", "Standard-Tags-EN", "Structured-Tags-EN", "Template"], {"default": "Standard-Tags-CN"}),
                "template": ("STRING", {
                    "multiline": True,
                    "default": ""
                }),
                "character": (cls._load_options("character_options.txt"), {"default": "Ignore"}),
                "gender": (cls._load_options("gender_options.txt"), {"default": "Ignore"}),
                "facial_expressions": (cls._load_options("facial_expressions_options.txt"), {"default": "Ignore"}),
                "hair_style": (cls._load_options("hair_style_options.txt"), {"default": "Ignore"}),
                "hair_color": (cls._load_options("hair_color_options.txt"), {"default": "Ignore"}),
                "pose": (cls._load_options("body_pose_options.txt"), {"default": "Ignore"}),
                "head_movements": (cls._load_options("head_movements_options.txt"), {"default": "Ignore"}),
                "hand_movements": (cls._load_options("hand_movements_options.txt"), {"default": "Ignore"}),
                "leg_foot_movements": (cls._load_options("leg_foot_movements_options.txt"), {"default": "Ignore"}),
                "orientation": (cls._load_options("orientation_options.txt"), {"default": "Ignore"}),
                "top": (cls._load_options("tops_options.txt"), {"default": "Ignore"}),
                "bottom": (cls._load_options("bottoms_options.txt"), {"default": "Ignore"}),
                "boots": (cls._load_options("boots_options.txt"), {"default": "Ignore"}),
                "socks": (cls._load_options("socks_options.txt"), {"default": "Ignore"}),
                "accessories": (cls._load_options("accessories_options.txt"), {"default": "Ignore"}),
                "tattoo": (cls._load_options("tattoo_options.txt"), {"default": "Ignore"}),
                "tattoo_location": (cls._load_options("tattoo_location_options.txt"), {"default": "Ignore"}),
                "camera": (cls._load_options("camera_options.txt"), {"default": "Ignore"}),
                "lens": (cls._load_options("lens_options.txt"), {"default": "Ignore"}),
                "lighting": (cls._load_options("lighting_options.txt"), {"default": "Ignore"}),
                "perspective": (cls._load_options("top_down_options.txt"), {"default": "Ignore"}),
                "location": (cls._load_options("location_options.txt"), {"default": "Ignore"}),
                "weather": (cls._load_options("weather_options.txt"), {"default": "Ignore"}),
                "season": (cls._load_options("season_options.txt"), {"default": "Ignore"}),
                "color_tone": (cls._load_options("color_tone_options.txt"), {"default": "Ignore"}),
                "mood_atmosphere": (cls._load_options("mood_atmosphere_options.txt"), {"default": "Ignore"}),
                "photography_style": (cls._load_options("photography_style_options.txt"), {"default": "Ignore"}),
                "photography_technique": (cls._load_options("photography_technique_options.txt"), {"default": "Ignore"}),
                "post_processing": (cls._load_options("post_processing_options.txt"), {"default": "Ignore"}),
                "depth_of_field": (cls._load_options("depth_of_field_options.txt"), {"default": "Ignore"}),
                "composition": (cls._load_options("composition_options.txt"), {"default": "Ignore"}),
                "texture": (cls._load_options("texture_options.txt"), {"default": "Ignore"}),
            },
            "hidden": {
                "prompt_manager": ("PROMPT_MANAGER", {"default": ""}),
                "template_helper": ("TEMPLATE_HELPER", {"default": ""})
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("output",)
    FUNCTION = "generate_text"
    CATEGORY ="Zhi.AI/Generator"
    DESCRIPTION = "Photography Prompt Generator: Professional photography prompt generator with 16 customizable dimensions (camera, lens, lighting, pose, clothing, etc.). Features dual output modes - Tags for tag combinations and Template for formatted text. Supports custom user options and template editing helper."

    LANGUAGE_MAP = {}

    @classmethod
    def _init_language_map(cls):
        if not cls.LANGUAGE_MAP:
            options_dir = os.path.join(os.path.dirname(__file__), "options")
            for filename in os.listdir(options_dir):
                if filename.endswith("_options.txt"):
                    field_name = filename.replace("_options.txt", "")
                    cls.LANGUAGE_MAP[field_name] = {}
                    with open(os.path.join(options_dir, filename), encoding="utf-8") as f:
                        for line in f:
                            line = line.strip()
                            if line and not line.startswith('#'):
                                if " (" in line and ")" in line:
                                    parts = line.rsplit(" (", 1)
                                    cn = parts[0].strip()
                                    en = parts[1].rstrip(")").strip()
                                    cls.LANGUAGE_MAP[field_name][cn] = en
                                    cls.LANGUAGE_MAP[field_name][en] = en

    def random_choice(self, selected_option, options):
        if selected_option == "Random":
            actual_options = [opt for opt in options if "Random" not in opt and "Ignore" not in opt]
            return random.choice(actual_options)
        return selected_option

    def get_value_by_lang(self, selection, language):
        self._init_language_map()
        if "Ignore" in selection:
            return ""
        if " (" not in selection:
            return selection
        cn_part = selection.split(" (")[0].strip()
        en_part = selection.split(" (")[1].rstrip(")").strip()
        if language == "EN":
            return en_part
        return cn_part

    def generate_text(self, camera, lens, lighting, perspective, location, pose, orientation, top, bottom, boots, socks, accessories, tattoo, tattoo_location, weather, season, character, gender, facial_expressions, hair_style, hair_color, head_movements, hand_movements, leg_foot_movements, color_tone, mood_atmosphere, photography_style, photography_technique, post_processing, depth_of_field, composition, texture, output_mode, template):

        selections = {
            field: self.random_choice(value, self.INPUT_TYPES()['required'][field][0])
            for field, value in zip(
                ["camera", "lens", "lighting", "perspective", "location", "pose", "orientation", "top", "bottom", "boots", "socks", "accessories", "tattoo", "tattoo_location", "weather", "season", "character", "gender", "facial_expressions", "hair_style", "hair_color", "head_movements", "hand_movements", "leg_foot_movements", "color_tone", "mood_atmosphere", "photography_style", "photography_technique", "post_processing", "depth_of_field", "composition", "texture"],
                [camera, lens, lighting, perspective, location, pose, orientation, top, bottom, boots, socks, accessories, tattoo, tattoo_location, weather, season, character, gender, facial_expressions, hair_style, hair_color, head_movements, hand_movements, leg_foot_movements, color_tone, mood_atmosphere, photography_style, photography_technique, post_processing, depth_of_field, composition, texture]
            )
        }
      
        def get_value(selection):
            return selection.split(" (")[1][:-1] if "Ignore" not in selection else ""

        if output_mode == "Standard-Tags-CN":
            language = "CN"
            keyword = ",".join([
                self.get_value_by_lang(selections[field], language)
                for field in selections if "Ignore" not in selections[field]
            ])
            output = keyword

        elif output_mode == "Standard-Tags-EN":
            language = "EN"
            keyword = ",".join([
                self.get_value_by_lang(selections[field], language)
                for field in selections if "Ignore" not in selections[field]
            ])
            output = keyword

        elif output_mode == "Structured-Tags-CN":
            language = "CN"
            field_labels_cn = {
                "character": "角色", "gender": "性别", "facial_expressions": "面部表情",
                "hair_style": "发型", "hair_color": "发色", "pose": "姿势",
                "head_movements": "头部动作", "hand_movements": "手部动作", "leg_foot_movements": "腿脚动作",
                "orientation": "朝向", "top": "上衣", "bottom": "下装",
                "boots": "鞋子", "socks": "袜子", "accessories": "配饰", "tattoo": "纹身", "tattoo_location": "纹身位置",
                "camera": "相机", "lens": "镜头", "lighting": "灯光",
                "perspective": "视角", "location": "位置", "weather": "天气", "season": "季节",
                "color_tone": "色调", "mood_atmosphere": "氛围", "photography_style": "摄影风格",
                "photography_technique": "摄影技法",
                "post_processing": "后期处理", "depth_of_field": "景深", "composition": "构图",
                "texture": "质感"
            }
            output = ""
            for field in selections:
                if "Ignore" not in selections[field]:
                    value = self.get_value_by_lang(selections[field], language)
                    label = field_labels_cn.get(field, field)
                    output += f"{label}: {value}, "
            output = output.rstrip(", ")

        elif output_mode == "Structured-Tags-EN":
            language = "EN"
            field_labels_en = {
                "character": "Character", "gender": "Gender", "facial_expressions": "Facial Expressions",
                "hair_style": "Hair Style", "hair_color": "Hair Color", "pose": "Pose",
                "head_movements": "Head Movements", "hand_movements": "Hand Movements", "leg_foot_movements": "Leg/Foot Movements",
                "orientation": "Orientation", "top": "Top", "bottom": "Bottom",
                "boots": "Boots", "socks": "Socks", "accessories": "Accessories", "tattoo": "Tattoo", "tattoo_location": "Tattoo Location",
                "camera": "Camera", "lens": "Lens", "lighting": "Lighting",
                "perspective": "Perspective", "location": "Location", "weather": "Weather", "season": "Season",
                "color_tone": "Color Tone", "mood_atmosphere": "Mood/Atmosphere", "photography_style": "Photography Style",
                "photography_technique": "Photography Technique",
                "post_processing": "Post Processing", "depth_of_field": "Depth of Field", "composition": "Composition",
                "texture": "Texture"
            }
            output = ""
            for field in selections:
                if "Ignore" not in selections[field]:
                    value = self.get_value_by_lang(selections[field], language)
                    label = field_labels_en.get(field, field)
                    output += f"{label}: {value}, "
            output = output.rstrip(", ")

        else:
            output = template.format(
                **{field: get_value(selections[field]) for field in selections}
            )

        return (output,)
    
    @classmethod
    def IS_CHANGED(cls, camera, lens, lighting, perspective, location, pose, orientation, top, bottom, boots, socks, accessories, tattoo, tattoo_location, weather, season, character, gender, facial_expressions, hair_style, hair_color, head_movements, hand_movements, leg_foot_movements, color_tone, mood_atmosphere, photography_style, photography_technique, post_processing, depth_of_field, composition, texture, output_mode, template):
        return str(time.time())