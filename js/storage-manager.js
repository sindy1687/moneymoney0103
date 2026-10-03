// 儲存空間管理（設定 → 🧹 儲存空間）
// 手機瀏覽器給網站的空間有限；最常見的佔用是照片（收據、表情、背景、圖示）。
// 這裡列出各類資料大小，並在使用者確認後把「過大的舊照片」重新壓縮（不刪除任何資料）。
(() => {
    'use strict';

    // 各類照片的位置與壓縮目標；超過 limit（字元數，約等於位元組）才會重新壓縮
    const IMAGE_RULES = {
        receipt: { label: '收據照片', limit: 300000, size: 1024, quality: 0.6 },
        emoji: { label: '圖片表情', limit: 80000, size: 256, quality: 0.75 },
        icon: { label: '分類圖示', limit: 60000, size: 150, quality: 0.6 },
        account: { label: '帳戶圖片', limit: 80000, size: 240, quality: 0.55 },
        background: { label: '背景照片', limit: 500000, size: 1280, quality: 0.72 }
    };

    const isDataImage = value => typeof value === 'string' && value.startsWith('data:image/');
    const readJson = (key, fallback) => {
        try { return JSON.parse(playerStorage.getItem(key) || '') ?? fallback; } catch (_) { return fallback; }
    };
    const mb = chars => (chars / 1048576).toFixed(chars < 1048576 ? 2 : 1);

    // 走訪所有照片欄位：visit(kind, value, replace)
    function forEachImage(visit) {
        const records = readJson('accountingRecords', []);
        if (Array.isArray(records)) records.forEach(record => {
            if (record && Array.isArray(record.receiptImages)) record.receiptImages.forEach((img, i) => {
                if (isDataImage(img)) visit('receipt', img, next => { record.receiptImages[i] = next; return 'accountingRecords'; }, records);
            });
        });
        const emojis = readJson('imageEmojis', []);
        if (Array.isArray(emojis)) emojis.forEach(item => {
            if (item && isDataImage(item.url)) visit('emoji', item.url, next => { item.url = next; return 'imageEmojis'; }, emojis);
        });
        const icons = readJson('categoryCustomIcons', {});
        if (icons && typeof icons === 'object') Object.values(icons).forEach(icon => {
            if (icon && icon.type === 'image' && isDataImage(icon.value)) visit('icon', icon.value, next => { icon.value = next; return 'categoryCustomIcons'; }, icons);
        });
        const accounts = readJson('accounts', []);
        if (Array.isArray(accounts)) accounts.forEach(account => {
            if (account && isDataImage(account.image)) visit('account', account.image, next => { account.image = next; return 'accounts'; }, accounts);
        });
        const custom = readJson('customTheme', {});
        if (custom && isDataImage(custom.backgroundImage)) visit('background', custom.backgroundImage, next => { custom.backgroundImage = next; return 'customTheme'; }, custom);
        const backgrounds = readJson('customHistoryBackgrounds', []);
        if (Array.isArray(backgrounds)) backgrounds.forEach(bg => {
            if (bg && isDataImage(bg.url)) visit('background', bg.url, next => { bg.url = next; return 'customHistoryBackgrounds'; }, backgrounds);
        });
    }

    function analyze() {
        let total = 0;
        const keys = [];
        for (let i = 0; i < playerStorage.length; i++) {
            const key = playerStorage.key(i);
            const size = (playerStorage.getItem(key) || '').length + key.length;
            total += size;
            keys.push({ key, size });
        }
        keys.sort((a, b) => b.size - a.size);
        const images = {};
        Object.keys(IMAGE_RULES).forEach(kind => { images[kind] = { count: 0, size: 0, oversized: 0 }; });
        forEachImage((kind, value) => {
            const stat = images[kind];
            stat.count++; stat.size += value.length;
            if (value.length > IMAGE_RULES[kind].limit) stat.oversized++;
        });
        return { total, keys, images };
    }

    function imageSize(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = reject;
            img.src = dataUrl;
        });
    }

    // 重新壓縮過大的照片；只有變小才替換，失敗的保留原圖
    async function shrinkImages(onProgress) {
        if (typeof compressImage !== 'function') throw new Error('壓縮功能未載入');
        const jobs = [];
        forEachImage((kind, value) => {
            if (value.length > IMAGE_RULES[kind].limit) jobs.push({ kind, value });
        });
        // 先全部壓縮好（原圖 → 新圖），期間不寫入
        const replacements = new Map();
        let done = 0;
        for (const job of jobs) {
            const rule = IMAGE_RULES[job.kind];
            try {
                // 已經是目標尺寸以內的 JPEG（先前壓過）就跳過，避免重複壓縮讓畫質一直下降
                const dims = await imageSize(job.value);
                if (job.value.startsWith('data:image/jpeg') && Math.max(dims.width, dims.height) <= rule.size) {
                    done++;
                    if (onProgress) onProgress(done, jobs.length);
                    continue;
                }
                const next = await compressImage(job.value, rule.size, rule.size, rule.quality);
                if (next && next.length < job.value.length) replacements.set(job.value, next);
            } catch (_) { /* 保留原圖 */ }
            done++;
            if (onProgress) onProgress(done, jobs.length);
        }
        // 重新讀取最新資料再替換：壓縮期間若有新增或修改記錄，不會被舊資料覆蓋
        const dirty = new Map();
        let saved = 0;
        forEachImage((kind, value, replace, container) => {
            const next = replacements.get(value);
            if (!next) return;
            dirty.set(replace(next), container);
            saved += value.length - next.length;
        });
        for (const [key, container] of dirty) playerStorage.setItem(key, JSON.stringify(container));
        await playerStorage.flush();
        return { count: replacements.size, saved };
    }

    async function deviceEstimate() {
        try {
            if (navigator.storage && navigator.storage.estimate) return await navigator.storage.estimate();
        } catch (_) {}
        return null;
    }

    async function showStorageManager() {
        document.getElementById('storageManagerOverlay')?.remove();
        const overlay = document.createElement('div');
        overlay.id = 'storageManagerOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,0.45);';
        overlay.innerHTML = `
            <div class="modal-content storage-manager" role="dialog" aria-label="儲存空間" style="width:100%;max-width:min(94vw,520px);max-height:88vh;overflow-y:auto;padding:20px;box-sizing:border-box;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <h3 class="modal-title" style="margin:0;font-size:18px;">🧹 儲存空間</h3>
                    <button type="button" class="modal-close-btn" data-close style="width:36px;height:36px;border-radius:50%;font-size:18px;">✕</button>
                </div>
                <div class="storage-manager-body">讀取中…</div>
            </div>`;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', e => { if (e.target === overlay || e.target.closest('[data-close]')) overlay.remove(); });
        await render(overlay.querySelector('.storage-manager-body'));
    }

    async function render(body) {
        const info = analyze();
        const estimate = await deviceEstimate();
        const oversized = Object.values(info.images).reduce((s, x) => s + x.oversized, 0);
        const imageRows = Object.entries(IMAGE_RULES).map(([kind, rule]) => {
            const s = info.images[kind];
            if (!s.count) return '';
            return `<tr><td>${rule.label}</td><td style="text-align:right">${s.count} 張</td><td style="text-align:right">${mb(s.size)} MB</td><td style="text-align:right">${s.oversized ? `<b>${s.oversized} 張過大</b>` : '—'}</td></tr>`;
        }).join('');
        const keyRows = info.keys.slice(0, 6).map(k => `<tr><td style="word-break:break-all">${k.key}</td><td style="text-align:right">${mb(k.size)} MB</td></tr>`).join('');
        const device = estimate && estimate.quota
            ? `<p style="margin:0 0 4px">瀏覽器給本網站：已用 <b>${mb(estimate.usage)} MB</b> / 上限約 ${mb(estimate.quota)} MB（${Math.round(estimate.usage / estimate.quota * 100)}%）</p>`
            : '';
        body.innerHTML = `
            ${device}
            <p style="margin:0 0 12px">帳本資料合計約 <b>${mb(info.total)} MB</b></p>
            <h4 style="margin:12px 0 6px">照片</h4>
            ${imageRows ? `<table style="width:100%;border-collapse:collapse;font-size:14px">${imageRows}</table>` : '<p style="margin:0">沒有儲存照片。</p>'}
            <h4 style="margin:16px 0 6px">佔用最多的資料</h4>
            <table style="width:100%;border-collapse:collapse;font-size:14px">${keyRows}</table>
            <div style="margin-top:16px;font-size:13px;line-height:1.6">
                ${oversized
                    ? `有 <b>${oversized}</b> 張照片過大。壓縮會降低這些照片的解析度（收據文字仍可辨識），<b>不會刪除任何記錄或照片</b>。建議先到「設定 → 上傳到 Google Drive」備份。`
                    : '照片大小都在合理範圍內，不需要壓縮。'}
            </div>
            <div class="storage-manager-actions" style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
                ${oversized ? '<button type="button" class="form-submit-btn" data-shrink style="flex:1;min-width:140px;padding:12px;border-radius:12px">壓縮過大的照片</button>' : ''}
                <button type="button" class="cancel-btn" data-close style="flex:1;min-width:100px;padding:12px;border-radius:12px">關閉</button>
            </div>
            <p class="storage-manager-status" style="margin:10px 0 0;font-size:13px" role="status"></p>`;
        const shrinkBtn = body.querySelector('[data-shrink]');
        if (shrinkBtn) shrinkBtn.addEventListener('click', async () => {
            const status = body.querySelector('.storage-manager-status');
            shrinkBtn.disabled = true;
            try {
                const result = await shrinkImages((done, total) => { status.textContent = `壓縮中… ${done} / ${total}`; });
                status.textContent = `完成：處理 ${result.count} 張，省下約 ${mb(result.saved)} MB。`;
                setTimeout(() => render(body).then(() => {
                    const s = body.querySelector('.storage-manager-status');
                    if (s) s.textContent = `完成：處理 ${result.count} 張，省下約 ${mb(result.saved)} MB。`;
                }), 400);
            } catch (error) {
                status.textContent = `未完成：${error.message || error}。原有資料沒有被修改。`;
                shrinkBtn.disabled = false;
            }
        });
    }

    // 請求「永久儲存」：降低手機在空間吃緊時自動清掉本網站資料的機率
    document.addEventListener('playerappready', () => {
        try {
            if (navigator.storage && navigator.storage.persist) {
                navigator.storage.persisted().then(already => { if (!already) navigator.storage.persist().catch(() => {}); }).catch(() => {});
            }
        } catch (_) {}
    });

    window.showStorageManager = showStorageManager;
    window.analyzePlayerStorage = analyze;
    if (typeof module !== 'undefined' && module.exports) module.exports = { analyze, shrinkImages, IMAGE_RULES };
})();
