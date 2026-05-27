// ========== 記帳日記詳情功能 ==========

let currentEntryDetailRecord = null;

// 初始化記帳日記詳情對話框
function initEntryDetailModal() {
    const entryDetailModal = document.getElementById('entryDetailModal');
    const entryDetailBackBtn = document.getElementById('entryDetailBackBtn');
    const entryDetailClose = document.getElementById('entryDetailClose');
    
    // 關閉對話框
    function closeEntryDetailModal() {
        if (entryDetailModal) {
            entryDetailModal.style.display = 'none';
        }
    }
    
    if (entryDetailBackBtn) {
        entryDetailBackBtn.addEventListener('click', closeEntryDetailModal);
    }
    
    if (entryDetailClose) {
        entryDetailClose.addEventListener('click', closeEntryDetailModal);
    }
    
    // 點擊遮罩關閉
    const modalOverlay = entryDetailModal?.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeEntryDetailModal);
    }

    const editBtn = document.getElementById('entryDetailEditBtn');
    const editSection = document.getElementById('entryDetailEditSection');
    const typeSelect = document.getElementById('entryEditType');
    const saveBtn = document.getElementById('entryEditSaveBtn');
    const cancelBtn = document.getElementById('entryEditCancelBtn');

    if (editBtn && editSection) {
        editBtn.addEventListener('click', () => {
            if (!currentEntryDetailRecord) return;
            const isVisible = editSection.style.display === 'block';
            if (isVisible) {
                hideEntryEditSection();
            } else {
                populateEntryEditForm(currentEntryDetailRecord);
                editSection.style.display = 'block';
                editBtn.classList.add('is-active');
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideEntryEditSection);
    }

    if (typeSelect) {
        typeSelect.addEventListener('change', () => {
            refreshEntryEditCategoryOptions(typeSelect.value, '');
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', handleEntryEditSave);
    }
}

// 顯示記帳日記詳情
function showEntryDetail(record) {
    const entryDetailModal = document.getElementById('entryDetailModal');
    const entryDetailCategory = document.getElementById('entryDetailCategory');
    const entryDetailAmount = document.getElementById('entryDetailAmount');
    const entryDetailDate = document.getElementById('entryDetailDate');
    const entryDetailNote = document.getElementById('entryDetailNote');
    const entryDetailGallery = document.getElementById('entryDetailGallery');
    
    if (!entryDetailModal) return;
    
    currentEntryDetailRecord = record ? { ...record } : null;

    // 顯示前先重置編輯區塊
    hideEntryEditSection();
    const editBtn = document.getElementById('entryDetailEditBtn');
    if (editBtn) {
        if (record) {
            editBtn.style.display = 'inline-flex';
            editBtn.classList.remove('is-active');
        } else {
            editBtn.style.display = 'none';
        }
    }

    // 設置基本資訊
    if (entryDetailCategory) {
        entryDetailCategory.textContent = record.category || '未分類';
    }
    
    if (entryDetailAmount) {
        const isExpense = record.type === 'expense' || !record.type;
        const isTransfer = record.type === 'transfer';
        const amountClass = isExpense ? 'expense' : isTransfer ? 'transfer' : 'income';
        entryDetailAmount.className = `entry-detail-amount ${amountClass}`;
        entryDetailAmount.textContent = `${isTransfer ? '' : isExpense ? '-' : '+'}NT$${(record.amount || 0).toLocaleString('zh-TW')}`;
    }
    
    if (entryDetailDate) {
        const date = new Date(record.date);
        const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        entryDetailDate.textContent = dateStr;
    }
    
    if (entryDetailNote) {
        entryDetailNote.textContent = record.note || '';
        entryDetailNote.style.display = record.note ? 'block' : 'none';
    }
    
    // 設置圖片庫
    if (entryDetailGallery) {
        entryDetailGallery.innerHTML = '';
        
        let images = [];
        if (record.receiptImages && record.receiptImages.length > 0) {
            images = record.receiptImages;
        } else if (record.receiptImage) {
            images = [record.receiptImage];
        }
        
        if (images.length > 0) {
            images.forEach((imageData, index) => {
                const img = document.createElement('img');
                img.src = imageData;
                img.alt = `照片 ${index + 1}`;
                img.addEventListener('click', () => {
                    // 點擊圖片可以放大查看
                    showReceiptImageModal(imageData);
                });
                entryDetailGallery.appendChild(img);
            });
        } else {
            entryDetailGallery.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">沒有照片記錄</p>';
        }
    }
    
    // 顯示對話框
    entryDetailModal.style.display = 'flex';
}

function hideEntryEditSection() {
    const editSection = document.getElementById('entryDetailEditSection');
    const editBtn = document.getElementById('entryDetailEditBtn');
    if (editSection) {
        editSection.style.display = 'none';
    }
    if (editBtn) {
        editBtn.classList.remove('is-active');
    }
}

function populateEntryEditForm(record) {
    if (!record) return;
    const typeSelect = document.getElementById('entryEditType');
    const categorySelect = document.getElementById('entryEditCategory');
    const amountInput = document.getElementById('entryEditAmount');
    const dateInput = document.getElementById('entryEditDate');
    const accountSelect = document.getElementById('entryEditAccount');
    const memberSelect = document.getElementById('entryEditMember');
    const noteInput = document.getElementById('entryEditNote');

    const type = record.type || 'expense';
    if (typeSelect) {
        typeSelect.value = type;
    }
    refreshEntryEditCategoryOptions(type, record.category || '');

    if (amountInput) {
        amountInput.value = typeof record.amount === 'number' ? record.amount : (record.amount || 0);
    }

    if (dateInput) {
        dateInput.value = record.date ? record.date.substring(0, 10) : '';
    }

    fillEntryEditAccountOptions(record);
    fillEntryEditMemberOptions(record.member || '');

    if (noteInput) {
        noteInput.value = record.note || '';
    }
}

function refreshEntryEditCategoryOptions(type, selectedCategory) {
    const categorySelect = document.getElementById('entryEditCategory');
    if (!categorySelect) return;

    const categoriesSource = typeof getEnabledCategories === 'function'
        ? getEnabledCategories(type)
        : (Array.isArray(window.allCategories) ? window.allCategories.filter(cat => !type || cat.type === type) : []);

    categorySelect.innerHTML = categoriesSource.length
        ? '<option value="">請選擇分類</option>'
        : '<option value="">沒有可用的分類</option>';

    categoriesSource.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = `${cat.icon || '📦'} ${cat.name}`;
        if (cat.name === selectedCategory) {
            option.selected = true;
        }
        categorySelect.appendChild(option);
    });

    if (selectedCategory && !categoriesSource.some(cat => cat.name === selectedCategory) && categorySelect.firstChild) {
        categorySelect.firstChild.selected = true;
    }
}

function fillEntryEditAccountOptions(record) {
    const accountSelect = document.getElementById('entryEditAccount');
    if (!accountSelect) return;

    const accounts = typeof getAccounts === 'function' ? getAccounts() : [];
    const selectedAccountId = record.account || record.fromAccount || '';

    let optionsHtml = '<option value="">（無指定帳戶）</option>';
    accounts.forEach(account => {
        optionsHtml += `<option value="${account.id}">${account.name || account.id}</option>`;
    });
    accountSelect.innerHTML = optionsHtml;
    accountSelect.value = selectedAccountId || '';
}

function fillEntryEditMemberOptions(selectedName) {
    const memberSelect = document.getElementById('entryEditMember');
    if (!memberSelect) return;

    const members = typeof getMembers === 'function' ? getMembers() : [];
    let optionsHtml = '<option value="">（無成員）</option>';
    members.forEach(member => {
        optionsHtml += `<option value="${member.name}">${member.icon || '👤'} ${member.name}</option>`;
    });
    memberSelect.innerHTML = optionsHtml;
    memberSelect.value = selectedName || '';
}

function handleEntryEditSave() {
    if (!currentEntryDetailRecord) return;

    const typeSelect = document.getElementById('entryEditType');
    const categorySelect = document.getElementById('entryEditCategory');
    const amountInput = document.getElementById('entryEditAmount');
    const dateInput = document.getElementById('entryEditDate');
    const accountSelect = document.getElementById('entryEditAccount');
    const memberSelect = document.getElementById('entryEditMember');
    const noteInput = document.getElementById('entryEditNote');

    const type = typeSelect?.value || currentEntryDetailRecord.type || 'expense';
    const category = categorySelect?.value || '';
    const amountValue = parseFloat(amountInput?.value || '0');
    const date = dateInput?.value || currentEntryDetailRecord.date;
    const accountId = accountSelect?.value || '';
    const memberName = memberSelect?.value || '';
    const note = noteInput?.value.trim() || '';

    if (!category) {
        alert('請選擇分類');
        return;
    }

    if (!amountValue || amountValue <= 0) {
        alert('金額必須大於 0');
        return;
    }

    if (!date) {
        alert('請選擇日期');
        return;
    }

    let records = [];
    try {
        records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    } catch (error) {
        console.error('無法解析記帳記錄：', error);
        alert('讀取記帳記錄時發生錯誤');
        return;
    }

    let recordIndex = -1;
    if (currentEntryDetailRecord.timestamp) {
        recordIndex = records.findIndex(r => r?.timestamp === currentEntryDetailRecord.timestamp);
    }
    if (recordIndex === -1) {
        recordIndex = records.findIndex(r =>
            !currentEntryDetailRecord.timestamp &&
            !r.timestamp &&
            r.date === currentEntryDetailRecord.date &&
            (r.amount || 0) === (currentEntryDetailRecord.amount || 0) &&
            (r.category || '') === (currentEntryDetailRecord.category || '')
        );
    }

    if (recordIndex === -1) {
        alert('找不到原始紀錄，可能已被刪除');
        return;
    }

    const targetRecord = records[recordIndex] || {};
    const normalizedAmount = Math.round(amountValue * 100) / 100;

    const updatedRecord = {
        ...targetRecord,
        type,
        category,
        amount: normalizedAmount,
        date,
        note,
        member: memberName || ''
    };

    if (type === 'transfer') {
        updatedRecord.fromAccount = accountId || targetRecord.fromAccount || targetRecord.account || '';
        updatedRecord.account = updatedRecord.fromAccount;
    } else {
        updatedRecord.account = accountId || '';
        delete updatedRecord.fromAccount;
        delete updatedRecord.toAccount;
    }

    records[recordIndex] = updatedRecord;
    localStorage.setItem('accountingRecords', JSON.stringify(records));

    currentEntryDetailRecord = { ...updatedRecord };
    showEntryDetail(updatedRecord);
    if (typeof initLedger === 'function') {
        initLedger();
    } else if (typeof updateLedgerSummary === 'function') {
        updateLedgerSummary(records);
    }

    alert('紀錄已更新');
}

// 添加點擊事件監聽器到交易項目
function addTransactionClickHandlers() {
    const transactionItems = document.querySelectorAll('.transaction-item');
    
    transactionItems.forEach(item => {
        // 移除舊的事件監聽器
        item.removeEventListener('click', handleTransactionClick);
        // 添加新的事件監聽器
        item.addEventListener('click', handleTransactionClick);
    });
}

// 處理交易項目點擊
function handleTransactionClick(e) {
    // 如果點擊的是刪除按鈕，不觸發詳情對話框
    if (e.target.classList.contains('transaction-delete-btn')) {
        return;
    }
    
    // 如果點擊的是圖片，不觸發詳情對話框（圖片有自己的處理邏輯）
    if (e.target.classList.contains('receipt-thumbnail') || e.target.classList.contains('receipt-thumbnail-small')) {
        return;
    }
    
    // 獲取記錄資訊
    const item = e.currentTarget;
    const timestamp = item.querySelector('.transaction-delete-btn')?.dataset.recordTimestamp;
    const date = item.querySelector('.transaction-delete-btn')?.dataset.recordDate;
    const amount = parseInt(item.querySelector('.transaction-delete-btn')?.dataset.recordAmount || '0');
    const category = item.querySelector('.transaction-delete-btn')?.dataset.recordCategory || '';
    
    if (!date || !amount) return;
    
    // 從 localStorage 獲取完整記錄
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const record = records.find(r => 
        r.date === date && 
        r.amount === amount && 
        (r.category || '') === category &&
        (timestamp ? r.timestamp === timestamp : true)
    );
    
    if (record) {
        showEntryDetail(record);
    }
}

// ========== 新投資專區UI功能 ==========

// 初始化操作按鈕
function initInvestmentActions() {
    const buyBtn = document.getElementById('actionBuy');
    const sellBtn = document.getElementById('actionSell');
    const dividendBtn = document.getElementById('actionDividend');
    const dcaBtn = document.getElementById('actionDCA');
    
    if (buyBtn) {
        buyBtn.addEventListener('click', () => {
            playClickSound(); // 播放點擊音效
            showInvestmentInputPage('buy');
        });
    }
    
    if (sellBtn) {
        sellBtn.addEventListener('click', () => {
            playClickSound(); // 播放點擊音效
            quickOpenSellPage();
        });
    }
    
    if (dividendBtn) {
        dividendBtn.addEventListener('click', () => {
            playClickSound(); // 播放點擊音效
            // 顯示股息輸入頁面
            const dividendInputPage = document.getElementById('dividendInputPage');
            const overview = document.getElementById('investmentOverview');
            const detailPage = document.getElementById('stockDetailPage');
            const inputPage = document.getElementById('investmentInputPage');
            const bottomNav = document.querySelector('.bottom-nav');
            const investmentActions = document.querySelector('.investment-actions');
            
            if (overview) overview.style.display = 'none';
            if (detailPage) detailPage.style.display = 'none';
            if (inputPage) inputPage.style.display = 'none';
            if (dividendInputPage) {
                dividendInputPage.style.display = 'block';
                // 隱藏底部導航欄
                if (bottomNav) bottomNav.style.display = 'none';
                // 隱藏操作按鈕
                if (investmentActions) investmentActions.style.display = 'none';
                // 初始化股息輸入頁面
                initDividendInput();
            }
        });
    }
    
    // 初始化拖動排序功能（只針對股息和定期定額按鈕）
    initButtonDragAndDrop();
    
    if (dcaBtn) {
        dcaBtn.addEventListener('click', () => {
            playClickSound(); // 播放點擊音效
            showDCAManagementPage();
        });
    }
}

// 初始化按鈕拖動排序功能
function initButtonDragAndDrop() {
    const investmentActions = document.querySelector('.investment-actions');
    if (!investmentActions) return;
    
    // 只允許股息和定期定額按鈕可以拖動
    const dividendBtn = document.getElementById('actionDividend');
    const dcaBtn = document.getElementById('actionDCA');
    
    [dividendBtn, dcaBtn].forEach(btn => {
        if (!btn) return;
        
        // 添加可拖動標記
        btn.classList.add('draggable');
        btn.draggable = true;
        
        // 拖動開始
        btn.addEventListener('dragstart', (e) => {
            btn.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', btn.outerHTML);
            e.dataTransfer.setData('text/plain', btn.id);
        });
        
        // 拖動結束
        btn.addEventListener('dragend', () => {
            btn.classList.remove('dragging');
            // 移除所有拖動相關的樣式
            document.querySelectorAll('.action-btn').forEach(b => {
                b.classList.remove('drag-over');
            });
        });
        
        // 拖動進入
        btn.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (!btn.classList.contains('dragging')) {
                btn.classList.add('drag-over');
            }
        });
        
        // 拖動離開
        btn.addEventListener('dragleave', () => {
            btn.classList.remove('drag-over');
        });
        
        // 拖動經過
        btn.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        // 放置
        btn.addEventListener('drop', (e) => {
            e.preventDefault();
            btn.classList.remove('drag-over');
            
            const draggedId = e.dataTransfer.getData('text/plain');
            const draggedBtn = document.getElementById(draggedId);
            
            if (!draggedBtn || draggedBtn === btn) return;
            
            // 獲取所有按鈕
            const allButtons = Array.from(investmentActions.querySelectorAll('.action-btn'));
            const draggedIndex = allButtons.indexOf(draggedBtn);
            const targetIndex = allButtons.indexOf(btn);
            
            if (draggedIndex === -1 || targetIndex === -1) return;
            
            // 重新排列按鈕
            if (draggedIndex < targetIndex) {
                investmentActions.insertBefore(draggedBtn, btn.nextSibling);
            } else {
                investmentActions.insertBefore(draggedBtn, btn);
            }
            
            // 保存新的順序到 localStorage
            saveButtonOrder();
            
            // 播放音效
            playClickSound();
        });
    });
}

// 保存按鈕順序
function saveButtonOrder() {
    const investmentActions = document.querySelector('.investment-actions');
    if (!investmentActions) return;
    
    const buttons = Array.from(investmentActions.querySelectorAll('.action-btn'));
    const order = buttons.map(btn => btn.id);
    
    try {
        localStorage.setItem('investmentButtonOrder', JSON.stringify(order));
    } catch (error) {
        console.error('保存按鈕順序失敗:', error);
    }
}

// 載入按鈕順序
function loadButtonOrder() {
    const investmentActions = document.querySelector('.investment-actions');
    if (!investmentActions) return;
    
    try {
        const savedOrder = localStorage.getItem('investmentButtonOrder');
        if (!savedOrder) return;
        
        const order = JSON.parse(savedOrder);
        const buttons = Array.from(investmentActions.querySelectorAll('.action-btn'));
        
        // 按照保存的順序重新排列
        order.forEach(id => {
            const btn = document.getElementById(id);
            if (btn && investmentActions.contains(btn)) {
                investmentActions.appendChild(btn);
            }
        });
    } catch (error) {
        console.error('載入按鈕順序失敗:', error);
    }
}

// 更新投資總覽
function updateInvestmentOverview() {
    updateInvestmentSummary();
    updateStockList();
}

