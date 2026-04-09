
CREATE TABLE public.consent_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  terms_accepted boolean NOT NULL DEFAULT false,
  privacy_accepted boolean NOT NULL DEFAULT false,
  terms_version text NOT NULL DEFAULT 'v1.0',
  privacy_version text NOT NULL DEFAULT 'v1.0',
  accepted_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_consent_records_user_id ON public.consent_records (user_id);
CREATE INDEX idx_consent_records_accepted_at ON public.consent_records (accepted_at DESC);

CREATE POLICY "Users can insert own consent"
  ON public.consent_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own consent"
  ON public.consent_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all consent"
  ON public.consent_records FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));
