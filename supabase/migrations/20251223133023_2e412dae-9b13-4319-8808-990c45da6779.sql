-- Add unique constraint for bucketing (upsert support)
ALTER TABLE public.lead_rate_limits 
ADD CONSTRAINT lead_rate_limits_ip_window_unique 
UNIQUE (ip_address, window_start);

-- Drop the old non-unique index if exists (redundant with unique constraint)
DROP INDEX IF EXISTS idx_lead_rate_limits_ip_window;