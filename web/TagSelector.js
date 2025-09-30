import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

const commonStyles = {
    button: {
        base: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none'
        },
        primary: {
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
            borderColor: 'rgba(59, 130, 246, 0.7)',
            color: '#ffffff'
        },
        primaryHover: {
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            transform: 'none'
        },
        danger: {
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            borderColor: 'rgba(220, 38, 38, 0.8)',
            color: '#ffffff'
        },
        dangerHover: {
            background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
            borderColor: 'rgba(248, 113, 113, 0.8)',
            transform: 'none'
        }
    },
    tooltip: {
        base: {
            position: 'absolute',
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            color: '#fff',
            borderRadius: '6px',
            border: '1px solid #3b82f6',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            transition: 'opacity 0.2s ease'
        }
    },
    input: {
        base: {
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            background: 'rgba(15, 23, 42, 0.3)',
            color: '#e2e8f0',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            outline: 'none'
        },
        focus: {
            borderColor: '#38bdf8',
            boxShadow: '0 0 0 2px rgba(56, 189, 248, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.2)',
            background: 'rgba(15, 23, 42, 0.4)'
        }
    },
    tag: {
        base: {
            display: 'inline-block',
            padding: '6px 12px',
            background: '#444',
            color: '#ccc',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '14px',
            position: 'relative'
        },
        selected: {
            backgroundColor: '#22c55e',
            color: '#fff'
        },
        hover: {
            backgroundColor: 'rgb(49, 84, 136)',
            color: '#fff'
        }
    }
};

function applyStyles(element, styles) {
    Object.assign(element.style, styles);
}

function setupButtonHoverEffect(element, normalStyles, hoverStyles) {
    applyStyles(element, normalStyles);
    
    element.addEventListener('mouseenter', () => {
        applyStyles(element, hoverStyles);
    });
    
    element.addEventListener('mouseleave', () => {
        applyStyles(element, normalStyles);
    });
}

app.registerExtension({
    name: "zhihui.TagSelector",
    nodeCreated(node) {
        if (node.comfyClass === "TagSelector") {
            const button = node.addWidget("button", "打开标签选择器 🔖 Open Tag Selector", "open_selector", () => {
                openTagSelector(node);
            });
            button.serialize = false;
        }
    }
});

let tagSelectorDialog = null;
let currentNode = null;
let tagsData = null;
let currentPreviewImage = null;
let currentPreviewImageName = null;

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

    tagSelectorDialog.style.display = 'block';

    if (tagSelectorDialog.keydownHandler) {

        document.removeEventListener('keydown', tagSelectorDialog.keydownHandler);
        document.addEventListener('keydown', tagSelectorDialog.keydownHandler);
    }

    updateSelectedTags();
}

