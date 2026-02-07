// ========== 主題定義模組 ==========

// 主題數據定義
var themes = window.AppThemes || (window.AppThemes = [
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
        icon: '🌿',
        buttonIcon: '🌱',
        preview: 'linear-gradient(135deg, #c6efce 0%, #e5f8e8 100%)',
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
        preview: 'linear-gradient(135deg, #e0f7fa 0%, #e1f5fe 100%)',
        color: '#00bcd4',
        category: 'basic'
    },
    {
        id: 'star',
        name: '星空主題',
        icon: '⭐',
        buttonIcon: '🌟',
        preview: 'linear-gradient(135deg, #1a237e 0%, #3949ab 50%, #5e35b1 100%)',
        color: '#3949ab',
        category: 'cosmic'
    },
    {
        id: 'red',
        name: '紅色主題',
        icon: '❤️',
        buttonIcon: '❤️',
        preview: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
        color: '#f44336',
        category: 'basic'
    },
    {
        id: 'yellow',
        name: '黃色主題',
        icon: '💛',
        buttonIcon: '💛',
        preview: 'linear-gradient(135deg, #fffde7 0%, #fff9c4 100%)',
        color: '#ffeb3b',
        category: 'basic'
    },
    {
        id: 'indigo',
        name: '靛藍主題',
        icon: '💙',
        buttonIcon: '💙',
        preview: 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)',
        color: '#3f51b5',
        category: 'basic'
    },
    {
        id: 'teal',
        name: '青綠主題',
        icon: '💚',
        buttonIcon: '💚',
        preview: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
        color: '#009688',
        category: 'basic'
    },
    {
        id: 'aurora',
        name: '極光主題',
        icon: '🌈',
        buttonIcon: '🌈',
        preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#667eea',
        category: 'cosmic',
        backgroundImage: 'https://i.pinimg.com/1200x/fe/b3/f9/feb3f9990f903e1b7b0f4a2066a97722.jpg'
    },
    {
        id: 'noface',
        name: '無臉男主題',
        icon: '🪙',
        buttonIcon: '🪙',
        preview: 'url("https://i.pinimg.com/736x/85/9c/7c/859c7c50479b84c65089909c4acec1f3.jpg") center/cover',
        color: '#D4AF37',
        category: 'anime',
        backgroundImage: 'https://i.pinimg.com/736x/85/9c/7c/859c7c50479b84c65089909c4acec1f3.jpg'
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
        id: 'money',
        name: '金錢滿滿',
        icon: '💸',
        buttonIcon: '💸',
        preview: 'url("https://i.pinimg.com/736x/cc/56/8d/cc568d4109c2c92d507f597ba0ece7be.jpg") center/cover',
        color: '#16f49a',
        category: 'wealth',
        backgroundImage: 'https://i.pinimg.com/736x/cc/56/8d/cc568d4109c2c92d507f597ba0ece7be.jpg'
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
        id: 'goldenTree',
        name: '金樹計畫',
        icon: '🌳',
        buttonIcon: '🌳',
        preview: 'url("https://i.pinimg.com/736x/28/a0/be/28a0be222d619be4c2944dbd309c4153.jpg") center/cover',
        color: '#8B4513',
        category: 'wealth',
        backgroundImage: 'https://i.pinimg.com/736x/28/a0/be/28a0be222d619be4c2944dbd309c4153.jpg'
    },
    {
        id: 'chaonengli',
        name: '鈔能力',
        icon: '💰',
        buttonIcon: '💰',
        preview: 'url("https://i.pinimg.com/736x/cc/56/8d/cc568d4109c2c92d507f597ba0ece7be.jpg") center/cover',
        color: '#D4AF37',
        category: 'wealth',
        backgroundImage: 'https://i.pinimg.com/736x/cc/56/8d/cc568d4109c2c92d507f597ba0ece7be.jpg'
    },
    {
        id: 'fruit',
        name: '水果清爽',
        icon: '🍓',
        buttonIcon: '🍋',
        preview: 'url("https://i.pinimg.com/736x/3a/57/69/3a576934dcdf3bb2ba06b3d2964ab296.jpg") center/cover',
        color: '#40E0D0',
        category: 'cute',
        backgroundImage: 'https://i.pinimg.com/736x/3a/57/69/3a576934dcdf3bb2ba06b3d2964ab296.jpg'
    },
    {
        id: 'meow',
        name: '喵喵喵',
        icon: '🐱',
        buttonIcon: '🐈',
        preview: 'url("https://i.pinimg.com/736x/9b/c1/cd/9bc1cd5e89c11cd36a290ef3cf707919.jpg") center/cover',
        color: '#87CEEB',
        category: 'cute',
        backgroundImage: 'https://i.pinimg.com/736x/9b/c1/cd/9bc1cd5e89c11cd36a290ef3cf707919.jpg'
    },
    {
        id: 'cute',
        name: '可愛圖片主題',
        icon: '🐾',
        buttonIcon: '🐾',
        preview: 'url("image/BMG.jpg") center/cover',
        color: '#4dd0e1',
        category: 'cute',
        backgroundImage: 'image/BMG.jpg'
    },
    {
        id: 'bluerose',
        name: '藍玫瑰騎士',
        icon: '🌹',
        buttonIcon: '🗡️',
        preview: 'url("https://i.pinimg.com/1200x/d5/a1/c1/d5a1c149ab3b2a049576504e83fd21f7.jpg") center/cover',
        color: '#007bff',
        category: 'fantasy',
        backgroundImage: 'https://i.pinimg.com/1200x/d5/a1/c1/d5a1c149ab3b2a049576504e83fd21f7.jpg'
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
        id: 'dreamyBlue',
        name: '夢幻藍夜',
        icon: '🌙',
        buttonIcon: '🐰',
        preview: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e8ba3 100%)',
        color: '#1e3c72',
        category: 'fantasy',
        backgroundImage: 'https://i.pinimg.com/736x/6f/af/e2/6fafe2a9d450965373f9829a386805d1.jpg',
        investmentCardImage: 'https://i.pinimg.com/736x/6f/af/e2/6fafe2a9d450965373f9829a386805d1.jpg',
        accountingCardImage: 'https://i.pinimg.com/736x/6f/af/e2/6fafe2a9d450965373f9829a386805d1.jpg',
        walletBudgetCardImage: 'https://i.pinimg.com/736x/6f/af/e2/6fafe2a9d450965373f9829a386805d1.jpg',
        monthlyPlanningCardImage: 'https://i.pinimg.com/736x/6f/af/e2/6fafe2a9d450965373f9829a386805d1.jpg',
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/6f/af/e2/6fafe2a9d450965373f9829a386805d1.jpg',
        holdingCardImage: 'https://i.pinimg.com/736x/6f/af/e2/6fafe2a9d450965373f9829a386805d1.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/6f/af/e2/6fafe2a9d450965373f9829a386805d1.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/6f/af/e2/6fafe2a9d450965373f9829a386805d1.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/6f/af/e2/6fafe2a9d450965373f9829a386805d1.jpg'
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
        investmentSettingsCardImage: 'https://i.pinimg.com/736x/91/87/48/918748238a3b26c91dcacd9926591d57.jpg',
        holdingCardImage: 'https://i.pinimg.com/736x/91/87/48/918748238a3b26c91dcacd9926591d57.jpg',
        buyingCardImage: 'https://i.pinimg.com/736x/91/87/48/918748238a3b26c91dcacd9926591d57.jpg',
        sellingCardImage: 'https://i.pinimg.com/736x/91/87/48/918748238a3b26c91dcacd9926591d57.jpg',
        dividendCardImage: 'https://i.pinimg.com/736x/91/87/48/918748238a3b26c91dcacd9926591d57.jpg'
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
    }
]);

