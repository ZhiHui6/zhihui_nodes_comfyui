### [[Chinese Document]](README.md)

# 🎨 Zhi.AI ComfyUI Node Pack 

Latest version: `v1.0.2` (2026-1-18), For complete changelog: See <a href="CHANGELOG.md">`CHANGELOG.md`</a>   

## 📖 Project Introduction

This is a ComfyUI custom node tool collection carefully created by <span style="color: red;">**Binity**</span>, designed to provide users with a series of practical and efficient nodes to enhance and extend ComfyUI's functionality. This node collection contains 30+ functional nodes, covering text processing, prompt optimization, image processing, translation tools, music creation assistance, Latent processing, and other aspects, providing comprehensive support for your AI creation.

***If this project helps you, please give us a ⭐Star! Your support is our motivation for continuous improvement.***

## ✨ Main Features

### 🌍 **Chinese Localization Support**
Provides dedicated Chinese localization files, which can be used with the ComfyUI-DD-Translation extension to enable Chinese users to use various node functions more conveniently. For detailed instructions, please refer to <a href="doc/Localization_Guide.md">Localization_Guide.md</a>.

### **Core Functionality Features**

- 🔄 **Multi-Engine Translation Nodes**: Integrates 5 major translation engines including Baidu, Tencent, Youdao, Google, and free online services, supporting mutual translation between Chinese, English, Japanese, Korean, and other languages, with automatic input language detection and one-click optimal engine switching.

- 📝 **Comprehensive Text Processing**: Provides 5 types of text operation nodes including multi-line text editing, text merging and separation, content extraction and modification, and language filtering.

- 🎯 **Intelligent Prompt System**: Professional prompt generation tools such as Tag Selector, Kontext Presets Plus, Photography Prompt Generator, and WanXiang Video Prompt Generator.

- 🖼️ **Practical Image Tools**: Supports multi-algorithm image scaling, intelligent switching, color removal, and more.

## ⭐ Featured Nodes

🔥 **<span style="color: #FF6B35; font-weight: bold; font-size: 1.1em;">Here are the recommended featured nodes in this collection:</span>**

<table>
<tr>
<th width="30%">Node Name</th>
<th width="19%">Category</th>
<th width="51%">Core Functionality</th>
</tr>

<tr>
<td><b>TagSelector</b><br><b>Tag Selector</b><br><code>TagSelector</code></td>
<td>Prompt Processing</td>
<td>A new generation of intelligent tag management system, providing a visual tag selection interface, supporting custom tag management and intelligent search functions. Rich in categories, covering numerous professional tags such as image quality, photography, and artistic styles.</td>
</tr>

<tr>
<td><b>Qwen3-VL Advanced</b><br><code>Qwen3VLAdv</code></td>
<td>AI Vision Understanding</td>
<td>Through the Qwen3-VL visual recognition large model, it provides professional-level content description, scene understanding, and other core functions, achieving intelligent image/video analysis. Supports NSFW limit-breaking analysis, with 4bit/8bit quantization acceleration and batch processing capabilities.</td>
</tr>

<tr>
<td><b>WanXiang Video Prompt Generator</b><br><code>WanPromptGenerator</code></td>
<td>Prompt Processing</td>
<td>A comprehensive prompt generator written based on WanXiang 2.2 official documentation, supporting both custom and preset combination methods, covering 17 professional dimensions of video prompts including camera movement, scenes, lighting, and composition.</td>
</tr>

<tr>
<td><b>Kontext Presets Plus</b><br><code>KontextPresetsPlus</code></td>
<td>Prompt Processing</td>
<td>A Kontext image editing preset tool with 20+ built-in creative presets, supporting user-defined preset extensions and integrated multiple LLM models for free online intelligent expansion.</td>
</tr>

