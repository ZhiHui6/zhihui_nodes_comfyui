import comfy
import comfy.sd
import comfy.utils
import torch

class ExtraOptions:
    
    def __init__(self):
        self.style_presets = {
            "Descriptive": "Write a detailed description for this image.",
            "Straightforward": """Write a straightforward caption for this image. Begin with the main subject and medium. Mention pivotal elements—people, objects, scenery—using confident, definite language. Focus on concrete details like color, shape, texture, and spatial relationships. Show how elements interact. Omit mood and speculative wording. If text is present, quote it exactly. Note any watermarks, signatures, or compression artifacts. Never mention what's absent, resolution, or unobservable details. Vary your sentence structure and keep the description concise, without starting with "This image is..." or similar phrasing.""",
            "Training Prompt": "Write a stable diffusion prompt for this image.",
            "MidJourney Prompt": "Write a MidJourney prompt for this image.",
            "Booru Tags": "Write a list of Booru tags for this image.",
            "Custom Guide": "",

        }
        self.preset_texts = {
            "text1": "Do not include information about people/characters that cannot be changed (like ethnicity, gender, etc), but do still include changeable attributes (like hair style).",
            "text2": "Include information about lighting.",
            "text3": "Include information about camera angle.",
            "text4": "Include information about whether there is a watermark or not.",
            "text5": "Include information about whether there are JPEG artifacts or not.",
            "text6": "If it is a photo you MUST include information about what camera was likely used and details such as aperture, shutter speed, ISO, etc.",
            "text7": "Do not include anything sexual; keep it PG.",
            "text8": "Do not mention the image's resolution.",
            "text9": "You must include information about the subjective aesthetic quality of the image from low to very high.",
            "text10": "Include information on the image's composition style, such as leading lines, rule of thirds, or symmetry.",
            "text11": "Do not mention any text that is in the image.",
            "text12": "Specify the depth of field and whether the background is in focus or blurred.",
            "text13": "If applicable, mention the likely use of artificial or natural lighting sources.",
            "text14": "Do not use any ambiguous language.",
            "text15": "Include whether the image is sfw, suggestive, or nsfw.",
            "text16": "Only describe the most important elements of the image.",
            "text17": "If it is a work of art, do not include the artist's name or the title of the work.",
            "text18": "Identify the image orientation (portrait, landscape, or square) and aspect ratio if obvious.",
            "text19": """Use vulgar slang and profanity, such as (but not limited to) "fucking," "slut," "cock," etc.""",
            "text20": "Do NOT use polite euphemisms—lean into blunt, casual phrasing.",
            "text21": "Include information about the ages of any people/characters when applicable.",
            "text22": "Mention whether the image depicts an extreme close-up, close-up, medium close-up, medium shot, cowboy shot, medium wide shot, wide shot, or extreme wide shot.",
            "text23": "Do not mention the mood/feeling/etc of the image.",
            "text24": "Explicitly specify the vantage height (eye-level, low-angle worm’s-eye, bird’s-eye, drone, rooftop, etc.).",
            "text25": "If there is a watermark, you must mention it.",
            "text26": """Your response will be used by a text-to-image model, so avoid useless meta phrases like “This image shows…”, "You are looking at...", etc.""",
        }

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "guide_text": ("STRING", {"multiline": True, "default": "Describe this image in detail."}),
                "reverse_type": (["Descriptive", "Straightforward", "Training Prompt", "MidJourney Prompt", "Booru Tags", "Custom Guide"], {"default": "Descriptive"}),
                "options_master_switch": ("BOOLEAN", {"default": True})
            },
            "optional": {
                "exclude_unchangeable_character_info_but_include_changeable_attributes": ("BOOLEAN", {"default": False}),
                "include_lighting_info": ("BOOLEAN", {"default": False}),
                "include_camera_angle_info": ("BOOLEAN", {"default": False}),
                "include_watermark_info": ("BOOLEAN", {"default": False}),
                "include_jpeg_artifacts_info": ("BOOLEAN", {"default": False}),
                "include_camera_details_for_photos": ("BOOLEAN", {"default": False}),
                "exclude_sexual_content_keep_pg": ("BOOLEAN", {"default": False}),
                "exclude_image_resolution": ("BOOLEAN", {"default": False}),
                "include_subjective_aesthetic_quality": ("BOOLEAN", {"default": False}),
                "include_composition_style_info": ("BOOLEAN", {"default": False}),
                "exclude_text_in_image": ("BOOLEAN", {"default": False}),
                "specify_depth_of_field": ("BOOLEAN", {"default": False}),
                "mention_lighting_sources": ("BOOLEAN", {"default": False}),
                "avoid_ambiguous_language": ("BOOLEAN", {"default": False}),
                "include_content_rating": ("BOOLEAN", {"default": False}),
                "describe_only_important_elements": ("BOOLEAN", {"default": False}),
                "exclude_artist_name_and_title": ("BOOLEAN", {"default": False}),
                "identify_image_orientation": ("BOOLEAN", {"default": False}),
                "use_vulgar_slang": ("BOOLEAN", {"default": False}),
                "avoid_polite_euphemisms": ("BOOLEAN", {"default": False}),
                "include_character_ages": ("BOOLEAN", {"default": False}),
                "include_camera_shot_types": ("BOOLEAN", {"default": False}),
                "exclude_mood_feelings": ("BOOLEAN", {"default": False}),
                "include_camera_vantage_height": ("BOOLEAN", {"default": False}),
                "mention_watermarks": ("BOOLEAN", {"default": False}),
                "avoid_meta_descriptive_phrases": ("BOOLEAN", {"default": False}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("guide_output",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/text"
    DESCRIPTION = "Extra Options Node: Provides detailed guidance option configuration for image reverse engineering. Supports multiple reverse types (descriptive, training prompts, MidJourney prompts, etc.), and provides rich optional parameters to control output content details, such as lighting information, camera angles, composition styles, etc., suitable for precise image description and prompt generation."

    def execute(self, guide_text, reverse_type, options_master_switch, exclude_unchangeable_character_info_but_include_changeable_attributes=False, include_lighting_info=False, include_camera_angle_info=False, include_watermark_info=False, include_jpeg_artifacts_info=False, include_camera_details_for_photos=False, exclude_sexual_content_keep_pg=False, exclude_image_resolution=False, include_subjective_aesthetic_quality=False, include_composition_style_info=False, exclude_text_in_image=False, specify_depth_of_field=False, mention_lighting_sources=False, avoid_ambiguous_language=False, include_content_rating=False, describe_only_important_elements=False, exclude_artist_name_and_title=False, identify_image_orientation=False, use_vulgar_slang=False, avoid_polite_euphemisms=False, include_character_ages=False, include_camera_shot_types=False, exclude_mood_feelings=False, include_camera_vantage_height=False, mention_watermarks=False, avoid_meta_descriptive_phrases=False):
        if reverse_type == "Custom Guide" and not guide_text.strip():
            raise ValueError("When selecting 'Custom Guide', you must enter content in the guide text box")
        enabled_texts = []
        if reverse_type == "Custom Guide" and guide_text:
            enabled_texts.append(guide_text)
        elif reverse_type and reverse_type != "Custom Guide":
            enabled_texts.append(self.style_presets[reverse_type])
        
        if options_master_switch:
            if exclude_unchangeable_character_info_but_include_changeable_attributes: enabled_texts.append(self.preset_texts["text1"])
            if include_lighting_info: enabled_texts.append(self.preset_texts["text2"])
            if include_camera_angle_info: enabled_texts.append(self.preset_texts["text3"])
            if include_watermark_info: enabled_texts.append(self.preset_texts["text4"])
            if include_jpeg_artifacts_info: enabled_texts.append(self.preset_texts["text5"])
            if include_camera_details_for_photos: enabled_texts.append(self.preset_texts["text6"])
            if exclude_sexual_content_keep_pg: enabled_texts.append(self.preset_texts["text7"])
            if exclude_image_resolution: enabled_texts.append(self.preset_texts["text8"])
            if include_subjective_aesthetic_quality: enabled_texts.append(self.preset_texts["text9"])
            if include_composition_style_info: enabled_texts.append(self.preset_texts["text10"])
            if exclude_text_in_image: enabled_texts.append(self.preset_texts["text11"])
            if specify_depth_of_field: enabled_texts.append(self.preset_texts["text12"])
            if mention_lighting_sources: enabled_texts.append(self.preset_texts["text13"])
            if avoid_ambiguous_language: enabled_texts.append(self.preset_texts["text14"])
            if include_content_rating: enabled_texts.append(self.preset_texts["text15"])
            if describe_only_important_elements: enabled_texts.append(self.preset_texts["text16"])
            if exclude_artist_name_and_title: enabled_texts.append(self.preset_texts["text17"])
            if identify_image_orientation: enabled_texts.append(self.preset_texts["text18"])
            if use_vulgar_slang: enabled_texts.append(self.preset_texts["text19"])
            if avoid_polite_euphemisms: enabled_texts.append(self.preset_texts["text20"])
            if include_character_ages: enabled_texts.append(self.preset_texts["text21"])
            if include_camera_shot_types: enabled_texts.append(self.preset_texts["text22"])
            if exclude_mood_feelings: enabled_texts.append(self.preset_texts["text23"])
            if include_camera_vantage_height: enabled_texts.append(self.preset_texts["text24"])
            if mention_watermarks: enabled_texts.append(self.preset_texts["text25"])
            if avoid_meta_descriptive_phrases: enabled_texts.append(self.preset_texts["text26"])
        return ("\n".join(filter(None, enabled_texts)),)