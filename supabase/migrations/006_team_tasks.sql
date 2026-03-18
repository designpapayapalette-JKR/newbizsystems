-- Add assigned_to to activities for task assignment
ALTER TABLE activities ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id);

-- Ensure org_invites has token and expires_at (may already exist from schema)
ALTER TABLE org_invites ADD COLUMN IF NOT EXISTS token text;
ALTER TABLE org_invites ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Create unique index on token if not exists
CREATE UNIQUE INDEX IF NOT EXISTS org_invites_token_idx ON org_invites(token) WHERE token IS NOT NULL;
