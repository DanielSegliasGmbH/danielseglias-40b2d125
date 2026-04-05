
-- Central meta profile for each user
CREATE TABLE public.meta_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  monthly_income NUMERIC,
  fixed_costs NUMERIC,
  savings_rate NUMERIC,
  wealth NUMERIC,
  debts NUMERIC,
  age INTEGER,
  occupation TEXT,
  financial_goal TEXT,
  tax_burden NUMERIC,
  risk_tolerance INTEGER CHECK (risk_tolerance BETWEEN 1 AND 10),
  last_confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_meta_profiles_user ON public.meta_profiles (user_id);

ALTER TABLE public.meta_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meta profile"
ON public.meta_profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meta profile"
ON public.meta_profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meta profile"
ON public.meta_profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all meta profiles"
ON public.meta_profiles FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_meta_profiles_updated_at
BEFORE UPDATE ON public.meta_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Version history for meta profile changes
CREATE TABLE public.meta_profile_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_meta_history_user ON public.meta_profile_history (user_id, created_at DESC);

ALTER TABLE public.meta_profile_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
ON public.meta_profile_history FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
ON public.meta_profile_history FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all history"
ON public.meta_profile_history FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));
