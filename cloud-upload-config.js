// 管理者設定。
window.PLAYER_CLOUD_UPLOAD = {
    // 部署 cloud-upload-service.gs 後，填入其 HTTPS /exec 網址
    serviceUrl: 'https://script.google.com/macros/s/AKfycbzk7vF6Ay0KSticFAZI5fcpo-M5AvBfKyUgCwEhtZZmGLuWhQpp7hqzpJZT5pbMmSVilA/exec',
    // 自動備份目標：'google'，或 '' 關閉自動上傳
    // 自動備份一天最多一次（當天已上傳過就不再上傳），且資料有變更才上傳
    autoUpload: 'google',
    // 玩家可上傳的雲端資料夾（name 為按鈕顯示名稱，url 供玩家查看備份）
    folders: {
        google: {
            name: 'Google Drive',
            url: 'https://drive.google.com/drive/folders/1i9RoqIzX7C6UyfeHz3sEF-9f-EJwsMv0'
        }
    }
};
