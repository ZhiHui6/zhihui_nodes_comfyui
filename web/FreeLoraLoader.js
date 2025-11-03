import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

// 全局样式设置
function setupGlobalStyles() {
    if (document.getElementById('free-lora-loader-styles')) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'free-lora-loader-styles';
    styleEl.textContent = `
        .free-lora-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        }
        
        .free-lora-modal-content {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            border-radius: 16px;
            width: 90%;
            max-width: 1200px;
            height: 80%;
            max-height: 800px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .free-lora-modal-header {
            padding: 12px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.05);
        }
        
        .free-lora-modal-title {
            color: #ffffff;
            font-size: 18px;
            font-weight: 600;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .free-lora-modal-close {
            background: linear-gradient(145deg, #ff6b6b, #ee5a52);
            color: white;
            border: none;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .free-lora-modal-close:hover {
            background: linear-gradient(145deg, #ee5a52, #dc3545);
            transform: scale(1.1);
        }
        
        .free-lora-browser-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 20px 24px;
            overflow: hidden;
        }
        
        .free-lora-controls {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
            align-items: center;
            flex-wrap: wrap;
            padding: 16px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            backdrop-filter: blur(10px);
        }
        
        .free-lora-path-input {
            flex: 1;
            min-width: 300px;
            background: linear-gradient(145deg, #2a2a3e, #1e1e32);
            color: #e8e8e8;
            border: 1px solid #4a5568;
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        
        .free-lora-path-input:focus {
            outline: none;
            border-color: #4299e1;
            box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }
        
        .free-lora-btn {
            background: linear-gradient(145deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 10px 16px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .free-lora-btn:hover {
            background: linear-gradient(145deg, #5a6fd8, #6a4190);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .free-lora-btn:disabled {
            background: linear-gradient(145deg, #4a5568, #2d3748);
            color: #a0aec0;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        .free-lora-btn-drives {
            background: linear-gradient(145deg, #f093fb, #f5576c);
        }
        
        .free-lora-btn-drives:hover {
            background: linear-gradient(145deg, #e081e9, #e3455a);
            box-shadow: 0 6px 20px rgba(240, 147, 251, 0.4);
        }
        
        .free-lora-btn-up {
            background: linear-gradient(145deg, #4ecdc4, #44a08d);
        }
        
        .free-lora-btn-up:hover {
            background: linear-gradient(145deg, #44a08d, #3d8b7b);
            box-shadow: 0 6px 20px rgba(78, 205, 196, 0.4);
        }
        
        .free-lora-path-nav {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            flex-wrap: wrap;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .free-lora-path-segment {
            background: linear-gradient(145deg, #4299e1, #3182ce);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            border: none;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .free-lora-path-segment:hover {
            background: linear-gradient(145deg, #3182ce, #2c5aa0);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
        }
        
        .free-lora-path-separator {
            color: #a0aec0;
            font-size: 14px;
            font-weight: bold;
        }
        
        .free-lora-file-grid {
            flex: 1;
            overflow-y: auto;
            background: linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 50%, rgba(15, 52, 96, 0.8) 100%);
            border-radius: 12px;
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
        }
        
        .free-lora-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 12px;
        }
        
        .free-lora-item {
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid transparent;
            border-radius: 8px;
            padding: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            min-height: 70px;
            justify-content: center;
        }
        
        .free-lora-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            border-color: rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.1);
        }
        
        .free-lora-item.selected {
            border: 2px solid;
            border-image: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57) 1;
            box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
            background: rgba(255, 255, 255, 0.15);
        }
        
        .free-lora-item-directory {
            background: linear-gradient(145deg, #4a5568, #2d3748);
        }
        
        .free-lora-item-directory:hover {
            background: linear-gradient(145deg, #5a6578, #3d4758);
        }
        
        .free-lora-item-lora {
            background: linear-gradient(145deg, #667eea, #764ba2);
        }
        
        .free-lora-item-lora:hover {
            background: linear-gradient(145deg, #5a6fd8, #6a4190);
        }
        
        .free-lora-item-icon {
            font-size: 22px;
            margin-bottom: 4px;
            opacity: 0.8;
        }
        
        .free-lora-item-name {
            color: #ffffff;
            font-size: 12px;
            font-weight: 500;
            word-break: break-all;
            line-height: 1.2;
            margin-bottom: 2px;
        }
        
        .free-lora-item-info {
            color: #a0aec0;
            font-size: 11px;
            opacity: 0.8;
        }
        
        .free-lora-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 200px;
            color: #a0aec0;
            font-size: 16px;
        }
        
        .free-lora-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 200px;
            color: #a0aec0;
            font-size: 16px;
        }
        
        .free-lora-action-buttons {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
        }
        
        .free-lora-button-group {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-left: auto;
        }
        
        .free-lora-btn-cancel {
            background: linear-gradient(145deg, #6b7280, #4b5563);
            color: #ffffff;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            min-width: 80px;
        }
        
        .free-lora-btn-cancel:hover {
            background: linear-gradient(145deg, #7b8290, #5b6573);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .free-lora-btn-select {
            background: linear-gradient(145deg, #10b981, #059669);
            color: #ffffff;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            min-width: 80px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .free-lora-btn-select:hover:not(:disabled) {
            background: linear-gradient(145deg, #20c997, #169f85);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
        
        .free-lora-btn-select:disabled {
            background: linear-gradient(145deg, #dc2626, #b91c1c);
            cursor: not-allowed;
            opacity: 0.8;
        }

        .select-icon {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(0, 0, 0, 0.4);
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .free-lora-btn-select:disabled .select-icon {
            background: rgba(0, 0, 0, 0.4);
            border-color: rgba(0, 0, 0, 0.5);
            color: rgba(255, 255, 255, 0.8);
        }

        .free-lora-btn-select:not(:disabled) .select-icon {
            background: rgba(0, 0, 0, 0.25);
            border-color: rgba(0, 0, 0, 0.35);
            color: #ffffff;
        }

        .free-lora-empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
        }
        
        .free-lora-file-grid::-webkit-scrollbar {
            width: 8px;
        }
        
        .free-lora-file-grid::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }
        
        .free-lora-file-grid::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
        }
        
        .free-lora-file-grid::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
        }
        
        .free-lora-status {
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            margin-top: 12px;
            color: #a0aec0;
            font-size: 13px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .free-lora-loaded-model-info {
            padding: 0;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 8px;
            color: #ffffff;
            font-size: 13px;
            display: none;
            max-width: 600px;
            padding: 8px 12px;
        }
        
        .free-lora-loaded-model-info.visible {
            display: flex;
            gap: 16px;
            align-items: flex-start;
        }
        
        .free-lora-loaded-model-column {
            flex: 1;
        }
        
        .free-lora-loaded-model-column:first-child {
            flex: 0 0 auto;
            min-width: 120px;
        }
        
        .free-lora-loaded-model-title {
            color: #10b981;
            font-weight: 600;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 16px;
        }
        
        .free-lora-loaded-model-details {
            color: #e5e7eb;
            line-height: 1.4;
            font-size: 12px;
        }
        
        .free-lora-loaded-model-path {
            color: #9ca3af;
            font-size: 11px;
            margin-top: 2px;
            word-break: break-all;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .free-lora-scan-options {
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
            margin-bottom: 8px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .free-lora-checkbox-container {
            display: flex;
            align-items: center;
            cursor: pointer;
            user-select: none;
            gap: 8px;
        }
        
        .free-lora-checkbox-container input[type="checkbox"] {
            display: none;
        }
        
        .free-lora-checkmark {
            width: 18px;
            height: 18px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            position: relative;
            transition: all 0.3s ease;
        }
        
        .free-lora-checkbox-container input[type="checkbox"]:checked + .free-lora-checkmark {
            background: linear-gradient(45deg, #4ecdc4, #45b7d1);
            border-color: #4ecdc4;
        }
        
        .free-lora-checkbox-container input[type="checkbox"]:checked + .free-lora-checkmark::after {
            content: "✓";
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 12px;
            font-weight: bold;
        }
        
        .free-lora-checkbox-text {
            color: #e5e7eb;
            font-size: 13px;
            font-weight: 500;
        }
        
        .free-lora-performance-warning {
            color: #fbbf24;
            font-size: 11px;
            opacity: 0.8;
            margin-left: 4px;
        }
    `;
    document.head.appendChild(styleEl);
}

