import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useGamification } from '@/hooks/useGamification';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface MicroChallenge {
  id: string;
  category: string;
  title: string;
  xp: number;
  autoDetect?: string; // key for auto-detection logic
  completed: boolean;
}

interface WeeklyChallengeRow {
  id: string;
  user_id: string;
  week_key: string;
  challenges: MicroChallenge[];
  bonus_claimed: boolean;
  completed_at: string | null;
  created_at: string;
}

const CHALLENGE_POOL: Omit<MicroChallenge, 'id' | 'completed'>[] = [
  // Budget
  { category: 'budget', title: 'Erfasse diese Woche 5 Ausgaben', xp: 25, autoDetect: 'expenses_5' },
  { category: 'budget', title: 'Finde eine Ausgabe, auf die du verzichten kannst', xp: 30 },
  { category: 'budget', title: 'Koche diese Woche 3× selber statt auswärts', xp: 20 },
  { category: 'budget', title: 'Kaufe heute nichts Unnötiges', xp: 15 },
  // Knowledge
  { category: 'knowledge', title: 'Lies einen Artikel in der Wissensbibliothek', xp: 20, autoDetect: 'article_read' },
  { category: 'knowledge', title: 'Schliesse einen Finanz-Coach Schritt ab', xp: 25, autoDetect: 'coach_step' },
  { category: 'knowledge', title: 'Nutze ein Werkzeug, das du noch nie benutzt hast', xp: 30, autoDetect: 'new_tool' },
  // Tracking
  { category: 'tracking', title: 'Aktualisiere einen Vermögenswert', xp: 20 },
  { category: 'tracking', title: 'Überprüfe deine offenen Aufgaben', xp: 15, autoDetect: 'check_tasks' },
  { category: 'tracking', title: 'Erstelle ein neues Ziel', xp: 20, autoDetect: 'new_goal' },
  // Social
  { category: 'social', title: 'Lade einen Freund ein', xp: 50 },
  { category: 'social', title: 'Starte eine Challenge mit einem Freund', xp: 25, autoDetect: 'friend_challenge' },
  // Savings
  { category: 'savings', title: 'Spare diese Woche CHF 50 extra', xp: 35 },
  { category: 'savings', title: 'Überweise etwas in die Säule 3a', xp: 40 },
  { category: 'savings', title: 'Kündige ein ungenutztes Abo', xp: 30 },
];

function getWeekKey(): string {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - jan1.getTime()) / 86400000);
  const week = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function getDaysRemainingInWeek(): number {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  // Week ends Sunday night
  const daysLeft = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  return daysLeft;
}

function pickChallenges(previousIds: string[]): MicroChallenge[] {
  const categories = ['budget', 'knowledge', 'tracking', 'social', 'savings'];
  const picked: MicroChallenge[] = [];
  const usedCategories = new Set<string>();

  // Shuffle categories
  const shuffled = [...categories].sort(() => Math.random() - 0.5);

  for (const cat of shuffled) {
    if (picked.length >= 3) break;
    const pool = CHALLENGE_POOL.filter(
      c => c.category === cat && !previousIds.includes(c.title)
    );
    if (pool.length === 0) continue;
    const item = pool[Math.floor(Math.random() * pool.length)];
    picked.push({
      id: crypto.randomUUID(),
      ...item,
      completed: false,
    });
    usedCategories.add(cat);
  }

  // Fill remaining if needed
  while (picked.length < 3) {
    const remaining = CHALLENGE_POOL.filter(
      c => !picked.some(p => p.title === c.title) && !previousIds.includes(c.title)
    );
    if (remaining.length === 0) break;
    const item = remaining[Math.floor(Math.random() * remaining.length)];
    picked.push({ id: crypto.randomUUID(), ...item, completed: false });
  }

  return picked;
}

export function useWeeklyChallenges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { awardPoints } = useGamification();
  const weekKey = getWeekKey();
  const daysRemaining = getDaysRemainingInWeek();

  const { data: currentWeek, isLoading } = useQuery({
    queryKey: ['weekly-challenges', user?.id, weekKey],
    queryFn: async (): Promise<WeeklyChallengeRow | null> => {
      if (!user) return null;

      // Try to get existing
      const { data: existing } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_key', weekKey)
        .maybeSingle();

      if (existing) {
        return {
          ...existing,
          challenges: existing.challenges as unknown as MicroChallenge[],
        };
      }

      // Get previous week to avoid repeats
      const { data: prev } = await supabase
        .from('weekly_challenges')
        .select('challenges')
        .eq('user_id', user.id)
        .neq('week_key', weekKey)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const previousTitles = prev
        ? (prev.challenges as unknown as MicroChallenge[]).map(c => c.title)
        : [];

      const challenges = pickChallenges(previousTitles);

      const { data: created, error } = await supabase
        .from('weekly_challenges')
        .insert({
          user_id: user.id,
          week_key: weekKey,
          challenges: JSON.parse(JSON.stringify(challenges)) as Json,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create weekly challenges:', error);
        return null;
      }

      return {
        ...created,
        challenges: created.challenges as unknown as MicroChallenge[],
      };
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const completeChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!currentWeek || !user) throw new Error('No data');

      const updated = currentWeek.challenges.map(c =>
        c.id === challengeId ? { ...c, completed: true } : c
      );

      const challenge = currentWeek.challenges.find(c => c.id === challengeId);
      if (!challenge || challenge.completed) return;

      // Award XP for this challenge
      await supabase.from('gamification_actions').insert({
        user_id: user.id,
        action_type: 'weekly_quest',
        action_ref: `wq-${weekKey}-${challengeId}`,
        points_awarded: challenge.xp,
      });

      const allDone = updated.every(c => c.completed);

      const { error } = await supabase
        .from('weekly_challenges')
        .update({
          challenges: JSON.parse(JSON.stringify(updated)) as Json,
          completed_at: allDone ? new Date().toISOString() : null,
        })
        .eq('id', currentWeek.id);

      if (error) throw error;

      // Bonus XP for all 3
      if (allDone && !currentWeek.bonus_claimed) {
        await supabase.from('gamification_actions').insert({
          user_id: user.id,
          action_type: 'weekly_quest',
          action_ref: `wq-bonus-${weekKey}`,
          points_awarded: 50,
        });
        await supabase
          .from('weekly_challenges')
          .update({ bonus_claimed: true })
          .eq('id', currentWeek.id);

        // ARCHIVED v1.0 — quest completion toast disabled. Restore in Claude Code v1.1
        // toast.success('🎉 Alle Quests erledigt! +50 Bonus-XP');
      } else {
        // ARCHIVED v1.0 — XP award toast disabled. Restore in Claude Code v1.1
        // toast.success(`+${challenge.xp} XP verdient! ⚡`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
    },
    onError: () => toast.error('Quest konnte nicht abgeschlossen werden.'),
  });

  const challenges = currentWeek?.challenges ?? [];
  const completedCount = challenges.filter(c => c.completed).length;
  const allDone = completedCount === challenges.length && challenges.length > 0;
  const bonusClaimed = currentWeek?.bonus_claimed ?? false;
  const totalXp = challenges.reduce((sum, c) => sum + c.xp, 0) + 50;

  return {
    challenges,
    completedCount,
    allDone,
    bonusClaimed,
    daysRemaining,
    isLoading,
    completeChallenge,
    totalXp,
  };
}
