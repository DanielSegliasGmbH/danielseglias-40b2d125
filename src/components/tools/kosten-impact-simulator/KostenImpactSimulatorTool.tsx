import { PdfExportWrapper } from '../PdfExportWrapper';
import { ToolNextStep } from '../ToolNextStep';
import { ToolReflection, ToolTrustNote, ToolSoftCta } from '../ToolConversionElements';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Info, ArrowRight, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { calculate, formatCHF, MAX_CONTRIBUTION, type ImpactInputs } from './calcLogic';

interface Props {
  mode?: 'public' | 'internal';
}

export function KostenImpactSimulatorTool({ mode = 'internal' }: Props) {
  const [inputs, setInputs] = useState<ImpactInputs>({
    startCapital: 25000,
    annualContribution: 7000,
    years: 30,
    expectedReturn: 5,
    costA: 1.5,
    costB: 0.5,
  });

  const update = <K extends keyof ImpactInputs>(key: K) => (v: ImpactInputs[K]) =>
    setInputs(prev => ({ ...prev, [key]: v }));

  const result = useMemo(() => calculate(inputs), [inputs]);

  const workYearsEquivalent = Math.round(result.difference / 60000);

  return (
    <PdfExportWrapper toolName="Kosten-Impact-Simulator" hideExport={mode === 'public'}>
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Kosten-Impact-Simulator</h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
          Vergleiche zwei Szenarien und erkenne, wie sich selbst kleine Kostenunterschiede über Zeit auswirken.
        </p>
      </div>

      {/* ─── Eingabe ─── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Parameter</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Startkapital */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Startkapital (CHF)</Label>
            <Input
              type="number"
              min={0}
              value={inputs.startCapital || ''}
              placeholder="25000"
              onChange={e => update('startCapital')(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>

          {/* Jährliche Einzahlung */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Jährliche Einzahlung (CHF)</Label>
            <Input
              type="number"
              min={0}
              max={MAX_CONTRIBUTION}
              value={inputs.annualContribution}
              onChange={e => update('annualContribution')(Math.min(Math.max(0, parseInt(e.target.value) || 0), MAX_CONTRIBUTION))}
            />
            <Slider
              min={0}
              max={MAX_CONTRIBUTION}
              step={100}
              value={[inputs.annualContribution]}
              onValueChange={v => update('annualContribution')(v[0])}
            />
          </div>

          {/* Laufzeit */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Laufzeit: {inputs.years} Jahre</Label>
            <Slider
              min={5}
              max={45}
              step={1}
              value={[inputs.years]}
              onValueChange={v => update('years')(v[0])}
            />
          </div>

          {/* Rendite */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Erwartete Rendite: {inputs.expectedReturn} %</Label>
            <Slider
              min={2}
              max={10}
              step={0.5}
              value={[inputs.expectedReturn]}
              onValueChange={v => update('expectedReturn')(v[0])}
            />
          </div>

          {/* Kosten A */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Kosten Szenario A: {inputs.costA} %</Label>
            <Slider
              min={0}
              max={4}
              step={0.1}
              value={[inputs.costA]}
              onValueChange={v => update('costA')(v[0])}
            />
            <p className="text-xs text-muted-foreground">Höhere Kosten</p>
          </div>

          {/* Kosten B */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Kosten Szenario B: {inputs.costB} %</Label>
            <Slider
              min={0}
              max={4}
              step={0.1}
              value={[inputs.costB]}
              onValueChange={v => update('costB')(v[0])}
            />
            <p className="text-xs text-muted-foreground">Tiefere Kosten</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick toggle */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            update('costA')(inputs.costA + 1);
          }}
        >
          +1 % bei Szenario A
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            update('costA')(Math.max(0, inputs.costA - 0.5));
            update('costB')(Math.max(0, inputs.costB - 0.5));
          }}
        >
          Beide −0.5 %
        </Button>
      </div>

      {/* ─── Chart ─── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Vermögensentwicklung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12 }}
                  tickFormatter={v => `${v}J`}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={v => `${Math.round(v / 1000)}k`}
                  className="fill-muted-foreground"
                  width={48}
                />
                <Tooltip
                  formatter={(value: number) => [`CHF ${formatCHF(value)}`]}
                  labelFormatter={l => `Jahr ${l}`}
                  contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="valueA"
                  name="Szenario A (höhere Kosten)"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={800}
                />
                <Line
                  type="monotone"
                  dataKey="valueB"
                  name="Szenario B (tiefere Kosten)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ─── Ergebnis-Karten ─── */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">Szenario A ({inputs.costA} % Kosten)</p>
            <p className="text-xl font-bold text-foreground">CHF {formatCHF(result.finalA)}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/30">
          <CardContent className="py-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">Szenario B ({inputs.costB} % Kosten)</p>
            <p className="text-xl font-bold text-primary">CHF {formatCHF(result.finalB)}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">Unterschied durch Kosten</p>
            <p className="text-2xl font-extrabold text-destructive">CHF {formatCHF(result.difference)}</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Highlight Box ─── */}
      {result.difference > 0 && (
        <Card className="border-destructive/30">
          <CardContent className="py-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">Unterschied durch Kosten über {result.years} Jahre</p>
            <p className="text-5xl font-extrabold text-destructive tracking-tight">
              CHF {formatCHF(result.difference)}
            </p>
            {workYearsEquivalent >= 1 && (
              <p className="text-sm text-muted-foreground">
                Das entspricht etwa <span className="font-semibold text-foreground">{workYearsEquivalent} {workYearsEquivalent === 1 ? 'Jahr' : 'Jahren'} Arbeit</span> (bei CHF 60'000/Jahr)
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Emotionaler Erklärungstext ─── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-foreground/90 leading-relaxed">
                Selbst kleine Kostenunterschiede können über Zeit einen massiven Einfluss haben.
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed">
                In diesem Beispiel führt ein Unterschied von nur <span className="font-semibold">{result.costDiffPct.toFixed(1)} %</span> zu einer Differenz von <span className="font-semibold text-destructive">CHF {formatCHF(result.difference)}</span>.
              </p>
              <p className="text-sm text-foreground/70 italic">
                „Der grösste Feind deines Vermögens ist nicht das Risiko – sondern die Kosten."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reflection */}
      <ToolReflection
        question="Bist du bereit, diesen Betrag über die nächsten Jahre zu verlieren – oder möchtest du das ändern?"
        context="Der Unterschied entsteht nicht durch mehr Risiko, sondern durch klügere Strukturierung."
      />

      {/* ─── Admin: Annahmen ─── */}
      {mode === 'internal' && (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4" />
              Berechnungslogik (intern)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>• Effektive Rendite = Bruttorendite − Kosten</p>
            <p>• Zinseszins mit jährlicher Einzahlung (End-of-Year)</p>
            <p>• Keine Berücksichtigung von Steuern, Inflation oder Fondsstruktur</p>
            <p>• Max. Einzahlung 3a: CHF {MAX_CONTRIBUTION}</p>
          </CardContent>
        </Card>
      )}

      {/* Soft CTA */}
      <ToolSoftCta
        text="Ich zeige dir gerne, wie du diese Differenz für dich zurückholst."
        note="Basierend auf deinen Zahlen schauen wir, wo der grösste Hebel liegt."
      />

      <ToolTrustNote text="Unabhängige Beratung · Keine versteckten Kosten · Du entscheidest" />

      <ToolNextStep
        insightText="Du siehst jetzt den konkreten Preisunterschied. Aber wie wahrscheinlich ist es, dass du dein finanzielles Ziel mit diesen Kosten erreichst?"
        primary={{
          question: "Erreiche ich mein Ziel trotz dieser Kosten?",
          description: "Berechne die Wahrscheinlichkeit, dein Sparziel zu erreichen.",
          targetSlug: "wahrscheinlichkeitsrechner",
          buttonLabel: "Wahrscheinlichkeit prüfen",
          recommended: true,
        }}
        secondary={{
          question: "Lohnt sich ein Wechsel meiner 3a-Lösung?",
          description: "Vergleiche deine bestehende mit einer optimierten Lösung.",
          targetSlug: "vergleichsrechner-3a",
          buttonLabel: "Vergleich starten",
        }}
      />
    </div>
    </PdfExportWrapper>
  );
}
