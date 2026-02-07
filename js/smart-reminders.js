// 智慧提醒系統
// 消費習慣提醒、投資機會提醒、帳單支付提醒

class SmartReminderSystem {
    constructor() {
        this.isInitialized = false;
        this.reminders = [];
        this.notificationQueue = [];
        this.settings = {
            consumptionReminders: true,
            investmentReminders: true,
            billReminders: true,
            reminderTime: '09:00',
            reminderDays: ['monday', 'wednesday', 'friday']
        };
        this.loadSettings();
        this.loadReminders();
    }
    
    // 初始化智慧提醒系統
    init() {
        if (this.isInitialized) return;
        
        this.bindEvents();
        this.scheduleReminders();
        this.checkPendingReminders();
        this.isInitialized = true;
        
        console.log('智慧提醒系統已初始化');
    }
    
    // 綁定事件
    bindEvents() {
        // 監聽記帳記錄變化
        this.observeAccountingRecords();
        
        // 監聽投資記錄變化
        this.observeInvestmentRecords();
        
        // 監聽時間變化（每分鐘檢查一次）
        setInterval(() => {
            this.checkScheduledReminders();
        }, 60000);
        
        // 監聽智慧提醒按鈕
        const smartRemindersBtn = document.getElementById('smartRemindersBtn');
        if (smartRemindersBtn) {
            smartRemindersBtn.addEventListener('click', () => {
                this.showReminderPanel();
            });
        }
    }
    
