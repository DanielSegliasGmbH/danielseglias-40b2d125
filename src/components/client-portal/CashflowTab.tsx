import { useState } from 'react';
import { formatToolImpact } from '@/lib/peakScoreFormat';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Plus, Wallet, TrendingDown, Trash2, Zap, Trophy, ChevronDown, ChevronUp, Pencil, ExternalLink, AlertTriangle } from 'lucide-react';
import { PrivateValue } from '@/components/client-portal/PrivateValue';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { type CashflowData, type CashflowConflict } from '@/hooks/useCashflowData';

const FREQUENCY_OPTIONS = [
  { value: 'monatlich', label: 'Monatlich', divisor: 1 },
  { value: 'quartalsweise', label: 'Quartalsweise', divisor: 3 },
  { value: 'jaehrlich', label: 'Jährlich', divisor: 12 },
];

function fmtCHF(v: number): string {
  return `CHF ${Math.round(v).toLocaleString('de-CH')}`;
}

function frequencyLabel(frequency: string): string {
  return FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label || frequency;
}

/** Small source indicator chip */
function SourceBadge({ source, onClick }: { source: 'profil' | 'snapshot' | 'fixkosten' | 'manuell'; onClick?: () => void }) {
  const config = {
    profil: { label: 'Finanzprofil', icon: Pencil, className: 'text-primary/70' },
    snapshot: { label: 'Snapshot', icon: ExternalLink, className: 'text-amber-600/70' },
    fixkosten: { label: 'Fixkosten', icon: null, className: 'text-muted-foreground' },
    manuell: { label: 'Manuell', icon: null, className: 'text-muted-foreground' },
  }[source];

  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-0.5 text-[9px] font-medium',
        config.className,
        onClick && 'hover:underline cursor-pointer',
        !onClick && 'cursor-default'
      )}
    >
      {Icon && <Icon className="h-2.5 w-2.5" />}
      {config.label}
    </button>
  );
}

