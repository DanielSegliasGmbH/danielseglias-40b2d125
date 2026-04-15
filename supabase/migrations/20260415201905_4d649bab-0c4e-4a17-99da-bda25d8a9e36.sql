-- Create friends table
CREATE TABLE public.friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id_1 UUID NOT NULL,
  user_id_2 UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'accepted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT friends_no_self CHECK (user_id_1 <> user_id_2),
  CONSTRAINT friends_unique_pair UNIQUE (user_id_1, user_id_2)
);

-- Enable RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Users can view friendships they are part of
CREATE POLICY "Users can view own friendships"
ON public.friends FOR SELECT
TO authenticated
USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Users can create friendships where they are user_id_1
CREATE POLICY "Users can create friendships"
ON public.friends FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id_1);

-- Users can update friendships they are part of (accept)
CREATE POLICY "Users can update own friendships"
ON public.friends FOR UPDATE
TO authenticated
USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Users can delete friendships they are part of
CREATE POLICY "Users can delete own friendships"
ON public.friends FOR DELETE
TO authenticated
USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Admins can view all
CREATE POLICY "Admins can view all friendships"
ON public.friends FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));