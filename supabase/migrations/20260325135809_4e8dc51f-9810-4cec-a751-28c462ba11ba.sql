
-- 1. Feedback table for client portal
CREATE TABLE public.client_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text,
  user_name text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_feedback ENABLE ROW LEVEL SECURITY;

-- Clients can insert their own feedback
CREATE POLICY "Clients can insert own feedback"
  ON public.client_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
  ON public.client_feedback FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Staff can view all feedback
CREATE POLICY "Staff can view all feedback"
  ON public.client_feedback FOR SELECT
  TO authenticated
  USING (public.is_staff_or_admin(auth.uid()));

-- Admins can delete feedback
CREATE POLICY "Admins can delete feedback"
  ON public.client_feedback FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 2. Add strategy_access_password to customer_portal_settings
ALTER TABLE public.customer_portal_settings
  ADD COLUMN strategy_access_password text DEFAULT NULL;
