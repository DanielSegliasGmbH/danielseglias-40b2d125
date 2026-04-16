
-- Monthly payday rituals
CREATE TABLE public.monthly_rituals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_key TEXT NOT NULL,
  income NUMERIC,
  expenses NUMERIC,
  savings NUMERIC,
  allocation_data JSONB DEFAULT '{}'::jsonb,
  monthly_intention TEXT,
  peak_score_change NUMERIC,
  streak_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, month_key)
);

ALTER TABLE public.monthly_rituals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own monthly rituals"
ON public.monthly_rituals FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly rituals"
ON public.monthly_rituals FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly rituals"
ON public.monthly_rituals FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_rituals_updated_at
BEFORE UPDATE ON public.monthly_rituals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Weekly reflections
CREATE TABLE public.weekly_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL,
  peak_score_change NUMERIC,
  tasks_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  focus_next_week TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_key)
);

ALTER TABLE public.weekly_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weekly reflections"
ON public.weekly_reflections FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly reflections"
ON public.weekly_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Streak rescues
CREATE TABLE public.streak_rescues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rescue_type TEXT NOT NULL DEFAULT 'self',
  rescued_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rescued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.streak_rescues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak rescues"
ON public.streak_rescues FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak rescues"
ON public.streak_rescues FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ritual settings on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payday_date INTEGER NOT NULL DEFAULT 25;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weekly_ritual_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_rescue_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS future_self_messages_enabled BOOLEAN NOT NULL DEFAULT true;
