import random
import time
import os
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
                "template": ("STRING", {
                    "multiline": True,
                    "default": "This is a photo from a fashion magazine, A photo taken with {camera} with {lens}, {lighting}，Shoot from a {perspective} perspective, a beautiful {gender} model wearing a blue-black leather down jacket at the foot of the {location}, the clothes have the logo 'NEPL'. The model is {pose}, {orientation}, {gender} was wearing {bottom} and {boots}, there is thick snow on the ground, a path stretches to the distance, {movement} movements, strong visual impact."
                }),
            },
        }

    RETURN_TYPES = ("STRING","STRING","STRING")
    RETURN_NAMES =("template","tags","help")
    FUNCTION = "generate_text"
    CATEGORY ="Zhi.AI/Generator"
    DESCRIPTION = "Photography Prompt Generator: Generates professional photography prompts based on preset photography parameters. Includes options for camera, lens, lighting, pose, clothing, and more, with support for custom template output format."

    def random_choice(self, selected_option, options):
        if selected_option == "Random":
            actual_options = [opt for opt in options if "Random" not in opt and "Ignore" not in opt]
            return random.choice(actual_options)
        return selected_option

    def generate_text(self, camera, lens, lighting, perspective, location, pose, orientation, movement, top, bottom, boots, accessories, weather, season, character, gender, template,):
   
        selections = {
            field: self.random_choice(value, self.INPUT_TYPES()['required'][field][0])
            for field, value in zip(
                ["camera", "lens", "lighting", "perspective", "location", "pose", "orientation", "movement", "top", "bottom", "boots", "accessories", "weather", "season", "character", "gender"],
                [camera, lens, lighting, perspective, location, pose, orientation, movement, top, bottom, boots, accessories, weather, season, character, gender]
            )
        }
      
        def get_value(selection):
            return selection.split(" (")[1][:-1] if "Ignore" not in selection else ""
            
        output = template.format(
            **{field: get_value(selections[field]) for field in selections}
        )
      
        keyword = ",".join([
            selections[field].split(" (")[1][:-1]
            for field in selections if "Ignore" not in selections[field]
        ])
        help_text = "·This is a Photography Prompt Generator node that generates photography-related prompts based on preset combinations.\n·You can customize the output prompt template, reference keywords with {}, and when 'Ignore' is selected, no content will be output.\n·The output prompt template or tags can be further refined using large language models like ChatGPT, Qianwen, Zhipu, Deepseek, etc."
        return (output,keyword,help_text)
    
    @classmethod
    def IS_CHANGED(cls, camera, lens, lighting, perspective, location, pose, orientation, movement, top, bottom, boots, accessories, weather, season, character, gender, template):
        return str(time.time())