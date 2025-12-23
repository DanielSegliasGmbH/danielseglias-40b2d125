-- ============================================================================
-- PHASE 1: CUSTOMERS CONSOLIDATION MIGRATION (v2 - Improved)
-- ============================================================================
-- WICHTIG: Diese Migration merged KEINE Daten automatisch.
-- Jeder Client wird als neuer Customer erstellt und explizit gemapped.
-- Deterministisches Mapping via CTE (keine fragilen Joins).
-- ============================================================================

-- ============================================================================
-- A) SCHEMA / TABELLEN
-- ============================================================================

-- A1) Mapping-Tabelle für explizites Client->Customer Mapping
CREATE TABLE IF NOT EXISTS public.client_to_customer_map (
  client_id UUID PRIMARY KEY REFERENCES public.clients(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_client_to_customer_map_customer 
  ON public.client_to_customer_map(customer_id);

-- A2) cases: Neue Spalte customer_id (nur wenn nicht existiert)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'cases' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE public.cases ADD COLUMN customer_id UUID REFERENCES public.customers(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cases_customer_id ON public.cases(customer_id);

-- A3) customer_users Tabelle (neu, analog zu client_users)
CREATE TABLE IF NOT EXISTS public.customer_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_users_customer ON public.customer_users(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_users_user ON public.customer_users(user_id);

-- A4) customer_portal_settings Tabelle (neu)
CREATE TABLE IF NOT EXISTS public.customer_portal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE REFERENCES public.customers(id) ON DELETE CASCADE,
  show_insurances BOOLEAN NOT NULL DEFAULT true,
  show_goals BOOLEAN NOT NULL DEFAULT true,
  show_tasks BOOLEAN NOT NULL DEFAULT true,
  show_strategies BOOLEAN NOT NULL DEFAULT true,
  show_library BOOLEAN NOT NULL DEFAULT true,
  show_tools BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- B) DATENMIGRATION (deterministisch, ohne fragile Joins)
-- ============================================================================

-- B1+B2) Customers erstellen UND Mapping in einem Schritt (deterministisch)
WITH clients_to_migrate AS (
  SELECT 
    c.id AS client_id,
    gen_random_uuid() AS new_customer_id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    c.address,
    c.notes,
    c.created_at,
    c.updated_at,
    c.created_by
  FROM public.clients c
  WHERE NOT EXISTS (
    SELECT 1 FROM public.client_to_customer_map m WHERE m.client_id = c.id
  )
),
inserted_customers AS (
  INSERT INTO public.customers (
    id,
    first_name,
    last_name,
    customer_status,
    priority,
    care_level,
    created_at,
    updated_at,
    created_by
  )
  SELECT 
    new_customer_id,
    first_name,
    last_name,
    'active'::customer_status,
    'B'::customer_priority,
    'standard'::care_level,
    created_at,
    updated_at,
    created_by
  FROM clients_to_migrate
  RETURNING id
)
INSERT INTO public.client_to_customer_map (client_id, customer_id, notes)
SELECT 
  client_id,
  new_customer_id,
  'Auto-migrated from client. Original email: ' || COALESCE(email, 'n/a') || ', phone: ' || COALESCE(phone, 'n/a')
FROM clients_to_migrate;

-- B3) cases.customer_id setzen via Mapping
UPDATE public.cases cas
SET customer_id = m.customer_id
FROM public.client_to_customer_map m
WHERE cas.client_id = m.client_id
  AND cas.customer_id IS NULL;

-- B4) customer_users migrieren aus client_users
INSERT INTO public.customer_users (customer_id, user_id, created_by, created_at)
SELECT 
  m.customer_id,
  cu.user_id,
  cu.created_by,
  cu.created_at
FROM public.client_users cu
JOIN public.client_to_customer_map m ON m.client_id = cu.client_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.customer_users cuu WHERE cuu.user_id = cu.user_id
);

-- B5) customer_portal_settings migrieren
INSERT INTO public.customer_portal_settings (
  customer_id, show_insurances, show_goals, show_tasks, 
  show_strategies, show_library, show_tools, created_at, updated_at
)
SELECT 
  m.customer_id,
  cps.show_insurances,
  cps.show_goals,
  cps.show_tasks,
  cps.show_strategies,
  cps.show_library,
  cps.show_tools,
  cps.created_at,
  cps.updated_at
