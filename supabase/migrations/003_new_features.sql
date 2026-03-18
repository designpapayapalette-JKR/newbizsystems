-- =====================
-- ADD FIELDS TO EXISTING TABLES
-- =====================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS win_reason text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS loss_reason text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS close_date date;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS probability integer DEFAULT 20;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gdpr_consent boolean DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gdpr_consent_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE pipeline_stages ADD COLUMN IF NOT EXISTS probability integer DEFAULT 20;

-- =====================
-- EMAIL TEMPLATES
-- =====================
CREATE TABLE IF NOT EXISTS email_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name            text NOT NULL,
  subject         text NOT NULL,
  body            text NOT NULL,
  category        text DEFAULT 'general',
  created_by      uuid REFERENCES auth.users(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_templates_org" ON email_templates FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.user_org_ids()));

-- =====================
-- PRODUCTS / SERVICES CATALOG
-- =====================
CREATE TABLE IF NOT EXISTS products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name            text NOT NULL,
  description     text,
  unit_price      numeric(12,2) NOT NULL DEFAULT 0,
  currency        text DEFAULT 'INR',
  category        text,
  is_active       boolean DEFAULT true,
  created_by      uuid REFERENCES auth.users(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_org" ON products FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.user_org_ids()));

-- =====================
-- SUPPORT TICKETS
-- =====================
CREATE TABLE IF NOT EXISTS tickets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  ticket_number   text NOT NULL,
  title           text NOT NULL,
  description     text,
  status          text CHECK (status IN ('open','in_progress','resolved','closed')) DEFAULT 'open',
  priority        text CHECK (priority IN ('low','medium','high','urgent')) DEFAULT 'medium',
  lead_id         uuid REFERENCES leads(id) ON DELETE SET NULL,
  assigned_to     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by      uuid REFERENCES auth.users(id),
  resolved_at     timestamptz,
  sla_due_at      timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets_org" ON tickets FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.user_org_ids()));
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================
-- TICKET COMMENTS
-- =====================
CREATE TABLE IF NOT EXISTS ticket_comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   uuid REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body        text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ticket_comments_org" ON ticket_comments FOR ALL TO authenticated
  USING (ticket_id IN (SELECT id FROM tickets WHERE organization_id IN (SELECT public.user_org_ids())))
  WITH CHECK (ticket_id IN (SELECT id FROM tickets WHERE organization_id IN (SELECT public.user_org_ids())));

-- =====================
-- KNOWLEDGE BASE
-- =====================
CREATE TABLE IF NOT EXISTS kb_articles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  title           text NOT NULL,
  slug            text NOT NULL,
  content         text NOT NULL,
  category        text DEFAULT 'general',
  is_published    boolean DEFAULT false,
  created_by      uuid REFERENCES auth.users(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(organization_id, slug)
);
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kb_articles_org" ON kb_articles FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.user_org_ids()));

-- =====================
-- OUTBOUND WEBHOOKS
-- =====================
CREATE TABLE IF NOT EXISTS webhooks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name            text NOT NULL,
  url             text NOT NULL,
  events          text[] NOT NULL DEFAULT '{}',
  secret          text,
  is_active       boolean DEFAULT true,
  last_triggered  timestamptz,
  created_at      timestamptz DEFAULT now()
);
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhooks_org" ON webhooks FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.user_org_ids()));

-- =====================
-- AUDIT LOG
-- =====================
CREATE TABLE IF NOT EXISTS audit_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action          text NOT NULL,
  table_name      text NOT NULL,
  record_id       uuid,
  old_data        jsonb,
  new_data        jsonb,
  ip_address      text,
  created_at      timestamptz DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_org" ON audit_logs FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT public.user_org_ids()));
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id, created_at DESC);

-- =====================
-- LEAD CAPTURE FORMS
-- =====================
CREATE TABLE IF NOT EXISTS lead_forms (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name            text NOT NULL,
  fields          jsonb NOT NULL DEFAULT '["name","email","phone","company","message"]',
  stage_id        uuid REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  default_source  text DEFAULT 'web_form',
  is_active       boolean DEFAULT true,
  submissions     integer DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);
ALTER TABLE lead_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lead_forms_org" ON lead_forms FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.user_org_ids()));

-- Public access for form submissions (no auth required)
CREATE POLICY "lead_forms_public_read" ON lead_forms FOR SELECT TO anon
  USING (is_active = true);

-- =====================
-- DRIP SEQUENCES (Email follow-up reminders)
-- =====================
CREATE TABLE IF NOT EXISTS drip_sequences (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name            text NOT NULL,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);
ALTER TABLE drip_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drip_sequences_org" ON drip_sequences FOR ALL TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.user_org_ids()));

CREATE TABLE IF NOT EXISTS drip_steps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id     uuid REFERENCES drip_sequences(id) ON DELETE CASCADE NOT NULL,
  day_offset      integer NOT NULL DEFAULT 1,
  subject         text NOT NULL,
  body            text NOT NULL,
  position        integer DEFAULT 0
);
ALTER TABLE drip_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drip_steps_org" ON drip_steps FOR ALL TO authenticated
  USING (sequence_id IN (SELECT id FROM drip_sequences WHERE organization_id IN (SELECT public.user_org_ids())))
  WITH CHECK (sequence_id IN (SELECT id FROM drip_sequences WHERE organization_id IN (SELECT public.user_org_ids())));

-- Scheduled drip sends (notify rep when it's time to send)
CREATE TABLE IF NOT EXISTS drip_enrollments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id     uuid REFERENCES drip_sequences(id) ON DELETE CASCADE,
  lead_id         uuid REFERENCES leads(id) ON DELETE CASCADE,
  current_step    integer DEFAULT 0,
  next_send_at    timestamptz,
  is_active       boolean DEFAULT true,
  enrolled_at     timestamptz DEFAULT now()
);
ALTER TABLE drip_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drip_enrollments_org" ON drip_enrollments FOR ALL TO authenticated
  USING (lead_id IN (SELECT id FROM leads WHERE organization_id IN (SELECT public.user_org_ids())))
  WITH CHECK (lead_id IN (SELECT id FROM leads WHERE organization_id IN (SELECT public.user_org_ids())));
