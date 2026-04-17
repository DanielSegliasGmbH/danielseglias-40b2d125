CREATE TABLE public.gold_nut_collections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  nut_key text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, nut_key)
);

CREATE INDEX idx_gold_nut_collections_user ON public.gold_nut_collections(user_id);

ALTER TABLE public.gold_nut_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own gold nuts"
ON public.gold_nut_collections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own gold nuts"
ON public.gold_nut_collections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);