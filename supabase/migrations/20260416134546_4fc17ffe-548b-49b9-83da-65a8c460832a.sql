
-- Admin nudge overrides (editable nudge schedule)
CREATE TABLE public.admin_nudge_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number INTEGER NOT NULL,
  nudge_key TEXT NOT NULL UNIQUE,
  nudge_type TEXT NOT NULL DEFAULT 'micro',
  emoji TEXT NOT NULL DEFAULT '📌',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cta_path TEXT NOT NULL DEFAULT '/app/client-portal',
  cta_label TEXT NOT NULL DEFAULT 'Ansehen',
  if_finanz_typ TEXT,
  skip_if TEXT,
  xp_reward INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_nudge_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage nudge overrides"
  ON public.admin_nudge_overrides FOR ALL
  USING (public.is_staff_or_admin(auth.uid()));

-- Truth moments
CREATE TABLE public.truth_moments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '💡',
  trigger_condition TEXT NOT NULL DEFAULT 'manual',
  trigger_config JSONB DEFAULT '{}',
  display_location TEXT NOT NULL DEFAULT 'dashboard',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.truth_moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active truth moments"
  ON public.truth_moments FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage truth moments"
  ON public.truth_moments FOR ALL
  USING (public.is_staff_or_admin(auth.uid()));

-- Voice scripts
CREATE TABLE public.voice_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  script_type TEXT NOT NULL,
  title TEXT NOT NULL,
  template TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  trigger_condition TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.voice_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active voice scripts"
  ON public.voice_scripts FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage voice scripts"
  ON public.voice_scripts FOR ALL
  USING (public.is_staff_or_admin(auth.uid()));

-- Group feed posts (scheduled discussion starters)
CREATE TABLE public.group_feed_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.community_groups(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT false,
  engagement_views INTEGER NOT NULL DEFAULT 0,
  engagement_reactions INTEGER NOT NULL DEFAULT 0,
  engagement_replies INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.group_feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published feed posts"
  ON public.group_feed_posts FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage feed posts"
  ON public.group_feed_posts FOR ALL
  USING (public.is_staff_or_admin(auth.uid()));

-- Journey phase overrides (per-user)
CREATE TABLE public.journey_phase_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  override_phase INTEGER NOT NULL,
  reason TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.journey_phase_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage phase overrides"
  ON public.journey_phase_overrides FOR ALL
  USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Users can read own override"
  ON public.journey_phase_overrides FOR SELECT
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_admin_nudge_overrides_updated_at
  BEFORE UPDATE ON public.admin_nudge_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_truth_moments_updated_at
  BEFORE UPDATE ON public.truth_moments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voice_scripts_updated_at
  BEFORE UPDATE ON public.voice_scripts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_feed_posts_updated_at
  BEFORE UPDATE ON public.group_feed_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
