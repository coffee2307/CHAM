(() => {
  'use strict';
  const root = document;
  const $ = (s, parent=root) => parent.querySelector(s);
  const $$ = (s, parent=root) => [...parent.querySelectorAll(s)];
  const toast = (message, error=false) => {
    if (window.CHAMDemo?.toast) window.CHAMDemo.toast(message,error?'error':'ok');
    else {
      let node=$('[data-cham-shop-toast]');
      if (!node){node=document.createElement('div');node.setAttribute('role','status');node.dataset.chamShopToast='';node.className='cham-shop-toast';document.body.append(node);}
      node.textContent=message;node.hidden=false;
      clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.hidden=true,3000);
    }
  };
  async function syncCart(){
    const response=await fetch('/cart.js',{credentials:'same-origin',cache:'no-store'});
    if(!response.ok)return;
    const cart=await response.json();
    $$('.cham-cart-link').forEach(link=>{
      let count=$('.cham-cart-count',link);
      if(cart.item_count>0){
        if(!count){count=document.createElement('span');count.className='cham-cart-count';count.setAttribute('aria-hidden','true');link.append(count);}
        count.textContent=String(cart.item_count);
      }else if(count)count.remove();
      link.setAttribute('aria-label','Giỏ hàng, '+cart.item_count+' sản phẩm');
    });
    document.dispatchEvent(new CustomEvent('cham:cart-updated',{detail:cart}));
  }
  // Optional service fields remain disabled unless selected, so they do not enter unrelated carts.
  const personal=$('[data-cham-personalize]');
  if(personal){
    for(const [toggle,fields] of [['personal','personal'],['gift','gift']]){
      const cb=$('[data-cham-'+toggle+'-toggle]',personal),fs=$('[data-cham-'+fields+'-fields]',personal);
      if(cb&&fs){const sync=()=>{fs.hidden=!cb.checked;fs.disabled=!cb.checked;};cb.addEventListener('change',sync);sync();}
    }
    const preview=$('[data-cham-personal-preview]',personal),input=$('[data-cham-personal-text]',personal),style=$('[data-cham-personal-style]',personal);
    const draw=()=>{if(preview){preview.textContent=input?.value.trim()||'An Nhiên';preview.dataset.style=style?.value||'Thanh lịch';}};
    input?.addEventListener('input',draw);style?.addEventListener('change',draw);draw();
  }
  root.addEventListener('submit',async event=>{
    const form=event.target.closest('form[data-cham-bundle]');if(!form)return;
    event.preventDefault();const btn=$('button[type=submit]',form);if(!btn||btn.disabled)return;
    const ids=$$('[data-bundle-variant]',form).map(x=>Number(x.value));if(!ids.length||ids.some(x=>!Number.isSafeInteger(x)||x<=0))return;
    const label=btn.textContent;btn.disabled=true;btn.textContent='Đang thêm…';
    try{
      const response=await fetch('/cart/add.js',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({items:ids.map(id=>({id,quantity:1,properties:{'Bộ quà':form.dataset.bundleTitle}}))})});
      const result=await response.json().catch(()=>({}));if(!response.ok)throw Error(result.description||result.message||'Không thể thêm cả bộ');
      await syncCart();toast('Đã thêm cả bộ vào giỏ');btn.textContent='Đã thêm';setTimeout(()=>{btn.disabled=false;btn.textContent=label;},1000);
    }catch(e){toast(e.message,true);btn.disabled=false;btn.textContent=label;}
  });
  root.addEventListener('submit',event=>{
    if(!event.target.matches('form[data-cham-contact-demo]'))return;
    event.preventDefault();
    if(!event.target.reportValidity())return;
    const result=event.target.querySelector('[data-cham-contact-result]');
    if(result)result.hidden=false;
    event.target.reset();
  });
  root.addEventListener('submit',async event=>{
    const form=event.target.closest('form[data-cham-add-cart]');
    if(!form)return;
    event.preventDefault();
    if(!form.reportValidity())return;
    const button=form.querySelector('button[type=submit]');
    if(!button||button.disabled)return;
    const label=button.textContent;
    button.disabled=true;
    button.textContent='Đang thêm…';
    try{
      const data=new FormData(form);
      const response=await fetch('/cart/add.js',{method:'POST',body:data,credentials:'same-origin',headers:{'Accept':'application/json'}});
      const result=await response.json().catch(()=>({}));
      if(!response.ok)throw Error(result.description||result.message||'Không thể thêm sản phẩm');
      await syncCart();
      toast('Đã thêm sản phẩm vào giỏ');
      button.textContent='Đã thêm';
      window.setTimeout(()=>{button.textContent=label;button.disabled=false;},950);
    }catch(err){
      toast(err.message||'Không thể thêm vào giỏ',true);
      button.textContent=label;button.disabled=false;
    }
  });
  root.addEventListener('click',event=>{
    const qty=event.target.closest('[data-cham-quantity]');
    if(qty){
      const input=$('input[name=quantity]',qty.closest('form'));
      if(input){let next=(parseInt(input.value,10)||1)+Number(qty.dataset.chamQuantity);input.value=String(Math.max(1,Math.min(10,next)));}
    }
    const thumb=event.target.closest('[data-cham-gallery-src]');
    if(thumb){
      const stage=thumb.closest('.cham-product-page__gallery');
      const img=$('#ChamProductImage',stage);
      if(img){img.src=thumb.dataset.chamGallerySrc;img.srcset='';img.alt=thumb.dataset.chamGalleryAlt;}
      $$('[data-cham-gallery-src]',stage).forEach(btn=>{const current=btn===thumb;btn.classList.toggle('is-current',current);btn.setAttribute('aria-pressed',String(current));});
    }
    if(event.target.closest('[data-cham-reset-filters]')){
      const section=event.target.closest('[data-cham-shop]')||$('[data-cham-shop]');
      if(!section)return;
      const search=$('[data-cham-filter-search]',section),price=$('[data-cham-filter-price]',section),sort=$('[data-cham-filter-sort]',section);
      if(search)search.value='';if(price)price.value='all';if(sort)sort.value='featured';
      section.dataset.chamActiveUse='all'; $$('[data-cham-use]',section).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.chamUse==='all')));
      $$('select[data-cham-filter-price],select[data-cham-filter-sort]',section).forEach(el=>el.dispatchEvent(new Event('change',{bubbles:true})));
      updateFilters(section);
    }
  });
  root.addEventListener('change',event=>{
    const select=event.target.closest('[data-cham-variant-select]');
    if(select){
      const option=select.selectedOptions[0];
      const value=$('[data-cham-product-price]');
      if(value&&option)value.textContent=option.dataset.price;
    }
  });
  const originalOrder=new WeakMap();
  const useGroups={"tableware":["ly-gom-thu-cong","ly-gom-men-xanh","bat-gom-com","bo-bat-gom","dia-gom-ban-an","bo-do-an-gom","bat-go","muong-go","muong-tre","de-lot-ly-tron","khay-go"],"tea":["am-tra-gom-den","am-tra-gom-tao-hinh","binh-rot-gom","tach-dia-gom"],"kitchen":["xung-hap-tre","thot-go","coi-chay-go","ro-tre-dan","khay-tre-dan","khay-co-dan"],"decor":["binh-hoa-gom","lo-gom-trang-tri","chau-cay-dat-nung","chup-den-may","ghe-may","chieu-tre","chieu-luc-binh","chieu-coi","tam-dan-la-dua","tham-chui-chan"],"storage":["gio-tre-dan","gio-may","gio-luc-binh","gio-dung-do-luc-binh","hop-luc-binh","gio-co-dan","hop-go-tron"],"fashion":["tui-luc-binh","tui-rom-dan","mu-co-dan","non-dan-tre","quat-tay-tre","tui-soi-day","tui-day-mini"],"care":["luoc-go","mieng-cha-got-chan","mieng-xo-muop"],"pets":["bong-meo","xuong-cho"]};
  const fullLoads=new WeakMap();
  function loadAll(section,grid){
    if(fullLoads.has(grid))return fullLoads.get(grid);
    const pages=Number(grid.dataset.chamPages)||1,current=Number(grid.dataset.chamPage)||1;
    const state=$('[data-cham-load-state]',section);
    if(pages<=1)return Promise.resolve();
    if(state){state.hidden=false;state.textContent='Đang tải thêm sản phẩm…';}
    const work=Promise.all(Array.from({length:pages},(_,i)=>i+1).filter(n=>n!==current).map(async n=>{
      const url=new URL(location.href);url.searchParams.set(grid.dataset.chamPageParam||'page',String(n));url.searchParams.set('section_id',grid.dataset.chamSectionId);
      const response=await fetch(url,{credentials:'same-origin'});if(!response.ok)throw Error('catalog page '+n);
      const doc=new DOMParser().parseFromString(await response.text(),'text/html');
      const cards=$$('[data-cham-shop-grid] [data-cham-item]',doc);
      if(!cards.length)throw Error('empty catalog page '+n);
      return [n,cards];
    })).then(pairs=>{
      const all=[...pairs,[current,$$('[data-cham-item]',grid)]].sort((a,b)=>a[0]-b[0]).flatMap(x=>x[1]);
      const unique=[...new Map(all.map(item=>[item.dataset.chamHandle,item])).values()];
      if(unique.length<Number(grid.dataset.chamTotal))throw Error('catalog incomplete');
      const frag=document.createDocumentFragment();unique.forEach(item=>frag.append(item));grid.replaceChildren(frag);
      originalOrder.delete(grid);delete grid.dataset.chamSort;grid.dataset.chamPages='1';grid.dataset.chamAllLoaded='true';
      const pagination=$('.cham-shop-page__pagination',section);if(pagination)pagination.hidden=true;
      if(state)state.hidden=true;
      document.dispatchEvent(new CustomEvent('cham:catalog-loaded'));
    }).catch(()=>{
      fullLoads.delete(grid);
      if(state){state.hidden=false;state.textContent='Chưa tải được toàn bộ danh mục. Kết quả tạm thời chỉ gồm trang hiện tại.';}
      throw Error('catalog load failed');
    });
    fullLoads.set(grid,work);return work;
  }
  function updateFilters(section,skipLoad=false){
    const grid=$('[data-cham-shop-grid]',section);if(!grid)return;
    let items=$$('[data-cham-item]',grid);
    if(!originalOrder.has(grid))originalOrder.set(grid,new Map(items.map((item,index)=>[item,index])));
    const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase();
    const lookup=norm($('[data-cham-filter-search]',section)?.value).trim();
    const use=section.dataset.chamActiveUse||'all';
    const range=String($('[data-cham-filter-price]',section)?.value||'all');
    const sort=String($('[data-cham-filter-sort]',section)?.value||'featured');
    const filtering=Boolean(lookup)||use!=='all'||range!=='all'||sort!=='featured';
    if(!skipLoad&&filtering&&Number(grid.dataset.chamPages)>1){
      loadAll(section,grid).then(()=>updateFilters(section,true)).catch(()=>updateFilters(section,true));return;
    }
    const [min,max]=range==='all'?[0,Number.POSITIVE_INFINITY]:range.split('-').map(Number);
    const visible=items.filter(item=>{
      const price=Number(item.dataset.chamPrice)||0;
      const matched=norm(item.dataset.chamTitle).includes(lookup) && price>=min && price<=max && (use==='all'||useGroups[use]?.includes(item.dataset.chamHandle)||String(item.dataset.chamTags||'').split(',').includes('use-'+use));
      item.hidden=!matched;
      return matched;
    });
    const original=originalOrder.get(grid);
    items.sort((a,b)=>{
      if(sort==='low')return Number(a.dataset.chamPrice)-Number(b.dataset.chamPrice);
      if(sort==='high')return Number(b.dataset.chamPrice)-Number(a.dataset.chamPrice);
      if(sort==='name')return String(a.dataset.chamTitle).localeCompare(String(b.dataset.chamTitle),'vi');
      return original.get(a)-original.get(b);
    });
    if(grid.dataset.chamSort!==sort){items.forEach(item=>grid.append(item));grid.dataset.chamSort=sort;}
    const no=$('[data-cham-no-matches]',section);
    if(no)no.hidden=visible.length>0;
    const count=$('[data-cham-live-count]',section);
    if(count)count.textContent=(!filtering&&Number(grid.dataset.chamPages)>1?Number(grid.dataset.chamTotal):visible.length)+' sản phẩm';
  }
  const shop=$('[data-cham-shop]');
  if(shop){
    shop.addEventListener('click',e=>{const b=e.target.closest('[data-cham-use]');if(!b)return;shop.dataset.chamActiveUse=b.dataset.chamUse;$$('[data-cham-use]',shop).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));updateFilters(shop);});
    $$('select[data-cham-filter-price],select[data-cham-filter-sort]',shop).forEach(select=>{
      const menu=document.createElement('details');menu.className='cham-filter-menu';
      const summary=document.createElement('summary');const value=document.createElement('span');summary.append(value);menu.append(summary);
      const list=document.createElement('div');list.className='cham-filter-menu__list';menu.append(list);
      const sync=()=>{value.textContent=select.selectedOptions[0]?.textContent||'';$$('button',list).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===select.value)));};
      [...select.options].forEach(opt=>{const b=document.createElement('button');b.type='button';b.dataset.value=opt.value;b.textContent=opt.textContent;b.addEventListener('click',()=>{select.value=opt.value;select.dispatchEvent(new Event('change',{bubbles:true}));menu.open=false;summary.focus();});list.append(b);});
      select.after(menu);select.hidden=true;select.addEventListener('change',sync);sync();
      menu.addEventListener('toggle',()=>{if(menu.open)$$('.cham-filter-menu[open]',shop).forEach(other=>{if(other!==menu)other.open=false;});});
      menu.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;summary.focus();}});
      document.addEventListener('click',e=>{if(!menu.contains(e.target))menu.open=false;});
    });
    shop.addEventListener('input',e=>{if(e.target.matches('[data-cham-filter-search]'))updateFilters(shop);});
    shop.addEventListener('change',e=>{if(e.target.matches('[data-cham-filter-price],[data-cham-filter-sort]'))updateFilters(shop);});
    const preset=new URLSearchParams(location.search).get('cham_price');
    const priceSelect=$('[data-cham-filter-price]',shop);if(preset&&priceSelect&&[...priceSelect.options].some(o=>o.value===preset)){priceSelect.value=preset;priceSelect.dispatchEvent(new Event('change',{bubbles:true}));}
    else updateFilters(shop);
  }
  const animated=$$('[data-cham-scroll] .cham-section-head, [data-cham-scroll] .cham-home-club__copy, [data-cham-scroll] .cham-home-about__inner, [data-cham-scroll] .cham-craft-categories__head, [data-cham-scroll] .cham-craft-tile, [data-cham-scroll] .cham-catalog__heading, [data-cham-scroll] .cham-catalog__body, [data-cham-scroll] .cham-about-v3__intro, [data-cham-scroll] .cham-about-v3__statement-grid, [data-cham-scroll] .cham-about-v3__editorial-copy');
  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(!prefersReduced.matches && 'IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        observer.unobserve(entry.target);
        entry.target.animate([{opacity:.65,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:430,easing:'cubic-bezier(.2,.8,.2,1)'});
      });
    },{rootMargin:'0px 0px -24px 0px',threshold:0.08});
    animated.forEach(element=>observer.observe(element));
  }
})();