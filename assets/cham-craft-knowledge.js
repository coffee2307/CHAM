/* Craft knowledge data used to generate varied questions at runtime.
   Sources: official Vietnam National Authority of Tourism and vietnam.travel.
   Static verified facts; prompts, distractors and order are procedurally generated. */
(function(){
'use strict';
const records=[
{id:'bat-trang',village:'Bát Tràng',region:'Hà Nội',craft:'Gốm sứ',material:'Đất sét',product:'Bình gốm',method:'Nung trong lò',tip:'Nghề gốm Bát Tràng kết hợp tạo hình, trang trí và nung sản phẩm trong lò.',source:'https://vietnam.travel/things-to-do/full-day-trip-bat-trang-pottery-village/'},
{id:'van-phuc',village:'Vạn Phúc',region:'Hà Nội',craft:'Dệt lụa',material:'Sợi tơ tằm',product:'Khăn lụa',method:'Dệt sợi trên khung',tip:'Vạn Phúc được biết đến với nghề dệt lụa truyền thống và các sản phẩm từ tơ tằm.',source:'https://vietnam.travel/things-to-do/wander-ancient-traditional-silk-villages-vietnam/'},
{id:'phu-vinh',village:'Phú Vinh',region:'Hà Nội',craft:'Mây tre đan',material:'Mây và tre',product:'Giỏ đan',method:'Đan nan bằng tay',tip:'Phú Vinh nổi tiếng về các sản phẩm mây tre đan tinh xảo.',source:'https://vietnamtourism.gov.vn/en/printer/20688?type=1'},
{id:'dong-ho',village:'Đông Hồ',region:'Bắc Ninh',craft:'Tranh dân gian',material:'Bản khắc gỗ',product:'Tranh in dân gian',method:'In từ bản khắc gỗ',tip:'Tranh Đông Hồ gắn với kỹ thuật in tranh dân gian từ ván khắc gỗ ở Bắc Ninh.',source:'https://vietnamtourism.gov.vn/en/post/5644'},
{id:'chuong',village:'Chuông',region:'Hà Nội',craft:'Làm nón lá',material:'Lá nón',product:'Nón lá',method:'Khâu lá lên khung nón',tip:'Làng Chuông ở Hà Nội được biết đến với nghề làm nón lá truyền thống.',source:'https://vietnam.travel/node/1452'},
{id:'quat-dong',village:'Quất Động',region:'Hà Nội',craft:'Thêu tay',material:'Chỉ thêu',product:'Đồ vải thêu',method:'Thêu bằng kim và chỉ',tip:'Quất Động là một trong những làng nghề thêu tay truyền thống tại Hà Nội.',source:'https://vietnamtourism.gov.vn/en/printer/20688?type=1'}
];
function shuffle(input,random=Math.random){
 const arr=[...input];
 for(let i=arr.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
 return arr;
}
function buildQuestion(fact,random=Math.random){
 const forms=[
  {key:'craft',name:'Nghề truyền thống gắn với làng',prompt:r=>['Làng '+r.village+' được biết đến với nghề nào?', 'Khi nhắc đến làng '+r.village+', nghề nào phù hợp nhất?'][Math.floor(random()*2)]},
  {key:'village',name:'Làng nghề',prompt:r=>['Nghề '+r.craft.toLowerCase()+' gắn với làng nào trong số này?', 'Đâu là làng nghề nổi tiếng với '+r.craft.toLowerCase()+'?'][Math.floor(random()*2)]},
  {key:'material',name:'Chất liệu',prompt:r=>'Trong các lựa chọn, chất liệu nào gắn với nghề '+r.craft.toLowerCase()+'?'},
  {key:'product',name:'Sản phẩm',prompt:r=>'Sản phẩm nào thường gắn với nghề '+r.craft.toLowerCase()+'?'},
  {key:'method',name:'Kỹ thuật',prompt:r=>'Hoạt động nào đặc trưng cho nghề '+r.craft.toLowerCase()+'?'}
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
