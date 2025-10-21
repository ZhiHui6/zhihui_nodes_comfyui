class Qwen3VLExtraOptions:
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "refer_character_name": ("BOOLEAN", {"default": False}),
                "exclude_people_info": ("BOOLEAN", {"default": False}),
                "include_lighting": ("BOOLEAN", {"default": False}),
                "include_camera_angle": ("BOOLEAN", {"default": False}),
                "include_watermark": ("BOOLEAN", {"default": False}),
                "include_JPEG_artifacts": ("BOOLEAN", {"default": False}),
                "include_exif": ("BOOLEAN", {"default": False}),
                "exclude_sexual": ("BOOLEAN", {"default": False}),
                "exclude_image_resolution": ("BOOLEAN", {"default": False}),
                "include_aesthetic_quality": ("BOOLEAN", {"default": False}),
                "include_composition_style": ("BOOLEAN", {"default": False}),
                "exclude_text": ("BOOLEAN", {"default": False}),
                "specify_depth_field": ("BOOLEAN", {"default": False}),
                "specify_lighting_sources": ("BOOLEAN", {"default": False}),
                "do_not_use_ambiguous_language": ("BOOLEAN", {"default": False}),
                "include_nsfw": ("BOOLEAN", {"default": False}),
                "only_describe_most_important_elements": ("BOOLEAN", {"default": False}),
                "do_not_include_artist_name_or_title": ("BOOLEAN", {"default": False}),
                "identify_image_orientation": ("BOOLEAN", {"default": False}),
                "use_vulgar_slang_and_profanity": ("BOOLEAN", {"default": False}),
                "do_not_use_polite_euphemisms": ("BOOLEAN", {"default": False}),
                "include_character_age": ("BOOLEAN", {"default": False}),
                "include_camera_shot_type": ("BOOLEAN", {"default": False}),
                "exclude_mood_feeling": ("BOOLEAN", {"default": False}),
                "include_camera_vantage_height": ("BOOLEAN", {"default": False}),
                "mention_watermark": ("BOOLEAN", {"default": False}),
                "avoid_meta_descriptive_phrases": ("BOOLEAN", {"default": False}),
                "character_name": ("STRING", {"default": "", "multiline": False}),
            },
            "optional": {
            }
        }

    RETURN_TYPES = ("QWEN3VL_EXTRA_OPTIONS",)
    RETURN_NAMES = ("extra_options",)
    FUNCTION = "generate_extra_options"
    CATEGORY = "Comfyui_Qwen3-VL_Adv"

    def generate_extra_options(self, refer_character_name, exclude_people_info, include_lighting, include_camera_angle,
                     include_watermark, include_JPEG_artifacts, include_exif, exclude_sexual,
                     exclude_image_resolution, include_aesthetic_quality, include_composition_style,
                     exclude_text, specify_depth_field, specify_lighting_sources,
                     do_not_use_ambiguous_language, include_nsfw, only_describe_most_important_elements,
                     do_not_include_artist_name_or_title, identify_image_orientation, use_vulgar_slang_and_profanity,
                     do_not_use_polite_euphemisms, include_character_age, include_camera_shot_type,
                     exclude_mood_feeling, include_camera_vantage_height, mention_watermark, avoid_meta_descriptive_phrases,
                     character_name):

        extra_list = {
            "refer_character_name": f"If there is a person/character in the image you must refer to them as {character_name}.",
            "exclude_people_info": "Do NOT include information about people/characters that cannot be changed (like ethnicity, gender, etc), but do still include changeable attributes (like hair style).",
            "include_lighting": "Include information about lighting.",
            "include_camera_angle": "Include information about camera angle.",
            "include_watermark": "Include information about whether there is a watermark or not.",
            "include_JPEG_artifacts": "Include information about whether there are JPEG artifacts or not.",
            "include_exif": "If it is a photo you MUST include information about what camera was likely used and details such as aperture, shutter speed, ISO, etc.",
            "exclude_sexual": "Do NOT include anything sexual; keep it PG.",
            "exclude_image_resolution": "Do NOT mention the image's resolution.",
            "include_aesthetic_quality": "You MUST include information about the subjective aesthetic quality of the image from low to very high.",
            "include_composition_style": "Include information on the image's composition style, such as leading lines, rule of thirds, or symmetry.",
            "exclude_text": "Do NOT mention any text that is in the image.",
            "specify_depth_field": "Specify the depth of field and whether the background is in focus or blurred.",
            "specify_lighting_sources": "If applicable, mention the likely use of artificial or natural lighting sources.",
            "do_not_use_ambiguous_language": "Do NOT use any ambiguous language.",
            "include_nsfw": "Include whether the image is sfw, suggestive, or nsfw.",
            "only_describe_most_important_elements": "ONLY describe the most important elements of the image.",
            "do_not_include_artist_name_or_title": "If it is a work of art, do not include the artist's name or the title of the work.",
            "identify_image_orientation": "Identify the image orientation (portrait, landscape, or square) and aspect ratio if obvious.",
            "use_vulgar_slang_and_profanity": """Use vulgar slang and profanity, such as (but not limited to) "fucking," "slut," "cock," etc.""",
            "do_not_use_polite_euphemisms": "Do NOT use polite euphemisms—lean into blunt, casual phrasing.",
            "include_character_age": "Include information about the ages of any people/characters when applicable.",
            "include_camera_shot_type": "Mention whether the image depicts an extreme close-up, close-up, medium close-up, medium shot, cowboy shot, medium wide shot, wide shot, or extreme wide shot.",
            "exclude_mood_feeling": "Do not mention the mood/feeling/etc of the image.",
            "include_camera_vantage_height": "Explicitly specify the vantage height (eye-level, low-angle worm's-eye, bird's-eye, drone, rooftop, etc.).",
            "mention_watermark": "If there is a watermark, you must mention it.",
            "avoid_meta_descriptive_phrases": """"Your response will be used by a text-to-image model, so avoid useless meta phrases like "This image shows…", "You are looking at...", etc.""",
        }
        
        ret_list = []
        if refer_character_name:
            ret_list.append(extra_list["refer_character_name"])
        if exclude_people_info:
            ret_list.append(extra_list["exclude_people_info"])
        if include_lighting:
            ret_list.append(extra_list["include_lighting"])
        if include_camera_angle:
            ret_list.append(extra_list["include_camera_angle"])
        if include_watermark:
            ret_list.append(extra_list["include_watermark"])
        if include_JPEG_artifacts:
            ret_list.append(extra_list["include_JPEG_artifacts"])
        if include_exif:
            ret_list.append(extra_list["include_exif"])
        if exclude_sexual:
            ret_list.append(extra_list["exclude_sexual"])
        if exclude_image_resolution:
            ret_list.append(extra_list["exclude_image_resolution"])
        if include_aesthetic_quality:
            ret_list.append(extra_list["include_aesthetic_quality"])
        if include_composition_style:
            ret_list.append(extra_list["include_composition_style"])
        if exclude_text:
            ret_list.append(extra_list["exclude_text"])
        if specify_depth_field:
            ret_list.append(extra_list["specify_depth_field"])
        if specify_lighting_sources:
            ret_list.append(extra_list["specify_lighting_sources"])
        if do_not_use_ambiguous_language:
            ret_list.append(extra_list["do_not_use_ambiguous_language"])
        if include_nsfw:
            ret_list.append(extra_list["include_nsfw"])
        if only_describe_most_important_elements:
            ret_list.append(extra_list["only_describe_most_important_elements"])
        if do_not_include_artist_name_or_title:
            ret_list.append(extra_list["do_not_include_artist_name_or_title"])
        if identify_image_orientation:
            ret_list.append(extra_list["identify_image_orientation"])
        if use_vulgar_slang_and_profanity:
            ret_list.append(extra_list["use_vulgar_slang_and_profanity"])
        if do_not_use_polite_euphemisms:
            ret_list.append(extra_list["do_not_use_polite_euphemisms"])
        if include_character_age:
            ret_list.append(extra_list["include_character_age"])
        if include_camera_shot_type:
            ret_list.append(extra_list["include_camera_shot_type"])
        if exclude_mood_feeling:
            ret_list.append(extra_list["exclude_mood_feeling"])
        if include_camera_vantage_height:
            ret_list.append(extra_list["include_camera_vantage_height"])
        if mention_watermark:
            ret_list.append(extra_list["mention_watermark"])
        if avoid_meta_descriptive_phrases:
            ret_list.append(extra_list["avoid_meta_descriptive_phrases"])

        return ([ret_list, character_name],)