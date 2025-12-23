-- Add RLS policies for lead_rate_limits table (service role only)
CREATE POLICY "Service role can select lead_rate_limits"
ON public.lead_rate_limits
FOR SELECT
TO authenticated
USING (false);

CREATE POLICY "Service role can insert lead_rate_limits"
ON public.lead_rate_limits
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Service role can update lead_rate_limits"
ON public.lead_rate_limits
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Service role can delete lead_rate_limits"
ON public.lead_rate_limits
FOR DELETE
TO authenticated
USING (false);