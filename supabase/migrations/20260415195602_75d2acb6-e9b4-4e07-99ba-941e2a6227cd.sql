
CREATE TABLE public.life_film_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  age INTEGER,
  monthly_income NUMERIC,
  monthly_expenses NUMERIC,
  total_savings NUMERIC,
  life_goals TEXT[] DEFAULT '{}',
  desired_children TEXT DEFAULT '0',
  target_retirement_age INTEGER DEFAULT 60,
  truth_mode TEXT DEFAULT 'optimistic',
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.life_film_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own life_film_data"
ON public.life_film_data FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own life_film_data"
ON public.life_film_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own life_film_data"
ON public.life_film_data FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all life_film_data"
ON public.life_film_data FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE UNIQUE INDEX idx_life_film_data_user_id ON public.life_film_data (user_id);

CREATE TRIGGER update_life_film_data_updated_at
BEFORE UPDATE ON public.life_film_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
