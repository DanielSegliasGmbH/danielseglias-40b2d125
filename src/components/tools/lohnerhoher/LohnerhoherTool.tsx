import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { PdfExportWrapper } from '@/components/tools/PdfExportWrapper';
import { ToolReflection, ToolTrustNote } from '@/components/tools/ToolConversionElements';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatPeakScoreImpact } from '@/lib/peakScoreFormat';
import { Briefcase, TrendingUp, Target, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  mode?: 'internal' | 'public';
}

const INDUSTRIES = [
  { value: 'it', label: 'IT' },
  { value: 'finanzen', label: 'Finanzen' },
  { value: 'gesundheit', label: 'Gesundheit' },
  { value: 'bildung', label: 'Bildung' },
  { value: 'bau', label: 'Bau' },
  { value: 'gastronomie', label: 'Gastronomie' },
  { value: 'handel', label: 'Handel' },
  { value: 'industrie', label: 'Industrie' },
  { value: 'dienstleistung', label: 'Dienstleistung' },
  { value: 'oeffentlich', label: 'Öffentlicher Dienst' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

const REGIONS = [
  { value: 'zuerich', label: 'Zürich', factor: 1.1 },
  { value: 'bern', label: 'Bern', factor: 1.0 },
  { value: 'basel', label: 'Basel', factor: 1.05 },
  { value: 'innerschweiz', label: 'Innerschweiz', factor: 0.95 },
  { value: 'ostschweiz', label: 'Ostschweiz', factor: 0.93 },
  { value: 'romandie', label: 'Romandie', factor: 0.97 },
  { value: 'tessin', label: 'Tessin', factor: 0.88 },
];

const EDUCATION = [
  { value: 'keine', label: 'Keine formale Ausbildung', factor: 0.82 },
  { value: 'lehre', label: 'Lehre', factor: 0.92 },
  { value: 'fh', label: 'Fachhochschule', factor: 1.05 },
  { value: 'uni', label: 'Universität', factor: 1.15 },
];

// Approximate Swiss BFS median gross monthly salaries by industry
const INDUSTRY_MEDIANS: Record<string, number> = {
  it: 8900, finanzen: 9200, gesundheit: 6800, bildung: 7500,
  bau: 6200, gastronomie: 4600, handel: 6000, industrie: 7000,
  dienstleistung: 6500, oeffentlich: 7800, sonstiges: 6500,
};

const formatCHF = (n: number) =>
  n.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function getAdjustedMedian(industry: string, region: string, education: string, years: number) {
  const base = INDUSTRY_MEDIANS[industry] ?? 6500;
  const regionFactor = REGIONS.find(r => r.value === region)?.factor ?? 1;
  const eduFactor = EDUCATION.find(e => e.value === education)?.factor ?? 1;
  const expFactor = 1 + Math.min(years, 25) * 0.012; // ~1.2% per year, capped
  return Math.round(base * regionFactor * eduFactor * expFactor);
}

export function LohnerhoherTool({ mode = 'internal' }: Props) {
  const { user } = useAuth();
  const { profile } = useMetaProfile();

  const [salary, setSalary] = useState(profile?.monthly_income ?? 6000);
  const [industry, setIndustry] = useState('');
  const [years, setYears] = useState(5);
  const [region, setRegion] = useState('');
  const [education, setEducation] = useState('');
  const [raise, setRaise] = useState(500);
  const [calculated, setCalculated] = useState(false);
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  const median = useMemo(() => {
    if (!industry || !region || !education) return 0;
    return getAdjustedMedian(industry, region, education, years);
  }, [industry, region, education, years]);

  const minSalary = Math.round(median * 0.65);
  const maxSalary = Math.round(median * 1.45);
  const pctOfMedian = median > 0 ? (salary / median) * 100 : 0;
  const diff = median - salary;
  const belowMedian = diff > 0;

  // Raise calculation
  const raiseNetFactor = 0.87 * 0.82; // social + ~18% tax
  const raiseNetMonthly = raise * raiseNetFactor;
  const raiseNetYearly = raiseNetMonthly * 12;
  const monthlyExpenses = profile?.fixed_costs ?? 4000;
  const peakScorePerYear = monthlyExpenses > 0 ? raiseNetYearly / monthlyExpenses : 0;

  const canCalculate = industry && region && education && salary > 0;

  const handleCalculate = () => {
    setCalculated(true);
    if (user) {
      supabase.from('gamification_actions').insert({
        user_id: user.id, action_type: 'tool_used', action_ref: 'lohnerhoher', points_awarded: 20,
      });
    }
  };

  const tips = [
    {
      icon: '🎯', title: 'Die Langfrist-Strategie',
      text: `Sag deinem Chef: «Ich möchte irgendwann in dieser Firma CHF ${formatCHF(raise)} mehr verdienen. Was genau muss ich dafür leisten?» — So zeigst du Initiative und bekommst einen klaren Fahrplan.`,
    },
    {
      icon: '⏰', title: 'Timing ist alles',
      text: 'Die besten Zeitpunkte: nach einem erfolgreichen Projektabschluss, beim Jahresgespräch, oder wenn du ein externes Angebot hast.',
    },
    {
      icon: '📋', title: 'Vorbereitung',
      text: 'Dokumentiere deine Erfolge, sammle positives Feedback, und kenne deinen Marktwert (dieser Rechner).',
    },
    {
      icon: '🎁', title: 'Nicht nur Lohn',
      text: 'Verhandle auch: Homeoffice-Tage, Weiterbildungsbudget, Bonus, Pensionskassen-Beiträge, zusätzliche Ferientage.',
    },
  ];

  const cardAnim = (i: number) => ({
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.3 } },
  });

  // Position on bar (clamped 0-100%)
  const userPos = useMemo(() => {
    if (maxSalary <= minSalary) return 50;
    return Math.max(2, Math.min(98, ((salary - minSalary) / (maxSalary - minSalary)) * 100));
  }, [salary, minSalary, maxSalary]);
  const medianPos = useMemo(() => {
    if (maxSalary <= minSalary) return 50;
    return ((median - minSalary) / (maxSalary - minSalary)) * 100;
  }, [median, minSalary, maxSalary]);

  return (
    <PdfExportWrapper toolName="Lohnerhöher">
      <div className="space-y-4">
        {/* Step 1: Inputs */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Deine Angaben</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Aktuelles Brutto-Monatsgehalt (CHF)</Label>
                <Input type="number" value={salary || ''} onChange={e => setSalary(parseFloat(e.target.value) || 0)} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Branche</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger><SelectValue placeholder="Branche wählen…" /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Berufserfahrung: {years} Jahre</Label>
                <Slider value={[years]} onValueChange={v => setYears(v[0])} min={0} max={30} step={1} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Region</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger><SelectValue placeholder="Region wählen…" /></SelectTrigger>
                  <SelectContent>
                    {REGIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Ausbildung</Label>
                <Select value={education} onValueChange={setEducation}>
                  <SelectTrigger><SelectValue placeholder="Ausbildung wählen…" /></SelectTrigger>
                  <SelectContent>
                    {EDUCATION.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!calculated && (
              <Button className="w-full" onClick={handleCalculate} disabled={!canCalculate}>
                Marktwert berechnen 💼
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {calculated && median > 0 && (
          <div className="space-y-3">
            {/* Step 2: Market comparison */}
            <motion.div variants={cardAnim(0)} initial="hidden" animate="visible">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2 justify-center">
                    <Target className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Marktvergleich</p>
                  </div>

                  {/* Bar visualization */}
                  <div className="relative pt-8 pb-4 px-1">
                    {/* Labels above bar */}
                    <div className="absolute top-0 left-0 right-0 h-7">
                      <div className="absolute text-[10px] font-bold text-primary -translate-x-1/2" style={{ left: `${userPos}%` }}>
                        <div className="flex flex-col items-center">
                          <span>Du</span>
                          <span className="text-[9px] text-primary/70">CHF {formatCHF(salary)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Bar */}
                    <div className="relative h-4 bg-muted/60 rounded-full overflow-visible">
                      {/* Gradient fill */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-destructive/30 via-amber-500/30 to-emerald-500/30" />
                      {/* Median marker */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/40 z-10" style={{ left: `${medianPos}%` }} />
                      {/* User marker */}
                      <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background shadow-md z-20 -translate-x-1/2" style={{ left: `${userPos}%` }} />
                    </div>
                    {/* Bottom labels */}
                    <div className="flex justify-between mt-1.5 text-[9px] text-muted-foreground">
                      <span>CHF {formatCHF(minSalary)}</span>
                      <span className="absolute left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground" style={{ left: `${medianPos}%` }}>
                        Median: CHF {formatCHF(median)}
                      </span>
                      <span>CHF {formatCHF(maxSalary)}</span>
                    </div>
                  </div>

                  <div className="text-center space-y-1.5">
                    <p className="text-sm text-muted-foreground">
                      Du verdienst <span className={cn("font-bold", belowMedian ? "text-amber-500" : "text-emerald-500")}>{pctOfMedian.toFixed(0)}%</span> vom Branchenmedian.
                    </p>
                    {belowMedian ? (
                      <p className="text-sm font-medium text-primary">
                        Du hast Potenzial für eine Lohnerhöhung von ca. CHF {formatCHF(diff)} / Monat
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Du verdienst überdurchschnittlich. Fokussiere auf Vermögensaufbau.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 3: What does a raise bring? */}
            <motion.div variants={cardAnim(1)} initial="hidden" animate="visible">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2 justify-center">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Was bringt eine Lohnerhöhung?</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Gewünschte Erhöhung: CHF {formatCHF(raise)} / Monat</Label>
                    <Slider value={[raise]} onValueChange={v => setRaise(v[0])} min={100} max={2000} step={50} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2.5 rounded-lg bg-muted/30">
                      <p className="text-lg font-black text-foreground">CHF {formatCHF(raiseNetMonthly)}</p>
                      <p className="text-[10px] text-muted-foreground">Netto / Monat</p>
                    </div>
                    <div className="text-center p-2.5 rounded-lg bg-muted/30">
                      <p className="text-lg font-black text-foreground">CHF {formatCHF(raiseNetYearly)}</p>
                      <p className="text-[10px] text-muted-foreground">Netto / Jahr</p>
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center space-y-1">
                    <p className="text-sm text-muted-foreground">
                      PeakScore-Effekt: <span className="font-bold text-primary">+{peakScorePerYear.toFixed(1)} pro Jahr</span>
                    </p>
                    {peakScorePerYear > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Mit CHF {formatCHF(raise)} mehr im Monat gewinnst du <span className="font-bold text-primary">{formatPeakScoreImpact(peakScorePerYear)}</span> mehr Freiheit pro Jahr.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 4: Tips */}
            <motion.div variants={cardAnim(2)} initial="hidden" animate="visible">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 justify-center">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Vorbereitung Lohngespräch</p>
                  </div>

                  <div className="space-y-1.5">
                    {tips.map((tip, i) => {
                      const open = expandedTip === i;
                      return (
                        <button
                          key={i}
                          onClick={() => setExpandedTip(open ? null : i)}
                          className="w-full text-left p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base shrink-0">{tip.icon}</span>
                            <span className="flex-1 text-sm font-medium text-foreground">{tip.title}</span>
                            {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          {open && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="text-[13px] text-muted-foreground mt-2 leading-relaxed"
                            >
                              {tip.text}
                            </motion.p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {mode === 'internal' && (
              <>
                <ToolReflection
                  question="Was ist dir deine Lebenszeit wert?"
                  context="Jeder Franken mehr Lohn bringt dich näher an finanzielle Freiheit – wenn du ihn investierst statt ausgibst."
                />
                <ToolTrustNote text="Basierend auf BFS-Medianlohndaten – keine individuelle Lohnberatung." />
              </>
            )}
          </div>
        )}
      </div>
    </PdfExportWrapper>
  );
}
