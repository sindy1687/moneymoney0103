const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
http.createServer((req,res)=>{
 let target;try{target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400);res.end();return;}
 if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
 if(!fs.existsSync(target)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(target).pipe(res);
}).listen(5511,'127.0.0.1',()=>console.log('Preview http://127.0.0.1:5511'));
