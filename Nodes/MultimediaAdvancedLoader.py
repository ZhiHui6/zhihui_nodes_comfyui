from __future__ import annotations

import hashlib
import importlib
from io import BytesIO
import json
import os
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path
import sys
from typing import Any

import numpy as np
import torch
from PIL import Image, ImageOps

try:
    import folder_paths
except Exception:
    folder_paths = None

try:
    import nodes as comfy_nodes
except Exception:
    comfy_nodes = None

try:
    from comfy_api.latest import InputImpl
except Exception:
    InputImpl = None

try:
    from comfy_extras import nodes_audio
except Exception:
    nodes_audio = None

try:
    from aiohttp import web
    from server import PromptServer
except Exception:
    web = None
    PromptServer = None


MEDIA_BUNDLE_TYPE = "MINIMAX_H3_MEDIA_BUNDLE"
_MEDIA_KINDS = ("image", "audio", "video")
_API_PREFIX = "/zhiai/media_loader"
_THUMB_CACHE = {}
_THUMB_CACHE_LIMIT = 512


def _input_directory():
    if folder_paths is not None:
        try:
            return folder_paths.get_input_directory()
        except Exception:
            pass
    return os.getcwd()


def _base_directory(image_type):
    if folder_paths is not None:
        getters = {
            "input": "get_input_directory",
            "output": "get_output_directory",
            "temp": "get_temp_directory",
        }
        getter = getattr(folder_paths, getters.get(str(image_type or "input"), "get_input_directory"), None)
        if getter is not None:
            try:
                return Path(getter()).resolve()
            except Exception:
                pass
    return Path(_input_directory()).resolve()


def _parse_refs(value):
    if isinstance(value, list):
        refs = value
    else:
        text = str(value or "").strip()
        if not text:
            return []
        try:
            refs = json.loads(text)
        except json.JSONDecodeError as exc:
            raise ValueError("Multimedia Advanced Loader: media list is not valid JSON.") from exc
    if not isinstance(refs, list):
        raise ValueError("Multimedia Advanced Loader: media list must be a JSON array.")
    return refs


def _ref_to_path(ref):
    if isinstance(ref, str):
        text = ref.strip()
        path = Path(text).expanduser()
        if not path.is_absolute():
            path = _base_directory("input") / path
        return path.resolve()

    if not isinstance(ref, dict):
        raise ValueError("Multimedia Advanced Loader: each media reference must be a string or an object.")

    name = str(ref.get("name") or "").strip()
    if not name:
        raise ValueError("Multimedia Advanced Loader: media reference missing name.")
    subfolder = str(ref.get("subfolder") or "").strip().strip("/\\")
    image_type = str(ref.get("type") or "input").strip() or "input"
    base = _base_directory(image_type)
    path = base
    if subfolder:
        path = path / subfolder
    resolved = (path / name).resolve()
    try:
        resolved.relative_to(base)
    except ValueError as exc:
        raise ValueError("Multimedia Advanced Loader: media reference escapes its base directory.") from exc
    return resolved


def _kind_of(ref):
    if not isinstance(ref, Mapping):
        return "image"
    kind = str(ref.get("kind") or "").strip().lower()
    return kind if kind in _MEDIA_KINDS else "image"


def _input_relative(ref):
    if isinstance(ref, str):
        text = ref.strip().replace("\\", "/")
        if not text or os.path.isabs(text):
            return None
        parts = [part for part in text.split("/") if part and part != "."]
        if not parts or any(part == ".." for part in parts):
            return None
        return "/".join(parts)
    if not isinstance(ref, Mapping):
        return None
    ref_type = str(ref.get("type") or "input").strip() or "input"
    if ref_type != "input":
        return None
    name = str(ref.get("name") or "").strip()
    if not name:
        return None
    subfolder = str(ref.get("subfolder") or "").strip().strip("/\\")
    return f"{subfolder}/{name}" if subfolder else name


def _load_image_pil(path):
    with Image.open(path) as image:
        image = ImageOps.exif_transpose(image)
        if image.mode == "I":
            image = image.point(lambda value: value * (1 / 255))
        image = image.convert("RGB")
        arr = np.asarray(image).astype(np.float32) / 255.0
    return torch.from_numpy(arr)[None,]


def _load_image_tensor(ref, path):
    relative = _input_relative(ref)
    if comfy_nodes is not None and relative:
        return comfy_nodes.LoadImage().load_image(relative)[0]
    return _load_image_pil(path)


