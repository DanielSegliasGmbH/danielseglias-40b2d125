DROP VIEW IF EXISTS public.customer_portal_settings_client;

CREATE VIEW public.customer_portal_settings_client
WITH (security_invoker = true)
AS
SELECT
  id,
  customer_id,
  show_courses,
  show_goals,
  show_insurances,
  show_library,
  show_strategies,
  show_strategy_privacy,
  show_tasks,
  show_tools,
  (strategy_access_password IS NOT NULL AND strategy_access_password != '') AS has_strategy_password,
  created_at,
  updated_at
FROM public.customer_portal_settings;

GRANT SELECT ON public.customer_portal_settings_client TO anon, authenticated;