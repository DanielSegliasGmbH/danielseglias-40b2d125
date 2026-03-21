import { PdfExportWrapper } from '../PdfExportWrapper';
import { ToolNextStep } from '../ToolNextStep';
import { ToolReflection, ToolTrustNote, ToolSoftCta } from '../ToolConversionElements';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Target, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import {
  calculate, formatCHF, getColor, getConsequenceText,
  type ProbabilityInputs,
} from './calcLogic';

interface Props {
  mode?: 'public' | 'internal';
}

const goalLabels: Record<string, string> = {
  early_retirement: 'Früher in Rente (ca. 60)',
  financial_freedom: 'Finanzielle Freiheit',
  homeownership: 'Eigenheim kaufen',
};

const investmentLabels: Record<string, string> = {
  sparkonto: 'Sparkonto (Ø 0.5 %)',
  versicherung: 'Versicherung (Ø 2 %)',
  etf: 'ETF / Wertschriften (Ø 6 %)',
};

export function WahrscheinlichkeitsrechnerTool({ mode = 'internal' }: Props) {
  const [inputs, setInputs] = useState<ProbabilityInputs>({
    age: 30,
    monthlyIncome: 6000,
    monthlySavings: 500,
    currentWealth: 20000,
    investmentType: 'sparkonto',
    goal: 'financial_freedom',
    riskTolerance: 3,
    discipline: 3,
  });

  const update = <K extends keyof ProbabilityInputs>(key: K) => (v: ProbabilityInputs[K]) =>
    setInputs(prev => ({ ...prev, [key]: v }));

  const result = useMemo(() => calculate(inputs), [inputs]);

  const color = getColor(result.probability);
  const optColor = getColor(result.optimizedProbability);

  const colorClasses = {
    destructive: {
      text: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      progress: 'bg-destructive',
    },
    warning: {
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-500/30',
      progress: 'bg-amber-500',
    },
    success: {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-500/30',
      progress: 'bg-emerald-500',
    },
  };

  const cc = colorClasses[color];
  const occ = colorClasses[optColor];

  return (
    <PdfExportWrapper toolName="Wahrscheinlichkeitsrechner" hideExport={mode === 'public'}>
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Wie wahrscheinlich ist dein finanzieller Erfolg?
          </h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
          Finde heraus, ob dein aktueller Weg zu deinem Ziel führt – und was du verändern kannst.
        </p>
      </div>

      {/* ─── Eingabe ─── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Deine Situation</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-6">
          {/* Alter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Dein Alter: {inputs.age}</Label>
            <Slider min={18} max={60} step={1} value={[inputs.age]} onValueChange={v => update('age')(v[0])} />
          </div>

          {/* Einkommen */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Monatliches Einkommen (CHF)</Label>
            <Input
              type="number" min={0}
              value={inputs.monthlyIncome || ''}
              placeholder="6000"
              onChange={e => update('monthlyIncome')(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>

          {/* Sparbetrag */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Monatlicher Sparbetrag (CHF)</Label>
            <Input
              type="number" min={0}
              value={inputs.monthlySavings || ''}
              placeholder="500"
              onChange={e => update('monthlySavings')(Math.max(0, parseInt(e.target.value) || 0))}
            />
            <Slider
              min={0} max={Math.max(inputs.monthlyIncome, 1000)} step={50}
              value={[inputs.monthlySavings]}
              onValueChange={v => update('monthlySavings')(v[0])}
            />
          </div>

          {/* Vermögen */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Vorhandenes Vermögen (CHF)</Label>
            <Input
              type="number" min={0}
              value={inputs.currentWealth || ''}
              placeholder="20000"
              onChange={e => update('currentWealth')(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>

          {/* Anlageform */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Aktuelle Anlageform</Label>
            <Select value={inputs.investmentType} onValueChange={v => update('investmentType')(v as ProbabilityInputs['investmentType'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sparkonto">Sparkonto (Ø 0.5 %)</SelectItem>
                <SelectItem value="versicherung">Versicherung (Ø 2 %)</SelectItem>
                <SelectItem value="etf">ETF / Wertschriften (Ø 6 %)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ziel */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Dein Ziel</Label>
            <Select value={inputs.goal} onValueChange={v => update('goal')(v as ProbabilityInputs['goal'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="early_retirement">Früher in Rente (ca. 60)</SelectItem>
                <SelectItem value="financial_freedom">Finanzielle Freiheit</SelectItem>
                <SelectItem value="homeownership">Eigenheim kaufen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Risikobereitschaft */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Risikobereitschaft: {inputs.riskTolerance}/5</Label>
            <Slider min={1} max={5} step={1} value={[inputs.riskTolerance]} onValueChange={v => update('riskTolerance')(v[0])} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Sicherheit</span><span>Wachstum</span>
            </div>
          </div>

          {/* Disziplin */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Disziplin (Selbsteinschätzung): {inputs.discipline}/5</Label>
            <Slider min={1} max={5} step={1} value={[inputs.discipline]} onValueChange={v => update('discipline')(v[0])} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Unregelmässig</span><span>Sehr konsequent</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Hauptergebnis ─── */}
      <Card className={`${cc.border} ${cc.bg}`}>
        <CardContent className="py-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">Deine aktuelle Wahrscheinlichkeit</p>
          <p className={`text-6xl font-extrabold tracking-tight ${cc.text}`}>
            {result.probability} %
          </p>
          <div className="max-w-md mx-auto">
            <div className="h-4 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${cc.progress}`}
                style={{ width: `${result.probability}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Ziel: <span className="font-medium text-foreground">{goalLabels[inputs.goal]}</span>
            {' · '}Benötigtes Kapital: <span className="font-medium text-foreground">CHF {formatCHF(result.targetCapital)}</span>
          </p>
        </CardContent>
      </Card>

      {/* ─── Konsequenz ─── */}
      <Card className={`${cc.border}`}>
        <CardContent className="py-6 flex gap-3">
          {result.probability < 40 ? (
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          ) : result.probability < 70 ? (
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          )}
          <p className="text-sm text-foreground/90 leading-relaxed">
            {getConsequenceText(result.probability, inputs.goal)}
          </p>
        </CardContent>
      </Card>

      {/* ─── Faktor-Aufschlüsselung ─── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Was beeinflusst dein Ergebnis?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.factors.map(f => (
            <div key={f.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{f.label} ({f.weight} %)</span>
                <span className="font-medium text-foreground">{f.score}/100</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    f.score < 40 ? 'bg-destructive' : f.score < 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${f.score}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ─── Optimiertes Szenario ─── */}
      {inputs.investmentType !== 'etf' && (
        <Card className={`${occ.border} ${occ.bg}`}>
          <CardContent className="py-6 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Mit optimierter Strategie möglich</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Aktuell ({investmentLabels[inputs.investmentType]?.split(' (')[0]})</p>
                <p className={`text-3xl font-bold ${cc.text}`}>{result.probability} %</p>
                <p className="text-sm text-muted-foreground mt-1">CHF {formatCHF(result.currentEndWealth)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Optimiert (ETF / Wertschriften)</p>
                <p className={`text-3xl font-bold ${occ.text}`}>{result.optimizedProbability} %</p>
                <p className="text-sm text-muted-foreground mt-1">CHF {formatCHF(result.optimizedEndWealth)}</p>
              </div>
            </div>
            {result.missedPotential > 0 && (
              <div className="text-center pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Du verschenkst aktuell ca.{' '}
                  <span className="font-bold text-destructive">CHF {formatCHF(result.missedPotential)}</span>
                  {' '}Potenzial
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Emotionaler Abschluss ─── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-6 flex gap-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-foreground/90 leading-relaxed">
              Diese Berechnung zeigt dir, wo du heute stehst – nicht wo du stehen bleiben musst.
            </p>
            <p className="text-sm text-foreground/70 italic">
              „Die beste Zeit zu starten war vor 10 Jahren. Die zweitbeste ist jetzt."
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ─── Admin: Annahmen ─── */}
      {mode === 'internal' && (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4" />
              Berechnungsannahmen (intern)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>• Sparkonto: 0.5 % p.a. / Versicherung: 2 % / ETF: 6 %</p>
            <p>• Frühe Rente & Finanzielle Freiheit: 25× Jahreseinkommen als Zielkapital</p>
            <p>• Eigenheim: 20 % Eigenkapital von CHF 800'000</p>
            <p>• Scoring: Sparquote 25 %, Anlageform 25 %, Alter 20 %, Effizienz 15 %, Disziplin 15 %</p>
            <p>• Monatliche Verzinsung mit Zinseszins</p>
          </CardContent>
        </Card>
      )}

      {/* ─── Reflection ─── */}
      <ToolReflection
        question="Wenn die Wahrscheinlichkeit nicht bei deinem Ziel liegt – was willst du konkret daran ändern?"
        context="Oft reichen kleine Anpassungen an Beitrag, Laufzeit oder Strategie, um die Zielerreichung deutlich zu verbessern."
      />

      {/* ─── Soft CTA ─── */}
      <ToolSoftCta
        text="Gemeinsam optimieren wir deine Strategie, damit dein Ziel erreichbar wird."
        note="Basierend auf deinen Zahlen zeige ich dir, welche Stellschrauben den grössten Effekt haben."
        buttonLabel="Strategie besprechen"
      />

      <ToolTrustNote text="Unabhängige Beratung · Keine Produktbindung · Du entscheidest" />

      <ToolNextStep
        insightText="Du kennst jetzt deine Zielerreichungswahrscheinlichkeit. Bereit, alle Erkenntnisse zusammenzuführen?"
        primary={{
          question: "Bereit für deine Entscheidung?",
          description: "Führe alle Erkenntnisse zusammen und entscheide klar, was als Nächstes kommt.",
          targetSlug: "finanz-entscheidung",
          buttonLabel: "Zur Entscheidung",
          recommended: true,
        }}
        secondary={{
          question: "Lohnt sich ein Wechsel meiner 3a?",
          description: "Vergleiche deine bestehende mit einer optimierten Lösung.",
          targetSlug: "vergleichsrechner-3a",
          buttonLabel: "Vergleich starten",
        }}
      />
    </div>
    </PdfExportWrapper>
  );
}
