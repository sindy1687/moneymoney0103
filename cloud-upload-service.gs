// 獨立 Google Apps Script 專案。密鑰只放在 Script Properties，不要寫進此檔或網站原始碼。
const PLAYER_GOOGLE_FOLDER = '1i9RoqIzX7C6UyfeHz3sEF-9f-EJwsMv0';

// GET：?twse=... 代查股價；其他情況只做連線檢查。
// 沒有 doGet 時 Apps Script 回傳無 CORS 標頭的 HTML 錯誤頁，瀏覽器會顯示 CORS 錯誤。
// 任何錯誤（證交所逾時、回傳非 JSON 的維護頁…）都要回 JSON；未捕捉的錯誤會讓 Apps Script
// 回傳無 CORS 標頭的錯誤頁，瀏覽器只會看到 CORS 錯誤。
function doGet(event) {
    try {
        const exCh = event && event.parameter && event.parameter.twse;
        if (exCh) return playerResponse(playerTwseQuote(exCh));
        return playerResponse({ success: true, service: 'player-cloud-upload' });
    } catch (error) {
        return playerResponse({ success: false, message: '報價查詢失敗：' + (error && error.message || error) });
    }
}

// 只代查臺灣證交所/櫃買 MIS 報價（瀏覽器無法直接跨網域呼叫，公開 CORS 代理常失效），不是通用代理。
// exCh 例：tse_0050.tw|otc_0050.tw；結果快取 60 秒。
function playerTwseQuote(exCh) {
    if (!/^(tse|otc)_[0-9A-Z]{4,8}\.tw(\|(tse|otc)_[0-9A-Z]{4,8}\.tw){0,19}$/.test(exCh)) return { success: false, message: '股票代碼格式錯誤。' };
    const cache = CacheService.getScriptCache();
    const cached = cache.get('twse:' + exCh);
    if (cached) return JSON.parse(cached);
    const response = UrlFetchApp.fetch('https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=' + encodeURIComponent(exCh), { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) return { success: false, message: '證交所回應 ' + response.getResponseCode() };
    const quotes = (JSON.parse(response.getContentText()).msgArray || [])
        .filter(q => q.c)
        .map(q => ({ code: q.c, ex: q.ex, name: q.n, price: q.z, prevClose: q.y, time: q.t }));
    const result = { success: true, quotes: quotes };
    cache.put('twse:' + exCh, JSON.stringify(result), 60);
    return result;
}

function doPost(event) {
    try {
        const request = JSON.parse(event.postData.contents);
        const properties = PropertiesService.getScriptProperties();
        // UPLOAD_KEY 為選用：管理者在 Script Properties 設定後，才會要求玩家帶對應的 uploadKey。
        // 未設定時所有玩家皆可上傳（此服務只有寫入接口，無列出、下載或刪除）。
        const key = properties.getProperty('UPLOAD_KEY');
        if (key && key !== request.uploadKey) throw new Error('備份服務授權無效。');
        if (request.action !== 'uploadPlayerBackup' || request.provider !== 'google') throw new Error('不支援的備份操作。');
        if (typeof request.content !== 'string' || !/^[^\\/:*?"<>|\x00-\x1f]{1,120}\.json$/.test(request.fileName || '')) throw new Error('備份格式錯誤。');
        const backup = JSON.parse(request.content);
        if (backup.appName !== '記帳本' || !backup.localStorageSnapshot || Array.isArray(backup.localStorageSnapshot) || Object.values(backup.localStorageSnapshot).some(value => typeof value !== 'string')) throw new Error('缺少完整玩家存檔。');
        const blob = Utilities.newBlob(request.content, 'application/json', request.fileName);
        const bytes = blob.getBytes();
        if (bytes.length > 40 * 1024 * 1024) throw new Error('備份超過 40 MB 上限。');
        const hash = playerHash(bytes);
        if (request.sha256 && hash !== request.sha256) throw new Error('備份傳輸驗證失敗。');
        const file = savePlayerGoogle(blob);
        return playerResponse({ success: true, provider: request.provider, fileName: request.fileName, fileId: file.id, size: bytes.length, sha256: hash });
    } catch (error) {
        return playerResponse({ success: false, message: error.message || '備份服務錯誤。' });
    }
}

function playerHash(bytes) {
    return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes).map(value => ('0' + ((value + 256) % 256).toString(16)).slice(-2)).join('');
}

function savePlayerGoogle(blob) {
    const folder = DriveApp.getFolderById(PLAYER_GOOGLE_FOLDER);
    const file = folder.createFile(blob);
    if (file.getSize() !== blob.getBytes().length || playerHash(file.getBlob().getBytes()) !== playerHash(blob.getBytes())) throw new Error('Google Drive 已寫入，但內容驗證失敗，請檢查資料夾。');
    return { id: file.getId() };
}

function playerResponse(value) {
    return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
