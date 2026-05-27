// ========== 年度報告功能 ==========

// 顯示年度報告
function showAnnualReport() {
    const currentYear = new Date().getFullYear();
    // 獲取記帳記錄
    const accountingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    // 獲取投資記錄
    const investmentRecords = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    // 過濾當年的記錄
    const yearRecords = accountingRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === currentYear;
    });
    const yearInvestmentRecords = investmentRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === currentYear;
    });
    // 計算年支出排行
    const expenseRecords = yearRecords.filter(r => r.type === 'expense' || !r.type);
    const categoryExpenses = {};
    expenseRecords.forEach(record => {
        const category = record.category || '未分類';
        if (!categoryExpenses[category]) {
            categoryExpenses[category] = 0;
        }
        categoryExpenses[category] += record.amount || 0;
    });
    const expenseRanking = Object.entries(categoryExpenses)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);
    // 計算年投資總投入
    const buyRecords = yearInvestmentRecords.filter(r => r.type === 'buy');
    const totalInvestment = buyRecords.reduce((sum, record) => {
        const price = record.price || 0;
        const shares = record.shares || 0;
        const fee = record.fee || 0;
        return sum + (price * shares + fee);
    }, 0);
    // 計算年股息總額
    const dividendRecords = yearInvestmentRecords.filter(r => r.type === 'dividend');
    const totalDividend = dividendRecords.reduce((sum, record) => {
        return sum + (record.amount || 0);
    }, 0);
    // 找出最燒錢分類
    const topExpenseCategory = expenseRanking.length > 0 ? expenseRanking[0] : null;
    // 計算總支出
    const totalExpense = expenseRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
    // 創建模態框
    const modal = document.createElement('div');
    modal.className = 'annual-report-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10006; display: flex; align-items: center; justify-content: center; padding: 20px; overflow-y: auto;';
    let expenseRankingHtml = '';
    if (expenseRanking.length === 0) {
        expenseRankingHtml = '<div class="annual-report-empty" style="text-align: center; padding: 20px; color: #999;">尚無支出記錄</div>';
    } else {
        expenseRanking.forEach((item, index) => {
            const percentage = ((item.amount / totalExpense) * 100).toFixed(1);
            expenseRankingHtml += `
                <div class="annual-report-rank-row" style="display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #f0f0f0;">
                    <div class="annual-report-rank-index" style="width: 30px; text-align: center; font-weight: 600; color: #666;">${index + 1}</div>
                    <div class="annual-report-rank-category" style="flex: 1; font-size: 15px; color: #333;">${item.category}</div>
                    <div class="annual-report-rank-amount" style="font-size: 15px; font-weight: 600; color: #f44336;">NT$${item.amount.toLocaleString('zh-TW')}</div>
                    <div class="annual-report-rank-percent" style="width: 60px; text-align: right; font-size: 13px; color: #999; margin-left: 12px;">${percentage}%</div>
                </div>
            `;
        });
    }
    modal.innerHTML = `
        <div class="annual-report-content" style="background: white; border-radius: 20px; padding: 24px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
            <div class="annual-report-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; position: sticky; top: 0; background: white; z-index: 10; padding-bottom: 12px; border-bottom: 2px solid #f0f0f0;">
                <h2 class="annual-report-title" style="margin: 0; font-size: 24px; font-weight: 600; color: #333;">📊 ${currentYear} 年度報告</h2>
                <button class="annual-report-close-btn" style="background: none; border: none; font-size: 24px; color: #999; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;">✕</button>
            </div>
            <div class="annual-report-body" style="display: flex; flex-direction: column; gap: 24px;">
                <!-- 總支出 -->
                <div class="annual-report-total" style="background: linear-gradient(135deg, #ffeef5 0%, #fff5f9 100%); padding: 20px; border-radius: 16px; border: 2px solid #ffb6d9;">
                    <div class="annual-report-total-label" style="font-size: 14px; color: #666; margin-bottom: 8px;">年度總支出</div>
                    <div class="annual-report-total-value" style="font-size: 32px; font-weight: 700; color: #ff69b4;">NT$${totalExpense.toLocaleString('zh-TW')}</div>
                </div>
                <!-- 年支出排行 -->
                <div class="annual-report-ranking" style="background: #f8f8f8; padding: 20px; border-radius: 16px;">
                    <h3 class="annual-report-section-title" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #333;">📈 年支出排行（Top 10）</h3>
                    <div class="annual-report-ranking-list" style="background: white; border-radius: 12px; overflow: hidden;">
                        ${expenseRankingHtml}
                    </div>
                </div>
                <!-- 投資相關 -->
                <div class="annual-report-investment-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="annual-report-card annual-report-investment" style="background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%); padding: 20px; border-radius: 16px; border: 2px solid #c8e6c9;">
                        <div class="annual-report-card-label" style="font-size: 14px; color: #666; margin-bottom: 8px;">年投資總投入</div>
                        <div class="annual-report-card-value" style="font-size: 24px; font-weight: 700; color: #4caf50;">NT$${totalInvestment.toLocaleString('zh-TW')}</div>
                    </div>
                    <div class="annual-report-card annual-report-dividend" style="background: linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%); padding: 20px; border-radius: 16px; border: 2px solid #ffe0b2;">
                        <div class="annual-report-card-label" style="font-size: 14px; color: #666; margin-bottom: 8px;">年股息總額</div>
                        <div class="annual-report-card-value" style="font-size: 24px; font-weight: 700; color: #ff9800;">NT$${totalDividend.toLocaleString('zh-TW')}</div>
                    </div>
                </div>
                <!-- 最燒錢分類 -->
                ${topExpenseCategory ? `
                    <div class="annual-report-top-category" style="background: linear-gradient(135deg, #ffebee 0%, #fce4ec 100%); padding: 20px; border-radius: 16px; border: 2px solid #ffcdd2; text-align: center;">
                        <div class="annual-report-top-label" style="font-size: 16px; color: #666; margin-bottom: 12px;">😅 最燒錢分類</div>
                        <div class="annual-report-top-name" style="font-size: 28px; font-weight: 700; color: #f44336; margin-bottom: 8px;">${topExpenseCategory.category}</div>
                        <div class="annual-report-top-amount" style="font-size: 20px; color: #666;">NT$${topExpenseCategory.amount.toLocaleString('zh-TW')}</div>
                        <div class="annual-report-top-percent" style="font-size: 14px; color: #999; margin-top: 8px;">佔總支出 ${((topExpenseCategory.amount / totalExpense) * 100).toFixed(1)}%</div>
                    </div>
                ` : ''}
            </div>
            <div class="annual-report-footer" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f0f0f0; text-align: center;">
                <button id="exportAnnualReportBtn" style="padding: 12px 24px; background: #ff69b4; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;">📄 匯出報告</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    // 綁定關閉按鈕
    const closeBtn = modal.querySelector('.annual-report-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (document.body.contains(modal)) document.body.removeChild(modal);
        });
    }
    // 點擊背景關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            if (document.body.contains(modal)) document.body.removeChild(modal);
        }
    });
    // 匯出報告
    const exportBtn = modal.querySelector('#exportAnnualReportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportAnnualReport(currentYear, { totalExpense, expenseRanking, totalInvestment, totalDividend, topExpenseCategory });
        });
    }
}

// 匯出年度報告
function exportAnnualReport(year, data) {
    let reportText = `📊 ${year} 年度報告\n`;
    reportText += `生成時間：${new Date().toLocaleString('zh-TW')}\n\n`;
    reportText += `═══════════════════════════════════\n\n`;
    reportText += `💰 年度總支出：NT$${data.totalExpense.toLocaleString('zh-TW')}\n\n`;
    reportText += `📈 年支出排行（Top 10）：\n`;
    data.expenseRanking.forEach((item, index) => {
        const percentage = ((item.amount / data.totalExpense) * 100).toFixed(1);
        reportText += `${index + 1}. ${item.category}：NT$${item.amount.toLocaleString('zh-TW')} (${percentage}%)\n`;
    });
    reportText += `\n`;
    reportText += `📊 年投資總投入：NT$${data.totalInvestment.toLocaleString('zh-TW')}\n`;
    reportText += `💵 年股息總額：NT$${data.totalDividend.toLocaleString('zh-TW')}\n\n`;
    if (data.topExpenseCategory) {
        const percentage = ((data.topExpenseCategory.amount / data.totalExpense) * 100).toFixed(1);
        reportText += `😅 最燒錢分類：${data.topExpenseCategory.category}\n`;
        reportText += `   金額：NT$${data.topExpenseCategory.amount.toLocaleString('zh-TW')}\n`;
        reportText += `   佔總支出：${percentage}%\n`;
    }
    reportText += `\n═══════════════════════════════════\n`;
    reportText += `由記帳本 App 自動生成`;
    // 創建下載連結
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${year}年度報告.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('年度報告已匯出！');
}

// 備份資料（包含所有資料）
function backupData() {
    try {
        // 收集所有 localStorage 中的資料
        const data = {
            // 記帳相關
            accountingRecords: JSON.parse(localStorage.getItem('accountingRecords') || '[]'),
            categoryBudgets: JSON.parse(localStorage.getItem('categoryBudgets') || '{}'),
            categoryEnabledState: JSON.parse(localStorage.getItem('categoryEnabledState') || '{}'),
            dailyBudgetTracking: JSON.parse(localStorage.getItem('dailyBudgetTracking') || '{}'),
            customCategories: JSON.parse(localStorage.getItem('customCategories') || '[]'),
            categoryCustomIcons: JSON.parse(localStorage.getItem('categoryCustomIcons') || '{}'),
            // 投資相關
            investmentRecords: JSON.parse(localStorage.getItem('investmentRecords') || '[]'),
            dcaPlans: JSON.parse(localStorage.getItem('dcaPlans') || '[]'),
            stockCurrentPrices: JSON.parse(localStorage.getItem('stockCurrentPrices') || '{}'),
            installmentRules: JSON.parse(localStorage.getItem('installmentRules') || '[]'),
            // 帳戶相關
            accounts: JSON.parse(localStorage.getItem('accounts') || '[]'),
            // 表情和圖標
            imageEmojis: JSON.parse(localStorage.getItem('imageEmojis') || '[]'),
            // 成員
            members: JSON.parse(localStorage.getItem('members') || '[]'),
            // 設定
            theme: localStorage.getItem('theme') || 'default',
            fontSize: localStorage.getItem('fontSize') || 'medium',
            customTheme: JSON.parse(localStorage.getItem('customTheme') || '{}'),
            // 備份資訊
            backupDate: new Date().toISOString(),
            backupVersion: '1.0',
            appName: '記帳本'
        };
        const dataStr = JSON.stringify(data, null, 2);
        const sizeInMB = new Blob([dataStr]).size / (1024 * 1024);
        const stats = {
            accountingRecords: data.accountingRecords.length,
            investmentRecords: data.investmentRecords.length,
            accounts: data.accounts.length,
            categories: data.customCategories.length,
            budgets: Object.keys(data.categoryBudgets).length,
            dcaPlans: data.dcaPlans.length,
            installmentRules: data.installmentRules.length
        };
        const statsMessage = `資料統計：\n• 記帳記錄：${stats.accountingRecords} 筆\n• 投資記錄：${stats.investmentRecords} 筆\n• 帳戶：${stats.accounts} 個\n• 自定義分類：${stats.categories} 個\n• 預算設定：${stats.budgets} 個\n• 定期定額：${stats.dcaPlans} 個\n• 分期規則：${stats.installmentRules} 個\n• 檔案大小：${sizeInMB.toFixed(2)} MB`;
        if (!confirm(`${statsMessage}\n\n確定要下載備份檔案嗎？`)) {
            return;
        }
        if (typeof downloadJsonFileCompat === 'function' && typeof isMobileUploadEnvironment === 'function' && isMobileUploadEnvironment()) {
            const now = new Date();
            const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
            downloadJsonFileCompat(data, `backup_${dateStr}.json`);
            alert(`備份檔案已產生。\n\n${statsMessage}`);
            return;
        }
        const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        a.download = `記帳本完整備份_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert(`資料備份成功！\n\n${statsMessage}\n\n檔案已下載到您的下載資料夾。\n\n您可以在其他設備上使用「還原資料」功能來匯入此備份檔案。`);
    } catch (error) {
        console.error('備份失敗:', error);
        alert('備份失敗，請稍後再試。\n\n錯誤訊息：' + error.message);
    }
}

