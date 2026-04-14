
-- Table to persist coach module progress per user
CREATE TABLE public.coach_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  answers TEXT DEFAULT '',
  structured_data JSONB DEFAULT '{}',
  analysis_result TEXT DEFAULT '',
  extracted_tasks JSONB DEFAULT '[]',
  tasks_created BOOLEAN NOT NULL DEFAULT false,
  goals_saved BOOLEAN NOT NULL DEFAULT false,
  reflection_input TEXT DEFAULT '',
  reflection_result TEXT DEFAULT '',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_key)
);

ALTER TABLE public.coach_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coach_progress"
  ON public.coach_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coach_progress"
  ON public.coach_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coach_progress"
  ON public.coach_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all coach_progress"
  ON public.coach_progress FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Table for earned coach badges
CREATE TABLE public.coach_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_key TEXT NOT NULL,
  badge_type TEXT NOT NULL DEFAULT 'module_completed',
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_key, badge_type)
);

ALTER TABLE public.coach_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coach_badges"
  ON public.coach_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coach_badges"
  ON public.coach_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all coach_badges"
  ON public.coach_badges FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Trigger for updated_at on coach_progress
CREATE TRIGGER update_coach_progress_updated_at
  BEFORE UPDATE ON public.coach_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
