
-- CTA definitions table
CREATE TABLE public.cta_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cta_type TEXT NOT NULL DEFAULT 'link',
  target TEXT NOT NULL DEFAULT '',
  display_text TEXT NOT NULL DEFAULT 'Jetzt starten',
  display_description TEXT,
  icon TEXT DEFAULT 'arrow-right',
  priority INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cta_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage cta_definitions"
  ON public.cta_definitions FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can read active cta_definitions"
  ON public.cta_definitions FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE TRIGGER update_cta_definitions_updated_at
  BEFORE UPDATE ON public.cta_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CTA impressions tracking
CREATE TABLE public.cta_impressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cta_id UUID REFERENCES public.cta_definitions(id) ON DELETE CASCADE,
  cta_ref TEXT NOT NULL,
  context TEXT DEFAULT 'dashboard',
  clicked BOOLEAN NOT NULL DEFAULT false,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_cta_impressions_user ON public.cta_impressions(user_id);
CREATE INDEX idx_cta_impressions_cta_ref ON public.cta_impressions(cta_ref);

ALTER TABLE public.cta_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own impressions"
  ON public.cta_impressions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own impressions"
  ON public.cta_impressions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own impressions"
  ON public.cta_impressions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all impressions"
  ON public.cta_impressions FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));
