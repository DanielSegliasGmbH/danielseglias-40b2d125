
CREATE TABLE public.tool_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tool_slug TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  snapshot_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  peak_score_effect NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_tool_snapshots_user_id ON public.tool_snapshots (user_id);
CREATE INDEX idx_tool_snapshots_tool_slug ON public.tool_snapshots (tool_slug);
CREATE INDEX idx_tool_snapshots_created_at ON public.tool_snapshots (created_at DESC);

ALTER TABLE public.tool_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own snapshots"
ON public.tool_snapshots FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own snapshots"
ON public.tool_snapshots FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own snapshots"
ON public.tool_snapshots FOR DELETE
USING (auth.uid() = user_id);
