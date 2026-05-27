// ========== 音效功能 ==========

// 音頻文件緩存，避免重複創建
let clickAudio = null;
let incomeAudio = null;
let audioFailed = { click: false, income: false }; // 記錄失敗狀態，避免重複嘗試

if (typeof window !== 'undefined' && typeof window.applyAutoWidth !== 'function') {
    window.applyAutoWidth = function () {};
}

function expandInputSection() {
    const inputSection = document.getElementById('inputSection');
    if (inputSection && inputSection.classList.contains('collapsed')) {
        inputSection.classList.remove('collapsed');
        const collapseBtn = document.getElementById('collapseBtn');
        const collapseIcon = collapseBtn?.querySelector('.collapse-icon');
        if (collapseIcon) {
            collapseIcon.textContent = '▼';
        }
    }
}

// 股票交易分析（買入 / 賣出 / 股利）
function getThemeChartPalette() {
    const root = document.documentElement;
    const getVar = (name, fallback) => {
        const value = getComputedStyle(root).getPropertyValue(name).trim();
        return value || fallback;
    };

    return {
        primary: getVar('--color-primary', '#4a90e2'),
        primaryLight: getVar('--color-primary-light', '#7bb3f0'),
        primaryLighter: getVar('--color-primary-lighter', '#5da3ed'),
        primaryDark: getVar('--color-primary-dark', '#2e7bd6'),
        accent: getVar('--color-secondary', '#7c3aed'),
        background: getVar('--bg-card', 'rgba(255,255,255,0.92)'),
        border: getVar('--border-light', '#e5e7eb'),
        textPrimary: getVar('--text-primary', '#1f2937'),
        textSecondary: getVar('--text-secondary', '#6b7280'),
        success: getVar('--color-success', '#22c55e') || '#22c55e',
        danger: getVar('--color-danger', '#ef4444') || '#ef4444'
    };
}

function updateStockTradeChart() {
    const palette = getThemeChartPalette();
    const sellCanvas = document.getElementById('stockTradeChartSell');
    const divCanvas = document.getElementById('stockTradeChartDiv');
    if (!sellCanvas || !divCanvas) return;
    const sellSubtitle = sellCanvas.previousElementSibling; // 「賣出（收入）」文字
    const divSubtitle = divCanvas.previousElementSibling;  // 「股利（收入）」文字
    const insightEl = document.getElementById('stockTradeInsight');
    const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');

    // 取近12個月
    const monthly = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthly[key] = { buy: 0, sell: 0, dividend: 0 };
    }

    records.forEach(r => {
        const date = new Date(r.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthly[key]) return;
        if (r.type === 'buy') {
            const fee = r.fee || 0;
            monthly[key].buy -= ((r.price || 0) * (r.shares || 0) + fee);
        } else if (r.type === 'sell') {
            const fee = r.fee || 0;
            const tax = r.tax || 0;
            monthly[key].sell += ((r.price || 0) * (r.shares || 0)) - fee - tax;
        } else if (r.type === 'dividend') {
            monthly[key].dividend += (r.amount || 0);
        }
    });

    const labels = Object.keys(monthly);
    const buyData = labels.map(k => monthly[k].buy);
    const sellData = labels.map(k => monthly[k].sell);
    const divData = labels.map(k => monthly[k].dividend);

    const destroyChart = (instanceSetter) => {
        if (instanceSetter && instanceSetter.chart) {
            instanceSetter.chart.destroy();
            instanceSetter.chart = null;
        }
    };

    const divHasData = divData.some(v => v !== 0);
    const sellHasData = sellData.some(v => v !== 0);
    const buyHasData = buyData.some(v => v !== 0);

    // 如果全為 0，清空並提示
    if (![buyHasData, sellHasData, divHasData].some(Boolean)) {
        destroyChart(stockTradeChartSellInstance);
        destroyChart(stockTradeChartDivInstance);
        if (sellSubtitle) sellSubtitle.style.display = 'none';
        sellCanvas.style.display = 'none';
        if (divSubtitle) divSubtitle.style.display = 'none';
        divCanvas.style.display = 'none';
        if (insightEl) insightEl.textContent = '近12月尚無交易';
        return;
    }

    // 清理舊圖表
    destroyChart(stockTradeChartSellInstance);
    destroyChart(stockTradeChartDivInstance);

    // 顯示/隱藏賣出圖表
    if (sellHasData) {
        sellCanvas.style.display = '';
        if (sellSubtitle) sellSubtitle.style.display = '';
    } else {
        destroyChart(stockTradeChartSellInstance);
        sellCanvas.style.display = 'none';
        if (sellSubtitle) sellSubtitle.style.display = 'none';
    }

    // 顯示/隱藏股利圖表
    if (divHasData) {
        divCanvas.style.display = '';
        if (divSubtitle) divSubtitle.style.display = '';
    } else {
        destroyChart(stockTradeChartDivInstance);
        divCanvas.style.display = 'none';
        if (divSubtitle) divSubtitle.style.display = 'none';
    }

    const primary = palette.primary;
    const success = palette.success;
    const danger = palette.danger;
    const primaryLight = palette.primaryLight;
    const borderLight = palette.border;
    const textSecondary = palette.textSecondary;

    const commonOptions = {
        type: 'bar',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            return `NT$${ctx.parsed.y.toLocaleString('zh-TW')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return 'NT$' + value.toLocaleString('zh-TW');
                        },
                        color: textSecondary
                    },
                    grid: { color: borderLight }
                },
                x: {
                    ticks: { color: textSecondary, maxRotation: 45 },
                    grid: { display: false }
                }
            }
        }
    };

    if (sellHasData) {
        stockTradeChartSellInstance = {
            chart: new Chart(sellCanvas, {
                ...commonOptions,
                data: {
                    labels,
                    datasets: [{
                        label: '💜 賣出（收入）',
                        data: sellData,
                        backgroundColor: primary,
                        borderColor: primary,
                        borderWidth: 1,
                        borderRadius: 6,
                        barThickness: Math.max(8, Math.min(14, 200 / labels.length)),
                    }]
                }
            })
        };
    }

    if (divHasData) {
        stockTradeChartDivInstance = {
            chart: new Chart(divCanvas, {
                ...commonOptions,
                data: {
                    labels,
                    datasets: [{
                        label: '💰 股利（收入）',
                        data: divData,
                        backgroundColor: primaryLight || success,
                        borderColor: primaryLight || success,
                        borderWidth: 1,
                        borderRadius: 6,
                        barThickness: Math.max(8, Math.min(14, 200 / labels.length)),
                    }]
                }
            })
        };
    }

    if (insightEl) {
        const totalBuy = buyData.reduce((a, b) => a + b, 0);
        const totalSell = sellData.reduce((a, b) => a + b, 0);
        const totalDiv = divData.reduce((a, b) => a + b, 0);
        const net = totalBuy + totalSell + totalDiv;
        insightEl.textContent = `近12月淨流 ${net >= 0 ? '入' : '出'} NT$${Math.abs(net).toLocaleString('zh-TW')}（買入：NT$${Math.abs(totalBuy).toLocaleString('zh-TW')}、賣出：NT$${totalSell.toLocaleString('zh-TW')}、股利：NT$${totalDiv.toLocaleString('zh-TW')}）`;
    }
}

// 股票持倉盈虧
function updateStockPnlChart() {
    const palette = getThemeChartPalette();
    const canvas = document.getElementById('stockPnlChart');
    if (!canvas) return;
    const insightEl = document.getElementById('stockPnlInsight');
    const portfolio = getPortfolio();

    if (!portfolio || portfolio.length === 0) {
        if (stockPnlChartInstance) {
            stockPnlChartInstance.destroy();
            stockPnlChartInstance = null;
        }
        if (insightEl) insightEl.textContent = '尚無持股';
        return;
    }

    const items = portfolio.map(stock => {
        const price = getStockCurrentPrice(stock.stockCode) || stock.avgCost || 0;
        const shares = stock.shares || 0;
        const cost = (stock.avgCost || 0) * shares;
        const value = price * shares;
        const pnl = value - cost;
        return {
            label: stock.stockName || stock.stockCode,
            pnl,
            cost,
            value
        };
    });

    // 防呆：若持股過多，僅顯示前 12 檔（按絕對盈虧排序），其餘合併為「其他」
    items.sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
    const MAX_ITEMS = 12;
    const mainItems = items.slice(0, MAX_ITEMS);
    const rest = items.slice(MAX_ITEMS);
    if (rest.length > 0) {
        const restPnl = rest.reduce((s, i) => s + i.pnl, 0);
        const restCost = rest.reduce((s, i) => s + i.cost, 0);
        const restValue = rest.reduce((s, i) => s + i.value, 0);
        mainItems.push({ label: `其他（${rest.length} 檔）`, pnl: restPnl, cost: restCost, value: restValue });
    }

    const labels = mainItems.map(i => i.label);
    const gains = mainItems.map(i => i.pnl);
    const costs = mainItems.map(i => i.cost);
    const totalCost = mainItems.reduce((s, i) => s + i.cost, 0);
    const totalValue = mainItems.reduce((s, i) => s + i.value, 0);

    if (gains.every(g => g === 0)) {
        if (stockPnlChartInstance) {
            stockPnlChartInstance.destroy();
            stockPnlChartInstance = null;
        }
        if (insightEl) insightEl.textContent = '尚無盈虧資料';
        return;
    }

    if (stockPnlChartInstance) {
        stockPnlChartInstance.destroy();
    }

    const primary = palette.primary;
    const danger = palette.danger;
    const borderLight = palette.border;
    const textSecondary = palette.textSecondary;

    const colors = gains.map(g => g >= 0 ? primary : danger);

    stockPnlChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: '盈虧',
                data: gains,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1,
                borderRadius: 8,
                barThickness: Math.max(10, Math.min(16, 240 / labels.length))
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            return `NT$${ctx.parsed.y.toLocaleString('zh-TW')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return 'NT$' + value.toLocaleString('zh-TW');
                        },
                        color: textSecondary
                    },
                    grid: { color: borderLight }
                },
                x: {
                    ticks: { color: textSecondary, maxRotation: 45 },
                    grid: { display: false }
                }
            }
        }
    });

    if (insightEl) {
        const bestIdx = gains.indexOf(Math.max(...gains));
        const worstIdx = gains.indexOf(Math.min(...gains));
        const totalPnl = totalValue - totalCost;
        insightEl.textContent = `總盈虧 NT$${totalPnl.toLocaleString('zh-TW')}，最佳 ${labels[bestIdx]}，最弱 ${labels[worstIdx]}`;
    }
}

// 股票持倉分佈（以市值計算權重）
function updateStockAllocationChart() {
    const palette = getThemeChartPalette();
    const canvas = document.getElementById('stockAllocationChart');
    if (!canvas) return;

    const insightEl = document.getElementById('stockAllocationInsight');
    const portfolio = getPortfolio();

    if (!portfolio || portfolio.length === 0) {
        if (stockAllocationChartInstance) {
            stockAllocationChartInstance.destroy();
            stockAllocationChartInstance = null;
        }
        if (insightEl) insightEl.textContent = '尚無持股';
        return;
    }

    const labels = [];
    const values = [];
    let totalValue = 0;
    portfolio.forEach(stock => {
        const price = getStockCurrentPrice(stock.stockCode) || stock.avgCost || 0;
        const value = price * (stock.shares || 0);
        labels.push(stock.stockName || stock.stockCode);
        values.push(value);
        totalValue += value;
    });

    if (values.every(v => v === 0)) {
        if (stockAllocationChartInstance) {
            stockAllocationChartInstance.destroy();
            stockAllocationChartInstance = null;
        }
        if (insightEl) insightEl.textContent = '尚無價格資料';
        return;
    }

    const colors = generateColors(labels.length, palette);

    if (stockAllocationChartInstance) {
        stockAllocationChartInstance.destroy();
    }

    stockAllocationChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors.backgrounds,
                borderColor: colors.borders,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '52%',
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const val = context.parsed || 0;
                            const pct = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : '0';
                            return `${label}: NT$${val.toLocaleString('zh-TW')}（${pct}%）`;
                        }
                    }
                }
            }
        }
    });

    if (insightEl) {
        const maxIdx = values.indexOf(Math.max(...values));
        const topLabel = labels[maxIdx];
        const topVal = values[maxIdx] || 0;
        const pct = totalValue > 0 ? ((topVal / totalValue) * 100).toFixed(1) : '0';
        insightEl.textContent = `最大持倉「${topLabel}」佔約 ${pct}%（NT$${topVal.toLocaleString('zh-TW')}）`;
    }
}


async function applyBackupDataPayload(data) {
    if (data && data.localStorageSnapshot && typeof data.localStorageSnapshot === 'object') {
        Object.keys(data.localStorageSnapshot).forEach((key) => {
            try {
                localStorage.setItem(key, data.localStorageSnapshot[key]);
            } catch (e) {
                console.warn('restore localStorage key failed:', key, e);
            }
        });
    }

    // 還原資料（包含所有資料）
    if (data.accountingRecords) {
        localStorage.setItem('accountingRecords', JSON.stringify(data.accountingRecords));
    }
    if (data.categoryBudgets) {
        localStorage.setItem('categoryBudgets', JSON.stringify(data.categoryBudgets));
    }
    if (data.categoryEnabledState) {
        localStorage.setItem('categoryEnabledState', JSON.stringify(data.categoryEnabledState));
    }
    if (data.dailyBudgetTracking) {
        localStorage.setItem('dailyBudgetTracking', JSON.stringify(data.dailyBudgetTracking));
    }
    if (data.customCategories) {
        localStorage.setItem('customCategories', JSON.stringify(data.customCategories));
    }
    if (data.categoryCustomIcons) {
        // 壓縮所有導入的圖標
        console.log('開始壓縮導入的圖標...');
        const compressedIcons = await compressAllIcons(data.categoryCustomIcons);
        const saved = safeSetItem('categoryCustomIcons', compressedIcons);
        if (!saved) {
            alert('還原失敗：圖標數據太大，無法保存。');
            return;
        }
        console.log('✓ 圖標已壓縮並保存');
    }
    if (data.investmentRecords) {
        localStorage.setItem('investmentRecords', JSON.stringify(data.investmentRecords));
    }
    if (data.dcaPlans) {
        localStorage.setItem('dcaPlans', JSON.stringify(data.dcaPlans));
    }
    if (data.installmentRules) {
        localStorage.setItem('installmentRules', JSON.stringify(data.installmentRules));
    }
    if (data.stockCurrentPrices) {
        localStorage.setItem('stockCurrentPrices', JSON.stringify(data.stockCurrentPrices));
    }
    if (data.accounts) {
        localStorage.setItem('accounts', JSON.stringify(data.accounts));
    }
    if (data.imageEmojis) {
        localStorage.setItem('imageEmojis', JSON.stringify(data.imageEmojis));
    }
    if (data.members) {
        localStorage.setItem('members', JSON.stringify(data.members));
    }
    if (data.theme) {
        localStorage.setItem('theme', data.theme);
    }
    if (data.fontSize) {
        localStorage.setItem('fontSize', data.fontSize);
    }
    if (data.customTheme) {
        localStorage.setItem('customTheme', JSON.stringify(data.customTheme));
    }

    alert('資料還原成功！\n頁面將重新載入以顯示最新資料。');
    location.reload();
}

// 數字格式化（含千分位，預設兩位小數）
function formatNumber(value, decimals = 2) {
    if (value === '' || value == null || isNaN(Number(value))) return '--';
    const num = Number(value);
    const opts = { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
    try {
        return num.toLocaleString('zh-TW', opts);
    } catch (_) {
        return num.toFixed(decimals);
    }
}

// 全域常數
const ENABLE_MULTIPLE_PROXY = true;
const REBALANCE_LOG_KEY = 'rebalanceLogs';
const SCHEDULED_BUY_STORAGE_KEY = 'scheduledBuyOrders';

function showAppModal({ title, bodyEl, footerEl, maxWidth = 520 }) {
    let close;
    const promise = new Promise((resolve) => {
        const root = document.createElement('div');
        root.className = 'app-modal-root';

        const overlay = document.createElement('div');
        overlay.className = 'app-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'app-modal';
        modal.style.maxWidth = `${maxWidth}px`;

        const header = document.createElement('div');
        header.className = 'app-modal-header';

        const titleEl = document.createElement('div');
        titleEl.className = 'app-modal-title';
        titleEl.textContent = title || '';

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'app-modal-close';
        closeBtn.textContent = '✕';

        header.appendChild(titleEl);
        header.appendChild(closeBtn);

        const body = document.createElement('div');
        body.className = 'app-modal-body';
        if (bodyEl) body.appendChild(bodyEl);

        const footer = document.createElement('div');
        footer.className = 'app-modal-footer';
        if (footerEl) footer.appendChild(footerEl);

        modal.appendChild(header);
        modal.appendChild(body);
        modal.appendChild(footer);

        close = (v) => {
            try { document.body.removeChild(root); } catch (_) {}
            resolve(v);
        };

        overlay.addEventListener('click', () => close(null));
        closeBtn.addEventListener('click', () => close(null));

        root.appendChild(overlay);
        root.appendChild(modal);
        document.body.appendChild(root);

        setTimeout(() => {
            try { closeBtn.focus(); } catch (_) {}
        }, 0);
    });

    promise.close = (v) => {
        if (typeof close === 'function') close(v);
    };
    return promise;
}

function showAppAlert({ title, message, okText = '確定' }) {
    const pre = document.createElement('pre');
    pre.className = 'app-modal-pre';
    pre.textContent = message || '';

    const okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.className = 'app-modal-btn app-modal-btn--primary';
    okBtn.textContent = okText;

    const footer = document.createElement('div');
    footer.className = 'app-modal-footer-inner';
    footer.appendChild(okBtn);

    const modalPromise = showAppModal({
        title,
        bodyEl: pre,
        footerEl: footer,
        maxWidth: 640
    });
    okBtn.addEventListener('click', () => modalPromise.close(true));
    return modalPromise.then(() => true);
}

function showAssetAllocationModal() {
    const settings = getAssetAllocationSettings();

    const wrap = document.createElement('div');
    wrap.className = 'app-modal-form';

    const mkLabel = (t) => {
        const el = document.createElement('div');
        el.className = 'app-modal-label';
        el.textContent = t;
        return el;
    };

    const row = document.createElement('div');
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1fr 1fr';
    row.style.gap = '10px';

    const stockInput = document.createElement('input');
    stockInput.type = 'number';
    stockInput.inputMode = 'numeric';
    stockInput.step = '1';
    stockInput.min = '0';
    stockInput.max = '100';
    stockInput.className = 'app-modal-input';
    stockInput.value = String(settings.targetStockRatio ?? 80);

    const bondInput = document.createElement('input');
    bondInput.type = 'number';
    bondInput.inputMode = 'numeric';
    bondInput.step = '1';
    bondInput.min = '0';
    bondInput.max = '100';
    bondInput.className = 'app-modal-input';
    bondInput.value = String(settings.targetBondRatio ?? 20);

    row.appendChild(stockInput);
    row.appendChild(bondInput);

    wrap.appendChild(mkLabel('目標股債比（%）：股 / 債'));
    wrap.appendChild(row);

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'app-modal-btn';
    cancelBtn.textContent = '取消';

    const okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.className = 'app-modal-btn app-modal-btn--primary';
    okBtn.textContent = '儲存';

    const footer = document.createElement('div');
    footer.className = 'app-modal-footer-inner';
    footer.appendChild(cancelBtn);
    footer.appendChild(okBtn);

    const modalPromise = showAppModal({
        title: '股債配置',
        bodyEl: wrap,
        footerEl: footer,
        maxWidth: 560
    });

    cancelBtn.addEventListener('click', () => modalPromise.close(false));
    okBtn.addEventListener('click', () => {
        const stock = Math.max(0, Math.min(100, parseFloat(stockInput.value) || 0));
        const bond = Math.max(0, Math.min(100, parseFloat(bondInput.value) || 0));
        saveAssetAllocationSettings({
            ...settings,
            targetStockRatio: stock,
            targetBondRatio: bond
        });
        try {
            fillAllocationInputsFromSettings(getAssetAllocationSettings());
            updateAssetAllocationStatusText();
        } catch (_) {}
        modalPromise.close(true);
    });
}

function showAnnualRebalanceModal() {
    const settings = getAssetAllocationSettings();

    const wrap = document.createElement('div');
    wrap.className = 'app-modal-form';

    const mkLabel = (t) => {
        const el = document.createElement('div');
        el.className = 'app-modal-label';
        el.textContent = t;
        return el;
    };

    const currentRatioEl = document.createElement('div');
    currentRatioEl.className = 'app-modal-label';
    currentRatioEl.style.marginTop = '-4px';
    currentRatioEl.style.fontSize = '12px';
    currentRatioEl.style.fontWeight = '700';
    currentRatioEl.style.opacity = '0.85';
    try {
        const values = computeStockBondMarketValues();
        const T = values.totalValue;
        if (T && T > 0) {
            const stockPct = values.stockValue / T;
            const bondPct = values.bondValue / T;
            currentRatioEl.textContent = `目前股債比：股 ${formatPct(stockPct)} / 債 ${formatPct(bondPct)}`;
        } else {
            currentRatioEl.textContent = '目前股債比：尚無市值資料';
        }
    } catch (_) {
        currentRatioEl.textContent = '目前股債比：--';
    }

    const twoCol = document.createElement('div');
    twoCol.style.display = 'grid';
    twoCol.style.gridTemplateColumns = '1fr auto 1fr';
    twoCol.style.alignItems = 'center';
    twoCol.style.gap = '10px';

    const ratioRow = document.createElement('div');
    ratioRow.style.display = 'grid';
    ratioRow.style.gridTemplateColumns = '1fr auto 1fr';
    ratioRow.style.alignItems = 'center';
    ratioRow.style.gap = '10px';

    const targetStockRatio = document.createElement('input');
    targetStockRatio.type = 'number';
    targetStockRatio.step = '1';
    targetStockRatio.min = '0';
    targetStockRatio.max = '100';
    targetStockRatio.className = 'app-modal-input';
    targetStockRatio.value = String(settings.targetStockRatio ?? 80);

    const ratioSep = document.createElement('div');
    ratioSep.style.opacity = '0.65';
    ratioSep.style.fontWeight = '800';
    ratioSep.textContent = ':';

    const targetBondRatio = document.createElement('input');
    targetBondRatio.type = 'number';
    targetBondRatio.step = '1';
    targetBondRatio.min = '0';
    targetBondRatio.max = '100';
    targetBondRatio.className = 'app-modal-input';
    targetBondRatio.value = String(settings.targetBondRatio ?? 20);

    const monthInput = document.createElement('input');
    monthInput.type = 'number';
    monthInput.step = '1';
    monthInput.min = '1';
    monthInput.max = '12';
    monthInput.className = 'app-modal-input';
    monthInput.value = String(settings.rebalanceMonth ?? 1);

    const dayInput = document.createElement('input');
    dayInput.type = 'number';
    dayInput.step = '1';
    dayInput.min = '1';
    dayInput.max = '28';
    dayInput.className = 'app-modal-input';
    dayInput.value = String(settings.rebalanceDay ?? 1);

    const dateSep = document.createElement('div');
    dateSep.style.opacity = '0.65';
    dateSep.style.fontWeight = '900';
    dateSep.textContent = '/';

    twoCol.appendChild(monthInput);
    twoCol.appendChild(dateSep);
    twoCol.appendChild(dayInput);

    const stockTicker = document.createElement('input');
    stockTicker.type = 'text';
    stockTicker.className = 'app-modal-input';
    stockTicker.value = String(settings.rebalanceStockTicker ?? '0050');

    const bondTicker = document.createElement('input');
    bondTicker.type = 'text';
    bondTicker.className = 'app-modal-input';
    bondTicker.value = String(settings.rebalanceBondTicker ?? '00751B');

    const horizon = document.createElement('input');
    horizon.type = 'number';
    horizon.step = '1';
    horizon.min = '1';
    horizon.max = '60';
    horizon.className = 'app-modal-input';
    horizon.value = String(settings.rebalanceHorizonMonths ?? 12);

    const budget = document.createElement('input');
    budget.type = 'number';
    budget.step = '1';
    budget.min = '0';
    budget.className = 'app-modal-input';
    budget.value = '';
    budget.placeholder = '例如 50000';

    const adviceBox = document.createElement('pre');
    adviceBox.className = 'app-modal-pre';
    adviceBox.style.marginTop = '10px';
    adviceBox.style.whiteSpace = 'pre-wrap';
    adviceBox.textContent = '';

    const persistFromModal = () => {
        const stock = Math.max(0, Math.min(100, parseFloat(targetStockRatio.value) || 0));
        const bond = Math.max(0, Math.min(100, parseFloat(targetBondRatio.value) || 0));
        const month = Math.max(1, Math.min(12, parseInt(monthInput.value, 10) || 1));
        const day = Math.max(1, Math.min(28, parseInt(dayInput.value, 10) || 1));
        const cleanedStock = String(stockTicker.value || '').trim() || settings.rebalanceStockTicker;
        const cleanedBond = String(bondTicker.value || '').trim() || settings.rebalanceBondTicker;
        const cleanedHorizon = Math.max(1, Math.min(60, parseInt(horizon.value, 10) || 12));

        const next = {
            ...settings,
            targetStockRatio: stock,
            targetBondRatio: bond,
            rebalanceMonth: month,
            rebalanceDay: day,
            rebalanceStockTicker: cleanedStock,
            rebalanceBondTicker: cleanedBond,
            rebalanceHorizonMonths: cleanedHorizon
        };
        saveAssetAllocationSettings(next);
        return {
            settings: next,
            budget: Math.max(0, parseFloat(budget.value) || 0)
        };
    };

    ratioRow.appendChild(targetStockRatio);
    ratioRow.appendChild(ratioSep);
    ratioRow.appendChild(targetBondRatio);

    wrap.appendChild(mkLabel('目標股債比（%）'));
    wrap.appendChild(currentRatioEl);
    wrap.appendChild(ratioRow);

    wrap.appendChild(mkLabel('每年檢視日期（月 / 日）'));
    wrap.appendChild(twoCol);
    wrap.appendChild(mkLabel('股票加碼標的（代碼）'));
    wrap.appendChild(stockTicker);
    wrap.appendChild(mkLabel('債券加碼標的（代碼）'));
    wrap.appendChild(bondTicker);
    wrap.appendChild(mkLabel('本次加碼預算（NT$）'));
    wrap.appendChild(budget);

    wrap.appendChild(mkLabel('用幾個月拉回目標'));
    wrap.appendChild(horizon);
    wrap.appendChild(adviceBox);

    // 賣出行動按鈕區（生成建議後動態填入）
    const sellActionContainer = document.createElement('div');
    sellActionContainer.style.display = 'flex';
    sellActionContainer.style.flexDirection = 'column';
    sellActionContainer.style.gap = '8px';
    sellActionContainer.style.marginTop = '8px';
    wrap.appendChild(sellActionContainer);

    const suggestBtn = document.createElement('button');
    suggestBtn.type = 'button';
    suggestBtn.className = 'app-modal-btn app-modal-btn--primary';
    suggestBtn.textContent = '生成建議';

    const applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.className = 'app-modal-btn';
    applyBtn.textContent = '套用到定期定額';

    const footer = document.createElement('div');
    footer.className = 'app-modal-footer-inner app-modal-footer-inner--grid';
    footer.appendChild(suggestBtn);
    footer.appendChild(applyBtn);

    const modalPromise = showAppModal({
        title: '年度再平衡',
        bodyEl: wrap,
        footerEl: footer,
        maxWidth: 560
    });

    suggestBtn.addEventListener('click', () => {
        const persisted = persistFromModal();
        const nextSettings = persisted.settings;
        const budgetValue = persisted.budget;
        const advice = calculateRebalanceAdvice({
            budget: budgetValue,
            horizonMonths: nextSettings.rebalanceHorizonMonths,
            targetStockRatio: nextSettings.targetStockRatio,
            targetBondRatio: nextSettings.targetBondRatio
        });

        const sTicker = nextSettings.rebalanceStockTicker;
        const bTicker = nextSettings.rebalanceBondTicker;

        const lumpStockLine = advice.lumpSum.total > 0
            ? buildBuySuggestionLine({ label: '買股', ticker: sTicker, amount: advice.lumpSum.stock })
            : '未輸入預算';
        const lumpBondLine = advice.lumpSum.total > 0
            ? buildBuySuggestionLine({ label: '買債', ticker: bTicker, amount: advice.lumpSum.bond })
            : '未輸入預算';

        const monthlyStockLine = advice.dca.monthlyTotal > 0
            ? buildBuySuggestionLine({ label: '每月買股', ticker: sTicker, amount: advice.dca.monthlyStock })
            : '目前沒有啟用的定期定額';
        const monthlyBondLine = advice.dca.monthlyTotal > 0
            ? buildBuySuggestionLine({ label: '每月買債', ticker: bTicker, amount: advice.dca.monthlyBond })
            : '目前沒有啟用的定期定額';

        // 賣出再平衡建議
        const rs = advice.rebalanceSell;
        const sellNeeded = rs.sellStock > 100 || rs.sellBond > 100;
        const sellStockLine = rs.sellStock > 100
            ? buildSellSuggestionLine({ label: '賣股', ticker: sTicker, amount: rs.sellStock })
            : null;
        const sellBondLine = rs.sellBond > 100
            ? buildSellSuggestionLine({ label: '賣債', ticker: bTicker, amount: rs.sellBond })
            : null;

        adviceBox.textContent = [
            `目前市值：股票 ${formatNtd(advice.values.stockValue)}／債券 ${formatNtd(advice.values.bondValue)}／合計 ${formatNtd(advice.values.totalValue)}`,
            `目前比例：股 ${formatPct(advice.ratios.currentStockPct)}／債 ${formatPct(advice.ratios.currentBondPct)}`,
            `目標比例：股 ${formatPct(advice.ratios.stockPct)}／債 ${formatPct(advice.ratios.bondPct)}`,
            '',
            `一次性加碼（只買不賣；預算 ${formatNtd(advice.lumpSum.total)}）：`,
            pickDominantAction(advice.lumpSum),
            lumpStockLine,
            lumpBondLine,
            `買完後比例：股 ${formatPct(advice.projections.afterLump.stockPct)}／債 ${formatPct(advice.projections.afterLump.bondPct)}`,
            '',
            `定期定額建議（${advice.dca.months} 個月拉回；以目前啟用總額 ${formatNtd(advice.dca.monthlyTotal)}/月）：`,
            monthlyStockLine,
            monthlyBondLine,
            `跑完 ${advice.dca.months} 個月後比例：股 ${formatPct(advice.projections.afterHorizon.stockPct)}／債 ${formatPct(advice.projections.afterHorizon.bondPct)}`,
            '',
            `────────────────────`,
            `賣出再平衡（不需新增預算，直接賣掉超重的部分）：`,
            sellNeeded
                ? [sellStockLine, sellBondLine].filter(Boolean).join('\n')
                : '目前比例接近目標，無需賣出',
            sellNeeded
                ? `賣出後比例：股 ${formatPct(advice.projections.afterSell.stockPct)}／債 ${formatPct(advice.projections.afterSell.bondPct)}`
                : ''
        ].filter(s => s !== null).join('\n');

        // 清空並重建賣出按鈕
        sellActionContainer.innerHTML = '';
        if (rs.sellStock > 100) {
            const info = getTickerApproxShares(sTicker, rs.sellStock);
            const sharesVal = info ? info.shares : 0;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'app-modal-btn';
            btn.style.background = 'linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%)';
            btn.style.color = 'white';
            btn.textContent = `立即賣出 ${sTicker}（約 ${sharesVal.toLocaleString('zh-TW')} 股）`;
            btn.addEventListener('click', () => {
                modalPromise.close(false);
                openSellPageWithStock(sTicker, sharesVal);
            });
            sellActionContainer.appendChild(btn);
        }
        if (rs.sellBond > 100) {
            const info = getTickerApproxShares(bTicker, rs.sellBond);
            const sharesVal = info ? info.shares : 0;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'app-modal-btn';
            btn.style.background = 'linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%)';
            btn.style.color = 'white';
            btn.textContent = `立即賣出 ${bTicker}（約 ${sharesVal.toLocaleString('zh-TW')} 股）`;
            btn.addEventListener('click', () => {
                modalPromise.close(false);
                openSellPageWithStock(bTicker, sharesVal);
            });
            sellActionContainer.appendChild(btn);
        }
    });

    applyBtn.addEventListener('click', () => {
        const persisted = persistFromModal();
        const nextSettings = persisted.settings;
        const budgetValue = persisted.budget;

        const advice = calculateRebalanceAdvice({
            budget: budgetValue,
            horizonMonths: nextSettings.rebalanceHorizonMonths,
            targetStockRatio: nextSettings.targetStockRatio,
            targetBondRatio: nextSettings.targetBondRatio
        });

        applyRebalanceToDcaPlans({
            monthlyStock: advice.dca.monthlyStock,
            monthlyBond: advice.dca.monthlyBond,
            stockTicker: nextSettings.rebalanceStockTicker,
            bondTicker: nextSettings.rebalanceBondTicker
        });

        modalPromise.close(true);
    });

    modalPromise.then(() => {
        try {
            fillAllocationInputsFromSettings(getAssetAllocationSettings());
            updateAssetAllocationStatusText();
        } catch (_) {}
    });
}

function showAppPromptNumber({ title, label, defaultValue = 0, placeholder = '0', okText = '確定', cancelText = '取消' }) {
    const wrap = document.createElement('div');
    wrap.className = 'app-modal-form';

    const lab = document.createElement('div');
    lab.className = 'app-modal-label';
    lab.textContent = label || '';

    const input = document.createElement('input');
    input.type = 'number';
    input.inputMode = 'decimal';
    input.step = '1';
    input.min = '0';
    input.placeholder = placeholder;
    input.className = 'app-modal-input';
    input.value = (defaultValue != null && defaultValue !== '') ? String(defaultValue) : '';

    wrap.appendChild(lab);
    wrap.appendChild(input);

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'app-modal-btn';
    cancelBtn.textContent = cancelText;

    const okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.className = 'app-modal-btn app-modal-btn--primary';
    okBtn.textContent = okText;

    const footer = document.createElement('div');
    footer.className = 'app-modal-footer-inner';
    footer.appendChild(cancelBtn);
    footer.appendChild(okBtn);

    const modalPromise = showAppModal({ title, bodyEl: wrap, footerEl: footer, maxWidth: 520 });

    const submit = () => {
        const v = parseFloat(String(input.value || '').replace(/,/g, ''));
        modalPromise.close(!isNaN(v) && v >= 0 ? v : null);
    };

    cancelBtn.addEventListener('click', () => modalPromise.close(null));
    okBtn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submit();
        }
    });

    setTimeout(() => {
        try {
            input.focus();
            if (input.value) input.select();
        } catch (_) {}
    }, 0);

    return modalPromise;
}

