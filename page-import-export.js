// 匯入／匯出與備份相關功能（由 script.js 拆出）

// 顯示替代方案
function showFallbackOptions() {
    const fallbackModal = document.createElement('div');
    fallbackModal.id = 'fallbackModal';
    fallbackModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10007;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    fallbackModal.innerHTML = `
        <div style="background: white; border-radius: 16px; padding: 32px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <h3 style="margin: 0 0 20px 0; color: #333;">🔄 替代備份方案</h3>
            <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">
                由於雲端上傳失敗，您可以嘗試以下替代方案：
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <button onclick="downloadBackupFile()" style="
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    💾 下載備份檔案到本機
                </button>
                
                <button onclick="copyDataToClipboard()" style="
                    background: linear-gradient(135deg, #f093fb, #f5576c);
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    📋 複製數據到剪貼簿
                </button>
                
                <button onclick="retryUpload()" style="
                    background: linear-gradient(135deg, #4facfe, #00f2fe);
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    🔄 重新嘗試上傳
                </button>
                
                <button onclick="checkGoogleScriptSettings()" style="
                    background: linear-gradient(135deg, #43e97b, #38f9d7);
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    ⚙️ 檢查 Google Script 設定
                </button>
            </div>
            
            <div style="margin-top: 24px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
                <h4 style="margin: 0 0 8px 0; color: #495057; font-size: 14px;">📝 Google Script 設定檢查清單：</h4>
                <ul style="margin: 0; padding-left: 20px; color: #6c757d; font-size: 13px; line-height: 1.4;">
                    <li>Web App 是否已正確部署？</li>
                    <li>權限是否設為 "Anyone" 可以存取？</li>
                    <li>執行權限是否設為 "Execute as me"？</li>
                    <li>URL 是否正確複製？</li>
                    <li>是否有網路連線問題？</li>
                </ul>
            </div>
            
            <button onclick="closeFallbackModal()" style="
                background: #6c757d;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                margin-top: 20px;
                width: 100%;
            ">
                關閉
            </button>
        </div>
    `;
    
    document.body.appendChild(fallbackModal);
}

// 檢測是否為 iOS 設備
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// 檢測是否為移動設備
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

// 下載備份檔案
function downloadBackupFile() {
    try {
        const allData = collectAllData();
        const dataStr = JSON.stringify(allData, null, 2);
        
        // iOS 和部分移動設備的處理方式
        if (isIOS() || isMobile()) {
            // 使用 data URI 方式，在 iOS 上可能會在新標籤頁打開
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const link = document.createElement('a');
            link.href = dataUri;
            link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 如果是 iOS，提供額外的複製選項
            if (isIOS()) {
                setTimeout(() => {
                    const copyOption = confirm('如果下載沒有自動開始，是否要複製備份數據到剪貼簿？');
                    if (copyOption) {
                        copyDataToClipboard();
                    }
                }, 1000);
            }
        } else {
            // 桌面瀏覽器使用 Blob 方式
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        showNotification('備份檔案已下載到本機！', 'success');
        closeFallbackModal();
        saveBackupHistory('success', '本機備份檔案下載成功');
    } catch (error) {
        showNotification('下載失敗：' + error.message + '，請嘗試使用複製到剪貼簿功能', 'error');
    }
}

// 複製數據到剪貼簿
function copyDataToClipboard() {
    try {
        const allData = collectAllData();
        const dataStr = JSON.stringify(allData, null, 2);
        
        // 優先使用現代 Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(dataStr).then(() => {
                showNotification('數據已複製到剪貼簿！', 'success');
                closeFallbackModal();
                saveBackupHistory('success', '數據複製到剪貼簿成功');
            }).catch(err => {
                // 如果 Clipboard API 失敗，使用後備方案
                fallbackCopyToClipboard(dataStr);
            });
        } else {
            // 使用後備方案（舊版瀏覽器或非 HTTPS 環境）
            fallbackCopyToClipboard(dataStr);
        }
    } catch (error) {
        showNotification('複製失敗：' + error.message, 'error');
    }
}

// 後備複製方案（使用 textarea + execCommand）
function fallbackCopyToClipboard(text) {
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (successful) {
            showNotification('數據已複製到剪貼簿！', 'success');
            closeFallbackModal();
            saveBackupHistory('success', '數據複製到剪貼簿成功');
        } else {
            // 如果 execCommand 也失敗，顯示數據讓用戶手動複製
            showDataForManualCopy(text);
        }
    } catch (error) {
        // 最後的後備方案：顯示數據讓用戶手動複製
        showDataForManualCopy(text);
    }
}

