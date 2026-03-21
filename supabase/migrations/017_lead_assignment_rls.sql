-- Drop existing permissive leads policies
DROP POLICY IF EXISTS "leads_select" ON leads;
DROP POLICY IF EXISTS "leads_update" ON leads;

-- Create new strict leads_select policy
-- Users can select a lead if:
-- 1. They are an admin or owner of the organization
-- 2. OR they are the assigned_to user
-- 3. OR they are the created_by user
CREATE POLICY "leads_select" ON leads FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT public.user_org_ids())
    AND (
      public.user_org_role(organization_id) IN ('owner', 'admin')
      OR assigned_to = (SELECT auth.uid())
      OR created_by = (SELECT auth.uid())
    )
  );

-- Create new strict leads_update policy
-- Users can update a lead if:
-- 1. They are an admin or owner of the organization
-- 2. OR they are the assigned_to user
-- 3. OR they are the created_by user
CREATE POLICY "leads_update" ON leads FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT public.user_org_ids())
    AND (
      public.user_org_role(organization_id) IN ('owner', 'admin')
      OR assigned_to = (SELECT auth.uid())
      OR created_by = (SELECT auth.uid())
    )
  );
