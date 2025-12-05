### [[中文版文档]](README.md)

# 🎨 ZhiHui AI ComfyUI Nodes Package 

Latest Version: `v0.9.0` (2025-12-5), Complete Changelog: See <a href="CHANGELOG.md">`CHANGELOG.md`</a>

## 📖 Project Introduction

This is a collection of ComfyUI custom nodes meticulously created by <span style="color: red;"> **Binity** </span>, designed to provide users with a series of practical and efficient nodes to enhance and extend ComfyUI's capabilities. This node set contains 30+ functional nodes covering text processing, prompt optimization, image processing, translation tools, music creation assistance, Latent processing, and more, providing comprehensive support for your AI creation.

***If this project helps you, please give us a ⭐ Star! Your support is our motivation for continuous improvement.***

## ✨ Key Features

### **🌍Chinese Localization Support**

Special Chinese localization files are provided for use with the ComfyUI-DD-Translation extension, allowing Chinese users to more conveniently use various node functions. For detailed instructions, please refer to <a href="doc/Localization_Guide.md">Localization_Guide.md</a>.

### **Core Function Highlights**

- 🔄 **Bilingual Translation Nodes**: Provide three nodes - Baidu Translation, Tencent Translation, and Free Online Translation, supporting bidirectional conversion of Chinese and English text.

- 📝 **Comprehensive Text Processing**: Offer 5 types of text operation nodes including multi-line text editing, text merging and separation, content extraction and modification, language filtering, etc.

- 🎯 **Intelligent Prompt System**: Professional prompt generation tools such as Tag Selector, Kontext Presets Enhanced, Photography Prompt Generator, Wanxiang Video Prompt Generator, etc.

- 🖼️ **Practical Image Tools**: Support multi-algorithm image scaling, intelligent switching, color removal, etc.

## ⭐ Featured Nodes

🔥 **<span style="color: #FF6B35; font-weight: bold; font-size: 1.1em;">Here are the highlighted nodes from this collection:</span>**

<table>
<tr>
<th width="30%">Node Name</th>
<th width="19%">Category</th>
<th width="51%">Core Function</th>
</tr>

<tr>
<td><b>🏷️TagSelector</b><br><code>TagSelector</code></td>
<td>Prompt Processing</td>
<td>Next-generation intelligent tag management system with visual tag selection interface, supporting custom tag management and intelligent search functions. Rich classification, covering quality, photography, art style and many professional tags.</td>
</tr>

<tr>
<td><b>👁️Qwen3-VL Advanced</b><br><code>Qwen3VLAdv</code></td>
<td>AI Vision Understanding</td>
<td>Professional content description and scene understanding through Qwen3-VL visual recognition model, enabling intelligent image/video analysis. Supports NSFW restriction-breaking analysis, with 4bit/8bit quantization acceleration and batch processing capabilities.</td>
</tr>

<tr>
<td><b>🎬Wanxiang Video Prompt Generator</b><br><code>WanPromptGenerator</code></td>
<td>Prompt Processing</td>
<td>All-in-one prompt generator based on Wanxiang 2.2 official documentation, supporting custom and preset combination methods, covering 17 professional video prompt generation dimensions including camera movement, scenes, lighting, composition, etc.</td>
</tr>

<tr>
<td><b>🎯Kontext Presets Plus</b><br><code>KontextPresetsPlus</code></td>
<td>Prompt Processing</td>
<td>Kontext image editing presets with 20+ creative presets built-in, supporting user-defined preset expansion, integrated with multiple LLM models for free online intelligent expansion.</td>
</tr>

<tr>
<td><b>📸Photography Prompt Generator</b><br><code>PhotographPromptGenerator</code></td>
<td>Prompt Processing</td>
<td>Professional photography style prompt generator, covering 15 dimensions including characters, scenes, lenses, lighting, etc., generating professional photography prompts with one click.</td>
</tr>
</table>

💡 **Usage Suggestion**: New users are recommended to start with the **Tag Selector** to quickly enhance your creative inspiration and efficiency.

---

## 🛠️ Node Function Descriptions

This node collection includes many nodes with different functions, divided into the following main categories:

### 📝 Text Processing Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>MultiLine Text</b><br><code>MultiLineTextNode</code></td>
<td>Provides a text box that supports multi-line input with comment function.

<br>
<div align="left">
<a href="images/多行文本.jpg" target="_blank">
<img src="images/多行文本.jpg" alt="MultiLine Text" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Priority Text Switch</b><br><code>PriorityTextSwitch</code></td>
<td>Priority text switching node: When both text A and text B ports are connected, the B port is prioritized; if the B port is empty or not connected, the text A port is output; if both ports are empty, an empty string is returned.

