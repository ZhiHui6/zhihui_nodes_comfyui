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

1. **编辑预设文件**：直接编辑 `user_presets.txt` 文件
2. **添加新预设**：在 `预设集` 数组中添加新的预设对象
3. **修改现有预设**：直接修改对应预设的 `name` 或 `brief` 字段
4. **保存文件**：确保文件保存为 UTF-8 编码

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