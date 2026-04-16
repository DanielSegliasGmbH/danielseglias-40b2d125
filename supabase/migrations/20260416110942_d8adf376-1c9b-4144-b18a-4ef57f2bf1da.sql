
CREATE TABLE public.weekly_audio_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL,
  listened BOOLEAN NOT NULL DEFAULT false,
  listened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_key)
);

ALTER TABLE public.weekly_audio_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audio reflections"
ON public.weekly_audio_reflections FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audio reflections"
ON public.weekly_audio_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audio reflections"
ON public.weekly_audio_reflections FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS voice_brief_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS voice_weekly_enabled BOOLEAN NOT NULL DEFAULT true;
