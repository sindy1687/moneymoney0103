// 統一的返回記帳本函數
function goBackToLedger() {
    // 獲取所有頁面元素
    const pageLedger = document.getElementById('pageLedger');
    const pageInput = document.getElementById('pageInput');
    const pageChart = document.getElementById('pageChart');
    const pageBudget = document.getElementById('pageBudget');
    const pageMonthlyPlanner = document.getElementById('pageMonthlyPlanner');
    const pageSettings = document.getElementById('pageSettings');
    const pageCategoryManage = document.getElementById('pageCategoryManage');
    const pageDailyBudget = document.getElementById('pageDailyBudget');
    const pageInvestment = document.getElementById('pageInvestment');
    const investmentOverview = document.getElementById('investmentOverview');
    const stockDetailPage = document.getElementById('stockDetailPage');
    const investmentInputPage = document.getElementById('investmentInputPage');
    const dividendPage = document.getElementById('dividendPage');
    const dividendInputPage = document.getElementById('dividendInputPage');
    const dcaManagementPage = document.getElementById('dcaManagementPage');
    const dcaSetupPage = document.getElementById('dcaSetupPage');
    const installmentManagementPage = document.getElementById('installmentManagementPage');
    const installmentSetupPage = document.getElementById('installmentSetupPage');
    const bottomNav = document.querySelector('.bottom-nav');
    const investmentActions = document.querySelector('.investment-actions');
    const inputSection = document.getElementById('inputSection');
    
    // 隱藏所有頁面
    if (pageInput) pageInput.style.display = 'none';
    if (pageChart) pageChart.style.display = 'none';
    if (pageBudget) pageBudget.style.display = 'none';
    if (pageMonthlyPlanner) pageMonthlyPlanner.style.display = 'none';
    if (pageSettings) pageSettings.style.display = 'none';
    if (pageCategoryManage) pageCategoryManage.style.display = 'none';
    if (pageDailyBudget) pageDailyBudget.style.display = 'none';
    if (pageInvestment) pageInvestment.style.display = 'none';
    if (investmentOverview) investmentOverview.style.display = 'none';
    if (stockDetailPage) stockDetailPage.style.display = 'none';
    if (investmentInputPage) investmentInputPage.style.display = 'none';
    if (dividendPage) dividendPage.style.display = 'none';
    if (dividendInputPage) dividendInputPage.style.display = 'none';
    if (dcaManagementPage) dcaManagementPage.style.display = 'none';
    if (dcaSetupPage) dcaSetupPage.style.display = 'none';
    if (installmentManagementPage) installmentManagementPage.style.display = 'none';
    if (installmentSetupPage) installmentSetupPage.style.display = 'none';
    if (inputSection) inputSection.style.display = 'none';
    
    // 顯示記帳本頁面
    if (pageLedger) {
        pageLedger.style.display = 'block';
        // 隱藏記帳輸入頁面的 header
        const headerSection = document.querySelector('.header-section');
        if (headerSection) headerSection.style.display = 'none';
        // 初始化記帳本頁面
        if (typeof initLedger === 'function') {
            initLedger();
        }
    }
    
    // 顯示底部導航欄
    if (bottomNav) bottomNav.style.display = 'flex';
    
    // 隱藏投資操作按鈕
    if (investmentActions) investmentActions.style.display = 'none';
}

function initMonthlyPlannerPage() {
    const monthKey = getSelectedMonthKey();

    const incomeInput = document.getElementById('monthlyIncomeInput');

    const goalNameInput = document.getElementById('savingGoalNameInput');
    const goalTargetInput = document.getElementById('savingGoalTargetInput');
    const goalMonthlyInput = document.getElementById('savingGoalMonthlyInput');
    const goalSavedInput = document.getElementById('savingGoalSavedInput');
    const goalAddBtn = document.getElementById('savingGoalAddBtn');
    const goalListEl = document.getElementById('savingGoalList');

    const fixedListEl = document.getElementById('monthlyPlannerFixedList');
    const savingsListEl = document.getElementById('monthlyPlannerSavingsList');
    const personalListEl = document.getElementById('monthlyPlannerPersonalList');

    const fixedSubtotalEl = document.getElementById('monthlyPlannerFixedSubtotal');
    const savingsSubtotalEl = document.getElementById('monthlyPlannerSavingsSubtotal');
    const personalSubtotalEl = document.getElementById('monthlyPlannerPersonalSubtotal');

    const totalExpenseEl = document.getElementById('monthlyPlannerTotalExpense');
    const balanceEl = document.getElementById('monthlyPlannerBalance');
    const hintEl = document.getElementById('monthlyPlannerHint');

    const addFixedBtn = document.getElementById('monthlyPlannerAddFixedBtn');
    const addSavingsBtn = document.getElementById('monthlyPlannerAddSavingsBtn');
    const addPersonalBtn = document.getElementById('monthlyPlannerAddPersonalBtn');

    const applySampleBtn = document.getElementById('monthlyPlannerApplySampleBtn');
    const saveBtn = document.getElementById('monthlyPlannerSaveBtn');

    if (!incomeInput || !fixedListEl || !savingsListEl || !personalListEl) return;

    const storageKey = `monthlyPlanner:${monthKey}`;

    const formatTwd = (n) => {
        const v = Math.round(Number.isFinite(n) ? n : 0);
        return `NT$${v.toLocaleString('zh-TW')}`;
    };

    const readNumber = (val) => {
        const n = Number(val);
        return Number.isFinite(n) ? n : 0;
    };

    const newId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

    let state = {
        monthKey,
        income: 0,
        items: {
            fixed: [],
            savings: [],
            personal: []
        },
        currentSavingsFilter: 'all' // 新增儲蓄過濾器狀態
    };

    const savingGoalsKey = 'savingGoals';
    let savingGoals = [];

    const normalizeItem = (item) => {
        const safe = item && typeof item === 'object' ? item : {};
        return {
            id: safe.id || newId(),
            name: safe.name != null ? String(safe.name) : '',
            amount: readNumber(safe.amount),
            note: safe.note != null ? String(safe.note) : '',
            type: safe.type || (safe.name && safe.name.includes('存股') ? 'stock' : 'savings') // 自動識別類型
        };
    };

    const calcTotals = () => {
        const sumGroup = (arr) => (arr || []).reduce((sum, it) => sum + readNumber(it.amount), 0);
        const fixed = sumGroup(state.items.fixed);
        const savings = sumGroup(state.items.savings);
        const personal = sumGroup(state.items.personal);
        const total = fixed + savings + personal;
        const balance = readNumber(state.income) - total;
        return { fixed, savings, personal, total, balance };
    };

    const renderTotals = () => {
        const t = calcTotals();
        if (fixedSubtotalEl) fixedSubtotalEl.textContent = formatTwd(t.fixed);
        if (savingsSubtotalEl) savingsSubtotalEl.textContent = formatTwd(t.savings);
        if (personalSubtotalEl) personalSubtotalEl.textContent = formatTwd(t.personal);
        if (totalExpenseEl) totalExpenseEl.textContent = formatTwd(t.total);
        if (balanceEl) balanceEl.textContent = formatTwd(t.balance);

        if (hintEl) {
            if (readNumber(state.income) <= 0) {
                hintEl.textContent = '請先輸入本月可用收入。';
                hintEl.className = 'monthly-planner-hint';
            } else if (t.balance < 0) {
                hintEl.textContent = '⚠️ 目前規劃會超支，建議調整部分支出或提高收入。';
                hintEl.className = 'monthly-planner-hint monthly-planner-hint--danger';
            } else {
                hintEl.textContent = '✅ 規劃可行；結餘可用於彈性支出/額外存錢/投資。';
                hintEl.className = 'monthly-planner-hint monthly-planner-hint--success';
            }
        }
    };

    const renderGroup = (groupKey, containerEl) => {
        const items = state.items[groupKey] || [];
        if (!containerEl) return;

        // 如果是儲蓄群組，需要根據過濾器篩選
        let filteredItems = items;
        if (groupKey === 'savings' && state.currentSavingsFilter !== 'all') {
            filteredItems = items.filter(item => item.type === state.currentSavingsFilter);
        }

        if (!filteredItems.length) {
            const emptyText = groupKey === 'savings' && state.currentSavingsFilter !== 'all' 
                ? `尚未新增${state.currentSavingsFilter === 'stock' ? '存股' : '儲蓄'}項目` 
                : '尚未新增項目';
            containerEl.innerHTML = `<div class="monthly-planner-empty">${emptyText}</div>`;
            return;
        }

        containerEl.innerHTML = filteredItems.map((it) => {
            const safeName = String(it.name || '').replace(/"/g, '&quot;');
            const safeNote = String(it.note || '').replace(/"/g, '&quot;');
            const safeAmount = Number.isFinite(it.amount) ? it.amount : 0;
            const itemType = it.type || 'savings';
            const itemIcon = itemType === 'stock' ? '📈' : '💰';
            
            return `
                <div class="monthly-planner-item-row savings-item-row" data-group="${groupKey}" data-id="${it.id}" data-type="${itemType}">
                    <span class="savings-item-icon">${itemIcon}</span>
                    <input class="monthly-planner-item-name savings-item-name" type="text" placeholder="項目" value="${safeName}">
                    <input class="monthly-planner-item-amount" type="number" min="0" step="1" placeholder="金額" value="${safeAmount}">
                    <input class="monthly-planner-item-note" type="text" placeholder="說明" value="${safeNote}">
                    <button class="monthly-planner-item-delete" type="button">✕</button>
                </div>
            `;
        }).join('');

        containerEl.querySelectorAll('.monthly-planner-item-row').forEach((row) => {
            const id = row.getAttribute('data-id');
            const nameEl = row.querySelector('.monthly-planner-item-name');
            const amountEl = row.querySelector('.monthly-planner-item-amount');
            const noteEl = row.querySelector('.monthly-planner-item-note');
            const delBtn = row.querySelector('.monthly-planner-item-delete');

            const idx = (state.items[groupKey] || []).findIndex((x) => x.id === id);
            if (idx < 0) return;

            const onUpdate = () => {
                const current = state.items[groupKey][idx];
                state.items[groupKey][idx] = {
                    ...current,
                    name: nameEl ? nameEl.value : current.name,
                    amount: readNumber(amountEl ? amountEl.value : current.amount),
                    note: noteEl ? noteEl.value : current.note,
                    type: current.type || 'savings' // 保持原有類型
                };
                renderTotals();
            };

            if (nameEl) nameEl.addEventListener('input', onUpdate);
            if (amountEl) amountEl.addEventListener('input', onUpdate);
            if (noteEl) noteEl.addEventListener('input', onUpdate);

            if (delBtn) {
                delBtn.addEventListener('click', () => {
                    state.items[groupKey].splice(idx, 1);
                    renderAll();
                });
            }
        });
    };

    const renderAll = () => {
        renderGroup('fixed', fixedListEl);
        renderGroup('savings', savingsListEl);
        renderGroup('personal', personalListEl);
        renderTotals();
    };

    const load = () => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (!data || data.monthKey !== monthKey) return;

            state = {
                monthKey,
                income: readNumber(data.income),
                items: {
                    fixed: Array.isArray(data.items && data.items.fixed) ? data.items.fixed.map(normalizeItem) : [],
                    savings: Array.isArray(data.items && data.items.savings) ? data.items.savings.map(normalizeItem) : [],
                    personal: Array.isArray(data.items && data.items.personal) ? data.items.personal.map(normalizeItem) : []
                },
                currentSavingsFilter: 'all' // 確保過濾器狀態正確初始化
            };

            incomeInput.value = state.income > 0 ? String(state.income) : '';
        } catch (e) {
        }
    };

    const save = () => {
        const payload = {
            monthKey: state.monthKey,
            income: readNumber(state.income),
            items: state.items,
            updatedAt: Date.now()
        };
        const raw = JSON.stringify(payload);

        const ensureExpenseCategoryExists = (categoryName) => {
            const name = String(categoryName || '').trim();
            if (!name) return false;

            try {
                if (Array.isArray(window.allCategories)) {
                    const exists = window.allCategories.some((c) => c && c.name === name && c.type === 'expense');
                    if (exists) return true;
                }
            } catch (e) {
            }

            try {
                const savedCustomCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
                const duplicate = Array.isArray(savedCustomCategories)
                    ? savedCustomCategories.some((c) => c && c.name === name && c.type === 'expense')
                    : false;

                if (!duplicate) {
                    const newCategory = { name, icon: '💰', type: 'expense' };
                    const next = Array.isArray(savedCustomCategories) ? [...savedCustomCategories, newCategory] : [newCategory];
                    localStorage.setItem('customCategories', JSON.stringify(next));

                    if (Array.isArray(window.allCategories)) {
                        window.allCategories.push(newCategory);
                    }

                    if (typeof getCategoryEnabledState === 'function' && typeof saveCategoryEnabledState === 'function') {
                        const enabledState = getCategoryEnabledState();
                        enabledState[name] = true;
                        saveCategoryEnabledState(enabledState);
                    }
                }
                return true;
            } catch (e) {
                return false;
            }
        };

        const syncFixedItemsToBudgets = () => {
            try {
                const budgets = JSON.parse(localStorage.getItem('categoryBudgets') || '{}');
                const nextBudgets = budgets && typeof budgets === 'object' ? { ...budgets } : {};

                const fixedItems = Array.isArray(state.items.fixed) ? state.items.fixed : [];
                const syncedNames = [];

                fixedItems.forEach((it) => {
                    const name = String(it && it.name ? it.name : '').trim();
                    const amount = readNumber(it && it.amount != null ? it.amount : 0);
                    if (!name) return;
                    if (amount <= 0) return;

                    const ok = ensureExpenseCategoryExists(name);
                    if (!ok) return;

                    nextBudgets[name] = amount;
                    syncedNames.push(name);
                });

                localStorage.setItem('categoryBudgets', JSON.stringify(nextBudgets));

                if (syncedNames.length) {
                    localStorage.setItem(`monthlyPlannerBudgetSync:${monthKey}`, JSON.stringify({
                        monthKey,
                        categories: syncedNames,
                        updatedAt: Date.now()
                    }));
                }

                if (typeof initBudget === 'function') {
                    const pageBudget = document.getElementById('pageBudget');
                    if (pageBudget && pageBudget.style.display !== 'none') {
                        initBudget();
                    }
                }

                if (typeof updateLedgerSummary === 'function') {
                    updateLedgerSummary();
                }
            } catch (e) {
            }
        };

        if (typeof safeSetItem === 'function') {
            const ok = safeSetItem(storageKey, payload);
            if (!ok) return;
        } else {
            try {
                localStorage.setItem(storageKey, raw);
            } catch (e) {
                return;
            }
        }

        syncFixedItemsToBudgets();
        alert('已儲存本月規劃。');
    };

    const addItem = (groupKey, preset = {}) => {
        state.items[groupKey] = state.items[groupKey] || [];
        state.items[groupKey].push(normalizeItem(preset));
        renderAll();
    };

    // 新增儲蓄類型選擇對話框
    const showSavingsTypeDialog = (onSelect) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: var(--bg-card);
            border-radius: 16px;
            padding: 24px;
            max-width: 320px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        dialog.innerHTML = `
            <h3 style="margin: 0 0 20px 0; font-size: 18px; color: var(--text-primary);">選擇儲蓄類型</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <button class="savings-type-option" data-type="stock" style="
                    padding: 16px;
                    border: 2px solid var(--color-primary);
                    border-radius: 12px;
                    background: rgba(var(--color-primary-rgb), 0.1);
                    color: var(--color-primary);
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                ">📈 存股</button>
                <button class="savings-type-option" data-type="savings" style="
                    padding: 16px;
                    border: 2px solid var(--color-success);
                    border-radius: 12px;
                    background: rgba(var(--color-success-rgb), 0.1);
                    color: var(--color-success);
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                ">💰 一般儲蓄</button>
            </div>
            <button class="savings-type-cancel" style="
                margin-top: 20px;
                padding: 12px;
                border: none;
                border-radius: 8px;
                background: var(--bg-light);
                color: var(--text-secondary);
                font-size: 14px;
                cursor: pointer;
                width: 100%;
            ">取消</button>
        `;

        modal.appendChild(dialog);
        document.body.appendChild(modal);

        // 綁定事件
        dialog.querySelectorAll('.savings-type-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                document.body.removeChild(modal);
                if (onSelect) onSelect(type);
            });
        });

        dialog.querySelector('.savings-type-cancel').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    };

    // 儲蓄模板功能
    const savingsTemplates = {
        stock: [
            { name: '定期定額存股', amount: 3000, note: '每月固定購買優質股票' },
            { name: 'ETF投資', amount: 5000, note: '追蹤大盤指數ETF' },
            { name: '股利再投入', amount: 2000, note: '將股利自動再投資' },
            { name: '成長股投資', amount: 4000, note: '專注高成長潛力股票' }
        ],
        savings: [
            { name: '緊急預備金', amount: 2000, note: '3-6個月生活費' },
            { name: '退休儲蓄', amount: 5000, note: '長期退休規劃' },
            { name: '教育基金', amount: 3000, note: '子女教育費用' },
            { name: '旅遊基金', amount: 1500, note: '年度旅遊計畫' },
            { name: '購屋基金', amount: 8000, note: '房屋頭期款準備' },
            { name: '投資理財', amount: 2500, note: '多元化投資配置' }
        ]
    };

    const showSavingsTemplatesDialog = () => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: var(--bg-card);
            border-radius: 16px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        let templatesHtml = '';
        
        // 存股模板
        templatesHtml += `
            <div style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 12px 0; color: var(--color-primary); font-size: 16px; font-weight: 600;">📈 存股模板</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
        `;
        
        savingsTemplates.stock.forEach((template, index) => {
            templatesHtml += `
                <button class="savings-template-btn" data-type="stock" data-index="${index}" style="
                    padding: 12px;
                    border: 1px solid var(--border-light);
                    border-radius: 8px;
                    background: var(--bg-card);
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s;
                ">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${template.name}</div>
                    <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 4px;">${template.note}</div>
                    <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">NT$${template.amount.toLocaleString()}</div>
                </button>
            `;
        });
        
        templatesHtml += `
                </div>
            </div>
        `;

        // 一般儲蓄模板
        templatesHtml += `
            <div style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 12px 0; color: var(--color-success); font-size: 16px; font-weight: 600;">💰 一般儲蓄模板</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
        `;
        
        savingsTemplates.savings.forEach((template, index) => {
            templatesHtml += `
                <button class="savings-template-btn" data-type="savings" data-index="${index}" style="
                    padding: 12px;
                    border: 1px solid var(--border-light);
                    border-radius: 8px;
                    background: var(--bg-card);
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s;
                ">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${template.name}</div>
                    <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 4px;">${template.note}</div>
                    <div style="font-size: 16px; font-weight: 700; color: var(--color-success);">NT$${template.amount.toLocaleString()}</div>
                </button>
            `;
        });
        
        templatesHtml += `
                </div>
            </div>
        `;

        dialog.innerHTML = `
            <h3 style="margin: 0 0 20px 0; font-size: 18px; color: var(--text-primary);">快速新增儲蓄項目</h3>
            ${templatesHtml}
            <button class="savings-template-cancel" style="
                margin-top: 20px;
                padding: 12px;
                border: none;
                border-radius: 8px;
                background: var(--bg-light);
                color: var(--text-secondary);
                font-size: 14px;
                cursor: pointer;
                width: 100%;
            ">取消</button>
        `;

        modal.appendChild(dialog);
        document.body.appendChild(modal);

        // 綁定事件
        dialog.querySelectorAll('.savings-template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const index = parseInt(btn.dataset.index);
                const template = savingsTemplates[type][index];
                
                document.body.removeChild(modal);
                addItem('savings', {
                    ...template,
                    type: type
                });
            });
        });

        dialog.querySelector('.savings-template-cancel').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    };

    const loadSavingGoals = () => {
        try {
            const raw = localStorage.getItem(savingGoalsKey);
            const data = raw ? JSON.parse(raw) : [];
            savingGoals = Array.isArray(data) ? data : [];
        } catch (e) {
            savingGoals = [];
        }
    };

    const saveSavingGoals = () => {
        try {
            localStorage.setItem(savingGoalsKey, JSON.stringify(savingGoals));
        } catch (e) {
        }
    };

    const normalizeGoal = (g) => {
        const safe = g && typeof g === 'object' ? g : {};
        return {
            id: safe.id || newId(),
            name: safe.name != null ? String(safe.name) : '',
            target: readNumber(safe.target),
            monthly: readNumber(safe.monthly),
            saved: readNumber(safe.saved)
        };
    };

    const renderSavingGoals = () => {
        if (!goalListEl) return;

        if (!savingGoals.length) {
            goalListEl.innerHTML = '<div class="monthly-planner-empty">尚未新增目標</div>';
            return;
        }

        const base = parseMonthKey(monthKey) || new Date();
        const baseMonth = new Date(base.getFullYear(), base.getMonth(), 1);

        const formatMonthText = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        goalListEl.innerHTML = savingGoals.map((goal) => {
            const g = normalizeGoal(goal);
            const remaining = Math.max(0, g.target - g.saved);
            const canEstimate = g.monthly > 0 && g.target > 0;
            const monthsNeed = canEstimate ? Math.ceil(remaining / g.monthly) : null;
            const eta = monthsNeed != null ? new Date(baseMonth.getFullYear(), baseMonth.getMonth() + monthsNeed, 1) : null;
            const percent = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;

            const isCompleted = percent >= 100;
            const statusClass = isCompleted ? 'goal-completed' : '';
            const statusIcon = isCompleted ? '🎉' : '';
            const statusText = isCompleted ? '已達成！' : '';
            
            return `
                <div class="monthly-planner-goal-card ${statusClass}" data-id="${g.id}">
                    <div class="monthly-planner-goal-head">
                        <div class="monthly-planner-goal-name">${statusIcon}${String(g.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                        <button class="monthly-planner-goal-delete" type="button">✕</button>
                    </div>
                    <div class="monthly-planner-goal-meta">
                        <div>目標：${formatTwd(g.target)}</div>
                        <div>已存：${formatTwd(g.saved)}</div>
                        <div>剩餘：${formatTwd(remaining)}</div>
                        <div>每月：${formatTwd(g.monthly)}</div>
                    </div>
                    <div class="monthly-planner-goal-progress">
                        <div class="monthly-planner-goal-bar">
                            <div class="monthly-planner-goal-bar-fill" style="width: ${percent.toFixed(1)}%"></div>
                        </div>
                        <div class="monthly-planner-goal-progress-text">${percent.toFixed(1)}% (${g.saved.toLocaleString()} / ${g.target.toLocaleString()})</div>
                    </div>
                    ${statusText ? `<div class="monthly-planner-goal-status">${statusText}</div>` : ''}
                    <div class="monthly-planner-goal-eta">
                        ${canEstimate ? `預計達成：${eta ? formatMonthText(eta) : '-' }（約 ${monthsNeed} 個月）` : '請輸入目標金額與每月存入，才能預估達成時間。'}
                    </div>
                    <div class="monthly-planner-goal-actions">
                        <button class="monthly-planner-btn monthly-planner-btn--secondary monthly-planner-goal-add-to-plan" type="button">加入本月儲蓄</button>
                    </div>
                </div>
            `;
        }).join('');

        goalListEl.querySelectorAll('.monthly-planner-goal-card').forEach((card) => {
            const id = card.getAttribute('data-id');
            const idx = savingGoals.findIndex((x) => x && x.id === id);
            const delBtn = card.querySelector('.monthly-planner-goal-delete');
            const addToPlanBtn = card.querySelector('.monthly-planner-goal-add-to-plan');

            if (idx < 0) return;

            if (delBtn) {
                delBtn.addEventListener('click', () => {
                    savingGoals.splice(idx, 1);
                    saveSavingGoals();
                    renderSavingGoals();
                });
            }

            if (addToPlanBtn) {
                addToPlanBtn.addEventListener('click', () => {
                    const g = normalizeGoal(savingGoals[idx]);
                    if (!g.name || g.monthly <= 0) return;
                    addItem('savings', { name: `存錢目標：${g.name}`, amount: g.monthly, note: '自動加入' });
                });
            }
        });
    };

    const applySample = () => {
        state.income = 37000;
        incomeInput.value = '37000';

        state.items.fixed = [
            { id: newId(), name: '房租', amount: 7500, note: '固定支出' },
            { id: newId(), name: '電燈費', amount: 1500, note: '固定支出' },
            { id: newId(), name: '電信費', amount: 699, note: '固定支出' },
            { id: newId(), name: '保險', amount: 4500, note: '固定支出' },
            { id: newId(), name: '菜錢（跟媽媽煮）', amount: 5000, note: '家用菜錢' },
            { id: newId(), name: '太太礦錢', amount: 4000, note: '每月固定給' },
            { id: newId(), name: '美甲', amount: 2100, note: '保留' },
            { id: newId(), name: '分期', amount: 5500, note: '16,500 ÷ 3 期' },
            { id: newId(), name: '捐款', amount: 400, note: '固定善款' }
        ].map(normalizeItem);

        state.items.savings = [
            { id: newId(), name: '存股', amount: 1000, note: '暫時壓低，等分期結束再加碼', type: 'stock' },
            { id: newId(), name: '預備金儲蓄', amount: 800, note: '每月先小額存', type: 'savings' }
        ].map(normalizeItem);

        state.items.personal = [
            { id: newId(), name: '生活費（個人）', amount: 4000, note: '吃飯、交通、零用' }
        ].map(normalizeItem);

        renderAll();
    };

    load();
    loadSavingGoals();
    state.income = readNumber(incomeInput.value);
    renderAll();
    renderSavingGoals();

    incomeInput.addEventListener('input', () => {
        state.income = readNumber(incomeInput.value);
        renderTotals();
    });

    const bindOnce = (el, type, handler) => {
        if (!el) return;
        const clone = el.cloneNode(true);
        el.parentNode.replaceChild(clone, el);
        clone.addEventListener(type, handler);
        return clone;
    };

    bindOnce(addFixedBtn, 'click', () => addItem('fixed'));
    bindOnce(addSavingsBtn, 'click', () => {
        showSavingsTypeDialog((type) => {
            addItem('savings', { type });
        });
    });
    bindOnce(addPersonalBtn, 'click', () => addItem('personal'));
    bindOnce(applySampleBtn, 'click', () => applySample());
    bindOnce(saveBtn, 'click', () => save());

    // 綁定快速新增按鈕
    const quickAddBtn = document.getElementById('monthlyPlannerQuickAddBtn');
    bindOnce(quickAddBtn, 'click', () => {
        showSavingsTemplatesDialog();
    });

    // 綁定儲蓄類型標籤切換事件
    const savingsTabs = document.querySelectorAll('.savings-type-tab');
    savingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 更新活動標籤
            savingsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 更新過濾器並重新渲染
            state.currentSavingsFilter = tab.dataset.type;
            renderGroup('savings', savingsListEl);
        });
    });

    bindOnce(goalAddBtn, 'click', () => {
        if (!goalNameInput || !goalTargetInput || !goalMonthlyInput) return;
        const name = String(goalNameInput.value || '').trim();
        const target = readNumber(goalTargetInput.value);
        const monthly = readNumber(goalMonthlyInput.value);
        const saved = readNumber(goalSavedInput ? goalSavedInput.value : 0);

        if (!name) {
            goalNameInput.focus();
            return;
        }

        const goal = normalizeGoal({ name, target, monthly, saved });
        savingGoals.push(goal);
        saveSavingGoals();
        renderSavingGoals();

        goalNameInput.value = '';
        goalTargetInput.value = '';
        goalMonthlyInput.value = '';
        if (goalSavedInput) goalSavedInput.value = '';
    });
}

