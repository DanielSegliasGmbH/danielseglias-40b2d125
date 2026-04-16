import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const FREQUENCY_DIVISORS: Record<string, number> = {
  monatlich: 1,
  quartalsweise: 3,
  halbjaehrlich: 6,
  jaehrlich: 12,
};

function toMonthly(amount: number, frequency: string): number {
  return amount / (FREQUENCY_DIVISORS[frequency] || 1);
}

export interface CashflowItem {
  label: string;
  monthlyAmount: number;
  source: 'profil' | 'snapshot' | 'fixkosten' | 'manuell';
  sourceLabel: string;
  frequency?: string;
  id?: string;
}

export interface CashflowConflict {
  field: string;
  label: string;
  profilValue: number;
  snapshotValue: number;
}

export interface CashflowData {
  // Income
  jobIncome: number;
  jobIncomeSource: 'profil';
  passiveIncomeItems: CashflowItem[];
  passiveIncomeTotal: number;
  totalIncome: number;

  // Expenses
  fixedExpenseItems: CashflowItem[];
  fixedExpensesTotal: number;
  liabilityItems: CashflowItem[];
  liabilityTotal: number;
  variableExpensesTotal: number;
  totalExpenses: number;

  // Result
  cashflow: number;

  // Rich Dad
  freedomPercent: number;
  isFinanciallyFree: boolean;

  // Conflicts
  conflicts: CashflowConflict[];

  // Loading
  isLoading: boolean;
}

export function useCashflowData(selectedMonth?: string): CashflowData {
  const { user } = useAuth();

  // 1. Finanzprofil (master for income + base fixed costs)
  const { data: metaProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ['meta-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('meta_profiles')
        .select('monthly_income, fixed_costs')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // 2. Passive income sources (income_sources table)
  const { data: incomeSources = [], isLoading: loadingIncome } = useQuery({
    queryKey: ['income-sources', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // 3. Fixed expenses (fixed_expenses table)
  const { data: fixedExpenses = [], isLoading: loadingFixed } = useQuery({
    queryKey: ['fixed-expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('fixed_expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // 4. Liabilities from Snapshot (net_worth_liabilities)
  const { data: snapshotLiabilities = [], isLoading: loadingLiab } = useQuery({
    queryKey: ['snapshot-liabilities-cashflow', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('net_worth_liabilities')
        .select('id, name, amount, monthly_payment')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // 5. Variable expenses for current/selected month
  const monthKey = selectedMonth || getCurrentMonthKey();
  const { data: variableExpenses = [], isLoading: loadingVar } = useQuery({
    queryKey: ['expenses', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return [];
      const startDate = `${monthKey}-01`;
      const [y, m] = monthKey.split('-').map(Number);
      const endDate = new Date(y, m, 0).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('budget_expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_recurring', false)
        .gte('expense_date', startDate)
        .lte('expense_date', endDate)
        .order('expense_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // 6. Latest snapshot for conflict detection
  const { data: latestSnapshot, isLoading: loadingSnap } = useQuery({
    queryKey: ['latest-snapshot-conflict', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('financial_snapshots')
        .select('snapshot_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data?.snapshot_data as any || null;
    },
    enabled: !!user,
  });

  return useMemo(() => {
    const jobIncome = metaProfile?.monthly_income || 0;

    // Passive income items
    const passiveIncomeItems: CashflowItem[] = incomeSources.map((s: any) => ({
      label: s.name,
      monthlyAmount: toMonthly(Number(s.amount), s.frequency),
      source: 'manuell' as const,
      sourceLabel: 'Manuell erfasst',
      frequency: s.frequency,
      id: s.id,
    }));
    const passiveIncomeTotal = passiveIncomeItems.reduce((s, i) => s + i.monthlyAmount, 0);
    const totalIncome = jobIncome + passiveIncomeTotal;

    // Fixed expense items
    const fixedExpenseItems: CashflowItem[] = fixedExpenses.map((f: any) => ({
      label: f.name,
      monthlyAmount: toMonthly(Number(f.amount), f.frequency),
      source: 'fixkosten' as const,
      sourceLabel: 'Fixkosten',
      frequency: f.frequency,
      id: f.id,
    }));
    const fixedExpensesTotal = fixedExpenseItems.reduce((s, i) => s + i.monthlyAmount, 0);

    // Liability items from snapshot — use monthly_payment if available, else estimate
    const liabilityItems: CashflowItem[] = snapshotLiabilities.map((l: Record<string, unknown>) => ({
      label: String(l.name),
      monthlyAmount: Number(l.monthly_payment || 0) > 0
        ? Number(l.monthly_payment)
        : Math.round(Number(l.amount || 0) / 120),
      source: 'snapshot' as const,
      sourceLabel: 'Aus Snapshot',
      id: String(l.id),
    }));
    const liabilityTotal = liabilityItems.reduce((s, i) => s + i.monthlyAmount, 0);

    // Variable
    const variableExpensesTotal = variableExpenses.reduce((s: number, e: any) => s + Number(e.amount), 0);

    const totalExpenses = fixedExpensesTotal + liabilityTotal + variableExpensesTotal;
    const cashflow = totalIncome - totalExpenses;

    // Rich Dad
    const freedomPercent = jobIncome > 0
      ? Math.min(Math.round((passiveIncomeTotal / jobIncome) * 100), 999)
      : passiveIncomeTotal > 0 ? 100 : 0;
    const isFinanciallyFree = passiveIncomeTotal >= jobIncome && jobIncome > 0;

    // Conflict detection
    const conflicts: CashflowConflict[] = [];
    if (latestSnapshot && metaProfile) {
      const snapIncome = Number(latestSnapshot?.monthly_income?.amount || 0);
      if (snapIncome > 0 && jobIncome > 0 && Math.abs(snapIncome - jobIncome) > 50) {
        conflicts.push({
          field: 'monthly_income',
          label: 'Monatliches Einkommen',
          profilValue: jobIncome,
          snapshotValue: snapIncome,
        });
      }
    }

    return {
      jobIncome,
      jobIncomeSource: 'profil' as const,
      passiveIncomeItems,
      passiveIncomeTotal,
      totalIncome,
      fixedExpenseItems,
      fixedExpensesTotal,
      liabilityItems,
      liabilityTotal,
      variableExpensesTotal,
      totalExpenses,
      cashflow,
      freedomPercent,
      isFinanciallyFree,
      conflicts,
      isLoading: loadingProfile || loadingIncome || loadingFixed || loadingLiab || loadingVar || loadingSnap,
    };
  }, [metaProfile, incomeSources, fixedExpenses, snapshotLiabilities, variableExpenses, latestSnapshot,
      loadingProfile, loadingIncome, loadingFixed, loadingLiab, loadingVar, loadingSnap]);
}

function getCurrentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
