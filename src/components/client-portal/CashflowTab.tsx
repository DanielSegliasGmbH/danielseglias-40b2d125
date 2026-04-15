import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Plus, Wallet, TrendingDown, TrendingUp, PiggyBank, Trash2, ExternalLink } from 'lucide-react';
import { PrivateValue } from '@/components/client-portal/PrivateValue';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const FREQUENCY_OPTIONS = [
  { value: 'monatlich', label: 'Monatlich', divisor: 1 },
  { value: 'quartalsweise', label: 'Quartalsweise', divisor: 3 },
  { value: 'jaehrlich', label: 'Jährlich', divisor: 12 },
];

function toMonthly(amount: number, frequency: string): number {
  const opt = FREQUENCY_OPTIONS.find(f => f.value === frequency);
  return opt ? amount / opt.divisor : amount;
}

function fmtCHF(v: number): string {
  return `CHF ${Math.round(v).toLocaleString('de-CH')}`;
}

function frequencyLabel(frequency: string): string {
  return FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label || frequency;
}

interface CashflowTabProps {
  monthlyIncome: number;
  fixedCosts: number;
  totalVariableExpenses: number;
}

export function CashflowTab({ monthlyIncome, fixedCosts, totalVariableExpenses }: CashflowTabProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monatlich');

  // Fetch passive income sources
  const { data: incomeSources = [] } = useQuery({
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

  // Fetch snapshot liabilities for loan payments
  const { data: snapshotLiabilities = [] } = useQuery({
    queryKey: ['snapshot-liabilities-cashflow', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('net_worth_liabilities')
        .select('name, amount')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const addSource = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('income_sources').insert([{
        user_id: user.id,
        name,
        amount: parseFloat(amount),
        frequency,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-sources'] });
      toast.success('Einnahmequelle hinzugefügt ✓');
      setName('');
      setAmount('');
      setFrequency('monatlich');
      setDialogOpen(false);
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });

  const deleteSource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('income_sources').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-sources'] });
      toast.success('Gelöscht');
    },
  });

  // Calculations
  const passiveMonthly = useMemo(() =>
    incomeSources.reduce((sum, s) => sum + toMonthly(Number(s.amount), s.frequency), 0),
    [incomeSources]
  );

  // Estimate monthly loan payments (simplified: assume total liabilities / 120 months = 10 year payoff)
  const totalLiabilities = useMemo(() =>
    snapshotLiabilities.reduce((sum, l) => sum + Number(l.amount || 0), 0),
    [snapshotLiabilities]
  );
  const estimatedMonthlyLoanPayment = totalLiabilities > 0 ? Math.round(totalLiabilities / 120) : 0;

  const totalIncome = monthlyIncome + passiveMonthly;
  const totalExpenses = fixedCosts + totalVariableExpenses + estimatedMonthlyLoanPayment;
  const cashflow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((cashflow / totalIncome) * 100) : 0;

  // PeakScore impact estimate: savings per year / monthly expenses
  const annualSavings = Math.max(0, cashflow) * 12;
  const peakScoreImpactPerYear = totalExpenses > 0 ? (annualSavings / totalExpenses).toFixed(1) : '0';

  // Bar chart widths
  const maxBar = Math.max(totalIncome, totalExpenses, 1);
  const incomeBarPct = (totalIncome / maxBar) * 100;
  const expenseBarPct = (totalExpenses / maxBar) * 100;

  return (
    <div className="space-y-5">
      {/* SECTION 1: EINKOMMEN */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-emerald-600" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Einkommen</h2>
            </div>

            {/* Salary */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-foreground">Bruttolohn (Finanzprofil)</p>
                <p className="text-[11px] text-muted-foreground">Monatlich</p>
              </div>
              <PrivateValue className="text-sm font-semibold text-foreground">
                {monthlyIncome > 0 ? fmtCHF(monthlyIncome) : '–'}
              </PrivateValue>
            </div>

            <Separator />

            {/* Passive income sources */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Passive Einnahmen</p>
              {incomeSources.length === 0 && (
                <p className="text-xs text-muted-foreground italic">Noch keine Einnahmequellen erfasst.</p>
              )}
              {incomeSources.map((src) => (
                <div key={src.id} className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-sm text-foreground">{src.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {frequencyLabel(src.frequency)} · {fmtCHF(toMonthly(Number(src.amount), src.frequency))}/Mt.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PrivateValue className="text-sm font-medium text-foreground">
                      {fmtCHF(Number(src.amount))}/{src.frequency === 'monatlich' ? 'Mt.' : src.frequency === 'quartalsweise' ? 'Qt.' : 'J.'}
                    </PrivateValue>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteSource.mutate(src.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full gap-1.5 mt-1">
                    <Plus className="h-3.5 w-3.5" />
                    Einnahmequelle hinzufügen
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Neue Einnahmequelle</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div>
                      <Label>Bezeichnung</Label>
                      <Input value={name} onChange={e => setName(e.target.value)} placeholder="z.B. Mieteinnahmen" />
                    </div>
                    <div>
                      <Label>Betrag (CHF)</Label>
                      <Input type="number" min="0" step="10" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
                    </div>
                    <div>
                      <Label>Häufigkeit</Label>
                      <Select value={frequency} onValueChange={setFrequency}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FREQUENCY_OPTIONS.map(f => (
                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => addSource.mutate()}
                      disabled={!name.trim() || !amount || parseFloat(amount) <= 0 || addSource.isPending}
                    >
                      Hinzufügen
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Separator />

            {/* Total income */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">Total monatliches Einkommen</span>
              <PrivateValue className="text-lg font-black text-emerald-600">
                {fmtCHF(totalIncome)}
              </PrivateValue>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* SECTION 2: AUSGABEN & VERBINDLICHKEITEN */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-destructive" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Ausgaben & Verbindlichkeiten</h2>
            </div>

            {/* Fixed costs */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-foreground">Fixkosten (Finanzprofil)</p>
                <p className="text-[11px] text-muted-foreground">Miete, Krankenkasse, Versicherungen etc.</p>
              </div>
              <PrivateValue className="text-sm font-semibold text-foreground">
                {fixedCosts > 0 ? fmtCHF(fixedCosts) : '–'}
              </PrivateValue>
            </div>

            <Separator />

            {/* Variable expenses */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-foreground">Variable Ausgaben (diesen Monat)</p>
                <p className="text-[11px] text-muted-foreground">Aus deinem Budget-Tracking</p>
              </div>
              <PrivateValue className="text-sm font-semibold text-foreground">
                {fmtCHF(totalVariableExpenses)}
              </PrivateValue>
            </div>

            {/* Loan payments */}
            {estimatedMonthlyLoanPayment > 0 && (
              <>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm text-foreground">Kredit-/Schuldentilgung</p>
                    <p className="text-[11px] text-muted-foreground">
                      Geschätzt aus Verbindlichkeiten ({fmtCHF(totalLiabilities)} total)
                    </p>
                  </div>
                  <PrivateValue className="text-sm font-semibold text-foreground">
                    ~{fmtCHF(estimatedMonthlyLoanPayment)}
                  </PrivateValue>
                </div>
              </>
            )}

            <Separator />

            {/* Total expenses */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">Total monatliche Ausgaben</span>
              <PrivateValue className="text-lg font-black text-destructive">
                {fmtCHF(totalExpenses)}
              </PrivateValue>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* SECTION 3: CASHFLOW RESULT */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className={cn(
          'border-2',
          cashflow >= 0 ? 'border-emerald-500/30' : 'border-destructive/30'
        )}>
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                cashflow >= 0 ? 'bg-emerald-500/10' : 'bg-destructive/10'
              )}>
                {cashflow >= 0
                  ? <TrendingUp className="h-4 w-4 text-emerald-600" />
                  : <TrendingDown className="h-4 w-4 text-destructive" />
                }
              </div>
              <h2 className="text-sm font-bold text-foreground">Cashflow Ergebnis</h2>
            </div>

            {/* Visual bars */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Einkommen</span>
                  <PrivateValue className="font-medium text-emerald-600">{fmtCHF(totalIncome)}</PrivateValue>
                </div>
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${incomeBarPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Ausgaben</span>
                  <PrivateValue className="font-medium text-destructive">{fmtCHF(totalExpenses)}</PrivateValue>
                </div>
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-destructive"
                    initial={{ width: 0 }}
                    animate={{ width: `${expenseBarPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Result */}
            <div className="text-center space-y-2">
              <PrivateValue className={cn(
                'text-3xl font-black block',
                cashflow >= 0 ? 'text-emerald-600' : 'text-destructive'
              )}>
                {cashflow >= 0 ? '+' : ''}{fmtCHF(cashflow)} / Monat
              </PrivateValue>
              <p className="text-sm text-muted-foreground">
                {cashflow >= 0 ? 'übrig' : 'Defizit'}
              </p>
            </div>

            {/* Savings rate */}
            {totalIncome > 0 && (
              <div className="flex items-center justify-center gap-2">
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Sparquote:</span>
                <PrivateValue className={cn(
                  'text-sm font-bold',
                  savingsRate >= 20 ? 'text-emerald-600' : savingsRate >= 0 ? 'text-foreground' : 'text-destructive'
                )}>
                  {savingsRate}%
                </PrivateValue>
              </div>
            )}

            {/* PeakScore impact */}
            {cashflow > 0 && totalExpenses > 0 && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground text-center">
                  💡 Bei dieser Sparquote verbessert sich dein PeakScore um ca.{' '}
                  <span className="font-bold text-primary">{peakScoreImpactPerYear} Monate</span>{' '}
                  pro Jahr. Jeder gesparte Franken = mehr Freiheit.
                </p>
              </div>
            )}

            {cashflow < 0 && (
              <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                <p className="text-xs text-destructive text-center">
                  ⚠️ Du gibst mehr aus als du einnimmst. Dein PeakScore sinkt damit stetig.
                  Reduziere Ausgaben oder erhöhe dein Einkommen.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
