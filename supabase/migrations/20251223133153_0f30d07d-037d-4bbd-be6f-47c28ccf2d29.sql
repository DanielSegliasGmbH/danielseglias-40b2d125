-- Create RPC function for atomic increment (fallback for upsert)
CREATE OR REPLACE FUNCTION public.increment_rate_limit(p_ip text, p_window timestamptz)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.lead_rate_limits
  SET request_count = request_count + 1
  WHERE ip_address = p_ip AND window_start = p_window;
  
  -- If no row was updated, insert a new one
  IF NOT FOUND THEN
    INSERT INTO public.lead_rate_limits (ip_address, window_start, request_count)
    VALUES (p_ip, p_window, 1)
    ON CONFLICT (ip_address, window_start) DO UPDATE
    SET request_count = lead_rate_limits.request_count + 1;
  END IF;
END;
$$;