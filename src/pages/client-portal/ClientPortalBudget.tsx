import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/PageTransition';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
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

function computeNextDate(dateStr: string, frequency: string): string {
  const d = new Date(dateStr);
  switch (frequency) {
    case 'quartalsweise': d.setMonth(d.getMonth() + 3); break;
    case 'halbjaehrlich': d.setMonth(d.getMonth() + 6); break;
    case 'jaehrlich': d.setFullYear(d.getFullYear() + 1); break;
    default: d.setMonth(d.getMonth() + 1); break;
  }
  return d.toISOString().slice(0, 10);
}

const FREQUENCY_OPTIONS = [
  { value: 'monatlich', label: 'Monatlich' },
  { value: 'quartalsweise', label: 'Quartalsweise' },
  { value: 'halbjaehrlich', label: 'Halbjährlich' },
  { value: 'jaehrlich', label: 'Jährlich' },
];

export default function ClientPortalBudget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { awardPoints } = useGamification();
  const { monthlyExpenses } = usePeakScore();
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey());
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [lastExpenseImpact, setLastExpenseImpact] = useState<number | null>(null);
  const [showExpenseImpact, setShowExpenseImpact] = useState(false);

  // Expense form state
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<string>(CATEGORIES[0]);
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expNote, setExpNote] = useState('');
  const [expRecurring, setExpRecurring] = useState(false);
  const [expFrequency, setExpFrequency] = useState<string>('monatlich');

  // Budget edit state
  const [budgetAmounts, setBudgetAmounts] = useState<Record<string, string>>({});

  const isCurrentMonth = selectedMonth === getMonthKey();
  const isFuture = selectedMonth > getMonthKey();

  // Fetch budgets for selected month
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

  // Fetch expenses for selected month
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
        .gte('expense_date', startDate)
        .lte('expense_date', endDate)
        .order('expense_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch meta profile income & fixed costs
  const { data: metaProfile } = useQuery({
    queryKey: ['meta-profile-budget', user?.id],
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

  const monthlyIncome = metaProfile?.monthly_income || 0;
  const fixedCosts = metaProfile?.fixed_costs || 0;
  const [activeTab, setActiveTab] = useState('budget');

  // Compute per-category spending
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

  const totalSpent = useMemo(() => expenses.reduce((s: number, e: any) => s + Number(e.amount), 0), [expenses]);
  const totalBudget = useMemo(() => budgets.reduce((s: number, b: any) => s + Number(b.amount), 0), [budgets]);
  const remaining = monthlyIncome - totalSpent;
  const savingsRate = monthlyIncome > 0 ? Math.round((remaining / monthlyIncome) * 100) : 0;

  // Add expense mutation
  const addExpense = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('budget_expenses').insert({
        user_id: user.id,
        category: expCategory,
        amount: parseFloat(expAmount),
        expense_date: expDate,
        note: expNote || null,
        is_recurring: expRecurring,
        recurring_frequency: expRecurring ? expFrequency : null,
      });
      if (error) throw error;

      // If recurring, create next occurrence
      if (expRecurring) {
        const nextDate = computeNextDate(expDate, expFrequency);
        await supabase.from('budget_expenses').insert({
          user_id: user.id,
          category: expCategory,
          amount: parseFloat(expAmount),
          expense_date: nextDate,
          note: expNote || null,
          is_recurring: true,
          recurring_frequency: expFrequency,
        });
      }
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
      setExpAmount('');
      setExpNote('');
      setExpDate(new Date().toISOString().slice(0, 10));
      setExpRecurring(false);
      setExpFrequency('monatlich');
      setExpenseDialogOpen(false);
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });

  // Delete expense mutation
  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budget_expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Ausgabe gelöscht');
    },
    onError: () => toast.error('Fehler beim Löschen'),
  });

  // Save budgets mutation
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

  return (
    <ClientPortalLayout>
      <PageTransition>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Tab navigation */}
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
            <CashflowTab
              monthlyIncome={monthlyIncome}
              fixedCosts={fixedCosts}
              totalVariableExpenses={totalSpent}
            />
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

        {/* PeakScore impact after expense */}
        <PeakScoreImpact impact={lastExpenseImpact} show={showExpenseImpact} className="px-1" />

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
                    {monthlyIncome > 0 ? `CHF ${monthlyIncome.toLocaleString('de-CH')}` : '–'}
                  </PrivateValue>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Ausgaben</p>
                  <PrivateValue className="text-sm font-bold text-foreground">CHF {totalSpent.toLocaleString('de-CH')}</PrivateValue>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <PiggyBank className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Übrig</p>
                  <PrivateValue className={cn("text-sm font-bold", remaining >= 0 ? "text-foreground" : "text-destructive")}>
                    CHF {remaining.toLocaleString('de-CH')}
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

        {/* Action buttons */}
        <div className="flex gap-2">
          <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 gap-2 rounded-xl h-11">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="recurring-toggle" className="cursor-pointer">Wiederkehrend</Label>
                  <Switch id="recurring-toggle" checked={expRecurring} onCheckedChange={setExpRecurring} />
                </div>
                {expRecurring && (
                  <div>
                    <Label>Häufigkeit</Label>
                    <Select value={expFrequency} onValueChange={setExpFrequency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FREQUENCY_OPTIONS.map(f => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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

          <Button variant="outline" onClick={openBudgetDialog} className="gap-2 rounded-xl h-11">
            <Pencil className="h-4 w-4" /> Budget setzen
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
          <p className="text-xs font-medium text-muted-foreground px-1">Budget pro Kategorie</p>
          {CATEGORIES.map((cat, i) => {
            const budget = budgets.find((b: any) => b.category === cat);
            const budgetAmount = budget ? Number(budget.amount) : 0;
            const spent = categorySpending[cat] || 0;
            const pct = budgetAmount > 0 ? Math.min(100, (spent / budgetAmount) * 100) : 0;
            const statusColor = getStatusColor(spent, budgetAmount);

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                        <span className="text-sm font-medium">{cat}</span>
                      </div>
                      <div className="text-right">
                        <PrivateValue className="text-xs text-muted-foreground">
                          CHF {spent.toLocaleString('de-CH')} / {budgetAmount > 0 ? `CHF ${budgetAmount.toLocaleString('de-CH')}` : '–'}
                        </PrivateValue>
                      </div>
                    </div>
                    {budgetAmount > 0 && (
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500', statusColor)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                    {budgetAmount > 0 && (
                      <p className={cn(
                        "text-[11px] mt-1",
                        spent > budgetAmount ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {getStatusText(spent, budgetAmount)}
                        {spent > budgetAmount && ` · CHF ${(spent - budgetAmount).toLocaleString('de-CH')} über Budget`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Recent expenses */}
        {expenses.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground px-1">Letzte Ausgaben</p>
            {expenses.slice(0, 15).map((exp: any) => (
              <Card key={exp.id}>
                <CardContent className="flex items-center justify-between py-2.5 px-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{CATEGORY_ICONS[exp.category as Category] || '📦'}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate flex items-center gap-1">
                        {exp.is_recurring && <RefreshCw className="h-3 w-3 text-muted-foreground shrink-0" />}
                        {exp.note || exp.category}
                        {exp.is_recurring && (
                          <span className="text-[10px] text-muted-foreground font-normal">Fixkosten</span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{new Date(exp.expense_date).toLocaleDateString('de-CH')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <PrivateValue className="text-sm font-semibold text-foreground">
                      CHF {Number(exp.amount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                    </PrivateValue>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteExpense.mutate(exp.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {expenses.length === 0 && budgets.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground text-sm">
                Noch keine Daten für {formatMonthLabel(selectedMonth)}.
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Setze ein Budget und erfasse deine erste Ausgabe.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      </PageTransition>
    </ClientPortalLayout>
  );
}
