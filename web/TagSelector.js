import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

app.registerExtension({
    name: "zhihui.TagSelector",
    nodeCreated(node) {
        if (node.comfyClass === "TagSelector") {
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
            const values = Object.values(node);
            const allString = values.every(v => typeof v === 'string');
            if (allString) {
                if (isCustomCategory) {
                    return node;
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
    `;

    const dialog = document.createElement('div');
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    const dialogHeight = Math.min(screenHeight * 0.8, 720);
    const dialogWidth = dialogHeight * (16 / 9);
    const finalWidth = Math.min(dialogWidth, screenWidth * 0.9);
    const finalHeight = finalWidth * (9 / 16);
    const left = (screenWidth - finalWidth) / 2;
    const top = (screenHeight - finalHeight) / 2;

    dialog.style.cssText = `
        position: fixed;
        top: ${top}px;
        left: ${left}px;
        width: ${finalWidth}px;
        height: ${finalHeight}px;
        min-width: 600px;
        min-height: 400px;
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

    const header = document.createElement('div');
    header.style.cssText = `
        background:rgb(34, 77, 141);
        padding: 5px 24px;
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
        border: 1px solid #dc2626;
        color: #ffffff;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        padding: 0;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s ease;
        line-height: 22px;
        vertical-align: middle;
        position: relative;
        top: 0;
        margin: 4px 8px 4px 0;
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
        margin-left: auto;
        margin-right: 80px;
    `;

    const closeButtonContainer = document.createElement('div');
    closeButtonContainer.style.cssText = `
        display: flex;
        align-items: center;
        margin-right: 0px;
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
    clearSearchBtn.style.cssText = `
        background: rgba(239, 68, 68, 0.15);
        color: #fecaca;
        border: 1px solid rgba(239, 68, 68, 0.35);
        width: auto;
        height: 20px;
        border-radius: 4px;
        cursor: pointer;
        display: none;
        padding: 0 8px;
        align-items: center;
        justify-content: center;
        line-height: 1;
        font-weight: 500;
        font-size: 11px;
        transition: all 0.2s ease;
        white-space: nowrap;
    `;

    clearSearchBtn.addEventListener('mouseenter', () => {
        clearSearchBtn.style.background = 'rgba(239, 68, 68, 0.25)';
        clearSearchBtn.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        clearSearchBtn.style.color = '#ffb4b4';
        clearSearchBtn.style.transform = 'translateY(-1px)';
    });

    clearSearchBtn.addEventListener('mouseleave', () => {
        clearSearchBtn.style.background = 'rgba(239, 68, 68, 0.15)';
        clearSearchBtn.style.borderColor = 'rgba(239, 68, 68, 0.35)';
        clearSearchBtn.style.color = '#fecaca';
        clearSearchBtn.style.transform = 'translateY(0)';
    });

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
        background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
        border-right: 1px solid rgba(71, 85, 105, 0.8);
        overflow-y: auto;
        backdrop-filter: blur(10px);
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
        border-bottom: 1px solid rgba(71, 85, 105, 0.8);
        display: flex;
        overflow-x: auto;
        min-height: 30px;
        backdrop-filter: blur(10px);
    `;

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
        padding: 8px 12px;
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
        white-space: nowrap;
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
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
        flex: 1;
    `;

    const nameInputContainer = document.createElement('div');
    nameInputContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 1px;
        flex: 0.45;
        min-width: 140px;
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
        gap: 1px;
        flex: 0.8;
        min-width: 140px;
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
        title.textContent = '标签内容预览';
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
        const content = contentInput.value;
        const inputWidth = contentInput.offsetWidth;
        const textWidth = getTextWidth(content, contentInput);

        if (textWidth > inputWidth * 0.8 && content.length > 20) {
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

    contentInput.addEventListener('focus', () => {
        contentInput.style.borderColor = '#38bdf8';
        contentInput.style.boxShadow = '0 0 0 2px rgba(56, 189, 248, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.2)';
        contentInput.style.background = 'rgba(15, 23, 42, 0.4)';
        contentInput.classList.add('hide-placeholder');
        setTimeout(checkContentLength, 100);
    });

    contentInput.addEventListener('blur', () => {
        contentInput.style.borderColor = 'rgba(59, 130, 246, 0.4)';
        contentInput.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(59, 130, 246, 0.1)';
        contentInput.style.background = 'rgba(15, 23, 42, 0.3)';
        contentInput.classList.remove('hide-placeholder');
    });

    contentInput.addEventListener('input', () => {
        checkContentLength();
    });

    contentInput.addEventListener('dblclick', () => {
        showPreviewPopup();
    });

    contentInputContainer.appendChild(contentLabel);
    contentInputContainer.appendChild(contentInput);

    const addButton = document.createElement('button');
    addButton.textContent = '添加';
    addButton.style.cssText = `
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
                nameInput.value = '';
                contentInput.value = '';
                await loadTagsData();
                initializeCategoryList();

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

    const resizeHandle = document.createElement('div');
    resizeHandle.style.cssText = `
        position: absolute;
        bottom: 4px;
        right: 4px;
        width: 10px;
        height: 10px;
        background: linear-gradient(-45deg, transparent 0%, transparent 25%, rgba(59, 130, 246, 0.9) 25%, rgba(59, 130, 246, 0.9) 35%, transparent 35%, transparent 50%, rgba(59, 130, 246, 0.9) 50%, rgba(59, 130, 246, 0.9) 60%, transparent 60%, transparent 75%, rgba(59, 130, 246, 0.9) 75%, rgba(59, 130, 246, 0.9) 85%, transparent 85%);
        cursor: se-resize;
        z-index: 10002;
        border-radius: 0 0 8px 0;
        opacity: 0.8;
        transition: opacity 0.2s ease;
    `;
    resizeHandle.addEventListener('mouseenter', () => {
        resizeHandle.style.opacity = '1';
    });
    resizeHandle.addEventListener('mouseleave', () => {
        resizeHandle.style.opacity = '0.7';
    });

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
    dialog.appendChild(resizeHandle);
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

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dialogStartX = 0;
    let dialogStartY = 0;

    header.addEventListener('mousedown', (e) => {
        if (e.target === closeBtn) return;
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        const rect = dialog.getBoundingClientRect();
        dialogStartX = rect.left;
        dialogStartY = rect.top;

        document.body.style.cursor = 'move';
        document.body.style.userSelect = 'none';

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
        if (isDragging) {
            isDragging = false;

            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
        if (isResizing) {
            isResizing = false;

            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });

    let isResizing = false;
    let resizeStartX = 0;
    let resizeStartY = 0;
    let dialogStartWidth = 0;
    let dialogStartHeight = 0;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;

        if (dialog.style.transform && dialog.style.transform !== 'none') {
            const rect = dialog.getBoundingClientRect();
            dialog.style.left = rect.left + 'px';
            dialog.style.top = rect.top + 'px';
            dialog.style.transform = 'none';
        }

        dialogStartWidth = dialog.offsetWidth;
        dialogStartHeight = dialog.offsetHeight;

        document.body.style.cursor = 'se-resize';
        document.body.style.userSelect = 'none';

        e.preventDefault();
        e.stopPropagation();
    });

    const handleMouseMove = (e) => {
        if (isResizing) {
            const deltaX = e.clientX - resizeStartX;
            const deltaY = e.clientY - resizeStartY;
            const newWidth = Math.max(600, dialogStartWidth + deltaX);
            const newHeight = Math.max(400, dialogStartHeight + deltaY);
            const screenPadding = 50;
            const maxWidth = window.innerWidth + screenPadding;
            const maxHeight = window.innerHeight + screenPadding;
            const finalWidth = Math.min(newWidth, maxWidth);
            const finalHeight = Math.min(newHeight, maxHeight);

            dialog.style.width = finalWidth + 'px';
            dialog.style.height = finalHeight + 'px';

            e.preventDefault();
            e.stopPropagation();
        }
    };

    document.addEventListener('mousemove', handleMouseMove);

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
            border-bottom: 1px solid rgba(71, 85, 105, 0.8);
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
            border-right: 1px solid rgba(71, 85, 105, 0.8);
            white-space: nowrap;
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

                item.style.borderRight = '1px solid rgba(71, 85, 105, 0.8)';
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
            border-right: 1px solid rgba(71, 85, 105, 0.8);
            white-space: nowrap;
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

            tagSelectorDialog.activeSubSubSubCategory = name;

            showTagsFromSubSubSub(category, subCategory, subSubCategory, name);
        };

        el.appendChild(tab);
        if (index === 0) tab.click();
    });
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

    let tagEntries;
    if (isCustomCategory) {

        tagEntries = Object.entries(tags);
    } else if (Array.isArray(tags)) {

        tagEntries = tags.map(tagObj => [tagObj.display, tagObj.value]);
    } else {

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

        tagElement.textContent = display;
        tagElement.dataset.value = value;

        if (isTagSelected(value)) {
            tagElement.style.backgroundColor = '#22c55e';
            tagElement.style.color = '#fff';
            tagElement.style.borderColor = '#22c55e';
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
                            if (isTagSelected(value)) {
                                selectedTags.delete(value);
                                updateSelectedTagsOverview();
                            }

                            await loadTagsData();
                            initializeCategoryList();

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

let selectedTags = new Set();

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

function isTagSelected(tag) {
    return selectedTags.has(tag);
}

function updateSelectedTags() {
    if (currentNode) {
        const tagEditWidget = currentNode.widgets.find(w => w.name === 'tag_edit');
        if (tagEditWidget) {
            tagEditWidget.value = Array.from(selectedTags).join(', ');

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
            element.style.borderColor = '#555';
        }
    });

    updateSelectedTags();
    updateSelectedTagsOverview();
}

function loadExistingTags() {
    selectedTags.clear();
    if (currentNode) {
        const tagEditWidget = currentNode.widgets.find(w => w.name === 'tag_edit');
        if (tagEditWidget && tagEditWidget.value) {
            const currentTags = tagEditWidget.value.split(',').map(t => t.trim()).filter(t => t);
            currentTags.forEach(tag => selectedTags.add(tag));
        }
    }

    updateSelectedTagsOverview();
}

function clearSelectedTags() {
    selectedTags.clear();

    const tagElements = tagSelectorDialog.tagContent.querySelectorAll('span');
    tagElements.forEach(element => {
        element.style.backgroundColor = '#444';
        element.style.color = '#ccc';
        element.style.borderColor = '#555';
    });

    updateSelectedTags();
    updateSelectedTagsOverview();
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

function disableMainUIInteraction() {

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
}

function enableMainUIInteraction() {

    const overlay = document.getElementById('ui-disable-overlay');
    if (overlay) {
        overlay.remove();
    }
}