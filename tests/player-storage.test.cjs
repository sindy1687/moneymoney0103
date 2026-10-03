const { test } = require('node:test');
const assert = require('node:assert/strict');
const { IDBFactory } = require('fake-indexeddb');
const { createPlayerStorage } = require('../js/player-storage.js');
function legacy(entries = {}) { const map = new Map(Object.entries(entries)); return { get length() { return map.size; }, key: i => [...map.keys()][i], getItem: k => map.get(k) ?? null, removeItem: k => map.delete(k), setItem: (k,v) => map.set(k,v) }; }
test('migration commits every raw key including images and frees legacy space only afterward', async () => {
    const indexedDB = new IDBFactory(), old = legacy({ accountingRecords: '[{"amount":42}]', planner_202610: '{"中文":"✓"}', photos: 'data:image/png;base64,abc' });
    const store = await createPlayerStorage({ indexedDB, legacy: old });
    assert.equal(old.length, 0); assert.equal(store.length, 3); assert.equal(store.getItem('planner_202610'), '{"中文":"✓"}');
    assert.deepEqual(Object.keys(store).sort(), ['accountingRecords','photos','planner_202610']);
    await store.close();
    const reopened = await createPlayerStorage({ indexedDB, legacy: old });
    assert.equal(reopened.getItem('photos'), 'data:image/png;base64,abc'); await reopened.close();
});
test('old data is untouched if opening the database fails', async () => {
    const old = legacy({ accounts: 'important' });
    const broken = { open() { const request = {}; queueMicrotask(() => { request.error = new Error('blocked'); request.onerror(); }); return request; } };
    await assert.rejects(createPlayerStorage({ indexedDB: broken, legacy: old }), /blocked/);
    assert.equal(old.getItem('accounts'), 'important');
});
test('stores values larger than the previous 4 MB guard and reloads them', async () => {
    const indexedDB = new IDBFactory(), store = await createPlayerStorage({ indexedDB, legacy: legacy() });
    const value = '照片帳本'.repeat(1500000);
    store.setItem('accountingRecords', value); await store.flush(); await store.close();
    const reopened = await createPlayerStorage({ indexedDB, legacy: legacy() });
    assert.equal(reopened.getItem('accountingRecords'), value); await reopened.close();
});
test('writes are coalesced, removed keys stay removed and backup enumeration sees raw data', async () => {
    const store = await createPlayerStorage({ indexedDB: new IDBFactory(), legacy: legacy() });
    const changed = []; store.subscribe(key => changed.push(key));
    store.setItem('x', '1'); store.setItem('x', '2'); store.setItem('y', '3'); store.removeItem('y');
    await store.flush(); assert.equal(store.getItem('x'), '2'); assert.equal(store.length, 1); assert.equal(store.x,'2');
    assert.equal(changed.length,4); await store.close();
});
test('stale tabs cannot overwrite another tab and keep uncommitted data for emergency export', async () => {
    const indexedDB = new IDBFactory();
    const first = await createPlayerStorage({ indexedDB, legacy: legacy() });
    const second = await createPlayerStorage({ indexedDB, legacy: legacy() });
    first.setItem('accounts','new'); await first.flush();
    second.setItem('accounts','stale'); await assert.rejects(second.flush(), /另一個分頁/);
    assert.equal(second.getItem('accounts'), 'stale'); assert.equal(second.hasPending(), true);
    const check = await createPlayerStorage({ indexedDB, legacy: legacy() }); assert.equal(check.getItem('accounts'),'new'); await check.close(); await first.close();
});
test('restore validates before mutation and commits multiple keys together', async () => {
    const store = await createPlayerStorage({ indexedDB: new IDBFactory(), legacy: legacy({ theme: 'old' }) });
    await assert.rejects(store.restore({ theme: {} }), /格式錯誤/); assert.equal(store.getItem('theme'),'old');
    await store.restore({ theme: 'new', planner_202610: '{"items":[]}' }); assert.equal(store.getItem('theme'),'new'); await store.close();
});
test('failed restore transaction leaves previous persisted state intact', async () => {
    const indexedDB = new IDBFactory(), a = await createPlayerStorage({ indexedDB, legacy: legacy({ theme: 'old' }) });
    const b = await createPlayerStorage({ indexedDB, legacy: legacy() });
    b.setItem('theme','newer'); await b.flush();
    await assert.rejects(a.restore({ theme:'wrong', accounts:'wrong' }), /另一個分頁/);
    assert.equal(a.getItem('theme'),'old'); assert.equal(a.getItem('accounts'),null);
    const check = await createPlayerStorage({ indexedDB, legacy: legacy() }); assert.equal(check.getItem('theme'),'newer'); assert.equal(check.getItem('accounts'),null);
    await check.close(); await a.close(); await b.close();
});
test('after migration old diagnostic-page values cannot replace real player data', async () => {
    const indexedDB = new IDBFactory(), old = legacy({ accounts: 'real' });
    const store = await createPlayerStorage({ indexedDB, legacy: old }); await store.close();
    old.setItem('accounts','debug');
    const reopened = await createPlayerStorage({ indexedDB, legacy: old }); assert.equal(reopened.getItem('accounts'),'real'); await reopened.close();
});
