(()=>{const root=document.querySelector('[data-cham-ai]');if(!root)return;
 const endpoint=root.dataset.endpoint||'';const aiConfigured=endpoint.startsWith('https://')&&!endpoint.includes('__CHAM');
 const launch=root.querySelector('.cham-ai-launch'),panel=root.querySelector('.cham-ai-window'),log=root.querySelector('.cham-ai-log'),form=root.querySelector('form'),input=form.querySelector('textarea'),send=form.querySelector('button'),share=root.querySelector('[data-chat-orders]');
 const rules=window.CHAMAI_RULES;const status=root.querySelector('.cham-ai-window header small');if(!aiConfigured&&status)status.textContent='Hỗ trợ cơ bản · AI chưa kết nối';const note=root.querySelector('.cham-ai-note');if(!aiConfigured&&note)note.textContent='Chế độ FAQ và tra cứu demo. AI tạo sinh chưa được kích hoạt. Không nhập dữ liệu nhạy cảm.';const greeting=log.firstElementChild.textContent;let history=[],busy=false,shareOrders=false;
 const add=(text,kind='')=>{const node=document.createElement('div');node.className='cham-ai-message '+kind;
 for(const part of String(text).split(/(https:\/\/chamstore\.site\/[A-Za-z0-9%_\-\/]+)/g)){if(part.startsWith('https://chamstore.site/')){const a=document.createElement('a');a.href=part;a.textContent=part;node.append(a);}else node.append(document.createTextNode(part));}
 log.append(node);log.scrollTop=log.scrollHeight;return node;};
 const mobile=matchMedia('(max-width: 700px), (max-height: 500px) and (pointer: coarse)');
 const viewport=window.visualViewport;let frame=0,locked=false,savedY=0,background=[];
 const scrollBottom=()=>{log.scrollTop=log.scrollHeight;};
 const unlock=()=>{if(!locked)return;locked=false;document.documentElement.classList.remove('cham-chat-lock');document.body.classList.remove('cham-chat-lock');for(const el of background)el.inert=false;background=[];if(Math.abs(window.scrollY-savedY)>1)window.scrollTo({top:savedY,behavior:"instant"});};
 const sync=()=>{frame=0;const active=!panel.hidden&&mobile.matches;
  root.classList.toggle('cham-ai-mobile-open',active);
  if(!active){unlock();return;}
  if(!locked){savedY=window.scrollY;locked=true;document.documentElement.classList.add('cham-chat-lock');document.body.classList.add('cham-chat-lock');background=[...document.querySelectorAll('#header-group,#MainContent,body>footer')].filter(el=>!el.inert);for(const el of background)el.inert=true;}
  const h=viewport?.height||window.innerHeight,w=viewport?.width||window.innerWidth,top=viewport?.offsetTop||0,left=viewport?.offsetLeft||0;
  const nearEnd=log.scrollHeight-log.scrollTop-log.clientHeight<80||document.activeElement===input;
  root.style.setProperty('--cham-chat-top',top+'px');root.style.setProperty('--cham-chat-left',left+'px');root.style.setProperty('--cham-chat-width',w+'px');root.style.setProperty('--cham-chat-height',h+'px');
  root.classList.toggle('cham-ai-keyboard',h<window.innerHeight-100||h<450);panel.setAttribute('aria-modal','true');
  if(nearEnd)scrollBottom();
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(sync);};
 viewport?.addEventListener('resize',schedule,{passive:true});viewport?.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});mobile.addEventListener?.('change',schedule);
 input.addEventListener('focus',schedule);input.addEventListener('blur',schedule);
 const close=root.querySelector('[data-chat-close]');
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 let desiredOpen=false,transition=null,version=0;
 const toggle=open=>{
  if(open===desiredOpen)return;desiredOpen=open;const epoch=++version;
  const previous=panel.hidden?null:getComputedStyle(panel);
  const from=previous?{opacity:previous.opacity,transform:previous.transform}:null;
  transition?.cancel();transition=null;
  launch.setAttribute('aria-expanded',String(open));
  if(open){panel.hidden=false;panel.inert=false;sync();panel.setAttribute('aria-modal',String(mobile.matches));scrollBottom();}
  else{if(document.activeElement===input)input.blur();panel.inert=true;}
  const finish=()=>{if(epoch!==version)return;transition=null;if(!open){panel.hidden=true;panel.inert=false;panel.removeAttribute('aria-modal');sync();launch.focus({preventScroll:true});}else if(!panel.contains(document.activeElement)){(mobile.matches?close:input).focus({preventScroll:true});}};
  if(reducedMotion.matches||typeof panel.animate!=='function'){finish();return;}
  const resting={opacity:1,transform:'translate3d(0,0,0)'};
  const tucked={opacity:0,transform:mobile.matches?'translate3d(0,18px,0)':'translate3d(0,9px,0) scale(.985)'};
  transition=panel.animate(open?[from||tucked,resting]:[from||resting,tucked],{duration:open?260:190,easing:open?'cubic-bezier(.22,.75,.25,1)':'cubic-bezier(.4,0,1,1)',fill:'none'});
  transition.finished.then(finish,()=>{});
 };
 launch.onclick=()=>toggle(!desiredOpen);close.onclick=()=>toggle(false);
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&desiredOpen){e.preventDefault();toggle(false);}else if(e.key==='Tab'&&desiredOpen&&mobile.matches){const targets=[...panel.querySelectorAll('button:not(:disabled),textarea,a[href]')].filter(x=>x.getClientRects().length);if(!targets.length)return;const first=targets[0],last=targets[targets.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});

 share.setAttribute('aria-pressed','false');share.onclick=()=>{shareOrders=!shareOrders;share.setAttribute('aria-pressed',String(shareOrders));share.textContent=shareOrders?'Đã chọn chia sẻ đơn demo':'Chia sẻ đơn demo';};
 root.querySelector('[data-chat-reset]').onclick=()=>{if(busy)return;history=[];shareOrders=false;share.setAttribute('aria-pressed','false');share.textContent='Chia sẻ đơn demo';log.replaceChildren();add(greeting);};
 form.onsubmit=async e=>{e.preventDefault();const message=input.value.trim();if(!message||busy)return;busy=true;send.disabled=true;input.value='';add(message,'user');const route=rules?.classify(message,history.filter(x=>x.role==='user'));if(route?.answer){add(route.answer);if(route.kind==='faq'){history.push({role:'user',content:message},{role:'assistant',content:route.answer});history=history.slice(-6);}busy=false;send.disabled=false;return;}if(!aiConfigured){
   if(route?.kind==='order'){
    const orders=shareOrders?(window.CHAMDemo?.getState()?.orders||[]).slice(0,5):[];
    const id=message.match(/CHAM-DEMO-[A-Za-z0-9-]+/i)?.[0];
    const found=id?orders.filter(o=>String(o.id).toLowerCase()===id.toLowerCase()):orders;
    add(!shareOrders?'Hãy chọn Chia sẻ đơn demo để xem dữ liệu đơn trên trình duyệt này.':found.length?'Đơn mô phỏng (không giao hàng thật):\n'+found.map(o=>String(o.id)+' — '+new Intl.NumberFormat('vi-VN').format(Number(o.total)||0)+'đ — Đã tiếp nhận mô phỏng').join('\n'):'Không tìm thấy đơn demo đã chia sẻ.');
   }else add(rules?.fallback(message,history.filter(x=>x.role==='user'))||'AI chưa kết nối. Vui lòng xem danh mục CHẠM.');
   busy=false;send.disabled=false;return;
 }const pending=add('Đang trả lời…');let timer,controller=new AbortController();
 try{const orders=shareOrders?(window.CHAMDemo?.getState()?.orders||[]).slice(0,5).map(o=>({id:o.id,total:o.total,createdAt:o.createdAt})):[];timer=setTimeout(()=>controller.abort(),18000);
 const res=await fetch(endpoint+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,history:history.slice(-6),demoOrders:orders}),signal:controller.signal});const data=await res.json();pending.remove();if(!res.ok||!data.answer)throw Error(data.error||'AI chưa trả lời.');
 add(data.answer);if(data.ai||data.source==='faq'){history.push({role:'user',content:message},{role:'assistant',content:data.answer});history=history.slice(-6);}
 }catch(err){pending.remove();add(rules?.fallback(message,history.filter(x=>x.role==='user'))||'AI hiện không khả dụng. Vui lòng thử lại.','error');}finally{clearTimeout(timer);busy=false;send.disabled=false;}
 };
 root.hidden=false; // Once deployed, FAQ remains usable even during an AI outage.
})();