// 顯示數據供手動複製
function showDataForManualCopy(text) {
    const modal = document.createElement('div');
    modal.id = 'manualCopyModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10009;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 16px; padding: 24px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <h3 style="margin: 0 0 16px 0; color: #333;">📋 手動複製備份數據</h3>
            <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">
                由於瀏覽器限制，請手動選擇並複製以下數據：
            </p>
            <textarea id="manualCopyTextarea" style="
                width: 100%;
                height: 200px;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-family: monospace;
                font-size: 12px;
                resize: vertical;
            ">${text}</textarea>
            <div style="margin-top: 16px; display: flex; gap: 8px;">
                <button onclick="document.getElementById('manualCopyTextarea').select(); document.execCommand('copy'); alert('已嘗試複製！');" style="
                    flex: 1;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    選取並複製
                </button>
                <button onclick="closeManualCopyModal()" style="
                    flex: 1;
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                ">
                    關閉
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeManualCopyModal() {
    const modal = document.getElementById('manualCopyModal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// 重新嘗試上傳
function retryUpload() {
    closeFallbackModal();
    setTimeout(() => {
        uploadAllDataToGoogleSheet();
    }, 500);
}

// 檢查 Google Script 設定
function checkGoogleScriptSettings() {
    const currentUrl = localStorage.getItem('googleSheetUploadUrl');
    const currentKey = localStorage.getItem('googleCloudBackupKey');
    
    let message = '📋 目前設定狀態：\n\n';
    message += `Google Sheet URL：${currentUrl ? '已設定' : '未設定'}\n`;
    message += `備份金鑰：${currentKey ? '已設定' : '未設定'}\n\n`;
    
    if (!currentUrl || !currentKey) {
        message += '❌ 設定不完整，請先完成設定：\n';
        if (!currentUrl) message += '1. 設定 Google Sheet URL\n';
        if (!currentKey) message += '2. 設定備份金鑰\n';
    } else {
        message += '✅ 設定完整\n\n';
        message += '如果仍然失敗，請檢查：\n';
        message += '1. Google Script Web App 是否正確部署\n';
        message += '2. 權限設定是否正確\n';
        message += '3. 網路連線是否正常\n';
        message += '4. URL 是否正確複製\n\n';
        message += '建議：\n';
        message += '- 重新部署 Google Script Web App\n';
        message += '- 檢查執行紀錄中的錯誤訊息';
    }
    
    alert(message);
    
    if (!currentUrl) {
        setGoogleSheetUploadUrl();
    } else if (!currentKey) {
        setGoogleCloudBackupKey();
    }
}

// 關閉替代方案模態框
function closeFallbackModal() {
    const modal = document.getElementById('fallbackModal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// 刪除 Google Sheet 中的所有數據
function deleteAllDataFromGoogleSheet() {
    const uploadUrl = localStorage.getItem('googleSheetUploadUrl');
    const uploadKey = localStorage.getItem('googleCloudBackupKey');
    
    if (!uploadUrl) {
        alert('請先設定 Google Sheet 上傳 URL');
        setGoogleSheetUploadUrl();
        return;
    }
    
    if (!uploadKey) {
        alert('請先設定 Google Cloud 備份金鑰');
        setGoogleCloudBackupKey();
        return;
    }
    
    const confirmMessage = `⚠️ 警告：此操作將永久刪除 Google Sheet 中的所有備份數據！

刪除的數據包括：
• 所有記帳記錄
• 想買的東西清單
• 存錢目標
• 分類設定
• 所有備份歷史

此操作無法復原！

確認要繼續嗎？`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    const finalConfirm = prompt('請輸入 "DELETE" 以確認刪除操作：');
    if (finalConfirm !== 'DELETE') {
        alert('刪除操作已取消');
        return;
    }
    
    try {
        const clearData = {
            clearKey: 'CLEAR_ALL_DATA_2026',
            uploadKey: uploadKey,
            timestamp: new Date().toISOString(),
            dataType: 'clearAllData'
        };
        
        showClearProgress('正在清除所有資料...');
        
        fetch(uploadUrl, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(clearData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP 錯誤！狀態碼：${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            hideClearProgress();
            if (result.success) {
                showClearSuccess('所有資料已成功清除！');
                saveBackupHistory('cleared', 'Google Sheet 數據清除成功');
                if (result.deletedItems && result.deletedItems.length > 0) {
                    const details = result.deletedItems.join('\n• ');
                    alert(`清除完成！\n\n已處理項目：\n• ${details}`);
                }
            } else {
                showClearError('清除失敗：' + (result.error || '未知錯誤'));
                saveBackupHistory('error', '數據清除失敗: ' + (result.error || '未知錯誤'));
            }
        })
        .catch(error => {
            hideClearProgress();
            console.error('清除詳細錯誤：', error);
            showClearError('清除失敗：' + error.message);
            saveBackupHistory('error', '數據清除失敗: ' + error.message);
        });
        
    } catch (error) {
        hideClearProgress();
        showClearError('準備清除資料時發生錯誤：' + error.message);
    }
}

// 顯示清除進度
function showClearProgress(message) {
    const progressModal = document.createElement('div');
    progressModal.id = 'clearProgressModal';
    progressModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10008;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    progressModal.innerHTML = `
        <div style="background: white; border-radius: 16px; padding: 32px; max-width: 400px; width: 90%; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🗑️</div>
            <h3 style="margin: 0 0 16px 0; color: #dc3545;">清除中</h3>
            <p style="margin: 0; color: #666;">${message}</p>
            <div style="margin-top: 20px;">
                <div style="width: 100%; height: 4px; background: #e9ecef; border-radius: 2px; overflow: hidden;">
                    <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #dc3545, #ff6b6b); animation: loading 1.5s ease-in-out infinite;"></div>
                </div>
            </div>
        </div>
        <style>
            @keyframes loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        </style>
    `;
    
    document.body.appendChild(progressModal);
}

function hideClearProgress() {
    const progressModal = document.getElementById('clearProgressModal');
    if (progressModal) {
        document.body.removeChild(progressModal);
    }
}

function showClearSuccess(message) {
    showNotification(message, 'success');
}

function showClearError(message) {
    showNotification(message, 'error');
}

// 收集所有數據
function collectAllData() {
    return {
        records: getAllRecords(),
        wishlist: wishlistSavingsManager?.wishlistData,
        savings: wishlistSavingsManager?.savingsData,
        categories: {
            expense: JSON.parse(localStorage.getItem('expenseCategories') || '[]'),
            income: JSON.parse(localStorage.getItem('incomeCategories') || '[]')
        },
        accounts: JSON.parse(localStorage.getItem('accounts') || '[]'),
        settings: {
            theme: localStorage.getItem('theme') || 'default',
            fontSize: localStorage.getItem('fontSize') || 'medium',
            currency: localStorage.getItem('currency') || 'NT$'
        },
        installmentRules: JSON.parse(localStorage.getItem('installmentRules') || '[]'),
        frequentItems: JSON.parse(localStorage.getItem('frequentItems') || '[]'),
        backupHistory: JSON.parse(localStorage.getItem('backupHistory') || '[]')
    };
}

function getAllRecords() {
    const allRecords = [];
    const monthKeys = Object.keys(localStorage).filter(key => key.match(/^\d{4}-\d{2}$/));
    
    monthKeys.forEach(monthKey => {
        try {
            const monthData = JSON.parse(localStorage.getItem(monthKey) || '{}');
            if (monthData.records && Array.isArray(monthData.records)) {
                allRecords.push(...monthData.records.map(record => ({
                    ...record,
                    monthKey: monthKey
                })));
            }
        } catch (error) {
            console.warn('無法解析月份資料：', monthKey, error);
        }
    });
    
    return allRecords;
}

// 上傳進度
function showUploadProgress(message) {
    const progressModal = document.createElement('div');
    progressModal.id = 'uploadProgressModal';
    progressModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10005;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    progressModal.innerHTML = `
        <div style="background: white; border-radius: 16px; padding: 32px; max-width: 400px; width: 90%; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
            <h3 style="margin: 0 0 16px 0; color: #333;">上傳中</h3>
            <p style="margin: 0; color: #666;">${message}</p>
            <div style="margin-top: 20px;">
                <div style="width: 100%; height: 4px; background: #e9ecef; border-radius: 2px; overflow: hidden;">
                    <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #4facfe, #00f2fe); animation: loading 1.5s ease-in-out infinite;"></div>
                </div>
            </div>
        </div>
        <style>
            @keyframes loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        </style>
    `;
    
    document.body.appendChild(progressModal);
}

function hideUploadProgress() {
    const progressModal = document.getElementById('uploadProgressModal');
    if (progressModal) {
        document.body.removeChild(progressModal);
    }
}

function showUploadSuccess(message) {
    showNotification(message, 'success');
}

function showUploadError(message) {
    showNotification(message, 'error');
}

// 簡易通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10006;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentNode) {
            document.body.removeChild(notification);
        }
    }, 5000);
}

// 設置頁面項目
function addUploadAllDataOption() {
    const settingsSections = [
        {
            title: '🎨 個人化設定',
            items: [
                { icon: '🎨', title: '主題顏色', description: '選擇您喜歡的主題顏色', action: 'theme', accent: 'linear-gradient(135deg, #667eea, #764ba2)', iconGradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
                { icon: '📝', title: '字體大小', description: '調整介面字體大小', action: 'fontSize', accent: 'linear-gradient(135deg, #f093fb, #f5576c)', iconGradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
                { icon: '🗂️', title: '分類管理', description: '管理收支分類', action: 'categoryManage', accent: 'linear-gradient(135deg, #4facfe, #00f2fe)', iconGradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
            ]
        },
        {
            title: '💾 資料備份',
            items: [
                { icon: '☁️', title: '上傳所有資料', description: '將所有數據上傳到 Google Sheet', action: 'uploadAllData', accent: 'linear-gradient(135deg, #fa709a, #fee140)', iconGradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
                { icon: '💾', title: '本機備份', description: '下載資料到本機', action: 'backup', accent: 'linear-gradient(135deg, #30cfd0, #330867)', iconGradient: 'linear-gradient(135deg, #30cfd0, #330867)' },
                { icon: '📂', title: '本機還原', description: '從本機檔案還原資料', action: 'restore', accent: 'linear-gradient(135deg, #a8edea, #fed6e3)', iconGradient: 'linear-gradient(135deg, #a8edea, #fed6e3)' },
                { icon: '🔗', title: '設定 Google Sheet URL', description: '設定 Google Sheet 上傳位址', action: 'setGoogleSheetUploadUrl', accent: 'linear-gradient(135deg, #ffecd2, #fcb69f)', iconGradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)' },
                { icon: '🔐', title: '設定雲端備份金鑰', description: '設定 Google Cloud 備份金鑰', action: 'setGoogleCloudBackupKey', accent: 'linear-gradient(135deg, #ff9a9e, #fecfef)', iconGradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)' }
            ]
        },
        {
            title: '📊 分析工具',
            items: [
                { icon: '📈', title: '年報', description: '生成年度分析報告', action: 'annualReport', accent: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)', iconGradient: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)' },
                { icon: '📑', title: '分期', description: '管理分期與長期支出', action: 'installmentRules', accent: 'linear-gradient(135deg, #fbc2eb, #a6c1ee)', iconGradient: 'linear-gradient(135deg, #fbc2eb, #a6c1ee)' }
            ]
        },
        {
            title: '📚 說明與支援',
            items: [
                { icon: '🛍️', title: '想買的東西/存錢目標', description: '管理願望清單和儲蓄計劃', action: 'wishlistSavings', accent: 'linear-gradient(135deg, #667eea, #764ba2)', iconGradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
                { icon: '👨‍💻', title: '關於', description: '創作者與版本資訊', action: 'creator', accent: 'linear-gradient(135deg, #d299c2, #fef9d7)', iconGradient: 'linear-gradient(135deg, #d299c2, #fef9d7)' }
            ]
        }
    ];
    
    return settingsSections;
}

// 更新設置頁面事件處理
function updateSettingsEventHandlers() {
    document.querySelectorAll('.settings-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            if (action === 'uploadAllData') {
                uploadAllDataToGoogleSheet();
            } else if (action === 'backup') {
                backupData();
            } else if (action === 'restore') {
                restoreData();
            } else if (action === 'setGoogleSheetUploadUrl') {
                setGoogleSheetUploadUrl();
            } else if (action === 'setGoogleCloudBackupKey') {
                setGoogleCloudBackupKey();
            } else if (action === 'cloudBackupFull') {
                cloudBackupToGoogleSheet();
            } else if (action === 'cloudRestoreFull') {
                cloudRestoreFromGoogleSheet();
            } else if (action === 'uploadAllRecordsDetailsToGoogleSheet') {
                uploadAllRecordsDetailsToGoogleSheet();
            } else if (action === 'uploadRecordsByAccountToGoogleSheet') {
                uploadRecordsByAccountToGoogleSheet();
            } else if (action === 'uploadIncomeExpenseCategorySummaryToGoogleSheet') {
                uploadIncomeExpenseCategorySummaryToGoogleSheet();
            } else if (action === 'creator') {
                showCreatorInfo();
            } else if (action === 'theme') {
                showThemeSelector();
            } else if (action === 'fontSize') {
                showFontSizeSelector();
            } else if (action === 'annualReport') {
                showAnnualReport();
            } else if (action === 'installmentRules') {
                showInstallmentManagementPage();
            }
        });
    });
}
