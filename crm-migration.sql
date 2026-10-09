-- Apply once before deploying the CRM worker. Back up D1 first.
ALTER TABLE camilla_leads ADD COLUMN phone_key TEXT;
UPDATE camilla_leads
SET phone_key = CASE WHEN length(phone) IN (12,13) AND substr(phone,1,2)='55' THEN substr(phone,3) ELSE phone END
WHERE id IN (
  SELECT MIN(id) FROM camilla_leads
  GROUP BY CASE WHEN length(phone) IN (12,13) AND substr(phone,1,2)='55' THEN substr(phone,3) ELSE phone END
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_camilla_leads_phone_key ON camilla_leads(phone_key);