// 文件浏览器类
class FreeLoraFileBrowser {
    constructor(nodeId) {
        this.nodeId = nodeId;
        this.currentPath = "";
        this.selectedPath = "";
        this.selectedItem = null;
        this.lastLoadedInfo = null; // 存储最后加载的模型信息
        this.isInDriveView = false; // 跟踪当前是否在驱动器界面
        this.modal = null;
        this.setupModal();
    }
    
    setupModal() {
        // 创建模态框
        this.modal = document.createElement('div');
        this.modal.className = 'free-lora-modal';
        this.modal.innerHTML = `
            <div class="free-lora-modal-content">
                <div class="free-lora-modal-header">
                    <h3 class="free-lora-modal-title">
                        🎯 自由LORA加载器 - 文件浏览器
                    </h3>
                    <button class="free-lora-modal-close">×</button>
                </div>
                <div class="free-lora-browser-container">
                    <div class="free-lora-controls">
                        <input type="text" class="free-lora-path-input" placeholder="输入LORA文件夹路径或直接选择文件...">
                        <button class="free-lora-btn free-lora-btn-drives">💾 驱动器</button>
                        <button class="free-lora-btn free-lora-btn-up">⬆️ 上级</button>
                        <button class="free-lora-btn">🔄 刷新</button>
                    </div>
                    <div class="free-lora-scan-options">
                        <label class="free-lora-checkbox-container">
                            <input type="checkbox" class="free-lora-auto-scan-checkbox">
                            <span class="free-lora-checkmark"></span>
                            <span class="free-lora-checkbox-text">🔍 自动扫描整个盘符中的所有LORA模型</span>
                            <span class="free-lora-performance-warning">(⚠️ 可能影响性能)</span>
                        </label>
                    </div>
                    <div class="free-lora-path-nav"></div>
                    <div class="free-lora-file-grid">
                        <div class="free-lora-loading">正在加载...</div>
                    </div>
                    <div class="free-lora-status">请选择一个LORA文件</div>
                </div>
                <div class="free-lora-action-buttons">
                    <div class="free-lora-loaded-model-info">
                        <div class="free-lora-loaded-model-column">
                            <div class="free-lora-loaded-model-title">
                                加载中的模型：
                            </div>
                        </div>
                        <div class="free-lora-loaded-model-column">
                            <div class="free-lora-loaded-model-details"></div>
                            <div class="free-lora-loaded-model-path"></div>
                        </div>
                    </div>
                    <div class="free-lora-button-group">
                        <button class="free-lora-btn-cancel">清除加载</button>
                        <button class="free-lora-btn-select" disabled><span class="select-icon">×</span>选择</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const closeBtn = this.modal.querySelector('.free-lora-modal-close');
        const pathInput = this.modal.querySelector('.free-lora-path-input');
        const drivesBtn = this.modal.querySelector('.free-lora-btn-drives');
        const upBtn = this.modal.querySelector('.free-lora-btn-up');
        const refreshBtn = this.modal.querySelector('.free-lora-btn:last-child');
        const cancelBtn = this.modal.querySelector('.free-lora-btn-cancel');
        const selectBtn = this.modal.querySelector('.free-lora-btn-select');
        const autoScanCheckbox = this.modal.querySelector('.free-lora-auto-scan-checkbox');
        
        // 关闭模态框
        closeBtn.addEventListener('click', () => this.hide());
        // 注释掉点击外部区域关闭模态框的功能
        // this.modal.addEventListener('click', (e) => {
        //     if (e.target === this.modal) this.hide();
        // });
        
        // 路径输入
        pathInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.navigateToPath(pathInput.value);
            }
        });
        
        // 驱动器按钮
        drivesBtn.addEventListener('click', () => this.showDrives());
        
        // 上级目录按钮
        upBtn.addEventListener('click', () => this.navigateUp());
        
        // 刷新按钮
        refreshBtn.addEventListener('click', () => this.refresh());
        
        // 清除加载按钮（原取消按钮）
        cancelBtn.addEventListener('click', () => this.clearLoadedModel());
        
        // 选择按钮
        selectBtn.addEventListener('click', () => this.confirmSelection());
        
        // 自动扫描复选框
        autoScanCheckbox.addEventListener('change', (e) => {
            this.handleAutoScanToggle(e.target.checked);
        });
    }
    
    show() {
        this.modal.style.display = 'flex';
        this.resetSelectButton(); // 重置选择按钮状态
        
        // 如果有最后加载的模型信息，恢复显示
        if (this.lastLoadedInfo) {
            this.updateStatusSuccess(`✅ 已加载: ${this.lastLoadedInfo.name} (${this.lastLoadedInfo.size} MB)`);
            this.updateLoadedModelInfo(this.lastLoadedInfo);
        }
        
        this.showDrives(); // 默认显示驱动器
    }
    
    resetSelectButton() {
        const selectBtn = this.modal.querySelector('.free-lora-btn-select');
        const selectIcon = selectBtn.querySelector('.select-icon');
        selectBtn.disabled = true;
        selectIcon.textContent = '×';
        this.selectedPath = null;
        this.selectedItem = null;
    }
    
    hide() {
        this.modal.style.display = 'none';
    }
    
    async showDrives() {
        try {
            const response = await api.fetchApi('/free_lora_loader/get_drives');
            const data = await response.json();
            
            if (data.success) {
                this.isInDriveView = true; // 设置为驱动器界面状态
                this.currentPath = ""; // 清空当前路径
                this.renderItems(data.data, "");
                this.updatePathNav([]);
                this.updateStatus("选择一个驱动器开始浏览");
            }
        } catch (error) {
            console.error('Error loading drives:', error);
            this.showError('无法加载驱动器列表');
        }
    }
    
    async navigateToPath(path) {
        if (!path) return;
        
        try {
            this.showLoading();
            this.resetSelectButton(); // 重置选择按钮状态
            
            // 检查是否启用了自动扫描且当前路径是驱动器根目录
            if (this.autoScanEnabled && this.isDriveRoot(path)) {
                await this.performAutoScan(path);
                return;
            }
            
            const response = await api.fetchApi(`/free_lora_loader/browse_directory?path=${encodeURIComponent(path)}`);
            const data = await response.json();
            
            if (data.success) {
                this.isInDriveView = false; // 清除驱动器界面状态
                this.currentPath = path;
                this.renderItems(data.data.items, data.data.current_path);
                this.updatePathInput(path);
                this.updatePathNav(await this.getPathSegments(path));
                this.updateStatus(`找到 ${data.data.total_loras} 个LORA文件`);
            } else {
                this.showError(data.error || '无法访问该路径');
            }
        } catch (error) {
            console.error('Error navigating to path:', error);
            this.showError('导航失败');
        }
    }
    
    async navigateUp() {
        if (!this.currentPath) return;
        
        const parentPath = this.getParentPath(this.currentPath);
        if (parentPath !== this.currentPath) {
            await this.navigateToPath(parentPath);
        }
    }
    
    async refresh() {
        if (this.isInDriveView) {
            // 如果当前在驱动器界面，刷新驱动器列表
            await this.showDrives();
        } else if (this.currentPath) {
            // 如果有当前路径，刷新当前目录
            await this.navigateToPath(this.currentPath);
        } else {
            // 默认显示驱动器列表
            await this.showDrives();
        }
    }
    
    getParentPath(path) {
        if (!path) return "";
        
        // Windows路径处理
        if (path.includes('\\')) {
            const parts = path.split('\\').filter(p => p);
            if (parts.length <= 1) return "";
            return parts.slice(0, -1).join('\\') + '\\';
        }
        
        // Unix路径处理
        const parts = path.split('/').filter(p => p);
        if (parts.length <= 1) return "/";
        return '/' + parts.slice(0, -1).join('/');
    }
    
    async getPathSegments(path) {
        try {
            const response = await api.fetchApi(`/free_lora_loader/get_path_segments?path=${encodeURIComponent(path)}`);
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Error getting path segments:', error);
            return [];
        }
    }
    
    renderItems(items, currentPath) {
        const grid = this.modal.querySelector('.free-lora-file-grid');
        
        if (!items || items.length === 0) {
            grid.innerHTML = `
                <div class="free-lora-empty">
                    <div class="free-lora-empty-icon">📁</div>
                    <div>此目录为空或没有LORA文件</div>
                </div>
            `;
            return;
        }
        
        // 过滤掉is_parent为true的项目（移除绿色框中的返回上级图标）
        const filteredItems = items.filter(item => !item.is_parent);
        
        if (filteredItems.length === 0) {
            grid.innerHTML = `
                <div class="free-lora-empty">
                    <div class="free-lora-empty-icon">📁</div>
                    <div>此目录为空或没有LORA文件</div>
                </div>
            `;
            return;
        }
        
        const gridContainer = document.createElement('div');
        gridContainer.className = 'free-lora-grid';
        
        filteredItems.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = `free-lora-item ${item.type === 'directory' ? 'free-lora-item-directory' : 'free-lora-item-lora'}`;
            
            let icon, info = '';
            
            if (item.type === 'directory') {
                icon = '📁';
            } else if (item.type === 'lora') {
                icon = '🎯';
            } else if (item.type === 'drive') {
                icon = '💾';
            }
            
            itemEl.innerHTML = `
                <div class="free-lora-item-icon">${icon}</div>
                <div class="free-lora-item-name">${item.name}</div>
                ${info ? `<div class="free-lora-item-info">${info}</div>` : ''}
            `;
            
            itemEl.addEventListener('click', () => this.handleItemClick(item));
            gridContainer.appendChild(itemEl);
        });
        
        grid.innerHTML = '';
        grid.appendChild(gridContainer);
    }
    
    async handleItemClick(item) {
        if (item.type === 'directory' || item.type === 'drive') {
            await this.navigateToPath(item.path);
        } else if (item.type === 'lora') {
            // 只更新选中状态，不直接加载
            this.updateSelectedItem(item, event.currentTarget);
        }
    }
    
    updateSelectedItem(item, element) {
        // 清除之前的选中状态
        this.modal.querySelectorAll('.free-lora-item').forEach(el => {
            el.classList.remove('selected');
        });
        
        // 设置新的选中状态
        element.classList.add('selected');
        this.selectedPath = item.path;
        this.selectedItem = item;
        
        // 启用选择按钮并更新图标
        const selectBtn = this.modal.querySelector('.free-lora-btn-select');
        const selectIcon = selectBtn.querySelector('.select-icon');
        selectBtn.disabled = false;
        selectIcon.textContent = '✓';
        
        // 更新状态信息
        this.updateStatus(`已选中: ${item.name} - 点击"选择"按钮确认`);
    }
    
    async confirmSelection() {
        if (!this.selectedItem || !this.selectedPath) {
            this.updateStatus('请先选择一个LORA文件');
            return;
        }
        
        try {
            // 发送到后端
            const response = await api.fetchApi('/free_lora_loader/set_lora_path', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: this.selectedPath })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // 更新节点输入
                const node = app.graph.getNodeById(this.nodeId);
                if (node && node.widgets) {
                    const loraWidget = node.widgets.find(w => w.name === 'lora_name');
                    if (loraWidget) {
                        loraWidget.value = this.selectedPath;
                    }
                }
                
                // 存储最后加载的模型信息
                this.lastLoadedInfo = {
                    name: this.selectedItem.name,
                    size: this.selectedItem.size_mb,
                    path: this.selectedPath
                };
                
                // 更新底部模型信息显示
                this.updateLoadedModelInfo(this.lastLoadedInfo);
                
                // 更新主节点上的显示区域
                if (this.nodeRef && this.nodeRef.updateLoadedModelDisplay) {
                    const modelInfo = {
                        name: this.selectedItem.name
                    };
                    this.nodeRef.updateLoadedModelDisplay(modelInfo);
                }
                
                // 显示绿色成功状态，不关闭模态框
                this.updateStatusSuccess(`✅ 已加载: ${this.selectedItem.name}`);
            } else {
                this.showError(data.error || '加载文件失败');
            }
        } catch (error) {
            console.error('Error confirming selection:', error);
            this.showError('加载文件失败');
        }
    }
    
    async selectLora(item) {
        // 这个方法现在已经不再使用，保留以防兼容性问题
        console.warn('selectLora method is deprecated, use confirmSelection instead');
    }
    
    updatePathInput(path) {
        const input = this.modal.querySelector('.free-lora-path-input');
        input.value = path;
    }
    
    updatePathNav(segments) {
        const nav = this.modal.querySelector('.free-lora-path-nav');
        
        if (!segments || segments.length === 0) {
            nav.innerHTML = '<span style="color: #a0aec0;">选择驱动器开始浏览</span>';
            return;
        }
        
        nav.innerHTML = '';
        
        segments.forEach((segment, index) => {
            if (index > 0) {
                const separator = document.createElement('span');
                separator.className = 'free-lora-path-separator';
                separator.textContent = '>';
                nav.appendChild(separator);
            }
            
            const segmentBtn = document.createElement('button');
            segmentBtn.className = 'free-lora-path-segment';
            segmentBtn.textContent = segment.name;
            segmentBtn.addEventListener('click', () => this.navigateToPath(segment.path));
            nav.appendChild(segmentBtn);
        });
    }
    
    updateStatus(message) {
        const status = this.modal.querySelector('.free-lora-status');
        status.textContent = message;
        status.style.color = ''; // 重置颜色
    }
    
    updateStatusSuccess(message) {
        const status = this.modal.querySelector('.free-lora-status');
        status.textContent = message;
        status.style.color = '#4CAF50'; // 绿色
        status.style.fontWeight = 'bold';
    }
    
    updateLoadedModelInfo(modelInfo) {
        const infoContainer = this.modal.querySelector('.free-lora-loaded-model-info');
        const detailsEl = infoContainer.querySelector('.free-lora-loaded-model-details');
        const pathEl = infoContainer.querySelector('.free-lora-loaded-model-path');
        
        if (modelInfo) {
            detailsEl.textContent = `${modelInfo.name}`;
            pathEl.textContent = `路径: ${modelInfo.path}`;
            infoContainer.classList.add('visible');
        } else {
            infoContainer.classList.remove('visible');
        }
    }
    
    clearLoadedModel() {
        // 清除已加载的模型信息
        this.lastLoadedInfo = null;
        this.updateLoadedModelInfo(null);
        this.updateStatus('已清除加载的模型');
        
        // 重置选择状态
        this.selectedItem = null;
        this.selectedPath = null;
        this.resetSelectButton();
        
        // 清除当前选中的项目高亮
        const selectedElements = this.modal.querySelectorAll('.free-lora-item.selected');
        selectedElements.forEach(el => el.classList.remove('selected'));
    }
    
    showLoading() {
        const grid = this.modal.querySelector('.free-lora-file-grid');
        grid.innerHTML = '<div class="free-lora-loading">正在加载...</div>';
    }
    
    showError(message) {
        const grid = this.modal.querySelector('.free-lora-file-grid');
        grid.innerHTML = `
            <div class="free-lora-empty">
                <div class="free-lora-empty-icon">❌</div>
                <div>${message}</div>
            </div>
        `;
        this.updateStatus(`错误: ${message}`);
    }
    
    // 处理自动扫描复选框切换
    async handleAutoScanToggle(isChecked) {
        if (isChecked) {
            // 显示性能警告确认对话框
            const confirmed = confirm(
                "⚠️ 性能警告\n\n" +
                "自动扫描整个盘符可能会：\n" +
                "• 扫描大量文件，耗时较长\n" +
                "• 占用系统资源\n" +
                "• 在大容量硬盘上可能影响系统响应\n\n" +
                "建议仅在需要时使用此功能。\n\n" +
                "是否继续启用自动扫描？"
            );
            
            if (!confirmed) {
                // 用户取消，重置复选框状态
                const checkbox = this.modal.querySelector('.free-lora-auto-scan-checkbox');
                checkbox.checked = false;
                return;
            }
            
            // 启用自动扫描模式
            this.autoScanEnabled = true;
            this.updateStatus("🔍 自动扫描模式已启用 - 将扫描整个盘符中的LORA文件");
            
            // 如果当前在驱动器根目录，立即开始扫描
            const currentPath = this.modal.querySelector('.free-lora-path-input').value;
            if (currentPath && this.isDriveRoot(currentPath)) {
                await this.performAutoScan(currentPath);
            }
        } else {
            // 禁用自动扫描模式
            this.autoScanEnabled = false;
            this.updateStatus("自动扫描模式已禁用");
            
            // 刷新当前目录以显示正常的文件夹视图
            await this.refresh();
        }
    }
    
    // 检查是否为驱动器根目录
    isDriveRoot(path) {
        // Windows驱动器根目录格式：C:\, D:\, 等
        return /^[A-Za-z]:\\?$/.test(path);
    }
    
    // 执行自动扫描
    async performAutoScan(drivePath) {
        if (!this.autoScanEnabled) return;
        
        this.showLoading();
        this.updateStatus("🔍 正在扫描整个盘符，请稍候...");
        
        try {
            const response = await api.fetchApi(`/zhihui_nodes/scan_drive_lora?path=${encodeURIComponent(drivePath)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                // 渲染扫描到的LORA文件
                this.renderScannedLoraFiles(data.data.items, drivePath);
                this.updateStatusSuccess(`✅ 扫描完成！找到 ${data.data.total_loras} 个LORA文件`);
            } else {
                throw new Error(data.error || '扫描失败');
            }
        } catch (error) {
            console.error('Auto scan error:', error);
            this.showError(`自动扫描失败: ${error.message}`);
        }
    }
    
    // 渲染扫描到的LORA文件
    renderScannedLoraFiles(loraFiles, drivePath) {
        const grid = this.modal.querySelector('.free-lora-file-grid');
        
        if (loraFiles.length === 0) {
            grid.innerHTML = `
                <div class="free-lora-empty">
                    <div class="free-lora-empty-icon">📁</div>
                    <div>在 ${drivePath} 中未找到LORA文件</div>
                </div>
            `;
            return;
        }
        
        const gridContainer = document.createElement('div');
        gridContainer.className = 'free-lora-grid';
        
        loraFiles.forEach(file => {
            const item = document.createElement('div');
            item.className = 'free-lora-item free-lora-item-lora';
            item.innerHTML = `
                <div class="free-lora-item-icon">🎯</div>
                <div class="free-lora-item-name">${file.name}</div>
                <div class="free-lora-item-info">${file.size}</div>
                <div class="free-lora-item-info" style="font-size: 10px; color: #9ca3af; margin-top: 2px;">${file.path}</div>
            `;
            
            item.addEventListener('click', () => {
                this.updateSelectedItem(file, item);
            });
            
            gridContainer.appendChild(item);
        });
        
        grid.innerHTML = '';
        grid.appendChild(gridContainer);
    }
}

