ALTER TABLE public.tools
ADD COLUMN IF NOT EXISTS public_password text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS public_password_hint text DEFAULT NULL;

ALTER TABLE public.public_pages
ADD COLUMN IF NOT EXISTS requires_password boolean DEFAULT false;