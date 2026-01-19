# 更新日志

## 1.0.3 2026-1-19
- 新增资源清理节点(ResourceCleaner)：用于清理ComfyUI运行过程中产生的缓存文件、内存占用、显存占用，释放系统资源。
    <br>
- Added ResourceCleaner node: cleans cache files, RAM, and VRAM generated during ComfyUI runtime to free up system resources.

## 1.0.2 2026-1-18
- 更新图像宽高比节点(ImageAspectRatio)：添加 Flux.2 和 Flux2 klein 预设尺寸选项
- 优化摄影提示词生成器节点(PhotographPromptGenerator)：优化了相机和镜头选项列表
    <br>
- Updated ImageAspectRatio node: added Flux.2 and Flux2 klein preset size options  
- Refined PhotographPromptGenerator node: improved camera and lens option lists

## 1.0.1 2026-1-11
- 升级摄影提示词生成器节点(PhotographPromptGenerator)：
  - 摄影类标签选择方式更改为 全新Web风格操作界面，可便捷地在界面上进行选择丰富的选项
  - 优化模版预设，覆盖更广泛的摄影场景
    <br>
- Upgraded PhotographPromptGenerator node:
  - Replaced photography tag selection with a brand-new web-style UI, allowing easy selection of rich options
  - Refined template presets to cover a wider range of photography scenarios

## 1.0.0 2026-1-3
- 修复PhotographPromptGenerator和ImageAspectRatio节点的已知问题。
    <br>
- Fixed known issues in PhotographPromptGenerator and ImageAspectRatio nodes.

## 0.9.9 2025-12-31
- 添加文本合并器节点(TextMergerNode)节点用于合并多个文本输入
    <br>
- Added TextMergerNode for merging multiple text inputs

## 0.9.8 2025-12-29
- ImageAspectRatio节点：添加新的Z-image预设尺寸集合
- PromptCardSelector节点：更新一组卡池文件
- 修正Qwen3VLAdvanced节点加载视频时的报错问题。
    <br>
- ImageAspectRatio node: added new Z-image preset size collection
- PromptCardSelector node: updated a set of card pool files
- Fixed the error when Qwen3VLAdvanced node loads videos.

## 0.9.7 2025-12-26
- 升级摄影提示词生成器节点(PhotographPromptGenerator)：
  - 重构全新调用逻辑接口，用于获取和管理摄影提示词用户或预设分类标签选项
  - 新增输出模式选项(output_mode)：可切换输出Tags或Template内容
  - 新增扩写模式选项(expand_mode)：关闭、中文扩写和英文扩写
  - 新增模版助手界面，用于根据用户输入的模版和分类标签生成完整的摄影提示词
  - 新增用户选项编辑界面，用于管理自定义分类标签选项
  - 新增用户数据导入导出功能，用于备份和恢复用户的自定义数据。
      <br>
  - Upgraded PhotographPromptGenerator node:
  - Refactored the calling logic interface to get and manage photography prompt user or preset category tag options
  - Added output_mode option: can switch to output Tags or Template content
  - Added expand_mode option: off, Chinese expand, and English expand
  - Added template assistant interface to generate complete photography prompts based on user input templates and category tags
  - Added user options editing interface to manage custom category tag options
  - Added user data import/export function to backup and restore user custom data.

## 0.9.6 - 2025-12-20
- Qwen3VLBasic,Qwen3VLAdvanced：添加模型ID和量化跟踪以优化模型加载
- SystemPromptLoader节点：新增《提示词工程师智能体》预设文本
    <br>
- Qwen3VLBasic, Qwen3VLAdvanced: add model-ID and quantization tracking to optimize model loading
- SystemPromptLoader node: add preset text "Prompt-Engineer Agent"

## v0.9.5 - 2025-12-19
- 标签选择器节点(TagSelector)：添加用户标签备份与恢复功能
    <br>
- TagSelector node: added user tag backup and restore functionality

## v0.9.4 - 2025-12-18
- 系统提示词加载器节点(SystemPromptLoader)：
  - 新增预设文本"通用中文反推提示词工程"
