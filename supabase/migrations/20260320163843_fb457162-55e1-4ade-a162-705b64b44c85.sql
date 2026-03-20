CREATE OR REPLACE FUNCTION public.staff_has_customer_access(_user_id uuid, _customer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cases
    WHERE customer_id = _customer_id
    AND assigned_to = _user_id
  );
$$;