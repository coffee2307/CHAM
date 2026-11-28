/* Shared deterministic FAQ and scope rules; public information only. */
(function(g){
 const site='https://chamstore.site';
 const norm=v=>String(v??'').normalize('NFKC').replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F]/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/\s+/g,' ').trim();
 const refusal='Chammy chỉ hỗ trợ những nội dung về CHẠM thôi nha.';
 const unavailable='Chammy chưa xem được thông tin này lúc này ạ. Bạn xem danh mục ở '+site+'/collections/all hoặc liên hệ CHẠM tại '+site+'/pages/contact. Bạn thử lại sau nha.';
 const sensitive='Dạ, bạn đừng gửi mật khẩu, OTP, thông tin thẻ, số điện thoại hay địa chỉ nha. Nếu cần, bạn chọn Xem đơn demo để Chammy hỗ trợ ạ.';
 const blocked=/\b(?:ignore|override|bypass|jailbreak|developer mode|system prompt|developer prompt|api key|token secret|reveal|base64|rot13|sql injection|prompt injection|roleplay|role play|pretend|act as|bo qua|quen het|vo hieu|vuot qua|chi thi|huong dan he thong|lenh he thong|ma nguon|khoa api|mat khau|otp|gia mao|dong vai|nhap vai|gia vo|viet code|lap trinh|javascript|python|hack|giai toan|lam bai tap|viet bai van|viet truyen|chinh tri|thoi tiet|bitcoin|forex|dich doan van|translate|write code|solve math|write a poem|weather|politics)\b/i;
 const pii=/(?:\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|\b(?:\+?84|0)(?:[\s.-]?\d){9,10}\b|\b(?:\d[ -]?){12,19}\b|\bsk-[a-z0-9_-]{12,}\b|\b(?:otp|mat khau|password|cvv|cccd)\s*[:=]\s*\S+)/i;
 const domain=/\b(?:cham|chamstore|san pham|cua hang|mua|dat hang|don hang|don demo|gio hang|thanh toan|giao hang|van chuyen|doi tra|hoan tien|lien he|bao hanh|gia|ngan sach|ton kho|qua tang|goi qua|thiep|khac ten|ca nhan hoa|bo suu tap|xo dua|non la|hoa sen|trong dong|ao dai|gom|tre may|luc binh|co bang|coi|go|tham|de lot ly|cha got chan|bong meo|do choi|thu cung|lang nghe|cham play|diem|voucher|tro choi|tet|trung thu|tri an)\b/;
 const follow=/^(?:con (?:cai|mau|loai|mon|bo) (?:nay|kia|do)|bao nhieu(?: tien)?|gia bao nhieu|co mau khac khong|co khac ten khong|co re hon khong|cai nao|loai nao|mau nao|cho toi xem|noi ro hon|them vai mau|duoc khong|tai sao)[?!. ]*$/;
 const faqs=[
  [/^(?:xin chao|chao|hello|hi|hey|chao ban)[!?. ]*$/,'Chào bạn, Chammy đây. Bạn cần Chammy giúp gì ạ?'],
  [/^(?:cam on|cam on ban|thank you|thanks)[!?. ]*$/,'Dạ, Chammy cảm ơn bạn đã ghé CHẠM nha! Tôi luôn sẵn sàng hỗ trợ các câu hỏi về cửa hàng.'],
  [/^(?:(?:cham|cham store) la gi|gioi thieu (?:ve )?cham|cham ban gi|cham co gi)[?!. ]*$/,'CHẠM là dự án trình diễn về sản phẩm thủ công từ tài nguyên bản địa Việt Nam. Xơ dừa là dòng sản phẩm đầu tiên, bên cạnh gốm, tre mây, lục bình, cỏ và gỗ. Xem '+site+'/collections/all'],
  [/^(?:(?:cham )?co ban that khong|(?:cham )?co giao hang (?:that )?khong|(?:cham )?co thanh toan that khong|(?:cham )?co nhan don that khong|(?:cham )?co ship khong|(?:cham )?co cod khong)[?!. ]*$/,'CHẠM hiện là website trình diễn. Đơn hàng, thanh toán, vận chuyển và điểm thưởng chỉ là mô phỏng; không thu tiền hoặc giao hàng thật.'],
  [/^(?:(?:cham )?co khac ten khong|(?:cham )?co ca nhan hoa khong|cach khac ten|khac ten nhu the nao|ca nhan hoa nhu the nao)[?!. ]*$/,'Một số mẫu gỗ, tre hỗ trợ yêu cầu khắc tên; gốm có thể gửi yêu cầu trang trí chữ. Mở trang sản phẩm phù hợp để nhập nội dung, chọn kiểu chữ và xem trước. Phí và kỹ thuật thực tế chưa được xác nhận.'],
  [/^(?:(?:cham )?co goi qua khong|cach goi qua|(?:cham )?co thiep khong)[?!. ]*$/,'Bạn có thể chọn gói quà, dịp tặng và lời nhắn trên thiệp tại trang chi tiết sản phẩm. Đây là dịch vụ trình diễn, chưa thu phụ phí.'],
  [/^(?:xo dua (?:co|gom) (?:nhung )?(?:san pham )?gi|(?:cham )?co nhung san pham xo dua nao|dong san pham dau tien (?:la gi|cua cham la gi))[?!. ]*$/,'Dòng xơ dừa đầu tiên gồm đế lót ly, miếng chà gót chân, bóng cho mèo, đồ chơi hình xương cho chó và thảm. Xem '+site+'/collections/xo-dua'],
  [/^(?:(?:cham )?co bao nhieu tro choi|cham play la gi|cham play o dau|cach vao cham play)[?!. ]*$/,'CHẠM Play có 7 trò chơi trình diễn và hệ thống điểm demo. Bạn có thể khám phá tại '+site+'/pages/cham-play'],
  [/^(?:lien he cham|cach lien he cham|lien he o dau|lien he cua hang|cham lien he the nao)[?!. ]*$/,'Bạn có thể liên hệ CHẠM tại '+site+'/pages/contact'],
  [/^(?:xem san pham|danh muc san pham|xem tat ca san pham|san pham o dau)[?!. ]*$/,'Xem danh mục sản phẩm CHẠM tại '+site+'/collections/all'],
  [/^(?:cach dat hang|dat hang nhu the nao|mua hang nhu the nao|cach mua hang)[?!. ]*$/,'Chọn sản phẩm, thêm vào giỏ hàng và thực hiện các bước thanh toán mô phỏng trên website. CHẠM chưa nhận giao dịch thật.'],
  [/^(?:cach doi tra|chinh sach doi tra|bao hanh nhu the nao|chinh sach giao hang|phi van chuyen bao nhieu)[?!. ]*$/,'CHẠM hiện chưa có giao dịch thật nên chưa thể xác nhận phí vận chuyển, đổi trả hoặc bảo hành thương mại. Bạn có thể liên hệ '+site+'/pages/contact để tìm hiểu thêm.']
 ];
 function voice(answer){
  let questions=0;
  return String(answer??'').split(/(https?:\/\/[^\s<>()\]]+)/gi).map(part=>{
   if(/^https?:\/\//i.test(part))return part;
   return part
    .replace(/(?<![\p{L}\p{M}])(?:chúng tôi|tôi|tớ|mình)(?![\p{L}\p{M}])/giu,'Chammy')
    .replace(/!+(?=\s|$)/g,'.')
    .replace(/\?{2,}/g,'?')
    .replace(/\?(?=\s|$)/g,()=>++questions===1?'?':'.')
    .replace(/(?:\.{2,})(?=\s|$)/g,'.')
    .replace(/([.!?])\s+([.!?])/g,'$1')
    .replace(/[ \t]+([.,?!])/g,'$1');
  }).join('');
 }
 function classify(message,history=[]){
  const raw=String(message??''),q=norm(raw);
  if(!q)return {kind:'empty',answer:'Bạn chưa nhập câu hỏi.'};
  if(pii.test(raw)||pii.test(q))return {kind:'privacy',answer:sensitive};
  if(blocked.test(q)||/[<>{}\[\]\x00-\x08]/.test(raw)||/(?:^|\n)\s*(?:system|assistant|developer)\s*:/i.test(raw))return {kind:'refusal',answer:refusal};
  for(const [rx,answer] of faqs)if(rx.test(q))return {kind:'faq',answer:voice(answer)};
  if(/\b(?:don hang|don demo|ma don|cham-demo|tra cuu don|don cua toi)\b/.test(q))return {kind:'order'};
  if(domain.test(q))return {kind:'ai'};
  if(follow.test(q)&&history.slice(-2).some(x=>domain.test(norm(x?.content))&&!blocked.test(norm(x?.content))))return {kind:'ai'};
  return {kind:'refusal',answer:refusal};
 }
 function validAnswer(answer,products=[]){
  if(typeof answer!=='string'||!answer.trim()||answer.length>2400)return false;
  const q=norm(answer);
  if(blocked.test(q)||pii.test(answer)||/<[a-z!/]/i.test(answer))return false;
  const permitted=new Set([site+'/collections/all',site+'/collections/xo-dua',site+'/pages/cham-play',site+'/pages/contact',...products.map(p=>p.url)]);
  const urls=answer.match(/https?:\/\/[^\s<>()\]]+/gi)||[];
  if(urls.some(u=>!permitted.has(u.replace(/[.,!?;]+$/,''))))return false;
  if(/(?:javascript:|data:|www\.|(?:[a-z0-9-]+\.)+(?:com|net|org|io|dev)\b)/i.test(answer.replace(/https?:\/\/[^\s<>()\]]+/gi,'')))return false;
  return true;
 }
 function fallback(message,history=[]){const c=classify(message,history);return c.answer||(c.kind==='order'?'Dạ, Chammy chưa xem được đơn lúc này ạ. Bạn có thể xem lại đơn demo trong tài khoản CHẠM; không có giao hàng thật.':unavailable);}
 g.CHAMAI_RULES={voice,norm,classify,validAnswer,fallback,refusal,unavailable,site,faqCount:faqs.length};
})(globalThis);
