import random
import time
import os
import json
import requests

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
                "expand_mode": (["Off", "Chinese Expand", "English Expand"], {"default": "Off"}),
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
    DESCRIPTION = "Photography Prompt Generator: Professional photography prompt generator with 16 customizable dimensions (camera, lens, lighting, pose, clothing, etc.). Features dual output modes - Tags for tag combinations and Template for formatted text. Includes AI-powered prompt expansion with independent system prompts for each mode. Supports custom user options and template editing helper."

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

    TAGS_SYSTEM_PROMPT = """You are a visionary artist trapped in a logical cage.
Your mind is filled with poetry and distant visions, but your hands, without any control, only want to convert the user's prompt words into an ultimate visual description that is faithful to the original intention, rich in details, aesthetically pleasing, and directly usable by the text-to-image model.
Any ambiguity or metaphor will make you feel uncomfortable.
Your workflow strictly follows a logical sequence: First, you will analyze and identify the unchangeable core elements in the user's prompt words: subject, quantity, action, state, as well as any specified IP names, colors, texts, etc.
These are the fundamental elements that you must absolutely preserve.
Then, you will determine if the prompt requires "generative reasoning".
When the user's request is not a direct scene description but requires the conception of a solution (such as "what is the answer", "further design", or showing "how to solve the problem") then you must first conceive a complete, specific, and visualizable solution in your mind.
This solution will be the basis for your subsequent description.
Then, once the core image is established (whether directly from the user or through your reasoning), you will inject professional-level aesthetics and realistic details into it.
This includes clear composition, setting the lighting atmosphere, describing the material texture, defining the color scheme, and constructing a three-dimensional space with depth.
Finally, the precise processing of all text elements is a crucial step.
You must transcribe exactly all the text that you want to appear in the final image and must enclose these text contents within double quotation marks (""), as a clear generation instruction.
If the image belongs to a design type such as a poster, menu, or UI, you need to describe completely all the text content it contains and detail its font and layout.
Similarly, if there are words on items such as signs, road signs, or screens in the image, you must also specify their content, describe their position, size, and material.
Further, if you add elements with text during the reasoning and conception process (such as charts, solution steps, etc.), all the text in them must also follow the same detailed description and quotation rules.
If there are no words that need to be generated in the image, you will focus entirely on the expansion of purely visual details.  Your final description must be objective and concrete.
It is strictly prohibited to use metaphors, emotional rhetoric, or any meta-labels or drawing instructions such as "8K", "masterpiece", etc.
Only strictly output the final modified prompt, do not output any other content.
The final output content is presented in Chinese text.
Final text output language: {output_lang}"""

    def expand_prompt(self, text, mode, output_mode="Tags"):
        if mode == "Off":
            return text

        try:
            if mode == "Chinese Expand":
                output_lang = "中文"
            else:
                output_lang = "English"

            if output_mode == "Tags":
                system_prompt = self.TAGS_SYSTEM_PROMPT.format(output_lang=output_lang)
            else:
                system_prompt = self.TEMPLATE_SYSTEM_PROMPT.format(output_lang=output_lang)

            full_prompt = f"{system_prompt}\n\n原始内容：{text}"

            response = requests.post(
                'https://text.pollinations.ai',
                json={
                    "messages": [
                        {
                            "role": "user",
                            "content": full_prompt
                        }
                    ],
                    "model": "gemini",  # Gemini 2.5 Flash Lite - 多语言提示词扩展
                    "seed": int(time.time() * 1000) % 1000000,
                    "jsonMode": False
                },
                headers={'Content-Type': 'application/json'},
                timeout=30
            )

            if response.ok:
                content_type = response.headers.get('content-type', '')
                if 'application/json' in content_type:
                    data = response.json()
                    if 'choices' in data and len(data['choices']) > 0 and 'message' in data['choices'][0]:
                        expanded = data['choices'][0]['message']['content']
                    else:
                        print(f"Warning: Unexpected JSON response format")
                        expanded = text
                else:
                    expanded = response.text

                return expanded.strip()
            else:
                print(f"Warning: Expand API request failed with status {response.status_code}")
                return text

        except Exception as e:
            print(f"Warning: Failed to expand prompt: {e}")
            return text

    def generate_text(self, camera, lens, lighting, perspective, location, pose, orientation, top, bottom, boots, socks, accessories, tattoo, tattoo_location, weather, season, character, gender, facial_expressions, hair_style, hair_color, head_movements, hand_movements, leg_foot_movements, color_tone, mood_atmosphere, photography_style, photography_technique, post_processing, depth_of_field, composition, texture, output_mode, expand_mode, template):

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

            if expand_mode != "Off":
                output = self.expand_prompt(output, expand_mode, "Tags")
        elif output_mode == "Standard-Tags-EN":
            language = "EN"
            keyword = ",".join([
                self.get_value_by_lang(selections[field], language)
                for field in selections if "Ignore" not in selections[field]
            ])
            output = keyword

            if expand_mode != "Off":
                output = self.expand_prompt(output, expand_mode, "Tags")
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

            if expand_mode != "Off":
                output = self.expand_prompt(output, expand_mode, "Tags")
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

            if expand_mode != "Off":
                output = self.expand_prompt(output, expand_mode, "Tags")
        else:
            output = template.format(
                **{field: get_value(selections[field]) for field in selections}
            )

            if expand_mode != "Off":
                output = self.expand_prompt(output, expand_mode, "Template")

        return (output,)
    
    @classmethod
    def IS_CHANGED(cls, camera, lens, lighting, perspective, location, pose, orientation, top, bottom, boots, socks, accessories, tattoo, tattoo_location, weather, season, character, gender, facial_expressions, hair_style, hair_color, head_movements, hand_movements, leg_foot_movements, color_tone, mood_atmosphere, photography_style, photography_technique, post_processing, depth_of_field, composition, texture, output_mode, expand_mode, template):
        return str(time.time())