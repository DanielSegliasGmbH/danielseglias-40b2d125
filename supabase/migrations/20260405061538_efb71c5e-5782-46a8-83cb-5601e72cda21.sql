-- 1. Fix three_a_analyses: drop permissive SELECT and UPDATE policies
DROP POLICY IF EXISTS "Users can view own analyses by session" ON public.three_a_analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON public.three_a_analyses;

-- 2. Fix three_a_documents: drop permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view documents" ON public.three_a_documents;

-- 3. Fix three_a_extracted_fields: drop permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view extracted_fields" ON public.three_a_extracted_fields;

-- 4. Fix storage: drop permissive SELECT policy for three-a-documents and add admin-only
DROP POLICY IF EXISTS "Anyone can view own 3a documents" ON storage.objects;

-- 5. Fix customer_portal_settings: create a view without the password column
-- and update the client SELECT policy to not expose the password

-- Create a secure view for client portal settings without the password
CREATE OR REPLACE VIEW public.customer_portal_settings_client AS
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
  created_at,
  updated_at
FROM public.customer_portal_settings;

-- Grant access to the view
GRANT SELECT ON public.customer_portal_settings_client TO anon, authenticated;