async function loadTagsData() {
    try {
        const response = await fetch('/zhihui/tags');
        if (response.ok) {
            const rawData = await response.json();
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

function convertTagsFormat(rawData) {
    const convertNode = (node, isCustomCategory = false) => {
        if (node && typeof node === 'object') {
            
            if (isCustomCategory && node.hasOwnProperty('我的标签')) {
                const customTags = node['我的标签'];
                const result = {};
                for (const [tagName, tagData] of Object.entries(customTags)) {
                    
                    result[tagName] = {
                        display: tagName,
                        value: typeof tagData === 'string' ? tagData : (tagData.content || tagName)
                    };
                }
                return { '我的标签': Object.values(result) };
            }
            
            const values = Object.values(node);
            const allString = values.every(v => typeof v === 'string');
            if (allString) {
                if (isCustomCategory) {
                    
                    return Object.entries(node).map(([tagName, tagData]) => ({
                        display: tagName,
                        value: typeof tagData === 'string' ? tagData : (tagData.content || tagName)
                    }));
                }
                return Object.entries(node).map(([chineseName, englishValue]) => ({ display: chineseName, value: englishValue }));
            }
            const result = {};
            for (const [k, v] of Object.entries(node)) {
                result[k] = convertNode(v, isCustomCategory);
            }
            return result;
        }
        return node;
    };
    const converted = {};
    for (const [mainCategory, subCategories] of Object.entries(rawData)) {
        const isCustom = mainCategory === '自定义';
        converted[mainCategory] = convertNode(subCategories, isCustom);
    }
    return converted;
}

function hasDeepNesting(obj) {
    for (const value of Object.values(obj)) {
        if (typeof value === 'object' && value !== null) {
            return true;
        }
    }
    return false;
}

function getDefaultTagsData() {
    return {};
}

function createTagSelectorDialog() {
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
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    const dialogHeight = Math.min(screenHeight * 0.95, 1000);
    const dialogWidth = dialogHeight * (16 / 9);
    const finalWidth = Math.min(dialogWidth, screenWidth * 0.95);
    const finalHeight = finalWidth * (9 / 16);
    const left = (screenWidth - finalWidth) / 2;
    const top = (screenHeight - finalHeight) / 2;

    dialog.style.cssText = `
        position: fixed;
        top: ${top}px;
        left: ${left}px;
        width: ${finalWidth}px;
        height: ${finalHeight}px;
        min-width: 800px;
        min-height: 600px;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 2px solid rgb(19, 101, 201);
        border-radius: 16px;
        box-shadow: 0 0 20px rgba(96, 165, 250, 0.7), 0 0 40px rgba(96, 165, 250, 0.4);
        z-index: 10001;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
        backdrop-filter: blur(20px);
    `;

    const header = document.createElement('div');
    header.style.cssText = `
        background:rgb(34, 77, 141);
        padding: 6px 4px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 16px 16px 0 0;
        user-select: none;
        gap: 16px;
    `;

    const title = document.createElement('span');
    title.innerHTML = '🔖 标签选择器';
    title.style.cssText = `
        color: #f1f5f9;
        font-size: 18px;
        font-weight: 600;
        letter-spacing: -0.025em;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: 15px;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';

    applyStyles(closeBtn, {
        ...commonStyles.button.base,
        ...commonStyles.button.danger,
        padding: '0',
        width: '22px',
        height: '22px',
        fontSize: '18px',
        fontWeight: '700',
        lineHeight: '22px',
        verticalAlign: 'middle',
        position: 'relative',
        top: '0',
        margin: '4px 8px 4px 0'
    });
    
    const closeBtnNormalStyle = {
        ...commonStyles.button.danger
    };
    
    const closeBtnHoverStyle = {
        ...commonStyles.button.dangerHover
    };
    
    setupButtonHoverEffect(closeBtn, closeBtnNormalStyle, closeBtnHoverStyle);
    closeBtn.onclick = () => {
        overlay.style.display = 'none';

        if (tagSelectorDialog && tagSelectorDialog.keydownHandler) {
            document.removeEventListener('keydown', tagSelectorDialog.keydownHandler);
        }

        if (previewPopup && previewPopup.style.display === 'block') {
            previewPopup.style.display = 'none';

            enableMainUIInteraction();
        }
    };

    const searchBoxContainer = document.createElement('div');
    searchBoxContainer.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
    `;

    const closeButtonContainer = document.createElement('div');
    closeButtonContainer.style.cssText = `
        display: flex;
        align-items: center;
    `;

    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 5px;
        background: rgba(15, 23, 42, 0.3);
        border: none;
        padding: 1px 12px;
        border-radius: 9999px;
        box-shadow: none;
        width: 220px;
        min-width: 220px;
        max-width: 220px;
        transition: all 0.3s ease;
    `;
    
    const iconWrapper = document.createElement('div');
    iconWrapper.style.cssText = `width: 20px; height: 22px; display: flex; align-items: center; justify-content: center; pointer-events: none;`;
    iconWrapper.innerHTML = `
        <svg width="20" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        font-size: 13px;
        width: 100%;
        min-width: 65px;
        font-weight: 500;
        height: 22px;
    `;

    (function injectTagSearchPlaceholderStyle(){
        const styleId = 'zs-tag-search-placeholder-style';
        if (!document.getElementById(styleId)) {
            const styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.textContent = `
                [data-role="tag-search"]::placeholder {
                    color: #94a3b8 !important;
                    opacity: 1;
                    font-weight: 500;
                    letter-spacing: 0.3px;
                    transition: all 0.2s ease;
                }
                [data-role="tag-search"].hide-placeholder::placeholder {
                    opacity: 0;
                }
            `;
            document.head.appendChild(styleEl);
        }
    })();
    const clearSearchBtn = document.createElement('button');
    clearSearchBtn.textContent = '清除';
    clearSearchBtn.title = '清除搜索内容';

    applyStyles(clearSearchBtn, {
        ...commonStyles.button.base,
        ...commonStyles.button.danger,
        background: 'rgba(239, 68, 68, 0.15)',
        borderColor: 'rgba(239, 68, 68, 0.35)',
        color: '#fecaca',
        width: 'auto',
        height: '20px',
        borderRadius: '4px',
        padding: '0 8px',
        display: 'none',
        lineHeight: '1',
        fontWeight: '500',
        fontSize: '11px',
        whiteSpace: 'nowrap'
    });

    const clearSearchBtnNormalStyle = {
        background: 'rgba(239, 68, 68, 0.15)',
        borderColor: 'rgba(239, 68, 68, 0.35)',
        color: '#fecaca',
        transform: 'translateY(0)'
    };
    
    const clearSearchBtnHoverStyle = {
        background: 'rgba(239, 68, 68, 0.25)',
        borderColor: 'rgba(239, 68, 68, 0.5)',
        color: '#ffb4b4',
        transform: 'translateY(-1px)'
    };
    
    setupButtonHoverEffect(clearSearchBtn, clearSearchBtnNormalStyle, clearSearchBtnHoverStyle);

    searchContainer.addEventListener('click', () => searchInput.focus());
    const baseBoxShadow = 'none';
    const baseBorder = '1px solid rgba(59, 130, 246, 0.4)';
    searchInput.addEventListener('focus', () => {
        searchContainer.style.border = '1px solid #38bdf8';
        searchContainer.style.boxShadow = '0 0 0 2px rgba(56, 189, 248, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.2)';
        searchContainer.style.background = 'rgba(15, 23, 42, 0.4)';
        searchInput.classList.add('hide-placeholder');
    });
    searchInput.addEventListener('blur', () => {
        searchContainer.style.border = baseBorder;
        searchContainer.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(59, 130, 246, 0.1)';
        searchContainer.style.background = 'rgba(15, 23, 42, 0.3)';
        searchInput.classList.remove('hide-placeholder');
    });

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
        clearSearchBtn.style.display = q ? 'inline-flex' : 'none';
        handleSearch(q);
    }, 200));
    searchContainer.appendChild(iconWrapper);
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(clearSearchBtn);

    searchBoxContainer.appendChild(searchContainer);
    closeButtonContainer.appendChild(closeBtn);

    header.appendChild(title);
    header.appendChild(searchBoxContainer);
    header.appendChild(closeButtonContainer);


    const selectedOverview = document.createElement('div');
    selectedOverview.style.cssText = `
        background: linear-gradient(135deg, #475569 0%, #334155 100%);
        display: block;
        transition: all 0.3s ease;
        min-height: 60px;
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
    overviewTitleText.innerHTML = '已选择的标签:';
    overviewTitleText.style.cssText = `
        text-align: left;
        line-height: 1.2;
        margin-left: 5px;
    `;


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
        overflow-y: auto;
        max-height: 340px;
        display: none;
        scrollbar-width: thin;
        scrollbar-color: #4a9eff #334155;
    `;
    
    // 添加滚动条样式兼容性处理
    const scrollbarStyle = document.createElement('style');
    scrollbarStyle.textContent = `
        /* Webkit browsers */
        div::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        
        div::-webkit-scrollbar-track {
            background: #334155;
            border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb {
            background: #4a9eff;
            border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
            background: #3b82f6;
        }
    `;
    document.head.appendChild(scrollbarStyle);

    selectedOverview.appendChild(overviewTitle);
    selectedOverview.appendChild(selectedTagsList);


    const content = document.createElement('div');
    content.style.cssText = `
        flex: 1;
        display: flex;
        overflow: hidden;
    `;

    const categoryList = document.createElement('div');
    categoryList.style.cssText = `
        width: 120px;
        min-width: 120px;
        max-width: 120px;
        background: linear-gradient(135deg, #2d3748 0%, #1e293b 100%);
        overflow-y: auto;
        backdrop-filter: blur(10px);
        margin-right: 2px;
    `;

    const rightPanel = document.createElement('div');
    rightPanel.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
    `;

    const subCategoryTabs = document.createElement('div');
    subCategoryTabs.style.cssText = `
        background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
        display: flex;
        flex-wrap: wrap;
        overflow-y: auto;
        max-height: 140px;
        min-height: 30px;
        backdrop-filter: blur(10px);
        border: none;
    `;

    const subSubCategoryTabs = document.createElement('div');
    subSubCategoryTabs.style.cssText = `
        background: linear-gradient(135deg, #475569 0%, #334155 100%);
        display: none;
        flex-wrap: wrap;
        overflow-y: auto;
        max-height: 120px;
        min-height: 2px;
        backdrop-filter: blur(10px);
        margin-top: 2px;
        border: none;
    `;

    const subSubSubCategoryTabs = document.createElement('div');
    subSubSubCategoryTabs.style.cssText = `
        background: linear-gradient(135deg, #64748b 0%, #475569 100%);
        display: none;
        flex-wrap: wrap;
        overflow-y: auto;
        max-height: 120px;
        min-height: 2px;
        backdrop-filter: blur(10px);
        margin-top: 2px;
        border: none;
    `;

    const tagContent = document.createElement('div');
    tagContent.style.cssText = `
        flex: 1;
        padding: 24px;
        overflow-y: auto;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        backdrop-filter: blur(10px);
    `;

    const footer = document.createElement('div');
    footer.style.cssText = `
        background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
        padding: 0 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        backdrop-filter: blur(10px);
        border-radius: 0 0 16px 16px;
        column-gap: 24px;
        min-height: 60px;
        height: 60px;
        flex-shrink: 0;
    `;

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
        flex: none;
        justify-content: center;
        align-items: center;
        height: 100%;
    `;

    const singleLineContainer = document.createElement('div');
    singleLineContainer.style.cssText = `
        display: flex;
        gap: 3px;
        align-items: center;
        background: rgba(37, 99, 235, 0.3);
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2), 0 2px 6px rgba(0, 0, 0, 0.15);
        padding: 4px 8px;
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(59, 130, 246, 0.3);
        backdrop-filter: blur(8px);
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .tag-input::placeholder {
            color: #94a3b8 !important;
            opacity: 1 !important;
        }
        .tag-input:-ms-input-placeholder {
            color: #94a3b8 !important;
            opacity: 1 !important;
        }
        .tag-input::-ms-input-placeholder {
            color: #94a3b8 !important;
            opacity: 1 !important;
        }
        .tag-input.hide-placeholder::placeholder {
            opacity: 0 !important;
        }
        .tag-input.hide-placeholder:-ms-input-placeholder {
            opacity: 0 !important;
        }
        .tag-input.hide-placeholder::-ms-input-placeholder {
            opacity: 0 !important;
        }
    `;

    document.head.appendChild(styleElement);
    const customTagsTitle = document.createElement('div');
    customTagsTitle.style.cssText = `
        color: #38bdf8;
        font-size: 15px;
        font-weight: 700;
        text-align: left;
        letter-spacing: 0.3px;
        white-space: normal;
        word-break: break-word;
        overflow-wrap: anywhere;
        flex-shrink: 0;
        padding-right: 2px;
        margin-right: 2px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    `;

    customTagsTitle.textContent = '自定义标签';
    const verticalSeparator = document.createElement('div');
    verticalSeparator.style.cssText = `
        width: 1px;
        height: 25px;
        background: linear-gradient(to bottom, transparent, rgb(62, 178, 255), transparent);
        margin: 0 8px;
        flex-shrink: 0;
    `;

    const inputForm = document.createElement('div');
    inputForm.style.cssText = `
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        flex: 1;
        justify-content: flex-start;
        gap: 30px;
    `;

    const nameInputContainer = document.createElement('div');
    nameInputContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 2px;
        flex: none;
        min-width: auto;
        margin: 0;
        padding: 0;
    `;

    const nameLabel = document.createElement('label');
    nameLabel.style.cssText = `
        color: #ffffff;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        min-width: 0;
        width: fit-content;
        margin: 0;
        padding: 0;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    `;
    nameLabel.textContent = '名称';
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
        width: 120px;
        min-width: 120px;
        height: 24px;
        margin: 0;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(59, 130, 246, 0.1);
    `;
    nameInput.addEventListener('focus', () => {
        nameInput.style.borderColor = '#38bdf8';
        nameInput.style.boxShadow = '0 0 0 2px rgba(56, 189, 248, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.2)';
        nameInput.style.background = 'rgba(15, 23, 42, 0.4)';
        nameInput.classList.add('hide-placeholder');
    });
    nameInput.addEventListener('blur', () => {
        nameInput.style.borderColor = 'rgba(59, 130, 246, 0.4)';
        nameInput.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(59, 130, 246, 0.1)';
        nameInput.style.background = 'rgba(15, 23, 42, 0.3)';
        nameInput.classList.remove('hide-placeholder');
    });
    nameInputContainer.appendChild(nameLabel);
    nameInputContainer.appendChild(nameInput);

    const contentInputContainer = document.createElement('div');
    contentInputContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 2px;
        flex: none;
        min-width: auto;
        margin: 0;
        padding: 0;
    `;

    const contentLabel = document.createElement('label');
    contentLabel.style.cssText = `
        color: #ffffff;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        min-width: 0;
        width: fit-content;
        margin: 0;
        padding: 0;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    `;
    contentLabel.textContent = '内容';
    const contentInput = document.createElement('input');
    contentInput.className = 'tag-input';
    contentInput.type = 'text';
    contentInput.placeholder = '请点击打开编辑窗口';
    contentInput.readOnly = true;
    contentInput.style.cssText = `
        background: rgba(15, 23, 42, 0.3);
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 6px;
        padding: 6px 8px;
        color: white;
        font-size: 13px;
        caret-color: transparent;
        outline: none;
        transition: all 0.3s ease;
        width: 140px;
        min-width: 140px;
        height: 24px;
        margin: 0;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(59, 130, 246, 0.1);
        cursor: pointer;
    `;

    let previewPopup = null;
    let previewTextarea = null;

    function createPreviewPopup() {
        if (previewPopup) return;

        previewPopup = document.createElement('div');
        previewPopup.style.cssText = `
            position: fixed;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 20px 20px 4px 20px;
            z-index: 10002;
            display: none;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 0 4px rgba(59, 130, 246, 0.3);
            backdrop-filter: blur(20px);
        `;

        const titleBar = document.createElement('div');
        titleBar.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        `;

        const title = document.createElement('span');
        title.textContent = '请输入标签内容';
        title.style.cssText = `
            color: #f1f5f9;
            font-size: 16px;
            font-weight: 600;
        `;

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            border: 1px solid #dc2626;
            color: #ffffff;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: all 0.2s ease;
        `;

        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            closeButton.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.4)';
        });

        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
            closeButton.style.boxShadow = 'none';
        });

        closeButton.onclick = () => {
            previewPopup.style.display = 'none';

            enableMainUIInteraction();
        };

        titleBar.appendChild(title);
        titleBar.appendChild(closeButton);

        previewTextarea = document.createElement('textarea');
        previewTextarea.style.cssText = `
            width: 100%;
            height: 350px;
            background: rgba(15, 23, 42, 0.4);
            border: 1px solid rgba(59, 130, 246, 0.4);
            border-radius: 8px;
            padding: 12px;
            color: white;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            resize: none;
            outline: none;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        `;

        previewTextarea.addEventListener('input', () => {
            contentInput.value = previewTextarea.value;
        });

        const charCount = document.createElement('div');
        charCount.style.cssText = `
            text-align: right;
            color: #94a3b8;
            font-size: 12px;
            margin-top: 8px;
            margin-bottom: 0px;
        `;

        previewTextarea.addEventListener('input', () => {
            const length = previewTextarea.value.length;
            charCount.textContent = `字符数: ${length}`;
            if (length > 100) {
                charCount.style.color = '#fbbf24';
            } else if (length > 200) {
                charCount.style.color = '#ef4444';
            } else {
                charCount.style.color = '#94a3b8';
            }
        });

        previewPopup.appendChild(titleBar);
        previewPopup.appendChild(previewTextarea);
        previewPopup.appendChild(charCount);
        document.body.appendChild(previewPopup);
    }

    function showPreviewPopup() {
        createPreviewPopup();

        previewTextarea.value = contentInput.value;

        const length = previewTextarea.value.length;
        const charCount = previewPopup.querySelector('div:last-child');
        charCount.textContent = `字符数: ${length}`;

        const inputRect = contentInput.getBoundingClientRect();
        const dialogRect = tagSelectorDialog.getBoundingClientRect();
        const categoryList = document.querySelector('.category-list');
        const categoryListWidth = categoryList ? categoryList.getBoundingClientRect().width : 140;
        const contentAreaLeft = dialogRect.left + categoryListWidth + 20;
        const contentAreaTop = dialogRect.top + 120;
        const contentAreaWidth = dialogRect.width - categoryListWidth - 40;
        const contentAreaHeight = dialogRect.height - 200;
        const popupWidth = Math.min(contentAreaWidth * 0.8, 600);
        const popupHeight = Math.min(contentAreaHeight * 0.75, 450);
        const left = contentAreaLeft + (contentAreaWidth - popupWidth) / 2;
        const top = contentAreaTop + (contentAreaHeight - popupHeight) / 2;

        previewPopup.style.left = left + 'px';
        previewPopup.style.top = top + 'px';
        previewPopup.style.width = popupWidth + 'px';
        previewPopup.style.height = popupHeight + 'px';
        previewPopup.style.display = 'block';

        disableMainUIInteraction();
        
        setTimeout(() => {
            previewTextarea.focus();
            previewTextarea.setSelectionRange(previewTextarea.value.length, previewTextarea.value.length);
        }, 100);
    }

    function checkContentLength() {
        if (previewPopup && previewPopup.style.display === 'block') {
            return;
        }
        
        const content = contentInput.value;
        const inputWidth = contentInput.offsetWidth;
        const textWidth = getTextWidth(content, contentInput);

        if (textWidth > inputWidth * 0.9 || content.length > 15) {
            showPreviewPopup();
        }
    }

    function getTextWidth(text, element) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const computedStyle = window.getComputedStyle(element);
        context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
        return context.measureText(text).width;
    }

    contentInput.addEventListener('click', () => {
        showPreviewPopup();
    });

    contentInput.addEventListener('focus', () => {
        contentInput.style.borderColor = '#38bdf8';
        contentInput.style.boxShadow = '0 0 0 2px rgba(56, 189, 248, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.2)';
        contentInput.style.background = 'rgba(15, 23, 42, 0.4)';
        contentInput.classList.add('hide-placeholder');
    });

    contentInput.addEventListener('blur', () => {
        contentInput.style.borderColor = 'rgba(59, 130, 246, 0.4)';
        contentInput.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(59, 130, 246, 0.1)';
        contentInput.style.background = 'rgba(15, 23, 42, 0.3)';
        contentInput.classList.remove('hide-placeholder');
    });

    contentInput.addEventListener('dblclick', () => {
        showPreviewPopup();
    });

    contentInputContainer.appendChild(contentLabel);
    contentInputContainer.appendChild(contentInput);

    const previewContainer = document.createElement('div');
    previewContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        flex: none;
        min-width: auto;
    `;

    const previewLabel = document.createElement('label');
    previewLabel.textContent = '预览图';
    previewLabel.style.cssText = `
        color: #ffffff;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        margin: 0;
        padding: 0;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        min-width: 50px;
    `;

    const previewInput = document.createElement('input');
    previewInput.type = 'file';
    previewInput.accept = 'image/*';
    previewInput.style.cssText = `
        display: none;
    `;

    const fileNameDisplay = document.createElement('span');
    fileNameDisplay.textContent = '未加载图片';
    fileNameDisplay.style.cssText = `
        background: rgba(15, 23, 42, 0.3);
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 6px;
        padding: 6px 8px;
        color: #94a3b8;
        font-size: 12px;
        width: 123px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        display: inline-block;
        vertical-align: middle;
        height: 24px;
        line-height: 12px;
        cursor: pointer;
        position: relative;
        left: -15px;
    `;

    const thumbnailWindow = document.createElement('div');
    thumbnailWindow.style.cssText = `
        width: 35px;
        height: 35px;
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        margin-left: -18px;
        flex-shrink: 0;
    `;

    const thumbnailImg = document.createElement('img');
    thumbnailImg.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        object-fit: cover;
        border-radius: 4px;
        display: none;
    `;

    const thumbnailPlaceholder = document.createElement('div');
    thumbnailPlaceholder.style.cssText = `
        width: 100%;
        height: 100%;
        background: #6b7280;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 16px;
        font-weight: bold;
    `;
    thumbnailPlaceholder.innerHTML = '✕';

    thumbnailWindow.appendChild(thumbnailImg);
    thumbnailWindow.appendChild(thumbnailPlaceholder);

   const actionButton = document.createElement('button');
    actionButton.textContent = '加载';
    actionButton.style.cssText = `
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
        border: 1px solid rgba(59, 130, 246, 0.7);
        color: #ffffff;
        padding: 4px 8px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.3s ease;
        height: 26px;
        margin-left: 0px;
        white-space: nowrap;
        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
    `;
    function updateActionButton() {
        if (currentPreviewImage) {            actionButton.textContent = '清除';
            actionButton.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
            actionButton.style.borderColor = 'rgba(220, 38, 38, 0.8)';
        } else {            actionButton.textContent = '加载';
            actionButton.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)';
            actionButton.style.borderColor = 'rgba(59, 130, 246, 0.7)';
        }
    }

    actionButton.addEventListener('mouseenter', () => {
        if (currentPreviewImage) {            actionButton.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
            actionButton.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.4)';
            actionButton.style.borderColor = 'rgba(248, 113, 113, 0.8)';
        } else {
            actionButton.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)';
            actionButton.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)';
            actionButton.style.borderColor = 'rgba(59, 130, 246, 0.5)';
        }
    });

    actionButton.addEventListener('mouseleave', () => {
        if (currentPreviewImage) {
            actionButton.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
            actionButton.style.borderColor = 'rgba(220, 38, 38, 0.8)';
            actionButton.style.boxShadow = 'none';
        } else {
            actionButton.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)';
            actionButton.style.borderColor = 'rgba(59, 130, 246, 0.7)';
            actionButton.style.boxShadow = 'none';
        }
    });

    actionButton.addEventListener('click', () => {
        if (currentPreviewImage) {
            currentPreviewImage = null;
            currentPreviewImageName = null;   
            previewInput.value = '';         
            fileNameDisplay.textContent = '未加载图片';
            fileNameDisplay.style.color = '#94a3b8';         
            thumbnailImg.style.display = 'none';
            thumbnailPlaceholder.style.display = 'flex';
            updateActionButton();
        } else {
            previewInput.click();
        }
    });

    previewInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                currentPreviewImage = event.target.result;
                currentPreviewImageName = file.name;
                fileNameDisplay.textContent = file.name;
                fileNameDisplay.style.color = '#e2e8f0';
                thumbnailImg.src = currentPreviewImage;
                thumbnailImg.style.display = 'block';
                thumbnailPlaceholder.style.display = 'none';
                updateActionButton();
            };
            reader.readAsDataURL(file);
        }
    });

    const previewSeparator = document.createElement('div');
    previewSeparator.style.cssText = `
        width: 1px;
        height: 25px;
        background: linear-gradient(to bottom, transparent, rgb(62, 178, 255), transparent);
        margin: 0 6px;
        flex-shrink: 0;
    `;

    previewContainer.appendChild(previewLabel);
    previewContainer.appendChild(fileNameDisplay);
    previewContainer.appendChild(thumbnailWindow);
    previewContainer.appendChild(actionButton);
    previewContainer.appendChild(previewSeparator);
    previewContainer.appendChild(previewInput);

    const addButton = document.createElement('button');
    addButton.textContent = '保存标签';
    addButton.style.cssText = `
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        border: 1px solid rgba(16, 185, 129, 0.7);
        color: #ffffff;
        padding: 4px 8px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.3s ease;
        height: 26px;
        width: 70px;
        min-width: 70px;
        white-space: nowrap;
        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
        text-align: center;
        margin-left: -28px;
        flex-shrink: 0;
    `;
    addButton.addEventListener('mouseenter', () => {
        addButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        addButton.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)';
        addButton.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        addButton.style.transform = 'none';
    });
    addButton.addEventListener('mouseleave', () => {
        addButton.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
        addButton.style.borderColor = 'rgba(16, 185, 129, 0.7)';
        addButton.style.transform = 'none';
    });

    addButton.onclick = async () => {
        const name = nameInput.value.trim();
        const content = contentInput.value.trim();

        if (!name || !content) {
            alert('请填写完整的名称和标签内容');
            return;
        }

        try {
            const requestData = { name, content };
            
            if (currentPreviewImage) {
                requestData.preview_image = currentPreviewImage;
            }

            const response = await fetch('/zhihui/user_tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (response.ok) {
                nameInput.value = '';
                contentInput.value = '';

                currentPreviewImage = null;
                currentPreviewImageName = null;
                previewInput.value = '';
                
                if (thumbnailImg) {
                    thumbnailImg.style.display = 'none';
                }
                if (thumbnailPlaceholder) {
                    thumbnailPlaceholder.style.display = 'flex';
                }
                if (fileNameDisplay) {
                    fileNameDisplay.textContent = '未加载图片';
                    fileNameDisplay.style.color = '#94a3b8';
                }
                
                updateActionButton();
                
                await loadTagsData();
                
                const activeCategory = tagSelectorDialog.activeCategory;
                
                initializeCategoryList();
                
                if (activeCategory === '自定义') {

                    const categoryItems = tagSelectorDialog.categoryList.querySelectorAll('div');
                    for (let item of categoryItems) {
                        if (item.textContent === '自定义') {
                            item.click();
                            break;
                        }
                    }
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
    inputForm.appendChild(previewContainer);
    inputForm.appendChild(addButton);
    singleLineContainer.appendChild(customTagsTitle);
    singleLineContainer.appendChild(verticalSeparator);
    singleLineContainer.appendChild(inputForm);
    customTagsSection.appendChild(singleLineContainer);

    const rightButtonsSection = document.createElement('div');
    rightButtonsSection.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        margin-left: auto;
        margin-right: 8px;
        flex-shrink: 0;
    `;

    const clearBtn = document.createElement('button');
    clearBtn.innerHTML = '<span style="font-size: 14px; font-weight: 600; display: block;">清空选择</span>';
    clearBtn.style.cssText = `
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        border: 1px solid rgba(220, 38, 38, 0.8);
        color: #ffffff;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
        line-height: 1.2;
        height: 32px;
        width: auto;
        min-width: 70px;
        white-space: nowrap;
        font-size: 14px;
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

    rightPanel.appendChild(subCategoryTabs);
    rightPanel.appendChild(subSubCategoryTabs);
    rightPanel.appendChild(subSubSubCategoryTabs);
    rightPanel.appendChild(tagContent);
    content.appendChild(categoryList);
    content.appendChild(rightPanel);
    dialog.appendChild(header);
    dialog.appendChild(selectedOverview);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    overlay.appendChild(dialog);

    tagSelectorDialog = overlay;
    tagSelectorDialog.categoryList = categoryList;
    tagSelectorDialog.subCategoryTabs = subCategoryTabs;
    tagSelectorDialog.subSubCategoryTabs = subSubCategoryTabs;
    tagSelectorDialog.subSubSubCategoryTabs = subSubSubCategoryTabs;
    tagSelectorDialog.tagContent = tagContent;
    tagSelectorDialog.selectedOverview = selectedOverview;
    tagSelectorDialog.selectedCount = selectedCount;
    tagSelectorDialog.selectedTagsList = selectedTagsList;
    tagSelectorDialog.hintText = hintText;
    tagSelectorDialog.searchInput = searchInput;
    tagSelectorDialog.searchContainer = searchContainer;
    tagSelectorDialog.activeCategory = null;
    tagSelectorDialog.activeSubCategory = null;
    tagSelectorDialog.activeSubSubCategory = null;
    tagSelectorDialog.activeSubSubSubCategory = null;
    tagSelectorDialog.selectedCount = selectedCount;
    tagSelectorDialog.selectedTagsList = selectedTagsList;
    tagSelectorDialog.hintText = hintText;

    initializeCategoryList();

    document.body.appendChild(overlay);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {

            if (previewPopup && previewPopup.style.display === 'block') {
                previewPopup.style.display = 'none';

                enableMainUIInteraction();
                return;
            }

            if (overlay && overlay.style.display === 'block') {
                overlay.style.display = 'none';

                if (tagSelectorDialog && tagSelectorDialog.keydownHandler) {
                    document.removeEventListener('keydown', tagSelectorDialog.keydownHandler);
                }
            }
        }
    };

    document.addEventListener('keydown', handleKeyDown);
    tagSelectorDialog.keydownHandler = handleKeyDown;

    const handleResize = debounce(() => {
        if (tagSelectorDialog && tagSelectorDialog.style.display === 'block') {
            const dialog = tagSelectorDialog.querySelector('div');
            if (dialog) {

                let x = parseInt(dialog.style.left) || 0;
                let y = parseInt(dialog.style.top) || 0;

                const screenPadding = 100;

                if (x + dialog.offsetWidth > window.innerWidth + screenPadding) {
                    dialog.style.left = (window.innerWidth - dialog.offsetWidth + screenPadding) + 'px';
                }

                if (y + dialog.offsetHeight > window.innerHeight + screenPadding) {
                    dialog.style.top = (window.innerHeight - dialog.offsetHeight + screenPadding) + 'px';
                }
            }
        }
    }, 100);

    window.addEventListener('resize', handleResize);
    overlay.onclick = (e) => {
    };
}

function initializeCategoryList() {
    const categoryList = tagSelectorDialog.categoryList;
    categoryList.innerHTML = '';

    Object.keys(tagsData).forEach((category, index) => {
        const categoryItem = document.createElement('div');
        categoryItem.style.cssText = `
            padding: 12px 16px;
            color: #ccc;
            cursor: pointer;
            border-bottom: 1px solid rgb(112, 130, 155);
            transition: all 0.2s;
            text-align: center;
            background: transparent; 
        `;
        categoryItem.textContent = category;
        categoryItem.onmouseenter = () => {
            if (!categoryItem.classList.contains('active')) {
                categoryItem.style.backgroundColor = 'rgb(49, 84, 136)';
                categoryItem.style.color = '#fff';
            }
        };
        categoryItem.onmouseleave = () => {
            if (!categoryItem.classList.contains('active')) {
                categoryItem.style.backgroundColor = 'transparent'; 
                categoryItem.style.boxShadow = 'none';
                categoryItem.style.color = '#ccc';
            }
        };

        categoryItem.onclick = () => {
            categoryList.querySelectorAll('.active').forEach(item => {
                item.classList.remove('active');
                item.style.backgroundColor = 'transparent';
                item.style.color = '#ccc';
                item.style.borderTop = 'none';
                item.style.borderLeft = 'none';
                item.style.borderRight = 'none';
            });

            categoryItem.classList.add('active');
            categoryItem.style.backgroundColor = '#1d4ed8';
            categoryItem.style.color = '#fff';

            tagSelectorDialog.activeCategory = category;
            tagSelectorDialog.activeSubCategory = null;
            tagSelectorDialog.activeSubSubCategory = null;
            tagSelectorDialog.activeSubSubSubCategory = null;

            if (category === '自定义') {
                tagSelectorDialog.querySelector('.custom-tags-section').style.display = 'flex';
            } else {
                tagSelectorDialog.querySelector('.custom-tags-section').style.display = 'none';
            }

            showSubCategories(category);
        };

        categoryList.appendChild(categoryItem);

        if (index === 0) {
            categoryItem.click();
        }
    });
    
    updateCategoryRedDots();
}

function showSubCategories(category) {
    const subCategoryTabs = tagSelectorDialog.subCategoryTabs;
    subCategoryTabs.innerHTML = '';

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
            border-right: 1px solid rgb(112, 130, 155);
            white-space: normal;
            word-break: break-word;
            overflow-wrap: anywhere;
            transition: background-color 0.2s;
            min-width: 80px;
            text-align: center;
        `;
        tab.textContent = subCategory;

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

            subCategoryTabs.querySelectorAll('.active').forEach(item => {
                item.classList.remove('active');
                item.style.backgroundColor = 'transparent';
                item.style.color = '#ccc';
                item.style.borderTop = 'none';
                item.style.borderLeft = 'none';
                item.style.borderBottom = 'none';
                item.style.borderRight = '1px solid rgb(112, 130, 155)';
            });

            tab.classList.add('active');
            tab.style.backgroundColor = '#3b82f6';
            tab.style.color = '#fff';

            tagSelectorDialog.activeSubCategory = subCategory;
            tagSelectorDialog.activeSubSubCategory = null;
            tagSelectorDialog.activeSubSubSubCategory = null;

            const subCategoryData = tagsData[category][subCategory];

            if (category === '自定义') {

                showTags(category, subCategory);
            } else if (Array.isArray(subCategoryData)) {

                showTags(category, subCategory);
            } else {

                showSubSubCategories(category, subCategory);
            }
        };

        subCategoryTabs.appendChild(tab);

        if (index === 0) {
            tab.click();
        }
    });
    
    updateCategoryRedDots();
}

function showSubSubCategories(category, subCategory) {
    const subSubCategoryTabs = tagSelectorDialog.subSubCategoryTabs;
    subSubCategoryTabs.innerHTML = '';
    subSubCategoryTabs.style.display = 'flex';

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
            border-right: 1px solid rgb(112, 130, 155);
            white-space: normal;    
            word-break: break-word;
            overflow-wrap: anywhere;
            transition: background-color 0.2s;
            min-width: 60px;
            text-align: center;
            font-size: 13px;
        `;
        tab.textContent = subSubCategory;

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

            subSubCategoryTabs.querySelectorAll('.active').forEach(item => {
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

            tagSelectorDialog.activeSubSubCategory = subSubCategory;
            tagSelectorDialog.activeSubSubSubCategory = null;

            const subSubCategoryData = tagsData[category][subCategory][subSubCategory];
            if (Array.isArray(subSubCategoryData)) {

                if (tagSelectorDialog.subSubSubCategoryTabs) {
                    tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
                    tagSelectorDialog.subSubSubCategoryTabs.innerHTML = '';
                }
                showTagsFromSubSub(category, subCategory, subSubCategory);
            } else {

                showSubSubSubCategories(category, subCategory, subSubCategory);
            }
        };

        subSubCategoryTabs.appendChild(tab);

        if (index === 0) {
            tab.click();
        }
    });
    
    updateCategoryRedDots();
}

function showSubSubSubCategories(category, subCategory, subSubCategory) {
    const el = tagSelectorDialog.subSubSubCategoryTabs;
    if (!el) return;

    el.innerHTML = '';
    el.style.display = 'flex';

    const map = tagsData?.[category]?.[subCategory]?.[subSubCategory];
    if (!map) {
        el.style.display = 'none';
        return;
    }

    if (Array.isArray(map)) {
        el.style.display = 'none';
        showTagsFromSubSub(category, subCategory, subSubCategory);
        return;
    }

    Object.keys(map).forEach((name, index) => {
        const tab = document.createElement('div');
        tab.style.cssText = `
            padding: 6px 10px;
            color: #ccc;
            cursor: pointer;
            border-right: 1px solid rgb(112, 130, 155);
            white-space: normal;
            word-break: break-word;
            overflow-wrap: anywhere;
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

            tagSelectorDialog.activeSubSubSubCategory = name;

            showTagsFromSubSubSub(category, subCategory, subSubCategory, name);
        };

        el.appendChild(tab);
        if (index === 0) tab.click();
    });
    
    updateCategoryRedDots();
}

function createTagContainer() {
    const tagContainer = document.createElement('div');

    applyStyles(tagContainer, {
        display: 'inline-block',
        position: 'relative',
        margin: '4px',
        maxWidth: '320px'
    });
    return tagContainer;
}

function createTagElement(display, value, isSelected) {
    const tagElement = document.createElement('span');

    applyStyles(tagElement, {
        ...commonStyles.tag.base,
        padding: '6px 12px',
        borderRadius: '16px',
        fontSize: '14px',
        position: 'relative',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        maxWidth: '100%'
    });

    tagElement.textContent = display;
    tagElement.dataset.value = value;

    if (isSelected) {
        tagElement.style.backgroundColor = '#22c55e';
        tagElement.style.color = '#fff';
    }

    return tagElement;
}

function createTooltip(text) {
    const tooltip = document.createElement('div');

    applyStyles(tooltip, {
        ...commonStyles.tooltip.base,
        padding: '8px 12px',
        fontSize: '12px',
        whiteSpace: 'pre-wrap',
        zIndex: '10000',
        pointerEvents: 'none',
        opacity: '0',
        transform: 'translateY(-100%) translateY(-8px)',
        maxWidth: '300px',
        wordWrap: 'break-word',
        lineHeight: '1.4'
    });
    tooltip.textContent = text;
    return tooltip;
}

function createCustomTagTooltip(tagValue, tagName) {
    const tooltip = document.createElement('div');
    
    applyStyles(tooltip, {
        ...commonStyles.tooltip.base,
        padding: '12px',
        fontSize: '12px',
        zIndex: '10000',
        pointerEvents: 'none',
        opacity: '0',
        transform: 'translateY(-100%) translateY(-8px)',
        minWidth: '250px',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: '15px'
    });
    
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
        flex: 1;
        text-align: left;
        word-wrap: break-word;
        max-width: 250px;
    `;

    contentDiv.textContent = tagValue;
    tooltip.appendChild(contentDiv);
    
    const previewDiv = document.createElement('div');
    previewDiv.style.cssText = `
        border-radius: 6px;
        overflow: hidden;
        flex-shrink: 0;
        border: 1px solid rgba(59, 130, 246, 0.5);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 50px;
        min-height: 50px;
    `;
    
    const previewImg = document.createElement('img');
    previewImg.style.cssText = `
        object-fit: contain;
        background-color: #000;
        display: block;
        border-radius: 4px;
        max-width: 300px;
        max-height: 200px;
    `;

    previewImg.src = `/zhihui/user_tags/preview/${encodeURIComponent(tagName)}`;
    previewImg.alt = tagName;
    previewImg.onerror = () => {
        previewImg.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.style.cssText = `
            width: 100%;
            height: 100%;
            background: #666;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ccc;
            font-size: 12px;
        `;
        placeholder.textContent = '无预览';
        previewDiv.appendChild(placeholder);
    };
    
    previewDiv.appendChild(previewImg);
    tooltip.appendChild(previewDiv);
  
    return tooltip;
}

function showTags(category, subCategory) {

    const subSubCategoryTabs = tagSelectorDialog.subSubCategoryTabs;
    subSubCategoryTabs.style.display = 'none';

    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
        tagSelectorDialog.subSubSubCategoryTabs.innerHTML = '';
    }

    const tagContent = tagSelectorDialog.tagContent;
    tagContent.innerHTML = '';

    const tags = tagsData[category][subCategory];
    const isCustomCategory = category === '自定义';

    let actualTags = tags;
    if (isCustomCategory && tags && tags['我的标签']) {
        actualTags = tags['我的标签'];
    }

    if (isCustomCategory && (!actualTags || actualTags.length === 0)) {
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

    let tagEntries;
    if (Array.isArray(actualTags)) {
        tagEntries = actualTags.map(tagObj => [tagObj.display, tagObj.value]);
    } else {
        tagEntries = Object.entries(actualTags);
    }

    tagEntries.forEach(([display, value]) => {
        const tagContainer = createTagContainer();
        const isSelected = isTagSelected(value);
        const tagElement = createTagElement(display, value, isSelected);

        let tooltip = null;

        tagElement.onmouseenter = (e) => {
            if (!isSelected) {
                tagElement.style.backgroundColor = 'rgb(49, 84, 136)';
                tagElement.style.color = '#fff';
            }
            if (tooltip && tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
                tooltip = null;
            }
            
            if (isCustomCategory) {
                tooltip = createCustomTagTooltip(value, display);
            } else {
                tooltip = createTooltip(value);
            }
            
            document.body.appendChild(tooltip);
            const rect = tagElement.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top + 'px';
            setTimeout(() => { if (tooltip) tooltip.style.opacity = '1'; }, 10);
        };

        tagElement.onmouseleave = () => {
            const currentlySelected = isTagSelected(value);
            if (!currentlySelected) {
                tagElement.style.backgroundColor = '#444';
                tagElement.style.color = '#ccc';
                tagElement.style.boxShadow = 'none';
            } else {
                tagElement.style.backgroundColor = '#22c55e';
                tagElement.style.color = '#fff';
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

        if (isCustomCategory) {
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '×';
            deleteBtn.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
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

            const deleteBtnNormalStyle = {
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                transform: 'scale(1)',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
            };
            
            const deleteBtnHoverStyle = {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                transform: 'scale(1.1)',
                boxShadow: '0 4px 8px rgba(239, 68, 68, 0.5)'
            };
            
            setupButtonHoverEffect(deleteBtn, deleteBtnNormalStyle, deleteBtnHoverStyle);

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
                            if (isTagSelected(value)) {
                                selectedTags.delete(value);
                                updateSelectedTagsOverview();
                            }

                            await loadTagsData();
                            
                            const activeCategory = tagSelectorDialog.activeCategory;
                            
                            initializeCategoryList();
                            
                            if (activeCategory === '自定义') {

                                const categoryItems = tagSelectorDialog.categoryList.querySelectorAll('div');
                                for (let item of categoryItems) {
                                    if (item.textContent === '自定义') {
                                        item.click();
                                        break;
                                    }
                                }
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

function showTagsFromSubSub(category, subCategory, subSubCategory) {
    if (tagSelectorDialog.subSubSubCategoryTabs) {
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
            color: '#ccc';
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
            position: relative;
        `;

        tagElement.textContent = tagObj.display;
        tagElement.dataset.value = tagObj.value;

        if (isTagSelected(tagObj.value)) {
            tagElement.style.backgroundColor = '#22c55e';
            tagElement.style.color = '#fff';
        }

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
            const currentlySelected = isTagSelected(tagObj.value);
            if (!currentlySelected) {
                tagElement.style.backgroundColor = '#444';
                tagElement.style.color = '#ccc';
            } else {
                tagElement.style.backgroundColor = '#22c55e';
                tagElement.style.color = '#fff';
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
            color: '#ccc';
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
            position: relative;
        `;

        tagElement.textContent = tagObj.display;
        tagElement.dataset.value = tagObj.value;

        if (isTagSelected(tagObj.value)) {
            tagElement.style.backgroundColor = '#22c55e';
            tagElement.style.color = '#fff';
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
            const currentlySelected = isTagSelected(tagObj.value);
            if (!currentlySelected) {
                tagElement.style.backgroundColor = '#444';
                tagElement.style.color = '#ccc';
            } else {
                tagElement.style.backgroundColor = '#22c55e';
                tagElement.style.color = '#fff';
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

let selectedTags = new Set();

function categoryHasSelectedTags(category, subCategory = null, subSubCategory = null, subSubSubCategory = null) {
    if (!tagsData || !tagsData[category]) return false;
    
    const checkTagsInObject = (obj) => {
        if (Array.isArray(obj)) {
            return obj.some(tag => {
                const tagValue = typeof tag === 'object' ? tag.value : tag;
                return selectedTags.has(tagValue);
            });
        }
        
        if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'string') {
                    if (selectedTags.has(value)) {
                        return true;
                    }
                } else if (typeof value === 'object') {
                    if (checkTagsInObject(value)) {
                        return true;
                    }
                }
            }
            return false;
        }
        
        if (typeof obj === 'string') {
            return selectedTags.has(obj);
        }
        
        return false;
    };
    
    let targetData = tagsData[category];
    
    if (subCategory && targetData[subCategory]) {
        targetData = targetData[subCategory];
        
        if (subSubCategory && targetData[subSubCategory]) {
            targetData = targetData[subSubCategory];
            
            if (subSubSubCategory && targetData[subSubSubCategory]) {
                targetData = targetData[subSubSubCategory];
            }
        }
    }
    
    return checkTagsInObject(targetData);
}

function createRedDotIndicator() {
    const redDot = document.createElement('div');
    redDot.className = 'red-dot-indicator';
    redDot.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        width: 8px;
        height: 8px;
        background: #22c55e;
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(34, 197, 94, 0.6);
        z-index: 10;
        display: none;
    `;
    return redDot;
}

function clearAllRedDots() {
    if (!tagSelectorDialog) return;
    
    const allRedDots = tagSelectorDialog.querySelectorAll('.red-dot-indicator');
    allRedDots.forEach(dot => dot.remove());
}

function updateCategoryRedDots() {
    if (!tagSelectorDialog || !tagsData) return;
    
    clearAllRedDots();
    
    const categoryList = tagSelectorDialog.categoryList;
    if (categoryList) {
        const categoryItems = categoryList.querySelectorAll('div');
        categoryItems.forEach((item, index) => {
            const category = Object.keys(tagsData)[index];
            if (category) {
                if (categoryHasSelectedTags(category)) {
                    const redDot = createRedDotIndicator();
                    item.style.position = 'relative';
                    item.appendChild(redDot);
                    redDot.style.display = 'block';
                }
            }
        });
    }
    
    const subCategoryTabs = tagSelectorDialog.subCategoryTabs;
    if (subCategoryTabs && tagSelectorDialog.activeCategory) {
        const subCategoryItems = subCategoryTabs.querySelectorAll('div');
        subCategoryItems.forEach(item => {
            const subCategory = item.textContent;
            if (categoryHasSelectedTags(tagSelectorDialog.activeCategory, subCategory)) {
                const redDot = createRedDotIndicator();
                item.style.position = 'relative';
                item.appendChild(redDot);
                redDot.style.display = 'block';
            }
        });
    }
    
    const subSubCategoryTabs = tagSelectorDialog.subSubCategoryTabs;
    if (subSubCategoryTabs && tagSelectorDialog.activeCategory && tagSelectorDialog.activeSubCategory) {
        const subSubCategoryItems = subSubCategoryTabs.querySelectorAll('div');
        subSubCategoryItems.forEach(item => {
            const subSubCategory = item.textContent;
            if (categoryHasSelectedTags(tagSelectorDialog.activeCategory, tagSelectorDialog.activeSubCategory, subSubCategory)) {
                const redDot = createRedDotIndicator();
                item.style.position = 'relative';
                item.appendChild(redDot);
                redDot.style.display = 'block';
            }
        });
    }
    
    const subSubSubCategoryTabs = tagSelectorDialog.subSubSubCategoryTabs;
    if (subSubSubCategoryTabs && tagSelectorDialog.activeCategory && tagSelectorDialog.activeSubCategory && tagSelectorDialog.activeSubSubCategory) {
        const subSubSubCategoryItems = subSubSubCategoryTabs.querySelectorAll('div');
        subSubSubCategoryItems.forEach(item => {
            const subSubSubCategory = item.textContent;
            if (categoryHasSelectedTags(tagSelectorDialog.activeCategory, tagSelectorDialog.activeSubCategory, tagSelectorDialog.activeSubSubCategory, subSubSubCategory)) {
                const redDot = createRedDotIndicator();
                item.style.position = 'relative';
                item.appendChild(redDot);
                redDot.style.display = 'block';
            }
        });
    }
}

function toggleTag(tag, element) {
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        element.style.backgroundColor = '#444';
        element.style.color = '#ccc';
    } else {
        selectedTags.add(tag);
        element.style.backgroundColor = '#22c55e';
        element.style.color = '#fff';
    }

    updateSelectedTags();
    updateCategoryRedDots();
}

function isTagSelected(tag) {
    return selectedTags.has(tag);
}

function updateSelectedTags() {
    if (currentNode) {
        const tagEditWidget = currentNode.widgets.find(w => w.name === 'tag_edit');
        if (tagEditWidget) {
            const tagsArray = Array.from(selectedTags);
            const displayValue = tagsArray.join(', ');
            const storageValue = tagsArray.join('|||');          
            tagEditWidget.value = displayValue;
            tagEditWidget._internalValue = storageValue;
            if (tagEditWidget.callback) {
                tagEditWidget.callback(tagEditWidget.value);
            }
        }
    }
    updateSelectedTagsOverview();
}

function updateSelectedTagsOverview() {
    if (!tagSelectorDialog) return;

    const selectedCount = tagSelectorDialog.selectedCount;
    const selectedTagsList = tagSelectorDialog.selectedTagsList;
    const selectedOverview = tagSelectorDialog.selectedOverview;
    const hintText = tagSelectorDialog.hintText;

    selectedCount.textContent = selectedTags.size;
    selectedTagsList.innerHTML = '';

    if (selectedTags.size > 0) {

        hintText.style.display = 'none';
        selectedCount.style.display = 'inline-block';
        selectedTagsList.style.display = 'flex';

        selectedTags.forEach(tag => {
            const tagContainer = document.createElement('div');
            tagContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                margin: 0 4px;
                background: transparent;
            `;

            const tagElement = document.createElement('span');
            tagElement.style.cssText = `
                background: linear-gradient(135deg, #4a9eff 0%, #1e88e5 100%);
                color: #fff;
                padding: 3px 8px;
                border-radius: 6px;
                font-size: 14px;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                cursor: pointer;
                width: 100%;
                justify-content: space-between;
                margin: 0 0 2px 0;
                box-shadow: 0 2px 4px rgba(74, 158, 255, 0.4), 0 1px 2px rgba(74, 158, 255, 0.2);
                border: 1px solid rgba(30, 136, 229, 0.8);
                transition: all 0.3s ease;
            `;

            const tagText = document.createElement('span');
            tagText.textContent = tag;

            const removeBtn = document.createElement('span');
            removeBtn.textContent = '×';
            removeBtn.style.cssText = `
                font-size: 8px;
                font-family: 'SimHei', '黑体', sans-serif;
                font-weight: bold;
                cursor: pointer;
                opacity: 0.8;
                background-color: #3b7ddd;
                color: white;
                border-radius: 50%;
                width: 14px;
                height: 14px;
                min-width: 14px;
                min-height: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
                line-height: 1;
                text-align: center;
                padding: 0;
                margin: 0;
                transform: translate(0, 0);
                flex-shrink: 0;
                box-sizing: border-box;
            `;
            
            removeBtn.onmouseenter = () => {
                removeBtn.style.backgroundColor = '#ff4444';
            };
            
            removeBtn.onmouseleave = () => {
                removeBtn.style.backgroundColor = '#3b7ddd';
            };
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                removeSelectedTag(tag);
            };

            tagElement.appendChild(tagText);
            tagElement.appendChild(removeBtn);
            
            const chineseNameElement = document.createElement('span');
            chineseNameElement.style.cssText = `
                font-size: 10px;
                color: #22c55e;
                text-align: center;
                white-space: normal;
                word-break: break-word;
                overflow-wrap: anywhere;
                border: 1px solid #22c55e;
                width: 100%;
                max-height: 64px;
                overflow-y: auto;
                box-sizing: border-box;
                border-radius: 4px;
                padding: 0px 4px;
            `;
            
            let chineseName = tag;
            if (tagsData) {
                const findChineseName = (node) => {
                    if (Array.isArray(node)) {
                        for (let t of node) {
                            if (t.value === tag && t.display) {
                                return t.display;
                            }
                        }
                    } else if (node && typeof node === 'object') {
                        for (let [key, value] of Object.entries(node)) {
                            const result = findChineseName(value);
                            if (result) return result;
                        }
                    }
                    return null;
                };
                
                for (let [category, subCategories] of Object.entries(tagsData)) {
                    const result = findChineseName(subCategories);
                    if (result) {
                        chineseName = result;
                        break;
                    }
                }
            }
            
            chineseNameElement.textContent = chineseName;
            
            tagContainer.appendChild(tagElement);
            tagContainer.appendChild(chineseNameElement);
            selectedTagsList.appendChild(tagContainer);
        });
    } else {

        hintText.style.display = 'inline-block';
        selectedCount.style.display = 'none';
        selectedTagsList.style.display = 'none';
    }
}

function removeSelectedTag(tag) {
    selectedTags.delete(tag);

    const tagElements = tagSelectorDialog.tagContent.querySelectorAll('span');
    tagElements.forEach(element => {
        if (element.textContent === tag) {
            element.style.backgroundColor = '#444';
            element.style.color = '#ccc';
        }
    });

    updateSelectedTags();
    updateSelectedTagsOverview();
    updateCategoryRedDots();
}

function loadExistingTags() {
    selectedTags.clear();
    if (currentNode) {
        const tagEditWidget = currentNode.widgets.find(w => w.name === 'tag_edit');
        if (tagEditWidget && (tagEditWidget.value || tagEditWidget._internalValue)) {
            if (tagEditWidget._internalValue) {
                const currentTags = tagEditWidget._internalValue.split('|||').filter(t => t.trim());
                currentTags.forEach(tag => selectedTags.add(tag.trim()));
            } else if (tagEditWidget.value) {
                try {
                    const tagsArray = JSON.parse(tagEditWidget.value);
                    if (Array.isArray(tagsArray)) {
                        tagsArray.forEach(tag => {
                            if (tag && typeof tag === 'string') {
                                selectedTags.add(tag);
                            }
                        });
                    } else {
                        throw new Error('Not an array');
                    }
                } catch (e) {
                    const currentTags = tagEditWidget.value.split(',').map(t => t.trim()).filter(t => t);
                    currentTags.forEach(tag => selectedTags.add(tag));
                }
            }
        }
    }

    updateSelectedTagsOverview();
    updateCategoryRedDots();
}

function clearSelectedTags() {
    selectedTags.clear();

    const tagElements = tagSelectorDialog.tagContent.querySelectorAll('span');
    tagElements.forEach(element => {
        element.style.backgroundColor = '#444';
        element.style.color = '#ccc';
    });

    updateSelectedTags();
    updateSelectedTagsOverview();
    updateCategoryRedDots();
}

function applySelectedTags() {
    updateSelectedTags();

    if (tagSelectorDialog) {
        tagSelectorDialog.style.display = 'none';

        if (tagSelectorDialog.keydownHandler) {
            document.removeEventListener('keydown', tagSelectorDialog.keydownHandler);
        }
    }
}

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
                if (c.includes(q) || fuzzyMatch(c, q)) {
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

function fuzzyMatch(str, query) {
    if (!query) return true;
    if (!str) return false;   
    let queryIndex = 0;
    for (let i = 0; i < str.length && queryIndex < query.length; i++) {
        if (str[i] === query[queryIndex]) {
            queryIndex++;
        }
    }
    
    return queryIndex === query.length;
}

function showSearchResults(results, q) {
    const container = tagSelectorDialog.tagContent;
    container.innerHTML = '';

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
            font-size: 14px;
            position: relative;
        `;

        tagElement.textContent = tagObj.display;
        tagElement.dataset.value = tagObj.value;
        if (isTagSelected(tagObj.value)) {
            tagElement.style.backgroundColor = '#22c55e';
            tagElement.style.color = '#fff';
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
            const currentlySelected = isTagSelected(tagObj.value);
            if (!currentlySelected) {
                tagElement.style.backgroundColor = '#444';
                tagElement.style.color = '#ccc';
            } else {
                tagElement.style.backgroundColor = '#22c55e';
                tagElement.style.color = '#fff';
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

function disableMainUIInteraction() {
    const existingOverlay = document.getElementById('ui-disable-overlay');
    if (existingOverlay) {
    }

    const overlay = document.createElement('div');
    overlay.id = 'ui-disable-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        z-index: 10001;
        pointer-events: auto;
    `;

    document.body.appendChild(overlay);

    if (previewPopup) {
        previewPopup.style.zIndex = '10002';
    }
    
    if (contentInput) {
        contentInput.disabled = true;
        contentInput.style.opacity = '0.5';
        contentInput.style.cursor = 'not-allowed';
    }
}

function enableMainUIInteraction() {

    const overlay = document.getElementById('ui-disable-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    if (contentInput) {
        contentInput.disabled = false;
        contentInput.style.opacity = '1';
        contentInput.style.cursor = 'text';
    }
}