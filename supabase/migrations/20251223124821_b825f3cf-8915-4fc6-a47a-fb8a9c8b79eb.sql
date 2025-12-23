-- Fix cleanup_deleted_items(): Add customers deletion
CREATE OR REPLACE FUNCTION public.cleanup_deleted_items()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- NEW: Delete customer related tables first (FK constraints)
  DELETE FROM public.customer_control
  WHERE customer_id IN (
    SELECT id FROM public.customers 
    WHERE deleted_at IS NOT NULL 
      AND deleted_at < now() - interval '30 days'
  );
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  DELETE FROM public.customer_economics
  WHERE customer_id IN (
    SELECT id FROM public.customers 
    WHERE deleted_at IS NOT NULL 
      AND deleted_at < now() - interval '30 days'
  );
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  DELETE FROM public.customer_profiles
  WHERE customer_id IN (
    SELECT id FROM public.customers 
    WHERE deleted_at IS NOT NULL 
      AND deleted_at < now() - interval '30 days'
  );
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Delete customers (after related tables)
  DELETE FROM public.customers
  WHERE deleted_at IS NOT NULL 
    AND deleted_at < now() - interval '30 days';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  RETURN deleted_count;
END;
$function$;