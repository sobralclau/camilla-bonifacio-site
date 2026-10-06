import { sha256Hex } from "./utils.js";

// Autenticação genérica para Cloudflare Workers.
// Credenciais devem vir de bindings/secrets da instância, nunca deste módulo.

export async function isBasicAdmin(request, { user, passwordHash }) {
  const auth = request.headers.get("authorization") || "";
  if (!auth.startsWith("Basic ")) return false;

  try {
    const decoded = atob(auth.slice(6));
    const idx = decoded.indexOf(":");
    if (idx < 0) return false;

    const suppliedUser = decoded.slice(0, idx);
    const suppliedPass = decoded.slice(idx + 1);

    if (!user || !passwordHash || suppliedUser !== user) return false;
    return (await sha256Hex(suppliedPass)) === passwordHash;
  } catch {
    return false;
  }
}

export function unauthorizedResponse(realm = "CRM") {
  return new Response("Autenticação necessária.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${realm}", charset="UTF-8"`,
      "cache-control": "no-store"
    }
  });
}
