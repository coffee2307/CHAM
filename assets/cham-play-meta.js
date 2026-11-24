/* CHẠM Play 3.0 — browser-local engagement metadata.
   Collectible badges, stars and the daily reveal have no monetary value.
   The legacy CHAMDemo wallet remains the sole source of daily demo points. */
(()=>{
'use strict';
const KEY='cham_play_meta_v3', VERSION=3;
const MAX_ATTEMPTS=120;
const VALID_GAMES=['memory','quiz','match','word','speed','pack','wheel'];
const LEVELS=[
 {name:'Người khám phá',min:0},
 {name:'Người học nghề',min:100},
 {name:'Người am hiểu',min:300},
 {name:'Người giữ nghề',min:700},
 {name:'Nghệ nhân khám phá',min:1400}
];
const BADGES=[
 {id:'first',title:'Bước đầu khám phá',desc:'Hoàn thành một trò chơi'},
 {id:'knowledge',title:'Hiểu nghề',desc:'Trả lời đúng tổng cộng 15 câu hỏi'},
 {id:'collector',title:'Người sưu tầm',desc:'Hoàn thành năm thể loại trò chơi'},
 {id:'perfect',title:'Trọn vẹn',desc:'Đạt ba sao một trò chơi'},
 {id:'streak3',title:'Thường xuyên khám phá',desc:'Khám phá trong ba ngày liên tiếp'},
 {id:'gift',title:'Món quà hôm nay',desc:'Nhận phần quà sưu tầm demo'}
];
const QUESTS=[
 {id:'play',label:'Tham gia một trò chơi',target:1,field:'plays'},
 {id:'win',label:'Hoàn thành hai trò',target:2,field:'wins'},
 {id:'correct',label:'Trả lời đúng năm câu',target:5,field:'correct'},
 {id:'variety',label:'Thử ba trò khác nhau',target:3,field:'unique'}
];
function dateKey(){
 const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'});
 return fmt.format(new Date());
}
function isPrevDay(a,b){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(a)||!/^\d{4}-\d{2}-\d{2}$/.test(b))return false;
 const toNum=s=>Date.UTC(...s.split('-').map((n,i)=>i===1?Number(n)-1:Number(n)));
 return toNum(b)-toNum(a)===86400000;
}
const makeDaily=day=>({day,plays:0,wins:0,correct:0,unique:[],gift:false});
const make=()=>({
 schema:VERSION,xp:0,plays:0,wins:0,correct:0,
 completed:[],attempts:[],badges:[],stars:0,streak:0,lastPlayed:'',
 daily:makeDaily(dateKey()),gifts:[]
});
function clampInt(v,max=1000000){return Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;}
function safeRead(){
 try{
  const value=JSON.parse(localStorage.getItem(KEY));
  if(!value||value.schema!==VERSION)return make();
  const base=make();
  for(const key of ['xp','plays','wins','correct','stars','streak'])base[key]=clampInt(value[key]);
  for(const key of ['completed','badges','gifts','attempts']){
   base[key]=Array.isArray(value[key])?value[key].filter(x=>typeof x==='string').slice(-MAX_ATTEMPTS):[];
  }
  base.lastPlayed=typeof value.lastPlayed==='string'?value.lastPlayed:'';
  if(value.daily&&typeof value.daily==='object'&&value.daily.day===dateKey()){
   base.daily={...makeDaily(dateKey()),
    plays:clampInt(value.daily.plays),wins:clampInt(value.daily.wins),correct:clampInt(value.daily.correct),
    unique:Array.isArray(value.daily.unique)?value.daily.unique.filter(x=>VALID_GAMES.includes(x)):[],
    gift:!!value.daily.gift};
  }
  return base;
 }catch(_){return make();}
}
let state=safeRead();
const copy=x=>JSON.parse(JSON.stringify(x));
function ensureDay(){
 const day=dateKey();
 if(state.daily.day!==day)state.daily=makeDaily(day);
}
function commit(){
 try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){}
 try{document.dispatchEvent(new CustomEvent('cham:play-meta',{detail:summary()}));}catch(_){}
}
function level(){
 let index=0;
 LEVELS.forEach((l,i)=>{if(state.xp>=l.min)index=i;});
 const current=LEVELS[index],next=LEVELS[index+1];
 return {index,name:current.name,threshold:current.min,next:next?.min??null,
  progress:next?Math.max(0,Math.min(1,(state.xp-current.min)/(next.min-current.min))):1};
}
function missions(){
 ensureDay();
 return QUESTS.map(m=>{
  const count=m.field==='unique'?new Set(state.daily.unique).size:state.daily[m.field];
  return {...m,count:Math.min(m.target,clampInt(count)),done:count>=m.target};
 });
}
function summary(){
 ensureDay();
 return {xp:state.xp,stars:state.stars,plays:state.plays,wins:state.wins,correct:state.correct,
  completed:[...state.completed],badges:[...state.badges],streak:state.streak,
  level:level(),missions:missions(),giftClaimed:state.daily.gift,
  giftReady:missions().filter(q=>q.done).length>=2&&!state.daily.gift,
  daily:copy(state.daily),lastPlayed:state.lastPlayed};
}
function awardBadge(id){
 if(!BADGES.some(b=>b.id===id)||state.badges.includes(id))return false;
 state.badges.push(id);return true;
}
function recordAttempt(attempt){
 const id=String(attempt?.attemptId||'');
 const game=String(attempt?.gameId||'');
 if(!id||!VALID_GAMES.includes(game)||state.attempts.includes(id))return {ok:false,duplicate:true,summary:summary()};
 ensureDay();
 state.attempts.push(id);state.attempts=state.attempts.slice(-MAX_ATTEMPTS);
 const day=dateKey();
 if(state.lastPlayed!==day){
  state.streak=isPrevDay(state.lastPlayed,day)?state.streak+1:1;
  state.lastPlayed=day;
 }
 state.plays++;state.daily.plays++;
 if(!state.daily.unique.includes(game))state.daily.unique.push(game);
 const won=!!attempt.won;
 const correct=clampInt(attempt.correct||0,30);
 const starCount=won?Math.max(1,Math.min(3,clampInt(attempt.stars||1,3))):0;
 if(won){
  state.wins++;state.daily.wins++;
  if(!state.completed.includes(game))state.completed.push(game);
  state.stars+=starCount;
 }
 state.correct+=correct;state.daily.correct+=correct;
 state.xp+=Math.min(80,10+(won?25:0)+starCount*7+Math.min(15,correct*3));
 if(state.wins>=1)awardBadge('first');
 if(state.correct>=15)awardBadge('knowledge');
 if(state.completed.filter(x=>x!=='wheel').length>=5)awardBadge('collector');
 if(starCount===3)awardBadge('perfect');
 if(state.streak>=3)awardBadge('streak3');
 commit();
 return {ok:true,xp:state.xp,stars:starCount,summary:summary()};
}
function claimDailyGift(){
 ensureDay();
 if(state.daily.gift)return {ok:false,reason:'already-claimed'};
 if(missions().filter(q=>q.done).length<2)return {ok:false,reason:'not-ready'};
 state.daily.gift=true;
 awardBadge('gift');
 state.gifts.push(dateKey());state.gifts=state.gifts.slice(-60);
 // Fixed collectible for each day, not a randomized monetary reward.
 commit();
 return {ok:true,title:'Dấu ấn khám phá',description:'Huy hiệu sưu tầm trong CHẠM Play (demo)',summary:summary()};
}
function resetForTests(){
 state=make();commit();
}
window.CHAMPlayMeta={summary,recordAttempt,claimDailyGift,missions,levels:LEVELS,badges:BADGES,
 dateKey,resetForTests};
})();