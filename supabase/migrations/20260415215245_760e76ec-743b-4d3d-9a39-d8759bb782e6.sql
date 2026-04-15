
CREATE TABLE public.life_film_archives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  film_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.life_film_archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own film archives"
ON public.life_film_archives FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own film archives"
ON public.life_film_archives FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own film archives"
ON public.life_film_archives FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_life_film_archives_user_id ON public.life_film_archives (user_id, saved_at DESC);
