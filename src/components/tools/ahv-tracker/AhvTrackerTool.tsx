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
import { Landmark, Plus, Trash2, AlertTriangle, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  mode?: 'internal' | 'public';
}

const fmtCHF = (v: number) => `CHF ${Math.round(v).toLocaleString('de-CH')}`;

const PHASE_TYPES = [
  { value: 'angestellt', label: 'Angestellt' },
  { value: 'selbststaendig', label: 'Selbstständig' },
  { value: 'lehrling', label: 'Lehrling' },
  { value: 'student', label: 'Student/in' },
  { value: 'arbeitslos', label: 'Arbeitslos' },
  { value: 'mutterschaft', label: 'Mutterschaft / Elternzeit' },
  { value: 'kein_einkommen', label: 'Kein Einkommen' },
];

interface LifePhase {
  id: string;
  fromYear: string;
  toYear: string;
  type: string;
  avgIncome: string;
}

const AHV_RATE = 0.087; // 8.7% total (employee + employer)
const MIN_CONTRIBUTION = 514; // CHF per year for non-earning
const FULL_YEARS = 44;
const MAX_MONTHLY_SINGLE = 2450;
const MAX_YEARLY_SINGLE = 29400;
const MAX_MONTHLY_COUPLE = 3675;
const MAX_YEARLY_COUPLE = 44100;

// Simplified Skala 44 mapping: average income → monthly pension (single)
function estimateMonthlyPension(avgLifetimeIncome: number, contributionYears: number): number {
  const yearFactor = Math.min(1, contributionYears / FULL_YEARS);

  // Simplified scale: linear interpolation between min and max
  // Min pension ~CHF 1'225/month at very low income
  // Max pension ~CHF 2'450/month at income >= ~88'200
  const MIN_PENSION = 1225;
  const INCOME_CAP = 88200;

  const incomeFactor = Math.min(1, avgLifetimeIncome / INCOME_CAP);
  const basePension = MIN_PENSION + (MAX_MONTHLY_SINGLE - MIN_PENSION) * incomeFactor;

  return Math.round(basePension * yearFactor);
}

function getContributionForPhase(type: string, income: number): number {
  switch (type) {
    case 'angestellt':
    case 'selbststaendig':
      return income * AHV_RATE;
    case 'lehrling':
      return income * AHV_RATE * 0.5; // reduced
    case 'student':
    case 'arbeitslos':
    case 'mutterschaft':
    case 'kein_einkommen':
      return MIN_CONTRIBUTION;
    default:
      return MIN_CONTRIBUTION;
  }
}

function isContributingPhase(type: string): boolean {
  return ['angestellt', 'selbststaendig', 'lehrling'].includes(type);
}

let idCounter = 0;
const newPhase = (): LifePhase => ({
  id: `phase-${++idCounter}-${Date.now()}`,
  fromYear: '',
  toYear: '',
  type: 'angestellt',
  avgIncome: '',
});

