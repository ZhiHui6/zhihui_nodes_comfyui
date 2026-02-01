import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";

const link = document.createElement("link");
link.rel = "stylesheet";
link.type = "text/css";
link.href = "/zhihui/gallery/style.css";
document.head.appendChild(link);

app.registerExtension({
    name: "Zhihui.Gallery",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "PromptGallery") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

                const node = this;
                node.setSize([400, 500]);

                node.properties = node.properties || {};
                const defaultSettings = { rememberPath: true, useWindowsPicker: false, lastDir: "" };
                let settings = (node.properties.zhihuiGallerySettings && typeof node.properties.zhihuiGallerySettings === "object")
                    ? node.properties.zhihuiGallerySettings
                    : { ...defaultSettings };
                settings = { ...defaultSettings, ...settings };
                node.properties.zhihuiGallerySettings = settings;
                
                function createHiddenWidget(name, value = "") {
                    const w = node.addWidget("text", name, value, (v) => {}, {});

                    w.computeSize = () => [0, -4];
                    w.draw = () => {};
                    w.type = "converted-widget";

                    return w;
                }

                const removeInputPortByName = (name) => {
                    if (!Array.isArray(node.inputs) || !name) return;
                    const idx = node.inputs.findIndex(i => i?.name === name);
                    if (idx < 0) return;
                    if (typeof node.removeInput === "function") {
                        node.removeInput(idx);
                    } else {
                        node.inputs.splice(idx, 1);
                    }
                };

                let dirWidget = null;
                let imgWidget = null;

                const ensureHiddenInputs = () => {
                    dirWidget = node.widgets ? node.widgets.find(w => w.name === "directory") : null;
                    if (!dirWidget) {
                        const initDir = (settings.rememberPath && typeof settings.lastDir === "string") ? settings.lastDir : "";
                        dirWidget = createHiddenWidget("directory", initDir);
                    } else {
                        dirWidget.computeSize = () => [0, -4];
                        dirWidget.draw = () => {};
                        dirWidget.type = "converted-widget";
                    }

                    imgWidget = node.widgets ? node.widgets.find(w => w.name === "selected_image") : null;
                    if (!imgWidget) {
                        imgWidget = createHiddenWidget("selected_image", "");
                    } else {
                        imgWidget.computeSize = () => [0, -4];
                        imgWidget.draw = () => {};
                        imgWidget.type = "converted-widget";
                    }
                    removeInputPortByName("directory");
                    removeInputPortByName("selected_image");
                };

                ensureHiddenInputs();

                const onConfigure = node.onConfigure;
                node.onConfigure = function () {
                    const rr = onConfigure ? onConfigure.apply(this, arguments) : undefined;
                    ensureHiddenInputs();
                    return rr;
                };

                const container = document.createElement("div");
                container.className = "zhihui-gallery-container";
                container.style.position = "absolute"; 
                container.style.pointerEvents = "auto";
                container.style.display = "none";

                const topBar = document.createElement("div");
                topBar.className = "zhihui-gallery-topbar";
                
                const pathInput = document.createElement("input");
                pathInput.className = "zhihui-gallery-path-input";
                pathInput.type = "text";
                pathInput.placeholder = "输入目录路径 · Enter directory path...";
                pathInput.value = dirWidget.value || "";            
                pathInput.onchange = (e) => {
                    applyDirectory(e.target.value, true);
                };

                const browseBtn = document.createElement("button");
                browseBtn.className = "zhihui-gallery-btn";
                browseBtn.innerText = "浏览 · Browse";
                browseBtn.onclick = async () => {
                    try {
                        const response = await api.fetchApi(`/zhihui/gallery/select_directory`);
                        const data = await response.json();
                        if (!response.ok) {
                            throw new Error(data?.error || `HTTP ${response.status}`);
                        }
                        if (data?.path) {
                            applyDirectory(data.path, true);
                        }
                    } catch (e) {
                        setStatus(`错误 · Error: ${e.message}`);
                    }
                };

                const goBtn = document.createElement("button");
                goBtn.className = "zhihui-gallery-btn";
                goBtn.innerText = "加载 · Load";
                goBtn.onclick = () => {
                    applyDirectory(pathInput.value, true);
                };

                const settingsBtn = document.createElement("button");
                settingsBtn.className = "zhihui-gallery-gear-btn";
                settingsBtn.type = "button";
                settingsBtn.innerText = "⚙️";
                settingsBtn.onclick = () => {
                    if (app?.canvas?.selectNode) {
                        app.canvas.selectNode(node);
                    }
                    settingsOverlay.style.display = "flex";
                };

                topBar.appendChild(pathInput);
                topBar.appendChild(browseBtn);
                topBar.appendChild(goBtn);
                topBar.appendChild(settingsBtn);
                container.appendChild(topBar);

                const grid = document.createElement("div");
                grid.className = "zhihui-gallery-grid";
                container.appendChild(grid);
                const footer = document.createElement("div");
                footer.className = "zhihui-gallery-footer";
                const footerLeft = document.createElement("div");
                footerLeft.className = "left";
                const footerStats = document.createElement("span");
                footerStats.className = "stats";
                const footerSelected = document.createElement("span");
                footerSelected.className = "selected";
                footerLeft.appendChild(footerStats);
                footerLeft.appendChild(footerSelected);
                const footerRight = document.createElement("div");
                footerRight.className = "right";
                footer.appendChild(footerLeft);
                footer.appendChild(footerRight);
                container.appendChild(footer);
                const settingsOverlay = document.createElement("div");
                settingsOverlay.className = "zhihui-gallery-settings-overlay";
                const settingsDialog = document.createElement("div");
                settingsDialog.className = "zhihui-gallery-settings-dialog";
                settingsOverlay.appendChild(settingsDialog);
                const settingsTitle = document.createElement("div");
                settingsTitle.className = "zhihui-gallery-settings-title";
                const settingsTitleText = document.createElement("div");
                settingsTitleText.innerText = "⚙️ 设置 · Settings";
                const settingsClose = document.createElement("button");
                settingsClose.className = "zhihui-gallery-settings-close";
                settingsClose.type = "button";
                settingsClose.innerText = "关闭 · Close";
                settingsClose.onclick = () => {
                    settingsOverlay.style.display = "none";
                };
                settingsTitle.appendChild(settingsTitleText);
                settingsTitle.appendChild(settingsClose);
                settingsDialog.appendChild(settingsTitle);

                const rememberRow = document.createElement("label");
                rememberRow.className = "zhihui-gallery-settings-row";
                const rememberCheckbox = document.createElement("input");
                rememberCheckbox.type = "checkbox";
                rememberCheckbox.checked = !!settings.rememberPath;
                const rememberText = document.createElement("span");
                rememberText.innerText = "记住路径 · Remember path";
                rememberRow.appendChild(rememberCheckbox);
                rememberRow.appendChild(rememberText);
                settingsDialog.appendChild(rememberRow);

                const windowsPickerRow = document.createElement("label");
                windowsPickerRow.className = "zhihui-gallery-settings-row";
                const windowsPickerCheckbox = document.createElement("input");
                windowsPickerCheckbox.type = "checkbox";
                windowsPickerCheckbox.checked = !!settings.useWindowsPicker;
                const windowsPickerText = document.createElement("span");
                windowsPickerText.innerText = "使用系统文件夹选择器 · Use system folder picker";
                windowsPickerRow.appendChild(windowsPickerCheckbox);
                windowsPickerRow.appendChild(windowsPickerText);
                settingsDialog.appendChild(windowsPickerRow);

                settingsOverlay.onclick = (e) => {
                    if (e.target === settingsOverlay) {
                        settingsOverlay.style.display = "none";
                    }
                };

                container.appendChild(settingsOverlay);

                document.body.appendChild(container);

                const updateBrowseBtnVisibility = () => {
                    const useWin = !!settings.useWindowsPicker;
                    browseBtn.style.display = useWin ? "" : "none";
                    goBtn.style.display = useWin ? "none" : "";
                    pathInput.style.display = "";
                    pathInput.readOnly = useWin;
                    pathInput.tabIndex = useWin ? -1 : 0;
                };
                updateBrowseBtnVisibility();

                const applySettingsToNode = () => {
                    node.properties.zhihuiGallerySettings = {
                        rememberPath: !!settings.rememberPath,
                        useWindowsPicker: !!settings.useWindowsPicker,
                        lastDir: typeof settings.lastDir === "string" ? settings.lastDir : ""
                    };
                };

                let pendingSaveTimer = null;
                const scheduleSaveSettings = (patch) => {
                    if (patch && typeof patch === "object") {
                        settings = { ...settings, ...patch };
                    }
                    applySettingsToNode();
                    if (pendingSaveTimer) clearTimeout(pendingSaveTimer);
                    pendingSaveTimer = setTimeout(async () => {
                        pendingSaveTimer = null;
                        try {
                            await api.fetchApi("/zhihui/gallery/settings", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(node.properties.zhihuiGallerySettings)
                            });
                        } catch (e) {
                            setStatus(`错误 · Error: ${e.message}`);
                        }
                    }, 150);
                };

                const loadSettingsFromFile = async () => {
                    try {
                        const response = await api.fetchApi("/zhihui/gallery/settings");
                        const data = await response.json();
                        if (!response.ok) {
                            throw new Error(data?.error || `HTTP ${response.status}`);
                        }
                        if (data && typeof data === "object") {
                            settings = { ...settings, ...data };
                            applySettingsToNode();
                            rememberCheckbox.checked = !!settings.rememberPath;
                            windowsPickerCheckbox.checked = !!settings.useWindowsPicker;
                            updateBrowseBtnVisibility();
                            const currentPath = (pathInput?.value || "").trim();
                            if (!currentPath && settings.rememberPath && settings.lastDir) {
                                applyDirectory(settings.lastDir, true);
                            }
                        }
                    } catch (e) {
                        setStatus(`错误 · Error: ${e.message}`);
                    }
                };

                rememberCheckbox.onchange = () => {
                    const remember = !!rememberCheckbox.checked;
                    if (remember) {
                        const currentDir = (dirWidget?.value || pathInput?.value || "").trim();
                        scheduleSaveSettings({
                            rememberPath: true,
                            lastDir: currentDir || (typeof settings.lastDir === "string" ? settings.lastDir : "")
                        });
                    } else {
                        scheduleSaveSettings({ rememberPath: false });
                    }
                };
                windowsPickerCheckbox.onchange = () => {
                    scheduleSaveSettings({ useWindowsPicker: !!windowsPickerCheckbox.checked });
                    updateBrowseBtnVisibility();
                };

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                                observer.unobserve(img);
                            }
                        }
                    });
                }, {
                    root: grid,
                    rootMargin: "50px"
                });

                let lastFiles = [];
                let fetchSeq = 0;

                const setStatus = (text) => {
                    footerRight.innerText = text || "";
                };

                const updateStats = () => {
                    const total = Array.isArray(lastFiles) ? lastFiles.length : 0;
                    const matched = Array.isArray(lastFiles) ? lastFiles.filter(f => !!f?.has_text).length : 0;
                    const mismatched = total - matched;
                    const selected = imgWidget?.value ? imgWidget.value : "—";
                    footerStats.innerText = `总图片数 · Total images: ${total} | 图文匹配 · Matched: ${matched} | 图文未匹配 · Unmatched: ${mismatched}`;
                    footerSelected.innerText = `选中 · Selected: ${selected}`;
                };

                const applyDirectory = (dir, autoFetch) => {
                    const newDir = (dir || "").trim();
                    pathInput.value = newDir;
                    dirWidget.value = newDir;
                    if (settings.rememberPath && newDir) {
                        scheduleSaveSettings({ lastDir: newDir });
                    }
                    updateStats();
                    if (autoFetch) {
                        fetchImages(newDir);
                    }
                };

                const widget = {
                    type: "HTML",
                    name: "gallery_preview",
                    draw(ctx, node, widget_width, y, widget_height) {
                        if (node.flags.collapsed) {
                             container.style.display = "none";
                             return;
                        }

                        const transform = ctx.getTransform();
                        const scale = app.canvas.ds.scale;
                        const offset = app.canvas.ds.offset;
                        const marginLeft = 10;
                        const marginRight = 10;
                        const marginBottom = 10;
                        const yPadding = 16;
                        const elWidth = widget_width - marginLeft - marginRight;
                        let safeY = y + yPadding;
                        if (typeof node.getConnectionPos === "function") {
                            let maxPortY = -Infinity;
                            if (Array.isArray(node.inputs)) {
                                for (let i = 0; i < node.inputs.length; i++) {
                                    const p = node.getConnectionPos(true, i);
                                    if (Array.isArray(p) && Number.isFinite(p[1])) maxPortY = Math.max(maxPortY, p[1]);
                                }
                            }
                            if (Array.isArray(node.outputs)) {
                                for (let i = 0; i < node.outputs.length; i++) {
                                    const p = node.getConnectionPos(false, i);
                                    if (Array.isArray(p) && Number.isFinite(p[1])) maxPortY = Math.max(maxPortY, p[1]);
                                }
                            }
                            if (Number.isFinite(maxPortY)) {
                                safeY = Math.max(safeY, (maxPortY - node.pos[1]) + 28);
                            }
                        }

                        const availableHeight = node.size[1] - safeY - marginBottom;
                        const elHeight = Math.max(availableHeight, 100); 
                        const baseCellAndGap = 88;
                        const columns = Math.max(1, Math.floor(elWidth / baseCellAndGap));
                        grid.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;    
                        const canvasX = node.pos[0] + marginLeft;
                        const canvasY = node.pos[1] + safeY;
                        const screenX = (canvasX + offset[0]) * scale;
                        const screenY = (canvasY + offset[1]) * scale;
                        const screenWidth = elWidth * scale;
                        const screenHeight = elHeight * scale;

                        container.style.display = "flex"; // Changed to flex for layout
                        container.style.left = `${screenX}px`;
                        container.style.top = `${screenY}px`;
                        container.style.width = `${screenWidth}px`;
                        container.style.height = `${screenHeight}px`;
                        
                        if (scale < 0.5) {
                             container.style.display = "none";
                        }
                    },
                    computeSize(width) {
                        return [width, 300]; 
                    },
                    onRemove() {
                        if (container && container.parentNode) {
                            container.parentNode.removeChild(container);
                        }
                    }
                };
                
                widget.div = container;
                widget.element = container; 

                node.addCustomWidget(widget);

                const onRemoved = node.onRemoved;
                node.onRemoved = function() {
                    if (onRemoved) onRemoved.apply(this, arguments);
                    if (container && container.parentNode) {
                        container.parentNode.removeChild(container);
                    }
                };

                const fetchImages = async (dir) => {
                    const trimmed = (dir || "").trim();
                    if (!trimmed) {
                        setStatus("请输入目录路径 · Please enter a directory path");
                        return;
                    }

                    const seq = ++fetchSeq;
                    grid.classList.add("loading");
                    setStatus("加载中... · Loading...");
                    
                    try {
                        const response = await api.fetchApi(`/zhihui/gallery/list_files?path=${encodeURIComponent(trimmed)}`);
                        const data = await response.json();
                        if (seq !== fetchSeq) return;
                        renderGallery(data.files, trimmed);
                    } catch (e) {
                        console.error("Error fetching gallery:", e);
                        if (seq !== fetchSeq) return;
                        grid.innerHTML = `<div style='color:red; padding:10px;'>错误 · Error: ${e.message}</div>`;
                        setStatus(`错误 · Error: ${e.message}`);
                    } finally {
                        if (seq === fetchSeq) {
                            grid.classList.remove("loading");
                        }
                    }
                };

                const renderGallery = (files, dir) => {
                    grid.innerHTML = "";
                    lastFiles = Array.isArray(files) ? files : [];
                    if (!files || files.length === 0) {
                        grid.innerHTML = "<div style='color:#666; padding:10px;'>未找到图片 · No images found</div>";
                        updateStats();
                        setStatus("");
                        return;
                    }

                    const currentSelection = imgWidget.value;

                    files.forEach(file => {
                        const item = document.createElement("div");
                        item.className = "zhihui-gallery-item";
                        if (file.filename === currentSelection) {
                            item.classList.add("selected");
                        }

                        const img = document.createElement("img");
                        const thumbUrl = `/zhihui/gallery/view_image?path=${encodeURIComponent(dir)}&filename=${encodeURIComponent(file.filename)}&thumbnail=true`;
                        
                        img.dataset.src = thumbUrl;
                        img.src = "";
                        img.title = file.filename;
                        img.draggable = false;
                        
                        observer.observe(img);
                        
                        item.appendChild(img);

                        if (!file.has_text) {
                            const badge = document.createElement("div");
                            badge.className = "no-text-indicator";
                            badge.innerText = "无文本 · No Text";
                            item.appendChild(badge);
                        }

                        item.onclick = (e) => {
                            e.stopPropagation(); 
                            
                            const prev = grid.querySelector(".selected");
                            if (prev) prev.classList.remove("selected");
                            item.classList.add("selected");
                            
                            imgWidget.value = file.filename;
                            updateStats();
                        };
                        
                        grid.appendChild(item);
                    });

                    updateStats();
                    setStatus("");
                };

                if (dirWidget.value) {
                    applyDirectory(dirWidget.value, true);
                } else if (settings.rememberPath && settings.lastDir) {
                    applyDirectory(settings.lastDir, true);
                } else {
                    updateStats();
                }

                loadSettingsFromFile();
            };
        }
    }
});