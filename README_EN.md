# 🎨 zhihui-nodes-comfyui
[![GitHub](https://img.shields.io/badge/GitHub-zhihui--nodes--comfyui-blue?style=for-the-badge&logo=github)](https://github.com/ZhiHui6/zhihui_nodes_comfyui) [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE) [![ComfyUI](https://img.shields.io/badge/ComfyUI-Compatible-orange?style=for-the-badge)](https://github.com/comfyanonymous/ComfyUI)
---

## 📖 Project Introduction

This is a ComfyUI custom node collection carefully created by <span style="color: red;"> **Binity** </span>, designed to provide users with a series of practical and efficient nodes to enhance and extend ComfyUI's functionality. This node collection contains 25+ functional nodes, covering text processing, prompt optimization, image processing, translation tools, Latent processing and many other aspects, providing comprehensive support for your AI creation.

### ✨ Key Features

- 🔄 **Bilingual Translation Tools**: Equipped with Baidu Translate and free online translation nodes, supporting bidirectional Chinese-English conversion
- 📝 **Comprehensive Text Processing**: Provides 5 types of text operation nodes including multi-line text editing, text merging and separation, content extraction and modification, language filtering
- 🎯 **Intelligent Prompt System**: Professional prompt generation tools such as Kontext Presets Plus, Photography Prompt Generator, Wan Prompt Generator
- 🖼️ **Practical Image Tools**: Supports multi-algorithm image scaling, intelligent switching, color removal, etc.

> If this project helps you, please give us a ⭐**Star**! Your support is our motivation for continuous improvement.

## ⭐ Featured Nodes

🔥 **<span style="color: #FF6B35; font-weight: bold; font-size: 1.1em;">The following are the featured nodes highly recommended in this node collection:</span>**

<table>
<tr>
<th width="30%">Node Name</th>
<th width="15%">Category</th>
<th>Core Features</th>
</tr>

<tr>
<td><b>🎯 Kontext Presets Plus</b><br><code>KontextPresetsPlus</code></td>
<td>Prompt Processing</td>
<td>Kontext image editing preset tool with 20+ built-in creative presets, supports user-defined preset extensions, integrates multiple LLM models for free online intelligent expansion.</td>
</tr>

<tr>
<td><b>🎬 Wan Prompt Generator</b><br><code>WanPromptGenerator</code></td>
<td>Prompt Processing</td>
<td>Comprehensive prompt generator based on Wan 2.2 official documentation, supports both custom and preset combination methods, covering 17 professional dimensions including camera movement, scenes, lighting, composition for professional video prompt generation.</td>
</tr>

<tr>
<td><b>📸 Photography Prompt Generator</b><br><code>PhotographPromptGenerator</code></td>
<td>Prompt Processing</td>
<td>Professional photography style prompt generator covering 15 dimensions including characters, scenes, lenses, lighting, generating professional photography prompts with one click.</td>
</tr>

<tr>
<td><b>🤖 System Prompt Loader</b><br><code>SystemPromptLoader</code></td>
<td>Prompt Processing</td>
<td>Professional system prompt preset tool with built-in multiple category templates, outputting guidance content to downstream LLM nodes for generating professional prompts.</td>
</tr>

<tr>
<td><b>🔍 Extra Options</b><br><code>ExtraOptions</code></td>
<td>Prompt Processing</td>
<td>Universal image reverse engineering assistant similar to JoyCaption extra options, integrating 5 reverse engineering types with 26 fine-grained option switches.</td>
</tr>
</table>

> 💡 **Usage Recommendation**: New users are recommended to start with **Photography Prompt Generator** and **Wan Prompt Generator**, these two nodes can quickly improve your creative efficiency and work quality.

---

## 🛠️ Node Function Description

This node collection contains numerous nodes with different functions, divided into the following main categories:

### 📝 Text Processing Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Multi-line Text</b><br><code>MultiLineTextNode</code></td>
<td>Provides a text box that supports multi-line input with annotation functionality.

<br>
<div align="left">
<a href="images/多行文本.jpg" target="_blank">
<img src="images/多行文本.jpg" alt="Multi-line Text" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Prompt Combiner (with annotations)</b><br><code>TextCombinerNode</code></td>
<td>Combines two text inputs and can control the output of each text through independent switches, with annotation functionality. Can be used to dynamically combine different prompt parts and flexibly build complete prompts.

<br>
<div align="left">
<a href="images/提示词合并器.jpg" target="_blank">
<img src="images/提示词合并器.jpg" alt="Prompt Combiner" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Text Modifier</b><br><code>TextModifier</code></td>
<td>Extracts text content based on specified start and end markers and automatically removes excess whitespace characters. Suitable for extracting specific parts from complex text or performing format cleaning.

<br>
<div align="left">
<a href="images/文本修改器.jpg" target="_blank">
<img src="images/文本修改器.jpg" alt="Text Modifier" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Chinese-English Text Extractor</b><br><code>TextExtractor</code></td>
<td>Extracts pure Chinese or pure English characters from mixed text, supports extraction of punctuation and numbers, and automatically cleans formatting. Very useful for processing bilingual prompts or separating different language content.<br><br>
<div align="left">
<a href="images/中英文本提取器.jpg" target="_blank">
<img src="images/中英文本提取器.jpg" alt="Text Extractor" width="45%"/>
</a>
</div></td>
</tr>

<tr>
<td><b>Prompt Expander (Universal)</b><br><code>TextExpander</code></td>
<td>

Uses multiple LLM models to intelligently expand and creatively enhance input text, supports character count control and custom system prompts.

<b>Features</b>:
- <b>Multi-model Support</b>: Supports 11 AI models including claude, deepseek, gemini, openai, mistral, qwen-coder, llama, sur, unity, searchgpt, evil
- <b>Character Count Control</b>: Precisely control the character count of output text to ensure generated content meets requirements
- <b>Creative Temperature Adjustment</b>: Control the creativity level of generated content through temperature parameter (0.1-2.0)
- <b>System Prompts</b>: Supports custom system prompts to guide AI to generate specific style content
- <b>Flexible Input</b>: Supports direct input of system prompts or loading through external nodes

<div align="left">
<a href="images/提示词扩展(通用).jpg" target="_blank">
<img src="images/提示词扩展(通用).jpg" alt="Text Expander" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Text Display</b><br><code>ShowText</code></td>
<td>Node for displaying text content in ComfyUI interface, supports multi-line text display, can display text information passed from upstream nodes in real-time, convenient for debugging and viewing intermediate results.

<br>
<div align="left">
<a href="images/文本显示器.jpg" target="_blank">
<img src="images/文本显示器.jpg" alt="Text Display" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### 💡 Prompt Processing Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Kontext Presets Basic</b><br><code>LoadKontextPresetsBasic</code></td>
<td>Provides professional image transformation preset library, including 13 professional presets. Provides stylized guidance for image generation, helping users quickly apply common artistic styles and effects.

<br>
<div align="left">
<a href="images/Kontext预设集基础版.jpg" target="_blank">
<img src="images/Kontext预设集基础版.jpg" alt="Kontext Presets Basic" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Kontext Presets Plus</b><br><code>KontextPresetsPlus</code></td>
<td>

Provides professional image transformation presets with built-in free online expansion functionality, supports user-defined presets, providing creative guidance for image editing.

<b>Features</b>:
- <b>Rich Preset Library</b>: Contains 20+ professional presets
- <b>Dual Preset Libraries</b>: Supports default presets and user-defined presets, users can freely add more creative presets, distinguished by category identifiers. <a href="doc/Kontext预设_用户文件说明.md" style="font-weight:bold;color:yellow;">User Preset Usage Guide</a>
- <b>Intelligent Expansion</b>: Supports multiple LLM models (OpenAI, Mistral, Qwen, etc.) for creative expansion of preset content
- <b>Flexible Output</b>: Supports outputting original preset content, complete information, or AI-expanded content

<div align="left">
<a href="images/Kontext预设增强版节点展示.jpg" target="_blank">
<img src="images/Kontext预设增强版节点展示.jpg" alt="Node Display" width="45%" style="margin-right:5%"/>
</a>
<a href="images/Kontext预设增强版效果预览.jpg" target="_blank">
<img src="images/Kontext预设增强版效果预览.jpg" alt="Effect Display" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Photography Prompt Generator</b><br><code>PhotographPromptGenerator</code></td>
<td>

Generates professional photography style prompts based on preset photography elements (such as camera, lens, lighting, scene, etc.).

<b>Features</b>:
- Supports loading options from custom text files for flexible expansion
- Supports random selection to increase creative diversity
- Output templates can be customized to adapt to different photography style needs

<div align="left">
<a href="images/摄影提示词生成器.jpg" target="_blank">
<img src="images/摄影提示词生成器.jpg" alt="Photography Prompt Generator" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Wan Prompt Generator</b><br><code>WanPromptGenerator</code></td>
<td>

Comprehensive prompt generator based on Wan 2.2 official documentation, supports both custom and preset combination methods, covering 16 professional dimensions including camera movement, scenes, lighting, composition for professional video prompt generation.

<b>Features</b>:
- <b>Dual Mode Switching</b>: Supports custom combination and preset combination modes, one-click switching through toggle button
- <b>Multi-dimensional Selection</b>: Covers 17 professional dimensions including subject type, scene type, light source type, light type, time period, shot size, composition, lens focal length, camera angle, lens type, color tone, camera movement, character emotion, motion type, visual style, special effects shots, action poses
- <b>Intelligent Expansion</b>: Supports multiple LLM models (OpenAI, Claude, DeepSeek, Gemini, etc.) for free online expansion

<div align="left">
<a href="images/万相视频提示词生成器.jpg" target="_blank">
<img src="images/万相视频提示词生成器.jpg" alt="Wan Prompt Generator" width="45%"/>
</a>
</div>
</td>
</tr>

<tr>
<td><b>Prompt Preset - Single Choice</b><br><code>PromptPresetOneChoice</code></td>
<td>Provides 6 preset options, users can conveniently switch between different presets. Suitable for saving commonly used prompt templates and quickly applying them to different scenarios.

<br>
<div align="left">
<a href="images/单选提示词预设.jpg" target="_blank">
<img src="images/单选提示词预设.jpg" alt="Single Choice Prompt Preset" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Prompt Preset - Multiple Choice</b><br><code>PromptPresetMultipleChoice</code></td>
<td>Supports selecting multiple presets simultaneously and merging them for output, each preset has independent switches and annotation functionality. Suitable for building complex combined prompts and flexibly controlling the enabled status of each part.

<br>
<div align="left">
<a href="images/多选提示词预设.jpg" target="_blank">
<img src="images/多选提示词预设.jpg" alt="Multiple Choice Prompt Preset" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Trigger Word Merger</b><br><code>TriggerWordMerger</code></td>
<td>Intelligently merges specific trigger words with main text and supports weight control (e.g., <code>(word:1.5)</code>). Suitable for adding model-specific trigger words or style words and precisely controlling their influence strength.

<br>
<div align="left">
<a href="images/触发词合并器.jpg" target="_blank">
<img src="images/触发词合并器.jpg" alt="Trigger Word Merger" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>System Prompt Loader</b><br><code>SystemPromptLoader</code></td>
<td>Dynamically loads system-level prompts from preset folders and can optionally merge with user input. Suitable for managing and applying complex system prompt templates to improve consistency and quality of generation results.<br><br>
<div align="left">
<a href="images/系统引导词加载器.jpg" target="_blank">
<img src="images/系统引导词加载器.jpg" alt="System Prompt Loader" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>System Prompt Loader (Basic)</b><br><code>SystemPromptLoaderBase</code></td>
<td>Dynamically loads system-level prompts from preset folders, simplified node functionality, suitable for scenarios requiring pure system prompts.<br><br>
<div align="left">
<a href="images/系统引导词加载器基础版.jpg" target="_blank">
<img src="images/系统引导词加载器基础版.jpg" alt="System Prompt Loader Basic" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Extra Options List</b><br><code>ExtraOptions</code></td>
<td>A universal extra options list similar to JoyCaption design, with master switch and independent prompt input boxes. Suitable for adding auxiliary prompts or control parameters to enhance workflow flexibility.<br><br>
<div align="left">
<a href="images/额外引导选项（通用）.jpg" target="_blank">
<img src="images/额外引导选项（通用）.jpg" alt="Extra Options List" width="45%"/>
</a>
</div></td>
</tr>
</table>

### 🖼️ Image Processing Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Image Aspect Ratio Setting</b><br><code>ImageAspectRatio</code></td>
<td>Intelligent image aspect ratio setting tool, supports multiple preset modes and custom size configuration.

<b>Features</b>:
- <b>Multi-preset Support</b>: Built-in aspect ratio presets for mainstream models like Qwen, Flux, Wan, SDXL
- <b>Custom Mode</b>: Supports completely custom width and height settings
- <b>Aspect Ratio Lock</b>: Provides aspect ratio lock function, automatically adjusts the other dimension when modifying one dimension
- <b>Intelligent Switching</b>: Automatically displays corresponding aspect ratio options based on selected preset mode

<br>
<div align="left">
<a href="images/图像宽高比设置1.jpg" target="_blank">
<img src="images/图像宽高比设置1.jpg" alt="Image Aspect Ratio Setting 1" width="30%"/>
</a>
<a href="images/图像宽高比设置2.jpg" target="_blank">
<img src="images/图像宽高比设置2.jpg" alt="Image Aspect Ratio Setting 2" width="30%"/>
</a>
<a href="images/图像宽高比设置3.jpg" target="_blank">
<img src="images/图像宽高比设置3.jpg" alt="Image Aspect Ratio Setting 3" width="30%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Image Scaler</b><br><code>ImageScaler</code></td>
<td>Provides multiple interpolation algorithms for image scaling and can choose to maintain original aspect ratio. Supports high-quality image size adjustment, suitable for preprocessing or post-processing stages.

<br>
<div align="left">
<a href="images/图像缩放器.jpg" target="_blank">
<img src="images/图像缩放器.jpg" alt="Image Scaler" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Color Removal</b><br><code>ColorRemoval</code></td>
<td>Removes color from images, outputting grayscale images. Suitable for creating black and white effects or as preprocessing steps for specific image processing workflows.<br><br>
<a href="images/去色节点展示.png" target="_blank"><img src="images/去色节点展示.png" alt="Color Removal Node Display" width="400"/></a></td>
</tr>
</table>

### 🎞️ Film Post-processing Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Film Grain Effect</b><br><code>FilmGrain</code></td>
<td>

Adds realistic film grain effects to images, creating classic film texture.
- <b>Dual Distribution Modes</b>: Supports Gaussian distribution (natural film noise) and uniform distribution (digital uniform noise)
- <b>Saturation Mixing</b>: Independent control of color/monochrome grain ratio, achieving smooth transition from color film to black and white film

<br>
<div align="left">
<a href="images/胶片颗粒.jpg" target="_blank">
<img src="images/胶片颗粒.jpg" alt="Film Grain Effect" width="45%"/>
</a>
</div>
</td>
</tr>

<tr>
<td><b>Laplacian Sharpening</b><br><code>LaplacianSharpen</code></td>
<td>

Edge sharpening tool based on Laplacian operator, detects image edges through second-order derivatives and enhances details, suitable for detail enhancement of landscapes and portraits.

<br>
<div align="left">
<a href="images/拉普拉斯锐化.jpg" target="_blank">
<img src="images/拉普拉斯锐化.jpg" alt="Laplacian Sharpening" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>

<td><b>Sobel Sharpening</b><br><code>SobelSharpen</code></td>
<td>
Directional sharpening tool using Sobel operator, enhances both horizontal and vertical edges through gradient calculation, suitable for scenes requiring texture emphasis.

<br>
<div align="left">
<a href="images/索贝尔锐化.jpg" target="_blank">
<img src="images/索贝尔锐化.jpg" alt="Sobel Sharpening" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>USM Sharpening</b><br><code>USMSharpen</code></td>
<td>
Uses classic USM sharpening technology to enhance details, performing natural sharpening processing on target images.

<br>
<div align="left">
<a href="images/USM锐化.jpg" target="_blank">
<img src="images/USM锐化.jpg" alt="USM Sharpening" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Color Matching</b><br><code>ColorMatchToReference</code></td>
<td>
Intelligent color matching tool that can apply the color tone style of reference images to target images, achieving professional-level color unification.

<br>
<div align="left">
<a href="images/颜色匹配.jpg" target="_blank">
<img src="images/颜色匹配.jpg" alt="Color Matching" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### ⚙️ Logic and Tool Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Latent Switch (Dual Mode)</b><br><code>LatentSwitch</code></td>
<td>Dual-mode switcher supporting 3 Latent inputs, can manually select output through dropdown menu or enable auto mode to intelligently detect single valid input.

<br>
<div align="left">
<a href="images/Latent切换器.jpg" target="_blank">
<img src="images/Latent切换器.jpg" alt="Latent Switch" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Text Switch (Dual Mode)</b><br><code>TextSwitchDualMode</code></td>
<td>Dual-mode switcher supporting 4 text inputs, can manually select output through dropdown menu or enable auto mode to intelligently detect single valid input. Convenient for quickly switching between different versions of prompts for comparison experiments.

<br>
<div align="left">
<a href="images/文本切换器.jpg" target="_blank">
<img src="images/文本切换器.jpg" alt="Text Switch" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Image Switch (Dual Mode)</b><br><code>ImageSwitchDualMode</code></td>
<td>Dual-mode switcher supporting switching between 2 or 4 image inputs, can manually select output through dropdown menu or enable auto mode to intelligently detect single valid input. Convenient for comparing different generation results or applying different image processing paths.

<br>
<div align="left">
<a href="images/图像切换器.jpg" target="_blank">
<img src="images/图像切换器.jpg" alt="Image Switch 2-way" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Priority Image Switch</b><br><code>PriorityImageSwitch</code></td>
<td>Intelligent priority image switch node, when both image A and image B ports are connected, prioritizes outputting content from port B; if port B has no input, outputs content from image A port; if both ports have no input, prompts to connect at least one input port.

<b>Features</b>:
- <b>Priority Control</b>: Image B port has higher priority than image A port
- <b>Intelligent Switching</b>: Automatically detects input status, seamlessly switches output, reducing manual switching operations

<br>
<div align="left">
<a href="images/优先级图像切换.jpg" target="_blank">
<img src="images/优先级图像切换.jpg" alt="Priority Image Switch" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Baidu Translate</b><br><code>BaiduTranslate</code></td>
<td>

Provides online translation service, supports Chinese-English mutual translation and automatic source language detection.

<b>Key Loading</b>:
- <b>Plain Text Loading</b>: Directly input <code>APP_ID</code> and <code>API_KEY</code> in the node
- <b>Backend Loading</b>: Read keys from configuration file to protect privacy and security

<b>Note</b>:
- Need to register at <a href="https://api.fanyi.baidu.com/">Baidu Translate Open Platform</a> and obtain keys
- Using this node requires network connection
- Backend loading method requires modifying configuration file "baidu_translate_config.json" first and then restarting ComfyUI. (Configuration file path: ...\custom_nodes\zhihui_nodes_comfyui\Nodes\Translate)

<div align="left">
<a href="images/百度翻译.jpg" target="_blank">
<img src="images/百度翻译.jpg" alt="Baidu Translate" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Free Online Translation</b><br><code>FreeTranslate</code></td>
<td>

Free online translation service, supports bidirectional Chinese-English translation and automatic language detection.

<b>Features</b>:
- <b>Free to Use</b>: No registration or API keys required, ready to use out of the box
- <b>Multi-model Support</b>: Provides 11 AI model choices (OpenAI, Claude, DeepSeek, Gemini, etc.)

<div align="left">
<a href="images/中英文翻译器.jpg" target="_blank">
<img src="images/中英文翻译器.jpg" alt="Free Online Translation" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Local File Gallery</b><br><code>LocalFileGallery</code></td>
<td>

Local file browsing and selection tool, provides intuitive file management interface, supports preview and selection of images and text files.

<b>Supported Formats</b>:
- <b>Image Formats</b>: jpg, jpeg, png, bmp, gif, webp
- <b>Text Formats</b>: txt, json, js

<b>Features</b>:
- <b>Visual Interface</b>: Provides friendly file browser interface
- <b>Dual Output Mode</b>: Simultaneously outputs selected image (IMAGE type) and text content (STRING type)
- <b>Security Validation</b>: Built-in path security check and file format validation
- <b>Cache Optimization</b>: LRU cache mechanism improves file loading performance
- <b>Thumbnail Support</b>: Quick preview of image content

<div align="left">
<a href="images/本地文件画廊.jpg" target="_blank">
<img src="images/本地文件画廊.jpg" alt="Local File Gallery" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

---

## 🚀 Installation Methods

### 📦 Install via ComfyUI Manager (Recommended)

1. Install [ComfyUI Manager](https://github.com/ltdrdata/ComfyUI-Manager)
2. Select "Install Custom Nodes" in the Manager menu
3. Search for `zhihui_nodes_comfyui` (not yet supported), or install via Git URL:
   ```
   https://github.com/ZhiHui6/zhihui_nodes_comfyui.git
   ```
4. Click the "Install" button and wait for installation to complete
5. Restart ComfyUI, and you can find the newly added nodes in the node menu

### 🔧 Manual Installation

1. Download the ZIP file of this repository or clone via Git:
   ```bash
   git clone https://github.com/ZhiHui6/zhihui_nodes_comfyui.git
   ```
2. Extract or copy the entire `zhihui_nodes_comfyui` folder to the `custom_nodes` directory of ComfyUI
3. Restart ComfyUI

---

### 📋 Dependencies

Most functions of this node collection require no additional dependencies and are ready to use out of the box. Some online functions (such as translation, prompt optimization) require network connection.

If you need to manually install dependencies, you can execute:

```bash
pip install -r requirements.txt
```
## 🤝 Contribution Guidelines

We welcome various forms of contributions, including but not limited to:
<div align="left">
[🔴Report issues and suggestions] | [💡Submit feature requests] | [📚Improve documentation] | [💻Submit code contributions]
</div>

If you have any ideas or suggestions, please feel free to submit Issues or Pull Requests.