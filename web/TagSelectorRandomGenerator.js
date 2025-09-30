// ==================== 随机生成器功能 ====================

// 随机生成器相关变量
let randomGeneratorDialog = null;
let randomSettings = {
    categories: {
        // [画质风格] - 画质、艺术风格、技法形式
        '画质风格.画质': { enabled: true, weight: 2, count: 1 },
        '画质风格.艺术家风格': { enabled: true, weight: 1, count: 1 },
        '画质风格.艺术流派': { enabled: true, weight: 1, count: 1 },
        '画质风格.技法形式': { enabled: true, weight: 1, count: 1 },
        '画质风格.媒介与效果': { enabled: true, weight: 1, count: 1 },
        
        // [主体] - 人物角色、外貌特征、服饰
        '主体.人物类.角色': { enabled: true, weight: 2, count: 1 },
        '主体.人物类.外貌与特征': { enabled: true, weight: 2, count: 2 },
        '主体.人物类.人设.职业': { enabled: true, weight: 1, count: 1 },
        '主体.人物类.人设.性别/年龄': { enabled: true, weight: 1, count: 1 },
        '主体.人物类.服饰': { enabled: true, weight: 2, count: 2 },
        
        // [动作] - 动作表情、姿态、手部腿部
        '动作.人物类.动作/表情.基础姿态': { enabled: true, weight: 2, count: 1 },
        '动作.人物类.动作/表情.多人互动': { enabled: true, weight: 1, count: 1 },
        '动作.人物类.动作/表情.手部': { enabled: true, weight: 1, count: 1 },
        '动作.人物类.动作/表情.腿部': { enabled: true, weight: 1, count: 1 },
        '动作.人物类.动作/表情.眼神': { enabled: true, weight: 1, count: 1 },
        '动作.人物类.动作/表情.表情': { enabled: true, weight: 2, count: 1 },
        
        // [构图视角] - 摄影构图、视角
        '构图视角.常规标签.摄影': { enabled: true, weight: 2, count: 1 },
        '构图视角.常规标签.构图': { enabled: true, weight: 2, count: 1 },
        
        // [技术参数] - 光影、色彩质感、装饰图案
        '技术参数.常规标签.光影': { enabled: true, weight: 2, count: 1 },
        '技术参数.常规标签.色彩与质感': { enabled: true, weight: 1, count: 1 },
        '技术参数.常规标签.装饰图案': { enabled: true, weight: 1, count: 1 },
        
        // [光线氛围] - 光线环境、情感氛围、背景环境
        '光线氛围.场景类.光线环境': { enabled: true, weight: 2, count: 1 },
        '光线氛围.场景类.情感与氛围': { enabled: true, weight: 2, count: 1 },
        '光线氛围.场景类.背景环境': { enabled: true, weight: 1, count: 1 },
        '光线氛围.场景类.反射效果': { enabled: true, weight: 1, count: 1 },
        
        // [场景] - 室外、室内、建筑、自然景观
        '场景.场景类.室外': { enabled: true, weight: 2, count: 1 },
        '场景.场景类.城市': { enabled: true, weight: 1, count: 1 },
        '场景.场景类.建筑': { enabled: true, weight: 2, count: 1 },
        '场景.场景类.室内装饰': { enabled: true, weight: 1, count: 1 },
        '场景.场景类.自然景观': { enabled: true, weight: 2, count: 1 },
        '场景.场景类.人造景观': { enabled: true, weight: 1, count: 1 }
    },
    
    // R18成人内容详细设置
    adultCategories: {
        // [轻度内容] - 擦边、诱惑类
        '轻度内容.涩影湿.擦边': { enabled: true, weight: 2, count: 1 },
        
        // [性行为类型] - 各种性行为
        '性行为.涩影湿.NSFW.性行为类型': { enabled: true, weight: 3, count: 2 },
        
        // [身体部位] - 身体特征描述
        '身体部位.涩影湿.NSFW.身体部位': { enabled: true, weight: 2, count: 1 },
        
        // [道具玩具] - 成人用品
        '道具玩具.涩影湿.NSFW.道具与玩具': { enabled: false, weight: 1, count: 1 },
        
        // [束缚调教] - BDSM相关
        '束缚调教.涩影湿.NSFW.束缚与调教': { enabled: false, weight: 1, count: 1 },
        
        // [特殊癖好] - 特殊情境和癖好
        '特殊癖好.涩影湿.NSFW.特殊癖好与情境': { enabled: false, weight: 1, count: 1 },
        
        // [视觉效果] - 视觉风格和特效
        '视觉效果.涩影湿.NSFW.视觉风格与特定元素': { enabled: true, weight: 1, count: 1 }
    },
    excludedCategories: ['自定义', '灵感套装'],
    includeNSFW: false,
    totalTagsRange: { min: 12, max: 20 }
};

