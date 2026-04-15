
CREATE TABLE public.finanz_type_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  finanz_type TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.finanz_type_results ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX idx_finanz_type_results_user ON public.finanz_type_results (user_id);

CREATE POLICY "Users can view own finanz_type" ON public.finanz_type_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own finanz_type" ON public.finanz_type_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own finanz_type" ON public.finanz_type_results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all finanz_type" ON public.finanz_type_results FOR SELECT USING (is_admin(auth.uid()));

CREATE TRIGGER update_finanz_type_results_updated_at
  BEFORE UPDATE ON public.finanz_type_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
