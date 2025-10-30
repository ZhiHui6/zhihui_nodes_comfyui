import re

class TextModifier:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "text_input": ("STRING", {"forceInput": True, "multiline": True, "default": ""}),
                "start_text": ("STRING", {"default": "", "multiline": False}),
                "end_text": ("STRING", {"default": "", "multiline": False}),
            },
        }

    RETURN_TYPES = ("STRING", "STRING")  
    RETURN_NAMES = ("text_output", "help") 
    FUNCTION = "substr"
    OUTPUT_NODE = False 
    CATEGORY = "Zhi.AI/Text"
    DESCRIPTION = "Text Modifier: Extracts text content between specified start and end text. Can delete specified strings and all text before or after them, enabling precise text extraction functionality."
    
    def __init__(self):
        self.start_text = ""
        self.end_text = ""

    def substr(self, text_input, start_text="", end_text=""):
        help_text = "【Node Function】\nExtracts remaining text by specifying characters to delete based on start text and end text.\n·Start text: Deletes the specified string and all text before it in the original text.\n·End text: Deletes the specified string and all text after it in the original text.\n \n【Example Usage】\nIf 'start_text' is 'your' and 'end_text' is 'who'.\nOriginal: Save your heart for someone who cares.\nOutput: heart for someone"
               
        if text_input == "" or text_input is None:
            return (None, help_text)
        
        if start_text == "" and end_text == "":
            out = text_input
        
        elif start_text == "":
            end_index = text_input.find(end_text)
            out = text_input[:end_index]
        
        elif end_text == "":
            start_index = text_input.find(start_text) + len(start_text)
            out = text_input[start_index:]
        
        else:
            start_index = text_input.find(start_text) + len(start_text)
            end_index = text_input.find(end_text, start_index)
            out = text_input[start_index:end_index]
        out = out.strip()
        return (out, help_text)