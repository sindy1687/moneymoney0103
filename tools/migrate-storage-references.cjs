// One-time source migration, kept for review. Do not rerun on already migrated HTML.
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const index = path.join(root, 'index.html');
let html = fs.readFileSync(index, 'utf8');
if (html.includes('js/app-bootstrap.js')) throw new Error('Already migrated');
const active = new Set();
for (const match of html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*>/g)) {
    if (!/^https?:/.test(match[1])) active.add(match[1].split('?')[0]);
}
for (const file of active) {
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of text.matchAll(/\bfrom\s+['"](\.\.?\/[^'"]+)['"]/g)) active.add(path.posix.normalize(path.posix.join(path.posix.dirname(file), match[1])));
}
const rewrite = text => text.replace(/\blocalStorage\b/g, 'playerStorage').replace(/(['"])DOMContentLoaded\1/g, "'playerappready'").replace(/document\.readyState === 'loading'/g, '!window.playerAppReady');
for (const file of active) {
    const target = path.join(root, file);
    fs.writeFileSync(target, rewrite(fs.readFileSync(target, 'utf8')));
}
html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/g, (all, attributes, body) => {
    const src = attributes.match(/\bsrc="([^"]+)"/);
    if (src && /^https?:/.test(src[1])) return all;
    const type = attributes.match(/\btype="([^"]+)"/);
    return `<script type="application/x-player-script"${src ? ` data-src="${src[1]}"` : ''}${type ? ` data-script-type="${type[1]}"` : ''}>${rewrite(body)}</script>`;
});
html = html.replace('</body>', '<script src="js/player-storage.js"></script>\n<script src="js/app-bootstrap.js"></script>\n</body>');
fs.writeFileSync(index, html);
fs.writeFileSync(path.join(root, 'tests/active-scripts.json'), JSON.stringify([...active], null, 2));
console.log(`Migrated ${active.size} active scripts and index.html`);
