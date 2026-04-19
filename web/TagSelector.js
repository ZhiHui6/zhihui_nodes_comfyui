import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

const i18n = {
    zh: {
        openTagSelector: "🔖 打开标签选择器",
        nodeTitle: "TagSelector 标签选择器",
        description: "提供可视化标签选择界面，支持从预设分类中选择标签，并可配合AI进行标签扩写。",
        featuresTitle: "功能特点",
        feature1: "层级分类浏览：按类别展开标签，支持多级分类",
        feature2: "智能搜索：快速查找所需标签",
        feature3: "自动去重：输出逗号分隔的唯一标签字符串",
        feature4: "随机标签生成：支持权重预设和分类配置",
        feature5: "AI标签扩写：三种模式（标签风格/自然语言/结构化JSON）",
        usageTitle: "使用说明",
        usage1: "点击「打开标签选择器」按钮打开标签面板",
        usage2: "在面板中通过分类浏览或搜索选择标签",
        usage3: "启用「自动随机标签」可按预设权重自动生成标签组合",
        usage4: "选择扩写模式后，AI将根据选中标签生成更丰富的描述",
        paramsTitle: "参数说明",
        paramTagEdit: "tag_edit: 手动编辑的标签文本，支持直接输入或粘贴",
        paramAutoRandom: "auto_random_tags: 启用后自动生成随机标签（需先配置随机设置）",
        paramExpandMode: "expand_mode: 扩写模式选择",
        paramExpandMode1: "- Disabled: 禁用扩写，直接输出原始标签",
        paramExpandMode2: "- Tag Style: 标签风格，扩展为更详细的标签组合",
        paramExpandMode3: "- Natural Language: 自然语言风格，生成描述性句子",
        paramExpandMode4: "- Structured JSON: 结构化JSON格式，便于程序解析",
        paramOutputLang: "output_language: 扩写结果语言（中文/英文）",
        paramPlatform: "platform: API平台选择（auto自动选择可用平台）",
        paramMaxTokens: "max_tokens: AI生成内容的最大令牌数",
        expandPrereqTitle: "扩写功能前置要求",
        expandPrereq1: "需要配置API密钥：在设置页面配置支持的AI平台API Key",
        expandPrereq2: "支持的API平台：OpenAI、Claude、Gemini、DeepSeek等",
        expandPrereq3: "确保网络可访问所选API服务",
        expandPrereq4: "建议设置合理的max_tokens值以控制生成长度",
        randomTitle: "随机标签配置",
        randomDesc: "在标签选择器面板中点击「随机生成」标签页进行配置：",
        random1: "启用/禁用各分类的随机选择",
        random2: "设置每个分类的权重（影响选中概率）和数量",
        random3: "使用预设方案快速配置常用权重组合",
        inputTitle: "输入",
        inputDesc: "tag_edit: 手动编辑的标签文本",
        outputTitle: "输出",
        outputDesc: "处理后的标签字符串（逗号分隔）",
        openSettingsBtn: "打开API设置",
        clickToConfig: "点击右侧按钮快速配置"
    },
    en: {
        openTagSelector: "🔖 Open Tag Selector",
        nodeTitle: "TagSelector",
        description: "Provides a visual tag selection interface for selecting tags from preset categories, with optional AI-powered tag expansion.",
        featuresTitle: "Features",
        feature1: "Hierarchical browsing: Expand tags by category with multi-level classification",
        feature2: "Smart search: Quickly find the tags you need",
        feature3: "Auto deduplication: Outputs comma-separated unique tag strings",
        feature4: "Random tag generation: Supports weight presets and category configuration",
        feature5: "AI tag expansion: Three modes (Tag Style/Natural Language/Structured JSON)",
        usageTitle: "Usage",
        usage1: "Click 'Open Tag Selector' button to open the tag panel",
        usage2: "Browse by category or search to select tags",
        usage3: "Enable 'Auto Random Tags' to generate random tag combinations based on presets",
        usage4: "Select expansion mode to have AI generate richer descriptions from selected tags",
        paramsTitle: "Parameters",
        paramTagEdit: "tag_edit: Manually edited tag text, supports direct input or paste",
        paramAutoRandom: "auto_random_tags: When enabled, auto-generates random tags (requires random settings config)",
        paramExpandMode: "expand_mode: Expansion mode selection",
        paramExpandMode1: "- Disabled: No expansion, output raw tags directly",
        paramExpandMode2: "- Tag Style: Expand into more detailed tag combinations",
        paramExpandMode3: "- Natural Language: Generate descriptive sentences",
        paramExpandMode4: "- Structured JSON: Structured JSON format for program parsing",
        paramOutputLang: "output_language: Expansion result language (Chinese/English)",
        paramPlatform: "platform: API platform selection (auto selects available platform)",
        paramMaxTokens: "max_tokens: Maximum tokens for AI-generated content",
        expandPrereqTitle: "Expansion Prerequisites",
        expandPrereq1: "API key required: Configure supported AI platform API keys in settings",
        expandPrereq2: "Supported platforms: OpenAI, Claude, Gemini, DeepSeek, etc.",
        expandPrereq3: "Ensure network access to selected API service",
        expandPrereq4: "Recommend setting reasonable max_tokens value to control generation length",
        randomTitle: "Random Tag Configuration",
        randomDesc: "Configure in the 'Random Generator' tab in the tag selector panel:",
        random1: "Enable/disable random selection for each category",
        random2: "Set weight (affects selection probability) and count for each category",
        random3: "Use preset schemes for quick configuration of common weight combinations",
        inputTitle: "Input",
        inputDesc: "tag_edit: Manually edited tag text",
        outputTitle: "Output",
        outputDesc: "Processed tag string (comma-separated)",
        openSettingsBtn: "Open API Settings",
        clickToConfig: "Click button to configure"
    }
};

function getLocale() {
    const comfyLocale = app?.ui?.settings?.getSettingValue?.('Comfy.Locale');
    return comfyLocale === 'zh-CN' || comfyLocale === 'zh' ? 'zh' : 'en';
}

function $t(key) {
    const locale = getLocale();
    return i18n[locale][key] || i18n['en'][key] || key;
}

function getDescriptionHTML() {
    return `<h3 style="margin:0 0 12px 0;color:#60a5fa;font-size:18px;font-weight:600;padding-bottom:8px;border-bottom:1px solid rgba(96, 165, 250, 0.2);letter-spacing:0.2px;">${$t('nodeTitle')}</h3>
<p style="margin:0 0 16px 0;color:#e2e8f0;">${$t('description')}</p>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('featuresTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('feature1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('feature2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('feature3')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('feature4')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('feature5')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('usageTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('usage1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('usage2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('usage3')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('usage4')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('paramsTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('paramTagEdit')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('paramAutoRandom')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('paramExpandMode')}</li>
<li style="margin:4px 0;padding-left:12px;list-style:none;position:relative;color:#94a3b8;">${$t('paramExpandMode1')}</li>
<li style="margin:4px 0;padding-left:12px;list-style:none;position:relative;color:#94a3b8;">${$t('paramExpandMode2')}</li>
<li style="margin:4px 0;padding-left:12px;list-style:none;position:relative;color:#94a3b8;">${$t('paramExpandMode3')}</li>
<li style="margin:4px 0;padding-left:12px;list-style:none;position:relative;color:#94a3b8;">${$t('paramExpandMode4')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('paramOutputLang')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('paramPlatform')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('paramMaxTokens')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#fbbf24;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">⚠️ ${$t('expandPrereqTitle')}</h4>
<div style="background:rgba(251, 191, 36, 0.08);border:1px solid rgba(251, 191, 36, 0.2);border-radius:8px;padding:12px;margin:8px 0;">
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#fcd34d;">${$t('expandPrereq1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#fcd34d;">${$t('expandPrereq2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#fcd34d;">${$t('expandPrereq3')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#fcd34d;">${$t('expandPrereq4')}</li>
</ul>
<div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(251, 191, 36, 0.15);display:flex;align-items:center;justify-content:space-between;">
<span style="color:#94a3b8;font-size:12px;">${$t('clickToConfig')}</span>
<button id="zhihui-open-settings-btn" style="background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:#fff;border:none;border-radius:6px;padding:5px 10px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s ease;box-shadow:0 2px 6px rgba(245, 158, 11, 0.25);display:inline-flex;align-items:center;gap:4px;">⚙️ ${$t('openSettingsBtn')}</button>
</div>
</div>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('randomTitle')}</h4>
<p style="margin:0 0 8px 0;color:#94a3b8;font-size:12px;">${$t('randomDesc')}</p>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('random1')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('random2')}</li>
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('random3')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('inputTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('inputDesc')}</li>
</ul>
<h4 style="margin:12px 0 8px 0;color:#38bdf8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${$t('outputTitle')}</h4>
<ul style="margin:0;padding:0;">
<li style="margin:4px 0;padding-left:6px;list-style:none;position:relative;color:#e2e8f0;">${$t('outputDesc')}</li>
</ul>`;
}

