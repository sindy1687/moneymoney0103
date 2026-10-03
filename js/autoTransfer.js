// ========== 自動轉帳管理系統 ==========

// 顯示自動轉帳管理頁面
function showAutoTransferManagementPage() {
    const pageSettings = document.getElementById('pageSettings');
    if (pageSettings) pageSettings.style.display = 'none';
    
    // 創建自動轉帳管理頁面
    const transferPage = document.createElement('div');
    transferPage.className = 'auto-transfer-management-page';
    transferPage.id = 'autoTransferManagementPage';
    transferPage.innerHTML = `
        <div class="auto-transfer-header">
            <button class="auto-transfer-back-btn" id="autoTransferBackBtn">← 返回</button>
            <h2 class="auto-transfer-title">自動轉帳管理</h2>
            <button class="auto-transfer-add-btn" id="autoTransferAddBtn">➕ 新增</button>
        </div>
        
        <div class="auto-transfer-list-container" id="autoTransferListContainer">
            <!-- 自動轉帳計劃列表將由 JavaScript 動態生成 -->
        </div>
    `;
    
    // 插入到設置頁面後面
    pageSettings.parentNode.insertBefore(transferPage, pageSettings.nextSibling);
    
    // 隱藏底部導航
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) bottomNav.style.display = 'none';
    
    // 初始化事件監聽
    initAutoTransferEvents();
    
    // 載入轉帳計劃列表
    loadAutoTransferPlans();
}

// 初始化自動轉帳事件監聽
function initAutoTransferEvents() {
    // 返回按鈕
    const backBtn = document.getElementById('autoTransferBackBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            closeAutoTransferManagementPage();
        });
    }
    
    // 新增按鈕
    const addBtn = document.getElementById('autoTransferAddBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            showAutoTransferSetupPage();
        });
    }
}

// 關閉自動轉帳管理頁面
function closeAutoTransferManagementPage() {
    const transferPage = document.getElementById('autoTransferManagementPage');
    const pageSettings = document.getElementById('pageSettings');
    const bottomNav = document.querySelector('.bottom-nav');
    
    if (transferPage) transferPage.remove();
    if (pageSettings) pageSettings.style.display = 'block';
    if (bottomNav) bottomNav.style.display = 'flex';
}

