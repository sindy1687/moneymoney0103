// ========== 理財顧問小森 - 對話系統 ==========

// 理財顧問對話數據
let advisorDialogs = null;

const ADVISOR_CHAT_HISTORY_KEY = 'advisor_chat_history_v1';
const ADVISOR_CHAT_HISTORY_LIMIT = 80;

function getAdvisorChatHistory() {
    try {
        const raw = localStorage.getItem(ADVISOR_CHAT_HISTORY_KEY);
        const parsed = JSON.parse(raw || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function setAdvisorChatHistory(history) {
    try {
        const safe = Array.isArray(history) ? history.slice(-ADVISOR_CHAT_HISTORY_LIMIT) : [];
        localStorage.setItem(ADVISOR_CHAT_HISTORY_KEY, JSON.stringify(safe));
    } catch (e) {
        // ignore
    }
}

function pushAdvisorChatHistoryItem(item) {
    const history = getAdvisorChatHistory();
    history.push(item);
    setAdvisorChatHistory(history);
}

function clearAdvisorChatHistory() {
    try {
        localStorage.removeItem(ADVISOR_CHAT_HISTORY_KEY);
    } catch (e) {
        // ignore
    }
}

function scrollChatToBottom(container) {
    if (!container) return;
    container.scrollTop = container.scrollHeight;
}
async function loadAdvisorDialogs() {
    try {
        const response = await fetch('js/advisor-dialogs.json');
        advisorDialogs = await response.json();
    } catch (error) {
        console.error('載入理財顧問對話數據失敗', error);
        // 使用預設對話數據
        advisorDialogs = {
            advisor_profile: {
                id: "mori",
                name: "小森",
                tone: "calm_warm",
                principles: ["no_judgement", "fact_based", "user_respect"]
            },
            dialogs: {
                daily_open_normal: ["今天也一起把帳記好，我會幫你看收支。"],
                entry_small: ["已記錄這筆支出。"],
                entry_medium: ["這筆金額我幫你記下來了。"],
                entry_large: ["這筆支出偏大，記得留意預算喔。"],
                budget_80: ["這個分類已接近預算上限（80%）。"],
                budget_over: ["這個分類已超過預算，建議調整支出。"],
                income_normal: ["收入已登記完成。"],
                income_dividend: ["股息收入已記錄，做得很好。"],
                monthly_good: ["這個月的支出控制得不錯。"],
                monthly_high: ["本月支出比上月高，建議檢視主要分類。"],
                no_entry_today: ["今天還沒有記帳記錄。"]
            }
        };
    }
}

function markDialogKeyAsUsed(dialogKey) {
    const today = new Date().toISOString().split('T')[0];
    const key = `advisor_dialogs_${today}`;
    const used = getTodayUsedDialogKeys();
    if (!used.includes(dialogKey)) {
        used.push(dialogKey);
        localStorage.setItem(key, JSON.stringify(used));
    }
}

// 獲取隨機對話
function getRandomDialog(dialogKey) {
    if (!advisorDialogs || !advisorDialogs.dialogs || !advisorDialogs.dialogs[dialogKey]) {
        return null;
    }
    
    const messages = advisorDialogs.dialogs[dialogKey];
    if (messages.length === 0) return null;
    
    return messages[Math.floor(Math.random() * messages.length)];
}
function showMoriDialog(message) {
    if (!message) return;
    
    // 創建對話框元素
    const dialogBox = document.createElement('div');
    dialogBox.className = 'mori-dialog-box';
    dialogBox.innerHTML = `
        <div class="mori-dialog-content">
            <div class="mori-avatar">
                <img src="./image/7.png" alt="小森" class="mori-avatar-image" onerror="this.style.display='none'; this.parentElement.innerHTML='🤖';">
            </div>
            <div class="mori-message">${message}</div>
        </div>
    `;
    
    document.body.appendChild(dialogBox);
    
    // 添加淡入動畫效果
    setTimeout(() => {
        dialogBox.style.opacity = '1';
    }, 10);
    
    // 3秒後自動隱藏對話框
    setTimeout(() => {
        if (document.body.contains(dialogBox)) {
            dialogBox.style.opacity = '0';
            dialogBox.style.transform = 'translateX(-50%) translateY(10px) scale(0.95)';
            dialogBox.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 1, 1)';
            setTimeout(() => {
                if (document.body.contains(dialogBox)) {
                    document.body.removeChild(dialogBox);
                }
            }, 300);
        }
    }, 3000);
}

// 檢查並觸發小森對話 - 根據記帳記錄顯示相應對話
function checkAndTriggerMoriDialog(record) {
    if (!advisorDialogs) {
        loadAdvisorDialogs().then(() => {
            checkAndTriggerMoriDialog(record);
        });
        return;
    }
    
    // 從 localStorage 獲取所有記帳記錄
    const allRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    
    const usedKeys = getTodayUsedDialogKeys();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // 計算本月支出
    const monthlyExpenses = allRecords.filter(r => {
        const recordDate = new Date(r.date);
        return (r.type === 'expense' || !r.type) && 
               recordDate.getMonth() === now.getMonth() && 
               recordDate.getFullYear() === now.getFullYear();
    });
    
    const totalExpense = monthlyExpenses.reduce((sum, r) => sum + (r.amount || 0), 0);
    const avgExpense = monthlyExpenses.length > 0 ? totalExpense / monthlyExpenses.length : 0;
    
    // 1. 收入類型對話
    if (record.type === 'income') {
        // 檢查是否為股息收入
        if (record.category && (record.category.includes('股息') || record.category.includes('利息') || record.category.includes('配息'))) {
            if (!usedKeys.includes('income_dividend')) {
                const message = getRandomDialog('income_dividend');
                if (message) {
                    showMoriDialog(message);
                    markDialogKeyAsUsed('income_dividend');
                    return;
                }
            }
        } else {
            if (!usedKeys.includes('income_normal')) {
                const message = getRandomDialog('income_normal');
                if (message) {
                    showMoriDialog(message);
                    markDialogKeyAsUsed('income_normal');
                    return;
                }
            }
        }
    }
    
    // 2. ??穿?鞈???摨??僕?謍??選?銋???
    if (record.type === 'expense' || !record.type) {
        const amount = record.amount || 0;
        
        // ?潘撓貔???????        const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
        const categoryBudget = budgets.find(b => b.category === record.category);
        
        if (categoryBudget) {
            const categoryExpenses = monthlyExpenses
                .filter(r => (r.category || '?????) === record.category)
                .reduce((sum, r) => sum + (r.amount || 0), 0);
            
            const percentage = (categoryExpenses / categoryBudget.amount) * 100;
            
            // ??????
            if (percentage >= 100 && !usedKeys.includes('budget_over')) {
                const message = getRandomDialog('budget_over');
                if (message) {
                    showMoriDialog(message);
                    markDialogKeyAsUsed('budget_over');
                    return;
                }
            }
            
            // ????鈭????
            if (percentage >= 80 && percentage < 100 && !usedKeys.includes('budget_80')) {
                const message = getRandomDialog('budget_80');
                if (message) {
                    showMoriDialog(message);
                    markDialogKeyAsUsed('budget_80');
                    return;
                }
            }
        }
        
        // ?撖?????剜??怨?謒芣???
        if (avgExpense > 0) {
            if (amount >= avgExpense * 2 && !usedKeys.includes('entry_large')) {
                const message = getRandomDialog('entry_large');
                if (message) {
                    showMoriDialog(message);
                    markDialogKeyAsUsed('entry_large');
                    return;
                }
            } else if (amount >= avgExpense * 0.5 && amount < avgExpense * 2 && !usedKeys.includes('entry_medium')) {
                const message = getRandomDialog('entry_medium');
                if (message) {
                    showMoriDialog(message);
                    markDialogKeyAsUsed('entry_medium');
                    return;
                }
            } else if (amount < avgExpense * 0.5 && !usedKeys.includes('entry_small')) {
                const message = getRandomDialog('entry_small');
                if (message) {
                    showMoriDialog(message);
                    markDialogKeyAsUsed('entry_small');
                    return;
                }
            }
        } else {
            // ??????????穿?鞊?????entry_small
            if (!usedKeys.includes('entry_small')) {
                const message = getRandomDialog('entry_small');
                if (message) {
                    showMoriDialog(message);
                    markDialogKeyAsUsed('entry_small');
                    return;
                }
            }
        }
    }
}

// ?潘撓貔?船??????摨?
function checkDailyOpenDialog(allRecords) {
    if (!advisorDialogs) {
        loadAdvisorDialogs().then(() => {
            checkDailyOpenDialog(allRecords);
        });
        return;
    }
    
    const usedKeys = getTodayUsedDialogKeys();
    if (usedKeys.includes('daily_open_normal')) return;
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // ?潘撓貔?????穿
    const todayExpenses = allRecords.filter(r => {
        const recordDate = new Date(r.date);
        const recordDateStr = recordDate.toISOString().split('T')[0];
        return (r.type === 'expense' || !r.type) && recordDateStr === today;
    });
    
    const todayTotal = todayExpenses.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    // ??謑?謘賣暑??? AND ??謑??穿 = 0
    if (todayTotal === 0) {
        const message = getRandomDialog('daily_open_normal');
        if (message) {
            showMoriDialog(message);
            markDialogKeyAsUsed('daily_open_normal');
        }
    }
}
function checkNoEntryTodayDialog(allRecords) {
    if (!advisorDialogs) {
        loadAdvisorDialogs().then(() => {
            checkNoEntryTodayDialog(allRecords);
        });
        return;
    }
    
    const usedKeys = getTodayUsedDialogKeys();
    if (usedKeys.includes('no_entry_today')) return;
    
    const now = new Date();
    const hour = now.getHours();
    
    // 21:00 ??    if (hour < 21) {
        const today = now.toISOString().split('T')[0];
        const todayRecords = allRecords.filter(r => {
            const recordDate = new Date(r.date);
            const recordDateStr = recordDate.toISOString().split('T')[0];
            return recordDateStr === today;
        });
        
        if (todayRecords.length === 0) {
            const message = getRandomDialog('no_entry_today');
            if (message) {
                showMoriDialog(message);
                markDialogKeyAsUsed('no_entry_today');
            }
        }
    }
}

// ?潘撓貔??撞??摨?
function checkMonthlyDialogs(allRecords) {
    if (!advisorDialogs) {
        loadAdvisorDialogs().then(() => {
            checkMonthlyDialogs(allRecords);
        });
        return;
    }
    
    const usedKeys = getTodayUsedDialogKeys();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // ?殷???蟡???穿
    const monthlyExpenses = allRecords.filter(r => {
        const recordDate = new Date(r.date);
        return (r.type === 'expense' || !r.type) && 
               recordDate.getMonth() === currentMonth && 
               recordDate.getFullYear() === currentYear;
    });
    
    const monthlyTotal = monthlyExpenses.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    // ?殷???????穿
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthExpenses = allRecords.filter(r => {
        const recordDate = new Date(r.date);
        return (r.type === 'expense' || !r.type) && 
               recordDate.getMonth() === lastMonth && 
               recordDate.getFullYear() === lastMonthYear;
    });
    
    const lastMonthTotal = lastMonthExpenses.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    // ?潘撓貔???
    const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    
    // monthly_good: ?????????? AND ?????
    if (totalBudget > 0 && monthlyTotal <= totalBudget && monthlyTotal <= lastMonthTotal && !usedKeys.includes('monthly_good')) {
        const message = getRandomDialog('monthly_good');
        if (message) {
            showMoriDialog(message);
            markDialogKeyAsUsed('monthly_good');
            return;
        }
    }
    
    // monthly_high: ?????> ??? OR ?????
    if ((monthlyTotal > lastMonthTotal || (totalBudget > 0 && monthlyTotal > totalBudget)) && !usedKeys.includes('monthly_high')) {
        const message = getRandomDialog('monthly_high');
        if (message) {
            showMoriDialog(message);
            markDialogKeyAsUsed('monthly_high');
        }
    }
}

// ?潘撓貔???????止筑??伍?1?賹??瞏?
function checkMonthlySummaryDialog(allRecords) {
    if (!advisorDialogs) {
        loadAdvisorDialogs().then(() => {
            checkMonthlySummaryDialog(allRecords);
        });
        return;
    }
    
    const now = new Date();
    const today = now.getDate();
    
    // ??賃祗?伍?1?賹???    if (today !== 1) return;
    
    // ?潘撓貔??鈭??秋????輯????    const usedKeys = getTodayUsedDialogKeys();
    if (usedKeys.includes('monthly_summary_excellent') || 
        usedKeys.includes('monthly_summary_good') || 
        usedKeys.includes('monthly_summary_warning') || 
        usedKeys.includes('monthly_summary_over')) {
        return;
    }
    
    // ?殷???????????    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    
    const lastMonthExpenses = allRecords.filter(r => {
        const recordDate = new Date(r.date);
        return (r.type === 'expense' || !r.type) && 
               recordDate.getMonth() === lastMonth && 
               recordDate.getFullYear() === lastMonthYear;
    });
    
    const lastMonthTotal = lastMonthExpenses.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    // ?殷???????????蝬???踐??伍????    const twoMonthsAgo = lastMonth === 0 ? 11 : lastMonth - 1;
    const twoMonthsAgoYear = lastMonth === 0 ? lastMonthYear - 1 : lastMonthYear;
    const twoMonthsAgoExpenses = allRecords.filter(r => {
        const recordDate = new Date(r.date);
        return (r.type === 'expense' || !r.type) && 
               recordDate.getMonth() === twoMonthsAgo && 
               recordDate.getFullYear() === twoMonthsAgoYear;
    });
    const twoMonthsAgoTotal = twoMonthsAgoExpenses.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    // ?潘撓貔???
    const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    
    // ?殷????????????    const lastMonthIncomes = allRecords.filter(r => {
        const recordDate = new Date(r.date);
        return r.type === 'income' && 
               recordDate.getMonth() === lastMonth && 
               recordDate.getFullYear() === lastMonthYear;
    });
    const lastMonthIncome = lastMonthIncomes.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    // ?殷???????    const savingsRate = lastMonthIncome > 0 ? ((lastMonthIncome - lastMonthTotal) / lastMonthIncome * 100) : 0;
    
    let dialogKey = null;
    
    // ????堊???
    if (totalBudget > 0) {
        const budgetRatio = (lastMonthTotal / totalBudget) * 100;
        
        if (budgetRatio <= 80 && savingsRate >= 20) {
            dialogKey = 'monthly_summary_excellent';
        } else if (budgetRatio <= 100 && savingsRate >= 10) {
            dialogKey = 'monthly_summary_good';
        } else if (budgetRatio <= 120) {
            dialogKey = 'monthly_summary_warning';
        } else {
            dialogKey = 'monthly_summary_over';
        }
    } else {
        // ???????蹇??撖???????????????????抬???        if (lastMonthTotal <= twoMonthsAgoTotal && savingsRate >= 20) {
            dialogKey = 'monthly_summary_excellent';
        } else if (lastMonthTotal <= twoMonthsAgoTotal * 1.1 && savingsRate >= 10) {
            dialogKey = 'monthly_summary_good';
        } else if (lastMonthTotal <= twoMonthsAgoTotal * 1.2) {
            dialogKey = 'monthly_summary_warning';
        } else {
            dialogKey = 'monthly_summary_over';
        }
    }
    
    if (dialogKey) {
        const message = getRandomDialog(dialogKey);
        if (message) {
            // ?勗?蹓?????踝?????????            setTimeout(() => {
                showMoriDialog(message);
                markDialogKeyAsUsed(dialogKey);
            }, 2000);
        }
    }
}
function checkOverspendReasonDialog() {
    if (!advisorDialogs) {
        loadAdvisorDialogs().then(() => {
            checkOverspendReasonDialog();
        });
        return;
    }
    
    // ??localStorage ??????????    const allRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    
    const usedKeys = getTodayUsedDialogKeys();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // ?殷???蟡???穿
    const monthlyExpenses = allRecords.filter(r => {
        const recordDate = new Date(r.date);
        return (r.type === 'expense' || !r.type) && 
               recordDate.getMonth() === currentMonth && 
               recordDate.getFullYear() === currentYear;
    });
    
    const monthlyTotal = monthlyExpenses.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    // ?潘撓貔???
    const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    
    // ????????????輯???
    if (totalBudget === 0 || monthlyTotal <= totalBudget) return;
    
    // ?潘撓貔??秋????輯????    if (usedKeys.includes('overspend_reason_category') || usedKeys.includes('overspend_reason_large')) {
        return;
    }
    
    // ??????賹?
    // 1. ?潘撓貔????????????    const categoryExpenses = {};
    monthlyExpenses.forEach(r => {
        const category = r.category || '?????;
        if (!categoryExpenses[category]) {
            categoryExpenses[category] = 0;
        }
        categoryExpenses[category] += r.amount || 0;
    });
    
    // ???????叟垓????
    let maxOverspendCategory = null;
    let maxOverspendAmount = 0;
    
    budgets.forEach(budget => {
        const categoryExpense = categoryExpenses[budget.category] || 0;
        if (categoryExpense > budget.amount) {
            const overspend = categoryExpense - budget.amount;
            if (overspend > maxOverspendAmount) {
                maxOverspendAmount = overspend;
                maxOverspendCategory = budget.category;
            }
        }
    });
    
    // 2. ?潘撓貔??秋??????選????    const avgExpense = monthlyExpenses.length > 0 ? monthlyTotal / monthlyExpenses.length : 0;
    const largeExpenses = monthlyExpenses.filter(r => (r.amount || 0) >= avgExpense * 3);
    
    // ????輯????????賹?
    if (maxOverspendCategory && !usedKeys.includes('overspend_reason_category')) {
        const message = getRandomDialog('overspend_reason_category');
        if (message) {
            showMoriDialog(`${message}??{maxOverspendCategory}??秧??????NT$${Math.round(maxOverspendAmount).toLocaleString('zh-TW')}?蹐?;
            markDialogKeyAsUsed('overspend_reason_category');
            return;
        }
    }
    
    // ????????選???蝬??輯??扳????穿?賹?
    if (largeExpenses.length >= 2 && !usedKeys.includes('overspend_reason_large')) {
        const message = getRandomDialog('overspend_reason_large');
        if (message) {
            const largeTotal = largeExpenses.reduce((sum, r) => sum + (r.amount || 0), 0);
            showMoriDialog(`${message}?蟡???${largeExpenses.length} ??銋???蝬??璇? NT$${Math.round(largeTotal).toLocaleString('zh-TW')}?蹐?;
            markDialogKeyAsUsed('overspend_reason_large');
            return;
        }
    }
}

