import requests
import urllib.parse

class TextExpander:
    CATEGORY = "zhihui/Text"
    FUNCTION = "expand_text"
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text_output",)
    DESCRIPTION = "Text Expander: Uses AI models to intelligently expand input prompts. Supports multiple AI models, adjustable creativity temperature, character count limits, and custom system prompts to control expansion style and direction."

    model_options = [
        "claude", "deepseek", "gemini", "openai", "mistral", 
        "qwen-coder", "llama", "sur", "unity", "searchgpt", "evil"
    ]

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "node_switch": ("BOOLEAN", {"default": True}),
                "character_limit": ("STRING", {"default": "", "multiline": False}),
                "creativity_temperature": ("FLOAT", {"default": 0.7, "min": 0.1, "max": 2.0, "step": 0.1}),
                "model_brand": (s.model_options, {"default": "openai"}),
                "system_prompt": ("STRING", {"default": "", "multiline": True}),
                "user_prompt": ("STRING", {"default": "", "multiline": True}),
            },
            "optional": {
                "load_system_prompt": ("STRING", {"default": "", "multiline": True, "forceInput": True}),
            }
        }

    def _call_llm_api(self, text, model="openai", custom_system_prompt="", temperature=0.7, char_limit=""):
        system_content = custom_system_prompt if custom_system_prompt and custom_system_prompt.strip() else ""
        
        if char_limit and char_limit.strip():
            try:
                char_limit_value = int(char_limit.strip())
                if char_limit_value >= 5:
                    limit_instruction = f"Please ensure the output content is within {char_limit_value} characters."
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
            "claude": "claude",
            "deepseek": "deepseek",
            "gemini": "gemini",
            "openai": "openai",
            "mistral": "mistral",
            "qwen-coder": "qwen-coder",
            "llama": "llama",
            "sur": "sur",
            "unity": "unity",
            "searchgpt": "searchgpt",
            "evil": "evil"
        }
        
        model_name = model_mapping.get(model, "openai")
        api_url = f"https://text.pollinations.ai/{model_name}/{encoded_prompt}?temperature={temperature}"
        
        try:
            response = requests.get(api_url)
            response.raise_for_status()
            return response.text.strip()
        except requests.exceptions.RequestException as e:
            error_message = f"API request failed: {e}"
            if 'response' in locals() and response is not None:
                error_message += f" | Server response: {response.text}"
            print(error_message)
            return text

    def expand_text(self, node_switch, character_limit, creativity_temperature, model_brand, system_prompt, user_prompt, load_system_prompt=None):
        
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
            temperature=creativity_temperature,
            char_limit=character_limit
        )
        
        return (expanded_text,)
    
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        import time
        return time.time()