// 預設雲端備份服務（若使用者尚未設定 Sheet 網址）
if (!localStorage.getItem('googleSheetUploadUrl')) {
    localStorage.setItem('googleSheetUploadUrl', 'https://script.google.com/macros/s/AKfycbw_0TfMTZvO3_qxXTFS5LxqiNEB6k5R3lZhlr9L6fZaiVl3KN2VDD4aX7m-QiMMhBm1/exec');
}

const DEFAULT_CATEGORY_IMAGES = {
    '飲食': './image/13.png',
    '外食 / 飲料': './image/14.png',
    '交通': './image/15.png',
    '住房物業': './image/16.png',
    '水電瓦斯': './image/17.png',
    '網路 / 電信': './image/18.png',
    '購物': './image/19.png',
    '投資理財': './image/19.png',
    '醫療': './image/20.png',
    '薪資': './image/21.png',
    '投資收益': './image/21.png',
    '轉帳': './image/6.png',
    '銀行轉帳': './image/7.png',
    '跨行轉帳': './image/8.png',
    '電子支付轉帳': './image/9.png',
    '帳戶間轉帳': './image/10.png',
    '現金轉帳': './image/11.png',
    '信用卡轉帳': './image/12.png'
};

function getDefaultCategoryImage(categoryName) {
    return DEFAULT_CATEGORY_IMAGES[categoryName] || null;
}

function firstGrapheme(str) {
    if (!str) return '';
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
        const it = seg.segment(str)[Symbol.iterator]();
        const first = it.next().value;
        return first ? first.segment : '';
    }
    return str.trim().slice(0, 2);
}

function formatMonthKey(dateObj) {
    const d = new Date(dateObj);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function parseMonthKey(monthKey) {
    if (!monthKey || typeof monthKey !== 'string') return null;
    const m = monthKey.match(/^(\d{4})-(\d{2})$/);
    if (!m) return null;
    const year = Number(m[1]);
    const monthIndex = Number(m[2]) - 1;
    const d = new Date(year, monthIndex, 1);
    return Number.isNaN(d.getTime()) ? null : d;
}

function getSelectedMonthKey() {
    const stored = localStorage.getItem('selectedMonthKey');
    if (stored && parseMonthKey(stored)) return stored;
    return formatMonthKey(new Date());
}

function setSelectedMonthKey(monthKey) {
    if (!parseMonthKey(monthKey)) return;
    localStorage.setItem('selectedMonthKey', monthKey);
    window.selectedMonthKey = monthKey;
}

function addMonthsToKey(monthKey, delta) {
    const base = parseMonthKey(monthKey) || new Date();
    const d = new Date(base.getFullYear(), base.getMonth() + delta, 1);
    return formatMonthKey(d);
}

function getMonthRangeByKey(monthKey) {
    const base = parseMonthKey(monthKey);
    if (!base) return null;
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
        startDateStr: toISO(start),
        endDateStr: toISO(end)
    };
}

function renderSelectedMonthText() {
    const monthKey = getSelectedMonthKey();
    const summaryMonth = document.getElementById('summaryMonth');
    if (summaryMonth) summaryMonth.textContent = monthKey;
    const chartMonthText = document.getElementById('chartMonthText');
    if (chartMonthText) chartMonthText.textContent = monthKey;
}

function applySelectedMonthToLedgerDateFilters(force = false) {
    if (!force) return;

    const range = getMonthRangeByKey(getSelectedMonthKey());
    if (!range) return;

    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');

    if (filterDateFrom) filterDateFrom.value = range.startDateStr;
    if (filterDateTo) filterDateTo.value = range.endDateStr;
}

function refreshAllForSelectedMonth(forceLedgerDate = false) {
    renderSelectedMonthText();

    const pageLedger = document.getElementById('pageLedger');
    if (pageLedger && pageLedger.style.display !== 'none') {
        applySelectedMonthToLedgerDateFilters(forceLedgerDate);
        if (typeof initLedger === 'function') {
            initLedger();
        }
    }
    const stockBondSummaryEl = document.getElementById('stockBondSummaryValue');
    if (stockBondSummaryEl) {
        const values = computeStockBondMarketValues();
        const totalValue = values.totalValue || 0;
        if (totalValue > 0) {
            const stockPct = values.stockValue / totalValue;
            const bondPct = values.bondValue / totalValue;
            stockBondSummaryEl.textContent = `股 ${formatPct(stockPct)} / 債 ${formatPct(bondPct)}`;
        } else {
            stockBondSummaryEl.textContent = '尚無資料';
        }
    }

    const pageChart = document.getElementById('pageChart');
    if (pageChart && pageChart.style.display !== 'none') {
        if (typeof updateAllCharts === 'function') {
            updateAllCharts();
        }
    }
}

let quoteProxyAvailability = {
    reachable: null,
    lastFailedAt: 0,
    alertedAt: 0
};

// 用於補抓昨收價時的去重集合，避免重複呼叫
const pendingPrevCloseFetch = new Set();

// 簡易代理冷卻：若 429/403 過載，暫停使用該代理一段時間
const proxyCooldowns = {};
const PROXY_COOLDOWN_MS = 5 * 60 * 1000;
// 每檔昨收拉取冷卻，避免短時間重複打同一檔造成風險：5 分鐘
const prevCloseAttemptAt = {};
const PREV_CLOSE_COOLDOWN_MS = 5 * 60 * 1000;

const publicQuoteProxies = [
    // 新的可用代理服務
    'https://api.codetabs.com/v1/proxy/?quest=',
    'https://corsproxy.io/?',
    // cors-anywhere.herokuapp.com 已經不可用，完全移除
    // 暫時移除 r.jina.ai (503 錯誤)
    // 'https://r.jina.ai/http://',
];

function isProxyInCooldown(proxyBase) {
    if (!proxyCooldowns[proxyBase]) return false;
    return Date.now() - proxyCooldowns[proxyBase] < PROXY_COOLDOWN_MS;
}

function markProxyRateLimited(proxyBase) {
    proxyCooldowns[proxyBase] = Date.now();
}

function shuffleProxies() {
    return [...publicQuoteProxies].sort(() => Math.random() - 0.5);
}

