/* CHẠM QUEST — original, dependency-free educational runner.
   Inspired by accessibility and arcade patterns in MIT-licensed Phaser examples.
   No third-party game code or art is copied. */
(() => {
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const laneY=[26,51,76];
const label={run:'Đang khám phá',pause:'Tạm dừng',quiz:'Thử thách kiến thức'};
const knowledge=window.CHAMCraftKnowledge;
const readJSON=id=>{try{return JSON.parse(document.getElementById(id)?.textContent||'[]')}catch(_){return []}};
function mount(root,core){
 if(!root||!core||!knowledge){if(root)root.innerHTML='<p>Không thể tải dữ liệu trò chơi. Vui lòng tải lại trang.</p>';return;}
 const avatars=readJSON('cham-avatar-catalog');
 const scenes=readJSON('cham-play-scenes');
 const defaultAvatar=avatars.find(x=>x.includes('cham-avatar-default.svg'))||avatars[0]||'';
 let raf=0,lastFrame=0,spawnClock=0,clock=0,round=0,hearts=3,score=0,lane=1;
 let phase='intro',pausedFrom='run',pieces=[],currentQuestion=null,runFacts=[],chosen=false,solved=0,spawnId=0;
 const avatarSrc=()=>{
  const avatar=String(core.getState().profile?.avatar||'');
  return avatars.find(x=>x.includes('/'+avatar+'?')||x.endsWith('/'+avatar)||x.includes(avatar+'?'))||defaultAvatar;
 };
 const stop=()=>{if(raf)cancelAnimationFrame(raf);raf=0;lastFrame=0;};
 const today=()=>core.dateKey();
 const claimed=()=>core.getState().ledger.some(x=>x.id==='game:'+today());
 const wrapper=(title,desc,content)=>'<div class="cq-shell"><header class="cq-heading"><div><p class="cq-kicker">CHẠM PLAY</p><h1>'+esc(title)+'</h1><p>'+esc(desc)+'</p></div><a class="cq-wallet" href="/pages/cham-club?tab=rewards"><span>Ví điểm CHẠM</span><strong data-cq-wallet>'+core.points()+'</strong><small>Đổi quà</small></a></header>'+content+'</div>';
 const stage=()=>runFacts[round];
 function intro(){
  phase='intro';stop();
  const photo=scenes[0]||'';
  root.innerHTML=wrapper('Lên đường giữ nghề','Một trò chơi nhỏ để tìm hiểu những làng nghề Việt Nam.',`
   <div class="cq-intro-layout">
    <div class="cq-intro-art" ${photo?'style="--cq-photo:url('+encodeURI(photo)+')"':''}>
      <span class="cq-intro-halo" aria-hidden="true"></span>
      <span class="cq-intro-tile cq-intro-tile--one">Gốm</span>
      <span class="cq-intro-tile cq-intro-tile--two">Mây tre</span>
      <span class="cq-intro-tile cq-intro-tile--three">Lụa</span>
      <img alt="" class="cq-intro-avatar" src="${esc(avatarSrc())}">
      <span class="cq-intro-floor" aria-hidden="true"></span>
    </div>
    <div class="cq-intro-copy"><p class="cq-kicker">HÀNH TRÌNH LÀNG NGHỀ</p><h2>Thu thập vật phẩm. Né chướng ngại. Trả lời để mở đường.</h2>
    <p>Đi qua năm chặng ngẫu nhiên. Chọn làn để nhặt vật phẩm, tránh chướng ngại và vượt thử thách kiến thức về nghề truyền thống.</p>
    <div class="cq-intro-rules"><span>↑ ↓ đổi làn</span><span>5 thử thách</span><span>+20 điểm mỗi ngày</span></div>
    <button type="button" class="cq-btn cq-btn--primary" data-cq-start>Bắt đầu chơi <span aria-hidden="true">→</span></button>
    <p class="cq-disclaimer">Chơi miễn phí trong phiên demo. Điểm chỉ có giá trị minh họa. ${claimed()?'Hôm nay bạn đã nhận thưởng game.':''}</p>
    </div>
   </div>`);
 }
 function progressLabels(){
  return runFacts.map((fact,index)=>'<span class="'+(index<solved?'is-done':index===round?'is-now':'')+'" aria-label="Chặng '+(index+1)+(index<solved?' hoàn thành':'')+'"></span>').join('');
 }
 function hud(){
  const heartsDisplay='<span aria-label="Còn '+hearts+' mạng">'+ '♥'.repeat(hearts) + '<span class="cq-hearts-lost">'+ '♥'.repeat(Math.max(0,3-hearts))+'</span></span>';
  return `<div class="cq-hud"><div><span class="cq-hud-caption">Chặng ${Math.min(round+1,5)} trên 5</span><strong data-cq-village>${esc(stage().village)}</strong></div><div class="cq-stage-bars" aria-hidden="true">${progressLabels()}</div><div class="cq-hud-right"><span class="cq-hearts">${heartsDisplay}</span><span class="cq-score">Vật phẩm <b data-cq-score>${score}</b></span></div></div>`;
 }
 function gameLayout(){
  const photo=scenes[round%Math.max(1,scenes.length)]||'';
  root.innerHTML=wrapper('Hành trình làng nghề','Dùng các phím ↑ ↓ hoặc nút điều khiển để đổi làn.',`
   <div class="cq-game-layout"><main class="cq-playfield">
    ${hud()}
    <div class="cq-world" data-cq-world style="--cq-color:${['#b37b5b','#a98b5c','#69816b','#7d8699','#9b6d63'][round%5]};${photo?'--cq-photo:url('+encodeURI(photo)+');':''}">
      <div class="cq-world-photo"></div>
      <div class="cq-cloud cq-cloud--one"></div><div class="cq-cloud cq-cloud--two"></div>
      <div class="cq-village-house" aria-hidden="true"><span></span></div>
      <div class="cq-path cq-path--one"></div><div class="cq-path cq-path--two"></div><div class="cq-path cq-path--three"></div>
      <div class="cq-pieces" data-cq-pieces></div>
      <div class="cq-player" data-cq-player style="top:${laneY[lane]}%"><img src="${esc(avatarSrc())}" alt="Nhân vật của bạn"><span class="cq-shadow"></span></div>
      <div class="cq-world-progress"><span data-cq-road-progress></span></div>
    </div>
    <div class="cq-controls">
      <div class="cq-controller"><button type="button" data-cq-up aria-label="Chuyển lên làn phía trên"><span aria-hidden="true">↑</span> Lên</button><button type="button" data-cq-down aria-label="Chuyển xuống làn phía dưới"><span aria-hidden="true">↓</span> Xuống</button></div>
      <p role="status" aria-live="polite" data-cq-status>Né vật cản màu tối, nhặt biểu tượng sáng để có thêm điểm.</p>
      <button type="button" data-cq-skip class="cq-pause">Đến câu hỏi</button><button type="button" data-cq-pause class="cq-pause">Tạm dừng</button>
    </div>
   </main>
   <aside class="cq-guide">
     <span class="cq-guide-eyebrow">ĐIỂM ĐẾN</span><h2>${esc(stage().village)}</h2>
     <p>Mỗi chặng có một thử thách về làng nghề. Bạn sẽ khám phá câu trả lời sau khi đi hết đoạn đường.</p>
     <div class="cq-guide-tips"><div><span class="cq-token-illustration" aria-hidden="true">◆</span><span>Vật phẩm</span><small>+10 điểm trò chơi</small></div><div><span class="cq-danger-illustration" aria-hidden="true">×</span><span>Chướng ngại</span><small>Mất một lượt bảo vệ</small></div></div>
     <a href="/pages/cham-club" class="cq-profile-link">Hồ sơ và phần thưởng <span aria-hidden="true">→</span></a>
   </aside></div>`);
 }
 function spawn(){
  const kind=Math.random()<.7?'token':'obstacle';
  const index=Math.floor(Math.random()*3);
  const piece={id:++spawnId,x:105,lane:index,kind,hit:false,element:document.createElement('span')};
  piece.element.className='cq-piece cq-piece--'+kind;
  piece.element.textContent=kind==='token'?'◆':'×';
  piece.element.setAttribute('aria-hidden','true');
  piece.element.style.top=laneY[index]+'%';
  const holder=root.querySelector('[data-cq-pieces]');
  if(holder)holder.append(piece.element);
  pieces.push(piece);
 }
 function updateVisuals(){
  const player=root.querySelector('[data-cq-player]');
  if(player)player.style.top=laneY[lane]+'%';
  const progress=root.querySelector('[data-cq-road-progress]');
  if(progress)progress.style.width=Math.min(100,100*clock/8.6)+'%';
  const count=root.querySelector('[data-cq-score]');if(count)count.textContent=String(score);
  const heartsNode=root.querySelector('.cq-hearts');
  if(heartsNode){heartsNode.innerHTML='♥'.repeat(hearts)+'<span class="cq-hearts-lost">'+ '♥'.repeat(Math.max(0,3-hearts))+'</span>';heartsNode.setAttribute('aria-label','Còn '+hearts+' mạng');}
 }
 function tick(timestamp){
  if(phase!=='run')return;
  if(!lastFrame)lastFrame=timestamp;
  const dt=Math.min(.07,(timestamp-lastFrame)/1000);
  lastFrame=timestamp;
  clock+=dt;spawnClock+=dt;
  if(spawnClock>1.28&&clock<7.0){spawnClock=0;spawn();}
  for(const piece of pieces){
    piece.x-=dt*33;
    piece.element.style.left=piece.x+'%';
    if(!piece.hit&&piece.x<22&&piece.x>12&&piece.lane===lane){
      piece.hit=true;piece.element.classList.add('is-collected');
      if(piece.kind==='token'){score+=10;setStatus('+10 vật phẩm!');}else{hearts=Math.max(0,hearts-1);setStatus('Bạn gặp vật cản. Hãy đổi làn!');}
      updateVisuals();
      if(hearts===0){lose();return;}
    }
    if(piece.x<0||piece.hit&&piece.x<10){piece.element.remove();piece.dead=true;}
  }
  pieces=pieces.filter(p=>!p.dead);
  updateVisuals();
  if(clock>=8.6){question();return;}
  raf=requestAnimationFrame(tick);
 }
 function setStatus(message){const status=root.querySelector('[data-cq-status]');if(status)status.textContent=message;}
 function beginRound(){
  stop();phase='run';clock=0;spawnClock=0;lastFrame=0;pieces=[];lane=1;
  gameLayout();
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){question();return;}
  raf=requestAnimationFrame(tick);
 }
 function pause(){
  if(phase==='run'){stop();phase='pause';setStatus('Trò chơi đang tạm dừng.');const b=root.querySelector('[data-cq-pause]');if(b)b.textContent='Tiếp tục';}
  else if(phase==='pause'){phase='run';lastFrame=0;const b=root.querySelector('[data-cq-pause]');if(b)b.textContent='Tạm dừng';setStatus('Tiếp tục khám phá!');raf=requestAnimationFrame(tick);}
 }
 function laneMove(amount){
  if(phase!=='run')return;lane=Math.min(2,Math.max(0,lane+amount));updateVisuals();
 }
 function question(){
  stop();phase='quiz';chosen=false;
  currentQuestion=knowledge.buildQuestion(stage());
  const modal=document.createElement('section');
  modal.className='cq-question';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','cq-question-title');
  modal.innerHTML=`<div class="cq-question__card">
   <p class="cq-kicker">THỬ THÁCH KIẾN THỨC</p>
   <p class="cq-question__location">Chặng ${round+1}: ${esc(stage().village)}</p>
   <h2 id="cq-question-title">${esc(currentQuestion.question)}</h2>
   <div class="cq-question__answers">
    ${currentQuestion.options.map((option,i)=>`<button type="button" data-cq-answer="${i}"><span>${String.fromCharCode(65+i)}</span>${esc(option)}</button>`).join('')}
   </div>
   <div class="cq-question__feedback" data-cq-feedback hidden></div>
  </div>`;
  root.querySelector('[data-cq-world]')?.append(modal);
  const first=modal.querySelector('button');if(first)first.focus();
 }
 function answer(index){
  if(phase!=='quiz'||chosen||!currentQuestion)return;
  chosen=true;
  const correct=index===currentQuestion.answerIndex;
  const q=root.querySelector('.cq-question');if(!q)return;
  const buttons=[...q.querySelectorAll('[data-cq-answer]')];
  buttons.forEach((btn,i)=>{btn.disabled=true;if(i===currentQuestion.answerIndex)btn.classList.add('is-correct');if(i===index&&!correct)btn.classList.add('is-wrong');});
  if(correct){score+=40;solved++;}else{hearts=Math.max(0,hearts-1);}
  const feedback=q.querySelector('[data-cq-feedback]');
  feedback.hidden=false;
  feedback.innerHTML=`<div class="cq-answer-result ${correct?'is-success':'is-failure'}"><strong>${correct?'Chính xác!':'Chưa đúng.'}</strong><p>${esc(currentQuestion.explanation)}</p>
   <a target="_blank" rel="noopener noreferrer" href="${esc(currentQuestion.source)}">Đọc thêm từ nguồn du lịch Việt Nam</a>
   <button type="button" class="cq-btn cq-btn--primary" data-cq-after-answer>${correct?(solved===runFacts.length?'Hoàn thành hành trình':'Tiếp tục hành trình'):(hearts===0?'Xem kết quả':'Thử câu khác')} <span aria-hidden="true">→</span></button>
   </div>`;
 }
 function afterAnswer(){
  if(!chosen)return;
  if(hearts<=0){lose();return;}
  if(solved>=runFacts.length){win();return;}
  if(currentQuestion.options[currentQuestion.answerIndex]!==currentQuestion.options.find((_,i)=>i===currentQuestion.answerIndex))return;
  if(root.querySelector('.cq-answer-result.is-failure')){
    const old=root.querySelector('.cq-question');if(old)old.remove();
    question();return;
  }
  round++;beginRound();
 }
 function win(){
  phase='win';stop();
  const award=core.gameAward(Math.max(1,5*3-hearts));
  root.innerHTML=wrapper('Đã về đến làng!','Bạn đã hoàn thành hành trình và mở khóa kiến thức của năm làng nghề.',`
   <div class="cq-result"><div class="cq-result__emblem" aria-hidden="true">✳</div><p class="cq-kicker">HÀNH TRÌNH HOÀN THÀNH</p><h2>Nghề truyền thống vẫn đang tiếp nối.</h2>
     <div class="cq-result__stats"><div><strong>${score}</strong><span>Điểm trò chơi</span></div><div><strong>${solved}</strong><span>Kiến thức khám phá</span></div><div><strong>${award?'+20':'Đã nhận'}</strong><span>Điểm CHẠM hôm nay</span></div></div>
     <p>${award?'20 điểm CHẠM đã được ghi vào ví của bạn.':'Bạn đã nhận điểm thưởng game hôm nay. Hãy chơi lại để khám phá các câu hỏi khác.'}</p>
     <div class="cq-result__links"><button type="button" class="cq-btn cq-btn--primary" data-cq-restart>Chơi lại</button><a class="cq-btn cq-btn--secondary" href="/pages/cham-club?tab=rewards">Đổi quà bằng điểm</a></div>
   </div>`);
 }
 function lose(){
  stop();phase='lose';
  root.innerHTML=wrapper('Kết thúc lượt chơi','Bạn có thể bắt đầu lại để khám phá các câu hỏi mới.',`
   <div class="cq-result cq-result--lose"><div class="cq-result__emblem" aria-hidden="true">◇</div><h2>Hành trình chưa dừng lại.</h2><p>Bạn đã hoàn thành ${solved} chặng và tích lũy ${score} điểm trò chơi. Lần sau hãy chọn làn và tránh vật cản tốt hơn.</p>
    <button type="button" class="cq-btn cq-btn--primary" data-cq-restart>Thử lại</button>
   </div>`);
 }
 function start(){
  stop();hearts=3;score=0;lane=1;round=0;solved=0;spawnId=0;runFacts=knowledge.generateRun(5);beginRound();
 }
 root.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-cq-start')||b.hasAttribute('data-cq-restart')){start();return;}
  if(b.hasAttribute('data-cq-up')){laneMove(-1);return;}
  if(b.hasAttribute('data-cq-down')){laneMove(1);return;}
  if(b.hasAttribute('data-cq-pause')){pause();return;}
  if(b.hasAttribute('data-cq-skip')&&phase==='run'){question();return;}
  if(b.hasAttribute('data-cq-answer')){answer(Number(b.dataset.cqAnswer));return;}
  if(b.hasAttribute('data-cq-after-answer')){afterAnswer();return;}
 });
 document.addEventListener('keydown',e=>{
  if(!root.isConnected||e.target.matches('input,textarea,select'))return;
  if((e.key==='ArrowUp'||e.key==='w'||e.key==='W')&&phase==='run'){e.preventDefault();laneMove(-1);}
  if((e.key==='ArrowDown'||e.key==='s'||e.key==='S')&&phase==='run'){e.preventDefault();laneMove(1);}
  if(e.key===' '&&(phase==='run'||phase==='pause')){e.preventDefault();pause();}
 });
 let touchY=null;
 root.addEventListener('touchstart',e=>{if(e.target.closest('[data-cq-world]'))touchY=e.changedTouches[0]?.clientY??null;},{passive:true});
 root.addEventListener('touchend',e=>{if(touchY===null)return;const diff=(e.changedTouches[0]?.clientY??touchY)-touchY;touchY=null;if(Math.abs(diff)>28)laneMove(diff>0?1:-1);},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&phase==='run')pause();});
 document.addEventListener('cham:state',()=>{const wallet=root.querySelector('[data-cq-wallet]');if(wallet)wallet.textContent=core.points();});
 intro();
}
window.CHAMQuest={mount};
})();