window.AppThemes.push({
    id: 'amberRonin',
    name: '暖金浪人',
    icon: '🍁',
    buttonIcon: '🗡️',
    preview: 'linear-gradient(135deg, rgba(27, 18, 13, 0.92) 0%, rgba(168, 90, 42, 0.34) 55%, rgba(244, 178, 74, 0.30) 100%)',
    color: '#f4b24a',
    category: 'anime',
    cssBackground: true,
    backgroundImage: 'https://i.pinimg.com/736x/10/21/7b/10217b8f99106e8ff921040354429197.jpg',
    investmentCardImage: 'https://i.pinimg.com/736x/10/21/7b/10217b8f99106e8ff921040354429197.jpg',
    accountingCardImage: 'https://i.pinimg.com/736x/10/21/7b/10217b8f99106e8ff921040354429197.jpg',
    walletBudgetCardImage: 'https://i.pinimg.com/736x/10/21/7b/10217b8f99106e8ff921040354429197.jpg',
    monthlyPlanningCardImage: 'https://i.pinimg.com/736x/10/21/7b/10217b8f99106e8ff921040354429197.jpg',
    investmentSettingsCardImage: 'https://i.pinimg.com/736x/10/21/7b/10217b8f99106e8ff921040354429197.jpg',
    holdingCardImage: 'https://i.pinimg.com/736x/10/21/7b/10217b8f99106e8ff921040354429197.jpg',
    buyingCardImage: 'https://i.pinimg.com/736x/10/21/7b/10217b8f99106e8ff921040354429197.jpg',
    sellingCardImage: 'https://i.pinimg.com/736x/10/21/7b/10217b8f99106e8ff921040354429197.jpg',
    dividendCardImage: 'https://i.pinimg.com/736x/10/21/7b/10217b8f99106e8ff921040354429197.jpg'
});

