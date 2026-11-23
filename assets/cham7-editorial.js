/* CHẠM 7 — image-mask choreography for desktop horizontal scroll and mobile chapters. */
(() => {
  'use strict';
  const section=document.querySelector('#cham5-process');
  if(!section)return;
  const panels=Array.from(section.querySelectorAll('.cham5-process__panel'));
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  if(reduce.matches||!('IntersectionObserver' in window))return;
  const prepared=new WeakSet();
  const visible=panel=>{
    if(prepared.has(panel))return;
    prepared.add(panel);
    const main=panel.querySelector('.cham5-process__photo img');
    const reveal=()=>panel.classList.add('is-revealed');
    if(!main||main.complete){reveal();return;}
    if(main.decode)main.decode().then(reveal,reveal);
    else{main.addEventListener('load',reveal,{once:true});main.addEventListener('error',reveal,{once:true});}
  };
  section.classList.add('cham7-process-animated');
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      visible(entry.target);
      observer.unobserve(entry.target);
    });
  },{threshold:.12,rootMargin:'0px 0px -5% 0px'});
  panels.forEach(panel=>observer.observe(panel));
  /* For the pinned horizontal gallery the large image follows the scroll
     position; supporting photos reveal with a deliberately delayed cadence. */
  const ST=window.ScrollTrigger;
  const pointer=matchMedia('(min-width:1024px) and (pointer:fine)');
  const pinned=ST&&pointer.matches&&ST.getById('cham-horizontal-craft');
  if(!pinned||!pinned.animation)return;
  section.classList.add('cham7-process-scrubbed');
  for(const panel of panels){
    const photo=panel.querySelector(':scope > .cham5-process__photo');
    if(!photo)continue;
    photo.style.transition='none';
    ST.create({
      trigger:panel,containerAnimation:pinned.animation,
      start:'left 92%',end:'left 18%',
      invalidateOnRefresh:true,
      onUpdate:self=>{
        const value=Math.max(0,Math.min(1,self.progress));
        photo.style.clipPath='inset(0 0 '+((1-value)*100).toFixed(2)+'% 0)';
      }
    });
  }
})();