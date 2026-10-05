# 玩家 JSON 雲端資料夾上傳

玩家在「設定 → 📁 雲端資料夾（JSON 檔）」按「上傳到 Google Drive」，會把這台裝置的全部資料即時打包成一個 JSON 檔，透過 `cloud-upload-service.gs` 服務寫入 `cloud-upload-config.js` `folders.google` 指定的 Google Drive 資料夾。玩家不需要登入、不需要設定金鑰、不需下載或選檔。

上傳的 JSON 內含 `localStorageSnapshot`（完整 localStorage 快照，含動態月份、規劃、圖片、帳戶與偏好），格式與「本機備份」相同，可在另一台設備用「設定 → 還原」直接匯入。屬於單一裝置的連線設定（上傳金鑰、Sheet 網址等）不會寫進 JSON。檔名為「帳本名稱_上傳日期時間.json」，例如 `Sindy的帳本_2026-10-03_14-30-05.json`。

只有玩家在設定頁按上傳時才會上傳，沒有自動上傳。

同一個服務也提供股價代查：網站以 `GET ?twse=tse_0050.tw|otc_0050.tw` 透過服務查詢證交所／櫃買報價（瀏覽器無法直接跨網域呼叫證交所，公開 CORS 代理常失效）。只接受股票代碼格式，不是通用代理。

## 管理者部署

1. 建立獨立 Google Apps Script 專案，貼入 `cloud-upload-service.gs`（不要與既有 `GoogleAppsScriptBackend.js` 放在同一個專案，兩者都有 doPost）。執行身分須能寫入指定 Google Drive 資料夾。
2. （選用）若要限制只有獲授權的裝置可上傳，在 Script Properties 設定強隨機 `UPLOAD_KEY`，並在那些裝置的 localStorage 設 `playerCloudUploadKey`。**未設定 `UPLOAD_KEY` 時所有玩家皆可上傳**——此服務只有寫入接口，沒有列出、下載或刪除檔案的接口。
3. 部署為 Web App，以管理者身分執行；部署存取設定必須選「所有人」（Anyone）。選「任何具有 Google 帳戶的人」或「只有我自己」時，網頁的跨網域 fetch 會被導向 Google 登入頁，瀏覽器會顯示 CORS 錯誤。把部署得到的 `/exec` 網址填入 `cloud-upload-config.js` 的 `serviceUrl`。**程式碼更新後須在「管理部署作業」編輯既有部署、選「新版本」，網址才會維持不變。**
4. 用瀏覽器開 `/exec` 網址，應看到 `{"success":true,"service":"player-cloud-upload"}`。再到設定頁按上傳，確認 Google Drive 資料夾出現新 JSON；於測試設備用「設定 → 還原」匯入。不要在唯一存有原始資料的設備上做覆蓋還原測試。

單檔上限 40 MB。網站等候服務回應才顯示成功；逾時可能已寫入，應先檢查資料夾再重試。瀏覽器支援 SHA-256 時會驗證傳輸內容，Google 端另外驗證遠端完整內容。Google Apps Script 的執行時間及 UrlFetch 配額仍適用。

## 檔案

- `cloud-upload-config.js`：管理者連線設定（serviceUrl、folders）。
- `js/player-cloud-upload.js`：玩家端收集、上傳與通知。
- `cloud-upload-service.gs`：Google Drive 寫入服務與證交所股價代查。

## 官方參考

- [Google Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)
