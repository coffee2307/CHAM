/* Browser regression: CHẠM Play 2.0 interactions, accessibility and mobile layout. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('F:/Oxyz Edu/node_modules/playwright');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'assets');
const cssFiles=['cham-theme.css','cham-refinement.css','cham-demo.css','cham-minimal.css','cham-polish.css','cham-v3.css','cham-quest.css','cham-play-v3.css','cham-play-v31.css','cham-v4.css','cham-design-system.css'];
const jsFiles=['cham-demo-core.js','cham-craft-knowledge.js','cham-quest.js','cham-play-meta.js','cham-play-packing.js','cham-play-wheel.js','cham-play-expansion.js','cham-demo-pages.js','cham-theme.js','cham-unified-motion.js'];
const liquid=fs.readFileSync(path.join(root,'sections/cham-demo-app.liquid'),'utf8');
const pictures=Object.fromEntries(Array.from(liquid.matchAll(/"([^"]+)":\s*{{\s*'([^']+\.(?:svg|webp))'\s*\|\s*asset_url\s*\|\s*json\s*}}/g),m=>[m[1],'/assets/'+m[2]]));
assert.equal(Object.keys(pictures).length,24,'all curated assets are declared in Liquid');
for(const [name,src] of Object.entries(pictures)){
  assert.ok(fs.existsSync(path.join(assets,path.basename(src))),'missing art: '+name);
}
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
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 console.log('QA_CHROME_LAUNCHING');const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
 const url='http://127.0.0.1:'+server.address().port+'/pages/cham-play';
 try {
  console.log('QA_BROWSER_READY');const measurements=[];
  for(const width of [320,375,390,430,768,1024,1440,1920]){
   const context=await browser.newContext({viewport:{width,height:width<=430?844:900},deviceScaleFactor:1});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   console.log('QA_GOTO',width);page.setDefaultTimeout(7000);page.setDefaultNavigationTimeout(15000);await page.goto(url,{waitUntil:'domcontentloaded'});console.log('QA_GOTO_DONE',width);
   await waitReady(page);console.log('QA_HUB_READY',width);
   const result=await page.evaluate(()=>{
    const h=document.documentElement;
    const app=document.querySelector('.cp-app');
    const footer=document.querySelector('footer');
    const cards=[...document.querySelectorAll('.cp-card')];
    const images=[...document.querySelectorAll('.cp-card__media > img')];
    return {
      scrollWidth:h.scrollWidth,viewport:innerWidth,bodyOverflow:getComputedStyle(document.body).overflowY,
      appHeight:app.getBoundingClientRect().height,footer:getComputedStyle(footer).display,
      font:getComputedStyle(document.querySelector('.cp-hero h1')).fontFamily,
      count:cards.length,
      imageCount:images.length,
      loaded:images.filter(i=>i.complete&&i.naturalWidth>0).length,
      oldGame:document.querySelectorAll('[class*="dino-"]').length,
      availableFilters:document.querySelectorAll('.cp-filter').length,
      maxCardRight:Math.max(...cards.map(c=>c.getBoundingClientRect().right))
    };
   });
   assert.equal(result.count,7,'seven game experiences '+width);
   assert.equal(result.oldGame,0,'old mascot components removed '+width);
   assert.equal(result.imageCount,7,'game preview art '+width);
   await page.locator('.cp-card__media > img').evaluateAll(imgs=>imgs.forEach(img=>img.loading='eager'));
   await page.waitForFunction(()=>[...document.querySelectorAll('.cp-card__media > img')].every(img=>img.complete&&img.naturalWidth>0),null,{timeout:12000});
   assert.equal(await page.locator('.cp-card__media > img').evaluateAll(imgs=>imgs.filter(img=>img.getAttribute('src').includes('cham-play-')&&img.getAttribute('src').endsWith('.webp')&&img.naturalWidth>0).length),7,'seven illustrated WebP thumbnails load');
   assert.ok(result.scrollWidth<=width+1,'horizontal overflow at '+width+': '+JSON.stringify(result));
   assert.ok(result.maxCardRight<=width+1,'card is clipped '+width);
   assert.notEqual(result.bodyOverflow,'hidden','natural page scroll '+width);
   assert.notEqual(result.footer,'none','footer retained '+width);
   assert.ok(result.appHeight>800,'hub has a natural long page '+width);
   assert.ok(result.font.includes('Be Vietnam Pro'),'font consistency '+width);
   assert.equal(result.availableFilters,8,'filter controls present');
   assert.equal(await page.locator('.cp4-hero-gallery img').count(),3,'hero uses a three-image editorial collage');
   assert.equal(await page.locator('.cp3-dashboard').count(),1,'missions and badges are present');
   assert.ok(await page.locator('.cp-games').evaluate(el=>el.getBoundingClientRect().top)<await page.locator('.cp3-dashboard').evaluate(el=>el.getBoundingClientRect().top),'games must appear before secondary meta dashboard');
   assert.equal(await page.locator('.cp-card__level:visible').count(),0,'illustrated thumbnails have no obstructing corner labels');
   assert.equal(await page.locator('.cp-card:first-child').evaluate(el=>getComputedStyle(el).gridColumnStart),'span 2','featured game spans two grid columns');
   assert.deepEqual(errors,[],'JS errors '+width);
   measurements.push({width,...result});
   if([390,1440].includes(width)){
    // Chromium full-page capture can leave below-fold lazy images unpainted.
    // Walk the card grid exactly as a visitor would, then capture all art.
    for(const card of await page.locator('.cp-card').all()){
      await card.scrollIntoViewIfNeeded();
      await card.locator('.cp-card__media>img').evaluate(async image=>{try{await image.decode()}catch(_){}});
      await page.waitForTimeout(65);
    }
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.waitForTimeout(180);
    await page.screenshot({path:path.join(root,'.qa','cham-play-v2-'+width+'.png'),fullPage:true});
   }
   console.log('CHAM_PLAY_LAYOUT_PASS',width,'height',Math.round(result.appHeight));
   await context.close();
  }
  // Check each gameplay screen at the narrowest and common mobile widths.
  for(const width of [320,390]){
   const ctx=await browser.newContext({viewport:{width,height:844},hasTouch:true,isMobile:true});
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   console.log('QA_GOTO',width);page.setDefaultTimeout(7000);page.setDefaultNavigationTimeout(15000);await page.goto(url,{waitUntil:'domcontentloaded'});console.log('QA_GOTO_DONE',width);await waitReady(page);
   for(const game of ['memory','quiz','match','word','speed']){
    await page.locator('[data-cp-game="'+game+'"]').click();
    await page.locator('[data-v3-begin="'+game+'"]').click();
    const banner=page.locator('.cp4-game-banner img');
    await banner.waitFor();
    assert.ok((await banner.getAttribute('src')).endsWith('.webp'),'in-game artwork must use WebP '+game);
    const board=page.locator('.cp-board');await board.waitFor();
    const m=await board.evaluate(el=>({right:el.getBoundingClientRect().right,overflow:document.documentElement.scrollWidth-innerWidth,board:el.scrollWidth-el.clientWidth}));
    assert.ok(m.right<=width+2&&m.overflow<=2&&m.board<=2,game+' overflow '+width+': '+JSON.stringify(m));
    if(width===390)await page.screenshot({path:path.join(root,'.qa','cham-play-v21-'+game+'-390.png'),fullPage:true});
    await page.locator('[data-cp-back]').first().click();
   }
   assert.deepEqual(errors,[],'mobile game runtime');
   await ctx.close();
  }
  // Functional QA uses a single browser-local wallet so repeated rewards are verified.
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'load'});
  await waitReady(page);
  await page.locator('[data-cp-filter="Trí nhớ"]').click();
  assert.equal(await page.locator('.cp-card').count(),1,'filter returns one game');
  await page.locator('[data-cp-filter="Tất cả"]').click();
  assert.equal(await page.locator('.cp-card').count(),7);
  await page.locator('[data-cp-game="memory"]').click();
  await page.locator('.cp3-mode input[value="easy"]').check();
  assert.ok((await page.locator('.cp3-dialog__art img').getAttribute('src')).endsWith('.webp'),'intro artwork is WebP');
  await page.locator('[data-v3-begin="memory"]').click();
  assert.equal(await page.locator('[data-cp-memory]').count(),8);
  assert.equal(await page.locator('[data-cp-memory] .cp-icon').count(),0,'memory faces no longer use giant stock icons');
  assert.equal(await page.locator('[data-cp-memory] .cp4-memory-face-back').count(),8,'memory faces have custom card backs');
  await page.screenshot({path:path.join(root,'.qa','cham-play-v21-memory-1440.png'),fullPage:true});
  const deck=await page.evaluate(()=>window.CHAMPlayQA.getState().state.deck);
  const ids=[...new Set(deck.map(c=>c.id))];
  for(const id of ids){
   const pair=deck.map((c,i)=>c.id===id?i:-1).filter(i=>i>=0);
   assert.equal(pair.length,2);
   await page.locator('[data-cp-memory="'+pair[0]+'"]').click();
   await page.locator('[data-cp-memory="'+pair[1]+'"]').click();
  }
  await page.locator('.cp-result').waitFor();
  assert.ok((await page.locator('.cp4-result-cover img').first().getAttribute('src')).endsWith('.webp'),'game result has artwork');
  assert.equal(await page.evaluate(()=>window.CHAMDemo.points()),120,'first game earns 20 demo points');
  console.log('CHAM_PLAY_MEMORY_PASS');
  await page.locator('[data-cp-back]').first().click();
  await page.locator('[data-cp-game="quiz"]').click();
  await page.locator('[data-v3-begin="quiz"]').click();
  for(let i=0;i<5;i++){
   const index=await page.evaluate(()=>window.CHAMPlayQA.getState().state.questions[window.CHAMPlayQA.getState().state.index].answerIndex);
   await page.locator('[data-cp-choice="'+index+'"]').click();
   await page.locator('[data-cp-next]').click();
  }
  await page.locator('.cp-result').waitFor();
  assert.equal(await page.evaluate(()=>window.CHAMDemo.points()),120,'second game cannot reward twice in same day');
  console.log('CHAM_PLAY_QUIZ_PASS');
  await page.locator('[data-cp-back]').first().click();
  await page.locator('[data-cp-game="match"]').click();
  await page.locator('[data-v3-begin="match"]').click();
  const left=await page.evaluate(()=>window.CHAMPlayQA.getState().state.left.map(x=>x.id));
  for(const id of left){
   await page.locator('[data-cp-left="'+id+'"]').click();
   await page.locator('[data-cp-right="'+id+'"]').click();
  }
  await page.locator('.cp-result').waitFor();
  console.log('CHAM_PLAY_MATCH_PASS');
  await page.locator('[data-cp-back]').first().click();
  await page.locator('[data-cp-game="word"]').click();
  await page.locator('[data-v3-begin="word"]').click();
  const wordPaths=await page.evaluate(()=>window.CHAMPlayQA.getState().state.wordPositions);
  assert.equal(Object.keys(wordPaths).length,5);
  for(const cells of Object.values(wordPaths)){
   const first=cells[0],last=cells[cells.length-1];
   await page.locator('[data-cp-cell="'+first+'"]').click();
   await page.locator('[data-cp-cell="'+last+'"]').click();
  }
  await page.locator('.cp-result').waitFor();
  console.log('CHAM_PLAY_WORD_PASS');
  await page.locator('[data-cp-back]').first().click();
  await page.locator('[data-cp-game="speed"]').click();
  await page.locator('[data-v3-begin="speed"]').click();
  await page.locator('[data-cp-timebar]').waitFor();
  assert.ok(await page.locator('[data-cp-seconds]').count(),'timer and progress available');
  for(let i=0;i<5;i++){
   const index=await page.evaluate(()=>window.CHAMPlayQA.getState().state.questions[window.CHAMPlayQA.getState().state.index].answerIndex);
   await page.locator('[data-cp-choice="'+index+'"]').click();
   await page.locator('[data-cp-next]').click();
  }
  await page.locator('.cp-result').waitFor();
  assert.equal(await page.evaluate(()=>window.CHAMDemo.points()),120,'five completions earn one daily reward');
  await page.locator('[data-cp-back]').first().click();
  await page.locator('[data-cp-game="pack"]').click();
  await page.locator('[data-v3-begin="pack"]').click();
  for(let i=0;i<4;i++){
   const pick=await page.evaluate(()=>{
     const s=window.CHAMPlayV3QA.getCurrent().activeGame.state;
     return s.queue[s.index].answer;
   });
   await page.locator('[data-v3-pack="'+pick+'"]').click();
   await page.locator('[data-v3-next-pack]').click();
  }
  await page.locator('.cp3-own-result').waitFor();
  assert.equal(await page.evaluate(()=>window.CHAMDemo.points()),120,'packing cannot double-reward daily points');
  await page.locator('[data-v3-back]').first().click();
  await page.locator('[data-cp-game="wheel"]').click();
  await page.locator('[data-v3-begin="wheel"]').click();
  await page.locator('[data-v3-spin]').click();
  await page.locator('.cp3-own-result').waitFor({timeout:5000});
  assert.equal(await page.evaluate(()=>window.CHAMPlayMeta.summary().giftClaimed),true,'daily cosmetic claimed');
  assert.equal(await page.evaluate(()=>window.CHAMDemo.points()),120,'daily wheel pays no wallet points');
  await page.locator('[data-v3-back]').first().click();
  assert.equal(await page.locator('.cp-card').count(),7);
  assert.equal(await page.evaluate(()=>document.querySelector('.cp-summary').textContent.includes('7 / 7')),true,'all games recorded');
  console.log('CHAM_PLAY_SPEED_AND_WALLET_PASS');
  await page.reload({waitUntil:'load'});
  await waitReady(page);
  assert.equal(await page.evaluate(()=>window.CHAMDemo.points()),120,'demo wallet survives reload');
  assert.equal(await page.evaluate(()=>document.querySelector('.cp-summary').textContent.includes('7 / 7')),true,'meta completion survives reload');
  assert.deepEqual(errors,[],'no JS runtime exceptions');
  fs.writeFileSync(path.join(root,'.qa','cham-play-v2-report.json'),JSON.stringify({measurements,results:'5 games complete; reward idempotent; filters; persistent session'},null,2),'utf8');
  assert.equal(await page.evaluate(()=>window.CHAMPlayMeta.summary().completed.length),7,'all game modes persisted');
  console.log('CHAM_PLAY_V3_FULL_REGRESSION_PASS');
  await context.close();
 } finally {
  await browser.close();
  server.close();
 }
})().catch(e=>{console.error('CHAM_PLAY_FULL_REGRESSION_FAIL',e.stack||e);process.exitCode=1});
