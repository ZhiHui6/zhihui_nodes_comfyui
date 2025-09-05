# 汉化文件简要指南

节点包中的"Chinese_Localization_Files"文件夹提供的汉化文件用于将"zhihui_nodes_comfyui"节点包在ComfyUI中的显示界面转换为中文。

## 前置要求

### 1. 安装ComfyUI-DD-Translation节点

**安装步骤：**
- 方法1:
1. 下载本项目
2. 将整个文件夹放入 ComfyUI 的 custom_nodes 目录下
3. 重启 ComfyUI

- 方法2（推荐）： 直接在Manager或启动器中使用git进行安装
```
https://github.com/1761696257/ComfyUI-DD-Translation.git
```

- 方法3（推荐）： 直接在Manager中搜索插件名称安装

## 汉化文件部署

### 2. 放置汉化文件

本项目提供了两个汉化文件，需要分别放置到ComfyUI-DD-Translation的对应目录：

#### 菜单汉化文件
- **源文件：** `zhihui_nodes_comfyui.json`
- **目标位置：** `ComfyUI\custom_nodes\ComfyUI-DD-Translation\zh-CN\Menus\`

#### 节点汉化文件
- **源文件：** `zhihui_nodes_translation.json`
- **目标位置：** `ComfyUI\custom_nodes\ComfyUI-DD-Translation\zh-CN\Nodes\`

## 使用说明

### 4. 启用汉化

1. 重启ComfyUI
2. 在ComfyUI界面中找到语言设置
3. 选择"中文(简体)"或"zh-CN"
4. 刷新页面或重启ComfyUI

---

*本指南适用于智慧节点包(zhihui_nodes_comfyui)的汉化部署*

---

# Localization Files Quick Guide (English)

## Purpose of Localization Files

This project provides localization files to convert the zhihui_nodes_comfyui interface in ComfyUI to Chinese:

- **zhihui_nodes_comfyui.json** - Menu localization file, responsible for Chinese display of node categories and menu items
- **zhihui_nodes_translation.json** - Node localization file, responsible for Chinese translation of node titles, descriptions, input/output parameters, etc.

Through these two files, users can use all smart node functions in Chinese interface in ComfyUI, improving user experience.

## Prerequisites

### 1. Install ComfyUI-DD-Translation Node

Since this node cannot be installed through conventional methods, you need to manually enter the address in ComfyUI Manager:

```
https://github.com/Dontdrunk/ComfyUI-DD-Translation
```

**Installation Steps:**
1. Open ComfyUI Manager
2. Select "Install via Git URL" or similar option
3. Enter the above GitHub address
4. Wait for installation to complete
5. Restart ComfyUI

## Localization File Deployment

### 2. Place Localization Files

This project provides two localization files that need to be placed in the corresponding directories of ComfyUI-DD-Translation:

#### Menu Localization File
- **Source File:** `e:\ComfyUI\custom_nodes\zhihui_nodes_comfyui\Chinese_Localization_Files\zhihui_nodes_comfyui.json`
- **Target Location:** `ComfyUI-DD-Translation\zh-CN\Menus\`

#### Node Localization File
- **Source File:** `e:\ComfyUI\custom_nodes\zhihui_nodes_comfyui\Chinese_Localization_Files\zhihui_nodes_translation.json`
- **Target Location:** `ComfyUI-DD-Translation\zh-CN\Nodes\`

### 3. Complete Path Example

Assuming ComfyUI is installed in `E:\ComfyUI`, the complete paths are:

```
# Menu localization file
E:\ComfyUI\custom_nodes\ComfyUI-DD-Translation\zh-CN\Menus\zhihui_nodes_comfyui.json

# Node localization file
E:\ComfyUI\custom_nodes\ComfyUI-DD-Translation\zh-CN\Nodes\zhihui_nodes_translation.json
```

## Usage Instructions

### 4. Enable Localization

1. Restart ComfyUI
2. Find language settings in ComfyUI interface
3. Select "Chinese (Simplified)" or "zh-CN"
4. Refresh page or restart ComfyUI

### 5. Verify Results

After successful localization, all nodes in the smart node package will display Chinese names and descriptions:
- Node titles will display in Chinese
- Input/output ports display Chinese labels
- Node descriptions and help information display in Chinese
- Preset options display Chinese names

## Notes

- Ensure ComfyUI-DD-Translation node is correctly installed
- Localization file paths must be accurate
- ComfyUI needs to be restarted after modifying localization files for changes to take effect
- If localization doesn't work, check file paths and JSON format

## Troubleshooting

**Localization not working:**
1. Check if ComfyUI-DD-Translation is correctly installed
2. Confirm localization file paths are correct
3. Verify JSON file format is correct
4. Restart ComfyUI

**Some nodes not localized:**
1. Check if zhihui_nodes_translation.json file is complete
2. Confirm node names match the key names in localization file

---

*This guide applies to the localization deployment of zhihui_nodes_comfyui (Smart Nodes Package)*