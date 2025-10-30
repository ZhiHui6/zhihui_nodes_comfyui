import torch
import numpy as np
from PIL import Image
import io
import base64
import os
import glob

class ImageFormatConverter:
    
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "output_format": (["JPEG", "PNG", "WEBP", "BMP", "TIFF"], {"default": "JPEG"}),
                "quality": ("INT", {"default": 95, "min": 1, "max": 100, "step": 1}),
                "folder_path": ("STRING", {"default": "", "multiline": False}),
            },
            "optional": {
                "optimize": ("BOOLEAN", {"default": True}),
                "progressive": ("BOOLEAN", {"default": False}),
                "lossless": ("BOOLEAN", {"default": False}),
            }
        }

    RETURN_TYPES = ("IMAGE", "STRING")
    RETURN_NAMES = ("converted_image", "conversion_info")
    FUNCTION = "convert_format"
    CATEGORY = "Zhi.AI/Image"
    DESCRIPTION = "Image Format Converter: Converts images between different formats (JPEG, PNG, WEBP, BMP, TIFF) with customizable quality settings. Supports batch folder processing with content-based format detection. Features optimization, progressive encoding, and lossless compression options. Perfect for format standardization, file size optimization, and batch conversion tasks."

    def convert_format(self, output_format, quality, folder_path, optimize=True, progressive=False, lossless=False):
        
        return self._process_batch_folder(folder_path, output_format, quality, optimize, progressive, lossless)
    
    def _get_all_image_files(self, folder_path):
        if not folder_path or not os.path.exists(folder_path):
            return []
        
        supported_extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff', '*.tif', '*.webp', '*.jfif']
        image_files = []
        
        for ext in supported_extensions:
            image_files.extend(glob.glob(os.path.join(folder_path, ext)))
            image_files.extend(glob.glob(os.path.join(folder_path, ext.upper())))
        
        all_files = glob.glob(os.path.join(folder_path, "*"))
        for file_path in all_files:
            if os.path.isfile(file_path) and file_path not in image_files:
                try:
                    with Image.open(file_path) as img:
                        if img.format:
                            image_files.append(file_path)
                except:
                    pass
        
        return list(set(image_files))
    
    def _process_batch_folder(self, folder_path, output_format, quality, optimize, progressive, lossless):
        if not folder_path or not os.path.exists(folder_path):
            empty_tensor = torch.zeros((1, 64, 64, 3), dtype=torch.float32)
            return (empty_tensor, "Invalid folder path provided")
        
        image_files = self._get_all_image_files(folder_path)
        
        if not image_files:
            empty_tensor = torch.zeros((1, 64, 64, 3), dtype=torch.float32)
            return (empty_tensor, f"No supported image files found in {folder_path}")
        
        output_folder = os.path.join(folder_path, f"converted_{output_format.lower()}")
        if not os.path.exists(output_folder):
            os.makedirs(output_folder, exist_ok=True)
        
        converted_images = []
        format_info_list = []
        processed_count = 0
        
        for file_path in image_files:
            try:
                pil_image = Image.open(file_path)
                
                original_format = pil_image.format or "UNKNOWN"
                
                converted_image, format_info = self._convert_single_pil_image(pil_image, output_format, quality, optimize, progressive, lossless)
                
                filename = os.path.splitext(os.path.basename(file_path))[0]
                output_path = os.path.join(output_folder, f"{filename}.{output_format.lower()}")
                
                save_kwargs = self._get_save_kwargs(output_format, quality, optimize, progressive, lossless)
                converted_image.save(output_path, format=output_format, **save_kwargs)
                
                enhanced_format_info = f"原格式: {original_format} → {format_info}"
                
                if len(converted_images) < 10:
                    img_array = np.array(converted_image)
                    if len(img_array.shape) == 2:
                        img_array = np.stack([img_array] * 3, axis=-1)
                    elif img_array.shape[2] == 4:
                        img_array = img_array[:, :, :3]
                    
                    if img_array.shape[:2] != (512, 512):
                        pil_temp = Image.fromarray(img_array.astype(np.uint8))
                        pil_temp = pil_temp.resize((512, 512), Image.Resampling.LANCZOS)
                        img_array = np.array(pil_temp)
                    
                    img_tensor = torch.from_numpy(img_array.astype(np.float32) / 255.0)
                    converted_images.append(img_tensor)
                
                format_info_list.append(f"{os.path.basename(file_path)}: {enhanced_format_info}")
                processed_count += 1
                
            except Exception as e:
                error_info = f"文件 {os.path.basename(file_path)}: 处理失败 - {str(e)}"
                format_info_list.append(error_info)
                continue
        
        if converted_images:
            converted_tensor = torch.stack(converted_images, dim=0)
        else:
            converted_tensor = torch.zeros((1, 64, 64, 3), dtype=torch.float32)
        
        combined_format_info = f"=== 批量转换完成 ===\n"
        combined_format_info += f"源文件夹: {folder_path}\n"
        combined_format_info += f"输出文件夹: {output_folder}\n"
        combined_format_info += f"处理数量: {processed_count} 个文件\n"
        combined_format_info += f"输出格式: {output_format}\n\n"
        combined_format_info += "=== 转换详情 ===\n"
        combined_format_info += "\n".join(format_info_list[:20])
        if len(format_info_list) > 20:
            combined_format_info += f"\n\n=== 更多文件 ===\n"
            combined_format_info += f"还有 {len(format_info_list) - 20} 个文件已成功转换"
        
        return (converted_tensor, combined_format_info)
    
    def _convert_single_pil_image(self, pil_image, output_format, quality, optimize, progressive, lossless):
        try:
            if pil_image.mode in ["RGBA", "LA"]:
                if output_format.upper() in ["JPEG", "BMP"]:
                    background = Image.new("RGB", pil_image.size, (255, 255, 255))
                    if pil_image.mode == "RGBA":
                        background.paste(pil_image, mask=pil_image.split()[-1])
                    else:
                        background.paste(pil_image, mask=pil_image.split()[-1])
                    pil_image = background
                elif output_format.upper() in ["PNG", "WEBP", "TIFF"]:
                    pass
                else:
                    pil_image = pil_image.convert("RGB")
            elif pil_image.mode in ["P", "L", "1"]:
                if output_format.upper() in ["PNG"] and pil_image.mode == "P":
                    pass
                else:
                    pil_image = pil_image.convert("RGB")
            elif pil_image.mode not in ["RGB", "RGBA"]:
                pil_image = pil_image.convert("RGB")
            
            save_kwargs = self._get_save_kwargs(output_format, quality, optimize, progressive, lossless)
            
            img_bytes = io.BytesIO()
            pil_image.save(img_bytes, format=output_format, **save_kwargs)
            img_bytes.seek(0)
            
            converted_pil = Image.open(img_bytes)
            
            if converted_pil.mode not in ["RGB", "RGBA"]:
                converted_pil = converted_pil.convert("RGB")
            
            file_size = len(img_bytes.getvalue())
            file_size_kb = file_size / 1024
            
            format_info = f"格式: {output_format} | 尺寸: {converted_pil.size} | 模式: {converted_pil.mode} | 文件大小: {file_size_kb:.1f}KB"
            if optimize:
                format_info += " | 已优化"
            if progressive and output_format == "JPEG":
                format_info += " | 渐进式"
            if lossless and output_format == "WEBP":
                format_info += " | 无损压缩"
            
            return converted_pil, format_info
            
        except Exception as e:
            if pil_image.mode not in ["RGB", "RGBA"]:
                pil_image = pil_image.convert("RGB")
            error_info = f"转换失败: {str(e)} | 返回原图像"
            return pil_image, error_info
    
    def _get_save_kwargs(self, output_format, quality, optimize, progressive, lossless):
        save_kwargs = {}
        
        if output_format == "JPEG":
            save_kwargs.update({
                "quality": quality,
                "optimize": optimize,
                "progressive": progressive
            })
        elif output_format == "PNG":
            save_kwargs.update({
                "optimize": optimize,
                "compress_level": max(1, min(9, int((100 - quality) / 11)))
            })
        elif output_format == "WEBP":
            if lossless:
                save_kwargs.update({
                    "lossless": True,
                    "quality": 100
                })
            else:
                save_kwargs.update({
                    "quality": quality,
                    "optimize": optimize
                })
        elif output_format == "TIFF":
            save_kwargs.update({
                "compression": "lzw" if optimize else None,
                "quality": quality if not lossless else 100
            })
        elif output_format == "BMP":
            pass
        
        return save_kwargs