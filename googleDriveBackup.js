const GOOGLE_DRIVE_BACKUP_CONFIG = {
  folderId: '1TkNPPBG0dS5izbuumFTiSivZcHEqxxOf',

  // 請把這裡換成你部署完成的 Google Apps Script Web App URL
  scriptUrl: '請貼上你的 Google Apps Script Web App URL',

  appName: '記帳本備份',
  backupVersion: '1.0'
};

// 將設定掛到 window
window.GOOGLE_DRIVE_BACKUP_CONFIG = GOOGLE_DRIVE_BACKUP_CONFIG;

// 收集全網站資料
function collectAllWebsiteDataForBackup() {
  const backupData = {
    appName: GOOGLE_DRIVE_BACKUP_CONFIG.appName,
    backupVersion: GOOGLE_DRIVE_BACKUP_CONFIG.backupVersion,
    backupDate: new Date().toISOString(),
    localStorageData: {}
  };

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    backupData.localStorageData[key] = localStorage.getItem(key);
  }

  return backupData;
}

// 從備份匯入全網站資料
function restoreAllWebsiteDataFromBackup(backupData) {
  if (!backupData || typeof backupData !== 'object') {
    throw new Error('備份資料格式錯誤');
  }

  if (!backupData.localStorageData || typeof backupData.localStorageData !== 'object') {
    throw new Error('備份檔缺少 localStorageData');
  }

  const confirmRestore = confirm(
    '確定要從雲端備份還原嗎？這會覆蓋目前手機裡的網站資料。'
  );

  if (!confirmRestore) return false;

  Object.keys(backupData.localStorageData).forEach((key) => {
    localStorage.setItem(key, backupData.localStorageData[key]);
  });

  alert('雲端還原完成，頁面即將重新整理。');
  location.reload();

  return true;
}

