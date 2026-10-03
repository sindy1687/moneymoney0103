// 歷史記錄視窗裡的「理財顧問」聊天（取代已毀損的舊 advisor.js）
// 只用本機記帳資料回答：本月總覽、花最多的分類、與上月比較、每日平均與月底預估、省錢建議。
(() => {
    'use strict';

    const QUICK = [
        { label: '本月總覽', intent: 'summary' },
        { label: '花最多的分類', intent: 'top' },
        { label: '和上月比較', intent: 'compare' },
        { label: '每日平均', intent: 'daily' },
        { label: '省錢建議', intent: 'advice' }
    ];

    const money = n => `NT$${Math.round(n).toLocaleString('zh-TW')}`;
    const monthKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    function monthStats(records, key) {
        let expense = 0, income = 0;
        const byCategory = {};
        records.forEach(r => {
            if (!r || typeof r.date !== 'string' || !r.date.startsWith(key)) return;
            const amount = Number(r.amount) || 0;
            if (r.type === 'income') income += amount;
            else if (r.type !== 'transfer') {
                expense += amount;
                const cat = r.category || '未分類';
                byCategory[cat] = (byCategory[cat] || 0) + amount;
            }
        });
        const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
        return { expense, income, categories };
    }

    function intentOf(text) {
        if (/上月|上個月|比較|增加|減少/.test(text)) return 'compare';
        if (/分類|哪裡|最多|哪些/.test(text)) return 'top';
        if (/每天|每日|平均|預估|月底/.test(text)) return 'daily';
        if (/省|建議|存錢|節省|怎麼辦/.test(text)) return 'advice';
        if (/支出|花了|多少|總覽|收入|本月|這個月/.test(text)) return 'summary';
        return 'help';
    }

    function answer(intent, records) {
        const now = new Date();
        const thisKey = monthKey(now);
        const lastKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        const cur = monthStats(records, thisKey);
        const prev = monthStats(records, lastKey);
        const day = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        if (intent === 'summary') {
            if (!cur.expense && !cur.income) return '這個月還沒有記帳記錄喔，記幾筆之後我就能幫你分析。';
            const net = cur.income - cur.expense;
            return `本月（${thisKey}）支出 ${money(cur.expense)}、收入 ${money(cur.income)}，` +
                (cur.income ? `目前${net >= 0 ? '結餘' : '超支'} ${money(Math.abs(net))}。` : '尚未記錄收入。');
        }
        if (intent === 'top') {
            if (!cur.categories.length) return '這個月還沒有支出記錄。';
            const top = cur.categories.slice(0, 3).map(([c, v]) => `${c} ${money(v)}（${Math.round(v / cur.expense * 100)}%）`);
            return `本月花最多的分類：\n${top.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
        }
        if (intent === 'compare') {
            if (!prev.expense) return `上個月（${lastKey}）沒有支出記錄，暫時無法比較。本月目前支出 ${money(cur.expense)}。`;
            // 以同期（上月前 N 天）比較才公平
            const prevSamePeriod = records.reduce((s, r) => {
                if (!r || r.type === 'income' || r.type === 'transfer' || typeof r.date !== 'string' || !r.date.startsWith(lastKey)) return s;
                return Number(r.date.slice(8, 10)) <= day ? s + (Number(r.amount) || 0) : s;
            }, 0);
            const diff = cur.expense - prevSamePeriod;
            const pct = prevSamePeriod ? Math.round(Math.abs(diff) / prevSamePeriod * 100) : 0;
            return `本月前 ${day} 天支出 ${money(cur.expense)}，上月同期 ${money(prevSamePeriod)}，` +
                (diff === 0 ? '持平。' : `${diff > 0 ? '多' : '少'}了 ${money(Math.abs(diff))}${pct ? `（${pct}%）` : ''}。`) +
                `\n上月全月支出 ${money(prev.expense)}。`;
        }
        if (intent === 'daily') {
            if (!cur.expense) return '這個月還沒有支出記錄。';
            const avg = cur.expense / day;
            return `本月平均每天支出 ${money(avg)}，照這個速度月底約 ${money(avg * daysInMonth)}。`;
        }
        if (intent === 'advice') {
            if (!cur.expense) return '這個月還沒有支出記錄，先記帳幾天，我再給你建議。';
            const tips = [];
            const [topCat, topVal] = cur.categories[0];
            if (cur.income && cur.expense > cur.income) tips.push(`本月支出已超過收入 ${money(cur.expense - cur.income)}，建議先暫停非必要消費。`);
            tips.push(`花最多的是「${topCat}」${money(topVal)}，若減少 10% 每月可省約 ${money(topVal * 0.1)}。`);
            const projected = cur.expense / day * daysInMonth;
            if (prev.expense && projected > prev.expense * 1.1) tips.push(`照目前速度月底約 ${money(projected)}，比上月多 ${Math.round((projected / prev.expense - 1) * 100)}%，可以設定分類預算提醒自己。`);
            if (cur.income) tips.push(`理想是每月先存下收入的 20%（約 ${money(cur.income * 0.2)}），剩下的再分配支出。`);
            return tips.map((t, i) => `${i + 1}. ${t}`).join('\n');
        }
        return '你可以問我：本月花了多少、花最多的分類、和上月比較、每日平均，或是省錢建議。也可以直接點下方的按鈕。';
    }

    function addMessage(container, from, text) {
        const row = document.createElement('div');
        row.className = 'advisor-message' + (from === 'user' ? ' advisor-message-user' : '');
        const content = document.createElement('div');
        content.className = 'advisor-message-content';
        const bubble = document.createElement('div');
        bubble.className = 'advisor-message-text';
        bubble.style.whiteSpace = 'pre-line';
        bubble.textContent = text; // 使用者輸入一律當純文字
        const time = document.createElement('div');
        time.className = 'advisor-message-time';
        time.textContent = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
        content.append(bubble, time);
        row.appendChild(content);
        container.appendChild(row);
        container.scrollTop = container.scrollHeight;
    }

    function initAdvisorChat(records, modal) {
        const messages = modal.querySelector('#advisorChatMessages');
        const input = modal.querySelector('#advisorChatInput');
        const send = modal.querySelector('#advisorSendBtn');
        if (!messages) return;
        const data = Array.isArray(records) ? records : [];
        if (messages.dataset.ready === '1') return; // 已初始化：再次開啟只顯示，不重複綁定
        messages.dataset.ready = '1';

        addMessage(messages, 'advisor', '嗨！我是理財顧問小森，會根據你的記帳資料回答問題。想知道什麼？');
        const quick = document.createElement('div');
        quick.className = 'advisor-quick-actions';
        QUICK.forEach(q => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'advisor-quick-btn';
            btn.textContent = q.label;
            btn.addEventListener('click', () => {
                addMessage(messages, 'user', q.label);
                addMessage(messages, 'advisor', answer(q.intent, data));
            });
            quick.appendChild(btn);
        });
        messages.appendChild(quick);

        const submit = () => {
            const text = (input && input.value || '').trim();
            if (!text) return;
            input.value = '';
            addMessage(messages, 'user', text);
            addMessage(messages, 'advisor', answer(intentOf(text), data));
        };
        if (send) send.addEventListener('click', submit);
        if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); submit(); } });
    }

    window.initAdvisorChat = initAdvisorChat;
    if (typeof module !== 'undefined' && module.exports) module.exports = { initAdvisorChat, answer, intentOf };
})();