FROM public.client_portal_settings cps
JOIN public.client_to_customer_map m ON m.client_id = cps.client_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.customer_portal_settings cups WHERE cups.customer_id = m.customer_id
);

-- ============================================================================
-- C) FUNKTIONEN / RLS
-- ============================================================================

-- C1) get_customer_id_for_user aktualisieren für customer_users
CREATE OR REPLACE FUNCTION public.get_customer_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT customer_id
  FROM public.customer_users
  WHERE user_id = _user_id
  LIMIT 1;
$$;

-- C2) RLS für customer_users
ALTER TABLE public.customer_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all customer_users" ON public.customer_users;
DROP POLICY IF EXISTS "Admins can insert customer_users" ON public.customer_users;
DROP POLICY IF EXISTS "Admins can update customer_users" ON public.customer_users;
DROP POLICY IF EXISTS "Admins can delete customer_users" ON public.customer_users;
DROP POLICY IF EXISTS "Users can view own customer_user" ON public.customer_users;

CREATE POLICY "Admins can view all customer_users"
  ON public.customer_users FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert customer_users"
  ON public.customer_users FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update customer_users"
  ON public.customer_users FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete customer_users"
  ON public.customer_users FOR DELETE
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own customer_user"
  ON public.customer_users FOR SELECT
  USING (user_id = auth.uid());

-- C3) RLS für customer_portal_settings
ALTER TABLE public.customer_portal_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all customer_portal_settings" ON public.customer_portal_settings;
DROP POLICY IF EXISTS "Admins can insert customer_portal_settings" ON public.customer_portal_settings;
DROP POLICY IF EXISTS "Admins can update customer_portal_settings" ON public.customer_portal_settings;
DROP POLICY IF EXISTS "Admins can delete customer_portal_settings" ON public.customer_portal_settings;
DROP POLICY IF EXISTS "Clients can view own customer_portal_settings" ON public.customer_portal_settings;

CREATE POLICY "Admins can view all customer_portal_settings"
  ON public.customer_portal_settings FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert customer_portal_settings"
  ON public.customer_portal_settings FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update customer_portal_settings"
  ON public.customer_portal_settings FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete customer_portal_settings"
  ON public.customer_portal_settings FOR DELETE
  USING (is_admin(auth.uid()));

CREATE POLICY "Clients can view own customer_portal_settings"
  ON public.customer_portal_settings FOR SELECT
  USING (is_client(auth.uid()) AND customer_id = get_customer_id_for_user(auth.uid()));

-- C4) RLS für client_to_customer_map (nur Admin, mit USING + WITH CHECK)
ALTER TABLE public.client_to_customer_map ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can select client_to_customer_map" ON public.client_to_customer_map;
DROP POLICY IF EXISTS "Admins can insert client_to_customer_map" ON public.client_to_customer_map;
DROP POLICY IF EXISTS "Admins can update client_to_customer_map" ON public.client_to_customer_map;
DROP POLICY IF EXISTS "Admins can delete client_to_customer_map" ON public.client_to_customer_map;

CREATE POLICY "Admins can select client_to_customer_map"
  ON public.client_to_customer_map FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert client_to_customer_map"
  ON public.client_to_customer_map FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update client_to_customer_map"
  ON public.client_to_customer_map FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete client_to_customer_map"
  ON public.client_to_customer_map FOR DELETE
  USING (is_admin(auth.uid()));

-- C5) Cases RLS - Neue Policy für customer_id (zusätzlich zur alten client_id Policy)
DROP POLICY IF EXISTS "Clients can view own non-deleted customer cases" ON public.cases;

CREATE POLICY "Clients can view own non-deleted customer cases"
  ON public.cases FOR SELECT
  USING (
    is_client(auth.uid()) 
    AND deleted_at IS NULL 
    AND customer_id IS NOT NULL
    AND customer_id = get_customer_id_for_user(auth.uid())
  );

-- C6) Trigger für customer_portal_settings (idempotent)
DROP TRIGGER IF EXISTS update_customer_portal_settings_updated_at ON public.customer_portal_settings;

CREATE TRIGGER update_customer_portal_settings_updated_at
  BEFORE UPDATE ON public.customer_portal_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();