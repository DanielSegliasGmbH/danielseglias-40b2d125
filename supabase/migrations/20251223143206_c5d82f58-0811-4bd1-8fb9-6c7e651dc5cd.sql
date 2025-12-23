
-- Phase 3: Remove legacy client tables and columns (fixed order)
-- Must drop RLS policies first that depend on client_id

-- 1. Drop RLS policies on cases that reference client_id
DROP POLICY IF EXISTS "Clients can view own non-deleted cases" ON public.cases;

-- 2. Drop FK constraint on cases.client_id if exists
ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS fk_cases_client_id;

-- 3. Drop client_id column from cases
ALTER TABLE public.cases DROP COLUMN IF EXISTS client_id;

-- 4. Drop RLS policies on client-related tables before dropping tables
DROP POLICY IF EXISTS "Admins can delete client_portal_settings" ON public.client_portal_settings;
DROP POLICY IF EXISTS "Admins can insert client_portal_settings" ON public.client_portal_settings;
DROP POLICY IF EXISTS "Admins can update client_portal_settings" ON public.client_portal_settings;
DROP POLICY IF EXISTS "Admins can view all client_portal_settings" ON public.client_portal_settings;
DROP POLICY IF EXISTS "Clients can view own client_portal_settings" ON public.client_portal_settings;

DROP POLICY IF EXISTS "Admins can delete client_users" ON public.client_users;
DROP POLICY IF EXISTS "Admins can insert client_users" ON public.client_users;
DROP POLICY IF EXISTS "Admins can update client_users" ON public.client_users;
DROP POLICY IF EXISTS "Admins can view all client_users" ON public.client_users;
DROP POLICY IF EXISTS "Users can view own client_user" ON public.client_users;

DROP POLICY IF EXISTS "Admins can delete client_to_customer_map" ON public.client_to_customer_map;
DROP POLICY IF EXISTS "Admins can insert client_to_customer_map" ON public.client_to_customer_map;
DROP POLICY IF EXISTS "Admins can select client_to_customer_map" ON public.client_to_customer_map;
DROP POLICY IF EXISTS "Admins can update client_to_customer_map" ON public.client_to_customer_map;

DROP POLICY IF EXISTS "Admins can delete clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Clients can view own non-deleted client" ON public.clients;
DROP POLICY IF EXISTS "Staff can create clients" ON public.clients;
DROP POLICY IF EXISTS "Staff can view non-deleted clients" ON public.clients;
DROP POLICY IF EXISTS "Update clients based on role" ON public.clients;

-- 5. Drop client-related tables
DROP TABLE IF EXISTS public.client_portal_settings CASCADE;
DROP TABLE IF EXISTS public.client_users CASCADE;
DROP TABLE IF EXISTS public.client_to_customer_map CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

-- 6. Drop legacy helper functions that reference clients
DROP FUNCTION IF EXISTS public.get_client_id_for_user(uuid);
DROP FUNCTION IF EXISTS public.staff_has_client_access(uuid, uuid);

-- 7. Drop client_status enum
DROP TYPE IF EXISTS public.client_status;
