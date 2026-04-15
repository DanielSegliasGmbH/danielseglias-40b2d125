import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PdfExportWrapper } from '@/components/tools/PdfExportWrapper';
import { ToolReflection, ToolTrustNote } from '@/components/tools/ToolConversionElements';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { usePeakScore } from '@/hooks/usePeakScore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatPeakScoreDuration } from '@/lib/peakScoreFormat';
import { Plus, Trash2, Calendar, TrendingUp, Car, Home, Baby, GraduationCap, Heart, Gift, Briefcase, Palmtree, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  mode?: 'internal' | 'public';
}

type EventType = 'income' | 'expense' | 'recurring';

interface FinancialEvent {
  id: string;
  name: string;
  type: EventType;
  year: number;
  amount: number;
  monthlyChange: number; // for recurring
}

const PRESETS: { name: string; icon: string; type: EventType; amount: number; monthlyChange: number }[] = [
  { name: 'Auto kaufen', icon: '🚗', type: 'expense', amount: 35000, monthlyChange: 0 },
  { name: 'Leasing endet', icon: '🚗', type: 'recurring', amount: 0, monthlyChange: 500 },
  { name: 'Eigenheim kaufen', icon: '🏠', type: 'expense', amount: 200000, monthlyChange: -800 },
  { name: 'Kind', icon: '👶', type: 'recurring', amount: 0, monthlyChange: -1200 },
  { name: 'Heirat', icon: '💍', type: 'expense', amount: 30000, monthlyChange: 0 },
  { name: 'Weiterbildung', icon: '🎓', type: 'expense', amount: 15000, monthlyChange: 0 },
  { name: 'Erbvorbezug', icon: '💰', type: 'income', amount: 50000, monthlyChange: 0 },
  { name: 'Erbschaft', icon: '💰', type: 'income', amount: 100000, monthlyChange: 0 },
  { name: 'Lohnerhöhung', icon: '📈', type: 'recurring', amount: 0, monthlyChange: 500 },
  { name: 'Sabbatical / Teilzeit', icon: '🏖️', type: 'recurring', amount: 0, monthlyChange: -2000 },
];

const formatCHF = (n: number) => n.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

let nextId = 1;
const genId = () => `fp-${nextId++}`;

const currentYear = new Date().getFullYear();

