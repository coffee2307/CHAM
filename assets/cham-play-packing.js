/* CHẠM Play Packing — entirely simulated order-preparation game.
   Choices are educational scenarios, not claims about the store's real logistics. */
(()=>{
'use strict';
const PACKAGES=[
{id:'protect',name:'Hộp chống va đập',hint:'Giữ an toàn cho sản phẩm dễ vỡ',symbol:'▣'},
{id:'wrap',name:'Giấy gói mềm',hint:'Bọc vật dụng có bề mặt sợi hoặc hàng mềm',symbol:'▤'},
{id:'frame',name:'Hộp giữ dáng',hint:'Hạn chế sản phẩm bị méo khi vận chuyển',symbol:'▥'},
{id:'flat',name:'Bìa bảo vệ phẳng',hint:'Giữ sản phẩm dạng tờ không bị gấp',symbol:'▱'}
];
const byCraft={mat:'flat',cup:'protect',basket:'frame',chair:'frame',weave:'flat',spoon:'wrap'};
function shuffle(a){
 const b=[...a];for(let i=b.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[b[i],b[k]]=[b[k],b[i]];}return b;
}
function create(records){
 const queue=shuffle(records.filter(r=>byCraft[r.id])).slice(0,4).map(r=>({
  id:r.id,product:r.product,craft:r.craft,village:r.village,answer:byCraft[r.id]
 }));
 return {queue,index:0,correct:0,mistakes:0,selected:null,startedAt:Date.now()};
}
function select(s,id){
 if(!PACKAGES.some(x=>x.id===id)||s.selected!==null)return {done:false,correct:false};
 s.selected=id;
 if(id===s.queue[s.index].answer)s.correct++;
 else s.mistakes++;
 return {correct:id===s.queue[s.index].answer,done:false};
}
function next(s){
 if(s.selected===null)return false;
 s.selected=null;s.index++;
 return s.index>=s.queue.length;
}
function stars(s){
 return s.correct===4&&s.mistakes===0?3:s.correct===4&&s.mistakes<=1?2:s.correct>=3?1:0;
}
window.CHAMPlayPacking={PACKAGES,create,select,next,stars};
})();