// 嘗試直接從臺灣交易所/櫃買中心 MIS 取昨收（y），降低對 Yahoo 依賴
async function fetchPrevCloseFromTwseOtc(stockCode) {
    try {
        const isOtc = (stockCode.endsWith('B') || stockCode.endsWith('L') || stockCode.endsWith('R') || stockCode.endsWith('U') || stockCode.endsWith('K'));
        const exchange = isOtc ? 'otc' : 'tse';
        const exCh = `${exchange}_${stockCode.toUpperCase()}.tw`;
        const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${exCh}`;
        const shuffledProxies = shuffleProxies();
        for (const proxyBase of shuffledProxies) {
            if (isProxyInCooldown(proxyBase)) continue;
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                let finalUrl;
                if (proxyBase.includes('corsproxy.io')) {
                    finalUrl = `${proxyBase}${encodeURIComponent(url)}`;
                } else {
                    // codetabs.com 和其他代理
                    finalUrl = `${proxyBase}${encodeURIComponent(url)}`;
                }
                const resp = await fetch(finalUrl, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (!resp) continue;
                if (resp.status === 429 || resp.status === 403) {
                    markProxyRateLimited(proxyBase);
                    continue;
                }
                if (!resp.ok) continue;
                const text = await resp.text();
                let raw = text;
                try {
                    const wrapped = JSON.parse(text);
                    if (wrapped && typeof wrapped === 'object' && typeof wrapped.contents === 'string') {
                        raw = wrapped.contents;
                    }
                } catch (_) {}
                const data = JSON.parse(raw);
                const yVal = data?.msgArray?.[0]?.y ? Number(data.msgArray[0].y) : null;
                if (yVal && yVal > 0) {
                    return yVal;
                }
            } catch (_) {
                continue;
            }
        }
    } catch (_) {
        return null;
    }
    return null;
}

// 補抓昨收價：僅抓 previousClose，避免畫面顯示 --。具備簡單去重。
async function fetchPreviousCloseOnly(stockCode) {
    if (!stockCode || pendingPrevCloseFetch.has(stockCode)) return null;
    const lastAttempt = prevCloseAttemptAt[stockCode];
    if (lastAttempt && Date.now() - lastAttempt < PREV_CLOSE_COOLDOWN_MS) return null;
    prevCloseAttemptAt[stockCode] = Date.now();
    pendingPrevCloseFetch.add(stockCode);
    try {
        // 先嘗試 TWSE/OTC 來源（不依賴 Yahoo）
        const twPrev = await fetchPrevCloseFromTwseOtc(stockCode);
        if (twPrev && twPrev > 0) {
            saveStockPreviousClosePrice(stockCode, twPrev);
            return twPrev;
        }

        let yahooSymbol;
        if (stockCode.endsWith('B') || stockCode.endsWith('L') || stockCode.endsWith('R') || stockCode.endsWith('U') || stockCode.endsWith('K')) {
            yahooSymbol = `${stockCode}.TWO`;
        } else if (stockCode.startsWith('A0')) {
            return null;
        } else {
            yahooSymbol = `${stockCode}.TW`;
        }

        const symbolCandidates = (stockCode.endsWith('B') || stockCode.endsWith('L') || stockCode.endsWith('R') || stockCode.endsWith('U') || stockCode.endsWith('K'))
            ? [`${stockCode}.TWO`, `${stockCode}.TW`]
            : [yahooSymbol];

        // 隨機化代理順序，分散同一來源的速率限制
        const shuffledProxies = shuffleProxies();

        for (const candidateSymbol of symbolCandidates) {
            // 1) chart API（優先）
            const yahooChartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${candidateSymbol}?interval=1d&range=1d`;
            for (const proxyBase of shuffledProxies) {
                if (isProxyInCooldown(proxyBase)) continue;
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 8000);
                    let finalUrl;
                    if (proxyBase.includes('corsproxy.io')) {
                        finalUrl = `${proxyBase}${encodeURIComponent(yahooChartUrl)}`;
                    } else {
                        // codetabs.com 和其他代理
                        finalUrl = `${proxyBase}${encodeURIComponent(yahooChartUrl)}`;
                    }
                    const resp = await fetch(finalUrl, { signal: controller.signal });
                    clearTimeout(timeoutId);
                    if (!resp) continue;
                    if (resp.status === 429 || resp.status === 403) {
                        markProxyRateLimited(proxyBase);
                        continue;
                    }
                    if (!resp.ok) continue;
                    const text = await resp.text();
                    let raw = text;
                    try {
                        const wrapped = JSON.parse(text);
                        if (wrapped && typeof wrapped === 'object' && typeof wrapped.contents === 'string') {
                            raw = wrapped.contents;
                        }
                    } catch (_) {}
                    const firstBrace = raw.indexOf('{');
                    if (firstBrace > 0) raw = raw.slice(firstBrace);
                    const data = JSON.parse(raw);
                    const result = data?.chart?.result?.[0];
                    const prev = result?.meta?.previousClose || result?.meta?.regularMarketPreviousClose || null;
                    if (prev && prev > 0) {
                        saveStockPreviousClosePrice(stockCode, prev);
                        return prev;
                    }
                } catch (_) {
                    continue;
                }
            }

            // 2) quote API 作為備援：regularMarketPreviousClose
            const yahooQuoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${candidateSymbol}`;
            for (const proxyBase of shuffledProxies) {
                if (isProxyInCooldown(proxyBase)) continue;
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 8000);
                    let finalUrl;
                    if (proxyBase.includes('corsproxy.io')) {
                        finalUrl = `${proxyBase}${encodeURIComponent(yahooQuoteUrl)}`;
                    } else {
                        // codetabs.com 和其他代理
                        finalUrl = `${proxyBase}${encodeURIComponent(yahooQuoteUrl)}`;
                    }
                    const resp = await fetch(finalUrl, { signal: controller.signal });
                    clearTimeout(timeoutId);
                    if (!resp) continue;
                    if (resp.status === 429 || resp.status === 403) {
                        markProxyRateLimited(proxyBase);
                        continue;
                    }
                    if (!resp.ok) continue;
                    const text = await resp.text();
                    let raw = text;
                    try {
                        const wrapped = JSON.parse(text);
                        if (wrapped && typeof wrapped === 'object' && typeof wrapped.contents === 'string') {
                            raw = wrapped.contents;
                        }
                    } catch (_) {}
                    const data = JSON.parse(raw);
                    const prev = data?.quoteResponse?.result?.[0]?.regularMarketPreviousClose || null;
                    if (prev && prev > 0) {
                        saveStockPreviousClosePrice(stockCode, prev);
                        return prev;
                    }
                } catch (_) {
                    continue;
                }
            }
        }
        return null;
    } finally {
        pendingPrevCloseFetch.delete(stockCode);
    }
}

function isLocalQuoteProxyInCooldown() {
    if (quoteProxyAvailability.reachable !== false) return false;
    const now = Date.now();
    return now - (quoteProxyAvailability.lastFailedAt || 0) < 5 * 60 * 1000;
}

function markQuoteProxyFailed() {
    quoteProxyAvailability.reachable = false;
    quoteProxyAvailability.lastFailedAt = Date.now();
}

function maybeAlertQuoteProxyDown() {
    const now = Date.now();
    if (now - (quoteProxyAvailability.alertedAt || 0) < 5 * 60 * 1000) return;
    quoteProxyAvailability.alertedAt = now;

    alert('目前無法連線到本機股價代理（localhost:5000）。\n\n系統將改用公開 CORS 代理抓取 Yahoo Finance（可能較慢或偶爾失敗）。');
}

async function fetchYahooChartViaPublicProxies(yahooUrl, stockCode) {
    for (const proxyBase of publicQuoteProxies) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            try {
                let finalUrl;
                if (proxyBase.includes('corsproxy.io')) {
                    finalUrl = `${proxyBase}${encodeURIComponent(yahooUrl)}`;
                } else {
                    // codetabs.com 和其他代理
                    finalUrl = `${proxyBase}${encodeURIComponent(yahooUrl)}`;
                }

                const resp = await fetch(finalUrl, { signal: controller.signal });
                if (!resp || !resp.ok) continue;

                const text = await resp.text();
                let raw = text;

                // Some proxies return JSON wrapper
                try {
                    const wrapped = JSON.parse(text);
                    if (wrapped && typeof wrapped === 'object' && typeof wrapped.contents === 'string') {
                        raw = wrapped.contents;
                    }
                } catch (_) {}

                // 
                const firstBrace = raw.indexOf('{');
                if (firstBrace > 0) raw = raw.slice(firstBrace);

                const data = JSON.parse(raw);
                if (data && data.chart && data.chart.result && data.chart.result.length > 0) {
                    const result = data.chart.result[0];
                    if (result && result.meta) {
                        const previousClose = result.meta.previousClose || result.meta.regularMarketPreviousClose || null;
                        if (stockCode && previousClose && previousClose > 0) {
                            saveStockPreviousClosePrice(stockCode, previousClose);
                        }

                        const currentPrice = result.meta.regularMarketPrice || previousClose || null;
                        if (currentPrice && currentPrice > 0) return currentPrice;
                    }
                }
            } finally {
                clearTimeout(timeoutId);
            }
        } catch (_) {
            continue;
        }
    }
    return null;
}

function getStockPreviousClosePrice(stockCode) {
    const previousCloses = JSON.parse(localStorage.getItem('stockPreviousClosePrices') || '{}');
    const prevData = previousCloses[stockCode];

    if (!prevData) return null;

    if (typeof prevData === 'number') return prevData;
    if (prevData && typeof prevData === 'object' && typeof prevData.price === 'number') {
        return prevData.price;
    }
    return null;
}

function initMonthSwitchers() {
    const ledgerPrev = document.getElementById('ledgerPrevMonthBtn');
    const ledgerNext = document.getElementById('ledgerNextMonthBtn');
    const chartPrev = document.getElementById('chartPrevMonthBtn');
    const chartNext = document.getElementById('chartNextMonthBtn');

    const bind = (btn, delta) => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            const nextKey = addMonthsToKey(getSelectedMonthKey(), delta);
            setSelectedMonthKey(nextKey);
            refreshAllForSelectedMonth(true);
        });
    };

    bind(ledgerPrev, -1);
    bind(ledgerNext, 1);
    bind(chartPrev, -1);
    bind(chartNext, 1);

    renderSelectedMonthText();
}

// 播放點擊音效（完全延遲加載，只在需要時創建）
function playClickSound() {
    // 如果之前加載失敗，直接返回（完全禁用音效）
    if (audioFailed.click) {
        return;
    }
    
    // 如果音頻未創建，現在創建（延遲加載）
    if (!clickAudio) {
        try {
            // 使用相對路徑
            const audio = new Audio('./music/mouse-click-7-411633.mp3');
            audio.volume = 0.3;
            audio.preload = 'none'; // 不預加載
            
            // 設置錯誤處理，一旦失敗就永久禁用
            const errorHandler = (e) => {
                e.stopPropagation(); // 阻止錯誤冒泡
                e.preventDefault(); // 阻止默認行為
                audioFailed.click = true; // 永久標記為失敗
                clickAudio = null;
            };
            audio.addEventListener('error', errorHandler, { once: true, capture: true });
            
            clickAudio = audio;
        } catch (error) {
            // 靜默處理初始化錯誤，永久禁用
            audioFailed.click = true;
            clickAudio = null;
            return;
        }
    }
    
    // 嘗試播放
    try {
        if (!clickAudio || audioFailed.click) return;
        
        // 如果音頻已加載，重置播放位置
        if (clickAudio.readyState >= 2) {
            clickAudio.currentTime = 0;
        }
        
        const playPromise = clickAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch((err) => {
                // 播放失敗時，標記為永久失敗
                audioFailed.click = true;
                clickAudio = null;
            });
        }
    } catch (error) {
        // 靜默處理錯誤，永久禁用
        audioFailed.click = true;
        clickAudio = null;
    }
}

// 播放入帳音效（收入、股息）（完全延遲加載，只在需要時創建）
function playIncomeSound() {
    // 如果之前加載失敗，直接返回（完全禁用音效）
    if (audioFailed.income) {
        return;
    }
    
    // 如果音頻未創建，現在創建（延遲加載）
    if (!incomeAudio) {
        try {
            // 使用相對路徑
            const audio = new Audio('./music/coin-collision-sound-342335.mp3');
            audio.volume = 0.4;
            audio.preload = 'none'; // 不預加載
            
            // 設置錯誤處理，一旦失敗就永久禁用
            const errorHandler = (e) => {
                e.stopPropagation(); // 阻止錯誤冒泡
                e.preventDefault(); // 阻止默認行為
                audioFailed.income = true; // 永久標記為失敗
                incomeAudio = null;
            };
            audio.addEventListener('error', errorHandler, { once: true, capture: true });
            
            incomeAudio = audio;
        } catch (error) {
            // 靜默處理初始化錯誤，永久禁用
            audioFailed.income = true;
            incomeAudio = null;
            return;
        }
    }
    
    // 嘗試播放
    try {
        if (!incomeAudio || audioFailed.income) return;
        
        // 如果音頻已加載，重置播放位置
        if (incomeAudio.readyState >= 2) {
            incomeAudio.currentTime = 0;
        }
        
        const playPromise = incomeAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch((err) => {
                // 播放失敗時，標記為永久失敗
                audioFailed.income = true;
                incomeAudio = null;
            });
        }
    } catch (error) {
        // 靜默處理錯誤，永久禁用
        audioFailed.income = true;
        incomeAudio = null;
    }
}

// ========== 記帳分類功能 ==========
// 注意：分類數據和基本函數已移至 js/categories.js 模組
// 以下函數依賴於模組中的 allCategories, recommendedCategories 等變數

// 檢查模組是否正確載入
if (typeof allCategories === 'undefined') {
    console.error('錯誤：allCategories 未定義！請確保 js/categories.js 模組已正確載入。');
}
if (typeof recommendedCategories === 'undefined') {
    console.error('錯誤：recommendedCategories 未定義！請確保 js/categories.js 模組已正確載入。');
}
if (typeof loadCustomCategories === 'undefined') {
    console.error('錯誤：loadCustomCategories 函數未定義！請確保 js/categories.js 模組已正確載入。');
}

// 為自訂分類添加長按和右鍵刪除功能
function addCustomCategoryDeleteEvents(categoryItem, categoryName, categoryType) {
    let longPressTimer = null;
    let isLongPress = false;
    
    // 手機長按刪除
    categoryItem.addEventListener('touchstart', (e) => {
        isLongPress = false;
        longPressTimer = setTimeout(() => {
            isLongPress = true;
            // 震動反饋（如果設備支持）
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            // 視覺反饋
            const originalTransform = categoryItem.style.transform;
            const originalBackground = categoryItem.style.background;
            categoryItem.style.transform = 'scale(0.95)';
            categoryItem.style.background = 'var(--bg-danger)';
            
            // 確認刪除
            if (confirm(`確定要刪除自訂分類「${categoryName}」嗎？\n\n此操作無法復原。`)) {
                deleteCustomCategory(categoryName, categoryType);
            } else {
                // 恢復樣式
                setTimeout(() => {
                    categoryItem.style.transform = originalTransform;
                    categoryItem.style.background = originalBackground;
                }, 200);
            }
        }, 500); // 500ms 長按觸發
    });
    
    categoryItem.addEventListener('touchend', (e) => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
        }
        // 如果是長按，阻止點擊事件
        if (isLongPress) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
    
    categoryItem.addEventListener('touchmove', () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    });
    
    // 滑鼠右鍵刪除
    categoryItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // 視覺反饋
        const originalTransform = categoryItem.style.transform;
        const originalBackground = categoryItem.style.background;
        categoryItem.style.transform = 'scale(0.95)';
        categoryItem.style.background = '#ffebee';
        
        // 確認刪除
        if (confirm(`確定要刪除自訂分類「${categoryName}」嗎？\n\n此操作無法復原。`)) {
            deleteCustomCategory(categoryName, categoryType);
        } else {
            // 恢復樣式
            setTimeout(() => {
                categoryItem.style.transform = originalTransform;
                categoryItem.style.background = originalBackground;
            }, 200);
        }
    });
}

// 初始化分類網格（顯示所有分類，不分類型）
function initCategoryGrid(tabType = 'recommended', recordType = null) {
    const categoryGrid = document.getElementById('categoryGrid');
    if (!categoryGrid) {
        console.error('找不到 categoryGrid 元素');
        return;
    }
    
    // 載入自定義分類
    loadCustomCategories();
    
    console.log('總分類數量:', allCategories.length);
    console.log('支出分類:', allCategories.filter(c => c.type === 'expense').length);
    console.log('收入分類:', allCategories.filter(c => c.type === 'income').length);
    console.log('轉帳分類:', allCategories.filter(c => c.type === 'transfer').length);
    
    // 獲取所有啟用的分類（不分類型）
    const enabledCategories = getEnabledCategories(null); // 傳入 null 表示不過濾類型
    
    console.log('啟用的分類數量:', enabledCategories.length);
    
    let categoriesToShow = [];
    
    if (tabType === 'recommended') {
        // 推薦：按類型分組顯示（支出、收入、轉帳），自定義分類歸類在一起
        // 這裡不設置 categoriesToShow，而是直接渲染分組
        categoryGrid.innerHTML = '';
        
        // 獲取自定義分類
        const savedCustomCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
        
        // 按類型分組：支出、收入、轉帳
        const typeGroups = {
            'expense': { label: '📤 支出', icon: '📤', color: '#ff6b6b' },
            'income': { label: '💰 收入', icon: '💰', color: '#51cf66' },
            'transfer': { label: '🔄 轉帳', icon: '🔄', color: '#4dabf7' }
        };
        
        ['expense', 'income', 'transfer'].forEach(type => {
            // 獲取該類型的自定義分類（只顯示啟用的）- 優先顯示
            const customCats = savedCustomCategories.filter(cat => {
                if (cat.type !== type) return false;
                const enabledCat = enabledCategories.find(ec => ec.name === cat.name && ec.type === cat.type);
                return enabledCat !== undefined;
            });
            
            // 獲取該類型的推薦分類（只顯示啟用的）
            const recommended = (recommendedCategories[type] || []).filter(cat => {
            const enabledCat = enabledCategories.find(ec => ec.name === cat.name && ec.type === cat.type);
            return enabledCat !== undefined;
        });
        
            // 合併分類：自定義分類優先，然後是推薦分類
            const typeCategories = [...customCats, ...recommended];
            
            // 如果該類型分類不足，補充其他啟用的同類型分類（排除已顯示的自定義和推薦分類）
            if (typeCategories.length < 8) {
            const remaining = enabledCategories.filter(cat => 
                    cat.type === type && 
                    !typeCategories.some(tc => tc.name === cat.name && tc.type === cat.type)
                );
                typeCategories.push(...remaining.slice(0, 8 - typeCategories.length));
            }
            
            // 如果該類型有分類，顯示類型標題和分類
            if (typeCategories.length > 0) {
                const groupHeader = document.createElement('div');
                groupHeader.className = 'category-group-header recommended-group-header';
                groupHeader.setAttribute('data-type', type);
                groupHeader.innerHTML = `
                    <div class="group-header-icon">${typeGroups[type].icon}</div>
                    <div class="group-header-label">${typeGroups[type].label}</div>
                    <div class="group-header-count">${typeCategories.length}</div>
                `;
                categoryGrid.appendChild(groupHeader);
                
                // 獲取自定義圖標
                const customIcons = JSON.parse(localStorage.getItem('categoryCustomIcons') || '{}');
                const savedCustomCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
                
                // 渲染該類型的分類
                typeCategories.forEach((category, index) => {
                    const categoryItem = document.createElement('div');
                    categoryItem.className = 'category-item recommended-category-item';
                    categoryItem.dataset.category = category.name;
                    categoryItem.dataset.index = index;
                    categoryItem.setAttribute('data-category-type', type);
                    
                    // 檢查是否有自定義圖片圖標
                    const customIconValue = customIcons[category.name]?.value;
                    const hasCustomIcon = customIcons[category.name] && customIcons[category.name].type === 'image' && isLikelyImageSrc(customIconValue);
                    
                    // 檢查是否為自定義分類
                    const isCustomCategory = savedCustomCategories.some(cat => cat.name === category.name && cat.type === category.type);
                    
                    // 類型標籤圖標（小圖標）
                    const typeIcon = category.type === 'expense' ? '📤' : category.type === 'income' ? '💰' : '🔄';
                    const typeColor = category.type === 'expense' ? '#ff6b6b' : category.type === 'income' ? '#51cf66' : '#4dabf7';
                    
                    // 建立圖標 HTML
                    let iconHtml;
                    if (hasCustomIcon) {
                        iconHtml = `
                            <div class="category-icon-wrapper custom-icon-wrapper">
                                <img src="${customIconValue}" alt="${category.name}" class="category-icon-image" onerror="this.outerHTML='<span class=&quot;category-icon&quot;>' + (this.getAttribute(&quot;data-fallback&quot;) || '📦') + '</span>'" data-fallback="${category.icon || '📦'}">
                                <span class="custom-icon-badge">✨</span>
                            </div>
                        `;
                    } else {
                        iconHtml = `<span class="category-icon">${category.icon || '📦'}</span>`;
                    }
                    
                    categoryItem.innerHTML = `
                        ${iconHtml}
                        <span class="category-name">${category.name}</span>
                        <span class="category-type-badge" style="position: absolute; top: 4px; right: 4px; font-size: 10px; padding: 2px 4px; background: ${typeColor}20; border: 1px solid ${typeColor}50; border-radius: 6px; color: ${typeColor}; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; z-index: 5; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <span style="font-size: 10px;">${typeIcon}</span>
                        </span>
                    `;
                    
                    // 設置自訂分類的提示屬性
                    if (isCustomCategory) {
                        categoryItem.setAttribute('title', '長按或右鍵刪除');
                        categoryItem.style.position = 'relative';
                    }
                    
                    // 綁定點擊事件
                    categoryItem.addEventListener('click', () => {
                        // 移除其他選中狀態
                        document.querySelectorAll('.category-item').forEach(item => {
                            item.classList.remove('selected');
                        });
                        
                        // 添加選中狀態
                        categoryItem.classList.add('selected');
                        
                        // 保存選中的分類
                        window.selectedCategory = category.name;
                        
                        // 根據選中的分類類型，自動更新 accountingType
                        window.accountingType = category.type;
                        
                        // 更新 header 標籤的 active 狀態
                        document.querySelectorAll('.header-tab').forEach(tab => {
                            if (tab.dataset.type === category.type) {
                                tab.classList.add('active');
                            } else {
                                tab.classList.remove('active');
                            }
                        });
                    });
                    
                    // 為自訂分類添加長按和右鍵刪除
                    if (isCustomCategory) {
                        addCustomCategoryDeleteEvents(categoryItem, category.name, category.type);
                    }
                    
                    categoryGrid.appendChild(categoryItem);
                });
            }
        });
        
        return; // 提前返回，不執行後續的統一渲染邏輯
    } else if (tabType === 'ungrouped') {
        // 全部：按類型分組顯示所有啟用的分類
        categoryGrid.innerHTML = '';
        
        // 獲取自定義分類
        const savedCustomCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
        
        // 按類型分組：支出、收入、轉帳
        const typeGroups = {
            'expense': { label: '📤 支出', icon: '📤', color: '#ff6b6b' },
            'income': { label: '💰 收入', icon: '💰', color: '#51cf66' },
            'transfer': { label: '🔄 轉帳', icon: '🔄', color: '#4dabf7' }
        };
        
        ['expense', 'income', 'transfer'].forEach(type => {
            // 獲取該類型的所有啟用分類（按名稱排序）
            const typeCategories = enabledCategories
                .filter(cat => cat.type === type)
                .sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'));
            
            // 如果該類型有分類，顯示類型標題和分類
            if (typeCategories.length > 0) {
                const groupHeader = document.createElement('div');
                groupHeader.className = 'category-group-header recommended-group-header';
                groupHeader.setAttribute('data-type', type);
                groupHeader.innerHTML = `
                    <div class="group-header-icon">${typeGroups[type].icon}</div>
                    <div class="group-header-label">${typeGroups[type].label}</div>
                    <div class="group-header-count">${typeCategories.length}</div>
                `;
                categoryGrid.appendChild(groupHeader);
                
                // 獲取自定義圖標
                const customIcons = JSON.parse(localStorage.getItem('categoryCustomIcons') || '{}');
                
                // 渲染該類型的所有分類
                typeCategories.forEach((category, index) => {
                    const categoryItem = document.createElement('div');
                    categoryItem.className = 'category-item recommended-category-item';
                    categoryItem.dataset.category = category.name;
                    categoryItem.dataset.index = index;
                    categoryItem.setAttribute('data-category-type', type);
                    
                    // 檢查是否有自定義圖片圖標
                    const hasCustomIcon = customIcons[category.name] && customIcons[category.name].type === 'image';
                    
                    // 檢查是否為自定義分類
                    const isCustomCategory = savedCustomCategories.some(cat => cat.name === category.name && cat.type === category.type);
                    
                    // 類型標籤圖標（小圖標）
                    const typeIcon = category.type === 'expense' ? '📤' : category.type === 'income' ? '💰' : '🔄';
                    const typeColor = category.type === 'expense' ? '#ff6b6b' : category.type === 'income' ? '#51cf66' : '#4dabf7';
                    
                    // 建立圖標 HTML
                    let iconHtml;
                    iconHtml = `<span class="category-icon">${category.icon || '📦'}</span>`;
                    
                    categoryItem.innerHTML = `
                        ${iconHtml}
                        <span class="category-name">${category.name}</span>
                        <span class="category-type-badge" style="position: absolute; top: 4px; right: 4px; font-size: 10px; padding: 2px 4px; background: ${typeColor}20; border: 1px solid ${typeColor}50; border-radius: 6px; color: ${typeColor}; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; z-index: 5; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <span style="font-size: 10px;">${typeIcon}</span>
                        </span>
                    `;
                    
                    // 設置自訂分類的提示屬性
                    if (isCustomCategory) {
                        categoryItem.setAttribute('title', '長按或右鍵刪除');
                        categoryItem.style.position = 'relative';
                    }
                    
                    // 綁定點擊事件
                    categoryItem.addEventListener('click', () => {
                        // 移除其他選中狀態
                        document.querySelectorAll('.category-item').forEach(item => {
                            item.classList.remove('selected');
                        });
                        
                        // 添加選中狀態
                        categoryItem.classList.add('selected');
                        
                        // 保存選中的分類
                        window.selectedCategory = category.name;
                        
                        // 根據選中的分類類型，自動更新 accountingType
                        window.accountingType = category.type;
                        
                        // 更新 header 標籤的 active 狀態
                        document.querySelectorAll('.header-tab').forEach(tab => {
                            if (tab.dataset.type === category.type) {
                                tab.classList.add('active');
                            } else {
                                tab.classList.remove('active');
                            }
                        });
                    });
                    
                    // 為自訂分類添加長按和右鍵刪除
                    if (isCustomCategory) {
                        addCustomCategoryDeleteEvents(categoryItem, category.name, category.type);
                    }
                    
                    categoryGrid.appendChild(categoryItem);
                });
            }
        });
        
        return; // 提前返回，不執行後續的統一渲染邏輯
    } else if (tabType === 'more') {
        // 更多：按類型分組顯示所有分類，並添加新增分類按鈕
    categoryGrid.innerHTML = '';
    
        // 先添加新增分類按鈕
        const addCategoryItem = document.createElement('div');
        addCategoryItem.className = 'category-item add-category-item';
        addCategoryItem.style.cssText = 'background: var(--bg-light-gradient); border: 2px dashed var(--color-primary); cursor: pointer;';
        
        addCategoryItem.innerHTML = `
            <span class="category-icon" style="font-size: 32px;">➕</span>
            <span class="category-name" style="color: var(--color-primary); font-weight: 600;">新增分類</span>
        `;
        
        addCategoryItem.addEventListener('click', () => {
            // 顯示新增分類對話框，默認類型為當前的 accountingType
            const currentType = window.accountingType || 'expense';
            showAddCategoryDialog(currentType);
        });
        
        categoryGrid.appendChild(addCategoryItem);
        
        // 獲取自定義分類
        const savedCustomCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
        
        // 按類型分組：支出、收入、轉帳
        const typeGroups = {
            'expense': { label: '📤 支出', icon: '📤', color: '#ff6b6b' },
            'income': { label: '💰 收入', icon: '💰', color: '#51cf66' },
            'transfer': { label: '🔄 轉帳', icon: '🔄', color: '#4dabf7' }
        };
        
        ['expense', 'income', 'transfer'].forEach(type => {
            // 獲取該類型的所有啟用分類（按名稱排序）
            const typeCategories = enabledCategories
                .filter(cat => cat.type === type)
                .sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'));
            
            // 如果該類型有分類，顯示類型標題和分類
            if (typeCategories.length > 0) {
                const groupHeader = document.createElement('div');
                groupHeader.className = 'category-group-header recommended-group-header';
                groupHeader.setAttribute('data-type', type);
                groupHeader.innerHTML = `
                    <div class="group-header-icon">${typeGroups[type].icon}</div>
                    <div class="group-header-label">${typeGroups[type].label}</div>
                    <div class="group-header-count">${typeCategories.length}</div>
                `;
                categoryGrid.appendChild(groupHeader);
                
                // 獲取自定義圖標
                const customIcons = JSON.parse(localStorage.getItem('categoryCustomIcons') || '{}');
                
                // 渲染該類型的所有分類
                typeCategories.forEach((category, index) => {
                    const categoryItem = document.createElement('div');
                    categoryItem.className = 'category-item recommended-category-item';
                    categoryItem.dataset.category = category.name;
                    categoryItem.dataset.index = index;
                    categoryItem.setAttribute('data-category-type', type);
                    
                    // 檢查是否有自定義圖片圖標
                    const hasCustomIcon = customIcons[category.name] && customIcons[category.name].type === 'image';
                    
                    // 檢查是否為自定義分類
                    const isCustomCategory = savedCustomCategories.some(cat => cat.name === category.name && cat.type === category.type);
                    
                    // 類型標籤圖標（小圖標）
                    const typeIcon = category.type === 'expense' ? '📤' : category.type === 'income' ? '💰' : '🔄';
                    const typeColor = category.type === 'expense' ? '#ff6b6b' : category.type === 'income' ? '#51cf66' : '#4dabf7';
                    
                    // 建立圖標 HTML
                    let iconHtml;
                    iconHtml = `<span class="category-icon">${category.icon || '📦'}</span>`;
                    
                    categoryItem.innerHTML = `
                        ${iconHtml}
                        <span class="category-name">${category.name}</span>
                        <span class="category-type-badge" style="position: absolute; top: 4px; right: 4px; font-size: 10px; padding: 2px 4px; background: ${typeColor}20; border: 1px solid ${typeColor}50; border-radius: 6px; color: ${typeColor}; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; z-index: 5; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <span style="font-size: 10px;">${typeIcon}</span>
                        </span>
                    `;
                    
                    // 設置自訂分類的提示屬性
                    if (isCustomCategory) {
                        categoryItem.setAttribute('title', '長按或右鍵刪除');
                        categoryItem.style.position = 'relative';
                    }
                    
                    // 綁定點擊事件
                    categoryItem.addEventListener('click', () => {
                        // 移除其他選中狀態
                        document.querySelectorAll('.category-item').forEach(item => {
                            item.classList.remove('selected');
                        });
                        
                        // 添加選中狀態
                        categoryItem.classList.add('selected');
                        
                        // 保存選中的分類
                        window.selectedCategory = category.name;
                        
                        // 根據選中的分類類型，自動更新 accountingType
                        window.accountingType = category.type;
                        
                        // 更新 header 標籤的 active 狀態
                        document.querySelectorAll('.header-tab').forEach(tab => {
                            if (tab.dataset.type === category.type) {
                                tab.classList.add('active');
                            } else {
                                tab.classList.remove('active');
                            }
                        });
                    });
                    
                    // 為自訂分類添加長按和右鍵刪除
                    if (isCustomCategory) {
                        addCustomCategoryDeleteEvents(categoryItem, category.name, category.type);
                    }
                    
                    categoryGrid.appendChild(categoryItem);
                });
            }
        });
        
        return; // 提前返回，不執行後續的統一渲染邏輯
    }
    
    console.log('要顯示的分類數量:', categoriesToShow.length);
    console.log('要顯示的分類:', categoriesToShow.map(c => `${c.name}(${c.type})`).join(', '));
    
    categoryGrid.innerHTML = '';
    
    // 獲取自定義圖標（只獲取一次，避免每次迴圈都解析）
    const customIcons = JSON.parse(localStorage.getItem('categoryCustomIcons') || '{}');
    console.log('📷 自定義圖標數量:', Object.keys(customIcons).length);
    console.log('📷 自定義圖標列表:', Object.keys(customIcons));
    
    categoriesToShow.forEach((category, index) => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.dataset.category = category.name;
        categoryItem.dataset.index = index;
        
        // 檢查是否有自定義圖片圖標
        const customIconValue = customIcons[category.name]?.value;
        const hasCustomIcon = customIcons[category.name] && customIcons[category.name].type === 'image' && isLikelyImageSrc(customIconValue);

        if (hasCustomIcon) {
            console.log('✓ 分類「' + category.name + '」有自定義圖片圖示，但輸入頁已統一使用 Emoji 顯示');
        } else {
            console.log('  分類「' + category.name + '」使用 Emoji:', category.icon);
        }
        
        // ...
        
        // 類型標籤圖標（小圖標）
        const typeIcon = category.type === 'expense' ? '📤' : category.type === 'income' ? '💰' : '🔄';
        const typeColor = category.type === 'expense' ? '#ff6b6b' : category.type === 'income' ? '#51cf66' : '#4dabf7';
        
        // 建立圖標 HTML
        let iconHtml;
        if (hasCustomIcon) {
            iconHtml = `
                <div class="category-icon-wrapper custom-icon-wrapper">
                    <img src="${customIconValue}" alt="${category.name}" class="category-icon-image" onerror="this.outerHTML='<span class=&quot;category-icon&quot;>' + (this.getAttribute(&quot;data-fallback&quot;) || '📦') + '</span>'" data-fallback="${category.icon || '📦'}">
                    <span class="custom-icon-badge">✨</span>
                </div>
            `;
        } else {
            iconHtml = `<span class="category-icon">${category.icon || '📦'}</span>`;
        }
        
        categoryItem.innerHTML = `
            ${iconHtml}
            <span class="category-name">${category.name}</span>
            <span class="category-type-badge" style="position: absolute; top: 4px; right: 4px; font-size: 10px; padding: 2px 4px; background: ${typeColor}20; border: 1px solid ${typeColor}50; border-radius: 6px; color: ${typeColor}; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; z-index: 5; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <span style="font-size: 10px;">${typeIcon}</span>
            </span>
        `;
        
        // 設置自訂分類的提示屬性
        if (isCustomCategory) {
            categoryItem.setAttribute('title', '長按或右鍵刪除');
            categoryItem.style.position = 'relative';
        }
        
        // 綁定點擊事件
        categoryItem.addEventListener('click', () => {
            // 移除其他選中狀態
            document.querySelectorAll('.category-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // 添加選中狀態
            categoryItem.classList.add('selected');
            
            // 保存選中的分類
            window.selectedCategory = category.name;
            
            // 根據選中的分類類型，自動更新 accountingType
            window.accountingType = category.type;
            
            // 更新 header 標籤的 active 狀態
            document.querySelectorAll('.header-tab').forEach(tab => {
                if (tab.dataset.type === category.type) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
            
            // 應用預設金額（如果有的話）
            applyDefaultAmount(category.name);
        });
        
        // 為自訂分類綁定長按和右鍵刪除事件
        if (isCustomCategory) {
            let longPressTimer = null;
            let isLongPress = false;
            
            // 手機長按刪除
            categoryItem.addEventListener('touchstart', (e) => {
                isLongPress = false;
                longPressTimer = setTimeout(() => {
                    isLongPress = true;
                    // 震動反饋（如果設備支持）
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                    // 視覺反饋
                    const originalTransform = categoryItem.style.transform;
                    categoryItem.style.transform = 'scale(0.95)';
                    categoryItem.style.background = 'var(--bg-danger)';
                    
                    // 確認刪除
                    if (confirm(`確定要刪除自訂分類「${category.name}」嗎？\n\n此操作無法復原。`)) {
                        deleteCustomCategory(category.name, category.type);
                    } else {
                        // 恢復樣式
                        setTimeout(() => {
                            categoryItem.style.transform = originalTransform;
                            categoryItem.style.background = '';
                        }, 200);
                    }
                }, 500); // 500ms 長按觸發
            });
            
            categoryItem.addEventListener('touchend', (e) => {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                }
                // 如果是長按，阻止點擊事件
                if (isLongPress) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
            
            categoryItem.addEventListener('touchmove', () => {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            });
            
            // 滑鼠右鍵刪除
            categoryItem.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 視覺反饋
                const originalTransform = categoryItem.style.transform;
                categoryItem.style.transform = 'scale(0.95)';
                categoryItem.style.background = 'var(--bg-danger)';
                
                // 確認刪除
                if (confirm(`確定要刪除自訂分類「${category.name}」嗎？\n\n此操作無法復原。`)) {
                    deleteCustomCategory(category.name, category.type);
                } else {
                    // 恢復樣式
                    setTimeout(() => {
                        categoryItem.style.transform = originalTransform;
                        categoryItem.style.background = '';
                    }, 200);
                }
            });
        }
        
        categoryGrid.appendChild(categoryItem);
    });
}

// 編輯自定義分類
function editCustomCategory(categoryName, categoryType) {
    const savedCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
    const category = savedCategories.find(cat => cat.name === categoryName && cat.type === categoryType);
    
    if (!category) {
        alert('找不到該分類');
        return;
    }
    
    // 創建編輯對話框
    const modal = document.createElement('div');
    modal.className = 'category-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10005; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;';
    
    modal.innerHTML = `
        <div class="category-modal-content" style="background: white; border-radius: 16px; padding: 24px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3 style="margin: 0; font-size: 20px; font-weight: 600; color: #333;">編輯分類</h3>
                <button class="modal-close-btn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">✕</button>
            </div>
            
            <div class="category-modal-field" style="margin-bottom: 20px;">
                <label class="category-modal-label" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #333;">分類類型</label>
                <div class="category-modal-type-select" style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="category-modal-type-option ${categoryType === 'expense' ? 'active' : ''}" data-type="expense" style="flex: 1; padding: 12px; border: 2px solid ${categoryType === 'expense' ? '#ffb6d9' : '#e0e0e0'}; border-radius: 12px; background: ${categoryType === 'expense' ? '#fff5f9' : '#ffffff'}; color: ${categoryType === 'expense' ? '#ff69b4' : '#666'}; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                        👤 支出
                    </button>
                    <button class="category-modal-type-option ${categoryType === 'income' ? 'active' : ''}" data-type="income" style="flex: 1; padding: 12px; border: 2px solid ${categoryType === 'income' ? '#ffb6d9' : '#e0e0e0'}; border-radius: 12px; background: ${categoryType === 'income' ? '#fff5f9' : '#ffffff'}; color: ${categoryType === 'income' ? '#ff69b4' : '#666'}; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                        💰 收入
                    </button>
                    <button class="category-modal-type-option ${categoryType === 'transfer' ? 'active' : ''}" data-type="transfer" style="flex: 1; padding: 12px; border: 2px solid ${categoryType === 'transfer' ? '#ffb6d9' : '#e0e0e0'}; border-radius: 12px; background: ${categoryType === 'transfer' ? '#fff5f9' : '#ffffff'}; color: ${categoryType === 'transfer' ? '#ff69b4' : '#666'}; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                        💳 轉帳
                    </button>
                </div>
            </div>
            
            <div class="category-modal-field" style="margin-bottom: 20px;">
                <label class="category-modal-label" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #333;">分類名稱</label>
                <input type="text" id="editCategoryNameInput" class="category-modal-input" value="${categoryName}" placeholder="請輸入分類名稱" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 12px; font-size: 14px; transition: border-color 0.2s;" onfocus="this.style.borderColor='#ffb6d9'" onblur="this.style.borderColor='#e0e0e0'">
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button id="saveEditCategoryBtn" style="flex: 1; padding: 12px; border: none; border-radius: 12px; background: linear-gradient(135deg, #ffb6d9 0%, #ff9ec7 100%); color: white; font-size: 14px; font-weight: 600; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    儲存
                </button>
                <button id="cancelEditCategoryBtn" style="flex: 1; padding: 12px; border: 2px solid #e0e0e0; border-radius: 12px; background: #ffffff; color: #666; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='#ffffff'">
                    取消
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    let selectedType = categoryType;
    
    // 類型選擇
    const typeOptions = modal.querySelectorAll('.category-modal-type-option');
    typeOptions.forEach(option => {
        option.addEventListener('click', () => {
            typeOptions.forEach(opt => {
                opt.style.borderColor = '#e0e0e0';
                opt.style.background = '#ffffff';
                opt.style.color = '#666';
            });
            option.style.borderColor = '#ffb6d9';
            option.style.background = '#fff5f9';
            option.style.color = '#ff69b4';
            selectedType = option.dataset.type;
        });
    });
    
    // 儲存按鈕
    const saveBtn = modal.querySelector('#saveEditCategoryBtn');
    saveBtn.addEventListener('click', () => {
        playClickSound(); // 播放點擊音效
        const newName = modal.querySelector('#editCategoryNameInput').value.trim();
        
        if (!newName) {
            alert('請輸入分類名稱');
            return;
        }
        
        // 檢查新名稱是否與其他分類重複（排除自己）
        const allCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
        const duplicate = allCategories.find(cat => 
            cat.name === newName && 
            cat.type === selectedType && 
            !(cat.name === categoryName && cat.type === categoryType)
        );
        
        if (duplicate) {
            alert('該分類名稱已存在');
            return;
        }
        
        // 更新分類
        const updatedCategories = allCategories.map(cat => {
            if (cat.name === categoryName && cat.type === categoryType) {
                return { ...cat, name: newName, type: selectedType };
            }
            return cat;
        });
        localStorage.setItem('customCategories', JSON.stringify(updatedCategories));
        
        // 如果名稱改變，需要更新相關數據
        if (newName !== categoryName) {
            // 更新 allCategories
            const allCatsIndex = window.allCategories.findIndex(cat => cat.name === categoryName && cat.type === categoryType);
            if (allCatsIndex !== -1) {
                window.allCategories[allCatsIndex].name = newName;
                window.allCategories[allCatsIndex].type = selectedType;
            }
            
            // 更新自定義圖標的鍵名
            const customIcons = JSON.parse(localStorage.getItem('categoryCustomIcons') || '{}');
            if (customIcons[categoryName]) {
                customIcons[newName] = customIcons[categoryName];
                delete customIcons[categoryName];
                localStorage.setItem('categoryCustomIcons', JSON.stringify(customIcons));
            }
            
            // 更新啟用狀態的鍵名
            const enabledState = getCategoryEnabledState();
            if (enabledState[categoryName] !== undefined) {
                enabledState[newName] = enabledState[categoryName];
                delete enabledState[categoryName];
                saveCategoryEnabledState(enabledState);
            }
        } else if (selectedType !== categoryType) {
            // 只更新類型
            const allCatsIndex = window.allCategories.findIndex(cat => cat.name === categoryName && cat.type === categoryType);
            if (allCatsIndex !== -1) {
                window.allCategories[allCatsIndex].type = selectedType;
            }
        }
        
        // 重新渲染
        if (typeof renderCategoryManageList === 'function') {
            renderCategoryManageList();
        }
        
        const pageInput = document.getElementById('pageInput');
        if (pageInput && pageInput.style.display !== 'none') {
            const activeTab = document.querySelector('.tab-btn.active');
            const tabType = activeTab ? activeTab.dataset.tab : 'more';
            initCategoryGrid(tabType, null);
        }
        
        // 關閉對話框
        document.body.removeChild(modal);
        
        // 顯示成功提示
        const successMsg = document.createElement('div');
        successMsg.innerHTML = `
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">✓ 分類已更新</div>
            <div style="font-size: 13px; opacity: 0.9;">${newName}</div>
        `;
        successMsg.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 16px 24px; border-radius: 12px; z-index: 10006; text-align: center; box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);';
        document.body.appendChild(successMsg);
        setTimeout(() => {
            if (document.body.contains(successMsg)) {
                document.body.removeChild(successMsg);
            }
        }, 2000);
    });
    
    // 取消按鈕
    const cancelBtn = modal.querySelector('#cancelEditCategoryBtn');
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 關閉按鈕
    const closeBtn = modal.querySelector('.modal-close-btn');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 點擊遮罩關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // 自動聚焦輸入框
    setTimeout(() => {
        modal.querySelector('#editCategoryNameInput').focus();
        modal.querySelector('#editCategoryNameInput').select();
    }, 100);
}

// 刪除自定義分類
function deleteCustomCategory(categoryName, categoryType) {
    if (!confirm(`確定要刪除「${categoryName}」分類嗎？\n\n刪除後相關的記帳記錄不會被刪除。`)) {
        return;
    }
    
    console.log('刪除自定義分類:', categoryName, categoryType);
    
    // 1. 從 localStorage 刪除
    let savedCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
    savedCategories = savedCategories.filter(cat => !(cat.name === categoryName && cat.type === categoryType));
    localStorage.setItem('customCategories', JSON.stringify(savedCategories));
    console.log('✓ 從 localStorage 刪除');
    
    // 2. 從 allCategories 刪除
    const index = allCategories.findIndex(cat => cat.name === categoryName && cat.type === categoryType);
    if (index !== -1) {
        allCategories.splice(index, 1);
        console.log('✓ 從 allCategories 刪除');
    }
    
    // 3. 刪除自定義圖標
    const customIcons = JSON.parse(localStorage.getItem('categoryCustomIcons') || '{}');
    if (customIcons[categoryName]) {
        delete customIcons[categoryName];
        safeSetItem('categoryCustomIcons', customIcons);
        console.log('✓ 刪除自定義圖標');
    }
    
    // 4. 從啟用狀態中刪除
    const enabledState = getCategoryEnabledState();
    if (enabledState[categoryName]) {
        delete enabledState[categoryName];
        saveCategoryEnabledState(enabledState);
        console.log('✓ 刪除啟用狀態');
    }
    
    // 5. 重新渲染分類管理列表
    if (typeof renderCategoryManageList === 'function') {
        renderCategoryManageList();
    }
    
    // 6. 重新初始化分類網格
    const pageInput = document.getElementById('pageInput');
    if (pageInput && pageInput.style.display !== 'none') {
        const activeTab = document.querySelector('.tab-btn.active');
        const tabType = activeTab ? activeTab.dataset.tab : 'more';
        initCategoryGrid(tabType, null);
        console.log('✓ 分類網格已更新');
    }
    
    // 7. 顯示成功提示
    const successMsg = document.createElement('div');
    successMsg.innerHTML = `
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">✓ 分類已刪除</div>
        <div style="font-size: 13px; opacity: 0.9;">${categoryName}</div>
    `;
    successMsg.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; padding: 16px 24px; border-radius: 12px; z-index: 10006; text-align: center; box-shadow: 0 4px 16px rgba(238, 90, 111, 0.3);';
    document.body.appendChild(successMsg);
    setTimeout(() => {
        if (document.body.contains(successMsg)) {
            document.body.removeChild(successMsg);
        }
    }, 2000);
}

// 初始化標籤切換
function initTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
        // 移除舊的事件監聽器（避免重複綁定）
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // 只綁定click事件，不綁定長按功能
        newBtn.addEventListener('click', () => {
            const tabType = newBtn.dataset.tab;
            console.log('點擊 tab 按鈕:', tabType);
            
            // 移除所有活動狀態
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            
            // 添加活動狀態到當前按鈕
            newBtn.classList.add('active');
            
            // 根據標籤類型更新分類顯示（顯示所有分類）
            console.log('重新初始化分類網格');
            initCategoryGrid(tabType, null); // 傳入 null 表示顯示所有分類
        });
        
        // 明確阻止長按功能（防止未來添加）
        newBtn.addEventListener('touchstart', (e) => {
            // 不處理長按，只允許點擊
        }, { passive: true });
    });
}

