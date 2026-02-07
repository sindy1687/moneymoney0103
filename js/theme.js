// ========== 主題顏色功能 ==========
var themes = window.AppThemes || [
    {
        id: 'pink',
        name: '粉色主題',
        icon: '💖',
        buttonIcon: '💗',
        preview: 'linear-gradient(135deg, #ffeef5 0%, #fff5f9 100%)',
        color: '#ff69b4',
        category: 'basic'
    },
    {
        id: 'blue',
        name: '藍色主題',
        icon: '💙',
        buttonIcon: '💙',
        preview: 'linear-gradient(135deg, #e8f4fd 0%, #f0f8ff 100%)',
        color: '#4a90e2',
        category: 'basic'
    },
    {
        id: 'green',
        name: '綠色主題',
        icon: '💚',
        buttonIcon: '💚',
        preview: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%)',
        color: '#4caf50',
        category: 'basic'
    },
    {
        id: 'purple',
        name: '紫色主題',
        icon: '💜',
        buttonIcon: '💜',
        preview: 'linear-gradient(135deg, #f3e5f5 0%, #fce4ec 100%)',
        color: '#9c27b0',
        category: 'basic'
    },
    {
        id: 'orange',
        name: '橙色主題',
        icon: '🧡',
        buttonIcon: '🧡',
        preview: 'linear-gradient(135deg, #fff3e0 0%, #fff8f0 100%)',
        color: '#ff9800',
        category: 'basic'
    },
    {
        id: 'cyan',
        name: '青色主題',
        icon: '🩵',
        buttonIcon: '🩵',
        preview: 'linear-gradient(135deg, #e0f7fa 0%, #f0fdfe 100%)',
        color: '#00bcd4',
        category: 'basic'
    },
    {
        id: 'red',
        name: '紅色主題',
        icon: '❤️',
        buttonIcon: '❤️',
        preview: 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)',
        color: '#e53935',
        category: 'basic'
    },
    {
        id: 'yellow',
        name: '黃色主題',
        icon: '💛',
        buttonIcon: '💛',
        preview: 'linear-gradient(135deg, #fffde7 0%, #fffef5 100%)',
        color: '#fbc02d',
        category: 'basic'
    },
    {
        id: 'indigo',
        name: '靛藍主題',
        icon: '🔵',
        buttonIcon: '🔵',
        preview: 'linear-gradient(135deg, #e8eaf6 0%, #f3f4f9 100%)',
        color: '#5c6bc0',
        category: 'basic'
    },
    {
        id: 'teal',
        name: '茶色主題',
        icon: '💚',
        buttonIcon: '💚',
        preview: 'linear-gradient(135deg, #e0f2f1 0%, #f0f9f8 100%)',
        color: '#26a69a',
        category: 'basic'
    },
    {
        id: 'dreamyGalaxy',
        name: '夢幻星河',
        icon: '🌌',
        buttonIcon: '✨',
        preview: 'url("https://i.pinimg.com/736x/2a/20/38/2a2038686a48d048cc0b21e4f2ba44a5.jpg") center/cover',
        color: '#B19CD9',
        category: 'cosmic',
        backgroundImage: 'https://i.pinimg.com/736x/2a/20/38/2a2038686a48d048cc0b21e4f2ba44a5.jpg',
        investmentCardImage: 'https://i.pinimg.com/736x/2a/20/38/2a2038686a48d048cc0b21e4f2ba44a5.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/2a/20/38/2a2038686a48d048cc0b21e4f2ba44a5.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/736x/2a/20/38/2a2038686a48d048cc0b21e4f2ba44a5.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/2a/20/38/2a2038686a48d048cc0b21e4f2ba44a5.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/2a/20/38/2a2038686a48d048cc0b21e4f2ba44a5.jpg',
        holdingCardImage: 'https://i.pinimg.com/736x/2a/20/38/2a2038686a48d048cc0b21e4f2ba44a5.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/2a/20/38/2a2038686a48d048cc0b21e4f2ba44a5.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/2a/20/38/2a2038686a48d048cc0b21e4f2ba44a5.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/2a/20/38/2a2038686a48d048cc0b21e4f2ba44a5.jpg'
    },
    {
        id: 'star',
        name: '星空主題',
        icon: '✨',
        buttonIcon: '✨',
        preview: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
        color: '#8b7cf6',
        category: 'cosmic'
    },
    {
        id: 'aurora',
        name: '極光主題',
        icon: '🌈',
        buttonIcon: '🌈',
        preview: 'linear-gradient(135deg, #071a52 0%, #0b8457 50%, #7c3aed 100%)',
        color: '#00d4ff',
        category: 'cosmic'
    },
    {
        id: 'firefly',
        name: '螢火蟲主題',
        icon: '✨',
        buttonIcon: '✨',
        preview: 'linear-gradient(135deg, #0b1020 0%, #1a2b3f 100%)',
        color: '#facc15',
        category: 'cosmic'
    },
    {
        id: 'neon',
        name: '霓虹波動',
        icon: '🟣',
        buttonIcon: '🟣',
        preview: 'linear-gradient(135deg, #0b1020 0%, #1f1147 50%, #00d4ff 100%)',
        color: '#7c3aed',
        category: 'cosmic'
    },
    {
        id: 'midnight',
        name: '午夜深色',
        icon: '🌙',
        buttonIcon: '🌙',
        preview: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        color: '#6366f1',
        category: 'dark'
    },
    {
        id: 'space',
        name: '星際宇航',
        icon: '🚀',
        buttonIcon: '🛸',
        preview: 'linear-gradient(135deg, #001428 0%, #002850 60%, #8a2be2 100%)',
        color: '#00d4ff',
        category: 'dynamic',
        backgroundVideo: 'https://v1.pinimg.com/videos/iht/720p/4e/00/d1/4e00d1999152ab007ebe4aef36d5e2c9.mp4'
    },
    {
        id: 'totoro',
        name: '龍貓主題',
        icon: '🌼',
        buttonIcon: '🌼',
        preview: 'url("https://i.pinimg.com/736x/f6/e9/10/f6e910dc17992265ad9833055ff153ac.jpg") center/cover',
        color: '#4682B4',
        category: 'anime',
        backgroundImage: 'https://i.pinimg.com/736x/f6/e9/10/f6e910dc17992265ad9833055ff153ac.jpg'
    },
    {
        id: 'noface',
        name: '無臉男主題',
        icon: '🎭',
        buttonIcon: '🎭',
        preview: 'url("https://i.pinimg.com/1200x/fe/b3/f9/feb3f9990f903e1b7b0f4a2066a97722.jpg") center/cover',
        color: '#f6c343',
        category: 'anime',
        backgroundImage: 'https://i.pinimg.com/1200x/fe/b3/f9/feb3f9990f903e1b7b0f4a2066a97722.jpg'
    },
    {
        id: 'demonslayer',
        name: '鬼滅之刃主題',
        icon: '🗡️',
        buttonIcon: '🗡️',
        preview: 'url("https://i.pinimg.com/736x/73/3c/b0/733cb0696372d66f16702dd385a5aa5b.jpg") center/cover',
        color: '#00c2d1',
        category: 'anime',
        backgroundImage: 'https://i.pinimg.com/736x/73/3c/b0/733cb0696372d66f16702dd385a5aa5b.jpg'
    },
    {
        id: 'shinchan',
        name: '蠟筆小新主題',
        icon: '🌻',
        buttonIcon: '🌻',
        preview: 'url("https://i.pinimg.com/1200x/c3/66/a8/c366a88a9b62dee30d8628ddae89afa9.jpg") center/cover',
        color: '#FFD700',
        category: 'anime',
        backgroundImage: 'https://i.pinimg.com/1200x/c3/66/a8/c366a88a9b62dee30d8628ddae89afa9.jpg'
    },
    {
        id: 'anyaMelody',
        name: '安妮亞旋律',
        icon: '🎵',
        buttonIcon: '🎶',
        preview: 'url("https://i.pinimg.com/736x/5b/e3/dd/5be3dd7d3c655fbc76f891dc98240304.jpg") center/cover',
        color: '#f06c9b',
        category: 'anime',
        backgroundImage: 'https://i.pinimg.com/736x/5b/e3/dd/5be3dd7d3c655fbc76f891dc98240304.jpg',
        investmentCardImage: 'https://i.pinimg.com/736x/5b/e3/dd/5be3dd7d3c655fbc76f891dc98240304.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/5b/e3/dd/5be3dd7d3c655fbc76f891dc98240304.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/736x/5b/e3/dd/5be3dd7d3c655fbc76f891dc98240304.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/5b/e3/dd/5be3dd7d3c655fbc76f891dc98240304.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/5b/e3/dd/5be3dd7d3c655fbc76f891dc98240304.jpg',
        holdingCardImage: 'https://i.pinimg.com/736x/5b/e3/dd/5be3dd7d3c655fbc76f891dc98240304.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/5b/e3/dd/5be3dd7d3c655fbc76f891dc98240304.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/5b/e3/dd/5be3dd7d3c655fbc76f891dc98240304.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/5b/e3/dd/5be3dd7d3c655fbc76f891dc98240304.jpg'
    },
    {
        id: 'money',
        name: '金錢滿滿',
        icon: '💸',
        buttonIcon: '💸',
        preview: 'url("https://i.pinimg.com/736x/cc/56/8d/cc568d4109c2c92d507f597ba0ece7be.jpg") center/cover',
        color: '#16f49a',
        category: 'dynamic',
        backgroundImage: 'https://i.pinimg.com/736x/cc/56/8d/cc568d4109c2c92d507f597ba0ece7be.jpg',
        backgroundVideo: 'https://v1.pinimg.com/videos/iht/expMp4/a4/53/29/a45329a21920d8db7a7f778daa592453_720w.mp4'
    },
    {
        id: 'caitu',
        name: '財兔滿滿',
        icon: '🐰',
        buttonIcon: '🐰',
        preview: 'url("https://i.pinimg.com/736x/85/9c/7c/859c7c50479b84c65089909c4acec1f3.jpg") center/cover',
        color: '#FFD700',
        category: 'wealth',
        backgroundImage: 'https://i.pinimg.com/736x/85/9c/7c/859c7c50479b84c65089909c4acec1f3.jpg'
    },
    {
        id: 'floralGradient',
        name: '花漾漸層',
        icon: '🌺',
        buttonIcon: '🌺',
        preview: 'linear-gradient(135deg, rgba(255, 128, 160, 0.35) 0%, rgba(255, 202, 98, 0.3) 35%, rgba(140, 220, 255, 0.25) 70%, rgba(200, 170, 255, 0.25) 100%)',
        color: '#ff5a8a',
        category: 'cute',
        backgroundImage: 'https://i.pinimg.com/1200x/ad/aa/b6/adaab6e2e82651185578cf132884c482.jpg',
        investmentCardImage: 'https://i.pinimg.com/1200x/ad/aa/b6/adaab6e2e82651185578cf132884c482.jpg',
        accountingCardImage: 'https://i.pinimg.com/1200x/ad/aa/b6/adaab6e2e82651185578cf132884c482.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/1200x/ad/aa/b6/adaab6e2e82651185578cf132884c482.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/1200x/ad/aa/b6/adaab6e2e82651185578cf132884c482.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/1200x/ad/aa/b6/adaab6e2e82651185578cf132884c482.jpg',
        holdingCardImage: 'https://i.pinimg.com/1200x/ad/aa/b6/adaab6e2e82651185578cf132884c482.jpg',
        buyingCardImage: 'https://i.pinimg.com/1200x/ad/aa/b6/adaab6e2e82651185578cf132884c482.jpg',
        sellingCardImage: 'https://i.pinimg.com/1200x/ad/aa/b6/adaab6e2e82651185578cf132884c482.jpg',
        dividendCardImage: 'https://i.pinimg.com/1200x/ad/aa/b6/adaab6e2e82651185578cf132884c482.jpg'
    },
    {
        id: 'crystalFortune',
        name: '粉晶招財',
        icon: '💎',
        buttonIcon: '🪙',
        preview: 'linear-gradient(135deg, rgba(255, 214, 230, 0.55) 0%, rgba(255, 236, 246, 0.45) 28%, rgba(201, 235, 255, 0.35) 62%, rgba(255, 215, 140, 0.28) 100%)',
        color: '#f3b7d6',
        category: 'wealth',
        backgroundImage: 'https://i.pinimg.com/1200x/ce/51/ad/ce51ad70ef8ce24f13090a3dc913b0f6.jpg',
        investmentCardImage: 'https://i.pinimg.com/1200x/ce/51/ad/ce51ad70ef8ce24f13090a3dc913b0f6.jpg',
        accountingCardImage: 'https://i.pinimg.com/1200x/ce/51/ad/ce51ad70ef8ce24f13090a3dc913b0f6.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/1200x/ce/51/ad/ce51ad70ef8ce24f13090a3dc913b0f6.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/1200x/ce/51/ad/ce51ad70ef8ce24f13090a3dc913b0f6.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/1200x/ce/51/ad/ce51ad70ef8ce24f13090a3dc913b0f6.jpg',
        holdingCardImage: 'https://i.pinimg.com/1200x/ce/51/ad/ce51ad70ef8ce24f13090a3dc913b0f6.jpg',
        buyingCardImage: 'https://i.pinimg.com/1200x/ce/51/ad/ce51ad70ef8ce24f13090a3dc913b0f6.jpg',
        sellingCardImage: 'https://i.pinimg.com/1200x/ce/51/ad/ce51ad70ef8ce24f13090a3dc913b0f6.jpg',
        dividendCardImage: 'https://i.pinimg.com/1200x/ce/51/ad/ce51ad70ef8ce24f13090a3dc913b0f6.jpg'
    },
    {
        id: 'emeraldPrince',
        name: '翡翠王子',
        icon: '👑',
        buttonIcon: '🗡️',
        preview: 'url("https://i.pinimg.com/736x/55/40/2f/55402fb6bcf0c65c832636ad5504499f.jpg") center/cover',
        color: '#2E8B57',
        category: 'fantasy',
        backgroundImage: 'https://i.pinimg.com/736x/55/40/2f/55402fb6bcf0c65c832636ad5504499f.jpg'
    },
    {
        id: 'cuteCats',
        name: '可愛貓咪',
        icon: '🐱',
        buttonIcon: '🐈',
        preview: 'url("https://i.pinimg.com/736x/fe/2a/cf/fe2acfb6eedcf65941dad52ad03e3490.jpg") center/cover',
        color: '#FFB6C1',
        category: 'cute',
        backgroundImage: 'https://i.pinimg.com/736x/fe/2a/cf/fe2acfb6eedcf65941dad52ad03e3490.jpg',
        investmentCardImage: 'https://i.pinimg.com/736x/bf/bb/d8/bfbbd8069018715418b04a38e199a34d.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/a7/bb/f9/a7bbf99031a6d722e01446217985af5f.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/1200x/95/64/99/956499812b93c3c5bf8226051c7e627f.jpg'
    },
    {
        id: 'dreamy',
        name: '夢幻境域',
        icon: '🌈',
        buttonIcon: '🎨',
        preview: 'url("https://i.pinimg.com/736x/21/4d/cc/214dccff6dac6b30bebd621afc60669d.jpg") center/cover',
        color: '#87CEEB',
        category: 'cute',
        backgroundImage: 'https://i.pinimg.com/736x/21/4d/cc/214dccff6dac6b30bebd621afc60669d.jpg',
        investmentCardImage: 'https://i.pinimg.com/736x/21/4d/cc/214dccff6dac6b30bebd621afc60669d.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/21/4d/cc/214dccff6dac6b30bebd621afc60669d.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/1200x/95/64/99/956499812b93c3c5bf8226051c7e627f.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/21/4d/cc/214dccff6dac6b30bebd621afc60669d.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/21/4d/cc/214dccff6dac6b30bebd621afc60669d.jpg',
        holdingCardImage: 'https://i.pinimg.com/736x/21/4d/cc/214dccff6dac6b30bebd621afc60669d.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/21/4d/cc/214dccff6dac6b30bebd621afc60669d.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/21/4d/cc/214dccff6dac6b30bebd621afc60669d.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/21/4d/cc/214dccff6dac6b30bebd621afc60669d.jpg'
    },
    {
        id: 'dreamyfish',
        name: '夢幻魚語',
        icon: '🐠',
        buttonIcon: '🐟',
        preview: 'url("https://i.pinimg.com/736x/a3/82/37/a382370de3785e43c0bd8db75fa13e67.jpg") center/cover',
        color: '#87CEEB',
        category: 'cute',
        backgroundImage: 'https://i.pinimg.com/736x/a3/82/37/a382370de3785e43c0bd8db75fa13e67.jpg',
        investmentCardImage: 'https://i.pinimg.com/736x/a3/82/37/a382370de3785e43c0bd8db75fa13e67.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/a3/82/37/a382370de3785e43c0bd8db75fa13e67.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/1200x/95/64/99/956499812b93c3c5bf8226051c7e627f.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/a3/82/37/a382370de3785e43c0bd8db75fa13e67.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/a3/82/37/a382370de3785e43c0bd8db75fa13e67.jpg',
        holdingCardImage: 'https://i.pinimg.com/736x/a3/82/37/a382370de3785e43c0bd8db75fa13e67.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/a3/82/37/a382370de3785e43c0bd8db75fa13e67.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/a3/82/37/a382370de3785e43c0bd8db75fa13e67.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/a3/82/37/a382370de3785e43c0bd8db75fa13e67.jpg'
    },
    {
        id: 'emerald',
        name: '翠綠之夢',
        icon: '💎',
        buttonIcon: '🌿',
        preview: 'url("https://i.pinimg.com/736x/54/58/17/5458177129997fbd8f56b713e39d2d0f.jpg") center/cover',
        color: '#2E8B57',
        category: 'fantasy',
        backgroundImage: 'https://i.pinimg.com/736x/54/58/17/5458177129997fbd8f56b713e39d2d0f.jpg',
        investmentCardImage: 'https://i.pinimg.com/736x/54/58/17/5458177129997fbd8f56b713e39d2d0f.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/54/58/17/5458177129997fbd8f56b713e39d2d0f.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/1200x/95/64/99/956499812b93c3c5bf8226051c7e627f.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/54/58/17/5458177129997fbd8f56b713e39d2d0f.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/54/58/17/5458177129997fbd8f56b713e39d2d0f.jpg',
        holdingCardImage: 'https://i.pinimg.com/736x/54/58/17/5458177129997fbd8f56b713e39d2d0f.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/54/58/17/5458177129997fbd8f56b713e39d2d0f.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/54/58/17/5458177129997fbd8f56b713e39d2d0f.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/54/58/17/5458177129997fbd8f56b713e39d2d0f.jpg'
    },
    {
        id: 'graffiti',
        name: '塗鴉風格',
        icon: '🎨',
        buttonIcon: '🎭',
        preview: 'url("https://i.pinimg.com/1200x/fa/a1/0c/faa10cd0b7816efb3ac74d940bc4bda4.jpg") center/cover',
        color: '#1E90FF',
        category: 'fantasy',
        backgroundImage: 'https://i.pinimg.com/1200x/fa/a1/0c/faa10cd0b7816efb3ac74d940bc4bda4.jpg',
        investmentCardImage: 'https://i.pinimg.com/1200x/fa/a1/0c/faa10cd0b7816efb3ac74d940bc4bda4.jpg',
        accountingCardImage: 'https://i.pinimg.com/1200x/fa/a1/0c/faa10cd0b7816efb3ac74d940bc4bda4.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/1200x/fa/a1/0c/faa10cd0b7816efb3ac74d940bc4bda4.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/1200x/fa/a1/0c/faa10cd0b7816efb3ac74d940bc4bda4.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/1200x/fa/a1/0c/faa10cd0b7816efb3ac74d940bc4bda4.jpg',
        holdingCardImage: 'https://i.pinimg.com/1200x/fa/a1/0c/faa10cd0b7816efb3ac74d940bc4bda4.jpg',
        buyingCardImage: 'https://i.pinimg.com/1200x/fa/a1/0c/faa10cd0b7816efb3ac74d940bc4bda4.jpg',
        sellingCardImage: 'https://i.pinimg.com/1200x/fa/a1/0c/faa10cd0b7816efb3ac74d940bc4bda4.jpg',
        dividendCardImage: 'https://i.pinimg.com/1200x/fa/a1/0c/faa10cd0b7816efb3ac74d940bc4bda4.jpg'
    },
    {
        id: 'shinobu',
        name: '蝴蝶忍',
        icon: '🦋',
        buttonIcon: '🗡️',
        preview: 'url("https://i.pinimg.com/736x/26/c9/c0/26c9c0297b0cad3dfa8d6d5c41ccfc18.jpg") center/cover',
        color: '#9B59B6',
        category: 'anime',
        backgroundImage: 'https://i.pinimg.com/736x/26/c9/c0/26c9c0297b0cad3dfa8d6d5c41ccfc18.jpg',
        investmentCardImage: 'https://i.pinimg.com/736x/26/c9/c0/26c9c0297b0cad3dfa8d6d5c41ccfc18.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/26/c9/c0/26c9c0297b0cad3dfa8d6d5c41ccfc18.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/736x/8b/18/2b/8b182b4b3bdc6420ae9bb42b08025854.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/26/c9/c0/26c9c0297b0cad3dfa8d6d5c41ccfc18.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/26/c9/c0/26c9c0297b0cad3dfa8d6d5c41ccfc18.jpg',
        holdingCardImage: 'https://i.pinimg.com/736x/26/c9/c0/26c9c0297b0cad3dfa8d6d5c41ccfc18.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/26/c9/c0/26c9c0297b0cad3dfa8d6d5c41ccfc18.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/26/c9/c0/26c9c0297b0cad3dfa8d6d5c41ccfc18.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/26/c9/c0/26c9c0297b0cad3dfa8d6d5c41ccfc18.jpg'
    },
    {
        id: 'spacegold',
        name: '太空金彩',
        icon: '🚀',
        buttonIcon: '🪐',
        preview: 'url("https://i.pinimg.com/736x/eb/33/27/eb3327b7caa47a87c1f4cee99344892e.jpg") center/cover',
        color: '#FFD700',
        category: 'cosmic',
        backgroundImage: 'https://i.pinimg.com/736x/eb/33/27/eb3327b7caa47a87c1f4cee99344892e.jpg',
        investmentCardImage: 'https://i.pinimg.com/736x/85/74/68/857468da4307fa5dc160ad691a91203b.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/eb/33/27/eb3327b7caa47a87c1f4cee99344892e.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/736x/eb/33/27/eb3327b7caa47a87c1f4cee99344892e.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/85/74/68/857468da4307fa5dc160ad691a91203b.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/eb/33/27/eb3327b7caa47a87c1f4cee99344892e.jpg',
        holdingCardImage: 'https://i.pinimg.com/736x/eb/33/27/eb3327b7caa47a87c1f4cee99344892e.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/eb/33/27/eb3327b7caa47a87c1f4cee99344892e.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/eb/33/27/eb3327b7caa47a87c1f4cee99344892e.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/eb/33/27/eb3327b7caa47a87c1f4cee99344892e.jpg'
    },
    {
        id: 'getrich',
        name: '恭喜發財',
        icon: '🧧',
        buttonIcon: '💰',
        preview: 'url("https://i.pinimg.com/1200x/c9/6c/28/c96c28bb9f8555ef81c7649f97aac720.jpg") center/cover',
        color: '#D42C2C',
        category: 'wealth',
        backgroundImage: 'https://i.pinimg.com/1200x/c9/6c/28/c96c28bb9f8555ef81c7649f97aac720.jpg',
        investmentCardImage: 'https://i.pinimg.com/1200x/c9/6c/28/c96c28bb9f8555ef81c7649f97aac720.jpg',
        accountingCardImage: 'https://i.pinimg.com/1200x/c9/6c/28/c96c28bb9f8555ef81c7649f97aac720.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/1200x/c9/6c/28/c96c28bb9f8555ef81c7649f97aac720.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/1200x/c9/6c/28/c96c28bb9f8555ef81c7649f97aac720.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/1200x/c9/6c/28/c96c28bb9f8555ef81c7649f97aac720.jpg',
        holdingCardImage: 'https://i.pinimg.com/1200x/c9/6c/28/c96c28bb9f8555ef81c7649f97aac720.jpg',
        buyingCardImage: 'https://i.pinimg.com/1200x/c9/6c/28/c96c28bb9f8555ef81c7649f97aac720.jpg',
        sellingCardImage: 'https://i.pinimg.com/1200x/c9/6c/28/c96c28bb9f8555ef81c7649f97aac720.jpg',
        dividendCardImage: 'https://i.pinimg.com/1200x/c9/6c/28/c96c28bb9f8555ef81c7649f97aac720.jpg'
    },
    {
        id: 'attractGold',
        name: '吸金紅金',
        icon: '🪙',
        buttonIcon: '🧧',
        preview: 'url("https://i.pinimg.com/1200x/94/e4/9e/94e49ef07a1ce58f8bfa3b177a580bd5.jpg") center/cover',
        color: '#C62828',
        category: 'wealth',
        cssBackground: true,
        backgroundImage: 'https://i.pinimg.com/1200x/94/e4/9e/94e49ef07a1ce58f8bfa3b177a580bd5.jpg',
        investmentCardImage: 'https://i.pinimg.com/1200x/94/e4/9e/94e49ef07a1ce58f8bfa3b177a580bd5.jpg',
        accountingCardImage: 'https://i.pinimg.com/1200x/94/e4/9e/94e49ef07a1ce58f8bfa3b177a580bd5.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/1200x/94/e4/9e/94e49ef07a1ce58f8bfa3b177a580bd5.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/1200x/94/e4/9e/94e49ef07a1ce58f8bfa3b177a580bd5.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/1200x/94/e4/9e/94e49ef07a1ce58f8bfa3b177a580bd5.jpg',
        holdingCardImage: 'https://i.pinimg.com/1200x/94/e4/9e/94e49ef07a1ce58f8bfa3b177a580bd5.jpg',
        buyingCardImage: 'https://i.pinimg.com/1200x/94/e4/9e/94e49ef07a1ce58f8bfa3b177a580bd5.jpg',
        sellingCardImage: 'https://i.pinimg.com/1200x/94/e4/9e/94e49ef07a1ce58f8bfa3b177a580bd5.jpg',
        dividendCardImage: 'https://i.pinimg.com/1200x/94/e4/9e/94e49ef07a1ce58f8bfa3b177a580bd5.jpg'
    },
    {
        id: 'festive',
        name: '節日慶典',
        icon: '🎊',
        buttonIcon: '🎉',
        preview: 'url("https://i.pinimg.com/736x/c8/57/a1/c857a19b3f5bd274ba864e54dc27f550.jpg") center/cover',
        color: '#E63946',
        category: 'celebration',
        backgroundImage: 'https://i.pinimg.com/736x/c8/57/a1/c857a19b3f5bd274ba864e54dc27f550.jpg',
        investmentCardImage: 'https://i.pinimg.com/1200x/ba/24/9a/ba249a3cc3f9f317683f78c240ff0686.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/c8/57/a1/c857a19b3f5bd274ba864e54dc27f550.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/736x/6f/49/9a/6f499af434927a2eff91221a60393ae5.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/c8/57/a1/c857a19b3f5bd274ba864e54dc27f550.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/1200x/ba/24/9a/ba249a3cc3f9f317683f78c240ff0686.jpg',
        holdingCardImage: 'https://i.pinimg.com/1200x/ba/24/9a/ba249a3cc3f9f317683f78c240ff0686.jpg',
        buyingCardImage: 'https://i.pinimg.com/1200x/ba/24/9a/ba249a3cc3f9f317683f78c240ff0686.jpg',
        sellingCardImage: 'https://i.pinimg.com/1200x/ba/24/9a/ba249a3cc3f9f317683f78c240ff0686.jpg',
        dividendCardImage: 'https://i.pinimg.com/1200x/ba/24/9a/ba249a3cc3f9f317683f78c240ff0686.jpg'
    },
    {
        id: 'shinchanPool',
        name: '小新泳池派對',
        icon: '🏊',
        preview: 'url("image/79793c93271b2231adefb28841972eec.jpg") center/cover',
        color: '#00CED1',
        category: 'dynamic',
        backgroundImage: 'image/79793c93271b2231adefb28841972eec.jpg',
        backgroundVideo: 'https://v1.pinimg.com/videos/iht/expMp4/76/35/eb/7635eb2cc1d1c08a867742f7144faf11_720w.mp4'
    },
    {
        id: 'nightglowSeasons',
        name: '夜光四季',
        icon: '🌃',
        buttonIcon: '✨',
        preview: 'linear-gradient(135deg, #0a1929 0%, #1e3a5f 25%, #2e5266 50%, #1a365d 75%, #0f172a 100%)',
        color: '#64ffda',
        category: 'dynamic',
        backgroundVideo: 'https://v1.pinimg.com/videos/iht/expMp4/c7/39/73/c739737a7c0471e01fa4e606507d0a48_720w.mp4'
    },
    {
        id: 'mori',
        name: '小森主題',
        icon: '🍃',
        buttonIcon: '🍃',
        preview: 'url("https://i.pinimg.com/736x/91/12/d5/9112d581109a8069dff4011d272cd26f.jpg") center/cover',
        color: '#3B7A57',
        category: 'fantasy',
        backgroundImage: 'https://i.pinimg.com/736x/91/12/d5/9112d581109a8069dff4011d272cd26f.jpg',
        investmentCardImage: 'https://i.pinimg.com/736x/91/12/d5/9112d581109a8069dff4011d272cd26f.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/91/12/d5/9112d581109a8069dff4011d272cd26f.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/736x/91/12/d5/9112d581109a8069dff4011d272cd26f.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/91/12/d5/9112d581109a8069dff4011d272cd26f.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/91/12/d5/9112d581109a8069dff4011d272cd26f.jpg',
        holdingCardImage: 'https://i.pinimg.com/736x/91/12/d5/9112d581109a8069dff4011d272cd26f.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/91/12/d5/9112d581109a8069dff4011d272cd26f.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/91/12/d5/9112d581109a8069dff4011d272cd26f.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/91/12/d5/9112d581109a8069dff4011d272cd26f.jpg'
    },
    {
        id: 'littlePrince',
        name: '小王子星光',
        icon: '👑',
        buttonIcon: '⭐',
        preview: 'url("https://i.pinimg.com/736x/91/87/48/918748238a3b26c91dcacd9926591d57.jpg") center/cover',
        color: '#3E5B9A',
        category: 'fantasy',
        backgroundImage: 'https://i.pinimg.com/736x/91/87/48/918748238a3b26c91dcacd9926591d57.jpg',
        investmentCardImage: 'https://i.pinimg.com/736x/91/87/48/918748238a3b26c91dcacd9926591d57.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/91/87/48/918748238a3b26c91dcacd9926591d57.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/736x/91/87/48/918748238a3b26c91dcacd9926591d57.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/91/87/48/918748238a3b26c91dcacd9926591d57.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/91/87/48/918748238a3b26c91dcacd9926591d57.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/91/87/48/918748238a3b26c91dcacd9926591d57.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/91/87/48/918748238a3b26c91dcacd9926591d57.jpg'
    },
    {
        id: 'jellyParty',
        name: '果凍派對',
        icon: '🍬',
        buttonIcon: '🍬',
        preview: 'url("https://i.pinimg.com/736x/c2/b1/45/c2b14507e3346ef9d72d09d83f54e430.jpg") center/cover',
        color: '#ff7aa2',
        category: 'cute',
        backgroundImage: 'https://i.pinimg.com/736x/c2/b1/45/c2b14507e3346ef9d72d09d83f54e430.jpg',
        investmentCardImage: 'https://i.pinimg.com/736x/c2/b1/45/c2b14507e3346ef9d72d09d83f54e430.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/c2/b1/45/c2b14507e3346ef9d72d09d83f54e430.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/736x/c2/b1/45/c2b14507e3346ef9d72d09d83f54e430.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/c2/b1/45/c2b14507e3346ef9d72d09d83f54e430.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/c2/b1/45/c2b14507e3346ef9d72d09d83f54e430.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/c2/b1/45/c2b14507e3346ef9d72d09d83f54e430.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/c2/b1/45/c2b14507e3346ef9d72d09d83f54e430.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/c2/b1/45/c2b14507e3346ef9d72d09d83f54e430.jpg'
    },
    {
        id: 'cozyWood',
        name: '溫暖木屋',
        icon: '🛋️',
        buttonIcon: '🪵',
        preview: 'linear-gradient(135deg, #fff6ea 0%, #f2d8c3 45%, #e8c7a0 100%)',
        color: '#c58a5a',
        category: 'cute',
        backgroundImage: 'https://i.pinimg.com/736x/cf/3f/fd/cf3ffdf44aef4e6600bba86f0f9877f2.jpg',
        investmentCardImage: 'https://i.pinimg.com/736x/cf/3f/fd/cf3ffdf44aef4e6600bba86f0f9877f2.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/cf/3f/fd/cf3ffdf44aef4e6600bba86f0f9877f2.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/736x/cf/3f/fd/cf3ffdf44aef4e6600bba86f0f9877f2.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/cf/3f/fd/cf3ffdf44aef4e6600bba86f0f9877f2.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/cf/3f/fd/cf3ffdf44aef4e6600bba86f0f9877f2.jpg',
        holdingCardImage: 'https://i.pinimg.com/736x/cf/3f/fd/cf3ffdf44aef4e6600bba86f0f9877f2.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/cf/3f/fd/cf3ffdf44aef4e6600bba86f0f9877f2.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/cf/3f/fd/cf3ffdf44aef4e6600bba86f0f9877f2.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/cf/3f/fd/cf3ffdf44aef4e6600bba86f0f9877f2.jpg'
    },
    {
        id: 'oceanWhale',
        name: '海洋鯨魚',
        icon: '🐋',
        buttonIcon: '🐳',
        preview: 'linear-gradient(135deg, #dff5ff 0%, #bfe6ff 35%, #bfb8ff 70%, #f7c1d8 100%)',
        color: '#4aa6e8',
        category: 'cute',
        backgroundImage: 'https://i.pinimg.com/1200x/aa/71/a7/aa71a78307c34e76fb8f3058996ba65e.jpg',
        investmentCardImage: 'https://i.pinimg.com/1200x/aa/71/a7/aa71a78307c34e76fb8f3058996ba65e.jpg',
        accountingCardImage: 'https://i.pinimg.com/1200x/aa/71/a7/aa71a78307c34e76fb8f3058996ba65e.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/1200x/aa/71/a7/aa71a78307c34e76fb8f3058996ba65e.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/1200x/aa/71/a7/aa71a78307c34e76fb8f3058996ba65e.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/1200x/aa/71/a7/aa71a78307c34e76fb8f3058996ba65e.jpg',
        holdingCardImage: 'https://i.pinimg.com/1200x/aa/71/a7/aa71a78307c34e76fb8f3058996ba65e.jpg',
        buyingCardImage: 'https://i.pinimg.com/1200x/aa/71/a7/aa71a78307c34e76fb8f3058996ba65e.jpg',
        sellingCardImage: 'https://i.pinimg.com/1200x/aa/71/a7/aa71a78307c34e76fb8f3058996ba65e.jpg',
        dividendCardImage: 'https://i.pinimg.com/1200x/aa/71/a7/aa71a78307c34e76fb8f3058996ba65e.jpg'
    },
    {
        id: 'capybaraSakuraPond',
        name: '水豚櫻花池',
        icon: '🦫',
        buttonIcon: '🌸',
        preview: 'linear-gradient(135deg, rgba(255, 220, 230, 0.75) 0%, rgba(248, 231, 211, 0.70) 42%, rgba(200, 236, 234, 0.65) 100%)',
        color: '#e889a6',
        category: 'cute',
        backgroundImage: 'https://i.pinimg.com/1200x/b6/98/7f/b6987f6a963ae656eec7bfae5c7d7ba9.jpg',
        investmentCardImage: 'https://i.pinimg.com/1200x/b6/98/7f/b6987f6a963ae656eec7bfae5c7d7ba9.jpg',
        accountingCardImage: 'https://i.pinimg.com/1200x/b6/98/7f/b6987f6a963ae656eec7bfae5c7d7ba9.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/1200x/b6/98/7f/b6987f6a963ae656eec7bfae5c7d7ba9.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/1200x/b6/98/7f/b6987f6a963ae656eec7bfae5c7d7ba9.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/1200x/b6/98/7f/b6987f6a963ae656eec7bfae5c7d7ba9.jpg',
        holdingCardImage: 'https://i.pinimg.com/1200x/b6/98/7f/b6987f6a963ae656eec7bfae5c7d7ba9.jpg',
        buyingCardImage: 'https://i.pinimg.com/1200x/b6/98/7f/b6987f6a963ae656eec7bfae5c7d7ba9.jpg',
        sellingCardImage: 'https://i.pinimg.com/1200x/b6/98/7f/b6987f6a963ae656eec7bfae5c7d7ba9.jpg',
        dividendCardImage: 'https://i.pinimg.com/1200x/b6/98/7f/b6987f6a963ae656eec7bfae5c7d7ba9.jpg'
    },
    {
        id: 'autumnBunny',
        name: '秋日兔兔',
        icon: '🐰',
        buttonIcon: '🍂',
        preview: 'linear-gradient(135deg, rgba(255, 248, 238, 0.96) 0%, rgba(255, 229, 199, 0.92) 45%, rgba(255, 198, 122, 0.9) 100%)',
        color: '#d98b3a',
        category: 'cute',
        backgroundImage: 'https://i.pinimg.com/1200x/1f/b2/c3/1fb2c3bf2f76c698f85bdf7a5c1116b9.jpg',
        investmentCardImage: 'https://i.pinimg.com/1200x/1f/b2/c3/1fb2c3bf2f76c698f85bdf7a5c1116b9.jpg',
        accountingCardImage: 'https://i.pinimg.com/1200x/1f/b2/c3/1fb2c3bf2f76c698f85bdf7a5c1116b9.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/1200x/1f/b2/c3/1fb2c3bf2f76c698f85bdf7a5c1116b9.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/1200x/1f/b2/c3/1fb2c3bf2f76c698f85bdf7a5c1116b9.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/1200x/1f/b2/c3/1fb2c3bf2f76c698f85bdf7a5c1116b9.jpg',
        holdingCardImage: 'https://i.pinimg.com/1200x/1f/b2/c3/1fb2c3bf2f76c698f85bdf7a5c1116b9.jpg',
        buyingCardImage: 'https://i.pinimg.com/1200x/1f/b2/c3/1fb2c3bf2f76c698f85bdf7a5c1116b9.jpg',
        sellingCardImage: 'https://i.pinimg.com/1200x/1f/b2/c3/1fb2c3bf2f76c698f85bdf7a5c1116b9.jpg',
        dividendCardImage: 'https://i.pinimg.com/1200x/1f/b2/c3/1fb2c3bf2f76c698f85bdf7a5c1116b9.jpg'
    },
    {
        id: 'mintBunnyTea',
        name: '薄荷兔奶茶',
        icon: '🐰',
        buttonIcon: '🧋',
        preview: 'linear-gradient(135deg, rgba(223, 245, 244, 0.96) 0%, rgba(200, 236, 234, 0.92) 42%, rgba(255, 238, 216, 0.9) 72%, rgba(255, 213, 170, 0.88) 100%)',
        color: '#4fb8b3',
        category: 'cute',
        backgroundImage: 'https://i.pinimg.com/736x/7b/91/62/7b9162124b29ec7ba01ddf685efbdfc8.jpg',
        investmentCardImage: 'https://i.pinimg.com/736x/7b/91/62/7b9162124b29ec7ba01ddf685efbdfc8.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/7b/91/62/7b9162124b29ec7ba01ddf685efbdfc8.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/736x/7b/91/62/7b9162124b29ec7ba01ddf685efbdfc8.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/7b/91/62/7b9162124b29ec7ba01ddf685efbdfc8.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/7b/91/62/7b9162124b29ec7ba01ddf685efbdfc8.jpg',
        holdingCardImage: 'https://i.pinimg.com/736x/7b/91/62/7b9162124b29ec7ba01ddf685efbdfc8.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/7b/91/62/7b9162124b29ec7ba01ddf685efbdfc8.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/7b/91/62/7b9162124b29ec7ba01ddf685efbdfc8.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/7b/91/62/7b9162124b29ec7ba01ddf685efbdfc8.jpg'
    },
    {
        id: 'goldfishLantern',
        name: '金魚燈籠',
        icon: '🏮',
        buttonIcon: '🐟',
        preview: 'url("https://i.pinimg.com/1200x/7b/8e/5b/7b8e5b7b975562a392bec4e3bca9de64.jpg") center/cover',
        color: '#ff7a1a',
        category: 'fantasy',
        backgroundImage: 'https://i.pinimg.com/1200x/7b/8e/5b/7b8e5b7b975562a392bec4e3bca9de64.jpg',
        investmentCardImage: 'https://i.pinimg.com/1200x/7b/8e/5b/7b8e5b7b975562a392bec4e3bca9de64.jpg',
        accountingCardImage: 'https://i.pinimg.com/1200x/7b/8e/5b/7b8e5b7b975562a392bec4e3bca9de64.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/1200x/7b/8e/5b/7b8e5b7b975562a392bec4e3bca9de64.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/1200x/7b/8e/5b/7b8e5b7b975562a392bec4e3bca9de64.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/1200x/7b/8e/5b/7b8e5b7b975562a392bec4e3bca9de64.jpg',
        holdingCardImage: 'https://i.pinimg.com/1200x/7b/8e/5b/7b8e5b7b975562a392bec4e3bca9de64.jpg',
        buyingCardImage: 'https://i.pinimg.com/1200x/7b/8e/5b/7b8e5b7b975562a392bec4e3bca9de64.jpg',
        sellingCardImage: 'https://i.pinimg.com/1200x/7b/8e/5b/7b8e5b7b975562a392bec4e3bca9de64.jpg',
        dividendCardImage: 'https://i.pinimg.com/1200x/7b/8e/5b/7b8e5b7b975562a392bec4e3bca9de64.jpg'
    },
    {
        id: 'starryOceanPrince',
        name: '星夜王子',
        icon: '🌌',
        buttonIcon: '⭐',
        preview: 'linear-gradient(135deg, #050814 0%, #0b162b 45%, #1a4bb8 100%)',
        color: '#2b6cff',
        category: 'fantasy',
        backgroundImage: 'https://i.pinimg.com/1200x/a5/1c/e4/a51ce4741b9a6ff901bc67d09f9a791c.jpg',
        investmentCardImage: 'https://i.pinimg.com/1200x/a5/1c/e4/a51ce4741b9a6ff901bc67d09f9a791c.jpg',
        accountingCardImage: 'https://i.pinimg.com/1200x/a5/1c/e4/a51ce4741b9a6ff901bc67d09f9a791c.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/1200x/a5/1c/e4/a51ce4741b9a6ff901bc67d09f9a791c.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/1200x/a5/1c/e4/a51ce4741b9a6ff901bc67d09f9a791c.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/1200x/a5/1c/e4/a51ce4741b9a6ff901bc67d09f9a791c.jpg',
        holdingCardImage: 'https://i.pinimg.com/1200x/a5/1c/e4/a51ce4741b9a6ff901bc67d09f9a791c.jpg',
        buyingCardImage: 'https://i.pinimg.com/1200x/a5/1c/e4/a51ce4741b9a6ff901bc67d09f9a791c.jpg',
        sellingCardImage: 'https://i.pinimg.com/1200x/a5/1c/e4/a51ce4741b9a6ff901bc67d09f9a791c.jpg',
        dividendCardImage: 'https://i.pinimg.com/1200x/a5/1c/e4/a51ce4741b9a6ff901bc67d09f9a791c.jpg'
    },
    {
        id: 'lilyCatPond',
        name: '睡蓮喵池',
        icon: '🐈‍⬛',
        buttonIcon: '🌸',
        preview: 'linear-gradient(135deg, rgba(223, 245, 244, 0.96) 0%, rgba(176, 224, 216, 0.92) 45%, rgba(247, 193, 216, 0.88) 100%)',
        color: '#4FB8B3',
        category: 'cute',
        backgroundImage: 'https://i.pinimg.com/736x/23/09/c8/2309c8b8703951c217f99a7ed505e580.jpg',
        investmentCardImage: 'https://i.pinimg.com/736x/23/09/c8/2309c8b8703951c217f99a7ed505e580.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/23/09/c8/2309c8b8703951c217f99a7ed505e580.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/736x/23/09/c8/2309c8b8703951c217f99a7ed505e580.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/23/09/c8/2309c8b8703951c217f99a7ed505e580.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/23/09/c8/2309c8b8703951c217f99a7ed505e580.jpg',
        holdingCardImage: 'https://i.pinimg.com/736x/23/09/c8/2309c8b8703951c217f99a7ed505e580.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/23/09/c8/2309c8b8703951c217f99a7ed505e580.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/23/09/c8/2309c8b8703951c217f99a7ed505e580.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/23/09/c8/2309c8b8703951c217f99a7ed505e580.jpg'
    },
    {
        id: 'blackGoldFrog',
        name: '黑金招財蛙',
        icon: '🐸',
        buttonIcon: '🪙',
        preview: 'url("https://i.pinimg.com/736x/2f/45/4f/2f454fc2eeb4f4df1989181167f3ee53.jpg") center/cover',
        color: '#D4AF37',
        category: 'wealth',
        backgroundImage: 'https://i.pinimg.com/736x/2f/45/4f/2f454fc2eeb4f4df1989181167f3ee53.jpg',
        cssBackground: true,
        investmentCardImage: 'https://i.pinimg.com/736x/2f/45/4f/2f454fc2eeb4f4df1989181167f3ee53.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/2f/45/4f/2f454fc2eeb4f4df1989181167f3ee53.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/736x/2f/45/4f/2f454fc2eeb4f4df1989181167f3ee53.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/2f/45/4f/2f454fc2eeb4f4df1989181167f3ee53.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/2f/45/4f/2f454fc2eeb4f4df1989181167f3ee53.jpg',
        holdingCardImage: 'https://i.pinimg.com/736x/2f/45/4f/2f454fc2eeb4f4df1989181167f3ee53.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/2f/45/4f/2f454fc2eeb4f4df1989181167f3ee53.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/2f/45/4f/2f454fc2eeb4f4df1989181167f3ee53.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/2f/45/4f/2f454fc2eeb4f4df1989181167f3ee53.jpg'
    },
    {
        id: 'luckyCatPink',
        name: '招財貓金幣粉色',
        icon: '🐈',
        buttonIcon: '💸',
        preview: 'linear-gradient(135deg, #FFC5C5 0%, #FFB6C1 45%, #FF99CC 100%)',
        color: '#FF69B4',
        category: 'wealth',
        backgroundImage: 'https://i.pinimg.com/1200x/ec/6a/b3/ec6ab38b73b1d50220475548dbab5853.jpg',
        cssBackground: true,
        investmentCardImage: 'https://i.pinimg.com/1200x/ec/6a/b3/ec6ab38b73b1d50220475548dbab5853.jpg',
        accountingCardImage: 'https://i.pinimg.com/1200x/ec/6a/b3/ec6ab38b73b1d50220475548dbab5853.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/1200x/ec/6a/b3/ec6ab38b73b1d50220475548dbab5853.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/1200x/ec/6a/b3/ec6ab38b73b1d50220475548dbab5853.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/1200x/ec/6a/b3/ec6ab38b73b1d50220475548dbab5853.jpg',
        holdingCardImage: 'https://i.pinimg.com/1200x/ec/6a/b3/ec6ab38b73b1d50220475548dbab5853.jpg',
        buyingCardImage: 'https://i.pinimg.com/1200x/ec/6a/b3/ec6ab38b73b1d50220475548dbab5853.jpg',
        sellingCardImage: 'https://i.pinimg.com/1200x/ec/6a/b3/ec6ab38b73b1d50220475548dbab5853.jpg',
        dividendCardImage: 'https://i.pinimg.com/1200x/ec/6a/b3/ec6ab38b73b1d50220475548dbab5853.jpg'
    },
    {
        id: 'coinCatGold',
        name: '金幣招財喵',
        icon: '🐱',
        buttonIcon: '🪙',
        preview: 'linear-gradient(135deg, rgba(255, 242, 217, 0.96) 0%, rgba(255, 208, 140, 0.9) 45%, rgba(201, 122, 58, 0.86) 100%)',
        color: '#D4AF37',
        category: 'wealth',
        backgroundImage: 'https://i.pinimg.com/736x/28/20/3b/28203b8793e1c88974581f3f6c5c03c5.jpg',
        cssBackground: true,
        investmentCardImage: 'https://i.pinimg.com/736x/28/20/3b/28203b8793e1c88974581f3f6c5c03c5.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/28/20/3b/28203b8793e1c88974581f3f6c5c03c5.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/736x/28/20/3b/28203b8793e1c88974581f3f6c5c03c5.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/28/20/3b/28203b8793e1c88974581f3f6c5c03c5.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/28/20/3b/28203b8793e1c88974581f3f6c5c03c5.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/28/20/3b/28203b8793e1c88974581f3f6c5c03c5.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/28/20/3b/28203b8793e1c88974581f3f6c5c03c5.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/28/20/3b/28203b8793e1c88974581f3f6c5c03c5.jpg'
    },
    {
        id: 'crimsonIvory',
        name: '紅金象牙',
        icon: '🩸',
        buttonIcon: '🥀',
        preview: 'url("https://i.pinimg.com/1200x/90/cf/2f/90cf2f9508f557620d7da4bac4fdd6fd.jpg") center/cover',
        color: '#c7353f',
        category: 'fantasy',
        backgroundImage: 'https://i.pinimg.com/1200x/90/cf/2f/90cf2f9508f557620d7da4bac4fdd6fd.jpg',
        cssBackground: true,
        investmentCardImage: 'https://i.pinimg.com/1200x/90/cf/2f/90cf2f9508f557620d7da4bac4fdd6fd.jpg',
        accountingCardImage: 'https://i.pinimg.com/1200x/90/cf/2f/90cf2f9508f557620d7da4bac4fdd6fd.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/1200x/90/cf/2f/90cf2f9508f557620d7da4bac4fdd6fd.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/1200x/90/cf/2f/90cf2f9508f557620d7da4bac4fdd6fd.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/1200x/90/cf/2f/90cf2f9508f557620d7da4bac4fdd6fd.jpg',
        holdingCardImage: 'https://i.pinimg.com/1200x/90/cf/2f/90cf2f9508f557620d7da4bac4fdd6fd.jpg',
        buyingCardImage: 'https://i.pinimg.com/1200x/90/cf/2f/90cf2f9508f557620d7da4bac4fdd6fd.jpg',
        sellingCardImage: 'https://i.pinimg.com/1200x/90/cf/2f/90cf2f9508f557620d7da4bac4fdd6fd.jpg',
        dividendCardImage: 'https://i.pinimg.com/1200x/90/cf/2f/90cf2f9508f557620d7da4bac4fdd6fd.jpg'
    },
    {
        id: 'blueBunnyFlower',
        name: '藍花兔兔',
        icon: '🐰',
        buttonIcon: '🩵',
        preview: 'linear-gradient(135deg, rgba(239, 246, 255, 0.96) 0%, rgba(206, 228, 255, 0.9) 45%, rgba(255, 245, 230, 0.85) 100%)',
        color: '#5a86c8',
        category: 'cute',
        cssBackground: true,
        backgroundImage: 'https://i.pinimg.com/736x/57/e8/74/57e874b367bec0044835bee700c85c9f.jpg',
        investmentCardImage: 'https://i.pinimg.com/736x/57/e8/74/57e874b367bec0044835bee700c85c9f.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/57/e8/74/57e874b367bec0044835bee700c85c9f.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/736x/57/e8/74/57e874b367bec0044835bee700c85c9f.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/57/e8/74/57e874b367bec0044835bee700c85c9f.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/57/e8/74/57e874b367bec0044835bee700c85c9f.jpg',
        holdingCardImage: 'https://i.pinimg.com/736x/57/e8/74/57e874b367bec0044835bee700c85c9f.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/57/e8/74/57e874b367bec0044835bee700c85c9f.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/57/e8/74/57e874b367bec0044835bee700c85c9f.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/57/e8/74/57e874b367bec0044835bee700c85c9f.jpg'
    }
];

