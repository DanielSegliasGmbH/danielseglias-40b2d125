
CREATE TABLE public.financial_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  snapshot_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  peak_score NUMERIC,
  net_worth NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots"
  ON public.financial_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snapshots"
  ON public.financial_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own snapshots"
  ON public.financial_snapshots FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all snapshots"
  ON public.financial_snapshots FOR SELECT
  USING (is_admin(auth.uid()));

CREATE INDEX idx_financial_snapshots_user_id ON public.financial_snapshots(user_id);
CREATE INDEX idx_financial_snapshots_created_at ON public.financial_snapshots(created_at DESC);
