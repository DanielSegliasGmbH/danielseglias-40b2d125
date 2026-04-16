import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { toast } from 'sonner';

export interface SuccessStory {
  id: string;
  title: string;
  persona_name: string;
  persona_age: number | null;
  persona_context: string | null;
  start_situation: Record<string, any>;
  goals: string | null;
  actions_taken: string[];
  end_result: Record<string, any>;
  quote: string | null;
  peakscore_journey: number[];
  tags: string[];
  motivation_count: number;
  is_active: boolean;
  published_at: string | null;
  created_at: string;
}

export function useSuccessStories() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['success-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('success_stories')
        .select('*')
        .eq('is_active', true)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });
      if (error) throw error;
      return (data || []) as SuccessStory[];
    },
    enabled: !!user,
  });
}

export function useAdminSuccessStories() {
  return useQuery({
    queryKey: ['admin-success-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('success_stories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as SuccessStory[];
    },
  });
}

export function useMotivateStory() {
  const queryClient = useQueryClient();
  const { awardPoints } = useGamification();

  return useMutation({
    mutationFn: async (storyId: string) => {
      // We can't directly update due to RLS, so we track via gamification
      await awardPoints('tool_used', `motivated_story_${storyId}`);
    },
    onSuccess: () => {
      toast.success('Danke! Deine Motivation wurde gespeichert 💪');
    },
  });
}

export function useCreateStoryTasks() {
  const { user } = useAuth();
  const { awardPoints } = useGamification();

  return useMutation({
    mutationFn: async (actions: string[]) => {
      if (!user) throw new Error('Not authenticated');
      const tasks = actions.map((title) => ({
        user_id: user.id,
        title,
        is_completed: false,
      }));
      const { error } = await supabase.from('client_tasks').insert(tasks);
      if (error) throw error;
      await awardPoints('tool_used', `story_tasks_created`);
    },
    onSuccess: () => {
      toast.success('Aufgaben wurden erstellt! Schau in "Meine Aufgaben".');
    },
    onError: () => toast.error('Aufgaben konnten nicht erstellt werden'),
  });
}

export function useSaveStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (story: Partial<SuccessStory> & { id?: string }) => {
      if (story.id) {
        const { error } = await supabase
          .from('success_stories')
          .update(story as any)
          .eq('id', story.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('success_stories')
          .insert(story as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-success-stories'] });
      queryClient.invalidateQueries({ queryKey: ['success-stories'] });
      toast.success('Story gespeichert!');
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });
}
