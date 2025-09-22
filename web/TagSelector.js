import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

app.registerExtension({
    name: "zhihui.TagSelector",
    nodeCreated(node) {
        if (node.comfyClass === "TagSelector") {
            // 添加激活按钮
            const button = node.addWidget("button", "🏷️打开标签选择器", "open_selector", () => {
                openTagSelector(node);
            });
            button.serialize = false;
        }
    }
});

let tagSelectorDialog = null;
let currentNode = null;
let tagsData = null;

// 打开标签选择器
async function openTagSelector(node) {
    currentNode = node;
    
    if (!tagsData) {
        await loadTagsData();
    }
    
    if (!tagSelectorDialog) {
        createTagSelectorDialog();
    }
    
    if (tagsData && Object.keys(tagsData).length > 0) {
        initializeCategoryList();
    }
    
    loadExistingTags();
    
    // 重置对话框位置到屏幕中央
    const dialog = tagSelectorDialog.querySelector('div');
    if (dialog) {
        dialog.style.top = '50%';
        dialog.style.left = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
    }
    
    tagSelectorDialog.style.display = 'block';
    
    // 重新绑定ESC键事件监听器（如果之前被移除了）
    if (tagSelectorDialog.keydownHandler) {
        // 先移除可能存在的旧监听器
        document.removeEventListener('keydown', tagSelectorDialog.keydownHandler);
        // 重新添加监听器
        document.addEventListener('keydown', tagSelectorDialog.keydownHandler);
    }
    
    updateSelectedTags();
}

// 加载标签数据
async function loadTagsData() {
    try {
        const response = await fetch('/zhihui/tags');
        if (response.ok) {
            const rawData = await response.json();
            // 转换新的JSON格式为界面所需的格式
            tagsData = convertTagsFormat(rawData);
        } else {
            console.warn('Failed to load tags from server, using default data');
            tagsData = getDefaultTagsData();
        }
    } catch (error) {
        console.error('Error loading tags:', error);
        tagsData = getDefaultTagsData();
    }
}

// 转换tags.json格式为界面所需格式
function convertTagsFormat(rawData) {
    // 递归将任意层对象转换：叶子->数组[{display,value}]，中间层->对象
    const convertNode = (node, isCustomCategory = false) => {
        if (node && typeof node === 'object') {
            const values = Object.values(node);
            const allString = values.every(v => typeof v === 'string');
            if (allString) {
                // 对于自定义标签，保持原始对象格式 {name: content}
                if (isCustomCategory) {
                    return node;
                }
                // 对于普通标签，转换为数组格式 [{display, value}]
                return Object.entries(node).map(([chineseName, englishValue]) => ({ display: chineseName, value: englishValue }));
            }
            const result = {};
            for (const [k, v] of Object.entries(node)) {
                // 传递自定义分类标识
                result[k] = convertNode(v, isCustomCategory);
            }
            return result;
        }
        return node;
    };
    const converted = {};
    for (const [mainCategory, subCategories] of Object.entries(rawData)) {
        // 检查是否为自定义分类
        const isCustom = mainCategory === '自定义';
        converted[mainCategory] = convertNode(subCategories, isCustom);
    }
    return converted;
}

// 检查是否存在更深层的嵌套
function hasDeepNesting(obj) {
    for (const value of Object.values(obj)) {
        if (typeof value === 'object' && value !== null) {
            return true;
        }
    }
    return false;
}

// 获取默认标签数据（已删除，仅从tags.json文件读取）
function getDefaultTagsData() {
    return {};
}