function createHelpPopup(description, onClose) {
    const docElement = document.createElement('div');
    docElement.style.cssText = `
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        position: absolute;
        color: #e2e8f0;
        font: 13px 'Segoe UI', system-ui, -apple-system, sans-serif;
        line-height: 1.6;
        padding: 20px 24px 24px 24px;
        border-radius: 16px;
        border: 1px solid rgba(99, 179, 237, 0.3);
        z-index: 1000;
        overflow: hidden;
        max-width: 560px;
        max-height: 600px;
        min-width: 400px;
        box-shadow: 
            0 0 40px rgba(59, 130, 246, 0.15),
            0 20px 60px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
    `;

    docElement.innerHTML = `<div style="overflow-y:auto;max-height:540px;padding-right:8px;scrollbar-width:thin;scrollbar-color:rgba(96,165,250,0.3) transparent;">${description}</div>`;

    const accent = document.createElement('div');
    accent.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #3b82f6, #06b6d4, #3b82f6);
        border-radius: 16px 16px 0 0;
        opacity: 0.8;
    `;
    docElement.insertBefore(accent, docElement.firstChild);

    document.body.appendChild(docElement);

    const bindSettingsBtn = () => {
        const settingsBtn = docElement.querySelector('#zhihui-open-settings-btn');
        if (settingsBtn) {
            const newBtn = settingsBtn.cloneNode(true);
            settingsBtn.parentNode.replaceChild(newBtn, settingsBtn);
            
            newBtn.addEventListener('click', () => {
                if (typeof window.openZhihuiApiSettings === 'function') {
                    if (docElement.parentNode) {
                        docElement.remove();
                    }
                    if (onClose) onClose();
                    window.openZhihuiApiSettings();
                }
            });
            newBtn.addEventListener('mouseenter', () => {
                newBtn.style.transform = 'scale(1.05)';
                newBtn.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.4)';
            });
            newBtn.addEventListener('mouseleave', () => {
                newBtn.style.transform = 'scale(1)';
                newBtn.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)';
            });
        }
    };

    bindSettingsBtn();
    docElement._bindSettingsBtn = bindSettingsBtn;

    return docElement;
}

const script = document.createElement('script');
script.src = '/extensions/zhihui_nodes_comfyui/TagSelectorRandomGenerator.js';
document.head.appendChild(script);

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
}

function showToast(message, type = 'info', duration = 3000) {
    const existingToast = document.getElementById('custom-toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'custom-toast';
    
    const typeStyles = {
        success: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderColor: '#10b981'
        },
        error: {
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderColor: '#ef4444'
        },
        warning: {
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderColor: '#f59e0b'
        },
        info: {
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderColor: '#3b82f6'
        }
    };

    const style = typeStyles[type] || typeStyles.info;
    
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${style.background};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        border: 1px solid ${style.borderColor};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        max-width: 400px;
        word-wrap: break-word;
        animation: slideInCenter 0.3s ease;
        pointer-events: none;
    `;

    if (!document.getElementById('toast-animations')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'toast-animations';
        styleSheet.textContent = `
            @keyframes slideInCenter {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            @keyframes slideOutCenter {
                from {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutCenter 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, duration);

    return toast;
}

window.updateCategoryRedDots = updateCategoryRedDots;
window.updateSelectedTagsOverview = updateSelectedTagsOverview;

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
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "TagSelector") {
            const iconSize = 24;
            const iconMargin = 4;
            let helpElement = null;
            let currentHelpLocale = null;

            const onDrawForeground = nodeType.prototype.onDrawForeground;
            nodeType.prototype.onDrawForeground = function (ctx) {
                const r = onDrawForeground ? onDrawForeground.apply(this, arguments) : undefined;
                if (this.flags.collapsed) return r;

                const currentLocale = getLocale();

                if (this._tagSelectorHelp && helpElement === null) {
                    currentHelpLocale = currentLocale;
                    helpElement = createHelpPopup(getDescriptionHTML(), () => {
                        this._tagSelectorHelp = false;
                        helpElement = null;
                    });
                }
                else if (!this._tagSelectorHelp && helpElement !== null) {
                    helpElement.remove();
                    helpElement = null;
                    currentHelpLocale = null;
                }
                else if (this._tagSelectorHelp && helpElement !== null && currentHelpLocale !== currentLocale) {
                    helpElement.querySelector('div').innerHTML = getDescriptionHTML();
                    if (helpElement._bindSettingsBtn) {
                        helpElement._bindSettingsBtn();
                    }
                    currentHelpLocale = currentLocale;
                }

                if (this._tagSelectorHelp && helpElement !== null) {
                    const rect = ctx.canvas.getBoundingClientRect();
                    const scaleX = rect.width / ctx.canvas.width;
                    const scaleY = rect.height / ctx.canvas.height;

                    const transform = new DOMMatrix()
                        .scaleSelf(scaleX, scaleY)
                        .multiplySelf(ctx.getTransform())
                        .translateSelf(this.size[0] * scaleX * Math.max(1.0, window.devicePixelRatio), 0)
                        .translateSelf(10, -32);

                    const bcr = app.canvas.canvas.getBoundingClientRect();
                    helpElement.style.left = `${transform.e + bcr.x}px`;
                    helpElement.style.top = `${transform.f + bcr.y}px`;
                }

                const x = this.size[0] - iconSize - iconMargin;
                const y = -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - iconSize) / 2;

                ctx.save();
                ctx.translate(x, y);
                ctx.scale(iconSize / 32, iconSize / 32);
                
                ctx.beginPath();
                ctx.arc(16, 16, 14, 0, Math.PI * 2);
                ctx.fillStyle = this._tagSelectorHelp ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(16, 16, 14, 0, Math.PI * 2);
                ctx.strokeStyle = this._tagSelectorHelp ? '#60a5fa' : 'rgba(96, 165, 250, 0.6)';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.font = 'bold 24px system-ui';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = this._tagSelectorHelp ? '#93c5fd' : '#60a5fa';
                ctx.fillText('?', 16, 19);
                
                ctx.restore();
                return r;
            };

            const mouseDown = nodeType.prototype.onMouseDown;
            nodeType.prototype.onMouseDown = function (e, localPos, canvas) {
                const r = mouseDown ? mouseDown.apply(this, arguments) : undefined;
                const iconX = this.size[0] - iconSize - iconMargin;
                const iconY = -LiteGraph.NODE_TITLE_HEIGHT + (LiteGraph.NODE_TITLE_HEIGHT - iconSize) / 2;
                if (
                    localPos[0] > iconX &&
                    localPos[0] < iconX + iconSize &&
                    localPos[1] > iconY &&
                    localPos[1] < iconY + iconSize
                ) {
                    this._tagSelectorHelp = !this._tagSelectorHelp;
                    return true;
                }
                return r;
            };

            const onRemoved = nodeType.prototype.onRemoved;
            nodeType.prototype.onRemoved = function () {
                const r = onRemoved ? onRemoved.apply(this, []) : undefined;
                if (helpElement) {
                    helpElement.remove();
                    helpElement = null;
                    currentHelpLocale = null;
                }
                return r;
            };
        }
    },
    nodeCreated(node) {
        if (node.comfyClass === "TagSelector") {
            const button = node.addWidget("button", $t('openTagSelector'), "open_selector", () => {
                openTagSelector(node);
            });
            button.serialize = false;
            
            const applyWidgetVisibility = (widget, show) => {
                if (!widget) return;
                widget.hidden = !show;
                widget.disabled = !show;
                if (widget.options && typeof widget.options === "object") {
                    widget.options.hidden = !show;
                }
                if (widget.inputEl) {
                    widget.inputEl.disabled = !show;
                    widget.inputEl.style.display = show ? '' : 'none';
                }
            };
            
            const updateExpandWidgets = () => {
                const expandModeWidget = node.widgets?.find(w => w.name === "expand_mode");
                const outputLangWidget = node.widgets?.find(w => w.name === "output_language");
                const platformWidget = node.widgets?.find(w => w.name === "platform");
                const maxTokensWidget = node.widgets?.find(w => w.name === "max_tokens");
                
                const isDisabled = !expandModeWidget || expandModeWidget.value === "Disabled";
                
                applyWidgetVisibility(outputLangWidget, !isDisabled);
                applyWidgetVisibility(platformWidget, !isDisabled);
                applyWidgetVisibility(maxTokensWidget, !isDisabled);
            };
            
            const expandModeWidget = node.widgets?.find(w => w.name === "expand_mode");
            if (expandModeWidget) {
                const originalCallback = expandModeWidget.callback;
                expandModeWidget.callback = (value) => {
                    if (originalCallback) originalCallback.call(node, value);
                    updateExpandWidgets();
                };
            }
            
            setTimeout(updateExpandWidgets, 100);
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
    tagSelectorDialog.classList.remove('zs-overlay-exit');
    tagSelectorDialog.classList.add('zs-overlay-enter');
    
    if (tagSelectorDialog.dialogElement) {
        tagSelectorDialog.dialogElement.classList.remove('zs-dialog-exit');
        tagSelectorDialog.dialogElement.classList.add('zs-dialog-enter');
    }

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
            window.tagsData = tagsData; 
        } else {
            console.warn('Failed to load tags from server, using default data');
            tagsData = getDefaultTagsData();
            window.tagsData = tagsData; 
        }
    } catch (error) {
        console.error('Error loading tags:', error);
        tagsData = getDefaultTagsData();
        window.tagsData = tagsData;
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
    (function injectDialogAnimationStyle(){
        const styleId = 'zs-dialog-animation-style';
        if (!document.getElementById(styleId)) {
            const styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.textContent = `
                @keyframes zsDialogFadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes zsDialogSlideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                @keyframes zsDialogFadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }
                @keyframes zsDialogSlideOut {
                    from {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: scale(0.9) translateY(-20px);
                    }
                }
                .zs-overlay-enter {
                    animation: zsDialogFadeIn 0.25s ease-out forwards;
                }
                .zs-overlay-exit {
                    animation: zsDialogFadeOut 0.2s ease-in forwards;
                }
                .zs-dialog-enter {
                    animation: zsDialogSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .zs-dialog-exit {
                    animation: zsDialogSlideOut 0.2s ease-in forwards;
                }
            `;
            document.head.appendChild(styleEl);
        }
    })();

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
        box-shadow: none;
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
    
    const closeDialog = () => {
        overlay.classList.remove('zs-overlay-enter');
        dialog.classList.remove('zs-dialog-enter');
        overlay.classList.add('zs-overlay-exit');
        dialog.classList.add('zs-dialog-exit');
        
        const handleAnimationEnd = () => {
            overlay.style.display = 'none';
            overlay.classList.remove('zs-overlay-exit');
            dialog.classList.remove('zs-dialog-exit');
            overlay.removeEventListener('animationend', handleAnimationEnd);
            dialog.removeEventListener('animationend', handleAnimationEnd);
        };
        
        overlay.addEventListener('animationend', handleAnimationEnd);
        dialog.addEventListener('animationend', handleAnimationEnd);

        if (tagSelectorDialog && tagSelectorDialog.keydownHandler) {
            document.removeEventListener('keydown', tagSelectorDialog.keydownHandler);
        }

        if (previewPopup && previewPopup.style.display === 'block') {
            previewPopup.style.display = 'none';

            enableMainUIInteraction();
        }
    };
    
    closeBtn.onclick = closeDialog;

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
        max-height: 180px;
        min-height: 0px;
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
        max-height: 180px;
        min-height: 0px;
        backdrop-filter: blur(10px);
        margin-top: 2px;
        border: none;
    `;

    const tagContent = document.createElement('div');
    tagContent.style.cssText = `
        flex: 1;
        padding: 10px 10px;
        overflow-y: auto;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        backdrop-filter: blur(10px);
    `;

    const footer = document.createElement('div');
    footer.style.cssText = `
        background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
        padding: 0 16px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        backdrop-filter: blur(10px);
        border-radius: 0 0 16px 16px;
        column-gap: 8px;
        min-height: 60px;
        height: 60px;
        flex-shrink: 0;
        position: relative;
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
    nameInput.placeholder = '输入标签名称 (纯中文:9个, 纯英文:18个字符)';
    nameInput.maxLength = 18;
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
    function countChineseAndEnglish(text) {
        let chineseCount = 0;
        let englishCount = 0;
        
        for (let char of text) {
            if (/[\u4e00-\u9fa5]/.test(char)) {
                chineseCount++;
            } else if (/[a-zA-Z]/.test(char)) {
                englishCount++;
            }
        }
        
        return { chinese: chineseCount, english: englishCount };
    }
    
    function validateCharacterLength(text) {
        const counts = countChineseAndEnglish(text);
        
        if (counts.chinese > 0 && counts.english === 0) {
            return counts.chinese <= 9;
        }
        
        if (counts.english > 0 && counts.chinese === 0) {
            return counts.english <= 18;
        }
        
        const mixedCount = counts.chinese + (counts.english * 0.5);
        return mixedCount <= 9;
    }
    
    nameInput.addEventListener('input', () => {
        const value = nameInput.value;
        
        if (!validateCharacterLength(value)) {
            let truncatedValue = value;
            while (truncatedValue.length > 0 && !validateCharacterLength(truncatedValue)) {
                truncatedValue = truncatedValue.substring(0, truncatedValue.length - 1);
            }
            nameInput.value = truncatedValue;
        }
    });
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
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
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
            showToast('请填写完整的名称和标签内容', 'warning');
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

                showToast('标签添加成功！', 'success');
            } else {
                showToast(result.error || '添加失败', 'error');
            }
        } catch (error) {
            console.error('Error adding custom tag:', error);
            showToast('添加失败，请重试', 'error');
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
        margin-left: 20px;
        margin-right: 8px;
        flex-shrink: 0;
    `;

    const clearButtonContainer = document.createElement('div');
    clearButtonContainer.style.cssText = `
        display: flex;
        align-items: center;
        position: absolute;
        left: 50%; /* 水平居中 */
        top: 50%;
        transform: translate(-50%, -50%); /* 水平垂直居中 */
        margin-left: 0;
        z-index: 10;
        gap: 12px;
    `;

    const quickRandomBtn = document.createElement('button');
    quickRandomBtn.innerHTML = '<span style="font-size: 14px; font-weight: 600; display: block;">一键随机</span>';
    quickRandomBtn.style.cssText = `
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
        border: 1px solid rgba(139, 92, 246, 0.7);
        color: #ffffff;
        padding: 7px 14px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
        line-height: 1.2;
        height: 35px;
        width: auto;
        min-width: 90px;
        white-space: nowrap;
        font-size: 14px;
    `;
    quickRandomBtn.addEventListener('mouseenter', () => {
        quickRandomBtn.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
        quickRandomBtn.style.boxShadow = '0 4px 8px rgba(139, 92, 246, 0.4)';
        quickRandomBtn.style.transform = 'none';
    });
    quickRandomBtn.addEventListener('mouseleave', () => {
        quickRandomBtn.style.background = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)';
        quickRandomBtn.style.boxShadow = 'none';
        quickRandomBtn.style.transform = 'none';
    });
    quickRandomBtn.onclick = () => {
        if (window.generateRandomCombination) {
            window.generateRandomCombination();
        }
    };

    const restoreBtn = document.createElement('button');
    restoreBtn.innerHTML = '<span style="font-size: 14px; font-weight: 600; display: block;">恢复选择</span>';
    restoreBtn.style.cssText = `
        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        border: 1px solid rgba(14, 165, 233, 0.7);
        color: #ffffff;
        padding: 7px 14px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
        line-height: 1.2;
        height: 35px;
        width: auto;
        min-width: 90px;
        white-space: nowrap;
        font-size: 14px;
    `;
    restoreBtn.addEventListener('mouseenter', () => {
        restoreBtn.style.background = 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)';
        restoreBtn.style.boxShadow = '0 4px 8px rgba(14, 165, 233, 0.4)';
        restoreBtn.style.transform = 'none';
    });
    restoreBtn.addEventListener('mouseleave', () => {
        restoreBtn.style.background = 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)';
        restoreBtn.style.boxShadow = 'none';
        restoreBtn.style.transform = 'none';
    });
    restoreBtn.onclick = () => {
        restoreSelectedTags();
    };

    const clearBtn = document.createElement('button');
    clearBtn.innerHTML = '<span style="font-size: 14px; font-weight: 600; display: block;">清空选择</span>';
    clearBtn.style.cssText = `
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        border: 1px solid rgba(220, 38, 38, 0.8);
        color: #ffffff;
        padding: 7px 14px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
        line-height: 1.2;
        height: 35px;
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
        if (tagSelectorDialog.activeCategory === '随机标签') {
            if (!window.selectedTags || window.selectedTags.size === 0) {
                return;
            }
        }
        clearSelectedTags();
    };

    clearButtonContainer.appendChild(quickRandomBtn);
    clearButtonContainer.appendChild(restoreBtn);
    clearButtonContainer.appendChild(clearBtn);
    footer.appendChild(rightButtonsSection);
    footer.appendChild(clearButtonContainer);
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
    tagSelectorDialog.dialogElement = dialog;
    tagSelectorDialog.closeDialog = closeDialog;
    tagSelectorDialog.clearButtonContainer = clearButtonContainer;
    tagSelectorDialog.clearBtn = clearBtn;
    tagSelectorDialog.quickRandomBtn = quickRandomBtn;
    tagSelectorDialog.restoreBtn = restoreBtn;
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
        if (tagSelectorDialog && tagSelectorDialog.activeCategory === '随机标签') {
            return;
        }

        if (e.key === 'Escape') {

            if (previewPopup && previewPopup.style.display === 'block') {
                previewPopup.style.display = 'none';

                enableMainUIInteraction();
                return;
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

let adultContentEnabled = false;
let adultContentUnlocked = false;

window.adultContentEnabled = adultContentEnabled;
window.adultContentUnlocked = adultContentUnlocked;

function updateWindowAdultStatus() {
    window.adultContentEnabled = adultContentEnabled;
    window.adultContentUnlocked = adultContentUnlocked;
}

function loadAdultContentSettings() {
    try {
        const settings = localStorage.getItem('zhihui_adult_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            adultContentEnabled = parsed.enabled || false;
            adultContentUnlocked = parsed.unlocked || false;
            updateWindowAdultStatus();
        }
    } catch (e) {
        console.error('加载成人内容设置失败:', e);
    }
}

function saveAdultContentSettings() {
    try {
        localStorage.setItem('zhihui_adult_settings', JSON.stringify({
            enabled: adultContentEnabled,
            unlocked: adultContentUnlocked
        }));
    } catch (e) {
        console.error('保存成人内容设置失败:', e);
    }
}

function showAdultUnlockDialog(onUnlock) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 20000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(8px);
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 2px solid #ef4444;
        border-radius: 16px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    `;

    const title = document.createElement('h2');
    title.textContent = '⚠️ 成人内容风险提示';
    title.style.cssText = `
        color: #ef4444;
        font-size: 20px;
        font-weight: 700;
        margin: 0 0 16px 0;
        text-align: center;
    `;

    const warning = document.createElement('div');
    warning.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="color: #fca5a5; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">
                <strong>您即将开启成人限制级内容显示功能。</strong>
            </p>
            <p style="color: #fca5a5; font-size: 13px; line-height: 1.6; margin: 0 0 8px 0;">
                开启此功能后，您将可以访问包含成人内容、性暗示、裸露等限制级标签。这些内容可能不适合以下人群：
            </p>
            <ul style="color: #fca5a5; font-size: 13px; line-height: 1.6; margin: 8px 0; padding-left: 20px;">
                <li>未满18周岁的未成年人</li>
                <li>对成人内容感到不适的用户</li>
                <li>在工作或公共场合使用本软件的用户</li>
            </ul>
        </div>
        
        <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="color: #93c5fd; font-size: 13px; line-height: 1.6; margin: 0 0 8px 0;">
                <strong>使用须知：</strong>
            </p>
            <ul style="color: #93c5fd; font-size: 13px; line-height: 1.6; margin: 8px 0; padding-left: 20px;">
                <li>您确认已年满18周岁，具有完全民事行为能力</li>
                <li>您理解并自愿承担使用成人内容可能带来的风险</li>
                <li>您承诺遵守当地法律法规，合法使用本功能</li>
                <li>本功能仅用于AI绘画创作参考，请勿用于非法用途</li>
            </ul>
        </div>
    `;

    const checkboxContainer = document.createElement('div');
    checkboxContainer.style.cssText = `
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 16px;
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'adult-consent-checkbox';
    checkbox.style.cssText = `
        width: 18px;
        height: 18px;
        margin-top: 2px;
        cursor: pointer;
        accent-color: #ef4444;
    `;

    const checkboxLabel = document.createElement('label');
    checkboxLabel.htmlFor = 'adult-consent-checkbox';
    checkboxLabel.textContent = '我已阅读并理解上述风险提示，确认我已年满18周岁，自愿开启成人内容显示功能。';
    checkboxLabel.style.cssText = `
        color: #e2e8f0;
        font-size: 13px;
        line-height: 1.5;
        cursor: pointer;
    `;

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(checkboxLabel);

    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
        margin-bottom: 20px;
    `;

    const inputLabel = document.createElement('div');
    inputLabel.innerHTML = `
        <span style="color: #fca5a5; font-size: 13px; font-weight: 500;">请输入验证文字：</span>
        <span style="color: #ef4444; font-size: 14px; font-weight: 700;">我已知晓</span>
    `;
    inputLabel.style.cssText = `
        margin-bottom: 8px;
    `;

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = '请输入：我已知晓';
    textInput.style.cssText = `
        width: 100%;
        padding: 10px 12px;
        border: 1px solid rgba(239, 68, 68, 0.4);
        border-radius: 6px;
        background: rgba(15, 23, 42, 0.8);
        color: #e2e8f0;
        font-size: 14px;
        box-sizing: border-box;
        transition: all 0.2s;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    `;
    textInput.onfocus = () => {
        textInput.style.borderColor = '#ef4444';
        textInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
    };
    textInput.onblur = () => {
        textInput.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        textInput.style.boxShadow = 'none';
    };
    textInput.onpaste = (e) => {
        e.preventDefault();
        return false;
    };
    textInput.oncopy = (e) => {
        e.preventDefault();
        return false;
    };
    textInput.oncut = (e) => {
        e.preventDefault();
        return false;
    };

    inputContainer.appendChild(inputLabel);
    inputContainer.appendChild(textInput);

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 12px;
        justify-content: center;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.style.cssText = `
        padding: 10px 24px;
        border: 1px solid rgba(148, 163, 184, 0.4);
        border-radius: 8px;
        background: transparent;
        color: #94a3b8;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    `;
    cancelBtn.onmouseenter = () => {
        cancelBtn.style.background = 'rgba(148, 163, 184, 0.1)';
        cancelBtn.style.color = '#e2e8f0';
    };
    cancelBtn.onmouseleave = () => {
        cancelBtn.style.background = 'transparent';
        cancelBtn.style.color = '#94a3b8';
    };
    cancelBtn.onclick = () => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        document.body.removeChild(overlay);
    };

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '确认开启 (12)';
    confirmBtn.disabled = true;
    confirmBtn.style.cssText = `
        padding: 10px 24px;
        border: none;
        border-radius: 8px;
        background: #475569;
        color: #fff;
        font-size: 14px;
        font-weight: 500;
        cursor: not-allowed;
        transition: all 0.2s;
        opacity: 0.5;
    `;

    let countdown = 12;
    let countdownInterval = null;
    let countdownFinished = false;

    function startCountdown() {
        countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                confirmBtn.textContent = `确认开启 (${countdown})`;
            } else {
                clearInterval(countdownInterval);
                countdownFinished = true;
                confirmBtn.textContent = '确认开启';
                updateConfirmButton();
            }
        }, 1000);
    }

    startCountdown();

    function updateConfirmButton() {
        const isChecked = checkbox.checked;
        const isTextValid = textInput.value.trim() === '我已知晓';
        const canConfirm = isChecked && isTextValid && countdownFinished;

        confirmBtn.disabled = !canConfirm;
        confirmBtn.style.background = canConfirm ? '#ef4444' : '#475569';
        confirmBtn.style.cursor = canConfirm ? 'pointer' : 'not-allowed';
        confirmBtn.style.opacity = canConfirm ? '1' : '0.5';
    }

    checkbox.onchange = updateConfirmButton;
    textInput.oninput = updateConfirmButton;

    confirmBtn.onmouseenter = () => {
        if (!confirmBtn.disabled) {
            confirmBtn.style.background = '#dc2626';
            confirmBtn.style.transform = 'scale(1.02)';
        }
    };
    confirmBtn.onmouseleave = () => {
        if (!confirmBtn.disabled) {
            confirmBtn.style.background = '#ef4444';
            confirmBtn.style.transform = 'scale(1)';
        }
    };
    confirmBtn.onclick = () => {
        if (!confirmBtn.disabled) {
            adultContentUnlocked = true;
            adultContentEnabled = true;
            updateWindowAdultStatus();
            saveAdultContentSettings();
            document.body.removeChild(overlay);
            if (onUnlock) onUnlock();
        }
    };

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);

    dialog.appendChild(title);
    dialog.appendChild(warning);
    dialog.appendChild(checkboxContainer);
    dialog.appendChild(inputContainer);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

