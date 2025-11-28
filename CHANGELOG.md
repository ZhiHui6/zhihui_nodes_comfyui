# 更新日志

## v0.8.5 - 2025-11-28
- 修复Qwen3VL高级版、基础版模型下载存放路径问题
- 修复图像、文本、潜空间切换器端口输入BUG，增加端口连接提醒窗体。
- 更新Readme文档
- 更新本地化中文汉化文件
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

## v0.5.0 - 2025-11-03


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