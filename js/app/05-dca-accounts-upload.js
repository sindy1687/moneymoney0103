// { id, stockCode, stockName, amount, day, enabled, createdAt, lastExecuted }

// 顯示定期定額管理頁面
function showDCAManagementPage() {
    const dcaPage = document.getElementById('dcaManagementPage');
    const overview = document.getElementById('investmentOverview');
    const detailPage = document.getElementById('stockDetailPage');
    const inputPage = document.getElementById('investmentInputPage');
    const dividendPage = document.getElementById('dividendPage');
    const dcaSetupPage = document.getElementById('dcaSetupPage');
    const bottomNav = document.querySelector('.bottom-nav');
    const investmentActions = document.querySelector('.investment-actions');
    
    if (overview) overview.style.display = 'none';
    if (detailPage) detailPage.style.display = 'none';
    if (inputPage) inputPage.style.display = 'none';
    if (dividendPage) dividendPage.style.display = 'none';
    if (dcaSetupPage) dcaSetupPage.style.display = 'none';
    
    if (dcaPage) {
        dcaPage.style.display = 'block';
        if (bottomNav) bottomNav.style.display = 'none';
        if (investmentActions) investmentActions.style.display = 'none';
        updateDCAList();
    }
    
    // 綁定返回按鈕（返回到投資專區）
    const backBtn = document.getElementById('dcaBackBtn');
    if (backBtn) {
        backBtn.onclick = null;
        backBtn.addEventListener('click', () => {
            // 返回到投資專區總覽
            if (overview) overview.style.display = 'block';
            if (detailPage) detailPage.style.display = 'none';
            if (inputPage) inputPage.style.display = 'none';
            if (dividendPage) dividendPage.style.display = 'none';
            if (dcaSetupPage) dcaSetupPage.style.display = 'none';
            if (dcaPage) dcaPage.style.display = 'none';
            
            // 顯示底部導航欄和操作按鈕
            if (bottomNav) bottomNav.style.display = 'flex';
            if (investmentActions) investmentActions.style.display = 'flex';
            
            // 更新投資總覽
            if (typeof updateInvestmentOverview === 'function') {
                updateInvestmentOverview();
            }
        });
    }
    
    // 綁定新增按鈕
    const addBtn = document.getElementById('dcaAddBtn');
    if (addBtn) {
        addBtn.onclick = () => {
            playClickSound(); // 播放點擊音效
            showDCASetupPage();
        };
    }
}

// 更新定期定額列表
function updateDCAList() {
    const dcaListContainer = document.getElementById('dcaListContainer');
    if (!dcaListContainer) return;
    
    const dcaPlans = JSON.parse(localStorage.getItem('dcaPlans') || '[]');
    
    if (dcaPlans.length === 0) {
        dcaListContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <div class="empty-text">尚無定期定額計劃</div>
                <div class="empty-hint">點擊右上角「➕」新增定期定額計劃</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    dcaPlans.forEach(plan => {
        const statusText = plan.enabled ? '啟用中' : '已停用';
        const statusClass = plan.enabled ? 'active' : 'inactive';
        const lastExecuted = plan.lastExecuted ? new Date(plan.lastExecuted).toLocaleDateString('zh-TW') : '尚未執行';

        const executedCount = parseInt(plan.executedCount, 10) || 0;
        const milestone = 12;
        const progressPercent = Math.min(100, Math.round((executedCount / milestone) * 100));
        const badgeHtml = executedCount >= milestone
            ? '<span class="dca-achievement-badge" title="成就達成：第 12 期">🏅</span>'
            : '';
        
        html += `
            <div class="dca-item-card">
                <div class="dca-item-header">
                    <div class="dca-item-icon">📈</div>
                    <div class="dca-item-info">
                        <div class="dca-item-name">${plan.stockName || plan.stockCode}</div>
                        <div class="dca-item-code">${plan.stockCode}</div>
                    </div>
                    <div class="dca-item-status ${statusClass}">${statusText}</div>
                </div>
                <div class="dca-item-body">
                    <div class="dca-item-row">
                        <span class="dca-item-label">每月金額</span>
                        <span class="dca-item-value">NT$${plan.amount.toLocaleString('zh-TW')}</span>
                    </div>
                    <div class="dca-item-row">
                        <span class="dca-item-label">扣款日期</span>
                        <span class="dca-item-value">每月 ${plan.day} 號</span>
                    </div>
                    <div class="dca-item-row">
                        <span class="dca-item-label">上次執行</span>
                        <span class="dca-item-value">${lastExecuted}</span>
                    </div>

                    <div class="dca-progress">
                        <div class="dca-progress-header">
                            <span class="dca-progress-text">累積期數：第 ${executedCount} 期 / ${milestone} 期</span>
                            ${badgeHtml}
                        </div>
                        <div class="dca-progress-bar" aria-label="定期定額進度條">
                            <div class="dca-progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                </div>
                <div class="dca-item-actions">
                    <button class="dca-edit-btn" onclick="editDCAPlan('${plan.id}')">編輯</button>
                    <button class="dca-execute-btn" onclick="executeDCAPlan('${plan.id}')">立即執行</button>
                </div>
            </div>
        `;
    });
    
    dcaListContainer.innerHTML = html;
}

// 顯示定期定額設定頁面
function showDCASetupPage(planId = null) {
    const dcaSetupPage = document.getElementById('dcaSetupPage');
    const dcaManagementPage = document.getElementById('dcaManagementPage');
    const titleEl = document.getElementById('dcaSetupTitle');
    const deleteBtn = document.getElementById('dcaDeleteBtn');

    const fromAccountSelect = document.getElementById('dcaFromAccountSelect');
    const settlementAccountSelect = document.getElementById('dcaSettlementAccountSelect');

    const accounts = typeof getAccounts === 'function' ? getAccounts() : [];
    const selectedAccount = typeof getSelectedAccount === 'function' ? getSelectedAccount() : null;

    const fillAccountSelect = (selectEl, selectedId) => {
        if (!selectEl) return;
        const optionsHtml = accounts.map(a => {
            const isSelected = selectedId && a.id === selectedId;
            return `<option value="${a.id}" ${isSelected ? 'selected' : ''}>${a.name || a.id}</option>`;
        }).join('');
        selectEl.innerHTML = optionsHtml;

        // 如果沒選到任何值，給預設
        if ((!selectEl.value || selectEl.value === '') && accounts.length > 0) {
            selectEl.value = selectedId || (selectedAccount ? selectedAccount.id : accounts[0].id);
        }
    };
    
    if (dcaManagementPage) dcaManagementPage.style.display = 'none';
    if (dcaSetupPage) {
        dcaSetupPage.style.display = 'block';
        
        if (planId) {
            // 編輯模式
            const plans = JSON.parse(localStorage.getItem('dcaPlans') || '[]');
            const plan = plans.find(p => p.id === planId);
            if (plan) {
                document.getElementById('dcaStockCodeInput').value = plan.stockCode;
                document.getElementById('dcaStockNameInput').value = plan.stockName || '';
                document.getElementById('dcaAmountInput').value = plan.amount;
                document.getElementById('dcaDayInput').value = plan.day;
                document.getElementById('dcaFeeInput').value = plan.customFee || 0;
                document.getElementById('dcaAutoFeeCheckbox').checked = plan.autoFee || false;
                document.getElementById('dcaEnabledInput').checked = plan.enabled;

                // 方案 B：帳戶設定（舊資料若沒有，使用目前選擇帳戶作為預設）
                const defaultFrom = plan.fromAccountId || (selectedAccount ? selectedAccount.id : (accounts[0]?.id || ''));
                const defaultSettlement = plan.settlementAccountId || defaultFrom;
                fillAccountSelect(fromAccountSelect, defaultFrom);
                fillAccountSelect(settlementAccountSelect, defaultSettlement);

                if (titleEl) titleEl.textContent = '編輯定期定額';
                if (deleteBtn) deleteBtn.style.display = 'block';
                window.editingDCAPlanId = planId;
            }
        } else {
            // 新增模式
            document.getElementById('dcaStockCodeInput').value = '';
            document.getElementById('dcaStockNameInput').value = '';
            document.getElementById('dcaAmountInput').value = '';
            document.getElementById('dcaDayInput').value = '1';
            document.getElementById('dcaFeeInput').value = '0';
            document.getElementById('dcaAutoFeeCheckbox').checked = false;
            document.getElementById('dcaEnabledInput').checked = true;

            // 新增模式：預設用目前選擇帳戶（若存在）
            const defaultFrom = selectedAccount ? selectedAccount.id : (accounts[0]?.id || '');
            const defaultSettlement = defaultFrom;
            fillAccountSelect(fromAccountSelect, defaultFrom);
            fillAccountSelect(settlementAccountSelect, defaultSettlement);

            if (titleEl) titleEl.textContent = '新增定期定額';
            if (deleteBtn) deleteBtn.style.display = 'none';
            window.editingDCAPlanId = null;
        }
    }
    
    // 綁定返回按鈕（返回到定期定額管理頁面）
    const backBtn = document.getElementById('dcaSetupBackBtn');
    if (backBtn) {
        backBtn.onclick = null;
        backBtn.addEventListener('click', () => {
            // 返回到定期定額管理頁面
            showDCAManagementPage();
        });
    }
    
    // 綁定保存按鈕
    const saveBtn = document.getElementById('dcaSaveBtn');
    if (saveBtn) {
        saveBtn.onclick = () => {
            playClickSound(); // 播放點擊音效
            saveDCAPlan();
        };
    }
    
    // 綁定刪除按鈕
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            if (confirm('確定要刪除此定期定額計劃嗎？')) {
                deleteDCAPlan(window.editingDCAPlanId);
            }
        };
    }
    
    // 股票代碼自動填入股票名稱（使用全局查找函數）
    const stockCodeInput = document.getElementById('dcaStockCodeInput');
    const stockNameInput = document.getElementById('dcaStockNameInput');
    if (stockCodeInput && stockNameInput) {
        // 失去焦點時查找並填入股票名稱
        stockCodeInput.addEventListener('blur', () => {
            const code = stockCodeInput.value.trim();
            if (code && stockNameInput) {
                const stockName = window.findStockName ? window.findStockName(code) : null;
                if (stockName) {
                    stockNameInput.value = stockName;
                } else if (!stockNameInput.value) {
                    // 如果沒有找到且名稱為空，使用代碼作為名稱
                    stockNameInput.value = code;
                }
            }
        });
        
        // 輸入時也實時查找（延遲填入，避免打斷用戶輸入）
        stockCodeInput.addEventListener('input', () => {
            const code = stockCodeInput.value.trim();
            if (code && stockNameInput && !stockNameInput.value) {
                // 如果股票名稱欄位為空，嘗試查找
                const stockName = window.findStockName ? window.findStockName(code) : null;
                if (stockName) {
                    // 使用setTimeout延遲填入，避免打斷用戶輸入
                    setTimeout(() => {
                        if (stockCodeInput.value.trim() === code && !stockNameInput.value) {
                            stockNameInput.value = stockName;
                        }
                    }, 500);
                }
            }
        });
    }
}

// 保存定期定額計劃
function saveDCAPlan() {
    const stockCode = document.getElementById('dcaStockCodeInput').value.trim();
    const stockName = document.getElementById('dcaStockNameInput').value.trim();
    const amount = parseFloat(document.getElementById('dcaAmountInput').value);
    const day = parseInt(document.getElementById('dcaDayInput').value);

    const fromAccountId = document.getElementById('dcaFromAccountSelect')?.value || '';
    const settlementAccountId = document.getElementById('dcaSettlementAccountSelect')?.value || '';
    const feeInput = document.getElementById('dcaFeeInput');
    const autoFeeCheckbox = document.getElementById('dcaAutoFeeCheckbox');
    const autoFee = autoFeeCheckbox?.checked || false;
    const customFee = parseFloat(feeInput?.value) || 0;
    const enabled = document.getElementById('dcaEnabledInput').checked;
    
    if (!stockCode || !amount || !day) {
        alert('請填寫所有必填欄位');
        return;
    }
    
    if (amount <= 0) {
        alert('投資金額必須大於0');
        return;
    }
    
    if (day < 1 || day > 28) {
        alert('扣款日期必須在1-28號之間');
        return;
    }

    if (!fromAccountId || !settlementAccountId) {
        alert('請選擇扣款銀行帳戶與交割帳戶');
        return;
    }
    
    let plans = JSON.parse(localStorage.getItem('dcaPlans') || '[]');
    
    if (window.editingDCAPlanId) {
        // 編輯模式
        const index = plans.findIndex(p => p.id === window.editingDCAPlanId);
        if (index !== -1) {
            plans[index] = {
                ...plans[index],
                stockCode,
                stockName: stockName || stockCode,
                amount,
                day,
                customFee,
                autoFee,
                enabled,
                fromAccountId,
                settlementAccountId
            };
        }
    } else {
        // 新增模式
        const newPlan = {
            id: Date.now().toString(),
            stockCode,
            stockName: stockName || stockCode,
            amount,
            day,
            customFee,
            autoFee,
            enabled,
            fromAccountId,
            settlementAccountId,
            createdAt: new Date().toISOString(),
            lastExecuted: null,
            executedCount: 0
        };
        plans.push(newPlan);
    }
    
    localStorage.setItem('dcaPlans', JSON.stringify(plans));
    showDCAManagementPage();
}