export function MeinFinanzplanTool({ mode = 'internal' }: Props) {
  const { user } = useAuth();
  const { profile } = useMetaProfile();
  const { score: peakScore, monthlyExpenses: peakExpenses } = usePeakScore();

  const age = profile?.age ?? 30;
  const monthlyIncome = profile?.monthly_income ?? 6000;
  const monthlyExpenses = peakExpenses > 0 ? peakExpenses : (profile?.fixed_costs ?? 4000);
  const currentWealth = profile?.wealth ?? 0;
  const currentPeakScore = peakScore ?? (monthlyExpenses > 0 ? currentWealth / monthlyExpenses : 0);

  const [events, setEvents] = useState<FinancialEvent[]>([]);
  const [calculated, setCalculated] = useState(false);
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');

  // Detailed view assumptions
  const [inflationRate, setInflationRate] = useState(2);
  const [salaryGrowth, setSalaryGrowth] = useState(1.5);
  const [investReturn, setInvestReturn] = useState(5);

  // Custom event form
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<EventType>('expense');
  const [customYear, setCustomYear] = useState(currentYear + 2);
  const [customAmount, setCustomAmount] = useState('');
  const [customMonthly, setCustomMonthly] = useState('');

  const addPreset = (preset: typeof PRESETS[0]) => {
    setEvents(prev => [...prev, {
      id: genId(),
      name: preset.name,
      type: preset.type,
      year: currentYear + 3,
      amount: preset.amount,
      monthlyChange: preset.monthlyChange,
    }]);
  };

  const addCustomEvent = () => {
    if (!customName.trim()) return;
    setEvents(prev => [...prev, {
      id: genId(),
      name: customName.trim(),
      type: customType,
      year: customYear,
      amount: parseFloat(customAmount) || 0,
      monthlyChange: parseFloat(customMonthly) || 0,
    }]);
    setCustomName('');
    setCustomAmount('');
    setCustomMonthly('');
  };

  const removeEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));
  const updateEvent = (id: string, field: keyof FinancialEvent, value: any) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  // Projection calculation
  const projection = useMemo(() => {
    const years: { year: number; age: number; income: number; expenses: number; net: number; wealth: number; peakScore: number }[] = [];
    let annualIncome = monthlyIncome * 12;
    let annualExpenses = monthlyExpenses * 12;
    let wealth = currentWealth;

    const sortedEvents = [...events].sort((a, b) => a.year - b.year);

    for (let y = currentYear; y <= currentYear + (85 - age); y++) {
      const yearAge = age + (y - currentYear);

      // Apply events for this year
      for (const ev of sortedEvents) {
        if (ev.year === y) {
          if (ev.type === 'income') {
            wealth += ev.amount;
          } else if (ev.type === 'expense') {
            wealth -= ev.amount;
          }
          if (ev.type === 'recurring' || (ev.type === 'expense' && ev.monthlyChange !== 0)) {
            if (ev.monthlyChange > 0) annualIncome += ev.monthlyChange * 12;
            else annualExpenses += Math.abs(ev.monthlyChange) * 12;
          }
        }
      }

      const net = annualIncome - annualExpenses;
      wealth += net;
      // Apply investment return on wealth
      if (wealth > 0) wealth *= (1 + investReturn / 100);

      const monthlyExp = annualExpenses / 12;
      const ps = monthlyExp > 0 ? wealth / monthlyExp : 0;

      years.push({ year: y, age: yearAge, income: annualIncome, expenses: annualExpenses, net, wealth: Math.round(wealth), peakScore: Math.round(ps * 10) / 10 });

      // Apply growth for next year
      annualIncome *= (1 + salaryGrowth / 100);
      annualExpenses *= (1 + inflationRate / 100);
    }
    return years;
  }, [events, monthlyIncome, monthlyExpenses, currentWealth, age, investReturn, salaryGrowth, inflationRate]);

  // Baseline projection (no events)
  const baselineProjection = useMemo(() => {
    let annualIncome = monthlyIncome * 12;
    let annualExpenses = monthlyExpenses * 12;
    let wealth = currentWealth;
    const years: { year: number; peakScore: number }[] = [];

    for (let y = currentYear; y <= currentYear + (85 - age); y++) {
      const net = annualIncome - annualExpenses;
      wealth += net;
      if (wealth > 0) wealth *= (1 + investReturn / 100);
      const monthlyExp = annualExpenses / 12;
      const ps = monthlyExp > 0 ? wealth / monthlyExp : 0;
      years.push({ year: y, peakScore: Math.round(ps * 10) / 10 });
      annualIncome *= (1 + salaryGrowth / 100);
      annualExpenses *= (1 + inflationRate / 100);
    }
    return years;
  }, [monthlyIncome, monthlyExpenses, currentWealth, age, investReturn, salaryGrowth, inflationRate]);

  const handleCalculate = () => {
    setCalculated(true);
    if (user) {
      supabase.from('gamification_actions').insert({
        user_id: user.id, action_type: 'tool_used', action_ref: 'mein-finanzplan', points_awarded: 25,
      });
    }
  };

  // Find PeakScore at age 50
  const psAt50 = projection.find(p => p.age === 50)?.peakScore ?? 0;
  const baseAt50Idx = 50 - age;
  const baseAt50 = baselineProjection[baseAt50Idx]?.peakScore ?? 0;

  // Timeline visualization helpers
  const timelineStart = currentYear;
  const timelineEnd = currentYear + (85 - age);
  const timelineRange = timelineEnd - timelineStart;

  // Chart: simplified bar representation of PeakScore over decades
  const decadeYears = [currentYear, currentYear + 10, currentYear + 20, currentYear + 30, currentYear + 40, currentYear + 50].filter(y => y <= timelineEnd);
  const maxPs = Math.max(...projection.filter(p => decadeYears.includes(p.year)).map(p => p.peakScore), 1);

  const typeColor = (type: EventType) => type === 'income' ? 'text-emerald-500' : type === 'expense' ? 'text-destructive' : 'text-primary';
  const typeBg = (type: EventType) => type === 'income' ? 'bg-emerald-500' : type === 'expense' ? 'bg-destructive' : 'bg-primary';
  const typeLabel = (type: EventType) => type === 'income' ? 'Einnahme' : type === 'expense' ? 'Ausgabe' : 'Wiederkehrend';

  return (
    <PdfExportWrapper toolName="Mein Finanzplan">
      <div className="space-y-4">
        {/* View toggle */}
        <div className="flex gap-1 p-0.5 bg-muted/50 rounded-lg w-fit mx-auto">
          <button
            onClick={() => setViewMode('simple')}
            className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", viewMode === 'simple' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
          >
            Einfach
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", viewMode === 'detailed' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
          >
            Detailliert
          </button>
        </div>

        {/* Step 1: Events */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Geplante Ereignisse</p>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(p => (
                <button
                  key={p.name}
                  onClick={() => addPreset(p)}
                  className="text-xs px-2.5 py-1.5 rounded-full border bg-muted/40 border-border/50 hover:bg-accent/40 text-foreground transition-colors"
                >
                  {p.icon} {p.name}
                </button>
              ))}
            </div>

            {/* Custom event */}
            <div className="bg-muted/20 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">➕ Eigenes Ereignis</p>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Name" value={customName} onChange={e => setCustomName(e.target.value)} className="h-8 text-xs col-span-2" />
                <Select value={customType} onValueChange={v => setCustomType(v as EventType)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Einnahme</SelectItem>
                    <SelectItem value="expense">Ausgabe</SelectItem>
                    <SelectItem value="recurring">Wiederkehrend</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Jahr" value={customYear} onChange={e => setCustomYear(parseInt(e.target.value) || currentYear)} className="h-8 text-xs" />
                <Input type="number" placeholder="Betrag CHF" value={customAmount} onChange={e => setCustomAmount(e.target.value)} className="h-8 text-xs" />
                {customType === 'recurring' && (
                  <Input type="number" placeholder="+/- CHF/Mt." value={customMonthly} onChange={e => setCustomMonthly(e.target.value)} className="h-8 text-xs" />
                )}
              </div>
              <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={addCustomEvent} disabled={!customName.trim()}>
                <Plus className="h-3 w-3 mr-1" /> Hinzufügen
              </Button>
            </div>

            {/* Event list */}
            <AnimatePresence>
              {events.length > 0 && (
                <div className="space-y-1.5">
                  {events.map(ev => (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/20"
                    >
                      <div className={cn("w-2 h-2 rounded-full shrink-0", typeBg(ev.type))} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{ev.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {ev.year} · {typeLabel(ev.type)}
                          {ev.amount > 0 && ` · CHF ${formatCHF(ev.amount)}`}
                          {ev.monthlyChange !== 0 && ` · ${ev.monthlyChange > 0 ? '+' : ''}${formatCHF(ev.monthlyChange)}/Mt.`}
                        </p>
                      </div>
                      <Input
                        type="number"
                        value={ev.year}
                        onChange={e => updateEvent(ev.id, 'year', parseInt(e.target.value) || currentYear)}
                        className="w-16 h-7 text-[10px]"
                      />
                      <button onClick={() => removeEvent(ev.id)} className="text-muted-foreground hover:text-destructive p-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {events.length > 0 && !calculated && (
              <Button className="w-full" onClick={handleCalculate}>
                Finanzplan erstellen 📋
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Detailed view: assumptions */}
        {viewMode === 'detailed' && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">Annahmen</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px]">Inflation: {inflationRate}%</Label>
                  <Slider value={[inflationRate]} onValueChange={v => setInflationRate(v[0])} min={0} max={5} step={0.5} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Lohnwachstum: {salaryGrowth}%</Label>
                  <Slider value={[salaryGrowth]} onValueChange={v => setSalaryGrowth(v[0])} min={0} max={5} step={0.5} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Rendite: {investReturn}%</Label>
                  <Slider value={[investReturn]} onValueChange={v => setInvestReturn(v[0])} min={0} max={10} step={0.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {calculated && events.length > 0 && (
          <div className="space-y-3">
            {/* Timeline */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardContent className="p-4 space-y-4">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">Lebens-Timeline</p>

                  {/* Horizontal timeline */}
                  <div className="relative h-16 px-2">
                    {/* Line */}
                    <div className="absolute top-6 left-2 right-2 h-0.5 bg-border" />
                    {/* Start/End labels */}
                    <div className="absolute top-9 left-2 text-[9px] text-muted-foreground">Heute ({age})</div>
                    <div className="absolute top-9 right-2 text-[9px] text-muted-foreground">85</div>
                    {/* Event markers */}
                    {events.map(ev => {
                      const pos = timelineRange > 0 ? ((ev.year - timelineStart) / timelineRange) * 100 : 50;
                      const clampedPos = Math.max(3, Math.min(97, pos));
                      return (
                        <div
                          key={ev.id}
                          className="absolute -translate-x-1/2"
                          style={{ left: `${clampedPos}%`, top: '0' }}
                        >
                          <div className={cn("w-3 h-3 rounded-full border-2 border-background shadow-sm", typeBg(ev.type))} />
                          <p className="text-[8px] text-muted-foreground whitespace-nowrap mt-0.5 -ml-4 max-w-[60px] truncate">{ev.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* PeakScore projection chart */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">PeakScore-Entwicklung</p>

                  {/* Simplified bar chart by decade */}
                  <div className="flex items-end gap-2 h-32 px-1">
                    {decadeYears.map((y, i) => {
                      const projPs = projection.find(p => p.year === y)?.peakScore ?? 0;
                      const basePs = baselineProjection.find(p => p.year === y)?.peakScore ?? 0;
                      const projH = maxPs > 0 ? (projPs / maxPs) * 100 : 0;
                      const baseH = maxPs > 0 ? (basePs / maxPs) * 100 : 0;
                      const yearAge = age + (y - currentYear);
                      return (
                        <div key={y} className="flex-1 flex flex-col items-center gap-1">
                          <div className="flex gap-0.5 items-end w-full h-24">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${baseH}%` }}
                              transition={{ duration: 0.5, delay: i * 0.08 }}
                              className="flex-1 bg-muted-foreground/20 rounded-t-sm min-h-[2px]"
                            />
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${projH}%` }}
                              transition={{ duration: 0.5, delay: i * 0.08 + 0.05 }}
                              className="flex-1 bg-primary/60 rounded-t-sm min-h-[2px]"
                            />
                          </div>
                          <p className="text-[9px] text-muted-foreground">{yearAge}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-muted-foreground/20 rounded-sm" /> Ohne Ereignisse</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-primary/60 rounded-sm" /> Mit Ereignissen</div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 text-center space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      Ohne Ereignisse: PeakScore <span className="font-bold text-foreground">{baseAt50.toFixed(1)}</span> mit 50
                    </p>
                    <p className="text-muted-foreground">
                      Mit deinen Ereignissen: PeakScore <span className={cn("font-bold", psAt50 >= baseAt50 ? "text-primary" : "text-destructive")}>{psAt50.toFixed(1)}</span> mit 50
                    </p>
                    {psAt50 !== baseAt50 && (
                      <p className="text-xs text-muted-foreground">
                        Differenz: <span className={cn("font-semibold", psAt50 >= baseAt50 ? "text-primary" : "text-destructive")}>
                          {psAt50 >= baseAt50 ? '+' : ''}{formatPeakScoreDuration(psAt50 - baseAt50)}
                        </span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Detailed view: year-by-year table */}
            {viewMode === 'detailed' && (
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">Jahresübersicht</p>
                    <div className="overflow-x-auto -mx-2">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="text-muted-foreground border-b border-border">
                            <th className="text-left py-1 px-1.5 font-medium">Jahr</th>
                            <th className="text-left py-1 px-1.5 font-medium">Alter</th>
                            <th className="text-right py-1 px-1.5 font-medium">Einnahmen</th>
                            <th className="text-right py-1 px-1.5 font-medium">Ausgaben</th>
                            <th className="text-right py-1 px-1.5 font-medium">Netto</th>
                            <th className="text-right py-1 px-1.5 font-medium">Vermögen</th>
                            <th className="text-right py-1 px-1.5 font-medium">PS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projection.filter((_, i) => i % 5 === 0 || i === projection.length - 1).map(row => {
                            const hasEvent = events.some(e => e.year === row.year);
                            return (
                              <tr key={row.year} className={cn("border-b border-border/30", hasEvent && "bg-primary/5")}>
                                <td className="py-1 px-1.5 font-medium">{row.year}</td>
                                <td className="py-1 px-1.5">{row.age}</td>
                                <td className="py-1 px-1.5 text-right">{formatCHF(row.income)}</td>
                                <td className="py-1 px-1.5 text-right">{formatCHF(row.expenses)}</td>
                                <td className={cn("py-1 px-1.5 text-right font-medium", row.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>{row.net >= 0 ? '+' : ''}{formatCHF(row.net)}</td>
                                <td className="py-1 px-1.5 text-right font-medium">{formatCHF(row.wealth)}</td>
                                <td className="py-1 px-1.5 text-right font-bold text-primary">{row.peakScore.toFixed(1)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Conversion */}
            {mode === 'internal' && (
              <>
                <ToolReflection
                  question="Welche Entscheidung hat den grössten Einfluss auf deine Zukunft?"
                  context="Ein Finanzplan macht die Zukunft greifbar – und deine Entscheidungen bewusster."
                />
                <ToolTrustNote text="Vereinfachte Projektion – keine Garantie für zukünftige Entwicklungen." />
              </>
            )}
          </div>
        )}
      </div>
    </PdfExportWrapper>
  );
}
