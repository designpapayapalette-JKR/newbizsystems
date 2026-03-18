-- Branding fields for organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address      text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS phone        text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS email        text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS website      text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS invoice_color  text DEFAULT '#2563EB';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS invoice_footer text DEFAULT 'Thank you for your business!';
