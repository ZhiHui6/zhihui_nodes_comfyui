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
                    "default": "Describe this image in detail.", 
                    "multiline": True,
                    "tooltip": "用户自定义的提示词，用于指导模型生成特定内容"
                }),
                "system_prompt": ("STRING", {
                    "default": "", 
                    "multiline": True,
                    "tooltip": "系统级提示词，用于设定模型的行为模式和角色定位"
                }),
                "filter_thinking_process": ("BOOLEAN", {
                    "default": False,
                    "tooltip": "过滤思考过程内容，启用后将移除Thinking模型的推理过程，提供更简洁的输出"
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
                        "tooltip": "选择Qwen3-VL模型版本，包含4B/8B参数量和Instruct/Thinking两种类型"
                    },
                ),
                "quantization": (
                    ["none", "4bit", "8bit"],
                    {
                        "default": "8bit",
                        "tooltip": "模型量化设置，降低显存占用。8bit平衡性能与资源，4bit更节省显存但可能影响质量"
                    },
                ),
                "temperature": (
                    "FLOAT",
                    {
                        "default": 0.7, 
                        "min": 0, 
                        "max": 1, 
                        "step": 0.1,
                        "tooltip": "控制生成文本的随机性，值越高越有创意，值越低越保守稳定"
                    },
                ),
                "max_new_tokens": (
                    "INT",
                    {
                        "default": 2048, 
                        "min": 128, 
                        "max": 8192, 
                        "step": 1,
                        "tooltip": "生成文本的最大长度，值越大可生成越长的内容但消耗更多资源"
                    },
                ),
                "min_resolution": (
                    "INT",
                    {
                        "default": 448, 
                        "min": 224, 
                        "max": 1344, 
                        "step": 224,
                        "tooltip": "图像处理的最小分辨率，影响处理速度和细节保留"
                    },
                ),
                "max_resolution": (
                    "INT", 
                    {
                        "default": 1344, 
                        "min": 448, 
                        "max": 1344, 
                        "step": 224,
                        "tooltip": "图像处理的最大分辨率，影响处理质量和资源消耗"
                    },
                ),
                "seed": ("INT", {
                    "default": 42,
                    "tooltip": "随机种子，控制生成结果的随机性。相同种子产生相同结果，-1为随机种子"
                }),
                "attention": (
                    [
                        "eager",
                        "sdpa",
                        "flash_attention_2",
                    ],
                    {
                        "default": "sdpa",
                        "tooltip": "注意力机制实现方式，影响性能和兼容性。sdpa为推荐选项"
                    },
                ),
                "device": (
                    ["auto", "gpu", "cpu"],
                    {
                        "default": "auto",
                        "tooltip": "计算设备选择。auto自动选择最佳设备，cuda使用GPU，cpu使用CPU"
                    },
                ),
                "keep_model_loaded": ("BOOLEAN", {
                    "default": True,
                    "tooltip": "保持模型在内存中加载，提高后续处理速度但占用更多内存"
                }),
                "batch_mode": ("BOOLEAN", {
                    "default": False,
                    "tooltip": "批处理模式，启用后可处理指定目录下的多个图像文件"
                }),
                "batch_directory": ("STRING", {
                    "default": "",
                    "tooltip": "批处理目录路径，指定包含待处理图像的文件夹路径"
                }),
            },
            "optional": {
                "source_path": ("PATH", {
                    "tooltip": "源路径：指定要处理的图像或视频文件的路径。可以是本地文件路径或网络URL。当同时提供source_path和image时，优先使用source_path。支持常见的图像和视频格式。"
                }), 
                "image": ("IMAGE", {
                    "tooltip": "图像输入：直接输入图像数据进行处理。通常来自其他ComfyUI节点的图像输出。当同时提供source_path和image时，source_path优先级更高。"
                }),
            },
        }

    RETURN_TYPES = ("STRING",)
    FUNCTION = "inference"
    CATEGORY = "Comfyui_Qwen3VL"

    def _resolution_to_pixels(self, resolution):
        return resolution * resolution

    def inference(
        self,
        model,
        system_prompt,
        user_prompt,
        filter_thinking_process,
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
                seed, attention, device, system_prompt
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
            
            # 应用思考过程过滤
            if filter_thinking_process and result:
                result[0] = self._filter_thinking_process(result[0], model)
            
            del generated_ids, generated_ids_trimmed, input_ids
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

        if not keep_model_loaded:
            del self.model
            self.model = None
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

        return (result[0],)

    def _filter_thinking_process(self, text, model_name):
        """
        过滤思考型模型的思考过程内容，只保留最终输出
        """
        # 检查是否为思考型模型
        if "Thinking" not in model_name:
            return text
        
        # 常见的思考过程标记模式
        thinking_patterns = [
            r'<thinking>.*?</thinking>',  # <thinking>...</thinking>
            r'<think>.*?</think>',        # <think>...</think>
            r'思考过程：.*?(?=\n\n|\n[^思]|$)',  # 中文思考过程标记
            r'思考：.*?(?=\n\n|\n[^思]|$)',     # 简化中文思考标记
            r'Let me think.*?(?=\n\n|\n[A-Z]|$)',  # 英文思考过程
            r'I need to think.*?(?=\n\n|\n[A-Z]|$)',  # 英文思考过程
            r'\*thinking\*.*?\*end thinking\*',  # *thinking*...*end thinking*
            r'【思考】.*?【/思考】',              # 【思考】...【/思考】
        ]
        
        filtered_text = text
        
        # 应用所有过滤模式
        for pattern in thinking_patterns:
            filtered_text = re.sub(pattern, '', filtered_text, flags=re.DOTALL | re.IGNORECASE)
        
        # 清理多余的空行和空白字符
        filtered_text = re.sub(r'\n\s*\n\s*\n', '\n\n', filtered_text)  # 多个空行合并为两个
        filtered_text = filtered_text.strip()
        
        # 如果过滤后内容为空或过短，返回原文本
        if len(filtered_text.strip()) < 10:
            return text
            
        return filtered_text

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
    ):
        if not batch_directory or not os.path.exists(batch_directory):
            raise ValueError(f"批量目录不存在或为空: {batch_directory}")
        
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

        image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
        image_files = []
        
        for file in os.listdir(batch_directory):
            if Path(file).suffix.lower() in image_extensions:
                image_files.append(os.path.join(batch_directory, file))
        
        if not image_files:
            raise ValueError(f"在目录 {batch_directory} 中未找到支持的图像文件")
        
        results = []
        
        for image_path in image_files:
            try:
                with torch.no_grad():
                    import gc
                    gc.collect()
                    if torch.cuda.is_available():
                        torch.cuda.empty_cache()
                    
                    messages = [
                        {
                            "role": "system",
                            "content": system_prompt,
                        },
                        {
                            "role": "user",
                            "content": [
                                {"type": "image", "image": image_path},
                                {"type": "text", "text": user_prompt},
                            ],
                        },
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
                    
                    description = self.processor.batch_decode(
                        generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False
                    )[0]
                    
                    del generated_ids, generated_ids_trimmed, input_ids
                    if torch.cuda.is_available():
                        torch.cuda.empty_cache()
                    
                    results.append(f"文件: {os.path.basename(image_path)}\n描述: {description}\n")
                    
            except Exception as e:
                results.append(f"文件: {os.path.basename(image_path)}\n错误: {str(e)}\n")
        
        if not keep_model_loaded:
            del self.model
            self.model = None
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        
        return ("\n".join(results),)