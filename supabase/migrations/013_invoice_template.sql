-- Add invoice_template column to organizations
-- This stores the default invoice template for the organization
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS invoice_template TEXT DEFAULT 'classic';
