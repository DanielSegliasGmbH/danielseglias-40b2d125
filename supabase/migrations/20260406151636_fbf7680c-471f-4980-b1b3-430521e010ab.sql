-- Add visibility_condition jsonb to access tables for future conditional logic
ALTER TABLE public.customer_tool_access
  ADD COLUMN IF NOT EXISTS visibility_condition jsonb DEFAULT NULL;

ALTER TABLE public.customer_module_access
  ADD COLUMN IF NOT EXISTS visibility_condition jsonb DEFAULT NULL;

ALTER TABLE public.customer_lesson_access
  ADD COLUMN IF NOT EXISTS visibility_condition jsonb DEFAULT NULL;

COMMENT ON COLUMN public.customer_tool_access.visibility_condition IS 'Optional JSON conditions for automated visibility (e.g. after_first_login, after_tool_completed, premium_only)';
COMMENT ON COLUMN public.customer_module_access.visibility_condition IS 'Optional JSON conditions for automated visibility';
COMMENT ON COLUMN public.customer_lesson_access.visibility_condition IS 'Optional JSON conditions for automated visibility';