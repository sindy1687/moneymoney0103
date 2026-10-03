// 玩家完整資料 → JSON 檔 → 雲端資料夾
// 連線網址與目的地資料夾由 cloud-upload-config.js 的 window.PLAYER_CLOUD_UPLOAD 提供
(() => {
    'use strict';

    const HASH_KEY = 'playerCloudLastUploadHash';
    const LAST_UPLOAD_KEY = 'playerCloudLastUpload';
    const CHECK_MS = 60 * 1000;
    const RETRY_MS = 60 * 60 * 1000;
    const MAX_BYTES = 40 * 1024 * 1024;

    // 屬於「這台裝置」的連線設定，不屬於玩家存檔，不會寫進上傳的 JSON
    const DEVICE_ONLY_KEYS = new Set([
        'playerCloudUploadKey',
        'moneyCloudBackupConfig',
        'googleSheetUploadUrl',
        'googleCloudBackupKey',
        HASH_KEY,
        LAST_UPLOAD_KEY
    ]);

    let uploading = false;
    let nextAutoAt = 0;
    let lastUploadDay = '';
    const uploadedHashes = {};
    let checking = false;

    function config() { return window.PLAYER_CLOUD_UPLOAD || {}; }
    function folders() { return config().folders || {}; }

    // 收集所有玩家資料。
    // 格式與「設定 → 本機備份」相同，產生的 JSON 可直接用「還原」匯入另一台設備。
    function collectPlayerBackup() {
        const snapshot = {};
        for (let i = 0; i < playerStorage.length; i++) {
            const key = playerStorage.key(i);
            if (!DEVICE_ONLY_KEYS.has(key)) snapshot[key] = playerStorage.getItem(key);
        }
        return {
            appName: '記帳本',
            backupVersion: 'player-full-1.0',
            backupDate: new Date().toISOString(),
            localStorageSnapshot: snapshot
        };
    }

    function hex(buffer) {
        return Array.from(new Uint8Array(buffer), n => n.toString(16).padStart(2, '0')).join('');
    }

    async function sha256Hex(text) {
        if (typeof crypto === 'undefined' || !crypto.subtle) return '';
        return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
    }

    async function snapshotHash(snapshot) {
        const stable = Object.keys(snapshot).sort().map(key => [key, snapshot[key]]);
        return sha256Hex(JSON.stringify(stable));
    }

    function serviceUrl() {
        const url = config().serviceUrl || '';
        return /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url) ? url : '';
    }

    // 檔名用畫面上的帳本名稱（例如「Sindy的帳本」），去掉雲端檔名不允許的字元
    function ledgerName() {
        const el = typeof document !== 'undefined' && typeof document.querySelector === 'function'
            ? document.querySelector('.ledger-title') : null;
        const name = ((el && el.textContent) || '').replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').trim().slice(0, 80);
        return name || '記帳本';
    }

    // 本地時間 2026-10-03_14-30-05
    function uploadStamp(date) {
        const p = n => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}_${p(date.getHours())}-${p(date.getMinutes())}-${p(date.getSeconds())}`;
    }

    function notify(message, type) {
        if (typeof showNotification === 'function') {
            showNotification(message, type || 'info');
        } else {
            alert(message);
        }
    }

    async function uploadPlayerJsonToCloud(provider, auto = false) {
        const target = folders()[provider];
        if (uploading || !target) return false;
        const url = serviceUrl();
        if (!url) {
            if (!auto) notify('尚未上傳：雲端上傳服務尚未設定，請管理者確認 cloud-upload-config.js。', 'error');
            return false;
        }
        uploading = true;
        const progressShown = !auto && typeof showUploadProgress === 'function';
        try {
            const backup = collectPlayerBackup();
            const content = JSON.stringify(backup);
            const bytes = new Blob([content]).size;
            if (bytes > MAX_BYTES) throw new Error('備份超過服務的 40 MB 上限，尚未上傳。');
            const sha256 = await sha256Hex(content);
            const fileName = `${ledgerName()}_${uploadStamp(new Date(backup.backupDate))}.json`;
            if (progressShown) showUploadProgress(`正在上傳 ${(bytes / 1048576).toFixed(2)} MB 到 ${target.name}…`);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
                body: JSON.stringify({
                    action: 'uploadPlayerBackup',
                    provider,
                    uploadKey: playerStorage.getItem('playerCloudUploadKey') || '',
                    fileName,
                    content,
                    sha256
                }),
                signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(180000) : undefined,
                redirect: 'follow'
            });
            if (!response.ok) throw new Error(`上傳服務回應 ${response.status}`);
            let result;
            try { result = await response.json(); }
            catch { throw new Error('上傳服務未回傳有效資料，請確認部署網址與服務存取權限。'); }
            if (!result.success) throw new Error(result.message || '雲端服務未確認成功');
            if (result.provider !== provider || result.fileName !== fileName || !result.fileId || result.size !== bytes || (sha256 && result.sha256 !== sha256)) {
                throw new Error('已送出資料，但雲端驗證結果不符，請檢查資料夾後再試');
            }
            const hash = await snapshotHash(backup.localStorageSnapshot);
            if (hash) uploadedHashes[provider] = hash;
            // Remote success must not become failure when Safari's local quota is full.
            try {
                if (hash) playerStorage.setItem(HASH_KEY, JSON.stringify(uploadedHashes));
                playerStorage.setItem(LAST_UPLOAD_KEY, JSON.stringify({ provider, fileName, at: new Date().toISOString() }));
            } catch (_) { /* Keep session state; never remove player data to save metadata. */ }
            lastUploadDay = localDay(new Date());
            notify(`已${auto ? '自動' : ''}上傳到 ${target.name}：${fileName}。可在另一台設備用「設定 → 還原」匯入此 JSON。`, 'success');
            return true;
        } catch (error) {
            const timedOut = error && (error.name === 'TimeoutError' || error.name === 'AbortError');
            notify(`${auto ? '自動備份' : '上傳'}未完成：${timedOut ? '連線逾時，請先查看雲端資料夾是否已有檔案，再重試。' : (error.message || error)}`, 'error');
            return false;
        } finally {
            if (progressShown && typeof hideUploadProgress === 'function') hideUploadProgress();
            uploading = false;
        }
    }

    function openPlayerCloudFolder(provider) {
        const map = folders();
        const target = map[provider] || map.google || Object.values(map)[0];
        if (target && target.url) {
            window.open(target.url, '_blank', 'noopener');
        } else {
            notify('尚未設定雲端資料夾連結。', 'error');
        }
    }

    function lastUploadText() {
        try {
            const info = JSON.parse(playerStorage.getItem(LAST_UPLOAD_KEY) || 'null');
            if (!info || !info.at) return '';
            return `上次上傳：${new Date(info.at).toLocaleString()}`;
        } catch (_) {
            return '';
        }
    }

    // 本地日期 YYYY-MM-DD（以手機時區判斷「今天」）
    function localDay(date) {
        const p = n => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
    }

    // 今天是否已上傳過（自動或手動都算）；寫入失敗時以記憶體中的紀錄為準
    function uploadedToday() {
        const today = localDay(new Date());
        if (lastUploadDay === today) return true;
        try {
            const info = JSON.parse(playerStorage.getItem(LAST_UPLOAD_KEY) || 'null');
            return !!(info && info.at && localDay(new Date(info.at)) === today);
        } catch (_) {
            return false;
        }
    }

    // 自動備份：一天最多一次，且只有資料有變更才上傳；失敗時一小時後再試
    async function autoTick() {
        const provider = config().autoUpload;
        if (!provider || !folders()[provider] || uploading || checking || Date.now() < nextAutoAt) return;
        if (typeof document !== 'undefined' && document.hidden) return;
        if (!serviceUrl() || uploadedToday()) return;
        checking = true;
        try {
            const hash = await snapshotHash(collectPlayerBackup().localStorageSnapshot);
            let previous = uploadedHashes[provider];
            if (!previous) {
                try { previous = JSON.parse(playerStorage.getItem(HASH_KEY) || '{}')[provider]; } catch (_) {}
            }
            if (hash && hash === previous) return;
            if (!await uploadPlayerJsonToCloud(provider, true)) nextAutoAt = Date.now() + RETRY_MS;
        } catch (_) {
            nextAutoAt = Date.now() + RETRY_MS;
        } finally { checking = false; }
    }

    window.uploadPlayerJsonToCloud = uploadPlayerJsonToCloud;
    window.openPlayerCloudFolder = openPlayerCloudFolder;
    window.playerCloudLastUploadText = lastUploadText;
    window.collectPlayerBackup = collectPlayerBackup;

    if (typeof document !== 'undefined') {
        document.addEventListener('playerappready', () => {
            if (typeof setInterval === 'function') {
                setInterval(autoTick, CHECK_MS);
                autoTick();
            }
        });
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { collectPlayerBackup, uploadPlayerJsonToCloud, openPlayerCloudFolder, autoTick };
    }
})();
