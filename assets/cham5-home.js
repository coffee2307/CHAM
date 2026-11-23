/* CHẠM – cinematic editorial landing, only on the homepage.
   Design fallback: no JS => intact content; mobile => native vertical story;
   reduced-motion => static picture and all captions remain readable. */
(()=>{'use strict';
const root=document.querySelector('[data-cham5-root]');
if(!root)return;
const $=(s,p=document)=>p.querySelector(s);
const $$=(s,p=document)=>Array.from(p.querySelectorAll(s));
const process=$('#cham5-process');
const pin=$('[data-cham5-process-pin]',process||document);
const viewport=$('[data-cham5-process-viewport]',process||document);
const track=$('[data-cham5-process-track]',process||document);
const progress=$('[data-cham5-process-progress]',process||document);
const counter=$('[data-cham5-step-counter]',process||document);
const steps=track?$$('.cham8-scene',track):[];
const hero=$('.cham6-hero',root);
const watch=$('.cham6-watch',root);
const watchStage=$('[data-cham6-watch-stage]',watch||document);
const watchImage=$('[data-cham6-watch-image]',watch||document);
const watchOverlay=$('[data-cham6-watch-overlay]',watch||document);
const header=$('#header-group');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const desktop=()=>window.innerWidth>=1024&&!reduced.matches;
const headerHeight=()=>Math.round(Math.max(48,Math.min(150,header?.getBoundingClientRect().height||64)));
const measure=()=>document.documentElement.style.setProperty('--cham5-header',headerHeight()+'px');
measure();
/* Progressive, nonblocking image reveal: only start decoding when near the viewport. */
function revealImages(){
 const images=$$('.cham6-hero__print img,.cham6-watch__image img,.cham5-process__photo img,.cham5-bridge__images img,.cham5-category__image img,.cham5-product__image img');
 const visible=img=>{
   if(img.dataset.cham6Seen)return;
   img.dataset.cham6Seen='1';
   const done=()=>img.classList.add('cham6-loaded');
   if(img.complete&&img.naturalWidth>0){done();return;}
   if(typeof img.decode==='function')img.decode().then(done).catch(done);
   else{img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});}
 };
 root.classList.add('cham6-images-enabled');
 images.forEach(img=>img.classList.add('cham6-photo-pending'));
 if(!('IntersectionObserver'in window)){images.forEach(visible);return;}
 const io=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{if(entry.isIntersecting){visible(entry.target);io.unobserve(entry.target);}});
 },{rootMargin:'320px 0px'});
 images.forEach(img=>{if(img.complete&&img.naturalWidth>0)visible(img);else io.observe(img);});
}
revealImages();
if(!window.gsap||!window.ScrollTrigger)return;
const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
let lenis=null,ticker=null,refreshRAF=0;
function stopLenis(){
 if(ticker){gsap.ticker.remove(ticker);ticker=null;}
 if(lenis){lenis.destroy();lenis=null;}
 document.documentElement.classList.remove('cham5-lenis');
}
function startLenis(){
 if(!desktop()||!window.Lenis||lenis)return;
 if(window.__chamLenis||document.documentElement.classList.contains('lenis'))return;
 if(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<6)return;
 try{
   lenis=new window.Lenis({lerp:.105,smoothWheel:true,syncTouch:false,anchors:true});
   lenis.on('scroll',ScrollTrigger.update);
   ticker=t=>lenis?.raf(t*1000);
   gsap.ticker.add(ticker);
   gsap.ticker.lagSmoothing(0);
   document.documentElement.classList.add('cham5-lenis');
 }catch(e){stopLenis();}
}
const mm=gsap.matchMedia();
const setupScroll=()=>{
 // Use native scrolling for consistent pinning, especially when entering on touch devices.
 if(!track||!pin||!viewport||steps.length<2)return ()=>stopLenis();
 if(window.innerWidth<768 && window.innerHeight<630)return ()=>stopLenis();
 const distance=()=>Math.max(0,track.scrollWidth-viewport.clientWidth);
 process.classList.add('is-enhanced');
 let mobileCleanup=null;
 const context=gsap.context(()=>{
  if(hero){
    gsap.to($('.cham6-hero__title',hero),{y:-66,scale:.96,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.75}});
    $$('.cham6-hero__print',hero).forEach((el,i)=>{
      gsap.to(el,{y:(i%2===0?-37:24),ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.9}});
    });
  }
  if(window.innerWidth>=1024 && watch&&watchStage&&watchImage&&watchOverlay){
    const tl=gsap.timeline({scrollTrigger:{
      id:'cham-focus-photo',
      trigger:watch,
      start:()=> 'top top+='+headerHeight(),
      end:()=>'+='+Math.round(Math.max(520,window.innerHeight*.85)),
      pin:watchStage,
      scrub:.75,
      invalidateOnRefresh:true,
      anticipatePin:1
    }});
    tl.fromTo(watchImage,{clipPath:'inset(36% 22% 8% 22% round 3px)'},{clipPath:'inset(0% 0% 0% 0% round 0px)',ease:'none',duration:1},0);
    tl.to($('.cham6-watch__intro',watch),{y:-70,opacity:0,ease:'none',duration:.56},.07);
    tl.fromTo(watchOverlay,{opacity:0},{opacity:1,ease:'none',duration:.24},.70);
  }
  if(distance()>0){
    const onUpdate=self=>{
      if(progress)progress.style.transform='scaleX('+Math.max(.005,self.progress).toFixed(4)+')';
      const number=Math.max(1,Math.min(steps.length,Math.floor(self.progress*(steps.length-1)+.48)+1));
      if(counter)counter.textContent=String(number);
      steps.forEach((panel,index)=>panel.classList.toggle('cham8-scene--active',index===number-1));
    };
    // Entire viewport range: the browser owns the vertical scroll and sticky
    // placement. No ScrollTrigger.pin, refresh-induced height writes or scrub
    // easing at the exact boundary between vertical and horizontal movement.
    process.classList.add('is-native-sticky');
    let width=window.innerWidth, height=window.innerHeight, span=0, tick=0, disposed=false;
    const measureNative=()=>{
      span=Math.max(0,track.scrollWidth-viewport.clientWidth);
      const fixedHeight=Math.ceil(pin.offsetHeight+span);
      if(process.style.height!==fixedHeight+'px')
        process.style.height=fixedHeight+'px';
    };
    const renderNative=()=>{
      tick=0;
      if(disposed)return;
      const distanceTraveled=Math.max(0,Math.min(span,-process.getBoundingClientRect().top));
      const p=span?distanceTraveled/span:0;
      track.style.transform='translate3d('+(-distanceTraveled).toFixed(2)+'px,0,0)';
      onUpdate({progress:p});
    };
    const queueNative=()=>{if(!tick&&!disposed)tick=requestAnimationFrame(renderNative);};
    const onViewportResize=()=>{
      // Ignore mobile URL-bar height changes; a desktop window resize is real.
      const nextWidth=window.innerWidth,nextHeight=window.innerHeight;
      if(Math.abs(nextWidth-width)>=3 || (nextWidth>=768&&Math.abs(nextHeight-height)>=3)){
        width=nextWidth;height=nextHeight;
        measureNative();
      }
      queueNative();
    };
    measureNative();
    queueNative();
    window.addEventListener('scroll',queueNative,{passive:true});
    window.addEventListener('resize',onViewportResize,{passive:true});
    mobileCleanup=()=>{
      disposed=true;
      if(tick)cancelAnimationFrame(tick);
      window.removeEventListener('scroll',queueNative);
      window.removeEventListener('resize',onViewportResize);
    };

  }
 },root);
 if(window.innerWidth>=768)requestAnimationFrame(()=>ScrollTrigger.refresh());
 return()=>{
  if(mobileCleanup)mobileCleanup();
  context.revert();process.classList.remove('is-enhanced','is-native-sticky');process.style.removeProperty('height');
  track.style.removeProperty('transform');if(progress)progress.style.transform='scaleX(.005)';
  if(counter)counter.textContent='1';stopLenis();
 };
};
mm.add('(max-width:767px) and (prefers-reduced-motion:no-preference)',setupScroll);
mm.add('(min-width:768px) and (prefers-reduced-motion:no-preference)',setupScroll);
const refresh=()=>{if(window.innerWidth<768)return;cancelAnimationFrame(refreshRAF);refreshRAF=requestAnimationFrame(()=>{measure();ScrollTrigger.refresh();});};
window.addEventListener('load',refresh,{once:true});
document.fonts?.ready.then(refresh).catch(()=>{});
if(window.innerWidth>=768&&header&&'ResizeObserver'in window)new ResizeObserver(refresh).observe(header);
window.addEventListener('orientationchange',refresh,{passive:true});
})();

