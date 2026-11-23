/* Multi-page design-system QA: typography, hover and reversible scroll. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('F:/Oxyz Edu/node_modules/playwright');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'assets');
const about=fs.readFileSync(path.join(root,'snippets/cham-about-content.liquid'),'utf8')
 .replace(/\{\{\s*routes\.all_products_collection_url\s*\}\}/g,'/collections/all');
const stylesheetNames=[
 'cham-theme.css','cham-refinement.css','cham-demo.css','cham-minimal.css',
 'cham-polish.css','cham-v3.css','cham-v4.css','cham14-about.css',
 'cham-club-v3.css','cham-design-system.css'
];
const styles=stylesheetNames.map(n=>'<link rel="stylesheet" href="/assets/'+n+'">').join('');
const routes={
 about:{selector:'.cham-about-report__section-heading',content:about},
 story:{selector:'.cham-story-v4__story-card',content:'<section class="cham-story-v4"><div style="height:75vh"></div><div class="cham-story-v4__stories"><header class="cham-story-v4__section-head"><h2>Câu chuyện</h2></header><article class="cham-story-v4__story-card"><a class="cham-story-v4__card-photo"><img src="/assets/cham6-craft-shape-640.webp" alt="Sản xuất gốm"></a><h3>Nghề thủ công Việt Nam</h3><p>Chất liệu và người thợ.</p></article></div></section>'},
 club:{selector:'.cc-shell .cc-lead',content:'<div class="cc-shell"><header class="cc-lead"><h1>CHẠM Club</h1><p>Ví điểm demo.</p></header><div class="cc-panel">Nội dung demo</div></div>'},
 product:{selector:'.cham-product-page__info',content:'<div class="cham-product-page"><div class="cham-product-page__info"><h1>Sản phẩm thủ công</h1><p>Chất liệu tự nhiên.</p><button class="cham-product-page__add">Xem thông tin</button></div></div>'},
 collection:{selector:'.cham-category-photo-card',content:'<div class="cham-craft-categories"><a class="cham-category-photo-card" href="/collections/all"><span class="cham-category-photo-card__photo"><img src="/assets/cham5-detail-weave.webp" alt="Mây tre đan"></span><span class="cham-category-photo-card__caption"><strong>Mây tre đan</strong></span></a></div>'}
};
function html(route){
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
  styles+'</head><body class="cham-site" style="margin:0"><div id="header-group"><header data-cham-header style="height:64px">CHẠM</header></div>'+
  '<main id="MainContent"><div style="min-height:73vh"></div>'+routes[route].content+
  '<div style="height:145vh"></div></main><footer style="padding:20px"><a href="/">CHẠM</a></footer>'+
  '<script defer src="/assets/cham-theme.js"></script><script defer src="/assets/cham-unified-motion.js"></script></body></html>';
}
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');
 if(url.pathname.startsWith('/assets/')){
  const file=path.join(assets,path.basename(decodeURIComponent(url.pathname)));
  if(!fs.existsSync(file)){res.writeHead(404);res.end('Not found');return;}
  const ext=path.extname(file);
  res.setHeader('Content-Type',({'.css':'text/css','.js':'application/javascript','.webp':'image/webp','.woff2':'font/woff2'})[ext]||'application/octet-stream');
  res.end(fs.readFileSync(file));return;
 }
 const route=url.pathname.slice(1)||'about';
 res.setHeader('Content-Type','text/html; charset=utf-8');
 res.end(html(routes[route]?route:'about'));
});
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
 const report=[];
 try{
  for(const route of Object.keys(routes)){
   for(const width of [390,1440]){
    const context=await browser.newContext({viewport:{width,height:width===390?844:900}});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:'+server.address().port+'/'+route,{waitUntil:'load'});
    const selector=routes[route].selector;
    await page.locator(selector).first().waitFor();
    const layout=await page.evaluate((selector)=>{
      const el=document.querySelector(selector);
      const title=el.querySelector('h1,h2,h3,strong')||el;
      return {overflow:document.documentElement.scrollWidth-innerWidth,font:getComputedStyle(title).fontFamily,
        marked:el.hasAttribute('data-cham-motion-item')};
    },selector);
    assert.ok(layout.overflow<=2,'No horizontal overflow '+route+' '+width+': '+JSON.stringify(layout));
    assert.ok(layout.font.includes('Be Vietnam Pro'),'font mismatch '+route+' '+width+': '+layout.font);
    assert.ok(layout.marked,'reversible motion not attached to '+route);
    const metrics=[];
    const setup=await page.evaluate(selector=>{
      const el=document.querySelector(selector);
      return {start:el.getBoundingClientRect().top+scrollY,height:innerHeight};
    },selector);
    for(const fraction of [1.12,.56,.2,1.12]){
      await page.evaluate(({y})=>{
        document.documentElement.style.scrollBehavior='auto';
        window.scrollTo({top:y,behavior:'instant'});
      },{y:Math.max(0,setup.start-setup.height*fraction)});
      await page.waitForTimeout(85);
      metrics.push(await page.evaluate(sel=>Number(document.querySelector(sel).dataset.chamMotionValue),selector));
    }
    assert.ok(metrics[1]>metrics[0]+.1,'forward progress '+route+' '+width+': '+metrics);
    assert.ok(metrics[2]>=metrics[1],'forward monotonic '+route+' '+width+': '+metrics);
    assert.ok(Math.abs(metrics[3]-metrics[0])<.08,'scroll reverse '+route+' '+width+': '+metrics);
    assert.deepEqual(errors,[],'runtime exceptions '+route);
    report.push({route,width,metrics});
    console.log('CHAM_DESIGN_SYSTEM_PASS',route,width,JSON.stringify(metrics));
    await context.close();
   }
  }
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:'+server.address().port+'/about',{waitUntil:'load'});
  assert.equal(await page.locator('[data-cham-motion-item]').count(),0,'reduced motion no animated markup');
  console.log('CHAM_DESIGN_SYSTEM_REDUCED_PASS');
  await context.close();
  fs.writeFileSync(path.join(root,'.qa','cham-global-design-qa.json'),JSON.stringify(report,null,2),'utf8');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error('CHAM_DESIGN_SYSTEM_FAIL',e.stack||e);process.exitCode=1});
