
-- User journey tracking
CREATE TABLE public.user_journey (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_phase INTEGER NOT NULL DEFAULT 0,
  milestones_completed JSONB NOT NULL DEFAULT '{}',
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_journey ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journey"
  ON public.user_journey FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journey"
  ON public.user_journey FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journey"
  ON public.user_journey FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_journey_updated_at
  BEFORE UPDATE ON public.user_journey
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Feature unlock records
CREATE TABLE public.feature_unlocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_key TEXT NOT NULL,
  phase INTEGER NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_key)
);

ALTER TABLE public.feature_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlocks"
  ON public.feature_unlocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own unlocks"
  ON public.feature_unlocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);
