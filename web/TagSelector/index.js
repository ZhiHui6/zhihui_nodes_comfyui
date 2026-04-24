import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

export * from './core/index.js';
export * from './services/index.js';
export * from './features/index.js';
export * from './utils/index.js';

import { getState, setState, resetState } from './core/state.js';
import { clearAllCaches } from './core/cache.js';
import { PerformanceUtils } from './core/performance.js';
import { loadTagsData } from './services/tagService.js';
import { searchTags, generateRandomCombination } from './services/index.js';
import { 
    loadAdultContentSettings, 
    isAdultContentEnabled,
    showAdultUnlockDialog 
} from './features/adultContent.js';
import { 
    getSelectedTags, 
    getSelectedTagsString, 
    setSelectedTags, 
    clearSelectedTags,
    loadExistingTags 
} from './features/tagSelection.js';
import { showToast, addStyle } from './utils/dom.js';
import { getLocale } from './utils/helpers.js';

const TagSelector = {
    open: null,
    close: null,
    search: searchTags,
    generateRandom: generateRandomCombination,
    getSelectedTags,
    getSelectedTagsString,
    setSelectedTags,
    clearSelectedTags,
    getState,
    setState
};

function initializeTagSelector() {
    loadAdultContentSettings();
    
    addStyle(`
        @keyframes slideDown {
            from { transform: translate(-50%, -20px); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translate(-50%, 0); opacity: 1; }
            to { transform: translate(-50%, -20px); opacity: 0; }
        }
        .tag-item {
            display: inline-block;
            padding: 4px 10px;
            margin: 3px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s ease;
        }
        .tag-item:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        .tag-item.selected {
            background: #3b82f6;
            color: white;
        }
        .selected-tag-item {
            display: inline-block;
            padding: 2px 8px;
            margin: 2px;
            background: #3b82f6;
            border-radius: 4px;
            font-size: 12px;
            color: white;
        }
    `);
}

window.TagSelector = TagSelector;

export { 
    TagSelector, 
    initializeTagSelector,
    loadTagsData,
    searchTags,
    generateRandomCombination,
    showToast
};
