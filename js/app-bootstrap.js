/* Load application scripts only after the IndexedDB view is ready. */
(async () => {
    const databaseName = document.currentScript?.dataset.storageName || 'money-player-data-v1';
    const diagnostic = databaseName !== 'money-player-data-v1';
    const panel = document.createElement('div');
    panel.id = 'playerStorageStatus';
    panel.setAttribute('role', 'status'); panel.setAttribute('aria-live', 'polite');
    // 平常不顯示；只有帳本無法啟動或儲存失敗時才出現
    panel.style.cssText = 'position:fixed;inset:auto 12px 12px;border-radius:12px;box-shadow:0 2px 20px #0003;z-index:2147483647;background:#f8faff;color:#172554;display:none;align-items:center;justify-content:center;flex-direction:column;gap:14px;padding:24px;text-align:center;font:16px/1.6 system-ui';
    const label = document.createElement('div'); panel.appendChild(label);
    document.body.appendChild(panel);
    let starting = true;
    function exportEmergency() {
        const store = window.playerStorage || window.localStorage;
        const snapshot = Object.fromEntries(Array.from({ length: store.length }, (_, index) => { const key = store.key(index); return [key, store.getItem(key)]; }));
        const url = URL.createObjectURL(new Blob([JSON.stringify({ appName: '記帳本', backupVersion: 'recovery-1', backupDate: new Date().toISOString(), localStorageSnapshot: snapshot })], { type: 'application/json' }));
        const link = document.createElement('a'); link.href = url; link.download = '記帳本緊急備份.json'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
    const rescue = document.createElement('button'); rescue.textContent = '匯出目前資料備份'; rescue.onclick = exportEmergency; rescue.hidden = true; panel.appendChild(rescue);
    const retry = document.createElement('button'); retry.textContent = '重試儲存'; retry.hidden = true;
    retry.onclick = async () => { try { await playerStorage.retry(); } catch (_) {} }; panel.appendChild(retry);
    function stateChanged({ state, error }) {
        if (starting) return;
        rescue.hidden = retry.hidden = state !== 'error';
        // 一般儲存不顯示提示，只有儲存失敗才顯示
        panel.style.display = 'none';
        const quotaFull = error && (error.name === 'QuotaExceededError' || /quota|空間/i.test(error.message || ''));
        if (state !== 'error') return;
        label.textContent = quotaFull ? '手機給本網站的儲存空間已滿，這次修改尚未儲存。請先匯出備份，再到「設定 → 🧹 儲存空間」壓縮過大的照片，然後按「重試儲存」。勿清除網站資料。'
            : `尚未儲存：${error?.message || '裝置儲存失敗'}。請先匯出備份，勿清除網站資料。`;
    }
    try {
        window.playerStorage = await createPlayerStorage({ indexedDB: window.indexedDB, legacy: diagnostic ? null : window.localStorage, name: databaseName, onState: stateChanged });
        if (diagnostic) {
            const notice = document.createElement('p'); notice.textContent = '測試頁：使用獨立測試資料，不會修改正式帳本。';
            notice.style.cssText = 'background:#fff3cd;color:#664d03;padding:12px'; document.body.prepend(notice);
        }
        // 先載入目前主題的 CSS（最多等 4 秒），程式啟動時不會閃一下預設樣式
        if (typeof window.loadThemeCss === 'function') {
            const savedTheme = playerStorage.getItem('selectedTheme') || playerStorage.getItem('theme') || 'blue';
            await Promise.race([window.loadThemeCss(savedTheme), new Promise(resolve => setTimeout(resolve, 4000))]);
        }
        // Chart.js 以 defer 載入；DOMContentLoaded 時一定已執行完，之後才啟動程式
        if (document.readyState === 'loading') await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
        for (const source of document.querySelectorAll('script[type="application/x-player-script"]')) {
            const script = document.createElement('script');
            if (source.dataset.scriptType) script.type = source.dataset.scriptType;
            script.async = false;
            if (source.dataset.src) {
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = () => reject(new Error(`程式載入失敗：${source.dataset.src}`));
                    script.src = source.dataset.src; source.after(script);
                });
            } else { script.textContent = source.textContent; source.after(script); }
        }
        window.playerAppReady = true;
        document.dispatchEvent(new Event('playerappready'));
        await playerStorage.flush();
        starting = false;
        window.addEventListener('beforeunload', event => {
            if (playerStorage.hasPending()) { event.preventDefault(); event.returnValue = ''; }
        });
        document.addEventListener('visibilitychange', () => { if (document.hidden) playerStorage.flush().catch(() => {}); });
    } catch (error) {
        starting = false;
        label.textContent = `帳本未啟動：${error.message}。請勿清除網站資料，可先匯出備份。`;
        rescue.hidden = false; panel.style.display = 'none';
    }
})();
