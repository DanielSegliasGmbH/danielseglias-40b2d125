
-- Add user_type, plan, has_strategy_access to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_type text NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS has_strategy_access boolean NOT NULL DEFAULT false;

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles (user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles (plan);

-- Security definer function for strategy access check
CREATE OR REPLACE FUNCTION public.has_strategy_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT has_strategy_access FROM public.profiles WHERE id = _user_id AND user_type = 'customer'),
    false
  );
$$;