// 編輯定期定額計劃
function editDCAPlan(planId) {
    showDCASetupPage(planId);
}

// 刪除定期定額計劃
function deleteDCAPlan(planId) {
    let plans = JSON.parse(localStorage.getItem('dcaPlans') || '[]');
    const planToDelete = plans.find(p => p.id === planId);
    
    if (!planToDelete) {
        alert('找不到要刪除的定期定額計劃');
        return;
    }
    
    // 確認刪除
    if (!confirm(`確定要刪除此定期定額計劃嗎？\n\n股票：${planToDelete.stockName || planToDelete.stockCode} (${planToDelete.stockCode})\n金額：NT$${planToDelete.amount.toLocaleString('zh-TW')}\n\n⚠️ 注意：這將同時刪除所有相關的投資記錄和記帳支出記錄！`)) {
        return;
    }
    
    const stockCode = planToDelete.stockCode;
    
    // 1. 刪除所有相關的投資記錄（isDCA: true 且 stockCode 匹配）
    let investmentRecords = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    const dcaInvestmentRecords = investmentRecords.filter(r => 
        r.type === 'buy' && 
        r.isDCA === true && 
        r.stockCode === stockCode
    );
    
    // 收集要刪除的投資記錄的 timestamp（用於匹配記帳記錄）
    // 統一轉換為字符串進行比較
    const investmentRecordIds = dcaInvestmentRecords.map(r => {
        const id = r.timestamp || r.id;
        return id ? String(id) : null;
    }).filter(id => id !== null);
    
    console.log('要刪除的投資記錄數量:', dcaInvestmentRecords.length);
    console.log('投資記錄 IDs:', investmentRecordIds);
    
    // 從投資記錄中刪除
    investmentRecords = investmentRecords.filter(r => 
        !(r.type === 'buy' && r.isDCA === true && r.stockCode === stockCode)
    );
    localStorage.setItem('investmentRecords', JSON.stringify(investmentRecords));
    
    // 2. 刪除所有相關的記帳記錄（現在是 transfer，舊資料可能仍是 expense）
    // 方法1：通過 investmentRecordId 匹配
    // 方法2：通過 note 中包含股票代碼和「定期定額」匹配（備用方案）
    let accountingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    
    // 找出要刪除的記帳記錄
    const recordsToDelete = accountingRecords.filter(r => {
        // 方法1：通過 investmentRecordId 匹配
        if (r.linkedInvestment === true && r.investmentRecordId) {
            const recordId = String(r.investmentRecordId);
            if (investmentRecordIds.includes(recordId)) {
                return true;
            }
        }
        
        // 方法2：通過 note 匹配（如果 investmentRecordId 匹配失敗）
        if (r.note && r.note.includes('定期定額') && r.note.includes(stockCode)) {
            return true;
        }
        
        return false;
    });
    
    const deletedAccountingCount = recordsToDelete.length;
    console.log('找到要刪除的記帳記錄數量:', deletedAccountingCount);
    console.log('記帳記錄詳情:', recordsToDelete.map(r => ({
        id: r.investmentRecordId,
        note: r.note,
        amount: r.amount
    })));
    
    // 從記帳記錄中刪除
    accountingRecords = accountingRecords.filter(r => {
        // 方法1：通過 investmentRecordId 匹配
        if (r.linkedInvestment === true && r.investmentRecordId) {
            const recordId = String(r.investmentRecordId);
            if (investmentRecordIds.includes(recordId)) {
                return false; // 刪除
            }
        }
        
        // 方法2：通過 note 匹配
        if (r.note && r.note.includes('定期定額') && r.note.includes(stockCode)) {
            return false; // 刪除
        }
        
        return true; // 保留
    });
    
    localStorage.setItem('accountingRecords', JSON.stringify(accountingRecords));
    
    // 3. 刪除定期定額計劃
    plans = plans.filter(p => p.id !== planId);
    localStorage.setItem('dcaPlans', JSON.stringify(plans));
    
    // 4. 更新所有相關顯示
    updateInvestmentSummary();
    updatePortfolioList();
    updateInvestmentRecords();
    updateInvestmentOverview();
    
    // 更新記帳本顯示
    if (typeof updateLedgerSummary === 'function') {
        updateLedgerSummary(accountingRecords);
    }
    if (typeof displayLedgerTransactions === 'function') {
        displayLedgerTransactions(accountingRecords);
    }
    
    // 如果正在查看該股票的詳情頁面，需要更新
    const stockDetailPage = document.getElementById('stockDetailPage');
    if (stockDetailPage && stockDetailPage.style.display !== 'none') {
        const currentStockCode = document.getElementById('stockDetailCode')?.textContent;
        if (currentStockCode === stockCode) {
            showStockDetailPage(stockCode);
        }
    }
    
    // 顯示刪除結果
    const deletedInvestmentCount = dcaInvestmentRecords.length;
    alert(`定期定額計劃已刪除！\n\n已刪除：\n- ${deletedInvestmentCount} 筆投資記錄\n- ${deletedAccountingCount} 筆記帳支出記錄`);
    
    // 返回管理頁面
    showDCAManagementPage();
}

// 執行定期定額計劃（手動觸發）
function executeDCAPlan(planId) {
    const plans = JSON.parse(localStorage.getItem('dcaPlans') || '[]');
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) {
        alert('找不到此定期定額計劃');
        return;
    }
    
    if (!plan.enabled) {
        alert('此定期定額計劃已停用');
        return;
    }
    
    // 執行定期定額扣款
    executeDCATransaction(plan);
}

// 獲取股票參考價格（從投資記錄中查找最近一次的買入價格）
function getStockReferencePrice(stockCode) {
    const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    
    // 查找該股票最近的買入記錄
    const buyRecords = records
        .filter(r => r.type === 'buy' && r.stockCode === stockCode)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (buyRecords.length > 0) {
        // 返回最近一次的買入價格
        return buyRecords[0].price;
    }
    
    // 如果沒有買入記錄，從持股中查找平均成本
    const portfolio = getPortfolio();
    const stock = portfolio.find(s => s.stockCode === stockCode);
    if (stock && stock.avgCost > 0) {
        return stock.avgCost;
    }
    
    return null;
}

// 執行定期定額交易
function executeDCATransaction(plan) {
    // 獲取參考價格
    const referencePrice = getStockReferencePrice(plan.stockCode);
    
    // 顯示執行對話框
    const modal = document.getElementById('dcaExecuteModal');
    const stockNameEl = document.getElementById('dcaExecuteStockName');
    const stockCodeEl = document.getElementById('dcaExecuteStockCode');
    const referencePriceEl = document.getElementById('dcaExecuteReferencePrice');
    const referencePriceValueEl = document.getElementById('dcaExecuteReferencePriceValue');
    const priceInput = document.getElementById('dcaExecutePriceInput');
    const priceHintEl = document.getElementById('dcaExecutePriceHint');
    const previewEl = document.getElementById('dcaExecutePreview');
    const sharesEl = document.getElementById('dcaExecuteShares');
    const feeEl = document.getElementById('dcaExecuteFee');
    const totalEl = document.getElementById('dcaExecuteTotal');
    const confirmBtn = document.getElementById('dcaExecuteConfirm');
    const cancelBtn = document.getElementById('dcaExecuteCancel');
    const closeBtn = document.getElementById('dcaExecuteModalClose');
    const resetPriceHint = () => {
        if (!priceHintEl) return;
        priceHintEl.textContent = '';
        priceHintEl.classList.remove('hint-error', 'hint-success');
    };
    resetPriceHint();

    if (!modal) {
        // 如果沒有對話框，使用舊的 prompt 方式
        const referenceText = referencePrice 
            ? `（參考：最近買入價 NT$${referencePrice.toLocaleString('zh-TW')}）` 
            : '';
        const priceInput = prompt(
            `請輸入 ${plan.stockName || plan.stockCode} (${plan.stockCode}) 的當前股價：\n${referenceText}\n\n提示：可從券商APP或網站查詢當前股價`,
            referencePrice ? referencePrice.toString() : ''
        );
        
        if (!priceInput) {
            return;
        }
        
        const price = parseFloat(priceInput);
        if (isNaN(price) || price <= 0) {
            alert('請輸入有效的股價');
            return;
        }
        
        processDCATransaction(plan, price);
        return;
    }
    
    // 設置對話框內容
    if (stockNameEl) stockNameEl.textContent = plan.stockName || plan.stockCode;
    if (stockCodeEl) stockCodeEl.textContent = plan.stockCode;
    
    if (referencePrice) {
        if (referencePriceEl) referencePriceEl.style.display = 'block';
        if (referencePriceValueEl) referencePriceValueEl.textContent = referencePrice.toLocaleString('zh-TW');
        if (priceInput) priceInput.value = referencePrice.toString();
        if (priceHintEl) {
            priceHintEl.textContent = '已套用參考價，可再更新為最新市價';
        }
    } else {
        if (referencePriceEl) referencePriceEl.style.display = 'none';
        if (priceInput) priceInput.value = '';
    }
    
    // 顯示對話框
    modal.style.display = 'flex';
    
    // 計算預覽
    const updatePreview = () => {
        const price = parseFloat(priceInput.value) || 0;
        if (price > 0) {
            // 手續費：檢查是否設定自動計算
            const fee = plan.autoFee ? calculateInvestmentFee(plan.amount) : (plan.customFee || 0);
            const availableAmount = plan.amount - fee;
            const shares = Math.floor(availableAmount / price);
            // 金額無條件進位為整數
            const actualCost = Math.ceil(shares * price + fee);
            
            if (previewEl) previewEl.style.display = 'block';
            if (sharesEl) sharesEl.textContent = `${shares.toLocaleString('zh-TW')} 股`;
            if (feeEl) feeEl.textContent = `NT$${fee.toLocaleString('zh-TW')}`;
            if (totalEl) totalEl.textContent = `NT$${actualCost.toLocaleString('zh-TW')}`;
            
            if (confirmBtn) {
                confirmBtn.disabled = shares <= 0;
                confirmBtn.style.opacity = shares <= 0 ? '0.5' : '1';
            }
        } else {
            if (previewEl) previewEl.style.display = 'none';
            if (confirmBtn) confirmBtn.disabled = true;
        }
    };
    
    // 綁定輸入事件
    if (priceInput) {
        priceInput.oninput = () => {
            priceInput.dataset.userEdited = 'true';
            resetPriceHint();
            updatePreview();
        };
        priceInput.onfocus = () => priceInput.select();
    }

    const tryAutoFillCurrentPrice = async () => {
        if (!priceInput || priceInput.dataset.fetching === 'true') return;
        if (priceInput.dataset.userEdited === 'true') return;
        priceInput.dataset.fetching = 'true';
        if (priceHintEl) {
            priceHintEl.textContent = '自動讀取現價中…';
            priceHintEl.classList.remove('hint-error');
        }
        priceInput.disabled = true;
        priceInput.classList.add('is-loading');
        try {
            const autoPrice = await fetchStockPrice(plan.stockCode, {
                allowPrompt: false,
                maxAgeMs: 60 * 1000
            });
            if (priceInput.dataset.userEdited === 'true') {
                return;
            }
            if (autoPrice && !isNaN(autoPrice)) {
                const numericPrice = Number(autoPrice);
                const displayValue = Number.isFinite(numericPrice)
                    ? (numericPrice % 1 === 0 ? numericPrice.toString() : numericPrice.toFixed(2))
                    : autoPrice.toString();
                priceInput.value = displayValue;
                if (priceHintEl) {
                    priceHintEl.textContent = '已自動套用最新現價';
                    priceHintEl.classList.remove('hint-error');
                    priceHintEl.classList.add('hint-success');
                }
                updatePreview();
            } else if (priceHintEl) {
                priceHintEl.textContent = '無法取得現價，請手動輸入';
                priceHintEl.classList.remove('hint-success');
                priceHintEl.classList.add('hint-error');
            }
        } catch (error) {
            console.warn('自動取得定期定額現價失敗:', error);
            if (priceHintEl) {
                priceHintEl.textContent = '無法取得現價，請手動輸入';
                priceHintEl.classList.remove('hint-success');
                priceHintEl.classList.add('hint-error');
            }
        } finally {
            priceInput.disabled = false;
            priceInput.classList.remove('is-loading');
            delete priceInput.dataset.fetching;
        }
    };
    
    // 綁定確認按鈕
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            playClickSound(); // 播放點擊音效
            const price = parseFloat(priceInput.value) || 0;
            if (price <= 0) {
                alert('請輸入有效的股價');
                return;
            }
            modal.style.display = 'none';
            processDCATransaction(plan, price);
        };
    }
    
    // 綁定取消和關閉按鈕
    const closeModal = () => {
        modal.style.display = 'none';
    };
    
    if (cancelBtn) cancelBtn.onclick = closeModal;
    if (closeBtn) closeBtn.onclick = closeModal;
    if (modal.querySelector('.modal-overlay')) {
        modal.querySelector('.modal-overlay').onclick = closeModal;
    }
    
    // 初始化預覽
    updatePreview();
    tryAutoFillCurrentPrice();
}