<tr>
<td><b>Photography Prompt Generator</b><br><code>PhotographPromptGenerator</code></td>
<td>Prompt Processing</td>
<td>Professional photography-style prompt generator, covering 16 dimensions including characters, scenes, lenses, lighting, and clothing. Supports output mode switching (tag combination/template text), integrated AI expansion function. Equipped with user-defined option extension and template editing assistant interface.</td>
</tr>
</table>

💡 **Usage Recommendation**: New users are recommended to start with the **Tag Selector** to quickly enhance your creative inspiration and efficiency.

---

## 🛠️ Node Functionality Description

This node collection contains numerous nodes with different functionalities, divided into the following main categories:

### 📝 Text Processing Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Multi-line Text</b><br><code>MultiLineTextNode</code></td>
<td>Provides a text box supporting multi-line input with comment functionality.

<br>
<div align="left">
<a href="images/多行文本.jpg" target="_blank">
<img src="images/多行文本.jpg" alt="Multi-line Text" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Priority Text Switch</b><br><code>PriorityTextSwitch</code></td>
<td>Priority text switching node: When both text A and text B ports are connected, it prioritizes output from port B; if port B is empty or not connected, it outputs text from port A; if both ports are empty, it returns an empty string.

<b>Features</b>:
- <b>Priority Control</b>: Text B port has higher priority than text A port
- <b>Intelligent Switching</b>: Automatically detects input status, falls back to A or outputs empty text when empty

<br>
<div align="left">
<a href="images/Priority Text Switch.jpg" target="_blank">
<img src="images/Priority Text Switch.jpg" alt="Priority Text Switch" width="45%"/>
</a>
</div>
</td>
</tr>
<td><b>Prompt Merger (with comments)</b><br><code>TextCombinerNode</code></td>
<td>Merges two text inputs, with independent switches to control the output of each text, and includes comment functionality. Can be used to dynamically combine different prompt parts, flexibly building complete prompts.

<br>
<div align="left">
<a href="images/提示词合并器.jpg" target="_blank">
<img src="images/提示词合并器.jpg" alt="Prompt Merger" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Text Merger</b><br><code>TextMergerNode</code></td>
<td>Merges multiple text inputs into a single output text, supporting flexible configuration of input port quantity. The content of the <b>user_text</b> input box is displayed first, followed by controlling the number of <b>text_2</b> to <b>text_N</b> ports through the <b>inputcount</b> slider. All non-empty texts are connected in sequence using a separator, suitable for batch merging of multiple prompts or text fragments.

<br>
<div align="left">
<a href="images/Text Merger Node.png" target="_blank">
<img src="images/Text Merger Node.png" alt="Text Merger" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Text Modifier</b><br><code>TextModifier</code></td>
<td>Extracts text content based on specified start and end markers, automatically removing excess whitespace characters. Suitable for extracting specific parts from complex text or performing format cleaning.

<br>
<div align="left">
<a href="images/Text Modifier.jpg" target="_blank">
<img src="images/Text Modifier.jpg" alt="Text Modifier" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Chinese-English Text Extractor</b><br><code>TextExtractor</code></td>
<td>Extracts pure Chinese or pure English characters from mixed text, supporting extraction of punctuation and numbers, and automatically cleaning the format. Very useful for processing bilingual prompts or separating different language content.<br><br>
<div align="left">
<a href="images/中英文本提取器.jpg" target="_blank">
<img src="images/中英文本提取器.jpg" alt="Text Extractor" width="45%"/>
</a>
</div></td>
</tr>

<tr>
<td><b>Prompt Expander (Universal)</b><br><code>TextExpander</code></td>
<td>

Uses multiple LLM models to intelligently expand and creatively enhance input text, supporting character count control and custom system prompts.

