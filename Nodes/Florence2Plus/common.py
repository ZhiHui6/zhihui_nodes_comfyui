import torch
import hashlib
import numpy as np
from PIL import Image

def zhiai_log(message):
    print(f"[Florence2Plus] {message}")

def hash_seed(seed):
    seed_bytes = str(seed).encode('utf-8')
    hash_object = hashlib.sha256(seed_bytes)
    hashed_seed = int(hash_object.hexdigest(), 16)
    return hashed_seed % (2 ** 32)

def image_to_pil_image(image):
    if len(image.shape) == 4:
        image = image[0]

    if isinstance(image, torch.Tensor):
        image = torch.clamp(image, 0, 1)
        image = (image * 255).byte().cpu().numpy()
    elif isinstance(image, np.ndarray):
        image = np.clip(image, 0, 1)
        image = (image * 255).astype(np.uint8)
    else:
        raise TypeError(f"Unsupported input type {type(image)}. Expected torch.Tensor or numpy.ndarray.")

    if len(image.shape) == 3:
        if image.shape[0] in [3, 4]:
            image = np.transpose(image, (1, 2, 0))
        elif image.shape[2] not in [3, 4]:
            raise ValueError(f"Unsupported channel size: {image.shape[2]}. Must be 3 (RGB) or 4 (RGBA).")

    mode = {3: 'RGB', 4: 'RGBA'}.get(image.shape[2])
    if mode is None:
        raise ValueError(f"Unsupported channel size: {image.shape[2]}. Must be 3 (RGB) or 4 (RGBA).")
    pil_image = Image.fromarray(image, mode=mode).convert('RGB')

    return pil_image