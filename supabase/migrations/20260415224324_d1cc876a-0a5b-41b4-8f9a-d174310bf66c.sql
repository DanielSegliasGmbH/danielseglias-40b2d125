
-- Habits definition table
CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '✅',
  frequency TEXT NOT NULL DEFAULT 'daily',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habits"
  ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own habits"
  ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits"
  ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits"
  ON public.habits FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Daily tracking entries
CREATE TABLE public.habit_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, habit_id, date)
);

ALTER TABLE public.habit_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tracking"
  ON public.habit_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tracking"
  ON public.habit_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tracking"
  ON public.habit_tracking FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_habit_tracking_user_date ON public.habit_tracking (user_id, date);
CREATE INDEX idx_habit_tracking_habit ON public.habit_tracking (habit_id, date);
