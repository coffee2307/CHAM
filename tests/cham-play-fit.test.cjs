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

const waitReady=async page=>page.locator('.cp-card').first().waitFor({timeout:15000});
async function bounds(page,label){
 await page.waitForTimeout(100);
 const m=await page.evaluate(()=>{
  const root=document.querySelector('.cp-session'),stage=root?.querySelector('.cp-fit-stage'),view=window.visualViewport;
  const rect=stage?.getBoundingClientRect(); const w=view?.width||innerWidth,h=view?.height||innerHeight;
  const visible=[...root.querySelectorAll('button,a')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');
  return {w,h,scale:getComputedStyle(stage).getPropertyValue('--cp-fit-scale'),rect:[rect.left,rect.top,rect.right,rect.bottom],bad:visible.map(e=>({text:e.textContent.trim().slice(0,36),r:e.getBoundingClientRect()})).filter(x=>x.r.left<-.5||x.r.right>w+1||x.r.top<-.5||x.r.bottom>h+1).map(x=>x.text),lock:getComputedStyle(document.documentElement).overflowY};
 });
 assert.equal(m.lock,'hidden',label+' viewport not locked');assert.ok(m.rect[0]>=-1&&m.rect[1]>=-1&&m.rect[2]<=m.w+1&&m.rect[3]<=m.h+1&&!m.bad.length,label+' '+JSON.stringify(m));
 console.log('FIT',label,JSON.stringify(m));
}
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
 const url='http://127.0.0.1:'+server.address().port+'/pages/cham-play';
 try{
 for(const [width,height] of [[320,568],[390,844],[844,390],[1440,900]]){
  const ctx=await browser.newContext({viewport:{width,height}}),page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'domcontentloaded'});await waitReady(page);
  for(const game of ['memory','quiz','match','word','speed','pack']){
   await page.locator('[data-cp-game="'+game+'"]').click();
   await page.waitForTimeout(80);
   if(game==='memory')await page.locator('.cp3-mode input[value="hard"]').check();
   await page.locator('[data-v3-begin="'+game+'"]').click();
   await page.locator('.cp-fit-stage').waitFor();
   await bounds(page,width+'x'+height+' '+game+' initial');
   if(game==='memory'){
    assert.equal(await page.locator('[data-cp-memory]').count(),12);
    await page.locator('[data-cp-memory]').first().evaluate(e=>e.dataset.identity='kept');
    await page.locator('[data-cp-memory]').first().click();
    assert.equal(await page.locator('[data-cp-memory]').first().getAttribute('data-cp-memory'),'0');
    // complete the game using actual matching card ids
    const deck=await page.evaluate(()=>window.CHAMPlayQA.getState().state.deck);
    const first=deck[0].id;const partner=deck.findIndex((x,i)=>i>0&&x.id===first);
    await page.locator('[data-cp-memory="'+partner+'"]').click();
    for(const id of [...new Set(deck.map(x=>x.id))].filter(x=>x!==first)){
     const pair=deck.map((x,i)=>x.id===id?i:-1).filter(i=>i>=0);
     await page.locator('[data-cp-memory="'+pair[0]+'"]').click();await page.locator('[data-cp-memory="'+pair[1]+'"]').click();
    }
    await page.locator('.cp-result').waitFor();await bounds(page,width+' memory result');
   }
   if(game==='quiz'||game==='speed'){
    const n=await page.evaluate(()=>window.CHAMPlayQA.getState().state.questions.length);
    for(let i=0;i<n;i++){const j=await page.evaluate(()=>{const s=window.CHAMPlayQA.getState().state;return s.questions[s.index].answerIndex;});
    await page.locator('[data-cp-choice="'+j+'"]').click();await bounds(page,width+' '+game+' feedback '+i);await page.locator('[data-cp-next]').click();}
    await page.locator('.cp-result').waitFor();await bounds(page,width+' '+game+' result');
   }
   if(game==='match'){const id=await page.evaluate(()=>window.CHAMPlayQA.getState().state.left[0].id);await page.locator('[data-cp-left="'+id+'"]').click();await page.locator('[data-cp-right="'+id+'"]').click();await bounds(page,width+' match update');}
   if(game==='word'){await page.locator('[data-cp-cell]').first().click();await bounds(page,width+' word update');}
   if(game==='pack'){await page.locator('[data-v3-pack]').first().click();await bounds(page,width+' pack feedback');await page.locator('[data-v3-next-pack]').click();}
   if(width===390)await page.screenshot({path:path.join(root,'.qa','fit-'+game+'-390.png')});
   await page.locator('.cp-session-header :is([data-v3-back],[data-cp-back])').first().click();
   await page.locator('.cp-hub').waitFor();await page.waitForTimeout(100);
   assert.notEqual(await page.evaluate(()=>getComputedStyle(document.documentElement).overflowY),'hidden');
  }
  await page.locator('[data-cp-game="wheel"]').click();await page.locator('[data-v3-begin="wheel"]').click();await page.locator('.cp-fit-stage').waitFor();await bounds(page,width+' wheel initial');await page.locator('[data-v3-spin]').click();await page.locator('.cp-result').waitFor({timeout:5000});await bounds(page,width+' wheel result');
  assert.deepEqual(errors,[]);await ctx.close();
 }
 console.log('ALL PLAY FIT TESTS PASSED');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
