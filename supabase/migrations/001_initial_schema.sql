-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================
-- ORGANIZATIONS
-- =====================
CREATE TABLE organizations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  logo_url      text,
  currency      text DEFAULT 'INR',
  timezone      text DEFAULT 'Asia/Kolkata',
  plan          text DEFAULT 'free',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- =====================
-- PROFILES (extends auth.users)
-- =====================
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text,
  avatar_url      text,
  phone           text,
  current_org_id  uuid REFERENCES organizations(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- =====================
-- ORGANIZATION MEMBERS
-- =====================
CREATE TABLE organization_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role            text CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  invited_by      uuid REFERENCES auth.users(id),
  joined_at       timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- =====================
-- ORG INVITES
-- =====================
CREATE TABLE org_invites (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  email           text NOT NULL,
  role            text CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  token           text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by      uuid REFERENCES auth.users(id),
  expires_at      timestamptz DEFAULT (now() + interval '7 days'),
  accepted_at     timestamptz,
  created_at      timestamptz DEFAULT now()
);

-- =====================
-- PIPELINE STAGES
-- =====================
CREATE TABLE pipeline_stages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name            text NOT NULL,
  color           text DEFAULT '#6366f1',
  position        integer NOT NULL DEFAULT 0,
  is_default      boolean DEFAULT false,
  is_won          boolean DEFAULT false,
  is_lost         boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- =====================
-- LEADS
-- =====================
CREATE TABLE leads (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  stage_id          uuid REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  assigned_to       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name              text NOT NULL,
  email             text,
  phone             text,
  company           text,
  source            text,
  deal_value        numeric(12,2),
  currency          text DEFAULT 'INR',
  next_followup_at  timestamptz,
  last_activity_at  timestamptz,
  position          integer DEFAULT 0,
  notes             text,
  is_archived       boolean DEFAULT false,
  created_by        uuid REFERENCES auth.users(id),
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- =====================
-- LEAD TAGS
-- =====================
CREATE TABLE lead_tags (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  tag     text NOT NULL,
  UNIQUE(lead_id, tag)
);

-- =====================
-- ACTIVITIES
-- =====================
CREATE TABLE activities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  lead_id         uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  user_id         uuid REFERENCES auth.users(id),
  type            text CHECK (type IN ('call','email','whatsapp','sms','note','meeting','task')) NOT NULL,
  title           text,
  body            text,
  outcome         text,
  duration_mins   integer,
  occurred_at     timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);

-- =====================
-- REMINDERS
-- =====================
CREATE TABLE reminders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  lead_id         uuid REFERENCES leads(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title           text NOT NULL,
  description     text,
  due_at          timestamptz NOT NULL,
  is_completed    boolean DEFAULT false,
  completed_at    timestamptz,
  notified_at     timestamptz,
  created_at      timestamptz DEFAULT now()
);

-- =====================
-- INVOICES
-- =====================
CREATE TABLE invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  lead_id         uuid REFERENCES leads(id) ON DELETE SET NULL,
  invoice_number  text NOT NULL,
  title           text,
  status          text CHECK (status IN ('draft','sent','paid','partial','overdue','cancelled')) DEFAULT 'draft',
  issue_date      date DEFAULT CURRENT_DATE,
  due_date        date,
  subtotal        numeric(12,2) NOT NULL DEFAULT 0,
  discount        numeric(12,2) DEFAULT 0,
  tax_percent     numeric(5,2) DEFAULT 0,
  tax_amount      numeric(12,2) DEFAULT 0,
  total           numeric(12,2) NOT NULL DEFAULT 0,
  currency        text DEFAULT 'INR',
  notes           text,
  terms           text,
  pdf_url         text,
  sent_at         timestamptz,
  created_by      uuid REFERENCES auth.users(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- =====================
-- INVOICE LINE ITEMS
-- =====================
CREATE TABLE invoice_line_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  quantity    numeric(10,3) DEFAULT 1,
  unit_price  numeric(12,2) NOT NULL DEFAULT 0,
  amount      numeric(12,2) NOT NULL DEFAULT 0,
  position    integer DEFAULT 0
);

-- =====================
-- PAYMENTS
-- =====================
CREATE TABLE payments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  lead_id           uuid REFERENCES leads(id) ON DELETE SET NULL,
  invoice_id        uuid REFERENCES invoices(id) ON DELETE SET NULL,
  amount            numeric(12,2) NOT NULL,
  currency          text DEFAULT 'INR',
  status            text CHECK (status IN ('pending','paid','partial','overdue','refunded','failed')) DEFAULT 'pending',
  payment_method    text,
  reference_number  text,
  phonepe_order_id  text,
  phonepe_txn_id    text,
  payment_url       text,
  due_date          date,
  paid_at           timestamptz,
  notes             text,
  created_by        uuid REFERENCES auth.users(id),
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- =====================
-- PUSH SUBSCRIPTIONS (Web Push)
-- =====================
CREATE TABLE push_subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint        text NOT NULL,
  p256dh          text NOT NULL,
  auth            text NOT NULL,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX idx_leads_org_stage ON leads(organization_id, stage_id);
CREATE INDEX idx_leads_org_assigned ON leads(organization_id, assigned_to);
CREATE INDEX idx_leads_followup ON leads(organization_id, next_followup_at) WHERE next_followup_at IS NOT NULL;
CREATE INDEX idx_leads_archived ON leads(organization_id, is_archived);
CREATE INDEX idx_activities_lead ON activities(lead_id, occurred_at DESC);
CREATE INDEX idx_activities_org ON activities(organization_id, occurred_at DESC);
CREATE INDEX idx_reminders_due ON reminders(organization_id, due_at) WHERE is_completed = false;
CREATE INDEX idx_reminders_user ON reminders(user_id, due_at) WHERE is_completed = false;
CREATE INDEX idx_payments_org_status ON payments(organization_id, status);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_invoices_org_status ON invoices(organization_id, status);

-- =====================
-- RLS HELPER FUNCTIONS (public schema — auth schema is restricted)
-- =====================
CREATE OR REPLACE FUNCTION public.user_org_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = (SELECT auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.user_org_role(org_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT role FROM organization_members
  WHERE user_id = (SELECT auth.uid())
  AND organization_id = org_id
  LIMIT 1
$$;

-- =====================
-- ENABLE RLS
-- =====================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================
-- PROFILES POLICIES
-- =====================
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()));
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY "profiles_select_org_members" ON profiles FOR SELECT TO authenticated
  USING (id IN (
    SELECT user_id FROM organization_members
    WHERE organization_id IN (SELECT public.user_org_ids())
  ));

-- =====================
-- ORGANIZATIONS POLICIES
-- =====================
CREATE POLICY "orgs_select" ON organizations FOR SELECT TO authenticated
  USING (id IN (SELECT public.user_org_ids()));
CREATE POLICY "orgs_insert" ON organizations FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "orgs_update" ON organizations FOR UPDATE TO authenticated
  USING (public.user_org_role(id) IN ('owner', 'admin'));
CREATE POLICY "orgs_delete" ON organizations FOR DELETE TO authenticated
  USING (public.user_org_role(id) = 'owner');

-- =====================
-- ORGANIZATION_MEMBERS POLICIES
-- =====================
CREATE POLICY "members_select" ON organization_members FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "members_insert" ON organization_members FOR INSERT TO authenticated
  WITH CHECK (
    public.user_org_role(organization_id) IN ('owner', 'admin')
    OR user_id = (SELECT auth.uid())
  );
CREATE POLICY "members_update" ON organization_members FOR UPDATE TO authenticated
  USING (public.user_org_role(organization_id) IN ('owner', 'admin'));
CREATE POLICY "members_delete" ON organization_members FOR DELETE TO authenticated
  USING (public.user_org_role(organization_id) IN ('owner', 'admin'));

-- =====================
-- ORG_INVITES POLICIES
-- =====================
CREATE POLICY "invites_select" ON org_invites FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT public.user_org_ids())
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
CREATE POLICY "invites_insert" ON org_invites FOR INSERT TO authenticated
  WITH CHECK (public.user_org_role(organization_id) IN ('owner', 'admin'));
