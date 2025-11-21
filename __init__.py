from .Nodes.PromptPreset.PromptPresetOneChoice import PromptPresetOneChoice
from .Nodes.PromptPreset.PromptPresetMultipleChoice import PromptPresetMultipleChoice
from .Nodes.KontextPresets.KontextPresetsBasic import LoadKontextPresetsBasic
from .Nodes.KontextPresets.KontextPresetsPlus.KontextPresetsPlus import KontextPresetsPlus
from .Nodes.SystemPrompt.SystemPromptLoader import SystemPromptLoader
from .Nodes.TextExpander import TextExpander
from .Nodes.ExtraOptions import ExtraOptions
from .Nodes.MultiLineTextNode import MultiLineTextNode
from .Nodes.TextCombinerNode import TextCombinerNode
from .Nodes.TextModifier import TextModifier
from .Nodes.TextExtractor import TextExtractor
from .Nodes.TriggerWordMerger import TriggerWordMerger
from .Nodes.TextSwitchDualMode import TextSwitchDualMode
from .Nodes.ShowText import ShowText
from .Nodes.TranslateNodes.BaiduTranslate import BaiduTranslate
from .Nodes.TranslateNodes.FreeTranslate import FreeTranslate
from .Nodes.TranslateNodes.TencentTranslater import TencentTranslater
from .Nodes.PhotographPromptGen.PhotographPromptGenerator import PhotographPromptGenerator
from .Nodes.WanPromptGenerator import WanPromptGenerator
from .Nodes.ImageScaler import ImageScaler
from .Nodes.ImgSwitch.ImageSwitchDualMode import ImageSwitchDualMode
from .Nodes.ImgSwitch.PriorityImageSwitch import PriorityImageSwitch
from .Nodes.ColorRemoval import ColorRemoval
from .Nodes.MovieTools.LaplacianSharpen import LaplacianSharpen
from .Nodes.MovieTools.SobelSharpen import SobelSharpen
from .Nodes.MovieTools.USMSharpen import USMSharpen
from .Nodes.MovieTools.ColorMatchToReference import ColorMatchToReference
from .Nodes.MovieTools.FilmGrain import FilmGrain
from .Nodes.LatentSwitchDualMode import LatentSwitchDualMode
from .Nodes.LocalFileGallery.LocalFileGallery import LocalFileGallery
from .Nodes.ImageAspectRatio import ImageAspectRatio
from .Nodes.Preview_or_Compare_Images import PreviewOrCompareImages
from .Nodes.PauseWorkflow import PauseWorkflow
from .Nodes.TextEditorWithContinue import TextEditorWithContinue
from .Nodes.TagSelector.TagSelector import TagSelector
from .Nodes.SunoTools.SunoSongStylePromptGenerator import SunoSongStylePromptGenerator
from .Nodes.SunoTools.SunoLyricsGenerator import SunoLyricsGenerator
from .Nodes.Qwen3VL.Qwen3VLAdvanced import Qwen3VLAdvanced
from .Nodes.Qwen3VL.Qwen3VLBasic import Qwen3VLBasic
from .Nodes.Qwen3VL.Qwen3VLExtraOptions import Qwen3VLExtraOptions
from .Nodes.Qwen3VL.ImageLoader import ImageLoader
from .Nodes.Qwen3VL.VideoLoader import VideoLoader
from .Nodes.Qwen3VL.MultiplePathsInput import MultiplePathsInput
from .Nodes.Qwen3VL.PathSwitch import PathSwitch
from .Nodes.ImageRotateTool import ImageRotateTool
from .Nodes.ImageFormatConverter import ImageFormatConverter
from .Nodes.Qwen3VL.Qwen3VLAPI import Qwen3VLAPI
from .Nodes.Sa2VA.Sa2VAAdvanced import Sa2VAAdvanced
from .Nodes.Sa2VA.Sa2VASegmentationPreset import Sa2VASegmentationPreset

import os