// 更新持股清單
function updateStockList() {
    const portfolio = getPortfolio();
    const stockList = document.getElementById('stockList');
    const stockCount = document.getElementById('stockCount');
    const searchInput = document.getElementById('stockSearchInput');
    const searchClearBtn = document.getElementById('stockSearchClearBtn');
    
    if (!stockList) return;
    
    // 獲取搜尋關鍵字
    const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    // 過濾持股列表
    let filteredPortfolio = portfolio;
    if (searchQuery) {
        filteredPortfolio = portfolio.filter(stock => {
            const stockCode = (stock.stockCode || '').toLowerCase();
            const stockName = (stock.stockName || '').toLowerCase();
            return stockCode.includes(searchQuery) || stockName.includes(searchQuery);
        });
    }
    
    // 更新持股數量（顯示過濾後的數量）
    if (stockCount) {
        if (searchQuery && filteredPortfolio.length !== portfolio.length) {
            stockCount.textContent = `${filteredPortfolio.length}/${portfolio.length} 檔`;
        } else {
        stockCount.textContent = `${portfolio.length} 檔`;
        }
    }
    
    // 顯示/隱藏清除按鈕
    if (searchClearBtn) {
        searchClearBtn.style.display = searchQuery ? 'flex' : 'none';
    }
    
    if (filteredPortfolio.length === 0) {
        if (searchQuery) {
            stockList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-text">找不到符合「${searchQuery}」的持股</div>
                    <div class="empty-hint">請嘗試其他關鍵字</div>
                </div>
            `;
        } else {
        stockList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <div class="empty-text">尚無持股</div>
                <div class="empty-hint">點擊下方「買入」按鈕開始投資</div>
            </div>
        `;
        }
        return;
    }
    
    let html = '';
    filteredPortfolio.forEach(stock => {
        // 計算未實現損益（使用保存的當前價格，如果沒有則使用平均成本）
        const currentPrice = getStockCurrentPrice(stock.stockCode) || stock.avgCost;
        const previousClose = getStockPreviousClosePrice(stock.stockCode);
        // 若昨收缺失，背景嘗試補抓，避免顯示 --
        if (!previousClose) {
            fetchPreviousCloseOnly(stock.stockCode).then((prev) => {
                if (prev) {
                    // 略微延遲刷新，避免頻繁重繪
                    setTimeout(() => {
                        try {
                            updateStockList();
                        } catch (_) {}
                    }, 120);
                }
            });
        }
        const marketValue = (currentPrice || 0) * (stock.shares || 0);
        const unrealizedPnl = marketValue - (stock.totalCost || 0);
        const isPositive = unrealizedPnl >= 0;

        const priceArrowDir = (previousClose && previousClose > 0 && currentPrice != null)
            ? (currentPrice > previousClose ? 'up' : (currentPrice < previousClose ? 'down' : ''))
            : '';

        const dailyChange = (previousClose && previousClose > 0 && currentPrice != null)
            ? (currentPrice - previousClose)
            : null;
        const dailyChangePct = (dailyChange != null && previousClose && previousClose > 0)
            ? (dailyChange / previousClose * 100)
            : null;
        const isDailyPositive = dailyChange != null ? dailyChange >= 0 : true;
        const displayPrice = (currentPrice != null && currentPrice !== 0 ? currentPrice : 0).toFixed(2);
        const displayPrevClose = (previousClose != null && previousClose > 0 ? previousClose : null);
        const displayAvg = (stock.avgCost != null && stock.avgCost !== 0 ? stock.avgCost : 0).toFixed(2);
        const displayPnl = Math.abs(unrealizedPnl).toLocaleString('zh-TW');

        const displayDailyChange = dailyChange != null ? Math.abs(dailyChange).toFixed(2) : '--';
        const displayDailyPct = dailyChangePct != null ? Math.abs(dailyChangePct).toFixed(2) : '--';
        const displayDailyText = dailyChange != null
            ? `${isDailyPositive ? '+' : '-'}${displayDailyChange} (${isDailyPositive ? '+' : '-'}${displayDailyPct}%)`
            : '--';

        const showDailyChange = dailyChange != null;
        
        html += `
            <div class="stock-item-card" data-stock-code="${stock.stockCode}">
                <div class="stock-grid-card-top">
                    <div class="stock-grid-card-title">
                        <div class="stock-card-name">${stock.stockName}</div>
                        <div class="stock-card-code">${stock.stockCode}</div>
                    </div>
                    <div class="stock-grid-card-price">
                        <div class="stock-grid-card-price-value">
                            <span class="stock-grid-card-price-number">${formatNumber(currentPrice || 0, 2)}</span>
                            <span class="stock-grid-card-price-unit">現價</span>
                            <span class="stock-grid-card-price-arrow ${priceArrowDir}">${priceArrowDir === 'up' ? '▲' : (priceArrowDir === 'down' ? '▼' : '')}</span>
                        </div>
                        <div class="stock-grid-card-price-sub">
                            <span class="stock-grid-card-price-prev-label">昨收</span>
                            <span class="stock-grid-card-price-prev">${displayPrevClose != null ? formatNumber(displayPrevClose, 2) : '--'}</span>
                        </div>
                    </div>
                </div>

                ${showDailyChange ? `
                <div class="stock-grid-card-change ${isDailyPositive ? 'positive' : 'negative'}">
                    <span class="stock-grid-card-change-arrow">${isDailyPositive ? '▲' : '▼'}</span>
                    <span class="stock-grid-card-change-value">${displayDailyText}</span>
                </div>
                ` : ''}
                <div class="stock-grid-card-tags">
                    <div class="stock-grid-card-tag stock-grid-card-tag--shares">${stock.shares} 股</div>
                </div>
            </div>
        `;
    });
    
    stockList.innerHTML = html;
    
    // 綁定點擊事件
    document.querySelectorAll('.stock-item-card').forEach(card => {
        card.addEventListener('click', () => {
            const stockCode = card.dataset.stockCode;
            showStockDetailPage(stockCode);
        });
    });
}

// 顯示個股詳情頁面
function showStockDetailPage(stockCode) {
    const portfolio = getPortfolio();
    const stock = portfolio.find(s => s.stockCode === stockCode);
    
    if (!stock) return;
    
    const overview = document.getElementById('investmentOverview');
    const detailPage = document.getElementById('stockDetailPage');
    
    const bottomNav = document.querySelector('.bottom-nav');
    const investmentActions = document.querySelector('.investment-actions');
    
    if (overview) overview.style.display = 'none';
    if (bottomNav) bottomNav.style.display = 'none';
    if (investmentActions) investmentActions.style.display = 'none';
    
    if (detailPage) {
        detailPage.style.display = 'block';
        
        // 更新個股資訊
        document.getElementById('stockDetailName').textContent = stock.stockName;
        document.getElementById('stockDetailCode').textContent = stock.stockCode;
        
        // 更新查價連結
        const quoteLink = document.getElementById('metricQuoteLink');
        if (quoteLink) {
            const quoteSite = quoteLink.dataset.site || 'cnyes';
            let href = '#';
            if (quoteSite === 'cnyes') {
                href = `https://www.cnyes.com/twstock/${stock.stockCode}`;
            }
            quoteLink.href = href;

            // 有些情況會被外層事件攔截或阻止預設跳轉，因此這裡明確綁定開新分頁
            quoteLink.onclick = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (!href || href === '#') {
                    alert('請先選擇股票後再查價');
                    return;
                }
                window.open(href, '_blank', 'noopener');
            };
        }
        
        // 更新關鍵數據
        const stockShares = stock.shares || 0;
        const stockAvgCost = stock.avgCost != null && stock.avgCost !== 0 ? stock.avgCost : 0;
        document.getElementById('metricShares').textContent = `${stockShares.toLocaleString('zh-TW')} 股`;
        document.getElementById('metricAvgCost').textContent = `NT$${stockAvgCost.toFixed(2)}`;

        const measureInputTextWidthPx = (inputEl, text) => {
            try {
                const style = window.getComputedStyle(inputEl);
                const font = style.font || `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
                const canvas = measureInputTextWidthPx._canvas || (measureInputTextWidthPx._canvas = document.createElement('canvas'));
                const ctx = canvas.getContext('2d');
                if (!ctx) return null;
                ctx.font = font;
                const metrics = ctx.measureText(text);
                return metrics?.width ?? null;
            } catch (_) {
                return null;
            }
        };

        const applyAutoWidth = (el) => {
            if (!el) return;

            const isMobile = window.matchMedia && window.matchMedia('(max-width: 576px)').matches;
            if (isMobile) {
                el.style.width = '100%';
                return;
            }

            const value = (el.value ?? '').toString();
            const wrapper = el.closest('.metric-price-wrapper');
            const quoteBtn = document.getElementById('metricQuoteLink');

            const textWidth = measureInputTextWidthPx(el, value || '0');
            // 讓 input 內部留一些左右 padding 的空間（略大一點避免跳動）
            const desired = (textWidth != null ? Math.ceil(textWidth) : 80) + 36;
            const minW = 120;

            let maxW = wrapper ? wrapper.clientWidth : 360;
            if (wrapper && quoteBtn) {
                const gap = 12;
                maxW = Math.max(120, wrapper.clientWidth - quoteBtn.offsetWidth - gap);
            }

            const finalW = Math.max(minW, Math.min(desired, maxW));
            el.style.width = `${finalW}px`;
        };

        let currentPriceInput = document.getElementById('metricCurrentPrice');
        if (currentPriceInput) {

            // 優先使用保存的當前價格，如果沒有則使用平均成本
            const savedPrice = getStockCurrentPrice(stockCode);
            const defaultPrice = savedPrice || stockAvgCost;
            currentPriceInput.value = (defaultPrice != null ? defaultPrice : 0).toFixed(2);

            applyAutoWidth(currentPriceInput);
            
            // 自動獲取現價（如果今天沒有手動輸入的價格）
            if (!hasManualPriceToday(stockCode)) {
            fetchStockPrice(stockCode).then(price => {
                if (price && currentPriceInput) {
                    currentPriceInput.value = price.toFixed(2);
                    applyAutoWidth(currentPriceInput);
                    // 觸發 input 事件以更新未實現損益
                    currentPriceInput.dispatchEvent(new Event('input'));
                } else if (stockCode.endsWith('B')) {
                    // 債券 ETF 無法自動獲取價格時，顯示提示
                    console.info(`💡 債券 ETF ${stockCode} 無法自動獲取價格，請手動輸入`);
                }
            }).catch(err => {
                console.log('自動獲取現價失敗，使用已保存的價格');
                if (stockCode.endsWith('B')) {
                    console.info(`💡 債券 ETF ${stockCode} 無法自動獲取價格，請在輸入框中手動輸入當前價格`);
                }
            });
            } else {
                // 今天已有手動輸入的價格，不自動更新
                console.log(`📝 ${stockCode} 今天已有手動輸入的價格，不自動更新`);
            }
        }
        
        // 初始化返回按鈕
        const backBtn = document.getElementById('stockDetailBackBtn');
        if (backBtn) {
            backBtn.onclick = () => {
                // 返回投資專區概覽頁面
                if (overview) overview.style.display = 'block';
                if (detailPage) detailPage.style.display = 'none';
                if (bottomNav) bottomNav.style.display = 'flex';
                if (investmentActions) investmentActions.style.display = 'flex';
                // 更新投資概覽
                updateInvestmentOverview();
            };
        }
        
        // 計算未實現損益
        if (currentPriceInput) {
            // 移除舊的事件監聽器（如果有的話）
            const newInput = currentPriceInput.cloneNode(true);
            currentPriceInput.parentNode.replaceChild(newInput, currentPriceInput);
            currentPriceInput = newInput;
            
            newInput.addEventListener('input', () => {
                if (typeof applyAutoWidth === 'function') {
                    applyAutoWidth(newInput);
                } else if (typeof window !== 'undefined' && typeof window.applyAutoWidth === 'function') {
                    window.applyAutoWidth(newInput);
                }
                const currentPrice = parseFloat(newInput.value) || stockAvgCost;
                const unrealizedPnl = (currentPrice - stockAvgCost) * stockShares;
                const pnlEl = document.getElementById('metricUnrealizedPnl');
                if (pnlEl) {
                    pnlEl.textContent = `${unrealizedPnl >= 0 ? '+' : ''}NT$${Math.abs(unrealizedPnl).toLocaleString('zh-TW')}`;
                    pnlEl.className = `metric-value-large pnl ${unrealizedPnl >= 0 ? 'positive' : 'negative'}`;
                }
                
                // 保存當前價格到 localStorage（標記為手動輸入）
                if (currentPrice && currentPrice > 0) {
                    saveStockCurrentPrice(stockCode, currentPrice, true); // true = 手動輸入
                    // 更新投資總覽
                    updateInvestmentSummary();
                }
            });
        }
        
        // 初始計算未實現損益
        const savedPrice = getStockCurrentPrice(stockCode);
        const currentPrice = parseFloat(currentPriceInput?.value) || savedPrice || stockAvgCost;
        const unrealizedPnl = (currentPrice - stockAvgCost) * stockShares;
        const pnlEl = document.getElementById('metricUnrealizedPnl');
        if (pnlEl) {
            pnlEl.textContent = `${unrealizedPnl >= 0 ? '+' : ''}NT$${Math.abs(unrealizedPnl).toLocaleString('zh-TW')}`;
            pnlEl.className = `metric-value-large pnl ${unrealizedPnl >= 0 ? 'positive' : 'negative'}`;
        }
        
        // 更新記錄列表
        updateStockRecords(stockCode);
        
        // 初始化分頁切換
        initRecordTabs();
    }
}

// 初始化記錄分頁切換
function initRecordTabs() {
    document.querySelectorAll('.record-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.record-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabType = tab.dataset.tab;
            document.querySelectorAll('.record-list').forEach(list => {
                list.style.display = list.dataset.tab === tabType ? 'block' : 'none';
            });
        });
    });
}

// 更新個股記錄列表
function updateStockRecords(stockCode) {
    const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    const stockRecords = records.filter(r => r.stockCode === stockCode);
    
    // 買入記錄（按時間排序，越晚買的越前面）
    const buyRecords = stockRecords.filter(r => r.type === 'buy').sort((a, b) => {
        // 按時間戳降序排列（最新的在前）
        const timeA = new Date(a.timestamp || a.date || 0).getTime();
        const timeB = new Date(b.timestamp || b.date || 0).getTime();
        return timeB - timeA; // 降序：越晚的越前面
    });
    const buyList = document.getElementById('buyRecordList');
    if (buyList) {
        if (buyRecords.length === 0) {
            buyList.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">📈</div>
                    <div style="color: #999; margin-bottom: 8px; font-size: 16px;">尚無買入記錄</div>
                    <div style="font-size: 12px; color: #ccc; margin-bottom: 24px;">點擊下方按鈕開始記錄買入交易</div>
                    <button class="empty-state-btn" onclick="showInvestmentInputPage('buy')" style="
                        background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
                        color: white;
                        border: none;
                        padding: 12px 32px;
                        border-radius: 24px;
                        font-size: 15px;
                        font-weight: 500;
                        cursor: pointer;
                        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(76, 175, 80, 0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(76, 175, 80, 0.3)';">
                        ➕ 新增買入記錄
                    </button>
                </div>
            `;
        } else {
            buyList.innerHTML = buyRecords.map(r => createRecordCard(r)).join('');
        }

        bindRecordOverflowMenu(buyList);

        // 綁定買入標籤點擊事件：點「買入」直接帶上一筆資料到買入頁
        buyList.querySelectorAll('.record-card-type.buy').forEach(badge => {
            const newBadge = badge.cloneNode(true);
            badge.parentNode.replaceChild(newBadge, badge);
            newBadge.style.cursor = 'pointer';
            newBadge.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                playClickSound();

                const stockCode = newBadge.dataset.stockCode || '';
                const stockName = newBadge.dataset.stockName || '';
                const price = parseFloat(newBadge.dataset.price || '0') || 0;
                const shares = parseInt(newBadge.dataset.shares || '0', 10) || 0;
                const fee = parseFloat(newBadge.dataset.fee || '0') || 0;
                const isDCA = (newBadge.dataset.isdca || '') === '1';

                showInvestmentInputPage('buy');
                setTimeout(() => {
                    const codeInput = document.getElementById('calcStockCodeInput');
                    const nameInput = document.getElementById('calcStockNameInput');
                    const priceInput = document.getElementById('calcPriceInput');
                    const sharesInput = document.getElementById('calcSharesInput');
                    const feeInput = document.getElementById('calcFeeInput');
                    const autoFeeCheckbox = document.getElementById('calcAutoFeeCheckbox');
                    const isDCAInput = document.getElementById('calcIsDCAInput');

                    if (codeInput) {
                        codeInput.value = stockCode;
                        codeInput.dispatchEvent(new Event('input', { bubbles: true }));
                        codeInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    if (nameInput) {
                        nameInput.value = stockName;
                        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
                        nameInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }

                    if (priceInput) {
                        priceInput.value = price > 0 ? String(price) : '';
                        priceInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    if (sharesInput) {
                        sharesInput.value = shares > 0 ? String(shares) : '0';
                        sharesInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    if (autoFeeCheckbox) {
                        autoFeeCheckbox.checked = false;
                        autoFeeCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    if (feeInput) {
                        feeInput.disabled = false;
                        feeInput.style.opacity = '1';
                        feeInput.value = String(fee || 0);
                        feeInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    if (isDCAInput) {
                        isDCAInput.checked = isDCA;
                        isDCAInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }

                    if (typeof updateInvestmentDisplay === 'function') {
                        updateInvestmentDisplay();
                    }
                }, 120);
            });
        });
    }
    
    // 賣出記錄
    const sellRecords = stockRecords.filter(r => r.type === 'sell');
    const sellList = document.getElementById('sellRecordList');
    if (sellList) {
        // 永遠顯示「新增賣出記錄」按鈕
        let sellHtml = `
            <div class="dividend-add-btn-container">
                <button class="sell-quick-add-btn" data-stock-code="${stockCode}"
                    style="
                        display: flex; align-items: center; justify-content: center; gap: 8px;
                        width: 100%; padding: 12px 20px; margin-bottom: 12px;
                        background: linear-gradient(135deg, rgba(255,107,157,0.15) 0%, rgba(255,143,171,0.1) 100%);
                        border: 2px solid rgba(255,107,157,0.4); border-radius: 12px;
                        color: #ff6b9d; font-size: 14px; font-weight: 600; cursor: pointer;
                        transition: all 0.2s ease;
                    ">
                    <span>📉</span><span>新增賣出記錄</span>
                </button>
            </div>
        `;

        if (sellRecords.length === 0) {
            sellHtml += `
                <div class="empty-state" style="text-align: center; padding: 24px 40px;">
                    <div style="font-size: 40px; margin-bottom: 10px; opacity: 0.4;">📉</div>
                    <div style="color: #999; font-size: 15px;">尚無賣出記錄</div>
                </div>
            `;
        } else {
            sellHtml += sellRecords.map(r => createRecordCard(r)).join('');
        }

        sellList.innerHTML = sellHtml;

        // 綁定新增賣出按鈕
        const sellQuickAddBtn = sellList.querySelector('.sell-quick-add-btn');
        if (sellQuickAddBtn) {
            sellQuickAddBtn.addEventListener('click', () => {
                playClickSound();
                const code = sellQuickAddBtn.dataset.stockCode || stockCode;
                // 開啟賣出輸入頁並預填股票代碼
                showInvestmentInputPage('sell');
                setTimeout(() => {
                    const codeInput = document.getElementById('calcStockCodeInput');
                    const nameInput = document.getElementById('calcStockNameInput');
                    if (codeInput) {
                        codeInput.value = code;
                        codeInput.dispatchEvent(new Event('input', { bubbles: true }));
                        codeInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    if (nameInput && !nameInput.value) {
                        const name = typeof findStockName === 'function' ? findStockName(code) : code;
                        if (name) nameInput.value = name;
                    }
                    if (typeof updateCurrentSharesHint === 'function') updateCurrentSharesHint(code);
                    if (typeof updateInvestmentDisplay === 'function') updateInvestmentDisplay();
                }, 120);
            });
        }

        bindRecordOverflowMenu(sellList);
    }
    
    // 股息記錄（排序：最新在前）
    const dividendRecords = stockRecords
        .filter(r => r.type === 'dividend')
        .sort((a, b) => {
            const timeA = new Date(a.timestamp || a.date || 0).getTime();
            const timeB = new Date(b.timestamp || b.date || 0).getTime();
            return timeB - timeA;
        });
    const dividendList = document.getElementById('dividendRecordList');
    if (dividendList) {
        // 先取舊值以便重新渲染後保留使用者輸入
        const currentYearValue = (dividendList.querySelector('#dividendYearFilter') || {}).value || '';
        const yearTrimmed = currentYearValue.trim();
        const hasYearFilter = yearTrimmed.length > 0;
        const isYearValid = /^\d{4}$/.test(yearTrimmed);
        const yearKey = hasYearFilter && isYearValid ? yearTrimmed : null;
        const filteredDividend = hasYearFilter
            ? (isYearValid
                ? dividendRecords.filter(r => {
                    const exYear = String(r.exDividendDate || '').slice(0, 4);
                    return exYear === yearKey;
                })
                : [])
            : dividendRecords;

        const yearEscaped = (currentYearValue || '').replace(/"/g, '&quot;');

        let html = `
            <div class="record-search">
                <input type="text" id="dividendYearFilter" class="record-search-input" placeholder="除息年份（全部）" value="${yearEscaped}" aria-label="依除息年份篩選，例如 2024">
            </div>
            <div class="dividend-add-btn-container">
                <button class="dividend-quick-add-btn" data-stock-code="${stockCode}">
                    <span class="dividend-quick-add-icon">➕</span>
                    <span class="dividend-quick-add-text">新增股息</span>
                </button>
            </div>
        `;
        
        if (filteredDividend.length === 0) {
            html += `
                <div class="dividend-empty-state">
                    <div class="dividend-empty-icon">
                        <img src="./image/1.png" alt="股息" style="width: 83px; height: 83px; opacity: 0.5; object-fit: contain;">
                    </div>
                    <div class="dividend-empty-text">${hasYearFilter ? '該年份沒有除息日記錄' : '尚無股息記錄'}</div>
                    <div class="dividend-empty-hint">${hasYearFilter ? '請確認除息年份或清空篩選' : '點擊上方按鈕開始記錄股息'}</div>
                </div>
            `;
        } else {
            html += filteredDividend.map(r => createRecordCard(r)).join('');
        }
        
        dividendList.innerHTML = html;
        
        // 重新綁定新的輸入欄位
        const newYearInput = dividendList.querySelector('#dividendYearFilter');
        if (newYearInput && !newYearInput.dataset.bound) {
            const handleYearFilter = () => {
                const val = (newYearInput.value || '').trim();
                if (val === '' || /^\d{4}$/.test(val)) {
                    updateStockRecords(stockCode);
                }
            };
            newYearInput.addEventListener('change', handleYearFilter);
            newYearInput.addEventListener('input', handleYearFilter);
            newYearInput.dataset.bound = '1';
        }
        
        // 綁定快捷按鈕事件
        const quickAddBtn = dividendList.querySelector('.dividend-quick-add-btn');
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => {
                const stockCode = quickAddBtn.dataset.stockCode;
                const stockName = findStockName(stockCode) || stockCode;
                // 打開股息輸入頁面，預填股票代碼
                quickAddDividend(stockCode, stockName, 0, 0, 'cash');
            });
        }

        if (dividendRecords.length > 0) {
            bindRecordOverflowMenu(dividendList);

            // 綁定新增股息按鈕事件（卡片上的）
            dividendList.querySelectorAll('.record-add-dividend-fab').forEach(btn => {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);

                newBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const stockCode = newBtn.dataset.stockCode;
                    const stockName = newBtn.dataset.stockName;
                    const perShare = parseFloat(newBtn.dataset.perShare) || 0;
                    const shares = parseInt(newBtn.dataset.shares) || 0;
                    const dividendType = newBtn.dataset.dividendType || 'cash';
                    quickAddDividend(stockCode, stockName, perShare, shares, dividendType);
                });
            });
        }
    }
}

