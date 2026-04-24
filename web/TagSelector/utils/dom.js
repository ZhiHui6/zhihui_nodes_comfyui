function applyStyles(element, styles) {
    Object.assign(element.style, styles);
}

function setupButtonHoverEffect(element, normalStyles, hoverStyles) {
    applyStyles(element, normalStyles);
    element.addEventListener('mouseenter', () => applyStyles(element, hoverStyles));
    element.addEventListener('mouseleave', () => applyStyles(element, normalStyles));
}

function createSection(styleKey = 'section', className = '') {
    const section = document.createElement('div');
    section.className = className;
    applyStyles(section, STYLES[styleKey] || {});
    return section;
}

function createTitle(text, level = 'h3') {
    const title = document.createElement(level);
    title.textContent = text;
    applyStyles(title, STYLES.title);
    return title;
}

function showToast(message, type = 'info', duration = 3000) {
    const existingToast = document.querySelector('.tag-selector-toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'tag-selector-toast';
    
    const colors = {
        info: { bg: 'rgba(59, 130, 246, 0.9)', border: '#3b82f6' },
        success: { bg: 'rgba(34, 197, 94, 0.9)', border: '#22c55e' },
        warning: { bg: 'rgba(234, 179, 8, 0.9)', border: '#eab308' },
        error: { bg: 'rgba(239, 68, 68, 0.9)', border: '#ef4444' }
    };
    
    const color = colors[type] || colors.info;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: ${color.bg};
        color: white;
        border-radius: 8px;
        border: 1px solid ${color.border};
        font-size: 14px;
        z-index: 100000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: slideDown 0.3s ease;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    
    if (options.className) {
        element.className = options.className;
    }
    
    if (options.id) {
        element.id = options.id;
    }
    
    if (options.textContent) {
        element.textContent = options.textContent;
    }
    
    if (options.innerHTML) {
        element.innerHTML = options.innerHTML;
    }
    
    if (options.styles) {
        applyStyles(element, options.styles);
    }
    
    if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }
    
    if (options.events) {
        Object.entries(options.events).forEach(([event, handler]) => {
            element.addEventListener(event, handler);
        });
    }
    
    return element;
}

function appendChildren(parent, children) {
    children.forEach(child => {
        if (child) {
            parent.appendChild(child);
        }
    });
}

function removeElement(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

function addStyle(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    return style;
}

export {
    applyStyles,
    setupButtonHoverEffect,
    createSection,
    createTitle,
    showToast,
    createElement,
    appendChildren,
    removeElement,
    addStyle
};
