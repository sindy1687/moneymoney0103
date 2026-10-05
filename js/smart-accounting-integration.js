// 智慧記帳功能整合腳本
// 將智慧記帳功能整合到主應用程式中

// 智慧記帳功能管理器
class SmartAccountingManager {
    constructor() {
        this.isInitialized = false;
        this.userCorrections = [];
        this.suggestionHistory = [];
    }
    
    // 初始化智慧記帳功能
    init() {
        if (this.isInitialized) return;
        
        this.bindEvents();
        this.loadUserCorrections();
        this.isInitialized = true;
        
        console.log('智慧記帳功能已初始化');
    }
    
    // 綁定事件
    bindEvents() {
        // 智慧建議（按鈕與輸入時自動跳出的分類建議）已移除

        // 監聽分類選擇
        const categorySelect = document.getElementById('category');
        if (categorySelect) {
            categorySelect.addEventListener('change', () => {
                this.handleCategoryChange();
            });
        }
        
        // 監聽表單提交
        const recordForm = document.getElementById('recordForm');
        if (recordForm) {
            recordForm.addEventListener('submit', () => {
                this.handleRecordSubmit();
            });
        }
        
        // 監聽智慧分析按鈕
        const smartAnalysisBtn = document.getElementById('smartAnalysisBtn') || document.getElementById('aiHousekeeperBtn');
        if (smartAnalysisBtn) {
            smartAnalysisBtn.addEventListener('click', () => {
                if (window.smartReminderSystem && typeof window.smartReminderSystem.showReminderPanel === 'function') {
                    window.smartReminderSystem.showReminderPanel();
                } else {
                    this.analyzeSpendingPattern();
                }
            });
        }
    }

    // 處理分類變化
    handleCategoryChange() {
        const selectedCategory = document.getElementById('category')?.value;
        const amount = parseFloat(document.getElementById('amount')?.value || 0);
        const description = document.getElementById('description')?.value || '';
        
        if (selectedCategory && amount > 0) {
            this.recordUserCorrection(selectedCategory, amount, description);
        }
    }
    
    // 處理記錄提交
    handleRecordSubmit() {
        // 在提交記錄時學習使用者偏好
        this.learnFromRecord();
    }
    
    // 記錄使用者修正
    recordUserCorrection(correctCategory, amount, description) {
        const originalSuggestion = this.getLastSuggestion(amount, description);
        
        if (originalSuggestion && originalSuggestion.primary !== correctCategory) {
            const correction = {
                originalCategory: originalSuggestion.primary,
                correctCategory: correctCategory,
                amount: amount,
                description: description,
                time: new Date().toISOString()
            };
            
            this.userCorrections.push(correction);
            this.saveUserCorrections();
            
            // 更新學習模型
            this.updateLearningModel();
        }
    }
    
    // 取得最後的建議
    getLastSuggestion(amount, description) {
        if (typeof SmartAccounting === 'undefined') return null;
        
        const key = `${amount}_${description}`;
        return SmartAccounting.suggestCategory(amount, description);
    }
    
    // 從記錄中學習
    learnFromRecord() {
        const amount = parseFloat(document.getElementById('amount')?.value || 0);
        const description = document.getElementById('description')?.value || '';
        const category = document.getElementById('category')?.value;
        
        if (amount > 0 && description && category) {
            const suggestion = SmartAccounting.suggestCategory(amount, description);
            
            if (suggestion && suggestion.primary !== category) {
                this.recordUserCorrection(category, amount, description);
            }
        }
    }
    
    // 更新學習模型
    updateLearningModel() {
        if (typeof SmartAccounting === 'undefined') return;
        
        try {
            const preferences = SmartAccounting.learnUserPreferences([], this.userCorrections);
            SmartAccounting.updateCategoryRules(preferences);
            
            console.log('智慧記帳學習模型已更新');
        } catch (error) {
            console.error('更新學習模型失敗:', error);
        }
    }
    
    // 載入使用者修正
    loadUserCorrections() {
        try {
            this.userCorrections = JSON.parse(playerStorage.getItem('smartAccountingCorrections') || '[]');
        } catch (error) {
            console.error('載入使用者修正失敗:', error);
            this.userCorrections = [];
        }
    }
    
    // 儲存使用者修正
    saveUserCorrections() {
        try {
            playerStorage.setItem('smartAccountingCorrections', JSON.stringify(this.userCorrections));
        } catch (error) {
            console.error('儲存使用者修正失敗:', error);
        }
    }
    
