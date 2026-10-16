import { app } from "/scripts/app.js";
import { attachPanelTooltip } from "./panel_kit.js";
import {
    CATEGORY_ALL,
    applyCategoryTheme,
    buildCategoryFilter,
    buildCategoryPicker,
    categoryBadgeHtml,
    deriveCategories,
    escapeHtml,
    matchesCategory,
    requestCategoryRemove,
} from "./template_categories.js";

const TEMPLATES_API = "/zhiai_nodes/image_understanding/templates";
const STYLE_ID = "zhai-template-manager-styles";
const PICKER_CLASS = "tm-picker";

const i18n = {
    zh: {
        templateManager: "模板管理",
        templateCenter: "模板中心",
        settingsCategory: "ZhiAI",
        settingsSection: "模板管理",
        settingsRowName: "提示词模板管理",
        openManagerBtn: "📚 模板管理",
        searchTemplates: "搜索模板...",
        createTemplate: "新建模板",
        refresh: "刷新",
        edit: "编辑",
        delete: "删除",
        save: "保存",
        cancel: "取消",
        close: "关闭",
        confirm: "确定",
        categoryAll: "全部",
        categoryNone: "未分类",
        templateCategory: "分类",
        categoryRename: "重命名分类",
        categoryDelete: "删除分类",
        categoryManage: "管理分类",
        categoryManageEmpty: "暂无分类",
        categoryNamePlaceholder: "输入分类名称",
        templateNamePlaceholder: "模板名称",
        templateContentPlaceholder: "模板内容",
        templateNameRequired: "请填写模板名称",
        noTemplates: "暂无模板",
        loading: "加载中...",
        loadFailed: "模板加载失败",
        created: "模板已创建",
        updated: "模板已更新",
        saveFailed: "保存失败",
        deleted: "模板已删除",
        deleteFailed: "删除失败",
        confirmDelete: "确定删除这个模板？",
        confirmDiscard: "有未保存的修改，确定要放弃吗？",
        confirmDeleteCategory: "确定删除分类「{name}」？该分类下的模板会变为未分类。",
        categoryRenamed: "分类已重命名",
        categoryDeleted: "分类已删除",
        categoryDeleteFailed: "分类删除失败",
        categoryRenameFailed: "分类重命名失败",
        applied: "已应用模板",
        manageTemplates: "管理模板",
        previewEmpty: "（无内容）",
    },
    en: {
        templateManager: "Template Manager",
        templateCenter: "Template Center",
        settingsCategory: "ZhiAI",
        settingsSection: "Templates",
        settingsRowName: "Prompt template management",
        openManagerBtn: "📚 Templates",
        searchTemplates: "Search templates...",
        createTemplate: "New template",
        refresh: "Refresh",
        edit: "Edit",
        delete: "Delete",
        save: "Save",
        cancel: "Cancel",
        close: "Close",
        confirm: "OK",
        categoryAll: "All",
        categoryNone: "Uncategorized",
        templateCategory: "Category",
        categoryRename: "Rename category",
        categoryDelete: "Delete category",
        categoryManage: "Manage categories",
        categoryManageEmpty: "No categories yet",
        categoryNamePlaceholder: "Category name",
        templateNamePlaceholder: "Template name",
        templateContentPlaceholder: "Template content",
        templateNameRequired: "Template name is required",
        noTemplates: "No templates yet",
        loading: "Loading...",
        loadFailed: "Failed to load templates",
        created: "Template created",
        updated: "Template updated",
        saveFailed: "Failed to save",
        deleted: "Template deleted",
        deleteFailed: "Failed to delete",
        confirmDelete: "Delete this template?",
        confirmDiscard: "You have unsaved changes. Discard them?",
        confirmDeleteCategory: "Delete category \"{name}\"? Its templates become uncategorized.",
        categoryRenamed: "Category renamed",
        categoryDeleted: "Category deleted",
        categoryDeleteFailed: "Failed to delete category",
        categoryRenameFailed: "Failed to rename category",
        applied: "Template applied",
        manageTemplates: "Manage templates",
        previewEmpty: "(empty)",
    },
};

function getLocale() {
    const locale = app?.ui?.settings?.getSettingValue?.("Comfy.Locale");
    return locale === "zh-CN" || locale === "zh" ? "zh" : "en";
}

function $t(key) {
    const locale = getLocale();
    return i18n[locale][key] ?? i18n.en[key] ?? key;
}

