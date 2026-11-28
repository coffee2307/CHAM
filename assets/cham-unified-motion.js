/* CHẠM — reversible scroll cues shared by non-home pages.
   No scroll locking, pinning, resize-driven section-height changes or reveal gates. */
(()=>{
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if(reduced.matches)return;
  const isHome=document.body.classList.contains('cham5-home');
  // Home has its own scroll clock. Touch layouts avoid per-frame reveal writes.
  if(isHome||matchMedia('(pointer: coarse)').matches)return;
  const isPlay=document.body.classList.contains('cham-play-mode');
  const selector=isPlay?
    '.cp-hub .cp-hero__copy,.cp-hub .cp-section-head,.cp-hub .cp-foot':
    isHome?
    '.cham5-market__heading,.cham5-bridge__copy':
    [
      '.cham-about-report__section-heading',
      '.cham-about-report__prototypes',
      '.cham-about-report__features',
      '.cham-about-report__ethics-copy',
      '.cham-story-v4__section-head',
      '.cham-story-v4__story-card',
      '.cham-story-v4__play-copy',
      '.cham-section-head',
      '.cham-category-photo-card',
      '.cham-editorial-hero__copy',
      '.cham-product-context__item',
      '.cham-product-page__info',
      '.cc-shell .cc-lead',
      '.cd-shell .cd-lead'
    ].join(',');
  let elements=[],pending=false,active=true;
  function capture(){
    elements=Array.from(document.querySelectorAll(selector))
      .filter(el=>!el.closest('[hidden]')&&!el.hasAttribute('data-cham-motion-item'))
      .slice(0,80);
    for(const el of elements)el.setAttribute('data-cham-motion-item','');
    update();
  }
  const clamp=n=>Math.max(0,Math.min(1,n));
  function update(){
    pending=false;
    if(!active||document.hidden||document.documentElement.classList.contains('cham-chat-lock'))return;
    const h=window.innerHeight||800;
    for(const el of elements){
      if(!el.isConnected)continue;
      const r=el.getBoundingClientRect();
      // When element is well offscreen, no visual write is required.
      const p=clamp((h*.87-r.top)/(h*.50));
      const prev=Number(el.dataset.chamMotionValue||'-1');
      if(Math.abs(p-prev)<.012)continue;
      el.dataset.chamMotionValue=String(p);
      el.style.setProperty('--cham-motion-progress',p.toFixed(3));
    }
  }
  const schedule=()=>{
    if(!pending){pending=true;requestAnimationFrame(update);}
  };
  const reset=()=>{
    active=!reduced.matches;
    if(!active){
      elements.forEach(el=>{
        el.removeAttribute('data-cham-motion-item');
        el.style.removeProperty('--cham-motion-progress');
        delete el.dataset.chamMotionValue;
      });
      elements=[];
    }else capture();
  };
  if(reduced.addEventListener)reduced.addEventListener('change',reset);
  // CHẠM Play mounts after deferred scripts; refresh the shared candidates when its hub appears.
  document.addEventListener('cham:play-rendered',()=>{
    elements.forEach(el=>{el.removeAttribute('data-cham-motion-item');el.style.removeProperty('--cham-motion-progress');});
    elements=[];capture();
  });
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',capture,{once:true});
  else capture();
})();