// 處理定期定額交易（實際執行）
function processDCATransaction(plan, price) {
    
    // 計算可買入的股數（扣除手續費）
    // 手續費：檢查是否設定自動計算
    const fee = plan.autoFee ? calculateInvestmentFee(plan.amount) : (plan.customFee || 0);
    const availableAmount = plan.amount - fee;
    const shares = Math.floor(availableAmount / price);
    
    if (shares <= 0) {
        alert('投資金額不足以購買至少1股');
        return;
    }
    
    // 金額無條件進位為整數（例如 3999.7 → 4000）
    const actualCost = Math.ceil(shares * price + fee);
    const today = new Date().toISOString().split('T')[0];

    // 計算本次執行期數（以執行次數為準：第 N 期）
    const nextCycleNumber = (plan.executedCount || 0) + 1;
    
    // 創建投資記錄
    const investmentRecord = {
        type: 'buy',
        stockCode: plan.stockCode,
        stockName: plan.stockName || plan.stockCode,
        investmentType: 'stock',
        date: today,
        price: price,
        shares: shares,
        fee: fee,
        isDCA: true,
        dcaPlanId: plan.id,
        dcaCycleNumber: nextCycleNumber,
        settlementAccountId: plan.settlementAccountId || plan.fromAccountId || null,
        note: '定期定額自動扣款',
        timestamp: new Date().toISOString()
    };
    
    // 保存投資記錄
    let investmentRecords = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
    investmentRecords.push(investmentRecord);
    localStorage.setItem('investmentRecords', JSON.stringify(investmentRecords));
    
    // 方案 B：在記帳本中記錄「轉帳」：銀行 → 交割帳戶（投資不算生活支出）
    const fromAccountId = plan.fromAccountId || (typeof getSelectedAccount === 'function' ? getSelectedAccount()?.id : null);
    const settlementAccountId = plan.settlementAccountId || fromAccountId;

    const accountingRecord = {
        type: 'transfer',
        category: plan.stockName ? `${plan.stockCode} ${plan.stockName}` : plan.stockCode,
        amount: actualCost,
        fromAccount: fromAccountId,
        toAccount: settlementAccountId,
        note: `定期定額：${plan.stockName || plan.stockCode} (${plan.stockCode}) ${shares}股・第 ${nextCycleNumber} 期`,
        date: today,
        timestamp: new Date().toISOString(),
        linkedInvestment: true,
        investmentRecordId: investmentRecord.timestamp
    };
    
    let accountingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    accountingRecords.push(accountingRecord);
    localStorage.setItem('accountingRecords', JSON.stringify(accountingRecords));
    
    // 更新定期定額計劃的最後執行時間
    let dcaPlans = JSON.parse(localStorage.getItem('dcaPlans') || '[]');
    const planIndex = dcaPlans.findIndex(p => p.id === plan.id);
    if (planIndex !== -1) {
        dcaPlans[planIndex].lastExecuted = new Date().toISOString();
        dcaPlans[planIndex].executedCount = nextCycleNumber;
        localStorage.setItem('dcaPlans', JSON.stringify(dcaPlans));
    }

    // 小撒花（每期成功）
    if (typeof showSuccessAnimation === 'function') {
        showSuccessAnimation();
    }
    
    // 更新顯示
    updateInvestmentOverview();
    if (typeof updateDCAList === 'function') {
        updateDCAList();
    }
    if (typeof updateLedgerSummary === 'function') {
        updateLedgerSummary(accountingRecords);
    }
    if (typeof displayLedgerTransactions === 'function') {
        displayLedgerTransactions(accountingRecords);
    }
    
    setTimeout(() => {
        alert(`定期定額扣款成功！\n${plan.stockName || plan.stockCode} (${plan.stockCode})\n${shares}股 @ NT$${price.toLocaleString('zh-TW')}\n總金額：NT$${actualCost.toLocaleString('zh-TW')}\n\n✓ 已自動記錄為「轉帳」（銀行 → 交割）`);
    }, 250);
    
    // 如果是在管理頁面，更新列表
    const dcaPage = document.getElementById('dcaManagementPage');
    if (dcaPage && dcaPage.style.display !== 'none') {
        updateDCAList();
    }
}

// 檢查並執行到期的定期定額計劃（在頁面載入時調用）
function checkAndExecuteDCAPlans() {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    
    const plans = JSON.parse(localStorage.getItem('dcaPlans') || '[]');
    const enabledPlans = plans.filter(p => p.enabled);

    const promptedKey = 'dcaMonthlyPrompted';
    const promptedMap = JSON.parse(localStorage.getItem(promptedKey) || '{}');
    if (!promptedMap[currentMonthKey]) promptedMap[currentMonthKey] = {};
    
    enabledPlans.forEach(plan => {
        // 檢查是否應該執行（扣款日期已到）
        if (currentDay >= plan.day) {
            // 檢查本月是否已執行
            const lastExecuted = plan.lastExecuted ? new Date(plan.lastExecuted) : null;
            const shouldExecute = !lastExecuted || 
                lastExecuted.getFullYear() !== currentYear || 
                lastExecuted.getMonth() + 1 !== currentMonth;
            
            if (shouldExecute) {
                // 避免同一方案同月反覆跳提醒（例如使用者重整頁面）
                const planId = String(plan.id || '');
                if (planId && promptedMap[currentMonthKey] && promptedMap[currentMonthKey][planId]) {
                    return;
                }
                if (planId) {
                    promptedMap[currentMonthKey][planId] = true;
                    localStorage.setItem(promptedKey, JSON.stringify(promptedMap));
                }

                // 提示用戶執行定期定額
                if (confirm(`定期定額計劃提醒：\n${plan.stockName || plan.stockCode} (${plan.stockCode})\n每月 ${plan.day} 號扣款 NT$${plan.amount.toLocaleString('zh-TW')}\n\n是否現在執行？`)) {
                    executeDCATransaction(plan);
                }
            }
        }
    });
}

// 頁面載入時檢查定期定額計劃（在現有的 DOMContentLoaded 中調用）
// 這個函數會在 initInvestmentPage 或其他初始化函數中調用

// ========== 帳戶管理功能 ==========

// 帳戶數據結構
// { id, name, currency, initialBalance, createdAt }

// 獲取所有帳戶
function getAccounts() {
    return JSON.parse(localStorage.getItem('accounts') || '[]');
}

// 保存帳戶列表
function saveAccounts(accounts) {
    const payload = JSON.stringify(accounts);
    try {
        localStorage.setItem('accounts', payload);
        return true;
    } catch (error) {
        if (!(error && error.name === 'QuotaExceededError')) throw error;

        const compactAccounts = (accounts || []).map((a) => {
            if (!a || !a.image) return a;
            const next = { ...a };
            delete next.image;
            return next;
        });

        try {
            localStorage.setItem('accounts', JSON.stringify(compactAccounts));
            if (typeof showNotification === 'function') {
                showNotification('儲存空間不足，已自動移除帳戶圖片後儲存', 'error');
            }
            return true;
        } catch (retryError) {
            if (retryError && retryError.name === 'QuotaExceededError') {
                alert('儲存空間不足，請先清理資料後再試。');
                return false;
            }
            throw retryError;
        }
    }
}

async function compactAccountImagesForStorage(accounts) {
    if (!Array.isArray(accounts)) return [];
    if (typeof compressImage !== 'function') return accounts;
    const compacted = [];
    for (const account of accounts) {
        if (!account || !account.image || typeof account.image !== 'string' || !account.image.startsWith('data:image/')) {
            compacted.push(account);
            continue;
        }
        try {
            const compressed = await compressImage(account.image, 240, 240, 0.55);
            compacted.push({ ...account, image: compressed });
        } catch (_) {
            compacted.push(account);
        }
    }
    return compacted;
}

// 獲取當前選中的帳戶
function getSelectedAccount() {
    return window.selectedAccount || getDefaultAccount();
}

// 獲取默認帳戶
function getDefaultAccount() {
    const accounts = getAccounts();
    if (accounts.length === 0) {
        // 如果沒有帳戶，返回 null，讓調用者處理
        return null;
    }
    // 返回第一個帳戶作為默認
    return accounts[0];
}

// 計算帳戶餘額
function calculateAccountBalance(accountId) {
    const account = getAccounts().find(a => a.id === accountId);
    if (!account) return 0;
    
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    let balance = account.initialBalance || 0;
    
    records.forEach(record => {
        if (record.type === 'transfer') {
            // 轉帳：不依賴 record.account
            if (record.fromAccount === accountId) {
                balance -= record.amount;
            } else if (record.toAccount === accountId) {
                balance += record.amount;
            }
            return;
        }

        if (record.account === accountId) {
            if (record.type === 'income') {
                balance += record.amount;
            } else if (record.type === 'expense' || !record.type) {
                balance -= record.amount;
            }
        }
    });
    
    return balance;
}

// 顯示帳戶選擇對話框
function showAccountSelectModal() {
    const modal = document.getElementById('accountSelectModal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    updateAccountList();
    
    // 綁定關閉按鈕
    const closeBtn = document.getElementById('accountModalClose');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
    
    // 綁定遮罩點擊關閉
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
        overlay.onclick = () => {
            modal.style.display = 'none';
        };
    }
    
    // 綁定新增帳戶按鈕
    const addBtn = document.getElementById('accountAddBtn');
    if (addBtn) {
        addBtn.onclick = () => {
            modal.style.display = 'none';
            showAccountManageModal();
        };
    }
    
    // 綁定帳戶選擇事件
    const accountList = document.getElementById('accountList');
    if (accountList) {
        // 綁定詳情按鈕事件
        accountList.querySelectorAll('.account-detail-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                e.preventDefault(); // 阻止默認行為
                const accountId = btn.dataset.accountId || btn.closest('.account-item')?.dataset.accountId;
                if (accountId && typeof showAccountDetail === 'function') {
                    showAccountDetail(accountId);
                }
            });
        });
        
        // 綁定編輯按鈕事件
        accountList.querySelectorAll('.account-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                e.preventDefault(); // 阻止默認行為
                const accountId = btn.dataset.accountId || btn.closest('.account-item')?.dataset.accountId;
                if (accountId) {
                    editAccount(accountId);
                }
            });
        });
        
        // 綁定帳戶選擇事件
        accountList.querySelectorAll('.account-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // 如果點擊的是編輯或詳情按鈕，不觸發選擇
                if (e.target.classList.contains('account-edit-btn') || e.target.closest('.account-edit-btn') ||
                    e.target.classList.contains('account-detail-btn') || e.target.closest('.account-detail-btn')) {
                    return;
                }
                
                const accountId = item.dataset.accountId;
                const accounts = getAccounts();
                const account = accounts.find(a => a.id === accountId);
                
                if (account) {
                    window.selectedAccount = account;
                    // 更新所有相關顯示
                    updateAllAccountRelatedDisplays();
                    modal.style.display = 'none';
                }
            });
        });
    }
}

