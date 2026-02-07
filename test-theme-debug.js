// 主題調試腳本
function debugFestiveTheme() {
    console.log('=== 節日慶典主題調試 ===');
    
    // 1. 檢查當前主題
    const currentTheme = document.documentElement.getAttribute('data-theme');
    console.log('當前主題:', currentTheme);
    
    // 2. 檢查主題配置
    const themes = [
        { id: 'pink', name: '粉色主題' },
        { id: 'blue', name: '藍色主題' },
        { id: 'festive', name: '節日慶典主題' }
    ];
    
    themes.forEach(theme => {
        console.log(`\n--- ${theme.name} (${theme.id}) ---`);
        
        // 切換到該主題
        document.documentElement.setAttribute('data-theme', theme.id);
        
        // 檢查CSS變數
        const root = document.documentElement;
        const style = getComputedStyle(root);
        
        console.log('CSS變數:');
        console.log('  --color-primary:', style.getPropertyValue('--color-primary'));
        console.log('  --bg-card:', style.getPropertyValue('--bg-card'));
        console.log('  --border-primary:', style.getPropertyValue('--border-primary'));
        
        // 檢查預算頁面背景
        const pageBudget = document.querySelector('.page-budget');
        if (pageBudget) {
            const budgetStyle = getComputedStyle(pageBudget);
            console.log('預算頁面背景:');
            console.log('  background:', budgetStyle.background);
            console.log('  background-image:', budgetStyle.backgroundImage);
            console.log('  background-color:', budgetStyle.backgroundColor);
        }
        
        // 檢查預算摘要
        const budgetSummary = document.querySelector('.budget-summary');
        if (budgetSummary) {
            const summaryStyle = getComputedStyle(budgetSummary);
            console.log('預算摘要背景:');
            console.log('  background:', summaryStyle.background);
            console.log('  background-color:', summaryStyle.backgroundColor);
        }
    });
    
    // 恢復到節日慶典主題
    document.documentElement.setAttribute('data-theme', 'festive');
    console.log('\n=== 調試完成，已恢復到節日慶典主題 ===');
}

// 檢查主題配置
function checkThemeConfig() {
    console.log('=== 檢查主題配置 ===');
    
    // 檢查theme.js中的配置
    const themeConfig = {
        id: 'festive',
        name: '節日慶典',
        walletBudgetCardImage: 'https://i.pinimg.com/736x/6f/49/9a/6f499af434927a2eff91221a60393ae5.jpg'
    };
    
    console.log('主題配置:', themeConfig);
    
    // 檢查圖片是否可以載入
    const img = new Image();
    img.onload = function() {
        console.log('✅ 預算卡片圖片載入成功:', themeConfig.walletBudgetCardImage);
        console.log('圖片尺寸:', this.naturalWidth, 'x', this.naturalHeight);
    };
    img.onerror = function() {
        console.log('❌ 預算卡片圖片載入失敗:', themeConfig.walletBudgetCardImage);
    };
    img.src = themeConfig.walletBudgetCardImage;
}

// 應用主題並檢查
function applyThemeAndCheck(themeId) {
    console.log(`\n=== 應用主題: ${themeId} ===`);
    
    // 應用主題
    document.documentElement.setAttribute('data-theme', themeId);
    
    // 等待CSS更新
    setTimeout(() => {
        const root = document.documentElement;
        const style = getComputedStyle(root);
        
        console.log('主題變數:');
        console.log('  --color-primary:', style.getPropertyValue('--color-primary'));
        console.log('  --bg-card:', style.getPropertyValue('--bg-card'));
        
        // 檢查預算頁面
        const pageBudget = document.querySelector('.page-budget');
        if (pageBudget) {
            const budgetStyle = getComputedStyle(pageBudget);
            console.log('預算頁面樣式:');
            console.log('  background:', budgetStyle.background.substring(0, 100) + '...');
            console.log('  是否有背景圖片:', budgetStyle.backgroundImage !== 'none');
        }
    }, 100);
}

// 測試所有主題
function testAllThemes() {
    const themes = ['pink', 'blue', 'festive'];
    
    themes.forEach((theme, index) => {
        setTimeout(() => {
            applyThemeAndCheck(theme);
        }, index * 1000);
    });
}

// 如果在瀏覽器中運行
if (typeof window !== 'undefined') {
    // 添加到全局作用域
    window.debugFestiveTheme = debugFestiveTheme;
    window.checkThemeConfig = checkThemeConfig;
    window.applyThemeAndCheck = applyThemeAndCheck;
    window.testAllThemes = testAllThemes;
    
    // 自動運行檢查
    console.log('主題調試工具已載入');
    console.log('可用的命令:');
    console.log('  debugFestiveTheme() - 調試節日慶典主題');
    console.log('  checkThemeConfig() - 檢查主題配置');
    console.log('  applyThemeAndCheck(themeId) - 應用指定主題並檢查');
    console.log('  testAllThemes() - 測試所有主題');
    
    // 自動運行一次檢查
    setTimeout(() => {
        debugFestiveTheme();
    }, 1000);
}
