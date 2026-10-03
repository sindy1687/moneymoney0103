const DEFAULT_FOLDER_ID = '1TkNPPBG0dS5izbuumFTiSivZcHEqxxOf';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const action = data.action;

    if (action === 'uploadBackup') {
      return jsonResponse(uploadBackup(data));
    }

    if (action === 'listBackups') {
      return jsonResponse(listBackups(data));
    }

    if (action === 'downloadBackup') {
      return jsonResponse(downloadBackup(data));
    }

    return jsonResponse({
      success: false,
      message: '未知的 action'
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.message
    });
  }
}

function uploadBackup(data) {
  const folderId = data.folderId || DEFAULT_FOLDER_ID;
  const folder = DriveApp.getFolderById(folderId);

  const fileName = data.fileName || `網站完整備份_${new Date().toISOString()}.json`;
  const content = data.content || '{}';
  const mimeType = data.mimeType || 'application/json';

  const file = folder.createFile(fileName, content, mimeType);

  return {
    success: true,
    message: '上傳成功',
    fileId: file.getId(),
    fileName: file.getName(),
    url: file.getUrl()
  };
}

function listBackups(data) {
  const folderId = data.folderId || DEFAULT_FOLDER_ID;
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();

  const result = [];

  while (files.hasNext()) {
    const file = files.next();

    if (file.getName().toLowerCase().endsWith('.json')) {
      result.push({
        id: file.getId(),
        name: file.getName(),
        modifiedTime: file.getLastUpdated().toISOString(),
        size: file.getSize(),
        url: file.getUrl()
      });
    }
  }

  result.sort((a, b) => {
    return new Date(b.modifiedTime) - new Date(a.modifiedTime);
  });

  return {
    success: true,
    files: result
  };
}

function downloadBackup(data) {
  if (!data.fileId) {
    throw new Error('缺少 fileId');
  }

  const file = DriveApp.getFileById(data.fileId);
  const content = file.getBlob().getDataAsString('UTF-8');

  return {
    success: true,
    fileName: file.getName(),
    content: content
  };
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
