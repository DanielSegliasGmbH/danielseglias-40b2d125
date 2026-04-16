import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PdfExportWrapper } from '@/components/tools/PdfExportWrapper';
import { ToolReflection, ToolTrustNote } from '@/components/tools/ToolConversionElements';
import { ToolSnapshotButton } from '@/components/tools/ToolSnapshotButton';
import { PrivateValue } from '@/components/client-portal/PrivateValue';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Plus, Trash2, TrendingUp, Lightbulb, ArrowRight, AlertTriangle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Props {
  mode?: 'internal' | 'public';
}

const fmtCHF = (v: number) => `CHF ${Math.round(v).toLocaleString('de-CH')}`;

const MODELS = [
  { value: 'standard', label: 'Standard' },
  { value: 'hausarzt', label: 'Hausarzt' },
  { value: 'hmo', label: 'HMO' },
  { value: 'telmed', label: 'Telmed' },
];

interface PremiumPhase {
  id: string;
  fromYear: string;
  toYear: string;
  monthlyPremium: string;
  insurer: string;
  franchise: string;
  model: string;
}

let idCounter = 0;
const newPhase = (): PremiumPhase => ({
  id: `kk-${++idCounter}-${Date.now()}`,
  fromYear: '',
  toYear: '',
  monthlyPremium: '',
  insurer: '',
  franchise: '300',
  model: 'standard',
});

const PREMIUM_INCREASE_RATE = 0.03; // 3% annual average
const HOURLY_WAGE_DEFAULT = 40; // CHF/hour as rough estimate

