import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { PdfExportWrapper } from '@/components/tools/PdfExportWrapper';
import { ToolSnapshotButton } from '@/components/tools/ToolSnapshotButton';
import { ToolReflection, ToolTrustNote } from '@/components/tools/ToolConversionElements';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { usePeakScore } from '@/hooks/usePeakScore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatPeakScoreDuration } from '@/lib/peakScoreFormat';
import { Landmark, ArrowDown, CheckCircle2, ListTodo, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  mode?: 'internal' | 'public';
}

interface Account {
  key: string;
  emoji: string;
  name: string;
  pct: number;
  info: string;
  color: string; // tailwind bg class using design tokens
}

const DEFAULT_ACCOUNTS: Account[] = [
  { key: 'fixkosten', emoji: '🏠', name: 'Fixkosten', pct: 50, info: 'Alles was jeden Monat gleich bleibt: Miete, Versicherung, Rechnungen.', color: 'bg-muted-foreground/60' },
  { key: 'notgroschen', emoji: '🛡️', name: 'Notgroschen', pct: 10, info: 'Bis du 3–6 Monatsausgaben hast. Danach fliesst das Geld ins Investment.', color: 'bg-primary/60' },
  { key: 'investment', emoji: '📈', name: 'Investment / Geldmagnet', pct: 20, info: 'Dieses Geld arbeitet für dich. ETFs, Säule 3a, Pensionskasse.', color: 'bg-emerald-500/60' },
  { key: 'spass', emoji: '🎉', name: 'Spass & Leben', pct: 20, info: 'Für alles, was Freude macht. Ohne schlechtes Gewissen.', color: 'bg-amber-500/60' },
];

const formatCHF = (n: number) => n.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

interface ActionItem {
  id: string;
  emoji: string;
  title: string;
  taskTitle: string;
}

const ACTIONS: ActionItem[] = [
  { id: 'notgroschen', emoji: '🏦', title: 'Notgroschen-Konto eröffnen', taskTitle: 'Separates Notgroschen-Konto eröffnen' },
  { id: 'dauerauftrag', emoji: '🔄', title: 'Dauerauftrag für Investment einrichten', taskTitle: 'Dauerauftrag für monatliches Investment einrichten' },
  { id: 'spass', emoji: '🎉', title: 'Spass-Budget bewusst planen', taskTitle: 'Monatliches Spass-Budget festlegen und einhalten' },
];