function createAdultToggleButton() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        margin-top: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        position: relative;
        border-top: 1px solid rgba(148, 163, 184, 0.2);
        background: linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.3) 100%);
    `;

    const titleSection = document.createElement('div');
    titleSection.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding-bottom: 4px;
        width: 100%;
    `;

    const titleIcon = document.createElement('span');
    titleIcon.textContent = adultContentEnabled ? '🔓' : '🔒';
    titleIcon.style.cssText = `
        font-size: 11px;
        opacity: 0.8;
    `;

    const title = document.createElement('span');
    title.textContent = '成人内容';
    title.style.cssText = `
        color: ${adultContentEnabled ? 'rgba(252, 165, 165, 0.9)' : 'rgba(148, 163, 184, 0.7)'};
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.5px;
    `;

    const statusDot = document.createElement('span');
    statusDot.style.cssText = `
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${adultContentEnabled ? '#ef4444' : '#64748b'};
        box-shadow: ${adultContentEnabled ? '0 0 6px #ef4444' : 'none'};
        transition: all 0.3s ease;
    `;

    titleSection.appendChild(titleIcon);
    titleSection.appendChild(title);
    titleSection.appendChild(statusDot);

    const button = document.createElement('div');
    button.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 3px 6px;
        border-radius: 4px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: ${adultContentEnabled
            ? 'rgba(239, 68, 68, 0.85)'
            : 'linear-gradient(135deg, rgba(100, 116, 139, 0.2) 0%, rgba(71, 85, 105, 0.15) 100%)'};
        border: 1px solid ${adultContentEnabled ? 'rgba(239, 68, 68, 0.9)' : 'rgba(100, 116, 139, 0.5)'};
        width: fit-content;
    `;

    const buttonText = document.createElement('span');
    buttonText.textContent = adultContentEnabled ? '已开启' : '点击解锁';
    buttonText.style.cssText = `
        color: ${adultContentEnabled ? '#ffffff' : '#94a3b8'};
        font-size: 12px;
        font-weight: 500;
        transition: all 0.3s ease;
    `;

    button.appendChild(buttonText);
    wrapper.appendChild(titleSection);
    wrapper.appendChild(button);

    button.onclick = () => {
        if (!adultContentEnabled) {
            showAdultUnlockDialog(() => {
                updateAdultToggleUI(titleIcon, title, statusDot, button, buttonText);
                initializeCategoryList();
            });
        } else {
            adultContentEnabled = false;
            adultContentUnlocked = false;
            updateWindowAdultStatus();
            saveAdultContentSettings();
            updateAdultToggleUI(titleIcon, title, statusDot, button, buttonText);
            initializeCategoryList();
        }
    };

    button.onmouseenter = () => {
        button.style.transform = 'scale(1.02)';
        button.style.background = adultContentEnabled
            ? 'rgba(220, 38, 38, 0.95)'
            : 'linear-gradient(135deg, rgba(100, 116, 139, 0.3) 0%, rgba(71, 85, 105, 0.25) 100%)';
    };

    button.onmouseleave = () => {
        button.style.transform = 'scale(1)';
        button.style.background = adultContentEnabled
            ? 'rgba(239, 68, 68, 0.85)'
            : 'linear-gradient(135deg, rgba(100, 116, 139, 0.2) 0%, rgba(71, 85, 105, 0.15) 100%)';
    };

    return wrapper;
}

function updateAdultToggleUI(titleIcon, title, statusDot, button, buttonText) {
    titleIcon.textContent = adultContentEnabled ? '🔓' : '🔒';
    title.style.color = adultContentEnabled ? 'rgba(252, 165, 165, 0.9)' : 'rgba(148, 163, 184, 0.7)';
    statusDot.style.background = adultContentEnabled ? '#ef4444' : '#64748b';
    statusDot.style.boxShadow = adultContentEnabled ? '0 0 6px #ef4444' : 'none';
    
    buttonText.textContent = adultContentEnabled ? '已开启' : '点击解锁';
    buttonText.style.color = adultContentEnabled ? '#ffffff' : '#94a3b8';

    button.style.background = adultContentEnabled
        ? 'rgba(239, 68, 68, 0.85)'
        : 'linear-gradient(135deg, rgba(100, 116, 139, 0.2) 0%, rgba(71, 85, 105, 0.15) 100%)';
    button.style.borderColor = adultContentEnabled ? 'rgba(239, 68, 68, 0.9)' : 'rgba(100, 116, 139, 0.5)';
}

function initializeCategoryList() {
    loadAdultContentSettings();
    
    const categoryList = tagSelectorDialog.categoryList;
    categoryList.innerHTML = '';
    
    const categoriesContainer = document.createElement('div');
    categoriesContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        height: 100%;
    `;
    
    const scrollContainer = document.createElement('div');
    scrollContainer.style.cssText = `
        flex: 1;
        overflow-y: auto;
    `;
    
    let allCategories = [...Object.keys(tagsData), '随机标签'];
    
    if (!adultContentEnabled) {
        allCategories = allCategories.filter(cat => cat !== '涩影湿');
    }
    
    const customOrder = ['常规标签', '艺术题材', '人物类', '动物生物', '场景类', '涩影湿', '随机标签', '灵感套装', '自定义'];
    allCategories.sort((a, b) => {
        return customOrder.indexOf(a) - customOrder.indexOf(b);
    });

    allCategories.forEach((category, index) => {
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
            scrollContainer.querySelectorAll('.active').forEach(item => {
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

            if (category === '随机标签') {
                if (window.openRandomGeneratorDialog) {
                    window.openRandomGeneratorDialog(tagSelectorDialog);
                }
            } else {
                showSubCategories(category);
            }
        };

        scrollContainer.appendChild(categoryItem);

        if (index === 0) {
            setTimeout(() => categoryItem.click(), 0);
        }
    });
    
    categoriesContainer.appendChild(scrollContainer);
    
    const adultToggle = createAdultToggleButton();
    categoriesContainer.appendChild(adultToggle);
    
    categoryList.appendChild(categoriesContainer);
    
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
    
    const categoriesToShowClearButton = ['常规标签', '艺术题材', '人物类', '场景类', '动物生物', '灵感套装', '涩影湿'];
    if (tagSelectorDialog.clearButtonContainer) {
        if (categoriesToShowClearButton.includes(category)) {
            tagSelectorDialog.clearButtonContainer.style.display = 'flex';
        } else {
            tagSelectorDialog.clearButtonContainer.style.display = 'none';
        }
    }
    
    if (tagSelectorDialog.restoreBtn) {
        if (categoriesToShowClearButton.includes(category)) {
            tagSelectorDialog.restoreBtn.style.display = 'block';
        } else {
            tagSelectorDialog.restoreBtn.style.display = 'none';
        }
    }
    if (tagSelectorDialog.managementButtonsContainer) {
        tagSelectorDialog.managementButtonsContainer.style.display = 'none';
    }
    if (tagSelectorDialog.formButtonsContainer) {
        tagSelectorDialog.formButtonsContainer.style.display = 'none';
    }
    
    if (tagSelectorDialog.quickRandomBtn) {
        tagSelectorDialog.quickRandomBtn.style.display = 'none';
    }
    const subCategories = tagsData[category];
    
    let subCategoryKeys = Object.keys(subCategories);
    if (category === '自定义' && !subCategoryKeys.includes('标签管理')) {
        subCategoryKeys = [...subCategoryKeys, '标签管理'];
    }
    
    subCategoryKeys.forEach((subCategory, index) => {
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

            if (category === '自定义' && subCategory === '标签管理') {
                showCustomTagManagement();
            } else {
                const subCategoryData = tagsData[category][subCategory];

                if (category === '自定义') {
                    showTags(category, subCategory);
                } else if (Array.isArray(subCategoryData)) {
                    showTags(category, subCategory);
                } else {
                    showSubSubCategories(category, subCategory);
                }
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
    if (tagSelectorDialog.selectedTagsList && tagSelectorDialog.hintText && tagSelectorDialog.selectedCount) {
        tagSelectorDialog.hintText.textContent = '💡未选择任何标签，请从下方选择您需要的TAG标签，或通过搜索栏快速查找。';
        if (selectedTags.size > 0) {
            tagSelectorDialog.hintText.style.display = 'none';
            tagSelectorDialog.selectedCount.style.display = 'inline-block';
            tagSelectorDialog.selectedTagsList.style.display = 'flex';
        } else {
            tagSelectorDialog.hintText.style.display = 'inline-block';
            tagSelectorDialog.selectedCount.style.display = 'none';
            tagSelectorDialog.selectedTagsList.style.display = 'none';
        }
    }

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
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '120px'
    });

     const displayText = display.length > 13 ? display.substring(0, 13) + '...' : display;
    tagElement.textContent = displayText;
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

function createCustomTagTooltip(tagValue, tagName, tagObj) {
    const tooltip = document.createElement('div');
    
    applyStyles(tooltip, {
        ...commonStyles.tooltip.base,
        padding: '12px',
        fontSize: '12px',
        zIndex: '10000',
        pointerEvents: 'none',
        opacity: '0',
        transform: 'translateY(-100%) translateY(-8px)',
        minWidth: '320px',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '10px'
    });
    
    const mainContainer = document.createElement('div');
    mainContainer.style.cssText = `
        width: 100%;
        display: flex;
        flex-direction: row;
        gap: 12px;
        align-items: flex-start;
    `;
    
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
        flex: 1;
        text-align: left;
        word-wrap: break-word;
        line-height: 1.4;
        color: #e2e8f0;
        background: transparent;
        padding: 0px;
        border-radius: 0px;
        border: none;
        font-size: 12px;
        max-height: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 10;
        -webkit-box-orient: vertical;
    `;

    contentDiv.textContent = tagValue;
    const previewContainer = document.createElement('div');
    previewContainer.style.cssText = `
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    `;
    
    const previewDiv = document.createElement('div');
    previewDiv.style.cssText = `
        border-radius: 0px;
        overflow: hidden;
        flex-shrink: 0;
        border: none;
        box-shadow: none;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 140px;
        min-height: 140px;
        background: transparent;
        position: relative;
        transition: all 0.3s ease;
    `;
    
    const previewImg = document.createElement('img');
    previewImg.style.cssText = `
        object-fit: contain;
        background-color: transparent;
        display: block;
        max-width: 220px;
        max-height: 160px;
        width: auto;
        height: auto;
        border-radius: 8px;
        transition: all 0.3s ease;
        opacity: 0;
    `;

    const timestamp = tagObj && tagObj.imageTimestamp ? `?t=${tagObj.imageTimestamp}` : '';
    const imageUrl = `/zhihui/user_tags/preview/${encodeURIComponent(tagName)}${timestamp}`;
    previewImg.src = imageUrl;
    previewImg.alt = `预览: ${tagName}`;
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #94a3b8;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        z-index: 2;
    `;
    loadingDiv.innerHTML = `
        <div style="
            width: 16px; 
            height: 16px; 
            border: 2px solid #3b82f6; 
            border-top: 2px solid transparent; 
            border-radius: 50%; 
            animation: spin 1s linear infinite;
        "></div>
        加载中...
    `;
    
    if (!document.getElementById('tooltip-spin-animation')) {
        const style = document.createElement('style');
        style.id = 'tooltip-spin-animation';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    previewImg.onload = () => {
        loadingDiv.style.display = 'none';
        previewImg.style.opacity = '1';
        previewImg.style.transform = 'scale(1)';
    };
    
    previewImg.onerror = () => {
        loadingDiv.innerHTML = `
            <div style="font-size: 24px;">📷</div>
            <div>无预览图片</div>
        `;
        
        previewImg.style.display = 'none';
    };
    
    previewDiv.addEventListener('mouseenter', () => {
        previewDiv.style.transform = 'scale(1.02)';
        previewDiv.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
    });
    
    previewDiv.addEventListener('mouseleave', () => {
        previewDiv.style.transform = 'scale(1)';
        previewDiv.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.3)';
    });
    
    previewDiv.appendChild(loadingDiv);
    previewDiv.appendChild(previewImg);
    previewContainer.appendChild(previewDiv);
    mainContainer.appendChild(previewContainer);
    mainContainer.appendChild(contentDiv);
    tooltip.appendChild(mainContainer);
  
    return tooltip;
}

function showTags(category, subCategory) {

    if (tagSelectorDialog.selectedTagsList && tagSelectorDialog.hintText && tagSelectorDialog.selectedCount) {
        tagSelectorDialog.hintText.textContent = '💡未选择任何标签，请从下方选择您需要的TAG标签，或通过搜索栏快速查找。';
        
        if (selectedTags.size > 0) {
            tagSelectorDialog.hintText.style.display = 'none';
            tagSelectorDialog.selectedCount.style.display = 'inline-block';
            tagSelectorDialog.selectedTagsList.style.display = 'flex';
        } else {
            tagSelectorDialog.hintText.style.display = 'inline-block';
            tagSelectorDialog.selectedCount.style.display = 'none';
            tagSelectorDialog.selectedTagsList.style.display = 'none';
        }
    }

    const subSubCategoryTabs = tagSelectorDialog.subSubCategoryTabs;
    subSubCategoryTabs.style.display = 'none';

    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
        tagSelectorDialog.subSubSubCategoryTabs.innerHTML = '';
    }

    if (tagSelectorDialog.subCategoryTabs) {
        tagSelectorDialog.subCategoryTabs.style.display = 'flex';
    }
    if (tagSelectorDialog.subSubCategoryTabs) {
        tagSelectorDialog.subSubCategoryTabs.style.display = 'none';
    }
    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
    }
    
    const categoriesToShowClearButton = ['常规标签', '艺术题材', '人物类', '场景类', '动物生物', '灵感套装', '涩影湿'];
    if (tagSelectorDialog.clearButtonContainer) {
        if (categoriesToShowClearButton.includes(category) || (category === '自定义' && subCategory === '我的标签')) {
            tagSelectorDialog.clearButtonContainer.style.display = 'flex';
        } else {
            tagSelectorDialog.clearButtonContainer.style.display = 'none';
        }
    }
    
    if (tagSelectorDialog.restoreBtn) {
        if (categoriesToShowClearButton.includes(category) || (category === '自定义' && subCategory === '我的标签')) {
            tagSelectorDialog.restoreBtn.style.display = 'block';
        } else {
            tagSelectorDialog.restoreBtn.style.display = 'none';
        }
    }
    if (tagSelectorDialog.managementButtonsContainer) {
        tagSelectorDialog.managementButtonsContainer.style.display = 'none';
    }
    if (tagSelectorDialog.formButtonsContainer) {
        tagSelectorDialog.formButtonsContainer.style.display = 'none';
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
        tagEntries = actualTags.map(tagObj => [tagObj.display, tagObj.value, tagObj]);
    } else {
        tagEntries = Object.entries(actualTags);
    }

    tagEntries.forEach(([display, value, tagObj]) => {
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
                tooltip = createCustomTagTooltip(value, display, tagObj);
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
        }

        tagContent.appendChild(tagContainer);
    });
}