// 注册ComfyUI扩展
setupGlobalStyles();

app.registerExtension({
    name: "Comfy.FreeLoraLoader",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FreeLoraLoader") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated?.apply(this, arguments);
                
                // 创建文件浏览器
                const browser = new FreeLoraFileBrowser(this.id);
                
                // 添加显示已加载模型的只读区域
                const loadedModelWidget = this.addWidget("text", "当前加载的模型", "未加载任何模型", () => {}, {
                    multiline: true,
                    readonly: true,
                    serialize: false
                });
                
                // 设置widget样式，使其不可编辑
                loadedModelWidget.inputEl = null; // 移除输入元素
                loadedModelWidget.callback = null; // 移除回调
                
                // 添加浏览按钮到节点
                const browseBtn = this.addWidget("button", "🔍 浏览LORA文件", null, () => {
                    browser.show();
                });
                
                browseBtn.serialize = false; // 不序列化按钮状态
                
                // 将节点引用传递给浏览器
                browser.nodeRef = this;
                browser.loadedModelWidget = loadedModelWidget; // 传递widget引用
                
                // 自定义节点外观
                this.color = "#2a4d3a";
                this.bgcolor = "#1a2e1a";
                
                // 初始化时检查是否有已加载的模型
                this.checkLoadedModel = async () => {
                    try {
                        const response = await fetch('/free_lora_loader/get_lora_info');
                        if (response.ok) {
                            const data = await response.json();
                            if (data.success && data.data && data.data.path) {
                                const modelInfo = {
                                    name: data.data.filename || "未知模型"
                                };
                                this.updateLoadedModelDisplay(modelInfo);
                            } else {
                                this.updateLoadedModelDisplay(null);
                            }
                        }
                    } catch (error) {
                        console.log("检查已加载模型时出错:", error);
                        this.updateLoadedModelDisplay(null);
                    }
                };
                
                // 更新显示已加载模型信息的方法
                this.updateLoadedModelDisplay = (modelInfo) => {
                    if (modelInfo) {
                        loadedModelWidget.value = modelInfo.name;
                    } else {
                        loadedModelWidget.value = "未加载任何模型";
                    }
                    // 触发节点重绘
                    if (this.graph && this.graph.canvas) {
                        this.graph.canvas.setDirty(true);
                    }
                };
                
                // 初始检查
                setTimeout(() => {
                    this.checkLoadedModel();
                }, 100);
                
                return r;
            };
        }
    }
});