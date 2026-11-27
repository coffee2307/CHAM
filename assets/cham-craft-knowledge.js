/* CHẠM catalog concept questions; not verified manufacturing claims. */
(function(){
'use strict';
const records=[{"id": "mat", "village": "Thảm chùi chân", "region": "Danh mục CHẠM", "craft": "Chùi chân", "material": "Xơ dừa", "product": "Thảm chùi chân", "method": "Kiểm tra khả năng chống trượt", "tip": "Thảm chùi chân là mẫu tham khảo thuộc nhóm xơ dừa; cần kiểm tra khả năng chống trượt trước khi sử dụng thực tế.", "source": "https://5yvv8u-44.myshopify.com/products/tham-chui-chan"}, {"id": "cup", "village": "Ly gốm thủ công", "region": "Danh mục CHẠM", "craft": "Đựng đồ uống", "material": "Gốm", "product": "Ly gốm thủ công", "method": "Kiểm tra men và tương thích thực phẩm", "tip": "Ly gốm thủ công là mẫu tham khảo thuộc nhóm gốm; cần kiểm tra men và tương thích thực phẩm trước khi sử dụng thực tế.", "source": "https://5yvv8u-44.myshopify.com/products/ly-gom-thu-cong"}, {"id": "basket", "village": "Giỏ tre đan", "region": "Danh mục CHẠM", "craft": "Đựng vật dụng", "material": "Tre", "product": "Giỏ tre đan", "method": "Kiểm tra mối đan và cạnh nan", "tip": "Giỏ tre đan là mẫu tham khảo thuộc nhóm tre; cần kiểm tra mối đan và cạnh nan trước khi sử dụng thực tế.", "source": "https://5yvv8u-44.myshopify.com/products/gio-tre-dan"}, {"id": "chair", "village": "Ghế mây", "region": "Danh mục CHẠM", "craft": "Ngồi", "material": "Mây", "product": "Ghế mây", "method": "Kiểm tra kết cấu chịu lực", "tip": "Ghế mây là mẫu tham khảo thuộc nhóm mây; cần kiểm tra kết cấu chịu lực trước khi sử dụng thực tế.", "source": "https://5yvv8u-44.myshopify.com/products/ghe-may"}, {"id": "weave", "village": "Chiếu lục bình", "region": "Danh mục CHẠM", "craft": "Trải sàn", "material": "Lục bình", "product": "Chiếu lục bình", "method": "Kiểm tra độ ẩm và liên kết sợi", "tip": "Chiếu lục bình là mẫu tham khảo thuộc nhóm lục bình; cần kiểm tra độ ẩm và liên kết sợi trước khi sử dụng thực tế.", "source": "https://5yvv8u-44.myshopify.com/products/chieu-luc-binh"}, {"id": "spoon", "village": "Muỗng gỗ", "region": "Danh mục CHẠM", "craft": "Dùng khi ăn hoặc chế biến", "material": "Gỗ", "product": "Muỗng gỗ", "method": "Kiểm tra bề mặt và lớp hoàn thiện", "tip": "Muỗng gỗ là mẫu tham khảo thuộc nhóm gỗ; cần kiểm tra bề mặt và lớp hoàn thiện trước khi sử dụng thực tế.", "source": "https://5yvv8u-44.myshopify.com/products/muong-go"}];
function shuffle(input,random=Math.random){
 const arr=[...input];
 for(let i=arr.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
 return arr;
}
function buildQuestion(fact,random=Math.random){
 const forms=[
  {key:'craft',name:'Ứng dụng',prompt:r=>['Mẫu '+r.product.toLowerCase()+' được thiết kế cho nhu cầu nào?', 'Ứng dụng dự kiến của '+r.product.toLowerCase()+' là gì?'][Math.floor(random()*2)]},
  {key:'village',name:'Nhận diện sản phẩm',prompt:r=>['Mẫu nào sử dụng chất liệu '+r.material.toLowerCase()+'?', 'Nhận diện mẫu từ chất liệu '+r.material.toLowerCase()+'?'][Math.floor(random()*2)]},
  {key:'material',name:'Chất liệu',prompt:r=>'Mẫu '+r.product.toLowerCase()+' thuộc nhóm chất liệu nào trong catalog?'},
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
