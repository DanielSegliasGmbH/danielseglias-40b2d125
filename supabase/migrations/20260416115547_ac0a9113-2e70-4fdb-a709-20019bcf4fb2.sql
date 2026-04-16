
CREATE TABLE public.journey_nudges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  nudge_key TEXT NOT NULL,
  shown_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, nudge_key)
);

ALTER TABLE public.journey_nudges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nudges"
  ON public.journey_nudges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nudges"
  ON public.journey_nudges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nudges"
  ON public.journey_nudges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_journey_nudges_user ON public.journey_nudges(user_id, day_number);