<b>Features</b>：
- <b>Priority Control</b>：Text B port has higher priority than text A port
- <b>Intelligent Switching</b>：Automatically detects input status, fallback to A or output empty text when empty value

<br>
<div align="left">
<a href="images/Priority Text Switch.jpg" target="_blank">
<img src="images/Priority Text Switch.jpg" alt="Priority Text Switch" width="45%"/>
</a>
</div>
</td>
</tr>
<td><b>Text Combiner (With Comments)</b><br><code>TextCombinerNode</code></td>
<td>Merge two text inputs, with independent switches to control the output of each text, and with comment function. It can be used to dynamically combine different parts of prompts and flexibly build complete prompts.

<br>
<div align="left">
<a href="images/提示词合并器.jpg" target="_blank">
<img src="images/提示词合并器.jpg" alt="Text Combiner" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Text Modifier</b><br><code>TextModifier</code></td>
<td>Extract text content according to specified start and end markers, and automatically remove excess whitespace characters. Suitable for extracting specific parts from complex text or for format cleaning.

<br>
<div align="left">
<a href="images/Text Modifier.jpg" target="_blank">
<img src="images/Text Modifier.jpg" alt="Text Modifier" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Chinese/English Text Extractor</b><br><code>TextExtractor</code></td>
<td>Extract pure Chinese or pure English characters from mixed text, support punctuation and number extraction, and automatically clean formatting. Very useful for processing bilingual prompts or separating different language contents.<br><br>
<div align="left">
<a href="images/中英文本提取器.jpg" target="_blank">
<img src="images/中英文本提取器.jpg" alt="Text Extractor" width="45%"/>
</a>
</div></td>
</tr>

<tr>
<td><b>Text Expander (General)</b><br><code>TextExpander</code></td>
<td>

Use multiple LLM models to intelligently expand and creatively enhance input text, supporting character count control and custom system guidance words.

<b>Features</b>：
- <b>Multi-model Support</b>：Supports 11 AI models including claude, deepseek, gemini, openai, mistral, qwen-coder, llama, sur, unity, searchgpt, evil
- <b>Character Count Control</b>：Precisely control the number of characters in output text to ensure generated content meets requirements
- <b>Creative Temperature Adjustment</b>：Control the creativity degree of generated content through temperature parameters (0.1-2.0)
- <b>System Guidance Words</b>：Support custom system guidance words to guide AI to generate content with specific styles
- <b>Flexible Input</b>：Support direct input of system guidance words or loading through external nodes

<div align="left">
<a href="images/提示词扩展(通用).jpg" target="_blank">
<img src="images/提示词扩展(通用).jpg" alt="Text Expander" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Text Display</b><br><code>ShowText</code></td>
<td>A node used to display text content in the ComfyUI interface, supporting multi-line text display, which can display text information passed from upstream nodes in real-time, facilitating debugging and viewing intermediate results.

<br>
<div align="left">
<a href="images/文本显示器.jpg" target="_blank">
<img src="images/文本显示器.jpg" alt="Text Display" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Text Editor (With Continue)</b><br><code>TextEditorWithContinue</code></td>
<td>Interactive text editing node that pauses workflow execution and provides an editable text area where users can modify text content during runtime and click the continue button to resume workflow execution.

<b>Features</b>：
- <b>Workflow Pause</b>：Automatically pause workflow execution, waiting for user interaction
- <b>Real-time Editing</b>：Provide editable text area, support multi-line text editing
- <b>Manual Synchronization</b>：Need to manually click the sync button to update content after editing

<b>Usage Scenarios</b>：
- Scenarios requiring manual intervention and text adjustment in workflow
- Real-time optimization and debugging of prompts

<br>
<div align="left">
<a href="images/Text Editor with Continue.jpg" target="_blank">
<img src="images/Text Editor with Continue.jpg" alt="Text Editor with Continue" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### 🎯 Prompt Processing Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Kontext Presets Basic</b><br><code>LoadKontextPresetsBasic</code></td>
<td>Provides a professional image transformation preset library with 13 professional presets. Provides stylistic guidance for image generation, helping users quickly apply common artistic styles and effects.

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

Provides professional image transformation presets, built-in free online expansion function, supports user-defined presets, and provides creative guidance for image editing.

<b>Features</b>：
- <b>Rich Preset Library</b>：Contains more than 20 professional presets
- <b>Dual Preset Libraries</b>：Supports default presets and user-defined presets, users can freely add more creative presets, distinguish preset sources through classification identifiers. <a href="doc/Kontext_Presets_User_File_Instructions.md" style="font-weight:bold;color:yellow;">User Preset Usage Instructions</a>
- <b>Intelligent Expansion</b>：Supports multiple LLM models for creative expansion of preset content
- <b>Flexible Output</b>：Supports output of original preset content, complete information, or AI-expanded content

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