// 創建記錄卡片
function createRecordCard(record) {
    const recordId = record.timestamp || record.id || Date.now().toString();
    if (record.type === 'buy') {
        const price = record.price != null ? record.price : 0;
        const shares = record.shares || 0;
        const totalAmount = Math.ceil(price * shares + (record.fee || 0));
        const isDividendReinvest = record.isDividendReinvest === true;
        const isDCA = record.isDCA === true;
        return `
            <div class="record-card ${isDividendReinvest ? 'dividend-reinvest' : ''} ${isDCA ? 'dca-invest' : ''}" data-record-id="${recordId}">
                <div class="record-card-header">
                    <div class="record-card-headline">
                        <span class="record-card-type buy ${isDividendReinvest ? 'dividend-reinvest-badge' : ''} ${isDCA ? 'dca-badge' : ''}" data-stock-code="${record.stockCode || ''}" data-stock-name="${record.stockName || ''}" data-price="${price}" data-shares="${shares}" data-fee="${record.fee || 0}" data-isdca="${isDCA ? '1' : '0'}" title="再買一次">${isDividendReinvest ? '💰 股利購買' : isDCA ? '📅 定期定額' : '📈 買入'}</span>
                        <span class="record-card-date">${record.date}</span>
                    </div>
                    ${renderRecordActionButtons(recordId)}
                </div>
                <div class="record-card-details">
                    <div>價格：NT$${price.toFixed(2)}</div>
                    <div>股數：${record.shares || 0} 股</div>
                    <div>手續費：NT$${(record.fee || 0).toLocaleString('zh-TW')}</div>
                    ${isDCA ? '<div class="dca-label">📅 定期定額</div>' : ''}
                    ${isDividendReinvest ? '<div class="dividend-reinvest-label">💎 股利再投入</div>' : ''}
                </div>
                <div class="record-card-amount">投入金額：NT$${(totalAmount != null ? totalAmount : 0).toLocaleString('zh-TW')}</div>
            </div>
        `;
    } else if (record.type === 'sell') {
        const price = record.price != null ? record.price : 0;
        const shares = record.shares || 0;
        const totalAmount = price * shares - (record.fee || 0) - (record.tax || 0);
        return `
            <div class="record-card" data-record-id="${recordId}">
                <div class="record-card-header">
                    <div class="record-card-headline">
                        <span class="record-card-type sell">🔻 賣出</span>
                        <span class="record-card-date">${record.date}</span>
                    </div>
                    ${renderRecordActionButtons(recordId)}
                </div>
                <div class="record-card-details">
                    <div>價格：NT$${price.toFixed(2)}</div>
                    <div>股數：${shares} 股</div>
                    <div>手續費：NT$${(record.fee || 0).toLocaleString('zh-TW')}</div>
                    <div>證交稅：NT$${(record.tax || 0).toLocaleString('zh-TW')}</div>
                </div>
                <div class="record-card-amount">實收金額：NT$${(totalAmount != null ? totalAmount : 0).toLocaleString('zh-TW')}</div>
                <div class="record-card-amount ${(record.realizedPnl || 0) >= 0 ? 'positive' : 'negative'}">
                    實現損益：${(record.realizedPnl || 0) >= 0 ? '+' : ''}NT$${(record.realizedPnl != null ? record.realizedPnl : 0).toLocaleString('zh-TW')}
                </div>
            </div>
        `;
    } else if (record.type === 'dividend') {
        const exMonth = record.exDividendDate ? record.exDividendDate.slice(0, 7) : '';
        const payMonth = record.date ? String(record.date).slice(0, 7) : '';
        return `
            <div class="record-card" data-record-id="${recordId}">
                <div class="record-card-header">
                    <div class="record-card-headline">
                        <span class="record-card-type dividend">${record.dividendType === 'cash' ? '💰 現金股利' : '🪙 股票股利'}</span>
                        <span class="record-card-date">${record.date}</span>
                    </div>
                    ${renderRecordActionButtons(recordId)}
                </div>
                <div class="record-card-details">
                    <div>每股：NT$${(record.perShare != null ? record.perShare : 0).toFixed(2)}</div>
                    <div>股數：${record.shares || 0} 股</div>
                    ${record.exDividendDate ? `<div>除息日：${record.exDividendDate}</div>` : ''}
                    ${record.date ? `<div>領息日：${record.date}</div>` : ''}
                    ${record.historicalPerShare ? `<div>過去每股：NT$${Number(record.historicalPerShare).toFixed(2)}</div>` : ''}
                    ${record.reinvest ? '<div>再投入 ✓</div>' : ''}
                </div>
                <div class="record-card-amount">實收金額：NT$${(record.amount != null ? record.amount : 0).toLocaleString('zh-TW')}</div>
            </div>
        `;
    }
    return '';
}

// 刪除投資記錄
function deleteInvestmentRecord(recordId) {
    let records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    
    // 嘗試多種方式匹配記錄ID
    const recordIdStr = String(recordId);
    let recordIndex = -1;
    
    // 先嘗試精確匹配
    recordIndex = records.findIndex(r => {
        const rTimestamp = r.timestamp ? String(r.timestamp) : null;
        const rId = r.id ? String(r.id) : null;
        return (rTimestamp === recordIdStr) || (rId === recordIdStr);
    });
    
    if (recordIndex === -1) {
        // 如果還是找不到，嘗試更寬鬆的匹配
        recordIndex = records.findIndex(r => {
            const rTimestamp = r.timestamp ? String(r.timestamp) : '';
            const rId = r.id ? String(r.id) : '';
            return rTimestamp.includes(recordIdStr) || rId.includes(recordIdStr);
        });
    }
    
    if (recordIndex === -1) {
        alert('找不到該記錄，請重新整理頁面後再試。');
        return;
    }
    
    const record = records[recordIndex];
    
    // 確認刪除
    const recordType = record.type === 'dividend' 
        ? (record.dividendType === 'cash' ? '現金股利' : '股票股利')
        : record.type === 'buy' ? '買入' : '賣出';
    
    if (!confirm(`確定要刪除此筆${recordType}記錄嗎？\n\n股票代碼：${record.stockCode}\n日期：${record.date}\n\n此操作無法復原。`)) {
        return;
    }
    
    // 保存股票代碼（用於後續更新）
    const stockCode = record.stockCode;
    
    // 如果刪除的是股利記錄，同時刪除關聯的買入記錄（股利再投入）
    let deletedBuyRecords = [];
    if (record.type === 'dividend') {
        const dividendTimestamp = record.timestamp || record.id;
        if (dividendTimestamp) {
            // 找到所有關聯的買入記錄（通過 dividendRecordId）
            // 使用字符串比較確保匹配
            const dividendTimestampStr = String(dividendTimestamp);
            deletedBuyRecords = records.filter(r => {
                if (r.type === 'buy' && r.isDividendReinvest === true && r.dividendRecordId) {
                    const rDividendId = String(r.dividendRecordId);
                    return rDividendId === dividendTimestampStr;
                }
                return false;
            });
            
            // 從記錄中移除這些買入記錄
            if (deletedBuyRecords.length > 0) {
                const deletedIds = deletedBuyRecords.map(r => {
                    const id = r.timestamp || r.id;
                    return id ? String(id) : null;
                }).filter(id => id !== null);
                
                // 重新計算 recordIndex（因為過濾後索引可能改變）
                records = records.filter(r => {
                    const rId = r.timestamp || r.id;
                    const rIdStr = rId ? String(rId) : null;
                    return !rIdStr || !deletedIds.includes(rIdStr);
                });
                
                // 重新查找股利記錄的索引（因為過濾後索引可能改變）
                recordIndex = records.findIndex(r => {
                    const rTimestamp = r.timestamp ? String(r.timestamp) : null;
                    const rId = r.id ? String(r.id) : null;
                    return (rTimestamp === recordIdStr) || (rId === recordIdStr);
                });
                
                console.log(`找到 ${deletedBuyRecords.length} 筆關聯的股利再投入買入記錄，準備刪除`);
            }
        }
    }
    
    // 從陣列中刪除記錄（先刪除關聯的買入記錄，再刪除股利記錄本身）
    if (recordIndex !== -1) {
    records.splice(recordIndex, 1);
    }
    
    // 如果刪除的是定期定額記錄，減少該計劃的執行次數
    if (record.isDCA && record.dcaPlanId) {
        try {
            const dcaPlans = JSON.parse(localStorage.getItem('dcaPlans') || '[]');
            const planIndex = dcaPlans.findIndex(p => p.id === record.dcaPlanId);
            if (planIndex !== -1) {
                const plan = dcaPlans[planIndex];
                const currentCount = parseInt(plan.executedCount, 10) || 0;
                if (currentCount > 0) {
                    dcaPlans[planIndex].executedCount = currentCount - 1;
                    localStorage.setItem('dcaPlans', JSON.stringify(dcaPlans));
                    console.log(`定期定額計劃 ${plan.stockCode} 執行次數已減少為 ${currentCount - 1}`);
                    
                    // 更新定期定額列表顯示
                    if (typeof updateDCAList === 'function') {
                        updateDCAList();
                    }
                }
            }
        } catch (e) {
            console.warn('更新定期定額執行次數失敗:', e);
        }
    }
    
    // 保存到 localStorage
    try {
        // 先確保投資記錄一定能成功刪除與保存
        localStorage.setItem('investmentRecords', JSON.stringify(records));
        console.log('記錄已刪除，ID:', recordIdStr);

        // 再嘗試刪除記帳本中關聯的「轉帳」紀錄（買入才會建立 linkedInvestment 轉帳）
        try {
            const deletedInvestmentIds = [];
            const mainDeletedId = record.timestamp || record.id;
            if (mainDeletedId) deletedInvestmentIds.push(String(mainDeletedId));
            if (deletedBuyRecords.length > 0) {
                deletedBuyRecords.forEach(r => {
                    const id = r.timestamp || r.id;
                    if (id) deletedInvestmentIds.push(String(id));
                });
            }

            if (deletedInvestmentIds.length > 0) {
                let accountingRecords;
                try {
                    accountingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
                    if (!Array.isArray(accountingRecords)) accountingRecords = [];
                } catch (e) {
                    accountingRecords = [];
                }

                const beforeLen = accountingRecords.length;
                accountingRecords = accountingRecords.filter(ar => {
                    if (!ar) return false;
                    if (ar.type !== 'transfer') return true;
                    if (ar.linkedInvestment !== true) return true;
                    const invId = ar.investmentRecordId != null ? String(ar.investmentRecordId) : '';
                    return !deletedInvestmentIds.includes(invId);
                });
                if (accountingRecords.length !== beforeLen) {
                    localStorage.setItem('accountingRecords', JSON.stringify(accountingRecords));
                }

                // 若記帳本頁面有開著，刷新顯示（避免刷新報錯導致整個刪除失敗）
                try {
                    if (typeof updateLedgerSummary === 'function') {
                        updateLedgerSummary(accountingRecords);
                    }
                    if (typeof displayLedgerTransactions === 'function') {
                        displayLedgerTransactions(accountingRecords);
                    }
                } catch (e) {
                    console.warn('刷新記帳本顯示失敗（不影響刪除）:', e);
                }
            }
        } catch (e) {
            console.warn('連動刪除轉帳失敗（不影響刪除）:', e);
        }
        
        // 如果有刪除關聯的買入記錄，顯示提示
        if (deletedBuyRecords.length > 0) {
            console.log(`同時刪除了 ${deletedBuyRecords.length} 筆關聯的股利再投入買入記錄`);
        }
        
        // 更新所有相關顯示
        updateInvestmentSummary();
        updatePortfolioList();
        updateInvestmentRecords();
        updateStockRecords(stockCode);
        
        // 檢查是否正在查看股票詳情頁面，如果是則重新顯示
        const stockDetailPage = document.getElementById('stockDetailPage');
        if (stockDetailPage && stockDetailPage.style.display !== 'none') {
            showStockDetailPage(stockCode);
        }
        
        // 顯示刪除成功的提示
        if (deletedBuyRecords.length > 0) {
            alert(`記錄已刪除！\n\n同時刪除了 ${deletedBuyRecords.length} 筆關聯的股利再投入買入記錄。`);
        } else {
        alert('記錄已刪除！');
        }
    } catch (error) {
        console.error('刪除記錄失敗:', error);
        alert('刪除記錄時發生錯誤，請重試。');
    }
}

// 編輯投資記錄
function editInvestmentRecord(recordId) {
    console.log('編輯記錄，ID:', recordId, '類型:', typeof recordId);
    const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    console.log('所有記錄數量:', records.length);
    
    // 嘗試多種方式匹配記錄ID（統一轉換為字符串比較）
    const recordIdStr = String(recordId);
    let record = null;
    
    // 先嘗試精確匹配
    record = records.find(r => {
        const rTimestamp = r.timestamp ? String(r.timestamp) : null;
        const rId = r.id ? String(r.id) : null;
        return (rTimestamp === recordIdStr) || (rId === recordIdStr);
    });
    
    // 如果還是找不到，嘗試更寬鬆的匹配
    if (!record) {
        record = records.find(r => {
            const rTimestamp = r.timestamp ? String(r.timestamp) : '';
            const rId = r.id ? String(r.id) : '';
            return rTimestamp.includes(recordIdStr) || rId.includes(recordIdStr);
        });
    }
    
    console.log('找到的記錄:', record);
    
    if (!record) {
        console.error('找不到記錄，嘗試的ID:', recordIdStr);
        console.error('記錄列表中的ID範例:', records.slice(0, 3).map(r => ({
            timestamp: r.timestamp,
            id: r.id,
            type: r.type
        })));
        alert('找不到該記錄，請重新整理頁面後再試。\n記錄ID: ' + recordIdStr);
        return;
    }
    
    // 根據記錄類型顯示對應的編輯表單
    if (record.type === 'buy') {
        showEditBuyRecordModal(record);
    } else if (record.type === 'sell') {
        showEditSellRecordModal(record);
    } else if (record.type === 'dividend') {
        showEditDividendRecordModal(record);
    } else {
        alert('未知的記錄類型: ' + record.type);
    }
}

