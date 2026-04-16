import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

function getMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getWeekKey(): string {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function useRitualSettings() {
  const { user } = useAuth();

  const { data: settings } = useQuery({
    queryKey: ['ritual-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('payday_date, weekly_ritual_enabled, streak_rescue_enabled, future_self_messages_enabled')
        .eq('id', user.id)
        .maybeSingle();
      return {
        payday_date: (data as any)?.payday_date ?? 25,
        weekly_ritual_enabled: (data as any)?.weekly_ritual_enabled ?? true,
        streak_rescue_enabled: (data as any)?.streak_rescue_enabled ?? true,
        future_self_messages_enabled: (data as any)?.future_self_messages_enabled ?? true,
      };
    },
    enabled: !!user,
  });

  return settings;
}

export function usePaydayRitual() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const settings = useRitualSettings();
  const monthKey = getMonthKey();

  const { data: existingRitual } = useQuery({
    queryKey: ['monthly-ritual', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('monthly_rituals')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_key', monthKey)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const isPaydayWindow = (() => {
    if (!settings) return false;
    const today = new Date().getDate();
    const payday = settings.payday_date;
    // Show from payday to payday+3
    return today >= payday && today <= payday + 3;
  })();

  const shouldShowRitual = isPaydayWindow && !existingRitual;

  const saveRitual = useMutation({
    mutationFn: async (data: {
      income?: number;
      expenses?: number;
      savings?: number;
      allocation_data?: Record<string, number>;
      monthly_intention?: string;
      peak_score_change?: number;
      streak_count?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('monthly_rituals').insert({
        user_id: user.id,
        month_key: monthKey,
        ...data,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['monthly-ritual'] });
    },
  });

  return { shouldShowRitual, existingRitual, saveRitual, monthKey, isPaydayWindow };
}

export function useWeeklyCheck() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const settings = useRitualSettings();
  const weekKey = getWeekKey();

  const { data: existingCheck } = useQuery({
    queryKey: ['weekly-reflection', user?.id, weekKey],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('weekly_reflections')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_key', weekKey)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const isSunday = new Date().getDay() === 0;
  const shouldShowWeekly = settings?.weekly_ritual_enabled && isSunday && !existingCheck;

  const saveReflection = useMutation({
    mutationFn: async (data: {
      peak_score_change?: number;
      tasks_completed?: number;
      xp_earned?: number;
      focus_next_week?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('weekly_reflections').insert({
        user_id: user.id,
        week_key: weekKey,
        ...data,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weekly-reflection'] });
    },
  });

  return { shouldShowWeekly, existingCheck, saveReflection, weekKey };
}

export function useStreakRescue() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const settings = useRitualSettings();

  // Count self-rescues this month
  const { data: selfRescuesThisMonth = 0 } = useQuery({
    queryKey: ['streak-rescues-month', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('streak_rescues')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('rescue_type', 'self')
        .gte('rescued_at', startOfMonth.toISOString());
      return count || 0;
    },
    enabled: !!user,
  });

  const canSelfRescue = settings?.streak_rescue_enabled && selfRescuesThisMonth < 1;

  const performSelfRescue = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('streak_rescues').insert({
        user_id: user.id,
        rescue_type: 'self',
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['streak-rescues-month'] });
    },
  });

  const requestFriendRescue = useMutation({
    mutationFn: async (friendId: string) => {
      if (!user) throw new Error('Not authenticated');
      // Create a rescue record pending friend confirmation
      const { error } = await supabase.from('streak_rescues').insert({
        user_id: user.id,
        rescue_type: 'friend',
        rescued_by: friendId,
      } as any);
      if (error) throw error;
      // Send notification to friend
      const { error: notifError } = await supabase.from('smart_notifications').insert({
        user_id: friendId,
        type: 'streak_rescue_request',
        ref_key: `rescue-${user.id}-${Date.now()}`,
        title: `Streak-Rescue Anfrage`,
        body: `Ein Freund bittet dich um einen Streak-Rescue! Hilf ihm/ihr?`,
        action_url: '/app/client-portal/friends',
      } as any);
      if (notifError) console.error('Notification error:', notifError);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['streak-rescues-month'] });
    },
  });

  return { canSelfRescue, selfRescuesThisMonth, performSelfRescue, requestFriendRescue, enabled: settings?.streak_rescue_enabled };
}
