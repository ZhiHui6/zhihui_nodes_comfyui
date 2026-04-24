import { getState, setState } from '../core/state.js';
import { getTagsCache, clearTagsCache } from '../core/cache.js';
import { log } from '../utils/constants.js';

function convertTagsFormat(rawData) {
    if (!rawData) return {};
    
    const result = {};
    
    for (const [key, value] of Object.entries(rawData)) {
        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                result[key] = value;
            } else {
                const subResult = convertTagsFormat(value);
                if (Object.keys(subResult).length > 0) {
                    result[key] = subResult;
                }
            }
        }
    }
    
    return result;
}

function hasDeepNesting(obj, depth = 0) {
    if (depth > 3) return true;
    if (typeof obj !== 'object' || obj === null) return false;
    
    for (const value of Object.values(obj)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            if (hasDeepNesting(value, depth + 1)) {
                return true;
            }
        }
    }
    return false;
}

async function loadTagsData() {
    try {
        const response = await fetch('/zhihui_nodes/tags_data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const convertedData = convertTagsFormat(data);
        setState('tagsData', convertedData);
        return convertedData;
    } catch (error) {
        log('Failed to load tags data:', error);
        return getDefaultTagsData();
    }
}

function getDefaultTagsData() {
    return {
        "画质": {
            "基础画质": [
                "masterpiece", "best quality", "high quality", "ultra high res"
            ]
        },
        "风格": {
            "艺术风格": [
                "anime", "realistic", "photorealistic", "oil painting"
            ]
        }
    };
}

function getTagsFromCategoryPath(categoryPath) {
    const cache = getTagsCache();
    
    if (cache.has(categoryPath)) {
        return cache.get(categoryPath);
    }
    
    const tagsData = getState('tagsData');
    if (!tagsData) return [];
    
    const pathParts = categoryPath.split('/');
    let current = tagsData;
    
    for (const part of pathParts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            return [];
        }
    }
    
    const tags = extractAllTagsFromObject(current);
    cache.set(categoryPath, tags);
    return tags;
}

function extractAllTagsFromObject(obj) {
    const tags = [];
    
    function traverse(o) {
        if (Array.isArray(o)) {
            o.forEach(item => {
                if (typeof item === 'string') {
                    tags.push(item);
                } else if (typeof item === 'object' && item !== null) {
                    if (item.value) {
                        tags.push(item.value);
                    } else if (item.chineseName) {
                        tags.push(item.chineseName);
                    }
                }
            });
        } else if (typeof o === 'object' && o !== null) {
            Object.values(o).forEach(v => traverse(v));
        }
    }
    
    traverse(obj);
    return tags;
}

function getAllAvailableTags() {
    const tagsData = getState('tagsData');
    if (!tagsData) return [];
    return extractAllTagsFromObject(tagsData);
}

function findTagsByCategory(categoryName) {
    const tagsData = getState('tagsData');
    if (!tagsData) return [];
    
    function searchInObject(obj, targetName, path = []) {
        const results = [];
        
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = [...path, key];
            
            if (key === targetName || key.includes(targetName)) {
                const tags = extractAllTagsFromObject(value);
                results.push({ path: currentPath, tags });
            }
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                results.push(...searchInObject(value, targetName, currentPath));
            }
        }
        
        return results;
    }
    
    return searchInObject(tagsData, categoryName);
}

export {
    convertTagsFormat,
    hasDeepNesting,
    loadTagsData,
    getDefaultTagsData,
    getTagsFromCategoryPath,
    extractAllTagsFromObject,
    getAllAvailableTags,
    findTagsByCategory,
    clearTagsCache
};
