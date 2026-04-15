
CREATE TABLE public.snapshot_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  draft_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_step INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.snapshot_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own drafts"
  ON public.snapshot_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drafts"
  ON public.snapshot_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drafts"
  ON public.snapshot_drafts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drafts"
  ON public.snapshot_drafts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all drafts"
  ON public.snapshot_drafts FOR SELECT
  USING (is_admin(auth.uid()));

CREATE UNIQUE INDEX idx_snapshot_drafts_user ON public.snapshot_drafts(user_id);

CREATE TRIGGER update_snapshot_drafts_updated_at
  BEFORE UPDATE ON public.snapshot_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
