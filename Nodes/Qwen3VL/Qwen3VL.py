import os
import torch
import folder_paths
from torchvision.transforms import ToPILImage
from transformers import (
    Qwen3VLForConditionalGeneration,
    AutoProcessor,
    BitsAndBytesConfig,
)
import model_management
from qwen_vl_utils import process_vision_info
from pathlib import Path

QWEN_PROMPT_TYPES = {
    "忽略": "",
    "Describe": "Describe this image in detail.",
    "Caption": "Write a concise caption for this image.",
    "Analyze": "Analyze the main elements and scene in this image.",
    "Identify": "What objects and subjects do you see in this image?",
    "Explain": "Explain what's happening in this image.",
    "List": "List the main objects visible in this image.",
    "Scene": "Describe the scene and setting of this image.",
    "Details": "What are the key details in this image?",
    "Summarize": "Summarize the key content of this image in 1-2 sentences.",
    "Emotion": "Describe the emotions or mood conveyed by this image.",
    "Style": "Describe the artistic or visual style of this image.",
    "Location": "Where might this image be taken? Analyze the setting or location.",
    "Question": "What question could be asked based on this image?",
    "Creative": "Describe this image as if writing the beginning of a short story.",
    "OCR": "Extract and transcribe any text visible in this image.",
    "Count": "Count and list the number of specific objects in this image.",
    "Compare": "Compare and contrast the different elements in this image.",
    "Technical": "Provide a technical analysis of this image including composition, lighting, and visual elements.",
}

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
                "character_name": ("STRING", {"default": "Character", "multiline": False}),
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