// 创建随机生成器对话框
function createRandomGeneratorDialog() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10002;
        display: none;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 1100px;
        max-width: 95vw;
        height: 850px;
        max-height: 95vh;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 2px solid rgb(19, 101, 201);
        border-radius: 16px;
        box-shadow: 0 0 20px rgba(96, 165, 250, 0.7), 0 0 40px rgba(96, 165, 250, 0.4);
        z-index: 10003;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
    `;

    // 标题栏
    const header = document.createElement('div');
    header.style.cssText = `
        background: rgb(34, 77, 141);
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 16px 16px 0 0;
        user-select: none;
    `;

    const title = document.createElement('span');
    title.innerHTML = '随机参数设置';
    title.style.cssText = `
        color: #f1f5f9;
        font-size: 18px;
        font-weight: 600;
        letter-spacing: -0.025em;
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        border: 1px solid rgba(220, 38, 38, 0.8);
        color: #ffffff;
        padding: 0;
        width: 24px;
        height: 24px;
        font-size: 18px;
        font-weight: 700;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
        closeBtn.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.4)';
        closeBtn.style.borderColor = 'rgba(248, 113, 113, 0.8)';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
        closeBtn.style.boxShadow = 'none';
        closeBtn.style.borderColor = 'rgba(220, 38, 38, 0.8)';
    });
    closeBtn.onclick = () => {
        overlay.style.display = 'none';
    };

    header.appendChild(title);
    header.appendChild(closeBtn);

    // 内容区域
    const content = document.createElement('div');
    content.style.cssText = `
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
    `;

    // 规则说明区域
    const rulesSection = createRulesSection();
    
    // 分类设置区域
    const categoriesSection = createCategoriesSection();
    
    // 全局设置区域
    const globalSection = createGlobalSection();

    content.appendChild(rulesSection);
    content.appendChild(categoriesSection);
    content.appendChild(globalSection);

    // 底部按钮
    const footer = document.createElement('div');
    footer.style.cssText = `
        background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 0 0 16px 16px;
        gap: 12px;
    `;

    const resetBtn = document.createElement('button');
    resetBtn.innerHTML = '🔄 重置默认';
    resetBtn.style.cssText = `
        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        border: 1px solid rgba(107, 114, 128, 0.8);
        color: #ffffff;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        outline: none;
    `;
    resetBtn.onclick = () => {
        resetRandomSettings();
        overlay.style.display = 'none';
        createRandomGeneratorDialog();
        randomGeneratorDialog.style.display = 'block';
    };

    footer.appendChild(resetBtn);

    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    overlay.appendChild(dialog);

    document.body.appendChild(overlay);
    randomGeneratorDialog = overlay;

    // ESC键关闭
    overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            overlay.style.display = 'none';
        }
    });
}

