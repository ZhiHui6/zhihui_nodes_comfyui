import requests
import time
import json

class FreeTranslate:

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "text": ("STRING", {
                    "multiline": True, 
                    "default": "", 
                    "placeholder": "Enter text to translate..."
                }),
                "source_language": (["Auto detect", "zh", "en"], {
                    "default": "Auto detect"
                }),
                "target_language": (["zh", "en"], {
                    "default": "en"
                }),
                "model": (["claude", "deepseek", "gemini", "openai", "mistral", "qwen-coder", "llama", "sur", "unity", "searchgpt", "evil"], {
                    "default": "openai"
                }),
            }
        }
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("translation_result",)
    FUNCTION = "translate"
    CATEGORY = "zhihui/Translate"
    DESCRIPTION = "Free Translate: A free solution for text translation using various AI models. Supports Chinese-English mutual translation, automatic language detection, and provides multiple AI model choices including Claude, GPT, Gemini, etc. No API key required, suitable for quick translation and multilingual content processing."
    
    def detect_language(self, text):
        chinese_chars = sum(1 for char in text if '\u4e00' <= char <= '\u9fff')
        total_chars = len(text.strip())
        
        if total_chars == 0:
            return "unknown"
        
        chinese_ratio = chinese_chars / total_chars
        
        if chinese_ratio > 0.3:
            return "zh"
        else:
            return "en"
    
    def build_translate_prompt(self, text, source_language, target_language):
        if source_language == "Auto detect":
            detected_lang = self.detect_language(text)
            actual_source = detected_lang
        else:
            actual_source = source_language
        
        if actual_source == "zh" and target_language == "en":
            prompt = f"""Please translate the following Chinese text to English with requirements:
1. Accurate, natural, and fluent translation
2. Maintain the tone and style of the original text
3. Use accurate English expressions for technical terms
4. Only output the translation result without any explanation

Chinese text to translate:
{text}"""
        elif actual_source == "en" and target_language == "zh":
            prompt = f"""Please translate the following English text to Chinese with requirements:
1. Accurate, natural, and fluent translation
2. Maintain the tone and style of the original text
3. Use language that conforms to Chinese expression habits
4. Only output the translation result without any explanation

English text to translate:
{text}"""
        elif actual_source == target_language:
            return f"Source and target languages are the same, no translation needed.\n\nOriginal text:\n{text}"
        else:
            prompt = f"""Please translate the following {actual_source} text to {target_language} with requirements:
1. Accurate, natural, and fluent translation
2. Maintain the tone and style of the original text
3. Only output the translation result without any explanation

Text to translate:
{text}"""
        
        return prompt
    
    def _handle_error(self, error_type, error_msg, model):
        return f"[{error_type}] {error_msg}"
    
    def call_translate_api(self, prompt, model="openai"):
        try:
            api_url = "https://text.pollinations.ai/"
            
            payload = {
                "messages": [{"role": "user", "content": prompt}],
                "model": model,
                "timestamp": int(time.time())
            }
            
            response = requests.post(
                api_url, 
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=45
            )
            
            if response.status_code == 200:
                result = response.text.strip()
                return result
            else:
                error_messages = {
                    400: "Request parameter error", 401: "API authentication failed", 403: "Access denied",
                    404: "API endpoint not found", 429: "Too many requests", 500: "Internal server error",
                    502: "Gateway error", 503: "Service unavailable", 504: "Gateway timeout"
                }
                error_msg = error_messages.get(response.status_code, f"HTTP error: {response.status_code}")
                return self._handle_error("API Error", error_msg, model)
                
        except requests.exceptions.Timeout:
            return self._handle_error("Timeout Error", "Request timeout", model)
        except requests.exceptions.ConnectionError:
            return self._handle_error("Connection Error", "Network connection failed", model)
        except requests.exceptions.RequestException as e:
            return self._handle_error("Network Error", f"Request exception: {str(e)}", model)
        except json.JSONDecodeError:
            return self._handle_error("Format Error", "Response data format error", model)
        except Exception as e:
            return self._handle_error("System Error", f"Unknown exception: {str(e)}", model)
    
    def translate_text(self, text, source_language, target_language, model):
        if not text.strip():
            return ("Please enter text to translate",)
        
        prompt = self.build_translate_prompt(text, source_language, target_language)
        
        translated_text = self.call_translate_api(prompt, model)
        
        return (translated_text,)