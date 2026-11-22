/* CHẠM Club 3.0: one browser-local profile, orders, favorites, rewards and SVG avatar picker. */
(() => {
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function mount(root,core){
 if(!root||!core)return;
 const assets=(()=>{try{return JSON.parse(document.getElementById('cham-avatar-catalog')?.textContent||'[]')}catch(_){return []}})();
 const avatarFromURL=u=>(String(u).match(/cham-avatar-(?:\d{2,3}|default)\.svg/)||[])[0]||'';
 const avatarFiles=assets.map(u=>({src:u,name:avatarFromURL(u)})).filter(x=>x.name);
 const avatarByName=name=>avatarFiles.find(f=>f.name===name)?.src||avatarFiles.find(f=>f.name==='cham-avatar-default.svg')?.src||'';
 const money=core.money;
 const get=()=>core.getState();
 const currTab=()=>{const tab=new URL(location.href).searchParams.get('tab')||'overview';return ['overview','orders','favorites','rewards','history','settings'].includes(tab)?tab:'overview';};
 const tabNames=[['overview','Tổng quan'],['orders','Đơn hàng'],['favorites','Đã lưu'],['rewards','Ưu đãi'],['history','Lịch sử điểm'],['settings','Cài đặt']];
 const date=iso=>{const d=new Date(iso);return Number.isFinite(d.getTime())?d.toLocaleDateString('vi-VN'):'—';};
 let modalOpen=false,avatarPage=0,avatarQuery='',avatarPageSize=24;
 const today=()=>core.dateKey();
 const hasCheckin=()=>get().ledger.some(l=>l.id==='daily:'+today());
 const avatarTag=(name,cls='')=>{
  const src=avatarByName(name);
  return src?'<img class="'+cls+'" loading="lazy" decoding="async" src="'+esc(src)+'" alt="Ảnh đại diện">':'<span class="'+cls+' cc-emoji-avatar" aria-hidden="true">'+esc(name||'◌')+'</span>';
 };
 const heading=(label,title,desc)=>'<div class="cc-heading"><p class="cc-overline">'+label+'</p><h2>'+title+'</h2><p>'+desc+'</p></div>';
 function nav(){
  const tab=currTab();
  return '<nav class="cc-tabs" aria-label="Các mục hồ sơ">'+tabNames.map(([key,name])=>'<a href="/pages/cham-club?tab='+key+'" '+(tab===key?'aria-current="page"':'')+'>'+name+'</a>').join('')+'</nav>';
 }
 function banner(){
  const st=get(),p=st.profile;
  return '<div class="cc-banner"><div class="cc-banner__identity"><div class="cc-avatar-wrap"><div class="cc-avatar">'+avatarTag(p.avatar,'cc-avatar-img')+'</div><button type="button" class="cc-avatar-camera" data-cc-avatar-open aria-label="Thay ảnh đại diện" title="Thay ảnh đại diện"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h3l2-2h6l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="3.6"/></svg></button></div><div><p class="cc-banner__eyebrow">TÀI KHOẢN TRẢI NGHIỆM</p><h1>'+esc(p.name)+'</h1><p>Giữ lại những món đồ yêu thích và tiếp tục hành trình tại CHẠM.</p></div></div><div class="cc-banner__wallet"><span>Số dư CHẠM Points</span><strong>'+core.points()+'</strong><a href="/pages/cham-club?tab=rewards">Đổi ưu đãi <span aria-hidden="true">→</span></a></div></div>';
 }
 function overview(){
  const st=get();
  const stats=[['Đơn hàng mô phỏng',st.orders.length,'orders'],['Sản phẩm đã lưu',st.favoriteProducts.length,'favorites'],['Lần chơi hoàn thành',st.gameStats.played,'/pages/cham-play']];
  return '<div class="cc-stats">'+stats.map(([title,count,dest])=>'<a class="cc-stat" href="'+(dest.startsWith('/')?dest:'/pages/cham-club?tab='+dest)+'"><span>'+title+'</span><strong>'+count+'</strong><small>Xem chi tiết <span aria-hidden="true">→</span></small></a>').join('')+'</div>'+
   '<div class="cc-dashboard-grid"><section class="cc-surface cc-checkin"><div class="cc-checkin__flower" aria-hidden="true">✳</div><p class="cc-overline">THƯỞNG HẰNG NGÀY</p><h3>Ghé CHẠM, nhận thêm 10 điểm.</h3><p>Tích điểm mỗi ngày để đổi voucher trong phiên demo.</p><button type="button" data-cc-checkin class="cc-button" '+(hasCheckin()?'disabled':'')+'>'+(hasCheckin()?'Đã nhận hôm nay':'Điểm danh nhận +10')+'</button></section>'+
   '<section class="cc-surface cc-continue"><p class="cc-overline">GỢI Ý TRẢI NGHIỆM</p><h3>Khám phá thêm mỗi ngày.</h3><a href="/pages/cham-play" class="cc-action-link"><span><strong>CHẠM Quest</strong><small>Chơi và khám phá làng nghề</small></span><span aria-hidden="true">→</span></a><a href="/collections/all" class="cc-action-link"><span><strong>Khám phá sản phẩm</strong><small>Tìm món đồ mới để lưu vào hồ sơ</small></span><span aria-hidden="true">→</span></a><a href="/pages/cham-club?tab=history" class="cc-action-link"><span><strong>Lịch sử điểm</strong><small>Kiểm tra lượt nhận và đổi thưởng</small></span><span aria-hidden="true">→</span></a></section></div>'+
   '<section class="cc-recent"><div class="cc-section-head"><h3>Hoạt động gần đây</h3><a href="/pages/cham-club?tab=history">Xem tất cả</a></div>'+historyItems(4)+'</section>';
 }
 function orderList(){
  const orders=get().orders;
  if(!orders.length)return heading('ĐƠN HÀNG','Chưa có đơn hàng','Bạn có thể trải nghiệm quy trình đặt hàng mô phỏng từ một sản phẩm bất kỳ.')+'<a href="/collections/all" class="cc-button cc-button--inline">Khám phá sản phẩm</a>';
  return heading('ĐƠN HÀNG','Lịch sử mua sắm','Mỗi đơn dưới đây được lưu trên trình duyệt của bạn, không phải giao dịch thật.')+
  '<div class="cc-order-list">'+orders.map(o=>'<details class="cc-order"><summary><div><strong>'+esc(o.id)+'</strong><span>'+date(o.createdAt)+' · '+(o.items?.length||0)+' mặt hàng</span></div><div><b>'+money(o.total)+'</b><small>Đơn mô phỏng</small></div></summary><div class="cc-order__lines">'+(o.items||[]).map(i=>'<div><span>'+esc(i.title)+' × '+Number(i.quantity)+'</span><strong>'+money((i.linePrice||0)/100)+'</strong></div>').join('')+'</div><p>Không có thanh toán hay giao nhận thực tế.</p></details>').join('')+'</div>';
 }
 function favorites(){
  const arr=get().favoriteProducts;
  if(!arr.length)return heading('ĐÃ LƯU','Danh sách còn trống','Lưu các sản phẩm bạn thích để xem lại bất cứ lúc nào.')+'<a class="cc-button cc-button--inline" href="/collections/all">Khám phá sản phẩm</a>';
  return heading('ĐÃ LƯU','Sản phẩm yêu thích','Những món đồ bạn đã lưu từ trang mua sắm.')+'<div class="cc-favorites">'+arr.map(p=>'<article class="cc-favorite"><a class="cc-favorite__photo" href="'+esc(p.url)+'">'+(p.image?'<img src="'+esc(p.image)+'" alt="'+esc(p.title)+'" loading="lazy">':'<span>CHẠM</span>')+'</a><div><a class="cc-favorite__title" href="'+esc(p.url)+'">'+esc(p.title)+'</a><p>'+money(Number(p.price)/100)+'</p><div class="cc-favorite__actions"><button type="button" data-cc-fav-cart="'+esc(p.id)+'">Thêm vào giỏ</button><button type="button" data-cc-fav-remove="'+esc(p.id)+'">Bỏ lưu</button></div></div></article>').join('')+'</div>';
 }
 function rewards(){
  const vouchers=get().vouchers;
  return heading('CHẠM POINTS','Đổi điểm lấy ưu đãi','Voucher chỉ sử dụng khi đặt hàng mô phỏng.')+
   '<div class="cc-rewards-summary"><div><span>Điểm đang có</span><strong>'+core.points()+'</strong><small>Đổi thưởng từ 100 điểm</small></div><a href="/pages/cham-play" class="cc-button">Chơi để tích điểm</a></div>'+
   '<div class="cc-reward-grid">'+core.rewards.vouchers.map(v=>'<article class="cc-reward"><p class="cc-reward__eyebrow">CHẠM CLUB</p><h3>'+esc(v.title)+'</h3><span>'+v.cost+' điểm</span><button type="button" data-cc-redeem="'+esc(v.code)+'" '+(core.points()<v.cost?'disabled':'')+'>'+(core.points()<v.cost?'Chưa đủ điểm':'Đổi voucher')+'</button></article>').join('')+'</div>'+
   '<div class="cc-section-head"><h3>Voucher của bạn</h3></div>'+
   (vouchers.length?'<div class="cc-owned">'+vouchers.map(v=>'<div class="cc-owned__line"><span><strong>'+esc(v.title)+'</strong><small>'+esc(v.code)+'</small></span><span class="'+(v.used?'is-used':'')+'">'+(v.used?'Đã dùng':'Sẵn sàng')+'</span>'+(v.used?'':'<button type="button" data-cc-copy="'+esc(v.code)+'">Sao chép</button>')+'</div>').join('')+'</div>':'<p class="cc-blank">Bạn chưa đổi voucher nào.</p>');
 }
 function historyItems(limit=100){
  const items=[...get().ledger].reverse().slice(0,limit);
  return '<div class="cc-ledger">'+items.map(row=>'<div class="cc-ledger__row"><span><strong>'+esc(row.description)+'</strong><small>'+date(row.createdAt)+'</small></span><b class="'+(row.delta>0?'is-plus':'is-minus')+'">'+(row.delta>0?'+':'')+row.delta+'</b></div>').join('')+'</div>';
 }
 function history(){return heading('LỊCH SỬ','Điểm thưởng của bạn','Mỗi lần cộng hoặc trừ điểm đều được ghi nhận trong phiên demo.')+historyItems();}
 function settings(){
  const st=get();
  return heading('CÀI ĐẶT','Cá nhân hóa hồ sơ','Bạn có thể đổi tên hiển thị hoặc chọn ảnh đại diện từ thư viện của CHẠM.')+
   '<div class="cc-settings-grid"><section class="cc-surface"><h3>Ảnh đại diện</h3><div class="cc-avatar-setting">'+avatarTag(st.profile.avatar,'cc-avatar-setting__img')+'<div><p>Chọn từ '+avatarFiles.length+' hình SVG.</p><button type="button" class="cc-button cc-button--light" data-cc-avatar-open>Thay ảnh đại diện</button></div></div><p class="cc-credits">Bộ ảnh Open Peeps của Pablo Stanley, giấy phép CC0.</p></section>'+
   '<section class="cc-surface"><h3>Tên hiển thị</h3><form data-cc-name-form><label for="cc-name">Tên của bạn</label><input type="text" id="cc-name" name="name" maxlength="42" minlength="2" required value="'+esc(st.profile.name)+'"><button class="cc-button cc-button--inline" type="submit">Lưu thay đổi</button></form></section></div>'+
   '<div class="cc-danger-area"><div><h3>Đặt lại dữ liệu</h3><p>Xóa hồ sơ, đơn hàng demo, điểm và voucher trên trình duyệt này.</p></div><button type="button" data-cc-reset>Đặt lại phiên demo</button></div>';
 }
 function modal(){
  const q=avatarQuery.toLowerCase();
  const list=avatarFiles.filter(f=>f.name.includes(q));
  const pages=Math.max(1,Math.ceil(list.length/avatarPageSize));
  avatarPage=Math.min(avatarPage,pages-1);
  const start=avatarPage*avatarPageSize;
  return '<div class="cc-modal-scrim" data-cc-modal><div class="cc-modal" role="dialog" aria-modal="true" aria-labelledby="cc-modal-title"><header><div><p class="cc-overline">THƯ VIỆN ẢNH</p><h2 id="cc-modal-title">Chọn avatar của bạn</h2><p>'+list.length+' ảnh có thể lựa chọn</p></div><button aria-label="Đóng cửa sổ chọn avatar" type="button" data-cc-avatar-close>×</button></header>'+
  '<label class="cc-modal-search"><span>Nhập mã hình (ví dụ: 015)</span><input data-cc-avatar-search type="search" value="'+esc(avatarQuery)+'" placeholder="Tìm mã avatar"></label>'+
  '<div class="cc-avatar-grid">'+list.slice(start,start+avatarPageSize).map((f,i)=>'<button type="button" class="'+(get().profile.avatar===f.name?'is-current':'')+'" data-cc-avatar-select="'+esc(f.name)+'" aria-label="Chọn avatar '+esc(f.name)+'" aria-pressed="'+(get().profile.avatar===f.name)+'"><img src="'+esc(f.src)+'" alt="" loading="lazy"><small>'+esc(f.name.replace('cham-avatar-','').replace('.svg',''))+'</small></button>').join('')+'</div>'+
  '<div class="cc-modal-pagination"><button type="button" data-cc-avatar-prev '+(avatarPage===0?'disabled':'')+'>Trước</button><span>'+(avatarPage+1)+' / '+pages+'</span><button type="button" data-cc-avatar-next '+(avatarPage>=pages-1?'disabled':'')+'>Sau</button></div></div></div>';
 }
 function render(){
  const screens={overview,orders:orderList,favorites,rewards,history,settings};
  const tab=currTab();
  root.innerHTML='<div class="cc-shell">'+banner()+nav()+'<section class="cc-content">'+screens[tab]()+'</section><p class="cc-demo-footnote">Dữ liệu được lưu trong trình duyệt. Không phải tài khoản mua sắm hoặc ví tiền thật.</p></div>'+(modalOpen?modal():'');
  if(modalOpen){const input=root.querySelector('[data-cc-avatar-search]');if(input)input.focus();}
 }
 async function addFavoriteToCart(id,button){
  const product=get().favoriteProducts.find(p=>p.id===id);
  if(!product)return;
  button.disabled=true;const old=button.textContent;button.textContent='Đang thêm…';
  try{
   const url=new URL(product.url,location.origin);
   if(url.origin!==location.origin||!url.pathname.startsWith('/products/'))throw Error('Đường dẫn sản phẩm không hợp lệ');
   const res=await fetch(url.pathname+'.js',{credentials:'same-origin'});
   if(!res.ok)throw Error('Không đọc được sản phẩm');
   const data=await res.json();
   const variant=data.variants?.find(v=>v.available);
   if(!variant)throw Error('Sản phẩm chưa có phiên bản để thêm giỏ');
   const added=await fetch('/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},credentials:'same-origin',body:JSON.stringify({id:variant.id,quantity:1})});
   if(!added.ok)throw Error('Không thể thêm sản phẩm');
   core.toast('Đã thêm sản phẩm vào giỏ');
   button.textContent='Đã thêm';
  }catch(err){core.toast(err.message||'Có lỗi khi thêm giỏ','error');}
  finally{setTimeout(()=>{button.disabled=false;button.textContent=old;},900);}
 }
 root.addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(!b){
   if(modalOpen&&e.target.matches('[data-cc-modal]')){modalOpen=false;render();}
   return;
  }
  if(b.hasAttribute('data-cc-checkin')){core.checkin();return;}
  if(b.dataset.ccRedeem){const res=core.redeem(b.dataset.ccRedeem);core.toast(res.message,res.ok?'ok':'error');return;}
  if(b.dataset.ccFavRemove){const p=get().favoriteProducts.find(p=>p.id===b.dataset.ccFavRemove);if(p)core.toggleFavorite(p);return;}
  if(b.dataset.ccFavCart){addFavoriteToCart(b.dataset.ccFavCart,b);return;}
  if(b.hasAttribute('data-cc-avatar-open')){modalOpen=true;avatarQuery='';avatarPage=0;render();return;}
  if(b.hasAttribute('data-cc-avatar-close')){modalOpen=false;render();return;}
  if(b.dataset.ccAvatarSelect){const ok=core.setAvatar(b.dataset.ccAvatarSelect);if(ok){modalOpen=false;core.toast('Đã cập nhật ảnh đại diện');render();}return;}
  if(b.hasAttribute('data-cc-avatar-next')){avatarPage++;render();return;}
  if(b.hasAttribute('data-cc-avatar-prev')){avatarPage=Math.max(0,avatarPage-1);render();return;}
  if(b.hasAttribute('data-cc-reset')&&confirm('Xóa toàn bộ dữ liệu demo trên trình duyệt này?')){core.reset();return;}
  if(b.dataset.ccCopy){if(navigator.clipboard?.writeText)navigator.clipboard.writeText(b.dataset.ccCopy).then(()=>core.toast('Đã sao chép mã')).catch(()=>core.toast('Không thể sao chép mã','error'));else core.toast('Trình duyệt chưa hỗ trợ sao chép tự động','error');return;}
 });
 root.addEventListener('input',e=>{if(e.target.matches('[data-cc-avatar-search]')){avatarQuery=e.target.value;avatarPage=0;render();}});
 root.addEventListener('submit',e=>{if(!e.target.matches('[data-cc-name-form]'))return;e.preventDefault();const value=new FormData(e.target).get('name');core.toast(core.setName(value)?'Đã lưu tên hiển thị':'Tên phải có ít nhất hai ký tự');});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modalOpen){modalOpen=false;render();}});
 document.addEventListener('cham:state',render);
 render();
}
window.CHAMClub={mount};
})();