// 上傳到 Google Drive
async function uploadBackupToGoogleDrive() {
  try {
    const backupData = collectAllWebsiteDataForBackup();

    const userName =
      localStorage.getItem('userName') ||
      localStorage.getItem('username') ||
      localStorage.getItem('playerName') ||
      '未命名使用者';

    const today = new Date();
    const dateText = today.toISOString().slice(0, 10);
    const timeText = today
      .toTimeString()
      .slice(0, 8)
      .replaceAll(':', '-');

    const fileName = `${userName}_網站完整備份_${dateText}_${timeText}.json`;

    const response = await fetch(GOOGLE_DRIVE_BACKUP_CONFIG.scriptUrl, {
      method: 'POST',
      body: JSON.stringify({
        action: 'uploadBackup',
        folderId: GOOGLE_DRIVE_BACKUP_CONFIG.folderId,
        fileName: fileName,
        content: JSON.stringify(backupData, null, 2),
        mimeType: 'application/json'
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || '上傳失敗');
    }

    alert(`已成功上傳到 Google Drive：${fileName}`);
    return result;
  } catch (error) {
    console.error('Google Drive 備份失敗：', error);
    alert(`Google Drive 備份失敗：${error.message}`);
  }
}

// 列出 Google Drive 備份檔
async function listGoogleDriveBackupFiles() {
  try {
    const response = await fetch(GOOGLE_DRIVE_BACKUP_CONFIG.scriptUrl, {
      method: 'POST',
      body: JSON.stringify({
        action: 'listBackups',
        folderId: GOOGLE_DRIVE_BACKUP_CONFIG.folderId
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || '讀取備份清單失敗');
    }

    return result.files || [];
  } catch (error) {
    console.error('讀取 Google Drive 備份清單失敗：', error);
    alert(`讀取 Google Drive 備份清單失敗：${error.message}`);
    return [];
  }
}

// 從 Google Drive 下載並還原
async function downloadAndRestoreFromGoogleDrive(fileId) {
  try {
    if (!fileId) {
      alert('請先選擇一個雲端備份檔');
      return;
    }

    const response = await fetch(GOOGLE_DRIVE_BACKUP_CONFIG.scriptUrl, {
      method: 'POST',
      body: JSON.stringify({
        action: 'downloadBackup',
        fileId: fileId
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || '下載備份失敗');
    }

    const backupData = JSON.parse(result.content);
    restoreAllWebsiteDataFromBackup(backupData);
  } catch (error) {
    console.error('Google Drive 還原失敗：', error);
    alert(`Google Drive 還原失敗：${error.message}`);
  }
}

// 開啟雲端還原清單彈窗
async function openGoogleDriveRestorePanel() {
  const files = await listGoogleDriveBackupFiles();

  if (!files.length) {
    alert('Google Drive 裡目前沒有找到備份檔');
    return;
  }

  let panel = document.getElementById('googleDriveRestorePanel');

  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'googleDriveRestorePanel';
    panel.className = 'google-drive-restore-panel';
    document.body.appendChild(panel);
  }

  panel.innerHTML = `
    <div class="google-drive-restore-box">
      <div class="google-drive-restore-header">
        <h3>選擇雲端備份檔</h3>
        <button onclick="closeGoogleDriveRestorePanel()">×</button>
      </div>

      <div class="google-drive-file-list">
        ${files.map(file => `
          <button
            class="google-drive-file-item"
            onclick="downloadAndRestoreFromGoogleDrive('${file.id}')"
          >
            <strong>${escapeHtml(file.name)}</strong>
            <span>${escapeHtml(file.modifiedTime || '')}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  panel.style.display = 'flex';
}

// 關閉雲端還原清單彈窗
function closeGoogleDriveRestorePanel() {
  const panel = document.getElementById('googleDriveRestorePanel');
  if (panel) {
    panel.style.display = 'none';
  }
}

// HTML 轉義
function escapeHtml(text) {
  return String(text || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// 將函數掛到 window，讓 HTML onclick 可以呼叫
window.uploadBackupToGoogleDrive = uploadBackupToGoogleDrive;
window.openGoogleDriveRestorePanel = openGoogleDriveRestorePanel;
window.listGoogleDriveBackupFiles = listGoogleDriveBackupFiles;
window.downloadAndRestoreFromGoogleDrive = downloadAndRestoreFromGoogleDrive;
window.closeGoogleDriveRestorePanel = closeGoogleDriveRestorePanel;

// 更新 Google Drive 備份狀態
function updateGoogleDriveBackupStatus() {
  const statusEl = document.getElementById('googleDriveBackupStatus');
  if (!statusEl) return;

  const config = window.GOOGLE_DRIVE_BACKUP_CONFIG || {};
  const scriptUrl = config.scriptUrl || '';

  if (!scriptUrl || scriptUrl.includes('請貼上')) {
    statusEl.textContent = '尚未設定 Google Apps Script 連結，請先完成雲端備份設定。';
    statusEl.style.color = '#dc2626';
  } else {
    statusEl.textContent = 'Google Drive 雲端備份功能已啟用';
    statusEl.style.color = '#2563eb';
  }
}

// 頁面載入時更新狀態
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateGoogleDriveBackupStatus);
} else {
  updateGoogleDriveBackupStatus();
}

// 綁定 Google Drive 備份按鈕
function bindGoogleDriveBackupButtons() {
  const uploadBtn = document.getElementById('uploadGoogleDriveBtn');
  const restoreBtn = document.getElementById('restoreGoogleDriveBtn');

  if (uploadBtn) {
    uploadBtn.replaceWith(uploadBtn.cloneNode(true));
  }

  if (restoreBtn) {
    restoreBtn.replaceWith(restoreBtn.cloneNode(true));
  }

  const newUploadBtn = document.getElementById('uploadGoogleDriveBtn');
  const newRestoreBtn = document.getElementById('restoreGoogleDriveBtn');

  if (newUploadBtn) {
    newUploadBtn.addEventListener('click', function () {
      if (typeof window.uploadBackupToGoogleDrive === 'function') {
        window.uploadBackupToGoogleDrive();
        return;
      }

      alert('找不到 Google Drive 上傳功能，請確認 googleDriveBackup.js 是否已載入。');
      console.error('uploadBackupToGoogleDrive is not defined');
    });
  }

  if (newRestoreBtn) {
    newRestoreBtn.addEventListener('click', function () {
      if (typeof window.openGoogleDriveRestorePanel === 'function') {
        window.openGoogleDriveRestorePanel();
        return;
      }

      alert('找不到 Google Drive 還原功能，請確認 googleDriveBackup.js 是否已載入。');
      console.error('openGoogleDriveRestorePanel is not defined');
    });
  }
}

// 強制確保 Google Drive 備份入口在設定頁中
function ensureGoogleDriveBackupEntryInSettings() {
  const existingSection = document.getElementById('googleDriveBackupSection');

  if (existingSection) {
    existingSection.style.display = 'block';
    existingSection.style.visibility = 'visible';
    existingSection.style.opacity = '1';
    bindGoogleDriveBackupButtons();
    updateGoogleDriveBackupStatus();
    return;
  }

  const settingsContainer =
    document.getElementById('settingsPage') ||
    document.getElementById('settingPage') ||
    document.getElementById('settingsSection') ||
    document.getElementById('settingSection') ||
    document.getElementById('settingsView') ||
    document.getElementById('settingView') ||
    document.getElementById('settingsPanel') ||
    document.getElementById('settingPanel') ||
    document.getElementById('settingsContent') ||
    document.getElementById('settingsContainer') ||
    document.querySelector('.settings-page') ||
    document.querySelector('.setting-page') ||
    document.querySelector('.settings-view') ||
    document.querySelector('.setting-view') ||
    document.querySelector('.settings-panel') ||
    document.querySelector('.setting-panel') ||
    document.querySelector('.settings-content') ||
    document.querySelector('.settings-container');

  if (!settingsContainer) {
    console.warn('找不到設定頁容器，Google Drive 雲端備份入口尚未插入');
    return;
  }

  const section = document.createElement('section');
  section.id = 'googleDriveBackupSection';
  section.className = 'settings-section drive-backup-settings';

  section.innerHTML = `
    <h2>☁️ 雲端資料備份</h2>

    <p class="settings-section-desc">
      可以把目前這個網站的所有資料上傳到 Google Drive，也可以從雲端硬碟下載備份並還原。
    </p>

    <div class="settings-drive-actions">
      <button type="button" class="settings-drive-btn upload-drive-btn" id="uploadGoogleDriveBtn">
        <span class="settings-drive-icon">☁️</span>
        <span class="settings-drive-text">
          <strong>上傳到雲端硬碟</strong>
          <small>把目前手機 / 電腦的網站資料完整備份到 Google Drive</small>
        </span>
      </button>

      <button type="button" class="settings-drive-btn restore-drive-btn" id="restoreGoogleDriveBtn">
        <span class="settings-drive-icon">📥</span>
        <span class="settings-drive-text">
          <strong>從雲端硬碟還原</strong>
          <small>讀取 Google Drive 備份檔，匯入這個網站的所有資料</small>
        </span>
      </button>
    </div>

    <p id="googleDriveBackupStatus" class="google-drive-backup-status">
      Google Drive 雲端備份功能檢查中
    </p>
  `;

  settingsContainer.appendChild(section);

  bindGoogleDriveBackupButtons();
  updateGoogleDriveBackupStatus();

  console.log('Google Drive 雲端備份入口已插入設定頁');
}

// 將函數掛到 window
window.ensureGoogleDriveBackupEntryInSettings = ensureGoogleDriveBackupEntryInSettings;
window.bindGoogleDriveBackupButtons = bindGoogleDriveBackupButtons;
window.updateGoogleDriveBackupStatus = updateGoogleDriveBackupStatus;

// DOMContentLoaded 時執行
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(() => {
    ensureGoogleDriveBackupEntryInSettings();
  }, 300);

  setTimeout(() => {
    ensureGoogleDriveBackupEntryInSettings();
  }, 1000);
});