// 更新帳本標題（顯示當前選中帳戶的名稱）
function updateLedgerTitle() {
    const ledgerTitle = document.querySelector('.ledger-title');
    if (!ledgerTitle) return;
    
    const selectedAccount = getSelectedAccount();
    if (selectedAccount) {
        ledgerTitle.textContent = `${selectedAccount.name}的帳本`;
    } else {
        ledgerTitle.textContent = '默認帳本';
    }
}

// 初始化記帳本頁面
function initLedger() {
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const ledgerList = document.getElementById('ledgerList');
    
    if (!ledgerList) return;
    
    // 初始化類型標籤切換
    initLedgerTypeTabs();
    
    // 初始化搜尋和篩選功能
    initSearchAndFilters();
    
    // 更新帳本標題
    updateLedgerTitle();
    
    // 獲取當前選中的類型
    const currentType = window.ledgerType || 'expense';
    
    // 篩選記錄（先按類型，再應用搜尋和篩選）
    let filteredRecords = filterRecordsByType(records, currentType);
    
    // 應用搜尋和篩選條件
    filteredRecords = applyAllFilters(filteredRecords);
    
    // 更新摘要（使用原始類型篩選後的記錄，不包含搜尋篩選）
    const typeFilteredRecords = filterRecordsByType(records, currentType);
    updateLedgerSummary(typeFilteredRecords, currentType);
    
    // 更新當天支出
    updateDailyExpense();
    
    // 更新帳戶顯示
    if (typeof updateAccountDisplay === 'function') {
        updateAccountDisplay();
    }
    
    // 顯示交易列表（應用所有篩選後的記錄）
    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');
    const hasDateFilter = !!((filterDateFrom && filterDateFrom.value) || (filterDateTo && filterDateTo.value));
    displayLedgerTransactions(filteredRecords, hasDateFilter);
}

// 初始化搜尋和篩選功能
function initSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');
    const filterCategory = document.getElementById('filterCategory');
    const filterAmountMin = document.getElementById('filterAmountMin');
    const filterAmountMax = document.getElementById('filterAmountMax');
    const filterClearBtn = document.getElementById('filterClearBtn');
    
    // 初始化分類選單
    if (filterCategory) {
        const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
        const categories = new Set();
        records.forEach(r => {
            if (r.category) {
                categories.add(r.category);
            }
        });
        const sortedCategories = Array.from(categories).sort();
        sortedCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            filterCategory.appendChild(option);
        });
    }
    
    // 綁定篩選事件
    const applyFilters = () => {
        const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
        const currentType = window.ledgerType || 'expense';
        let filteredRecords = filterRecordsByType(records, currentType);
        
        // 應用所有篩選
        filteredRecords = applyAllFilters(filteredRecords);
        
        // 更新顯示
        const hasDateFilter = !!((filterDateFrom && filterDateFrom.value) || (filterDateTo && filterDateTo.value));
        displayLedgerTransactions(filteredRecords, hasDateFilter);
    };
    
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    if (filterDateFrom) {
        filterDateFrom.addEventListener('change', applyFilters);
    }
    if (filterDateTo) {
        filterDateTo.addEventListener('change', applyFilters);
    }
    if (filterCategory) {
        filterCategory.addEventListener('change', applyFilters);
    }
    if (filterAmountMin) {
        filterAmountMin.addEventListener('input', applyFilters);
    }
    if (filterAmountMax) {
        filterAmountMax.addEventListener('input', applyFilters);
    }
    if (filterClearBtn) {
        filterClearBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (filterDateFrom) filterDateFrom.value = '';
            if (filterDateTo) filterDateTo.value = '';
            if (filterCategory) filterCategory.value = '';
            if (filterAmountMin) filterAmountMin.value = '';
            if (filterAmountMax) filterAmountMax.value = '';
            applyFilters();
        });
    }
}

// 應用所有篩選條件
function applyAllFilters(records) {
    const searchInput = document.getElementById('searchInput');
    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');
    const filterCategory = document.getElementById('filterCategory');
    const filterAmountMin = document.getElementById('filterAmountMin');
    const filterAmountMax = document.getElementById('filterAmountMax');
    
    let filtered = [...records];
    
    // 關鍵字搜尋（備註、分類、帳戶）
    if (searchInput && searchInput.value.trim()) {
        const keyword = searchInput.value.trim().toLowerCase();
        filtered = filtered.filter(record => {
            const note = (record.note || '').toLowerCase();
            const category = (record.category || '').toLowerCase();
            const accountName = getAccountName(record.account).toLowerCase();
            return note.includes(keyword) || 
                   category.includes(keyword) || 
                   accountName.includes(keyword);
        });
    }
    
    // 日期範圍篩選
    if (filterDateFrom && filterDateFrom.value) {
        const fromDate = new Date(filterDateFrom.value);
        fromDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(record => {
            const recordDate = new Date(record.date);
            recordDate.setHours(0, 0, 0, 0);
            return recordDate >= fromDate;
        });
    }
    if (filterDateTo && filterDateTo.value) {
        const toDate = new Date(filterDateTo.value);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(record => {
            const recordDate = new Date(record.date);
            recordDate.setHours(0, 0, 0, 0);
            return recordDate <= toDate;
        });
    }
    
    // 分類篩選
    if (filterCategory && filterCategory.value) {
        filtered = filtered.filter(record => record.category === filterCategory.value);
    }
    
    // 金額範圍篩選
    if (filterAmountMin && filterAmountMin.value) {
        const minAmount = parseFloat(filterAmountMin.value);
        filtered = filtered.filter(record => (record.amount || 0) >= minAmount);
    }
    if (filterAmountMax && filterAmountMax.value) {
        const maxAmount = parseFloat(filterAmountMax.value);
        filtered = filtered.filter(record => (record.amount || 0) <= maxAmount);
    }
    
    return filtered;
}

// 獲取帳戶名稱（輔助函數）
function getAccountName(accountId) {
    if (!accountId || typeof getAccounts !== 'function') return '';
    const accounts = getAccounts();
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : '';
}

// 初始化記帳本類型標籤切換
function initLedgerTypeTabs() {
    const ledgerTypeTabs = document.querySelectorAll('.ledger-type-tab');
    
    // 初始化默認類型
    if (!window.ledgerType) {
        window.ledgerType = 'expense';
    }
    
    ledgerTypeTabs.forEach(tab => {
        // 移除舊的事件監聽器（避免重複綁定）
        const newTab = tab.cloneNode(true);
        tab.parentNode.replaceChild(newTab, tab);
        
        // 設置初始活動狀態
        if (newTab.dataset.type === window.ledgerType) {
            newTab.classList.add('active');
        } else {
            newTab.classList.remove('active');
        }
        
        newTab.addEventListener('click', () => {
            const recordType = newTab.dataset.type;
            
            // 移除所有活動狀態
            document.querySelectorAll('.ledger-type-tab').forEach(t => t.classList.remove('active'));
            
            // 添加活動狀態到當前按鈕
            newTab.classList.add('active');
            
            // 保存記錄類型
            window.ledgerType = recordType;
            
            // 重新初始化記帳本
            initLedger();
        });
    });
}

// 根據類型篩選記錄
function filterRecordsByType(records, type) {
    if (!type || type === 'all') {
        return records;
    }
    
    return records.filter(record => {
        if (type === 'expense') {
            return record.type === 'expense' || !record.type;
        } else if (type === 'income') {
            return record.type === 'income';
        } else if (type === 'transfer') {
            return record.type === 'transfer';
        }
        return true;
    });
}

// 更新記帳本摘要
function updateLedgerSummary(records, type = null) {
    // 兼容：部分呼叫點會不帶 records 參數
    if (!Array.isArray(records)) {
        try {
            const stored = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
            records = Array.isArray(stored) ? stored : [];
        } catch (e) {
            records = [];
        }
    }
    const currentMonth = getSelectedMonthKey();
    
    const summaryMonth = document.getElementById('summaryMonth');
    if (summaryMonth) {
        summaryMonth.textContent = currentMonth;
    }
    
    // 計算當月收入和支出（只計算當前類型的記錄）
    let totalIncome = 0;
    let totalExpense = 0;
    let totalTransfer = 0;
    
    records.forEach(record => {
        if (!record) return;
        if (!record.date) return;
        const recordDate = new Date(record.date);
        if (isNaN(recordDate.getTime())) return;
        const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (recordMonth === currentMonth) {
            if (record.type === 'income') {
                totalIncome += Number(record.amount) || 0;
            } else if (record.type === 'expense' || !record.type) {
                totalExpense += Number(record.amount) || 0;
            } else if (record.type === 'transfer') {
                totalTransfer += Number(record.amount) || 0;
            }
        }
    });
    
    // 計算月預算（從所有分類預算中加總）
    const budgets = JSON.parse(localStorage.getItem('categoryBudgets') || '{}');
    let totalBudget = 0;
    Object.keys(budgets).forEach(categoryId => {
        totalBudget += budgets[categoryId];
    });
    
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpenseEl = document.getElementById('totalExpense');
    const summaryLineEl = document.getElementById('summaryLine');
    const monthBudgetEl = document.getElementById('monthBudget');
    
    // 根據類型顯示不同的摘要
    if (type === 'income') {
        if (totalIncomeEl) totalIncomeEl.textContent = `NT$${totalIncome.toLocaleString('zh-TW')}`;
        if (totalExpenseEl) totalExpenseEl.textContent = '--';
        if (summaryLineEl) {
            summaryLineEl.textContent = `總收入: NT$${totalIncome.toLocaleString('zh-TW')}`;
        }
    } else if (type === 'expense') {
        if (totalIncomeEl) totalIncomeEl.textContent = '--';
        if (totalExpenseEl) totalExpenseEl.textContent = `NT$${totalExpense.toLocaleString('zh-TW')}`;
        if (summaryLineEl) {
            summaryLineEl.textContent = `總支出: NT$${totalExpense.toLocaleString('zh-TW')}`;
        }
    } else if (type === 'transfer') {
        if (totalIncomeEl) totalIncomeEl.textContent = '--';
        if (totalExpenseEl) totalExpenseEl.textContent = `NT$${totalTransfer.toLocaleString('zh-TW')}`;
        if (summaryLineEl) {
            summaryLineEl.textContent = `總轉帳: NT$${totalTransfer.toLocaleString('zh-TW')}`;
        }
    } else {
        // 顯示全部
        if (totalIncomeEl) totalIncomeEl.textContent = `NT$${totalIncome.toLocaleString('zh-TW')}`;
        if (totalExpenseEl) totalExpenseEl.textContent = `NT$${totalExpense.toLocaleString('zh-TW')}`;
        if (summaryLineEl) {
            summaryLineEl.textContent = `收入:NT$${totalIncome.toLocaleString('zh-TW')} 支出:NT$${totalExpense.toLocaleString('zh-TW')}`;
        }
    }
    
    if (monthBudgetEl) monthBudgetEl.textContent = `NT$${totalBudget.toLocaleString('zh-TW')}`;
}

// 計算並更新當天支出
function updateDailyExpense() {
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // 計算今天的總支出（不包括轉帳）
    let dailyExpense = 0;
    records.forEach(record => {
        const recordDate = new Date(record.date);
        const recordDateStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
        
        // 只計算支出類型的記錄
        if (recordDateStr === todayStr && (record.type === 'expense' || !record.type)) {
            dailyExpense += record.amount || 0;
        }
    });
    
    // 更新顯示
    const dailyExpenseAmount = document.getElementById('dailyExpenseAmount');
    if (dailyExpenseAmount) {
        dailyExpenseAmount.textContent = `NT$${dailyExpense.toLocaleString('zh-TW')}`;
    }
}

