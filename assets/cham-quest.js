/* CHẠM Play — five distinct craft mini games, no mascot/scenery dependencies.
   Uses the browser-local CHAMDemo wallet; at most one demo game reward per day. */
(() => {
  'use strict';
  const $=(s,p=document)=>p.querySelector(s);
  const $$=(s,p=document)=>Array.from(p.querySelectorAll(s));
  const shuffle=(arr)=>{const out=[...arr];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const games=[
    {id:'memory',name:'Ghép cặp thủ công',type:'Trí nhớ',time:'2–3 phút',description:'Lật các thẻ và tìm đúng cặp sản phẩm thủ công.',art:'memory',detail:'3 độ khó · 4–6 cặp'},
    {id:'quiz',name:'Đoán sản phẩm',type:'Kiến thức',time:'2–3 phút',description:'Chọn câu trả lời đúng từ danh mục CHẠM.',art:'quiz',detail:'5 câu hỏi'},
    {id:'match',name:'Nối chất liệu',type:'Ghép nối',time:'3 phút',description:'Ghép ứng dụng với chất liệu tương ứng.',art:'match',detail:'5 cặp tương ứng'},
    {id:'word',name:'Ô chữ chất liệu',type:'Giải đố',time:'3–5 phút',description:'Tìm tên chất liệu và sản phẩm trong bảng chữ.',art:'word',detail:'5 từ cần tìm'},
    {id:'speed',name:'Thử thách nhanh',type:'Thời gian',time:'45 giây',description:'Trả lời năm câu hỏi trước khi hết thời gian.',art:'speed',detail:'5 câu · 45 giây'}
  ];
  const normalize=v=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toUpperCase();
  const WORDS=[
    {word:'DUA',label:'Dừa',hint:'Nguồn xơ dừa',row:0,col:1,axis:'h'},
    {word:'GOM',label:'Gốm',hint:'Nhóm vật dụng từ đất tạo hình',row:1,col:4,axis:'v'},
    {word:'TRE',label:'Tre',hint:'Vật liệu dạng nan đan',row:4,col:1,axis:'h'},
    {word:'COI',label:'Cói',hint:'Sợi thực vật dùng đan chiếu',row:5,col:4,axis:'h'},
    {word:'MAY',label:'Mây',hint:'Vật liệu đan giỏ và ghế',row:7,col:0,axis:'h'}
  ];
  const size=8;
  function wordGrid(){
    const cells=Array(size*size).fill(null),wordPositions={};
    // Choose non-overlapping randomized paths; preserve a guaranteed fallback.
    let success=true;
    for(const w of shuffle(WORDS)){
      const options=[];
      for(let row=0;row<size;row++)for(let col=0;col<size;col++){
        for(const [dr,dc] of [[0,1],[1,0],[0,-1],[-1,0]]){
          const path=[...w.word].map((_,i)=>[row+dr*i,col+dc*i]);
          if(path.every(([r,c])=>r>=0&&r<size&&c>=0&&c<size&&cells[r*size+c]===null))
            options.push(path.map(([r,c])=>r*size+c));
        }
      }
      if(!options.length){success=false;break;}
      const selected=shuffle(options)[0];
      wordPositions[w.word]=selected;
      selected.forEach((pos,i)=>{cells[pos]=w.word[i];});
    }
    if(!success){
      cells.fill(null);
      WORDS.forEach(({word,row,col,axis})=>{
        const positions=[...word].map((_,i)=>(row+(axis==='v'?i:0))*size+col+(axis==='h'?i:0));
        wordPositions[word]=positions;
        positions.forEach((pos,i)=>{cells[pos]=word[i];});
      });
    }
    const filler='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for(let i=0;i<cells.length;i++)if(!cells[i])cells[i]=filler[Math.floor(Math.random()*filler.length)];
    return {letters:cells,wordPositions};
  }
  function mount(root,core){
    if(!root||!core)return;
    const facts=window.CHAMCraftKnowledge;
    const assets=(()=>{try{return JSON.parse($('#cham-play-assets')?.textContent||'{}')}catch(_){return {}}})();
    const craftRecords=Array.isArray(facts?.records)?facts.records:[];
    if(craftRecords.length<5){
      root.innerHTML='<div class="cp-error" role="alert">Chưa tải được dữ liệu câu hỏi. Vui lòng tải lại trang.</div>';
      return;
    }
    let kind='hub',state={},timer=null,delay=null,destroyed=false;
    root.__chamPlayState=()=>({kind,state});
    let completed=new Set();
    try{completed=new Set(JSON.parse(sessionStorage.getItem('cham-play-finished-v1')||'[]'))}catch(_){}
    const claimed=()=>core.getState().ledger.some(l=>l.id==='game:'+core.dateKey());
    function stopTimers(){
      if(timer){clearInterval(timer);timer=null;}
      if(delay){clearTimeout(delay);delay=null;}
    }
    const stopUI=()=>{stopTimers();state={};};
    const progress=(done,total)=>'<div class="cp-progress" aria-label="Tiến trình: '+done+'/'+total+'"><div style="width:'+((done/total)*100).toFixed(2)+'%"></div></div>';
    const gameHeading=(game)=>'<header class="cp-session-header"><button type="button" class="cp-back" data-cp-back>'+icon('back')+' Trở về trò chơi</button><div class="cp-session-copy"><span>'+esc(game.type)+'</span><h1>'+esc(game.name)+'</h1><p>'+esc(game.description)+'</p></div><div class="cp-session-wallet"><strong>'+core.points()+'</strong><span>Điểm demo</span></div></header>';
    const avatar=(id,priority=false)=>assets[id]?'<img src="'+esc(assets[id])+'" '+(priority?'loading="eager" fetchpriority="high"':'loading="lazy"')+' decoding="async" alt="">':'';
    const icon=(id,cls='')=>assets['icon-'+id]?'<img class="cp-icon '+cls+'" src="'+esc(assets['icon-'+id])+'" alt="" aria-hidden="true">':'';
    const craftIcon=id=>'layers';
    const jumpToApp=()=>{};
    const gameRules={memory:'Lật hai thẻ. Cặp giống nhau được giữ lại; cặp sai sẽ úp lại.',quiz:'Chọn đáp án, đọc giải thích rồi tiếp tục. Đúng ít nhất 3/5 câu.',match:'Chọn ứng dụng ở cột trái rồi chọn chất liệu tương ứng.',word:'Chọn chữ đầu và chữ cuối của từ theo hàng ngang hoặc dọc.',speed:'Đúng ít nhất 3/5 câu trong 45 giây trả lời. Đồng hồ dừng khi đọc giải thích.'};
    const difficulty={memory:'Dễ',quiz:'Vừa',match:'Dễ',word:'Vừa',speed:'Nhanh'};
    function hub(filter='Tất cả'){
      kind='hub';stopUI();
      const categories=['Tất cả','Trí nhớ','Kiến thức','Ghép nối','Giải đố','Thời gian'];
      const cards=games.filter(g=>filter==='Tất cả'||g.type===filter).map(g=>
        '<article class="cp-card"><button type="button" class="cp-card__open" data-cp-game="'+g.id+'" aria-label="Chơi '+esc(g.name)+'">'+
          '<span class="cp-card__media cp-card__media--'+g.art+'">'+avatar(g.art)+'<span class="cp-card__level">'+difficulty[g.id]+'</span>'+(completed.has(g.id)?'<span class="cp-card__done">'+icon('check')+' Đã chơi</span>':'')+'</span>'+
          '<span class="cp-card__content"><span class="cp-card__category">'+esc(g.type)+' · '+esc(g.time)+'</span>'+
          '<strong>'+esc(g.name)+'</strong><span class="cp-card__description">'+esc(g.description)+'</span>'+
          '<span class="cp-card__bottom"><span>'+esc(g.detail)+'</span><span class="cp-card__action">'+(completed.has(g.id)?'Chơi lại':'Chơi ngay')+'</span></span></span>'+
        '</button></article>').join('');
      const tabs=categories.map(c=>'<button type="button" class="cp-filter'+(filter===c?' is-active':'')+'" data-cp-filter="'+c+'" aria-pressed="'+(filter===c)+'">'+c+'</button>').join('');
      root.innerHTML='<div class="cp-app cp-hub">'+
        '<section class="cp-hero"><div class="cp-hero__copy"><p class="cp-eyebrow">CHẠM Play</p><h1>Khám phá trò chơi</h1>'+
        '<p>Bảy trải nghiệm, nhiều cách tìm hiểu sản phẩm thủ công.</p>'+
        '<div class="cp-hero__links"><a href="/pages/cham-club?tab=rewards" class="cp-quiet-link">Xem điểm và phần thưởng</a></div></div>'+
        '<div class="cp-hero__photo cp4-hero-gallery" aria-label="Tuyển tập trò chơi CHẠM Play">'+
         '<span class="cp4-hero-gallery__back">'+avatar('quiz')+'</span>'+
         '<span class="cp4-hero-gallery__main">'+avatar('memory',true)+'</span>'+
         '<span class="cp4-hero-gallery__front">'+avatar('pack')+'</span>'+
         '</div></section>'+
        '<section class="cp-summary" aria-label="Tổng quan điểm thưởng"><div><span>'+icon('coin')+' Điểm của bạn</span><strong data-cp-wallet>'+core.points()+'</strong></div>'+
        '<div><span>Trò đã hoàn thành trong phiên</span><strong>'+completed.size+' / 5</strong></div>'+
        '<div><span>Thưởng trò chơi hôm nay</span><strong>'+(claimed()?'Đã nhận':'Chưa nhận')+'</strong></div>'+
        '<p>Chỉ là điểm và voucher mô phỏng lưu trên trình duyệt. Hoàn thành trò chơi đủ điều kiện để nhận tối đa 20 điểm demo mỗi ngày.</p></section>'+
        '<section id="cp-games" class="cp-games"><div class="cp-section-head"><h2>Chọn trò chơi</h2><p>Chọn một cách khám phá phù hợp. Không cần cài đặt.</p></div>'+
        '<div class="cp-filter-row" role="group" aria-label="Lọc trò chơi">'+tabs+'</div>'+
        '<div class="cp-grid">'+cards+'</div></section>'+
        '<section class="cp-foot"><div><h2>Hiểu món đồ trước khi lựa chọn.</h2><p>Tìm hiểu câu chuyện chất liệu và cách thực hiện trên CHẠM.</p></div>'+
        '<a href="/collections/all" class="cp-quiet-link">Xem sản phẩm</a></section></div>';
      root.dispatchEvent(new CustomEvent('cham:play-rendered',{bubbles:true}));
    }
    function start(id){
      const game=games.find(g=>g.id===id);if(!game)return;
      kind=id;stopUI();
      if(id==='memory'){
        const difficulty=window.CHAMPlayDifficulty||'easy';
        const target=difficulty==='hard'?6:difficulty==='normal'?5:4;
        const verified=shuffle(craftRecords).map(r=>({id:r.id,label:r.craft}));
        const more=shuffle(craftRecords).slice(0,2).map(r=>({id:'material-'+r.id,label:r.material}));
        const pairs=[...verified,...more].slice(0,target);
        state={deck:shuffle(pairs.flatMap(p=>[0,1].map((_,idx)=>({...p,instance:p.id+'-'+idx})))),open:[],found:new Set(),turns:0,locked:false,target,combo:0,bestCombo:0,errors:0,startedAt:Date.now()};
      }else if(id==='quiz'||id==='speed'){
        const difficulty=window.CHAMPlayDifficulty||'normal';
        const limit=id==='speed'?(difficulty==='easy'?60:difficulty==='hard'?30:45):45;
        const count=id==='quiz'&&difficulty==='easy'?3:5;
        state={questions:facts.generateRun(count).map(x=>facts.buildQuestion(x)),index:0,correct:0,answer:null,remaining:limit,limit,streak:0,bestStreak:0};
      }else if(id==='match'){
        const pairs=shuffle(craftRecords).slice(0,5);
        state={left:pairs,right:shuffle(pairs),selected:null,found:new Set(),misses:0};
      }else if(id==='word'){
        state={...wordGrid(),selected:null,found:new Set(),foundPositions:new Set(),attempts:0,
          hints:window.CHAMPlayDifficulty==='hard'?0:window.CHAMPlayDifficulty==='normal'?1:2,
          hintPositions:new Set()};
      }
      render();jumpToApp();
      if(id==='speed')startClock();
    }
    function outcome(won,message){
      stopTimers();
      const game=games.find(g=>g.id===kind);
      const type=kind;
      let reward=false;
      if(won){
        completed.add(type);
        try{sessionStorage.setItem('cham-play-finished-v1',JSON.stringify([...completed]))}catch(_){}
        reward=core.gameAward(type==='memory'?Math.max(1,state.turns):Math.max(1,state.correct||state.attempts||5));
      }
      kind='result';
      root.innerHTML='<div class="cp-app cp-session"><header class="cp-session-header"><button type="button" data-cp-back class="cp-back">'+icon('back')+' Tất cả trò chơi</button></header>'+
        '<section class="cp-result"><div class="cp4-result-cover">'+avatar(type)+'</div><div class="cp-result__symbol" aria-hidden="true">'+icon(won?'award':'retry')+'</div><h1>'+(won?'Hoàn thành '+esc(game.name):'Thử lại '+esc(game.name))+'</h1>'+
        '<p>'+esc(message)+'</p>'+
        '<p class="cp-result__award">'+(won?(reward?'Bạn vừa nhận 20 điểm CHẠM demo.':'Đã hoàn thành. Phần thưởng demo hôm nay chỉ được nhận một lần.'):'Chơi lại để hoàn thành thử thách. Không có điểm bị trừ.')+'</p>'+
        '<div class="cp-result__actions"><button type="button" class="cp-primary" data-cp-game="'+type+'">Chơi lại</button><button type="button" class="cp-secondary" data-cp-back>Chọn trò khác</button><a class="cp-quiet-link" href="/pages/cham-club?tab=rewards">Ví điểm demo</a></div></section></div>';
      jumpToApp();
    }
    function render(){
      const game=games.find(g=>g.id===kind);if(!game)return;
      const active=document.activeElement;
      const activeAttr=active&&root.contains(active)?[...active.attributes].find(a=>/^data-cp-(memory|choice|left|right|cell|next|word-clear)$/.test(a.name)):null;
      let body='';
      if(kind==='memory'){
        const s=state;
        body='<div class="cp-board"><div class="cp-board__top"><strong>Ghép hai thẻ giống nhau</strong><span>'+s.found.size+'/'+s.target+' cặp · '+s.turns+' lượt</span></div>'+
          progress(s.found.size,s.target)+
          '<p class="cp-help cp-combo">Liên tiếp '+s.combo+' cặp · Kỷ lục '+s.bestCombo+' · Sai '+s.errors+'</p><div class="cp-memory-grid cp-memory-grid--'+s.target+'">'+s.deck.map((card,i)=>{
            const shown=s.open.includes(i)||s.found.has(card.id);
            return '<button class="cp-memory-cell'+(shown?' is-revealed':'')+(s.found.has(card.id)?' is-matched':'')+'" data-cp-memory="'+i+'" type="button" '+(s.found.has(card.id)?'disabled':'')+' aria-label="Thẻ '+(i+1)+(shown?': '+esc(card.label):': đang úp')+'"><span>'+ (shown?'<span class="cp4-memory-face-title">'+esc(card.label)+'</span>':'<span class="cp4-memory-face-back"><b>CHẠM</b><small>CHẠM</small></span>')+'</span></button>';
          }).join('')+'</div><p class="cp-help" role="status">Lật từng cặp thẻ. Hoàn thành khi tìm đủ '+s.target+' cặp.</p></div>';
      }
      if(kind==='quiz'||kind==='speed'){
        const s=state,q=s.questions[s.index];
        body='<div class="cp-board cp-quiz"><div class="cp-board__top"><strong>Câu hỏi '+(s.index+1)+'/'+s.questions.length+'</strong>'+
          '<span>'+(kind==='speed'?'<span class="cp-clock" data-cp-clock aria-live="off">'+icon('timer')+' <b data-cp-seconds>'+Math.ceil(s.remaining)+'</b> giây</span>':'Đúng '+s.correct+' câu · Chuỗi '+s.streak)+'</span></div>'+
          progress(s.index,s.questions.length)+(kind==='speed'?'<div class="cp-timebar" aria-hidden="true"><span data-cp-timebar style="width:'+(s.remaining/s.limit*100)+'%"></span></div>':'')+'<p class="cp-question-type">'+esc(q.kind)+'</p><h2>'+esc(q.question)+'</h2>'+
          '<div class="cp-options">'+q.options.map((o,i)=>{
            const selected=s.answer===i,answered=s.answer!==null,correct=i===q.answerIndex;
            return '<button type="button" data-cp-choice="'+i+'" '+(answered?'disabled':'')+' class="cp-option'+(answered&&correct?' is-correct':'')+(answered&&selected&&!correct?' is-wrong':'')+'"><span>'+String.fromCharCode(65+i)+'</span>'+esc(o)+'</button>';
          }).join('')+'</div>'+
          (s.answer!==null?'<div class="cp-feedback" role="status"><strong>'+(s.answer===q.answerIndex?'Chính xác':'Chưa đúng')+'</strong><p>'+esc(q.explanation)+'</p>'+
          (q.source?'<a href="'+esc(q.source)+'" target="_blank" rel="noopener noreferrer">Nguồn tham khảo</a>':'')+
          '<button type="button" data-cp-next class="cp-primary">'+(s.index===s.questions.length-1?'Xem kết quả':'Câu tiếp theo')+'</button></div>':'<p class="cp-help">Chọn một đáp án để tiếp tục.</p>')+
          '</div>';
      }
      if(kind==='match'){
        const s=state;
        const left=s.left.map(p=>'<button type="button" data-cp-left="'+esc(p.id)+'" '+(s.found.has(p.id)?'disabled':'')+' class="cp-match-option'+(s.selected===p.id?' is-selected':'')+(s.found.has(p.id)?' is-found':'')+'">'+icon(craftIcon(p.id))+esc(p.craft)+(s.found.has(p.id)?'<span class="cp-pair-id">'+([...s.found].indexOf(p.id)+1)+'</span>':'')+'</button>').join('');
        const right=s.right.map(p=>'<button type="button" data-cp-right="'+esc(p.id)+'" '+(s.found.has(p.id)?'disabled':'')+' class="cp-match-option'+(s.found.has(p.id)?' is-found':'')+'">'+esc(p.material)+(s.found.has(p.id)?'<span class="cp-pair-id">'+([...s.found].indexOf(p.id)+1)+'</span>':'')+'</button>').join('');
        body='<div class="cp-board"><div class="cp-board__top"><strong>'+icon('link')+' Ứng dụng và chất liệu</strong><span>'+s.found.size+'/5 cặp</span></div>'+progress(s.found.size,5)+
          '<p class="cp-help">Chọn ứng dụng bên trái, sau đó chọn chất liệu tương ứng bên phải.</p>'+
          '<div class="cp-match-grid"><div><h2>Ứng dụng</h2>'+left+'</div><div><h2>Chất liệu</h2>'+right+'</div></div>'+
          '<p class="cp-help" role="status">'+(s.selected?'Đã chọn ứng dụng. Hãy chọn chất liệu.':'Các cặp đúng sẽ được giữ lại.')+'</p></div>';
      }
      if(kind==='word'){
        const s=state;
        body='<div class="cp-board"><div class="cp-board__top"><strong>'+icon('grid')+' Tìm các từ trong bảng chữ</strong><span>'+s.found.size+'/5 từ</span></div>'+progress(s.found.size,5)+
          '<p class="cp-help">Chạm chữ đầu và chữ cuối của một từ theo hàng ngang hoặc cột dọc. Có thể chọn theo chiều ngược lại.</p>'+
          '<div class="cp-word-layout"><div class="cp-word-grid" role="group" aria-label="Bảng ô chữ">'+s.letters.map((c,i)=>
            '<button type="button" data-cp-cell="'+i+'" class="cp-word-cell'+(s.foundPositions.has(i)?' is-found':'')+(s.hintPositions.has(i)?' is-hint':'')+(s.selected===i?' is-selected':'')+'" aria-label="Hàng '+(Math.floor(i/size)+1)+', cột '+(i%size+1)+', chữ '+c+'">'+c+'</button>').join('')+'</div>'+
          '<div class="cp-word-clues"><h2>Từ cần tìm</h2>'+WORDS.map(w=>'<p class="'+(s.found.has(w.word)?'is-found':'')+'"><strong>'+esc(w.label)+'</strong><span>'+esc(w.hint)+'</span></p>').join('')+
          '<div class="cp-word-tools"><button type="button" data-cp-word-clear class="cp-secondary">Bỏ chọn</button><button type="button" data-cp-word-hint class="cp-secondary" '+(s.hints<=0?'disabled':'')+'>Gợi ý ('+s.hints+')</button></div></div></div><p class="cp-help cp-word-status" role="status">Chọn chữ đầu tiên để tìm từ.</p></div>';
      }
      const sessionHTML='<div class="cp-app cp-session">'+gameHeading(game)+
        '<div class="cp-session-layout"><main class="cp-session-main"><div class="cp4-game-banner">'+avatar(game.art)+'</div>'+body+'</main>'+
        '<aside class="cp-aside"><div class="cp-aside__art">'+avatar(game.art)+'</div><h2>'+icon('help')+' Cách chơi</h2><p>'+esc(gameRules[kind])+'</p>'+
        '<p>Tiến trình được ghi trên trình duyệt này.</p>'+
        '<p>Hoàn thành thử thách để được nhận điểm demo; một ngày chỉ có một phần thưởng trò chơi.</p>'+
        '<a class="cp-quiet-link" href="/pages/cham-club?tab=rewards">Xem ví CHẠM</a></aside></div></div>';
      if(root.__cpRenderSession)root.__cpRenderSession(sessionHTML,kind);else root.innerHTML=sessionHTML;
      if(activeAttr){
        const next=[...root.querySelectorAll('['+activeAttr.name+']')].find(el=>el.getAttribute(activeAttr.name)===activeAttr.value&&!el.disabled);
        (next||root.querySelector('[data-cp-next]'))?.focus({preventScroll:true});
      }
    }
    function selectMemory(i){
      const s=state;if(s.locked||s.found.has(s.deck[i]?.id)||s.open.includes(i))return;
      s.open.push(i);
      if(s.open.length===2){
        s.turns++;s.locked=true;
        const [a,b]=s.open;
        if(s.deck[a].id===s.deck[b].id){
          s.found.add(s.deck[a].id);s.combo++;s.bestCombo=Math.max(s.bestCombo,s.combo);s.open=[];s.locked=false;render();
          if(s.found.size===s.target)outcome(true,'Bạn đã tìm đủ '+s.target+' cặp trong '+s.turns+' lượt; chuỗi tốt nhất '+s.bestCombo+'.');
          return;
        }
        s.combo=0;s.errors++;
        render();
        delay=setTimeout(()=>{if(kind!=='memory')return;s.open=[];s.locked=false;render();delay=null;},820);
      }else render();
    }
    function answer(i){
      const s=state;if(s.answer!==null||!s.questions[s.index])return;
      s.answer=i;
      if(i===s.questions[s.index].answerIndex){s.correct++;s.streak++;s.bestStreak=Math.max(s.bestStreak,s.streak);}
      else s.streak=0;
      render();
    }
    function nextQuestion(){
      const s=state;if(s.answer===null)return;
      if(s.index===s.questions.length-1){
        const required=kind==='quiz'&&window.CHAMPlayDifficulty==='hard'?3:Math.ceil(s.questions.length*.6);
        const won=s.correct>=required&&!(kind==='quiz'&&window.CHAMPlayDifficulty==='hard'&&s.bestStreak<3);
        outcome(won,'Bạn trả lời đúng '+s.correct+'/'+s.questions.length+' câu. Chuỗi dài nhất '+s.bestStreak+'.'+(won?'':' Chưa đạt điều kiện của chế độ này.'));
      }else{s.index++;s.answer=null;render();}
    }
    function startClock(){
      let previous=performance.now();
      timer=setInterval(()=>{
        if(kind!=='speed')return;
        const now=performance.now();
        if(document.hidden){previous=now;return;}
        if(state.answer!==null){previous=now;return;} // time to read explanation
        state.remaining=Math.max(0,state.remaining-(now-previous)/1000);
        previous=now;
        const node=$('[data-cp-seconds]',root),bar=$('[data-cp-timebar]',root);
        if(node&&node.textContent!==String(Math.ceil(state.remaining)))node.textContent=Math.ceil(state.remaining);
        if(bar)bar.style.width=(state.remaining/state.limit*100).toFixed(2)+'%';
        if(state.remaining<=0){outcome(false,'Hết thời gian. Bạn có thể thử lại với bộ câu hỏi mới.');}
      },100);
    }
    function matchPair(side,id){
      const s=state;
      if(s.found.has(id))return;
      if(side==='left'){s.selected=id;render();return;}
      if(!s.selected)return;
      if(s.selected===id){s.found.add(id);s.selected=null;render();
        if(s.found.size===5)outcome(true,'Bạn đã ghép đúng cả năm cặp ứng dụng và chất liệu.');
      }else{s.misses++;s.selected=null;render();const help=$('.cp-match-grid + .cp-help',root);if(help)help.textContent='Chưa đúng. Hãy thử chọn cặp khác.';}
    }
    const indicesBetween=(a,b)=>{
      const ar=Math.floor(a/size),ac=a%size,br=Math.floor(b/size),bc=b%size;
      if(ar!==br&&ac!==bc)return [];
      const dr=Math.sign(br-ar),dc=Math.sign(bc-ac),n=Math.max(Math.abs(br-ar),Math.abs(bc-ac));
      return Array.from({length:n+1},(_,i)=>(ar+dr*i)*size+ac+dc*i);
    };
    function chooseWord(i){
      const s=state;
      if(s.selected===null){s.selected=i;render();return;}
      s.attempts++;
      const indices=indicesBetween(s.selected,i);
      const str=indices.map(j=>s.letters[j]).join('');
      const target=WORDS.find(w=>(w.word===str||w.word===[...str].reverse().join(''))&&!s.found.has(w.word));
      if(target){s.found.add(target.word);indices.forEach(x=>s.foundPositions.add(x));s.hintPositions.clear();s.selected=null;render();
        if(s.found.size===5)outcome(true,'Bạn đã tìm được năm từ khóa về vật liệu.');
      }else{
        s.selected=i;render();
        const status=$('.cp-word-status',root);if(status)status.textContent='Chưa khớp từ cần tìm. Chữ vừa chọn là điểm bắt đầu mới.';
      }
    }
    root.addEventListener('click',event=>{
      const el=event.target.closest('button,a');if(!el||!root.contains(el))return;
      if(el.hasAttribute('data-cp-back')){hub();jumpToApp();return;}
      if(el.hasAttribute('data-cp-filter')){hub(el.dataset.cpFilter);return;}
      if(el.hasAttribute('data-cp-game')){start(el.dataset.cpGame);return;}
      if(kind==='memory'&&el.hasAttribute('data-cp-memory')){selectMemory(Number(el.dataset.cpMemory));return;}
      if((kind==='quiz'||kind==='speed')&&el.hasAttribute('data-cp-choice')){answer(Number(el.dataset.cpChoice));return;}
      if((kind==='quiz'||kind==='speed')&&el.hasAttribute('data-cp-next')){nextQuestion();return;}
      if(kind==='match'&&el.hasAttribute('data-cp-left')){matchPair('left',el.dataset.cpLeft);return;}
      if(kind==='match'&&el.hasAttribute('data-cp-right')){matchPair('right',el.dataset.cpRight);return;}
      if(kind==='word'&&el.hasAttribute('data-cp-cell')){chooseWord(Number(el.dataset.cpCell));return;}
      if(kind==='word'&&el.hasAttribute('data-cp-word-hint')){
        if(state.hints>0){
          const w=WORDS.find(w=>!state.found.has(w.word));
          if(w){state.hints--;state.hintPositions=new Set(state.wordPositions[w.word]);render();
            const status=$('.cp-word-status',root);if(status)status.textContent='Gợi ý: các ô viền vàng đánh dấu từ '+w.label+'.';
          }
        }
        return;
      }
      if(kind==='word'&&el.hasAttribute('data-cp-word-clear')){state.selected=null;render();}
    });
    // No keyboard interception on the page: button roles provide native Enter/Space support.
    const onVisibility=()=>{if(document.hidden&&kind==='speed'){}};
    document.addEventListener('visibilitychange',onVisibility);
    window.CHAMPlayQA=['127.0.0.1','localhost'].includes(location.hostname)?{
      start,hub,chooseWord,getState:()=>({kind,state,completed:[...completed]})
    }:undefined;
    hub();
  }
  window.CHAMQuest={mount};
})();