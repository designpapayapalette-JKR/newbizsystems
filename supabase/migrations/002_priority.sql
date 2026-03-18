ALTER TABLE leads ADD COLUMN IF NOT EXISTS priority text CHECK (priority IN ('hot', 'warm', 'cold'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score integer DEFAULT 0;
