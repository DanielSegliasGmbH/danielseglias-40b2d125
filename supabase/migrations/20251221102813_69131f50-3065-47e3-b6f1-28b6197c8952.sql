-- Create client_users table to link users to clients (replacing email-only matching)
CREATE TABLE public.client_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- Enable RLS
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;

-- Admins can view all client_users
CREATE POLICY "Admins can view all client_users"
ON public.client_users
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Admins can insert client_users
CREATE POLICY "Admins can insert client_users"
ON public.client_users
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- Admins can update client_users
CREATE POLICY "Admins can update client_users"
ON public.client_users
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Admins can delete client_users
CREATE POLICY "Admins can delete client_users"
ON public.client_users
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Users can view their own client_user record
CREATE POLICY "Users can view own client_user"
ON public.client_users
FOR SELECT
USING (user_id = auth.uid());

-- Update the get_client_id_for_user function to use client_users table instead of email matching
CREATE OR REPLACE FUNCTION public.get_client_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT client_id
  FROM public.client_users
  WHERE user_id = _user_id
  LIMIT 1;
$$;