# zhihui_nodes_comfyui 自定义节点集

## 项目介绍
这是一个由“潪绘”所开发的ComfyUI自定义节点包项目，目前包含八个模块。

## 节点功能说明

### 1.视频批量加载器 (Video Batch Loader)
**功能**：批量加载视频文件夹中的视频并提取帧序列
- 支持模式：单视频选择/顺序播放/随机播放
- 自动记忆最后访问目录
- 支持自定义帧尺寸调整

### 2.视频合并器 (Video Combine)
**功能**：将图像序列合并为视频文件
- 支持格式：MP4/AVI/MKV/MOV/WMV
- 支持乒乓播放效果
- 自定义输出路径

### 3.图像缩放器 (ImageScaler)
**功能**：
- 支持多种插值算法的图像缩放
- 保持宽高比调整
- 批量处理能力

### 4.多行文本节点 (MultiLineTextNode)
**功能**：
- 带注释的多行文本输入框
- 支持变量替换
- 文本语法高亮

### 5.提示词合并器 (TextCombinerNode)
**功能**: 
- 合并文本
**使用场景**: 
- 需要合并两个文本时使用

### 6.触发词合并器 (TriggerWordMerger)
**功能**：
- 将触发词与输入文本智能合并
- 自动处理分隔符
- 支持多行输入
- 可显示token计数

### 7.文本修改器（TextModifier）
**功能**：
- 支持基于起始/结束标记的文本提取
- 自动去除结果中的空白字符
**使用场景**：
- 从大段文本中提取特定标记之间的内容
- 移除文本中的特定前缀或后缀

### 8.提示预设选择器 多选（PromptPresetMultipleChoice）
**功能**：
- 支持10个预设选择
- 支持开关控制
- 支持注释
- 设有上游输入端口

### 9.提示预设选择器（PromptPreset）
**功能**：
- 支持10个预设选择
- 支持注释
- 可切换预设
**使用场景**: 
- 需要从多个预设中选择提示时使用

## 安装要求
- ComfyUI 最新版本
- 视频处理依赖：OpenCV (包含在requirements.txt)

## 安装方式
### 通过 ComfyUI Manager 安装（推荐）
1. 安装ComfyUI管理器 Manager
2. 在 Manager 中“通过Git URL安装”
3. 输入 https://github.com/ZhiHui6/zhihui-nodes-comfyui.git
4. 点击 Install 安装
5. 重启ComfyUI
6. 在ComfyUI的节点选项卡中，你应该可以看到新添加的节点。

### 手动安装
1. 下载整个节点文件夹
2. 将整个自定义节点文件夹 comfyui_zhihui_nodes 复制到ComfyUI的 custom_nodes 目录下
3. 重启ComfyUI
4. 在ComfyUI的节点选项卡中，你应该可以看到新添加的节点。

## 致谢
本项目中的一些节点借鉴了以下项目，感谢他们在开源社区中的贡献！
- [**JioJe**] https://github.com/JioJe/comfyui_video_BC
