ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS monthly_income numeric,
  ADD COLUMN IF NOT EXISTS fixed_costs numeric,
  ADD COLUMN IF NOT EXISTS savings_rate numeric,
  ADD COLUMN IF NOT EXISTS wealth numeric,
  ADD COLUMN IF NOT EXISTS debts numeric,
  ADD COLUMN IF NOT EXISTS occupation text,
  ADD COLUMN IF NOT EXISTS professional_status text,
  ADD COLUMN IF NOT EXISTS financial_goal text,
  ADD COLUMN IF NOT EXISTS tax_burden numeric,
  ADD COLUMN IF NOT EXISTS risk_tolerance integer,
  ADD COLUMN IF NOT EXISTS freedom_target_age integer,
  ADD COLUMN IF NOT EXISTS freedom_life_expectancy integer,
  ADD COLUMN IF NOT EXISTS last_confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS meta_migrated boolean DEFAULT false;

CREATE OR REPLACE FUNCTION public.migrate_meta_to_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles p
  SET
    age = m.age,
    monthly_income = m.monthly_income,
    fixed_costs = m.fixed_costs,
    savings_rate = m.savings_rate,
    wealth = m.wealth,
    debts = m.debts,
    occupation = m.occupation,
    professional_status = m.professional_status,
    financial_goal = m.financial_goal,
    tax_burden = m.tax_burden,
    risk_tolerance = m.risk_tolerance,
    freedom_target_age = m.freedom_target_age,
    freedom_life_expectancy = m.freedom_life_expectancy,
    last_confirmed_at = m.last_confirmed_at,
    meta_migrated = true,
    updated_at = now()
  FROM public.meta_profiles m
  WHERE m.user_id = p.id
    AND p.meta_migrated = false;
END;
$$;

SELECT public.migrate_meta_to_profiles();