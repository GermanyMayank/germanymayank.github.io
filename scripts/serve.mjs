import{createServer}from'node:http';
import{readFile,stat}from'node:fs/promises';
import{resolve,extname,sep}from'node:path';
import{fileURLToPath}from'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url))),port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.pdf':'application/pdf','.mp4':'video/mp4'};
createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost'),relative=decodeURIComponent(url.pathname).replace(/^\/+/,''),path=resolve(root,relative||'index.html');
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return}
    const info=await stat(path);if(!info.isFile()){res.writeHead(404).end('Not found');return}
    const bytes=await readFile(path),type=mime[extname(path)]||'application/octet-stream';
    const headers={'Content-Type':type,'Accept-Ranges':'bytes','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'};
    if(req.headers.range){
      const range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      let start,end;
      if(range){if(!range[1]){start=Math.max(0,bytes.length-Number(range[2]));end=bytes.length-1}else{start=Number(range[1]);end=range[2]?Math.min(Number(range[2]),bytes.length-1):bytes.length-1}}
      if(!range||!Number.isFinite(start)||!Number.isFinite(end)||start>end||start>=bytes.length){res.writeHead(416,{'Content-Range':`bytes */${bytes.length}`}).end();return}
      res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':end-start+1});res.end(req.method==='HEAD'?undefined:bytes.subarray(start,end+1));return;
    }
    res.writeHead(200,{...headers,'Content-Length':bytes.length});res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(404).end('Not found')}
}).listen(port,'127.0.0.1',()=>console.log(`Portfolio preview: http://127.0.0.1:${port}`));
