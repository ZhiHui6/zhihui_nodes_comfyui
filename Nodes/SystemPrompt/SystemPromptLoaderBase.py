import os
import json

current_dir = os.path.dirname(os.path.realpath(__file__))
PRESETS_DIR = os.path.join(current_dir, "prompt_preset_flies")

if not os.path.exists(PRESETS_DIR):
    os.makedirs(PRESETS_DIR)

def get_all_preset_options():
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
    if '/' not in preset_path:
        return None, None
    parts = preset_path.split('/', 1)
    return parts[0], parts[1]

class SystemPromptLoaderBase:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        preset_options = get_all_preset_options()
        
        return {
            "required": {
                "引导预设": (preset_options, ),
            },
            }

    @classmethod
    def OUTPUT_TYPES(cls):
        return ("系统引导词",)
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("系统引导词",)
    FUNCTION = "load_preset"
    CATEGORY = "zhihui/文本"
    OUTPUT_NODE = True
    DESCRIPTION = "系统引导词加载器基础版：简化版的系统引导词加载器，直接从预设文件中加载系统引导词模板。支持多种场景的引导词预设，适用于需要纯系统引导词输出的场景，不包含用户提示词处理功能。"

    def load_preset(self, 引导预设):
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

        return (system_prompt_content,)
        
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        import time
        return time.time()