/* CHẠM – motion direction for the rest of the editorial journey.
   One progress-led visual action per chapter, with full static fallback. */
(()=>{'use strict';
if(!document.querySelector('.cham5-home')&&!document.body.classList.contains('cham5-home'))return;
if(!window.gsap||!window.ScrollTrigger)return;
const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
const mm=gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)',()=>{
 const ctx=gsap.context(()=>{
  const scroll=(trigger,start='top 84%',end='top 40%')=>({
    trigger,start,end,scrub:.85,invalidateOnRefresh:true
  });
  // Titles read as a paced sequence of editorial chapters, not repeated fade-ins.
  const chapters=[
   ['.cham5-thesis__inner h2','.cham5-thesis','top 85%','top 30%',42],
   ['.cham5-process__heading h2','.cham5-process__heading','top 88%','top 39%',35],
   ['.cham5-bridge__text h2','.cham5-bridge','top 82%','top 38%',42],
   ['.cham5-categories .cham5-market__heading h2','.cham5-categories','top 84%','top 48%',32],
   ['.cham5-products .cham5-market__heading h2','.cham5-products','top 85%','top 47%',32],
   ['.cham5-end__main h2','.cham5-end','top 90%','top 40%',62]
  ];
  for(const [selector,section,start,end,y] of chapters){
   const el=document.querySelector(selector),trigger=document.querySelector(section);
   if(!el||!trigger)continue;
   gsap.fromTo(el,{y,opacity:.82},{
     y:0,opacity:1,ease:'none',
     immediateRender:false,
     scrollTrigger:scroll(trigger,start,end)
   });
  }
  // Supporting copy follows the headline only when it becomes relevant.
  for(const [selector,section] of [
   ['.cham5-thesis__inner>p:last-child','.cham5-thesis'],
   ['.cham5-bridge__text>p:last-child','.cham5-bridge'],
   ['.cham5-end__sub','.cham5-end']
  ]){
   const el=document.querySelector(selector),trigger=document.querySelector(section);
   if(!el||!trigger)continue;
   gsap.fromTo(el,{y:20,opacity:.70},{
     y:0,opacity:1,ease:'none',immediateRender:false,
     scrollTrigger:scroll(trigger,'top 73%','top 25%')
   });
  }
  // During the material chapter, photos move in different directions while
  // the middle reading column stays still and readable.
  const bridge=document.querySelector('.cham5-bridge');
  const wider=window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
  if(bridge&&wider){
   const left=bridge.querySelector('.cham5-bridge__large');
   const right=bridge.querySelector('.cham5-bridge__small');
   if(left)gsap.fromTo(left,{y:-55},{
     y:45,ease:'none',immediateRender:false,
     scrollTrigger:scroll(bridge,'top 95%','bottom 3%')
   });
   if(right)gsap.fromTo(right,{y:65},{
     y:-45,ease:'none',immediateRender:false,
     scrollTrigger:scroll(bridge,'top 95%','bottom 3%')
   });
   // Directional image unveiling: photographs emerge as the visitor approaches
   // the material rather than simply fading in as ordinary cards.
   for(const [photo,first] of [[left,'inset(0% 0% 20% 0%)'],[right,'inset(0% 0% 30% 0%)']]){
     if(!photo)continue;
     gsap.fromTo(photo,{clipPath:first},{
       clipPath:'inset(0% 0% 0% 0%)',ease:'none',immediateRender:false,
       scrollTrigger:scroll(bridge,'top 96%','top 28%')
     });
   }
  }
  // Let product photography reveal the catalog; do not animate interactive
  // cards while users are actively trying to select a product.
  for(const [containerSelector,itemSelector,start,end,shift] of [
   ['.cham5-categories__grid','.cham5-category','top 91%','top 43%',38],
   ['.cham5-products__grid','.cham5-product','top 92%','top 39%',34],
   ['.cham5-further','.cham5-further a','top 86%','top 32%',17]
  ]){
   const container=document.querySelector(containerSelector);
   if(!container)continue;
   const items=[...container.querySelectorAll(itemSelector)];
   if(!items.length)continue;
   gsap.fromTo(items,{y:shift,opacity:.80},{
     y:0,opacity:1,stagger:.13,ease:'none',immediateRender:false,
     scrollTrigger:scroll(container,start,end)
   });
   // A shallow photo mask follows the same chapter progress. Interactive cards
   // remain in place; only the images are uncovered as the layout enters view.
   if(itemSelector!=='.cham5-further a'){
     const photoFrames=items.map(x=>x.querySelector('.cham5-category__image,.cham5-product__image')).filter(Boolean);
     gsap.fromTo(photoFrames,{clipPath:'inset(0% 0% 13% 0%)'},{
       clipPath:'inset(0% 0% 0% 0%)',ease:'none',stagger:.13,
       immediateRender:false,scrollTrigger:scroll(container,start,end)
     });
   }
  }
  // Closing exhibition panel gradually darkens as the visitor reaches it.
  const ending=document.querySelector('.cham5-end');
  if(ending){
   gsap.fromTo(ending,{backgroundColor:'#27221e'},{
     backgroundColor:'#0b0b0c',ease:'none',immediateRender:false,
     scrollTrigger:scroll(ending,'top 96%','top 22%')
   });
  }
 },document.body);
 requestAnimationFrame(()=>ScrollTrigger.refresh());
 return()=>ctx.revert();
});
})();