// 載入自動轉帳計劃列表
function loadAutoTransferPlans() {
    const container = document.getElementById('autoTransferListContainer');
    if (!container) return;
    
    const plans = JSON.parse(playerStorage.getItem('autoTransferPlans') || '[]');
    
    if (plans.length === 0) {
        container.innerHTML = `
            <div class="auto-transfer-empty">
                <div class="empty-icon">💸</div>
                <div class="empty-text">尚未設定自動轉帳計劃</div>
                <div class="empty-subtext">點擊「新增」建立第一個轉帳計劃</div>
            </div>
        `;
        return;
    }
    
    const plansHTML = plans.map(plan => {
        const fromAccount = getAccountById(plan.fromAccount);
        const toAccount = getAccountById(plan.toAccount);
        const statusClass = plan.enabled ? 'enabled' : 'disabled';
        const statusText = plan.enabled ? '啟用中' : '已停用';
        
        return `
            <div class="auto-transfer-item ${statusClass}" data-plan-id="${plan.id}">
                <div class="transfer-item-main">
                    <div class="transfer-item-info">
                        <div class="transfer-item-name">${plan.name}</div>
                        <div class="transfer-item-accounts">
                            ${fromAccount?.name || '未知帳戶'} → ${toAccount?.name || '未知帳戶'}
                        </div>
                        <div class="transfer-item-amount">NT$${plan.amount.toLocaleString('zh-TW')}</div>
                        <div class="transfer-item-schedule">每月 ${plan.day} 號</div>
                    </div>
                    <div class="transfer-item-status">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                </div>
                <div class="transfer-item-actions">
                    <button class="transfer-action-btn edit-btn" data-plan-id="${plan.id}">✏️</button>
                    <button class="transfer-action-btn toggle-btn" data-plan-id="${plan.id}">
                        ${plan.enabled ? '⏸️' : '▶️'}
                    </button>
                    <button class="transfer-action-btn delete-btn" data-plan-id="${plan.id}">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = plansHTML;
    
    // 綁定操作按鈕事件
    bindTransferItemEvents();
}

// 綁定轉帳項目事件
function bindTransferItemEvents() {
    // 編輯按鈕
    document.querySelectorAll('.transfer-action-btn.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const planId = e.target.dataset.planId;
            showAutoTransferSetupPage(planId);
        });
    });
    
    // 切換啟用狀態按鈕
    document.querySelectorAll('.transfer-action-btn.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const planId = e.target.dataset.planId;
            toggleTransferPlan(planId);
        });
    });
    
    // 刪除按鈕
    document.querySelectorAll('.transfer-action-btn.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const planId = e.target.dataset.planId;
            deleteTransferPlan(planId);
        });
    });
}

// 顯示自動轉帳設定頁面
function showAutoTransferSetupPage(planId = null) {
    const plans = JSON.parse(playerStorage.getItem('autoTransferPlans') || '[]');
    const plan = planId ? plans.find(p => p.id === planId) : null;
    const accounts = getAccounts();
    
    const isEdit = !!plan;
    
    // 創建設定頁面
    const setupPage = document.createElement('div');
    setupPage.className = 'auto-transfer-setup-page';
    setupPage.id = 'autoTransferSetupPage';
    setupPage.innerHTML = `
        <div class="auto-transfer-setup-header">
            <button class="auto-transfer-setup-back-btn" id="autoTransferSetupBackBtn">← 返回</button>
            <h2 class="auto-transfer-setup-title">${isEdit ? '編輯轉帳計劃' : '新增轉帳計劃'}</h2>
        </div>
        
        <div class="auto-transfer-setup-form">
            <div class="form-field">
                <label class="form-label">計劃名稱</label>
                <input type="text" class="form-input" id="transferNameInput" 
                       placeholder="例如：每月薪資轉儲蓄" 
                       value="${plan?.name || ''}">
            </div>
            
            <div class="form-field">
                <label class="form-label">轉出帳戶</label>
                <select class="form-select" id="transferFromAccount">
                    ${accounts.map(account => `
                        <option value="${account.id}" ${plan?.fromAccount === account.id ? 'selected' : ''}>
                            ${account.name} (${account.currency}) - $${account.initialBalance?.toLocaleString('zh-TW') || 0}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="form-field">
                <label class="form-label">轉入帳戶</label>
                <select class="form-select" id="transferToAccount">
                    ${accounts.map(account => `
                        <option value="${account.id}" ${plan?.toAccount === account.id ? 'selected' : ''}>
                            ${account.name} (${account.currency}) - $${account.initialBalance?.toLocaleString('zh-TW') || 0}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="form-field">
                <label class="form-label">轉帳金額</label>
                <input type="number" class="form-input" id="transferAmountInput" 
                       placeholder="請輸入轉帳金額" 
                       value="${plan?.amount || ''}" 
                       min="1" step="1">
            </div>
            
            <div class="form-field">
                <label class="form-label">轉帳日期</label>
                <select class="form-select" id="transferDaySelect">
                    ${Array.from({length: 31}, (_, i) => i + 1).map(day => `
                        <option value="${day}" ${plan?.day === day ? 'selected' : ''}>
                            每月 ${day} 號
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="form-field">
                <label class="form-checkbox-label">
                    <input type="checkbox" class="form-checkbox" id="transferEnabledInput" 
                           ${plan?.enabled !== false ? 'checked' : ''}>
                    <span class="form-checkbox-text">啟用此轉帳計劃</span>
                </label>
            </div>
            
            <div class="form-field">
                <label class="form-label">備註（選填）</label>
                <textarea class="form-textarea" id="transferNoteInput" 
                          placeholder="新增備註說明">${plan?.note || ''}</textarea>
            </div>
            
            <div class="auto-transfer-setup-actions">
                <button class="form-submit-btn" id="transferSaveBtn">儲存</button>
                ${isEdit ? '<button class="form-delete-btn" id="transferDeleteBtn">刪除</button>' : ''}
            </div>
        </div>
    `;
    
    // 插入到管理頁面
    const managementPage = document.getElementById('autoTransferManagementPage');
    managementPage.style.display = 'none';
    managementPage.parentNode.insertBefore(setupPage, managementPage.nextSibling);
    
    // 初始化事件監聽
    initAutoTransferSetupEvents(planId);
}

// 初始化自動轉帳設定事件
function initAutoTransferSetupEvents(planId) {
    // 返回按鈕
    const backBtn = document.getElementById('autoTransferSetupBackBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            closeAutoTransferSetupPage();
        });
    }
    
    // 儲存按鈕
    const saveBtn = document.getElementById('transferSaveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveAutoTransferPlan(planId);
        });
    }
    
    // 刪除按鈕（僅編輯模式）
    const deleteBtn = document.getElementById('transferDeleteBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm('確定要刪除這個轉帳計劃嗎？')) {
                deleteTransferPlan(planId);
                closeAutoTransferSetupPage();
            }
        });
    }
}