const themeCategories = {
    cosmic: {
        name: '宇宙星空',
        icon: '🌌',
        description: '星空、極光等宇宙主題'
    },
    dark: {
        name: '深色主題',
        icon: '🌙',
        description: '深色護眼主題'
    },
    anime: {
        name: '動漫風格',
        icon: '🎌',
        description: '吉卜力、鬼滅等動漫主題'
    },
    wealth: {
        name: '財富金錢',
        icon: '💰',
        description: '金錢、財富相關主題'
    },
    cute: {
        name: '可愛風格',
        icon: '🐾',
        description: '可愛、萌系主題',
        animation: 'cuteAnimation'
    },
    fantasy: {
        name: '奇幻風格',
        icon: '🗡️',
        description: '騎士、奇幻主題',
        animation: 'fantasyAnimation'
    },
    dynamic: {
        name: '動態背景',
        icon: '🎬',
        description: '影片動態背景主題',
        animation: 'dynamicAnimation'
    },
    celebration: {
        name: '節日慶典',
        icon: '🎊',
        description: '節日、慶典、派對主題'
    }
};

const themeAnimations = {};

const themeVideoController = (() => {
    let moneyVideoEl = null;
    let spaceVideoEl = null;
    let shinchanPoolVideoEl = null;
    let nightglowSeasonsVideoEl = null;
    let containerEl = null;

    const ensureElements = () => {
        if (!moneyVideoEl) {
            moneyVideoEl = document.getElementById('moneyThemeVideo');
        }
        if (!spaceVideoEl) {
            spaceVideoEl = document.getElementById('spaceThemeVideo');
        }
        if (!shinchanPoolVideoEl) {
            shinchanPoolVideoEl = document.getElementById('shinchanPoolThemeVideo');
        }
        if (!nightglowSeasonsVideoEl) {
            nightglowSeasonsVideoEl = document.getElementById('nightglowSeasonsThemeVideo');
        }
        if (!containerEl) {
            containerEl = document.querySelector('.theme-video-background');
        }
        return (moneyVideoEl && spaceVideoEl && shinchanPoolVideoEl && nightglowSeasonsVideoEl && containerEl) || 
               (moneyVideoEl && spaceVideoEl && containerEl);
    };

    const setActive = (themeId) => {
        if (!ensureElements()) return;
        
        // Pause all videos
        if (moneyVideoEl) moneyVideoEl.pause();
        if (spaceVideoEl) spaceVideoEl.pause();
        if (shinchanPoolVideoEl) shinchanPoolVideoEl.pause();
        if (nightglowSeasonsVideoEl) nightglowSeasonsVideoEl.pause();

        const isActive = themeId === 'money' || themeId === 'space' || themeId === 'shinchanPool' || themeId === 'nightglowSeasons';
        containerEl.classList.toggle('active', isActive);

        if (isActive) {
            let activeVideo = null;
            
            // Hide all videos first
            if (moneyVideoEl) moneyVideoEl.style.display = 'none';
            if (spaceVideoEl) spaceVideoEl.style.display = 'none';
            if (shinchanPoolVideoEl) shinchanPoolVideoEl.style.display = 'none';
            if (nightglowSeasonsVideoEl) nightglowSeasonsVideoEl.style.display = 'none';
            
            if (themeId === 'money') {
                activeVideo = moneyVideoEl;
                if (moneyVideoEl) moneyVideoEl.style.display = 'block';
            } else if (themeId === 'space') {
                activeVideo = spaceVideoEl;
                if (spaceVideoEl) spaceVideoEl.style.display = 'block';
            } else if (themeId === 'shinchanPool') {
                activeVideo = shinchanPoolVideoEl;
                if (shinchanPoolVideoEl) shinchanPoolVideoEl.style.display = 'block';
            } else if (themeId === 'nightglowSeasons') {
                activeVideo = nightglowSeasonsVideoEl;
                if (nightglowSeasonsVideoEl) nightglowSeasonsVideoEl.style.display = 'block';
            }

            if (activeVideo) {
                activeVideo.currentTime = 0;
                const playPromise = activeVideo.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {});
                }
            }
        } else {
            // Hide all videos when inactive
            if (moneyVideoEl) moneyVideoEl.style.display = 'none';
            if (spaceVideoEl) spaceVideoEl.style.display = 'none';
            if (shinchanPoolVideoEl) shinchanPoolVideoEl.style.display = 'none';
            if (nightglowSeasonsVideoEl) nightglowSeasonsVideoEl.style.display = 'none';
        }
    };

    return { setActive };
})();

