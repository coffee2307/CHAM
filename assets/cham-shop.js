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
  function updateFilters(section){
    const grid=$('[data-cham-shop-grid]',section);if(!grid)return;
    let items=$$('[data-cham-item]',grid);
    if(!originalOrder.has(grid))originalOrder.set(grid,new Map(items.map((item,index)=>[item,index])));
    const lookup=String($('[data-cham-filter-search]',section)?.value||'').trim().toLocaleLowerCase('vi');
    const range=String($('[data-cham-filter-price]',section)?.value||'all');
    const sort=String($('[data-cham-filter-sort]',section)?.value||'featured');
    const [min,max]=range==='all'?[0,Number.POSITIVE_INFINITY]:range.split('-').map(Number);
    const visible=items.filter(item=>{
      const price=Number(item.dataset.chamPrice)||0;
      const matched=String(item.dataset.chamTitle||'').toLocaleLowerCase('vi').includes(lookup) && price>=min && price<=max;
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
    items.forEach(item=>grid.append(item));
    const no=$('[data-cham-no-matches]',section);
    if(no)no.hidden=visible.length>0;
    const count=$('[data-cham-live-count]',section);
    if(count)count.textContent=visible.length+' sản phẩm';
  }
  const shop=$('[data-cham-shop]');
  if(shop){
    shop.addEventListener('input',e=>{if(e.target.matches('[data-cham-filter-search]'))updateFilters(shop);});
    shop.addEventListener('change',e=>{if(e.target.matches('[data-cham-filter-price],[data-cham-filter-sort]'))updateFilters(shop);});
    updateFilters(shop);
  }
  const animated=$$('[data-cham-scroll] .cham-section-head, [data-cham-scroll] .cham-home-club__copy, [data-cham-scroll] .cham-home-about__inner');
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