// 擗釭擐????殉朱???
function updateAccountingStreak(allRecords) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // ???????殉朱???
    let streak = parseInt(localStorage.getItem('accounting_streak') || '0');
    const lastRecordDate = localStorage.getItem('accounting_last_record_date');
    
    if (lastRecordDate) {
        const lastDate = new Date(lastRecordDate);
        lastDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
            // ????殉朱??
            streak += 1;
        } else if (daysDiff > 1) {
            // ?殉朱?????
            streak = 1;
        }
        // daysDiff === 0 ?萄?折??鈭????殉死???????謆??    } else {
        // ????????        streak = 1;
    }
    
    // ?踐??????殉朱???????綽???謑??    localStorage.setItem('accounting_streak', streak.toString());
    localStorage.setItem('accounting_last_record_date', today.toISOString());
    
    return streak;
}

// ?潘撓貔????殉朱????伐??摨?
function checkStreakEncouragementDialog() {
    if (!advisorDialogs) {
        loadAdvisorDialogs().then(() => {
            checkStreakEncouragementDialog();
        });
        return;
    }
    
    // ??localStorage ??????????    const allRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    
    const usedKeys = getTodayUsedDialogKeys();
    const streak = updateAccountingStreak(allRecords);
    
    // ?潘撓貔??秋????輯??????剜?????
    const streakKey = `streak_${streak}`;
    if (usedKeys.includes(streakKey)) return;
    
    // ?潘撓貔?????    let dialogKey = null;
    if (streak === 3) {
        dialogKey = 'streak_3';
    } else if (streak === 7) {
        dialogKey = 'streak_7';
    } else if (streak === 14) {
        dialogKey = 'streak_14';
    } else if (streak === 30) {
        dialogKey = 'streak_30';
    } else if (streak === 1) {
        // ?潘撓貔??秋???謘???????        const lastStreak = parseInt(localStorage.getItem('accounting_last_streak') || '0');
        if (lastStreak > 1) {
            dialogKey = 'streak_break';
        }
    }
    
    if (dialogKey) {
        const message = getRandomDialog(dialogKey);
        if (message) {
            showMoriDialog(message);
            markDialogKeyAsUsed(streakKey);
            // ?踐????瘣?????剜???
            localStorage.setItem('accounting_last_streak', streak.toString());
        }
    }
}

