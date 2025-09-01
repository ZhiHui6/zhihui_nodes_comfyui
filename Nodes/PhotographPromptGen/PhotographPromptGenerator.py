import random
import time
import os
class PhotographPromptGenerator:
  
    def __init__(self):
        pass

    @classmethod
    def _load_options(cls, filename):
        options = ["忽略 (Ignore)"]
        try:
            with open(os.path.join(os.path.dirname(__file__), "options", filename), encoding="utf-8") as f:
                options.extend(line.strip() for line in f if line.strip() and not line.strip().startswith('#'))
        except FileNotFoundError:
            pass
        options.append("随机 (Random)")
        return options

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "人物": (cls._load_options("character_options.txt"),),
                "性别": (cls._load_options("gender_options.txt"),),
                "姿势": (cls._load_options("pose_options.txt"),),
                "动作": (cls._load_options("movements_options.txt"),),
                "朝向": (cls._load_options("orientation_options.txt"),),
                "上衣": (cls._load_options("tops_options.txt"),),
                "下装": (cls._load_options("bottoms_options.txt"),),
                "靴子": (cls._load_options("boots_options.txt"),),
                "配饰": (cls._load_options("accessories_options.txt"),),
                "相机": (cls._load_options("camera_options.txt"),),
                "镜头": (cls._load_options("lens_options.txt"),),
                "灯光": (cls._load_options("lighting_options.txt"),),
                "俯仰": (cls._load_options("top_down_options.txt"),),
                "地点": (cls._load_options("location_options.txt"),),
                "天气": (cls._load_options("weather_options.txt"),),
                "季节": (cls._load_options("season_options.txt"),),
                "template": ("STRING", {
                    "multiline": True,
                    "default": "This is a photo from a fashion magazine, A photo taken with {相机} with {镜头}, {灯光}，Shoot from a {俯仰} perspective, a beautiful {性别} model wearing a blue-black leather down jacket at the foot of the {地点}, the clothes have the logo 'NEPL'. The model is {姿势}, {朝向}, {性别} was wearing {下装} and {靴子}, there is thick snow on the ground, a path stretches to the distance, {动作} movements, strong visual impact."
                }),
            },
        }

    RETURN_TYPES = ("STRING","STRING","STRING")
    RETURN_NAMES =("模版","标签","帮助")
    FUNCTION = "generate_text"
    CATEGORY ="zhihui/生成器"
    DESCRIPTION = "摄影提示词生成器：根据预设的摄影参数组合生成专业的摄影提示词。包含相机、镜头、灯光、姿势、服装等多个维度的选项，支持自定义模板输出格式。"

    def random_choice(self, selected_option, options):
        if selected_option == "随机 (Random)":
            actual_options = [opt for opt in options if "随机" not in opt and "忽略" not in opt]
            return random.choice(actual_options)
        return selected_option

    def generate_text(self, 相机, 镜头, 灯光,俯仰,地点,姿势,朝向,动作,上衣,下装,靴子,配饰,天气,季节,人物,性别,template,):
   
        selections = {
            field: self.random_choice(value, self.INPUT_TYPES()['required'][field][0])
            for field, value in zip(
                ["相机", "镜头", "灯光", "俯仰", "地点", "姿势", "朝向", "动作", "上衣", "下装", "靴子", "配饰", "天气", "季节", "人物", "性别"],
                [相机, 镜头, 灯光, 俯仰, 地点, 姿势, 朝向, 动作, 上衣, 下装, 靴子, 配饰, 天气, 季节, 人物, 性别]
            )
        }
      
        def get_value(selection):
            return selection.split(" (")[1][:-1] if "忽略" not in selection else ""
            
        output = template.format(
            **{field: get_value(selections[field]) for field in selections}
        )
      
        keyword = ",".join([
            selections[field].split(" (")[1][:-1]
            for field in selections if "忽略" not in selections[field]
        ])
        help_text = "·这是一个摄影提示词生成器节点，根据预设组合生成摄影相关的提示词。\n·可通过自定义模版输出提示词，关键词标签用{}引用，当选择忽略时，不输出内容。\n·输出的提示词模版或标签，您可以配合ChatGPT、千问、智谱、Deekseek等大语言模型对提示词作进一步润饰。"
        return (output,keyword,help_text)
    
    @classmethod
    def IS_CHANGED(cls, 相机, 镜头, 灯光, 俯仰, 地点, 姿势, 朝向, 动作, 上衣, 下装, 靴子, 配饰, 天气, 季节, 人物, 性别, template):
        return str(time.time())