Generate professional photography style prompts by combining preset photography elements (such as camera, lens, lighting, scene, etc.).

<b>Features</b>：
- Support loading options from custom text files for flexible expansion
- Support random selection to increase creative diversity
- Output templates can be customized to meet different photography style needs

<div align="left">
<a href="images/摄影提示词生成器.jpg" target="_blank">
<img src="images/摄影提示词生成器.jpg" alt="Photography Prompt Generator" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Wanxiang Video Prompt Generator</b><br><code>WanPromptGenerator</code></td>
<td>

All-in-one prompt generator based on Wanxiang 2.2 official documentation, supporting custom and preset combination methods, covering 16 professional video prompt generation dimensions including camera movement, scenes, lighting, composition, etc.

<b>Features</b>：
- <b>Dual Mode Switching</b>：Supports custom combination and preset combination modes, switchable with one click via toggle button
- <b>Multi-dimensional Selection</b>：Covers 17 professional dimensions including subject type, scene type, light source type, light type, time period, shot type, composition, lens focal length, camera angle, lens type, tone, camera movement, character emotion, movement type, visual style, special effect shots, action pose
- <b>Intelligent Expansion</b>：Supports multiple LLM models for free online expansion

<div align="left">
<a href="images/万相视频提示词生成器.jpg" target="_blank">
<img src="images/万相视频提示词生成器.jpg" alt="Wanxiang Video Prompt Generator" width="45%"/>
</a>
</div>
</td>
</tr>

<tr>
<td><b>Prompt Preset - Single Choice</b><br><code>PromptPresetOneChoice</code></td>
<td>Provides 6 preset options, allowing users to easily switch between different presets. Suitable for saving commonly used prompt templates for quick application to different scenarios.

<br>
<div align="left">
<a href="images/单选提示词预设.jpg" target="_blank">
<img src="images/单选提示词预设.jpg" alt="Single Choice Prompt Preset" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Prompt Preset - Multiple Choice</b><br><code>PromptPresetMultipleChoice</code></td>
<td>Support selecting multiple presets at the same time and merging them for output, each preset has independent switch and comment function. Suitable for building complex combination prompts and flexibly controlling the enabled status of each part.

<br>
<div align="left">
<a href="images/多选提示词预设.jpg" target="_blank">
<img src="images/多选提示词预设.jpg" alt="Multiple Choice Prompt Preset" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Trigger Word Merger</b><br><code>TriggerWordMerger</code></td>
<td>Intelligently merge specific trigger words with main text and support weight control (e.g. <code>(word:1.5)</code>). Suitable for adding model-specific trigger words or style words and precisely controlling their influence intensity.

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
<td>Dynamically load system-level guidance words (System Prompt) from preset folders, and optionally merge them with user input. Suitable for managing and applying complex system prompt templates to improve the consistency and quality of generation results.<br><br>
<div align="left">
<a href="images/System Prompt Loader.jpg" target="_blank">
<img src="images/System Prompt Loader.jpg" alt="System Prompt Loader" width="45%"/>
</a>
</div>
</td>
</tr>

<tr>
<td><b>Extra Options</b><br><code>ExtraOptions</code></td>
<td>A general extra options list, similar to JoyCaption's design, with a master switch and independent guidance word input boxes. Suitable for adding auxiliary prompts or control parameters to enhance workflow flexibility.<br><br>
<div align="left">
<a href="images/额外引导选项（通用）.jpg" target="_blank">
<img src="images/额外引导选项（通用）.jpg" alt="Extra Options" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Prompt Card Selector</b><br><code>PromptCardSelector</code></td>
<td>Support random/sequential extraction modes, single/multiple card loading, multiple segmentation methods and card pool shuffling strategies, built-in card pool manager provides browsing/searching/editing functions, supports importing/exporting card files, suitable for prompt combination and batch management.

<b>Features</b>：
- <b>Dual Extraction Modes</b>：Supports random extraction and sequential extraction modes
- <b>Multi-card Loading</b>：Supports single card and multiple card loading modes
- <b>Flexible Segmentation</b>：Supports multiple text segmentation methods (blank lines, line breaks, etc.)
- <b>Card Pool Management</b>：Built-in card pool manager with browsing, searching, editing functions
- <b>Import Export</b>：Supports importing and exporting of prompt card files
- <b>Shuffling Strategy</b>：Supports card pool shuffling strategy to increase randomness

