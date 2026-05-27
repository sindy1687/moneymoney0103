// 每月收入支出清單功能
(function() {
    // 獲取每月收入支出數據
    function getMonthlySummary() {
        const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
        const monthlyData = {};

        records.forEach(record => {
            const date = new Date(record.date);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const key = `${year}-${String(month).padStart(2, '0')}`;

            if (!monthlyData[key]) {
                monthlyData[key] = {
                    year: year,
                    month: month,
                    income: 0,
                    expense: 0,
                    transfer: 0,
                    records: []
                };
            }

            const amount = parseFloat(record.amount) || 0;
            if (record.type === 'income') {
                monthlyData[key].income += amount;
            } else if (record.type === 'expense') {
                monthlyData[key].expense += amount;
            } else if (record.type === 'transfer') {
                monthlyData[key].transfer += amount;
            }

            monthlyData[key].records.push(record);
        });

        // 轉換為數組並按日期排序
        return Object.values(monthlyData).sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
    }

    // 渲染每月摘要列表
    function renderMonthlySummary() {
        const container = document.getElementById('monthlySummaryList');
        if (!container) return;

        const monthlyData = getMonthlySummary();

        if (monthlyData.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">📊</div>
                    <div style="color: var(--text-tertiary);">尚無記帳記錄</div>
                </div>
            `;
            return;
        }

        let html = '';
        monthlyData.forEach(data => {
            const net = data.income - data.expense - data.transfer;
            const netClass = net >= 0 ? 'positive' : 'negative';

            html += `
                <div class="monthly-summary-card" data-month="${data.year}-${String(data.month).padStart(2, '0')}">
                    <div class="monthly-summary-card-header">
                        <div class="monthly-summary-card-title">${data.year}年${data.month}月</div>
                        <div class="monthly-summary-net ${netClass}">
                            ${net >= 0 ? '+' : ''}NT$${net.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                    </div>
                    <div class="monthly-summary-details">
                        <div class="monthly-summary-item">
                            <span class="monthly-summary-label">收入</span>
                            <span class="monthly-summary-value income">+NT$${data.income.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        <div class="monthly-summary-item">
                            <span class="monthly-summary-label">支出</span>
                            <span class="monthly-summary-value expense">-NT$${data.expense.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        <div class="monthly-summary-item">
                            <span class="monthly-summary-label">轉帳</span>
                            <span class="monthly-summary-value transfer">NT$${data.transfer.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>
                    <button class="monthly-summary-expand-btn" data-month="${data.year}-${String(data.month).padStart(2, '0')}">
                        查看詳情
                    </button>
                    <div class="monthly-summary-records" id="monthlyRecords-${data.year}-${String(data.month).padStart(2, '0')}" style="display: none;">
                        <div class="monthly-records-list">
                            ${data.records.map(record => `
                                <div class="monthly-record-item">
                                    <div class="monthly-record-date">${record.date}</div>
                                    <div class="monthly-record-info">
                                        <div class="monthly-record-category">${record.category || '未分類'}</div>
                                        <div class="monthly-record-note">${record.note || ''}</div>
                                    </div>
                                    <div class="monthly-record-amount ${record.type === 'income' ? 'income' : record.type === 'expense' ? 'expense' : 'transfer'}">
                                        ${record.type === 'income' ? '+' : record.type === 'expense' ? '-' : ''}NT$${parseFloat(record.amount).toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // 添加展開/收起事件監聽器
        document.querySelectorAll('.monthly-summary-expand-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const month = this.dataset.month;
                const recordsDiv = document.getElementById(`monthlyRecords-${month}`);
                const isExpanded = recordsDiv.style.display !== 'none';

                if (isExpanded) {
                    recordsDiv.style.display = 'none';
                    this.textContent = '查看詳情';
                } else {
                    recordsDiv.style.display = 'block';
                    this.textContent = '收起詳情';
                }
            });
        });
    }

    // 初始化
    document.addEventListener('DOMContentLoaded', function() {
        // 檢查是否在每月摘要頁面
        const monthlySummaryPage = document.getElementById('pageMonthlySummary');
        if (monthlySummaryPage) {
            renderMonthlySummary();
        }

        // 監聽頁面切換
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target.id === 'pageMonthlySummary' && 
                    mutation.target.style.display !== 'none') {
                    renderMonthlySummary();
                }
            });
        });

        const monthlySummaryPageEl = document.getElementById('pageMonthlySummary');
        if (monthlySummaryPageEl) {
            observer.observe(monthlySummaryPageEl, { attributes: true, attributeFilter: ['style'] });
        }
    });

    // 導出函數供外部調用
    window.getMonthlySummary = getMonthlySummary;
    window.renderMonthlySummary = renderMonthlySummary;
})();