// 更新帳戶列表顯示
function updateAccountList() {
    const accountList = document.getElementById('accountList');
    if (!accountList) return;
    
    const accounts = getAccounts();
    const selectedAccount = getSelectedAccount();
    
    if (accounts.length === 0) {
        accountList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 16px;">💳</div>
                <div>尚無帳戶</div>
                <div style="font-size: 12px; margin-top: 8px; color: #ccc;">點擊下方「新增帳戶」開始</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    accounts.forEach(account => {
        const balance = calculateAccountBalance(account.id);
        const isSelected = selectedAccount && selectedAccount.id === account.id;
        
        // 顯示帳戶圖片或默認圖標
        const accountIcon = account.image 
            ? `<img src="${account.image}" alt="${account.name}" class="account-item-icon-image">`
            : '<div class="account-item-icon">💳</div>';
        
        html += `
            <div class="account-item ${isSelected ? 'selected' : ''}" data-account-id="${account.id}">
                ${accountIcon}
                <div class="account-item-info">
                    <div class="account-item-name">${account.name}</div>
                    <div class="account-item-currency">${account.currency}</div>
                </div>
                <div class="account-item-balance">
                    <div class="account-balance-value">${account.currency} $${balance.toLocaleString('zh-TW')}</div>
                </div>
                <button class="account-detail-btn" data-account-id="${account.id}" title="詳情">👁️</button>
                <button class="account-edit-btn" data-account-id="${account.id}" title="編輯">✏️</button>
            </div>
        `;
    });
    
    accountList.innerHTML = html;
}

// 更新所有帳戶相關的顯示
function updateAllAccountRelatedDisplays() {
    // 1. 更新帳戶顯示（記帳輸入頁面）
    updateAccountDisplay();
    
    // 2. 更新帳戶列表（帳戶選擇對話框）
    updateAccountList();
    
    // 3. 更新帳本標題
    updateLedgerTitle();
    
    // 4. 如果記帳本頁面可見，重新初始化
    const pageLedger = document.getElementById('pageLedger');
    if (pageLedger && pageLedger.style.display !== 'none') {
        if (typeof initLedger === 'function') {
            initLedger();
        }
    }
    
    // 4. 如果圖表頁面可見，更新圖表
    const pageChart = document.getElementById('pageChart');
    if (pageChart && pageChart.style.display !== 'none') {
        if (typeof updateAllCharts === 'function') {
            updateAllCharts();
        }
    }
    
    // 5. 如果預算頁面可見，重新初始化
    const pageBudget = document.getElementById('pageBudget');
    if (pageBudget && pageBudget.style.display !== 'none') {
        if (typeof initBudget === 'function') {
            initBudget();
        }
    }
}

// 更新帳戶顯示
function updateAccountDisplay() {
    const accountInfo = document.querySelector('.account-info');
    const selectedAccount = getSelectedAccount();
    
    if (accountInfo) {
        if (selectedAccount) {
            const balance = calculateAccountBalance(selectedAccount.id);
            // 美化帳戶信息顯示
            accountInfo.innerHTML = `
                <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: linear-gradient(135deg, rgba(255, 182, 217, 0.15) 0%, rgba(255, 158, 199, 0.1) 100%); border-radius: 8px; border: 1px solid rgba(255, 182, 217, 0.3);">
                    <span style="font-size: 14px;">💳</span>
                    <span style="font-size: 13px; font-weight: 600; color: #333;">${selectedAccount.name}</span>
                    <span style="font-size: 12px; color: #666; background: rgba(255, 182, 217, 0.2); padding: 2px 6px; border-radius: 4px; font-weight: 500;">${selectedAccount.currency}</span>
                    <span style="font-size: 14px; font-weight: 700; color: #ff69b4; margin-left: 4px;">${balance >= 0 ? '+' : ''}${balance.toLocaleString('zh-TW')}</span>
                </span>
            `;
            accountInfo.style.cursor = '';
            accountInfo.onclick = null;
        } else {
            accountInfo.innerHTML = `
                <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: linear-gradient(135deg, rgba(255, 105, 180, 0.1) 0%, rgba(255, 182, 217, 0.1) 100%); border-radius: 8px; border: 1px dashed #ff69b4; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='linear-gradient(135deg, rgba(255, 105, 180, 0.15) 0%, rgba(255, 182, 217, 0.15) 100%)'" onmouseout="this.style.background='linear-gradient(135deg, rgba(255, 105, 180, 0.1) 0%, rgba(255, 182, 217, 0.1) 100%)'">
                    <span style="font-size: 14px;">➕</span>
                    <span style="font-size: 13px; font-weight: 600; color: #ff69b4;">點擊創建帳戶</span>
                </span>
            `;
            accountInfo.style.cursor = 'pointer';
            accountInfo.onclick = () => {
                showAccountManageModal();
            };
        }
    }
}

// 顯示帳戶管理對話框
function showAccountManageModal(accountId = null) {
    const modal = document.getElementById('accountManageModal');
    const titleEl = document.getElementById('accountManageTitle');
    const deleteBtn = document.getElementById('accountDeleteBtn');
    
    if (!modal) return;
    
    modal.style.display = 'flex';
    
    // 初始化圖片上傳功能
    initAccountImageUpload();
    
    if (accountId) {
        // 編輯模式
        const accounts = getAccounts();
        const account = accounts.find(a => a.id === accountId);
        if (account) {
            document.getElementById('accountNameInput').value = account.name;
            document.getElementById('accountCurrencyInput').value = account.currency;
            document.getElementById('accountBalanceInput').value = account.initialBalance || 0;
            
            // 顯示帳戶圖片
            if (account.image) {
                const previewImg = document.getElementById('accountImagePreviewImg');
                const placeholder = document.getElementById('accountImagePlaceholder');
                const removeBtn = document.getElementById('accountImageRemoveBtn');
                if (previewImg) {
                    previewImg.src = account.image;
                    previewImg.style.display = 'block';
                }
                if (placeholder) placeholder.style.display = 'none';
                if (removeBtn) removeBtn.style.display = 'block';
            }
            
            if (titleEl) titleEl.textContent = '編輯帳戶';
            if (deleteBtn) deleteBtn.style.display = 'block';
            window.editingAccountId = accountId;
        }
    } else {
        // 新增模式
        document.getElementById('accountNameInput').value = '';
        document.getElementById('accountCurrencyInput').value = 'TWD';
        document.getElementById('accountBalanceInput').value = '0';
        
        // 重置圖片
        const previewImg = document.getElementById('accountImagePreviewImg');
        const placeholder = document.getElementById('accountImagePlaceholder');
        const removeBtn = document.getElementById('accountImageRemoveBtn');
        if (previewImg) {
            previewImg.src = '';
            previewImg.style.display = 'none';
        }
        if (placeholder) placeholder.style.display = 'block';
        if (removeBtn) removeBtn.style.display = 'none';
        
        if (titleEl) titleEl.textContent = '新增帳戶';
        if (deleteBtn) deleteBtn.style.display = 'none';
        window.editingAccountId = null;
    }
    
    // 綁定返回按鈕
    const backBtn = document.getElementById('accountManageBackBtn');
    if (backBtn) {
        backBtn.onclick = () => {
            goBackToLedger();
        };
    }
    
    // 綁定關閉按鈕
    const closeBtn = document.getElementById('accountManageClose');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
    
    // 綁定保存按鈕
    const saveBtn = document.getElementById('accountSaveBtn');
    if (saveBtn) {
        saveBtn.onclick = () => {
            playClickSound(); // 播放點擊音效
            saveAccount().catch((error) => {
                console.error('saveAccount failed:', error);
                alert('儲存帳戶失敗，請稍後再試');
            });
        };
    }
    
    // 綁定刪除按鈕
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            if (confirm('確定要刪除此帳戶嗎？\n注意：刪除帳戶不會刪除相關的記帳記錄。')) {
                deleteAccount(window.editingAccountId);
            }
        };
    }
    
    // 綁定遮罩點擊關閉
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
        overlay.onclick = () => {
            modal.style.display = 'none';
        };
    }
}

// 保存帳戶
async function saveAccount() {
    const name = document.getElementById('accountNameInput').value.trim();
    const currency = document.getElementById('accountCurrencyInput').value;
    const balance = parseFloat(document.getElementById('accountBalanceInput').value) || 0;
    
    // 獲取帳戶圖片
    const previewImg = document.getElementById('accountImagePreviewImg');
    const accountImage = previewImg && previewImg.style.display !== 'none' ? previewImg.src : null;
    
    if (!name) {
        alert('請輸入帳戶名稱');
        return;
    }
    
    let accounts = getAccounts();
    
    if (window.editingAccountId) {
        // 編輯模式
        const index = accounts.findIndex(a => a.id === window.editingAccountId);
        if (index !== -1) {
            accounts[index] = {
                ...accounts[index],
                name,
                currency,
                initialBalance: balance,
                image: accountImage
            };
        }
    } else {
        // 新增模式
        const newAccount = {
            id: Date.now().toString(),
            name,
            currency,
            initialBalance: balance,
            image: accountImage,
            createdAt: new Date().toISOString()
        };
        accounts.push(newAccount);
    }
    
    if (!saveAccounts(accounts)) {
        const compacted = await compactAccountImagesForStorage(accounts);
        if (!saveAccounts(compacted)) {
            return;
        }
        accounts = compacted;
    }
    
    // 如果是新增帳戶，自動選中
    if (!window.editingAccountId) {
        const newAccount = accounts[accounts.length - 1];
        window.selectedAccount = newAccount;
    } else {
        // 編輯模式，更新選中的帳戶信息
        if (window.selectedAccount && window.selectedAccount.id === window.editingAccountId) {
            const updatedAccount = accounts.find(a => a.id === window.editingAccountId);
            if (updatedAccount) {
                window.selectedAccount = updatedAccount;
            }
        }
    }
    
    // 關閉對話框
    document.getElementById('accountManageModal').style.display = 'none';
    
    // 更新所有相關顯示
    updateAllAccountRelatedDisplays();
    
    // 顯示選擇對話框
    showAccountSelectModal();
}

// 顯示帳戶詳情
function showAccountDetail(accountId) {
    const modal = document.getElementById('accountDetailModal');
    const content = document.getElementById('accountDetailContent');
    if (!modal || !content) return;
    
    const accounts = getAccounts();
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;
    
    // 計算當前餘額
    const currentBalance = calculateAccountBalance(accountId);
    const initialBalance = account.initialBalance || 0;
    
    // 獲取相關交易記錄
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const accountRecords = records.filter(r => r.account === accountId);
    
    // 統計數據
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    let monthIncome = 0;
    let monthExpense = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let transactionCount = 0;
    
    accountRecords.forEach(record => {
        const recordDate = new Date(record.date);
        const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (record.type === 'income') {
            totalIncome += record.amount || 0;
            if (recordMonth === currentMonth) {
                monthIncome += record.amount || 0;
            }
        } else if (record.type === 'expense' || !record.type) {
            totalExpense += record.amount || 0;
            if (recordMonth === currentMonth) {
                monthExpense += record.amount || 0;
            }
        }
        transactionCount++;
    });
    
    // 格式化創建時間
    const createdAt = account.createdAt ? new Date(account.createdAt) : null;
    const createdDateStr = createdAt ? `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}` : '未知';
    
    // 生成詳情內容
    const accountIcon = account.image 
        ? `<img src="${account.image}" alt="${account.name}" class="account-detail-icon-image">`
        : '<div class="account-detail-icon">💳</div>';
    
    content.innerHTML = `
        <div class="account-detail-section">
            <div class="account-detail-header">
                ${accountIcon}
                <div class="account-detail-name">${account.name}</div>
            </div>
            <div class="account-detail-balance">
                <div class="balance-label">當前餘額</div>
                <div class="balance-value">${account.currency} $${currentBalance.toLocaleString('zh-TW')}</div>
            </div>
        </div>
        
        <div class="account-detail-section">
            <div class="detail-section-title">基本信息</div>
            <div class="detail-item">
                <span class="detail-label">帳戶名稱</span>
                <span class="detail-value">${account.name}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">幣別</span>
                <span class="detail-value">${account.currency}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">初始餘額</span>
                <span class="detail-value">${account.currency} $${initialBalance.toLocaleString('zh-TW')}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">創建時間</span>
                <span class="detail-value">${createdDateStr}</span>
            </div>
        </div>
        
        <div class="account-detail-section">
            <div class="detail-section-title">本月統計</div>
            <div class="detail-item">
                <span class="detail-label">本月收入</span>
                <span class="detail-value income">+${account.currency} $${monthIncome.toLocaleString('zh-TW')}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">本月支出</span>
                <span class="detail-value expense">-${account.currency} $${monthExpense.toLocaleString('zh-TW')}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">本月淨額</span>
                <span class="detail-value ${(monthIncome - monthExpense) >= 0 ? 'income' : 'expense'}">${(monthIncome - monthExpense) >= 0 ? '+' : ''}${account.currency} $${(monthIncome - monthExpense).toLocaleString('zh-TW')}</span>
            </div>
        </div>
        
        <div class="account-detail-section">
            <div class="detail-section-title">總計統計</div>
            <div class="detail-item">
                <span class="detail-label">總收入</span>
                <span class="detail-value income">+${account.currency} $${totalIncome.toLocaleString('zh-TW')}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">總支出</span>
                <span class="detail-value expense">-${account.currency} $${totalExpense.toLocaleString('zh-TW')}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">交易次數</span>
                <span class="detail-value">${transactionCount} 筆</span>
            </div>
        </div>
        
        <div class="account-detail-actions">
            <button class="account-detail-edit-btn" onclick="editAccountFromDetail('${accountId}')">✏️ 編輯帳戶</button>
        </div>
    `;
    
    // 顯示對話框
    modal.style.display = 'flex';
    
    // 綁定關閉按鈕
    const closeBtn = document.getElementById('accountDetailClose');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
    
    // 綁定返回按鈕
    const backBtn = document.getElementById('accountDetailBackBtn');
    if (backBtn) {
        backBtn.onclick = () => {
            goBackToLedger();
        };
    }
    
    // 綁定遮罩點擊關閉
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
        overlay.onclick = () => {
            modal.style.display = 'none';
        };
    }
}

