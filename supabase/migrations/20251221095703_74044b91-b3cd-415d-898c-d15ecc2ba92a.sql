
-- 1) Helper function: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN _user_id IS NULL THEN FALSE
    ELSE public.has_role(_user_id, 'admin')
  END;
$$;

-- 2) Helper function: Check if user is staff (admin or staff role)
CREATE OR REPLACE FUNCTION public.is_staff_or_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN _user_id IS NULL THEN FALSE
    ELSE EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
      AND role IN ('admin', 'staff')
    )
  END;
$$;

-- 3) Helper function: Check if user is a client
CREATE OR REPLACE FUNCTION public.is_client(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN _user_id IS NULL THEN FALSE
    ELSE public.has_role(_user_id, 'client')
  END;
$$;

-- 4) Helper function: Get client_id for a client user (via email matching)
CREATE OR REPLACE FUNCTION public.get_client_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id
  FROM public.clients c
  JOIN auth.users u ON u.email = c.email
  WHERE u.id = _user_id
  LIMIT 1;
$$;

-- 5) Helper function: Check if staff user has access to a case
CREATE OR REPLACE FUNCTION public.staff_has_case_access(_user_id uuid, _case_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cases
    WHERE id = _case_id
    AND assigned_to = _user_id
  );
$$;

-- 6) Helper function: Check if staff user has access to a client (via assigned cases)
CREATE OR REPLACE FUNCTION public.staff_has_client_access(_user_id uuid, _client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cases
    WHERE client_id = _client_id
    AND assigned_to = _user_id
  );
$$;

-- ============================================
-- DROP ALL EXISTING POLICIES
-- ============================================

DROP POLICY IF EXISTS "Admins can delete cases" ON public.cases;
DROP POLICY IF EXISTS "Authenticated users can insert cases" ON public.cases;
DROP POLICY IF EXISTS "Authenticated users can update cases" ON public.cases;
DROP POLICY IF EXISTS "Authenticated users can view cases" ON public.cases;

DROP POLICY IF EXISTS "Admins can delete clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;

DROP POLICY IF EXISTS "Admins can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.tasks;

DROP POLICY IF EXISTS "Admins can delete meetings" ON public.meetings;
DROP POLICY IF EXISTS "Authenticated users can insert meetings" ON public.meetings;
DROP POLICY IF EXISTS "Authenticated users can update meetings" ON public.meetings;
DROP POLICY IF EXISTS "Authenticated users can view meetings" ON public.meetings;

DROP POLICY IF EXISTS "Admins can delete notes" ON public.notes;
DROP POLICY IF EXISTS "Authenticated users can insert notes" ON public.notes;
DROP POLICY IF EXISTS "Authenticated users can update notes" ON public.notes;
DROP POLICY IF EXISTS "Authenticated users can view notes" ON public.notes;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles" ON public.user_roles;

-- ============================================
-- PROFILES POLICIES
-- ============================================

CREATE POLICY "Staff can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- ============================================
-- USER_ROLES POLICIES
-- ============================================

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============================================
-- CLIENTS POLICIES
-- ============================================

CREATE POLICY "View clients based on role"
ON public.clients FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid()) 
  OR public.staff_has_client_access(auth.uid(), id)
  OR (public.is_client(auth.uid()) AND id = public.get_client_id_for_user(auth.uid()))
);

CREATE POLICY "Staff can create clients"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Update clients based on role"
ON public.clients FOR UPDATE
TO authenticated
USING (
  public.is_admin(auth.uid()) 
  OR public.staff_has_client_access(auth.uid(), id)
);

CREATE POLICY "Admins can delete clients"
ON public.clients FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============================================
-- CASES POLICIES
-- ============================================

CREATE POLICY "View cases based on role"
ON public.cases FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR assigned_to = auth.uid()
  OR (public.is_client(auth.uid()) AND client_id = public.get_client_id_for_user(auth.uid()))
);

CREATE POLICY "Create cases based on role"
ON public.cases FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
  OR (public.has_role(auth.uid(), 'staff') AND assigned_to = auth.uid())
);

CREATE POLICY "Update cases based on role"
ON public.cases FOR UPDATE
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR assigned_to = auth.uid()
);

CREATE POLICY "Admins can delete cases"
ON public.cases FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============================================
-- TASKS POLICIES
-- ============================================

CREATE POLICY "View tasks based on role"
ON public.tasks FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR public.staff_has_case_access(auth.uid(), case_id)
);

CREATE POLICY "Create tasks based on role"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
  OR public.staff_has_case_access(auth.uid(), case_id)
);

CREATE POLICY "Update tasks based on role"
ON public.tasks FOR UPDATE
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR public.staff_has_case_access(auth.uid(), case_id)
);

CREATE POLICY "Admins can delete tasks"
ON public.tasks FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============================================
-- MEETINGS POLICIES
-- ============================================

CREATE POLICY "View meetings based on role"
ON public.meetings FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR public.staff_has_case_access(auth.uid(), case_id)
);

CREATE POLICY "Create meetings based on role"
ON public.meetings FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
  OR public.staff_has_case_access(auth.uid(), case_id)
);

CREATE POLICY "Update meetings based on role"
ON public.meetings FOR UPDATE
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR public.staff_has_case_access(auth.uid(), case_id)
);

CREATE POLICY "Admins can delete meetings"
ON public.meetings FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============================================
-- NOTES POLICIES
-- ============================================

CREATE POLICY "View notes based on role"
ON public.notes FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR (case_id IS NOT NULL AND public.staff_has_case_access(auth.uid(), case_id))
  OR (meeting_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.meetings m
    WHERE m.id = notes.meeting_id
    AND public.staff_has_case_access(auth.uid(), m.case_id)
  ))
);

CREATE POLICY "Create notes based on role"
ON public.notes FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
  OR (case_id IS NOT NULL AND public.staff_has_case_access(auth.uid(), case_id))
  OR (meeting_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.meetings m
    WHERE m.id = meeting_id
    AND public.staff_has_case_access(auth.uid(), m.case_id)
  ))
);

CREATE POLICY "Update notes based on role"
ON public.notes FOR UPDATE
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR (case_id IS NOT NULL AND public.staff_has_case_access(auth.uid(), case_id))
  OR (meeting_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.meetings m
    WHERE m.id = notes.meeting_id
    AND public.staff_has_case_access(auth.uid(), m.case_id)
  ))
);

CREATE POLICY "Admins can delete notes"
ON public.notes FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));
