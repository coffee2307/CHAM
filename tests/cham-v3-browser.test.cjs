const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('F:\\Oxyz Edu\\node_modules\\playwright');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'assets');
const css=['cham-theme.css','cham-refinement.css','cham-demo.css','cham-minimal.css','cham-polish.css','cham-v3.css'];
const avatars=fs.readdirSync(assets).filter(x=>x.startsWith('cham-avatar-')&&x.endsWith('.svg'));
function documentFor(mode){
 const styleSheets=css.concat(mode==='category'?[]:['cham-quest.css','cham-club-v3.css']).map(n=>'<link rel="stylesheet" href="/assets/'+n+'">').join('');
 const head='<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+styleSheets+'</head><body class="cham-site">';
 if(mode==='category'){
 const cards=['Gốm & Trang trí','Mây tre đan','Phụ kiện','Quà tặng','Vải & Dệt thủ công'].map((title,i)=>'<a href="#" class="cham-craft-tile"><span class="cham-craft-tile__photo"><img src="/assets/'+avatars[(i+1)*5]+'" alt="'+title+'"></span><span class="cham-craft-tile__caption"><strong>'+title+'</strong><small>4 sản phẩm</small></span></a>').join('');
 return head+'<section class="cham-craft-categories"><div class="cham-shell"><header class="cham-craft-categories__head"><div><p class="cham-craft-categories__eyebrow">Tuyển chọn dành cho bạn</p><h2>Khám phá theo danh mục</h2></div><a href="#" class="cham-craft-categories__all">Tất cả sản phẩm</a></header><div class="cham-craft-categories__grid">'+cards+'</div></div></section></body></html>';
 }
 const sources=mode==='play'?['cham-craft-knowledge.js','cham-quest.js']:['cham-club-v3.js'];
 const scripts=['cham-demo-core.js',...sources,'cham-demo-pages.js'].map(n=>'<script src="/assets/'+n+'" defer></script>').join('');
 return head+'<script type="application/json" id="cham-avatar-catalog">'+JSON.stringify(avatars.map(n=>'/assets/'+n))+'</script><script type="application/json" id="cham-play-scenes">[]</script><div data-cham-demo-app data-mode="'+mode+'">Loading</div>'+scripts+'</body></html>';
}
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/assets/')){
  const file=path.join(assets,path.basename(url.pathname));
  if(!fs.existsSync(file)){res.writeHead(404);res.end('Missing');return;}
  const ext=path.extname(file);
  res.setHeader('Content-Type',ext==='.svg'?'image/svg+xml':ext==='.css'?'text/css':'application/javascript');
  res.end(fs.readFileSync(file));return;
 }
 if(url.pathname==='/cart.js'){res.setHeader('Content-Type','application/json');res.end('{"item_count":0,"items":[]}');return;}
 res.setHeader('Content-Type','text/html;charset=utf-8');
 res.end(documentFor(url.pathname.includes('cham-play')?'play':url.pathname.includes('cham-club')?'club':'category'));
});
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const url='http://127.0.0.1:'+server.address().port;
 const chrome=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
 const qa=[];
 try{
  for(const width of [320,390,768,1440]){
   const ctx=await chrome.newContext({viewport:{width,height:900}}),page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.locator('.cham-craft-tile').first().waitFor();
   const boxes=await page.evaluate(()=>{
    const item=document.querySelector('.cham-craft-tile');
    const im=item.querySelector('.cham-craft-tile__photo'),cap=item.querySelector('.cham-craft-tile__caption');return {photo:im.getBoundingClientRect().bottom,caption:cap.getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth+1,display:getComputedStyle(item).display,direction:getComputedStyle(item).flexDirection,gap:getComputedStyle(item).gap,photoPos:getComputedStyle(im).position,captionPos:getComputedStyle(cap).position,transform:getComputedStyle(cap).transform,margin:getComputedStyle(cap).margin,photoHeight:im.getBoundingClientRect().height,photoWidth:im.getBoundingClientRect().width,captionHeight:cap.getBoundingClientRect().height,cardWidth:item.getBoundingClientRect().width,gridWidth:item.parentElement.getBoundingClientRect().width,gridColumns:getComputedStyle(item.parentElement).gridTemplateColumns,photoTop:getComputedStyle(im).top,photoBottom:getComputedStyle(im).bottom,photoMargin:getComputedStyle(im).margin,photoTransform:getComputedStyle(im).transform,capTop:getComputedStyle(cap).top,photoOffset:im.offsetTop,capOffset:cap.offsetTop,cardHeight:item.getBoundingClientRect().height};
   });
   console.log('CATEGORY_GEOMETRY',width,JSON.stringify(boxes));
   assert.ok(boxes.caption>=boxes.photo,'caption overlapped image at '+width);
   assert.equal(boxes.overflow,false,'horizontal overflow category '+width);
   assert.equal(errors.length,0,'browser errors category '+width);
   if(width===1440||width===390){fs.mkdirSync(path.join(root,'.qa'),{recursive:true});await page.screenshot({path:path.join(root,'.qa','category-'+width+'.png'),fullPage:true});}
   qa.push('category '+width+' PASS');
   await ctx.close();
  }
  for(const width of [390,1440]){
   const ctx=await chrome.newContext({viewport:{width,height:900}}),page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url+'/pages/cham-club',{waitUntil:'domcontentloaded'});
   await page.locator('.cc-banner').waitFor();
   assert.equal(await page.locator('.cc-stat').count(),3);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'club overflow '+width);
   if(width===1440){fs.mkdirSync(path.join(root,'.qa'),{recursive:true});await page.screenshot({path:path.join(root,'.qa','club-1440.png'),fullPage:true});}
   await page.goto(url+'/pages/cham-club?tab=settings',{waitUntil:'domcontentloaded'});
   await page.locator('[data-cc-avatar-open]').click();
   assert.equal(await page.locator('[data-cc-avatar-select]').count(),24);
   await page.locator('[data-cc-avatar-select="cham-avatar-001.svg"]').click();
   assert.equal(await page.evaluate(()=>window.CHAMDemo.getState().profile.avatar),'cham-avatar-001.svg');
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('.cc-avatar-setting__img').waitFor();
   assert.equal(await page.evaluate(()=>window.CHAMDemo.getState().profile.avatar),'cham-avatar-001.svg');
   assert.equal(errors.length,0,'browser errors club '+width+': '+errors.join('|'));
   qa.push('club '+width+' PASS');
   await ctx.close();
  }
  for(const width of [390,1440]){
   const ctx=await chrome.newContext({viewport:{width,height:900}}),page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url+'/pages/cham-play',{waitUntil:'domcontentloaded'});
   await page.locator('[data-cq-start]').waitFor();
   if(width===1440){fs.mkdirSync(path.join(root,'.qa'),{recursive:true});await page.screenshot({path:path.join(root,'.qa','quest-1440.png'),fullPage:true});}
   await page.evaluate(()=>window.CHAMCraftKnowledge.buildQuestion=f=>({question:'Nghề nào ở '+f.village+'?',options:['Đúng','Sai 1','Sai 2','Sai 3'],answerIndex:0,answer:'Đúng',explanation:'Thông tin nghề được đối chiếu với nguồn du lịch.',source:f.source}));
   await page.locator('[data-cq-start]').click();
   await page.locator('[data-cq-down]').click();
   for(let i=0;i<5;i++){
    await page.locator('[data-cq-skip]').click();
    await page.locator('[data-cq-answer="0"]').click();
    await page.locator('[data-cq-after-answer]').click();
   }
   await page.locator('.cq-result').waitFor();
   assert.equal(await page.evaluate(()=>window.CHAMDemo.points()),120);
   assert.equal(errors.length,0,'browser errors quest '+width+': '+errors.join('|'));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'quest overflow '+width);
   qa.push('quest '+width+' PASS');
   await ctx.close();
  }
  console.log('BROWSER_FIXTURE_QA',qa.join(' | '),'SVG',avatars.length);
 }finally{await chrome.close();}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