- 标签选择器节点(TagSelector)：
  - 新增删除所有标签功能
  - 调整优化界面部分元素
  - 重构并升级标签编辑界面功能
  - 随机标签界面现已集成到主导航菜单
- Qwen3VL在线版节点(Qwen3VLAPI) ：
  - 新增配置信息导入、导出功能
    <br>
- SystemPromptLoader node:
  - Added preset text "Universal Chinese Reverse-Prompt Engineering"
- TagSelector node:
  - Added delete all tags functionality
  - Adjusted and optimized some UI elements
  - Refactored and upgraded the tag-editing UI
  - Random-tag UI is now integrated into the main navigation menu
- Qwen3VLAPI node:
  - Added import / export functionality for configuration data

## v0.9.3 - 2025-12-11
- 多平台翻译器节点(MultiPlatformTranslate)：设置界面新增备份和导入按钮
- 图片宽高比节点(ImageAspectRatio)：在自定义尺寸选项中新增“互换宽高”功能按钮
  <br>
- Multi-platform translator node: added backup and import buttons in the settings UI.
- Image aspect ratio node: added a "swap width & height" button in the custom size options.

## v0.9.2 - 2025-12-9
- 新增多平台翻译器：支持百度、阿里云、有道、智谱AI和免费。
- 移除旧的腾讯翻译、百度翻译和免费翻译节点。
- 更新本地化文件和README文档
- PromptCardSelector节点添加“游戏提示词卡”资源文件。
    <br>
- Added multi-platform translator: supports Baidu, Alibaba Cloud, Youdao, Zhipu AI and free options.
- Removed legacy Tencent, Baidu and free translation nodes.
- Updated localization files and README documentation.
- PromptCardSelector node added “Game Prompt Cards” resource file.

## v0.9.1 - 2025-12-6
- PromptCardSelector 节点添加全局通知系统用于显示操作反馈和实现用户词卡打包备份与恢复功能。
  <br>
- PromptCardSelector node adds a global notification system for displaying operation feedback and implements user prompt-card pack backup & restore functionality.

## v0.9.0 - 2025-12-5
- 优化、修复PromptCardSelector节点：添加卡池文件数统计，提供者、版本号信息等。
- SystemPrompt节点新增文本：Prompt优化师、Veo3分镜分析与提示词、视频分析与复刻。
- 更新README。
  <br>
- Optimized and fixed PromptCardSelector node: added card pool file count statistics, provider and version information.
- Added new text to SystemPrompt node: Prompt Optimizer, Veo3 Storyboard Analysis and Prompts, Video Analysis and Replication
- Updated README

## v0.8.9 - 2025-12-2
- 修复 Image/Latent/Text Switch Dual Mode节点注释栏的无故隐藏问题
- 新增 TextSwitchDualMode 节点：文本切换器（双模式）
  <br>
- fix the issue that the comment area of Image/Latent/Text Switch Dual Mode node is hidden unexpectedly
- add the TextSwitchDualMode node: text switcher (dual mode)


## v0.8.8 - 2025-12-1
- 新增PromptCardSelector提示词卡选择器节点（内置卡池）
- Qwen3-VL API节点增加“移除思考标签”按钮
  <br>
- Added PromptCardSelector prompt card selector node (with built-in card pool)
The number of Qwen3-VL API nodes has increased
- Added "Remove Thought Label" button to Qwen3-VL API node


## v0.8.6 - 2025-11-28
- 修复Qwen3VL高级版、基础版模型下载存放路径问题
- 修复图像、文本、潜空间切换器端口输入BUG，增加端口连接提醒窗体。
- 更新Readme文档
- 更新本地化中文汉化文件
- 新增 TextModifier 节点的清理功能按钮：移除空行、空格和换行符
  <br>
- Fixed the issue of the download and storage paths for the advanced and basic models of Qwen3VL
- Fixed the input bugs of image, text, and latent space switcher ports, and added a port connection reminder form.
- Update the Readme document
- Update the localized Chinese translation file

## v0.8.4 - 2025-11-26
- 修复Text Switch Dual Mode 节点输入端口数量超过2个时，会导致节点运行错误的问题
  <br>
- fix the Text Switch Dual Mode node issue that the number of input ports exceeds 2

