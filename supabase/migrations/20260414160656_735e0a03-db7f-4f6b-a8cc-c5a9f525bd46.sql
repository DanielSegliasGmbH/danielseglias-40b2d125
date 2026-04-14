
CREATE TABLE public.net_worth_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  last_updated_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.net_worth_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assets" ON public.net_worth_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assets" ON public.net_worth_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assets" ON public.net_worth_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assets" ON public.net_worth_assets FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all assets" ON public.net_worth_assets FOR SELECT USING (is_admin(auth.uid()));

CREATE INDEX idx_net_worth_assets_user ON public.net_worth_assets (user_id);

CREATE TRIGGER update_net_worth_assets_updated_at
  BEFORE UPDATE ON public.net_worth_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.net_worth_liabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.net_worth_liabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own liabilities" ON public.net_worth_liabilities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own liabilities" ON public.net_worth_liabilities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own liabilities" ON public.net_worth_liabilities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own liabilities" ON public.net_worth_liabilities FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all liabilities" ON public.net_worth_liabilities FOR SELECT USING (is_admin(auth.uid()));

CREATE INDEX idx_net_worth_liabilities_user ON public.net_worth_liabilities (user_id);

CREATE TRIGGER update_net_worth_liabilities_updated_at
  BEFORE UPDATE ON public.net_worth_liabilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