// 顯示編輯買入記錄模態框
function showEditBuyRecordModal(record) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div class="modal-content-standard" style="max-width: 500px; width: 90%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0;">編輯買入記錄</h2>
                <button class="modal-close-btn" style="background: none; border: none; font-size: 24px; color: var(--text-tertiary); cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">✕</button>
            </div>
            <div class="form-field">
                <label class="form-label">股票代碼</label>
                <input type="text" id="editBuyStockCode" class="form-input" value="${record.stockCode || ''}" placeholder="例如: 2330">
            </div>
            <div class="form-field">
                <label class="form-label">買入日期</label>
                <input type="date" id="editBuyDate" class="form-input" value="${record.date || ''}">
            </div>
            <div class="form-field">
                <label class="form-label">買入價格</label>
                <input type="number" id="editBuyPrice" class="form-input" value="${record.price != null && record.price !== '' ? String(record.price) : ''}" step="0.01" min="0" placeholder="0.00">
            </div>
            <div class="form-field">
                <label class="form-label">股數</label>
                <input type="number" id="editBuyShares" class="form-input" value="${record.shares != null && record.shares !== '' ? String(record.shares) : ''}" step="1" min="1" placeholder="0">
            </div>
            <div class="form-field">
                <label class="form-label">手續費</label>
                <input type="number" id="editBuyFee" class="form-input" value="${record.fee || 0}" step="0.01" placeholder="0.00">
            </div>
            <div class="form-field">
                <label class="form-checkbox-label">
                    <input type="checkbox" id="editBuyIsDCA" class="form-checkbox" ${record.isDCA ? 'checked' : ''}>
                    <span class="form-checkbox-text">定期定額</span>
                </label>
            </div>
            <div class="form-field">
                <label class="form-label">備註</label>
                <input type="text" id="editBuyNote" class="form-input" value="${record.note || ''}" placeholder="選填">
            </div>
            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button id="editBuyCancelBtn" class="form-delete-btn" style="flex: 1;">取消</button>
                <button id="editBuySaveBtn" class="form-submit-btn" style="flex: 2;">儲存</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 確保輸入框可以正常編輯（延遲設置，確保DOM已渲染）
    setTimeout(() => {
        const priceInput = document.getElementById('editBuyPrice');
        const sharesInput = document.getElementById('editBuyShares');
        const feeInput = document.getElementById('editBuyFee');
        if (priceInput) {
            priceInput.removeAttribute('readonly');
            priceInput.removeAttribute('disabled');
            priceInput.style.pointerEvents = 'auto';
            priceInput.style.userSelect = 'auto';
            priceInput.style.webkitUserSelect = 'auto';
            priceInput.readOnly = false;
            priceInput.disabled = false;
        }
        if (sharesInput) {
            sharesInput.removeAttribute('readonly');
            sharesInput.removeAttribute('disabled');
            sharesInput.style.pointerEvents = 'auto';
            sharesInput.style.userSelect = 'auto';
            sharesInput.style.webkitUserSelect = 'auto';
            sharesInput.readOnly = false;
            sharesInput.disabled = false;
        }
        if (feeInput) {
            feeInput.removeAttribute('readonly');
            feeInput.removeAttribute('disabled');
            feeInput.style.pointerEvents = 'auto';
            feeInput.readOnly = false;
            feeInput.disabled = false;
        }
    }, 100);
    
    // 關閉按鈕
    modal.querySelector('.modal-close-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#editBuyCancelBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 保存按鈕
    modal.querySelector('#editBuySaveBtn').addEventListener('click', () => {
        const stockCode = document.getElementById('editBuyStockCode').value.trim();
        const date = document.getElementById('editBuyDate').value;
        const priceInput = document.getElementById('editBuyPrice');
        const sharesInput = document.getElementById('editBuyShares');
        const price = parseFloat(priceInput ? priceInput.value : 0);
        const shares = parseInt(sharesInput ? sharesInput.value : 0);
        const fee = parseFloat(document.getElementById('editBuyFee').value) || 0;
        const isDCA = document.getElementById('editBuyIsDCA').checked;
        const note = document.getElementById('editBuyNote').value.trim();
        
        console.log('編輯買入記錄 - 輸入值:', { stockCode, date, price, shares, fee, isDCA, note });
        
        if (!stockCode || !date || !price || !shares) {
            alert('請填寫所有必填欄位\n\n股票代碼: ' + (stockCode || '未填寫') + '\n日期: ' + (date || '未填寫') + '\n價格: ' + (price || '未填寫') + '\n股數: ' + (shares || '未填寫'));
            return;
        }
        
        if (price <= 0 || shares <= 0) {
            alert('價格和股數必須大於0\n\n價格: ' + price + '\n股數: ' + shares);
            return;
        }
        
        if (isNaN(price) || isNaN(shares)) {
            alert('價格和股數必須是有效的數字\n\n價格: ' + (priceInput ? priceInput.value : 'N/A') + '\n股數: ' + (sharesInput ? sharesInput.value : 'N/A'));
            return;
        }
        
        // 更新記錄
        try {
        const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
            // 使用多種方式匹配記錄ID
            const recordId = record.timestamp || record.id;
            const recordIdStr = String(recordId);
            console.log('嘗試更新記錄，ID:', recordIdStr, '原始記錄:', record);
            
            const index = records.findIndex(r => {
                const rTimestamp = r.timestamp ? String(r.timestamp) : null;
                const rId = r.id ? String(r.id) : null;
                return (rTimestamp === recordIdStr) || (rId === recordIdStr);
            });
            
            console.log('找到的記錄索引:', index, '總記錄數:', records.length);
            
        if (index !== -1) {
                // 保留原始記錄的所有屬性，只更新修改的欄位
                const updatedRecord = {
                ...records[index],
                stockCode: stockCode,
                date: date,
                price: price,
                shares: shares,
                fee: fee,
                isDCA: isDCA,
                    note: note,
                    // 確保保留原始ID
                    timestamp: records[index].timestamp || record.timestamp,
                    id: records[index].id || record.id
            };
                
                records[index] = updatedRecord;
                
                // 嘗試保存到 localStorage
                try {
            localStorage.setItem('investmentRecords', JSON.stringify(records));
            
                    // 立即更新顯示，不使用延遲
                    const oldStockCode = record.stockCode;
                    
                    // 更新核心數據
            updateInvestmentSummary();
            updatePortfolioList();
            updateInvestmentRecords();
                    
                    // 如果股票代碼改變了，需要更新兩個股票的顯示
                    if (oldStockCode !== stockCode) {
                        updateStockRecords(oldStockCode);
                        updateStockRecords(stockCode);
                    } else {
                        updateStockRecords(stockCode);
                    }
                    
                    // 檢查是否正在查看股票詳情頁面，如果是則重新顯示（重新計算所有數據）
                    const stockDetailPage = document.getElementById('stockDetailPage');
                    if (stockDetailPage && stockDetailPage.style.display !== 'none') {
                        // 重新計算持股數據並更新詳情頁面
                        const portfolio = getPortfolio();
                        const updatedStock = portfolio.find(s => s.stockCode === stockCode);
                        if (updatedStock) {
                            showStockDetailPage(stockCode);
                        }
                    }
                    
            updateInvestmentOverview();
            
            document.body.removeChild(modal);
            alert('記錄已更新！');
                } catch (storageError) {
                    console.error('localStorage 保存失敗:', storageError);
                    if (storageError.name === 'QuotaExceededError') {
                        alert('存儲空間不足，無法保存記錄。請刪除一些舊記錄後再試。');
                    } else {
                        alert('保存失敗：' + storageError.message);
                    }
                }
            } else {
                console.error('找不到記錄，ID:', recordIdStr);
                console.error('記錄列表中的ID範例:', records.slice(0, 3).map(r => ({
                    timestamp: r.timestamp,
                    id: r.id,
                    type: r.type,
                    stockCode: r.stockCode
                })));
                alert('找不到要更新的記錄，請重新整理頁面後再試。\n記錄ID: ' + recordIdStr);
            }
        } catch (error) {
            console.error('更新記錄時發生錯誤:', error);
            alert('更新記錄時發生錯誤：' + error.message);
        }
    });
}

// 顯示編輯賣出記錄模態框
function showEditSellRecordModal(record) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div class="modal-content-standard" style="max-width: 500px; width: 90%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0;">編輯賣出記錄</h2>
                <button class="modal-close-btn" style="background: none; border: none; font-size: 24px; color: var(--text-tertiary); cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">✕</button>
            </div>
            <div class="form-field">
                <label class="form-label">股票代碼</label>
                <input type="text" id="editSellStockCode" class="form-input" value="${record.stockCode || ''}" placeholder="例如: 2330">
            </div>
            <div class="form-field">
                <label class="form-label">賣出日期</label>
                <input type="date" id="editSellDate" class="form-input" value="${record.date || ''}">
            </div>
            <div class="form-field">
                <label class="form-label">賣出價格</label>
                <input type="number" id="editSellPrice" class="form-input" value="${record.price != null && record.price !== '' ? String(record.price) : ''}" step="0.01" min="0" placeholder="0.00">
            </div>
            <div class="form-field">
                <label class="form-label">股數</label>
                <input type="number" id="editSellShares" class="form-input" value="${record.shares != null && record.shares !== '' ? String(record.shares) : ''}" step="1" min="1" placeholder="0">
            </div>
            <div class="form-field">
                <label class="form-label">手續費</label>
                <input type="number" id="editSellFee" class="form-input" value="${record.fee || 0}" step="0.01" placeholder="0.00">
            </div>
            <div class="form-field">
                <label class="form-label">證交稅</label>
                <input type="number" id="editSellTax" class="form-input" value="${record.tax || 0}" step="0.01" placeholder="0.00">
            </div>
            <div class="form-field">
                <label class="form-label">備註</label>
                <input type="text" id="editSellNote" class="form-input" value="${record.note || ''}" placeholder="選填">
            </div>
            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button id="editSellCancelBtn" class="form-delete-btn" style="flex: 1;">取消</button>
                <button id="editSellSaveBtn" class="form-submit-btn" style="flex: 2;">儲存</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 確保輸入框可以正常編輯（延遲設置，確保DOM已渲染）
    setTimeout(() => {
        const priceInput = document.getElementById('editSellPrice');
        const sharesInput = document.getElementById('editSellShares');
        const feeInput = document.getElementById('editSellFee');
        const taxInput = document.getElementById('editSellTax');
        if (priceInput) {
            priceInput.removeAttribute('readonly');
            priceInput.removeAttribute('disabled');
            priceInput.style.pointerEvents = 'auto';
            priceInput.style.userSelect = 'auto';
            priceInput.style.webkitUserSelect = 'auto';
            priceInput.readOnly = false;
            priceInput.disabled = false;
        }
        if (sharesInput) {
            sharesInput.removeAttribute('readonly');
            sharesInput.removeAttribute('disabled');
            sharesInput.style.pointerEvents = 'auto';
            sharesInput.style.userSelect = 'auto';
            sharesInput.style.webkitUserSelect = 'auto';
            sharesInput.readOnly = false;
            sharesInput.disabled = false;
        }
        if (feeInput) {
            feeInput.removeAttribute('readonly');
            feeInput.removeAttribute('disabled');
            feeInput.style.pointerEvents = 'auto';
            feeInput.readOnly = false;
            feeInput.disabled = false;
        }
        if (taxInput) {
            taxInput.removeAttribute('readonly');
            taxInput.removeAttribute('disabled');
            taxInput.style.pointerEvents = 'auto';
            taxInput.readOnly = false;
            taxInput.disabled = false;
        }
    }, 100);
    
    // 關閉按鈕
    modal.querySelector('.modal-close-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#editSellCancelBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 保存按鈕
    modal.querySelector('#editSellSaveBtn').addEventListener('click', () => {
        playClickSound(); // 播放點擊音效
        const stockCode = document.getElementById('editSellStockCode').value.trim();
        const date = document.getElementById('editSellDate').value;
        const price = parseFloat(document.getElementById('editSellPrice').value);
        const shares = parseInt(document.getElementById('editSellShares').value);
        const fee = parseFloat(document.getElementById('editSellFee').value) || 0;
        const tax = parseFloat(document.getElementById('editSellTax').value) || 0;
        const note = document.getElementById('editSellNote').value.trim();
        
        if (!stockCode || !date || !price || !shares) {
            alert('請填寫所有必填欄位');
            return;
        }
        
        if (price <= 0 || shares <= 0) {
            alert('價格和股數必須大於0');
            return;
        }
        
        // 重新計算實現損益
        const portfolio = getPortfolio();
        const stock = portfolio.find(s => s.stockCode === stockCode);
        let realizedPnl = record.realizedPnl || 0;
        
        if (stock) {
            const avgCost = stock.avgCost;
            const totalCost = avgCost * shares;
            const totalAmount = price * shares;
            const totalRevenue = totalAmount - fee - tax;
            realizedPnl = totalRevenue - totalCost;
        }
        
        // 更新記錄
        try {
        const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
            // 使用多種方式匹配記錄ID
            const recordId = record.timestamp || record.id;
            const recordIdStr = String(recordId);
            console.log('嘗試更新賣出記錄，ID:', recordIdStr, '原始記錄:', record);
            
            const index = records.findIndex(r => {
                const rTimestamp = r.timestamp ? String(r.timestamp) : null;
                const rId = r.id ? String(r.id) : null;
                return (rTimestamp === recordIdStr) || (rId === recordIdStr);
            });
            
            console.log('找到的記錄索引:', index, '總記錄數:', records.length);
            
        if (index !== -1) {
                // 保留原始記錄的所有屬性，只更新修改的欄位
                const updatedRecord = {
                ...records[index],
                stockCode: stockCode,
                date: date,
                price: price,
                shares: shares,
                fee: fee,
                tax: tax,
                note: note,
                    realizedPnl: realizedPnl,
                    // 確保保留原始ID
                    timestamp: records[index].timestamp || record.timestamp,
                    id: records[index].id || record.id
            };
                
                records[index] = updatedRecord;
                
                // 嘗試保存到 localStorage
                try {
            localStorage.setItem('investmentRecords', JSON.stringify(records));
            
                    // 立即更新顯示，不使用延遲
                    const oldStockCode = record.stockCode;
                    
                    // 更新核心數據
            updateInvestmentSummary();
            updatePortfolioList();
            updateInvestmentRecords();
                    
                    // 如果股票代碼改變了，需要更新兩個股票的顯示
                    if (oldStockCode !== stockCode) {
                        updateStockRecords(oldStockCode);
                        updateStockRecords(stockCode);
                    } else {
                        updateStockRecords(stockCode);
                    }
                    
                    // 檢查是否正在查看股票詳情頁面，如果是則重新顯示（重新計算所有數據）
                    const stockDetailPage = document.getElementById('stockDetailPage');
                    if (stockDetailPage && stockDetailPage.style.display !== 'none') {
                        // 重新計算持股數據並更新詳情頁面
                        const portfolio = getPortfolio();
                        const updatedStock = portfolio.find(s => s.stockCode === stockCode);
                        if (updatedStock) {
                            showStockDetailPage(stockCode);
                        }
                    }
                    
            updateInvestmentOverview();
            
            document.body.removeChild(modal);
            alert('記錄已更新！');
                } catch (storageError) {
                    console.error('localStorage 保存失敗:', storageError);
                    if (storageError.name === 'QuotaExceededError') {
                        alert('存儲空間不足，無法保存記錄。請刪除一些舊記錄後再試。');
                    } else {
                        alert('保存失敗：' + storageError.message);
                    }
                }
            } else {
                console.error('找不到記錄，ID:', recordIdStr);
                console.error('記錄列表中的ID範例:', records.slice(0, 3).map(r => ({
                    timestamp: r.timestamp,
                    id: r.id,
                    type: r.type,
                    stockCode: r.stockCode
                })));
                alert('找不到要更新的記錄，請重新整理頁面後再試。\n記錄ID: ' + recordIdStr);
            }
        } catch (error) {
            console.error('更新記錄時發生錯誤:', error);
            alert('更新記錄時發生錯誤：' + error.message);
        }
    });
}

