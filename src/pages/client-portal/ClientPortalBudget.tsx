import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/PageTransition';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ChevronLeft, ChevronRight, Pencil, Wallet, TrendingDown, PiggyBank, Percent, Trash2, RefreshCw, ArrowLeftRight } from 'lucide-react';
import { PrivateValue } from '@/components/client-portal/PrivateValue';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useGamification } from '@/hooks/useGamification';
import { usePeakScore } from '@/hooks/usePeakScore';
import { PeakScoreImpact } from '@/components/client-portal/PeakScoreImpact';
import { CashflowTab } from '@/components/client-portal/CashflowTab';
import { useCashflowData } from '@/hooks/useCashflowData';

const CATEGORIES = [
  'Wohnen',
  'Essen & Trinken',
  'Transport',
  'Freizeit',
  'Gesundheit',
  'Sparen',
  'Sonstiges',
] as const;

type Category = typeof CATEGORIES[number];

const CATEGORY_ICONS: Record<Category, string> = {
  'Wohnen': '🏠',
  'Essen & Trinken': '🍽️',
  'Transport': '🚗',
  'Freizeit': '🎯',
  'Gesundheit': '💊',
  'Sparen': '💰',
  'Sonstiges': '📦',
};

const FIXED_CATEGORIES = [
  'Miete',
  'Krankenkasse',
  'Versicherungen',
  'Abos & Streaming',
  'Steuern',
  'Leasing / Kredit',
  'Internet & Handy',
  'Sonstiges',
] as const;

function getMonthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return getMonthKey(d);
}

function getStatusColor(spent: number, budget: number): string {
  if (budget <= 0) return 'bg-muted';
  const ratio = spent / budget;
  if (ratio >= 1) return 'bg-destructive';
  if (ratio >= 0.8) return 'bg-orange-500';
  return 'bg-primary';
}

function getStatusText(spent: number, budget: number): string {
  if (budget <= 0) return 'Kein Budget';
  const ratio = spent / budget;
  if (ratio >= 1) return 'Überschritten';
  if (ratio >= 0.8) return 'Fast erreicht';
  return 'Im Rahmen';
}

const FREQUENCY_OPTIONS = [
  { value: 'monatlich', label: 'Monatlich', divisor: 1 },
  { value: 'quartalsweise', label: 'Quartalsweise', divisor: 3 },
  { value: 'halbjaehrlich', label: 'Halbjährlich', divisor: 6 },
  { value: 'jaehrlich', label: 'Jährlich', divisor: 12 },
];

function toMonthly(amount: number, frequency: string): number {
  const opt = FREQUENCY_OPTIONS.find(f => f.value === frequency);
  return opt ? amount / opt.divisor : amount;
}

function frequencyLabel(frequency: string): string {
  return FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label || frequency;
}

function fmtCHF(v: number): string {
  return `CHF ${Math.round(v).toLocaleString('de-CH')}`;
}