// 關閉自動轉帳設定頁面
function closeAutoTransferSetupPage() {
    const setupPage = document.getElementById('autoTransferSetupPage');
    const managementPage = document.getElementById('autoTransferManagementPage');
    
    if (setupPage) setupPage.remove();
    if (managementPage) managementPage.style.display = 'block';
}

// 儲存自動轉帳計劃
function saveAutoTransferPlan(planId = null) {
    const name = document.getElementById('transferNameInput')?.value.trim();
    const fromAccount = document.getElementById('transferFromAccount')?.value;
    const toAccount = document.getElementById('transferToAccount')?.value;
    const amount = parseFloat(document.getElementById('transferAmountInput')?.value) || 0;
    const day = parseInt(document.getElementById('transferDaySelect')?.value) || 1;
    const enabled = document.getElementById('transferEnabledInput')?.checked !== false;
    const note = document.getElementById('transferNoteInput')?.value.trim();
    
    // 驗證
    if (!name) {
        alert('請輸入計劃名稱');
        return;
    }
    if (!fromAccount || !toAccount) {
        alert('請選擇轉出和轉入帳戶');
        return;
    }
    if (fromAccount === toAccount) {
        alert('轉出和轉入帳戶不能相同');
        return;
    }
    if (amount <= 0) {
        alert('請輸入有效的轉帳金額');
        return;
    }
    if (day < 1 || day > 31) {
        alert('請選擇有效的轉帳日期');
        return;
    }
    
    // 載入現有計劃
    const plans = JSON.parse(playerStorage.getItem('autoTransferPlans') || '[]');
    
    if (planId) {
        // 編輯現有計劃
        const planIndex = plans.findIndex(p => p.id === planId);
        if (planIndex !== -1) {
            plans[planIndex] = {
                ...plans[planIndex],
                name,
                fromAccount,
                toAccount,
                amount,
                day,
                enabled,
                note,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // 新增計劃
        const newPlan = {
            id: 'transfer_' + Date.now(),
            name,
            fromAccount,
            toAccount,
            amount,
            day,
            enabled,
            note,
            createdAt: new Date().toISOString(),
            lastExecuted: null,
            executedCount: 0
        };
        plans.push(newPlan);
    }
    
    // 儲存
    playerStorage.setItem('autoTransferPlans', JSON.stringify(plans));
    
    // 關閉設定頁面並重新載入列表
    closeAutoTransferSetupPage();
    loadAutoTransferPlans();
    
    // 顯示成功訊息
    alert(planId ? '轉帳計劃已更新' : '轉帳計劃已建立');
}

// 切換轉帳計劃啟用狀態
function toggleTransferPlan(planId) {
    const plans = JSON.parse(playerStorage.getItem('autoTransferPlans') || '[]');
    const planIndex = plans.findIndex(p => p.id === planId);
    
    if (planIndex !== -1) {
        plans[planIndex].enabled = !plans[planIndex].enabled;
        plans[planIndex].updatedAt = new Date().toISOString();
        playerStorage.setItem('autoTransferPlans', JSON.stringify(plans));
        loadAutoTransferPlans();
    }
}

// 刪除轉帳計劃
function deleteTransferPlan(planId) {
    if (!confirm('確定要刪除這個轉帳計劃嗎？此操作無法復原。')) {
        return;
    }
    
    const plans = JSON.parse(playerStorage.getItem('autoTransferPlans') || '[]');
    const filteredPlans = plans.filter(p => p.id !== planId);
    playerStorage.setItem('autoTransferPlans', JSON.stringify(filteredPlans));
    
    loadAutoTransferPlans();
}

// 取得帳戶資訊
function getAccountById(accountId) {
    const accounts = getAccounts();
    return accounts.find(a => a.id === accountId);
}

// 檢查並執行自動轉帳計劃
function checkAndExecuteAutoTransferPlans() {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    
    const plans = JSON.parse(playerStorage.getItem('autoTransferPlans') || '[]');
    const enabledPlans = plans.filter(p => p.enabled);
    
    const promptedKey = 'autoTransferMonthlyPrompted';
    const promptedMap = JSON.parse(playerStorage.getItem(promptedKey) || '{}');
    if (!promptedMap[currentMonthKey]) promptedMap[currentMonthKey] = {};
    
    enabledPlans.forEach(plan => {
        // 檢查是否應該執行（轉帳日期已到）
        if (currentDay >= plan.day) {
            // 檢查本月是否已執行
            const lastExecuted = plan.lastExecuted ? new Date(plan.lastExecuted) : null;
            const shouldExecute = !lastExecuted || 
                lastExecuted.getFullYear() !== currentYear || 
                lastExecuted.getMonth() + 1 !== currentMonth;
            
            if (shouldExecute) {
                // 避免同一計劃同月反覆跳提醒
                const planId = String(plan.id || '');
                if (planId && promptedMap[currentMonthKey] && promptedMap[currentMonthKey][planId]) {
                    return;
                }
                if (planId) {
                    promptedMap[currentMonthKey][planId] = true;
                    playerStorage.setItem(promptedKey, JSON.stringify(promptedMap));
                }
                
                // 提示用戶執行轉帳
                const fromAccount = getAccountById(plan.fromAccount);
                const toAccount = getAccountById(plan.toAccount);
                
                if (confirm(`自動轉帳提醒：\n${plan.name}\n${fromAccount?.name || '未知帳戶'} → ${toAccount?.name || '未知帳戶'}\n每月 ${plan.day} 號轉帳 NT$${plan.amount.toLocaleString('zh-TW')}\n\n是否現在執行轉帳？`)) {
                    executeAutoTransfer(plan);
                }
            }
        }
    });
}

// 執行自動轉帳
function executeAutoTransfer(plan) {
    const today = new Date().toISOString().split('T')[0];
    const fromAccount = getAccountById(plan.fromAccount);
    const toAccount = getAccountById(plan.toAccount);
    
    // 創建轉帳記錄
    const transferRecord = {
        type: 'transfer',
        category: '自動轉帳',
        amount: plan.amount,
        fromAccount: plan.fromAccount,
        toAccount: plan.toAccount,
        note: `${plan.name} - 自動轉帳`,
        date: today,
        timestamp: new Date().toISOString(),
        autoTransfer: true,
        autoTransferPlanId: plan.id
    };
    
    // 保存到記帳記錄
    const accountingRecords = JSON.parse(playerStorage.getItem('accountingRecords') || '[]');
    accountingRecords.push(transferRecord);
    playerStorage.setItem('accountingRecords', JSON.stringify(accountingRecords));
    
    // 更新轉帳計劃執行記錄
    const plans = JSON.parse(playerStorage.getItem('autoTransferPlans') || '[]');
    const planIndex = plans.findIndex(p => p.id === plan.id);
    if (planIndex !== -1) {
        plans[planIndex].lastExecuted = new Date().toISOString();
        plans[planIndex].executedCount = (plans[planIndex].executedCount || 0) + 1;
        playerStorage.setItem('autoTransferPlans', JSON.stringify(plans));
    }
    
    // 顯示成功訊息
    alert(`轉帳已完成：\n${fromAccount?.name || '未知帳戶'} → ${toAccount?.name || '未知帳戶'}\n金額：NT$${plan.amount.toLocaleString('zh-TW')}`);
    
    // 顯示成功動畫
    if (typeof showSuccessAnimation === 'function') {
        showSuccessAnimation();
    }
}

// 在頁面載入時檢查自動轉帳計劃
document.addEventListener('playerappready', () => {
    // 延遲檢查，確保其他初始化完成
    setTimeout(() => {
        checkAndExecuteAutoTransferPlans();
    }, 2000);
});

// 擴展設置頁面事件處理
document.addEventListener('playerappready', () => {
    // 監聽設置頁面的點擊事件
    const observer = new MutationObserver(() => {
        const settingsItems = document.querySelectorAll('.settings-item');
        settingsItems.forEach(item => {
            const action = item.dataset.action;
            if (action === 'autoTransfer' && !item.hasAttribute('data-auto-transfer-handled')) {
                item.setAttribute('data-auto-transfer-handled', 'true');
                item.addEventListener('click', () => {
                    showAutoTransferManagementPage();
                });
            }
        });
    });
    
    // 開始觀察
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 立即檢查一次
    const settingsItems = document.querySelectorAll('.settings-item');
    settingsItems.forEach(item => {
        const action = item.dataset.action;
        if (action === 'autoTransfer' && !item.hasAttribute('data-auto-transfer-handled')) {
            item.setAttribute('data-auto-transfer-handled', 'true');
            item.addEventListener('click', () => {
                showAutoTransferManagementPage();
            });
        }
    });
});
