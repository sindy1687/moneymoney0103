/* 所有按鈕跟著主題背景圖的顏色。
   色票由 tools/build-theme-button-palette.ps1 事先從背景圖算好（js/theme-button-palette.js）；
   自訂背景（本機上傳的圖）沒有色票，就在瀏覽器直接讀圖取色。
   按鈕分三種：原本是鮮明色底 → 主色實心（solid）；原本是淡色底 → 淡主色（soft，選中時變實心）；
   原本透明（圖示按鈕）→ 不改，避免在深色背景上看不清楚。 */
(function () {
    'use strict';
    const BUTTONS = 'button, .btn, [role="button"], input[type="button"], input[type="submit"]';
    // 主題選擇器裡的主題預覽、以及自己用行內 style 指定底色的按鈕（色塊、字體預設鈕）保留原樣
    const KEEP = '.theme-grid';

    // 各主題 CSS 常用 :root[data-theme="x"] .xxx-btn.active {… !important}，權重比一般選擇器高；
    // 加上 :not(#_tb) 取得 id 等級的權重，確保所有主題的按鈕都套用背景色。
    const W = ':not(#_tb):not(#_tb):not(#_tb)';
    const ON = `html[data-tb-on]`;
    const style = document.createElement('style');
    style.textContent = `
${ON} [data-tb="solid"]${W},
${ON} [data-tb="soft"].active${W},
${ON} [data-tb="soft"].selected${W},
${ON} [data-tb="soft"][aria-pressed="true"]${W} {
    background: var(--tb-solid) !important; color: var(--tb-solid-text) !important;
    -webkit-text-fill-color: var(--tb-solid-text) !important; border-color: var(--tb-solid) !important;
}
${ON} [data-tb="solid"]${W}:hover { background: var(--tb-solid-hover) !important; }
${ON} [data-tb="soft"]${W}:not(.active):not(.selected):not([aria-pressed="true"]) {
    background: var(--tb-soft) !important; color: var(--tb-soft-text) !important;
    -webkit-text-fill-color: var(--tb-soft-text) !important; border-color: var(--tb-soft-border) !important;
}
${ON} [data-tb]${W} :is(span, div, small, strong, b, i, em, p, label)${W} {
    color: inherit !important; -webkit-text-fill-color: inherit !important;
}`;
    document.head.appendChild(style);

    function parseColor(value) {
        const m = /rgba?\(([^)]+)\)/.exec(value || '');
        if (!m) return null;
        const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return { r, g, b, a };
    }
    function saturationLightness({ r, g, b }) {
        const max = Math.max(r, g, b) / 255, min = Math.min(r, g, b) / 255, l = (max + min) / 2;
        const s = max === min ? 0 : (l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min));
        return { s, l };
    }

    const ACTIVE = '.active, .selected, [aria-pressed="true"]';
    // 分頁、導覽這類「一組裡選一個」的按鈕：不論目前選中與否，一律淡主色，選中的由 CSS 變實心
    function inGroup(el) {
        if (el.matches(ACTIVE)) return true;
        const key = el.classList[0];
        return !!key && !!document.querySelector(`.${CSS.escape(key)}:is(${ACTIVE})`);
    }

    // 依按鈕「原本」的樣子決定種類
    function classify(el) {
        if (el.closest(KEEP) || /background/i.test(el.getAttribute('style') || '')) return null;
        if (inGroup(el)) return 'soft';
        const cs = getComputedStyle(el);
        if (cs.display === 'none') return undefined; // 看不到的先不分類，出現時再分
        if (/url\(/.test(cs.backgroundImage)) return null; // 圖片按鈕
        if (/gradient/.test(cs.backgroundImage)) return 'solid';
        const bg = parseColor(cs.backgroundColor);
        if (!bg || bg.a < 0.15) return null; // 透明的圖示按鈕
        const { s, l } = saturationLightness(bg);
        return s >= 0.35 && l > 0.2 && l < 0.8 ? 'solid' : 'soft';
    }
    function tag(el) {
        if (el.hasAttribute('data-tb') || el.hasAttribute('data-tb-skip')) return;
        const kind = classify(el);
        if (kind === undefined) return;
        if (kind) el.setAttribute('data-tb', kind); else el.setAttribute('data-tb-skip', '');
    }
    function tagAll(root) {
        if (root.matches && root.matches(BUTTONS)) tag(root);
        if (root.querySelectorAll) root.querySelectorAll(BUTTONS).forEach(tag);
    }
    // 換主題後原本的樣子可能不同，全部重新分類
    function retagAll() {
        document.querySelectorAll('[data-tb], [data-tb-skip]').forEach(el => { el.removeAttribute('data-tb'); el.removeAttribute('data-tb-skip'); });
        tagAll(document.body);
    }

    // ===== 主題色票 =====
    function setPalette(p) {
        const root = document.documentElement;
        if (!p) { root.removeAttribute('data-tb-on'); return; }
        root.style.setProperty('--tb-solid', p.solid);
        root.style.setProperty('--tb-solid-text', p.solidText);
        root.style.setProperty('--tb-solid-hover', p.solidHover);
        root.style.setProperty('--tb-soft', p.soft);
        root.style.setProperty('--tb-soft-text', p.softText);
        root.style.setProperty('--tb-soft-border', p.softBorder);
        root.setAttribute('data-tb-on', '');
    }

    // 自訂背景：直接讀圖（本機上傳的圖可以讀像素），算法與 tools/build-theme-button-palette.js 相同的簡化版
    function luminance(c) {
        const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
        return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    }
    const contrast = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const hex = c => '#' + c.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
    const mix = (a, b, t) => a.map((v, i) => v * (1 - t) + b[i] * t);
    function towards(c, target, other) { // 往 target 靠近直到與 other 的對比 ≥ 4.5
        for (let t = 0; t <= 1; t += 0.02) { const m = mix(c, target, t); if (contrast(m, other) >= 4.5) return m; }
        return target;
    }
    function paletteFromRgb(accent) {
        const W = [255, 255, 255], D = [31, 41, 55];
        const white = towards(accent, [0, 0, 0], W), dark = towards(accent, W, D);
        const useWhite = contrast(accent, W) >= contrast(accent, D);
        const solid = useWhite ? white : dark, soft = mix(accent, W, 0.84);
        return { solid: hex(solid), solidText: hex(useWhite ? W : D), solidHover: hex(mix(solid, useWhite ? [0, 0, 0] : W, 0.1)),
            soft: hex(soft), softText: hex(towards(accent, [0, 0, 0], soft)), softBorder: hex(mix(accent, W, 0.55)) };
    }
    function paletteFromImage(src) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 48;
                    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, 48, 48);
                    const data = ctx.getImageData(0, 0, 48, 48).data, buckets = {};
                    for (let i = 0; i < data.length; i += 4) {
                        const c = [data[i], data[i + 1], data[i + 2]];
                        const { s, l } = saturationLightness({ r: c[0], g: c[1], b: c[2] });
                        if (s < 0.25 || l < 0.2 || l > 0.85) continue;
                        const max = Math.max(...c), min = Math.min(...c), d = max - min;
                        const h = max === c[0] ? ((c[1] - c[2]) / d + 6) % 6 : max === c[1] ? (c[2] - c[0]) / d + 2 : (c[0] - c[1]) / d + 4;
                        const b = buckets[Math.floor(h * 2)] || (buckets[Math.floor(h * 2)] = { score: 0, sum: [0, 0, 0], n: 0 });
                        b.score += s * (1 - Math.abs(l - 0.55)); b.n++; b.sum = b.sum.map((v, j) => v + c[j]);
                    }
                    const best = Object.values(buckets).sort((a, b) => b.score - a.score)[0];
                    resolve(best ? paletteFromRgb(best.sum.map(v => v / best.n)) : null);
                } catch (_) { resolve(null); } // 跨網域圖片無法讀取
            };
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }

    let applyId = 0;
    async function applyCurrentTheme() {
        const id = ++applyId;
        const themeId = document.documentElement.getAttribute('data-theme');
        let palette = (window.THEME_BUTTON_PALETTE || {})[themeId];
        if (!palette) {
            const bg = /url\(["']?(.*?)["']?\)/.exec(getComputedStyle(document.body).backgroundImage);
            palette = bg ? await paletteFromImage(bg[1]) : null;
            if (id !== applyId) return;
        }
        setPalette(palette);
        retagAll();
    }

    let retagQueued = false;
    function queueRetag() {
        if (retagQueued) return;
        retagQueued = true;
        requestAnimationFrame(() => { retagQueued = false; retagAll(); });
    }

    function start() {
        applyCurrentTheme();
        new MutationObserver(list => {
            for (const m of list) {
                if (m.type === 'attributes') {
                    if (m.target === document.documentElement) applyCurrentTheme();
                    else if (m.target.matches && m.target.matches(BUTTONS) && !m.target.hasAttribute('data-tb') && !m.target.hasAttribute('data-tb-skip')) tag(m.target);
                } else m.addedNodes.forEach(node => { if (node.nodeType === 1) tagAll(node); });
            }
        }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-theme', 'style', 'class'] });
        // 主題 CSS 載入完成後，按鈕原本的樣子才確定，重新分類
        document.addEventListener('load', e => { if (e.target && e.target.tagName === 'LINK') queueRetag(); }, true);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
})();