// 顯示記帳本交易列表
function displayLedgerTransactions(records, showAll = false) {
    const ledgerList = document.getElementById('ledgerList');
    if (!ledgerList) return;
    
    // 確保 records 是一個有效的陣列
    if (!records || !Array.isArray(records)) {
        records = [];
    }
    
    if (records.length === 0) {
        ledgerList.innerHTML = '<div class="empty-state">尚無交易記錄</div>';
        return;
    }
    
    // 按日期分組
    const grouped = {};
    records.forEach(record => {
        const date = new Date(record.date);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const dayName = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getDay()];
        const fullDateKey = `${dateKey} ${dayName}`;
        
        if (!grouped[fullDateKey]) {
            grouped[fullDateKey] = [];
        }
        grouped[fullDateKey].push(record);
    });
    
    // 對每個日期組內的記錄按時間戳排序（最新的在前）
    Object.keys(grouped).forEach(dateKey => {
        grouped[dateKey].sort((a, b) => {
            // 優先使用 timestamp，如果沒有則使用 date
            const timeA = a.timestamp ? new Date(a.timestamp) : new Date(a.date);
            const timeB = b.timestamp ? new Date(b.timestamp) : new Date(b.date);
            return timeB - timeA; // 降序：最新的在前
        });
    });
    
    // 按日期排序（最新的在前）
    const sortedDates = Object.keys(grouped).sort((a, b) => {
        return b.localeCompare(a);
    });
    
    // 如果不是顯示全部，只顯示今天的記錄
    let displayDates = sortedDates;
    let hasMoreRecords = false;
    if (!showAll) {
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        displayDates = sortedDates.filter(dateKey => {
            return dateKey.startsWith(todayKey);
        });

        hasMoreRecords = sortedDates.length > displayDates.length;
    }
    
    let html = '';
    displayDates.forEach(dateKey => {
        // 優化日期顯示：如果是當年，隱藏年份讓畫面更流暢
        let displayHeader = dateKey;
        const currentYear = new Date().getFullYear();
        if (dateKey.startsWith(String(currentYear) + '-')) {
            displayHeader = dateKey.substring(5); // 移除 "YYYY-"
        }

        html += `<div class="transaction-group">`;
        html += `<div class="group-header">${displayHeader}</div>`;
        
        grouped[dateKey].forEach((record, index) => {
            const amount = record.amount || 0;
            const isExpense = record.type === 'expense' || !record.type;
            const isTransfer = record.type === 'transfer';

            // 定期定額轉帳：分類欄位顯示股票（避免顯示未分類）
            let displayCategory = record.category;
            if (isTransfer && (!displayCategory || displayCategory === '')) {
                if (record.linkedInvestment === true && record.investmentRecordId) {
                    try {
                        const inv = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
                        const matched = inv.find(r => (r.timestamp || r.id) === record.investmentRecordId);
                        if (matched && matched.stockCode) {
                            displayCategory = matched.stockName
                                ? `${matched.stockCode} ${matched.stockName}`
                                : matched.stockCode;
                        }
                    } catch (_) {}
                }

                if ((!displayCategory || displayCategory === '') && record.note) {
                    const m = record.note.match(/\((\d{3,6}[A-Z]?)\)/);
                    if (m && m[1]) {
                        displayCategory = m[1];
                    }
                }
            }
            
            // 獲取帳戶信息
            let accountInfo = '';
            if (record.account && typeof getAccounts === 'function') {
                const accounts = getAccounts();
                const account = accounts.find(a => a.id === record.account);
                if (account) {
                    // 如果有上傳的圖片，顯示圖片；否則顯示默認圖標
                    const accountIcon = account.image 
                        ? `<img src="${account.image}" alt="${account.name}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 6px; display: inline-block; vertical-align: middle; margin-right: 6px;">`
                        : '💳 ';
                    accountInfo = `<div class="transaction-account">${accountIcon}${account.name}</div>`;
                }
            }
            
            // 獲取表情或分類圖標
            let iconHtml = '';
            if (record.emoji) {
                if (record.emoji.type === 'image' && isLikelyImageSrc(record.emoji.value)) {
                    iconHtml = `<img src="${record.emoji.value}" alt="表情" class="transaction-emoji-image">`;
                } else {
                    iconHtml = record.emoji.value;
                }
            } else {
                iconHtml = getCategoryIcon(record.category);
            }
            
            // 獲取成員信息
            let memberInfo = '';
            if (record.member) {
                const members = typeof getMembers === 'function' ? getMembers() : [];
                const member = members.find(m => m.name === record.member);
                const memberIcon = member ? member.icon : '👤';
                memberInfo = `<div class="transaction-member">${memberIcon} ${record.member}</div>`;
            }
            
            // 獲取備註圖示
            const getNoteIcon = (note) => {
                if (!note) return '';
                const noteIcons = {
                    '早餐': '🍳',
                    '午餐': '🍱',
                    '晚餐': '🍽️',
                    '交通': '🚗',
                    '購物': '🛒',
                    '娛樂': '🎮'
                };
                // 檢查備註中是否包含常用備註關鍵字
                for (const [key, icon] of Object.entries(noteIcons)) {
                    if (note.includes(key)) {
                        return icon + ' ';
                    }
                }
                return '';
            };
            
            const noteIcon = getNoteIcon(record.note);
            const noteDisplay = record.note ? noteIcon + record.note : '';
            
            // 收據圖片顯示 - 支援多張圖片
            let receiptImageHtml = '';
            if (record.receiptImages && record.receiptImages.length > 0) {
                if (record.receiptImages.length === 1) {
                    // 單張圖片顯示
                    receiptImageHtml = `
                        <div class="transaction-receipt" style="margin-top: 8px;">
                            <img src="${record.receiptImages[0]}" alt="收據" class="receipt-thumbnail" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid #e0e0e0;" data-receipt-images='${JSON.stringify(record.receiptImages)}' data-record-timestamp="${record.timestamp || ''}">
                        </div>
                    `;
                } else {
                    // 多張圖片顯示為縮圖畫廊
                    const thumbnails = record.receiptImages.slice(0, 3).map((img, index) => 
                        `<img src="${img}" alt="收據${index + 1}" class="receipt-thumbnail-small" style="width: 30px; height: 30px; object-fit: cover; border-radius: 4px; border: 1px solid #e0e0e0; margin-right: 4px;">`
                    ).join('');
                    
                    const moreText = record.receiptImages.length > 3 ? `+${record.receiptImages.length - 3}` : '';
                    
                    receiptImageHtml = `
                        <div class="transaction-receipt-gallery" style="margin-top: 8px; cursor: pointer;" data-receipt-images='${JSON.stringify(record.receiptImages)}' data-record-timestamp="${record.timestamp || ''}">
                            <div class="receipt-thumbnails" style="display: flex; align-items: center;">
                                ${thumbnails}
                                ${moreText ? `<span style="font-size: 12px; color: #666; margin-left: 4px;">${moreText}</span>` : ''}
                            </div>
                        </div>
                    `;
                }
            } else if (record.receiptImage) {
                // 向後相容舊的單張圖片格式
                receiptImageHtml = `
                    <div class="transaction-receipt" style="margin-top: 8px;">
                        <img src="${record.receiptImage}" alt="收據" class="receipt-thumbnail" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid #e0e0e0;" data-receipt-image="${record.receiptImage}" data-record-timestamp="${record.timestamp || ''}">
                    </div>
                `;
            }
            
            html += `
                <div class="transaction-item">
                    <div class="transaction-icon">${iconHtml}</div>
                    <div class="transaction-info">
                        <div class="transaction-category">${displayCategory || '未分類'}</div>
                        ${accountInfo}
                        ${memberInfo}
                        ${noteDisplay ? `<div class="transaction-note">${noteDisplay}</div>` : ''}
                        ${receiptImageHtml}
                    </div>
                    <div class="transaction-amount-wrapper">
                        <div class="transaction-amount ${isExpense ? 'expense' : isTransfer ? 'transfer' : 'income'}">
                            ${isTransfer ? '' : isExpense ? '-' : '+'}NT$${amount.toLocaleString('zh-TW')}
                        </div>
                        <button class="transaction-delete-btn" data-record-timestamp="${record.timestamp || ''}" data-record-date="${record.date}" data-record-amount="${record.amount}" data-record-category="${record.category || ''}" title="刪除">🗑️</button>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    });
    
    // 如果有更多記錄且不是顯示全部，添加今日支出和查看歷史記錄按鈕
    if (hasMoreRecords && !showAll) {
        // 計算今日支出金額
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        let dailyExpense = 0;
        records.forEach(record => {
            const recordDate = new Date(record.date);
            const recordDateStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
            if (recordDateStr === todayStr && (record.type === 'expense' || !record.type)) {
                dailyExpense += record.amount || 0;
            }
        });
        const todayExpense = `NT$${dailyExpense.toLocaleString('zh-TW')}`;
        
        html += `
            <div class="history-btn-container">
                <div class="daily-expense-in-history">
                    <span class="daily-expense-label">今日支出</span>
                    <span class="daily-expense-amount">${todayExpense}</span>
                </div>
                <button id="viewHistoryBtn" class="view-history-btn">
                    <span class="history-btn-icon">📜</span>
                    <span class="history-btn-text">查看歷史記錄</span>
                    <span class="history-btn-count">(${sortedDates.length - displayDates.length} 天)</span>
                </button>
            </div>
        `;
    }
    
    ledgerList.innerHTML = html;
    
    // 添加交易項目點擊事件監聽器
    addTransactionClickHandlers();
    
    // 綁定收據圖片點擊事件（查看大圖）
    ledgerList.querySelectorAll('.receipt-thumbnail').forEach(img => {
        img.addEventListener('click', () => {
            const imageUrl = img.getAttribute('data-receipt-image');
            if (imageUrl) {
                showReceiptImageModal(imageUrl);
            }
        });
    });
    
    // 綁定多圖片庫點擊事件
    ledgerList.querySelectorAll('.transaction-receipt-gallery').forEach(gallery => {
        gallery.addEventListener('click', () => {
            const imagesData = gallery.getAttribute('data-receipt-images');
            const timestamp = gallery.getAttribute('data-record-timestamp');
            if (imagesData) {
                try {
                    const images = JSON.parse(imagesData);
                    // 找到對應的記錄並顯示詳情
                    const records = JSON.parse(localStorage.getItem('records') || '[]');
                    const record = records.find(r => r.timestamp === timestamp);
                    if (record) {
                        showEntryDetail(record);
                    }
                } catch (error) {
                    console.error('解析圖片數據失敗:', error);
                }
            }
        });
    });
    
    // 綁定刪除按鈕事件
    document.querySelectorAll('.transaction-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止觸發父元素的點擊事件
            deleteTransaction(btn);
        });
    });
    
    // 綁定查看歷史記錄按鈕
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');
    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', () => {
            showHistoryRecords(records);
        });
    }
}

// 顯示歷史記錄
function showHistoryRecords(records) {
    const modal = document.createElement('div');
    modal.className = 'history-records-modal';
    // 檢測是否為手機端
    const isMobile = window.innerWidth <= 480;
    const modalStyle = isMobile 
        ? 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10005; display: flex; align-items: stretch; justify-content: center; padding: 0; overflow: hidden; touch-action: pan-y;'
        : 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10005; display: flex; align-items: center; justify-content: center; padding: 20px; overflow: hidden; touch-action: pan-y;';
    modal.style.cssText = modalStyle;
    
    // 獲取保存的背景圖片
    const savedBackground = localStorage.getItem('historyBackground') || '';
    
    modal.innerHTML = `
        <div class="history-modal-content" id="historyModalContent">
            <div class="history-modal-header">
                <h2>📜 歷史記錄</h2>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button class="history-advisor-btn" title="理財顧問">💬</button>
                    <button class="history-background-btn" title="選擇背景">🎨</button>
                    <button class="history-close-btn">✕</button>
                </div>
            </div>

            <div class="history-search-bar">
                <div class="history-search-input-wrap">
                    <span class="history-search-icon">🔎</span>
                    <input id="historySearchInput" class="history-search-input" type="text" placeholder="搜尋分類 / 備註 / 成員 / 帳戶 / 金額" />
                </div>
                <button id="historySearchClearBtn" class="history-search-clear" type="button">清除</button>
            </div>
            
            <div id="historyRecordsList" class="history-records-list">
                <!-- 歷史記錄列表將由 JavaScript 動態生成 -->
            </div>
            
            <!-- 理財顧問聊天界面 -->
            <div id="historyAdvisorChat" class="history-advisor-chat" style="display: none;">
                <div class="advisor-chat-header">
                    <div class="advisor-avatar">
                        <img src="image/7.png" alt="小森" class="advisor-avatar-image">
                    </div>
                    <div class="advisor-info">
                        <div class="advisor-name">小森</div>
                        <div class="advisor-status">在線</div>
                    </div>
                    <button class="advisor-close-btn">✕</button>
                </div>
                <div class="advisor-chat-messages" id="advisorChatMessages">
                    <!-- 消息將由 JavaScript 動態生成 -->
                </div>
                <div class="advisor-chat-input-container">
                    <input type="text" id="advisorChatInput" class="advisor-chat-input" placeholder="輸入問題...">
                    <button id="advisorSendBtn" class="advisor-send-btn">發送</button>
                </div>
            </div>
        </div>
    `;
    
    // 應用背景圖片
    const modalContent = modal.querySelector('#historyModalContent');
    if (savedBackground) {
        modalContent.style.backgroundImage = `url(${savedBackground})`;
        modalContent.style.backgroundSize = 'cover';
        modalContent.style.backgroundPosition = 'center';
        modalContent.style.backgroundRepeat = 'no-repeat';
        modalContent.classList.add('has-background');
    } else {
        modalContent.classList.remove('has-background');
    }
    
    document.body.appendChild(modal);

    const historySearchInput = modal.querySelector('#historySearchInput');
    const historySearchClearBtn = modal.querySelector('#historySearchClearBtn');
    if (historySearchInput) {
        if (historySearchClearBtn) {
            historySearchClearBtn.style.display = historySearchInput.value.trim() ? 'inline-flex' : 'none';
        }
        historySearchInput.addEventListener('input', () => {
            if (historySearchClearBtn) {
                historySearchClearBtn.style.display = historySearchInput.value.trim() ? 'inline-flex' : 'none';
            }
            renderHistoryRecords();
        });
        historySearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                renderHistoryRecords();
            }
        });
    }
    if (historySearchClearBtn && historySearchInput) {
        historySearchClearBtn.addEventListener('click', () => {
            historySearchInput.value = '';
            historySearchInput.focus();
            renderHistoryRecords();
        });
    }
    
    // 渲染歷史記錄列表
    const renderHistoryRecords = () => {
        const historyList = modal.querySelector('#historyRecordsList');
        if (!historyList) return;
        
        // 重新讀取最新記錄（確保是最新的）
        const allRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
        const currentType = window.ledgerType || 'expense';
        let filteredRecords = filterRecordsByType(allRecords, currentType);

        const keyword = (historySearchInput ? historySearchInput.value : '').trim().toLowerCase();
        if (keyword) {
            let accounts = [];
            if (typeof getAccounts === 'function') {
                try {
                    accounts = getAccounts() || [];
                } catch (e) {
                    accounts = [];
                }
            }

            filteredRecords = filteredRecords.filter(record => {
                const amountStr = (record.amount ?? '').toString();
                const category = (record.category || '').toLowerCase();
                const note = (record.note || '').toLowerCase();
                const member = (record.member || '').toLowerCase();
                let accountName = '';
                if (record.account && accounts.length) {
                    const acct = accounts.find(a => a.id === record.account);
                    accountName = (acct?.name || '').toLowerCase();
                }
                const combined = `${category} ${note} ${member} ${accountName} ${amountStr}`;
                return combined.includes(keyword);
            });
        }
        
        if (filteredRecords.length === 0) {
            historyList.innerHTML = keyword
                ? '<div class="empty-state" style="text-align: center; padding: 40px; color: var(--text-tertiary);">找不到符合搜尋條件的記錄</div>'
                : '<div class="empty-state" style="text-align: center; padding: 40px; color: var(--text-tertiary);">尚無歷史記錄</div>';
            return;
        }
        
        // 按日期分組
        const grouped = {};
        filteredRecords.forEach(record => {
            const date = new Date(record.date);
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const dayName = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getDay()];
            const fullDateKey = `${dateKey} ${dayName}`;
            
            if (!grouped[fullDateKey]) {
                grouped[fullDateKey] = [];
            }
            grouped[fullDateKey].push(record);
        });
        
        // 對每個日期組內的記錄按時間戳排序（最新的在前）
        Object.keys(grouped).forEach(dateKey => {
            grouped[dateKey].sort((a, b) => {
                const timeA = a.timestamp ? new Date(a.timestamp) : new Date(a.date);
                const timeB = b.timestamp ? new Date(b.timestamp) : new Date(b.date);
                return timeB - timeA;
            });
        });
        
        // 按日期排序（最新的在前）
        const sortedDates = Object.keys(grouped).sort((a, b) => {
            return b.localeCompare(a);
        });
        
        let html = '';
        sortedDates.forEach(dateKey => {
            // 優化日期顯示：如果是當年，隱藏年份
            let displayHeader = dateKey;
            const currentYear = new Date().getFullYear();
            if (dateKey.startsWith(String(currentYear) + '-')) {
                displayHeader = dateKey.substring(5);
            }

            html += `<div class="history-transaction-group">`;
            html += `<div class="history-group-header">${displayHeader}</div>`;
            
            grouped[dateKey].forEach((record) => {
                const amount = record.amount || 0;
                const isExpense = record.type === 'expense' || !record.type;
                const isTransfer = record.type === 'transfer';
                
                // 獲取帳戶信息
                let accountInfo = '';
                if (record.account && typeof getAccounts === 'function') {
                    const accounts = getAccounts();
                    const account = accounts.find(a => a.id === record.account);
                    if (account) {
                        const accountIcon = account.image 
                            ? `<img src="${account.image}" alt="${account.name}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 6px; display: inline-block; vertical-align: middle; margin-right: 6px;">`
                            : '💳 ';
                        accountInfo = `<div class="history-transaction-account">${accountIcon}${account.name}</div>`;
                    }
                }
                
                // 獲取表情或分類圖標
                let iconHtml = '';
                if (record.emoji) {
                    if (record.emoji.type === 'image' && isLikelyImageSrc(record.emoji.value)) {
                        iconHtml = `<img src="${record.emoji.value}" alt="表情" class="transaction-emoji-image" style="width: 40px; height: 40px; object-fit: contain; border-radius: 8px;">`;
                    } else {
                        iconHtml = record.emoji.value;
                    }
                } else {
                    iconHtml = getCategoryIcon(record.category);
                }
                
                // 獲取成員信息
                let memberInfo = '';
                if (record.member) {
                    const members = typeof getMembers === 'function' ? getMembers() : [];
                    const member = members.find(m => m.name === record.member);
                    const memberIcon = member ? member.icon : '👤';
                    memberInfo = `<div class="history-transaction-member">${memberIcon} ${record.member}</div>`;
                }
                
                // 獲取備註圖示
                const getNoteIcon = (note) => {
                    if (!note) return '';
                    const noteIcons = {
                        '早餐': '🍳',
                        '午餐': '🍱',
                        '晚餐': '🍽️',
                        '交通': '🚗',
                        '購物': '🛒',
                        '娛樂': '🎮'
                    };
                    for (const [key, icon] of Object.entries(noteIcons)) {
                        if (note.includes(key)) {
                            return icon + ' ';
                        }
                    }
                    return '';
                };
                
                const noteIcon = getNoteIcon(record.note);
                const noteDisplay = record.note ? noteIcon + record.note : '';
                
                // 收據圖片顯示
                let receiptImageHtml = '';
                if (record.receiptImage) {
                    receiptImageHtml = `
                        <div class="history-receipt-container">
                            <img src="${record.receiptImage}" alt="收據" class="history-receipt-thumbnail" data-receipt-image="${record.receiptImage}">
                        </div>
                    `;
                }
                
                html += `
                    <div class="history-transaction-item">
                        <div class="history-transaction-icon">${iconHtml}</div>
                        <div class="history-transaction-info">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                                <div class="history-transaction-category">${record.category || '未分類'}</div>
                                <div class="history-transaction-amount ${isExpense ? 'expense' : isTransfer ? 'transfer' : 'income'}">
                                ${isTransfer ? '' : isExpense ? '-' : '+'}NT$${amount.toLocaleString('zh-TW')}
                            </div>
                        </div>
                            ${accountInfo}
                            ${memberInfo}
                            ${noteDisplay ? `<div class="history-transaction-note">${noteDisplay}</div>` : ''}
                            ${receiptImageHtml}
                        </div>
                        <button class="history-transaction-delete-btn" data-record-timestamp="${record.timestamp || ''}" data-record-date="${record.date}" data-record-amount="${record.amount}" data-record-category="${record.category || ''}" title="刪除">🗑️</button>
                    </div>
                `;
            });
            
            html += `</div>`;
        });
        
        historyList.innerHTML = html;
        
        // 綁定歷史記錄中的收據圖片點擊事件
        historyList.querySelectorAll('.history-receipt-thumbnail').forEach(img => {
            img.addEventListener('click', () => {
                const imageUrl = img.getAttribute('data-receipt-image');
                if (imageUrl) {
                    showReceiptImageModal(imageUrl);
                }
            });
        });
        
        // 綁定歷史記錄中的刪除按鈕事件
        historyList.querySelectorAll('.history-transaction-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                // 先刪除記錄
                deleteTransaction(btn);
                
                // 延遲重新渲染，確保 localStorage 已更新
                setTimeout(() => {
                    renderHistoryRecords();
                }, 100);
            });
        });
    };
    
    renderHistoryRecords();
    
    // 理財顧問按鈕
    const advisorBtn = modal.querySelector('.history-advisor-btn');
    const advisorChat = modal.querySelector('#historyAdvisorChat');
    if (advisorBtn && advisorChat) {
        // 確保初始狀態是隱藏的
        advisorChat.style.display = 'none';
        advisorChat.classList.remove('show');
        
        advisorBtn.addEventListener('click', () => {
            if (advisorChat.classList.contains('show')) {
                // 隱藏
                advisorChat.style.display = 'none';
                advisorChat.classList.remove('show');
            } else {
                // 顯示
                advisorChat.style.display = 'flex';
                advisorChat.classList.add('show');
                initAdvisorChat(records, modal);
            }
        });
    }
    
    // 關閉理財顧問
    const advisorCloseBtn = modal.querySelector('.advisor-close-btn');
    if (advisorCloseBtn && advisorChat) {
        advisorCloseBtn.addEventListener('click', () => {
            advisorChat.style.display = 'none';
            advisorChat.classList.remove('show');
        });
    }
    
    // 背景選擇按鈕
    const backgroundBtn = modal.querySelector('.history-background-btn');
    if (backgroundBtn) {
        backgroundBtn.addEventListener('click', () => {
            showHistoryBackgroundSelector(modalContent);
        });
    }
    
    // 關閉按鈕
    const closeBtn = modal.querySelector('.history-close-btn');
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
    
    // 點擊遮罩關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }
    });
}

// 顯示歷史記錄背景選擇器
function showHistoryBackgroundSelector(modalContent) {
    const backgroundModal = document.createElement('div');
    backgroundModal.className = 'history-background-selector-modal';
    backgroundModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10010; display: flex; align-items: center; justify-content: center;';
    
    const backgroundOptions = [
        { url: '', name: '無背景', isCustom: false },
        { url: 'https://i.pinimg.com/736x/f9/e7/ef/f9e7efb84d422c7ca8d2b0990a1b686d.jpg', name: '背景 1', isCustom: false },
        { url: 'https://i.pinimg.com/736x/6a/d0/99/6ad099dc3fe5ca7be5bc0db673f436fc.jpg', name: '背景 2', isCustom: false },
        { url: 'https://i.pinimg.com/736x/b0/0f/a7/b00fa7a9bdce0e1903d7db3603372ed1.jpg', name: '背景 3', isCustom: false },
        { url: 'https://i.pinimg.com/736x/2e/3f/73/2e3f7383640e209810550b998cf3f84d.jpg', name: '背景 4', isCustom: false }
    ];
    
    // 獲取自訂背景
    const customBackgrounds = JSON.parse(localStorage.getItem('customHistoryBackgrounds') || '[]');
    customBackgrounds.forEach((bg, index) => {
        backgroundOptions.push({ url: bg.url, name: bg.name || `自訂背景 ${index + 1}`, isCustom: true, id: bg.id || `custom-${index}` });
    });
    
    const savedBackground = localStorage.getItem('historyBackground') || '';
    
    // 創建隱藏的文件輸入
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    const renderBackgroundOptions = () => {
        const savedBackground = localStorage.getItem('historyBackground') || '';
        const customBackgrounds = JSON.parse(localStorage.getItem('customHistoryBackgrounds') || '[]');
        const allOptions = [
            ...backgroundOptions.filter(opt => !opt.isCustom),
            ...customBackgrounds.map((bg, index) => ({ url: bg.url, name: bg.name || `自訂背景 ${index + 1}`, isCustom: true, id: bg.id || `custom-${index}` }))
        ];
        
        return allOptions.map((option, index) => {
            const isSelected = (option.url === savedBackground) || (option.url === '' && savedBackground === '');
            return `
                <div class="background-option ${isSelected ? 'selected' : ''}" data-url="${option.url}" data-custom="${option.isCustom ? 'true' : 'false'}" data-id="${option.id || ''}" style="position: relative; cursor: pointer; border-radius: 12px; overflow: hidden; border: 3px solid ${isSelected ? 'var(--color-primary)' : 'transparent'}; transition: all 0.2s;">
                    ${option.url ? `
                        <img src="${option.url}" alt="${option.name}" style="width: 100%; height: 120px; object-fit: cover; display: block;">
                    ` : `
                        <div style="width: 100%; height: 120px; background: var(--bg-light); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 14px;">無背景</div>
                    `}
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; padding: 6px; font-size: 12px; text-align: center;">${option.name}</div>
                    ${isSelected ? '<div style="position: absolute; top: 8px; right: 8px; background: var(--color-primary); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">✓</div>' : ''}
                    ${option.isCustom ? '<button class="delete-custom-background-btn" data-id="' + (option.id || '') + '" style="position: absolute; top: 8px; left: 8px; background: rgba(255,0,0,0.8); color: white; border: none; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; z-index: 10;" title="刪除">×</button>' : ''}
                </div>
            `;
        }).join('');
    };
    
    backgroundModal.innerHTML = `
        <div class="history-background-selector-content" style="background: var(--bg-white); border-radius: 16px; padding: 24px; max-width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 20px; font-weight: 600; color: var(--text-primary);">選擇背景</h3>
                <button class="background-selector-close-btn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-tertiary); padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s;">✕</button>
            </div>
            <div style="margin-bottom: 20px;">
                <button class="upload-background-btn" style="width: 100%; padding: 12px; background: var(--color-primary); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    📷 上傳自己的圖片
                </button>
            </div>
            <div class="background-options-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px;">
                ${renderBackgroundOptions()}
            </div>
        </div>
    `;
    
    document.body.appendChild(backgroundModal);
    
    // 上傳按鈕事件
    const uploadBtn = backgroundModal.querySelector('.upload-background-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.value = '';
            openFilePickerCompat(fileInput);
        });
    }
    
    // 處理文件上傳
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            // 檢查文件大小（手機放寬限制到 20MB）
            const maxSize = 20 * 1024 * 1024; // 20MB
            if (file.size > maxSize) {
                alert(`圖片太大！請選擇小於 ${Math.round(maxSize / 1024 / 1024)}MB 的圖片。\n目前檔案大小：${Math.round(file.size / 1024 / 1024)}MB`);
                fileInput.value = '';
                return;
            }
            
            // 顯示上傳進度提示
            const progressMsg = document.createElement('div');
            progressMsg.textContent = '正在處理圖片，請稍候...';
            progressMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 15px 25px; border-radius: 8px; z-index: 10000;';
            document.body.appendChild(progressMsg);
            
            try {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    let imageData = event.target.result;
                    
                    // 壓縮圖片（針對手機優化：更小尺寸，適中品質）
                    if (typeof compressImage === 'function') {
                        try {
                            // 手機使用更激進的壓縮
                            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                            const maxWidth = isMobile ? 1280 : 1920;
                            const maxHeight = isMobile ? 720 : 1080;
                            const quality = isMobile ? 0.6 : 0.8;
                            
                            imageData = await compressImage(imageData, maxWidth, maxHeight, quality);
                            console.log('背景圖片已壓縮（手機優化）');
                        } catch (error) {
                            console.error('圖片壓縮失敗:', error);
                            // 壓縮失敗時使用原始圖片
                        }
                    }
                    
                    // 保存到自訂背景列表
                    const customBackgrounds = JSON.parse(localStorage.getItem('customHistoryBackgrounds') || '[]');
                    const newBackground = {
                        id: 'custom-' + Date.now(),
                        url: imageData,
                        name: file.name || '自訂背景',
                        date: new Date().toISOString(),
                        originalSize: file.size,
                        compressed: imageData !== event.target.result
                    };
                    customBackgrounds.push(newBackground);
                    localStorage.setItem('customHistoryBackgrounds', JSON.stringify(customBackgrounds));
                    
                    // 移除進度提示
                    document.body.removeChild(progressMsg);
                    
                    // 重新渲染背景選項
                    const grid = backgroundModal.querySelector('.background-options-grid');
                    if (grid) {
                        const savedBackground = localStorage.getItem('historyBackground') || '';
                        const allOptions = [
                            ...backgroundOptions.filter(opt => !opt.isCustom),
                            ...customBackgrounds.map((bg, index) => ({ url: bg.url, name: bg.name || `自訂背景 ${index + 1}`, isCustom: true, id: bg.id || `custom-${index}` }))
                        ];
                        grid.innerHTML = allOptions.map((option, index) => {
                            const isSelected = (option.url === savedBackground) || (option.url === '' && savedBackground === '');
                            return `
                                <div class="background-option ${isSelected ? 'selected' : ''}" data-url="${option.url}" data-custom="${option.isCustom ? 'true' : 'false'}" data-id="${option.id || ''}" style="position: relative; cursor: pointer; border-radius: 12px; overflow: hidden; border: 3px solid ${isSelected ? 'var(--color-primary)' : 'transparent'}; transition: all 0.2s;">
                                    ${option.url ? `
                                        <img src="${option.url}" alt="${option.name}" style="width: 100%; height: 120px; object-fit: cover; display: block;">
                                    ` : `
                                        <div style="width: 100%; height: 120px; background: var(--bg-light); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 14px;">無背景</div>
                                    `}
                                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; padding: 6px; font-size: 12px; text-align: center;">${option.name}</div>
                                    ${isSelected ? '<div style="position: absolute; top: 8px; right: 8px; background: var(--color-primary); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">✓</div>' : ''}
                                    ${option.isCustom ? '<button class="delete-custom-background-btn" data-id="' + (option.id || '') + '" style="position: absolute; top: 8px; left: 8px; background: rgba(255,0,0,0.8); color: white; border: none; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; z-index: 10;" title="刪除">×</button>' : ''}
                                </div>
                            `;
                        }).join('');
                        bindBackgroundEvents();
                    }

                    fileInput.value = '';
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('圖片處理失敗:', error);
                // 移除進度提示
                if (document.body.contains(progressMsg)) {
                    document.body.removeChild(progressMsg);
                }
                alert('圖片處理失敗，請重試');
                fileInput.value = '';
            }
        }
    });

    // 綁定背景選擇和刪除事件
    const bindBackgroundEvents = () => {
        // 綁定選擇事件
        backgroundModal.querySelectorAll('.background-option').forEach(option => {
            option.addEventListener('click', (e) => {
                // 如果點擊的是刪除按鈕，不觸發選擇
                if (e.target.classList.contains('delete-custom-background-btn') || e.target.closest('.delete-custom-background-btn')) {
                    return;
                }
                
                const url = option.getAttribute('data-url');
                localStorage.setItem('historyBackground', url);
                
                // 更新當前顯示的背景
                if (url) {
                    modalContent.style.backgroundImage = `url(${url})`;
                    modalContent.style.backgroundSize = 'cover';
                    modalContent.style.backgroundPosition = 'center';
                    modalContent.style.backgroundRepeat = 'no-repeat';
                    modalContent.classList.add('has-background');
                } else {
                    modalContent.style.backgroundImage = 'none';
                    modalContent.classList.remove('has-background');
                }
                
                // 關閉選擇器
                if (document.body.contains(backgroundModal)) {
                    document.body.removeChild(backgroundModal);
                }
                if (document.body.contains(fileInput)) {
                    document.body.removeChild(fileInput);
                }
            });
        });
        
        // 綁定刪除按鈕事件
        backgroundModal.querySelectorAll('.delete-custom-background-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const url = btn.closest('.background-option').getAttribute('data-url');
                
                if (confirm('確定要刪除這個自訂背景嗎？')) {
                    // 從列表中移除
                    const customBackgrounds = JSON.parse(localStorage.getItem('customHistoryBackgrounds') || '[]');
                    const filtered = customBackgrounds.filter(bg => bg.id !== id);
                    localStorage.setItem('customHistoryBackgrounds', JSON.stringify(filtered));
                    
                    // 如果刪除的是當前使用的背景，清除背景
                    const currentBackground = localStorage.getItem('historyBackground') || '';
                    if (currentBackground === url) {
                        localStorage.setItem('historyBackground', '');
                        modalContent.style.backgroundImage = 'none';
                        modalContent.classList.remove('has-background');
                    }
                    
                    // 重新渲染
                    const grid = backgroundModal.querySelector('.background-options-grid');
                    if (grid) {
                        const savedBackground = localStorage.getItem('historyBackground') || '';
                        const allOptions = [
                            ...backgroundOptions.filter(opt => !opt.isCustom),
                            ...filtered.map((bg, index) => ({ url: bg.url, name: bg.name || `自訂背景 ${index + 1}`, isCustom: true, id: bg.id || `custom-${index}` }))
                        ];
                        grid.innerHTML = allOptions.map((option, index) => {
                            const isSelected = (option.url === savedBackground) || (option.url === '' && savedBackground === '');
                            return `
                                <div class="background-option ${isSelected ? 'selected' : ''}" data-url="${option.url}" data-custom="${option.isCustom ? 'true' : 'false'}" data-id="${option.id || ''}" style="position: relative; cursor: pointer; border-radius: 12px; overflow: hidden; border: 3px solid ${isSelected ? 'var(--color-primary)' : 'transparent'}; transition: all 0.2s;">
                                    ${option.url ? `
                                        <img src="${option.url}" alt="${option.name}" style="width: 100%; height: 120px; object-fit: cover; display: block;">
                                    ` : `
                                        <div style="width: 100%; height: 120px; background: var(--bg-light); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 14px;">無背景</div>
                                    `}
                                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; padding: 6px; font-size: 12px; text-align: center;">${option.name}</div>
                                    ${isSelected ? '<div style="position: absolute; top: 8px; right: 8px; background: var(--color-primary); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">✓</div>' : ''}
                                    ${option.isCustom ? '<button class="delete-custom-background-btn" data-id="' + (option.id || '') + '" style="position: absolute; top: 8px; left: 8px; background: rgba(255,0,0,0.8); color: white; border: none; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; z-index: 10;" title="刪除">×</button>' : ''}
                                </div>
                            `;
                        }).join('');
                        bindBackgroundEvents();
                    }
                }
            });
        });
    };
    
    bindBackgroundEvents();
    
    // 關閉按鈕
    const closeBtn = backgroundModal.querySelector('.background-selector-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (document.body.contains(backgroundModal)) {
                document.body.removeChild(backgroundModal);
            }
            if (document.body.contains(fileInput)) {
                document.body.removeChild(fileInput);
            }
        });
    }
    
    // 點擊遮罩關閉
    backgroundModal.addEventListener('click', (e) => {
        if (e.target === backgroundModal) {
            if (document.body.contains(backgroundModal)) {
                document.body.removeChild(backgroundModal);
            }
            if (document.body.contains(fileInput)) {
                document.body.removeChild(fileInput);
            }
        }
    });
}

// 理財顧問相關函數已移至 js/advisor.js

// 判斷字串是否為「看起來像圖片來源」的 src
function isLikelyImageSrc(value) {
    if (typeof value !== 'string') return false;
    const v = value.trim();
    if (!v) return false;
    if (/^data:image\//i.test(v)) return true;
    if (/^blob:/i.test(v)) return true;
    if (/^https?:\/\//i.test(v)) return true;
    if (/^(?:\.\.\/|\.\/|\/)/.test(v) && /\.(?:png|jpe?g|gif|webp|svg|bmp|ico)(?:\?|#|$)/i.test(v)) return true;
    if (/\.(?:png|jpe?g|gif|webp|svg|bmp|ico)(?:\?|#|$)/i.test(v)) return true;
    return false;
}

// 刪除交易記錄
function deleteTransaction(btn) {
    // 確認刪除
    if (!confirm('確定要刪除這筆交易記錄嗎？此操作無法復原。')) {
        return;
    }
    
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    
    // 獲取記錄的識別信息
    const timestamp = btn.dataset.recordTimestamp;
    const date = btn.dataset.recordDate;
    const amount = parseFloat(btn.dataset.recordAmount);
    const category = btn.dataset.recordCategory;
    
    // 找到並刪除對應的記錄（使用多個字段匹配以確保準確性）
    const filteredRecords = records.filter(record => {
        // 如果有timestamp，優先使用timestamp匹配
        if (timestamp && record.timestamp) {
            return record.timestamp !== timestamp;
        }
        // 否則使用多個字段組合匹配
        return !(record.date === date && 
                 record.amount === amount && 
                 (record.category || '') === category);
    });
    
    // 保存更新後的記錄
    localStorage.setItem('accountingRecords', JSON.stringify(filteredRecords));
    
    // 更新顯示
    if (typeof initLedger === 'function') {
        initLedger();
    } else {
        // 如果initLedger不存在，直接更新
        const updatedRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
        if (typeof updateLedgerSummary === 'function') {
            updateLedgerSummary(updatedRecords);
        }
        if (typeof displayLedgerTransactions === 'function') {
            displayLedgerTransactions(updatedRecords);
        }
    }
    
    // 顯示成功訊息
    const successMsg = document.createElement('div');
    successMsg.textContent = '已刪除交易記錄';
    successMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.8); color: white; padding: 16px 24px; border-radius: 12px; z-index: 10001; font-size: 16px;';
    document.body.appendChild(successMsg);
    setTimeout(() => {
        if (document.body.contains(successMsg)) {
            document.body.removeChild(successMsg);
        }
    }, 1500);
}

// 獲取分類圖標（簡化版）
function getCategoryIcon(category) {
    // 檢查是否有自定義圖片圖標
    const customIcons = JSON.parse(localStorage.getItem('categoryCustomIcons') || '{}');
    const customIconValue = customIcons[category]?.value;
    if (customIcons[category] && customIcons[category].type === 'image' && isLikelyImageSrc(customIconValue)) {
        return `<img src="${customIconValue}" alt="${category}" class="transaction-emoji-image" onerror="this.outerHTML='📦'">`;
    }

    const defaultImg = getDefaultCategoryImage(category);
    if (defaultImg) {
        return `<img src="${defaultImg}" alt="${category}" class="transaction-emoji-image" onerror="this.outerHTML='📦'">`;
    }
    
    // 查找分類的默認圖標
    const categoryData = allCategories.find(cat => cat.name === category);
    if (categoryData) {
        return categoryData.icon;
    }
    
    const iconMap = {
        '飲食': '🍔',
        '交通': '🚇',
        '娛樂': '🎮',
        '醫療': '🏥',
        '卡費': '💳',
        '投資': '📈'
    };
    return iconMap[category] || '📦';
}

// 圖表實例
let pieChartInstance = null;
let barChartInstance = null;
let monthCompareChartInstance = null;
let lineChartInstance = null;
let stockTradeChartSellInstance = null;
let stockTradeChartDivInstance = null;
let stockPnlChartInstance = null;
let stockAllocationChartInstance = null;
let stockSectorChartInstance = null;
let stockCurrencyChartInstance = null;
let chartTabInited = false;

// 提供理財建議
function provideFinancialAdvice(records) {
    const selectedBase = parseMonthKey(getSelectedMonthKey()) || new Date();
    const now = new Date(selectedBase.getFullYear(), selectedBase.getMonth(), 1);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyRecords = records.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
    
    const expenses = monthlyRecords.filter(r => r.type === 'expense' || !r.type);
    const incomes = monthlyRecords.filter(r => r.type === 'income');
    
    const totalExpense = expenses.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalIncome = incomes.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    let response = `💡 理財建議：\n\n`;
    
    if (totalIncome > 0) {
        const savingsRate = ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1);
        if (savingsRate > 20) {
            response += `✅ 您的儲蓄率為 ${savingsRate}%，表現優秀！\n`;
        } else if (savingsRate > 0) {
            response += `⚠️ 您的儲蓄率為 ${savingsRate}%，建議提高到 20% 以上。\n`;
        } else {
            response += `❌ 本月出現超支，建議檢視支出項目，找出可以節省的地方。\n`;
        }
    }
    
    // 分類建議
    const categoryStats = {};
    expenses.forEach(r => {
        const category = r.category || '未分類';
        categoryStats[category] = (categoryStats[category] || 0) + (r.amount || 0);
    });
    
    const topCategory = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0];
    if (topCategory && topCategory[1] > totalExpense * 0.3) {
        response += `\n📌 注意：「${topCategory[0]}」佔總支出 ${((topCategory[1] / totalExpense) * 100).toFixed(1)}%，建議檢視是否有優化空間。\n`;
    }
    
    response += `\n💪 理財小貼士：\n`;
    response += `• 記帳是理財的第一步，持續記錄很重要\n`;
    response += `• 建議設定預算，控制各分類支出\n`;
    response += `• 定期檢視支出趨勢，找出不必要的開銷\n`;
    response += `• 建立緊急預備金，至少 3-6 個月的生活費\n`;
    
    return response;
}

// 分析分類
function analyzeCategories(records) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyExpenses = records.filter(r => {
        const recordDate = new Date(r.date);
        return (r.type === 'expense' || !r.type) && 
               recordDate.getMonth() === currentMonth && 
               recordDate.getFullYear() === currentYear;
    });
    
    const categoryStats = {};
    monthlyExpenses.forEach(r => {
        const category = r.category || '未分類';
        categoryStats[category] = (categoryStats[category] || 0) + (r.amount || 0);
    });
    
    const total = monthlyExpenses.reduce((sum, r) => sum + (r.amount || 0), 0);
    const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
    
    let response = `📂 支出分類分析：\n\n`;
    sortedCategories.forEach(([cat, amount], index) => {
        const percentage = ((amount / total) * 100).toFixed(1);
        response += `${index + 1}. ${cat}：NT$ ${amount.toLocaleString('zh-TW')} (${percentage}%)\n`;
    });
    
    return response;
}

// 分析趨勢
function analyzeTrends(records) {
    const now = new Date();
    const monthlyData = {};
    
    // 統計最近 6 個月的支出
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = 0;
    }
    
    records.forEach(r => {
        if (r.type === 'expense' || !r.type) {
            const recordDate = new Date(r.date);
            const monthKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyData.hasOwnProperty(monthKey)) {
                monthlyData[monthKey] += (r.amount || 0);
            }
        }
    });
    
    const values = Object.values(monthlyData);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const trend = values[values.length - 1] > values[values.length - 2] ? '上升' : '下降';
    
    let response = `📈 支出趨勢分析（最近 6 個月）：\n\n`;
    response += `• 平均月支出：NT$ ${Math.round(avg).toLocaleString('zh-TW')}\n`;
    response += `• 最新趨勢：${trend}\n`;
    
    return response;
}

// 分析預算
function analyzeBudget(records) {
    // 獲取預算設定
    const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
    
    if (budgets.length === 0) {
        return `📋 您還沒有設定預算。\n\n建議為主要支出分類設定預算，這樣可以更好地控制支出。\n\n可以在「設置」中設定預算。`;
    }
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyExpenses = records.filter(r => {
        const recordDate = new Date(r.date);
        return (r.type === 'expense' || !r.type) && 
               recordDate.getMonth() === currentMonth && 
               recordDate.getFullYear() === currentYear;
    });
    
    let response = `📋 預算執行情況：\n\n`;
    
    budgets.forEach(budget => {
        const categoryExpenses = monthlyExpenses
            .filter(r => (r.category || '未分類') === budget.category)
            .reduce((sum, r) => sum + (r.amount || 0), 0);
        
        const percentage = (categoryExpenses / budget.amount * 100).toFixed(1);
        const status = percentage > 100 ? '❌ 超支' : percentage > 80 ? '⚠️ 接近' : '✅ 正常';
        
        response += `${budget.category}：\n`;
        response += `• 預算：NT$ ${budget.amount.toLocaleString('zh-TW')}\n`;
        response += `• 已用：NT$ ${categoryExpenses.toLocaleString('zh-TW')} (${percentage}%)\n`;
        response += `• 狀態：${status}\n\n`;
    });
    
    return response;
}

// 查詢特定日期的記錄
function queryDateRecords(userMessage, records) {
    // 解析日期
    const datePatterns = [
        /(\d{1,2})\s*[月\/\-]\s*(\d{1,2})/g,  // 例如：12月5號、12/5、12-5
        /(\d{1,2})\s*號/g,  // 例如：5號
        /(\d{4})\s*[年\/\-]\s*(\d{1,2})\s*[月\/\-]\s*(\d{1,2})/g,  // 例如：2024年12月5日
        /今天|今日/g,
        /昨天|昨日/g,
        /前天/g,
        /(\d+)\s*天前/g
    ];
    
    let targetDate = null;
    const now = new Date();
    
    // 嘗試匹配各種日期格式
    for (const pattern of datePatterns) {
        const match = userMessage.match(pattern);
        if (match) {
            const matchStr = match[0];
            
            if (matchStr.includes('今天') || matchStr.includes('今日')) {
                targetDate = new Date(now);
            } else if (matchStr.includes('昨天') || matchStr.includes('昨日')) {
                targetDate = new Date(now);
                targetDate.setDate(targetDate.getDate() - 1);
            } else if (matchStr.includes('前天')) {
                targetDate = new Date(now);
                targetDate.setDate(targetDate.getDate() - 2);
            } else if (matchStr.includes('天前')) {
                const daysAgo = parseInt(matchStr.match(/(\d+)/)[1]);
                targetDate = new Date(now);
                targetDate.setDate(targetDate.getDate() - daysAgo);
            } else {
                // 解析月日格式
                const numbers = matchStr.match(/\d+/g);
                if (numbers && numbers.length >= 2) {
                    const month = parseInt(numbers[0]);
                    const day = parseInt(numbers[1]);
                    targetDate = new Date(now.getFullYear(), month - 1, day);
                } else if (numbers && numbers.length === 1) {
                    // 只有日期，使用當前月份
                    const day = parseInt(numbers[0]);
                    targetDate = new Date(now.getFullYear(), now.getMonth(), day);
                }
            }
            
            if (targetDate) break;
        }
    }
    
    // 如果沒有找到日期，嘗試查找最近的記錄
    if (!targetDate) {
        // 如果用戶問「買了什麼」但沒有指定日期，返回最近的記錄
        if (userMessage.includes('買了什麼') || userMessage.includes('花了什麼')) {
            // 返回最近幾筆記錄
            const recentRecords = records
                .filter(r => r.type === 'expense' || !r.type)
                .sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateB - dateA;
                })
                .slice(0, 10);
            
            if (recentRecords.length === 0) {
                return '📋 您最近沒有支出記錄。';
            }
            
            let response = '📋 您最近的支出記錄：\n\n';
            recentRecords.forEach((record, index) => {
                const date = new Date(record.date);
                const dateStr = `${date.getMonth() + 1}月${date.getDate()}號`;
                const amount = record.amount || 0;
                const category = record.category || '未分類';
                response += `${index + 1}. ${dateStr} - ${category}：NT$ ${amount.toLocaleString('zh-TW')}\n`;
            });
            
            return response;
        }
        
        return '📅 我沒有在您的問題中找到具體日期。\n\n您可以這樣問我：\n• "12月5號買了什麼"\n• "昨天花了什麼"\n• "查一下今天買了什麼"\n• "幾月幾號買了什麼東西"';
    }
    
    // 格式化日期用於比較
    const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    
    // 查找該日期的記錄
    const dateRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        const recordDateStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
        return recordDateStr === targetDateStr;
    });
    
    if (dateRecords.length === 0) {
        const dateStr = `${targetDate.getMonth() + 1}月${targetDate.getDate()}號`;
        return `📅 ${dateStr} 沒有找到任何記錄。\n\n您可以查看其他日期的記錄，或者告訴我您想查詢的具體日期。`;
    }
    
    // 分類統計
    const expenses = dateRecords.filter(r => r.type === 'expense' || !r.type);
    const incomes = dateRecords.filter(r => r.type === 'income');
    const transfers = dateRecords.filter(r => r.type === 'transfer');
    
    const dateStr = `${targetDate.getMonth() + 1}月${targetDate.getDate()}號`;
    let response = `📅 ${dateStr} 的記錄：\n\n`;
    
    if (expenses.length > 0) {
        const totalExpense = expenses.reduce((sum, r) => sum + (r.amount || 0), 0);
        response += `📤 支出 (${expenses.length} 筆，共 NT$ ${totalExpense.toLocaleString('zh-TW')})：\n`;
        expenses.forEach((record, index) => {
            const category = record.category || '未分類';
            const amount = record.amount || 0;
            const account = record.account && typeof getAccounts === 'function' ? getAccounts().find(a => a.id === record.account)?.name : '';
            const member = record.member || '';
            const note = record.note ? ` (${record.note})` : '';
            response += `${index + 1}. ${category}：NT$ ${amount.toLocaleString('zh-TW')}`;
            if (account) response += ` [${account}]`;
            if (member) response += ` [${member}]`;
            if (note) response += note;
            response += '\n';
        });
        response += '\n';
    }
    
    if (incomes.length > 0) {
        const totalIncome = incomes.reduce((sum, r) => sum + (r.amount || 0), 0);
        response += `💰 收入 (${incomes.length} 筆，共 NT$ ${totalIncome.toLocaleString('zh-TW')})：\n`;
        incomes.forEach((record, index) => {
            const category = record.category || '未分類';
            const amount = record.amount || 0;
            const account = record.account && typeof getAccounts === 'function' ? getAccounts().find(a => a.id === record.account)?.name : '';
            response += `${index + 1}. ${category}：NT$ ${amount.toLocaleString('zh-TW')}`;
            if (account) response += ` [${account}]`;
            response += '\n';
        });
        response += '\n';
    }
    
    if (transfers.length > 0) {
        response += `🔄 轉帳 (${transfers.length} 筆)：\n`;
        transfers.forEach((record, index) => {
            const amount = record.amount || 0;
            const account = record.account && typeof getAccounts === 'function' ? getAccounts().find(a => a.id === record.account)?.name : '';
            response += `${index + 1}. NT$ ${amount.toLocaleString('zh-TW')}`;
            if (account) response += ` [${account}]`;
            response += '\n';
        });
    }
    
    return response;
}

// 查詢特定金額和分類的記錄
function queryAmountAndCategory(userMessage, records) {
    // 提取金額
    const amountMatches = userMessage.match(/(\d+)/g);
    if (!amountMatches || amountMatches.length === 0) {
        return '💰 我沒有在您的問題中找到金額。\n\n您可以這樣問我：\n• "我什麼時候買午餐花了170"\n• "哪天買了東西花了500"';
    }
    
    // 取第一個數字作為金額（通常是最後提到的金額）
    const targetAmount = parseFloat(amountMatches[amountMatches.length - 1]);
    
    if (isNaN(targetAmount) || targetAmount <= 0) {
        return '💰 我無法識別您提到的金額。\n\n請告訴我具體的金額，例如："我什麼時候買午餐花了170"';
    }
    
    // 提取分類關鍵詞
    const categoryKeywords = [
        '午餐', '早餐', '晚餐', '宵夜', '食物', '餐', '飯',
        '交通', '車', '公車', '捷運', '計程車', '油錢',
        '購物', '買', '衣服', '鞋子', '用品',
        '娛樂', '電影', '遊戲', '唱歌',
        '醫療', '看病', '藥',
        '房租', '水電', '電費', '水費', '網路',
        '其他'
    ];
    
    let targetCategory = null;
    for (const keyword of categoryKeywords) {
        if (userMessage.includes(keyword)) {
            targetCategory = keyword;
            break;
        }
    }
    
    // 如果沒有找到分類關鍵詞，嘗試從記錄中匹配分類名稱
    if (!targetCategory) {
        const allCategories = [...new Set(records.map(r => r.category).filter(c => c))];
        for (const cat of allCategories) {
            if (userMessage.includes(cat)) {
                targetCategory = cat;
                break;
            }
        }
    }
    
    // 過濾記錄：匹配金額和分類（如果指定了分類）
    let matchedRecords = records.filter(record => {
        const recordAmount = record.amount || 0;
        // 允許金額有小的誤差（±1元）
        const amountMatch = Math.abs(recordAmount - targetAmount) <= 1;
        
        if (!amountMatch) return false;
        
        // 如果是支出記錄
        if (record.type === 'expense' || !record.type) {
            // 如果指定了分類，檢查分類是否匹配
            if (targetCategory) {
                const recordCategory = record.category || '未分類';
                return recordCategory.includes(targetCategory) || targetCategory.includes(recordCategory);
            }
            // 如果沒有指定分類，只匹配金額
            return true;
        }
        
        return false;
    });
    
    // 如果沒有找到完全匹配的，嘗試只匹配金額
    if (matchedRecords.length === 0 && targetCategory) {
        matchedRecords = records.filter(record => {
            const recordAmount = record.amount || 0;
            const amountMatch = Math.abs(recordAmount - targetAmount) <= 1;
            return amountMatch && (record.type === 'expense' || !record.type);
        });
    }
    
    if (matchedRecords.length === 0) {
        let response = `🔍 沒有找到符合條件的記錄。\n\n`;
        if (targetCategory) {
            response += `搜尋條件：\n• 分類：${targetCategory}\n• 金額：NT$ ${targetAmount.toLocaleString('zh-TW')}\n\n`;
        } else {
            response += `搜尋條件：\n• 金額：NT$ ${targetAmount.toLocaleString('zh-TW')}\n\n`;
        }
        response += `💡 提示：\n• 確認金額是否正確\n• 確認分類名稱是否匹配\n• 可以只問金額，例如："什麼時候花了170"`;
        return response;
    }
    
    // 按日期排序（最新的在前）
    matchedRecords.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });
    
    let response = `🔍 找到 ${matchedRecords.length} 筆符合條件的記錄：\n\n`;
    
    matchedRecords.forEach((record, index) => {
        const date = new Date(record.date);
        const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}號`;
        const category = record.category || '未分類';
        const amount = record.amount || 0;
        const account = record.account && typeof getAccounts === 'function' ? getAccounts().find(a => a.id === record.account)?.name : '';
        const member = record.member || '';
        const note = record.note ? ` (${record.note})` : '';
        
        response += `${index + 1}. ${dateStr} - ${category}：NT$ ${amount.toLocaleString('zh-TW')}`;
        if (account) response += ` [${account}]`;
        if (member) response += ` [${member}]`;
        if (note) response += note;
        response += '\n';
    });
    
    if (matchedRecords.length === 1) {
        const record = matchedRecords[0];
        const date = new Date(record.date);
        const dateStr = `${date.getMonth() + 1}月${date.getDate()}號`;
        response += `\n✅ 答案是：${dateStr}`;
    } else {
        response += `\n💡 找到多筆記錄，請查看上面的詳細列表。`;
    }
    
    return response;
}

// 查詢特定金額買了什麼（例如：1500是買了什麼）
function queryAmountOnly(userMessage, records, targetAmount) {
    // 過濾記錄：匹配金額
    const matchedRecords = records.filter(record => {
        const recordAmount = record.amount || 0;
        // 允許金額有小的誤差（±1元）
        const amountMatch = Math.abs(recordAmount - targetAmount) <= 1;
        return amountMatch && (record.type === 'expense' || !record.type);
    });
    
    if (matchedRecords.length === 0) {
        return `🔍 沒有找到金額為 NT$ ${targetAmount.toLocaleString('zh-TW')} 的支出記錄。\n\n💡 提示：\n• 確認金額是否正確\n• 可能該金額的記錄還沒有記錄`;
    }
    
    // 按日期排序（最新的在前）
    matchedRecords.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });
    
    let response = `💰 金額 NT$ ${targetAmount.toLocaleString('zh-TW')} 的支出記錄：\n\n`;
    
    matchedRecords.forEach((record, index) => {
        const date = new Date(record.date);
        const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}號`;
        const category = record.category || '未分類';
        const amount = record.amount || 0;
        const account = record.account && typeof getAccounts === 'function' ? getAccounts().find(a => a.id === record.account)?.name : '';
        const member = record.member || '';
        const note = record.note ? ` (${record.note})` : '';
        
        response += `${index + 1}. ${dateStr} - ${category}：NT$ ${amount.toLocaleString('zh-TW')}`;
        if (account) response += ` [${account}]`;
        if (member) response += ` [${member}]`;
        if (note) response += note;
        response += '\n';
    });
    
    if (matchedRecords.length === 1) {
        const record = matchedRecords[0];
        const date = new Date(record.date);
        const dateStr = `${date.getMonth() + 1}月${date.getDate()}號`;
        const category = record.category || '未分類';
        response += `\n✅ 答案是：${dateStr} 買了 ${category}`;
    }
    
    return response;
}

// 查詢特定日期和金額的記錄（例如：12/7買了1500的東西）
function queryDateAndAmount(userMessage, records, dateMatch, targetAmount) {
    // 解析日期
    const month = parseInt(dateMatch[1]);
    const day = parseInt(dateMatch[2]);
    const now = new Date();
    
    // 如果月份大於12，可能是 日/月 格式
    let targetDate;
    if (month > 12 && day <= 12) {
        targetDate = new Date(now.getFullYear(), day - 1, month);
    } else {
        targetDate = new Date(now.getFullYear(), month - 1, day);
    }
    
    // 格式化日期用於比較
    const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    
    // 查找該日期且金額匹配的記錄
    const matchedRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        const recordDateStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
        const recordAmount = record.amount || 0;
        const amountMatch = Math.abs(recordAmount - targetAmount) <= 1;
        return recordDateStr === targetDateStr && amountMatch && (record.type === 'expense' || !record.type);
    });
    
    const dateStr = `${targetDate.getMonth() + 1}月${targetDate.getDate()}號`;
    
    if (matchedRecords.length === 0) {
        return `🔍 ${dateStr} 沒有找到金額為 NT$ ${targetAmount.toLocaleString('zh-TW')} 的支出記錄。\n\n💡 提示：\n• 確認日期是否正確\n• 確認金額是否正確`;
    }
    
    let response = `📅 ${dateStr} 金額 NT$ ${targetAmount.toLocaleString('zh-TW')} 的記錄：\n\n`;
    
    matchedRecords.forEach((record, index) => {
        const category = record.category || '未分類';
        const amount = record.amount || 0;
        const account = record.account && typeof getAccounts === 'function' ? getAccounts().find(a => a.id === record.account)?.name : '';
        const member = record.member || '';
        const note = record.note ? ` (${record.note})` : '';
        
        response += `${index + 1}. ${category}：NT$ ${amount.toLocaleString('zh-TW')}`;
        if (account) response += ` [${account}]`;
        if (member) response += ` [${member}]`;
        if (note) response += note;
        response += '\n';
    });
    
    if (matchedRecords.length === 1) {
        const record = matchedRecords[0];
        const category = record.category || '未分類';
        response += `\n✅ 答案是：${category}`;
    }
    
    return response;
}

// 一般回應
function getGeneralResponse(userMessage, records) {
    const responses = [
        '我理解您的問題。讓我為您分析一下記帳數據...',
        '這是個好問題！根據您的記帳記錄...',
        '讓我查看一下您的財務狀況...',
        '根據您的記帳習慣，我建議...'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + '\n\n您可以問我關於支出、收入、分類、趨勢、預算等問題，或者查詢特定日期的記錄（例如："12月5號買了什麼"），我會根據您的記帳數據提供分析。';
}

// 刪除交易記錄
function deleteTransaction(btn) {
    // 確認刪除
    if (!confirm('確定要刪除這筆交易記錄嗎？此操作無法復原。')) {
        return;
    }
    
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    
    // 獲取記錄的識別信息
    const timestamp = btn.dataset.recordTimestamp;
    const date = btn.dataset.recordDate;
    const amount = parseFloat(btn.dataset.recordAmount);
    const category = btn.dataset.recordCategory;
    
    // 找到並刪除對應的記錄（使用多個字段匹配以確保準確性）
    const filteredRecords = records.filter(record => {
        // 如果有timestamp，優先使用timestamp匹配
        if (timestamp && record.timestamp) {
            return record.timestamp !== timestamp;
        }
        // 否則使用多個字段組合匹配
        return !(record.date === date && 
                 record.amount === amount && 
                 (record.category || '') === category);
    });
    
    // 保存更新後的記錄
    localStorage.setItem('accountingRecords', JSON.stringify(filteredRecords));
    
    // 更新顯示
    if (typeof initLedger === 'function') {
        initLedger();
    } else {
        // 如果initLedger不存在，直接更新
        const updatedRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
        if (typeof updateLedgerSummary === 'function') {
            updateLedgerSummary(updatedRecords);
        }
        if (typeof displayLedgerTransactions === 'function') {
            displayLedgerTransactions(updatedRecords);
        }
    }
    
    // 顯示成功訊息
    const successMsg = document.createElement('div');
    successMsg.textContent = '已刪除交易記錄';
    successMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.8); color: white; padding: 16px 24px; border-radius: 12px; z-index: 10001; font-size: 16px;';
    document.body.appendChild(successMsg);
    setTimeout(() => {
        if (document.body.contains(successMsg)) {
            document.body.removeChild(successMsg);
        }
    }, 1500);
}

 // 獲取分類圖標（簡化版）
function getCategoryIcon(category) {
    // 檢查是否有自定義圖片圖標
    const customIcons = JSON.parse(localStorage.getItem('categoryCustomIcons') || '{}');
    const customIconValue = customIcons[category]?.value;
    if (customIcons[category] && customIcons[category].type === 'image' && isLikelyImageSrc(customIconValue)) {
        return `<img src="${customIconValue}" alt="${category}" class="transaction-emoji-image">`;
    }
    
    // 查找分類的默認圖標
    const categoryData = allCategories.find(cat => cat.name === category);
    if (categoryData) {
        return categoryData.icon;
    }
    
    const iconMap = {
        '飲食': '🍔',
        '交通': '🚇',
        '娛樂': '🎮',
        '醫療': '🏥',
        '卡費': '💳',
        '投資': '📈'
    };
    return iconMap[category] || '📦';
}

 // 初始化圖表頁面
function initChart() {
    setupChartTabs();
    // 初始化所有圖表
    updateAllCharts();
}

function setupChartTabs() {
    if (chartTabInited) return;
    const tabExpense = document.getElementById('chartTabExpense');
    const tabInvestment = document.getElementById('chartTabInvestment');
    const pageExpense = document.getElementById('chartExpensePage');
    const pageInvestment = document.getElementById('chartInvestmentPage');
    if (!tabExpense || !tabInvestment || !pageExpense || !pageInvestment) return;

    const activate = (target) => {
        const showExpense = target === 'expense';
        tabExpense.classList.toggle('active', showExpense);
        tabInvestment.classList.toggle('active', !showExpense);
        pageExpense.classList.toggle('chart-page--active', showExpense);
        pageInvestment.classList.toggle('chart-page--active', !showExpense);
        // 重繪圖表避免尺寸錯誤
        if (typeof updateAllCharts === 'function') {
            setTimeout(() => updateAllCharts(), 30);
        }
    };

    tabExpense.addEventListener('click', () => activate('expense'));
    tabInvestment.addEventListener('click', () => activate('investment'));
    activate('expense');
    chartTabInited = true;
}

 // 更新所有圖表
function updateAllCharts() {
    updatePieChart();    // 圓餅圖：本月支出結構
    updateBarChart();    // 長條圖：各分類支出
    updateMonthCompareChart(); // 長條圖：上月 vs 本月分類比較
    updateLineChart();   // 折線圖：每月總支出趨勢
    updateStockAllocationChart(); // 股票持倉分佈
    updateStockPnlChart(); // 股票持倉盈虧
    updateStockTradeChart(); // 股票交易分析
}

function updateMonthCompareChart() {
    const canvas = document.getElementById('monthCompareChart');
    if (!canvas) return;

    const insightEl = document.getElementById('monthCompareInsight');
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const thisMonthKey = getSelectedMonthKey();
    const lastMonthKey = addMonthsToKey(thisMonthKey, -1);

    const isExpense = (r) => r && (r.type === 'expense' || !r.type);
    const monthKeyOf = (dateStr) => {
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return null;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };

    const sumByCategory = (monthKey) => {
        const map = {};
        records.forEach(r => {
            if (!isExpense(r)) return;
            if (monthKeyOf(r.date) !== monthKey) return;
            const cat = r.category || '未分類';
            map[cat] = (map[cat] || 0) + (r.amount || 0);
        });
        return map;
    };

    const thisMap = sumByCategory(thisMonthKey);
    const lastMap = sumByCategory(lastMonthKey);
    const categories = Array.from(new Set([...Object.keys(thisMap), ...Object.keys(lastMap)]));

    if (categories.length === 0) {
        if (monthCompareChartInstance) {
            monthCompareChartInstance.destroy();
            monthCompareChartInstance = null;
        }
        if (insightEl) insightEl.textContent = '';
        return;
    }

    // 依「本月」金額排序，取前 10 類
    const ranked = categories
        .map(c => ({
            category: c,
            thisAmount: thisMap[c] || 0,
            lastAmount: lastMap[c] || 0,
            diff: (thisMap[c] || 0) - (lastMap[c] || 0)
        }))
        .sort((a, b) => b.thisAmount - a.thisAmount)
        .slice(0, 10);

    // 文案：找出差異最大的分類
    const diffTop = [...ranked].sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))[0];
    if (insightEl && diffTop) {
        const diffAbs = Math.abs(diffTop.diff);
        if (diffAbs === 0) {
            insightEl.textContent = `本月與上月差異不大（前 ${ranked.length} 類）`;
        } else {
            const direction = diffTop.diff > 0 ? '多' : '少';
            insightEl.textContent = `本月${diffTop.category}比上月${direction} NT$${diffAbs.toLocaleString('zh-TW')}`;
        }
    }

    const labels = ranked.map(r => r.category);
    const lastValues = ranked.map(r => r.lastAmount);
    const thisValues = ranked.map(r => r.thisAmount);

    if (monthCompareChartInstance) {
        monthCompareChartInstance.destroy();
    }

    const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#ff69b4';
    const primaryLight = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-rgba-20').trim() || 'rgba(255, 105, 180, 0.25)';
    const borderLight = getComputedStyle(document.documentElement).getPropertyValue('--border-light').trim() || '#f0f0f0';
    const textSecondary = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#666';

    monthCompareChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: '上月',
                    data: lastValues,
                    backgroundColor: primaryLight,
                    borderColor: borderLight,
                    borderWidth: 1,
                    borderRadius: 8,
                    barThickness: 12
                },
                {
                    label: '本月',
                    data: thisValues,
                    backgroundColor: primary,
                    borderColor: primary,
                    borderWidth: 1,
                    borderRadius: 8,
                    barThickness: 12
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: textSecondary,
                        boxWidth: 12,
                        boxHeight: 12
                    }
                },
                tooltip: {
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-white').trim() || 'var(--bg-white)',
                    titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#333',
                    bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#333',
                    borderColor: borderLight,
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: NT$${context.parsed.x.toLocaleString('zh-TW')}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: textSecondary,
                        callback: function(value) {
                            return 'NT$' + value.toLocaleString('zh-TW');
                        }
                    },
                    grid: {
                        color: borderLight
                    }
                },
                y: {
                    ticks: {
                        color: textSecondary
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// 圓餅圖：本月支出結構
function updatePieChart() {
    const palette = getThemeChartPalette();
    const canvas = document.getElementById('pieChart');
    if (!canvas) return;

    const insightEl = document.getElementById('pieChartInsight');
    
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const currentMonth = getSelectedMonthKey();
    
    // 過濾本月支出記錄
    const monthRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
        return recordMonth === currentMonth && record.type === 'expense';
    });
    
    if (monthRecords.length === 0) {
        if (pieChartInstance) {
            pieChartInstance.destroy();
            pieChartInstance = null;
        }
        if (insightEl) insightEl.textContent = '';
        return;
    }
    
    // 按分類統計
    const data = getChartData(monthRecords, 'category');
    if (data.labels.length === 0) {
        if (pieChartInstance) {
            pieChartInstance.destroy();
            pieChartInstance = null;
        }
        if (insightEl) insightEl.textContent = '';
        return;
    }

    // 一句人話：最大支出分類占比
    if (insightEl) {
        const total = data.values.reduce((a, b) => a + b, 0);
        const topLabel = data.labels[0];
        const topValue = data.values[0] || 0;
        const pct = total > 0 ? ((topValue / total) * 100).toFixed(0) : '0';
        insightEl.textContent = `本月花最多在「${topLabel}」，佔本月支出約 ${pct}%（NT$${topValue.toLocaleString('zh-TW')}）`;
    }
    
    const colors = generateColors(data.labels.length, palette);
    
    if (pieChartInstance) {
        pieChartInstance.destroy();
    }
    
    pieChartInstance = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: colors.backgrounds,
                borderColor: colors.borders,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-white').trim() || 'var(--bg-white)',
                    titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#333',
                    bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#333',
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-light').trim() || '#f0f0f0',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: NT$${value.toLocaleString('zh-TW')} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 長條圖：各分類支出
function updateBarChart() {
    const palette = getThemeChartPalette();
    const canvas = document.getElementById('barChart');
    if (!canvas) return;

    const insightEl = document.getElementById('barChartInsight');
    
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const currentMonth = getSelectedMonthKey();
    
    // 過濾本月支出記錄
    const monthRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
        return recordMonth === currentMonth && record.type === 'expense';
    });
    
    if (monthRecords.length === 0) {
        if (barChartInstance) {
            barChartInstance.destroy();
            barChartInstance = null;
        }
        if (insightEl) insightEl.textContent = '';
        return;
    }
    
    // 按分類統計
    const data = getChartData(monthRecords, 'category');
    if (data.labels.length === 0) {
        if (barChartInstance) {
            barChartInstance.destroy();
            barChartInstance = null;
        }
        if (insightEl) insightEl.textContent = '';
        return;
    }

    // 一句人話：本月最高支出分類
    if (insightEl) {
        const topLabel = data.labels[0];
        const topValue = data.values[0] || 0;
        insightEl.textContent = `本月最高支出分類是「${topLabel}」，共 NT$${topValue.toLocaleString('zh-TW')}`;
    }
    
    // 只顯示前10個分類（按金額排序）
    const topData = {
        labels: data.labels.slice(0, 10),
        values: data.values.slice(0, 10)
    };
    
    const colors = generateColors(topData.labels.length, palette);
    
    if (barChartInstance) {
        barChartInstance.destroy();
    }
    
    barChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: topData.labels,
            datasets: [{
                label: '支出金額',
                data: topData.values,
                backgroundColor: colors.backgrounds,
                borderColor: colors.borders,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-white').trim() || 'var(--bg-white)',
                    titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#333',
                    bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#333',
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-light').trim() || '#f0f0f0',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `NT$${context.parsed.y.toLocaleString('zh-TW')}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: palette.textSecondary
                    },
                    grid: {
                        color: palette.border
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: palette.textSecondary,
                        callback: function(value) {
                            return 'NT$' + value.toLocaleString('zh-TW');
                        }
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-light').trim() || '#f0f0f0'
                    }
                }
            }
        }
    });
}

