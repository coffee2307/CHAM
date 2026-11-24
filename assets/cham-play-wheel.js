/* CHẠM Play daily discovery wheel. All rewards are non-transferable,
   nonmonetary demo collectibles. No random or chance-based cash prizes. */
(()=>{
'use strict';
const segments=[
 {label:'Gốm',color:'#d5ad8c',id:'pot'},
 {label:'Lụa',color:'#b5c6ac',id:'silk'},
 {label:'Tre',color:'#e8d2a1',id:'basket'},
 {label:'Nón',color:'#d9bdb5',id:'hat'},
 {label:'Tranh',color:'#bec8d7',id:'print'},
 {label:'Thêu',color:'#e4cdba',id:'sew'}
];
function dateIndex(day){
 return [...day].reduce((a,c)=>a+(c.charCodeAt(0)||0),0)%segments.length;
}
function create(metaSummary,day){
 return {ready:!!metaSummary.giftReady,claimed:!!metaSummary.giftClaimed,
  index:dateIndex(day),spinning:false,finished:false};
}
function spin(state,meta){
 if(!state.ready||state.claimed||state.spinning)return {ok:false};
 const result=meta.claimDailyGift();
 if(!result.ok)return result;
 state.claimed=true;state.spinning=true;
 return {ok:true,segment:segments[state.index],gift:result};
}
function stop(state){state.spinning=false;state.finished=true;}
window.CHAMPlayWheel={segments,create,spin,stop};
})();