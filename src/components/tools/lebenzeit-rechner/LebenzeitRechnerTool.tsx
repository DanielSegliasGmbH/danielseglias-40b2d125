import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PdfExportWrapper } from '@/components/tools/PdfExportWrapper';
import { ToolNextStep } from '@/components/tools/ToolNextStep';
import { ToolReflection, ToolTrustNote } from '@/components/tools/ToolConversionElements';
import { calculateLebenzeit, type LebenzeitInput } from './calcLogic';

interface LebenzeitRechnerToolProps {
  mode?: 'internal' | 'public';
}

const quickExamples = [
  { label: '📱 iPhone', price: 1200 },
  { label: '🏖️ Ferien', price: 2000 },
  { label: '🚗 Auto', price: 25000 },
  { label: '☕ Kaffee/Monat', price: 150 },
];

export function LebenzeitRechnerTool({ mode = 'internal' }: LebenzeitRechnerToolProps) {
  const [salary, setSalary] = useState(5400);
  const [hours, setHours] = useState(180);
  const [price, setPrice] = useState(450);
  const [includeTax, setIncludeTax] = useState(false);
  const [taxPercent, setTaxPercent] = useState(10);

  const input: LebenzeitInput = {
    monthlyNetSalary: salary,
    workHoursPerMonth: hours,
    purchasePrice: price,
    includeTax,
    taxPercent,
  };

  const result = useMemo(() => calculateLebenzeit(input), [salary, hours, price, includeTax, taxPercent]);

  const handleReset = () => {
    setSalary(5400);
    setHours(180);
    setPrice(450);
    setIncludeTax(false);
    setTaxPercent(10);
  };

  const handleQuickExample = (examplePrice: number) => {
    setPrice(examplePrice);
  };

  const handleEnableTax = () => {
    setIncludeTax(true);
  };

  const safeNum = (val: string, setter: (n: number) => void) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0) setter(n);
    else if (val === '') setter(0);
  };

  return (
    <PdfExportWrapper toolName="Lebenzeit-Rechner" hideExport={mode === 'public'}>
      <div className="space-y-6">
        {/* Intro */}
        <div className="text-center space-y-2 mb-2">
          <p className="text-lg text-foreground font-medium">
            Du bezahlst nicht mit Geld – sondern mit deiner Lebenszeit.
          </p>
          <p className="text-sm text-muted-foreground">
            Finde heraus, wie viele Arbeitsstunden ein Kauf dich wirklich kostet.
          </p>
        </div>

        {/* Quick Examples */}
        <div className="flex flex-wrap gap-2 justify-center pdf-hide" data-pdf-hide>
          {quickExamples.map((ex) => (
            <Button
              key={ex.label}
              variant={price === ex.price ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickExample(ex.price)}
            >
              {ex.label} – CHF {ex.price.toLocaleString('de-CH')}
            </Button>
          ))}
        </div>

        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deine Angaben</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="salary">💰 Monatslohn netto (CHF)</Label>
                <Input
                  id="salary"
                  type="number"
                  min={0}
                  value={salary || ''}
                  onChange={(e) => safeNum(e.target.value, setSalary)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hours">🛠️ Arbeitsstunden / Monat</Label>
                <Input
                  id="hours"
                  type="number"
                  min={0}
                  value={hours || ''}
                  onChange={(e) => safeNum(e.target.value, setHours)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">⏳ Preis des Kaufs (CHF)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={price || ''}
                  onChange={(e) => safeNum(e.target.value, setPrice)}
                />
              </div>
            </div>

            {/* Tax Toggle */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="tax-toggle" className="text-sm font-medium">
                  Steuern berücksichtigen (geschätzt)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Reduziert deinen effektiven Stundenlohn
                </p>
              </div>
              <Switch
                id="tax-toggle"
                checked={includeTax}
                onCheckedChange={setIncludeTax}
              />
            </div>

            {includeTax && (
              <div className="space-y-1.5 max-w-[200px]">
                <Label htmlFor="tax-percent">Steuerbelastung in %</Label>
                <Input
                  id="tax-percent"
                  type="number"
                  min={0}
                  max={99}
                  value={taxPercent || ''}
                  onChange={(e) => safeNum(e.target.value, setTaxPercent)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card className="border-primary/20">
            <CardContent className="py-8">
              <div className="text-center space-y-6">
                {/* Main statement */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                    Dieser Kauf kostet dich
                  </p>
                  <p className="text-5xl font-bold text-primary">
                    {result.hoursForPurchase} Stunden
                  </p>
                  <p className="text-lg text-foreground">
                    deines Lebens
                  </p>
                </div>

                {/* Secondary metrics */}
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-foreground">{result.workDays}</p>
                    <p className="text-muted-foreground">Arbeitstage</p>
                  </div>
                  {result.workWeeks >= 1 && (
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-foreground">{result.workWeeks}</p>
                      <p className="text-muted-foreground">Arbeitswochen</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-foreground">CHF {result.effectiveHourlyRate.toFixed(2)}</p>
                    <p className="text-muted-foreground">dein Stundenlohn{includeTax ? ' (nach Steuern)' : ''}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="max-w-md mx-auto space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0h</span>
                    <span>{hours}h (dein Monat)</span>
                  </div>
                  <Progress value={Math.min(result.percentOfMonth, 100)} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {result.percentOfMonth <= 100
                      ? `${result.percentOfMonth}% deines Arbeitsmonats`
                      : `${(result.percentOfMonth / 100).toFixed(1)} volle Arbeitsmonate`}
                  </p>
                </div>

                {/* Emotional perspective */}
                <div className="bg-muted/40 rounded-xl p-5 max-w-lg mx-auto">
                  <p className="text-base font-medium text-foreground leading-relaxed">
                    {result.workDays >= 1
                      ? `Du arbeitest also ${result.workDays >= 2 ? 'fast ' : ''}${result.workDays} ${result.workDays === 1 ? 'Tag' : 'Tage'} nur für diesen einen Kauf.`
                      : `Du arbeitest also ${result.hoursForPurchase} Stunden nur für diesen einen Kauf.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emotional Reflection */}
        {result && (
          <Card className="border-none bg-muted/30">
            <CardContent className="py-6">
              <div className="max-w-xl mx-auto text-center space-y-3">
                <p className="text-base text-foreground leading-relaxed">
                  Die meisten Menschen denken in Geld.
                  <br />
                  Aber in Wahrheit bezahlst du mit deiner <span className="font-semibold text-primary">Lebenszeit</span>.
                </p>
                <p className="text-base font-medium text-foreground italic">
                  «Ist dir dieser Kauf {result.hoursForPurchase} Stunden deines Lebens wert?»
                </p>
                <p className="text-sm text-muted-foreground">
                  Oder gibt es etwas, das dir langfristig mehr zurückgeben würde?
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-center pdf-hide" data-pdf-hide>
          {!includeTax && (
            <Button variant="outline" onClick={handleEnableTax}>
              Mit Steuern berechnen
            </Button>
          )}
          <Button variant="outline" onClick={handleReset}>
            Anderes Beispiel testen
          </Button>
        </div>

        {/* Trust Note */}
        <ToolTrustNote text="Alle Berechnungen erfolgen lokal in deinem Browser. Keine Daten werden gespeichert." />

        {/* Reflection */}
        <ToolReflection
          question="Was wäre, wenn du diesen Betrag stattdessen für dich arbeiten lassen würdest?"
          context="Ein Gespräch kann dir helfen, Klarheit über deine finanzielle Situation zu gewinnen."
        />

        {/* Next Steps */}
        <ToolNextStep
          insightText="Du weisst jetzt, was dich ein Kauf in Lebenszeit kostet. Lass uns anschauen, wie deine gesamte finanzielle Situation aussieht."
          primary={{
            question: 'Wie steht es insgesamt um meine Finanzen?',
            description: 'Der Finanzcheck zeigt dir in wenigen Minuten, wie gut du aufgestellt bist.',
            targetSlug: 'finanzcheck',
            buttonLabel: 'Zum Finanzcheck',
            recommended: true,
          }}
          secondary={{
            question: 'Was kosten mich versteckte Gebühren?',
            description: 'Der Kosten-Impact-Simulator zeigt dir, wie Gebühren dein Vermögen beeinflussen.',
            targetSlug: 'kosten-impact-simulator',
            buttonLabel: 'Kosten analysieren',
          }}
        />
      </div>
    </PdfExportWrapper>
  );
}
