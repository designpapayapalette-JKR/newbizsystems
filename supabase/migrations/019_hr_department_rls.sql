-- Function to fetch the mapped HR Department for a user within an org
CREATE OR REPLACE FUNCTION public.user_department(org_id UUID)
RETURNS TEXT AS $$
  SELECT department FROM public.hr_employees 
  WHERE user_id = auth.uid() AND organization_id = org_id 
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- 1. Harden Support API (Tickets)
DROP POLICY IF EXISTS "tickets_org" ON tickets;
DROP POLICY IF EXISTS "ticket_comments_org" ON ticket_comments;

CREATE POLICY "tickets_access" ON tickets FOR ALL TO authenticated
USING (
  organization_id IN (SELECT public.user_org_ids())
  AND (
    public.user_org_role(organization_id) IN ('owner', 'admin')
    OR public.user_department(organization_id) = 'Support'
    OR assigned_to = auth.uid()
  )
);

CREATE POLICY "ticket_comments_access" ON ticket_comments FOR ALL TO authenticated
USING (
  ticket_id IN (
    SELECT id FROM tickets WHERE organization_id IN (SELECT public.user_org_ids())
    AND (
      public.user_org_role(organization_id) IN ('owner', 'admin')
      OR public.user_department(organization_id) = 'Support'
      OR assigned_to = auth.uid()
    )
  )
);

-- 2. Harden Sales API (Leads)
DROP POLICY IF EXISTS "leads_select" ON leads;
DROP POLICY IF EXISTS "leads_update" ON leads;

CREATE POLICY "leads_select_v2" ON leads FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT public.user_org_ids())
    AND (
      public.user_org_role(organization_id) IN ('owner', 'admin')
      OR public.user_department(organization_id) = 'Sales'
      OR assigned_to = auth.uid()
      OR created_by = auth.uid()
    )
  );

CREATE POLICY "leads_update_v2" ON leads FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT public.user_org_ids())
    AND (
      public.user_org_role(organization_id) IN ('owner', 'admin')
      OR public.user_department(organization_id) = 'Sales'
      OR assigned_to = auth.uid()
      OR created_by = auth.uid()
    )
  );
