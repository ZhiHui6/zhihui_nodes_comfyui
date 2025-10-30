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
import re

class Qwen3VLBasic:
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

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "user_prompt": ("STRING", {
                    "default": "", 
                    "multiline": True,
                    "tooltip": "Custom user prompt to guide the model in generating specific content"
                }),
                "system_prompt": ("STRING", {
                    "default": "", 
                    "multiline": True,
                    "tooltip": "System-level prompt to define the model's behavior pattern and role positioning"
                }),
                "remove_think_tags": ("BOOLEAN", {
                    "default": False, 
                    "tooltip": "When enabled, removes </think> tags and all content before them from output text, keeping only clean description text"
                }),
                "model": (
                    [
                        "Qwen3-VL-4B-Instruct",
                        "Qwen3-VL-4B-Thinking",
                        "Qwen3-VL-8B-Instruct",
                        "Qwen3-VL-8B-Thinking",
                        "Huihui-Qwen3-VL-8B-Instruct-abliterated",
                    ],
                    {
                        "default": "Qwen3-VL-8B-Instruct",
                        "tooltip": "Select Qwen3-VL model version, including 4B/8B parameter sizes and Instruct/Thinking types"
                    },
                ),
                "quantization": (
                    ["none", "4bit", "8bit"],
                    {
                        "default": "none",
                        "tooltip": "Model quantization settings to reduce VRAM usage. 8bit balances performance and resources, 4bit saves more VRAM but may affect quality"
                    },
                ),
                "temperature": (
                    "FLOAT",
                    {
                        "default": 0.7, 
                        "min": 0, 
                        "max": 1, 
                        "step": 0.1,
                        "tooltip": "Controls randomness of generated text. Higher values are more creative, lower values are more conservative and stable"
                    },
                ),
                "max_new_tokens": (
                    "INT",
                    {
                        "default": 2048, 
                        "min": 128, 
                        "max": 8192, 
                        "step": 1,
                        "tooltip": "Maximum length of generated text. Higher values allow longer content but consume more resources"
                    },
                ),
                "min_resolution": (
                    "INT",
                    {"default": 256, "min": 112, "max": 2048, "step": 1, "tooltip": "Minimum resolution for image processing, affects detail level and processing speed"},
                ),
                "max_resolution": (
                    "INT", 
                    {"default": 768, "min": 256, "max": 4096, "step": 1, "tooltip": "Maximum resolution for image processing, higher resolution provides more detail but consumes more resources"},
                ),
                "seed": ("INT", {
                    "default": -1,
                    "tooltip": "Random seed to control generation randomness. Same seed produces same results, -1 for random seed"
                }),
                "attention": (
                    [
                        "eager",
                        "sdpa",
                        "flash_attention_2",
                    ],
                    {
                        "default": "sdpa",
                        "tooltip": "Attention mechanism implementation, affects performance and compatibility. SDPA is the recommended option"
                    },
                ),
                "device": (
                    ["auto", "gpu", "cpu"],
                    {
                        "default": "auto",
                        "tooltip": "Computing device selection. Auto automatically selects the best device, GPU uses GPU, CPU uses CPU"
                    },
                ),
                "keep_model_loaded": ("BOOLEAN", {
                    "default": False,
                    "tooltip": "Keep model loaded in memory to improve subsequent processing speed but uses more memory"
                }),
                "batch_mode": ("BOOLEAN", {
                    "default": False,
                    "tooltip": "Batch processing mode, when enabled can process multiple image files in specified directory"
                }),
                "batch_directory": ("STRING", {
                    "default": "",
                    "tooltip": "Batch processing directory path, specify the folder path containing images to be processed"
                }),
            },
            "optional": {
                "source_path": ("PATH", {
                    "tooltip": "Source path: Specify the path to the image or video file to be processed. Can be a local file path or network URL. When both source_path and image are provided, source_path takes priority. Supports common image and video formats."
                }), 
                "image": ("IMAGE", {
                    "tooltip": "Image input: Direct input of image data for processing. Usually comes from image output of other ComfyUI nodes. When both source_path and image are provided, source_path has higher priority."
                }),
            },
        }

    RETURN_TYPES = ("STRING",)
    FUNCTION = "inference"
    CATEGORY = "Zhi.AI/Qwen3VL"

    def _resolution_to_pixels(self, resolution):
        return resolution * resolution

    def _remove_think_content(self, text):

        if not isinstance(text, str):
            return text
            
        if think_end_pos != -1:
            return text[think_end_pos + len('</think>'):].strip()      
        return text

    def inference(
        self,
        model,
        system_prompt,
        user_prompt,
        keep_model_loaded,
        temperature,
        max_new_tokens,
        min_resolution,
        max_resolution,
        seed,
        quantization,
        device,
        image=None,
        source_path=None,
        attention="eager",
        batch_mode=False,
        batch_directory="",
        remove_think_tags=False,
    ):

        if source_path is not None and image is not None:
            error_message = (
                "检测到输入端口冲突：source_path 和 image 不能同时连接。\n\n"
                "解决方式(A或B)：\n"
                "A. 断开 source_path 端口的连接，使用 image 端口输入图像\n"
                "B. 断开 image 端口的连接，使用 source_path 端口输入图像路径\n\n"
                "注意：这两个输入端口是互斥的，只能选择其中一个作为图像输入源。"
            )
            raise ValueError(error_message)
        
        if batch_mode:
            conflicts = []
            if source_path is not None:
                conflicts.append("source_path")
            if image is not None:
                conflicts.append("image")
            
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
            
            min_pixels = self._resolution_to_pixels(min_resolution)
            max_pixels = self._resolution_to_pixels(max_resolution)
            
            return self.batch_inference(
                user_prompt, batch_directory, model, quantization, keep_model_loaded,
                temperature, max_new_tokens, min_pixels, max_pixels,
                seed, attention, device, system_prompt, remove_think_tags
            )
        
        if seed != -1:
            torch.manual_seed(seed)
        
        model_exists, model_path, error_message = self.check_model_exists(model)
        if not model_exists:
            raise ValueError(error_message)
        
        self.model_checkpoint = model_path

        if min_resolution > max_resolution:
            raise ValueError(f"最小分辨率 ({min_resolution}) 不能大于最大分辨率 ({max_resolution})")
        
        min_pixels = self._resolution_to_pixels(min_resolution)
        max_pixels = self._resolution_to_pixels(max_resolution)

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

        with torch.no_grad():
            import gc
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                
            if source_path:
                messages = [
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": source_path
                        + [
                            {"type": "text", "text": user_prompt},
                        ],
                    },
                ]             
            elif image is not None:
                to_pil = ToPILImage()
                pil_image = to_pil(image[0].permute(2, 0, 1))
                
                messages = [
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "image", "image": pil_image},
                            {"type": "text", "text": user_prompt},
                        ],
                    },
                ]
            else:
                messages = [
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": user_prompt},
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
            
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                
            input_ids = inputs.input_ids.clone()
                
            generated_ids = self.model.generate(
                **inputs, 
                max_new_tokens=max_new_tokens, 
                temperature=temperature, 
                do_sample=temperature > 0,
                pad_token_id=self.processor.tokenizer.eos_token_id,
            )
            
            del inputs
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                
            generated_ids_trimmed = [
                out_ids[len(in_ids) :] for in_ids, out_ids in zip(input_ids, generated_ids)
            ]
            
            result = self.processor.batch_decode(
                generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False
            )
            
            del generated_ids, generated_ids_trimmed, input_ids
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

        if not keep_model_loaded:
            del self.model
            self.model = None
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

        final_result = result[0]
        if remove_think_tags:
            final_result = self._remove_think_content(final_result)

        return (final_result,)

    def get_image_files(self, batch_directory):
        image_extensions = ('.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp', '.gif')
        image_files = []
        
        for root, dirs, files in os.walk(batch_directory):
            for file in files:
                if file.lower().endswith(image_extensions):
                    image_files.append(os.path.join(root, file))
        
        return sorted(image_files)

    def save_description(self, image_file, description):
        txt_file = os.path.splitext(image_file)[0] + ".txt"
        with open(txt_file, 'w', encoding='utf-8') as f:
            f.write(description)

    def batch_inference(
        self,
        user_prompt,
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
        device,
        system_prompt,
        remove_think_tags=False,
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
                device_map = {"":"cpu"}
            elif device == "gpu":
                device_map = {"":0}
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
        
        for image_file in image_files:
            try:
                if system_prompt:
                    messages = [
                        {
                            "role": "system",
                            "content": [{"type": "text", "text": system_prompt}],
                        },
                        {
                            "role": "user",
                            "content": [
                                {"type": "image", "image": image_file},
                                {"type": "text", "text": user_prompt},
                            ],
                        },
                    ]
                else:
                    messages = [
                        {
                            "role": "user",
                            "content": [
                                {"type": "image", "image": image_file},
                                {"type": "text", "text": user_prompt},
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
                
                input_ids = inputs.input_ids.clone()
                
                import gc
                gc.collect()
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                
                generated_ids = self.model.generate(
                    **inputs, 
                    max_new_tokens=max_new_tokens, 
                    temperature=temperature, 
                    do_sample=temperature > 0,
                    pad_token_id=self.processor.tokenizer.eos_token_id,
                )
                
                del inputs
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                
                generated_ids_trimmed = [
                    out_ids[len(in_ids) :]
                    for in_ids, out_ids in zip(input_ids, generated_ids)
                ]
                result = self.processor.batch_decode(
                    generated_ids_trimmed,
                    skip_special_tokens=True,
                    clean_up_tokenization_spaces=False,
                )
                
                del generated_ids, generated_ids_trimmed, input_ids
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                
                description = result[0] if result else "No description generated"
                
                if remove_think_tags:
                    description = self._remove_think_content(description)
                
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
            import gc
            gc.collect()

        log_message = f"Batch processing completed. Processed: {processed_count} images, Failed: {failed_count} images in directory '{batch_directory}'."
        
        return (log_message,)