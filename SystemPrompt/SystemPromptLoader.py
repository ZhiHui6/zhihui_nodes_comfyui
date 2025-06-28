import os
import json

current_dir = os.path.dirname(os.path.realpath(__file__))
PRESETS_DIR = os.path.join(current_dir, "prompt_preset_flies")

if not os.path.exists(PRESETS_DIR):
    os.makedirs(PRESETS_DIR)

def get_all_preset_options():
    """获取所有预设选项，格式为 '文件夹/文件名'"""
    if not os.path.isdir(PRESETS_DIR):
        return ["未找到预设文件夹"]
    
    options = []
    for folder in os.listdir(PRESETS_DIR):
        folder_path = os.path.join(PRESETS_DIR, folder)
        if os.path.isdir(folder_path):
            for file in os.listdir(folder_path):
                if file.endswith('.txt'):
                    file_name = file.replace('.txt', '')
                    options.append(f"{folder}/{file_name}")
    
    return options if options else ["未找到预设文件"]

def parse_preset_path(preset_path):
    """解析预设路径，返回文件夹和文件名"""
    if '/' not in preset_path:
        return None, None
    parts = preset_path.split('/', 1)
    return parts[0], parts[1]

class SystemPromptLoader:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        preset_options = get_all_preset_options()
        
        return {
            "required": {
                "用户提示词": ("STRING", {"multiline": True, "default": ""}),
                "引导预设": (preset_options, ),
                "用户词写入引导词中": ("BOOLEAN", {"default": False}),
            },
            }

    @classmethod
    def OUTPUT_TYPES(cls):
        return ("用户提示词", "系统引导词",)
    RETURN_TYPES = ("STRING", "STRING",)
    RETURN_NAMES = ("用户提示词", "系统引导词",)
    FUNCTION = "load_preset"
    CATEGORY = "zhihui/文本"
    OUTPUT_NODE = True

    def load_preset(self, 用户提示词, 引导预设, 用户词写入引导词中):
        system_prompt_content = ""
        
        if 引导预设 in ["未找到预设文件夹", "未找到预设文件"]:
            system_prompt_content = "未选择有效的预设文件。"
        else:
            folder, filename = parse_preset_path(引导预设)
            if folder and filename:
                file_path = os.path.join(PRESETS_DIR, folder, filename + '.txt')
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        system_prompt_content = f.read()
                except Exception as e:
                    print(f"加载预设文件 {引导预设}.txt 时出错: {e}")
                    system_prompt_content = f"加载预设时出错: {e}"
            else:
                system_prompt_content = "预设路径格式错误。"

        if 用户词写入引导词中 and 用户提示词:
            final_system_prompt = f"{system_prompt_content}\n{用户提示词}"
        else:
            final_system_prompt = system_prompt_content

        return (用户提示词, final_system_prompt,)