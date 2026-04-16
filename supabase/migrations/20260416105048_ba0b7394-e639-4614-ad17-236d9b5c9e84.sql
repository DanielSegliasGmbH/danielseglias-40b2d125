
CREATE TABLE public.user_avatars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  future_self_name TEXT,
  future_self_name_category TEXT,
  future_self_age INTEGER,
  future_self_defining_moment TEXT,
  current_avatar_data JSONB DEFAULT '{}'::jsonb,
  avatar_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own avatar"
ON public.user_avatars FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own avatar"
ON public.user_avatars FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own avatar"
ON public.user_avatars FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own avatar"
ON public.user_avatars FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_user_avatars_updated_at
BEFORE UPDATE ON public.user_avatars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
