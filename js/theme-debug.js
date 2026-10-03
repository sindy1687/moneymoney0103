// ========== 主題系統調試載入器 ==========

// 載入所有主題模組 (帶詳細調試信息)
(function() {
    'use strict';

    console.log('🚀 主題系統調試載入器啟動');

    // 獲取當前腳本路徑
    function getCurrentScriptPath() {
        const script = document.currentScript || (function() {
            const scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();
        
        if (script && script.src) {
            const path = script.src.substring(0, script.src.lastIndexOf('/') + 1);
            console.log('📍 檢測到腳本路徑:', path);
            return path;
        }
        
        console.log('📍 無法檢測腳本路徑，使用默認路徑: ./js/');
        return './js/';
    }

    const basePath = getCurrentScriptPath();

    // 模組列表
    const modules = [
        'theme-data.js',
        'theme-icons.js', 
        'theme-core.js',
        'theme-ui.js',
        'theme-main.js'
    ];

    // 載入單個模組
    function loadModule(src) {
        return new Promise((resolve, reject) => {
            const fullUrl = basePath + src;
            console.log(`📦 嘗試載入: ${fullUrl}`);
            
            const script = document.createElement('script');
            script.src = fullUrl;
            script.async = false;
            
            script.onload = () => {
                console.log(`✅ 成功載入: ${src}`);
                resolve();
            };
            
            script.onerror = () => {
                console.error(`❌ 載入失敗: ${fullUrl}`);
                reject(new Error(`Failed to load: ${fullUrl}`));
            };
            
            document.head.appendChild(script);
        });
    }

    // 檢查模組是否已載入
    function checkModuleLoaded(moduleName) {
        switch(moduleName) {
            case 'theme-data.js':
                return window.ThemeData !== undefined;
            case 'theme-icons.js':
                return window.ThemeIcons !== undefined;
            case 'theme-core.js':
                return window.ThemeCore !== undefined;
            case 'theme-ui.js':
                return window.ThemeUI !== undefined;
            case 'theme-main.js':
                return window.ThemeMain !== undefined;
            default:
                return false;
        }
    }

    // 主載入函數
    async function loadAllModules() {
        console.log('🔄 開始載入所有主題模組');
        console.log('📁 基礎路徑:', basePath);
        
        try {
            for (let i = 0; i < modules.length; i++) {
                const module = modules[i];
                console.log(`📦 [${i + 1}/${modules.length}] 載入模組: ${module}`);
                
                try {
                    await loadModule(module);
                    
                    // 檢查模組是否正確載入
                    setTimeout(() => {
                        if (checkModuleLoaded(module)) {
                            console.log(`✅ 模組 ${module} 載入並初始化成功`);
                        } else {
                            console.warn(`⚠️ 模組 ${module} 載入但未正確初始化`);
                        }
                    }, 100);
                    
                } catch (error) {
                    console.error(`❌ 模組 ${module} 載入失敗:`, error);
                    throw error;
                }
            }
            
            console.log('🎉 所有主題模組載入完成！');
            
            // 最終檢查
            setTimeout(() => {
                console.log('🔍 最終模組狀態檢查:');
                console.log('  ThemeData:', window.ThemeData ? '✅' : '❌');
                console.log('  ThemeIcons:', window.ThemeIcons ? '✅' : '❌');
                console.log('  ThemeCore:', window.ThemeCore ? '✅' : '❌');
                console.log('  ThemeUI:', window.ThemeUI ? '✅' : '❌');
                console.log('  ThemeMain:', window.ThemeMain ? '✅' : '❌');
                
                // 檢查夢幻藍夜主題
                if (window.ThemeData && window.ThemeData.themes) {
                    const dreamyTheme = window.ThemeData.themes.find(t => t.id === 'dreamyBlue');
                    console.log('  夢幻藍夜主題:', dreamyTheme ? '✅' : '❌');
                }
            }, 500);
            
        } catch (error) {
            console.error('💥 主題模組載入失敗:', error);
            
            // 嘗試手動載入
            console.log('🔄 嘗試手動載入模式...');
            tryManualLoading();
        }
    }

    // 手動載入模式
    function tryManualLoading() {
        console.log('🔧 啟動手動載入模式');
        
        const possiblePaths = [
            './js/',
            'js/',
            '../js/',
            '../../js/',
            './'
        ];
        
        let pathIndex = 0;
        
        function tryPath() {
            if (pathIndex >= possiblePaths.length) {
                console.error('❌ 所有路徑都嘗試失敗');
                return;
            }
            
            const currentPath = possiblePaths[pathIndex];
            console.log(`🔄 嘗試路徑 ${pathIndex + 1}/${possiblePaths.length}: ${currentPath}`);
            
            let loadedCount = 0;
            const totalModules = modules.length;
            
            modules.forEach(module => {
                const script = document.createElement('script');
                script.src = currentPath + module;
                
                script.onload = () => {
                    loadedCount++;
                    console.log(`✅ [${loadedCount}/${totalModules}] ${module} 載入成功`);
                    
                    if (loadedCount === totalModules) {
                        console.log(`🎉 使用路徑 ${currentPath} 載入所有模組成功！`);
                    }
                };
                
                script.onerror = () => {
                    console.error(`❌ ${currentPath + module} 載入失敗`);
                };
                
                document.head.appendChild(script);
            });
            
            // 檢查這個路徑是否成功
            setTimeout(() => {
                const success = modules.every(module => {
                    const script = document.querySelector(`script[src="${currentPath + module}"]`);
                    return script && !script.hasAttribute('data-error');
                });
                
                if (!success) {
                    pathIndex++;
                    setTimeout(tryPath, 1000);
                }
            }, 2000);
        }
        
        tryPath();
    }

    // 開始載入
    if (!window.playerAppReady) {
        document.addEventListener('playerappready', loadAllModules);
    } else {
        loadAllModules();
    }
})();

// 向後兼容
window.AppThemes = window.AppThemes || [];
window.themes = window.themes || window.AppThemes;