## v0.8.3 - 2025-11-25
- 更新 中文本地化文件 以及 README
- 新增 Qwen3VL 高级节点（`Qwen3VLAdvanced`）与基本节点（`Qwen3VLBasic`）的模型管理功能；全新的模型卸载卸载方法
- 更新 工作流模版
  <br>
- Update chinese localization files and README
- New Qwen3VL advanced node and basic node model management features;new model unloading methods
- Update workflow template

## v0.8.2 - 2025-11-23
- 新增 BatchLoadingOfImages 节点：批量加载图像
- 优化 ImageSwitchDualMode、TextSwitchDualMode 和 LatentSwitchDualMode 的自动模式切换逻辑
- 修复 Qwen3VL API 配置管理器的恢复默认配置功能
- 新增 Kontext watermark removal 工作流模版
  <br>
- Add BatchLoadingOfImages node for batch image loading
- Optimize auto-mode switching logic for ImageSwitchDualMode, TextSwitchDualMode, and LatentSwitchDualMode
- Fix the "restore defaults" feature in Qwen3VL API configuration manager
- Add Kontext watermark removal workflow template

## v0.8.1 - 2025-11-21
- 更新 Text/Image/Latent 双模式切换器：支持可变输入数量，自动模式冲突时给出明确端口提示与解决方案；同步更新中文本地化与 README 描述
  <br>
- Update Text/Image/Latent Dual Mode Switchers: support dynamic number of inputs; in auto mode, provide clear port hints and solutions on conflicts; update Chinese localization and README descriptions accordingly

## v0.8.0 - 2025-11-18
- 新增 Sa2VA 高级图像分割节点与分割预设（`Sa2VAAdvanced`、`Sa2VASegmentationPreset`）
- 更新中文本地化文件与 README
- 修复 Qwen3VL API 中 `final_prompt` 缩进问题 <br>

- Add Sa2VA Advanced image segmentation node and segmentation presets (`Sa2VAAdvanced`, `Sa2VASegmentationPreset`)
- Update Chinese localization files and README
- Fix indentation issue of `final_prompt` in Qwen3VL API

## v0.7.1 - 2025-11-12
- 更新 README 与工作流配置
  <br>
- Update README and workflow configuration

## v0.7.0 - 2025-11-12
- 更新中文本地化文件与 README，添加工作流封面图片
- 优化 Qwen3VL API 配置管理逻辑 
  <br>
- Update Chinese localization files and README; add workflow cover images
- Optimize configuration management logic of Qwen3VL API

## v0.6.1 - 2025-11-08
- 新增 Zhi.AI Qwen3-VL 3in1 工作流
  <br>
- Add Zhi.AI Qwen3-VL 3in1 workflow

## v0.6.0 - 2025-11-07
- 为图像与视频加载器添加启用节点功能（后续因复杂错误部分回退 enable_node 参数）
- 更新 Qwen3-VL API：新增“激进创意”和“尺寸限制”功能
- 添加新的工作流文件并清理旧工作流
- 更新中文本地化文件
  <br>
- Add enable-node functionality to image and video loaders (partially reverted later due to complex errors)
- Update Qwen3-VL API: add "radical creativity" and "size limit" features
- Add new workflow files and clean up old workflows
- Update Chinese localization files

## v0.5.2 - 2025-11-04
- Qwen3-VL API 更新：新增 `llm_mode` 选项支持纯文本对话
- 重构 API 调用逻辑为 OpenAI SDK 兼容模式
- 依赖新增：`openai>=1.0.0`
  <br>
- Qwen3-VL API: add `llm_mode` option to support text-only conversation
- Refactor API calling logic to OpenAI SDK–compatible mode
- Add dependency: `openai>=1.0.0`

## v0.5.1 - 2025-11-04
- 修正 ModelScope 平台 LLM 模式连接错误
  <br>
- Fix connection error in ModelScope platform LLM mode

## v0.4.5 - 2025-11-02
- Qwen3-VL API：删减配置文件的更新记录信息
- 修正批量模式互斥逻辑
  <br>
- Qwen3-VL API: trim update record info in config file
- Fix mutual exclusion logic in batch mode

