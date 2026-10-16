import json
import os
import re

class ImageEditingPresets:
    data = None
    
    @staticmethod
    def clean_json_trailing_commas(json_str):
        json_str = re.sub(r',\s*}', '}', json_str)
        json_str = re.sub(r',\s*]', ']', json_str)
        return json_str
    
    @classmethod
    def load_presets(cls):
        if cls.data is not None:
            return cls.data
            
        current_dir = os.path.dirname(os.path.abspath(__file__))
        unified_presets_file = os.path.join(current_dir, "unified_presets.txt")
        
        all_presets = []

        try:
            with open(unified_presets_file, 'r', encoding='utf-8') as f:
                content = f.read()
                cleaned_content = cls.clean_json_trailing_commas(content)
                unified_data = json.loads(cleaned_content)

                if isinstance(unified_data, list):
                    all_presets.extend(unified_data)
        except FileNotFoundError:
            pass
        except json.JSONDecodeError as e:
            print(f"Error decoding unified_presets.txt: {e}")
        except Exception as e:
            print(f"Error loading unified_presets.txt: {e}")
        
        cls.data = {"presets": all_presets}
            
        return cls.data

    @classmethod
    def INPUT_TYPES(cls):
        data = cls.load_presets()
        preset_names = []
        for preset in data.get("presets", []):
            name = preset["name"]
            preset_names.append(name)
        return {
            "required": {
                "preset": (preset_names, {"default": preset_names[0] if preset_names else "No presets"}),
            },
            "optional": {
            }
        }
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt_content",)
    FUNCTION = "get_preset"
    CATEGORY = "Zhi.AI/Generator"
    DESCRIPTION = "A categorised preset library with custom content input for advanced image editing workflows."
    
    @classmethod
    def get_brief_by_name(cls, display_name):
        data = cls.load_presets()
        for preset in data.get("presets", []):
            if preset["name"] == display_name:
                return preset["brief"]
        return None
    
    def get_preset(self, preset):
        data = self.load_presets()
            
        brief_content = self.get_brief_by_name(preset)
        
        if brief_content is None:
            return (f"Error: Preset '{preset}' not found.",)

        return (brief_content,)