    // 監聽記帳記錄
    observeAccountingRecords() {
        // 監聽 localStorage 變錄變化
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            originalSetItem.call(this, key, value);
            
            if (key === 'accountingRecords') {
                setTimeout(() => {
                    if (window.smartReminderSystem) {
                        window.smartReminderSystem.handleAccountingRecordChange();
                    }
                }, 100);
            }
        };
    }
    
    // 監聽投資記錄
    observeInvestmentRecords() {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            originalSetItem.call(this, key, value);
            
            if (key === 'investmentRecords') {
                setTimeout(() => {
                    if (window.smartReminderSystem) {
                        window.smartReminderSystem.handleInvestmentRecordChange();
                    }
                }, 100);
            }
        };
    }
    
    // 處理記帳記錄變化
    handleAccountingRecordChange() {
        const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
        this.analyzeConsumptionPattern(records);
        this.checkConsumptionAlerts(records);
    }
    
    // 處理投資記錄變化
    handleInvestmentRecordChange() {
        const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
        this.analyzeInvestmentOpportunities(records);
        this.checkInvestmentAlerts(records);
    }
    
    // 分析消費模式
    analyzeConsumptionPattern(records) {
        if (records.length === 0) return;
        
        const recentRecords = records.slice(-30); // 最近30筆記錄
        const today = new Date();
        const thisWeek = this.getWeekRecords(recentRecords, today);
        const lastWeek = this.getWeekRecords(recentRecords.slice(-60, -30), new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
        
        // 分析週消費趨勢
        const thisWeekTotal = thisWeek.reduce((sum, record) => sum + (record.amount || 0), 0);
        const lastWeekTotal = lastWeek.reduce((sum, record) => sum + (record.amount || 0), 0);
        const weekOverWeek = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
        
        // 檢查是否需要提醒
        if (Math.abs(weekOverWeek) > 20) {
            this.createConsumptionReminder('trend', {
                type: 'trend',
                change: weekOverWeek,
                thisWeek: thisWeekTotal,
                lastWeek: lastWeekTotal
            });
        }
        
        // 分析分類消費
        const categoryAnalysis = this.analyzeCategorySpending(thisWeek);
        this.checkCategoryAlerts(categoryAnalysis);
    }
    
    // 分析投資機會
    analyzeInvestmentOpportunities(records) {
        const portfolio = this.calculatePortfolio(records);
        const cashPosition = this.getCashPosition();
        
        // 檢查現金過多
        if (cashPosition > 50000) {
            this.createInvestmentReminder('cash_surplus', {
                type: 'cash_surplus',
                amount: cashPosition,
                suggestion: '考慮將多餘現金投入投資'
            });
        }
        
        // 檢查投資機會
        this.checkMarketOpportunities();
    }
    
    // 檢查消費警報
    checkConsumptionAlerts(records) {
        const today = new Date();
        const todayRecords = records.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.toDateString() === today.toDateString();
        });
        
        const todayTotal = todayRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
        
        // 檢查今日消費是否過高
        const dailyBudget = this.getDailyBudget();
        if (todayTotal > dailyBudget * 1.5) {
            this.createConsumptionReminder('daily_limit', {
                type: 'daily_limit',
                spent: todayTotal,
                budget: dailyBudget,
                over: todayTotal - dailyBudget
            });
        }
    }
    
    // 檢查投資警報
    checkInvestmentAlerts(records) {
        // 檢查投資組合再平衡
        this.checkRebalancingNeeds(records);
        
        // 檢查投資機會
        this.analyzeInvestmentOpportunities(records);
    }
    
    // 檢查帳單支付提醒
    checkBillReminders() {
        const bills = this.getBills();
        const today = new Date();
        
        bills.forEach(bill => {
            const dueDate = new Date(bill.dueDate);
            const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            // 提前3天提醒
            if (daysUntilDue === 3) {
                this.createBillReminder('upcoming', {
                    type: 'upcoming',
                    bill: bill,
                    daysUntilDue: daysUntilDue
                });
            }
            
            // 當天提醒
            if (daysUntilDue === 0) {
                this.createBillReminder('due_today', {
                    type: 'due_today',
                    bill: bill
                });
            }
            
            // 過期提醒
            if (daysUntilDue < 0) {
                this.createBillReminder('overdue', {
                    type: 'overdue',
                    bill: bill,
                    daysOverdue: Math.abs(daysUntilDue)
                });
            }
        });
    }
    
    // 創建消費提醒
    createConsumptionReminder(type, data) {
        const reminder = {
            id: `consumption_${Date.now()}`,
            type: 'consumption',
            subtype: type,
            title: this.getConsumptionReminderTitle(type, data),
            message: this.getConsumptionReminderMessage(type, data),
            data: data,
            timestamp: new Date().toISOString(),
            priority: this.getConsumptionReminderPriority(type, data),
            actions: this.getConsumptionReminderActions(type, data)
        };
        
        this.addReminder(reminder);
        this.showNotification(reminder);
    }
    
    // 創建投資提醒
    createInvestmentReminder(type, data) {
        const reminder = {
            id: `investment_${Date.now()}`,
            type: 'investment',
            subtype: type,
            title: this.getInvestmentReminderTitle(type, data),
            message: this.getInvestmentReminderMessage(type, data),
            data: data,
            timestamp: new Date().toISOString(),
            priority: this.getInvestmentReminderPriority(type, data),
            actions: this.getInvestmentReminderActions(type, data)
        };
        
        this.addReminder(reminder);
        this.showNotification(reminder);
    }
    
    // 創建帳單提醒
    createBillReminder(type, data) {
        const reminder = {
            id: `bill_${Date.now()}`,
            type: 'bill',
            subtype: type,
            title: this.getBillReminderTitle(type, data),
            message: this.getBillReminderMessage(type, data),
            data: data,
            timestamp: new Date().toISOString(),
            priority: this.getBillReminderPriority(type, data),
            actions: this.getBillReminderActions(type, data)
        };
        
        this.addReminder(reminder);
        this.showNotification(reminder);
    }
    
    // 顯示通知
    showNotification(reminder) {
        // 檢查瀏覽器支援
        if (!('Notification' in window)) {
            console.log('瀏覽器不支援通知功能');
            return;
        }
        
        // 請求通知權限
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.displayNotification(reminder);
                }
            });
        } else if (Notification.permission === 'granted') {
            this.displayNotification(reminder);
        }
    }
    
    // 顯示瀏覽器通知
    displayNotification(reminder) {
        const notification = new Notification(reminder.title, {
            body: reminder.message,
            icon: this.getNotificationIcon(reminder.type),
            tag: reminder.id,
            requireInteraction: reminder.priority === 'high'
        });
        
        notification.onclick = () => {
            this.handleNotificationClick(reminder);
            notification.close();
        };
        
        // 自動關閉
        setTimeout(() => {
            notification.close();
        }, 5000);
    }
    
    // 處理通知點擊
    handleNotificationClick(reminder) {
        // 根據提醒類型執行相應操作
        switch (reminder.type) {
            case 'consumption':
                this.handleConsumptionNotificationClick(reminder);
                break;
            case 'investment':
                this.handleInvestmentNotificationClick(reminder);
                break;
            case 'bill':
                this.handleBillNotificationClick(reminder);
                break;
        }
    }
    
    // 處理消費通知點擊
    handleConsumptionNotificationClick(reminder) {
        // 跳轉到記帳本頁面
        this.navigateToPage('ledger');
        
        // 顯示詳細分析
        if (reminder.subtype === 'trend') {
            setTimeout(() => {
                this.showConsumptionAnalysis(reminder.data);
            }, 500);
        }
    }
    
    // 處理投資通知點擊
    handleInvestmentNotificationClick(reminder) {
        // 跳轉到投資頁面
        this.navigateToPage('investment');
        
        // 顯示投資建議
        if (reminder.subtype === 'cash_surplus') {
            setTimeout(() => {
                this.showInvestmentSuggestions(reminder.data);
            }, 500);
        }
    }
    
    // 處理帳單通知點擊
    handleBillNotificationClick(reminder) {
        // 顯示帳單詳情
        this.showBillDetails(reminder.data);
    }
    
    // 獲取消費提醒標題
    getConsumptionReminderTitle(type, data) {
        const titles = {
            'trend': '📈 消費趨勢提醒',
            'daily_limit': '⚠️ 每日消費提醒',
            'category_alert': '🏷️ 分類消費提醒',
            'budget_warning': '💰 預算警報',
            'no_records': '📝 長期未記帳提醒'
        };
        return titles[type] || '💡 消費提醒';
    }
    
    // 獲取消費提醒訊息
    getConsumptionReminderMessage(type, data) {
        const messages = {
            'trend': `本週消費${data.change > 0 ? '增加' : '減少'}了 ${Math.abs(data.change).toFixed(1)}%，從 NT$${(data.lastWeek || 0).toLocaleString()} 到 NT$${(data.thisWeek || 0).toLocaleString()}`,
            'daily_limit': `今日已消費 NT$${(data.spent || 0).toLocaleString()}，超過預算 NT$${(data.over || 0).toLocaleString()}`,
            'category_alert': '某個分類的消費異常增加，建議檢視消費習慣',
            'budget_warning': '本月預算即將用盡，建議控制消費',
            'no_records': `您已經 ${data.daysSinceLastRecord || 0} 天沒有記帳了，建議保持記帳習慣`
        };
        return messages[type] || '消費提醒訊息';
    }
    
    // 獲取投資提醒標題
    getInvestmentReminderTitle(type, data) {
        const titles = {
            'cash_surplus': '💰 現金過多提醒',
            'rebalancing': '⚖️ 投資組合再平衡',
            'opportunity': '📈 投資機會提醒',
            'dividend': '💵 股息提醒',
            'market_alert': '📊 市場變動提醒'
        };
        return titles[type] || '📊 投資提醒';
    }
    
    // 獲取投資提醒訊息
    getInvestmentReminderMessage(type, data) {
        const messages = {
            'cash_surplus': `您有 NT$${(data.amount || 0).toLocaleString()} 的多餘現金，考慮投入投資以獲得更好回報`,
            'rebalancing': '您的投資組合需要再平衡以維持目標資產配置',
            'opportunity': '市場出現投資機會，建議考慮增加投資',
            'dividend': '您的投資有股息收入，考慮再投資以複利增長',
            'market_alert': '市場出現顯著變動，建議檢視您的投資組合'
        };
        return messages[type] || '投資提醒訊息';
    }
    
    // 獲取帳單提醒標題
    getBillReminderTitle(type, data) {
        const titles = {
            'upcoming': '📅 帳單即將到期',
            'due_today': '📅 帳單今日到期',
            'overdue': '📅 帳單已過期',
            'paid': '✅ 帳單已支付'
        };
        return titles[type] || '📅 帳單提醒';
    }
    
    // 獲取帳單提醒訊息
    getBillReminderMessage(type, data) {
        const messages = {
            'upcoming': `${data.bill?.name || '未知帳單'} 將於 ${data.daysUntilDue || 0} 天後到期，金額 NT$${(data.bill?.amount || 0).toLocaleString()}`,
            'due_today': `${data.bill?.name || '未知帳單'} 今日到期，金額 NT$${(data.bill?.amount || 0).toLocaleString()}`,
            'overdue': `${data.bill?.name || '未知帳單'} 已過期 ${data.daysOverdue || 0} 天，金額 NT$${(data.bill?.amount || 0).toLocaleString()}`,
            'paid': `${data.bill?.name || '未知帳單'} 已支付，金額 NT$${(data.bill?.amount || 0).toLocaleString()}`
        };
        return messages[type] || '帳單提醒訊息';
    }
    
    // 獲取通知圖標
    getNotificationIcon(type) {
        const icons = {
            'consumption': '💰',
            'investment': '📈',
            'bill': '📅'
        };
        return icons[type] || '🔔';
    }
    
    // 獲取提醒優先級
    getConsumptionReminderPriority(type, data) {
        const priorities = {
            'daily_limit': 'high',
            'trend': 'medium',
            'category_alert': 'medium',
            'budget_warning': 'high',
            'no_records': 'medium'
        };
        return priorities[type] || 'medium';
    }
    
    // 獲取投資提醒優先級
    getInvestmentReminderPriority(type, data) {
        const priorities = {
            'cash_surplus': 'medium',
            'rebalancing': 'high',
            'opportunity': 'medium',
            'dividend': 'low',
            'market_alert': 'high'
        };
        return priorities[type] || 'medium';
    }
    
    // 獲取帳單提醒優先級
    getBillReminderPriority(type, data) {
        const priorities = {
            'upcoming': 'medium',
            'due_today': 'high',
            'overdue': 'high',
            'paid': 'low'
        };
        return priorities[type] || 'medium';
    }
    
    // 獲取提醒操作
    getConsumptionReminderActions(type, data) {
        const actions = {
            'trend': [
                { label: '查看分析', action: 'show_analysis' },
                { label: '設定預算', action: 'set_budget' }
            ],
            'daily_limit': [
                { label: '查看明細', action: 'show_details' },
                { label: '設定限制', action: 'set_limit' }
            ],
            'no_records': [
                { label: '立即記帳', action: 'start_recording' },
                { label: '查看歷史', action: 'show_history' }
            ]
        };
        return actions[type] || [];
    }
    
    // 獲取投資提醒操作
    getInvestmentReminderActions(type, data) {
        const actions = {
            'cash_surplus': [
                { label: '投資建議', action: 'investment_suggestions' },
                { label: '轉帳設定', action: 'transfer_setup' }
            ],
            'rebalancing': [
                { label: '再平衡', action: 'rebalance' },
                { label: '查看詳情', action: 'show_details' }
            ]
        };
        return actions[type] || [];
    }
    
    // 獲取帳單提醒操作
    getBillReminderActions(type, data) {
        const actions = {
            'upcoming': [
                { label: '設定提醒', action: 'set_reminder' },
                { label: '立即支付', action: 'pay_now' }
            ],
            'due_today': [
                { label: '立即支付', action: 'pay_now' },
                { label: '查看詳情', action: 'show_details' }
            ]
        };
        return actions[type] || [];
    }
    
    // 新增提醒
    addReminder(reminder) {
        this.reminders.push(reminder);
        this.saveReminders();
        
        // 限制提醒數量
        if (this.reminders.length > 100) {
            this.reminders = this.reminders.slice(-50);
        }
    }
    
    // 排程提醒
    scheduleReminders() {
        // 每天檢查帳單提醒
        this.scheduleDailyBillCheck();
        
        // 每週檢查消費模式
        this.scheduleWeeklyConsumptionCheck();
        
        // 每月檢查投資機會
        this.scheduleMonthlyInvestmentCheck();
    }
    
    // 每日帳單檢查
    scheduleDailyBillCheck() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        
        const timeUntilTomorrow = tomorrow - now;
        
        setTimeout(() => {
            this.checkBillReminders();
            this.scheduleDailyBillCheck(); // 遞迴排程
        }, timeUntilTomorrow);
    }
    
    // 每週消費檢查
    scheduleWeeklyConsumptionCheck() {
        const now = new Date();
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(10, 0, 0, 0);
        
        const timeUntilNextWeek = nextWeek - now;
        
        setTimeout(() => {
            this.performWeeklyConsumptionCheck();
            this.scheduleWeeklyConsumptionCheck(); // 遞迴排程
        }, timeUntilNextWeek);
    }
    
    // 每月投資檢查
    scheduleMonthlyInvestmentCheck() {
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        nextMonth.setHours(10, 0, 0, 0);
        
        const timeUntilNextMonth = nextMonth - now;
        
        setTimeout(() => {
            this.performMonthlyInvestmentCheck();
            this.scheduleMonthlyInvestmentCheck(); // 遞迴排程
        }, timeUntilNextMonth);
    }
    
    // 執行每週消費檢查
    performWeeklyConsumptionCheck() {
        const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
        this.analyzeConsumptionPattern(records);
    }
    
    // 執行每月投資檢查
    performMonthlyInvestmentCheck() {
        const records = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
        this.analyzeInvestmentOpportunities(records);
    }
    
    // 檢查待處理提醒
    checkPendingReminders() {
        const now = new Date();
        this.reminders.forEach(reminder => {
            const reminderTime = new Date(reminder.timestamp);
            const hoursSinceReminder = (now - reminderTime) / (1000 * 60 * 60);
            
            // 24小時內的提醒重新顯示
            if (hoursSinceReminder < 24 && reminder.priority === 'high') {
                this.showNotification(reminder);
            }
        });
    }
    
    // 檢查排程提醒
    checkScheduledReminders() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // 檢查是否到了提醒時間
        if (currentHour === 9 && currentMinute === 0) {
            this.checkBillReminders();
        }
        
        if (currentHour === 10 && currentMinute === 0) {
            this.performWeeklyConsumptionCheck();
        }
    }
    
    // 獲取週記錄
    getWeekRecords(records, date) {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        return records.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= weekStart && recordDate <= weekEnd;
        });
    }
    
    // 分析分類消費
    analyzeCategorySpending(records) {
        const categorySpending = {};
        
        records.forEach(record => {
            const category = record.category || '未分類';
            categorySpending[category] = (categorySpending[category] || 0) + (record.amount || 0);
        });
        
        return categorySpending;
    }
    
    // 檢查分類警報
    checkCategoryAlerts(categoryAnalysis) {
        const totalSpending = Object.values(categoryAnalysis).reduce((sum, amount) => sum + amount, 0);
        
        Object.entries(categoryAnalysis).forEach(([category, amount]) => {
            const percentage = (amount / totalSpending) * 100;
            
            // 如果某個分類超過40%，發出警報
            if (percentage > 40) {
                this.createConsumptionReminder('category_alert', {
                    type: 'category_alert',
                    category: category,
                    amount: amount,
                    percentage: percentage
                });
            }
        });
    }
    
    // 計算投資組合
    calculatePortfolio(records) {
        const portfolio = {};
        
        records.forEach(record => {
            if (record.type === 'buy') {
                if (!portfolio[record.stockCode]) {
                    portfolio[record.stockCode] = {
                        shares: 0,
                        totalCost: 0,
                        avgCost: 0
                    };
                }
                
                portfolio[record.stockCode].shares += record.shares;
                portfolio[record.stockCode].totalCost += record.shares * record.price;
                portfolio[record.stockCode].avgCost = portfolio[record.stockCode].totalCost / portfolio[record.stockCode].shares;
            } else if (record.type === 'sell') {
                if (portfolio[record.stockCode]) {
                    portfolio[record.stockCode].shares -= record.shares;
                    if (portfolio[record.stockCode].shares <= 0) {
                        delete portfolio[record.stockCode];
                    }
                }
            }
        });
        
        return portfolio;
    }
    
    // 獲取現金位置
    getCashPosition() {
        try {
            // 從實際帳戶餘額計算現金位置
            const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
            let totalCash = 0;
            
            accounts.forEach(account => {
                if (account.type === 'cash' || account.type === 'bank' || account.type === 'wallet') {
                    totalCash += account.balance || 0;
                }
            });
            
            return totalCash;
        } catch (error) {
            console.error('獲取現金位置失敗:', error);
            return 10000; // 預設值
        }
    }
    
    // 獲取每日預算
    getDailyBudget() {
        try {
            // 從預算設定中獲取
            const budgetSettings = JSON.parse(localStorage.getItem('budgetSettings') || '{}');
            
            if (budgetSettings.monthlyBudget) {
                return budgetSettings.monthlyBudget / 30;
            }
            
            // 如果沒有設定預算，根據歷史消費計算建議預算
            const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
            if (records.length > 0) {
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                
                const lastMonthRecords = records.filter(record => {
                    const recordDate = new Date(record.date);
                    return recordDate >= lastMonth && recordDate < new Date();
                });
                
                const avgMonthlySpending = lastMonthRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
                return avgMonthlySpending / 30;
            }
            
            // 預設每日預算
            return 1000;
        } catch (error) {
            console.error('獲取每日預算失敗:', error);
            return 1000; // 預設值
        }
    }
    
    // 獲取帳單
    getBills() {
        try {
            // 從實際帳單設定中獲取
            const bills = JSON.parse(localStorage.getItem('bills') || '[]');
            
            if (bills.length > 0) {
                return bills.filter(bill => !bill.paid); // 只返回未支付的帳單
            }
            
            // 如果沒有設定帳單，返回一些常見的示例帳單
            const today = new Date();
            return [
                {
                    id: 'bill_electricity',
                    name: '電費',
                    amount: 1200,
                    dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    paid: false
                },
                {
                    id: 'bill_water',
                    name: '水費',
                    amount: 300,
                    dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    paid: false
                },
                {
                    id: 'bill_internet',
                    name: '網路費',
                    amount: 999,
                    dueDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    paid: false
                },
                {
                    id: 'bill_phone',
                    name: '電話費',
                    amount: 800,
                    dueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    paid: false
                }
            ];
        } catch (error) {
            console.error('獲取帳單失敗:', error);
            return [];
        }
    }
    
    // 檢查市場機會
    checkMarketOpportunities() {
        // 這裡可以整合真實的市場數據
        // 簡化版本：基於時間觸發一般機會提醒
        const now = new Date();
        const hour = now.getHours();
        
        // 在交易時間檢查市場機會
        if (hour >= 9 && hour <= 15) {
            this.createInvestmentReminder('opportunity', {
                type: 'opportunity',
                message: '市場活躍，可能存在投資機會'
            });
        }
    }
    
    // 檢查再平衡需求
    checkRebalancingNeeds(records) {
        const portfolio = this.calculatePortfolio(records);
        const portfolioValue = Object.values(portfolio).reduce((sum, stock) => sum + (stock.shares * 100), 0); // 簡化計算
        
        // 如果投資組合價值變化超過20%，建議再平衡
        // 這裡需要更複雜的邏輯來計算目標配置偏差
        if (portfolioValue > 100000) {
            this.createInvestmentReminder('rebalancing', {
                type: 'rebalancing',
                portfolioValue: portfolioValue
            });
        }
    }
    
    // 顯示提醒面板
    showReminderPanel() {
        // 移除現有面板
        const existingPanel = document.querySelector('.reminder-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        const panel = document.createElement('div');
        panel.className = 'reminder-panel';
        panel.innerHTML = `
            <div class="reminder-header">
                <h3>🔔 智慧提醒</h3>
                <button class="reminder-close" onclick="this.closest('.reminder-panel').remove()">✕</button>
            </div>
            <div class="reminder-content">
                <div class="reminder-stats">
                    <div class="stat-card">
                        <div class="stat-value">${this.reminders.length}</div>
                        <div class="stat-label">總提醒</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${this.getTodayReminders().length}</div>
                        <div class="stat-label">今日提醒</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${this.getHighPriorityReminders().length}</div>
                        <div class="stat-label">高優先級</div>
                    </div>
                </div>
                
                <div class="reminder-settings">
                    <h4>⚙️ 提醒設定</h4>
                    <div class="setting-group">
                        <label class="setting-label">消費習慣提醒</label>
                        <div class="setting-control">
                            <input type="checkbox" class="setting-checkbox" id="consumptionReminders" ${this.settings.consumptionReminders ? 'checked' : ''}>
                            <span class="setting-label">啟用消費習慣提醒</span>
                        </div>
                    </div>
                    <div class="setting-group">
                        <label class="setting-label">投資機會提醒</label>
                        <div class="setting-control">
                            <input type="checkbox" class="setting-checkbox" id="investmentReminders" ${this.settings.investmentReminders ? 'checked' : ''}>
                            <span class="setting-label">啟用投資機會提醒</span>
                        </div>
                    </div>
                    <div class="setting-group">
                        <label class="setting-label">帳單支付提醒</label>
                        <div class="setting-control">
                            <input type="checkbox" class="setting-checkbox" id="billReminders" ${this.settings.billReminders ? 'checked' : ''}>
                            <span class="setting-label">啟用帳單支付提醒</span>
                        </div>
                    </div>
                    <div class="setting-group">
                        <label class="setting-label">提醒時間</label>
                        <input type="time" class="setting-time" id="reminderTime" value="${this.settings.reminderTime}">
                    </div>
                    <div class="setting-group">
                        <label class="setting-label">提醒日期</label>
                        <select class="setting-select" id="reminderDays" multiple>
                            <option value="monday" ${this.settings.reminderDays.includes('monday') ? 'selected' : ''}>星期一</option>
                            <option value="tuesday" ${this.settings.reminderDays.includes('tuesday') ? 'selected' : ''}>星期二</option>
                            <option value="wednesday" ${this.settings.reminderDays.includes('wednesday') ? 'selected' : ''}>星期三</option>
                            <option value="thursday" ${this.settings.reminderDays.includes('thursday') ? 'selected' : ''}>星期四</option>
                            <option value="friday" ${this.settings.reminderDays.includes('friday') ? 'selected' : ''}>星期五</option>
                            <option value="saturday" ${this.settings.reminderDays.includes('saturday') ? 'selected' : ''}>星期六</option>
                            <option value="sunday" ${this.settings.reminderDays.includes('sunday') ? 'selected' : ''}>星期日</option>
                        </select>
                    </div>
                </div>
                
                <div class="reminder-history">
                    <h4>📋 提醒歷史</h4>
                    <div class="reminder-history" id="reminderHistory">
                        ${this.renderReminderHistory()}
                    </div>
                </div>
                
                <div class="reminder-actions">
                    <button class="reminder-action" onclick="smartReminderSystem.clearReminderHistory()">清除歷史</button>
                    <button class="reminder-action" onclick="smartReminderSystem.testAllReminders()">測試所有提醒</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // 綁定設定變更事件
        this.bindSettingsEvents();
        
        // 自動關閉（點擊外部時）
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                panel.remove();
            }
        });
    }
    
    // 綁定設定事件
    bindSettingsEvents() {
        const panel = document.querySelector('.reminder-panel');
        if (!panel) return;
        
        // 消費習慣提醒
        const consumptionCheckbox = panel.querySelector('#consumptionReminders');
        if (consumptionCheckbox) {
            consumptionCheckbox.addEventListener('change', (e) => {
                this.updateSettings({ consumptionReminders: e.target.checked });
            });
        }
        
        // 投資機會提醒
        const investmentCheckbox = panel.querySelector('#investmentReminders');
        if (investmentCheckbox) {
            investmentCheckbox.addEventListener('change', (e) => {
                this.updateSettings({ investmentReminders: e.target.checked });
            });
        }
        
        // 帳單支付提醒
        const billCheckbox = panel.querySelector('#billReminders');
        if (billCheckbox) {
            billCheckbox.addEventListener('change', (e) => {
                this.updateSettings({ billReminders: e.target.checked });
            });
        }
        
        // 提醒時間
        const timeInput = panel.querySelector('#reminderTime');
        if (timeInput) {
            timeInput.addEventListener('change', (e) => {
                this.updateSettings({ reminderTime: e.target.value });
            });
        }
        
        // 提醒日期
        const daysSelect = panel.querySelector('#reminderDays');
        if (daysSelect) {
            daysSelect.addEventListener('change', (e) => {
                const selectedDays = Array.from(e.target.selectedOptions).map(option => option.value);
                this.updateSettings({ reminderDays: selectedDays });
            });
        }
    }
    
    // 獲取今日提醒
    getTodayReminders() {
        const today = new Date();
        return this.reminders.filter(reminder => {
            const reminderDate = new Date(reminder.timestamp);
            return reminderDate.toDateString() === today.toDateString();
        });
    }
    
    // 獲取高優先級提醒
    getHighPriorityReminders() {
        return this.reminders.filter(reminder => reminder.priority === 'high');
    }
    
    // 渲染提醒歷史
    renderReminderHistory() {
        const history = this.getReminderHistory();
        if (history.length === 0) {
            return '<div class="history-item">暫無提醒歷史</div>';
        }
        
        return history.slice(0, 10).map(reminder => `
            <div class="history-item">
                <div class="history-time">${new Date(reminder.timestamp).toLocaleString()}</div>
                <div class="history-title">${reminder.title}</div>
                <div class="history-message">${reminder.message}</div>
            </div>
        `).join('');
    }
    
    // 測試所有提醒
    testAllReminders() {
        // 測試消費提醒
        this.createConsumptionReminder('trend', {
            type: 'trend',
            change: 25,
            thisWeek: 3500,
            lastWeek: 2800
        });
        
        // 測試投資提醒
        this.createInvestmentReminder('cash_surplus', {
            type: 'cash_surplus',
            amount: 75000,
            suggestion: '考慮將多餘現金投入投資'
        });
        
        // 測試帳單提醒
        this.createBillReminder('upcoming', {
            bill: {
                id: 'test_bill',
                name: '測試帳單',
                amount: 1500,
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                paid: false
            },
            daysUntilDue: 3
        });
        
        console.log('測試提醒已創建');
    }
    
    // 導航到頁面
    navigateToPage(page) {
        // 這裡需要與主應用程式的頁面導航系統整合
        if (window.switchPage) {
            window.switchPage(page);
        }
    }
    
    // 顯示消費分析
    showConsumptionAnalysis(data) {
        // 顯示消費分析面板
        if (window.SmartAccountingManager) {
            window.SmartAccountingManager.analyzeSpendingPattern();
        }
    }
    
    // 顯示投資建議
    showInvestmentSuggestions(data) {
        // 顯示投資建議面板
        console.log('投資建議:', data);
    }
    
    // 顯示帳單詳情
    showBillDetails(bill) {
        // 顯示帳單詳情面板
        console.log('帳單詳情:', bill);
    }
    
    // 載入設定
    loadSettings() {
        try {
            const saved = localStorage.getItem('smartReminderSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('載入提醒設定失敗:', error);
        }
    }
    
    // 保存設定
    saveSettings() {
        try {
            localStorage.setItem('smartReminderSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('保存提醒設定失敗:', error);
        }
    }
    
    // 載入提醒
    loadReminders() {
        try {
            const saved = localStorage.getItem('smartReminders');
            if (saved) {
                this.reminders = JSON.parse(saved);
            }
        } catch (error) {
            console.error('載入提醒失敗:', error);
            this.reminders = [];
        }
    }
    
    // 保存提醒
    saveReminders() {
        try {
            localStorage.setItem('smartReminders', JSON.stringify(this.reminders));
        } catch (error) {
            console.error('保存提醒失敗:', error);
        }
    }
    
    // 獲取提醒歷史
    getReminderHistory() {
        return this.reminders.slice(-20).reverse();
    }
    
    // 清除提醒歷史
    clearReminderHistory() {
        this.reminders = [];
        this.saveReminders();
    }
    
    // 更新設定
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }
    
    // 執行主動檢查
    performProactiveChecks() {
        console.log('🔔 執行智慧提醒主動檢查...');
        
        // 檢查帳單提醒
        this.checkBillReminders();
        
        // 檢查今日消費
        const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
        this.checkConsumptionAlerts(records);
        
        // 檢查投資機會
        const investmentRecords = JSON.parse(localStorage.getItem('investmentRecords') || '[]');
        this.checkInvestmentAlerts(investmentRecords);
        
        // 檢查長期未記帳
        this.checkLongTermNoRecords(records);
        
        console.log('✅ 智慧提醒主動檢查完成');
    }
    
    // 檢查長期未記帳
    checkLongTermNoRecords(records) {
        if (records.length === 0) return;
        
        const lastRecord = records[records.length - 1];
        const lastRecordDate = new Date(lastRecord.date);
        const today = new Date();
        const daysSinceLastRecord = Math.floor((today - lastRecordDate) / (1000 * 60 * 60 * 24));
        
        // 如果超過3天未記帳，發出提醒
        if (daysSinceLastRecord >= 3) {
            this.createConsumptionReminder('no_records', {
                type: 'no_records',
                daysSinceLastRecord: daysSinceLastRecord,
                lastRecordDate: lastRecord.date
            });
        }
    }
}

// 創建智慧提醒系統實例
const smartReminderSystem = new SmartReminderSystem();

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', function() {
    smartReminderSystem.init();
    
    // 延遲執行主動檢查，確保其他系統已載入
    setTimeout(() => {
        smartReminderSystem.performProactiveChecks();
    }, 2000);
});

// 導出系統供其他模組使用
window.SmartReminderSystem = smartReminderSystem;