function getCurrentTheme() {
    // 優先使用 selectedTheme，如果沒有則使用舊的 theme 鍵值以保持向後兼容
    return localStorage.getItem('selectedTheme') || localStorage.getItem('theme') || 'blue';
}

function applyTheme(themeId) {
    const root = document.documentElement;
    root.setAttribute('data-theme', themeId);
    localStorage.setItem('selectedTheme', themeId);
    localStorage.setItem('theme', themeId); // 保持向後兼容
    root.style.removeProperty('--bg-white');
    
    // 自動應用主題背景圖片
    const theme = themes.find(t => t.id === themeId);
    if (theme && theme.backgroundImage && !theme.cssBackground) {
        applyThemeBackgroundImage(theme.backgroundImage);
    } else {
        // 如果主題沒有背景圖片，清除背景
        document.body.style.backgroundImage = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundRepeat = '';
    }
    
    // 應用卡片背景圖片
    applyThemeCardImages(theme);
    
    updateThemeButtons(themeId);
    themeVideoController.setActive(themeId);

    const pageChart = document.getElementById('pageChart');
    if (pageChart && pageChart.style.display !== 'none') {
        if (typeof updateAllCharts === 'function') {
            updateAllCharts();
        }
    }
}

function applyThemeCardImages(theme) {
    if (!theme) return;
    
    // 應用其他卡片背景圖片（不包括預算設定頁面）
    const cardMappings = [
        { selector: '.investment-card', image: theme.investmentCardImage },
        { selector: '.accounting-card', image: theme.accountingCardImage },
        { selector: '.wallet-budget-card', image: theme.walletBudgetCardImage },
        { selector: '.monthly-planning-card', image: theme.monthlyPlanningCardImage },
        { selector: '.investment-settings-card', image: theme.investmentSettingsCardImage },
        { selector: '.holding-card', image: theme.holdingCardImage },
        { selector: '.buying-card', image: theme.buyingCardImage },
        { selector: '.selling-card', image: theme.sellingCardImage },
        { selector: '.dividend-card', image: theme.dividendCardImage }
    ];
    
    cardMappings.forEach(mapping => {
        if (mapping.image) {
            applyCardBackgroundImage(mapping.selector, mapping.image);
        }
    });
}