<b>Features</b>:
- <b>Multi-model Support</b>: Supports 11 AI models including claude, deepseek, gemini, openai, mistral, qwen-coder, llama, sur, unity, searchgpt, and evil
- <b>Character Count Control</b>: Precisely control the character count of output text to ensure generated content meets requirements
- <b>Creative Temperature Adjustment</b>: Control the creativity level of generated content through temperature parameters (0.1-2.0)
- <b>System Prompts</b>: Support custom system prompts to guide AI to generate content in specific styles
- <b>Flexible Input</b>: Support direct input of system prompts or loading through external nodes

<div align="left">
<a href="images/提示词扩展(通用).jpg" target="_blank">
<img src="images/提示词扩展(通用).jpg" alt="Text Expander" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Text Display</b><br><code>ShowText</code></td>
<td>A node for displaying text content in the ComfyUI interface, supporting multi-line text display, which can show text information passed from upstream nodes in real-time, facilitating debugging and viewing intermediate results.

<br>
<div align="left">
<a href="images/文本显示器.jpg" target="_blank">
<img src="images/文本显示器.jpg" alt="Text Display" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Text Editor (Continue Execution)</b><br><code>TextEditorWithContinue</code></td>
<td>An interactive text editing node that pauses workflow execution and provides an editable text area, allowing users to modify text content at runtime, and clicking the continue button resumes workflow execution.

<b>Features</b>:
- <b>Workflow Pause</b>: Automatically pauses workflow execution, waiting for user interaction
- <b>Real-time Editing</b>: Provides an editable text area, supporting multi-line text editing
- <b>Manual Sync</b>: Requires manual clicking of the sync button to update content after editing

<b>Use Cases</b>:
- Scenarios requiring human intervention and text adjustment in workflows
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
<td>Provides a professional image transformation preset library, containing 13 professional presets. Offers stylized guidance for image generation, helping users quickly apply common artistic styles and effects.

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

Provides professional image transformation presets with built-in free online expansion functionality, supporting user-defined presets for creative guidance in image editing.

<b>Features</b>:
- <b>Rich Preset Library</b>: Contains over 20 professional presets
- <b>Dual Preset Libraries</b>: Supports default presets and user-defined presets, users can freely add more creative presets, distinguished by category identifiers. <a href="doc/Kontext_Presets_User_File_Instructions.md" style="font-weight:bold;color:yellow;">User Preset Usage Instructions</a>
- <b>Intelligent Expansion</b>: Supports multiple LLM models for creative expansion of preset content
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

Professional photography prompt generator with 16 customizable dimensions (camera, lens, lighting, pose, clothing, etc.). Features dual output modes - Tags for tag combinations and Template for formatted text. Includes AI-powered prompt expansion with independent system prompts for each mode. Supports custom user options and template editing helper.

<b>Features</b>:
- 16 professional photography dimensions including character, clothing, camera, lens, lighting, and more
- Dual output modes: Tags (comma-separated) and Template (formatted text)
- AI-powered expansion with mode-specific system prompts for optimal results
- User-defined options support for flexible customization
- Built-in template editor helper for easy template creation and management
- Random selection option for creative inspiration

<div align="left">
<a href="images/Photograph Prompt Generator1.jpg" target="_blank">
<img src="images/Photograph Prompt Generator1.jpg" alt="Photography Prompt Generator" width="45%"/>
</a>
<a href="images/Photograph Prompt Generator2.jpg" target="_blank">
<img src="images/Photograph Prompt Generator2.jpg" alt="Photography Prompt Generator" width="45%"/>
</a>
<a href="images/Photograph Prompt Generator3.jpg" target="_blank">
<img src="images/Photograph Prompt Generator3.jpg" alt="Photography Prompt Generator" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>WanXiang Video Prompt Generator</b><br><code>WanPromptGenerator</code></td>
<td>

A comprehensive prompt generator written based on WanXiang 2.2 official documentation, supporting both custom and preset combination methods, covering 17 professional dimensions of video prompts including camera movement, scenes, lighting, and composition.

