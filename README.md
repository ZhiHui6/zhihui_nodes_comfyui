# 🎨 zhihui-nodes-comfyui
[![GitHub](https://img.shields.io/badge/GitHub-zhihui--nodes--comfyui-blue?style=for-the-badge&logo=github)](https://github.com/ZhiHui6/zhihui-nodes-comfyui) [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE) [![ComfyUI](https://img.shields.io/badge/ComfyUI-Compatible-orange?style=for-the-badge)](https://github.com/comfyanonymous/ComfyUI)
---

## 📖 项目介绍

这是一个由<span style="color: red;"> **潪绘·Binity** </span>精心创建的 ComfyUI 自定义节点工具合集项目，旨在为用户提供一系列实用、高效的节点，以增强和扩展 ComfyUI 的功能。本节点集涵盖文本处理、提示词优化、图像处理等多个方面，为您的 AI 创作提供全方位支持。

### ✨ 主要特点

- 🔄 **双语翻译服务**：集成百度翻译API和免费在线翻译，支持中英文双向转换和自动语言检测
- 📝 **全面文本处理**：提供多行文本编辑、文本合并分离、内容提取修改、语言过滤等5类文本操作节点
- 🎯 **智能提示词系统**：包含Kontext预设库、摄影风格生成器、系统引导词加载器等等专业的提示词生成工具
- 🖼️ **实用图像工具**：支持多算法图像缩放、智能切换检测、颜色移除等等
- 🧩 **即插即用设计**：20个独立功能节点，可单独使用或自由组合构建复杂AI工作流

## ⭐ 明星节点

🔥 **<span style="color: #FF6B35; font-weight: bold; font-size: 1.1em;">以下是本节点集中重点推荐的特色节点：</span>**

<table>
<tr>
<th width="25%">节点名称</th>
<th width="15%">类别</th>
<th>核心功能</th>
<th width="15%">推荐指数</th>
</tr>

<tr>
<td><b>🎯 Kontext预设增强版</b><br><code>LoadKontextPresetsPlus</code></td>
<td>提示词处理</td>
<td>内置20+创意预设的Kontext图像编辑预设工具，支持用户自定义预设扩展，集成多种LLM模型免费在线智能扩写。</td>
<td>⭐⭐⭐⭐⭐</td>
</tr>

<tr>
<td><b>🤖 系统引导词加载器</b><br><code>SystemPromptLoader</code></td>
<td>提示词处理</td>
<td>专业系统引导词预设工具，内置众多类别模板，输出引导内容给下游LLM节点生成专业的提示词。</td>

<td>⭐⭐⭐⭐⭐</td>
</tr>

<tr>
<td><b>📸 摄影提示词生成器</b><br><code>PhotographPromptGenerator</code></td>
<td>提示词处理</td>
<td>专业摄影风格提示词生成器，涵盖人物、场景、镜头、光线等15个维度，一键生成专业摄影提示词。</td>
<td>⭐⭐⭐⭐</td>
</tr>

<tr>
<td><b>🔍 额外引导选项</b><br><code>ExtraOptions</code></td>
<td>提示词处理</td>
<td>类似JoyCaption额外选项的通用式图像反推辅助，集成了5种反推类型，提供26个精细化选项开关。</td>
<td>⭐⭐⭐⭐</td>
</tr>
</table>

> 💡 **使用建议**：新用户建议从 **Kontext预设增强版** 和 **摄影提示词生成器** 开始体验，这两个节点能够快速提升您的创作效率和作品质量。

---

## 🚀 安装方式

### 📦 通过 ComfyUI Manager 安装（推荐）

1. 安装 [ComfyUI Manager](https://github.com/ltdrdata/ComfyUI-Manager)
2. 在 Manager 菜单中选择 "Install Custom Nodes"
3. 搜索 `zhihui-nodes-comfyui`（暂未支持） ，或通过 Git URL 进行安装：
   ```
   https://github.com/ZhiHui6/zhihui-nodes-comfyui.git
   ```
4. 点击 "Install" 按钮并等待安装完成
5. 重启 ComfyUI，即可在节点菜单中找到新添加的节点

### 🔧 手动安装

1. 下载本仓库的 ZIP 文件或通过 Git 克隆：
   ```bash
   git clone https://github.com/ZhiHui6/zhihui-nodes-comfyui.git
   ```
2. 将整个 `zhihui-nodes-comfyui` 文件夹解压或复制到 ComfyUI 的 `custom_nodes` 目录下
3. 重启 ComfyUI

### 📋 依赖项

本节点集大部分功能无需额外依赖，开箱即用。部分在线功能（如翻译、提示词优化）需要网络连接。

如需手动安装依赖，可执行：

```bash
pip install -r requirements.txt
```

---

## 🛠️ 节点功能说明

本节点集包含 20 个功能各异的节点，分为以下几个主要类别：

### 📝 文本处理类节点

<table>
<tr>
<th width="30%">节点名称</th>
<th>功能描述</th>
</tr>
<tr>
<td><b>多行文本</b><br><code>MultiLineTextNode</code></td>
<td>提供一个支持多行输入的文本框，并带有语法高亮和注释功能，支持变量替换。适用于编写复杂提示词或保存多个文本片段。</td>
</tr>
<tr>
<td><b>文本组合</b><br><code>TextCombinerNode</code></td>
<td>合并两个文本输入，并可通过独立的开关控制每个文本的输出。可用于动态组合不同的提示词部分，灵活构建完整提示。</td>
</tr>
<tr>
<td><b>文本修改器</b><br><code>TextModifier</code></td>
<td>根据指定的起始和结束标记提取文本内容，并自动去除多余的空白字符。适合从复杂文本中提取特定部分，或进行格式清理。</td>
</tr>
<tr>
<td><b>文本提取器</b><br><code>TextExtractor</code></td>
<td>从混合文本中提取纯中文或纯英文字符，支持标点和数字的提取，并自动清理格式。对于处理双语提示词或分离不同语言内容非常有用。</td>
</tr>
<tr>
<td><b>文本切换器</b><br><code>TextSwitch</code></td>
<td>在两个文本输入之间进行切换，可通过下拉菜单选择输出，并支持添加注释。便于在不同版本的提示词之间快速切换，进行对比实验。</td>
</tr>
</table>

### 💡 提示词处理类节点

<table>
<tr>
<th width="30%">节点名称</th>
<th>功能描述</th>
</tr>
<tr>
<td><b>Kontext预设基础版</b><br><code>LoadKontextPresetsBasic</code></td>
<td>提供专业的图像变换预设库，包含13项专业预设。为图像生成提供风格化指导，帮助用户快速应用常见的艺术风格和效果。</td>
</tr>
<tr>
<td><b>Kontext预设增强版</b><br><code>KontextPresetsPlus</code></td>
<td>

提供专业的图像变换预设，内置免费在线扩写功能，支持用户自定义预设，为图像编辑提供创意指导。

<b>特点</b>：
- <b>丰富预设库</b>：包含20余项专业预设
- <b>双预设库</b>：支持默认预设和用户自定义预设，用户可自由新增更多创意预设，通过分类标识区分预设来源
- <b>智能扩写</b>：支持多种LLM模型（OpenAI、Mistral、Qwen等）对预设内容进行创意扩写
- <b>灵活输出</b>：支持输出原始预设内容、完整信息或AI扩写后的内容

<div align="center">
<a href="预览图/Kontext预设增强版节点展示.jpg" target="_blank">
<img src="预览图/Kontext预设增强版节点展示.jpg" alt="节点展示" width="45%" style="margin-right:5%"/>
</a>
<a href="预览图/Kontext预设增强版效果预览.jpg" target="_blank">
<img src="预览图/Kontext预设增强版效果预览.jpg" alt="效果展示" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>摄影提示词生成器</b><br><code>PhotographPromptGenerator</code></td>
<td>

根据预设的摄影要素（如相机、镜头、光照、场景等）组合生成专业的摄影风格提示词。

<b>特点</b>：
- 支持从自定义文本文件加载选项，灵活扩展
- 支持随机选择，增加创意多样性
- 输出模板可自定义，适应不同的摄影风格需求
</td>
</tr>
<tr>
<td><b>万相视频提示词生成器</b><br><code>WanPromptGenerator</code></td>
<td>

基于万相2.2官方文档编写的全能型提示词生成器，支持自定义和预设两种组合方法，涵盖运镜、场景、光线、构图等16个维度的专业视频提示词生成。

<b>特点</b>：
- <b>双模式切换</b>：支持自定义组合和预设组合模式，通过开关按钮一键切换
- <b>丰富预设</b>：内置5种预设组合（电影级画面、动作风格、记录风格、浪漫风格、恐怖风格）
- <b>多维度选择</b>：涵盖主体类型、场景类型、光源类型、光线类型、时间段、景别、构图、镜头焦段、机位角度、镜头类型、色调、运镜方式、人物情绪、运动类型、视觉风格、特效镜头16个专业维度
- <b>智能扩写</b>：支持多种LLM模型（OpenAI、Claude、DeepSeek、Gemini等）免费在线扩写
- <b>补充提示词</b>：设有支持多行文本输入的提示词输入框，用户可以在框中输入自定义的文本，会被追加到原文中。
</td>
</tr>
<tr>
<td><b>提示词优化器</b><br><code>PromptOptimizer</code></td>
<td>

在线智能扩写和优化用户输入的提示词，无需本地硬件支持。

<b>模式</b>：提供标准、详细和自定义三种扩写模式，满足不同复杂度的需求。
<b>语言</b>：支持中英文双语输出，适应全球用户。
</td>
</tr>
<tr>
<td><b>提示词预设 - 单选</b><br><code>PromptPresetOneChoice</code></td>
<td>提供6个预设选项，用户可以方便地在不同预设之间切换。适合保存常用的提示词模板，快速应用到不同场景。</td>
</tr>
<tr>
<td><b>提示词预设 - 多选</b><br><code>PromptPresetMultipleChoice</code></td>
<td>支持同时选择多个预设，并将它们合并输出，每个预设都带有独立的开关和注释功能。适合构建复杂的组合提示词，灵活控制各部分的启用状态。</td>
</tr>
<tr>
<td><b>触发词合并器</b><br><code>TriggerWordMerger</code></td>
<td>将特定的触发词（Trigger Words）与主文本智能合并，并支持权重控制（例如 <code>(word:1.5)</code>）。适用于添加模型特定的触发词或风格词，并精确控制其影响强度。</td>
</tr>
<tr>
<td><b>系统引导词加载器</b><br><code>SystemPromptLoader</code></td>
<td>从预设文件夹动态加载系统级引导词（System Prompt），并可选择性地与用户输入合并。适合管理和应用复杂的系统提示模板，提高生成结果的一致性和质量。</td>
</tr>
</table>

### 🖼️ 图像处理类节点

<table>
<tr>
<th width="30%">节点名称</th>
<th>功能描述</th>
</tr>
<tr>
<td><b>图像缩放器</b><br><code>ImageScaler</code></td>
<td>提供多种插值算法对图像进行缩放，并可选择保持原始宽高比。支持高质量的图像尺寸调整，适用于预处理或后处理阶段。</td>
</tr>
<tr>
<td><b>图像切换器</b><br><code>ImageSwitch</code></td>
<td>支持在2个或4个图像输入之间进行切换，通过下拉菜单选择输出。便于比较不同生成结果或应用不同的图像处理路径。</td>
</tr>
<tr>
<td><b>自动图像检测器</b><br><code>AutoImageSwitch</code></td>
<td>自动检测多个输入端口中哪一个有图像输入，并将其无缝输出到下游节点。简化工作流程设计，减少手动切换操作。<br><b>注意</b>：仅支持单端口有图像输入的场景，多端口同时输入会报错。</td>
</tr>
<tr>
<td><b>颜色移除</b><br><code>ColorRemoval</code></td>
<td>从图像中移除彩色，输出灰度图像。适用于创建黑白效果或作为特定图像处理流程的预处理步骤。<br><br>
<a href="预览图/去色节点展示.png" target="_blank"><img src="预览图/去色节点展示.png" alt="颜色移除节点展示" width="400"/></a></td>
</tr>
</table>

### ⚙️ 逻辑与工具类节点

<table>
<tr>
<th width="30%">节点名称</th>
<th>功能描述</th>
</tr>
<tr>
<td><b>额外选项列表</b><br><code>ExtraOptions</code></td>
<td>一个通用的额外选项列表，类似于 JoyCaption 的设计，设有总开关和独立的引导词输入框。适合添加辅助提示或控制参数，增强工作流的灵活性。</td>
</tr>
<tr>
<td><b>百度翻译</b><br><code>BaiduTranslateNode</code></td>
<td>

提供在线翻译服务，支持中英文互译和源语言自动检测。

<b>密钥加载</b>：
- <b>明文加载</b>：直接在节点中输入 <code>APP_ID</code> 和 <code>API_KEY</code>
- <b>后台加载</b>：从配置文件读取密钥，保护隐私安全

<b>注意</b>：
- 需在<a href="https://api.fanyi.baidu.com/">百度翻译开放平台</a>注册并获取密钥
- 使用此节点需要网络连接
</td>
</tr>
<tr>
<td><b>中英文互译器 测试版</b><br><code>TranslateNodeBeta</code></td>
<td>

免费在线翻译服务，支持中英文双向翻译和自动语言检测。

<b>特点</b>：
- <b>免费使用</b>：无需注册或API密钥，开箱即用
- <b>多模型支持</b>：提供多种AI模型选择（OpenAI、Gemini、DeepSeek等）
</td>
</tr>
</table>

---

## 🤝 贡献指南

我们欢迎各种形式的贡献，包括但不限于：

> 🔴 报告问题和提出建议
> 💡 提交功能请求
> 📚 改进文档
> 💻 提交代码贡献

如果您有任何想法或建议，请随时提出 Issue 或 Pull Request。

---

## 🎉 感谢使用 zhihui-nodes-comfyui
如果这个项目对您有帮助，请给我们一个 ⭐**Star**！您的支持是我们持续改进的动力。