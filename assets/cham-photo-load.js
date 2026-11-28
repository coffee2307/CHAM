(()=>{'use strict';
const selector=['.cham-shop-card__visual img','.cham-coir-card__image img','.cham-vietnam-photo img','.cham-curated-card img','.cham-bundle-card__images img','.cham5-category__image img','.cham5-product__image img','.cham5-bridge__images img','.cham5-process__photo img','.cham8-scene img','.cham-category-photo-card__photo img','.cham-product-card__image img','.cham-product-page__thumb img','.cham-story-v4__card-photo img'].join(',');
const seen=new WeakSet();
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function prepare(img){
 if(seen.has(img)||!img.matches(selector))return;seen.add(img);
 // Already decoded/cached images stay visible; no fade on scroll or resize.
 if(img.complete&&img.naturalWidth)return;
 img.decoding='async';
 if(reduced.matches)return;
 img.classList.add('cham-photo-wait');
 let settled=false;
 const show=()=>{if(settled)return;settled=true;img.classList.remove('cham-photo-wait');img.classList.add('cham-photo-ready');};
 const fail=()=>{if(settled)return;settled=true;img.classList.remove('cham-photo-wait');};
 const loaded=()=>{if(typeof img.decode==='function')img.decode().then(show,show);else show();};
 img.addEventListener('load',loaded,{once:true});img.addEventListener('error',fail,{once:true});
 if(img.complete){if(img.naturalWidth)loaded();else fail();}
}
function scan(node){if(node.nodeType!==1&&node.nodeType!==9)return;if(node.matches?.(selector))prepare(node);node.querySelectorAll?.(selector).forEach(prepare);}
scan(document);
const main=document.querySelector('#MainContent');
if(main)new MutationObserver(records=>{for(const rec of records)for(const node of rec.addedNodes)scan(node);}).observe(main,{childList:true,subtree:true});
})();