<b>Features</b>:
- <b>Dual Mode Switching</b>: Supports custom combination and preset combination modes, switchable with one click
- <b>Multi-dimensional Selection</b>: Covers 17 professional dimensions including subject type, scene type, light source type, light type, time period, shot size, composition, lens focal length, camera angle, lens type, color tone, camera movement, character emotion, motion type, visual style, special effects shots, and action poses
- <b>Intelligent Expansion</b>: Supports multiple LLM models for free online expansion

<div align="left">
<a href="images/万相视频提示词生成器.jpg" target="_blank">
<img src="images/万相视频提示词生成器.jpg" alt="WanXiang Video Prompt Generator" width="45%"/>
</a>
</div>
</td>
</tr>

<tr>
<td><b>Prompt Preset - Single Choice</b><br><code>PromptPresetOneChoice</code></td>
<td>Provides 6 preset options, allowing users to conveniently switch between different presets. Suitable for saving commonly used prompt templates and quickly applying them to different scenarios.

<br>
<div align="left">
<a href="images/单选提示词预设.jpg" target="_blank">
<img src="images/单选提示词预设.jpg" alt="Single Choice Prompt Preset" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Prompt Preset - Multiple Choice</b><br><code>PromptPresetMultipleChoice</code></td>
<td>Supports selecting multiple presets simultaneously and merging them for output, with each preset having independent switch and comment functionality. Suitable for building complex combination prompts and flexibly controlling the enabled status of each part.

<br>
<div align="left">
<a href="images/多选提示词预设.jpg" target="_blank">
<img src="images/多选提示词预设.jpg" alt="Multiple Choice Prompt Preset" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Trigger Word Merger</b><br><code>TriggerWordMerger</code></td>
<td>Intelligently merges specific trigger words with the main text, supporting weight control (e.g., <code>(word:1.5)</code>). Suitable for adding model-specific trigger words or style words and precisely controlling their influence strength.

<br>
<div align="left">
<a href="images/触发词合并器.jpg" target="_blank">
<img src="images/触发词合并器.jpg" alt="Trigger Word Merger" width="45%"/>
</a>
</div>
</tr>
<tr>
<td><b>System Prompt Loader</b><br><code>SystemPromptLoader</code></td>
<td>Dynamically loads system-level prompts from preset folders, with optional merging with user input. Suitable for managing and applying complex system prompt templates, improving the consistency and quality of generation results.<br><br>
<div align="left">
<a href="images/System Prompt Loader.jpg" target="_blank">
<img src="images/System Prompt Loader.jpg" alt="System Prompt Loader" width="45%"/>
</a>
</div>
</td>
</tr>

<tr>
<td><b>Extra Options List</b><br><code>ExtraOptions</code></td>
<td>A universal extra options list, similar to JoyCaption's design, with a master switch and independent prompt input box. Suitable for adding auxiliary prompts or control parameters, enhancing workflow flexibility.<br><br>
<div align="left">
<a href="images/额外引导选项（通用）.jpg" target="_blank">
<img src="images/额外引导选项（通用）.jpg" alt="Extra Options List" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Prompt Card Selector</b><br><code>PromptCardSelector</code></td>
<td>Supports random/sequential extraction modes, single/multiple card loading, various splitting methods, and card pool shuffling strategies. Built-in card pool manager provides browsing/search/editing functions, supports importing/exporting card files, suitable for prompt combination and batch management.

<b>Features</b>:
- <b>Dual Extraction Modes</b>: Supports both random extraction and sequential extraction modes
- <b>Multi-card Loading</b>: Supports single-card and multi-card loading modes
- <b>Flexible Splitting</b>: Supports multiple text splitting methods (blank lines, line breaks, etc.)
- <b>Card Pool Management</b>: Built-in card pool manager providing browsing, searching, and editing functions
- <b>Import/Export</b>: Supports importing and exporting prompt card files
- <b>Shuffling Strategy</b>: Supports card pool shuffling strategies to increase randomness

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
<td><b>Image Aspect Ratio Settings</b><br><code>ImageAspectRatio</code></td>
<td>Intelligent image aspect ratio setting tool, supporting multiple preset modes and custom size configurations.

