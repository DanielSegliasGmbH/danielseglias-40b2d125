CREATE TABLE public.article_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id TEXT NOT NULL,
  first_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, article_id)
);

ALTER TABLE public.article_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own article_reads"
ON public.article_reads FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own article_reads"
ON public.article_reads FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own article_reads"
ON public.article_reads FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all article_reads"
ON public.article_reads FOR SELECT
USING (is_admin(auth.uid()));