// 初始化 Header 標籤（支出/收入/轉帳）
function initHeaderTabs() {
    // 優先使用記帳輸入頁面的標籤，如果沒有則使用 Header 標籤
    const recordTabs = document.querySelectorAll('.record-type-tab');
    const headerTabs = document.querySelectorAll('.header-tab');
    const tabs = recordTabs.length > 0 ? recordTabs : headerTabs;
    
    // 初始化默認類型
    if (!window.accountingType) {
        window.accountingType = 'expense';
    }
    
    // 根據當前的 accountingType 設置正確的 active 狀態
    tabs.forEach(tab => {
        if (tab.dataset.type === window.accountingType) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    tabs.forEach(tab => {
        // 移除舊的事件監聽器（避免重複綁定）
        const newTab = tab.cloneNode(true);
        tab.parentNode.replaceChild(newTab, tab);
        
        // 恢復 active 狀態（如果原本是 active）
        if (tab.dataset.type === window.accountingType) {
            newTab.classList.add('active');
        }
        
        newTab.addEventListener('click', () => {
            const recordType = newTab.dataset.type;
            
            // 移除所有活動狀態
            tabs.forEach(t => t.classList.remove('active'));
            
            // 添加活動狀態到當前按鈕
            newTab.classList.add('active');
            
            // 保存記錄類型
            window.accountingType = recordType;
            
            // 顯示或隱藏轉帳帳戶選擇區域
            const transferSection = document.getElementById('transferAccountsSection');
            if (transferSection) {
                if (recordType === 'transfer') {
                    transferSection.style.display = 'flex';
                    // 初始化帳戶選項
                    initTransferAccountSelects();
                    // 重新初始化鍵盤，確保轉帳模式下可以正常輸入金額
                    initKeyboard();
                    expandInputSection();
                } else {
                    transferSection.style.display = 'none';
                }
            }
            
            // 重新初始化分類網格（顯示所有分類，不分類型）
            const activeTabBtn = document.querySelector('.tab-btn.active');
            const tabType = activeTabBtn ? activeTabBtn.dataset.tab : 'recommended';
            initCategoryGrid(tabType, null); // 傳入 null 表示顯示所有分類
            
            // 清除選中的分類
            window.selectedCategory = null;
            document.querySelectorAll('.category-item').forEach(item => {
                item.classList.remove('selected');
            });
        });
    });
}

// 初始化轉帳帳戶選擇器
function initTransferAccountSelects() {
    const fromSelect = document.getElementById('transferFromAccount');
    const toSelect = document.getElementById('transferToAccount');

    console.log('開始初始化轉帳帳戶選擇器');
    console.log('fromSelect:', fromSelect);
    console.log('toSelect:', toSelect);
    
    if (!fromSelect || !toSelect) {
        console.log('轉帳帳戶選擇器元素不存在');
        return;
    }
    
    // 獲取所有帳戶
    const accounts = typeof getAccounts === 'function' ? getAccounts() : [];
    console.log('轉帳功能 - 找到帳戶數量:', accounts.length);
    console.log('轉帳功能 - 帳戶列表:', accounts);
    
    // 清空選項
    fromSelect.innerHTML = '<option value="">選擇帳戶</option>';
    toSelect.innerHTML = '<option value="">選擇帳戶</option>';
    
    if (accounts.length === 0) {
        // 沒有帳戶時顯示提示
        fromSelect.innerHTML = '<option value="">請先建立帳戶</option>';
        toSelect.innerHTML = '<option value="">請先建立帳戶</option>';
        
        // 顯示提示訊息
        const transferSection = document.getElementById('transferAccountsSection');
        if (transferSection) {
            const existingHint = transferSection.querySelector('.transfer-account-hint');
            if (!existingHint) {
                const hint = document.createElement('div');
                hint.className = 'transfer-account-hint';
                hint.innerHTML = `
                    <div style="text-align: center; padding: 8px; background: rgba(255, 107, 107, 0.1); border-radius: 8px; margin-top: 8px;">
                        <p style="margin: 0; font-size: 14px; color: #ff6b6b;">📝 還沒有帳戶</p>
                        <button onclick="showAccountManageModal()" style="margin-top: 4px; padding: 4px 12px; background: #ff6b6b; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">立即建立帳戶</button>
                    </div>
                `;
                transferSection.appendChild(hint);
            }
        }
        return;
    }
    
    // 移除提示訊息（如果存在）
    const transferSection = document.getElementById('transferAccountsSection');
    if (transferSection) {
        const hint = transferSection.querySelector('.transfer-account-hint');
        if (hint) hint.remove();
    }
    
    const bindExpandEvents = (element) => {
        if (!element) return;
        ['focus', 'click', 'change'].forEach(evt => {
            element.addEventListener(evt, () => {
                expandInputSection();
            });
        });
    };

    // 添加帳戶選項
    accounts.forEach(account => {
        const option = `<option value="${account.id}">${account.name} (${account.currency || 'TWD'})</option>`;
        fromSelect.innerHTML += option;
        toSelect.innerHTML += option;
        console.log('添加帳戶選項:', account.name);
    });

    bindExpandEvents(fromSelect);
    bindExpandEvents(toSelect);

    // 設置預設選擇
    const defaultAccount = getDefaultAccount();
    if (defaultAccount) {
        fromSelect.value = defaultAccount.id;
        console.log('設置預設轉出帳戶:', defaultAccount.name);
    }
    
    // 檢查最終結果
    console.log('fromSelect options count:', fromSelect.options.length);
    console.log('toSelect options count:', toSelect.options.length);
    console.log('fromSelect HTML:', fromSelect.innerHTML);
    console.log('toSelect HTML:', toSelect.innerHTML);
    
    console.log('轉帳帳戶選擇器初始化完成');
}

// 初始化鍵盤輸入
function initKeyboard() {
    const keyboard = document.getElementById('keyboard');
    const amountDisplay = document.getElementById('amountDisplay');
    if (!keyboard || !amountDisplay) return;
    
    let displayValue = '0';
    let previousValue = null;
    let operator = null;
    let waitingForOperand = false;
    
    // 更新顯示
    const updateDisplay = () => {
        // 更新全局狀態
        if (window.keyboardState) {
            window.keyboardState.displayValue = displayValue;
        }
        // 格式化顯示（添加千分位）
        const numericValue = parseFloat(displayValue) || 0;
        amountDisplay.textContent = numericValue.toLocaleString('zh-TW');
    };
    
    // 將鍵盤狀態保存到全局變數，以便 quickRecord 可以訪問
    window.keyboardState = {
        displayValue: displayValue,
        previousValue: previousValue,
        operator: operator,
        waitingForOperand: waitingForOperand,
        setDisplayValue: (value) => {
            displayValue = value;
            previousValue = null;
            operator = null;
            waitingForOperand = false;
            if (window.keyboardState) {
                window.keyboardState.displayValue = value;
                window.keyboardState.previousValue = null;
                window.keyboardState.operator = null;
                window.keyboardState.waitingForOperand = false;
            }
            updateDisplay();
        },
        getDisplayValue: () => displayValue
    };
    
    // 安全計算表達式
    const calculate = (firstValue, secondValue, operation) => {
        const first = parseFloat(firstValue);
        const second = parseFloat(secondValue);
        
        if (isNaN(first) || isNaN(second)) {
            return null;
        }
        
        let result;
        switch (operation) {
            case '+':
                result = first + second;
                break;
            case '-':
                result = first - second;
                break;
            case '×':
                result = first * second;
                break;
            case '÷':
                if (second === 0) {
                    return null; // 除零錯誤
                }
                result = first / second;
                break;
            default:
                return null;
        }
        
        // 保留最多2位小數，去除多餘的0
        result = Math.round(result * 100) / 100;
        return result.toString();
    };
    
    // 處理按鍵點擊
    keyboard.addEventListener('click', (e) => {
        // 獲取被點擊的按鈕（可能是按鈕本身或按鈕內的子元素）
        const keyBtn = e.target.closest('.key-btn');
        if (!keyBtn) return;
        
        const key = keyBtn.dataset.key;
        if (!key) return;
        
        if (key === 'clear') {
            // 清除所有
            displayValue = '0';
            previousValue = null;
            operator = null;
            waitingForOperand = false;
            // 更新全局狀態
            if (window.keyboardState) {
                window.keyboardState.displayValue = displayValue;
                window.keyboardState.previousValue = null;
                window.keyboardState.operator = null;
                window.keyboardState.waitingForOperand = false;
            }
            updateDisplay();
        } else if (key === 'delete') {
            // 刪除最後一個字符
            if (waitingForOperand) {
                displayValue = '0';
                waitingForOperand = false;
            } else if (displayValue.length > 1) {
                displayValue = displayValue.slice(0, -1);
            } else {
                displayValue = '0';
            }
            updateDisplay();
        } else if (key === '=') {
            // 計算結果
            if (operator && previousValue !== null && !waitingForOperand) {
                const result = calculate(previousValue, displayValue, operator);
                if (result !== null) {
                    displayValue = result;
                    previousValue = null;
                    operator = null;
                    waitingForOperand = true;
                } else {
                    // 計算失敗（如除零）
                    const original = displayValue;
                    displayValue = '錯誤';
                    updateDisplay();
                    setTimeout(() => {
                        displayValue = original;
                        previousValue = null;
                        operator = null;
                        waitingForOperand = false;
                        updateDisplay();
                    }, 1500);
                    return;
                }
                updateDisplay();
            }
        } else if (key === '×' || key === '÷' || key === '+' || key === '-') {
            // 運算符處理
            const inputValue = parseFloat(displayValue);
            
            if (previousValue === null) {
                previousValue = displayValue;
            } else if (operator && !waitingForOperand) {
                // 連續運算：先計算前一個運算
                const result = calculate(previousValue, displayValue, operator);
                if (result !== null) {
                    displayValue = result;
                    previousValue = result;
                } else {
                    // 計算失敗
                    const original = displayValue;
                    displayValue = '錯誤';
                    updateDisplay();
                    setTimeout(() => {
                        displayValue = original;
                        previousValue = null;
                        operator = null;
                        waitingForOperand = false;
                        updateDisplay();
                    }, 1500);
                    return;
                }
                updateDisplay();
            }
            
            waitingForOperand = true;
            operator = key;
        } else if (key === '.') {
            // 小數點
            if (waitingForOperand) {
                displayValue = '0.';
                waitingForOperand = false;
            } else if (!displayValue.includes('.')) {
                displayValue += '.';
            }
            updateDisplay();
        } else {
            // 數字
            if (waitingForOperand) {
                displayValue = key;
                waitingForOperand = false;
            } else {
                if (displayValue === '0') {
                    displayValue = key;
                } else {
                    displayValue += key;
                }
            }
            updateDisplay();
        }
    });
}

// 初始化日期輸入欄位
function initDateButton() {
    const dateInput = document.getElementById('dateInput');
    if (!dateInput) return;
    
    // 初始化：設置今天日期（使用本地時區避免凌晨12點問題）
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    dateInput.value = today;
    
    // 防止日期輸入框focus時自動滾動（手機適配）
    dateInput.addEventListener('focus', (e) => {
        // 使用nearest選項，避免自動滾動
        setTimeout(() => {
            if (dateInput.scrollIntoView) {
                dateInput.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }
        }, 100);
    });
    
    dateInput.addEventListener('touchstart', (e) => {
        // 阻止默認行為，防止自動滾動
    }, { passive: true });
}

// 初始化常用備註按鈕
function initQuickNotes() {
    const quickNotesContainer = document.getElementById('quickNotesContainer');
    const quickNotesButtons = document.getElementById('quickNotesButtons');
    const noteInput = document.getElementById('noteInput');
    const inputSection = document.getElementById('inputSection');
    
    if (!quickNotesContainer || !quickNotesButtons || !noteInput) return;
    
    // 載入上一次的備註
    const lastNote = localStorage.getItem('lastQuickNote');
    if (lastNote && !noteInput.value.trim()) {
        noteInput.value = lastNote;
        // 觸發input事件，確保其他監聽器能收到
        noteInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // 當輸入區域顯示時，顯示常用備註按鈕
    const observer = new MutationObserver(() => {
        if (inputSection && inputSection.style.display !== 'none') {
            quickNotesContainer.classList.add('show');
        }
    });
    
    if (inputSection) {
        observer.observe(inputSection, { attributes: true, attributeFilter: ['style'] });
        // 初始檢查
        if (inputSection.style.display !== 'none') {
            quickNotesContainer.classList.add('show');
        }
    }
    
    // 綁定常用備註按鈕點擊事件
    quickNotesButtons.querySelectorAll('.quick-note-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const note = btn.dataset.note;
            if (noteInput) {
                const currentValue = noteInput.value.trim();
                // 檢查輸入框是否已經包含該備註，避免重複
                if (currentValue.includes(note)) {
                    // 如果已包含，不重複添加
                    return;
                }
                // 如果輸入框已有內容，在後面追加；否則直接填入
                let newValue;
                if (currentValue) {
                    newValue = currentValue + ' ' + note;
                } else {
                    newValue = note;
                }
                noteInput.value = newValue;
                
                // 儲存這次使用的備註作為「上一次的備註」
                localStorage.setItem('lastQuickNote', newValue);
                
                // 觸發input事件，確保其他監聽器能收到
                noteInput.dispatchEvent(new Event('input', { bubbles: true }));
                // 聚焦到輸入框
                noteInput.focus();
            }
        });
    });
    
    // 當備註輸入框獲得焦點時，確保常用備註按鈕顯示
    noteInput.addEventListener('focus', (e) => {
        quickNotesContainer.classList.add('show');
        // 防止手機鍵盤彈出時視口移位
        e.preventDefault();
        setTimeout(() => {
            // 使用nearest選項，避免自動滾動
            if (noteInput.scrollIntoView) {
                noteInput.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }
        }, 100);
    });
    
    // 監聽備註輸入框的變化，如果用戶手動輸入或修改，也更新記憶
    noteInput.addEventListener('input', () => {
        const currentValue = noteInput.value.trim();
        if (currentValue) {
            localStorage.setItem('lastQuickNote', currentValue);
        }
    });
    
    // 防止輸入框focus時自動滾動（手機適配）
    noteInput.addEventListener('touchstart', (e) => {
        // 阻止默認行為，防止自動滾動
    }, { passive: true });
}

// ========== 常用項目、上一筆複製、預設金額功能 ==========

// 獲取常用項目列表
function getQuickActions() {
    return JSON.parse(localStorage.getItem('quickActions') || '[]');
}

// 保存常用項目列表
function saveQuickActions(actions) {
    localStorage.setItem('quickActions', JSON.stringify(actions));
}

// 初始化常用項目顯示
function initQuickActions() {
    const quickActionsSection = document.getElementById('quickActionsSection');
    const quickActionsGrid = document.getElementById('quickActionsGrid');
    if (!quickActionsSection || !quickActionsGrid) return;
    
    const actions = getQuickActions();
    
    if (actions.length === 0) {
        quickActionsSection.style.display = 'none';
        return;
    }
    
    quickActionsSection.style.display = 'block';
    quickActionsGrid.innerHTML = '';
    
    actions.forEach((action, index) => {
        const actionItem = document.createElement('div');
        actionItem.className = 'quick-action-item';
        
        // 格式化顯示：分類名稱 + 金額
        const displayName = action.note || action.category;
        const displayAmount = action.amount ? `NT$${action.amount.toLocaleString('zh-TW')}` : '';
        
        actionItem.innerHTML = `
            <div class="quick-action-icon">${action.icon || '💰'}</div>
            <div class="quick-action-name">${displayName}</div>
            ${displayAmount ? `<div class="quick-action-amount">${displayAmount}</div>` : ''}
        `;
        
        actionItem.addEventListener('click', () => {
            quickRecord(action);
        });
        
        quickActionsGrid.appendChild(actionItem);
    });
    
    // 綁定編輯按鈕
    const editBtn = document.getElementById('editQuickActionsBtn');
    if (editBtn) {
        editBtn.onclick = (e) => {
            e.stopPropagation();
            showEditQuickActionsModal();
        };
    }
}

// 一鍵記錄
function quickRecord(action) {
    // 設置分類
    window.selectedCategory = action.category;
    window.accountingType = action.type || 'expense';
    
    // 更新分類選擇狀態
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.category === action.category) {
            item.classList.add('selected');
        }
    });
    
    // 設置金額（如果有預設金額）
    if (action.amount) {
        setAmountValue(action.amount);
    }
    
    // 設置備註（如果有）
    const noteInput = document.getElementById('noteInput');
    if (noteInput && action.note) {
        noteInput.value = action.note;
    }
    
    // 展開輸入區域（如果已收起）
    const inputSection = document.getElementById('inputSection');
    if (inputSection && inputSection.classList.contains('collapsed')) {
        inputSection.classList.remove('collapsed');
    }
    
    // 如果有預設金額且啟用自動保存，自動保存
    if (action.amount && action.autoSave !== false) {
        // 延遲一點時間，確保金額已設置
        setTimeout(() => {
            const saveBtn = document.getElementById('saveBtn');
            if (saveBtn) {
                saveBtn.click();
            }
        }, 200);
    }
}

// 設置金額值（更新鍵盤內部狀態和顯示）
function setAmountValue(amount) {
    const amountDisplay = document.getElementById('amountDisplay');
    if (!amountDisplay) return;
    
    // 格式化金額（去除千分位符號，只保留數字）
    const numericValue = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/,/g, ''));
    if (isNaN(numericValue) || numericValue < 0) return;
    
    // 使用鍵盤狀態的設置方法（如果存在）
    if (window.keyboardState && typeof window.keyboardState.setDisplayValue === 'function') {
        window.keyboardState.setDisplayValue(numericValue.toString());
    } else {
        // 如果鍵盤狀態不存在，直接更新顯示
        amountDisplay.textContent = numericValue.toLocaleString('zh-TW');
    }
    
    // 觸發視覺反饋
    amountDisplay.style.transform = 'scale(1.05)';
    amountDisplay.style.transition = 'transform 0.2s ease';
    setTimeout(() => {
        if (amountDisplay) {
            amountDisplay.style.transform = 'scale(1)';
        }
    }, 200);
}

// 顯示編輯常用項目對話框
function showEditQuickActionsModal() {
    const actions = getQuickActions();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    
    let actionsHtml = actions.map((action, index) => `
        <div class="quick-action-edit-item" data-index="${index}">
            <div class="quick-action-edit-icon">${action.icon || '💰'}</div>
            <div class="quick-action-edit-info">
                <div class="quick-action-edit-category">${action.category}</div>
                ${action.amount ? `<div class="quick-action-edit-amount">NT$${action.amount.toLocaleString('zh-TW')}</div>` : ''}
            </div>
            <button class="quick-action-delete-btn" data-index="${index}">✕</button>
        </div>
    `).join('');
    
    modal.innerHTML = `
        <div class="modal-content" style="background: white; border-radius: 16px; padding: 24px; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 20px; font-weight: 600;">編輯常用項目</h3>
                <button class="modal-close-btn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">✕</button>
            </div>
            <div class="modal-body" id="quickActionsEditList" style="margin-bottom: 20px;">
                ${actionsHtml || '<div style="text-align: center; color: #999; padding: 20px;">暫無常用項目</div>'}
            </div>
            <div class="modal-footer" style="display: flex; gap: 12px;">
                <button id="addQuickActionBtn" style="flex: 1; padding: 12px; background: #ff69b4; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">新增項目</button>
                <button id="saveQuickActionsBtn" style="flex: 1; padding: 12px; background: #51cf66; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">完成</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 綁定關閉按鈕
    modal.querySelector('.modal-close-btn').onclick = () => {
        document.body.removeChild(modal);
    };
    
    // 綁定刪除按鈕
    modal.querySelectorAll('.quick-action-delete-btn').forEach(btn => {
        btn.onclick = () => {
            const index = parseInt(btn.dataset.index);
            actions.splice(index, 1);
            saveQuickActions(actions);
            document.body.removeChild(modal);
            initQuickActions();
            showEditQuickActionsModal();
        };
    });
    
    // 綁定新增按鈕
    modal.querySelector('#addQuickActionBtn').onclick = () => {
        playClickSound(); // 播放點擊音效
        showAddQuickActionModal(actions);
        document.body.removeChild(modal);
    };
    
    // 綁定完成按鈕
    modal.querySelector('#saveQuickActionsBtn').onclick = () => {
        document.body.removeChild(modal);
    };
}

// 顯示新增常用項目對話框
function showAddQuickActionModal(existingActions) {
    const categories = getEnabledCategories('expense').concat(getEnabledCategories('income'));
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10001; display: flex; align-items: center; justify-content: center; padding: 20px;';
    
    modal.innerHTML = `
        <div class="modal-content" style="background: white; border-radius: 16px; padding: 24px; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 20px; font-weight: 600;">新增常用項目</h3>
                <button class="modal-close-btn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">✕</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">分類</label>
                    <select id="quickActionCategory" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px;">
                        ${categories.map(cat => `<option value="${cat.name}" data-type="${cat.type}" data-icon="${cat.icon}">${cat.icon} ${cat.name}</option>`).join('')}
                    </select>
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">預設金額（選填）</label>
                    <input type="number" id="quickActionAmount" placeholder="例如：60、120、55" step="0.01" min="0" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px;">
                    <div style="font-size: 12px; color: #999; margin-top: 4px;">常用範例：早餐 $60、午餐 $120、咖啡 $55</div>
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">預設備註（選填）</label>
                    <input type="text" id="quickActionNote" placeholder="例如：早餐" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px;">
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="quickActionAutoSave" checked>
                        <span>一鍵記錄時自動保存（有預設金額時）</span>
                    </label>
                </div>
            </div>
            <div class="modal-footer" style="display: flex; gap: 12px; margin-top: 24px;">
                <button id="cancelAddQuickActionBtn" style="flex: 1; padding: 12px; background: #f0f0f0; color: #333; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">取消</button>
                <button id="confirmAddQuickActionBtn" style="flex: 1; padding: 12px; background: #ff69b4; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">新增</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 綁定關閉按鈕
    modal.querySelector('.modal-close-btn').onclick = () => {
        document.body.removeChild(modal);
        showEditQuickActionsModal();
    };
    
    // 綁定取消按鈕
    modal.querySelector('#cancelAddQuickActionBtn').onclick = () => {
        document.body.removeChild(modal);
        showEditQuickActionsModal();
    };
    
    // 綁定確認按鈕
    modal.querySelector('#confirmAddQuickActionBtn').onclick = () => {
        playClickSound(); // 播放點擊音效
        const categorySelect = modal.querySelector('#quickActionCategory');
        const selectedOption = categorySelect.options[categorySelect.selectedIndex];
        const category = categorySelect.value;
        const type = selectedOption.dataset.type;
        const icon = selectedOption.dataset.icon;
        const amount = parseFloat(modal.querySelector('#quickActionAmount').value) || null;
        const note = modal.querySelector('#quickActionNote').value.trim() || null;
        const autoSave = modal.querySelector('#quickActionAutoSave').checked;
        
        if (!category) {
            alert('請選擇分類');
            return;
        }
        
        const newAction = {
            category: category,
            type: type,
            icon: icon,
            amount: amount,
            note: note,
            autoSave: autoSave
        };
        
        existingActions.push(newAction);
        saveQuickActions(existingActions);
        
        document.body.removeChild(modal);
        initQuickActions();
        showEditQuickActionsModal();
    };
}

// 上一筆複製功能
function initCopyLastButton() {
    const copyLastBtn = document.getElementById('copyLastBtn');
    if (!copyLastBtn) return;
    
    copyLastBtn.addEventListener('click', () => {
        copyLastRecord();
    });
}

// 複製上一筆記錄
function copyLastRecord() {
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    
    if (records.length === 0) {
        alert('尚無記錄');
        return;
    }
    
    // 獲取最後一筆記錄
    const lastRecord = records[records.length - 1];
    
    // 設置分類
    window.selectedCategory = lastRecord.category;
    window.accountingType = lastRecord.type || 'expense';
    
    // 更新分類選擇狀態
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.category === lastRecord.category) {
            item.classList.add('selected');
        }
    });
    
    // 設置金額
    const amountDisplay = document.getElementById('amountDisplay');
    if (amountDisplay) {
        amountDisplay.textContent = (lastRecord.amount || 0).toLocaleString('zh-TW');
    }
    
    // 設置備註
    const noteInput = document.getElementById('noteInput');
    if (noteInput && lastRecord.note) {
        noteInput.value = lastRecord.note;
    }
    
    // 設置日期
    const dateInput = document.getElementById('dateInput');
    if (dateInput && lastRecord.date) {
        dateInput.value = lastRecord.date;
    }
    
    // 設置表情
    if (lastRecord.emoji) {
        window.selectedEmoji = lastRecord.emoji;
        const emojiBtn = document.querySelector('.emoji-btn');
        if (emojiBtn) {
            emojiBtn.textContent = lastRecord.emoji;
        }
    }
    
    // 設置成員
    if (lastRecord.member) {
        window.selectedMember = lastRecord.member;
        const memberDisplay = document.getElementById('memberDisplay');
        const memberInfo = document.getElementById('memberInfo');
        if (memberDisplay) memberDisplay.style.display = 'block';
        if (memberInfo) memberInfo.textContent = lastRecord.member;
    }
    
    // 設置帳戶
    if (lastRecord.account) {
        window.selectedAccount = { id: lastRecord.account };
        if (typeof updateAccountDisplay === 'function') {
            updateAccountDisplay();
        }
    }
    
    // 設置圖片（收據）- 支援多張圖片
    if (lastRecord.receiptImages && lastRecord.receiptImages.length > 0) {
        window.selectedReceiptImages = [...lastRecord.receiptImages];
        // 更新圖片預覽 UI（顯示第一張圖片作為預覽）
        const imagePreview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        if (previewImage && lastRecord.receiptImages[0]) {
            previewImage.src = lastRecord.receiptImages[0];
        }
        if (imagePreview) {
            imagePreview.style.display = 'block';
        }
    }
    
    alert('已複製上一筆記錄');
}

// 獲取分類的預設金額
function getDefaultAmount(categoryName) {
    const defaultAmounts = JSON.parse(localStorage.getItem('categoryDefaultAmounts') || '{}');
    return defaultAmounts[categoryName] || null;
}

// 保存分類的預設金額
function saveDefaultAmount(categoryName, amount) {
    const defaultAmounts = JSON.parse(localStorage.getItem('categoryDefaultAmounts') || '{}');
    if (amount && amount > 0) {
        defaultAmounts[categoryName] = amount;
    } else {
        delete defaultAmounts[categoryName];
    }
    localStorage.setItem('categoryDefaultAmounts', JSON.stringify(defaultAmounts));
}

// 應用預設金額
function applyDefaultAmount(categoryName) {
    const defaultAmount = getDefaultAmount(categoryName);
    if (defaultAmount) {
        const amountDisplay = document.getElementById('amountDisplay');
        if (amountDisplay && amountDisplay.textContent === '0') {
            amountDisplay.textContent = defaultAmount.toLocaleString('zh-TW');
        }
    }
}

// 初始化下月計入選項
function initNextMonthOption() {
    const nextMonthOption = document.getElementById('nextMonthOption');
    const nextMonthCheckbox = document.getElementById('nextMonthCheckbox');
    const customDateBtn = document.getElementById('customDateBtn');
    const inputSection = document.querySelector('.input-section');
    
    if (!nextMonthOption || !nextMonthCheckbox || !customDateBtn) return;
    
    // 預設隱藏選項（等待數字鍵盤展開）
    nextMonthOption.style.display = 'none';
    
    // 預設隱藏自訂日期按鈕
    customDateBtn.style.display = 'none';
    window.customNextMonthDate = null;
    
    // 根據數字鍵盤展開/收起狀態控制選項顯示
    const updateNextMonthOptionVisibility = () => {
        if (inputSection && inputSection.classList.contains('collapsed')) {
            // 數字鍵盤收起時，隱藏選項
            nextMonthOption.style.display = 'none';
        } else {
            // 數字鍵盤展開時，顯示選項
            nextMonthOption.style.display = 'flex';
        }
    };
    
    // 初始化時檢查狀態
    updateNextMonthOptionVisibility();
    
    // 使用 MutationObserver 監聽 input-section 的 class 變化
    if (inputSection) {
        const observer = new MutationObserver(updateNextMonthOptionVisibility);
        observer.observe(inputSection, { 
            attributes: true, 
            attributeFilter: ['class'] 
        });
    }
    
    // 監聽複選框變化
    nextMonthCheckbox.addEventListener('change', () => {
        if (nextMonthCheckbox.checked) {
            // 顯示自訂日期按鈕
            customDateBtn.style.display = 'block';
            
            // 預設為下個月的今天
            const today = new Date();
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
            window.customNextMonthDate = nextMonth;
            
            // 重置按鈕文字和樣式
            customDateBtn.textContent = '設定日期';
            customDateBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        } else {
            // 隱藏自訂日期按鈕
            customDateBtn.style.display = 'none';
            window.customNextMonthDate = null;
        }
    });
    
    // 自訂日期按鈕
    customDateBtn.addEventListener('click', () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
        const nextMonthYear = nextMonthDate.getFullYear();
        const nextMonthNum = nextMonthDate.getMonth() + 1;
        
        // 詢問日期
        const dayInput = prompt(
            `設定下個月的扣款日期\n\n月份：${nextMonthYear}年${nextMonthNum}月\n\n請輸入日期（1-31）：`,
            today.getDate()
        );
        
        if (dayInput === null) return;
        
        const day = parseInt(dayInput);
        if (isNaN(day) || day < 1 || day > 31) {
            alert('請輸入有效的日期（1-31）');
            return;
        }
        
        // 檢查日期是否有效
        const testDate = new Date(nextMonthYear, nextMonthNum - 1, day);
        if (testDate.getMonth() !== nextMonthNum - 1) {
            alert(`${nextMonthYear}年${nextMonthNum}月沒有${day}號，請重新輸入`);
            return;
        }
        
        // 設定自訂日期
        window.customNextMonthDate = testDate;
        
        // 更新按鈕文字提示
        customDateBtn.textContent = `${nextMonthNum}/${day}`;
        customDateBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        
        alert(`已設定為 ${nextMonthYear}年${nextMonthNum}月${day}日`);
    });
}

