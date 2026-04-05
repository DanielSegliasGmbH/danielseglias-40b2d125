
-- Gamification main table
CREATE TABLE public.user_gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  points INTEGER NOT NULL DEFAULT 100,
  last_daily_login DATE,
  profile_completed_bonus BOOLEAN NOT NULL DEFAULT false,
  streak_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT points_range CHECK (points >= 0 AND points <= 1000)
);

ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gamification" ON public.user_gamification
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification" ON public.user_gamification
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification" ON public.user_gamification
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all gamification" ON public.user_gamification
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Action log for dedup
CREATE TABLE public.gamification_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_ref TEXT NOT NULL DEFAULT '',
  points_awarded INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_action UNIQUE (user_id, action_type, action_ref)
);

ALTER TABLE public.gamification_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own actions" ON public.gamification_actions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own actions" ON public.gamification_actions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all actions" ON public.gamification_actions
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_user_gamification_updated_at
  BEFORE UPDATE ON public.user_gamification
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