// 從詳情頁面編輯帳戶
function editAccountFromDetail(accountId) {
    const detailModal = document.getElementById('accountDetailModal');
    if (detailModal) {
        detailModal.style.display = 'none';
    }
    showAccountManageModal(accountId);
}

// 編輯帳戶
function editAccount(accountId) {
    const selectModal = document.getElementById('accountSelectModal');
    if (selectModal) {
        selectModal.style.display = 'none';
    }
    showAccountManageModal(accountId);
}

// 刪除帳戶
function deleteAccount(accountId) {
    let accounts = getAccounts();
    accounts = accounts.filter(a => a.id !== accountId);
    saveAccounts(accounts);
    
    // 如果刪除的是當前選中的帳戶，切換到默認帳戶
    if (window.selectedAccount && window.selectedAccount.id === accountId) {
        if (accounts.length > 0) {
            window.selectedAccount = accounts[0];
        } else {
            window.selectedAccount = null;
        }
    }
    
    // 關閉對話框並更新所有相關顯示
    document.getElementById('accountManageModal').style.display = 'none';
    updateAllAccountRelatedDisplays();
    showAccountSelectModal();
}

// 初始化帳戶管理
function initAccountManagement() {
    // 檢查是否為第一次使用
    const accounts = getAccounts();
    const isFirstTime = accounts.length === 0;
    
    if (isFirstTime) {
        // 第一次使用，直接設置默認選中為空
        window.selectedAccount = null;
        updateAccountDisplay();
    } else {
        // 已有帳戶，設置默認選中
        window.selectedAccount = accounts[0];
        updateAccountDisplay();
    }
}


// ========== 表情選擇功能 ==========

// 常用表情列表
const commonEmojis = [
    '😊', '😄', '😃', '😁', '😆', '😅', '😂', '🤣',
    '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
    '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪',
    '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒',
    '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖',
    '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
    '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰',
    '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶',
    '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮',
    '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴',
    '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠',
    '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀',
    '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹',
    '😻', '😼', '😽', '🙀', '😿', '😾'
];

// 初始化表情選擇器
function initEmojiSelector() {
    const emojiModal = document.getElementById('emojiSelectModal');
    const emojiGrid = document.getElementById('emojiGrid');
    const emojiModalClose = document.getElementById('emojiModalClose');
    const modalOverlay = emojiModal?.querySelector('.modal-overlay');
    
    if (!emojiModal || !emojiGrid) return;
    
    // 生成表情網格
    emojiGrid.innerHTML = '';
    
    // 添加常用表情
    commonEmojis.forEach(emoji => {
        const emojiBtn = document.createElement('button');
        emojiBtn.className = 'emoji-item';
        emojiBtn.textContent = emoji;
        emojiBtn.setAttribute('data-emoji', emoji);
        emojiBtn.setAttribute('data-type', 'emoji');
        emojiBtn.addEventListener('click', () => {
            selectEmoji(emoji, 'emoji');
        });
        emojiGrid.appendChild(emojiBtn);
    });
    
    // 添加圖片表情區域
    const imageEmojiSection = document.createElement('div');
    imageEmojiSection.className = 'emoji-section';
    imageEmojiSection.innerHTML = '<div class="emoji-section-title">圖片表情</div>';
    const imageEmojiGrid = document.createElement('div');
    imageEmojiGrid.className = 'emoji-grid image-emoji-grid';
    imageEmojiSection.appendChild(imageEmojiGrid);
    emojiGrid.parentElement.appendChild(imageEmojiSection);
    
    // 載入已保存的圖片表情
    loadImageEmojis(imageEmojiGrid);
    
    // 添加上傳按鈕
    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'emoji-upload-btn';
    uploadBtn.innerHTML = '📷 上傳圖片表情';
    uploadBtn.addEventListener('click', () => {
        uploadImageEmoji(imageEmojiGrid);
    });
    imageEmojiSection.appendChild(uploadBtn);
    
    // 關閉對話框
    if (emojiModalClose) {
        emojiModalClose.addEventListener('click', () => {
            hideEmojiSelectModal();
        });
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            hideEmojiSelectModal();
        });
    }
}

// 顯示表情選擇對話框
function showEmojiSelectModal() {
    const emojiModal = document.getElementById('emojiSelectModal');
    if (emojiModal) {
        emojiModal.style.display = 'block';
    }
}

// 隱藏表情選擇對話框
function hideEmojiSelectModal() {
    const emojiModal = document.getElementById('emojiSelectModal');
    if (emojiModal) {
        emojiModal.style.display = 'none';
    }
}

// 選擇表情
function selectEmoji(emoji, type) {
    const emojiBtn = document.querySelector('.emoji-btn');
    if (emojiBtn) {
        if (type === 'emoji') {
            emojiBtn.textContent = emoji;
            window.selectedEmoji = { type: 'emoji', value: emoji };
        } else if (type === 'image') {
            // 對於圖片，顯示一個圖標或縮略圖
            emojiBtn.innerHTML = `<img src="${emoji}" alt="表情" class="emoji-btn-image">`;
            window.selectedEmoji = { type: 'image', value: emoji };
        }
    }
    hideEmojiSelectModal();
}

// 載入已保存的圖片表情
function loadImageEmojis(container) {
    const savedEmojis = JSON.parse(localStorage.getItem('imageEmojis') || '[]');
    savedEmojis.forEach((emojiData, index) => {
        const emojiBtn = document.createElement('button');
        emojiBtn.className = 'emoji-item image-emoji-item';
        emojiBtn.innerHTML = `<img src="${emojiData.url}" alt="表情" class="emoji-preview-image">`;
        emojiBtn.setAttribute('data-emoji', emojiData.url);
        emojiBtn.setAttribute('data-type', 'image');
        emojiBtn.addEventListener('click', () => {
            selectEmoji(emojiData.url, 'image');
        });
        container.appendChild(emojiBtn);
    });
}

// 上傳圖片表情
function uploadImageEmoji(container) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // 直接使用原始圖片，不進行裁切
                const imageData = event.target.result;
                
                // 保存圖片表情
                const savedEmojis = JSON.parse(localStorage.getItem('imageEmojis') || '[]');
                const emojiData = {
                    id: Date.now().toString(),
                    url: imageData,
                    createdAt: new Date().toISOString()
                };
                savedEmojis.push(emojiData);
                localStorage.setItem('imageEmojis', JSON.stringify(savedEmojis));
                
                // 添加到表情容器
                if (container) {
                    const emojiBtn = document.createElement('button');
                    emojiBtn.className = 'emoji-item image-emoji-item';
                    emojiBtn.innerHTML = `<img src="${imageData}" alt="表情" class="emoji-preview-image">`;
                    emojiBtn.setAttribute('data-emoji', imageData);
                    emojiBtn.setAttribute('data-type', 'image');
                    emojiBtn.addEventListener('click', () => {
                        selectEmoji(imageData, 'image');
                    });
                    container.appendChild(emojiBtn);
                }
                input.remove();
            };
            reader.onerror = () => {
                alert('圖片讀取失敗，請換一張圖片再試。');
                input.remove();
            };
            reader.readAsDataURL(file);
        } else {
            input.remove();
        }
    });
    openFilePickerCompat(input);
}

// ========== 成員選擇功能 ==========

// 獲取成員列表
function getMembers() {
    return JSON.parse(localStorage.getItem('members') || '[]');
}

// 保存成員列表
function saveMembers(members) {
    localStorage.setItem('members', JSON.stringify(members));
}

