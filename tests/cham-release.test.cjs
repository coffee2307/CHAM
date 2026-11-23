const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const json=p=>JSON.parse(read(p));
const index=json('templates/index.json'),product=json('templates/product.json'),collection=json('templates/collection.json'),search=json('templates/search.json');
assert.deepEqual(index.order,['story','explore','market']);
assert.equal((read('sections/cham5-story.liquid').match(/class="cham8-scene cham8-scene--/g)||[]).length,6,'6 distinct editorial scenes');
assert.ok(read('sections/cham5-story.liquid').includes('cham8-scene--fire'),'full photographic kiln chapter');
assert.ok(read('sections/cham5-story.liquid').includes('cham8-scene--precision'),'macro precision chapter');
assert.ok(read('sections/cham5-story.liquid').includes('cham8-scene--surface'),'asymmetrical surface diptych');
assert.ok(read('sections/cham5-story.liquid').includes('class="cham9-hero"'),'editorial hero active');
assert.ok(!read('sections/cham5-story.liquid').includes('cham5-process__heading'),'redundant intro removed');
assert.ok(!read('sections/cham5-story.liquid').includes('Một hành trình nghề truyền thống'),'obsolete copy removed');
assert.ok(read('sections/cham5-story.liquid').includes('cham10-potter.webp'),'original editorial drawing included');
assert.ok(read('assets/cham5-home.js').includes("mm.add('(max-width:767px)"),'mobile-specific scroll setup');
assert.ok(read('assets/cham5-home.js').includes("process.classList.add('is-native-sticky')"),'native sticky horizontal story');
assert.ok(!read('assets/cham5-home.js').includes("id:'cham-horizontal-craft'"),'horizontal story no longer repositions the page using GSAP pin');
assert.ok(read('assets/cham5-home.js').includes("window.addEventListener('scroll',queueNative"),'scrollY drives the horizontal track without changing layout');
assert.ok(read('assets/cham8-story.js').includes("matchMedia('(max-width:767px)').matches"),'static mobile images reduce scroll jitter');
assert.ok(!read('sections/cham5-story.liquid').includes('CHẠM / THỦ CÔNG VIỆT NAM'),'decorative slash label removed');
assert.ok(!read('sections/cham5-story.liquid').includes('NHỮNG ĐIỀU ĐƯỢC LÀM BẰNG TAY'),'unnecessary label removed');
assert.ok(!read('layout/theme.liquid').includes("<script src=\"{{ 'cham8-hero.js'"),'retired WebGL runtime not loaded');
for (const asset of ['cham8-home.css','cham9-home.css','cham11-mobile-clean.css','cham8-story.js'])
  assert.ok(read('layout/theme.liquid').includes(asset),'homepage includes '+asset);
assert.ok(read('assets/cham-theme.js').includes('data-cham-hidden'),'scroll-aware header');
assert.equal(product.sections.main.type,'cham-product-page');
assert.equal(collection.sections.main.type,'cham-shop-collection');
assert.equal(search.sections.main.type,'cham-search');
for(const [file,required] of [
 ['sections/cham-product-page.liquid',['product.title','product.description','data-cham-add-cart','ChamQuantity','cham-shop-card']],
 ['sections/cham-shop-collection.liquid',['collection.products','data-cham-filter-price','data-cham-filter-sort','data-cham-filter-search']],
 ['snippets/cham-shop-card.liquid',['product.featured_image','product.price | money','data-cham-add-cart','data-cham-favorite']],
 ['assets/cham-shop.js',['/cart/add.js','/cart.js','syncCart','data-cham-filter-search']],
 ['assets/cham-polish.css',['.cham-shop-grid','.cham-product-page__main','.cham-home-club__inner','prefers-reduced-motion']]
])for(const fragment of required)assert.ok(read(file).includes(fragment),file+' missing '+fragment);
assert.ok(!read('layout/theme.liquid').includes('cham-demo-notice'),'sitewide demo banner removed');
assert.ok(!read('sections/cham-home-hero.liquid').includes('<figcaption>'),'unnecessary hero caption removed');
assert.ok(!read('sections/cham-footer.liquid').includes('CHẠM /'),'footer slash-free');
const visibleFiles=['sections/cham-custom-callout.liquid','sections/cham-demo-app.liquid','sections/cham-editorial-manifesto.liquid','sections/cham-values.liquid','sections/cham-weave-showcase.liquid','sections/main-page.liquid','snippets/cham-about-content.liquid','snippets/cham-story-content.liquid'];
for(const file of visibleFiles){
 const text=read(file);
 for(const marker of ['CHẠM /','01—01','↗','VỀ CHẠM / ABOUT US','CÂU CHUYỆN / OUR STORY','CÁ NHÂN HÓA / ĐẶT THEO YÊU CẦU'])assert.ok(!text.includes(marker),file+' contains '+marker);
}
console.log('PASS: 4 route templates, 5 commerce/render source checks, 9 copy and interface cleanup checks');
