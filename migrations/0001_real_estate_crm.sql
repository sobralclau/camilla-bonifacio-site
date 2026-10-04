-- Amplia a tabela existente sem renomear nem apagar leads.
ALTER TABLE camilla_leads ADD COLUMN email TEXT;
ALTER TABLE camilla_leads ADD COLUMN origin_channel TEXT;
ALTER TABLE camilla_leads ADD COLUMN utm_source TEXT;
ALTER TABLE camilla_leads ADD COLUMN utm_medium TEXT;
ALTER TABLE camilla_leads ADD COLUMN utm_campaign TEXT;
ALTER TABLE camilla_leads ADD COLUMN utm_content TEXT;
ALTER TABLE camilla_leads ADD COLUMN utm_term TEXT;
ALTER TABLE camilla_leads ADD COLUMN campaign_id TEXT;
ALTER TABLE camilla_leads ADD COLUMN campaign_name TEXT;
ALTER TABLE camilla_leads ADD COLUMN adset_id TEXT;
ALTER TABLE camilla_leads ADD COLUMN adset_name TEXT;
ALTER TABLE camilla_leads ADD COLUMN ad_id TEXT;
ALTER TABLE camilla_leads ADD COLUMN ad_name TEXT;
ALTER TABLE camilla_leads ADD COLUMN placement TEXT;
ALTER TABLE camilla_leads ADD COLUMN publisher_platform TEXT;
ALTER TABLE camilla_leads ADD COLUMN fbclid TEXT;
ALTER TABLE camilla_leads ADD COLUMN fbc TEXT;
ALTER TABLE camilla_leads ADD COLUMN fbp TEXT;
ALTER TABLE camilla_leads ADD COLUMN meta_lead_id TEXT;
ALTER TABLE camilla_leads ADD COLUMN external_lead_id TEXT;
ALTER TABLE camilla_leads ADD COLUMN meta_form_id TEXT;
ALTER TABLE camilla_leads ADD COLUMN meta_lead_created_time TEXT;
ALTER TABLE camilla_leads ADD COLUMN meta_field_data_json TEXT;
ALTER TABLE camilla_leads ADD COLUMN first_touch_source TEXT;
ALTER TABLE camilla_leads ADD COLUMN first_touch_campaign TEXT;
ALTER TABLE camilla_leads ADD COLUMN last_touch_source TEXT;
ALTER TABLE camilla_leads ADD COLUMN last_touch_campaign TEXT;
ALTER TABLE camilla_leads ADD COLUMN property_id TEXT;
ALTER TABLE camilla_leads ADD COLUMN property_name TEXT;
ALTER TABLE camilla_leads ADD COLUMN property_slug TEXT;
ALTER TABLE camilla_leads ADD COLUMN city TEXT;
ALTER TABLE camilla_leads ADD COLUMN neighborhood TEXT;
ALTER TABLE camilla_leads ADD COLUMN development_name TEXT;
ALTER TABLE camilla_leads ADD COLUMN property_type TEXT;
ALTER TABLE camilla_leads ADD COLUMN listing_price_cents INTEGER;
ALTER TABLE camilla_leads ADD COLUMN interest_type TEXT;
ALTER TABLE camilla_leads ADD COLUMN customer_profile TEXT;
ALTER TABLE camilla_leads ADD COLUMN budget_min_cents INTEGER;
ALTER TABLE camilla_leads ADD COLUMN budget_max_cents INTEGER;
ALTER TABLE camilla_leads ADD COLUMN down_payment_cents INTEGER;
ALTER TABLE camilla_leads ADD COLUMN financing_interest TEXT;
ALTER TABLE camilla_leads ADD COLUMN bedrooms INTEGER;
ALTER TABLE camilla_leads ADD COLUMN purchase_timeline TEXT;
ALTER TABLE camilla_leads ADD COLUMN preferred_neighborhoods TEXT;
ALTER TABLE camilla_leads ADD COLUMN qualification_notes TEXT;
ALTER TABLE camilla_leads ADD COLUMN status_form TEXT NOT NULL DEFAULT 'submitted';
ALTER TABLE camilla_leads ADD COLUMN stage TEXT NOT NULL DEFAULT 'new';
ALTER TABLE camilla_leads ADD COLUMN result TEXT NOT NULL DEFAULT 'open';
ALTER TABLE camilla_leads ADD COLUMN lead_type TEXT NOT NULL DEFAULT 'commercial';
ALTER TABLE camilla_leads ADD COLUMN lost_reason TEXT;
ALTER TABLE camilla_leads ADD COLUMN lost_reason_notes TEXT;
ALTER TABLE camilla_leads ADD COLUMN first_attended_at TEXT;
ALTER TABLE camilla_leads ADD COLUMN recovered_from_lost_at TEXT;
ALTER TABLE camilla_leads ADD COLUMN closed_value_cents INTEGER;
ALTER TABLE camilla_leads ADD COLUMN commission_percent_bps INTEGER;
ALTER TABLE camilla_leads ADD COLUMN expected_commission_cents INTEGER;
ALTER TABLE camilla_leads ADD COLUMN received_commission_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE camilla_leads ADD COLUMN currency TEXT NOT NULL DEFAULT 'BRL';
ALTER TABLE camilla_leads ADD COLUMN updated_at TEXT;

CREATE INDEX IF NOT EXISTS idx_camilla_leads_stage_result ON camilla_leads(stage,result);
CREATE INDEX IF NOT EXISTS idx_camilla_leads_property ON camilla_leads(property_id);
CREATE INDEX IF NOT EXISTS idx_camilla_leads_meta_lead ON camilla_leads(meta_lead_id);
CREATE INDEX IF NOT EXISTS idx_camilla_leads_external_lead ON camilla_leads(external_lead_id);
CREATE INDEX IF NOT EXISTS idx_camilla_leads_origin_created ON camilla_leads(origin_channel,created_at);

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT,
  city TEXT,
  neighborhood TEXT,
  development_name TEXT,
  price_cents INTEGER,
  bedrooms INTEGER,
  suites INTEGER,
  bathrooms INTEGER,
  parking_spaces INTEGER,
  area_m2 REAL,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK(status IN ('available','reserved','sold','inactive')),
  featured_image TEXT,
  gallery_json TEXT NOT NULL DEFAULT '[]',
  campaign_enabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_campaign ON properties(campaign_enabled,status);

CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES camilla_leads(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  scheduled_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK(status IN ('scheduled','completed','cancelled','no_show')),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_visits_lead_scheduled ON visits(lead_id,scheduled_at);

CREATE TABLE IF NOT EXISTS followups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES camilla_leads(id) ON DELETE CASCADE,
  due_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','done','cancelled')),
  type TEXT NOT NULL DEFAULT 'return'
    CHECK(type IN ('call','whatsapp','visit','proposal','return')),
  notes TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_followups_due_status ON followups(status,due_at);
CREATE INDEX IF NOT EXISTS idx_followups_lead ON followups(lead_id,due_at);

CREATE TABLE IF NOT EXISTS proposals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES camilla_leads(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  asking_price_cents INTEGER,
  proposal_value_cents INTEGER,
  accepted_value_cents INTEGER,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK(status IN ('draft','sent','counteroffer','accepted','rejected','cancelled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_proposals_lead_status ON proposals(lead_id,status);

CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES camilla_leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activities_lead_created ON activities(lead_id,created_at);
