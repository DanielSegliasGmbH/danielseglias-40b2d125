
ALTER TABLE public.consent_records
  ADD COLUMN IF NOT EXISTS disclaimer_accepted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS disclaimer_version text NOT NULL DEFAULT 'v1.0';