export const TEMPLATE_MANAGER_THEME_GLASS = {
    "tm-fg": "#DDE9F5",
    "tm-fg-strong": "#F2FAFF",
    "tm-fg-dim": "#93A9C4",
    "tm-panel-bg": "rgba(9, 17, 32, 0.86)",
    "tm-list-bg": "rgba(5, 11, 22, 0.6)",
    "tm-field-bg": "rgba(7, 13, 26, 0.72)",
    "tm-border": "#2C5080",
    "tm-border-strong": "rgba(147, 197, 253, 0.42)",
    "tm-divider": "rgba(96, 165, 250, 0.14)",
    "tm-row-hover": "rgba(59, 130, 246, 0.16)",
    "tm-accent": "#3B82F6",
    "tm-accent-hover": "#60A5FA",
    "tm-accent-soft": "rgba(59, 130, 246, 0.24)",
    "tm-danger": "#F87171",
    "tm-success": "#34D399",
    "tm-field-font": "15px",
    "tm-radius": "8px",
    "tm-blur": "blur(14px)",
    "tm-shadow": "0 20px 48px rgba(2, 6, 23, 0.55)",
    "tm-head-band-top": "rgba(59, 130, 246, 0.26)",
    "tm-head-band-bottom": "rgba(59, 130, 246, 0.08)",
    "tm-side-font": "16px",
    "tc-chip-fg": "#DDE9F5",
    "tc-chip-bg": "rgba(59, 130, 246, 0.08)",
    "tc-chip-border": "#2C5080",
    "tc-chip-fg-hover": "#F2FAFF",
    "tc-chip-bg-hover": "rgba(59, 130, 246, 0.16)",
    "tc-chip-border-hover": "#60A5FA",
    "tc-chip-bg-active": "#2563EB",
    "tc-chip-fg-active": "#F2FAFF",
    "tc-tool-bg-hover": "rgba(59, 130, 246, 0.16)",
    "tc-focus": "#3B82F6",
    "tc-badge-fg": "#93C5FD",
    "tc-badge-bg": "rgba(59, 130, 246, 0.16)",
    "tc-badge-border": "rgba(96, 165, 250, 0.4)",
    "tc-field-fg": "#DDE9F5",
    "tc-field-bg": "rgba(7, 13, 26, 0.72)",
    "tc-field-border": "#2C5080",
    "tc-field-border-hover": "#60A5FA",
    "tc-field-border-focus": "#3B82F6",
    "tc-popover-bg": "rgba(9, 17, 32, 0.94)",
    "tc-popover-border": "#2C5080",
    "tc-popover-hover": "rgba(59, 130, 246, 0.16)",
    "tc-popover-fg-hover": "#F2FAFF",
    "tc-popover-shadow": "0 20px 48px rgba(2, 6, 23, 0.55)",
    "tc-popover-check": "#93C5FD",
    "tc-popover-divider": "rgba(96, 165, 250, 0.14)",
    "tc-accent": "#3B82F6",
    "tc-danger": "#F87171",
    "tc-danger-hover": "#EF4444",
};

export const TEMPLATE_MANAGER_THEME_COMFY = {
    "tm-fg": "#E8E8E8",
    "tm-fg-strong": "#F3F4F6",
    "tm-fg-dim": "#9CA3AF",
    "tm-panel-bg": "#1F2937",
    "tm-list-bg": "#111827",
    "tm-field-bg": "#111827",
    "tm-border": "rgba(255, 255, 255, 0.15)",
    "tm-border-strong": "rgba(255, 255, 255, 0.25)",
    "tm-divider": "rgba(255, 255, 255, 0.08)",
    "tm-row-hover": "rgba(99, 102, 241, 0.2)",
    "tm-accent": "#6366F1",
    "tm-accent-hover": "#818CF8",
    "tm-accent-soft": "rgba(99, 102, 241, 0.24)",
    "tm-danger": "#EF4444",
    "tm-success": "#22C55E",
    "tm-field-font": "15px",
    "tm-radius": "6px",
    "tm-blur": "blur(3px)",
    "tm-shadow": "0 12px 28px rgba(0, 0, 0, 0.5)",
    "tm-head-band-top": "rgba(59, 130, 246, 0.26)",
    "tm-head-band-bottom": "rgba(59, 130, 246, 0.08)",
    "tm-side-font": "16px",
};