/** Conflict warning banner */
function ConflictWarning({ conflicts, onResolve }: { conflicts: CashflowConflict[]; onResolve: (field: string, useProfile: boolean) => void }) {
  if (conflicts.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
      {conflicts.map(c => (
        <Card key={c.field} className="border-warning/40 bg-warning/5 mb-3">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">
                  ⚠️ {c.label}: Finanzprofil ({fmtCHF(c.profilValue)}) und Snapshot ({fmtCHF(c.snapshotValue)}) unterscheiden sich.
                </p>
                <p className="text-[11px] text-muted-foreground">Welcher Wert ist aktueller?</p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onResolve(c.field, true)}>
                    Profil behalten ({fmtCHF(c.profilValue)})
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onResolve(c.field, false)}>
                    Snapshot übernehmen ({fmtCHF(c.snapshotValue)})
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}

interface CashflowTabProps {
  cashflowData: CashflowData;
}

export function CashflowTab({ cashflowData }: CashflowTabProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monatlich');
  const [showDetails, setShowDetails] = useState(false);

  const {
    jobIncome, passiveIncomeItems, passiveIncomeTotal, totalIncome,
    fixedExpenseItems, fixedExpensesTotal, liabilityItems, liabilityTotal,
    variableExpensesTotal, totalExpenses, cashflow,
    freedomPercent, isFinanciallyFree, conflicts,
  } = cashflowData;

  // Add passive income source
  const addSource = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('income_sources').insert([{
        user_id: user.id, name, amount: parseFloat(amount), frequency,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-sources'] });
      toast.success('Einnahmequelle hinzugefügt ✓');
      setName(''); setAmount(''); setFrequency('monatlich');
      setIncomeDialogOpen(false);
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

  // Resolve conflict by updating profile or snapshot
  const resolveConflict = async (field: string, useProfile: boolean) => {
    if (!user) return;
    if (useProfile) {
      // Keep profile value — user just dismisses the warning
      // We could update the snapshot, but snapshot is a point-in-time document
      toast.success('Profil-Wert beibehalten ✓');
    } else {
      // Update profile with snapshot value
      const conflict = conflicts.find(c => c.field === field);
      if (!conflict) return;
      const { error } = await supabase
        .from('meta_profiles')
        .update({ [field]: conflict.snapshotValue } as any)
        .eq('user_id', user.id);
      if (error) { toast.error('Fehler'); return; }
      queryClient.invalidateQueries({ queryKey: ['meta-profile'] });
      toast.success('Profil aktualisiert ✓');
    }
  };

  // PeakScore
  const annualSavings = Math.max(0, cashflow) * 12;
  const peakScoreImpactMonths = totalExpenses > 0 ? annualSavings / totalExpenses : 0;

  return (
    <div className="space-y-4">
      {/* Conflict warnings */}
      <ConflictWarning conflicts={conflicts} onResolve={resolveConflict} />

      {/* ═══ TWO COLUMN LAYOUT ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ─── LEFT: EINNAHMEN ─── */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Card className="border-emerald-500/20 h-full">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 className="text-sm font-bold text-foreground">Einnahmen 💰</h2>
              </div>

              {/* Aus Arbeit */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Aus Arbeit</p>
                <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-emerald-500/5">
                  <div>
                    <span className="text-sm text-foreground">Lohn</span>
                    <div className="mt-0.5">
                      <SourceBadge source="profil" onClick={() => navigate('/app/client-portal/profil-data')} />
                    </div>
                  </div>
                  <PrivateValue className="text-sm font-semibold text-emerald-600">
                    {jobIncome > 0 ? fmtCHF(jobIncome) : '–'}
                  </PrivateValue>
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Aus Assets */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Aus Assets (passiv)</p>
                {passiveIncomeItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic px-2 py-1">Noch keine passiven Einnahmen</p>
                ) : (
                  passiveIncomeItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-emerald-500/5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground truncate">{item.label}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.frequency && <span className="text-[10px] text-muted-foreground">{frequencyLabel(item.frequency)}</span>}
                          <SourceBadge source={item.source} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <PrivateValue className="text-sm font-medium text-emerald-600">
                          {fmtCHF(item.monthlyAmount)}
                        </PrivateValue>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => item.id && deleteSource.mutate(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}

                <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full gap-1.5 mt-1 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5">
                      <Plus className="h-3.5 w-3.5" /> Einnahmequelle hinzufügen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Neue Einnahmequelle</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label>Bezeichnung</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="z.B. Mieteinnahmen, Dividenden" />
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
                      <Button className="w-full" onClick={() => addSource.mutate()} disabled={!name.trim() || !amount || parseFloat(amount) <= 0 || addSource.isPending}>
                        Hinzufügen
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Separator className="opacity-50" />

              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-bold text-foreground">Einnahmen gesamt</span>
                <PrivateValue className="text-base font-black text-emerald-600">
                  {fmtCHF(totalIncome)}/Mt.
                </PrivateValue>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── RIGHT: AUSGABEN ─── */}
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <Card className="border-destructive/20 h-full">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                </div>
                <h2 className="text-sm font-bold text-foreground">Ausgaben 💸</h2>
              </div>

              {/* Fixkosten */}
              {fixedExpenseItems.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Fixkosten</p>
                  {fixedExpenseItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-1 px-2 rounded-lg bg-destructive/5">
                      <div className="min-w-0 flex-1">
                        <span className="text-sm text-foreground truncate block">{item.label}</span>
                        <SourceBadge source={item.source} />
                      </div>
                      <PrivateValue className="text-xs font-medium text-destructive shrink-0">
                        {fmtCHF(item.monthlyAmount)}
                      </PrivateValue>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-1 px-2">
                    <span className="text-[11px] font-semibold text-muted-foreground">Fixkosten total</span>
                    <PrivateValue className="text-xs font-semibold text-destructive">{fmtCHF(fixedExpensesTotal)}</PrivateValue>
                  </div>
                </div>
              )}

              {fixedExpenseItems.length === 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Fixkosten</p>
                  <p className="text-xs text-muted-foreground italic px-2 py-1">Noch keine Fixkosten erfasst</p>
                </div>
              )}

              <Separator className="opacity-50" />

              {/* Variable Kosten */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Variable Kosten</p>
                <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-destructive/5">
                  <div>
                    <span className="text-sm text-foreground">Essen, Freizeit, etc.</span>
                    <div className="mt-0.5">
                      <SourceBadge source="manuell" />
                    </div>
                  </div>
                  <PrivateValue className="text-sm font-semibold text-destructive">
                    {fmtCHF(variableExpensesTotal)}
                  </PrivateValue>
                </div>
              </div>

              {/* Verbindlichkeiten-Raten */}
              {liabilityItems.length > 0 && (
                <>
                  <Separator className="opacity-50" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Verbindlichkeiten-Raten</p>
                    {liabilityItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-1 px-2 rounded-lg bg-destructive/5">
                        <div className="min-w-0 flex-1">
                          <span className="text-sm text-foreground truncate block">{item.label}</span>
                          <SourceBadge source="snapshot" onClick={() => navigate('/app/client-portal/snapshot')} />
                        </div>
                        <PrivateValue className="text-xs text-muted-foreground shrink-0">
                          ~{fmtCHF(item.monthlyAmount)}/Mt.
                        </PrivateValue>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Separator className="opacity-50" />

              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-bold text-foreground">Ausgaben gesamt</span>
                <PrivateValue className="text-base font-black text-destructive">
                  {fmtCHF(totalExpenses)}/Mt.
                </PrivateValue>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══ CASHFLOW RESULT ═══ */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
        <Card className={cn(
          'border-2 overflow-hidden',
          cashflow >= 0 ? 'border-emerald-500/40' : 'border-destructive/40'
        )}>
          <CardContent className="p-0">
            <div className={cn(
              'p-5 text-center',
              cashflow >= 0 ? 'bg-emerald-500/5' : 'bg-destructive/5'
            )}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Dein Cashflow</p>
              <PrivateValue className={cn(
                'text-3xl sm:text-4xl font-black block',
                cashflow >= 0 ? 'text-emerald-600' : 'text-destructive'
              )}>
                {cashflow >= 0 ? '+' : ''}{fmtCHF(cashflow)} / Monat
              </PrivateValue>
              <p className={cn('text-sm mt-1', cashflow >= 0 ? 'text-emerald-600/80' : 'text-destructive/80')}>
                {cashflow >= 0
                  ? `Du sparst ${fmtCHF(cashflow)} pro Monat 🎯`
                  : `Du gibst ${fmtCHF(Math.abs(cashflow))} zu viel aus ⚠️`
                }
              </p>
            </div>

            {/* Rich Dad Moment */}
            <div className="p-5 space-y-4 border-t border-border/50">
              <div className="flex items-center gap-2 justify-center">
                <Zap className="h-4 w-4 text-amber-500" />
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Rich Dad Moment</p>
                <Zap className="h-4 w-4 text-amber-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Aus Arbeit</p>
                  <PrivateValue className="text-base font-bold text-foreground block mt-0.5">
                    {fmtCHF(jobIncome)}
                  </PrivateValue>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <p className="text-[10px] text-amber-600 uppercase font-semibold">Passiv</p>
                  <PrivateValue className="text-base font-bold text-amber-600 block mt-0.5">
                    {fmtCHF(passiveIncomeTotal)}
                  </PrivateValue>
                </div>
              </div>

              {/* Freedom Gauge */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Finanzielle Freiheit</span>
                  <PrivateValue className={cn(
                    'font-bold',
                    freedomPercent >= 100 ? 'text-amber-500' : freedomPercent >= 50 ? 'text-emerald-600' : 'text-foreground'
                  )}>
                    {freedomPercent}%
                  </PrivateValue>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden relative">
                  <motion.div
                    className={cn(
                      'h-full rounded-full',
                      freedomPercent >= 100 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(freedomPercent, 100)}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  />
                  <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                </div>
                <p className="text-[11px] text-center text-muted-foreground">
                  Finanziell frei bei 100% — passives Einkommen deckt dein Arbeitseinkommen
                </p>
              </div>

              {isFinanciallyFree ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-bold text-amber-600">Du bist finanziell frei!</span>
                    <Trophy className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-xs text-amber-600/80 mt-1">Deine Assets tragen dich. Du könntest aufhören zu arbeiten. 🎉</p>
                </motion.div>
              ) : passiveIncomeTotal > 0 ? (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
                  <p className="text-xs text-muted-foreground">
                    Dir fehlen noch <span className="font-bold text-foreground">{fmtCHF(jobIncome - passiveIncomeTotal)}</span> passives Einkommen bis zur finanziellen Freiheit.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Starte mit passivem Einkommen — jeder Franken bringt dich näher an deine Freiheit.</p>
                </div>
              )}
            </div>

            {/* PeakScore Impact */}
            {cashflow > 0 && totalExpenses > 0 && (
              <div className="px-5 pb-4 pt-0">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
                  <p className="text-xs text-muted-foreground">
                    💡 Bei diesem Cashflow verbessert sich dein PeakScore um ca.{' '}
                    <span className="font-bold text-primary">{formatToolImpact(peakScoreImpactMonths)}</span> pro Jahr.
                  </p>
                </div>
              </div>
            )}
            {cashflow < 0 && (
              <div className="px-5 pb-4 pt-0">
                <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-center">
                  <p className="text-xs text-destructive">
                    ⚠️ Negativer Cashflow: Dein PeakScore sinkt stetig. Reduziere Ausgaben oder erhöhe dein Einkommen.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ DETAILS TOGGLE ═══ */}
      <Button variant="outline" className="w-full gap-2" onClick={() => setShowDetails(v => !v)}>
        {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {showDetails ? 'Weniger anzeigen' : 'Detailansicht'}
      </Button>

      {showDetails && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Alle Einnahmequellen</p>
              <div className="flex items-center justify-between py-1.5">
                <div>
                  <span className="text-sm">Lohn (Arbeit)</span>
                  <SourceBadge source="profil" onClick={() => navigate('/app/client-portal/profil-data')} />
                </div>
                <PrivateValue className="text-sm font-medium">{fmtCHF(jobIncome)}/Mt.</PrivateValue>
              </div>
              {passiveIncomeItems.map(item => (
                <div key={item.id} className="flex items-center justify-between py-1.5">
                  <div>
                    <span className="text-sm">{item.label}</span>
                    {item.frequency && <span className="text-[10px] text-muted-foreground ml-1">({frequencyLabel(item.frequency)})</span>}
                  </div>
                  <PrivateValue className="text-sm font-medium">{fmtCHF(item.monthlyAmount)}/Mt.</PrivateValue>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between font-bold">
                <span className="text-sm">Total</span>
                <PrivateValue className="text-sm text-emerald-600">{fmtCHF(totalIncome)}/Mt.</PrivateValue>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Alle Ausgaben</p>
              {fixedExpenseItems.map(item => (
                <div key={item.id} className="flex items-center justify-between py-1.5">
                  <div>
                    <span className="text-sm">{item.label}</span>
                    <SourceBadge source={item.source} />
                  </div>
                  <PrivateValue className="text-sm font-medium">{fmtCHF(item.monthlyAmount)}/Mt.</PrivateValue>
                </div>
              ))}
              <div className="flex items-center justify-between py-1.5">
                <div>
                  <span className="text-sm">Variable Kosten</span>
                  <SourceBadge source="manuell" />
                </div>
                <PrivateValue className="text-sm font-medium">{fmtCHF(variableExpensesTotal)}/Mt.</PrivateValue>
              </div>
              {liabilityItems.map(item => (
                <div key={item.id} className="flex items-center justify-between py-1.5">
                  <div>
                    <span className="text-sm">{item.label}</span>
                    <SourceBadge source="snapshot" onClick={() => navigate('/app/client-portal/snapshot')} />
                  </div>
                  <PrivateValue className="text-sm font-medium">~{fmtCHF(item.monthlyAmount)}/Mt.</PrivateValue>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between font-bold">
                <span className="text-sm">Total</span>
                <PrivateValue className="text-sm text-destructive">{fmtCHF(totalExpenses)}/Mt.</PrivateValue>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