<b>Features</b>:
- <b>Multiple Preset Support</b>: Built-in dedicated aspect ratio presets for mainstream models such as Qwen, Flux, Wan, and SDXL
- <b>Custom Mode</b>: Supports completely custom width and height settings
- <b>Aspect Ratio Lock</b>: Provides aspect ratio locking function, automatically adjusting one dimension when modifying the other
- <b>Intelligent Switching</b>: Automatically displays corresponding aspect ratio options based on the selected preset mode

<br>
<div align="left">
<a href="images/Image Aspect Ratio.jpg" target="_blank">
<img src="images/Image Aspect Ratio.jpg" alt="Image Aspect Ratio" width="80%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Image Scaler</b><br><code>ImageScaler</code></td>
<td>Provides multiple interpolation algorithms for image scaling, with the option to maintain the original aspect ratio. Supports high-quality image size adjustment, suitable for preprocessing or post-processing stages.

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
<td>Removes color from images, outputting grayscale images. Suitable for creating black and white effects or as a preprocessing step for specific image processing workflows.<br><br>
<a href="images/颜色移除节点展示.jpg" target="_blank"><img src="images/颜色移除节点展示.jpg" alt="Color Removal Node Display" width="400"/></a></td>
</tr>
<tr>
<td><b>Image Rotation Tool</b><br><code>ImageRotateTool</code></td>
<td>

Professional image rotation and flipping tool, supporting preset angles and custom angle rotation.

<b>Features</b>:
- <b>Preset Rotation</b>: Provides quick rotation options for 90°, 180°, 270°, and 360°
- <b>Flipping Function</b>: Supports vertical flipping and horizontal flipping operations
- <b>Custom Angle</b>: Supports precise angle rotation within the range of -360° to 360°
- <b>Canvas Handling</b>: Offers two processing modes: canvas extension or cropping blank areas
- <b>Batch Processing</b>: Supports simultaneous processing of multiple images

<br>
<div align="left">
<a href="images/Image Rotate Tool.jpg" target="_blank">
<img src="images/Image Rotate Tool.jpg" alt="Image Rotation Tool" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Image Preview/Compare</b><br><code>PreviewOrCompareImages</code></td>
<td>Multi-functional image preview and comparison node, supporting single image preview or side-by-side comparison display of two images. image_1 is a required input, image_2 is an optional input, and comparison mode is automatically enabled when two images are provided.

<b>Features</b>:
- <b>Dual Mode Intelligent Switching</b>: Automatically switches between preview or comparison mode based on single or dual image input
- <b>Interactive Comparison</b>: Displays a sliding divider on mouse hover for intuitive comparison

<br>
<div align="left">
<a href="images/图像对比.jpg" target="_blank">
<img src="images/图像对比.jpg" alt="Image Preview Comparison" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Image Format Converter</b><br><code>ImageFormatConverter</code></td>
<td>

Professional image format conversion tool, supporting batch conversion of multiple image formats, with intelligent format detection and advanced compression options.

<b>Supported Formats</b>:
- <b>Output Formats</b>: JPEG, PNG, WEBP, BMP, TIFF
- <b>Input Formats</b>: Automatically detects all common image formats

<b>Features</b>:
- <b>Batch Processing</b>: Supports folder batch conversion, automatically creating output directories
- <b>Quality Control</b>: Adjustable quality parameters from 1-100 for precise control of file size and image quality
- <b>Advanced Options</b>: Supports optimized compression, progressive encoding, and lossless compression
- <b>Intelligent Detection</b>: Format detection based on file content rather than extension
- <b>Detailed Reports</b>: Provides detailed information and statistics of the conversion process

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
<td><b>Film Grain Effect</b><br><code>FilmGrain</code></td>
<td>

