const state = {
    tagSelectorDialog: null,
    currentNode: null,
    tagsData: null,
    currentPreviewImage: null,
    currentPreviewImageName: null,
    selectedTags: new Map(),
    previousSelectedTags: new Map(),
    adultContentEnabled: false,
    adultContentUnlocked: false,
    currentSelectedPreset: '默认预设',
    randomSettings: null
};

function getState(key) {
    return key ? state[key] : state;
}

function setState(key, value) {
    if (typeof key === 'object') {
        Object.assign(state, key);
    } else {
        state[key] = value;
    }
}

function resetState() {
    state.tagSelectorDialog = null;
    state.currentNode = null;
    state.tagsData = null;
    state.currentPreviewImage = null;
    state.currentPreviewImageName = null;
    state.selectedTags = new Map();
    state.previousSelectedTags = new Map();
    state.adultContentEnabled = false;
    state.adultContentUnlocked = false;
    state.currentSelectedPreset = '默认预设';
}

export { state, getState, setState, resetState };
