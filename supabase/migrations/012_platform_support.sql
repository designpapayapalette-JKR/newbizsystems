-- Platform Support Tickets
CREATE TABLE IF NOT EXISTS public.platform_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('bug', 'support', 'feature_request')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Platform Ticket Messages (Notes/Replies)
CREATE TABLE IF NOT EXISTS public.platform_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.platform_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.platform_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Subscribers can view and create their own org's tickets
CREATE POLICY "Org members can view their platform tickets"
ON public.platform_tickets FOR SELECT
USING (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
));

CREATE POLICY "Org members can create platform tickets"
ON public.platform_tickets FOR INSERT
WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
));

CREATE POLICY "Ticket creators can update tickets"
ON public.platform_tickets FOR UPDATE
USING (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
));

-- Subscribers can view and send messages on their org's tickets
CREATE POLICY "Org members can view ticket messages"
ON public.platform_ticket_messages FOR SELECT
USING (ticket_id IN (
    SELECT id FROM public.platform_tickets WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
));

CREATE POLICY "Org members can create ticket messages"
ON public.platform_ticket_messages FOR INSERT
WITH CHECK (ticket_id IN (
    SELECT id FROM public.platform_tickets WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
));

-- Note: Super Admins will bypass RLS or use the Service Role Key for managing all tickets.
-- If they query via authenticated client, we might need a specific policy.
-- Adding a policy for super admins:
CREATE POLICY "Super admins can view all platform tickets"
ON public.platform_tickets FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true));

CREATE POLICY "Super admins can update all platform tickets"
ON public.platform_tickets FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true));

CREATE POLICY "Super admins can view all ticket messages"
ON public.platform_ticket_messages FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true));

CREATE POLICY "Super admins can create ticket messages"
ON public.platform_ticket_messages FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true));

