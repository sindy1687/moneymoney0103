// ========== 存儲相關工具函數 ==========

// 壓縮圖片函數（減少 playerStorage 使用量）
// 針對大量圖示優化：更小的尺寸和更低的品質
function compressImage(dataUrl, maxWidth = 150, maxHeight = 150, quality = 0.6) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // 計算縮放比例
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth || height > maxHeight) {
                if (width > height) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                } else {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }
            
            // 創建 canvas 進行壓縮
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // 轉換為 base64，使用 JPEG 格式以獲得更好的壓縮率
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
}

// 安全地保存到 playerStorage（帶錯誤處理）
function safeSetItem(key, value) {
    try {
        const jsonString = JSON.stringify(value);
        const sizeInMB = new Blob([jsonString]).size / (1024 * 1024);
        
        // 檢查大小（playerStorage 通常限制為 5-10MB）
        // IndexedDB handles the actual device quota; do not impose localStorage's old cap.
        
        playerStorage.setItem(key, jsonString);
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.message.includes('太大')) {
            console.error('playerStorage 配額已滿:', e);
            alert('此網站的儲存空間不足，本次資料未儲存。\n請先匯出備份，再到「設定 → 🧹 儲存空間」壓縮過大的照片。\n請勿清除網站資料，以免遺失尚未備份的帳本。');
            return false;
        }
        throw e;
    }
}

// 壓縮所有圖標（用於導入時）
async function compressAllIcons(customIcons) {
    const compressedIcons = {};
    const iconNames = Object.keys(customIcons);
    
    for (let i = 0; i < iconNames.length; i++) {
        const name = iconNames[i];
        const iconData = customIcons[name];
        
        if (iconData && iconData.type === 'image' && iconData.value) {
            try {
                console.log(`壓縮圖標 ${i + 1}/${iconNames.length}: ${name}`);
                compressedIcons[name] = {
                    type: 'image',
                    value: await compressImage(iconData.value)
                };
            } catch (error) {
                console.error(`壓縮圖標 ${name} 失敗:`, error);
                // 如果壓縮失敗，保留原始圖標
                compressedIcons[name] = iconData;
            }
        } else {
            // 非圖片圖標直接保留
            compressedIcons[name] = iconData;
        }
    }
    
    return compressedIcons;
}

// 獲取存儲空間使用情況
function getStorageInfo() {
    const customIcons = JSON.parse(playerStorage.getItem('categoryCustomIcons') || '{}');
    const iconCount = Object.keys(customIcons).length;
    let totalSize = 0;
    let imageCount = 0;
    
    Object.values(customIcons).forEach(icon => {
        if (icon && icon.type === 'image' && icon.value) {
            totalSize += icon.value.length;
            imageCount++;
        }
    });
    
    const sizeInKB = totalSize / 1024;
    const sizeInMB = sizeInKB / 1024;
    
    // 計算所有 playerStorage 的使用情況
    let totalStorageSize = 0;
    for (let key in playerStorage) {
        if (playerStorage.hasOwnProperty(key)) {
            totalStorageSize += playerStorage[key].length + key.length;
        }
    }
    const totalStorageMB = totalStorageSize / (1024 * 1024);
    
    return {
        iconCount,
        imageCount,
        sizeInKB,
        sizeInMB,
        totalStorageMB,
        customIcons
    };
}

if (typeof window !== 'undefined') {
    window.compressImage = compressImage;
    window.safeSetItem = safeSetItem;
    window.compressAllIcons = compressAllIcons;
    window.getStorageInfo = getStorageInfo;
}

