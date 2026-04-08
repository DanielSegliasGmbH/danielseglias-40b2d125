
-- User scoring table for persisted scores, status, and labels
CREATE TABLE public.user_scoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'neu',
  labels TEXT[] NOT NULL DEFAULT '{}',
  score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_manual_override BOOLEAN NOT NULL DEFAULT false,
  last_computed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for filtering
CREATE INDEX idx_user_scoring_status ON public.user_scoring(status);
CREATE INDEX idx_user_scoring_score ON public.user_scoring(score);
CREATE INDEX idx_user_scoring_labels ON public.user_scoring USING GIN(labels);

-- Enable RLS
ALTER TABLE public.user_scoring ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admins can manage user_scoring"
  ON public.user_scoring FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Users can view own score
CREATE POLICY "Users can view own scoring"
  ON public.user_scoring FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_scoring_updated_at
  BEFORE UPDATE ON public.user_scoring
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
