import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";

let translationsData = null;
let currentLocale = 'zh';
let localeChangeListeners = [];

const i18n = {
    zh: {
        selectPreset: "选择系统提示词预设...",
        searchPlaceholder: "搜索预设...",
        noResults: "无匹配结果",
        previewTitle: "预设预览",
        noPresetSelected: "未选择预设",
        loading: "加载中...",
        loadFailed: "加载失败",
        categories: "分类",
        presets: "个预设",
        closeMenu: "关闭菜单",
        noContent: "暂无内容"
    },
    en: {
        selectPreset: "Select system prompt preset...",
        searchPlaceholder: "Search presets...",
        noResults: "No matching results",
        previewTitle: "Preset Preview",
        noPresetSelected: "No preset selected",
        loading: "Loading...",
        loadFailed: "Load failed",
        categories: "Categories",
        presets: "presets",
        closeMenu: "Close menu",
        noContent: "No content"
    }
};

function getLocale() {
    const comfyLocale = app?.ui?.settings?.getSettingValue?.('Comfy.Locale');
    return comfyLocale === 'zh-CN' || comfyLocale === 'zh' ? 'zh' : 'en';
}

function $t(key) {
    const locale = getLocale();
    return i18n[locale]?.[key] || i18n['en']?.[key] || key;
}

async function loadTranslations() {
    if (translationsData) return translationsData;
    try {
        const response = await api.fetchApi("/zhihui/system_prompt/translations");
        translationsData = await response.json();
        return translationsData;
    } catch (e) {
        console.error("Failed to load SystemPrompt translations:", e);
        return { folders: {}, files: {} };
    }
}

function translatePath(path, translations) {
    if (!translations || !path) return path;
    const locale = getLocale();
    if (locale === 'zh') return path;
    const parts = path.split('/');
    if (parts.length === 1) {
        const fileName = parts[0];
        for (const folderName in translations.files) {
            if (translations.files[folderName] && translations.files[folderName][fileName]) {
                return translations.files[folderName][fileName].en || fileName;
            }
        }
        return fileName;
    }
    const folderName = parts[0];
    const fileName = parts[1];
    let translatedFolder = folderName;
    if (translations.folders && translations.folders[folderName]) {
        translatedFolder = translations.folders[folderName].en || folderName;
    }
    let translatedFile = fileName;
    if (translations.files && translations.files[folderName] && translations.files[folderName][fileName]) {
        translatedFile = translations.files[folderName][fileName].en || fileName;
    }
    return `${translatedFolder}/${translatedFile}`;
}

function translateCategory(category, translations) {
    if (!translations || !category || category === '__root__') return category;
    const locale = getLocale();
    if (locale === 'zh') return category;
    if (translations.folders && translations.folders[category]) {
        return translations.folders[category].en || category;
    }
    return category;
}

function translatePresetName(fullPath, translations) {
    if (!translations || !fullPath) return fullPath;
    const locale = getLocale();
    if (locale === 'zh') return fullPath.split('/').pop();
    const parts = fullPath.split('/');
    if (parts.length === 1) {
        const fileName = parts[0];
        for (const folderName in translations.files) {
            if (translations.files[folderName] && translations.files[folderName][fileName]) {
                return translations.files[folderName][fileName].en || fileName;
            }
        }
        return fileName;
    }
    const folderName = parts[0];
    const fileName = parts.slice(1).join('/');
    if (translations.files && translations.files[folderName] && translations.files[folderName][fileName]) {
        return translations.files[folderName][fileName].en || fileName;
    }
    return fileName;
}

function updateWidgetLabels(widget, translations) {
    if (!widget || !widget.options || !widget.options.values) return;
    const locale = getLocale();
    if (locale === 'zh') {
        if (widget._originalValues) {
            widget.options.values = [...widget._originalValues];
        }
        return;
    }
    if (!widget._originalValues) {
        widget._originalValues = [...widget.options.values];
    }
    widget.options.values = widget._originalValues.map(value => translatePath(value, translations));
}

