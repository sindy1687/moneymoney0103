// 個別主題的文字顏色修正：蝴蝶忍（shinobu）、可愛粉彩（cutePastel）
// 取代舊的 force_fee_white / housing_category_fix / money_color_fix / chart_color_fix /
// force_date_white / extreme_date_fix / cute_pastel_date_fix（已移到 archive/）。
// 只在該主題啟用時運作；只標記「自己帶有文字」的元素，不再覆寫 body 與整個容器的顏色；
// 顏色由下方 CSS 決定，DOM 變動合併後最多每 300ms 處理一次。
(() => {
    'use strict';

    const SHINOBU_DATE = /\d{1,2}月|\d{4}年|\d{1,2}\/\d{1,2}|\d{4}-\d{1,2}|\d{1,2}-\d{1,2}|[一二三四五六七八九十]{1,2}月/;
    const PASTEL_DATE = /\d{1,2}月|\d{4}年|\d{1,2}\/\d{1,2}|\d{4}-\d{1,2}|[一二三四五六七八九十]{1,2}月/;
    const MONEY = /NT\$|[$¥€£元塊錢]|金額|餘額|總額|費用|價格|成本/;
    const HOUSING = /住房|物業/;
    const TAGS = ['ttf-date', 'ttf-money', 'ttf-housing'];

    const S = ':root[data-theme="shinobu"]';
    const P = ':root[data-theme="cutePastel"]';
    const css = `
        ${S} body { color: #fff !important; }
        ${S} body * { color: inherit !important; }
        ${S} [class*="date"], ${S} [class*="month"], ${S} [class*="year"], ${S} [class*="day"],
        ${S} [class*="time"], ${S} [class*="axis"], ${S} [class*="tick"], ${S} [class*="label"],
        ${S} [data-date], ${S} [data-month], ${S} [data-year], ${S} [data-day], ${S} [data-time], ${S} [data-label],
        ${S} .ttf-date {
            color: #fff !important; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9) !important; font-weight: 600 !important;
        }
        ${S} [class*="fee"], ${S} [class*="fee"] *, ${S} [id*="fee"], ${S} [id*="fee"] * { color: #fff !important; }
        ${S} .chart-container, ${S} .chart-wrapper, ${S} .chart-legend, ${S} .chart-label, ${S} .chart-title,
        ${S} .chart-section, ${S} .chart-text, ${S} .chart-percentage, ${S} [data-chart], ${S} [data-legend], ${S} [data-percentage] {
            color: rgb(255, 210, 100) !important; font-weight: 700 !important;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.95), 0 0 12px rgba(0, 0, 0, 0.8) !important;
        }
        ${S} .chart-container *, ${S} .trend-chart *, ${S} .line-chart *, ${S} svg text, ${S} svg tspan {
            color: #fff !important; fill: #fff !important; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9) !important;
        }
        ${S} .chart-value, ${S} .chart-amount, ${S} .chart-money, ${S} .chart-currency, ${S} .chart-number, ${S} [data-value], ${S} [data-amount] {
            color: rgb(255, 200, 80) !important; fill: rgb(255, 200, 80) !important; font-weight: 700 !important;
        }
        ${S} [class*="amount"], ${S} [class*="money"], ${S} [class*="price"], ${S} [class*="currency"],
        ${S} [class*="balance"], ${S} [class*="wallet"], ${S} [class*="cost"], ${S} .ttf-money {
            color: rgb(255, 255, 224) !important; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8) !important; font-weight: 700 !important;
        }
        ${S} .ttf-housing {
            color: #000 !important; text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8) !important; font-weight: 700 !important;
        }

        ${P} body { color: #404040; }
        ${P} input[type="date"], ${P} #dateInput {
            color: #404040 !important; background: rgba(255, 255, 255, 0.85) !important;
            font-weight: 600 !important; border: 1px solid rgba(255, 105, 180, 0.65) !important;
        }
        ${P} .date-text, ${P} .time-text, ${P} .datetime, ${P} .record-date, ${P} .record-card-date,
        ${P} .transaction-item .date, ${P} .transaction-item .time, ${P} .group-header, ${P} .ttf-date {
            color: #404040 !important; font-weight: 600 !important;
        }
        ${P} svg .ttf-date { fill: #404040 !important; }
    `;

    function activeTheme() {
        const theme = document.documentElement.getAttribute('data-theme');
        return theme === 'shinobu' || theme === 'cutePastel' ? theme : '';
    }

    // 只看元素「自己的」文字節點，避免因為子孫含有日期或金額就把整個容器改色
    function tagTextOwners(theme) {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const owners = new Map();
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const el = node.parentElement;
            if (!el || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
            owners.set(el, (owners.get(el) || '') + node.nodeValue);
        }
        for (const [el, text] of owners) {
            if (theme === 'shinobu') {
                el.classList.toggle('ttf-date', SHINOBU_DATE.test(text));
                el.classList.toggle('ttf-money', MONEY.test(text));
                el.classList.toggle('ttf-housing', HOUSING.test(text) && !!el.closest('.category-item, .category-name'));
            } else {
                const skip = el.tagName === 'BUTTON' || el.tagName === 'A' || !!el.closest('button, a');
                el.classList.toggle('ttf-date', !skip && PASTEL_DATE.test(text));
            }
        }
    }

    function clearTags() {
        document.querySelectorAll('.ttf-date, .ttf-money, .ttf-housing').forEach(el => el.classList.remove(...TAGS));
    }

    // 蝴蝶忍的 Chart.js 文字改白；離開主題時還原，避免其他主題的圖表沿用白字
    let chartDefaults = null;
    function applyChartDefaults(theme) {
        if (typeof Chart === 'undefined' || !Chart.defaults) return;
        if (theme === 'shinobu') {
            if (!chartDefaults) chartDefaults = { color: Chart.defaults.color, weight: Chart.defaults.font.weight };
            Chart.defaults.color = '#fff';
            Chart.defaults.font.weight = '600';
        } else if (chartDefaults) {
            Chart.defaults.color = chartDefaults.color;
            Chart.defaults.font.weight = chartDefaults.weight;
            chartDefaults = null;
        }
    }

    let timer = 0;
    let lastRun = 0;
    let current = '';
    function run() {
        timer = 0;
        lastRun = Date.now();
        if (current) tagTextOwners(current);
    }
    function schedule() {
        if (!current || timer) return;
        timer = setTimeout(run, Math.max(0, 300 - (Date.now() - lastRun)));
    }

    const domObserver = new MutationObserver(schedule);
    function themeChanged() {
        const theme = activeTheme();
        if (theme === current) return;
        current = theme;
        applyChartDefaults(theme);
        clearTags();
        domObserver.disconnect();
        if (theme) {
            domObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
            schedule();
        }
    }

    const style = document.createElement('style');
    style.id = 'theme-text-fixes';
    style.textContent = css;
    document.head.appendChild(style);

    new MutationObserver(themeChanged).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    document.addEventListener('playerappready', themeChanged);
    themeChanged();
})();
