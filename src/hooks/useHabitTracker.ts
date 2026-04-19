import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMemo } from 'react';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  frequency: 'daily' | 'weekdays' | 'weekly';
  is_active: boolean;
  sort_order: number;
}

interface TrackingEntry {
  id: string;
  habit_id: string;
  date: string;
}

const DEFAULT_HABITS: Omit<Habit, 'id' | 'user_id' | 'sort_order'>[] = [
  { name: 'Kein unnötiger Kauf heute', emoji: '💰', frequency: 'daily', is_active: true },
  { name: 'Kontostand gecheckt', emoji: '📊', frequency: 'daily', is_active: true },
  { name: 'Selber gekocht statt bestellt', emoji: '🍳', frequency: 'daily', is_active: true },
  { name: 'Eine Erkenntnis notiert', emoji: '📝', frequency: 'daily', is_active: true },
  { name: 'Kein Impulskauf', emoji: '🚫', frequency: 'daily', is_active: true },
];

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function getStreakDays(habitId: string, entries: TrackingEntry[]): number {
  const habitEntries = entries
    .filter(e => e.habit_id === habitId)
    .map(e => e.date)
    .sort()
    .reverse();

  if (habitEntries.length === 0) return 0;

  let streak = 0;
  const today = getToday();
  const checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().slice(0, 10);
    if (habitEntries.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      // Today not yet checked — check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export function useHabitTracker() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Load habits
  const { data: habits = [], isLoading: loadingHabits } = useQuery({
    queryKey: ['habits', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order');

      if (data && data.length > 0) return data as Habit[];

      // Seed defaults
      const inserts = DEFAULT_HABITS.map((h, i) => ({
        user_id: user.id,
        name: h.name,
        emoji: h.emoji,
        frequency: h.frequency,
        is_active: true,
        sort_order: i,
      }));
      const { data: created } = await supabase
        .from('habits')
        .insert(inserts)
        .select();
      return (created || []) as Habit[];
    },
    enabled: !!user,
  });

  // Load tracking entries for last 35 days (for streak calc)
  const { data: trackingEntries = [], isLoading: loadingTracking } = useQuery({
    queryKey: ['habit-tracking', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const since = new Date();
      since.setDate(since.getDate() - 35);
      const { data } = await supabase
        .from('habit_tracking')
        .select('id, habit_id, date')
        .eq('user_id', user.id)
        .gte('date', since.toISOString().slice(0, 10))
        .order('date', { ascending: false });
      return (data || []) as TrackingEntry[];
    },
    enabled: !!user,
  });

  const weekDates = useMemo(() => getWeekDates(), []);

  const isChecked = (habitId: string, date: string): boolean =>
    trackingEntries.some(e => e.habit_id === habitId && e.date === date);

  const weekStats = useMemo(() => {
    let total = 0;
    let checked = 0;
    habits.forEach(h => {
      weekDates.forEach(d => {
        // Check if habit applies to this day
        const dayOfWeek = new Date(d).getDay();
        if (h.frequency === 'weekdays' && (dayOfWeek === 0 || dayOfWeek === 6)) return;
        if (h.frequency === 'weekly' && dayOfWeek !== 1) return; // Monday only
        total++;
        if (isChecked(h.id, d)) checked++;
      });
    });
    const rate = total > 0 ? Math.round((checked / total) * 100) : 0;
    return { total, checked, rate };
  }, [habits, weekDates, trackingEntries]);

  const streaks = useMemo(() => {
    const map: Record<string, number> = {};
    habits.forEach(h => {
      map[h.id] = getStreakDays(h.id, trackingEntries);
    });
    return map;
  }, [habits, trackingEntries]);

  const toggleHabit = useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      if (!user) throw new Error('Not authenticated');

      const existing = trackingEntries.find(
        e => e.habit_id === habitId && e.date === date
      );

      if (existing) {
        await supabase.from('habit_tracking').delete().eq('id', existing.id);
      } else {
        const { error } = await supabase.from('habit_tracking').insert({
          user_id: user.id,
          habit_id: habitId,
          date,
        });
        if (error) throw error;

        // Award +5 XP
        await supabase.from('gamification_actions').insert({
          user_id: user.id,
          action_type: 'habit_checked',
          action_ref: `habit-${habitId}-${date}`,
          points_awarded: 5,
        });

        // Check if all habits done today
        const todayChecked = trackingEntries.filter(e => e.date === date).length + 1;
        const applicableHabits = habits.filter(h => {
          const dow = new Date(date).getDay();
          if (h.frequency === 'weekdays' && (dow === 0 || dow === 6)) return false;
          if (h.frequency === 'weekly' && dow !== 1) return false;
          return true;
        });
        if (todayChecked >= applicableHabits.length && applicableHabits.length > 0) {
          await supabase.from('gamification_actions').insert({
            user_id: user.id,
            action_type: 'habit_all_daily',
            action_ref: `habit-all-${date}`,
            points_awarded: 10,
          });
          // ARCHIVED v1.0 — habit completion toast disabled. Restore in Claude Code v1.1
          // toast.success('Alle Gewohnheiten erledigt! +10 Bonus-XP 🎉');
        }

        // Check streak milestones
        const streak = getStreakDays(habitId, [
          ...trackingEntries,
          { id: 'tmp', habit_id: habitId, date },
        ]);
        if (streak === 7) {
          await supabase.from('gamification_actions').insert({
            user_id: user.id,
            action_type: 'habit_streak_7',
            action_ref: `streak7-${habitId}`,
            points_awarded: 25,
          });
          // ARCHIVED v1.0 — streak milestone toast disabled. Restore in Claude Code v1.1
          // toast.success('🔥 7-Tage-Streak! +25 XP');
        } else if (streak === 30) {
          await supabase.from('gamification_actions').insert({
            user_id: user.id,
            action_type: 'habit_streak_30',
            action_ref: `streak30-${habitId}`,
            points_awarded: 100,
          });
          // ARCHIVED v1.0 — streak milestone toast disabled. Restore in Claude Code v1.1
          // toast.success('🏆 30-Tage-Streak! +100 XP');
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-tracking'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
    },
    onError: () => toast.error('Fehler beim Speichern.'),
  });

  const addHabit = useMutation({
    mutationFn: async ({ name, emoji, frequency }: { name: string; emoji: string; frequency: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('habits').insert({
        user_id: user.id,
        name: name.trim(),
        emoji,
        frequency,
        sort_order: habits.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Gewohnheit hinzugefügt ✓');
    },
    onError: () => toast.error('Fehler beim Erstellen.'),
  });

  const deleteHabit = useMutation({
    mutationFn: async (habitId: string) => {
      await supabase.from('habits').update({ is_active: false }).eq('id', habitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Gewohnheit entfernt');
    },
  });

  return {
    habits,
    trackingEntries,
    weekDates,
    isChecked,
    weekStats,
    streaks,
    toggleHabit,
    addHabit,
    deleteHabit,
    isLoading: loadingHabits || loadingTracking,
  };
}
