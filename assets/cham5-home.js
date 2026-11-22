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
const steps=track?$$('.cham5-process__panel',track):[];
const hero=$('.cham6-hero',root);
const watch=$('.cham6-watch',root);
const watchStage=$('[data-cham6-watch-stage]',watch||document);
const watchImage=$('[data-cham6-watch-image]',watch||document);
const watchOverlay=$('[data-cham6-watch-overlay]',watch||document);
const header=$('#header-group');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const fine=window.matchMedia('(min-width: 1024px) and (pointer: fine)');
const desktop=()=>fine.matches&&!reduced.matches;
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
mm.add('(min-width:1024px) and (pointer:fine) and (prefers-reduced-motion:no-preference)',()=>{
 startLenis();
 if(!track||!pin||!viewport||steps.length<2)return ()=>stopLenis();
 const distance=()=>Math.max(0,track.scrollWidth-viewport.clientWidth);
 process.classList.add('is-enhanced');
 const context=gsap.context(()=>{
  if(hero){
    gsap.to($('.cham6-hero__title',hero),{y:-66,scale:.96,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.75}});
    $$('.cham6-hero__print',hero).forEach((el,i)=>{
      gsap.to(el,{y:(i%2===0?-37:24),ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.9}});
    });
  }
  if(watch&&watchStage&&watchImage&&watchOverlay){
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
    gsap.to(track,{
      x:()=>-distance(),ease:'none',
      scrollTrigger:{
        id:'cham-horizontal-craft',
        trigger:pin,
        start:()=> 'top top+='+headerHeight(),
        end:()=>'+='+distance(),
        scrub:.42,
        pin:true,
        pinSpacing:true,
        anticipatePin:1,
        invalidateOnRefresh:true,
        onUpdate:self=>{
          if(progress)progress.style.transform='scaleX('+Math.max(.005,self.progress).toFixed(4)+')';
          const number=Math.max(1,Math.min(steps.length,Math.floor(self.progress*(steps.length-1)+.48)+1));
          if(counter)counter.textContent=String(number);
        }
      }
    });
  }
 },root);
 requestAnimationFrame(()=>ScrollTrigger.refresh());
 return()=>{
  context.revert();process.classList.remove('is-enhanced');
  track.style.removeProperty('transform');if(progress)progress.style.transform='scaleX(.005)';
  if(counter)counter.textContent='1';stopLenis();
 };
});
const refresh=()=>{if(!desktop())return;cancelAnimationFrame(refreshRAF);refreshRAF=requestAnimationFrame(()=>{measure();ScrollTrigger.refresh();});};
window.addEventListener('load',refresh,{once:true});
document.fonts?.ready.then(refresh).catch(()=>{});
if(header&&'ResizeObserver'in window)new ResizeObserver(refresh).observe(header);
window.addEventListener('orientationchange',refresh,{passive:true});
})();
