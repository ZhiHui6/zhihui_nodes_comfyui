import torch

class ImageSwitchDualMode:
    
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "mode": (["manual", "auto"], {"default": "manual"}),
                "select_image": (["1", "2", "3", "4"], {"default": "1"}),
            },
            "optional": {
                "image1": ("IMAGE", {}),
                "image2": ("IMAGE", {}),
                "image3": ("IMAGE", {}),
                "image4": ("IMAGE", {}),
                "image1_note": ("STRING", {"multiline": False, "default": "", "placeholder": "Image 1 description"}),
                "image2_note": ("STRING", {"multiline": False, "default": "", "placeholder": "Image 2 description"}),
                "image3_note": ("STRING", {"multiline": False, "default": "", "placeholder": "Image 3 description"}),
                "image4_note": ("STRING", {"multiline": False, "default": "", "placeholder": "Image 4 description"}),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("output_image",)
    FUNCTION = "execute"
    CATEGORY = "zhihui/image"
    DESCRIPTION = "Image Switch: Select between multiple image inputs based on mode. In manual mode, select specific image by index. In auto mode, automatically output the only connected image. Suitable for conditional image selection and workflow branching control."

    def execute(self, mode, select_image, image1=None, image2=None, image3=None, image4=None,
                image1_note="", image2_note="", image3_note="", image4_note=""):
        
        images = [image1, image2, image3, image4]
        
        if mode == "manual":
            idx = int(select_image) - 1
            if idx < 0 or idx > 3:
                idx = 0
            
            if images[idx] is not None:
                return (images[idx],)
            else:
                for i, img in enumerate(images):
                    if img is not None:
                        return (img,)
                return (None,)
        
        else:
            connected_indices = [i+1 for i, img in enumerate(images) if img is not None]
            connected_count = len(connected_indices)
            
            if connected_count == 0:
                return (None,)
            elif connected_count >= 2:
                if connected_count == 2:
                    ports = f"image{connected_indices[0]} and image{connected_indices[1]}"
                elif connected_count == 3:
                    ports = f"image{connected_indices[0]}, image{connected_indices[1]}, image{connected_indices[2]}"
                else:
                    ports = f"image{connected_indices[0]}, image{connected_indices[1]}, image{connected_indices[2]}, image{connected_indices[3]}"
                
                raise ValueError(
                    f"Auto mode error: Detected {ports} with simultaneous inputs.\n"
                    f"Solutions:\n"
                    f"1. Disable other upstream node outputs, keep only one image input\n"
                    f"2. Switch to manual mode and select the image to output\n"
                )
            
            for i, img in enumerate(images):
                if img is not None:
                    return (img,)