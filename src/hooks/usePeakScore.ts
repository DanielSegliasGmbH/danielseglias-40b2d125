import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface PeakScoreData {
  score: number | null;
  totalAssets: number;
  totalLiabilities: number;
  monthlyExpenses: number;
  trend: number | null; // change vs last month
  loading: boolean;
  hasData: boolean;
}

function getMonthKey(offset = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
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

  // Average of last 3 months expenses
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

  // Last month's snapshot for trend
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

  const totalAssets = assets.reduce((s: number, a: any) => s + Number(a.value), 0);
  const totalLiabilities = liabilities.reduce((s: number, l: any) => s + Number(l.amount), 0);
  const monthlyExpenses = avgExpenses > 0 ? avgExpenses : (metaProfile?.fixed_costs || 0);
  
  const hasData = totalAssets > 0 || totalLiabilities > 0 || monthlyExpenses > 0;
  
  let score: number | null = null;
  if (hasData && monthlyExpenses > 0) {
    score = Math.max(0, (totalAssets - totalLiabilities) / monthlyExpenses);
    score = Math.round(score * 10) / 10;
  } else if (hasData && monthlyExpenses === 0) {
    score = null; // can't calculate without expenses
  }

  const trend = score !== null && lastSnapshot ? Math.round((score - Number(lastSnapshot.score)) * 10) / 10 : null;

  return {
    score,
    totalAssets,
    totalLiabilities,
    monthlyExpenses,
    trend,
    loading: l1 || l2 || l3 || l4,
    hasData,
  };
}

export function getPeakScoreRank(score: number): string {
  if (score >= 36) return 'Finanzielle Freiheit';
  if (score >= 24) return 'Souverän';
  if (score >= 12) return 'Stabil';
  if (score >= 6) return 'Aufbauend';
  if (score >= 3) return 'Grundlage';
  return 'Startphase';
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