<br>
<div align="left">
<a href="images/Prompt Card Selector1.jpg" target="_blank">
<img src="images/Prompt Card Selector1.jpg" alt="Prompt Card Selector1" width="30%"/>
</a>
<a href="images/Prompt Card Selector2.jpg" target="_blank">
<img src="images/Prompt Card Selector2.jpg" alt="Prompt Card Selector2" width="30%"/>
</a>
<a href="images/Prompt Card Selector3.jpg" target="_blank">
<img src="images/Prompt Card Selector3.jpg" alt="Prompt Card Selector3" width="30%"/>
</a>
</div>
</td>
</tr>
</table>

### 🖼️ Image Processing Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Image Aspect Ratio</b><br><code>ImageAspectRatio</code></td>
<td>Intelligent image aspect ratio setting tool, supporting multiple preset modes and custom size configurations.

<b>Features</b>：
- <b>Multi-preset Support</b>：Built-in dedicated aspect ratio presets for mainstream models such as Qwen, Flux, Wan, SDXL, etc.
- <b>Custom Mode</b>：Support completely customized width and height settings
- <b>Aspect Ratio Lock</b>：Provide aspect ratio lock function, automatically adjust one dimension when modifying another
- <b>Intelligent Switching</b>：Automatically display corresponding aspect ratio options based on the selected preset mode

<br>
<div align="left">
<a href="images/图像宽高比设置1.jpg" target="_blank">
<img src="images/图像宽高比设置1.jpg" alt="Image Aspect Ratio1" width="30%"/>
</a>
<a href="images/图像宽高比设置2.jpg" target="_blank">
<img src="images/图像宽高比设置2.jpg" alt="Image Aspect Ratio2" width="30%"/>
</a>
<a href="images/图像宽高比设置3.jpg" target="_blank">
<img src="images/图像宽高比设置3.jpg" alt="Image Aspect Ratio3" width="30%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Image Scaler</b><br><code>ImageScaler</code></td>
<td>Provide multiple interpolation algorithms to scale images, and can choose to maintain the original aspect ratio. Supports high-quality image size adjustment, suitable for pre-processing or post-processing stages.

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
<td>Remove color from images, output grayscale images. Suitable for creating black and white effects or as a pre-processing step for specific image processing flows.<br><br>
<a href="images/颜色移除节点展示.jpg" target="_blank"><img src="images/颜色移除节点展示.jpg" alt="Color Removal Node Display" width="400"/></a></td>
</tr>
<tr>
<td><b>Image Rotate Tool</b><br><code>ImageRotateTool</code></td>
<td>

Professional image rotation and flipping tool, supporting preset angles and custom angle rotation.

<b>Features</b>：
- <b>Preset Rotation</b>：Provide 90°, 180°, 270°, 360° quick rotation options
- <b>Flipping Function</b>：Support vertical flip and horizontal flip operations
- <b>Custom Angle</b>：Support precise angle rotation in the range of -360° to 360°
- <b>Canvas Processing</b>：Can choose to expand canvas or crop blank areas in two processing modes
- <b>Batch Processing</b>：Support simultaneous processing of batch images

<br>
<div align="left">
<a href="images/Image Rotate Tool.jpg" target="_blank">
<img src="images/Image Rotate Tool.jpg" alt="Image Rotate Tool" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Image Preview/Compare</b><br><code>PreviewOrCompareImages</code></td>
<td>Multi-functional image preview and comparison node, supporting single image preview or side-by-side comparison display of two images. image_1 is a required input, image_2 is an optional input, and comparison mode is automatically enabled when two images are provided.

<b>Features</b>：
- <b>Dual Mode Intelligent Switching</b>：Automatically switch between preview or comparison modes based on single or dual image input
- <b>Interactive Comparison</b>：Display sliding divider for intuitive comparison when hovering over

<br>
<div align="left">
<a href="images/图像对比.jpg" target="_blank">
<img src="images/图像对比.jpg" alt="Image Preview Compare" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Image Format Converter</b><br><code>ImageFormatConverter</code></td>
<td>

Professional image format conversion tool, supporting batch conversion of multiple image formats, with intelligent format detection and advanced compression options.

<b>Supported Formats</b>：
- <b>Output Formats</b>：JPEG, PNG, WEBP, BMP, TIFF
- <b>Input Formats</b>：Automatically detect all common image formats

<b>Features</b>：
- <b>Batch Processing</b>：Support folder batch conversion, automatically create output directory
- <b>Quality Control</b>：1-100 adjustable quality parameters for precise control of file size and image quality
- <b>Advanced Options</b>：Support optimized compression, progressive encoding, lossless compression
- <b>Intelligent Detection</b>：Format detection based on file content rather than extension
- <b>Detailed Report</b>：Provide detailed information and statistics on the conversion process

