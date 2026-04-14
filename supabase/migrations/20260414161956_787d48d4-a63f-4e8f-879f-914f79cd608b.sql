
-- Per-user smart notifications table
CREATE TABLE public.smart_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link_url TEXT,
  link_label TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  ref_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint to prevent duplicate notifications
CREATE UNIQUE INDEX smart_notifications_user_ref ON public.smart_notifications (user_id, ref_key);

ALTER TABLE public.smart_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own smart notifications
CREATE POLICY "Users can view own smart_notifications"
  ON public.smart_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own smart notifications
CREATE POLICY "Users can insert own smart_notifications"
  ON public.smart_notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update (mark read) their own smart notifications
CREATE POLICY "Users can update own smart_notifications"
  ON public.smart_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own smart notifications
CREATE POLICY "Users can delete own smart_notifications"
  ON public.smart_notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all smart_notifications"
  ON public.smart_notifications FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));
