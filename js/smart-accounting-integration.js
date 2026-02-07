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
        // 監聽金額輸入
        const amountInput = document.getElementById('amount');
        if (amountInput) {
            amountInput.addEventListener('input', () => {
                this.handleAmountChange();
            });
        }
        
        // 監聽描述輸入
        const descriptionInput = document.getElementById('description');
        if (descriptionInput) {
            descriptionInput.addEventListener('input', () => {
                this.handleDescriptionChange();
            });
        }
        
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
        const smartAnalysisBtn = document.getElementById('smartAnalysisBtn');
        if (smartAnalysisBtn) {
            smartAnalysisBtn.addEventListener('click', () => {
                this.analyzeSpendingPattern();
            });
        }
        
        // 監聽智慧建議按鈕
        this.addSuggestionButton();
    }
    
    // 處理金額變化
    handleAmountChange() {
        const amount = parseFloat(document.getElementById('amount')?.value || 0);
        const description = document.getElementById('description')?.value || '';
        
        if (amount > 0 && description) {
            this.showCategorySuggestion(amount, description);
        }
    }
    
    // 處理描述變化
    handleDescriptionChange() {
        const amount = parseFloat(document.getElementById('amount')?.value || 0);
        const description = document.getElementById('description')?.value || '';
        
        if (amount > 0 && description) {
            this.showCategorySuggestion(amount, description);
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
    
    // 顯示分類建議
    showCategorySuggestion(amount, description) {
        if (typeof SmartAccounting === 'undefined') return;
        
        const suggestion = SmartAccounting.suggestCategory(amount, description);
        if (!suggestion || suggestion.confidence < 70) return;
        
        const categorySelect = document.getElementById('category');
        if (!categorySelect) return;
        
        // 如果當前沒有選擇分類，或信心度很高，則自動建議
        if (!categorySelect.value || suggestion.confidence > 85) {
            categorySelect.value = suggestion.primary;
            this.showSuggestionBanner(suggestion);
        }
        
        // 顯示建議提示
        this.showSuggestionTooltip(suggestion);
    }
    
    // 顯示建議橫幅
    showSuggestionBanner(suggestion) {
        // 移除現有的建議橫幅
        const existingBanner = document.querySelector('.smart-suggestion-banner');
        if (existingBanner) {
            existingBanner.remove();
        }
        
        const banner = document.createElement('div');
        banner.className = 'smart-suggestion-banner';
        banner.innerHTML = `
            <div class="suggestion-content">
                <span class="suggestion-icon">🤖</span>
                <span class="suggestion-text">建議分類: ${suggestion.primary} (信心度: ${suggestion.confidence}%)</span>
                <button class="suggestion-accept" onclick="this.parentElement.parentElement.remove()">接受</button>
                <button class="suggestion-dismiss" onclick="this.parentElement.parentElement.remove()">忽略</button>
            </div>
        `;
        
        // 插入到表單上方
        const form = document.getElementById('recordForm');
        if (form) {
            form.parentNode.insertBefore(banner, form);
        }
        
        // 自動移除
        setTimeout(() => {
            if (banner.parentNode) {
                banner.remove();
            }
        }, 5000);
    }
    
    // 顯示建議提示
    showSuggestionTooltip(suggestion) {
        const categorySelect = document.getElementById('category');
        if (!categorySelect) return;
        
        // 移除現有提示
        const existingTooltip = document.querySelector('.category-suggestion-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        const tooltip = document.createElement('div');
        tooltip.className = 'category-suggestion-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <div class="tooltip-title">🤖 智慧建議</div>
                <div class="tooltip-suggestion">${suggestion.primary} (${suggestion.confidence}%)</div>
                ${suggestion.alternatives.length > 0 ? `
                    <div class="tooltip-alternatives">其他: ${suggestion.alternatives.join(', ')}</div>
                ` : ''}
            </div>
        `;
        
        categorySelect.parentNode.appendChild(tooltip);
        
        // 點擊其他地方時移除
        setTimeout(() => {
            document.addEventListener('click', function removeTooltip(e) {
                if (!tooltip.contains(e.target)) {
                    tooltip.remove();
                    document.removeEventListener('click', removeTooltip);
                }
            });
        }, 100);
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
            this.userCorrections = JSON.parse(localStorage.getItem('smartAccountingCorrections') || '[]');
        } catch (error) {
            console.error('載入使用者修正失敗:', error);
            this.userCorrections = [];
        }
    }
    
    // 儲存使用者修正
    saveUserCorrections() {
        try {
            localStorage.setItem('smartAccountingCorrections', JSON.stringify(this.userCorrections));
        } catch (error) {
            console.error('儲存使用者修正失敗:', error);
        }
    }
    
    // 新增建議按鈕
    addSuggestionButton() {
        const categorySection = document.querySelector('.category-section');
        if (!categorySection) return;
        
        // 檢查是否已經有建議按鈕
        if (categorySection.querySelector('.smart-suggestion-btn')) return;
        
        const button = document.createElement('button');
        button.className = 'smart-suggestion-btn';
        button.innerHTML = '🤖 智慧建議';
        button.onclick = () => {
            this.showSmartSuggestions();
        };
        
        categorySection.appendChild(button);
    }
    
    // 顯示智慧建議面板
    showSmartSuggestions() {
        const amount = parseFloat(document.getElementById('amount')?.value || 0);
        const description = document.getElementById('description')?.value || '';
        
        if (amount === 0 || !description) {
            alert('請先輸入金額和描述');
            return;
        }
        
        if (typeof SmartAccounting === 'undefined') {
            alert('智慧記帳功能未載入');
            return;
        }
        
        const suggestion = SmartAccounting.suggestCategory(amount, description);
        if (!suggestion) {
            alert('無法提供分類建議');
            return;
        }
        
        // 顯示建議對話框
        this.showSuggestionDialog(suggestion);
    }
    
    // 顯示建議對話框
    showSuggestionDialog(suggestion) {
        // 移除現有對話框
        const existingDialog = document.querySelector('.smart-suggestion-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }
        
        const dialog = document.createElement('div');
        dialog.className = 'smart-suggestion-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay"></div>
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>🤖 智慧分類建議</h3>
                    <button class="dialog-close" onclick="this.closest('.smart-suggestion-dialog').remove()">✕</button>
                </div>
                <div class="dialog-body">
                    <div class="suggestion-main">
                        <div class="suggestion-category">${suggestion.primary}</div>
                        <div class="suggestion-confidence">信心度: ${suggestion.confidence}%</div>
                        <div class="suggestion-factors">
                            ${suggestion.factors.map(factor => `<div class="factor">${factor}</div>`).join('')}
                        </div>
                    </div>
                    ${suggestion.alternatives.length > 0 ? `
                        <div class="suggestion-alternatives">
                            <h4>其他可能分類:</h4>
                            ${suggestion.alternatives.map(alt => `
                                <button class="alt-category-btn" onclick="smartAccountingManager.applySuggestion('${alt}')">${alt}</button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="dialog-actions">
                    <button class="btn-accept" onclick="smartAccountingManager.applySuggestion('${suggestion.primary}')">採納建議</button>
                    <button class="btn-dismiss" onclick="this.closest('.smart-suggestion-dialog').remove()">忽略</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
    }
    
    // 應用建議
    applySuggestion(category) {
        const categorySelect = document.getElementById('category');
        if (categorySelect) {
            categorySelect.value = category;
        }
        
        // 移除對話框
        const dialog = document.querySelector('.smart-suggestion-dialog');
        if (dialog) {
            dialog.remove();
        }
        
        // 顯示確認訊息
        this.showConfirmation(`已採納建議分類: ${category}`);
    }
    
    // 顯示確認訊息
    showConfirmation(message) {
        const confirmation = document.createElement('div');
        confirmation.className = 'smart-confirmation';
        confirmation.textContent = message;
        
        document.body.appendChild(confirmation);
        
        setTimeout(() => {
            confirmation.remove();
        }, 2000);
    }
    
    // 分析支出模式
    analyzeSpendingPattern() {
        if (typeof SmartAccounting === 'undefined') return;
        
        try {
            const records = JSON.parse(localStorage.getItem('accountingRecords') || '[]');
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
document.addEventListener('DOMContentLoaded', function() {
    // 確保智慧記帳模組已載入
    if (typeof SmartAccounting !== 'undefined') {
        smartAccountingManager.init();
    } else {
        console.warn('智慧記帳模組未載入');
    }
});

// 導出管理器供其他模組使用
window.SmartAccountingManager = smartAccountingManager;
