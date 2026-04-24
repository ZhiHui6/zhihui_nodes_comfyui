function $tag(chineseName, value) {
    return { chineseName, value };
}

function getLocale() {
    const stored = localStorage.getItem('comfyui-language');
    if (stored) {
        return stored === 'zh-CN' || stored === 'zh' ? 'zh' : 'en';
    }
    return navigator.language.startsWith('zh') ? 'zh' : 'en';
}

function debounce(fn, wait) {
    let timeoutId = null;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), wait);
    };
}

function formatTagDisplay(display, value) {
    return display || value;
}

function cleanTagName(name) {
    return name.replace(/[<>{}[\]]/g, '').trim();
}

function parseTagString(tagString) {
    if (!tagString || typeof tagString !== 'string') return [];
    
    return tagString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
}

function joinTags(tags) {
    return [...new Set(tags.filter(t => t && t.trim()))].join(', ');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncateText(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(deepClone);
    
    const cloned = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export {
    $tag,
    getLocale,
    debounce,
    formatTagDisplay,
    cleanTagName,
    parseTagString,
    joinTags,
    escapeHtml,
    truncateText,
    generateId,
    deepClone,
    isValidUrl,
    sleep
};
