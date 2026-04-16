
CREATE TABLE public.last_plan_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  opted_in BOOLEAN NOT NULL DEFAULT false,
  opted_in_at TIMESTAMP WITH TIME ZONE,
  dismissed_until TIMESTAMP WITH TIME ZONE,
  vorsorgeauftrag JSONB NOT NULL DEFAULT '{}',
  patientenverfuegung JSONB NOT NULL DEFAULT '{}',
  testament JSONB NOT NULL DEFAULT '{}',
  todesfall_dokumente JSONB NOT NULL DEFAULT '{}',
  beguenstigte JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.last_plan_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own last plan"
  ON public.last_plan_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own last plan"
  ON public.last_plan_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own last plan"
  ON public.last_plan_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own last plan"
  ON public.last_plan_progress FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_last_plan_progress_updated_at
  BEFORE UPDATE ON public.last_plan_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
