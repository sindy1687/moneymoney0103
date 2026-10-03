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
test('auto upload runs at most once per day, and only when data changed', async () => {
    let calls = 0;
    const c = client(async (url, options) => { calls++; const body = JSON.parse(options.body);
        return { ok: true, json: async () => ({ success: true, provider: body.provider, fileName: body.fileName, fileId: 'f', size: Buffer.byteLength(body.content), sha256: body.sha256 }) }; });
    c.context.window.PLAYER_CLOUD_UPLOAD.autoUpload = 'google';
    await c.autoTick(); assert.equal(calls, 1);
    assert.match(c.elements.get('playerCloudStatus').textContent, /已自動上傳到 Google Drive/);
    // 同一天資料再變更也不再上傳
    c.context.localStorage.setItem('accountingRecords', '[{"amount":99}]');
    await c.autoTick(); assert.equal(calls, 1);
});
test('auto upload resumes the next day when data changed, but not when unchanged', async () => {
    let calls = 0;
    const c = client(async (url, options) => { calls++; const body = JSON.parse(options.body);
        return { ok: true, json: async () => ({ success: true, provider: body.provider, fileName: body.fileName, fileId: 'f', size: Buffer.byteLength(body.content), sha256: body.sha256 }) }; });
    c.context.window.PLAYER_CLOUD_UPLOAD.autoUpload = 'google';
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    c.context.localStorage.setItem('playerCloudLastUpload', JSON.stringify({ provider: 'google', fileName: 'x.json', at: yesterday }));
    await c.autoTick(); assert.equal(calls, 1, 'new day with changed data uploads');
    // 隔天但資料沒變更：不上傳
    c.context.localStorage.setItem('playerCloudLastUpload', JSON.stringify({ provider: 'google', fileName: 'x.json', at: yesterday }));
    const fresh = client(async () => { calls++; });
    fresh.context.window.PLAYER_CLOUD_UPLOAD.autoUpload = 'google';
    fresh.context.localStorage.setItem('playerCloudLastUpload', JSON.stringify({ provider: 'google', fileName: 'x.json', at: yesterday }));
    fresh.context.localStorage.setItem('playerCloudLastUploadHash', c.context.localStorage.getItem('playerCloudLastUploadHash'));
    await fresh.autoTick(); assert.equal(calls, 1, 'unchanged data is not re-uploaded');
});
test('auto upload stays silent without service', async () => {
    let calls = 0; const c = client(() => calls++, '');
    c.context.window.PLAYER_CLOUD_UPLOAD.autoUpload = 'google';
    c.context.localStorage.removeItem('playerCloudUploadKey');
    await c.autoTick(); assert.equal(calls, 0);
});
test('missing service does not claim success or send data', async () => {
    let calls = 0; const c = client(() => calls++, ''); await c.upload('google');
    assert.equal(calls, 0); assert.match(c.elements.get('playerCloudStatus').textContent, /尚未上傳/);
});
test('wrong size, provider, or failed service is never reported as success', async () => {
    const c = client(async () => ({ ok: true, json: async () => ({ success: true, provider: 'wrong', size: 0 }) }));
    await c.upload('google'); assert.match(c.elements.get('playerCloudStatus').textContent, /上傳未完成/);
});
test('full local quota cannot turn verified cloud upload into failure or cause duplicate automatic uploads', async () => {
    let calls = 0;
    const c = client(async (url, options) => {
        calls++; const body = JSON.parse(options.body);
        return { ok: true, json: async () => ({ success: true, provider: body.provider, fileName: body.fileName, fileId: 'f', size: Buffer.byteLength(body.content), sha256: body.sha256 }) };
    });
    c.context.localStorage.setItem = () => { throw Object.assign(new Error('full'), { name: 'QuotaExceededError' }); };
    c.context.window.PLAYER_CLOUD_UPLOAD.autoUpload = 'google';
    assert.equal(await c.upload('google'), true);
    await c.autoTick(); assert.equal(calls, 1);
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
test('server rejects unauthorized requests before cloud writes', () => {
    const server = fs.readFileSync(path.join(__dirname, '../cloud-upload-service.gs'), 'utf8');
    const context = { PropertiesService: { getScriptProperties: () => ({ getProperty: () => 'required' }) }, ContentService: { MimeType: { JSON:'json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) } };
    vm.createContext(context); vm.runInContext(server, context);
    const result = context.doPost({ postData: { contents: JSON.stringify({ uploadKey: 'wrong', action: 'uploadPlayerBackup' }) } });
    assert.equal(result.success, false); assert.match(result.message, /授權無效/);
});