// 顯示成員選擇模態框
function showMemberSelectModal() {
    const modal = document.createElement('div');
    modal.className = 'member-select-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10004; display: flex; align-items: center; justify-content: center; overflow-y: auto;';
    
    const members = getMembers();
    const selectedMember = window.selectedMember || null;
    
    let memberListHtml = '';
    if (members.length === 0) {
        memberListHtml = '<div style="text-align: center; padding: 40px; color: #999;">尚無成員<br><small style="font-size: 12px; margin-top: 8px; display: block;">點擊「新增成員」按鈕添加</small></div>';
    } else {
        members.forEach(member => {
            const isSelected = selectedMember === member.name;
            memberListHtml += `
                <div class="member-item ${isSelected ? 'selected' : ''}" data-member-name="${member.name}">
                    <div class="member-item-icon">${member.icon || '👤'}</div>
                    <div class="member-item-name">${member.name}</div>
                    ${isSelected ? '<div class="member-item-check">✓</div>' : ''}
                </div>
            `;
        });
    }
    
    modal.innerHTML = `
        <div class="member-select-content" style="background: white; border-radius: 20px; padding: 24px; max-width: 400px; width: 90%; max-height: 90vh; overflow-y: auto; margin: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="font-size: 24px; font-weight: 600; color: #333; margin: 0;">👤 選擇成員</h2>
                <button class="member-select-close-btn" style="background: none; border: none; font-size: 24px; color: #999; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;">✕</button>
            </div>
            
            <div class="member-list" style="max-height: 50vh; overflow-y: auto; margin-bottom: 16px;">
                ${memberListHtml}
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button id="addMemberBtn" style="flex: 1; padding: 12px; border: 2px dashed #ffb6d9; border-radius: 12px; background: #fff5f9; color: #ff69b4; font-size: 14px; font-weight: 500; cursor: pointer;">
                    ➕ 新增成員
                </button>
                ${selectedMember ? '<button id="removeMemberBtn" style="padding: 12px 20px; border: 2px solid #f0f0f0; border-radius: 12px; background: #ffffff; color: #666; font-size: 14px; font-weight: 500; cursor: pointer;">清除</button>' : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 綁定關閉按鈕
    const closeBtn = modal.querySelector('.member-select-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        });
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = '#f5f5f5';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'none';
        });
    }
    
    // 綁定成員選擇
    modal.querySelectorAll('.member-item').forEach(item => {
        item.addEventListener('click', () => {
            const memberName = item.dataset.memberName;
            selectMember(memberName);
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        });
    });
    
    // 綁定新增成員按鈕
    const addMemberBtn = modal.querySelector('#addMemberBtn');
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', () => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            showAddMemberDialog();
        });
    }
    
    // 綁定清除按鈕
    const removeMemberBtn = modal.querySelector('#removeMemberBtn');
    if (removeMemberBtn) {
        removeMemberBtn.addEventListener('click', () => {
            selectMember(null);
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        });
    }
    
    // 點擊遮罩關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }
    });
}

// 選擇成員
function selectMember(memberName) {
    window.selectedMember = memberName;
    
    // 更新成員顯示
    const memberDisplay = document.getElementById('memberDisplay');
    const memberInfo = document.getElementById('memberInfo');
    const memberBtn = document.getElementById('memberBtn');
    
    if (memberName) {
        const members = getMembers();
        const member = members.find(m => m.name === memberName);
        if (member) {
            if (memberInfo) memberInfo.textContent = `${member.icon || '👤'} ${member.name}`;
            if (memberDisplay) memberDisplay.style.display = 'block';
            if (memberBtn) memberBtn.style.background = 'linear-gradient(135deg, #ffb6d9 0%, #ff9ec7 100%)';
        }
    } else {
        if (memberInfo) memberInfo.textContent = '未選擇成員';
        if (memberDisplay) memberDisplay.style.display = 'none';
        if (memberBtn) memberBtn.style.background = '#f5f5f5';
    }
}

// 顯示新增成員對話框
function showAddMemberDialog() {
    const memberName = prompt('請輸入成員名稱：', '');
    if (!memberName || !memberName.trim()) {
        return;
    }
    
    const members = getMembers();
    
    // 檢查是否已存在
    if (members.some(m => m.name === memberName.trim())) {
        alert('該成員已存在');
        return;
    }
    
    // 常用圖標列表
    const commonIcons = ['👤', '👨', '👩', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👪', '👨‍👨‍👦', '👩‍👩‍👦', '👨‍👨‍👧', '👩‍👩‍👧', '👨‍👨‍👧‍👦', '👩‍👩‍👧‍👦', '👨‍👨‍👦‍👦', '👩‍👩‍👦‍👦', '👨‍👨‍👧‍👧', '👩‍👩‍👧‍👧', '👴', '👵', '👶', '👦', '👧', '👨‍🦱', '👩‍🦱', '👨‍🦰', '👩‍🦰', '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲'];
    
    const iconList = commonIcons.map((icon, index) => `${index + 1}. ${icon}`).join('\n');
    const iconInput = prompt(`請選擇成員圖標（輸入編號）：\n\n${iconList}\n\n或直接輸入圖標：`, '👤');
    
    let selectedIcon = '👤';
    if (iconInput) {
        const iconIndex = parseInt(iconInput) - 1;
        if (!isNaN(iconIndex) && iconIndex >= 0 && iconIndex < commonIcons.length) {
            selectedIcon = commonIcons[iconIndex];
        } else if (iconInput.trim().length > 0) {
            selectedIcon = iconInput.trim();
        }
    }
    
    // 添加新成員
    members.push({
        name: memberName.trim(),
        icon: selectedIcon,
        createdAt: new Date().toISOString()
    });
    
    saveMembers(members);
    
    // 顯示成員選擇模態框
    showMemberSelectModal();
}

// ========== 收據圖片查看大圖功能 ==========

// 顯示收據圖片大圖
function showReceiptImageModal(imageUrl) {
    const modal = document.createElement('div');
    modal.className = 'receipt-image-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10010; display: flex; align-items: center; justify-content: center; padding: 20px;';
    
    modal.innerHTML = `
        <div style="position: relative; max-width: 90%; max-height: 90%; display: flex; align-items: center; justify-content: center;">
            <img src="${imageUrl}" alt="收據" style="max-width: 100%; max-height: 90vh; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
            <button class="receipt-image-close-btn" style="position: absolute; top: -40px; right: 0; background: getComputedStyle(document.documentElement).getPropertyValue('--bg-white').trim() || 'var(--bg-white)'; border: none; border-radius: 50%; width: 36px; height: 36px; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #333; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">✕</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 點擊關閉
    const closeBtn = modal.querySelector('.receipt-image-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        });
    }
    
    // 點擊背景關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }
    });
    
    // ESC 鍵關閉
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

// ========== 帳戶圖片上傳功能 ==========

// 初始化帳戶圖片上傳功能
function initAccountImageUpload() {
    const uploadBtn = document.getElementById('accountImageUploadBtn');
    const imageInput = document.getElementById('accountImageInput');
    const removeBtn = document.getElementById('accountImageRemoveBtn');
    const previewImg = document.getElementById('accountImagePreviewImg');
    const placeholder = document.getElementById('accountImagePlaceholder');
    
    if (!uploadBtn || !imageInput) return;
    
    // 上傳按鈕點擊
    uploadBtn.onclick = (e) => {
        if (e) e.preventDefault();
        imageInput.value = '';
        openFilePickerCompat(imageInput);
    };
    
    // 文件選擇 - 上傳時先壓縮，避免 localStorage 爆容量
    imageInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 8 * 1024 * 1024) {
                alert('圖片太大，請選擇 8MB 以下檔案');
                imageInput.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = async (event) => {
                const imageData = event.target.result;
                let finalImageData = imageData;
                if (typeof compressImage === 'function') {
                    try {
                        finalImageData = await compressImage(imageData, 320, 320, 0.6);
                    } catch (_) {}
                }
                
                // 顯示圖片預覽
                if (previewImg) {
                    previewImg.src = finalImageData;
                    previewImg.style.display = 'block';
                }
                if (placeholder) placeholder.style.display = 'none';
                if (removeBtn) removeBtn.style.display = 'block';
            };
            reader.onerror = () => {
                alert('圖片讀取失敗，請重新選擇圖片。');
            };
            reader.readAsDataURL(file);
        }
    };
    
    // 移除圖片
    if (removeBtn) {
        removeBtn.onclick = () => {
            if (previewImg) {
                previewImg.src = '';
                previewImg.style.display = 'none';
            }
            if (placeholder) placeholder.style.display = 'block';
            removeBtn.style.display = 'none';
            imageInput.value = '';
        };
    }
}

