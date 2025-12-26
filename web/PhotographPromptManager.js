import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";

// Photograph Prompt Manager Extension
app.registerExtension({
    name: "zhihui.PhotographPromptManager",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "PhotographPromptGenerator") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

                // Store for previous state (initialize before widgets)
                this._previousState = null;
                this._isRandomMode = false;

                // Find the output_mode widget index
                const outputModeWidgetIndex = this.widgets.findIndex(w => w.name === "output_mode");

                // Add random toggle button after season (before output_mode)
                if (outputModeWidgetIndex !== -1) {
                    const randomToggleButton = this.addWidget("button", "🎲一键随机·Random Toggle", "random_toggle", () => {
                        toggleRandomMode(this);
                    });
                    randomToggleButton.serialize = false;

                    // Move the random toggle button to be right before the output_mode widget
                    const buttonIndex = this.widgets.indexOf(randomToggleButton);
                    if (buttonIndex !== -1 && buttonIndex !== outputModeWidgetIndex) {
                        this.widgets.splice(buttonIndex, 1);
                        this.widgets.splice(outputModeWidgetIndex, 0, randomToggleButton);
                    }
                }

                // Add the management button to the node
                const manageButton = this.addWidget("button", "🛠️用户选项编辑·User Option Editing", "user_option_editing", () => {
                    openPhotographPromptManager(this);
                });
                manageButton.serialize = false;

                // Add the template editor helper button to the node
                const templateHelperButton = this.addWidget("button", "📝模版助手·Template Helper", "template_helper", () => {
                    openTemplateEditorHelper(this); // Pass the node reference
                });
                templateHelperButton.serialize = false;

                return r;
            };
        }
    }
});

// State management for the prompt manager
let currentManagerDialog = null;
let categoryData = {};

// Toggle random mode for all system preset options
function toggleRandomMode(node) {
    // List of all system preset option widgets
    const presetWidgetNames = [
        'character', 'gender', 'pose', 'movement', 'orientation',
        'top', 'bottom', 'boots', 'accessories',
        'camera', 'lens', 'lighting', 'perspective',
        'location', 'weather', 'season'
    ];

    if (!node._isRandomMode) {
        // Save current state and switch to random mode
        node._previousState = {};

        presetWidgetNames.forEach(widgetName => {
            const widget = node.widgets.find(w => w.name === widgetName);
            if (widget) {
                // Save current value
                node._previousState[widgetName] = widget.value;
                // Set to Random
                widget.value = "Random";
            }
        });

        node._isRandomMode = true;

        // Update button text to indicate restore mode
        const toggleButton = node.widgets.find(w => w.name === "random_toggle");
        if (toggleButton) {
            toggleButton.name = "↩️恢复状态·Restore";
        }

        // Mark node as modified
        node.setDirtyCanvas(true, true);

        showToast('✅ 已设置为随机模式 · Switched to Random Mode', 'success');
    } else {
        // Restore previous state
        if (node._previousState) {
            presetWidgetNames.forEach(widgetName => {
                const widget = node.widgets.find(w => w.name === widgetName);
                if (widget && node._previousState[widgetName] !== undefined) {
                    widget.value = node._previousState[widgetName];
                }
            });
        }

        node._isRandomMode = false;
        node._previousState = null;

        // Update button text back to random mode
        const toggleButton = node.widgets.find(w => w.name === "random_toggle");
        if (toggleButton) {
            toggleButton.name = "🎲一键随机·Random Toggle";
        }

        // Mark node as modified
        node.setDirtyCanvas(true, true);

        showToast('✅ 已恢复到之前状态 · Restored Previous State', 'success');
    }
}

// Translation function using Pollinations AI API
async function translateText(text, targetLang) {
    try {
        const prompt = targetLang === 'en'
            ? `Translate the following Chinese text to English, return only the translation without any explanation: "${text}"`
            : `Translate the following English text to Chinese, return only the translation without any explanation: "${text}"`;

        const response = await fetch('https://text.pollinations.ai/openai/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'openai',
                seed: Math.floor(Math.random() * 1000000),
                jsonMode: false
            })
        });

        if (!response.ok) {
            throw new Error('Translation request failed');
        }

        // Try to parse as JSON first
        const contentType = response.headers.get('content-type');
        let result;

        if (contentType && contentType.includes('application/json')) {
            // Response is JSON, extract the message content
            const data = await response.json();

            // Extract translated text from the response
            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                result = data.choices[0].message.content;
            } else {
                throw new Error('Unexpected JSON response format');
            }
        } else {
            // Response is plain text
            result = await response.text();
        }

        // Clean up the result - remove quotes and extra whitespace
        return result.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
}

// State management for template editor helper
let currentTemplateHelperDialog = null;
let currentTemplateEditor = null;
let currentTemplateNode = null; // Store reference to the parent node
let customTemplates = []; // Store custom templates

// Template file manager
class TemplateManager {
    // Initialize templates - try to load from JSON file, fallback to localStorage
    static async initialize() {
        // Try to load from JSON file first
        try {
            const response = await fetch('../Nodes/PhotographPromptGen/custom-templates.json');
            if (response.ok) {
                const data = await response.json();
                customTemplates = data;
                // Save to localStorage as backup
                localStorage.setItem('customTemplates', JSON.stringify(data));
                console.log('Loaded templates from JSON file');
                return data;
            }
        } catch (error) {
            console.log('Could not load from JSON file, checking localStorage');
        }
        
        // Fallback to localStorage
        const stored = localStorage.getItem('customTemplates');
        if (stored) {
            try {
                customTemplates = JSON.parse(stored);
                console.log('Loaded templates from localStorage');
                return customTemplates;
            } catch (error) {
                console.warn('Error parsing localStorage data:', error);
            }
        }
        
        customTemplates = [];
        return [];
    }
    
    // Save templates to localStorage and offer JSON export
    static saveTemplates(templates) {
        customTemplates = templates;
        localStorage.setItem('customTemplates', JSON.stringify(templates));
        return true;
    }
    
    // Export templates to JSON file
    static exportTemplates() {
        const dataStr = JSON.stringify(customTemplates, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'custom-templates.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('✅ 模版已导出到JSON文件', 'success');
    }
    
    // Import templates from JSON file
    static importTemplates() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const imported = JSON.parse(e.target.result);
                        if (Array.isArray(imported)) {
                            customTemplates = imported;
                            this.saveTemplates(customTemplates);
                            // Refresh the template lists
                            const presetList = document.querySelector('#preset-list');
                            const customList = document.querySelector('#custom-list');
                            if (presetList) {
                                populatePresetTemplates(presetList);
                            }
                            if (customList) {
                                populateCustomTemplates(customList);
                            }
                            showToast(`✅ 成功导入 ${imported.length} 个模版`, 'success');
                        } else {
                            showToast('❌ JSON文件格式不正确', 'error');
                        }
                    } catch (error) {
                        showToast('❌ JSON文件解析失败', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
    
    static getTemplates() {
        return customTemplates;
    }
    
    static setTemplates(templates) {
        customTemplates = templates;
        this.saveTemplates(templates);
    }
}

// Open the photograph prompt manager dialog
function openPhotographPromptManager() {
    // Close any existing dialog
    if (currentManagerDialog) {
        currentManagerDialog.remove();
    }

    // Create the dialog
    currentManagerDialog = createPhotographPromptManagerDialog();
    document.body.appendChild(currentManagerDialog);

    // Load category data
    loadCategoryData();

    // Show the dialog
    currentManagerDialog.style.display = 'block';
}

// Create the photograph prompt manager dialog
function createPhotographPromptManagerDialog() {
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
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 108%;
        max-width: 1440px;
        height: 66vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 16px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 12px 20px;
        background: rgba(0, 0, 0, 0.2);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const title = document.createElement('h2');
    title.textContent = '用户选项编辑 - User Option Editing';
    title.style.cssText = `
        margin: 0;
        color: #fff;
        font-size: 18px;
        font-weight: 600;
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        text-align: center;
    `;
    
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'linear-gradient(135deg, #ff4444, #ff6666)';
        closeButton.style.transform = 'scale(1.1)';
        closeButton.style.boxShadow = '0 4px 15px rgba(255, 68, 68, 0.5)';
    });
    
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'rgba(255, 255, 255, 0.1)';
        closeButton.style.transform = 'scale(1)';
        closeButton.style.boxShadow = 'none';
    });
    
    closeButton.addEventListener('click', () => {
        overlay.remove();
        currentManagerDialog = null;
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Content area
    const content = document.createElement('div');
    content.style.cssText = `
        flex: 1;
        display: flex;
        overflow: hidden;
        padding: 20px;
        gap: 20px;
    `;
    
    // Category list sidebar
    const sidebar = document.createElement('div');
    sidebar.style.cssText = `
        width: 250px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        padding: 15px;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    const sidebarTitle = document.createElement('h3');
    sidebarTitle.textContent = '分类列表 · Categories';
    sidebarTitle.style.cssText = `
        color: #10b981;
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 13px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 5px;
        line-height: 1.2;
    `;
    
    const categoryList = document.createElement('div');
    categoryList.id = 'category-list';
    categoryList.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;
    
    sidebar.appendChild(sidebarTitle);
    sidebar.appendChild(categoryList);
    
    // Main editor area
    const editorArea = document.createElement('div');
    editorArea.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    const editorHeader = document.createElement('div');
    editorHeader.style.cssText = `
        padding: 8px 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const categoryName = document.createElement('h3');
    categoryName.id = 'current-category-name';
    categoryName.textContent = '请选择一个分类 - Please select a category';
    categoryName.style.cssText = `
        color: #00f2fe;
        margin: 0;
        font-size: 18px;
    `;

    editorHeader.appendChild(categoryName);
    
    const editorContent = document.createElement('div');
    editorContent.style.cssText = `
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    `;
    
    const entryList = document.createElement('div');
    entryList.id = 'entry-list';
    entryList.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: auto;
    `;

    editorContent.appendChild(entryList);
    
    editorArea.appendChild(editorHeader);
    editorArea.appendChild(editorContent);
    
    content.appendChild(sidebar);
    content.appendChild(editorArea);
    
    // Footer
    const footer = document.createElement('div');
    footer.style.cssText = `
        padding: 15px 20px;
        background: rgba(0, 0, 0, 0.2);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const statusText = document.createElement('div');
    statusText.id = 'status-text';
    statusText.textContent = '就绪 · Ready';
    statusText.style.cssText = `
        color: #aaa;
        font-size: 14px;
    `;
    
    const actionButtons = document.createElement('div');
    actionButtons.style.cssText = `
        display: flex;
        gap: 10px;
    `;

    // 添加新条目按钮
    const addButton = document.createElement('button');
    addButton.id = 'add-entry-button';
    addButton.textContent = '添加新条目 · Add New Entry';
    addButton.style.cssText = `
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid rgba(59, 130, 246, 0.7);
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    `;

    addButton.addEventListener('mouseenter', () => {
        addButton.style.background = 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)';
        addButton.style.transform = 'translateY(-1px)';
        addButton.style.boxShadow = '0 3px 10px rgba(16, 185, 129, 0.5)';
    });

    addButton.addEventListener('mouseleave', () => {
        addButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)';
        addButton.style.transform = 'translateY(0)';
        addButton.style.boxShadow = 'none';
    });

    addButton.addEventListener('click', () => {
        showAddEntryForm();
    });

    // 导出按钮
    const exportButton = document.createElement('button');
    exportButton.innerHTML = '导出 · Export';
    exportButton.style.cssText = `
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid rgba(59, 130, 246, 0.7);
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    `;

    exportButton.addEventListener('mouseenter', () => {
        exportButton.style.background = 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)';
        exportButton.style.transform = 'translateY(-1px)';
        exportButton.style.boxShadow = '0 3px 10px rgba(59, 130, 246, 0.5)';
    });

    exportButton.addEventListener('mouseleave', () => {
        exportButton.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)';
        exportButton.style.transform = 'translateY(0)';
        exportButton.style.boxShadow = 'none';
    });

    exportButton.addEventListener('click', () => {
        exportUserOptions();
    });

    actionButtons.appendChild(exportButton);

    // 导入按钮
    const importButton = document.createElement('button');
    importButton.innerHTML = '导入 · Import';
    importButton.style.cssText = `
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid rgba(245, 158, 11, 0.7);
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    `;

    importButton.addEventListener('mouseenter', () => {
        importButton.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)';
        importButton.style.transform = 'translateY(-1px)';
        importButton.style.boxShadow = '0 3px 10px rgba(245, 158, 11, 0.5)';
    });

    importButton.addEventListener('mouseleave', () => {
        importButton.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)';
        importButton.style.transform = 'translateY(0)';
        importButton.style.boxShadow = 'none';
    });

    importButton.addEventListener('click', () => {
        importUserOptions();
    });

    actionButtons.appendChild(importButton);

    // 添加新条目按钮（最右边）
    actionButtons.appendChild(addButton);

    footer.appendChild(statusText);
    footer.appendChild(actionButtons);
    
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    overlay.appendChild(dialog);
    
    // Make the dialog non-draggable as requested
    // makeDraggable(dialog, header);
    
    // Optimize keyboard event handling to ensure template helper interactions don't affect outside UI
    overlay.addEventListener('keydown', (event) => {
        // Allow all keys if focus is on textarea or input elements
        const target = event.target;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
            // Contain the event within the helper UI
            event.stopImmediatePropagation();
            return;
        }
        
        // For other elements in the helper UI, still contain the event
        event.stopImmediatePropagation();
    });
    
    return overlay;
}

