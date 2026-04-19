let currentTagSelectorDialog = null;

const randomPresets = {
    '默认预设': {
        description: '恢复所有权重为初始默认状态，优化画质细节',
        icon: '🔄',
        color: '#22c55e',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 1, count: 1 },
                '常规标签.摄影': { enabled: true, weight: 1, count: 1 },
                '常规标签.构图': { enabled: true, weight: 1, count: 1 },
                '常规标签.光影': { enabled: true, weight: 1, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 1, count: 1 },
                '艺术题材.艺术流派': { enabled: true, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 1, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 1, count: 1 },
                '艺术题材.装饰图案': { enabled: true, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 1, count: 1 },
                '人物类.角色.动漫角色': { enabled: true, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: true, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: true, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: true, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.职业': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.常服': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.制服COS': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.传统服饰': { enabled: true, weight: 1, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 1, count: 1 },
                '动作/表情.多人互动': { enabled: true, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 1, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 1, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 1, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 1, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 1, count: 1 },
                '道具.翅膀': { enabled: true, weight: 1, count: 1 },
                '道具.尾巴': { enabled: true, weight: 1, count: 1 },
                '道具.耳朵': { enabled: true, weight: 1, count: 1 },
                '道具.角': { enabled: true, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 1, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 1, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 1, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 1, count: 1 },
                '场景类.室外': { enabled: true, weight: 1, count: 1 },
                '场景类.城市': { enabled: true, weight: 1, count: 1 },
                '场景类.建筑': { enabled: true, weight: 1, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 1, count: 1 },
                '场景类.自然景观': { enabled: true, weight: 1, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 1, count: 1 },
                '动物生物.动物': { enabled: true, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: true, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: true, weight: 1, count: 1 }
            },
            adultCategories: {
                '涩影湿.性暗示': { enabled: false, weight: 1, count: 1 },
                '涩影湿.性行为.性行为类型': { enabled: false, weight: 1, count: 1 },
                '涩影湿.性行为.身体部位': { enabled: false, weight: 1, count: 1 },
                '涩影湿.性行为.道具与玩具': { enabled: false, weight: 1, count: 1 },
                '涩影湿.性行为.束缚与调教': { enabled: false, weight: 1, count: 1 },
                '涩影湿.性行为.特殊癖好与情境': { enabled: false, weight: 1, count: 1 },
                '涩影湿.性行为.视觉风格与特定元素': { enabled: false, weight: 1, count: 1 },
                '涩影湿.性行为.欲望表情': { enabled: false, weight: 1, count: 1 }
            },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 15, max: 25 }
        }
    },
    '人物肖像': {
        description: '专注于人物面部特征和表情，极致细节刻画，适合生成精美肖像画',
        icon: '👤',
        color: '#1e40af',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 5, count: 2 },
                '常规标签.摄影': { enabled: true, weight: 3, count: 1 },
                '常规标签.构图': { enabled: true, weight: 3, count: 1 },
                '常规标签.光影': { enabled: true, weight: 4, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术流派': { enabled: false, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 2, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 2, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 3, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 4, count: 3 },
                '人物类.人设.职业': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 4, count: 2 },
                '人物类.人设.眼睛': { enabled: true, weight: 4, count: 2 },
                '人物类.人设.瞳孔': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.常服': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.鞋类': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.制服COS': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.传统服饰': { enabled: true, weight: 2, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 2, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.腿部': { enabled: false, weight: 1, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 4, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 4, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 3, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: false, weight: 1, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 4, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 3, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 2, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 2, count: 1 },
                '场景类.室外': { enabled: false, weight: 1, count: 1 },
                '场景类.城市': { enabled: false, weight: 1, count: 1 },
                '场景类.建筑': { enabled: false, weight: 1, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 2, count: 1 },
                '场景类.自然景观': { enabled: false, weight: 1, count: 1 },
                '场景类.人造景观': { enabled: false, weight: 1, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: {},
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 12, max: 18 }
        }
    },
    '全身人物': {
        description: '专注于人物整体形象，包含服装和姿态，细节丰富的人物插画',
        icon: '🧍',
        color: '#92400e',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 4, count: 2 },
                '常规标签.摄影': { enabled: true, weight: 3, count: 1 },
                '常规标签.构图': { enabled: true, weight: 4, count: 1 },
                '常规标签.光影': { enabled: true, weight: 3, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术流派': { enabled: false, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 2, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 2, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 3, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 3, count: 2 },
                '人物类.人设.职业': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰': { enabled: true, weight: 4, count: 2 },
                '人物类.服饰.常服': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.泳装': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.运动装': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.制服COS': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.传统服饰': { enabled: true, weight: 2, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 4, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 3, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 3, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 2, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 3, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 2, count: 1 },
                '道具.翅膀': { enabled: true, weight: 2, count: 1 },
                '道具.尾巴': { enabled: true, weight: 2, count: 1 },
                '道具.耳朵': { enabled: true, weight: 2, count: 1 },
                '道具.角': { enabled: true, weight: 2, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 3, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 3, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 3, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 2, count: 1 },
                '场景类.室外': { enabled: true, weight: 2, count: 1 },
                '场景类.城市': { enabled: true, weight: 2, count: 1 },
                '场景类.建筑': { enabled: true, weight: 2, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 2, count: 1 },
                '场景类.自然景观': { enabled: true, weight: 2, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 2, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: {},
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 16, max: 24 }
        }
    },
    '风景场景': {
        description: '专注于自然和城市景观，极致光影氛围，适合生成精美风景画',
        icon: '🏞️',
        color: '#047857',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 5, count: 2 },
                '常规标签.摄影': { enabled: true, weight: 3, count: 1 },
                '常规标签.构图': { enabled: true, weight: 4, count: 1 },
                '常规标签.光影': { enabled: true, weight: 4, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术流派': { enabled: true, weight: 2, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 2, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 2, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 4, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.职业': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.性别/年龄': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.胸部': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.鼻子': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.嘴巴': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.皮肤': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.体型': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.眉毛': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.头发': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.眼睛': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.瞳孔': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.常服': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.鞋类': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.制服COS': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.传统服饰': { enabled: false, weight: 1, count: 1 },
                '动作/表情.姿态动作': { enabled: false, weight: 1, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: false, weight: 1, count: 1 },
                '动作/表情.腿部': { enabled: false, weight: 1, count: 1 },
                '动作/表情.眼神': { enabled: false, weight: 1, count: 1 },
                '动作/表情.表情': { enabled: false, weight: 1, count: 1 },
                '动作/表情.嘴型': { enabled: false, weight: 1, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: false, weight: 1, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 4, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 4, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 4, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 3, count: 1 },
                '场景类.室外': { enabled: true, weight: 4, count: 1 },
                '场景类.城市': { enabled: true, weight: 3, count: 1 },
                '场景类.建筑': { enabled: true, weight: 4, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 3, count: 1 },
                '场景类.自然景观': { enabled: true, weight: 4, count: 2 },
                '场景类.人造景观': { enabled: true, weight: 3, count: 1 },
                '动物生物.动物': { enabled: true, weight: 2, count: 1 },
                '动物生物.幻想生物': { enabled: true, weight: 2, count: 1 },
                '动物生物.行为动态': { enabled: true, weight: 2, count: 1 }
            },
            adultCategories: {},
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 14, max: 22 }
        }
    },
    '艺术创作': {
        description: '专注于艺术风格和技法，独特视觉表现，适合创意艺术作品',
        icon: '🎨',
        color: '#f59e0b',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 4, count: 2 },
                '常规标签.摄影': { enabled: true, weight: 2, count: 1 },
                '常规标签.构图': { enabled: true, weight: 3, count: 1 },
                '常规标签.光影': { enabled: true, weight: 3, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 4, count: 1 },
                '艺术题材.艺术流派': { enabled: true, weight: 4, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 4, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 3, count: 1 },
                '艺术题材.装饰图案': { enabled: true, weight: 3, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 4, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.职业': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.胸部': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.常服': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.鞋类': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.制服COS': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.传统服饰': { enabled: true, weight: 2, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 2, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 2, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 2, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 2, count: 1 },
                '道具.翅膀': { enabled: true, weight: 2, count: 1 },
                '道具.尾巴': { enabled: true, weight: 2, count: 1 },
                '道具.耳朵': { enabled: true, weight: 2, count: 1 },
                '道具.角': { enabled: true, weight: 2, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 3, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 4, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 3, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 2, count: 1 },
                '场景类.室外': { enabled: true, weight: 2, count: 1 },
                '场景类.城市': { enabled: true, weight: 2, count: 1 },
                '场景类.建筑': { enabled: true, weight: 2, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 2, count: 1 },
                '场景类.自然景观': { enabled: true, weight: 2, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 2, count: 1 },
                '动物生物.动物': { enabled: true, weight: 2, count: 1 },
                '动物生物.幻想生物': { enabled: true, weight: 2, count: 1 },
                '动物生物.行为动态': { enabled: true, weight: 2, count: 1 }
            },
            adultCategories: {},
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 14, max: 22 }
        }
    },
    '太空科幻': {
        description: '专注于太空、星际和科技主题，未来感光影效果，适合生成科幻场景',
        icon: '🚀',
        color: '#0ea5e9',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 4, count: 2 },
                '常规标签.摄影': { enabled: true, weight: 3, count: 1 },
                '常规标签.构图': { enabled: true, weight: 3, count: 1 },
                '常规标签.光影': { enabled: true, weight: 4, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术流派': { enabled: false, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 2, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 3, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 3, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.职业': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.胸部': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.常服': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.鞋类': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.制服COS': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.传统服饰': { enabled: false, weight: 1, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 2, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 2, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 2, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 2, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: false, weight: 1, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 4, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 3, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 3, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 2, count: 1 },
                '场景类.室外': { enabled: true, weight: 4, count: 1 },
                '场景类.城市': { enabled: false, weight: 1, count: 1 },
                '场景类.建筑': { enabled: true, weight: 3, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 3, count: 1 },
                '场景类.自然景观': { enabled: false, weight: 1, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 4, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: true, weight: 2, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: {},
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 14, max: 22 }
        }
    },
    '中国风': {
        description: '专注于中国传统服饰和东方美学元素，古韵意境，精美国风插画',
        icon: '🏮',
        color: '#dc2626',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 4, count: 2 },
                '常规标签.摄影': { enabled: true, weight: 3, count: 1 },
                '常规标签.构图': { enabled: true, weight: 3, count: 1 },
                '常规标签.光影': { enabled: true, weight: 3, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术流派': { enabled: true, weight: 3, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 3, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 2, count: 1 },
                '艺术题材.装饰图案': { enabled: true, weight: 3, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 3, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 3, count: 2 },
                '人物类.人设.职业': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 4, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰': { enabled: true, weight: 4, count: 2 },
                '人物类.服饰.常服': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.制服COS': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.传统服饰': { enabled: true, weight: 4, count: 2 },
                '动作/表情.姿态动作': { enabled: true, weight: 3, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 3, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 3, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 2, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: false, weight: 1, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 3, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 4, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 3, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 2, count: 1 },
                '场景类.室外': { enabled: true, weight: 3, count: 1 },
                '场景类.城市': { enabled: false, weight: 1, count: 1 },
                '场景类.建筑': { enabled: true, weight: 3, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 3, count: 1 },
                '场景类.自然景观': { enabled: true, weight: 3, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 2, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: {},
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 16, max: 24 }
        }
    },
    '科幻赛博': {
        description: '专注于赛博朋克风格，霓虹灯光和未来城市',
        icon: '🤖',
        color: '#a855f7',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 3, count: 1 },
                '常规标签.摄影': { enabled: true, weight: 2, count: 1 },
                '常规标签.构图': { enabled: true, weight: 2, count: 1 },
                '常规标签.光影': { enabled: true, weight: 3, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 1, count: 1 },
                '艺术题材.艺术流派': { enabled: true, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 1, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 2, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 3, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.职业': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰': { enabled: true, weight: 3, count: 2 },
                '人物类.服饰.常服': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.制服COS': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.传统服饰': { enabled: false, weight: 1, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 2, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 1, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 1, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 1, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 1, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 1, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: true, weight: 1, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 3, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 3, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 2, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 2, count: 1 },
                '场景类.室外': { enabled: true, weight: 2, count: 1 },
                '场景类.城市': { enabled: true, weight: 3, count: 1 },
                '场景类.建筑': { enabled: true, weight: 2, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 1, count: 1 },
                '场景类.自然景观': { enabled: false, weight: 1, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 2, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: {},
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 12, max: 20 }
        }
    },
    '二次元动漫': {
        description: '专注于动漫角色、二次元虚拟偶像，日系动漫风格',
        icon: '🎭',
        color: '#0d9488',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 3, count: 1 },
                '常规标签.摄影': { enabled: true, weight: 2, count: 1 },
                '常规标签.构图': { enabled: true, weight: 2, count: 1 },
                '常规标签.光影': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 1, count: 1 },
                '艺术题材.艺术流派': { enabled: false, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 2, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 2, count: 1 },
                '艺术题材.装饰图案': { enabled: true, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 2, count: 1 },
                '人物类.角色.动漫角色': { enabled: true, weight: 3, count: 2 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: true, weight: 3, count: 1 },
                '人物类.角色.3D动画角色': { enabled: true, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 2, count: 2 },
                '人物类.人设.职业': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰': { enabled: true, weight: 2, count: 2 },
                '人物类.服饰.常服': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.制服COS': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.传统服饰': { enabled: false, weight: 1, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 2, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 1, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 1, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 2, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 3, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 2, count: 1 },
                '道具.翅膀': { enabled: true, weight: 1, count: 1 },
                '道具.尾巴': { enabled: true, weight: 1, count: 1 },
                '道具.耳朵': { enabled: true, weight: 1, count: 1 },
                '道具.角': { enabled: true, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 2, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 2, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 1, count: 1 },
                '场景类.反射效果': { enabled: false, weight: 1, count: 1 },
                '场景类.室外': { enabled: true, weight: 1, count: 1 },
                '场景类.城市': { enabled: true, weight: 1, count: 1 },
                '场景类.建筑': { enabled: true, weight: 1, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 1, count: 1 },
                '场景类.自然景观': { enabled: false, weight: 1, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 1, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: true, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: {},
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 12, max: 20 }
        }
    },
    '游戏角色': {
        description: '专注于游戏角色、3D渲染风格，适合生成游戏人物和CG角色',
        icon: '🎮',
        color: '#6366f1',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 3, count: 1 },
                '常规标签.摄影': { enabled: true, weight: 3, count: 1 },
                '常规标签.构图': { enabled: true, weight: 2, count: 1 },
                '常规标签.光影': { enabled: true, weight: 3, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 1, count: 1 },
                '艺术题材.艺术流派': { enabled: false, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 2, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 2, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 3, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: true, weight: 3, count: 2 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: true, weight: 2, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.职业': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰': { enabled: true, weight: 3, count: 2 },
                '人物类.服饰.常服': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.制服COS': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.传统服饰': { enabled: false, weight: 1, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 3, count: 1 },
                '动作/表情.多人互动': { enabled: true, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 1, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 2, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 2, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 1, count: 1 },
                '道具.翅膀': { enabled: true, weight: 1, count: 1 },
                '道具.尾巴': { enabled: true, weight: 1, count: 1 },
                '道具.耳朵': { enabled: true, weight: 1, count: 1 },
                '道具.角': { enabled: true, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 3, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 2, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 2, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 2, count: 1 },
                '场景类.室外': { enabled: true, weight: 2, count: 1 },
                '场景类.城市': { enabled: true, weight: 1, count: 1 },
                '场景类.建筑': { enabled: true, weight: 1, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 1, count: 1 },
                '场景类.自然景观': { enabled: false, weight: 1, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 2, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: true, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: {},
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 14, max: 22 }
        }
    },
    '玄幻修仙': {
        description: '专注于东方玄幻、修仙、仙侠主题，仙气飘渺，精美玄幻插画',
        icon: '🗡️',
        color: '#e11d48',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 4, count: 2 },
                '常规标签.摄影': { enabled: true, weight: 3, count: 1 },
                '常规标签.构图': { enabled: true, weight: 3, count: 1 },
                '常规标签.光影': { enabled: true, weight: 4, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术流派': { enabled: true, weight: 3, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 3, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 2, count: 1 },
                '艺术题材.装饰图案': { enabled: true, weight: 3, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 3, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 3, count: 2 },
                '人物类.人设.职业': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 4, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰': { enabled: true, weight: 4, count: 2 },
                '人物类.服饰.常服': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.制服COS': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.传统服饰': { enabled: true, weight: 4, count: 2 },
                '动作/表情.姿态动作': { enabled: true, weight: 4, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 3, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 3, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 3, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 2, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: false, weight: 1, count: 1 },
                '道具.角': { enabled: true, weight: 2, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 4, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 4, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 3, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 2, count: 1 },
                '场景类.室外': { enabled: true, weight: 4, count: 1 },
                '场景类.城市': { enabled: false, weight: 1, count: 1 },
                '场景类.建筑': { enabled: true, weight: 3, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 2, count: 1 },
                '场景类.自然景观': { enabled: true, weight: 3, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 3, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: true, weight: 3, count: 1 },
                '动物生物.行为动态': { enabled: true, weight: 2, count: 1 }
            },
            adultCategories: {},
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 16, max: 26 }
        }
    },
    '艺术写真': {
        description: '专注于商业摄影风格，高质量艺术写真，精致光影与质感',
        icon: '📸',
        color: '#1d4ed8',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 4, count: 2 },
                '常规标签.摄影': { enabled: true, weight: 4, count: 1 },
                '常规标签.构图': { enabled: true, weight: 4, count: 1 },
                '常规标签.光影': { enabled: true, weight: 4, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术流派': { enabled: false, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 2, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 2, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 3, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 4, count: 2 },
                '人物类.人设.职业': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 4, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 4, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰': { enabled: true, weight: 4, count: 2 },
                '人物类.服饰.常服': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.泳装': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.运动装': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.制服COS': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.传统服饰': { enabled: true, weight: 2, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 4, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 3, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 3, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 4, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 3, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: false, weight: 1, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 4, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 3, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 3, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 3, count: 1 },
                '场景类.室外': { enabled: true, weight: 3, count: 1 },
                '场景类.城市': { enabled: true, weight: 2, count: 1 },
                '场景类.建筑': { enabled: true, weight: 2, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 3, count: 1 },
                '场景类.自然景观': { enabled: true, weight: 2, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 2, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: {},
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 16, max: 24 }
        }
    },
    '电影海报': {
        description: '专注于电影级构图、戏剧性光影、叙事感，适合影视海报和剧照风格，震撼视觉冲击',
        icon: '🎬',
        color: '#64748b',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 4, count: 2 },
                '常规标签.摄影': { enabled: true, weight: 4, count: 1 },
                '常规标签.构图': { enabled: true, weight: 4, count: 1 },
                '常规标签.光影': { enabled: true, weight: 4, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 3, count: 1 },
                '艺术题材.艺术流派': { enabled: true, weight: 2, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 3, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 3, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 4, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 4, count: 1 },
                '人物类.人设.职业': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.胸部': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 4, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰': { enabled: true, weight: 4, count: 1 },
                '人物类.服饰.常服': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.制服COS': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.传统服饰': { enabled: true, weight: 3, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 4, count: 1 },
                '动作/表情.多人互动': { enabled: true, weight: 3, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 3, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 4, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 4, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 3, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: false, weight: 1, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 4, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 4, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 4, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 3, count: 1 },
                '场景类.室外': { enabled: true, weight: 4, count: 1 },
                '场景类.城市': { enabled: true, weight: 3, count: 1 },
                '场景类.建筑': { enabled: true, weight: 3, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 3, count: 1 },
                '场景类.自然景观': { enabled: true, weight: 3, count: 1 },
                '场景类.人造景观': { enabled: true, weight: 3, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: {},
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 18, max: 28 }
        }
    },
    '电商产品': {
        description: '专注于商品展示、白底图、产品细节，适合电商平台商品图生成',
        icon: '🛒',
        color: '#ca8a04',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 3, count: 1 },
                '常规标签.摄影': { enabled: true, weight: 3, count: 1 },
                '常规标签.构图': { enabled: true, weight: 3, count: 1 },
                '常规标签.光影': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术家风格': { enabled: false, weight: 1, count: 1 },
                '艺术题材.艺术流派': { enabled: false, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: false, weight: 1, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 1, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 2, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.职业': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.性别/年龄': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.胸部': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.鼻子': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.嘴巴': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.皮肤': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.体型': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.眉毛': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.头发': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.眼睛': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.瞳孔': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.常服': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.制服COS': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.传统服饰': { enabled: false, weight: 1, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 1, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 1, count: 1 },
                '动作/表情.腿部': { enabled: false, weight: 1, count: 1 },
                '动作/表情.眼神': { enabled: false, weight: 1, count: 1 },
                '动作/表情.表情': { enabled: false, weight: 1, count: 1 },
                '动作/表情.嘴型': { enabled: false, weight: 1, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: false, weight: 1, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 2, count: 1 },
                '场景类.情感与氛围': { enabled: false, weight: 1, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 2, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 2, count: 1 },
                '场景类.室外': { enabled: false, weight: 1, count: 1 },
                '场景类.城市': { enabled: false, weight: 1, count: 1 },
                '场景类.建筑': { enabled: false, weight: 1, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 2, count: 1 },
                '场景类.自然景观': { enabled: false, weight: 1, count: 1 },
                '场景类.人造景观': { enabled: false, weight: 1, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: {},
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 10, max: 18 }
        }
    },
    '萌宠': {
        description: '专注于可爱宠物、动物表情、温馨互动，适合生成萌宠照片',
        icon: '🐾',
        color: '#be185d',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 3, count: 1 },
                '常规标签.摄影': { enabled: true, weight: 3, count: 1 },
                '常规标签.构图': { enabled: true, weight: 2, count: 1 },
                '常规标签.光影': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术家风格': { enabled: false, weight: 1, count: 1 },
                '艺术题材.艺术流派': { enabled: false, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: false, weight: 1, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 1, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 2, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.职业': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.性别/年龄': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.胸部': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.脸型': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.鼻子': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.嘴巴': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.皮肤': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.体型': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.眉毛': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.头发': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.眼睛': { enabled: false, weight: 1, count: 1 },
                '人物类.人设.瞳孔': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.常服': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.运动装': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.配饰': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.鞋类': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.帽子': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.制服COS': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.传统服饰': { enabled: false, weight: 1, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 2, count: 1 },
                '动作/表情.多人互动': { enabled: false, weight: 1, count: 1 },
                '动作/表情.手部': { enabled: false, weight: 1, count: 1 },
                '动作/表情.腿部': { enabled: false, weight: 1, count: 1 },
                '动作/表情.眼神': { enabled: false, weight: 1, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 2, count: 1 },
                '动作/表情.嘴型': { enabled: false, weight: 1, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: true, weight: 2, count: 1 },
                '道具.耳朵': { enabled: true, weight: 2, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 2, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 3, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 2, count: 1 },
                '场景类.反射效果': { enabled: true, weight: 1, count: 1 },
                '场景类.室外': { enabled: true, weight: 2, count: 1 },
                '场景类.城市': { enabled: false, weight: 1, count: 1 },
                '场景类.建筑': { enabled: false, weight: 1, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 2, count: 1 },
                '场景类.自然景观': { enabled: true, weight: 2, count: 1 },
                '场景类.人造景观': { enabled: false, weight: 1, count: 1 },
                '动物生物.动物': { enabled: true, weight: 3, count: 2 },
                '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: true, weight: 2, count: 1 }
            },
            adultCategories: {},
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: false,
            totalTagsRange: { min: 12, max: 20 }
        }
    },
    '成人色情': {
        description: '专注于成人内容，包含NSFW标签',
        icon: '🔞',
        color: '#7c3aed',
        settings: {
            categories: {
                '常规标签.画质': { enabled: true, weight: 3, count: 1 },
                '常规标签.摄影': { enabled: true, weight: 2, count: 1 },
                '常规标签.构图': { enabled: true, weight: 2, count: 1 },
                '常规标签.光影': { enabled: true, weight: 2, count: 1 },
                '艺术题材.艺术家风格': { enabled: true, weight: 1, count: 1 },
                '艺术题材.艺术流派': { enabled: false, weight: 1, count: 1 },
                '艺术题材.技法形式': { enabled: true, weight: 1, count: 1 },
                '艺术题材.媒介与效果': { enabled: true, weight: 1, count: 1 },
                '艺术题材.装饰图案': { enabled: false, weight: 1, count: 1 },
                '艺术题材.色彩与质感': { enabled: true, weight: 1, count: 1 },
                '人物类.角色.动漫角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.游戏角色': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.二次元虚拟偶像': { enabled: false, weight: 1, count: 1 },
                '人物类.角色.3D动画角色': { enabled: false, weight: 1, count: 1 },
                '人物类.外貌与特征': { enabled: true, weight: 3, count: 2 },
                '人物类.人设.职业': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.性别/年龄': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.胸部': { enabled: true, weight: 3, count: 1 },
                '人物类.人设.脸型': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.鼻子': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.嘴巴': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.皮肤': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.体型': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眉毛': { enabled: true, weight: 1, count: 1 },
                '人物类.人设.头发': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.眼睛': { enabled: true, weight: 2, count: 1 },
                '人物类.人设.瞳孔': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.常服': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.泳装': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.运动装': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.内衣': { enabled: true, weight: 3, count: 1 },
                '人物类.服饰.配饰': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.鞋类': { enabled: true, weight: 1, count: 1 },
                '人物类.服饰.睡衣': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.帽子': { enabled: false, weight: 1, count: 1 },
                '人物类.服饰.制服COS': { enabled: true, weight: 2, count: 1 },
                '人物类.服饰.传统服饰': { enabled: false, weight: 1, count: 1 },
                '动作/表情.姿态动作': { enabled: true, weight: 3, count: 1 },
                '动作/表情.多人互动': { enabled: true, weight: 2, count: 1 },
                '动作/表情.手部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.腿部': { enabled: true, weight: 2, count: 1 },
                '动作/表情.眼神': { enabled: true, weight: 2, count: 1 },
                '动作/表情.表情': { enabled: true, weight: 3, count: 1 },
                '动作/表情.嘴型': { enabled: true, weight: 2, count: 1 },
                '道具.翅膀': { enabled: false, weight: 1, count: 1 },
                '道具.尾巴': { enabled: false, weight: 1, count: 1 },
                '道具.耳朵': { enabled: false, weight: 1, count: 1 },
                '道具.角': { enabled: false, weight: 1, count: 1 },
                '场景类.光线环境': { enabled: true, weight: 2, count: 1 },
                '场景类.情感与氛围': { enabled: true, weight: 2, count: 1 },
                '场景类.背景环境': { enabled: true, weight: 1, count: 1 },
                '场景类.反射效果': { enabled: false, weight: 1, count: 1 },
                '场景类.室外': { enabled: false, weight: 1, count: 1 },
                '场景类.城市': { enabled: false, weight: 1, count: 1 },
                '场景类.建筑': { enabled: false, weight: 1, count: 1 },
                '场景类.室内装饰': { enabled: true, weight: 2, count: 1 },
                '场景类.自然景观': { enabled: false, weight: 1, count: 1 },
                '场景类.人造景观': { enabled: false, weight: 1, count: 1 },
                '动物生物.动物': { enabled: false, weight: 1, count: 1 },
                '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
                '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
            },
            adultCategories: {
                '涩影湿.性暗示': { enabled: true, weight: 2, count: 1 },
                '涩影湿.性行为.性行为类型': { enabled: true, weight: 3, count: 2 },
                '涩影湿.性行为.身体部位': { enabled: true, weight: 2, count: 1 },
                '涩影湿.性行为.道具与玩具': { enabled: true, weight: 1, count: 1 },
                '涩影湿.性行为.束缚与调教': { enabled: true, weight: 1, count: 1 },
                '涩影湿.性行为.特殊癖好与情境': { enabled: true, weight: 1, count: 1 },
                '涩影湿.性行为.视觉风格与特定元素': { enabled: true, weight: 1, count: 1 },
                '涩影湿.性行为.欲望表情': { enabled: true, weight: 2, count: 1 }
            },
            excludedCategories: ['自定义', '灵感套装'],
            includeNSFW: true,
            totalTagsRange: { min: 15, max: 25 }
        }
    }
};

