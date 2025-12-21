-- =============================================
-- DANIEL CLIENT OS - DATENMODELL
-- =============================================

-- 1. ENUMS
-- =============================================

-- Rollen-Enum
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- Kundenstatus
CREATE TYPE public.client_status AS ENUM ('aktiv', 'pausiert', 'archiviert');

-- Mandats-Status
CREATE TYPE public.case_status AS ENUM ('offen', 'in_bearbeitung', 'wartet_auf_kunde', 'abgeschlossen', 'pausiert');

-- Aufgaben-Priorität
CREATE TYPE public.task_priority AS ENUM ('niedrig', 'mittel', 'hoch', 'dringend');

-- Meeting-Typen
CREATE TYPE public.meeting_type AS ENUM ('erstberatung', 'folgeberatung', 'check_in', 'telefonat', 'video_call');

-- =============================================
-- 2. TABELLEN
-- =============================================

-- Benutzer-Profile (verknüpft mit auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rollen-Tabelle (SEPARAT von profiles - Sicherheitsanforderung!)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Kunden
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  status client_status NOT NULL DEFAULT 'aktiv',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mandate (Cases)
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status case_status NOT NULL DEFAULT 'offen',
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aufgaben (Tasks)
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority NOT NULL DEFAULT 'mittel',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Meetings
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  meeting_type meeting_type NOT NULL DEFAULT 'folgeberatung',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  summary TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notizen (an Meetings)
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 3. SECURITY DEFINER FUNCTION (Rollenprüfung)
-- =============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Hilfsfunktion: Hat Benutzer irgendeine Rolle?
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- =============================================
-- 4. TIMESTAMPS TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger für alle Tabellen
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 5. PROFILE AUTO-CREATION TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 6. ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- PROFILES Policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- USER_ROLES Policies (nur Admins können Rollen verwalten)
CREATE POLICY "Users can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- CLIENTS Policies
CREATE POLICY "Authenticated users can view clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "Authenticated users can insert clients"
  ON public.clients FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid()));

CREATE POLICY "Authenticated users can update clients"
  ON public.clients FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins can delete clients"
  ON public.clients FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- CASES Policies
CREATE POLICY "Authenticated users can view cases"
  ON public.cases FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "Authenticated users can insert cases"
  ON public.cases FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid()));

CREATE POLICY "Authenticated users can update cases"
  ON public.cases FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins can delete cases"
  ON public.cases FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- TASKS Policies
CREATE POLICY "Authenticated users can view tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "Authenticated users can insert tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid()));

CREATE POLICY "Authenticated users can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- MEETINGS Policies
CREATE POLICY "Authenticated users can view meetings"
  ON public.meetings FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "Authenticated users can insert meetings"
  ON public.meetings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid()));

CREATE POLICY "Authenticated users can update meetings"
  ON public.meetings FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins can delete meetings"
  ON public.meetings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- NOTES Policies
CREATE POLICY "Authenticated users can view notes"
  ON public.notes FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "Authenticated users can insert notes"
  ON public.notes FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid()));

CREATE POLICY "Authenticated users can update notes"
  ON public.notes FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins can delete notes"
  ON public.notes FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 7. INDEXES für Performance
-- =============================================

CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_cases_client_id ON public.cases(client_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_assigned_to ON public.cases(assigned_to);
CREATE INDEX idx_tasks_case_id ON public.tasks(case_id);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_meetings_case_id ON public.meetings(case_id);
CREATE INDEX idx_meetings_scheduled_at ON public.meetings(scheduled_at);
CREATE INDEX idx_notes_meeting_id ON public.notes(meeting_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);