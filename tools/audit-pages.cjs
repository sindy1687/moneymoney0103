const fs = require('node:fs'), path = require('node:path'), acorn = require('acorn');
const root = path.resolve(__dirname,'..');
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.name === 'node_modules' || e.name === '.git' ? [] : e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]); }
const files = walk(root), scripts = files.filter(f => /\.(?:js|cjs|gs)$/.test(f)), pages = files.filter(f => f.endsWith('.html'));
const syntax = [], missing = [], duplicates = [], used = new Set(), pageInfo = [];
function parse(text, label, module = false) { try { return acorn.parse(text,{ecmaVersion:'latest',sourceType:module?'module':'script',locations:true,allowHashBang:true}); } catch (e) { syntax.push({file:label,line:e.loc.line,message:e.message}); return null; } }
for (const file of scripts) {
    const source = fs.readFileSync(file,'utf8'); parse(source,path.relative(root,file),/^(?:import|export)\s/m.test(source));
}
for (const file of pages) {
    const html = fs.readFileSync(file,'utf8'), rel = path.relative(root,file), globals = new Map(), refs = []; let inline = 0;
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
        const src = match[1].match(/\b(?:data-src|src)=["']([^"']+)["']/), module = /(?:data-script-type|type)=["']module["']/.test(match[1]);
        let source = match[2], label = `${rel}:inline-${++inline}`;
        if (src) {
            if (/^(?:https?:|\/\/)/.test(src[1])) continue;
            label = path.normalize(path.join(path.dirname(rel),src[1].split('?')[0])); refs.push(label); used.add(label);
            const target = path.join(root,label);
            if (!fs.existsSync(target)) { missing.push({page:rel,reference:label}); continue; }
            source = fs.readFileSync(target,'utf8');
        }
        const ast = parse(source,label,module);
        if (!ast || module) continue;
        for (const statement of ast.body) {
            const identifiers = statement.type === 'VariableDeclaration' ? statement.declarations.map(d=>d.id.name).filter(Boolean) : ['FunctionDeclaration','ClassDeclaration'].includes(statement.type) ? [statement.id.name] : [];
            for (const id of identifiers) {
                if (globals.has(id)) duplicates.push({page:rel,name:id,first:globals.get(id),second:label});
                globals.set(id,label);
            }
        }
    }
    for (const match of html.matchAll(/<(?:link|img)\b[^>]*(?:href|src)=["']([^"']+)["']/g)) {
        const url = match[1]; if (/^(?:[a-z]+:|#|\/\/|\$|\{)/i.test(url)) continue;
        const ref = decodeURI(url.split(/[?#]/)[0]); if (!ref) continue;
        if (!fs.existsSync(path.resolve(path.dirname(file),ref))) missing.push({page:rel,reference:ref});
    }
    pageInfo.push({page:rel,scripts:refs,isolated:html.includes('data-storage-name=')});
}
const report = { pages:pages.length, javascriptFiles:scripts.length, syntax, missing, duplicates, pageInfo,
    notDirectlyReferenced:scripts.map(f=>path.relative(root,f)).filter(f=>!used.has(f)&&!f.startsWith('tools'+path.sep)&&!f.startsWith('tests'+path.sep)) };
fs.writeFileSync(path.join(root,'tests/page-audit.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({pages:report.pages,javascriptFiles:report.javascriptFiles,syntax,missing,duplicates},null,2));
if (syntax.length || missing.length) process.exitCode = 1;
