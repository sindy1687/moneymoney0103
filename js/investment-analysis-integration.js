// 投資分析功能整合腳本
// 將投資分析功能整合到主應用程式中

// 投資分析功能管理器
class InvestmentAnalysisManager {
    constructor() {
        this.isInitialized = false;
        this.currentHoldings = [];
        this.currentGoals = [];
        this.portfolioAnalysis = null;
        this.goalTracking = null;
    }
    
    // 初始化投資分析功能
    init() {
        if (this.isInitialized) return;
        
        this.bindEvents();
        this.loadData();
        this.isInitialized = true;
        
        console.log('投資分析功能已初始化');
    }
    
    // 綁定事件
    bindEvents() {
        // 投資組合分析按鈕
        const portfolioAnalysisBtn = document.getElementById('portfolioAnalysisBtn');
        if (portfolioAnalysisBtn) {
            portfolioAnalysisBtn.addEventListener('click', () => {
                this.showPortfolioAnalysis();
            });
        }
        
        // 目標追蹤按鈕
        const goalTrackingBtn = document.getElementById('goalTrackingBtn');
        if (goalTrackingBtn) {
            goalTrackingBtn.addEventListener('click', () => {
                this.showGoalTracking();
            });
        }
        
        // 關閉按鈕
        const portfolioCloseBtn = document.getElementById('portfolioAnalysisCloseBtn');
        if (portfolioCloseBtn) {
            portfolioCloseBtn.addEventListener('click', () => {
                this.hidePortfolioAnalysis();
            });
        }
        
        const goalCloseBtn = document.getElementById('goalTrackingCloseBtn');
        if (goalCloseBtn) {
            goalCloseBtn.addEventListener('click', () => {
                this.hideGoalTracking();
            });
        }
        
        // 點擊遮罩關閉
        const portfolioModal = document.getElementById('portfolioAnalysisModal');
        if (portfolioModal) {
            portfolioModal.addEventListener('click', (e) => {
                if (e.target === portfolioModal) {
                    this.hidePortfolioAnalysis();
                }
            });
        }
        
        const goalModal = document.getElementById('goalTrackingModal');
        if (goalModal) {
            goalModal.addEventListener('click', (e) => {
                if (e.target === goalModal) {
                    this.hideGoalTracking();
                }
            });
        }
        
        // 目標管理按鈕
        const addGoalBtn = document.getElementById('addGoalBtn');
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => {
                this.showAddGoalForm();
            });
        }
        
        const editGoalBtn = document.getElementById('editGoalBtn');
        if (editGoalBtn) {
            editGoalBtn.addEventListener('click', () => {
                this.showEditGoalForm();
            });
        }
    }
    
    // 載入資料
    loadData() {
        // 載入持股資料
        this.loadHoldings();
        
        // 載入目標資料
        this.loadGoals();
    }
    
    // 載入持股資料
    loadHoldings() {
        try {
            // 從投資記錄中計算持股
            const records = JSON.parse(playerStorage.getItem('investmentRecords') || '[]');
            const portfolio = this.calculatePortfolio(records);
            
            // 轉換格式以符合投資分析模組需求
            this.currentHoldings = Object.entries(portfolio).map(([symbol, data]) => ({
                symbol: symbol,
                name: data.name || this.getStockName(symbol),
                quantity: data.shares,
                currentPrice: data.currentPrice || 0,
                avgCost: data.avgCost,
                type: this.getAssetType({ symbol: symbol, name: data.name }),
                currency: 'TWD'
            }));
            
            console.log('載入持股資料:', this.currentHoldings);
            
        } catch (error) {
            console.error('載入持股資料失敗:', error);
            this.currentHoldings = [];
        }
    }
    
    // 計算持股組合
    calculatePortfolio(records) {
        const portfolio = {};
        
        records.forEach(record => {
            if (record.type === 'buy') {
                if (!portfolio[record.stockCode]) {
                    portfolio[record.stockCode] = {
                        name: record.stockName || record.stockCode,
                        shares: 0,
                        totalCost: 0,
                        avgCost: 0,
                        currentPrice: 0
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
        
        // 更新當前價格
        const currentPrices = JSON.parse(playerStorage.getItem('stockCurrentPrices') || '{}');
        Object.keys(portfolio).forEach(symbol => {
            if (currentPrices[symbol]) {
                portfolio[symbol].currentPrice = currentPrices[symbol];
            }
        });
        
        return portfolio;
    }
    
    // 取得股票名稱
    getStockName(symbol) {
        // 從投資記錄中查找股票名稱
        const records = JSON.parse(playerStorage.getItem('investmentRecords') || '[]');
        const record = records.find(r => r.stockCode === symbol);
        return record ? record.stockName : symbol;
    }
    
    // 載入目標資料
    loadGoals() {
        try {
            const goalsData = playerStorage.getItem('investmentGoals') || '[]';
            this.currentGoals = JSON.parse(goalsData);
        } catch (error) {
            console.error('載入目標資料失敗:', error);
            this.currentGoals = this.getDefaultGoals();
        }
    }
    
    // 取得預設目標
    getDefaultGoals() {
        return [
            {
                id: 'retirement_default',
                name: '退休基金',
                type: 'retirement',
                targetAmount: 10000000,
                targetDate: '2045-01-01',
                duration: 240
            },
            {
                id: 'education_default',
                name: '教育基金',
                type: 'education',
                targetAmount: 2000000,
                targetDate: '2030-01-01',
                duration: 72
            },
            {
                id: 'house_default',
                name: '購屋基金',
                type: 'house',
                targetAmount: 5000000,
                targetDate: '2028-01-01',
                duration: 48
            }
        ];
    }
    
    // 取得資產類型
    getAssetType(holding) {
        const symbol = holding.symbol || '';
        const name = holding.name || '';
        
        if (symbol.startsWith('00') || symbol.startsWith('01')) {
            return 'etf';
        } else if (name.includes('ETF') || name.includes('基金')) {
            return 'fund';
        } else if (name.includes('債') || name.includes('Bond')) {
            return 'bond';
        } else {
            return 'stock';
        }
    }
    
    // 顯示投資組合分析
    showPortfolioAnalysis() {
        const modal = document.getElementById('portfolioAnalysisModal');
        if (!modal) return;
        
        // 重新載入最新資料
        this.loadHoldings();
        
        // 執行分析
        if (this.currentHoldings.length > 0) {
            this.portfolioAnalysis = InvestmentAnalysis.analyzePortfolio(this.currentHoldings);
            this.renderPortfolioAnalysis();
        } else {
            this.renderEmptyPortfolioAnalysis();
        }
        
        // 顯示彈窗
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    // 隱藏投資組合分析
    hidePortfolioAnalysis() {
        const modal = document.getElementById('portfolioAnalysisModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    // 顯示目標追蹤
    showGoalTracking() {
        const modal = document.getElementById('goalTrackingModal');
        if (!modal) return;
        
        // 重新載入最新資料
        this.loadData();
        
        // 執行追蹤
        const currentPortfolio = this.portfolioAnalysis || 
                               InvestmentAnalysis.analyzePortfolio(this.currentHoldings);
        
        this.goalTracking = InvestmentAnalysis.trackInvestmentGoals(this.currentGoals, currentPortfolio);
        this.renderGoalTracking();
        
        // 顯示彈窗
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    // 隱藏目標追蹤
    hideGoalTracking() {
        const modal = document.getElementById('goalTrackingModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    // 渲染投資組合分析
    renderPortfolioAnalysis() {
        if (!this.portfolioAnalysis) return;
        
        const analysis = this.portfolioAnalysis;
        
        // 投資組合概況
        this.renderSection('portfolioSummary', `
            <h4>💰 投資組合概況</h4>
            <div class="analysis-metric">
                <span class="analysis-metric-label">總市值</span>
                <span class="analysis-metric-value">NT$${analysis.summary.totalValue.toLocaleString()}</span>
            </div>
            <div class="analysis-metric">
                <span class="analysis-metric-label">總成本</span>
                <span class="analysis-metric-value">NT$${analysis.summary.totalCost.toLocaleString()}</span>
            </div>
            <div class="analysis-metric">
                <span class="analysis-metric-label">總損益</span>
                <span class="analysis-metric-value" style="color: ${analysis.summary.totalGain >= 0 ? '#4caf50' : '#f44336'}">
                    NT$${analysis.summary.totalGain.toLocaleString()} (${analysis.summary.totalGainPercent.toFixed(1)}%)
                </span>
            </div>
            <div class="analysis-metric">
                <span class="analysis-metric-label">持股數量</span>
                <span class="analysis-metric-value">${analysis.summary.holdingsCount}</span>
            </div>
        `);
        
        // 風險評估
        this.renderSection('portfolioRisk', `
            <h4>⚠️ 風險評估</h4>
            <div class="analysis-metric">
                <span class="analysis-metric-label">風險評分</span>
                <div class="score-circle score-${analysis.risk.riskLevel}">${analysis.risk.riskScore}</div>
            </div>
            <div class="analysis-metric">
                <span class="analysis-metric-label">風險等級</span>
                <span class="analysis-metric-value risk-${analysis.risk.riskLevel}">${this.getRiskLevelText(analysis.risk.riskLevel)}</span>
            </div>
            <div class="analysis-metric">
                <span class="analysis-metric-label">集中度風險</span>
                <span class="analysis-metric-value">${(analysis.risk.concentrationRisk * 100).toFixed(1)}%</span>
            </div>
            <div class="analysis-metric">
                <span class="analysis-metric-label">波動率風險</span>
                <span class="analysis-metric-value">${(analysis.risk.volatilityRisk * 100).toFixed(1)}%</span>
            </div>
        `);
        
        // 分散度分析
        this.renderSection('portfolioDiversification', `
            <h4>🌍 分散度分析</h4>
            <div class="analysis-metric">
                <span class="analysis-metric-label">分散度分數</span>
                <div class="score-circle score-${this.getScoreLevel(analysis.diversification.diversificationScore)}">${analysis.diversification.diversificationScore}</div>
            </div>
            ${this.renderAllocation(analysis.diversification.sectorAllocation, '產業分配', analysis.summary.totalValue)}
            ${this.renderAllocation(analysis.diversification.geographicAllocation, '地域分配', analysis.summary.totalValue)}
            ${this.renderAllocation(analysis.diversification.assetAllocation, '資產分配', analysis.summary.totalValue)}
        `);
        
        // 績效分析
        this.renderSection('portfolioPerformance', `
            <h4>📈 績效分析</h4>
            <div class="analysis-metric">
                <span class="analysis-metric-label">最佳表現</span>
                <span class="analysis-metric-value">${analysis.performance.bestPerformer.name} (${analysis.performance.bestPerformer.return.toFixed(1)}%)</span>
            </div>
            <div class="analysis-metric">
                <span class="analysis-metric-label">最差表現</span>
                <span class="analysis-metric-value">${analysis.performance.worstPerformer.name} (${analysis.performance.worstPerformer.return.toFixed(1)}%)</span>
            </div>
            <div class="analysis-metric">
                <span class="analysis-metric-label">平均報酬率</span>
                <span class="analysis-metric-value">${analysis.performance.averageReturn.toFixed(1)}%</span>
            </div>
            <div class="analysis-metric">
                <span class="analysis-metric-label">夏普比率</span>
                <span class="analysis-metric-value">${analysis.performance.sharpeRatio.toFixed(2)}</span>
            </div>
        `);
        
        // 投資洞察
        this.renderSection('portfolioInsights', `
            <h4>💡 投資洞察</h4>
            ${analysis.insights.map(insight => `
                <div class="insight-item ${insight.level}">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-content">${insight.content}</div>
                </div>
            `).join('')}
        `);
        
        // 改善建議
        this.renderSection('portfolioRecommendations', `
            <h4>🎯 改善建議</h4>
            ${analysis.recommendations.map(rec => `
                <div class="recommendation-item">
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="recommendation-content">${rec.content}</div>
                </div>
            `).join('')}
        `);
    }
    
    // 渲染空投資組合分析
    renderEmptyPortfolioAnalysis() {
        this.renderSection('portfolioSummary', `
            <h4>💰 投資組合概況</h4>
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                <div>目前沒有持股資料</div>
                <div style="font-size: 14px; margin-top: 8px;">請先買入股票後再進行分析</div>
            </div>
        `);
        
        // 清空其他區塊
        ['portfolioRisk', 'portfolioDiversification', 'portfolioPerformance', 'portfolioInsights', 'portfolioRecommendations'].forEach(id => {
            this.renderSection(id, '');
        });
    }
    
    // 渲染目標追蹤
    renderGoalTracking() {
        if (!this.goalTracking) return;
        
        const tracking = this.goalTracking;
        
        // 目標概況
        this.renderSection('goalOverview', `
            <div class="goal-metric-card">
                <div class="goal-metric-value">${tracking.overview.totalGoals}</div>
                <div class="goal-metric-label">總目標數</div>
            </div>
            <div class="goal-metric-card">
                <div class="goal-metric-value">${tracking.overview.completedGoals}</div>
                <div class="goal-metric-label">已完成</div>
            </div>
            <div class="goal-metric-card">
                <div class="goal-metric-value">${tracking.overview.inProgressGoals}</div>
                <div class="goal-metric-label">進行中</div>
            </div>
            <div class="goal-metric-card">
                <div class="goal-metric-value">${Math.round(tracking.overview.totalCurrentAmount / tracking.overview.totalTargetAmount * 100)}%</div>
                <div class="goal-metric-label">整體進度</div>
            </div>
        `);
        
        // 個別目標
        this.renderSection('goalList', `
            <h4>🎯 個別目標進度</h4>
            ${tracking.goals.map(goal => `
                <div class="goal-card">
                    <div class="goal-card-header">
                        <div class="goal-name">${goal.name}</div>
                        <div class="goal-status ${goal.status}">${this.getStatusText(goal.status)}</div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${goal.progress}%"></div>
                    </div>
                    <div class="goal-progress-info">
                        <div class="goal-progress-item">
                            <span class="goal-progress-label">目標金額</span>
                            <span class="goal-progress-value">NT$${goal.targetAmount.toLocaleString()}</span>
                        </div>
                        <div class="goal-progress-item">
                            <span class="goal-progress-label">當前進度</span>
                            <span class="goal-progress-value">NT$${goal.currentAmount.toLocaleString()}</span>
                        </div>
                        <div class="goal-progress-item">
                            <span class="goal-progress-label">剩餘時間</span>
                            <span class="goal-progress-value">${goal.timeRemaining}個月</span>
                        </div>
                        <div class="goal-progress-item">
                            <span class="goal-progress-label">月需金額</span>
                            <span class="goal-progress-value">NT$${goal.monthlyRequired.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        `);
        
        // 目標洞察
        this.renderSection('goalInsights', `
            <h4>💡 目標洞察</h4>
            ${tracking.insights.map(insight => `
                <div class="insight-item ${insight.level}">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-content">${insight.content}</div>
                </div>
            `).join('')}
        `);
        
        // 改善建議
        this.renderSection('goalRecommendations', `
            <h4>🎯 改善建議</h4>
            ${tracking.recommendations.map(rec => `
                <div class="recommendation-item">
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="recommendation-content">${rec.content}</div>
                </div>
            `).join('')}
        `);
    }
    
    // 渲染分配圖表
    renderAllocation(allocation, title, totalValue) {
        if (!allocation || Object.keys(allocation).length === 0) return '';
        
        let html = `<h5>${title}</h5>`;
        html += '<div class="allocation-bar">';
        
        Object.entries(allocation).forEach(([name, value], index) => {
            const percentage = (value / totalValue * 100).toFixed(1);
            const color = this.getAllocationColor(index);
            html += `
                <div class="allocation-segment" style="width: ${percentage}%; background: ${color};">
                    ${percentage > 5 ? percentage + '%' : ''}
                </div>
            `;
        });
        
        html += '</div>';
        
        // 顯示詳細資訊
        Object.entries(allocation).forEach(([name, value]) => {
            const percentage = (value / totalValue * 100).toFixed(1);
            html += `
                <div class="analysis-metric">
                    <span class="analysis-metric-label">${name}</span>
                    <span class="analysis-metric-value">${percentage}%</span>
                </div>
            `;
        });
        
        return html;
    }
    
    // 渲染區塊
    renderSection(sectionId, content) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.innerHTML = content;
        }
    }
    
    // 取得分配顏色
    getAllocationColor(index) {
        const colors = [
            '#4a90e2', '#50c878', '#ff6b6b', '#ffd93d', '#6c5ce7',
            '#00b894', '#fdcb6e', '#e17055', '#74b9ff', '#a29bfe'
        ];
        return colors[index % colors.length];
    }
    
    // 取得風險等級文字
    getRiskLevelText(level) {
        const texts = {
            'low': '低風險',
            'medium': '中等風險',
            'high': '高風險'
        };
        return texts[level] || level;
    }
    
    // 取得分數等級
    getScoreLevel(score) {
        if (score >= 70) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }
    
    // 取得狀態文字
    getStatusText(status) {
        const texts = {
            'completed': '已完成',
            'in_progress': '進行中',
            'not_started': '未開始'
        };
        return texts[status] || status;
    }
    
    // 顯示新增目標表單
    showAddGoalForm() {
        // 這裡可以實現新增目標的表單邏輯
        alert('新增目標功能開發中...');
    }
    
    // 顯示編輯目標表單
    showEditGoalForm() {
        // 這裡可以實現編輯目標的表單邏輯
        alert('編輯目標功能開發中...');
    }
}

// 創建投資分析管理器實例
const investmentAnalysisManager = new InvestmentAnalysisManager();

// 當頁面載入完成時初始化
document.addEventListener('playerappready', function() {
    // 確保投資分析模組已載入
    if (typeof InvestmentAnalysis !== 'undefined') {
        investmentAnalysisManager.init();
    } else {
        console.warn('投資分析模組未載入');
    }
});

// 導出管理器供其他模組使用
window.InvestmentAnalysisManager = investmentAnalysisManager;
