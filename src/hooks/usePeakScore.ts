import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// ── Rank definitions (Hamster journey) ──
export interface RankDef {
  rank: number;
  name: string;
  emoji: string;
  description: string;
  minScore: number;
  maxScore: number;
}

export const RANKS: RankDef[] = [
  {
    rank: 1,
    name: 'Im Hamsterrad',
    emoji: '🐹',
    description: 'Du rennst. Aber noch nicht für dich.',
    minScore: 0,
    maxScore: 3,
  },
  {
    rank: 2,
    name: 'Aufwachend',
    emoji: '👁️',
    description: 'Du merkst es. Das ist der erste Schritt.',
    minScore: 3,
    maxScore: 6,
  },
  {
    rank: 3,
    name: 'Aussteiger',
    emoji: '🚪',
    description: 'Du verlässt das Rad. Bewusst.',
    minScore: 6,
    maxScore: 12,
  },
  {
    rank: 4,
    name: 'Gestalter',
    emoji: '🏗️',
    description: 'Du baust etwas. Für dich.',
    minScore: 12,
    maxScore: 36,
  },
  {
    rank: 5,
    name: 'Investor',
    emoji: '📈',
    description: 'Dein Geld arbeitet. Du entscheidest.',
    minScore: 36,
    maxScore: 120,
  },
  {
    rank: 6,
    name: 'Souverän',
    emoji: '🌟',
    description: 'Du bist raus. Das Hamsterrad dreht ohne dich.',
    minScore: 120,
    maxScore: Infinity,
  },
];

export function getRankForScore(score: number): RankDef {
  return RANKS.find(r => score >= r.minScore && score < r.maxScore) || RANKS[0];
}

export function getRankBuffer(score: number): { isWarning: boolean; buffer: number } {
  const rank = getRankForScore(score);
  if (rank.rank <= 1) return { isWarning: false, buffer: score };
  const buffer = score - rank.minScore;
  const range = rank.maxScore === Infinity ? 100 : rank.maxScore - rank.minScore;
  const isWarning = buffer / range < 0.1 && buffer < 1;
  return { isWarning, buffer: Math.round(buffer * 10) / 10 };
}

// ── PeakScore data ──
export interface PeakScoreData {
  score: number | null;
  totalAssets: number;
  totalLiabilities: number;
  monthlyExpenses: number;
  trend: number | null;
  loading: boolean;
  hasData: boolean;
  rank: RankDef;
  savedRank: number;
  rankBuffer: { isWarning: boolean; buffer: number };
  assetCount: number;
  liabilityCount: number;
  expenseSource: 'budget' | 'profile' | 'none';
}

export function usePeakScore(): PeakScoreData {
  const { user } = useAuth();

  const { data: assets = [], isLoading: l1 } = useQuery({
    queryKey: ['peak-assets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('net_worth_assets').select('value').eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: liabilities = [], isLoading: l2 } = useQuery({
    queryKey: ['peak-liabilities', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('net_worth_liabilities').select('amount').eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: metaProfile, isLoading: l3 } = useQuery({
    queryKey: ['peak-meta', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from('meta_profiles').select('fixed_costs').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: avgExpenses = 0, isLoading: l4 } = useQuery({
    queryKey: ['peak-avg-expenses', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const startDate = threeMonthsAgo.toISOString().slice(0, 10);
      const { data } = await supabase
        .from('budget_expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('expense_date', startDate);
      if (!data || data.length === 0) return 0;
      const total = data.reduce((s: number, e: any) => s + Number(e.amount), 0);
      return total / 3;
    },
    enabled: !!user,
  });

  const { data: lastSnapshot } = useQuery({
    queryKey: ['peak-last-snapshot', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('peak_scores')
        .select('score')
        .eq('user_id', user.id)
        .eq('is_snapshot', true)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Fetch saved rank from profile
  const { data: profileRank, isLoading: savedRankLoading } = useQuery({
    queryKey: ['profile-rank', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('current_rank')
        .eq('id', user.id)
        .maybeSingle();
      return data?.current_rank ?? 1;
    },
    enabled: !!user,
  });

  const totalAssets = assets.reduce((s: number, a: any) => s + Number(a.value), 0);
  const totalLiabilities = liabilities.reduce((s: number, l: any) => s + Number(l.amount), 0);
  const expenseSource: 'budget' | 'profile' | 'none' = avgExpenses > 0 ? 'budget' : (metaProfile?.fixed_costs ? 'profile' : 'none');
  const monthlyExpenses = avgExpenses > 0 ? avgExpenses : (metaProfile?.fixed_costs || 0);

  const hasData = totalAssets > 0 || totalLiabilities > 0 || monthlyExpenses > 0;

  let score: number | null = null;
  if (hasData && monthlyExpenses > 0) {
    score = Math.max(0, (totalAssets - totalLiabilities) / monthlyExpenses);
    score = Math.round(score * 10) / 10;
  } else if (hasData && monthlyExpenses === 0) {
    score = null;
  }

  const trend = score !== null && lastSnapshot ? Math.round((score - Number(lastSnapshot.score)) * 10) / 10 : null;
  const rank = score !== null ? getRankForScore(score) : RANKS[0];
  const rankBuffer = score !== null ? getRankBuffer(score) : { isWarning: false, buffer: 0 };

  return {
    score,
    totalAssets,
    totalLiabilities,
    monthlyExpenses,
    trend,
    loading: l1 || l2 || l3 || l4,
    hasData,
    rank,
    savedRank: profileRank,
    rankBuffer,
    assetCount: assets.length,
    liabilityCount: liabilities.length,
    expenseSource,
  };
}

export function getPeakScoreGradient(score: number): string {
  if (score >= 36) return 'from-amber-500/20 via-yellow-500/10 to-amber-600/20';
  if (score >= 12) return 'from-emerald-600/15 via-green-500/10 to-emerald-700/15';
  if (score >= 3) return 'from-orange-500/15 via-amber-500/10 to-orange-600/15';
  return 'from-red-500/15 via-rose-500/10 to-red-600/15';
}

export function getPeakScoreBorderColor(score: number): string {
  if (score >= 36) return 'border-amber-500/30';
  if (score >= 12) return 'border-emerald-600/30';
  if (score >= 3) return 'border-orange-500/30';
  return 'border-red-500/30';
}
