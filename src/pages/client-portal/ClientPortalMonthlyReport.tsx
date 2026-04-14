import { useState, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, Check, X, Share2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getPrevMonthKey(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return getMonthKey(d);
}

function getMonthRange(monthKey: string) {
  const [y, m] = monthKey.split('-').map(Number);
  const start = `${monthKey}-01`;
  const end = new Date(y, m, 0).toISOString().slice(0, 10);
  return { start, end };
}

function fmtCHF(v: number) {
  return `CHF ${v.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function ClientPortalMonthlyReport() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const shareRef = useRef<HTMLDivElement>(null);

  const monthKey = getMonthKey(currentDate);
  const prevMonthKey = getPrevMonthKey(monthKey);
  const [y, m] = monthKey.split('-').map(Number);
  const monthLabel = `${MONTHS[m - 1]} ${y}`;
  const { start, end } = getMonthRange(monthKey);
  const prevRange = getMonthRange(prevMonthKey);

  const navigate = (dir: number) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + dir);
      return d;
    });
  };

  // Income from meta_profiles
  const { data: metaProfile } = useQuery({
    queryKey: ['report-meta', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from('meta_profiles').select('monthly_income').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Expenses current month
  const { data: expenses = [] } = useQuery({
    queryKey: ['report-expenses', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('budget_expenses').select('amount, category').eq('user_id', user.id).gte('expense_date', start).lte('expense_date', end);
      return data || [];
    },
    enabled: !!user,
  });

  // Expenses previous month
  const { data: prevExpenses = [] } = useQuery({
    queryKey: ['report-expenses-prev', user?.id, prevMonthKey],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('budget_expenses').select('amount, category').eq('user_id', user.id).gte('expense_date', prevRange.start).lte('expense_date', prevRange.end);
      return data || [];
    },
    enabled: !!user,
  });

  // Budget categories current month
  const { data: budgets = [] } = useQuery({
    queryKey: ['report-budgets', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('budget_categories').select('category, amount').eq('user_id', user.id).eq('month', monthKey);
      return data || [];
    },
    enabled: !!user,
  });

  // Gamification actions this month
  const { data: gamActions = [] } = useQuery({
    queryKey: ['report-gam', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('gamification_actions').select('action_type, points_awarded').eq('user_id', user.id).gte('created_at', `${start}T00:00:00`).lte('created_at', `${end}T23:59:59`);
      return data || [];
    },
    enabled: !!user,
  });

  // Tasks completed this month
  const { data: tasksCompleted = 0 } = useQuery({
    queryKey: ['report-tasks', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase.from('client_tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_completed', true).gte('completed_at', `${start}T00:00:00`).lte('completed_at', `${end}T23:59:59`);
      return count || 0;
    },
    enabled: !!user,
  });

  // Goals
  const { data: goals = [] } = useQuery({
    queryKey: ['report-goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('client_goals').select('title, current_amount, target_amount').eq('user_id', user.id).eq('is_completed', false);
      return data || [];
    },
    enabled: !!user,
  });

  // Streak
  const { data: streakDays = 0 } = useQuery({
    queryKey: ['report-streak', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data } = await supabase.from('gamification_actions').select('created_at').eq('user_id', user.id).eq('action_type', 'daily_login').order('created_at', { ascending: false }).limit(60);
      if (!data || data.length === 0) return 0;
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const loginDays = new Set(data.map((d: any) => new Date(d.created_at).toISOString().slice(0, 10)));
      for (let i = 0; i < 60; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (loginDays.has(d.toISOString().slice(0, 10))) streak++;
        else if (i > 0) break;
      }
      return streak;
    },
    enabled: !!user,
  });

  // Computed values
  const income = metaProfile?.monthly_income || 0;
  const totalExpenses = useMemo(() => expenses.reduce((s: number, e: any) => s + Number(e.amount), 0), [expenses]);
  const prevTotalExpenses = useMemo(() => prevExpenses.reduce((s: number, e: any) => s + Number(e.amount), 0), [prevExpenses]);
  const netSavings = income - totalExpenses;
  const prevNetSavings = income - prevTotalExpenses;
  const savingsRate = income > 0 ? Math.round((netSavings / income) * 100) : 0;
  const prevSavingsRate = income > 0 ? Math.round((prevNetSavings / income) * 100) : 0;
  const savingsTrend = savingsRate > prevSavingsRate ? 'up' : savingsRate < prevSavingsRate ? 'down' : 'same';

  // Budget performance
  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e: any) => { map[e.category] = (map[e.category] || 0) + Number(e.amount); });
    return map;
  }, [expenses]);

  const budgetPerformance = useMemo(() => {
    return budgets.map((b: any) => {
      const spent = expensesByCategory[b.category] || 0;
      const budget = Number(b.amount);
      return { category: b.category, budget, spent, over: spent > budget };
    }).filter(b => b.budget > 0);
  }, [budgets, expensesByCategory]);

  const biggestCategory = useMemo(() => {
    let max = { category: '', amount: 0 };
    Object.entries(expensesByCategory).forEach(([cat, amt]) => {
      if (amt > max.amount) max = { category: cat, amount: amt };
    });
    return max;
  }, [expensesByCategory]);

  // XP this month
  const xpThisMonth = useMemo(() => gamActions.reduce((s: number, a: any) => s + Number(a.points_awarded), 0), [gamActions]);

  // Motivation message
  const motivationMessage = savingsRate >= 20
    ? 'Ausgezeichnet! Du sparst überdurchschnittlich gut. 🎉'
    : savingsRate >= 10
    ? 'Solide! Du bist auf dem richtigen Weg. 💪'
    : 'Diesen Monat war es eng – nächsten Monat packst du es! 🚀';

  // Share / screenshot
  const handleShare = async () => {
    if (!shareRef.current) return;
    try {
      const canvas = await html2canvas(shareRef.current, { backgroundColor: null, scale: 2 });
      canvas.toBlob(blob => {
        if (!blob) return;
        if (navigator.share && navigator.canShare?.({ files: [new File([blob], 'monatsbericht.png', { type: 'image/png' })] })) {
          navigator.share({ files: [new File([blob], 'monatsbericht.png', { type: 'image/png' })], title: `Monatsbericht ${monthLabel}` });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `monatsbericht-${monthKey}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Bericht heruntergeladen');
        }
      });
    } catch {
      toast.error('Screenshot konnte nicht erstellt werden');
    }
  };

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">{monthLabel}</h1>
          <Button variant="ghost" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Shareable Card */}
        <div ref={shareRef}>
          {/* 1. ZUSAMMENFASSUNG */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-foreground text-background">
              <CardContent className="p-5 space-y-4">
                <p className="text-[11px] uppercase tracking-wider opacity-60">Zusammenfassung</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] opacity-60">Einkommen</p>
                    <p className="text-lg font-bold">{fmtCHF(income)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] opacity-60">Ausgaben</p>
                    <p className="text-lg font-bold">{fmtCHF(totalExpenses)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-background/10">
                  <div>
                    <p className="text-[11px] opacity-60">Netto-Ersparnis</p>
                    <p className="text-xl font-bold">{fmtCHF(netSavings)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{savingsRate}%</span>
                    {savingsTrend === 'up' && <TrendingUp className="h-4 w-4 text-green-400" />}
                    {savingsTrend === 'down' && <TrendingDown className="h-4 w-4 text-red-400" />}
                    {savingsTrend === 'same' && <Minus className="h-4 w-4 opacity-50" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 2. BUDGET PERFORMANCE */}
          {budgetPerformance.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-4">
              <Card>
                <CardContent className="p-5 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Budget-Performance</p>
                  <div className="space-y-2">
                    {budgetPerformance.map((bp) => (
                      <div key={bp.category} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {bp.over
                            ? <X className="h-4 w-4 text-destructive" />
                            : <Check className="h-4 w-4 text-green-500" />}
                          <span className="text-foreground">{bp.category}</span>
                        </div>
                        <span className={cn('font-mono text-xs', bp.over ? 'text-destructive' : 'text-muted-foreground')}>
                          {fmtCHF(bp.spent)} / {fmtCHF(bp.budget)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {biggestCategory.category && (
                    <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                      Grösste Kategorie: <span className="font-medium text-foreground">{biggestCategory.category}</span> ({fmtCHF(biggestCategory.amount)})
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 3. FORTSCHRITT */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4">
            <Card>
              <CardContent className="p-5 space-y-3">
                <p className="text-sm font-semibold text-foreground">Fortschritt</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-lg font-bold text-foreground">{xpThisMonth}</p>
                    <p className="text-[10px] text-muted-foreground">XP verdient</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-lg font-bold text-foreground">{tasksCompleted}</p>
                    <p className="text-[10px] text-muted-foreground">Aufgaben erledigt</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-lg font-bold text-foreground">🔥 {streakDays}</p>
                    <p className="text-[10px] text-muted-foreground">Tage Streak</p>
                  </div>
                </div>
                {goals.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground font-medium">Ziel-Fortschritt</p>
                    {goals.map((g: any) => {
                      const pct = g.target_amount && g.target_amount > 0
                        ? Math.min(100, Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100))
                        : 0;
                      return (
                        <div key={g.title} className="flex items-center justify-between text-sm">
                          <span className="text-foreground truncate mr-2">{g.title}</span>
                          <span className="font-mono text-xs text-muted-foreground shrink-0">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 4. MOTIVATION */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-4">
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-5 text-center">
                <p className="text-base font-semibold text-foreground">{motivationMessage}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 5. SHARE BUTTON */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Button onClick={handleShare} variant="outline" className="w-full gap-2">
            <Share2 className="h-4 w-4" />
            Bericht teilen / herunterladen
          </Button>
        </motion.div>
      </div>
    </ClientPortalLayout>
  );
}