// 创建标签选择器对话框
function createTagSelectorDialog() {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: none;
    `;
    
    // 创建对话框
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 1067px;
        height: 600px;
        min-width: 640px;
        min-height: 360px;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: none;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
        z-index: 10001;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
        backdrop-filter: blur(20px);
    `;
    
    // 创建标题栏
    const header = document.createElement('div');
    header.style.cssText = `
        background:rgb(34, 77, 141);
        padding: 10px 24px;
        border-bottom: 1px solid #475569;
        display: flex;
        align-items: center;
        border-radius: 16px 16px 0 0;
        cursor: move;
        user-select: none;
        gap: 16px;
    `;
    
    const title = document.createElement('span');
    title.innerHTML = '🏷️标签选择器UI';
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
        border: 1px solid #dc2626; /* 更细边框以配合方形 */
        color: #ffffff;
        font-size: 18px; /* 调整字体大小以更好居中 */
        font-weight: 700;
        cursor: pointer;
        padding: 0;
        width: 22px; /* 圆角正方形尺寸稍大，便于点击 */
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px; /* 圆角正方形 */
        transition: all 0.2s ease;
        line-height: 22px; /* 确保行高与按钮高度一致 */
        vertical-align: middle; /* 额外确保垂直居中 */
        position: relative;
        top: 0; /* 微调位置 */
    `;
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        closeBtn.style.color = '#ffffff';
        closeBtn.style.borderColor = '#ef4444';
        closeBtn.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.4)';
        closeBtn.style.borderRadius = '6px';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
        closeBtn.style.color = '#ffffff';
        closeBtn.style.borderColor = '#dc2626';
        closeBtn.style.borderRadius = '6px';
    });
    closeBtn.onclick = () => {
        overlay.style.display = 'none';
        // 清理键盘事件监听器
        if (tagSelectorDialog && tagSelectorDialog.keydownHandler) {
            document.removeEventListener('keydown', tagSelectorDialog.keydownHandler);
        }
    };

    // 创建右侧容器，只包含关闭按钮
    const rightContainer = document.createElement('div');
    rightContainer.style.cssText = `
        display: flex;
        align-items: center;
        margin-left: auto;
        gap: 150px; /* 搜索框与关闭按钮之间更大的间隔 */
    `;
    
    // 新增：标题栏搜索框（带彩色图标）
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px; /* 增大内部间距 */
        background: linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(14,165,233,0.25) 100%);
        border: none;
        padding: 4px 12px; /* 减小内边距以降低高度 */
        border-radius: 9999px;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        min-width: 180px; /* 增大最小宽度 */
        max-width: 250px; /* 增大最大宽度 */
        transition: all 0.3s ease; /* 添加过渡效果 */
    `;
    const iconWrapper = document.createElement('div');
    iconWrapper.style.cssText = `width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; pointer-events: none;`;
    iconWrapper.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="searchGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#60A5FA"/>
                    <stop offset="1" stop-color="#06B6D4"/>
                </linearGradient>
            </defs>
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20 15.5 14zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="url(#searchGrad)"/>
        </svg>
    `;
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.setAttribute('data-role', 'tag-search');
    searchInput.placeholder = '搜索标签';
    searchInput.style.cssText = `
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color:rgb(255, 255, 255);
        font-size: 12px; /* 保持字体大小不变 */
        width: 100%;
        min-width: 80px; /* 保持最小宽度 */
        font-weight: 500; /* 保持字重 */
        height: 16px; /* 设置固定高度 */
    `;
    // 占位符样式更显眼
    (function injectTagSearchPlaceholderStyle(){
        const styleId = 'zs-tag-search-placeholder-style';
        if (!document.getElementById(styleId)) {
            const styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.textContent = `
                [data-role="tag-search"]::placeholder {
                    color:rgb(160, 200, 255); /* 提高亮度 */
                    opacity: 1;
                    font-weight: 600;
                    letter-spacing: 0.3px; /* 增加字间距 */
                    text-shadow: 0 0 4px rgba(96, 165, 250, 0.5); /* 添加文字阴影 */
                    transition: all 0.2s ease; /* 增强过渡效果 */
                }
                [data-role="tag-search"].hide-placeholder::placeholder {
                    opacity: 0; /* 选中时隐藏提示文字 */
                }
            `;
            document.head.appendChild(styleEl);
        }
    })();
    const clearSearchBtn = document.createElement('button');
    clearSearchBtn.textContent = '×';
    clearSearchBtn.title = '清除搜索';
    clearSearchBtn.style.cssText = `
        background: rgba(255, 191, 191, 0.15); /* 淡红色背景 */
        color: #fecaca; /* 字体淡红 */
        border: 1px solid rgba(239,68,68,0.35); /* 淡红描边 */
        width: 16px;
        height: 16px;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        padding: 0;
        /* 使用 inline-flex 确保图标垂直水平居中 */
        align-items: center;
        justify-content: center;
        line-height: 1;
        font-weight: 800;
        font-size: 12px;
    `;
    // 清除按钮悬停态（微微加深）
    clearSearchBtn.addEventListener('mouseenter', () => {
        clearSearchBtn.style.background = 'rgba(239,68,68,0.25)';
        clearSearchBtn.style.borderColor = 'rgba(239,68,68,0.5)';
        clearSearchBtn.style.color = '#ffb4b4';
    });
    clearSearchBtn.addEventListener('mouseleave', () => {
        clearSearchBtn.style.background = 'rgba(239,68,68,0.15)';
        clearSearchBtn.style.borderColor = 'rgba(239,68,68,0.35)';
        clearSearchBtn.style.color = '#fecaca';
    });
    // 点击容器也能聚焦输入框
    searchContainer.addEventListener('click', () => searchInput.focus());
    // 聚焦时高亮整个搜索容器
    const baseBoxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
    const baseBorder = '2px solid rgba(59,130,246,0.5)';
    searchInput.addEventListener('focus', () => {
        searchContainer.style.border = '2px solid #93c5fd'; // 增强边框
        searchContainer.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.4), 0 8px 20px rgba(59,130,246,0.5)'; // 强化外部发光效果
        searchContainer.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.35) 0%, rgba(14,165,233,0.35) 100%)'; // 增强背景透明度
        searchContainer.style.transform = 'scale(1.05)'; // 轻微放大效果
        searchInput.classList.add('hide-placeholder');
    });
    searchInput.addEventListener('blur', () => {
        searchContainer.style.border = baseBorder;
        searchContainer.style.boxShadow = baseBoxShadow;
        searchContainer.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(14,165,233,0.25) 100%)';
        searchContainer.style.transform = 'scale(1)'; // 恢复正常尺寸
        searchInput.classList.remove('hide-placeholder');
    });
    // 防止拖拽干扰输入
    [searchContainer, searchInput, clearSearchBtn].forEach(el => {
        el.addEventListener('mousedown', e => e.stopPropagation());
        el.addEventListener('click', e => e.stopPropagation());
    });
    clearSearchBtn.onclick = (e) => {
        e.stopPropagation();
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        handleSearch('');
        searchInput.focus();
    };
    searchInput.addEventListener('input', debounce(() => {
        const q = searchInput.value.trim();
        clearSearchBtn.style.display = q ? 'inline-flex' : 'none'; // 用 inline-flex 保证居中对齐
        handleSearch(q);
    }, 200));
    searchContainer.appendChild(iconWrapper);
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(clearSearchBtn);

    rightContainer.appendChild(searchContainer);
    rightContainer.appendChild(closeBtn);

    header.appendChild(title);
    header.appendChild(rightContainer);
    
    // 创建已选择标签总览区域
    const selectedOverview = document.createElement('div');
    selectedOverview.style.cssText = `
        background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
        border-bottom: 1px solid rgba(71, 85, 105, 0.8);
        display: block;
        transition: all 0.3s ease;
    `;
    
    const overviewTitle = document.createElement('div');
    overviewTitle.style.cssText = `
        padding: 8px 16px;
        font-weight: 600;
        color: #e2e8f0;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
    `;
    
    const overviewTitleText = document.createElement('span');
    overviewTitleText.innerHTML = '已选标签:';
    overviewTitleText.style.cssText = `
        text-align: left;
        line-height: 1.2;
    `;
    
    // 创建提示语元素
    const hintText = document.createElement('span');
    hintText.style.cssText = `
        color:rgb(0, 225, 255);
        font-size: 14px;
        font-weight: 400;
        font-style: normal;
    `;
    hintText.textContent = '💡未选择任何标签，请从下方选择您需要的TAG标签，或通过搜索栏快速查找。';
    
    const selectedCount = document.createElement('span');
    selectedCount.style.cssText = `
        background: #4a9eff;
        color: #fff;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(74, 158, 255, 0.3);
        display: none;
    `;
    selectedCount.textContent = '0';
    
    overviewTitle.appendChild(overviewTitleText);
    overviewTitle.appendChild(hintText);
    overviewTitle.appendChild(selectedCount);
    
    const selectedTagsList = document.createElement('div');
    selectedTagsList.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 0 20px 16px 20px;
        overflow: visible;
        display: none;
    `;
    
    selectedOverview.appendChild(overviewTitle);
    selectedOverview.appendChild(selectedTagsList);
    
    // 创建主内容区
    const content = document.createElement('div');
    content.style.cssText = `
        flex: 1;
        display: flex;
        overflow: hidden;
    `;
    
    // 创建左侧分类列表 - 一级分类容器
    const categoryList = document.createElement('div');
    categoryList.style.cssText = `
        width: 150px;
        background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
        border-right: 1px solid rgba(71, 85, 105, 0.8);
        overflow-y: auto;
        backdrop-filter: blur(10px);
    `;
    
    // 创建右侧内容区
    const rightPanel = document.createElement('div');
    rightPanel.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
    `;
    
    // 创建子分类标签栏 | 二级分类
    const subCategoryTabs = document.createElement('div');
    subCategoryTabs.style.cssText = `
        background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
        border-bottom: 1px solid rgba(71, 85, 105, 0.8);
        display: flex;
        overflow-x: auto;
        min-height: 30px; 
        backdrop-filter: blur(10px);
    `;
    
    // 创建子子分类标签栏 | 三级分类
    const subSubCategoryTabs = document.createElement('div');
    subSubCategoryTabs.style.cssText = `
        background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
        border-bottom: 1px solid rgba(71, 85, 105, 0.8);
        display: none;
        overflow-x: auto;     
        min-height: 2px;
        backdrop-filter: blur(10px);
        margin-top: 2px;
    `;
    
    // 新增：创建子子子分类标签栏 | 四级分类
    const subSubSubCategoryTabs = document.createElement('div');
    subSubSubCategoryTabs.style.cssText = `
        background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
        border-bottom: 1px solid rgba(71, 85, 105, 0.8);
        display: none;
        overflow-x: auto;     
        min-height: 2px;
        backdrop-filter: blur(10px);
        margin-top: 2px;
    `;
    
    // 创建标签内容区
    const tagContent = document.createElement('div');
    tagContent.style.cssText = `
        flex: 1;
        padding: 24px;
        overflow-y: auto;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        backdrop-filter: blur(10px);
    `;
    
    // 创建底部操作栏
    const footer = document.createElement('div');
    footer.style.cssText = `
        background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
        padding: 8px 16px;
        border-top: 1px solid rgba(71, 85, 105, 0.8);
        display: flex;
        justify-content: flex-start;
        align-items: center;
        backdrop-filter: blur(10px);
        border-radius: 0 0 16px 16px;
        column-gap: 24px;
        min-height: 60px;
        height: 60px;
        flex-shrink: 0;
    `;
    
    // 创建自定义标签功能区（左侧）
    const customTagsSection = document.createElement('div');
    customTagsSection.className = 'custom-tags-section';
    customTagsSection.style.cssText = `
        border: none;
        padding: 0;
        background: none;
        display: none;
        flex-direction: column;
        min-width: 280px;
        width: auto;
        flex-shrink: 1;
        flex: 0.8;
        justify-content: center;
    `;
    
    // 单行布局容器 - 包含标题和输入框
    const singleLineContainer = document.createElement('div');
    singleLineContainer.style.cssText = `
        display: flex;
        gap: 3px;
        align-items: center;
        background: rgba(37, 99, 235, 0.3);
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2), 0 2px 6px rgba(0, 0, 0, 0.15);
        padding: 8px 12px;
        margin-bottom: 8px;
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(59, 130, 246, 0.3);
        backdrop-filter: blur(8px);
    `;
    
    // 添加自定义样式来设置placeholder颜色
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .tag-input::placeholder {
            color: #f0f9ff !important;
            opacity: 1 !important;
        }
        .tag-input:-ms-input-placeholder {
            color: #f0f9ff !important;
            opacity: 1 !important;
        }
        .tag-input::-ms-input-placeholder {
            color: #f0f9ff !important;
            opacity: 1 !important;
        }
    `;
    document.head.appendChild(styleElement);

    // 自定义标签标题
    const customTagsTitle = document.createElement('div');
    customTagsTitle.style.cssText = `
        color: #38bdf8;
        font-size: 15px;
        font-weight: 700;
        text-align: left;
        letter-spacing: 0.3px;
        white-space: nowrap;
        flex-shrink: 0;
        padding-right: 2px;
        margin-right: 2px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    `;
    customTagsTitle.textContent = '自定义标签';
    
    // 竖向分隔线
    const verticalSeparator = document.createElement('div');
    verticalSeparator.style.cssText = `
        width: 1px;
        height: 25px;
        background: linear-gradient(to bottom, transparent, rgb(62, 178, 255), transparent);
        margin: 0 8px;
        flex-shrink: 0;
    `;
    
    // 输入表单容器 - 横向布局
    const inputForm = document.createElement('div');
    inputForm.style.cssText = `
        display: flex;
        gap: 8px; /* 控制名称输入框和内容输入框之间的间距 */
        align-items: center;
        flex-wrap: wrap;
        flex: 1;
    `;
    
    // 名称输入框 - 横向布局
    const nameInputContainer = document.createElement('div');
    nameInputContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 1px; /* 控制"名称"标签和输入框之间的间距 */
        flex: 0.45;
        min-width: 140px;
        margin: 0;
        padding: 0;
    `;
    
    const nameLabel = document.createElement('label');
    nameLabel.style.cssText = `
        color: #f1f5f9;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        min-width: 0;
        width: fit-content;
        margin: 0;
        padding: 0;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    `;
    nameLabel.textContent = '名称:';
    
    const nameInput = document.createElement('input');
    nameInput.className = 'tag-input';
    nameInput.type = 'text';
    nameInput.placeholder = '输入标签名称';
    nameInput.style.cssText = `
        background: rgba(15, 23, 42, 0.3);
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 6px;
        padding: 6px 8px;
        color: white;
        font-size: 13px;
        caret-color: white;
        outline: none;
        transition: all 0.3s ease;
        flex: 1;
        min-width: 70px;
        height: 24px;
        margin: 0;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(59, 130, 246, 0.1);
    `;
    nameInput.addEventListener('focus', () => {
        nameInput.style.borderColor = '#38bdf8';
        nameInput.style.boxShadow = '0 0 0 2px rgba(56, 189, 248, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.2)';
        nameInput.style.background = 'rgba(15, 23, 42, 0.4)';
    });
    nameInput.addEventListener('blur', () => {
        nameInput.style.borderColor = 'rgba(59, 130, 246, 0.4)';
        nameInput.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(59, 130, 246, 0.1)';
        nameInput.style.background = 'rgba(15, 23, 42, 0.3)';
    });
    
    nameInputContainer.appendChild(nameLabel);
    nameInputContainer.appendChild(nameInput);
    
    // 内容输入框 - 横向布局
    const contentInputContainer = document.createElement('div');
    contentInputContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 1px; /* 控制"内容"标签和输入框之间的间距 */
        flex: 0.8;
        min-width: 140px;
        margin: 0;
        padding: 0;
    `;
    
    const contentLabel = document.createElement('label');
    contentLabel.style.cssText = `
        color: #f1f5f9;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        min-width: 0;
        width: fit-content;
        margin: 0;
        padding: 0;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    `;
    contentLabel.textContent = '内容:';
    
    const contentInput = document.createElement('input');
    contentInput.className = 'tag-input';
    contentInput.type = 'text';
    contentInput.placeholder = '输入标签内容';
    contentInput.style.cssText = `
        background: rgba(15, 23, 42, 0.3);
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 6px;
        padding: 6px 8px;
        color: white;
        font-size: 13px;
        caret-color: white;
        outline: none;
        transition: all 0.3s ease;
        flex: 1;
        min-width: 100px;
        height: 24px;
        margin: 0;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(59, 130, 246, 0.1);
    `;
    contentInput.addEventListener('focus', () => {
        contentInput.style.borderColor = '#38bdf8';
        contentInput.style.boxShadow = '0 0 0 2px rgba(56, 189, 248, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.2)';
        contentInput.style.background = 'rgba(15, 23, 42, 0.4)';
    });
    contentInput.addEventListener('blur', () => {
        contentInput.style.borderColor = 'rgba(59, 130, 246, 0.4)';
        contentInput.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(59, 130, 246, 0.1)';
        contentInput.style.background = 'rgba(15, 23, 42, 0.3)';
    });
    
    contentInputContainer.appendChild(contentLabel);
    contentInputContainer.appendChild(contentInput);
    
    // 添加按钮 - 确保按钮完整显示
    const addButton = document.createElement('button');
    addButton.textContent = '添加';
    addButton.style.cssText = `
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
        border: 1px solid rgba(59, 130, 246, 0.7);
        color: #ffffff;
        padding: 4px 8px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 600;
        transition: all 0.3s ease;
        height: 26px;
        width: 50px;
        min-width: 50px;
        white-space: nowrap;
        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
        text-align: center;
    `;
    addButton.addEventListener('mouseenter', () => {
        addButton.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)';
        addButton.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)';
        addButton.style.borderColor = 'rgba(59, 130, 246, 0.5)';
        addButton.style.transform = 'none';
    });
    addButton.addEventListener('mouseleave', () => {
        addButton.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)';
        addButton.style.borderColor = 'rgba(59, 130, 246, 0.7)';
        addButton.style.transform = 'none';
    });
    
    // 添加标签功能
    addButton.onclick = async () => {
        const name = nameInput.value.trim();
        const content = contentInput.value.trim();
        
        if (!name || !content) {
            alert('请填写完整的名称和标签内容');
            return;
        }
        
        try {
            const response = await fetch('/zhihui/user_tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, content })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // 清空输入框
                nameInput.value = '';
                contentInput.value = '';
                
                // 重新加载标签数据
                await loadTagsData();
                
                // 重新初始化分类列表
                initializeCategoryList();
                
                // 如果当前显示的是自定义分类，刷新显示
                if (tagSelectorDialog.activeCategory === '自定义') {
                    showSubCategories('自定义');
                }
                
                alert('标签添加成功！');
            } else {
                alert(result.error || '添加失败');
            }
        } catch (error) {
            console.error('Error adding custom tag:', error);
            alert('添加失败，请重试');
        }
    };
    
    inputForm.appendChild(nameInputContainer);
    inputForm.appendChild(contentInputContainer);
    inputForm.appendChild(addButton);
    
    // 组装单行布局
    singleLineContainer.appendChild(customTagsTitle);
    singleLineContainer.appendChild(verticalSeparator);
    singleLineContainer.appendChild(inputForm);
    
    customTagsSection.appendChild(singleLineContainer);
    
    // 右侧按钮区域
    const rightButtonsSection = document.createElement('div');
    rightButtonsSection.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        margin-left: auto;
        margin-right: 40px;
        flex-shrink: 0;
    `;
    
    const clearBtn = document.createElement('button');
    clearBtn.innerHTML = '<span style="font-size: 16px; font-weight: 600; display: block;">清空选择</span>';
    clearBtn.style.cssText = `
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        border: 1px solid rgba(220, 38, 38, 0.8);
        color: #ffffff;
        padding: 10px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
        line-height: 1.2;
        height: 42px;
        width: auto;
        min-width: 90px;
        white-space: nowrap;
        font-size: 16px;
    `;
    clearBtn.addEventListener('mouseenter', () => {
        clearBtn.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
        clearBtn.style.color = '#ffffff';
        clearBtn.style.borderColor = 'rgba(248, 113, 113, 0.8)';
        clearBtn.style.transform = 'none';
    });
    clearBtn.addEventListener('mouseleave', () => {
        clearBtn.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
        clearBtn.style.color = '#ffffff';
        clearBtn.style.borderColor = 'rgba(220, 38, 38, 0.8)';
        clearBtn.style.transform = 'none';
    });
    clearBtn.onclick = () => {
        clearSelectedTags();
    };
    
    rightButtonsSection.appendChild(clearBtn);
    
    footer.appendChild(customTagsSection);
    footer.appendChild(rightButtonsSection);
    
    // 创建调整大小手柄
    const resizeHandle = document.createElement('div');
    resizeHandle.style.cssText = `
        position: absolute;
        bottom: 4px;
        right: 4px;
        width: 10px; /* 缩小尺寸调节把手 */
        height: 10px; /* 缩小尺寸调节把手 */
        background: linear-gradient(-45deg, transparent 0%, transparent 25%, rgba(59, 130, 246, 0.9) 25%, rgba(59, 130, 246, 0.9) 35%, transparent 35%, transparent 50%, rgba(59, 130, 246, 0.9) 50%, rgba(59, 130, 246, 0.9) 60%, transparent 60%, transparent 75%, rgba(59, 130, 246, 0.9) 75%, rgba(59, 130, 246, 0.9) 85%, transparent 85%); /* 更显眼的蓝色配色 */
        cursor: se-resize;
        z-index: 10002;
        border-radius: 0 0 8px 0; /* 调整圆角适应新尺寸 */
        opacity: 0.8;
        transition: opacity 0.2s ease;
    `;
    resizeHandle.addEventListener('mouseenter', () => {
        resizeHandle.style.opacity = '1';
    });
    resizeHandle.addEventListener('mouseleave', () => {
        resizeHandle.style.opacity = '0.7';
    });
    
    // 组装对话框
    rightPanel.appendChild(subCategoryTabs);
    rightPanel.appendChild(subSubCategoryTabs);
    // 新增：挂载四级分类栏
    rightPanel.appendChild(subSubSubCategoryTabs);
    rightPanel.appendChild(tagContent);
    content.appendChild(categoryList);
    content.appendChild(rightPanel);
    dialog.appendChild(header);
    dialog.appendChild(selectedOverview);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    dialog.appendChild(resizeHandle);
    overlay.appendChild(dialog);
    
    // 存储引用
    tagSelectorDialog = overlay;
    tagSelectorDialog.categoryList = categoryList;
    tagSelectorDialog.subCategoryTabs = subCategoryTabs;
    tagSelectorDialog.subSubCategoryTabs = subSubCategoryTabs;
    // 新增：持久化四级分类栏引用
    tagSelectorDialog.subSubSubCategoryTabs = subSubSubCategoryTabs;
    tagSelectorDialog.tagContent = tagContent;
    tagSelectorDialog.selectedOverview = selectedOverview;
    tagSelectorDialog.selectedCount = selectedCount;
    tagSelectorDialog.selectedTagsList = selectedTagsList;
    tagSelectorDialog.hintText = hintText;
    // 新增：存储搜索引用与激活路径状态
    tagSelectorDialog.searchInput = searchInput;
    tagSelectorDialog.searchContainer = searchContainer;
    tagSelectorDialog.activeCategory = null;
    tagSelectorDialog.activeSubCategory = null;
    tagSelectorDialog.activeSubSubCategory = null;
    tagSelectorDialog.activeSubSubSubCategory = null;
    tagSelectorDialog.selectedCount = selectedCount;
    tagSelectorDialog.selectedTagsList = selectedTagsList;
    tagSelectorDialog.hintText = hintText;
    
    // 初始化分类列表
    initializeCategoryList();
    
    // 添加到页面
    document.body.appendChild(overlay);
    
    // 添加ESC键退出功能
    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && tagSelectorDialog && tagSelectorDialog.style.display === 'block') {
            tagSelectorDialog.style.display = 'none';
            // 清理键盘事件监听器
            if (tagSelectorDialog.keydownHandler) {
                document.removeEventListener('keydown', tagSelectorDialog.keydownHandler);
            }
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    
    // 存储事件处理器引用以便后续移除
    tagSelectorDialog.keydownHandler = handleKeyDown;
    
    // 添加拖拽功能
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dialogStartX = 0;
    let dialogStartY = 0;
    
    header.addEventListener('mousedown', (e) => {
        if (e.target === closeBtn) return; // 不在关闭按钮上拖拽
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        const rect = dialog.getBoundingClientRect();
        dialogStartX = rect.left;
        dialogStartY = rect.top;
        // 如果有transform，先设置实际位置再清除transform以避免闪烁
        if (dialog.style.transform && dialog.style.transform !== 'none') {
            dialog.style.left = dialogStartX + 'px';
            dialog.style.top = dialogStartY + 'px';
            dialog.style.transform = 'none';
        }
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        const newX = Math.max(0, Math.min(window.innerWidth - dialog.offsetWidth, dialogStartX + deltaX));
        const newY = Math.max(0, Math.min(window.innerHeight - dialog.offsetHeight, dialogStartY + deltaY));
        dialog.style.left = newX + 'px';
        dialog.style.top = newY + 'px';
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        isResizing = false;
    });
    
    // 添加调整大小功能
    let isResizing = false;
    let resizeStartX = 0;
    let resizeStartY = 0;
    let dialogStartWidth = 0;
    let dialogStartHeight = 0;
    
    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        dialogStartWidth = dialog.offsetWidth;
        dialogStartHeight = dialog.offsetHeight;
        e.preventDefault();
        e.stopPropagation();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isResizing) {
            const deltaX = e.clientX - resizeStartX;
            const deltaY = e.clientY - resizeStartY;
            const newWidth = Math.max(600, dialogStartWidth + deltaX);
            const newHeight = Math.max(400, dialogStartHeight + deltaY);
            dialog.style.width = newWidth + 'px';
            dialog.style.height = newHeight + 'px';
        }
    });
    
    // 点击遮罩关闭
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.style.display = 'none';
            // 清理键盘事件监听器
            if (tagSelectorDialog && tagSelectorDialog.keydownHandler) {
                document.removeEventListener('keydown', tagSelectorDialog.keydownHandler);
            }
        }
    };
}

// 初始化分类列表 - 一级分类列表创建和样式设置
function initializeCategoryList() {
    const categoryList = tagSelectorDialog.categoryList;
    categoryList.innerHTML = '';
    
    // 遍历创建一级分类项目
    Object.keys(tagsData).forEach((category, index) => {
        const categoryItem = document.createElement('div');
        categoryItem.style.cssText = `
            padding: 12px 16px;
            color: #ccc;
            cursor: pointer;
            border-bottom: 1px solid rgba(71, 85, 105, 0.8);
            transition: all 0.2s;
            text-align: center;
            background: transparent;
        `;
        categoryItem.textContent = category;
        
        // 一级分类悬停效果颜色配置
        categoryItem.onmouseenter = () => {
            if (!categoryItem.classList.contains('active')) {
                categoryItem.style.backgroundColor = 'rgb(49, 84, 136)'; // 悬停背景色：低透明度藏青色
                categoryItem.style.color = '#fff'; // 悬停文字色：白色
            }
        };
        categoryItem.onmouseleave = () => {
            if (!categoryItem.classList.contains('active')) {
                categoryItem.style.backgroundColor = 'transparent'; // 恢复默认背景色：透明
                categoryItem.style.boxShadow = 'none';
                categoryItem.style.color = '#ccc'; // 恢复默认文字色：浅灰色
            }
        };

        
        categoryItem.onclick = () => {
            // 移除其他活动状态
            categoryList.querySelectorAll('.active').forEach(item => {
                item.classList.remove('active');
                item.style.backgroundColor = 'transparent';
                item.style.color = '#ccc';
                item.style.borderTop = 'none';
                item.style.borderLeft = 'none';
                item.style.borderRight = 'none';
            });
            
            // 设置当前活动状态
            categoryItem.classList.add('active');
            categoryItem.style.backgroundColor = '#1d4ed8';
            categoryItem.style.color = '#fff';
            
            // 新增：记录激活路径（重置更深层）
            tagSelectorDialog.activeCategory = category;
            tagSelectorDialog.activeSubCategory = null;
            tagSelectorDialog.activeSubSubCategory = null;
            tagSelectorDialog.activeSubSubSubCategory = null;
            
            // 控制自定义标签界面的显示
            if (category === '自定义') {
                tagSelectorDialog.querySelector('.custom-tags-section').style.display = 'flex';
            } else {
                tagSelectorDialog.querySelector('.custom-tags-section').style.display = 'none';
            }
            
            // 显示子分类
            showSubCategories(category);
        };
        
        categoryList.appendChild(categoryItem);
        
        // 默认选择第一个分类
        if (index === 0) {
            categoryItem.click();
        }
    });
}

// 显示子分类
function showSubCategories(category) {
    const subCategoryTabs = tagSelectorDialog.subCategoryTabs;
    subCategoryTabs.innerHTML = '';

    // 切换二级分类时，隐藏并清空三级、四级分类栏
    if (tagSelectorDialog.subSubCategoryTabs) {
        tagSelectorDialog.subSubCategoryTabs.style.display = 'none';
        tagSelectorDialog.subSubCategoryTabs.innerHTML = '';
    }
    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
        tagSelectorDialog.subSubSubCategoryTabs.innerHTML = '';
    }
    const subCategories = tagsData[category];
    Object.keys(subCategories).forEach((subCategory, index) => {
        const tab = document.createElement('div');
        tab.style.cssText = `
            padding: 10px 16px;
            color: #ccc;
            cursor: pointer;
            border-right: 1px solid rgba(71, 85, 105, 0.8);
            white-space: nowrap;
            transition: background-color 0.2s;
            min-width: 80px;
            text-align: center;
        `;
        tab.textContent = subCategory;
        
        // 二级分类悬停效果颜色配置
        tab.onmouseenter = () => {
            if (!tab.classList.contains('active')) {
                tab.style.backgroundColor = 'rgb(49, 84, 136)'; // 悬停背景色：低透明度藏青色
                tab.style.color = '#fff'; // 悬停文字色：白色
            }
        };
        tab.onmouseleave = () => {
            if (!tab.classList.contains('active')) {
                tab.style.backgroundColor = 'transparent'; // 恢复默认背景色：透明
                tab.style.boxShadow = 'none';
                tab.style.color = '#ccc'; // 恢复默认文字色：浅灰色
            }
        };
        
        tab.onclick = () => {
            // 移除其他活动状态
            subCategoryTabs.querySelectorAll('.active').forEach(item => {
                item.classList.remove('active');
                item.style.backgroundColor = 'transparent';
                item.style.color = '#ccc';
                item.style.borderTop = 'none';
                item.style.borderLeft = 'none';
                item.style.borderBottom = 'none';
                // 保留右边框作为分隔线
                item.style.borderRight = '1px solid rgba(71, 85, 105, 0.8)';
            });
            
            // 设置当前活动状态
            tab.classList.add('active');
            tab.style.backgroundColor = '#3b82f6';
            tab.style.color = '#fff';
            
            // 新增：记录激活路径（重置更深层）
            tagSelectorDialog.activeSubCategory = subCategory;
            tagSelectorDialog.activeSubSubCategory = null;
            tagSelectorDialog.activeSubSubSubCategory = null;
            
            // 检查是否有子子分类
            const subCategoryData = tagsData[category][subCategory];
            
            // 特殊处理自定义分类
            if (category === '自定义') {
                // 自定义分类直接显示标签，不需要进一步分类
                showTags(category, subCategory);
            } else if (Array.isArray(subCategoryData)) {
                // 普通标签：数组格式直接显示标签
                showTags(category, subCategory);
            } else {
                // 普通标签：对象格式显示子子分类
                showSubSubCategories(category, subCategory);
            }
        };
        
        subCategoryTabs.appendChild(tab);
        
        // 默认选择第一个子分类
        if (index === 0) {
            tab.click();
        }
    });
}

// 显示子子分类
function showSubSubCategories(category, subCategory) {
    const subSubCategoryTabs = tagSelectorDialog.subSubCategoryTabs;
    subSubCategoryTabs.innerHTML = '';
    subSubCategoryTabs.style.display = 'flex';
    
    // 切换三级分类时，隐藏并清空四级分类栏
    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
        tagSelectorDialog.subSubSubCategoryTabs.innerHTML = '';
    }
    
    const subSubCategories = tagsData[category][subCategory];
    Object.keys(subSubCategories).forEach((subSubCategory, index) => {
        const tab = document.createElement('div');
        tab.style.cssText = `
            padding: 8px 12px;
            color: #ccc;
            cursor: pointer;
            border-right: 1px solid rgba(71, 85, 105, 0.8);
            white-space: nowrap;
            transition: background-color 0.2s;
            min-width: 60px;
            text-align: center;
            font-size: 13px;
        `;
        tab.textContent = subSubCategory;
        
        // 三级分类悬停效果颜色配置
        tab.onmouseenter = () => {
            if (!tab.classList.contains('active')) {
                tab.style.backgroundColor = 'rgb(49, 84, 136)';
                tab.style.color = '#fff';
            }
        };
        tab.onmouseleave = () => {
            if (!tab.classList.contains('active')) {
                tab.style.backgroundColor = 'transparent';
                tab.style.boxShadow = 'none';
                tab.style.color = '#ccc';
            }
        };
        
        tab.onclick = () => {
            // 移除其他活动状态
            subSubCategoryTabs.querySelectorAll('.active').forEach(item => {
                item.classList.remove('active');
                item.style.backgroundColor = 'transparent';
                item.style.color = '#ccc';
                item.style.borderTop = 'none';
                item.style.borderLeft = 'none';
                item.style.borderBottom = 'none';
            });
            
            // 设置当前活动状态
            tab.classList.add('active');
            tab.style.backgroundColor = '#3b82f6';
            tab.style.color = '#fff';
            
            // 记录激活路径：三级分类
            tagSelectorDialog.activeSubSubCategory = subSubCategory;
            tagSelectorDialog.activeSubSubSubCategory = null;
            
            const subSubCategoryData = tagsData[category][subCategory][subSubCategory];
            if (Array.isArray(subSubCategoryData)) {
                // 无更深层，直接显示标签
                if (tagSelectorDialog.subSubSubCategoryTabs) {
                    tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
                    tagSelectorDialog.subSubSubCategoryTabs.innerHTML = '';
                }
                showTagsFromSubSub(category, subCategory, subSubCategory);
            } else {
                // 还有更深层（四级分类）
                showSubSubSubCategories(category, subCategory, subSubCategory);
            }
        };
        
        subSubCategoryTabs.appendChild(tab);
        
        // 默认选择第一个子子分类
        if (index === 0) {
            tab.click();
        }
    });
}

// 新增：显示子子子分类（四级）
function showSubSubSubCategories(category, subCategory, subSubCategory) {
    const el = tagSelectorDialog.subSubSubCategoryTabs;
    if (!el) return;

    // 清空并显示四级分类栏
    el.innerHTML = '';
    el.style.display = 'flex';

    const map = tagsData?.[category]?.[subCategory]?.[subSubCategory];
    if (!map) {
        el.style.display = 'none';
        return;
    }

    // 如果是叶子数组，直接显示标签并隐藏四级栏
    if (Array.isArray(map)) {
        el.style.display = 'none';
        showTagsFromSubSub(category, subCategory, subSubCategory);
        return;
    }

    // 构建四级分类 tabs
    Object.keys(map).forEach((name, index) => {
        const tab = document.createElement('div');
        tab.style.cssText = `
            padding: 6px 10px;
            color: #ccc;
            cursor: pointer;
            border-right: 1px solid rgba(71, 85, 105, 0.8);
            white-space: nowrap;
            transition: background-color 0.2s;
            min-width: 50px;
            text-align: center;
            font-size: 12px;
        `;
        tab.textContent = name;

        tab.onmouseenter = () => {
            if (!tab.classList.contains('active')) {
                tab.style.backgroundColor = 'rgb(49, 84, 136)';
                tab.style.color = '#fff';
            }
        };
        tab.onmouseleave = () => {
            if (!tab.classList.contains('active')) {
                tab.style.backgroundColor = 'transparent';
                tab.style.boxShadow = 'none';
                tab.style.color = '#ccc';
            }
        };

        tab.onclick = () => {
            el.querySelectorAll('.active').forEach(item => {
                item.classList.remove('active');
                item.style.backgroundColor = 'transparent';
                item.style.color = '#ccc';
                item.style.borderTop = 'none';
                item.style.borderLeft = 'none';
                item.style.borderBottom = 'none';
            });
            tab.classList.add('active');
            tab.style.backgroundColor = '#3b82f6';
            tab.style.color = '#fff';

            // 记录激活路径：四级分类
            tagSelectorDialog.activeSubSubSubCategory = name;

            showTagsFromSubSubSub(category, subCategory, subSubCategory, name);
        };

        el.appendChild(tab);
        if (index === 0) tab.click();
    });
}

// 显示标签（三级结构）
function showTags(category, subCategory) {
    // 隐藏子子分类栏
    const subSubCategoryTabs = tagSelectorDialog.subSubCategoryTabs;
    subSubCategoryTabs.style.display = 'none';
    // 同时隐藏四级分类栏
    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
        tagSelectorDialog.subSubSubCategoryTabs.innerHTML = '';
    }

    const tagContent = tagSelectorDialog.tagContent;
    tagContent.innerHTML = '';
    
    const tags = tagsData[category][subCategory];
    const isCustomCategory = category === '自定义';
    
    // 如果是自定义分类且没有标签，显示提示信息
    if (isCustomCategory && (!tags || Object.keys(tags).length === 0)) {
        const emptyMessage = document.createElement('div');
        emptyMessage.style.cssText = `
            text-align: center;
            color: #94a3b8;
            font-size: 16px;
            margin-top: 50px;
            padding: 20px;
        `;
        emptyMessage.textContent = '暂无自定义标签，请在底部添加';
        tagContent.appendChild(emptyMessage);
        return;
    }
    
    // 处理自定义标签（对象格式）和普通标签（数组或对象格式）
    let tagEntries;
    if (isCustomCategory) {
        // 自定义标签是对象格式 {name: content}
        tagEntries = Object.entries(tags);
    } else if (Array.isArray(tags)) {
        // 普通标签是数组格式 [{display: "name", value: "content"}]
        tagEntries = tags.map(tagObj => [tagObj.display, tagObj.value]);
    } else {
        // 普通标签也可能是对象格式 {display: value}
        tagEntries = Object.entries(tags);
    }
    
    tagEntries.forEach(([display, value]) => {
        const tagContainer = document.createElement('div');
        tagContainer.style.cssText = `
            display: inline-block;
            position: relative;
            margin: 4px;
        `;
        
        const tagElement = document.createElement('span');
        tagElement.style.cssText = `
            display: inline-block;
            padding: 6px 12px;
            ${isCustomCategory ? 'padding-right: 30px;' : ''}
            background: #444;
            color: #ccc;
            border-radius: 16px;
            cursor: pointer;
            transition: background-color 0.2s, color 0.2s, border-color 0.2s;
            border: 1px solid rgba(71, 85, 105, 0.8);
            font-size: 14px;
            position: relative;
        `;
        
        // 显示名称
        tagElement.textContent = display;
        // 存储值用于选择
        tagElement.dataset.value = value;
        
        // 检查是否已选择
        if (isTagSelected(value)) {
            tagElement.style.backgroundColor = '#22c55e';
            tagElement.style.color = '#fff';
            tagElement.style.borderColor = '#22c55e';
        }
        
        // 创建自定义提示框
        const createCustomTooltip = () => {
            const tooltip = document.createElement('div');
            tooltip.style.cssText = `
                position: absolute;
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                color: #fff;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: pre-wrap;
                z-index: 10000;
                border: 1px solid #3b82f6;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
                transform: translateY(-100%) translateY(-8px);
                max-width: 300px;
                word-wrap: break-word;
                line-height: 1.4;
            `;
            tooltip.textContent = value;
            return tooltip;
        };
        
        let tooltip = null;
        
        tagElement.onmouseenter = (e) => {
            if (!isTagSelected(value)) {
                tagElement.style.backgroundColor = 'rgb(49, 84, 136)';
                tagElement.style.borderColor = '#1e293b';
                tagElement.style.color = '#fff';
                tagElement.style.borderWidth = '1px';
            }
            if (tooltip && tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
                tooltip = null;
            }
            tooltip = createCustomTooltip();
            document.body.appendChild(tooltip);
            const rect = tagElement.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top + 'px';
            setTimeout(() => { if (tooltip) tooltip.style.opacity = '1'; }, 10);
        };
        
        tagElement.onmouseleave = () => {
            if (!isTagSelected(value)) {
                tagElement.style.backgroundColor = '#444';
                tagElement.style.borderColor = '#555';
                tagElement.style.color = '#ccc';
                tagElement.style.borderWidth = '1px';
                tagElement.style.boxShadow = 'none';
            }
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (tooltip && tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                    tooltip = null;
                }, 200);
            }
        };
        
        tagElement.onclick = () => {
            toggleTag(value, tagElement);
        };
        
        tagContainer.appendChild(tagElement);
        
        // 为自定义标签添加删除按钮
        if (isCustomCategory) {
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '×';
            deleteBtn.style.cssText = `
                position: absolute;
                top: -2px;
                right: 2px;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                border: 1px solid #ef4444;
                color: #ffffff;
                font-size: 12px;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
                z-index: 1;
            `;
            
            deleteBtn.addEventListener('mouseenter', () => {
                deleteBtn.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                deleteBtn.style.transform = 'scale(1.1)';
                deleteBtn.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.5)';
            });
            
            deleteBtn.addEventListener('mouseleave', () => {
                deleteBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                deleteBtn.style.transform = 'scale(1)';
                deleteBtn.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)';
            });
            
            deleteBtn.onclick = async (e) => {
                e.stopPropagation();
                
                if (confirm(`确定要删除自定义标签 "${display}" 吗？`)) {
                    try {
                        const response = await fetch('/zhihui/user_tags', {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ name: display })
                        });
                        
                        const result = await response.json();
                        
                        if (response.ok) {
                            // 如果该标签已被选中，从选中列表中移除
                            if (isTagSelected(value)) {
                                selectedTags.delete(value);
                                updateSelectedTagsOverview();
                            }
                            
                            // 重新加载标签数据
                            await loadTagsData();
                            
                            // 重新初始化分类列表
                            initializeCategoryList();
                            
                            // 刷新当前显示
                            if (tagSelectorDialog.activeCategory === '自定义') {
                                showSubCategories('自定义');
                            }
                            
                            alert('标签删除成功！');
                        } else {
                            alert(result.error || '删除失败');
                        }
                    } catch (error) {
                        console.error('Error deleting custom tag:', error);
                        alert('删除失败，请重试');
                    }
                }
            };
            
            tagContainer.appendChild(deleteBtn);
        }
        
        tagContent.appendChild(tagContainer);
    });
}

// 显示标签（四级结构）
function showTagsFromSubSub(category, subCategory, subSubCategory) {
    // 切到四级标签或更深时，先隐藏四级分类栏（由更深函数决定是否显示）
    if (tagSelectorDialog.subSubSubCategoryTabs) {
        // 保持现状，不强制隐藏，交给上层控制
    }

    const tagContent = tagSelectorDialog.tagContent;
    tagContent.innerHTML = '';
    
    const tags = tagsData[category][subCategory][subSubCategory];
    tags.forEach(tagObj => {
        const tagElement = document.createElement('span');
        tagElement.style.cssText = `
            display: inline-block;
            padding: 6px 12px;
            margin: 4px;
            background: #444;
            color: #ccc;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid rgba(71, 85, 105, 0.8);
            font-size: 14px;
            position: relative;
        `;
        
        // 显示中文名称
        tagElement.textContent = tagObj.display;
        // 存储英文值用于选择
        tagElement.dataset.value = tagObj.value;
        
        // 检查是否已选择（基于英文值）
        if (isTagSelected(tagObj.value)) {
            tagElement.style.backgroundColor = '#22c55e';
            tagElement.style.color = '#fff';
            tagElement.style.borderColor = '#22c55e';
        }
        
        // 创建自定义提示框 - 精美的带外框线矩形框提示
        const createCustomTooltip = () => {
            const tooltip = document.createElement('div');
            tooltip.style.cssText = `
                position: absolute;
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                color: #fff;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: pre-wrap;
                z-index: 10000;
                border: 1px solid #3b82f6;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
                transform: translateY(-100%) translateY(-8px);
                max-width: 300px;
                word-wrap: break-word;
            `;
            tooltip.textContent = tagObj.value;
            return tooltip;
        };
        
        let tooltip = null;
        
        tagElement.onmouseenter = (e) => {
            if (!isTagSelected(tagObj.value)) {
                tagElement.style.backgroundColor = 'rgb(49, 84, 136)';
                tagElement.style.borderColor = '#1e293b';
                tagElement.style.color = '#fff';
            }
            if (tooltip && tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
                tooltip = null;
            }
            tooltip = createCustomTooltip();
            document.body.appendChild(tooltip);
            const rect = tagElement.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top + 'px';
            setTimeout(() => { if (tooltip) tooltip.style.opacity = '1'; }, 10);
        };
        
        tagElement.onmouseleave = () => {
            if (!isTagSelected(tagObj.value)) {
                tagElement.style.backgroundColor = '#444';
                tagElement.style.borderColor = '#555';
                tagElement.style.color = '#ccc';
            }
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (tooltip && tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                    tooltip = null;
                }, 200);
            }
        };
        
        tagElement.onclick = () => {
            toggleTag(tagObj.value, tagElement);
        };
        
        tagContent.appendChild(tagElement);
    });
}

// 显示标签（五级结构：四级分类下的标签）
function showTagsFromSubSubSub(category, subCategory, subSubCategory, subSubSubCategory) {
    const tagContent = tagSelectorDialog.tagContent;
    tagContent.innerHTML = '';

    const tags = tagsData[category][subCategory][subSubCategory][subSubSubCategory];
    tags.forEach(tagObj => {
        const tagElement = document.createElement('span');
        tagElement.style.cssText = `
            display: inline-block;
            padding: 6px 12px;
            margin: 4px;
            background: #444;
            color: #ccc;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid rgba(71, 85, 105, 0.8);
            font-size: 14px;
            position: relative;
        `;

        tagElement.textContent = tagObj.display;
        tagElement.dataset.value = tagObj.value;

        if (isTagSelected(tagObj.value)) {
            tagElement.style.backgroundColor = '#22c55e';
            tagElement.style.color = '#fff';
            tagElement.style.borderColor = '#22c55e';
        }

        let tooltip = null;
        const createCustomTooltip = () => {
            const tooltip = document.createElement('div');
            tooltip.style.cssText = `
                position: absolute;
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                color: #fff;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: pre-wrap;
                z-index: 10000;
                border: 1px solid #3b82f6;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
                transform: translateY(-100%) translateY(-8px);
                max-width: 300px;
                word-wrap: break-word;
            `;
            tooltip.textContent = tagObj.value;
            return tooltip;
        };

        tagElement.onmouseenter = (e) => {
            if (!isTagSelected(tagObj.value)) {
                tagElement.style.backgroundColor = 'rgb(49, 84, 136)';
                tagElement.style.borderColor = '#1e293b';
                tagElement.style.color = '#fff';
            }
            if (tooltip && tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
                tooltip = null;
            }
            tooltip = createCustomTooltip();
            document.body.appendChild(tooltip);
            const rect = tagElement.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top + 'px';
            setTimeout(() => { if (tooltip) tooltip.style.opacity = '1'; }, 10);
        };

        tagElement.onmouseleave = () => {
            if (!isTagSelected(tagObj.value)) {
                tagElement.style.backgroundColor = '#444';
                tagElement.style.borderColor = '#555';
                tagElement.style.color = '#ccc';
            }
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (tooltip && tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                    tooltip = null;
                }, 200);
            }
        };

        tagElement.onclick = () => {
            toggleTag(tagObj.value, tagElement);
        };

        tagContent.appendChild(tagElement);
    });
}

// 选择的标签集合
let selectedTags = new Set();

// 切换标签选择状态
function toggleTag(tag, element) {
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        element.style.backgroundColor = '#444';
        element.style.color = '#ccc';
        element.style.borderColor = '#555';
    } else {
        selectedTags.add(tag);
        element.style.backgroundColor = '#22c55e';
        element.style.color = '#fff';
        element.style.borderColor = '#22c55e';
    }
    
    updateSelectedTags();
}

// 检查标签是否已选择
function isTagSelected(tag) {
    return selectedTags.has(tag);
}

// 更新选择的标签到节点
function updateSelectedTags() {
    if (currentNode) {
        const tagEditWidget = currentNode.widgets.find(w => w.name === 'tag_edit');
        if (tagEditWidget) {
            tagEditWidget.value = Array.from(selectedTags).join(', ');
            // 触发变化事件
            if (tagEditWidget.callback) {
                tagEditWidget.callback(tagEditWidget.value);
            }
        }
    }
    
    // 更新已选择标签总览
    updateSelectedTagsOverview();
}

// 更新已选择标签总览显示
function updateSelectedTagsOverview() {
    if (!tagSelectorDialog) return;
    
    const selectedCount = tagSelectorDialog.selectedCount;
    const selectedTagsList = tagSelectorDialog.selectedTagsList;
    const selectedOverview = tagSelectorDialog.selectedOverview;
    const hintText = tagSelectorDialog.hintText;
    
    // 更新标签数量
    selectedCount.textContent = selectedTags.size;
    
    // 清空现有标签列表
    selectedTagsList.innerHTML = '';
    
    // 根据是否有选中标签来显示不同内容
    if (selectedTags.size > 0) {
        // 有选中标签时：隐藏提示语，显示统计组件和标签列表
        hintText.style.display = 'none';
        selectedCount.style.display = 'inline-block';
        selectedTagsList.style.display = 'flex';
        
        // 添加每个已选择的标签
        selectedTags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.style.cssText = `
                background: #4a9eff;
                color: #fff;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                cursor: pointer;
            `;
            
            const tagText = document.createElement('span');
            tagText.textContent = tag;
            
            const removeBtn = document.createElement('span');
            removeBtn.textContent = '×';
            removeBtn.style.cssText = `
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                opacity: 0.8;
            `;
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                removeSelectedTag(tag);
            };
            
            tagElement.appendChild(tagText);
            tagElement.appendChild(removeBtn);
            selectedTagsList.appendChild(tagElement);
        });
    } else {
        // 没有选中标签时：显示提示语，隐藏统计组件和标签列表
        hintText.style.display = 'inline-block';
        selectedCount.style.display = 'none';
        selectedTagsList.style.display = 'none';
    }
}

// 移除已选择的标签
function removeSelectedTag(tag) {
    selectedTags.delete(tag);
    
    // 更新标签选择状态显示
    const tagElements = tagSelectorDialog.tagContent.querySelectorAll('span');
    tagElements.forEach(element => {
        if (element.textContent === tag) {
            element.style.backgroundColor = '#444';
            element.style.color = '#ccc';
            element.style.borderColor = '#555';
        }
    });
    
    updateSelectedTags();
    updateSelectedTagsOverview();
}

// 从节点加载已有的标签选择
function loadExistingTags() {
    selectedTags.clear();
    if (currentNode) {
        const tagEditWidget = currentNode.widgets.find(w => w.name === 'tag_edit');
        if (tagEditWidget && tagEditWidget.value) {
            const currentTags = tagEditWidget.value.split(',').map(t => t.trim()).filter(t => t);
            currentTags.forEach(tag => selectedTags.add(tag));
        }
    }
    // 更新总览显示
    updateSelectedTagsOverview();
}

// 清空选择的标签
function clearSelectedTags() {
    selectedTags.clear();
    
    // 更新界面
    const tagElements = tagSelectorDialog.tagContent.querySelectorAll('span');
    tagElements.forEach(element => {
        element.style.backgroundColor = '#444';
        element.style.color = '#ccc';
        element.style.borderColor = '#555';
    });
    
    updateSelectedTags();
    updateSelectedTagsOverview();
}

// 应用选择的标签
function applySelectedTags() {
    updateSelectedTags();
    // 关闭对话框
    if (tagSelectorDialog) {
        tagSelectorDialog.style.display = 'none';
        // 清理键盘事件监听器
        if (tagSelectorDialog.keydownHandler) {
            document.removeEventListener('keydown', tagSelectorDialog.keydownHandler);
        }
    }
}

// 新增：搜索与结果渲染辅助函数
function debounce(fn, wait) {
    let t = null;
    return function(...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

function handleSearch(query) {
    if (!tagSelectorDialog) return;
    const q = (query || '').trim();
    if (!q) {
        // 恢复到当前激活视图
        restoreActiveView();
        return;
    }
    const results = searchTags(q);
    showSearchResults(results, q);
}

function restoreActiveView() {
    const a = tagSelectorDialog;
    if (a.activeCategory && a.activeSubCategory && a.activeSubSubCategory && a.activeSubSubSubCategory) {
        showTagsFromSubSubSub(a.activeCategory, a.activeSubCategory, a.activeSubSubCategory, a.activeSubSubSubCategory);
    } else if (a.activeCategory && a.activeSubCategory && a.activeSubSubCategory) {
        showTagsFromSubSub(a.activeCategory, a.activeSubCategory, a.activeSubSubCategory);
    } else if (a.activeCategory && a.activeSubCategory) {
        showTags(a.activeCategory, a.activeSubCategory);
    } else if (a.activeCategory) {
        showSubCategories(a.activeCategory);
    } else {
        initializeCategoryList();
    }
}

function searchTags(query) {
    const q = query.toLowerCase();
    const results = [];
    const walk = (node, pathArr) => {
        if (Array.isArray(node)) {
            node.forEach(t => {
                const c = (t.display || '').toLowerCase();
                const e = (t.value || '').toLowerCase();
                if (c.includes(q) || e.includes(q)) {
                    results.push({ ...t, path: [...pathArr] });
                }
            });
        } else if (node && typeof node === 'object') {
            Object.entries(node).forEach(([k, v]) => walk(v, [...pathArr, k]));
        }
    };
    Object.entries(tagsData || {}).forEach(([k, v]) => walk(v, [k]));
    return results;
}

function showSearchResults(results, q) {
    const container = tagSelectorDialog.tagContent;
    container.innerHTML = '';

    // 顶部提示条
    const infoBar = document.createElement('div');
    infoBar.style.cssText = `
        margin: 6px 4px 12px 4px;
        padding: 8px 12px;
        border-radius: 8px;
        background: rgba(59,130,246,0.12);
        color: #93c5fd;
        border: 1px solid rgba(59,130,246,0.35);
        font-size: 12px;
    `;
    infoBar.textContent = `搜索 “${q}” ，共 ${results.length} 个结果`;
    container.appendChild(infoBar);

    results.forEach(tagObj => {
        const tagElement = document.createElement('span');
        tagElement.style.cssText = `
            display: inline-block;
            padding: 6px 12px;
            margin: 4px;
            background: #444;
            color: #ccc;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid rgba(71, 85, 105, 0.8);
            font-size: 14px;
            position: relative;
        `;
        
        tagElement.textContent = tagObj.display;
        tagElement.dataset.value = tagObj.value;
        if (isTagSelected(tagObj.value)) {
            tagElement.style.backgroundColor = '#22c55e';
            tagElement.style.color = '#fff';
            tagElement.style.borderColor = '#22c55e';
        }
        let tooltip = null;
        const createCustomTooltip = () => {
            const tooltip = document.createElement('div');
            tooltip.style.cssText = `
                position: absolute;
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                color: #fff;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: pre-wrap;
                z-index: 10000;
                border: 1px solid #3b82f6;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
                transform: translateY(-100%) translateY(-8px);
                max-width: 320px;
                word-wrap: break-word;
                line-height: 1.4;
            `;
            const pathStr = (tagObj.path || []).join(' > ');
            tooltip.textContent = `${tagObj.value}${pathStr ? `\n路径: ${pathStr}` : ''}`;
            return tooltip;
        };
        tagElement.onmouseenter = () => {
            if (!isTagSelected(tagObj.value)) {
                tagElement.style.backgroundColor = 'rgb(49, 84, 136)';
                tagElement.style.borderColor = '#1e293b';
                tagElement.style.color = '#fff';
            }
            if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
            tooltip = createCustomTooltip();
            document.body.appendChild(tooltip);
            const rect = tagElement.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top + 'px';
            setTimeout(() => { if (tooltip) tooltip.style.opacity = '1'; }, 10);
        };
        tagElement.onmouseleave = () => {
            if (!isTagSelected(tagObj.value)) {
                tagElement.style.backgroundColor = '#444';
                tagElement.style.borderColor = '#555';
                tagElement.style.color = '#ccc';
            }
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(() => { if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip); tooltip = null; }, 200);
            }
        };
        tagElement.onclick = () => toggleTag(tagObj.value, tagElement);
        container.appendChild(tagElement);
    });
}