// 注意：compressAllIcons 和 getStorageInfo 函數已移至 js/storage.js 模組


// 還原資料
function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) {
            input.remove();
            return;
        }
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (!confirm('確定要還原資料嗎？\n這將覆蓋現有的所有資料！')) {
                    return;
                }
                await applyBackupDataPayload(data);
            } catch (error) {
                console.error('還原失敗:', error);
                alert('還原失敗，請確認檔案格式正確。');
            }
        };
        reader.readAsText(file);
        setTimeout(() => input.remove(), 1000);
    });
    openFilePickerCompat(input);
}

// 匯入投資記錄（CSV 格式）
function importInvestmentData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.txt';
    input.style.display = 'none';
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const csvText = event.target.result;
                const lines = csvText.split('\n').filter(line => line.trim());
                if (lines.length < 2) {
                    alert('檔案格式錯誤：檔案至少需要包含標題行和一行資料。');
                    return;
                }
                // 查找投資記錄區塊
                let startIndex = 0;
                let isInvestmentSection = false;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes('投資記錄') || lines[i].includes('日期,類型,股票')) {
                        startIndex = i + 1;
                        isInvestmentSection = true;
                        break;
                    }
                }
                if (!isInvestmentSection) {
                    const firstLine = lines[0].toLowerCase();
                    if (firstLine.includes('股票') || firstLine.includes('stock')) {
                        startIndex = 1;
                        isInvestmentSection = true;
                    } else {
                        alert('檔案格式錯誤：請確認檔案包含投資記錄資料。\n\n支援格式：CSV 檔案，需包含「日期」、「類型」、「股票代碼」等欄位。');
                        return;
                    }
                }
                // 解析 CSV 標題行
                const headerLine = isInvestmentSection ? lines[startIndex - 1] : lines[0];
                const headers = headerLine.split(',').map(h => h.trim());
                // 檢查必要的欄位
                const hasStockCode = headers.some(h => h.includes('股票代碼') || h.includes('stockCode') || h.toLowerCase().includes('code'));
                const hasDate = headers.some(h => h.includes('日期') || h.includes('date'));
                const hasType = headers.some(h => h.includes('類型') || h.includes('type'));
                if (!hasStockCode || !hasDate || !hasType) {
                    alert('檔案格式錯誤：缺少必要欄位。\n\n請確認檔案包含：日期、類型、股票代碼等欄位。');
                    return;
                }
                // 確認匯入
                const dataLines = lines.slice(startIndex);
                if (!confirm(`即將匯入 ${dataLines.length} 筆投資記錄。\n\n這將新增記錄到現有資料中，不會覆蓋現有資料。\n\n確定要繼續嗎？`)) {
                    return;
                }
                // 獲取現有記錄
                let existingRecords = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
                let importedCount = 0;
                let skippedCount = 0;
                // 解析每一行資料
                for (let i = 0; i < dataLines.length; i++) {
                    const line = dataLines[i].trim();
                    if (!line) continue;
                    const values = line.split(',').map(v => v.trim());
                    if (values.length < headers.length) continue;
                    // 建立記錄物件
                    const record = {};
                    let typeValue = '';
                    headers.forEach((header, index) => {
                        const value = values[index] || '';
                        const headerLower = header.toLowerCase();
                        if (headerLower.includes('日期') || headerLower.includes('date')) {
                            record.date = value;
                        } else if (headerLower.includes('類型') || headerLower.includes('type')) {
                            typeValue = value;
                            if (value.includes('買入') || value.toLowerCase() === 'buy') {
                                record.type = 'buy';
                            } else if (value.includes('賣出') || value.toLowerCase() === 'sell') {
                                record.type = 'sell';
                            } else if (value.includes('股息') || value.toLowerCase() === 'dividend') {
                                record.type = 'dividend';
                            }
                        } else if (headerLower.includes('股票代碼') || headerLower.includes('stockcode') || (headerLower.includes('stock') && headerLower.includes('code'))) {
                            record.stockCode = value;
                        } else if (headerLower.includes('股票名稱') || headerLower.includes('stockname') || (headerLower.includes('stock') && headerLower.includes('name'))) {
                            record.stockName = value;
                        } else if (headerLower.includes('價格') || headerLower.includes('price')) {
                            record.price = parseFloat(value) || 0;
                        } else if (headerLower.includes('股數') || headerLower.includes('shares') || headerLower.includes('數量')) {
                            record.shares = parseInt(value) || 0;
                        } else if (headerLower.includes('手續費') || headerLower.includes('fee')) {
                            record.fee = parseFloat(value) || 0;
                        } else if (headerLower.includes('證交稅') || headerLower.includes('tax')) {
                            record.tax = parseFloat(value) || 0;
                        } else if (headerLower.includes('備註') || headerLower.includes('note') || headerLower.includes('說明')) {
                            record.note = value;
                        } else if (headerLower.includes('每股') || headerLower.includes('pershare')) {
                            record.perShare = parseFloat(value) || 0;
                        } else if (headerLower.includes('實收') || headerLower.includes('amount')) {
                            record.amount = parseFloat(value) || 0;
                        } else if (headerLower.includes('股利類型') || headerLower.includes('dividendtype')) {
                            if (value.includes('現金') || value.includes('cash')) {
                                record.dividendType = 'cash';
                            } else if (value.includes('股票') || value.includes('stock')) {
                                record.dividendType = 'stock';
                            }
                        } else if (headerLower.includes('再投入') || headerLower.includes('reinvest')) {
                            record.reinvest = value === 'true' || value === '是' || value === '1' || value.toLowerCase() === 'yes';
                        }
                    });
                    // 驗證必要欄位
                    if (!record.date || !record.type || !record.stockCode) {
                        skippedCount++;
                        continue;
                    }
                    if (record.type === 'buy' || record.type === 'sell') {
                        if (!record.price || !record.shares) {
                            skippedCount++;
                            continue;
                        }
                    } else if (record.type === 'dividend') {
                        if (!record.perShare || !record.shares || !record.amount) {
                            skippedCount++;
                            continue;
                        }
                        if (!record.dividendType) {
                            record.dividendType = 'cash'; // 預設為現金股利
                        }
                    } else {
                        skippedCount++;
                        continue;
                    }
                    // 設定預設值
                    if (!record.stockName && typeof findStockName === 'function') {
                        record.stockName = findStockName(record.stockCode) || record.stockCode;
                    } else if (!record.stockName) {
                        record.stockName = record.stockCode;
                    }
                    record.timestamp = new Date().toISOString();
                    // 添加到現有記錄
                    existingRecords.push(record);
                    importedCount++;
                }
                // 保存記錄
                localStorage.setItem('investmentRecords', JSON.stringify(existingRecords));
                // 顯示結果
                let message = `匯入完成！\n\n成功匯入：${importedCount} 筆記錄`;
                if (skippedCount > 0) {
                    message += `\n跳過：${skippedCount} 筆（格式不正確）`;
                }
                message += '\n\n頁面將自動更新以顯示最新資料。';
                alert(message);
                // 更新投資總覽
                if (typeof updateInvestmentOverview === 'function') updateInvestmentOverview();
                if (typeof updateInvestmentRecords === 'function') updateInvestmentRecords();
                if (typeof updatePortfolioList === 'function') updatePortfolioList();
            } catch (error) {
                console.error('匯入失敗:', error);
                alert('匯入失敗，請確認檔案格式正確。\n\n支援格式：CSV 檔案，需包含「日期」、「類型」、「股票代碼」等欄位。');
            }
        };
        reader.readAsText(file, 'UTF-8');
    });
    openFilePickerCompat(input);
}

