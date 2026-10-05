/* 字體大小連動：把所有固定的文字大小（14px、0.875rem…）改寫成
   calc(14px * var(--font-scale, 1))，之後只要改 --font-scale，全站文字一起縮放。
   涵蓋：樣式表（含之後才載入的主題 CSS）、JS 產生的行內 style。
   只改文字大小與 --font-* 變數，不改間距與版面。 */
(function () {
    'use strict';
    const LENGTH = /^(-?[\d.]+)(px|rem)$/;
    // 字體設定視窗本身用實際像素預覽，不跟著縮放
    const SKIP = '.font-size-select-modal';

    function scaled(value) {
        const match = LENGTH.exec(String(value).trim());
        return match ? `calc(${match[1]}${match[2]} * var(--font-scale, 1))` : null;
    }

    function rewriteStyle(style) {
        for (let i = 0; i < style.length; i++) {
            const prop = style[i];
            if (prop !== 'font-size' && !prop.startsWith('--font')) continue;
            const value = scaled(style.getPropertyValue(prop));
            if (value) style.setProperty(prop, value, style.getPropertyPriority(prop));
        }
    }

    function rewriteRules(rules) {
        for (const rule of rules) {
            if (rule.style) rewriteStyle(rule.style);
            if (rule.cssRules) rewriteRules(rule.cssRules);
        }
    }

    // 已改寫的值是 calc(...)，不會再被改寫，所以重複掃描是安全的
    function scanSheets() {
        for (const sheet of document.styleSheets) {
            let rules;
            try { rules = sheet.cssRules; } catch (_) { continue; } // 跨網域樣式表（字型）無法讀取
            if (rules) rewriteRules(rules);
        }
    }

    let scanQueued = false;
    function queueScan() {
        if (scanQueued) return;
        scanQueued = true;
        requestAnimationFrame(() => { scanQueued = false; scanSheets(); });
    }

    function rewriteElement(el) {
        if (!el.style || !el.style.fontSize || (el.closest && el.closest(SKIP))) return;
        const value = scaled(el.style.fontSize);
        if (value) el.style.setProperty('font-size', value, el.style.getPropertyPriority('font-size'));
    }

    function rewriteTree(node) {
        if (node.nodeType !== 1) return;
        if (node.tagName === 'STYLE' || node.tagName === 'LINK') { queueScan(); return; }
        rewriteElement(node);
        node.querySelectorAll('[style*="font-size"]').forEach(rewriteElement);
        if (node.querySelector('style')) queueScan();
    }

    function start() {
        scanSheets();
        rewriteTree(document.body);
        new MutationObserver(list => {
            for (const m of list) {
                if (m.type === 'attributes') rewriteElement(m.target);
                else m.addedNodes.forEach(rewriteTree);
            }
        }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['style'] });
    }

    // <link> 載入完成（主題 CSS 按需載入）時重新掃描；load 事件不冒泡，用捕獲階段監聽
    document.addEventListener('load', event => {
        if (event.target && event.target.tagName === 'LINK') queueScan();
    }, true);

    // 沒有設定文字大小的元素繼承 body，body 也要跟著縮放
    const base = document.createElement('style');
    base.textContent = 'body { font-size: calc(16px * var(--font-scale, 1)); }';
    document.head.prepend(base);

    window.setFontScale = scale => document.documentElement.style.setProperty('--font-scale', String(scale));

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
})();
