(()=>{const root=document.querySelector('[data-cham-ai]');if(!root)return;
 const endpoint=root.dataset.endpoint||'';const aiConfigured=endpoint.startsWith('https://')&&!endpoint.includes('__CHAM');
 const launch=root.querySelector('.cham-ai-launch'),panel=root.querySelector('.cham-ai-window'),log=root.querySelector('.cham-ai-log'),form=root.querySelector('form'),input=form.querySelector('textarea'),send=form.querySelector('button'),share=root.querySelector('[data-chat-orders]');
 const rules=window.CHAMAI_RULES;const status=root.querySelector('.cham-ai-window header small');if(!aiConfigured&&status)status.textContent='Hỗ trợ cơ bản · AI chưa kết nối';const note=root.querySelector('.cham-ai-note');if(!aiConfigured&&note)note.textContent='Chế độ FAQ và tra cứu demo. AI tạo sinh chưa được kích hoạt. Không nhập dữ liệu nhạy cảm.';const greeting=log.firstElementChild.textContent;let history=[],busy=false,shareOrders=false;
 const unreadBadge=launch.querySelector('[data-chammy-unread]');
 let unread=0,greetingUnread=true;
 try{greetingUnread=sessionStorage.getItem('chammy.greeting-unread.v2')!=='0';}catch{}
 function updateUnread(){
  const count=unread+(greetingUnread?1:0);
  if(unreadBadge){unreadBadge.hidden=count===0;unreadBadge.textContent=count>99?'99+':String(count);}
  launch.setAttribute('aria-label',count?'Mở Chammy, '+count+' tin nhắn chưa đọc':'Mở Chammy');
  launch.classList.toggle('chammy-has-unread',count>0);
 }
 function markGreeting(value){greetingUnread=value;try{sessionStorage.setItem('chammy.greeting-unread.v2',value?'1':'0');}catch{}updateUnread();}
 function markReply(){if(!desiredOpen){unread++;updateUnread();if(unreadBadge&&!matchMedia('(prefers-reduced-motion: reduce)').matches)unreadBadge.animate?.([{transform:'scale(.75)'},{transform:'scale(1.13)'},{transform:'scale(1)'}],{duration:240,easing:'ease-out'});}}
 function readAll(){unread=0;markGreeting(false);}
 const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el;};
 const money=v=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(Number(v)||0);
 const end=()=>{if(log.scrollHeight-log.scrollTop-log.clientHeight<180)log.scrollTop=log.scrollHeight;};
 const add=(text,kind='')=>{const n=make('div','cham-ai-message '+kind,kind==='user'?text:rules?.voice(text)??text);log.append(n);log.scrollTop=log.scrollHeight;if(text&&kind!=='user'&&kind!=='chammy-thinking')markReply();return n;};
 const productPath=/https:\/\/chamstore\.site\/(products\/[a-z0-9-]{1,120})/gi;
 const format=(node,text)=>{
  node.replaceChildren();const parts=String(text).split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|https:\/\/chamstore\.site\/[A-Za-z0-9%_\-/]+)/g);
  for(const part of parts){if(/^https:\/\/chamstore\.site\//.test(part)){const a=make('a','chammy-link',part.includes('/products/')?'Xem sản phẩm':part.includes('/collections/')?'Xem bộ sưu tập':part.includes('cham-play')?'Mở CHẠM Play':'Xem tại CHẠM');a.href=part;node.append(a);}else if(part.startsWith('**')&&part.endsWith('**'))node.append(make('strong','',part.slice(2,-2)));else if(part.startsWith('*')&&part.endsWith('*'))node.append(make('em','',part.slice(1,-1)));else node.append(document.createTextNode(part));}
 };
 const imageURL=raw=>{try{const u=new URL(raw,location.origin);return u.protocol==='https:'&&(u.hostname==='cdn.shopify.com'||u.hostname.endsWith('.myshopify.com')||u.hostname===location.hostname)?u.href:'';}catch{return '';}};
 const cardCache=new Map();
 async function productCard(path){
  if(!/^products\/[a-z0-9-]{1,120}$/.test(path))return null;
  try{let p=cardCache.get(path);if(!p){const r=await fetch('/'+path+'.js',{credentials:'same-origin',signal:AbortSignal.timeout(5000)});if(!r.ok)return null;p=await r.json();if(!p.title||!Number.isFinite(p.price))return null;cardCache.set(path,p);}
   const card=make('a','chammy-product');card.href='/'+path;
   const pic=imageURL(p.featured_image||p.images?.[0]);if(pic){const im=make('img');im.src=pic;im.alt='';im.width=88;im.height=88;im.loading='lazy';card.append(im);}
   const body=make('span','chammy-product-copy');body.append(make('strong','',p.title),make('span','chammy-price',money(p.price/100)),make('small','',p.available?'Có thể thêm vào giỏ demo':'Hiện không khả dụng'),make('span','chammy-product-action','Xem chi tiết'));card.append(body);return card;
  }catch{return null;}
 }
 async function reply(text,paths=[]){
  const raw=rules?.voice(text)??String(text);const matches=[...raw.matchAll(productPath)].map(x=>x[1]);const unique=[...new Set([...paths,...matches])].filter(x=>/^products\/[a-z0-9-]{1,120}$/.test(x)).slice(0,3);
  const n=add('');const body=make('div','chammy-reply');n.append(body);
  const plain=raw.replace(productPath,'').replace(/\*\*([^*\n]+)\*\*/g,'$1').replace(/\*([^*\n]+)\*/g,'$1').replace(/(?:tại đường dẫn này|tại đây|đường dẫn)\s*:\s*\.?/gi,'').trim();
  const cleaned=raw.replace(/(?:tại đường dẫn này|tại đây|đường dẫn)\s*:\s*(?=https:\/\/chamstore\.site\/products\/)/gi,'').replace(productPath,'').replace(/\n\s*\.\s*\n/g,'\n').trim();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&desiredOpen&&plain.length){
   body.setAttribute('aria-hidden','true');const chars=Array.from(plain);const duration=Math.min(1800,Math.max(220,chars.length*8));const start=performance.now();
   await new Promise(resolve=>{const tick=now=>{const count=Math.min(chars.length,Math.ceil((now-start)/duration*chars.length));body.textContent=chars.slice(0,count).join('');end();if(count<chars.length&&desiredOpen&&!document.hidden)requestAnimationFrame(tick);else resolve();};requestAnimationFrame(tick);});body.removeAttribute('aria-hidden');
  }
  format(body,cleaned||'Chammy gửi bạn sản phẩm phù hợp:');markReply();
  if(unique.length){const cards=await Promise.all(unique.map(productCard));for(let i=0;i<cards.length;i++){if(cards[i])n.append(cards[i]);else{const a=make('a','chammy-link','Xem chi tiết sản phẩm');a.href='/'+unique[i];n.append(a);}}}end();return n;
 }
 const thinking=()=>{const n=add('','chammy-thinking');n.setAttribute('role','status');n.setAttribute('aria-label','Chammy đang xem thông tin');n.append(make('span','chammy-thinking-text','Chammy đang xem thông tin'),make('span','chammy-dots',''));n.lastChild.append(make('i'),make('i'),make('i'));return n;};
 function orderReply(message){
  if(!shareOrders){add('Dạ, bạn chọn Xem đơn demo để Chammy xem các đơn đã lưu trên trình duyệt này nha.');return;}
  const orders=(window.CHAMDemo?.getState()?.orders||[]).slice(0,5);const id=message.match(/CHAM-DEMO-[A-Za-z0-9-]+/i)?.[0];const found=id?orders.filter(o=>String(o.id).toLowerCase()===id.toLowerCase()):orders;
  if(!found.length){add('Dạ, Chammy chưa tìm thấy đơn demo này ạ. Bạn kiểm tra lại mã đơn nha.');return;}
  const n=add('Chammy tìm thấy đơn demo của bạn rồi nè. Đơn này chưa được thanh toán hay giao hàng thật nha.');
  for(const o of found){const c=make('div','chammy-order');c.append(make('strong','',o.id),make('small','chammy-order-state','Đã tiếp nhận mô phỏng'));
   for(const i of (o.items||[]).slice(0,10)){const row=make('div','chammy-order-item');row.append(make('span','',String(i.title||'Sản phẩm')+' × '+(Number(i.quantity)||1)),make('span','',money(i.linePrice)));c.append(row);}
   c.append(make('strong','chammy-price','Tổng: '+money(o.total)));n.append(c);}
  end();
 }
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
  root.classList.toggle('cham-ai-keyboard',h<window.innerHeight-100||(document.activeElement===input&&h<300));panel.setAttribute('aria-modal','true');
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
  if(open){readAll();panel.hidden=false;panel.inert=false;sync();panel.setAttribute('aria-modal',String(mobile.matches));scrollBottom();}
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

 share.setAttribute('aria-pressed','false');share.onclick=()=>{shareOrders=!shareOrders;share.setAttribute('aria-pressed',String(shareOrders));share.textContent=shareOrders?'Đang xem đơn demo':'Xem đơn demo';if(shareOrders)orderReply('');};
 root.querySelector('[data-chat-reset]').onclick=()=>{if(busy)return;history=[];shareOrders=false;share.setAttribute('aria-pressed','false');share.textContent='Xem đơn demo';log.replaceChildren();add(greeting);};
 form.onsubmit=async e=>{e.preventDefault();const message=input.value.trim();if(!message||busy)return;busy=true;send.disabled=true;input.value='';add(message,'user');const route=rules?.classify(message,history.filter(x=>x.role==='user'));if(route?.answer){await reply(route.answer);if(route.kind==='faq'){history.push({role:'user',content:message},{role:'assistant',content:route.answer});history=history.slice(-6);}busy=false;send.disabled=false;return;}if(route?.kind==='order'){orderReply(message);busy=false;send.disabled=false;return;}if(!aiConfigured){await reply(rules?.fallback(message,history.filter(x=>x.role==='user'))||'AI chưa kết nối. Vui lòng xem danh mục CHẠM.');busy=false;send.disabled=false;return;}const pending=thinking();let timer,controller=new AbortController();
 try{timer=setTimeout(()=>controller.abort(),30000);
 const res=await fetch(endpoint+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,history:history.slice(-6),demoOrders:[]}),signal:controller.signal});const data=await res.json();pending.remove();if(!res.ok||!data.answer)throw Error(data.error||'AI chưa trả lời.');
 await reply(data.answer,Array.isArray(data.products)?data.products:[]);if(data.ai||data.source==='faq'){history.push({role:'user',content:message},{role:'assistant',content:data.answer});history=history.slice(-6);}
 }catch(err){pending.remove();await reply(rules?.fallback(message,history.filter(x=>x.role==='user'))||'AI hiện không khả dụng. Vui lòng thử lại.');}finally{clearTimeout(timer);busy=false;send.disabled=false;}
 };
 root.hidden=false;updateUnread();
 const welcome=root.querySelector('[data-chammy-welcome]');
 if(welcome){
  let seen=false;try{seen=sessionStorage.getItem('chammy.welcome.v2')==='1';}catch{}
  let showTimer=0,hideTimer=0;
  const remember=()=>{try{sessionStorage.setItem('chammy.welcome.v2','1');}catch{}};
  const dismiss=()=>{clearTimeout(showTimer);clearTimeout(hideTimer);welcome.hidden=true;remember();};
  welcome.querySelector('[data-chammy-dismiss]').addEventListener('click',dismiss);
  welcome.querySelector('[data-chammy-start]').addEventListener('click',()=>{dismiss();toggle(true);});
  launch.addEventListener('click',dismiss);
  if(!seen&&!document.body.classList.contains('cham-play-mode')&&!location.pathname.includes('checkout'))showTimer=setTimeout(()=>{
   if(desiredOpen||document.hidden||document.documentElement.classList.contains('cp-viewport-lock'))return;
   welcome.hidden=false;remember();hideTimer=setTimeout(()=>{welcome.hidden=true;},14000);
  },1300);
 }
})();