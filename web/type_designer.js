import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
app.registerExtension({
    name: "zhihui.TypeDesigner",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "TypeDesigner") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                const node = this;
                this.addWidget("button", "🎨选择字体风格·Select font style", null, () => {
                    openTypeDesignerDialog(node);
                });
                return r;
            };
        }
    }
});
async function openTypeDesignerDialog(node) {
    let stylesData = null;
    try {
        const response = await api.fetchApi("/zhihui/typedesigner/styles");
        if (response.ok) {
            stylesData = await response.json();
        } else {
            alert("无法加载风格数据 (styles.json)");
            return;
        }
    } catch (e) {
        alert("加载风格出错: " + e);
        return;
    }
    const dialog = document.createElement("div");
    dialog.id = "type-designer-dialog";
    const styleEl = document.createElement("style");
    styleEl.textContent = `
        :root {
            --td-bg-color: #1e1e1e;
            --td-sidebar-bg: #252526;
            --td-text-primary: #e0e0e0;
            --td-text-secondary: #aaaaaa;
            --td-accent-color: #37373d;
            --td-accent-hover: #4a4a50;
            --td-border-color: #3e3e42;
            --td-selected-ring: #007bff;
            --td-card-bg: #2d2d30;
            --td-shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
            --td-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.2);
            --td-radius-sm: 6px;
            --td-radius-md: 12px;
        }
        #type-designer-dialog {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(4px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: var(--td-text-primary);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        #type-designer-dialog.visible {
            opacity: 1;
        }
        #type-designer-dialog * { box-sizing: border-box; }
        .td-container {
            width: 95%;
            height: 75%;
            max-width: 1800px;
            background: var(--td-bg-color);
            border-radius: var(--td-radius-md);
            border: 2px solid var(--td-border-color);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transform: scale(0.95);
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        #type-designer-dialog.visible .td-container {
            transform: scale(1);
        }
        /* Header */
        .td-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 24px;
            background: var(--td-sidebar-bg);
            border-bottom: 1px solid var(--td-border-color);
        }
        .td-title {
            font-size: 20px;
            font-weight: 700;
            color: var(--td-text-primary);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .td-title::before {
            content: "T";
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: var(--td-accent-color);
            color: #fff;
            border-radius: 6px;
            font-family: serif;
        }
        .td-search-wrapper {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
        }
        .td-search {
            width: 100%;
            padding: 6px 16px 6px 36px;
            border: 1px solid var(--td-border-color);
            border-radius: 20px;
            font-size: 13px;
            background: #333333;
            color: #fff;
            transition: all 0.2s;
            outline: none;
        }
        .td-search::placeholder {
            color: #b0b0b0; /* Brighter placeholder color */
            opacity: 1;
        }
        .td-search:focus {
            background: #3c3c3c;
            border-color: var(--td-selected-ring);
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }
        .td-search-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
            pointer-events: none;
        }
        .td-close {
            cursor: pointer;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px; /* Rounded rectangle */
            transition: all 0.2s;
            color: var(--td-text-secondary);
            border: 1px solid var(--td-border-color); /* Added border */
            font-weight: 900; /* Bold symbol */
            font-size: 14px;
        }
        .td-close:hover {
            background: #ff4d4f; /* Red background on hover */
            color: #fff; /* White text on hover */
            border-color: #ff4d4f;
        }
        /* Layout */
        .td-body {
            display: flex;
            flex: 1;
            overflow: hidden;
        }
        .td-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            border-right: 1px solid var(--td-border-color);
            background: var(--td-bg-color);
            min-width: 0; /* Prevent flex overflow */
        }
        .td-sidebar {
            width: 450px;
            display: flex;
            flex-direction: column;
            padding: 24px;
            background: var(--td-sidebar-bg);
            box-shadow: -1px 0 5px rgba(0,0,0,0.02);
            z-index: 10;
        }
        /* Tabs */
        .td-tabs-container {
            padding: 8px 24px;
            background: var(--td-sidebar-bg);
            border-bottom: 1px solid var(--td-border-color);
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .td-tabs {
            display: flex;
            gap: 5px;
            overflow-x: auto;
            scrollbar-width: none; /* Firefox */
            padding-bottom: 4px;
        }
        .td-tabs::-webkit-scrollbar { display: none; }
        .td-tab {
            padding: 6px 10px;
            cursor: pointer;
            border-radius: 20px;
            background: transparent;
            color: #cccccc;
            font-size: 15px;
            font-weight: bold;
            white-space: nowrap;
            flex-shrink: 0;
            transition: all 0.2s;
            border: 1px solid transparent;
        }
        .td-tab:hover {
            background: rgba(0, 123, 255, 0.2); /* Selected color with 20% opacity */
            color: #fff;
        }
        .td-tab.active {
            background: #007bff;
            color: #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        /* Grid */
        .td-grid {
            flex: 1;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
            padding: 16px;
            overflow-y: auto;
            align-content: start;
        }
        .td-footer {
            padding: 8px 16px;
            background: var(--td-bg-color);
            border-top: 1px solid var(--td-border-color);
            font-size: 12px;
            color: var(--td-text-secondary);
            text-align: left; /* Left align */
            flex-shrink: 0;
            user-select: none;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .td-card {
            position: relative;
            width: 100%;
            cursor: pointer;
        }
        .td-card-inner {
            width: 100%;
            background: var(--td-card-bg);
            border-radius: var(--td-radius-sm);
            overflow: hidden;
            transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
            border: 2px solid transparent;
            box-shadow: var(--td-shadow-sm);
            display: flex;
            flex-direction: column;
        }
        .td-card:hover .td-card-inner {
            transform: translateY(-4px);
            box-shadow: var(--td-shadow-md);
        }
        .td-card.selected .td-card-inner {
            border-color: var(--td-selected-ring);
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
        }
        .td-card-img {
            width: 100%;
            padding-top: 100%; /* Square aspect ratio for image area */
            background-color: #333;
            position: relative;
            overflow: hidden;
        }
        .td-card-img::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6));
        }
        .td-card-name {
            padding: 6px 8px; /* Reduced height */
            font-size: 14px;
            line-height: 1.2;
            font-weight: 600;
            color: var(--td-text-primary);
            text-align: center;
            background: var(--td-sidebar-bg);
            border-top: 1px solid var(--td-border-color);
        }
        /* Sidebar Elements */
        .td-section-title {
            font-size: 20px;
            font-family: "SimHei", "Microsoft YaHei", sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 12px;
            margin-top: 24px;
        }
        .td-section-title:first-child { margin-top: 0; }
        .td-textarea {
            width: 100%;
            height: 100px;
            padding: 12px;
            border: 1px solid var(--td-border-color);
            border-radius: var(--td-radius-sm);
            resize: none;
            font-family: inherit;
            font-size: 16px;
            line-height: 1.5;
            transition: border-color 0.2s;
            outline: none;
            background: #333333;
            color: var(--td-text-primary);
        }
        .td-textarea:focus {
            border-color: var(--td-selected-ring);
        }
        .td-result-area {
            width: 100%;
            height: 350px;
            padding: 12px;
            border: 1px solid var(--td-border-color);
            border-radius: var(--td-radius-sm);
            background: #333333;
            overflow-y: auto;
            font-size: 16px;
            line-height: 1.5;
            color: var(--td-text-secondary);
            margin-bottom: 20px;
        }
        .td-btn {
            padding: 12px 20px;
            background: #28a745;
            color: #fff;
            border: none;
            border-radius: var(--td-radius-sm);
            cursor: pointer;
            width: 100%;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 10px;
        }
        .td-btn:hover {
            background: #34ce57;
            transform: translateY(-1px);
        }
        .td-btn:active {
            transform: translateY(0);
        }
        .td-btn-secondary {
            background: #fff;
            color: var(--td-text-primary);
            border: 1px solid var(--td-border-color);
        }
        .td-btn-secondary:hover {
            background: #f8f9fa;
            border-color: #ccc;
        }
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--td-selected-ring); border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: #0056b3; }
    `;
    dialog.appendChild(styleEl);
    const container = document.createElement("div");
    container.className = "td-container";
    dialog.appendChild(container);
    const header = document.createElement("div");
    header.className = "td-header";
    header.innerHTML = `
        <div class="td-title">选择字体风格</div>
        <div class="td-search-wrapper">
            <span class="td-search-icon">🔍</span>
            <input type="text" class="td-search" placeholder="搜索风格...">
        </div>
        <div class="td-close" title="Close">✕</div>
    `;
    container.appendChild(header);
    const body = document.createElement("div");
    body.className = "td-body";
    container.appendChild(body);
    const main = document.createElement("div");
    main.className = "td-main";
    body.appendChild(main);
    const tabsContainer = document.createElement("div");
    tabsContainer.className = "td-tabs-container";
    const tabs = document.createElement("div");
    tabs.className = "td-tabs";
    tabsContainer.appendChild(tabs);
    main.appendChild(tabsContainer);
    const grid = document.createElement("div");
    grid.className = "td-grid";
    main.appendChild(grid);
    const footer = document.createElement("div");
    footer.className = "td-footer";
    main.appendChild(footer);
    const sidebar = document.createElement("div");
    sidebar.className = "td-sidebar";
    sidebar.innerHTML = `
        <div class="td-section-title">输入文本</div>
        <textarea class="td-textarea" id="td-input-text" placeholder="在此输入文字..."></textarea>
        <div class="td-section-title">提示词预览</div>
        <div class="td-result-area" id="td-generated-prompt">
            <div style="color: #757575;">
                请选择一种风格并输入文本...
            </div>
        </div>
        <div style="margin-top:auto">
            <button class="td-btn" id="td-apply-btn">✨应用</button>
        </div>
    `;
    body.appendChild(sidebar);
    document.body.appendChild(dialog);
    requestAnimationFrame(() => {
        dialog.classList.add("visible");
    });
    let currentCategory = "全部";
    let currentSearch = "";
    let selectedStyle = null;
    const categories = stylesData.categories || {};
    const prompts = stylesData.prompts || {};
    const allStylesSet = new Set();
    Object.entries(categories).forEach(([key, list]) => {
        if (key !== "全部" && Array.isArray(list)) {
            list.forEach(style => allStylesSet.add(style));
        }
    });
    categories["全部"] = Array.from(allStylesSet);
    const closeBtn = header.querySelector(".td-close");
    const searchInput = header.querySelector(".td-search");
    const inputText = sidebar.querySelector("#td-input-text");
    const generatedPrompt = sidebar.querySelector("#td-generated-prompt");
    const applyBtn = sidebar.querySelector("#td-apply-btn");
    const textWidget = node.widgets.find(w => w.name === "text");
    function renderTabs() {
        tabs.innerHTML = "";
        Object.keys(categories).forEach(cat => {
            const tab = document.createElement("div");
            tab.className = `td-tab ${cat === currentCategory ? "active" : ""}`;
            tab.textContent = cat;
            tab.onclick = () => {
                currentCategory = cat;
                currentSearch = ""; 
                searchInput.value = "";
                renderTabs();
                renderGrid();
            };
            tabs.appendChild(tab);
        });
    }
    function renderGrid() {
        grid.innerHTML = "";
        let stylesToShow = [];
        if (currentSearch) {
            const allStyles = new Set();
            Object.values(categories).forEach(list => list.forEach(s => allStyles.add(s)));
            stylesToShow = Array.from(allStyles).filter(s => s.toLowerCase().includes(currentSearch.toLowerCase()));
        } else {
            stylesToShow = categories[currentCategory] || [];
        }
        const totalCount = (categories["全部"] || []).length;
        let footerText = `总条目: ${totalCount}个`;
        if (currentCategory !== "全部") {
             const currentCount = (categories[currentCategory] || []).length;
             footerText += `  ， 当前分类: ${currentCount}个`;
        }
        footer.textContent = footerText;
        if (stylesToShow.length === 0) {
            grid.innerHTML = `<div style="width:100%; text-align:center; padding:40px; color:#999;">未找到相关风格</div>`;
            return;
        }
        stylesToShow.forEach((styleName, index) => {
            const card = document.createElement("div");
            card.className = `td-card ${selectedStyle === styleName ? "selected" : ""}`;
            const delay = Math.min(index * 0.02, 0.5);
            card.style.animation = `fadeIn 0.3s ease forwards ${delay}s`;
            card.style.opacity = "0"; 
            setTimeout(() => card.style.opacity = "1", 50 + delay * 1000);
            const cardInner = document.createElement("div");
            cardInner.className = "td-card-inner";
            const cardImg = document.createElement("div");
            cardImg.className = "td-card-img";
            const hue = Math.abs(styleName.split('').reduce((a,b)=>a+(b.charCodeAt(0)),0)) % 360;
            cardImg.style.backgroundColor = `hsl(${hue}, 60%, 30%)`;
            cardImg.style.backgroundImage = `url(/zhihui/typedesigner/images?style=${encodeURIComponent(styleName)})`;
            cardImg.style.backgroundSize = "cover";
            cardImg.style.backgroundPosition = "center";
            const cardName = document.createElement("div");
            cardName.className = "td-card-name";
            cardName.textContent = styleName;
            cardInner.appendChild(cardImg);
            cardInner.appendChild(cardName);
            card.appendChild(cardInner);
            card.onclick = () => {
                selectedStyle = styleName;
                document.querySelectorAll('.td-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                updatePrompt();
            };
            grid.appendChild(card);
        });
    }
    function updatePrompt() {
        const text = document.getElementById("td-input-text").value;
        const resultArea = document.getElementById("td-generated-prompt");
        if (!selectedStyle) {
            resultArea.innerHTML = `<div style="color: #757575;">请选择一种风格</div>`;
            return;
        }
        const promptTemplate = prompts[selectedStyle];
        if (promptTemplate) {
            let prompt = promptTemplate.replace("{text}", text || "");
            if (text) {
                prompt = `"${text}" ${prompt}`;
            }
            resultArea.textContent = prompt;
        } else {
            resultArea.textContent = "";
        }
    }
    function closeDialog() {
        dialog.classList.remove("visible");
        setTimeout(() => {
            if (document.body.contains(dialog)) {
                document.body.removeChild(dialog);
            }
        }, 300);
    }
    closeBtn.onclick = closeDialog;
    searchInput.oninput = (e) => {
        currentSearch = e.target.value;
        renderGrid();
    };
    inputText.oninput = () => {
        updatePrompt();
    };
    applyBtn.onclick = () => {
        if (textWidget) {
            if (selectedStyle || inputText.value) {
                if (selectedStyle) {
                    textWidget.value = generatedPrompt.textContent;
                } else {
                    textWidget.value = inputText.value;
                }
            }
        }
        closeDialog();
    };
    renderTabs();
    renderGrid();
}