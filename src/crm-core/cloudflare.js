// Adaptadores mínimos para a infraestrutura Cloudflare.
// Mantém o núcleo desacoplado dos nomes de bancos e bindings de cada cliente.

export function requireD1(env, binding = "DB") {
  const db = env?.[binding];
  if (!db) throw new Error("D1_NOT_BOUND");
  return db;
}

export async function countByPhone(db, table, phone) {
  const row = await db.prepare(
    `SELECT COUNT(*) AS total FROM ${table} WHERE phone = ?`
  ).bind(phone).first();

  return Number(row?.total || 0);
}

export function getAssetsBinding(env, binding = "ASSETS") {
  const assets = env?.[binding];
  if (!assets || typeof assets.fetch !== "function") {
    throw new Error("ASSETS_NOT_BOUND");
  }
  return assets;
}
