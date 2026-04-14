import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCallback } from 'react';

export interface CoachProgress {
  id: string;
  user_id: string;
  module_key: string;
  status: string;
  answers: string;
  structured_data: Record<string, any>;
  analysis_result: string;
  extracted_tasks: any[];
  tasks_created: boolean;
  goals_saved: boolean;
  reflection_input: string;
  reflection_result: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachBadge {
  id: string;
  user_id: string;
  module_key: string;
  badge_type: string;
  earned_at: string;
}

export function useAllCoachProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['coach-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('coach_progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data || []) as CoachProgress[];
    },
    enabled: !!user,
  });
}

export function useCoachBadges() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['coach-badges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('coach_badges')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data || []) as CoachBadge[];
    },
    enabled: !!user,
  });
}

export function useModuleProgress(moduleKey: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['coach-progress', user?.id, moduleKey],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('coach_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_key', moduleKey)
        .maybeSingle();
      if (error) throw error;
      return data as CoachProgress | null;
    },
    enabled: !!user && !!moduleKey,
  });
}

export function useSaveCoachProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      moduleKey: string;
      updates: Partial<Omit<CoachProgress, 'id' | 'user_id' | 'module_key' | 'created_at' | 'updated_at'>>;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { moduleKey, updates } = params;

      const { data: existing } = await supabase
        .from('coach_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('module_key', moduleKey)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('coach_progress')
          .update(updates as any)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('coach_progress')
          .insert({
            user_id: user.id,
            module_key: moduleKey,
            ...updates,
          } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-progress'] });
    },
  });
}

export function useEarnBadge() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { moduleKey: string; badgeType?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { moduleKey, badgeType = 'module_completed' } = params;

      const { error } = await supabase
        .from('coach_badges')
        .upsert(
          {
            user_id: user.id,
            module_key: moduleKey,
            badge_type: badgeType,
          } as any,
          { onConflict: 'user_id,module_key,badge_type', ignoreDuplicates: true }
        );
      if (error && !error.message.includes('duplicate')) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-badges'] });
    },
  });
}

export function getModuleStatus(progress: CoachProgress | null | undefined): 'not_started' | 'in_progress' | 'completed' {
  if (!progress) return 'not_started';
  if (progress.status === 'completed' || progress.completed_at) return 'completed';
  if (progress.answers || progress.analysis_result || progress.reflection_result) return 'in_progress';
  return 'not_started';
}
