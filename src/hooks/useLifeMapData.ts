import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export interface LifeMapTerritory {
  key: 'vermoegen' | 'absicherung' | 'vorsorge' | 'cashflow' | 'wissen' | 'leben';
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
  const { profile } = useProfile();
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

  const { data: goalsData } = useQuery({
    queryKey: ['lifemap-goals', uid],
    queryFn: async () => {
      const { data } = await supabase
        .from('client_goals')
        .select('current_amount, target_amount, is_completed')
        .eq('user_id', uid!);
      return data || [];
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

  // Vorsorge progress from snapshot: 3a + PK + Freizügigkeit
  const pillar3aFilled = !!(snapshot?.['pillar_3a'] as Record<string, unknown>)?.amount;
  const pkFilled = !!(snapshot?.['pension_fund'] as Record<string, unknown>)?.amount;
  const fzFilled = !!(snapshot?.['vested_benefits'] as Record<string, unknown>)?.amount;
  const vorsorgeFilled = [pillar3aFilled, pkFilled, fzFilled].filter(Boolean).length;

  // Ziele progress: average completion ratio across goals
  const goals = goalsData || [];
  let zieleProgress = 0;
  if (goals.length > 0) {
    const ratios = goals.map((g) => {
      if (g.is_completed) return 1;
      const target = Number(g.target_amount || 0);
      const current = Number(g.current_amount || 0);
      return target > 0 ? clamp01(current / target) : 0.1;
    });
    zieleProgress = clamp01(ratios.reduce((s, r) => s + r, 0) / ratios.length);
    if (zieleProgress < 0.1) zieleProgress = 0.1;
  }

  // Budget & Vermögen — combined progress (assets + budget entries)
  const assetScore = clamp01(assets / 5);
  const budgetScore = clamp01(expenseCount / 10);
  const vermoegenProgress = (assetScore + budgetScore) / 2;

  // Mein Leben — discovered with basic profile data; grows with humankapital tool use
  const hasBasicLifeData = !!(profile?.age && profile?.monthlyIncome);
  const lebenProgress = hasBasicLifeData ? 0.5 : 0;

  const territories: LifeMapTerritory[] = [
    {
      key: 'vermoegen',
      label: 'Budget & Vermögen',
      emoji: '💰',
      colorVar: '142 71% 45%',
      glow: 'hsl(142 71% 45% / 0.55)',
      progress: vermoegenProgress,
      path: '/app/client-portal/budget',
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
      key: 'ziele',
      label: 'Ziele',
      emoji: '🎯',
      colorVar: '82 55% 42%',
      glow: 'hsl(82 55% 42% / 0.55)',
      progress: zieleProgress,
      path: '/app/client-portal/goals',
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
      key: 'leben',
      label: 'Mein Leben',
      emoji: '📈',
      colorVar: '200 80% 50%',
      glow: 'hsl(200 80% 50% / 0.55)',
      progress: lebenProgress,
      path: '/app/client-portal/tools/humankapital',
    },
  ];

  // Same for cashflow: if 5+ expenses logged but savings rate unknown, show min 0.1
  if (expenseCount >= 5 && territories[3].progress === 0) territories[3].progress = 0.1;
  // Absicherung: ab 1. erfasstem Produkt min 0.1 Progress
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