// 顯示編輯股息記錄模態框
function showEditDividendRecordModal(record) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div class="modal-content-standard" style="max-width: 500px; width: 90%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0;">編輯股息記錄</h2>
                <button class="modal-close-btn" style="background: none; border: none; font-size: 24px; color: var(--text-tertiary); cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">✕</button>
            </div>
            <div class="form-field">
                <label class="form-label">股票代碼</label>
                <input type="text" id="editDividendStockCode" class="form-input" value="${record.stockCode || ''}" placeholder="例如: 2330">
            </div>
            <div class="form-field">
                <label class="form-label">股票名稱（選填）</label>
                <input type="text" id="editDividendStockName" class="form-input" value="${record.stockName || ''}" placeholder="例如: 台積電">
            </div>
            <div class="form-field">
                <label class="form-label">股息日期</label>
                <input type="date" id="editDividendDate" class="form-input" value="${record.date || ''}">
            </div>
            <div class="form-field">
                <label class="form-label">除息日（選填）</label>
                <input type="date" id="editDividendExDate" class="form-input" value="${record.exDividendDate || ''}">
            </div>
            <div class="form-field">
                <label class="form-label">股息類型</label>
                <select id="editDividendType" class="form-input">
                    <option value="cash" ${record.dividendType === 'cash' ? 'selected' : ''}>現金股利</option>
                    <option value="stock" ${record.dividendType === 'stock' ? 'selected' : ''}>股票股利</option>
                </select>
            </div>
            <div class="form-field">
                <label class="form-label">每股金額</label>
                <input type="number" id="editDividendPerShare" class="form-input" value="${record.perShare != null && record.perShare !== '' ? String(record.perShare) : ''}" step="0.01" min="0" placeholder="0.00">
            </div>
            <div class="form-field">
                <label class="form-label">歷史每股金額（選填）</label>
                <input type="number" id="editDividendHistoricalPerShare" class="form-input" value="${record.historicalPerShare != null && record.historicalPerShare !== '' ? String(record.historicalPerShare) : ''}" step="0.01" min="0" placeholder="0.00">
            </div>
            <div class="form-field">
                <label class="form-label">股數</label>
                <input type="number" id="editDividendShares" class="form-input" value="${record.shares != null && record.shares !== '' ? String(record.shares) : ''}" step="1" min="1" placeholder="0">
            </div>
            <div class="form-field">
                <label class="form-label">實收金額</label>
                <input type="number" id="editDividendAmount" class="form-input" value="${record.amount != null && record.amount !== '' ? String(record.amount) : ''}" step="0.01" min="0" placeholder="0.00">
            </div>
            <div class="form-field">
                <label class="form-label">手續費（選填）</label>
                <input type="number" id="editDividendFee" class="form-input" value="${record.fee != null && record.fee !== '' ? String(record.fee) : '0'}" step="0.01" min="0" placeholder="0.00">
                <div style="font-size: 12px; color: var(--text-tertiary); margin-top: 4px;">股息入帳時可能產生的手續費</div>
            </div>
            <div class="form-field">
                <label class="form-checkbox-label">
                    <input type="checkbox" id="editDividendReinvest" class="form-checkbox" ${record.reinvest ? 'checked' : ''}>
                    <span class="form-checkbox-text">再投入</span>
                </label>
            </div>
            <div class="form-field">
                <label class="form-label">備註</label>
                <input type="text" id="editDividendNote" class="form-input" value="${record.note || ''}" placeholder="選填">
            </div>
            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button id="editDividendCancelBtn" class="form-delete-btn" style="flex: 1;">取消</button>
                <button id="editDividendSaveBtn" class="form-submit-btn" style="flex: 2;">儲存</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 確保輸入框可以正常編輯（延遲設置，確保DOM已渲染）
    setTimeout(() => {
        const perShareInput = document.getElementById('editDividendPerShare');
        const sharesInput = document.getElementById('editDividendShares');
        const amountInput = document.getElementById('editDividendAmount');
        const feeInput = document.getElementById('editDividendFee');
        if (perShareInput) {
            perShareInput.removeAttribute('readonly');
            perShareInput.removeAttribute('disabled');
            perShareInput.style.pointerEvents = 'auto';
            perShareInput.style.userSelect = 'auto';
            perShareInput.style.webkitUserSelect = 'auto';
            perShareInput.readOnly = false;
            perShareInput.disabled = false;
        }
        if (sharesInput) {
            sharesInput.removeAttribute('readonly');
            sharesInput.removeAttribute('disabled');
            sharesInput.style.pointerEvents = 'auto';
            sharesInput.style.userSelect = 'auto';
            sharesInput.style.webkitUserSelect = 'auto';
            sharesInput.readOnly = false;
            sharesInput.disabled = false;
        }
        if (amountInput) {
            amountInput.removeAttribute('readonly');
            amountInput.removeAttribute('disabled');
            amountInput.style.pointerEvents = 'auto';
            amountInput.style.userSelect = 'auto';
            amountInput.style.webkitUserSelect = 'auto';
            amountInput.readOnly = false;
            amountInput.disabled = false;
        }
        if (feeInput) {
            feeInput.removeAttribute('readonly');
            feeInput.removeAttribute('disabled');
            feeInput.style.pointerEvents = 'auto';
            feeInput.style.userSelect = 'auto';
            feeInput.style.webkitUserSelect = 'auto';
            feeInput.readOnly = false;
            feeInput.disabled = false;
        }
    }, 100);
    
    // 關閉按鈕
    modal.querySelector('.modal-close-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#editDividendCancelBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 保存按鈕
    modal.querySelector('#editDividendSaveBtn').addEventListener('click', () => {
        playClickSound(); // 播放點擊音效
        const stockCode = document.getElementById('editDividendStockCode').value.trim();
        const stockNameFromInput = document.getElementById('editDividendStockName')?.value?.trim() || '';
        const date = document.getElementById('editDividendDate').value;
        const dividendType = document.getElementById('editDividendType').value;
        const perShare = parseFloat(document.getElementById('editDividendPerShare').value);
        const shares = parseInt(document.getElementById('editDividendShares').value);
        const amount = parseFloat(document.getElementById('editDividendAmount').value);
        const fee = parseFloat(document.getElementById('editDividendFee')?.value) || 0;
        const reinvest = document.getElementById('editDividendReinvest').checked;
        const note = document.getElementById('editDividendNote').value.trim();
        const stockName = stockNameFromInput || (typeof findStockName === 'function' ? (findStockName(stockCode) || '') : '') || stockCode;
        const historicalPerShare = parseFloat(document.getElementById('editDividendHistoricalPerShare')?.value) || null;
        const exDividendDate = document.getElementById('editDividendExDate')?.value || '';
        
        if (!stockCode || !date || perShare <= 0 || shares <= 0 || amount <= 0) {
            alert('請填寫所有必填欄位');
            return;
        }
        
        // 更新記錄
        try {
        const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
            // 使用多種方式匹配記錄ID
            const recordId = record.timestamp || record.id;
            const recordIdStr = String(recordId);
            console.log('嘗試更新股息記錄，ID:', recordIdStr, '原始記錄:', record);
            
            const index = records.findIndex(r => {
                const rTimestamp = r.timestamp ? String(r.timestamp) : null;
                const rId = r.id ? String(r.id) : null;
                return (rTimestamp === recordIdStr) || (rId === recordIdStr);
            });
            
            console.log('找到的記錄索引:', index, '總記錄數:', records.length);
            
        if (index !== -1) {
                // 保留原始記錄的所有屬性，只更新修改的欄位
                const updatedRecord = {
                    ...record,
                    type: 'dividend',
                    stockCode: stockCode,
                    stockName: stockName,
                    date: date,
                    exDividendDate: exDividendDate,
                    dividendType: dividendType || 'cash',
                    perShare: perShare,
                    historicalPerShare: historicalPerShare,
                    shares: shares,
                    amount: amount,
                    fee: fee,
                    reinvest: reinvest,
                    note: note
                };
                
                records[index] = updatedRecord;

                // 編輯股息時同步「股利再投入」的買入記錄
                try {
                    const dividendLinkId = String(updatedRecord.timestamp || updatedRecord.id);
                    const linkedBuyIndexes = [];
                    records.forEach((r, i) => {
                        if (r && r.type === 'buy' && r.isDividendReinvest && String(r.dividendRecordId) === dividendLinkId) {
                            linkedBuyIndexes.push(i);
                        }
                    });

                    const shouldHaveReinvestBuy = (updatedRecord.dividendType === 'cash' && !!updatedRecord.reinvest && (updatedRecord.amount || 0) > 0);

                    if (!shouldHaveReinvestBuy) {
                        // 取消再投入 / 非現金股利：刪除所有關聯買入記錄
                        if (linkedBuyIndexes.length > 0) {
                            linkedBuyIndexes.sort((a, b) => b - a).forEach(i => records.splice(i, 1));
                        }
                    } else {
                        // 現金股利 + 再投入：建立或更新關聯買入記錄
                        const existingBuyIndex = linkedBuyIndexes.length > 0 ? linkedBuyIndexes[0] : -1;
                        const existingBuyRecord = existingBuyIndex !== -1 ? records[existingBuyIndex] : null;

                        // 優先沿用原本的買入價格，避免編輯時一直跳 prompt
                        const savedPrice = getStockCurrentPrice(stockCode);
                        const portfolio = getPortfolio();
                        const stock = portfolio.find(s => s.stockCode === stockCode);
                        const avgCost = stock && stock.avgCost > 0 ? stock.avgCost : 0;
                        let buyPrice = (existingBuyRecord && existingBuyRecord.price > 0)
                            ? existingBuyRecord.price
                            : (savedPrice || avgCost || 0);

                        if (buyPrice <= 0) {
                            const userPrice = prompt(`請輸入 ${stockCode} 的現價（用於計算股利再投入的股數）：`);
                            if (userPrice && parseFloat(userPrice) > 0) {
                                buyPrice = parseFloat(userPrice);
                            }
                        }

                        if (buyPrice > 0) {
                            const reinvestFee = 0;
                            const availableAmount = amount;
                            const buyShares = Math.floor(availableAmount / buyPrice);

                            if (buyShares > 0) {
                                const buyRecord = {
                                    type: 'buy',
                                    stockCode: stockCode,
                                    stockName: stockCode,
                                    date: date,
                                    price: buyPrice,
                                    shares: buyShares,
                                    fee: reinvestFee,
                                    isDividendReinvest: true,
                                    dividendRecordId: dividendLinkId,
                                    note: `股利再投入（來自 ${date} 現金股利，使用${(existingBuyRecord && existingBuyRecord.price > 0) ? '原買入價格' : savedPrice ? '現價' : avgCost ? '平均成本' : '手動輸入價格'}）${note ? ' - ' + note : ''}`,
                                    timestamp: existingBuyRecord?.timestamp || new Date().toISOString()
                                };

                                if (existingBuyIndex !== -1) {
                                    records[existingBuyIndex] = {
                                        ...records[existingBuyIndex],
                                        ...buyRecord
                                    };
                                    // 多餘的關聯買入記錄移除
                                    if (linkedBuyIndexes.length > 1) {
                                        linkedBuyIndexes.slice(1).sort((a, b) => b - a).forEach(i => records.splice(i, 1));
                                    }
                                    
                                    // 創建或更新記帳本轉帳記錄
                                    try {
                                        let accountingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
                                        const transferIndex = accountingRecords.findIndex(ar => 
                                            ar.linkedInvestment === true && 
                                            ar.investmentRecordId === buyRecord.timestamp
                                        );
                                        
                                        const transferRecord = {
                                            type: 'transfer',
                                            category: '股票再投入',
                                            amount: amount,
                                            note: `股利再投入：${stockCode} ${buyShares}股 @ NT$${buyPrice.toFixed(2)}`,
                                            date: date,
                                            fromAccount: '現金',
                                            toAccount: '投資',
                                            linkedInvestment: true,
                                            investmentRecordId: buyRecord.timestamp,
                                            timestamp: buyRecord.timestamp
                                        };
                                        
                                        if (transferIndex !== -1) {
                                            accountingRecords[transferIndex] = transferRecord;
                                        } else {
                                            accountingRecords.push(transferRecord);
                                        }
                                        
                                        localStorage.setItem('accountingRecords', JSON.stringify(accountingRecords));
                                        console.log('已更新股利再投入轉帳記錄');
                                    } catch (e) {
                                        console.warn('更新股利再投入轉帳記錄失敗:', e);
                                    }
                                } else {
                                    records.push(buyRecord);
                                    
                                    // 創建新的記帳本轉帳記錄
                                    try {
                                        let accountingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
                                        const transferRecord = {
                                            type: 'transfer',
                                            category: '股票再投入',
                                            amount: amount,
                                            note: `股利再投入：${stockCode} ${buyShares}股 @ NT$${buyPrice.toFixed(2)}`,
                                            date: date,
                                            fromAccount: '現金',
                                            toAccount: '投資',
                                            linkedInvestment: true,
                                            investmentRecordId: buyRecord.timestamp,
                                            timestamp: buyRecord.timestamp
                                        };
                                        accountingRecords.push(transferRecord);
                                        localStorage.setItem('accountingRecords', JSON.stringify(accountingRecords));
                                        console.log('已創建股利再投入轉帳記錄');
                                    } catch (e) {
                                        console.warn('創建股利再投入轉帳記錄失敗:', e);
                                    }
                                }
                            } else {
                                // 金額不足以買入至少1股：刪除既有關聯買入記錄並提示
                                if (linkedBuyIndexes.length > 0) {
                                    // 刪除關聯的記帳本轉帳記錄
                                    try {
                                        const accountingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
                                        const deletedInvestmentIds = linkedBuyIndexes.map(i => {
                                            const invRecord = records[i];
                                            return invRecord ? (invRecord.timestamp || invRecord.id) : null;
                                        }).filter(id => id !== null);
                                        
                                        if (deletedInvestmentIds.length > 0) {
                                            accountingRecords = accountingRecords.filter(ar => {
                                                if (!ar || ar.type !== 'transfer' || ar.linkedInvestment !== true) return true;
                                                const invId = ar.investmentRecordId != null ? String(ar.investmentRecordId) : '';
                                                return !deletedInvestmentIds.includes(invId);
                                            });
                                            localStorage.setItem('accountingRecords', JSON.stringify(accountingRecords));
                                            console.log('已刪除關聯的股利再投入轉帳記錄');
                                        }
                                    } catch (e) {
                                        console.warn('刪除股利再投入轉帳記錄失敗:', e);
                                    }
                                    
                                    linkedBuyIndexes.sort((a, b) => b - a).forEach(i => records.splice(i, 1));
                                }
                                alert(`⚠️ 股利再投入金額不足\n\n股利金額：NT$${amount.toLocaleString('zh-TW')}\n可用金額：NT$${amount.toLocaleString('zh-TW')}\n股票現價：NT$${buyPrice.toFixed(2)}\n\n可用金額不足以買入至少1股（需要至少 NT$${buyPrice.toLocaleString('zh-TW')}）`);
                            }
                        } else {
                            // 沒有價格無法計算：刪除既有關聯買入記錄
                            if (linkedBuyIndexes.length > 0) {
                                // 刪除關聯的記帳本轉帳記錄
                                try {
                                    const accountingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
                                    const deletedInvestmentIds = linkedBuyIndexes.map(i => {
                                        const invRecord = records[i];
                                        return invRecord ? (invRecord.timestamp || invRecord.id) : null;
                                    }).filter(id => id !== null);
                                    
                                    if (deletedInvestmentIds.length > 0) {
                                        accountingRecords = accountingRecords.filter(ar => {
                                            if (!ar || ar.type !== 'transfer' || ar.linkedInvestment !== true) return true;
                                            const invId = ar.investmentRecordId != null ? String(ar.investmentRecordId) : '';
                                            return !deletedInvestmentIds.includes(invId);
                                        });
                                        localStorage.setItem('accountingRecords', JSON.stringify(accountingRecords));
                                        console.log('已刪除關聯的股利再投入轉帳記錄');
                                    }
                                } catch (e) {
                                    console.warn('刪除股利再投入轉帳記錄失敗:', e);
                                }
                                
                                linkedBuyIndexes.sort((a, b) => b - a).forEach(i => records.splice(i, 1));
                            }
                        }
                    }
                } catch (syncError) {
                    console.error('同步股利再投入買入記錄失敗:', syncError);
                }
                
                // 嘗試保存到 localStorage
                try {
            localStorage.setItem('investmentRecords', JSON.stringify(records));
            
                    // 立即更新顯示，不使用延遲
                    const oldStockCode = record.stockCode;
                    
                    // 更新核心數據
            updateInvestmentSummary();
            updatePortfolioList();
            updateInvestmentRecords();
                    
                    // 如果股票代碼改變了，需要更新兩個股票的顯示
                    if (oldStockCode !== stockCode) {
                        updateStockRecords(oldStockCode);
                        updateStockRecords(stockCode);
                    } else {
                        updateStockRecords(stockCode);
                    }
                    
                    // 檢查是否正在查看股票詳情頁面，如果是則重新顯示（重新計算所有數據）
                    const stockDetailPage = document.getElementById('stockDetailPage');
                    if (stockDetailPage && stockDetailPage.style.display !== 'none') {
                        // 重新計算持股數據並更新詳情頁面
                        const portfolio = getPortfolio();
                        const updatedStock = portfolio.find(s => s.stockCode === stockCode);
                        if (updatedStock) {
                            showStockDetailPage(stockCode);
                        }
                    }
                    
            updateInvestmentOverview();
            
            document.body.removeChild(modal);
            alert('記錄已更新！');
                } catch (storageError) {
                    console.error('localStorage 保存失敗:', storageError);
                    if (storageError.name === 'QuotaExceededError') {
                        alert('存儲空間不足，無法保存記錄。請刪除一些舊記錄後再試。');
                    } else {
                        alert('保存失敗：' + storageError.message);
                    }
                }
            } else {
                console.error('找不到記錄，ID:', recordIdStr);
                console.error('記錄列表中的ID範例:', records.slice(0, 3).map(r => ({
                    timestamp: r.timestamp,
                    id: r.id,
                    type: r.type,
                    stockCode: r.stockCode
                })));
                alert('找不到要更新的記錄，請重新整理頁面後再試。\n記錄ID: ' + recordIdStr);
            }
        } catch (error) {
            console.error('更新記錄時發生錯誤:', error);
            alert('更新記錄時發生錯誤：' + error.message);
        }
    });
}

// 顯示買入/賣出輸入畫面
function showInvestmentInputPage(type) {
    const inputPage = document.getElementById('investmentInputPage');
    const overview = document.getElementById('investmentOverview');
    const detailPage = document.getElementById('stockDetailPage');
    const bottomNav = document.querySelector('.bottom-nav');
    
    if (overview) overview.style.display = 'none';
    if (detailPage) detailPage.style.display = 'none';
    if (inputPage) {
        inputPage.style.display = 'flex';
        
        // 隱藏底部導航欄
        if (bottomNav) bottomNav.style.display = 'none';
        
        // 隱藏操作按鈕
        const investmentActions = document.querySelector('.investment-actions');
        if (investmentActions) investmentActions.style.display = 'none';
        
        // 初始化輸入畫面
        initInvestmentInput(type);
    }
}

