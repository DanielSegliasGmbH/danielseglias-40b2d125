-- Add soft delete columns to system_map_nodes
ALTER TABLE public.system_map_nodes 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID NULL;

-- Add soft delete columns to system_map_edges
ALTER TABLE public.system_map_edges 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID NULL;

-- Create index for efficient trash queries
CREATE INDEX IF NOT EXISTS idx_system_map_nodes_deleted_at ON public.system_map_nodes(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_system_map_edges_deleted_at ON public.system_map_edges(deleted_at) WHERE deleted_at IS NOT NULL;

-- Update RLS policies for system_map_nodes to filter deleted items for non-admins
DROP POLICY IF EXISTS "Admins can view system_map_nodes" ON public.system_map_nodes;
CREATE POLICY "Admins can view all system_map_nodes" 
ON public.system_map_nodes 
FOR SELECT 
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff can view active system_map_nodes" ON public.system_map_nodes;
CREATE POLICY "Staff can view active system_map_nodes" 
ON public.system_map_nodes 
FOR SELECT 
USING (is_staff_or_admin(auth.uid()) AND deleted_at IS NULL);

-- Update RLS policies for system_map_edges to filter deleted items for non-admins
DROP POLICY IF EXISTS "Admins can view system_map_edges" ON public.system_map_edges;
CREATE POLICY "Admins can view all system_map_edges" 
ON public.system_map_edges 
FOR SELECT 
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff can view active system_map_edges" ON public.system_map_edges;
CREATE POLICY "Staff can view active system_map_edges" 
ON public.system_map_edges 
FOR SELECT 
USING (is_staff_or_admin(auth.uid()) AND deleted_at IS NULL);

-- Create function for automatic cleanup of items deleted more than 30 days ago
CREATE OR REPLACE FUNCTION public.cleanup_deleted_items()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER := 0;
  nodes_deleted INTEGER;
  edges_deleted INTEGER;
BEGIN
  -- Delete edges first (to avoid FK issues)
  DELETE FROM public.system_map_edges
  WHERE deleted_at IS NOT NULL 
    AND deleted_at < now() - interval '30 days';
  GET DIAGNOSTICS edges_deleted = ROW_COUNT;
  
  -- Delete nodes
  DELETE FROM public.system_map_nodes
  WHERE deleted_at IS NOT NULL 
    AND deleted_at < now() - interval '30 days';
  GET DIAGNOSTICS nodes_deleted = ROW_COUNT;
  
  deleted_count := nodes_deleted + edges_deleted;
  RETURN deleted_count;
END;
$$;