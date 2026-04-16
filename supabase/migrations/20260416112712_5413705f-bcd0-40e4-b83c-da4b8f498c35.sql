
-- Partnerships table
CREATE TABLE public.partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id_1 UUID NOT NULL,
  user_id_2 UUID,
  invite_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'dissolved')),
  sharing_settings JSONB NOT NULL DEFAULT '{"tasks": true, "peakscore": true, "goals": true, "reports": true}',
  started_at TIMESTAMP WITH TIME ZONE,
  dissolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own partnerships"
  ON public.partnerships FOR SELECT TO authenticated
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can create partnerships"
  ON public.partnerships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id_1);

CREATE POLICY "Users can update own partnerships"
  ON public.partnerships FOR UPDATE TO authenticated
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE TRIGGER update_partnerships_updated_at
  BEFORE UPDATE ON public.partnerships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Joint Goals
CREATE TABLE public.partner_joint_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount NUMERIC,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  target_date DATE,
  category TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_joint_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view joint goals"
  ON public.partner_joint_goals FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.partnerships p
    WHERE p.id = partnership_id AND (p.user_id_1 = auth.uid() OR p.user_id_2 = auth.uid())
  ));

CREATE POLICY "Partners can insert joint goals"
  ON public.partner_joint_goals FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.partnerships p
    WHERE p.id = partnership_id AND p.status = 'active' AND (p.user_id_1 = auth.uid() OR p.user_id_2 = auth.uid())
  ));

CREATE POLICY "Partners can update joint goals"
  ON public.partner_joint_goals FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.partnerships p
    WHERE p.id = partnership_id AND p.status = 'active' AND (p.user_id_1 = auth.uid() OR p.user_id_2 = auth.uid())
  ));

CREATE POLICY "Partners can delete joint goals"
  ON public.partner_joint_goals FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.partnerships p
    WHERE p.id = partnership_id AND (p.user_id_1 = auth.uid() OR p.user_id_2 = auth.uid())
  ));

CREATE TRIGGER update_partner_joint_goals_updated_at
  BEFORE UPDATE ON public.partner_joint_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Conflict Resolution (Streit-Modus)
CREATE TABLE public.partner_conflict_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  round INTEGER NOT NULL DEFAULT 1,
  what_happened TEXT,
  how_i_feel TEXT,
  what_i_wish TEXT,
  revealed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_conflict_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own conflict entries"
  ON public.partner_conflict_entries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.partnerships p
    WHERE p.id = partnership_id AND p.status = 'active' AND (p.user_id_1 = auth.uid() OR p.user_id_2 = auth.uid())
  ));

CREATE POLICY "Partners can view conflict entries after reveal"
  ON public.partner_conflict_entries FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.partnerships p
    WHERE p.id = partnership_id AND (p.user_id_1 = auth.uid() OR p.user_id_2 = auth.uid())
  ));

-- Ownership tags on financial entries
ALTER TABLE public.net_worth_assets ADD COLUMN IF NOT EXISTS ownership_tag TEXT NOT NULL DEFAULT 'mine' CHECK (ownership_tag IN ('mine', 'partner', 'shared'));
ALTER TABLE public.net_worth_liabilities ADD COLUMN IF NOT EXISTS ownership_tag TEXT NOT NULL DEFAULT 'mine' CHECK (ownership_tag IN ('mine', 'partner', 'shared'));