// 折線圖：每月總支出趨勢
function updateLineChart() {
    const palette = getThemeChartPalette();
    const canvas = document.getElementById('lineChart');
    if (!canvas) return;

    const insightEl = document.getElementById('lineChartInsight');
    
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    
    // 過濾支出記錄
    const expenseRecords = records.filter(record => record.type === 'expense');
    
    if (expenseRecords.length === 0) {
        if (lineChartInstance) {
            lineChartInstance.destroy();
            lineChartInstance = null;
        }
        if (insightEl) insightEl.textContent = '';
        return;
    }
    
    // 按月份統計（最近12個月）
    const monthlyData = {};
    const now = new Date();
    
    // 初始化最近12個月
    for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = 0;
    }
    
    // 統計每月支出
    expenseRecords.forEach(record => {
        const recordDate = new Date(record.date);
        const monthKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData.hasOwnProperty(monthKey)) {
            monthlyData[monthKey] += record.amount || 0;
        }
    });
    
    const labels = Object.keys(monthlyData);
    const values = Object.values(monthlyData);

    // 一句人話：本月 vs 上月總支出變化（用 labels 最後兩個月）
    if (insightEl && labels.length >= 2) {
        const last = values[values.length - 1] || 0;
        const prev = values[values.length - 2] || 0;
        const diff = last - prev;
        const diffAbs = Math.abs(diff);
        if (diffAbs === 0) {
            insightEl.textContent = `本月總支出與上月差不多（NT$${last.toLocaleString('zh-TW')}）`;
        } else {
            const dir = diff > 0 ? '多' : '少';
            insightEl.textContent = `本月總支出比上月${dir} NT$${diffAbs.toLocaleString('zh-TW')}（本月 NT$${last.toLocaleString('zh-TW')}）`;
        }
    } else if (insightEl) {
        insightEl.textContent = '';
    }
    
    if (lineChartInstance) {
        lineChartInstance.destroy();
    }
    
    lineChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '總支出',
                data: values,
                borderColor: palette.primary,
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-primary-rgba-10').trim() || 'rgba(255, 105, 180, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `NT$${context.parsed.y.toLocaleString('zh-TW')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'NT$' + value.toLocaleString('zh-TW');
                        }
                    }
                }
            }
        }
    });
}

// 獲取圖表數據
function getChartData(records, dimension) {
    const dataMap = {};
    let total = 0;
    
    records.forEach(record => {
        let key = '';
        
        if (dimension === 'category') {
            key = record.category || '未分類';
        } else if (dimension === 'account') {
            if (record.account && typeof getAccounts === 'function') {
                const accounts = getAccounts();
                const account = accounts.find(a => a.id === record.account);
                key = account ? account.name : '未指定帳戶';
            } else {
                key = '未指定帳戶';
            }
        } else if (dimension === 'member') {
            // 使用成員欄位，如果沒有則顯示「未指定成員」
            key = record.member || '未指定成員';
        }
        
        if (!dataMap[key]) {
            dataMap[key] = 0;
        }
        dataMap[key] += record.amount || 0;
        total += record.amount || 0;
    });
    
    // 轉換為數組並排序
    const entries = Object.entries(dataMap)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);
    
    return {
        labels: entries.map(e => e.label),
        values: entries.map(e => e.value),
        total: total
    };
}

// 生成顏色（會依主題色或自訂顏色）
function generateColors(count, palette) {
    // 檢查是否有自訂圖表顏色
    const customTheme = getCustomTheme();
    let baseColors = [];
    
    if (customTheme.chartColors && customTheme.chartColors.length > 0) {
        // 使用自訂顏色
        baseColors = customTheme.chartColors.map(color => {
            // 將 hex 顏色轉換為 rgba
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            return {
                bg: `rgba(${r}, ${g}, ${b}, 0.8)`,
                border: `rgba(${r}, ${g}, ${b}, 1)`
            };
        });
        
        // 如果自訂顏色不夠，重複使用
        while (baseColors.length < count) {
            baseColors = baseColors.concat(baseColors);
        }
    } else {
        // 根據當前主題生成顏色
        const root = document.documentElement;
        const primaryColor = palette?.primary || getComputedStyle(root).getPropertyValue('--color-primary').trim();
        const primaryLight = palette?.primaryLight || getComputedStyle(root).getPropertyValue('--color-primary-light').trim();
        const primaryLighter = palette?.primaryLighter || getComputedStyle(root).getPropertyValue('--color-primary-lighter').trim();
        const primaryDark = palette?.primaryDark || getComputedStyle(root).getPropertyValue('--color-primary-dark').trim();
        
        // 將 hex 顏色轉換為 RGB
        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
        
        // 生成主題相關的顏色系列
        const primaryRgb = hexToRgb(primaryColor);
        const lightRgb = hexToRgb(primaryLight);
        const lighterRgb = hexToRgb(primaryLighter);
        const darkRgb = hexToRgb(primaryDark);
        
        if (primaryRgb && lightRgb && lighterRgb && darkRgb) {
            // 根據主題顏色生成漸變色系列
            baseColors = [
                { bg: `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.8)`, border: `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 1)` },
                { bg: `rgba(${lightRgb.r}, ${lightRgb.g}, ${lightRgb.b}, 0.8)`, border: `rgba(${lightRgb.r}, ${lightRgb.g}, ${lightRgb.b}, 1)` },
                { bg: `rgba(${lighterRgb.r}, ${lighterRgb.g}, ${lighterRgb.b}, 0.8)`, border: `rgba(${lighterRgb.r}, ${lighterRgb.g}, ${lighterRgb.b}, 1)` },
                { bg: `rgba(${darkRgb.r}, ${darkRgb.g}, ${darkRgb.b}, 0.8)`, border: `rgba(${darkRgb.r}, ${darkRgb.g}, ${darkRgb.b}, 1)` },
                // 生成更多漸變色
                { bg: `rgba(${Math.min(255, primaryRgb.r + 20)}, ${Math.min(255, primaryRgb.g + 20)}, ${Math.min(255, primaryRgb.b + 20)}, 0.8)`, border: `rgba(${Math.min(255, primaryRgb.r + 20)}, ${Math.min(255, primaryRgb.g + 20)}, ${Math.min(255, primaryRgb.b + 20)}, 1)` },
                { bg: `rgba(${Math.max(0, primaryRgb.r - 20)}, ${Math.max(0, primaryRgb.g - 20)}, ${Math.max(0, primaryRgb.b - 20)}, 0.8)`, border: `rgba(${Math.max(0, primaryRgb.r - 20)}, ${Math.max(0, primaryRgb.g - 20)}, ${Math.max(0, primaryRgb.b - 20)}, 1)` },
                { bg: `rgba(${Math.min(255, lightRgb.r + 15)}, ${Math.min(255, lightRgb.g + 15)}, ${Math.min(255, lightRgb.b + 15)}, 0.8)`, border: `rgba(${Math.min(255, lightRgb.r + 15)}, ${Math.min(255, lightRgb.g + 15)}, ${Math.min(255, lightRgb.b + 15)}, 1)` },
                { bg: `rgba(${Math.max(0, lightRgb.r - 15)}, ${Math.max(0, lightRgb.g - 15)}, ${Math.max(0, lightRgb.b - 15)}, 0.8)`, border: `rgba(${Math.max(0, lightRgb.r - 15)}, ${Math.max(0, lightRgb.g - 15)}, ${Math.max(0, lightRgb.b - 15)}, 1)` },
                { bg: `rgba(${Math.min(255, lighterRgb.r + 10)}, ${Math.min(255, lighterRgb.g + 10)}, ${Math.min(255, lighterRgb.b + 10)}, 0.8)`, border: `rgba(${Math.min(255, lighterRgb.r + 10)}, ${Math.min(255, lighterRgb.g + 10)}, ${Math.min(255, lighterRgb.b + 10)}, 1)` },
                { bg: `rgba(${Math.max(0, darkRgb.r - 10)}, ${Math.max(0, darkRgb.g - 10)}, ${Math.max(0, darkRgb.b - 10)}, 0.8)`, border: `rgba(${Math.max(0, darkRgb.r - 10)}, ${Math.max(0, darkRgb.g - 10)}, ${Math.max(0, darkRgb.b - 10)}, 1)` }
            ];
        } else {
            // 如果無法解析顏色，使用預設粉色系
            baseColors = [
                { bg: 'rgba(255, 105, 180, 0.8)', border: 'rgba(255, 105, 180, 1)' },
                { bg: 'rgba(255, 182, 193, 0.8)', border: 'rgba(255, 182, 193, 1)' },
                { bg: 'rgba(255, 192, 203, 0.8)', border: 'rgba(255, 192, 203, 1)' },
                { bg: 'rgba(255, 20, 147, 0.8)', border: 'rgba(255, 20, 147, 1)' },
                { bg: 'rgba(219, 112, 147, 0.8)', border: 'rgba(219, 112, 147, 1)' },
                { bg: 'rgba(199, 21, 133, 0.8)', border: 'rgba(199, 21, 133, 1)' },
                { bg: 'rgba(255, 160, 122, 0.8)', border: 'rgba(255, 160, 122, 1)' },
                { bg: 'rgba(255, 140, 0, 0.8)', border: 'rgba(255, 140, 0, 1)' },
                { bg: 'rgba(255, 165, 0, 0.8)', border: 'rgba(255, 165, 0, 1)' },
                { bg: 'rgba(255, 215, 0, 0.8)', border: 'rgba(255, 215, 0, 1)' }
            ];
        }
    }
    
    const backgrounds = [];
    const borders = [];
    
    for (let i = 0; i < count; i++) {
        const color = baseColors[i % baseColors.length];
        backgrounds.push(color.bg);
        borders.push(color.border);
    }
    
    return { backgrounds, borders };
}

// 更新圖例
function updateChartLegend(data, colors) {
    const chartLegend = document.getElementById('chartLegend');
    if (!chartLegend) return;
    
    let html = '<div class="chart-legend-header">';
    html += `<div class="legend-total">總計: NT$${data.total.toLocaleString('zh-TW')}</div>`;
    html += '</div>';
    html += '<div class="chart-legend-list">';
    
    data.labels.forEach((label, index) => {
        const value = data.values[index];
        const percentage = ((value / data.total) * 100).toFixed(1);
        
        html += `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${colors.backgrounds[index]}; border-color: ${colors.borders[index]};"></div>
                <div class="legend-info">
                    <div class="legend-label">${label}</div>
                    <div class="legend-value">NT$${value.toLocaleString('zh-TW')} (${percentage}%)</div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    chartLegend.innerHTML = html;
}