// 创建快速生成区域
// 创建规则说明区域
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
            <p style="margin: 0 0 8px 0;"><strong>生成公式：</strong>[画质风格] + [主体] + [动作] + [构图视角] + [技术参数] + [光线氛围] + [场景]</p>
            <p style="margin: 0 0 8px 0;"><strong>权重机制：</strong>权重越高的分类被选中的概率越大，建议核心分类权重2，辅助分类权重1</p>
            <p style="margin: 0 0 8px 0;"><strong>数量控制：</strong>每个分类可设置抽取的标签数量，主体和服饰建议2个，其他建议1个</p>
            <p style="margin: 0;"><strong>排除分类：</strong>自定义、灵感套装等分类将被自动排除。</p>
        </div>
    `;

    section.appendChild(title);
    section.appendChild(description);
    return section;
}

// 创建分类设置区域
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
    
    // 先将标题添加到section中
    section.appendChild(title);

    // 按生成公式的7个元素分组显示
    const formulaGroups = {
        '画质风格': {
            title: '🎨 [画质风格] - 画质、艺术风格、技法形式',
            color: '#f59e0b',
            categories: []
        },
        '主体': {
            title: '👤 [主体] - 人物角色、外貌特征、服饰',
            color: '#ef4444',
            categories: []
        },
        '动作': {
            title: '🎭 [动作] - 动作表情、姿态、手部腿部',
            color: '#8b5cf6',
            categories: []
        },
        '构图视角': {
            title: '📷 [构图视角] - 摄影构图、视角',
            color: '#06b6d4',
            categories: []
        },
        '技术参数': {
            title: '⚡ [技术参数] - 光影、色彩质感、装饰图案',
            color: '#10b981',
            categories: []
        },
        '光线氛围': {
            title: '🌟 [光线氛围] - 光线环境、情感氛围、背景环境',
            color: '#f97316',
            categories: []
        },
        '场景': {
            title: '🏞️ [场景] - 室外、室内、建筑、自然景观',
            color: '#84cc16',
            categories: []
        }
    };

    // 将分类按公式元素分组
    Object.keys(randomSettings.categories).forEach(categoryPath => {
        const formulaElement = categoryPath.split('.')[0];
        if (formulaGroups[formulaElement]) {
            formulaGroups[formulaElement].categories.push(categoryPath);
        }
    });

    // 为每个公式元素创建分组
    Object.keys(formulaGroups).forEach(groupKey => {
        const group = formulaGroups[groupKey];
        if (group.categories.length > 0) {
            const groupSection = createFormulaGroupSection(group);
            section.appendChild(groupSection);
            
            // 在场景分组后添加R18选项
            if (groupKey === '场景') {
                // NSFW复选框容器
                const nsfwContainer = document.createElement('div');
                nsfwContainer.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 12px;
                    margin-left: 10px;
                `;

                const nsfwCheckbox = document.createElement('input');
                nsfwCheckbox.type = 'checkbox';
                nsfwCheckbox.id = 'nsfw-checkbox-categories';
                nsfwCheckbox.checked = randomSettings.includeNSFW;
                nsfwCheckbox.style.cssText = `
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                `;
                nsfwCheckbox.onchange = () => {
                    randomSettings.includeNSFW = nsfwCheckbox.checked;
                    // 同步全局设置中的复选框
                    const globalNsfwCheckbox = document.getElementById('nsfw-checkbox');
                    if (globalNsfwCheckbox) {
                        globalNsfwCheckbox.checked = nsfwCheckbox.checked;
                    }
                    // 控制详细设置的显示/隐藏
                    adultSettingsContainer.style.display = nsfwCheckbox.checked ? 'block' : 'none';
                };

                const nsfwLabel = document.createElement('label');
                nsfwLabel.htmlFor = 'nsfw-checkbox-categories';
                nsfwLabel.textContent = '🔞 R18成人内容';
                nsfwLabel.style.cssText = `
                    color: #f87171;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    user-select: none;
                `;

                nsfwContainer.appendChild(nsfwCheckbox);
                nsfwContainer.appendChild(nsfwLabel);
                section.appendChild(nsfwContainer);
                
                // R18详细设置区域
                const adultSettingsContainer = document.createElement('div');
                adultSettingsContainer.id = 'adult-settings-container-categories';
                adultSettingsContainer.style.cssText = `
                    margin-top: 16px;
                    padding: 16px;
                    background: rgba(248, 113, 113, 0.1);
                    border: 1px solid rgba(248, 113, 113, 0.3);
                    border-radius: 8px;
                    display: ${randomSettings.includeNSFW ? 'block' : 'none'};
                `;

                // R18设置标题
                const adultTitle = document.createElement('h4');
                adultTitle.textContent = '🔞 R18成人内容详细设置';
                adultTitle.style.cssText = `
                    color: #f87171;
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0 0 12px 0;
                    text-shadow: 0 0 10px rgba(248, 113, 113, 0.5);
                `;

                // 创建成人内容分类设置 - 按类型分组
                const adultCategoriesContainer = document.createElement('div');
                adultCategoriesContainer.style.cssText = `
                    margin-top: 12px;
                `;

                // 创建分组结构
                const categoryGroups = {
                    '轻度内容': { color: '#fbbf24', icon: '💋', categories: [] },
                    '性行为': { color: '#f87171', icon: '🔥', categories: [] },
                    '身体部位': { color: '#fb7185', icon: '👤', categories: [] },
                    '道具玩具': { color: '#a78bfa', icon: '🎯', categories: [] },
                    '束缚调教': { color: '#ef4444', icon: '⛓️', categories: [] },
                    '特殊癖好': { color: '#f59e0b', icon: '🎭', categories: [] },
                    '视觉效果': { color: '#06b6d4', icon: '🎨', categories: [] }
                };

                // 将分类分组
                Object.keys(randomSettings.adultCategories).forEach(categoryPath => {
                    const setting = randomSettings.adultCategories[categoryPath];
                    const groupName = categoryPath.split('.')[0];
                    if (categoryGroups[groupName]) {
                        categoryGroups[groupName].categories.push({ path: categoryPath, setting: setting });
                    }
                });

                // 为每个分组创建UI
                Object.keys(categoryGroups).forEach(groupName => {
                    const group = categoryGroups[groupName];
                    if (group.categories.length > 0) {
                        // 分组标题
                        const groupTitle = document.createElement('div');
                        groupTitle.textContent = `${group.icon} ${groupName}`;
                        groupTitle.style.cssText = `
                            color: ${group.color};
                            font-size: 14px;
                            font-weight: 600;
                            margin: 16px 0 8px 0;
                            text-shadow: 0 0 8px ${group.color}40;
                            border-bottom: 1px solid ${group.color}40;
                            padding-bottom: 4px;
                        `;

                        // 分组网格
                        const groupGrid = document.createElement('div');
                        groupGrid.style.cssText = `
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                            gap: 8px;
                            margin-bottom: 12px;
                        `;

                        // 添加分类项
                        group.categories.forEach(({ path, setting }) => {
                            const categoryItem = createCategorySettingItem(path, setting, group.color);
                            groupGrid.appendChild(categoryItem);
                        });

                        adultCategoriesContainer.appendChild(groupTitle);
                        adultCategoriesContainer.appendChild(groupGrid);
                    }
                });

                adultSettingsContainer.appendChild(adultTitle);
                adultSettingsContainer.appendChild(adultCategoriesContainer);
                section.appendChild(adultSettingsContainer);
            }
        }
    });

    return section;
}

