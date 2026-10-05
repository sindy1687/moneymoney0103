const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash, webcrypto } = require('node:crypto');
const source = fs.readFileSync(path.join(__dirname, '../js/player-cloud-upload.js'), 'utf8');
function storage(data) {
    const map = new Map(Object.entries(data));
    return { get length() { return map.size; }, key: i => [...map.keys()][i], getItem: key => map.get(key) ?? null, setItem: (k,v) => map.set(k,String(v)), removeItem: k => map.delete(k) };
}
function client(fetch, serviceUrl = 'https://script.google.com/macros/s/example/exec') {
    const elements = new Map();
    const context = { module: { exports: {} }, Blob, TextEncoder, crypto: webcrypto, AbortSignal, fetch,
        localStorage: storage({ playerCloudUploadKey: 'test-only', accountingRecords: '[{"amount":50}]', planner_202609: '{"旅行":true}', imageEmojis: '["data:image/png;base64,abc"]' }),
        window: { PLAYER_CLOUD_UPLOAD: { serviceUrl, folders: { google: { name: 'Google Drive' } } } }, document: { addEventListener() {}, querySelectorAll: () => [], getElementById: id => { if (!elements.has(id)) elements.set(id, {}); return elements.get(id); } } };
    context.showNotification = message => { if (!elements.has('playerCloudStatus')) elements.set('playerCloudStatus', {}); elements.get('playerCloudStatus').textContent = message; };
    context.playerStorage = context.localStorage;
    vm.createContext(context);
    vm.runInContext(source, context);
    return { ...context.module.exports, collect: context.module.exports.collectPlayerBackup, upload: context.module.exports.uploadPlayerJsonToCloud, elements, context };
}
test('exports all dynamic player keys, raw strings and images without upload credential', () => {
    const c = client(); const data = c.collect(c.context.localStorage);
    assert.equal(data.localStorageSnapshot.planner_202609, '{"旅行":true}');
    assert.equal(data.localStorageSnapshot.imageEmojis, '["data:image/png;base64,abc"]');
    assert.equal(data.localStorageSnapshot.playerCloudUploadKey, undefined);
    assert.equal(Object.keys(data.localStorageSnapshot).length, 3);
});
test('uploads go to Google Drive only; removed OneDrive provider sends nothing', async () => {
    const seen = [];
    const c = client(async (url, options) => {
        const body = JSON.parse(options.body); seen.push(body.provider);
        assert.equal(body.sha256, createHash('sha256').update(body.content).digest('hex'));
        assert.equal(JSON.parse(body.content).localStorageSnapshot.planner_202609, '{"旅行":true}');
        return { ok: true, json: async () => ({ success: true, provider: body.provider, fileName: body.fileName, fileId: 'verified', size: Buffer.byteLength(body.content), sha256: body.sha256 }) };
    });
    assert.equal(await c.upload('google'), true);
    assert.equal(await c.upload('onedrive'), false);
    assert.deepEqual(seen, ['google']);
    assert.match(c.elements.get('playerCloudStatus').textContent, /已上傳到 Google Drive/);
});
test('nothing uploads automatically when the app starts', () => {
    let calls = 0; const c = client(async () => { calls++; });
    assert.equal(c.autoTick, undefined); assert.equal(calls, 0);
});
test('missing service does not claim success or send data', async () => {
    let calls = 0; const c = client(() => calls++, ''); await c.upload('google');
    assert.equal(calls, 0); assert.match(c.elements.get('playerCloudStatus').textContent, /尚未上傳/);
});
test('wrong size, provider, or failed service is never reported as success', async () => {
    const c = client(async () => ({ ok: true, json: async () => ({ success: true, provider: 'wrong', size: 0 }) }));
    await c.upload('google'); assert.match(c.elements.get('playerCloudStatus').textContent, /上傳未完成/);
});
test('full local quota cannot turn verified cloud upload into failure', async () => {
    let calls = 0;
    const c = client(async (url, options) => {
        calls++; const body = JSON.parse(options.body);
        return { ok: true, json: async () => ({ success: true, provider: body.provider, fileName: body.fileName, fileId: 'f', size: Buffer.byteLength(body.content), sha256: body.sha256 }) };
    });
    c.context.localStorage.setItem = () => { throw Object.assign(new Error('full'), { name: 'QuotaExceededError' }); };
    assert.equal(await c.upload('google'), true); assert.equal(calls, 1);
    assert.match(c.elements.get('playerCloudStatus').textContent, /已上傳到 Google Drive/);
});
test('unreadable service response explains deployment failure', async () => {
    const c = client(async () => ({ ok: true, json: async () => { throw new SyntaxError('HTML'); } }));
    assert.equal(await c.upload('google'), false);
    assert.match(c.elements.get('playerCloudStatus').textContent, /服務存取權限/);
});
test('restore full snapshot preserves dynamic keys and rolls back a failed write', async () => {
    const core = fs.readFileSync(path.join(__dirname, '../js/app/01-core-input-investment.js'), 'utf8');
    const fn = core.slice(core.indexOf('async function applyBackupDataPayload'), core.indexOf('// 數字格式化（含千分位'));
    const localStorage = storage({ theme: 'old' }); let reloads = 0;
    const ctx = { localStorage, playerStorage: localStorage, alert() {}, location: { reload() { reloads++; } } }; vm.createContext(ctx); vm.runInContext(fn, ctx);
    await ctx.applyBackupDataPayload({ localStorageSnapshot: { theme: 'new', planner_202609: 'raw' } });
    assert.equal(localStorage.getItem('planner_202609'), 'raw');
    const set = localStorage.setItem;
    localStorage.setItem = (key, value) => { if (value === 'too-large') throw new Error('quota'); set(key,value); };
    await assert.rejects(ctx.applyBackupDataPayload({ localStorageSnapshot: { theme: 'bad', image: 'too-large' } }), /quota/);
    assert.equal(localStorage.getItem('theme'), 'new'); assert.equal(localStorage.getItem('image'), null); assert.equal(reloads,1);
});
test('quote lookup failures still return JSON so the browser never sees a CORS error page', () => {
    const server = fs.readFileSync(path.join(__dirname, '../cloud-upload-service.gs'), 'utf8');
    const context = { CacheService: { getScriptCache: () => ({ get: () => null, put() {} }) },
        UrlFetchApp: { fetch: () => ({ getResponseCode: () => 200, getContentText: () => '<html>系統維護中</html>' }) },
        ContentService: { MimeType: { JSON:'json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) } };
    vm.createContext(context); vm.runInContext(server, context);
    const result = context.doGet({ parameter: { twse: 'tse_2330.tw|otc_2330.tw' } });
    assert.equal(result.success, false); assert.match(result.message, /報價查詢失敗/);
    context.UrlFetchApp.fetch = () => { throw new Error('Timeout'); };
    assert.equal(context.doGet({ parameter: { twse: 'tse_0050.tw' } }).success, false);
});
test('server rejects unauthorized requests before cloud writes', () => {
    const server = fs.readFileSync(path.join(__dirname, '../cloud-upload-service.gs'), 'utf8');
    const context = { PropertiesService: { getScriptProperties: () => ({ getProperty: () => 'required' }) }, ContentService: { MimeType: { JSON:'json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) } };
    vm.createContext(context); vm.runInContext(server, context);
    const result = context.doPost({ postData: { contents: JSON.stringify({ uploadKey: 'wrong', action: 'uploadPlayerBackup' }) } });
    assert.equal(result.success, false); assert.match(result.message, /授權無效/);
});
