// Núcleo reutilizável do CRM.
// Ainda não está conectado ao worker de produção.

export const clean = (value, max = 160) =>
  String(value ?? "").trim().slice(0, max);

export const onlyDigits = (value, max = 15) =>
  String(value ?? "").replace(/\D/g, "").slice(0, max);

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });

export const csvCell = (value) => {
  const s = String(value ?? "");
  return '"' + s.replace(/"/g, '""') + '"';
};

export const daysClause = (days, column = "created_at") => {
  const n = Number(days);
  if (!Number.isFinite(n) || n <= 0) return { sql: "", bind: [] };
  const safe = Math.min(Math.floor(n), 3650);
  return {
    sql: ` WHERE ${column} >= datetime('now', ?)`,
    bind: [`-${safe} days`]
  };
};

export const sha256Hex = async (value) => {
  const data = new TextEncoder().encode(String(value ?? ""));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
};