// 创建公式元素分组区域
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

    // 为该组的每个分类创建设置项
    group.categories.forEach(categoryPath => {
        const setting = randomSettings.categories[categoryPath];
        const item = createCategorySettingItem(categoryPath, setting, group.color);
        grid.appendChild(item);
    });

    groupSection.appendChild(groupTitle);
    groupSection.appendChild(grid);
    return groupSection;
}

// 创建单个分类设置项
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

    // 启用复选框
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
    };

    // 分类名称
    const name = document.createElement('div');
    // 简化显示名称，只显示最后的分类名
    const displayName = categoryPath.split('.').pop();
    name.textContent = displayName;
    name.style.cssText = `
        color: ${themeColor};
        font-size: 13px;
        font-weight: 500;
        flex: 1;
        min-width: 0;
    `;

    // 权重设置
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
    };

    // 数量设置
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
    };

    item.appendChild(checkbox);
    item.appendChild(name);
    item.appendChild(weightLabel);
    item.appendChild(weightInput);
    item.appendChild(countLabel);
    item.appendChild(countInput);

    return item;
}

// 创建全局设置区域
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
    minInput.style.cssText = `
        width: 60px;
        padding: 6px 8px;
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 4px;
        background: rgba(15, 23, 42, 0.3);
        color: #e2e8f0;
        font-size: 14px;
    `;
    minInput.onchange = () => {
        randomSettings.totalTagsRange.min = parseInt(minInput.value) || 1;
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
    maxInput.style.cssText = `
        width: 60px;
        padding: 6px 8px;
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 4px;
        background: rgba(15, 23, 42, 0.3);
        color: #e2e8f0;
        font-size: 14px;
    `;
    maxInput.onchange = () => {
        randomSettings.totalTagsRange.max = parseInt(maxInput.value) || 1;
    };

    rangeContainer.appendChild(rangeLabel);
    rangeContainer.appendChild(minInput);
    rangeContainer.appendChild(separator);
    rangeContainer.appendChild(maxInput);

    section.appendChild(title);
    section.appendChild(rangeContainer);
    return section;
}