function applyCardBackgroundImage(selector, imageUrl) {
    if (!imageUrl) return;
    
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        // 檢查圖片是否可以載入
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            // 圖片載入成功，應用背景
            element.style.backgroundImage = `url(${imageUrl})`;
            element.style.backgroundSize = 'cover';
            element.style.backgroundPosition = 'center';
            element.style.backgroundRepeat = 'no-repeat';
            console.log(`✅ 卡片背景圖片載入成功: ${selector} - ${imageUrl}`);
        };
        
        img.onerror = function() {
            // 圖片載入失敗，清除背景
            element.style.backgroundImage = '';
            element.style.backgroundSize = '';
            element.style.backgroundPosition = '';
            element.style.backgroundRepeat = '';
            console.warn(`⚠️ 卡片背景圖片載入失敗: ${selector} - ${imageUrl}`);
        };
        
        // 開始載入圖片
        img.src = imageUrl;
    });
}

function applyThemeBackgroundImage(imageUrl) {
    if (!imageUrl) return;
    
    // 檢查圖片是否可以載入
    const img = new Image();
    img.onload = function() {
        // 圖片載入成功，應用背景
        document.body.style.backgroundImage = `url(${imageUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';
        
        // 可選：添加載入成功的視覺反饋
        console.log(`✅ 主題背景圖片載入成功: ${imageUrl}`);
    };
    
    img.onerror = function() {
        // 圖片載入失敗，清除背景
        document.body.style.backgroundImage = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundRepeat = '';
        
        console.warn(`⚠️ 主題背景圖片載入失敗: ${imageUrl}`);
    };
    
    // 開始載入圖片
    img.src = imageUrl;
}

function updateThemeButtons(themeId) {
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
            navWallet: '💶',
            navInvestment: '💹',
            navChart: '📉',
            navSettings: '🎛️'
        },
        purple: {
            fab: '🖊️',
            navLedger: '📕',
            navWallet: '💸',
            navInvestment: '💹',
            navChart: '📉',
            navSettings: '🎛️'
        },
        orange: {
            fab: '✎',
            navLedger: '📓',
            navWallet: '💳',
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
        autumnBunny: {
            fab: '🐰',
            navLedger: '📖',
            navWallet: '🧺',
            navInvestment: '📈',
            navChart: '📊',
            navSettings: '⚙️'
        },
        mintBunnyTea: {
            fab: '🐰',
            navLedger: '📖',
            navWallet: '🧋',
            navInvestment: '📈',
            navChart: '📊',
            navSettings: '⚙️'
        },
        blueBunnyFlower: {
            fab: '🐰',
            navLedger: '📖',
            navWallet: '🩵',
            navInvestment: '📈',
            navChart: '📊',
            navSettings: '⚙️'
        },
        starryOceanPrince: {
            fab: '⭐',
            navLedger: '🌌',
            navWallet: '🐟',
            navInvestment: '📈',
            navChart: '📊',
            navSettings: '⚙️'
        },
        goldfishLantern: {
            fab: '🏮',
            navLedger: '📖',
            navWallet: '🪙',
            navInvestment: '🐟',
            navChart: '📊',
            navSettings: '⚙️'
        },
        indigo: {
            fab: '💙',
            navLedger: '📘',
            navWallet: '�',
            navInvestment: '�',
            navChart: '�',
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
        capybaraSakuraPond: {
            fab: '🌸',
            navLedger: '📖',
            navWallet: '🪙',
            navInvestment: '📈',
            navChart: '📊',
            navSettings: '⚙️'
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
        cute: {
            fab: '🐾',
            navLedger: '🐾',
            navWallet: '💰',
            navInvestment: '📈',
            navChart: '📊',
            navSettings: '⚙️'
        },
        
        coinCatGold: {
            fab: '🪙',
            navLedger: '📒',
            navWallet: '👛',
            navInvestment: '📈',
            navChart: '📊',
            navSettings: '⚙️'
        },
        hardworkMoney: {
            fab: '💸',
            navLedger: '📘',
            navWallet: '👛',
            navInvestment: '📈',
            navChart: '📊',
            navSettings: '⚙️'
        },
        
        jellyParty: {
            fab: '🍬',
            navLedger: '🧾',
            navWallet: '👛',
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
        mori: {
            fab: '🍃',
            navLedger: '📗',
            navWallet: '🍀',
            navInvestment: '📈',
            navChart: '📊',
            navSettings: '🌿'
        },
        littlePrince: {
            fab: '👑',
            navLedger: '📖',
            navWallet: '🌟',
            navInvestment: '📈',
            navChart: '✨',
            navSettings: '⚙️'
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
        
        spacegold: {
            fab: '🚀',
            navLedger: '🪐',
            navWallet: '✨',
            navInvestment: '💫',
            navChart: '🌟',
            navSettings: '🚀'
        },
        blackGoldFrog: {
            fab: '🐸',
            navLedger: '🪙',
            navWallet: '💰',
            navInvestment: '📈',
            navChart: '📊',
            navSettings: '⚙️'
        },
        attractGold: {
            fab: '🧧',
            navLedger: '📖',
            navWallet: '🪙',
            navInvestment: '📈',
            navChart: '📊',
            navSettings: '⚙️'
        },
        getrich: {
            fab: '🧧',
            navLedger: '🐱',
            navWallet: '💰',
            navInvestment: '📈',
            navChart: '🎯',
            navSettings: '🎊'
        },
        festive: {
            fab: '🎉',
            navLedger: '🎊',
            navWallet: '💰',
            navInvestment: '🎈',
            navChart: '🎆',
            navSettings: '🎇'
        },
        whimsicalStarry: {
            fab: '🌟',
            navLedger: '✨',
            navWallet: '💫',
            navInvestment: '🌌',
            navChart: '🔭',
            navSettings: '🌠'
        },
        shinchanPool: {
            fab: '🏊',
            navLedger: '🦆',
            navWallet: '💧',
            navInvestment: '🌊',
            navChart: '🏖️',
            navSettings: '⛱️'
        },
        dreamyGalaxy: {
            fab: '🌌',
            navLedger: '✨',
            navWallet: '💫',
            navInvestment: '🌟',
            navChart: '🔭',
            navSettings: '🌠'
        },
        dreamyRealm: {
            fab: '🌸',
            navLedger: '✨',
            navWallet: '💖',
            navInvestment: '🌈',
            navChart: '🦋',
            navSettings: '🎨'
        },
        crimsonIvory: {
            fab: '🥀',
            navLedger: '📜',
            navWallet: '👛',
            navInvestment: '📈',
            navChart: '📊',
            navSettings: '⚙️'
        }
    };

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

    const setButtonImgIcon = (btn, src) => {
        btn.innerHTML = `<img src="${src}" alt="icon" class="ui-icon-img" style="width: 28px; height: 28px; object-fit: contain;" />`;
    };

    const icons = buttonIcons[themeId] || buttonIcons.pink;
    const iconAssets = themeId === 'cute' ? iconAssetsCute : null;

    const fabBtn = document.getElementById('fabBtn');
    if (fabBtn) {
        if (themeId === 'cute') {
            setButtonImgIcon(fabBtn, iconAssetsCute.fab);
        } else {
            fabBtn.textContent = icons.fab;
        }
    }

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const page = item.dataset.page;
        const navIcon = item.querySelector('.nav-icon');
        if (navIcon) {
            if (navIcon.tagName === 'IMG') {
                const src = iconAssets && iconAssets.nav && iconAssets.nav[page];
                if (src) {
                    navIcon.src = src;
                }
            } else {
                switch(page) {
                    case 'ledger':
                        navIcon.textContent = icons.navLedger;
                        break;
                    case 'wallet':
                        navIcon.textContent = icons.navWallet;
                        break;
                    case 'investment':
                        navIcon.textContent = icons.navInvestment;
                        break;
                    case 'chart':
                        navIcon.textContent = icons.navChart;
                        break;
                    case 'settings':
                        navIcon.textContent = icons.navSettings;
                        break;
                }
            }
        }
    });

    restoreButtonIcons();
}

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

function restoreButtonIcons() {
    document.querySelectorAll('[data-original-icon]').forEach(btn => {
        const originalIcon = btn.dataset.originalIcon;
        if (originalIcon) {
            if (btn.classList.contains('quick-note-btn')) {
                btn.innerHTML = originalIcon;
            } else {
                btn.textContent = originalIcon;
            }
            btn.removeAttribute('data-original-icon');
        }
    });

    const quickNoteButtons = document.querySelectorAll('.quick-note-btn');
    quickNoteButtons.forEach(btn => {
        const note = btn.dataset.note;
        if (note && originalButtonIcons.quickNotes[note]) {
            btn.innerHTML = `${originalButtonIcons.quickNotes[note]} ${note}`;
        }
    });

    const accountBtn = document.querySelector('.account-btn');
    if (accountBtn && !accountBtn.dataset.originalIcon) {
        accountBtn.textContent = originalButtonIcons.accountBtn;
    }

    const emojiBtn = document.querySelector('.emoji-btn');
    if (emojiBtn && !emojiBtn.dataset.originalIcon) {
        emojiBtn.textContent = originalButtonIcons.emojiBtn;
    }

    const memberBtn = document.getElementById('memberBtn');
    if (memberBtn && !memberBtn.dataset.originalIcon) {
        memberBtn.textContent = originalButtonIcons.memberBtn;
    }

    const imageBtn = document.getElementById('imageBtn');
    if (imageBtn && !imageBtn.dataset.originalIcon) {
        imageBtn.textContent = originalButtonIcons.imageBtn;
    }

    const checkBtn = document.getElementById('saveBtn');
    if (checkBtn && !checkBtn.dataset.originalIcon) {
        checkBtn.textContent = originalButtonIcons.checkBtn;
    }

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn && !searchBtn.dataset.originalIcon) {
        searchBtn.textContent = originalButtonIcons.searchBtn;
    }

    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn && !addCategoryBtn.dataset.originalIcon) {
        addCategoryBtn.textContent = originalButtonIcons.addCategoryBtn;
    }

    const equalBtnRestore = document.querySelector('.key-btn.equal');
    if (equalBtnRestore && equalBtnRestore.dataset.key === '=' && !equalBtnRestore.dataset.originalIcon) {
        equalBtnRestore.textContent = '=';
    }
}

function getCustomTheme() {
    return JSON.parse(localStorage.getItem('customTheme') || '{}');
}

function saveCustomTheme(theme) {
    localStorage.setItem('customTheme', JSON.stringify(theme));
}

function applyCustomTheme() {
    const customTheme = getCustomTheme();
    const root = document.documentElement;

    if (!customTheme || Object.keys(customTheme).length === 0) {
        root.style.removeProperty('--color-primary');
        root.style.removeProperty('--color-primary-light');
        root.style.removeProperty('--color-primary-lighter');
        root.style.removeProperty('--color-primary-dark');
        root.style.removeProperty('--border-primary');
        root.style.removeProperty('--bg-white');
        root.style.removeProperty('--bg-primary');
        document.body.style.background = '';
        document.body.style.backgroundImage = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundRepeat = '';
        return;
    }

    if (customTheme.primaryColor) {
        root.style.setProperty('--color-primary', customTheme.primaryColor);
        root.style.setProperty('--border-primary', customTheme.primaryColor);

        const hex = customTheme.primaryColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const lightR = Math.min(255, Math.floor(r + (255 - r) * 0.3));
        const lightG = Math.min(255, Math.floor(g + (255 - g) * 0.3));
        const lightB = Math.min(255, Math.floor(b + (255 - b) * 0.3));
        root.style.setProperty('--color-primary-light', `rgb(${lightR}, ${lightG}, ${lightB})`);

        const lighterR = Math.min(255, Math.floor(r + (255 - r) * 0.5));
        const lighterG = Math.min(255, Math.floor(g + (255 - g) * 0.5));
        const lighterB = Math.min(255, Math.floor(b + (255 - b) * 0.5));
        root.style.setProperty('--color-primary-lighter', `rgb(${lighterR}, ${lighterG}, ${lighterB})`);

        const darkR = Math.max(0, Math.floor(r * 0.8));
        const darkG = Math.max(0, Math.floor(g * 0.8));
        const darkB = Math.max(0, Math.floor(b * 0.8));
        root.style.setProperty('--color-primary-dark', `rgb(${darkR}, ${darkG}, ${darkB})`);
    }

    if (customTheme.buttonColor) {
        root.style.setProperty('--color-primary', customTheme.buttonColor);
    }

    const effectivePrimaryColor = customTheme.buttonColor || customTheme.primaryColor;
    if (effectivePrimaryColor) {
        const parseRgb = (color) => {
            const c = String(color || '').trim();
            if (/^#?[0-9a-fA-F]{6}$/.test(c)) {
                const hex = c.replace('#', '');
                return {
                    r: parseInt(hex.slice(0, 2), 16),
                    g: parseInt(hex.slice(2, 4), 16),
                    b: parseInt(hex.slice(4, 6), 16)
                };
            }
            const m = c.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
            if (m) {
                return {
                    r: Math.min(255, Math.max(0, parseInt(m[1], 10))),
                    g: Math.min(255, Math.max(0, parseInt(m[2], 10))),
                    b: Math.min(255, Math.max(0, parseInt(m[3], 10)))
                };
            }
            return null;
        };

        const base = parseRgb(effectivePrimaryColor);
        if (base) {
            const { r, g, b } = base;

            root.style.setProperty('--color-primary', effectivePrimaryColor);
            root.style.setProperty('--border-primary', effectivePrimaryColor);

            const lightR = Math.min(255, Math.floor(r + (255 - r) * 0.3));
            const lightG = Math.min(255, Math.floor(g + (255 - g) * 0.3));
            const lightB = Math.min(255, Math.floor(b + (255 - b) * 0.3));
            root.style.setProperty('--color-primary-light', `rgb(${lightR}, ${lightG}, ${lightB})`);

            const lighterR = Math.min(255, Math.floor(r + (255 - r) * 0.5));
            const lighterG = Math.min(255, Math.floor(g + (255 - g) * 0.5));
            const lighterB = Math.min(255, Math.floor(b + (255 - b) * 0.5));
            root.style.setProperty('--color-primary-lighter', `rgb(${lighterR}, ${lighterG}, ${lighterB})`);

            const darkR = Math.max(0, Math.floor(r * 0.8));
            const darkG = Math.max(0, Math.floor(g * 0.8));
            const darkB = Math.max(0, Math.floor(b * 0.8));
            root.style.setProperty('--color-primary-dark', `rgb(${darkR}, ${darkG}, ${darkB})`);

            const setAlpha = (suffix, alpha) => {
                root.style.setProperty(`--color-primary-rgba-${suffix}`, `rgba(${r}, ${g}, ${b}, ${alpha})`);
            };
            setAlpha('08', '0.08');
            setAlpha('10', '0.1');
            setAlpha('12', '0.12');
            setAlpha('15', '0.15');
            setAlpha('18', '0.18');
            setAlpha('20', '0.2');
            setAlpha('25', '0.25');
            setAlpha('30', '0.3');

            const setLightAlpha = (suffix, alpha) => {
                root.style.setProperty(`--color-primary-light-rgba-${suffix}`, `rgba(${lightR}, ${lightG}, ${lightB}, ${alpha})`);
            };
            setLightAlpha('08', '0.08');
            setLightAlpha('10', '0.1');
            setLightAlpha('15', '0.15');
            setLightAlpha('20', '0.2');
            setLightAlpha('25', '0.25');
        }
    }

    if (customTheme.boxColor) {
        root.style.setProperty('--bg-white', customTheme.boxColor);
    }

    if (customTheme.backgroundColor) {
        root.style.setProperty('--bg-primary', customTheme.backgroundColor);
        if (!customTheme.backgroundColor.includes('gradient')) {
            document.body.style.background = customTheme.backgroundColor;
        } else {
            document.body.style.background = customTheme.backgroundColor;
        }
    }

    if (customTheme.backgroundImage) {
        document.body.style.backgroundImage = `url(${customTheme.backgroundImage})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
    } else {
        document.body.style.backgroundImage = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundRepeat = '';
    }
}

