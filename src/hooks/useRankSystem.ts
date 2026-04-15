import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { usePeakScore, getRankForScore, RANKS, type RankDef } from '@/hooks/usePeakScore';

export type RankChangeEvent =
  | { type: 'rank_up'; oldRank: RankDef; newRank: RankDef }
  | { type: 'rank_down'; oldRank: RankDef; newRank: RankDef };

export function useRankSystem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { score, rank, savedRank, loading } = usePeakScore();

  const [rankChange, setRankChange] = useState<RankChangeEvent | null>(null);

  const dismissRankChange = useCallback(() => setRankChange(null), []);

  useEffect(() => {
    if (loading || score === null || !user) return;

    const newRank = rank.rank;
    if (newRank === savedRank) return;

    const oldRankDef = RANKS.find(r => r.rank === savedRank) || RANKS[0];
    const newRankDef = rank;

    // Persist to profile
    supabase
      .from('profiles')
      .update({ current_rank: newRank })
      .eq('id', user.id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['profile-rank', user.id] });
      });

    if (newRank > savedRank) {
      // Rank UP → award XP
      supabase.from('gamification_actions').insert({
        user_id: user.id,
        action_type: 'rank_up',
        action_ref: `rank_${newRank}`,
        points_awarded: 200,
      });
      setRankChange({ type: 'rank_up', oldRank: oldRankDef, newRank: newRankDef });
    } else {
      // Rank DOWN
      setRankChange({ type: 'rank_down', oldRank: oldRankDef, newRank: newRankDef });
    }
  }, [score, rank, savedRank, loading, user]);

  return { rankChange, dismissRankChange };
}
