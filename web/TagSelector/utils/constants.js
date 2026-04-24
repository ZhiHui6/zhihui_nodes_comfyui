const DEBUG = false;
const log = DEBUG ? console.log : () => {};
const warn = DEBUG ? console.warn : () => {};
const errorLog = DEBUG ? console.error : () => {};

const STYLES = {
    section: {
        marginBottom: '16px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    title: {
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#e2e8f0'
    },
    button: {
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s ease'
    },
    input: {
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        background: 'rgba(0, 0, 0, 0.3)',
        color: '#fff',
        fontSize: '14px'
    }
};

const commonStyles = {
    dialogOverlay: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '9999',
        backdropFilter: 'blur(5px)'
    },
    dialog: {
        width: '90%',
        maxWidth: '1400px',
        height: '85vh',
        backgroundColor: '#1a1a2e',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px 12px 0 0'
    },
    content: {
        flex: '1',
        display: 'flex',
        overflow: 'hidden'
    },
    sidebar: {
        width: '200px',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        overflowY: 'auto',
        padding: '12px',
        background: 'rgba(0, 0, 0, 0.2)'
    },
    mainContent: {
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '0 0 12px 12px'
    }
};

const DISABLED_ADULT_CATEGORIES = {
    "性行为": true,
    "性暗示": true,
    "性行为类型": true,
    "身体部位": true,
    "道具与玩具": true,
    "涩影湿": true
};

const ENABLED_ADULT_CATEGORIES = {};

const PRESET_KEY_MAP = {
    "默认预设": "defaultPreset",
    "人物肖像": "portrait",
    "全身人物": "fullBody",
    "风景场景": "landscape",
    "艺术创作": "artCreation",
    "太空科幻": "spaceSciFi",
    "中国风": "chineseStyle",
    "科幻赛博": "cyberpunk",
    "二次元动漫": "anime",
    "游戏角色": "gameCharacter",
    "玄幻修仙": "fantasy",
    "艺术写真": "artPhoto",
    "电影海报": "moviePoster",
    "电商产品": "ecommerce",
    "萌宠": "cutePets",
    "成人色情": "adult"
};

export {
    DEBUG,
    log,
    warn,
    errorLog,
    STYLES,
    commonStyles,
    DISABLED_ADULT_CATEGORIES,
    ENABLED_ADULT_CATEGORIES,
    PRESET_KEY_MAP
};