// 初始化買入/賣出輸入
function initInvestmentInput(type) {
    // 保存交易類型
    window.investmentInputType = type;
    
    // 初始化投資類型選擇
    let selectedInvestmentType = 'stock'; // 預設為股票
    const typeButtons = document.querySelectorAll('.type-btn');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有active類別
            typeButtons.forEach(b => b.classList.remove('active'));
            // 添加active類別到點擊的按鈕
            btn.classList.add('active');
            selectedInvestmentType = btn.dataset.type;
            window.investmentType = selectedInvestmentType;
        });
    });
    window.investmentType = selectedInvestmentType;
    
    // 獲取新的表單元素
    const stockCodeInput = document.getElementById('calcStockCodeInput');
    const stockNameInput = document.getElementById('calcStockNameInput');
    const dateInput = document.getElementById('calcDateInput');
    const priceInput = document.getElementById('calcPriceInput');
    const sharesInput = document.getElementById('calcSharesInput');
    const queryBtn = document.getElementById('queryStockPriceBtn');
    const dcaFieldContainer = document.getElementById('dcaFieldContainer');
    const isDCAInput = document.getElementById('calcIsDCAInput');
    
    // 切換買入/賣出模式的 UI
    const priceLabelEl = document.getElementById('calcPriceLabelEl');
    const dateLabelEl = document.getElementById('calcDateLabelEl');
    const taxFieldContainer = document.getElementById('calcTaxFieldContainer');
    const sellCalcResultContainer = document.getElementById('sellCalcResultContainer');
    const investmentSaveBtnEl = document.getElementById('investmentSaveBtn');
    const formTitle = document.querySelector('#investmentInputPage .form-header-title');
    const formSubtitle = document.querySelector('#investmentInputPage .form-header-subtitle');
    const formIcon = document.querySelector('#investmentInputPage .form-header-icon');

    if (type === 'sell') {
        if (priceLabelEl) priceLabelEl.textContent = '賣出價格';
        if (dateLabelEl) dateLabelEl.textContent = '賣出日期';
        if (investmentSaveBtnEl) investmentSaveBtnEl.textContent = '確認賣出';
        if (taxFieldContainer) taxFieldContainer.style.display = 'block';
        if (sellCalcResultContainer) sellCalcResultContainer.style.display = 'block';
        if (formTitle) formTitle.textContent = '賣出記錄';
        if (formSubtitle) formSubtitle.textContent = '記錄股票賣出資訊及實現損益';
        if (formIcon) formIcon.textContent = '📉';
        // 重置稅金欄位
        const autoTaxCheckbox = document.getElementById('calcAutoTaxCheckbox');
        const taxInput = document.getElementById('calcTaxInput');
        if (autoTaxCheckbox) autoTaxCheckbox.checked = true;
        if (taxInput) taxInput.value = '0';
        // 綁定稅金自動計算
        if (autoTaxCheckbox && taxInput) {
            autoTaxCheckbox.onchange = () => {
                taxInput.disabled = autoTaxCheckbox.checked;
                taxInput.style.opacity = autoTaxCheckbox.checked ? '0.5' : '1';
                if (typeof updateInvestmentDisplay === 'function') updateInvestmentDisplay();
            };
            autoTaxCheckbox.dispatchEvent(new Event('change'));
        }
    } else {
        if (priceLabelEl) priceLabelEl.textContent = '買入價格';
        if (dateLabelEl) dateLabelEl.textContent = '買入日期';
        if (investmentSaveBtnEl) investmentSaveBtnEl.textContent = '確認買入';
        if (taxFieldContainer) taxFieldContainer.style.display = 'none';
        if (sellCalcResultContainer) sellCalcResultContainer.style.display = 'none';
        if (formTitle) formTitle.textContent = '股票投資記錄';
        if (formSubtitle) formSubtitle.textContent = '記錄股票投資標的、價格、股數等資訊';
        if (formIcon) formIcon.textContent = '📈';
    }

    // 顯示/隱藏定期定額選項（僅買入時顯示）
    if (dcaFieldContainer) {
        dcaFieldContainer.style.display = type === 'buy' ? 'block' : 'none';
    }
    if (isDCAInput) {
        isDCAInput.checked = false; // 重置為未選中
    }
    
    // 設置日期為今天
    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
    }
    
    // 初始化股票代碼和名稱
    if (type === 'sell') {
        // 賣出：從持股中選擇
        const portfolio = getPortfolio();
        if (portfolio.length > 0) {
            // 預設選擇第一個持股
            const firstStock = portfolio[0];
            if (stockCodeInput) stockCodeInput.value = firstStock.stockCode;
            if (stockNameInput) stockNameInput.value = firstStock.stockName || firstStock.stockCode;
            window.selectedStockCode = firstStock.stockCode;
            // 自動填入當前持股數（賣出時）
            if (sharesInput && firstStock.shares > 0) {
                sharesInput.value = firstStock.shares;
            }
            // 更新持股數提示
            if (typeof updateCurrentSharesHint === 'function') {
                updateCurrentSharesHint(firstStock.stockCode);
            }
        } else {
            alert('您目前沒有持股，無法賣出');
            // 返回投資總覽
            const inputPage = document.getElementById('investmentInputPage');
            const overview = document.getElementById('investmentOverview');
            const bottomNav = document.querySelector('.bottom-nav');
            const investmentActions = document.querySelector('.investment-actions');
            if (inputPage) inputPage.style.display = 'none';
            if (overview) overview.style.display = 'block';
            if (bottomNav) bottomNav.style.display = 'flex';
            if (investmentActions) investmentActions.style.display = 'flex';
            return;
        }
    } else {
        // 買入：清空輸入框
        if (stockCodeInput) stockCodeInput.value = '';
        if (stockNameInput) stockNameInput.value = '';
        window.selectedStockCode = '';
    }
    
    // 查詢股價按鈕（暫時顯示提示）
    if (queryBtn) {
        queryBtn.onclick = async () => {
            const code = stockCodeInput ? stockCodeInput.value.trim() : '';
            if (!code) {
                showAppAlert({
                    title: '查詢股價',
                    message: '請先輸入股票代碼'
                });
                return;
            }

            queryBtn.disabled = true;
            queryBtn.textContent = '查詢中...';
            try {
                const normalized = code.replace(/\s+/g, '');
                const price = await fetchStockPrice(normalized, { allowPrompt: false });
                if (price != null) {
                    if (priceInput) {
                        priceInput.value = price.toFixed(2);
                    }
                    showAppAlert({
                        title: '查詢成功',
                        message: `目前 ${normalized} 的現價約為 NT$${price.toFixed(2)}（來自 Yahoo/自動更新）`
                    });
                } else {
                    showAppAlert({
                        title: '查詢失敗',
                        message: '無法取得最新股價，請稍後再試或手動輸入。'
                    });
                    const url = `https://www.cnyes.com/twstock/${encodeURIComponent(normalized)}`;
                    window.open(url, '_blank', 'noopener');
                }
            } catch (error) {
                console.error('查詢股價失敗', error);
                showAppAlert({
                    title: '查詢錯誤',
                    message: '發生錯誤，請稍後再試。'
                });
            } finally {
                queryBtn.disabled = false;
                queryBtn.textContent = '查詢股價';
            }
        };
    }
    
    // 使用全局函數
    const findStockName = window.findStockName;
    
    // 更新當前持股數提示和按鈕
    function updateCurrentSharesHint(stockCode) {
        if (!stockCode) {
            const hint = document.getElementById('currentSharesHint');
            const btn = document.getElementById('sharesAutoFillBtn');
            if (hint) hint.style.display = 'none';
            if (btn) btn.style.opacity = '0.5';
            return;
        }
        
        const portfolio = getPortfolio();
        const stock = portfolio.find(s => s.stockCode === stockCode);
        const hint = document.getElementById('currentSharesHint');
        const btn = document.getElementById('sharesAutoFillBtn');
        const sharesInput = document.getElementById('calcSharesInput');
        
        if (stock && stock.shares > 0) {
            // 有持股，顯示提示和啟用按鈕
            if (hint) {
                hint.textContent = `💡 當前持股：${stock.shares.toLocaleString('zh-TW')} 股`;
                hint.style.display = 'block';
                hint.style.color = 'var(--color-primary)';
            }
            if (btn) {
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.dataset.currentShares = stock.shares;
            }
        } else {
            // 沒有持股，隱藏提示和禁用按鈕
            if (hint) {
                hint.textContent = '💡 目前沒有此股票的持股';
                hint.style.display = 'block';
                hint.style.color = 'var(--text-tertiary)';
            }
            if (btn) {
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                btn.dataset.currentShares = '0';
            }
        }
    }
    
    // 自動填入當前持股數按鈕
    const sharesAutoFillBtn = document.getElementById('sharesAutoFillBtn');
    if (sharesAutoFillBtn) {
        sharesAutoFillBtn.addEventListener('click', () => {
            const stockCode = stockCodeInput ? stockCodeInput.value.trim() : '';
            if (!stockCode) {
                alert('請先輸入股票代碼');
                return;
            }
            
            const portfolio = getPortfolio();
            const stock = portfolio.find(s => s.stockCode === stockCode);
            
            if (stock && stock.shares > 0 && sharesInput) {
                sharesInput.value = stock.shares;
                sharesInput.placeholder = '已自動填入當前持股數';
                if (typeof updateInvestmentDisplay === 'function') {
                    updateInvestmentDisplay();
                }
                
                // 添加視覺反饋
                sharesInput.style.background = 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)';
                setTimeout(() => {
                    if (sharesInput) {
                        sharesInput.style.background = '';
                    }
                }, 1000);
            } else {
                alert('目前沒有此股票的持股');
            }
        });
    }
    
    // 股票代碼輸入時，自動帶入股票名稱
    if (stockCodeInput) {
        let inputTimeout = null;
        
        // 實時自動辨識並填入股票名稱
        stockCodeInput.addEventListener('input', () => {
            const code = stockCodeInput.value.trim();
            
            // 清除之前的延遲
            if (inputTimeout) {
                clearTimeout(inputTimeout);
            }
            
            // 延遲一點時間，等用戶輸入完成
            inputTimeout = setTimeout(() => {
                if (code && stockNameInput) {
                    const stockName = findStockName(code);
                    if (stockName) {
                        // 自動填入找到的股票名稱
                        stockNameInput.value = stockName;
                        window.selectedStockCode = code;
                        // 恢復原始 placeholder
                        stockNameInput.placeholder = '例如: 台積電';
                    } else {
                        // 如果沒有找到，清空名稱欄位讓用戶手動輸入
                        if (!stockNameInput.value || stockNameInput.value === code) {
                            stockNameInput.value = '';
                            stockNameInput.placeholder = '未找到，請手動輸入';
                        }
                    }
                    // 更新當前持股數提示
                    updateCurrentSharesHint(code);
                } else if (!code && stockNameInput) {
                    // 如果代碼為空，清空名稱
                    stockNameInput.value = '';
                    stockNameInput.placeholder = '例如: 台積電';
                    // 隱藏持股數提示
                    const hint = document.getElementById('currentSharesHint');
                    if (hint) {
                        hint.style.display = 'none';
                    }
                }
            }, 300); // 300ms 延遲，避免頻繁查找
        });
        
        // 失去焦點時也檢查一次（確保即時更新）
        stockCodeInput.addEventListener('blur', () => {
            const code = stockCodeInput.value.trim();
            if (code && stockNameInput) {
                const stockName = findStockName(code);
                if (stockName) {
                    stockNameInput.value = stockName;
                    window.selectedStockCode = code;
                } else if (!stockNameInput.value) {
                    // 如果沒有找到且名稱為空，使用代碼作為名稱
                    stockNameInput.value = code;
                    stockNameInput.placeholder = '未找到，請手動輸入';
                }
                window.selectedStockCode = code;
            }
            // 自動檢查並提示當前持股數
            updateCurrentSharesHint(code);
        });
    }
    
    // 初始化輸入框事件
    initInvestmentInputFields();
    
    // 初始化顯示
    updateInvestmentDisplay();
    
    // 初始化確認按鈕
    const saveBtn = document.getElementById('investmentSaveBtn');
    if (saveBtn) {
        saveBtn.onclick = () => {
            playClickSound(); // 播放點擊音效
            saveInvestmentRecord(type);
        };
    }
    
    // 初始化返回按鈕（返回到投資專區）
    const backBtn = document.getElementById('investmentInputBackBtn');
    if (backBtn) {
        // 移除舊的事件監聽器，避免重複綁定
        backBtn.onclick = null;
        backBtn.addEventListener('click', () => {
            // 返回到投資專區
            const inputPage = document.getElementById('investmentInputPage');
            const overview = document.getElementById('investmentOverview');
            const detailPage = document.getElementById('stockDetailPage');
            const dividendPage = document.getElementById('dividendPage');
            const dividendInputPage = document.getElementById('dividendInputPage');
            const bottomNav = document.querySelector('.bottom-nav');
            const investmentActions = document.querySelector('.investment-actions');
            
            // 隱藏輸入頁面
            if (inputPage) inputPage.style.display = 'none';
            if (dividendInputPage) dividendInputPage.style.display = 'none';
            
            // 顯示投資總覽
            if (overview) overview.style.display = 'block';
            if (detailPage) detailPage.style.display = 'none';
            if (dividendPage) dividendPage.style.display = 'none';
            
            // 顯示底部導航欄和操作按鈕
            if (bottomNav) bottomNav.style.display = 'flex';
            if (investmentActions) investmentActions.style.display = 'flex';
            
            // 更新投資總覽
            if (typeof updateInvestmentOverview === 'function') {
                updateInvestmentOverview();
            }
        });
    }
    
}

// 投資輸入狀態
let investmentInputState = {
    price: '0',
    shares: '0',
    isEditingPrice: true, // true=編輯價格, false=編輯股數
    isNewNumber: true
};

// 處理投資鍵盤按鍵（已移除鍵盤，保留函數以防其他地方調用）
function handleInvestmentKeyPress(key) {
    const state = investmentInputState;
    const currentValue = state.isEditingPrice ? state.price : state.shares;
    
    if (key === 'delete') {
        // 刪除最後一個字符
        if (currentValue.length > 1) {
            if (state.isEditingPrice) {
                state.price = currentValue.slice(0, -1);
            } else {
                state.shares = currentValue.slice(0, -1);
            }
        } else {
            if (state.isEditingPrice) {
                state.price = '0';
            } else {
                state.shares = '0';
            }
        }
        state.isNewNumber = false;
    } else if (key === '.') {
        // 小數點（只允許在價格中使用）
        if (state.isEditingPrice && !currentValue.includes('.')) {
            if (state.isNewNumber || currentValue === '0') {
                state.price = '0.';
            } else {
                state.price += '.';
            }
            state.isNewNumber = false;
        }
    } else if (key === '×' || key === '÷' || key === '+' || key === '-') {
        // 運算符：切換編輯模式
        state.isEditingPrice = !state.isEditingPrice;
        state.isNewNumber = true;
    } else {
        // 數字
        if (state.isNewNumber || currentValue === '0') {
            if (state.isEditingPrice) {
                state.price = key;
            } else {
                state.shares = key;
            }
            state.isNewNumber = false;
        } else {
            if (state.isEditingPrice) {
                state.price += key;
            } else {
                state.shares += key;
            }
        }
    }
    
    updateInvestmentDisplay();
}

// 計算投資手續費
function calculateInvestmentFee(totalAmount, shares = 0) {
    // 手續費為總金額的0.1425%，但只有買足 1,000 股才會啟動最低 NT$20，其他數量直接用比例計算
    const fee = Math.round(totalAmount * 0.001425);
    if (shares >= 1000) {
        return Math.max(fee, 20);
    }
    return fee;
}

// 更新投資輸入顯示
function updateInvestmentDisplay() {
    const priceInput = document.getElementById('calcPriceInput');
    const sharesInput = document.getElementById('calcSharesInput');
    const feeInput = document.getElementById('calcFeeInput');
    
    const price = parseFloat(priceInput?.value) || 0;
    const shares = parseInt(sharesInput?.value) || 0;
    const total = price * shares;
    
    // 手續費：檢查是否勾選自動計算
    const autoFeeCheckbox = document.getElementById('calcAutoFeeCheckbox');
    const isAutoFee = autoFeeCheckbox?.checked || false;
    const fee = isAutoFee ? calculateInvestmentFee(total, shares) : (parseFloat(feeInput?.value) || 0);
    
    // 如果勾選自動計算，更新手續費欄位顯示
    if (isAutoFee && feeInput) {
        feeInput.value = fee;
    }
    
    const finalAmount = total + fee;
    
    // 更新顯示區域
    const calcPriceEl = document.getElementById('calcPrice');
    const calcSharesEl = document.getElementById('calcShares');
    const calcTotalEl = document.getElementById('calcTotal');
    const calcFeeEl = document.getElementById('calcFee');
    const calcFinalAmountEl = document.getElementById('calcFinalAmount');
    
    if (calcPriceEl) {
        calcPriceEl.textContent = `NT$${price.toFixed(2)}`;
    }
    if (calcSharesEl) {
        calcSharesEl.textContent = `${shares.toLocaleString('zh-TW')} 股`;
    }
    if (calcTotalEl) {
        calcTotalEl.textContent = `NT$${total.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    if (calcFeeEl) {
        calcFeeEl.textContent = `NT$${fee.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    if (calcFinalAmountEl) {
        calcFinalAmountEl.textContent = `NT$${finalAmount.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }

    // 賣出模式：更新試算結果
    if (window.investmentInputType === 'sell') {
        const autoTaxCheckbox = document.getElementById('calcAutoTaxCheckbox');
        const taxInput = document.getElementById('calcTaxInput');

        const calcSellAmountEl = document.getElementById('calcSellAmount');
        const calcSellCostEl = document.getElementById('calcSellCost');
        const calcCostAmountEl = document.getElementById('calcCostAmount');
        const calcEstimatedPnlEl = document.getElementById('calcEstimatedPnl');
        const calcEstimatedReturnEl = document.getElementById('calcEstimatedReturn');

        const fmt = v => `NT$${v.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

        // 尚未輸入價格或股數，全部歸零，不套用最低手續費
        if (total <= 0 || price <= 0 || shares <= 0) {
            if (taxInput) taxInput.value = '0';
            if (calcSellAmountEl) calcSellAmountEl.textContent = 'NT$0';
            if (calcSellCostEl) calcSellCostEl.textContent = 'NT$0';
            if (calcCostAmountEl) {
                // 仍可顯示平均成本（只需知道股票代碼即可）
                const sc = document.getElementById('calcStockCodeInput')?.value.trim();
                if (sc && typeof getPortfolio === 'function') {
                    const st = getPortfolio().find(s => s.stockCode === sc);
                    calcCostAmountEl.textContent = st ? fmt(st.avgCost * (shares || 0)) : 'NT$0';
                } else {
                    calcCostAmountEl.textContent = 'NT$0';
                }
            }
            if (calcEstimatedPnlEl) { calcEstimatedPnlEl.textContent = '—'; calcEstimatedPnlEl.className = 'pnl-value'; }
            if (calcEstimatedReturnEl) { calcEstimatedReturnEl.textContent = '—'; calcEstimatedReturnEl.className = ''; }
            return;
        }

        // 賣出金額 > 0 時才正式計算
        // 手續費：賣出時使用實際 0.1425%（最低 20 元，但只在有成交時收取）
        const sellFee = isAutoFee ? Math.max(Math.floor(total * 0.001425), 20) : fee;
        // 證交稅：0.3%
        const isAutoTax = autoTaxCheckbox?.checked !== false;
        const tax = isAutoTax ? Math.round(total * 0.003) : (parseFloat(taxInput?.value) || 0);
        if (isAutoTax && taxInput) taxInput.value = tax;

        const netRevenue = total - sellFee - tax;

        if (calcSellAmountEl) calcSellAmountEl.textContent = fmt(total);
        if (calcSellCostEl) calcSellCostEl.textContent = fmt(sellFee + tax);

        const stockCode = document.getElementById('calcStockCodeInput')?.value.trim();
        if (stockCode && typeof getPortfolio === 'function') {
            const portfolio = getPortfolio();
            const stock = portfolio.find(s => s.stockCode === stockCode);
            if (stock) {
                const totalCost = stock.avgCost * shares;
                const pnl = netRevenue - totalCost;
                const returnRate = totalCost > 0 ? (pnl / totalCost * 100) : 0;
                if (calcCostAmountEl) calcCostAmountEl.textContent = fmt(totalCost);
                if (calcEstimatedPnlEl) {
                    calcEstimatedPnlEl.textContent = fmt(pnl);
                    calcEstimatedPnlEl.className = `pnl-value ${pnl >= 0 ? 'positive' : 'negative'}`;
                }
                if (calcEstimatedReturnEl) {
                    calcEstimatedReturnEl.textContent = `${returnRate.toFixed(2)}%`;
                    calcEstimatedReturnEl.className = returnRate >= 0 ? 'positive' : 'negative';
                }
            } else {
                if (calcCostAmountEl) calcCostAmountEl.textContent = '持股不足';
                if (calcEstimatedPnlEl) { calcEstimatedPnlEl.textContent = '—'; calcEstimatedPnlEl.className = 'pnl-value'; }
                if (calcEstimatedReturnEl) { calcEstimatedReturnEl.textContent = '—'; calcEstimatedReturnEl.className = ''; }
            }
        }
    }
}

// 初始化快捷鍵
function initQuickActions() {
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const shares = parseInt(btn.dataset.shares);
            if (shares) {
                const sharesInput = document.getElementById('calcSharesInput');
                if (sharesInput) {
                    sharesInput.value = shares.toString();
                    updateInvestmentDisplay();
                }
            }
        });
    });
}

