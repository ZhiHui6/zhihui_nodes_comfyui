import { getState, setState } from '../core/state.js';
import { showToast } from '../utils/dom.js';
import { getLocale } from '../utils/helpers.js';

const ADULT_STORAGE_KEY = 'tagSelector_adultContentEnabled';
const ADULT_UNLOCK_KEY = 'tagSelector_adultContentUnlocked';

function loadAdultContentSettings() {
    const stored = localStorage.getItem(ADULT_STORAGE_KEY);
    const unlocked = localStorage.getItem(ADULT_UNLOCK_KEY);
    
    setState('adultContentEnabled', stored === 'true');
    setState('adultContentUnlocked', unlocked === 'true');
    
    return {
        enabled: stored === 'true',
        unlocked: unlocked === 'true'
    };
}

function saveAdultContentSettings() {
    const state = getState();
    localStorage.setItem(ADULT_STORAGE_KEY, String(state.adultContentEnabled));
    localStorage.setItem(ADULT_UNLOCK_KEY, String(state.adultContentUnlocked));
}

function isAdultContentEnabled() {
    return getState('adultContentEnabled');
}

function isAdultContentUnlocked() {
    return getState('adultContentUnlocked');
}

function enableAdultContent() {
    setState('adultContentEnabled', true);
    saveAdultContentSettings();
}

function disableAdultContent() {
    setState('adultContentEnabled', false);
    saveAdultContentSettings();
}

function toggleAdultContent() {
    const current = getState('adultContentEnabled');
    setState('adultContentEnabled', !current);
    saveAdultContentSettings();
    return !current;
}

function unlockAdultContent() {
    setState('adultContentUnlocked', true);
    setState('adultContentEnabled', true);
    saveAdultContentSettings();
}

function showAdultUnlockDialog(onUnlock) {
    const locale = getLocale();
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100000;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #1a1a2e;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    const title = document.createElement('h3');
    title.textContent = locale === 'zh' ? '⚠️ 成人内容风险提示' : '⚠️ Adult Content Warning';
    title.style.cssText = `
        color: #fcd34d;
        margin: 0 0 16px 0;
        font-size: 18px;
    `;
    
    const warningText = document.createElement('p');
    warningText.textContent = locale === 'zh' 
        ? '您即将开启成人内容显示功能。此功能包含可能不适合所有用户的敏感内容。请确认您已年满18周岁，并自愿选择查看此类内容。'
        : 'You are about to enable adult content display. This feature contains sensitive content. Please confirm you are 18 years or older.';
    warningText.style.cssText = `
        color: #e2e8f0;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 16px;
    `;
    
    const verificationLabel = document.createElement('label');
    verificationLabel.textContent = locale === 'zh' ? '请输入验证文字：' : 'Enter verification text:';
    verificationLabel.style.cssText = `
        color: #e2e8f0;
        display: block;
        margin-bottom: 8px;
    `;
    
    const verificationInput = document.createElement('input');
    verificationInput.type = 'text';
    verificationInput.placeholder = locale === 'zh' ? '请输入：我已知晓' : 'Enter: I understand';
    verificationInput.style.cssText = `
        width: 100%;
        padding: 10px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(0, 0, 0, 0.3);
        color: #fff;
        margin-bottom: 16px;
        box-sizing: border-box;
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    `;
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = locale === 'zh' ? '取消' : 'Cancel';
    cancelButton.style.cssText = `
        padding: 10px 20px;
        border-radius: 6px;
        border: none;
        background: #4b5563;
        color: #fff;
        cursor: pointer;
    `;
    cancelButton.onclick = () => overlay.remove();
    
    const confirmButton = document.createElement('button');
    confirmButton.textContent = locale === 'zh' ? '确认开启' : 'Confirm';
    confirmButton.style.cssText = `
        padding: 10px 20px;
        border-radius: 6px;
        border: none;
        background: #ef4444;
        color: #fff;
        cursor: pointer;
    `;
    confirmButton.onclick = () => {
        const expectedText = locale === 'zh' ? '我已知晓' : 'I understand';
        if (verificationInput.value === expectedText) {
            unlockAdultContent();
            overlay.remove();
            if (onUnlock) onUnlock();
            showToast(locale === 'zh' ? '成人内容已启用' : 'Adult content enabled', 'success');
        } else {
            showToast(locale === 'zh' ? '验证文字不正确' : 'Incorrect verification text', 'error');
        }
    };
    
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    
    dialog.appendChild(title);
    dialog.appendChild(warningText);
    dialog.appendChild(verificationLabel);
    dialog.appendChild(verificationInput);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    
    document.body.appendChild(overlay);
}

export {
    loadAdultContentSettings,
    saveAdultContentSettings,
    isAdultContentEnabled,
    isAdultContentUnlocked,
    enableAdultContent,
    disableAdultContent,
    toggleAdultContent,
    unlockAdultContent,
    showAdultUnlockDialog
};
