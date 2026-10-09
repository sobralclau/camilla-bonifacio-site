import {identity,csrfOK,denied} from "./crm-auth.js";
const J=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
const allowedStages=["new","contacted","qualified","visit_scheduled","visited","proposal","negotiation","won","lost"];
const safe=(v,n=200)=>String(v??"").trim().slice(0,n);
const esc=v=>safe(v,1000).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const workspace=(url,user)=>user.role==="admin"&&url.searchParams.get("mode")==="demo"?"demo":"commercial";
async function actor(request,env,write=false){const user=await identity(request,env);if(!user||write&&!csrfOK(request))return null;return user}
export async function crmApi(request,env){
 const user=await actor(request,env,request.method!=="GET");if(!user)return denied();
 const url=new URL(request.url),mode=workspace(url,user);
 const table="crm_deals";
 if(request.method==="GET"){
 const params=[mode],where=["workspace=?"];
 const filters={stage:"stage",origin:"origin_channel",campaign:"campaign_name",neighborhood:"neighborhood",assigned:"assigned_to"};
 for(const [q,col] of Object.entries(filters)){if(url.searchParams.get(q)){where.push(col+"=?");params.push(safe(url.searchParams.get(q),120))}}
 const from=url.searchParams.get("from"),to=url.searchParams.get("to");
 if(from&&/^\d{4}-\d{2}-\d{2}$/.test(from)){where.push("created_at>=?");params.push(from)}
 if(to&&/^\d{4}-\d{2}-\d{2}$/.test(to)){where.push("created_at<?");params.push(to+"T23:59:59.999Z")}
 const clause=where.join(" AND ");
 const rows=await env.DB.prepare("SELECT * FROM "+table+" WHERE "+clause+" ORDER BY id DESC LIMIT 500").bind(...params).all();
 const metrics=await env.DB.prepare("SELECT COUNT(*) total,SUM(CASE WHEN outcome='won' THEN 1 ELSE 0 END) won,SUM(CASE WHEN outcome='lost' THEN 1 ELSE 0 END) lost,SUM(CASE WHEN outcome='won' THEN deal_value_cents ELSE 0 END) revenue_cents FROM "+table+" WHERE "+clause).bind(...params).first();
 return J({ok:true,workspace:mode,role:user.role,metrics,leads:rows.results||[]});
 }
 if(request.method!=="POST")return J({ok:false,error:"METHOD_NOT_ALLOWED"},405);
 const body=await request.json().catch(()=>null);if(!body)return J({ok:false,error:"INVALID_JSON"},400);
 if(body.action==="create"){
 const name=safe(body.name,100),phone=String(body.phone||"").replace(/\D/g,"").slice(0,15);
 if(name.length<2)return J({ok:false,error:"INVALID_NAME"},422);
 const stage=allowedStages.includes(body.stage)?body.stage:"new";
 const amount=Number(body.deal_value_cents||0);
 if(!Number.isSafeInteger(amount)||amount<0||amount>100000000000)return J({ok:false,error:"INVALID_AMOUNT"},422);
 const r=await env.DB.prepare("INSERT INTO crm_deals(workspace,name,phone,stage,origin_channel,campaign_name,neighborhood,property_reference,assigned_to,notes,deal_value_cents) VALUES(?,?,?,?,?,?,?,?,?,?,?)").bind(mode,name,phone,stage,safe(body.origin_channel,80)||"manual",safe(body.campaign_name,120),safe(body.neighborhood,120),safe(body.property_reference,100),safe(body.assigned_to,100),safe(body.notes,1000),amount).run();
 await env.DB.prepare("INSERT INTO crm_activities(deal_id,actor,activity_type,details) VALUES(?,?,?,?)").bind(r.meta.last_row_id,user.username,"created","").run();
 return J({ok:true,id:r.meta.last_row_id});
 }
 if(body.action==="update"){
 const id=Number(body.id),stage=safe(body.stage);
 if(!Number.isInteger(id)||id<1||!allowedStages.includes(stage))return J({ok:false,error:"INVALID_DATA"},422);
 const outcome=stage==="won"?"won":stage==="lost"?"lost":"open";
 const r=await env.DB.prepare("UPDATE crm_deals SET stage=?,outcome=?,updated_at=CURRENT_TIMESTAMP,closed_at=CASE WHEN ? IN ('won','lost') THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id=? AND workspace=?").bind(stage,outcome,stage,id,mode).run();
 if(!r.meta?.changes)return J({ok:false,error:"NOT_FOUND"},404);
 await env.DB.prepare("INSERT INTO crm_activities(deal_id,actor,activity_type,details) VALUES(?,?,?,?)").bind(id,user.username,"stage_changed",stage).run();
 return J({ok:true});
 }
 return J({ok:false,error:"UNKNOWN_ACTION"},400);
}
export async function crmDashboard(request,env){
 const user=await actor(request,env);if(!user)return Response.redirect(new URL("/admin/login",request.url).toString(),302);
 const mode=workspace(new URL(request.url),user),admin=user.role==="admin";
 const style=`<style>:root{--bg:#F6EFE6;--ink:#2F2F2F;--copper:#A8694E;--line:#e3d6ca}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px Arial,sans-serif}main{max-width:1440px;margin:auto;padding:25px 18px}header,.toolbar,.stats{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}h1{font:normal 30px Georgia,serif;margin:8px 0}h2{font:normal 20px Georgia,serif}.panel{background:white;border:1px solid var(--line);border-radius:14px;padding:16px;margin-top:15px}.stats>div{flex:1;min-width:150px}.metric{font:28px Georgia,serif;color:var(--copper)}button,.btn{background:var(--copper);color:white;border:0;border-radius:8px;padding:10px 14px;cursor:pointer;text-decoration:none}input,select{padding:10px;border:1px solid var(--line);border-radius:8px;max-width:100%}table{width:100%;border-collapse:collapse;min-width:850px}td,th{text-align:left;padding:12px;border-bottom:1px solid var(--line)}th{color:#76665e;font-size:11px;text-transform:uppercase}.scroll{overflow:auto}.capture-link{background:#2F2F2F;font-weight:700;display:inline-flex;align-items:center;gap:8px}.settings{background:white;border:1px solid var(--line);padding:10px 14px;border-radius:8px}.settings summary{cursor:pointer}.settings label{margin:12px 6px;display:inline-block}.tag{background:#f3e5db;border-radius:12px;padding:5px 9px}.muted{color:#75665c}form{display:flex;gap:8px;flex-wrap:wrap;align-items:center}@media(max-width:640px){h1{font-size:24px}main{padding:14px}.panel{padding:12px}}</style>`;
 const stageNames={new:"Novo",contacted:"Contatado",qualified:"Qualificado",visit_scheduled:"Visita agendada",visited:"Visitado",proposal:"Proposta",negotiation:"Negociação",won:"Ganho",lost:"Perdido"};
 const modes=admin?`<a class="btn" href="/admin/crm">Comercial</a> <a class="btn" href="/admin/crm?mode=demo">Laboratório de testes</a>`:"";
 const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Camilla Bonifácio | CRM</title>${style}</head><body><main><header><div><div class="muted">ARQUITETURA + CURADORIA IMOBILIÁRIA</div><h1>Mini CRM · ${mode==="demo"?"Laboratório":"Comercial"}</h1><div class="muted">Acesso: ${esc(user.display_name)} · ${admin?"Administrador":"Atendimento"}</div></div><form method="post" action="/admin/logout"><button>Sair</button></form></header><div class="toolbar" style="margin-top:18px">${modes}<a class="btn capture-link" href="/admin/leads" data-i18n="capture">▣ Captação do site</a><details class="settings"><summary data-i18n="settings">⚙ Configurações</summary><label for="crm-lang" data-i18n="language">Idioma</label> <select id="crm-lang"><option value="pt-BR">Português (Brasil)</option><option value="en">English</option></select></details></div><section class="stats" id="stats" style="margin-top:12px"></section><section class="panel"><h2>Filtros de marketing e comercial</h2><form id="filters"><select name="stage"><option value="">Todas as etapas</option>${allowedStages.map(x=>`<option value="${x}">${stageNames[x]}</option>`).join("")}</select><input name="origin" placeholder="Origem / canal"><input name="campaign" placeholder="Campanha"><input name="neighborhood" placeholder="Bairro"><input name="assigned" placeholder="Responsável"><input name="from" type="date" title="Data inicial"><input name="to" type="date" title="Data final"><button>Filtrar</button></form></section><section class="panel"><h2>Novo atendimento ${mode==="demo"?"fictício":""}</h2><form id="new"><input name="name" placeholder="Nome do cliente" required><input name="phone" placeholder="(83) 9 9999-9999" inputmode="tel" maxlength="16" aria-label="WhatsApp"><input name="neighborhood" placeholder="Bairro"><input name="property_reference" placeholder="Referência do imóvel"><input name="campaign_name" placeholder="Campanha"><input name="deal_value" placeholder="R$ 0,00" inputmode="decimal" aria-label="Valor do imóvel"><button data-i18n="add">Adicionar</button></form></section><section class="panel"><h2>Funil e atendimentos</h2><div class="scroll"><table><thead><tr><th>Cliente</th><th>Contato</th><th>Etapa</th><th>Origem</th><th>Campanha</th><th>Bairro</th><th>Imóvel</th><th>Valor</th><th>Criado</th></tr></thead><tbody id="rows"></tbody></table></div></section></main><script>
const mode=${JSON.stringify(mode)},stages=${JSON.stringify(allowedStages)},api='/api/crm?mode='+mode;
const fmt=n=>(Number(n||0)/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const phoneFormat=v=>{let x=String(v??'').replace(/\\D/g,'');if(x.startsWith('55')&&x.length>11)x=x.slice(2);if(x.length===11)return '('+x.slice(0,2)+') '+x.slice(2,3)+' '+x.slice(3,7)+'-'+x.slice(7);if(x.length===10)return '('+x.slice(0,2)+') '+x.slice(2,6)+'-'+x.slice(6);return String(v??'')};
const moneyInput=v=>{const x=String(v??'').replace(/\\D/g,'');return x?'R$ '+(Number(x)/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}):''};
const labels={en:{capture:'▣ Website leads',settings:'⚙ Settings',language:'Language',add:'Add',new:'New',contacted:'Contacted',qualified:'Qualified',visit_scheduled:'Visit scheduled',visited:'Visited',proposal:'Proposal',negotiation:'Negotiation',won:'Won',lost:'Lost'},'pt-BR':{capture:'▣ Captação do site',settings:'⚙ Configurações',language:'Idioma',add:'Adicionar',new:'Novo',contacted:'Contatado',qualified:'Qualificado',visit_scheduled:'Visita agendada',visited:'Visitado',proposal:'Proposta',negotiation:'Negociação',won:'Ganho',lost:'Perdido'}};
let language=localStorage.getItem('camilla-crm-language')==='en'?'en':'pt-BR';
function translate(){document.documentElement.lang=language;document.querySelector('#crm-lang').value=language;document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=labels[language][el.dataset.i18n]);document.querySelectorAll('select[name="stage"] option,select[data-id] option').forEach(el=>{if(el.value)el.textContent=labels[language][el.value]||el.textContent});document.querySelector('select[name="stage"] option[value=""]').textContent=language==='en'?'All stages':'Todas as etapas'}
document.querySelector('#crm-lang').onchange=e=>{language=e.target.value;localStorage.setItem('camilla-crm-language',language);translate()};
const phoneField=document.querySelector('#new [name="phone"]');phoneField.addEventListener('blur',()=>phoneField.value=phoneFormat(phoneField.value));
const moneyField=document.querySelector('#new [name="deal_value"]');moneyField.addEventListener('input',()=>moneyField.value=moneyInput(moneyField.value));
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function load(){const q=new URLSearchParams(new FormData(document.querySelector('#filters')));const r=await fetch(api+'&'+q);if(!r.ok)throw Error('Sem autorização');const d=await r.json();document.querySelector('#stats').innerHTML=[['Leads',d.metrics.total],['Ganhos',d.metrics.won],['Perdidos',d.metrics.lost],['Vendas',fmt(d.metrics.revenue_cents)]].map(x=>'<div class="panel"><div class="muted">'+x[0]+'</div><div class="metric">'+(x[1]??0)+'</div></div>').join('');document.querySelector('#rows').innerHTML=d.leads.map(x=>'<tr><td>'+escape(x.name)+'</td><td>'+escape(phoneFormat(x.phone))+'</td><td><select data-id="'+x.id+'">'+stages.map(s=>'<option '+(x.stage===s?'selected':'')+' value="'+s+'">'+labels[language][s]+'</option>').join('')+'</select></td><td>'+escape(x.origin_channel)+'</td><td>'+escape(x.campaign_name)+'</td><td>'+escape(x.neighborhood)+'</td><td>'+escape(x.property_reference)+'</td><td>'+fmt(x.deal_value_cents)+'</td><td>'+escape(x.created_at)+'</td></tr>').join('')||'<tr><td colspan="9">Nenhum lead neste filtro.</td></tr>'}
document.querySelector('#filters').onsubmit=e=>{e.preventDefault();load().catch(e=>alert(e.message))};
document.querySelector('#new').onsubmit=async e=>{e.preventDefault();const obj=Object.fromEntries(new FormData(e.target));obj.deal_value_cents=Number(String(obj.deal_value||'').replace(/\\D/g,''))||0;delete obj.deal_value;const r=await fetch(api,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...obj,action:'create'})});if(!r.ok)return alert('Falha ao cadastrar');e.target.reset();load()};
document.querySelector('#rows').onchange=async e=>{if(!e.target.matches('select[data-id]'))return;const r=await fetch(api,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'update',id:Number(e.target.dataset.id),stage:e.target.value})});if(!r.ok)alert('Falha ao salvar');load()};
translate();load().catch(e=>alert(e.message));
</script></body></html>`;
 return new Response(html,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-robots-tag":"noindex,nofollow,noarchive"}});
}
