import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { PdfExportWrapper } from '@/components/tools/PdfExportWrapper';
import { ToolSnapshotButton } from '@/components/tools/ToolSnapshotButton';
import { ToolReflection, ToolTrustNote } from '@/components/tools/ToolConversionElements';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatPeakScoreImpact } from '@/lib/peakScoreFormat';
import { Plus, Trash2, ListTodo, CheckCircle2, Smartphone, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  mode?: 'internal' | 'public';
}

interface Abo {
  id: string;
  name: string;
  monthlyCost: number;
  active: boolean;
}

const PRESETS: { name: string; cost: number }[] = [
  { name: 'Netflix', cost: 12.9 },
  { name: 'Spotify', cost: 12.9 },
  { name: 'Disney+', cost: 12.9 },
  { name: 'Apple iCloud', cost: 1 },
  { name: 'YouTube Premium', cost: 15.9 },
  { name: 'Fitness-Abo', cost: 55 },
  { name: 'Zeitungs-Abo', cost: 35 },
  { name: 'Microsoft 365', cost: 7 },
];

const formatCHF = (n: number) =>
  n.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

let nextId = 1;
const genId = () => `abo-${nextId++}`;

export function AboAuditTool({ mode = 'internal' }: Props) {
  const { user } = useAuth();
  const { profile } = useMetaProfile();
  const [abos, setAbos] = useState<Abo[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [createdTasks, setCreatedTasks] = useState<Set<string>>(new Set());
  const [customName, setCustomName] = useState('');
  const [customCost, setCustomCost] = useState('');

  const hourlyRate = useMemo(() => {
    const monthly = profile?.monthly_income ?? 6000;
    const gross = monthly / 173;
    return gross * 0.87 * 0.82;
  }, [profile]);

  const addPreset = (preset: { name: string; cost: number }) => {
    if (abos.some(a => a.name === preset.name)) return;
    setAbos(prev => [...prev, { id: genId(), name: preset.name, monthlyCost: preset.cost, active: true }]);
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    const cost = parseFloat(customCost) || 0;
    setAbos(prev => [...prev, { id: genId(), name: customName.trim(), monthlyCost: cost, active: true }]);
    setCustomName('');
    setCustomCost('');
  };

  const removeAbo = (id: string) => setAbos(prev => prev.filter(a => a.id !== id));
  const toggleActive = (id: string) => setAbos(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  const updateCost = (id: string, cost: number) => setAbos(prev => prev.map(a => a.id === id ? { ...a, monthlyCost: cost } : a));

  const totalMonthly = useMemo(() => abos.reduce((s, a) => s + a.monthlyCost, 0), [abos]);
  const totalYearly = totalMonthly * 12;
  const workHoursYear = totalYearly / hourlyRate;
  const invested10y = totalYearly * ((Math.pow(1.07, 10) - 1) / 0.07);

  const unusedAbos = abos.filter(a => !a.active);
  const unusedMonthly = unusedAbos.reduce((s, a) => s + a.monthlyCost, 0);
  const unusedYearly = unusedMonthly * 12;
  const monthlyExpenses = profile?.fixed_costs ?? 4000;
  const freedomDaysUnused = monthlyExpenses > 0 ? (unusedYearly / monthlyExpenses) * 30 : 0;

  const sortedAbos = useMemo(() => [...abos].sort((a, b) => b.monthlyCost - a.monthlyCost), [abos]);
  const maxCost = sortedAbos.length > 0 ? sortedAbos[0].monthlyCost : 1;

  const handleCalculate = () => {
    setShowResults(true);
    if (user) {
      supabase.from('gamification_actions').insert({
        user_id: user.id, action_type: 'tool_used', action_ref: 'abo-audit', points_awarded: 15,
      });
    }
  };

  const handleCreateTask = async (abo: Abo) => {
    if (!user) return;
    const { error } = await supabase.from('client_tasks').insert({
      user_id: user.id, title: `Abo kündigen: ${abo.name}`,
    });
    if (error) { toast.error('Aufgabe konnte nicht erstellt werden'); return; }
    setCreatedTasks(prev => new Set(prev).add(abo.id));
    toast.success(`Aufgabe erstellt: "${abo.name}" kündigen ✅`);
  };

  const handleBatchTasks = async () => {
    if (!user) return;
    const toCreate = unusedAbos.filter(a => !createdTasks.has(a.id));
    if (toCreate.length === 0) return;
    const rows = toCreate.map(a => ({ user_id: user.id, title: `Abo kündigen: ${a.name}` }));
    const { error } = await supabase.from('client_tasks').insert(rows);
    if (error) { toast.error('Fehler beim Erstellen'); return; }
    const ids = new Set(createdTasks);
    toCreate.forEach(a => ids.add(a.id));
    setCreatedTasks(ids);
    toast.success(`${toCreate.length} Aufgaben erstellt! ✅`);
  };

  const cardAnim = (i: number) => ({
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.3 } },
  });

  return (
    <PdfExportWrapper toolName="Abo-Audit">
      <div className="space-y-4">
        {/* Step 1: Input */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Erfasse deine Abos</p>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(p => {
                const added = abos.some(a => a.name === p.name);
                return (
                  <button
                    key={p.name}
                    onClick={() => addPreset(p)}
                    disabled={added}
                    className={cn(
                      "text-xs px-2.5 py-1.5 rounded-full border transition-colors",
                      added
                        ? "bg-primary/10 border-primary/30 text-primary cursor-default"
                        : "bg-muted/40 border-border/50 hover:bg-accent/40 text-foreground"
                    )}
                  >
                    {p.name} · CHF {p.cost}
                  </button>
                );
              })}
            </div>

            {/* Custom add */}
            <div className="flex gap-2">
              <Input
                placeholder="Eigenes Abo…"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="flex-1 h-9 text-sm"
              />
              <Input
                type="number"
                placeholder="CHF"
                value={customCost}
                onChange={e => setCustomCost(e.target.value)}
                className="w-20 h-9 text-sm"
              />
              <Button size="sm" variant="outline" className="h-9 px-2" onClick={addCustom} disabled={!customName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Abo list */}
            <AnimatePresence>
              {abos.length > 0 && (
                <div className="space-y-1.5">
                  {abos.map(abo => (
                    <motion.div
                      key={abo.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/20"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{abo.name}</p>
                      </div>
                      <Input
                        type="number"
                        value={abo.monthlyCost || ''}
                        onChange={e => updateCost(abo.id, parseFloat(e.target.value) || 0)}
                        className="w-20 h-7 text-xs"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <Label className="text-[10px] text-muted-foreground">Aktiv</Label>
                        <Switch checked={abo.active} onCheckedChange={() => toggleActive(abo.id)} />
                      </div>
                      <button onClick={() => removeAbo(abo.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {abos.length > 0 && !showResults && (
              <Button className="w-full" onClick={handleCalculate}>
                Abo-Audit starten 📱
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Results */}
        {showResults && abos.length > 0 && (
          <div className="space-y-3">
            {/* Overview */}
            <motion.div variants={cardAnim(0)} initial="hidden" animate="visible">
              <Card className="bg-muted/30 border-none">
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">Übersicht</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 rounded-lg bg-background/60">
                      <p className="text-xl font-black text-foreground">CHF {formatCHF(totalMonthly)}</p>
                      <p className="text-[10px] text-muted-foreground">pro Monat</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-background/60">
                      <p className="text-xl font-black text-foreground">CHF {formatCHF(totalYearly)}</p>
                      <p className="text-[10px] text-muted-foreground">pro Jahr</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-background/60">
                      <p className="text-xl font-black text-primary">{workHoursYear.toFixed(0)} Std.</p>
                      <p className="text-[10px] text-muted-foreground">Arbeitszeit / Jahr</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-background/60">
                      <p className="text-xl font-black text-primary">CHF {formatCHF(invested10y)}</p>
                      <p className="text-[10px] text-muted-foreground">Investiert in 10 J.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Unused abos */}
            {unusedAbos.length > 0 && (
              <motion.div variants={cardAnim(1)} initial="hidden" animate="visible">
                <Card className="border border-destructive/30 bg-destructive/5">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-xs text-destructive font-medium uppercase tracking-wide text-center">Unnötige Abos</p>
                    <div className="text-center space-y-1">
                      <p className="text-2xl font-black text-destructive">CHF {formatCHF(unusedMonthly)} / Mt.</p>
                      <p className="text-sm text-muted-foreground">
                        Sofortiges Sparpotenzial: <span className="font-bold text-foreground">CHF {formatCHF(unusedYearly)} / Jahr</span>
                      </p>
                      {freedomDaysUnused > 0 && (
                        <p className="text-sm text-primary font-medium">
                          Das sind {formatPeakScoreImpact(freedomDaysUnused / 30)} mehr Freiheit pro Jahr
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {unusedAbos.map(abo => (
                        <div key={abo.id} className="flex items-center gap-2 p-2 rounded-lg bg-destructive/5">
                          <span className="flex-1 text-sm font-medium">{abo.name}</span>
                          <span className="text-sm text-destructive font-bold">CHF {abo.monthlyCost.toFixed(0)}</span>
                          {mode === 'internal' && (
                            createdTasks.has(abo.id) ? (
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            ) : (
                              <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => handleCreateTask(abo)}>
                                <ListTodo className="h-3 w-3 mr-1" /> Kündigen
                              </Button>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                    {mode === 'internal' && unusedAbos.some(a => !createdTasks.has(a.id)) && (
                      <Button variant="destructive" size="sm" className="w-full" onClick={handleBatchTasks}>
                        <ListTodo className="h-4 w-4 mr-1" />
                        Alle ungenutzten Abos zu Aufgaben machen
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Bar chart ranking */}
            <motion.div variants={cardAnim(2)} initial="hidden" animate="visible">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 justify-center">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Kosten-Ranking</p>
                  </div>
                  <div className="space-y-1.5">
                    {sortedAbos.map((abo, i) => {
                      const pct = maxCost > 0 ? (abo.monthlyCost / maxCost) * 100 : 0;
                      return (
                        <div key={abo.id} className="space-y-0.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className={cn("font-medium", !abo.active && "text-destructive")}>{abo.name}</span>
                            <span className="text-muted-foreground">CHF {abo.monthlyCost.toFixed(0)}</span>
                          </div>
                          <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, delay: i * 0.05 }}
                              className={cn(
                                "h-full rounded-full",
                                abo.active ? "bg-primary/60" : "bg-destructive/60"
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Conversion elements */}
            {mode === 'internal' && (
              <>
                <ToolReflection
                  question="Welches Abo bringt dir wirklich Mehrwert?"
                  context="Jeder Franken, der nicht für ungenutztes abfliesst, ist ein Franken mehr für deine Freiheit."
                />
                <ToolTrustNote text="Unabhängige Einschätzung – keine Produktempfehlung." />
              </>
            )}
          </div>
        )}
      </div>
    </PdfExportWrapper>
  );
}
