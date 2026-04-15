
CREATE TABLE public.weekly_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_key TEXT NOT NULL,
  challenges JSONB NOT NULL DEFAULT '[]'::jsonb,
  bonus_claimed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_key)
);

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weekly challenges"
  ON public.weekly_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weekly challenges"
  ON public.weekly_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly challenges"
  ON public.weekly_challenges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_weekly_challenges_updated_at
  BEFORE UPDATE ON public.weekly_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