export function KontenModellTool({ mode = 'internal' }: Props) {
  const { user } = useAuth();
  const { profile } = useMetaProfile();
  const { score: peakScore, monthlyExpenses: peakExpenses } = usePeakScore();

  const monthlyIncome = profile?.monthly_income ?? 6000;
  const monthlyExpenses = peakExpenses > 0 ? peakExpenses : (profile?.fixed_costs ?? 4000);
  const currentWealth = profile?.wealth ?? 0;

  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [showJahres, setShowJahres] = useState(false);
  const [jahresPct, setJahresPct] = useState(0);
  const [calculated, setCalculated] = useState(false);
  const [createdTasks, setCreatedTasks] = useState<Set<string>>(new Set());
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  const totalPct = useMemo(() => accounts.reduce((s, a) => s + a.pct, 0) + jahresPct, [accounts, jahresPct]);

  const updatePct = useCallback((key: string, newPct: number) => {
    setAccounts(prev => prev.map(a => a.key === key ? { ...a, pct: newPct } : a));
  }, []);

  // Emergency fund progress
  const emergencyTarget = monthlyExpenses * 6;
  const emergencyMonthly = monthlyIncome * (accounts.find(a => a.key === 'notgroschen')?.pct ?? 10) / 100;
  const monthsToTarget = emergencyMonthly > 0 ? Math.ceil(emergencyTarget / emergencyMonthly) : 999;

  // Investment monthly
  const investMonthly = monthlyIncome * (accounts.find(a => a.key === 'investment')?.pct ?? 20) / 100;

  // PeakScore projection
  const psProjection = useMemo(() => {
    const investPct = (accounts.find(a => a.key === 'investment')?.pct ?? 20) / 100;
    const monthlySaved = monthlyIncome * investPct;
    const results: { years: number; gain: number }[] = [];
    for (const y of [1, 5, 10]) {
      // FV of annuity at 5% return
      const fv = monthlySaved * 12 * ((Math.pow(1.05, y) - 1) / 0.05);
      const gainMonths = monthlyExpenses > 0 ? fv / monthlyExpenses : 0;
      results.push({ years: y, gain: gainMonths });
    }
    return results;
  }, [accounts, monthlyIncome, monthlyExpenses]);

  const handleCalculate = () => {
    setCalculated(true);
    if (user) {
      supabase.from('gamification_actions').insert({
        user_id: user.id, action_type: 'tool_used', action_ref: 'konten-modell', points_awarded: 25,
      });
    }
  };

  const handleCreateTask = async (item: ActionItem) => {
    if (!user) return;
    const { error } = await supabase.from('client_tasks').insert({ user_id: user.id, title: item.taskTitle });
    if (error) { toast.error('Fehler'); return; }
    setCreatedTasks(prev => new Set(prev).add(item.id));
    toast.success('Aufgabe erstellt! ✅');
  };

  const cardAnim = (i: number) => ({
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.3 } },
  });

  return (
    <PdfExportWrapper toolName="Konten-Modell">
      <div className="space-y-4">
        {/* Step 1: Flow diagram */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 justify-center">
              <Landmark className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Dein Konten-Modell</p>
            </div>

            {/* Income box */}
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">💰 Einkommen</p>
              <p className="text-2xl font-black text-foreground">CHF {formatCHF(monthlyIncome)}</p>
              <p className="text-[10px] text-muted-foreground">pro Monat</p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowDown className="h-5 w-5 text-muted-foreground/50" />
            </div>

            {/* Account cards with sliders */}
            <div className="grid grid-cols-2 gap-2">
              {accounts.map(acc => {
                const amount = Math.round(monthlyIncome * acc.pct / 100);
                const isExpanded = expandedInfo === acc.key;
                return (
                  <motion.div
                    key={acc.key}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-xl border border-border/50 p-3 space-y-2 bg-card"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{acc.emoji}</span>
                      <button onClick={() => setExpandedInfo(isExpanded ? null : acc.key)} className="text-muted-foreground/50 hover:text-muted-foreground">
                        <Info className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-foreground leading-tight">{acc.name}</p>
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-black text-foreground">{acc.pct}%</span>
                        <span className="text-xs text-muted-foreground">CHF {formatCHF(amount)}</span>
                      </div>
                      <Slider
                        value={[acc.pct]}
                        onValueChange={v => updatePct(acc.key, v[0])}
                        min={0}
                        max={80}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    {/* Progress bar for Notgroschen */}
                    {acc.key === 'notgroschen' && (
                      <div className="space-y-0.5">
                        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary/60 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (currentWealth * 0.3 / emergencyTarget) * 100)}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-muted-foreground">Ziel: CHF {formatCHF(emergencyTarget)} · ~{monthsToTarget} Mt.</p>
                      </div>
                    )}
                    {isExpanded && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-[11px] text-muted-foreground leading-relaxed"
                      >
                        {acc.info}
                      </motion.p>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Optional Jahresausgaben */}
            <button
              onClick={() => setShowJahres(!showJahres)}
              className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              {showJahres ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Optional: Jahresausgaben-Konto
            </button>
            {showJahres && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl border border-border/50 p-3 space-y-2 bg-card">
                <p className="text-xs font-semibold text-foreground">📅 Jahresausgaben</p>
                <p className="text-[11px] text-muted-foreground">Steuern, Ferien, Versicherungs-Jahresprämien. Jeden Monat ein bisschen zur Seite legen.</p>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black text-foreground">{jahresPct}%</span>
                  <span className="text-xs text-muted-foreground">CHF {formatCHF(Math.round(monthlyIncome * jahresPct / 100))}</span>
                </div>
                <Slider value={[jahresPct]} onValueChange={v => setJahresPct(v[0])} min={0} max={20} step={5} />
              </motion.div>
            )}

            {/* Total indicator */}
            <div className={cn("text-center text-xs font-medium py-1 rounded-lg", totalPct === 100 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive")}>
              Total: {totalPct}% {totalPct !== 100 && `(Ziel: 100%)`}
            </div>

            {!calculated && (
              <Button className="w-full" onClick={handleCalculate}>
                Konten-Modell berechnen 🏦
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {calculated && (
          <div className="space-y-3">
            {/* Personalized breakdown */}
            <motion.div variants={cardAnim(0)} initial="hidden" animate="visible">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">Deine persönliche Aufteilung</p>
                  <div className="space-y-2">
                    {accounts.map(acc => {
                      const amount = Math.round(monthlyIncome * acc.pct / 100);
                      return (
                        <div key={acc.key} className="flex items-center gap-3">
                          <span className="text-base shrink-0">{acc.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-foreground">{acc.name}</span>
                              <span className="text-sm font-bold text-foreground">CHF {formatCHF(amount)}</span>
                            </div>
                            <div className="h-2 bg-muted/40 rounded-full overflow-hidden mt-0.5">
                              <div className={cn("h-full rounded-full transition-all", acc.color)} style={{ width: `${acc.pct}%` }} />
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground font-medium shrink-0">{acc.pct}%</span>
                        </div>
                      );
                    })}
                    {showJahres && jahresPct > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-base shrink-0">📅</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">Jahresausgaben</span>
                            <span className="text-sm font-bold text-foreground">CHF {formatCHF(Math.round(monthlyIncome * jahresPct / 100))}</span>
                          </div>
                          <div className="h-2 bg-muted/40 rounded-full overflow-hidden mt-0.5">
                            <div className="h-full rounded-full bg-violet-500/60 transition-all" style={{ width: `${jahresPct}%` }} />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium shrink-0">{jahresPct}%</span>
                      </div>
                    )}
                  </div>

                  {/* Comparison with actual */}
                  {monthlyExpenses > 0 && (
                    <div className="bg-muted/20 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Vergleich mit deinem Budget:</p>
                      <p className="text-xs text-muted-foreground">
                        Du gibst aktuell <span className="font-bold text-foreground">{Math.round((monthlyExpenses / monthlyIncome) * 100)}%</span> für Fixkosten aus.
                        Das Modell empfiehlt <span className="font-bold text-primary">{accounts.find(a => a.key === 'fixkosten')?.pct}%</span>.
                      </p>
                      {monthlyExpenses / monthlyIncome > 0.55 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          ⚠️ Deine Fixkosten sind höher als empfohlen. Prüfe Sparpotenzial.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions */}
            {mode === 'internal' && (
              <motion.div variants={cardAnim(1)} initial="hidden" animate="visible">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">Jetzt umsetzen</p>
                    <div className="space-y-1.5">
                      {ACTIONS.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                          <span className="text-base shrink-0">{item.emoji}</span>
                          <p className="text-sm font-medium text-foreground flex-1">{item.title}</p>
                          {createdTasks.has(item.id) ? (
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <Button size="sm" variant="ghost" className="h-7 text-xs px-2 shrink-0" onClick={() => handleCreateTask(item)}>
                              <ListTodo className="h-3 w-3 mr-1" /> Aufgabe
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* PeakScore projection */}
            <motion.div variants={cardAnim(2)} initial="hidden" animate="visible">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">PeakScore-Projektion</p>
                  <p className="text-xs text-center text-muted-foreground">Wenn du dieses Modell ab heute umsetzt:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {psProjection.map(({ years, gain }) => (
                      <div key={years} className="text-center p-2.5 rounded-lg bg-background/60">
                        <p className="text-lg font-black text-primary">+{gain.toFixed(1)}</p>
                        <p className="text-[10px] text-muted-foreground">PeakScore</p>
                        <p className="text-[10px] text-muted-foreground font-medium">in {years} {years === 1 ? 'Jahr' : 'Jahren'}</p>
                        <p className="text-[9px] text-primary/70 mt-0.5">{formatPeakScoreDuration(gain)}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-center text-muted-foreground">
                    Das sind <span className="font-bold text-foreground">CHF {formatCHF(investMonthly)}/Mt.</span> die für dich arbeiten.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {mode === 'internal' && (
              <>
                <ToolReflection
                  question="Wie viel deines Einkommens arbeitet aktuell wirklich für dich?"
                  context="Das Konten-Modell ist der erste Schritt zu finanzieller Ordnung – und Freiheit."
                />
                <ToolTrustNote text="Empfohlene Grundstruktur – individuell anpassbar." />
              </>
            )}
          </div>
        )}
      </div>
    </PdfExportWrapper>
  );
}
