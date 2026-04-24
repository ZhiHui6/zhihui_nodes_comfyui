export { state, getState, setState, resetState } from './state.js';
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
} from './cache.js';
export { PerformanceUtils, tooltipPool, tagElementPool } from './performance.js';