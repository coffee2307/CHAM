(()=>{const root=document.querySelector('[data-cham-ai]');if(!root)return;
 const endpoint=root.dataset.endpoint;if(!endpoint||!endpoint.startsWith('https://')||endpoint.includes('__CHAM'))return;
 const launch=root.querySelector('.cham-ai-launch'),panel=root.querySelector('.cham-ai-window'),log=root.querySelector('.cham-ai-log'),form=root.querySelector('form'),input=form.querySelector('textarea'),send=form.querySelector('button'),share=root.querySelector('[data-chat-orders]');
 const greeting=log.firstElementChild.textContent;let history=[],busy=false,shareOrders=false;
 const add=(text,kind='')=>{const node=document.createElement('div');node.className='cham-ai-message '+kind;
 for(const part of String(text).split(/(https:\/\/chamstore\.site\/[A-Za-z0-9%_\-\/]+)/g)){if(part.startsWith('https://chamstore.site/')){const a=document.createElement('a');a.href=part;a.textContent=part;node.append(a);}else node.append(document.createTextNode(part));}
 log.append(node);log.scrollTop=log.scrollHeight;return node;};
 const toggle=open=>{panel.hidden=!open;launch.setAttribute('aria-expanded',String(open));if(open)input.focus({preventScroll:true});else launch.focus({preventScroll:true});};
 launch.onclick=()=>toggle(panel.hidden);root.querySelector('[data-chat-close]').onclick=()=>toggle(false);
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();toggle(false);}});
 share.setAttribute('aria-pressed','false');share.onclick=()=>{shareOrders=!shareOrders;share.setAttribute('aria-pressed',String(shareOrders));share.textContent=shareOrders?'Đã chọn chia sẻ đơn demo':'Chia sẻ đơn demo';};
 root.querySelector('[data-chat-reset]').onclick=()=>{if(busy)return;history=[];shareOrders=false;share.setAttribute('aria-pressed','false');share.textContent='Chia sẻ đơn demo';log.replaceChildren();add(greeting);};
 form.onsubmit=async e=>{e.preventDefault();const message=input.value.trim();if(!message||busy)return;busy=true;send.disabled=true;input.value='';add(message,'user');const pending=add('Đang trả lời…');let timer,controller=new AbortController();
 try{const orders=shareOrders?(window.CHAMDemo?.getState()?.orders||[]).slice(0,5).map(o=>({id:o.id,total:o.total,createdAt:o.createdAt})):[];timer=setTimeout(()=>controller.abort(),25000);
 const res=await fetch(endpoint+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,history:history.slice(-6),demoOrders:orders}),signal:controller.signal});const data=await res.json();pending.remove();if(!res.ok||!data.answer)throw Error(data.error||'AI chưa trả lời.');
 add(data.answer);history.push({role:'user',content:message},{role:'assistant',content:data.answer});history=history.slice(-6);
 }catch(err){pending.remove();add(err.name==='AbortError'?'AI phản hồi quá lâu. Bạn có thể thử lại.':String(err.message||'Không thể kết nối AI.'),'error');}finally{clearTimeout(timer);busy=false;send.disabled=false;}
 };
 fetch(endpoint+'/health',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{if(data?.ok)root.hidden=false;}).catch(()=>{});
})();