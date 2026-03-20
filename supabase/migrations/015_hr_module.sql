-- HR Employees Table
CREATE TABLE public.hr_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    employee_id TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    designation TEXT,
    department TEXT,
    date_of_joining DATE,
    base_salary_monthly NUMERIC(10, 2) DEFAULT 0,
    pan_number TEXT,
    uan_number TEXT,
    esic_number TEXT,
    bank_account TEXT,
    ifsc_code TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HR Attendance Table
CREATE TABLE public.hr_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL, -- present, absent, half_day, leave
    check_in_time TIME,
    check_out_time TIME,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- HR Leaves Table
CREATE TABLE public.hr_leaves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- sick, casual, earned
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HR Payroll Table
CREATE TABLE public.hr_payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    month_year TEXT NOT NULL, -- e.g., '2023-10'
    basic_salary NUMERIC(10, 2) DEFAULT 0,
    hra NUMERIC(10, 2) DEFAULT 0,
    special_allowance NUMERIC(10, 2) DEFAULT 0,
    gross_salary NUMERIC(10, 2) DEFAULT 0,
    pf_deduction NUMERIC(10, 2) DEFAULT 0,
    esi_deduction NUMERIC(10, 2) DEFAULT 0,
    pt_deduction NUMERIC(10, 2) DEFAULT 0,
    tds_deduction NUMERIC(10, 2) DEFAULT 0,
    net_payable NUMERIC(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'draft', -- draft, paid
    paid_on DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, month_year)
);

-- Enable RLS
ALTER TABLE public.hr_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_payroll ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at
CREATE TRIGGER set_hr_employees_updated_at BEFORE UPDATE ON public.hr_employees FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at();
CREATE TRIGGER set_hr_leaves_updated_at BEFORE UPDATE ON public.hr_leaves FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at();
CREATE TRIGGER set_hr_payroll_updated_at BEFORE UPDATE ON public.hr_payroll FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at();

-- RLS Policies (Users can view/edit their organization's data if they are linked to it in profiles)
-- Organizations check logic
CREATE POLICY "org_access_hr_employees_select" ON public.hr_employees FOR SELECT USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org_access_hr_employees_insert" ON public.hr_employees FOR INSERT WITH CHECK (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org_access_hr_employees_update" ON public.hr_employees FOR UPDATE USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org_access_hr_employees_delete" ON public.hr_employees FOR DELETE USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "org_access_hr_attendance_select" ON public.hr_attendance FOR SELECT USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org_access_hr_attendance_insert" ON public.hr_attendance FOR INSERT WITH CHECK (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org_access_hr_attendance_update" ON public.hr_attendance FOR UPDATE USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org_access_hr_attendance_delete" ON public.hr_attendance FOR DELETE USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "org_access_hr_leaves_select" ON public.hr_leaves FOR SELECT USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org_access_hr_leaves_insert" ON public.hr_leaves FOR INSERT WITH CHECK (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org_access_hr_leaves_update" ON public.hr_leaves FOR UPDATE USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org_access_hr_leaves_delete" ON public.hr_leaves FOR DELETE USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "org_access_hr_payroll_select" ON public.hr_payroll FOR SELECT USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org_access_hr_payroll_insert" ON public.hr_payroll FOR INSERT WITH CHECK (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org_access_hr_payroll_update" ON public.hr_payroll FOR UPDATE USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org_access_hr_payroll_delete" ON public.hr_payroll FOR DELETE USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));
