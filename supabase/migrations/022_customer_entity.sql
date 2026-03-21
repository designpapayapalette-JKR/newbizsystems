-- CRM Maturity: Customer/Account Entity
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    gstin TEXT,
    address TEXT,
    state TEXT,
    state_code TEXT,
    pan TEXT,
    website TEXT,
    industry TEXT,
    logo_url TEXT,
    source_lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active', -- active, inactive
    total_lifetime_value NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "org_access_customers" ON public.customers FOR ALL USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE PROCEDURE public.hr_set_updated_at();

-- Add customer_id to Invoices and Tickets for better tracking
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
