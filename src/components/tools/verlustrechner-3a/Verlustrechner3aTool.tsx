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
import { TrendingDown, ArrowRight, Info } from 'lucide-react';
import { calculate, formatCHF, MAX_CONTRIBUTION, type VerlustInputs } from './calcLogic';
import { LifeImpactSection } from './LifeImpactSection';

export function Verlustrechner3aTool() {
  const [inputs, setInputs] = useState<VerlustInputs>({
    currentAge: 30,
    retirementAge: 65,
    annualContribution: 7056,
    currentSolution: 'bank',
    startCapital: 0,
  });

  const update = <K extends keyof VerlustInputs>(key: K) => (v: VerlustInputs[K]) =>
    setInputs(prev => ({ ...prev, [key]: v }));

  const result = useMemo(() => calculate(inputs), [inputs]);

  const maxBar = Math.max(result.currentValue, result.optimizedValue, 1);
  const currentPct = (result.currentValue / maxBar) * 100;
  const optimizedPct = (result.optimizedValue / maxBar) * 100;

  const solutionLabels: Record<string, string> = {
    versicherung: 'Versicherung (Ø 2 %)',
    bank: 'Bank / Sparkonto (Ø 1 %)',
    investiert: 'Investiert (Ø 3,5 %)',
  };

  return (
    <PdfExportWrapper toolName="3a-Verlustrechner">
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Wie viel verlierst du durch deine aktuelle Säule 3a?
          </h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
          Finde heraus, wie viel Kapital dir bis zur Pensionierung entgeht – und wie gross der Unterschied mit einer optimierten Lösung sein kann.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Eingaben */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Deine Angaben</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Alter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Dein Alter</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={18}
                  max={64}
                  value={inputs.currentAge}
                  onChange={e => {
                    const v = parseInt(e.target.value) || 18;
                    update('currentAge')(Math.min(Math.max(v, 18), 64));
                  }}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">Jahre</span>
              </div>
              <Slider
                min={18}
                max={64}
                step={1}
                value={[inputs.currentAge]}
                onValueChange={v => update('currentAge')(v[0])}
              />
            </div>

            {/* Pensionierungsalter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pensionierungsalter</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={inputs.currentAge + 1}
                  max={70}
                  value={inputs.retirementAge}
                  onChange={e => {
                    const v = parseInt(e.target.value) || 65;
                    update('retirementAge')(Math.min(Math.max(v, inputs.currentAge + 1), 70));
                  }}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">Jahre</span>
              </div>
            </div>

            {/* Einzahlung */}
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
              {inputs.annualContribution >= MAX_CONTRIBUTION && (
                <p className="text-xs text-muted-foreground">
                  Maximaler steuerlich abzugsfähiger Betrag berücksichtigt.
                </p>
              )}
            </div>

            {/* Aktuelle Lösung */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Deine aktuelle Lösung</Label>
              <Select value={inputs.currentSolution} onValueChange={v => update('currentSolution')(v as VerlustInputs['currentSolution'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="versicherung">Versicherung (Ø 2 %)</SelectItem>
                  <SelectItem value="bank">Bank / Sparkonto (Ø 1 %)</SelectItem>
                  <SelectItem value="investiert">Investiert (Ø 3,5 %)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Startkapital */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bereits angespartes Kapital (optional)</Label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground shrink-0">CHF</span>
                <Input
                  type="number"
                  min={0}
                  value={inputs.startCapital || ''}
                  placeholder="0"
                  onChange={e => update('startCapital')(Math.max(0, parseInt(e.target.value) || 0))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ergebnis */}
        <div className="space-y-6">
          {/* Headline */}
          {result.loss > 0 && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="py-6 text-center space-y-1">
                <p className="text-sm text-muted-foreground">Du verlierst voraussichtlich</p>
                <p className="text-4xl font-bold text-destructive">
                  CHF {formatCHF(result.loss)}
                </p>
                <p className="text-sm text-muted-foreground">
                  über {result.years} Jahre mit deiner aktuellen Lösung
                </p>
              </CardContent>
            </Card>
          )}

          {/* Vergleich Karten */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">
                  {solutionLabels[inputs.currentSolution]?.split(' (')[0] || 'Aktuell'}
                </p>
                <p className="text-lg font-bold text-foreground">CHF {formatCHF(result.currentValue)}</p>
              </CardContent>
            </Card>
            <Card className="border-success/30">
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Optimiert (Ø 6 %)</p>
                <p className="text-lg font-bold text-success">CHF {formatCHF(result.optimizedValue)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Balkenvergleich */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Vergleich</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Aktuell</span>
                    <span>CHF {formatCHF(result.currentValue)}</span>
                  </div>
                  <div className="h-6 rounded bg-muted overflow-hidden">
                    <div
                      className="h-full rounded bg-muted-foreground/30 transition-all duration-700 ease-out"
                      style={{ width: `${currentPct}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Optimiert</span>
                    <span>CHF {formatCHF(result.optimizedValue)}</span>
                  </div>
                  <div className="h-6 rounded bg-muted overflow-hidden">
                    <div
                      className="h-full rounded bg-success/70 transition-all duration-700 ease-out"
                      style={{ width: `${optimizedPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {result.loss > 0 && (
                <div className="text-center pt-2">
                  <span className="text-sm text-muted-foreground">Differenz: </span>
                  <span className="text-lg font-bold text-destructive">CHF {formatCHF(result.loss)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emotionale Verstärkung */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-4 flex gap-3">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80 leading-relaxed">
                Dieser Unterschied entsteht nicht durch mehr Risiko, sondern durch bessere Struktur und tiefere Kosten.
              </p>
            </CardContent>
          </Card>

          {/* CTA */}
          <Button
            size="lg"
            className="w-full gap-2"
            asChild
          >
            <a
              href="https://calendar.app.google/LrIPZDNzivnrfq9w7"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kostenlose Analyse buchen
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Emotionale Sektion */}
      <LifeImpactSection loss={result.loss} />

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-4">
        <p>
          Berechnung basiert auf Durchschnittswerten. Die tatsächliche Entwicklung hängt von der gewählten Anlagestrategie, den effektiven Kosten und der Marktentwicklung ab.
        </p>
      </div>

      <ToolNextStep
        insightText="Du siehst jetzt, was dir mit deiner aktuellen 3a entgeht. Die gute Nachricht: Mit einer optimierten Lösung lässt sich ein Grossteil davon zurückholen."
        primary={{
          question: "Wie viel mehr könnte meine 3a bringen?",
          description: "Vergleiche deine bestehende mit einer optimierten 3a-Lösung – in konkreten Franken.",
          targetSlug: "vergleichsrechner-3a",
          buttonLabel: "Vergleich starten",
          recommended: true,
        }}
        secondary={{
          question: "Wie gut ist meine 3a insgesamt aufgestellt?",
          description: "Lass deine Lösung in 2 Minuten bewerten – mit Score und Empfehlung.",
          targetSlug: "mini-3a-kurzcheck",
          buttonLabel: "Kurzcheck starten",
        }}
      />
    </div>
    </PdfExportWrapper>
  );
}