const MANAGER_CSS = `
.tm-manager { display:flex; flex-direction:column; gap:10px; min-height:0; flex:1 1 auto; color:var(--tm-fg,#e8e8e8); font-family:inherit; }
.tm-panel--manager .tm-list { flex:1 1 auto; min-height:0; max-height:none; }
.tm-toolbar { display:flex; align-items:stretch; gap:8px; flex-wrap:wrap; }
.tm-toolbar > .tm-btn,
.tm-toolbar > .tm-search-wrap { height:40px; }
.tm-search { flex:1 1 160px; min-width:120px; padding:8px 12px; background:var(--tm-field-bg,rgba(0,0,0,.2)); border:1px solid var(--tm-border,rgba(255,255,255,.15)); border-radius:var(--tm-radius,6px); color:var(--tm-fg,#e8e8e8); font-size:var(--tm-field-font,15px); }
.tm-search:focus { outline:none; border-color:var(--tm-accent,#6366F1); }
.tm-search-wrap { position:relative; display:flex; align-items:center; flex:1 1 160px; min-width:120px; }
.tm-search-wrap .tm-search { flex:1 1 auto; width:100%; height:100%; box-sizing:border-box; padding:0 12px 0 30px; }
.tm-search__icon {
    position:absolute; left:9px; display:inline-flex; align-items:center;
    color:var(--tm-fg-dim,#93A9C4); pointer-events:none; line-height:0;
}
.tm-search-wrap:focus-within .tm-search__icon { color:var(--tm-accent-hover,#60A5FA); }
.tm-btn { box-sizing:border-box; display:inline-flex; align-items:center; justify-content:center; padding:5px 12px; border:1px solid var(--tm-border,rgba(255,255,255,.15)); border-radius:var(--tm-radius,6px); background:transparent; color:var(--tm-fg,#e8e8e8); font-size:14px; font-weight:500; cursor:pointer; white-space:nowrap; }
.tm-toolbar > .tm-btn,
.tm-editor__foot > .tm-btn { height:40px; padding:0 16px; }
.tm-btn:hover { border-color:var(--tm-accent-hover,#818CF8); color:var(--tm-fg-strong,#f3f4f6); background:var(--tm-accent-soft,rgba(99,102,241,.24)); }
.tm-btn--primary { border-color:transparent; background:var(--tm-accent,#6366F1); color:#FFFFFF; }
.tm-btn--primary:hover { background:var(--tm-accent-hover,#818CF8); color:#FFFFFF; }
.tm-list { flex:1 1 auto; min-height:160px; overflow-y:auto; background:var(--tm-list-bg,rgba(0,0,0,.2)); border:1px solid var(--tm-divider,rgba(255,255,255,.08)); border-radius:var(--tm-radius,6px); }
.tm-row { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 14px; border-bottom:1px solid var(--tm-divider,rgba(255,255,255,.08)); }
.tm-row:last-child { border-bottom:none; }
.tm-row:hover { background:var(--tm-row-hover,rgba(99,102,241,.2)); }
.tm-row__main { flex:1 1 auto; min-width:0; }
.tm-row__title { display:flex; align-items:center; gap:8px; min-width:0; font-size:16px; line-height:20px; font-weight:500; color:var(--tm-fg-strong,#f3f4f6); }
.tm-row__title span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.tm-row__preview { margin-top:3px; font-size:13px; line-height:17px; color:var(--tm-fg-dim,#9ca3af); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.tm-row__actions { display:flex; gap:5px; flex-shrink:0; }
.tm-row__actions > .tm-btn { height:26px; padding:0 10px; }
.tm-btn--danger { border-color:var(--tm-danger,#ef4444); color:var(--tm-danger,#ef4444); background:transparent; }
.tm-btn--danger:hover { background:var(--tm-danger,#ef4444); color:#FFFFFF; border-color:transparent; }
.tm-empty { padding:20px; text-align:center; font-size:14px; color:var(--tm-fg-dim,#9ca3af); }
.tm-overlay { position:fixed; inset:0; background:rgba(2,6,23,.55); backdrop-filter:var(--tm-blur,blur(3px)); display:flex; align-items:center; justify-content:center; z-index:10003; }
.tm-panel { display:flex; flex-direction:column; gap:10px; width:520px; max-width:92vw; max-height:82vh; padding:0 18px 16px; background:var(--tm-panel-bg,#1f2937); border:1px solid var(--tm-border,rgba(255,255,255,.15)); border-radius:10px; box-shadow:var(--tm-shadow,0 12px 28px rgba(0,0,0,.5)); color:var(--tm-fg,#e8e8e8); overflow:hidden; }
.tm-panel--wide { width:900px; }
.tm-panel--manager { height:min(92vh, 720px); max-height:min(92vh, 720px); }
.tm-panel--editor { height:82vh; }
.tm-panel__head {
    display:flex; align-items:center; gap:8px; flex:none;
    height:44px; margin:0 -18px; padding:0 16px 0 14px;
    background:linear-gradient(180deg, var(--tm-head-band-top,rgba(59,130,246,.26)), var(--tm-head-band-bottom,rgba(59,130,246,.08)));
    border-bottom:1px solid var(--tm-border,rgba(255,255,255,.15));
}
.tm-panel__title { margin:0; flex:0 0 auto; font-size:16px; font-weight:600; letter-spacing:.01em; color:var(--tm-fg-strong,#f3f4f6); white-space:nowrap; }
.tm-close { width:30px; height:30px; flex:none; margin-left:auto; border-radius:50%; border:1px solid var(--tm-border-strong,rgba(255,255,255,.25)); background:transparent; color:var(--tm-fg,#e8e8e8); font-size:16px; line-height:1; cursor:pointer; }
.tm-close:hover { background:var(--tm-danger,#b91c1c); border-color:transparent; color:#FFFFFF; }
.tm-field { width:100%; padding:11px 14px; background:var(--tm-field-bg,rgba(0,0,0,.2)); border:1px solid var(--tm-border,rgba(255,255,255,.15)); border-radius:var(--tm-radius,6px); color:var(--tm-fg,#e8e8e8); font-size:var(--tm-field-font,15px); font-family:inherit; box-sizing:border-box; }
.tm-field:focus { outline:none; border-color:var(--tm-accent,#6366F1); }
textarea.tm-field { flex:1 1 auto; min-height:200px; resize:none; }
.tm-editor__foot { display:flex; justify-content:flex-end; gap:8px; }
.${PICKER_CLASS} { position:fixed; z-index:10004; display:flex; flex-direction:column; gap:10px; width:440px; max-width:92vw; max-height:60vh; padding:0 12px 12px; background:var(--tm-panel-bg,#1f2937); border:1px solid var(--tm-border,rgba(255,255,255,.15)); border-radius:10px; box-shadow:var(--tm-shadow,0 12px 28px rgba(0,0,0,.5)); color:var(--tm-fg,#e8e8e8); overflow:hidden; }
.${PICKER_CLASS}__head {
    display:flex; align-items:center; gap:8px; flex:none;
    height:44px; margin:0 -12px; padding:0 14px;
    background:linear-gradient(180deg, var(--tm-head-band-top,rgba(59,130,246,.26)), var(--tm-head-band-bottom,rgba(59,130,246,.08)));
    border-bottom:1px solid var(--tm-border,rgba(255,255,255,.15));
}
.${PICKER_CLASS}__title { margin:0; flex:0 0 auto; font-size:16px; font-weight:600; letter-spacing:.01em; color:var(--tm-fg-strong,#f3f4f6); white-space:nowrap; }
.${PICKER_CLASS}__head .tm-search-wrap { flex:0 1 auto; width:75%; min-width:0; margin-left:12px; height:32px; }
.${PICKER_CLASS}__head .tm-search { flex:1 1 auto; min-width:0; }
.${PICKER_CLASS} .tm-picker__side .tc-chip { font-size:var(--tm-side-font,16px); padding:8px 11px 8px 13px; }
.${PICKER_CLASS}__manage { flex:0 0 auto; padding:7px 14px; }
.${PICKER_CLASS}__body { display:flex; gap:10px; flex:1 1 auto; min-height:0; }
.${PICKER_CLASS}__side {
    flex:0 0 144px; min-width:0; display:flex; padding-right:10px;
    border-right:1px solid var(--tm-divider,rgba(255,255,255,.08));
}
.${PICKER_CLASS}__side:has(.tc-filter[hidden]) { display:none; }
.${PICKER_CLASS}__main { flex:1 1 auto; min-width:0; display:flex; flex-direction:column; }
.${PICKER_CLASS} .tc-filter { flex:1 1 auto; flex-direction:column; align-items:stretch; flex-wrap:nowrap; gap:1px; overflow-y:auto; padding:2px; scrollbar-width:thin; scrollbar-color:var(--tm-border,rgba(255,255,255,.15)) transparent; }
.${PICKER_CLASS} .tc-filter::-webkit-scrollbar { width:6px; }
.${PICKER_CLASS} .tc-filter::-webkit-scrollbar-thumb { background:var(--tm-border,rgba(255,255,255,.15)); border-radius:3px; }
.${PICKER_CLASS} .tc-filter::-webkit-scrollbar-track { background:transparent; }
.${PICKER_CLASS} .tm-list { min-height:80px; flex:1 1 auto; }
.${PICKER_CLASS} .tm-row { cursor:pointer; }
.${PICKER_CLASS} .tm-row:hover .tm-row__title { color:var(--tm-accent-hover,#818CF8); }
.tm-toast { position:fixed; left:50%; bottom:32px; transform:translateX(-50%); padding:10px 18px; border-radius:var(--tm-radius,6px); border:1px solid var(--tm-border,rgba(255,255,255,.15)); background:var(--tm-panel-bg,#1f2937); color:var(--tm-fg-strong,#f3f4f6); font-size:15px; box-shadow:var(--tm-shadow,0 12px 28px rgba(0,0,0,.5)); z-index:10005; }
.tm-toast--success { border-color:var(--tm-success,#22c55e); }
.tm-toast--error { border-color:var(--tm-danger,#ef4444); }
`;

