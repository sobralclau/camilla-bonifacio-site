const encoder=new TextEncoder();
const decode=s=>Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(s.length/4)*4,"=")),c=>c.charCodeAt(0));
const encode=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const cookie=(req,name)=>{const item=(req.headers.get("cookie")||"").split(";").map(s=>s.trim()).find(s=>s.startsWith(name+"="));return item?.slice(name.length+1)||""};
const headers={"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-robots-tag":"noindex,nofollow,noarchive","referrer-policy":"no-referrer","x-content-type-options":"nosniff"};
const fail=()=>new Response("Acesso administrativo restrito.",{status:403,headers});
const saltBytes=()=>crypto.getRandomValues(new Uint8Array(16));
async function derive(password,salt,iterations=210000){
 const material=await crypto.subtle.importKey("raw",encoder.encode(password),"PBKDF2",false,["deriveBits"]);
 return encode(await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:decode(salt),iterations},material,256));
}
export async function passwordRecord(password){const salt=encode(saltBytes());return "pbkdf2_sha256$210000$"+salt+"$"+await derive(password,salt)}
async function compare(password,record){
 const parts=String(record||"").split("$");
 if(parts.length!==4||parts[0]!=="pbkdf2_sha256"||parts[1]!=="210000")return false;
 const actual=decode(await derive(password,parts[2]));
 const expected=decode(parts[3]);
 if(actual.length!==expected.length)return false;
 let difference=0;for(let i=0;i<actual.length;i++)difference|=actual[i]^expected[i];
 return difference===0;
}
async function sign(value,secret){
 const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 return encode(await crypto.subtle.sign("HMAC",key,encoder.encode(value)));
}
async function verify(value,signature,secret){
 const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["verify"]);
 try{return crypto.subtle.verify("HMAC",key,decode(signature),encoder.encode(value))}catch{return false}
}
function originOK(request){const origin=request.headers.get("origin");return Boolean(origin&&origin===new URL(request.url).origin)}
async function attempts(env,identity){
 await env.DB.prepare("CREATE TABLE IF NOT EXISTS crm_login_attempts (identity TEXT PRIMARY KEY, attempts INTEGER NOT NULL, window_start INTEGER NOT NULL, blocked_until INTEGER NOT NULL)").run();
 const now=Math.floor(Date.now()/1000);
 const r=await env.DB.prepare("SELECT * FROM crm_login_attempts WHERE identity=?").bind(identity).first();
 return {now,blocked:Boolean(r?.blocked_until>now),attempts:r?.window_start>now-900?r.attempts:0};
}
async function failed(env,identity,old){
 const count=old.attempts+1;
 const block=count>=5?old.now+900:0;
 await env.DB.prepare("INSERT INTO crm_login_attempts(identity,attempts,window_start,blocked_until) VALUES(?,?,?,?) ON CONFLICT(identity) DO UPDATE SET attempts=excluded.attempts,window_start=excluded.window_start,blocked_until=excluded.blocked_until").bind(identity,count,old.now,block).run();
}
const loginPage=(error="")=>new Response(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Camilla Bonifácio | Acesso ao CRM</title><style>body{background:#F6EFE6;color:#2F2F2F;font-family:Arial,sans-serif;min-height:100vh;display:grid;place-items:center;margin:0}main{width:min(380px,90vw);padding:32px;background:white;border-radius:18px;box-shadow:0 8px 30px #2f2f2f13}h1{font-size:24px}label{display:block;margin:18px 0 8px}input,button{box-sizing:border-box;width:100%;padding:14px;border-radius:8px;font:inherit}input{border:1px solid #D7C3B1}button{background:#854D37;color:white;border:0;margin-top:22px;cursor:pointer}.error{color:#9b2c2c;font-size:14px}</style><main><h1>Acesso ao Mini CRM</h1><p>Camilla Bonifácio · Área restrita</p>${error?'<p class="error">Credenciais inválidas ou limite de tentativas atingido.</p>':''}<form method="post" action="/admin/login"><label>Usuário</label><input name="username" autocomplete="username" required maxlength="100"><label>Senha</label><input name="password" type="password" autocomplete="current-password" required><button type="submit">Entrar</button></form></main></html>`,{headers});
export async function login(request,env){
 if(request.method==="GET")return loginPage();
 if(request.method!=="POST")return fail();
 if(!originOK(request))return fail();
 if(!env.DB||!env.CRM_SESSION_SECRET||env.CRM_SESSION_SECRET.length<32)return fail();
 const form=await request.formData().catch(()=>null);
 const user=String(form?.get("username")||"").slice(0,100).trim().toLowerCase();
 const password=String(form?.get("password")||"").slice(0,256);
 const ip=request.headers.get("CF-Connecting-IP")||"unknown";
 const identity=ip+"|"+user;
 const state=await attempts(env,identity);
 if(state.blocked)return new Response("Muitas tentativas. Aguarde 15 minutos.",{status:429,headers});
 const account=await env.DB.prepare("SELECT username,password_hash,role FROM crm_users WHERE username=? AND active=1").bind(user).first();
 const ok=Boolean(account)&&await compare(password,account.password_hash);
 if(!ok){await failed(env,identity,state);return loginPage(true)}
 await env.DB.prepare("DELETE FROM crm_login_attempts WHERE identity=?").bind(identity).run();
 const exp=Math.floor(Date.now()/1000)+8*3600;
 const nonce=encode(crypto.getRandomValues(new Uint8Array(16)));
 const value=[user,exp,nonce].join(".");
 const session=value+"."+await sign(value,env.CRM_SESSION_SECRET);
 return new Response(null,{status:303,headers:{location:"/admin/crm","set-cookie":"crm_session="+session+"; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800","cache-control":"no-store"}});
}
export async function identity(request,env){
 if(!env.CRM_SESSION_SECRET||env.CRM_SESSION_SECRET.length<32||!env.DB)return null;
 const parts=cookie(request,"crm_session").split(".");
 if(parts.length!==4)return null;
 const [user,exp,nonce,signature]=parts;
 if(!/^[a-z0-9_.-]{1,100}$/.test(user)||!/^[A-Za-z0-9_-]{20,}$/.test(nonce)||!/^\d{10}$/.test(exp)||Number(exp)<=Date.now()/1000)return null;
 if(!(await verify([user,exp,nonce].join("."),signature,env.CRM_SESSION_SECRET)))return null;
 const account=await env.DB.prepare("SELECT username,display_name,role FROM crm_users WHERE username=? AND active=1").bind(user).first();
 return account&&["admin","commercial"].includes(account.role)?account:null;
}
export async function authorized(request,env){return Boolean(await identity(request,env))}
export function csrfOK(request){return originOK(request)}
export function logout(request){if(request.method!=="POST"||!originOK(request))return fail();return new Response(null,{status:303,headers:{location:"/admin/login","set-cookie":"crm_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0","cache-control":"no-store"}})}
export function denied(){return fail()}