// ?潘撓貔謢嗉??謘???
function checkStreakBreakReminder(allRecords) {
    if (!advisorDialogs) {
        loadAdvisorDialogs().then(() => {
            checkStreakBreakReminder(allRecords);
        });
        return;
    }
    
    const usedKeys = getTodayUsedDialogKeys();
    if (usedKeys.includes('streak_break')) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastRecordDate = localStorage.getItem('accounting_last_record_date');
    if (!lastRecordDate) return;
    
    const lastDate = new Date(lastRecordDate);
    lastDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    // ?????1?剜???????????????????殉朱??謢?
    const lastStreak = parseInt(localStorage.getItem('accounting_last_streak') || '0');
    if (daysDiff > 1 && lastStreak > 0) {
        const message = getRandomDialog('streak_break');
        if (message) {
            showMoriDialog(message);
            markDialogKeyAsUsed('streak_break');
        }
    }
}

// ?豲??謘???舀???????loadAdvisorDialogs();
function initAdvisorChat(records, modal) {
    const chatMessages = modal.querySelector('#advisorChatMessages');
    const chatInput = modal.querySelector('#advisorChatInput');
    const sendBtn = modal.querySelector('#advisorSendBtn');
    const advisorStatus = modal.querySelector('.advisor-status');

    // ????謘???????????鈭????蹇???????謕????
    let latestRecords = records;
    try {
        latestRecords = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
    } catch (e) {
        latestRecords = records;
    }

    // ??怨翰????秋撒???lone input ??button
    const newChatInput = chatInput ? chatInput.cloneNode(true) : null;
    if (chatInput && chatInput.parentNode && newChatInput) {
        chatInput.parentNode.replaceChild(newChatInput, chatInput);
    }

    const newSendBtn = sendBtn ? sendBtn.cloneNode(true) : null;
    if (sendBtn && sendBtn.parentNode && newSendBtn) {
        sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
    }
    
    // ?梁???寞伐????謅??鈭??殉朱謓???????梁????    if (chatMessages && !chatMessages.querySelector('.advisor-quick-actions')) {
        const quick = document.createElement('div');
        quick.className = 'advisor-quick-actions';
        quick.innerHTML = `
            <button type="button" class="advisor-quick-btn" data-q="?蟡???穿???">?蟡???穿</button>
            <button type="button" class="advisor-quick-btn" data-q="???剜??蝞??遴等謢???>???剜???/button>
            <button type="button" class="advisor-quick-btn" data-q="???????>???????/button>
            <button type="button" class="advisor-quick-btn" data-q="?謕?????????伍??">?????/button>
            <button type="button" class="advisor-quick-btn advisor-quick-btn-secondary" data-action="clear_chat">?敺???</button>
        `;
        chatMessages.appendChild(quick);
    }

    // ??舐????摨??????
    if (chatMessages) {
        const history = getAdvisorChatHistory();
        if (history.length > 0) {
            history.forEach(item => {
                if (!item || !item.type || !item.message) return;
                addAdvisorMessage(chatMessages, item.type, item.message);
            });
            scrollChatToBottom(chatMessages);
        } else {
            // ????????蹓潸翮擗??????輯撒?????????            const welcomeMessage = generateAdvisorWelcomeMessage(latestRecords);
            setTimeout(() => {
                addAdvisorMessageTyping(chatMessages, 'advisor', welcomeMessage, () => {
                    pushAdvisorChatHistoryItem({ type: 'advisor', message: welcomeMessage });
                });
            }, 500);
        }
    }

    // ?寞伐????哨?颲?
    if (chatMessages) {
        chatMessages.querySelectorAll('.advisor-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.action === 'clear_chat') {
                    if (confirm('確定要清除對話記錄嗎？')) {
                        clearAdvisorChatHistory();
                        if (chatMessages) {
                            chatMessages.innerHTML = ';
                        }
                        // ????梁???寞伐??                        initAdvisorChat(latestRecords, modal);
                    }
                    return;
                }
                const q = btn.dataset.q || ';
                if (!q || !newChatInput) return;
                newChatInput.value = q;
                newChatInput.focus();
                // ?皝??蹓鳴
                if (newSendBtn && !newSendBtn.disabled) {
                    newSendBtn.click();
                }
            });
        });
    }
    
    // ?瞏捍蹓??????    const sendMessage = () => {
        if (!newChatInput) return;
        const userMessage = newChatInput.value.trim();
        if (!userMessage) return;

        // ?啾播??閰剁?ｇ????? + loading
        if (newChatInput) newChatInput.disabled = true;
        const originalBtnText = newSendBtn ? newSendBtn.textContent : ';
        if (newSendBtn) {
            newSendBtn.disabled = true;
            newSendBtn.classList.add('is-loading');
            newSendBtn.textContent = '?豯???..';
        }
        
        // ?????踝??剁?蹓?
        if (chatMessages) {
            addAdvisorMessage(chatMessages, 'user', userMessage);
            pushAdvisorChatHistoryItem({ type: 'user', message: userMessage });
        }
        newChatInput.value = ';
        
        // ?輯?????謓剝?閰剁..."????        showTypingIndicator(chatMessages, advisorStatus);
        
        // ?撖?????湛??刻正????豲?????300-1500ms??        const questionComplexity = calculateQuestionComplexity(userMessage);
        const thinkingTime = 300 + (questionComplexity * 200);
        
        // ???豲???賹??豯?
        setTimeout(() => {
            const advisorResponse = generateAdvisorResponse(userMessage, latestRecords);
            hideTypingIndicator(chatMessages, advisorStatus);
            
            // ?輯撒????????輯???豯?
            if (chatMessages) {
                addAdvisorMessageTyping(chatMessages, 'advisor', advisorResponse, () => {
                    pushAdvisorChatHistoryItem({ type: 'advisor', message: advisorResponse });
                    // ?豯??堆??綽??????餅???                    if (newChatInput) newChatInput.disabled = false;
                    if (newSendBtn) {
                        newSendBtn.disabled = false;
                        newSendBtn.classList.remove('is-loading');
                        newSendBtn.textContent = originalBtnText || '?瞏捍?;
                    }
                    if (newChatInput) newChatInput.focus();
                });
            }
        }, thinkingTime);
    };
    
    if (newSendBtn) {
        newSendBtn.addEventListener('click', sendMessage);
    }
    
    if (newChatInput) {
        newChatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !newChatInput.disabled) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}