window.AppThemes.push({
    id: 'serpentEyes',
    name: '蛇影雙瞳',
    icon: '🐍',
    buttonIcon: '👁️',
    preview: 'linear-gradient(135deg, rgba(14, 20, 24, 0.94) 0%, rgba(31, 90, 102, 0.44) 55%, rgba(242, 178, 51, 0.24) 100%)',
    color: '#2aa9a4',
    category: 'anime',
    cssBackground: true,
    backgroundImage: 'https://i.pinimg.com/736x/2e/60/08/2e6008635951b66dcc9ad7b0943526f2.jpg',
    investmentCardImage: 'https://i.pinimg.com/736x/2e/60/08/2e6008635951b66dcc9ad7b0943526f2.jpg',
    accountingCardImage: 'https://i.pinimg.com/736x/2e/60/08/2e6008635951b66dcc9ad7b0943526f2.jpg',
    walletBudgetCardImage: 'https://i.pinimg.com/736x/2e/60/08/2e6008635951b66dcc9ad7b0943526f2.jpg',
    monthlyPlanningCardImage: 'https://i.pinimg.com/736x/2e/60/08/2e6008635951b66dcc9ad7b0943526f2.jpg',
    investmentSettingsCardImage: 'https://i.pinimg.com/736x/2e/60/08/2e6008635951b66dcc9ad7b0943526f2.jpg',
    holdingCardImage: 'https://i.pinimg.com/736x/2e/60/08/2e6008635951b66dcc9ad7b0943526f2.jpg',
    buyingCardImage: 'https://i.pinimg.com/736x/2e/60/08/2e6008635951b66dcc9ad7b0943526f2.jpg',
    sellingCardImage: 'https://i.pinimg.com/736x/2e/60/08/2e6008635951b66dcc9ad7b0943526f2.jpg',
    dividendCardImage: 'https://i.pinimg.com/736x/2e/60/08/2e6008635951b66dcc9ad7b0943526f2.jpg'
});
// 主題分類定義
const themeCategories = {
    basic: {
        name: '經典色彩',
        icon: '🎨',
        description: '純色經典主題'
    },
    nature: {
        name: '自然風光',
        icon: '🌿',
        description: '森林、雪景等自然主題'
    },
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
        description: '可愛、萌系主題'
    },
    fantasy: {
        name: '奇幻風格',
        icon: '🗡️',
        description: '騎士、奇幻主題'
    }
};

// 導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { themes, themeCategories };
} else {
    window.ThemeData = { themes, themeCategories };
}
