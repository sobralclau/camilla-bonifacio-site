-- Complementa o modelo comercial imobiliário sem modificar nem remover dados existentes.
ALTER TABLE camilla_leads ADD COLUMN property_source TEXT NOT NULL DEFAULT 'owner'
  CHECK (property_source IN ('owner','developer'));
ALTER TABLE camilla_leads ADD COLUMN sale_model TEXT NOT NULL DEFAULT 'direct'
  CHECK (sale_model IN ('direct','partnership'));
ALTER TABLE camilla_leads ADD COLUMN partner_name TEXT;
-- Percentual da comissão total destinado ao parceiro (basis points: 5000 = 50%).
ALTER TABLE camilla_leads ADD COLUMN partner_commission_share_bps INTEGER
  CHECK (partner_commission_share_bps IS NULL OR partner_commission_share_bps BETWEEN 0 AND 10000);
ALTER TABLE camilla_leads ADD COLUMN property_condition TEXT
  CHECK (property_condition IS NULL OR property_condition IN ('ready','under_construction','launch'));
ALTER TABLE camilla_leads ADD COLUMN visit_type TEXT
  CHECK (visit_type IS NULL OR visit_type IN ('ready_property','construction_site'));
ALTER TABLE camilla_leads ADD COLUMN closing_meeting_at TEXT;

CREATE INDEX IF NOT EXISTS idx_camilla_leads_sale_model ON camilla_leads(sale_model,result);
CREATE INDEX IF NOT EXISTS idx_camilla_leads_property_source ON camilla_leads(property_source,property_condition);
