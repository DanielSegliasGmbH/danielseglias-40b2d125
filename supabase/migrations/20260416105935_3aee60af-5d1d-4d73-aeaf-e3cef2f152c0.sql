
CREATE TABLE public.truth_moments_shown (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  moment_id TEXT NOT NULL,
  shown_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, moment_id)
);

ALTER TABLE public.truth_moments_shown ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own truth moments"
ON public.truth_moments_shown FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own truth moments"
ON public.truth_moments_shown FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add opt-out to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_truth_moments BOOLEAN NOT NULL DEFAULT true;
