import assert from 'node:assert/strict';
const base='https://camilla-mini-crm-preview.claudsobral.workers.dev';
const phone='839'+String(Math.floor(Date.now()/1000)%100000000).padStart(8,'0');
const results=await Promise.all(Array.from({length:12},(_,i)=>fetch(base+'/api/leads',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Teste Concorrencia CRM',phone:i%2?'55'+phone:phone,source:'teste'})}).then(async r=>({status:r.status,data:await r.json()}))));
assert(results.every(x=>x.status===200&&x.data.ok));
assert.equal(new Set(results.map(x=>x.data.id)).size,1);
assert.equal(results.filter(x=>!x.data.duplicate).length,1);
console.log('PASS 12 parallel POST requests => 1 unique lead ID; 11 deduplicated');