Adds realistic film grain effects to images, creating a classic film texture.
- <b>Dual Distribution Modes</b>: Supports Gaussian distribution (natural film noise) and uniform distribution (digital uniform noise)
- <b>Saturation Mixing</b>: Independently controls color/monochrome grain ratio, achieving smooth transitions from color film to black and white film

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
Edge sharpening tool based on Laplacian operator, detecting image edges through second-order differentiation and enhancing details, suitable for detail enhancement in landscapes and portraits.

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
Directional sharpening tool using Sobel operator, enhancing both horizontal and vertical edges through gradient calculation, suitable for scenes requiring emphasis on texture.

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
Uses classic USM sharpening technology to enhance details, providing natural sharpening processing for target images.

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
Intelligent color matching tool that can apply the color tone style of a reference image to a target image, achieving professional-level color unification.

<br>
<div align="left">
<a href="images/颜色匹配.jpg" target="_blank">
<img src="images/颜色匹配.jpg" alt="Color Matching" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### 🎵 Music-Related Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Suno Lyrics Generator</b><br><code>SunoLyricsGenerator</code></td>
<td>
Professional AI lyrics creation tool that generates structured singable lyrics based on online LLMs, supporting multiple music styles and languages.

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
Professional song style prompt generation tool that combines user preferences and musical elements to generate structured Suno-style prompts for quickly building style-consistent songs.

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
Basic vision understanding node based on Alibaba's Qwen3-VL model, providing concise and efficient image and video analysis functions, supporting multiple model versions and quantization options, a simplified version of Qwen3-VL Advanced.

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
Professional-grade vision understanding node based on Alibaba's Qwen3-VL model, integrating numerous preset prompt templates, supporting intelligent batch processing, advanced quantization techniques, and chain-of-thought reasoning functions. Provides various preset modes from tag generation to creative analysis, with advanced features such as limit unlocking, multi-language output, and batch processing.

**Parameter Details Document**: [Qwen3VL_Parameters_Guide.md](doc/Qwen3VL_Parameters_Guide.md)

<br>
<div align="left">
<a href="images/Qwen3VL高级版.jpg" target="_blank">
<img src="images/Qwen3VL高级版.jpg" alt="Qwen3-VL Advanced" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Qwen3-VL Online</b><br><code>Qwen3VLAPI</code></td>
<td>
Powerful cloud-based vision understanding node, supporting multi-platform online API calls and batch image analysis, providing rich model selection and flexible configuration methods.

<b>Supported Platforms</b>:
- <b>SiliconFlow Platform, ModelScope Platform, Custom API</b>

<b>Core Features</b>:
- <b>Cloud Deployment</b>: No local GPU required, calls cloud models through API
- <b>Dual Configuration Modes</b>: Platform presets and fully custom modes
- <b>Batch Processing</b>: Supports folder batch processing with automatic result saving

<br>
<div align="left">
<a href="images/Qwen3-VL API.jpg" target="_blank">
<img src="images/Qwen3-VL API.jpg" alt="Qwen3-VL Online" width="45%"/>
</a>
<a href="images/Qwen3-VL API2.jpg" target="_blank">
<img src="images/Qwen3-VL API2.jpg" alt="Qwen3-VL Online2" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Qwen3-VL Extra Options</b><br><code>Qwen3VLExtraOptions</code></td>
<td>
Provides detailed output control options for Qwen3-VL nodes, including advanced configuration parameters such as character information, lighting analysis, camera angles, and watermark detection.

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
Image loading node optimized for Qwen3-VL, supporting multiple image formats and batch loading functionality.

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
Video loading node optimized for Qwen3-VL, supporting multiple video formats and frame extraction functionality.

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
Input node supporting simultaneous processing of multiple file paths, facilitating batch processing of image and video files.

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
Dual-channel path switcher, supporting both manual and automatic switching modes. Can intelligently switch between two path inputs from MultiplePathsInput nodes, supports comment labels for easy management. In manual mode, you can specify the selected channel; in automatic mode, it intelligently selects the first non-empty input, suitable for conditional branching and dynamic switching in workflows. Output can be directly connected to the source_path input of Qwen3-VL Advanced.

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
Professional-grade image segmentation node based on ByteDance's Sa2VA model, providing precise intelligent segmentation functionality, supporting multiple model versions and quantization configurations. Controls segmentation regions through natural language prompts, achieving precise segmentation of specific objects in images, outputting high-quality mask data.

