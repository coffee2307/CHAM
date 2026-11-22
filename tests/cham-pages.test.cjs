const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const coreSource=fs.readFileSync(path.join(__dirname,'../assets/cham-demo-core.js'),'utf8');
const pageSource=fs.readFileSync(path.join(__dirname,'../assets/cham-demo-pages.js'),'utf8');
async function render(mode,fragment=''){
 const root={dataset:{mode},innerHTML:'',handlers:{},addEventListener(evt,fn){this.handlers[evt]=fn;},querySelector(){return null;}};
 const events={};
 const document={
  querySelector:sel=>sel==='[data-cham-demo-app]'?root:null,
  querySelectorAll:()=>[],
  addEventListener:(type,handler)=>{events[type]??=[];events[type].push(handler);},
  dispatchEvent:event=>{(events[event.type]||[]).forEach(fn=>fn(event));},
  createElement:()=>({setAttribute:()=>{}}),
  body:{append:()=>{}}
 };
 const values=new Map(), storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};
 const cart={items:[{id:111,variant_id:123,product_title:'Bình gốm Mộc',quantity:2,final_line_price:57800000}],total_price:57800000};
 const fetch=async (url)=>({ok:true,json:async()=>url==='/cart.js'?cart:{items:[]}});
 const context={window:{addEventListener:()=>{}},document,localStorage:storage,Math,JSON,Number,String,Array,Object,Date,Intl,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},setTimeout,clearTimeout,fetch,location:{href:'https://test.example/pages/'+fragment},URL,console,confirm:()=>false};
 vm.runInNewContext(coreSource,context,{filename:'core.js'});
 vm.runInNewContext(pageSource,context,{filename:'pages.js'});
 await new Promise(resolve=>setImmediate(resolve));
 return {html:root.innerHTML,root,api:context.window.CHAMDemo};
}
(async()=>{
 let club=await render('club','cham-club');assert.match(club.html,/Góc của bạn/);assert.match(club.html,/Lưu tên/);assert.match(club.html,/Điểm danh/);
 let game=await render('play','cham-play');assert.match(game.html,/Ghép họa tiết/);assert.equal((game.html.match(/data-card=/g)||[]).length,8);
 let checkout=await render('checkout','demo-checkout');assert.match(checkout.html,/Xác nhận đơn hàng DEMO/);assert.match(checkout.html,/Bình gốm Mộc/);
 assert.match(checkout.html,/578\.000/);
 console.log('PASS: Club, Play (8 cards), Checkout (Shopify Ajax cart fixture) rendered without JavaScript error');
})().catch(e=>{console.error(e);process.exitCode=1});
