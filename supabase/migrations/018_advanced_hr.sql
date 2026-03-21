-- HR Settings Table for global organization parameters
CREATE TABLE IF NOT EXISTS public.hr_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    work_start_time TIME DEFAULT '09:30:00',
    work_end_time TIME DEFAULT '18:30:00',
    half_day_margin_mins INTEGER DEFAULT 60,
    team_break_start_time TIME DEFAULT '11:00:00',
    team_break_end_time TIME DEFAULT '11:15:00',
    lunch_break_start_time TIME DEFAULT '13:00:00',
    lunch_break_end_time TIME DEFAULT '14:00:00',
    total_working_hours NUMERIC(5, 2) DEFAULT 9.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id)
);

-- HR Holidays Table for managing public/bank holidays
CREATE TABLE IF NOT EXISTS public.hr_holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    type TEXT DEFAULT 'public', -- 'public', 'company'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, date)
);

-- Add working days and hours per day to hr_employees
ALTER TABLE public.hr_employees 
ADD COLUMN IF NOT EXISTS working_days JSONB DEFAULT '[1,2,3,4,5]'::jsonb, -- 1=Mon, 5=Fri
ADD COLUMN IF NOT EXISTS daily_working_hours NUMERIC(5, 2) DEFAULT 9.00;

-- Expand hr_attendance to support strict location, internet time, and breaks
ALTER TABLE public.hr_attendance
ADD COLUMN IF NOT EXISTS check_in_location TEXT, -- lat,lng
ADD COLUMN IF NOT EXISTS check_out_location TEXT,
ADD COLUMN IF NOT EXISTS check_in_ip TEXT,
ADD COLUMN IF NOT EXISTS check_out_ip TEXT,
ADD COLUMN IF NOT EXISTS break_start_time TIME,
ADD COLUMN IF NOT EXISTS break_end_time TIME,
ADD COLUMN IF NOT EXISTS lunch_start_time TIME,
ADD COLUMN IF NOT EXISTS lunch_end_time TIME,
ADD COLUMN IF NOT EXISTS total_hours_worked NUMERIC(5, 2);

-- Set updated_at trigger for hr_settings
CREATE TRIGGER set_hr_settings_updated_at 
BEFORE UPDATE ON public.hr_settings 
FOR EACH ROW EXECUTE PROCEDURE public.hr_set_updated_at();

-- Enable RLS for new tables
ALTER TABLE public.hr_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_holidays ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies for new tables
CREATE POLICY "org_access_hr_settings_select" ON public.hr_settings FOR SELECT USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org_access_hr_settings_insert" ON public.hr_settings FOR INSERT WITH CHECK (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()) AND public.user_org_role(organization_id) IN ('owner', 'admin'));
CREATE POLICY "org_access_hr_settings_update" ON public.hr_settings FOR UPDATE USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()) AND public.user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "org_access_hr_holidays_select" ON public.hr_holidays FOR SELECT USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "org_access_hr_holidays_insert" ON public.hr_holidays FOR INSERT WITH CHECK (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()) AND public.user_org_role(organization_id) IN ('owner', 'admin'));
CREATE POLICY "org_access_hr_holidays_update" ON public.hr_holidays FOR UPDATE USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()) AND public.user_org_role(organization_id) IN ('owner', 'admin'));
CREATE POLICY "org_access_hr_holidays_delete" ON public.hr_holidays FOR DELETE USING (organization_id IN (SELECT current_org_id FROM public.profiles WHERE id = auth.uid()) AND public.user_org_role(organization_id) IN ('owner', 'admin'));
