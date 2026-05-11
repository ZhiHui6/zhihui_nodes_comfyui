const ADULT_SESSION_TIMEOUT = 4 * 60 * 60 * 1000;
const ADULT_MAX_FAILED_ATTEMPTS = 5;
const ADULT_LOCKOUT_DURATION = 30000;
const ADULT_STORAGE_SALT = 'zhihui_adult_v2_salt_2024';

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
    adultUnlockTimestamp: 0,
    adultFailedAttempts: 0,
    adultLockoutUntil: 0,
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
    state.adultUnlockTimestamp = 0;
    state.adultFailedAttempts = 0;
    state.adultLockoutUntil = 0;
    state.currentSelectedPreset = '默认预设';
}

export { state, getState, setState, resetState, ADULT_SESSION_TIMEOUT, ADULT_MAX_FAILED_ATTEMPTS, ADULT_LOCKOUT_DURATION, ADULT_STORAGE_SALT };