CREATE POLICY "invites_update" ON org_invites FOR UPDATE TO authenticated
  USING (public.user_org_role(organization_id) IN ('owner', 'admin') OR token IS NOT NULL);
CREATE POLICY "invites_delete" ON org_invites FOR DELETE TO authenticated
  USING (public.user_org_role(organization_id) IN ('owner', 'admin'));

-- =====================
-- PIPELINE_STAGES POLICIES
-- =====================
CREATE POLICY "stages_select" ON pipeline_stages FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "stages_insert" ON pipeline_stages FOR INSERT TO authenticated
  WITH CHECK (public.user_org_role(organization_id) IN ('owner', 'admin'));
CREATE POLICY "stages_update" ON pipeline_stages FOR UPDATE TO authenticated
  USING (public.user_org_role(organization_id) IN ('owner', 'admin'));
CREATE POLICY "stages_delete" ON pipeline_stages FOR DELETE TO authenticated
  USING (public.user_org_role(organization_id) IN ('owner', 'admin'));

-- =====================
-- LEADS POLICIES
-- =====================
CREATE POLICY "leads_select" ON leads FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "leads_insert" ON leads FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "leads_update" ON leads FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT public.user_org_ids())
    AND (created_by = (SELECT auth.uid()) OR public.user_org_role(organization_id) IN ('owner','admin'))
  );
