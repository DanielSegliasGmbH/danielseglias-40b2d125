import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PdfExportWrapper } from '@/components/tools/PdfExportWrapper';
import { ToolNextStep } from '@/components/tools/ToolNextStep';
import { ToolReflection, ToolTrustNote } from '@/components/tools/ToolConversionElements';
import { calculateRolex, calculateDelay } from './calcLogic';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface RolexRechnerToolProps {
  mode?: 'internal' | 'public';
}

const presets = [
  { key: 'rolex', label: '⌚ Rolex', price: 10000 },
  { key: 'ferrari', label: '🏎️ Ferrari', price: 250000 },
  { key: 'resort', label: '🏝️ 5-Sterne-Resort Wochenende', price: 2500 },
  { key: 'lv', label: '👜 Louis Vuitton Handtasche', price: 3000 },
  { key: 'custom', label: '✏️ Eigene Eingabe', price: 0 },
];

export function RolexRechnerTool({ mode = 'internal' }: RolexRechnerToolProps) {
  const [selectedPreset, setSelectedPreset] = useState('rolex');
  const [customPrice, setCustomPrice] = useState(5000);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [startCapital, setStartCapital] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [showDelay, setShowDelay] = useState(false);

  const preset = presets.find((p) => p.key === selectedPreset);
  const targetPrice = selectedPreset === 'custom' ? customPrice : (preset?.price || 10000);

  const input = {
    targetPrice,
    annualReturn: annualReturn / 100,
    startCapital,
    monthlyContribution,
  };

  const result = useMemo(() => calculateRolex(input), [targetPrice, annualReturn, startCapital, monthlyContribution]);
  const delayResult = useMemo(
    () => (showDelay ? calculateDelay(input, 5) : null),
    [targetPrice, annualReturn, startCapital, monthlyContribution, showDelay]
  );

  const targetLabel = selectedPreset === 'custom' ? 'dein Zielobjekt' : (preset?.label.replace(/^[^\s]+\s/, '') || 'Rolex');

  const safeNum = (val: string, setter: (n: number) => void, min = 0) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= min) setter(n);
    else if (val === '') setter(0);
  };

  const formatCHF = (n: number) =>
    n.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <PdfExportWrapper toolName="Rolex-Rechner" hideExport={mode === 'public'}>
      <div className="space-y-6">
        {/* Intro */}
        <div className="text-center space-y-2 mb-2">
          <p className="text-lg text-foreground font-medium">
            Einmal kaufen – oder jedes Jahr bezahlen lassen?
          </p>
          <p className="text-sm text-muted-foreground">
            Finde heraus, wie viel Vermögen du brauchst, damit deine Zinsen deinen Lifestyle finanzieren.
          </p>
        </div>

        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dein Ziel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset Dropdown */}
            <div className="space-y-1.5">
              <Label>Was möchtest du dir leisten?</Label>
              <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {presets.map((p) => (
                    <SelectItem key={p.key} value={p.key}>
                      {p.label}{p.price > 0 ? ` – CHF ${formatCHF(p.price)}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPreset === 'custom' && (
              <div className="space-y-1.5">
                <Label htmlFor="custom-price">Betrag eingeben (CHF)</Label>
                <Input
                  id="custom-price"
                  type="number"
                  min={0}
                  value={customPrice || ''}
                  onChange={(e) => safeNum(e.target.value, setCustomPrice)}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t">
              <div className="space-y-1.5">
                <Label htmlFor="return">Erwartete Rendite (% / Jahr)</Label>
                <Input
                  id="return"
                  type="number"
                  min={0.1}
                  step={0.5}
                  value={annualReturn || ''}
                  onChange={(e) => safeNum(e.target.value, setAnnualReturn, 0.1)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="start">Startkapital (CHF)</Label>
                <Input
                  id="start"
                  type="number"
                  min={0}
                  value={startCapital || ''}
                  onChange={(e) => safeNum(e.target.value, setStartCapital)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="monthly">Monatliche Einzahlung (CHF)</Label>
                <Input
                  id="monthly"
                  type="number"
                  min={0}
                  value={monthlyContribution || ''}
                  onChange={(e) => safeNum(e.target.value, setMonthlyContribution)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-bold text-primary">CHF {formatCHF(result.requiredCapital)}</p>
                  <p className="text-xs text-muted-foreground">Benötigtes Kapital</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{result.yearsToGoal} Jahre</p>
                  <p className="text-xs text-muted-foreground">Bis zum Ziel</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-bold text-foreground">CHF {formatCHF(result.totalInvested)}</p>
                  <p className="text-xs text-muted-foreground">Total investiert</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-bold text-primary">CHF {formatCHF(result.annualInterestAtGoal)}</p>
                  <p className="text-xs text-muted-foreground">Jährliche Zinsen</p>
                </CardContent>
              </Card>
            </div>

            {/* Progress */}
            <Card>
              <CardContent className="py-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fortschritt zum Zielvermögen</span>
                  <span className="font-medium text-foreground">{result.currentProgress}%</span>
                </div>
                <Progress value={result.currentProgress} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  Du bist aktuell bei {result.currentProgress}% deines Zielvermögens von CHF {formatCHF(result.requiredCapital)}
                </p>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vermögensentwicklung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.wealthOverTime} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(v) => `${v}J`}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(value: number) => [`CHF ${formatCHF(value)}`, 'Vermögen']}
                        labelFormatter={(label) => `Jahr ${label}`}
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                      />
                      <ReferenceLine
                        y={result.requiredCapital}
                        stroke="hsl(var(--primary))"
                        strokeDasharray="6 4"
                        strokeWidth={2}
                        label={{
                          value: `Ziel: CHF ${formatCHF(result.requiredCapital)}`,
                          position: 'insideTopRight',
                          fill: 'hsl(var(--primary))',
                          fontSize: 11,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="wealth"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#wealthGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Aha Text */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-6">
                <div className="max-w-xl mx-auto text-center space-y-3">
                  <p className="text-base font-medium text-foreground leading-relaxed">
                    Wenn du heute beginnst, kannst du dir in <span className="text-primary font-bold">{result.yearsToGoal} Jahren</span> jedes Jahr {targetLabel === 'Rolex' ? 'eine' : ''} {targetLabel} {selectedPreset === 'rolex' || selectedPreset === 'lv' ? 'kaufen' : 'leisten'} – <span className="text-primary font-semibold">ohne dein Vermögen anzutasten</span>.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Die meisten Menschen kaufen sich Luxus einmal.<br />
                    Vermögende Menschen bauen sich Systeme, die ihn dauerhaft bezahlen.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Delay Toggle */}
            <div className="flex items-center justify-between pdf-hide" data-pdf-hide>
              <div className="space-y-0.5">
                <Label htmlFor="delay-toggle" className="text-sm font-medium">
                  Was passiert, wenn ich 5 Jahre warte?
                </Label>
                <p className="text-xs text-muted-foreground">Zeigt den Preis des Aufschiebens</p>
              </div>
              <Switch id="delay-toggle" checked={showDelay} onCheckedChange={setShowDelay} />
            </div>

            {showDelay && delayResult && (
              <Card className="border-destructive/20">
                <CardContent className="py-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{delayResult.yearsToGoalDelayed} Jahre</p>
                      <p className="text-xs text-muted-foreground">Neue Dauer (+{delayResult.extraYears} Jahre)</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">CHF {formatCHF(delayResult.totalInvestedDelayed)}</p>
                      <p className="text-xs text-muted-foreground">Total investiert (verzögert)</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-destructive">CHF {formatCHF(delayResult.opportunityCost)}</p>
                      <p className="text-xs text-muted-foreground">Opportunitätsverlust</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    5 Jahre Warten kostet dich {delayResult.extraYears} zusätzliche Jahre und CHF {formatCHF(delayResult.opportunityCost)} an entgangener Rendite.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Final emotional statement */}
            <Card className="border-none bg-muted/30">
              <CardContent className="py-6">
                <div className="max-w-xl mx-auto text-center space-y-3">
                  <p className="text-base text-foreground leading-relaxed">
                    Die Frage ist nicht, ob du dir {targetLabel === 'Rolex' ? 'eine' : ''} {targetLabel} leisten kannst.
                  </p>
                  <p className="text-base font-medium text-foreground italic">
                    «Die Frage ist, ob du {targetLabel === 'resort' || targetLabel === '5-Sterne-Resort Wochenende' ? 'es' : 'sie'} einmal kaufst… oder dir jedes Jahr {targetLabel === 'resort' || targetLabel === '5-Sterne-Resort Wochenende' ? 'eins' : 'eine'} bezahlen lässt.»
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Trust Note */}
        <ToolTrustNote text="Dieses Tool basiert auf durchschnittlichen Marktrenditen. Die tatsächliche Entwicklung kann abweichen." />

        {/* Reflection */}
        <ToolReflection
          question="Was wäre, wenn dein Vermögen für dich arbeiten würde – statt du für dein Vermögen?"
          context="Ein Gespräch kann dir helfen, deinen persönlichen Weg dorthin zu planen."
        />

        {/* Next Steps */}
        <ToolNextStep
          insightText="Du weisst jetzt, welches Kapital nötig wäre, damit deine Zinsen deinen Lifestyle bezahlen. Lass uns schauen, was dich jeder Monat Warten wirklich kostet."
          primary={{
            question: 'Was kostet mich jeder Monat Warten?',
            description: 'Der Zeitverlust-Simulator zeigt dir den finanziellen Preis des Aufschiebens.',
            targetSlug: 'zeitverlust-simulator',
            buttonLabel: 'Zum Zeitverlust-Simulator',
            recommended: true,
          }}
          secondary={{
            question: 'Wie frisst die Inflation mein Geld?',
            description: 'Verstehe, wie Inflation deine Kaufkraft über die Jahre schmälert.',
            targetSlug: 'inflationsrechner',
            buttonLabel: 'Zum Inflationsrechner',
          }}
        />
      </div>
    </PdfExportWrapper>
  );
}
