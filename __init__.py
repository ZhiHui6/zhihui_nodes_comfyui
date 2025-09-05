import os

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
from .Nodes.ShowText.show_text import ShowText
from .Nodes.TranslateNodes.BaiduTranslate import BaiduTranslate
from .Nodes.TranslateNodes.FreeTranslate import FreeTranslate
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
    "LocalFileGallery": LocalFileGallery,
    "ImageAspectRatio": ImageAspectRatio,
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
}

WEB_DIRECTORY = os.path.dirname(os.path.abspath(__file__))

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS', "WEB_DIRECTORY"]
