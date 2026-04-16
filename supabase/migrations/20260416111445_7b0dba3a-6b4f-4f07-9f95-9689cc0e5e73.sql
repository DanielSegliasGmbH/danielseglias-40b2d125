
CREATE TABLE public.financial_xrays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month_key TEXT NOT NULL,
  report_markdown TEXT NOT NULL,
  tasks_created BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_key)
);

ALTER TABLE public.financial_xrays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own xrays" ON public.financial_xrays FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own xrays" ON public.financial_xrays FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own xrays" ON public.financial_xrays FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_financial_xrays_updated_at BEFORE UPDATE ON public.financial_xrays FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
