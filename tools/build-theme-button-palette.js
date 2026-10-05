// 由主題背景圖的像素算出按鈕顏色，輸出 js/theme-button-palette.js。
// 由 tools/build-theme-button-palette.ps1 呼叫（--list 列出主題、--pixels 產生色票）。
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function loadThemes() {
    const lines = fs.readFileSync(path.join(root, 'js/theme.js'), 'utf8').split('\n');
    const end = lines.findIndex((line, i) => i > 0 && /^\];/.test(line));
    const body = lines.slice(1, end + 1).join('\n').replace(/^var themes = window\.AppThemes \|\|/m, 'return');
    return new Function('window', body)({});
}

const hexToRgb = hex => {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16));
};
const rgbToHex = rgb => '#' + rgb.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

function rgbToHsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
}
function hslToRgb([h, s, l]) {
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return [f(0) * 255, f(8) * 255, f(4) * 255];
}
function luminance(rgb) {
    const [r, g, b] = rgb.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mix = (a, b, t) => a.map((v, i) => v * (1 - t) + b[i] * t);

const WHITE = [255, 255, 255], DARK = [31, 41, 55];

// 調整亮度直到文字對比 ≥ 4.5（WCAG AA）；取 4.6 留餘裕，轉成 #hex 四捨五入後仍 ≥ 4.5
function fitLightness(rgb, text, direction) {
    const hsl = rgbToHsl(rgb);
    for (let step = 0; step <= 100; step++) {
        const candidate = hslToRgb([hsl[0], hsl[1], Math.max(0, Math.min(1, hsl[2] + direction * step / 100))]);
        if (contrast(candidate, text) >= 4.6) return { rgb: candidate, shift: step };
    }
    return null;
}

// 背景圖中最有代表性的鮮明顏色（依色相分 12 組，取飽和、亮度適中的那組）
function accentFromPixels(pixels) {
    const buckets = Array.from({ length: 12 }, () => ({ score: 0, sum: [0, 0, 0], n: 0 }));
    let colorful = 0;
    for (let i = 0; i < pixels.length; i += 3) {
        const rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
        const [h, s, l] = rgbToHsl(rgb);
        if (s < 0.25 || l < 0.2 || l > 0.85) continue;
        colorful++;
        const b = buckets[Math.floor(h / 30) % 12];
        b.score += s * (1 - Math.abs(l - 0.55));
        b.n++; b.sum = b.sum.map((v, j) => v + rgb[j]);
    }
    if (colorful < pixels.length / 3 * 0.03) return null; // 幾乎沒有彩色（黑白、灰色圖）
    const best = buckets.reduce((a, b) => (b.score > a.score ? b : a));
    return best.sum.map(v => v / best.n);
}

function paletteFor(accent) {
    // 實心按鈕：白字或深字，選需要調整亮度最少的
    const options = [
        Object.assign({ text: WHITE }, fitLightness(accent, WHITE, -1)),
        Object.assign({ text: DARK }, fitLightness(accent, DARK, +1))
    ].filter(o => o.rgb).sort((a, b) => a.shift - b.shift);
    const solid = options[0];
    const hover = rgbToHsl(solid.rgb);
    const hoverRgb = hslToRgb([hover[0], hover[1], Math.max(0, hover[2] + (solid.text === WHITE ? -0.06 : 0.06))]);
    // 淺色按鈕：主色調淡的底 + 同色系深字
    const soft = mix(accent, WHITE, 0.84);
    const softText = fitLightness(accent, soft, -1).rgb;
    return {
        solid: rgbToHex(solid.rgb), solidText: rgbToHex(solid.text), solidHover: rgbToHex(hoverRgb),
        soft: rgbToHex(soft), softText: rgbToHex(softText), softBorder: rgbToHex(mix(accent, WHITE, 0.55)),
        // 以實際輸出的 #hex 計算
        contrast: {
            solid: +contrast(hexToRgb(rgbToHex(solid.rgb)), solid.text).toFixed(2),
            soft: +contrast(hexToRgb(rgbToHex(soft)), hexToRgb(rgbToHex(softText))).toFixed(2)
        }
    };
}

const args = process.argv.slice(2);
const themes = loadThemes();
if (args[0] === '--list') {
    process.stdout.write(JSON.stringify(themes.map(t => ({ id: t.id, image: t.backgroundImage || '' }))));
} else if (args[0] === '--pixels') {
    const pixels = JSON.parse(fs.readFileSync(args[1], 'utf8'));
    const out = {};
    for (const theme of themes) {
        const fromImage = pixels[theme.id] ? accentFromPixels(pixels[theme.id]) : null;
        const accent = fromImage || hexToRgb(theme.color || '#6366f1');
        const p = paletteFor(accent);
        p.source = fromImage ? 'image' : (theme.backgroundImage ? 'color-fallback' : 'color');
        out[theme.id] = p;
    }
    const lines = Object.entries(out).map(([id, p]) => `    ${JSON.stringify(id)}: ${JSON.stringify(p)}`);
    fs.writeFileSync(path.join(root, 'js/theme-button-palette.js'),
        '// 自動產生，請勿手動修改：powershell -ExecutionPolicy Bypass -File tools/build-theme-button-palette.ps1\n' +
        '// 每個主題由背景圖算出的按鈕顏色（solid：主要按鈕；soft：一般按鈕）\n' +
        'window.THEME_BUTTON_PALETTE = {\n' + lines.join(',\n') + '\n};\n');
    const weak = Object.entries(out).filter(([, p]) => p.contrast.solid < 4.5 || p.contrast.soft < 4.5);
    const fallback = Object.entries(out).filter(([, p]) => p.source === 'color-fallback').map(([id]) => id);
    console.log(`themes: ${themes.length}  from image: ${Object.values(out).filter(p => p.source === 'image').length}  ` +
        `color-only: ${Object.values(out).filter(p => p.source === 'color').length}  image unusable -> theme color: ${fallback.join(', ') || 'none'}`);
    console.log(`contrast below 4.5: ${weak.map(([id]) => id).join(', ') || 'none'}`);
}