// 保存投資記錄
function saveInvestmentRecord(type) {
    // 從新的表單輸入框獲取值
    const stockCodeInput = document.getElementById('calcStockCodeInput');
    const stockNameInput = document.getElementById('calcStockNameInput');
    const dateInput = document.getElementById('calcDateInput');
    const priceInput = document.getElementById('calcPriceInput');
    const sharesInput = document.getElementById('calcSharesInput');
    
    if (!priceInput || !sharesInput || !stockCodeInput || !dateInput) {
        alert('找不到輸入框');
        return;
    }
    
    const stockCode = stockCodeInput.value.trim();
    const stockName = stockNameInput ? stockNameInput.value.trim() : '';
    const date = dateInput.value || new Date().toISOString().split('T')[0];
    const price = parseFloat(priceInput.value) || 0;
    const shares = parseInt(sharesInput.value) || 0;
    
    if (!stockCode) {
        alert('請輸入股票代碼');
        return;
    }
    
    if (price <= 0 || shares <= 0) {
        alert('請輸入有效的價格和股數');
        return;
    }
    
    // 如果股票名稱是空的，使用代碼作為名稱
    const finalStockName = stockName || stockCode;
    
    // 計算總金額和手續費
    const totalAmount = price * shares;
    const feeInput = document.getElementById('calcFeeInput');
    const autoFeeCheckbox = document.getElementById('calcAutoFeeCheckbox');
    const isAutoFee = autoFeeCheckbox?.checked || false;
    // 賣出時手續費：有成交才套用最低 20 元；買入沿用 calculateInvestmentFee
    const fee = isAutoFee
        ? (type === 'sell'
            ? Math.max(Math.floor(totalAmount * 0.001425), 20)
            : calculateInvestmentFee(totalAmount, shares))
        : (parseFloat(feeInput?.value) || 0);
    
    let record;
    
    if (type === 'buy') {
        // 讀取定期定額選項
        const isDCAInput = document.getElementById('calcIsDCAInput');
        const isDCA = isDCAInput ? isDCAInput.checked : false;
        
        // 買入記錄
        record = {
            type: 'buy',
            stockCode: stockCode,
            stockName: finalStockName,
            investmentType: window.investmentType || 'stock', // 投資類型：stock/etf/bond
            date: date,
            price: price,
            shares: shares,
            fee: fee,
            isDCA: isDCA,
            note: '',
            timestamp: new Date().toISOString()
        };
    } else if (type === 'sell') {
        // 賣出記錄
        const portfolio = getPortfolio();
        const stock = portfolio.find(s => s.stockCode === stockCode);
        
        if (!stock || stock.shares < shares) {
            alert('持股不足，無法賣出');
            return;
        }
        
        // 讀取稅金（自動或手動）
        const autoTaxCheckbox = document.getElementById('calcAutoTaxCheckbox');
        const taxInput = document.getElementById('calcTaxInput');
        const isAutoTax = autoTaxCheckbox ? autoTaxCheckbox.checked : true;
        const tax = isAutoTax ? Math.round(totalAmount * 0.003) : (parseFloat(taxInput?.value) || 0);

        // 計算實現損益
        const avgCost = stock.avgCost;
        const totalCost = avgCost * shares;
        const totalRevenue = totalAmount - fee - tax;
        const realizedPnl = totalRevenue - totalCost;
        
        record = {
            type: 'sell',
            stockCode: stockCode,
            stockName: finalStockName,
            investmentType: window.investmentType || 'stock',
            date: date,
            price: price,
            shares: shares,
            fee: fee,
            tax: tax,
            note: '',
            realizedPnl: realizedPnl,
            timestamp: new Date().toISOString()
        };
    } else {
        alert('未知的交易類型');
        return;
    }
    
    // 保存記錄
    let records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    records.push(record);
    localStorage.setItem('investmentRecords', JSON.stringify(records));
    
    // 賣出：自動在記帳本中記錄收入
    if (type === 'sell') {
        try {
            const sellNetRevenue = record.price * record.shares - (record.fee || 0) - (record.tax || 0);
            const accountingRecord = {
                type: 'income',
                category: '股票賣出',
                amount: Math.max(sellNetRevenue, 0),
                note: `賣出：${finalStockName} (${stockCode}) ${shares}股 @ NT$${price.toLocaleString('zh-TW')} 實現損益：NT$${record.realizedPnl.toLocaleString('zh-TW')}`,
                date: date,
                linkedInvestment: true,
                investmentRecordId: record.timestamp,
                timestamp: new Date().toISOString()
            };
            let accountingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
            accountingRecords.push(accountingRecord);
            localStorage.setItem('accountingRecords', JSON.stringify(accountingRecords));
            if (typeof updateLedgerSummary === 'function') updateLedgerSummary(accountingRecords);
            if (typeof displayLedgerTransactions === 'function') displayLedgerTransactions(accountingRecords);
        } catch (e) {
            console.warn('建立賣出記帳記錄失敗:', e);
        }
    }

    // 買入：自動在記帳本中記錄「轉帳」（顯示於轉帳分頁）
    if (type === 'buy') {
        // 總投入金額（價格 × 股數 + 手續費），無條件進位為整數
        const totalCost = Math.ceil(totalAmount + fee);

        const selectedAccountId = (typeof getSelectedAccount === 'function' ? getSelectedAccount()?.id : null) || '';
        const accounts = (typeof getAccounts === 'function' ? getAccounts() : []) || [];
        const configuredSettlementAccountId = localStorage.getItem('investmentSettlementAccountId') || '';
        let settlementAccountId = configuredSettlementAccountId;
        if (!settlementAccountId) {
            const candidate = accounts.find(a => {
                const name = String(a?.name || '');
                return /交割|證券|券商|broker|settle/i.test(name);
            });
            if (candidate && candidate.id) settlementAccountId = candidate.id;
        }
        if (!settlementAccountId) settlementAccountId = selectedAccountId;

        // 創建記帳記錄
        const accountingRecord = {
            type: 'transfer',
            category: finalStockName ? `${stockCode} ${finalStockName}` : stockCode,
            amount: totalCost,
            account: selectedAccountId,
            fromAccount: selectedAccountId,
            toAccount: settlementAccountId,
            note: `${record.isDCA ? '定期定額' : '買入'}：${finalStockName} (${stockCode}) ${shares}股 @ NT$${price.toLocaleString('zh-TW')}`,
            date: date,
            timestamp: new Date().toISOString(),
            linkedInvestment: true,
            investmentRecordId: record.timestamp
        };

        // 保存到記帳記錄
        let accountingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
        accountingRecords.push(accountingRecord);
        localStorage.setItem('accountingRecords', JSON.stringify(accountingRecords));

        // 更新記帳本顯示（如果記帳本頁面已初始化）
        if (typeof updateLedgerSummary === 'function') {
            updateLedgerSummary(accountingRecords);
        }
        if (typeof displayLedgerTransactions === 'function') {
            displayLedgerTransactions(accountingRecords);
        }
    }
    
    // 重置輸入狀態
    investmentInputState = {
        price: '0',
        shares: '0',
        isEditingPrice: true,
        isNewNumber: true
    };
    
    // 返回投資總覽
    const inputPage = document.getElementById('investmentInputPage');
    const overview = document.getElementById('investmentOverview');
    const bottomNav = document.querySelector('.bottom-nav');
    const investmentActions = document.querySelector('.investment-actions');
    
    if (inputPage) inputPage.style.display = 'none';
    if (overview) overview.style.display = 'block';
    if (bottomNav) bottomNav.style.display = 'flex';
    if (investmentActions) investmentActions.style.display = 'flex';
    
    // 更新投資總覽
    updateInvestmentOverview();
    
    // 顯示成功訊息
    let message = type === 'buy' 
        ? `買入記錄已儲存！\n${stockName} (${stockCode})\n${shares}股 @ NT$${price.toLocaleString('zh-TW')}`
        : `賣出記錄已儲存！\n${stockName} (${stockCode})\n${shares}股 @ NT$${price.toLocaleString('zh-TW')}\n實現損益：NT$${record.realizedPnl.toLocaleString('zh-TW')}`;
    
    // 如果是買入，提示已自動記錄到記帳本
    if (type === 'buy') {
        message += `\n\n✓ 已自動記錄到記帳本「轉帳」`;
    }
    
    alert(message);
}

// 初始化投資輸入框
function initInvestmentInputFields() {
    const priceInput = document.getElementById('calcPriceInput');
    const sharesInput = document.getElementById('calcSharesInput');
    const feeInput = document.getElementById('calcFeeInput');
    const autoFeeCheckbox = document.getElementById('calcAutoFeeCheckbox');

    if (priceInput) {
        priceInput.addEventListener('focus', () => {
            if (priceInput.value === '0') priceInput.value = '';
        });
        priceInput.addEventListener('blur', () => {
            if (priceInput.value === '') priceInput.value = '0';
            updateInvestmentDisplay();
        });
        priceInput.addEventListener('input', () => {
            updateInvestmentDisplay();
        });
    }

    if (sharesInput) {
        sharesInput.addEventListener('focus', () => {
            if (sharesInput.value === '0') {
                sharesInput.value = '';
                sharesInput.placeholder = '輸入股數';
            }
        });
        sharesInput.addEventListener('blur', () => {
            if (sharesInput.value === '' || sharesInput.value === '0') {
                sharesInput.value = '0';
                sharesInput.placeholder = '輸入股數';
            }
            updateInvestmentDisplay();
        });
        sharesInput.addEventListener('input', (e) => {
            // 確保股數是整數，移除所有非數字字符
            let value = e.target.value.replace(/[^0-9]/g, '');
            if (value !== e.target.value) {
                e.target.value = value;
            }
            updateInvestmentDisplay();
        });
        sharesInput.addEventListener('keydown', (e) => {
            // 允許退格、刪除、Tab、方向鍵等
            if (!/[0-9]/.test(e.key) && 
                !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key) &&
                !(e.ctrlKey || e.metaKey)) {
                e.preventDefault();
            }
        });
    }
    
    // 手續費輸入框事件
    if (feeInput) {
        feeInput.addEventListener('input', () => {
            updateInvestmentDisplay();
        });
    }
    
    // 自動計算手續費勾選框事件
    if (autoFeeCheckbox) {
        autoFeeCheckbox.addEventListener('change', () => {
            if (autoFeeCheckbox.checked && feeInput) {
                // 勾選時禁用手動輸入並自動計算
                feeInput.disabled = true;
                feeInput.style.opacity = '0.6';
            } else if (feeInput) {
                // 取消勾選時啟用手動輸入
                feeInput.disabled = false;
                feeInput.style.opacity = '1';
            }
            updateInvestmentDisplay();
        });
    }
}

// 快速新增股息（基於現有記錄）
function quickAddDividend(stockCode, stockName, perShare, shares, dividendType) {
    // 顯示股息輸入頁面
    const dividendInputPage = document.getElementById('dividendInputPage');
    const overview = document.getElementById('investmentOverview');
    const detailPage = document.getElementById('stockDetailPage');
    const inputPage = document.getElementById('investmentInputPage');
    const dividendPage = document.getElementById('dividendPage');
    const bottomNav = document.querySelector('.bottom-nav');
    const investmentActions = document.querySelector('.investment-actions');
    
    if (overview) overview.style.display = 'none';
    if (detailPage) detailPage.style.display = 'none';
    if (inputPage) inputPage.style.display = 'none';
    if (dividendPage) dividendPage.style.display = 'none';
    if (dividendInputPage) {
        dividendInputPage.style.display = 'block';
        // 隱藏底部導航欄
        if (bottomNav) bottomNav.style.display = 'none';
        // 隱藏操作按鈕
        if (investmentActions) investmentActions.style.display = 'none';
        
        // 預填表單資料
        const stockCodeInput = document.getElementById('dividendStockCodeInput');
        const stockNameInput = document.getElementById('dividendStockNameInput');
        const dateInput = document.getElementById('dividendDateInput');
        const perShareInput = document.getElementById('dividendPerShareInput');
    const historicalPerShareInput = document.getElementById('dividendHistoricalPerShareInput');
        const sharesInput = document.getElementById('dividendSharesInput');
        const amountInput = document.getElementById('dividendAmountInput');
        const reinvestInput = document.getElementById('dividendReinvestInput');
        const noteInput = document.getElementById('dividendNoteInput');
        
        if (stockCodeInput) stockCodeInput.value = stockCode || '';
        if (stockNameInput) stockNameInput.value = stockName || '';
        if (dateInput) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            dateInput.value = `${year}-${month}-${day}`;
        }
        if (perShareInput) perShareInput.value = perShare > 0 ? perShare.toFixed(2) : '0';
        if (sharesInput) sharesInput.value = shares > 0 ? shares : '0';
        if (amountInput) {
            // 自動計算金額
            const calculatedAmount = perShare > 0 && shares > 0 ? (perShare * shares).toFixed(2) : '0';
            amountInput.value = calculatedAmount;
        }
        if (reinvestInput) reinvestInput.checked = false;
        if (noteInput) noteInput.value = '';
        
        // 設置股息類型
        if (dividendType) {
            window.dividendType = dividendType;
            const typeButtons = document.querySelectorAll('#dividendInputPage .type-btn');
            typeButtons.forEach(btn => {
                if (btn.dataset.type === dividendType) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
        
        // 初始化股息輸入頁面
        initDividendInput();
    }
}

// 初始化股息輸入頁面
function initDividendInput() {
    const stockCodeInput = document.getElementById('dividendStockCodeInput');
    const stockNameInput = document.getElementById('dividendStockNameInput');
    const dateInput = document.getElementById('dividendDateInput');
    const perShareInput = document.getElementById('dividendPerShareInput');
    const historicalPerShareInput = document.getElementById('dividendHistoricalPerShareInput');
    const sharesInput = document.getElementById('dividendSharesInput');
    const amountInput = document.getElementById('dividendAmountInput');
    const reinvestInput = document.getElementById('dividendReinvestInput');
    const noteInput = document.getElementById('dividendNoteInput');
    const backBtn = document.getElementById('dividendInputBackBtn');
    const saveBtn = document.getElementById('dividendSaveBtn');
    
    // 設置日期為今天
    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
    }
    
    // 初始化股息類型選擇
    const typeButtons = document.querySelectorAll('#dividendInputPage .type-btn');
    let selectedType = 'cash'; // 預設為現金股利
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedType = btn.dataset.type;
            window.dividendType = selectedType;
        });
    });
    window.dividendType = selectedType;
    
    // 更新當前持股數提示和按鈕（股息頁面專用）
    function updateDividendCurrentSharesHint(stockCode) {
        if (!stockCode) {
            const hint = document.getElementById('dividendCurrentSharesHint');
            const btn = document.getElementById('dividendSharesAutoFillBtn');
            if (hint) hint.style.display = 'none';
            if (btn) btn.style.opacity = '0.5';
            return;
        }
        
        const portfolio = getPortfolio();
        const stock = portfolio.find(s => s.stockCode === stockCode);
        const hint = document.getElementById('dividendCurrentSharesHint');
        const btn = document.getElementById('dividendSharesAutoFillBtn');
        const sharesInput = document.getElementById('dividendSharesInput');
        
        if (stock && stock.shares > 0) {
            // 有持股，顯示提示和啟用按鈕
            if (hint) {
                hint.textContent = `💡 當前持股：${stock.shares.toLocaleString('zh-TW')} 股`;
                hint.style.display = 'block';
                hint.style.color = 'var(--color-primary)';
            }
            if (btn) {
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.dataset.currentShares = stock.shares;
            }
        } else {
            // 沒有持股，隱藏提示和禁用按鈕
            if (hint) {
                hint.textContent = '💡 目前沒有此股票的持股';
                hint.style.display = 'block';
                hint.style.color = 'var(--text-tertiary)';
            }
            if (btn) {
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                btn.dataset.currentShares = '0';
            }
        }
    }
    
    // 自動填入當前持股數按鈕（股息頁面）
    const dividendSharesAutoFillBtn = document.getElementById('dividendSharesAutoFillBtn');
    if (dividendSharesAutoFillBtn) {
        dividendSharesAutoFillBtn.addEventListener('click', () => {
            const stockCode = stockCodeInput ? stockCodeInput.value.trim() : '';
            if (!stockCode) {
                alert('請先輸入股票代碼');
                return;
            }
            
            const portfolio = getPortfolio();
            const stock = portfolio.find(s => s.stockCode === stockCode);
            
            if (stock && stock.shares > 0 && sharesInput) {
                sharesInput.value = stock.shares;
                sharesInput.placeholder = '已自動填入當前持股數';
                
                // 自動計算實收金額（如果已輸入每股股息）
                const perShare = parseFloat(perShareInput?.value) || 0;
                const historicalPerShare = parseFloat(historicalPerShareInput?.value) || null;
                if (perShare > 0 && amountInput) {
                    const amount = perShare * stock.shares;
                    amountInput.value = amount.toFixed(2);
                }
                
                // 添加視覺反饋
                sharesInput.style.background = 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)';
                setTimeout(() => {
                    if (sharesInput) {
                        sharesInput.style.background = '';
                    }
                }, 1000);
            } else {
                alert('目前沒有此股票的持股');
            }
        });
    }
    
    // 股票代碼自動填充股票名稱（實時辨識）
    if (stockCodeInput) {
        let inputTimeout = null;
        
        // 實時自動辨識並填入股票名稱
        stockCodeInput.addEventListener('input', () => {
            const code = stockCodeInput.value.trim();
            
            // 清除之前的延遲
            if (inputTimeout) {
                clearTimeout(inputTimeout);
            }
            
            // 延遲一點時間，等用戶輸入完成
            inputTimeout = setTimeout(() => {
                if (code && stockNameInput) {
                    const stockName = findStockName(code);
                    if (stockName) {
                        // 自動填入找到的股票名稱
                        stockNameInput.value = stockName;
                        stockNameInput.placeholder = '例如: 台積電';
                    } else {
                        // 如果沒有找到，清空名稱欄位讓用戶手動輸入
                        if (!stockNameInput.value || stockNameInput.value === code) {
                            stockNameInput.value = '';
                            stockNameInput.placeholder = '未找到，請手動輸入';
                        }
                    }
                    // 更新當前持股數提示
                    updateDividendCurrentSharesHint(code);
                } else if (!code && stockNameInput) {
                    // 如果代碼為空，清空名稱
                    stockNameInput.value = '';
                    stockNameInput.placeholder = '例如: 台積電';
                    // 隱藏持股數提示
                    updateDividendCurrentSharesHint('');
                }
            }, 300); // 300ms 延遲，避免頻繁查找
        });
        
        // 失去焦點時也檢查一次（確保即時更新）
        stockCodeInput.addEventListener('blur', () => {
            // 清除延遲，立即執行
            if (inputTimeout) {
                clearTimeout(inputTimeout);
                inputTimeout = null;
            }
            
            const code = stockCodeInput.value.trim();
            if (code && stockNameInput) {
                const stockName = findStockName(code);
                if (stockName) {
                    stockNameInput.value = stockName;
                    stockNameInput.placeholder = '例如: 台積電';
                } else if (!stockNameInput.value) {
                    // 如果沒有找到且名稱為空，使用代碼作為名稱
                    stockNameInput.value = code;
                    stockNameInput.placeholder = '未找到，請手動輸入';
                }
                // 更新當前持股數提示
                updateDividendCurrentSharesHint(code);
            } else {
                // 如果代碼為空，隱藏持股數提示
                updateDividendCurrentSharesHint('');
            }
        });
    }
    
    // 自動計算實收金額（每股股息 × 股數）
    const calculateAmount = () => {
        const perShare = parseFloat(perShareInput?.value) || 0;
        const shares = parseInt(sharesInput?.value) || 0;
        if (perShare > 0 && shares > 0 && amountInput) {
            const amount = perShare * shares;
            amountInput.value = amount.toFixed(2);
        }
    };
    
    if (perShareInput) {
        perShareInput.addEventListener('input', calculateAmount);
    }
    if (sharesInput) {
        sharesInput.addEventListener('input', calculateAmount);
    }
    
    // 返回按鈕
    if (backBtn) {
        // 移除舊的事件監聽器，避免重複綁定
        backBtn.onclick = null;
        backBtn.addEventListener('click', () => {
            goBackToLedger();
        });
    }
    
    // 保存按鈕
    if (saveBtn) {
        saveBtn.onclick = () => {
            saveDividendRecord();
        };
    }
}

