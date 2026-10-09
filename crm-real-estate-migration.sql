-- Mini CRM imobiliário: estrutura nova, não altera os leads comerciais existentes.
CREATE TABLE IF NOT EXISTS crm_users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT NOT NULL UNIQUE,
 display_name TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('admin','commercial')),
 password_hash TEXT NOT NULL,
 active INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS crm_properties (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 reference TEXT NOT NULL UNIQUE,
 title TEXT NOT NULL,
 neighborhood TEXT,
 city TEXT,
 property_type TEXT,
 bedrooms INTEGER,
 area_m2 REAL,
 asking_price_cents INTEGER,
 developer TEXT,
 partnership_type TEXT,
 status TEXT NOT NULL DEFAULT 'available',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS crm_deals (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 lead_id INTEGER,
 workspace TEXT NOT NULL DEFAULT 'commercial' CHECK(workspace IN ('commercial','demo')),
 name TEXT NOT NULL,
 phone TEXT,
 property_id INTEGER REFERENCES crm_properties(id),
 property_reference TEXT,
 neighborhood TEXT,
 interest_type TEXT,
 budget_min_cents INTEGER,
 budget_max_cents INTEGER,
 stage TEXT NOT NULL DEFAULT 'new' CHECK(stage IN ('new','contacted','qualified','visit_scheduled','visited','proposal','negotiation','won','lost')),
 outcome TEXT NOT NULL DEFAULT 'open' CHECK(outcome IN ('open','won','lost')),
 deal_value_cents INTEGER,
 expected_commission_cents INTEGER,
 partnership_percent_bps INTEGER,
 loss_reason TEXT,
 origin_channel TEXT NOT NULL DEFAULT 'site',
 source TEXT,
 medium TEXT,
 campaign_name TEXT,
 campaign_id TEXT,
 adset_name TEXT,
 adset_id TEXT,
 ad_name TEXT,
 ad_id TEXT,
 placement TEXT,
 utm_content TEXT,
 utm_term TEXT,
 landing_page TEXT,
 cta_id TEXT,
 assigned_to TEXT,
 notes TEXT,
 next_followup_at TEXT,
 last_contact_at TEXT,
 first_attended_at TEXT,
 qualified_at TEXT,
 visit_at TEXT,
 closed_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_crm_deals_workspace_stage ON crm_deals(workspace,stage);
CREATE INDEX IF NOT EXISTS idx_crm_deals_workspace_created ON crm_deals(workspace,created_at);
CREATE INDEX IF NOT EXISTS idx_crm_deals_campaign ON crm_deals(campaign_name);
CREATE INDEX IF NOT EXISTS idx_crm_deals_followup ON crm_deals(next_followup_at);
CREATE TABLE IF NOT EXISTS crm_activities (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 deal_id INTEGER NOT NULL REFERENCES crm_deals(id),
 actor TEXT NOT NULL,
 activity_type TEXT NOT NULL,
 details TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_crm_activities_deal ON crm_activities(deal_id,created_at);
CREATE TABLE IF NOT EXISTS crm_visits (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 deal_id INTEGER NOT NULL REFERENCES crm_deals(id),
 property_id INTEGER REFERENCES crm_properties(id),
 scheduled_at TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'scheduled',
 notes TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
