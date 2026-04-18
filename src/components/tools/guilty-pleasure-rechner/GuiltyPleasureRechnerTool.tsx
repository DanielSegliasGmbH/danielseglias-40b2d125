import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PdfExportWrapper } from '@/components/tools/PdfExportWrapper';
import { ToolSnapshotButton } from '@/components/tools/ToolSnapshotButton';
import { ToolReflection, ToolTrustNote } from '@/components/tools/ToolConversionElements';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { usePeakScore, getRankForScore } from '@/hooks/usePeakScore';
import { formatPeakScoreDuration } from '@/lib/peakScoreFormat';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PRESET_HABITS, calculateGuiltyPleasure, type Habit } from './calcLogic';
import { ArrowRight, CheckCircle2, ListTodo, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  mode?: 'internal' | 'public';
}

const WORKING_HOURS_PER_MONTH = 173;
const SOZIAL_RATE = 0.13;

function estimateTaxRate(monthlyIncome: number): number {
  const annual = monthlyIncome * 12;
  if (annual <= 30000) return 0.05;
  if (annual <= 50000) return 0.10;
  if (annual <= 80000) return 0.15;
  if (annual <= 120000) return 0.20;
  return 0.25;
}

const formatCHF = (n: number) =>
  n.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function GuiltyPleasureRechnerTool({ mode = 'internal' }: Props) {
  const { user } = useAuth();
  const { profile } = useMetaProfile();
  const { score, monthlyExpenses } = usePeakScore();

  const monthlyIncome = profile?.monthly_income ?? 6000;
  const expenses = monthlyExpenses > 0 ? monthlyExpenses : (profile?.fixed_costs ?? 3000);
  const grossHourly = monthlyIncome / WORKING_HOURS_PER_MONTH;
  const netHourly = grossHourly * (1 - SOZIAL_RATE) * (1 - estimateTaxRate(monthlyIncome));

  const [selected, setSelected] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [customAmount, setCustomAmount] = useState(10);
  const [customFrequency, setCustomFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [taskCreated, setTaskCreated] = useState(false);

  const activeHabit = useMemo((): { label: string; emoji: string; amount: number; frequency: 'daily' | 'weekly' | 'monthly'; daysPerWeek?: number } | null => {
    if (!selected) return null;
    if (selected === 'custom') {
      return { label: customName || 'Gewohnheit', emoji: '➕', amount: customAmount, frequency: customFrequency };
    }
    const preset = PRESET_HABITS.find(h => h.key === selected);
    if (!preset) return null;
    return { label: preset.label, emoji: preset.emoji, amount: preset.defaultAmount, frequency: preset.frequency, daysPerWeek: preset.daysPerWeek };
  }, [selected, customName, customAmount, customFrequency]);

  const result = useMemo(() => {
    if (!activeHabit) return null;
    return calculateGuiltyPleasure(activeHabit.amount, activeHabit.frequency, netHourly, expenses, activeHabit.daysPerWeek);
  }, [activeHabit, netHourly, expenses]);

  const currentRank = score !== null ? getRankForScore(score) : null;
  const futureRank = score !== null && result ? getRankForScore(score + result.peakScore10y) : null;

  const handleCreateTask = async () => {
    if (!user || !activeHabit) return;
    const { error } = await supabase.from('client_tasks').insert({
      user_id: user.id,
      title: `Gewohnheit überdenken: ${activeHabit.label}`,
      notes: `Jährliche Kosten: CHF ${formatCHF(result?.annualCost ?? 0)}. Investiert über 30 Jahre: CHF ${formatCHF(result?.invested30y ?? 0)}.`,
    });
    if (error) {
      toast.error('Aufgabe konnte nicht erstellt werden');
    } else {
      setTaskCreated(true);
      toast.success('+15 XP – Aufgabe erstellt!');
      // Award XP
      supabase.from('gamification_actions').insert({
        user_id: user.id,
        action_type: 'tool_used',
        action_ref: 'guilty-pleasure-rechner',
        points_awarded: 15,
      });
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
  };

  return (
    <PdfExportWrapper toolName="Guilty Pleasure Rechner">
      <div className="space-y-4">
        {/* Step 1: Habit selection */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Wähle deine Gewohnheit</p>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_HABITS.map((h) => (
              <button
                key={h.key}
                onClick={() => setSelected(h.key)}
                className={cn(
                  'text-left p-3 rounded-xl border transition-all text-sm',
                  selected === h.key
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                    : 'border-border hover:border-primary/40 bg-card'
                )}
              >
                <span className="text-lg block mb-0.5">{h.emoji}</span>
                <span className="font-medium text-foreground text-xs leading-tight block">{h.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  CHF {h.defaultAmount}/{h.frequency === 'daily' ? 'Tag' : h.frequency === 'weekly' ? 'Woche' : 'Monat'}
                </span>
              </button>
            ))}
            {/* Custom */}
            <button
              onClick={() => setSelected('custom')}
              className={cn(
                'text-left p-3 rounded-xl border transition-all text-sm col-span-2',
                selected === 'custom'
                  ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                  : 'border-border hover:border-primary/40 bg-card'
              )}
            >
              <span className="text-lg">➕</span>
              <span className="font-medium text-foreground text-xs ml-2">Eigene Gewohnheit</span>
            </button>
          </div>

          {/* Custom inputs */}
          <AnimatePresence>
            {selected === 'custom' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Name</Label>
                      <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="z.B. Energy Drinks" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Betrag (CHF)</Label>
                        <Input type="number" value={customAmount || ''} onChange={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n)) setCustomAmount(n); }} min={0} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Häufigkeit</Label>
                        <Select value={customFrequency} onValueChange={(v) => setCustomFrequency(v as any)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Täglich</SelectItem>
                            <SelectItem value="weekly">Wöchentlich</SelectItem>
                            <SelectItem value="monthly">Monatlich</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step 2: Results */}
        <AnimatePresence>
          {result && activeHabit && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">

              {/* Card 1: Pro Jahr */}
              <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="p-4 text-center space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Pro Jahr</p>
                    <p className="text-3xl font-black text-foreground">CHF {formatCHF(Math.round(result.annualCost))}</p>
                    <p className="text-sm text-muted-foreground">
                      Dein {activeHabit.emoji} {activeHabit.label} kostet dich <span className="font-bold text-foreground">CHF {formatCHF(Math.round(result.annualCost))}</span> pro Jahr.
                    </p>
                    {netHourly > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Das sind <span className="font-semibold text-foreground">{Math.round(result.workHoursPerYear)} Stunden Arbeit</span>.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Card 2: 10 Jahre */}
              <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
                <Card>
                  <CardContent className="p-4 text-center space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Über 10 Jahre</p>
                    <p className="text-sm text-muted-foreground">
                      Ausgegeben: <span className="font-bold text-foreground">CHF {formatCHF(Math.round(result.cost10y))}</span>
                    </p>
                    <p className="text-2xl font-black text-primary">
                      Investiert: CHF {formatCHF(Math.round(result.invested10y))}
                    </p>
                    <p className="text-[10px] text-muted-foreground">bei 7% durchschnittlicher Rendite</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Card 3: 30 Jahre */}
              <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4 text-center space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Über 30 Jahre</p>
                    <p className="text-sm text-muted-foreground">
                      Ausgegeben: <span className="font-bold text-foreground">CHF {formatCHF(Math.round(result.cost30y))}</span>
                    </p>
                    <p className="text-3xl font-black text-primary">
                      CHF {formatCHF(Math.round(result.invested30y))}
                    </p>
                    <p className="text-xs text-muted-foreground">investiert statt ausgegeben</p>
                    {result.freedomYearsGained > 0 && (
                      <p className="text-sm font-semibold text-foreground mt-2">
                        Das sind <span className="text-primary">{result.freedomYearsGained.toFixed(1)} Jahre</span> früher finanziell frei.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Card 4: PeakScore-Effekt */}
              <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">PeakScore-Effekt</p>
                    <div className="text-center space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Ohne diese Gewohnheit: <span className="font-bold text-primary">+{formatPeakScoreDuration(result.peakScorePerYear)}</span> pro Jahr
                      </p>
                      {score !== null && (
                        <p className="text-sm text-muted-foreground">
                          In 10 Jahren: PeakScore <span className="font-bold text-primary">{(score + result.peakScore10y).toFixed(1)}</span> statt <span className="font-bold">{score.toFixed(1)}</span>
                        </p>
                      )}
                      {currentRank && futureRank && futureRank.rank > currentRank.rank && (
                        <p className="text-sm font-semibold mt-1">
                          Vom {currentRank.emoji} {currentRank.name} zum {futureRank.emoji} {futureRank.name}!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Card 5: Was du stattdessen hättest */}
              <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
                <Card className="bg-muted/30 border-none">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Was du stattdessen hättest</p>
                    <p className="text-lg font-bold text-foreground">{result.comparison}</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Actions */}
              {mode === 'internal' && (
                <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible" className="space-y-2 pt-2">
                  <Button
                    className="w-full gap-2"
                    onClick={handleCreateTask}
                    disabled={taskCreated}
                    variant={taskCreated ? 'outline' : 'default'}
                  >
                    {taskCreated ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Aufgabe erstellt ✓
                      </>
                    ) : (
                      <>
                        <ListTodo className="h-4 w-4" />
                        Aufhören und sparen
                      </>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* Conversion elements */}
              {mode === 'internal' && (
                <>
                  <ToolReflection
                    question="Was wäre, wenn du diese eine Gewohnheit änderst?"
                    context="Kleine Änderungen heute können zu grossen Ergebnissen führen."
                  />
                  <ToolTrustNote text="Unabhängige Berechnung – keine Produktempfehlung." />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PdfExportWrapper>
  );
}