NODE_CLASS_MAPPINGS = {
    "PromptPresetOneChoice": PromptPresetOneChoice,
    "PromptPresetMultipleChoice": PromptPresetMultipleChoice,
    "LoadKontextPresetsBasic": LoadKontextPresetsBasic,
    "KontextPresetsPlus": KontextPresetsPlus,
    "SystemPromptLoader": SystemPromptLoader,
    "TextExpander": TextExpander,
    "ExtraOptions": ExtraOptions,
    "MultiLineTextNode": MultiLineTextNode,
    "TextCombinerNode": TextCombinerNode,
    "TextModifier": TextModifier,
    "TextExtractor": TextExtractor,
    "TriggerWordMerger": TriggerWordMerger,
    "TextSwitchDualMode": TextSwitchDualMode,
    "ShowText": ShowText,
    "BaiduTranslate": BaiduTranslate,
    "FreeTranslate": FreeTranslate,
    "TencentTranslater": TencentTranslater,
    "PhotographPromptGenerator": PhotographPromptGenerator,
    "WanPromptGenerator": WanPromptGenerator,
    "ImageScaler": ImageScaler,
    "ImageSwitchDualMode": ImageSwitchDualMode,
    "PriorityImageSwitch": PriorityImageSwitch,
    "ColorRemoval": ColorRemoval,
    "LaplacianSharpen": LaplacianSharpen,
    "SobelSharpen": SobelSharpen,
    "USMSharpen": USMSharpen,
    "ColorMatchToReference": ColorMatchToReference,
    "FilmGrain": FilmGrain,
    "LatentSwitchDualMode": LatentSwitchDualMode,
    "PathSwitch": PathSwitch,
    "LocalFileGallery": LocalFileGallery,
    "ImageAspectRatio": ImageAspectRatio,
    "PreviewOrCompareImages": PreviewOrCompareImages,
    "PauseWorkflow": PauseWorkflow,
    "TextEditorWithContinue": TextEditorWithContinue,
    "TagSelector": TagSelector,
    "SunoSongStylePromptGenerator": SunoSongStylePromptGenerator,
    "SunoLyricsGenerator": SunoLyricsGenerator,
    "Qwen3VLAdvanced": Qwen3VLAdvanced,
    "Qwen3VLBasic": Qwen3VLBasic,
    "Qwen3VLExtraOptions": Qwen3VLExtraOptions,
    "ImageLoader": ImageLoader,
    "VideoLoader": VideoLoader,
    "MultiplePathsInput": MultiplePathsInput,
    "ImageRotateTool": ImageRotateTool,
    "ImageFormatConverter": ImageFormatConverter,
    "Qwen3VLAPI": Qwen3VLAPI,
    "Sa2VAAdvanced": Sa2VAAdvanced,
    "Sa2VASegmentationPreset": Sa2VASegmentationPreset,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptPresetOneChoice": "Prompt Preset One Choice",
    "PromptPresetMultipleChoice": "Prompt Preset Multiple Choice",
    "LoadKontextPresetsBasic": "Load Kontext Presets Basic",
    "KontextPresetsPlus": "Kontext Presets Plus",
    "SystemPromptLoader": "System Prompt Loader",
    "TextExpander": "Text Expander",
    "ExtraOptions": "Extra Options",
    "MultiLineTextNode": "Multi Line Text Node",
    "TextCombinerNode": "Text Combiner Node",
    "TextModifier": "Text Modifier",
    "TextExtractor": "Text Extractor",
    "TriggerWordMerger": "Trigger Word Merger",
    "TextSwitchDualMode": "Text Switch Dual Mode",
    "ShowText": "Show Text",
    "BaiduTranslate": "Baidu Translate",
    "FreeTranslate": "Free Translate",
    "TencentTranslater": "Tencent Translater",
    "PhotographPromptGenerator": "Photograph Prompt Generator",
    "WanPromptGenerator": "Wan Prompt Generator",
    "ImageScaler": "Image Scaler",
    "ImageSwitchDualMode": "Image Switch Dual Mode",
    "PriorityImageSwitch": "Priority Image Switch",
    "ColorRemoval": "Color Removal",
    "LaplacianSharpen": "Laplacian Sharpen",
    "SobelSharpen": "Sobel Sharpen",
    "USMSharpen": "USM Sharpen",
    "ColorMatchToReference": "Color Match To Reference",
    "FilmGrain": "Film Grain",
    "LatentSwitchDualMode": "Latent Switch Dual Mode",
    "LocalFileGallery": "Local File Gallery",
    "ImageAspectRatio": "Image Aspect Ratio",
    "PreviewOrCompareImages": "Preview or Compare Images",
    "PauseWorkflow": "Pause Workflow",
    "TextEditorWithContinue": "Text Editor with Continue",
    "TagSelector": "Tag Selector",
    "SunoSongStylePromptGenerator": "Suno Song Style Prompt Generator",
    "SunoLyricsGenerator": "Suno AI Lyrics Generator",
    "Qwen3VLAdvanced": "Qwen3-VL Advanced",
    "Qwen3VLBasic": "Qwen3-VL Basic",
    "Qwen3VLExtraOptions": "Qwen3-VL Extra Options",
    "ImageLoader": "Qwen3-VL Image Loader",
    "VideoLoader": "Qwen3-VL Video Loader",
    "MultiplePathsInput": "Qwen3-VL Multiple Paths Input",
    "PathSwitch": "Qwen3-VL Path Switch",
    "ImageRotateTool": "Image Rotate Tool",
    "ImageFormatConverter": "Image Format Converter",
    "Qwen3VLAPI": "Qwen3-VL API",
    "Sa2VAAdvanced": "Sa2VA Advanced",
    "Sa2VASegmentationPreset": "Sa2VA Segmentation Preset",
}

WEB_DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web")

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS', "WEB_DIRECTORY"]