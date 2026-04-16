
-- Community Groups
CREATE TABLE public.community_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_emoji TEXT DEFAULT '👥',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active groups" ON public.community_groups
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Staff can manage groups" ON public.community_groups
  FOR ALL TO authenticated USING (public.is_staff_or_admin(auth.uid()));

-- Group Members
CREATE TABLE public.community_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  anon_username TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);

ALTER TABLE public.community_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of their groups" ON public.community_group_members
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.community_group_members m WHERE m.group_id = community_group_members.group_id AND m.user_id = auth.uid())
  );

CREATE POLICY "Users can join groups" ON public.community_group_members
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND (SELECT COUNT(*) FROM public.community_group_members WHERE user_id = auth.uid()) < 5
  );

CREATE POLICY "Users can leave groups" ON public.community_group_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Staff can manage members" ON public.community_group_members
  FOR ALL TO authenticated USING (public.is_staff_or_admin(auth.uid()));

-- Group Posts
CREATE TABLE public.community_group_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  post_type TEXT NOT NULL DEFAULT 'text' CHECK (post_type IN ('text', 'poll', 'peakscore')),
  poll_options JSONB,
  poll_votes JSONB DEFAULT '{}',
  flag_count INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_group_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view unhidden posts" ON public.community_group_posts
  FOR SELECT TO authenticated USING (
    is_hidden = false
    AND EXISTS (SELECT 1 FROM public.community_group_members m WHERE m.group_id = community_group_posts.group_id AND m.user_id = auth.uid())
  );

CREATE POLICY "Members can create posts" ON public.community_group_posts
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (SELECT 1 FROM public.community_group_members m WHERE m.group_id = community_group_posts.group_id AND m.user_id = auth.uid())
  );

CREATE POLICY "Staff can manage all posts" ON public.community_group_posts
  FOR ALL TO authenticated USING (public.is_staff_or_admin(auth.uid()));

-- Group Reactions
CREATE TABLE public.community_group_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_group_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'insightful', 'support')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.community_group_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view reactions" ON public.community_group_reactions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.community_group_posts p
      JOIN public.community_group_members m ON m.group_id = p.group_id AND m.user_id = auth.uid()
      WHERE p.id = community_group_reactions.post_id
    )
  );

CREATE POLICY "Members can react" ON public.community_group_reactions
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.community_group_posts p
      JOIN public.community_group_members m ON m.group_id = p.group_id AND m.user_id = auth.uid()
      WHERE p.id = community_group_reactions.post_id
    )
  );

CREATE POLICY "Users can remove own reactions" ON public.community_group_reactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Group Requests
CREATE TABLE public.community_group_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  group_name TEXT NOT NULL,
  description TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_group_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON public.community_group_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests" ON public.community_group_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can manage requests" ON public.community_group_requests
  FOR ALL TO authenticated USING (public.is_staff_or_admin(auth.uid()));

-- Triggers
CREATE TRIGGER update_community_groups_updated_at BEFORE UPDATE ON public.community_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_group_posts_updated_at BEFORE UPDATE ON public.community_group_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_group_requests_updated_at BEFORE UPDATE ON public.community_group_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-hide function when flag_count >= 3
CREATE OR REPLACE FUNCTION public.auto_hide_flagged_posts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.flag_count >= 3 AND NOT NEW.is_hidden THEN
    NEW.is_hidden := true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_hide_flagged_post
  BEFORE UPDATE ON public.community_group_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_hide_flagged_posts();
