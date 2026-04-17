-- 1. Onboarding-Felder auf profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_current_step smallint NOT NULL DEFAULT 1;

-- 2. Optional: Manifest-Bestätigung tracken (falls noch nicht woanders gespeichert)
CREATE TABLE IF NOT EXISTS public.user_manifest_acceptance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_manifest_acceptance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own manifest acceptance"
  ON public.user_manifest_acceptance FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own manifest acceptance"
  ON public.user_manifest_acceptance FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own manifest acceptance"
  ON public.user_manifest_acceptance FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view manifest acceptance"
  ON public.user_manifest_acceptance FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- 3. Bestehende Nutzer, die bereits aktiv sind (haben meta_profile), als onboarded markieren,
--    damit sie nicht versehentlich aus der App rausfliegen
UPDATE public.profiles p
SET onboarding_completed = true,
    onboarding_completed_at = COALESCE(p.created_at, now()),
    onboarding_current_step = 6
WHERE EXISTS (SELECT 1 FROM public.meta_profiles m WHERE m.user_id = p.id);