-- Bootstrap de compatibilidade: cria o esquema mínimo usado pelo Worker atual.
-- Em produção, camilla_leads já existe; IF NOT EXISTS preserva os registros.
CREATE TABLE IF NOT EXISTS camilla_leads (
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
);
CREATE INDEX IF NOT EXISTS idx_camilla_leads_created_at ON camilla_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_camilla_leads_phone ON camilla_leads(phone);
