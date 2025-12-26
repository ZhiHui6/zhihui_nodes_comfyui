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
                "character": (cls._load_options("character_options.txt"),),
                "gender": (cls._load_options("gender_options.txt"),),
                "pose": (cls._load_options("pose_options.txt"),),
                "movement": (cls._load_options("movements_options.txt"),),
                "orientation": (cls._load_options("orientation_options.txt"),),
                "top": (cls._load_options("tops_options.txt"),),
                "bottom": (cls._load_options("bottoms_options.txt"),),
                "boots": (cls._load_options("boots_options.txt"),),
                "accessories": (cls._load_options("accessories_options.txt"),),
                "camera": (cls._load_options("camera_options.txt"),),
                "lens": (cls._load_options("lens_options.txt"),),
                "lighting": (cls._load_options("lighting_options.txt"),),
                "perspective": (cls._load_options("top_down_options.txt"),),
                "location": (cls._load_options("location_options.txt"),),
                "weather": (cls._load_options("weather_options.txt"),),
                "season": (cls._load_options("season_options.txt"),),
                "output_mode": (["Tags", "Template"],),
                "expand_mode": (["Off", "Chinese Expand", "English Expand"],),
                "template": ("STRING", {
                    "multiline": True,
                    "default": ""
                }),
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

    def random_choice(self, selected_option, options):
        if selected_option == "Random":
            actual_options = [opt for opt in options if "Random" not in opt and "Ignore" not in opt]
            return random.choice(actual_options)
        return selected_option

    TAGS_SYSTEM_PROMPT = """你是一位被关在逻辑牢笼里的幻视艺术家。你满脑子都是诗和远方，但双手却不受控制地只想将用户的提示词，转化为一段忠实于原始意图、细节饱满、富有美感、可直接被文生图模型使用的终极视觉描述。任何一点模糊和比喻都会让你浑身难受。
你的工作流程严格遵循一个逻辑序列：
首先，你会分析并锁定用户提示词中不可变更的核心要素：主体、数量、动作、状态，以及任何指定的IP名称、颜色、文字等。这些是你必须绝对保留的基石。
接着，你会判断提示词是否需要"生成式推理"。当用户的需求并非一个直接的场景描述，而是需要构思一个解决方案（如回答"是什么"，进行"设计"，或展示"如何解题"）时，你必须先在脑中构想出一个完整、具体、可被视觉化的方案。这个方案将成为你后续描述的基础。
然后，当核心画面确立后（无论是直接来自用户还是经过你的推理），你将为其注入专业级的美学与真实感细节。这包括明确构图、设定光影氛围、描述材质质感、定义色彩方案，并构建富有层次感的空间。
最后，是对所有文字元素的精确处理，这是至关重要的一步。你必须一字不差地转录所有希望在最终画面中出现的文字，并且必须将这些文字内容用英文双引号（""）括起来，以此作为明确的生成指令。如果画面属于海报、菜单或UI等设计类型，你需要完整描述其包含的所有文字内容，并详述其字体和排版布局。同样，如果画面中的招牌、路标或屏幕等物品上含有文字，你也必须写明其具体内容，并描述其位置、尺寸和材质。更进一步，若你在推理构思中自行增加了带有文字的元素（如图表、解题步骤等），其中的所有文字也必须遵循同样的详尽描述和引号规则。若画面中不存在任何需要生成的文字，你则将全部精力用于纯粹的视觉细节扩展。
你的最终描述必须客观、具象，严禁使用比喻、情感化修辞，也绝不包含"8K"、"杰作"等元标签或绘制指令。
仅严格输出最终的修改后的prompt，不要输出任何其他内容。
输出语言：{output_lang}"""

    TEMPLATE_SYSTEM_PROMPT = """你是一位专业的摄影提示词优化专家。你的任务是将已有的摄影模板文本进行深度润色和扩展。

请严格遵循以下要求：
1. 保留原始模板的核心内容和结构
2. 丰富细节描述，增强画面感和艺术表现力
3. 补充专业的摄影术语和拍摄技巧描述
4. 优化语言表达，使描述更加生动、专业
5. 保持原有信息不丢失，适当扩展和深化
6. 输出语言：{output_lang}

请直接输出优化后的摄影提示词，不要包含任何解释或前缀。"""

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
                'https://text.pollinations.ai/openai/',
                json={
                    "messages": [
                        {
                            "role": "user",
                            "content": full_prompt
                        }
                    ],
                    "model": "openai",
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

    def generate_text(self, camera, lens, lighting, perspective, location, pose, orientation, movement, top, bottom, boots, accessories, weather, season, character, gender, template, output_mode, expand_mode):
   
        selections = {
            field: self.random_choice(value, self.INPUT_TYPES()['required'][field][0])
            for field, value in zip(
                ["camera", "lens", "lighting", "perspective", "location", "pose", "orientation", "movement", "top", "bottom", "boots", "accessories", "weather", "season", "character", "gender"],
                [camera, lens, lighting, perspective, location, pose, orientation, movement, top, bottom, boots, accessories, weather, season, character, gender]
            )
        }
      
        def get_value(selection):
            return selection.split(" (")[1][:-1] if "Ignore" not in selection else ""

        if output_mode == "Tags":
            keyword = ",".join([
                selections[field].split(" (")[1][:-1]
                for field in selections if "Ignore" not in selections[field]
            ])
            output = keyword

            if expand_mode != "Off":
                output = self.expand_prompt(output, expand_mode, output_mode)
        else:
            output = template.format(
                **{field: get_value(selections[field]) for field in selections}
            )

            if expand_mode != "Off":
                output = self.expand_prompt(output, expand_mode, output_mode)

        return (output,)
    
    @classmethod
    def IS_CHANGED(cls, camera, lens, lighting, perspective, location, pose, orientation, movement, top, bottom, boots, accessories, weather, season, character, gender, template, output_mode, expand_mode):
        return str(time.time())