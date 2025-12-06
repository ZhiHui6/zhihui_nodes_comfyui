import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

const commonStyles = {
    button: {
        base: { display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'6px 12px', borderRadius:'6px', border:'1px solid', fontSize:'14px', fontWeight:'500', cursor:'pointer', transition:'all 0.2s ease', outline:'none' },
        primary: { background:'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)', borderColor:'rgba(59, 130, 246, 0.7)', color:'#ffffff' },
        primaryHover: { background:'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)', boxShadow:'0 2px 4px rgba(59, 130, 246, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)', borderColor:'rgba(59, 130, 246, 0.5)' },
        danger: { background:'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', borderColor:'rgba(220, 38, 38, 0.8)', color:'#ffffff' },
        dangerHover: { background:'linear-gradient(135deg, #f87171 0%, #ef4444 100%)', boxShadow:'0 2px 8px rgba(239, 68, 68, 0.4)', borderColor:'rgba(248, 113, 113, 0.8)' }
    },
};

function applyStyles(el, styles){ Object.assign(el.style, styles); }
function setupButtonHover(el, normal, hover){ applyStyles(el, normal); el.addEventListener('mouseenter', ()=>applyStyles(el, hover)); el.addEventListener('mouseleave', ()=>applyStyles(el, normal)); }
function showNotification(message, type = 'success', duration = 3000) {

    const existingNotification = document.getElementById('card-pool-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const dialogContent = dialog && dialog.content;
    if (!dialogContent) {

        const notification = document.createElement('div');
        notification.id = 'card-pool-notification';
        
        const isSuccess = type === 'success';
        const bgColor = isSuccess ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
        const borderColor = isSuccess ? 'rgba(16, 185, 129, 0.7)' : 'rgba(220, 38, 38, 0.8)';
        const icon = isSuccess ? '✓' : '✗';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10002;
            background: ${bgColor};
            border: 1px solid ${borderColor};
            color: #ffffff;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 8px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        const iconSpan = document.createElement('span');
        iconSpan.textContent = icon;
        iconSpan.style.cssText = `
            font-size: 16px;
            font-weight: 700;
            min-width: 16px;
            text-align: center;
        `;
        
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        
        notification.appendChild(iconSpan);
        notification.appendChild(messageSpan);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
        
        notification.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });
        return;
    }
    
    const notification = document.createElement('div');
    notification.id = 'card-pool-notification';
    
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
    const borderColor = isSuccess ? 'rgba(16, 185, 129, 0.7)' : 'rgba(220, 38, 38, 0.8)';
    const icon = isSuccess ? '✓' : '✗';
    
    notification.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        z-index: 10002;
        background: ${bgColor};
        border: 1px solid ${borderColor};
        color: #ffffff;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 8px;
        transition: transform 0.3s ease;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        max-width: 300px;
        word-wrap: break-word;
        pointer-events: auto;
    `;
    
    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    iconSpan.style.cssText = `
        font-size: 16px;
        font-weight: 700;
        min-width: 16px;
        text-align: center;
    `;
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    notification.appendChild(iconSpan);
    notification.appendChild(messageSpan);
    
    dialogContent.style.position = 'relative';
    dialogContent.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, duration);
    
    notification.addEventListener('click', () => {
        notification.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

app.registerExtension({
    name: "zhihui.PromptCardSelector",
    async beforeRegisterNodeDef(nodeType, nodeData, app_) {
        if (nodeData.name !== "PromptCardSelector") return;
        const prevOnNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function(){
            const r = prevOnNodeCreated ? prevOnNodeCreated.apply(this, arguments) : undefined;
            return r;
        };
        const prevOnExecuted = nodeType.prototype.onExecuted;
        nodeType.prototype.onExecuted = function(data){
            if (prevOnExecuted) prevOnExecuted.apply(this, arguments);
        };
    },
    nodeCreated(node){
        if (node.comfyClass === "PromptCardSelector"){
            const btn = node.addWidget("button", "🗃️卡池管理器·Card Pool Manager", "open_card_pool", () => openPromptCardPool(node));
            btn.serialize = false;
        }
    }
});

let dialog = null; let currentNode = null; let keyboardBlockHandler = null;

function disableMainUIInteraction() {
    let modalOverlay = document.getElementById('card-pool-modal-overlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'card-pool-modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.3);
            z-index: 9998;
            pointer-events: all;
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
            transition: opacity 0.2s ease-in-out;
        `;
        
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeDialog();
            }
        });
        
        document.body.appendChild(modalOverlay);
    }
    
    modalOverlay.style.opacity = '0';
    modalOverlay.style.display = 'block';
    setTimeout(() => {
        modalOverlay.style.opacity = '1';
    }, 10);
    
    const interactiveElements = document.querySelectorAll(
        'button:not([id*="card-pool"]):not([data-card-pool-ignore]), input:not([id*="card-pool"]):not([data-card-pool-ignore]), select:not([id*="card-pool"]):not([data-card-pool-ignore]), textarea:not([id*="card-pool"]):not([data-card-pool-ignore]), a[href]:not([id*="card-pool"]):not([data-card-pool-ignore]), [onclick]:not([id*="card-pool"]):not([data-card-pool-ignore]), [contenteditable="true"]:not([id*="card-pool"]):not([data-card-pool-ignore])'
    );
    
    interactiveElements.forEach(element => {
        if (!dialog || !dialog.contains(element)) {
            element.dataset.originalTabIndex = element.tabIndex;
            element.dataset.originalPointerEvents = element.style.pointerEvents;
            element.dataset.originalUserSelect = element.style.userSelect;
            
            element.tabIndex = -1;
            element.style.pointerEvents = 'none';
            element.style.userSelect = 'none';
            
            if (element.tagName === 'BUTTON' || element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
                element.dataset.originalDisabled = element.disabled;
                element.disabled = true;
            }
            
            element.dataset.cardPoolDisabled = 'true';
        }
    });
    
    if (!keyboardBlockHandler) {
        keyboardBlockHandler = function(e) {
            const target = e.target;
            const isTextInput = target && (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.contentEditable === 'true'
            );
            
            if (isTextInput && (e.ctrlKey || e.metaKey)) {
                const allowedKeys = ['c', 'v', 'x', 'a', 'z']; // Copy, Paste, Cut, Select All, Undo
                if (allowedKeys.includes(e.key.toLowerCase())) {
                    return true;
                }
            }
            
            if (e.ctrlKey || e.metaKey) {
                const blockedKeys = ['s', 'o', 'n', 'r', 'y'];
                if (blockedKeys.includes(e.key.toLowerCase())) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }
            
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            
            if (e.key === 'F5') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };
        
        document.addEventListener('keydown', keyboardBlockHandler, true);
    }
}

function enableMainUIInteraction() {
    const modalOverlay = document.getElementById('card-pool-modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.opacity = '0';
        setTimeout(() => {
            modalOverlay.style.display = 'none';
        }, 200);
    }
    
    const interactiveElements = document.querySelectorAll('[data-card-pool-disabled="true"]');
    
    interactiveElements.forEach(element => {
        if (element.dataset.originalTabIndex !== undefined) {
            element.tabIndex = element.dataset.originalTabIndex;
            delete element.dataset.originalTabIndex;
        }
        
        if (element.dataset.originalPointerEvents !== undefined) {
            element.style.pointerEvents = element.dataset.originalPointerEvents;
            delete element.dataset.originalPointerEvents;
        }
        
        if (element.dataset.originalUserSelect !== undefined) {
            element.style.userSelect = element.dataset.originalUserSelect;
            delete element.dataset.originalUserSelect;
        }
        
        if (element.dataset.originalDisabled !== undefined) {
            element.disabled = element.dataset.originalDisabled === 'true';
            delete element.dataset.originalDisabled;
        }
        
        delete element.dataset.cardPoolDisabled;
    });
    
    if (keyboardBlockHandler) {
        document.removeEventListener('keydown', keyboardBlockHandler, true);
        keyboardBlockHandler = null;
    }
}

function cleanupCardPoolModal() {
    const modalOverlay = document.getElementById('card-pool-modal-overlay');
    if (modalOverlay) {
        modalOverlay.remove();
    }
    
    const disabledElements = document.querySelectorAll('[data-card-pool-disabled="true"]');
    disabledElements.forEach(element => {

        if (element.dataset.originalTabIndex !== undefined) {
            element.tabIndex = element.dataset.originalTabIndex;
        }
        if (element.dataset.originalPointerEvents !== undefined) {
            element.style.pointerEvents = element.dataset.originalPointerEvents;
        }
        if (element.dataset.originalUserSelect !== undefined) {
            element.style.userSelect = element.dataset.originalUserSelect;
        }
        if (element.dataset.originalDisabled !== undefined) {
            element.disabled = element.dataset.originalDisabled === 'true';
        }
        
        delete element.dataset.originalTabIndex;
        delete element.dataset.originalPointerEvents;
        delete element.dataset.originalUserSelect;
        delete element.dataset.originalDisabled;
        delete element.dataset.cardPoolDisabled;
    });
    
    if (keyboardBlockHandler) {
        document.removeEventListener('keydown', keyboardBlockHandler, true);
        keyboardBlockHandler = null;
    }
}

window.addEventListener('beforeunload', cleanupCardPoolModal);
window.addEventListener('pagehide', cleanupCardPoolModal);

async function openPromptCardPool(node){
    currentNode = node;
    if (!dialog) createDialog();
    dialog.style.display = 'block';
    disableMainUIInteraction();
}

