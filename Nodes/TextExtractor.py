import re

class TextExtractor:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "text_input": ("STRING", {"forceInput": True}),
                "extraction_type": (["zh", "en"], {"default": "zh"}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text_output",)
    FUNCTION = "extract_text"
    CATEGORY = "zhihui/Text"
    DESCRIPTION = "Text Extractor: Extracts specific content from text based on the selected extraction type. Supports Chinese extraction (extracts all Chinese characters, punctuation and numbers) and English extraction (extracts all English characters, punctuation and numbers), suitable for multilingual text processing and content separation."

    def extract_text(self, text_input, extraction_type):
        if extraction_type == "zh":
            pattern = r'[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+'
        else:
            pattern = r'[a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};:\\",./<>/?]+'
        
        matches = re.findall(pattern, text_input)
        cleaned_matches = [' '.join(match.split()) for match in matches]
        extracted_text = ' '.join(cleaned_matches).strip()
        return (extracted_text,)