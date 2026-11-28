const {chromium}=require('F:/Oxyz Edu/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const css=['cham-refinement.css','cham-demo.css','cham-minimal.css','cham-polish.css','cham-v3.css','cham-v4.css','cham-design-system.css','cham-ai-chat.css','cham-photo-load.css'];
const scripts=['cham-photo-load.js','cham-ai-rules.js','cham-ai-chat.js'];
const html='<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+css.map(f=>'<link rel="stylesheet" href="/assets/'+f+'">').join('')+scripts.map(f=>'<script defer src="/assets/'+f+'"></script>').join('')+'</head><body class="cham-site" style="margin:0"><div id="header-group">header</div><main id="MainContent" style="min-height:1800px"><div class="cham-vietnam-photo" style="width:160px"><img src="/slow.svg" width="160" height="120" alt="test"></div></main><footer>footer</footer>'+fs.readFileSync(path.join(root,'snippets/cham-ai-chat.liquid'),'utf8').replaceAll("{{ 'chammy.svg' | asset_url }}",'/assets/chammy.svg')+'</body></html>';
const server=http.createServer((req,res)=>{if(req.url==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return;}if(req.url==='/slow.svg'){res.setHeader('Content-Type','image/svg+xml');setTimeout(()=>res.end('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#986"/></svg>'),1400);return;}const f=path.join(root,req.url);if(!fs.existsSync(f)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':'application/javascript');res.end(fs.readFileSync(f));});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});try{
for(const [width,height] of [[320,568],[390,844],[430,932],[844,390],[1440,900]]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000,deviceScaleFactor:1});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded'});
 const launch=page.locator('.cham-ai-launch');const welcome=page.locator('[data-chammy-welcome]');const badge=page.locator('[data-chammy-unread]');assert.equal(await badge.isVisible(),false);assert.equal(await welcome.isVisible(),false);await welcome.waitFor({state:'visible',timeout:5000});assert.equal(await badge.isVisible(),true);assert.equal(await badge.textContent(),'1');assert.match(await welcome.textContent(),/Chammy/);assert.equal(await launch.locator('img').evaluate(e=>e.complete&&e.naturalWidth>0),true);await welcome.locator('[data-chammy-start]').click();await welcome.waitFor({state:'hidden'});assert.equal(await badge.isVisible(),false);await page.waitForTimeout(300);
 assert.equal(await page.locator('.cham-ai-window').evaluate(e=>e.getAnimations().length),0);
 const isMobile=width<=700||(height<=500&&width<1000);
 if(isMobile){assert.equal(await page.locator('#ChamAIInput').evaluate(e=>e===document.activeElement),false);assert.equal(await page.locator('#MainContent').evaluate(e=>e.inert),true);}
 await page.locator('#ChamAIInput').fill('CHAM la gi?');await page.locator('.cham-ai-form button').click();await page.locator('.cham-ai-message').nth(2).waitFor();await page.locator('.cham-ai-form button').waitFor({state:'visible'});await page.waitForFunction(()=>!document.querySelector('.cham-ai-form button').disabled);
 await page.route('https://cham-support-ai.coffee2307-pham.workers.dev/chat',async route=>{await new Promise(r=>setTimeout(r,600));await route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({answer:'**Miếng chà gót chân** phù hợp nhu cầu chăm sóc cá nhân. Xem https://chamstore.site/products/mieng-cha-got-chan',products:['products/mieng-cha-got-chan'],ai:true})});});
 await page.route('**/products/mieng-cha-got-chan.js',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({title:'Miếng chà gót chân xơ dừa',price:2900000,available:true})}));
 await page.locator('#ChamAIInput').fill('Tu van san pham cha got chan');await page.locator('.cham-ai-form button').click();await page.locator('.chammy-thinking').waitFor();await page.locator('.chammy-product').waitFor({timeout:8000});assert.equal(await page.locator('.chammy-reply').last().evaluate(e=>/\bt?i\b/iu.test(e.textContent)),false);assert.equal(await page.locator('.chammy-product strong').textContent(),'Miếng chà gót chân xơ dừa');assert.equal(await page.locator('.chammy-product').getAttribute('href'),'/products/mieng-cha-got-chan');
 await page.evaluate(()=>{window.CHAMDemo={getState:()=>({orders:[{id:'CHAM-DEMO-TEST',total:29000,items:[{title:'Mieng cha got chan',quantity:1,linePrice:29000}]}]})}});
 await page.locator('[data-chat-orders]').click();await page.locator('.chammy-order').waitFor();assert.match(await page.locator('.chammy-order').textContent(),/CHAM-DEMO-TEST/);
 if(isMobile){
  await page.locator('#ChamAIInput').focus();
  // Simulate keyboard shrink and iOS visual viewport offset without requiring a hardware keyboard.
  await page.evaluate(()=>{const v=window.visualViewport;Object.defineProperty(v,'height',{configurable:true,get:()=>Math.min(330,window.innerHeight-30)});Object.defineProperty(v,'offsetTop',{configurable:true,get:()=>24});v.dispatchEvent(new Event('resize'));});
  await page.waitForTimeout(100);
  const m=await page.evaluate(()=>{const v=visualViewport;const b=document.querySelector('.cham-ai-form button').getBoundingClientRect();const t=document.querySelector('#ChamAIInput').getBoundingClientRect();const log=document.querySelector('.cham-ai-log').getBoundingClientRect();return {top:v.offsetTop,bottom:v.offsetTop+v.height,send:b.bottom,input:t.bottom,log:log.height};});
  assert(m.send<=m.bottom+1&&m.input<=m.bottom+1&&m.log>0,JSON.stringify(m));
  await page.locator('[data-chat-close]').click();await page.locator('.cham-ai-window').waitFor({state:'hidden'});assert.equal(await page.locator('#MainContent').evaluate(e=>e.inert),false);assert.equal(await page.evaluate(()=>document.body.classList.contains('cham-chat-lock')),false);
 }else {await page.locator('[data-chat-close]').click();await page.locator('.cham-ai-window').waitFor({state:'hidden'});}
 if(width===390){
 await page.evaluate(()=>{delete visualViewport.height;delete visualViewport.offsetTop;visualViewport.dispatchEvent(new Event('resize'));});
 await page.locator('.cham-ai-launch').click();await page.waitForTimeout(300);
 await page.route('https://cham-support-ai.coffee2307-pham.workers.dev/chat',async route=>{await new Promise(r=>setTimeout(r,1200));await route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({answer:'Chammy co mau phu hop nha, '+('day la mot san pham thu cong rat phu hop de lam qua '.repeat(9)),ai:true})});});
 await page.locator('#ChamAIInput').fill('Tu van san pham xo dua');await page.locator('.cham-ai-form button').click();await page.locator('.chammy-thinking').waitFor();
 await page.locator('[data-chat-close]').click();await page.locator('.cham-ai-window').waitFor({state:'hidden'});assert.equal(await badge.isVisible(),false);
 await badge.waitFor({state:'visible',timeout:5000});assert.equal(await badge.textContent(),'1');await welcome.waitFor({state:'visible'});const preview=welcome.locator('[data-chammy-preview]');assert.match(await preview.textContent(),/^Chammy co mau/);assert.ok((await preview.textContent()).endsWith('…'));assert.ok((await preview.textContent()).length<=160);
 await page.locator('.cham-ai-launch').click();assert.equal(await badge.isVisible(),false);assert.equal(await welcome.isVisible(),false);await page.waitForTimeout(300);await page.locator('[data-chat-close]').click();await page.locator('.cham-ai-window').waitFor({state:'hidden'});
 }
 await page.locator('.cham-photo-ready').waitFor({state:'attached',timeout:6000});
 assert.equal(await page.locator('.cham-vietnam-photo img').evaluate(e=>e.complete&&e.naturalWidth>0&&!e.classList.contains('cham-photo-wait')),true);
 assert.deepEqual(errors,[]);console.log('PASS',width,height,isMobile?'keyboard simulation':'desktop','photo decode');await context.close();
}
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