function createDialog(){
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:10000;display:none;backdrop-filter:blur(10px)`;
    const box = document.createElement('div');
    const sh = window.innerHeight, sw = window.innerWidth; const h = Math.min(sh*0.92, 980); const w = Math.min(sw*0.92, h*(16/10)); const left=(sw-w)/2, top=(sh-h)/2;
    box.style.cssText = `position:fixed;top:${top}px;left:${left}px;width:${w}px;height:${h}px;min-width:900px;min-height:600px;background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);border:2px solid rgb(19,101,201);border-radius:16px;box-shadow:0 0 24px rgba(96,165,250,.7),0 0 60px rgba(96,165,250,.4);z-index:10001;display:flex;flex-direction:column;overflow:hidden`;
    const header = document.createElement('div'); header.style.cssText = `background:rgb(34,77,141);padding:6px 4px;display:flex;align-items:center;justify-content:space-between;border-radius:16px 16px 0 0;gap:16px`;
    const title = document.createElement('span'); title.textContent = '🗃️卡池管理器'; title.style.cssText = `color:#f1f5f9;font-size:18px;font-weight:600;margin-left:15px`;
    const closeBtn = document.createElement('button'); closeBtn.textContent = '×';
    applyStyles(closeBtn, { ...commonStyles.button.base, ...commonStyles.button.danger, padding:'0', width:'22px', height:'22px', fontSize:'18px', fontWeight:'700', lineHeight:'22px', margin:'4px 8px 4px 0' });
    setupButtonHover(closeBtn, commonStyles.button.danger, commonStyles.button.dangerHover);
    closeBtn.onclick = () => { overlay.style.display = 'none'; enableMainUIInteraction(); cleanupCardPoolModal(); };
    
    overlay.onclick = (e) => {
        e.stopPropagation();
    };
    const tabs = document.createElement('div'); tabs.style.cssText = `display:flex;gap:6px;margin:8px 12px`;
    const tabFiles = document.createElement('button'); tabFiles.textContent = '提示词卡池设置';
    const tabManage = document.createElement('button'); tabManage.textContent = '提示词卡池编辑';
    const inactiveStyle = { ...commonStyles.button.base, background:'linear-gradient(135deg,#6b7280 0%,#4b5563 100%)', borderColor:'rgba(107,114,128,0.7)', color:'#fff' };
    const activeStyle = { ...commonStyles.button.base, ...commonStyles.button.primary };
    const hoverStyle = { ...commonStyles.button.base, ...commonStyles.button.primaryHover };
    function setupTab(el){
        applyStyles(el, inactiveStyle);
        el.dataset.active = 'false';
        el.onmouseenter = () => applyStyles(el, activeStyle);
        el.onmouseleave = () => { if (el.dataset.active === 'true') { applyStyles(el, activeStyle); } else { applyStyles(el, inactiveStyle); } };
    }
    setupTab(tabFiles);
    setupTab(tabManage);
    const content = document.createElement('div'); content.style.cssText = `flex:1;overflow:auto;padding:6px 8px;position:relative`;
    header.appendChild(title); header.appendChild(closeBtn);
    const statusBar = document.createElement('div'); statusBar.style.cssText = `display:flex;gap:8px;margin:4px 12px 0 12px;align-items:center`;
    box.appendChild(header); box.appendChild(tabs); box.appendChild(statusBar); box.appendChild(content);
    overlay.appendChild(box); document.body.appendChild(overlay);
    dialog = overlay; dialog.content = content; dialog.tabFiles = tabFiles; dialog.tabManage = tabManage; dialog.statusBar = statusBar; dialog.tabs = tabs; tabs.appendChild(tabFiles); tabs.appendChild(tabManage);
    function setActiveTab(which){
        if (which === 'files'){
            tabFiles.dataset.active = 'true'; tabManage.dataset.active = 'false';
            applyStyles(tabFiles, activeStyle); applyStyles(tabManage, inactiveStyle);
            tabFiles.disabled = true; tabManage.disabled = false;
            showPromptCardPoolFiles();
        } else {
            tabFiles.dataset.active = 'false'; tabManage.dataset.active = 'true';
            applyStyles(tabFiles, inactiveStyle); applyStyles(tabManage, activeStyle);
            tabFiles.disabled = false; tabManage.disabled = true;
            showPromptCardPoolManage();
        }
    }
    tabFiles.onclick = () => setActiveTab('files');
    tabManage.onclick = () => setActiveTab('manage');
    tabFiles.click();
}

async function fetchPromptCards(){ try { const res = await fetch('/zhihui/prompt_cards'); const data = await res.json(); return Array.isArray(data.files) ? data.files : []; } catch(e){ return []; } }
async function fetchPromptCardContent(name, source){ try { const src = source || 'system'; const res = await fetch(`/zhihui/prompt_card?name=${encodeURIComponent(name)}&source=${encodeURIComponent(src)}`); const data = await res.json(); let content = data.content || '';
    return content; } catch(e){ return ''; } }