    // 分析支出模式
    analyzeSpendingPattern() {
        if (typeof SmartAccounting === 'undefined') return;
        
        try {
            const records = JSON.parse(playerStorage.getItem('accountingRecords') || '[]');
            const analysis = SmartAccounting.analyzeSpendingPattern(records, 'monthly');
            
            if (analysis) {
                this.showSpendingAnalysis(analysis);
            }
        } catch (error) {
            console.error('分析支出模式失敗:', error);
        }
    }
    
    // 顯示支出分析
    showSpendingAnalysis(analysis) {
        // 移除現有分析面板
        const existingPanel = document.querySelector('.spending-analysis-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        // 檢查分析結果
        if (!analysis) {
            this.showErrorMessage('無法進行支出分析，請確保有足夠的記帳數據');
            return;
        }
        
        // 檢查是否有錯誤
        if (analysis.error) {
            this.showErrorMessage(analysis.error);
            return;
        }
        
        const panel = document.createElement('div');
        panel.className = 'spending-analysis-panel';
        
        // 生成洞察HTML
        const insightsHtml = analysis.insights && analysis.insights.length > 0 ? 
            analysis.insights.map(insight => `
                <div class="insight-item ${insight.level || 'info'}">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-content">${insight.content}</div>
                </div>
            `).join('') : 
            '<div class="no-data">暫無消費洞察</div>';
        
        // 生成建議HTML
        const recommendationsHtml = analysis.recommendations && analysis.recommendations.length > 0 ?
            analysis.recommendations.map(rec => `
                <div class="recommendation-item">
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="recommendation-content">${rec.content}</div>
                </div>
            `).join('') :
            '<div class="no-data">暫無改善建議</div>';
        
        // 生成分類HTML
        const categoriesHtml = analysis.topCategories && analysis.topCategories.length > 0 ?
            analysis.topCategories.map(cat => `
                <div class="category-item">
                    <span class="category-name">${cat.category}</span>
                    <span class="category-amount">NT$${(cat.amount || 0).toLocaleString()}</span>
                    <span class="category-percent">${cat.percentage || 0}%</span>
                </div>
            `).join('') :
            '<div class="no-data">暫無分類數據</div>';
        
        panel.innerHTML = `
            <div class="panel-header">
                <h3>📊 支出模式分析</h3>
                <button class="panel-close" onclick="this.closest('.spending-analysis-panel').remove()">✕</button>
            </div>
            <div class="panel-content">
                <div class="analysis-summary">
                    <div class="summary-item">
                        <span class="summary-label">總支出</span>
                        <span class="summary-value">NT$${(analysis.totalSpent || 0).toLocaleString()}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">交易次數</span>
                        <span class="summary-value">${analysis.transactionCount || 0}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">日均消費</span>
                        <span class="summary-value">NT$${Math.round(analysis.dailyAverage || 0)}</span>
                    </div>
                </div>
                
                <div class="top-categories">
                    <h4>主要消費類別</h4>
                    ${categoriesHtml}
                </div>
                
                <div class="insights">
                    <h4>💡 消費洞察</h4>
                    ${insightsHtml}
                </div>
                
                <div class="recommendations">
                    <h4>🎯 改善建議</h4>
                    ${recommendationsHtml}
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
    }
    
    // 顯示錯誤訊息
    showErrorMessage(message) {
        const errorPanel = document.createElement('div');
        errorPanel.className = 'spending-analysis-panel error';
        errorPanel.innerHTML = `
            <div class="panel-header">
                <h3>⚠️ 分析錯誤</h3>
                <button class="panel-close" onclick="this.closest('.spending-analysis-panel').remove()">✕</button>
            </div>
            <div class="panel-content">
                <div class="error-message">${message}</div>
                <div class="error-suggestion">
                    <p>建議：</p>
                    <ul>
                        <li>確保您有足夠的記帳記錄</li>
                        <li>檢查記帳記錄是否包含支出類型</li>
                        <li>確認記帳記錄的金額和分類資訊完整</li>
                    </ul>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorPanel);
    }
}

// 創建智慧記帳管理器實例
const smartAccountingManager = new SmartAccountingManager();

// 當頁面載入完成時初始化
document.addEventListener('playerappready', function() {
    // 確保智慧記帳模組已載入
    if (typeof SmartAccounting !== 'undefined') {
        smartAccountingManager.init();
    } else {
        console.warn('智慧記帳模組未載入');
    }
});

// 導出管理器供其他模組使用
window.SmartAccountingManager = smartAccountingManager;
