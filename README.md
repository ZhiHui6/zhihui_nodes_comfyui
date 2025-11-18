# 🎨 zhihui-nodes-comfyui / 潪AI ComfyUI 节点包 
[![GitHub](https://img.shields.io/badge/GitHub-zhihui--nodes--comfyui-blue?style=for-the-badge&logo=github)](https://github.com/ZhiHui6/zhihui_nodes_comfyui) [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE) [![ComfyUI](https://img.shields.io/badge/ComfyUI-Compatible-orange?style=for-the-badge)](https://github.com/comfyanonymous/ComfyUI)
---

最新版本：`v0.8.0`（2025-11-18），完整更新日志：查看<a href="CHANGELOG.md">`CHANGELOG.md`</a><br>
Latest version: `v0.8.0` (2025-11-18), full update log: view <a href="CHANGELOG.md">`CHANGELOG.md`</a>

## 📖 项目介绍 | Project Introduction

这是一个由<span style="color: red;"> **Binity** </span>精心创建的 ComfyUI 自定义节点工具合集，旨在为用户提供一系列实用、高效的节点，以增强和扩展 ComfyUI 的功能。本节点集包含30+功能节点，涵盖文本处理、提示词优化、图像处理、翻译工具、音乐创作辅助、Latent处理等多个方面，为您的 AI 创作提供全方位支持。<br>This is a ComfyUI custom node collection carefully created by <span style="color: red;"> **Binity** </span>, designed to provide users with a series of practical and efficient nodes to enhance and extend ComfyUI's functionality. This node collection contains 30+ functional nodes, covering text processing, prompt optimization, image processing, translation tools, music composition assistant , Latent processing and many other aspects, providing comprehensive support for your AI creation.

***如果这个项目对您有帮助，请给我们一个⭐Star！您的支持是我们持续改进的动力。***<br>***If this project helps you, please give us a⭐Star! Your support is our motivation for continuous improvement.***

## ✨ 主要特点 | Key Features

### **中文本地化支持 | Chinese Localization Support**

提供专门的中文汉化文件，配合 ComfyUI-DD-Translation 扩展使用，让中文用户能够更便捷地使用各个节点功能。详细说明请参考 <a href="doc/Localization_Guide.md">Localization_Guide.md</a>。<br>Provides dedicated Chinese localization files that work with ComfyUI-DD-Translation extension, allowing Chinese users to use node functions more conveniently. For detailed instructions, please refer to <a href="doc/Localization_Guide.md">Localization_Guide.md</a>.

### **核心功能特色 | Core Function Features**

- 🔄 **双语翻译节点**：提供百度翻译、腾讯翻译、免费在线翻译三节点，支持中英文本双向转换。<br>
**Bilingual Translation Nodes**: Provides three translation nodes - Baidu Translate, Tencent Translate, and Free Online Translate, supporting bidirectional Chinese-English text conversion.

- 📝 **全面文本处理**：提供多行文本编辑、文本合并分离、内容提取修改、语言过滤等5类文本操作节点。<br>
  **Comprehensive Text Processing**: Provides 5 categories of text operation nodes including multi-line text editing, text merging and separation, content extraction and modification, language filtering, etc.

- 🎯 **智能提示词系统**：标签选择器、Kontext预设增强版、摄影提示词生成器、万相视频提示词生成器等专业的提示词生成工具。<br>
**Intelligent Prompt System**: Professional prompt generation tools including Kontext Presets Enhanced, Photography Prompt Generator, WAN Video Prompt Generator, etc.

- 🖼️ **实用图像工具**：支持多算法图像缩放、智能切换、颜色移除等等。<br>
**Practical Image Tools**: Supports multi-algorithm image scaling, intelligent switching, color removal, and more.

## ⭐ 明星节点 | Featured Nodes

🔥 **<span style="color: #FF6B35; font-weight: bold; font-size: 1.1em;">以下是本节点集中重点推荐的特色节点：</span>**<br>**<span style="color: #FF6B35; font-weight: bold; font-size: 1.1em;">The following are the featured nodes highly recommended in this node collection:</span>**

<table>
<tr>
<th width="30%">节点名称 | Node Name</th>
<th width="19%">类别 | Category</th>
<th width="51%">核心功能 | Core Features</th>
</tr>

<tr>
<td><b>🏷️TagSelector</b><br><b>标签选择器</b><br><code>TagSelector</code></td>
<td>提示词处理<br>Prompt Processing</td>
<td>新一代智能标签管理系统，提供可视化标签选择界面，支持自定义标签管理和智能搜索功能。分类丰富，涵盖画质、摄影、艺术风格等众多专业标签。<br>Next-generation intelligent tag management system providing visual tag selection interface with custom tag management and intelligent search. Rich categories including quality, photography, artistic styles, etc.</td>
</tr>

<tr>
<td><b>👁️Qwen3-VL高级版</b><br><b>Qwen3-VL Advanced</b><br><code>Qwen3VLAdv</code></td>
<td>AI视觉理解<br>AI Vision Understanding</td>
<td>通过Qwen3-VL视觉识别大模型，提供专业级内容描述、场景理解等核心功能，实现图像/视频智能分析。支持NSFW破限分析，具备4bit/8bit量化加速和批量处理能力。<br>Qwen3-VL advanced version for professional content description, scene understanding, etc. Image/video intelligent analysis. Supports NSFW unrestricted analysis, with 4bit/8bit quantization acceleration and batch processing capabilities.</td>
</tr>

<tr>
<td><b>🎬万相视频提示词生成器</b><br><b>Wan Prompt Generator</b><br><code>WanPromptGenerator</code></td>
<td>提示词处理<br>Prompt Processing</td>
<td>基于万相2.2官方文档编写的全能型提示词生成器，支持自定义和预设两种组合方法，涵盖运镜、场景、光线、构图等17个维度的专业视频提示词生成。<br>Comprehensive prompt generator based on Wan 2.2 official documentation, supports both custom and preset combination methods, covering 17 professional dimensions including camera movement, scenes, lighting, composition for professional video prompt generation.</td>
</tr>

<tr>
<td><b>🎯Kontext预设增强版</b><br><b>Kontext Presets Plus</b><br><code>KontextPresetsPlus</code></td>
<td>提示词处理<br>Prompt Processing</td>
<td>内置20+创意预设的Kontext图像编辑预设工具，支持用户自定义预设扩展，集成多种LLM模型免费在线智能扩写。
<br>Kontext image editing preset tool with 20+ built-in creative presets, supports user-defined preset extensions, integrates multiple LLM models for free online intelligent expansion.</td>
</tr>

<tr>
<td><b>📸摄影提示词生成器</b><br><b>Photography Prompt Generator</b><br><code>PhotographPromptGenerator</code></td>
<td>提示词处理<br>Prompt Processing</td>
<td>专业摄影风格提示词生成器，涵盖人物、场景、镜头、光线等15个维度，一键生成专业摄影提示词。<br>Professional photography style prompt generator covering 15 dimensions including characters, scenes, lenses, lighting, generating professional photography prompts with one click.</td>
</tr>
</table>

💡 **使用建议**：新用户建议从 **标签选择器** 开始体验，快速提升您的创作灵感和效率。<br>
**Usage Recommendation**: New users are encouraged to start with the **Tag Selector** to quickly boost your creative inspiration and efficiency.

---

## 🛠️ 节点功能说明 | Node Function Description

本节点集包含众多功能各异的节点，分为以下几个主要类别：<br>
This node collection contains numerous nodes with different functions, divided into the following main categories:

### 📝 文本处理类节点 | Text Processing Nodes

<table>
<tr>
<th width="30%">节点名称 | Node Name</th>
<th>功能描述 | Function Description</th>
</tr>
<tr>
<td><b>多行文本</b><br><b>Multi-line Text</b><br><code>MultiLineTextNode</code></td>
<td>提供一个支持多行输入的文本框，并带注释功能。<br>Provides a text box that supports multi-line input with annotation functionality.

<br>
<div align="left">
<a href="images/多行文本.jpg" target="_blank">
<img src="images/多行文本.jpg" alt="多行文本" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>提示词合并器(可注释)</b><br><b>Prompt Combiner (with annotations)</b><br><code>TextCombinerNode</code></td>
<td>合并两个文本输入，并可通过独立的开关控制每个文本的输出，并带注释功能。可用于动态组合不同的提示词部分，灵活构建完整提示。<br>Combines two text inputs and can control the output of each text through independent switches, with annotation functionality. Can be used to dynamically combine different prompt parts and flexibly build complete prompts.

<br>
<div align="left">
<a href="images/提示词合并器.jpg" target="_blank">
<img src="images/提示词合并器.jpg" alt="提示词合并器" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>文本修改器</b><br><b>Text Modifier</b><br><code>TextModifier</code></td>
<td>根据指定的起始和结束标记提取文本内容，并自动去除多余的空白字符。适合从复杂文本中提取特定部分，或进行格式清理。<br>Extracts text content based on specified start and end markers, and automatically removes excess whitespace. Suitable for extracting specific parts from complex text or format cleaning.

<br>
<div align="left">
<a href="images/文本修改器.jpg" target="_blank">
<img src="images/文本修改器.jpg" alt="文本修改器" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>中英文本提取器</b><br><b>Chinese-English Text Extractor</b><br><code>TextExtractor</code></td>
<td>从混合文本中提取纯中文或纯英文字符，支持标点和数字的提取，并自动清理格式。对于处理双语提示词或分离不同语言内容非常有用。<br>Extracts pure Chinese or English characters from mixed text, supports extraction of punctuation and numbers, and automatically cleans formatting. Very useful for processing bilingual prompts or separating content in different languages.<br><br>
<div align="left">
<a href="images/中英文本提取器.jpg" target="_blank">
<img src="images/中英文本提取器.jpg" alt="文本提取器" width="45%"/>
</a>
</div></td>
</tr>

<tr>
<td><b>提示词扩展(通用)</b><br><b>Text Expander (Universal)</b><br><code>TextExpander</code></td>
<td>

使用多种LLM模型对输入文本进行智能扩写和创意增强，支持字符量控制和自定义系统引导词。<br>Uses multiple LLM models for intelligent expansion and creative enhancement of input text, supporting character count control and custom system prompts.

<b>特点 | Features</b>：
- <b>多模型支持</b>：支持claude、deepseek、gemini、openai、mistral、qwen-coder、llama、sur、unity、searchgpt、evil等11种AI模型<br>
Multi-model Support: Supports 11 AI models including claude, deepseek, gemini, openai, mistral, qwen-coder, llama, sur, unity, searchgpt, evil
- <b>字符量控制</b>：可精确控制输出文本的字符数量，确保生成内容符合要求<br>
Character Count Control:Precisely controls the character count of output text, ensuring generated content meets requirements
- <b>创意温度调节</b>：通过温度参数控制生成内容的创意程度（0.1-2.0）<br>
Creative Temperature Control:Controls the creativity level of generated content through temperature parameters (0.1-2.0)
- <b>系统引导词</b>：支持自定义系统引导词，引导AI生成特定风格的内容<br>
System Prompts: Supports custom system prompts to guide AI in generating content with specific styles
- <b>灵活输入</b>：支持直接输入系统引导词或通过外部节点加载<br>
Flexible Input: Supports direct input of system prompts or loading through external nodes 

<div align="left">
<a href="images/提示词扩展(通用).jpg" target="_blank">
<img src="images/提示词扩展(通用).jpg" alt="文本扩展器" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>文本显示器</b><br><b>Text Display</b><br><code>ShowText</code></td>
<td>用于在ComfyUI界面中显示文本内容的节点，支持多行文本展示，可实时显示上游节点传递的文本信息，便于调试和查看中间结果。<br>A node for displaying text content in the ComfyUI interface, supports multi-line text display, can display text information passed from upstream nodes in real time, convenient for debugging and viewing intermediate results.

<br>
<div align="left">
<a href="images/文本显示器.jpg" target="_blank">
<img src="images/文本显示器.jpg" alt="文本显示" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>文本编辑器（继续运行）</b><br><b>Text Editor with Continue</b><br><code>TextEditorWithContinue</code></td>
<td>交互式文本编辑节点，暂停工作流执行并提供可编辑文本区域，用户可在运行时修改文本内容，点击继续按钮恢复工作流执行。<br>Interactive text editing node that pauses workflow execution and provides an editable text area, allowing users to modify text content at runtime and resume workflow execution by clicking the continue button.

<b>特点 | Features</b>：
- <b>工作流暂停</b>：自动暂停工作流执行，等待用户交互<br>
Workflow Pause: Automatically pauses workflow execution, waiting for user interaction
- <b>实时编辑</b>：提供可编辑文本区域，支持多行文本编辑<br>
Real-time Editing: Provides editable text area with multi-line text editing support
- <b>手动同步</b>：编辑后需手动点击同步按钮更新内容<br>
Manual Sync: Requires manual sync button click to update content after editing   

<b>使用场景 | Use Cases</b>：
- 工作流中需要人工干预和文本调整的场景<br>
Scenarios requiring manual intervention and text adjustment in workflows
- 提示词的实时优化和调试<br>
Real-time optimization and debugging of prompts

<br>
<div align="left">
<a href="images/Text Editor with Continue.jpg" target="_blank">
<img src="images/Text Editor with Continue.jpg" alt="Text Editor with Continue" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### 🎯 提示词处理类节点 | Prompt Processing Nodes

<table>
<tr>
<th width="30%">节点名称 | Node Name</th>
<th>功能描述 | Function Description</th>
</tr>
<tr>
<td><b>Kontext预设基础版</b><br><b>Kontext Presets Basic</b><br><code>LoadKontextPresetsBasic</code></td>
<td>提供专业的图像变换预设库，包含13项专业预设。为图像生成提供风格化指导，帮助用户快速应用常见的艺术风格和效果。
<br>Provides a professional image transformation preset library with 13 professional presets. Offers stylistic guidance for image generation, helping users quickly apply common artistic styles and effects.

<br>
<div align="left">
<a href="images/Kontext预设集基础版.jpg" target="_blank">
<img src="images/Kontext预设集基础版.jpg" alt="Kontext预设基础版" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Kontext预设增强版</b><br><b>Kontext Presets Plus</b><br><code>KontextPresetsPlus</code></td>
<td>

提供专业的图像变换预设，内置免费在线扩写功能，支持用户自定义预设，为图像编辑提供创意指导。<br>Provides professional image transformation presets with built-in free online expansion functionality, supports user-defined presets, and offers creative guidance for image editing.

<b>特点 | Features</b>：
- <b>丰富预设库</b>：包含20余项专业预设<br>
<b>Rich Preset Library:</b> Contains 20+ professional presets
- <b>双预设库</b>：支持默认预设和用户自定义预设，用户可自由新增更多创意预设，通过分类标识区分预设来源。<a href="doc/Kontext_Presets_User_File_Instructions.md" style="font-weight:bold;color:yellow;">用户预设使用说明</a><br>
<b>Dual Preset Libraries:</b> Supports both default presets and user-defined presets, users can freely add more creative presets, distinguished by category identifiers. <a href="doc/Kontext_Presets_User_File_Instructions.md" style="font-weight:bold;color:yellow;">User Preset Usage Guide</a>
- <b>智能扩写</b>：支持多种LLM模型（OpenAI、Mistral、Qwen等）对预设内容进行创意扩写<br>
<b>Intelligent Expansion:</b> Supports multiple LLM models (OpenAI, Mistral, Qwen, etc.) for creative expansion of preset content
- <b>灵活输出</b>：支持输出原始预设内容、完整信息或AI扩写后的内容<br>
<b>Flexible Output:</b> Supports output of original preset content, complete information, or AI-expanded content

<div align="left">
<a href="images/Kontext预设增强版节点展示.jpg" target="_blank">
<img src="images/Kontext预设增强版节点展示.jpg" alt="节点展示" width="45%" style="margin-right:5%"/>
</a>
<a href="images/Kontext预设增强版效果预览.jpg" target="_blank">
<img src="images/Kontext预设增强版效果预览.jpg" alt="效果展示" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>摄影提示词生成器</b><br><b>Photography Prompt Generator</b><br><code>PhotographPromptGenerator</code></td>
<td>

根据预设的摄影要素（如相机、镜头、光照、场景等）组合生成专业的摄影风格提示词。<br>Generates professional photography style prompts by combining preset photography elements (such as cameras, lenses, lighting, scenes, etc.).

<b>特点 | Features</b>：
- 支持从自定义文本文件加载选项，灵活扩展<br>
Supports loading options from custom text files for flexible expansion
- 支持随机选择，增加创意多样性<br>
Supports random selection to increase creative diversity
- 输出模板可自定义，适应不同的摄影风格需求<br>
Customizable output templates to adapt to different photography style requirements

<div align="left">
<a href="images/摄影提示词生成器.jpg" target="_blank">
<img src="images/摄影提示词生成器.jpg" alt="摄影提示词生成器" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>万相视频提示词生成器</b><br><b>🎬 Wan Prompt Generator</b><br><code>WanPromptGenerator</code></td>
<td>

基于万相2.2官方文档编写的全能型提示词生成器，支持自定义和预设两种组合方法，涵盖运镜、场景、光线、构图等16个维度的专业视频提示词生成。<br>Comprehensive prompt generator based on Wan 2.2 official documentation, supports both custom and preset combination methods, covering 16 professional dimensions including camera movement, scenes, lighting, composition for professional video prompt generation.

<b>特点 | Features</b>：
- <b>双模式切换</b>：支持自定义组合和预设组合模式，通过开关按钮一键切换<br>
<b>Dual Mode Switching:</b> Supports both custom and preset combination modes, one-click switching through toggle buttons
- <b>多维度选择</b>：涵盖主体类型、场景类型、光源类型、光线类型、时间段、景别、构图、镜头焦段、机位角度、镜头类型、色调、运镜方式、人物情绪、运动类型、视觉风格、特效镜头、动作姿势17个专业维度<br>
<b>Multi-dimensional Selection:</b> Covers 17 professional dimensions including subject type, scene type, light source type, lighting type, time period, shot size, composition, lens focal length, camera angle, lens type, color tone, camera movement, character emotion, motion type, visual style, special effects shots, action poses
- <b>智能扩写</b>：支持多种LLM模型（OpenAI、Claude、DeepSeek、Gemini等）免费在线扩写<br>
<b>Intelligent Expansion:</b> Supports multiple LLM models (OpenAI, Claude, DeepSeek, Gemini, etc.) for free online expansion

<div align="left">
<a href="images/万相视频提示词生成器.jpg" target="_blank">
<img src="images/万相视频提示词生成器.jpg" alt="万相视频提示词生成器" width="45%"/>
</a>
</div>
</td>
</tr>

<tr>
<td><b>提示词预设 - 单选</b><br><b>Prompt Preset - Single Choice</b><br><code>PromptPresetOneChoice</code></td>
<td>提供6个预设选项，用户可以方便地在不同预设之间切换。适合保存常用的提示词模板，快速应用到不同场景。<br>Provides 6 preset options, allowing users to conveniently switch between different presets. Suitable for saving commonly used prompt templates and quickly applying them to different scenarios.

<br>
<div align="left">
<a href="images/单选提示词预设.jpg" target="_blank">
<img src="images/单选提示词预设.jpg" alt="单选提示词预设" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>提示词预设 - 多选</b><br><b>Prompt Preset - Multiple Choice</b><br><code>PromptPresetMultipleChoice</code></td>
<td>支持同时选择多个预设，并将它们合并输出，每个预设都带有独立的开关和注释功能。适合构建复杂的组合提示词，灵活控制各部分的启用状态。<br>Supports simultaneous selection of multiple presets and merges them for output, with each preset having independent switches and annotation functionality. Suitable for building complex combined prompts and flexibly controlling the enabled state of each part.

<br>
<div align="left">
<a href="images/多选提示词预设.jpg" target="_blank">
<img src="images/多选提示词预设.jpg" alt="多选提示词预设" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>触发词合并器</b><br><b>Trigger Word Merger</b><br><code>TriggerWordMerger</code></td>
<td>将特定的触发词（Trigger Words）与主文本智能合并，并支持权重控制（例如 <code>(word:1.5)</code>）。适用于添加模型特定的触发词或风格词，并精确控制其影响强度。<br>Intelligently merges specific trigger words with main text, supporting weight control (e.g., <code>(word:1.5)</code>). Suitable for adding model-specific trigger words or style words with precise control over their influence strength.

<br>
<div align="left">
<a href="images/触发词合并器.jpg" target="_blank">
<img src="images/触发词合并器.jpg" alt="触发词合并器" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>系统引导词加载器</b><br><b>System Prompt Loader</b><br><code>SystemPromptLoader</code></td>
<td>从预设文件夹动态加载系统级引导词（System Prompt），并可选择性地与用户输入合并。适合管理和应用复杂的系统提示模板，提高生成结果的一致性和质量。<br>Dynamically loads system-level prompts from preset folders and can optionally merge with user input. Suitable for managing and applying complex system prompt templates to improve consistency and quality of generated results.<br><br>
<div align="left">
<a href="images/系统引导词加载器.jpg" target="_blank">
<img src="images/系统引导词加载器.jpg" alt="系统引导词加载器" width="45%"/>
</a>
</div>
</td>
</tr>

<tr>
<td><b>额外选项列表</b><br><b>Extra Options</b><br><code>ExtraOptions</code></td>
<td>一个通用的额外选项列表，类似于 JoyCaption 的设计，设有总开关和独立的引导词输入框。适合添加辅助提示或控制参数，增强工作流的灵活性。<br>A universal extra options list similar to JoyCaption's design, with master switch and independent prompt input boxes. Suitable for adding auxiliary prompts or control parameters to enhance workflow flexibility.<br><br>
<div align="left">
<a href="images/额外引导选项（通用）.jpg" target="_blank">
<img src="images/额外引导选项（通用）.jpg" alt="额外选项列表" width="45%"/>
</a>
</div></td>
</tr>
</table>

### 🖼️ 图像处理类节点 | Image Processing Nodes

<table>
<tr>
<th width="30%">节点名称 | Node Name</th>
<th>功能描述 | Function Description</th>
</tr>
<tr>
<td><b>图像宽高比设置</b><br><b>Image Aspect Ratio</b><br><code>ImageAspectRatio</code></td>
<td>智能图像宽高比设置工具，支持多种预设模式和自定义尺寸配置。<br>Intelligent image aspect ratio setting tool, supporting multiple preset modes and custom size configurations.

<b>特点 | Features</b>：
- <b>多预设支持</b>：内置Qwen、Flux、Wan、SDXL等主流模型的专用宽高比预设<br>
Built-in dedicated aspect ratio presets for mainstream models like Qwen, Flux, Wan, SDXL

- <b>自定义模式</b>：支持完全自定义的宽度和高度设置<br>
<b>Custom Mode:</b> Supports fully customizable width and height settings
- <b>宽高比锁定</b>：提供宽高比锁定功能，修改一个维度时自动调整另一个维度<br>
<b>Aspect Ratio Lock:</b> Provides aspect ratio lock function, automatically adjusts the other dimension when modifying one
- <b>智能切换</b>：根据选择的预设模式自动显示对应的宽高比选项<br>
<b>Smart Switching:</b> Automatically displays corresponding aspect ratio options based on selected preset mode

<br>
<div align="left">
<a href="images/图像宽高比设置1.jpg" target="_blank">
<img src="images/图像宽高比设置1.jpg" alt="图像宽高比设置1" width="30%"/>
</a>
<a href="images/图像宽高比设置2.jpg" target="_blank">
<img src="images/图像宽高比设置2.jpg" alt="图像宽高比设置2" width="30%"/>
</a>
<a href="images/图像宽高比设置3.jpg" target="_blank">
<img src="images/图像宽高比设置3.jpg" alt="图像宽高比设置3" width="30%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>图像缩放器</b><br><b>Image Scaler</b><br><code>ImageScaler</code></td>
<td>提供多种插值算法对图像进行缩放，并可选择保持原始宽高比。支持高质量的图像尺寸调整，适用于预处理或后处理阶段。<br>Provides multiple interpolation algorithms for image scaling with optional original aspect ratio preservation. Supports high-quality image size adjustment, suitable for preprocessing or post-processing stages.

<br>
<div align="left">
<a href="images/图像缩放器.jpg" target="_blank">
<img src="images/图像缩放器.jpg" alt="图像缩放器" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>颜色移除</b><br><b>Color Removal</b><br><code>ColorRemoval</code></td>
<td>从图像中移除彩色，输出灰度图像。适用于创建黑白效果或作为特定图像处理流程的预处理步骤。<br>Removes color from images and outputs grayscale images. Suitable for creating black and white effects or as a preprocessing step for specific image processing workflows.<br><br>
<a href="images/颜色移除节点展示.jpg" target="_blank"><img src="images/颜色移除节点展示.jpg" alt="颜色移除节点展示" width="400"/></a></td>
</tr>
<tr>
<td><b>图像旋转工具</b><br><b>Image Rotate Tool</b><br><code>ImageRotateTool</code></td>
<td>

专业的图像旋转和翻转工具，支持预设角度和自定义角度旋转。<br>Professional image rotation and flip tool supporting preset angles and custom angle rotation.

<b>特点 | Features</b>：
- <b>预设旋转</b>：提供90°、180°、270°、360°快速旋转选项<br>
Preset Rotation: Provides 90°, 180°, 270°, 360° quick rotation options
- <b>翻转功能</b>：支持垂直翻转和水平翻转操作<br>
<b>Flip Functions:</b> Supports vertical flip and horizontal flip operations
- <b>自定义角度</b>：支持-360°到360°范围内的精确角度旋转<br>
<b>Custom Angle:</b> Supports precise angle rotation within -360° to 360° range
- <b>画布处理</b>：可选择扩展画布或裁剪空白两种处理模式<br>
<b>Canvas Processing:</b> Optional expand canvas or crop blank processing modes
- <b>批量处理</b>：支持批量图像的同时处理<br>
<b>Batch Processing:</b> Supports simultaneous processing of batch images

<br>
<div align="left">
<a href="images/Image Rotate Tool.jpg" target="_blank">
<img src="images/Image Rotate Tool.jpg" alt="图像旋转工具" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>图像预览/对比</b><br><b>Preview or Compare Images</b><br><code>PreviewOrCompareImages</code></td>
<td>多功能图像预览和对比节点，支持单张图像预览或两张图像的并排对比显示。image_1为必需输入，image_2为可选输入，当提供两张图像时自动启用对比模式。<br>Multi-functional image preview and comparison node that supports single image preview or side-by-side comparison of two images. image_1 is required input, image_2 is optional input, automatically enables comparison mode when two images are provided.

<b>特点 | Features</b>：
- <b>双模式智能切换</b>：根据输入单图或双图自动切换预览或对比模式<br>
<b>Dual-mode Smart Switching:</b> Automatically switches between preview or comparison mode based on single or dual image inputs
- <b>交互式对比</b>：鼠标悬停时显示滑动分割线进行直观对比<br>
<b>Interactive Comparison:</b> Shows sliding divider for intuitive comparison when mouse hovers over the node

<br>
<div align="left">
<a href="images/图像对比.jpg" target="_blank">
<img src="images/图像对比.jpg" alt="图像预览对比" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>图像格式转换器</b><br><b>Image Format Converter</b><br><code>ImageFormatConverter</code></td>
<td>

专业的图像格式转换工具，支持批量转换多种图像格式，具备智能格式检测和高级压缩选项。<br>Professional image format conversion tool supporting batch conversion of multiple image formats with intelligent format detection and advanced compression options.

<b>支持格式 | Supported Formats</b>：
- <b>输出格式</b>：JPEG、PNG、WEBP、BMP、TIFF<br>
Output Formats: JPEG, PNG, WEBP, BMP, TIFF
- <b>输入格式</b>：自动检测所有常见图像格式<br>
Input Formats: Automatically detects all common image formats

<b>特点 | Features</b>：
- <b>批量处理</b>：支持文件夹批量转换，自动创建输出目录<br>
<b>Batch Processing:</b> Supports folder batch conversion with automatic output directory creation
- <b>质量控制</b>：1-100可调质量参数，精确控制文件大小和画质<br>
Quality Control: Adjustable quality parameter from 1-100 for precise control of file size and image quality
- <b>高级选项</b>：支持优化压缩、渐进式编码、无损压缩<br>
<b>Advanced Options:</b> Supports optimization compression, progressive encoding, and lossless compression
- <b>智能检测</b>：基于文件内容而非扩展名的格式检测<br>
<b>Smart Detection:</b> Format detection based on file content rather than file extension
- <b>详细报告</b>：提供转换过程的详细信息和统计数据<br>
Detailed Reports: Provides detailed information and statistics of the conversion process

<br>
<div align="left">
<a href="images/Image Format Converter.jpg" target="_blank">
<img src="images/Image Format Converter.jpg" alt="图像格式转换器" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### 🎞️ 电影后期处理类节点 | Film Post-processing Nodes

<table>
<tr>
<th width="30%">节点名称 | Node Name</th>
<th>功能描述 | Function Description</th>
</tr>
<tr>
<td><b>胶片颗粒效果</b><br><b>Film Grain</b><br><code>FilmGrain</code></td>
<td>

为图像添加逼真的胶片颗粒效果，营造经典胶片质感。<br>Adds realistic film grain effects to images, creating classic film texture.
- <b>双分布模式</b>：支持高斯分布（自然胶片噪点）和平均分布（数字均匀噪点）<br>
<b>Dual Distribution Modes</b>: Supports Gaussian distribution (natural film noise) and uniform distribution (digital uniform noise)

- <b>饱和度混合</b>：独立控制彩色/单色颗粒比例，实现从彩色胶片到黑白胶片的平滑过渡<br>
<b>Saturation Blending</b>: Independent control of color/monochrome grain ratio, achieving smooth transition from color film to black and white film

<br>
<div align="left">
<a href="images/胶片颗粒.jpg" target="_blank">
<img src="images/胶片颗粒.jpg" alt="胶片颗粒效果" width="45%"/>
</a>
</div>
</td>
</tr>

<tr>
<td><b>拉普拉斯锐化</b><br><b>Laplacian Sharpen</b><br><code>LaplacianSharpen</code></td>
<td>
基于拉普拉斯算子的边缘锐化工具，通过二阶微分检测图像边缘并增强细节，适合风景和人像的细节增强。<br>Edge sharpening tool based on Laplacian operator, detects image edges through second-order derivatives and enhances details, suitable for landscape and portrait detail enhancement.

<br>
<div align="left">
<a href="images/拉普拉斯锐化.jpg" target="_blank">
<img src="images/拉普拉斯锐化.jpg" alt="拉普拉斯锐化" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>

<td><b>索贝尔锐化</b><br><b>Sobel Sharpen</b><br><code>SobelSharpen</code></td>
<td>
采用索贝尔算子的方向性锐化工具，通过梯度计算同时增强水平和垂直边缘，适合需要强调纹理的场景。<br>Directional sharpening tool using Sobel operator, enhances both horizontal and vertical edges through gradient calculation, suitable for scenes requiring texture emphasis.

<br>
<div align="left">
<a href="images/索贝尔锐化.jpg" target="_blank">
<img src="images/索贝尔锐化.jpg" alt="索贝尔锐化" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>USM锐化</b><br><b>USM Sharpen</b><br><code>USMSharpen</code></td>
<td>
使用经典USM锐化技术来增强细节，对目标图像进行自然的锐化处理。<br>Uses classic USM sharpening technology to enhance details, providing natural sharpening processing for target images.

<br>
<div align="left">
<a href="images/USM锐化.jpg" target="_blank">
<img src="images/USM锐化.jpg" alt="USM锐化" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>色彩匹配</b><br><b>Color Match to Reference</b><br><code>ColorMatchToReference</code></td>
<td>
智能色彩匹配工具，可将参考图像的色调风格应用到目标图像，实现专业级色彩统一。<br>Intelligent color matching tool that applies the color style of reference images to target images, achieving professional-level color unification.

<br>
<div align="left">
<a href="images/颜色匹配.jpg" target="_blank">
<img src="images/颜色匹配.jpg" alt="色彩匹配" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### 🎵 音乐相关节点 | Music Related Nodes

<table>
<tr>
<th width="30%">节点名称 | Node Name</th>
<th>功能描述 | Function Description</th>
</tr>
<tr>
<td><b>Suno歌词生成器</b><br><b>Suno Lyrics Generator</b><br><code>SunoLyricsGenerator</code></td>
<td>
专业的AI歌词创作工具，基于在线LLM生成结构化的可演唱歌词，支持多种音乐风格和语言。<br>Professional AI lyrics creation tool that generates structured, singable lyrics based on online LLM, supporting multiple music styles and languages.

<br>
<div align="left">
<a href="images/Lyrics Generator.jpg" target="_blank">
<img src="images/Lyrics Generator.jpg" alt="Suno歌词生成器" width="45%"/>
</a>
</div>

</td>
</tr>
<tr>
<td><b>Suno歌曲风格提示词生成器</b><br><b>Suno Song Style Prompt Generator</b><br><code>SunoSongStylePromptGenerator</code></td>
<td>
专业的歌曲风格提示词生成工具，结合用户偏好和音乐元素，生成结构化的Suno风格提示词，用于快速构建风格一致的歌曲。<br>Professional song style prompt generation tool that combines user preferences and musical elements to generate structured Suno style prompts for quickly building stylistically consistent songs.

<br>
<div align="left">
<a href="images/Song Style Prompt Generator.jpg" target="_blank">
<img src="images/Song Style Prompt Generator.jpg" alt="Suno歌曲风格提示词生成器" width="45%"/>
</a>
</div>

</td>
</tr>
</table>

### 📁 模型加载器类节点 | Model Loader Nodes

<table>
<tr>
<th width="30%">节点名称 | Node Name</th>
<th>功能描述 | Function Description</th>
</tr>
<tr>
<td><b>自由检查点加载器</b><br><b>Free Checkpoint Loader</b><br><code>FreeCheckpointLoader</code></td>
<td>
突破传统限制的高级模型加载器，支持自定义路径管理和动态模型发现，通过Web界面实现路径的添加和管理。<br>An advanced model loader that breaks through traditional limitations, supporting custom path management and dynamic model discovery. Paths can be added and managed through a web interface.
<b>核心功能 | Core Features</b>：
- <b>自定义路径支持</b>：通过Web界面添加和管理任意路径下的模型文件<br>
 <b>Custom Path Support:</b> Add and manage model files in arbitrary paths through web interface
- <b>智能路径扫描</b>：自动扫描指定路径发现可用模型并更新列表<br>
 <b>Intelligent Path Scanning:</b> Automatically scans specified paths to discover available models and update the list

<br>
<div align="left">
<a href="images/Free Checkpoint Loader1.jpg" target="_blank">
<img src="images/Free Checkpoint Loader1.jpg" alt="自由检查点加载器1" width="45%"/>
</a>
<a href="images/Free Checkpoint Loader2.jpg" target="_blank">
<img src="images/Free Checkpoint Loader2.jpg" alt="自由检查点加载器2" width="45%"/>
</a>
</div>

</td>
</tr>
</table>

### 🤖 AI视觉理解节点 | AI Vision Understanding Nodes

<table>
<tr>
<th width="30%">节点名称 | Node Name</th>
<th>功能描述 | Function Description</th>
</tr>
<tr>
<td><b>Qwen3-VL基础版</b><br><b>Qwen3-VL Basic</b><br><code>Qwen3VLBasic</code></td>
<td>
基于阿里巴巴Qwen3-VL模型的基础视觉理解节点，提供简洁高效的图像和视频分析功能，支持多种模型版本和量化选项，为Qwen3-VL高级版简化而来的版本。<br>The foundational visual understanding node based on the Qwen3-VL model delivers streamlined and efficient image and video analysis capabilities. It supports multiple model variants and quantization options, serving as a simplified version derived from the Qwen3-VL Advanced Edition.

<br>
<div align="left">
<a href="images/Qwen3-VL Basic.jpg" target="_blank">
<img src="images/Qwen3-VL Basic.jpg" alt="Qwen3-VL基础版" width="45%"/>
</a>
</div>
</td>
</tr>

<tr>
<td><b>Qwen3-VL高级版</b><br><b>Qwen3-VL Advanced</b><br><code>Qwen3VLAdv</code></td>
<td>
基于阿里巴巴Qwen3-VL模型的专业级视觉理解节点，集成众多预设提示词模板，支持智能批量处理、高级量化技术和思维链推理功能。提供从标签生成到创意分析的多种预设模式，具备解锁限制、多语言输出、批量处理等高级特性。<br>A professional-grade visual understanding node based on Alibaba's Qwen3-VL model, integrating numerous preset prompt templates. It supports intelligent batch processing, advanced quantization techniques, and chain-of-thought reasoning capabilities. Offering multiple preset modes from label generation to creative analysis, it features advanced functionalities such as unlocking restrictions, multilingual output, and batch processing.

**参数详解文档 | Parameter Guide**: [Qwen3VL_Parameters_Guide.md](doc/Qwen3VL_Parameters_Guide.md)

<br>
<div align="left">
<a href="images/Qwen3VL高级版.jpg" target="_blank">
<img src="images/Qwen3VL高级版.jpg" alt="Qwen3-VL Advanced" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Qwen3-VL在线版</b><br><b>Qwen3-VL API</b><br><code>Qwen3VLAPI</code></td>
<td>
功能强大的云端视觉理解节点，支持多平台在线API调用和批量图像分析，提供丰富的模型选择和灵活的配置方式。<br>Powerful cloud-based vision understanding node supporting multi-platform online API calls and batch image analysis, offering rich model selection and flexible configuration options.

<b>支持平台 | Supported Platforms</b>：
- <b>硅基流动平台、魔搭社区平台、自定义API</b>
SiliconFlow, ModelScope, Custom API

<b>核心特点 | Key Features</b>：
- <b>云端部署</b>：无需本地GPU，通过API调用云端模型<br>
Cloud Deployment: No local GPU required, access cloud models via API
- <b>双重配置模式</b>：平台预设和完全自定义两种模式<br>
Dual Configuration Modes: Platform presets and fully custom configuration modes
- <b>批量处理</b>：支持文件夹批量处理，自动保存结果<br>
Batch Processing: Supports folder batch processing with automatic result saving

<br>
<div align="left">
<a href="images/Qwen3-VL API.jpg" target="_blank">
<img src="images/Qwen3-VL API.jpg" alt="Qwen3-VL在线版" width="45%"/>
</a>
<a href="images/Qwen3-VL API2.jpg" target="_blank">
<img src="images/Qwen3-VL API2.jpg" alt="Qwen3-VL在线版2" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Qwen3-VL额外选项</b><br><b>Qwen3-VL Extra Options</b><br><code>Qwen3VLExtraOptions</code></td>
<td>
为Qwen3-VL节点提供详细的输出控制选项，包括人物信息、光照分析、相机角度、水印检测等高级配置参数。<br>Provides detailed output control options for Qwen3-VL nodes, including character information, lighting analysis, camera angles, watermark detection and other advanced configuration parameters.

<br>
<div align="left">
<a href="images/Qwen3VL额外选项.jpg" target="_blank">
<img src="images/Qwen3VL额外选项.jpg" alt="Qwen3-VL Extra Options" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Qwen3-VL图像加载器</b><br><b>Qwen3-VL Image Loader</b><br><code>ImageLoader</code></td>
<td>
专为Qwen3-VL优化的图像加载节点，支持多种图像格式和批量加载功能。<br>Image loader node optimized for Qwen3-VL, supporting multiple image formats and batch loading functionality.

<br>
<div align="left">
<a href="images/Qwen3-VL Image Loader.jpg" target="_blank">
<img src="images/Qwen3-VL Image Loader.jpg" alt="Qwen3-VL Image Loader" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Qwen3-VL视频加载器</b><br><b>Qwen3-VL Video Loader</b><br><code>VideoLoader</code></td>
<td>
专为Qwen3-VL优化的视频加载节点，支持多种视频格式和帧提取功能。<br>Video loader node optimized for Qwen3-VL, supporting multiple video formats and frame extraction functionality.

<br>
<div align="left">
<a href="images/Qwen3-VL Video Loader.jpg" target="_blank">
<img src="images/Qwen3-VL Video Loader.jpg" alt="Qwen3-VL Video Loader" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Qwen3-VL多路径输入</b><br><b>Qwen3-VL Multiple Paths Input</b><br><code>MultiplePathsInput</code></td>
<td>
支持同时处理多个文件路径的输入节点，便于批量处理图像和视频文件。<br>Input node that supports processing multiple file paths simultaneously, facilitating batch processing of image and video files.

<br>
<div align="left">
<a href="images/Qwen3-VL Multiple Paths Input.jpg" target="_blank">
<img src="images/Qwen3-VL Multiple Paths Input.jpg" alt="Qwen3-VL Multiple Paths Input" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Qwen3-VL路径切换器</b><br><b>Qwen3-VL Path Switch</b><br><code>PathSwitch</code></td>
<td>
双通道路径切换器，支持手动和自动两种切换模式。可在2个来自MultiplePathsInput节点的路径输入之间智能切换，支持注释标签便于管理。手动模式下可指定选择通道，自动模式下智能选择第一个非空输入，适用于工作流中的条件分支和动态切换。输出可直接连接到Qwen3-VL高级版的source_path输入。<br>Dual-channel path switcher supporting both manual and automatic switching modes. Can intelligently switch between 2 path inputs from MultiplePathsInput nodes, with annotation labels for easy management. Manual mode allows specifying channel selection, while automatic mode intelligently selects the first non-empty input, suitable for conditional branching and dynamic switching in workflows. Output can be directly connected to Qwen3-VL Advanced's source_path input.

<br>
<div align="left">
<a href="images/Qwen3-VL Path Switch.jpg" target="_blank">
<img src="images/Qwen3-VL Path Switch.jpg" alt="Qwen3-VL Path Switch" width="45%"/>
</a>
</div>
</td>
</tr>

<tr>
<td><b>Sa2VA高级版</b><br><b>Sa2VA Advanced</b><br><code>Sa2VAAdvanced</code></td>
<td>
基于字节跳动Sa2VA模型的专业级图像分割节点，提供精确的智能分割功能，支持多种模型版本和量化配置。通过自然语言提示词控制分割区域，实现对图像中特定对象的精准分割，输出高质量的遮罩数据。<br>Professional-grade image segmentation node based on ByteDance's Sa2VA model, providing precise intelligent segmentation capabilities. Supports multiple model variants and quantization configurations. Controls segmentation regions through natural language prompts, achieving precise segmentation of specific objects in images and outputting high-quality mask data.

<b>核心功能 | Core Features</b>：
- <b>智能分割</b>：基于自然语言提示词进行精确的图像对象分割<br>
<b>Intelligent Segmentation:</b> Precise image object segmentation based on natural language prompts
- <b>多模型支持</b>：支持多种Sa2VA模型版本，包括InternVL3和Qwen系列<br>
<b>Multi-Model Support:</b> Supports various Sa2VA model variants, including InternVL3 and Qwen series
- <b>量化优化</b>：提供4bit和8bit量化选项，优化性能和资源使用<br>
<b>Quantization Optimization:</b> Provides 4bit and 8bit quantization options to optimize performance and resource usage
- <b>Flash Attention</b>：支持Flash Attention技术，提升推理效率<br>
<b>Flash Attention:</b> Supports Flash Attention technology to improve inference efficiency
- <b>模型管理</b>：内置模型下载和管理功能，支持本地缓存<br>
<b>Model Management:</b> Built-in model download and management functionality with local caching support
<br>
<div align="left">
<a href="images/Sa2VA Advanced1.jpg" target="_blank">
<img src="images/Sa2VA Advanced1.jpg" alt="Sa2VA高级版-界面1" width="45%"/>
</a>
<a href="images/Sa2VA Advanced2.jpg" target="_blank">
<img src="images/Sa2VA Advanced2.jpg" alt="Sa2VA高级版-界面2" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Sa2VA分割预设</b><br><b>Sa2VA Segmentation Preset</b><br><code>Sa2VASegmentationPreset</code></td>
<td>
提供交互式分割预设选择的工具节点，可在界面中选择常见部位/对象并生成中文分割提示文本输出，用于驱动 Sa2VA 高级版的分割。将本节点的 <code>segmentation_preset</code> 输出连接到 Sa2VA 高级版的同名输入即可生效。若该输入为空，Sa2VA 高级版将改用字符串输入框中的 <code>segmentation_prompt</code>。<br>
Tool node that provides interactive segmentation preset selection. Choose common parts/objects in UI to generate a Chinese segmentation prompt text, which drives Sa2VA Advanced. Connect this node's <code>segmentation_preset</code> output to the same-named input of Sa2VA Advanced. If that input is empty, Sa2VA Advanced falls back to the string input <code>segmentation_prompt</code>.

<br>
<div align="left">
<a href="images/Sa2VA Segmentation Preset.jpg" target="_blank">
<img src="images/Sa2VA Segmentation Preset.jpg" alt="Sa2VA分割预设" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### ⚙️ 逻辑与工具类节点 | Logic and Utility Nodes

<table>
<tr>
<th width="30%">节点名称 | Node Name</th>
<th>功能描述 | Function Description</th>
</tr>
<tr>
<td><b>🏷️TAG标签选择器</b><br><b>Tag Selector</b><br><code>TagSelector</code></td>
<td>

新一代智能标签管理系统，集成海量预设标签库、自定义标签功能和内置AI扩写能力，提供前所未有的标签选择体验，快速构建复杂提示词，提升创作效率。<br>Next-generation intelligent tag management system, integrating massive preset tag library, custom tag functionality, and built-in AI expansion capabilities, providing an unprecedented tag selection experience, quickly building complex prompts and improving creative efficiency.

<b>核心功能 | Core Features</b>：
- <b>标签分类丰富：</b>涵盖常规标签、艺术题材、人物属性、场景环境等全方位分类<br>
<b>Comprehensive Tag Categories:</b> Covers comprehensive categories including general tags, artistic themes, character attributes, scene environments, etc.
- <b>自定义标签管理：</b>支持添加、编辑、删除个人专属标签，打造个性化标签库<br>
<b>Custom Tag Management:</b> Support adding, editing, and deleting personal exclusive tags, building personalized tag library
- <b>智能搜索定位：</b>支持关键词搜索，快速找到目标标签<br>
<b>Smart Search & Positioning:</b> Keyword search support, quickly find target tags
- <b>实时选择统计：</b>动态显示已选标签数量和详细列表<br>
<b>Real-time Selection Statistics:</b> Dynamically display selected tag count and detailed list
- <b>随机标签生成：</b>智能随机标签生成功能，支持按分类权重和数量配置自动生成多样化标签组合<br>
<b>Random Tag Generation:</b> Intelligent random tag generation, supporting automatic generation of diverse tag combinations based on category weights and quantity configuration
- <b>内置AI扩写 | Built-in AI Expansion</b>：一键智能扩写功能，支持标签式和自然语言式两种扩写模式<br>One-click intelligent expansion feature, supporting both tag-style and natural language expansion modes
<br>
<div align="left">
<a href="images/TAG标签选择器2.jpg" target="_blank">
<img src="images/TAG标签选择器2.jpg" alt="TAG标签选择器2" width="45%"/>
<a href="images/TAG标签选择器.jpg" target="_blank">
<img src="images/TAG标签选择器.jpg" alt="TAG标签选择器" width="45%"/>
</a>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Latent切换器(双模式)</b><br><b>Latent Switch Dual Mode</b><br><code>LatentSwitchDualMode</code></td>
<td>支持3个Latent输入的双模式切换器，可通过下拉菜单手动选择输出，或启用自动模式智能检测单个有效输入。<br>Supports 3 Latent inputs with dual-mode switching, can manually select output through dropdown menu, or enable auto mode to intelligently detect single valid input.

<br>
<div align="left">
<a href="images/Latent切换器.jpg" target="_blank">
<img src="images/Latent切换器.jpg" alt="Latent切换器" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>文本切换器(双模式)</b><br><b>Text Switch Dual Mode</b><br><code>TextSwitchDualMode</code></td>
<td>支持4个文本输入的双模式切换器，可通过下拉菜单手动选择输出，或启用自动模式智能检测单个有效输入。便于在不同版本的提示词之间快速切换，进行对比实验。<br>Supports 4 text inputs with dual-mode switching, can manually select output through dropdown menu, or enable auto mode to intelligently detect single valid input. Convenient for quickly switching between different versions of prompts for comparison experiments.

<br>
<div align="left">
<a href="images/文本切换器.jpg" target="_blank">
<img src="images/文本切换器.jpg" alt="文本切换器" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>图像切换器(双模式)</b><br><b>Image Switch Dual Mode</b><br><code>ImageSwitchDualMode</code></td>
<td>支持在2个或4个图像输入之间进行切换的双模式切换器，可通过下拉菜单手动选择输出，或启用自动模式智能检测单个有效输入。便于比较不同生成结果或应用不同的图像处理路径。<br>Supports switching between 2 or 4 image inputs with dual-mode switching, can manually select output through dropdown menu, or enable auto mode to intelligently detect single valid input. Convenient for comparing different generation results or applying different image processing paths.

<br>
<div align="left">
<a href="images/图像切换器.jpg" target="_blank">
<img src="images/图像切换器.jpg" alt="图像切换器2路" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>优先级图像切换</b><br><b>Priority Image Switch</b><br><code>PriorityImageSwitch</code></td>
<td>智能优先级图像切换节点，当同时接入图像A和图像B端口时，优先输出B端口的内容；如果B端口无输入，则输出图像A端口的内容；如果两个端口都无输入，则弹出提示要求至少连接一个输入端口。<br>Intelligent priority image switching node. When both image A and image B ports are connected, it prioritizes output from port B; if port B has no input, it outputs from image A port; if both ports have no input, it prompts to connect at least one input port.

<b>特点 | Features</b>：
- <b>优先级控制</b>：图像B端口优先级高于图像A端口<br>
<b>Priority Control:</b> Image B port has higher priority than image A port
- <b>智能切换</b>：自动检测输入状态，无缝切换输出，减少手动切换操作<br>
<b>Smart Switching:</b> Automatically detects input status, seamlessly switches output, reducing manual switching operations

<br>
<div align="left">
<a href="images/优先级图像切换.jpg" target="_blank">
<img src="images/优先级图像切换.jpg" alt="优先级图像切换" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>百度翻译</b><br><b>Baidu Translate</b><br><code>BaiduTranslate</code></td>
<td>

提供在线翻译服务，支持中英文互译和源语言自动检测。<br>Provides online translation services, supporting bidirectional Chinese-English translation and automatic source language detection.

<b>密钥加载</b>：
- <b>明文加载</b>：直接在节点中输入 <code>APP_ID</code> 和 <code>API_KEY</code><br>
<b>Plain Text Loading:</b> Directly input <code>APP_ID</code> and <code>API_KEY</code> in the node

- <b>后台加载</b>：从配置文件读取密钥，保护隐私安全<br>
<b>Background Loading:</b> Read keys from configuration file to protect privacy and security

<b>注意</b>：
- 需在<a href="https://api.fanyi.baidu.com/">百度翻译开放平台</a>注册并获取密钥<br>
<b>Note:</b> Need to register and obtain keys at <a href="https://api.fanyi.baidu.com/">Baidu Translate Open Platform</a>

- 使用此节点需要网络连接<br>Network connection required for this node
- 后台加载方式需要先修改配置文件"baidu_translate_config.json"后重启ComfyUI。（配置文件路径：...\custom_nodes\zhihui_nodes_comfyui\Nodes\Translate）<br>Background loading requires modifying the configuration file "baidu_translate_config.json" before restarting ComfyUI. (Config file path: ...\custom_nodes\zhihui_nodes_comfyui\Nodes\Translate)

<div align="left">
<a href="images/百度翻译.jpg" target="_blank">
<img src="images/百度翻译.jpg" alt="百度翻译" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>免费在线翻译</b><br><b>Free Online Translate</b><br><code>FreeTranslate</code></td>
<td>

免费在线翻译服务，支持中英文双向翻译和自动语言检测。<br>Free online translation service supporting bidirectional Chinese-English translation and automatic language detection.

<b>特点 | Features</b>：
- <b>免费使用</b>：无需注册或API密钥，开箱即用<br>
<b>Free to Use:</b> No registration or API key required, ready to use out of the box

- <b>多模型支持</b>：提供11种AI模型选择（OpenAI、Claude、DeepSeek、Gemini等）<br>
Multi-model Support: Provides 11 AI model options (OpenAI, Claude, DeepSeek, Gemini, etc.)
- <b>注意</b>：使用此节点需要网络连接<br>
<b>Note: </b>Network connection required for this node

<div align="left">
<a href="images/中英文翻译器.jpg" target="_blank">
<img src="images/中英文翻译器.jpg" alt="免费在线翻译" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>腾讯翻译</b><br><b>Tencent Translater</b><br><code>TencentTranslater</code></td>
<td>

使用腾讯云翻译API进行文本翻译，支持自动语言检测和中英文互译。<br>Uses Tencent Cloud Translation API for text translation, supporting automatic language detection and bidirectional Chinese-English translation.

<b>特点 | Features</b>：
- <b>高质量翻译</b>：基于腾讯云专业翻译引擎，提供准确可靠的翻译结果<br>
<b>High-Quality Translation:</b> Based on Tencent Cloud professional translation engine, providing accurate and reliable translation results

- <b>简单易用</b>：无需配置API密钥，开箱即用<br>
<b>Simple to Use:</b> No API key configuration required, ready to use out of the box

- <b>注意</b>：使用此节点需要网络连接<br>
<b>Note:</b> Network connection required for this node

<div align="left">
<a href="images/腾讯翻译.jpg" target="_blank">
<img src="images/腾讯翻译.jpg" alt="腾讯翻译" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>本地文件画廊</b><br><b>Local File Gallery</b><br><code>LocalFileGallery</code></td>
<td>

本地文件浏览和选择工具，提供直观的文件管理界面，支持图片和文本文件的预览与选择。<br>Local file browsing and selection tool, providing an intuitive file management interface, supporting preview and selection of image and text files.

<b>支持格式 | Supported Formats</b>：
- <b>图片格式 | Image Formats</b>：jpg, jpeg, png, bmp, gif, webp
- <b>文本格式 | Text Formats</b>：txt, json, js

<b>特点 | Features</b>：
- <b>可视化界面</b>：提供友好的文件浏览器界面<br>
<b>Visual Interface:</b> Provides a user-friendly file browser interface
- <b>缩略图支持</b>：快速预览图片内容<br>
<b>Thumbnail Support:</b> Quick preview of image content

<div align="left">
<a href="images/本地文件画廊.jpg" target="_blank">
<img src="images/本地文件画廊.jpg" alt="本地文件画廊" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>工作流暂停器</b><br><b>Pause Workflow</b><br><code>PauseWorkflow</code></td>
<td>

智能工作流控制节点，可在任意位置暂停工作流执行，等待用户交互后继续或取消执行。<br>Intelligent workflow control node that can pause workflow execution at any point, waiting for user interaction to continue or cancel execution.

<b>特点 | Features</b>：
- <b>通用输入</b>：支持任意类型的数据输入和输出，可插入工作流的任何位置<br>
<b>Universal Input:</b> Supports any type of data input and output, can be inserted at any position in the workflow
- <b>交互式控制</b>：提供继续和取消两个操作选项<br>
<b>Interactive Control:</b> Provides continue and cancel operation options
- <b>状态管理</b>：智能管理每个节点实例的暂停状态<br>
<b>State Management:</b> Intelligently manages the pause state of each node instance
- <b>异常处理</b>：取消时抛出中断异常，安全终止工作流<br>
<b>Exception Handling:</b> Throws interrupt exception when cancelled, safely terminates workflow

</td>
</tr>
</table>

---

## 🚀 安装方式 | Installation

### 📦 通过 ComfyUI Manager 安装（推荐） | Install via ComfyUI Manager (Recommended)

1. 安装 [ComfyUI Manager](https://github.com/ltdrdata/ComfyUI-Manager)<br>Install [ComfyUI Manager](https://github.com/ltdrdata/ComfyUI-Manager)

2. 在 Manager 菜单中选择 "Install Custom Nodes"<br>Select "Install Custom Nodes" in Manager menu
3. 搜索 `zhihui_nodes_comfyui`（暂未支持） ，或通过 Git URL 进行安装：<br>Search for `zhihui_nodes_comfyui` (not yet supported), or install via Git URL:
   ```
   https://github.com/ZhiHui6/zhihui_nodes_comfyui.git
   ```
4. 点击 "Install" 按钮并等待安装完成<br>Click "Install" button and wait for installation to complete
5. 重启 ComfyUI，即可在节点菜单中找到新添加的节点<br>Restart ComfyUI, and you can find the newly added nodes in the node menu

### 🔧 手动安装 | Manual Installation

1. 下载本仓库的 ZIP 文件或通过 Git 克隆：<br>Download the ZIP file of this repository or clone via Git:
   ```bash
   git clone https://github.com/ZhiHui6/zhihui_nodes_comfyui.git
   ```
   
2. 将整个 `zhihui_nodes_comfyui` 文件夹解压或复制到 ComfyUI 的 `custom_nodes` 目录下<br>Extract or copy the entire `zhihui_nodes_comfyui` folder to ComfyUI's `custom_nodes` directory
3. 重启 ComfyUI<br>Restart ComfyUI

---

### 📋 依赖项 | Dependencies

本节点集大部分功能无需额外依赖，开箱即用。部分在线功能（如翻译、提示词优化）需要网络连接。<br>Most functions of this node collection require no additional dependencies and are ready to use out of the box. Some online functions (such as translation and prompt optimization) require network connection.

如需手动安装依赖，可执行：<br>If you need to manually install dependencies, you can execute:

```bash
pip install -r requirements.txt
```
## 🤝 贡献指南 | Contribution Guide

我们欢迎各种形式的贡献，包括但不限于：<br>We welcome all forms of contributions, including but not limited to:
<div align="left">
[🔴报告问题和提出建议 ] | [💡提交功能请求] | [📚改进文档] | [💻提交代码贡献]<br>

[Report issues and suggestions] | [Submit feature requests] | [Improve documentation] | [Submit code contributions]
</div>

如果您有任何想法或建议，请随时提出 Issue 或 Pull Request。<br>If you have any ideas or suggestions, please feel free to submit an Issue or Pull Request.
