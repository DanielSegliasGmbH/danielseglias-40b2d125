import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { usePeakScore, getRankForScore, RANKS, type RankDef } from '@/hooks/usePeakScore';

export type RankChangeEvent =
  | { type: 'rank_up'; oldRank: RankDef; newRank: RankDef }
  | { type: 'rank_down'; oldRank: RankDef; newRank: RankDef };

// ARCHIVED for v1.0 — rank change detection has a race condition bug.
// Hook preserved but returns no events. Re-enable after fixing in Claude Code.
const RANK_ANIMATION_ENABLED = false;

export function useRankSystem() {
  // ARCHIVED: returns empty state to prevent broken animations
  return { rankChange: null as RankChangeEvent | null, dismissRankChange: () => {} };
  // eslint-disable-next-line no-unreachable
  // @ts-ignore — original implementation preserved below for restoration
  function _ArchivedImpl() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { score, rank, savedRank, savedRankLoading, loading } = usePeakScore();

  const [rankChange, setRankChange] = useState<RankChangeEvent | null>(null);
  const processedRankChange = useRef<string>('');

  const dismissRankChange = useCallback(() => setRankChange(null), []);

  useEffect(() => {
    if (!RANK_ANIMATION_ENABLED) return;
    // CRITICAL: Wait for BOTH score AND saved rank to load.
    // Without this guard, the animation fires on every page load
    // because savedRank defaults to 1 before the DB query resolves.
    if (loading || savedRankLoading || score === null || !user) return;
    if (savedRank === undefined || savedRank === null) return;

    const newRank = rank.rank;
    if (newRank === savedRank) return;

    // Debounce: only process each transition once per session
    const changeKey = `${savedRank}->${newRank}`;
    if (processedRankChange.current === changeKey) return;
    processedRankChange.current = changeKey;

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
  }, [score, rank, savedRank, savedRankLoading, loading, user, queryClient]);

  return { rankChange, dismissRankChange };
  }
}
