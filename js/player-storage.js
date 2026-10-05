/* IndexedDB persistence with a synchronous view for the existing UI.
   Call flush() before announcing a save/restore or leaving the page.
   Transactions are revision-checked: a stale tab first loads the newer saves,
   then writes only the keys it changed on top (same key: the later save wins). */
(function (root) {
    'use strict';
    async function createPlayerStorage({ indexedDB, legacy, name = 'money-player-data-v1', onState = () => {} }) {
        const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open(name, 1);
            request.onupgradeneeded = () => { request.result.createObjectStore('values'); request.result.createObjectStore('meta'); };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            request.onblocked = () => reject(new Error('請先關閉其他記帳分頁，再重新開啟。'));
        });
        const notify = state => { try { onState(state); } catch (_) {} };
        const initial = await new Promise((resolve, reject) => {
            const tx = db.transaction(['values', 'meta'], 'readonly');
            const values = tx.objectStore('values');
            const keys = values.getAllKeys(), contents = values.getAll(), meta = tx.objectStore('meta').get('state');
            tx.oncomplete = () => resolve({ keys: keys.result, contents: contents.result, state: meta.result });
            tx.onabort = () => reject(tx.error || new Error('資料讀取失敗'));
        });
        if (!initial.state) {
            const imported = [];
            if (legacy) for (let i = 0; i < legacy.length; i++) {
                const key = legacy.key(i);
                // Earlier code accidentally stored method strings under these names.
                if (!['setItem', 'getItem', 'removeItem', 'clear'].includes(key)) imported.push([key, legacy.getItem(key)]);
            }
            await new Promise((resolve, reject) => {
                const tx = db.transaction(['values', 'meta'], 'readwrite');
                const state = tx.objectStore('meta').get('state');
                state.onsuccess = () => {
                    if (state.result) { tx.abort(); return; }
                    imported.forEach(([key, value]) => tx.objectStore('values').put(value, key));
                    tx.objectStore('meta').put({ revision: 0, migrated: true }, 'state');
                };
                tx.oncomplete = resolve;
                tx.onabort = () => reject(tx.error || new Error('資料遷移尚未完成，請關閉其他分頁後重試。'));
            });
            // The transaction has committed. Remove only the unchanged imported values.
            // A failed migration never touches the original store.
            if (legacy) for (const [key, value] of imported) {
                try { if (legacy.getItem(key) === value) legacy.removeItem(key); } catch (_) {}
            }
            initial.keys = imported.map(([key]) => key);
            initial.contents = imported.map(([, value]) => value);
            initial.state = { revision: 0 };
        }
        let revision = initial.state.revision;
        let view = new Map(initial.keys.map((key, index) => [key, initial.contents[index]]));
        let pending = new Map(), running = null, failure = null, scheduled = false;
        const subscribers = new Set();
        db.onversionchange = () => { db.close(); failure = new Error('資料庫版本已更新，請先匯出未儲存資料後重新整理。'); notify({ state: 'error', error: failure }); };
        function schedule() {
            notify({ state: 'saving' });
            if (!scheduled) {
                scheduled = true;
                queueMicrotask(() => { scheduled = false; flush().catch(() => {}); });
            }
        }
        async function flush() {
            if (failure) throw failure;
            if (running) { await running; return flush(); }
            if (!pending.size) return;
            running = (async () => {
                while (pending.size) {
                    const batch = pending;
                    pending = new Map();
                    try {
                        let base = revision, fresh = null;
                        await new Promise((resolve, reject) => {
                            const tx = db.transaction(['values', 'meta'], 'readwrite');
                            const values = tx.objectStore('values');
                            const write = () => {
                                batch.forEach((value, key) => value === null ? values.delete(key) : values.put(value, key));
                                tx.objectStore('meta').put({ revision: base + 1, migrated: true }, 'state');
                            };
                            const read = tx.objectStore('meta').get('state');
                            read.onsuccess = () => {
                                if (read.result.revision === revision) { write(); return; }
                                // 另一個分頁已存過：先讀入它的資料，再把本頁的修改寫在上面（同一筆資料以本頁為準）
                                base = read.result.revision;
                                const keys = values.getAllKeys(), contents = values.getAll();
                                contents.onsuccess = () => {
                                    fresh = new Map(keys.result.map((key, index) => [key, contents.result[index]]));
                                    write();
                                };
                            };
                            tx.oncomplete = resolve;
                            tx.onabort = () => reject(tx.error || new Error('資料儲存未完成'));
                        });
                        revision = base + 1;
                        if (fresh) {
                            // 本頁畫面改用合併後的資料；本頁尚未寫入的修改保留
                            const own = key => batch.has(key) || pending.has(key);
                            for (const key of [...view.keys()]) if (!own(key) && !fresh.has(key)) view.delete(key);
                            fresh.forEach((value, key) => { if (!own(key)) view.set(key, value); });
                            changed(null);
                        }
                    } catch (error) {
                        batch.forEach((value, key) => { if (!pending.has(key)) pending.set(key, value); });
                        failure = error;
                        notify({ state: 'error', error });
                        throw error;
                    }
                }
                notify({ state: 'saved' });
            })();
            try { await running; } finally { running = null; }
        }
        function changed(key) { subscribers.forEach(fn => { try { fn(key); } catch (_) {} }); }
        function assertWritable() { if (failure) throw failure; }
        const api = {
            getItem(key) { return view.get(String(key)) ?? null; },
            setItem(key, value) {
                assertWritable(); key = String(key); value = String(value);
                if (view.get(key) === value) return;
                view.set(key, value); pending.set(key, value); schedule(); changed(key);
            },
            removeItem(key) { assertWritable(); key = String(key); if (!view.has(key)) return; view.delete(key); pending.set(key, null); schedule(); changed(key); },
            clear() { assertWritable(); for (const key of view.keys()) pending.set(key, null); view.clear(); schedule(); changed(null); },
            key(index) { return [...view.keys()][index] ?? null; },
            flush,
            async retry() { failure = null; await flush(); },
            hasPending() { return !!(pending.size || running || failure); },
            subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); },
            async restore(snapshot) {
                if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot) || Object.values(snapshot).some(value => typeof value !== 'string')) throw new Error('完整備份格式錯誤');
                await flush();
                const previous = view;
                view = new Map(view);
                for (const [key, value] of Object.entries(snapshot)) { view.set(key, value); pending.set(key, value); }
                try { await flush(); }
                catch (error) { view = previous; pending.clear(); failure = null; notify({ state: 'saved' }); throw error; }
            },
            async close() { await flush(); db.close(); }
        };
        return new Proxy(api, {
            get(target, key) { if (key === 'length') return view.size; if (key in target) return target[key]; return view.get(key); },
            ownKeys() { return [...view.keys()]; },
            getOwnPropertyDescriptor(target, key) { if (view.has(key)) return { enumerable: true, configurable: true, value: view.get(key) }; },
            set(target, key, value) { if (key in target) throw new Error('請使用 subscribe 監聽資料變更，勿覆寫儲存方法。'); target.setItem(key, value); return true; }
        });
    }
    if (typeof module !== 'undefined' && module.exports) module.exports = { createPlayerStorage };
    else root.createPlayerStorage = createPlayerStorage;
})(typeof window !== 'undefined' ? window : globalThis);
