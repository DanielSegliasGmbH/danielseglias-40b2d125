CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID NOT NULL,
  challenged_id UUID NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  winner_id UUID,
  challenger_start_score NUMERIC DEFAULT 0,
  challenged_start_score NUMERIC DEFAULT 0,
  challenger_end_score NUMERIC,
  challenged_end_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT challenges_no_self CHECK (challenger_id <> challenged_id)
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges"
ON public.challenges FOR SELECT
TO authenticated
USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Users can create challenges"
ON public.challenges FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Users can update own challenges"
ON public.challenges FOR UPDATE
TO authenticated
USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Admins can view all challenges"
ON public.challenges FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE TRIGGER update_challenges_updated_at
BEFORE UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();