
CREATE TABLE public.income_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL DEFAULT 'monatlich',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own income_sources"
ON public.income_sources FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own income_sources"
ON public.income_sources FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income_sources"
ON public.income_sources FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own income_sources"
ON public.income_sources FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all income_sources"
ON public.income_sources FOR SELECT
USING (is_admin(auth.uid()));

CREATE TRIGGER update_income_sources_updated_at
BEFORE UPDATE ON public.income_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_income_sources_user_id ON public.income_sources (user_id);
