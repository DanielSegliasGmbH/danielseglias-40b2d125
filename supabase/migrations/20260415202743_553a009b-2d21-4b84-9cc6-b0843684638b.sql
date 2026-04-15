CREATE TABLE public.monthly_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month_key TEXT NOT NULL,
  summary_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT monthly_summaries_unique UNIQUE (user_id, month_key)
);

ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own summaries"
ON public.monthly_summaries FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own summaries"
ON public.monthly_summaries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own summaries"
ON public.monthly_summaries FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_summaries_updated_at
BEFORE UPDATE ON public.monthly_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();