CREATE POLICY "leads_delete" ON leads FOR DELETE TO authenticated
  USING (public.user_org_role(organization_id) IN ('owner','admin'));

-- =====================
-- LEAD_TAGS POLICIES
-- =====================
CREATE POLICY "tags_select" ON lead_tags FOR SELECT TO authenticated
  USING (lead_id IN (SELECT id FROM leads WHERE organization_id IN (SELECT public.user_org_ids())));
CREATE POLICY "tags_insert" ON lead_tags FOR INSERT TO authenticated
  WITH CHECK (lead_id IN (SELECT id FROM leads WHERE organization_id IN (SELECT public.user_org_ids())));
CREATE POLICY "tags_delete" ON lead_tags FOR DELETE TO authenticated
  USING (lead_id IN (SELECT id FROM leads WHERE organization_id IN (SELECT public.user_org_ids())));

-- =====================
-- ACTIVITIES POLICIES
-- =====================
CREATE POLICY "activities_select" ON activities FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "activities_insert" ON activities FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "activities_update" ON activities FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.user_org_role(organization_id) IN ('owner','admin'));
CREATE POLICY "activities_delete" ON activities FOR DELETE TO authenticated
  USING (public.user_org_role(organization_id) IN ('owner','admin'));

-- =====================
-- REMINDERS POLICIES
-- =====================
CREATE POLICY "reminders_select" ON reminders FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "reminders_insert" ON reminders FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "reminders_update" ON reminders FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.user_org_role(organization_id) IN ('owner','admin'));
CREATE POLICY "reminders_delete" ON reminders FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.user_org_role(organization_id) IN ('owner','admin'));

-- =====================
-- INVOICES POLICIES
-- =====================
CREATE POLICY "invoices_select" ON invoices FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "invoices_insert" ON invoices FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "invoices_update" ON invoices FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "invoices_delete" ON invoices FOR DELETE TO authenticated
  USING (public.user_org_role(organization_id) IN ('owner','admin'));

-- =====================
-- INVOICE_LINE_ITEMS POLICIES
-- =====================
CREATE POLICY "line_items_select" ON invoice_line_items FOR SELECT TO authenticated
  USING (invoice_id IN (SELECT id FROM invoices WHERE organization_id IN (SELECT public.user_org_ids())));
CREATE POLICY "line_items_insert" ON invoice_line_items FOR INSERT TO authenticated
  WITH CHECK (invoice_id IN (SELECT id FROM invoices WHERE organization_id IN (SELECT public.user_org_ids())));
CREATE POLICY "line_items_update" ON invoice_line_items FOR UPDATE TO authenticated
  USING (invoice_id IN (SELECT id FROM invoices WHERE organization_id IN (SELECT public.user_org_ids())));
CREATE POLICY "line_items_delete" ON invoice_line_items FOR DELETE TO authenticated
  USING (invoice_id IN (SELECT id FROM invoices WHERE organization_id IN (SELECT public.user_org_ids())));

-- =====================
-- PAYMENTS POLICIES
-- =====================
CREATE POLICY "payments_select" ON payments FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "payments_insert" ON payments FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "payments_update" ON payments FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "payments_delete" ON payments FOR DELETE TO authenticated
  USING (public.user_org_role(organization_id) IN ('owner','admin'));

-- =====================
-- PUSH_SUBSCRIPTIONS POLICIES
-- =====================
CREATE POLICY "push_select_own" ON push_subscriptions FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY "push_insert_own" ON push_subscriptions FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "push_delete_own" ON push_subscriptions FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =====================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================
-- AUTO-UPDATE updated_at
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
