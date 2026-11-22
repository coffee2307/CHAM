/* CHẠM 5.0 — isolated homepage motion. No scroll hijacking, no app dependencies.
   Native RAF scrub keeps page usable if third-party animation CDNs are blocked. */
(() => {
'use strict';
const root=document.querySelector('[data-cham5-root]');
if(!root)return;
const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>Array.from(p.querySelectorAll(s));
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=(a,b,v)=>{const x=clamp((v-a)/(b-a));return x*x*(3-2*x)};
const cover=$('[data-cham5-track="cover"]');
const book=$('[data-cham5-track="storybook"]');
const portal=$('[data-cham5-track="portal"]');
const film=$('[data-cham5-track="film"]');
const gallery=$('[data-cham5-track="gallery"]');
const chapterNodes=$$('[data-cham5-chapter]',book||document);
const matPanels=$$('[data-cham5-material-panel]');
const matTabs=$$('[data-cham5-material-tab]');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const small=window.matchMedia('(max-width: 760px)');
let ticking=false,enabled=true;
function measureHeader(){
 const header=document.getElementById('header-group');
 const height=header?header.getBoundingClientRect().height:60;
 document.documentElement.style.setProperty('--cham5-head',Math.round(Math.max(48,Math.min(140,height)))+'px');
}
function progress(el){
 if(!el)return 0;
 const r=el.getBoundingClientRect();
 const scrolled=-r.top;
 const travel=Math.max(1,r.height-window.innerHeight);
 return clamp(scrolled/travel);
}
function set(el,name,value){el?.style.setProperty(name,value);}
function resetScroll(){
 if(!cover)return;
 const coverStage=$('[data-cham5-stage]',cover);
 coverStage?.style.removeProperty('--cham5-cover-y');
 coverStage?.style.removeProperty('--cham5-cover-scale');
 coverStage?.style.removeProperty('--cham5-cover-opacity');
 coverStage?.style.removeProperty('--cham5-photo-opacity');
 coverStage?.style.removeProperty('--cham5-lower-opacity');
 coverStage?.style.removeProperty('--cham5-ink-a');
 coverStage?.style.removeProperty('--cham5-ink-b');
 coverStage?.style.removeProperty('--cham5-ink-c');
 if(book){set(book,'--cham5-rail','100%');chapterNodes.forEach((el,i)=>{el.style.opacity='';el.style.visibility='';el.style.transform='';el.classList.toggle('is-active',i===0);el.style.pointerEvents='';});}
 if(portal){const viewport=$('[data-cham5-stage]',portal);['--cham5-portal-scale','--cham5-portal-dark','--cham5-portal-small','--cham5-portal-title','--cham5-portal-title-y'].forEach(x=>viewport?.style.removeProperty(x));}
 if(film){set($('[data-cham5-stage]',film),'--cham5-film-x','0px');}
 if(gallery){['--cham5-gal-a','--cham5-gal-b','--cham5-gal-c','--cham5-gal-d'].forEach(x=>gallery.style.removeProperty(x));}
}
function update(){
 ticking=false;
 if(reduced.matches||small.matches){resetScroll();return;}
 const p=progress(cover),stage=$('[data-cham5-stage]',cover);
 if(stage){
   const fade=1-smooth(.12,.55,p)*.91;
   set(stage,'--cham5-cover-y',(-125*smooth(.04,.65,p)).toFixed(2)+'px');
   set(stage,'--cham5-cover-scale',(1-.39*smooth(.04,.68,p)).toFixed(4));
   set(stage,'--cham5-cover-opacity',fade.toFixed(4));
   set(stage,'--cham5-lower-opacity',(1-smooth(.15,.47,p)).toFixed(4));
   set(stage,'--cham5-photo-opacity',smooth(.22,.67,p).toFixed(4));
   set(stage,'--cham5-drawing-opacity',(.76-.51*p).toFixed(4));
   set(stage,'--cham5-ink-a',(-170*p).toFixed(1)+'px');
   set(stage,'--cham5-ink-b',(120*p).toFixed(1)+'px');
   set(stage,'--cham5-ink-c',(-70*p).toFixed(1)+'px');
   set(stage,'--cham5-photo-a',(90-180*p).toFixed(1)+'px');
   set(stage,'--cham5-photo-b',(-130+210*p).toFixed(1)+'px');
   set(stage,'--cham5-photo-c',(160-225*p).toFixed(1)+'px');
 }
 if(book){
   const b=progress(book);
   set(book,'--cham5-rail',(b*100).toFixed(2)+'%');
   const first=1-smooth(.20,.35,b);
   const second=smooth(.20,.35,b)*(1-smooth(.58,.73,b));
   const third=smooth(.58,.73,b);
   const alphas=[first,second,third];
   chapterNodes.forEach((ch,i)=>{
     const alpha=clamp(alphas[i]);
     ch.style.opacity=alpha.toFixed(4);
     ch.style.visibility=alpha>.015?'visible':'hidden';
     ch.style.pointerEvents=alpha>.60?'auto':'none';
     ch.style.transform='translateY('+((1-alpha)*24).toFixed(1)+'px)';
     ch.classList.toggle('is-active',alpha>.015);
   });
   const index=b<.30?1:b<.66?2:3;
   const count=$('[data-cham5-chapter-count]',book);
   if(count)count.textContent=String(index).padStart(2,'0');
 }
 if(portal){
   const p=progress(portal),v=$('[data-cham5-stage]',portal);
   set(v,'--cham5-portal-scale',(.56+.49*smooth(0,.8,p)).toFixed(4));
   set(v,'--cham5-portal-dark',(.07+.72*smooth(.27,.94,p)).toFixed(4));
   set(v,'--cham5-portal-small',(1-smooth(.15,.62,p)).toFixed(4));
   set(v,'--cham5-portal-title',smooth(.58,.90,p).toFixed(4));
   set(v,'--cham5-portal-title-y',((1-smooth(.58,.95,p))*46).toFixed(1)+'px');
 }
 if(film){
   const p=progress(film),v=$('[data-cham5-stage]',film);
   set(v,'--cham5-film-x',(-Math.min(window.innerWidth*.28,420)*p).toFixed(2)+'px');
 }
 if(gallery){
   const r=gallery.getBoundingClientRect();
   const p=clamp((window.innerHeight-r.top)/(window.innerHeight+r.height));
   set(gallery,'--cham5-gal-a',((p-.50)*-56).toFixed(1)+'px');
   set(gallery,'--cham5-gal-b',((p-.50)*76).toFixed(1)+'px');
   set(gallery,'--cham5-gal-c',((p-.50)*-64).toFixed(1)+'px');
   set(gallery,'--cham5-gal-d',((p-.50)*82).toFixed(1)+'px');
 }
}
function schedule(){if(!ticking){ticking=true;requestAnimationFrame(update);}}
function selectMaterial(index,focus=false){
 if(index<0||index>=matPanels.length)return;
 matPanels.forEach((panel,i)=>{
   const selected=i===index;
   panel.classList.toggle('is-active',selected);
   const body=$('.cham5-material__body',panel);
   const button=matTabs[i];
   if(body)body.hidden=!selected;
   button.setAttribute('aria-selected',String(selected));
   button.tabIndex=selected?0:-1;
 });
 if(focus)matTabs[index]?.focus();
}
matTabs.forEach((tab,i)=>{
 tab.addEventListener('click',()=>selectMaterial(i,false));
 tab.addEventListener('keydown',e=>{
   let n=i;
   if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(i+1)%matTabs.length;
   else if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=(i-1+matTabs.length)%matTabs.length;
   else if(e.key==='Home')n=0;
   else if(e.key==='End')n=matTabs.length-1;
   else return;
   e.preventDefault();selectMaterial(n,true);
 });
});
measureHeader();
document.documentElement.classList.add('cham5-ready');
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',()=>{measureHeader();schedule();},{passive:true});
reduced.addEventListener?.('change',schedule);
small.addEventListener?.('change',schedule);
document.fonts?.ready.then(schedule).catch(()=>{});
schedule();
})();