export default function ClientPortalBudget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { awardPoints } = useGamification();
  const { monthlyExpenses } = usePeakScore();
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey());
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [fixedDialogOpen, setFixedDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [lastExpenseImpact, setLastExpenseImpact] = useState<number | null>(null);
  const [showExpenseImpact, setShowExpenseImpact] = useState(false);

  // Variable expense form
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<string>(CATEGORIES[0]);
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expNote, setExpNote] = useState('');

  // Fixed expense form
  const [fixName, setFixName] = useState('');
  const [fixAmount, setFixAmount] = useState('');
  const [fixCategory, setFixCategory] = useState<string>(FIXED_CATEGORIES[0]);
  const [fixFrequency, setFixFrequency] = useState('monatlich');

  // Budget edit state
  const [budgetAmounts, setBudgetAmounts] = useState<Record<string, string>>({});

  const [activeTab, setActiveTab] = useState('budget');

  // ── Unified cashflow data (single source of truth for totals & cashflow tab) ──
  const cashflowData = useCashflowData(selectedMonth);
  const monthlyIncome = cashflowData.jobIncome;
  const totalFixedMonthly = cashflowData.fixedExpensesTotal;
  const totalVariable = cashflowData.variableExpensesTotal;

  // ── Raw fixed expenses for CRUD in budget tab ──
  const { data: fixedExpensesRaw = [] } = useQuery({
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

  // ── Fetch budgets for selected month ──
  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets', user?.id, selectedMonth],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', selectedMonth);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // ── Fetch variable expenses for display ──
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', user?.id, selectedMonth],
    queryFn: async () => {
      if (!user) return [];
      const startDate = `${selectedMonth}-01`;
      const [y, m] = selectedMonth.split('-').map(Number);
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

  // ── Fixed expense mutations ──
  const addFixed = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('fixed_expenses').insert({
        user_id: user.id,
        name: fixName,
        amount: parseFloat(fixAmount),
        category: fixCategory,
        frequency: fixFrequency,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
      toast.success('Fixkosten hinzugefügt ✓');
      setFixName(''); setFixAmount(''); setFixCategory(FIXED_CATEGORIES[0]); setFixFrequency('monatlich');
      setFixedDialogOpen(false);
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });

  const deleteFixed = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fixed_expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
      toast.success('Fixkosten gelöscht');
    },
  });

  // ── Variable expense mutations ──
  const addExpense = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('budget_expenses').insert({
        user_id: user.id,
        category: expCategory,
        amount: parseFloat(expAmount),
        expense_date: expDate,
        note: expNote || null,
        is_recurring: false,
        recurring_frequency: null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      const amt = parseFloat(expAmount);
      const impact = monthlyExpenses > 0 ? -(amt / monthlyExpenses) : null;
      setLastExpenseImpact(impact ? Math.round(impact * 10) / 10 : null);
      setShowExpenseImpact(true);
      setTimeout(() => setShowExpenseImpact(false), 4000);
      toast.success('Ausgabe erfasst ✓');
      awardPoints('expense_added', `expense_${Date.now()}`);
      setExpAmount(''); setExpNote(''); setExpDate(new Date().toISOString().slice(0, 10));
      setExpenseDialogOpen(false);
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budget_expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Ausgabe gelöscht');
    },
  });

  // ── Save budgets ──
  const saveBudgets = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const upserts = CATEGORIES.map(cat => ({
        user_id: user.id,
        month: selectedMonth,
        category: cat,
        amount: parseFloat(budgetAmounts[cat] || '0') || 0,
      }));
      const { error } = await supabase
        .from('budget_categories')
        .upsert(upserts, { onConflict: 'user_id,month,category' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget gespeichert ✓');
      setBudgetDialogOpen(false);
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });

  const openBudgetDialog = () => {
    const amounts: Record<string, string> = {};
    CATEGORIES.forEach(cat => {
      const existing = budgets.find((b: any) => b.category === cat);
      amounts[cat] = existing ? String(existing.amount) : '';
    });
    setBudgetAmounts(amounts);
    setBudgetDialogOpen(true);
  };

  // ── Calculations (use unified data for totals) ──
  const totalMonthlyExpenses = totalFixedMonthly + totalVariable;
  const remaining = monthlyIncome - totalMonthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round((remaining / monthlyIncome) * 100) : 0;

  const categorySpending = useMemo(() => {
    const map: Record<string, number> = {};
    CATEGORIES.forEach(c => { map[c] = 0; });
    expenses.forEach((e: any) => {
      if (map[e.category] !== undefined) {
        map[e.category] += Number(e.amount);
      }
    });
    return map;
  }, [expenses]);

  const totalBudget = useMemo(() => budgets.reduce((s: number, b: any) => s + Number(b.amount), 0), [budgets]);

  return (
    <ClientPortalLayout>
      <ScreenHeader title="💰 Mein Budget" backTo="/app/client-portal" />
      <PageTransition>
      <div className="max-w-2xl mx-auto space-y-5">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="budget" className="flex-1 gap-1.5">
              <Wallet className="h-3.5 w-3.5" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="flex-1 gap-1.5">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Cashflow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cashflow" className="mt-4">
            <CashflowTab cashflowData={cashflowData} />
          </TabsContent>

          <TabsContent value="budget" className="mt-4 space-y-5">
            {/* Month navigator */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-bold text-foreground">{formatMonthLabel(selectedMonth)}</h1>
              <Button variant="ghost" size="icon" onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <PeakScoreImpact impact={lastExpenseImpact} show={showExpenseImpact} context="expense" className="px-1" />

            {/* Monthly summary */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="grid grid-cols-2 gap-3 pt-5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Wallet className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Einkommen</p>
                      <PrivateValue className="text-sm font-bold text-foreground">
                        {monthlyIncome > 0 ? fmtCHF(monthlyIncome) : '–'}
                      </PrivateValue>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Ausgaben gesamt</p>
                      <PrivateValue className="text-sm font-bold text-foreground">{fmtCHF(totalMonthlyExpenses)}</PrivateValue>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <PiggyBank className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Übrig</p>
                      <PrivateValue className={cn("text-sm font-bold", remaining >= 0 ? "text-foreground" : "text-destructive")}>
                        {fmtCHF(remaining)}
                      </PrivateValue>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Percent className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Sparquote</p>
                      <PrivateValue className={cn("text-sm font-bold", savingsRate >= 0 ? "text-foreground" : "text-destructive")}>
                        {monthlyIncome > 0 ? `${savingsRate}%` : '–'}
                      </PrivateValue>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ═══════════════════════════════════════════════ */}
            {/* SECTION A: FIXKOSTEN */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide">Fixkosten</p>
                </div>
                <PrivateValue className="text-xs font-semibold text-muted-foreground">
                  {fmtCHF(totalFixedMonthly)} / Mt.
                </PrivateValue>
              </div>

              {fixedExpensesRaw.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center">
                    <p className="text-sm text-muted-foreground">Noch keine Fixkosten erfasst.</p>
                    <p className="text-xs text-muted-foreground mt-1">Trage regelmässige Ausgaben wie Miete, KK oder Abos ein.</p>
                  </CardContent>
                </Card>
              ) : (
                fixedExpensesRaw.map((fix: any, i: number) => (
                  <motion.div key={fix.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card>
                      <CardContent className="flex items-center justify-between py-2.5 px-4">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{fix.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="muted" className="text-[10px] px-1.5 py-0">
                                {frequencyLabel(fix.frequency)}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">{fix.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <PrivateValue className="text-sm font-semibold text-foreground">
                            {fmtCHF(toMonthly(Number(fix.amount), fix.frequency))}/Mt.
                          </PrivateValue>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteFixed.mutate(fix.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}

              {/* Add fixed expense */}
              <Dialog open={fixedDialogOpen} onOpenChange={setFixedDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2 rounded-xl h-10 border-dashed">
                    <Plus className="h-4 w-4" /> Fixkosten hinzufügen
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Neue Fixkosten</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div>
                      <Label>Bezeichnung</Label>
                      <Input value={fixName} onChange={e => setFixName(e.target.value)} placeholder="z.B. Miete, Krankenkasse" />
                    </div>
                    <div>
                      <Label>Betrag (CHF)</Label>
                      <Input type="number" min="0" step="10" value={fixAmount} onChange={e => setFixAmount(e.target.value)} placeholder="0" />
                    </div>
                    <div>
                      <Label>Kategorie</Label>
                      <Select value={fixCategory} onValueChange={setFixCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FIXED_CATEGORIES.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Häufigkeit</Label>
                      <Select value={fixFrequency} onValueChange={setFixFrequency}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FREQUENCY_OPTIONS.map(f => (
                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => addFixed.mutate()}
                      disabled={!fixName.trim() || !fixAmount || parseFloat(fixAmount) <= 0 || addFixed.isPending}
                      className="w-full"
                    >
                      Hinzufügen
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Separator />

            {/* ═══════════════════════════════════════════════ */}
            {/* SECTION B: VARIABLE AUSGABEN */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-bold text-foreground uppercase tracking-wide">Variable Ausgaben</p>
                <PrivateValue className="text-xs font-semibold text-muted-foreground">
                  {fmtCHF(totalVariable)} / Mt.
                </PrivateValue>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 gap-2 rounded-xl h-10">
                      <Plus className="h-4 w-4" /> Ausgabe erfassen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Neue Ausgabe</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label>Betrag (CHF)</Label>
                        <Input type="number" min="0" step="0.01" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="0.00" />
                      </div>
                      <div>
                        <Label>Kategorie</Label>
                        <Select value={expCategory} onValueChange={setExpCategory}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(c => (
                              <SelectItem key={c} value={c}>{CATEGORY_ICONS[c]} {c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Datum</Label>
                        <Input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} className="w-full" />
                      </div>
                      <div>
                        <Label>Notiz (optional)</Label>
                        <Textarea value={expNote} onChange={e => setExpNote(e.target.value)} placeholder="z.B. Migros Wocheneinkauf" rows={2} />
                      </div>
                      <Button
                        onClick={() => addExpense.mutate()}
                        disabled={!expAmount || parseFloat(expAmount) <= 0 || addExpense.isPending}
                        className="w-full"
                      >
                        Speichern
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={openBudgetDialog} className="gap-2 rounded-xl h-10">
                  <Pencil className="h-4 w-4" /> Budget
                </Button>
              </div>

              {/* Budget dialog */}
              <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Monatsbudget – {formatMonthLabel(selectedMonth)}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 pt-2">
                    {CATEGORIES.map(cat => (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                        <span className="text-sm font-medium flex-1 min-w-0 truncate">{cat}</span>
                        <Input
                          type="number"
                          min="0"
                          step="10"
                          className="w-28"
                          placeholder="CHF"
                          value={budgetAmounts[cat] || ''}
                          onChange={e => setBudgetAmounts(prev => ({ ...prev, [cat]: e.target.value }))}
                        />
                      </div>
                    ))}
                    <Button
                      onClick={() => saveBudgets.mutate()}
                      disabled={saveBudgets.isPending}
                      className="w-full mt-2"
                    >
                      Budget speichern
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Category progress bars */}
              <div className="space-y-2">
                {CATEGORIES.map((cat, i) => {
                  const budget = budgets.find((b: any) => b.category === cat);
                  const budgetAmount = budget ? Number(budget.amount) : 0;
                  const spent = categorySpending[cat] || 0;
                  const pct = budgetAmount > 0 ? Math.min(100, (spent / budgetAmount) * 100) : 0;
                  const statusColor = getStatusColor(spent, budgetAmount);

                  if (budgetAmount === 0 && spent === 0) return null;

                  return (
                    <motion.div key={cat} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <Card>
                        <CardContent className="py-3 px-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                              <span className="text-sm font-medium">{cat}</span>
                            </div>
                            <PrivateValue className="text-xs text-muted-foreground">
                              {fmtCHF(spent)} / {budgetAmount > 0 ? fmtCHF(budgetAmount) : '–'}
                            </PrivateValue>
                          </div>
                          {budgetAmount > 0 && (
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div className={cn('h-full rounded-full transition-all duration-500', statusColor)} style={{ width: `${pct}%` }} />
                            </div>
                          )}
                          {budgetAmount > 0 && (
                            <p className={cn("text-[11px] mt-1", spent > budgetAmount ? "text-destructive" : "text-muted-foreground")}>
                              {getStatusText(spent, budgetAmount)}
                              {spent > budgetAmount && ` · ${fmtCHF(spent - budgetAmount)} über Budget`}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Recent expenses list */}
              {expenses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground px-1">Letzte Ausgaben</p>
                  {expenses.slice(0, 15).map((exp: any) => (
                    <Card key={exp.id}>
                      <CardContent className="flex items-center justify-between py-2.5 px-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base">{CATEGORY_ICONS[exp.category as Category] || '📦'}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{exp.note || exp.category}</p>
                            <p className="text-[11px] text-muted-foreground">{new Date(exp.expense_date).toLocaleDateString('de-CH')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <PrivateValue className="text-sm font-semibold text-foreground">
                            CHF {Number(exp.amount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                          </PrivateValue>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteExpense.mutate(exp.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* ═══════════════════════════════════════════════ */}
            {/* SECTION C: GESAMT */}
            {/* ═══════════════════════════════════════════════ */}
            <Card className="border-2 border-border/60">
              <CardContent className="py-4 px-4 space-y-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wide text-center">Monatliche Gesamtausgaben</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">🔄 Fixkosten</span>
                    <PrivateValue className="text-sm font-medium">{fmtCHF(totalFixedMonthly)}</PrivateValue>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">📊 Variable Ausgaben</span>
                    <PrivateValue className="text-sm font-medium">{fmtCHF(totalVariable)}</PrivateValue>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Total</span>
                    <PrivateValue className="text-base font-black text-foreground">{fmtCHF(totalMonthlyExpenses)}</PrivateValue>
                  </div>
                  {totalBudget > 0 && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">vs. Budget</span>
                      <PrivateValue className={cn(
                        "text-xs font-semibold",
                        totalMonthlyExpenses <= totalBudget ? "text-primary" : "text-destructive"
                      )}>
                        {totalMonthlyExpenses <= totalBudget
                          ? `${fmtCHF(totalBudget - totalMonthlyExpenses)} unter Budget ✅`
                          : `${fmtCHF(totalMonthlyExpenses - totalBudget)} über Budget ⚠️`
                        }
                      </PrivateValue>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {expenses.length === 0 && fixedExpensesRaw.length === 0 && budgets.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground text-sm">
                    Noch keine Daten für {formatMonthLabel(selectedMonth)}.
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Erfasse Fixkosten und tägliche Ausgaben.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      </PageTransition>
    </ClientPortalLayout>
  );
}