let randomSettings = {
    categories: {
        '常规标签.画质': { enabled: true, weight: 2, count: 1 },
        '常规标签.摄影': { enabled: true, weight: 2, count: 1 },
        '常规标签.构图': { enabled: true, weight: 2, count: 1 },
        '常规标签.光影': { enabled: true, weight: 2, count: 1 },
        '艺术题材.艺术家风格': { enabled: true, weight: 1, count: 1 },
        '艺术题材.艺术流派': { enabled: true, weight: 1, count: 1 },
        '艺术题材.技法形式': { enabled: true, weight: 1, count: 1 },
        '艺术题材.媒介与效果': { enabled: true, weight: 1, count: 1 },
        '艺术题材.装饰图案': { enabled: true, weight: 1, count: 1 },
        '艺术题材.色彩与质感': { enabled: true, weight: 1, count: 1 },
        '人物类.角色.动漫角色': { enabled: true, weight: 2, count: 1 },
        '人物类.角色.游戏角色': { enabled: true, weight: 1, count: 1 },
        '人物类.角色.二次元虚拟偶像': { enabled: true, weight: 1, count: 1 },
        '人物类.角色.3D动画角色': { enabled: true, weight: 1, count: 1 },
        '人物类.外貌与特征': { enabled: true, weight: 2, count: 2 },
        '人物类.人设.职业': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.性别/年龄': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.胸部': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.脸型': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.鼻子': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.嘴巴': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.皮肤': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.体型': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.眉毛': { enabled: true, weight: 1, count: 1 },
        '人物类.人设.头发': { enabled: true, weight: 2, count: 1 },
        '人物类.人设.眼睛': { enabled: true, weight: 2, count: 1 },
        '人物类.人设.瞳孔': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰': { enabled: true, weight: 2, count: 2 },
        '人物类.服饰.常服': { enabled: true, weight: 2, count: 1 },
        '人物类.服饰.泳装': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰.运动装': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰.内衣': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰.配饰': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰.鞋类': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰.睡衣': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰.帽子': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰.制服COS': { enabled: true, weight: 1, count: 1 },
        '人物类.服饰.传统服饰': { enabled: true, weight: 1, count: 1 },
        '动作/表情.姿态动作': { enabled: true, weight: 2, count: 1 },
        '动作/表情.多人互动': { enabled: true, weight: 1, count: 1 },
        '动作/表情.手部': { enabled: true, weight: 1, count: 1 },
        '动作/表情.腿部': { enabled: true, weight: 1, count: 1 },
        '动作/表情.眼神': { enabled: true, weight: 1, count: 1 },
        '动作/表情.表情': { enabled: true, weight: 2, count: 1 },
        '动作/表情.嘴型': { enabled: true, weight: 1, count: 1 },
        '道具.翅膀': { enabled: true, weight: 1, count: 1 },
        '道具.尾巴': { enabled: true, weight: 1, count: 1 },
        '道具.耳朵': { enabled: true, weight: 1, count: 1 },
        '道具.角': { enabled: true, weight: 1, count: 1 },
        '场景类.光线环境': { enabled: true, weight: 2, count: 1 },
        '场景类.情感与氛围': { enabled: true, weight: 2, count: 1 },
        '场景类.背景环境': { enabled: true, weight: 1, count: 1 },
        '场景类.反射效果': { enabled: true, weight: 1, count: 1 },
        '场景类.室外': { enabled: true, weight: 2, count: 1 },
        '场景类.城市': { enabled: true, weight: 1, count: 1 },
        '场景类.建筑': { enabled: true, weight: 2, count: 1 },
        '场景类.室内装饰': { enabled: true, weight: 1, count: 1 },
        '场景类.自然景观': { enabled: true, weight: 2, count: 1 },
        '场景类.人造景观': { enabled: true, weight: 1, count: 1 },
        '动物生物.动物': { enabled: true, weight: 1, count: 1 },
        '动物生物.幻想生物': { enabled: true, weight: 1, count: 1 },
        '动物生物.行为动态': { enabled: true, weight: 1, count: 1 }
    },
    adultCategories: {
        '涩影湿.性暗示': { enabled: true, weight: 2, count: 1 },
        '涩影湿.性行为.性行为类型': { enabled: true, weight: 3, count: 2 },
        '涩影湿.性行为.身体部位': { enabled: true, weight: 2, count: 1 },
        '涩影湿.性行为.道具与玩具': { enabled: true, weight: 1, count: 1 },
        '涩影湿.性行为.束缚与调教': { enabled: true, weight: 1, count: 1 },
        '涩影湿.性行为.特殊癖好与情境': { enabled: true, weight: 1, count: 1 },
        '涩影湿.性行为.视觉风格与特定元素': { enabled: true, weight: 1, count: 1 },
        '涩影湿.性行为.欲望表情': { enabled: true, weight: 2, count: 1 }
    },
    excludedCategories: ['自定义', '灵感套装'],
    includeNSFW: false,
    limitTotalTags: true,
    totalTagsRange: { min: 12, max: 20 }
};

