# 节点汉化安装指南
### ⚠️安装前请先删除已停止维护的旧版汉化扩展"AIGODLIKE-ComfyUI-Translation"，否则会导致冲突。
## 1.安装ComfyUI-DD-Translation节点

**方法1：Git安装（推荐）**
直接在Manager或启动器中使用git进行安装：
```
https://github.com/1761696257/ComfyUI-DD-Translation.git
```

**方法2：直接下载安装**
1. 下载本项目
2. 将整个文件夹放入 ComfyUI 的 custom_nodes 目录下
3. 重启 ComfyUI

## 2.安装汉化文件

**方法1：自动安装（推荐）**

双击运行项目根目录下的 `自动汉化节点.bat` 脚本进行一键安装。

**方法2：手动安装**

### 菜单汉化文件
- **源文件：** `Chinese_Localization_Files\zhihui_nodes_comfyui.json`
- **目标位置：** `ComfyUI\custom_nodes\ComfyUI-DD-Translation\zh-CN\Menus\`

### 节点汉化文件
- **源文件：** `Chinese_Localization_Files\zhihui_nodes_translation.json`
- **目标位置：** `ComfyUI\custom_nodes\ComfyUI-DD-Translation\zh-CN\Nodes\`

## 3.启用汉化

完成汉化文件部署后，按以下步骤启用中文界面：

1. 重启ComfyUI
2. 在ComfyUI界面中找到语言设置选项
3. 选择"中文(简体)"或"zh-CN"
4. 刷新页面或重启ComfyUI使设置生效