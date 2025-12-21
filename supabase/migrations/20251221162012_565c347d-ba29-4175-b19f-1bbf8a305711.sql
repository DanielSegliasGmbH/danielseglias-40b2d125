-- Add soft delete columns to clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID NULL;

-- Add soft delete columns to cases
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID NULL;

-- Add soft delete columns to tasks
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID NULL;

-- Create indexes for efficient trash queries
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON public.clients(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cases_deleted_at ON public.cases(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON public.tasks(deleted_at) WHERE deleted_at IS NOT NULL;

-- Update RLS policies for clients
DROP POLICY IF EXISTS "View clients based on role" ON public.clients;
CREATE POLICY "Admins can view all clients" 
ON public.clients 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Staff can view non-deleted clients" 
ON public.clients 
FOR SELECT 
USING (is_staff_or_admin(auth.uid()) AND deleted_at IS NULL AND staff_has_client_access(auth.uid(), id));

CREATE POLICY "Clients can view own non-deleted client" 
ON public.clients 
FOR SELECT 
USING (is_client(auth.uid()) AND deleted_at IS NULL AND id = get_client_id_for_user(auth.uid()));

-- Update RLS policies for cases
DROP POLICY IF EXISTS "View cases based on role" ON public.cases;
CREATE POLICY "Admins can view all cases" 
ON public.cases 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Staff can view non-deleted assigned cases" 
ON public.cases 
FOR SELECT 
USING (deleted_at IS NULL AND assigned_to = auth.uid());

CREATE POLICY "Clients can view own non-deleted cases" 
ON public.cases 
FOR SELECT 
USING (is_client(auth.uid()) AND deleted_at IS NULL AND client_id = get_client_id_for_user(auth.uid()));

-- Update RLS policies for tasks
DROP POLICY IF EXISTS "View tasks based on role" ON public.tasks;
CREATE POLICY "Admins can view all tasks" 
ON public.tasks 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Staff can view non-deleted tasks" 
ON public.tasks 
FOR SELECT 
USING (deleted_at IS NULL AND staff_has_case_access(auth.uid(), case_id));

-- Update cleanup function to include clients, cases, tasks
CREATE OR REPLACE FUNCTION public.cleanup_deleted_items()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Delete tasks first (deepest level)
  DELETE FROM public.tasks
  WHERE deleted_at IS NOT NULL 
    AND deleted_at < now() - interval '30 days';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Delete edges
  DELETE FROM public.system_map_edges
  WHERE deleted_at IS NOT NULL 
    AND deleted_at < now() - interval '30 days';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  -- Delete nodes
  DELETE FROM public.system_map_nodes
  WHERE deleted_at IS NOT NULL 
    AND deleted_at < now() - interval '30 days';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Delete cases (after tasks)
  DELETE FROM public.cases
  WHERE deleted_at IS NOT NULL 
    AND deleted_at < now() - interval '30 days';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Delete clients last (after cases)
  DELETE FROM public.clients
  WHERE deleted_at IS NOT NULL 
    AND deleted_at < now() - interval '30 days';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  RETURN deleted_count;
END;
$$;