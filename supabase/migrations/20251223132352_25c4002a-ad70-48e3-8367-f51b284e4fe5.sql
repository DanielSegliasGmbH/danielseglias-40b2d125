-- Create rate limit tracking table
CREATE TABLE public.lead_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_lead_rate_limits_ip_window ON public.lead_rate_limits (ip_address, window_start);

-- Enable RLS (only edge function with service role can access)
ALTER TABLE public.lead_rate_limits ENABLE ROW LEVEL SECURITY;

-- No public access policies - only service role can read/write

-- Remove the public INSERT policy on leads table
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;

-- Create a more restrictive policy that only allows service role (edge functions)
-- This effectively blocks direct client inserts
CREATE POLICY "Service role can insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  -- This will only pass for service role, not anon key
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Cleanup old rate limit entries function (can be called by cron)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.lead_rate_limits
  WHERE window_start < now() - interval '1 day';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;