async function savePromptCard(name, content, source, confirm){ const res = await fetch('/zhihui/prompt_cards', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name, content, source: source||'user', confirm }) }); return res.ok; }
async function deletePromptCard(name, source, confirm){ const res = await fetch('/zhihui/prompt_cards', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name, source: source||'user', confirm }) }); return res.ok; }
async function selectPromptCards(params){ const res = await fetch('/zhihui/prompt_cards/select', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(params) }); return await res.json(); }
async function getPromptCardSettings(){ try { const res = await fetch('/zhihui/prompt_cards/settings'); const data = await res.json(); return data && typeof data === 'object' ? data : {}; } catch(e){ return {}; } }
async function savePromptCardSettings(st){ try { const res = await fetch('/zhihui/prompt_cards/settings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(st||{}) }); return res.ok; } catch(e){ return false; } }

async function backupUserPromptCards() {
    try {
        const allCards = await fetchPromptCards();
        const userCards = allCards.filter(card => card.source === 'user');
        
        if (userCards.length === 0) {
            showNotification('没有用户卡池文件可备份', 'error', 3000);
            return;
        }
        
        if (!window.JSZip) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = () => performBackup(userCards);
            script.onerror = () => {
                showNotification('无法加载压缩库，使用直接下载', 'error');
                performDirectDownload(userCards);
            };
            document.head.appendChild(script);
        } else {
            performBackup(userCards);
        }
    } catch(e) {
        showNotification('备份失败：' + e.message, 'error');
    }
}

async function performBackup(userCards) {
    try {
        const JSZip = window.JSZip;
        const zip = new JSZip();
        let successCount = 0;
        
        for (const card of userCards) {
            try {
                const content = await fetchPromptCardContent(card.name, card.source);
                const filePath = card.name.endsWith('.txt') ? card.name : card.name + '.txt';
                zip.file(filePath, content);
                successCount++;
            } catch(e) {
                console.warn(`备份文件 ${card.name} 失败:`, e);
            }
        }
        
        if (successCount === 0) {
            showNotification('没有文件被成功备份', 'error');
            return;
        }
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const filename = `PromptCards_Backup_${timestamp}.zip`;
        
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        showNotification(`成功备份 ${successCount} 个文件`, 'success', 3000);
    } catch(e) {
        showNotification('备份失败：' + e.message, 'error');
    }
}

async function performDirectDownload(userCards) {
    try {
        for (const card of userCards) {
            const content = await fetchPromptCardContent(card.name, card.source);
            const filename = (card.name.split('/').pop() || 'card') + '.txt';
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 200);
        }
        showNotification(`已下载 ${userCards.length} 个文件`, 'success');
    } catch(e) {
        showNotification('下载失败：' + e.message, 'error');
    }
}

async function showPromptCardPoolFiles(){
    const container = dialog.content; container.innerHTML = '';
    const controlsPanel = document.createElement('div'); controlsPanel.style.cssText = `display:flex;flex-direction:column;gap:8px;margin:6px 4px 16px 4px;padding:8px;border:1px solid rgba(34,197,94,0.35);border-radius:8px;background:rgba(34,197,94,0.08)`;
    const modeSel = document.createElement('select'); modeSel.innerHTML = `<option value="random" selected>随机抽取</option><option value="sequential">顺序抽取</option>`; modeSel.style.cssText = `background:#1f2937;color:#e5e7eb;border:1px solid #3b82f6;border-radius:6px;padding:4px 8px`;
    const splitSel = document.createElement('select'); splitSel.innerHTML = `<option value="auto" selected>自动</option><option value="blankline">空白行</option><option value="newline">换行符</option>`; splitSel.style.cssText = `background:#1f2937;color:#e5e7eb;border:1px solid #3b82f6;border-radius:6px;padding:4px 8px`;
    const loadModeSel = document.createElement('select'); loadModeSel.innerHTML = `<option value="single" selected>单卡池</option><option value="multi">多卡池</option>`; loadModeSel.style.cssText = `background:#1f2937;color:#e5e7eb;border:1px solid #3b82f6;border-radius:6px;padding:4px 8px`;
    const shuffleSel = document.createElement('select'); shuffleSel.innerHTML = `<option value="random">随机轮换</option><option value="sequential">顺序轮换</option>`; shuffleSel.style.cssText = `background:#1f2937;color:#e5e7eb;border:1px solid #3b82f6;border-radius:6px;padding:4px 8px`;
    if (dialog.searchContainer){ try { dialog.searchContainer.remove(); } catch(_){} }
    if (dialog.filesStatusBar){ try { dialog.filesStatusBar.remove(); } catch(_){} }
    const filterInput = document.createElement('input'); filterInput.type='text'; filterInput.placeholder='搜索'; filterInput.style.cssText = `width:220px;min-width:180px;background:#1f2937;color:#e7e7eb;border:1px solid #3b82f6;border-radius:6px;padding:0 10px 0 26px;height:24px;font-size:13px`;
    const searchContainer = document.createElement('div'); searchContainer.style.cssText = `display:flex;align-items:center;gap:8px;margin:0`;
    const searchBox = document.createElement('div'); searchBox.style.cssText = `position:relative;display:flex;align-items:center`;
    const searchIcon = document.createElement('span'); searchIcon.textContent = '🔍'; searchIcon.style.cssText = `position:absolute;left:8px;top:50%;transform:translateY(-50%);font-size:13px;color:#93c5fd;pointer-events:none`;
    searchBox.appendChild(searchIcon); searchBox.appendChild(filterInput); searchContainer.appendChild(searchBox);
    dialog.searchContainer = searchContainer; dialog.searchInput = filterInput; try { searchContainer.style.marginLeft = 'auto'; } catch(_){}
    const labelStyle = `display:block;margin:0 0 2px 2px;color:#93c5fd;font-size:12px;font-weight:600`;
    const wrap = (labelText, el, grow=false) => { const w = document.createElement('div'); w.style.cssText = `display:flex;flex-direction:column;gap:2px${grow?';flex:1;':''}`; const lb = document.createElement('span'); lb.textContent = labelText; lb.style.cssText = labelStyle; w.appendChild(lb); w.appendChild(el); return w; };
    const confirmBtn = document.createElement('button'); confirmBtn.textContent = '确认设定';
    applyStyles(confirmBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#059669 0%,#047857 100%)', borderColor:'rgba(16,185,129,0.7)', color:'#fff' });
    const confirmBtnNormalStyle = { background:'linear-gradient(135deg,#059669 0%,#047857 100%)', borderColor:'rgba(16,185,129,0.7)', color:'#fff' };
    const confirmBtnHoverStyle = { background:'linear-gradient(135deg,#10b981 0%,#059669 100%)', borderColor:'rgba(16,185,129,0.6)', color:'#fff', boxShadow:'0 2px 4px rgba(16,185,129,0.25), 0 1px 2px rgba(0,0,0,0.1)' };
    setupButtonHover(confirmBtn, confirmBtnNormalStyle, confirmBtnHoverStyle);

    const countBadge = document.createElement('span'); countBadge.textContent = '已选: 0'; countBadge.style.cssText = `display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 8px;background:rgba(59,130,246,0.10);color:#93c5fd;border:1px solid rgba(59,130,246,0.35);border-radius:6px;font-size:12px`;
    const searchReport = document.createElement('span'); searchReport.textContent = ''; searchReport.style.cssText = `display:inline-flex;visibility:hidden;align-items:center;justify-content:center;gap:6px;height:22px;min-width:120px;padding:0 10px;background:rgba(59,130,246,0.08);color:#e5e7eb;border:1px solid rgba(59,130,246,0.35);border-radius:8px;font-size:12px;white-space:nowrap`;
    const selAllBtn = document.createElement('button'); selAllBtn.textContent = '全选'; applyStyles(selAllBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#6b7280 0%,#4b5563 100%)', borderColor:'rgba(107,114,128,0.7)', color:'#fff', height:'24px', padding:'2px 8px', fontSize:'12px' });
    const invertBtn = document.createElement('button'); invertBtn.textContent = '反选'; applyStyles(invertBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#6b7280 0%,#4b5563 100%)', borderColor:'rgba(107,114,128,0.7)', color:'#fff', height:'24px', padding:'2px 8px', fontSize:'12px' });
    const clearBtn = document.createElement('button'); clearBtn.textContent = '清除'; applyStyles(clearBtn, { ...commonStyles.button.base, ...commonStyles.button.danger, height:'24px', padding:'2px 8px', fontSize:'12px' });

    const rowTop = document.createElement('div'); rowTop.style.cssText = `display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap`;
    const rowTopLeft = document.createElement('div'); rowTopLeft.style.cssText = `display:flex;align-items:center;gap:8px`;
    const rowTopRight = document.createElement('div'); rowTopRight.style.cssText = `display:flex;align-items:center;gap:8px`;
    try { searchContainer.insertBefore(searchReport, searchBox); } catch(_) { searchContainer.appendChild(searchReport); } rowTop.appendChild(rowTopLeft); rowTop.appendChild(rowTopRight);

    const rowBottom = document.createElement('div'); rowBottom.style.cssText = `display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap`;
    const bottomLeft = document.createElement('div'); bottomLeft.style.cssText = `display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap`;
    const bottomRight = document.createElement('div'); bottomRight.style.cssText = `display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;justify-content:flex-end;flex:1`;
    const shuffleWrap = wrap('卡池洗牌逻辑', shuffleSel);
    bottomLeft.appendChild(wrap('卡池载入模式', loadModeSel)); bottomLeft.appendChild(shuffleWrap); bottomLeft.appendChild(wrap('提示词抽取方式', modeSel)); bottomLeft.appendChild(wrap('分段识别依据', splitSel));
    
    rowBottom.appendChild(bottomLeft); rowBottom.appendChild(bottomRight);

    controlsPanel.appendChild(rowTop); controlsPanel.appendChild(rowBottom); container.appendChild(controlsPanel);
    const tagsFrame = document.createElement('div'); tagsFrame.style.cssText = `margin:6px 4px;padding:0 12px 10px 12px;border:1px solid rgba(59,130,246,0.35);border-radius:8px;background:rgba(59,130,246,0.10)`; container.appendChild(tagsFrame);
    const tagsHeader = document.createElement('div'); tagsHeader.style.cssText = `width:100%;margin:12px 0 8px 0;padding:0;color:#93c5fd;font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:space-between;gap:12px`; tagsFrame.appendChild(tagsHeader);
    const tagsHeaderLeft = document.createElement('div'); tagsHeaderLeft.style.cssText = `display:flex;align-items:center;gap:8px;flex:1`;
    const tagsTitle = document.createElement('span'); tagsTitle.textContent='提示词卡池';
    
    const totalFilesSpan = document.createElement('span');
    totalFilesSpan.id = 'poolTotalFilesCount';
    totalFilesSpan.textContent = '文件总数: 0';
    totalFilesSpan.style.cssText = 'background:linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);color:#1f1203;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;margin-left:8px;box-shadow:0 2px 4px rgba(0,0,0,0.2);';
    
    tagsHeaderLeft.appendChild(tagsTitle); tagsHeaderLeft.appendChild(totalFilesSpan); tagsHeaderLeft.appendChild(countBadge); tagsHeader.appendChild(tagsHeaderLeft);
    const selectedTools = document.createElement('div'); selectedTools.style.cssText = `display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-left:14px`;
    selectedTools.appendChild(selAllBtn); selectedTools.appendChild(invertBtn); selectedTools.appendChild(clearBtn);
    tagsHeaderLeft.appendChild(selectedTools);
    const tagsHeaderCenter = document.createElement('div'); tagsHeaderCenter.style.cssText = `display:flex;align-items:center;justify-content:center;flex:1`;
    tagsHeaderCenter.appendChild(searchContainer);
    const tagsHeaderRight = document.createElement('div'); tagsHeaderRight.style.cssText = `flex:1`;
    tagsHeader.appendChild(tagsHeaderCenter);
    tagsHeader.appendChild(tagsHeaderRight);
    const listWrap = document.createElement('div'); listWrap.style.cssText = `display:flex;flex-wrap:wrap;gap:6px;margin-top:0`; tagsFrame.appendChild(listWrap);
    const usageToggleBar = document.createElement('div');
    usageToggleBar.style.cssText = `margin:10px 4px 4px 4px;display:flex;align-items:center;gap:10px`;
    const usageToggleLabel = document.createElement('span');
    usageToggleLabel.textContent = '📘 使用说明';
    usageToggleLabel.style.cssText = `color:#93c5fd;font-weight:800`;
    const usageToggleBtn = document.createElement('button');
    usageToggleBtn.textContent = '展开说明';
    applyStyles(usageToggleBtn, { ...commonStyles.button.base, ...commonStyles.button.primary, height:'24px', padding:'2px 10px', fontSize:'12px' }); setupButtonHover(usageToggleBtn, commonStyles.button.primary, commonStyles.button.primaryHover);
    usageToggleBar.appendChild(usageToggleLabel); usageToggleBar.appendChild(usageToggleBtn); container.appendChild(usageToggleBar);
    const usageTips = document.createElement('div');
    usageTips.style.cssText = `margin:8px 4px 90px 4px;padding:14px 14px;color:#e5e7eb;background:linear-gradient(135deg, rgba(30,58,138,0.30) 0%, rgba(2,6,23,0.60) 100%);border:1px solid rgba(59,130,246,0.45);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.35);font-size:12px;line-height:1.7`;
    usageTips.innerHTML = `
    <div style=\"display:flex;align-items:center;gap:8px;margin-bottom:10px\">
        <span style=\"display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:#3b82f6;color:#0b1220;font-weight:800\">i</span>
        <span style=\"color:#93c5fd;font-weight:800;font-size:14px\">提示词卡池设置指南</span>
    </div>
    <div style=\"display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px\">
        <div style=\"border:1px solid rgba(59,130,246,0.35);border-radius:10px;padding:10px;background:rgba(30,64,175,0.15)\">
            <div style=\"color:#60a5fa;font-weight:700;margin-bottom:6px;font-size:13px\">卡池载入模式</div>
            <div><span style=\"display:inline-block;padding:2px 8px;border-radius:10px;background:#22c55e;color:#082911;font-weight:700;margin-right:6px\">单卡池</span>仅可选择一个卡池；当为单卡池时，<span style=\"color:#fca5a5;font-weight:700\">卡池洗牌逻辑隐藏且不生效</span>。</div>
            <div style=\"margin-top:6px\"><span style=\"display:inline-block;padding:2px 8px;border-radius:10px;background:#f59e0b;color:#1f1203;font-weight:700;margin-right:6px\">多卡池</span>可选择多个卡池，并可配置卡池洗牌逻辑。</div>
            <div style=\"margin-top:6px;color:#e5e7eb;font-size:12px\">⚠️单卡池模式下每次仅能选中一个卡条目，<b>全选/反选</b>不可用；点击新卡条目会清空其他选择。</div>
        </div>
        <div style=\"border:1px solid rgba(147,51,234,0.35);border-radius:10px;padding:10px;background:rgba(88,28,135,0.18)\">
            <div style=\"color:#c084fc;font-weight:700;margin-bottom:6px;font-size:13px\">卡池洗牌逻辑</div>
            <div style=\"margin-top:6px\"><span style=\"display:inline-block;padding:2px 8px;border-radius:10px;background:#22c55e;color:#082911;font-weight:700;margin-right:6px\">随机轮换</span>从已经点选的多个卡池文件中按随机顺序切换文件读取。</div>
            <div style=\"margin-top:6px\"><span style=\"display:inline-block;padding:2px 8px;border-radius:10px;background:#f59e0b;color:#1f1203;font-weight:700;margin-right:6px\">顺序轮换</span>从已经点选的多个卡池文件中保持固定顺序切换文件读取。</div>
            <div style=\"margin-top:6px;color:#e5e7eb;font-size:12px\">⚠️仅在多卡池模式下显示。</div>
        </div>
        <div style=\"border:1px solid rgba(34,197,94,0.35);border-radius:10px;padding:10px;background:rgba(20,83,45,0.18)\">
            <div style=\"color:#86efac;font-weight:700;margin-bottom:6px;font-size:13px\">提示词抽取方式</div>
            <div><span style=\"display:inline-block;padding:2px 8px;border-radius:10px;background:#22c55e;color:#082911;font-weight:700;margin-right:6px\">随机抽取</span>从卡池文件的内容中随机抽取预定段落的提示词。</div>
            <div style=\"margin-top:6px\"><span style=\"display:inline-block;padding:2px 8px;border-radius:10px;background:#f59e0b;color:#1f1203;font-weight:700;margin-right:6px\">顺序抽取</span>从卡池文件的内容中按文本段落顺序抽取。</div>
        </div>
        <div style=\"border:1px solid rgba(234,179,8,0.35);border-radius:10px;padding:10px;background:rgba(66,32,6,0.18)\">
            <div style=\"color:#fbbf24;font-weight:700;margin-bottom:6px;font-size:13px\">分段识别依据</div>
            <div><span style=\"display:inline-block;padding:2px 8px;border-radius:10px;background:#22c55e;color:#082911;font-weight:700;margin-right:6px\">空白行</span>适合按段落组织的卡池内容。</div>
            <div style=\"margin-top:6px\"><span style=\"display:inline-block;padding:2px 8px;border-radius:10px;background:#f59e0b;color:#1f1203;font-weight:700;margin-right:6px\">换行符</span>适合按行组织的卡池内容。</div>
            <div style=\"margin-top:6px\"><span style=\"display:inline-block;padding:2px 8px;border-radius:10px;background:#a855f7;color:#160433;font-weight:700;margin-right:6px\">自动</span>自动识别，检测到空白行则按段落，否则按行，适合混合格式的卡池内容。</div>
        </div>
        
    </div>
    <div style=\"margin-top:12px;border-top:1px dashed rgba(59,130,246,0.35);padding-top:10px\">
        <div style=\"color:#93c5fd;font-weight:700;margin-bottom:6px\">使用流程示例</div>
        <div style=\"display:flex;flex-wrap:wrap;gap:8px\">
            <span style=\"display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:10px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.35)\"><b style=\"background:#22c55e;color:#082911;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center\">1</b> 选择卡池载入模式，必要时设置卡池洗牌逻辑</span>
            <span style=\"display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:10px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.35)\"><b style=\"background:#f59e0b;color:#1f1203;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center\">2</b> 选择提示词抽取方式与分段识别依据</span>
            <span style=\"display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:10px;background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.35)\"><b style=\"background:#3b82f6;color:#0b1220;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center\">3</b> 搜索并选择卡条目（悬停可预览内容）</span>
            <span style=\"display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:10px;background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.35)\"><b style=\"background:#818cf8;color:#0b1220;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center\">4</b> 点击“确认设定”，在运行节点时按设定抽取并输出</span>
        </div>
    </div>
    
    `;
    usageTips.style.display = 'none';
    usageToggleBtn.onclick = () => { const vis = usageTips.style.display !== 'none'; usageTips.style.display = vis ? 'none' : ''; usageToggleBtn.textContent = vis ? '展开说明' : '收起说明'; };
    container.appendChild(usageTips);
    const footer = document.createElement('div'); footer.style.cssText = `position:absolute;right:12px;bottom:12px;display:flex;gap:8px`; footer.appendChild(confirmBtn); container.appendChild(footer);
    let all = []; let selected = new Map(); const chipIndex = new Map(); let currentKeyword = '';
    const keyOf = (item) => `${item.source}|${item.name}`;
    const markSelected = (chip, isSel) => {
        if (!chip) return;
        chip.style.background = isSel ? 'linear-gradient(135deg,#a855f7 0%,#9333ea 100%)' : '#444';
        chip.style.color = isSel ? '#fff' : '#ccc';
        chip.style.border = isSel ? '1px solid rgba(168,85,247,0.8)' : '1px solid #6aa1f3';
    };
    const updateSelectedCount = () => { countBadge.textContent = `已选: ${selected.size}`; };
    const refresh = async () => {
        all = await fetchPromptCards(); listWrap.innerHTML = ''; chipIndex.clear();
        
        const poolTotalFilesSpan = document.getElementById('poolTotalFilesCount');
        if (poolTotalFilesSpan) {
            poolTotalFilesSpan.textContent = `文件总数: ${all.length}`;
        }
        
        currentKeyword = (filterInput.value || '').trim().toLowerCase();
        const files = all.filter(item => { const name = item.name || ''; const displayName = name.split('/').pop().replace(/\.txt$/i, ''); return !currentKeyword || name.toLowerCase().includes(currentKeyword) || displayName.toLowerCase().includes(currentKeyword); });
        if (currentKeyword){ searchReport.style.visibility = 'visible'; searchReport.textContent = files.length > 0 ? `搜索结果：${files.length} 条` : '未找到结果'; } else { searchReport.style.visibility = 'hidden'; searchReport.textContent = ''; }
        if (files.length === 0){ listWrap.innerHTML = ''; const empty = document.createElement('div'); empty.textContent = '无结果'; empty.style.cssText = `display:flex;align-items:center;justify-content:center;margin:10px;padding:12px;color:#e5e7eb;background:rgba(107,114,128,0.15);border:1px solid rgba(107,114,128,0.35);border-radius:8px;font-size:13px`; listWrap.appendChild(empty); updateSelectedCount(); return; }
        const groups = {}; files.forEach(item => { const parts = (item.name||'').split('/'); const g = parts.length>1 ? parts[0] : '根目录'; (groups[g] = groups[g] || []).push(item); });
        Object.keys(groups).sort().forEach(groupName => {
            const title = document.createElement('div'); title.textContent = groupName; title.style.cssText = `width:100%;margin:8px 0 4px 0;color:#93c5fd;border-bottom:1px solid rgba(59,130,246,0.35);font-size:12px`; if (groupName==='NSFW'){ title.style.color='#f87171'; title.style.borderBottom='1px solid rgba(248,113,113,0.35)'; } else if (groupName==='SFW'){ title.style.color='#22c55e'; title.style.borderBottom='1px solid rgba(34,197,94,0.35)'; }
            listWrap.appendChild(title);
            groups[groupName].sort((a,b)=> (a.name||'').localeCompare(b.name||'' )).forEach(item => {
                const chip = document.createElement('span'); chip.style.cssText = `display:inline-flex;align-items:center;gap:4px;padding:6px 12px;background:#444;color:#ccc;border-radius:16px;cursor:pointer;border:1px solid #6aa1f3;font-size:14px`;
                const prefix = document.createElement('span'); prefix.textContent = item.source === 'user' ? '用户' : '预置'; prefix.style.cssText = `display:inline-block;padding:0 6px;border-radius:10px;font-size:12px;font-weight:700;color:#fff;${item.source==='user' ? 'background:#22c55e;border:1px solid rgba(34,197,94,0.6);' : 'background:#2563eb;border:1px solid rgba(59,130,246,0.6);'}`;
                const displayName = (item.name||'').split('/').pop().replace(/\.txt$/i, ''); const nameSpan = document.createElement('span'); nameSpan.textContent = displayName;
                chip.appendChild(prefix); chip.appendChild(nameSpan);
                const key = keyOf(item);
                chip.dataset.key = key; chipIndex.set(key, chip);
                chip.onclick = async () => {
                    const isSingle = (loadModeSel.value || 'multi') === 'single';
                    if (isSingle){
                        const already = selected.has(key);

                        selected.clear(); chipIndex.forEach(ch => markSelected(ch, false));

                        if (!already){ selected.set(key, {name:item.name, source:item.source}); markSelected(chip, true); }
                        updateSelectedCount(); saveSettingsNow();
                    } else {
                        if (selected.has(key)) { selected.delete(key); markSelected(chip, false); } else { selected.set(key, {name:item.name, source:item.source}); markSelected(chip, true); }
                        updateSelectedCount(); saveSettingsNow();
                    }
                };
                chip.onmouseenter = async () => { chip.title = await fetchPromptCardContent(item.name, item.source); };
                markSelected(chip, selected.has(key));
                listWrap.appendChild(chip);
            });
        });
        updateSelectedCount();
    };
    const initSettings = await getPromptCardSettings();
    if (initSettings.mode) modeSel.value = initSettings.mode;
    if (initSettings.split_rule) splitSel.value = initSettings.split_rule;
    if (initSettings.load_mode) loadModeSel.value = initSettings.load_mode;
    shuffleSel.value = initSettings.pool_shuffle ? initSettings.pool_shuffle : 'sequential';
    const updateShuffleVisibility = () => { const isMulti = (loadModeSel.value || 'multi') === 'multi'; shuffleWrap.style.display = isMulti ? '' : 'none'; shuffleSel.disabled = !isMulti; };
    updateShuffleVisibility();
    const updateSelectionButtons = () => { const isMulti = (loadModeSel.value || 'multi') === 'multi'; [selAllBtn, invertBtn].forEach(btn => { btn.disabled = !isMulti; btn.style.opacity = isMulti ? '1' : '0.5'; btn.style.cursor = isMulti ? 'pointer' : 'not-allowed'; }); };
    updateSelectionButtons();
    if (Array.isArray(initSettings.selected)) { selected.clear(); initSettings.selected.forEach(it => { if (it && it.name){ selected.set(keyOf({name:it.name, source: it.source || 'system'}), {name: it.name, source: it.source || 'system'}); } }); }
    refresh();
    const onSearchInput = () => refresh();
    filterInput.addEventListener('input', onSearchInput);
    const saveSettingsNow = () => { const isMulti = (loadModeSel.value || 'multi') === 'multi'; savePromptCardSettings({ mode: modeSel.value, split_rule: splitSel.value, load_mode: loadModeSel.value, pool_shuffle: isMulti ? shuffleSel.value : 'sequential', selected: Array.from(selected.values()) }); };
    modeSel.onchange = saveSettingsNow; splitSel.onchange = saveSettingsNow; shuffleSel.onchange = saveSettingsNow;
    loadModeSel.onchange = () => { updateShuffleVisibility(); updateSelectionButtons(); saveSettingsNow(); const isSingle = (loadModeSel.value || 'multi') === 'single'; if (isSingle && selected.size > 1){ const firstKey = selected.keys().next().value; selected.clear(); chipIndex.forEach(ch => markSelected(ch, false)); if (firstKey){ const ch = chipIndex.get(firstKey); const parts = (firstKey||'').split('|'); const nm = parts[1]; const src = parts[0]; selected.set(firstKey, {name:nm, source:src}); markSelected(ch, true); } updateSelectedCount(); saveSettingsNow(); } };
    selAllBtn.onclick = () => {
        if (selAllBtn.disabled) return;
        const files = all.filter(item => { const name = item.name || ''; const displayName = name.split('/').pop().replace(/\.txt$/i, ''); return !currentKeyword || name.toLowerCase().includes(currentKeyword) || displayName.toLowerCase().includes(currentKeyword); });
        const isSingle = (loadModeSel.value || 'multi') === 'single';
        if (isSingle){
            selected.clear(); chipIndex.forEach(ch => markSelected(ch, false));
            const first = files[0]; if (first){ const k = keyOf(first); selected.set(k, {name:first.name, source:first.source}); markSelected(chipIndex.get(k), true); }
            updateSelectedCount(); saveSettingsNow; return;
        }
        files.forEach(item => { const k = keyOf(item); selected.set(k, {name:item.name, source:item.source}); const ch = chipIndex.get(k); markSelected(ch, true); }); updateSelectedCount(); saveSettingsNow();
    };
    invertBtn.onclick = () => {
        if (invertBtn.disabled) return;
        const files = all.filter(item => { const name = item.name || ''; const displayName = name.split('/').pop().replace(/\.txt$/i, ''); return !currentKeyword || name.toLowerCase().includes(currentKeyword) || displayName.toLowerCase().includes(currentKeyword); });
        const isSingle = (loadModeSel.value || 'multi') === 'single';
        if (isSingle){
            if (selected.size > 0){ selected.clear(); chipIndex.forEach(ch => markSelected(ch, false)); updateSelectedCount(); saveSettingsNow(); }
            else { const first = files[0]; if (first){ const k = keyOf(first); selected.set(k, {name:first.name, source:first.source}); markSelected(chipIndex.get(k), true); } updateSelectedCount(); saveSettingsNow(); }
            return;
        }
        files.forEach(item => { const k = keyOf(item); if (selected.has(k)) { selected.delete(k); markSelected(chipIndex.get(k), false); } else { selected.set(k, {name:item.name, source:item.source}); markSelected(chipIndex.get(k), true); } }); updateSelectedCount(); saveSettingsNow();
    };
    clearBtn.onclick = () => { selected.clear(); chipIndex.forEach(ch => markSelected(ch, false)); updateSelectedCount(); saveSettingsNow(); };
    
    const todayStr = new Date().toISOString().slice(0,10);
    const noSelNoticeKey = `zhihui_nodes_no_selection_notice_disabled_PromptCardSelector_${todayStr}`;
    let noSelNoticeOpen = false; let noSelNoticeDismissMs = 10000;
    const showNoSelectionNotice = () => {
        try {
            if (noSelNoticeOpen) return;
            if (window.localStorage.getItem(noSelNoticeKey)) return;
            noSelNoticeOpen = true;
            const overlay = document.createElement('div'); overlay.style.cssText = `position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,.45);z-index:9999;`;
            const dialog = document.createElement('div'); dialog.style.cssText = `position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:520px;background:var(--comfy-menu-bg);border:2px solid #4488ff;border-radius:8px;padding:16px;color:var(--input-text);z-index:10000;box-shadow:0 4px 20px rgba(0,0,0,0.3);`;
            dialog.innerHTML = `
                <h3 style="margin:0 0 10px 0;text-align:center;color:var(--input-text);">未选择提示词卡</h3>
                <div style="font-size:13px;color:var(--descrip-text);margin-bottom:12px;">当前未点选任何提示词卡条目，请先在卡池中选择。</div>
                <div style="display:flex;justify-content:center;gap:8px;align-items:center;">
                    <button id="notice-ok" style="background:#4488ff;border:1px solid #4488ff;color:#ffffff;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;">知道了</button>
                    <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--input-text);">
                        <input id="notice-disable" type="checkbox" style="accent-color:#22c55e;">本日内不再提示
                    </label>
                </div>
                <div style="text-align:center;margin-top:8px;font-size:12px;">此窗口将自动在 <span id="countdown-val" style="font-weight:600;color:#22c55e;">${(noSelNoticeDismissMs/1000)|0}</span> 秒后关闭</div>`;
            document.body.appendChild(overlay); document.body.appendChild(dialog);
            const close = () => { try { document.body.removeChild(dialog); document.body.removeChild(overlay); } catch(_){} noSelNoticeOpen = false; if (intervalId) { clearInterval(intervalId); intervalId = null; } };
            dialog.querySelector('#notice-ok')?.addEventListener('click', close);
            overlay.addEventListener('click', close);
            const disableEl = dialog.querySelector('#notice-disable');
            disableEl?.addEventListener('change', (e) => { if (e.target.checked) { try { window.localStorage.setItem(noSelNoticeKey, '1'); } catch(_){} } });
            const countdownEl = dialog.querySelector('#countdown-val');
            let remaining = noSelNoticeDismissMs;
            const colorFor = (ms) => { const s = Math.ceil(ms/1000); if (s > 4) return '#22c55e'; if (s > 2) return '#f59e0b'; return '#ef4444'; };
            let intervalId = setInterval(() => { remaining -= 1000; if (countdownEl){ countdownEl.textContent = String(Math.max(0, Math.ceil(remaining/1000))); countdownEl.style.color = colorFor(remaining); } if (remaining <= 0) close(); }, 1000);
            setTimeout(close, noSelNoticeDismissMs);
        } catch(_){}
    };
    confirmBtn.onclick = () => { saveSettingsNow(); if (selected.size === 0) { showNoSelectionNotice(); return; } alert('设定已保存'); };
}

function showPromptCardPoolManage(){
    const container = dialog.content; container.innerHTML = '';
    if (dialog.searchContainer){ try { dialog.searchContainer.remove(); } catch(_){} dialog.searchContainer = null; }
    if (dialog.filesStatusBar){ try { dialog.filesStatusBar.remove(); } catch(_){} dialog.filesStatusBar = null; }
    const form = document.createElement('div'); form.style.cssText = `display:flex;flex-direction:column;gap:6px;margin:6px 4px`;
    const nameInput = document.createElement('input'); nameInput.type='text'; nameInput.placeholder='文件名'; nameInput.style.cssText = `background:#1f2937;color:#e5e7eb;border:1px solid #3b82f6;border-radius:6px;padding:6px 6px;width:135px;min-width:135px;height:32px;line-height:20px`;
    const textarea = document.createElement('textarea'); textarea.placeholder='提示词卡内容'; textarea.style.cssText = `height:200px;background:#1f2937;color:#e5e7eb;border:1px solid #3b82f6;border-radius:6px;padding:8px;resize:none`;
    const btnRow = document.createElement('div'); btnRow.style.cssText = `display:flex;gap:6px;align-items:center;flex-wrap:wrap`;
    const saveBtn = document.createElement('button'); saveBtn.textContent = '保存'; applyStyles(saveBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#059669 0%,#047857 100%)', borderColor:'rgba(16,185,129,0.7)', color:'#fff', height:'32px', padding:'4px 10px', fontSize:'13px' });
    const delBtn = document.createElement('button'); delBtn.textContent = '删除'; applyStyles(delBtn, { ...commonStyles.button.base, ...commonStyles.button.danger, height:'32px', padding:'4px 10px', fontSize:'13px' });
    const cancelBtn = document.createElement('button'); cancelBtn.textContent = '取消'; applyStyles(cancelBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#334155 0%,#1f2937 100%)', borderColor:'rgba(100,116,139,0.8)', color:'#fff', height:'32px', padding:'4px 10px', fontSize:'13px' });
    const categorySel = document.createElement('select'); categorySel.innerHTML = `<option value="SFW">SFW</option><option value="NSFW">NSFW</option>`; categorySel.style.cssText = `background:#1f2937;color:#e5e7eb;border:1px solid #3b82f6;border-radius:6px;padding:6px 6px;height:32px;min-width:80px`;
    const editTools = document.createElement('div'); editTools.style.cssText = `display:flex;gap:4px;align-items:center;flex-wrap:wrap;padding:4px 6px;height:32px;border:1px solid rgba(59,130,246,0.35);border-radius:8px;background:rgba(59,130,246,0.10)`;
    const clearBtn = document.createElement('button'); clearBtn.textContent='清空'; applyStyles(clearBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#64748b 0%,#475569 100%)', borderColor:'rgba(148,163,184,0.6)', color:'#fff', height:'22px', padding:'2px 6px', fontSize:'12px' });
    const removeEmptyBtn = document.createElement('button'); removeEmptyBtn.textContent='去除空行'; applyStyles(removeEmptyBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#64748b 0%,#475569 100%)', borderColor:'rgba(148,163,184,0.6)', color:'#fff', height:'22px', padding:'2px 6px', fontSize:'12px' });
    const removeSpacesBtn = document.createElement('button'); removeSpacesBtn.textContent='去除空格'; applyStyles(removeSpacesBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#64748b 0%,#475569 100%)', borderColor:'rgba(148,163,184,0.6)', color:'#fff', height:'22px', padding:'2px 6px', fontSize:'12px' });
    const removeNewlinesBtn = document.createElement('button'); removeNewlinesBtn.textContent='去除换行'; applyStyles(removeNewlinesBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#64748b 0%,#475569 100%)', borderColor:'rgba(148,163,184,0.6)', color:'#fff', height:'22px', padding:'2px 6px', fontSize:'12px' });
    const trimEdgeSpacesBtn = document.createElement('button'); trimEdgeSpacesBtn.textContent='修剪首尾空格'; applyStyles(trimEdgeSpacesBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#64748b 0%,#475569 100%)', borderColor:'rgba(148,163,184,0.6)', color:'#fff', height:'22px', padding:'2px 6px', fontSize:'12px' });
    const addBlankLinesBtn = document.createElement('button'); addBlankLinesBtn.textContent='产生空行'; applyStyles(addBlankLinesBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#64748b 0%,#475569 100%)', borderColor:'rgba(148,163,184,0.6)', color:'#fff', height:'22px', padding:'2px 6px', fontSize:'12px' });
    const removeLineNumbersBtn = document.createElement('button'); removeLineNumbersBtn.textContent='去除序号'; applyStyles(removeLineNumbersBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#64748b 0%,#475569 100%)', borderColor:'rgba(148,163,184,0.6)', color:'#fff', height:'22px', padding:'2px 6px', fontSize:'12px' });
    const removeLeadingPunctBtn = document.createElement('button'); removeLeadingPunctBtn.textContent='去除段首标点'; applyStyles(removeLeadingPunctBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#64748b 0%,#475569 100%)', borderColor:'rgba(148,163,184,0.6)', color:'#fff', height:'22px', padding:'2px 6px', fontSize:'12px' });
    const listFrame = document.createElement('div'); listFrame.style.cssText = `margin:25px 4px 0 4px;padding:0 12px 10px 12px;border:1px solid rgba(59,130,246,0.35);border-radius:8px;background:rgba(59,130,246,0.10)`;
    const list = document.createElement('div'); list.style.cssText = `display:flex;flex-wrap:wrap;gap:4px;margin-top:0`;
    const inputRow = document.createElement('div'); inputRow.style.cssText = `display:flex;gap:6px;align-items:center`;

    const fileNameTitle = document.createElement('span');
    fileNameTitle.textContent = '🔞分级类型';
    fileNameTitle.style.cssText = `color:#93c5fd;font-size:13px;font-weight:600;white-space:nowrap;display:flex;align-items:center;height:32px;padding:0 2px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.35);border-radius:6px;min-width:100px;justify-content:center`;

    const authorInput = document.createElement('input');
    authorInput.type = 'text';
    authorInput.placeholder = '提供者';
    authorInput.style.cssText = `background:#1f2937;color:#e5e7eb;border:1px solid #3b82f6;border-radius:6px;padding:6px 6px;width:120px;min-width:120px;height:32px;line-height:20px`;

    const versionInput = document.createElement('input');
    versionInput.type = 'text';
    versionInput.placeholder = '版本号';
    versionInput.style.cssText = `background:#1f2937;color:#e5e7eb;border:1px solid #3b82f6;border-radius:6px;padding:6px 6px;width:60px;min-width:60px;height:32px;line-height:20px`;

    const authorTitle = document.createElement('span');
    authorTitle.textContent = '👩‍🎨提供者';
    authorTitle.style.cssText = `color:#93c5fd;font-size:13px;font-weight:600;white-space:nowrap;display:flex;align-items:center;height:32px;padding:0 2px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.35);border-radius:6px;min-width:80px;justify-content:center`;

    const versionTitle = document.createElement('span');
    versionTitle.textContent = '🏷️版本';
    versionTitle.style.cssText = `color:#93c5fd;font-size:13px;font-weight:600;white-space:nowrap;display:flex;align-items:center;height:32px;padding:0 2px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.35);border-radius:6px;min-width:60px;justify-content:center`;

    const fileInfoDisplay = document.createElement('div');
    fileInfoDisplay.id = 'fileInfoDisplay';
    fileInfoDisplay.style.cssText = `display:flex;align-items:center;gap:12px;margin-left:8px;padding:6px 10px;background:linear-gradient(135deg, rgba(30,58,138,0.25) 0%, rgba(2,6,23,0.4) 100%);border:1px solid rgba(59,130,246,0.5);border-radius:8px;color:#93c5fd;font-size:13px;min-width:220px;box-shadow:0 2px 4px rgba(0,0,0,0.15);`;
    
    const charCountContainer = document.createElement('div');
    charCountContainer.style.cssText = 'display:flex;align-items:center;gap:4px;';
    
    const charIcon = document.createElement('span');
    charIcon.textContent = '🔤';
    charIcon.style.cssText = 'font-size:14px;';
    
    const charCountSpan = document.createElement('span');
    charCountSpan.id = 'charCount';
    charCountSpan.textContent = '字符数: 0';
    charCountSpan.style.cssText = 'font-weight:600;';
    
    charCountContainer.appendChild(charIcon);
    charCountContainer.appendChild(charCountSpan);
    
    const wordCountContainer = document.createElement('div');
    wordCountContainer.style.cssText = 'display:flex;align-items:center;gap:4px;';
    
    const wordIcon = document.createElement('span');
    wordIcon.textContent = '📖';
    wordIcon.style.cssText = 'font-size:14px;';
    
    const wordCountSpan = document.createElement('span');
    wordCountSpan.id = 'wordCount';
       wordCountSpan.textContent = '词条数: 0';
    wordCountSpan.style.cssText = 'font-weight:600;';
    
    wordCountContainer.appendChild(wordIcon);
    wordCountContainer.appendChild(wordCountSpan);
    
    fileInfoDisplay.appendChild(charCountContainer);
    fileInfoDisplay.appendChild(wordCountContainer);
    
    inputRow.appendChild(fileNameTitle);
    inputRow.appendChild(categorySel);
    
    const spacer1 = document.createElement('div');
    spacer1.style.cssText = 'width:8px';
    inputRow.appendChild(spacer1);
    
    const nameTitle = document.createElement('span');
    nameTitle.textContent = '📄文件名';
    nameTitle.style.cssText = `color:#93c5fd;font-size:13px;font-weight:600;white-space:nowrap;display:flex;align-items:center;height:32px;padding:0 2px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.35);border-radius:6px;min-width:80px;justify-content:center`;
    inputRow.appendChild(nameTitle);
    inputRow.appendChild(nameInput);
    
    const spacer2 = document.createElement('div');
    spacer2.style.cssText = 'width:8px';
    inputRow.appendChild(spacer2);
    inputRow.appendChild(authorTitle);
    inputRow.appendChild(authorInput);
    
    const spacer3 = document.createElement('div');
    spacer3.style.cssText = 'width:8px';
    inputRow.appendChild(spacer3);
    inputRow.appendChild(versionTitle);
    inputRow.appendChild(versionInput);
    inputRow.appendChild(fileInfoDisplay);
    form.appendChild(inputRow);
    form.appendChild(textarea);
    btnRow.appendChild(saveBtn); btnRow.appendChild(cancelBtn); btnRow.appendChild(delBtn);
    editTools.appendChild(clearBtn); editTools.appendChild(removeEmptyBtn); editTools.appendChild(removeSpacesBtn); editTools.appendChild(removeNewlinesBtn); editTools.appendChild(trimEdgeSpacesBtn); editTools.appendChild(addBlankLinesBtn); editTools.appendChild(removeLineNumbersBtn); editTools.appendChild(removeLeadingPunctBtn);
    btnRow.appendChild(editTools); form.appendChild(btnRow); container.appendChild(form);

    const ioTools = document.createElement('div'); ioTools.style.cssText = `display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-left:8px`;
    const importBtn = document.createElement('button'); importBtn.textContent = '导入'; applyStyles(importBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#6b7280 0%,#4b5563 100%)', borderColor:'rgba(107,114,128,0.7)', color:'#fff', height:'32px', padding:'4px 10px', fontSize:'13px' });
    const exportBtn = document.createElement('button'); exportBtn.textContent = '导出'; applyStyles(exportBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#6b7280 0%,#4b5563 100%)', borderColor:'rgba(107,114,128,0.7)', color:'#fff', height:'32px', padding:'4px 10px', fontSize:'13px' });
    
    const backupBtn = document.createElement('button'); backupBtn.textContent = '备份用户词卡'; applyStyles(backupBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)', borderColor:'rgba(139,92,246,0.7)', color:'#fff', height:'32px', padding:'4px 12px', fontSize:'13px' }); setupButtonHover(backupBtn, { background:'linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)', borderColor:'rgba(139,92,246,0.7)', color:'#fff' }, { background:'linear-gradient(135deg,#a78bfa 0%,#8b5cf6 100%)', borderColor:'rgba(139,92,246,0.6)', color:'#fff', boxShadow:'0 2px 4px rgba(139,92,246,0.25), 0 1px 2px rgba(0,0,0,0.1)' });
    
    const importBackupBtn = document.createElement('button'); importBackupBtn.textContent = '导入词卡备份'; applyStyles(importBackupBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)', borderColor:'rgba(245,158,11,0.7)', color:'#fff', height:'32px', padding:'4px 12px', fontSize:'13px' }); setupButtonHover(importBackupBtn, { background:'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)', borderColor:'rgba(245,158,11,0.7)', color:'#fff' }, { background:'linear-gradient(135deg,#fbbf24 0%,#f59e0b 100%)', borderColor:'rgba(245,158,11,0.6)', color:'#fff', boxShadow:'0 2px 4px rgba(245,158,11,0.25), 0 1px 2px rgba(0,0,0,0.1)' });
    
    const importInput = document.createElement('input'); importInput.type = 'file'; importInput.accept = '.txt'; importInput.multiple = true; importInput.style.cssText = `display:none`;
    const importBackupInput = document.createElement('input'); importBackupInput.type = 'file'; importBackupInput.accept = '.zip'; importBackupInput.multiple = false; importBackupInput.style.cssText = `display:none`;
    importBtn.onclick = () => { importInput.click(); };
    importBackupBtn.onclick = () => { importBackupInput.click(); };
    
    importInput.onchange = async () => {
        const files = Array.from(importInput.files || []); if (!files.length) return;
        const tasks = files.map(f => new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve({ name: (f.name||'').replace(/\.txt$/i, ''), content: String(reader.result||'') }); reader.onerror = () => resolve({ name: (f.name||'').replace(/\.txt$/i, ''), content: '' }); reader.readAsText(f, 'utf-8'); }));
        const ov = document.createElement('div');
        ov.style.cssText = `position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,.4);z-index:10020;display:flex;align-items:center;justify-content:center`;
        const bx = document.createElement('div');
        bx.style.cssText = `min-width:320px;max-width:420px;background:#0f172a;border:1px solid rgba(59,130,246,.6);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.4);padding:16px;color:#e5e7eb;display:flex;flex-direction:column;gap:10px`;
        const title = document.createElement('div');
        title.textContent = '选择分类';
        title.style.cssText = `font-size:16px;font-weight:700;color:#93c5fd`;
        const sel = document.createElement('select');
        sel.innerHTML = `<option value="SFW">SFW</option><option value="NSFW">NSFW</option>`;
        sel.value = (categorySel.value || 'SFW');
        sel.style.cssText = `background:#1f2937;color:#e5e7eb;border:1px solid #3b82f6;border-radius:6px;padding:6px 8px;height:34px`;
        const btns = document.createElement('div');
        btns.style.cssText = `display:flex;gap:8px;justify-content:flex-end`;
        const okBtn = document.createElement('button'); okBtn.textContent = '确定'; applyStyles(okBtn, { ...commonStyles.button.base, ...commonStyles.button.primary }); setupButtonHover(okBtn, commonStyles.button.primary, commonStyles.button.primaryHover);
        const cancelBtn = document.createElement('button'); cancelBtn.textContent = '取消'; applyStyles(cancelBtn, { ...commonStyles.button.base, background:'linear-gradient(135deg,#334155 0%,#1f2937 100%)', borderColor:'rgba(100,116,139,0.8)', color:'#fff' });
        btns.appendChild(cancelBtn); btns.appendChild(okBtn);
        bx.appendChild(title); bx.appendChild(sel); bx.appendChild(btns); ov.appendChild(bx); document.body.appendChild(ov);
        const proceed = async () => {
            const group = (String(sel.value).toUpperCase() === 'NSFW') ? 'NSFW' : 'SFW';
            const items = await Promise.all(tasks);
            let successCount = 0;
            for (const it of items) {
                const finalName = `${group}/${it.name}`;
                const ok = await savePromptCard(finalName, it.content, 'user', undefined);
                if (ok) successCount++;
            }
            importInput.value = '';
            try { document.body.removeChild(ov); } catch(_){}
            refresh();
            alert(`已导入 ${successCount}/${items.length} 个文件至 ${group}`);
        };
        okBtn.onclick = proceed;
        cancelBtn.onclick = () => { importInput.value = ''; try { document.body.removeChild(ov); } catch(_){} };
    };
    exportBtn.onclick = () => {
        const txt = String(textarea.value || '');
        const nm = (nameInput.value || '').trim(); const filename = (nm ? nm : '导出条目') + '.txt';
        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
    };
    backupBtn.onclick = () => { backupUserPromptCards(); };
    
    // 处理导入备份压缩包
    importBackupInput.onchange = async () => {
        const files = Array.from(importBackupInput.files || []);
        if (!files.length) return;
        
        const file = files[0];
        if (!file.name.toLowerCase().endsWith('.zip')) {
            showNotification('请选择.zip格式的压缩包文件', 'error');
            return;
        }
        
        try {
            if (!window.JSZip) {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
                script.onload = () => processZipFile(file);
                script.onerror = () => {
                    showNotification('无法加载压缩库，请检查网络连接', 'error');
                    importBackupInput.value = '';
                };
                document.head.appendChild(script);
            } else {
                processZipFile(file);
            }
        } catch(e) {
            showNotification('处理压缩包失败：' + e.message, 'error');
            importBackupInput.value = '';
        }
    };
    
    async function processZipFile(file) {
        try {
            const JSZip = window.JSZip;
            const zip = new JSZip();
            const zipContent = await zip.loadAsync(file);
            
            const txtFiles = Object.keys(zipContent.files).filter(name => 
                name.toLowerCase().endsWith('.txt') && !name.endsWith('/')
            );
            
            if (txtFiles.length === 0) {
                showNotification('压缩包中没有找到.txt文件', 'error');
                importBackupInput.value = '';
                return;
            }
            
            const group = (String(categorySel.value || 'SFW').toUpperCase() === 'NSFW') ? 'NSFW' : 'SFW';
            let successCount = 0;
            let skipCount = 0;
            
            const progressDiv = document.createElement('div');
            progressDiv.style.cssText = `position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);background:#0f172a;border:1px solid rgba(59,130,246,.6);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.4);padding:20px;color:#e5e7eb;display:flex;flex-direction:column;gap:15px;z-index:10021;min-width:300px`;
            const titleDiv = document.createElement('div');
            titleDiv.textContent = `正在导入备份到 ${group} 分类 (共${txtFiles.length}个文件)`;
            titleDiv.style.cssText = `font-size:16px;font-weight:700;color:#93c5fd;text-align:center`;
            const progressInfo = document.createElement('div');
            progressInfo.style.cssText = `margin:10px 0;padding:10px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.35);border-radius:8px;color:#86efac;font-size:12px;text-align:center`;
            progressInfo.textContent = '准备开始...';
            progressDiv.appendChild(titleDiv);
            progressDiv.appendChild(progressInfo);
            document.body.appendChild(progressDiv);
            
            try {
                for (let i = 0; i < txtFiles.length; i++) {
                    const fileName = txtFiles[i];
                    const displayName = fileName.split('/').pop().replace(/\.txt$/i, '');
                    const finalName = `${group}/${displayName}`;
                    
                    try {
                        const content = await zipContent.files[fileName].async('string');
                        const ok = await savePromptCard(finalName, content, 'user', undefined);
                        if (ok) {
                            successCount++;
                        } else {
                            skipCount++;
                        }
                    } catch(e) {
                        console.warn(`导入文件 ${fileName} 失败:`, e);
                        skipCount++;
                    }
                    
                    progressInfo.textContent = `正在处理... ${i + 1}/${txtFiles.length} - 成功: ${successCount}, 跳过: ${skipCount}`;
                    
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } finally {
                importBackupInput.value = '';
                try { document.body.removeChild(progressDiv); } catch(_){}
                refresh();
                showNotification(`导入完成！成功: ${successCount}, 跳过: ${skipCount} (已导入到${group})`, successCount > 0 ? 'success' : 'warning', 3000);
            }
        } catch(e) {
            showNotification('解析压缩包失败：' + e.message, 'error');
            importBackupInput.value = '';
        }
    }
    ioTools.appendChild(importBtn); ioTools.appendChild(exportBtn); ioTools.appendChild(backupBtn); ioTools.appendChild(importBackupBtn); ioTools.appendChild(importInput); ioTools.appendChild(importBackupInput);
    btnRow.insertBefore(ioTools, editTools);
    listFrame.appendChild(list); const listHeaderBar = document.createElement('div'); listHeaderBar.textContent='提示词卡池文件'; listHeaderBar.style.cssText = `width:100%;margin:10px 0 4px 0;padding:2px 0 0 0;color:#93c5fd;font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px`;
    
    const totalFilesSpan = document.createElement('span');
    totalFilesSpan.id = 'totalFilesCount';
    totalFilesSpan.textContent = '文件总数: 0';
    totalFilesSpan.style.cssText = 'background:linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);color:#1f1203;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;margin-left:8px;box-shadow:0 2px 4px rgba(0,0,0,0.2);';
    
    const refreshBtn = document.createElement('button'); refreshBtn.textContent='刷新'; applyStyles(refreshBtn, { ...commonStyles.button.base, ...commonStyles.button.primary, height:'20px', padding:'0 6px', fontSize:'11px', display:'inline-flex', alignItems:'center', justifyContent:'center' }); setupButtonHover(refreshBtn, commonStyles.button.primary, commonStyles.button.primaryHover); refreshBtn.onclick = () => { refresh(); };
    listHeaderBar.appendChild(totalFilesSpan);
    listHeaderBar.appendChild(refreshBtn);
    listFrame.insertBefore(listHeaderBar, list); container.appendChild(listFrame);
    let currentCardPath=null, currentCardSource=null, originalName='', originalContent='', originalPath=null, cancelStage=0;
    const manageChipIndex = new Map(); let activeManageKey = null;
    const refresh = async () => {
        list.innerHTML = ''; const files = await fetchPromptCards(); const order = ['SFW','NSFW','根目录'];
        const groups = {}; files.forEach(item => { const parts=(item.name||'').split('/'); const g = parts.length>1 ? parts[0] : '根目录'; (groups[g] = groups[g] || []).push(item); });   
        const totalFiles = files.length;
        const totalFilesSpan = document.getElementById('totalFilesCount');
        if (totalFilesSpan) {
            totalFilesSpan.textContent = `文件总数: ${totalFiles}`;
        }
        Object.keys(groups).sort((a,b)=>{ const ai=order.indexOf(a), bi=order.indexOf(b); if (ai!==-1 || bi!==-1) return (ai===-1?999:ai)-(bi===-1?999:bi); return a.localeCompare(b); }).forEach(groupName => {
            const title = document.createElement('div'); title.textContent = groupName; title.style.cssText = `width:100%;margin:0 0 4px 0;color:#93c5fd;border-bottom:1px solid rgba(59,130,246,0.35);font-size:12px`; if (groupName==='NSFW'){ title.style.color='#f87171'; title.style.borderBottom='1px solid rgba(248,113,113,0.35)'; } else if (groupName==='SFW'){ title.style.color='#22c55e'; title.style.borderBottom='1px solid rgba(34,197,94,0.35)'; }
            list.appendChild(title);
            groups[groupName].sort((a,b)=> (a.name||'').localeCompare(b.name||'' )).forEach(item => {
                const chip = document.createElement('span'); chip.style.cssText = `display:inline-flex;align-items:center;gap:4px;padding:3px 6px;background:#3a3a3a;color:#eee;border-radius:12px;cursor:pointer;border:1px solid #6aa1f3;font-size:12px`;
                const prefix = document.createElement('span'); prefix.textContent = item.source === 'user' ? '用户' : '预置'; prefix.style.cssText = `display:inline-block;padding:0 6px;border-radius:10px;font-size:12px;font-weight:700;color:#fff;${item.source==='user' ? 'background:#22c55e;border:1px solid rgba(34,197,94,0.6);' : 'background:#2563eb;border:1px solid rgba(59,130,246,0.6);'}`;
                const displayName = (item.name||'').split('/').pop().replace(/\.txt$/i, ''); const nameSpan = document.createElement('span'); nameSpan.textContent = displayName;
                chip.appendChild(prefix); chip.appendChild(nameSpan);
                const k = `${item.source}|${item.name}`; manageChipIndex.set(k, chip);
                const markActive = (ch, act) => {
                    if (!ch) return;
                    ch.style.background = '#3a3a3a';
                    ch.style.color = '#eee';
                    ch.style.border = '1px solid #6aa1f3';
                };
                chip.onclick = async () => { nameInput.value = displayName; currentCardPath = item.name; currentCardSource = item.source; const rawContent = await fetchPromptCardContent(item.name, item.source); 
                
                let author = '';
                let version = '';
                let displayContent = rawContent;
                
                const authorMatch1 = displayContent.match(/^\s*\{\{提供者:\s*([^}]+)\}\}\s*$/m);
                if (authorMatch1) {
                    author = authorMatch1[1].trim();
                }
                
                const authorMatch2 = displayContent.match(/^\s*\/\/\s*提供者:\s*(.+)$/m);
                if (authorMatch2 && !author) {
                    author = authorMatch2[1].trim();
                }
                
                const authorMatch3 = displayContent.match(/^\s*提供者:\s*(.+)$/m);
                if (authorMatch3 && !author) {
                    author = authorMatch3[1].trim();
                }
                
                const versionMatch1 = displayContent.match(/^\s*\{\{版本:\s*([^}]+)\}\}\s*$/m);
                if (versionMatch1) {
                    version = versionMatch1[1].trim();
                }
                
                const versionMatch2 = displayContent.match(/^\s*\/\/\s*版本号:\s*(.+)$/m);
                if (versionMatch2 && !version) {
                    version = versionMatch2[1].trim();
                }
                
                const versionMatch3 = displayContent.match(/^\s*\/\/\s*版本:\s*(.+)$/m);
                if (versionMatch3 && !version) {
                    version = versionMatch3[1].trim();
                }
                
                const versionMatch4 = displayContent.match(/^\s*版本:\s*(.+)$/m);
                if (versionMatch4 && !version) {
                    version = versionMatch4[1].trim();
                }
                
                displayContent = displayContent.replace(/^\s*\{\{提供者:\s*[^}]+\}\}\s*$/gm, '');
                displayContent = displayContent.replace(/^\s*\{\{版本:\s*[^}]+\}\}\s*$/gm, '');
                displayContent = displayContent.replace(/^\s*\/\/\s*提供者:.*?$/gm, '');
                displayContent = displayContent.replace(/^\s*\/\/\s*版本号:.*?$/gm, '');
                displayContent = displayContent.replace(/^\s*\/\/\s*版本:.*?$/gm, '');
                displayContent = displayContent.replace(/^\s*提供者:.*?$/gm, '');
                displayContent = displayContent.replace(/^\s*版本:.*?$/gm, '');
                displayContent = displayContent.replace(/^\s*\/\/.*$/gm, '');
                displayContent = displayContent.trim();
                
                if (authorInput) authorInput.value = author;
                if (versionInput) versionInput.value = version;
                
                textarea.value = displayContent;
                originalName = displayName; 
                originalContent = displayContent; 
                originalPath = item.name; 
                const group = (item.name.split('/')[0] || '').toUpperCase(); 
                if (group==='SFW' || group==='NSFW') categorySel.value = group; 
                const prev = manageChipIndex.get(activeManageKey); 
                markActive(prev, false); 
                activeManageKey = k; 
                markActive(chip, true); 
                updateFileInfo(); 
                };
                markActive(chip, k === activeManageKey);
                list.appendChild(chip);
            });
        });
    };
    refresh();

    const updateFileInfo = () => {
        const content = textarea.value || '';
        const charCount = content.length;
        
        let wordCount = 0;
        if (content.trim() !== '') {
            const paragraphs = content.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);
            
            paragraphs.forEach(paragraph => {
                const lines = paragraph.split(/\n/).filter(line => line.trim().length > 0);
                
                if (lines.length === 1) {
                    const words = lines[0].trim().split(/[\s\u3000]+/).filter(word => word.length > 0);
                    wordCount += words.length;
                } else {
                    wordCount += lines.length;
                }
            });
        }
        
        const charCountElement = document.getElementById('charCount');
        const wordCountElement = document.getElementById('wordCount');
        
        if (charCountElement) {
            charCountElement.textContent = `字符: ${charCount}`;
        }
        
        if (wordCountElement) {
            wordCountElement.textContent = `词条: ${wordCount}`;
        }
    };
    
    textarea.addEventListener('input', updateFileInfo);
    
    const save = async () => {
        const nm = (nameInput.value||'').trim(); const group = (categorySel.value||'SFW').toUpperCase(); let finalName = `${group}/${nm}`; if (!nm) return; let sourceToUse = currentCardSource || 'user'; let confirmText = undefined;
        if (sourceToUse === 'system'){ const input = prompt('警告：你正在修改系统预置条目，此操作将会造成不可逆的后果。请输入确认指令“我已知晓”以继续：',''); if (input !== '我已知晓') return; confirmText = input; }

        const author = authorInput ? authorInput.value.trim() : '';
        const version = versionInput ? versionInput.value.trim() : '';
        const currentContent = textarea.value || '';
        let saveContent = currentContent;
        
        saveContent = saveContent.replace(/^\s*\{\{提供者:.*?\}\}\s*$/gm, '');
        saveContent = saveContent.replace(/^\s*\{\{版本:.*?\}\}\s*$/gm, '');
        saveContent = saveContent.replace(/^\s*\/\/\s*提供者:.*?$/gm, '');
        saveContent = saveContent.replace(/^\s*\/\/\s*版本号:.*?$/gm, '');
        saveContent = saveContent.replace(/^\s*\/\/\s*版本:.*?$/gm, '');
        saveContent = saveContent.replace(/^\s*提供者:.*?$/gm, '');
        saveContent = saveContent.replace(/^\s*版本:.*?$/gm, '');
        
        if (author || version) {
            let header = '';
            if (author) header += `{{提供者: ${author}}}\n`;
            if (version) header += `{{版本: ${version}}}\n`;
            if (header) {
                saveContent = header + '\n' + saveContent;
            }
        }
        
        const ok = await savePromptCard(finalName, saveContent, sourceToUse, confirmText); 
        if (ok) { 
            refresh(); 
            showNotification('保存成功！', 'success');
        } else {
            showNotification('保存失败，请重试', 'error');
        }
        originalName = nm; originalContent = textarea.value||''; originalPath = finalName.endsWith('.txt') ? finalName : `${finalName}.txt`; currentCardPath = originalPath; currentCardSource = sourceToUse; cancelStage = 0;
    };
    const cancel = () => {
        const nmNow = (nameInput.value||'').trim(); const isDirty = nmNow !== (originalName||'') || (textarea.value||'') !== (originalContent||'');
        if (isDirty){ nameInput.value = originalName || ''; textarea.value = originalContent || ''; currentCardPath = originalPath; const group = (currentCardPath ? currentCardPath.split('/')[0] : categorySel.value) || 'SFW'; if (group==='SFW' || group==='NSFW') categorySel.value = group; cancelStage = 1; setTimeout(updateFileInfo, 0); return; }
        if (cancelStage === 1){ nameInput.value=''; textarea.value=''; currentCardPath=null; currentCardSource=null; originalName=''; originalContent=''; originalPath=null; cancelStage=0; if (authorInput) authorInput.value=''; if (versionInput) versionInput.value=''; setTimeout(updateFileInfo, 0); return; }
        nameInput.value=''; textarea.value=''; currentCardPath=null; currentCardSource=null; originalName=''; originalContent=''; originalPath=null; cancelStage=0; if (authorInput) authorInput.value=''; if (versionInput) versionInput.value=''; setTimeout(updateFileInfo, 0);
    };
    const del = async () => {
        const nm = (nameInput.value||'').trim(); const toDelete = currentCardPath || (nm ? nm + '.txt' : ''); if (!toDelete) return; let sourceToUse = currentCardSource || 'user'; const second = confirm('再次确认：删除后不可恢复，是否继续？'); if (!second) return; let confirmText = undefined; if (sourceToUse==='system'){ const input = prompt('警告：你正在删除系统自带条目。请输入授权指令“我已知晓后果”以继续：',''); if (input !== '我已知晓后果') return; confirmText = input; }
        const ok = await deletePromptCard(toDelete, sourceToUse, confirmText); 
        if (ok){ 
            textarea.value=''; 
            nameInput.value=''; 
            refresh(); 
            showNotification('删除成功！', 'success');
        } else {
            showNotification('删除失败，请重试', 'error');
        }
    };
    saveBtn.onclick = save; cancelBtn.onclick = cancel; delBtn.onclick = del;
    clearBtn.onclick = () => { textarea.value = ''; };
    removeEmptyBtn.onclick = () => { const lines = (textarea.value||'').split(/\r?\n/).filter(ln => ln.trim() !== ''); textarea.value = lines.join('\n'); };
    removeSpacesBtn.onclick = () => { textarea.value = (textarea.value||'').replace(/[ \u3000]+/g, ''); };
    removeNewlinesBtn.onclick = () => { textarea.value = (textarea.value||'').replace(/\r?\n/g, ''); };
    trimEdgeSpacesBtn.onclick = () => { const lines = (textarea.value||'').split(/\r?\n/).map(ln => ln.replace(/^\s+|\s+$/g, '')); textarea.value = lines.join('\n').trim(); };
    addBlankLinesBtn.onclick = () => { 
        const t = (textarea.value||'').replace(/\r/g, ''); 
        if (t.includes('\n\n')) {
            return;
        }
        textarea.value = t.replace(/\n(?!\n)/g, '\n\n'); 
    };
    removeLineNumbersBtn.onclick = () => { const lines = (textarea.value||'').split(/\r?\n/); textarea.value = lines.map(s => s.replace(/^\s*\d+[\.\u3002、:：\)\]\-—]*\s*/, '').replace(/^\s*[（(]?\d+[）)]\s*/, '').replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩][\.\u3002、:：\)\]\-—]*\s*/, '').replace(/^\s*(?:[一二三四五六七八九十百千〇零]+)[\.\u3002、:：\)\]\-—]*\s*/, '').replace(/^\s*(?:[IVXLCM]+)[\.\u3002、:：\)\]\-—]*\s*/i, '')).join('\n'); };
    removeLeadingPunctBtn.onclick = () => { const lines = (textarea.value||'').split(/\r?\n/); textarea.value = lines.map(ln => ln.replace(/^[\s\.,;:：，、。!！\?？\-—~·…]+/, '')).join('\n'); };
}