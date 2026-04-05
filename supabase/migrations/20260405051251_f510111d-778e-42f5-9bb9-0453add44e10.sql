-- Create customer_products table
CREATE TABLE public.customer_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'versicherung',
  provider TEXT,
  price NUMERIC,
  payment_interval TEXT NOT NULL DEFAULT 'monatlich',
  notes TEXT,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_products ENABLE ROW LEVEL SECURITY;

-- Clients can view own products
CREATE POLICY "Clients can view own products"
ON public.customer_products
FOR SELECT
TO authenticated
USING (
  is_client(auth.uid()) AND customer_id = get_customer_id_for_user(auth.uid())
);

-- Clients can insert own products
CREATE POLICY "Clients can insert own products"
ON public.customer_products
FOR INSERT
TO authenticated
WITH CHECK (
  is_client(auth.uid()) AND customer_id = get_customer_id_for_user(auth.uid()) AND user_id = auth.uid()
);

-- Clients can update own products
CREATE POLICY "Clients can update own products"
ON public.customer_products
FOR UPDATE
TO authenticated
USING (
  is_client(auth.uid()) AND customer_id = get_customer_id_for_user(auth.uid())
);

-- Clients can delete own products
CREATE POLICY "Clients can delete own products"
ON public.customer_products
FOR DELETE
TO authenticated
USING (
  is_client(auth.uid()) AND customer_id = get_customer_id_for_user(auth.uid())
);

-- Admins full access
CREATE POLICY "Admins can manage all products"
ON public.customer_products
FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_customer_products_updated_at
BEFORE UPDATE ON public.customer_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();