// 通用模態框控制
const FOCUSABLE_SELECTOR = [
    '[data-autofocus]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

function openModal(modal) {
    if (!modal) return;

    const activeEl = document.activeElement;
    if (activeEl && typeof activeEl.focus === 'function' && !modal.contains(activeEl)) {
        modal._previouslyFocusedElement = activeEl;
    }

    modal.style.display = 'flex';
    modal.removeAttribute('inert');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    requestAnimationFrame(() => {
        const focusTarget = modal.querySelector(FOCUSABLE_SELECTOR);
        if (focusTarget && typeof focusTarget.focus === 'function') {
            focusTarget.focus();
        }
    });
}

function closeModal(modal) {
    if (!modal) return;

    if (modal.contains(document.activeElement) && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
    }

    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');

    // 如果沒有其他開啟的模態框，移除 body 狀態
    const anyVisibleModal = Array.from(document.querySelectorAll('.modal-overlay'))
        .some(overlay => overlay.style.display === 'flex');
    if (!anyVisibleModal) {
        document.body.classList.remove('modal-open');
    }

    const previousFocus = modal._previouslyFocusedElement;
    if (previousFocus && typeof previousFocus.focus === 'function') {
        requestAnimationFrame(() => previousFocus.focus());
    }
}

// ========== 想買的東西 / 存錢目標功能 ==========

// 數據存儲管理
class WishlistSavingsManager {
    constructor() {
        this.wishlistData = this.loadWishlistData();
        this.savingsData = this.loadSavingsData();
        this.currentEditingItem = null;
        this.currentEditingGoal = null;
        this.currentTab = 'wishlist';
    }

    // 載入想買的東西數據
    loadWishlistData() {
        const data = localStorage.getItem('wishlistData');
        return data ? JSON.parse(data) : [];
    }

    // 載入存錢目標數據
    loadSavingsData() {
        const data = localStorage.getItem('savingsData');
        return data ? JSON.parse(data) : [];
    }

    // 保存想買的東西數據
    saveWishlistData() {
        localStorage.setItem('wishlistData', JSON.stringify(this.wishlistData));
    }

    // 保存存錢目標數據
    saveSavingsData() {
        localStorage.setItem('savingsData', JSON.stringify(this.savingsData));
    }

    // 新增想買的東西項目
    addWishlistItem(item) {
        item.id = Date.now().toString();
        item.createdAt = new Date().toISOString();
        this.wishlistData.push(item);
        this.saveWishlistData();
        return item;
    }

    // 更新想買的東西項目
    updateWishlistItem(id, updates) {
        const index = this.wishlistData.findIndex(item => item.id === id);
        if (index !== -1) {
            this.wishlistData[index] = { ...this.wishlistData[index], ...updates };
            this.saveWishlistData();
            return this.wishlistData[index];
        }
        return null;
    }

    // 刪除想買的東西項目
    deleteWishlistItem(id) {
        this.wishlistData = this.wishlistData.filter(item => item.id !== id);
        this.saveWishlistData();
    }

    // 新增存錢目標
    addSavingsGoal(goal) {
        goal.id = Date.now().toString();
        goal.createdAt = new Date().toISOString();
        goal.currentAmount = parseFloat(goal.currentAmount) || 0;
        goal.monthlyAmount = parseFloat(goal.monthlyAmount) || 0;
        this.savingsData.push(goal);
        this.saveSavingsData();
        return goal;
    }

    // 更新存錢目標
    updateSavingsGoal(id, updates) {
        const index = this.savingsData.findIndex(goal => goal.id === id);
        if (index !== -1) {
            this.savingsData[index] = { ...this.savingsData[index], ...updates };
            this.savingsData[index].currentAmount = parseFloat(this.savingsData[index].currentAmount) || 0;
            this.savingsData[index].monthlyAmount = parseFloat(this.savingsData[index].monthlyAmount) || 0;
            this.saveSavingsData();
            return this.savingsData[index];
        }
        return null;
    }

    // 刪除存錢目標
    deleteSavingsGoal(id) {
        this.savingsData = this.savingsData.filter(goal => goal.id !== id);
        this.saveSavingsData();
    }

    // 計算存錢目標進度
    calculateSavingsProgress(goal) {
        const target = parseFloat(goal.targetAmount) || 0;
        const current = parseFloat(goal.currentAmount) || 0;
        const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
        const remaining = Math.max(target - current, 0);
        const monthly = parseFloat(goal.monthlyAmount) || 0;
        const monthsNeeded = monthly > 0 ? Math.ceil(remaining / monthly) : 0;
        
        return {
            percentage,
            remaining,
            monthsNeeded,
            current,
            target
        };
    }
}

// 創建管理器實例
const wishlistSavingsManager = new WishlistSavingsManager();

// 渲染想買的東西列表
function renderWishlistList() {
    const listContainer = document.getElementById('wishlistList');
    if (!listContainer) return;

    const items = wishlistSavingsManager.wishlistData;
    
    if (items.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛍️</div>
                <div class="empty-state-text">還沒有想買的東西</div>
                <div class="empty-state-subtext">點擊上方「➕ 新增項目」開始添加</div>
            </div>
        `;
        return;
    }

    // 按重要性排序
    items.sort((a, b) => (b.importance || 0) - (a.importance || 0));

    listContainer.innerHTML = items.map(item => {
        const importance = item.importance || 0;
        const importanceLabel = importance >= 5
            ? '必買清單'
            : importance >= 4
                ? '超想要'
                : importance >= 3
                    ? '想考慮'
                    : importance > 0
                        ? '靈感收藏'
                        : '尚未評分';
        const importanceTone = importance >= 4 ? 'high' : (importance >= 3 ? 'medium' : 'low');
        const stars = [1, 2, 3, 4, 5].map(i => `<span class="star ${i <= importance ? 'filled' : ''}">★</span>`).join('');
        
        return `
        <div class="wishlist-item" data-id="${item.id}" data-importance="${importance}">
            <div class="wishlist-item-top">
                <div class="wishlist-item-title-group">
                    <span class="wishlist-item-type">${item.type || '生活'}</span>
                    <h3 class="wishlist-item-title">${item.name || '未命名'}</h3>
                    <div class="wishlist-item-meta">
                        <span class="wishlist-chip importance ${importanceTone}">
                            ${importanceLabel}
                        </span>
                        <span class="wishlist-chip wishlist-item-necessary ${item.necessary === '是' ? 'yes' : 'no'}">
                            ${item.necessary === '是' ? '必要' : '非必要'}
                        </span>
                    </div>
                </div>
                <div class="wishlist-item-amount-block">
                    <span class="wishlist-amount-label">預估金額</span>
                    <span class="wishlist-item-amount">NT$${(item.amount || 0).toLocaleString('zh-TW')}</span>
                </div>
            </div>
            
            <div class="wishlist-item-body">
                <div class="wishlist-item-importance" aria-label="重要性 ${importance} 星">
                    ${stars}
                </div>
                ${item.reason ? `
                    <div class="wishlist-info-row">
                        <span class="wishlist-info-label">💡 想買原因</span>
                        <p>${item.reason}</p>
                    </div>
                ` : ''}
                ${item.note ? `
                    <div class="wishlist-info-row">
                        <span class="wishlist-info-label">📝 備註</span>
                        <p>${item.note}</p>
                    </div>
                ` : ''}
            </div>
            
            <div class="wishlist-item-actions">
                <button class="wishlist-item-action-btn edit" onclick="editWishlistItem('${item.id}')">編輯</button>
                <button class="wishlist-item-action-btn delete" onclick="deleteWishlistItem('${item.id}')">刪除</button>
            </div>
        </div>
        `;
    }).join('');
}

// 渲染存錢目標列表
function renderSavingsList() {
    const listContainer = document.getElementById('savingsList');
    if (!listContainer) return;

    // 先清理錯誤的資料
    cleanupSavingsData();
    
    const goals = wishlistSavingsManager.loadSavingsData();
    
    if (goals.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💰</div>
                <div class="empty-state-text">還沒有存錢目標</div>
                <div class="empty-state-subtext">點擊上方「➕ 新增目標」開始設定</div>
            </div>
        `;
        return;
    }

    // 按優先順序排序
    const priorityOrder = { '高': 3, '中': 2, '低': 1 };
    goals.sort((a, b) => {
        const cleanPriorityA = a.priority || '低';
        const cleanPriorityB = b.priority || '低';
        return (priorityOrder[cleanPriorityB] || 0) - (priorityOrder[cleanPriorityA] || 0);
    });

    listContainer.innerHTML = goals.map(goal => {
        const progress = wishlistSavingsManager.calculateSavingsProgress(goal);
        const statusClass = goal.status === '進行中' ? 'active' : (goal.status === '暫停' ? 'paused' : 'completed');
        
        return `
            <div class="savings-item" data-id="${goal.id}">
                <div class="savings-item-header">
                    <div>
                        <h3 class="savings-item-title">${goal.name || '未命名'}</h3>
                        <div class="savings-item-priority ${(goal.priority || '低').toLowerCase()}">${goal.priority || '低'}</div>
                    </div>
                    <div class="savings-status ${statusClass}">${goal.status || '進行中'}</div>
                </div>
                
                <div class="savings-item-amounts">
                    <div class="savings-amount-item">
                        <div class="savings-amount-label">目標金額</div>
                        <div class="savings-amount-value target">NT$${progress.target.toLocaleString('zh-TW')}</div>
                    </div>
                    <div class="savings-amount-item">
                        <div class="savings-amount-label">目前已存</div>
                        <div class="savings-amount-value current">NT$${progress.current.toLocaleString('zh-TW')}</div>
                    </div>
                </div>
                
                <div class="savings-progress">
                    <div class="savings-progress-bar">
                        <div class="savings-progress-fill" style="width: ${progress.percentage}%"></div>
                    </div>
                    <div class="savings-progress-text">
                        <span>進度：${progress.percentage.toFixed(1)}%</span>
                        <span>尚差：NT$${progress.remaining.toLocaleString('zh-TW')}</span>
                    </div>
                </div>
                
                ${goal.monthlyAmount > 0 ? `
                    <div class="savings-monthly-info">
                        💳 每月存 NT$${goal.monthlyAmount.toLocaleString('zh-TW')}，預計 ${progress.monthsNeeded} 個月完成
                    </div>
                ` : ''}
                
                ${goal.note ? `<div class="wishlist-item-note"><strong>備註：</strong>${goal.note}</div>` : ''}
                
                <div class="savings-item-actions">
                    <button class="savings-item-action-btn edit" onclick="editSavingsGoal('${goal.id}')">編輯</button>
                    <button class="savings-item-action-btn delete" onclick="deleteSavingsGoal('${goal.id}')">刪除</button>
                </div>
            </div>
        `;
    }).join('');
}

// 顯示想買的東西表單頁面
function showWishlistForm(item = null) {
    const page = document.getElementById('pageWishlistForm');
    const title = document.getElementById('wishlistFormPageTitle');
    
    if (!page || !title) return;
    
    title.textContent = item ? '編輯想買的東西' : '新增想買的東西';
    
    // 重置表單
    document.getElementById('wishlistItemName').value = item ? item.name || '' : '';
    document.getElementById('wishlistItemType').value = item ? item.type || '生活' : '生活';
    document.getElementById('wishlistItemAmount').value = item ? item.amount || '' : '';
    document.getElementById('wishlistItemReason').value = item ? item.reason || '' : '';
    document.getElementById('wishlistItemNote').value = item ? item.note || '' : '';
    
    // 設置重要性
    const importance = item ? item.importance || 0 : 0;
    document.querySelectorAll('.star-btn').forEach((btn, index) => {
        btn.classList.toggle('active', index < importance);
    });
    
    // 設置必要性
    const necessary = item ? item.necessary || '否' : '否';
    const necessaryInput = document.querySelector(`input[name="wishlistItemNecessary"][value="${necessary}"]`);
    if (necessaryInput) necessaryInput.checked = true;
    
    wishlistSavingsManager.currentEditingItem = item;
    
    // 顯示表單頁面，隱藏願望清單頁面
    document.getElementById('pageWishlistSavings').style.display = 'none';
    page.style.display = 'block';
}

// 關閉想買的東西表單頁面
function closeWishlistForm() {
    const page = document.getElementById('pageWishlistForm');
    const wishlistPage = document.getElementById('pageWishlistSavings');
    
    if (page) page.style.display = 'none';
    if (wishlistPage) wishlistPage.style.display = 'block';
    
    wishlistSavingsManager.currentEditingItem = null;
}

// 顯示存錢目標表單
function showSavingsForm(goal = null) {
    const modal = document.getElementById('savingsModal');
    const title = document.getElementById('savingsModalTitle');
    
    if (!modal || !title) return;
    
    title.textContent = goal ? '編輯存錢目標' : '新增存錢目標';
    
    // 重置表單
    document.getElementById('savingsGoalName').value = goal ? goal.name || '' : '';
    document.getElementById('savingsGoalAmount').value = goal ? goal.targetAmount || '' : '';
    document.getElementById('savingsGoalCurrent').value = goal ? goal.currentAmount || '' : '';
    document.getElementById('savingsGoalMonthly').value = goal ? goal.monthlyAmount || '' : '';
    // 載入存錢目標表單時，確保優先順序是正確的值
    const priorityValue = goal ? goal.priority || '中' : '中';
    // 如果優先順序包含日期格式，則重置為預設值
    const cleanPriority = (priorityValue.includes('星期') || priorityValue.match(/^\d{2}-\d{2}/)) ? '中' : priorityValue;
    document.getElementById('savingsGoalPriority').value = cleanPriority;
    document.getElementById('savingsGoalStatus').value = goal ? goal.status || '進行中' : '進行中';
    document.getElementById('savingsGoalNote').value = goal ? goal.note || '' : '';
    
    wishlistSavingsManager.currentEditingGoal = goal;
    
    openModal(modal);
}

// 保存想買的東西
function saveWishlistItem() {
    const name = document.getElementById('wishlistItemName').value.trim();
    const type = document.getElementById('wishlistItemType').value;
    const amount = parseFloat(document.getElementById('wishlistItemAmount').value) || 0;
    const reason = document.getElementById('wishlistItemReason').value.trim();
    const note = document.getElementById('wishlistItemNote').value.trim();
    const importance = document.querySelectorAll('.star-btn.active').length;
    const necessary = document.querySelector('input[name="wishlistItemNecessary"]:checked').value;
    
    if (!name) {
        alert('請輸入項目名稱');
        return;
    }
    
    const itemData = { name, type, amount, reason, note, importance, necessary };
    
    if (wishlistSavingsManager.currentEditingItem) {
        wishlistSavingsManager.updateWishlistItem(wishlistSavingsManager.currentEditingItem.id, itemData);
    } else {
        wishlistSavingsManager.addWishlistItem(itemData);
    }
    
    closeWishlistForm();
    renderWishlistList();
}

// 保存存錢目標
function saveSavingsGoal() {
    const name = document.getElementById('savingsGoalName').value.trim();
    const targetAmount = parseFloat(document.getElementById('savingsGoalAmount').value) || 0;
    const currentAmount = parseFloat(document.getElementById('savingsGoalCurrent').value) || 0;
    const monthlyAmount = parseFloat(document.getElementById('savingsGoalMonthly').value) || 0;
    let priority = document.getElementById('savingsGoalPriority').value;
    // 確保優先順序是有效值，如果包含日期格式則重置為中
    if (priority.includes('星期') || priority.match(/^\d{2}-\d{2}/)) {
        priority = '中';
    }
    const status = document.getElementById('savingsGoalStatus').value;
    const note = document.getElementById('savingsGoalNote').value.trim();
    
    if (!name) {
        alert('請輸入目標名稱');
        return;
    }
    
    if (targetAmount <= 0) {
        alert('請輸入有效的目標金額');
        return;
    }
    
    const goalData = { name, targetAmount, currentAmount, monthlyAmount, priority, status, note };
    
    if (wishlistSavingsManager.currentEditingGoal) {
        wishlistSavingsManager.updateSavingsGoal(wishlistSavingsManager.currentEditingGoal.id, goalData);
    } else {
        wishlistSavingsManager.addSavingsGoal(goalData);
    }
    
    closeSavingsForm();
    renderSavingsList();
}

// 關閉想買的東西表單
function closeWishlistForm() {
    const modal = document.getElementById('wishlistModal');
    closeModal(modal);
    wishlistSavingsManager.currentEditingItem = null;
}

// 關閉存錢目標表單
function closeSavingsForm() {
    const modal = document.getElementById('savingsModal');
    closeModal(modal);
    wishlistSavingsManager.currentEditingGoal = null;
}

// 編輯想買的東西項目
function editWishlistItem(id) {
    const item = wishlistSavingsManager.wishlistData.find(item => item.id === id);
    if (item) {
        showWishlistForm(item);
    }
}

// 編輯存錢目標
function editSavingsGoal(id) {
    const goal = wishlistSavingsManager.savingsData.find(goal => goal.id === id);
    if (goal) {
        showSavingsForm(goal);
    }
}

// 刪除想買的東西項目
function deleteWishlistItem(id) {
    if (confirm('確定要刪除這個項目嗎？')) {
        wishlistSavingsManager.deleteWishlistItem(id);
        renderWishlistList();
    }
}

// 清理存錢目標資料中的錯誤優先順序值
function cleanupSavingsData() {
    const savingsData = wishlistSavingsManager.loadSavingsData();
    let hasChanges = false;
    
    savingsData.forEach(goal => {
        if (goal.priority && (goal.priority.includes('星期') || goal.priority.match(/^\d{2}-\d{2}/))) {
            goal.priority = '中';
            hasChanges = true;
        }
    });
    
    if (hasChanges) {
        wishlistSavingsManager.saveSavingsData();
        console.log('已清理存錢目標資料中的錯誤優先順序值');
    }
}

// 刪除存錢目標
function deleteSavingsGoal(id) {
    if (confirm('確定要刪除這個存錢目標嗎？')) {
        wishlistSavingsManager.deleteSavingsGoal(id);
        renderSavingsList();
    }
}

function switchTab(tabName) {
    // 更新選項卡按鈕狀態
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // 更新內容顯示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Content`);
    });
    
    wishlistSavingsManager.currentTab = tabName;
    
    // 重新渲染對應的列表
    if (tabName === 'wishlist') {
        renderWishlistList();
    } else {
        renderSavingsList();
    }
}

