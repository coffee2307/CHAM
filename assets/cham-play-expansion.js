/* CHẠM Play 3.0 — lobby, detailed game intros, quests, progress, new games.
   Add-on to CHAMQuest; no global scroll manipulation or paid prizes. */
(()=>{
'use strict';
const legacy=window.CHAMQuest?.mount;
const meta=window.CHAMPlayMeta;
const pack=window.CHAMPlayPacking;
const wheel=window.CHAMPlayWheel;
if(typeof legacy!=='function'||!meta||!pack||!wheel)return;
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={
 memory:'Ghép cặp thủ công',quiz:'Đoán sản phẩm',match:'Nối chất liệu',
 word:'Ô chữ chất liệu',speed:'Thử thách nhanh',pack:'Đóng gói đơn hàng',wheel:'Vòng khám phá'
};
const detail={
 memory:{tag:'Trí nhớ',time:'2–5 phút',description:'Lật các thẻ, tìm cặp tương ứng và giữ nhịp ghép liên tiếp.',mode:['Dễ · 4 cặp','Vừa · 5 cặp','Khó · 6 cặp']},
 quiz:{tag:'Kiến thức',time:'2–4 phút',description:'Đọc tư liệu, chọn đáp án và học điều mới từ lời giải thích.',mode:['Ngắn · 3 câu','Thường · 5 câu','Chuỗi · 5 câu']},
 match:{tag:'Ghép nối',time:'3 phút',description:'Chọn ứng dụng và chất liệu tương ứng. Hai đầu ghép đúng được đánh dấu chung.',mode:['Cơ bản','Nâng cao','Thử thách']},
 word:{tag:'Giải đố',time:'3–5 phút',description:'Tìm các từ khóa theo hàng ngang, cột dọc, cả hai chiều.',mode:['Gợi ý','Thường','Không gợi ý']},
 speed:{tag:'Phản xạ',time:'30–60 giây',description:'Trả lời nhanh năm câu hỏi, cân bằng tốc độ và độ chính xác.',mode:['60 giây','45 giây','30 giây']},
 pack:{tag:'Mô phỏng',time:'2–3 phút',description:'Chọn cách bảo vệ phù hợp cho sản phẩm trong đơn hàng giả lập.',mode:['Tập làm quen','Đóng gói','Thử thách']},
 wheel:{tag:'Khám phá',time:'Mỗi ngày',description:'Hoàn thành hai nhiệm vụ để khám phá huy hiệu sưu tầm của hôm nay.',mode:['Quà sưu tầm']}
};
const levelLabels=['easy','normal','hard'];
function mount(root,core){
 legacy(root,core);
 const source=(()=>{try{return JSON.parse(document.querySelector('#cham-play-assets')?.textContent||'{}');}catch(_){return {};}})();
 const icon=(name)=>source['icon-'+name]?'<img class="cp-icon" alt="" aria-hidden="true" src="'+escape(source['icon-'+name])+'">':'';
 const img=(name)=>source[name]?'<img loading="lazy" decoding="async" alt="" src="'+escape(source[name])+'">':'';
 const facts=window.CHAMCraftKnowledge?.records||[];
 let currentGame=null,currentAttempt=null,pendingLevel='normal',panel=null,activeGame=null;
 let pendingTimer=null,observer;
 const startMs=()=>Date.now();
 const attemptId=()=>String(Date.now())+'-'+Math.random().toString(36).slice(2);
 const scrollToTop=()=>{};
 const getStars=(data)=>{
  if(!data.won)return 0;
  if(data.gameId==='memory')return data.moves<=data.pairs+1?3:data.moves<=data.pairs+3?2:1;
  if(data.gameId==='pack')return pack.stars(data.packState);
  if(data.gameId==='quiz'||data.gameId==='speed')return data.correct===data.total?3:data.correct>=data.total-1?2:1;
  return data.mistakes===0?3:data.mistakes<=2?2:1;
 };
 function record(data){
  if(!data?.gameId||!data.attemptId)return;
  const stars=getStars(data);
  return meta.recordAttempt({...data,stars});
 }
 function badgesHTML(badges){
  return badges.map(b=>{
   const earned=meta.summary().badges.includes(b.id);
   return '<article class="cp3-badge '+(earned?'is-earned':'is-locked')+'">'+
     '<span>'+icon(earned?'award':'layers')+'</span><strong>'+escape(b.title)+'</strong>'+
     '<small>'+escape(b.desc)+'</small></article>';
  }).join('');
 }
 function missionHTML(){
  const s=meta.summary();
  return s.missions.map(m=>'<article class="cp3-mission '+(m.done?'is-done':'')+'">'+
   '<span class="cp3-mission__mark">'+icon(m.done?'check':'layers')+'</span>'+
   '<div><strong>'+escape(m.label)+'</strong><span>'+m.count+'/'+m.target+'</span>'+
   '<div class="cp3-meter"><i style="width:'+(100*m.count/m.target).toFixed(1)+'%"></i></div></div></article>').join('');
 }
 function extraCard(id){
  const g=detail[id],gift=id==='wheel';
  return '<article class="cp-card cp3-card cp3-card--'+id+'"><button class="cp-card__open" type="button" data-cp-game="'+id+'" aria-label="Khám phá '+escape(names[id])+'">'+
    '<span class="cp-card__media">'+img(id)+'<span class="cp-card__level">'+(gift?'Mỗi ngày':'Mới')+'</span></span>'+
    '<span class="cp-card__content"><span class="cp-card__category">'+escape(g.tag)+' · '+escape(g.time)+'</span>'+
    '<strong>'+escape(names[id])+'</strong><span class="cp-card__description">'+escape(g.description)+'</span>'+
    '<span class="cp-card__bottom"><span>'+(gift?'Huy hiệu demo':'4 lượt lựa chọn')+'</span><span class="cp-card__action">'+(gift?'Xem quà':'Chơi ngay')+'</span></span></span>'+
    '</button></article>';
 }
 function lobby(){
  const hub=root.querySelector('.cp-hub');if(!hub||hub.querySelector('.cp3-dashboard'))return;
  const s=meta.summary();
  const summary=hub.querySelector('.cp-summary');
  if(summary){
   const dashboard=document.createElement('section');
   dashboard.className='cp3-dashboard';dashboard.setAttribute('aria-label','Tiến trình CHẠM Play');
   dashboard.innerHTML=
    '<div class="cp3-dashboard__top"><div class="cp3-player">'+
      '<p class="cp-eyebrow">Cấp độ của bạn</p>'+
      '<h2>'+escape(s.level.name)+'</h2><p>'+s.xp+' XP · '+s.stars+' sao · '+s.streak+' ngày khám phá liên tiếp</p>'+
      '<div class="cp3-meter" aria-label="Tiến trình cấp độ"><i style="width:'+(s.level.progress*100).toFixed(2)+'%"></i></div>'+
      '</div><div class="cp3-daily"><p class="cp-eyebrow">Nhiệm vụ hôm nay</p>'+
      '<strong>'+s.missions.filter(q=>q.done).length+' / '+s.missions.length+'</strong>'+
      '<span>Hoàn thành nhiệm vụ để mở huy hiệu demo</span></div></div>'+
    '<div class="cp3-missions">'+missionHTML()+'</div>'+
    '<div class="cp3-milestones"><h3>Huy hiệu của bạn</h3><div class="cp3-badge-grid">'+badgesHTML(meta.badges)+'</div></div>';
   summary.insertAdjacentElement('afterend',dashboard);
  }
  // Game discovery first; quests and badges follow rather than blocking play.
  const gamesSection=hub.querySelector('.cp-games');
  const dashboard=hub.querySelector('.cp3-dashboard');
  if(gamesSection&&dashboard)gamesSection.insertAdjacentElement('afterend',dashboard);
  const grid=hub.querySelector('.cp-grid');
  const allActive=!!hub.querySelector('[data-cp-filter="Tất cả"].is-active');
  if(grid&&allActive&&!grid.querySelector('.cp3-card'))grid.insertAdjacentHTML('beforeend',extraCard('pack')+extraCard('wheel'));
  const filters=hub.querySelector('.cp-filter-row');
  if(filters&&!filters.querySelector('[data-v3-filter]')){
   filters.insertAdjacentHTML('beforeend',
    '<button type="button" class="cp-filter" data-v3-filter="pack" aria-pressed="false">Mô phỏng</button>'+
    '<button type="button" class="cp-filter" data-v3-filter="wheel" aria-pressed="false">Khám phá</button>');
  }
  const count=hub.querySelector('.cp-summary>div:nth-child(2) strong');
  if(count)count.textContent=s.completed.length+' / 7';
  const header=hub.querySelector('.cp-section-head h2');
  if(header)header.textContent='Chọn game yêu thích';
 }
 function removePanel(){
  panel?.remove();panel=null;
 }
 function intro(id){
  removePanel();
  const g=detail[id];if(!g)return;
  const summary=meta.summary();
  const gift=id==='wheel';
  panel=document.createElement('div');panel.className='cp3-dialog-backdrop';
  panel.innerHTML='<div class="cp3-dialog" role="dialog" aria-modal="true" aria-labelledby="cp3-dialog-heading">'+
   '<button type="button" class="cp3-dialog__close" data-v3-close aria-label="Đóng">×</button>'+
   '<div class="cp3-dialog__art">'+img(id)+'</div>'+
   '<div class="cp3-dialog__text"><p class="cp-eyebrow">'+escape(g.tag)+' · '+escape(g.time)+'</p>'+
   '<h2 id="cp3-dialog-heading">'+escape(names[id])+'</h2><p>'+escape(g.description)+'</p>'+
   (gift?'<p class="cp3-dialog__note">'+(summary.giftReady?'Quà hôm nay đã sẵn sàng.':summary.giftClaimed?'Đã nhận quà hôm nay.':'Cần hoàn thành hai nhiệm vụ hôm nay trước khi mở.')+'</p>':
    '<fieldset class="cp3-mode"><legend>Chọn chế độ</legend>'+g.mode.map((x,i)=>
      '<label><input type="radio" name="cp3-level" value="'+levelLabels[i]+'" '+(i===1?'checked':'')+'><span>'+escape(x)+'</span></label>').join('')+'</fieldset>')+
   '<button type="button" data-v3-begin="'+id+'" class="cp-primary" '+(gift&&!summary.giftReady?'disabled':'')+'>'+(gift?'Mở quà khám phá':'Bắt đầu chơi')+'</button>'+
   '<small>Điểm, sao và huy hiệu chỉ là dữ liệu demo; không đổi thành tiền.</small></div></div>';
  root.append(panel);
  panel.addEventListener('click',e=>{
    if(e.target===panel){removePanel();}
  });
  panel.querySelector('[data-v3-close]').focus({preventScroll:true});scheduleFit();
 }
 function showHUD(){
  const session=root.querySelector('.cp-session');if(!session||session.querySelector('.cp3-hud')||session.querySelector('.cp-result'))return;
  const s=meta.summary();
  const header=session.querySelector('.cp-session-header');
  if(!header)return;
  const bar=document.createElement('div');bar.className='cp3-hud';bar.innerHTML=
   '<div><strong>'+icon('award')+' '+escape(s.level.name)+'</strong><span>'+s.xp+' XP</span></div>'+
   '<div><strong>'+icon('check')+' '+s.stars+' sao</strong><span>'+escape(pendingLevel==='easy'?'Dễ':pendingLevel==='hard'?'Khó':'Thường')+'</span></div>'+
   '<div><strong>'+icon('timer')+' '+s.streak+' ngày</strong><span>Chuỗi khám phá</span></div>';
  header.insertAdjacentElement('afterend',bar);
 }
 function onLegacyResult(){
  const result=root.querySelector('.cp-result');
  if(!result||!currentAttempt||result.querySelector('.cp3-result-summary'))return;
  const text=result.querySelector('h1')?.textContent||'';
  const won=text.startsWith('Hoàn thành');
  const s=root.__chamPlayState?.().state||window.CHAMPlayQA?.getState()?.state||{};
  const gameId=currentAttempt.gameId;
  const data={
   ...currentAttempt,gameId,won,correct:s.correct||0,
   total:s.questions?.length||5,moves:s.turns||0,pairs:s.target||4,
   mistakes:s.misses||0,seconds:Math.round((Date.now()-currentAttempt.startedAt)/1000)
  };
  record(data);currentAttempt=null;
  const stars=getStars(data),summary=meta.summary();
  // Legacy result already renders its cover.
  const block=document.createElement('div');block.className='cp3-result-summary';
  block.innerHTML='<div class="cp3-stars" aria-label="'+stars+' trên 3 sao">'+
    [0,1,2].map(i=>'<span class="'+(i<stars?'is-full':'')+'">★</span>').join('')+'</div>'+
    '<p>Thành tích demo: '+stars+' sao · '+summary.xp+' XP tích lũy · '+escape(summary.level.name)+'</p>';
  result.querySelector('h1')?.insertAdjacentElement('afterend',block);
 }
 function renderPack(){
  if(!activeGame||activeGame.gameId!=='pack')return;
  const s=activeGame.state,p=s.queue[s.index],last=s.selected!==null;
  if(!p){finishPack();return;}
  const sessionHTML='<div class="cp-app cp-session cp3-session"><header class="cp-session-header">'+
    '<button type="button" data-v3-back class="cp-back">Trở về trò chơi</button>'+
    '<div class="cp-session-copy"><span>Thử thách mô phỏng</span><h1>Đóng gói đơn hàng</h1><p>Chọn phương án bảo vệ sản phẩm thích hợp. Đây là tình huống học tập giả lập, không phải quy trình vận chuyển thực tế của CHẠM.</p></div>'+
    '<div class="cp-session-wallet"><strong>'+(s.index+1)+'/4</strong><span>Đơn hàng demo</span></div></header>'+
    '<div class="cp4-session-illustration">'+img('pack')+'</div><div class="cp3-pack-layout"><section class="cp-board cp3-pack-board">'+
    '<div class="cp-board__top"><strong>Đơn hàng '+(s.index+1)+'</strong><span>Đúng '+s.correct+' · Sai '+s.mistakes+'</span></div>'+
    '<div class="cp-progress"><div style="width:'+(s.index/4*100)+'%"></div></div>'+
    '<div class="cp3-parcel"><span class="cp3-parcel__icon">'+icon('layers')+'</span>'+
    '<p>Chuẩn bị gửi sản phẩm</p><h2>'+escape(p.product)+'</h2>'+
    '<span>'+escape(p.craft)+' · '+escape(p.village)+'</span></div>'+
    '<h3>Chọn vật liệu bảo vệ phù hợp</h3><div class="cp3-pack-options">'+
      pack.PACKAGES.map(op=>'<button type="button" data-v3-pack="'+op.id+'" '+(last?'disabled':'')+
       ' class="cp3-package '+(last&&s.selected===op.id?'is-selected':'')+(last&&p.answer===op.id?' is-correct':'')+'">'+
       '<strong>'+escape(op.name)+'</strong><small>'+escape(op.hint)+'</small></button>').join('')+'</div>'+
    (last?'<div class="cp3-pack-feedback" role="status"><strong>'+(s.selected===p.answer?'Lựa chọn phù hợp':'Cần điều chỉnh')+'</strong>'+
      '<p>Gợi ý: '+escape(pack.PACKAGES.find(x=>x.id===p.answer)?.hint)+'</p>'+
      '<button type="button" class="cp-primary" data-v3-next-pack>'+(s.index===3?'Xem kết quả':'Đơn tiếp theo')+'</button></div>':'')+
    '</section><aside class="cp3-side"><p class="cp-eyebrow">Mẹo đóng gói</p><h2>Bảo vệ trước khi vận chuyển.</h2>'+
    '<p>Các lựa chọn nhằm thực hành tư duy về kích thước, chất liệu và mức độ dễ vỡ. Không đại diện tiêu chuẩn kỹ thuật hay dịch vụ giao hàng CHẠM.</p></aside></div></div>';
  root.__cpRenderSession(sessionHTML,'pack');
 }
 function finishPack(){
  const s=activeGame.state;
  const won=s.correct>=3;
  const data={...currentAttempt,gameId:'pack',won,packState:s,correct:s.correct,total:4,mistakes:s.mistakes};
  if(won)core.gameAward(6);
  record(data);currentAttempt=null;
  const stars=getStars(data);
  showOwnResult('pack',won,'Đúng '+s.correct+'/4 đơn hàng. '+(won?'Bạn đã hoàn thành vòng đóng gói.':'Hãy thử lại để luyện tập.'),stars);
 }
 function renderWheel(){
  if(!activeGame||activeGame.gameId!=='wheel')return;
  const s=activeGame.state,summary=meta.summary(),spinning=s.spinning;
  const secs=wheel.segments;
  const angle=(spinning||s.finished)?360*4-360*(s.index/secs.length)-30:0;
  const sessionHTML='<div class="cp-app cp-session cp3-session"><header class="cp-session-header">'+
   '<button type="button" data-v3-back class="cp-back">Trở về trò chơi</button>'+
   '<div class="cp-session-copy"><span>Quà sưu tầm · Demo</span><h1>Vòng khám phá</h1>'+
   '<p>Hoàn thành hai nhiệm vụ hằng ngày để mở một huy hiệu. Không phải vòng quay đổi tiền hoặc voucher.</p></div></header>'+
   '<div class="cp4-session-illustration">'+img('wheel')+'</div><div class="cp3-wheel-layout"><section class="cp-board"><div class="cp3-wheel-wrap">'+
   '<span class="cp3-wheel-pointer" aria-hidden="true">▼</span>'+
   '<div class="cp3-wheel-disc '+(spinning?'is-spinning':'')+'" style="--cp3-rotation:'+angle+'deg" aria-label="Sáu biểu tượng vật liệu tự nhiên">'+
   secs.map((x,i)=>'<span style="--n:'+i+'">'+escape(x.label)+'</span>').join('')+'</div></div>'+
   '<p class="cp3-wheel-note">'+(s.finished?'Đã mở được huy hiệu khám phá hôm nay.':
     summary.giftReady?'Quà đã sẵn sàng. Hãy mở để xem biểu tượng sản phẩm hôm nay.':
     summary.giftClaimed?'Bạn đã nhận quà hôm nay.':'Hoàn thành thêm nhiệm vụ để mở quà.')+'</p>'+
   '<button type="button" class="cp-primary" data-v3-spin '+(!s.ready||s.claimed||spinning?'disabled':'')+'>'+
   (s.finished?'Đã nhận quà':'Mở quà hôm nay')+'</button></section>'+
   '<aside class="cp3-side"><h2>Không có phần thưởng ngẫu nhiên mang giá trị thật.</h2>'+
   '<p>Vòng khám phá giới thiệu một biểu tượng văn hóa theo ngày. Dữ liệu sưu tầm được lưu trên thiết bị này.</p>'+
   '<p>Nhiệm vụ đã xong: '+summary.missions.filter(x=>x.done).length+' / '+summary.missions.length+'</p></aside></div></div>';
  root.__cpRenderSession(sessionHTML,'wheel');
 }
 function finishWheel(){
  const s=activeGame.state;
  wheel.stop(s);renderWheel();
  const segment=wheel.segments[s.index];
  const d={...currentAttempt,gameId:'wheel',won:true,correct:0,total:1,stars:1};
  record(d);currentAttempt=null;
  const msg='Huy hiệu demo hôm nay: '+segment.label+'. Không thể chuyển nhượng hoặc đổi thành tiền.';
  showOwnResult('wheel',true,msg,1);
 }
 function showOwnResult(game,won,message,stars){
  root.innerHTML='<div class="cp-app cp-session cp3-session"><header class="cp-session-header"><button type="button" data-v3-back class="cp-back">Trò chơi</button></header>'+
    '<section class="cp-result cp3-own-result">'+
    '<div class="cp4-result-cover">'+img(game)+'</div><div class="cp-result__symbol">'+icon(won?'award':'retry')+'</div><h1>'+(won?'Hoàn thành ':'Thử lại ')+escape(names[game])+'</h1>'+
    '<div class="cp3-stars" aria-label="'+stars+' sao">'+[0,1,2].map(i=>'<span class="'+(i<stars?'is-full':'')+'">★</span>').join('')+'</div>'+
    '<p>'+escape(message)+'</p>'+
    '<p class="cp-result__award">Sao và huy hiệu chỉ dùng để theo dõi trải nghiệm. '+(game==='wheel'?'Không có điểm CHẠM được cộng từ vòng quay.':'Nếu đủ điều kiện, ví CHẠM chỉ được cộng thưởng game một lần/ngày.')+'</p>'+
    '<div class="cp-result__actions"><button type="button" class="cp-primary" data-v3-replay="'+game+'">'+(game==='wheel'?'Xem lại':'Chơi lại')+'</button>'+
    '<button type="button" class="cp-secondary" data-v3-back>Chọn trò khác</button></div></section></div>';
  scrollToTop();
 }
 function refresh(){
  if(panel)return;
  if(root.querySelector('.cp-hub')){lobby();return;}
  if(activeGame?.gameId==='pack'||activeGame?.gameId==='wheel')return;
  if(root.querySelector('.cp-result')){onLegacyResult();return;}
  showHUD();
 }
 // Session viewport controller. The lobby stays scrollable; games occupy the viewport.
 let fitFrame=0,fitSession=null,fitStage=null,locked=false,returnY=0;
 const patchNode=(old,next)=>{
  if(old.nodeType!==next.nodeType||old.nodeName!==next.nodeName){old.replaceWith(next.cloneNode(true));return;}
  if(old.nodeType===3){if(old.nodeValue!==next.nodeValue)old.nodeValue=next.nodeValue;return;}
  if(old.nodeType!==1)return;
  for(const a of [...old.attributes])if(!next.hasAttribute(a.name))old.removeAttribute(a.name);
  for(const a of [...next.attributes])if(old.getAttribute(a.name)!==a.value)old.setAttribute(a.name,a.value);
  const before=[...old.childNodes],after=[...next.childNodes];
  after.forEach((n,i)=>{if(before[i])patchNode(before[i],n);else old.append(n.cloneNode(true));});
  before.slice(after.length).forEach(n=>n.remove());
 };
 root.__cpRenderSession=(html,id)=>{
  const current=root.querySelector('.cp-session');
  if(current?.dataset.cpGameId===id&&!current.querySelector('.cp-result')){
   const template=document.createElement('template');template.innerHTML=html;
   const next=template.content.querySelector('.cp-session');
   const oldBoard=current.querySelector('.cp-board'),newBoard=next?.querySelector('.cp-board');
   if(oldBoard&&newBoard){patchNode(oldBoard,newBoard);
    const oldWallet=current.querySelector('.cp-session-wallet'),newWallet=next.querySelector('.cp-session-wallet');
    if(oldWallet&&newWallet)patchNode(oldWallet,newWallet);
    scheduleFit();return;}
  }
  root.innerHTML=html;const session=root.querySelector('.cp-session');if(session)session.dataset.cpGameId=id;
  scheduleFit();
 };
 function scheduleFit(){if(!fitFrame)fitFrame=requestAnimationFrame(()=>{fitFrame=0;fitViewport();});}
 function fitViewport(){
  const session=root.querySelector('.cp-session'),dialog=root.querySelector('.cp3-dialog');
  const shouldLock=Boolean(session||dialog);
  if(shouldLock&&!locked){returnY=window.scrollY;locked=true;document.documentElement.classList.add('cp-viewport-lock');document.body.classList.add('cp-viewport-lock');}
  if(!shouldLock&&locked){locked=false;document.documentElement.classList.remove('cp-viewport-lock');document.body.classList.remove('cp-viewport-lock');window.scrollTo(0,returnY);}
  if(session){
   if(session!==fitSession){fitSession=session;fitStage=document.createElement('div');fitStage.className='cp-fit-stage';while(session.firstChild)fitStage.append(session.firstChild);session.append(fitStage);}
   const h=session.clientHeight,w=session.clientWidth;
   const naturalH=fitStage.offsetHeight,naturalW=fitStage.offsetWidth;
   const scale=Math.min(1,Math.max(0.01,(h-2)/Math.max(1,naturalH)),Math.max(0.01,w/Math.max(1,naturalW)));
   fitStage.style.setProperty('--cp-fit-scale',String(scale));
   const isMemory=session.dataset.cpGameId==='memory';
   const offset=isMemory?Math.max(0,Math.min((h-naturalH*scale)*.40,h*.12)):0;
   fitStage.style.marginTop=offset+'px';
  }else{fitSession=null;fitStage=null;}
  if(dialog){const parent=dialog.parentElement;const scale=Math.min(1,(parent.clientHeight-20)/Math.max(1,dialog.offsetHeight),(parent.clientWidth-20)/Math.max(1,dialog.offsetWidth));dialog.style.setProperty('--cp-dialog-scale',String(Math.max(.01,scale)));}
 }
 window.addEventListener('resize',scheduleFit,{passive:true});
 window.visualViewport?.addEventListener('resize',scheduleFit,{passive:true});
 document.fonts?.ready.then(scheduleFit);
 let queued=false;
 function queue(){
  if(queued)return;queued=true;
  Promise.resolve().then(()=>{queued=false;refresh();scheduleFit();});
 }
 observer=new MutationObserver(queue);
 observer.observe(root,{childList:true,subtree:true});
 root.addEventListener('click',event=>{
  const t=event.target.closest('button');
  if(!t)return;
  if(t.hasAttribute('data-v3-filter')){
   event.preventDefault();event.stopImmediatePropagation();
   const type=t.dataset.v3Filter,hub=root.querySelector('.cp-hub'),grid=hub?.querySelector('.cp-grid');
   if(!grid)return;
   hub.querySelectorAll('.cp-filter').forEach(el=>{
    el.classList.toggle('is-active',el===t);el.setAttribute('aria-pressed',el===t?'true':'false');
   });
   grid.innerHTML=extraCard(type);return;
  }
  if(t.hasAttribute('data-cp-game')&&!t.hasAttribute('data-v3-bypass')&&(root.querySelector('.cp-hub')||root.querySelector('.cp-result'))){
   event.preventDefault();event.stopImmediatePropagation();intro(t.dataset.cpGame);return;
  }
  if(t.hasAttribute('data-v3-close')){event.preventDefault();event.stopImmediatePropagation();removePanel();return;}
  if(t.hasAttribute('data-v3-begin')){
   event.preventDefault();event.stopImmediatePropagation();
   const id=t.dataset.v3Begin;
   pendingLevel=panel?.querySelector('input[name="cp3-level"]:checked')?.value||'normal';
   window.CHAMPlayDifficulty=pendingLevel;
   removePanel();
   activeGame=null;currentAttempt={attemptId:attemptId(),startedAt:startMs(),gameId:id};
   if(id==='pack'){
    activeGame={gameId:'pack',state:pack.create(facts)};
    renderPack();scrollToTop();return;
   }
   if(id==='wheel'){
    activeGame={gameId:'wheel',state:wheel.create(meta.summary(),meta.dateKey())};
    renderWheel();scrollToTop();return;
   }
   const relay=document.createElement('button');relay.type='button';
   relay.dataset.cpGame=id;relay.setAttribute('data-v3-bypass','');
   relay.hidden=true;root.append(relay);relay.click();relay.remove();
   return;
  }
  if(t.hasAttribute('data-v3-back')){
   event.preventDefault();event.stopImmediatePropagation();
   if(pendingTimer){clearTimeout(pendingTimer);pendingTimer=null;}
   activeGame=null;currentAttempt=null;
   const back=root.querySelector('[data-cp-back]');
   if(back){back.click();}else{
    // Legacy hub is accessible through the intercepted original mount.
    const backUp=document.createElement('button');
    backUp.dataset.cpBack='';root.append(backUp);backUp.click();backUp.remove();
   }
   return;
  }
  if(t.hasAttribute('data-v3-replay')){
   event.preventDefault();event.stopImmediatePropagation();
   const id=t.dataset.v3Replay;
   if(id==='wheel'){activeGame={gameId:'wheel',state:wheel.create(meta.summary(),meta.dateKey())};renderWheel();return;}
   currentAttempt={attemptId:attemptId(),gameId:id,startedAt:startMs()};
   activeGame={gameId:id,state:pack.create(facts)};renderPack();return;
  }
  if(activeGame?.gameId==='pack'){
   if(t.hasAttribute('data-v3-pack')){event.preventDefault();event.stopImmediatePropagation();pack.select(activeGame.state,t.dataset.v3Pack);renderPack();return;}
   if(t.hasAttribute('data-v3-next-pack')){event.preventDefault();event.stopImmediatePropagation();
    const over=pack.next(activeGame.state);if(over)finishPack();else renderPack();return;
   }
  }
  if(activeGame?.gameId==='wheel'&&t.hasAttribute('data-v3-spin')){
   event.preventDefault();event.stopImmediatePropagation();
   const result=wheel.spin(activeGame.state,meta);
   if(!result.ok)return;
   renderWheel();
   pendingTimer=setTimeout(()=>{pendingTimer=null;if(activeGame?.gameId==='wheel')finishWheel();},1150);
  }
 },true);
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&panel){removePanel();return;}
 });
 const onNewDay=()=>{if(root.querySelector('.cp-hub')){const dashboard=root.querySelector('.cp3-dashboard');dashboard?.remove();queue();}};
 window.addEventListener('focus',onNewDay);
 queue();
 if(['localhost','127.0.0.1'].includes(location.hostname)){
  window.CHAMPlayV3QA={intro,summary:()=>meta.summary(),getCurrent:()=>({currentAttempt,activeGame})};
 }
}
window.CHAMQuest.mount=mount;
})();