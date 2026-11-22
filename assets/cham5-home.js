/* CHẠM editorial homepage: one intentional pinned horizontal story.
   GSAP + ScrollTrigger and Lenis are loaded locally for this template only.
   All content remains navigable if the libraries fail to load. */
(()=>{'use strict';
const root=document.querySelector('[data-cham5-root]');
if(!root)return;
const process=document.querySelector('#cham5-process');
const pin=process?.querySelector('[data-cham5-process-pin]');
const viewport=process?.querySelector('[data-cham5-process-viewport]');
const track=process?.querySelector('[data-cham5-process-track]');
const progress=process?.querySelector('[data-cham5-process-progress]');
const counter=process?.querySelector('[data-cham5-step-counter]');
const steps=track?[...track.querySelectorAll('.cham5-process__panel')]:[];
const header=document.getElementById('header-group');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const large=window.matchMedia('(min-width: 1024px)');
const coarse=window.matchMedia('(pointer: coarse)');
const simple=()=>reduced.matches||!large.matches||coarse.matches;
const headerHeight=()=>Math.max(0,Math.min(150,header?.getBoundingClientRect().height||0));
function measure(){document.documentElement.style.setProperty('--cham5-header',headerHeight()+'px')}
measure();
if('ResizeObserver'in window&&header)new ResizeObserver(measure).observe(header);
if(!process||!pin||!viewport||!track||steps.length<2)return;
if(!window.gsap||!window.ScrollTrigger)return;
const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
let lenis=null;
let tickFn=null;
let context=null;
function stopSmooth(){
 if(tickFn){gsap.ticker.remove(tickFn);tickFn=null;}
 if(lenis){lenis.destroy();lenis=null;}
 document.documentElement.classList.remove('cham5-lenis');
}
function startSmooth(){
 if(simple()||!window.Lenis||lenis)return;
 // Avoid competing with an existing scrolling engine.
 if(window.__chamLenis||document.documentElement.classList.contains('lenis'))return;
 try{
   lenis=new window.Lenis({duration:1.06,smoothWheel:true,syncTouch:false,anchors:true});
   lenis.on('scroll',ScrollTrigger.update);
   tickFn=t=>lenis?.raf(t*1000);
   gsap.ticker.add(tickFn);
   gsap.ticker.lagSmoothing(0);
   document.documentElement.classList.add('cham5-lenis');
 }catch(e){stopSmooth();}
}
const mm=gsap.matchMedia();
mm.add({desktop:'(min-width: 1024px) and (prefers-reduced-motion: no-preference) and (pointer: fine)'},({conditions})=>{
 if(!conditions.desktop){return;}
 const distance=()=>Math.max(0,track.scrollWidth-viewport.clientWidth);
 if(!distance())return;
 process.classList.add('is-enhanced');
 startSmooth();
 context=gsap.context(()=>{
   gsap.to(track,{
     x:()=>-distance(),
     ease:'none',
     scrollTrigger:{
       id:'cham-horizontal-craft',
       trigger:pin,
       pin:true,
       start:()=> 'top top+='+headerHeight(),
       end:()=>'+='+distance(),
       scrub:.46,
       invalidateOnRefresh:true,
       anticipatePin:1,
       onUpdate:self=>{
         if(progress)progress.style.transform='scaleX('+Math.max(.004,self.progress).toFixed(4)+')';
         const index=Math.min(steps.length,Math.floor(self.progress*(steps.length-1)+.49)+1);
         if(counter)counter.textContent=String(index);
       }
     }
   });
   gsap.to('.cham5-cover__visual>img',{
     yPercent:-3,scale:1.10,ease:'none',
     scrollTrigger:{trigger:'.cham5-cover',start:'top top',end:'bottom top',scrub:.75}
   });
   gsap.fromTo('.cham5-thesis__inner',{y:30,opacity:.70},{y:0,opacity:1,ease:'none',scrollTrigger:{trigger:'.cham5-thesis',start:'top 85%',end:'top 30%',scrub:.7}});
 },root);
 requestAnimationFrame(()=>ScrollTrigger.refresh());
 return()=>{
   context?.revert();context=null;
   process.classList.remove('is-enhanced');
   track.style.removeProperty('transform');
   if(progress)progress.style.transform='scaleX(.005)';
   if(counter)counter.textContent='1';
   stopSmooth();
 };
});
window.addEventListener('load',()=>{measure();if(!simple())ScrollTrigger.refresh();},{once:true});
document.fonts?.ready.then(()=>{if(!simple())ScrollTrigger.refresh();}).catch(()=>{});
if(header&&'ResizeObserver'in window){
 let frame=0;
 new ResizeObserver(()=>{if(simple())return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>ScrollTrigger.refresh());}).observe(header);
}
})();