def _load_audio(path):
    if nodes_audio is None:
        raise ValueError("Multimedia Advanced Loader: audio support is unavailable in this ComfyUI build.")
    try:
        waveform, sample_rate = nodes_audio.load(path)
    except Exception as exc:
        raise ValueError(
            f"Multimedia Advanced Loader cannot read audio file {os.path.basename(path)!r}: {exc}"
        ) from exc
    if not isinstance(waveform, torch.Tensor) or waveform.ndim != 2 or waveform.shape[-1] < 1:
        raise ValueError(f"Multimedia Advanced Loader found no usable audio samples in {os.path.basename(path)!r}")
    return {
        "waveform": waveform.unsqueeze(0).to(device="cpu", dtype=torch.float32).contiguous(),
        "sample_rate": int(sample_rate),
    }


def _load_video(path):
    if InputImpl is None:
        raise ValueError("Multimedia Advanced Loader: video support is unavailable in this ComfyUI build.")
    video = InputImpl.VideoFromFile(path)
    try:
        video.get_dimensions()
    except Exception as exc:
        raise ValueError(
            f"Multimedia Advanced Loader cannot read video file {os.path.basename(path)!r}: {exc}"
        ) from exc
    return video


def _fingerprint(paths, salt):
    digest = hashlib.sha1()
    digest.update(str(salt or "").encode("utf-8", errors="ignore"))
    for path in paths:
        try:
            stat = path.stat()
            digest.update(str(path).encode("utf-8", errors="ignore"))
            digest.update(str(stat.st_size).encode())
            digest.update(str(stat.st_mtime_ns).encode())
        except OSError:
            digest.update(str(path).encode("utf-8", errors="ignore"))
    return digest.hexdigest()


@dataclass(frozen=True)
class _StandaloneMediaInput:
    input_index: int
    media_type: str
    value: Any


@dataclass(frozen=True)
class _StandaloneMediaBundle:
    items: tuple


_BUNDLE_CLASSES = None
_BUNDLE_WARNED = False


def _resolve_bundle_classes():
    global _BUNDLE_CLASSES, _BUNDLE_WARNED
    if _BUNDLE_CLASSES is not None:
        return _BUNDLE_CLASSES
    bundle_cls = None
    item_cls = None
    try:
        module = importlib.import_module("ComfyUI-MiniMaxH3-Easy.nodes")
        bundle_cls = getattr(module, "MiniMaxH3MediaBundle", None)
        item_cls = getattr(module, "_MediaInput", None)
    except Exception:
        bundle_cls = None
        item_cls = None
    if bundle_cls is None or item_cls is None:
        for module in list(sys.modules.values()):
            file_name = str(getattr(module, "__file__", "") or "").replace("\\", "/")
            if not file_name.endswith("ComfyUI-MiniMaxH3-Easy/nodes.py"):
                continue
            bundle_cls = getattr(module, "MiniMaxH3MediaBundle", None)
            item_cls = getattr(module, "_MediaInput", None)
            if bundle_cls is not None and item_cls is not None:
                break
    if bundle_cls is not None and item_cls is not None:
        _BUNDLE_CLASSES = (bundle_cls, item_cls)
        return _BUNDLE_CLASSES
    if not _BUNDLE_WARNED:
        _BUNDLE_WARNED = True
        print(
            "[MultimediaAdvancedLoader] ComfyUI-MiniMaxH3-Easy is not loaded; "
            "media_bundle will use a placeholder container."
        )
    return (_StandaloneMediaBundle, _StandaloneMediaInput)


