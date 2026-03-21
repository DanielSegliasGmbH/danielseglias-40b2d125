import { PdfExportWrapper } from '../PdfExportWrapper';
import { ToolNextStep } from '../ToolNextStep';
import { ToolReflection, ToolTrustNote, ToolSoftCta } from '../ToolConversionElements';
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Clock, Hourglass, TrendingUp, ArrowRightLeft, AlertTriangle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { calculate, formatCHF, type ZeitverlustInputs } from './calcLogic';

interface Props {
  mode?: 'internal' | 'public';
}

export function ZeitverlustSimulatorTool({ mode = 'internal' }: Props) {
  const [inputs, setInputs] = useState<ZeitverlustInputs>({
    currentAge: 30,
    targetAge: 65,
    monthlyContribution: 300,
    annualReturnPct: 6,
    delayYears: 5,
    startCapital: 0,
  });

  const update = <K extends keyof ZeitverlustInputs>(key: K, v: ZeitverlustInputs[K]) =>
    setInputs(prev => ({ ...prev, [key]: v }));

  const result = useMemo(() => calculate(inputs), [inputs]);

  const tooltipFormatter = (value: number) => formatCHF(value);

  return (
    <PdfExportWrapper toolName="Zeitverlust-Simulator" hideExport={mode === 'public'}>
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Hourglass className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Zeitverlust-Simulator
          </h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
          Was kostet es dich, wenn du mit dem Investieren wartest? Nicht perfekte Entscheidungen
          sind das Problem – sondern langes Warten.
        </p>
      </div>

      {/* Inputs + Chart */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* ── Inputs ── */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6 space-y-5">
            {/* Current age */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Dein Alter</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number" min={18} max={64}
                  value={inputs.currentAge}
                  onChange={e => update('currentAge', Math.min(Math.max(parseInt(e.target.value) || 18, 18), 64))}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">Jahre</span>
              </div>
              <Slider min={18} max={64} step={1} value={[inputs.currentAge]}
                onValueChange={([v]) => update('currentAge', v)} />
            </div>

            {/* Target age */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Zielalter</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number" min={inputs.currentAge + 1} max={85}
                  value={inputs.targetAge}
                  onChange={e => update('targetAge', Math.min(Math.max(parseInt(e.target.value) || 50, inputs.currentAge + 1), 85))}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">Jahre</span>
              </div>
              <Slider min={inputs.currentAge + 1} max={85} step={1} value={[inputs.targetAge]}
                onValueChange={([v]) => update('targetAge', v)} />
            </div>

            {/* Monthly */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Monatlicher Beitrag</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number" min={50} max={10000} step={50}
                  value={inputs.monthlyContribution}
                  onChange={e => update('monthlyContribution', Math.min(Math.max(parseInt(e.target.value) || 50, 50), 10000))}
                  className="w-28"
                />
                <span className="text-sm text-muted-foreground">CHF / Monat</span>
              </div>
              <Slider min={50} max={5000} step={50} value={[inputs.monthlyContribution]}
                onValueChange={([v]) => update('monthlyContribution', v)} />
            </div>

            {/* Return */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Erwartete Rendite p.a.</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number" min={1} max={12} step={0.5}
                  value={inputs.annualReturnPct}
                  onChange={e => update('annualReturnPct', Math.min(Math.max(parseFloat(e.target.value) || 1, 1), 12))}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <Slider min={1} max={12} step={0.5} value={[inputs.annualReturnPct]}
                onValueChange={([v]) => update('annualReturnPct', v)} />
            </div>

            {/* Delay */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Startverzögerung</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number" min={1} max={Math.max(inputs.targetAge - inputs.currentAge - 1, 1)}
                  value={inputs.delayYears}
                  onChange={e => update('delayYears', Math.min(Math.max(parseInt(e.target.value) || 1, 1), inputs.targetAge - inputs.currentAge - 1))}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">Jahre warten</span>
              </div>
              <Slider min={1} max={Math.max(inputs.targetAge - inputs.currentAge - 1, 1)} step={1}
                value={[inputs.delayYears]}
                onValueChange={([v]) => update('delayYears', v)} />
            </div>

            {/* Start capital */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Startkapital (optional)</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number" min={0} max={1000000} step={1000}
                  value={inputs.startCapital}
                  onChange={e => update('startCapital', Math.min(Math.max(parseInt(e.target.value) || 0, 0), 1000000))}
                  className="w-28"
                />
                <span className="text-sm text-muted-foreground">CHF</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Chart ── */}
        <Card className="lg:col-span-3">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-4">Vermögensentwicklung</p>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradEarly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradLate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="age" tick={{ fontSize: 12 }} label={{ value: 'Alter', position: 'insideBottomRight', offset: -5, fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={tooltipFormatter} labelFormatter={(l) => `Alter ${l}`} />
                  <Legend />
                  <Area type="monotone" dataKey="earlyValue" name="Start heute" stroke="hsl(var(--primary))" fill="url(#gradEarly)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="lateValue" name={`Start in ${inputs.delayYears} J.`} stroke="hsl(var(--muted-foreground))" fill="url(#gradLate)" strokeWidth={2} strokeDasharray="6 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Difference highlight ── */}
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-foreground">
                {inputs.delayYears} {inputs.delayYears === 1 ? 'Jahr' : 'Jahre'} warten kostet dich voraussichtlich{' '}
                <span className="text-destructive">{formatCHF(result.lostWealth)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Um das gleiche Ergebnis zu erreichen, müsstest du statt{' '}
                <span className="font-semibold">{formatCHF(inputs.monthlyContribution)}</span> pro Monat rund{' '}
                <span className="font-semibold text-foreground">{formatCHF(result.requiredMonthlyToMatch)}</span>{' '}
                investieren.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Scenario cards ── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Early */}
        <Card className="border-primary/30">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Start heute (Alter {result.early.startAge})</h3>
            </div>
            <MetricRow label="Laufzeit" value={`${result.early.years} Jahre`} />
            <MetricRow label="Einzahlungen total" value={formatCHF(result.early.totalContributions)} />
            <MetricRow label="Endvermögen" value={formatCHF(result.early.endValue)} highlight />
            <MetricRow label="Ertrag / Gewinn" value={formatCHF(result.early.profit)} />
          </CardContent>
        </Card>

        {/* Late */}
        <Card className="border-muted">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Start in {inputs.delayYears} {inputs.delayYears === 1 ? 'Jahr' : 'Jahren'} (Alter {result.late.startAge})</h3>
            </div>
            <MetricRow label="Laufzeit" value={`${result.late.years} Jahre`} />
            <MetricRow label="Einzahlungen total" value={formatCHF(result.late.totalContributions)} />
            <MetricRow label="Endvermögen" value={formatCHF(result.late.endValue)} />
            <MetricRow label="Ertrag / Gewinn" value={formatCHF(result.late.profit)} />
          </CardContent>
        </Card>
      </div>

      {/* ── Summary metrics ── */}
      <div className="grid sm:grid-cols-3 gap-4">
        <SummaryCard icon={<ArrowRightLeft className="h-5 w-5" />} label="Vermögensverlust" value={formatCHF(result.lostWealth)} variant="destructive" />
        <SummaryCard icon={<TrendingUp className="h-5 w-5" />} label="Verpasster Ertrag" value={formatCHF(result.lostProfit)} variant="destructive" />
        <SummaryCard icon={<Hourglass className="h-5 w-5" />} label="Verlorene Jahre am Markt" value={`${result.lostYearsAtMarket} Jahre`} variant="warning" />
      </div>

      {/* ── Closing message ── */}
      <Card className="bg-muted/40 border-none">
        <CardContent className="py-8 text-center max-w-xl mx-auto space-y-2">
          <p className="text-base font-medium text-foreground leading-relaxed">
            «Die Frage ist nicht, ob der perfekte Zeitpunkt da ist –
          </p>
          <p className="text-base font-medium text-foreground leading-relaxed">
            sondern wie viel dich das Warten auf den perfekten Zeitpunkt kostet.»
          </p>
        </CardContent>
      </Card>

      {/* Reflection */}
      <ToolReflection
        question="Was wäre dir lieber: Jetzt starten und profitieren – oder in 5 Jahren bereuen, dass du gewartet hast?"
        context={`Jeder weitere Monat Warten kostet dich rund ${formatCHF(Math.round(result.lostWealth / (inputs.delayYears * 12)))} an potenziellem Vermögen.`}
      />

      {/* Soft CTA */}
      <ToolSoftCta
        text="Lass uns gemeinsam den besten Einstieg für dich finden – ohne Druck, ohne Verpflichtung."
        note="Ein kurzes Gespräch reicht oft, um den ersten konkreten Schritt zu machen."
      />

      <ToolTrustNote text="Unabhängig · Transparent · Dein Tempo" />

      <ToolNextStep
        insightText="Jeder Monat Warten kostet dich bares Geld. Die Frage ist nicht ob, sondern wie du jetzt am besten startest."
        primary={{
          question: "Welches Risiko kann ich mir leisten?",
          description: "Simuliere verschiedene Szenarien und finde die richtige Balance zwischen Sicherheit und Rendite.",
          targetSlug: "rendite-risiko-simulation",
          buttonLabel: "Szenarien simulieren",
          recommended: true,
        }}
        secondary={{
          question: "Wie frisst die Inflation mein Geld?",
          description: "Sieh, wie Warten und Inflation zusammen wirken.",
          targetSlug: "inflationsrechner",
          buttonLabel: "Inflation berechnen",
        }}
      />
    </div>
    </PdfExportWrapper>
  );
}

/* ── Helper components ── */

function MetricRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-semibold tabular-nums ${highlight ? 'text-primary text-lg' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  );
}

function SummaryCard({ icon, label, value, variant }: { icon: React.ReactNode; label: string; value: string; variant: 'destructive' | 'warning' }) {
  const colors = variant === 'destructive'
    ? 'bg-destructive/5 border-destructive/20 text-destructive'
    : 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-400';

  return (
    <div className={`rounded-lg border p-4 ${colors}`}>
      <div className="flex items-center gap-2 mb-1 opacity-70">{icon}<span className="text-xs font-medium">{label}</span></div>
      <p className="text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}