// 初始化保存按鈕
function initSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    if (!saveBtn) return;
    
    saveBtn.addEventListener('click', () => {
        playClickSound(); // 播放點擊音效
        const amountDisplay = document.getElementById('amountDisplay');
        const noteInput = document.getElementById('noteInput');
        const dateInputEl = document.getElementById('dateInput');
        
        if (!amountDisplay) return;
        
        const amount = parseFloat(amountDisplay.textContent.replace(/[^0-9.]/g, '')) || 0;
        
        if (amount <= 0) {
            alert('請輸入金額');
            return;
        }
        
        if (!window.selectedCategory) {
            alert('請選擇分類');
            return;
        }
        
        // 檢查是否計入下個月
        const nextMonthCheckbox = document.getElementById('nextMonthCheckbox');
        const isNextMonth = nextMonthCheckbox && nextMonthCheckbox.checked;
        
        // 獲取日期（使用本地時區避免凌晨12點問題）
        const now = new Date();
        let date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (dateInputEl && dateInputEl.value) {
            date = dateInputEl.value;
        }
        
        // 如果選擇計入下個月，調整日期
        if (isNextMonth) {
            const currentDate = new Date(date);
            // 使用自訂日期（如果有設定）或預設下個月同一天
            const nextMonthDate = window.customNextMonthDate || new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
            date = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(nextMonthDate.getDate()).padStart(2, '0')}`;
        }
        
        // 獲取記錄類型（默認為收入）
        const recordType = window.accountingType || 'income';
        
        // 如果是轉帳類型，需要驗證帳戶選擇
        if (recordType === 'transfer') {
            const fromAccount = document.getElementById('transferFromAccount')?.value;
            const toAccount = document.getElementById('transferToAccount')?.value;
            
            if (!fromAccount || !toAccount) {
                alert('請選擇轉出和轉入帳戶');
                return;
            }
            
            if (fromAccount === toAccount) {
                alert('轉出和轉入帳戶不能相同');
                return;
            }
        } else {
            // 非轉帳類型需要檢查帳戶
            // 獲取選中的帳戶（如果沒有選中，自動使用默認帳戶）
            let selectedAccount = getSelectedAccount();
            
            // 如果沒有選中帳戶，嘗試獲取默認帳戶
            if (!selectedAccount) {
                selectedAccount = getDefaultAccount();
            }
            
            // 如果還是沒有帳戶，提示創建帳戶
            if (!selectedAccount) {
                if (confirm('您還沒有創建帳戶。\n\n是否現在創建帳戶？\n\n點擊「確定」創建帳戶，點擊「取消」稍後再說。')) {
                    showAccountManageModal();
                }
                return;
            }
            
            // 如果之前沒有選中帳戶，現在自動選中默認帳戶
            if (!window.selectedAccount && selectedAccount) {
                window.selectedAccount = selectedAccount;
                // 更新帳戶顯示
                if (typeof updateAccountDisplay === 'function') {
                    updateAccountDisplay();
                }
            }
        }
        
        // 獲取選中的表情
        const selectedEmoji = window.selectedEmoji || null;
        
        // 獲取選中的成員
        const selectedMember = window.selectedMember || null;
        
        // 獲取選中的圖片（收據）- 支援多張圖片
        const receiptImages = window.selectedReceiptImages || [];
        
        // 創建記錄
        const record = {
            type: recordType,
            category: window.selectedCategory,
            amount: amount,
            note: noteInput ? noteInput.value.trim() : '',
            date: date,
            emoji: selectedEmoji,
            member: selectedMember,
            receiptImages: receiptImages, // 保存收據圖片陣列
            isNextMonthBill: isNextMonth, // 標記是否為下月帳單
            timestamp: new Date().toISOString()
        };
        
        // 根據記錄類型設定帳戶欄位
        if (recordType === 'transfer') {
            record.fromAccount = document.getElementById('transferFromAccount')?.value || '';
            record.toAccount = document.getElementById('transferToAccount')?.value || '';
            // 轉帳記錄不需要 account 欄位
        } else {
            // 獲取選中的帳戶（非轉帳類型）
            let selectedAccount = getSelectedAccount();
            if (!selectedAccount) {
                selectedAccount = getDefaultAccount();
            }
            record.account = selectedAccount?.id || '';
        }
        
        // 保存到 localStorage
        try {
            let records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
            records.push(record);
            
            // 檢查記錄大小（特別是包含圖片時）
            const recordSize = JSON.stringify(record).length;
            const totalSize = JSON.stringify(records).length;
            
            console.log(`記錄大小: ${recordSize} 字符, 總大小: ${totalSize} 字符`);
            
            // 如果單筆記錄太大，給出警告
            if (recordSize > 1000000) { // 1MB
                console.warn('單筆記錄過大，可能包含大型圖片');
                if (!confirm('這筆記錄包含的圖片較大，可能影響儲存效能。\n\n是否繼續儲存？')) {
                    return;
                }
            }
            
            localStorage.setItem('accountingRecords', JSON.stringify(records));
        } catch (error) {
            console.error('保存記帳記錄失敗:', error);
            
            // 檢查是否是localStorage空間不足
            if (error.name === 'QuotaExceededError') {
                const receiptImagesCount = receiptImages.length;
                let message = '儲存空間不足！\n\n可能原因：\n';
                
                if (receiptImagesCount > 0) {
                    message += `1. 照片檔案太大（${receiptImagesCount}張）\n`;
                    message += '2. 記錄數量過多\n\n';
                    message += '建議：\n';
                    message += '• 減少照片數量或壓縮照片\n';
                    message += '• 刪除一些舊的記錄\n';
                    message += '• 清除瀏覽器快取\n\n';
                    message += '提示：您可以先不選擇照片，完成記帳後再編輯添加照片。';
                } else {
                    message += '1. 記錄數量過多\n\n';
                    message += '建議：\n';
                    message += '• 刪除一些舊的記錄\n';
                    message += '• 清除瀏覽器快取';
                }
                
                alert(message);
            } else {
                alert('保存記帳記錄失敗，請重試。\n\n錯誤：' + error.message);
            }
            return;
        }
        
        // 如果是收入記錄，播放入帳音效
        if (recordType === 'income') {
            playIncomeSound(); // 播放入帳音效
        }

        // 觸發小森對話系統（不搭配音效）
        if (typeof checkAndTriggerMoriDialog === 'function') {
            checkAndTriggerMoriDialog(record);
        }

        // 檢查連續記帳鼓勵
        if (typeof checkStreakEncouragementDialog === 'function') {
            checkStreakEncouragementDialog();
        }

        // 檢查超支原因提示
        if (typeof checkOverspendReasonDialog === 'function') {
            checkOverspendReasonDialog();
        }

        // 更新帳戶顯示
        if (typeof updateAccountDisplay === 'function') {
            updateAccountDisplay();
        }
        
        // 重置表單（保留備註以便繼續使用）
        amountDisplay.textContent = '0';
        // 備註欄位不清除，讓用戶可以繼續使用上一次的備註
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('selected');
        });
        window.selectedCategory = null;
        window.selectedEmoji = null;
        window.selectedMember = null;
        window.selectedReceiptImages = [];
        
        // 重置成員顯示
        const memberDisplay = document.getElementById('memberDisplay');
        const memberInfo = document.getElementById('memberInfo');
        if (memberDisplay) memberDisplay.style.display = 'none';
        if (memberInfo) memberInfo.textContent = '未選擇成員';
        
        // 重置表情按鈕
        const emojiBtn = document.querySelector('.emoji-btn');
        if (emojiBtn) {
            emojiBtn.textContent = '😊';
            emojiBtn.innerHTML = '😊';
        }
        
        // 重置圖片預覽
        const imagePreviewReset = document.getElementById('imagePreview');
        const previewImageReset = document.getElementById('previewImage');
        if (imagePreviewReset) imagePreviewReset.style.display = 'none';
        if (previewImageReset) previewImageReset.src = '';
        
        // 重置日期為今天（使用本地時區避免凌晨12點問題）
        const dateInputReset = document.getElementById('dateInput');
        if (dateInputReset) {
            const now = new Date();
            const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            dateInputReset.value = today;
        }
        
        // 重置下月選項
        const nextMonthCheckboxReset = document.getElementById('nextMonthCheckbox');
        const customDateBtnReset = document.getElementById('customDateBtn');
        if (nextMonthCheckboxReset) {
            nextMonthCheckboxReset.checked = false;
        }
        if (customDateBtnReset) {
            customDateBtnReset.style.display = 'none';
            customDateBtnReset.textContent = '設定日期';
            customDateBtnReset.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        }
        window.customNextMonthDate = null;
        
        // 記帳成功後自動收起輸入區域
        const inputSection = document.getElementById('inputSection');
        const collapseBtn = document.getElementById('collapseBtn');
        if (inputSection && collapseBtn) {
            if (!inputSection.classList.contains('collapsed')) {
                inputSection.classList.add('collapsed');
                const collapseIcon = collapseBtn.querySelector('.collapse-icon');
                if (collapseIcon) {
                    collapseIcon.textContent = '▲';
                }
            }
        }
        
        // 顯示成功訊息
        alert('記帳成功！');
        
        // 跳回首頁（記帳本頁面）
        goBackToLedger();
    });
}

// 投資記錄數據結構
// buy: { stockCode, stockName, date, price, shares, fee, isDCA, note, timestamp }
// sell: { stockCode, stockName, date, price, shares, fee, tax, note, timestamp, realizedPnl }
// dividend: { stockCode, stockName, date, exDividendDate, dividendType, perShare, historicalPerShare, shares, amount, reinvest, note, timestamp }

// 常見投資標的映射表（股票、ETF、債券）- 全局變數
// 從 JSON 文件載入
window.commonStocks = {};

// 載入股票名稱映射表
async function loadStockNames() {
    try {
        const response = await fetch('stocks.json');
        if (response.ok) {
            const data = await response.json();
            window.stockNameData = data;
            // 合併所有類型的標的
            window.commonStocks = {
                ...data.stocks,
                ...data.etfs,
                ...data.bonds
            };
            try {
                updateRebalanceDatalists();
            } catch (_) {}
        } else {
            // 如果載入失敗，使用預設值
            console.warn('無法載入 stocks.json，使用預設值');
            setDefaultStockNames();
            try {
                updateRebalanceDatalists();
            } catch (_) {}
        }
    } catch (error) {
        console.error('載入股票名稱失敗:', error);
        // 如果載入失敗，使用預設值
        setDefaultStockNames();
        try {
            updateRebalanceDatalists();
        } catch (_) {}
    }
}

// 設定預設股票名稱（作為備用）
function setDefaultStockNames() {
    window.commonStocks = {
        // 股票
        '2330': '台積電',
        '2317': '鴻海',
        '2454': '聯發科',
        '2308': '台達電',
        '2303': '聯電',
        '2412': '中華電',
        '1301': '台塑',
        '1303': '南亞',
        '1326': '台化',
        '2882': '國泰金',
        '2881': '富邦金',
        '2891': '中信金',
        '2886': '兆豐金',
        '2884': '玉山金',
        '2382': '廣達',
        '2357': '華碩',
        '2379': '瑞昱',
        '2301': '光寶科',
        '2324': '仁寶',
        // ETF
        '0050': '元大台灣50',
        '0056': '元大高股息',
        '00878': '國泰永續高股息',
        '00881': '國泰台灣5G+',
        '006208': '富邦台50',
        '00692': '富邦公司治理',
        '00713': '元大台灣高息低波',
        '00850': '元大台灣ESG永續',
        '00919': '群益台灣精選高息',
        '00929': '復華台灣科技優息',
        '00939': '統一台灣高息動能',
        '00940': '元大台灣價值高息',
        // 債券ETF
        '00720B': '元大投資級公司債',
        '00725B': '元大AAA至A公司債',
        '00751B': '元大20年期以上AAA至A級美元公司債',
        '00795B': '中信高評級公司債',
        '00834B': '第一金金融債10+',
        '00840B': '富邦全球投等債',
        // 政府債券
        'A04109': '10年期公債',
        'A04110': '20年期公債',
        'A04111': '30年期公債'
    };
}

function updateRebalanceDatalists() {
    const stockListEl = document.getElementById('rebalanceStockDatalist');
    const bondListEl = document.getElementById('rebalanceBondDatalist');
    if (!stockListEl && !bondListEl) return;

    const data = window.stockNameData || null;
    const stocks = data && data.stocks ? data.stocks : null;
    const etfs = data && data.etfs ? data.etfs : null;
    const bonds = data && data.bonds ? data.bonds : null;

    const addOptions = (datalist, entries) => {
        if (!datalist || !entries) return;
        const html = Object.entries(entries).map(([code, name]) => {
            const label = name ? `${code} ${name}` : code;
            return `<option value="${code}" label="${label}"></option>`;
        }).join('');
        datalist.innerHTML = html;
    };

    if (stockListEl) {
        if (stocks || etfs) {
            addOptions(stockListEl, { ...(stocks || {}), ...(etfs || {}) });
        } else {
            addOptions(stockListEl, window.commonStocks || {});
        }
    }

    if (bondListEl) {
        if (bonds) {
            addOptions(bondListEl, bonds);
        } else {
            const onlyBonds = {};
            Object.entries(window.commonStocks || {}).forEach(([code, name]) => {
                if (isBondInstrumentByCode(code)) {
                    onlyBonds[code] = name;
                }
            });
            addOptions(bondListEl, onlyBonds);
        }
    }
}

// 從投資記錄中查找股票名稱的全局函數
window.findStockName = function(code) {
    if (!code) return null;
    
    // 1. 先從常見股票映射表中查找
    if (window.commonStocks && window.commonStocks[code]) {
        return window.commonStocks[code];
    }
    
    // 2. 從持股中查找
    if (typeof getPortfolio === 'function') {
        const portfolio = getPortfolio();
        const portfolioStock = portfolio.find(s => s.stockCode === code);
        if (portfolioStock && portfolioStock.stockName) {
            return portfolioStock.stockName;
        }
    }
    
    // 3. 從所有投資記錄中查找
    const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    const recordStock = records.find(r => r.stockCode === code);
    if (recordStock && recordStock.stockName) {
        return recordStock.stockName;
    }
    
    // 4. 如果都沒找到，返回null（讓用戶手動輸入）
    return null;
};

// 摘要按鈕切換（投資總覽）
function initSummaryToggle() {
    const toggleBtn = document.getElementById('summaryToggleBtn');
    const overviewGrid = document.getElementById('overviewSummaryGrid');
    if (!toggleBtn || !overviewGrid) return;
    toggleBtn.addEventListener('click', () => {
        const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
        const next = !isOpen;
        toggleBtn.setAttribute('aria-expanded', String(next));
        overviewGrid.style.display = next ? 'grid' : 'none';
    });
}

// 檢查並執行到期的預約買入
function checkScheduledBuys() {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let scheduled = JSON.parse(localStorage.getItem(SCHEDULED_BUY_STORAGE_KEY) || '[]');
    if (!Array.isArray(scheduled) || scheduled.length === 0) return;
    
    const due = [];
    const pending = [];
    scheduled.forEach(item => {
        const dateStr = item.date;
        if (dateStr && dateStr <= todayStr) {
            due.push(item);
        } else {
            pending.push(item);
        }
    });
    
    if (due.length === 0) return;
    
    let records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    const nowIso = new Date().toISOString();
    due.forEach(item => {
        records.push({
            type: 'buy',
            stockCode: item.stockCode,
            stockName: item.stockName || item.stockCode,
            date: item.date,
            price: item.price,
            shares: item.shares,
            fee: item.fee || 0,
            isDCA: item.isDCA || false,
            note: item.note || '預約買入自動執行',
            timestamp: nowIso,
            scheduledId: item.id || null
        });
    });
    
    localStorage.setItem('investmentRecords', JSON.stringify(records));
    localStorage.setItem(SCHEDULED_BUY_STORAGE_KEY, JSON.stringify(pending));
    
    // 更新顯示
    updateInvestmentSummary();
    updatePortfolioList();
    updateInvestmentRecords();
    updateStockSelects();
}

// 初始化投資專區頁面
function initInvestmentPage() {
    // 顯示投資總覽頁面
    const overview = document.getElementById('investmentOverview');
    const detailPage = document.getElementById('stockDetailPage');
    const inputPage = document.getElementById('investmentInputPage');
    const dividendPage = document.getElementById('dividendPage');
    const bottomNav = document.querySelector('.bottom-nav');
    const investmentActions = document.querySelector('.investment-actions');
    
    // 隱藏舊的表單
    const buyForm = document.getElementById('buyForm');
    const sellForm = document.getElementById('sellForm');
    const dividendForm = document.getElementById('dividendForm');
    const portfolioList = document.getElementById('portfolioList');
    const investmentRecords = document.getElementById('investmentRecords');
    
    if (overview) overview.style.display = 'block';
    if (detailPage) detailPage.style.display = 'none';
    if (inputPage) inputPage.style.display = 'none';
    if (dividendPage) dividendPage.style.display = 'none';
    
    // 隱藏舊的表單和列表
    if (buyForm) buyForm.style.display = 'none';
    if (sellForm) sellForm.style.display = 'none';
    if (dividendForm) dividendForm.style.display = 'none';
    if (portfolioList) portfolioList.style.display = 'none';
    if (investmentRecords) investmentRecords.style.display = 'none';
    
    // 顯示底部導航欄（操作按鈕已隱藏）
    if (bottomNav) bottomNav.style.display = 'flex';
    if (investmentActions) investmentActions.style.display = 'none'; // 隱藏操作按鈕
    
    // 初始化操作按鈕（已隱藏，但保留功能以防需要）
    // initInvestmentActions();
    
    // 載入按鈕順序
    setTimeout(() => {
        loadButtonOrder();
    }, 100);
    
    // 初始化表單（用於舊版表單，如果需要的話）
    initBuyForm();
    initSellForm();
    initDividendForm();
    
    // 初始化日期欄位
    const buyDate = document.getElementById('buyDate');
    const sellDate = document.getElementById('sellDate');
    const dividendDate = document.getElementById('dividendDate');
    
    if (buyDate && !buyDate.value) {
        const now = new Date();
        buyDate.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    if (sellDate && !sellDate.value) {
        const now = new Date();
        sellDate.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    if (dividendDate && !dividendDate.value) {
        const now = new Date();
        dividendDate.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    
    // 摘要按鈕切換
    initSummaryToggle();
    // 檢查預約買入
    checkScheduledBuys();
    
    // 載入投資紀錄
    updateInvestmentRecords();
    
    // 更新投資總覽
    updateInvestmentOverview();
    
    // 初始化買入按鈕
    const buyBtn = document.getElementById('investmentBuyBtn');
    if (buyBtn) {
        buyBtn.addEventListener('click', () => {
            playClickSound(); // 播放點擊音效
            showInvestmentInputPage('buy');
        });
    }

    // 初始化定期定額按鈕
    const dcaBtn = document.getElementById('investmentDCABtn');
    if (dcaBtn) {
        dcaBtn.addEventListener('click', () => {
            playClickSound(); // 播放點擊音效
            showDCAManagementPage();
        });
    }

    const allocationBtn = document.getElementById('investmentAllocationBtn');
    if (allocationBtn) {
        allocationBtn.addEventListener('click', () => {
            playClickSound();
            showAssetAllocationModal();
        });
    }

    const rebalanceBtn = document.getElementById('investmentRebalanceBtn');
    if (rebalanceBtn) {
        rebalanceBtn.addEventListener('click', () => {
            playClickSound();
            showAnnualRebalanceModal();
        });
    }
    
    // 初始化強制重新抓價按鈕
    const forceRefreshBtn = document.getElementById('forceRefreshBtn');
    if (forceRefreshBtn) {
        forceRefreshBtn.addEventListener('click', async () => {
            playClickSound();
            forceRefreshBtn.disabled = true;
            forceRefreshBtn.textContent = '⏳';
            try {
                await forceRefreshAllPrices();
            } finally {
                forceRefreshBtn.disabled = false;
                forceRefreshBtn.textContent = '🔄';
            }
        });
    }
    
    // 初始化定時自動更新按鈕
    const autoRefreshBtn = document.getElementById('autoRefreshToggleBtn');
    if (autoRefreshBtn) {
        autoRefreshBtn.addEventListener('click', () => {
            playClickSound();
            toggleAutoRefreshPrices();
        });
    }
    
    // 初始化定時更新狀態
    initAutoRefreshPrices();
    updateAutoRefreshButton();

    // 初始化搜尋功能
    initStockSearch();

    // 初始化股債配置 / 年度再平衡
    initAssetAllocationCard();
    
    // 先使用已保存的價格更新顯示
    updateInvestmentOverview();
    
    // 然後自動載入所有持股的現價（在背景執行）
    // 使用 setTimeout 確保頁面先顯示，再開始獲取價格
    setTimeout(() => {
        autoLoadStockPrices();
    }, 500);
}

function getAssetAllocationSettings() {
    try {
        const raw = localStorage.getItem('assetAllocationSettings');
        const parsed = raw ? JSON.parse(raw) : {};
        const targetStock = parseFloat(parsed.targetStockRatio);
        const targetBond = parseFloat(parsed.targetBondRatio);
        const month = parseInt(parsed.rebalanceMonth, 10);
        const day = parseInt(parsed.rebalanceDay, 10);
        const horizon = parseInt(parsed.rebalanceHorizonMonths, 10);

        return {
            targetStockRatio: Number.isFinite(targetStock) ? targetStock : 80,
            targetBondRatio: Number.isFinite(targetBond) ? targetBond : 20,
            rebalanceMonth: Number.isFinite(month) ? month : 1,
            rebalanceDay: Number.isFinite(day) ? day : 1,
            rebalanceStockTicker: (parsed.rebalanceStockTicker || '0050').toString().trim(),
            rebalanceBondTicker: (parsed.rebalanceBondTicker || '00751B').toString().trim(),
            rebalanceHorizonMonths: Number.isFinite(horizon) ? horizon : 12
        };
    } catch (_) {
        return {
            targetStockRatio: 80,
            targetBondRatio: 20,
            rebalanceMonth: 1,
            rebalanceDay: 1,
            rebalanceStockTicker: '0050',
            rebalanceBondTicker: '00751B',
            rebalanceHorizonMonths: 12
        };
    }
}

function saveAssetAllocationSettings(settings) {
    try {
        localStorage.setItem('assetAllocationSettings', JSON.stringify(settings || {}));
    } catch (error) {
        console.error('保存股債配置設定失敗:', error);
    }
}

function normalizeRatioPair(stockRatio, bondRatio) {
    const s = Math.max(0, parseFloat(stockRatio) || 0);
    const b = Math.max(0, parseFloat(bondRatio) || 0);
    const sum = s + b;
    if (sum <= 0) return { stockPct: 0.8, bondPct: 0.2 };
    return { stockPct: s / sum, bondPct: b / sum };
}

function isBondInstrumentByCode(stockCode) {
    const code = String(stockCode || '').trim();
    if (!code) return false;
    if (code.startsWith('A0')) return true;
    if (code.endsWith('B')) return true;
    return false;
}

function computeStockBondMarketValues() {
    const portfolio = getPortfolio();
    let stockValue = 0;
    let bondValue = 0;

    portfolio.forEach(item => {
        const code = item.stockCode;
        const currentPrice = getStockCurrentPrice(code) || item.avgCost || 0;
        const value = (currentPrice || 0) * (item.shares || 0);
        if (isBondInstrumentByCode(code)) {
            bondValue += value;
        } else {
            stockValue += value;
        }
    });

    return {
        stockValue,
        bondValue,
        totalValue: stockValue + bondValue
    };
}

function sumEnabledDcaAmount() {
    const plans = JSON.parse(localStorage.getItem('dcaPlans') || '[]');
    return plans.filter(p => p && p.enabled).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
}

function formatPct(value) {
    if (value == null || !isFinite(value)) return '--';
    return `${(value * 100).toFixed(1)}%`;
}

function formatNtd(value) {
    const n = Math.round(parseFloat(value) || 0);
    return `NT$${n.toLocaleString('zh-TW')}`;
}

function calculateRebalanceAdvice({ budget, horizonMonths, targetStockRatio, targetBondRatio }) {
    const { stockPct, bondPct } = normalizeRatioPair(targetStockRatio, targetBondRatio);
    const values = computeStockBondMarketValues();

    const T = values.totalValue;
    const S = values.stockValue;
    const B = values.bondValue;

    const X = Math.max(0, parseFloat(budget) || 0);
    const N = Math.max(1, parseInt(horizonMonths, 10) || 12);
    const M = sumEnabledDcaAmount();

    const desiredStockAfterLump = stockPct * (T + X);
    const lumpStock = Math.max(0, Math.min(X, desiredStockAfterLump - S));
    const lumpBond = Math.max(0, X - lumpStock);

    const afterLumpStockValue = S + lumpStock;
    const afterLumpBondValue = B + lumpBond;
    const afterLumpTotal = afterLumpStockValue + afterLumpBondValue;
    const afterLumpStockPct = afterLumpTotal > 0 ? afterLumpStockValue / afterLumpTotal : 0;
    const afterLumpBondPct = afterLumpTotal > 0 ? afterLumpBondValue / afterLumpTotal : 0;

    const totalDcaHorizon = M * N;
    const desiredStockAfterHorizon = stockPct * (T + totalDcaHorizon);
    const neededStockOverHorizon = Math.max(0, Math.min(totalDcaHorizon, desiredStockAfterHorizon - S));
    const monthlyStock = neededStockOverHorizon / N;
    const monthlyBond = Math.max(0, M - monthlyStock);

    const afterHorizonStockValue = S + neededStockOverHorizon;
    const afterHorizonBondValue = B + (totalDcaHorizon - neededStockOverHorizon);
    const afterHorizonTotal = afterHorizonStockValue + afterHorizonBondValue;
    const afterHorizonStockPct = afterHorizonTotal > 0 ? afterHorizonStockValue / afterHorizonTotal : 0;
    const afterHorizonBondPct = afterHorizonTotal > 0 ? afterHorizonBondValue / afterHorizonTotal : 0;

    const currentStockPct = T > 0 ? S / T : 0;
    const currentBondPct = T > 0 ? B / T : 0;

    // 純賣出再平衡（不加新預算，直接賣掉超重的部分）
    const rebalanceSellStock = Math.max(0, S - stockPct * T);
    const rebalanceSellBond  = Math.max(0, B - bondPct * T);
    // 賣出後，以賣出款再買入另一邊
    const afterSellTotal = T; // 總市值不變
    const afterSellStockValue = S - rebalanceSellStock + rebalanceSellBond;
    const afterSellBondValue  = B - rebalanceSellBond  + rebalanceSellStock;
    const afterSellStockPct = afterSellTotal > 0 ? afterSellStockValue / afterSellTotal : 0;
    const afterSellBondPct  = afterSellTotal > 0 ? afterSellBondValue  / afterSellTotal : 0;

    return {
        values,
        ratios: { stockPct, bondPct, currentStockPct, currentBondPct },
        lumpSum: { total: X, stock: lumpStock, bond: lumpBond },
        dca: { monthlyTotal: M, months: N, monthlyStock, monthlyBond },
        projections: {
            afterLump: { stockValue: afterLumpStockValue, bondValue: afterLumpBondValue, stockPct: afterLumpStockPct, bondPct: afterLumpBondPct },
            afterHorizon: { stockValue: afterHorizonStockValue, bondValue: afterHorizonBondValue, stockPct: afterHorizonStockPct, bondPct: afterHorizonBondPct },
            afterSell: { stockValue: afterSellStockValue, bondValue: afterSellBondValue, stockPct: afterSellStockPct, bondPct: afterSellBondPct }
        },
        rebalanceSell: { sellStock: rebalanceSellStock, sellBond: rebalanceSellBond }
    };
}

function getTickerApproxShares(ticker, amountNtd) {
    const code = String(ticker || '').trim();
    if (!code) return null;
    const price = getStockCurrentPrice(code);
    if (!price || price <= 0) return null;
    const shares = Math.floor((parseFloat(amountNtd) || 0) / price);
    return shares > 0 ? { shares, price } : { shares: 0, price };
}

function buildBuySuggestionLine({ label, ticker, amount }) {
    const amt = Math.max(0, parseFloat(amount) || 0);
    if (!ticker) return `${label}：${formatNtd(amt)}（未指定標的）`;
    const shareInfo = getTickerApproxShares(ticker, amt);
    if (!shareInfo) {
        return `${label}：${formatNtd(amt)}（${ticker}；尚無現價，請先重新抓價或到個股詳情手動輸入現價）`;
    }
    return `${label}：${formatNtd(amt)}（${ticker} 約 ${shareInfo.shares.toLocaleString('zh-TW')} 股 @ ${shareInfo.price.toFixed(2)}）`;
}

function buildSellSuggestionLine({ label, ticker, amount }) {
    const amt = Math.max(0, parseFloat(amount) || 0);
    if (!ticker) return `${label}：${formatNtd(amt)}（未指定標的）`;
    const shareInfo = getTickerApproxShares(ticker, amt);
    if (!shareInfo) {
        return `${label}：${formatNtd(amt)}（${ticker}；尚無現價，請先重新抓價）`;
    }
    return `${label}：${formatNtd(amt)}（${ticker} 約 ${shareInfo.shares.toLocaleString('zh-TW')} 股 @ ${shareInfo.price.toFixed(2)}）`;
}

function openSellPageWithStock(ticker, shares) {
    // 先確保投資專區可見
    const pageInvestment = document.getElementById('pageInvestment');
    if (!pageInvestment || pageInvestment.style.display === 'none') {
        const navBtn = document.querySelector('.nav-item[data-page="investment"]');
        if (navBtn) navBtn.click();
    }
    setTimeout(() => {
        if (typeof showInvestmentInputPage === 'function') {
            showInvestmentInputPage('sell');
        }
        setTimeout(() => {
            const code = String(ticker || '').trim();
            const codeInput = document.getElementById('calcStockCodeInput');
            const sharesInput = document.getElementById('calcSharesInput');
            const nameInput = document.getElementById('calcStockNameInput');
            if (codeInput) {
                codeInput.value = code;
                codeInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (sharesInput && shares > 0) sharesInput.value = shares;
            if (nameInput && !nameInput.value) {
                const name = window.findStockName ? (window.findStockName(code) || code) : code;
                nameInput.value = name;
            }
            if (typeof updateInvestmentDisplay === 'function') updateInvestmentDisplay();
        }, 200);
    }, 150);
}

function pickDominantAction(lumpSum) {
    if (!lumpSum || !lumpSum.total || lumpSum.total <= 0) return '未輸入預算';
    if (lumpSum.stock > lumpSum.bond) return '建議偏向買股';
    if (lumpSum.bond > lumpSum.stock) return '建議偏向買債';
    return '建議股債平均買入';
}

function updateAssetAllocationStatusText() {
    const statusEl = document.getElementById('assetAllocationStatus');
    if (!statusEl) return;
    const values = computeStockBondMarketValues();
    const T = values.totalValue;
    if (!T || T <= 0) {
        statusEl.textContent = '尚無市值資料';
        return;
    }
    const stockPct = values.stockValue / T;
    const bondPct = values.bondValue / T;
    statusEl.textContent = `目前：股 ${formatPct(stockPct)} / 債 ${formatPct(bondPct)}`;
}

function maybePromptAnnualRebalance(settings) {
    try {
        const month = parseInt(settings.rebalanceMonth, 10);
        const day = parseInt(settings.rebalanceDay, 10);
        if (!month || !day) return;

        const now = new Date();
        const isMatch = (now.getMonth() + 1) === month && now.getDate() === day;
        if (!isMatch) return;

        const yearKey = String(now.getFullYear());
        const lastYear = localStorage.getItem('assetAllocationLastPromptYear') || '';
        if (lastYear === yearKey) return;

        localStorage.setItem('assetAllocationLastPromptYear', yearKey);
        alert('提醒：今天是你設定的年度檢視日，可以進行股債再平衡（生成建議/調整定期定額）。');
    } catch (_) {}
}

function readAllocationInputs() {
    const stockRatio = document.getElementById('targetStockRatio');
    const bondRatio = document.getElementById('targetBondRatio');
    const month = document.getElementById('rebalanceMonth');
    const day = document.getElementById('rebalanceDay');
    const stockTicker = document.getElementById('rebalanceStockTicker');
    const bondTicker = document.getElementById('rebalanceBondTicker');
    const budget = document.getElementById('rebalanceLumpSumBudget');
    const horizon = document.getElementById('rebalanceHorizonMonths');

    return {
        targetStockRatio: parseFloat(stockRatio?.value) || 0,
        targetBondRatio: parseFloat(bondRatio?.value) || 0,
        rebalanceMonth: parseInt(month?.value, 10) || 1,
        rebalanceDay: parseInt(day?.value, 10) || 1,
        rebalanceStockTicker: (stockTicker?.value || '').toString().trim(),
        rebalanceBondTicker: (bondTicker?.value || '').toString().trim(),
        budget: parseFloat(budget?.value) || 0,
        rebalanceHorizonMonths: parseInt(horizon?.value, 10) || 12
    };
}

function fillAllocationInputsFromSettings(settings) {
    const setVal = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.value = v;
    };

    setVal('targetStockRatio', settings.targetStockRatio);
    setVal('targetBondRatio', settings.targetBondRatio);
    setVal('rebalanceMonth', settings.rebalanceMonth);
    setVal('rebalanceDay', settings.rebalanceDay);
    setVal('rebalanceStockTicker', settings.rebalanceStockTicker);
    setVal('rebalanceBondTicker', settings.rebalanceBondTicker);
    setVal('rebalanceHorizonMonths', settings.rebalanceHorizonMonths);
}

function initAssetAllocationCard() {
    const card = document.getElementById('assetAllocationCard');
    if (!card) return;

    const settings = getAssetAllocationSettings();
    fillAllocationInputsFromSettings(settings);
    updateAssetAllocationStatusText();
    maybePromptAnnualRebalance(settings);

    const persist = () => {
        const input = readAllocationInputs();
        const cleaned = {
            targetStockRatio: input.targetStockRatio,
            targetBondRatio: input.targetBondRatio,
            rebalanceMonth: input.rebalanceMonth,
            rebalanceDay: input.rebalanceDay,
            rebalanceStockTicker: input.rebalanceStockTicker || settings.rebalanceStockTicker,
            rebalanceBondTicker: input.rebalanceBondTicker || settings.rebalanceBondTicker,
            rebalanceHorizonMonths: input.rebalanceHorizonMonths
        };
        saveAssetAllocationSettings(cleaned);
        updateAssetAllocationStatusText();
    };

    ['targetStockRatio','targetBondRatio','rebalanceMonth','rebalanceDay','rebalanceStockTicker','rebalanceBondTicker','rebalanceHorizonMonths']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', persist);
        });

    const generateBtn = document.getElementById('rebalanceGenerateBtn');
    if (generateBtn) {
        generateBtn.onclick = async () => {
            playClickSound();
            const input = readAllocationInputs();
            if (!input.budget || input.budget <= 0) {
                const v = await showAppPromptNumber({
                    title: '一次性加碼預算',
                    label: '請輸入本次一次性加碼預算（NT$）',
                    defaultValue: 0,
                    placeholder: '例如 50000'
                });
                if (v === null) return;
                input.budget = v;
                const budgetEl = document.getElementById('rebalanceLumpSumBudget');
                if (budgetEl) {
                    budgetEl.value = input.budget;
                }
            }
            persist();

            const advice = calculateRebalanceAdvice({
                budget: input.budget,
                horizonMonths: input.rebalanceHorizonMonths,
                targetStockRatio: input.targetStockRatio,
                targetBondRatio: input.targetBondRatio
            });

            const stockTicker = input.rebalanceStockTicker;
            const bondTicker = input.rebalanceBondTicker;

            const lumpStockLine = advice.lumpSum.total > 0
                ? buildBuySuggestionLine({ label: '買股', ticker: stockTicker, amount: advice.lumpSum.stock })
                : '未輸入預算';
            const lumpBondLine = advice.lumpSum.total > 0
                ? buildBuySuggestionLine({ label: '買債', ticker: bondTicker, amount: advice.lumpSum.bond })
                : '未輸入預算';

            const monthlyStockLine = advice.dca.monthlyTotal > 0
                ? buildBuySuggestionLine({ label: '每月買股', ticker: stockTicker, amount: advice.dca.monthlyStock })
                : '目前沒有啟用的定期定額';
            const monthlyBondLine = advice.dca.monthlyTotal > 0
                ? buildBuySuggestionLine({ label: '每月買債', ticker: bondTicker, amount: advice.dca.monthlyBond })
                : '目前沒有啟用的定期定額';

            const msg = [
                `目前市值：股票 ${formatNtd(advice.values.stockValue)}／債券 ${formatNtd(advice.values.bondValue)}／合計 ${formatNtd(advice.values.totalValue)}`,
                `目前比例：股 ${formatPct(advice.ratios.currentStockPct)}／債 ${formatPct(advice.ratios.currentBondPct)}`,
                `目標比例：股 ${formatPct(advice.ratios.stockPct)}／債 ${formatPct(advice.ratios.bondPct)}`,
                '',
                `一次性加碼（只買不賣）：`,
                pickDominantAction(advice.lumpSum),
                lumpStockLine,
                lumpBondLine,
                `買完後比例：股 ${formatPct(advice.projections.afterLump.stockPct)}／債 ${formatPct(advice.projections.afterLump.bondPct)}`,
                '',
                `定期定額建議（${advice.dca.months} 個月拉回；以目前啟用總額 ${formatNtd(advice.dca.monthlyTotal)}/月）：`,
                monthlyStockLine,
                monthlyBondLine,
                `跑完 ${advice.dca.months} 個月後比例：股 ${formatPct(advice.projections.afterHorizon.stockPct)}／債 ${formatPct(advice.projections.afterHorizon.bondPct)}`
            ].join('\n');

            localStorage.setItem('assetAllocationLastAdvice', JSON.stringify({
                at: Date.now(),
                input,
                advice
            }));

            await showAppAlert({ title: '再平衡建議', message: msg });
        };
    }

    const applyBtn = document.getElementById('rebalanceApplyDcaBtn');
    if (applyBtn) {
        applyBtn.onclick = () => {
            playClickSound();
            persist();
            const input = readAllocationInputs();
            const advice = calculateRebalanceAdvice({
                budget: input.budget,
                horizonMonths: input.rebalanceHorizonMonths,
                targetStockRatio: input.targetStockRatio,
                targetBondRatio: input.targetBondRatio
            });
            applyRebalanceToDcaPlans({
                monthlyStock: advice.dca.monthlyStock,
                monthlyBond: advice.dca.monthlyBond,
                stockTicker: input.rebalanceStockTicker,
                bondTicker: input.rebalanceBondTicker
            });
        };
    }
}

function applyRebalanceToDcaPlans({ monthlyStock, monthlyBond, stockTicker, bondTicker }) {
    let plans = JSON.parse(localStorage.getItem('dcaPlans') || '[]');
    const enabledPlans = plans.filter(p => p && p.enabled);

    const classifyPlan = (plan) => {
        const code = String(plan.stockCode || '').trim();
        return isBondInstrumentByCode(code) ? 'bond' : 'stock';
    };

    const stockPlans = enabledPlans.filter(p => classifyPlan(p) === 'stock');
    const bondPlans = enabledPlans.filter(p => classifyPlan(p) === 'bond');

    const pickTemplate = () => {
        const base = enabledPlans[0] || plans[0];
        return base ? {
            day: base.day || 1,
            autoFee: !!base.autoFee,
            customFee: parseFloat(base.customFee) || 0,
            fromAccountId: base.fromAccountId || '',
            settlementAccountId: base.settlementAccountId || (base.fromAccountId || '')
        } : {
            day: 1,
            autoFee: false,
            customFee: 0,
            fromAccountId: '',
            settlementAccountId: ''
        };
    };

    const ensurePlanExists = (group, ticker) => {
        const code = String(ticker || '').trim();
        if (!code) return null;
        const existing = enabledPlans.find(p => String(p.stockCode || '').trim() === code);
        if (existing) return existing;

        const tpl = pickTemplate();
        const newPlan = {
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            stockCode: code,
            stockName: (window.findStockName ? (window.findStockName(code) || code) : code),
            amount: 0,
            day: tpl.day,
            customFee: tpl.customFee,
            autoFee: tpl.autoFee,
            enabled: true,
            fromAccountId: tpl.fromAccountId,
            settlementAccountId: tpl.settlementAccountId,
            createdAt: new Date().toISOString(),
            lastExecuted: null,
            executedCount: 0
        };
        plans.push(newPlan);
        enabledPlans.push(newPlan);
        if (group === 'stock') stockPlans.push(newPlan);
        if (group === 'bond') bondPlans.push(newPlan);
        return newPlan;
    };

    if (stockPlans.length === 0) {
        ensurePlanExists('stock', stockTicker);
    }
    if (bondPlans.length === 0) {
        ensurePlanExists('bond', bondTicker);
    }

    const scaleGroup = (groupPlans, targetTotal) => {
        if (!groupPlans || groupPlans.length === 0) return;
        const total = groupPlans.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        if (total <= 0) {
            const each = targetTotal / groupPlans.length;
            groupPlans.forEach(p => {
                p.amount = Math.max(0, Math.round(each));
            });
            return;
        }

        let remaining = Math.max(0, Math.round(targetTotal));
        groupPlans.forEach((p, idx) => {
            const weight = (parseFloat(p.amount) || 0) / total;
            const next = idx === groupPlans.length - 1 ? remaining : Math.max(0, Math.round(targetTotal * weight));
            p.amount = next;
            remaining -= next;
        });
    };

    scaleGroup(stockPlans, monthlyStock);
    scaleGroup(bondPlans, monthlyBond);

    localStorage.setItem('dcaPlans', JSON.stringify(plans));
    if (typeof updateDCAList === 'function') {
        updateDCAList();
    }
    alert(`已套用定期定額配置：\n每月股票約 ${formatNtd(monthlyStock)}\n每月債券約 ${formatNtd(monthlyBond)}\n\n（已按現有啟用計畫比例調整；若某邊原本沒有計畫，已用你選的加碼標的新增一筆）`);
}

// 初始化股票搜尋功能
function initStockSearch() {
    const searchInput = document.getElementById('stockSearchInput');
    const searchClearBtn = document.getElementById('stockSearchClearBtn');
    
    if (searchInput) {
        // 輸入時即時搜尋
        searchInput.addEventListener('input', () => {
            updateStockList();
        });
        
        // 按 Enter 鍵時也觸發搜尋
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                updateStockList();
            }
        });
        
        // 觸摸設備的輸入反饋
        searchInput.addEventListener('touchstart', () => {
            searchInput.style.transform = 'scale(0.98)';
        });
        searchInput.addEventListener('touchend', () => {
            searchInput.style.transform = 'scale(1)';
        });
    }
    
    if (searchClearBtn) {
        // 清除搜尋
        searchClearBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
                updateStockList();
            }
        });
        
        // 觸摸反饋
        searchClearBtn.addEventListener('touchstart', () => {
            searchClearBtn.style.transform = 'scale(0.9)';
        });
        searchClearBtn.addEventListener('touchend', () => {
            searchClearBtn.style.transform = 'scale(1)';
        });
    }
}

// 清除所有手動輸入的價格標記，讓系統重新抓價
function clearManualPriceMarks() {
    const stockPrices = JSON.parse(localStorage.getItem('stockCurrentPrices') || '{}');
    let clearedCount = 0;
    
    for (const stockCode in stockPrices) {
        const priceData = stockPrices[stockCode];
        if (priceData && typeof priceData === 'object' && priceData.isManual) {
            // 保留價格，但清除手動標記
            stockPrices[stockCode] = {
                price: priceData.price,
                timestamp: priceData.timestamp,
                isManual: false
            };
            clearedCount++;
        }
    }
    
    localStorage.setItem('stockCurrentPrices', JSON.stringify(stockPrices));
    console.log(`✅ 已清除 ${clearedCount} 個手動輸入標記`);
    return clearedCount;
}

// 強制重新抓取所有股價（忽略手動標記）
async function forceRefreshAllPrices() {
    // 先清除所有手動標記
    const clearedCount = clearManualPriceMarks();
    
    // 然後重新抓取所有股價
    await autoLoadStockPrices();
    
    if (clearedCount > 0) {
        console.log(`🔄 已清除 ${clearedCount} 個手動標記並重新抓取股價`);
    }
}

// 定時自動更新股價的 interval ID
let autoRefreshIntervalId = null;
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 分鐘

// 啟動定時自動更新股價
function startAutoRefreshPrices() {
    if (autoRefreshIntervalId) {
        console.log('⏰ 定時更新已在運行中');
        return;
    }
    
    autoRefreshIntervalId = setInterval(async () => {
        console.log('⏰ 定時自動更新股價...');
        // 定時更新時清除手動標記，確保能抓到最新價格
        clearManualPriceMarks();
        await autoLoadStockPrices();
    }, AUTO_REFRESH_INTERVAL);
    
    // 保存設定到 localStorage
    localStorage.setItem('autoRefreshPrices', 'true');
    console.log('⏰ 已啟動定時自動更新股價（每 5 分鐘）');
    
    // 更新按鈕狀態
    updateAutoRefreshButton();
}

// 停止定時自動更新股價
function stopAutoRefreshPrices() {
    if (autoRefreshIntervalId) {
        clearInterval(autoRefreshIntervalId);
        autoRefreshIntervalId = null;
        console.log('⏹️ 已停止定時自動更新股價');
    }
    
    // 保存設定到 localStorage
    localStorage.setItem('autoRefreshPrices', 'false');
    
    // 更新按鈕狀態
    updateAutoRefreshButton();
}

// 切換定時自動更新狀態
function toggleAutoRefreshPrices() {
    if (autoRefreshIntervalId) {
        stopAutoRefreshPrices();
    } else {
        startAutoRefreshPrices();
    }
}

// 更新自動更新按鈕狀態
function updateAutoRefreshButton() {
    const btn = document.getElementById('autoRefreshToggleBtn');
    if (btn) {
        const isRunning = !!autoRefreshIntervalId;
        btn.textContent = isRunning ? '⏹️' : '⏰';
        btn.title = isRunning ? '停止定時更新（每5分鐘）' : '啟動定時更新（每5分鐘）';
        btn.classList.toggle('is-running', isRunning);
    }
}

// 初始化時啟動自動更新：每次刷新立即抓價，並開啟定時更新
function initAutoRefreshPrices() {
    // 先做一次即時抓價（尊重手動價格，函式內會跳過）
    autoLoadStockPrices();

    // 預設開啟定時更新
    startAutoRefreshPrices();

    // 記錄設定，方便之後需要關閉時仍有狀態可循
    localStorage.setItem('autoRefreshPrices', 'true');
}

// 自動載入所有持股的現價
async function autoLoadStockPrices() {
    const portfolio = getPortfolio();
    if (portfolio.length === 0) return;
    
    // 獲取所有股票代碼
    const stockCodes = portfolio.map(stock => stock.stockCode);
    
    // 顯示載入提示
    const refreshBtn = document.getElementById('refreshInvestmentBtn');
    if (refreshBtn) {
        refreshBtn.textContent = '載入中...';
        refreshBtn.disabled = true;
    }
    
    try {
        // 批量獲取價格（逐個獲取，避免並發過多）
        let successCount = 0;
        let skippedCount = 0;
        for (const code of stockCodes) {
            try {
                const price = await fetchStockPrice(code, { allowPrompt: false });
                if (price) {
                    successCount++;
                    console.log(`成功獲取 ${code} 價格: ${price}`);
                } else {
                    console.log(`無法獲取 ${code} 價格，使用已保存的價格`);
                }

                // 每獲取一個價格就更新一次顯示，讓用戶看到即時更新
                updateInvestmentSummary();
                updateStockList();
            }
            catch (err) {
                console.error(`獲取 ${code} 股價失敗:`, err);
            }
        }
        
        console.log(`價格更新完成: ${successCount}/${stockCodes.length} 成功`);
        
        // 最後再更新一次，確保所有數據都是最新的
        updateInvestmentSummary();
        updateStockList();
    } catch (error) {
        console.error('自動載入股價失敗:', error);
        // 即使失敗也要更新顯示，使用已保存的價格
        updateInvestmentSummary();
        updateStockList();
    } finally {
        // 恢復按鈕
        if (refreshBtn) {
            refreshBtn.textContent = '🔄';
            refreshBtn.disabled = false;
        }
    }
}

// 初始化投資類型切換
function initInvestmentTypeTabs() {
    document.querySelectorAll('.investment-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // 更新按鈕狀態
            document.querySelectorAll('.investment-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const type = btn.dataset.type;
            
            // 顯示對應的表單
            document.getElementById('buyForm').style.display = type === 'buy' ? 'block' : 'none';
            document.getElementById('sellForm').style.display = type === 'sell' ? 'block' : 'none';
            document.getElementById('dividendForm').style.display = type === 'dividend' ? 'block' : 'none';
            document.getElementById('portfolioList').style.display = type === 'portfolio' ? 'block' : 'none';
            document.getElementById('investmentRecords').style.display = type === 'portfolio' ? 'none' : 'block';
            
            // 更新持股選擇列表
            if (type === 'sell' || type === 'dividend') {
                updateStockSelects();
            }
        });
    });
}

function exportExpenseCategorySummaryCsv() {
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const expenses = records.filter(r => r && (r.type === 'expense' || !r.type));

    if (!expenses.length) {
        alert('沒有找到支出記錄');
        return;
    }

    const sums = new Map();
    const counts = new Map();

    expenses.forEach(r => {
        const category = (r.category || '未分類').toString();
        const amount = Number(String(r.amount ?? 0).replace(/,/g, '')) || 0;
        sums.set(category, (sums.get(category) || 0) + amount);
        counts.set(category, (counts.get(category) || 0) + 1);
    });

    const rows = Array.from(sums.entries())
        .map(([category, total]) => ({ category, total, count: counts.get(category) || 0 }))
        .sort((a, b) => b.total - a.total);

    const escapeCsv = (v) => {
        const s = (v ?? '').toString();
        if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
        return s;
    };

    const header = ['分類', '總金額', '筆數'];
    const lines = [header.map(escapeCsv).join(',')]
        .concat(rows.map(r => [r.category, Math.round(r.total), r.count].map(escapeCsv).join(',')));

    const csv = lines.join('\n');
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const filename = `expense_category_summary_${y}-${m}-${d}.csv`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
}

function getGoogleSheetUploadUrl() {
    return (localStorage.getItem('googleSheetUploadUrl') || '').trim();
}

function normalizeGoogleScriptUrl(url) {
    return String(url || '').trim().replace(/\/dev(?=($|[?#]))/, '/exec');
}

function isMobileUploadEnvironment() {
    const ua = navigator.userAgent || '';
    return /Android|iPhone|iPad|iPod/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua));
}

function buildGoogleScriptBody(payload) {
    const body = new URLSearchParams();
    body.set('data', JSON.stringify(payload || {}));
    Object.entries(payload || {}).forEach(([key, value]) => {
        if (value == null) return;
        if (['string', 'number', 'boolean'].includes(typeof value)) {
            body.set(key, String(value));
        }
    });
    return body;
}

async function postToGoogleScript(uploadUrl, payload, options = {}) {
    const url = normalizeGoogleScriptUrl(uploadUrl);
    const timeoutMs = options.timeoutMs || 45000;
    const useOpaque = options.preferOpaque || isMobileUploadEnvironment();
    const payloadFormat = options.payloadFormat || 'form';
    const contentType = payloadFormat === 'json'
        ? 'text/plain;charset=UTF-8'
        : 'application/x-www-form-urlencoded;charset=UTF-8';
    const createBody = () => payloadFormat === 'json'
        ? JSON.stringify(payload || {})
        : buildGoogleScriptBody(payload);

    if (useOpaque) {
        await fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-store',
            headers: {
                'Content-Type': contentType
            },
            body: createBody()
        });
        return { success: true, opaque: true };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-store',
            redirect: 'follow',
            headers: {
                'Content-Type': contentType,
                'Accept': 'application/json,text/plain,*/*'
            },
            body: createBody(),
            signal: controller.signal
        });
        const text = await response.text();
        let result = {};
        try {
            result = text ? JSON.parse(text) : {};
        } catch (_) {
            result = { success: response.ok, raw: text };
        }
        if (!response.ok || result.success === false || result.ok === false) {
            throw new Error(result.error || `HTTP ${response.status}`);
        }
        return result;
    } catch (error) {
        if (error && error.name === 'AbortError') {
            throw new Error('連線逾時，請確認網路或 Google Apps Script 部署狀態。');
        }
        await fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-store',
            headers: {
                'Content-Type': contentType
            },
            body: createBody()
        });
        return { success: true, opaque: true };
    } finally {
        clearTimeout(timer);
    }
}

async function downloadJsonFileCompat(data, filename) {
    const json = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });

    if (isMobileUploadEnvironment() && navigator.canShare && navigator.share) {
        try {
            const file = new File([blob], filename, { type: blob.type });
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: filename });
                return;
            }
        } catch (_) {
            // Fall through to the normal download link.
        }
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        link.remove();
    }, 1000);
}

function openFilePickerCompat(input) {
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    input.style.top = '0';
    input.style.width = '1px';
    input.style.height = '1px';
    input.style.opacity = '0';
    if (!input.parentNode) {
        document.body.appendChild(input);
    }
    input.click();
}

function getGoogleCloudBackupKey() {
    return (localStorage.getItem('googleCloudBackupKey') || '').trim();
}

function setGoogleCloudBackupKey() {
    const current = getGoogleCloudBackupKey();
    const next = prompt('請輸入雲端備份碼（換裝置時用同一組即可還原）\n\n建議：使用長一點、難猜的字串', current);
    if (next == null) return;
    const v = String(next).trim();
    if (!v) {
        localStorage.removeItem('googleCloudBackupKey');
        alert('已清除雲端備份碼');
        return;
    }
    localStorage.setItem('googleCloudBackupKey', v);
    alert('已儲存雲端備份碼');
}

function collectFullBackupPayload() {
    return {
        // 記帳相關
        accountingRecords: JSON.parse(localStorage.getItem('accountingRecords') || '[]'),
        categoryBudgets: JSON.parse(localStorage.getItem('categoryBudgets') || '{}'),
        categoryEnabledState: JSON.parse(localStorage.getItem('categoryEnabledState') || '{}'),
        dailyBudgetTracking: JSON.parse(localStorage.getItem('dailyBudgetTracking') || '{}'),
        customCategories: JSON.parse(localStorage.getItem('customCategories') || '[]'),
        categoryCustomIcons: JSON.parse(localStorage.getItem('categoryCustomIcons') || '{}'),

        // 投資相關
        investmentRecords: JSON.parse(localStorage.getItem('investmentRecords') || '[]'),
        dcaPlans: JSON.parse(localStorage.getItem('dcaPlans') || '[]'),
        stockCurrentPrices: JSON.parse(localStorage.getItem('stockCurrentPrices') || '{}'),

        // 分期
        installmentRules: JSON.parse(localStorage.getItem('installmentRules') || '[]'),

        // 帳戶相關
        accounts: JSON.parse(localStorage.getItem('accounts') || '[]'),

        // 表情和圖標
        imageEmojis: JSON.parse(localStorage.getItem('imageEmojis') || '[]'),

        // 成員
        members: JSON.parse(localStorage.getItem('members') || '[]'),

        // 設定
        theme: localStorage.getItem('theme') || 'default',
        fontSize: localStorage.getItem('fontSize') || 'medium',
        customTheme: JSON.parse(localStorage.getItem('customTheme') || '{}'),

        // 備份資訊
        backupDate: new Date().toISOString(),
        backupVersion: 'cloud-1.0',
        appName: '記帳本'
    };
}

function cloudBackupToGoogleSheet() {
    const url = getGoogleSheetUploadUrl();
    if (!url) {
        alert('尚未設定 Web App URL');
        setGoogleSheetUploadUrl();
        return;
    }

    const backupKey = getGoogleCloudBackupKey();
    if (!backupKey) {
        alert('尚未設定雲端備份碼');
        setGoogleCloudBackupKey();
        return;
    }

    const payloadData = collectFullBackupPayload();
    const snapshot = JSON.stringify(payloadData);

    const payload = {
        action: 'save_snapshot',
        backupKey,
        snapshot
    };

    postToGoogleScript(url, payload, { timeoutMs: 45000, payloadFormat: 'json' }).then(() => {
        alert('已送出雲端備份（同一份 Google Sheet）\n\n請到 Google Sheet 確認是否有成功寫入。\n\n換裝置時，設定相同 Web App URL + 雲端備份碼，即可雲端還原。');
    }).catch((e) => {
        alert('雲端備份失敗：' + (e && e.message ? e.message : e));
    });
}

function cloudRestoreFromGoogleSheet() {
    const url = getGoogleSheetUploadUrl();
    if (!url) {
        alert('尚未設定 Web App URL');
        setGoogleSheetUploadUrl();
        return;
    }

    const backupKey = getGoogleCloudBackupKey();
    if (!backupKey) {
        alert('尚未設定雲端備份碼');
        setGoogleCloudBackupKey();
        return;
    }

    if (!confirm('確定要從雲端還原資料嗎？\n\n這將覆蓋現有的所有資料！')) {
        return;
    }

    // JSONP：用 script tag 取得資料（避免瀏覽器 CORS 限制）
    const cbName = `__cloudRestoreCb_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement('script');
    let restoreTimer = null;
    const cleanup = () => {
        if (restoreTimer) clearTimeout(restoreTimer);
        try { delete window[cbName]; } catch (_) { window[cbName] = undefined; }
        if (script && script.parentNode) script.parentNode.removeChild(script);
    };

    window[cbName] = async (res) => {
        try {
            if (!res || !res.ok) {
                const err = (res && res.error) ? String(res.error) : '未知錯誤';
                if (err === 'Backup not found') {
                    const safeKey = backupKey ? `${backupKey.slice(0, 3)}***（長度 ${backupKey.length}）` : '(空)';
                    alert(
                        '雲端還原失敗：Backup not found\n\n' +
                        '代表雲端找不到此備份碼的備份資料。請依序檢查：\n' +
                        '1) 你是否曾在「雲端備份（完整）」成功備份過？（建議先備份一次再還原）\n' +
                        '2) Web App URL 是否正確、是否指到同一份 Google Sheet？\n' +
                        '3) 雲端備份碼是否完全一致（含大小寫/空白）？\n\n' +
                        `目前 Web App URL：${url}\n` +
                        `目前備份碼：${safeKey}`
                    );
                } else {
                    alert('雲端還原失敗：' + err);
                }
                cleanup();
                return;
            }

            const snapshotStr = res.snapshot;
            if (!snapshotStr) {
                alert('雲端還原失敗：找不到備份內容');
                cleanup();
                return;
            }

            const data = JSON.parse(snapshotStr);
            await applyBackupDataPayload(data);
        } catch (e) {
            alert('雲端還原失敗：' + (e && e.message ? e.message : e));
        } finally {
            cleanup();
        }
    };

    const qs = new URLSearchParams({
        action: 'load_snapshot',
        backupKey,
        callback: cbName,
        _t: String(Date.now())
    });
    const restoreUrl = normalizeGoogleScriptUrl(url);
    script.src = restoreUrl + (restoreUrl.includes('?') ? '&' : '?') + qs.toString();
    restoreTimer = setTimeout(() => {
        alert('雲端還原連線逾時，請確認手機網路、Web App URL 是否為 /exec，以及 Apps Script 是否開放 Anyone 存取。');
        cleanup();
    }, 45000);
    script.onerror = () => {
        alert('雲端還原失敗：無法連線到雲端備份服務（請確認 Web App 部署權限/網址）');
        cleanup();
    };
    document.body.appendChild(script);
}

function setGoogleSheetUploadUrl() {
    const current = getGoogleSheetUploadUrl();
    const url = prompt('請輸入 Google Apps Script Web App URL（/exec）', current);
    if (url == null) return;
    const next = normalizeGoogleScriptUrl(url);
    if (!next) {
        localStorage.removeItem('googleSheetUploadUrl');
        alert('已清除 Web App URL');
        return;
    }
    localStorage.setItem('googleSheetUploadUrl', next);
    alert('已儲存 Web App URL');
}

function buildAccountingRecordsTable(records) {
    const header = [
        'date',
        'type',
        'category',
        'amount',
        'note',
        'account',
        'member',
        'emoji',
        'isNextMonthBill',
        'timestamp'
    ];

    const rows = records.map(r => {
        const date = r?.date ?? '';
        const type = r?.type ?? '';
        const category = r?.category ?? '';
        const amount = Number(String(r?.amount ?? 0).replace(/,/g, '')) || 0;
        const note = r?.note ?? '';
        const account = r?.account ?? '';
        const member = r?.member ?? '';
        const emoji = r?.emoji ?? '';
        const isNextMonthBill = r?.isNextMonthBill ? 'true' : 'false';
        const timestamp = r?.timestamp ?? '';
        return [date, type, category, amount, note, account, member, emoji, isNextMonthBill, timestamp];
    });

    return [header, ...rows];
}

function uploadAllRecordsToGoogleSheet() {
    uploadAllRecordsDetailsToGoogleSheet();
}

function uploadAllRecordsDetailsToGoogleSheet() {
    const url = getGoogleSheetUploadUrl();
    if (!url) {
        alert('尚未設定 Web App URL');
        setGoogleSheetUploadUrl();
        return;
    }

    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    if (!records.length) {
        alert('沒有找到任何記錄');
        return;
    }

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const sheetName = `Records-${y}-${m}-${d} ${hh}${mm}`;

    const table = buildAccountingRecordsTable(records);
    const payload = {
        action: 'upload_table',
        sheetName,
        table
    };

    fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then(() => {
        alert(`已送出上傳，請到 Google Sheet 查看分頁：${sheetName}`);
    }).catch((e) => {
        alert('上傳失敗：' + (e && e.message ? e.message : e));
    });
}

function sanitizeGoogleSheetTabName(name) {
    const raw = String(name ?? '').trim() || '未命名';
    // Google Sheet tab name cannot contain: : \ / ? * [ ]
    const cleaned = raw.replace(/[:\\/\?\*\[\]]/g, '_').slice(0, 100);
    return cleaned || '未命名';
}

function buildAccountingRecordsTableForAccount(records, accountId, accountsById) {
    const header = [
        'date',
        'type',
        'category',
        'amount',
        'note',
        'account',
        'direction',
        'counterpartyAccount',
        'member',
        'emoji',
        'isNextMonthBill',
        'timestamp'
    ];

    const accountName = accountsById[accountId]?.name || accountId || '未分類帳戶';

    const rows = records.map(r => {
        const date = r?.date ?? '';
        const type = r?.type ?? '';
        const category = r?.category ?? '';
        const amount = Number(String(r?.amount ?? 0).replace(/,/g, '')) || 0;
        const note = r?.note ?? '';
        const member = r?.member ?? '';
        const emoji = r?.emoji ?? '';
        const isNextMonthBill = r?.isNextMonthBill ? 'true' : 'false';
        const timestamp = r?.timestamp ?? '';

        if (type === 'transfer') {
            const fromId = r?.fromAccount ?? '';
            const toId = r?.toAccount ?? '';
            const direction = fromId === accountId ? 'out' : (toId === accountId ? 'in' : '');
            const counterpartyId = direction === 'out' ? toId : (direction === 'in' ? fromId : '');
            const counterpartyAccount = accountsById[counterpartyId]?.name || counterpartyId;
            return [date, type, category, amount, note, accountName, direction, counterpartyAccount, member, emoji, isNextMonthBill, timestamp];
        }

        return [date, type, category, amount, note, accountName, '', '', member, emoji, isNextMonthBill, timestamp];
    });

    return [header, ...rows];
}

async function uploadRecordsByAccountToGoogleSheet() {
    const url = getGoogleSheetUploadUrl();
    if (!url) {
        alert('尚未設定 Web App URL');
        setGoogleSheetUploadUrl();
        return;
    }

    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    if (!records.length) {
        alert('沒有找到任何記錄');
        return;
    }

    const accounts = getAccounts();
    const accountsById = {};
    accounts.forEach(a => {
        if (a && a.id) accountsById[a.id] = a;
    });

    const uniqueTabNames = new Map();
    const ensureUniqueTabName = (base) => {
        const safe = sanitizeGoogleSheetTabName(base);
        const count = uniqueTabNames.get(safe) || 0;
        uniqueTabNames.set(safe, count + 1);
        return count === 0 ? safe : `${safe} (${count + 1})`;
    };

    const recordsByAccount = new Map();
    const ensureBucket = (id) => {
        const key = id || 'UNASSIGNED';
        if (!recordsByAccount.has(key)) recordsByAccount.set(key, []);
        return recordsByAccount.get(key);
    };

    records.forEach(r => {
        if (!r) return;
        const type = r.type || (r.fromAccount || r.toAccount ? 'transfer' : 'expense');
        if (type === 'transfer') {
            const fromId = r.fromAccount;
            const toId = r.toAccount;
            if (fromId) ensureBucket(fromId).push(r);
            if (toId && toId !== fromId) ensureBucket(toId).push(r);
            return;
        }
        ensureBucket(r.account).push(r);
    });

    const createdTabs = [];
    for (const [accountId, groupRecords] of recordsByAccount.entries()) {
        const accountName = accountId === 'UNASSIGNED'
            ? '未分類帳戶'
            : (accountsById[accountId]?.name || accountId);

        const sheetName = ensureUniqueTabName(accountName);
        const table = buildAccountingRecordsTableForAccount(groupRecords, accountId === 'UNASSIGNED' ? '' : accountId, accountsById);
        const payload = {
            action: 'upload_table',
            sheetName,
            table
        };

        await fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        createdTabs.push(sheetName);
    }

    alert(`已送出按帳戶備份（${createdTabs.length} 個分頁）\n\n請到 Google Sheet 查看分頁：\n${createdTabs.join('\n')}`);
}

function maybeRemindMonthlyUpload() {
    const now = new Date();
    if (now.getDate() !== 20) return;

    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const monthKey = `${y}-${m}`;
    const storageKey = 'monthlyUploadReminderLastMonth';

    const last = localStorage.getItem(storageKey);
    if (last === monthKey) return;

    localStorage.setItem(storageKey, monthKey);

    const shouldGo = confirm('今天是每月20號，記得上傳本月記帳資料到 Google Sheet！\n\n要現在前往【設定】嗎？');
    if (!shouldGo) return;
    if (typeof showSettingsPage === 'function') {
        showSettingsPage();
        return;
    }
    const settingsNav = document.querySelector('.nav-item[data-page="settings"]');
    if (settingsNav) settingsNav.click();
}

function buildIncomeExpenseCategorySummaryTable(records) {
    const header = ['type', 'category', 'total_amount', 'count'];

    const rowsByKey = new Map();
    records.forEach(r => {
        if (!r) return;
        const type = r.type || 'expense';
        if (type !== 'expense' && type !== 'income') return;
        const category = (r.category || '未分類').toString();
        const amount = Number(String(r.amount ?? 0).replace(/,/g, '')) || 0;
        const key = `${type}__${category}`;
        const cur = rowsByKey.get(key) || { type, category, total: 0, count: 0 };
        cur.total += amount;
        cur.count += 1;
        rowsByKey.set(key, cur);
    });

    const rows = Array.from(rowsByKey.values())
        .sort((a, b) => {
            if (a.type !== b.type) return a.type.localeCompare(b.type);
            return b.total - a.total;
        })
        .map(r => [r.type, r.category, Math.round(r.total), r.count]);

    return [header, ...rows];
}

function uploadIncomeExpenseCategorySummaryToGoogleSheet() {
    const url = getGoogleSheetUploadUrl();
    if (!url) {
        alert('尚未設定 Web App URL');
        setGoogleSheetUploadUrl();
        return;
    }

    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    if (!records.length) {
        alert('沒有找到任何記錄');
        return;
    }

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const sheetName = `Summary-${y}-${m}-${d} ${hh}${mm}`;

    const table = buildIncomeExpenseCategorySummaryTable(records);
    if (table.length <= 1) {
        alert('沒有找到收入/支出可加總的記錄');
        return;
    }

    const payload = {
        action: 'upload_table',
        sheetName,
        table
    };

    fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then(() => {
        alert(`已送出上傳，請到 Google Sheet 查看分頁：${sheetName}`);
    }).catch((e) => {
        alert('上傳失敗：' + (e && e.message ? e.message : e));
    });
}

// 初始化買入表單
function initBuyForm() {
    const submitBtn = document.getElementById('submitBuy');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            playClickSound(); // 播放點擊音效
            const stockCode = document.getElementById('stockCode').value.trim();
            const buyDate = document.getElementById('buyDate').value;
            const buyPrice = parseFloat(document.getElementById('buyPrice').value);
            const buyShares = parseInt(document.getElementById('buyShares').value);
            const buyFee = parseFloat(document.getElementById('buyFee').value) || 0;
            const isDCA = document.getElementById('isDCA').checked;
            const buyNote = document.getElementById('buyNote').value.trim();
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            
            if (!stockCode || !buyDate || !buyPrice || !buyShares) {
                alert('請填寫所有必填欄位');
        return;
            }
            
            if (buyPrice <= 0 || buyShares <= 0) {
                alert('價格和股數必須大於0');
                    return;
            }
            
            const timestamp = new Date().toISOString();
            // 如果日期在未來，儲存為預約買入，不立即出現在紀錄
            if (buyDate > todayStr) {
                const scheduled = JSON.parse(localStorage.getItem(SCHEDULED_BUY_STORAGE_KEY) || '[]');
                scheduled.push({
                    id: timestamp,
                    type: 'buy',
                    stockCode,
                    stockName: stockCode,
                    date: buyDate,
                    price: buyPrice,
                    shares: buyShares,
                    fee: buyFee,
                    isDCA,
                    note: buyNote || '預約買入'
                });
                localStorage.setItem(SCHEDULED_BUY_STORAGE_KEY, JSON.stringify(scheduled));
            } else {
                const buyRecord = {
                    type: 'buy',
                    stockCode: stockCode,
                    stockName: stockCode, // 可以後續擴展為股票名稱查詢
                    date: buyDate,
                    price: buyPrice,
                    shares: buyShares,
                    fee: buyFee,
                    isDCA: isDCA,
                    note: buyNote,
                    timestamp
                };
                
                // 儲存記錄
                let records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
                records.push(buyRecord);
                localStorage.setItem('investmentRecords', JSON.stringify(records));
            }
            
            // 重置表單
            document.getElementById('stockCode').value = '';
            document.getElementById('buyPrice').value = '';
            document.getElementById('buyShares').value = '';
            document.getElementById('buyFee').value = '0';
            document.getElementById('isDCA').checked = false;
            document.getElementById('buyNote').value = '';
            
            // 即時更新只在立即買入時
            if (buyDate <= todayStr) {
                updateInvestmentSummary();
                updatePortfolioList();
                updateInvestmentRecords();
                updateStockSelects();
                // 更新投資總覽
                updateInvestmentOverview();
            }
            
            // 返回投資總覽頁面
            const overview = document.getElementById('investmentOverview');
            const buyForm = document.getElementById('buyForm');
            if (overview) overview.style.display = 'block';
            if (buyForm) buyForm.style.display = 'none';
            
            alert(buyDate > todayStr ? `已預約 ${buyDate} 買入！到期會自動入帳並顯示。` : '買入記錄已儲存！');
        });
    }
}

