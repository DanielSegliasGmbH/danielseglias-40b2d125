
-- Add show_courses to customer_portal_settings
ALTER TABLE public.customer_portal_settings ADD COLUMN show_courses boolean NOT NULL DEFAULT true;

-- course_modules
CREATE TABLE public.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon_emoji text DEFAULT '📚',
  color text DEFAULT '#7A7A67',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can select course_modules" ON public.course_modules FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert course_modules" ON public.course_modules FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update course_modules" ON public.course_modules FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete course_modules" ON public.course_modules FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Clients can view active modules" ON public.course_modules FOR SELECT TO authenticated USING (is_active = true AND is_client(auth.uid()));

-- course_lessons
CREATE TABLE public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  video_url text,
  thumbnail_url text,
  duration_text text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can select course_lessons" ON public.course_lessons FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert course_lessons" ON public.course_lessons FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update course_lessons" ON public.course_lessons FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete course_lessons" ON public.course_lessons FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Clients can view active lessons" ON public.course_lessons FOR SELECT TO authenticated USING (is_active = true AND is_client(auth.uid()));

-- customer_module_access
CREATE TABLE public.customer_module_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  is_unlocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(customer_id, module_id)
);

ALTER TABLE public.customer_module_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can select module_access" ON public.customer_module_access FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert module_access" ON public.customer_module_access FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update module_access" ON public.customer_module_access FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete module_access" ON public.customer_module_access FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Clients can view own module_access" ON public.customer_module_access FOR SELECT TO authenticated USING (is_client(auth.uid()) AND customer_id = get_customer_id_for_user(auth.uid()));

-- customer_lesson_access
CREATE TABLE public.customer_lesson_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  is_unlocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(customer_id, lesson_id)
);

ALTER TABLE public.customer_lesson_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can select lesson_access" ON public.customer_lesson_access FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert lesson_access" ON public.customer_lesson_access FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update lesson_access" ON public.customer_lesson_access FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete lesson_access" ON public.customer_lesson_access FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Clients can view own lesson_access" ON public.customer_lesson_access FOR SELECT TO authenticated USING (is_client(auth.uid()) AND customer_id = get_customer_id_for_user(auth.uid()));

-- course_feedback
CREATE TABLE public.course_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL,
  user_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.course_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all course_feedback" ON public.course_feedback FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete course_feedback" ON public.course_feedback FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Clients can insert own course_feedback" ON public.course_feedback FOR INSERT TO authenticated WITH CHECK (is_client(auth.uid()) AND customer_id = get_customer_id_for_user(auth.uid()) AND user_id = auth.uid());
CREATE POLICY "Clients can view own course_feedback" ON public.course_feedback FOR SELECT TO authenticated USING (is_client(auth.uid()) AND customer_id = get_customer_id_for_user(auth.uid()));

-- Seed the 5 modules
INSERT INTO public.course_modules (title, description, icon_emoji, color, sort_order) VALUES
('Grundlagen & Mindset', 'Verstehe die wichtigsten Grundlagen und entwickle das richtige Mindset für deine finanzielle Zukunft.', '🟢', '#22c55e', 1),
('Verständnis (Finanzen & 3a)', 'Lerne die Zusammenhänge im Schweizer Finanzsystem und der Säule 3a kennen.', '🟡', '#eab308', 2),
('Deine Situation analysieren', 'Analysiere deine aktuelle finanzielle Situation und erkenne Optimierungspotenzial.', '🔵', '#3b82f6', 3),
('Umsetzung & Strategie', 'Setze deine Erkenntnisse in eine konkrete Strategie um.', '🔴', '#ef4444', 4),
('Nächste Schritte', 'Plane deine nächsten konkreten Schritte für eine bessere finanzielle Zukunft.', '🟣', '#a855f7', 5);
