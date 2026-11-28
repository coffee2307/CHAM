/* CHẠM: reversible craft reveals, one progress clock shared with native sticky.
   No pinning, scroll listener, layout writes, or one-way IntersectionObserver. */
(()=>{'use strict';
  const root=document.querySelector('#cham5-process');
  if(!root)return;
  const track=root.querySelector('[data-cham5-process-track]');
  const viewport=root.querySelector('[data-cham5-process-viewport]');
  const stages=[...root.querySelectorAll('.cham8-scene')];
  if(!track||!viewport||stages.length<2)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=window.matchMedia('(max-width: 767px)');
  const clamp=n=>Math.max(0,Math.min(1,n));
  const ease=n=>{const t=clamp(n);return t*t*(3-2*t);};
  const pairs=stages.flatMap((stage,index)=>
    [...stage.querySelectorAll('[data-cham8-reveal]')].map(figure=>({
      index,figure,image:figure.querySelector('img'),
      direction:figure.getAttribute('data-cham8-reveal')||'bottom',
      delay:Math.max(0,Math.min(.4,Number.parseFloat(figure.getAttribute('data-cham8-delay')||'0')||0))
    }))
  );
  const enabled=()=>!reduced.matches&&!mobile.matches;
  let lastProgress=0;
  function mask(direction,p,small){
    const t=ease(p);
    const d=(1-t)*(small?17:86);
    const size=d.toFixed(2)+'%';
    if(direction==='left')return 'inset(0% 0% 0% '+size+')';
    if(direction==='right')return 'inset(0% '+size+' 0% 0%)';
    if(direction==='iris')return 'circle('+(small?72+11*t:18+66*t).toFixed(2)+'% at 50% 50%)';
    return 'inset('+size+' 0% 0% 0%)';
  }
  function reset(){
    root.classList.remove('cham13-reversible');
    pairs.forEach(pair=>{
      pair.lastLocal=NaN;
      pair.lastSmall=null;
      pair.figure.style.removeProperty('clip-path');
      if(pair.image)pair.image.style.removeProperty('transform');
    });
  }
  function draw(progress){
    lastProgress=clamp(progress);
    if(!enabled()){if(root.classList.contains('cham13-reversible'))reset();return;}
    root.classList.add('cham13-reversible');
    const position=lastProgress*(stages.length-1);
    const small=mobile.matches;
    for(const pair of pairs){
      const {index,figure,image,delay,direction}=pair;
      if(image && !(image.complete&&image.naturalWidth>0)){
        // Keep the image visible while loading; never reveal a blank frame.
        figure.style.removeProperty('clip-path');
        continue;
      }
      const local=index===0?1:clamp((position-(index-1)-delay*.18)/.83);
      // Avoid repainting figures when their reveal state has not changed.
      if(pair.lastSmall===small&&Math.abs((pair.lastLocal??NaN)-local)<.002)continue;
      pair.lastLocal=local;
      pair.lastSmall=small;
      figure.style.clipPath=mask(direction,local,small);
      if(image)image.style.transform='scale('+(1+(small?.024:.065)*(1-ease(local))).toFixed(4)+')';
    }
  }
  // Called from the existing single rAF that maps native scrollY to track X.
  window.__chamCraftFrame=draw;
  const sync=()=>{
    const distance=Math.max(0,track.scrollWidth-viewport.clientWidth);
    draw(distance?clamp(-root.getBoundingClientRect().top/distance):0);
  };
  for(const {image} of pairs){
    if(!image)continue;
    image.addEventListener('load',sync,{once:true});
    image.addEventListener('error',sync,{once:true});
  }
  if(reduced.addEventListener)reduced.addEventListener('change',sync);
  if(mobile.addEventListener)mobile.addEventListener('change',sync);
  requestAnimationFrame(sync);

  // A quiet and fully reversible hero parallax (independent of story geometry).
  if(window.gsap&&window.ScrollTrigger){
    const hero=document.querySelector('.cham9-hero');
    if(hero){
      const mq=window.gsap.matchMedia();
      mq.add('(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)',()=>{
        const ctx=window.gsap.context(()=>{
          const arts=[...hero.querySelectorAll('.cham9-hero__art')];
          arts.forEach((art,i)=>window.gsap.fromTo(art,{y:0},{
            y:i%2?14:-19,ease:'none',immediateRender:false,
            scrollTrigger:{
              trigger:hero,start:'top top',end:'bottom top',
              scrub:true,invalidateOnRefresh:true
            }
          }));
        },hero);
        return()=>ctx.revert();
      });
    }
  }
})();
