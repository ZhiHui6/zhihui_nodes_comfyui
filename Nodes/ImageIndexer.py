import hashlib
import io
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image

import folder_paths

PREVIEW_LIMIT = 32
TILE_EDGE = 256
ZOOM_EDGE = 1024
ZOOM_QUALITY = 85
TILE_QUALITY = 82
SUBROOT = "zhiai/image_indexer"


def _unwrap(value):
    if isinstance(value, (list, tuple)) and value:
        return value[0]
    return value


def _node_dir(raw_node_id):
    safe = "".join(ch for ch in str(raw_node_id or "0") if ch.isalnum() or ch in "_-.")
    safe = safe.lstrip(".") or "0"
    base = Path(folder_paths.get_temp_directory()).resolve()
    target = (base / SUBROOT / safe).resolve()
    try:
        target.relative_to(base)
    except ValueError:
        target = (base / SUBROOT / "0").resolve()
    target.mkdir(parents=True, exist_ok=True)
    return target


def _flatten_units(value):
    """与图像理解节点 collect_image_tensors 同语义，保证序号 = 下游展开后送进模型的顺序。"""
    units = []

    def walk(item):
        if item is None:
            return
        if isinstance(item, (list, tuple)):
            for sub in item:
                walk(sub)
            return
        if not (hasattr(item, "shape") and hasattr(item, "ndim")):
            return
        if item.ndim == 4:
            for index in range(item.shape[0]):
                units.append(item[index:index + 1])
        elif item.ndim == 3:
            units.append(item.unsqueeze(0))
        else:
            units.append(item)

    walk(value)
    return units


def _render_unit(unit):
    """[H,W,C] 张量 → (uint8 RGB, 原宽, 原高)。先降采样再转 numpy，避免整批原图进内存。"""
    try:
        data = unit.detach().cpu().float()
    except Exception:
        return None
    if getattr(data, "ndim", 0) == 4:
        data = data[0]
    if getattr(data, "ndim", 0) != 3 or data.numel() == 0:
        return None
    channels = int(data.shape[2])
    if channels == 1:
        data = data.repeat(1, 1, 3)
    elif channels >= 3:
        data = data[:, :, :3]
    else:
        return None
    data = torch.nan_to_num(data, nan=0.0, posinf=0.0, neginf=0.0)
    scale = 255.0 if float(data.max()) <= 1.0 else 1.0
    height, width = int(data.shape[0]), int(data.shape[1])
    view = data.permute(2, 0, 1).unsqueeze(0)
    long_edge = max(height, width)
    if long_edge > ZOOM_EDGE:
        ratio = ZOOM_EDGE / float(long_edge)
        view = F.interpolate(
            view,
            size=(max(1, int(round(height * ratio))), max(1, int(round(width * ratio)))),
            mode="area",
        )
    arr = view.squeeze(0).permute(1, 2, 0).numpy()
    arr = np.clip(arr * scale, 0.0, 255.0).astype(np.uint8)
    return arr, width, height


def _encode(image, quality):
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=quality, optimize=True)
    return buffer.getvalue()


def _write_once(directory, name, payload):
    path = directory / name
    if path.is_file():
        return
    path.write_bytes(payload)


def _prune(directory, keep):
    """缩略图按内容寻址，重跑通常零删除；只清理本次不再引用的旧帧，临时目录不再无限增长。"""
    try:
        entries = list(directory.iterdir())
    except OSError:
        return
    for entry in entries:
        if entry.is_file() and entry.name in keep:
            continue
        try:
            entry.unlink()
        except OSError:
            pass


class ImageIndexer:
    CATEGORY = "Zhi.AI/Image"
    FUNCTION = "index"
    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("images",)
    OUTPUT_NODE = True
    INPUT_IS_LIST = True
    OUTPUT_IS_LIST = (True,)
    DESCRIPTION = "Numbers upstream images as 图1..图N and previews them as labelled thumbnails on the node, passing the images through unchanged. With the Multimedia Loader upstream the grid follows its current selection without running the graph."

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "images": ("IMAGE", {
                    "tooltip": "上游图像。多媒体加载器的「仅图片」输出、单张图像或批量张量均可；节点按下游展开后的顺序编号，图像本身原样透传、像素不做改动。"
                }),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
            },
        }

    def index(self, images=None, unique_id=None):
        units = _flatten_units(images)
        node_dir = _node_dir(_unwrap(unique_id))
        subfolder = f"{SUBROOT}/{node_dir.name}"

        tiles = []
        keep = set()
        for position, unit in enumerate(units[:PREVIEW_LIMIT], start=1):
            tile = {"index": position, "thumb": "", "zoom": "", "subfolder": "", "width": 0, "height": 0}
            rendered = _render_unit(unit)
            if rendered is not None:
                arr, width, height = rendered
                source = Image.fromarray(arr, mode="RGB")
                zoom_bytes = _encode(source, ZOOM_QUALITY)
                digest = hashlib.sha1(zoom_bytes).hexdigest()[:16]
                zoom_name = f"{digest}_z.jpg"
                thumb_name = f"{digest}_t.jpg"
                thumb_image = source.copy()
                thumb_image.thumbnail((TILE_EDGE, TILE_EDGE), Image.LANCZOS)
                _write_once(node_dir, zoom_name, zoom_bytes)
                _write_once(node_dir, thumb_name, _encode(thumb_image, TILE_QUALITY))
                keep.update((zoom_name, thumb_name))
                tile.update({
                    "thumb": thumb_name,
                    "zoom": zoom_name,
                    "subfolder": subfolder,
                    "width": width,
                    "height": height,
                })
            tiles.append(tile)

        _prune(node_dir, keep)

        payload = list(images) if isinstance(images, (list, tuple)) else ([] if images is None else [images])
        return {
            "result": (payload,),
            "ui": {
                "zin_tiles": tiles,
                "zin_total": [len(units)],
                "zin_limited": [len(units) > PREVIEW_LIMIT],
            },
        }
