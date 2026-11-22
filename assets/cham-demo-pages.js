/* CHẠM 2.0 demo views — uses browser-local CHAMDemo API. */
(() => {
'use strict';
const core = window.CHAMDemo;
const root = document.querySelector('[data-cham-demo-app]');
if (!root || !core) return;
const esc = core.escapeHTML, money = core.money;
const mode = root.dataset.mode;
const s = () => core.getState();
const $ = (sel,el=root)=>el.querySelector(sel);
const today = () => core.dateKey();
const fmt = x => new Date(x).toLocaleDateString('vi-VN');
const lead = (k,title,sub) => `<header class="cd-lead"><p class="cd-label">${k}</p><h1>${title}</h1><p>${sub}</p></header>`;
const empty = (message,url='/collections/all',label='Khám phá sản phẩm') => `<div class="cd-empty"><p>${message}</p><a class="cd-btn" href="${url}">${label}</a></div>`;
function pointHistory() {
 return `<div class="cd-history">${[...s().ledger].reverse().map(l=>`<div class="cd-history-item"><span><strong>${esc(l.description)}</strong><small>${fmt(l.createdAt)}</small></span><b class="${l.delta>0?'cd-plus':'cd-minus'}">${l.delta>0?'+':''}${l.delta} điểm</b></div>`).join('')}</div>`;
}
function rewardView() {
 const cards=core.rewards.vouchers.map(v=>`<article class="cd-voucher-card"><span aria-hidden="true">✿</span><h3>${v.title}</h3><p>Voucher chỉ dùng trong checkout mô phỏng.</p><button type="button" class="cd-btn cd-btn--light" data-redeem="${v.code}" ${core.points()<v.cost?'disabled':''}>Đổi ${v.cost} điểm</button></article>`).join('');
 const owned=s().vouchers.map(v=>`<div class="cd-earned-voucher"><strong>${esc(v.code)} · ${esc(v.title)}</strong><span>${v.used?'Đã dùng':'Có thể dùng'}</span></div>`).join('');
 return `<h2>Đổi điểm lấy quà</h2><p class="cd-muted">Hiện có <strong>${core.points()} điểm</strong> trong ví CHẠM.</p><div class="cd-voucher-grid">${cards}</div><h3>Voucher của bạn</h3>${owned||'<p>Chưa có voucher nào.</p>'}`;
}
function favoriteView() {
 const arr=s().favoriteProducts;
 if(!arr.length)return empty('Chưa có sản phẩm yêu thích.');
 return `<h2>Sản phẩm yêu thích</h2><div class="cd-fav-grid">${arr.map(p=>`<article class="cd-fav-card"><a href="${esc(p.url)}" class="cd-fav-visual">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">`:'<span>CHẠM</span>'}</a><div><a href="${esc(p.url)}">${esc(p.title)}</a><button type="button" data-remove-fav="${esc(p.id)}">Bỏ yêu thích</button></div></article>`).join('')}</div>`;
}
function orderView() {
 const list=s().orders;
 if(!list.length)return empty('Chưa có đơn hàng mô phỏng.');
 return `<h2>Đơn hàng demo</h2>${list.map(o=>`<details class="cd-order"><summary><span><strong>${esc(o.id)}</strong><small>${fmt(o.createdAt)}</small></span><b>${money(o.total)}</b></summary><p>Trạng thái: ${esc(o.status)}</p><ul>${o.items.map(i=>`<li>${esc(i.title)} × ${Number(i.quantity)}</li>`).join('')}</ul><p>Không có giao dịch hay vận chuyển thật.</p></details>`).join('')}`;
}
function profileView() {
 const st=s();
 return `<div class="cd-profile-head"><div class="cd-avatar">${esc(st.profile.avatar)}</div><div><small>THÀNH VIÊN DEMO</small><h2>${esc(st.profile.name)}</h2><p>Hồ sơ này lưu trên trình duyệt.</p></div><div class="cd-points"><small>Ví CHẠM</small><strong>${core.points()}</strong><span>điểm DEMO</span></div></div>
 <div class="cd-overview">
 <a href="/pages/cham-club?tab=orders" class="cd-overview-card"><span>Đơn hàng</span><strong>${st.orders.length}</strong><small>Xem lịch sử</small></a>
 <a href="/pages/cham-club?tab=favorites" class="cd-overview-card"><span>Yêu thích</span><strong>${st.favoriteProducts.length}</strong><small>Đã lưu</small></a>
 <a href="/pages/cham-play" class="cd-overview-card"><span>CHẠM Play</span><strong>${st.gameStats.played}</strong><small>Chơi nhận điểm</small></a>
 </div><div class="cd-two"><section class="cd-panel"><h3>Điểm danh hằng ngày</h3><p>Nhận 10 điểm mỗi ngày trên thiết bị này.</p><button class="cd-btn" type="button" data-checkin ${st.ledger.some(l=>l.id==='daily:'+today())?'disabled':''}>Nhận +10 điểm</button></section>
 <section class="cd-panel"><h3>Hồ sơ demo</h3><form id="cd-profile-form"><label for="cd-name">Tên hiển thị</label><input id="cd-name" name="name" maxlength="42" minlength="2" required value="${esc(st.profile.name)}"><button class="cd-btn" type="submit">Lưu tên</button></form><p>Chọn avatar</p><div class="cd-avatars">${['🌿','🌼','🏺','🧶','☀️','🪴','🌸','🍃'].map(a=>`<button type="button" data-avatar="${a}" aria-label="Avatar ${a}" aria-pressed="${st.profile.avatar===a}" class="${st.profile.avatar===a?'is-active':''}">${a}</button>`).join('')}</div></section></div>
 <div class="cd-reset"><span>Chỉ lưu dữ liệu mô phỏng trên trình duyệt.</span><button type="button" data-reset>Đặt lại dữ liệu demo</button></div>`;
}
function clubPage(){
 let tab=new URL(location.href).searchParams.get('tab')||'overview';
 const tabs=[['overview','Tổng quan'],['orders','Đơn hàng'],['favorites','Yêu thích'],['rewards','Ưu đãi'],['history','Lịch sử điểm']];
 if(!tabs.some(t=>t[0]===tab))tab='overview';
 const screens={overview:profileView,orders:orderView,favorites:favoriteView,rewards:rewardView,history:pointHistory};
 function render(){
  root.innerHTML=`<div class="cd-shell">${lead('CHẠM CLUB','Góc của bạn','Mua sắm, yêu thích, tích điểm và chơi game trên cùng một phiên trải nghiệm.') }
  <div class="cd-tabs" role="navigation" aria-label="Tài khoản demo">${tabs.map(([id,label])=>`<a href="/pages/cham-club?tab=${id}" class="${id===tab?'is-current':''}" ${id===tab?'aria-current="page"':''}>${label}</a>`).join('')}</div><div class="cd-main">${screens[tab]()}</div></div>`;
 }
 root.addEventListener('click',event=>{
  const b=event.target.closest('button'); if(!b)return;
  if(b.hasAttribute('data-checkin'))core.checkin();
  else if(b.dataset.avatar)core.setAvatar(b.dataset.avatar);
  else if(b.dataset.redeem){const r=core.redeem(b.dataset.redeem);core.toast(r.message,r.ok?'ok':'error');}
  else if(b.dataset.removeFav){const p=s().favoriteProducts.find(p=>p.id===b.dataset.removeFav); if(p)core.toggleFavorite(p);}
  else if(b.hasAttribute('data-reset')&&confirm('Đặt lại toàn bộ đơn demo, điểm thưởng và yêu thích trên thiết bị này?'))core.reset();
 });
 root.addEventListener('submit',e=>{
  if(e.target.id!=='cd-profile-form')return;
  e.preventDefault(); const v=new FormData(e.target).get('name');
  core.toast(core.setName(v)?'Đã cập nhật tên':'Tên phải có từ 2 ký tự');
 });
 document.addEventListener('cham:state',render);
 render();
}
function gamePage(){
 const symbols=['✿','◈','❖','☀'];
 let deck=[],opened=[],matched=[],turns=0,locked=false;
 function shuffle(){
  deck=[0,0,1,1,2,2,3,3];
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  opened=[];matched=[];turns=0;locked=false;
 }
 function render(){
  const claimed=s().ledger.some(l=>l.id==='game:'+today());
  root.innerHTML=`<div class="cd-shell">${lead('CHẠM PLAY','Ghép họa tiết thủ công','Tìm đủ bốn cặp hình. Nhận +20 điểm khi hoàn thành lần đầu trong ngày (bản DEMO).')}
  <div class="cd-game-layout"><section class="cd-panel cd-game"><div class="cd-game-top"><strong>Ghép cặp</strong><span>Lượt: ${turns} · ${matched.length/2}/4 cặp</span></div><div class="cd-grid">${deck.map((v,i)=>`<button class="cd-game-card ${opened.includes(i)||matched.includes(i)?'is-open':''}" type="button" data-card="${i}" aria-label="Thẻ ${i+1} ${matched.includes(i)?'đã ghép':opened.includes(i)?'đang mở':'đang úp'}" ${matched.includes(i)?'disabled':''}><span aria-hidden="true">${opened.includes(i)||matched.includes(i)?symbols[v]:'CHẠM'}</span></button>`).join('')}</div><div class="cd-game-bottom"><p role="status">${matched.length===8?'Đã hoàn thành!':claimed?'Đã nhận thưởng hôm nay. Bạn vẫn có thể chơi lại.':'Lật hai thẻ để tìm họa tiết giống nhau.'}</p><button class="cd-btn cd-btn--light" type="button" data-restart>Chơi lại</button></div></section>
  <aside class="cd-game-side"><div class="cd-panel"><p class="cd-label">VÍ CHẠM</p><p class="cd-score">${core.points()}</p><p>điểm DEMO</p><a href="/pages/cham-club?tab=rewards" class="cd-btn">Đổi phần thưởng</a></div><div class="cd-panel"><h3>Điểm danh hôm nay</h3><p>Nhận 10 điểm mỗi ngày.</p><button class="cd-btn cd-btn--light" type="button" data-checkin ${s().ledger.some(l=>l.id==='daily:'+today())?'disabled':''}>Nhận +10 điểm</button></div></aside></div></div>`;
 }
 root.addEventListener('click',e=>{
  const btn=e.target.closest('button');if(!btn)return;
  if(btn.hasAttribute('data-restart')){shuffle();render();return;}
  if(btn.hasAttribute('data-checkin')){core.checkin();render();return;}
  if(!btn.hasAttribute('data-card')||locked)return;
  const i=Number(btn.dataset.card);
  if(opened.includes(i)||matched.includes(i))return;
  opened.push(i);
  if(opened.length===2){
   turns++;locked=true;
   if(deck[opened[0]]===deck[opened[1]]){
    matched.push(...opened);opened=[];locked=false;
    if(matched.length===8){const award=core.gameAward(turns);core.toast(award?'Chúc mừng! +20 điểm':'Đã hoàn thành! Hôm nay đã nhận thưởng game.');}
   } else {render();setTimeout(()=>{opened=[];locked=false;render();},780);return;}
  }
  render();
 });
 document.addEventListener('cham:state',render);
 shuffle();render();
}
async function checkoutPage(){
 let cart=null;
 const cartPrice=x=>money(Number(x)/100);
 async function load(){
  root.innerHTML=`<div class="cd-shell">${lead('CHECKOUT DEMO','Đang tải giỏ hàng…','Đây là thao tác minh họa, không thu tiền thật.')}</div>`;
  try{cart=await core.getCart();render();}catch(err){root.innerHTML=`<div class="cd-shell">${lead('CHECKOUT DEMO','Chưa tải được giỏ hàng',esc(err.message))}<a class="cd-btn" href="/cart">Xem giỏ hàng</a></div>`;}
 }
 function render(){
  if(!cart?.items?.length){root.innerHTML=`<div class="cd-shell">${lead('CHECKOUT DEMO','Giỏ hàng trống','Hãy chọn sản phẩm để hoàn thành quy trình demo.')}${empty('Bạn chưa thêm sản phẩm.')}</div>`;return;}
  const subtotal=Number(cart.total_price)/100,vs=s().vouchers.filter(v=>!v.used);
  root.innerHTML=`<div class="cd-shell">${lead('CHẠM CHECKOUT','Đặt hàng mô phỏng','Không thanh toán, không tạo đơn Shopify, không vận chuyển hàng.')}
  <div class="cd-checkout-layout"><form class="cd-panel cd-form" id="cd-checkout">
  <h2>Thông tin nhận hàng DEMO</h2><label for="cd-fullname">Họ và tên</label><input id="cd-fullname" name="name" required maxlength="80" minlength="2" value="${esc(s().profile.name)}">
  <label for="cd-phone">Số điện thoại minh họa</label><input id="cd-phone" name="phone" inputmode="tel" pattern="[0-9+(). -]{9,20}" required placeholder="Số minh họa, không dùng dữ liệu thật">
  <label for="cd-address">Địa chỉ minh họa</label><input id="cd-address" name="address" required minlength="6" maxlength="180" placeholder="Ví dụ: Phòng trình diễn, trường học">
  <label for="cd-note">Ghi chú</label><textarea id="cd-note" name="note" maxlength="300" rows="3"></textarea>
  <label for="cd-voucher">Voucher DEMO</label><select id="cd-voucher" name="voucher"><option value="">Không sử dụng voucher</option>${vs.map(v=>`<option value="${esc(v.id)}" data-amount="${v.amount}">${esc(v.title)} · ${esc(v.code)}</option>`).join('')}</select>
  <div class="cd-payment"><strong>Thanh toán khi nhận hàng · MÔ PHỎNG</strong><p>Không xử lý giao dịch thật.</p></div>
  <button class="cd-btn cd-btn--wide" type="submit">Xác nhận đơn hàng DEMO</button><p role="alert" class="cd-error" hidden></p></form>
  <aside class="cd-panel cd-summary"><h2>Thông tin đơn</h2>
  ${cart.items.map(i=>`<div class="cd-summary-line"><span>${esc(i.product_title)} × ${i.quantity}</span><strong>${cartPrice(i.final_line_price)}</strong></div>`).join('')}
  <div class="cd-summary-line"><span>Tạm tính</span><strong>${money(subtotal)}</strong></div>
  <div class="cd-summary-line"><span>Voucher</span><strong data-discount>0đ</strong></div>
  <div class="cd-summary-line cd-summary-total"><strong>Tổng thanh toán DEMO</strong><strong data-total>${money(subtotal)}</strong></div>
  <a href="/cart" class="cd-btn cd-btn--light">Trở lại giỏ hàng</a><p class="cd-muted">Sản phẩm và giá chỉ phục vụ buổi trình diễn.</p></aside></div></div>`;
 }
 root.addEventListener('change',event=>{
  if(event.target.id!=='cd-voucher')return;
  const discount=Math.min(Number(cart.total_price)/100,Number(event.target.selectedOptions[0]?.dataset.amount)||0);
  $('[data-discount]').textContent='−'+money(discount);
  $('[data-total]').textContent=money(Math.max(0,Number(cart.total_price)/100-discount));
 });
 root.addEventListener('submit',async e=>{
  if(e.target.id!=='cd-checkout')return;
  e.preventDefault();const form=e.target;if(!form.reportValidity())return;
  const submit=$('button[type="submit"]',form);submit.disabled=true;submit.textContent='Đang xác nhận…';
  try{
   const current=await core.getCart();
   if(!current.items.length)throw Error('Giỏ hàng trống. Hãy quay lại chọn sản phẩm.');
   const entry=new FormData(form);
   const voucher=s().vouchers.find(v=>v.id===entry.get('voucher')&&!v.used);
   const subtotal=Number(current.total_price)/100;
   const discount=Math.min(subtotal,voucher?.amount||0);
   const result=core.makeOrder({items:current.items,subtotal,total:Math.max(1,subtotal-discount),discountId:voucher?.id,
    shipping:{name:String(entry.get('name')).trim(),phone:String(entry.get('phone')).trim(),address:String(entry.get('address')).trim(),note:String(entry.get('note')||'').trim()}});
   if(!result.ok)throw Error(result.error);
   try{await core.clearCart();}catch(err){core.toast('Đơn đã lưu nhưng giỏ chưa được xóa.','error');}
   root.innerHTML=`<div class="cd-shell cd-completed"><div class="cd-check">✓</div><p class="cd-label">THÀNH CÔNG · DEMO</p><h1>Đơn hàng mô phỏng đã ghi nhận</h1><p>${esc(result.order.id)}</p><h2>+${result.pointsEarned} điểm CHẠM</h2><p>Đây không phải đơn hàng hoặc giao dịch Shopify thật.</p><div class="cd-actions"><a href="/pages/cham-club?tab=orders" class="cd-btn">Xem lịch sử đơn hàng</a><a href="/pages/cham-play" class="cd-btn cd-btn--light">Chơi CHẠM Play</a></div></div>`;
  }catch(err){const error=$('.cd-error',form);error.hidden=false;error.textContent=err.message;submit.disabled=false;submit.textContent='Xác nhận đơn hàng DEMO';}
 });
 load();
}
if(mode==='club'){if(window.CHAMClub?.mount)window.CHAMClub.mount(root,core);else clubPage();}
else if(mode==='play'){if(window.CHAMQuest?.mount)window.CHAMQuest.mount(root,core);else gamePage();}
else if(mode==='checkout')checkoutPage();
})();