function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = MANAGER_CSS;
    document.head.appendChild(style);
}

function notify(message, kind = "success") {
    const toast = document.createElement("div");
    toast.className = "tm-toast tm-toast--" + kind;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
}

async function requestJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status === "error") {
        throw new Error(data?.message || `HTTP ${response.status}`);
    }
    return data;
}

function byUpdatedDesc(a, b) {
    return (b.updated_at || 0) - (a.updated_at || 0);
}

const SEARCH_ICON_SVG = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"'
    + ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

function wrapSearchField(input) {
    const wrap = document.createElement("div");
    wrap.className = "tm-search-wrap";
    const icon = document.createElement("span");
    icon.className = "tm-search__icon";
    icon.innerHTML = SEARCH_ICON_SVG;
    wrap.appendChild(icon);
    wrap.appendChild(input);
    return wrap;
}

const modalStack = [];

function findDialogHost() {
    const dlg = document.querySelector('[role="dialog"][data-state="open"]');
    return dlg || null;
}

function mountOverlay(overlay) {
    const host = findDialogHost();
    (host || document.body).appendChild(overlay);
}

function modal(titleText, onClose) {
    const overlay = document.createElement("div");
    overlay.className = "tm-overlay";
    const panel = document.createElement("div");
    panel.className = "tm-panel";

    const head = document.createElement("div");
    head.className = "tm-panel__head";
    const title = document.createElement("h3");
    title.className = "tm-panel__title";
    title.textContent = titleText;
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "tm-close";
    closeBtn.setAttribute("aria-label", $t("close"));
    closeBtn.textContent = "×";
    head.appendChild(title);
    head.appendChild(closeBtn);

    const close = () => {
        document.removeEventListener("keydown", onKeydown, true);
        const idx = modalStack.indexOf(entry);
        if (idx >= 0) modalStack.splice(idx, 1);
        if (overlay.parentNode) overlay.remove();
        onClose?.();
    };
    let requestClose = close;
    function onKeydown(event) {
        if (event.key !== "Escape") return;
        if (modalStack[modalStack.length - 1] !== entry) return;
        event.stopPropagation();
        requestClose();
    }
    document.addEventListener("keydown", onKeydown, true);

    closeBtn.onclick = () => requestClose();
    const stopAll = (event) => event.stopPropagation();
    overlay.addEventListener("click", (event) => {
        event.stopPropagation();
        if (event.target === overlay) requestClose();
    });
    overlay.addEventListener("mousedown", stopAll);
    overlay.addEventListener("pointerdown", stopAll);
    overlay.addEventListener("mouseup", stopAll);
    panel.addEventListener("click", stopAll);
    panel.addEventListener("mousedown", stopAll);
    panel.addEventListener("pointerdown", stopAll);

    panel.appendChild(head);
    overlay.appendChild(panel);
    const entry = {
        overlay,
        panel,
        close,
        setRequestClose(fn) { requestClose = fn; },
    };
    modalStack.push(entry);
    return entry;
}

