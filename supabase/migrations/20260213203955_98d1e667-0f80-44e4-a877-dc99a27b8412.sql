
-- Create investment_consultations table (clone of insurance_consultations)
CREATE TABLE public.investment_consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  customer_id UUID REFERENCES public.customers(id),
  consultation_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  version_key TEXT NOT NULL,
  label TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
);

-- Enable RLS
ALTER TABLE public.investment_consultations ENABLE ROW LEVEL SECURITY;

-- RLS policies (same as insurance_consultations)
CREATE POLICY "Admins can manage all investment consultations"
  ON public.investment_consultations FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Staff can create investment consultations"
  ON public.investment_consultations FOR INSERT
  WITH CHECK (is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can update own investment consultations"
  ON public.investment_consultations FOR UPDATE
  USING (is_staff_or_admin(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Staff can view investment consultations"
  ON public.investment_consultations FOR SELECT
  USING (is_staff_or_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_investment_consultations_updated_at
  BEFORE UPDATE ON public.investment_consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
