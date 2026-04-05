
CREATE TABLE public.memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tool_slug TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'calculation',
  title TEXT,
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_memories_user_id ON public.memories (user_id);
CREATE INDEX idx_memories_user_created ON public.memories (user_id, created_at DESC);
CREATE INDEX idx_memories_tool_slug ON public.memories (tool_slug);

ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memories"
ON public.memories FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories"
ON public.memories FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
ON public.memories FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all memories"
ON public.memories FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));
