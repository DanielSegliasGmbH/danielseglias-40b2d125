
CREATE TABLE public.mood_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  note TEXT,
  week_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_key)
);

ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mood checkins"
ON public.mood_checkins FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood checkins"
ON public.mood_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood checkins"
ON public.mood_checkins FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mood_checkin_enabled BOOLEAN NOT NULL DEFAULT true;
