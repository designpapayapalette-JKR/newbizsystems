-- 1. Macros Table
CREATE TABLE IF NOT EXISTS public.ticket_macros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_template TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for Macros
ALTER TABLE public.ticket_macros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view macros in their org" ON public.ticket_macros;
CREATE POLICY "Users can view macros in their org"
ON public.ticket_macros FOR SELECT
USING (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can create macros in their org" ON public.ticket_macros;
CREATE POLICY "Users can create macros in their org"
ON public.ticket_macros FOR INSERT
WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
));

-- 2. Knowledge Base Articles
CREATE TABLE IF NOT EXISTS public.kb_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, slug)
);

-- RLS for KB Articles
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published articles" ON public.kb_articles;
-- Public can read published articles
CREATE POLICY "Public can view published articles"
ON public.kb_articles FOR SELECT
USING (is_published = true);

DROP POLICY IF EXISTS "Org members can manage all articles" ON public.kb_articles;
-- Org members can manage all articles
CREATE POLICY "Org members can manage all articles"
ON public.kb_articles FOR ALL
USING (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
));
