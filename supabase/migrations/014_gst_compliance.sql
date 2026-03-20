-- Add state and state_code to organizations for GST Place of Supply
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS state_code text;

-- Add explicit GST breakdown columns to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cgst_amount numeric(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sgst_amount numeric(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS igst_amount numeric(12,2) DEFAULT 0;
