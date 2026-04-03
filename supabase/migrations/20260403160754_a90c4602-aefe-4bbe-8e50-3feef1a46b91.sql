
-- Default portal settings (single-row config)
CREATE TABLE public.default_portal_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_tools boolean NOT NULL DEFAULT true,
  show_library boolean NOT NULL DEFAULT true,
  show_strategies boolean NOT NULL DEFAULT true,
  show_goals boolean NOT NULL DEFAULT true,
  show_tasks boolean NOT NULL DEFAULT true,
  show_insurances boolean NOT NULL DEFAULT false,
  show_courses boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.default_portal_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage default_portal_settings" ON public.default_portal_settings FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Clients can view default_portal_settings" ON public.default_portal_settings FOR SELECT TO authenticated USING (public.is_client(auth.uid()));

INSERT INTO public.default_portal_settings (show_tools, show_library, show_strategies, show_goals, show_tasks, show_insurances, show_courses)
VALUES (true, true, true, true, true, false, false);

-- Customer tool access
CREATE TABLE public.customer_tool_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(customer_id, tool_id)
);

ALTER TABLE public.customer_tool_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage customer_tool_access" ON public.customer_tool_access FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Clients can view own tool_access" ON public.customer_tool_access FOR SELECT TO authenticated USING (public.is_client(auth.uid()) AND customer_id = public.get_customer_id_for_user(auth.uid()));

-- Notification exclusions (create BEFORE notifications policy references it)
CREATE TABLE public.notification_exclusions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

ALTER TABLE public.notification_exclusions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage notification_exclusions" ON public.notification_exclusions FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  link_url text,
  link_label text,
  target_role text NOT NULL DEFAULT 'client',
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Clients can view published notifications" ON public.notifications FOR SELECT TO authenticated USING (
  public.is_client(auth.uid()) AND status = 'published' AND published_at IS NOT NULL AND published_at <= now()
  AND NOT EXISTS (
    SELECT 1 FROM public.notification_exclusions ne WHERE ne.notification_id = notifications.id AND ne.user_id = auth.uid()
  )
);

-- Now add FK to notification_exclusions
ALTER TABLE public.notification_exclusions ADD CONSTRAINT notification_exclusions_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE;

-- Notification reads
CREATE TABLE public.notification_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own reads" ON public.notification_reads FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own reads" ON public.notification_reads FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all reads" ON public.notification_reads FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- Triggers
CREATE TRIGGER update_default_portal_settings_updated_at BEFORE UPDATE ON public.default_portal_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
