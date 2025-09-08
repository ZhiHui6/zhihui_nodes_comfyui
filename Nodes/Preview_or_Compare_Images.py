try:
    from nodes import PreviewImage
except ImportError:
    import torch
    import numpy as np
    from PIL import Image
    import folder_paths
    import os
    import json
    from pathlib import Path
    
    class PreviewImage:
        
        def __init__(self):
            self.output_dir = folder_paths.get_output_directory() if hasattr(folder_paths, 'get_output_directory') else "output"
            self.type = "output"
            self.prefix_append = ""
            self.compress_level = 4
        
        def save_images(self, images, filename_prefix="ComfyUI", prompt=None, extra_pnginfo=None):
            filename_prefix += self.prefix_append
            full_output_folder, filename, counter, subfolder, filename_prefix = folder_paths.get_save_image_path(
                filename_prefix, self.output_dir, images[0].shape[1], images[0].shape[0]
            )
            results = list()
            for (batch_number, image) in enumerate(images):
                i = 255. * image.cpu().numpy()
                img = Image.fromarray(np.clip(i, 0, 255).astype(np.uint8))
                metadata = None
                if not args.disable_metadata:
                    metadata = PngInfo()
                    if prompt is not None:
                        metadata.add_text("prompt", json.dumps(prompt))
                    if extra_pnginfo is not None:
                        for x in extra_pnginfo:
                            metadata.add_text(x, json.dumps(extra_pnginfo[x]))

                filename_with_batch_num = filename.replace("%batch_num%", str(batch_number))
                file = f"{filename_with_batch_num}_{counter:05}_.png"
                img.save(os.path.join(full_output_folder, file), pnginfo=metadata, compress_level=self.compress_level)
                results.append({
                    "filename": file,
                    "subfolder": subfolder,
                    "type": self.type
                })
                counter += 1

            return { "ui": { "images": results } }

class PreviewOrCompareImages(PreviewImage):

    NAME = "Preview or Compare Images"
    CATEGORY = "zhihu/images"
    FUNCTION = "compare_images"
    DESCRIPTION = "Preview a single image or compare two images side by side. Supports displaying one or two images with optional comparison functionality."
    OUTPUT_NODE = True
    RETURN_TYPES = ()

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image_1": ("IMAGE",), 
            },
            "optional": {
                "image_2": ("IMAGE",),  
            },
            "hidden": {
                "prompt": "PROMPT",
                "extra_pnginfo": "EXTRA_PNGINFO"
            },
        }

    def compare_images(self,
                      image_1=None, 
                      image_2=None,  
                      filename_prefix="preview_compare_images.",
                      prompt=None,
                      extra_pnginfo=None):
        result = {"ui": {"image_1": [], "image_2": []}}
        
        if image_1 is not None and len(image_1) > 0:
            result["ui"]["image_1"] = self.save_images(image_1, filename_prefix, prompt, extra_pnginfo)["ui"]["images"]
        if image_2 is not None and len(image_2) > 0:
            result["ui"]["image_2"] = self.save_images(image_2, filename_prefix, prompt, extra_pnginfo)["ui"]["images"]

        return result