// 匯出資料
function exportData() {
    try {
        const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
        const investmentRecords = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
        if (records.length === 0 && investmentRecords.length === 0) {
            alert('目前沒有資料可以匯出。');
            return;
        }
        // 轉換記帳記錄為 CSV 格式
        let csvContent = '日期,類型,分類,金額,備註,帳戶,表情\n';
        records.forEach(record => {
            const date = record.date || '';
            const type = record.type === 'income' ? '收入' : record.type === 'expense' ? '支出' : record.type === 'transfer' ? '轉帳' : '支出';
            const category = record.category || '';
            const amount = record.amount || 0;
            const note = (record.note || '').replace(/,/g, '，');
            const account = record.account || '';
            const emoji = record.emoji || '';
            csvContent += `${date},${type},${category},${amount},${note},${account},${emoji}\n`;
        });
        // 如果有投資記錄，也加入
        if (investmentRecords.length > 0) {
            csvContent += '\n\n投資記錄\n';
            csvContent += '日期,類型,股票代碼,股票名稱,價格,股數,手續費,備註\n';
            investmentRecords.forEach(record => {
                const date = record.date || '';
                const type = record.type === 'buy' ? '買入' : record.type === 'sell' ? '賣出' : record.type === 'dividend' ? '股息' : '';
                const stockCode = record.stockCode || '';
                const stockName = (record.stockName || '').replace(/,/g, '，');
                const price = record.price || 0;
                const shares = record.shares || 0;
                const fee = record.fee || 0;
                const note = (record.note || '').replace(/,/g, '，');
                csvContent += `${date},${type},${stockCode},${stockName},${price},${shares},${fee},${note}\n`;
            });
        }
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // 添加 BOM 以支持中文
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const now = new Date();
        a.download = `記帳本匯出_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('資料匯出成功！\nCSV 檔案已下載到您的下載資料夾。\n您可以使用 Excel 或其他試算表軟體開啟。');
    } catch (error) {
        console.error('匯出失敗:', error);
        alert('匯出失敗，請稍後再試。');
    }
}

// 匯入檔案（CSV 格式）
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.txt';
    input.style.display = 'none';
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const csvText = event.target.result;
                const lines = csvText.split('\n').filter(line => line.trim());
                if (lines.length < 2) {
                    alert('檔案格式錯誤：檔案至少需要包含標題行和一行資料。');
                    return;
                }
                // 解析 CSV 標題行
                const headers = lines[0].split(',').map(h => h.trim());
                // 檢查必要的欄位
                const requiredFields = ['日期', '分類', '金額'];
                const missingFields = requiredFields.filter(field => !headers.includes(field));
                if (missingFields.length > 0) {
                    alert(`檔案格式錯誤：缺少必要欄位：${missingFields.join(', ')}\n\n請確認檔案包含：日期、分類、金額等欄位。`);
                    return;
                }
                // 確認匯入
                if (!confirm(`即將匯入 ${lines.length - 1} 筆記錄。\n\n這將新增記錄到現有資料中，不會覆蓋現有資料。\n\n確定要繼續嗎？`)) {
                    return;
                }
                // 獲取現有記錄
                let existingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
                let importedCount = 0;
                let skippedCount = 0;
                // 解析每一行資料
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.trim());
                    if (values.length < headers.length) continue;
                    // 建立記錄物件
                    const record = {};
                    headers.forEach((header, index) => {
                        const value = values[index] || '';
                        if (header === '日期') {
                            record.date = value;
                        } else if (header === '分類') {
                            record.category = value;
                        } else if (header === '金額') {
                            record.amount = parseFloat(value) || 0;
                        } else if (header === '類型' || header === '收支類型') {
                            record.type = value === '收入' ? 'income' : (value === '支出' ? 'expense' : 'expense');
                        } else if (header === '備註' || header === '說明') {
                            record.note = value;
                        } else if (header === '帳戶') {
                            // 嘗試找到對應的帳戶 ID
                            const accounts = typeof getAccounts === 'function' ? getAccounts() : [];
                            const account = accounts.find(a => a.name === value);
                            if (account) record.account = account.id;
                        }
                    });
                    // 驗證必要欄位
                    if (!record.date || !record.category || !record.amount || record.amount <= 0) {
                        skippedCount++;
                        continue;
                    }
                    // 設定預設值
                    if (!record.type) record.type = 'expense';
                    record.timestamp = new Date().toISOString();
                    // 添加到現有記錄
                    existingRecords.push(record);
                    importedCount++;
                }
                // 保存記錄
                localStorage.setItem('accountingRecords', JSON.stringify(existingRecords));
                // 顯示結果
                let message = `匯入完成！\n\n成功匯入：${importedCount} 筆記錄`;
                if (skippedCount > 0) {
                    message += `\n跳過：${skippedCount} 筆（格式不正確）`;
                }
                message += '\n\n頁面將重新載入以顯示最新資料。';
                alert(message);
                // 重新載入頁面
                location.reload();
            } catch (error) {
                console.error('匯入失敗:', error);
                alert('匯入失敗，請確認檔案格式正確。\n\n支援格式：CSV 檔案，需包含「日期」、「分類」、「金額」欄位。');
            }
        };
        reader.readAsText(file, 'UTF-8');
    });
    openFilePickerCompat(input);
}

// 顯示關於頁面資訊
function showCreatorInfo() {
    const modal = document.createElement('div');
    modal.className = 'creator-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10004; display: flex; align-items: center; justify-content: center; overflow-y: auto;';
    modal.innerHTML = `
        <div class="creator-content" style="background: white; border-radius: 20px; padding: 32px; max-width: 400px; width: 90%; max-height: 90vh; overflow-y: auto; margin: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); -webkit-overflow-scrolling: touch;">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 16px; position: sticky; top: 0; background: white; z-index: 10; padding-bottom: 8px;">
                <button class="creator-close-btn" style="background: none; border: none; font-size: 24px; color: #999; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;">✕</button>
            </div>
            <div style="font-size: 64px; margin-bottom: 20px;">💰</div>
            <h2 style="font-size: 24px; font-weight: 600; color: #333; margin: 0 0 8px 0;">記帳 App</h2>
            <p style="font-size: 14px; color: #999; margin: 0 0 24px 0;">版本 1.0.7</p>
            <div style="text-align: left; margin-bottom: 24px; padding: 20px; background: linear-gradient(135deg, #fff5f9 0%, #ffeef5 100%); border-radius: 12px;">
                <h3 style="font-size: 16px; font-weight: 600; color: #ff69b4; margin: 0 0 12px 0;">關於這個 App</h3>
                <p style="font-size: 14px; color: #666; line-height: 1.8; margin: 0 0 12px 0;">
                    這是一個專為個人財務管理設計的記帳應用程式，幫助您輕鬆追蹤收入與支出。
                </p>
                <p style="font-size: 14px; color: #666; line-height: 1.8; margin: 0;">
                    透過直覺的介面與豐富的報表功能，讓財務管理變得更簡單。
                </p>
            </div>
            <div style="text-align: left; margin-bottom: 24px;">
                <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0 0 12px 0;">主要功能</h3>
                <div style="font-size: 14px; color: #666; line-height: 2;">
                    <div>📝 收支記帳與分類管理</div>
                    <div>📊 月度與年度報表</div>
                    <div>💼 投資組合追蹤</div>
                    <div>☁️ 雲端備份與還原</div>
                    <div>🎨 多種主題切換</div>
                    <div>🔔 智慧提醒功能</div>
                </div>
            </div>
            <div style="padding-top: 20px; border-top: 1px solid #f0f0f0;">
                <p style="font-size: 12px; color: #999; margin: 0;">Made with ❤️ for better financial management</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    // 綁定關閉按鈕
    const closeBtn = modal.querySelector('.creator-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (document.body.contains(modal)) document.body.removeChild(modal);
        });
        closeBtn.addEventListener('mouseenter', () => { closeBtn.style.background = '#f5f5f5'; });
        closeBtn.addEventListener('mouseleave', () => { closeBtn.style.background = 'none'; });
    }
    // 點擊遮罩關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal && document.body.contains(modal)) document.body.removeChild(modal);
    });
}

