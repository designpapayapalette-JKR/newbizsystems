-- ERP Maturity Migration: PF Capping, Leave Balances, and Expenses

-- 1. Add PF Capping Limit to HR Settings
ALTER TABLE public.hr_settings 
ADD COLUMN IF NOT EXISTS pf_capping_limit NUMERIC(10, 2) DEFAULT 15000;

-- 2. HR Leave Balances Table
CREATE TABLE IF NOT EXISTS public.hr_leave_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    sick_leave_total NUMERIC(5, 2) DEFAULT 12,
    sick_leave_used NUMERIC(5, 2) DEFAULT 0,
    casual_leave_total NUMERIC(5, 2) DEFAULT 12,
    casual_leave_used NUMERIC(5, 2) DEFAULT 0,
    earned_leave_total NUMERIC(5, 2) DEFAULT 18,
    earned_leave_used NUMERIC(5, 2) DEFAULT 0,
    year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, year)
);

-- 3. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- Rent, Utilities, Marketing, Software, Travel, Others
    amount NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.hr_leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Org-based access)
CREATE POLICY "org_access_hr_leave_balances" ON public.hr_leave_balances 
FOR ALL USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "org_access_expenses" ON public.expenses 
FOR ALL USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));

-- 6. Updated At Triggers
CREATE TRIGGER set_hr_leave_balances_updated_at BEFORE UPDATE ON public.hr_leave_balances FOR EACH ROW EXECUTE PROCEDURE public.hr_set_updated_at();
CREATE TRIGGER set_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE PROCEDURE public.hr_set_updated_at();
