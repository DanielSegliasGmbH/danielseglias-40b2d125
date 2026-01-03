-- Create table for saved insurance consultations
CREATE TABLE public.insurance_consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  
  -- Version identifier: YYYY-MM-DD-HH-mm-X
  version_key TEXT NOT NULL,
  
  -- User-defined label (e.g., customer name, status)
  label TEXT,
  
  -- Customer reference (optional)
  customer_id UUID REFERENCES public.customers(id),
  
  -- Complete consultation state as JSONB
  -- Contains: topicStates, metadata, numeric values, selections
  consultation_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Status of the consultation
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived'))
);

-- Enable RLS
ALTER TABLE public.insurance_consultations ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all consultations"
ON public.insurance_consultations
FOR ALL
USING (is_admin(auth.uid()));

-- Staff can view and create consultations
CREATE POLICY "Staff can view consultations"
ON public.insurance_consultations
FOR SELECT
USING (is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can create consultations"
ON public.insurance_consultations
FOR INSERT
WITH CHECK (is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can update own consultations"
ON public.insurance_consultations
FOR UPDATE
USING (is_staff_or_admin(auth.uid()) AND created_by = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_insurance_consultations_updated_at
BEFORE UPDATE ON public.insurance_consultations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_insurance_consultations_created_by ON public.insurance_consultations(created_by);
CREATE INDEX idx_insurance_consultations_customer_id ON public.insurance_consultations(customer_id);
CREATE INDEX idx_insurance_consultations_version_key ON public.insurance_consultations(version_key);