function updateAllSystemPromptWidgets(node, translations) {
    if (!node.widgets) return;
    for (const widget of node.widgets) {
        if (widget.name === "system_preset") {
            updateWidgetLabels(widget, translations);
            if (node.setDirtyCanvas) {
                node.setDirtyCanvas(true, true);
            }
        }
    }
}

const MENU_STYLES = {
    trigger: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '8px 12px',
        background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.95) 0%, rgba(22, 22, 32, 0.95) 100%)',
        border: '1px solid rgba(100, 100, 140, 0.35)',
        borderRadius: '8px',
        color: '#c8c8d4',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
        userSelect: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        minHeight: '36px'
    },
    triggerHover: {
        borderColor: 'rgba(120, 140, 200, 0.6)',
        boxShadow: '0 2px 8px rgba(80, 100, 180, 0.15)',
        color: '#e0e0ec'
    },
    triggerActive: {
        borderColor: 'rgba(99, 130, 220, 0.7)',
        boxShadow: '0 0 0 2px rgba(99, 130, 220, 0.15), 0 2px 8px rgba(80, 100, 180, 0.2)',
        color: '#e8e8f0'
    },
    arrow: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '10px',
        color: '#8888aa',
        flexShrink: '0',
        marginLeft: '8px'
    },
    arrowOpen: {
        transform: 'rotate(180deg)',
        color: '#aab8e0'
    },
    menuContainer: {
        position: 'fixed',
        zIndex: '9999',
        display: 'flex',
        gap: '12px',
        opacity: '0',
        transform: 'translateY(-8px) scale(0.97)',
        transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none'
    },
    menuContainerOpen: {
        opacity: '1',
        transform: 'translateY(0) scale(1)',
        pointerEvents: 'auto'
    },
    menuPanel: {
        background: 'linear-gradient(180deg, rgba(24, 24, 36, 0.98) 0%, rgba(20, 20, 30, 0.98) 100%)',
        border: '1px solid rgba(100, 100, 140, 0.3)',
        borderRadius: '12px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.03) inset',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    searchWrapper: {
        padding: '10px 12px',
        borderBottom: '1px solid rgba(100, 100, 140, 0.15)',
        flexShrink: '0'
    },
    searchInput: {
        width: '100%',
        padding: '8px 12px 8px 32px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(100, 100, 140, 0.2)',
        borderRadius: '8px',
        color: '#d0d0dc',
        fontSize: '13px',
        outline: 'none',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        fontFamily: 'inherit'
    },
    searchInputFocus: {
        borderColor: 'rgba(99, 130, 220, 0.5)',
        background: 'rgba(255, 255, 255, 0.06)',
        boxShadow: '0 0 0 2px rgba(99, 130, 220, 0.1)'
    },
    searchIcon: {
        position: 'absolute',
        left: '22px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#666688',
        fontSize: '13px',
        pointerEvents: 'none'
    },
    listContainer: {
        overflowY: 'auto',
        flex: '1',
        minHeight: '0'
    },
    categoryHeader: {
        padding: '10px 14px 8px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#c8d0e8',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'linear-gradient(90deg, rgba(80, 100, 150, 0.35) 0%, rgba(70, 90, 140, 0.25) 60%, transparent 100%)',
        borderBottom: '1px solid rgba(120, 140, 200, 0.25)',
        marginTop: '4px'
    },
    categoryIcon: {
        fontSize: '14px',
        opacity: '1'
    },
    presetItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 14px 8px 20px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        borderLeft: '3px solid transparent',
        color: '#b0b0c4',
        fontSize: '13px',
        userSelect: 'none',
        position: 'relative'
    },
    presetItemHover: {
        background: 'rgba(99, 130, 220, 0.1)',
        borderLeftColor: 'rgba(99, 130, 220, 0.5)',
        color: '#e0e0f0'
    },
    presetItemSelected: {
        background: 'rgba(99, 130, 220, 0.15)',
        borderLeftColor: 'rgba(99, 130, 220, 0.8)',
        color: '#e8e8f4',
        fontWeight: '500'
    },
    presetItemSelectedHover: {
        background: 'rgba(99, 130, 220, 0.2)',
        borderLeftColor: 'rgba(99, 130, 220, 0.9)',
        color: '#f0f0f8'
    },
    presetName: {
        flex: '1',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    checkIcon: {
        marginLeft: '8px',
        color: '#6382dc',
        fontSize: '14px',
        flexShrink: '0',
        opacity: '0',
        transition: 'opacity 0.15s ease'
    },
    checkIconVisible: {
        opacity: '1'
    },
    noResults: {
        padding: '20px 14px',
        textAlign: 'center',
        color: '#666688',
        fontSize: '13px'
    },
    previewPanel: {
        background: 'linear-gradient(180deg, rgba(24, 24, 36, 0.98) 0%, rgba(20, 20, 30, 0.98) 100%)',
        border: '1px solid rgba(100, 100, 140, 0.3)',
        borderRadius: '12px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.03) inset',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    previewHeader: {
        padding: '10px 14px',
        borderBottom: '1px solid rgba(100, 100, 140, 0.15)',
        fontSize: '12px',
        fontWeight: '600',
        color: '#8888aa',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        flexShrink: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    previewContent: {
        padding: '14px 16px',
        overflowY: 'auto',
        flex: '1',
        minHeight: '0',
        color: '#c0c0d0',
        fontSize: '13px',
        lineHeight: '1.7',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif"
    },
    previewEmpty: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '1',
        color: '#555570',
        fontSize: '13px',
        padding: '20px',
        textAlign: 'center'
    },
    overlay: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '9998',
        background: 'transparent'
    }
};

