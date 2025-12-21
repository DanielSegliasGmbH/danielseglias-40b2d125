-- ENUMS für Kundenstruktur

-- Customer Status
CREATE TYPE public.customer_status AS ENUM ('lead', 'active', 'passive', 'former');

-- Customer Priority
CREATE TYPE public.customer_priority AS ENUM ('A', 'B', 'C');

-- Care Level
CREATE TYPE public.care_level AS ENUM ('vip', 'standard', 'light');

-- Communication Preference
CREATE TYPE public.communication_preference AS ENUM ('whatsapp', 'email', 'phone');

-- Employment Type
CREATE TYPE public.employment_type AS ENUM ('employed', 'self_employed', 'entrepreneur', 'unemployed', 'retired');

-- Income Range
CREATE TYPE public.income_range AS ENUM ('under_50k', '50k_80k', '80k_120k', '120k_200k', '200k_plus');

-- Revenue Band
CREATE TYPE public.revenue_band AS ENUM ('low', 'medium', 'high', 'very_high');

-- Service Effort
CREATE TYPE public.service_effort AS ENUM ('low', 'medium', 'high');

-- Decision Style
CREATE TYPE public.decision_style AS ENUM ('fast', 'analytical', 'hesitant');

-- Financial Knowledge Level
CREATE TYPE public.financial_knowledge_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Upsell/Cross-sell Potential
CREATE TYPE public.potential_level AS ENUM ('none', 'low', 'medium', 'high');

-- Civil Status
CREATE TYPE public.civil_status AS ENUM ('single', 'married', 'divorced', 'widowed', 'partnership');

-- 1. CUSTOMERS (Core-Kunde - Identität)
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salutation TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  preferred_name TEXT,
  date_of_birth DATE,
  nationality TEXT,
  civil_status public.civil_status,
  partner_customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  number_of_children INTEGER DEFAULT 0,
  ahv_number TEXT, -- encrypted sensitive field
  customer_status public.customer_status NOT NULL DEFAULT 'lead',
  priority public.customer_priority DEFAULT 'C',
  care_level public.care_level DEFAULT 'standard',
  acquisition_source TEXT,
  referrer_customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  first_contact_date DATE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID
);

-- 2. CUSTOMER_PROFILES (Kontakt & Lebenssituation)
CREATE TABLE public.customer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL UNIQUE REFERENCES public.customers(id) ON DELETE CASCADE,
  phone TEXT,
  email TEXT,
  communication_preference public.communication_preference DEFAULT 'email',
  street TEXT,
  house_number TEXT,
  postal_code TEXT,
  city TEXT,
  canton TEXT,
  country TEXT DEFAULT 'Schweiz',
  language_preference TEXT DEFAULT 'de',
  wedding_date DATE,
  children_birth_years INTEGER[],
  gdpr_consent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. CUSTOMER_ECONOMICS (Beruf & Finanzen)
CREATE TABLE public.customer_economics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL UNIQUE REFERENCES public.customers(id) ON DELETE CASCADE,
  employment_type public.employment_type,
  employer TEXT,
  job_title TEXT,
  industry TEXT,
  workload_percentage INTEGER DEFAULT 100,
  income_range public.income_range,
  bonus_income BOOLEAN DEFAULT false,
  side_income BOOLEAN DEFAULT false,
  banks TEXT[],
  ibans TEXT[],
  owns_real_estate BOOLEAN DEFAULT false,
  has_liabilities BOOLEAN DEFAULT false,
  entrepreneurial_activity BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. CUSTOMER_CONTROL (Steuerung, Beziehung & KPIs)
