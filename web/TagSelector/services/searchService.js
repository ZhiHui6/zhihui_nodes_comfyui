import { getState } from '../core/state.js';
import { getSearchCache } from '../core/cache.js';
import { PerformanceUtils } from '../core/performance.js';
import { log } from '../utils/constants.js';

const fuzzyMatch = PerformanceUtils.memoize((str, query) => {
    if (!str || !query) return false;
    
    const s = str.toLowerCase();
    const q = query.toLowerCase();
    
    if (s.includes(q)) return true;
    
    let queryIndex = 0;
    for (let i = 0; i < s.length && queryIndex < q.length; i++) {
        if (s[i] === q[queryIndex]) {
            queryIndex++;
        }
    }
    
    return queryIndex === q.length;
});

function searchTags(query) {
    const q = query.toLowerCase().trim();
    
    if (!q) return [];
    
    const searchCache = getSearchCache();
    if (searchCache.has(q)) {
        return searchCache.get(q);
    }
    
    const results = [];
    const tagsData = getState('tagsData');
    
    if (!tagsData) return results;
    
    const walk = (node, pathArr) => {
        if (Array.isArray(node)) {
            node.forEach(item => {
                let display, value;
                
                if (typeof item === 'string') {
                    display = item;
                    value = item;
                } else if (typeof item === 'object' && item !== null) {
                    display = item.chineseName || item.display || item.value;
                    value = item.value || display;
                }
                
                if (display && fuzzyMatch(display, q)) {
                    results.push({
                        display,
                        value,
                        path: pathArr.join(' > ')
                    });
                }
            });
        } else if (typeof node === 'object' && node !== null) {
            Object.entries(node).forEach(([k, v]) => {
                walk(v, [...pathArr, k]);
            });
        }
    };
    
    Object.entries(tagsData).forEach(([k, v]) => {
        walk(v, [k]);
    });
    
    if (searchCache.size > 100) {
        const firstKey = searchCache.keys().next().value;
        searchCache.delete(firstKey);
    }
    searchCache.set(q, results);
    
    return results;
}

function searchTagsInCategory(query, categoryPath) {
    const allResults = searchTags(query);
    return allResults.filter(result => 
        result.path.startsWith(categoryPath)
    );
}

function getRecentSearches(maxCount = 10) {
    const stored = localStorage.getItem('tagSelector_recentSearches');
    return stored ? JSON.parse(stored).slice(0, maxCount) : [];
}

function addRecentSearch(query) {
    if (!query || !query.trim()) return;
    
    const recent = getRecentSearches(20);
    const filtered = recent.filter(s => s !== query);
    filtered.unshift(query);
    
    localStorage.setItem(
        'tagSelector_recentSearches',
        JSON.stringify(filtered.slice(0, 20))
    );
}

function clearRecentSearches() {
    localStorage.removeItem('tagSelector_recentSearches');
}

export {
    fuzzyMatch,
    searchTags,
    searchTagsInCategory,
    getRecentSearches,
    addRecentSearch,
    clearRecentSearches
};