class Qwen3VLAdv:
    def __init__(self):
        self.model_checkpoint = None
        self.processor = None
        self.model = None
        self.device = model_management.get_torch_device()
        self.bf16_support = (
            torch.cuda.is_available()
            and torch.cuda.get_device_capability(self.device)[0] >= 8
        )

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "batch_mode": ("BOOLEAN", {"default": False}),
                "batch_directory": ("STRING", {"default": ""}),
                "user_prompt": ("STRING", {"default": "", "multiline": True}),
                "preset_prompt": (list(QWEN_PROMPT_TYPES.keys()), {"default": "Describe"}),
                "model": (
                    [
                        "Qwen3-VL-4B-Instruct",
                        "Qwen3-VL-4B-Thinking",
                        "Qwen3-VL-8B-Instruct",
                        "Qwen3-VL-8B-Thinking",
                        "Qwen3-VL-4B-Instruct-FP8",
                        "Qwen3-VL-4B-Thinking-FP8",
                        "Qwen3-VL-8B-Instruct-FP8",
                        "Qwen3-VL-8B-Thinking-FP8",
                        "Qwen3-VL-4B-Instruct-abliterated",
                        "Qwen3-VL-4B-Thinking-abliterated",
                        "Qwen3-VL-8B-Instruct-abliterated",
                        "Qwen3-VL-8B-Thinking-abliterated", 
                        
                    ],
                    {"default": "Qwen3-VL-8B-Instruct"},
                ),
                "quantization": (
                    ["none", "4bit", "8bit"],
                    {"default": "none"},
                ),
                "temperature": (
                    "FLOAT",
                    {"default": 0.7, "min": 0, "max": 1, "step": 0.1},
                ),
                "max_new_tokens": (
                    "INT",
                    {"default": 2048, "min": 128, "max": 2048, "step": 1},
                ),
                "min_pixels": (
                    "INT",
                    {
                        "default": 256 * 28 * 28,
                        "min": 4 * 28 * 28,
                        "max": 16384 * 28 * 28,
                        "step": 28 * 28,
                    },
                ),
                "max_pixels": (
                    "INT",
                    {
                        "default": 1280 * 28 * 28,
                        "min": 4 * 28 * 28,
                        "max": 16384 * 28 * 28,
                        "step": 28 * 28,
                    },
                ),
                "seed": ("INT", {"default": -1}),
                "attention": (
                    [
                        "eager",
                        "sdpa",
                        "flash_attention_2",
                    ],
                ),
                "keep_model_loaded": ("BOOLEAN", {"default": False}),
                
            },
            "optional": {
                "source_path": ("PATH",), 
                "extra_options": ("QWEN3VL_EXTRA_OPTIONS",),
            },
        }

    RETURN_TYPES = ("STRING",)
    FUNCTION = "inference"
    CATEGORY = "Comfyui_Qwen3-VL_Adv"

    def inference(
        self,
        preset_prompt,
        model,
        user_prompt,
        keep_model_loaded,
        temperature,
        max_new_tokens,
        min_pixels,
        max_pixels,
        seed,
        quantization,
        source_path=None,
        attention="eager",
        batch_mode=False,
        batch_directory="",
        extra_options=None,
    ):
        preset_text = QWEN_PROMPT_TYPES.get(preset_prompt, "Describe this image.")
        
        if preset_prompt == "忽略":
            final_prompt = user_prompt.strip() if (isinstance(user_prompt, str) and user_prompt.strip()) else ""
        else:
            final_prompt = user_prompt.strip() if (isinstance(user_prompt, str) and user_prompt.strip()) else preset_text
        
        if extra_options is not None:
            extra_instructions, character_name = extra_options
            if extra_instructions:
                extra_text = " " + " ".join(extra_instructions)
                final_prompt = final_prompt + extra_text
        
        if batch_mode:
            conflicts = []
            if source_path is not None:
                conflicts.append("source_path")
            
            if conflicts:
                conflict_list = "、".join(conflicts)
                error_message = (
                    f"检测到批量模式与以下输入端口冲突：{conflict_list}。\n\n"
                    f"解决方式(A或B)：\n"
                    f"A.断开 {conflict_list} 端口的连接，批量模式将从指定目录读取图片\n"
                    f"B.关闭批量模式，使用单张图片处理模式\n\n"
                    f"注意：批量模式设计用于处理目录中的多张图片，与单张图片输入端口互斥。"
                )
                raise ValueError(error_message)
            
            return self.batch_inference(
                final_prompt, batch_directory, model, quantization, keep_model_loaded,
                temperature, max_new_tokens, min_pixels, max_pixels,
                seed, attention, extra_options
            )
        
        if seed != -1:
            torch.manual_seed(seed)
        model_id = f"qwen/{model}"
        self.model_checkpoint = os.path.join(
            folder_paths.models_dir, "prompt_generator", os.path.basename(model_id)
        )

        if not os.path.exists(self.model_checkpoint):
            from huggingface_hub import snapshot_download

            snapshot_download(
                repo_id=model_id,
                local_dir=self.model_checkpoint,
                local_dir_use_symlinks=False,
            )

        if self.processor is None:
            self.processor = AutoProcessor.from_pretrained(
                self.model_checkpoint, min_pixels=min_pixels, max_pixels=max_pixels
            )

        if self.model is None:
            if quantization == "4bit":
                quantization_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                )
            elif quantization == "8bit":
                quantization_config = BitsAndBytesConfig(
                    load_in_8bit=True,
                )
            else:
                quantization_config = None

            self.model = Qwen3VLForConditionalGeneration.from_pretrained(
                self.model_checkpoint,
                dtype=torch.bfloat16 if self.bf16_support else torch.float16,
                device_map="auto",
                attn_implementation=attention,
                quantization_config=quantization_config,
            )

        temp_path = None

        with torch.no_grad():
            if source_path:
                messages = [
                    {
                        "role": "system",
                        "content": "You are QwenVL, you are a helpful assistant expert in turning images into words.",
                    },
                    {
                        "role": "user",
                        "content": source_path
                        + [
                            {"type": "text", "text": final_prompt},
                        ],
                    },
                ]
            else:
                messages = [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": final_prompt},
                        ],
                    }
                ]

            text = self.processor.apply_chat_template(
                messages, tokenize=False, add_generation_prompt=True
            )
            image_inputs, video_inputs = process_vision_info(messages)
            inputs = self.processor(
                text=[text],
                images=image_inputs,
                videos=video_inputs,
                padding=True,
                return_tensors="pt",
            )
            inputs = inputs.to(self.device)
            generated_ids = self.model.generate(
                **inputs, max_new_tokens=max_new_tokens, temperature=temperature
            )
            generated_ids_trimmed = [
                out_ids[len(in_ids) :]
                for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
            ]
            result = self.processor.batch_decode(
                generated_ids_trimmed,
                skip_special_tokens=True,
                clean_up_tokenization_spaces=False,
                temperature=temperature,
            )

            if not keep_model_loaded:
                del self.processor
                del self.model
                self.processor = None
                self.model = None
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                    torch.cuda.ipc_collect()

            return (result,)

    def get_image_files(self, batch_directory):
        import glob
        from PIL import Image
        
        image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff', '*.webp']
        image_files = []
        
        for ext in image_extensions:
            image_files.extend(glob.glob(os.path.join(batch_directory, ext)))
            image_files.extend(glob.glob(os.path.join(batch_directory, ext.upper())))
        
        valid_files = []
        for file_path in image_files:
            try:
                with Image.open(file_path) as img:
                    if img.format is not None:
                        valid_files.append(file_path)
            except (IOError, FileNotFoundError):
                continue
        
        return valid_files

    def save_description(self, image_file, description):
        txt_file = os.path.splitext(image_file)[0] + ".txt"

        with open(txt_file, 'w', encoding='utf-8') as f:
            f.write(description)

    def batch_inference(
        self,
        final_prompt,
        batch_directory,
        model,
        quantization,
        keep_model_loaded,
        temperature,
        max_new_tokens,
        min_pixels,
        max_pixels,
        seed,
        attention,
        extra_options=None,
    ):
        if seed != -1:
            torch.manual_seed(seed)
            
        if not os.path.exists(batch_directory):
            return (f"Error: Directory '{batch_directory}' does not exist.",)
        
        image_files = self.get_image_files(batch_directory)
        if not image_files:
            return (f"No image files found in directory '{batch_directory}'.",)
        
        model_id = f"qwen/{model}"
        self.model_checkpoint = os.path.join(
            folder_paths.models_dir, "prompt_generator", os.path.basename(model_id)
        )

        if not os.path.exists(self.model_checkpoint):
            from huggingface_hub import snapshot_download
            snapshot_download(
                repo_id=model_id,
                local_dir=self.model_checkpoint,
                local_dir_use_symlinks=False,
            )

        if self.processor is None:
            self.processor = AutoProcessor.from_pretrained(
                self.model_checkpoint, min_pixels=min_pixels, max_pixels=max_pixels
            )

        if self.model is None:
            if quantization == "4bit":
                quantization_config = BitsAndBytesConfig(load_in_4bit=True)
            elif quantization == "8bit":
                quantization_config = BitsAndBytesConfig(load_in_8bit=True)
            else:
                quantization_config = None

            self.model = Qwen3VLForConditionalGeneration.from_pretrained(
                self.model_checkpoint,
                dtype=torch.bfloat16 if self.bf16_support else torch.float16,
                device_map="auto",
                attn_implementation=attention,
                quantization_config=quantization_config,
            )

        processed_count = 0
        failed_count = 0
        
        if extra_options:
            extra_instructions, character_name = extra_options
            if extra_instructions:
                final_prompt += " " + " ".join(extra_instructions)
        
        for image_file in image_files:
            try:
                with torch.no_grad():
                    messages = [
                        {
                            "role": "system",
                            "content": "You are QwenVL, you are a helpful assistant expert in turning images into words.",
                        },
                        {
                            "role": "user",
                            "content": [
                                {"type": "image", "image": f"file://{image_file}"},
                                {"type": "text", "text": final_prompt},
                            ],
                        },
                    ]

                    text_input = self.processor.apply_chat_template(
                        messages, tokenize=False, add_generation_prompt=True
                    )
                    image_inputs, video_inputs = process_vision_info(messages)
                    inputs = self.processor(
                        text=[text_input],
                        images=image_inputs,
                        videos=video_inputs,
                        padding=True,
                        return_tensors="pt",
                    )
                    inputs = inputs.to(self.device)
                    
                    generated_ids = self.model.generate(
                        **inputs, max_new_tokens=max_new_tokens, temperature=temperature
                    )
                    generated_ids_trimmed = [
                        out_ids[len(in_ids) :]
                        for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
                    ]
                    result = self.processor.batch_decode(
                        generated_ids_trimmed,
                        skip_special_tokens=True,
                        clean_up_tokenization_spaces=False,
                    )
                    
                    description = result[0] if result else "No description generated"
                    self.save_description(image_file, description)
                    
                    processed_count += 1
                    print(f"Processed: {os.path.basename(image_file)} - {description[:100]}...")
                    
            except Exception as e:
                failed_count += 1
                print(f"Failed to process {image_file}: {str(e)}")
                continue

        if not keep_model_loaded:
            del self.processor
            del self.model
            self.processor = None
            self.model = None
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                torch.cuda.ipc_collect()

        log_message = f"Batch processing completed. Processed: {processed_count} images, Failed: {failed_count} images in directory '{directory}'."
        
        return (log_message,)