function createStyleSheet() {
    const styleId = 'zhihui-system-prompt-menu-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .zhihui-sp-menu-scroll::-webkit-scrollbar { width: 5px; }
        .zhihui-sp-menu-scroll::-webkit-scrollbar-track { background: transparent; }
        .zhihui-sp-menu-scroll::-webkit-scrollbar-thumb { background: rgba(120,120,160,0.25); border-radius: 10px; }
        .zhihui-sp-menu-scroll::-webkit-scrollbar-thumb:hover { background: rgba(140,140,180,0.4); }
        .zhihui-sp-menu-scroll { scrollbar-width: thin; scrollbar-color: rgba(120,120,160,0.25) transparent; }
        .zhihui-sp-preset-item { position: relative; }
        .zhihui-sp-preset-item::after {
            content: '';
            position: absolute;
            left: 14px;
            right: 14px;
            bottom: 0;
            height: 1px;
            background: rgba(255,255,255,0.02);
        }
        .zhihui-sp-category-header { position: relative; }
        .zhihui-sp-category-header:first-child { margin-top: 0 !important; }
        .zhihui-sp-category-header + .zhihui-sp-preset-item::after { display: none; }
        .zhihui-sp-preset-item:last-child::after { display: none; }
    `;
    document.head.appendChild(style);
}

function createMenuUI(node, presetWidget) {
    createStyleSheet();

    const container = document.createElement('div');
    container.style.cssText = 'position:relative;width:100%;pointer-events:auto;';

    const trigger = document.createElement('div');
    Object.assign(trigger.style, MENU_STYLES.trigger);
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-expanded', 'false');

    const triggerText = document.createElement('span');
    triggerText.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;';
    triggerText.textContent = $t('selectPreset');

    const arrow = document.createElement('span');
    Object.assign(arrow.style, MENU_STYLES.arrow);
    arrow.innerHTML = '&#9660;';

    trigger.appendChild(triggerText);
    trigger.appendChild(arrow);
    container.appendChild(trigger);

    let menuOpen = false;
    let menuContainer = null;
    let overlay = null;
    let searchInput = null;
    let listContainer = null;
    let previewContent = null;
    let previewTitleEl = null;
    let previewEmptyEl = null;
    let allPresets = [];
    let groupedPresets = {};
    let selectedPath = presetWidget.value || '';
    let hoveredPath = '';
    let previewCache = {};
    let closeTimer = null;

    function updateTriggerDisplay() {
        if (selectedPath) {
            const displayName = translatePresetName(selectedPath, translationsData);
            triggerText.textContent = displayName;
            triggerText.style.color = '#e0e0ec';
        } else {
            triggerText.textContent = $t('selectPreset');
            triggerText.style.color = '#8888a0';
        }
    }

    function buildMenuDOM() {
        menuContainer = document.createElement('div');
        Object.assign(menuContainer.style, MENU_STYLES.menuContainer);

        const menuPanel = document.createElement('div');
        Object.assign(menuPanel.style, MENU_STYLES.menuPanel);
        menuPanel.style.width = '300px';
        menuPanel.style.maxHeight = '480px';

        const searchWrapper = document.createElement('div');
        Object.assign(searchWrapper.style, MENU_STYLES.searchWrapper);
        searchWrapper.style.position = 'relative';

        const searchIcon = document.createElement('span');
        Object.assign(searchIcon.style, MENU_STYLES.searchIcon);
        searchIcon.innerHTML = '&#128269;';
        searchIcon.style.cssText = 'position:absolute;left:22px;top:50%;transform:translateY(-50%);color:#666688;font-size:13px;pointer-events:none;';

        searchInput = document.createElement('input');
        Object.assign(searchInput.style, MENU_STYLES.searchInput);
        searchInput.placeholder = $t('searchPlaceholder');
        searchInput.setAttribute('aria-label', $t('searchPlaceholder'));

        searchInput.addEventListener('focus', () => {
            Object.assign(searchInput.style, MENU_STYLES.searchInputFocus);
        });
        searchInput.addEventListener('blur', () => {
            searchInput.style.borderColor = 'rgba(100, 100, 140, 0.2)';
            searchInput.style.background = 'rgba(255, 255, 255, 0.04)';
            searchInput.style.boxShadow = 'none';
        });
        searchInput.addEventListener('input', () => {
            renderPresetList(searchInput.value);
        });

        searchWrapper.appendChild(searchIcon);
        searchWrapper.appendChild(searchInput);
        menuPanel.appendChild(searchWrapper);

        listContainer = document.createElement('div');
        Object.assign(listContainer.style, MENU_STYLES.listContainer);
        listContainer.classList.add('zhihui-sp-menu-scroll');
        menuPanel.appendChild(listContainer);

        menuContainer.appendChild(menuPanel);

        const previewPanel = document.createElement('div');
        Object.assign(previewPanel.style, MENU_STYLES.previewPanel);
        previewPanel.style.width = '380px';
        previewPanel.style.maxHeight = '480px';

        const previewHeader = document.createElement('div');
        Object.assign(previewHeader.style, MENU_STYLES.previewHeader);
        const previewIcon = document.createElement('span');
        previewIcon.innerHTML = '&#128196;';
        previewIcon.style.fontSize = '13px';
        previewTitleEl = document.createElement('span');
        previewTitleEl.textContent = $t('previewTitle');
        previewHeader.appendChild(previewIcon);
        previewHeader.appendChild(previewTitleEl);
        previewPanel.appendChild(previewHeader);

        previewContent = document.createElement('div');
        Object.assign(previewContent.style, MENU_STYLES.previewContent);
        previewContent.classList.add('zhihui-sp-menu-scroll');

        previewEmptyEl = document.createElement('div');
        Object.assign(previewEmptyEl.style, MENU_STYLES.previewEmpty);
        previewEmptyEl.textContent = $t('noPresetSelected');

        previewPanel.appendChild(previewContent);
        previewPanel.appendChild(previewEmptyEl);

        menuContainer.appendChild(previewPanel);

        overlay = document.createElement('div');
        Object.assign(overlay.style, MENU_STYLES.overlay);
        overlay.addEventListener('click', closeMenu);
        overlay.addEventListener('contextmenu', (e) => e.preventDefault());

        document.body.appendChild(overlay);
        document.body.appendChild(menuContainer);
    }

    function destroyMenuDOM() {
        if (overlay && overlay.parentNode) overlay.remove();
        if (menuContainer && menuContainer.parentNode) menuContainer.remove();
        overlay = null;
        menuContainer = null;
        searchInput = null;
        listContainer = null;
        previewContent = null;
        previewTitleEl = null;
        previewEmptyEl = null;
    }

    function groupPresets(presets) {
        const grouped = {};
        for (const preset of presets) {
            const parts = preset.split('/');
            const category = parts.length > 1 ? parts[0] : '__root__';
            const name = parts.length > 1 ? parts.slice(1).join('/') : parts[0];
            if (!grouped[category]) grouped[category] = [];
            grouped[category].push({ fullPath: preset, name: name });
        }
        return grouped;
    }

    function renderPresetList(filter) {
        if (!listContainer) return;
        listContainer.innerHTML = '';

        const filterLower = (filter || '').toLowerCase().trim();
        let hasResults = false;

        const sortedCategories = Object.keys(groupedPresets).sort((a, b) => {
            if (a === '__root__') return 1;
            if (b === '__root__') return -1;
            return a.localeCompare(b, 'zh-Hans-CN');
        });

        for (const category of sortedCategories) {
            const items = groupedPresets[category];
            let filteredItems = items;
            if (filterLower) {
                const translatedCategory = translateCategory(category, translationsData).toLowerCase();
                filteredItems = items.filter(item => {
                    if (item.fullPath.toLowerCase().includes(filterLower) ||
                        item.name.toLowerCase().includes(filterLower) ||
                        category.toLowerCase().includes(filterLower) ||
                        translatedCategory.includes(filterLower)) {
                        return true;
                    }
                    const translatedName = translatePresetName(item.fullPath, translationsData).toLowerCase();
                    return translatedName.includes(filterLower);
                });
            }
            if (filteredItems.length === 0) continue;
            hasResults = true;

            if (category !== '__root__') {
                const catHeader = document.createElement('div');
                Object.assign(catHeader.style, MENU_STYLES.categoryHeader);
                catHeader.classList.add('zhihui-sp-category-header');
                const catIcon = document.createElement('span');
                Object.assign(catIcon.style, MENU_STYLES.categoryIcon);
                catIcon.innerHTML = '&#128193;';
                const catName = document.createElement('span');
                catName.textContent = translateCategory(category, translationsData);
                const catCount = document.createElement('span');
                catCount.style.cssText = 'font-size:11px;color:#a8b8d8;margin-left:auto;background:rgba(100,120,180,0.25);padding:2px 8px;border-radius:10px;font-weight:500;';
                catCount.textContent = `${filteredItems.length}`;
                catHeader.appendChild(catIcon);
                catHeader.appendChild(catName);
                catHeader.appendChild(catCount);
                listContainer.appendChild(catHeader);
            }

            for (const item of filteredItems) {
                const itemEl = document.createElement('div');
                Object.assign(itemEl.style, MENU_STYLES.presetItem);
                itemEl.classList.add('zhihui-sp-preset-item');

                const isSelected = item.fullPath === selectedPath;
                if (isSelected) {
                    Object.assign(itemEl.style, MENU_STYLES.presetItemSelected);
                }

                const nameSpan = document.createElement('span');
                Object.assign(nameSpan.style, MENU_STYLES.presetName);
                nameSpan.textContent = translatePresetName(item.fullPath, translationsData);

                const checkSpan = document.createElement('span');
                Object.assign(checkSpan.style, MENU_STYLES.checkIcon);
                checkSpan.innerHTML = '&#10003;';
                if (isSelected) {
                    Object.assign(checkSpan.style, MENU_STYLES.checkIconVisible);
                }

                itemEl.appendChild(nameSpan);
                itemEl.appendChild(checkSpan);

                itemEl.addEventListener('mouseenter', () => {
                    if (item.fullPath === selectedPath) {
                        Object.assign(itemEl.style, MENU_STYLES.presetItemSelectedHover);
                    } else {
                        Object.assign(itemEl.style, MENU_STYLES.presetItemHover);
                    }
                    loadPreview(item.fullPath);
                });

                itemEl.addEventListener('mouseleave', () => {
                    if (item.fullPath === selectedPath) {
                        Object.assign(itemEl.style, MENU_STYLES.presetItemSelected);
                    } else {
                        itemEl.style.background = '';
                        itemEl.style.borderLeftColor = 'transparent';
                        itemEl.style.color = '#b0b0c4';
                    }
                });

                itemEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectPreset(item.fullPath);
                });

                listContainer.appendChild(itemEl);
            }
        }

        if (!hasResults) {
            const noResults = document.createElement('div');
            Object.assign(noResults.style, MENU_STYLES.noResults);
            noResults.textContent = $t('noResults');
            listContainer.appendChild(noResults);
        }
    }

    async function loadPreview(path) {
        if (!path || path === hoveredPath) return;
        hoveredPath = path;

        if (previewCache[path]) {
            showPreviewContent(previewCache[path], path);
            return;
        }

        previewContent.textContent = '';
        previewEmptyEl.style.display = 'none';
        previewContent.style.display = 'block';
        previewContent.textContent = $t('loading');
        previewContent.style.color = '#666688';

        try {
            const encodedPath = encodeURIComponent(path);
            const response = await api.fetchApi(`/zhihui/system_prompt/preview?path=${encodedPath}`);
            const data = await response.json();
            if (data && data.content) {
                previewCache[path] = data.content;
                showPreviewContent(data.content, path);
            } else {
                showPreviewError();
            }
        } catch (e) {
            console.error('Failed to load preset preview:', e);
            showPreviewError();
        }
    }

    function showPreviewContent(content, path) {
        if (hoveredPath !== path) return;
        previewContent.style.color = '#c0c0d0';
        previewContent.textContent = content;
        previewEmptyEl.style.display = 'none';
        previewContent.style.display = 'block';
        const displayName = path.split('/').pop();
        previewTitleEl.textContent = `${$t('previewTitle')}: ${displayName}`;
    }

    function showPreviewError() {
        previewContent.textContent = $t('loadFailed');
        previewContent.style.color = '#aa5555';
        previewEmptyEl.style.display = 'none';
        previewContent.style.display = 'block';
    }

    function resetPreview() {
        hoveredPath = '';
        previewContent.textContent = '';
        previewContent.style.display = 'none';
        previewEmptyEl.style.display = 'flex';
        previewEmptyEl.textContent = $t('noPresetSelected');
        previewTitleEl.textContent = $t('previewTitle');
    }

    function selectPreset(path) {
        selectedPath = path;
        presetWidget.value = path;
        updateTriggerDisplay();
        renderPresetList(searchInput ? searchInput.value : '');
        closeMenu();
        if (node.setDirtyCanvas) {
            node.setDirtyCanvas(true, true);
        }
    }

    function positionMenu() {
        if (!menuContainer) return;
        const triggerRect = trigger.getBoundingClientRect();
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;

        const menuW = 692;
        const menuH = 480;

        let left = triggerRect.left;
        if (left + menuW > viewportW - 16) {
            left = Math.max(16, viewportW - menuW - 16);
        }

        let top = triggerRect.bottom + 6;
        if (top + menuH > viewportH - 16) {
            top = triggerRect.top - menuH - 6;
            if (top < 16) {
                top = Math.max(16, viewportH - menuH - 16);
            }
        }

        menuContainer.style.left = left + 'px';
        menuContainer.style.top = top + 'px';
    }

    function openMenu() {
        if (menuOpen) return;
        menuOpen = true;

        if (closeTimer) {
            clearTimeout(closeTimer);
            closeTimer = null;
        }

        if (!menuContainer) {
            buildMenuDOM();
            groupedPresets = groupPresets(allPresets);
            renderPresetList('');
            resetPreview();
        }

        trigger.setAttribute('aria-expanded', 'true');
        Object.assign(trigger.style, MENU_STYLES.triggerActive);
        Object.assign(arrow.style, MENU_STYLES.arrowOpen);

        positionMenu();
        overlay.style.display = 'block';
        menuContainer.style.display = 'flex';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                Object.assign(menuContainer.style, MENU_STYLES.menuContainerOpen);
                if (searchInput) {
                    searchInput.value = '';
                    renderPresetList('');
                    searchInput.focus();
                }
            });
        });

        window.addEventListener('resize', positionMenu);
        window.addEventListener('scroll', positionMenu, true);
    }

    function closeMenu() {
        if (!menuOpen) return;
        menuOpen = false;

        trigger.setAttribute('aria-expanded', 'false');
        trigger.style.borderColor = 'rgba(100, 100, 140, 0.35)';
        trigger.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2)';
        trigger.style.color = '#c8c8d4';
        arrow.style.transform = '';
        arrow.style.color = '#8888aa';

        window.removeEventListener('resize', positionMenu);
        window.removeEventListener('scroll', positionMenu, true);

        if (menuContainer) {
            menuContainer.style.opacity = '0';
            menuContainer.style.transform = 'translateY(-8px) scale(0.97)';
            menuContainer.style.pointerEvents = 'none';
        }
        if (overlay) {
            overlay.style.display = 'none';
        }

        closeTimer = setTimeout(() => {
            destroyMenuDOM();
            closeTimer = null;
        }, 300);
    }

    function toggleMenu(e) {
        e.stopPropagation();
        if (menuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    trigger.addEventListener('click', toggleMenu);

    trigger.addEventListener('mouseenter', () => {
        if (!menuOpen) {
            Object.assign(trigger.style, MENU_STYLES.triggerHover);
        }
    });
    trigger.addEventListener('mouseleave', () => {
        if (!menuOpen) {
            trigger.style.borderColor = 'rgba(100, 100, 140, 0.35)';
            trigger.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2)';
            trigger.style.color = '#c8c8d4';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuOpen) {
            closeMenu();
            trigger.focus();
        }
    });

    async function loadPresets() {
        try {
            const response = await api.fetchApi('/zhihui/system_prompt/presets');
            const data = await response.json();
            if (data && data.presets) {
                allPresets = data.presets;
                groupedPresets = groupPresets(allPresets);
            }
        } catch (e) {
            console.error('Failed to load presets:', e);
        }
    }

    loadPresets().then(() => {
        updateTriggerDisplay();
    });

    updateTriggerDisplay();

    return {
        container,
        trigger,
        refresh: () => {
            selectedPath = presetWidget.value || '';
            updateTriggerDisplay();
        },
        updateLocale: () => {
            updateTriggerDisplay();
            if (menuOpen && listContainer) {
                renderPresetList(searchInput ? searchInput.value : '');
            }
        },
        destroy: () => {
            if (menuOpen) closeMenu();
            if (closeTimer) {
                clearTimeout(closeTimer);
                destroyMenuDOM();
            }
        }
    };
}

app.registerExtension({
    name: "Zhihui.SystemPromptLoader",

    async setup() {
        await loadTranslations();
        currentLocale = getLocale();

        setInterval(() => {
            const newLocale = getLocale();
            if (newLocale !== currentLocale) {
                currentLocale = newLocale;
                localeChangeListeners.forEach(cb => cb(newLocale));
            }
        }, 1000);
    },

    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "SystemPromptLoader") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;

            nodeType.prototype.onNodeCreated = function () {
                const result = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

                this._systemPromptLocale = getLocale();
                this._translationsLoaded = false;

                const self = this;
                localeChangeListeners.push((newLocale) => {
                    if (self._systemPromptLocale !== newLocale) {
                        self._systemPromptLocale = newLocale;
                        if (translationsData) {
                            updateAllSystemPromptWidgets(self, translationsData);
                        }
                        const presetWidget = self.widgets ? self.widgets.find(w => w.name === "system_preset") : null;
                        if (presetWidget && presetWidget._menuUI) {
                            presetWidget._menuUI.updateLocale();
                        }
                    }
                });

                loadTranslations().then((translations) => {
                    this._translationsLoaded = true;
                    updateAllSystemPromptWidgets(this, translations);
                });

                const presetWidget = this.widgets ? this.widgets.find(w => w.name === "system_preset") : null;
                if (presetWidget) {
                    const originalComputeSize = presetWidget.computeSize;
                    const originalDraw = presetWidget.draw;

                    let menuUI = null;

                    presetWidget.computeSize = function (width) {
                        if (originalComputeSize) {
                            return originalComputeSize.call(this, width);
                        }
                        return [Math.max(200, width || 200), 28];
                    };

                    presetWidget.draw = function (ctx, node, widget_width, y, widget_height) {
                        if (!menuUI) {
                            const widgetContainer = document.createElement('div');
                            widgetContainer.style.cssText = 'position:absolute;pointer-events:auto;';

                            menuUI = createMenuUI(node, presetWidget);
                            widgetContainer.appendChild(menuUI.container);

                            const nodeEl = document.querySelector(`.litegraph[data-node-id="${node.id}"]`) ||
                                document.querySelector(`[data-node-id="${node.id}"]`);

                            if (nodeEl) {
                                nodeEl.appendChild(widgetContainer);
                            } else {
                                document.body.appendChild(widgetContainer);
                            }

                            this._menuContainer = widgetContainer;
                            this._menuUI = menuUI;
                        }

                        if (this._menuContainer) {
                            const transform = ctx.getTransform();
                            const scale = app.canvas.ds.scale;
                            const offset = app.canvas.ds.offset;

                            const marginLeft = 10;
                            const marginRight = 10;
                            const yPadding = 4;

                            const canvasX = node.pos[0] + marginLeft;
                            const canvasY = node.pos[1] + y + yPadding;
                            const screenX = (canvasX + offset[0]) * scale;
                            const screenY = (canvasY + offset[1]) * scale;
                            const elWidth = (widget_width - marginLeft - marginRight) * scale;

                            this._menuContainer.style.left = screenX + 'px';
                            this._menuContainer.style.top = screenY + 'px';
                            this._menuContainer.style.width = elWidth + 'px';
                            this._menuContainer.style.display = node.flags.collapsed ? 'none' : 'block';
                        }

                        if (originalDraw) {
                            originalDraw.call(this, ctx, node, widget_width, y, widget_height);
                        }
                    };

                    const originalOnRemoved = nodeType.prototype.onRemoved;
                    nodeType.prototype.onRemoved = function () {
                        if (presetWidget._menuUI) {
                            presetWidget._menuUI.destroy();
                        }
                        if (presetWidget._menuContainer && presetWidget._menuContainer.parentNode) {
                            presetWidget._menuContainer.remove();
                        }
                        if (originalOnRemoved) {
                            return originalOnRemoved.apply(this, arguments);
                        }
                    };
                }

                return result;
            };

            const onRefresh = nodeType.prototype.onRefresh;
            nodeType.prototype.onRefresh = function () {
                const result = onRefresh ? onRefresh.apply(this, arguments) : undefined;
                if (translationsData && this._translationsLoaded) {
                    updateAllSystemPromptWidgets(this, translationsData);
                }
                const presetWidget = this.widgets ? this.widgets.find(w => w.name === "system_preset") : null;
                if (presetWidget && presetWidget._menuUI) {
                    presetWidget._menuUI.refresh();
                }
                return result;
            };
        }
    }
});