// 計算分類的已使用金額（當月）
function getCategoryUsedAmount(categoryName, records) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    let used = 0;
    records.forEach(record => {
        const recordDate = new Date(record.date);
        const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
        if (recordMonth === currentMonth && 
            (record.type === 'expense' || !record.type) && 
            record.category === categoryName) {
            used += record.amount;
        }
    });
    
    return used;
}

// 顯示預算設定對話框（美化版）
function showBudgetSettingDialog(categoryName) {
    const budgets = JSON.parse(localStorage.getItem('categoryBudgets') || '{}');
    const dailyTrackingState = JSON.parse(localStorage.getItem('dailyBudgetTracking') || '{}');
    const currentBudget = budgets[categoryName] || 0;
    const isCurrentlyTracking = dailyTrackingState[categoryName] === true;
    
    // 查找分類信息
    const category = allCategories.find(cat => cat.name === categoryName);
    const categoryIcon = category ? category.icon : '💰';
    
    // 創建預算設定模態框
    const budgetModal = document.createElement('div');
    budgetModal.className = 'budget-setting-modal';
    
    budgetModal.innerHTML = `
        <div class="budget-setting-modal-content" style="background: var(--bg-white); border-radius: 24px; padding: 28px; max-width: 420px; width: 100%; box-shadow: var(--shadow-primary-lg), 0 4px 16px rgba(0, 0, 0, 0.15); border: 1px solid var(--color-primary-rgba-20); animation: slideIn 0.3s ease-out;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 style="margin: 0; font-size: 22px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 28px;">${categoryIcon}</span>
                    <span>設定預算</span>
                </h2>
                <button class="budget-setup-close-btn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-tertiary); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;">×</button>
            </div>
            
            <div style="margin-bottom: 20px; padding: 16px; background: var(--bg-gradient-light); border-radius: 12px; border: 1px solid var(--color-primary-rgba-20);">
                <div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">分類名稱</div>
                <div style="font-size: 18px; color: var(--color-primary-dark); font-weight: 600;">
                    ${categoryName}
                </div>
            </div>
            
            <div style="margin-bottom: 24px;">
                <label for="budgetAmountInput" style="display: block; font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">預算金額 <span style="font-size: 12px; font-weight: normal; color: var(--text-tertiary);">(輸入 0 可刪除預算)</span></label>
                <div style="position: relative;">
                    <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-weight: 600; font-size: 16px;">NT$</span>
                    <input type="number" id="budgetAmountInput" value="${currentBudget}" step="0.01" min="0" placeholder="請輸入預算金額" class="budget-amount-input" style="width: 100%; padding: 14px 16px 14px 60px; border: 2px solid var(--border-light); border-radius: 12px; font-size: 18px; font-weight: 600; background: var(--bg-white); color: var(--text-primary); transition: all 0.3s; box-sizing: border-box;">
                </div>
            </div>
            
            <div style="margin-bottom: 28px; padding: 16px; background: var(--bg-gradient-light); border-radius: 12px; border: 1px solid var(--color-primary-rgba-20);">
                <label style="display: flex; align-items: center; cursor: pointer; user-select: none;">
                    <input type="checkbox" id="enableDailyTracking" ${isCurrentlyTracking ? 'checked' : ''} style="width: 20px; height: 20px; margin-right: 12px; cursor: pointer; accent-color: var(--color-primary); flex-shrink: 0;">
                    <div style="flex: 1;">
                        <div style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                            <span>📅</span>
                            <span>開啟每日預算追蹤</span>
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">監控每天的預算使用情況，幫助您更好地控制支出</div>
                    </div>
                </label>
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button id="budgetSetupCancelBtn" class="budget-setup-cancel-btn" style="flex: 1; padding: 14px; border: 2px solid var(--border-light); border-radius: 12px; background: var(--bg-white); color: var(--text-primary); font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s;">取消</button>
                <button id="budgetSetupSaveBtn" class="budget-setup-save-btn" style="flex: 2; padding: 14px; border: none; border-radius: 12px; background: var(--bg-gradient); color: var(--text-white); font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: var(--shadow-primary);">儲存</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(budgetModal);
    
    // 關閉按鈕
    const closeBtn = budgetModal.querySelector('.budget-setup-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
        if (document.body.contains(budgetModal)) {
            document.body.removeChild(budgetModal);
        }
    });
    
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'var(--bg-lighter)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'none';
        });
    }
    
    const cancelBtn = budgetModal.querySelector('#budgetSetupCancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
        if (document.body.contains(budgetModal)) {
            document.body.removeChild(budgetModal);
        }
    });
        
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = 'var(--bg-lighter)';
            cancelBtn.style.borderColor = 'var(--color-primary-light)';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = 'var(--bg-white)';
            cancelBtn.style.borderColor = 'var(--border-light)';
        });
    }
    
    // 儲存按鈕懸停效果
    const saveBtn = budgetModal.querySelector('#budgetSetupSaveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('mouseenter', () => {
            saveBtn.style.transform = 'translateY(-2px)';
            saveBtn.style.boxShadow = 'var(--shadow-primary-lg)';
        });
        saveBtn.addEventListener('mouseleave', () => {
            saveBtn.style.transform = 'translateY(0)';
            saveBtn.style.boxShadow = 'var(--shadow-primary)';
        });
    }
    
    // 輸入框聚焦效果
    const budgetInput = budgetModal.querySelector('#budgetAmountInput');
    if (budgetInput) {
        budgetInput.addEventListener('focus', function() {
            this.style.borderColor = 'var(--color-primary)';
            this.style.boxShadow = '0 4px 12px var(--color-primary-rgba-20)';
        });
        budgetInput.addEventListener('blur', function() {
            this.style.borderColor = 'var(--border-light)';
            this.style.boxShadow = 'none';
        });
    }
    
    // 點擊遮罩關閉
    budgetModal.addEventListener('click', (e) => {
        if (e.target === budgetModal) {
            if (document.body.contains(budgetModal)) {
                document.body.removeChild(budgetModal);
            }
        }
    });
    
    // 保存按鈕
    budgetModal.querySelector('#budgetSetupSaveBtn').addEventListener('click', () => {
        playClickSound(); // 播放點擊音效
        const budgetInput = budgetModal.querySelector('#budgetAmountInput');
        const enableDailyTracking = budgetModal.querySelector('#enableDailyTracking').checked;
        const budgetAmount = parseFloat(budgetInput.value);
    
    if (isNaN(budgetAmount) || budgetAmount < 0) {
        alert('請輸入有效的金額（大於等於0）');
            budgetInput.focus();
        return;
    }
    
    if (budgetAmount === 0) {
        // 如果輸入0，刪除預算
        delete budgets[categoryName];
            // 同時刪除每日追蹤設定
            delete dailyTrackingState[categoryName];
    } else {
        budgets[categoryName] = budgetAmount;
            
            // 保存每日追蹤設定
            if (enableDailyTracking) {
                dailyTrackingState[categoryName] = true;
            } else {
                delete dailyTrackingState[categoryName];
            }
    }
    
    localStorage.setItem('categoryBudgets', JSON.stringify(budgets));
        localStorage.setItem('dailyBudgetTracking', JSON.stringify(dailyTrackingState));
        
        // 關閉模態框
        if (document.body.contains(budgetModal)) {
            document.body.removeChild(budgetModal);
        }
    
    // 重新初始化預算頁面
    initBudget();
    });
    
    // 自動聚焦到輸入框
    setTimeout(() => {
        budgetModal.querySelector('#budgetAmountInput').focus();
        budgetModal.querySelector('#budgetAmountInput').select();
    }, 100);
}

// 編輯預算
function editBudget(categoryName) {
    showBudgetSettingDialog(categoryName);
}

// 初始化預算頁面
function initBudget() {
    // 自動套用下月預算（如果有的話）
    applyNextMonthBudgets();
    
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const budgets = JSON.parse(localStorage.getItem('categoryBudgets') || '{}');
    
    // 計算總預算
    let totalBudget = 0;
    Object.keys(budgets).forEach(categoryId => {
        totalBudget += budgets[categoryId];
    });
    
    // 計算已使用
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let totalUsed = 0;
    
    records.forEach(record => {
        const recordDate = new Date(record.date);
        const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
        if (recordMonth === currentMonth && (record.type === 'expense' || !record.type)) {
            totalUsed += record.amount;
        }
    });
    
    const remaining = totalBudget - totalUsed;
    
    // 更新顯示
    const totalBudgetEl = document.getElementById('totalBudgetAmount');
    const totalUsedEl = document.getElementById('totalBudgetUsed');
    const remainingEl = document.getElementById('totalBudgetRemaining');
    
    if (totalBudgetEl) {
        totalBudgetEl.textContent = `NT$${totalBudget.toLocaleString('zh-TW')}`;
        // 確保有正確的類別
        totalBudgetEl.classList.add('budget-total');
        totalBudgetEl.classList.remove('over-budget');
    }
    if (totalUsedEl) {
        totalUsedEl.textContent = `NT$${totalUsed.toLocaleString('zh-TW')}`;
        // 確保有正確的類別
        totalUsedEl.classList.add('budget-used');
        if (totalUsed > totalBudget && totalBudget > 0) {
            totalUsedEl.classList.add('over-budget');
        } else {
            totalUsedEl.classList.remove('over-budget');
        }
    }
    if (remainingEl) {
        remainingEl.textContent = `NT$${remaining.toLocaleString('zh-TW')}`;
        // 確保有正確的類別
        remainingEl.classList.add('budget-remaining');
        if (remaining < 0) {
            remainingEl.classList.add('over-budget');
        } else {
            remainingEl.classList.remove('over-budget');
        }
    }
    
    // 顯示預算列表
    const budgetList = document.getElementById('budgetList');
    if (budgetList) {
        // 先載入自定義分類，確保 allCategories 包含最新分類
        loadCustomCategories();
        
        // 獲取所有啟用的分類（與記帳本保持一致）
        // 使用 getEnabledCategories(null) 獲取所有啟用的分類，不分類型
        let allAvailableCategories = getEnabledCategories(null);
        
        // 過濾出有設定預算的分類，以及所有分類（用於新增預算）
        const categoriesWithBudget = allAvailableCategories.filter(cat => budgets.hasOwnProperty(cat.name));
        const categoriesWithoutBudget = allAvailableCategories.filter(cat => !budgets.hasOwnProperty(cat.name));
        
        // 始終顯示「新增預算」按鈕（如果還有未設定預算的分類）
        if (categoriesWithBudget.length === 0 && categoriesWithoutBudget.length === 0) {
            budgetList.innerHTML = '<div class="empty-state">尚無預算設定<br><small>點擊「新增預算」按鈕開始設定</small></div><div class="budget-add-section"><button class="budget-edit-btn budget-add-btn-full" onclick="showAddBudgetDialog()">➕ 新增預算</button></div>';
        } else {
            let html = '';
            
            // 顯示已設定預算的分類
            categoriesWithBudget.forEach(category => {
                const budget = budgets[category.name];
                const used = getCategoryUsedAmount(category.name, records);
                const remaining = budget - used;
                const percentage = budget > 0 ? Math.min((used / budget) * 100, 100) : 0;
                const isOverBudget = used > budget;
                
                // 進度條顏色類名（使用CSS變數）
                let progressColorClass = 'progress-success'; // 綠色
                if (percentage >= 100) {
                    progressColorClass = 'progress-error'; // 紅色（超過）
                } else if (percentage >= 80) {
                    progressColorClass = 'progress-warning'; // 橙色（接近）
                }
                
                // 為所有開啟每日追蹤的分類添加查看詳細追蹤按鈕
                const dailyTrackingState = JSON.parse(localStorage.getItem('dailyBudgetTracking') || '{}');
                const isDailyTrackingEnabled = dailyTrackingState[category.name] === true;
                let dailyBudgetButton = '';
                if (isDailyTrackingEnabled) {
                    dailyBudgetButton = `
                        <button class="daily-budget-track-btn" data-category="${category.name}">
                            📅 查看每日追蹤
                        </button>
                    `;
                }
                
                html += `
                    <div class="budget-item">
                        <div class="budget-item-icon">${category.icon}</div>
                        <div class="budget-item-info">
                            <div class="budget-item-header">
                                <span class="budget-item-name">${category.name}</span>
                                <span class="budget-item-status ${isOverBudget ? 'over-budget' : ''}">
                                    ${isOverBudget ? '已超支' : `${percentage.toFixed(0)}%`}
                                </span>
                            </div>
                            <div class="budget-progress-bar">
                                <div class="budget-progress-fill ${progressColorClass}" style="width: ${percentage}%;"></div>
                            </div>
                            <div class="budget-item-details">
                                <div class="budget-detail-item">
                                    <span class="budget-detail-label">預算</span>
                                    <span class="budget-detail-value budget-detail-total">NT$${budget.toLocaleString('zh-TW')}</span>
                                </div>
                                <div class="budget-detail-item">
                                    <span class="budget-detail-label">已使用</span>
                                    <span class="budget-detail-value budget-detail-used ${isOverBudget ? 'over-budget' : ''}">NT$${used.toLocaleString('zh-TW')}</span>
                                </div>
                                <div class="budget-detail-item">
                                    <span class="budget-detail-label">剩餘</span>
                                    <span class="budget-detail-value budget-detail-remaining ${remaining < 0 ? 'over-budget' : ''}">NT$${remaining.toLocaleString('zh-TW')}</span>
                                </div>
                            </div>
                            ${dailyBudgetButton}
                        </div>
                        <button class="budget-edit-btn" onclick="editBudget('${category.name}')">編輯</button>
                    </div>
                `;
            });
            
            // 始終顯示「新增預算」按鈕（如果還有未設定預算的分類）
            if (categoriesWithoutBudget.length > 0) {
                html += `
                    <div class="budget-add-section">
                        <button class="budget-edit-btn budget-add-btn-full" onclick="showAddBudgetDialog()">
                            ➕ 新增預算
                        </button>
                    </div>
                `;
            } else {
                // 即使所有分類都已設定預算，也顯示「新增預算」按鈕，允許重新設定或添加新分類
                html += `
                    <div class="budget-add-section">
                        <button class="budget-edit-btn budget-add-btn-full" onclick="showAddBudgetDialog()">
                            ➕ 新增預算
                        </button>
                    </div>
                `;
            }
            
            budgetList.innerHTML = html;
            
            // 為所有開啟每日追蹤的分類按鈕綁定事件監聽器
            const trackBtns = budgetList.querySelectorAll('.daily-budget-track-btn');
            trackBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const categoryName = btn.dataset.category;
                    if (categoryName) {
                        showDailyBudgetPage(categoryName);
                    }
                });
            });
        }
    }
}

// 計算每日預算信息
function calculateDailyBudget(categoryName, totalBudget, records) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    
    // 計算當月天數
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // 基礎每日預算
    const baseDailyBudget = totalBudget / daysInMonth;
    
    // 獲取當月所有該分類的記錄
    const monthRecords = records.filter(record => {
        if (record.category !== categoryName) return false;
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === currentYear && 
               recordDate.getMonth() === currentMonth &&
               (record.type === 'expense' || !record.type);
    });
    
    // 計算每日使用情況
    const dailyUsage = {};
    monthRecords.forEach(record => {
        const recordDate = new Date(record.date);
        const day = recordDate.getDate();
        if (!dailyUsage[day]) {
            dailyUsage[day] = 0;
        }
        dailyUsage[day] += record.amount || 0;
    });
    
    // 計算今日使用
    const todayUsed = dailyUsage[currentDay] || 0;
    
    // 計算累積調整（用多了扣明天，用少了加明天）
    let cumulativeAdjustment = 0;
    for (let day = 1; day < currentDay; day++) {
        const dayUsed = dailyUsage[day] || 0;
        const adjustment = baseDailyBudget - dayUsed; // 正數表示省了，負數表示超了
        cumulativeAdjustment += adjustment;
    }
    
    // 今日可用 = 基礎每日預算 + 累積調整 - 今日已用
    const todayAvailable = baseDailyBudget + cumulativeAdjustment - todayUsed;
    
    // 明日調整 = 今日的調整（基礎每日預算 - 今日已用）
    const todayAdjustment = baseDailyBudget - todayUsed;
    const tomorrowAdjustment = todayAdjustment;
    
    return {
        dailyBudget: Math.round(baseDailyBudget * 100) / 100,
        todayUsed: Math.round(todayUsed * 100) / 100,
        todayAvailable: Math.round(todayAvailable * 100) / 100,
        adjustment: Math.round(tomorrowAdjustment * 100) / 100,
        daysInMonth: daysInMonth,
        dailyUsage: dailyUsage,
        totalBudget: totalBudget
    };
}

// 顯示每日預算追蹤頁面
function showDailyBudgetPage(categoryName = '生活費') {
    const pageBudget = document.getElementById('pageBudget');
    const pageDailyBudget = document.getElementById('pageDailyBudget');
    const bottomNav = document.querySelector('.bottom-nav');
    
    if (!pageDailyBudget) return;
    
    // 保存當前分類名稱到全局變量
    window.currentDailyBudgetCategory = categoryName;
    
    // 隱藏預算頁面
    if (pageBudget) pageBudget.style.display = 'none';
    
    // 顯示每日預算追蹤頁面
    pageDailyBudget.style.display = 'block';
    
    // 隱藏底部導航
    if (bottomNav) bottomNav.style.display = 'none';
    
    // 初始化頁面內容
    initDailyBudgetPage(categoryName);
}

// 返回預算設定頁面
function showBudgetPage() {
    const pageBudget = document.getElementById('pageBudget');
    const pageDailyBudget = document.getElementById('pageDailyBudget');
    const bottomNav = document.querySelector('.bottom-nav');
    
    if (!pageBudget) return;
    
    // 隱藏每日預算追蹤頁面
    if (pageDailyBudget) pageDailyBudget.style.display = 'none';
    
    // 顯示預算頁面
    pageBudget.style.display = 'block';
    
    // 顯示底部導航
    if (bottomNav) bottomNav.style.display = 'flex';
    
    // 重新初始化預算頁面
    if (typeof initBudget === 'function') {
        initBudget();
    }
}

// 初始化每日預算追蹤頁面
function initDailyBudgetPage(categoryName = '生活費') {
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const budgets = JSON.parse(localStorage.getItem('categoryBudgets') || '{}');
    const budget = budgets[categoryName] || 0;
    
    // 更新頁面標題
    const titleElement = document.querySelector('.daily-budget-title');
    if (titleElement) {
        const categoryIcon = categoryName === '生活費' ? '💰' : categoryName === '卡費' ? '💳' : '📊';
        titleElement.textContent = `${categoryIcon} ${categoryName}每日預算追蹤`;
    }
    
    if (budget === 0) {
        const summary = document.getElementById('dailyBudgetSummary');
        const calendar = document.getElementById('dailyBudgetCalendar');
        if (summary) {
            summary.innerHTML = `<div class="empty-state">尚未設定「${categoryName}」分類的預算<br><small>請先在預算設定頁面設定預算</small></div>`;
        }
        if (calendar) calendar.innerHTML = '';
        return;
    }
    
    const dailyInfo = calculateDailyBudget(categoryName, budget, records);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    const daysInMonth = dailyInfo.daysInMonth;
    
    // 如果是卡費分類，計算下個月的預約扣款
    let nextMonthBillsHtml = '';
    if (categoryName === '卡費') {
        const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
        const nextMonthYear = nextMonthDate.getFullYear();
        const nextMonthNum = nextMonthDate.getMonth();
        
        const nextMonthBills = records.filter(record => {
            if (record.category !== categoryName) return false;
            if (record.type !== 'expense' && record.type !== undefined) return false;
            const recordDate = new Date(record.date);
            return recordDate.getFullYear() === nextMonthYear && 
                   recordDate.getMonth() === nextMonthNum &&
                   record.isNextMonthBill === true;
        });
        
        if (nextMonthBills.length > 0) {
            const nextMonthTotal = nextMonthBills.reduce((sum, record) => sum + (record.amount || 0), 0);
            nextMonthBillsHtml = `
                <button class="summary-item summary-item--cta" type="button" data-category="${categoryName}">
                    <div class="summary-label">下月預約扣款</div>
                    <div class="summary-value highlight">NT$${nextMonthTotal.toLocaleString('zh-TW')}</div>
                    <div class="summary-cta-text">共 ${nextMonthBills.length} 筆 · 點擊查看</div>
                </button>
            `;
        }
    }
    
    // 更新摘要信息
    const summary = document.getElementById('dailyBudgetSummary');
    if (summary) {
        summary.innerHTML = `
            <div class="daily-budget-summary-card" id="dailyBudgetSummaryCard">
                <div class="summary-item">
                    <div class="summary-label">總預算</div>
                    <div class="summary-value">NT$${budget.toLocaleString('zh-TW')}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">每日可用</div>
                    <div class="summary-value highlight">NT$${dailyInfo.dailyBudget.toLocaleString('zh-TW')}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">今日已用</div>
                    <div class="summary-value ${dailyInfo.todayUsed > dailyInfo.todayAvailable ? 'over' : ''}">NT$${dailyInfo.todayUsed.toLocaleString('zh-TW')}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">今日可用</div>
                    <div class="summary-value ${dailyInfo.todayAvailable < 0 ? 'over' : 'highlight'}">NT$${dailyInfo.todayAvailable.toLocaleString('zh-TW')}</div>
                </div>
                ${dailyInfo.adjustment !== 0 ? `
                    <div class="summary-item">
                        <div class="summary-label">明日調整</div>
                        <div class="summary-value ${dailyInfo.adjustment > 0 ? 'positive' : 'negative'}">
                            ${dailyInfo.adjustment > 0 ? '+' : ''}NT$${dailyInfo.adjustment.toLocaleString('zh-TW')}
                        </div>
                    </div>
                ` : ''}
                ${nextMonthBillsHtml}
            </div>
        `;
    }
    
    // 綁定下月預約扣款按鈕
    const summaryCard = document.getElementById('dailyBudgetSummaryCard');
    if (summaryCard) {
        summaryCard.querySelectorAll('.summary-item--cta').forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.dataset.category || '卡費';
                showNextMonthBills(cat);
            });
        });
    }
    
    // 生成每日日曆
    const calendar = document.getElementById('dailyBudgetCalendar');
    if (calendar) {
        let calendarHtml = '<div class="daily-calendar-title">當月每日明細</div>';
        calendarHtml += '<div class="daily-calendar-grid">';
        
        let cumulativeAdjustment = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const dayUsed = dailyInfo.dailyUsage[day] || 0;
            const dayAdjustment = dailyInfo.dailyBudget - dayUsed;
            cumulativeAdjustment += dayAdjustment;
            const dayAvailable = dailyInfo.dailyBudget + cumulativeAdjustment - dayUsed;
            
            const isToday = day === currentDay;
            const isPast = day < currentDay;
            const isFuture = day > currentDay;
            
            calendarHtml += `
                <div class="daily-calendar-item ${isToday ? 'today' : ''} ${isPast ? 'past' : ''} ${isFuture ? 'future' : ''}" data-day="${day}" style="cursor: pointer;" onclick="showDailyDetail('${categoryName}', ${day}, ${currentYear}, ${currentMonth + 1})">
                    <div class="daily-item-header">
                        <span class="daily-item-day">${day}日</span>
                        ${isToday ? '<span class="daily-item-today-badge">今天</span>' : ''}
                    </div>
                    <div class="daily-item-content">
                        <div class="daily-item-row">
                            <span class="daily-item-label">已用</span>
                            <span class="daily-item-value ${dayUsed > dailyInfo.dailyBudget ? 'over' : ''}">NT$${dayUsed.toLocaleString('zh-TW')}</span>
                        </div>
                        <div class="daily-item-row">
                            <span class="daily-item-label">可用</span>
                            <span class="daily-item-value ${dayAvailable < 0 ? 'over' : ''}">NT$${dayAvailable.toLocaleString('zh-TW')}</span>
                        </div>
                        ${dayAdjustment !== 0 ? `
                            <div class="daily-item-row">
                                <span class="daily-item-label">調整</span>
                                <span class="daily-item-value ${dayAdjustment > 0 ? 'positive' : 'negative'}">
                                    ${dayAdjustment > 0 ? '+' : ''}NT$${dayAdjustment.toLocaleString('zh-TW')}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                    ${dayUsed > 0 ? '<div style="margin-top: 8px; font-size: 11px; color: var(--text-tertiary);">點擊查看詳情</div>' : ''}
                </div>
            `;
        }
        
        calendarHtml += '</div>';
        calendar.innerHTML = calendarHtml;
    }
    
    // 綁定返回按鈕（返回到預算設定頁面）
    const dailyBudgetBackBtn = document.getElementById('dailyBudgetBackBtn');
    if (dailyBudgetBackBtn) {
        dailyBudgetBackBtn.onclick = null; // 清除舊的 onclick
        dailyBudgetBackBtn.addEventListener('click', () => {
            showBudgetPage();
        });
    }
}