// 初始化賣出表單
function initSellForm() {
    const submitBtn = document.getElementById('submitSell');
    const sellStockCode = document.getElementById('sellStockCode');
    const sellPrice = document.getElementById('sellPrice');
    const sellShares = document.getElementById('sellShares');
    
    // 計算預估損益
    const calculateEstimatedPnl = () => {
        const stockCode = sellStockCode.value.trim();
        const price = parseFloat(sellPrice.value) || 0;
        const shares = parseInt(sellShares.value) || 0;
        const fee = parseFloat(document.getElementById('sellFee').value) || 0;
        const tax = parseFloat(document.getElementById('sellTax').value) || 0;
        
        if (!stockCode || !price || !shares) {
            document.getElementById('estimatedPnl').textContent = 'NT$0';
            document.getElementById('estimatedPnl').className = 'pnl-value';
            return;
        }
        
        // 計算平均成本
        const portfolio = getPortfolio();
        const stock = portfolio.find(s => s.stockCode === stockCode);
        
        if (!stock || stock.shares < shares) {
            document.getElementById('estimatedPnl').textContent = '持股不足';
            document.getElementById('estimatedPnl').className = 'pnl-value';
            return;
        }
        
        const avgCost = stock.avgCost;
        const totalCost = avgCost * shares;
        const totalRevenue = price * shares - fee - tax;
        const pnl = totalRevenue - totalCost;
        
        const pnlEl = document.getElementById('estimatedPnl');
        pnlEl.textContent = `NT$${pnl.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        pnlEl.className = `pnl-value ${pnl >= 0 ? 'positive' : 'negative'}`;
    };
    
    if (sellStockCode) {
        sellStockCode.addEventListener('change', calculateEstimatedPnl);
    }
    if (sellPrice) {
        sellPrice.addEventListener('input', calculateEstimatedPnl);
    }
    if (sellShares) {
        sellShares.addEventListener('input', calculateEstimatedPnl);
    }
    
    // 提交賣出記錄的函數（可被按鈕和快捷鍵調用）
    const submitSellRecord = () => {
        playClickSound(); // 播放點擊音效
            const stockCode = sellStockCode.value.trim();
            const sellDate = document.getElementById('sellDate').value;
            const price = parseFloat(sellPrice.value);
            const shares = parseInt(sellShares.value);
            const fee = parseFloat(document.getElementById('sellFee').value) || 0;
            const tax = parseFloat(document.getElementById('sellTax').value) || 0;
            const sellNote = document.getElementById('sellNote').value.trim();
            
            if (!stockCode || !sellDate || !price || !shares) {
                alert('請填寫所有必填欄位');
                return;
            }
            
            if (price <= 0 || shares <= 0) {
                alert('價格和股數必須大於0');
                    return;
                }
                
            // 檢查持股是否足夠
            const portfolio = getPortfolio();
            const stock = portfolio.find(s => s.stockCode === stockCode);
            
            if (!stock || stock.shares < shares) {
                alert('持股不足，無法賣出');
            return;
            }
            
            // 計算實現損益
            const avgCost = stock.avgCost;
            const totalCost = avgCost * shares;
            const totalRevenue = price * shares - fee - tax;
            const realizedPnl = totalRevenue - totalCost;
            
            const sellRecord = {
                type: 'sell',
                stockCode: stockCode,
                stockName: stock.stockName,
                date: sellDate,
                price: price,
                shares: shares,
                fee: fee,
                tax: tax,
                note: sellNote,
                realizedPnl: realizedPnl,
                timestamp: new Date().toISOString()
            };
            
            // 儲存記錄
            let records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
            records.push(sellRecord);
            localStorage.setItem('investmentRecords', JSON.stringify(records));
            
            // 重置表單
            sellStockCode.value = '';
            const now = new Date();
            document.getElementById('sellDate').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            sellPrice.value = '';
            sellShares.value = '';
            document.getElementById('sellFee').value = '0';
            document.getElementById('sellTax').value = '0';
            document.getElementById('sellNote').value = '';
            document.getElementById('estimatedPnl').textContent = 'NT$0';
            document.getElementById('estimatedPnl').className = 'pnl-value';
            
            // 更新顯示
            updateInvestmentSummary();
            updatePortfolioList();
            updateInvestmentRecords();
            updateStockSelects();
            
            alert(`賣出記錄已儲存！實現損益：NT$${realizedPnl.toLocaleString('zh-TW')}`);
    };
    
    if (submitBtn) {
        submitBtn.addEventListener('click', submitSellRecord);
    }
    
}

// 快速打開賣出頁面
function quickOpenSellPage() {
    // 先切換到投資專區（如果不在投資專區）
    const investmentPage = document.getElementById('investmentPage');
    const bottomNav = document.querySelector('.bottom-nav');
    
    // 檢查是否在投資專區
    if (investmentPage && investmentPage.style.display === 'none') {
        // 切換到底部導航的投資專區
        const investmentNavBtn = document.querySelector('.nav-item[data-page="investment"]');
        if (investmentNavBtn) {
            investmentNavBtn.click();
            // 等待頁面切換完成
            setTimeout(() => {
                showInvestmentInputPage('sell');
            }, 100);
            return;
        }
    }
    
    // 如果已經在投資專區，直接顯示賣出輸入頁面
    showInvestmentInputPage('sell');
}


// 初始化股息表單
function initDividendForm() {
    const submitBtn = document.getElementById('submitDividend');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const stockCode = document.getElementById('dividendStockCode').value.trim();
            const dividendDate = document.getElementById('dividendDate').value;
            const dividendType = document.getElementById('dividendType').value;
            const perShareValue = parseFloat(document.getElementById('dividendPerShare').value);
            const sharesValue = parseInt(document.getElementById('dividendShares').value);
            let amount = parseFloat(document.getElementById('dividendAmount').value);
            const reinvest = document.getElementById('dividendReinvest').checked;
            const dividendNote = document.getElementById('dividendNote').value.trim();
            const exDateInput = document.getElementById('dividendExDate') || document.getElementById('dividendExDateInput');
            const historicalPerShareInput = document.getElementById('dividendHistoricalPerShare') || document.getElementById('dividendHistoricalPerShareInput');

            if ((!amount || amount <= 0) && perShareValue > 0 && sharesValue > 0) {
                amount = perShareValue * sharesValue;
                const amountInput = document.getElementById('dividendAmount');
                if (amountInput) amountInput.value = amount.toFixed(2);
            }

            if (!stockCode || !dividendDate || perShareValue <= 0 || sharesValue <= 0 || amount <= 0) {
                alert('請填寫所有必填欄位');
        return;
    }
    
            const dividendRecord = {
                type: 'dividend',
                stockCode: stockCode,
                stockName: stockCode,
                date: dividendDate,
                exDividendDate: exDateInput?.value || '',
                dividendType: dividendType,
                perShare: perShareValue,
                historicalPerShare: parseFloat(historicalPerShareInput?.value) || null,
                shares: sharesValue,
        amount: amount,
                reinvest: reinvest,
                note: dividendNote,
                timestamp: new Date().toISOString()
            };
            
            // 儲存記錄
            let records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
            records.push(dividendRecord);
            
            // 如果是現金股利且選擇再投入，自動創建買入記錄
            if (dividendRecord.dividendType === 'cash' && reinvest && amount > 0) {
                // 優先使用現價，如果沒有現價則使用平均成本，都沒有則提示用戶輸入
                const savedPrice = getStockCurrentPrice(stockCode); // 獲取保存的現價
                const portfolio = getPortfolio();
                const stock = portfolio.find(s => s.stockCode === stockCode);
                const avgCost = stock && stock.avgCost > 0 ? stock.avgCost : 0;
                
                // 優先使用現價，其次使用平均成本
                let buyPrice = savedPrice || avgCost || 0;
                
                // 如果都沒有價格，提示用戶輸入
                if (buyPrice <= 0) {
                    const userPrice = prompt(`請輸入 ${stockCode} 的現價（用於計算股利再投入的股數）：`);
                    if (userPrice && parseFloat(userPrice) > 0) {
                        buyPrice = parseFloat(userPrice);
                    } else {
                        // 用戶取消或輸入無效，不創建買入記錄
                        console.log('未輸入價格，跳過股利再投入買入記錄');
                    }
                }
                
                // 如果有有效的買入價格，計算並創建買入記錄
                if (buyPrice > 0) {
                    const reinvestFee = calculateInvestmentFee(amount);
                    const availableAmount = Math.max(amount - reinvestFee, 0);
                    const buyShares = Math.floor(availableAmount / buyPrice); // 向下取整
                    
                    if (buyShares > 0) {
                        const buyRecord = {
                            type: 'buy',
                            stockCode: stockCode,
                            stockName: stockCode,
                            date: dividendDate,
                            price: buyPrice,
                            shares: buyShares,
                            fee: reinvestFee,
                            isDividendReinvest: true, // 標記為股利再投入
                            dividendRecordId: dividendRecord.timestamp, // 關聯的股利記錄ID
                            note: `股利再投入（來自 ${dividendDate} 現金股利，使用${savedPrice ? '現價' : avgCost ? '平均成本' : '手動輸入價格'}）${dividendNote ? ' - ' + dividendNote : ''}`,
                            timestamp: new Date().toISOString()
                        };
                        records.push(buyRecord);
                        
                        // 創建記帳本轉帳記錄（從現金帳戶轉到投資帳戶）
                        try {
                            const accountingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
                            const transferRecord = {
                                type: 'transfer',
                                category: '股票再投入',
                                amount: amount, // 股利金額
                                note: `股利再投入：${stockCode} ${buyShares}股 @ NT$${buyPrice.toFixed(2)}`,
                                date: dividendDate,
                                fromAccount: '現金', // 從現金帳戶
                                toAccount: '投資', // 到投資帳戶
                                linkedInvestment: true,
                                investmentRecordId: buyRecord.timestamp,
                                timestamp: new Date().toISOString()
                            };
                            accountingRecords.push(transferRecord);
                            localStorage.setItem('accountingRecords', JSON.stringify(accountingRecords));
                            console.log('已創建股利再投入轉帳記錄');
                        } catch (e) {
                            console.warn('創建股利再投入轉帳記錄失敗:', e);
                        }
                    } else {
                        // 顯示通知：不足以買入至少1股
                        alert(`⚠️ 股利再投入金額不足\n\n股利金額：NT$${amount.toLocaleString('zh-TW')}\n手續費：NT$${reinvestFee.toLocaleString('zh-TW')}\n可用金額：NT$${availableAmount.toLocaleString('zh-TW')}\n股票現價：NT$${buyPrice.toFixed(2)}\n\n可用金額不足以買入至少1股（需要至少 NT$${buyPrice.toLocaleString('zh-TW')}）`);
                    }
                }
            }
            
            localStorage.setItem('investmentRecords', JSON.stringify(records));
    
    // 重置表單
            document.getElementById('dividendStockCode').value = '';
            const now = new Date();
            document.getElementById('dividendDate').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            document.getElementById('dividendPerShare').value = '';
            document.getElementById('dividendShares').value = '';
            document.getElementById('dividendAmount').value = '';
            document.getElementById('dividendReinvest').checked = false;
            document.getElementById('dividendNote').value = '';
            if (exDateInput) exDateInput.value = '';
            if (historicalPerShareInput) historicalPerShareInput.value = '';
            
            // 更新顯示
            updateInvestmentSummary();
            updatePortfolioList();
            updateInvestmentRecords();
            updateStockSelects();
            
            // 顯示成就感動畫
            const yearDividendEl = document.getElementById('yearDividend');
            if (yearDividendEl) {
                yearDividendEl.style.animation = 'none';
    setTimeout(() => {
                    yearDividendEl.style.animation = 'pulse 0.5s ease';
                }, 10);
            }
            
            alert('股息記錄已儲存！🎉');
        });
    }
}

// 獲取持股列表
function getPortfolio() {
    const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    const portfolio = {};
    
    records.forEach(record => {
        const stockCode = record.stockCode;
        
        if (!portfolio[stockCode]) {
            portfolio[stockCode] = {
                stockCode: stockCode,
                stockName: record.stockName || stockCode,
                shares: 0,
                totalCost: 0,
                avgCost: 0
            };
        }
        
        if (record.type === 'buy') {
            const cost = record.price * record.shares + (record.fee || 0);
            portfolio[stockCode].shares += record.shares;
            portfolio[stockCode].totalCost += cost;
            portfolio[stockCode].avgCost = portfolio[stockCode].totalCost / portfolio[stockCode].shares;
        } else if (record.type === 'sell') {
            // 使用平均成本法計算剩餘持股
            const avgCost = portfolio[stockCode].avgCost;
            portfolio[stockCode].shares -= record.shares;
            portfolio[stockCode].totalCost -= avgCost * record.shares;
            if (portfolio[stockCode].shares <= 0) {
                portfolio[stockCode].shares = 0;
                portfolio[stockCode].totalCost = 0;
                portfolio[stockCode].avgCost = 0;
            }
        } else if (record.type === 'dividend' && record.dividendType === 'stock' && record.reinvest) {
            // 股票股利再投入
            portfolio[stockCode].shares += record.shares;
        }
    });
    
    // 過濾掉持股為0的股票
    return Object.values(portfolio).filter(stock => stock.shares > 0);
}

// 獲取股票的當前價格（從 localStorage）
function getStockCurrentPrice(stockCode) {
    const stockPrices = JSON.parse(localStorage.getItem('stockCurrentPrices') || '{}');
    const priceData = stockPrices[stockCode];
    
    if (!priceData) return null;
    
    // 如果是舊格式（直接是數字），返回價格
    if (typeof priceData === 'number') {
        return priceData;
    }
    
    // 新格式：包含 price, timestamp, isManual
    if (priceData.price) {
        return priceData.price;
    }
    
    return null;
}

// 取得完整的價格資料（含 timestamp / isManual）
function getStockPriceData(stockCode) {
    const stockPrices = JSON.parse(localStorage.getItem('stockCurrentPrices') || '{}');
    const priceData = stockPrices[stockCode];
    if (!priceData) return null;
    if (typeof priceData === 'number') {
        return { price: priceData, timestamp: null, isManual: false };
    }
    return priceData;
}

// 檢查是否有今天手動輸入的價格
function hasManualPriceToday(stockCode) {
    const stockPrices = JSON.parse(localStorage.getItem('stockCurrentPrices') || '{}');
    const priceData = stockPrices[stockCode];
     
    if (!priceData || typeof priceData === 'number') {
        return false; // 舊格式或不存在
    }
    
    // 檢查是否為手動輸入
    if (!priceData.isManual) {
        return false;
    }
    
    // 檢查是否為同一天（忽略時間）
    const today = new Date();
    const priceDate = new Date(priceData.timestamp);
    
    // 檢查是否為同一天（忽略時間）
    return today.getFullYear() === priceDate.getFullYear() &&
           today.getMonth() === priceDate.getMonth() &&
           today.getDate() === priceDate.getDate();
 }

// 保存股票的當前價格到 localStorage
function saveStockCurrentPrice(stockCode, price, isManual = false) {
    const stockPrices = JSON.parse(localStorage.getItem('stockCurrentPrices') || '{}');
    stockPrices[stockCode] = {
        price: price,
        timestamp: Date.now(),
        isManual: isManual
    };
    localStorage.setItem('stockCurrentPrices', JSON.stringify(stockPrices));
}

function saveStockPreviousClosePrice(stockCode, price) {
    if (price == null || isNaN(price) || price <= 0) return;
    const previousCloses = JSON.parse(localStorage.getItem('stockPreviousClosePrices') || '{}');
    previousCloses[stockCode] = {
        price: price,
        timestamp: Date.now()
    };
    localStorage.setItem('stockPreviousClosePrices', JSON.stringify(previousCloses));
}

function showStockPriceQueryModal({ stockCode, stockName, isBondETF, defaultPrice }) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'price-query-modal';

        const querySites = [
            { label: 'Yahoo 股市', url: 'https://tw.stock.yahoo.com/quote/' + stockCode },
            { label: '鉅亨網', url: 'https://www.cnyes.com/twstock/' + stockCode },
            { label: 'MoneyDJ', url: 'https://www.moneydj.com/kmdj/stock/stock.aspx?stockid=' + stockCode }
        ];

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const header = document.createElement('div');
        header.className = 'price-query-modal__header';
        const title = document.createElement('h3');
        title.textContent = `無法取得 ${stockName || stockCode} 現價`;
        header.appendChild(title);

        const queryBtn = document.createElement('button');
        queryBtn.type = 'button';
        queryBtn.className = 'price-query-modal__action';
        queryBtn.textContent = '🔍 查詢';
        queryBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetSite = querySites[0];
            if (targetSite && targetSite.url) {
                window.open(targetSite.url, '_blank', 'noopener,noreferrer');
            }
        });
        header.appendChild(queryBtn);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'price-query-modal__close';
        closeBtn.textContent = '×';
        header.appendChild(closeBtn);

        const body = document.createElement('div');
        body.className = 'modal-body price-query-modal__body';

        const hint = document.createElement('div');
        hint.className = 'price-query-modal__hint';
        hint.textContent = isBondETF
            ? '可能原因：該債券 ETF 不在資料來源中，或代碼格式不同。你可以先到下方網站查價後再回來輸入。'
            : '可能原因：網路連線問題、股票代碼不存在或資料來源暫時無法訪問。你可以先到下方網站查價後再回來輸入。';

        const linksWrap = document.createElement('div');
        linksWrap.className = 'price-query-modal__links';
        querySites.forEach(site => {
            const a = document.createElement('a');
            a.href = site.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = `${site.label}：${site.url}`;
            a.className = 'price-query-modal__link';
            a.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            linksWrap.appendChild(a);
        });

        const inputLabel = document.createElement('div');
        inputLabel.className = 'price-query-modal__label';
        inputLabel.textContent = '請輸入現價';

        const input = document.createElement('input');
        input.type = 'number';
        input.inputMode = 'decimal';
        input.step = '0.01';
        input.min = '0';
        input.placeholder = '例如：123.45';
        input.value = (defaultPrice && defaultPrice > 0) ? defaultPrice.toFixed(2) : '';
        input.className = 'price-query-modal__input';

        const footer = document.createElement('div');
        footer.className = 'price-query-modal__footer';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.textContent = '取消';
        cancelBtn.className = 'price-query-modal__btn price-query-modal__btn--cancel';

        const okBtn = document.createElement('button');
        okBtn.type = 'button';
        okBtn.textContent = '保存';
        okBtn.className = 'price-query-modal__btn price-query-modal__btn--ok';

        footer.appendChild(cancelBtn);
        footer.appendChild(okBtn);

        body.appendChild(hint);
        body.appendChild(linksWrap);
        body.appendChild(inputLabel);
        body.appendChild(input);
        body.appendChild(footer);

        content.appendChild(header);
        content.appendChild(body);

        const cleanup = (value) => {
            try {
                document.body.removeChild(modal);
            } catch (_) {}
            resolve(value);
        };

        overlay.addEventListener('click', () => cleanup(null));
        closeBtn.addEventListener('click', () => cleanup(null));
        cancelBtn.addEventListener('click', () => cleanup(null));
        content.addEventListener('click', (e) => e.stopPropagation());

        const submit = () => {
            const raw = (input.value || '').trim();
            const v = parseFloat(raw);
            if (!raw) {
                cleanup(null);
                return;
            }
            if (!isNaN(v) && v > 0) {
                cleanup(v);
                return;
            }
            input.focus();
        };

        okBtn.addEventListener('click', submit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submit();
            }
        });

        modal.appendChild(overlay);
        modal.appendChild(content);
        document.body.appendChild(modal);

        setTimeout(() => {
            try {
                input.focus();
                if (input.value) input.select();
            } catch (_) {}
        }, 0);
    });
}

 // 從 API 獲取股票現價
async function fetchStockPrice(stockCode, options = {}) {
    const { allowPrompt = true, maxAgeMs = 6 * 60 * 60 * 1000 } = options;
   
   try {
        // 處理債券 ETF 和特殊格式
        // 台灣股票/ETF 格式：2330.TW 或 00751B.TW
        // 注意：債券 ETF 代碼如 00751B 需要保持 B 後綴
        let yahooSymbol;
        
        // 檢查是否為債券 ETF（以 B 結尾）或其他特殊格式
        if (stockCode.endsWith('B') || stockCode.endsWith('L') || stockCode.endsWith('R') || stockCode.endsWith('U') || stockCode.endsWith('K')) {
            // 債券 ETF 或特殊 ETF，保持原格式
            yahooSymbol = `${stockCode}.TWO`;
        } else if (stockCode.startsWith('A0')) {
            // 政府債券代碼（如 A04109），Yahoo Finance 可能不支持，返回 null
            console.log(`債券代碼 ${stockCode} 無法從 Yahoo Finance 獲取價格`);
            return null;
        } else {
            // 一般股票或 ETF
            yahooSymbol = `${stockCode}.TW`;
        }

        const symbolCandidates = (stockCode.endsWith('B') || stockCode.endsWith('L') || stockCode.endsWith('R') || stockCode.endsWith('U') || stockCode.endsWith('K'))
            ? [`${stockCode}.TWO`, `${stockCode}.TW`]
            : [yahooSymbol];

        // 1) Try local proxy (opt-in)
        const proxyEndpoint = 'http://localhost:5000/api/quote?symbols=';
        const enableLocalQuoteProxy = String(localStorage.getItem('useLocalQuoteProxy') || '').toLowerCase() === 'true';
        if (enableLocalQuoteProxy && !isLocalQuoteProxyInCooldown()) {
            for (const candidateSymbol of symbolCandidates) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                try {
                    const proxyUrl = `${proxyEndpoint}${encodeURIComponent(candidateSymbol)}`;
                    const proxyResponse = await fetch(proxyUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json'
                        },
                        signal: controller.signal
                    });

                    if (!proxyResponse || !proxyResponse.ok) {
                        continue;
                    }

                    const responseText = await proxyResponse.text();
                    let data;
                    try {
                        data = JSON.parse(responseText);
                    } catch (parseError) {
                        continue;
                    }

                    if (data && data.quoteResponse && data.quoteResponse.result && data.quoteResponse.result.length > 0) {
                        const q = data.quoteResponse.result[0];
                        const previousClose = q.regularMarketPreviousClose || q.regularMarketPreviousClosePrice || q.regularMarketPreviousClose || null;
                        if (previousClose && previousClose > 0) {
                            saveStockPreviousClosePrice(stockCode, previousClose);
                        }

                        const currentPrice = q.regularMarketPrice || q.postMarketPrice || q.preMarketPrice || previousClose || null;
                        if (currentPrice && currentPrice > 0) {
                            saveStockCurrentPrice(stockCode, currentPrice, false);
                            console.log(`✓ 成功獲取 ${stockCode} 價格: ${currentPrice}`);
                            return currentPrice;
                        }
                    }

                    if (data && data.chart && data.chart.result) {
                        if (data.chart.result.length === 0) {
                            continue;
                        }

                        const result = data.chart.result[0];
                        if (result && result.meta && !result.error) {
                            const previousClose = result.meta.previousClose || result.meta.regularMarketPreviousClose || null;
                            if (previousClose && previousClose > 0) {
                                saveStockPreviousClosePrice(stockCode, previousClose);
                            }

                            const currentPrice = result.meta.regularMarketPrice || previousClose || null;
                            if (currentPrice && currentPrice > 0) {
                                saveStockCurrentPrice(stockCode, currentPrice, false);
                                console.log(`✓ 成功獲取 ${stockCode} 價格: ${currentPrice}`);
                                return currentPrice;
                            }
                        }
                    }
                } catch (proxyError) {
                    if (proxyError.name === 'AbortError') {
                        continue;
                    }
                    markQuoteProxyFailed();
                    maybeAlertQuoteProxyDown();
                    break;
                } finally {
                    clearTimeout(timeoutId);
                }
            }
        }

        // 2) Public proxy fallback for ALL symbols，附加輕量重試
        for (let attempt = 0; attempt < 2; attempt++) {
            for (const candidateSymbol of symbolCandidates) {
                const yahooChartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${candidateSymbol}?interval=1d&range=1d`;
                const currentPrice = await fetchYahooChartViaPublicProxies(yahooChartUrl, stockCode);
                if (currentPrice && currentPrice > 0) {
                    saveStockCurrentPrice(stockCode, currentPrice, false);
                    console.log(`✓ 透過公開代理成功獲取 ${stockCode} 價格: ${currentPrice}`);
                    return currentPrice;
                }
            }
        }

        // 如果所有代理都失敗，嘗試使用備用方案（僅針對債券 ETF）
        // 注意：瀏覽器控制台可能仍會顯示 404 等錯誤，這是正常的，代碼會正確處理
        if (stockCode.endsWith('B')) {
            console.log(`債券 ETF ${stockCode} 無法從 Yahoo Finance 獲取價格，嘗試備用方法...`);
            
            // 嘗試方案1：使用不同的 Yahoo Finance 格式（移除 .TW 後綴）
            try {
                const alternativeSymbol = `${stockCode}.TWO`; // 不帶 .TW
                const testUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${alternativeSymbol}?interval=1d&range=1d`;
                
                // 嘗試通過代理訪問
                for (const proxyUrl of publicQuoteProxies) {
                    try {
                        let proxyResponse;
                        if (proxyUrl.includes('allorigins')) {
                            const yahooUrl = encodeURIComponent(testUrl);
                            proxyResponse = await fetch(proxyUrl + yahooUrl);
                        } else if (proxyUrl.includes('codetabs')) {
                            proxyResponse = await fetch(proxyUrl + encodeURIComponent(testUrl));
                        } else if (proxyUrl.includes('corsproxy.io')) {
                            proxyResponse = await fetch(proxyUrl + encodeURIComponent(testUrl));
                        } else {
                            proxyResponse = await fetch(proxyUrl + testUrl);
                        }
                        
                        // 檢查響應狀態
                        if (!proxyResponse || proxyResponse.status === 404) {
                            continue; // 靜默跳過 404 或無響應
                        }
                        
                        if (proxyResponse.status === 200 && proxyResponse.ok) {
                            const responseText = await proxyResponse.text();
                            try {
                                const data = JSON.parse(responseText);
                                
                                if (data && data.chart && data.chart.result && data.chart.result.length > 0) {
                                    const result = data.chart.result[0];
                                    if (result && result.meta) {
                                        const currentPrice = result.meta.regularMarketPrice || result.meta.previousClose || null;
                                        if (currentPrice && currentPrice > 0) {
                                            saveStockCurrentPrice(stockCode, currentPrice, false); // false = 自動獲取
                                            console.log(`✓ 通過備用格式成功獲取 ${stockCode} 價格: ${currentPrice}`);
                                            return currentPrice;
                                        }
                                    }
                                }
                            } catch (parseError) {
                                continue; // 解析失敗，嘗試下一個
                            }
                        }
                    } catch (altError) {
                        continue; // 靜默跳過所有錯誤
                    }
                }
            } catch (backupError) {
                console.log('備用格式嘗試失敗:', backupError);
            }
            
            // 嘗試方案2：檢查是否有已保存的價格
            const savedPrice = getStockCurrentPrice(stockCode);
            if (savedPrice && savedPrice > 0) {
                console.log(`使用已保存的 ${stockCode} 價格: ${savedPrice}`);
                return savedPrice;
            }

            // 如果都沒有，返回 null 交由通用流程處理
        }
        
        // 記錄警告信息
        if (stockCode.endsWith('B')) {
            console.warn(`債券 ETF ${stockCode} 無法自動獲取價格`);
            console.info(`可能原因：該債券 ETF 不在 Yahoo Finance 數據庫中，或代碼格式不同`);
        } else {
            console.warn(`代碼 ${stockCode} 無法獲取價格`);
            console.info(`請在個股詳情頁面手動輸入價格`);
        }
        
        // 如果有已保存的價格，返回它（即使不是今天的）
        const savedPrice = getStockCurrentPrice(stockCode);
        if (savedPrice) {
            return savedPrice;
        }
        
        throw new Error('所有代理服務都無法獲取價格');
    } catch (error) {
        const errorMsg = error.message || '未知錯誤';
        console.error(`獲取 ${stockCode} 股價失敗:`, errorMsg);
        const savedPrice = getStockCurrentPrice(stockCode);

        // 顯示友好的提示框（保持手動輸入管道）
        if (allowPrompt) {
            const stockName = findStockName(stockCode) || stockCode;
            const isBondETF = stockCode.endsWith('B');

            const manualPrice = await showStockPriceQueryModal({
                stockCode,
                stockName,
                isBondETF,
                defaultPrice: savedPrice
            });

            if (manualPrice && !isNaN(manualPrice) && manualPrice > 0) {
                saveStockCurrentPrice(stockCode, manualPrice, true);
                console.log(`✓ 已保存手動輸入的 ${stockCode} 價格: ${manualPrice}`);
                if (typeof updateInvestmentSummary === 'function') {
                    updateInvestmentSummary();
                }
                if (typeof updateStockList === 'function') {
                    updateStockList();
                }
                return manualPrice;
            }
        }
        
        // 如果是債券 ETF 或代碼不存在，給出更友好的提示
        if (stockCode.endsWith('B')) {
            console.info(`💡 提示：債券 ETF ${stockCode} 無法自動獲取價格`);
            console.info(`   請點擊該持股卡片，在「現價」欄位中手動輸入當前價格`);
        } else if (errorMsg.includes('不存在') || errorMsg.includes('404')) {
            console.info(`💡 提示：代碼 ${stockCode} 在 Yahoo Finance 中不存在`);
            console.info(`   請在個股詳情頁面手動輸入價格`);
        }
        
        // 返回已保存的價格（如果有的話），否則返回 null
        return savedPrice || null;
    }
}

// 批量獲取多支股票的現價
async function fetchMultipleStockPrices(stockCodes) {
    const promises = stockCodes.map(code => 
        fetchStockPrice(code).catch(err => {
            console.error(`獲取 ${code} 股價失敗:`, err);
            return null;
        })
    );
    
    const results = await Promise.all(promises);
    return results;
}

// 更新持股選擇列表
function updateStockSelects() {
    const portfolio = getPortfolio();
    const sellSelect = document.getElementById('sellStockSelect');
    const dividendSelect = document.getElementById('dividendStockSelect');
    
    const updateSelect = (select) => {
        if (!select) return;
        select.innerHTML = '<option value="">請選擇持股</option>';
        portfolio.forEach(stock => {
            const option = document.createElement('option');
            option.value = stock.stockCode;
            option.textContent = `${stock.stockCode} (${stock.shares}股)`;
            select.appendChild(option);
        });
    };
    
    updateSelect(sellSelect);
    updateSelect(dividendSelect);
    
    // 綁定選擇事件
    if (sellSelect) {
        sellSelect.addEventListener('change', (e) => {
            document.getElementById('sellStockCode').value = e.target.value;
        });
    }
    
    if (dividendSelect) {
        dividendSelect.addEventListener('change', (e) => {
            document.getElementById('dividendStockCode').value = e.target.value;
            // 自動填入持股數
            const stock = portfolio.find(s => s.stockCode === e.target.value);
            if (stock) {
                document.getElementById('dividendShares').value = stock.shares;
            }
        });
    }
}

// 更新投資摘要
function updateInvestmentSummary() {
    const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    const portfolio = getPortfolio();
    
    // 計算總投入金額
    let totalInvested = 0;
    records.filter(r => r.type === 'buy').forEach(record => {
        totalInvested += record.price * record.shares + (record.fee || 0);
    });
    
    // 計算總市值（使用保存的當前價格，如果沒有則使用平均成本）
    let totalMarketValue = 0;
    portfolio.forEach(stock => {
        const currentPrice = getStockCurrentPrice(stock.stockCode) || stock.avgCost;
        totalMarketValue += currentPrice * stock.shares;
    });
    
    // 計算未實現損益
    // 需要計算實際的總成本（考慮已賣出的部分）
    let totalCost = 0;
    portfolio.forEach(stock => {
        totalCost += stock.totalCost;
    });
    const unrealizedPnl = totalMarketValue - totalCost;
    
    // 計算今年已領股息
    const currentYear = new Date().getFullYear();
    let yearDividend = 0;
    records.filter(r => r.type === 'dividend' && r.dividendType === 'cash').forEach(record => {
        const recordYear = new Date(record.date).getFullYear();
        if (recordYear === currentYear) {
            yearDividend += record.amount || 0;
        }
    });
    
    // 計算總股息（所有年份）
    let totalDividend = 0;
    records.filter(r => r.type === 'dividend' && r.dividendType === 'cash').forEach(record => {
        totalDividend += record.amount || 0;
    });
    
    // 計算已實現損益
    let realizedPnl = 0;
    records.filter(r => r.type === 'sell').forEach(record => {
        realizedPnl += record.realizedPnl || 0;
    });
    
    // 計算年化報酬率
    const annualReturn = calculateAnnualReturn(totalInvested, totalMarketValue, realizedPnl, totalDividend, records);
    
    // 計算投資 vs 生活支出比例
    updateInvestmentExpenseRatio();
    
    // 更新顯示
    const totalInvestedEl = document.getElementById('totalInvested');
    const totalMarketValueEl = document.getElementById('totalMarketValue');
    const unrealizedPnlEl = document.getElementById('unrealizedPnl');
    const yearDividendEl = document.getElementById('yearDividend');
    const annualReturnEl = document.getElementById('annualReturn');
    const stockBondSummaryEl = document.getElementById('stockBondSummaryValue');
    const summaryToggleInvested = document.getElementById('summaryToggleInvested');
    const summaryTogglePnl = document.getElementById('summaryTogglePnl');
    const summaryToggleReturn = document.getElementById('summaryToggleReturn');
    const summaryToggleDividend = document.getElementById('summaryToggleDividend');
    
    if (totalInvestedEl) {
        const roundedTotalInvested = Math.round(totalInvested);
        totalInvestedEl.textContent = `NT$${roundedTotalInvested.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}`;
        if (summaryToggleInvested) {
            summaryToggleInvested.textContent = `NT$${roundedTotalInvested.toLocaleString('zh-TW')}`;
        }
    }
    if (totalMarketValueEl) {
        const roundedTotalMarketValue = Math.round(totalMarketValue);
        totalMarketValueEl.textContent = `NT$${roundedTotalMarketValue.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}`;
    }
    if (unrealizedPnlEl) {
        const roundedUnrealizedPnl = Math.round(unrealizedPnl);
        unrealizedPnlEl.textContent = `NT$${roundedUnrealizedPnl.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}`;
        unrealizedPnlEl.className = `summary-value auto-size ${unrealizedPnl >= 0 ? 'positive' : 'negative'}`;
        if (summaryTogglePnl) {
            summaryTogglePnl.textContent = `${unrealizedPnl >= 0 ? '+' : ''}${Math.round(unrealizedPnl).toLocaleString('zh-TW')}`;
            summaryTogglePnl.className = `summary-toggle__metric-value ${unrealizedPnl > 0 ? 'positive' : (unrealizedPnl < 0 ? 'negative' : 'neutral')}`;
        }
    }
    if (yearDividendEl) {
        yearDividendEl.textContent = `NT$${yearDividend.toLocaleString('zh-TW')}`;
        if (summaryToggleDividend) {
            summaryToggleDividend.textContent = `NT$${yearDividend.toLocaleString('zh-TW')}`;
        }
    }
    if (annualReturnEl) {
        if (annualReturn !== null && !isNaN(annualReturn) && isFinite(annualReturn)) {
            const returnValue = (annualReturn * 100).toFixed(2);
            annualReturnEl.textContent = `${returnValue >= 0 ? '+' : ''}${returnValue}%`;
            annualReturnEl.className = `summary-value ${annualReturn >= 0 ? 'positive' : 'negative'}`;
            if (summaryToggleReturn) {
                summaryToggleReturn.textContent = `${returnValue >= 0 ? '+' : ''}${returnValue}%`;
                summaryToggleReturn.className = `summary-toggle__metric-value ${annualReturn > 0 ? 'positive' : (annualReturn < 0 ? 'negative' : 'neutral')}`;
            }
        } else {
            // 檢查為什麼無法計算
            const buyRecords = records.filter(r => r.type === 'buy');
            if (buyRecords.length === 0) {
                annualReturnEl.textContent = '--';
            } else {
                // 檢查投資時間
                let earliestDate = null;
                buyRecords.forEach(record => {
                    const dateStr = record.date || record.timestamp;
                    if (dateStr) {
                        const recordDate = new Date(dateStr);
                        if (!isNaN(recordDate.getTime()) && (!earliestDate || recordDate < earliestDate)) {
                            earliestDate = recordDate;
                        }
                    }
                });
                
                if (earliestDate) {
                    const days = (new Date() - earliestDate) / (1000 * 60 * 60 * 24);
                    if (days < 30) {
                        annualReturnEl.textContent = '計算中...';
                    } else {
                        annualReturnEl.textContent = '--';
                    }
                } else {
                    annualReturnEl.textContent = '--';
                }
            }
            annualReturnEl.className = 'summary-value';
            if (summaryToggleReturn) {
                summaryToggleReturn.textContent = '--';
                summaryToggleReturn.className = 'summary-toggle__metric-value neutral';
            }
        }
    }

    if (stockBondSummaryEl) {
        const values = computeStockBondMarketValues();
        const totalValue = values.totalValue || 0;
        if (totalValue > 0) {
            const stockPct = values.stockValue / totalValue;
            const bondPct = values.bondValue / totalValue;
            stockBondSummaryEl.textContent = `股 ${formatPct(stockPct)} / 債 ${formatPct(bondPct)}`;
        } else {
            stockBondSummaryEl.textContent = '尚無資料';
        }
    }
}

// 計算投資 vs 生活支出比例
function updateInvestmentExpenseRatio() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // 獲取記帳記錄
    const accountingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    
    // 計算本月生活支出（排除投資相關支出）
    const monthExpenses = accountingRecords.filter(record => {
        const recordDate = new Date(record.date);
        const isCurrentMonth = recordDate.getFullYear() === currentYear && 
                              recordDate.getMonth() + 1 === currentMonth;
        const isExpense = record.type === 'expense' || !record.type;
        const isNotInvestment = record.category !== '存股' && 
                               record.category !== '投資' &&
                               !record.linkedInvestment;
        return isCurrentMonth && isExpense && isNotInvestment;
    });
    
    const monthLifeExpense = monthExpenses.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    // 計算本月投資支出（買入記錄）
    const investmentRecords = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    const monthInvestments = investmentRecords.filter(record => {
        if (record.type !== 'buy') return false;
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === currentYear && 
               recordDate.getMonth() + 1 === currentMonth;
    });
    
    const monthInvestmentExpense = monthInvestments.reduce((sum, record) => {
        const price = record.price || 0;
        const shares = record.shares || 0;
        const fee = record.fee || 0;
        return sum + (price * shares + fee);
    }, 0);
    
    // 更新顯示
    const ratioCard = document.getElementById('investmentExpenseRatioCard');
    const ratioEl = document.getElementById('investmentExpenseRatio');
    const ratioHint = document.getElementById('investmentExpenseRatioHint');
    
    if (ratioCard && ratioEl && ratioHint) {
        const totalExpense = monthLifeExpense + monthInvestmentExpense;
        
        if (totalExpense > 0) {
            const investmentRatio = (monthInvestmentExpense / totalExpense * 100).toFixed(1);
            const lifeRatio = (monthLifeExpense / totalExpense * 100).toFixed(1);
            
            ratioEl.textContent = `投資 ${investmentRatio}% : 生活 ${lifeRatio}%`;
            ratioHint.textContent = `投資：NT$${monthInvestmentExpense.toLocaleString('zh-TW')} | 生活：NT$${monthLifeExpense.toLocaleString('zh-TW')}`;
            ratioCard.style.display = 'flex';
        } else {
            ratioCard.style.display = 'none';
        }
    }
}

// 計算年化報酬率
function calculateAnnualReturn(totalInvested, totalMarketValue, realizedPnl, totalDividend, records) {
    // 如果沒有投入金額，無法計算
    if (totalInvested <= 0) {
        return null;
    }
    
    // 找到第一筆買入記錄的日期
    const buyRecords = records.filter(r => r.type === 'buy');
    if (buyRecords.length === 0) {
        return null;
    }
    
    // 找到最早的買入日期
    let firstBuyDate = null;
    let earliestDate = null;
    
    buyRecords.forEach(record => {
        const dateStr = record.date || record.timestamp;
        if (!dateStr) return;
        
        const recordDate = new Date(dateStr);
        // 檢查日期是否有效
        if (isNaN(recordDate.getTime())) return;
        
        if (!earliestDate || recordDate < earliestDate) {
            earliestDate = recordDate;
            firstBuyDate = record;
        }
    });
    
    if (!firstBuyDate || !earliestDate) {
        return null;
    }
    
    const startDate = earliestDate;
    const endDate = new Date();
    
    // 計算投資年數
    const days = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const years = days / 365.25;
    
    // 如果投資時間少於30天，不計算年化報酬率
    if (days < 30) {
        return null;
    }
    
    // 當前總價值 = 總市值 + 已實現損益 + 總股息
    const currentTotalValue = totalMarketValue + realizedPnl + totalDividend;
    
    // 如果當前總價值小於等於0，無法計算
    if (currentTotalValue <= 0) {
        return null;
    }
    
    // 年化報酬率 = ((當前總價值 / 總投入金額) ^ (1 / 投資年數)) - 1
    const ratio = currentTotalValue / totalInvested;
    if (ratio <= 0) {
        return null;
    }
    
    const annualReturn = Math.pow(ratio, 1 / years) - 1;
    
    // 檢查結果是否為有效數字
    if (isNaN(annualReturn) || !isFinite(annualReturn)) {
        return null;
    }
    
    return annualReturn;
}

// 更新持股列表
function updatePortfolioList() {
    const portfolio = getPortfolio();
    const portfolioList = document.getElementById('portfolioList');
    
    if (!portfolioList) return;
    
    if (portfolio.length === 0) {
        portfolioList.innerHTML = '<div class="empty-state">尚無持股</div>';
        return;
    }
    
    let html = '';
    portfolio.forEach(stock => {
        const marketValue = stock.avgCost * stock.shares; // 暫時用平均成本代替市值
        const pnl = marketValue - stock.totalCost;
        
        html += `
            <div class="portfolio-item">
                <div class="portfolio-header">
                    <div>
                        <div class="portfolio-name">${stock.stockCode}</div>
                        <div class="portfolio-shares">${stock.shares} 股</div>
                    </div>
                    </div>
                <div class="portfolio-details">
                    <div class="portfolio-detail-item">
                        <div class="portfolio-detail-label">平均成本</div>
                        <div class="portfolio-detail-value">NT$${stock.avgCost.toFixed(2)}</div>
                    </div>
                    <div class="portfolio-detail-item">
                        <div class="portfolio-detail-label">總成本</div>
                        <div class="portfolio-detail-value">NT$${stock.totalCost.toLocaleString('zh-TW')}</div>
                </div>
                    <div class="portfolio-detail-item">
                        <div class="portfolio-detail-label">市值</div>
                        <div class="portfolio-detail-value">NT$${marketValue.toLocaleString('zh-TW')}</div>
                    </div>
                    <div class="portfolio-detail-item">
                        <div class="portfolio-detail-label">未實現損益</div>
                        <div class="portfolio-detail-value ${pnl >= 0 ? 'positive' : 'negative'}">
                            ${pnl >= 0 ? '+' : ''}NT$${pnl.toLocaleString('zh-TW')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    portfolioList.innerHTML = html;
}

const INVESTMENT_RECORDS_PAGE_SIZE = 6;
let investmentRecordsCurrentPage = 0;

function parseRecordDate(record) {
    if (!record) return 0;
    if (record.date) {
        const parsed = new Date(record.date);
        if (!isNaN(parsed)) return parsed.getTime();
    }
    if (record.timestamp) {
        const parsed = new Date(record.timestamp);
        if (!isNaN(parsed)) return parsed.getTime();
    }
    return 0;
}

function getInvestmentRecordDateKey(record) {
    if (!record) return 'unknown';
    if (record.date) {
        const parsed = new Date(record.date);
        if (!isNaN(parsed)) return parsed.toISOString().split('T')[0];
    }
    if (record.timestamp) {
        const parsed = new Date(record.timestamp);
        if (!isNaN(parsed)) return parsed.toISOString().split('T')[0];
    }
    return 'unknown';
}

function formatInvestmentRecordDateLabel(key) {
    if (!key || key === 'unknown') return '未設定日期';
    const parsed = new Date(key);
    if (isNaN(parsed)) return key;
    return parsed.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' });
}

function getAmountLevelClass(amount) {
    const value = Math.abs(amount || 0);
    if (value >= 150000) return 'amount-level-high';
    if (value >= 75000) return 'amount-level-mid';
    if (value >= 30000) return 'amount-level-low';
    return 'amount-level-soft';
}

function bindRecordOverflowMenu(container) {
    if (!container || container.dataset.menuBound) return;
    container.dataset.menuBound = '1';

    container.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('.record-action-btn');
        if (!actionBtn) return;

        e.preventDefault();
        e.stopPropagation();

        const action = actionBtn.dataset.action;
        const recordId = actionBtn.dataset.recordId;

        if (!recordId) {
            alert('無法獲取記錄ID');
            return;
        }

        if (action === 'edit') {
            editInvestmentRecord(recordId);
        } else if (action === 'delete') {
            deleteInvestmentRecord(recordId);
        }
    });
}