function showThemeNotification(theme) {
    if (!theme) return;
    
    const notification = document.createElement('div');
    notification.className = 'theme-notification';
    notification.innerHTML = `
        <div class="theme-notification-content">
            <div class="theme-notification-icon">${theme.icon || '🎨'}</div>
            <div class="theme-notification-text">
                <div class="theme-notification-title">主題已切換</div>
                <div class="theme-notification-name">${theme.name}</div>
            </div>
            <div class="theme-notification-close">✕</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 添加關閉事件
    const closeBtn = notification.querySelector('.theme-notification-close');
    closeBtn.addEventListener('click', () => {
        removeNotification();
    });
    
    // 自動移除
    const removeNotification = () => {
        notification.classList.add('theme-notification--fadeout');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    };
    
    // 3秒後自動移除
    setTimeout(removeNotification, 3000);
    
    // 點擊外部關閉
    notification.addEventListener('click', (e) => {
        if (e.target === notification) {
            removeNotification();
        }
    });
}

function showThemeSelector() {
    const modal = document.createElement('div');
    modal.className = 'theme-select-modal';

    const currentTheme = getCurrentTheme();
    const customTheme = getCustomTheme();

    modal.innerHTML = `
        <div class="theme-custom-content modal-content-standard">
            <div class="theme-modal-header">
                <div class="theme-modal-title">🎨 主題</div>
                <button class="theme-close-btn" type="button" aria-label="Close">✕</button>
            </div>

            <div class="theme-section">
                <div class="theme-section-title">主題分類</div>
                <div class="theme-toolbar">
                    <input id="themeSearchInput" class="theme-search-input" type="text" placeholder="搜尋主題..." autocomplete="off" />
                    <div id="categoryTabs" class="theme-category-tabs"></div>
                </div>
                <div id="themeGrid" class="theme-grid theme-grid--categorized"></div>
            </div>

            <div class="theme-section theme-section--divider">
                <div class="theme-section-title">背景圖片</div>
                <input type="file" id="backgroundImageInput" accept="image/*" style="display: none;">
                <button id="uploadImageBtn" class="theme-primary-btn" type="button">📷 上傳背景圖片</button>
                ${customTheme.backgroundImage ? `
                    <div id="imagePreviewContainer" class="theme-image-preview">
                        <img src="${customTheme.backgroundImage}" alt="背景預覽" class="theme-image-preview-img">
                        <button id="removeImageBtn" class="theme-image-remove-btn" type="button">✕</button>
                    </div>
                ` : '<div id="imagePreviewContainer"></div>'}
            </div>

            <div class="theme-actions">
                <button id="resetThemeBtn" class="theme-secondary-btn" type="button">重置</button>
                <button id="saveThemeBtn" class="theme-primary-btn" type="button">儲存設定</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const initCategoryTabs = () => {
        const categoryTabs = document.getElementById('categoryTabs');
        if (!categoryTabs) return;

        let tabsHTML = `
            <button class="category-tab active" data-category="all">
                <span class="category-tab-icon">🎨</span>
                <span class="category-tab-name">全部</span>
                <span class="category-tab-count">${themes.length}</span>
            </button>
        `;

        Object.entries(themeCategories).forEach(([categoryId, categoryInfo]) => {
            const categoryThemes = themes.filter(t => t.category === categoryId);
            if (categoryThemes.length > 0) {
                tabsHTML += `
                    <button class="category-tab" data-category="${categoryId}">
                        <span class="category-tab-icon">${categoryInfo.icon}</span>
                        <span class="category-tab-name">${categoryInfo.name}</span>
                        <span class="category-tab-count">${categoryThemes.length}</span>
                    </button>
                `;
            }
        });

        categoryTabs.innerHTML = tabsHTML;

        categoryTabs.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                categoryTabs.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderThemeGrid('', tab.dataset.category);
            });
        });
    };

    const renderThemeGrid = (query = '', selectedCategory = 'all') => {
        const q = (query || '').trim().toLowerCase();
        const grid = document.getElementById('themeGrid');
        if (!grid) return;

        let list = themes.filter(t => {
            if (!q) return true;
            return (t.name || '').toLowerCase().includes(q) || (t.id || '').toLowerCase().includes(q);
        });

        if (selectedCategory !== 'all') {
            list = list.filter(t => t.category === selectedCategory);
        }

        const groupedThemes = {};
        list.forEach(theme => {
            const category = theme.category || 'basic';
            if (!groupedThemes[category]) {
                groupedThemes[category] = [];
            }
            groupedThemes[category].push(theme);
        });

        let gridHTML = '';
        
        Object.entries(groupedThemes).forEach(([categoryId, categoryThemes]) => {
            const categoryInfo = themeCategories[categoryId] || { name: '其他', icon: '📁', description: '' };
            
            gridHTML += `
                <div class="theme-category-section">
                    <div class="theme-category-header">
                        <span class="theme-category-icon">${categoryInfo.icon}</span>
                        <span class="theme-category-name">${categoryInfo.name}</span>
                        <span class="theme-category-description">${categoryInfo.description}</span>
                    </div>
                    <div class="theme-category-grid">
                        ${categoryThemes.map(theme => {
                            const isSelected = theme.id === currentTheme && !customTheme.primaryColor;
                            const hasBackgroundImage = theme.backgroundImage;
                            return `
                                <div class="theme-item ${isSelected ? 'selected' : ''}" data-theme-id="${theme.id}">
                                    <div class="theme-item-preview ${hasBackgroundImage ? 'theme-item-preview--image' : ''}" ${hasBackgroundImage ? `style="background-image: url('${theme.backgroundImage}');"` : `style="background: ${theme.preview};"`}></div>
                                    <div class="theme-item-content theme-item-content--compact">
                                        <div class="theme-item-icon">${theme.icon}</div>
                                        <div class="theme-item-name">${theme.name}</div>
                                        ${isSelected ? '<div class="theme-item-check">✓</div>' : '<div class="theme-item-check theme-item-check--placeholder"></div>'}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });

        grid.innerHTML = gridHTML;

        grid.querySelectorAll('.theme-item').forEach(item => {
            item.addEventListener('click', () => {
                const themeId = item.dataset.themeId;
                const theme = themes.find(t => t.id === themeId);

                if (!theme) return;

                saveCustomTheme({});
                applyTheme(themeId);

                grid.querySelectorAll('.theme-item').forEach(t => t.classList.remove('selected'));
                item.classList.add('selected');

                setTimeout(() => {
                    if (document.body.contains(modal)) {
                        document.body.removeChild(modal);
                    }
                    showThemeNotification(theme);
                }, 300);
            });
        });
    };

    initCategoryTabs();
    renderThemeGrid('');

    const themeSearchInput = document.getElementById('themeSearchInput');
    if (themeSearchInput) {
        themeSearchInput.addEventListener('input', (e) => {
            const activeTab = document.querySelector('.category-tab.active');
            const selectedCategory = activeTab ? activeTab.dataset.category : 'all';
            renderThemeGrid(e.target.value, selectedCategory);
        });
    }

    const uploadBtn = document.getElementById('uploadImageBtn');
    const imageInput = document.getElementById('backgroundImageInput');
    const removeImageBtn = document.getElementById('removeImageBtn');

    if (uploadBtn && imageInput) {
        uploadBtn.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageUrl = event.target.result;
                    const previewContainer = document.getElementById('imagePreviewContainer');
                    previewContainer.innerHTML = `
                        <img src="${imageUrl}" alt="背景預覽" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;">
                        <button id="removeImageBtn" style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 18px;">✕</button>
                    `;
                    previewContainer.style.position = 'relative';
                    previewContainer.style.marginTop = '12px';

                    const newRemoveBtn = document.getElementById('removeImageBtn');
                    if (newRemoveBtn) {
                        newRemoveBtn.addEventListener('click', () => {
                            imageInput.value = '';
                            previewContainer.innerHTML = '';
                            previewContainer.style.marginTop = '0';
                        });
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            imageInput.value = '';
            const previewContainer = document.getElementById('imagePreviewContainer');
            previewContainer.innerHTML = '';
            previewContainer.style.marginTop = '0';
        });
    }

    const saveBtn = document.getElementById('saveThemeBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            playClickSound();
            const theme = {};

            const imagePreview = document.querySelector('#imagePreviewContainer img');
            if (imagePreview) {
                theme.backgroundImage = imagePreview.src;
            }

            saveCustomTheme(theme);
            applyCustomTheme();

            if (typeof updateAllCharts === 'function') {
                updateAllCharts();
            }

            alert('主題設定已儲存！');
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        });
    }

    const resetBtn = document.getElementById('resetThemeBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('確定要重置所有自訂設定嗎？')) {
                saveCustomTheme({});
                applyTheme('blue');
                applyCustomTheme();
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
                showThemeSelector();
            }
        });
    }

    const closeBtn = modal.querySelector('.theme-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }
    });
}

function initTheme() {
    const savedTheme = getCurrentTheme();

    const savedThemeExists = themes.some(t => t.id === savedTheme);
    const effectiveTheme = savedThemeExists ? savedTheme : 'blue';
    applyTheme(effectiveTheme);
    applyCustomTheme();
    const customTheme = getCustomTheme();
    if (customTheme.backgroundImage) {
        document.body.style.backgroundImage = `url(${customTheme.backgroundImage})`;
    }
    setTimeout(() => {
        updateThemeButtons(effectiveTheme);
    }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
});