-- PeakScore table
CREATE TABLE public.peak_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  score numeric NOT NULL DEFAULT 0,
  is_snapshot boolean NOT NULL DEFAULT false,
  calculated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_peak_scores_user_calculated ON public.peak_scores (user_id, calculated_at DESC);
CREATE INDEX idx_peak_scores_snapshots ON public.peak_scores (user_id, is_snapshot, calculated_at DESC) WHERE is_snapshot = true;

-- RLS
ALTER TABLE public.peak_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own peak_scores"
ON public.peak_scores FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own peak_scores"
ON public.peak_scores FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own peak_scores"
ON public.peak_scores FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own peak_scores"
ON public.peak_scores FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all peak_scores"
ON public.peak_scores FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Enable realtime for dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.peak_scores;