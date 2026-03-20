-- Add title column to both consultation tables
ALTER TABLE public.insurance_consultations ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.investment_consultations ADD COLUMN IF NOT EXISTS title text;

-- Update status defaults to 'active' for new flow
ALTER TABLE public.insurance_consultations ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE public.investment_consultations ALTER COLUMN status SET DEFAULT 'active';