function openEditor({ template = null, categories = [], onSave }) {
    const handle = modal(template ? $t("edit") : $t("createTemplate"));
    const { overlay, panel, close } = handle;
    panel.classList.add("tm-panel--wide", "tm-panel--editor");
    panel.style.height = "auto";
    panel.style.maxHeight = "82vh";

    const initial = {
        name: template?.name ?? "",
        content: template?.content ?? "",
        category: template?.category ?? "",
    };
    let dirty = false;
    const guardClose = () => {
        if (dirty && !window.confirm($t("confirmDiscard"))) return;
        close();
    };
    handle.setRequestClose(guardClose);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "tm-field";
    nameInput.placeholder = $t("templateNamePlaceholder");
    nameInput.value = initial.name;

    const picker = buildCategoryPicker({
        categories,
        value: initial.category,
        noneLabel: $t("categoryNone"),
    });
    attachPanelTooltip(picker.select, () => $t("templateCategory"));
    picker.select.setAttribute("aria-label", $t("templateCategory"));

    const contentInput = document.createElement("textarea");
    contentInput.className = "tm-field";
    contentInput.placeholder = $t("templateContentPlaceholder");
    contentInput.value = initial.content;

    const syncDirty = () => {
        dirty = nameInput.value !== initial.name
            || contentInput.value !== initial.content
            || picker.value() !== initial.category;
    };
    nameInput.addEventListener("input", syncDirty);
    contentInput.addEventListener("input", syncDirty);
    picker.select.addEventListener("change", syncDirty);

    const foot = document.createElement("div");
    foot.className = "tm-editor__foot";
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "tm-btn";
    cancelBtn.textContent = $t("cancel");
    cancelBtn.onclick = guardClose;

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "tm-btn tm-btn--primary";
    saveBtn.textContent = $t("save");
    saveBtn.onclick = async () => {
        const name = nameInput.value.trim();
        const content = contentInput.value.trim();
        if (!name) {
            notify($t("templateNameRequired"), "error");
            return;
        }
        saveBtn.disabled = true;
        try {
            const payload = { name, content, category: picker.value() };
            if (template?.id) {
                await requestJson(`${TEMPLATES_API}/${encodeURIComponent(template.id)}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                notify($t("updated"));
            } else {
                await requestJson(TEMPLATES_API, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                notify($t("created"));
            }
            close();
            await onSave?.();
        } catch (error) {
            console.error("[TemplateManager] save failed:", error);
            notify($t("saveFailed"), "error");
        } finally {
            saveBtn.disabled = false;
        }
    };

    foot.appendChild(cancelBtn);
    foot.appendChild(saveBtn);
    panel.appendChild(nameInput);
    panel.appendChild(picker.element);
    panel.appendChild(contentInput);
    panel.appendChild(foot);
    mountOverlay(overlay);
    nameInput.focus();
}
export function createTemplateManager(options = {}) {
    ensureStyles();

    const root = document.createElement("div");
    root.className = "tm-manager";
    applyCategoryTheme(root, options.theme);
    applyCategoryTheme(root, options.categoryTheme);

    const toolbar = document.createElement("div");
    toolbar.className = "tm-toolbar";
    const search = document.createElement("input");
    search.type = "search";
    search.className = "tm-search";
    search.placeholder = $t("searchTemplates");
    const refreshBtn = document.createElement("button");
    refreshBtn.type = "button";
    refreshBtn.className = "tm-btn";
    refreshBtn.textContent = $t("refresh");
    const createBtn = document.createElement("button");
    createBtn.type = "button";
    createBtn.className = "tm-btn tm-btn--primary";
    createBtn.textContent = $t("createTemplate");
    toolbar.appendChild(wrapSearchField(search));
    toolbar.appendChild(refreshBtn);
    toolbar.appendChild(createBtn);

    let activeCategory = CATEGORY_ALL;
    let templates = [];

    const filter = buildCategoryFilter({
        templates: [],
        active: CATEGORY_ALL,
        allLabel: $t("categoryAll"),
        noneLabel: $t("categoryNone"),
        renameLabel: $t("categoryRename"),
        removeLabel: $t("categoryDelete"),
        manageLabel: $t("categoryManage"),
        manageEmptyLabel: $t("categoryManageEmpty"),
        confirmLabel: $t("confirm"),
        cancelLabel: $t("cancel"),
        closeLabel: $t("close"),
        newPlaceholder: $t("categoryNamePlaceholder"),
        onPick: (key) => {
            activeCategory = key;
            render();
        },
        onRenamed: async () => {
            notify($t("categoryRenamed"));
            await refresh();
        },
        onRequestRemove: async (name) => {
            if (!window.confirm($t("confirmDeleteCategory").replace("{name}", name))) return;
            const result = await requestCategoryRemove(name);
            if (result.ok) {
                notify($t("categoryDeleted"));
                await refresh();
            } else {
                notify($t("categoryDeleteFailed"), "error");
            }
        },
        onError: () => notify($t("categoryRenameFailed"), "error"),
    });
    filter.element.style.flex = "0 0 auto";

    const list = document.createElement("div");
    list.className = "tm-list";

    root.appendChild(toolbar);
    root.appendChild(filter.element);
    root.appendChild(list);

    function visible() {
        const term = search.value.trim().toLowerCase();
        return templates
            .filter((item) => matchesCategory(item, activeCategory))
            .filter((item) => !term
                || String(item.name).toLowerCase().includes(term)
                || String(item.content).toLowerCase().includes(term));
    }

    function render() {
        const rows = visible();
        list.innerHTML = "";
        if (!rows.length) {
            const empty = document.createElement("div");
            empty.className = "tm-empty";
            empty.textContent = $t("noTemplates");
            list.appendChild(empty);
            return;
        }
        for (const item of rows) {
            const row = document.createElement("div");
            row.className = "tm-row";

            const main = document.createElement("div");
            main.className = "tm-row__main";
            const title = document.createElement("div");
            title.className = "tm-row__title";
            const name = document.createElement("span");
            name.textContent = item.name;
            title.appendChild(name);
            const badge = document.createElement("span");
            badge.innerHTML = categoryBadgeHtml(item.category, activeCategory);
            title.appendChild(badge);
            const preview = document.createElement("div");
            preview.className = "tm-row__preview";
            preview.textContent = String(item.content || "").slice(0, 80) || $t("previewEmpty");
            main.appendChild(title);
            main.appendChild(preview);

            const actions = document.createElement("div");
            actions.className = "tm-row__actions";
            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.className = "tm-btn";
            editBtn.textContent = $t("edit");
            editBtn.onclick = () => openEditor({
                template: item,
                categories: deriveCategories(templates),
                onSave: refresh,
            });
            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.className = "tm-btn tm-btn--danger";
            deleteBtn.textContent = $t("delete");
            deleteBtn.onclick = async () => {
                if (!window.confirm($t("confirmDelete"))) return;
                try {
                    await requestJson(`${TEMPLATES_API}/${encodeURIComponent(item.id)}`, { method: "DELETE" });
                    notify($t("deleted"));
                    await refresh();
                } catch (error) {
                    console.error("[TemplateManager] delete failed:", error);
                    notify($t("deleteFailed"), "error");
                }
            };
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            row.appendChild(main);
            row.appendChild(actions);
            list.appendChild(row);
        }
    }

    async function refresh() {
        let categories = [];
        try {
            const data = await requestJson(TEMPLATES_API);
            templates = (data.templates || []).slice().sort(byUpdatedDesc);
            categories = data.categories;
        } catch (error) {
            console.error("[TemplateManager] load failed:", error);
            templates = [];
            notify($t("loadFailed"), "error");
        }
        filter.sync(templates, categories);
        render();
    }

    search.addEventListener("input", render);
    refreshBtn.onclick = refresh;
    createBtn.onclick = () => openEditor({
        categories: deriveCategories(templates),
        onSave: refresh,
    });

    refresh();

    return {
        element: root,
        refresh,
        destroy() {
            root.remove();
        },
    };
}

let activeDialog = null;

export function openTemplateManagerDialog(options = {}) {
    ensureStyles();
    if (activeDialog) activeDialog.close();

    const { overlay, panel, close } = modal($t("templateManager"));
    panel.classList.add("tm-panel--wide", "tm-panel--manager");
    applyCategoryTheme(panel, options.theme);
    applyCategoryTheme(panel, options.categoryTheme);

    const manager = createTemplateManager(options);
    manager.element.style.flex = "1 1 auto";
    panel.appendChild(manager.element);
    overlay.appendChild(panel);
    mountOverlay(overlay);

    activeDialog = { close: () => { activeDialog = null; close(); } };
    return activeDialog;
}

let activePicker = null;
let pickerClosedAt = 0;

export function toggleTemplatePicker(options = {}) {
    if (activePicker) {
        const current = activePicker;
        activePicker = null;
        current.destroy();
        return;
    }
    if (Date.now() - pickerClosedAt < 250) return;
    ensureStyles();

    const popover = document.createElement("div");
    popover.className = PICKER_CLASS;
    applyCategoryTheme(popover, options.theme);
    applyCategoryTheme(popover, options.categoryTheme);

    const search = document.createElement("input");
    search.type = "search";
    search.className = "tm-search";
    search.placeholder = $t("searchTemplates");

    let activeCategory = CATEGORY_ALL;
    let templates = [];

    const filter = buildCategoryFilter({
        templates: [],
        allLabel: $t("categoryAll"),
        noneLabel: $t("categoryNone"),
        manage: false,
        showCounts: false,
        variant: "list",
        onPick: (key) => {
            activeCategory = key;
            render();
        },
    });

    const list = document.createElement("div");
    list.className = "tm-list";

    const head = document.createElement("div");
    head.className = "tm-picker__head";
    const title = document.createElement("h4");
    title.className = "tm-picker__title";
    title.textContent = $t("templateCenter");

    let manageBtn = null;
    if (typeof options.onManage === "function") {
        manageBtn = document.createElement("button");
        manageBtn.type = "button";
        manageBtn.className = "tm-btn tm-btn--primary tm-picker__manage";
        manageBtn.textContent = $t("manageTemplates");
        manageBtn.onclick = () => {
            destroy();
            options.onManage();
        };
    }

    head.appendChild(title);
    head.appendChild(wrapSearchField(search));
    if (manageBtn) head.appendChild(manageBtn);

    const body = document.createElement("div");
    body.className = "tm-picker__body";
    const side = document.createElement("div");
    side.className = "tm-picker__side";
    side.appendChild(filter.element);
    const main = document.createElement("div");
    main.className = "tm-picker__main";
    main.appendChild(list);
    body.appendChild(side);
    body.appendChild(main);

    popover.appendChild(head);
    popover.appendChild(body);

    function render() {
        const term = search.value.trim().toLowerCase();
        const rows = templates
            .filter((item) => matchesCategory(item, activeCategory))
            .filter((item) => !term
                || String(item.name).toLowerCase().includes(term)
                || String(item.content).toLowerCase().includes(term));
        list.innerHTML = "";
        if (!rows.length) {
            const empty = document.createElement("div");
            empty.className = "tm-empty";
            empty.textContent = $t("noTemplates");
            list.appendChild(empty);
            return;
        }
        for (const item of rows) {
            const row = document.createElement("div");
            row.className = "tm-row";
            const main = document.createElement("div");
            main.className = "tm-row__main";
            const title = document.createElement("div");
            title.className = "tm-row__title";
            const name = document.createElement("span");
            name.textContent = item.name;
            title.appendChild(name);
            const badge = document.createElement("span");
            badge.innerHTML = categoryBadgeHtml(item.category, activeCategory);
            title.appendChild(badge);
            main.appendChild(title);
            row.appendChild(main);
            row.onclick = () => {
                destroy();
                options.onPick?.(item);
                notify($t("applied"));
            };
            list.appendChild(row);
        }
    }

    function onDocPointerDown(event) {
        if (popover.contains(event.target)) return;
        destroy();
    }

    function onKeydown(event) {
        if (event.key === "Escape") destroy();
    }

    function destroy() {
        popover.remove();
        document.removeEventListener("mousedown", onDocPointerDown, true);
        document.removeEventListener("keydown", onKeydown, true);
        if (activePicker && activePicker.popover === popover) activePicker = null;
        pickerClosedAt = Date.now();
    }

    search.addEventListener("input", render);
    document.body.appendChild(popover);

    const rect = options.anchorRect || { left: 20, top: 20, bottom: 20, right: 20 };
    const box = popover.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + 4;
    if (left + box.width > window.innerWidth - 10) left = window.innerWidth - box.width - 10;
    if (left < 10) left = 10;
    if (top + box.height > window.innerHeight - 10) top = Math.max(10, rect.top - box.height - 4);
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;

    activePicker = { popover, destroy };
    setTimeout(() => {
        document.addEventListener("mousedown", onDocPointerDown, true);
        document.addEventListener("keydown", onKeydown, true);
    }, 0);

    requestJson(TEMPLATES_API)
        .then((data) => {
            templates = (data.templates || []).slice().sort(byUpdatedDesc);
            filter.sync(templates, data.categories);
            render();
        })
        .catch((error) => {
            console.error("[TemplateManager] picker load failed:", error);
            templates = [];
            filter.sync(templates);
            render();
        });

    search.focus();
}

app.registerExtension({
    name: "ZhiAI.TemplateManager",
    setup() {
        app.ui?.settings?.addSetting?.({
            id: "zhiai_nodes.TemplateManager",
            category: [$t("settingsCategory"), $t("settingsSection")],
            name: $t("settingsRowName"),
            type: () => {
                ensureStyles();
                const btn = document.createElement("button");
                btn.className = "tm-btn tm-btn--primary";
                btn.textContent = $t("openManagerBtn");
                applyCategoryTheme(btn, TEMPLATE_MANAGER_THEME_GLASS);
                btn.onclick = () => openTemplateManagerDialog({
                    theme: TEMPLATE_MANAGER_THEME_GLASS,
                });
                return btn;
            },
        });
    },
});
