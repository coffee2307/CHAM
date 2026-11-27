/* Browser regression: CHẠM Play 2.0 interactions, accessibility and mobile layout. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('F:/Oxyz Edu/node_modules/playwright');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'assets');
const cssFiles=['cham-theme.css','cham-refinement.css','cham-demo.css','cham-minimal.css','cham-polish.css','cham-v3.css','cham-quest.css','cham-play-v3.css','cham-play-v31.css','cham-v4.css','cham-design-system.css'];
const jsFiles=['cham-demo-core.js','cham-craft-knowledge.js','cham-quest.js','cham-play-meta.js','cham-play-packing.js','cham-play-wheel.js','cham-play-expansion.js','cham-demo-pages.js','cham-theme.js','cham-unified-motion.js'];
const liquid=fs.readFileSync(path.join(root,'sections/cham-demo-app.liquid'),'utf8');
const pictures=Object.fromEntries(['memory','quiz','match','word','speed','pack','wheel'].map(n=>[n,'/assets/cham-play-'+n+'.webp']));
for(const name of fs.readdirSync(assets).filter(n=>n.startsWith('cham-play-icon-')&&n.endsWith('.svg'))){pictures[name.slice(10,-4)]='/assets/'+name;}
function pageHTML(){
 const styles=cssFiles.map(f=>'<link rel="stylesheet" href="/assets/'+f+'">').join('');
 const scripts=jsFiles.map(f=>'<script defer src="/assets/'+f+'"></script>').join('');
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+styles+'</head>'+
  '<body class="cham-site cham-play-mode" style="margin:0">'+
  '<div id="header-group"><header data-cham-header style="height:64px;padding:15px;background:#f8f3ea;display:flex;align-items:center"><a href="/">CHẠM</a><nav><a href="/collections/all">Sản phẩm</a></nav></header></div>'+
  '<main id="MainContent"><section class="cham-demo-app"><script id="cham-play-assets" type="application/json">'+JSON.stringify(pictures)+'</script>'+
  '<div data-cham-demo-app data-mode="play"></div></section></main>'+
  '<footer style="padding:30px;background:#f8f3ea">CHẠM · Thủ công Việt Nam</footer>'+scripts+'</body></html>';
}
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');
 if(url.pathname.startsWith('/assets/')){
  const file=path.join(assets,path.basename(decodeURIComponent(url.pathname)));
  if(!fs.existsSync(file)){res.writeHead(404);res.end('missing');return;}
  const extension=path.extname(file);
  res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'})[extension]||'application/octet-stream');
  res.end(fs.readFileSync(file));return;
 }
 res.setHeader('Content-Type','text/html; charset=utf-8');res.end(pageHTML());
});


(async()=>{await new Promise(ok=>server.listen(0,'127.0.0.1',ok)); const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});try{
for(const [w,h] of [[1440,900],[390,844],[320,568]]){
const page=await browser.newPage({viewport:{width:w,height:h}});await page.goto('http://127.0.0.1:'+server.address().port+'/pages/cham-play');await page.locator('[data-cp-game="memory"]').click();await page.locator('[data-v3-begin="memory"]').click();await page.waitForTimeout(200);
const m=await page.evaluate(()=>{const grid=document.querySelector('.cp-memory-grid');const cards=[...grid.children];return {cols:getComputedStyle(grid).gridTemplateColumns,grid:grid.getBoundingClientRect().toJSON(),cards:cards.map(c=>c.getBoundingClientRect().toJSON()),logo:[...grid.querySelectorAll('b')].every(b=>b.scrollWidth<=b.clientWidth+1&&getComputedStyle(b).whiteSpace==='nowrap')}});assert(m.logo);assert(m.cards.every(c=>c.bottom<=h+1&&c.right<=w+1));console.log('COMPOSITION',w,h,m.cols,'card',m.cards[0].width,m.cards[0].height,'grid',m.grid.width,m.grid.height);await page.screenshot({path:path.join(root,'.qa','memory-composition-'+w+'.png')});await page.close();}
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
