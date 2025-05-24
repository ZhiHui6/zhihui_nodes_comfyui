import comfy
import os

current_dir = os.path.dirname(os.path.realpath(__file__))
PRESETS_DIR = os.path.join(current_dir, "prompt_preset_flies")

if not os.path.exists(PRESETS_DIR):
    os.makedirs(PRESETS_DIR)

def get_preset_files():
    if not os.path.isdir(PRESETS_DIR):
        return []
    return [f.replace('.txt', '') for f in os.listdir(PRESETS_DIR) if f.endswith('.txt')]

class SystemPromptLoader:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        preset_files = get_preset_files()
        if not preset_files:
            preset_files = ["未找到预设文件"]
        return {
            "required": {
                "用户提示词": ("STRING", {"multiline": True, "default": ""}),
                "系统引导词预设": (preset_files, ),
                "系统引导词包含用户提示词": ("BOOLEAN", {"default": False}),
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

    def load_preset(self, 用户提示词, 系统引导词预设, 系统引导词包含用户提示词):
        system_prompt_content = ""
        if 系统引导词预设 == "未找到预设文件":
            system_prompt_content = "未选择预设或没有可用的预设文件。"
        else:
            file_path = os.path.join(PRESETS_DIR, 系统引导词预设 + '.txt')
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    system_prompt_content = f.read()
            except Exception as e:
                print(f"加载预设文件 {系统引导词预设}.txt 时出错: {e}")
                system_prompt_content = f"加载预设时出错: {e}"

        if 系统引导词包含用户提示词 and 用户提示词:
            final_system_prompt = f"{system_prompt_content}\n{用户提示词}"
        else:
            final_system_prompt = system_prompt_content

        return (用户提示词, final_system_prompt,)