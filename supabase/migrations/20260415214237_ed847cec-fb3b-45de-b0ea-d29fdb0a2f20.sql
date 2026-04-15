-- Add platform_url to net_worth_assets
ALTER TABLE public.net_worth_assets
ADD COLUMN platform_url TEXT DEFAULT NULL;

-- Add platform_url to net_worth_liabilities
ALTER TABLE public.net_worth_liabilities
ADD COLUMN platform_url TEXT DEFAULT NULL;

-- Add portal_url to customer_products
ALTER TABLE public.customer_products
ADD COLUMN portal_url TEXT DEFAULT NULL;