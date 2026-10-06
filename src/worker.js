import { json as coreJson } from "./crm-core/utils.js";
import { validateLeadInput } from "./crm-core/leads.js";
import { normalizeLifecycle, normalizeOutcome, canCloseAsLost, canCloseAsWon } from "./crm-core/lifecycle.js";
import clientConfig from "./crm-client/camilla.config.js";

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
  :root{--off:#F6EFE6;--copper:#A8694E;--graphite:#2F2F2F;--line:#e6ddd6}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:var(--off);color:var(--graphite)}.wrap{max-width:1280px;margin:auto;padding:28px 16px}.head{display:flex;justify-content:space-between;gap:16px;align-items:end;flex-wrap:wrap;margin-bottom:18px}h1{margin:0}.sub{color:#6f655f;font-size:13px}.card{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden}.table{overflow:auto}table{width:100%;border-collapse:collapse;min-width:1000px}th,td{padding:13px 14px;border-bottom:1px solid var(--line);text-align:left;font-size:12px}th{background:#fbf8f5;color:#756a63;text-transform:uppercase;font-size:10px;letter-spacing:.05em}.context{max-width:340px}.status{display:inline-block;border-radius:999px;padding:5px 8px;font-weight:800}.status--wait{background:#f2e6df;color:#854D37}.status--done{background:#e8f3ea;color:#286239}.wa{border:0;background:#25D366;color:#fff;padding:8px 10px;border-radius:9px;font-weight:800;cursor:pointer}select{height:42px;border:1px solid var(--line);border-radius:10px;padding:0 12px}.meta{padding:14px;color:#6f655f;font-size:12px;border-bottom:1px solid var(--line)}
  </style></head><body><div class="wrap"><div class="head"><div><h1>Leads Camilla Bonifácio</h1><div class="sub">Contatos capturados pelo site</div></div><form><select name="days" onchange="this.form.submit()"><option value="7" ${days===7?"selected":""}>7 dias</option><option value="30" ${days===30?"selected":""}>30 dias</option><option value="90" ${days===90?"selected":""}>90 dias</option><option value="365" ${days===365?"selected":""}>1 ano</option></select></form></div><div class="card"><div class="meta"><strong>${rows.length}</strong> lead(s) no período</div><div class="table"><table><thead><tr><th>Data</th><th>Nome</th><th>WhatsApp</th><th>Origem</th><th>Interesse</th><th>Status</th><th>Ação</th></tr></thead><tbody>${trs||'<tr><td colspan="7">Nenhum lead encontrado.</td></tr>'}</tbody></table></div></div></div><script>
  document.querySelectorAll('.wa').forEach(btn=>btn.addEventListener('click',async()=>{
    const id=Number(btn.dataset.id),phone=btn.dataset.phone,name=btn.dataset.name;
    try{await fetch('/api/leads/attended',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id})});}catch{}
    location.href='https://wa.me/55'+phone+'?text='+encodeURIComponent('Olá, '+name+'. Sou da equipe da Camilla Bonifácio. Recebi seu contato pelo site e estou entrando em contato para dar continuidade ao atendimento.');
  }));
  </script></body></html>`;
  return new Response(html,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-robots-tag":"noindex, nofollow, noarchive"}});
}
async function ensurePreviewCrmSchema(env){
  await ensureTable(env);
  const desired=[
    ["lifecycle_status","TEXT NOT NULL DEFAULT 'waiting'"],
    ["outcome","TEXT NOT NULL DEFAULT 'open'"],
    ["loss_reason","TEXT"],
    ["deal_value_cents","INTEGER"],
    ["notes","TEXT"],
    ["updated_at","TEXT"]
  ];
  const info=await env.DB.prepare("PRAGMA table_info(camilla_leads)").all();
  const existing=new Set((info.results||[]).map(r=>r.name));
  for(const [name,type] of desired){
    if(!existing.has(name))await env.DB.prepare(`ALTER TABLE camilla_leads ADD COLUMN ${name} ${type}`).run();
  }
}
const isCrmPreview=env=>env?.CRM_TEST_MODE==="preview";
async function previewCreateLead(request,env){
  if(!isCrmPreview(env))return json({ok:false,error:"PREVIEW_ONLY"},404);
  let body;try{body=await request.json()}catch{return json({ok:false,error:"INVALID_JSON"},400)}
  const validation=validateLeadInput(body);
  if(!validation.ok)return json({ok:false,error:"INVALID_DATA",details:validation.errors},422);
  await ensurePreviewCrmSchema(env);
  const phone=validation.lead.phone;
  const existing=await env.DB.prepare("SELECT COUNT(*) AS total FROM camilla_leads WHERE phone=? AND source='crm_operational_test'").bind(phone).first();
  const previous=Number(existing?.total||0);
  const now=new Date().toISOString();
  const result=await env.DB.prepare(`INSERT INTO camilla_leads
    (name,phone,cta_id,section,context,source,page,referrer,status,created_at,lifecycle_status,outcome,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(
      validation.lead.name,
      phone,
      "crm-test",
      clean(body.section||"curadoria_imobiliaria",120),
      clean(body.context||"Teste operacional CRM",600),
      "crm_operational_test",
      clean(body.page||"/api/crm-test/leads",700),
      "crm-test",
      "aguardando",
      now,
      "waiting",
      "open",
      now
    ).run();
  return json({
    ok:true,
    id:result.meta?.last_row_id??null,
    duplicate:previous>0,
    duplicate_count:previous+1,
    created_at:now
  },201);
}
async function previewListLeads(env){
  if(!isCrmPreview(env))return json({ok:false,error:"PREVIEW_ONLY"},404);
  await ensurePreviewCrmSchema(env);
  const result=await env.DB.prepare(`SELECT id,name,phone,section,status,lifecycle_status,outcome,loss_reason,deal_value_cents,notes,created_at,updated_at,
    (SELECT COUNT(*) FROM camilla_leads x WHERE x.phone=camilla_leads.phone AND x.source='crm_operational_test') AS duplicate_count
    FROM camilla_leads
    WHERE source='crm_operational_test'
    ORDER BY id DESC LIMIT 200`).all();
  return json({ok:true,rows:result.results||[]});
}
async function previewUpdateLead(request,env){
  if(!isCrmPreview(env))return json({ok:false,error:"PREVIEW_ONLY"},404);
  let body;try{body=await request.json()}catch{return json({ok:false,error:"INVALID_JSON"},400)}
  const id=Number(body.id);
  if(!Number.isInteger(id)||id<1)return json({ok:false,error:"INVALID_ID"},422);
  await ensurePreviewCrmSchema(env);
  const lifecycle=normalizeLifecycle(body.lifecycle_status);
  const outcome=normalizeOutcome(body.outcome);
  const lossReason=clean(body.loss_reason,240);
  const dealValueCents=body.deal_value_cents==null?null:Number(body.deal_value_cents);
  if(!canCloseAsLost({outcome,lossReason}))return json({ok:false,error:"LOSS_REASON_REQUIRED"},422);
  if(!canCloseAsWon({outcome,dealValueCents}))return json({ok:false,error:"DEAL_VALUE_REQUIRED"},422);
  const notes=clean(body.notes,800);
  const now=new Date().toISOString();
  const r=await env.DB.prepare(`UPDATE camilla_leads
    SET lifecycle_status=?, outcome=?, loss_reason=?, deal_value_cents=?, notes=?, status=?, attended_at=CASE WHEN ?='waiting' THEN attended_at ELSE COALESCE(attended_at,?) END, updated_at=?
    WHERE id=? AND source='crm_operational_test'`)
    .bind(lifecycle,outcome,lossReason||null,Number.isFinite(dealValueCents)?Math.round(dealValueCents):null,notes||null,lifecycle==="waiting"?"aguardando":"atendido",lifecycle,now,now,id).run();
  if(!r.meta?.changes)return json({ok:false,error:"LEAD_NOT_FOUND"},404);
  const row=await env.DB.prepare("SELECT * FROM camilla_leads WHERE id=? LIMIT 1").bind(id).first();
  return json({ok:true,row});
}
async function previewDashboard(request,env){
  if(!isCrmPreview(env))return json({ok:false,error:"PREVIEW_ONLY"},404);
  await ensurePreviewCrmSchema(env);
  const url=new URL(request.url);
  const outcome=clean(url.searchParams.get("outcome"),20);
  const lifecycle=clean(url.searchParams.get("lifecycle_status"),30);
  const clauses=["source='crm_operational_test'"],bind=[];
  if(["open","won","lost"].includes(outcome)){clauses.push("outcome=?");bind.push(outcome)}
  if(["waiting","attended","qualified","closed"].includes(lifecycle)){clauses.push("lifecycle_status=?");bind.push(lifecycle)}
  let stmt=env.DB.prepare(`SELECT * FROM camilla_leads WHERE ${clauses.join(" AND ")} ORDER BY id DESC LIMIT 200`);
  if(bind.length)stmt=stmt.bind(...bind);
  const rows=(await stmt.all()).results||[];
  const won=rows.filter(r=>r.outcome==="won");
  const revenue=won.reduce((sum,r)=>sum+Number(r.deal_value_cents||0),0);
  return json({
    ok:true,
    filters:{outcome:outcome||null,lifecycle_status:lifecycle||null},
    kpis:{
      leads:rows.length,
      won:won.length,
      lost:rows.filter(r=>r.outcome==="lost").length,
      open:rows.filter(r=>r.outcome==="open").length,
      revenue_cents:revenue,
      conversion_percent:rows.length?Number((won.length*100/rows.length).toFixed(2)):0
    },
    rows
  });
}
async function previewExport(env){
  if(!isCrmPreview(env))return json({ok:false,error:"PREVIEW_ONLY"},404);
  await ensurePreviewCrmSchema(env);
  const rows=(await env.DB.prepare("SELECT id,name,phone,section,lifecycle_status,outcome,loss_reason,deal_value_cents,notes,created_at FROM camilla_leads WHERE source='crm_operational_test' ORDER BY id DESC").all()).results||[];
  const cell=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
  const headers=["id","name","phone","section","lifecycle_status","outcome","loss_reason","deal_value_cents","notes","created_at"];
  const csv=[headers.map(cell).join(","),...rows.map(r=>headers.map(h=>cell(r[h])).join(","))].join("\r\n");
  return new Response("\uFEFF"+csv,{headers:{"content-type":"text/csv; charset=utf-8","content-disposition":'attachment; filename="camilla-crm-preview-test.csv"',"cache-control":"no-store","x-robots-tag":"noindex, nofollow"}});
}
async function previewWhatsApp(request,env){
  if(!isCrmPreview(env))return json({ok:false,error:"PREVIEW_ONLY"},404);
  const url=new URL(request.url);
  const id=Number(url.searchParams.get("id"));
  if(!Number.isInteger(id)||id<1)return json({ok:false,error:"INVALID_ID"},422);
  await ensurePreviewCrmSchema(env);
  const lead=await env.DB.prepare("SELECT id,name,phone FROM camilla_leads WHERE id=? AND source='crm_operational_test' LIMIT 1").bind(id).first();
  if(!lead)return json({ok:false,error:"LEAD_NOT_FOUND"},404);
  const phone=digits(lead.phone);
  const target=phone.startsWith("55")?phone:"55"+phone;
  const message=`Olá, ${lead.name}. Este é um teste operacional do fluxo de atendimento da Camilla Bonifácio.`;
  return json({ok:true,url:`https://wa.me/${target}?text=${encodeURIComponent(message)}`});
}
async function previewCleanup(env){
  if(!isCrmPreview(env))return json({ok:false,error:"PREVIEW_ONLY"},404);
  await ensurePreviewCrmSchema(env);
  const r=await env.DB.prepare("DELETE FROM camilla_leads WHERE source='crm_operational_test'").run();
  return json({ok:true,deleted:r.meta?.changes??0});
}