function calculateQuestionComplexity(userMessage) {
    let complexity = 0;
    const message = userMessage.toLowerCase();
    
    // ?鈭??鈭亙眺 +1
    if (message.match(/\d{1,2}[\/\-??d{1,2}/)) complexity += 1;
    
    // ????鈭亙眺 +1
    if (message.match(/\d+/)) complexity += 1;
    
    // ????鈭亙眺 +1
    if (message.includes('???') || message.includes('?遴竣??)) complexity += 1;
    
    // ????? +2
    if (message.includes('???) || message.includes('???')) complexity += 2;
    
    // ?????? +1
    if (message.includes('???')) complexity += 1;
    
    // 理財顧問相關詞彙 +2
    if (message.includes('分析') || message.includes('理財顧問')) complexity += 2;
    
    // 包含多個條件查詢 +1
    const conditions = (message.match(/\d+/g) || []).length;
    if (conditions > 1) complexity += 1;
    
    return Math.min(complexity, 6);
}
function showTypingIndicator(container, statusElement) {
    // 顯示狀態文字"正在思考中..."
    if (statusElement) {
        statusElement.textContent = '正在思考中...';
        statusElement.style.color = 'var(--color-primary)';
    }
    
    // 創建打字指示器元素
    const typingDiv = document.createElement('div');
    typingDiv.className = 'advisor-message advisor-message-typing';
    typingDiv.id = 'advisorTypingIndicator';
    typingDiv.innerHTML = `
        <div class="advisor-message-avatar">
            <img src="./image/7.png" alt="小森" class="advisor-message-avatar-image" onerror="this.style.display='none'; this.parentElement.innerHTML='🤖';">
        </div>
        <div class="advisor-message-content">
            <div class="advisor-typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
}
function hideTypingIndicator(container, statusElement) {
    // ??謒?????怠??    const typingIndicator = container.querySelector('#advisorTypingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    
    // ?嚗瑕?????冪"???"
    if (statusElement) {
        statusElement.textContent = '???';
        statusElement.style.color = 'var(--text-secondary)';
    }
}

// ?輯撒???????????剁?蹓?
function addAdvisorMessageTyping(container, type, message, onComplete) {
    // ???梁捂???祆???    const messageDiv = document.createElement('div');
    messageDiv.className = `advisor-message advisor-message-${type}`;
    
    // ?潘撓貔??秋???荒?HTML?萄赯?
    const containsHTML = message.includes('<table') || message.includes('<div');
    
    if (type === 'advisor') {
        messageDiv.innerHTML = `
            <div class="advisor-message-avatar">
                <img src="./image/7.png" alt="小森" class="advisor-message-avatar-image" onerror="this.style.display='none'; this.parentElement.innerHTML='🤖';">
            </div>
            <div class="advisor-message-content">
                <div class="advisor-message-text"></div>
                <div class="advisor-message-time">${new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="advisor-message-content">
                <div class="advisor-message-text"></div>
                <div class="advisor-message-time">${new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `;
    }
    
    container.appendChild(messageDiv);
    const textElement = messageDiv.querySelector('.advisor-message-text');
    
    // ?????荒?HTML?謆?鈭方????輯撒???????
    if (containsHTML) {
        const formattedMessage = message.replace(/\n/g, '<br>');
        textElement.innerHTML = formattedMessage;
        container.scrollTop = container.scrollHeight;
        if (onComplete) {
            setTimeout(onComplete, 100);
        }
        return;
    }
    
    // ????????塗
    const typingSpeed = 20 + Math.random() * 30; // 20-50ms per character???蟡??剔捂??殉??賹撞???
    let currentIndex = 0;
    const fullText = message;
    
    // ????鞈?
    const typeNextChar = () => {
        if (currentIndex < fullText.length) {
            // ????謜???            if (fullText[currentIndex] === '\n') {
                textElement.innerHTML += '<br>';
            } else {
                textElement.textContent += fullText[currentIndex];
            }
            currentIndex++;
            
            // 隨機速度變化，讓打字更自然
            const nextDelay = typingSpeed + (Math.random() * 20 - 10);
            setTimeout(typeNextChar, Math.max(10, nextDelay));
            
            // 自動滾動到底部
            container.scrollTop = container.scrollHeight;
        } else {
            // 打字完成
            if (onComplete) {
                onComplete();
            }
        }
    };
    
    // 開始打字
    setTimeout(() => {
        typeNextChar();
    }, 100);
}
function addAdvisorMessage(container, type, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `advisor-message advisor-message-${type}`;
    
    // ?潘撓貔??秋???荒?HTML?萄赯?
    const containsHTML = message.includes('<table') || message.includes('<div');
    
    // ?????荒?HTML?謆?銋抵?????銵????蛛瘜菟????<br>
    const formattedMessage = containsHTML ? message : message.replace(/\n/g, '<br>');
    
    if (type === 'advisor') {
        messageDiv.innerHTML = `
            <div class="advisor-message-avatar">
                <img src="./image/7.png" alt="小森" class="advisor-message-avatar-image" onerror="this.style.display='none'; this.parentElement.innerHTML='🤖';">
            </div>
            <div class="advisor-message-content">
                <div class="advisor-message-text">${formattedMessage}</div>
                <div class="advisor-message-time">${new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="advisor-message-content">
                <div class="advisor-message-text">${formattedMessage}</div>
                <div class="advisor-message-time">${new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `;
    }
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

// ?賹????踵?????剁?蹓?
function generateAdvisorWelcomeMessage(records) {
    if (records.length === 0) {
        return '??豢???????蹐彫\n??結??蹌?????ａ??遴???蹇??迎????謢????斯?????蹎???;
    }
    
    // ????殉死?
    const now = new Date();
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
    
    // ????舀０?
    const categoryStats = {};
    expenses.forEach(r => {
        const category = r.category || '?????;
        categoryStats[category] = (categoryStats[category] || 0) + (r.amount || 0);
    });
    
    const topCategory = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0];
    
    let message = `??豢???????蹐彫\n`;
    
    if (monthlyRecords.length > 0) {
        message += `?蟡??舀０???n`;
        message += `?株都??蝬?NT$ ${totalExpense.toLocaleString('zh-TW')}\n`;
        if (totalIncome > 0) {
            message += `?株都??隡?NT$ ${totalIncome.toLocaleString('zh-TW')}\n`;
            const balance = totalIncome - totalExpense;
            if (balance > 0) {
                message += `?蟡??荒???彿T$ ${balance.toLocaleString('zh-TW')}\n`;
            } else {
                message += `?蟡????謕蓉$ ${Math.abs(balance).toLocaleString('zh-TW')}\n`;
            }
        }
        
        if (topCategory) {
            message += `???剜??蝞??遴筑?${topCategory[0]} (NT$ ${topCategory[1].toLocaleString('zh-TW')})\n`;
        }
    }
    
    message += `\n??恃??曌???????蝞??嚗肅蹓???????謆?謚??選?蹇???餅蔬???????`;
    
    return message;
}
function addConversationalPrefix(response) {
    const prefixes = [
        '???伍??銋???..',
        '??????????..',
        '??..????????..',
        '????伍???對...',
        '???皜????..',
        '?????????伍???..',
        '?????????殉死?...',
        '??????????皜?...',
        '????伍????...'
    ];
    
    // 40% ??????????????摨?皜莎?憛?
    if (Math.random() < 0.4 && response.length > 30) {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return prefix + '\n\n' + response;
    }
    
    return response;
}
function getSmartResponse(userMessage, records) {
    const message = (userMessage || ').trim();
    if (!message) {
        return '??剛?????方???殉???魂???/ ?? / ??? / ??? / ?????????????????皜???;
    }

    const lower = message.toLowerCase();
    if (lower.includes('??') || lower.includes('??) || lower.includes('???')) {
        return '??恃??曌蹎????????謕蹐彫\n?遴??駁?鈭亙疵?謅???n???蟡???穿???\n?????剜??蝞??遴魚n?????????n???謕?????????伍??';
    }

    // ?銋抵???鄞?荒?岳??????????啗﹝?圈謚??遴等貔?    const trimmed = message.replace(/\s+/g, ');
    if (trimmed.length <= 6 && records && Array.isArray(records)) {
        return `?遴?謢?????{message}??謕???遴策??璇舐孕???\n\n?遴??駁?隞螞謕??????n??${message} ????叟城?\n???蟡? ${message} ????叟城?`;
    }

    return '?????鈭蝞??遴???????殉??????蝯?蹐彫\n?遴??駁?鈭???????????n???蟡???穿???\n?????????叟城?\n??12/7 ?????餃╪n?????????;
}

function queryCategorySpending(records, categoryKeyword) {
    if (!Array.isArray(records) || !categoryKeyword) {
        return '????秋撩??叟??????謕??鞈ａ??遴?貔?????穿??;
    }
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const expenses = records.filter(r => {
        const d = new Date(r.date);
        return (r.type === 'expense' || !r.type) && d.getMonth() === m && d.getFullYear() === y;
    });
    const matched = expenses.filter(r => (r.category || ').includes(categoryKeyword));
    const total = matched.reduce((s, r) => s + (r.amount || 0), 0);
    return `?蟡???{categoryKeyword}????謚恃??蝬?NT$ ${total.toLocaleString('zh-TW')}??{matched.length} ???`;
}

function queryTopSpending(records) {
    if (!Array.isArray(records) || records.length === 0) {
        return '?獢??????????????????剜??蝞?;
    }
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const expenses = records.filter(r => {
        const d = new Date(r.date);
        return (r.type === 'expense' || !r.type) && d.getMonth() === m && d.getFullYear() === y;
    });
    if (expenses.length === 0) return '?蟡??獢??????穿?殉死???;

    const categoryStats = {};
    expenses.forEach(r => {
        const cat = r.category || '?????;
        categoryStats[cat] = (categoryStats[cat] || 0) + (r.amount || 0);
    });
    const [topCat, topAmt] = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0];
    return `?蟡???穿???叟垓??????純?{topCat}????? NT$ ${Math.round(topAmt).toLocaleString('zh-TW')}?蹐?
}

function queryLowestSpending(records) {
    if (!Array.isArray(records) || records.length === 0) {
        return '?獢??????????????????遴???蝞?;
    }
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const expenses = records.filter(r => {
        const d = new Date(r.date);
        return (r.type === 'expense' || !r.type) && d.getMonth() === m && d.getFullYear() === y;
    });
    if (expenses.length === 0) return '?蟡??獢??????穿?殉死???;

    const minRecord = expenses.slice().sort((a, b) => (a.amount || 0) - (b.amount || 0))[0];
    return `?蟡??????????蝞賃???{minRecord.category || '?????}??㎡$ ${(minRecord.amount || 0).toLocaleString('zh-TW')}?蹐?
}

function compareMonths(records) {
    if (!Array.isArray(records) || records.length === 0) {
        return '?獢?????????????????伍????;
    }
    const now = new Date();
    const curM = now.getMonth();
    const curY = now.getFullYear();
    const lastM = curM === 0 ? 11 : curM - 1;
    const lastY = curM === 0 ? curY - 1 : curY;

    const sumMonth = (m, y) => records
        .filter(r => {
            const d = new Date(r.date);
            return (r.type === 'expense' || !r.type) && d.getMonth() === m && d.getFullYear() === y;
        })
        .reduce((s, r) => s + (r.amount || 0), 0);

    const cur = sumMonth(curM, curY);
    const last = sumMonth(lastM, lastY);
    const diff = cur - last;
    const sign = diff >= 0 ? '?竣?' : '???';
    return `?蟡???穿 NT$ ${Math.round(cur).toLocaleString('zh-TW')}????NT$ ${Math.round(last).toLocaleString('zh-TW')}?謓??????${sign} NT$ ${Math.abs(Math.round(diff)).toLocaleString('zh-TW')}?蹐?
}

function getTotalSummary(records) {
    if (!Array.isArray(records) || records.length === 0) {
        return '?獢???????????????株釭???;
    }
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const month = records.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === m && d.getFullYear() === y;
    });
    const expense = month.filter(r => r.type === 'expense' || !r.type).reduce((s, r) => s + (r.amount || 0), 0);
    const income = month.filter(r => r.type === 'income').reduce((s, r) => s + (r.amount || 0), 0);
    const balance = income - expense;
    
    let html = `?? ?蟡??株釭???n\n`;
    html += `<table class="advisor-table">`;
    html += `<thead><tr><th>??梱?</th><th>???</th></tr></thead>`;
    html += `<tbody>`;
    html += `<tr class="expense-row"><td class="category-cell">?株都???/td><td class="amount-cell">NT$ ${Math.round(expense).toLocaleString('zh-TW')}</td></tr>`;
    html += `<tr class="income-row"><td class="category-cell">?株都???/td><td class="amount-cell">NT$ ${Math.round(income).toLocaleString('zh-TW')}</td></tr>`;
    html += `</tbody>`;
    html += `<tfoot><tr class="advisor-table-summary"><td class="category-cell">?荒??</td><td class="amount-cell" style="color: ${balance >= 0 ? '#10b981' : '#ef4444'}">NT$ ${Math.round(balance).toLocaleString('zh-TW')}</td></tr></tfoot>`;
    html += `</table>`;
    
    return html;
}

function getAverageAnalysis(records) {
    if (!Array.isArray(records) || records.length === 0) {
        return '?獢?????????????????????;
    }
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const expenses = records.filter(r => {
        const d = new Date(r.date);
        return (r.type === 'expense' || !r.type) && d.getMonth() === m && d.getFullYear() === y;
    });
    if (expenses.length === 0) return '?蟡??獢??????穿?殉死???????????岑?;
    const total = expenses.reduce((s, r) => s + (r.amount || 0), 0);
    const avg = total / expenses.length;
    return `?蟡???穿???伍???NT$ ${Math.round(avg).toLocaleString('zh-TW')}????${expenses.length} ????蹐?
}

// ?賹????踵??豯?
function generateAdvisorResponse(userMessage, records) {
    try {
        const message = userMessage.toLowerCase();
        const originalMessage = userMessage; // ?踐???賹??剜????瞉??遴竣???    
        if ((originalMessage.includes('瘥?') || originalMessage.includes('??)) && originalMessage.includes('?嗆') && (originalMessage.includes('皜') || originalMessage.includes('?”'))) {
            return addConversationalPrefix(generateMonthlyIncomeExpenseList(records, originalMessage));
        }
    // ??????????蹓??赯菜???1500??500??麻蹍$1500??
    const amountPattern = /(\d+(?:\.\d+)?)\s*(?:??格??遑T\$|?瘣???/g;
    const amountMatches = [...message.matchAll(amountPattern)];
    let amounts = amountMatches.map(m => {
        let num = parseFloat(m[1]);
        // ???"??????
        if (m[0].includes('??)) num *= 10000;
        else if (m[0].includes('??)) num *= 1000;
        return num;
    }).filter(a => a > 0);
    
    // ????鈭?????蹓??赯菜???12/7??2-7??2???賹???    const datePattern = /(\d{1,2})\s*[\/\-??s*(\d{1,2})/g;
    const dateMatches = [...message.matchAll(datePattern)];
    
    // ???????垮謑??????鈭亙眺????縈?12/7???1500??    if (dateMatches.length > 0 && amounts.length > 0) {
        return addConversationalPrefix(queryDateAndAmount(userMessage, records, dateMatches[0], amounts[0]));
    }
    
    // ????鈭亙眺????縈?1500??芰?哨???餅膠??500?????餅??
    if (amounts.length > 0) {
        const amountKeywords = ['??芰??, '??????, '??迎???, '??????, '???', '???', '???', '?朴?', '????叟城?', '????叟城?'];
        if (amountKeywords.some(kw => message.includes(kw))) {
            return addConversationalPrefix(queryAmountOnly(userMessage, records, amounts[0]));
        }
    }
    
    // ?蹇?+???+????鈭亙眺????縈???餅蔬??謕??????170??    if ((message.includes('??餅蔬???) || message.includes('??訾?') || message.includes('???') || 
         message.includes('?遴??') || message.includes('?遴?謑?)) && 
        (message.includes('???') || message.includes('???') || message.includes('???') || 
         message.includes('?朴?')) && amounts.length > 0) {
        return addConversationalPrefix(queryAmountAndCategory(userMessage, records));
    }
    
    // ?鈭??鈭亙眺????縈?12/7?????餅膠??2???賹?哨???餅??
    if (dateMatches.length > 0) {
        const dateKeywords = ['??????, '??????, '???', '???', '?殉死?', '?剜??', '?謍????];
        if (dateKeywords.some(kw => message.includes(kw))) {
            return addConversationalPrefix(queryDateRecords(userMessage, records));
        }
    }
    
    // ????鈭亙眺????縈????????叟城??蹓箸摹?謍喟孕?叟城???    const categoryKeywords = ['???', '???', '?謍?', '?啗??', '????, '??, '??, '?剜??, '??, '????, 
                              '?∵??', '???', '?頛?', '?鳩謆?, '?擗孕', '?祈璆?, '?擗?', '???'];
    const foundCategory = categoryKeywords.find(cat => originalMessage.includes(cat));
    if (foundCategory && (message.includes('?叟城?') || message.includes('???') || message.includes('??穿'))) {
        return addConversationalPrefix(queryCategorySpending(records, foundCategory));
    }
    
    // ?舀０??遴等貔嚚?????垮??叟垣?蹓???蹓??剜?蹓???
    if (message.includes('????) || message.includes('????) || message.includes('????)) {
        return addConversationalPrefix(queryTopSpending(records, message));
    }
    if (message.includes('????) || message.includes('????) || message.includes('????)) {
        return addConversationalPrefix(queryLowestSpending(records, message));
    }
    
    // ?伍???鈭亙眺????縈??謕???伍??????蹓螞謕??????????    if (message.includes('??) || message.includes('?伍??') || message.includes('???')) {
        return addConversationalPrefix(compareMonths(records));
    }
    
    // ????謚殷?堊筑??皜??皜??????    let response = ';
    if (message.includes('??穿') || message.includes('?璇舐孕') || message.includes('?璇ｇ') || 
        message.includes('??∴?') || message.includes('?剁?蟡?) || message.includes('???')) {
        response = analyzeExpenses(records);
    } else if (message.includes('??') || message.includes('??) || message.includes('????') || 
               message.includes('?漸?') || message.includes('???') || message.includes('???')) {
        response = analyzeIncome(records);
    } else if (message.includes('?梁???) || message.includes('??') || message.includes('?蹓選') || 
               message.includes('???') || message.includes('???') || message.includes('??血?')) {
        response = provideFinancialAdvice(records);
    } else if (message.includes('???') || message.includes('?遴竣??) || message.includes('??梱?')) {
        response = analyzeCategories(records);
    } else if (message.includes('???) || message.includes('???') || message.includes('???) || 
               message.includes('??') || message.includes('??')) {
        response = analyzeTrends(records);
    } else if (message.includes('???') || message.includes('???') || message.includes('???')) {
        response = analyzeBudget(records);
    } else if (message.includes('?株釭?') || message.includes('?株郭?') || message.includes('?蹎?')) {
        response = getTotalSummary(records);
    } else if (message.includes('??') || message.includes('??怏?)) {
        response = getAverageAnalysis(records);
    } else {
        // ?謅疵?蝞??????
        response = getSmartResponse(userMessage, records);
    }
    
        // ?蝞??????斗熄?蹎?止竣??????謇喟?賹?
        return addConversationalPrefix(response);
    } catch (e) {
        console.error('generateAdvisorResponse failed:', e);
        return '????謜????謕???抬???綜竣??選???ｇ?????????謘踹疵?啗﹝???魂秧????蝞???/ ???剜??蝞???/ ??????撕???;
    }
}

// ?賹???穿?萄赯焙TML
function generateExpenseTableHTML(records) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyExpenses = records.filter(r => {
        const recordDate = new Date(r.date);
        return (r.type === 'expense' || !r.type) && 
               recordDate.getMonth() === currentMonth && 
               recordDate.getFullYear() === currentYear;
    });
    
    if (monthlyExpenses.length === 0) {
        return '?蟡??獢??????穿?殉死???;
    }
    
    const total = monthlyExpenses.reduce((sum, r) => sum + (r.amount || 0), 0);
    const avg = monthlyExpenses.length > 0 ? total / monthlyExpenses.length : 0;
    
    // ????舀０?
    const categoryStats = {};
    monthlyExpenses.forEach(r => {
        const category = r.category || '?????;
        categoryStats[category] = (categoryStats[category] || 0) + (r.amount || 0);
    });
    
    const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
    
    let html = `?? ?蟡???穿?????n\n`;
    html += `???株都??蝬?NT$ ${total.toLocaleString('zh-TW')}\n`;
    html += `???剜?????脣??{monthlyExpenses.length} ?n`;
    html += `?????伍??彿T$ ${Math.round(avg).toLocaleString('zh-TW')}\n\n`;
    
    html += `<table class="advisor-table">`;
    html += `<thead><tr><th>???</th><th>???</th><th>???</th><th>?蹎?</th></tr></thead>`;
    html += `<tbody>`;
    
    sortedCategories.slice(0, 10).forEach(([cat, amount], index) => {
        const percentage = ((amount / total) * 100).toFixed(1);
        html += `<tr class="expense-row">`;
        html += `<td>${index + 1}</td>`;
        html += `<td class="category-cell">${cat}</td>`;
        html += `<td class="amount-cell">NT$ ${amount.toLocaleString('zh-TW')}</td>`;
        html += `<td>${percentage}%</td>`;
        html += `</tr>`;
    });
    
    html += `</tbody>`;
    html += `<tfoot><tr class="advisor-table-summary"><td colspan="2">???</td><td class="amount-cell">NT$ ${total.toLocaleString('zh-TW')}</td><td>100%</td></tr></tfoot>`;
    html += `</table>`;
    
    return html;
}

// ?????穿
function analyzeExpenses(records) {
    return generateExpenseTableHTML(records);
}

// ?賹????萄赯焙TML
function generateIncomeTableHTML(records) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyIncomes = records.filter(r => {
        const recordDate = new Date(r.date);
        return r.type === 'income' && 
               recordDate.getMonth() === currentMonth && 
               recordDate.getFullYear() === currentYear;
    });
    
    if (monthlyIncomes.length === 0) {
        return '?蟡??獢???????殉死???;
    }
    
    const total = monthlyIncomes.reduce((sum, r) => sum + (r.amount || 0), 0);
    const avg = total / monthlyIncomes.length;
    
    // ????舀０?
    const categoryStats = {};
    monthlyIncomes.forEach(r => {
        const category = r.category || '?????;
        categoryStats[category] = (categoryStats[category] || 0) + (r.amount || 0);
    });
    
    const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
    
    let html = `????蟡????????n\n`;
    html += `???株都??隡?NT$ ${total.toLocaleString('zh-TW')}\n`;
    html += `???????脣??{monthlyIncomes.length} ?n`;
    html += `?????伍??彿T$ ${Math.round(avg).toLocaleString('zh-TW')}\n\n`;
    
    html += `<table class="advisor-table">`;
    html += `<thead><tr><th>???</th><th>???</th><th>???</th><th>?蹎?</th></tr></thead>`;
    html += `<tbody>`;
    
    sortedCategories.forEach(([cat, amount], index) => {
        const percentage = ((amount / total) * 100).toFixed(1);
        html += `<tr class="income-row">`;
        html += `<td>${index + 1}</td>`;
        html += `<td class="category-cell">${cat}</td>`;
        html += `<td class="amount-cell">NT$ ${amount.toLocaleString('zh-TW')}</td>`;
        html += `<td>${percentage}%</td>`;
        html += `</tr>`;
    });
    
    html += `</tbody>`;
    html += `<tfoot><tr class="advisor-table-summary"><td colspan="2">???</td><td class="amount-cell">NT$ ${total.toLocaleString('zh-TW')}</td><td>100%</td></tr></tfoot>`;
    html += `</table>`;
    
    return html;
}

// ?????
function analyzeIncome(records) {
    return generateIncomeTableHTML(records);
}

// ??????梁???
function provideFinancialAdvice(records) {
    const now = new Date();
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
    
    let response = `??????梁???謇\n`;
    
    if (totalIncome > 0) {
        const savingsRate = ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1);
        if (savingsRate > 20) {
            response += `??????????恃冪 ${savingsRate}%????????n`;
        } else if (savingsRate > 0) {
            response += `?蹎? ????????恃冪 ${savingsRate}%???????朱??20% ?鼎??蹐彫`;
        } else {
            response += `???蟡??蝞?????粹??謘踐??蝎??畾?????剛??倦?蹓???啾??蹐彫`;
        }
    }
    
    // ????梁???
    const categoryStats = {};
    expenses.forEach(r => {
        const category = r.category || '?????;
        categoryStats[category] = (categoryStats[category] || 0) + (r.amount || 0);
    });
    
    const topCategory = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0];
    if (topCategory && topCategory[1] > totalExpense * 0.3) {
        response += `\n?? ???垣??{topCategory[0]}????株都???${((topCategory[1] / totalExpense) * 100).toFixed(1)}%?????喟??秋■謢?銵?????硃??蹐彫`;
    }
    
    response += `\n??????蟡冽??\n`;
    response += `???殉朱??????????????蹓??殉死??綽???秋?n`;
    response += `???梁?????????????????穿\n`;
    response += `???堊垮??潘撩???穿????鳴?蝞??對??????吵`;
    response += `???梁???綽??隞??謕???瑟??3-6 ?????????蟡功n`;
    
    return response;
}

// ??????
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
        const category = r.category || '?????;
        categoryStats[category] = (categoryStats[category] || 0) + (r.amount || 0);
    });
    
    const total = monthlyExpenses.reduce((sum, r) => sum + (r.amount || 0), 0);
    const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
    
    let response = `?? ??穿????????n\n`;
    sortedCategories.forEach(([cat, amount], index) => {
        const percentage = ((amount / total) * 100).toFixed(1);
        response += `${index + 1}. ${cat}?彿T$ ${amount.toLocaleString('zh-TW')} (${percentage}%)\n`;
    });
    
    return response;
}

// ??????
function analyzeTrends(records) {
    const now = new Date();
    const monthlyData = {};
    
    // ?舀０???擗?6 ????????    for (let i = 5; i >= 0; i--) {
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
    const trend = values[values.length - 1] > values[values.length - 2] ? '???' : '??';
    
    let response = `?? ??穿????????擗?6 ?????\n\n`;
    response += `????????蝬?NT$ ${Math.round(avg).toLocaleString('zh-TW')}\n`;
    response += `????????嚚?${trend}\n`;
    
    return response;
}

// ??????
function analyzeBudget(records) {
    // ???????桀??
    const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
    
    if (budgets.length === 0) {
        return `?? ???????桀??????蹐彫\n?梁???蝞??秋撮??蝞??遴筆頨急謍??不??謕???剛??皜豢??啾?????蝞蹐彫\n??剛???溘?質澈?菜????桀??????蹐?
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
    
    let response = `?? ???????????n\n`;
    
    budgets.forEach(budget => {
        const categoryExpenses = monthlyExpenses
            .filter(r => (r.category || '?????) === budget.category)
            .reduce((sum, r) => sum + (r.amount || 0), 0);
        
        const percentage = (categoryExpenses / budget.amount * 100).toFixed(1);
        const status = percentage > 100 ? '????? : percentage > 80 ? '?蹎? ?鈭?' : '??????;
        
        response += `${budget.category}??n`;
        response += `??????彿T$ ${budget.amount.toLocaleString('zh-TW')}\n`;
        response += `?????謕蓉$ ${categoryExpenses.toLocaleString('zh-TW')} (${percentage}%)\n`;
        response += `???????${status}\n\n`;
    });
    
    return response;
}
function queryDateRecords(userMessage, records) {
    // ????鈭? - ????撖? 12/7??2-7 ?謕??瞉?
    const datePatterns = [
        /(\d{1,2})\s*[\/\-]\s*(\d{1,2})/g,  // ?????2/7??2-7??????
        /(\d{1,2})\s*??*(\d{1,2})\s*??g,  // ?????2????        /(\d{1,2})\s*[???\-]\s*(\d{1,2})/g,  // ?????2????2/5??2-5
        /(\d{1,2})\s*??g,  // ???????        /(\d{4})\s*[??/\-]\s*(\d{1,2})\s*[???\-]\s*(\d{1,2})/g,  // ?????024??2????        /??鈭??謑?g,
        /??訾?|??踐?/g,
        /???/g,
        /(\d+)\s*?剜??/g
    ];
    
    let targetDate = null;
    const now = new Date();
    
    // ?謅疵?撖?????鈭??瞉?
    for (const pattern of datePatterns) {
        const match = userMessage.match(pattern);
        if (match) {
            const matchStr = match[0];
            
            if (matchStr.includes('??鈭?) || matchStr.includes('??謑?)) {
                targetDate = new Date(now);
            } else if (matchStr.includes('??訾?') || matchStr.includes('??踐?')) {
                targetDate = new Date(now);
                targetDate.setDate(targetDate.getDate() - 1);
            } else if (matchStr.includes('???')) {
                targetDate = new Date(now);
                targetDate.setDate(targetDate.getDate() - 2);
            } else if (matchStr.includes('?剜??')) {
                const daysAgo = parseInt(matchStr.match(/(\d+)/)[1]);
                targetDate = new Date(now);
                targetDate.setDate(targetDate.getDate() - daysAgo);
            } else {
                // ???????瞉??????12/7??2-7??2???賹???                const numbers = matchStr.match(/\d+/g);
                if (numbers && numbers.length >= 2) {
                    const month = parseInt(numbers[0]);
                    const day = parseInt(numbers[1]);
                    // ??????剜謘?2???鞈?? ?????瞉???? 7/12 ?萄??2???隡?
                    if (month > 12 && day <= 12) {
                        targetDate = new Date(now.getFullYear(), day - 1, month);
                    } else {
                        targetDate = new Date(now.getFullYear(), month - 1, day);
                    }
                } else if (numbers && numbers.length === 1) {
                    // ????鈭?????踐?????                    const day = parseInt(numbers[0]);
                    targetDate = new Date(now.getFullYear(), now.getMonth(), day);
                }
            }
            
            if (targetDate) break;
        }
    }
    
    // ??????????鈭????啗?貔???擗??殉死?
    if (!targetDate) {
        // ?????踝???純?賜?哨???餅膠??????????鈭????豯?擗??殉死?
        if (userMessage.includes('??????) || userMessage.includes('??????)) {
            // 擗????擗?曇?????            const recentRecords = records
                .filter(r => r.type === 'expense' || !r.type)
                .sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateB - dateA;
                })
                .slice(0, 10);
            
            if (recentRecords.length === 0) {
                return '?? ???擗???止??蝞????;
            }
            
            let response = '?? ???擗???穿?殉死???n\n';
            recentRecords.forEach((record, index) => {
                const date = new Date(record.date);
                const dateStr = `${date.getMonth() + 1}??{date.getDate()}?貕?
                const amount = record.amount || 0;
                const category = record.category || '?????;
                response += `${index + 1}. ${dateStr} - ${category}?彿T$ ${amount.toLocaleString('zh-TW')}\n`;
            });
            
            return response;
        }
        
        return '?? ??????祗???????????????謑?貔螞蹐彫\n??賃?遛?謕??????n??"12???賹?哨????\n??"??訾???????\n??"?銋?????剜?粹????\n??"??????????餅蔬豰?';
    }
    
    // ?瞉??謘踐??賹??瞏???    const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    
    // ?鈭歹?啗謑?賹??殉死?
    const dateRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        const recordDateStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
        return recordDateStr === targetDateStr;
    });
    
    if (dateRecords.length === 0) {
        const dateStr = `${targetDate.getMonth() + 1}月${targetDate.getDate()}日`;
        return `在 ${dateStr} 沒有找到任何記帳記錄。\n請確認日期是否正確，或嘗試查詢其他日期的記錄。`;
    }
    
    // 分類記錄
    const expenses = dateRecords.filter(r => r.type === 'expense' || !r.type);
    const incomes = dateRecords.filter(r => r.type === 'income');
    const transfers = dateRecords.filter(r => r.type === 'transfer');
    
    const dateStr = `${targetDate.getMonth() + 1}月${targetDate.getDate()}日`;
    let response = `在 ${dateStr} 的記錄如下：\n\n`;
    
    if (expenses.length > 0) {
        const totalExpense = expenses.reduce((sum, r) => sum + (r.amount || 0), 0);
        response += `支出 (${expenses.length} 筆記錄，共 NT$ ${totalExpense.toLocaleString('zh-TW')})：\n`;
        expenses.forEach((record, index) => {
            const category = record.category || '未分類';
            const amount = record.amount || 0;
            const account = record.account && typeof getAccounts === 'function' ? getAccounts().find(a => a.id === record.account)?.name : '';
            const member = record.member || '';
            const note = record.note ? ` (${record.note})` : '';
            response += `${index + 1}. ${category} NT$ ${amount.toLocaleString('zh-TW')}`;
            if (account) response += ` [${account}]`;
            if (member) response += ` [${member}]`;
            if (note) response += note;
            response += '\n';
        });
        response += '\n';
    }
    
    if (incomes.length > 0) {
        const totalIncome = incomes.reduce((sum, r) => sum + (r.amount || 0), 0);
        response += `收入 (${incomes.length} 筆記錄，共 NT$ ${totalIncome.toLocaleString('zh-TW')})：\n`;
        incomes.forEach((record, index) => {
            const category = record.category || '未分類';
            const amount = record.amount || 0;
            const account = record.account && typeof getAccounts === 'function' ? getAccounts().find(a => a.id === record.account)?.name : '';
            response += `${index + 1}. ${category} NT$ ${amount.toLocaleString('zh-TW')}`;
            if (account) response += ` [${account}]`;
            response += '\n';
        });
        response += '\n';
    }
    
    if (transfers.length > 0) {
        response += `?? ?改??(${transfers.length} ????n`;
        transfers.forEach((record, index) => {
            const amount = record.amount || 0;
            const account = record.account && typeof getAccounts === 'function' ? getAccounts().find(a => a.id === record.account)?.name : ';
            response += `${index + 1}. NT$ ${amount.toLocaleString('zh-TW')}`;
            if (account) response += ` [${account}]`;
            response += '\n';
        });
    }
    
    return response;
}

// ?鈭亙眺?摮????????遴策??殉死?
function queryAmountAndCategory(userMessage, records) {
    // ??????
    const amountMatches = userMessage.match(/(\d+)/g);
    if (!amountMatches || amountMatches.length === 0) {
        return '?????????祗?????????????選??蹐彫\n??賃?遛?謕??????n??"????餅蔬??謕??????170"\n??"??訾?????璇舀迤???500"';
    }
    
    // ?謘暹斯????殉???蝎??選??謍啗?????綽?????????    const targetAmount = parseFloat(amountMatches[amountMatches.length - 1]);
    
    if (isNaN(targetAmount) || targetAmount <= 0) {
        return '?????哨????鈭止????????選??蹐彫\n?ｇ???格?????????選??????????餅蔬??謕??????170"';
    }
    
    // ???????謚殷??    const categoryKeywords = [
        '???', '???', '?謍?', '?啗??', '????, '??, '??,
        '?剜??, '??, '?蟡?', '???', '?殷????, '?砲??,
        '????, '??, '???', '???', '???',
        '?∵??', '?擗', '???', '???',
        '???', '???', '??,
        '?頛?', '?鳩謆?, '?擗孕', '?葡蟡?, '?祈璆?,
        '???'
    ];
    
    let targetCategory = null;
    for (const keyword of categoryKeywords) {
        if (userMessage.includes(keyword)) {
            targetCategory = keyword;
            break;
        }
    }
    
    // ?????????????謚殷?堊筑??謅疵?綜筆?????撖???????
    if (!targetCategory) {
        const allCategories = [...new Set(records.map(r => r.category).filter(c => c))];
        for (const cat of allCategories) {
            if (userMessage.includes(cat)) {
                targetCategory = cat;
                break;
            }
        }
    }
    
    // ???殉死??城?????選?????????謚??堊垢??????    let matchedRecords = records.filter(record => {
        const recordAmount = record.amount || 0;
        // ?蹓曇???????????捕?蝪????
        const amountMatch = Math.abs(recordAmount - targetAmount) <= 1;
        
        if (!amountMatch) return false;
        
        // ???????蝞???        if (record.type === 'expense' || !record.type) {
            // ???????哨???遴筑??潘撓貔?????秋??撖?
            if (targetCategory) {
                const recordCategory = record.category || '?????;
                return recordCategory.includes(targetCategory) || targetCategory.includes(recordCategory);
            }
            // ???????????????撖????
            return true;
        }
        
        return false;
    });
    
    // ??????????堆??撖?????謅疵??賂??????    if (matchedRecords.length === 0 && targetCategory) {
        matchedRecords = records.filter(record => {
            const recordAmount = record.amount || 0;
            const amountMatch = Math.abs(recordAmount - targetAmount) <= 1;
            return amountMatch && (record.type === 'expense' || !record.type);
        });
    }
    
    if (matchedRecords.length === 0) {
        let response = `?? ???????????颲?????蹐彫\n`;
        if (targetCategory) {
            response += `?謚???颲??謇???????{targetCategory}\n??????彿T$ ${targetAmount.toLocaleString('zh-TW')}\n\n`;
        } else {
            response += `?謚???颲??謇??????彿T$ ${targetAmount.toLocaleString('zh-TW')}\n\n`;
        }
        response += `???????n???????????秋????﹏n??????????????秋??撖?\n????剛??????????縈?"??餅蔬??謕???70"`;
        return response;
    }
    
    // ??止??賹??制???????????    matchedRecords.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });
    
    let response = `?? ??? ${matchedRecords.length} ??瘜??????殉死???n\n`;
    
    matchedRecords.forEach((record, index) => {
        const date = new Date(record.date);
        const dateStr = `${date.getFullYear()}??{date.getMonth() + 1}??{date.getDate()}?貕?
        const category = record.category || '?????;
        const amount = record.amount || 0;
        const account = record.account && typeof getAccounts === 'function' ? getAccounts().find(a => a.id === record.account)?.name : ';
        const member = record.member || ';
        const note = record.note ? ` (${record.note})` : ';
        
        response += `${index + 1}. ${dateStr} - ${category}?彿T$ ${amount.toLocaleString('zh-TW')}`;
        if (account) response += ` [${account}]`;
        if (member) response += ` [${member}]`;
        if (note) response += note;
        response += '\n';
    });
    
    if (matchedRecords.length === 1) {
        const record = matchedRecords[0];
        const date = new Date(record.date);
        const dateStr = `${date.getMonth() + 1}??{date.getDate()}?貕?
        response += `\n????????${dateStr}`;
    } else {
        response += `\n???????叟垓??殉死????鈭???豰??????萄?蹐?
    }
    
    return response;
}

// ?鈭亙眺?摮?????????餅???????500??芰?哨???餅??
function queryAmountOnly(userMessage, records, targetAmount) {
    // ???殉死??城??????    const matchedRecords = records.filter(record => {
        const recordAmount = record.amount || 0;
        // ?蹓曇???????????捕?蝪????
        const amountMatch = Math.abs(recordAmount - targetAmount) <= 1;
        return amountMatch && (record.type === 'expense' || !record.type);
    });
    
    if (matchedRecords.length === 0) {
        return `?? ???????????NT$ ${targetAmount.toLocaleString('zh-TW')} ????蝞???蹐彫\n???????n???????????秋????﹏n????迎??啗??選???殉死??????????
    }
    
    // ??止??賹??制???????????    matchedRecords.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });
    
    let response = `?????? NT$ ${targetAmount.toLocaleString('zh-TW')} ????蝞????\n\n`;
    
    matchedRecords.forEach((record, index) => {
        const date = new Date(record.date);
        const dateStr = `${date.getFullYear()}??{date.getMonth() + 1}??{date.getDate()}?貕?
        const category = record.category || '?????;
        const amount = record.amount || 0;
        const account = record.account && typeof getAccounts === 'function' ? getAccounts().find(a => a.id === record.account)?.name : ';
        const member = record.member || ';
        const note = record.note ? ` (${record.note})` : ';
        
        response += `${index + 1}. ${dateStr} - ${category}?彿T$ ${amount.toLocaleString('zh-TW')}`;
        if (account) response += ` [${account}]`;
        if (member) response += ` [${member}]`;
        if (note) response += note;
        response += '\n';
    });
    
    if (matchedRecords.length === 1) {
        const record = matchedRecords[0];
        const date = new Date(record.date);
        const dateStr = `${date.getMonth() + 1}??{date.getDate()}?貕?
        const category = record.category || '?????;
        response += `\n????????${dateStr} ??? ${category}`;
    }
    
    return response;
}

// ?鈭亙眺?摮??鈭?????選???殉死?????縈?12/7???1500????潮?
function queryDateAndAmount(userMessage, records, dateMatch, targetAmount) {
    // ????鈭?
    const month = parseInt(dateMatch[1]);
    const day = parseInt(dateMatch[2]);
    const now = new Date();
    
    // ??????剜謘?2???鞈?? ?????瞉?
    let targetDate;
    if (month > 12 && day <= 12) {
        targetDate = new Date(now.getFullYear(), day - 1, month);
    } else {
        targetDate = new Date(now.getFullYear(), month - 1, day);
    }
    
    // ?瞉??謘踐??賹??瞏???    const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    
    // ?鈭歹?啗謑?賹?????撖??????    const matchedRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        const recordDateStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
        const recordAmount = record.amount || 0;
        const amountMatch = Math.abs(recordAmount - targetAmount) <= 1;
        return recordDateStr === targetDateStr && amountMatch && (record.type === 'expense' || !record.type);
    });
    
    const dateStr = `${targetDate.getMonth() + 1}??{targetDate.getDate()}?貕?
    
    if (matchedRecords.length === 0) {
        return `?? ${dateStr} ???????????NT$ ${targetAmount.toLocaleString('zh-TW')} ????蝞???蹐彫\n???????n???????鈭???秋????﹏n???????????秋????︶;
    }
    
    let response = `?? ${dateStr} ??? NT$ ${targetAmount.toLocaleString('zh-TW')} ??????\n\n`;
    
    matchedRecords.forEach((record, index) => {
        const category = record.category || '?????;
        const amount = record.amount || 0;
        const account = record.account && typeof getAccounts === 'function' ? getAccounts().find(a => a.id === record.account)?.name : ';
        const member = record.member || ';
        const note = record.note ? ` (${record.note})` : ';
        
        response += `${index + 1}. ${category}?彿T$ ${amount.toLocaleString('zh-TW')}`;
        if (account) response += ` [${account}]`;
        if (member) response += ` [${member}]`;
        if (note) response += note;
        response += '\n';
    });
    
    if (matchedRecords.length === 1) {
        const record = matchedRecords[0];
        const category = record.category || '?????;
        response += `\n????????${category}`;
    }
    
    return response;
}
function getGeneralResponse(userMessage, records) {
    const responses = [
        '?????蹌????選?蹇???叟冪??????????????..',
        '?謕???????撮赯?謍梱?????????..',
        '???鈭????蹌???謕???..',
        '?撖?????殉朱??????梁???..'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + '\n\n??賃???????瞏叟??蝞蹓澗??銋蹓??遴窖?蹓暸??嚗肅蹓???????????堊??堆撕?瑟謍梱??賹??殉死?????縈?"12???賹?哨??????????撖?????殉朱??鞊?????????;
}



function generateMonthlyIncomeExpenseList(records, userMessage) {
    if (!Array.isArray(records) || records.length === 0) {
        return '?桀?瘝?閮董鞈?嚗??啣?撟曄??嗅??箏?嚗?撠梯撟思??渡?瘥?皜??;
    }
    const now = new Date();
    const ymMatch = String(userMessage || ').match(/(20\d{2})[\/\-撟弼(\d{1,2})/);
    const mMatch = String(userMessage || ').match(/(\d{1,2})??);
    let targetYear = now.getFullYear();
    let targetMonth = now.getMonth() + 1;
    if (ymMatch) {
        targetYear = Number(ymMatch[1]);
        targetMonth = Number(ymMatch[2]);
    } else if (mMatch) {
        targetMonth = Number(mMatch[1]);
    }

    const monthRecords = records.filter(r => {
        const d = new Date(r.date);
        return d.getFullYear() === targetYear && (d.getMonth() + 1) === targetMonth;
    });
    const expenses = monthRecords.filter(r => r.type === 'expense' || !r.type);
    const incomes = monthRecords.filter(r => r.type === 'income');
    const expenseTotal = expenses.reduce((s, r) => s + (r.amount || 0), 0);
    const incomeTotal = incomes.reduce((s, r) => s + (r.amount || 0), 0);

    const monthLabel = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
    let text = `?? ${monthLabel} 瘥??嗆皜\n\n`;
    text += `?嗅嚗T$ ${incomeTotal.toLocaleString('zh-TW')}嚗?{incomes.length} 蝑?\n`;
    text += `?臬嚗T$ ${expenseTotal.toLocaleString('zh-TW')}嚗?{expenses.length} 蝑?\n`;
    text += `蝯?嚗T$ ${(incomeTotal - expenseTotal).toLocaleString('zh-TW')}\n\n`;
    text += `??交?蝝啜n`;
    if (!incomes.length) text += `- ?祆?瘝??嗅閮?\n`;
    incomes.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20).forEach(r => {
        text += `- ${r.date || '}嚚?{r.category || '?芸?憿?}嚚T$ ${(r.amount || 0).toLocaleString('zh-TW')}\n`;
    });
    text += `\n??箸?蝝啜n`;
    if (!expenses.length) text += `- ?祆?瘝??臬閮?\n`;
    expenses.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20).forEach(r => {
        text += `- ${r.date || '}嚚?{r.category || '?芸?憿?}嚚T$ ${(r.amount || 0).toLocaleString('zh-TW')}\n`;
    });
    text += `\n?航撓?乓?{targetYear}-${String(targetMonth === 12 ? 1 : targetMonth + 1).padStart(2, '0')} ?嗆皜???銝???;
    return text;
}



