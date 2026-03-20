import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  ShieldCheck, ShieldAlert, TrendingUp, TrendingDown,
  Banknote, Activity, Dumbbell, Armchair,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { calculateComparison } from './calcLogic';

interface Props {
  mode?: 'internal' | 'public';
}

export function SicherheitsvergleichTool({ mode = 'internal' }: Props) {
  const isAdmin = mode === 'internal';

  const [startCapital, setStartCapital] = useState(50000);
  const [years, setYears] = useState(25);
  const [inflationPct, setInflationPct] = useState(2.5);
  const [returnPct, setReturnPct] = useState(6);
  const [showSportAnalogy, setShowSportAnalogy] = useState(false);

  const data = useMemo(
    () => calculateComparison(startCapital, years, inflationPct, returnPct),
    [startCapital, years, inflationPct, returnPct],
  );

  const finalSavings = data[data.length - 1]?.savingsReal ?? 0;
  const finalInvestment = data[data.length - 1]?.investmentValue ?? 0;
  const diff = finalInvestment - finalSavings;

  const fmt = (v: number) => v.toLocaleString('de-CH', { maximumFractionDigits: 0 });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground leading-tight">Sicherheitsvergleich</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Was ist sicherer – keine Schwankung oder langfristiger Werterhalt?
        </p>
      </div>

      {/* Inputs */}
      <Card>
        <CardContent className="py-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label className="text-sm">Startkapital (CHF)</Label>
            <Input
              type="number"
              value={startCapital}
              onChange={(e) => setStartCapital(Math.max(0, Number(e.target.value)))}
              min={0}
              step={5000}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Zeitraum: {years} Jahre</Label>
            <Slider
              value={[years]}
              onValueChange={([v]) => setYears(v)}
              min={5}
              max={40}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Inflation: {inflationPct}%</Label>
            <Slider
              value={[inflationPct]}
              onValueChange={([v]) => setInflationPct(v)}
              min={1}
              max={5}
              step={0.5}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Rendite: {returnPct}%</Label>
            <Slider
              value={[returnPct]}
              onValueChange={([v]) => setReturnPct(v)}
              min={3}
              max={10}
              step={0.5}
            />
          </div>
        </CardContent>
      </Card>

      {/* Split Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Left – False Safety */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="py-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-destructive" />
              <h3 className="text-lg font-bold text-foreground">Scheinbare Sicherheit</h3>
            </div>
            <p className="text-sm text-muted-foreground">Sparkonto – keine Schwankung, aber stiller Wertverlust.</p>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-center gap-2"><span className="text-destructive">✗</span> Keine Schwankungen – fühlt sich sicher an</li>
              <li className="flex items-center gap-2"><span className="text-destructive">✗</span> Kaufkraft sinkt über Zeit</li>
              <li className="flex items-center gap-2"><span className="text-destructive">✗</span> Kein reales Wachstum</li>
            </ul>
            <div className="rounded-lg bg-destructive/10 p-4 text-center">
              <p className="text-xs text-muted-foreground">Kaufkraft nach {years} Jahren</p>
              <p className="text-2xl font-bold text-destructive">CHF {fmt(finalSavings)}</p>
              <p className="text-xs text-destructive/80 mt-1">
                −{fmt(startCapital - finalSavings)} Kaufkraftverlust
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right – True Safety */}
        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="py-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <h3 className="text-lg font-bold text-foreground">Langfristige Sicherheit</h3>
            </div>
            <p className="text-sm text-muted-foreground">Investition – kurzfristige Schwankung, langfristiges Wachstum.</p>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-center gap-2"><span className="text-emerald-600">✓</span> Kurzfristige Schwankungen</li>
              <li className="flex items-center gap-2"><span className="text-emerald-600">✓</span> Langfristiges Wachstum</li>
              <li className="flex items-center gap-2"><span className="text-emerald-600">✓</span> Kaufkraft steigt</li>
            </ul>
            <div className="rounded-lg bg-emerald-100/60 dark:bg-emerald-900/30 p-4 text-center">
              <p className="text-xs text-muted-foreground">Vermögen nach {years} Jahren</p>
              <p className="text-2xl font-bold text-emerald-600">CHF {fmt(finalInvestment)}</p>
              <p className="text-xs text-emerald-600/80 mt-1">
                +{fmt(finalInvestment - startCapital)} Wertzuwachs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aha Moment */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6 text-center space-y-3">
          <Banknote className="h-8 w-8 text-primary mx-auto" />
          <p className="text-xl font-bold text-foreground">
            Unterschied: CHF {fmt(diff)}
          </p>
          <p className="text-foreground font-medium max-w-xl mx-auto leading-relaxed">
            Das vermeintlich sicherste Geld ist oft das, das langfristig am meisten verliert.
          </p>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardContent className="py-5">
          <h4 className="font-semibold text-foreground mb-4">Entwicklung über {years} Jahre</h4>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Jahre', position: 'insideBottomRight', offset: -5, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  formatter={(value: number, name: string) => [
                    `CHF ${fmt(value)}`,
                    name === 'savingsReal' ? 'Kaufkraft (Sparkonto)' :
                    name === 'savingsNominal' ? 'Nominal (Sparkonto)' :
                    'Investition',
                  ]}
                  labelFormatter={(label) => `Jahr ${label}`}
                />
                <Legend
                  formatter={(value) =>
                    value === 'savingsReal' ? 'Kaufkraft Sparkonto' :
                    value === 'savingsNominal' ? 'Sparkonto nominal' :
                    'Investition'
                  }
                />
                <Line
                  type="monotone"
                  dataKey="savingsNominal"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="savingsReal"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="investmentValue"
                  stroke="hsl(142 71% 35%)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sport Analogy (togglable in admin) */}
      {isAdmin && (
        <div className="flex items-center gap-3">
          <Switch checked={showSportAnalogy} onCheckedChange={setShowSportAnalogy} />
          <Label className="text-sm text-muted-foreground">Sport-Vergleich anzeigen</Label>
        </div>
      )}

      {(showSportAnalogy || !isAdmin) && (
        <Card>
          <CardContent className="py-6">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Einfach erklärt
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Armchair className="h-5 w-5 text-destructive" />
                  <p className="font-medium text-foreground">Ohne Bewegung</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ein Körper ohne Training fühlt sich im Moment bequem an – wird aber über Zeit schwächer. Muskeln bauen ab, die Gesundheit leidet still.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  <p className="font-medium text-foreground">Mit Training</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Training kann anstrengend sein, es gibt Rückschläge – aber langfristig wächst Kraft und Gesundheit. Genau wie bei einer Investition.
                </p>
              </div>
            </div>
            <p className="text-sm font-medium text-center text-foreground mt-6">
              Kein Risiko fühlt sich sicher an – führt aber langfristig oft zum grösseren Schaden.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Closing */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6 text-center">
          <p className="text-foreground font-medium max-w-xl mx-auto leading-relaxed">
            Die Frage ist nicht, ob dein Geld sicher ist – sondern ob es dich langfristig schützt.
          </p>
        </CardContent>
      </Card>

      {/* Admin Notes */}
      {isAdmin && (
        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="py-5 space-y-3">
            <h4 className="font-semibold text-foreground">Interner Gesprächsleitfaden</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1.5">
              <li>Sparkonto <strong>nicht schlecht reden</strong> – sondern zeigen, was es langfristig bedeutet.</li>
              <li>Inflation als «stiller Gegenspieler» erklären.</li>
              <li>Sicherheit = Kaufkrafterhalt, nicht Nominalwert.</li>
              <li>Zentrale Botschaft: «Echte Sicherheit ist nicht Stillstand, sondern eine Strategie.»</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