const unavailablePage = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="theme-color" content="#F6EFE6">
  <title>Camilla Bonifácio | Site temporariamente indisponível</title>
  <style>
    :root{color-scheme:light;--off:#F6EFE6;--copper:#A8694E;--graphite:#2F2F2F;--muted:#71675f}
    *{box-sizing:border-box}
    body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:var(--off);color:var(--graphite);font-family:Arial,Helvetica,sans-serif}
    main{width:min(100%,540px);text-align:center;padding:56px 36px;border:1px solid rgba(168,105,78,.22);background:rgba(255,255,255,.62)}
    .mark{width:42px;height:2px;margin:0 auto 30px;background:var(--copper)}
    h1{margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:clamp(30px,7vw,42px);font-weight:400;line-height:1.15}
    p{margin:0;color:var(--muted);font-size:15px;line-height:1.7}
    @media(max-width:480px){main{padding:44px 24px}}
  </style>
</head>
<body>
  <main>
    <div class="mark" aria-hidden="true"></div>
    <h1>Site temporariamente indisponível</h1>
    <p>Estamos atualizando este espaço. Por favor, volte em outro momento.</p>
  </main>
</body>
</html>`;
const unavailableResponse = () => new Response(unavailablePage, {
  status: 503,
  headers: {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store, no-cache, must-revalidate",
    "retry-after": "3600",
    "x-robots-tag": "noindex, nofollow, noarchive"
  }
});
export default{async fetch(request,env){
  const url=new URL(request.url);

  if(url.pathname.startsWith("/api/crm-test/")){
    if(!isCrmPreview(env))return json({ok:false,error:"PREVIEW_ONLY"},404);
    if(url.pathname==="/api/crm-test/health" && request.method==="GET"){
      const probe=validateLeadInput({name:"Teste CRM",phone:"83999999999",source:"crm_preview"});
      let d1=false;
      try{await ensurePreviewCrmSchema(env);d1=true}catch{}
      return coreJson({
        ok:true,
        mode:"preview-test",
        client:clientConfig.id,
        platform:clientConfig.platform,
        database_binding:clientConfig.bindings.database,
        validation_ok:probe.ok,
        d1_ok:d1
      });
    }
    if(url.pathname==="/api/crm-test/leads" && request.method==="POST")return previewCreateLead(request,env);
    if(url.pathname==="/api/crm-test/leads" && request.method==="GET")return previewListLeads(env);
    if(url.pathname==="/api/crm-test/leads/update" && request.method==="POST")return previewUpdateLead(request,env);
    if(url.pathname==="/api/crm-test/dashboard" && request.method==="GET")return previewDashboard(request,env);
    if(url.pathname==="/api/crm-test/export" && request.method==="GET")return previewExport(env);
    if(url.pathname==="/api/crm-test/whatsapp" && request.method==="GET")return previewWhatsApp(request,env);
    if(url.pathname==="/api/crm-test/auth" && request.method==="GET")return (await isAdmin(request))?json({ok:true,authenticated:true}):unauthorized();
    if(url.pathname==="/api/crm-test/cleanup" && request.method==="POST")return previewCleanup(env);
    return json({ok:false,error:"NOT_FOUND"},404);
  }

  return unavailableResponse();
  if(url.pathname==="/api/leads")return request.method==="POST"?saveLead(request,env):json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
  if(url.pathname==="/api/leads/attended")return request.method==="POST"?markAttended(request,env):json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
  if(url.pathname==="/admin/leads")return request.method==="GET"?adminPage(request,env):json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
  return env.ASSETS.fetch(request);
}};