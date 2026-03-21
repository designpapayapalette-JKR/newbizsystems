ALTER TABLE public.hr_settings
ADD COLUMN IF NOT EXISTS enable_pf_deduction BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_esi_deduction BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_tds_deduction BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_pt_deduction BOOLEAN DEFAULT false;
