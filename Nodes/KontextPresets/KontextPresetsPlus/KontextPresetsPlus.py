import json
import os
import requests
import time
import re

class KontextPresetsPlus:
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
        default_presets_file = os.path.join(current_dir, "presets.txt")
        user_presets_file = os.path.join(current_dir, "user_presets.txt")
        
        default_presets = []
        try:
            with open(default_presets_file, 'r', encoding='utf-8') as f:
                content = f.read()
                cleaned_content = cls.clean_json_trailing_commas(content)
                default_data = json.loads(cleaned_content)

                if isinstance(default_data, list):
                    default_presets = default_data
                elif isinstance(default_data, dict) and "presets" in default_data:
                    default_presets = default_data["presets"]
                else:
                    default_presets = []

                for preset in default_presets:
                    preset["category"] = "默认 / Default"
        except FileNotFoundError:
            pass
        except json.JSONDecodeError as e:
            pass
        except Exception as e:
            pass
        
        user_presets = []
        try:
            with open(user_presets_file, 'r', encoding='utf-8') as f:
                content = f.read()
                cleaned_content = cls.clean_json_trailing_commas(content)
                user_data = json.loads(cleaned_content)

                if isinstance(user_data, list):
                    user_presets = user_data
                elif isinstance(user_data, dict) and "presets" in user_data:
                    user_presets = user_data["presets"]
                else:
                    user_presets = []

                for preset in user_presets:
                    preset["category"] = "用户 / User"
        except FileNotFoundError:
            pass
        except json.JSONDecodeError as e:
            pass
        except Exception as e:
            pass
        
        all_presets = default_presets + user_presets
        cls.data = {"presets": all_presets}
            
        return cls.data

    @classmethod
    def INPUT_TYPES(cls):
        data = cls.load_presets()
        preset_names = []
        for preset in data.get("presets", []):
            category = preset.get("category", "默认 / Default")
            name = preset["name"]
            display_name = f"[{category}] {name}"
            preset_names.append(display_name)
        return {
            "required": {
                "preset": (preset_names, {"default": preset_names[0] if preset_names else "No presets"}),
                "output_full_info": ("BOOLEAN", {"default": False}),
                "expansion_model": (["deepseek", "gemini", "openai", "mistral", "qwen-coder", "llama", "sur", "unity", "searchgpt", "evil"], {"default": "openai"}),
                "enable_builtin_expansion": ("BOOLEAN", {"default": False}),
            },
            "optional": {
                "custom_content": ("STRING", {"multiline": True, "default": "", "placeholder": "When selecting 'Custom' preset, please enter your custom content here..."}),
            }
        }
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt_content",)
    FUNCTION = "get_preset"
    CATEGORY = "zhihui/generator"
    DESCRIPTION = "Kontext Presets Plus: Provides a categorized preset library with complete information output, built-in AI expansion functionality, and custom content input. Suitable for advanced image editing and creative generation workflows."
    
    @classmethod
    def get_brief_by_name(cls, display_name):
        if display_name.startswith("[") and "] " in display_name:
            actual_name = display_name.split("] ", 1)[1]
        else:
            actual_name = display_name
            
        data = cls.load_presets()
        for preset in data.get("presets", []):
            if preset["name"] == actual_name:
                return preset["brief"]
        return None
    
    def _handle_error(self, error_type, error_msg, model, prompt):
        return f"[{error_type}] {error_msg}\n\nOriginal prompt:\n{prompt}"
    
    def call_llm_api(self, prompt, expansion_model=""):
        try:
            api_url = "https://text.pollinations.ai/"
            random_seed = int(time.time() * 1000000) % 0xffffffffffffffff
            
            payload = {
                "messages": [{"role": "user", "content": prompt}],
                "expansion_model": expansion_model,
                "seed": random_seed,
                "timestamp": int(time.time())
            }
            response = requests.post(api_url, 
                                   json=payload,
                                   headers={"Content-Type": "application/json"},
                                   timeout=45)
            
            if response.status_code == 200:
                return response.text.strip()
            else:
                error_messages = {
                    400: "Request parameter error", 401: "API authentication failed", 403: "Access denied",
                    404: "API endpoint not found", 429: "Too many requests", 500: "Internal server error",
                    502: "Gateway error", 503: "Service unavailable", 504: "Gateway timeout"
                }
                error_msg = error_messages.get(response.status_code, f"HTTP error: {response.status_code}")
                return self._handle_error("API Error", error_msg, expansion_model, prompt)
                
        except requests.exceptions.Timeout:
            return self._handle_error("Timeout Error", "Request timeout", expansion_model, prompt)
        except requests.exceptions.ConnectionError:
            return self._handle_error("Connection Error", "Network connection failed", expansion_model, prompt)
        except requests.exceptions.RequestException as e:
            return self._handle_error("Network Error", f"Request exception: {str(e)}", expansion_model, prompt)
        except json.JSONDecodeError:
            return self._handle_error("Format Error", "Response data format error", expansion_model, prompt)
        except Exception as e:
            return self._handle_error("System Error", f"Unknown exception: {str(e)}", expansion_model, prompt)

    def _process_with_llm(self, brief_content, prefix, suffix, expansion_model):
        brief = "The Brief:" + brief_content
        full_prompt = prefix + "\n" + brief + "\n" + suffix
        return self.call_llm_api(full_prompt, expansion_model)
    
    def get_preset(self, preset, output_full_info, enable_builtin_expansion, expansion_model, custom_content=""):
        data = self.load_presets()
        prefix = "You are a creative prompt engineer. Analyze the provided brief and transform it into a detailed, creative prompt that captures the essence and style described. Focus on visual elements, artistic techniques, mood, and atmosphere."
        suffix = "Your response must consist of concise instruction ready for the image editing AI. Do not add any conversational text, explanations, or deviations; only the instructions."
        
        if preset.startswith("[") and "] " in preset:
            actual_preset_name = preset.split("] ", 1)[1]
        else:
            actual_preset_name = preset
            
        if actual_preset_name == "Custom":
            brief_content = custom_content if custom_content.strip() else ""
        else:
            brief_content = self.get_brief_by_name(preset)
        
        if enable_builtin_expansion:
            processed_string = self._process_with_llm(brief_content, prefix, suffix, expansion_model)
            return (processed_string,)
        
        if output_full_info:
            full_info = f"{prefix}\n\n{brief_content}\n\n{suffix}"
            return (full_info,)
        else:
            return (brief_content,)