export function KrankenkassenTrackerTool({ mode = 'internal' }: Props) {
  const { user } = useAuth();
  const { profile } = useMetaProfile();
  const navigate = useNavigate();

  const [phases, setPhases] = useState<PremiumPhase[]>([newPhase()]);
  const [currentPremium, setCurrentPremium] = useState('');
  const [currentFranchise, setCurrentFranchise] = useState('300');
  const [calculated, setCalculated] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const effectivePremium = currentPremium || '';

  const addPhase = () => setPhases(p => [...p, newPhase()]);
  const removePhase = (id: string) => setPhases(p => p.filter(ph => ph.id !== id));
  const updatePhase = (id: string, field: keyof PremiumPhase, value: string) => {
    setPhases(p => p.map(ph => ph.id === id ? { ...ph, [field]: value } : ph));
  };

  const results = useMemo(() => {
    const premium = parseFloat(effectivePremium) || 0;
    const validPhases = phases.filter(p => p.fromYear && p.toYear && parseFloat(p.monthlyPremium) > 0);

    // Total paid in past phases
    let totalPastPaid = 0;
    for (const phase of validPhases) {
      const from = parseInt(phase.fromYear);
      const to = parseInt(phase.toYear);
      const mp = parseFloat(phase.monthlyPremium);
      const years = Math.max(0, to - from + 1);
      totalPastPaid += mp * 12 * years;
    }

    // Current year contribution
    const currentYearPaid = premium * currentMonth;
    const totalPaid = Math.round(totalPastPaid + currentYearPaid);

    // Annual spend
    const annualSpend = Math.round(premium * 12);

    // Hours of work per year
    const hourlyWage = profile?.monthly_income
      ? (profile.monthly_income * 12) / (42 * 48) // 42h/week, 48 weeks
      : HOURLY_WAGE_DEFAULT;
    const hoursPerYear = hourlyWage > 0 ? Math.round(annualSpend / hourlyWage) : 0;

    // 10-year projection
    const projectionYears: Array<{ year: number; amount: number }> = [];
    let tenYearTotal = 0;
    for (let i = 0; i < 10; i++) {
      const projected = annualSpend * Math.pow(1 + PREMIUM_INCREASE_RATE, i);
      projectionYears.push({ year: currentYear + i, amount: Math.round(projected) });
      tenYearTotal += projected;
    }

    // Optimization: cheapest insurer estimate (~20% less for HMO/Telmed)
    const cheapestEstimate = Math.round(premium * 0.8);
    const annualSavings = Math.round((premium - cheapestEstimate) * 12);
    const savingsOver30Years = Math.round(annualSavings * 30);

    // Investment value of savings at 6% p.a. over 30 years
    let investmentValue = 0;
    for (let i = 0; i < 30; i++) {
      investmentValue += annualSavings * Math.pow(1.06, 30 - i);
    }
    investmentValue = Math.round(investmentValue);

    // Deadline check
    const isNearDeadline = currentMonth >= 9; // Sept onwards

    return {
      totalPaid,
      annualSpend,
      hoursPerYear,
      tenYearTotal: Math.round(tenYearTotal),
      projectionYears,
      cheapestEstimate,
      annualSavings,
      savingsOver30Years,
      investmentValue,
      isNearDeadline,
    };
  }, [phases, effectivePremium, currentMonth, currentYear, profile?.monthly_income]);

  const handleCalculate = async () => {
    setCalculated(true);
    if (user && results) {
      await supabase.from('gamification_actions').insert({
        user_id: user.id,
        action_type: 'tool_used',
        action_ref: 'krankenkassen-tracker',
        points_awarded: 20,
      });
    }
  };

  const isValid = parseFloat(effectivePremium) > 0;

  return (
    <PdfExportWrapper toolName="Krankenkassen-Tracker">
      <div className="space-y-6">
        {/* Section A: History */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm font-semibold">Deine Krankenkassen-Historie</p>

            {phases.map((phase, idx) => (
              <div key={phase.id} className="border border-border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Phase {idx + 1}</span>
                  {phases.length > 1 && (
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removePhase(phase.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Von (Jahr)</Label>
                    <Input type="number" min="1980" max={currentYear} value={phase.fromYear} onChange={e => updatePhase(phase.id, 'fromYear', e.target.value)} placeholder="z.B. 2015" />
                  </div>
                  <div>
                    <Label className="text-xs">Bis (Jahr)</Label>
                    <Input type="number" min="1980" max={currentYear} value={phase.toYear} onChange={e => updatePhase(phase.id, 'toYear', e.target.value)} placeholder="z.B. 2023" />
                  </div>
                  <div>
                    <Label className="text-xs">Monatliche Prämie (CHF)</Label>
                    <Input type="number" min="0" step="10" value={phase.monthlyPremium} onChange={e => updatePhase(phase.id, 'monthlyPremium', e.target.value)} placeholder="z.B. 350" />
                  </div>
                  <div>
                    <Label className="text-xs">Krankenkasse</Label>
                    <Input value={phase.insurer} onChange={e => updatePhase(phase.id, 'insurer', e.target.value)} placeholder="z.B. CSS, Helsana" />
                  </div>
                  <div>
                    <Label className="text-xs">Franchise (CHF)</Label>
                    <Select value={phase.franchise} onValueChange={v => updatePhase(phase.id, 'franchise', v)}>
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[300, 500, 1000, 1500, 2000, 2500].map(f => (
                          <SelectItem key={f} value={String(f)}>{fmtCHF(f)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Modell</Label>
                    <Select value={phase.model} onValueChange={v => updatePhase(phase.id, 'model', v)}>
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MODELS.map(m => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" size="sm" onClick={addPhase} className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Phase hinzufügen
            </Button>
          </CardContent>
        </Card>

        {/* Section B: Current */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm font-semibold">Aktuelle Situation</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Aktuelle monatliche Prämie (CHF)</Label>
                <Input type="number" min="0" step="10" value={effectivePremium} onChange={e => setCurrentPremium(e.target.value)} placeholder="z.B. 420" />
              </div>
              <div>
                <Label>Aktuelle Franchise (CHF)</Label>
                <Select value={currentFranchise} onValueChange={setCurrentFranchise}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[300, 500, 1000, 1500, 2000, 2500].map(f => (
                      <SelectItem key={f} value={String(f)}>{fmtCHF(f)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCalculate} disabled={!isValid} className="w-full gap-2">
              <Heart className="h-4 w-4" /> Krankenkassen-Kosten berechnen
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {calculated && results && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Hero */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Du hast bereits bezahlt</p>
                <PrivateValue className="text-3xl font-bold text-primary">{fmtCHF(results.totalPaid)}</PrivateValue>
                <p className="text-xs text-muted-foreground mt-2">Im Laufe deines Lebens für die Krankenkasse.</p>
              </CardContent>
            </Card>

            {/* 3 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-[11px] text-muted-foreground mb-1">Jährlich</p>
                  <PrivateValue className="text-lg font-bold">{fmtCHF(results.annualSpend)}</PrivateValue>
                  {results.hoursPerYear > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-1">≈ {results.hoursPerYear} Arbeitsstunden / Jahr</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-[11px] text-muted-foreground mb-1">Nächste 10 Jahre</p>
                  <PrivateValue className="text-lg font-bold">{fmtCHF(results.tenYearTotal)}</PrivateValue>
                  <p className="text-[10px] text-muted-foreground mt-1">Bei 3% jährlicher Steigerung</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="py-4 text-center">
                  <p className="text-[11px] text-muted-foreground mb-1">Optimierungspotenzial</p>
                  {results.annualSavings > 0 ? (
                    <>
                      <PrivateValue className="text-lg font-bold text-primary">{fmtCHF(results.annualSavings)} / Jahr</PrivateValue>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Günstigster Anbieter: ca. <PrivateValue className="inline">{fmtCHF(results.cheapestEstimate)}</PrivateValue> / Mt.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Gib deine Prämie ein</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 10-year projection chart */}
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-medium mb-3">Prämienentwicklung (10-Jahres-Prognose)</p>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results.projectionYears} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                      <Tooltip
                        formatter={(value: number) => [fmtCHF(value), 'Jahresprämie']}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                      />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" opacity={0.7} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Wake-up call */}
            {results.annualSavings > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">Wusstest du?</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Wenn du <PrivateValue className="inline font-medium">{fmtCHF(results.annualSavings)}</PrivateValue> pro Jahr einsparst
                    und investierst (6% p.a.), sind das in 30 Jahren:
                  </p>
                  <PrivateValue className="text-xl font-bold text-primary block text-center">
                    {fmtCHF(results.investmentValue)}
                  </PrivateValue>
                  <p className="text-[11px] text-muted-foreground text-center">
                    Über 30 Jahre sparst du allein an Prämien: <PrivateValue className="inline">{fmtCHF(results.savingsOver30Years)}</PrivateValue>
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Deadline reminder */}
            {results.isNearDeadline && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="py-4 flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Fristen beachten!</p>
                    <p className="text-xs text-muted-foreground">
                      Kündigung für neues Jahr bis <strong>30. November</strong> einreichen!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            {mode === 'internal' && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => navigate('/app/client-portal/tools/versicherungs-check')}
                >
                  Versicherungs-Check öffnen <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Snapshot */}
            {mode === 'internal' && (
              <ToolSnapshotButton
                toolSlug="krankenkassen-tracker"
                toolName="Krankenkassen-Tracker"
                snapshotData={{
                  totalPaid: results.totalPaid,
                  annualSpend: results.annualSpend,
                  tenYearTotal: results.tenYearTotal,
                  annualSavings: results.annualSavings,
                  investmentValue: results.investmentValue,
                }}
              />
            )}

            {mode === 'internal' && (
              <ToolReflection
                question="Hast du deine Krankenkasse in den letzten 3 Jahren verglichen?"
                context="Die meisten Schweizer:innen zahlen zu viel, weil sie ihren Anbieter nie wechseln — obwohl die Leistungen im Grundversicherungsbereich identisch sind."
              />
            )}
          </motion.div>
        )}

        <ToolTrustNote text="Schätzung basierend auf deinen Angaben. Prämien variieren nach Kanton, Alter und Franchise." />
      </div>
    </PdfExportWrapper>
  );
}
