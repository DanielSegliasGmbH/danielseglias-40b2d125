-- Create table for 3a check lead magnet results
CREATE TABLE public.leadmagnet_3a_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  result_level TEXT NOT NULL,
  score_total INTEGER NOT NULL,
  q1_provider TEXT NOT NULL,
  q2_year TEXT NOT NULL,
  q3_payment TEXT NOT NULL,
  q4_fees TEXT NOT NULL,
  q5_flexibility TEXT NOT NULL,
  q6_investment TEXT NOT NULL,
  q7_feeling TEXT NOT NULL,
  contact_email TEXT
);

-- Enable RLS
ALTER TABLE public.leadmagnet_3a_checks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public lead magnet)
CREATE POLICY "Anyone can insert 3a checks"
ON public.leadmagnet_3a_checks
FOR INSERT
WITH CHECK (true);

-- Only staff/admin can view results
CREATE POLICY "Staff can view 3a checks"
ON public.leadmagnet_3a_checks
FOR SELECT
USING (is_staff_or_admin(auth.uid()));

-- Only admin can delete
CREATE POLICY "Admins can delete 3a checks"
ON public.leadmagnet_3a_checks
FOR DELETE
USING (is_admin(auth.uid()));