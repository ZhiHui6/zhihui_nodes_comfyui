import requests
import urllib.parse

class TextExpander:
    CATEGORY = "Zhi.AI/Generator"
    FUNCTION = "expand_text"
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text_output",)
    DESCRIPTION = "Text Expander: Uses AI models to intelligently expand input prompts. Supports multiple AI models, optional character count limits (controlled via system prompts - leave empty to disable), and custom system prompts to control expansion style and direction."

    model_options = [
        "gemini", "mistral", "nova-fast", 
        "openai", "openai-large", "openai-reasoning", "evil", "unity"
    ]

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "node_switch": ("BOOLEAN", {"default": True}),
                "character_limit": ("STRING", {"default": "", "multiline": False}),
                "model_brand": (s.model_options, {"default": "openai"}),
                "system_prompt": ("STRING", {"default": "", "multiline": True}),
                "user_prompt": ("STRING", {"default": "", "multiline": True}),
            },
            "optional": {
                "load_system_prompt": ("STRING", {"default": "", "multiline": True, "forceInput": True}),
            }
        }

    def _call_llm_api(self, text, model="openai", custom_system_prompt="", char_limit=""):
        system_content = custom_system_prompt if custom_system_prompt and custom_system_prompt.strip() else ""
        
        if char_limit and char_limit.strip():
            try:
                char_limit_value = int(char_limit.strip())
                if char_limit_value >= 5:
                    limit_instruction = f"请确保输出内容在{char_limit_value}个字符以内。"
                    if system_content:
                        system_content = f"{system_content}\n{limit_instruction}"
                    else:
                        system_content = limit_instruction
            except ValueError:
                pass
        
        if system_content:
            full_prompt = f"{system_content}\n{text}"
        else:
            full_prompt = text
        
        encoded_prompt = urllib.parse.quote(full_prompt)
    
        model_mapping = {
            "gemini": "gemini",
            "mistral": "mistral",
            "nova-fast": "nova-fast",
            "openai": "openai",
            "openai-large": "openai-large",
            "openai-reasoning": "openai-reasoning",
            "evil": "evil",
            "unity": "unity"
        }
        
        model_name = model_mapping.get(model, "openai")
        api_url = f"https://text.pollinations.ai/{model_name}/{encoded_prompt}"
        
        try:
            response = requests.get(api_url, timeout=30)
            response.raise_for_status()
            result = response.text.strip()

            if not result or len(result) < 5:
                return text
            return result
        except requests.exceptions.Timeout:
            print(f"API request timeout for model {model}. Using original text.")
            return text
        except requests.exceptions.RequestException as e:
            error_message = f"API request failed for model {model}: {e}"
            if 'response' in locals() and response is not None:
                error_message += f" | Status code: {response.status_code} | Server response: {response.text[:200]}..."
            print(error_message)
            return text

    def expand_text(self, node_switch, character_limit, model_brand, system_prompt, user_prompt, load_system_prompt=None):
        
        if not node_switch:
            return (user_prompt,)
        
        if not user_prompt.strip():
            raise ValueError("User prompt cannot be empty! Please enter the prompt content to be expanded.")
            
        if character_limit and character_limit.strip():
            try:
                char_limit_value = int(character_limit.strip())
                if char_limit_value < 5:
                    raise ValueError("Character limit parameter cannot be less than 5! Please enter a value greater than or equal to 5, or leave empty to disable this function.")
            except ValueError as e:
                if "cannot be less than 5" in str(e):
                    raise e
                else:
                    raise ValueError("Character limit parameter must be a valid number! Please enter a value greater than or equal to 5, or leave empty to disable this function.")
        
        actual_system_prompt = load_system_prompt if load_system_prompt and load_system_prompt.strip() else system_prompt
        
        expanded_text = self._call_llm_api(
            user_prompt.strip(),
            model=model_brand,
            custom_system_prompt=actual_system_prompt,
            char_limit=character_limit
        )
        
        return (expanded_text,)
    
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        import time
        return time.time()