const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const json=p=>JSON.parse(read(p));
const index=json('templates/index.json'),product=json('templates/product.json'),collection=json('templates/collection.json'),search=json('templates/search.json');
assert.deepEqual(index.order,['hero','categories','products','catalog','club','about']);
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