<br>
<div align="left">
<a href="images/Image Format Converter.jpg" target="_blank">
<img src="images/Image Format Converter.jpg" alt="Image Format Converter" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### 🎞️ Film Post-Processing Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Film Grain</b><br><code>FilmGrain</code></td>
<td>

Add realistic film grain effects to images, creating a classic film texture.
- <b>Dual Distribution Modes</b>：Support Gaussian distribution (natural film noise) and uniform distribution (digital uniform noise)
- <b>Saturation Blending</b>：Independently control color/monochrome grain ratio for smooth transition from color film to black and white film

<br>
<div align="left">
<a href="images/胶片颗粒.jpg" target="_blank">
<img src="images/胶片颗粒.jpg" alt="Film Grain" width="45%"/>
</a>
</div>
</td>
</tr>

<tr>
<td><b>Laplacian Sharpen</b><br><code>LaplacianSharpen</code></td>
<td>
Edge sharpening tool based on Laplacian operator, detecting image edges through second-order differentiation and enhancing details, suitable for detail enhancement in landscapes and portraits.

<br>
<div align="left">
<a href="images/拉普拉斯锐化.jpg" target="_blank">
<img src="images/拉普拉斯锐化.jpg" alt="Laplacian Sharpen" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>

<td><b>Sobel Sharpen</b><br><code>SobelSharpen</code></td>
<td>
Directional sharpening tool using Sobel operator, enhancing both horizontal and vertical edges through gradient calculation, suitable for scenes requiring texture emphasis.

<br>
<div align="left">
<a href="images/索贝尔锐化.jpg" target="_blank">
<img src="images/索贝尔锐化.jpg" alt="Sobel Sharpen" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>USM Sharpen</b><br><code>USMSharpen</code></td>
<td>
Use classic USM sharpening technique to enhance details, providing natural sharpening processing for target images.

<br>
<div align="left">
<a href="images/USM锐化.jpg" target="_blank">
<img src="images/USM锐化.jpg" alt="USM Sharpen" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Color Match</b><br><code>ColorMatchToReference</code></td>
<td>
Intelligent color matching tool that can apply the tone style of a reference image to a target image, achieving professional-level color unification.

<br>
<div align="left">
<a href="images/颜色匹配.jpg" target="_blank">
<img src="images/颜色匹配.jpg" alt="Color Match" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### 🎵 Music Related Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Suno Lyrics Generator</b><br><code>SunoLyricsGenerator</code></td>
<td>
Professional AI lyrics creation tool, generating structured singable lyrics based on online LLM, supporting multiple music styles and languages.

<br>
<div align="left">
<a href="images/Lyrics Generator.jpg" target="_blank">
<img src="images/Lyrics Generator.jpg" alt="Suno Lyrics Generator" width="45%"/>
</a>
</div>

</td>
</tr>
<tr>
<td><b>Suno Song Style Prompt Generator</b><br><code>SunoSongStylePromptGenerator</code></td>
<td>
Professional song style prompt generator tool, combining user preferences and music elements to generate structured Suno style prompts for quickly building style-consistent songs.

<br>
<div align="left">
<a href="images/Song Style Prompt Generator.jpg" target="_blank">
<img src="images/Song Style Prompt Generator.jpg" alt="Suno Song Style Prompt Generator" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### 🤖 AI Vision Understanding Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Qwen3-VL Basic</b><br><code>Qwen3VLBasic</code></td>
<td>
Basic visual understanding node based on Alibaba's Qwen3-VL model, providing concise and efficient image and video analysis functions, supporting multiple model versions and quantization options, simplified from Qwen3-VL Advanced.

<br>
<div align="left">
<a href="images/Qwen3-VL Basic.jpg" target="_blank">
<img src="images/Qwen3-VL Basic.jpg" alt="Qwen3-VL Basic" width="45%"/>
</a>
</div>
</td>
</tr>

<tr>
<td><b>Qwen3-VL Advanced</b><br><code>Qwen3VLAdv</code></td>
<td>
Professional-level visual understanding node based on Alibaba's Qwen3-VL model, integrating numerous preset prompt templates, supporting intelligent batch processing, advanced quantization techniques, and chain-of-thought reasoning functions. Provides multiple preset modes from tag generation to creative analysis, with advanced features such as restriction unlocking, multi-language output, and batch processing.

**Parameter Detailed Documentation**: [Qwen3VL_Parameters_Guide.md](doc/Qwen3VL_Parameters_Guide.md)

<br>
<div align="left">
<a href="images/Qwen3VL高级版.jpg" target="_blank">
<img src="images/Qwen3VL高级版.jpg" alt="Qwen3-VL Advanced" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Qwen3-VL API</b><br><code>Qwen3VLAPI</code></td>
<td>
Powerful cloud-based visual understanding node, supporting multi-platform online API calls and batch image analysis, providing rich model selection and flexible configuration methods.

