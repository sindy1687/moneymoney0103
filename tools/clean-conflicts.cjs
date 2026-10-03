const fs=require('node:fs'),path=require('node:path'),acorn=require('acorn');
const root=path.resolve(__dirname,'..');
function keepDefinition(file,name,keep) {
 const target=path.join(root,file),source=fs.readFileSync(target,'utf8');
 const nodes=acorn.parse(source,{ecmaVersion:'latest'}).body.filter(n=>n.type==='FunctionDeclaration'&&n.id.name===name);
 if(nodes.length<2)return;
 let result=source;
 for(const node of nodes.filter((n,i)=>i!==keep).reverse())result=result.slice(0,node.start)+result.slice(node.end);
 fs.writeFileSync(target,result);
}
keepDefinition('js/app/02-ledger-budget-settings.js','deleteTransaction',0);
keepDefinition('js/app/02-ledger-budget-settings.js','getCategoryIcon',0);
keepDefinition('js/app/04-diary-investment-ui.js','calculateInvestmentFee',0);
keepDefinition('js/app/05-dca-accounts-upload.js','closeWishlistForm',0);
for(const name of ['deleteTransaction','getCategoryIcon','calculateInvestmentFee','closeWishlistForm'])keepDefinition('script.js',name,0);
keepDefinition('script.js','showCreatorInfo',1);
// The investment shortcut was shadowing the accounting shortcut globally.
const investment=path.join(root,'js/app/04-diary-investment-ui.js');
fs.writeFileSync(investment,fs.readFileSync(investment,'utf8').replace('function initQuickActions()','function initInvestmentQuickActions()')+"\ndocument.addEventListener('playerappready', initInvestmentQuickActions);\n");
const monolith=path.join(root,'script.js');let old=fs.readFileSync(monolith,'utf8');
const pos=old.lastIndexOf('function initQuickActions()');old=old.slice(0,pos)+old.slice(pos).replace('function initQuickActions()','function initInvestmentQuickActions()');fs.writeFileSync(monolith,old);
for(const file of ['theme-test.html','theme-simple-test.html']) {
 const target=path.join(root,file);let html=fs.readFileSync(target,'utf8');
 html=html.replace(/function showThemeSelector\(/g,'function testShowThemeSelector(').replace(/onclick="showThemeSelector\(/g,'onclick="testShowThemeSelector(');
 fs.writeFileSync(target,html);
}
const fab=path.join(root,'debug-fab-button.html');fs.writeFileSync(fab,fs.readFileSync(fab,'utf8').replace(/\s*<script[^>]+data-src="js\/theme-icons.js"[^>]*><\/script>/,''));
// Corrupted and unreferenced legacy advisor is retained outside executable assets.
const advisor=path.join(root,'js/advisor.js');
if(fs.existsSync(advisor)){fs.mkdirSync(path.join(root,'archive'),{recursive:true});fs.renameSync(advisor,path.join(root,'archive/advisor.js.disabled.txt'));}
