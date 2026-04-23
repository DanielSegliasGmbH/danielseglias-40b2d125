ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password_change_required boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.password_change_required IS
  'True if the user must set a new password on next login (admin-created accounts).';