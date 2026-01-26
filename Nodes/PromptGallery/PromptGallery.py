import os

class PromptGallery:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "directory": ("STRING", {"default": ""}),
                "selected_image": ("STRING", {"default": ""}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text_content",)
    FUNCTION = "load_content"
    CATEGORY = "Zhihui/Gallery"

    def load_content(self, directory="", selected_image=""):
        if not directory or not selected_image:
            return ("",)
        
        name, _ = os.path.splitext(selected_image)
        txt_path = os.path.join(directory, name + ".txt")

        text_content = ""
        if os.path.exists(txt_path):
            try:
                with open(txt_path, 'r', encoding='utf-8') as f:
                    text_content = f.read()
            except Exception as e:
                print(f"Error reading text file {txt_path}: {e}")
        
        return (text_content,)
