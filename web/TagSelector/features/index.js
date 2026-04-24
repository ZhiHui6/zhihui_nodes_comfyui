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
} from './adultContent.js';

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
} from './tagSelection.js';