// Make an element draggable
function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    handle.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Load category data
async function loadCategoryData() {
    try {
        updateStatus('正在加载数据... · Loading data...');
        
        // Get the list of category files
        const response = await api.fetchApi('/zhihui/photograph/categories', {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        
        const categories = await response.json();
        console.log('Loaded categories from API:', categories);
        categoryData = {};
        
        // If no categories are returned from API, use default categories matching the node's actual options
        const effectiveCategories = categories && categories.length > 0 ? categories :
            ['character', 'gender', 'pose', 'movement', 'orientation', 'top', 'bottom', 'boots', 'accessories', 'camera', 'lens', 'lighting', 'perspective', 'location', 'weather', 'season'];
        
        // Load data for each category
        for (const category of effectiveCategories) {
            try {
                const dataResponse = await api.fetchApi(`/zhihui/photograph/category/${category}`, {
                    method: 'GET'
                });
                
                if (dataResponse.ok) {
                    const data = await dataResponse.json();

                    // Convert user entries from "中文 (english)" or "中文(english)" format to object format
                    const userEntries = (data.user_entries || []).map(entry => {
                        if (typeof entry === 'string') {
                            // Parse "中文 (english)" or "中文(english)" format
                            // The space before parenthesis is optional
                            const match = entry.match(/^(.+?)\s*\((.+)\)$/);
                            if (match) {
                                return {
                                    chinese: match[1].trim(),
                                    english: match[2]
                                };
                            }
                        }
                        // If it's already an object or doesn't match the format, return as-is
                        return entry;
                    });

                    categoryData[category] = {
                        preset_entries: data.preset_entries || [],
                        user_entries: userEntries
                    };
                } else {
                    categoryData[category] = {
                        preset_entries: [],
                        user_entries: []
                    };
                }
            } catch (error) {
                console.error(`Error loading data for category ${category}:`, error);
                categoryData[category] = {
                    preset_entries: [],
                    user_entries: []
                };
            }
        }
        
        // Render the category list
        renderCategoryList(effectiveCategories);
        
        updateStatus('数据加载完成 · Data loaded successfully');
    } catch (error) {
        console.error('Error loading category data:', error);
        updateStatus('数据加载失败 · Failed to load data');
        showToast('❌ 数据加载失败，请检查网络连接', 'error');
        
        // Fallback: show default categories matching the node's actual options even on error
        const defaultCategories = ['character', 'gender', 'pose', 'movement', 'orientation', 'top', 'bottom', 'boots', 'accessories', 'camera', 'lens', 'lighting', 'perspective', 'location', 'weather', 'season'];
        renderCategoryList(defaultCategories);
        showToast('⚠️ 显示默认分类 · Showing default categories', 'warning');
    }
}

// Category name mapping with bilingual display
const CATEGORY_NAME_MAP = {
    'character': '人物 · Character',
    'gender': '性别 · Gender',
    'pose': '姿势 · Pose',
    'movement': '动作 · Movement',
    'orientation': '朝向 · Orientation',
    'top': '上衣 · Top',
    'bottom': '下装 · Bottom',
    'boots': '鞋子 · Boots',
    'accessories': '配饰 · Accessories',
    'camera': '相机 · Camera',
    'lens': '镜头 · Lens',
    'lighting': '灯光 · Lighting',
    'perspective': '视角 · Perspective',
    'location': '位置 · Location',
    'weather': '天气 · Weather',
    'season': '季节 · Season'
};

// Get bilingual display name for a category
function getCategoryDisplayName(category) {
    return CATEGORY_NAME_MAP[category] || category;
}

// Render the category list
function renderCategoryList(categories) {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';

    categories.forEach(category => {
        const categoryItem = document.createElement('div');

        // Get entry counts for this category (only count user entries)
        const userCount = categoryData[category]?.user_entries?.length || 0;

        // Create category display with count badge
        const categoryName = document.createElement('span');
        categoryName.textContent = getCategoryDisplayName(category);
        categoryName.style.cssText = `
            flex: 1;
        `;

        const countBadge = document.createElement('span');
        countBadge.textContent = userCount.toString();
        countBadge.style.cssText = `
            padding: 2px 8px;
            border-radius: 10px;
            background: rgba(79, 172, 254, 0.3);
            color: #4facfe;
            font-size: 12px;
            font-weight: bold;
            min-width: 24px;
            text-align: center;
        `;

        categoryItem.appendChild(categoryName);
        categoryItem.appendChild(countBadge);
        categoryItem.dataset.category = category;
        categoryItem.style.cssText = `
            padding: 12px 15px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
            color: #fff;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid transparent;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        categoryItem.addEventListener('mouseenter', () => {
            if (!categoryItem.classList.contains('selected')) {
                categoryItem.style.background = 'rgba(79, 172, 254, 0.2)';
                categoryItem.style.borderColor = 'rgba(79, 172, 254, 0.5)';
            }
        });

        categoryItem.addEventListener('mouseleave', () => {
            if (!categoryItem.classList.contains('selected')) {
                categoryItem.style.background = 'rgba(255, 255, 255, 0.05)';
                categoryItem.style.borderColor = 'transparent';
            }
        });

        categoryItem.addEventListener('click', () => {
            // Highlight selected category
            document.querySelectorAll('#category-list > div').forEach(item => {
                item.style.background = 'rgba(255, 255, 255, 0.05)';
                item.style.borderColor = 'transparent';
                item.style.borderLeft = 'none';
                item.style.boxShadow = 'none';
                item.classList.remove('selected');
            });
            categoryItem.style.background = 'linear-gradient(90deg, rgba(79, 172, 254, 0.3) 0%, rgba(79, 172, 254, 0.2) 100%)';
            categoryItem.style.borderColor = 'rgba(79, 172, 254, 0.8)';
            categoryItem.style.borderLeft = '4px solid #4facfe';
            categoryItem.style.boxShadow = '0 2px 8px rgba(79, 172, 254, 0.3)';
            categoryItem.classList.add('selected');

            // Load entries for this category
            loadCategoryEntries(category);
        });

        categoryList.appendChild(categoryItem);
    });
}

// Load entries for a specific category
function loadCategoryEntries(category) {
    const categoryName = document.getElementById('current-category-name');
    categoryName.textContent = getCategoryDisplayName(category);
    categoryName.dataset.category = category;

    const entryList = document.getElementById('entry-list');
    entryList.innerHTML = '';

    const userEntries = categoryData[category]?.user_entries || [];

    // Add user entries section
    if (userEntries.length > 0) {
        const userSection = createSectionHeader('用户自定义 · User-defined', '#10b981', true);
        entryList.appendChild(userSection);

        // Create grid container for entries
        const gridContainer = document.createElement('div');
        gridContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-top: 10px;
        `;

        userEntries.forEach((entry, index) => {
            const entryItem = createEntryItem(entry, index, false); // isPreset = false
            entryItem.dataset.userIndex = index;
            gridContainer.appendChild(entryItem);
        });

        entryList.appendChild(gridContainer);
    }

    // If no user entries
    if (userEntries.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = '该分类暂无用户条目 · No user entries in this category';
        emptyMessage.style.cssText = `
            text-align: center;
            color: #aaa;
            padding: 20px;
            font-style: italic;
        `;
        entryList.appendChild(emptyMessage);
    }
}

// Create section header
function createSectionHeader(title, color, isUserSection) {
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 10px 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border-left: 4px solid ${color};
        margin: 10px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
    `;
    
    const titleElement = document.createElement('h4');
    titleElement.textContent = title;
    titleElement.style.cssText = `
        margin: 0;
        color: ${color};
        font-size: 14px;
        font-weight: 600;
    `;
    
    header.appendChild(titleElement);
    
    if (isUserSection) {
        const infoText = document.createElement('span');
        infoText.textContent = '✏️ 可编辑 · Editable';
        infoText.style.cssText = `
            font-size: 14px;
            color: #aaa;
        `;
        header.appendChild(infoText);
    } else {
        const infoText = document.createElement('span');
        infoText.textContent = '🔒 预置保护 · Preset Protected';
        infoText.style.cssText = `
            font-size: 14px;
            color: #888;
        `;
        header.appendChild(infoText);
    }
    
    return header;
}

// Create entry item (new card-style layout with hover controls)
function createEntryItem(entry, index, isPreset) {
    const entryItem = document.createElement('div');
    entryItem.className = 'entry-item';
    entryItem.style.cssText = `
        position: relative;
        padding: 8px;
        background: rgba(16, 185, 129, 0.1);
        border-radius: 8px;
        border: 1px solid rgba(16, 185, 129, 0.2);
        transition: all 0.2s ease;
        cursor: pointer;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    // Display text (non-editable)
    const displayText = document.createElement('div');
    displayText.className = 'entry-display-text';

    // Handle both object format (new) and string format (legacy)
    let displayValue = '';
    if (typeof entry === 'object' && entry !== null && entry.chinese !== undefined && entry.english !== undefined) {
        displayValue = `${entry.chinese}(${entry.english})`;
    } else {
        displayValue = entry; // Legacy string format
    }

    displayText.textContent = displayValue;
    displayText.style.cssText = `
        color: white;
        font-size: 13px;
        text-align: center;
        line-height: 1.4;
        word-break: break-word;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        padding: 0 4px;
    `;

    // Action buttons container (hidden by default, shown on hover)
    const actionButtons = document.createElement('div');
    actionButtons.className = 'entry-action-buttons';
    actionButtons.style.cssText = `
        position: absolute;
        top: 6px;
        right: 6px;
        display: none;
        gap: 4px;
        z-index: 10;
    `;

    // Edit button
    const editButton = document.createElement('button');
    editButton.innerHTML = '✏️';
    editButton.title = '编辑条目 · Edit entry';
    editButton.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: 1px solid rgba(79, 172, 254, 0.8);
        background: rgba(79, 172, 254, 1);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    editButton.addEventListener('mouseenter', () => {
        editButton.style.background = 'rgba(79, 172, 254, 0.8)';
    });

    editButton.addEventListener('mouseleave', () => {
        editButton.style.background = 'rgba(79, 172, 254, 1)';
    });

    editButton.addEventListener('click', (e) => {
        e.stopPropagation();
        showEditEntryDialog(entry, index);
    });

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '🗑️';
    deleteButton.title = '删除条目 · Delete entry';
    deleteButton.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: 1px solid rgba(255, 100, 100, 0.8);
        background: rgba(200, 50, 50, 1);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    deleteButton.addEventListener('mouseenter', () => {
        deleteButton.style.background = 'rgba(200, 50, 50, 0.8)';
    });

    deleteButton.addEventListener('mouseleave', () => {
        deleteButton.style.background = 'rgba(200, 50, 50, 1)';
    });

    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const categoryNameElement = document.getElementById('current-category-name');
        const currentCategory = categoryNameElement.dataset.category;
        deleteEntry(currentCategory, index, false);
    });

    actionButtons.appendChild(editButton);
    actionButtons.appendChild(deleteButton);

    // Add hover effect
    entryItem.addEventListener('mouseenter', () => {
        if (!entryItem.classList.contains('selected')) {
            entryItem.style.background = 'rgba(16, 185, 129, 0.2)';
            entryItem.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        }
    });

    entryItem.addEventListener('mouseleave', () => {
        if (!entryItem.classList.contains('selected')) {
            entryItem.style.background = 'rgba(16, 185, 129, 0.1)';
            entryItem.style.borderColor = 'rgba(16, 185, 129, 0.2)';
        }
    });

    // Click to select (single selection only, click again to deselect)
    entryItem.addEventListener('click', (e) => {
        if (e.target === editButton || e.target === deleteButton) {
            return;
        }

        const isCurrentlySelected = entryItem.classList.contains('selected');

        // Find all entry items in the current grid
        const gridContainer = entryItem.parentElement;
        const allEntryItems = gridContainer.querySelectorAll('.entry-item');

        // Deselect all items
        allEntryItems.forEach(item => {
            item.classList.remove('selected');
            item.style.background = 'rgba(16, 185, 129, 0.1)';
            item.style.borderColor = 'rgba(16, 185, 129, 0.2)';
            item.style.boxShadow = 'none';
            const buttons = item.querySelector('.entry-action-buttons');
            if (buttons) {
                buttons.style.display = 'none';
            }
        });

        // If the item was not selected, select it; if it was selected, leave it deselected
        if (!isCurrentlySelected) {
            entryItem.classList.add('selected');
            entryItem.style.background = 'rgba(16, 185, 129, 0.3)';
            entryItem.style.borderColor = 'rgba(16, 185, 129, 0.8)';
            entryItem.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
            actionButtons.style.display = 'flex';
        }
    });

    entryItem.appendChild(displayText);
    entryItem.appendChild(actionButtons);

    return entryItem;
}

// Show edit entry dialog
function showEditEntryDialog(entry, index) {
    // Remove existing modal if any
    const existingModal = document.getElementById('edit-entry-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'edit-entry-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
    `;

    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 16px;
        padding: 30px;
        width: 90%;
        max-width: 500px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        animation: modalSlideIn 0.3s ease;
    `;

    const title = document.createElement('h3');
    title.textContent = '✏️ 编辑条目 · Edit Entry';
    title.style.cssText = `
        color: #4facfe;
        margin: 0 0 20px 0;
        font-size: 18px;
        font-weight: 600;
        text-align: center;
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    `;

    // Get current values
    let chineseValue = '';
    let englishValue = '';
    if (typeof entry === 'object' && entry !== null && entry.chinese !== undefined && entry.english !== undefined) {
        chineseValue = entry.chinese;
        englishValue = entry.english;
    }

    // Chinese name input container
    const chineseLabel = document.createElement('label');
    chineseLabel.textContent = '中文名称 · Chinese Name:';
    chineseLabel.style.cssText = `
        display: block;
        color: white;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
    `;

    const chineseInputContainer = document.createElement('div');
    chineseInputContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-bottom: 15px;
        align-items: center;
    `;

    const chineseInput = document.createElement('input');
    chineseInput.type = 'text';
    chineseInput.value = chineseValue;
    chineseInput.placeholder = '请输入中文名称';
    chineseInput.style.cssText = `
        flex: 1;
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 14px;
        outline: none;
        transition: all 0.3s ease;
        box-sizing: border-box;
    `;

    chineseInput.addEventListener('focus', () => {
        chineseInput.style.borderColor = '#4facfe';
        chineseInput.style.boxShadow = '0 0 0 2px rgba(79, 172, 254, 0.2)';
    });

    chineseInput.addEventListener('blur', () => {
        chineseInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        chineseInput.style.boxShadow = 'none';
    });

    // Auto-translate button for Chinese input
    const chineseTranslateBtn = document.createElement('button');
    chineseTranslateBtn.innerHTML = '🌐 自动填充';
    chineseTranslateBtn.title = '自动翻译到英文';
    chineseTranslateBtn.style.cssText = `
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(79, 172, 254, 0.5);
        background: rgba(79, 172, 254, 0.15);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
        white-space: nowrap;
    `;

    chineseTranslateBtn.addEventListener('click', async () => {
        const text = chineseInput.value.trim();
        if (!text) {
            showToast('⚠️ 请先输入中文名称', 'warning');
            return;
        }
        chineseTranslateBtn.disabled = true;
        chineseTranslateBtn.innerHTML = '⏳ 翻译中...';
        try {
            const translated = await translateText(text, 'en');
            englishInput.value = translated;
            showToast('✅ 翻译完成', 'success');
        } catch (error) {
            showToast('❌ 翻译失败，请重试', 'error');
        } finally {
            chineseTranslateBtn.disabled = false;
            chineseTranslateBtn.innerHTML = '🌐 自动填充';
        }
    });

    chineseInputContainer.appendChild(chineseInput);
    chineseInputContainer.appendChild(chineseTranslateBtn);

    // English name input container
    const englishLabel = document.createElement('label');
    englishLabel.textContent = '英文名称 · English Name:';
    englishLabel.style.cssText = `
        display: block;
        color: white;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
    `;

    const englishInputContainer = document.createElement('div');
    englishInputContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        align-items: center;
    `;

    const englishInput = document.createElement('input');
    englishInput.type = 'text';
    englishInput.value = englishValue;
    englishInput.placeholder = '请输入英文名称';
    englishInput.style.cssText = `
        flex: 1;
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 14px;
        outline: none;
        transition: all 0.3s ease;
        box-sizing: border-box;
    `;

    englishInput.addEventListener('focus', () => {
        englishInput.style.borderColor = '#4facfe';
        englishInput.style.boxShadow = '0 0 0 2px rgba(79, 172, 254, 0.2)';
    });

    englishInput.addEventListener('blur', () => {
        englishInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        englishInput.style.boxShadow = 'none';
    });

    // Auto-translate button for English input
    const englishTranslateBtn = document.createElement('button');
    englishTranslateBtn.innerHTML = '🌐 自动填充';
    englishTranslateBtn.title = '自动翻译到中文';
    englishTranslateBtn.style.cssText = `
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(79, 172, 254, 0.5);
        background: rgba(79, 172, 254, 0.15);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
        white-space: nowrap;
    `;

    englishTranslateBtn.addEventListener('click', async () => {
        const text = englishInput.value.trim();
        if (!text) {
            showToast('⚠️ 请先输入英文名称', 'warning');
            return;
        }
        englishTranslateBtn.disabled = true;
        englishTranslateBtn.innerHTML = '⏳ 翻译中...';
        try {
            const translated = await translateText(text, 'zh');
            chineseInput.value = translated;
            showToast('✅ 翻译完成', 'success');
        } catch (error) {
            showToast('❌ 翻译失败，请重试', 'error');
        } finally {
            englishTranslateBtn.disabled = false;
            englishTranslateBtn.innerHTML = '🌐 自动填充';
        }
    });

    englishInputContainer.appendChild(englishInput);
    englishInputContainer.appendChild(englishTranslateBtn);

    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 25px;
    `;

    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消 · Cancel';
    cancelButton.style.cssText = `
        padding: 10px 20px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
    `;

    cancelButton.addEventListener('click', () => {
        modal.remove();
    });

    // Save button
    const saveButton = document.createElement('button');
    saveButton.textContent = '保存 · Save';
    saveButton.style.cssText = `
        padding: 10px 20px;
        border-radius: 8px;
        border: 1px solid rgba(16, 185, 129, 0.7);
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
    `;

    saveButton.addEventListener('click', async () => {
        const newChineseName = chineseInput.value.trim();
        const newEnglishName = englishInput.value.trim();

        if (!newChineseName || !newEnglishName) {
            showToast('⚠️ 请填写中文名称和英文名称', 'warning');
            return;
        }

        // Update the entry
        const categoryNameElement = document.getElementById('current-category-name');
        const currentCategory = categoryNameElement.dataset.category;

        if (categoryData[currentCategory] && categoryData[currentCategory].user_entries[index]) {
            categoryData[currentCategory].user_entries[index] = {
                chinese: newChineseName,
                english: newEnglishName
            };

            // Auto-save
            await autoSaveCategory(currentCategory);

            // Refresh the entry list
            loadCategoryEntries(currentCategory);

            showToast('✅ 条目已更新并自动保存', 'success');
            modal.remove();
        }
    });

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(saveButton);

    // Assemble dialog
    dialogContent.appendChild(title);
    dialogContent.appendChild(chineseLabel);
    dialogContent.appendChild(chineseInputContainer);
    dialogContent.appendChild(englishLabel);
    dialogContent.appendChild(englishInputContainer);
    dialogContent.appendChild(buttonContainer);

    modal.appendChild(dialogContent);
    document.body.appendChild(modal);

    // Focus on first input
    chineseInput.focus();

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Show the add entry form with Chinese and English name inputs
function showAddEntryForm() {
    // Check if a category is selected
    const categoryNameElement = document.getElementById('current-category-name');
    const categoryName = categoryNameElement?.dataset.category;

    if (!categoryName || categoryNameElement?.textContent === '请选择一个分类 - Please select a category') {
        showToast('⚠️ 请先在左侧选择一个分类 · Please select a category first', 'warning');
        return;
    }

    const editorContent = document.querySelector('#entry-list')?.parentElement;
    if (!editorContent) return;

    // Remove existing form if any
    const existingForm = document.getElementById('add-entry-form');
    if (existingForm) {
        existingForm.remove();
    }

    // Hide the add button
    const addButton = document.getElementById('add-entry-button');
    if (addButton) {
        addButton.style.display = 'none';
    }

    // Create the modal overlay
    const modal = document.createElement('div');
    modal.id = 'add-entry-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
    `;

    // Create the form container
    const formContainer = document.createElement('div');
    formContainer.id = 'add-entry-form';
    formContainer.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 16px;
        padding: 30px;
        width: 90%;
        max-width: 500px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        animation: modalSlideIn 0.3s ease;
    `;

    // Add slide down animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    // Form title
    const title = document.createElement('h3');
    title.textContent = '添加新条目 · Add New Entry';
    title.style.cssText = `
        margin: 0 0 15px 0;
        color: #10b981;
        font-size: 18px;
        text-align: center;
    `;

    // Chinese name input container
    const chineseLabel = document.createElement('label');
    chineseLabel.textContent = '中文名称 · Chinese Name:';
    chineseLabel.style.cssText = `
        display: block;
        margin-bottom: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
    `;

    const chineseInputContainer = document.createElement('div');
    chineseInputContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-bottom: 15px;
        align-items: center;
    `;

    const chineseInput = document.createElement('input');
    chineseInput.type = 'text';
    chineseInput.placeholder = '请输入中文名称 · Please enter Chinese name';
    chineseInput.id = 'chinese-name-input';
    chineseInput.style.cssText = `
        flex: 1;
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 16px;
        box-sizing: border-box;
    `;

    // Auto-translate button for Chinese input
    const chineseTranslateBtn = document.createElement('button');
    chineseTranslateBtn.innerHTML = '🌐 自动填充';
    chineseTranslateBtn.title = '自动翻译到英文 · Auto-translate to English';
    chineseTranslateBtn.style.cssText = `
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(79, 172, 254, 0.5);
        background: rgba(79, 172, 254, 0.15);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
        display: none;
        white-space: nowrap;
    `;

    chineseTranslateBtn.addEventListener('mouseenter', () => {
        chineseTranslateBtn.style.background = 'rgba(79, 172, 254, 0.3)';
        chineseTranslateBtn.style.transform = 'scale(1.05)';
    });

    chineseTranslateBtn.addEventListener('mouseleave', () => {
        chineseTranslateBtn.style.background = 'rgba(79, 172, 254, 0.15)';
        chineseTranslateBtn.style.transform = 'scale(1)';
    });

    chineseTranslateBtn.addEventListener('click', async () => {
        const text = chineseInput.value.trim();
        if (!text) {
            showToast('⚠️ 请先输入中文名称', 'warning');
            return;
        }

        chineseTranslateBtn.disabled = true;
        chineseTranslateBtn.innerHTML = '⏳ 翻译中...';

        try {
            const translated = await translateText(text, 'en');
            englishInput.value = translated;
            showToast('✅ 翻译完成', 'success');
            updateTranslateButtonsVisibility();
        } catch (error) {
            showToast('❌ 翻译失败，请重试', 'error');
        } finally {
            chineseTranslateBtn.disabled = false;
            chineseTranslateBtn.innerHTML = '🌐 自动填充';
        }
    });

    chineseInputContainer.appendChild(chineseInput);
    chineseInputContainer.appendChild(chineseTranslateBtn);

    // English name input container
    const englishLabel = document.createElement('label');
    englishLabel.textContent = '英文名称 · English Name:';
    englishLabel.style.cssText = `
        display: block;
        margin-bottom: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
    `;

    const englishInputContainer = document.createElement('div');
    englishInputContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        align-items: center;
    `;

    const englishInput = document.createElement('input');
    englishInput.type = 'text';
    englishInput.placeholder = '请输入英文名称 · Please enter English name';
    englishInput.id = 'english-name-input';
    englishInput.style.cssText = `
        flex: 1;
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 16px;
        box-sizing: border-box;
    `;

    // Auto-translate button for English input
    const englishTranslateBtn = document.createElement('button');
    englishTranslateBtn.innerHTML = '🌐 自动填充';
    englishTranslateBtn.title = '自动翻译到中文 · Auto-translate to Chinese';
    englishTranslateBtn.style.cssText = `
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(79, 172, 254, 0.5);
        background: rgba(79, 172, 254, 0.15);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
        display: none;
        white-space: nowrap;
    `;

    englishTranslateBtn.addEventListener('mouseenter', () => {
        englishTranslateBtn.style.background = 'rgba(79, 172, 254, 0.3)';
        englishTranslateBtn.style.transform = 'scale(1.05)';
    });

    englishTranslateBtn.addEventListener('mouseleave', () => {
        englishTranslateBtn.style.background = 'rgba(79, 172, 254, 0.15)';
        englishTranslateBtn.style.transform = 'scale(1)';
    });

    englishTranslateBtn.addEventListener('click', async () => {
        const text = englishInput.value.trim();
        if (!text) {
            showToast('⚠️ 请先输入英文名称', 'warning');
            return;
        }

        englishTranslateBtn.disabled = true;
        englishTranslateBtn.innerHTML = '⏳ 翻译中...';

        try {
            const translated = await translateText(text, 'zh');
            chineseInput.value = translated;
            showToast('✅ 翻译完成', 'success');
            updateTranslateButtonsVisibility();
        } catch (error) {
            showToast('❌ 翻译失败，请重试', 'error');
        } finally {
            englishTranslateBtn.disabled = false;
            englishTranslateBtn.innerHTML = '🌐 自动填充';
        }
    });

    englishInputContainer.appendChild(englishInput);
    englishInputContainer.appendChild(englishTranslateBtn);

    // Function to update button visibility based on input values
    function updateTranslateButtonsVisibility() {
        const chineseValue = chineseInput.value.trim();
        const englishValue = englishInput.value.trim();

        // Show Chinese translate button only if Chinese has value and English is empty
        if (chineseValue && !englishValue) {
            chineseTranslateBtn.style.display = 'block';
        } else {
            chineseTranslateBtn.style.display = 'none';
        }

        // Show English translate button only if English has value and Chinese is empty
        if (englishValue && !chineseValue) {
            englishTranslateBtn.style.display = 'block';
        } else {
            englishTranslateBtn.style.display = 'none';
        }
    }

    // Add input event listeners to update button visibility
    chineseInput.addEventListener('input', updateTranslateButtonsVisibility);
    englishInput.addEventListener('input', updateTranslateButtonsVisibility);

    // Initial visibility check
    updateTranslateButtonsVisibility();

    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    `;

    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消 · Cancel';
    cancelButton.style.cssText = `
        padding: 10px 20px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
    `;

    // Submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = '确认添加 · Confirm Add';
    submitButton.style.cssText = `
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid rgba(59, 130, 246, 0.7);
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
    `;

    submitButton.style.cssText = `
        padding: 10px 20px;
        border-radius: 8px;
        border: 1px solid rgba(16, 185, 129, 0.7);
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
    `;

    // Event listeners
    cancelButton.addEventListener('click', () => {
        modal.remove();
        // Restore the add button
        const addButton = document.getElementById('add-entry-button');
        if (addButton) {
            addButton.style.display = '';
        }
    });

    cancelButton.addEventListener('mouseenter', () => {
        cancelButton.style.background = 'rgba(255, 255, 255, 0.2)';
    });

    cancelButton.addEventListener('mouseleave', () => {
        cancelButton.style.background = 'rgba(255, 255, 255, 0.1)';
    });

    submitButton.addEventListener('mouseenter', () => {
        submitButton.style.transform = 'translateY(-2px)';
        submitButton.style.boxShadow = '0 5px 15px rgba(16, 185, 129, 0.4)';
    });

    submitButton.addEventListener('mouseleave', () => {
        submitButton.style.transform = 'translateY(0)';
        submitButton.style.boxShadow = 'none';
    });

    submitButton.addEventListener('click', () => {
        const chineseName = chineseInput.value.trim();
        const englishName = englishInput.value.trim();

        if (!chineseName || !englishName) {
            showToast('⚠️ 请填写中文名称和英文名称', 'warning');
            return;
        }

        addNewEntry(chineseName, englishName);
        modal.remove();
    });

    // Enter key support
    chineseInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            englishInput.focus();
        }
    });

    englishInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitButton.click();
        }
    });

    // Assemble the form
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(submitButton);

    formContainer.appendChild(title);
    formContainer.appendChild(chineseLabel);
    formContainer.appendChild(chineseInputContainer);
    formContainer.appendChild(englishLabel);
    formContainer.appendChild(englishInputContainer);
    formContainer.appendChild(buttonContainer);

    // Assemble modal
    modal.appendChild(formContainer);
    document.body.appendChild(modal);

    // Focus on first input
    chineseInput.focus();

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            // Restore the add button
            const addButton = document.getElementById('add-entry-button');
            if (addButton) {
                addButton.style.display = '';
            }
        }
    });
}