<b>Core Functions</b>:
- <b>Intelligent Segmentation</b>: Precise image object segmentation based on natural language prompts
- <b>Multi-model Support</b>: Supports multiple Sa2VA model versions, including InternVL3 and Qwen series
- <b>Quantization Optimization</b>: Provides 4bit and 8bit quantization options to optimize performance and resource usage
- <b>Flash Attention</b>: Supports Flash Attention technology to improve inference efficiency
- <b>Model Management</b>: Built-in model download and management functions, supporting local caching
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
An interactive segmentation preset selection tool node that allows selecting common parts/objects in the interface and generating Chinese segmentation prompt text output to drive Sa2VA Advanced segmentation. Connect the <code>segmentation_preset</code> output of this node to the same-name input of Sa2VA Advanced to take effect. If this input is empty, Sa2VA Advanced will use the <code>segmentation_prompt</code> from the string input box instead.

<br>
<div align="left">
<a href="images/Sa2VA Segmentation Preset.jpg" target="_blank">
<img src="images/Sa2VA Segmentation Preset.jpg" alt="Sa2VA Segmentation Preset" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### ⚙️ Logic and Utility Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>🏷️TAG Selector</b><br><code>TagSelector</code></td>
<td>

A new generation of intelligent tag management system, integrating massive preset tag libraries, custom tag functionality, and built-in AI expansion capabilities, providing an unprecedented tag selection experience to quickly build complex prompts and improve creative efficiency.

<b>Core Functions</b>:
- <b>Rich Tag Categories:</b> Covers comprehensive categories including regular tags, art subjects, character attributes, scene environments, and more
- <b>Custom Tag Management:</b> Supports adding, editing, and deleting personal exclusive tags to create personalized tag libraries
- <b>Intelligent Search and Location:</b> Supports keyword search to quickly find target tags
- <b>Real-time Selection Statistics:</b> Dynamically displays the count and detailed list of selected tags
- <b>Random Tag Generation:</b> Intelligent random tag generation function, supporting automatic generation of diverse tag combinations based on category weights and quantity configuration
- <b>Built-in AI Expansion</b>: One-click intelligent expansion function, supporting both tag-style and natural language-style expansion modes
<br>
<div align="left">
<a href="images/TAG标签选择器2.jpg" target="_blank">
<img src="images/TAG标签选择器2.jpg" alt="TAG Selector2" width="45%"/>
<a href="images/TAG标签选择器.jpg" target="_blank">
<img src="images/TAG标签选择器.jpg" alt="TAG Selector" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Latent Switch (Dual Mode)</b><br><code>LatentSwitchDualMode</code></td>
<td>Dual mode switcher supporting variable number of latent inputs. Control the number of ports through the slider <code>inputcount</code> and click the button <code>Update inputs</code> to synchronously add/remove ports; in manual mode, select output by index (the <code>select_channel</code> option automatically updates with <code>inputcount</code>); in automatic mode, output only when there is a unique non-empty input, and an error will be prompted if multiple non-empty inputs are detected. All newly added latent input ports are non-mandatory, suitable for flexible switching and comparative experiments between different generation paths.

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
<td>Dual mode switcher supporting variable number of text inputs. Control the number of ports through the slider <code>inputcount</code> and click the button <code>Update inputs</code> to synchronously add/remove ports; in manual mode, select output by index (the <code>select_text</code> option automatically updates with <code>inputcount</code>); in automatic mode, output only when there is a unique non-empty input, and an error will be prompted if multiple non-empty inputs are detected. All newly added text input ports are non-mandatory, suitable for flexible switching and comparative experiments between different version prompts.

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
<td>Dual mode switcher supporting variable number of image inputs. Control the number of ports through the slider <code>inputcount</code> and click the button <code>Update inputs</code> to synchronously add/remove ports; in manual mode, select output by index (the <code>select_image</code> option automatically updates with <code>inputcount</code>); in automatic mode, output only when there is a unique non-empty input, and an error will be prompted if multiple non-empty inputs are detected. All newly added image input ports are non-mandatory, facilitating flexible comparison between different generation results or different processing paths.

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
<td>Intelligent priority image switching node that prioritizes output from port B when both image A and image B ports are connected; if port B has no input, it outputs the content of image A port; if both ports have no input, it prompts to connect at least one input port.

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
<td><b>Multi-Platform Translation</b><br><code>MultiPlatformTranslate</code></td>
<td>

