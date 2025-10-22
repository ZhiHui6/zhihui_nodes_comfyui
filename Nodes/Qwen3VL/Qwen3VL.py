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
    "Ignore": "",
    "Detailed_Explanation":"Please explain the image content in the utmost detail.",
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

    def check_model_exists(self, model):
     
        model_id = f"qwen/{model}"
        model_path = os.path.join(
            folder_paths.models_dir, "prompt_generator", os.path.basename(model_id)
        )
        
        if not os.path.exists(model_path):
            error_msg = f"模型 '{model}' 未找到！请使用 'ModelDownloader' 模型下载器节点下载Qwen3-VL模型。"
            return False, model_path, error_msg
        
        config_file = os.path.join(model_path, "config.json")
        if not os.path.exists(config_file):
            error_msg = f"模型 '{model}' 文件不完整！请使用 'ModelDownloader' 模型下载器节点重新下载Qwen3-VL模型。"
            return False, model_path, error_msg
        
        return True, model_path, None

    def _apply_output_language(self, final_prompt, output_language):
        if output_language == "Chinese":
            return final_prompt + " 请用中文回答。"
        elif output_language == "english":
            return final_prompt + " Please respond in English."
        elif output_language == "Chinese&English":
            return final_prompt + " 请用中英双语回答，先用中文描述，然后用英文描述。Please respond in both Chinese and English, first describe in Chinese, then describe in English."
        return final_prompt

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "batch_mode": ("BOOLEAN", {"default": False}),
                "batch_directory": ("STRING", {"default": ""}),
                "user_prompt": ("STRING", {"default": "", "multiline": True}),
                "preset_prompt": (list(QWEN_PROMPT_TYPES.keys()), {"default": "Ignore"}),
                "output_language": (["Ignore", "Chinese", "english", "Chinese&English"], {"default": "Ignore"}),
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
                        "Huihui-Qwen3-VL-8B-Instruct-abliterated",
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
                "device": (
                    ["auto", "gpu", "cpu"],
                    {"default": "auto"},
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
        output_language,
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
        device,
        source_path=None,
        attention="eager",
        batch_mode=False,
        batch_directory="",
        extra_options=None,
    ):
        preset_text = QWEN_PROMPT_TYPES.get(preset_prompt, "Describe this image.")
        
        if preset_prompt == "Ignore":
            final_prompt = user_prompt.strip() if (isinstance(user_prompt, str) and user_prompt.strip()) else ""
        else:
            final_prompt = user_prompt.strip() if (isinstance(user_prompt, str) and user_prompt.strip()) else preset_text
        
        if extra_options is not None:
            extra_instructions, character_name = extra_options
            if extra_instructions:
                extra_text = " " + " ".join(extra_instructions)
                final_prompt = final_prompt + extra_text
        
        final_prompt = self._apply_output_language(final_prompt, output_language)
        
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
                seed, attention, output_language, device, extra_options
            )
        
        if seed != -1:
            torch.manual_seed(seed)
        
        model_exists, model_path, error_message = self.check_model_exists(model)
        if not model_exists:
            raise ValueError(error_message)
        
        self.model_checkpoint = model_path

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

            if device == "cpu":
                device_map = {"": "cpu"}
            elif device == "gpu":
                device_map = {"": 0}
            else:
                device_map = "auto"

            self.model = Qwen3VLForConditionalGeneration.from_pretrained(
                self.model_checkpoint,
                dtype=torch.bfloat16 if self.bf16_support else torch.float16,
                device_map=device_map,
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
        output_language,
        device,
        extra_options=None,
    ):
        if seed != -1:
            torch.manual_seed(seed)
            
        if not os.path.exists(batch_directory):
            return (f"Error: Directory '{batch_directory}' does not exist.",)
        
        image_files = self.get_image_files(batch_directory)
        if not image_files:
            return (f"No image files found in directory '{batch_directory}'.",)
        
        model_exists, model_path, error_message = self.check_model_exists(model)
        if not model_exists:
            return (error_message,)
        
        self.model_checkpoint = model_path

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

            if device == "cpu":
                device_map = {"": "cpu"}
            elif device == "gpu":
                device_map = {"": 0}
            else:
                device_map = "auto"

            self.model = Qwen3VLForConditionalGeneration.from_pretrained(
                self.model_checkpoint,
                dtype=torch.bfloat16 if self.bf16_support else torch.float16,
                device_map=device_map,
                attn_implementation=attention,
                quantization_config=quantization_config,
            )

        processed_count = 0
        failed_count = 0
        
        if extra_options:
            extra_instructions, character_name = extra_options
            if extra_instructions:
                final_prompt += " " + " ".join(extra_instructions)
        
        final_prompt = self._apply_output_language(final_prompt, output_language)
        
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