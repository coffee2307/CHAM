/* CHẠM catalog concept questions; not verified manufacturing claims. */
(function(){
'use strict';
const records=[{"id": "heel", "village": "Miếng chà gót chân", "region": "Danh mục CHẠM", "craft": "Chăm sóc gót chân", "material": "Miếng chà oval", "product": "Miếng chà gót chân", "method": "Kiểm tra độ nhám", "tip": "Mẫu miếng chà gót chân dạng oval; cần thử độ nhám trước khi sử dụng.", "source": "https://5yvv8u-44.myshopify.com/products/mieng-cha-got-chan"}, {"id": "dish", "village": "Miếng rửa bát", "region": "Danh mục CHẠM", "craft": "Làm sạch bát", "material": "Miếng chà chữ nhật", "product": "Miếng rửa bát", "method": "Thử tương thích bề mặt", "tip": "Miếng rửa bát dạng chữ nhật là mẫu cho nhà bếp; cần thử tương thích bề mặt.", "source": "https://5yvv8u-44.myshopify.com/products/mieng-rua-bat"}, {"id": "cup", "village": "Đế lót ly tròn", "region": "Danh mục CHẠM", "craft": "Lót ly", "material": "Đế lót tròn", "product": "Đế lót ly tròn", "method": "Chọn kích thước để bàn", "tip": "Đế lót ly tròn là mẫu vật dụng cho mặt bàn, với kích thước cần xác nhận.", "source": "https://5yvv8u-44.myshopify.com/products/de-lot-ly-tron"}, {"id": "mat", "village": "Thảm chùi chân", "region": "Danh mục CHẠM", "craft": "Chùi chân", "material": "Thảm chữ nhật", "product": "Thảm chùi chân", "method": "Kiểm tra khả năng chống trượt", "tip": "Thảm chùi chân dạng chữ nhật cần đánh giá đế và khả năng chống trượt.", "source": "https://5yvv8u-44.myshopify.com/products/tham-chui-chan"}, {"id": "cat", "village": "Bóng cho mèo", "region": "Danh mục CHẠM", "craft": "Đồ chơi cho mèo", "material": "Quả bóng sợi", "product": "Bóng cho mèo", "method": "Đánh giá rụng sợi", "tip": "Bóng xơ dừa cho mèo chỉ là mẫu concept, cần đánh giá rụng sợi và nguy cơ nuốt dị vật.", "source": "https://5yvv8u-44.myshopify.com/products/bong-meo"}, {"id": "plant", "village": "Chậu ươm", "region": "Danh mục CHẠM", "craft": "Ươm cây", "material": "Chậu ép dạng cốc", "product": "Chậu ươm", "method": "Xác minh chất kết dính", "tip": "Chậu ươm xơ dừa là mẫu thiết kế; thành phần chất kết dính và thông số cần xác nhận.", "source": "https://5yvv8u-44.myshopify.com/products/chau-uom"}];
function shuffle(input,random=Math.random){
 const arr=[...input];
 for(let i=arr.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
 return arr;
}
function buildQuestion(fact,random=Math.random){
 const forms=[
  {key:'craft',name:'Ứng dụng',prompt:r=>['Mẫu '+r.product.toLowerCase()+' được thiết kế cho nhu cầu nào?', 'Ứng dụng dự kiến của '+r.product.toLowerCase()+' là gì?'][Math.floor(random()*2)]},
  {key:'village',name:'Nhận diện sản phẩm',prompt:r=>['Mẫu nào có hình dáng '+r.material.toLowerCase()+'?', 'Nhận diện mẫu có dạng '+r.material.toLowerCase()+'?'][Math.floor(random()*2)]},
  {key:'material',name:'Hình dáng',prompt:r=>'Mẫu '+r.product.toLowerCase()+' có dạng nào trong catalog?'},
  {key:'product',name:'Sản phẩm',prompt:r=>'Mẫu nào thuộc ứng dụng '+r.craft.toLowerCase()+'?'},
  {key:'method',name:'Kiểm chứng',prompt:r=>'Điều nào cần chú ý với mẫu '+r.product.toLowerCase()+' theo mô tả catalog?'}
 ];
 const form=forms[Math.floor(random()*forms.length)];
 const key=form.key;
 const answer=fact[key];
 const distractors=shuffle(records.filter(r=>r.id!==fact.id).map(r=>r[key]).filter(v=>v!==answer),random).slice(0,3);
 const options=shuffle([answer,...distractors],random);
 if(options.length!==4||new Set(options).size!==4)throw Error('Question options invalid');
 return {id:fact.id+'-'+key+'-'+Math.floor(random()*1000000),factId:fact.id,kind:form.name,question:form.prompt(fact),answer,options,answerIndex:options.indexOf(answer),explanation:fact.tip,source:fact.source};
}
window.CHAMCraftKnowledge={records,shuffle,buildQuestion,generateRun:(count=5,random=Math.random)=>shuffle(records,random).slice(0,Math.max(1,Math.min(count,records.length)))};
})();