// 應用字體大小
function applyFontSize(fontSize) {
    const root = document.documentElement;
    // 設置基礎字體大小變數
    root.style.setProperty('--base-font-size', `${fontSize}px`);
    root.style.setProperty('--font-base', `${fontSize}px`);
    // 根據基礎字體大小計算其他字體大小
    root.style.setProperty('--font-xs', `${Math.round(fontSize * 0.6875)}px`); // 11/16
    root.style.setProperty('--font-sm', `${Math.round(fontSize * 0.75)}px`); // 12/16
    root.style.setProperty('--font-md', `${Math.round(fontSize * 0.875)}px`); // 14/16
    root.style.setProperty('--font-lg', `${Math.round(fontSize * 1.125)}px`); // 18/16
    root.style.setProperty('--font-xl', `${Math.round(fontSize * 1.25)}px`); // 20/16
    root.style.setProperty('--font-xxl', `${Math.round(fontSize * 1.5)}px`); // 24/16
    root.style.setProperty('--font-xxxl', `${Math.round(fontSize * 2)}px`); // 32/16
    document.body.style.fontSize = `${fontSize}px`;
    localStorage.setItem('fontSize', fontSize.toString());
}

// 獲取當前字體大小
function getCurrentFontSize() {
    const saved = localStorage.getItem('fontSize');
    return saved ? parseInt(saved) : 16; // 預設 16px
}

