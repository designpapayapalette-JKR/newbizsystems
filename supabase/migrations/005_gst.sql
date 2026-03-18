-- GST / tax info on organizations (seller details on invoice)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS gstin        text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tax_label    text DEFAULT 'GST';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS pan          text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS hsn_sac      text;

-- GST info on leads (buyer details on invoice)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gstin     text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pan       text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS state     text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS state_code text;
