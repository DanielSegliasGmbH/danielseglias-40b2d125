import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { usePeakScore } from './usePeakScore';
import { useMetaProfile } from './useMetaProfile';

export type TruthMomentId = 'gesamt_verdient' | 'einkaufstasche' | 'eigenheim';

export interface TruthMomentData {
  id: TruthMomentId;
  ready: boolean;
  payload: Record<string, number | string>;
}

/**
 * Determines which truth moments are eligible to be shown.
 * Returns the first eligible moment (or null).
 */
export function useTruthMoments() {
  const { user } = useAuth();
  const { totalAssets, totalLiabilities } = usePeakScore();
  const { profile: meta } = useMetaProfile();

  // Which moments have already been shown?
  const { data: shown = [] } = useQuery({
    queryKey: ['truth-moments-shown', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('truth_moments_shown')
        .select('moment_id')
        .eq('user_id', user.id);
      return (data || []).map((r: any) => r.moment_id as string);
    },
    enabled: !!user,
  });

  // Opt-out check
  const { data: optedIn = true } = useQuery({
    queryKey: ['truth-moments-optin', user?.id],
    queryFn: async () => {
      if (!user) return true;
      const { data } = await supabase
        .from('profiles')
        .select('show_truth_moments')
        .eq('id', user.id)
        .maybeSingle();
      return (data as any)?.show_truth_moments ?? true;
    },
    enabled: !!user,
  });

  // Check if AHV or Sozialabgaben tool has been used (from memories)
  const { data: hasToolData = false } = useQuery({
    queryKey: ['truth-tool-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('memories')
        .select('id')
        .eq('user_id', user.id)
        .in('tool_slug', ['ahv-tracker', 'sozialabgaben-uebersicht'])
        .limit(1);
      return (data || []).length > 0;
    },
    enabled: !!user,
  });

  // Account creation date
  const createdAt = user?.created_at ? new Date(user.created_at) : null;
  const monthsActive = createdAt
    ? (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
    : 0;

  const age = meta?.age || null;
  const netWorth = totalAssets - totalLiabilities;
  const monthlyIncome = meta?.monthly_income || 0;

  if (!optedIn || !user) return { moment: null, markShown };

  // --- MOMENT 1: Das Gesamt-Verdient ---
  if (!shown.includes('gesamt_verdient') && hasToolData && monthlyIncome > 0) {
    const workingYears = age ? Math.max(0, age - 20) : 15;
    const totalEarned = Math.round(monthlyIncome * 12 * workingYears);
    const percentage = totalEarned > 0 ? Math.round((netWorth / totalEarned) * 100) : 0;

    if (totalEarned > 0) {
      return {
        moment: {
          id: 'gesamt_verdient' as TruthMomentId,
          ready: true,
          payload: { totalEarned, netWorth, percentage },
        },
        markShown,
      };
    }
  }

  // --- MOMENT 2: Die Einkaufstasche ---
  const isFirstOfMonth = new Date().getDate() <= 3; // grace window
  if (
    !shown.includes('einkaufstasche') &&
    monthsActive >= 3 &&
    isFirstOfMonth
  ) {
    const inflationRate = 0.02;
    const years = 20;
    const futureValue = Math.round(100 * Math.pow(1 - inflationRate, years));
    return {
      moment: {
        id: 'einkaufstasche' as TruthMomentId,
        ready: true,
        payload: { futureValue },
      },
      markShown,
    };
  }

  // --- MOMENT 3: Das Eigenheim-Gespräch ---
  if (
    !shown.includes('eigenheim') &&
    monthsActive >= 2 &&
    age !== null &&
    age >= 25 &&
    age <= 40
  ) {
    return {
      moment: {
        id: 'eigenheim' as TruthMomentId,
        ready: true,
        payload: {},
      },
      markShown,
    };
  }

  return { moment: null, markShown };

  async function markShown(momentId: string) {
    if (!user) return;
    await supabase.from('truth_moments_shown').insert({
      user_id: user.id,
      moment_id: momentId,
    } as any);
  }
}