CREATE TABLE public.customer_control (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL UNIQUE REFERENCES public.customers(id) ON DELETE CASCADE,
  customer_value_score INTEGER,
  estimated_revenue_band public.revenue_band,
  lifetime_value NUMERIC,
  service_effort public.service_effort DEFAULT 'medium',
  trust_level INTEGER CHECK (trust_level >= 1 AND trust_level <= 5),
  decision_style public.decision_style,
  implementation_strength INTEGER CHECK (implementation_strength >= 1 AND implementation_strength <= 5),
  financial_knowledge_level public.financial_knowledge_level,
  upsell_potential public.potential_level DEFAULT 'none',
  cross_sell_potential public.potential_level DEFAULT 'none',
  referral_score INTEGER CHECK (referral_score >= 1 AND referral_score <= 5),
  google_review_received BOOLEAN DEFAULT false,
  google_review_date DATE,
  moneytree_received BOOLEAN DEFAULT false,
  moneytree_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- INDEXES für Performance
CREATE INDEX idx_customers_status ON public.customers(customer_status);
CREATE INDEX idx_customers_priority ON public.customers(priority);
CREATE INDEX idx_customers_deleted_at ON public.customers(deleted_at);
CREATE INDEX idx_customer_profiles_customer_id ON public.customer_profiles(customer_id);
CREATE INDEX idx_customer_economics_customer_id ON public.customer_economics(customer_id);
CREATE INDEX idx_customer_control_customer_id ON public.customer_control(customer_id);

-- TRIGGERS für updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_economics_updated_at
  BEFORE UPDATE ON public.customer_economics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_control_updated_at
  BEFORE UPDATE ON public.customer_control
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ENABLE RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_economics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_control ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user has access to customer via assignment
CREATE OR REPLACE FUNCTION public.staff_has_customer_access(_user_id uuid, _customer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cases
    WHERE client_id = _customer_id
    AND assigned_to = _user_id
  );
$$;

-- Helper function: Get customer_id for client user
CREATE OR REPLACE FUNCTION public.get_customer_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id
  FROM public.client_users
  WHERE user_id = _user_id
  LIMIT 1;
$$;

-- RLS POLICIES FOR CUSTOMERS
CREATE POLICY "Admins can view all customers"
  ON public.customers FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Staff can view non-deleted assigned customers"
  ON public.customers FOR SELECT
  USING (is_staff_or_admin(auth.uid()) AND deleted_at IS NULL AND staff_has_customer_access(auth.uid(), id));

CREATE POLICY "Clients can view own customer record"
  ON public.customers FOR SELECT
  USING (is_client(auth.uid()) AND deleted_at IS NULL AND id = get_customer_id_for_user(auth.uid()));

CREATE POLICY "Staff can create customers"
  ON public.customers FOR INSERT
  WITH CHECK (is_staff_or_admin(auth.uid()));

CREATE POLICY "Admins can update customers"
  ON public.customers FOR UPDATE
  USING (is_admin(auth.uid()) OR staff_has_customer_access(auth.uid(), id));

CREATE POLICY "Admins can delete customers"
  ON public.customers FOR DELETE
  USING (is_admin(auth.uid()));

-- RLS POLICIES FOR CUSTOMER_PROFILES
CREATE POLICY "Admins can view all customer_profiles"
  ON public.customer_profiles FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Staff can view assigned customer_profiles"
  ON public.customer_profiles FOR SELECT
  USING (is_staff_or_admin(auth.uid()) AND staff_has_customer_access(auth.uid(), customer_id));

CREATE POLICY "Clients can view own profile"
  ON public.customer_profiles FOR SELECT
  USING (is_client(auth.uid()) AND customer_id = get_customer_id_for_user(auth.uid()));

CREATE POLICY "Staff can create customer_profiles"
  ON public.customer_profiles FOR INSERT
  WITH CHECK (is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can update customer_profiles"
  ON public.customer_profiles FOR UPDATE
  USING (is_admin(auth.uid()) OR staff_has_customer_access(auth.uid(), customer_id));

CREATE POLICY "Admins can delete customer_profiles"
  ON public.customer_profiles FOR DELETE
  USING (is_admin(auth.uid()));

-- RLS POLICIES FOR CUSTOMER_ECONOMICS
CREATE POLICY "Admins can view all customer_economics"
  ON public.customer_economics FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Staff can view assigned customer_economics"
  ON public.customer_economics FOR SELECT
  USING (is_staff_or_admin(auth.uid()) AND staff_has_customer_access(auth.uid(), customer_id));

CREATE POLICY "Staff can create customer_economics"
  ON public.customer_economics FOR INSERT
  WITH CHECK (is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can update customer_economics"
  ON public.customer_economics FOR UPDATE
  USING (is_admin(auth.uid()) OR staff_has_customer_access(auth.uid(), customer_id));

CREATE POLICY "Admins can delete customer_economics"
  ON public.customer_economics FOR DELETE
  USING (is_admin(auth.uid()));

-- RLS POLICIES FOR CUSTOMER_CONTROL (Admin/Staff only - no client access)
CREATE POLICY "Admins can view all customer_control"
  ON public.customer_control FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Staff can view assigned customer_control"
  ON public.customer_control FOR SELECT
  USING (is_staff_or_admin(auth.uid()) AND staff_has_customer_access(auth.uid(), customer_id));

CREATE POLICY "Staff can create customer_control"
  ON public.customer_control FOR INSERT
  WITH CHECK (is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can update customer_control"
  ON public.customer_control FOR UPDATE
  USING (is_admin(auth.uid()) OR staff_has_customer_access(auth.uid(), customer_id));

CREATE POLICY "Admins can delete customer_control"
  ON public.customer_control FOR DELETE
  USING (is_admin(auth.uid()));