class MultimediaAdvancedLoader:
    CATEGORY = "Zhi.AI/Loaders"
    FUNCTION = "load"
    RETURN_TYPES = (f"IMAGE,{MEDIA_BUNDLE_TYPE}",)
    RETURN_NAMES = ("media_bundle",)
    OUTPUT_IS_LIST = (False,)
    DESCRIPTION = "Manages images, videos and audio from the input folder as a thumbnail grid, outputting either a MiniMax H3 media bundle or an image-only port."

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "media_files": ("STRING", {"default": "[]", "multiline": False}),
                "output_files": ("STRING", {"default": "[]", "multiline": False}),
                "output_mode": ("STRING", {"default": "select", "multiline": False}),
                "load_mode": ("STRING", {"default": "media", "multiline": False}),
            },
        }

    @classmethod
    def IS_CHANGED(cls, media_files="[]", output_files="[]", output_mode="select", load_mode="media"):
        refs = _parse_refs(output_files)
        paths = [_ref_to_path(ref) for ref in refs]
        return _fingerprint(paths, f"{media_files}\n{output_files}\n{output_mode}\n{load_mode}")

    @classmethod
    def VALIDATE_INPUTS(cls, output_files="[]", **_kwargs):
        for ref in _parse_refs(output_files):
            path = _ref_to_path(ref)
            if not path.is_file():
                return f"Multimedia Advanced Loader: file not found: {path}"
        return True

    def load(self, media_files="[]", output_files="[]", output_mode="select", load_mode="media"):
        refs = _parse_refs(output_files)
        if str(load_mode or "media").strip().lower() == "image":
            self.OUTPUT_IS_LIST = (True,)
            images = []
            for ref in refs:
                if _kind_of(ref) != "image":
                    continue
                path = _ref_to_path(ref)
                if not path.is_file():
                    raise FileNotFoundError(f"Multimedia Advanced Loader: file not found: {path}")
                images.append(_load_image_tensor(ref, path))
            return (images,)

        self.OUTPUT_IS_LIST = (False,)
        bundle_cls, item_cls = _resolve_bundle_classes()
        items = []
        for ref in refs:
            kind = _kind_of(ref)
            path = _ref_to_path(ref)
            if not path.is_file():
                raise FileNotFoundError(f"Multimedia Advanced Loader: file not found: {path}")
            if kind == "image":
                value = _load_image_tensor(ref, path)
            elif kind == "audio":
                value = _load_audio(str(path))
            else:
                value = _load_video(str(path))
            items.append(item_cls(len(items) + 1, kind, value))
        return (bundle_cls(tuple(items)),)


def _normalize_to_uint8(image):
    arr = np.asarray(image)
    if arr.dtype == np.uint8:
        return image
    arr = arr.astype(np.float32)
    finite = np.isfinite(arr)
    if not finite.any():
        arr = np.zeros_like(arr, dtype=np.uint8)
    else:
        lo = float(arr[finite].min())
        hi = float(arr[finite].max())
        if hi > lo:
            arr = (arr - lo) * (255.0 / (hi - lo))
        else:
            arr = np.zeros_like(arr)
        arr = np.clip(arr, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def _prepare_thumbnail_image(image):
    image = ImageOps.exif_transpose(image)
    if image.mode in ("I", "I;16", "I;16B", "I;16L", "F"):
        image = _normalize_to_uint8(image)
    if image.mode in ("RGBA", "LA") or ("transparency" in image.info):
        rgba = image.convert("RGBA")
        background = Image.new("RGBA", rgba.size, (5, 11, 22, 255))
        background.alpha_composite(rgba)
        return background.convert("RGB")
    return image.convert("RGB")


def _thumbnail_resample():
    try:
        return Image.Resampling.LANCZOS
    except AttributeError:
        return Image.LANCZOS


def _cache_put(key, value):
    _THUMB_CACHE[key] = value
    if len(_THUMB_CACHE) > _THUMB_CACHE_LIMIT:
        for old_key in list(_THUMB_CACHE.keys())[: len(_THUMB_CACHE) - _THUMB_CACHE_LIMIT]:
            _THUMB_CACHE.pop(old_key, None)


if PromptServer is not None and web is not None:
    @PromptServer.instance.routes.get(f"{_API_PREFIX}/thumbnail")
    async def multimedia_advanced_loader_thumbnail(request):
        try:
            size = int(float(request.rel_url.query.get("size", 96)))
        except Exception:
            size = 96
        size = max(48, min(1024, size))
        ref = {
            "name": request.rel_url.query.get("name", ""),
            "subfolder": request.rel_url.query.get("subfolder", ""),
            "type": request.rel_url.query.get("type", "input"),
        }
        try:
            path = _ref_to_path(ref)
            if not path.is_file():
                return web.Response(status=404)
            stat = path.stat()
            cache_key = (str(path), stat.st_size, stat.st_mtime_ns, size)
            cached = _THUMB_CACHE.get(cache_key)
            if cached is not None:
                return web.Response(body=cached, content_type="image/png")
            with Image.open(path) as image:
                image = _prepare_thumbnail_image(image)
                image = ImageOps.fit(
                    image,
                    (size, size),
                    method=_thumbnail_resample(),
                    centering=(0.5, 0.5),
                )
                buffer = BytesIO()
                image.save(buffer, format="PNG", optimize=True)
                buffer.seek(0)
                payload = buffer.read()
                _cache_put(cache_key, payload)
            return web.Response(body=payload, content_type="image/png")
        except Exception as exc:
            return web.json_response({"error": str(exc)}, status=400)


NODE_CLASS_MAPPINGS = {
    "MultimediaAdvancedLoader": MultimediaAdvancedLoader,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "MultimediaAdvancedLoader": "Multimedia Loader",
}
