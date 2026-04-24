import { getState, setState } from '../core/state.js';
import { showToast } from '../utils/dom.js';
import { joinTags, parseTagString } from '../utils/helpers.js';

function toggleTag(tag, element) {
    const selectedTags = getState('selectedTags');
    
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        if (element) {
            element.classList.remove('selected');
        }
    } else {
        selectedTags.set(tag, true);
        if (element) {
            element.classList.add('selected');
        }
    }
    
    setState('selectedTags', selectedTags);
    updateSelectedTagsOverview();
}

function isTagSelected(tag) {
    return getState('selectedTags').has(tag);
}

function selectTag(tag) {
    const selectedTags = getState('selectedTags');
    selectedTags.set(tag, true);
    setState('selectedTags', selectedTags);
}

function deselectTag(tag) {
    const selectedTags = getState('selectedTags');
    selectedTags.delete(tag);
    setState('selectedTags', selectedTags);
}

function getSelectedTags() {
    return Array.from(getState('selectedTags').keys());
}

function getSelectedTagsString() {
    return joinTags(getSelectedTags());
}

function setSelectedTags(tags) {
    const tagMap = new Map();
    tags.forEach(tag => {
        if (tag && tag.trim()) {
            tagMap.set(tag.trim(), true);
        }
    });
    setState('selectedTags', tagMap);
}

function clearSelectedTags() {
    setState('selectedTags', new Map());
    setState('previousSelectedTags', new Map());
    updateSelectedTagsOverview();
}

function restoreSelectedTags() {
    const previousTags = getState('previousSelectedTags');
    setState('selectedTags', new Map(previousTags));
    updateSelectedTagsOverview();
}

function backupSelectedTags() {
    const currentTags = getState('selectedTags');
    setState('previousSelectedTags', new Map(currentTags));
}

function updateSelectedTagsOverview() {
    const overviewElement = document.querySelector('.selected-tags-overview');
    if (!overviewElement) return;
    
    const selectedTags = getSelectedTags();
    
    if (selectedTags.length === 0) {
        overviewElement.innerHTML = '<span style="color: #94a3b8;">未选择任何标签</span>';
        return;
    }
    
    overviewElement.innerHTML = selectedTags.map(tag => 
        `<span class="selected-tag-item" data-tag="${tag}">${tag}</span>`
    ).join('');
}

function removeSelectedTag(tag) {
    const selectedTags = getState('selectedTags');
    selectedTags.delete(tag);
    setState('selectedTags', selectedTags);
    updateSelectedTagsOverview();
}

function loadExistingTags(tagString) {
    if (!tagString) return;
    
    const tags = parseTagString(tagString);
    setSelectedTags(tags);
    updateSelectedTagsOverview();
}

function categoryHasSelectedTags(category, subCategory = null, subSubCategory = null, subSubSubCategory = null) {
    const selectedTags = getSelectedTags();
    const tagsData = getState('tagsData');
    
    if (!tagsData || selectedTags.length === 0) return false;
    
    let categoryTags = [];
    
    try {
        let current = tagsData[category];
        if (subCategory && current) current = current[subCategory];
        if (subSubCategory && current) current = current[subSubCategory];
        if (subSubSubCategory && current) current = current[subSubSubCategory];
        
        if (Array.isArray(current)) {
            categoryTags = current.map(item => 
                typeof item === 'string' ? item : (item.value || item.chineseName)
            );
        }
    } catch (e) {
        return false;
    }
    
    return categoryTags.some(tag => selectedTags.includes(tag));
}

function createRedDotIndicator() {
    const dot = document.createElement('span');
    dot.className = 'red-dot-indicator';
    dot.style.cssText = `
        position: absolute;
        top: -4px;
        right: -4px;
        width: 8px;
        height: 8px;
        background: #ef4444;
        border-radius: 50%;
        pointer-events: none;
    `;
    return dot;
}

function clearAllRedDots() {
    document.querySelectorAll('.red-dot-indicator').forEach(dot => dot.remove());
}

function updateCategoryRedDots() {
    clearAllRedDots();
    
    const categoryElements = document.querySelectorAll('.category-item');
    categoryElements.forEach(el => {
        const categoryName = el.dataset.category;
        if (categoryHasSelectedTags(categoryName)) {
            const dot = createRedDotIndicator();
            el.style.position = 'relative';
            el.appendChild(dot);
        }
    });
}

export {
    toggleTag,
    isTagSelected,
    selectTag,
    deselectTag,
    getSelectedTags,
    getSelectedTagsString,
    setSelectedTags,
    clearSelectedTags,
    restoreSelectedTags,
    backupSelectedTags,
    updateSelectedTagsOverview,
    removeSelectedTag,
    loadExistingTags,
    categoryHasSelectedTags,
    createRedDotIndicator,
    clearAllRedDots,
    updateCategoryRedDots
};
