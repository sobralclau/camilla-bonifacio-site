const assert=require('node:assert/strict');
(async()=>{
const base=process.env.CRM_BASE||'http://127.0.0.1:8789';
const suffix=String(Math.floor(Date.now()/1000)%100000000).padStart(8,'0');
const national='839'+suffix;
const lead={name:'Teste CRM Auditoria',phone:national,source:'auditoria'};
const post=(path,obj,headers={})=>fetch(base+path,{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(obj)});
let r=await fetch(base+'/admin/leads');assert.equal(r.status,403,'Admin must fail closed');
r=await fetch(base+'/admin/leads',{headers:{'Cf-Access-Jwt-Assertion':'fake.fake.fake'}});assert.equal(r.status,403,'Unsigned JWT must fail closed');
r=await post('/api/leads/attended',{id:1});assert.equal(r.status,403,'Attended requires auth');
r=await post('/api/leads',lead);const a=await r.json();assert.equal(r.status,200);assert.equal(a.ok,true);assert.equal(a.duplicate,undefined);
r=await post('/api/leads',{...lead,phone:'55'+national});const b=await r.json();assert.equal(b.duplicate,true);assert.equal(b.id,a.id);
r=await post('/api/leads',{...lead,phone:national});const c=await r.json();assert.equal(c.duplicate,true);assert.equal(c.id,a.id);
r=await fetch(base+'/');assert.equal(r.status,200);
console.log('PASS admin deny; forged JWT deny; attended deny; first insert; duplicates BR 55/DDD; public homepage.');
})().catch(e=>{console.error(e);process.exitCode=1});
