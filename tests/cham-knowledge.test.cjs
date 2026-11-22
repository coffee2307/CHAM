const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const context={window:{},Math,Array,Set,String,Error};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/cham-craft-knowledge.js'),'utf8'),context);
const data=context.window.CHAMCraftKnowledge;assert.equal(data.records.length,6);
const collected=new Set(),kinds=new Set();
for(let i=0;i<400;i++){
 const fact=data.records[i%data.records.length];
 const q=data.buildQuestion(fact);
 assert.equal(q.options.length,4);
 assert.equal(new Set(q.options).size,4);
 assert.equal(q.options[q.answerIndex],q.answer);
 assert.ok(q.source.startsWith('https://'));
 assert.ok(q.explanation.length>30);
 collected.add(q.question);kinds.add(q.kind);
}
assert.ok(collected.size>=22,'Question stems sufficiently varied');
assert.equal(kinds.size,5);
for(let i=0;i<40;i++){const run=data.generateRun(5);assert.equal(run.length,5);assert.equal(new Set(run.map(x=>x.id)).size,5);}
console.log('PASS: 400 generated questions, 5 templates, 6 verified craft records, randomized 5-stage runs');
