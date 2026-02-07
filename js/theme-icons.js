// ========== 主題按鈕圖標配置模組 ==========

// 按鈕圖標配置
const buttonIcons = {
    pink: {
        fab: '✏️',
        navLedger: '📖',
        navWallet: '💰',
        navInvestment: '📈',
        navChart: '📊',
        navSettings: '⚙️'
    },
    blue: {
        fab: '✍️',
        navLedger: '📘',
        navWallet: '💵',
        navInvestment: '📉',
        navChart: '📋',
        navSettings: '🔧'
    },
    green: {
        fab: '📝',
        navLedger: '📗',
        navWallet: '💴',
        navInvestment: '📊',
        navChart: '📈',
        navSettings: '⚙️'
    },
    purple: {
        fab: '🖊️',
        navLedger: '📕',
        navWallet: '💶',
        navInvestment: '💹',
        navChart: '📉',
        navSettings: '🎛️'
    },
    orange: {
        fab: '✎',
        navLedger: '📓',
        navWallet: '💷',
        navInvestment: '📌',
        navChart: '📑',
        navSettings: '🔩'
    },
    cyan: {
        fab: '✐',
        navLedger: '📙',
        navWallet: '💸',
        navInvestment: '📍',
        navChart: '📄',
        navSettings: '🛠️'
    },
    star: {
        fab: '⭐',
        navLedger: '🌌',
        navWallet: '💫',
        navInvestment: '🌟',
        navChart: '🔭',
        navSettings: '🌠'
    },
    red: {
        fab: '❤️',
        navLedger: '📕',
        navWallet: '💴',
        navInvestment: '📊',
        navChart: '📈',
        navSettings: '⚙️'
    },
    yellow: {
        fab: '💛',
        navLedger: '📒',
        navWallet: '💰',
        navInvestment: '📈',
        navChart: '📊',
        navSettings: '🔧'
    },
    indigo: {
        fab: '💙',
        navLedger: '📘',
        navWallet: '💵',
        navInvestment: '📉',
        navChart: '📋',
        navSettings: '🔧'
    },
    teal: {
        fab: '💚',
        navLedger: '📗',
        navWallet: '💶',
        navInvestment: '💹',
        navChart: '📉',
        navSettings: '🎛️'
    },
    aurora: {
        fab: '🌈',
        navLedger: '🌈',
        navWallet: '💎',
        navInvestment: '📈',
        navChart: '📊',
        navSettings: '⚙️'
    },
    noface: {
        fab: '🪙',
        navLedger: '📜',
        navWallet: '💰',
        navInvestment: '📈',
        navChart: '📊',
        navSettings: '⚙️'
    },
    demonslayer: {
        fab: '🗡️',
        navLedger: '📓',
        navWallet: '💠',
        navInvestment: '📈',
        navChart: '📊',
        navSettings: '⚙️'
    },
    totoro: {
        fab: '🌱',
        navLedger: '📗',
        navWallet: '💰',
        navInvestment: '📈',
        navChart: '📊',
        navSettings: '⚙️'
    },
    firefly: {
        fab: '✨',
        navLedger: '✨',
        navWallet: '💫',
        navInvestment: '🌟',
        navChart: '🔭',
        navSettings: '🌠'
    },
    snow: {
        fab: '❄️',
        navLedger: '❄️',
        navWallet: '💎',
        navInvestment: '📈',
        navChart: '📊',
        navSettings: '⚙️'
    },
    cute: {
        fab: '🐾',
        navLedger: '🐾',
        navWallet: '💰',
        navInvestment: '📈',
        navChart: '📊',
        navSettings: '⚙️'
    },
    neon: {
        fab: '🟣',
        navLedger: '🟣',
        navWallet: '💎',
        navInvestment: '📈',
        navChart: '📊',
        navSettings: '⚙️'
    },
    money: {
        fab: '💸',
        navLedger: '📒',
        navWallet: '💰',
        navInvestment: '💹',
        navChart: '📊',
        navSettings: '⚙️'
    },
    space: {
        fab: '🚀',
        navLedger: '🛸',
        navWallet: '🌌',
        navInvestment: '🛰️',
        navChart: '🔭',
        navSettings: '⚙️'
    },
    fruit: {
        fab: '🍓',
        navLedger: '🍉',
        navWallet: '🍋',
        navInvestment: '🥝',
        navChart: '🍊',
        navSettings: '🍇'
    },
    meow: {
        fab: '🐱',
        navLedger: '🐈',
        navWallet: '🐾',
        navInvestment: '🐭',
        navChart: '🐹',
        navSettings: '🐰'
    },
    bluerose: {
        fab: '🗡️',
        navLedger: '📜',
        navWallet: '💎',
        navInvestment: '🛡️',
        navChart: '🏰',
        navSettings: '⚔️'
    },
    emeraldPrince: {
        fab: '👑',
        navLedger: '📜',
        navWallet: '💎',
        navInvestment: '🗡️',
        navChart: '🏰',
        navSettings: '⚔️'
    },
    goldenElegance: {
        fab: '🦋',
        navLedger: '📜',
        navWallet: '💎',
        navInvestment: '🗡️',
        navChart: '🏰',
        navSettings: '⚔️'
    },
    cuteCats: {
        fab: '🐱',
        navLedger: '🐈',
        navWallet: '🐾',
        navInvestment: '🐭',
        navChart: '🐹',
        navSettings: '🐰'
    },
    dreamy: {
        fab: '🌈',
        navLedger: '🎨',
        navWallet: '💖',
        navInvestment: '🌸',
        navChart: '🦋',
        navSettings: '✨'
    },
        dreamyfish: {
        fab: '🐠',
        navLedger: '🐟',
        navWallet: '🐡',
        navInvestment: '🦈',
        navChart: '🐙',
        navSettings: '🦑'
    },
    emerald: {
        fab: '💎',
        navLedger: '🌿',
        navWallet: '🍃',
        navInvestment: '🌱',
        navChart: '🍀',
        navSettings: '🌳'
    },
    graffiti: {
        fab: '🎨',
        navLedger: '🎭',
        navWallet: '💰',
        navInvestment: '📈',
        navChart: '📊',
        navSettings: '⚙️'
    },
    shinobu: {
        fab: '🦋',
        navLedger: '🗡️',
        navWallet: '💜',
        navInvestment: '🌸',
        navChart: '🦋',
        navSettings: '⚡'
    },
    dreamyBlue: {
        fab: '🌙',
        navLedger: '🐰',
        navWallet: '🌟',
        navInvestment: '⭐',
        navChart: '🌌',
        navSettings: '✨'
    },
    littlePrince: {
        fab: '👑',
        navLedger: '📖',
        navWallet: '🌟',
        navInvestment: '📈',
        navChart: '✨',
        navSettings: '⚙️'
    },
    getrich: {
        fab: '🧧',
        navLedger: '📖',
        navWallet: '💰',
        navInvestment: '📈',
        navChart: '📊',
        navSettings: '⚙️'
    },
    cozyWood: {
        fab: '🪵',
        navLedger: '📒',
        navWallet: '🧺',
        navInvestment: '🌿',
        navChart: '📊',
        navSettings: '🪛'
    }
};

// 原始按鈕圖標（用於還原）
const originalButtonIcons = {
    accountBtn: '💳',
    emojiBtn: '😊',
    memberBtn: '👤',
    imageBtn: '📷',
    checkBtn: '✓',
    searchBtn: '🔍',
    addCategoryBtn: '➕',
    quickNotes: {
        '早餐': '🍳',
        '午餐': '🍱',
        '晚餐': '🍽️',
        '交通': '🚗',
        '購物': '🛒',
        '娛樂': '🎮'
    }
};

// 可愛主題圖標資源
const iconAssetsCute = {
    nav: {
        ledger: 'image/1.png',
        wallet: 'image/2.png',
        investment: 'image/3.png',
        chart: 'image/4.png',
        settings: 'image/5.png'
    },
    fab: 'image/6.png'
};

// 導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buttonIcons, originalButtonIcons, iconAssetsCute };
} else {
    window.ThemeIcons = { buttonIcons, originalButtonIcons, iconAssetsCute };
}
