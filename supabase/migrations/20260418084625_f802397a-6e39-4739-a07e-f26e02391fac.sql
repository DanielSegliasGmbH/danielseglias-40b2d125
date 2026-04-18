-- Add advisor-created task support
ALTER TABLE public.client_tasks 
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal';

-- Allow staff/admin to create tasks for any client user
DROP POLICY IF EXISTS "Staff can insert tasks for clients" ON public.client_tasks;
CREATE POLICY "Staff can insert tasks for clients"
ON public.client_tasks
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_or_admin(auth.uid()));

-- Allow staff/admin to view all client tasks (for admin panel)
DROP POLICY IF EXISTS "Staff can view all client tasks" ON public.client_tasks;
CREATE POLICY "Staff can view all client tasks"
ON public.client_tasks
FOR SELECT
TO authenticated
USING (public.is_staff_or_admin(auth.uid()) OR auth.uid() = user_id);

-- Allow staff/admin to update / delete client tasks they created (or any, for admins)
DROP POLICY IF EXISTS "Staff can update client tasks" ON public.client_tasks;
CREATE POLICY "Staff can update client tasks"
ON public.client_tasks
FOR UPDATE
TO authenticated
USING (public.is_staff_or_admin(auth.uid()) OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can delete client tasks" ON public.client_tasks;
CREATE POLICY "Staff can delete client tasks"
ON public.client_tasks
FOR DELETE
TO authenticated
USING (public.is_staff_or_admin(auth.uid()) OR auth.uid() = user_id);