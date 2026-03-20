-- Add GST fields to invoice line items for per-item tax calculation
ALTER TABLE invoice_line_items ADD COLUMN IF NOT EXISTS hsn_sac text;
ALTER TABLE invoice_line_items ADD COLUMN IF NOT EXISTS tax_rate numeric(5,2) DEFAULT 0;
ALTER TABLE invoice_line_items ADD COLUMN IF NOT EXISTS tax_amount numeric(12,2) DEFAULT 0;
ALTER TABLE invoice_line_items ADD COLUMN IF NOT EXISTS cgst_amount numeric(12,2) DEFAULT 0;
ALTER TABLE invoice_line_items ADD COLUMN IF NOT EXISTS sgst_amount numeric(12,2) DEFAULT 0;
ALTER TABLE invoice_line_items ADD COLUMN IF NOT EXISTS igst_amount numeric(12,2) DEFAULT 0;

-- Comment for clarity
COMMENT ON COLUMN invoice_line_items.tax_rate IS 'GST rate in percentage (e.g., 18.00)';
COMMENT ON COLUMN invoice_line_items.tax_amount IS 'Total GST amount for this line item';