// 顯示某一天的詳細記錄
function showDailyDetail(categoryName, day, year, month) {
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // 獲取當天的所有該分類記錄
    const dayRecords = records.filter(record => {
        if (record.category !== categoryName) return false;
        if (record.type !== 'expense' && record.type !== undefined) return false;
        return record.date === dateStr;
    });
    
    // 計算當天總金額
    const dayTotal = dayRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
    
    // 查找分類信息
    const category = allCategories.find(cat => cat.name === categoryName);
    const categoryIcon = category ? category.icon : '💰';
    
    // 創建詳細記錄模態框
    const detailModal = document.createElement('div');
    detailModal.className = 'daily-detail-modal';

    let recordsTitleText = `記錄明細 (${dayRecords.length}筆)`;
    let recordsHtml = '';
    if (categoryName === '卡費') {
        // 卡費：不在每日明細彈窗展開詳細，改為點擊後跳出「下月預約扣款」彈窗
        const now = new Date();
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const nextMonthYear = nextMonthDate.getFullYear();
        const nextMonthNum = nextMonthDate.getMonth();
        const nextMonthBills = records.filter(record => {
            if (record.category !== '卡費') return false;
            if (record.type !== 'expense' && record.type !== undefined) return false;
            const recordDate = new Date(record.date);
            return recordDate.getFullYear() === nextMonthYear &&
                   recordDate.getMonth() === nextMonthNum &&
                   record.isNextMonthBill === true;
        });
        const nextMonthTotal = nextMonthBills.reduce((sum, r) => sum + (r.amount || 0), 0);

        recordsTitleText = '卡費明細';
        recordsHtml = `
            <button class="summary-item summary-item--cta" type="button" data-category="卡費">
                <div class="summary-label">下月預約扣款</div>
                <div class="summary-value highlight">NT$${nextMonthTotal.toLocaleString('zh-TW')}</div>
                <div class="summary-cta-text">共 ${nextMonthBills.length} 筆 · 點擊查看</div>
            </button>
        `;
    } else if (dayRecords.length === 0) {
        recordsHtml = '<div style="text-align: center; padding: 40px; color: var(--text-tertiary);">當天沒有記錄</div>';
    } else {
        dayRecords.forEach(record => {
            const iconHtml = record.emoji 
                ? (record.emoji.type === 'image' && isLikelyImageSrc(record.emoji.value)
                    ? `<img src="${record.emoji.value}" alt="表情" style="width: 24px; height: 24px; object-fit: cover; border-radius: 4px;">`
                    : record.emoji.value)
                : getCategoryIcon(record.category);
            
            recordsHtml += `
                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-light); border-radius: 12px; margin-bottom: 8px;">
                    <div style="font-size: 24px; flex-shrink: 0;">${iconHtml}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${record.category || '未分類'}</div>
                        ${record.note ? `<div style="font-size: 12px; color: var(--text-secondary);">${record.note}</div>` : ''}
                    </div>
                    <div style="font-size: 18px; font-weight: 600; color: var(--color-error);">-NT$${(record.amount || 0).toLocaleString('zh-TW')}</div>
                </div>
            `;
        });
    }
    
    detailModal.innerHTML = `
        <div class="daily-detail-modal__panel">
            <div class="daily-detail-modal__header">
                <h2 class="daily-detail-modal__title">
                    <span class="daily-detail-modal__icon">${categoryIcon}</span>
                    <span>${year}年${month}月${day}日</span>
                </h2>
                <button class="daily-detail-close-btn" type="button" aria-label="close">×</button>
            </div>
            
            <div class="daily-detail-summary-card">
                <div>
                    <div class="daily-detail-summary-label">分類</div>
                    <div class="daily-detail-summary-value">${categoryName}</div>
                </div>
                <div class="daily-detail-summary-value-wrap">
                    <div class="daily-detail-summary-label">當日總計</div>
                    <div class="daily-detail-summary-total">NT$${dayTotal.toLocaleString('zh-TW')}</div>
                </div>
            </div>
            
            <div class="daily-detail-records-header">${recordsTitleText}</div>
            <div class="daily-detail-records-list">
                ${recordsHtml}
            </div>
            
            <!-- 快速記帳按鈕 -->
            <button class="daily-detail-quick-add-btn" type="button">
                <span class="daily-detail-quick-add-btn__icon">➕</span>
                <span>快速記帳</span>
            </button>
        </div>
    `;
    
    document.body.appendChild(detailModal);

    // 卡費：綁定「下月預約扣款」按鈕
    if (categoryName === '卡費') {
        const ctaBtn = detailModal.querySelector('.summary-item--cta[data-category="卡費"]');
        if (ctaBtn) {
            ctaBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (document.body.contains(detailModal)) {
                    document.body.removeChild(detailModal);
                }
                showNextMonthBills('卡費');
            });
        }
    }
    
    // 快速記帳按鈕事件和樣式
    const quickAddBtn = detailModal.querySelector('.daily-detail-quick-add-btn');
    if (quickAddBtn) {
        quickAddBtn.addEventListener('click', () => {
            // 顯示快速記帳輸入框
            const amountInput = prompt(
                `快速記帳 - ${categoryName}\n\n日期：${year}年${month}月${day}日\n分類：${categoryName}\n\n請輸入金額：`,
                ''
            );
            
            if (amountInput && !isNaN(parseFloat(amountInput)) && parseFloat(amountInput) > 0) {
                const amount = parseFloat(amountInput);
                
                // 如果是卡費分類，詢問是否計入下個月
                let recordDate = dateStr;
                let isNextMonthBill = false;
                if (categoryName === '卡費') {
                    const nextMonth = confirm('此卡費是否要計入下個月？\n\n點擊「確定」= 計入下個月\n點擊「取消」= 計入本月');
                    if (nextMonth) {
                        isNextMonthBill = true;
                        // 計算下個月的日期
                        const currentDate = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                        const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
                        recordDate = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(nextMonthDate.getDate()).padStart(2, '0')}`;
                    }
                }
                
                // 獲取選中的帳戶（如果沒有選中，自動使用默認帳戶）
                let selectedAccount = getSelectedAccount();
                if (!selectedAccount) {
                    selectedAccount = getDefaultAccount();
                }
                
                // 如果沒有帳戶，提示創建帳戶
                if (!selectedAccount) {
                    alert('請先創建帳戶');
                    return;
                }
                
                // 獲取分類信息
                const category = allCategories.find(cat => cat.name === categoryName);
                const categoryEmoji = category ? (category.emoji || { type: 'emoji', value: category.icon }) : null;
                
                // 創建記錄
                const record = {
                    type: 'expense',
                    category: categoryName,
                    amount: amount,
                    note: isNextMonthBill ? '(下月帳單)' : '',
                    date: recordDate,
                    account: selectedAccount.id,
                    emoji: categoryEmoji,
                    timestamp: new Date().toISOString(),
                    isNextMonthBill: isNextMonthBill // 標記是否為下月帳單
                };
                
                // 保存到 localStorage
                let allRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
                allRecords.push(record);
                localStorage.setItem('accountingRecords', JSON.stringify(allRecords));
                
                // 更新帳戶顯示
                if (typeof updateAccountDisplay === 'function') {
                    updateAccountDisplay();
                }
                
                // 更新記帳本顯示
                if (typeof updateLedgerSummary === 'function') {
                    updateLedgerSummary(allRecords);
                }
                if (typeof displayLedgerTransactions === 'function') {
                    displayLedgerTransactions(allRecords);
                }
                
                // 重新顯示詳情頁面（刷新數據）
                if (document.body.contains(detailModal)) {
                    document.body.removeChild(detailModal);
                }
                showDailyDetail(categoryName, day, year, month);
                
                // 如果是在每日預算頁面，也需要更新
                if (typeof initDailyBudgetPage === 'function') {
                    initDailyBudgetPage(categoryName);
                }
            }
        });
    }
    
    // 關閉按鈕
    detailModal.querySelector('.daily-detail-close-btn').addEventListener('click', () => {
        if (document.body.contains(detailModal)) {
            document.body.removeChild(detailModal);
        }
    });
    
    // 點擊遮罩關閉
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) {
            if (document.body.contains(detailModal)) {
                document.body.removeChild(detailModal);
            }
        }
    });
}

// 顯示下個月預約扣款明細
function showNextMonthBills(categoryName) {
    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const now = new Date();
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthYear = nextMonthDate.getFullYear();
    const nextMonthNum = nextMonthDate.getMonth();
    const nextMonthName = `${nextMonthYear}年${nextMonthNum + 1}月`;
    
    // 獲取下個月的預約扣款
    const nextMonthBills = records.filter(record => {
        if (record.category !== categoryName) return false;
        if (record.type !== 'expense' && record.type !== undefined) return false;
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === nextMonthYear && 
               recordDate.getMonth() === nextMonthNum &&
               record.isNextMonthBill === true;
    });
    
    // 按日期排序
    nextMonthBills.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const totalAmount = nextMonthBills.reduce((sum, record) => sum + (record.amount || 0), 0);
    
    // 檢查是否已設定下月預算
    const budgetKey = `${nextMonthYear}-${nextMonthNum + 1}`;
    const nextMonthBudgets = JSON.parse(localStorage.getItem('nextMonthBudgets') || '{}');
    const hasSetBudget = nextMonthBudgets[budgetKey] && nextMonthBudgets[budgetKey][categoryName];
    const setBudgetAmount = hasSetBudget ? nextMonthBudgets[budgetKey][categoryName].amount : null;
    
    // 創建模態框
    const modal = document.createElement('div');
    modal.className = 'next-month-bills-modal';
    
    const panel = document.createElement('div');
    panel.className = 'next-month-bills-panel';
    
    const billsHtml = nextMonthBills.length === 0
        ? '<div class="next-month-bills-empty">沒有下月預約扣款</div>'
        : nextMonthBills.map(record => {
            const recordDate = new Date(record.date);
            const day = recordDate.getDate();
            const recordId = record.timestamp || record.id || '';
            const noteText = record.note && record.note !== '(下月帳單)' ? record.note.replace('(下月帳單)', '').trim() : '';
            return `
                <div class="next-month-bill-item" data-record-id="${recordId}">
                    <div class="next-month-bill-main">
                        <div class="next-month-bill-icon">💳</div>
                        <div class="next-month-bill-info">
                            <div class="next-month-bill-date">${nextMonthNum + 1}月${day}日</div>
                            <div class="next-month-bill-note ${noteText ? '' : 'is-empty'}">${noteText || '無備註'}</div>
                        </div>
                        <div class="next-month-bill-amount" data-record-id="${recordId}" title="點金額可刪除">NT$${(record.amount || 0).toLocaleString('zh-TW')}</div>
                    </div>
                </div>
            `;
        }).join('');
    
    panel.innerHTML = `
        <div class="next-month-bills-header">
            <div class="next-month-bills-header-bar">
                <div class="next-month-bills-title">
                    <span>📅</span>
                    <span>${nextMonthName}預約扣款</span>
                </div>
                <button class="next-month-close-btn" type="button">×</button>
            </div>
            ${hasSetBudget ? `
                <div class="next-month-budget-card">
                    <div class="label">
                        <span>✓</span>
                        <span>已設定下月預算</span>
                    </div>
                    <div class="value">NT$${setBudgetAmount.toLocaleString('zh-TW')}</div>
                    <div class="hint">將在 ${nextMonthName} 自動生效</div>
                </div>
            ` : ''}
            <button class="set-next-month-budget-btn" data-category="${categoryName}" data-next-month-year="${nextMonthYear}" data-next-month-num="${nextMonthNum}" data-total-amount="${totalAmount}" type="button">
                <span>💰</span>
                <span>${hasSetBudget ? '修改下月卡費預算' : '設定下月卡費預算'}</span>
            </button>
        </div>
        <div class="next-month-bills-list">
            <div class="next-month-bills-list-title">
                <span>📋</span>
                <span>扣款明細</span>
            </div>
            ${billsHtml}
        </div>
        <div class="next-month-bills-footer">
            <div class="next-month-bills-tip">
                <span>💡</span>
                <span>這些是您標記為「下月扣款」的卡費記錄，不會計入本月預算統計。</span>
            </div>
        </div>
    `;
    
    modal.appendChild(panel);
    document.body.appendChild(modal);
    
    const closeModal = () => {
        if (!document.body.contains(modal)) return;
        panel.classList.add('closing');
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 230);
    };
    
    // 綁定預算設定按鈕事件
    const setBudgetBtn = panel.querySelector('.set-next-month-budget-btn');
    if (setBudgetBtn) {
        setBudgetBtn.addEventListener('click', () => {
            const category = setBudgetBtn.dataset.category;
            const nextYear = parseInt(setBudgetBtn.dataset.nextMonthYear);
            const nextMonth = parseInt(setBudgetBtn.dataset.nextMonthNum);
            const currentTotal = parseFloat(setBudgetBtn.dataset.totalAmount);
            setNextMonthBudget(category, nextYear, nextMonth, currentTotal, modal);
        });
    }

    // 點擊項目：開啟詳細彈窗（彈窗內再提供編輯/刪除）
    panel.querySelectorAll('.next-month-bill-item[data-record-id]').forEach(item => {
        item.addEventListener('click', () => {
            const recordId = item.dataset.recordId;
            if (!recordId) return;
            showNextMonthBillDetail(recordId, categoryName, modal);
        });
    });

    // 點金額：直接開刪除彈窗（不顯示詳細）
    panel.querySelectorAll('.next-month-bill-amount[data-record-id]').forEach(amountEl => {
        amountEl.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const recordId = amountEl.dataset.recordId;
            if (!recordId) return;
            showNextMonthBillDeleteOnlyModal(recordId, categoryName, modal);
        });
    });
    
    // 關閉按鈕
    const closeBtn = panel.querySelector('.next-month-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // 點擊遮罩關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function renderNextMonthBillsPage(categoryName) {
    const container = document.getElementById('nextMonthBillsPageContent');
    if (!container) return;

    const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const now = new Date();
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthYear = nextMonthDate.getFullYear();
    const nextMonthNum = nextMonthDate.getMonth();
    const nextMonthName = `${nextMonthYear}年${nextMonthNum + 1}月`;

    const titleEl = document.getElementById('nextMonthBillsPageTitle');
    if (titleEl) titleEl.textContent = `${nextMonthName}預約扣款`;

    const nextMonthBills = records
        .filter(record => {
            if (record.category !== categoryName) return false;
            if (record.type !== 'expense' && record.type !== undefined) return false;
            const recordDate = new Date(record.date);
            return recordDate.getFullYear() === nextMonthYear &&
                   recordDate.getMonth() === nextMonthNum &&
                   record.isNextMonthBill === true;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalAmount = nextMonthBills.reduce((sum, r) => sum + (r.amount || 0), 0);

    if (!nextMonthBills.length) {
        container.innerHTML = '<div class="next-month-bills-empty">沒有下月預約扣款</div>';
        return;
    }

    const headerHtml = `
        <div class="nmb-hero" data-category="${categoryName}" data-next-year="${nextMonthYear}" data-next-month-num="${nextMonthNum}" data-total-amount="${totalAmount}">
            <div class="nmb-hero-top">
                <div class="nmb-hero-title">
                    <span class="nmb-hero-badge">${nextMonthName}</span>
                    <span class="nmb-hero-subtitle">${categoryName} 預約扣款</span>
                </div>
                <button class="nmb-hero-btn" type="button" data-action="refresh">重新整理</button>
            </div>

            <div class="nmb-hero-metrics">
                <div class="nmb-metric">
                    <div class="nmb-metric-label">合計</div>
                    <div class="nmb-metric-value">NT$${totalAmount.toLocaleString('zh-TW')}</div>
                </div>
                <div class="nmb-metric">
                    <div class="nmb-metric-label">筆數</div>
                    <div class="nmb-metric-value">${nextMonthBills.length}</div>
                </div>
            </div>

            <div class="nmb-hero-actions">
                ${categoryName === '卡費' ? '<button class="nmb-action" type="button" data-action="setBudget">設定卡費預算</button>' : ''}
                <button class="nmb-action nmb-action--secondary" type="button" data-action="back">返回</button>
            </div>
        </div>
        <div class="nmb-section-title">扣款明細</div>
    `;

    const billsHtml = nextMonthBills.map(record => {
        const recordDate = new Date(record.date);
        const day = recordDate.getDate();
        const recordId = record.timestamp || record.id || '';
        const noteText = record.note && record.note !== '(下月帳單)' ? record.note.replace('(下月帳單)', '').trim() : '';
        return `
            <div class="next-month-bill-item" data-record-id="${recordId}">
                <div class="next-month-bill-main">
                    <div class="next-month-bill-icon">💳</div>
                    <div class="next-month-bill-info">
                        <div class="next-month-bill-date">${nextMonthNum + 1}月${day}日</div>
                        <div class="next-month-bill-note ${noteText ? '' : 'is-empty'}">${noteText || '無備註'}</div>
                    </div>
                    <div class="next-month-bill-amount" data-record-id="${recordId}" title="點金額可刪除">NT$${(record.amount || 0).toLocaleString('zh-TW')}</div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = headerHtml + billsHtml;

    const hero = container.querySelector('.nmb-hero');
    if (hero) {
        const refreshBtn = hero.querySelector('[data-action="refresh"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                renderNextMonthBillsPage(categoryName);
            });
        }

        const backBtn = hero.querySelector('[data-action="back"]');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                closeNextMonthBillsPage();
            });
        }

        const setBudgetBtn = hero.querySelector('[data-action="setBudget"]');
        if (setBudgetBtn) {
            setBudgetBtn.addEventListener('click', () => {
                const nextYear = parseInt(hero.dataset.nextYear, 10);
                const nextMonth = parseInt(hero.dataset.nextMonthNum, 10);
                const currentTotal = parseFloat(hero.dataset.totalAmount);
                setNextMonthBudget(categoryName, nextYear, nextMonth, currentTotal, null);
            });
        }
    }

    // 點擊項目：開啟詳細彈窗（彈窗內再提供編輯/刪除）
    container.querySelectorAll('.next-month-bill-item[data-record-id]').forEach(item => {
        item.addEventListener('click', () => {
            const recordId = item.dataset.recordId;
            if (!recordId) return;
            showNextMonthBillDetail(recordId, categoryName, null);
        });
    });

    // 點金額：直接開刪除彈窗（不顯示詳細）
    container.querySelectorAll('.next-month-bill-amount[data-record-id]').forEach(amountEl => {
        amountEl.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const recordId = amountEl.dataset.recordId;
            if (!recordId) return;
            showNextMonthBillDeleteOnlyModal(recordId, categoryName, null);
        });
    });
}

function showNextMonthBillsPage(categoryName = '卡費', returnPageId = '') {
    const pageNextMonthBills = document.getElementById('pageNextMonthBills');
    if (!pageNextMonthBills) return;

    const pageDailyBudget = document.getElementById('pageDailyBudget');
    const pageBudget = document.getElementById('pageBudget');
    const pageSettings = document.getElementById('pageSettings');
    const pageLedger = document.getElementById('pageLedger');
    const pageChart = document.getElementById('pageChart');
    const pageInvestment = document.getElementById('pageInvestment');
    const pageInput = document.getElementById('pageInput');
    const inputSection = document.getElementById('inputSection');
    const bottomNav = document.querySelector('.bottom-nav');

    // 記錄返回頁面
    if (returnPageId) {
        window.nextMonthBillsReturnPageId = returnPageId;
    } else if (pageDailyBudget && pageDailyBudget.style.display !== 'none') {
        window.nextMonthBillsReturnPageId = 'pageDailyBudget';
    } else if (pageBudget && pageBudget.style.display !== 'none') {
        window.nextMonthBillsReturnPageId = 'pageBudget';
    } else {
        window.nextMonthBillsReturnPageId = 'pageLedger';
    }

    // 隱藏其他頁面
    if (pageInput) pageInput.style.display = 'none';
    if (pageLedger) pageLedger.style.display = 'none';
    if (inputSection) inputSection.style.display = 'none';
    if (pageChart) pageChart.style.display = 'none';
    if (pageBudget) pageBudget.style.display = 'none';
    if (pageSettings) pageSettings.style.display = 'none';
    if (pageInvestment) pageInvestment.style.display = 'none';
    if (pageDailyBudget) pageDailyBudget.style.display = 'none';

    pageNextMonthBills.style.display = 'block';
    if (bottomNav) bottomNav.style.display = 'none';

    window.nextMonthBillsPageCategoryName = categoryName;
    renderNextMonthBillsPage(categoryName);
}