## v0.4.4 - 2025-11-01
- Qwen3-VL API 节点添加阿里云平台支持并更新模型配置
- 修复“完全自定义”模式中的调用逻辑错误
  <br>
- Qwen3-VL API node: add support for Alibaba Cloud and update model config
- Fix calling logic error in "Fully Custom" mode

## v0.4.3 - 2025-10-31
- 修复 Qwen3VLBasic 中“移除思考标签”功能报错
- API 配置管理 UI 增加“恢复默认”按钮
- 优化按钮悬停效果与布局
  <br>
- Fix error in "Remove Think Tags" feature of Qwen3VLBasic
- API configuration management UI: add "Restore defaults" button
- Optimize button hover effects and layout

## v0.4.2 - 2025-10-31
- 重构 Qwen3-VL API 节点：
  - 支持平台预设与完全自定义模式
  - 新增 API 配置管理界面（模型选择与密钥管理）
  - 修正批量模式图片输入错误
- 更新 README 与工作流配置
  <br>
- Refactor Qwen3-VL API node:
  - Support platform presets and fully custom mode
  - Add API configuration management UI (model selection and key management)
  - Fix image input error in batch mode
- Update README

## v0.4.1 - 2025-10-30
- Qwen3VLAPI 节点添加“配置 API 密钥”按钮与后台接口
- 系统提示词加载器新增模板文件
- 更新工作流
  <br>
- Qwen3VLAPI node: add "Configure API key" button and backend endpoint
- SystemPromptLoader: add a new template file
- Update workflows

## v0.4.0 - 2025-10-30
- 新增 Qwen3-VL API 在线调用节点
- 重构 Qwen3-VL 高级版节点，添加“思考内容去除”功能
- 统一所有节点分类前缀为 `Zhi.AI`
- 更新 README
- 修复 Qwen3-VL 系列图片输入错误
  <br>
- Add Qwen3-VL API online invocation node
- Refactor Qwen3-VL Advanced node; add "remove thinking content" feature
- Unify category prefix for all nodes as `Zhi.AI`
- Update README
- Fix image input errors across Qwen3-VL series

## v0.3.0 - 2025-05-24
- 新增系统提示词加载器（SystemPromptLoader）并初始化预设文件
- 更新 README
  <br>
- Add SystemPromptLoader and initialize preset files
- Update README

## v0.2.5 - 2025-05-18
- 更新 ExtraOptions 描述性选项并新增多个文本预设
- 将 `RETURN_NAMES` 从“输出文本”改为“引导输出”
  <br>
- Update ExtraOptions descriptive options; add multiple text presets
- Change `RETURN_NAMES` from "Output text" to "Guided output"

## v0.2.4 - 2025-05-13
- 重构图像切换器模块并更新类别名称
  <br>
- Refactor Image Switcher module and update category names

## v0.2.3 - 2025-05-09
- 重构代码结构并优化文件组织
- 更新 README
  <br>
- Refactor code structure and optimize file organization
- Update README

## v0.2.2 - 2025-05-03
- 新增提示词优化器节点
  <br>
- Add Prompt Optimizer node

## v0.2.1 - 2025-04-29
- 新增颜色跟踪器节点（将目标图像颜色特征迁移到模仿图像）
- 新增四路图像切换功能
  <br>
- Add Color Tracker node (transfer color features from target image to mimic image)
- Add four-way image switch feature

## v0.2.0 - 2025-04-26
- 移除未使用的节点映射配置
- 将 PhotographPromptGenerator 与视频处理相关文件迁移至新的子目录并更新导入路径
- 合并远程分支更新
- 更新 README
  <br>
- Remove unused node mapping configuration
- Move PhotographPromptGenerator and video-processing-related files to a new subdirectory and update import paths
- Merge updates from remote branch
- Update README

## v0.1.2 - 2025-04-24
- 上传增量文件
  <br>
- Upload incremental files

## v0.1.1 - 2025-04-21
- 更新 README
- 上传增量文件
  <br>
- Update README
- Upload incremental files

## v0.1.0 - 2025-04-20
- 项目初始化与基础文件提交
- 更新 README
  <br>
- Project initialization and base file submission
- Update README