<b>Supported Platforms</b>：
- <b>Siliconflow Platform, Modelscope Community Platform, Custom API</b>

<b>Core Features</b>：
- <b>Cloud Deployment</b>：No local GPU required, call cloud model through API
- <b>Dual Configuration Modes</b>：Platform preset and fully custom modes
- <b>Batch Processing</b>：Support folder batch processing, automatically save results

<br>
<div align="left">
<a href="images/Qwen3-VL API.jpg" target="_blank">
<img src="images/Qwen3-VL API.jpg" alt="Qwen3-VL API" width="45%"/>
</a>
<a href="images/Qwen3-VL API2.jpg" target="_blank">
<img src="images/Qwen3-VL API2.jpg" alt="Qwen3-VL API2" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Qwen3-VL Extra Options</b><br><code>Qwen3VLExtraOptions</code></td>
<td>
Provide detailed output control options for Qwen3-VL nodes, including character information, lighting analysis, camera angles, watermark detection and other advanced configuration parameters.

<br>
<div align="left">
<a href="images/Qwen3VL额外选项.jpg" target="_blank">
<img src="images/Qwen3VL额外选项.jpg" alt="Qwen3-VL Extra Options" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Qwen3-VL Image Loader</b><br><code>ImageLoader</code></td>
<td>
Image loading node optimized for Qwen3-VL, supporting multiple image formats and batch loading functions.

<br>
<div align="left">
<a href="images/Qwen3-VL Image Loader.jpg" target="_blank">
<img src="images/Qwen3-VL Image Loader.jpg" alt="Qwen3-VL Image Loader" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Qwen3-VL Video Loader</b><br><code>VideoLoader</code></td>
<td>
Video loading node optimized for Qwen3-VL, supporting multiple video formats and frame extraction functions.

<br>
<div align="left">
<a href="images/Qwen3-VL Video Loader.jpg" target="_blank">
<img src="images/Qwen3-VL Video Loader.jpg" alt="Qwen3-VL Video Loader" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Qwen3-VL Multiple Paths Input</b><br><code>MultiplePathsInput</code></td>
<td>
Input node that supports simultaneous processing of multiple file paths, convenient for batch processing of images and video files.

<br>
<div align="left">
<a href="images/Qwen3-VL Multiple Paths Input.jpg" target="_blank">
<img src="images/Qwen3-VL Multiple Paths Input.jpg" alt="Qwen3-VL Multiple Paths Input" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Qwen3-VL Path Switch</b><br><code>PathSwitch</code></td>
<td>
Dual-channel path switcher, supporting both manual and automatic switching modes. Can intelligently switch between 2 path inputs from MultiplePathsInput nodes, supporting annotation tags for easy management. In manual mode, you can specify the selected channel, in automatic mode, it intelligently selects the first non-empty input, suitable for conditional branching and dynamic switching in workflows. Output can be directly connected to the source_path input of Qwen3-VL Advanced.

<br>
<div align="left">
<a href="images/Qwen3-VL Path Switch.jpg" target="_blank">
<img src="images/Qwen3-VL Path Switch.jpg" alt="Qwen3-VL Path Switch" width="45%"/>
</a>
</div>
</td>
</tr>

<tr>
<td><b>Sa2VA Advanced</b><br><code>Sa2VAAdvanced</code></td>
<td>
Professional-level image segmentation node based on ByteDance's Sa2VA model, providing precise intelligent segmentation functions, supporting multiple model versions and quantization configurations. Control the segmentation area through natural language prompts to achieve precise segmentation of specific objects in images, outputting high-quality mask data.

<b>Core Functions</b>：
- <b>Intelligent Segmentation</b>：Precise image object segmentation based on natural language prompts
- <b>Multi-model Support</b>：Support multiple Sa2VA model versions, including InternVL3 and Qwen series
- <b>Quantization Optimization</b>：Provide 4bit and 8bit quantization options to optimize performance and resource usage
- <b>Flash Attention</b>：Support Flash Attention technology to improve inference efficiency
- <b>Model Management</b>：Built-in model download and management functions, supporting local cache
<br>
<div align="left">
<a href="images/Sa2VA Advanced1.jpg" target="_blank">
<img src="images/Sa2VA Advanced1.jpg" alt="Sa2VA Advanced-Interface1" width="45%"/>
</a>
<a href="images/Sa2VA Advanced2.jpg" target="_blank">
<img src="images/Sa2VA Advanced2.jpg" alt="Sa2VA Advanced-Interface2" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Sa2VA Segmentation Preset</b><br><code>Sa2VASegmentationPreset</code></td>
<td>
A tool node that provides interactive segmentation preset selection, allowing selection of common parts/objects in the interface and generating Chinese segmentation prompt text output for driving Sa2VA Advanced segmentation. Connect the <code>segmentation_preset</code> output of this node to the same-named input of Sa2VA Advanced to take effect. If this input is empty, Sa2VA Advanced will use the <code>segmentation_prompt</code> in the string input box instead.

