-- !! Run this in your Supabase dashboard SQL editor !!
-- Supabase project: https://supabase.com/dashboard/project/yzmxierzjzxwfsornpln/sql

-- ──────────────────────────────────────────
-- Super admin flag on profiles
-- ──────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;

-- ──────────────────────────────────────────
-- Subscription plans (managed by super admin)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,                  -- 'Free', 'Starter', 'Growth', 'Pro'
  slug            text UNIQUE NOT NULL,           -- 'free', 'starter', 'growth', 'pro'
  price_monthly   numeric(10,2) NOT NULL DEFAULT 0,
  price_yearly    numeric(10,2) NOT NULL DEFAULT 0,
  currency        text NOT NULL DEFAULT 'INR',
  max_leads       integer DEFAULT 100,            -- NULL = unlimited
  max_members     integer DEFAULT 1,              -- NULL = unlimited
  max_invoices    integer DEFAULT 10,             -- NULL = unlimited
  features        jsonb DEFAULT '[]',             -- list of feature strings
  is_active       boolean DEFAULT true,
  sort_order      integer DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────
-- Org subscriptions
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS org_subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  plan_id         uuid REFERENCES subscription_plans(id) NOT NULL,
  status          text CHECK (status IN ('trialing','active','past_due','cancelled','expired')) DEFAULT 'active',
  billing_cycle   text CHECK (billing_cycle IN ('monthly','yearly')) DEFAULT 'monthly',
  started_at      timestamptz DEFAULT now(),
  expires_at      timestamptz,                    -- NULL = never (lifetime / manual)
  cancelled_at    timestamptz,
  notes           text,                           -- super admin notes
  created_by      uuid REFERENCES auth.users(id), -- super admin who assigned this
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(organization_id)                         -- one active subscription per org
);

-- ──────────────────────────────────────────
-- RLS
-- ──────────────────────────────────────────
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_subscriptions  ENABLE ROW LEVEL SECURITY;

-- Plans: everyone can read active plans
CREATE POLICY "plans_read" ON subscription_plans FOR SELECT USING (is_active = true);
-- Super admin can do anything on plans
CREATE POLICY "plans_superadmin" ON subscription_plans FOR ALL
  USING ((SELECT is_super_admin FROM profiles WHERE id = auth.uid()));

-- Subscriptions: org members can read their own org's subscription
CREATE POLICY "sub_read_own" ON org_subscriptions FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));
-- Super admin can do anything on subscriptions
CREATE POLICY "sub_superadmin" ON org_subscriptions FOR ALL
  USING ((SELECT is_super_admin FROM profiles WHERE id = auth.uid()));

-- ──────────────────────────────────────────
-- Seed default plans
-- ──────────────────────────────────────────
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, currency, max_leads, max_members, max_invoices, features, sort_order)
VALUES
  ('Free',    'free',    0,      0,      'INR', 50,   1,    5,    '["Up to 50 leads","1 team member","5 invoices/month","Basic pipeline"]', 0),
  ('Starter', 'starter', 999,   9990,   'INR', 500,  3,    50,   '["Up to 500 leads","3 team members","50 invoices/month","Pipeline & reminders","Email templates"]', 1),
  ('Growth',  'growth',  2499,  24990,  'INR', 2000, 10,   200,  '["Up to 2000 leads","10 team members","200 invoices/month","All Starter features","Webhooks & API","Audit log"]', 2),
  ('Pro',     'pro',     4999,  49990,  'INR', NULL, NULL, NULL, '["Unlimited leads","Unlimited members","Unlimited invoices","All Growth features","Priority support","Custom branding"]', 3)
ON CONFLICT (slug) DO NOTHING;

-- ──────────────────────────────────────────
-- Seed free subscription for all existing orgs
-- ──────────────────────────────────────────
INSERT INTO org_subscriptions (organization_id, plan_id, status, billing_cycle)
SELECT o.id, p.id, 'active', 'monthly'
FROM organizations o
CROSS JOIN subscription_plans p
WHERE p.slug = 'free'
  AND NOT EXISTS (
    SELECT 1 FROM org_subscriptions s WHERE s.organization_id = o.id
  );
