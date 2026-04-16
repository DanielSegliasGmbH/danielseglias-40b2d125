
CREATE TABLE public.success_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  persona_name TEXT NOT NULL,
  persona_age INTEGER,
  persona_context TEXT,
  start_situation JSONB NOT NULL DEFAULT '{}',
  goals TEXT,
  actions_taken JSONB NOT NULL DEFAULT '[]',
  end_result JSONB NOT NULL DEFAULT '{}',
  quote TEXT,
  peakscore_journey JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  motivation_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view published stories"
  ON public.success_stories FOR SELECT TO authenticated
  USING (is_active = true AND published_at IS NOT NULL);

CREATE POLICY "Staff can manage stories"
  ON public.success_stories FOR ALL TO authenticated
  USING (public.is_staff_or_admin(auth.uid()));

CREATE TRIGGER update_success_stories_updated_at
  BEFORE UPDATE ON public.success_stories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
