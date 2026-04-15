import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PeakScoreResult {
  score: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyExpenses: number;
  dataComplete: boolean;
  calculatedAt: string;
}

interface PeakScoreRow {
  id: string;
  user_id: string;
  score: number;
  is_snapshot: boolean;
  calculated_at: string;
}

/**
 * Core PeakScore calculation.
 * PeakScore = months of financial autonomy = net_worth / monthly_expenses
 */
async function computePeakScore(userId: string): Promise<PeakScoreResult> {
  // 1. Fetch assets
  const { data: assets } = await supabase
    .from('net_worth_assets')
    .select('value')
    .eq('user_id', userId);

  const totalAssets = (assets || []).reduce((sum, a) => sum + Number(a.value || 0), 0);

  // 2. Fetch liabilities
  const { data: liabilities } = await supabase
    .from('net_worth_liabilities')
    .select('amount')
    .eq('user_id', userId);

  const totalLiabilities = (liabilities || []).reduce((sum, l) => sum + Number(l.amount || 0), 0);

  // 3. Determine monthly expenses
  // Try average of last 3 months from budget_expenses first
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const { data: recentExpenses } = await supabase
    .from('budget_expenses')
    .select('amount, expense_date')
    .eq('user_id', userId)
    .gte('expense_date', threeMonthsAgo.toISOString().slice(0, 10));

  let monthlyExpenses = 0;
  let dataComplete = false;

  if (recentExpenses && recentExpenses.length >= 3) {
    // Group by month and average
    const monthMap = new Map<string, number>();
    for (const e of recentExpenses) {
      const monthKey = e.expense_date.slice(0, 7); // YYYY-MM
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + Number(e.amount || 0));
    }
    if (monthMap.size > 0) {
      const totalMonthly = Array.from(monthMap.values()).reduce((a, b) => a + b, 0);
      monthlyExpenses = totalMonthly / monthMap.size;
      dataComplete = true;
    }
  }

  // Fallback to meta_profiles fixed_costs
  if (monthlyExpenses <= 0) {
    const { data: meta } = await supabase
      .from('meta_profiles')
      .select('fixed_costs')
      .eq('user_id', userId)
      .maybeSingle();

    if (meta && Number(meta.fixed_costs) > 0) {
      monthlyExpenses = Number(meta.fixed_costs);
      dataComplete = true;
    }
  }

  // Calculate score
  const netWorth = Math.max(0, totalAssets - totalLiabilities);
  const score = monthlyExpenses > 0 ? Math.max(0, Math.round((netWorth / monthlyExpenses) * 10) / 10) : 0;

  return {
    score,
    totalAssets,
    totalLiabilities,
    monthlyExpenses,
    dataComplete: dataComplete && (totalAssets > 0 || totalLiabilities > 0),
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Save calculated score to peak_scores table.
 * Upserts the "current" (non-snapshot) record for today.
 */
async function savePeakScore(userId: string, score: number, isSnapshot = false): Promise<void> {
  const { error } = await supabase.from('peak_scores').insert({
    user_id: userId,
    score,
    is_snapshot: isSnapshot,
  });
  if (error) console.error('[PeakScore] Save failed:', error);
}

/**
 * Check if a monthly snapshot should be created (1st of month, once per month).
 */
async function maybeCreateMonthlySnapshot(userId: string, score: number): Promise<void> {
  const now = new Date();
  if (now.getDate() !== 1) return; // Only on 1st of month

  const monthKey = now.toISOString().slice(0, 7); // YYYY-MM
  const startOfMonth = `${monthKey}-01T00:00:00Z`;
  const endOfMonth = `${monthKey}-02T00:00:00Z`;

  const { data: existing } = await supabase
    .from('peak_scores')
    .select('id')
    .eq('user_id', userId)
    .eq('is_snapshot', true)
    .gte('calculated_at', startOfMonth)
    .lt('calculated_at', endOfMonth)
    .limit(1);

  if (!existing || existing.length === 0) {
    await savePeakScore(userId, score, true);
  }
}

/**
 * Check if score was already calculated today to avoid spamming on login.
 */
async function wasCalculatedToday(userId: string): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('peak_scores')
    .select('id')
    .eq('user_id', userId)
    .eq('is_snapshot', false)
    .gte('calculated_at', `${today}T00:00:00Z`)
    .limit(1);
  return (data && data.length > 0) || false;
}

// ── Hooks ──────────────────────────────────────────────────

/**
 * Read the latest PeakScore for the current user.
 */
export function usePeakScore() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['peak-score', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('peak_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_snapshot', false)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as PeakScoreRow | null;
    },
    enabled: !!user,
  });
}

/**
 * Read monthly snapshot history for charts.
 */
export function usePeakScoreHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['peak-score-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('peak_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_snapshot', true)
        .order('calculated_at', { ascending: true });

      if (error) throw error;
      return (data || []) as PeakScoreRow[];
    },
    enabled: !!user,
  });
}

/**
 * Mutation to trigger PeakScore recalculation.
 * Call this after asset/liability/expense/profile changes.
 */
export function useRecalculatePeakScore() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const result = await computePeakScore(user.id);
      await savePeakScore(user.id, result.score);
      await maybeCreateMonthlySnapshot(user.id, result.score);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peak-score'] });
      queryClient.invalidateQueries({ queryKey: ['peak-score-history'] });
    },
  });
}

/**
 * Trigger a daily recalculation on login (once per day).
 */
export function usePeakScoreDailyCheck() {
  const { user } = useAuth();
  const recalculate = useRecalculatePeakScore();

  const checkAndRecalculate = useCallback(async () => {
    if (!user) return;
    const alreadyDone = await wasCalculatedToday(user.id);
    if (!alreadyDone) {
      recalculate.mutate();
    }
  }, [user, recalculate]);

  return checkAndRecalculate;
}
