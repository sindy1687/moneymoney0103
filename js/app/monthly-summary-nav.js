// 每月摘要頁面導航邏輯
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // 返回按鈕處理（nav 點擊由 initBottomNav 統一處理）
        const monthlySummaryBackBtn = document.getElementById('monthlySummaryBackBtn');
        if (monthlySummaryBackBtn) {
            monthlySummaryBackBtn.addEventListener('click', function() {
                // 隱藏每月摘要頁面
                const monthlySummaryPage = document.getElementById('pageMonthlySummary');
                if (monthlySummaryPage) {
                    monthlySummaryPage.style.display = 'none';
                }
                
                // 顯示底部導航
                const bottomNav = document.querySelector('.bottom-nav');
                if (bottomNav) {
                    bottomNav.style.display = 'flex';
                }
                
                // 返回到記帳本頁面
                const pageLedger = document.getElementById('pageLedger');
                if (pageLedger) {
                    pageLedger.style.display = 'block';
                }
                
                // 更新導航狀態
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                const ledgerNav = document.querySelector('.nav-item[data-page="ledger"]');
                if (ledgerNav) {
                    ledgerNav.classList.add('active');
                }
            });
        }
    });
})();
