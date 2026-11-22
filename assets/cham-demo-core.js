/* CHẠM 2.0 — browser-local demo state. No customer authentication or real transactions. */
(() => {
  'use strict';
  const KEY = 'cham_demo_v2';
  const VERSION = 2;
  const REWARDS = Object.freeze({
    welcome: 100, daily: 10, game: 20, orderDivider: 10000,
    vouchers: [
      { code: 'CHAM10', title: 'Giảm 10.000đ', cost: 100, amount: 10000 },
      { code: 'CHAM20', title: 'Giảm 20.000đ', cost: 180, amount: 20000 },
      { code: 'CHAM50', title: 'Giảm 50.000đ', cost: 400, amount: 50000 }
    ]
  });
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const dateKey = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Ho_Chi_Minh', year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const uid = prefix => prefix + '-' + (globalThis.crypto?.randomUUID?.() || (Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)));
  const money = amount => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(Math.max(0,Number(amount)||0));
  const initial = () => ({
    schema: VERSION,
    profile: { name:'Khách trải nghiệm', avatar:'cham-avatar-default.svg' },
    favoriteProducts: [],
    orders: [],
    ledger:[{id:'welcome:v2',kind:'welcome',delta:100,description:'Điểm chào mừng · DEMO',createdAt:new Date().toISOString()}],
    vouchers:[],
    gameStats: { played:0, bestMoves:null }
  });
  let storageError = false;
  const sanitize = obj => {
    if (!obj || obj.schema !== VERSION) return initial();
    const state = {...initial(),...obj};
    if (!state.profile || typeof state.profile.name !== 'string') state.profile=initial().profile;
    for(const k of ['favoriteProducts','orders','ledger','vouchers']) if(!Array.isArray(state[k])) state[k]=[];
    if(!state.ledger.some(x => x && x.id === 'welcome:v2')) state.ledger.unshift(initial().ledger[0]);
    return state;
  };
  const read = () => {
    try { return sanitize(JSON.parse(localStorage.getItem(KEY))); }
    catch(err) { storageError = true; return initial(); }
  };
  let state = read();
  function commit(next){
    try {
      localStorage.setItem(KEY,JSON.stringify(next));
      state = next; storageError=false;
      document.dispatchEvent(new CustomEvent('cham:state',{detail:structured()}));
      return true;
    } catch(err) { storageError=true; toast('Không thể lưu dữ liệu trên trình duyệt. Hãy kiểm tra chế độ riêng tư.','error'); return false; }
  }
  function structured() { return JSON.parse(JSON.stringify(state)); }
  const points = () => Math.max(0,state.ledger.reduce((sum,entry)=>sum+(Number(entry.delta)||0),0));
  function toast(message,kind='ok'){
    let box = $('#cham-demo-toast');
    if (!box) {
      box=document.createElement('div'); box.id='cham-demo-toast';box.setAttribute('role','status');box.setAttribute('aria-live','polite'); document.body.append(box);
    }
    box.className='cham-demo-toast cham-demo-toast--'+kind;
    box.textContent=message;
    box.hidden=false;
    clearTimeout(toast._timeout);
    toast._timeout=setTimeout(()=>{ box.hidden=true; },3600);
  }
  function earn(id, delta, kind, description) {
    if (!id || !Number.isInteger(delta) || delta <= 0 || state.ledger.some(l=>l.id===id)) return false;
    return commit({...state, ledger:[...state.ledger,{id,kind,delta,description,createdAt:new Date().toISOString()}]});
  }
  function checkin(){
    const ok=earn('daily:'+dateKey(),REWARDS.daily,'daily','Điểm danh ngày '+dateKey());
    toast(ok?'+10 điểm đã vào ví CHẠM':'Hôm nay bạn đã nhận điểm danh');
    return ok;
  }
  function gameAward(moves){
    const key='game:'+dateKey();
    const todayAwarded=state.ledger.some(l=>l.id===key);
    const nextStat={played:state.gameStats.played+1,bestMoves:Math.min(Number(state.gameStats.bestMoves)||Infinity,moves||Infinity)};
    if(!todayAwarded){
      return commit({...state,gameStats:nextStat,ledger:[...state.ledger,{id:key,kind:'game',delta:REWARDS.game,description:'Hoàn thành CHẠM Play',createdAt:new Date().toISOString()}]});
    }
    commit({...state,gameStats:nextStat});
    return false;
  }
  function redeem(code){
    const reward=REWARDS.vouchers.find(v=>v.code===code);
    if(!reward) return {ok:false,message:'Phần thưởng không hợp lệ'};
    if(points()<reward.cost) return {ok:false,message:'Bạn chưa đủ điểm'};
    if(state.vouchers.some(v=>v.code===code && !v.used)) return {ok:false,message:'Bạn đã có voucher này'};
    const voucher={...reward,id:uid('voucher'),used:false,createdAt:new Date().toISOString()};
    const saved=commit({...state,vouchers:[...state.vouchers,voucher],ledger:[...state.ledger,{id:'redeem:'+voucher.id,kind:'redeem',delta:-reward.cost,description:'Đổi '+reward.title,createdAt:new Date().toISOString()}]});
    return {ok:saved, message:saved?'Đổi voucher thành công':'Không thể lưu phần thưởng', voucher};
  }
  function setName(name){
    const cleaned=String(name||'').trim().slice(0,42);
    if(cleaned.length<2) return false;
    return commit({...state,profile:{...state.profile,name:cleaned}});
  }
  function setAvatar(avatar){
    if(!/^cham-avatar-(?:\d{2,3}|default)\.svg$/.test(String(avatar)) && !['🌿','🌼','🏺','🧶','☀️','🪴','🌸','🍃'].includes(avatar)) return false;
    return commit({...state,profile:{...state.profile,avatar}});
  }
  function toggleFavorite(product){
    const id=String(product?.id||'');
    if(!id) return false;
    const exists=state.favoriteProducts.some(p=>p.id===id);
    const favorites=exists?state.favoriteProducts.filter(p=>p.id!==id):[...state.favoriteProducts,{id,title:String(product.title||'Sản phẩm'),url:String(product.url||'/collections/all'),image:String(product.image||''),price:Number(product.price)||0}];
    commit({...state,favoriteProducts:favorites});
    toast(exists?'Đã bỏ khỏi yêu thích':'Đã lưu vào yêu thích');
    return !exists;
  }
  function makeOrder({items,shipping,discountId,subtotal,total}) {
    if(!Array.isArray(items)||!items.length) return {ok:false,error:'Giỏ hàng trống'};
    if(!shipping?.name || !shipping?.phone || !shipping?.address) return {ok:false,error:'Vui lòng điền đủ thông tin'};
    if(!(Number(total)>0) || Number(subtotal)<Number(total)) return {ok:false,error:'Tổng tiền không hợp lệ'};
    const voucher=discountId?state.vouchers.find(v=>v.id===discountId&&!v.used):null;
    if(discountId&&!voucher) return {ok:false,error:'Voucher không còn hợp lệ'};
    const safeItems=items.map(item=>({
      id:String(item.id),variantId:String(item.variant_id||item.id),title:String(item.product_title||item.title),
      quantity:Math.max(1,Number(item.quantity)||1),linePrice:Number(item.final_line_price ?? item.line_price)||0,image:item.featured_image?.url||item.image||''
    }));
    const orderId=uid('CHAM-DEMO');
    const order={id:orderId,createdAt:new Date().toISOString(),items:safeItems,
      subtotal:Number(subtotal),total:Number(total),discount:voucher?.amount||0,
      voucherId:voucher?.id||null,shipping:{name:'Khách demo',phone:'Không lưu',address:'Không lưu',note:''},status:'Mô phỏng · đã tiếp nhận'};
    const delta=Math.floor(order.total/REWARDS.orderDivider);
    const ledger=delta>0?[...state.ledger,{id:'order:'+orderId,kind:'order',delta,description:'Đơn hàng demo '+orderId,createdAt:order.createdAt}]:state.ledger;
    const vouchers=state.vouchers.map(v=>v.id===discountId?{...v,used:true,usedAt:order.createdAt}:v);
    const saved=commit({...state,orders:[order,...state.orders],vouchers,ledger});
    if(!saved)return {ok:false,error:'Không thể lưu đơn hàng trong trình duyệt'};
    return {ok:true,order,pointsEarned:delta};
  }
  function reset(){
    const fresh=initial();
    const ok=commit(fresh);
    toast(ok?'Đã đặt lại dữ liệu trình diễn':'Không thể đặt lại dữ liệu','ok');
    return ok;
  }
  async function getCart(){
    const response=await fetch('/cart.js',{credentials:'same-origin',headers:{'Accept':'application/json'},cache:'no-store'});
    if(!response.ok) throw new Error('Không đọc được giỏ hàng Shopify');
    return response.json();
  }
  async function clearCart(){
    const response=await fetch('/cart/clear.js',{method:'POST',credentials:'same-origin',headers:{'Accept':'application/json','Content-Type':'application/json'},body:'{}'});
    if(!response.ok) throw new Error('Không xóa được giỏ hàng');
    return response.json();
  }
  document.addEventListener('click',event=>{
    const fav=event.target.closest('[data-cham-favorite]');
    if(fav){event.preventDefault();toggleFavorite({id:fav.dataset.productId,title:fav.dataset.productTitle,url:fav.dataset.productUrl,image:fav.dataset.productImage,price:fav.dataset.productPrice});return;}
    const checkout=event.target.closest('[data-cham-demo-checkout-link], a[href^="/checkout"],button[name="checkout"],input[name="checkout"]');
    if(checkout){event.preventDefault();event.stopPropagation();location.href='/pages/demo-checkout';}
  },true);
  document.addEventListener('submit',event=>{
    if(event.target.matches('form[action*="/cart"]') && event.submitter?.name==='checkout'){
      event.preventDefault();event.stopPropagation();location.href='/pages/demo-checkout';
    }
  },true);
  window.addEventListener('storage',e=>{if(e.key===KEY){state=read();document.dispatchEvent(new CustomEvent('cham:state',{detail:structured()}));}});
  window.CHAMDemo={getState:structured,points,earn,checkin,gameAward,redeem,setName,setAvatar,toggleFavorite,makeOrder,reset,getCart,clearCart,money,escapeHTML,dateKey,toast,rewards:REWARDS,storageFailed:()=>storageError};
  document.addEventListener('DOMContentLoaded',()=>{
    const status=$('[data-cham-points]');if(status)status.textContent=points();
    document.addEventListener('cham:state',()=>{
      $$('[data-cham-points]').forEach(node=>node.textContent=points());
      $$('[data-cham-favorite]').forEach(btn=>{let on=state.favoriteProducts.some(p=>p.id===btn.dataset.productId);btn.setAttribute('aria-pressed',on?'true':'false');btn.classList.toggle('is-active',on);});
    });
    document.dispatchEvent(new CustomEvent('cham:state',{detail:structured()}));
  });
})();