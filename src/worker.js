const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
const clean=(v,max=220)=>String(v??"").trim().slice(0,max);
const digits=v=>String(v??"").replace(/\D/g,"");
const ADMIN_USER="admin";
const ADMIN_PASS_HASH="80c42362432d687ca51e1e8d819bcee8756b1c6ae61a3205b5c983651021fd12";

async function sha256Hex(value){
  const data=new TextEncoder().encode(value);
  const digest=await crypto.subtle.digest("SHA-256",data);
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
async function isAdmin(request){
  const auth=request.headers.get("authorization")||"";
  if(!auth.startsWith("Basic "))return false;
  try{
    const decoded=atob(auth.slice(6));
    const i=decoded.indexOf(":");
    return i>=0 && decoded.slice(0,i)===ADMIN_USER && (await sha256Hex(decoded.slice(i+1)))===ADMIN_PASS_HASH;
  }catch{return false}
}
function unauthorized(){
  return new Response("Autenticação necessária.",{status:401,headers:{"WWW-Authenticate":'Basic realm="Camilla Bonifácio Leads", charset="UTF-8"',"cache-control":"no-store"}});
}
async function ensureTable(env){
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS camilla_leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    cta_id TEXT,
    section TEXT,
    context TEXT,
    source TEXT,
    page TEXT,
    referrer TEXT,
    status TEXT NOT NULL DEFAULT 'aguardando',
    created_at TEXT NOT NULL,
    attended_at TEXT
  )`).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_camilla_leads_created_at ON camilla_leads(created_at)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_camilla_leads_phone ON camilla_leads(phone)").run();
}
async function saveLead(request,env){
  if(!env.DB)return json({ok:false,error:"D1_NOT_BOUND"},503);
  let body;try{body=await request.json()}catch{return json({ok:false,error:"INVALID_JSON"},400)}
  const name=clean(body.name,100),phone=digits(body.phone).slice(0,15);
  if(name.length<2||phone.length<10)return json({ok:false,error:"INVALID_DATA"},422);
  await ensureTable(env);
  const createdAt=new Date().toISOString();
  try{
    const r=await env.DB.prepare(`INSERT INTO camilla_leads
      (name,phone,cta_id,section,context,source,page,referrer,status,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?)`)
      .bind(name,phone,clean(body.cta_id,80),clean(body.section,120),clean(body.context,600),clean(body.source,120),clean(body.page,700),clean(body.referrer,700),"aguardando",createdAt).run();
    return json({ok:true,id:r.meta?.last_row_id??null,created_at:createdAt});
  }catch(e){console.error(e);return json({ok:false,error:"DB_WRITE_FAILED"},500)}
}
function esc(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function fmtPhone(v){const d=digits(v);return d.length===11?`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`:v}
async function markAttended(request,env){
  if(!(await isAdmin(request)))return unauthorized();
  let body;try{body=await request.json()}catch{return json({ok:false,error:"INVALID_JSON"},400)}
  const id=Number(body.id);if(!Number.isInteger(id)||id<1)return json({ok:false,error:"INVALID_ID"},422);
  await ensureTable(env);
  await env.DB.prepare("UPDATE camilla_leads SET status='atendido', attended_at=? WHERE id=?").bind(new Date().toISOString(),id).run();
  return json({ok:true});
}
async function adminPage(request,env){
  if(!(await isAdmin(request)))return unauthorized();
  if(!env.DB)return new Response("Banco de leads não vinculado.",{status:503,headers:{"content-type":"text/plain; charset=utf-8"}});
  await ensureTable(env);
  const url=new URL(request.url);const days=Math.max(1,Math.min(365,Number(url.searchParams.get("days")||30)));
  const result=await env.DB.prepare("SELECT * FROM camilla_leads WHERE created_at >= datetime('now', ?) ORDER BY id DESC LIMIT 1000").bind(`-${days} days`).all();
  const rows=result.results||[];
  const trs=rows.map(r=>`<tr>
    <td>${esc(new Intl.DateTimeFormat("pt-BR",{timeZone:"America/Fortaleza",dateStyle:"short",timeStyle:"short"}).format(new Date(r.created_at)))}</td>
    <td><strong>${esc(r.name)}</strong></td><td>${esc(fmtPhone(r.phone))}</td><td>${esc(r.section||"Site")}</td><td class="context">${esc(r.context||"")}</td>
    <td><span class="status status--${r.status==="atendido"?"done":"wait"}">${r.status==="atendido"?"Atendido":"Aguardando"}</span></td>
    <td><button class="wa" data-id="${r.id}" data-phone="${esc(digits(r.phone))}" data-name="${esc(r.name)}">WhatsApp</button></td>
  </tr>`).join("");
  const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Camilla Bonifácio | Leads</title><style>
  :root{--off:#F6EFE6;--copper:#A8694E;--graphite:#2F2F2F;--line:#e6ddd6}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:var(--off);color:var(--graphite)}.wrap{max-width:1280px;margin:auto;padding:28px 16px}.head{display:flex;justify-content:space-between;gap:16px;align-items:end;flex-wrap:wrap;margin-bottom:18px}h1{margin:0}.sub{color:#6f655f;font-size:13px}.card{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden}.table{overflow:auto}table{width:100%;border-collapse:collapse;min-width:1000px}th,td{padding:13px 14px;border-bottom:1px solid var(--line);text-align:left;font-size:12px}th{background:#fbf8f5;color:#756a63;text-transform:uppercase;font-size:10px;letter-spacing:.05em}.context{max-width:340px}.status{display:inline-block;border-radius:999px;padding:5px 8px;font-weight:800}.status--wait{background:#f2e6df;color:#854D37}.status--done{background:#e8f3ea;color:#286239}.wa{border:0;background:#25D366;color:#fff;padding:8px 10px;border-radius:9px;font-weight:800;cursor:pointer}select{height:42px;border:1px solid var(--line);border-radius:10px;padding:0 12px}.meta{padding:14px;color:#6f655f;font-size:12px;border-bottom:1px solid var(--line)}.preview-link{display:inline-flex;align-items:center;min-height:40px;padding:0 13px;border-radius:10px;background:#854D37;color:#fff;text-decoration:none;font-size:12px;font-weight:700}.preview-link:hover{background:#653B2A}
  </style></head><body><div class="wrap"><div class="head"><div><h1>Leads Camilla Bonifácio</h1><div class="sub">Contatos capturados pelo site</div></div><a class="preview-link" href="/admin/crm-preview">Abrir prévia do CRM</a><form><select name="days" onchange="this.form.submit()"><option value="7" ${days===7?"selected":""}>7 dias</option><option value="30" ${days===30?"selected":""}>30 dias</option><option value="90" ${days===90?"selected":""}>90 dias</option><option value="365" ${days===365?"selected":""}>1 ano</option></select></form></div><div class="card"><div class="meta"><strong>${rows.length}</strong> lead(s) no período</div><div class="table"><table><thead><tr><th>Data</th><th>Nome</th><th>WhatsApp</th><th>Origem</th><th>Interesse</th><th>Status</th><th>Ação</th></tr></thead><tbody>${trs||'<tr><td colspan="7">Nenhum lead encontrado.</td></tr>'}</tbody></table></div></div></div><script>
  document.querySelectorAll('.wa').forEach(btn=>btn.addEventListener('click',async()=>{
    const id=Number(btn.dataset.id),phone=btn.dataset.phone,name=btn.dataset.name;
    try{await fetch('/api/leads/attended',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id})});}catch{}
    location.href='https://wa.me/55'+phone+'?text='+encodeURIComponent('Olá, '+name+'. Sou da equipe da Camilla Bonifácio. Recebi seu contato pelo site e estou entrando em contato para dar continuidade ao atendimento.');
  }));
  </script></body></html>`;
  return new Response(html,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-robots-tag":"noindex, nofollow, noarchive"}});
}
export default{async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==="/api/leads")return request.method==="POST"?saveLead(request,env):json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
  if(url.pathname==="/api/leads/attended")return request.method==="POST"?markAttended(request,env):json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
  if(url.pathname==="/admin/crm-preview"||url.pathname==="/admin/crm-preview/"||url.pathname==="/admin/crm-preview/index.html"){
    if(request.method!=="GET")return json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
    if(!(await isAdmin(request)))return unauthorized();
    const page=await env.ASSETS.fetch(new Request(new URL("/admin/crm-preview/index.html",url),{headers:request.headers}));
    const headers=new Headers(page.headers);
    headers.set("cache-control","private, no-store");
    headers.set("x-robots-tag","noindex, nofollow, noarchive");
    return new Response(page.body,{status:page.status,headers});
  }
  if(url.pathname==="/admin/leads")return request.method==="GET"?adminPage(request,env):json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
  return env.ASSETS.fetch(request);
}};