// 重置随机设置为默认值
function resetRandomSettings() {
    randomSettings = {
        categories: {
            // [画质风格] - 画质、艺术风格、技法形式
            '画质风格.画质': { enabled: true, weight: 2, count: 1 },
            '画质风格.艺术家风格': { enabled: true, weight: 1, count: 1 },
            '画质风格.艺术流派': { enabled: true, weight: 1, count: 1 },
            '画质风格.技法形式': { enabled: true, weight: 1, count: 1 },
            '画质风格.媒介与效果': { enabled: true, weight: 1, count: 1 },
            
            // [主体] - 人物角色、外貌特征、服饰
            '主体.人物类.角色': { enabled: true, weight: 2, count: 1 },
            '主体.人物类.外貌与特征': { enabled: true, weight: 2, count: 2 },
            '主体.人物类.人设.职业': { enabled: true, weight: 1, count: 1 },
            '主体.人物类.人设.性别/年龄': { enabled: true, weight: 1, count: 1 },
            '主体.人物类.服饰': { enabled: true, weight: 2, count: 2 },
            
            // [动作] - 动作表情、姿态、手部腿部
            '动作.人物类.动作/表情.基础姿态': { enabled: true, weight: 2, count: 1 },
            '动作.人物类.动作/表情.多人互动': { enabled: true, weight: 1, count: 1 },
            '动作.人物类.动作/表情.手部': { enabled: true, weight: 1, count: 1 },
            '动作.人物类.动作/表情.腿部': { enabled: true, weight: 1, count: 1 },
            '动作.人物类.动作/表情.眼神': { enabled: true, weight: 1, count: 1 },
            '动作.人物类.动作/表情.表情': { enabled: true, weight: 2, count: 1 },
            
            // [构图视角] - 摄影构图、视角
            '构图视角.常规标签.摄影': { enabled: true, weight: 2, count: 1 },
            '构图视角.常规标签.构图': { enabled: true, weight: 2, count: 1 },
            
            // [技术参数] - 光影、色彩质感、装饰图案
            '技术参数.常规标签.光影': { enabled: true, weight: 2, count: 1 },
            '技术参数.常规标签.色彩与质感': { enabled: true, weight: 1, count: 1 },
            '技术参数.常规标签.装饰图案': { enabled: true, weight: 1, count: 1 },
            
            // [光线氛围] - 光线环境、情感氛围、背景环境
            '光线氛围.场景类.光线环境': { enabled: true, weight: 2, count: 1 },
            '光线氛围.场景类.情感与氛围': { enabled: true, weight: 2, count: 1 },
            '光线氛围.场景类.背景环境': { enabled: true, weight: 1, count: 1 },
            '光线氛围.场景类.反射效果': { enabled: true, weight: 1, count: 1 },
            
            // [场景] - 室外、室内、建筑、自然景观
            '场景.场景类.室外': { enabled: true, weight: 2, count: 1 },
            '场景.场景类.城市': { enabled: true, weight: 1, count: 1 },
            '场景.场景类.建筑': { enabled: true, weight: 2, count: 1 },
            '场景.场景类.室内装饰': { enabled: true, weight: 1, count: 1 },
            '场景.场景类.自然景观': { enabled: true, weight: 2, count: 1 },
            '场景.场景类.人造景观': { enabled: true, weight: 1, count: 1 }
        },
        
        // R18成人内容详细设置
         adultCategories: {
             // [轻度内容] - 擦边、诱惑类
             '轻度内容.涩影湿.擦边': { enabled: true, weight: 2, count: 1 },
             
             // [性行为类型] - 各种性行为
             '性行为.涩影湿.NSFW.性行为类型': { enabled: true, weight: 3, count: 2 },
             
             // [身体部位] - 身体特征描述
             '身体部位.涩影湿.NSFW.身体部位': { enabled: true, weight: 2, count: 1 },
             
             // [道具玩具] - 成人用品
             '道具玩具.涩影湿.NSFW.道具与玩具': { enabled: false, weight: 1, count: 1 },
             
             // [束缚调教] - BDSM相关
             '束缚调教.涩影湿.NSFW.束缚与调教': { enabled: false, weight: 1, count: 1 },
             
             // [特殊癖好] - 特殊情境和癖好
             '特殊癖好.涩影湿.NSFW.特殊癖好与情境': { enabled: false, weight: 1, count: 1 },
             
             // [视觉效果] - 视觉风格和特效
             '视觉效果.涩影湿.NSFW.视觉风格与特定元素': { enabled: true, weight: 1, count: 1 }
         },
        excludedCategories: ['自定义', '灵感套装'],
        includeNSFW: false,
        totalTagsRange: { min: 12, max: 20 }
    };
}