<br>
<div align="left">
<a href="images/Sa2VA Segmentation Preset.jpg" target="_blank">
<img src="images/Sa2VA Segmentation Preset.jpg" alt="Sa2VA Segmentation Preset" width="45%"/>
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
<td><b>🏷️TAG Tag Selector</b><br><code>TagSelector</code></td>
<td>

Next-generation intelligent tag management system, integrating massive preset tag libraries, custom tag functions, and built-in AI expansion capabilities, providing an unprecedented tag selection experience, quickly building complex prompts, and improving creative efficiency.

<b>Core Functions</b>：
- <b>Rich Tag Classification:</b> Covering comprehensive classifications such as general tags, artistic themes, character attributes, scene environments, etc.
- <b>Custom Tag Management:</b> Support adding, editing, and deleting personal exclusive tags to create a personalized tag library
- <b>Intelligent Search Positioning:</b> Support keyword search to quickly find target tags
- <b>Real-time Selection Statistics:</b> Dynamically display selected tag quantity and detailed list
- <b>Random Tag Generation:</b> Intelligent random tag generation function, supporting automatic generation of diverse tag combinations according to classification weights and quantity configuration
- <b>Built-in AI Expansion</b>：One-click intelligent expansion function, supporting two expansion modes: tag-style and natural language-style
<br>
<div align="left">
<a href="images/TAG标签选择器2.jpg" target="_blank">
<img src="images/TAG标签选择器2.jpg" alt="TAG Tag Selector2" width="45%"/>
<a href="images/TAG标签选择器.jpg" target="_blank">
<img src="images/TAG标签选择器.jpg" alt="TAG Tag Selector" width="45%"/>
</a>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Latent Switch (Dual Mode)</b><br><code>LatentSwitchDualMode</code></td>
<td>Dual-mode switcher that supports variable number of latent inputs. Control the number of ports through the slider <code>inputcount</code>, and click the button <code>Update inputs</code> to synchronously add or remove ports; manually select output by index in manual mode (<code>select_channel</code> options automatically update with <code>inputcount</code>); automatic mode only outputs when there is a unique non-empty input, and will prompt an error if multiple non-empty inputs are detected. The newly added latent input ports are all non-mandatory connections, suitable for flexible switching and comparative experiments between different generation paths.

<br>
<div align="left">
<a href="images/Latent Switch Dual Mode.jpg" target="_blank">
<img src="images/Latent Switch Dual Mode.jpg" alt="Latent Switch (Dual Mode)" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Text Switch (Dual Mode)</b><br><code>TextSwitchDualMode</code></td>
<td>Dual-mode switcher that supports variable number of text inputs. Control the number of ports through the slider <code>inputcount</code>, and click the button <code>Update inputs</code> to synchronously add or remove ports; manually select output by index in manual mode (<code>select_text</code> options automatically update with <code>inputcount</code>); automatic mode only outputs when there is a unique non-empty input, and will prompt an error if multiple non-empty inputs are detected. The newly added text input ports are all non-mandatory connections, suitable for flexible switching and comparative experiments between different versions of prompts.

<br>
<div align="left">
<a href="images/Text Switch Dual Mode.jpg" target="_blank">
<img src="images/Text Switch Dual Mode.jpg" alt="Text Switch (Dual Mode)" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Image Switch (Dual Mode)</b><br><code>ImageSwitchDualMode</code></td>
<td>Dual-mode switcher that supports variable number of image inputs. Control the number of ports through the slider <code>inputcount</code>, and click the button <code>Update inputs</code> to synchronously add or remove ports; manually select output by index in manual mode (<code>select_image</code> options automatically update with <code>inputcount</code>); automatic mode only outputs when there is a unique non-empty input, and will prompt an error if multiple non-empty inputs are detected. The newly added image input ports are all non-mandatory connections, facilitating flexible comparison between different generation results or different processing paths.

<br>
<div align="left">
<a href="images/Image Switch Dual Mode.jpg" target="_blank">
<img src="images/Image Switch Dual Mode.jpg" alt="Image Switch (Dual Mode)" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Priority Image Switch</b><br><code>PriorityImageSwitch</code></td>
<td>Intelligent priority image switching node, when both image A and image B ports are connected, the content of B port is prioritized; if B port has no input, the content of image A port is output; if both ports have no input, a prompt pops up requiring at least one input port to be connected.