function showCustomTagManagement() {
    const tagContent = tagSelectorDialog.tagContent;
    tagContent.innerHTML = '';
    
    if (tagSelectorDialog.subCategoryTabs) {
        tagSelectorDialog.subCategoryTabs.style.display = 'flex';
    }
    if (tagSelectorDialog.subSubCategoryTabs) {
        tagSelectorDialog.subSubCategoryTabs.style.display = 'flex';
    }
    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
    }
    
    if (tagSelectorDialog.clearButtonContainer) {
        tagSelectorDialog.clearButtonContainer.style.display = 'none';
    }
    if (tagSelectorDialog.formButtonsContainer) {
        tagSelectorDialog.formButtonsContainer.style.display = 'none';
    }
    
    if (tagSelectorDialog.quickRandomBtn) {
        tagSelectorDialog.quickRandomBtn.style.display = 'none';
    }
    
    if (tagSelectorDialog.restoreBtn) {
        tagSelectorDialog.restoreBtn.style.display = 'none';
    }
    
    if (tagSelectorDialog.selectedTagsList) {
        tagSelectorDialog.selectedTagsList.style.display = 'none';
    }
    if (tagSelectorDialog.hintText) {
        tagSelectorDialog.hintText.textContent = '💡当处于"标签管理"界面时，会隐藏显示已选标签。';
        tagSelectorDialog.hintText.style.display = 'inline-block';
    }
    if (tagSelectorDialog.selectedCount) {
        tagSelectorDialog.selectedCount.style.display = 'none';
    }
    
    if (!tagSelectorDialog.managementButtonsContainer) {
        const managementButtonsContainer = document.createElement('div');
        managementButtonsContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            position: absolute;
            left: 50%;
            bottom: 10px;
            transform: translateX(-50%);
            z-index: 10;
        `;
        
        const addBtn = document.createElement('button');
        addBtn.innerHTML = '<span style="font-size: 14px; font-weight: 600; display: block;">添加标签</span>';
        addBtn.style.cssText = `
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            border: 1px solid rgba(34, 197, 94, 0.8);
            color: #ffffff;
            padding: 7px 14px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
            line-height: 1.2;
            height: 35px;
            width: auto;
            min-width: 70px;
            white-space: nowrap;
            font-size: 14px;
        `;
        addBtn.addEventListener('mouseenter', () => {
            addBtn.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
            addBtn.style.color = '#ffffff';
            addBtn.style.borderColor = 'rgba(74, 222, 128, 0.8)';
            addBtn.style.transform = 'none';
        });
        addBtn.addEventListener('mouseleave', () => {
            addBtn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
            addBtn.style.color = '#ffffff';
            addBtn.style.borderColor = 'rgba(34, 197, 94, 0.8)';
            addBtn.style.transform = 'none';
        });
        addBtn.onclick = () => {
            createTagManagementForm();
        };
        managementButtonsContainer.appendChild(addBtn);
        
        const deleteAllBtn = document.createElement('button');
        deleteAllBtn.innerHTML = '<span style="font-size: 14px; font-weight: 600; display: block;">删除全部</span>';
        deleteAllBtn.style.cssText = `
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            border: 1px solid rgba(239, 68, 68, 0.8);
            color: #ffffff;
            padding: 7px 14px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
            line-height: 1.2;
            height: 35px;
            width: auto;
            min-width: 70px;
            white-space: nowrap;
            font-size: 14px;
        `;
        deleteAllBtn.addEventListener('mouseenter', () => {
            deleteAllBtn.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
            deleteAllBtn.style.color = '#ffffff';
            deleteAllBtn.style.borderColor = 'rgba(248, 113, 113, 0.8)';
            deleteAllBtn.style.transform = 'none';
        });
        deleteAllBtn.addEventListener('mouseleave', () => {
            deleteAllBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            deleteAllBtn.style.color = '#ffffff';
            deleteAllBtn.style.borderColor = 'rgba(239, 68, 68, 0.8)';
            deleteAllBtn.style.transform = 'none';
        });
        
        deleteAllBtn.onclick = () => {
            const customTags = tagsData['自定义']?.['我的标签'] || [];
            if (customTags.length === 0) {
                showToast('没有可删除的自定义标签', 'info');
                return;
            }
            
            const warningDialog = document.createElement('div');
            warningDialog.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            const warningCard = document.createElement('div');
            warningCard.style.cssText = `
                background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
                border: 2px solid #ef4444;
                border-radius: 8px;
                padding: 20px;
                max-width: 500px;
                color: #ffffff;
                text-align: center;
            `;
            
            const warningTitle = document.createElement('div');
            warningTitle.style.cssText = `
                color: #ef4444;
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 15px;
            `;
            warningTitle.textContent = '⚠️ 高危操作警告';
            
            const warningMessage = document.createElement('div');
            warningMessage.style.cssText = `
                color: #f9fafb;
                font-size: 16px;
                margin-bottom: 20px;
                line-height: 1.5;
            `;
            warningMessage.innerHTML = `
                <p>您即将删除所有自定义标签（共 ${customTags.length} 个标签）</p>
                <p style="color: #fbbf24; font-weight: bold;">此操作不可撤销！</p>
                <p style="color: #e5e7eb; font-size: 14px; margin-top: 10px;">请输入 "<strong style="color: #ef4444;">确认删除</strong>" 来确认此操作：</p>
            `;
            
            const confirmInput = document.createElement('input');
            confirmInput.type = 'text';
            confirmInput.placeholder = '请输入：确认删除';
            confirmInput.style.cssText = `
                width: 80%;
                padding: 10px;
                border: 2px solid #ef4444;
                border-radius: 4px;
                background: #374151;
                color: #ffffff;
                font-size: 14px;
                margin-bottom: 20px;
                text-align: center;
            `;
            
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `
                display: flex;
                gap: 15px;
                justify-content: center;
            `;
            
            const cancelButton = document.createElement('button');
            cancelButton.textContent = '取消';
            cancelButton.style.cssText = `
                background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
                border: 1px solid rgba(107, 114, 128, 0.8);
                color: #ffffff;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s ease;
            `;
            cancelButton.onclick = () => {
                document.body.removeChild(warningDialog);
            };
            
            const confirmButton = document.createElement('button');
            confirmButton.textContent = '确认删除';
            confirmButton.style.cssText = `
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                border: 1px solid rgba(239, 68, 68, 0.8);
                color: #ffffff;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s ease;
                opacity: 0.5;
                cursor: not-allowed;
            `;
            
            const updateConfirmButtonState = () => {
                if (confirmInput.value === '确认删除') {
                    confirmButton.style.opacity = '1';
                    confirmButton.style.cursor = 'pointer';
                    confirmButton.style.pointerEvents = 'auto';
                } else {
                    confirmButton.style.opacity = '0.5';
                    confirmButton.style.cursor = 'not-allowed';
                    confirmButton.style.pointerEvents = 'none';
                }
            };
            
            confirmInput.addEventListener('input', updateConfirmButtonState);
            confirmInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && confirmInput.value === '确认删除') {
                    confirmDelete();
                }
            });
            
            const confirmDelete = async () => {
                try {
                    const response = await fetch('/zhihui/user_tags/all', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        if (tagsData['自定义']) {
                            tagsData['自定义']['我的标签'] = [];
                        }
                        
                        localStorage.setItem('tagSelector_user_tags', JSON.stringify(tagsData));
                        document.body.removeChild(warningDialog);
                        showCustomTagManagement();
                        showToast(result.message || '所有自定义标签和图片已成功删除！', 'success');
                    } else {
                        showToast(result.error || '删除失败，请重试', 'error');
                    }
                } catch (error) {
                    console.error('Error deleting all tags and images:', error);
                    showToast('删除失败，请重试', 'error');
                }
            };
            
            confirmButton.onclick = confirmDelete;
            cancelButton.addEventListener('mouseenter', () => {
                cancelButton.style.background = 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)';
            });
            cancelButton.addEventListener('mouseleave', () => {
                cancelButton.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
            });
            
            confirmButton.addEventListener('mouseenter', () => {
                if (confirmInput.value === '确认删除') {
                    confirmButton.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
                }
            });
            confirmButton.addEventListener('mouseleave', () => {
                if (confirmInput.value === '确认删除') {
                    confirmButton.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                }
            });
            
            buttonContainer.appendChild(cancelButton);
            buttonContainer.appendChild(confirmButton);
            warningCard.appendChild(warningTitle);
            warningCard.appendChild(warningMessage);
            warningCard.appendChild(confirmInput);
            warningCard.appendChild(buttonContainer);
            warningDialog.appendChild(warningCard);
            document.body.appendChild(warningDialog);
            confirmInput.focus();
        };
        
        managementButtonsContainer.appendChild(deleteAllBtn);
        const backupBtn = document.createElement('button');
        backupBtn.innerHTML = '<span style="font-size: 14px; font-weight: 600; display: block;">备份用户标签</span>';
        backupBtn.style.cssText = `
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border: 1px solid rgba(59, 130, 246, 0.8);
            color: #ffffff;
            padding: 7px 14px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
            line-height: 1.2;
            height: 35px;
            width: auto;
            min-width: 100px;
            white-space: nowrap;
            font-size: 14px;
        `;
        backupBtn.addEventListener('mouseenter', () => {
            backupBtn.style.background = 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)';
            backupBtn.style.color = '#ffffff';
            backupBtn.style.borderColor = 'rgba(96, 165, 250, 0.8)';
            backupBtn.style.transform = 'none';
        });
        backupBtn.addEventListener('mouseleave', () => {
            backupBtn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            backupBtn.style.color = '#ffffff';
            backupBtn.style.borderColor = 'rgba(59, 130, 246, 0.8)';
            backupBtn.style.transform = 'none';
        });
        backupBtn.onclick = async () => {
            try {
                const response = await fetch('/zhihui/user_tags/backup', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `user_tags_backup_${new Date().toISOString().slice(0, 10)}.zip`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    showToast('备份成功！', 'success');
                } else {
                    const result = await response.json();
                    showToast(result.error || '备份失败', 'error');
                }
            } catch (error) {
                console.error('Error backing up user tags:', error);
                showToast('备份失败，请重试', 'error');
            }
        };
        managementButtonsContainer.appendChild(backupBtn);
        const restoreTagsBtn = document.createElement('button');
        restoreTagsBtn.innerHTML = '<span style="font-size: 14px; font-weight: 600; display: block;">恢复用户标签</span>';
        restoreTagsBtn.style.cssText = `
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            border: 1px solid rgba(245, 158, 11, 0.8);
            color: #ffffff;
            padding: 7px 14px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
            line-height: 1.2;
            height: 35px;
            width: auto;
            min-width: 100px;
            white-space: nowrap;
            font-size: 14px;
        `;
        restoreTagsBtn.addEventListener('mouseenter', () => {
            restoreTagsBtn.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
            restoreTagsBtn.style.color = '#ffffff';
            restoreTagsBtn.style.borderColor = 'rgba(251, 191, 36, 0.8)';
            restoreTagsBtn.style.transform = 'none';
        });
        restoreTagsBtn.addEventListener('mouseleave', () => {
            restoreTagsBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            restoreTagsBtn.style.color = '#ffffff';
            restoreTagsBtn.style.borderColor = 'rgba(245, 158, 11, 0.8)';
            restoreTagsBtn.style.transform = 'none';
        });
        restoreTagsBtn.onclick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.zip';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('backup_file', file);
                try {
                    const response = await fetch('/zhihui/user_tags/restore', {
                        method: 'POST',
                        body: formData
                    });
                    if (response.ok) {
                        const result = await response.json();
                        showToast('恢复成功！', 'success');
                        await loadTagsData();
                        showCustomTagManagement();
                    } else {
                        const result = await response.json();
                        showToast(result.error || '恢复失败', 'error');
                    }
                } catch (error) {
                    console.error('Error restoring user tags:', error);
                    showToast('恢复失败，请重试', 'error');
                }
            };
            input.click();
        };
        managementButtonsContainer.appendChild(restoreTagsBtn);
        
        const footer = tagSelectorDialog.lastElementChild;
        if (footer) {
            footer.appendChild(managementButtonsContainer);
            tagSelectorDialog.managementButtonsContainer = managementButtonsContainer;
        }
    } else {
        tagSelectorDialog.managementButtonsContainer.style.display = 'flex';
    }
    
    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
        color: #38f2f8ff;
        font-size: 16px;
        font-weight: 800;
        margin-bottom: 8px;
        text-align: center;
        padding: 8px 15px;
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 6px;
    `;
    titleBar.textContent = '可编辑自定义标签列表';
    tagContent.appendChild(titleBar);
    
    const tagList = document.createElement('div');
    tagList.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
    `;
    tagContent.appendChild(tagList);
    
    const customTags = tagsData['自定义']?.['我的标签'] || [];
    
    if (!tagSelectorDialog.selectedTagForManagement) {
        tagSelectorDialog.selectedTagForManagement = null;
    }
    
    if (customTags.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.style.cssText = `
            grid-column: 1 / -1;
            text-align: center;
            color: #94a3b8;
            font-size: 16px;
            padding: 40px;
        `;
        emptyMessage.textContent = '暂无自定义标签，请点击下方按钮添加';
        tagList.appendChild(emptyMessage);
    } else {
        customTags.forEach(tag => {
            const tagItem = document.createElement('div');
            tagItem.style.cssText = `
                background: linear-gradient(135deg, #2d3748 0%, #1e293b 100%);
                border: 2px solid #475569;
                border-radius: 6px;
                padding: 10px;
                display: flex;
                gap: 10px;
                position: relative;
                min-height: 100px;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            const tagImage = document.createElement('div');
            tagImage.style.cssText = `
                flex-shrink: 0;
                width: 80px;
                height: 80px;
                border-radius: 4px;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(45deg, #1e293b, #334155);
                position: relative;
            `;
            
            const img = document.createElement('img');
            const timestamp = tag.imageTimestamp ? `?t=${tag.imageTimestamp}` : '';
            const imageUrl = `/zhihui/user_tags/preview/${encodeURIComponent(tag.display)}${timestamp}`;
            img.src = imageUrl;
            img.alt = `预览: ${tag.display}`;
            img.style.cssText = `
                object-fit: cover;
                width: 100%;
                height: 100%;
                display: block;
            `;
            
            img.onerror = () => {
                tagImage.innerHTML = '';
                const noImageText = document.createElement('div');
                noImageText.textContent = '暂无图片';
                noImageText.style.cssText = `
                    color: #94a3b8;
                    font-size: 11px;
                    text-align: center;
                    padding: 5px;
                `;
                tagImage.appendChild(noImageText);
            };
            
            tagImage.appendChild(img);
            tagItem.appendChild(tagImage);
            
            const textContent = document.createElement('div');
            textContent.style.cssText = `
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 6px;
            `;
            
            const tagName = document.createElement('div');
            tagName.style.cssText = `
                font-weight: 600;
                color: #38bdf8;
                font-size: 15px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: calc(100% - 30px);
                min-width: 0;
            `;
            
            const displayText = tag.display.length > 13 ? tag.display.substring(0, 13) + '...' : tag.display;
            tagName.textContent = displayText;
            textContent.appendChild(tagName);
            const tagContentPreview = document.createElement('div');
            tagContentPreview.style.cssText = `
                color: #e2e8f0;
                font-size: 12px;
                max-height: 65px;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 4;
                -webkit-box-orient: vertical;
                flex: 1;
            `;
            tagContentPreview.textContent = tag.value;
            textContent.appendChild(tagContentPreview);
            tagItem.appendChild(textContent);
            
            const actionButtons = document.createElement('div');
            actionButtons.style.cssText = `
                position: absolute;
                top: 6px;
                right: 6px;
                display: none;
                gap: 4px;
            `;
            
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '✏️';
            editBtn.style.cssText = `
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                border: 1px solid rgba(59, 130, 246, 0.8);
                color: white;
                padding: 2px 4px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 10px;
                transition: all 0.2s ease;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            const editTooltip = document.createElement('div');
            editTooltip.textContent = '编辑';
            editTooltip.style.cssText = `
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.2s ease;
                z-index: 1000;
                pointer-events: none;
                margin-bottom: 5px;
            `;
            
            editBtn.addEventListener('mouseenter', () => {
                editBtn.style.background = 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)';
                editBtn.style.transform = 'scale(1.02)';
                editTooltip.style.opacity = '1';
                editTooltip.style.visibility = 'visible';
            });
            editBtn.addEventListener('mouseleave', () => {
                editBtn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                editBtn.style.transform = 'scale(1)';
                editTooltip.style.opacity = '0';
                editTooltip.style.visibility = 'hidden';
            });
            editBtn.onclick = (e) => {
                e.stopPropagation();
                editTooltip.style.opacity = '0';
                editTooltip.style.visibility = 'hidden';
                createTagManagementForm(tag);
            };
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.style.cssText = `
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                border: 1px solid rgba(239, 68, 68, 0.8);
                color: white;
                padding: 2px 4px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 10px;
                transition: all 0.2s ease;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            const deleteTooltip = document.createElement('div');
            deleteTooltip.textContent = '删除';
            deleteTooltip.style.cssText = `
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.2s ease;
                z-index: 1000;
                pointer-events: none;
                margin-bottom: 5px;
            `;
            
            deleteBtn.addEventListener('mouseenter', () => {
                deleteBtn.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
                deleteBtn.style.transform = 'scale(1.02)';
                deleteTooltip.style.opacity = '1';
                deleteTooltip.style.visibility = 'visible';
            });
            deleteBtn.addEventListener('mouseleave', () => {
                deleteBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                deleteBtn.style.transform = 'scale(1)';
                deleteTooltip.style.opacity = '0';
                deleteTooltip.style.visibility = 'hidden';
            });
            deleteBtn.onclick = async (e) => {
                e.stopPropagation();
                deleteTooltip.style.opacity = '0';
                deleteTooltip.style.visibility = 'hidden';
                if (confirm(`确定要删除标签 "${tag.display}" 吗？`)) {
                    try {
                        const response = await fetch('/zhihui/user_tags', {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ name: tag.display })
                        });
                        
                        const result = await response.json();
                        
                        if (response.ok) {
                            const customTagsData = tagsData['自定义']['我的标签'];
                            const tagIndex = customTagsData.findIndex(t => t.id === tag.id);
                            if (tagIndex !== -1) {
                                customTagsData.splice(tagIndex, 1);
                                localStorage.setItem('tagSelector_user_tags', JSON.stringify(tagsData));
                                showCustomTagManagement();
                                showToast('标签删除成功！', 'success');
                            }
                        } else {
                            showToast(result.error || '删除失败', 'error');
                        }
                    } catch (error) {
                        console.error('Error deleting tag:', error);
                        showToast('删除失败，请重试', 'error');
                    }
                }
            };
            
            editBtn.appendChild(editTooltip);
            actionButtons.appendChild(editBtn);
            deleteBtn.appendChild(deleteTooltip);
            actionButtons.appendChild(deleteBtn);
            tagItem.appendChild(actionButtons);
            tagItem.onclick = () => {
                const isCurrentlySelected = tagItem.classList.contains('selected-tag-item');
                tagList.querySelectorAll('.selected-tag-item').forEach(item => {
                    item.classList.remove('selected-tag-item');
                    item.style.borderColor = '#475569';
                    const buttons = item.querySelector('[style*="position: absolute"]');
                    if (buttons && buttons.style.display !== 'none') {
                        buttons.style.display = 'none';
                    }
                });
                
                if (!isCurrentlySelected) {
                    tagItem.classList.add('selected-tag-item');
                    tagItem.style.borderColor = '#38bdf8';
                    actionButtons.style.display = 'flex';
                    tagSelectorDialog.selectedTagForManagement = tag;
                } else {
                    tagSelectorDialog.selectedTagForManagement = null;
                    tagItem.style.borderColor = '#475569';
                    actionButtons.style.display = 'none';
                }
            };
            
            tagItem.addEventListener('mouseenter', () => {
                if (!tagItem.classList.contains('selected-tag-item')) {
                    tagItem.style.borderColor = '#94a3b8';
                }
            });
            
            tagItem.addEventListener('mouseleave', () => {
                if (!tagItem.classList.contains('selected-tag-item')) {
                    tagItem.style.borderColor = '#475569';
                }
            });
            
            tagList.appendChild(tagItem);
        });
    }
}