Multi-platform translation node, supporting Baidu, Alibaba Cloud, Youdao, Zhipu AI, and free translation services. Users can set API keys for each platform through the configuration management interface to achieve high-quality professional translation services.

<b>Features</b>:
- <b>Multi-platform Support</b>: Supports mainstream translation platforms to meet different needs
- <b>Configuration Management</b>: Easily manage API keys for each platform through a graphical interface
- <b>Professional Translation</b>: Provides high-quality professional translation services

<div align="left">
<a href="images/Multi Platform Translate.jpg" target="_blank">
<img src="images/Multi Platform Translate.jpg" alt="Multi-Platform Translation" width="45%"/>
</a>
</div>
</td>
</tr>

<tr>
<td><b>Local File Gallery</b><br><code>LocalFileGallery</code></td>
<td>

Local file browsing and selection tool, providing an intuitive file management interface, supporting preview and selection of image and text files.

<b>Supported Formats</b>:
- <b>Image Formats</b>: jpg, jpeg, png, bmp, gif, webp
- <b>Text Formats</b>: txt, json, js

<b>Features</b>:
- <b>Visual Interface</b>: Provides a user-friendly file browser interface
- <b>Thumbnail Support</b>: Quick preview of image content

<div align="left">
<a href="images/本地文件画廊.jpg" target="_blank">
<img src="images/本地文件画廊.jpg" alt="Local File Gallery" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Workflow Pauser</b><br><code>PauseWorkflow</code></td>
<td>

Intelligent workflow control node that can pause workflow execution at any position, waiting for user interaction to continue or cancel execution.

<b>Features</b>:
- <b>Universal Input</b>: Supports input and output of any data type, can be inserted at any position in the workflow
- <b>Interactive Control</b>: Provides two operation options: continue and cancel
- <b>State Management</b>: Intelligently manages the pause state of each node instance
- <b>Exception Handling</b>: Throws an interrupt exception when canceled, safely terminating the workflow

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
   
2. Unzip or copy the entire `zhihui_nodes_comfyui` folder to the `custom_nodes` directory of ComfyUI
3. Restart ComfyUI

---

### 📋 Dependencies

Most functions of this node collection do not require additional dependencies and work out of the box. Some online functions (such as translation, prompt optimization) require an internet connection.

To manually install dependencies, you can execute:

```bash
pip install -r requirements.txt
```

## 🤝 Contributing Guidelines

We welcome contributions in various forms, including but not limited to:
<div align="left">
[🔴 Report issues and suggestions] | [💡 Submit feature requests] | [📚 Improve documentation] | [💻 Submit code contributions]<br>

</div>

If you have any ideas or suggestions, please feel free to submit an Issue or Pull Request.