<b>Features</b>：
- <b>Priority Control</b>：Image B port has higher priority than image A port
- <b>Intelligent Switching</b>：Automatically detect input status, seamlessly switch output, reduce manual switching operations

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

Provide online translation services, supporting Chinese-English mutual translation and automatic source language detection.

<b>Key Loading</b>：
- <b>Plaintext Loading</b>：Directly input <code>APP_ID</code> and <code>API_KEY</code> in the node
- <b>Background Loading</b>：Read keys from configuration files, protecting privacy and security

<b>Note</b>：
- Need to register at <a href="https://api.fanyi.baidu.com/">Baidu Translation Open Platform</a> and obtain keys
- Network connection is required to use this node
- Background loading method requires modifying the configuration file "baidu_translate_config.json" and then restarting ComfyUI. (Configuration file path: ...\custom_nodes\zhihui_nodes_comfyui\Nodes\Translate)

<div align="left">
<a href="images/百度翻译.jpg" target="_blank">
<img src="images/百度翻译.jpg" alt="Baidu Translate" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Free Online Translate</b><br><code>FreeTranslate</code></td>
<td>

Free online translation service, supporting bidirectional translation between Chinese and English and automatic language detection.

<b>Features</b>：
- <b>Free to Use</b>：No registration or API key required, ready to use out of the box
- <b>Multi-model Support</b>：Provide 11 AI model choices
- <b>Note</b>：Network connection is required to use this node

<div align="left">
<a href="images/中英文翻译器.jpg" target="_blank">
<img src="images/中英文翻译器.jpg" alt="Free Online Translate" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Tencent Translate</b><br><code>TencentTranslater</code></td>
<td>

Use Tencent Cloud Translation API for text translation, supporting automatic language detection and Chinese-English mutual translation.

<b>Features</b>：
- <b>High Quality Translation</b>：Based on Tencent Cloud professional translation engine, providing accurate and reliable translation results
- <b>Simple and Easy to Use</b>：No need to configure API keys, ready to use out of the box
- <b>Note</b>：Network connection is required to use this node

<div align="left">
<a href="images/腾讯翻译.jpg" target="_blank">
<img src="images/腾讯翻译.jpg" alt="Tencent Translate" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Local File Gallery</b><br><code>LocalFileGallery</code></td>
<td>

Local file browsing and selection tool, providing an intuitive file management interface, supporting preview and selection of images and text files.

<b>Supported Formats</b>：
- <b>Image Formats</b>：jpg, jpeg, png, bmp, gif, webp
- <b>Text Formats</b>：txt, json, js

<b>Features</b>：
- <b>Visual Interface</b>：Provide a friendly file browser interface
- <b>Thumbnail Support</b>：Quickly preview image content

<div align="left">
<a href="images/本地文件画廊.jpg" target="_blank">
<img src="images/本地文件画廊.jpg" alt="Local File Gallery" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Pause Workflow</b><br><code>PauseWorkflow</code></td>
<td>

Intelligent workflow control node that can pause workflow execution at any position and wait for user interaction before continuing or canceling execution.

<b>Features</b>：
- <b>Universal Input</b>：Support any type of data input and output, can be inserted anywhere in the workflow
- <b>Interactive Control</b>：Provide continue and cancel two operation options
- <b>Status Management</b>：Intelligently manage the pause status of each node instance
- <b>Exception Handling</b>：Throw interruption exception when canceled, safely terminate workflow

</td>
</tr>
</table>

---

## 🚀 Installation Methods

### 📦 Installation via ComfyUI Manager (Recommended)

1. Install [ComfyUI Manager](https://github.com/ltdrdata/ComfyUI-Manager)

2. Select "Install Custom Nodes" in the Manager menu
3. Search for `zhihui_nodes_comfyui` (not yet supported), or install via Git URL:
   ```
   https://github.com/ZhiHui6/zhihui_nodes_comfyui.git
   ```
4. Click the "Install" button and wait for the installation to complete
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

Most functions of this node set require no additional dependencies and are ready to use out of the box. Some online functions (such as translation, prompt optimization) require network connection.

If you need to manually install dependencies, you can execute:

```bash
pip install -r requirements.txt
```
## 🤝 Contribution Guide

We welcome various forms of contributions, including but not limited to:
<div align="left">
[🔴Report Issues and Suggestions ] | [💡Submit Feature Requests] | [📚Improve Documentation] | [💻Submit Code Contributions]<br>

</div>

If you have any ideas or suggestions, please feel free to raise an Issue or Pull Request.