// 禁用理財顧問小森相關功能
(function() {
    // 覆蓋小森對話觸發函數
    window.checkAndTriggerMoriDialog = function() {
        console.log('理財顧問小森功能已停用');
        return false;
    };

    // 覆蓋小森相關的其他函數
    window.checkStreakEncouragementDialog = function() {
        // 保留連續記帳鼓勵功能
    };

    window.checkOverspendReasonDialog = function() {
        // 保留超支原因提示功能
    };

    // 從主題列表中移除小森主題
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            if (typeof themeConfig !== 'undefined' && themeConfig.themes) {
                themeConfig.themes = themeConfig.themes.filter(function(theme) {
                    return theme.id !== 'mori';
                });
            }
        }, 1000);
    });

    // 隱藏理財顧問相關的 UI 元素
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            // 隱藏歷史記錄中的理財顧問按鈕
            const advisorBtns = document.querySelectorAll('.history-advisor-btn');
            advisorBtns.forEach(function(btn) {
                btn.style.display = 'none';
            });

            // 隱藏理財顧問聊天界面
            const advisorChat = document.getElementById('historyAdvisorChat');
            if (advisorChat) {
                advisorChat.style.display = 'none';
            }
        }, 500);
    });
})();