function closeNextMonthBillsPage() {
    const pageNextMonthBills = document.getElementById('pageNextMonthBills');
    if (pageNextMonthBills) pageNextMonthBills.style.display = 'none';

    const returnId = window.nextMonthBillsReturnPageId || 'pageLedger';
    const returnEl = document.getElementById(returnId);
    if (returnEl) returnEl.style.display = 'block';

    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        // dailyBudget / nextMonthBills 頁面不顯示；其他主頁恢復底部導航
        const showNavIds = [
            'pageLedger',
            'pageChart',
            'pageBudget',
            'pageSettings',
            'pageInvestment',
            'pageWallet',
            'pageMonthlyPlanner'
        ];
        bottomNav.style.display = showNavIds.includes(returnId) ? 'flex' : 'none';
    }
}

function showNextMonthBillDetail(recordId, categoryName, parentModal) {
    const allRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const record = allRecords.find(r => (r.timestamp || r.id) === recordId);
    if (!record) {
        alert('找不到該記錄');
        return;
    }

    const recordDate = new Date(record.date);
    const noteText = record.note && record.note !== '(下月帳單)' ? record.note.replace('(下月帳單)', '').trim() : '';

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10006; display: flex; align-items: center; justify-content: center; padding: 16px;';

    modal.innerHTML = `
        <div class="modal-content-standard" style="width: 100%; max-width: 420px;">
            <div style="display:flex; align-items:center; justify-content: space-between; gap: 12px; margin-bottom: 12px;">
                <div style="font-size: 16px; font-weight: 700;">下月扣款明細</div>
                <button class="modal-close-btn" type="button" style="background:none;border:none;font-size:22px;cursor:pointer;">✕</button>
            </div>
            <div style="display:flex; flex-direction:column; gap: 10px;">
                <div><strong>日期：</strong>${recordDate.getFullYear()}年${recordDate.getMonth() + 1}月${recordDate.getDate()}日</div>
                <div><strong>分類：</strong>${record.category || ''}</div>
                <div><strong>金額：</strong>NT$${(record.amount || 0).toLocaleString('zh-TW')}</div>
                <div><strong>備註：</strong>${noteText || '無'}</div>
            </div>
            <div style="display:flex; gap: 12px; margin-top: 18px;">
                <button class="next-month-bill-btn next-month-bill-btn--edit" type="button" data-action="edit" style="flex: 1; justify-content: center;">✏️ 編輯</button>
                <button class="next-month-bill-btn next-month-bill-btn--delete" type="button" data-action="delete" style="flex: 1; justify-content: center;">🗑️ 刪除</button>
            </div>
        </div>
    `;

    const close = () => {
        if (document.body.contains(modal)) document.body.removeChild(modal);
    };

    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });

    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', close);

    const editBtn = modal.querySelector('[data-action="edit"]');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            close();
            editNextMonthBill(recordId, categoryName, parentModal);
        });
    }

    const deleteBtn = modal.querySelector('[data-action="delete"]');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            close();
            deleteNextMonthBill(recordId, categoryName, parentModal);
        });
    }

    document.body.appendChild(modal);
}

function showNextMonthBillDeleteOnlyModal(recordId, categoryName, parentModal) {
    const allRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const record = allRecords.find(r => (r.timestamp || r.id) === recordId);
    if (!record) {
        alert('找不到該記錄');
        return;
    }

    const recordDate = new Date(record.date);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10006; display: flex; align-items: center; justify-content: center; padding: 16px;';

    modal.innerHTML = `
        <div class="modal-content-standard" style="width: 100%; max-width: 420px;">
            <div style="display:flex; align-items:center; justify-content: space-between; gap: 12px; margin-bottom: 12px;">
                <div style="font-size: 16px; font-weight: 700;">刪除下月扣款？</div>
                <button class="modal-close-btn" type="button" style="background:none;border:none;font-size:22px;cursor:pointer;">✕</button>
            </div>
            <div style="display:flex; flex-direction:column; gap: 10px;">
                <div><strong>日期：</strong>${recordDate.getFullYear()}年${recordDate.getMonth() + 1}月${recordDate.getDate()}日</div>
                <div><strong>金額：</strong>NT$${(record.amount || 0).toLocaleString('zh-TW')}</div>
            </div>
            <div style="display:flex; gap: 12px; margin-top: 18px;">
                <button class="next-month-bill-btn" type="button" data-action="cancel" style="flex: 1; justify-content: center;">取消</button>
                <button class="next-month-bill-btn next-month-bill-btn--delete" type="button" data-action="delete" style="flex: 1; justify-content: center;">🗑️ 刪除</button>
            </div>
        </div>
    `;

    const close = () => {
        if (document.body.contains(modal)) document.body.removeChild(modal);
    };

    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });

    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', close);

    const cancelBtn = modal.querySelector('[data-action="cancel"]');
    if (cancelBtn) cancelBtn.addEventListener('click', close);

    const deleteBtn = modal.querySelector('[data-action="delete"]');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            close();
            deleteNextMonthBill(recordId, categoryName, parentModal);
        });
    }

    document.body.appendChild(modal);
}

// 編輯下月卡費記錄
function editNextMonthBill(recordId, categoryName, parentModal) {
    let allRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const recordIndex = allRecords.findIndex(r => (r.timestamp || r.id) === recordId);
    
    if (recordIndex === -1) {
        alert('找不到該記錄');
        return;
    }
    
    const record = allRecords[recordIndex];
    const recordDate = new Date(record.date);
    
    // 彈出編輯對話框
    const newAmount = prompt(
        `編輯下月卡費\n\n日期：${recordDate.getFullYear()}年${recordDate.getMonth() + 1}月${recordDate.getDate()}日\n目前金額：NT$${record.amount}\n\n請輸入新金額：`,
        record.amount
    );
    
    if (newAmount === null) return; // 取消編輯
    
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
        alert('請輸入有效金額');
        return;
    }
    
    // 詢問是否修改備註
    const currentNote = record.note && record.note !== '(下月帳單)' ? record.note.replace('(下月帳單)', '').trim() : '';
    const newNote = prompt(
        `編輯備註（選填）\n\n目前備註：${currentNote || '無'}\n\n請輸入新備註：`,
        currentNote
    );
    
    // 更新記錄
    allRecords[recordIndex].amount = amount;
    if (newNote !== null) {
        allRecords[recordIndex].note = newNote ? `(下月帳單) ${newNote}` : '(下月帳單)';
    }
    
    localStorage.setItem('accountingRecords', JSON.stringify(allRecords));
    
    // 更新顯示
    if (typeof updateAccountDisplay === 'function') {
        updateAccountDisplay();
    }
    if (typeof updateLedgerSummary === 'function') {
        updateLedgerSummary(allRecords);
    }
    if (typeof displayLedgerTransactions === 'function') {
        displayLedgerTransactions(allRecords);
    }
    if (typeof initDailyBudgetPage === 'function') {
        initDailyBudgetPage(categoryName);
    }
    
    // 重新整理顯示
    if (parentModal && document.body.contains(parentModal)) {
        document.body.removeChild(parentModal);
        showNextMonthBills(categoryName);
    } else {
        const pageNextMonthBills = document.getElementById('pageNextMonthBills');
        if (pageNextMonthBills && pageNextMonthBills.style.display !== 'none') {
            renderNextMonthBillsPage(categoryName);
        }
    }
    
    alert('編輯成功！');
}

// 刪除下月卡費記錄
function deleteNextMonthBill(recordId, categoryName, parentModal) {
    let allRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const recordIndex = allRecords.findIndex(r => (r.timestamp || r.id) === recordId);
    
    if (recordIndex === -1) {
        alert('找不到該記錄');
        return;
    }
    
    const record = allRecords[recordIndex];
    const recordDate = new Date(record.date);
    
    // 確認刪除
    if (!confirm(`確定要刪除此筆下月卡費嗎？\n\n日期：${recordDate.getFullYear()}年${recordDate.getMonth() + 1}月${recordDate.getDate()}日\n金額：NT$${record.amount.toLocaleString('zh-TW')}\n\n此操作無法復原。`)) {
        return;
    }
    
    // 刪除記錄
    allRecords.splice(recordIndex, 1);
    localStorage.setItem('accountingRecords', JSON.stringify(allRecords));
    
    // 更新顯示
    if (typeof updateAccountDisplay === 'function') {
        updateAccountDisplay();
    }
    if (typeof updateLedgerSummary === 'function') {
        updateLedgerSummary(allRecords);
    }
    if (typeof displayLedgerTransactions === 'function') {
        displayLedgerTransactions(allRecords);
    }
    if (typeof initDailyBudgetPage === 'function') {
        initDailyBudgetPage(categoryName);
    }
    
    if (parentModal && document.body.contains(parentModal)) {
        document.body.removeChild(parentModal);

        // 檢查是否還有下月記錄
        const remainingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
        const now = new Date();
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const hasNextMonthBills = remainingRecords.some(r => {
            if (r.category !== categoryName) return false;
            const rDate = new Date(r.date);
            return rDate.getFullYear() === nextMonthDate.getFullYear() && 
                   rDate.getMonth() === nextMonthDate.getMonth() &&
                   r.isNextMonthBill === true;
        });
        
        if (hasNextMonthBills) {
            showNextMonthBills(categoryName);
        }
    } else {
        const pageNextMonthBills = document.getElementById('pageNextMonthBills');
        if (pageNextMonthBills && pageNextMonthBills.style.display !== 'none') {
            renderNextMonthBillsPage(categoryName);
        }
    }
    
    alert('刪除成功！');
}

// 設定下月卡費預算
function setNextMonthBudget(categoryName, nextYear, nextMonth, currentTotal, parentModal) {
    const nextMonthName = `${nextYear}年${nextMonth + 1}月`;
    
    // 詢問用戶要設定的預算金額
    const budgetInput = prompt(
        `設定 ${nextMonthName} 的卡費預算\n\n目前已登記的扣款總額：NT$${currentTotal.toLocaleString('zh-TW')}\n\n請輸入您預計下個月的卡費預算：`,
        currentTotal
    );
    
    if (budgetInput === null) return; // 取消設定
    
    const budget = parseFloat(budgetInput);
    if (isNaN(budget) || budget <= 0) {
        alert('請輸入有效的預算金額');
        return;
    }
    
    // 確認設定
    const difference = budget - currentTotal;
    const differenceText = difference > 0 
        ? `超出已登記扣款 NT$${Math.abs(difference).toLocaleString('zh-TW')}` 
        : difference < 0 
        ? `低於已登記扣款 NT$${Math.abs(difference).toLocaleString('zh-TW')}` 
        : '與已登記扣款相同';
    
    if (!confirm(`確認設定 ${nextMonthName} 的卡費預算？\n\n預算金額：NT$${budget.toLocaleString('zh-TW')}\n已登記扣款：NT$${currentTotal.toLocaleString('zh-TW')}\n差額：${differenceText}\n\n此預算會在 ${nextMonthName} 自動生效。`)) {
        return;
    }
    
    // 獲取或創建下月預算資料
    let nextMonthBudgets = JSON.parse(localStorage.getItem('nextMonthBudgets') || '{}');
    const budgetKey = `${nextYear}-${nextMonth + 1}`;
    
    if (!nextMonthBudgets[budgetKey]) {
        nextMonthBudgets[budgetKey] = {};
    }
    
    nextMonthBudgets[budgetKey][categoryName] = {
        amount: budget,
        createdAt: new Date().toISOString(),
        createdFrom: 'nextMonthBills',
        year: nextYear,
        month: nextMonth + 1
    };
    
    localStorage.setItem('nextMonthBudgets', JSON.stringify(nextMonthBudgets));
    
    // 檢查是否已經到了下個月，如果是則立即套用
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (nextYear === currentYear && (nextMonth + 1) === currentMonth) {
        // 已經是下個月了，立即套用預算
        let categoryBudgets = JSON.parse(localStorage.getItem('categoryBudgets') || '{}');
        categoryBudgets[categoryName] = budget;
        localStorage.setItem('categoryBudgets', JSON.stringify(categoryBudgets));
        
        // 更新預算頁面顯示
        if (typeof initBudget === 'function') {
            initBudget();
        }
        
        alert(`設定成功！\n\n${nextMonthName} 的卡費預算已設定為 NT$${budget.toLocaleString('zh-TW')}\n\n由於已經是該月份，預算已立即生效！`);
    } else {
        alert(`設定成功！\n\n${nextMonthName} 的卡費預算已設定為 NT$${budget.toLocaleString('zh-TW')}\n\n預算會在 ${nextMonthName} 自動生效。`);
    }
    
    // 關閉並重新開啟視窗以更新顯示
    if (parentModal && document.body.contains(parentModal)) {
        document.body.removeChild(parentModal);
    }
    showNextMonthBills(categoryName);
}

// 自動套用下月預算（在月初時調用）
function applyNextMonthBudgets() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const budgetKey = `${currentYear}-${currentMonth}`;
    
    let nextMonthBudgets = JSON.parse(localStorage.getItem('nextMonthBudgets') || '{}');
    
    if (nextMonthBudgets[budgetKey]) {
        let categoryBudgets = JSON.parse(localStorage.getItem('categoryBudgets') || '{}');
        let hasChanges = false;
        
        for (const [categoryName, budgetInfo] of Object.entries(nextMonthBudgets[budgetKey])) {
            categoryBudgets[categoryName] = budgetInfo.amount;
            hasChanges = true;
        }
        
        if (hasChanges) {
            localStorage.setItem('categoryBudgets', JSON.stringify(categoryBudgets));
            
            // 清除已套用的下月預算
            delete nextMonthBudgets[budgetKey];
            localStorage.setItem('nextMonthBudgets', JSON.stringify(nextMonthBudgets));
            
            // 更新預算頁面顯示
            if (typeof initBudget === 'function') {
                initBudget();
            }
        }
    }
}

// 顯示新增預算對話框
function showAddBudgetDialog() {
    // 先載入自定義分類，確保 allCategories 包含最新分類
    loadCustomCategories();
    
    // 獲取所有啟用的分類（與記帳本保持一致）
    // 使用 getEnabledCategories(null) 獲取所有啟用的分類，不分類型
    let allAvailableCategories = getEnabledCategories(null);
    
    const budgets = JSON.parse(localStorage.getItem('categoryBudgets') || '{}');
    
    // 創建模態框
    const modal = document.createElement('div');
    modal.className = 'budget-category-modal';
    
    // 按類型分組分類
    const categoriesByType = {
        expense: allAvailableCategories.filter(cat => cat.type === 'expense'),
        income: allAvailableCategories.filter(cat => cat.type === 'income'),
        transfer: allAvailableCategories.filter(cat => cat.type === 'transfer')
    };
    
    let categoryListHtml = '';
    
    // 支出分類
    if (categoriesByType.expense.length > 0) {
        categoryListHtml += `
            <div class="budget-category-section">
                <div class="budget-category-section-title">💰 支出分類</div>
                <div class="budget-category-grid">
                    ${categoriesByType.expense.map(cat => {
                        const hasBudget = budgets.hasOwnProperty(cat.name);
                        const budgetAmount = hasBudget ? budgets[cat.name] : 0;
                        return `
                            <div class="budget-category-item ${hasBudget ? 'has-budget' : ''}" data-category-name="${cat.name}">
                                <div class="budget-category-icon">${cat.icon}</div>
                                <div class="budget-category-name">${cat.name}</div>
                                ${hasBudget ? `<div class="budget-category-budget">NT$${budgetAmount.toLocaleString('zh-TW')}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // 收入分類
    if (categoriesByType.income.length > 0) {
        categoryListHtml += `
            <div class="budget-category-section">
                <div class="budget-category-section-title">💵 收入分類</div>
                <div class="budget-category-grid">
                    ${categoriesByType.income.map(cat => {
                        const hasBudget = budgets.hasOwnProperty(cat.name);
                        const budgetAmount = hasBudget ? budgets[cat.name] : 0;
                        return `
                            <div class="budget-category-item ${hasBudget ? 'has-budget' : ''}" data-category-name="${cat.name}">
                                <div class="budget-category-icon">${cat.icon}</div>
                                <div class="budget-category-name">${cat.name}</div>
                                ${hasBudget ? `<div class="budget-category-budget">NT$${budgetAmount.toLocaleString('zh-TW')}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // 轉帳分類
    if (categoriesByType.transfer.length > 0) {
        categoryListHtml += `
            <div class="budget-category-section">
                <div class="budget-category-section-title">🔄 轉帳分類</div>
                <div class="budget-category-grid">
                    ${categoriesByType.transfer.map(cat => {
                        const hasBudget = budgets.hasOwnProperty(cat.name);
                        const budgetAmount = hasBudget ? budgets[cat.name] : 0;
                        return `
                            <div class="budget-category-item ${hasBudget ? 'has-budget' : ''}" data-category-name="${cat.name}">
                                <div class="budget-category-icon">${cat.icon}</div>
                                <div class="budget-category-name">${cat.name}</div>
                                ${hasBudget ? `<div class="budget-category-budget">NT$${budgetAmount.toLocaleString('zh-TW')}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div class="budget-category-modal-content modal-content-standard">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="font-size: 24px; font-weight: 600; color: var(--text-primary); margin: 0;">選擇分類設定預算</h2>
                <button class="budget-category-close-btn" style="background: none; border: none; font-size: 24px; color: var(--text-tertiary); cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;">✕</button>
            </div>
            
            <div style="margin-bottom: 16px; padding: 12px; background: var(--bg-light); border-radius: 12px; font-size: 14px; color: var(--text-secondary);">
                💡 點擊分類卡片即可設定或更新預算金額
            </div>
            
            <div class="budget-category-list" style="max-height: 60vh; overflow-y: auto;">
                ${categoryListHtml}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 綁定關閉按鈕
    const closeBtn = modal.querySelector('.budget-category-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        });
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'var(--bg-lighter)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'none';
        });
    }
    
    // 綁定分類點擊事件
    modal.querySelectorAll('.budget-category-item').forEach(item => {
        item.addEventListener('click', () => {
            const categoryName = item.dataset.categoryName;
            const selectedCategory = allAvailableCategories.find(cat => cat.name === categoryName);
            
            if (!selectedCategory) return;
            
            // 關閉分類選擇模態框
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            
            // 顯示預算設定對話框
            showBudgetSettingDialog(selectedCategory.name);
        });
    });
    
    // 點擊遮罩關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }
    });
}

// 初始化分類管理頁面
function initCategoryManagePage() {
    const categoryManageList = document.getElementById('categoryManageList');
    if (!categoryManageList) return;
    
    // 初始渲染（顯示所有分類，不分類型）
    renderCategoryManageList();
}

// 渲染分類管理列表（顯示所有分類，不分類型）
function renderCategoryManageList() {
    const categoryManageList = document.getElementById('categoryManageList');
    if (!categoryManageList) return;
    
    const state = getCategoryEnabledState();
    
    // 顯示所有分類，不分類型，統一顯示
    // 獲取自定義圖標
    const customIcons = JSON.parse(localStorage.getItem('categoryCustomIcons') || '{}');
    
    let html = '';
    
    // 顯示所有分類（只按名稱排序，不按類型分組）
    const sortedCategories = [...allCategories].sort((a, b) => {
        return a.name.localeCompare(b.name, 'zh-TW');
    });
    
    sortedCategories.forEach(category => {
        const isEnabled = state[category.name] === true;
        
        // 檢查是否有自定義圖片圖標
        const customIconValue = customIcons[category.name]?.value;
        const hasCustomIcon = customIcons[category.name] && customIcons[category.name].type === 'image' && isLikelyImageSrc(customIconValue);
        const iconDisplay = hasCustomIcon 
            ? `<img src="${customIconValue}" alt="${category.name}" class="category-manage-item-icon-image">`
            : category.icon;
        
        // 類型標籤圖標（小圖標）
        const typeIcon = category.type === 'expense' ? '📤' : category.type === 'income' ? '💰' : '🔄';
        const typeColor = category.type === 'expense' ? '#ff6b6b' : category.type === 'income' ? '#51cf66' : '#4dabf7';
        
        html += `
            <div class="category-manage-item" style="position: relative;">
                <div class="category-manage-item-icon">${iconDisplay}</div>
                <div class="category-manage-item-info">
                    <div class="category-manage-item-name">${category.name}</div>
                </div>
                <span class="category-type-badge" style="position: absolute; top: 8px; right: 8px; font-size: 10px; padding: 2px 4px; background: ${typeColor}20; border: 1px solid ${typeColor}50; border-radius: 6px; color: ${typeColor}; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; z-index: 5; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <span style="font-size: 10px;">${typeIcon}</span>
                </span>
                <div class="category-manage-item-actions">
                    <label class="category-manage-toggle ${isEnabled ? 'active' : ''}" data-category="${category.name}">
                        <input type="checkbox" ${isEnabled ? 'checked' : ''} style="display: none;">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        `;
    });
    
    categoryManageList.innerHTML = html;
    
    // 綁定開關事件 - 監聽 checkbox 的 change 事件
    categoryManageList.querySelectorAll('.category-manage-toggle input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation(); // 防止事件冒泡到父元素
            
            const toggle = checkbox.closest('.category-manage-toggle');
            const categoryName = toggle.dataset.category;
            
            // 獲取當前狀態
            const state = getCategoryEnabledState();
            const currentState = state[categoryName] !== false; // 默認為 true
            
            // 根據 checkbox 的狀態設置（checkbox 已經改變了狀態）
            const newState = checkbox.checked;
            
            // 如果狀態不一致，則更新
            if (currentState !== newState) {
                state[categoryName] = newState;
                saveCategoryEnabledState(state);
            }
            
            // 更新UI
            if (newState) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
            
            // 重新初始化分類網格（如果記帳輸入頁面可見）
            const pageInput = document.getElementById('pageInput');
            if (pageInput && pageInput.style.display !== 'none') {
                const activeTab = document.querySelector('.tab-btn.active');
                const tabType = activeTab ? activeTab.dataset.tab : 'recommended';
                initCategoryGrid(tabType, null); // 顯示所有分類
            }
        });
        
        // 同時阻止 label 的點擊事件冒泡
        const toggle = checkbox.closest('.category-manage-toggle');
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止事件冒泡到父元素
            });
        }
    });
}

// 注意：壓縮圖片和安全保存函數已移至 js/storage.js 模組

// 顯示新增分類對話框
function showAddCategoryDialog(type = 'expense') {
    // 創建模態框
    const modal = document.createElement('div');
    modal.className = 'category-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10005; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;';
    
    modal.innerHTML = `
        <div class="category-modal-content" style="background: white; border-radius: 16px; padding: 24px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3 style="margin: 0; font-size: 20px; font-weight: 600; color: #333;">新增分類</h3>
                <button class="modal-close-btn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">✕</button>
            </div>
            
            <div class="category-modal-field" style="margin-bottom: 20px;">
                <label class="category-modal-label" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #333;">分類類型</label>
                <div class="category-modal-type-select" style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="category-modal-type-option ${type === 'expense' ? 'active' : ''}" data-type="expense" style="flex: 1; padding: 12px; border: 2px solid ${type === 'expense' ? '#ffb6d9' : '#e0e0e0'}; border-radius: 12px; background: ${type === 'expense' ? '#fff5f9' : '#ffffff'}; color: ${type === 'expense' ? '#ff69b4' : '#666'}; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                        👤 支出
                    </button>
                    <button class="category-modal-type-option ${type === 'income' ? 'active' : ''}" data-type="income" style="flex: 1; padding: 12px; border: 2px solid ${type === 'income' ? '#ffb6d9' : '#e0e0e0'}; border-radius: 12px; background: ${type === 'income' ? '#fff5f9' : '#ffffff'}; color: ${type === 'income' ? '#ff69b4' : '#666'}; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                        💰 收入
                    </button>
                    <button class="category-modal-type-option ${type === 'transfer' ? 'active' : ''}" data-type="transfer" style="flex: 1; padding: 12px; border: 2px solid ${type === 'transfer' ? '#ffb6d9' : '#e0e0e0'}; border-radius: 12px; background: ${type === 'transfer' ? '#fff5f9' : '#ffffff'}; color: ${type === 'transfer' ? '#ff69b4' : '#666'}; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                        💳 轉帳
                    </button>
                </div>
            </div>
            
            <div class="category-modal-field" style="margin-bottom: 20px;">
                <label class="category-modal-label" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #333;">分類名稱</label>
                <input type="text" id="categoryNameInput" class="category-modal-input" placeholder="例如：早餐、交通費、獎金..." style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 12px; font-size: 16px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#ffb6d9'" onblur="this.style.borderColor='#e0e0e0'">
            </div>
            
            <div class="category-modal-field" style="margin-bottom: 24px;">
                <label class="category-modal-label" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #333;">分類圖標</label>
                
                <!-- 圖標預覽 -->
                <div id="iconPreview" style="width: 80px; height: 80px; border: 2px solid #e0e0e0; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 40px; background: #fafafa; margin: 0 auto 16px; overflow: hidden;">
                    📦
                </div>
                
                <!-- 快速選擇常用圖標 -->
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; color: #666; margin-bottom: 8px;">快速選擇</label>
                    <div id="quickIconGrid" style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; padding: 8px; background: #f8f8f8; border-radius: 8px; max-height: 120px; overflow-y: auto;">
                        <!-- 常用圖標將由 JavaScript 動態生成 -->
                    </div>
                </div>
                
                <!-- Emoji 輸入 -->
                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-size: 13px; color: #666; margin-bottom: 6px;">或輸入其他 Emoji</label>
                    <input type="text" id="categoryIconInput" class="category-modal-input" placeholder="例如：🍔 🚇 💰" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 12px; font-size: 20px; text-align: center; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#ffb6d9'" onblur="this.style.borderColor='#e0e0e0'">
                </div>
                
                            </div>
            
            <div class="category-modal-actions" style="display: flex; gap: 12px;">
                <button class="category-modal-btn secondary" id="cancelCategoryBtn" style="flex: 1; padding: 14px; border: 2px solid #e0e0e0; border-radius: 12px; background: #ffffff; color: #666; font-size: 16px; font-weight: 500; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='#ffffff'">
                    取消
                </button>
                <button class="category-modal-btn primary" id="saveCategoryBtn" style="flex: 1; padding: 14px; border: none; border-radius: 12px; background: linear-gradient(135deg, #ffb6d9 0%, #ff9ec7 100%); color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(255, 182, 217, 0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(255, 182, 217, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(255, 182, 217, 0.3)'">
                    儲存
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    let selectedType = type;
    
    // 常用圖標列表
    const commonIcons = {
        expense: [
            '🍔', '🧃', '🚇', '🏢', '💡', '🧹', '🎮', '🏥',
            '🎓', '🛍️', '👕', '💄', '⚽', '🏋️', '🎬', '🎵',
            '📚', '☕', '🍫', '⛽', '🅿️', '🛡️', '💳', '💰',
            '🎁', '🏖️', '🐾', '💇', '💅', '📱', '⚡', '🔥'
        ],
        income: [
            '💼', '🎁', '📈', '💵', '🏠', '💪', '🧧', '↩️',
            '💰', '🎊', '💹', '📝', '👔', '🎤', '✍️', '📋',
            '🛡️', '🎰', '📦', '💳', '⚖️', '🤝', '📄', '👨‍🏫',
            '🎨', '🌐', '📷', '📺', '🛒', '🛍️', '💴', '🏛️'
        ],
        transfer: [
            '🔄', '🏦', '💸', '💳', '💵', '📱', '💼', '📈',
            '🔀', '💱', '🏧', '💶', '💷', '💴', '🪙', '💲'
        ]
    };
    
    // 圖標預覽
    const iconInput = modal.querySelector('#categoryIconInput');
    const iconPreview = modal.querySelector('#iconPreview');
    const quickIconGrid = modal.querySelector('#quickIconGrid');
    
    // 渲染快速選擇圖標網格
    const renderQuickIcons = (type) => {
        const icons = commonIcons[type] || commonIcons.expense;
        console.log('渲染快速圖標，類型:', type, '數量:', icons.length);
        
        quickIconGrid.innerHTML = icons.map(icon => 
            `<button type="button" class="quick-icon-btn" data-icon="${icon}">${icon}</button>`
        ).join('');
        
        console.log('快速圖標渲染完成');
        
        // 綁定快速圖標點擊事件
        setTimeout(() => {
            const buttons = quickIconGrid.querySelectorAll('.quick-icon-btn');
            console.log('綁定快速圖標按鈕事件，數量:', buttons.length);
            
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const icon = btn.dataset.icon;
                    iconInput.value = icon;
                    iconPreview.textContent = icon;
                });
            });
            
            console.log('✓ 快速圖標按鈕事件綁定完成');
        }, 50);
    };
    
    // 類型選擇
    const typeOptions = modal.querySelectorAll('.category-modal-type-option');
    typeOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectedType = option.dataset.type;
            console.log('切換類型到:', selectedType);
            
            // 更新按鈕樣式
            typeOptions.forEach(opt => {
                opt.classList.remove('active');
                opt.style.borderColor = '#e0e0e0';
                opt.style.background = '#ffffff';
                opt.style.color = '#666';
            });
            option.classList.add('active');
            option.style.borderColor = '#ffb6d9';
            option.style.background = '#fff5f9';
            option.style.color = '#ff69b4';
            
            // 更新快速圖標
            renderQuickIcons(selectedType);
        });
    });
    
    // 初始渲染快速圖標
    renderQuickIcons(selectedType);
    
    iconInput.addEventListener('input', (e) => {
        const icon = firstGrapheme(e.target.value);
        e.target.value = icon;
        if (icon) {
            iconPreview.innerHTML = `<span style="font-size: 40px;">${icon}</span>`;
        } else {
            iconPreview.innerHTML = '<span style="font-size: 40px;">📦</span>';
        }
    });
    
        
        
    // 關閉按鈕
    const closeModal = () => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    };
    
    modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modal.querySelector('#cancelCategoryBtn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // 保存按鈕
    modal.querySelector('#saveCategoryBtn').addEventListener('click', async () => {
        const nameInput = modal.querySelector('#categoryNameInput');
        const iconInput = modal.querySelector('#categoryIconInput');
        
        const name = nameInput.value.trim();
        const icon = firstGrapheme(iconInput.value) || '📦';
        
        if (!name) {
            alert('請輸入分類名稱');
            nameInput.focus();
            return;
        }
        
        // 檢查是否已存在相同名稱和類型的分類
        const exists = allCategories.some(cat => cat.name === name && cat.type === selectedType);
        if (exists) {
            alert(`「${name}」分類已存在！`);
            nameInput.focus();
            return;
        }
        
        // 創建新分類
        const newCategory = {
            name: name,
            icon: icon,
            type: selectedType
        };
        
        console.log('📝 創建新分類:', newCategory);
        
        // 1. 保存到localStorage
        const savedCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
        savedCategories.push(newCategory);
        localStorage.setItem('customCategories', JSON.stringify(savedCategories));
        
        console.log('✓ 保存新分類到 localStorage:', newCategory);
        
        // 2. 添加到分類列表（記憶體中）
        allCategories.push(newCategory);
        console.log('✓ 添加到 allCategories，新總數:', allCategories.length);
        
        // 3. 設置新分類為啟用狀態
        const enabledState = getCategoryEnabledState();
        enabledState[name] = true;
        saveCategoryEnabledState(enabledState);
        console.log('✓ 設置新分類為啟用狀態');
        
        // 4. 關閉對話框
        closeModal();
        
        // 5. 重新渲染分類管理列表
        if (typeof renderCategoryManageList === 'function') {
            renderCategoryManageList();
        }
        
        // 6. 立即重新初始化分類網格（確保新分類立即顯示）
        const pageInput = document.getElementById('pageInput');
        if (pageInput && pageInput.style.display !== 'none') {
            console.log('✓ 記帳輸入頁面可見，立即更新分類網格');
            
            // 強制重新載入自定義分類
            loadCustomCategories();
            
            // 獲取當前的 tab
            const activeTab = document.querySelector('.tab-btn.active');
            const currentTabType = activeTab ? activeTab.dataset.tab : 'more';
            
            console.log('當前 tab:', currentTabType);
            
            // 重新初始化分類網格
            initCategoryGrid(currentTabType, null);
            
            console.log('✓ 分類網格已更新');
        } else {
            console.log('記帳輸入頁面未顯示，分類已保存，下次打開時會顯示');
        }
        
        // 顯示成功提示
        const successMsg = document.createElement('div');
        successMsg.innerHTML = `
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">✓ 分類新增成功！</div>
            <div style="font-size: 13px; opacity: 0.9;">
                ${name} (${selectedType === 'expense' ? '支出' : selectedType === 'income' ? '收入' : '轉帳'}) - Emoji圖標
            </div>
        `;
        successMsg.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 16px 24px; border-radius: 12px; z-index: 10006; text-align: center; box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);';
        document.body.appendChild(successMsg);
        setTimeout(() => {
            if (document.body.contains(successMsg)) {
                document.body.removeChild(successMsg);
            }
        }, 2500);
    });
    
    // 自動聚焦到名稱輸入框
    setTimeout(() => {
        modal.querySelector('#categoryNameInput').focus();
    }, 100);
}


