-- Allow activities to exist without a lead (e.g. standalone tasks)
ALTER TABLE activities ALTER COLUMN lead_id DROP NOT NULL;
