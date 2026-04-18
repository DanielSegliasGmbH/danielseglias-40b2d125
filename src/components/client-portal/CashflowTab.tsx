import { useState } from 'react';
import { formatToolImpact } from '@/lib/peakScoreFormat';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Zap, Trophy, ChevronDown, ChevronUp, Pencil, ExternalLink, AlertTriangle, Briefcase, Landmark, Receipt } from 'lucide-react';
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
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onResolve(c.field, true)}>
                    Profil behalten
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onResolve(c.field, false)}>
                    Snapshot übernehmen
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

/** Single calculation row in the right ladder */
function LadderRow({
  op, label, value, valueClassName, rowClassName, dashed,
}: {
  op: '+' | '-' | '=' | null;
  label: string;
  value: number;
  valueClassName?: string;
  rowClassName?: string;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-5 text-center text-base font-black text-foreground/70 shrink-0">
        {op || ''}
      </div>
      <div className={cn(
        'flex-1 flex items-center justify-between rounded-md border px-2.5 py-2 bg-background',
        dashed ? 'border-dashed border-foreground/40' : 'border-foreground/80',
        rowClassName,
      )}>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground truncate">{label}</span>
        <PrivateValue className={cn('text-sm font-bold tabular-nums', valueClassName)}>
          {fmtCHF(value)}
        </PrivateValue>
      </div>
    </div>
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

  // Beruf aus Meta-Profil
  const { data: metaProfile } = useQuery({
    queryKey: ['meta-profile-occupation', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('meta_profiles')
        .select('occupation')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });
  const occupation = (metaProfile as any)?.occupation || 'Dein Beruf';

  // Vermögenswerte (Assets) aus net_worth_assets
  const { data: assets = [] } = useQuery({
    queryKey: ['net-worth-assets-cashflow', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('net_worth_assets')
        .select('id, name, value')
        .eq('user_id', user.id)
        .order('value', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });
  const totalAssets = assets.reduce((s: number, a: any) => s + Number(a.value), 0);

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

  const resolveConflict = async (field: string, useProfile: boolean) => {
    if (!user) return;
    if (useProfile) {
      toast.success('Profil-Wert beibehalten ✓');
    } else {
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

  const annualSavings = Math.max(0, cashflow) * 12;
  const peakScoreImpactMonths = totalExpenses > 0 ? annualSavings / totalExpenses : 0;

  return (
    <div className="space-y-4 w-full max-w-full min-w-0">
      <ConflictWarning conflicts={conflicts} onResolve={resolveConflict} />

      {/* ═══ HAUPT-KARTE im Cashflow-Game-Stil ═══ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="overflow-hidden border-2 border-foreground/80 shadow-md">
          {/* Schwarze Kopfzeile mit Beruf */}
          <div className="bg-foreground text-background px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-widest opacity-70">Dein Beruf</p>
              <h2 className="text-xl sm:text-2xl font-black uppercase truncate leading-tight">
                {occupation}
              </h2>
              <p className="text-[10px] opacity-70 mt-0.5">
                Ziel: Passives Einkommen &gt; Gesamtausgaben
              </p>
            </div>
          </div>

          {/* INCOME STATEMENT */}
          <div className="p-3 sm:p-4 bg-background">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Income Statement
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {/* LEFT — Income + Expenses */}
              <div className="space-y-3 min-w-0">
                {/* 1) Income */}
                <div>
                  <div className="bg-foreground text-background rounded-r-full pr-3 pl-2 py-1 inline-flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-background text-foreground text-[11px] font-black flex items-center justify-center">1</span>
                    <span className="text-sm font-bold italic">Einkommen</span>
                  </div>
                  <div className="space-y-1">
                    <RowLine label="Lohn" value={jobIncome} onClick={() => navigate('/app/client-portal/profil-data')} />
                    {passiveIncomeItems.map(item => (
                      <RowLine
                        key={item.id}
                        label={item.label}
                        value={item.monthlyAmount}
                        sub={item.frequency ? frequencyLabel(item.frequency) : undefined}
                        onDelete={item.id ? () => deleteSource.mutate(item.id!) : undefined}
                      />
                    ))}
                    <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground">
                          <Plus className="h-3 w-3" /> Passive Einnahme
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
                        <DialogHeader><DialogTitle>Neue Einnahmequelle</DialogTitle></DialogHeader>
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
                </div>

                {/* 2) Expenses */}
                <div>
                  <div className="bg-foreground text-background rounded-r-full pr-3 pl-2 py-1 inline-flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-background text-foreground text-[11px] font-black flex items-center justify-center">2</span>
                    <span className="text-sm font-bold italic">Ausgaben</span>
                  </div>
                  <div className="space-y-1">
                    {fixedExpenseItems.length === 0 && variableExpensesTotal === 0 && liabilityItems.length === 0 && (
                      <p className="text-[11px] text-muted-foreground italic px-1 py-1">Noch keine Ausgaben erfasst</p>
                    )}
                    {fixedExpenseItems.map(item => (
                      <RowLine key={item.id} label={item.label} value={item.monthlyAmount} negative />
                    ))}
                    {variableExpensesTotal > 0 && (
                      <RowLine label="Variable Kosten" value={variableExpensesTotal} negative sub="Budget" />
                    )}
                    {liabilityItems.map(item => (
                      <RowLine key={item.id} label={`${item.label} (Rate)`} value={item.monthlyAmount} negative />
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT — 5-stufige Cashflow-Leiter */}
              <div className="space-y-2 min-w-0">
                <LadderRow op={null} label="Lohn (Arbeit)" value={jobIncome} />
                <LadderRow op="+" label="Passives Einkommen" value={passiveIncomeTotal} />
                <LadderRow
                  op="="
                  label="Totales Einkommen"
                  value={totalIncome}
                  valueClassName="text-emerald-600"
                  rowClassName="bg-emerald-500/5"
                />
                <LadderRow
                  op="-"
                  label="Gesamtausgaben"
                  value={totalExpenses}
                  valueClassName="text-destructive"
                  rowClassName="bg-destructive/5"
                />
                <LadderRow
                  op="="
                  label="Monatlicher Cashflow"
                  value={cashflow}
                  dashed
                  valueClassName={cn('text-base sm:text-lg', cashflow >= 0 ? 'text-emerald-600' : 'text-destructive')}
                  rowClassName={cn('shadow-sm', cashflow >= 0 ? 'bg-emerald-500/10' : 'bg-destructive/10')}
                />
              </div>
            </div>

            {/* BALANCE SHEET */}
            <div className="mt-5">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Balance Sheet
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* 3) Assets */}
                <div className="min-w-0">
                  <div className="bg-foreground text-background rounded-r-full pr-3 pl-2 py-1 inline-flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-background text-foreground text-[11px] font-black flex items-center justify-center">3</span>
                    <span className="text-sm font-bold italic">Vermögenswerte</span>
                  </div>
                  <div className="space-y-1">
                    {assets.length === 0 ? (
                      <button onClick={() => navigate('/app/client-portal/snapshot')} className="text-[11px] text-muted-foreground italic px-1 py-1 hover:text-primary text-left">
                        Noch keine Assets — jetzt erfassen →
                      </button>
                    ) : (
                      assets.map((a: any) => (
                        <RowLine key={a.id} label={a.name} value={Number(a.value)} positive />
                      ))
                    )}
                    <div className="flex items-center justify-between border-t border-foreground/30 pt-1 mt-1 px-1">
                      <span className="text-[11px] font-bold uppercase">Total</span>
                      <PrivateValue className="text-sm font-black text-emerald-600">{fmtCHF(totalAssets)}</PrivateValue>
                    </div>
                  </div>
                </div>

                {/* 4) Liabilities */}
                <div className="min-w-0">
                  <div className="bg-foreground text-background rounded-r-full pr-3 pl-2 py-1 inline-flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-background text-foreground text-[11px] font-black flex items-center justify-center">4</span>
                    <span className="text-sm font-bold italic">Verbindlichkeiten</span>
                  </div>
                  <div className="space-y-1">
                    {liabilityItems.length === 0 ? (
                      <button onClick={() => navigate('/app/client-portal/snapshot')} className="text-[11px] text-muted-foreground italic px-1 py-1 hover:text-primary text-left">
                        Keine Verbindlichkeiten erfasst →
                      </button>
                    ) : (
                      liabilityItems.map(item => (
                        <RowLine key={item.id} label={item.label} value={item.monthlyAmount * 120} negative sub="Geschätzter Saldo" />
                      ))
                    )}
                    <div className="flex items-center justify-between border-t border-foreground/30 pt-1 mt-1 px-1">
                      <span className="text-[11px] font-bold uppercase">Mtl. Raten</span>
                      <PrivateValue className="text-sm font-black text-destructive">{fmtCHF(liabilityTotal)}</PrivateValue>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ═══ RICH DAD MOMENT (bestehend) ═══ */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
        <Card className="border-2 overflow-hidden">
          <CardContent className="p-5 space-y-4">
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
                <p className="text-xs text-amber-600/80 mt-1">Deine Assets tragen dich. 🎉</p>
              </motion.div>
            ) : passiveIncomeTotal > 0 ? (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <p className="text-xs text-muted-foreground">
                  Dir fehlen noch <span className="font-bold text-foreground">{fmtCHF(jobIncome - passiveIncomeTotal)}</span> passives Einkommen bis zur finanziellen Freiheit.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">Starte mit passivem Einkommen — jeder Franken bringt dich näher.</p>
              </div>
            )}

            {cashflow > 0 && totalExpenses > 0 && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <p className="text-xs text-muted-foreground">
                  💡 Bei diesem Cashflow verbessert sich dein PeakScore um ca.{' '}
                  <span className="font-bold text-primary">{formatToolImpact(peakScoreImpactMonths)}</span> pro Jahr.
                </p>
              </div>
            )}
            {cashflow < 0 && (
              <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-center">
                <p className="text-xs text-destructive">
                  ⚠️ Negativer Cashflow: Dein PeakScore sinkt stetig.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ DETAILS TOGGLE ═══ */}
      <Button variant="outline" className="w-full gap-2" onClick={() => setShowDetails(v => !v)}>
        {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {showDetails ? 'Weniger anzeigen' : 'Detailansicht aller Posten'}
      </Button>

      {showDetails && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 overflow-hidden">
          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Alle Einnahmequellen</p>
              <div className="flex items-center justify-between py-1.5">
                <div>
                  <span className="text-sm">Lohn (Arbeit)</span>{' '}
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
                    <span className="text-sm">{item.label}</span>{' '}
                    <SourceBadge source={item.source} />
                  </div>
                  <PrivateValue className="text-sm font-medium">{fmtCHF(item.monthlyAmount)}/Mt.</PrivateValue>
                </div>
              ))}
              <div className="flex items-center justify-between py-1.5">
                <div>
                  <span className="text-sm">Variable Kosten</span>{' '}
                  <SourceBadge source="manuell" />
                </div>
                <PrivateValue className="text-sm font-medium">{fmtCHF(variableExpensesTotal)}/Mt.</PrivateValue>
              </div>
              {liabilityItems.map(item => (
                <div key={item.id} className="flex items-center justify-between py-1.5">
                  <div>
                    <span className="text-sm">{item.label}</span>{' '}
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

/** Reusable line item for the left side (income / expenses / assets / liabilities lists) */
function RowLine({
  label, value, sub, onClick, onDelete, positive, negative,
}: {
  label: string;
  value: number;
  sub?: string;
  onClick?: () => void;
  onDelete?: () => void;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-end justify-between gap-2 border-b border-dotted border-foreground/30 pb-1 px-1">
      <button
        onClick={onClick}
        className={cn(
          'min-w-0 flex-1 text-left',
          onClick && 'hover:text-primary cursor-pointer',
          !onClick && 'cursor-default'
        )}
      >
        <p className="text-[12px] sm:text-sm text-foreground truncate leading-tight">{label}:</p>
        {sub && <p className="text-[9px] text-muted-foreground leading-tight">{sub}</p>}
      </button>
      <div className="flex items-center gap-1 shrink-0">
        <PrivateValue className={cn(
          'text-[12px] sm:text-sm font-semibold tabular-nums',
          positive && 'text-emerald-600',
          negative && 'text-destructive',
          !positive && !negative && 'text-foreground',
        )}>
          {fmtCHF(value)}
        </PrivateValue>
        {onDelete && (
          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