export function AhvTrackerTool({ mode = 'internal' }: Props) {
  const { user } = useAuth();
  const { profile } = useMetaProfile();

  const [phases, setPhases] = useState<LifePhase[]>([newPhase()]);
  const [currentIncome, setCurrentIncome] = useState('');
  const [civilStatus, setCivilStatus] = useState<'single' | 'couple'>('single');
  const [calculated, setCalculated] = useState(false);

  const effectiveIncome = currentIncome || String((profile?.monthly_income || 0) * 12 || '');
  const currentYear = new Date().getFullYear();

  const addPhase = () => setPhases(p => [...p, newPhase()]);
  const removePhase = (id: string) => setPhases(p => p.filter(ph => ph.id !== id));
  const updatePhase = (id: string, field: keyof LifePhase, value: string) => {
    setPhases(p => p.map(ph => ph.id === id ? { ...ph, [field]: value } : ph));
  };

  const results = useMemo(() => {
    const validPhases = phases.filter(p => p.fromYear && p.toYear && parseInt(p.toYear) >= parseInt(p.fromYear));
    if (validPhases.length === 0) return null;

    let totalPaid = 0;
    let contributionYears = 0;
    let missingYears = 0;
    let totalIncomeYears = 0;
    let totalIncome = 0;

    // Timeline segments
    const segments: Array<{ year: number; type: string; contributing: boolean; income: number }> = [];

    for (const phase of validPhases) {
      const from = parseInt(phase.fromYear);
      const to = parseInt(phase.toYear);
      const income = parseFloat(phase.avgIncome) || 0;
      const years = to - from + 1;

      for (let y = from; y <= to; y++) {
        const contribution = getContributionForPhase(phase.type, income);
        totalPaid += contribution;
        segments.push({ year: y, type: phase.type, contributing: isContributingPhase(phase.type), income });

        if (isContributingPhase(phase.type)) {
          contributionYears++;
          totalIncome += income;
          totalIncomeYears++;
        } else {
          missingYears++;
        }
      }
    }

    // Add current year to retirement (assume 65)
    const age = profile?.age || 30;
    const retirementAge = 65;
    const yearsToRetirement = Math.max(0, retirementAge - age);
    const incomeNow = parseFloat(effectiveIncome) || 0;

    // Future contribution years
    const futureYears = yearsToRetirement;
    const futureContributions = futureYears * incomeNow * AHV_RATE;
    const totalContributionYears = contributionYears + futureYears;

    // Average lifetime income
    const avgIncome = totalIncomeYears > 0
      ? (totalIncome + incomeNow * futureYears) / (totalIncomeYears + futureYears)
      : incomeNow;

    // Pension calculation
    const monthlyPension = estimateMonthlyPension(avgIncome, Math.min(FULL_YEARS, totalContributionYears));
    const isCapped = civilStatus === 'couple';
    const cappedMonthly = isCapped ? Math.min(monthlyPension * 1.5, MAX_MONTHLY_COUPLE) : monthlyPension;
    const yearlyPension = cappedMonthly * 12;

    // Pension as % of current income
    const pensionRatio = incomeNow > 0 ? (yearlyPension / incomeNow) * 100 : 0;

    // Reduction from missing years
    const reductionPerMissingYear = yearlyPension / FULL_YEARS;
    const estimatedReduction = Math.round(missingYears * reductionPerMissingYear);

    return {
      totalPaid: Math.round(totalPaid),
      futureContributions: Math.round(futureContributions),
      totalLifetime: Math.round(totalPaid + futureContributions),
      contributionYears,
      totalContributionYears: Math.min(FULL_YEARS, totalContributionYears),
      missingYears,
      monthlyPension: Math.round(cappedMonthly),
      yearlyPension: Math.round(yearlyPension),
      pensionRatio: Math.round(pensionRatio * 10) / 10,
      avgIncome: Math.round(avgIncome),
      estimatedReduction: Math.round(estimatedReduction),
      segments,
      yearsToRetirement,
    };
  }, [phases, effectiveIncome, civilStatus, profile?.age]);

  const handleCalculate = async () => {
    setCalculated(true);
    if (user && results) {
      await supabase.from('gamification_actions').insert({
        user_id: user.id,
        action_type: 'tool_used',
        action_ref: 'ahv-tracker',
        points_awarded: 25,
      });
    }
  };

  const isValid = phases.some(p => p.fromYear && p.toYear && parseInt(p.toYear) >= parseInt(p.fromYear));

  // Build timeline for visualization
  const timelineYears = useMemo(() => {
    if (!results?.segments.length) return [];
    const minYear = Math.min(...results.segments.map(s => s.year));
    const maxYear = Math.max(...results.segments.map(s => s.year), currentYear);
    const years: Array<{ year: number; contributing: boolean; type: string }> = [];
    for (let y = minYear; y <= maxYear; y++) {
      const seg = results.segments.find(s => s.year === y);
      years.push({
        year: y,
        contributing: seg?.contributing ?? false,
        type: seg?.type ?? 'kein_einkommen',
      });
    }
    return years;
  }, [results, currentYear]);

  return (
    <PdfExportWrapper toolName="AHV-Tracker">
      <div className="space-y-6">
        {/* Section A: Life phases */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm font-semibold">Dein bisheriger Werdegang</p>

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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Von (Jahr)</Label>
                    <Input type="number" min="1960" max={currentYear} value={phase.fromYear} onChange={e => updatePhase(phase.id, 'fromYear', e.target.value)} placeholder="z.B. 2010" />
                  </div>
                  <div>
                    <Label className="text-xs">Bis (Jahr)</Label>
                    <Input type="number" min="1960" max={currentYear} value={phase.toYear} onChange={e => updatePhase(phase.id, 'toYear', e.target.value)} placeholder="z.B. 2024" />
                  </div>
                  <div>
                    <Label className="text-xs">Typ</Label>
                    <Select value={phase.type} onValueChange={v => updatePhase(phase.id, 'type', v)}>
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PHASE_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Ø Jahreseinkommen (CHF)</Label>
                    <Input type="number" min="0" step="1000" value={phase.avgIncome} onChange={e => updatePhase(phase.id, 'avgIncome', e.target.value)} placeholder={isContributingPhase(phase.type) ? 'z.B. 65000' : 'Optional'} />
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" size="sm" onClick={addPhase} className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Phase hinzufügen
            </Button>
          </CardContent>
        </Card>

        {/* Section B: Current situation */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm font-semibold">Aktuelle Situation</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Aktuelles Jahreseinkommen (CHF)</Label>
                <Input type="number" min="0" step="1000" value={effectiveIncome} onChange={e => setCurrentIncome(e.target.value)} placeholder="z.B. 85000" />
                {profile?.monthly_income && !currentIncome && (
                  <p className="text-[11px] text-primary mt-1">Aus deinem Finanzprofil übernommen</p>
                )}
              </div>
              <div>
                <Label>Zivilstand</Label>
                <Select value={civilStatus} onValueChange={v => setCivilStatus(v as 'single' | 'couple')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Alleinstehend</SelectItem>
                    <SelectItem value="couple">Verheiratet / Partnerschaft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCalculate} disabled={!isValid} className="w-full gap-2">
              <Landmark className="h-4 w-4" /> AHV berechnen
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {calculated && results && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Hero cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Paid so far */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-5 text-center">
                  <p className="text-[11px] text-muted-foreground mb-1">Bereits einbezahlt</p>
                  <PrivateValue className="text-xl font-bold text-primary">{fmtCHF(results.totalPaid)}</PrivateValue>
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>{results.contributionYears} Jahre</span>
                      <span>{FULL_YEARS} Jahre</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(100, (results.contributionYears / FULL_YEARS) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{results.contributionYears} / {FULL_YEARS} Beitragsjahre</p>
                  </div>
                </CardContent>
              </Card>

              {/* Expected pension */}
              <Card>
                <CardContent className="py-5 text-center">
                  <p className="text-[11px] text-muted-foreground mb-1">Erwartete Rente</p>
                  <PrivateValue className="text-xl font-bold">{fmtCHF(results.monthlyPension)} / Mt.</PrivateValue>
                  <p className="text-xs text-muted-foreground mt-1">{fmtCHF(results.yearlyPension)} / Jahr</p>
                  {results.pensionRatio > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      = <span className="font-medium text-foreground">{results.pensionRatio}%</span> deines aktuellen Lohns
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Gap warning */}
              <Card className={cn(results.missingYears > 0 ? "border-destructive/30" : "border-primary/20")}>
                <CardContent className="py-5 text-center">
                  <p className="text-[11px] text-muted-foreground mb-1">Beitragslücken</p>
                  {results.missingYears > 0 ? (
                    <>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-lg font-bold text-destructive">{results.missingYears} Jahre</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Rentenreduktion: ca. <PrivateValue className="inline font-medium">{fmtCHF(results.estimatedReduction)}</PrivateValue> / Jahr
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Keine Lücken</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            {timelineYears.length > 0 && (
              <Card>
                <CardContent className="pt-5">
                  <p className="text-sm font-medium mb-3">Beitragszeitachse</p>
                  <div className="flex gap-[1px] flex-wrap">
                    {timelineYears.map(y => (
                      <div
                        key={y.year}
                        className={cn(
                          "h-6 flex-1 min-w-[6px] max-w-[16px] rounded-sm transition-colors",
                          y.contributing ? "bg-primary" : "bg-destructive/40"
                        )}
                        title={`${y.year}: ${PHASE_TYPES.find(t => t.value === y.type)?.label || y.type}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>{timelineYears[0]?.year}</span>
                    <span>{timelineYears[timelineYears.length - 1]?.year}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary" /> Beitragsjahre</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-destructive/40" /> Lücken</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Missing years info */}
            {results.missingYears > 0 && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="py-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <p className="text-sm font-semibold">Beitragslücken beachten</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Du hast <strong>{results.missingYears} Jahre</strong> ohne volle AHV-Beiträge.
                    Das reduziert deine Rente um schätzungsweise <PrivateValue className="inline font-medium">{fmtCHF(results.estimatedReduction)}</PrivateValue> pro Jahr.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Du kannst fehlende Beiträge bis zu 5 Jahre nach Eintritt nachzahlen.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* IK-Auszug action */}
            <Card>
              <CardContent className="py-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Genauere Daten?</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Bestelle deinen individuellen Kontoauszug (IK-Auszug) bei deiner Ausgleichskasse für exakte Zahlen.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => window.open('https://www.ahv-iv.ch/de/Sozialversicherungen/Alters-und-Hinterlassenenversicherung-AHV', '_blank', 'noopener,noreferrer')}
                >
                  IK-Auszug bestellen <ExternalLink className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>

            {/* Future phase 2 note */}
            <Card className="border-muted bg-muted/30">
              <CardContent className="py-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  💡 <strong>Bald verfügbar:</strong> In Zukunft wirst du hier deinen IK-Auszug hochladen können — die KI extrahiert dann automatisch alle Daten. Aktuell: manuelle Eingabe.
                </p>
              </CardContent>
            </Card>

            {/* Snapshot */}
            {mode === 'internal' && (
              <ToolSnapshotButton
                toolSlug="ahv-tracker"
                toolName="AHV-Tracker"
                snapshotData={{
                  totalPaid: results.totalPaid,
                  contributionYears: results.contributionYears,
                  missingYears: results.missingYears,
                  monthlyPension: results.monthlyPension,
                  yearlyPension: results.yearlyPension,
                  pensionRatio: results.pensionRatio,
                }}
              />
            )}

            {mode === 'internal' && (
              <ToolReflection
                question="Weisst du, wie hoch deine AHV-Rente wirklich sein wird — und reicht dir das?"
                context="Die AHV deckt oft nur 30–40% des letzten Einkommens. Der Rest muss aus der 2. und 3. Säule kommen."
              />
            )}
          </motion.div>
        )}

        <ToolTrustNote text="Schätzung basierend auf vereinfachter Skala 44. Kein Ersatz für den offiziellen IK-Auszug." />
      </div>
    </PdfExportWrapper>
  );
}
