#!/usr/bin/env node
const base = process.env.CRM_PREVIEW_URL;
if (!base) {
  console.error("CRM_PREVIEW_URL não definido.");
  process.exit(2);
}

const root = base.replace(/\/$/, "");
const request = async (path, options = {}) => {
  const res = await fetch(root + path, {
    redirect: "manual",
    ...options,
    headers: {
      ...(options.body ? {"content-type":"application/json"} : {}),
      ...(options.headers || {})
    }
  });
  const type = res.headers.get("content-type") || "";
  const body = type.includes("application/json") ? await res.json() : await res.text();
  return {res, body};
};

const expect = (condition, message, details) => {
  if (!condition) {
    console.error("FAIL:", message);
    if (details !== undefined) console.error(details);
    process.exit(1);
  }
  console.log("OK:", message);
};

const phone = "83987654321";

let r = await request("/api/crm-test/health");
expect(r.res.status === 200, "health responde 200", r.body);
expect(r.body?.ok === true && r.body?.d1_ok === true, "health confirma D1 de preview", r.body);

r = await request("/api/crm-test/cleanup", {method:"POST"});
expect(r.res.status === 200 && r.body?.ok === true, "limpeza inicial do conjunto de teste");

r = await request("/api/crm-test/leads", {
  method:"POST",
  body:JSON.stringify({name:"Lead Teste Operacional A", phone, section:"curadoria_imobiliaria"})
});
expect(r.res.status === 201 && r.body?.ok === true, "primeiro lead gravado no D1", r.body);
expect(r.body?.duplicate === false && r.body?.duplicate_count === 1, "primeiro lead não marcado como duplicado", r.body);
const idA = r.body.id;

r = await request("/api/crm-test/leads", {
  method:"POST",
  body:JSON.stringify({name:"Lead Teste Operacional B", phone, section:"curadoria_imobiliaria"})
});
expect(r.res.status === 201 && r.body?.ok === true, "segundo lead gravado no D1", r.body);
expect(r.body?.duplicate === true && r.body?.duplicate_count === 2, "duplicidade por telefone detectada", r.body);
const idB = r.body.id;

r = await request("/api/crm-test/leads");
expect(r.res.status === 200 && Array.isArray(r.body?.rows) && r.body.rows.length >= 2, "leitura dos leads de preview", r.body);

r = await request("/api/crm-test/leads/update", {
  method:"POST",
  body:JSON.stringify({id:idA,lifecycle_status:"qualified",outcome:"open",notes:"Qualificado em teste operacional"})
});
expect(r.res.status === 200 && r.body?.row?.lifecycle_status === "qualified", "alteração de status para qualificado", r.body);

r = await request("/api/crm-test/leads/update", {
  method:"POST",
  body:JSON.stringify({id:idA,lifecycle_status:"closed",outcome:"won",deal_value_cents:125000000,notes:"Fechamento ganho de teste"})
});
expect(r.res.status === 200 && r.body?.row?.outcome === "won", "fechamento ganho validado", r.body);

r = await request("/api/crm-test/leads/update", {
  method:"POST",
  body:JSON.stringify({id:idB,lifecycle_status:"closed",outcome:"lost",loss_reason:"Teste de motivo de perda"})
});
expect(r.res.status === 200 && r.body?.row?.outcome === "lost", "fechamento perdido validado", r.body);

r = await request("/api/crm-test/dashboard");
expect(r.res.status === 200 && r.body?.kpis?.won >= 1 && r.body?.kpis?.lost >= 1, "dashboard retorna ganho e perda", r.body);
expect(r.body?.kpis?.revenue_cents >= 125000000, "dashboard agrega receita", r.body);

r = await request("/api/crm-test/dashboard?outcome=won");
expect(r.res.status === 200 && r.body?.rows?.every(x => x.outcome === "won"), "filtro por resultado ganho", r.body);

r = await request("/api/crm-test/whatsapp?id=" + encodeURIComponent(idA));
expect(r.res.status === 200 && String(r.body?.url || "").startsWith("https://wa.me/"), "URL de WhatsApp gerada", r.body);

r = await request("/api/crm-test/export");
expect(r.res.status === 200 && String(r.res.headers.get("content-type") || "").includes("text/csv"), "exportação CSV disponível");

r = await request("/api/crm-test/auth");
expect(r.res.status === 401, "rota protegida recusa acesso sem autenticação");

r = await request("/api/crm-test/cleanup", {method:"POST"});
expect(r.res.status === 200 && Number(r.body?.deleted || 0) >= 2, "dados operacionais de teste removidos", r.body);

r = await request("/api/crm-test/leads");
expect(r.res.status === 200 && r.body?.rows?.length === 0, "isolamento confirmado após limpeza", r.body);

console.log("CRM preview smoke tests: OK");
