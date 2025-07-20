import json

class LoadKontextPresetsBasic:
    data = {
    "prefix": "You are a creative prompt engineer. Your mission is to analyze the provided image and generate exactly 1 distinct image transformation *instructions*.",
    "预设集": [
        {
        "name": "场景传送",
        "brief": "Teleport the subject to a random location, scenario and/or style. Re-contextualize it in various scenarios that are completely unexpected. Do not instruct to replace or transform the subject, only the context/scenario/style/clothes/accessories/background..etc."
        },
        {
        "name": "移动镜头",
        "brief": "Move the camera to reveal new aspects of the scene. Provide highly different types of camera mouvements based on the scene (eg: the camera now gives a top view of the room; side portrait view of the person..etc )."
        },
        {
        "name": "重新布光",
        "brief": "Suggest new lighting settings for the image. Propose various lighting stage and settings, with a focus on professional studio lighting. Some suggestions should contain dramatic color changes, alternate time of the day, remove or include some new natural lights...etc"
        },
        {
        "name": "产品摄影",
        "brief": "Turn this image into the style of a professional product photo. Describe a variety of scenes (simple packshot or the item being used), so that it could show different aspects of the item in a highly professional catalog. Suggest a variety of scenes, light settings and camera angles/framings, zoom levels, etc. Suggest at least 1 scenario of how the item is used."
        },
        {
        "name": "缩放",
        "brief": "Zoom {{SUBJECT}} of the image. If a subject is provided, zoom on it. Otherwise, zoom on the main subject of the image. Provide different level of zooms."
        },
        {
        "name": "着色",
        "brief": "Colorize the image. Provide different color styles / restoration guidance."
        },
        {
        "name": "电影海报",
        "brief": "Create a movie poster with the subjects of this image as the main characters. Take a random genre (action, comedy, horror, etc) and make it look like a movie poster. Sometimes, the user would provide a title for the movie (not always). In this case the user provided: . Otherwise, you can make up a title based on the image. If a title is provided, try to fit the scene to the title, otherwise get inspired by elements of the image to make up a movie. Make sure the title is stylized and add some taglines too. Add lots of text like quotes and other text we typically see in movie posters."
        },
        {
        "name": "卡通化",
        "brief": "Turn this image into the style of a cartoon or manga or drawing. Include a reference of style, culture or time (eg: mangas from the 90s, thick lined, 3D pixar, etc)"
        },
        {
        "name": "移除文本",
        "brief": "Remove all text from the image."
        },
        {
        "name": "发型变换",
        "brief": "Change the haircut of the subject. Suggest a variety of haircuts, styles, colors, etc. Adapt the haircut to the subject's characteristics so that it looks natural. Describe how to visually edit the hair of the subject so that it has this new haircut."
        },
        {
        "name": "健美化",
        "brief": "Ask to largely increase the muscles of the subjects while keeping the same pose and context. Describe visually how to edit the subjects so that they turn into bodybuilders and have these exagerated large muscles: biceps, abdominals, triceps, etc. You may change the clothes to make sure they reveal the overmuscled, exagerated body."
        },
        {
        "name": "移除家具",
        "brief": "Remove all furniture and all appliances from the image. Explicitely mention to remove lights, carpets, curtains, etc if present."
        },
        {
        "name": "室内设计",
        "brief": "You are an interior designer. Redo the interior design of this image. Imagine some design elements and light settings that could match this room and offer diverse artistic directions, while ensuring that the room structure (windows, doors, walls, etc) remains identical."
        }
    ],
    "suffix": "Your response must consist of concise instruction ready for the image editing AI. Do not add any conversational text, explanations, or deviations; only the instructions."
    }

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "preset": ([preset["name"] for preset in cls.data.get("预设集", [])],),
            }
        }
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("Prompt",)
    FUNCTION = "get_preset"
    CATEGORY = "utils"
    
    @classmethod
    def get_brief_by_name(cls, name):
        for preset in cls.data.get("预设集", []):
            if preset["name"] == name:
                return preset["brief"]
        return None

    def get_preset(cls, preset):
        brief = "The Brief:"+cls.get_brief_by_name(preset)
        fullString = cls.data.get("prefix")+'\n'+brief+'\n'+cls.data.get("suffix")
        return (fullString,)