// 生成随机组合的主函数
function generateRandomCombination() {
    if (!window.tagsData) {
        alert('标签数据未加载，请稍后再试');
        return;
    }

    const generatedTags = [];
    const usedTags = new Set();

    // 获取启用的分类
    const enabledCategories = Object.keys(randomSettings.categories).filter(
        categoryPath => randomSettings.categories[categoryPath].enabled
    );

    // 如果启用了R18内容，添加成人内容分类
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

    // 按权重随机选择分类并生成标签
    enabledCategories.forEach(categoryPath => {
        // 从普通分类或成人内容分类中获取设置
        const setting = randomSettings.categories[categoryPath] || randomSettings.adultCategories[categoryPath];
        const shouldInclude = Math.random() < (setting.weight / 10); // 权重转换为概率

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

    // 如果生成的标签数量不足，随机补充
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

    // 应用生成的标签到选择器
    if (generatedTags.length > 0) {
        // 清空当前选择
        if (window.selectedTags) {
            window.selectedTags.clear();
        }
        
        // 添加生成的标签
        generatedTags.forEach(tag => {
            const tagValue = tag.value || tag.display;
            if (window.selectedTags) {
                window.selectedTags.add(tagValue);
            }
        });
        
        // 更新UI
        if (window.updateSelectedTags) {
            window.updateSelectedTags();
        }
        if (window.updateSelectedTagsOverview) {
            window.updateSelectedTagsOverview();
        }
        if (window.updateCategoryRedDots) {
            window.updateCategoryRedDots();
        }
        
        // 不显示成功消息
        // alert(`🎉 成功生成 ${generatedTags.length} 个随机标签组合！`);
    } else {
        // 可选：保留失败时的提示，或者也移除
        // alert('❌ 未能生成标签，请检查设置或标签数据');
    }
}

// 从分类路径获取标签
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

// 从对象中提取所有标签
function extractAllTagsFromObject(obj) {
    const tags = [];
    
    function extract(current, parentPath = '') {
        if (typeof current === 'object' && current !== null) {
            if (Array.isArray(current)) {
                // 处理标签数组
                current.forEach(tag => {
                    if (typeof tag === 'object' && tag.display && tag.value) {
                        tags.push(tag);
                    } else if (typeof tag === 'string') {
                        tags.push({ display: tag, value: tag });
                    }
                });
            } else {
                // 处理对象
                Object.entries(current).forEach(([key, value]) => {
                    const currentPath = parentPath ? `${parentPath}.${key}` : key;
                    
                    if (typeof value === 'string') {
                        // 这是一个标签
                        tags.push({
                            display: key,
                            value: value,
                            category: parentPath || '未分类'
                        });
                    } else if (typeof value === 'object') {
                        // 递归处理子对象
                        extract(value, currentPath);
                    }
                });
            }
        }
    }
    
    extract(obj);
    return tags;
}

// 获取所有可用标签（排除指定分类）
function getAllAvailableTags() {
    if (!window.tagsData) return [];
    
    const allTags = [];
    const excludedCategories = randomSettings.excludedCategories;
    
    function extractFromCategory(obj, categoryPath = '') {
        Object.entries(obj).forEach(([key, value]) => {
            const currentPath = categoryPath ? `${categoryPath}.${key}` : key;
            
            // 检查是否为排除的分类
            let isExcluded = excludedCategories.some(excluded => 
                currentPath.includes(excluded) || key.includes(excluded)
            );
            
            // 如果不包含NSFW，则排除NSFW分类
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

// 从数组中随机选择指定数量的标签
function getRandomTagsFromArray(tags, count) {
    if (tags.length === 0 || count <= 0) return [];
    
    const shuffled = [...tags].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, tags.length));
}

// 打开随机生成器对话框
function openRandomGeneratorDialog() {
    if (!randomGeneratorDialog) {
        createRandomGeneratorDialog();
    }
    randomGeneratorDialog.style.display = 'block';
}

// 导出函数供主文件使用
window.openRandomGeneratorDialog = openRandomGeneratorDialog;
window.generateRandomCombination = generateRandomCombination;