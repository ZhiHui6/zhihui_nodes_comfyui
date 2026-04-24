const domCache = new Map();
const searchCache = new Map();
const tagsCache = new Map();
const MAX_CACHE_SIZE = 100;

function getCachedElement(selector, parent = document) {
    const cacheKey = `${parent === document ? 'doc' : parent.id || parent.className}_${selector}`;
    
    if (domCache.has(cacheKey)) {
        const cached = domCache.get(cacheKey);
        if (cached.element && document.contains(cached.element)) {
            return cached.element;
        }
        domCache.delete(cacheKey);
    }
    
    const element = parent.querySelector(selector);
    if (element) {
        if (domCache.size >= MAX_CACHE_SIZE) {
            const firstKey = domCache.keys().next().value;
            domCache.delete(firstKey);
        }
        domCache.set(cacheKey, { element, timestamp: Date.now() });
    }
    
    return element;
}

function clearDomCache() {
    domCache.clear();
}

function clearSearchCache() {
    searchCache.clear();
}

function clearTagsCache() {
    tagsCache.clear();
}

function clearAllCaches() {
    domCache.clear();
    searchCache.clear();
    tagsCache.clear();
}

function getSearchCache() {
    return searchCache;
}

function getTagsCache() {
    return tagsCache;
}

export {
    domCache,
    searchCache,
    tagsCache,
    MAX_CACHE_SIZE,
    getCachedElement,
    clearDomCache,
    clearSearchCache,
    clearTagsCache,
    clearAllCaches,
    getSearchCache,
    getTagsCache
};
