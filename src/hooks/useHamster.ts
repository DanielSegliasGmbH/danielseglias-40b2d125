import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { usePeakScore, RANKS } from '@/hooks/usePeakScore';

export interface HamsterState {
  rank: number;            // 1-6
  rankName: string;        // e.g. "Im Hamsterrad"
  rankEmoji: string;       // e.g. "🐹"
  rankDescription: string;
  equippedSkin: string;    // default: "classic"
  equippedHat: string | null;
  equippedItem: string | null;
  goldNuts: number;
  coins: number;
  xp: number;
  loading: boolean;
}

export interface HamsterEquipmentUpdate {
  skin?: string;
  hat?: string | null;
  item?: string | null;
}

export function useHamster() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { points: xp } = useGamification();
  const { rank: peakRank } = usePeakScore();

  const { data: row, isLoading } = useQuery({
    queryKey: ['hamster-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      // Fetch existing
      const { data: existing } = await supabase
        .from('hamster_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (existing) return existing;
      // Auto-create default row on first access
      const { data: created } = await supabase
        .from('hamster_profiles')
        .insert({ user_id: user.id, skin: 'classic' })
        .select()
        .maybeSingle();
      return created;
    },
    enabled: !!user,
  });

  const updateEquipment = useMutation({
    mutationFn: async (update: HamsterEquipmentUpdate) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('hamster_profiles')
        .upsert(
          { user_id: user.id, ...update },
          { onConflict: 'user_id' }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hamster-profile', user?.id] });
    },
  });

  const rankDef = peakRank ?? RANKS[0];

  const state: HamsterState = {
    rank: rankDef.rank,
    rankName: rankDef.name,
    rankEmoji: rankDef.emoji,
    rankDescription: rankDef.description,
    equippedSkin: row?.skin ?? 'classic',
    equippedHat: row?.hat ?? null,
    equippedItem: row?.item ?? null,
    goldNuts: row?.gold_nuts ?? 0,
    coins: row?.coins ?? 0,
    xp,
    loading: isLoading,
  };

  return { ...state, updateEquipment };
}
