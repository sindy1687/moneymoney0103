const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const migrated = new Set(JSON.parse(fs.readFileSync(path.join(root,'tests/active-scripts.json'),'utf8')));
const rewrite = text => text.replace(/\blocalStorage\b/g,'playerStorage').replace(/(['"])DOMContentLoaded\1/g,"'playerappready'").replace(/document\.readyState === 'loading'/g,'!window.playerAppReady').replace(/(?:window|document)\.addEventListener\((['"])load\1/g,"document.addEventListener('playerappready'");
const scripts = new Set(); let pages = 0;
for (const file of fs.readdirSync(root).filter(file => file.endsWith('.html') && file !== 'index.html')) {
    const target = path.join(root,file); let html = fs.readFileSync(target,'utf8');
    if (!/<html\b/i.test(html) || html.includes('js/app-bootstrap.js')) continue;
    html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/g, (all, attributes, body) => {
        const src = attributes.match(/\bsrc=["']([^"']+)["']/);
        if (src && /^https?:/.test(src[1])) return all;
        if (src) scripts.add(src[1].split('?')[0]);
        const type = attributes.match(/\btype=["']([^"']+)["']/);
        return `<script type="application/x-player-script"${src ? ` data-src="${src[1]}"` : ''}${type ? ` data-script-type="${type[1]}"` : ''}>${rewrite(body)}</script>`;
    });
    html = html.replace('</body>', `<script src="js/player-storage.js"></script>\n<script src="js/app-bootstrap.js" data-storage-name="money-diagnostic-${file}"></script>\n</body>`);
    fs.writeFileSync(target,html); pages++;
}
for (const file of scripts) {
    if (migrated.has(file) || !fs.existsSync(path.join(root,file))) continue;
    const target = path.join(root,file); const content = fs.readFileSync(target,'utf8');
    for (const match of content.matchAll(/\bfrom\s+['"](\.\.?\/[^'"]+)['"]/g)) scripts.add(path.posix.normalize(path.posix.join(path.posix.dirname(file),match[1])));
    fs.writeFileSync(target,rewrite(content));
}
console.log(`Isolated ${pages} diagnostic pages`);