// 初始化想買的東西/存錢目標頁面
function initWishlistSavingsPage() {
    // 綁定事件監聽器
    const wishlistBackBtn = document.getElementById('wishlistSavingsBackBtn');
    const pageWishlist = document.getElementById('pageWishlistSavings');
    const pageLedger = document.getElementById('pageLedger');
    if (wishlistBackBtn && pageWishlist && pageLedger) {
        wishlistBackBtn.addEventListener('click', () => {
            pageWishlist.style.display = 'none';
            pageLedger.style.display = 'block';
        });
    }
    
    // 選項卡切換
    document.getElementById('wishlistTab')?.addEventListener('click', () => switchTab('wishlist'));
    document.getElementById('savingsTab')?.addEventListener('click', () => switchTab('savings'));
    
    // 新增按鈕
    document.getElementById('addWishlistBtn')?.addEventListener('click', () => showWishlistForm());
    document.getElementById('addSavingsBtn')?.addEventListener('click', () => showSavingsForm());
    
    // 想買的東西表單事件
    document.getElementById('wishlistFormBackBtn')?.addEventListener('click', closeWishlistForm);
    document.getElementById('wishlistFormCancelBtn')?.addEventListener('click', closeWishlistForm);
    document.getElementById('wishlistFormSaveBtn')?.addEventListener('click', saveWishlistItem);
    
    // 存錢目標表單事件
    document.getElementById('savingsModalCloseBtn')?.addEventListener('click', closeSavingsForm);
    document.getElementById('savingsFormCancelBtn')?.addEventListener('click', closeSavingsForm);
    document.getElementById('savingsFormSaveBtn')?.addEventListener('click', saveSavingsGoal);
    const savingsModal = document.getElementById('savingsModal');
    if (savingsModal) {
        savingsModal.addEventListener('click', (e) => {
            if (e.target === savingsModal) {
                closeSavingsForm();
            }
        });
    }
    
    // 星級評分事件
    document.querySelectorAll('.star-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const rating = parseInt(e.target.dataset.rating);
            document.querySelectorAll('.star-btn').forEach((star, index) => {
                star.classList.toggle('active', index < rating);
            });
        });
    });
    
    // 初始渲染
    switchTab('wishlist');
}

// 在頁面載入時初始化
document.addEventListener('DOMContentLoaded', () => {
    initWishlistSavingsPage();
});

// ========== 上傳所有資料到 Google Sheet ==========

// 上傳完整數據到 Google Sheet
function uploadAllDataToGoogleSheet() {
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
    
    try {
        // 收集所有數據
        const allData = collectAllData();
        
        // 準備上傳數據
        const uploadData = {
            uploadKey: uploadKey,
            timestamp: new Date().toISOString(),
            dataType: 'completeBackup',
            data: allData
        };
        
        // 顯示上傳進度
        showUploadProgress('正在上傳所有資料...');
        
        // 嘗試多種上傳方法
        attemptMultipleUploadMethods(uploadUrl, uploadData);
        
    } catch (error) {
        hideUploadProgress();
        showUploadError('準備上傳資料時發生錯誤：' + error.message);
    }
}

// 嘗試多種上傳方法
function attemptMultipleUploadMethods(uploadUrl, uploadData) {
    postToGoogleScript(uploadUrl, uploadData, { timeoutMs: 45000 })
        .then((result) => {
            hideUploadProgress();
            const note = result && result.opaque
                ? '已送出；手機瀏覽器無法讀取 Google 回應，請到 Sheet 確認。'
                : '完整資料已上傳到 Google Sheet。';
            showUploadSuccess(note);
            saveBackupHistory('success', '完整備份已送出到 Google Sheet');
        })
        .catch((error) => {
            hideUploadProgress();
            showUploadError('上傳失敗：' + (error && error.message ? error.message : error));
            saveBackupHistory('error', error && error.message ? error.message : String(error));
            showFallbackOptions();
        });
    return;

    // 方法1：使用 CORS 模式的 fetch
    tryFetchWithCORS(uploadUrl, uploadData)
        .then(() => {
            // 如果成功，結束
        })
        .catch(() => {
            // 方法2：使用表單提交
            tryFormSubmission(uploadUrl, uploadData)
                .then(() => {
                    // 如果成功，結束
                })
                .catch(() => {
                    // 方法3：使用 JSONP 風格
                    tryJSONPStyle(uploadUrl, uploadData)
                        .then(() => {
                            // 如果成功，結束
                        })
                        .catch(() => {
                            // 所有方法都失敗，顯示替代方案
                            hideUploadProgress();
                            showUploadError('所有上傳方法都失敗了，請使用替代方案');
                            showFallbackOptions();
                        });
                });
        });
}

// 方法1：使用 CORS 模式的 fetch
function tryFetchWithCORS(uploadUrl, uploadData) {
    return new Promise((resolve, reject) => {
        fetch(uploadUrl, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(uploadData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP 錯誤！狀態碼：${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            hideUploadProgress();
            if (result.success) {
                showUploadSuccess('所有資料已成功上傳到 Google Sheet！');
                saveBackupHistory('success', '完整備份上傳成功 (CORS)');
                resolve();
            } else {
                showUploadError('上傳失敗：' + (result.error || '未知錯誤'));
                saveBackupHistory('error', result.error || '未知錯誤');
                reject();
            }
        })
        .catch(error => {
            console.warn('CORS 方法失敗：', error);
            reject(error);
        });
    });
}

// 方法2：使用表單提交
function tryFormSubmission(uploadUrl, uploadData) {
    return new Promise((resolve, reject) => {
        try {
            // 創建隱藏的表單
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = uploadUrl;
            form.style.display = 'none';
            form.enctype = 'application/json'; // 設定為 JSON
            
            // 添加數據字段 - 直接作為 JSON 字符串
            const dataField = document.createElement('input');
            dataField.type = 'hidden';
            dataField.name = 'data';
            dataField.value = JSON.stringify(uploadData);
            form.appendChild(dataField);
            
            // 定義回調函數
            window.handleUploadResponse = function(response) {
                hideUploadProgress();
                if (response.success) {
                    showUploadSuccess('所有資料已成功上傳到 Google Sheet！');
                    saveBackupHistory('success', '完整備份上傳成功 (表單)');
                    resolve();
                } else {
                    showUploadError('上傳失敗：' + (response.error || '未知錯誤'));
                    saveBackupHistory('error', response.error || '未知錯誤');
                    reject();
                }
                // 清理回調函數
                delete window.handleUploadResponse;
            };
            
            // 設置超時
            setTimeout(() => {
                if (window.handleUploadResponse) {
                    delete window.handleUploadResponse;
                    reject(new Error('表單提交超時'));
                }
            }, 30000);
            
            // 提交表單
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
            
        } catch (error) {
            console.warn('表單提交方法失敗：', error);
            reject(error);
        }
    });
}

// 方法3：使用 JSONP 風格（通過 iframe）
function tryJSONPStyle(uploadUrl, uploadData) {
    return new Promise((resolve, reject) => {
        try {
            // 創建 iframe
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.name = 'uploadFrame';
            
            // 創建表單，目標指向 iframe
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = uploadUrl;
            form.target = 'uploadFrame';
            form.style.display = 'none';
            
            // 添加數據
            const dataField = document.createElement('input');
            dataField.type = 'hidden';
            dataField.name = 'data';
            dataField.value = JSON.stringify(uploadData);
            form.appendChild(dataField);
            
            // 監聽 iframe 載入
            iframe.onload = function() {
                try {
                    // 嘗試讀取 iframe 內容
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const content = iframeDoc.body.textContent || iframeDoc.body.innerText;
                    
                    if (content) {
                        const result = JSON.parse(content);
                        hideUploadProgress();
                        if (result.success) {
                            showUploadSuccess('所有資料已成功上傳到 Google Sheet！');
                            saveBackupHistory('success', '完整備份上傳成功 (iframe)');
                            resolve();
                        } else {
                            showUploadError('上傳失敗：' + (result.error || '未知錯誤'));
                            saveBackupHistory('error', result.error || '未知錯誤');
                            reject();
                        }
                    } else {
                        reject(new Error('iframe 無法讀取回應'));
                    }
                } catch (error) {
                    reject(new Error('解析 iframe 回應失敗'));
                } finally {
                    document.body.removeChild(iframe);
                    document.body.removeChild(form);
                }
            };
            
            // 設置超時
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                    document.body.removeChild(form);
                }
                reject(new Error('iframe 方法超時'));
            }, 30000);
            
            // 添加到頁面並提交
            document.body.appendChild(iframe);
            document.body.appendChild(form);
            form.submit();
            
        } catch (error) {
            console.warn('iframe 方法失敗：', error);
            reject(error);
        }
    });
}

// 保存備份歷史
function saveBackupHistory(status, message) {
    const history = JSON.parse(localStorage.getItem('backupHistory') || '[]');
    history.unshift({
        timestamp: new Date().toISOString(),
        status: status,
        message: message,
        type: 'completeBackup'
    });
    
    // 只保留最近 50 條記錄
    if (history.length > 50) {
        history.splice(50);
    }
    
    localStorage.setItem('backupHistory', JSON.stringify(history));
}

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

// 下載備份檔案
async function downloadBackupFile() {
    try {
        const allData = collectAllData();
        await downloadJsonFileCompat(allData, `backup_${new Date().toISOString().split('T')[0]}.json`);
        
        showNotification('備份檔案已下載到本機！', 'success');
        closeFallbackModal();
        saveBackupHistory('success', '本機備份檔案下載成功');
    } catch (error) {
        showNotification('下載失敗：' + error.message, 'error');
    }
}

// 複製數據到剪貼簿
function copyDataToClipboard() {
    try {
        const allData = collectAllData();
        const dataStr = JSON.stringify(allData, null, 2);
        
        navigator.clipboard.writeText(dataStr).then(() => {
            showNotification('數據已複製到剪貼簿！', 'success');
            closeFallbackModal();
            saveBackupHistory('success', '數據複製到剪貼簿成功');
        }).catch(err => {
            showNotification('複製失敗：' + err.message, 'error');
        });
    } catch (error) {
        showNotification('複製失敗：' + error.message, 'error');
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
    
    // 確認對話框
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
    
    // 二次確認
    const finalConfirm = prompt('請輸入 "DELETE" 以確認刪除操作：');
    if (finalConfirm !== 'DELETE') {
        alert('刪除操作已取消');
        return;
    }
    
    try {
        // 準備清除數據請求
        const clearData = {
            clearKey: 'CLEAR_ALL_DATA_2026',
            uploadKey: uploadKey,
            timestamp: new Date().toISOString(),
            dataType: 'clearAllData'
        };
        
        // 顯示清除進度
        showClearProgress('正在清除所有資料...');
        
        // 執行清除請求
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
                // 記錄清除歷史
                saveBackupHistory('cleared', 'Google Sheet 數據清除成功');
                
                // 顯示詳細結果
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

// 隱藏清除進度
function hideClearProgress() {
    const progressModal = document.getElementById('clearProgressModal');
    if (progressModal) {
        document.body.removeChild(progressModal);
    }
}

// 顯示清除成功
function showClearSuccess(message) {
    showNotification(message, 'success');
}

// 顯示清除錯誤
function showClearError(message) {
    showNotification(message, 'error');
}

// 收集所有數據
function collectAllData() {
    return {
        // 記帳記錄
        records: getAllRecords(),
        
        // 想買的東西
        wishlist: wishlistSavingsManager.wishlistData,
        
        // 存錢目標
        savings: wishlistSavingsManager.savingsData,
        
        // 分類設定
        categories: {
            expense: JSON.parse(localStorage.getItem('expenseCategories') || '[]'),
            income: JSON.parse(localStorage.getItem('incomeCategories') || '[]')
        },
        
        // 帳戶設定
        accounts: JSON.parse(localStorage.getItem('accounts') || '[]'),
        
        // 設定資料
        settings: {
            theme: localStorage.getItem('theme') || 'default',
            fontSize: localStorage.getItem('fontSize') || 'medium',
            currency: localStorage.getItem('currency') || 'NT$'
        },
        
        // 分期規則
        installmentRules: JSON.parse(localStorage.getItem('installmentRules') || '[]'),
        
        // 常用項目
        frequentItems: JSON.parse(localStorage.getItem('frequentItems') || '[]'),
        
        // 備份歷史
        backupHistory: JSON.parse(localStorage.getItem('backupHistory') || '[]'),
        localStorageRaw: typeof snapshotAllLocalStorage === 'function' ? snapshotAllLocalStorage() : {}
    };
}

// 獲取所有記帳記錄
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

// 顯示上傳進度
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

// 隱藏上傳進度
function hideUploadProgress() {
    const progressModal = document.getElementById('uploadProgressModal');
    if (progressModal) {
        document.body.removeChild(progressModal);
    }
}

// 顯示上傳成功
function showUploadSuccess(message) {
    showNotification(message, 'success');
}

// 顯示上傳錯誤
function showUploadError(message) {
    showNotification(message, 'error');
}

// 顯示通知
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
    
    // 自動移除通知
    setTimeout(() => {
        if (notification.parentNode) {
            document.body.removeChild(notification);
        }
    }, 5000);
}

// 在設置頁面添加上傳所有資料的選項
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
