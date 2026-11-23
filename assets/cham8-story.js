/* CHẠM 8.0 | six scenes, six visual rhythms.
 * Images always remain visible without JS or when reduced motion is requested.
 */
(() => {
  'use strict';
  const root=document.querySelector('#cham5-process');
  if(!root)return;
  const stages=[...root.querySelectorAll('.cham8-scene')];
  const figures=[...root.querySelectorAll('[data-cham8-reveal]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const wide=matchMedia('(min-width: 1024px) and (pointer: fine)');
  if(reduced.matches || !('IntersectionObserver' in window))return;

  const clamp=n=>Math.max(0,Math.min(1,n));
  const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
  const mask=(direction,p)=>{
    const d=100-ease(p)*100;
    if(direction==='left')return `inset(0% 0% 0% ${d.toFixed(2)}%)`;
    if(direction==='right')return `inset(0% ${d.toFixed(2)}% 0% 0%)`;
    if(direction==='iris')return `circle(${(ease(p)*83).toFixed(2)}% at 50% 50%)`;
    return `inset(${d.toFixed(2)}% 0% 0% 0%)`;
  };
  const ready=new WeakSet();
  const loaded=new WeakSet();
  const pairs=figures.map(figure=>{
    const image=figure.querySelector('img');
    const direction=figure.dataset.cham8Reveal;
    const delay=parseFloat(figure.dataset.cham8Delay||'0')||0;
    return {figure,image,direction,delay};
  });
  const draw=(pair,p)=>{
    if(!ready.has(pair.figure))return;
    pair.figure.style.clipPath=mask(pair.direction,p);
    if(pair.image){
      const t=ease(p);
      pair.image.style.transform=`scale(${(1.085-.085*t).toFixed(4)})`;
    }
  };
  const markReady=pair=>{
    const {figure,image}=pair;
    if(ready.has(figure))return;
    if(image && !(image.complete&&image.naturalWidth>0)){
      if(loaded.has(figure))return;
      loaded.add(figure);
      const done=()=>{ready.add(figure);draw(pair,0);window.ScrollTrigger?.update()};
      if(image.decode)image.decode().then(done,done);
      else {image.addEventListener('load',done,{once:true});image.addEventListener('error',done,{once:true});}
      return;
    }
    ready.add(figure);
    draw(pair,0);
  };
  root.classList.add('cham8-motion-enabled');

  const pin=window.ScrollTrigger?.getById('cham-horizontal-craft')||null;
  if(pin&&pin.animation){
    pairs.forEach(pair=>{
      markReady(pair);
      pair.figure.style.transition='none';
      window.ScrollTrigger.create({
        trigger:pair.figure,
        containerAnimation:pin.animation,
        start:pair.figure.classList.contains('cham8-surface__two')?'left 160%':'left 95%',end:'left 26%',
        invalidateOnRefresh:true,
        onUpdate:self=>{
          const progress=clamp((self.progress-pair.delay)/(1-pair.delay));
          draw(pair,progress);
        },
        onEnter:()=>markReady(pair),
        onEnterBack:()=>markReady(pair)
      });
    });
    stages.forEach((stage,index)=>{
      const text=stage.querySelector('.cham8-scene__copy,.cham8-hands__narrative,.cham8-precision__text,.cham8-surface__copy,.cham8-fire__copy,.cham8-life__copy');
      if(!text)return;
      window.ScrollTrigger.create({
        trigger:stage,
        containerAnimation:pin.animation,
        start:'left right',
        end:'left 34%',
        invalidateOnRefresh:true,
        onUpdate:self=>{
          const p=ease(self.progress);
          text.style.transform=`translate3d(${(1-p)*(index%2?-21:22)}px,0,0)`;
          text.style.opacity=String(.68+.32*p);
        }
      });
    });
    requestAnimationFrame(()=>window.ScrollTrigger.refresh());
  } else {
    pairs.forEach(pair=>{
      markReady(pair);
      pair.figure.style.transition='clip-path 910ms cubic-bezier(.18,.8,.21,1)';
      if(pair.image)pair.image.style.transition='transform 1150ms cubic-bezier(.18,.8,.21,1)';
    });
    // Observe the chapter, NOT a masked image: a fully clipped image has no
    // visible intersection, otherwise the reveal can deadlock on mobile.
    const obs=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        const stage=entry.target;
        const within=pairs.filter(pair=>stage.contains(pair.figure));
        within.forEach(pair=>{
          if(pair.image)pair.image.loading='eager';
          markReady(pair);
          let attempts=0;
          const reveal=()=>{
            if(!ready.has(pair.figure)){
              if(++attempts<65)setTimeout(reveal,85);
              else {pair.figure.style.clipPath='none';}
              return;
            }
            const delay=Math.min(320,Math.round(pair.delay*1000));
            requestAnimationFrame(()=>setTimeout(()=>draw(pair,1),delay));
          };
          reveal();
        });
        obs.unobserve(stage);
      }
    },{rootMargin:'220px 0px 170px 0px',threshold:0});
    stages.forEach(stage=>obs.observe(stage));
  }
})();
