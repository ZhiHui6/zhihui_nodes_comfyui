import os

current_dir = os.path.dirname(os.path.realpath(__file__))
PRESETS_DIR = os.path.join(current_dir, "prompt_preset_flies")

if not os.path.exists(PRESETS_DIR):
    os.makedirs(PRESETS_DIR)

def get_all_preset_options():
    if not os.path.isdir(PRESETS_DIR):
        return ["Preset folder not found"]
    
    options = []
    
    def scan_directory(base_path, prefix=""):
        items = []
        try:
            for item in sorted(os.listdir(base_path)):
                item_path = os.path.join(base_path, item)
                if os.path.isdir(item_path):
                    sub_items = scan_directory(item_path, f"{prefix}{item}/")
                    items.extend(sub_items)
                elif item.endswith('.txt'):
                    file_name = item.replace('.txt', '')
                    items.append(f"{prefix}{file_name}")
        except PermissionError:
            pass
        return items
    
    options = scan_directory(PRESETS_DIR)
    return options if options else ["No preset files found"]

def parse_preset_path(preset_path):
    if '/' not in preset_path:
        return None, None
    
    parts = preset_path.rsplit('/', 1)
    if len(parts) == 2:
        folder_path = parts[0]
        filename = parts[1]
        return folder_path, filename
    return None, None

class SystemPromptLoader:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        preset_options = get_all_preset_options()
        
        return {
            "required": {
                "enable_node": ("BOOLEAN", {"default": True}),
                "system_preset": (preset_options, ),
            },
            }

    @classmethod
    def OUTPUT_TYPES(cls):
        return ("system_prompt",)
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("system_prompt",)
    FUNCTION = "load_preset"
    CATEGORY = "Zhi.AI/Toolkit"
    OUTPUT_NODE = True
    DESCRIPTION = "System Prompt Loader: A simplified system prompt loader that loads system prompt templates directly from preset files. Supports various scenario presets, suitable for scenarios that require pure system prompt output without user prompt processing functionality."

    def load_preset(self, enable_node, system_preset):
        
        if enable_node is False:
            return ("",)

        system_prompt_content = ""
        
        if system_preset in ["Preset folder not found", "No preset files found"]:
            system_prompt_content = "No valid preset file selected."
        else:
            folder_path, filename = parse_preset_path(system_preset)
            if folder_path and filename:
                file_path = os.path.join(PRESETS_DIR, folder_path, filename + '.txt')
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        system_prompt_content = f.read()
                except Exception as e:
                    print(f"Error loading preset file {system_preset}.txt: {e}")
                    system_prompt_content = f"Error loading preset: {e}"
            else:
                system_prompt_content = "Invalid preset path format."

        return (system_prompt_content,)
        
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        import time
        return time.time()