// 初始化字體大小
function initFontSize() {
    const fontSize = getCurrentFontSize();
    applyFontSize(fontSize);
}

// 顯示字體大小選擇器
function showFontSizeSelector() {
    const modal = document.createElement('div');
    modal.className = 'font-size-select-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10005; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;';
    const currentFontSize = getCurrentFontSize();
    modal.innerHTML = `
        <div class="font-size-content" style="background: white; border-radius: 20px; padding: 24px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 style="font-size: 24px; font-weight: 600; color: var(--text-primary); margin: 0;">🔤 字體大小</h2>
                <button class="font-size-close-btn" style="background: none; border: none; font-size: 24px; color: var(--text-tertiary); cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm); transition: all var(--transition-fast);">✕</button>
            </div>
            <div style="margin-bottom: 24px;">
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--text-primary);">調整字體大小</div>
                <div style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 14px; color: #666;">小</span>
                        <span id="fontSizeValue" style="font-size: 18px; font-weight: 600; color: var(--color-primary);">${currentFontSize}px</span>
                        <span style="font-size: 14px; color: #666;">大</span>
                    </div>
                    <input type="range" id="fontSizeSlider" min="12" max="24" step="1" value="${currentFontSize}" 
                           style="width: 100%; height: 8px; border-radius: 4px; background: #e0e0e0; outline: none; -webkit-appearance: none;">
                    <style>
                        #fontSizeSlider::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            appearance: none;
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            background: var(--color-primary, #ff69b4);
                            cursor: pointer;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        }
                        #fontSizeSlider::-moz-range-thumb {
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            background: var(--color-primary, #ff69b4);
                            cursor: pointer;
                            border: none;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        }
                    </style>
                </div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 24px;">
                    <button class="font-size-preset" data-size="12" style="padding: 12px; border: 2px solid ${currentFontSize === 12 ? '#ff69b4' : '#e0e0e0'}; border-radius: 12px; background: ${currentFontSize === 12 ? '#fff5f9' : 'white'}; cursor: pointer; transition: all 0.2s;">
                        <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px;">小</div>
                        <div style="font-size: 10px; color: #666;">12px</div>
                    </button>
                    <button class="font-size-preset" data-size="14" style="padding: 12px; border: 2px solid ${currentFontSize === 14 ? '#ff69b4' : '#e0e0e0'}; border-radius: 12px; background: ${currentFontSize === 14 ? '#fff5f9' : 'white'}; cursor: pointer; transition: all 0.2s;">
                        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">中</div>
                        <div style="font-size: 10px; color: #666;">14px</div>
                    </button>
                    <button class="font-size-preset" data-size="16" style="padding: 12px; border: 2px solid ${currentFontSize === 16 ? '#ff69b4' : '#e0e0e0'}; border-radius: 12px; background: ${currentFontSize === 16 ? '#fff5f9' : 'white'}; cursor: pointer; transition: all 0.2s;">
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">標準</div>
                        <div style="font-size: 10px; color: #666;">16px</div>
                    </button>
                    <button class="font-size-preset" data-size="20" style="padding: 12px; border: 2px solid ${currentFontSize === 20 ? '#ff69b4' : '#e0e0e0'}; border-radius: 12px; background: ${currentFontSize === 20 ? '#fff5f9' : 'white'}; cursor: pointer; transition: all 0.2s;">
                        <div style="font-size: 20px; font-weight: 600; margin-bottom: 4px;">大</div>
                        <div style="font-size: 10px; color: #666;">20px</div>
                    </button>
                </div>
                <div style="margin-top: 24px; padding: 16px; background: #f8f8f8; border-radius: 12px;">
                    <div style="font-size: 14px; color: #666; margin-bottom: 8px;">預覽效果：</div>
                    <div id="fontSizePreview" style="font-size: ${currentFontSize}px; line-height: 1.6; color: #333;">
                        這是一段預覽文字，您可以調整滑桿來查看不同字體大小的效果。調整後的字體大小會應用到整個應用程式。
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button class="font-size-reset-btn" style="flex: 1; padding: 12px; border: 2px solid #e0e0e0; border-radius: 12px; background: white; color: #666; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;">重置</button>
                <button class="font-size-confirm-btn" style="flex: 1; padding: 12px; border: none; border-radius: 12px; background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%); color: white; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(255, 105, 180, 0.3);">確認</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const slider = modal.querySelector('#fontSizeSlider');
    const valueDisplay = modal.querySelector('#fontSizeValue');
    const preview = modal.querySelector('#fontSizePreview');
    const presetButtons = modal.querySelectorAll('.font-size-preset');
    const resetBtn = modal.querySelector('.font-size-reset-btn');
    const confirmBtn = modal.querySelector('.font-size-confirm-btn');
    const closeBtn = modal.querySelector('.font-size-close-btn');
    // 保存原始字體大小（用於取消時恢復）
    const originalSize = getCurrentFontSize();
    // 臨時應用字體大小（僅用於預覽，不保存）
    const applyFontSizePreview = (size) => {
        const root = document.documentElement;
        root.style.setProperty('--base-font-size', `${size}px`);
        root.style.setProperty('--font-base', `${size}px`);
        root.style.setProperty('--font-xs', `${Math.round(size * 0.6875)}px`);
        root.style.setProperty('--font-sm', `${Math.round(size * 0.75)}px`);
        root.style.setProperty('--font-md', `${Math.round(size * 0.875)}px`);
        root.style.setProperty('--font-lg', `${Math.round(size * 1.125)}px`);
        root.style.setProperty('--font-xl', `${Math.round(size * 1.25)}px`);
        root.style.setProperty('--font-xxl', `${Math.round(size * 1.5)}px`);
        root.style.setProperty('--font-xxxl', `${Math.round(size * 2)}px`);
        document.body.style.fontSize = `${size}px`;
    };
    // 更新預覽
    const updatePreview = (size) => {
        valueDisplay.textContent = `${size}px`;
        preview.style.fontSize = `${size}px`;
        applyFontSizePreview(size);
    };
    // 滑桿事件
    slider.addEventListener('input', (e) => {
        const size = parseInt(e.target.value);
        updatePreview(size);
        presetButtons.forEach(btn => {
            const btnSize = parseInt(btn.dataset.size);
            if (btnSize === size) {
                btn.style.borderColor = '#ff69b4';
                btn.style.background = '#fff5f9';
            } else {
                btn.style.borderColor = '#e0e0e0';
                btn.style.background = 'white';
            }
        });
    });
    // 預設按鈕事件
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const size = parseInt(btn.dataset.size);
            slider.value = size;
            updatePreview(size);
            presetButtons.forEach(b => {
                const bSize = parseInt(b.dataset.size);
                if (bSize === size) {
                    b.style.borderColor = '#ff69b4';
                    b.style.background = '#fff5f9';
                } else {
                    b.style.borderColor = '#e0e0e0';
                    b.style.background = 'white';
                }
            });
        });
    });
    // 重置按鈕
    resetBtn.addEventListener('click', () => {
        const defaultSize = 16;
        slider.value = defaultSize;
        updatePreview(defaultSize);
        presetButtons.forEach(btn => {
            const btnSize = parseInt(btn.dataset.size);
            if (btnSize === defaultSize) {
                btn.style.borderColor = '#ff69b4';
                btn.style.background = '#fff5f9';
            } else {
                btn.style.borderColor = '#e0e0e0';
                btn.style.background = 'white';
            }
        });
    });
    // 確認按鈕
    confirmBtn.addEventListener('click', () => {
        playClickSound(); // 播放點擊音效
        const finalSize = parseInt(slider.value);
        applyFontSize(finalSize);
        if (document.body.contains(modal)) document.body.removeChild(modal);
    });
    // 關閉按鈕
    const closeModal = () => {
        applyFontSize(originalSize); // 恢復原來的字體大小
        if (document.body.contains(modal)) document.body.removeChild(modal);
    };
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', () => {
    // 載入股票名稱映射表
    loadStockNames();

    // 到期提醒：定期定額（日期到了主動詢問是否執行）
    if (typeof checkAndExecuteDCAPlans === 'function') {
        checkAndExecuteDCAPlans();
    }
    
    // 應用保存的字體大小
    initFontSize();
    
    // 初始化 Header 標籤（支出/收入/轉帳）
    initHeaderTabs();
    
    // 初始化標籤切換
    initTabSwitching();
    
    // 初始化分類網格（根據當前的 accountingType）
    const activeTabBtn = document.querySelector('.tab-btn.active');
    const tabType = activeTabBtn ? activeTabBtn.dataset.tab : 'recommended';
    initCategoryGrid(tabType, null); // 顯示所有分類
    
    // 初始化鍵盤
    initKeyboard();
    
    // 初始化日期按鈕
    initDateButton();
    
    // 初始化保存按鈕
    initSaveButton();
    
    // 初始化下月計入選項
    initNextMonthOption();
    
    // 初始化主題系統
    if (typeof getCurrentTheme === 'function' && typeof applyTheme === 'function') {
        const savedTheme = getCurrentTheme();
        applyTheme(savedTheme);
        console.log('✅ 主題系統已初始化，當前主題:', savedTheme);
    } else {
        console.warn('⚠️ 主題系統函數未找到');
    }
    
    // 防止所有輸入框focus時自動滾動（手機適配）
    setTimeout(() => {
        const allInputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], textarea');
        allInputs.forEach(input => {
            input.addEventListener('focus', function(e) {
                setTimeout(() => {
                    if (this.scrollIntoView) {
                        this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                    }
                }, 100);
            });
        });
    }, 500);
    
    // 初始化常用備註按鈕
    initQuickNotes();
    
    // 初始化常用項目一鍵記錄
    initQuickActions();
    
    // 初始化上一筆複製按鈕
    initCopyLastButton();
    
    // 初始化帳戶管理
    if (typeof initAccountManagement === 'function') {
        initAccountManagement();
    }
    
    // 頁面載入時自動設置默認帳戶
    const defaultAccount = getDefaultAccount();
    if (defaultAccount && !window.selectedAccount) {
        window.selectedAccount = defaultAccount;
        if (typeof updateAccountDisplay === 'function') updateAccountDisplay();
        if (typeof updateLedgerTitle === 'function') updateLedgerTitle();
    }
    
    // 初始化底部導航
    initBottomNav();

    // 初始化記帳日記詳情對話框
    initEntryDetailModal();

    initMonthSwitchers();

    // 每月20號提醒上傳
    setTimeout(() => {
        if (typeof maybeRemindMonthlyUpload === 'function') {
            maybeRemindMonthlyUpload();
        }
    }, 1500);

    // 檢查每日開啟對話
    setTimeout(() => {
        const allRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
        if (typeof checkDailyOpenDialog === 'function') checkDailyOpenDialog(allRecords);
        if (typeof checkMonthlyDialogs === 'function') checkMonthlyDialogs(allRecords);
        if (typeof checkMonthlySummaryDialog === 'function') checkMonthlySummaryDialog(allRecords);
        if (typeof checkOverspendReasonDialog === 'function') checkOverspendReasonDialog();
        if (typeof checkStreakBreakReminder === 'function') checkStreakBreakReminder(allRecords);
    }, 1000);
    
    // 定時檢查無記帳提醒（每小時一次）
    setInterval(() => {
        const allRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
        if (typeof checkNoEntryTodayDialog === 'function') checkNoEntryTodayDialog(allRecords);
    }, 3600000);
    
    // 初始化所有返回鍵
    const chartBackBtn = document.getElementById('chartBackBtn');
    if (chartBackBtn) chartBackBtn.addEventListener('click', () => goBackToLedger());
    
    const budgetBackBtn = document.getElementById('budgetBackBtn');
    if (budgetBackBtn) budgetBackBtn.addEventListener('click', () => goBackToLedger());

    const monthlyPlannerBackBtn = document.getElementById('monthlyPlannerBackBtn');
    if (monthlyPlannerBackBtn) monthlyPlannerBackBtn.addEventListener('click', () => goBackToLedger());
    
    const settingsBackBtn = document.getElementById('settingsBackBtn');
    if (settingsBackBtn) settingsBackBtn.addEventListener('click', () => goBackToLedger());
    
    // 初始化智慧提醒按鈕
    const smartRemindersBtn = document.getElementById('smartRemindersBtn') || document.getElementById('aiHousekeeperBtn');
    if (smartRemindersBtn) {
        smartRemindersBtn.addEventListener('click', () => {
            if (window.smartReminderSystem && typeof window.smartReminderSystem.showReminderPanel === 'function') {
                window.smartReminderSystem.showReminderPanel();
            } else {
                console.warn('智慧提醒系統未載入');
                alert('智慧提醒系統正在載入中，請稍後再試...');
            }
        });
    }
    
    // 投資專區返回按鈕已刪除，只保留買入按鈕

    const nextMonthBillsBackBtn = document.getElementById('nextMonthBillsBackBtn');
    if (nextMonthBillsBackBtn) nextMonthBillsBackBtn.addEventListener('click', () => closeNextMonthBillsPage());
    
    // 默認顯示記帳本頁面
    const pageLedger = document.getElementById('pageLedger');
    const headerSection = document.querySelector('.header-section');
    if (pageLedger) {
        pageLedger.style.display = 'block';
        if (headerSection) headerSection.style.display = 'none';
        initLedger();
    }
    
    // 檢查並執行到期的定期定額 / 分期規則
    setTimeout(() => {
        checkAndExecuteDCAPlans();
        if (typeof checkAndGenerateInstallments === 'function') checkAndGenerateInstallments();
    }, 1000);

    // 分期規則頁面：事件綁定
    const installmentBackBtn = document.getElementById('installmentBackBtn');
    if (installmentBackBtn) installmentBackBtn.addEventListener('click', () => showSettingsPage());

    const installmentAddBtn = document.getElementById('installmentAddBtn');
    if (installmentAddBtn) installmentAddBtn.addEventListener('click', () => showInstallmentSetupPage(null));

    const installmentSetupBackBtn = document.getElementById('installmentSetupBackBtn');
    if (installmentSetupBackBtn) installmentSetupBackBtn.addEventListener('click', () => showInstallmentManagementPage());

    const installmentSaveBtn = document.getElementById('installmentSaveBtn');
    if (installmentSaveBtn) installmentSaveBtn.addEventListener('click', () => saveInstallmentRule());

    const installmentVoidBtn = document.getElementById('installmentVoidBtn');
    if (installmentVoidBtn) installmentVoidBtn.addEventListener('click', () => deleteInstallmentRule(window.editingInstallmentRuleId));

    const installmentReviseBtn = document.getElementById('installmentReviseBtn');
    if (installmentReviseBtn) installmentReviseBtn.addEventListener('click', () => reviseInstallmentRule(window.editingInstallmentRuleId));

    const installmentTotalAmountInput = document.getElementById('installmentTotalAmountInput');
    const installmentTotalPeriodsInput = document.getElementById('installmentTotalPeriodsInput');
    if (installmentTotalAmountInput) installmentTotalAmountInput.addEventListener('input', updateInstallmentPerPeriodPreview);
    if (installmentTotalPeriodsInput) installmentTotalPeriodsInput.addEventListener('input', updateInstallmentPerPeriodPreview);

    // 初始化記帳輸入頁面（當顯示時）
    const pageInput = document.getElementById('pageInput');
    if (pageInput) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const isVisible = pageInput.style.display !== 'none';
                    if (isVisible) {
                        initHeaderTabs();
                        const activeTabBtn = document.querySelector('.tab-btn.active');
                        const tabType = activeTabBtn ? activeTabBtn.dataset.tab : 'recommended';
                        const recordType = window.accountingType || 'expense';
                        initCategoryGrid(tabType, recordType);
                    }
                }
            });
        });
        observer.observe(pageInput, { attributes: true, attributeFilter: ['style'] });
    }
    
    // 初始化搜索功能
    const searchBtn = document.getElementById('searchBtn');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    const searchContainer = document.getElementById('searchContainer');
    if (searchBtn && searchContainer) {
        searchBtn.addEventListener('click', () => { searchContainer.style.display = 'flex'; });
    }
    if (searchCloseBtn && searchContainer) {
        searchCloseBtn.addEventListener('click', () => { searchContainer.style.display = 'none'; });
    }
    
    // 初始化FAB按鈕
    const fabBtn = document.getElementById('fabBtn');
    const bottomNav = document.querySelector('.bottom-nav');
    if (fabBtn) {
        fabBtn.addEventListener('click', () => {
            const pageInput = document.getElementById('pageInput');
            const pageLedger = document.getElementById('pageLedger');
            const inputSection = document.getElementById('inputSection');
            if (pageInput) {
                pageInput.style.display = 'block';
                const headerSection = document.querySelector('.header-section');
                if (headerSection) headerSection.style.display = 'none';
                initHeaderTabs();
                initTabSwitching();
                const activeTabBtn = document.querySelector('.tab-btn.active');
                const tabType = activeTabBtn ? activeTabBtn.dataset.tab : 'recommended';
                console.log('打開記帳輸入頁面，tab:', tabType);
                initCategoryGrid(tabType, null); // 顯示所有分類
                initQuickActions();
                if (bottomNav) bottomNav.style.display = 'none';
            }
            if (pageLedger) {
                pageLedger.style.display = 'none';
                const headerSection = document.querySelector('.header-section');
                if (headerSection) headerSection.style.display = 'none';
            }
            if (inputSection) {
                inputSection.style.display = 'block';
                if (!inputSection.classList.contains('collapsed')) {
                    inputSection.classList.add('collapsed');
                }
                const collapseBtn = document.getElementById('collapseBtn');
                if (collapseBtn) {
                    const collapseIcon = collapseBtn.querySelector('.collapse-icon');
                    if (collapseIcon) collapseIcon.textContent = '▲';
                }
            }
        });
    }
    
    // 返回記帳本
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => goBackToLedger());
    
    const inputPageBackBtn = document.getElementById('inputPageBackBtn');
    if (inputPageBackBtn) inputPageBackBtn.addEventListener('click', () => goBackToLedger());
    
    const inputSectionBackBtn = document.getElementById('inputSectionBackBtn');
    if (inputSectionBackBtn) inputSectionBackBtn.addEventListener('click', () => goBackToLedger());
    
    const categoryManageBackBtn = document.getElementById('categoryManageBackBtn');
    if (categoryManageBackBtn) categoryManageBackBtn.addEventListener('click', () => goBackToLedger());
    
    // 初始化輸入區域收起按鈕
    const collapseBtn = document.getElementById('collapseBtn');
    const inputSection = document.getElementById('inputSection');
    if (collapseBtn && inputSection) {
        if (!inputSection.classList.contains('collapsed')) {
            inputSection.classList.add('collapsed');
        }
        const updateCollapseIcon = () => {
            const collapseIcon = collapseBtn.querySelector('.collapse-icon');
            if (collapseIcon) {
                collapseIcon.textContent = inputSection.classList.contains('collapsed') ? '▼' : '▲';
            }
        };
        const toggleCollapse = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            inputSection.classList.toggle('collapsed');
            updateCollapseIcon();
        };
        collapseBtn.addEventListener('click', toggleCollapse);
        collapseBtn.addEventListener('touchend', toggleCollapse, { passive: false });
        const amountDisplay = inputSection.querySelector('.amount-display');
        if (amountDisplay) {
            amountDisplay.addEventListener('click', () => {
                if (inputSection.classList.contains('collapsed')) {
                    inputSection.classList.remove('collapsed');
                    updateCollapseIcon();
                }
            });
            amountDisplay.style.cursor = 'pointer';
        }
    }
    
    // 初始化帳戶按鈕
    const accountBtn = document.querySelector('.account-btn');
    if (accountBtn) accountBtn.addEventListener('click', () => showAccountSelectModal());
    
    // 初始化帳戶管理功能
    initAccountManagement();
    
    // 初始化表情按鈕
    const emojiBtn = document.querySelector('.emoji-btn');
    if (emojiBtn) emojiBtn.addEventListener('click', () => showEmojiSelectModal());
    
    // 初始化表情選擇功能
    initEmojiSelector();
    
    // 初始化成員按鈕
    const memberBtn = document.getElementById('memberBtn');
    if (memberBtn) memberBtn.addEventListener('click', () => showMemberSelectModal());
    
    // 初始化載具按鈕
    const carrierBtn = document.getElementById('carrierBtn');
    const carrierRow = document.getElementById('carrierRow');
    if (carrierBtn && carrierRow) {
        carrierBtn.addEventListener('click', () => {
            if (carrierRow.style.display === 'none' || !carrierRow.style.display) {
                carrierRow.style.display = 'flex';
            } else {
                carrierRow.style.display = 'none';
            }
        });
    }
    
    // 初始化圖片按鈕
    const imageBtn = document.getElementById('imageBtn');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const imageGallery = document.getElementById('imageGallery');
    const imageCount = document.getElementById('imageCount');
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.style.display = 'none';
    imageInput.multiple = true; // 允許選擇多個檔案
    document.body.appendChild(imageInput);
    
    // 更新圖片庫顯示
    function updateImageGallery() {
        if (!imageGallery || !imageCount) return;
        const images = window.selectedReceiptImages || [];
        imageCount.textContent = `已上傳 ${images.length} 張照片`;
        imageGallery.innerHTML = '';
        images.forEach((imageData, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'image-thumbnail';
            thumbnail.innerHTML = `
                <img src="${imageData}" alt="照片 ${index + 1}" class="thumbnail-img" loading="lazy" decoding="async">
                <button class="thumbnail-remove" data-index="${index}">✕</button>
            `;
            thumbnail.querySelector('.thumbnail-img').addEventListener('click', () => {
                showReceiptImageModal(imageData);
            });
            thumbnail.querySelector('.thumbnail-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                removeImageAtIndex(index);
            });
            imageGallery.appendChild(thumbnail);
        });
        // 如果有圖片，顯示第一張作為主預覽
        if (images.length > 0 && previewImage) {
            const firstImage = images[0];
            if (typeof compressImage === 'function') {
                const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
                const maxW = isMobile ? 520 : 900;
                const maxH = isMobile ? 520 : 900;
                const quality = isMobile ? 0.5 : 0.72;
                Promise.resolve(compressImage(firstImage, maxW, maxH, quality))
                    .then((compressedPreview) => { previewImage.src = compressedPreview || firstImage; })
                    .catch(() => { previewImage.src = firstImage; });
            } else {
                previewImage.src = firstImage;
            }
            previewImage.addEventListener('click', () => showReceiptImageModal(images[0]));
            previewImage.style.cursor = 'pointer';
        }
    }
    
    // 移除指定索引的圖片
    function removeImageAtIndex(index) {
        if (!window.selectedReceiptImages) return;
        window.selectedReceiptImages.splice(index, 1);
        updateImageGallery();
        if (window.selectedReceiptImages.length === 0) {
            if (imagePreview) imagePreview.style.display = 'none';
            if (previewImage) previewImage.src = '';
        }
    }
    
    if (imageBtn) {
        imageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            imageInput.value = '';
            openFilePickerCompat(imageInput);
        });
    }
    
    // 處理圖片選擇
    imageInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            if (!window.selectedReceiptImages) window.selectedReceiptImages = [];
            // 檢查總圖片數量限制
            const totalImages = window.selectedReceiptImages.length + files.length;
            if (totalImages > 20) {
                alert(`最多只能上傳20張圖片！您已選擇 ${files.length} 張，加上現有的 ${window.selectedReceiptImages.length} 張，總共 ${totalImages} 張。`);
                imageInput.value = '';
                return;
            }
            // 計算預估總大小
            let estimatedTotalSize = 0;
            window.selectedReceiptImages.forEach(img => { estimatedTotalSize += img.length; });
            estimatedTotalSize += files.length * 200000; // 預估新圖片大小
            if (estimatedTotalSize > 2000000) { // 2MB
                if (!confirm(`預估總圖片大小較大（約${Math.round(estimatedTotalSize/1024/1024)}MB），可能影響儲存效能。\n\n建議減少照片數量或壓縮照片。\n\n是否繼續上傳？`)) {
                    imageInput.value = '';
                    return;
                }
            }
            // 處理每個檔案
            for (const file of files) {
                if (file.size > 10 * 1024 * 1024) { // 限制 10MB
                    alert(`圖片 ${file.name} 太大！請選擇小於 10MB 的圖片。`);
                    continue;
                }
                try {
                    const imageData = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (event) => resolve(event.target.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                    let processedImageData = imageData;
                    // 壓縮圖片
                    if (typeof compressImage === 'function') {
                        try {
                            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
                            const maxW = isMobile ? 640 : 1200;
                            const maxH = isMobile ? 640 : 1200;
                            const quality = isMobile ? 0.55 : 0.75;
                            processedImageData = await compressImage(imageData, maxW, maxH, quality);
                            console.log('圖片已壓縮');
                        } catch (error) {
                            console.error('圖片壓縮失敗:', error);
                            processedImageData = imageData; // 壓縮失敗使用原始圖片
                        }
                    }
                    // 添加到圖片陣列
                    window.selectedReceiptImages.push(processedImageData);
                    const imageSize = processedImageData.length;
                    console.log(`圖片 ${file.name} 處理後大小: ${imageSize} 字符`);
                    if (imageSize > 500000) { // 500KB
                        console.warn(`圖片 ${file.name} 較大: ${imageSize} 字符`);
                    }
                } catch (error) {
                    console.error('處理圖片失敗:', error);
                    alert(`處理圖片 ${file.name} 時發生錯誤`);
                }
            }
            // 更新圖片庫顯示
            updateImageGallery();
            if (imagePreview) imagePreview.style.display = 'block';
            console.log(`已上傳 ${window.selectedReceiptImages.length} 張圖片`);
        }
        imageInput.value = ''; // 清空檔案輸入
    });
    
    // 移除圖片按鈕
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            if (previewImage) previewImage.src = '';
            if (imagePreview) imagePreview.style.display = 'none';
            imageInput.value = '';
            window.selectedReceiptImages = [];
            updateImageGallery();
            console.log('已清除所有圖片');
        });
    }
});
