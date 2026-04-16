
CREATE TABLE public.shadow_twin_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_key DATE NOT NULL,
  demographic_key TEXT NOT NULL,
  aggregated_data JSONB NOT NULL DEFAULT '{}',
  twin_actions JSONB NOT NULL DEFAULT '[]',
  sample_size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (week_key, demographic_key)
);

ALTER TABLE public.shadow_twin_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read twin snapshots"
  ON public.shadow_twin_snapshots FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Staff can manage twin snapshots"
  ON public.shadow_twin_snapshots FOR ALL TO authenticated
  USING (public.is_staff_or_admin(auth.uid()));

CREATE TRIGGER update_shadow_twin_snapshots_updated_at
  BEFORE UPDATE ON public.shadow_twin_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
