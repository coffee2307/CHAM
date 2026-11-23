const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('F:\\Oxyz Edu\\node_modules\\playwright');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'assets');
const css=['cham-theme.css','cham-refinement.css','cham-demo.css','cham-minimal.css','cham-polish.css','cham-v3.css','cham-v4.css'];
const avatars=fs.readdirSync(assets).filter(x=>x.startsWith('cham-avatar-')&&x.endsWith('.svg'));
function documentFor(mode){
 const styleSheets=css.concat(mode==='category'?[]:['cham-quest.css','cham-club-v3.css']).map(n=>'<link rel="stylesheet" href="/assets/'+n+'">').join('');
 const head='<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+styleSheets+'</head><body class="cham-site'+(mode==='play'?' cham-play-mode':'')+'"><div id="header-group" style="height:60px;min-height:60px"></div>';
 if(mode==='category'){
 const cards=['Gốm & Trang trí','Mây tre đan','Phụ kiện','Quà tặng','Vải & Dệt thủ công'].map((title,i)=>'<a href="#" class="cham-category-photo-card"><span class="cham-category-photo-card__photo"><img src="/assets/'+avatars[(i+1)*5]+'" alt="'+title+'"></span><span class="cham-category-photo-card__caption"><strong>'+title+'</strong><small>4 sản phẩm</small></span></a>').join('');
 return head+'<section class="cham-craft-categories"><div class="cham-shell"><header class="cham-craft-categories__head"><div><p class="cham-craft-categories__eyebrow">Tuyển chọn dành cho bạn</p><h2>Khám phá theo danh mục</h2></div><a href="#" class="cham-craft-categories__all">Tất cả sản phẩm</a></header><div class="cham-craft-categories__grid">'+cards+'</div></div></section></body></html>';
 }
 const sources=mode==='play'?['cham-craft-knowledge.js','cham-quest.js']:['cham-club-v3.js'];
 const scripts=['cham-demo-core.js',...sources,'cham-demo-pages.js'].map(n=>'<script src="/assets/'+n+'" defer></script>').join('');
 return head+'<script type="application/json" id="cham-avatar-catalog">'+JSON.stringify(avatars.map(n=>'/assets/'+n))+'</script><script type="application/json" id="cham-dino-assets">'+JSON.stringify(Object.fromEntries(['run','jump','idle','landscape','pottery','stump'].map(k=>[k,'/assets/cham-dino-'+(k==='run'||k==='jump'||k==='idle'?k+'.webp':k==='landscape'?'landscape.svg':k==='pottery'?'pottery.svg':'stump.svg')])) )+'</script><script type="application/json" id="cham-play-scenes">[]</script><main id="MainContent"><section class="cham-demo-app"><div data-cham-demo-app data-mode="'+mode+'">Loading</div></section></main><footer>Footer test must hide</footer>'+scripts+'</body></html';
}
async function assertContrast(page,label){
 const issues=await page.evaluate(()=>{
  const pick=s=>{const m=s.match(/rgba?\(([^)]+)\)/);return m?m[1].split(',').slice(0,3).map(Number):null;};
  const luminance=rgb=>rgb.reduce((sum,v,i)=>{
    const c=v/255,linear=c<=.04045?c/12.92:((c+.055)/1.055)**2.4;
    return sum+linear*[.2126,.7152,.0722][i];
  },0);
  const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  return [...document.querySelectorAll('a.cc-button,button.cc-button,.cc-reward button,.cc-favorite__actions button,.dino-primary,.dino-secondary,.dino-choice,.dino-jump-button')]
   .filter(el=>!el.matches(':disabled')&&el.getBoundingClientRect().width>0)
   .map(el=>{const c=getComputedStyle(el),fg=pick(c.color),bg=pick(c.backgroundColor);return {tag:el.tagName,cls:el.className,text:el.textContent.trim().slice(0,35),ratio:fg&&bg?Math.round(100*contrast(fg,bg))/100:0,fg:c.color,bg:c.backgroundColor};})
   .filter(x=>x.ratio>0&&x.ratio<4.5);
 });
 assert.equal(issues.length,0,'Low button contrast on '+label+': '+JSON.stringify(issues));
 return issues;
}
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/assets/')){
  const file=path.join(assets,path.basename(url.pathname));
  if(!fs.existsSync(file)){res.writeHead(404);res.end('Missing');return;}
  const ext=path.extname(file);
  res.setHeader('Content-Type',ext==='.svg'?'image/svg+xml':ext==='.css'?'text/css':ext==='.webp'?'image/webp':'application/javascript');
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
   await page.locator('.cham-category-photo-card').first().waitFor();
   const boxes=await page.evaluate(()=>{
    const item=document.querySelector('.cham-category-photo-card');
    const im=item.querySelector('.cham-category-photo-card__photo'),cap=item.querySelector('.cham-category-photo-card__caption');return {photo:im.getBoundingClientRect().bottom,caption:cap.getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth+1,display:getComputedStyle(item).display,direction:getComputedStyle(item).flexDirection,gap:getComputedStyle(item).gap,photoPos:getComputedStyle(im).position,captionPos:getComputedStyle(cap).position,transform:getComputedStyle(cap).transform,margin:getComputedStyle(cap).margin,photoHeight:im.getBoundingClientRect().height,photoWidth:im.getBoundingClientRect().width,captionHeight:cap.getBoundingClientRect().height,cardWidth:item.getBoundingClientRect().width,gridWidth:item.parentElement.getBoundingClientRect().width,gridColumns:getComputedStyle(item.parentElement).gridTemplateColumns,photoTop:getComputedStyle(im).top,photoBottom:getComputedStyle(im).bottom,photoMargin:getComputedStyle(im).margin,photoTransform:getComputedStyle(im).transform,capTop:getComputedStyle(cap).top,photoOffset:im.offsetTop,capOffset:cap.offsetTop,cardHeight:item.getBoundingClientRect().height};
   });
   assert.ok(boxes.caption>=boxes.photo,'caption overlapped image at '+width);
   assert.equal(boxes.overflow,false,'horizontal overflow category '+width);
   assert.equal(await page.locator('.cham-category-photo-card__photo img').first().evaluate(el=>getComputedStyle(el).filter),'none','category must show original image colors');
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
   await assertContrast(page,'club overview '+width);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'club overflow '+width);
   if(width===1440){fs.mkdirSync(path.join(root,'.qa'),{recursive:true});await page.screenshot({path:path.join(root,'.qa','club-1440.png'),fullPage:true});}
   await page.locator('.cc-avatar-camera').click();
   assert.equal(await page.locator('[data-cc-avatar-select]').count(),24);
   await page.locator('[data-cc-avatar-select="cham-avatar-001.svg"]').click();
   assert.equal(await page.evaluate(()=>window.CHAMDemo.getState().profile.avatar),'cham-avatar-001.svg');
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('.cc-avatar-img').waitFor();
   assert.equal(await page.evaluate(()=>window.CHAMDemo.getState().profile.avatar),'cham-avatar-001.svg');
   for(const tab of ['orders','favorites','rewards','settings']){
     await page.goto(url+'/pages/cham-club?tab='+tab,{waitUntil:'domcontentloaded'});
     await page.locator('.cc-banner').waitFor();
     await assertContrast(page,'club '+tab+' '+width);
   }
   assert.equal(errors.length,0,'browser errors club '+width+': '+errors.join('|'));
   qa.push('club '+width+' PASS');
   await ctx.close();
  }
  // New five-game suite: tests/cham-play-browser.test.cjs.
  qa.push('CHẠM Play 2.0 tested separately');
  console.log('BROWSER_FIXTURE_QA',qa.join(' | '),'SVG',avatars.length);
 }finally{await chrome.close();}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