// Add a new entry to the current category
async function addNewEntry(chineseName, englishName) {
    if (!chineseName || !englishName) {
        showToast('⚠️ 请输入有效的条目内容', 'warning');
        return;
    }

    // Get current category from the header
    const categoryNameElement = document.getElementById('current-category-name');
    const categoryName = categoryNameElement.dataset.category;

    if (!categoryName || categoryNameElement.textContent === '请选择一个分类 · Please select a category') {
        showToast('⚠️ 请先选择一个分类', 'warning');
        return;
    }

    // Add to user entries in category data
    if (!categoryData[categoryName]) {
        categoryData[categoryName] = { preset_entries: [], user_entries: [] };
    }
    if (!categoryData[categoryName].user_entries) {
        categoryData[categoryName].user_entries = [];
    }

    // Create entry object with both Chinese and English names
    const entryObject = {
        chinese: chineseName,
        english: englishName
    };

    categoryData[categoryName].user_entries.push(entryObject);

    // Auto-save after adding entry
    await autoSaveCategory(categoryName);

    // Refresh the entry list
    loadCategoryEntries(categoryName);

    // Update the category count badge
    updateCategoryCount(categoryName);

    showToast('✅ 条目已添加并自动保存', 'success');
}

// Delete an entry from a category
async function deleteEntry(category, index, isPreset) {
    // Prevent deletion of preset entries
    if (isPreset) {
        showToast('⚠️ 预置选项不能删除 · Preset options cannot be deleted', 'warning');
        return;
    }

    if (!categoryData[category] || !categoryData[category].user_entries || index >= categoryData[category].user_entries.length) {
        return;
    }

    if (confirm(`确定要删除 "${categoryData[category].user_entries[index]}" 吗？\nAre you sure you want to delete "${categoryData[category].user_entries[index]}"?`)) {
        categoryData[category].user_entries.splice(index, 1);

        // Auto-save after deleting entry
        await autoSaveCategory(category);

        loadCategoryEntries(category);

        // Update the category count badge
        updateCategoryCount(category);

        showToast('✅ 条目已删除并自动保存', 'success');
    }
}