async function loadRandomSettings() {
    try {
        const response = await fetch('/zhihui/random_settings');
        if (response.ok) {
            const settings = await response.json();
            randomSettings = settings;
            if (!randomSettings.adultCategories || Object.keys(randomSettings.adultCategories).length === 0) {
                randomSettings.adultCategories = {
                    '涩影湿.性暗示': { enabled: true, weight: 2, count: 1 },
                    '涩影湿.性行为.性行为类型': { enabled: true, weight: 3, count: 2 },
                    '涩影湿.性行为.身体部位': { enabled: true, weight: 2, count: 1 },
                    '涩影湿.性行为.道具与玩具': { enabled: true, weight: 1, count: 1 },
                    '涩影湿.性行为.束缚与调教': { enabled: true, weight: 1, count: 1 },
                    '涩影湿.性行为.特殊癖好与情境': { enabled: true, weight: 1, count: 1 },
                    '涩影湿.性行为.视觉风格与特定元素': { enabled: true, weight: 1, count: 1 },
                    '涩影湿.性行为.欲望表情': { enabled: true, weight: 2, count: 1 }
                };
            }
            if (randomSettings.limitTotalTags === undefined) {
                randomSettings.limitTotalTags = true;
            }
            console.log('随机设置加载成功');
        } else {
            console.warn('无法从服务器加载随机设置，使用默认设置');
        }
    } catch (error) {
        console.error('加载随机设置时出错:', error);
    }
}