function renderRecordActionButtons(recordId) {
    if (!recordId) return '';
    return `
        <div class="record-actions" data-record-id="${recordId}">
            <button class="record-action-btn record-action-edit" type="button" aria-label="編輯紀錄" title="編輯" data-action="edit" data-record-id="${recordId}">✏️</button>
            <button class="record-action-btn record-action-delete" type="button" aria-label="刪除紀錄" title="刪除" data-action="delete" data-record-id="${recordId}">🗑️</button>
        </div>
    `;
}

// 更新投資記錄列表
function updateInvestmentRecords() {
    const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    const recordsList = document.getElementById('investmentRecords');
    
    if (!recordsList) return;
    
    if (records.length === 0) {
        recordsList.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 48px; margin-bottom: 16px;">📈</div>
                <div>尚無投資紀錄</div>
                <div style="font-size: 12px; margin-top: 8px; color: #ccc; margin-bottom: 20px;">點擊下方按鈕開始記錄或匯入檔案</div>
                <button class="budget-edit-btn budget-add-btn-full" onclick="importInvestmentData()" style="max-width: 300px; margin: 0 auto;">
                    📂 匯入投資紀錄
                </button>
            </div>
        `;
        return;
    }

    const sortedRecords = [...records].sort((a, b) => parseRecordDate(b) - parseRecordDate(a));
    const pageRecords = sortedRecords;

    const grouped = {};
    const groupOrder = [];
    pageRecords.forEach(record => {
        const key = getInvestmentRecordDateKey(record);
        if (!grouped[key]) {
            grouped[key] = [];
            groupOrder.push(key);
        }
        grouped[key].push(record);
    });

    let html = `
        <div class="investment-records-header">
            <div>
                <div class="investment-records-title">投資紀錄</div>
                <div class="investment-records-summary">新資料在最上方，共 ${pageRecords.length} 筆</div>
            </div>
        </div>
    `;

    if (pageRecords.length === 0) {
        html += `
            <div class="empty-page">
                <div>本頁暫無買入記錄</div>
                <div class="text-secondary">請新增或切換到其他頁面</div>
            </div>
        `;
    } else {
        groupOrder.forEach(key => {
            html += `
                <div class="investment-record-date">
                    ${formatInvestmentRecordDateLabel(key)}
                </div>
            `;
            grouped[key].forEach(record => {
                const recordId = record.timestamp || record.id || Date.now().toString();
                if (record.type === 'buy') {
                    const price = record.price != null ? record.price : 0;
                    const shares = record.shares || 0;
                    const totalAmount = Math.ceil(price * shares + (record.fee || 0));
                    const amountClass = getAmountLevelClass(totalAmount);
                    let dcaLine = '';
                    if (record.isDCA) {
                        const cycleNo = parseInt(record.dcaCycleNumber, 10);
                        dcaLine = `<div>🔁 定期定額${!isNaN(cycleNo) && cycleNo > 0 ? `・第 ${cycleNo} 期` : ''}</div>`;
                    }
                    html += `
                        <div class="investment-record-item amount-glow ${amountClass}" data-record-id="${recordId}">
                            <div class="record-header">
                                <div class="record-header-info">
                                    <span class="record-type buy" data-stock-code="${record.stockCode || ''}" data-stock-name="${record.stockName || ''}" data-price="${price}" data-shares="${shares}" data-fee="${record.fee || 0}" data-isdca="${record.isDCA ? '1' : '0'}" title="再買一次">買入</span>
                                    <span class="record-date">${record.date}</span>
                                </div>
                                ${renderRecordActionButtons(recordId)}
                            </div>
                            <div class="record-stock">${record.stockCode}</div>
                            <div class="record-details">
                                <div>價格：NT$${price.toFixed(2)}</div>
                                <div>股數：${shares} 股</div>
                                <div>手續費：NT$${(record.fee || 0).toLocaleString('zh-TW')}</div>
                                ${dcaLine}
                            </div>
                            <div class="record-amount ${amountClass}">投入金額：NT$${(totalAmount != null ? totalAmount : 0).toLocaleString('zh-TW')}</div>
                            ${record.note ? `<div class="text-secondary" style="margin-top: 8px; font-size: 12px;">備註：${record.note}</div>` : ''}
                        </div>
                    `;
                } else if (record.type === 'sell') {
                    const price = record.price != null ? record.price : 0;
                    const shares = record.shares || 0;
                    const totalAmount = price * shares - (record.fee || 0) - (record.tax || 0);
                    html += `
                        <div class="investment-record-item" data-record-id="${recordId}">
                            <div class="record-header">
                                <div class="record-header-info">
                                    <span class="record-type sell">賣出</span>
                                    <span class="record-date">${record.date}</span>
                                </div>
                                ${renderRecordActionButtons(recordId)}
                            </div>
                            <div class="record-stock">${record.stockCode}</div>
                            <div class="record-details">
                                <div>價格：NT$${(record.price != null ? record.price : 0).toFixed(2)}</div>
                                <div>股數：${record.shares || 0} 股</div>
                                <div>手續費：NT$${(record.fee || 0).toLocaleString('zh-TW')}</div>
                                <div>證交稅：NT$${(record.tax || 0).toLocaleString('zh-TW')}</div>
                            </div>
                            <div class="record-amount">實收金額：NT$${(totalAmount != null ? totalAmount : 0).toLocaleString('zh-TW')}</div>
                            <div class="record-amount ${(record.realizedPnl || 0) >= 0 ? 'positive' : 'negative'}">
                                實現損益：${(record.realizedPnl || 0) >= 0 ? '+' : ''}NT$${(record.realizedPnl != null ? record.realizedPnl : 0).toLocaleString('zh-TW')}
                            </div>
                            ${record.note ? `<div class="text-secondary" style="margin-top: 8px; font-size: 12px;">備註：${record.note}</div>` : ''}
                        </div>
                    `;
                } else if (record.type === 'dividend') {
                    html += `
                        <div class="investment-record-item" data-record-id="${recordId}">
                            <div class="record-header">
                                <div class="record-header-info">
                                    <span class="record-type dividend">${record.dividendType === 'cash' ? '現金股利' : '股票股利'}</span>
                                    <span class="record-date">${record.date}</span>
                                </div>
                                ${renderRecordActionButtons(recordId)}
                            </div>
                            <div class="record-stock">${record.stockCode}</div>
                            <div class="record-details">
                                <div>每股：NT$${(record.perShare != null ? record.perShare : 0).toFixed(2)}</div>
                                <div>股數：${record.shares || 0} 股</div>
                                ${record.exDividendDate ? `<div>除息日：${record.exDividendDate}</div>` : ''}
                                ${record.historicalPerShare ? `<div>過去每股：NT$${Number(record.historicalPerShare).toFixed(2)}</div>` : ''}
                                ${record.reinvest ? '<div>再投入 ✓</div>' : ''}
                            </div>
                            <div class="record-amount">實收金額：NT$${(record.amount != null ? record.amount : 0).toLocaleString('zh-TW')}</div>
                            ${record.note ? `<div class="text-secondary" style="margin-top: 8px; font-size: 12px;">備註：${record.note}</div>` : ''}
                        </div>
                    `;
                }
            });
        });
    }

    recordsList.innerHTML = html;

    bindRecordOverflowMenu(recordsList);

    // 綁定買入標籤點擊事件：點「買入」直接帶上一筆資料到買入頁
    recordsList.querySelectorAll('.record-type.buy').forEach(badge => {
        const newBadge = badge.cloneNode(true);
        badge.parentNode.replaceChild(newBadge, badge);
        newBadge.style.cursor = 'pointer';
        newBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            playClickSound();
            const stockCode = newBadge.dataset.stockCode || '';
            const stockName = newBadge.dataset.stockName || '';
            const price = parseFloat(newBadge.dataset.price || '0') || 0;
            const shares = parseInt(newBadge.dataset.shares || '0', 10) || 0;
            const fee = parseFloat(newBadge.dataset.fee || '0') || 0;
            const isDCA = (newBadge.dataset.isdca || '') === '1';
            showInvestmentInputPage('buy');
            setTimeout(() => {
                const codeInput = document.getElementById('calcStockCodeInput');
                const nameInput = document.getElementById('calcStockNameInput');
                const priceInput = document.getElementById('calcPriceInput');
                const sharesInput = document.getElementById('calcSharesInput');
                const feeInput = document.getElementById('calcFeeInput');
                const autoFeeCheckbox = document.getElementById('calcAutoFeeCheckbox');
                const isDCAInput = document.getElementById('calcIsDCAInput');
                if (codeInput) {
                    codeInput.value = stockCode;
                    codeInput.dispatchEvent(new Event('input', { bubbles: true }));
                    codeInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
                if (nameInput) {
                    nameInput.value = stockName;
                    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
                    nameInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
                if (priceInput) {
                    priceInput.value = price > 0 ? String(price) : '';
                    priceInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                if (sharesInput) {
                    sharesInput.value = shares > 0 ? String(shares) : '0';
                    sharesInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                if (autoFeeCheckbox) {
                    autoFeeCheckbox.checked = false;
                    autoFeeCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
                if (feeInput) {
                    feeInput.disabled = false;
                    feeInput.style.opacity = '1';
                    feeInput.value = String(fee || 0);
                    feeInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                if (isDCAInput) {
                    isDCAInput.checked = isDCA;
                    isDCAInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
                if (typeof updateInvestmentDisplay === 'function') {
                    updateInvestmentDisplay();
                }
            }, 120);
        });
    });
}

// 添加動畫樣式
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(style);

// ========== 底部導航初始化 ==========
function showBottomNav() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) bottomNav.style.display = 'flex';
}

function initBottomNav() {
    showBottomNav();
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            // 檢查分類管理頁面是否顯示，如果顯示則不執行切換
            const categoryManagePage = document.getElementById('pageCategoryManage');
            if (categoryManagePage && categoryManagePage.style.display !== 'none') {
                return; // 如果分類管理頁面顯示，則不執行底部導航欄的切換
            }
            
            const page = item.dataset.page;
            showBottomNav();
            
            // 更新導航狀態
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // 隱藏所有頁面
            const pageInput = document.getElementById('pageInput');
            const pageLedger = document.getElementById('pageLedger');
            const inputSection = document.getElementById('inputSection');
            const pageChart = document.getElementById('pageChart');
            const pageBudget = document.getElementById('pageBudget');
            const pageMonthlyPlanner = document.getElementById('pageMonthlyPlanner');
            const pageSettings = document.getElementById('pageSettings');
            const pageInvestment = document.getElementById('pageInvestment');
            const pageDailyBudget = document.getElementById('pageDailyBudget');
            
            // 隱藏所有頁面
            if (pageInput) pageInput.style.display = 'none';
            if (pageLedger) pageLedger.style.display = 'none';
            if (inputSection) inputSection.style.display = 'none';
            if (pageChart) pageChart.style.display = 'none';
            if (pageBudget) pageBudget.style.display = 'none';
            if (pageMonthlyPlanner) pageMonthlyPlanner.style.display = 'none';
            if (pageSettings) pageSettings.style.display = 'none';
            if (pageInvestment) pageInvestment.style.display = 'none';
            if (pageDailyBudget) pageDailyBudget.style.display = 'none';
            const _pageMonthlySummary = document.getElementById('pageMonthlySummary');
            if (_pageMonthlySummary) _pageMonthlySummary.style.display = 'none';
            
            // 顯示底部導航（如果從每日預算追蹤頁面返回）
            const bottomNav = document.querySelector('.bottom-nav');
            if (bottomNav && pageDailyBudget && pageDailyBudget.style.display === 'none') {
                bottomNav.style.display = 'flex';
            }
            
            // 顯示對應的頁面
            if (page === 'investment') {
                console.log('切換到投資專區頁面');
                if (pageInvestment) {
                    pageInvestment.style.display = 'block';
                    console.log('投資專區頁面已顯示，開始初始化');
                    try {
                        initInvestmentPage();
                        console.log('投資專區初始化完成');
                        autoLoadStockPrices().catch(() => {});
                    } catch (error) {
                        console.error('投資專區初始化錯誤:', error);
                    }
                } else {
                    console.error('投資專區頁面元素未找到');
                }
            } else if (page === 'chart') {
                if (pageChart) {
                    pageChart.style.display = 'block';
                    // 初始化圖表頁面
                    if (typeof initChart === 'function') {
                        initChart();
                    }
                    renderSelectedMonthText();
                    if (typeof updateAllCharts === 'function') {
                        updateAllCharts();
                    }
                }
            } else if (page === 'wallet') {
                if (pageBudget) {
                    pageBudget.style.display = 'block';
                    // 初始化預算頁面
                    if (typeof initBudget === 'function') {
                        initBudget();
                    }
                }
            } else if (page === 'monthlyPlanner') {
                if (pageMonthlyPlanner) {
                    pageMonthlyPlanner.style.display = 'block';
                    if (typeof initMonthlyPlannerPage === 'function') {
                        initMonthlyPlannerPage();
                    }
                }
            } else if (page === 'settings') {
                if (pageSettings) {
                    pageSettings.style.display = 'block';
                    // 初始化設置頁面
                    if (typeof initSettingsPage === 'function') {
                        initSettingsPage();
                    }
                }
            } else if (page === 'ledger') {
                if (pageLedger) {
                    pageLedger.style.display = 'block';
                    // 隱藏記帳輸入頁面的 header
                    const headerSection = document.querySelector('.header-section');
                    if (headerSection) headerSection.style.display = 'none';
                    renderSelectedMonthText();
                    // 初始化記帳本頁面
                    if (typeof initLedger === 'function') {
                        initLedger();
                    }
                }
            }
            
            // 教學功能已移除
            setTimeout(() => {
                // 教學彈窗功能已禁用
            }, 300);
        });
    });
}

// ========== 其他頁面初始化函數 ==========

