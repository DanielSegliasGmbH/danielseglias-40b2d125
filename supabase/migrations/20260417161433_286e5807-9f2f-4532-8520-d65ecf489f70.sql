CREATE TABLE public.hamster_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  skin text NOT NULL DEFAULT 'classic',
  hat text,
  item text,
  gold_nuts integer NOT NULL DEFAULT 0,
  coins integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hamster_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own hamster"
ON public.hamster_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_hamster_profiles_updated_at
BEFORE UPDATE ON public.hamster_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();