// 初始化設置頁面
function initSettingsPage() {
    const settingsList = document.getElementById('settingsList');
    if (!settingsList) return;

    const settingsSections = [
        {
            title: '🎨 個人化設定',
            items: [
                {
                    icon: '🎨',
                    title: '主題',
                    description: '霓虹波動 / 日系 / 極光等主題',
                    action: 'theme',
                    accent: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
                    iconGradient: 'linear-gradient(135deg, #ff758c, #ff7eb3)'
                },
                {
                    icon: '🔤',
                    title: '字體',
                    description: '調整字級與閱讀體驗',
                    action: 'fontSize',
                    accent: 'linear-gradient(135deg, #84fab0, #8fd3f4)',
                    iconGradient: 'linear-gradient(135deg, #96fbc4, #f9f586)'
                },
                            ]
        },
        {
            title: '☁️ 雲端同步',
            items: [
                { icon: '☁️', title: '雲端備份（完整）', description: '一鍵備份所有資料', action: 'cloudBackupFull', accent: 'linear-gradient(135deg, #43e97b, #38f9d7)', iconGradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
                { icon: '☁️', title: '雲端還原（完整）', description: '從雲端還原備份', action: 'cloudRestoreFull', accent: 'linear-gradient(135deg, #fa709a, #fee140)', iconGradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
                { icon: '🔗', title: 'Sheet 網址', description: '設定 Google Sheet Web App', action: 'setGoogleSheetUploadUrl', accent: 'linear-gradient(135deg, #5ee7df, #b490ca)', iconGradient: 'linear-gradient(135deg, #5ee7df, #b490ca)' },
                { icon: '🔑', title: '雲端備份碼', description: '設定雲端還原安全碼', action: 'setGoogleCloudBackupKey', accent: 'linear-gradient(135deg, #4facfe, #00f2fe)', iconGradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
                { icon: '🧾', title: '上傳明細', description: '同步所有記錄明細', action: 'uploadAllRecordsDetailsToGoogleSheet', accent: 'linear-gradient(135deg, #30cfd0, #330867)', iconGradient: 'linear-gradient(135deg, #30cfd0, #330867)' },
                { icon: '🧮', title: '按帳戶備份', description: '依帳戶上傳資料', action: 'uploadRecordsByAccountToGoogleSheet', accent: 'linear-gradient(135deg, #f6d365, #fda085)', iconGradient: 'linear-gradient(135deg, #f6d365, #fda085)' },
                { icon: '📊', title: '上傳加總', description: '同步收支分類加總', action: 'uploadIncomeExpenseCategorySummaryToGoogleSheet', accent: 'linear-gradient(135deg, #89f7fe, #66a6ff)', iconGradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)' }
            ]
        },
        {
            title: '💾 本機備份',
            items: [
                { icon: '💾', title: '備份', description: '匯出本機資料檔', action: 'backup', accent: 'linear-gradient(135deg, #fddb92, #d1fdff)', iconGradient: 'linear-gradient(135deg, #fddb92, #d1fdff)' },
                { icon: '📥', title: '還原', description: '從本機檔案還原', action: 'restore', accent: 'linear-gradient(135deg, #fcb69f, #ffecd2)', iconGradient: 'linear-gradient(135deg, #fcb69f, #ffecd2)' }
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
                { icon: '👨‍💻', title: '關於', description: '創作者與版本資訊', action: 'creator', accent: 'linear-gradient(135deg, #d299c2, #fef9d7)', iconGradient: 'linear-gradient(135deg, #d299c2, #fef9d7)' }
            ]
        }
    ];

    const sectionHTML = settingsSections.map(section => {
        const itemsHtml = section.items.map(item => {
            const accentStyle = item.accent ? `style="background:${item.accent};"` : '';
            const iconStyle = item.iconGradient ? `style="background:${item.iconGradient};"` : '';
            const iconContent = item.image
                ? `<img src="${item.image}" alt="${item.title}">`
                : `<span>${item.icon || ''}</span>`;
            
            // 為刪除功能添加特殊樣式
            const isDeleteAction = item.action === 'deleteAllData';
            const deleteClass = isDeleteAction ? ' delete-warning' : '';
            const deleteWarning = isDeleteAction ? '<span class="settings-item-warning">⚠️ 此操作無法復原</span>' : '';
            
            return `
                <div class="settings-item${deleteClass}" data-action="${item.action}">
                    <div class="settings-item-accent" ${accentStyle}></div>
                    <div class="settings-item-icon" ${iconStyle} ${isDeleteAction ? 'style="background: linear-gradient(135deg, #dc3545, #ff6b6b); border: 2px solid #dc3545; animation: pulse 2s infinite;"' : ''}>
                        ${iconContent}
                    </div>
                    <div class="settings-item-text-group">
                        <span class="settings-item-text" ${isDeleteAction ? 'style="color: #dc3545;"' : ''}>${item.title}</span>
                        ${item.description ? `<span class="settings-item-subtext">${item.description}</span>` : ''}
                        ${deleteWarning}
                    </div>
                    <span class="settings-item-arrow">›</span>
                </div>
            `;
        }).join('');

        return `
            <div class="settings-section">
                ${section.title ? `<div class="settings-section-title">${section.title}</div>` : ''}
                <div class="settings-section-items">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }).join('');

    settingsList.innerHTML = sectionHTML;

    // 綁定點擊事件
    document.querySelectorAll('.settings-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            if (action === 'uploadAllData') {
                uploadAllDataToGoogleSheet();
            } else if (action === 'deleteAllData') {
                deleteAllDataFromGoogleSheet();
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

// 顯示想買的東西/存錢目標頁面
function showWishlistSavingsPage() {
    document.getElementById('pageSettings').style.display = 'none';
    document.getElementById('pageWishlistSavings').style.display = 'block';
    
    // 重新渲染列表
    switchTab(wishlistSavingsManager.currentTab || 'wishlist');
}

function getInstallmentRules() {
    return JSON.parse(localStorage.getItem('installmentRules') || '[]');
}

function setInstallmentRules(rules) {
    localStorage.setItem('installmentRules', JSON.stringify(rules));
}

function normalizeMonthKey(monthKey) {
    if (!monthKey) return '';
    const m = String(monthKey).trim();
    if (/^\d{4}-\d{2}$/.test(m)) return m;
    if (/^\d{4}\/\d{2}$/.test(m)) return m.replace('/', '-');
    return m;
}

function getInstallmentPaidPeriods(ruleId) {
    const allRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    const set = new Set();
    allRecords.forEach(r => {
        if (r && r.installmentRuleId === ruleId && Number.isFinite(r.installmentPeriodNumber)) {
            set.add(Number(r.installmentPeriodNumber));
        }
    });
    return set.size;
}

function showInstallmentManagementPage() {
    const pageSettings = document.getElementById('pageSettings');
    const page = document.getElementById('installmentManagementPage');
    const setup = document.getElementById('installmentSetupPage');
    const bottomNav = document.querySelector('.bottom-nav');
    if (pageSettings) pageSettings.style.display = 'none';
    if (setup) setup.style.display = 'none';
    if (page) page.style.display = 'block';
    if (bottomNav) bottomNav.style.display = 'none';
    updateInstallmentList();
}

function showSettingsPage() {
    const pageSettings = document.getElementById('pageSettings');
    const installmentManagementPage = document.getElementById('installmentManagementPage');
    const installmentSetupPage = document.getElementById('installmentSetupPage');
    const bottomNav = document.querySelector('.bottom-nav');

    if (installmentManagementPage) installmentManagementPage.style.display = 'none';
    if (installmentSetupPage) installmentSetupPage.style.display = 'none';
    if (pageSettings) pageSettings.style.display = 'block';
    if (bottomNav) bottomNav.style.display = 'flex';
    if (typeof initSettingsPage === 'function') {
        initSettingsPage();
    }
}

function updateInstallmentPerPeriodPreview() {
    const totalAmount = parseFloat(document.getElementById('installmentTotalAmountInput')?.value) || 0;
    const totalPeriods = parseInt(document.getElementById('installmentTotalPeriodsInput')?.value, 10) || 0;
    const previewEl = document.getElementById('installmentPerPeriodAmountInput');
    if (!previewEl) return;
    if (totalAmount > 0 && totalPeriods > 0) {
        previewEl.value = Math.round(totalAmount / totalPeriods);
    } else {
        previewEl.value = '';
    }
}

function showInstallmentSetupPage(ruleId = null, mode = 'edit') {
    const page = document.getElementById('installmentSetupPage');
    const management = document.getElementById('installmentManagementPage');
    const titleEl = document.getElementById('installmentSetupTitle');
    const voidBtn = document.getElementById('installmentVoidBtn');
    const reviseBtn = document.getElementById('installmentReviseBtn');

    if (management) management.style.display = 'none';
    if (page) page.style.display = 'block';

    window.editingInstallmentRuleId = null;
    window.revisingInstallmentRuleId = null;

    const setForm = (rule) => {
        const nameEl = document.getElementById('installmentNameInput');
        const catEl = document.getElementById('installmentCategoryInput');
        const totalAmountEl = document.getElementById('installmentTotalAmountInput');
        const totalPeriodsEl = document.getElementById('installmentTotalPeriodsInput');
        const dayEl = document.getElementById('installmentDayInput');
        const startMonthEl = document.getElementById('installmentStartMonthInput');
        const enabledEl = document.getElementById('installmentEnabledInput');

        if (nameEl) nameEl.value = rule?.name || '';
        if (catEl) catEl.value = rule?.category || '';
        if (totalAmountEl) totalAmountEl.value = rule?.totalAmount ?? '';
        if (totalPeriodsEl) totalPeriodsEl.value = rule?.totalPeriods ?? '';
        if (dayEl) dayEl.value = rule?.day ?? 1;
        if (startMonthEl) startMonthEl.value = rule?.startMonthKey || '';
        if (enabledEl) enabledEl.checked = !!(rule?.enabled ?? true);

        updateInstallmentPerPeriodPreview();
    };

    if (!ruleId) {
        if (titleEl) titleEl.textContent = '新增分期規則';
        if (voidBtn) voidBtn.style.display = 'none';
        if (reviseBtn) reviseBtn.style.display = 'none';
        setForm({ day: 1, enabled: true });
        return;
    }

    const rules = getInstallmentRules();
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) {
        if (titleEl) titleEl.textContent = '新增分期規則';
        if (voidBtn) voidBtn.style.display = 'none';
        if (reviseBtn) reviseBtn.style.display = 'none';
        setForm({ day: 1, enabled: true });
        return;
    }

    if (mode === 'revise') {
        window.revisingInstallmentRuleId = ruleId;
        if (titleEl) titleEl.textContent = '修正分期';
        if (voidBtn) voidBtn.style.display = 'none';
        if (reviseBtn) reviseBtn.style.display = 'none';
        setForm(rule);
        return;
    }

    window.editingInstallmentRuleId = ruleId;
    if (titleEl) titleEl.textContent = '編輯分期規則';
    if (voidBtn) voidBtn.style.display = 'inline-flex';
    if (reviseBtn) reviseBtn.style.display = 'inline-flex';
    setForm(rule);
}

function saveInstallmentRule() {
    const name = document.getElementById('installmentNameInput')?.value?.trim() || '';
    const category = document.getElementById('installmentCategoryInput')?.value?.trim() || '';
    const totalAmount = parseFloat(document.getElementById('installmentTotalAmountInput')?.value) || 0;
    const totalPeriods = parseInt(document.getElementById('installmentTotalPeriodsInput')?.value, 10) || 0;
    const day = parseInt(document.getElementById('installmentDayInput')?.value, 10) || 0;
    const startMonthKey = normalizeMonthKey(document.getElementById('installmentStartMonthInput')?.value || '');
    const enabled = !!document.getElementById('installmentEnabledInput')?.checked;

    if (!name || !category || !totalAmount || !totalPeriods || !day || !startMonthKey) {
        alert('請填寫所有必填欄位');
        return;
    }
    if (totalAmount <= 0) {
        alert('總金額必須大於 0');
        return;
    }
    if (totalPeriods <= 0) {
        alert('期數必須大於 0');
        return;
    }
    if (day < 1 || day > 28) {
        alert('扣款日期必須在 1-28 號之間');
        return;
    }
    if (!/^\d{4}-\d{2}$/.test(startMonthKey)) {
        alert('起始月份格式錯誤，請選擇月份（例如 2025-01）');
        return;
    }

    const perPeriodAmount = Math.round(totalAmount / totalPeriods);
    const nowIso = new Date().toISOString();
    let rules = getInstallmentRules();

    if (window.revisingInstallmentRuleId) {
        const oldId = window.revisingInstallmentRuleId;
        const oldRule = rules.find(r => r.id === oldId);
        const carriedPaidPeriods = oldRule
            ? Math.min(parseInt(oldRule.totalPeriods, 10) || 0, (parseInt(oldRule.carriedPaidPeriods, 10) || 0) + getInstallmentPaidPeriods(oldId))
            : 0;

        // 舊規則標記為已修正
        rules = rules.map(r => r.id === oldId ? { ...r, enabled: false, status: 'revised', revisedAt: nowIso } : r);

        const newRule = {
            id: Date.now().toString(),
            name,
            category,
            totalAmount,
            totalPeriods,
            perPeriodAmount,
            day,
            startMonthKey,
            enabled,
            status: 'active',
            createdAt: nowIso,
            revisedFromRuleId: oldId,
            carriedPaidPeriods
        };
        rules.push(newRule);
        setInstallmentRules(rules);
        window.revisingInstallmentRuleId = null;
        showInstallmentManagementPage();
        checkAndGenerateInstallments();
        return;
    }

    if (window.editingInstallmentRuleId) {
        const id = window.editingInstallmentRuleId;
        const idx = rules.findIndex(r => r.id === id);
        if (idx !== -1) {
            rules[idx] = {
                ...rules[idx],
                name,
                category,
                totalAmount,
                totalPeriods,
                perPeriodAmount,
                day,
                startMonthKey,
                enabled,
                status: enabled ? 'active' : 'inactive',
                updatedAt: nowIso
            };
        }
    } else {
        const newRule = {
            id: Date.now().toString(),
            name,
            category,
            totalAmount,
            totalPeriods,
            perPeriodAmount,
            day,
            startMonthKey,
            enabled,
            status: 'active',
            createdAt: nowIso,
            carriedPaidPeriods: 0
        };
        rules.push(newRule);
    }

    setInstallmentRules(rules);
    showInstallmentManagementPage();
    checkAndGenerateInstallments();
}

function deleteInstallmentRule(ruleId) {
    if (!ruleId) return;
    if (!confirm('確定要刪除此分期規則嗎？\n\n刪除後不會再自動產生記帳。\n\n已經產生的記帳紀錄將保留。')) return;
    const rules = getInstallmentRules().filter(r => r.id !== ruleId);
    setInstallmentRules(rules);
    showInstallmentManagementPage();
}

function reviseInstallmentRule(ruleId) {
    if (!ruleId) return;
    showInstallmentSetupPage(ruleId, 'revise');
}

function updateInstallmentList() {
    const container = document.getElementById('installmentListContainer');
    if (!container) return;

    const rules = getInstallmentRules();
    if (rules.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🧾</div>
                <div class="empty-text">尚無分期規則</div>
                <div class="empty-hint">點擊右上角「➕」新增分期規則</div>
            </div>
        `;
        return;
    }

    const sorted = [...rules].sort((a, b) => {
        const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
    });

    let html = '';
    sorted.forEach(rule => {
        const enabled = !!rule.enabled && rule.status !== 'revised';
        const statusText = enabled ? '啟用中' : (rule.status === 'revised' ? '已修正' : '已停用');
        const statusClass = enabled ? 'active' : 'inactive';

        const carried = parseInt(rule.carriedPaidPeriods, 10) || 0;
        const paidGenerated = getInstallmentPaidPeriods(rule.id);
        const paid = Math.min((parseInt(rule.totalPeriods, 10) || 0), carried + paidGenerated);
        const totalPeriods = parseInt(rule.totalPeriods, 10) || 0;
        const remainingPeriods = Math.max(0, totalPeriods - paid);

        const perAmount = parseFloat(rule.perPeriodAmount) || 0;
        const paidAmount = Math.max(0, Math.round(paid * perAmount));
        const totalAmount = parseFloat(rule.totalAmount) || 0;
        const remainingAmount = Math.max(0, Math.round(totalAmount - paidAmount));

        html += `
            <div class="dca-item-card">
                <div class="dca-item-header">
                    <div class="dca-item-icon">🧾</div>
                    <div class="dca-item-info">
                        <div class="dca-item-name">${rule.name || '未命名分期'}</div>
                        <div class="dca-item-code">${rule.category || '未分類'}</div>
                    </div>
                    <div class="dca-item-status ${statusClass}">${statusText}</div>
                </div>
                <div class="dca-item-body">
                    <div class="dca-item-row">
                        <span class="dca-item-label">每期金額</span>
                        <span class="dca-item-value">NT$${Math.round(perAmount).toLocaleString('zh-TW')}</span>
                    </div>
                    <div class="dca-item-row">
                        <span class="dca-item-label">扣款日期</span>
                        <span class="dca-item-value">每月 ${rule.day} 號</span>
                    </div>
                    <div class="dca-item-row">
                        <span class="dca-item-label">起始月份</span>
                        <span class="dca-item-value">${rule.startMonthKey || '-'}</span>
                    </div>
                    <div class="dca-progress">
                        <div class="dca-progress-header">
                            <span class="dca-progress-text">已繳：第 ${paid} 期 / ${totalPeriods} 期（剩餘 ${remainingPeriods} 期）</span>
                        </div>
                        <div class="dca-progress-bar" aria-label="分期進度條">
                            <div class="dca-progress-fill" style="width: ${totalPeriods > 0 ? Math.min(100, Math.round((paid / totalPeriods) * 100)) : 0}%"></div>
                        </div>
                        <div style="margin-top: 8px; display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary);">
                            <span>已繳 NT$${paidAmount.toLocaleString('zh-TW')}</span>
                            <span>剩餘 NT$${remainingAmount.toLocaleString('zh-TW')}</span>
                        </div>
                    </div>
                </div>
                <div class="dca-item-actions">
                    <button class="dca-edit-btn" onclick="editInstallmentRule('${rule.id}')">編輯</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function editInstallmentRule(ruleId) {
    showInstallmentSetupPage(ruleId, 'edit');
}

function monthKeyFromDate(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

function parseMonthKeyToDate(monthKey) {
    const mk = normalizeMonthKey(monthKey);
    if (!/^\d{4}-\d{2}$/.test(mk)) return null;
    const [y, m] = mk.split('-').map(Number);
    return new Date(y, m - 1, 1);
}

function addMonthsToMonthKey(monthKey, delta) {
    const d = parseMonthKeyToDate(monthKey);
    if (!d) return monthKey;
    d.setMonth(d.getMonth() + delta);
    return monthKeyFromDate(d);
}

function checkAndGenerateInstallments() {
    try {
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonthKey = monthKeyFromDate(today);

        const rules = getInstallmentRules();
        if (!rules.length) return;

        let accountingRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');

        const existingIndex = new Set();
        accountingRecords.forEach(r => {
            if (r && r.installmentRuleId && Number.isFinite(r.installmentPeriodNumber)) {
                existingIndex.add(`${r.installmentRuleId}#${Number(r.installmentPeriodNumber)}`);
            }
        });

        let mutated = false;

        rules.forEach(rule => {
            const enabled = !!rule.enabled && rule.status !== 'revised';
            if (!enabled) return;

            const totalPeriods = parseInt(rule.totalPeriods, 10) || 0;
            if (totalPeriods <= 0) return;

            const day = parseInt(rule.day, 10) || 1;
            if (day < 1 || day > 28) return;

            const perAmount = parseFloat(rule.perPeriodAmount) || 0;
            if (perAmount <= 0) return;

            const carried = parseInt(rule.carriedPaidPeriods, 10) || 0;
            const startMonthKey = normalizeMonthKey(rule.startMonthKey);
            if (!/^\d{4}-\d{2}$/.test(startMonthKey)) return;

            const startDate = parseMonthKeyToDate(startMonthKey);
            if (!startDate) return;

            const paidGenerated = getInstallmentPaidPeriods(rule.id);
            const alreadyPaid = Math.min(totalPeriods, carried + paidGenerated);
            if (alreadyPaid >= totalPeriods) return;

            for (let periodNumber = alreadyPaid + 1; periodNumber <= totalPeriods; periodNumber++) {
                const monthIndex = periodNumber - carried - 1;
                if (monthIndex < 0) continue;
                const dueMonthKey = addMonthsToMonthKey(startMonthKey, monthIndex);

                const isDueMonthPast = dueMonthKey < currentMonthKey;
                const isDueMonthNow = dueMonthKey === currentMonthKey;
                const dueReached = isDueMonthPast || (isDueMonthNow && currentDay >= day);
                if (!dueReached) break;

                const idxKey = `${rule.id}#${periodNumber}`;
                if (existingIndex.has(idxKey)) continue;

                const dueDateObj = parseMonthKeyToDate(dueMonthKey);
                if (!dueDateObj) continue;
                const dueDate = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), day);
                const dueDateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;

                const record = {
                    type: 'expense',
                    category: rule.category || '未分類',
                    amount: Math.round(perAmount),
                    note: `${rule.name || '分期'}：第 ${periodNumber} 期 / ${totalPeriods} 期`,
                    date: dueDateStr,
                    timestamp: new Date().toISOString(),
                    installmentRuleId: rule.id,
                    installmentPeriodNumber: periodNumber,
                    installmentDueMonthKey: dueMonthKey
                };

                accountingRecords.push(record);
                existingIndex.add(idxKey);
                mutated = true;
            }
        });

        if (mutated) {
            localStorage.setItem('accountingRecords', JSON.stringify(accountingRecords));
            const ledgerPage = document.getElementById('pageLedger');
            if (ledgerPage && ledgerPage.style.display !== 'none' && typeof initLedger === 'function') {
                initLedger();
            }
        }
    } catch (e) {
        console.error('checkAndGenerateInstallments failed', e);
    }
}