// Update category count badge in the sidebar
function updateCategoryCount(categoryName) {
    const categoryList = document.getElementById('category-list');
    if (!categoryList) return;

    // Find the category item
    const categoryItems = categoryList.querySelectorAll('[data-category]');
    for (const item of categoryItems) {
        if (item.dataset.category === categoryName) {
            // Find the count badge
            const countBadge = item.querySelector('span:last-child');
            if (countBadge) {
                const userCount = categoryData[categoryName]?.user_entries?.length || 0;
                countBadge.textContent = userCount.toString();
            }
            break;
        }
    }
}

// Auto-save category data (called after adding/deleting entries)
async function autoSaveCategory(categoryName) {
    if (!categoryName) {
        console.error('No category name provided for auto-save');
        return;
    }

    try {
        updateStatus('自动保存中... · Auto-saving...');

        // Get current user entries from category data
        const userEntries = categoryData[categoryName]?.user_entries || [];

        // Convert entries to the format expected by Python: "中文 (english)"
        // Note: Space before parenthesis is required for Python parsing
        const formattedEntries = userEntries.map(entry => {
            if (typeof entry === 'object' && entry !== null && entry.chinese && entry.english) {
                return `${entry.chinese} (${entry.english})`;
            }
            // If it's already a string, return as-is (for backward compatibility)
            return entry;
        });

        // Send only user entries to server
        const response = await api.fetchApi(`/zhihui/photograph/category/${categoryName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_entries: formattedEntries
            })
        });

        if (response.ok) {
            updateStatus('自动保存成功 · Auto-saved successfully');

            // Refresh node definitions to update the dropdown options
            await refreshNodeDefinitions();
        } else {
            throw new Error('Auto-save failed');
        }
    } catch (error) {
        console.error('Auto-save error:', error);
        updateStatus('自动保存失败 · Auto-save failed');
        showToast('❌ 自动保存失败，请重试', 'error');
    }
}

// Refresh node definitions to update dropdown options without restarting
async function refreshNodeDefinitions() {
    try {
        // Request ComfyUI to refresh node definitions
        const response = await api.fetchApi('/object_info', { cache: 'no-store' });

        if (response.ok) {
            const nodeDefinitions = await response.json();

            // Update the app's node definitions
            if (app && app.nodeOutputs) {
                app.nodeOutputs = nodeDefinitions;
            }

            // Find all PhotographPromptGenerator nodes in the graph and update their widgets
            if (app && app.graph && app.graph._nodes) {
                for (const node of app.graph._nodes) {
                    if (node.type === 'PhotographPromptGenerator') {
                        // Get updated node definition
                        const nodeDef = nodeDefinitions['PhotographPromptGenerator'];
                        if (nodeDef && nodeDef.input && nodeDef.input.required) {
                            // Update each widget with new options
                            for (const widget of node.widgets) {
                                const inputDef = nodeDef.input.required[widget.name];
                                if (inputDef && Array.isArray(inputDef[0])) {
                                    // Update widget options
                                    widget.options.values = inputDef[0];

                                    // If current value is not in new options, reset to first option
                                    if (!inputDef[0].includes(widget.value)) {
                                        widget.value = inputDef[0][0];
                                    }
                                }
                            }

                            // Mark node as dirty to trigger redraw
                            node.setDirtyCanvas(true, true);
                        }
                    }
                }
            }

            console.log('Node definitions refreshed successfully');
        }
    } catch (error) {
        console.error('Error refreshing node definitions:', error);
    }
}

// Export all user options to a JSON file
function exportUserOptions() {
    const exportData = {};

    // Collect all user entries from all categories
    for (const category in categoryData) {
        const userEntries = categoryData[category]?.user_entries || [];
        if (userEntries.length > 0) {
            exportData[category] = userEntries;
        }
    }

    if (Object.keys(exportData).length === 0) {
        showToast('⚠️ 没有可导出的用户选项', 'warning');
        return;
    }

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    a.download = `photograph-prompt-user-options-${timestamp}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    updateStatus('导出成功 · Exported successfully');
    showToast('✅ 用户选项已导出', 'success');
}

// Import user options from a JSON file
function importUserOptions() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target.result);

                if (typeof importedData !== 'object' || importedData === null) {
                    showToast('❌ JSON文件格式不正确', 'error');
                    return;
                }

                let importCount = 0;
                const errors = [];

                // Process each category in the imported data
                for (const category in importedData) {
                    const entries = importedData[category];

                    // Skip if no entries for this category
                    if (!entries || !Array.isArray(entries) || entries.length === 0) {
                        continue;
                    }

                    // Validate and format entries
                    const formattedEntries = entries.map(entry => {
                        if (typeof entry === 'string') {
                            // Check if already in "中文 (english)" format
                            const match = entry.match(/^(.+?)\s*\((.+)\)$/);
                            if (match) {
                                return entry;
                            }
                            // If it's a single string without format, try to parse
                            return entry;
                        }
                        if (typeof entry === 'object' && entry.chinese && entry.english) {
                            return `${entry.chinese} (${entry.english})`;
                        }
                        return entry;
                    });

                    // Update local category data
                    if (!categoryData[category]) {
                        categoryData[category] = { preset_entries: [], user_entries: [] };
                    }
                    if (!categoryData[category].user_entries) {
                        categoryData[category].user_entries = [];
                    }

                    // Merge entries (avoid duplicates)
                    const existingEntries = categoryData[category].user_entries.map(ent => {
                        if (typeof ent === 'string') return ent;
                        return `${ent.chinese} (${ent.english})`;
                    });

                    const newEntries = formattedEntries.filter(ent => !existingEntries.includes(ent));

                    if (newEntries.length > 0) {
                        categoryData[category].user_entries.push(...newEntries);
                        importCount += newEntries.length;

                        // Save to server
                        try {
                            const response = await api.fetchApi(`/zhihui/photograph/category/${category}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    user_entries: categoryData[category].user_entries
                                })
                            });

                            if (!response.ok) {
                                errors.push(category);
                            }
                        } catch (err) {
                            console.error(`Failed to save category ${category}:`, err);
                            errors.push(category);
                        }
                    }
                }

                // Refresh UI
                await refreshNodeDefinitions();

                // Refresh current category display if one is selected
                const categoryNameElement = document.getElementById('current-category-name');
                const currentCategory = categoryNameElement?.dataset.category;
                if (currentCategory) {
                    loadCategoryEntries(currentCategory);
                    updateCategoryCount(currentCategory);
                }

                // Update category list counts
                for (const cat in categoryData) {
                    updateCategoryCount(cat);
                }

                if (errors.length > 0) {
                    showToast(`⚠️ 部分分类导入失败: ${errors.join(', ')}`, 'warning');
                } else if (importCount > 0) {
                    showToast(`✅ 成功导入 ${importCount} 个选项`, 'success');
                } else {
                    showToast('ℹ️ 没有新的选项需要导入', 'info');
                }

            } catch (error) {
                console.error('Import error:', error);
                showToast('❌ JSON文件解析失败', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Update status text
function updateStatus(text) {
    const statusText = document.getElementById('status-text');
    if (statusText) {
        statusText.textContent = text;
    }
}

// Open the template editor helper dialog
function openTemplateEditorHelper(node) {
    // Close any existing dialog
    if (currentTemplateHelperDialog) {
        currentTemplateHelperDialog.remove();
    }

    // Store the node reference
    currentTemplateNode = node;

    // Initialize template manager
    TemplateManager.initialize().then(() => {
        // Create the dialog
        currentTemplateHelperDialog = createTemplateEditorHelperDialog();
        document.body.appendChild(currentTemplateHelperDialog);

        // Show the dialog
        currentTemplateHelperDialog.style.display = 'block';

        // Sync node template content to editor
        syncNodeToTemplate();
    });
}

// Create the template editor helper dialog
function createTemplateEditorHelperDialog() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10001;
        display: none;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 108%;
        max-width: 1440px;
        height: 66vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 16px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 12px 20px;
        background: rgba(0, 0, 0, 0.2);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const title = document.createElement('h2');
    title.textContent = '模版助手 - Template Helper';
    title.style.cssText = `
        margin: 0;
        color: #fff;
        font-size: 18px;
        font-weight: 600;
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        text-align: center;
    `;
    
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'linear-gradient(135deg, #ff4444, #ff6666)';
        closeButton.style.transform = 'scale(1.1)';
        closeButton.style.boxShadow = '0 4px 15px rgba(255, 68, 68, 0.5)';
    });
    
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'rgba(255, 255, 255, 0.1)';
        closeButton.style.transform = 'scale(1)';
        closeButton.style.boxShadow = 'none';
    });
    
    closeButton.addEventListener('click', () => {
        overlay.remove();
        currentTemplateHelperDialog = null;
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Content area
    const content = document.createElement('div');
    content.style.cssText = `
        flex: 1;
        display: flex;
        overflow: hidden;
        padding: 20px;
        gap: 20px;
    `;
    
    // Template panels container (left side)
    const templatePanelsContainer = document.createElement('div');
    templatePanelsContainer.style.cssText = `
        width: 230px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    `;
    
    // Preset templates panel
    const presetPanel = document.createElement('div');
    presetPanel.style.cssText = `
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        padding: 10px;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
    `;
    
    const presetPanelTitle = document.createElement('h3');
    presetPanelTitle.textContent = '模版预设 - Templates Preset';
    presetPanelTitle.style.cssText = `
        color: #10b981;
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 13px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 5px;
        line-height: 1.2;
    `;
    
    const presetList = document.createElement('div');
    presetList.id = 'preset-list';
    presetList.style.cssText = `
        display: flex;
        flex-wrap: nowrap;
        flex-direction: column;
        gap: 6px;
    `;
    
    presetPanel.appendChild(presetPanelTitle);
    presetPanel.appendChild(presetList);
    
    // Custom templates panel
    const customPanel = document.createElement('div');
    customPanel.style.cssText = `
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        padding: 10px;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
    `;
    
    const customPanelTitle = document.createElement('h3');
    customPanelTitle.textContent = '我的模版 - My Templates';
    customPanelTitle.style.cssText = `
        color: #ff8c00;
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 13px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 5px;
        line-height: 1.2;
    `;
    
    const customList = document.createElement('div');
    customList.id = 'custom-list';
    customList.style.cssText = `
        display: flex;
        flex-wrap: nowrap;
        flex-direction: column;
        gap: 6px;
    `;
    
    customPanel.appendChild(customPanelTitle);
    customPanel.appendChild(customList);
    
    templatePanelsContainer.appendChild(presetPanel);
    templatePanelsContainer.appendChild(customPanel);
    
    // Populate preset templates
    populatePresetTemplates(presetList);
    // Populate custom templates
    populateCustomTemplates(customList);
    
    // Editor area (right side)
    const editorArea = document.createElement('div');
    editorArea.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        overflow: hidden;
    `;
    
    const editorHeader = document.createElement('div');
    editorHeader.style.cssText = `
        padding: 10px 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const editorTitle = document.createElement('h3');
    editorTitle.textContent = '快速插入引用符 - Quick Insert Symbols';
    editorTitle.style.cssText = `
        color: #4facfe;
        margin: 0;
        font-size: 15px;
    `;
    
    // Sync to node button
    const syncToNodeButton = document.createElement('button');
    syncToNodeButton.innerHTML = '同步至节点 · Sync to Node';
    syncToNodeButton.style.cssText = `
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid rgba(168, 85, 247, 0.7);
        background: linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7e22ce 100%);
        color: white;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
        text-align: center;
        line-height: 1.2;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        min-width: 60px;
    `;
    
    syncToNodeButton.addEventListener('mouseenter', () => {
        syncToNodeButton.style.transform = 'translateY(-2px)';
        syncToNodeButton.style.boxShadow = '0 4px 8px rgba(168, 85, 247, 0.3)';
    });
    
    syncToNodeButton.addEventListener('mouseleave', () => {
        syncToNodeButton.style.transform = 'translateY(0)';
        syncToNodeButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
    
    syncToNodeButton.addEventListener('click', () => {
        syncTemplateToNode();
    });
    
    // Save template button
    const saveTemplateButton = document.createElement('button');
    saveTemplateButton.innerHTML = '保存模版 · Save Template';
    saveTemplateButton.style.cssText = `
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid rgba(16, 185, 129, 0.7);
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        color: white;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
        text-align: center;
        line-height: 1.2;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        min-width: 50px;
    `;
    
    saveTemplateButton.addEventListener('mouseenter', () => {
        saveTemplateButton.style.transform = 'translateY(-2px)';
        saveTemplateButton.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
    });
    
    saveTemplateButton.addEventListener('mouseleave', () => {
        saveTemplateButton.style.transform = 'translateY(0)';
        saveTemplateButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
    
    saveTemplateButton.addEventListener('click', () => {
        saveCustomTemplate();
    });
    
    // Create button container for better layout
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 8px;
        align-items: center;
    `;
    
    // Clear editor button
    const clearButton = document.createElement('button');
    clearButton.innerHTML = '清除 · Clear';
    clearButton.style.cssText = `
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid rgba(239, 68, 68, 0.7);
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
        color: white;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
        text-align: center;
        line-height: 1.2;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        min-width: 50px;
        margin-left: 60px;
    `;
    
    clearButton.addEventListener('mouseenter', () => {
        clearButton.style.transform = 'translateY(-2px)';
        clearButton.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
    });
    
    clearButton.addEventListener('mouseleave', () => {
        clearButton.style.transform = 'translateY(0)';
        clearButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
    
    clearButton.addEventListener('click', () => {
        if (currentTemplateEditor) {
            currentTemplateEditor.innerHTML = '';
            showToast('✅ 文本框内容已清除', 'success');
        }
    });
    
    // Export templates button
    const exportButton = document.createElement('button');
    exportButton.innerHTML = '导出 · Export';
    exportButton.style.cssText = `
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid rgba(59, 130, 246, 0.7);
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
        color: white;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
        text-align: center;
        line-height: 1.2;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        min-width: 50px;
    `;
    
    exportButton.addEventListener('mouseenter', () => {
        exportButton.style.transform = 'translateY(-2px)';
        exportButton.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
    });
    
    exportButton.addEventListener('mouseleave', () => {
        exportButton.style.transform = 'translateY(0)';
        exportButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
    
    exportButton.addEventListener('click', () => {
        TemplateManager.exportTemplates();
    });
    
    // Import templates button
    const importButton = document.createElement('button');
    importButton.innerHTML = '导入 · Import';
    importButton.style.cssText = `
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid rgba(245, 158, 11, 0.7);
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
        color: white;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
        text-align: center;
        line-height: 1.2;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        min-width: 50px;
    `;
    
    importButton.addEventListener('mouseenter', () => {
        importButton.style.transform = 'translateY(-2px)';
        importButton.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.3)';
    });
    
    importButton.addEventListener('mouseleave', () => {
        importButton.style.transform = 'translateY(0)';
        importButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
    
    importButton.addEventListener('click', () => {
        TemplateManager.importTemplates();
    });
    
    buttonContainer.appendChild(exportButton);
    buttonContainer.appendChild(importButton);
    buttonContainer.appendChild(saveTemplateButton);
    buttonContainer.appendChild(clearButton);
    buttonContainer.appendChild(syncToNodeButton);
    
    editorHeader.appendChild(editorTitle);
    editorHeader.appendChild(buttonContainer);
    
    // Quick insert symbols container (moved to be below the editor header)
    const quickInsertContainer = document.createElement('div');
    quickInsertContainer.style.cssText = `
        padding: 10px 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        max-height: 160px;
        overflow-y: auto;
        overflow-x: hidden;
    `;
    
    const quickInsertContent = document.createElement('div');
    quickInsertContent.id = 'quick-insert-content';
    quickInsertContent.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        width: 100%;
    `;
    
    quickInsertContainer.appendChild(quickInsertContent);
    

    
    // Removed duplicate appendChild calls
    
    const editorContent = document.createElement('div');
    editorContent.style.cssText = `
        flex: 1;
        padding: 15px;
        display: flex;
        flex-direction: column;
    `;
    
    // Create a custom contenteditable div instead of textarea for rich editing
    const editorWrapper = document.createElement('div');
    editorWrapper.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        position: relative;
    `;

    const templateEditor = document.createElement('div');
    templateEditor.id = 'template-editor';
    templateEditor.contentEditable = true;
    templateEditor.dataset.placeholder = '在这里编写您的模版...\nWrite your template here...\n\n使用上方的快速插入按钮来添加引用符。\nUse the quick insert buttons above to add reference symbols.';
    templateEditor.style.cssText = `
        flex: 1;
        width: 100%;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 14px;
        font-family: 'Courier New', monospace;
        outline: none;
        line-height: 1.8;
        overflow-y: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
    `;

    // Add placeholder styling
    const placeholderStyle = document.createElement('style');
    placeholderStyle.textContent = `
        #template-editor:empty:before {
            content: attr(data-placeholder);
            color: rgba(255, 255, 255, 0.4);
            white-space: pre-wrap;
        }

        .reference-tag {
            display: inline-flex;
            align-items: center;
            padding: 2px 5px;
            margin: 0 1px;
            border-radius: 4px;
            border: 1px solid rgba(79, 172, 254, 0.6);
            background: rgba(79, 172, 254, 0.15);
            color: white;
            font-size: 13px;
            font-weight: normal;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            user-select: none;
            vertical-align: baseline;
            white-space: nowrap;
            line-height: 1.4;
        }

        .reference-tag:hover {
            box-shadow: 0 4px 8px rgba(79, 172, 254, 0.3);
            background: rgba(79, 172, 254, 0.25);
            border-color: rgba(79, 172, 254, 0.8);
        }

        .reference-tag:active {
            transform: translateY(0);
        }

        .tag-menu {
            position: absolute;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 1px solid rgba(79, 172, 254, 0.5);
            border-radius: 8px;
            padding: 8px 0;
            min-width: 160px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
            z-index: 10003;
            max-height: 300px;
            overflow-y: auto;
        }

        .tag-menu-item {
            padding: 8px 16px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
        }

        .tag-menu-item:hover {
            background: rgba(79, 172, 254, 0.2);
        }

        .tag-menu-item.current {
            background: rgba(79, 172, 254, 0.3);
            font-weight: bold;
        }

        .tag-menu-divider {
            height: 1px;
            background: rgba(255, 255, 255, 0.1);
            margin: 4px 0;
        }

        .tag-menu-delete {
            color: #ef4444;
        }

        .tag-menu-delete:hover {
            background: rgba(239, 68, 68, 0.2);
        }
    `;
    document.head.appendChild(placeholderStyle);

    // Set up the current template editor reference
    currentTemplateEditor = templateEditor;

    // Handle paste events to parse reference symbols
    templateEditor.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');

        // Check if text contains reference symbols
        if (text.match(/\{[^}]+\}/)) {
            // Parse and insert with tags
            const fragment = parseTemplateToElements(text);
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(fragment);
                // Move cursor to end of inserted content
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        } else {
            // Insert plain text
            insertPlainText(text);
        }
    });

    editorWrapper.appendChild(templateEditor);
    editorContent.appendChild(editorWrapper);
    
    editorArea.appendChild(editorHeader);
    editorArea.appendChild(quickInsertContainer); // Add the quick insert container below the header
    editorArea.appendChild(editorContent);
    
    content.appendChild(templatePanelsContainer);
    content.appendChild(editorArea);
    
    dialog.appendChild(header);
    dialog.appendChild(content);
    
    overlay.appendChild(dialog);
    
    // Populate the quick insert panel
    populateQuickInsertPanel(quickInsertContent);
    
    // Make the dialog draggable (disabled as requested - fixed position)
    // makeDraggable(dialog, header);
    
    // Optimize keyboard event handling to ensure interactions don't affect outside UI
    overlay.addEventListener('keydown', (event) => {
        // Allow all keys if focus is on textarea or input elements
        const target = event.target;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
            // Contain the event within the UI
            event.stopImmediatePropagation();
            return;
        }
        
        // For other elements in the UI, still contain the event
        event.stopImmediatePropagation();
    });
    
    // Dialog positioning is fixed and non-draggable as requested
    
    return overlay;
}

// Populate the preset templates panel with one-click template options
function populatePresetTemplates(container) {
    const templatePresets = [
        {
            name: '时尚人像 · Fashion Portrait',
            template: 'This is a photo from a fashion magazine, A photo taken with {camera} with {lens}, {lighting}, Shoot from a {perspective} perspective, a beautiful {gender} model wearing a {top} and {bottom} at the {location}, The model is {pose}, {orientation}, {gender} was wearing {boots} and {accessories}, {movement} movements, strong visual impact, professional fashion photography style, high resolution, perfect composition.'
        },
        {
            name: '户外风景 · Landscape',
            template: 'This is a breathtaking landscape photograph, captured with {camera} using {lens}, shot in {weather} conditions with {lighting}, photographed from a {perspective} perspective, showing the magnificent {location} during {season}, the scene features {movement} elements, professional landscape photography, dramatic composition, award-winning quality.'
        },
        {
            name: '街头摄影 · Street Photography',
            template: 'This is a candid street photography shot, taken with {camera} and {lens}, natural {lighting} creates the mood, captured from a {perspective} angle, showing {gender} {character} in {movement} at {location}, the person is {pose}, {orientation}, wearing {top} and {bottom}, authentic urban photography style, documentary aesthetic.'
        },
        {
            name: '室内人像 · Indoor Portrait',
            template: 'This is an intimate indoor portrait, photographed with {camera} using {lens}, dramatic {lighting} illuminates the scene, shot from a {perspective} perspective, featuring a {gender} model in {location}, the subject is {pose}, {orientation}, dressed in {top} and {bottom}, with {boots} and {accessories}, professional studio portrait style.'
        },
        {
            name: '运动摄影 · Sports Photography',
            template: 'This is a dynamic sports photograph, captured with {camera} using {lens} for action shots, taken during {movement} with {lighting}, photographed from a {perspective} perspective showing {character} in action at {location}, the athlete is {pose}, {orientation}, wearing professional sportswear {top} and {bottom}, high-speed photography technique, dramatic frozen motion.'
        },
        {
            name: '艺术创作 · Artistic Creation',
            template: 'This is an artistic creative photograph, shot with {camera} using {lens}, artistic {lighting} creates mood and atmosphere, captured from a unique {perspective} viewpoint, featuring {gender} {character} in {location}, the model is artistically {pose}, {orientation}, wearing creative {top} and {bottom}, complemented by {accessories}, fine art photography style, gallery-worthy composition.'
        }
    ];
    
    // Clear existing content
    container.innerHTML = '';
    
    // Add preset templates
    templatePresets.forEach(preset => {
        const button = createTemplateButton(preset.name, preset.template, 'preset');
        container.appendChild(button);
    });
}

// Populate the custom templates panel with user templates
function populateCustomTemplates(container) {
    // Clear existing content
    container.innerHTML = '';
    
    // Add custom templates if any
    const currentCustomTemplates = TemplateManager.getTemplates();
    if (currentCustomTemplates.length > 0) {
        // Add custom templates
        currentCustomTemplates.forEach((customTemplate, index) => {
            const button = createTemplateButton(customTemplate.name, customTemplate.template, 'custom', index);
            container.appendChild(button);
        });
    } else {
        // Show empty state message
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = '暂无自定义模版\nNo custom templates';
        emptyMessage.style.cssText = `
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
            text-align: center;
            padding: 20px;
            line-height: 1.4;
        `;
        container.appendChild(emptyMessage);
    }
}

// Populate the template presets panel with one-click template options (legacy function - now split)
function populateTemplatePresets(container) {
    // This function is now split into populatePresetTemplates and populateCustomTemplates
    // For backward compatibility, we'll create a combined view
    const presetContainer = document.createElement('div');
    const customContainer = document.createElement('div');
    
    populatePresetTemplates(presetContainer);
    populateCustomTemplates(customContainer);
    
    // Clear the original container and add both sections
    container.innerHTML = '';
    container.appendChild(presetContainer);
    
    if (customContainer.children.length > 0) {
        // Add separator if there are custom templates
        const separator = document.createElement('div');
        separator.style.cssText = `
            width: 100%;
            height: 1px;
            background: rgba(255, 255, 255, 0.2);
            margin: 15px 0;
        `;
        container.appendChild(separator);
        container.appendChild(customContainer);
    }
}

// Create template button
function createTemplateButton(name, template, type = 'preset', index = null) {
    const button = document.createElement('button');
    button.textContent = name;
    
    // Define colors based on template type
    const presetColor = { border: 'rgba(16, 185, 129, 0.5)', bg: 'rgba(16, 185, 129, 0.1)', hover: 'rgba(16, 185, 129, 0.2)', shadow: 'rgba(16, 185, 129, 0.2)' };
    const customColor = { border: 'rgba(255, 140, 0, 0.8)', bg: 'rgba(255, 140, 0, 0.15)', hover: 'rgba(255, 140, 0, 0.25)', shadow: 'rgba(255, 140, 0, 0.3)' };
    
    const colors = type === 'custom' ? customColor : presetColor;
    
    button.style.cssText = `
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid ${colors.border};
        background: ${colors.bg};
        color: white;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
        outline: none;
        line-height: 1.2;
        word-wrap: normal;
        white-space: nowrap;
        width: fit-content;
        max-width: 100%;
        position: relative;
    `;
    
    // Add delete button for custom templates
    if (type === 'custom' && index !== null) {
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '×';
        deleteButton.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: none;
            background: rgba(239, 68, 68, 0.8);
            color: white;
            font-size: 10px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            transition: all 0.2s ease;
        `;
        
        deleteButton.addEventListener('mouseenter', () => {
            deleteButton.style.background = 'rgba(239, 68, 68, 1)';
            deleteButton.style.transform = 'scale(1.1)';
        });
        
        deleteButton.addEventListener('mouseleave', () => {
            deleteButton.style.background = 'rgba(239, 68, 68, 0.8)';
            deleteButton.style.transform = 'scale(1)';
        });
        
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteCustomTemplate(index);
        });
        
        button.appendChild(deleteButton);
    }
    
    button.addEventListener('mouseenter', () => {
        button.style.background = colors.hover;
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = `0 4px 8px ${colors.shadow}`;
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.background = colors.bg;
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = 'none';
    });
    
    button.addEventListener('click', () => {
        if (type === 'custom') {
            applyTemplatePreset(template);
        } else {
            applyTemplatePreset(template);
        }
    });
    
    return button;
}

// Apply template preset to the editor
function applyTemplatePreset(template) {
    if (!currentTemplateEditor) return;

    // Clear the editor
    currentTemplateEditor.innerHTML = '';

    // Parse the template and convert {symbol} to tag elements
    const parsedContent = parseTemplateToElements(template);
    currentTemplateEditor.appendChild(parsedContent);

    currentTemplateEditor.focus();

    // Show feedback
    showToast('✅ 模版已应用', 'success');
}

// Parse template text and convert reference symbols to tag elements
function parseTemplateToElements(text) {
    const fragment = document.createDocumentFragment();

    // Regular expression to match {symbol} patterns
    const regex = /\{[^}]+\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            const textNode = document.createTextNode(text.substring(lastIndex, match.index));
            fragment.appendChild(textNode);
        }

        // Add the tag element
        const tag = createReferenceTagElement(match[0]);
        fragment.appendChild(tag);

        lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        const textNode = document.createTextNode(text.substring(lastIndex));
        fragment.appendChild(textNode);
    }

    return fragment;
}

// Get template content from editor (convert tags back to text)
function getTemplateContent() {
    if (!currentTemplateEditor) return '';

    let content = '';

    // Recursively process child nodes
    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Only add text nodes that are not inside reference tags
            if (!node.parentElement.classList || !node.parentElement.classList.contains('reference-tag')) {
                content += node.textContent;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList.contains('reference-tag')) {
                // Add the symbol for reference tags
                content += node.dataset.symbol;
            } else {
                // Process children for other elements
                node.childNodes.forEach(child => processNode(child));
            }
        }
    }

    currentTemplateEditor.childNodes.forEach(child => processNode(child));

    return content;
}

// Save custom template
function saveCustomTemplate() {
    if (!currentTemplateEditor) return;

    const templateContent = getTemplateContent().trim();
    if (!templateContent) {
        showToast('❌ 请先编写模版内容', 'error');
        return;
    }

    // Create custom modal dialog
    showCustomTemplateDialog(templateContent);
}

// Show custom template dialog
function showCustomTemplateDialog(templateContent) {
    // Remove existing modal if any
    const existingModal = document.getElementById('custom-template-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'custom-template-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
    `;
    
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 16px;
        padding: 36px;
        width: 90%;
        max-width: 600px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        position: relative;
        animation: modalSlideIn 0.3s ease;
    `;
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
    `;
    document.head.appendChild(style);
    
    const title = document.createElement('h3');
    title.textContent = '💾 保存自定义模版';
    title.style.cssText = `
        color: #4facfe;
        margin: 0 0 25px 0;
        font-size: 20px;
        font-weight: 600;
        text-align: center;
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    `;
    
    // Chinese name input
    const chineseLabel = document.createElement('label');
    chineseLabel.textContent = '中文名称';
    chineseLabel.style.cssText = `
        display: block;
        color: #fff;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
    `;
    
    const chineseInput = document.createElement('input');
    chineseInput.type = 'text';
    chineseInput.placeholder = '请输入中文名称';
    chineseInput.style.cssText = `
        width: 100%;
        padding: 12px 16px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 14px;
        outline: none;
        margin-bottom: 20px;
        transition: all 0.3s ease;
        box-sizing: border-box;
    `;
    
    chineseInput.addEventListener('focus', () => {
        chineseInput.style.borderColor = '#4facfe';
        chineseInput.style.boxShadow = '0 0 0 2px rgba(79, 172, 254, 0.2)';
    });
    
    chineseInput.addEventListener('blur', () => {
        chineseInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        chineseInput.style.boxShadow = 'none';
    });
    
    // English name input
    const englishLabel = document.createElement('label');
    englishLabel.textContent = 'English Name';
    englishLabel.style.cssText = `
        display: block;
        color: #fff;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
    `;
    
    const englishInput = document.createElement('input');
    englishInput.type = 'text';
    englishInput.placeholder = 'Please enter English name';
    englishInput.style.cssText = `
        width: 100%;
        padding: 12px 16px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 14px;
        outline: none;
        margin-bottom: 25px;
        transition: all 0.3s ease;
        box-sizing: border-box;
    `;
    
    englishInput.addEventListener('focus', () => {
        englishInput.style.borderColor = '#4facfe';
        englishInput.style.boxShadow = '0 0 0 2px rgba(79, 172, 254, 0.2)';
    });
    
    englishInput.addEventListener('blur', () => {
        englishInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        englishInput.style.boxShadow = 'none';
    });
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: flex-end;
    `;
    
    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消 Cancel';
    cancelButton.style.cssText = `
        padding: 12px 24px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
    `;
    
    cancelButton.addEventListener('mouseenter', () => {
        cancelButton.style.background = 'rgba(255, 255, 255, 0.2)';
    });
    
    cancelButton.addEventListener('mouseleave', () => {
        cancelButton.style.background = 'rgba(255, 255, 255, 0.1)';
    });
    
    // Save button
    const saveButton = document.createElement('button');
    saveButton.textContent = '保存 Save';
    saveButton.style.cssText = `
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid rgba(16, 185, 129, 0.7);
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        color: white;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
        line-height: 1.2;
        min-width: 50px;
    `;
    
    saveButton.addEventListener('mouseenter', () => {
        saveButton.style.transform = 'translateY(-1px)';
        saveButton.style.boxShadow = '0 2px 6px rgba(16, 185, 129, 0.3)';
    });
    
    saveButton.addEventListener('mouseleave', () => {
        saveButton.style.transform = 'translateY(0)';
        saveButton.style.boxShadow = 'none';
    });
    
    // Add event listeners
    cancelButton.addEventListener('click', () => {
        modal.remove();
        style.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            style.remove();
        }
    });
    
    saveButton.addEventListener('click', () => {
        const chineseName = chineseInput.value.trim();
        const englishName = englishInput.value.trim();
        
        if (!chineseName) {
            showToast('❌ 请输入中文名称', 'error');
            chineseInput.focus();
            return;
        }
        
        if (!englishName) {
            showToast('❌ 请输入英文名称', 'error');
            englishInput.focus();
            return;
        }
        
        // Check if template name already exists
        const existingTemplate = customTemplates.find(t => t.name === `${chineseName} · ${englishName}`);
        if (existingTemplate) {
            showToast('❌ 模版名称已存在', 'error');
            return;
        }
        
        // Add new template
        customTemplates.push({
            name: `${chineseName} · ${englishName}`,
            chineseName: chineseName,
            englishName: englishName,
            template: templateContent
        });
        
        // Save templates using TemplateManager
        TemplateManager.saveTemplates(customTemplates);
        
        // Refresh the template lists
        const presetList = document.querySelector('#preset-list');
        const customList = document.querySelector('#custom-list');
        if (presetList) {
            populatePresetTemplates(presetList);
        }
        if (customList) {
            populateCustomTemplates(customList);
        }
        
        // Close modal
        modal.remove();
        style.remove();
        
        showToast('✅ 模版已保存', 'success');
    });
    
    // Assemble dialog
    dialogContent.appendChild(title);
    dialogContent.appendChild(chineseLabel);
    dialogContent.appendChild(chineseInput);
    dialogContent.appendChild(englishLabel);
    dialogContent.appendChild(englishInput);
    
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(saveButton);
    dialogContent.appendChild(buttonContainer);
    
    modal.appendChild(dialogContent);
    document.body.appendChild(modal);
    
    // Focus on first input
    chineseInput.focus();
}

// Delete custom template
function deleteCustomTemplate(index) {
    // Create custom delete confirmation dialog
    showDeleteConfirmDialog(index);
}

// Show delete confirmation dialog
function showDeleteConfirmDialog(index) {
    // Remove existing modal if any
    const existingModal = document.getElementById('delete-confirm-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'delete-confirm-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
    `;
    document.head.appendChild(style);
    
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 16px;
        padding: 36px;
        width: 90%;
        max-width: 540px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        position: relative;
        animation: modalSlideIn 0.3s ease;
    `;
    
    const icon = document.createElement('div');
    icon.innerHTML = '⚠️';
    icon.style.cssText = `
        font-size: 48px;
        text-align: center;
        margin-bottom: 20px;
    `;
    
    const title = document.createElement('h3');
    title.textContent = '确认删除';
    title.style.cssText = `
        color: #ef4444;
        margin: 0 0 15px 0;
        font-size: 20px;
        font-weight: 600;
        text-align: center;
    `;
    
    const message = document.createElement('p');
    message.innerHTML = '确定要删除这个自定义模版吗？<br>Are you sure you want to delete this custom template?';
    message.style.cssText = `
        color: #fff;
        font-size: 14px;
        line-height: 1.5;
        text-align: center;
        margin: 0 0 25px 0;
        opacity: 0.9;
    `;
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: center;
    `;
    
    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消 Cancel';
    cancelButton.style.cssText = `
        padding: 12px 24px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
        min-width: 100px;
    `;
    
    cancelButton.addEventListener('mouseenter', () => {
        cancelButton.style.background = 'rgba(255, 255, 255, 0.2)';
        cancelButton.style.transform = 'translateY(-2px)';
    });
    
    cancelButton.addEventListener('mouseleave', () => {
        cancelButton.style.background = 'rgba(255, 255, 255, 0.1)';
        cancelButton.style.transform = 'translateY(0)';
    });
    
    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '删除 Delete';
    deleteButton.style.cssText = `
        padding: 12px 24px;
        border-radius: 8px;
        border: 1px solid rgba(239, 68, 68, 0.7);
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
        min-width: 100px;
    `;
    
    deleteButton.addEventListener('mouseenter', () => {
        deleteButton.style.transform = 'translateY(-2px)';
        deleteButton.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
    });
    
    deleteButton.addEventListener('mouseleave', () => {
        deleteButton.style.transform = 'translateY(0)';
        deleteButton.style.boxShadow = 'none';
    });
    
    // Add event listeners
    cancelButton.addEventListener('click', () => {
        modal.remove();
        style.remove();
    });
    
    deleteButton.addEventListener('click', () => {
        // Perform the actual deletion
        customTemplates.splice(index, 1);
        
        // Save templates using TemplateManager
        TemplateManager.saveTemplates(customTemplates);
        
        // Refresh the template lists
        const presetList = document.querySelector('#preset-list');
        const customList = document.querySelector('#custom-list');
        if (presetList) {
            populatePresetTemplates(presetList);
        }
        if (customList) {
            populateCustomTemplates(customList);
        }
        
        // Close modal
        modal.remove();
        style.remove();
        
        showToast('✅ 自定义模版已删除', 'success');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            style.remove();
        }
    });
    
    // Assemble dialog
    dialogContent.appendChild(icon);
    dialogContent.appendChild(title);
    dialogContent.appendChild(message);
    
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(deleteButton);
    dialogContent.appendChild(buttonContainer);
    
    modal.appendChild(dialogContent);
    document.body.appendChild(modal);
}

// Reference symbol mapping with bilingual names
const REFERENCE_SYMBOL_MAP = {
    '{character}': { cn: '人物', en: 'Character' },
    '{gender}': { cn: '性别', en: 'Gender' },
    '{pose}': { cn: '姿势', en: 'Pose' },
    '{movement}': { cn: '动作', en: 'Movement' },
    '{orientation}': { cn: '朝向', en: 'Orientation' },
    '{top}': { cn: '上衣', en: 'Top' },
    '{bottom}': { cn: '下装', en: 'Bottom' },
    '{boots}': { cn: '鞋子', en: 'Boots' },
    '{accessories}': { cn: '配饰', en: 'Accessories' },
    '{camera}': { cn: '相机', en: 'Camera' },
    '{lens}': { cn: '镜头', en: 'Lens' },
    '{lighting}': { cn: '灯光', en: 'Lighting' },
    '{perspective}': { cn: '视角', en: 'Perspective' },
    '{location}': { cn: '位置', en: 'Location' },
    '{weather}': { cn: '天气', en: 'Weather' },
    '{season}': { cn: '季节', en: 'Season' }
};

// Get bilingual display name for a symbol
function getBilingualName(symbol) {
    const mapping = REFERENCE_SYMBOL_MAP[symbol];
    if (mapping) {
        return `${mapping.cn} ${symbol}`;
    }
    return symbol;
}

// Populate the quick insert panel with reference symbols
function populateQuickInsertPanel(container) {
    const referenceSymbols = [
        { name: '人物 Character {character}', symbol: '{character}', description: '人物类型 · Character type' },
        { name: '性别 Gender {gender}', symbol: '{gender}', description: '性别 · Gender' },
        { name: '姿势 Pose {pose}', symbol: '{pose}', description: '姿势 · Pose' },
        { name: '动作 Movement {movement}', symbol: '{movement}', description: '动作 · Movement' },
        { name: '朝向 Orientation {orientation}', symbol: '{orientation}', description: '朝向 · Orientation' },
        { name: '上衣 Top {top}', symbol: '{top}', description: '上衣 · Top' },
        { name: '下装 Bottom {bottom}', symbol: '{bottom}', description: '下装 · Bottom' },
        { name: '鞋子 Shoes {boots}', symbol: '{boots}', description: '鞋子 · Shoes' },
        { name: '配饰 Accessories {accessories}', symbol: '{accessories}', description: '配饰 · Accessories' },
        { name: '相机 Camera {camera}', symbol: '{camera}', description: '相机 · Camera' },
        { name: '镜头 Lens {lens}', symbol: '{lens}', description: '镜头 · Lens' },
        { name: '灯光 Lighting {lighting}', symbol: '{lighting}', description: '灯光 · Lighting' },
        { name: '视角 Perspective {perspective}', symbol: '{perspective}', description: '视角 · Perspective' },
        { name: '位置 Location {location}', symbol: '{location}', description: '位置 · Location' },
        { name: '天气 Weather {weather}', symbol: '{weather}', description: '天气 · Weather' },
        { name: '季节 Season {season}', symbol: '{season}', description: '季节 · Season' }
    ];
    
    referenceSymbols.forEach(item => {
        const button = document.createElement('button');
        button.title = `${item.symbol} - ${item.description}`;
        button.style.cssText = `
            padding: 6px 12px;
            border-radius: 6px;
            border: 1px solid rgba(79, 172, 254, 0.5);
            background: rgba(79, 172, 254, 0.1);
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            line-height: 1.2;
            gap: 8px;
            min-width: 80px;
            flex-shrink: 0;
        `;
        
        // Get the bilingual name part (Chinese + English) without the symbol
        const namePart = item.name.split(' {')[0];
        const nameContainer = document.createElement('span');
        nameContainer.textContent = namePart;
        nameContainer.style.cssText = `
            color: white;
            font-size: 14px;
        `;
        
        // Create colored symbol text on the right
        const symbolText = document.createElement('span');
        symbolText.textContent = item.symbol;
        symbolText.style.cssText = `
            font-family: 'SimSun', 'Songti SC', serif;
            font-size: 14px;
            color: #4facfe;
            font-weight: bold;
        `;
        
        button.appendChild(nameContainer);
        button.appendChild(symbolText);
        
        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(79, 172, 254, 0.2)';
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 4px 8px rgba(79, 172, 254, 0.2)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(79, 172, 254, 0.1)';
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        });
        
        button.addEventListener('click', () => {
            insertTextAtCursor(item.symbol);
        });
        
        container.appendChild(button);
    });
}

// Insert text at cursor position in the template editor
function insertTextAtCursor(text) {
    if (!currentTemplateEditor) return;

    // Check if it's a reference symbol (enclosed in {})
    if (text.match(/^\{.+\}$/)) {
        // Create a reference tag button
        insertReferenceTag(text);
    } else {
        // Insert plain text
        insertPlainText(text);
    }

    // Focus the editor
    currentTemplateEditor.focus();

    // Show feedback
    showToast(`✅ 已插入: ${text}`, 'success');
}

// Insert plain text at cursor position
function insertPlainText(text) {
    const selection = window.getSelection();
    if (!selection.rangeCount) {
        currentTemplateEditor.textContent += text;
        return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    // Move cursor after inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
}

// Insert a reference tag (button) at cursor position
function insertReferenceTag(symbolText) {
    const selection = window.getSelection();
    let range;

    if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);

        // Make sure we're inserting within the editor
        if (!currentTemplateEditor.contains(range.commonAncestorContainer)) {
            // If not in editor, append to end
            range = document.createRange();
            range.selectNodeContents(currentTemplateEditor);
            range.collapse(false);
        }
    } else {
        // No selection, append to end
        range = document.createRange();
        range.selectNodeContents(currentTemplateEditor);
        range.collapse(false);
    }

    range.deleteContents();

    // Create the tag button
    const tag = createReferenceTagElement(symbolText);

    // Insert the tag
    range.insertNode(tag);

    // Move cursor after the tag
    range.setStartAfter(tag);
    range.setEndAfter(tag);
    selection.removeAllRanges();
    selection.addRange(range);
}

// Create a reference tag element
function createReferenceTagElement(symbolText) {
    const tag = document.createElement('span');
    tag.className = 'reference-tag';
    tag.contentEditable = false;

    // Display bilingual name instead of raw symbol
    tag.textContent = getBilingualName(symbolText);
    tag.dataset.symbol = symbolText;

    // Add click handler to show menu
    tag.addEventListener('click', (e) => {
        e.stopPropagation();
        showReferenceTagMenu(tag);
    });

    return tag;
}

// Show menu for reference tag
function showReferenceTagMenu(tagElement) {
    // Remove any existing menu
    const existingMenu = document.querySelector('.tag-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const currentSymbol = tagElement.dataset.symbol;

    // Available reference symbols with their Chinese names
    const referenceSymbols = [
        { name: '人物', symbol: '{character}' },
        { name: '性别', symbol: '{gender}' },
        { name: '姿势', symbol: '{pose}' },
        { name: '动作', symbol: '{movement}' },
        { name: '朝向', symbol: '{orientation}' },
        { name: '上衣', symbol: '{top}' },
        { name: '下装', symbol: '{bottom}' },
        { name: '鞋子', symbol: '{boots}' },
        { name: '配饰', symbol: '{accessories}' },
        { name: '相机', symbol: '{camera}' },
        { name: '镜头', symbol: '{lens}' },
        { name: '灯光', symbol: '{lighting}' },
        { name: '视角', symbol: '{perspective}' },
        { name: '位置', symbol: '{location}' },
        { name: '天气', symbol: '{weather}' },
        { name: '季节', symbol: '{season}' }
    ];

    // Create menu
    const menu = document.createElement('div');
    menu.className = 'tag-menu';

    // Add menu items
    referenceSymbols.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'tag-menu-item';
        if (item.symbol === currentSymbol) {
            menuItem.classList.add('current');
        }
        menuItem.textContent = `${item.name} ${item.symbol}`;

        menuItem.addEventListener('click', () => {
            // Update the tag with bilingual name
            tagElement.textContent = getBilingualName(item.symbol);
            tagElement.dataset.symbol = item.symbol;
            menu.remove();
            showToast(`✅ 已更改为: ${getBilingualName(item.symbol)}`, 'success');
        });

        menu.appendChild(menuItem);
    });

    // Add divider
    const divider = document.createElement('div');
    divider.className = 'tag-menu-divider';
    menu.appendChild(divider);

    // Add delete option
    const deleteItem = document.createElement('div');
    deleteItem.className = 'tag-menu-item tag-menu-delete';
    deleteItem.textContent = '🗑️ 删除标签';
    deleteItem.addEventListener('click', () => {
        tagElement.remove();
        menu.remove();
        showToast('✅ 标签已删除', 'success');
    });
    menu.appendChild(deleteItem);

    // Position menu near the tag
    document.body.appendChild(menu);

    const tagRect = tagElement.getBoundingClientRect();
    menu.style.left = tagRect.left + 'px';
    menu.style.top = (tagRect.bottom + 5) + 'px';

    // Adjust if menu goes off screen
    setTimeout(() => {
        const menuRect = menu.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
            menu.style.left = (window.innerWidth - menuRect.width - 10) + 'px';
        }
        if (menuRect.bottom > window.innerHeight) {
            menu.style.top = (tagRect.top - menuRect.height - 5) + 'px';
        }
    }, 0);

    // Close menu when clicking outside
    const closeMenu = (e) => {
        if (!menu.contains(e.target) && e.target !== tagElement) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };

    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 0);
}

