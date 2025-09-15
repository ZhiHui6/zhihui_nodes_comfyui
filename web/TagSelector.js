import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

// 标签选择器扩展
app.registerExtension({
    name: "zhihui.TagSelector",
    nodeCreated(node) {
        if (node.comfyClass === "TagSelector") {
            // 添加激活按钮
            const button = node.addWidget("button", "🏷️ 打开标签选择器 | Open Tag Selector", "open_selector", () => {
                openTagSelector(node);
            });
            button.serialize = false; // 防止按钮被序列化
        }
    }
});

// 全局变量
let tagSelectorDialog = null;
let currentNode = null;
let tagsData = null;

// 打开标签选择器
async function openTagSelector(node) {
    currentNode = node;
    
    // 加载标签数据
    if (!tagsData) {
        await loadTagsData();
    }
    
    // 创建或显示对话框
    if (!tagSelectorDialog) {
        createTagSelectorDialog();
    }
    
    // 初始化分类列表（确保数据加载后显示）
    if (tagsData && Object.keys(tagsData).length > 0) {
        initializeCategoryList();
    }
    
    // 加载已有的标签选择
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
    const converted = {};
    
    for (const [mainCategory, subCategories] of Object.entries(rawData)) {
        converted[mainCategory] = {};
        
        for (const [subCategory, content] of Object.entries(subCategories)) {
            // 检查是否还有更深层的嵌套
            if (hasDeepNesting(content)) {
                // 四级嵌套：主分类->子分类->子子分类->标签
                converted[mainCategory][subCategory] = {};
                for (const [subSubCategory, tags] of Object.entries(content)) {
                    converted[mainCategory][subCategory][subSubCategory] = [];
                    for (const [chineseName, englishValue] of Object.entries(tags)) {
                        const tagObj = {
                            display: chineseName,
                            value: englishValue
                        };
                        converted[mainCategory][subCategory][subSubCategory].push(tagObj);
                    }
                }
            } else {
                // 三级嵌套：主分类->子分类->标签
                converted[mainCategory][subCategory] = [];
                for (const [chineseName, englishValue] of Object.entries(content)) {
                    const tagObj = {
                        display: chineseName,
                        value: englishValue
                    };
                    converted[mainCategory][subCategory].push(tagObj);
                }
            }
        }
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
        width: 1600px;
        height: 900px;
        min-width: 960px;
        min-height: 540px;
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
        backdrop-filter: blur(10px);
    `;
    
    const title = document.createElement('span');
    title.innerHTML = '🏷️ 标签选择器 | Tag Selector';
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
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        border: 2px solid #ef4444;
        color: #ffffff;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        padding: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        backdrop-filter: blur(10px);
    `;
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
        closeBtn.style.color = '#ffffff';
        closeBtn.style.borderColor = '#dc2626';
        closeBtn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.6)';
        closeBtn.style.transform = 'scale(1.1)';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        closeBtn.style.color = '#ffffff';
        closeBtn.style.borderColor = '#ef4444';
        closeBtn.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.4)';
        closeBtn.style.transform = 'scale(1)';
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
    `;
    
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
        padding: 12px 20px;
        font-weight: 600;
        color: #e2e8f0;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
    `;
    
    const overviewTitleText = document.createElement('span');
    overviewTitleText.textContent = '已选择的标签：';
    
    // 创建提示语元素
    const hintText = document.createElement('span');
    hintText.style.cssText = `
        color:rgb(0, 225, 255);
        font-size: 14px;
        font-weight: 400;
        font-style: normal;
    `;
    hintText.textContent = '请选择TAG标签 / Please Select TAG';
    
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
        padding: 18px 20px;
        border-top: 1px solid rgba(71, 85, 105, 0.8);
        display: flex;
        justify-content: flex-end;
        align-items: center;
        backdrop-filter: blur(10px);
        border-radius: 0 0 16px 16px;
    `;
    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = '清空选择';
    clearBtn.style.cssText = `
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        border: 1px solid rgba(220, 38, 38, 0.8);
        color: #ffffff;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);
    `;
    clearBtn.addEventListener('mouseenter', () => {
        clearBtn.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
        clearBtn.style.transform = 'translateY(-1px)';
        clearBtn.style.boxShadow = '0 6px 12px rgba(248, 113, 113, 0.5)';
        clearBtn.style.color = '#ffffff';
        clearBtn.style.borderColor = 'rgba(248, 113, 113, 0.8)';
    });
    clearBtn.addEventListener('mouseleave', () => {
        clearBtn.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
        clearBtn.style.transform = 'translateY(0)';
        clearBtn.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.3)';
        clearBtn.style.color = '#ffffff';
        clearBtn.style.borderColor = 'rgba(220, 38, 38, 0.8)';
    });
    clearBtn.onclick = () => {
        clearSelectedTags();
    };
    
    footer.appendChild(clearBtn);
    
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
    tagSelectorDialog.tagContent = tagContent;
    tagSelectorDialog.selectedOverview = selectedOverview;
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
            
            // 检查是否有子子分类
            const subCategoryData = tagsData[category][subCategory];
            if (Array.isArray(subCategoryData)) {
                // 直接显示标签
                showTags(category, subCategory);
            } else {
                // 显示子子分类
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
            
            // 显示标签
            showTagsFromSubSub(category, subCategory, subSubCategory);
        };
        
        subSubCategoryTabs.appendChild(tab);
        
        // 默认选择第一个子子分类
        if (index === 0) {
            tab.click();
        }
    });
}

// 显示标签（三级结构）
function showTags(category, subCategory) {
    // 隐藏子子分类栏
    const subSubCategoryTabs = tagSelectorDialog.subSubCategoryTabs;
    subSubCategoryTabs.style.display = 'none';
    
    const tagContent = tagSelectorDialog.tagContent;
    tagContent.innerHTML = '';
    
    const tags = tagsData[category][subCategory];
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
            transition: background-color 0.2s, color 0.2s, border-color 0.2s;
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
                line-height: 1.4;
            `;
            tooltip.textContent = tagObj.value;
            return tooltip;
        };
        
        let tooltip = null;
        
        // 添加悬停提示显示英文值
        // tagElement.title = tagObj.value; // 替换为自定义提示框
        
        // 添加鼠标悬停效果 - 二级分类标签悬停配色和自定义提示框
        tagElement.onmouseenter = (e) => {
            if (!isTagSelected(tagObj.value)) {
                tagElement.style.backgroundColor = 'rgb(49, 84, 136)'; // 标签悬停背景色：低透明度藏青色
                tagElement.style.borderColor = '#1e293b'; // 标签悬停边框色：藏青色
                tagElement.style.color = '#fff'; // 标签悬停文字色：白色
                tagElement.style.borderWidth = '1px'; /* 1像素边框 */
            }
            
            // 清除之前的提示框避免残留
            if (tooltip && tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
                tooltip = null;
            }
            
            // 显示自定义提示框
            tooltip = createCustomTooltip();
            document.body.appendChild(tooltip);
            
            const rect = tagElement.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top + 'px';
            
            setTimeout(() => {
                if (tooltip) tooltip.style.opacity = '1';
            }, 10);
        };
        
        tagElement.onmouseleave = () => {
            if (!isTagSelected(tagObj.value)) {
                tagElement.style.backgroundColor = '#444'; // 标签默认背景色：深灰色
                tagElement.style.borderColor = '#555'; // 标签默认边框色：深灰色
                tagElement.style.color = '#ccc'; // 标签默认文字色：浅灰色
                tagElement.style.borderWidth = '1px'; /* 恢复1像素边框 */
                tagElement.style.boxShadow = 'none';
            }
            
            // 隐藏自定义提示框
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

// 显示标签（四级结构）
function showTagsFromSubSub(category, subCategory, subSubCategory) {
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
                line-height: 1.4;
            `;
            tooltip.textContent = tagObj.value;
            return tooltip;
        };
        
        let tooltip = null;
        
        // 添加悬停提示显示英文值
        // tagElement.title = tagObj.value; // 替换为自定义提示框
        
        // 添加鼠标悬停效果 - 三级分类标签悬停配色和自定义提示框
        tagElement.onmouseenter = (e) => {
            if (!isTagSelected(tagObj.value)) {
                tagElement.style.backgroundColor = 'rgb(49, 84, 136)'; // 标签悬停背景色：低透明度藏青色
                tagElement.style.borderColor = '#1e293b'; // 标签悬停边框色：藏青色
                tagElement.style.color = '#fff'; // 标签悬停文字色：白色
                tagElement.style.borderWidth = '1px'; /* 1像素边框 */
            }
            
            // 清除之前的提示框避免残留
            if (tooltip && tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
                tooltip = null;
            }
            
            // 显示自定义提示框
            tooltip = createCustomTooltip();
            document.body.appendChild(tooltip);
            
            const rect = tagElement.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top + 'px';
            
            setTimeout(() => {
                if (tooltip) tooltip.style.opacity = '1';
            }, 10);
        };
        
        tagElement.onmouseleave = () => {
            if (!isTagSelected(tagObj.value)) {
                tagElement.style.backgroundColor = '#444'; // 标签默认背景色：深灰色
                tagElement.style.borderColor = 'rgba(71, 85, 105, 0.8)'; // 标签默认边框色：半透明灰色
                tagElement.style.color = '#ccc'; // 标签默认文字色：浅灰色
                tagElement.style.borderWidth = '1px'; /* 恢复1像素边框 */
                tagElement.style.boxShadow = 'none';
            }
            
            // 隐藏自定义提示框
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