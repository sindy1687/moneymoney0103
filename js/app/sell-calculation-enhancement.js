// 賣出試算功能增強
// 注意：試算邏輯已整合至 updateInvestmentDisplay()（04-diary-investment-ui.js）
// 此檔案保留舊版相容綁定（舊版 #sellForm 用），不影響新版賣出頁面

(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const sellStockCode = document.getElementById('sellStockCode');
        const sellPrice = document.getElementById('sellPrice');
        const sellShares = document.getElementById('sellShares');
        const sellFee = document.getElementById('sellFee');
        const sellTax = document.getElementById('sellTax');
        // 若舊版 sellForm 已不存在，直接結束
        if (!sellStockCode && !sellPrice) return;

        // 增強版計算預估損益函數
        const calculateEstimatedPnlEnhanced = () => {
            const stockCode = sellStockCode ? sellStockCode.value.trim() : '';
            const price = sellPrice ? parseFloat(sellPrice.value) || 0 : 0;
            const shares = sellShares ? parseInt(sellShares.value) || 0 : 0;
            const fee = sellFee ? parseFloat(sellFee.value) || 0 : 0;
            const tax = sellTax ? parseFloat(sellTax.value) || 0 : 0;

            // 重置所有顯示
            const sellAmountEl = document.getElementById('sellAmount');
            const costAmountEl = document.getElementById('costAmount');
            const sellFeeDisplayEl = document.getElementById('sellFeeDisplay');
            const sellTaxDisplayEl = document.getElementById('sellTaxDisplay');
            const netRevenueEl = document.getElementById('netRevenue');
            const estimatedPnlEl = document.getElementById('estimatedPnl');
            const estimatedReturnEl = document.getElementById('estimatedReturn');

            if (sellAmountEl) sellAmountEl.textContent = 'NT$0';
            if (costAmountEl) costAmountEl.textContent = 'NT$0';
            if (sellFeeDisplayEl) sellFeeDisplayEl.textContent = 'NT$0';
            if (sellTaxDisplayEl) sellTaxDisplayEl.textContent = 'NT$0';
            if (netRevenueEl) netRevenueEl.textContent = 'NT$0';
            if (estimatedPnlEl) {
                estimatedPnlEl.textContent = 'NT$0';
                estimatedPnlEl.className = 'pnl-value';
            }
            if (estimatedReturnEl) estimatedReturnEl.textContent = '0%';

            if (!stockCode || !price || !shares) {
                return;
            }

            // 計算平均成本
            if (typeof getPortfolio === 'function') {
                const portfolio = getPortfolio();
                const stock = portfolio.find(s => s.stockCode === stockCode);

                if (!stock || stock.shares < shares) {
                    if (estimatedPnlEl) {
                        estimatedPnlEl.textContent = '持股不足';
                        estimatedPnlEl.className = 'pnl-value';
                    }
                    return;
                }

                const avgCost = stock.avgCost;
                const sellAmount = price * shares;
                const totalCost = avgCost * shares;
                const netRevenue = sellAmount - fee - tax;
                const pnl = netRevenue - totalCost;
                const returnRate = totalCost > 0 ? (pnl / totalCost * 100) : 0;

                // 更新顯示
                if (sellAmountEl) {
                    sellAmountEl.textContent = `NT$${sellAmount.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                }
                if (costAmountEl) {
                    costAmountEl.textContent = `NT$${totalCost.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                }
                if (sellFeeDisplayEl) {
                    sellFeeDisplayEl.textContent = `NT$${fee.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                }
                if (sellTaxDisplayEl) {
                    sellTaxDisplayEl.textContent = `NT$${tax.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                }
                if (netRevenueEl) {
                    netRevenueEl.textContent = `NT$${netRevenue.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                }

                if (estimatedPnlEl) {
                    estimatedPnlEl.textContent = `NT$${pnl.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                    estimatedPnlEl.className = `pnl-value ${pnl >= 0 ? 'positive' : 'negative'}`;
                }

                if (estimatedReturnEl) {
                    estimatedReturnEl.textContent = `${returnRate.toFixed(2)}%`;
                    estimatedReturnEl.className = returnRate >= 0 ? 'positive' : 'negative';
                }
            }
        };

        // 添加事件監聽器
        if (sellStockCode) {
            sellStockCode.addEventListener('change', calculateEstimatedPnlEnhanced);
        }
        if (sellPrice) {
            sellPrice.addEventListener('input', calculateEstimatedPnlEnhanced);
        }
        if (sellShares) {
            sellShares.addEventListener('input', calculateEstimatedPnlEnhanced);
        }
        if (sellFee) {
            sellFee.addEventListener('input', calculateEstimatedPnlEnhanced);
        }
        if (sellTax) {
            sellTax.addEventListener('input', calculateEstimatedPnlEnhanced);
        }
    });
})();