// Copy template content to clipboard
function copyTemplateContent() {
    if (!currentTemplateEditor) return;

    const content = getTemplateContent();
    if (!content.trim()) {
        showToast('⚠️ 没有内容可复制', 'warning');
        return;
    }

    // Try to use the modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content).then(() => {
            showToast('✅ 内容已复制到剪贴板', 'success');
        }).catch(() => {
            // Fallback to older method
            fallbackCopyText(content);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyText(content);
    }
}

// Fallback copy method for older browsers
function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('✅ 内容已复制到剪贴板', 'success');
    } catch (err) {
        showToast('❌ 复制失败，请手动选择复制', 'error');
    } finally {
        document.body.removeChild(textArea);
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove any existing toast
    const existingToast = document.getElementById('toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) translateY(100px);
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10001;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transition: all 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
        text-align: center;
        ${
            type === 'success' ? 'background: linear-gradient(135deg, #10b981 0%, #059669 100%);' :
            type === 'error' ? 'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);' :
            type === 'warning' ? 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);' :
            'background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);'
        }
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // Auto remove after delay
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Sync template content to the main node
function syncTemplateToNode() {
    if (!currentTemplateEditor) return;

    const content = getTemplateContent();
    if (!content.trim()) {
        showToast('⚠️ 没有内容可同步', 'warning');
        return;
    }

    // Check if we have a valid node reference
    if (!currentTemplateNode) {
        showToast('❌ 无法同步到节点：未找到节点引用', 'error');
        return;
    }

    // Find the template widget in the node
    const templateWidget = currentTemplateNode.widgets.find(widget => widget.name === "template");
    if (!templateWidget) {
        showToast('❌ 无法同步到节点：未找到template控件', 'error');
        return;
    }

    // Set the template widget value
    templateWidget.value = content;

    // Trigger node update
    currentTemplateNode.setDirtyCanvas(true);

    // Show success message
    showToast('✅ 内容已同步到节点', 'success');

    // Close the template helper dialog after sync
    if (currentTemplateHelperDialog) {
        currentTemplateHelperDialog.remove();
        currentTemplateHelperDialog = null;
    }
}

// Sync node template content to the template editor
function syncNodeToTemplate() {
    if (!currentTemplateEditor) return;

    // Check if we have a valid node reference
    if (!currentTemplateNode) {
        console.warn('No node reference found');
        return;
    }

    // Find the template widget in the node
    const templateWidget = currentTemplateNode.widgets.find(widget => widget.name === "template");
    if (!templateWidget) {
        console.warn('Template widget not found in node');
        return;
    }

    // Get the template content from the node
    const nodeTemplateContent = templateWidget.value || '';

    if (nodeTemplateContent.trim()) {
        // Clear the editor
        currentTemplateEditor.innerHTML = '';

        // Parse and populate the editor with the node's template content
        const parsedContent = parseTemplateToElements(nodeTemplateContent);
        currentTemplateEditor.appendChild(parsedContent);

        console.log('Synced node template to editor');
    }
}

