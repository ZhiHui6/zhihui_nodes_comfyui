import { getState, setState } from '../core/state.js';
import { log } from '../utils/constants.js';
import { getAllAvailableTags } from './tagService.js';

function selectWeightedTags(tags, count) {
    if (!tags || tags.length === 0) return [];
    if (tags.length <= count) return [...tags];
    
    const shuffled = [...tags].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function getRandomTagsFromArray(tags, count) {
    if (!tags || tags.length === 0) return [];
    
    const shuffled = [...tags].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

function generateRandomCombination() {
    const randomSettings = getState('randomSettings');
    if (!randomSettings) {
        return '';
    }
    
    const selectedTags = [];
    const categories = randomSettings.categories || {};
    
    const enabledCategories = Object.entries(categories)
        .filter(([_, settings]) => settings.enabled)
        .map(([name, settings]) => ({ name, ...settings }));
    
    if (enabledCategories.length === 0) {
        return '';
    }
    
    const totalWeight = enabledCategories.reduce((sum, cat) => sum + (cat.weight || 1), 0);
    
    enabledCategories.forEach(category => {
        const probability = (category.weight || 1) / totalWeight;
        
        if (Math.random() < probability) {
            const availableTags = getTagsForCategory(category.name);
            const count = category.count || 1;
            const selected = selectWeightedTags(availableTags, count);
            selectedTags.push(...selected);
        }
    });
    
    const limitEnabled = randomSettings.limitTotal?.enabled;
    const maxTags = randomSettings.limitTotal?.max || 25;
    
    if (limitEnabled && selectedTags.length > maxTags) {
        return selectedTags.slice(0, maxTags).join(', ');
    }
    
    return [...new Set(selectedTags)].join(', ');
}

function getTagsForCategory(categoryName) {
    const allTags = getAllAvailableTags();
    
    const categoryKeywords = {
        '画质': ['quality', 'resolution', 'detail', 'masterpiece'],
        '风格': ['style', 'art', 'anime', 'realistic'],
        '光影': ['light', 'shadow', 'lighting', 'sun'],
        '构图': ['composition', 'angle', 'view', 'shot'],
        '角色': ['character', 'girl', 'boy', 'person'],
        '服饰': ['dress', 'cloth', 'wear', 'outfit'],
        '场景': ['scene', 'background', 'environment', 'landscape'],
        '动作': ['pose', 'action', 'standing', 'sitting']
    };
    
    const keywords = categoryKeywords[categoryName] || [];
    
    if (keywords.length === 0) {
        return allTags;
    }
    
    return allTags.filter(tag => 
        keywords.some(keyword => 
            tag.toLowerCase().includes(keyword.toLowerCase())
        )
    );
}

function resetRandomSettings() {
    const defaultSettings = {
        categories: {
            "画质": { enabled: true, weight: 2, count: 2 },
            "风格": { enabled: true, weight: 1, count: 1 },
            "光影": { enabled: true, weight: 1, count: 1 },
            "构图": { enabled: true, weight: 1, count: 1 },
            "角色": { enabled: true, weight: 2, count: 2 },
            "服饰": { enabled: true, weight: 1, count: 2 },
            "场景": { enabled: false, weight: 1, count: 1 },
            "动作": { enabled: true, weight: 1, count: 1 }
        },
        limitTotal: {
            enabled: true,
            min: 10,
            max: 25
        },
        includeNSFW: false
    };
    
    setState('randomSettings', defaultSettings);
    return defaultSettings;
}

function applyPreset(presetName, presets) {
    const preset = presets[presetName];
    if (!preset) {
        log('Preset not found:', presetName);
        return null;
    }
    
    setState('randomSettings', { ...preset });
    setState('currentSelectedPreset', presetName);
    return preset;
}

function updateCategorySetting(categoryName, settingKey, value) {
    const randomSettings = getState('randomSettings') || {};
    
    if (!randomSettings.categories) {
        randomSettings.categories = {};
    }
    
    if (!randomSettings.categories[categoryName]) {
        randomSettings.categories[categoryName] = {
            enabled: true,
            weight: 1,
            count: 1
        };
    }
    
    randomSettings.categories[categoryName][settingKey] = value;
    setState('randomSettings', randomSettings);
}

function getRandomSettings() {
    return getState('randomSettings') || resetRandomSettings();
}

export {
    selectWeightedTags,
    getRandomTagsFromArray,
    generateRandomCombination,
    getTagsForCategory,
    resetRandomSettings,
    applyPreset,
    updateCategorySetting,
    getRandomSettings
};
