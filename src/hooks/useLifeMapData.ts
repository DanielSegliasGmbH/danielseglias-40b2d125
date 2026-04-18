import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface LifeMapTerritory {
  key: 'vermoegen' | 'absicherung' | 'vorsorge' | 'cashflow' | 'wissen' | 'ziele';
  label: string;
  emoji: string;
  /** HSL color token name from index.css; we fall back to inline HSL where needed */
  colorVar: string;
  /** Hex/HSL fallback for glow */
  glow: string;
  /** 0..1 progress */
  progress: number;
  /** target route */
  path: string;
}

export interface LifeMapData {
  territories: LifeMapTerritory[];
  exploredPercent: number;
  unlockedCount: number;
  isLoading: boolean;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function useLifeMapData(): LifeMapData {
  const { user } = useAuth();
  const uid = user?.id;

  const { data: assets = 0 } = useQuery({
    queryKey: ['lifemap-assets', uid],
    queryFn: async () => {
      const { count } = await supabase
        .from('net_worth_assets')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid!);
      return count || 0;
    },
    enabled: !!uid,
  });

  const { data: insurances = 0 } = useQuery({
    queryKey: ['lifemap-insurances', uid],
    queryFn: async () => {
      const { count } = await supabase
        .from('customer_products')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid!);
      return count || 0;
    },
    enabled: !!uid,
  });

  const { data: snapshot } = useQuery({
    queryKey: ['lifemap-snapshot', uid],
    queryFn: async () => {
      const { data } = await supabase
        .from('financial_snapshots')
        .select('snapshot_data')
        .eq('user_id', uid!)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return (data?.snapshot_data as Record<string, unknown>) || null;
    },
    enabled: !!uid,
  });

  const { data: expenseCount = 0 } = useQuery({
    queryKey: ['lifemap-expenses', uid],
    queryFn: async () => {
      const { count } = await supabase
        .from('budget_expenses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid!);
      return count || 0;
    },
    enabled: !!uid,
  });

  const { data: articleReads = 0 } = useQuery({
    queryKey: ['lifemap-articles', uid],
    queryFn: async () => {
      const { count } = await supabase
        .from('article_reads')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid!);
      return count || 0;
    },
    enabled: !!uid,
  });

  const { data: goals = { total: 0, done: 0 } } = useQuery({
    queryKey: ['lifemap-goals', uid],
    queryFn: async () => {
      const { data } = await supabase
        .from('client_goals')
        .select('is_completed')
        .eq('user_id', uid!);
      const total = data?.length || 0;
      const done = data?.filter((g) => g.is_completed).length || 0;
      return { total, done };
    },
    enabled: !!uid,
  });

  // Vorsorge progress from snapshot: 3a + PK + Freizügigkeit
  const pillar3aFilled = !!(snapshot?.['pillar_3a'] as Record<string, unknown>)?.amount;
  const pkFilled = !!(snapshot?.['pension_fund'] as Record<string, unknown>)?.amount;
  const fzFilled = !!(snapshot?.['vested_benefits'] as Record<string, unknown>)?.amount;
  const vorsorgeFilled = [pillar3aFilled, pkFilled, fzFilled].filter(Boolean).length;

  // Cashflow progress: savings rate vs 20% target (placeholder; uses snapshot if available)
  const monthlyIncome = Number((snapshot?.['monthly_income'] as Record<string, unknown>)?.amount || 0);
  const monthlySavings = Number((snapshot?.['monthly_savings'] as Record<string, unknown>)?.amount || 0);
  const savingsRate = monthlyIncome > 0 ? monthlySavings / monthlyIncome : 0;
  const cashflowProgress = expenseCount >= 5 ? clamp01(savingsRate / 0.2) : 0;

  const territories: LifeMapTerritory[] = [
    {
      key: 'vermoegen',
      label: 'Vermögen',
      emoji: '💰',
      colorVar: '142 71% 45%',
      glow: 'hsl(142 71% 45% / 0.55)',
      progress: clamp01(assets / 5),
      path: '/app/client-portal/net-worth',
    },
    {
      key: 'absicherung',
      label: 'Absicherung',
      emoji: '🛡️',
      colorVar: '212 92% 55%',
      glow: 'hsl(212 92% 55% / 0.55)',
      progress: clamp01(insurances / 5),
      path: '/app/client-portal/insurances',
    },
    {
      key: 'vorsorge',
      label: 'Vorsorge',
      emoji: '🏦',
      colorVar: '42 92% 52%',
      glow: 'hsl(42 92% 52% / 0.55)',
      progress: clamp01(vorsorgeFilled / 3),
      path: '/app/client-portal/snapshot',
    },
    {
      key: 'cashflow',
      label: 'Cashflow',
      emoji: '📊',
      colorVar: '82 55% 42%',
      glow: 'hsl(82 55% 42% / 0.55)',
      progress: cashflowProgress,
      path: '/app/client-portal/budget',
    },
    {
      key: 'wissen',
      label: 'Wissen',
      emoji: '🧠',
      colorVar: '276 70% 60%',
      glow: 'hsl(276 70% 60% / 0.55)',
      progress: clamp01(articleReads / 10),
      path: '/app/client-portal/library',
    },
    {
      key: 'ziele',
      label: 'Ziele',
      emoji: '🎯',
      colorVar: '24 95% 58%',
      glow: 'hsl(24 95% 58% / 0.55)',
      progress: goals.total > 0 ? clamp01(goals.done / goals.total) : 0,
      path: '/app/client-portal/goals',
    },
  ];

  // Override: territory is "unlocked" (>0) ONLY if its trigger condition holds.
  // For ziele, the trigger is "at least 1 goal created" — so even with 0 completed,
  // if total>0 we want to show the territory as discovered (min 0.1 progress).
  if (goals.total > 0 && territories[5].progress === 0) territories[5].progress = 0.1;
  // Same for cashflow: if 5+ expenses logged but savings rate unknown, show min 0.1
  if (expenseCount >= 5 && territories[3].progress === 0) territories[3].progress = 0.1;
  // Absicherung: ab 1. erfasstem Produkt min 0.1 Progress (Territorium freigeschaltet)
  if (insurances > 0 && territories[1].progress < 0.1) territories[1].progress = 0.1;

  const exploredPercent = Math.round(
    (territories.reduce((s, t) => s + t.progress, 0) / territories.length) * 100,
  );
  const unlockedCount = territories.filter((t) => t.progress > 0).length;

  return {
    territories,
    exploredPercent,
    unlockedCount,
    isLoading: !uid,
  };
}
