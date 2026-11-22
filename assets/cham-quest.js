/* CHẠM DINO QUEST | original educational side runner.
   Character sprite: Free Dino Sprites by pzUH, CC0; scenery illustrated for CHẠM.
   Questions: CHAMCraftKnowledge; rewards: CHAMDemo browser-local ledger. */
(() => {
'use strict';
const $=(s,p=document)=>p.querySelector(s);
const $$=(s,p=document)=>[...p.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getJSON=id=>{try{return JSON.parse(document.getElementById(id)?.textContent||'{}')}catch(_){return {}}};
function mount(root,core){
 const facts=window.CHAMCraftKnowledge;
 const art=getJSON('cham-dino-assets');
 if(!root||!core||!facts||!art.run){if(root)root.textContent='Không thể tải trò chơi. Vui lòng làm mới trang.';return;}
 for(const key of ['run','jump','idle','landscape']){
  if(typeof art[key]==='string'&&art[key].length<1800)root.style.setProperty('--dino-'+key,'url("'+art[key].replace(/["\\]/g,'')+'")');
 }
 let state='intro',raf=0,last=0,elapsed=0,sinceSpawn=0,pace=1.0,y=0,velocity=0;
 let lives=3,score=0,found=0,objects=[],runFacts=[],current=null,chosen=false,sequence=0;
 let lastSpawnKind='obstacle',lastInput=0,originalFocus=null;
 const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
 const siteHeader=$('#header-group');
 function measureHeader(){document.documentElement.style.setProperty('--cham-game-header-height',(siteHeader?.getBoundingClientRect().height||64)+'px');}
 measureHeader();
 if('ResizeObserver'in window&&siteHeader)new ResizeObserver(measureHeader).observe(siteHeader);
 const awardClaimed=()=>core.getState().ledger.some(l=>l.id==='game:'+core.dateKey());
 const footerNote='Điểm thưởng chỉ có giá trị trong bản trình diễn.';
 const character='<span class="dino-hero-character" aria-label="Khủng long xanh" role="img"></span>';
 const status=message=>{const node=$('[data-dino-status]',root);if(node)node.textContent=message;};
 const worldMarkup=()=>'<div class="dino-landscape"><img class="dino-landscape__image" src="'+esc(art.landscape)+'" alt="" aria-hidden="true"><div class="dino-shimmer"></div><div class="dino-hills"></div><div class="dino-ground"></div><div class="dino-character" data-dino-character role="img" aria-label="Khủng long đang chạy"><span class="dino-character__sprite"></span><span class="dino-character__shadow"></span></div><div class="dino-objects" data-dino-objects></div><div class="dino-world-overlays" data-dino-overlays></div></div>';
 const hud=()=>'<div class="dino-topbar"><div class="dino-brand"><small>CHẠM PLAY</small><strong>KHỦNG LONG LÀNG NGHỀ</strong></div><div class="dino-progress"><span>Kiến thức <b data-dino-progress>0/5</b></span><div class="dino-progress-track"><span data-dino-progress-bar></span></div></div><div class="dino-stats"><span>Điểm chơi <b data-dino-score>0</b></span><span class="dino-hearts" aria-label="Còn 3 mạng" data-dino-hearts>♥ ♥ ♥</span></div><button class="dino-top-pause" data-dino-pause type="button" aria-label="Tạm dừng trò chơi">II</button></div>';
 const controls=()=>'<div class="dino-controls"><div class="dino-control-hint"><span data-dino-status role="status" aria-live="polite">Nhấn Space, phím ↑ hoặc chạm để nhảy.</span><small>Thu thập bình gốm để mở câu hỏi về nghề truyền thống.</small></div><div class="dino-control-buttons"><button type="button" data-dino-jump class="dino-jump-button" aria-label="Nhảy lên"><span aria-hidden="true">↑</span> NHẢY</button></div></div>';
 const structure=()=>'<div class="dino-app">'+hud()+worldMarkup()+controls()+'</div>';
 const scene=()=>$('.dino-landscape',root);
 const overlays=()=> $('[data-dino-overlays]',root);
 const actor=()=> $('[data-dino-character]',root);
 function setVisual(){
  const actorNode=actor();if(actorNode){actorNode.style.setProperty('--jump-height',y+'px');actorNode.classList.toggle('is-jumping',y>4);}
  const counter=$('[data-dino-score]',root);if(counter)counter.textContent=String(score);
  const progress=$('[data-dino-progress]',root);if(progress)progress.textContent=found+'/5';
  const bar=$('[data-dino-progress-bar]',root);if(bar)bar.style.width=(found/5*100)+'%';
  const hearts=$('[data-dino-hearts]',root);if(hearts){hearts.textContent=('♥ '.repeat(lives)+'♡ '.repeat(Math.max(0,3-lives))).trim();hearts.setAttribute('aria-label','Còn '+lives+' mạng');}
 }
 const stop=()=>{cancelAnimationFrame(raf);raf=0;last=0;};
 function layer(content){const el=overlays();if(el)el.innerHTML=content;}
 const modal=(cls,title,content)=>'<section class="dino-modal '+cls+'" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><div class="dino-modal-card">'+content+'</div></section>';
 function intro(){
  stop();state='intro';
  root.innerHTML='<section class="dino-menu" aria-label="Menu trò chơi CHẠM Quest">'+
   '<div class="dino-menu__art"><img class="dino-menu__landscape" src="'+esc(art.landscape)+'" alt="" aria-hidden="true"><span class="dino-menu__character" role="img" aria-label="Khủng long hoạt hình"></span><span class="dino-menu__sun" aria-hidden="true">✳</span><span class="dino-menu__decor" aria-hidden="true"></span></div>'+
   '<div class="dino-menu__copy"><p class="dino-eyebrow">CHẠM PLAY · KHÁM PHÁ LÀNG NGHỀ</p><h1>Khủng long đi tìm làng nghề.</h1>'+
   '<p>Nhảy qua gốc cây, thu thập bình gốm và giải các câu hỏi về nghề thủ công Việt Nam.</p>'+
   '<div class="dino-menu__steps"><span><b>01</b> Nhảy tránh chướng ngại</span><span><b>02</b> Nhặt bình gốm để mở câu hỏi</span><span><b>03</b> Hoàn thành năm thử thách</span></div>'+
   '<div class="dino-menu__actions"><button type="button" data-dino-start class="dino-primary">Bắt đầu chơi <span aria-hidden="true">→</span></button><a href="/pages/cham-club" class="dino-menu__profile">Xem điểm của bạn</a></div>'+
   '<p class="dino-menu__note">Space, ↑ hoặc chạm để nhảy. '+footerNote+'</p></div></section>';
  const btn=$('[data-dino-start]',root);if(btn)btn.focus({preventScroll:true});
 }
 function start(){
  stop();score=0;found=0;lives=3;elapsed=0;sinceSpawn=0;pace=1;y=0;velocity=0;objects=[];sequence=0;current=null;chosen=false;
  runFacts=facts.generateRun(5);lastSpawnKind='obstacle';root.innerHTML=structure();setVisual();
  state='run';status('Nhảy để thu thập bình gốm.');raf=requestAnimationFrame(tick);
 }
 function jump(){
  if(state==='intro'){start();return;}
  if(state!=='run')return;
  if(y>1)return;
  const field=scene();const height=field?.clientHeight||450;
  velocity=Math.max(650,Math.min(920,height*1.85));
  y=2;
  setVisual();
 }
 function spawn(kind){
  const holder=$('[data-dino-objects]',root);if(!holder)return;
  const field=scene();const width=field?.clientWidth||1100;
  const item={id:++sequence,kind,x:width+100,hit:false,el:document.createElement('div')};
  item.el.className='dino-object dino-object--'+kind;
  const img=document.createElement('img');img.src=kind==='pottery'?art.pottery:art.stump;img.alt='';img.decoding='async';
  item.el.append(img);holder.append(item.el);
  objects.push(item);lastSpawnKind=kind;
 }
 function remove(item){item.el.remove();item.removed=true;}
 function pickup(item){
  remove(item);
  score+=10;
  setVisual();
  askQuestion();
 }
 function damage(item){
  remove(item);lives--;setVisual();
  status('Bạn vấp phải gốc cây. Hãy canh thời điểm nhảy!');
  const char=actor();char?.classList.add('is-hit');setTimeout(()=>char?.classList.remove('is-hit'),650);
  if(lives<=0)finish(false);
 }
 function tick(stamp){
  if(state!=='run')return;
  if(!last)last=stamp;
  const dt=Math.min(.045,(stamp-last)/1000);last=stamp;
  elapsed+=dt;sinceSpawn+=dt;pace=Math.min(1.55,1+elapsed/95);
  const field=scene();if(!field)return;
  const worldWidth=field.clientWidth,worldHeight=field.clientHeight;
  const base=Math.max(84,worldHeight*.19);
  velocity-=Math.max(1650,worldHeight*4.0)*dt;
  y=Math.max(0,y+velocity*dt);
  if(y===0)velocity=0;
  if(sinceSpawn>(lastSpawnKind==='pottery'?2.05:1.9)){
   sinceSpawn=0;
   spawn(lastSpawnKind==='pottery'?'obstacle':'pottery');
  }
  const playerX=worldWidth*.20;
  for(const obj of objects){
   obj.x-=Math.max(220,worldWidth*.36)*pace*dt;
   obj.el.style.left=obj.x+'px';
   if(!obj.hit&&Math.abs(obj.x-playerX)<Math.min(38,worldWidth*.038)){
    obj.hit=true;
    if(obj.kind==='pottery'){
      if(y>Math.max(12,worldHeight*.045)){pickup(obj);break;}
      obj.hit=false;
    }else if(y<Math.max(58,worldHeight*.19)){damage(obj);if(state!=='run')break;}
   }
   if(obj.x<-110)remove(obj);
  }
  objects=objects.filter(o=>!o.removed);
  setVisual();
  if(state==='run')raf=requestAnimationFrame(tick);
 }
 function askQuestion(){
  stop();state='quiz';chosen=false;
  current=facts.buildQuestion(runFacts[found]);
  const choices=current.options.map((option,i)=>'<button type="button" data-dino-choice="'+i+'" class="dino-choice"><span>'+String.fromCharCode(65+i)+'</span>'+esc(option)+'</button>').join('');
  const panel='<p class="dino-eyebrow">BẠN ĐÃ NHẶT ĐƯỢC BÌNH GỐM</p><span class="dino-question-step">Câu hỏi '+(found+1)+' trên 5</span><h2>'+esc(current.question)+'</h2><div class="dino-choices">'+choices+'</div><div class="dino-feedback" data-dino-feedback hidden></div>';
  layer(modal('dino-modal--question','Câu hỏi làng nghề',panel));
  originalFocus=document.activeElement;
  $('[data-dino-choice]',root)?.focus();
 }
 function choose(index){
  if(state!=='quiz'||chosen||!current)return;
  chosen=true;const correct=index===current.answerIndex;
  $$('[data-dino-choice]',root).forEach((button,i)=>{button.disabled=true;if(i===current.answerIndex)button.classList.add('is-correct');if(i===index&&!correct)button.classList.add('is-wrong');});
  if(correct){found++;score+=100;}else{lives=Math.max(0,lives-1);}
  setVisual();
  const feedback=$('[data-dino-feedback]',root);
  if(!feedback)return;
  feedback.hidden=false;
  feedback.innerHTML='<strong class="'+(correct?'is-correct':'is-wrong')+'">'+(correct?'Chính xác!':'Chưa đúng rồi.')+'</strong><p>'+esc(current.explanation)+'</p><a href="'+esc(current.source)+'" target="_blank" rel="noopener noreferrer">Đọc nguồn tham khảo</a><button type="button" class="dino-primary" data-dino-continue>'+(found===5?'Xem kết quả':lives===0?'Xem kết quả':'Tiếp tục chạy')+' <span aria-hidden="true">→</span></button>';
  $('[data-dino-continue]',root)?.focus();
 }
 function continueGame(){
  if(state!=='quiz'||!chosen)return;
  layer('');
  if(lives<=0){finish(false);return;}
  if(found===5){finish(true);return;}
  // do not reset running score or level; the next pottery immediately opens another distinct question.
  state='run';last=0;sinceSpawn=.1;
  objects.forEach(remove);objects=[];
  status('Rất tốt! Nhảy để nhặt bình gốm tiếp theo.');
  $('[data-dino-jump]',root)?.focus();
  raf=requestAnimationFrame(tick);
 }
 function pause(){
  if(state==='run'){
   stop();state='pause';layer(modal('dino-modal--pause','Trò chơi tạm dừng','<p class="dino-eyebrow">TẠM DỪNG</p><h2>Nghỉ một chút nhé.</h2><p>Bạn có thể tiếp tục từ vị trí hiện tại.</p><button data-dino-resume class="dino-primary" type="button">Tiếp tục chơi</button><button data-dino-restart class="dino-secondary" type="button">Chơi lại từ đầu</button>'));
   $('[data-dino-resume]',root)?.focus();
  }else if(state==='pause'){layer('');state='run';last=0;raf=requestAnimationFrame(tick);}
 }
 function finish(won){
  stop();state=won?'won':'lost';
  const reward=won?core.gameAward(Math.max(5,score)):false;
  const text=won?(reward?'Bạn nhận được 20 điểm CHẠM.':'Bạn đã nhận điểm thưởng hôm nay; vẫn có thể chơi lại để học thêm.'):'Bạn có thể bắt đầu lại để thử các kiến thức khác.';
  layer(modal('dino-modal--end',won?'Chinh phục thành công':'Hết lượt chơi',
   '<div class="dino-end"><p class="dino-eyebrow">'+(won?'CHÚC MỪNG':'THỬ LẠI NHÉ')+'</p><h2>'+(won?'Một chuyến đi đáng nhớ.':'Hành trình chưa kết thúc.')+'</h2><p>'+esc(text)+'</p><div class="dino-end-stats"><div><strong>'+score+'</strong><span>Điểm trò chơi</span></div><div><strong>'+found+'/5</strong><span>Câu trả lời đúng</span></div><div><strong>'+(reward?'+20':won?'Đã nhận':'—')+'</strong><span>Điểm CHẠM</span></div></div><div class="dino-end-actions"><button data-dino-restart class="dino-primary" type="button">Chơi lại</button><a href="/pages/cham-club?tab=rewards" class="dino-secondary">Xem ví điểm</a></div></div>'));
 }
 root.addEventListener('click',e=>{
  const button=e.target.closest('button');
  if(button){
   if(button.hasAttribute('data-dino-start')||button.hasAttribute('data-dino-restart')){start();return;}
   if(button.hasAttribute('data-dino-jump')){jump();return;}
   if(button.hasAttribute('data-dino-pause')||button.hasAttribute('data-dino-resume')){pause();return;}
   if(button.hasAttribute('data-dino-choice')){choose(Number(button.dataset.dinoChoice));return;}
   if(button.hasAttribute('data-dino-continue')){continueGame();return;}
  }
  if(state==='run'&&e.target.closest('.dino-landscape'))jump();
 });
 document.addEventListener('keydown',e=>{
  if(!root.isConnected)return;
  if(e.target.closest('input,textarea,select'))return;
  if(['Space','ArrowUp','KeyW'].includes(e.code)){
   if(state==='run'){e.preventDefault();jump();}
  }
  if(e.code==='KeyP'&&(state==='run'||state==='pause')){e.preventDefault();pause();}
  if(e.code==='Escape'&&state==='pause')pause();
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='run')pause();});
 document.addEventListener('cham:state',()=>{const wallet=$('[data-dino-wallet]',root);if(wallet)wallet.textContent=core.points();});
 // In isolated local tests only. The published Shopify storefront never exposes this test hook.
 if(['127.0.0.1','localhost'].includes(location.hostname)){
   window.CHAMQuestQA={pickup:()=>{if(state==='run')pickup({el:document.createElement('div'),removed:false});},getState:()=>({state,lives,score,found})};
 }
 intro();
}
window.CHAMQuest={mount};
})();
