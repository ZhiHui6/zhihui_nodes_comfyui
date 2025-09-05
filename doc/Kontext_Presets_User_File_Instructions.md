# 用户预设文件使用说明

## 概述

`user_presets.txt` 文件允许您创建和管理自己的自定义预设，这些预设将与默认预设一起显示在节点界面中。

## 文件格式

用户预设文件使用 JSON 格式，结构如下：

```json
{
  "预设集": [
    {
      "name": "预设名称",
      "brief": "预设的详细描述或指令"
    },
    {
      "name": "个人艺术风格",
      "brief": "Transform the image into my personal artistic style with vibrant colors, dynamic composition, and expressive brushstrokes that capture emotion and movement."
    }
  ]
}
```

## 使用方法

1. **编辑预设文件**：直接编辑 `user_presets.txt` 文件(位于`.../custom_nodes/zhihui_nodes_comfyui/Nodes/KontextPresets/KontextPresetsPlus`目录下)
2. **添加新预设**：在 `预设集` 数组中添加新的预设对象
3. **修改现有预设**：直接修改对应预设的 `name` 或 `brief` 字段
4. **保存文件**：确保文件保存为 UTF-8 编码
5. **重启 ComfyUI**：修改完成后，需要重启 ComfyUI 才能使新预设生效

## 显示效果

- 默认预设显示为：`[默认] 预设名称`
- 用户预设显示为：`[用户] 预设名称`

## 注意事项

1. **JSON 格式**：确保文件符合 JSON 格式规范
2. **编码格式**：文件必须使用 UTF-8 编码保存
3. **特殊字符**：在 JSON 中使用特殊字符时需要进行转义
4. **备份文件**：建议在修改前备份原文件

## 示例预设

文件中已包含示例预设，您可以参考这些示例来创建自己的预设。

## 错误处理

如果用户预设文件格式错误或不存在，系统将：
- 显示相应的错误信息
- 继续加载默认预设
- 不会影响节点的正常使用

# User Preset File Usage Instructions

## Overview

The `user_presets.txt` file allows you to create and manage your own custom presets, which will be displayed alongside the default presets in the node interface.

## File Format

The user preset file uses JSON format with the following structure:

```json
{
  "预设集": [
    {
      "name": "Preset Name",
      "brief": "Detailed description or instructions for the preset"
    },
    {
      "name": "Personal Art Style",
      "brief": "Transform the image into my personal artistic style with vibrant colors, dynamic composition, and expressive brushstrokes that capture emotion and movement."
    }
  ]
}
```

## Usage Instructions

1. **Edit Preset File**: Directly edit the `user_presets.txt` file (located in the `.../custom_nodes/zhihui_nodes_comfyui/Nodes/KontextPresets/KontextPresetsPlus` directory)
2. **Add New Presets**: Add new preset objects to the `预设集` array
3. **Modify Existing Presets**: Directly modify the `name` or `brief` fields of corresponding presets
4. **Save File**: Ensure the file is saved with UTF-8 encoding
5. **Restart ComfyUI**: After modifications, you need to restart ComfyUI for the new presets to take effect

## Display Effects

- Default presets are displayed as: `[默认] Preset Name`
- User presets are displayed as: `[用户] Preset Name`

## Important Notes

1. **JSON Format**: Ensure the file conforms to JSON format specifications
2. **Encoding Format**: The file must be saved with UTF-8 encoding
3. **Special Characters**: Special characters in JSON need to be escaped
4. **Backup File**: It is recommended to backup the original file before making modifications

## Example Presets

The file already contains example presets that you can reference when creating your own presets.

## Error Handling

If the user preset file has format errors or does not exist, the system will:
- Display corresponding error messages
- Continue loading default presets
- Not affect the normal use of the node