// 保存股息記錄
function saveDividendRecord() {
    const stockCodeInput = document.getElementById('dividendStockCodeInput');
    const stockNameInput = document.getElementById('dividendStockNameInput');
    const dateInput = document.getElementById('dividendDateInput');
    const perShareInput = document.getElementById('dividendPerShareInput');
    const historicalPerShareInput = document.getElementById('dividendHistoricalPerShareInput');
    const sharesInput = document.getElementById('dividendSharesInput');
    const amountInput = document.getElementById('dividendAmountInput');
    const feeInput = document.getElementById('dividendFeeInput');
    const reinvestInput = document.getElementById('dividendReinvestInput');
    const noteInput = document.getElementById('dividendNoteInput');
    
    const stockCode = stockCodeInput?.value.trim() || '';
    const stockName = stockNameInput?.value.trim() || findStockName(stockCode) || stockCode;
    const date = dateInput?.value || '';
    const perShare = parseFloat(perShareInput?.value) || 0;
    const shares = parseInt(sharesInput?.value) || 0;
    const amount = parseFloat(amountInput?.value) || 0;
    const fee = parseFloat(feeInput?.value) || 0;
    const reinvest = reinvestInput?.checked || false;
    const note = noteInput?.value.trim() || '';
    
    // 驗證
    if (!stockCode || !date || perShare <= 0 || shares <= 0 || amount <= 0) {
        alert('請填寫所有必填欄位');
        return;
    }
    
    // 創建記錄
    const record = {
        type: 'dividend',
        stockCode: stockCode,
        stockName: stockName,
        date: date,
        dividendType: window.dividendType || 'cash',
        perShare: perShare,
        shares: shares,
        amount: amount,
        fee: fee,
        reinvest: reinvest,
        note: note,
        timestamp: new Date().toISOString()
    };
    
    // 保存到 localStorage
    let records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    records.push(record);
    
    // 如果是現金股利且選擇再投入，自動創建買入記錄
    if (record.dividendType === 'cash' && reinvest && amount > 0) {
        // 優先使用現價，如果沒有現價則使用平均成本，都沒有則提示用戶輸入
        const savedPrice = getStockCurrentPrice(stockCode); // 獲取保存的現價
        const portfolio = getPortfolio();
        const stock = portfolio.find(s => s.stockCode === stockCode);
        const avgCost = stock && stock.avgCost > 0 ? stock.avgCost : 0;
        
        // 優先使用現價，其次使用平均成本
        let buyPrice = savedPrice || avgCost || 0;
        
        // 如果都沒有價格，提示用戶輸入
        if (buyPrice <= 0) {
            const userPrice = prompt(`請輸入 ${stockName} (${stockCode}) 的現價（用於計算股利再投入的股數）：`);
            if (userPrice && parseFloat(userPrice) > 0) {
                buyPrice = parseFloat(userPrice);
            } else {
                // 用戶取消或輸入無效，不創建買入記錄
                console.log('未輸入價格，跳過股利再投入買入記錄');
            }
        }
        
        // 如果有有效的買入價格，計算並創建買入記錄
        if (buyPrice > 0) {
            const fee = calculateInvestmentFee(amount);
            const availableAmount = amount - fee; // 扣除手續費後可用金額
            const buyShares = Math.floor(availableAmount / buyPrice); // 向下取整
            
            if (buyShares > 0) {
                const buyRecord = {
                    type: 'buy',
                    stockCode: stockCode,
                    stockName: stockName,
                    date: date,
                    price: buyPrice,
                    shares: buyShares,
                    fee: fee,
                    isDividendReinvest: true, // 標記為股利再投入
                    dividendRecordId: record.timestamp, // 關聯的股利記錄ID
                    note: `股利再投入（來自 ${date} 現金股利，使用${savedPrice ? '現價' : avgCost ? '平均成本' : '手動輸入價格'}）${note ? ' - ' + note : ''}`,
                    timestamp: new Date().toISOString()
                };
                records.push(buyRecord);
                
                // 創建記帳本轉帳記錄（從現金帳戶轉到投資帳戶）
                try {
                    const accountingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
                    const transferRecord = {
                        type: 'transfer',
                        category: '股票再投入', // 轉帳不顯示分類
                        amount: amount, // 股利金額
                        note: `股利再投入：${stockName} (${stockCode}) ${buyShares}股 @ NT$${buyPrice.toFixed(2)}`,
                        date: date,
                        fromAccount: '現金', // 從現金帳戶
                        toAccount: '投資', // 到投資帳戶
                        linkedInvestment: true,
                        investmentRecordId: buyRecord.timestamp,
                        timestamp: new Date().toISOString()
                    };
                    accountingRecords.push(transferRecord);
                    localStorage.setItem('accountingRecords', JSON.stringify(accountingRecords));
                    console.log('已創建股利再投入轉帳記錄');
                } catch (e) {
                    console.warn('創建股利再投入轉帳記錄失敗:', e);
                }
            } else {
                // 顯示通知：不足以買入至少1股
                const availableAmount = amount - fee;
                alert(`⚠️ 股利再投入金額不足\n\n股利金額：NT$${amount.toLocaleString('zh-TW')}\n手續費：NT$${fee.toLocaleString('zh-TW')}\n可用金額：NT$${availableAmount.toLocaleString('zh-TW')}\n股票現價：NT$${buyPrice.toFixed(2)}\n\n可用金額不足以買入至少1股（需要至少 NT$${(buyPrice + fee).toLocaleString('zh-TW')}）`);
            }
        }
    }
    
    localStorage.setItem('investmentRecords', JSON.stringify(records));
    
    // 播放入帳音效（股息入帳）
    playIncomeSound();
    
    // 觸發小森對話系統（股息收入）
    // 創建一個記帳記錄格式的對象用於觸發對話
    const accountingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const dividendAccountingRecord = {
        type: 'income',
        category: '股息',
        amount: amount,
        date: date,
        timestamp: record.timestamp
    };
    if (typeof checkAndTriggerMoriDialog === 'function') {
        checkAndTriggerMoriDialog(dividendAccountingRecord, accountingRecords);
    }
    
    // 重置表單
    if (stockCodeInput) stockCodeInput.value = '';
    if (stockNameInput) stockNameInput.value = '';
    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
    }
    if (perShareInput) perShareInput.value = '0';
    if (historicalPerShareInput) historicalPerShareInput.value = '';
    if (sharesInput) sharesInput.value = '0';
    if (amountInput) amountInput.value = '0';
    if (reinvestInput) reinvestInput.checked = false;
    if (noteInput) noteInput.value = '';
    
    // 返回投資總覽
    const dividendInputPage = document.getElementById('dividendInputPage');
    const dividendPage = document.getElementById('dividendPage');
    const overview = document.getElementById('investmentOverview');
    const detailPage = document.getElementById('stockDetailPage');
    const inputPage = document.getElementById('investmentInputPage');
    const bottomNav = document.querySelector('.bottom-nav');
    const investmentActions = document.querySelector('.investment-actions');
    
    // 隱藏所有投資相關頁面
    if (dividendInputPage) dividendInputPage.style.display = 'none';
    if (dividendPage) dividendPage.style.display = 'none';
    if (detailPage) detailPage.style.display = 'none';
    if (inputPage) inputPage.style.display = 'none';
    
    // 顯示投資總覽
    if (overview) overview.style.display = 'block';
    
    // 顯示底部導航欄和操作按鈕
    if (bottomNav) bottomNav.style.display = 'flex';
    if (investmentActions) investmentActions.style.display = 'flex';
    
    // 更新顯示
    updateInvestmentOverview();
    alert('股息記錄已儲存！🎉');
}

// 計算投資手續費
function calculateInvestmentFee(totalAmount) {
    // 手續費為總金額的0.1425%，最低20元
    return Math.max(Math.round(totalAmount * 0.001425), 20);
}

// 顯示股息頁面
function showDividendPage() {
    const dividendPage = document.getElementById('dividendPage');
    const overview = document.getElementById('investmentOverview');
    const detailPage = document.getElementById('stockDetailPage');
    const inputPage = document.getElementById('investmentInputPage');
    const bottomNav = document.querySelector('.bottom-nav');
    const investmentActions = document.querySelector('.investment-actions');
    
    if (overview) overview.style.display = 'none';
    if (detailPage) detailPage.style.display = 'none';
    if (inputPage) inputPage.style.display = 'none';
    if (dividendPage) {
        dividendPage.style.display = 'block';
        updateDividendPage();
        // 隱藏底部導航欄
        if (bottomNav) bottomNav.style.display = 'none';
        // 隱藏操作按鈕
        if (investmentActions) investmentActions.style.display = 'none';
        
        // 初始化返回按鈕（返回到投資專區）
        const dividendBackBtn = document.getElementById('dividendBackBtn');
        if (dividendBackBtn) {
            // 移除舊的事件監聽器，避免重複綁定
            dividendBackBtn.onclick = null;
            dividendBackBtn.addEventListener('click', () => {
                // 返回到投資專區總覽
                if (overview) overview.style.display = 'block';
                if (detailPage) detailPage.style.display = 'none';
                if (inputPage) inputPage.style.display = 'none';
                if (dividendPage) dividendPage.style.display = 'none';
                
                // 顯示底部導航欄和操作按鈕
                if (bottomNav) bottomNav.style.display = 'flex';
                if (investmentActions) investmentActions.style.display = 'flex';
                
                // 更新投資總覽
                if (typeof updateInvestmentOverview === 'function') {
                    updateInvestmentOverview();
                }
            });
        }
    }
}

// 更新股息頁面
function updateDividendPage() {
    const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // 計算本年累積股息
    let yearDividend = 0;
    records.filter(r => r.type === 'dividend' && r.dividendType === 'cash').forEach(record => {
        const recordYear = new Date(record.date).getFullYear();
        if (recordYear === currentYear) {
            yearDividend += record.amount || 0;
        }
    });
    
    // 計算本月已入帳
    let monthDividend = 0;
    records.filter(r => r.type === 'dividend' && r.dividendType === 'cash').forEach(record => {
        const recordDate = new Date(record.date);
        if (recordDate.getFullYear() === currentYear && recordDate.getMonth() + 1 === currentMonth) {
            monthDividend += record.amount || 0;
        }
    });
    
    // 更新顯示
    const yearDividendEl = document.getElementById('yearDividendLarge');
    const monthDividendEl = document.getElementById('monthDividend');
    
    if (yearDividendEl) {
        yearDividendEl.textContent = `NT$${yearDividend.toLocaleString('zh-TW')}`;
    }
    if (monthDividendEl) {
        monthDividendEl.textContent = `NT$${monthDividend.toLocaleString('zh-TW')}`;
    }
    
    // 更新股息月曆
    updateDividendCalendar();
    
    // 更新年股息統計
    updateDividendYearStats();
    
    // 更新股息記錄列表
    updateDividendRecordsList();
}

// 更新股息月曆
function updateDividendCalendar() {
    const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    const currentYear = new Date().getFullYear();
    const dividendRecords = records.filter(r => r.type === 'dividend' && r.dividendType === 'cash');
    
    // 按月份統計
    const monthlyDividend = {};
    dividendRecords.forEach(record => {
        const recordDate = new Date(record.date);
        const recordYear = recordDate.getFullYear();
        const recordMonth = recordDate.getMonth() + 1;
        
        if (recordYear === currentYear) {
            const key = `${recordYear}-${String(recordMonth).padStart(2, '0')}`;
            if (!monthlyDividend[key]) {
                monthlyDividend[key] = {
                    month: recordMonth,
                    amount: 0,
                    count: 0
                };
            }
            monthlyDividend[key].amount += record.amount || 0;
            monthlyDividend[key].count += 1;
        }
    });
    
    const calendarGrid = document.getElementById('dividendCalendarGrid');
    if (!calendarGrid) return;
    
    let html = '';
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    
    for (let month = 1; month <= 12; month++) {
        const key = `${currentYear}-${String(month).padStart(2, '0')}`;
        const data = monthlyDividend[key] || { month, amount: 0, count: 0 };
        const isCurrentMonth = month === new Date().getMonth() + 1;
        
        html += `
            <div class="dividend-calendar-item ${isCurrentMonth ? 'current-month' : ''} ${data.amount > 0 ? 'has-dividend' : ''}">
                <div class="dividend-calendar-month">${monthNames[month - 1]}</div>
                <div class="dividend-calendar-amount">NT$${data.amount.toLocaleString('zh-TW')}</div>
                ${data.count > 0 ? `<div class="dividend-calendar-count">${data.count} 筆</div>` : '<div class="dividend-calendar-count empty">無記錄</div>'}
            </div>
        `;
    }
    
    calendarGrid.innerHTML = html;
}

// 更新年股息統計
function updateDividendYearStats() {
    const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    const dividendRecords = records.filter(r => r.type === 'dividend' && r.dividendType === 'cash');
    
    // 按年份統計
    const yearlyDividend = {};
    dividendRecords.forEach(record => {
        const recordYear = new Date(record.date).getFullYear();
        if (!yearlyDividend[recordYear]) {
            yearlyDividend[recordYear] = {
                year: recordYear,
                amount: 0,
                count: 0
            };
        }
        yearlyDividend[recordYear].amount += record.amount || 0;
        yearlyDividend[recordYear].count += 1;
    });
    
    const container = document.getElementById('dividendYearStatsContainer');
    if (!container) return;
    
    // 按年份降序排列
    const sortedYears = Object.values(yearlyDividend).sort((a, b) => b.year - a.year);
    
    if (sortedYears.length === 0) {
        container.innerHTML = `
            <div class="dividend-year-stats-empty">
                <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;">📊</div>
                <div style="color: var(--text-tertiary);">尚無股息記錄</div>
            </div>
        `;
        return;
    }
    
    // 計算總計
    const totalAmount = sortedYears.reduce((sum, y) => sum + y.amount, 0);
    const totalCount = sortedYears.reduce((sum, y) => sum + y.count, 0);
    
    let html = '';
    sortedYears.forEach(yearData => {
        const percentage = totalAmount > 0 ? ((yearData.amount / totalAmount) * 100).toFixed(1) : 0;
        html += `
            <div class="dividend-year-stat-item">
                <div class="dividend-year-stat-header">
                    <div class="dividend-year-stat-year">${yearData.year} 年</div>
                    <div class="dividend-year-stat-amount">NT$${yearData.amount.toLocaleString('zh-TW')}</div>
                </div>
                <div class="dividend-year-stat-details">
                    <div class="dividend-year-stat-count">${yearData.count} 筆記錄</div>
                    <div class="dividend-year-stat-percentage">佔總股息 ${percentage}%</div>
                </div>
                <div class="dividend-year-stat-bar">
                    <div class="dividend-year-stat-bar-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    });
    
    // 添加總計
    html += `
        <div class="dividend-year-stat-total">
            <div class="dividend-year-stat-total-label">總計</div>
            <div class="dividend-year-stat-total-amount">NT$${totalAmount.toLocaleString('zh-TW')}</div>
            <div class="dividend-year-stat-total-count">共 ${totalCount} 筆記錄</div>
        </div>
    `;
    
    container.innerHTML = html;
}

// 更新股息記錄列表
function updateDividendRecordsList() {
    const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    const dividendRecords = records.filter(r => r.type === 'dividend').sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    const list = document.getElementById('dividendRecordsList');
    if (!list) return;
    
    let html = '';
    
    // 添加增加股息按鈕（無論是否有記錄都顯示）
    html += `
        <div class="dividend-add-btn-container">
            <button class="dividend-quick-add-btn" id="dividendQuickAddBtn">
                <span class="dividend-quick-add-icon">➕</span>
                <span class="dividend-quick-add-text">新增股息</span>
            </button>
        </div>
    `;
    
    if (dividendRecords.length === 0) {
        html += `
            <div class="dividend-empty-state">
                <div class="dividend-empty-icon">
                    <img src="./image/1.png" alt="股息" style="width: 83px; height: 83px; opacity: 0.5; object-fit: contain;">
                </div>
                <div class="dividend-empty-text">尚無股息記錄</div>
                <div class="dividend-empty-hint">點擊上方按鈕開始記錄股息</div>
            </div>
        `;
    } else {
        html += dividendRecords.map(r => createRecordCard(r)).join('');
    }
    
    list.innerHTML = html;
    
    // 綁定快捷按鈕事件
    const quickAddBtn = document.getElementById('dividendQuickAddBtn');
    if (quickAddBtn) {
        // 移除舊的事件監聽器，避免重複綁定
        const newQuickAddBtn = quickAddBtn.cloneNode(true);
        quickAddBtn.parentNode.replaceChild(newQuickAddBtn, quickAddBtn);
        
        newQuickAddBtn.addEventListener('click', () => {
            // 顯示股息輸入頁面
            const dividendInputPage = document.getElementById('dividendInputPage');
            const overview = document.getElementById('investmentOverview');
            const detailPage = document.getElementById('stockDetailPage');
            const inputPage = document.getElementById('investmentInputPage');
            const dividendPage = document.getElementById('dividendPage');
            const bottomNav = document.querySelector('.bottom-nav');
            const investmentActions = document.querySelector('.investment-actions');
            
            if (overview) overview.style.display = 'none';
            if (detailPage) detailPage.style.display = 'none';
            if (inputPage) inputPage.style.display = 'none';
            if (dividendPage) dividendPage.style.display = 'none';
            if (dividendInputPage) {
                dividendInputPage.style.display = 'block';
                // 隱藏底部導航欄
                if (bottomNav) bottomNav.style.display = 'none';
                // 隱藏操作按鈕
                if (investmentActions) investmentActions.style.display = 'none';
                // 初始化股息輸入頁面
                initDividendInput();
            }
        });
    }
    
    // 綁定新增股息按鈕事件（卡片上的）
    if (dividendRecords.length > 0) {
        bindRecordOverflowMenu(list);

        list.querySelectorAll('.record-add-dividend-fab').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const stockCode = newBtn.dataset.stockCode;
                const stockName = newBtn.dataset.stockName;
                const perShare = parseFloat(newBtn.dataset.perShare) || 0;
                const shares = parseInt(newBtn.dataset.shares) || 0;
                const dividendType = newBtn.dataset.dividendType || 'cash';
                quickAddDividend(stockCode, stockName, perShare, shares, dividendType);
            });
        });
    }
}

// 成功動畫
function showSuccessAnimation() {
    // 創建慶祝動畫
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '50%';
            confetti.style.background = ['#ff69b4', '#ff9ec7', '#ffc107', '#4caf50'][Math.floor(Math.random() * 4)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 2000);
        }, i * 50);
    }
}

// ========== 定期定額管理功能 ==========

// 定期定額計劃數據結構
