(() => {
  'use strict';
  const $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const hero=document.querySelector('[data-cham-hero]');
  if(hero){
    const photo=hero.querySelector('.cham-hero__featured-img');
    const caption=hero.querySelector('[data-cham-hero-photo-label]');
    const link=hero.querySelector('[data-cham-hero-photo-link]');
    const controls=$$('[data-cham-hero-picker]',hero);
    if(controls[0]){controls[0].classList.add('is-active');controls[0].setAttribute('aria-pressed','true');}
    hero.addEventListener('click',event=>{
      const button=event.target.closest('[data-cham-hero-picker]');
      if(!button||!photo)return;
      const src=button.dataset.url||'';
      if(!src)return;
      photo.src=src;photo.removeAttribute('srcset');
      photo.alt=button.dataset.label||'Sản phẩm CHẠM';
      if(caption)caption.textContent=button.dataset.label||'Khám phá sản phẩm';
      if(link)link.href=button.dataset.href||'/collections/all';
      controls.forEach(el=>{const active=el===button;el.classList.toggle('is-active',active);el.setAttribute('aria-pressed',String(active));});
    });
  }
  const catalog=document.querySelector('[data-cham-catalog]');
  if(catalog){
    const buttons=$$('[data-catalog-select]',catalog),panels=$$('[data-catalog-panel]',catalog);
    catalog.addEventListener('click',event=>{
      const button=event.target.closest('[data-catalog-select]');
      if(!button)return;
      const id=button.dataset.catalogSelect;
      buttons.forEach(el=>{const current=el===button;el.classList.toggle('is-selected',current);el.setAttribute('aria-pressed',String(current));});
      panels.forEach(panel=>{panel.hidden=(panel.dataset.catalogPanel!==id);});
    });
  }
})();
