
-- Client Goals table
CREATE TABLE public.client_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  target_amount NUMERIC NULL,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  target_date DATE NULL,
  category TEXT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.client_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON public.client_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.client_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.client_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.client_goals FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all goals" ON public.client_goals FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_client_goals_updated_at
  BEFORE UPDATE ON public.client_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Client Tasks table
CREATE TABLE public.client_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  notes TEXT NULL,
  due_date DATE NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.client_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON public.client_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.client_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.client_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.client_tasks FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all tasks" ON public.client_tasks FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_client_tasks_updated_at
  BEFORE UPDATE ON public.client_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