async function saveRandomSettings() {
    try {
        const response = await fetch('/zhihui/random_settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(randomSettings)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('随机设置保存成功:', result.message);
            return true;
        } else {
            console.error('保存随机设置失败');
            return false;
        }
    } catch (error) {
        console.error('保存随机设置时出错:', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', loadRandomSettings);

function createRandomGeneratorContent() {
    const content = document.createElement('div');
    content.className = 'random-generator-content';
    content.style.cssText = `
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
        height: 100%;
    `;

    const rulesSection = createRulesSection();
    rulesSection.classList.add('rules-section');

    const presetsSection = createPresetsSection();
    presetsSection.classList.add('presets-section');
    
    const categoriesSection = createCategoriesSection();
    categoriesSection.classList.add('categories-section');
    
    const globalSection = createGlobalSection();
    globalSection.classList.add('global-section');

    const topRow = document.createElement('div');
    topRow.style.cssText = `
        display: flex;
        gap: 16px;
    `;
    rulesSection.style.flex = '1';
    globalSection.style.flex = '1';
    topRow.appendChild(rulesSection);
    topRow.appendChild(globalSection);
    topRow.classList.add('top-row-section');

    content.appendChild(topRow);
    content.appendChild(presetsSection);
    content.appendChild(categoriesSection);

    return content;
}

function updateRandomGeneratorContent() {
    if (!currentTagSelectorDialog) return;
    
    const tagContent = currentTagSelectorDialog.tagContent;
    if (!tagContent) return;
    
    const existingContent = tagContent.querySelector('.random-generator-content');
    if (existingContent) {
        const topRow = existingContent.querySelector('.top-row-section');
        if (topRow) {
            const rulesSection = topRow.querySelector('.rules-section');
            if (rulesSection) {
                const newRulesSection = createRulesSection();
                newRulesSection.classList.add('rules-section');
                newRulesSection.style.flex = '1';
                rulesSection.parentNode.replaceChild(newRulesSection, rulesSection);
            }
            
            const globalSection = topRow.querySelector('.global-section');
            if (globalSection) {
                const newGlobalSection = createGlobalSection();
                newGlobalSection.classList.add('global-section');
                newGlobalSection.style.flex = '1';
                globalSection.parentNode.replaceChild(newGlobalSection, globalSection);
            }
        }
        
        const presetsSection = existingContent.querySelector('.presets-section');
        if (presetsSection) {
            const newPresetsSection = createPresetsSection();
            newPresetsSection.classList.add('presets-section');
            presetsSection.parentNode.replaceChild(newPresetsSection, presetsSection);
        }
        
        const categoriesSection = existingContent.querySelector('.categories-section');
        if (categoriesSection) {
            const newCategoriesSection = createCategoriesSection();
            newCategoriesSection.classList.add('categories-section');
            categoriesSection.parentNode.replaceChild(newCategoriesSection, categoriesSection);
        }
    }
}

async function openRandomGeneratorDialog(tagSelectorDlg) {
    await loadRandomSettings();
    
    currentTagSelectorDialog = tagSelectorDlg;
    
    if (tagSelectorDlg.subCategoryTabs) {
        tagSelectorDlg.subCategoryTabs.style.display = 'none';
    }
    if (tagSelectorDlg.subSubCategoryTabs) {
        tagSelectorDlg.subSubCategoryTabs.style.display = 'none';
    }
    if (tagSelectorDlg.subSubSubCategoryTabs) {
        tagSelectorDlg.subSubSubCategoryTabs.style.display = 'none';
    }
    
    if (tagSelectorDlg.clearButtonContainer) {
        tagSelectorDlg.clearButtonContainer.style.display = 'flex';
    }
    if (tagSelectorDlg.quickRandomBtn) {
        tagSelectorDlg.quickRandomBtn.style.display = 'block';
    }
    if (tagSelectorDlg.restoreBtn) {
        tagSelectorDlg.restoreBtn.style.display = 'block';
    }
    if (tagSelectorDlg.clearBtn) {
        tagSelectorDlg.clearBtn.style.display = 'block';
    }
    
    const tagContent = tagSelectorDlg.tagContent;
    if (!tagContent) return;
    
    tagContent.innerHTML = '';
    
    const content = createRandomGeneratorContent();
    tagContent.appendChild(content);
}

function closeRandomGeneratorDialog() {
    if (currentTagSelectorDialog) {
        const tagContent = currentTagSelectorDialog.tagContent;
        if (tagContent) {
            const existingContent = tagContent.querySelector('.random-generator-content');
            if (existingContent) {
                existingContent.remove();
            }
        }
    }
}

function createRandomGeneratorDialog() {
}

function applyPreset(presetName) {
    const preset = randomPresets[presetName];
    if (!preset) return;
    
    const defaultAdultCategories = {
        '涩影湿.性暗示': { enabled: true, weight: 2, count: 1 },
        '涩影湿.性行为.性行为类型': { enabled: true, weight: 3, count: 2 },
        '涩影湿.性行为.身体部位': { enabled: true, weight: 2, count: 1 },
        '涩影湿.性行为.道具与玩具': { enabled: true, weight: 1, count: 1 },
        '涩影湿.性行为.束缚与调教': { enabled: true, weight: 1, count: 1 },
        '涩影湿.性行为.特殊癖好与情境': { enabled: true, weight: 1, count: 1 },
        '涩影湿.性行为.视觉风格与特定元素': { enabled: true, weight: 1, count: 1 },
        '涩影湿.性行为.欲望表情': { enabled: true, weight: 2, count: 1 }
    };
    
    randomSettings = JSON.parse(JSON.stringify(preset.settings));
    
    if (!randomSettings.adultCategories || Object.keys(randomSettings.adultCategories).length === 0) {
        randomSettings.adultCategories = defaultAdultCategories;
    }
    
    if (randomSettings.limitTotalTags === undefined) {
        randomSettings.limitTotalTags = true;
    }
    
    saveRandomSettings();
    
    if (!currentTagSelectorDialog) return;
    
    const tagContent = currentTagSelectorDialog.tagContent;
    if (!tagContent) return;
    
    const existingContent = tagContent.querySelector('.random-generator-content');
    if (existingContent) {
        const categoriesSection = existingContent.querySelector('.categories-section');
        if (categoriesSection) {
            const newCategoriesSection = createCategoriesSection();
            newCategoriesSection.classList.add('categories-section');
            categoriesSection.parentNode.replaceChild(newCategoriesSection, categoriesSection);
        }
        
        const globalSection = existingContent.querySelector('.global-section');
        if (globalSection) {
            const newGlobalSection = createGlobalSection();
            newGlobalSection.classList.add('global-section');
            newGlobalSection.style.flex = '1';
            globalSection.parentNode.replaceChild(newGlobalSection, globalSection);
        }
    }
}

let currentSelectedPreset = null;

function createPresetsSection() {
    const section = document.createElement('div');
    section.style.cssText = `
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 8px;
        padding: 16px;
    `;

    const title = document.createElement('h3');
    title.textContent = '🎯 随机权重方案';
    title.style.cssText = `
        color: #60a5fa;
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 16px 0;
    `;
    section.appendChild(title);

    const presetsContainer = document.createElement('div');
    presetsContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 12px;
        align-items: start;
    `;

    Object.entries(randomPresets).forEach(([presetName, preset]) => {
        if (presetName === '成人色情' && !window.adultContentUnlocked) {
            return;
        }

        const presetCard = document.createElement('div');
        presetCard.className = 'preset-card';
        presetCard.dataset.presetName = presetName;
        const isSelected = currentSelectedPreset === presetName;
        
        presetCard.style.cssText = `
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
            border: 2px solid ${isSelected ? preset.color : preset.color + '40'};
            border-radius: 12px;
            padding: 14px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            min-width: 0;
            height: 100px;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            ${isSelected ? `box-shadow: 0 0 16px ${preset.color}50, inset 0 0 20px ${preset.color}15;` : ''}
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        `;

        const icon = document.createElement('span');
        icon.style.cssText = `
            font-size: 20px;
        `;
        icon.textContent = preset.icon;

        const name = document.createElement('span');
        name.style.cssText = `
            color: #f1f5f9;
            font-size: 14px;
            font-weight: 600;
        `;
        name.textContent = presetName;

        header.appendChild(icon);
        header.appendChild(name);

        const description = document.createElement('div');
        description.style.cssText = `
            color: #94a3b8;
            font-size: 12px;
            line-height: 1.4;
            flex: 1;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        `;
        description.textContent = preset.description;

        presetCard.appendChild(header);
        presetCard.appendChild(description);

        presetCard.addEventListener('mouseenter', () => {
            if (currentSelectedPreset !== presetName) {
                presetCard.style.borderColor = preset.color;
                presetCard.style.boxShadow = `0 4px 12px ${preset.color}30`;
                presetCard.style.transform = 'translateY(-2px)';
            }
        });

        presetCard.addEventListener('mouseleave', () => {
            if (currentSelectedPreset !== presetName) {
                presetCard.style.borderColor = `${preset.color}40`;
                presetCard.style.boxShadow = 'none';
                presetCard.style.transform = 'translateY(0)';
            }
        });

        presetCard.onclick = () => {
            currentSelectedPreset = presetName;
            
            const allCards = presetsContainer.querySelectorAll('.preset-card');
            allCards.forEach(card => {
                const cardPresetName = card.dataset.presetName;
                const cardPreset = randomPresets[cardPresetName];
                const isCardSelected = currentSelectedPreset === cardPresetName;
                
                card.style.border = `2px solid ${isCardSelected ? cardPreset.color : cardPreset.color + '40'}`;
                card.style.boxShadow = isCardSelected ? `0 0 16px ${cardPreset.color}50, inset 0 0 20px ${cardPreset.color}15` : 'none';
                card.style.transform = isCardSelected ? 'translateY(-2px)' : 'translateY(0)';
            });
            
            applyPreset(presetName);
            if (window.showToast) {
                window.showToast(`已应用预设: ${presetName}`, 'success');
            }
        };

        presetsContainer.appendChild(presetCard);
    });

    section.appendChild(presetsContainer);
    return section;
}

function createRulesSection() {
    const section = document.createElement('div');
    section.style.cssText = `
        background: rgba(37, 99, 235, 0.1);
        border: 1px solid rgba(37, 99, 235, 0.3);
        border-radius: 8px;
        padding: 16px;
    `;

    const title = document.createElement('h3');
    title.textContent = '📋 生成规则说明';
    title.style.cssText = `
        color: #60a5fa;
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 12px 0;
    `;

    const description = document.createElement('div');
    description.innerHTML = `
        <div style="color: #e2e8f0; font-size: 14px; line-height: 1.6;">
            <p style="margin: 0 0 8px 0;"><strong>生成逻辑：</strong>从每个启用的分类中，按权重概率随机抽取指定数量的标签，组合成最终提示词</p>
            <p style="margin: 0 0 8px 0;"><strong>权重说明：</strong>权重越高，该分类被选中的概率越大。<span style="color:#fcd34d;">建议核心分类设2-3，辅助分类设1</span></p>
            <p style="margin: 0 0 8px 0;"><strong>数量建议：</strong>画质/光影建议1-2个，服饰建议2个，其他分类建议1个。总数控制在15-25个效果最佳</p>
            <p style="margin: 0;"><strong>自动排除：</strong>「自定义」「灵感套装」等分类不参与随机生成</p>
        </div>
    `;

    section.appendChild(title);
    section.appendChild(description);
    return section;
}

function createCategoriesSection() {
    const section = document.createElement('div');
    section.style.cssText = `
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 8px;
        padding: 16px;
    `;

    const title = document.createElement('h3');
    title.textContent = '⚙️ 分类权重设置 (按生成公式组织)';
    title.style.cssText = `
        color: #60a5fa;
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 16px 0;
    `;
    
    section.appendChild(title);

    const formulaGroups = {
        '常规标签': {
            title: '[常规标签] - 画质、摄影、构图、光影',
            color: '#f59e0b',
            categories: []
        },
        '艺术题材': {
            title: '[艺术题材] - 艺术风格、技法形式',
            color: '#ef4444',
            categories: []
        },
        '人物类': {
            title: '[人物类] - 角色、外貌、人设、服饰',
            color: '#8b5cf6',
            categories: []
        },
        '动作/表情': {
            title: '[动作/表情] - 姿态、表情、手部腿部',
            color: '#06b6d4',
            categories: []
        },
        '道具': {
            title: '[道具] - 翅膀、尾巴、耳朵、角',
            color: '#10b981',
            categories: []
        },
        '场景类': {
            title: '[场景类] - 光线环境、室外、建筑、自然景观',
            color: '#f97316',
            categories: []
        },
        '动物生物': {
            title: '[动物生物] - 动物、幻想生物、行为动态',
            color: '#84cc16',
            categories: []
        }
    };

    Object.keys(randomSettings.categories).forEach(categoryPath => {
        const formulaElement = categoryPath.split('.')[0];
        if (formulaGroups[formulaElement]) {
            formulaGroups[formulaElement].categories.push(categoryPath);
        }
    });

    Object.keys(formulaGroups).forEach(groupKey => {
        const group = formulaGroups[groupKey];
        if (group.categories.length > 0) {
            const groupSection = createFormulaGroupSection(group);
            section.appendChild(groupSection);
            
            if (groupKey === '动物生物' && window.adultContentUnlocked) {
                const adultSettingsContainer = document.createElement('div');
                adultSettingsContainer.id = 'adult-settings-container-categories';
                adultSettingsContainer.style.cssText = `
                    margin-top: 16px;
                    padding: 16px;
                    background: rgba(248, 113, 113, 0.1);
                    border: 1px solid rgba(248, 113, 113, 0.3);
                    border-radius: 8px;
                    display: block;
                `;

                const adultCategoriesContainer = document.createElement('div');
                adultCategoriesContainer.style.cssText = `
                    margin-top: 0;
                `;

                const categoryGroups = {
                    '涩影湿': {
                        subGroups: {
                            '性暗示': { categories: [] },
                            '性行为': { categories: [] }
                        }
                    }
                };

                Object.keys(randomSettings.adultCategories).forEach(categoryPath => {
                    const setting = randomSettings.adultCategories[categoryPath];
                    const parts = categoryPath.split('.');
                    const mainGroup = parts[0];
                    const subGroup = parts[1];
                    const itemName = parts.slice(2).join('.');

                    if (categoryGroups[mainGroup] && categoryGroups[mainGroup].subGroups[subGroup]) {
                        categoryGroups[mainGroup].subGroups[subGroup].categories.push({
                            path: categoryPath,
                            setting: setting,
                            displayName: itemName || subGroup
                        });
                    }
                });

                const mainGroup = categoryGroups['涩影湿'];
                const xinganShiCategories = mainGroup.subGroups['性暗示'].categories;
                const xingxingweiCategories = mainGroup.subGroups['性行为'].categories;

                if (xinganShiCategories.length > 0 || xingxingweiCategories.length > 0) {
                    const allItemNames = [];

                    if (xinganShiCategories.length > 0) {
                        allItemNames.push('性暗示');
                    }

                    xingxingweiCategories.forEach(cat => {
                        allItemNames.push(cat.displayName);
                    });

                    const limitedItemNames = allItemNames.slice(0, 4);

                    const subGroupTitle = document.createElement('div');
                    subGroupTitle.textContent = `[涩影湿] - 性行为、${limitedItemNames.join('、')}`;
                    subGroupTitle.style.cssText = `
                        color: #f87171;
                        font-size: 14px;
                        font-weight: 600;
                        margin: 0 0 8px 0;
                        text-shadow: 0 0 8px #f8717140;
                        border-bottom: 1px solid #f8717140;
                        padding-bottom: 4px;
                    `;
                    adultCategoriesContainer.appendChild(subGroupTitle);

                    const groupGrid = document.createElement('div');
                    groupGrid.style.cssText = `
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        grid-template-rows: repeat(2, auto);
                        gap: 8px;
                        margin-bottom: 12px;
                    `;

                    xinganShiCategories.forEach(({ path, setting }) => {
                        const categoryItem = createCategorySettingItem(path, setting, '#f87171');
                        groupGrid.appendChild(categoryItem);
                    });

                    xingxingweiCategories.forEach(({ path, setting }) => {
                        const categoryItem = createCategorySettingItem(path, setting, '#f87171');
                        groupGrid.appendChild(categoryItem);
                    });

                    adultCategoriesContainer.appendChild(groupGrid);
                }

                adultSettingsContainer.appendChild(adultCategoriesContainer);
                section.appendChild(adultSettingsContainer);
            }
        }
    });

    return section;
}

function createFormulaGroupSection(group) {
    const groupSection = document.createElement('div');
    groupSection.style.cssText = `
        background: rgba(30, 41, 59, 0.3);
        border: 1px solid ${group.color}40;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
    `;

    const groupTitle = document.createElement('h4');
    groupTitle.textContent = group.title;
    groupTitle.style.cssText = `
        color: ${group.color};
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 12px 0;
        padding-bottom: 8px;
        border-bottom: 1px solid ${group.color}30;
    `;

    const grid = document.createElement('div');
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 8px;
    `;

    group.categories.forEach(categoryPath => {
        const setting = randomSettings.categories[categoryPath];
        const item = createCategorySettingItem(categoryPath, setting, group.color);
        grid.appendChild(item);
    });

    groupSection.appendChild(groupTitle);
    groupSection.appendChild(grid);
    return groupSection;
}

function createCategorySettingItem(categoryPath, setting, themeColor = '#60a5fa') {
    const item = document.createElement('div');
    item.style.cssText = `
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(71, 85, 105, 0.5);
        border-radius: 6px;
        padding: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = setting.enabled;
    checkbox.style.cssText = `
        width: 16px;
        height: 16px;
        cursor: pointer;
    `;
    checkbox.onchange = () => {
        randomSettings.categories[categoryPath].enabled = checkbox.checked;
        saveRandomSettings();
    };

    const name = document.createElement('div');
    const displayName = categoryPath.split('.').pop();
    name.textContent = displayName;
    name.style.cssText = `
        color: ${themeColor};
        font-size: 13px;
        font-weight: 500;
        flex: 1;
        min-width: 0;
    `;

    const weightLabel = document.createElement('span');
    weightLabel.textContent = '权重:';
    weightLabel.style.cssText = `
        color: #94a3b8;
        font-size: 12px;
    `;

    const weightInput = document.createElement('input');
    weightInput.type = 'number';
    weightInput.min = '0';
    weightInput.max = '10';
    weightInput.step = '0.1';
    weightInput.value = setting.weight;
    weightInput.style.cssText = `
        width: 60px;
        padding: 4px 6px;
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 4px;
        background: rgba(15, 23, 42, 0.3);
        color: #e2e8f0;
        font-size: 12px;
    `;
    weightInput.onchange = () => {
        randomSettings.categories[categoryPath].weight = parseFloat(weightInput.value) || 0;
        saveRandomSettings();
    };

    const countLabel = document.createElement('span');
    countLabel.textContent = '数量:';
    countLabel.style.cssText = `
        color: #94a3b8;
        font-size: 12px;
    `;

    const countInput = document.createElement('input');
    countInput.type = 'number';
    countInput.min = '0';
    countInput.max = '10';
    countInput.value = setting.count;
    countInput.style.cssText = `
        width: 50px;
        padding: 4px 6px;
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 4px;
        background: rgba(15, 23, 42, 0.3);
        color: #e2e8f0;
        font-size: 12px;
    `;
    countInput.onchange = () => {
        randomSettings.categories[categoryPath].count = parseInt(countInput.value) || 0;
        saveRandomSettings();
    };

    item.appendChild(checkbox);
    item.appendChild(name);
    item.appendChild(weightLabel);
    item.appendChild(weightInput);
    item.appendChild(countLabel);
    item.appendChild(countInput);

    return item;
}

function createGlobalSection() {
    const section = document.createElement('div');
    section.style.cssText = `
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 8px;
        padding: 16px;
    `;

    const title = document.createElement('h3');
    title.textContent = '🎯 全局设置';
    title.style.cssText = `
        color: #60a5fa;
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 16px 0;
    `;

    const toggleContainer = document.createElement('div');
    toggleContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
    `;

    const toggleLabel = document.createElement('span');
    toggleLabel.textContent = '限制总数:';
    toggleLabel.style.cssText = `
        color: #e2e8f0;
        font-size: 14px;
    `;

    const toggleSwitch = document.createElement('label');
    toggleSwitch.style.cssText = `
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
        cursor: pointer;
    `;

    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.checked = randomSettings.limitTotalTags !== false;
    toggleInput.style.cssText = `
        opacity: 0;
        width: 0;
        height: 0;
    `;

    const toggleSlider = document.createElement('span');
    toggleSlider.style.cssText = `
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: ${randomSettings.limitTotalTags !== false ? '#3b82f6' : '#475569'};
        transition: 0.3s;
        border-radius: 24px;
    `;

    const toggleDot = document.createElement('span');
    toggleDot.style.cssText = `
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: ${randomSettings.limitTotalTags !== false ? '23px' : '3px'};
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
    `;

    toggleSlider.appendChild(toggleDot);
    toggleSwitch.appendChild(toggleInput);
    toggleSwitch.appendChild(toggleSlider);

    const toggleDesc = document.createElement('span');
    toggleDesc.textContent = randomSettings.limitTotalTags !== false ? '启用' : '禁用';
    toggleDesc.style.cssText = `
        color: ${randomSettings.limitTotalTags !== false ? '#22c55e' : '#94a3b8'};
        font-size: 12px;
        font-weight: 500;
    `;

    toggleInput.onchange = () => {
        randomSettings.limitTotalTags = toggleInput.checked;
        toggleSlider.style.backgroundColor = toggleInput.checked ? '#3b82f6' : '#475569';
        toggleDot.style.left = toggleInput.checked ? '23px' : '3px';
        toggleDesc.textContent = toggleInput.checked ? '启用' : '禁用';
        toggleDesc.style.color = toggleInput.checked ? '#22c55e' : '#94a3b8';
        
        minInput.disabled = !toggleInput.checked;
        maxInput.disabled = !toggleInput.checked;
        minInput.style.opacity = toggleInput.checked ? '1' : '0.5';
        maxInput.style.opacity = toggleInput.checked ? '1' : '0.5';
        
        saveRandomSettings();
    };

    toggleContainer.appendChild(toggleLabel);
    toggleContainer.appendChild(toggleSwitch);
    toggleContainer.appendChild(toggleDesc);

    const rangeContainer = document.createElement('div');
    rangeContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
    `;

    const rangeLabel = document.createElement('span');
    rangeLabel.textContent = '总标签数量范围:';
    rangeLabel.style.cssText = `
        color: #e2e8f0;
        font-size: 14px;
    `;

    const minInput = document.createElement('input');
    minInput.type = 'number';
    minInput.min = '1';
    minInput.max = '50';
    minInput.value = randomSettings.totalTagsRange.min;
    minInput.disabled = randomSettings.limitTotalTags === false;
    minInput.style.cssText = `
        width: 60px;
        padding: 6px 8px;
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 4px;
        background: rgba(15, 23, 42, 0.3);
        color: #e2e8f0;
        font-size: 14px;
        opacity: ${randomSettings.limitTotalTags !== false ? '1' : '0.5'};
    `;
    minInput.onchange = () => {
        randomSettings.totalTagsRange.min = parseInt(minInput.value) || 1;
        saveRandomSettings();
    };

    const separator = document.createElement('span');
    separator.textContent = '至';
    separator.style.cssText = `
        color: #94a3b8;
        font-size: 14px;
    `;

    const maxInput = document.createElement('input');
    maxInput.type = 'number';
    maxInput.min = '1';
    maxInput.max = '50';
    maxInput.value = randomSettings.totalTagsRange.max;
    maxInput.disabled = randomSettings.limitTotalTags === false;
    maxInput.style.cssText = `
        width: 60px;
        padding: 6px 8px;
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 4px;
        background: rgba(15, 23, 42, 0.3);
        color: #e2e8f0;
        font-size: 14px;
        opacity: ${randomSettings.limitTotalTags !== false ? '1' : '0.5'};
    `;
    maxInput.onchange = () => {
        randomSettings.totalTagsRange.max = parseInt(maxInput.value) || 1;
        saveRandomSettings();
    };

    rangeContainer.appendChild(rangeLabel);
    rangeContainer.appendChild(minInput);
    rangeContainer.appendChild(separator);
    rangeContainer.appendChild(maxInput);

    const descContainer = document.createElement('div');
    descContainer.style.cssText = `
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(59, 130, 246, 0.2);
    `;

    const descText = document.createElement('p');
    descText.innerHTML = `
        <span style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
            <strong style="color: #fcd34d;">启用：</strong>按设置范围智能调整标签总数，不足时从其他分类补充<br>
            <strong style="color: #94a3b8;">禁用：</strong>完全按各分类设置累加，不限制总数
        </span>
    `;
    descText.style.margin = '0';

    descContainer.appendChild(descText);

    section.appendChild(title);
    section.appendChild(toggleContainer);
    section.appendChild(rangeContainer);
    section.appendChild(descContainer);
    return section;
}

function resetRandomSettings() {
    randomSettings = {
        categories: {
            '常规标签.画质': { enabled: true, weight: 2, count: 1 },
            '常规标签.摄影': { enabled: true, weight: 2, count: 1 },
            '常规标签.构图': { enabled: true, weight: 2, count: 1 },
            '常规标签.光影': { enabled: true, weight: 2, count: 1 },
            '艺术题材.艺术家风格': { enabled: true, weight: 1, count: 1 },
            '艺术题材.艺术流派': { enabled: true, weight: 1, count: 1 },
            '艺术题材.技法形式': { enabled: true, weight: 1, count: 1 },
            '艺术题材.媒介与效果': { enabled: true, weight: 1, count: 1 },
            '艺术题材.装饰图案': { enabled: true, weight: 1, count: 1 },
            '艺术题材.色彩与质感': { enabled: true, weight: 1, count: 1 },
            '人物类.角色.动漫角色': { enabled: true, weight: 2, count: 1 },
            '人物类.角色.游戏角色': { enabled: true, weight: 1, count: 1 },
            '人物类.角色.二次元虚拟偶像': { enabled: true, weight: 1, count: 1 },
            '人物类.角色.3D动画角色': { enabled: true, weight: 1, count: 1 },
            '人物类.外貌与特征': { enabled: true, weight: 2, count: 2 },
            '人物类.人设.职业': { enabled: true, weight: 1, count: 1 },
            '人物类.人设.性别/年龄': { enabled: true, weight: 1, count: 1 },
            '人物类.人设.胸部': { enabled: true, weight: 1, count: 1 },
            '人物类.人设.脸型': { enabled: true, weight: 1, count: 1 },
            '人物类.人设.鼻子': { enabled: true, weight: 1, count: 1 },
            '人物类.人设.嘴巴': { enabled: true, weight: 1, count: 1 },
            '人物类.人设.皮肤': { enabled: true, weight: 1, count: 1 },
            '人物类.人设.体型': { enabled: true, weight: 1, count: 1 },
            '人物类.人设.眉毛': { enabled: true, weight: 1, count: 1 },
            '人物类.人设.头发': { enabled: true, weight: 2, count: 1 },
            '人物类.人设.眼睛': { enabled: true, weight: 2, count: 1 },
            '人物类.人设.瞳孔': { enabled: true, weight: 1, count: 1 },
            '人物类.服饰': { enabled: true, weight: 2, count: 2 },
            '人物类.服饰.常服': { enabled: true, weight: 2, count: 1 },
            '人物类.服饰.泳装': { enabled: true, weight: 1, count: 1 },
            '人物类.服饰.运动装': { enabled: true, weight: 1, count: 1 },
            '人物类.服饰.内衣': { enabled: true, weight: 1, count: 1 },
            '人物类.服饰.配饰': { enabled: true, weight: 1, count: 1 },
            '人物类.服饰.鞋类': { enabled: true, weight: 1, count: 1 },
            '人物类.服饰.睡衣': { enabled: true, weight: 1, count: 1 },
            '人物类.服饰.帽子': { enabled: true, weight: 1, count: 1 },
            '人物类.服饰.制服COS': { enabled: true, weight: 1, count: 1 },
            '人物类.服饰.传统服饰': { enabled: true, weight: 1, count: 1 },
            '动作/表情.姿态动作': { enabled: true, weight: 2, count: 1 },
            '动作/表情.多人互动': { enabled: true, weight: 1, count: 1 },
            '动作/表情.手部': { enabled: true, weight: 1, count: 1 },
            '动作/表情.腿部': { enabled: true, weight: 1, count: 1 },
            '动作/表情.眼神': { enabled: true, weight: 1, count: 1 },
            '动作/表情.表情': { enabled: true, weight: 2, count: 1 },
            '动作/表情.嘴型': { enabled: true, weight: 1, count: 1 },
            '道具.翅膀': { enabled: true, weight: 1, count: 1 },
            '道具.尾巴': { enabled: true, weight: 1, count: 1 },
            '道具.耳朵': { enabled: true, weight: 1, count: 1 },
            '道具.角': { enabled: true, weight: 1, count: 1 },
            '场景类.光线环境': { enabled: true, weight: 2, count: 1 },
            '场景类.情感与氛围': { enabled: true, weight: 2, count: 1 },
            '场景类.背景环境': { enabled: true, weight: 1, count: 1 },
            '场景类.反射效果': { enabled: true, weight: 1, count: 1 },
            '场景类.室外': { enabled: true, weight: 2, count: 1 },
            '场景类.城市': { enabled: true, weight: 1, count: 1 },
            '场景类.建筑': { enabled: true, weight: 2, count: 1 },
            '场景类.室内装饰': { enabled: true, weight: 1, count: 1 },
            '场景类.自然景观': { enabled: true, weight: 2, count: 1 },
            '场景类.人造景观': { enabled: true, weight: 1, count: 1 },
            '动物生物.动物': { enabled: false, weight: 1, count: 1 },
            '动物生物.幻想生物': { enabled: false, weight: 1, count: 1 },
            '动物生物.行为动态': { enabled: false, weight: 1, count: 1 }
        },
        adultCategories: {
            '涩影湿.性暗示': { enabled: true, weight: 2, count: 1 },
            '涩影湿.性行为.性行为类型': { enabled: true, weight: 3, count: 2 },
            '涩影湿.性行为.身体部位': { enabled: true, weight: 2, count: 1 },
            '涩影湿.性行为.道具与玩具': { enabled: true, weight: 1, count: 1 },
            '涩影湿.性行为.束缚与调教': { enabled: true, weight: 1, count: 1 },
            '涩影湿.性行为.特殊癖好与情境': { enabled: true, weight: 1, count: 1 },
            '涩影湿.性行为.视觉风格与特定元素': { enabled: true, weight: 1, count: 1 },
            '涩影湿.性行为.欲望表情': { enabled: true, weight: 2, count: 1 }
        },
        excludedCategories: ['自定义', '灵感套装'],
        includeNSFW: false,
        limitTotalTags: true,
        totalTagsRange: { min: 12, max: 20 }
    };
}

function generateRandomCombination() {
    if (!window.tagsData) {
        alert('标签数据未加载，请稍后再试');
        return;
    }

    const generatedTags = [];
    const usedTags = new Set();

    const enabledCategories = Object.keys(randomSettings.categories).filter(
        categoryPath => randomSettings.categories[categoryPath].enabled
    );

    if (randomSettings.includeNSFW && randomSettings.adultCategories) {
        const enabledAdultCategories = Object.keys(randomSettings.adultCategories).filter(
            categoryPath => randomSettings.adultCategories[categoryPath].enabled
        );
        enabledCategories.push(...enabledAdultCategories);
    }

    if (enabledCategories.length === 0) {
        alert('请至少启用一个分类');
        return;
    }

    enabledCategories.forEach(categoryPath => {
        const setting = randomSettings.categories[categoryPath] || randomSettings.adultCategories[categoryPath];
        const shouldInclude = Math.random() < (setting.weight / 10);

        if (shouldInclude) {
            const tags = getTagsFromCategoryPath(categoryPath);
            if (tags.length > 0) {
                const randomTags = getRandomTagsFromArray(tags, setting.count);
                randomTags.forEach(tag => {
                    const tagKey = tag.value || tag.display;
                    if (!usedTags.has(tagKey)) {
                        usedTags.add(tagKey);
                        generatedTags.push(tag);
                    }
                });
            }
        }
    });

    if (randomSettings.limitTotalTags !== false) {
        const targetCount = Math.floor(
            Math.random() * (randomSettings.totalTagsRange.max - randomSettings.totalTagsRange.min + 1)
        ) + randomSettings.totalTagsRange.min;

        if (generatedTags.length < targetCount) {
            const allAvailableTags = getAllAvailableTags();
            const remainingTags = allAvailableTags.filter(tag => {
                const tagKey = tag.value || tag.display;
                return !usedTags.has(tagKey);
            });
            
            const additionalCount = Math.min(targetCount - generatedTags.length, remainingTags.length);
            const additionalTags = getRandomTagsFromArray(remainingTags, additionalCount);
            
            additionalTags.forEach(tag => {
                const tagKey = tag.value || tag.display;
                usedTags.add(tagKey);
                generatedTags.push(tag);
            });
        }
    }

    if (generatedTags.length > 0) {
        if (window.selectedTags) {
            window.selectedTags.clear();
        }
        
        generatedTags.forEach(tag => {
            const tagValue = tag.value || tag.display;
            if (window.selectedTags) {
                window.selectedTags.set(tagValue, 1.0);
            }
        });
        
        if (window.updateSelectedTags) {
            window.updateSelectedTags();
        }
        if (window.updateSelectedTagsOverview) {
            window.updateSelectedTagsOverview();
        }
        if (window.updateCategoryRedDots) {
            window.updateCategoryRedDots();
        }
    }
}

function getTagsFromCategoryPath(categoryPath) {
    if (!window.tagsData) return [];
    
    const pathParts = categoryPath.split('.');
    let current = window.tagsData;
    
    for (const part of pathParts) {
        if (current && current[part]) {
            current = current[part];
        } else {
            return [];
        }
    }
    
    return extractAllTagsFromObject(current);
}

function extractAllTagsFromObject(obj) {
    const tags = [];
    
    function extract(current, parentPath = '') {
        if (typeof current === 'object' && current !== null) {
            if (Array.isArray(current)) {
                current.forEach(tag => {
                    if (typeof tag === 'object' && tag.display && tag.value) {
                        tags.push(tag);
                    } else if (typeof tag === 'string') {
                        tags.push({ display: tag, value: tag });
                    }
                });
            } else {
                Object.entries(current).forEach(([key, value]) => {
                    const currentPath = parentPath ? `${parentPath}.${key}` : key;
                    
                    if (typeof value === 'string') {
                        tags.push({
                            display: key,
                            value: value,
                            category: parentPath || '未分类'
                        });
                    } else if (typeof value === 'object') {
                        extract(value, currentPath);
                    }
                });
            }
        }
    }
    
    extract(obj);
    return tags;
}

function getAllAvailableTags() {
    if (!window.tagsData) return [];
    
    const allTags = [];
    const excludedCategories = randomSettings.excludedCategories;
    
    function extractFromCategory(obj, categoryPath = '') {
        Object.entries(obj).forEach(([key, value]) => {
            const currentPath = categoryPath ? `${categoryPath}.${key}` : key;
            
            let isExcluded = excludedCategories.some(excluded => 
                currentPath.includes(excluded) || key.includes(excluded)
            );
            
            if (!randomSettings.includeNSFW && (currentPath.includes('NSFW') || key.includes('NSFW'))) {
                isExcluded = true;
            }
            
            if (!isExcluded) {
                if (typeof value === 'string') {
                    allTags.push({
                        display: key,
                        value: value,
                        category: categoryPath || '未分类'
                    });
                } else if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach(tag => {
                            if (typeof tag === 'object' && tag.display && tag.value) {
                                allTags.push(tag);
                            }
                        });
                    } else {
                        extractFromCategory(value, currentPath);
                    }
                }
            }
        });
    }
    
    extractFromCategory(window.tagsData);
    return allTags;
}

function getRandomTagsFromArray(tags, count) {
    if (tags.length === 0 || count <= 0) return [];
    
    const shuffled = [...tags].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, tags.length));
}

window.openRandomGeneratorDialog = openRandomGeneratorDialog;
window.generateRandomCombination = generateRandomCombination;