function createTagManagementForm(tagToEdit = null) {
    const tagContent = tagSelectorDialog.tagContent;
    tagContent.innerHTML = '';
    
    if (tagSelectorDialog.managementButtonsContainer) {
        tagSelectorDialog.managementButtonsContainer.style.display = 'none';
    }
    
    const title = document.createElement('div');
    title.style.cssText = `
        color: #38f2f8ff;
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 20px;
        text-align: center;
    `;
    title.textContent = tagToEdit ? '编辑自定义标签' : '添加自定义标签';
    tagContent.appendChild(title);
    
    const formContainer = document.createElement('div');
    formContainer.style.cssText = `
        background: linear-gradient(135deg, #2d3748 0%, #1e293b 100%);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 8px;
        padding: 12px;
        max-width: 1400px;
        min-height: 650px;
        margin: 0 auto;
    `;
    tagContent.appendChild(formContainer);
    
    const mainContentContainer = document.createElement('div');
    mainContentContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin-bottom: 12px;
        align-items: flex-start;
    `;
    formContainer.appendChild(mainContentContainer);
    
    const leftPreviewContainer = document.createElement('div');
    leftPreviewContainer.style.cssText = `
        flex-shrink: 0;
        width: 400px;
        text-align: center;
    `;
    mainContentContainer.appendChild(leftPreviewContainer);
    
    const previewLabel = document.createElement('label');
    previewLabel.style.cssText = `
        display: block;
        color: #3b82f6;
        font-weight: 600;
        margin-bottom: 8px;
        font-size: 14px;
        text-shadow: 0 1px 2px rgba(59, 130, 246, 0.3);
    `;
    previewLabel.textContent = '预览图';
    leftPreviewContainer.appendChild(previewLabel);
    
    const previewContainer = document.createElement('div');
    previewContainer.style.cssText = `
        width: 380px;
        max-width: 100%;
        height: 440px; /* 竖版布局，高度减少60像素 */
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 6px;
        background: rgba(15, 23, 42, 0.5);
        margin-bottom: 10px;
        margin-left: auto;
        margin-right: auto;
        position: relative;
        overflow: hidden;
    `;
    
    const noImageHint = document.createElement('div');
    noImageHint.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        opacity: 0.7;
        gap: 10px;
    `;
    
    const imageIcon = document.createElement('div');
    imageIcon.style.cssText = `
        font-size: 48px;
    `;
    imageIcon.textContent = '📷';
    
    const hintText = document.createElement('div');
    hintText.style.cssText = `
        font-size: 16px;
        font-weight: 500;
    `;
    hintText.textContent = '暂无图片';
    
    noImageHint.appendChild(imageIcon);
    noImageHint.appendChild(hintText);
    previewContainer.appendChild(noImageHint);
    
    const previewImg = document.createElement('img');
    previewImg.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        display: none;
    `;
    
    if (tagToEdit) {
        const timestamp = tagToEdit.imageTimestamp ? `?t=${tagToEdit.imageTimestamp}` : '';
        previewImg.src = `/zhihui/user_tags/preview/${encodeURIComponent(tagToEdit.display)}${timestamp}`;
        previewImg.onload = function() {
            this.style.display = 'block';
            noImageHint.style.display = 'none';
            previewButton.textContent = '更换图片';
            deleteButton.style.display = 'block';
            currentPreviewImage = this.src;
            
            console.log(`编辑模式图片尺寸调整: ${this.naturalWidth}x${this.naturalHeight}`);
        };
        previewImg.onerror = () => {
            previewImg.style.display = 'none';
            noImageHint.style.display = 'flex';
            previewButton.textContent = '上传图片';
            deleteButton.style.display = 'none';
        };
    } else {
        previewImg.style.display = 'none';
        noImageHint.style.display = 'flex';
    }
    
    previewContainer.appendChild(previewImg);
    leftPreviewContainer.appendChild(previewContainer);
    
    const previewInput = document.createElement('input');
    previewInput.type = 'file';
    previewInput.accept = 'image/*';
    previewInput.style.cssText = `
        display: none;
    `;
    leftPreviewContainer.appendChild(previewInput);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 10px;
        flex-wrap: wrap;
    `;
    leftPreviewContainer.appendChild(buttonContainer);
    
    const previewButton = document.createElement('button');
    previewButton.textContent = '上传图片';
    previewButton.style.cssText = `
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        border: 1px solid rgba(59, 130, 246, 0.7);
        color: #ffffff;
        padding: 6px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.3s ease;
        white-space: nowrap;
    `;
    previewButton.addEventListener('mouseenter', () => {
        previewButton.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
        previewButton.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)';
    });
    previewButton.addEventListener('mouseleave', () => {
        previewButton.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
        previewButton.style.boxShadow = 'none';
    });
    previewButton.onclick = () => {
        previewInput.click();
    };
    buttonContainer.appendChild(previewButton);
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '删除图片';
    deleteButton.style.cssText = `
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        border: 1px solid rgba(220, 38, 38, 0.7);
        color: #ffffff;
        padding: 6px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.3s ease;
        white-space: nowrap;
        display: none;
    `;
    deleteButton.addEventListener('mouseenter', () => {
        deleteButton.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        deleteButton.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)';
    });
    deleteButton.addEventListener('mouseleave', () => {
        deleteButton.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
        deleteButton.style.boxShadow = 'none';
    });
    deleteButton.onclick = () => {
        currentPreviewImage = null;
        imageDeleted = true;
        previewImg.src = '';
        previewImg.style.display = 'none';
        noImageHint.style.display = 'flex';
        previewButton.textContent = '上传图片';
        deleteButton.style.display = 'none';
        previewInput.value = '';
        console.log('图片已删除');
    };
    buttonContainer.appendChild(deleteButton);
    
    const rightFormContainer = document.createElement('div');
    rightFormContainer.style.cssText = `
        flex: 1;
        min-width: 0;
    `;
    mainContentContainer.appendChild(rightFormContainer);
    
    const nameContainer = document.createElement('div');
    nameContainer.style.cssText = `
        margin-bottom: 12px;
    `;
    rightFormContainer.appendChild(nameContainer);
    
    const nameLabel = document.createElement('label');
    nameLabel.style.cssText = `
        display: block;
        color: #3b82f6;
        font-weight: 600;
        margin-bottom: 8px;
        font-size: 14px;
        text-shadow: 0 1px 2px rgba(59, 130, 246, 0.3);
    `;
    nameLabel.textContent = '标签名称';
    nameContainer.appendChild(nameLabel);
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = '输入标签名称 (纯中文:9个, 纯英文:18个字符)';
    nameInput.value = tagToEdit?.display || '';
    nameInput.maxLength = 18;
    nameInput.style.cssText = `
        width: 100%;
        padding: 10px;
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 6px;
        background: rgba(15, 23, 42, 0.3);
        color: white;
        font-size: 14px;
    `;
    nameInput.addEventListener('focus', () => {
        nameInput.style.borderColor = '#38bdf8';
        nameInput.style.boxShadow = '0 0 0 2px rgba(56, 189, 248, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.2)';
    });
    nameInput.addEventListener('blur', () => {
        nameInput.style.borderColor = 'rgba(59, 130, 246, 0.4)';
        nameInput.style.boxShadow = 'none';
    });
    
    function countChineseAndEnglishEdit(text) {
        let chineseCount = 0;
        let englishCount = 0;
        
        for (let char of text) {
            if (/[\u4e00-\u9fa5]/.test(char)) {
                chineseCount++;
            } else if (/[a-zA-Z]/.test(char)) {
                englishCount++;
            }
        }
        
        return { chinese: chineseCount, english: englishCount };
    }
    
    function validateCharacterLengthEdit(text) {
        const counts = countChineseAndEnglishEdit(text);
        
        if (counts.chinese > 0 && counts.english === 0) {
            return counts.chinese <= 9;
        }
        
        if (counts.english > 0 && counts.chinese === 0) {
            return counts.english <= 18;
        }
        
        const mixedCount = counts.chinese + (counts.english * 0.5);
        return mixedCount <= 9;
    }
    
    nameInput.addEventListener('input', () => {
        const value = nameInput.value;
        
        if (!validateCharacterLengthEdit(value)) {
            let truncatedValue = value;
            while (truncatedValue.length > 0 && !validateCharacterLengthEdit(truncatedValue)) {
                truncatedValue = truncatedValue.substring(0, truncatedValue.length - 1);
            }
            nameInput.value = truncatedValue;
        }
    });
    nameContainer.appendChild(nameInput);
    
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
        margin-bottom: 8px;
    `;
    rightFormContainer.appendChild(contentContainer);
    
    const contentLabel = document.createElement('label');
    contentLabel.style.cssText = `
        display: block;
        color: #3b82f6;
        font-weight: 600;
        margin-bottom: 8px;
        font-size: 14px;
        text-shadow: 0 1px 2px rgba(59, 130, 246, 0.3);
    `;
    contentLabel.textContent = '标签内容';
    contentContainer.appendChild(contentLabel);
    
    const contentTextarea = document.createElement('textarea');
    contentTextarea.placeholder = '输入标签内容';
    contentTextarea.value = tagToEdit?.value || '';
    contentTextarea.style.cssText = `
        width: 100%;
        padding: 10px;
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 6px;
        background: rgba(15, 23, 42, 0.3);
        color: white;
        font-size: 14px;
        resize: none;
        min-height: 480px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    contentTextarea.addEventListener('focus', () => {
        contentTextarea.style.borderColor = '#38bdf8';
        contentTextarea.style.boxShadow = '0 0 0 2px rgba(56, 189, 248, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.2)';
    });
    contentTextarea.addEventListener('blur', () => {
        contentTextarea.style.borderColor = 'rgba(59, 130, 246, 0.4)';
        contentTextarea.style.boxShadow = 'none';
    });
    contentContainer.appendChild(contentTextarea);
    
    let history = [contentTextarea.value];
    let historyIndex = 0;
    let isUpdatingHistory = false;
    
    contentTextarea.addEventListener('input', () => {
        if (isUpdatingHistory) return;
        
        history = history.slice(0, historyIndex + 1);
        history.push(contentTextarea.value);
        
        if (history.length > 100) {
            history.shift();
        } else {
            historyIndex++;
        }
    });
    
    const charStatsContainer = document.createElement('div');
    charStatsContainer.style.cssText = `
        padding: 8px 12px;
        background: rgba(15, 23, 42, 0.4);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 4px;
        font-size: 12px;
        color: #94a3b8;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        flex: 1;
        min-width: 250px;
        align-self: center;
    `;
    
    const statsLeft = document.createElement('div');
    statsLeft.style.cssText = `
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
    `;
    
    const charCountSpan = document.createElement('span');
    charCountSpan.innerHTML = `字符数: <span style="color: white;">0</span>`;
    charCountSpan.style.cssText = `
        font-weight: 500;
        color: #3b82f6;
        text-shadow: 0 1px 2px rgba(59, 130, 246, 0.3);
    `;
    
    const lineCountSpan = document.createElement('span');
    lineCountSpan.innerHTML = `行数: <span style="color: white;">1</span>`;
    lineCountSpan.style.cssText = `
        font-weight: 500;
        color: #10b981;
        text-shadow: 0 1px 2px rgba(16, 185, 129, 0.3);
    `;
    
    const punctuationCountSpan = document.createElement('span');
    punctuationCountSpan.innerHTML = `标点符号数: <span style="color: white;">0</span>`;
    punctuationCountSpan.style.cssText = `
        font-weight: 500;
        color: #8b5cf6;
        text-shadow: 0 1px 2px rgba(139, 92, 246, 0.3);
    `;
    
    statsLeft.appendChild(charCountSpan);
    statsLeft.appendChild(lineCountSpan);
    statsLeft.appendChild(punctuationCountSpan);
    
    const statsRight = document.createElement('div');
    statsRight.style.cssText = `
        font-style: italic;
        opacity: 0.8;
    `;
    statsRight.textContent = '实时统计';
    
    charStatsContainer.appendChild(statsLeft);
    charStatsContainer.appendChild(statsRight);
    
    const toolsAndStatsContainer = document.createElement('div');
    toolsAndStatsContainer.style.cssText = `
        display: flex;
        gap: 12px;
        align-items: center;
        margin-top: 12px;
        justify-content: flex-start;
        flex-wrap: wrap;
    `;
    
    const saveButtonsContainer = document.createElement('div');
    saveButtonsContainer.style.cssText = `
        display: flex;
        gap: 12px;
        align-items: center;
        flex-shrink: 0;
        margin-right: auto;
        height: fit-content;
        align-self: center;
    `;
    
    function updateCharStats() {
        const text = contentTextarea.value;
        const charCount = text.length;
        const lineCount = text.split('\n').length;
        const punctuationRegex = /[，。！？；：""''（）【】《》〈〉「」『』—…·、.,;:!?()[\]{}"'\-]/g;
        const punctuationCount = (text.match(punctuationRegex) || []).length;
        
        charCountSpan.innerHTML = `字符数: <span style="color: white;">${charCount}</span>`;
        lineCountSpan.innerHTML = `行数: <span style="color: white;">${lineCount}</span>`;
        punctuationCountSpan.innerHTML = `标点符号数: <span style="color: white;">${punctuationCount}</span>`;
        
        if (charCount > 1000) {
            charCountSpan.style.color = '#f59e0b';
        } else if (charCount > 2000) {
            charCountSpan.style.color = '#ef4444';
        } else {
            charCountSpan.style.color = '#94a3b8';
        }
    }
    
    contentTextarea.addEventListener('input', updateCharStats);
    
    updateCharStats();
    
    const saveButton = document.createElement('button');
    saveButton.textContent = '保存';
    saveButton.style.cssText = `
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        border: 1px solid rgba(16, 185, 129, 0.7);
        color: #ffffff;
        padding: 8px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s ease;
        line-height: 1.2;
        min-width: 80px;
        white-space: nowrap;
        align-self: center;
    `;
    saveButton.addEventListener('mouseenter', () => {
        saveButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        saveButton.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)';
    });
    saveButton.addEventListener('mouseleave', () => {
        saveButton.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
        saveButton.style.boxShadow = 'none';
    });
    
    const backButton = document.createElement('button');
    backButton.textContent = '返回';
    backButton.style.cssText = `
        background: linear-gradient(135deg, #64748b 0%, #475569 100%);
        border: 1px solid rgba(100, 116, 139, 0.7);
        color: #ffffff;
        padding: 8px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s ease;
        line-height: 1.2;
        min-width: 80px;
        white-space: nowrap;
        align-self: center;
    `;
    backButton.addEventListener('mouseenter', () => {
        backButton.style.background = 'linear-gradient(135deg, #718096 0%, #64748b 100%)';
        backButton.style.boxShadow = '0 2px 4px rgba(100, 116, 139, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)';
    });
    backButton.addEventListener('mouseleave', () => {
        backButton.style.background = 'linear-gradient(135deg, #64748b 0%, #475569 100%)';
        backButton.style.boxShadow = 'none';
    });
    
    const editToolsFrame = document.createElement('div');
    editToolsFrame.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px;
        background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
        border: 2px solid rgba(59, 130, 246, 0.4);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1);
        position: relative;
        margin-left: 0;
        margin-right: auto;
        flex-shrink: 0;
        align-self: center;
        height: fit-content;
    `;
    
    const frameTitle = document.createElement('div');
    frameTitle.textContent = '编辑工具';
    frameTitle.style.cssText = `
        position: absolute;
        top: -14px;
        left: 7px;
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        letter-spacing: 0.5px;
    `;
    editToolsFrame.appendChild(frameTitle);
    const editToolsContainer = document.createElement('div');
    editToolsContainer.style.cssText = `
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
    `;
    
    const clearButton = document.createElement('button');
    clearButton.textContent = '清空';
    clearButton.title = '清空所有内容';
    clearButton.style.cssText = `
        background: linear-gradient(135deg, #ff5252 0%, #ff1744 100%);
        border: 1px solid rgba(255, 82, 82, 0.7);
        color: #ffffff;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.2s ease;
        min-width: 40px;
    `;
    
    const selectAllButton = document.createElement('button');
    selectAllButton.textContent = '全选';
    selectAllButton.title = '全选文本内容';
    selectAllButton.style.cssText = `
        background: linear-gradient(135deg, #42a5f5 0%, #2196f3 100%);
        border: 1px solid rgba(66, 165, 245, 0.7);
        color: #ffffff;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.2s ease;
        min-width: 40px;
    `;
    
    const copyButton = document.createElement('button');
    copyButton.textContent = '复制';
    copyButton.title = '复制所有内容';
    copyButton.style.cssText = `
        background: linear-gradient(135deg, #00bcd4 0%, #00acc1 100%);
        border: 1px solid rgba(0, 188, 212, 0.7);
        color: #ffffff;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.2s ease;
        min-width: 40px;
    `;
    
    const pasteButton = document.createElement('button');
    pasteButton.textContent = '粘贴';
    pasteButton.title = '粘贴剪贴板内容';
    pasteButton.style.cssText = `
        background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
        border: 1px solid rgba(76, 175, 80, 0.7);
        color: #ffffff;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.2s ease;
        min-width: 40px;
    `;
    
    const cutButton = document.createElement('button');
    cutButton.textContent = '剪切';
    cutButton.title = '剪切选中的文本内容';
    cutButton.style.cssText = `
        background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
        border: 1px solid rgba(156, 39, 176, 0.7);
        color: #ffffff;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.2s ease;
        min-width: 40px;
    `;
    
    const undoButton = document.createElement('button');
    undoButton.textContent = '撤销';
    undoButton.title = '撤销上一步操作 (Ctrl+Z)';
    undoButton.style.cssText = `
        background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
        border: 1px solid rgba(255, 152, 0, 0.7);
        color: #ffffff;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.2s ease;
        min-width: 40px;
    `;
    
    const redoButton = document.createElement('button');
    redoButton.textContent = '重做';
    redoButton.title = '重做上一步操作 (Ctrl+Y/Ctrl+Shift+Z)';
    redoButton.style.cssText = `
        background: linear-gradient(135deg, #ff6f00 0%, #e65100 100%);
        border: 1px solid rgba(255, 111, 0, 0.7);
        color: #ffffff;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.2s ease;
        min-width: 40px;
    `;
    
    undoButton.onclick = () => {
        if (historyIndex > 0) {
            isUpdatingHistory = true;
            historyIndex--;
            contentTextarea.value = history[historyIndex];
            updateCharStats();
            isUpdatingHistory = false;
        }
    };
    
    redoButton.onclick = () => {
        if (historyIndex < history.length - 1) {
            isUpdatingHistory = true;
            historyIndex++;
            contentTextarea.value = history[historyIndex];
            updateCharStats();
            isUpdatingHistory = false;
        }
    };
    
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.target === contentTextarea) {
            if (e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undoButton.click();
            } else if ((e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redoButton.click();
            }
        }
    });
    
    const formatButton = document.createElement('button');
    formatButton.textContent = '格式';
    formatButton.title = '格式化文本内容';
    formatButton.style.cssText = `
        background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
        border: 1px solid rgba(255, 193, 7, 0.7);
        color: #ffffff;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.2s ease;
        min-width: 40px;
    `;
    
    [clearButton, selectAllButton, copyButton, cutButton, pasteButton, undoButton, redoButton, formatButton].forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-1px)';
            button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = 'none';
        });
    });
    
    clearButton.onclick = () => {
        contentTextarea.value = '';
        contentTextarea.dispatchEvent(new Event('input'));
        updateCharStats();
        showToast('内容已清空，可通过撤销按钮恢复', 'info');
    };
    
    selectAllButton.onclick = () => {
        contentTextarea.select();
    };
    
    copyButton.onclick = async () => {
        try {
            await navigator.clipboard.writeText(contentTextarea.value);
            copyButton.textContent = '已复制';
            setTimeout(() => {
                copyButton.textContent = '复制';
            }, 1000);
        } catch (err) {
            showToast('复制失败，请手动选择文本并复制', 'warning');
        }
    };
    
    cutButton.onclick = async () => {
        try {
            const selectedText = contentTextarea.value.substring(
                contentTextarea.selectionStart, 
                contentTextarea.selectionEnd
            );
            
            if (!selectedText) {
                showToast('请先选择要剪切的内容', 'info');
                return;
            }
            
            await navigator.clipboard.writeText(selectedText);
            const startPos = contentTextarea.selectionStart;
            const endPos = contentTextarea.selectionEnd;
            const textBefore = contentTextarea.value.substring(0, startPos);
            const textAfter = contentTextarea.value.substring(endPos);
            contentTextarea.value = textBefore + textAfter;
            cutButton.textContent = '已剪切';
            setTimeout(() => {
                cutButton.textContent = '剪切';
            }, 1000);
            
            updateCharStats();
        } catch (err) {
            showToast('剪切失败，请手动剪切内容', 'warning');
        }
    };
    
    pasteButton.onclick = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const startPos = contentTextarea.selectionStart;
            const endPos = contentTextarea.selectionEnd;
            const textBefore = contentTextarea.value.substring(0, startPos);
            const textAfter = contentTextarea.value.substring(endPos);
            contentTextarea.value = textBefore + text + textAfter;
            updateCharStats();
        } catch (err) {
            showToast('粘贴失败，请手动粘贴内容', 'warning');
        }
    };
    
    formatButton.onclick = () => {
        const text = contentTextarea.value;
        if (!text.trim()) {
            showToast('没有可格式化的内容', 'info');
            return;
        }
        
        const formattedText = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n')
            .replace(/\n{3,}/g, '\n\n');
        
        contentTextarea.value = formattedText;
        updateCharStats();
    };
    
    editToolsContainer.appendChild(clearButton);
    editToolsContainer.appendChild(selectAllButton);
    editToolsContainer.appendChild(copyButton);
    editToolsContainer.appendChild(cutButton);
    editToolsContainer.appendChild(pasteButton);
    editToolsContainer.appendChild(undoButton);
    editToolsContainer.appendChild(redoButton);
    editToolsContainer.appendChild(formatButton);
    editToolsFrame.appendChild(editToolsContainer);
    saveButtonsContainer.appendChild(saveButton);
    saveButtonsContainer.appendChild(backButton); 
    toolsAndStatsContainer.appendChild(saveButtonsContainer);
    toolsAndStatsContainer.appendChild(editToolsFrame);
    toolsAndStatsContainer.appendChild(charStatsContainer);
    contentContainer.appendChild(toolsAndStatsContainer);
    
    if (tagSelectorDialog.formButtonsContainer) {
        tagSelectorDialog.formButtonsContainer.style.display = 'none';
    }
    
    let currentPreviewImage = null;
    let imageDeleted = false;
    
    function compressImage(file, maxWidth = 400, maxHeight = 400, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = Math.floor(width * ratio);
                        height = Math.floor(height * ratio);
                    }
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');              
                    ctx.drawImage(img, 0, 0, width, height);              
                    canvas.toBlob((blob) => {
                        const compressedReader = new FileReader();
                        compressedReader.onload = () => {
                            resolve(compressedReader.result);
                        };
                        compressedReader.readAsDataURL(blob);
                    }, 'image/jpeg', quality);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    previewInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                if (file.size > 100 * 1024) {
                    currentPreviewImage = await compressImage(file);
                } else {
                    currentPreviewImage = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            resolve(event.target.result);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                }
                
                previewImg.src = currentPreviewImage;
                previewImg.style.display = 'block';
                crossIcon.style.display = 'none';
                
                previewButton.textContent = '更换图片';
                deleteButton.style.display = 'block';
                imageDeleted = false;
                
                const tempImg = new Image();
                tempImg.onload = function() {
                    const containerWidth = 380;
                    const containerHeight = 500;
                    const aspectRatio = this.width / this.height;
                    
                    let displayWidth, displayHeight;
                    
                    if (aspectRatio > containerWidth / containerHeight) {
                        displayWidth = containerWidth;
                        displayHeight = containerWidth / aspectRatio;
                    } else {
                        displayHeight = containerHeight;
                        displayWidth = containerHeight * aspectRatio;
                    }
                    
                    previewImg.style.width = displayWidth + 'px';
                    previewImg.style.height = displayHeight + 'px';
                    
                    console.log(`图片尺寸调整: ${this.width}x${this.height} → ${Math.round(displayWidth)}x${Math.round(displayHeight)} (比例: ${aspectRatio.toFixed(2)}) - 拉满框架`);
                };
                tempImg.src = currentPreviewImage;
                
                const originalSize = (file.size / 1024).toFixed(1);
                const compressedSize = Math.floor((currentPreviewImage.length * 0.75) / 1024);
                console.log(`图片压缩: ${originalSize}KB → ${compressedSize}KB`);
                
            } catch (error) {
                console.error('图片压缩失败:', error);
                const reader = new FileReader();
                reader.onload = (event) => {
                    currentPreviewImage = event.target.result;
                    previewImg.src = currentPreviewImage;
                    previewImg.style.display = 'block';
                    
                    const tempImg = new Image();
                    tempImg.onload = function() {
                        const containerWidth = 380;
                        const containerHeight = 500;
                        const aspectRatio = this.width / this.height;
                        
                        let displayWidth, displayHeight;
                        
                        if (aspectRatio > containerWidth / containerHeight) {
                            displayWidth = containerWidth;
                            displayHeight = containerWidth / aspectRatio;
                        } else {
                            displayHeight = containerHeight;
                            displayWidth = containerHeight * aspectRatio;
                        }
                        
                        previewImg.style.width = displayWidth + 'px';
                        previewImg.style.height = displayHeight + 'px';
                        
                        previewButton.textContent = '更换图片';
                        deleteButton.style.display = 'block';
                    };
                    tempImg.src = currentPreviewImage;
                };
                reader.readAsDataURL(file);
            }
        }
    });
    
    saveButton.onclick = async () => {
        const name = nameInput.value.trim();
        const content = contentTextarea.value.trim();
        
        if (!name || !content) {
            showToast('请填写完整的名称和标签内容', 'warning');
            return;
        }
        
        try {
            const requestData = { name, content };
            
            if (currentPreviewImage) {
                requestData.preview_image = currentPreviewImage;
            } else if (tagToEdit && imageDeleted) {
                requestData.delete_image = true;
            }
            
            if (tagToEdit) {
                requestData.original_name = tagToEdit.display;
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
                await loadTagsData();
                
                const customTags = tagsData['自定义']?.['我的标签'] || [];
                customTags.forEach(tag => {
                    if (tag.display === name) {
                        tag.imageTimestamp = Date.now();
                    }
                });
                
                showCustomTagManagement();
                showToast(tagToEdit ? '标签更新成功！' : '标签添加成功！', 'success');
            } else {
                showToast(result.error || '操作失败', 'error');
            }
        } catch (error) {
            console.error('Error saving custom tag:', error);
            showToast('操作失败，请重试', 'error');
        }
    };
    
    backButton.onclick = () => {
        showCustomTagManagement();
    };
}

function showTagsFromSubSub(category, subCategory, subSubCategory) {
    const tagContent = tagSelectorDialog.tagContent;
    tagContent.innerHTML = '';
    
    if (tagSelectorDialog.subCategoryTabs) {
        tagSelectorDialog.subCategoryTabs.style.display = 'flex';
    }
    if (tagSelectorDialog.subSubCategoryTabs) {
        tagSelectorDialog.subSubCategoryTabs.style.display = 'flex';
    }
    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'none';
    }
    
    const categoriesToShowClearButton = ['常规标签', '艺术题材', '人物类', '场景类', '动物生物', '灵感套装', '涩影湿'];
    if (tagSelectorDialog.clearButtonContainer) {
        if (categoriesToShowClearButton.includes(category)) {
            tagSelectorDialog.clearButtonContainer.style.display = 'flex';
        } else {
            tagSelectorDialog.clearButtonContainer.style.display = 'none';
        }
    }
    
    if (tagSelectorDialog.restoreBtn) {
        if (categoriesToShowClearButton.includes(category)) {
            tagSelectorDialog.restoreBtn.style.display = 'block';
        } else {
            tagSelectorDialog.restoreBtn.style.display = 'none';
        }
    }
    
    if (tagSelectorDialog.managementButtonsContainer) {
        tagSelectorDialog.managementButtonsContainer.style.display = 'none';
    }
    if (tagSelectorDialog.formButtonsContainer) {
        tagSelectorDialog.formButtonsContainer.style.display = 'none';
    }
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
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        `;

        const displayText = tagObj.display.length > 13 ? tagObj.display.substring(0, 13) + '...' : tagObj.display;
        tagElement.textContent = displayText;
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
    
    if (tagSelectorDialog.subCategoryTabs) {
        tagSelectorDialog.subCategoryTabs.style.display = 'flex';
    }
    if (tagSelectorDialog.subSubCategoryTabs) {
        tagSelectorDialog.subSubCategoryTabs.style.display = 'flex';
    }
    if (tagSelectorDialog.subSubSubCategoryTabs) {
        tagSelectorDialog.subSubSubCategoryTabs.style.display = 'flex';
    }
    
    const categoriesToShowClearButton = ['常规标签', '艺术题材', '人物类', '场景类', '动物生物', '灵感套装', '涩影湿'];
    if (tagSelectorDialog.clearButtonContainer) {
        if (categoriesToShowClearButton.includes(category)) {
            tagSelectorDialog.clearButtonContainer.style.display = 'flex';
        } else {
            tagSelectorDialog.clearButtonContainer.style.display = 'none';
        }
    }
    
    if (tagSelectorDialog.restoreBtn) {
        if (categoriesToShowClearButton.includes(category)) {
            tagSelectorDialog.restoreBtn.style.display = 'block';
        } else {
            tagSelectorDialog.restoreBtn.style.display = 'none';
        }
    }
    
    if (tagSelectorDialog.managementButtonsContainer) {
        tagSelectorDialog.managementButtonsContainer.style.display = 'none';
    }
    if (tagSelectorDialog.formButtonsContainer) {
        tagSelectorDialog.formButtonsContainer.style.display = 'none';
    }

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

        const displayText = tagObj.display.length > 13 ? tagObj.display.substring(0, 13) + '...' : tagObj.display;
        tagElement.textContent = displayText;
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

let selectedTags = new Map();
let previousSelectedTags = new Map();

window.selectedTags = selectedTags;
window.previousSelectedTags = previousSelectedTags;
window.tagsData = null;
window.updateSelectedTags = null;
window.updateSelectedTagsOverview = null;
window.updateCategoryRedDots = null;

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
        categoryItems.forEach((item) => {
            const category = item.textContent;
            if (category && tagsData[category]) {
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
            if (subCategory === '标签管理' && tagSelectorDialog.activeSubCategory !== '标签管理') {
                return;
            }
            
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
    const isInspirationSuite = tagSelectorDialog && tagSelectorDialog.activeCategory === '灵感套装';
    
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        element.style.backgroundColor = '#444';
        element.style.color = '#ccc';
    } else {
        if (isInspirationSuite) {
            selectedTags.clear();
            if (tagSelectorDialog && tagSelectorDialog.tagContent) {
                tagSelectorDialog.tagContent.querySelectorAll('span[data-value]').forEach(el => {
                    el.style.backgroundColor = '#444';
                    el.style.color = '#ccc';
                });
            }
        }
        selectedTags.set(tag, 1.0);
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
            const tagsArray = Array.from(selectedTags.entries()).map(([tag, weight]) => {
                if (weight !== 1.0) {
                    return `(${tag}:${weight.toFixed(1)})`;
                }
                return tag;
            });
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

window.updateSelectedTags = updateSelectedTags;

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

        selectedTags.forEach((weight, tag) => {
            const tagContainer = document.createElement('div');
            tagContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                margin: 0 4px;
                background: transparent;
                position: relative;
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
                min-width: 90px;
                justify-content: space-between;
                margin: 0 0 2px 0;
                box-shadow: 0 2px 4px rgba(74, 158, 255, 0.4), 0 1px 2px rgba(74, 158, 255, 0.2);
                border: 1px solid rgba(30, 136, 229, 0.8);
                transition: all 0.3s ease;
            `;

            const tagText = document.createElement('span');
            tagText.style.cssText = `
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                min-width: 0;
            `;
            tagText.textContent = tag;

            const weightDisplay = document.createElement('span');
            weightDisplay.style.cssText = `
                font-size: 10px;
                background: rgba(255,255,255,0.2);
                padding: 1px 4px;
                border-radius: 3px;
                min-width: 10px;
                text-align: center;
                cursor: pointer;
                user-select: none;
            `;
            
            const updateWeightDisplay = (w) => {
                if (w === 1.0) {
                    weightDisplay.style.display = 'none';
                } else {
                    weightDisplay.style.display = 'inline-flex';
                    weightDisplay.textContent = w.toFixed(1);
                }
            };
            updateWeightDisplay(weight);
            
            weightDisplay.ondblclick = (e) => {
                e.stopPropagation();
                const input = document.createElement('input');
                input.type = 'text';
                input.value = selectedTags.get(tag) || 1.0;
                input.style.cssText = `
                    width: 40px;
                    font-size: 10px;
                    padding: 1px 2px;
                    border: 1px solid #4a9eff;
                    border-radius: 3px;
                    background: #1e293b;
                    color: #fff;
                    text-align: center;
                    outline: none;
                `;
                weightDisplay.replaceWith(input);
                input.focus();
                input.select();
                
                const applyValue = () => {
                    let newWeight = parseFloat(input.value);
                    if (!isNaN(newWeight)) {
                        newWeight = Math.max(0.1, Math.min(2.0, Math.round(newWeight * 10) / 10));
                        selectedTags.set(tag, newWeight);
                        updateWeightDisplay(newWeight);
                        updateSelectedTags();
                    }
                    input.replaceWith(weightDisplay);
                };
                
                input.onblur = applyValue;
                input.onkeydown = (ev) => {
                    if (ev.key === 'Enter') {
                        applyValue();
                    } else if (ev.key === 'Escape') {
                        input.replaceWith(weightDisplay);
                    }
                };
            };

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
            tagElement.appendChild(weightDisplay);
            tagElement.appendChild(removeBtn);

            const weightControl = document.createElement('div');
            weightControl.style.cssText = `
                display: none;
                position: absolute;
                top: 0;
                left: 0;
                right: 26px;
                height: 100%;
                align-items: center;
                justify-content: center;
                background: rgba(74, 158, 255, 0.95);
                border-radius: 6px;
                z-index: 10;
                opacity: 0;
                transition: opacity 0.2s ease;
            `;

            const weightEditor = document.createElement('div');
            weightEditor.style.cssText = `
                display: flex;
                align-items: center;
                background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
                border: 1px solid #4a9eff;
                border-radius: 4px;
                overflow: hidden;
                height: 15px;
                box-shadow: 0 2px 8px rgba(74, 158, 255, 0.4);
            `;

            const decreaseBtn = document.createElement('span');
            decreaseBtn.textContent = '−';
            decreaseBtn.style.cssText = `
                font-size: 11px;
                font-weight: bold;
                cursor: pointer;
                background: #ff6b6b;
                color: #fff;
                width: 15px;
                height: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                transition: all 0.15s;
                border-right: 1px solid rgba(255, 255, 255, 0.3);
            `;
            decreaseBtn.onmouseenter = () => {
                decreaseBtn.style.background = '#ff5252';
                decreaseBtn.style.transform = 'scale(1.1)';
            };
            decreaseBtn.onmouseleave = () => {
                decreaseBtn.style.background = '#ff6b6b';
                decreaseBtn.style.transform = 'scale(1)';
            };

            const weightValueDisplay = document.createElement('span');
            weightValueDisplay.style.cssText = `
                font-size: 11px;
                font-weight: 700;
                color: #fff;
                min-width: 26px;
                text-align: center;
                cursor: pointer;
                user-select: none;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-shadow: 0 0 6px rgba(0, 0, 0, 0.8), 0 0 2px rgba(0, 0, 0, 1);
            `;

            const updateWeightValueDisplay = (w) => {
                weightValueDisplay.textContent = w.toFixed(1);
                weightValueDisplay.style.color = '#fff';
            };
            updateWeightValueDisplay(weight);

            weightValueDisplay.onclick = (e) => {
                e.stopPropagation();
                const input = document.createElement('input');
                input.type = 'text';
                input.value = selectedTags.get(tag) || 1.0;
                input.style.cssText = `
                    width: 26px;
                    font-size: 11px;
                    padding: 0;
                    border: none;
                    background: transparent;
                    color: #4a9eff;
                    text-align: center;
                    outline: none;
                    font-weight: 500;
                `;
                weightValueDisplay.replaceWith(input);
                input.focus();
                input.select();

                const applyValue = () => {
                    let newWeight = parseFloat(input.value);
                    if (!isNaN(newWeight)) {
                        newWeight = Math.max(0.1, Math.min(2.0, Math.round(newWeight * 10) / 10));
                        selectedTags.set(tag, newWeight);
                        updateWeightDisplay(newWeight);
                        updateWeightValueDisplay(newWeight);
                        updateSelectedTags();
                    }
                    input.replaceWith(weightValueDisplay);
                };

                input.onblur = applyValue;
                input.onkeydown = (ev) => {
                    if (ev.key === 'Enter') {
                        applyValue();
                    } else if (ev.key === 'Escape') {
                        input.replaceWith(weightValueDisplay);
                    }
                };
            };

            const increaseBtn = document.createElement('span');
            increaseBtn.textContent = '+';
            increaseBtn.style.cssText = `
                font-size: 11px;
                font-weight: bold;
                cursor: pointer;
                background: #51cf66;
                color: #fff;
                width: 15px;
                height: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                transition: all 0.15s;
                border-left: 1px solid rgba(255, 255, 255, 0.3);
            `;
            increaseBtn.onmouseenter = () => {
                increaseBtn.style.background = '#40c057';
                increaseBtn.style.transform = 'scale(1.1)';
            };
            increaseBtn.onmouseleave = () => {
                increaseBtn.style.background = '#51cf66';
                increaseBtn.style.transform = 'scale(1)';
            };

            decreaseBtn.onclick = (e) => {
                e.stopPropagation();
                const currentWeight = selectedTags.get(tag) || 1.0;
                const newWeight = Math.max(0.1, Math.round((currentWeight - 0.1) * 10) / 10);
                selectedTags.set(tag, newWeight);
                updateWeightDisplay(newWeight);
                updateWeightValueDisplay(newWeight);
                updateSelectedTags();
            };

            increaseBtn.onclick = (e) => {
                e.stopPropagation();
                const currentWeight = selectedTags.get(tag) || 1.0;
                const newWeight = Math.min(2.0, Math.round((currentWeight + 0.1) * 10) / 10);
                selectedTags.set(tag, newWeight);
                updateWeightDisplay(newWeight);
                updateWeightValueDisplay(newWeight);
                updateSelectedTags();
            };

            weightEditor.appendChild(decreaseBtn);
            weightEditor.appendChild(weightValueDisplay);
            weightEditor.appendChild(increaseBtn);
            weightControl.appendChild(weightEditor);

            tagElement.style.position = 'relative';
            tagElement.appendChild(weightControl);

            tagElement.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                weightControl.style.display = 'flex';
                requestAnimationFrame(() => {
                    weightControl.style.opacity = '1';
                });
            });

            tagElement.addEventListener('mouseleave', (e) => {
                e.stopPropagation();
                weightControl.style.opacity = '0';
                setTimeout(() => {
                    weightControl.style.display = 'none';
                }, 200);
            });

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
            const parseTagWithWeight = (tagStr) => {
                const weightMatch = tagStr.match(/^\((.+):([\d.]+)\)$/);
                if (weightMatch) {
                    return { tag: weightMatch[1].trim(), weight: parseFloat(weightMatch[2]) };
                }
                return { tag: tagStr.trim(), weight: 1.0 };
            };
            
            if (tagEditWidget._internalValue) {
                const currentTags = tagEditWidget._internalValue.split('|||').filter(t => t.trim());
                currentTags.forEach(tagStr => {
                    const { tag, weight } = parseTagWithWeight(tagStr);
                    selectedTags.set(tag, weight);
                });
            } else if (tagEditWidget.value) {
                try {
                    const tagsArray = JSON.parse(tagEditWidget.value);
                    if (Array.isArray(tagsArray)) {
                        tagsArray.forEach(tagStr => {
                            if (tagStr && typeof tagStr === 'string') {
                                const { tag, weight } = parseTagWithWeight(tagStr);
                                selectedTags.set(tag, weight);
                            }
                        });
                    } else {
                        throw new Error('Not an array');
                    }
                } catch (e) {
                    const currentTags = tagEditWidget.value.split(',').map(t => t.trim()).filter(t => t);
                    currentTags.forEach(tagStr => {
                        const { tag, weight } = parseTagWithWeight(tagStr);
                        selectedTags.set(tag, weight);
                    });
                }
            }
        }
    }
    updateSelectedTagsOverview();
    updateCategoryRedDots();
}

function clearSelectedTags() {
    if (previousSelectedTags.size === 0) {
        selectedTags.forEach((weight, tag) => previousSelectedTags.set(tag, weight));
    }

    selectedTags.clear();

    if (tagSelectorDialog && tagSelectorDialog.tagContent) {
        const tagElements = tagSelectorDialog.tagContent.querySelectorAll('span[data-value]');
        tagElements.forEach(element => {
            element.style.backgroundColor = '#444';
            element.style.color = '#ccc';
        });
    }

    updateSelectedTags();
    updateSelectedTagsOverview();
    updateCategoryRedDots();
}

function restoreSelectedTags() {
    if (previousSelectedTags.size === 0) {
        return;
    }

    selectedTags.clear();
    previousSelectedTags.forEach((weight, tag) => selectedTags.set(tag, weight));

    if (tagSelectorDialog && tagSelectorDialog.tagContent) {
        const tagElements = tagSelectorDialog.tagContent.querySelectorAll('span[data-value]');
        tagElements.forEach(element => {
            const tagValue = element.getAttribute('data-value');
            if (tagValue && selectedTags.has(tagValue)) {
                element.style.backgroundColor = '#22c55e';
                element.style.color = '#fff';
            } else {
                element.style.backgroundColor = '#444';
                element.style.color = '#ccc';
            }
        });
    }

    updateSelectedTags();
    updateSelectedTagsOverview();
    updateCategoryRedDots();
    
    previousSelectedTags.clear();
}

function applySelectedTags() {
    updateSelectedTags();

    if (tagSelectorDialog && tagSelectorDialog.closeDialog) {
        tagSelectorDialog.closeDialog();
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
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        `;

        const displayText = tagObj.display.length > 13 ? tagObj.display.substring(0, 13) + '...' : tagObj.display;
        tagElement.textContent = displayText;
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