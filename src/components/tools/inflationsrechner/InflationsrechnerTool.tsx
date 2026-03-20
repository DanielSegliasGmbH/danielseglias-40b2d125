import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { TrendingDown, Calendar, Info } from 'lucide-react';
import { InflationChart } from './InflationChart';
import { LifeExamples } from './LifeExamples';
import {
  calcFutureProjection,
  calcPastProjection,
  formatCHF,
  minYear,
  maxYear,
} from './inflationData';

export function InflationsrechnerTool() {
  const [mode, setMode] = useState<'future' | 'past'>('future');

  // Future inputs
  const [amount, setAmount] = useState(100000);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(2);

  // Past inputs
  const [pastAmount, setPastAmount] = useState(100000);
  const [startYear, setStartYear] = useState(1990);
  const [endYear, setEndYear] = useState(maxYear);

  const futureResult = useMemo(() => calcFutureProjection(amount, years, rate), [amount, years, rate]);
  const pastResult = useMemo(() => calcPastProjection(pastAmount, startYear, endYear), [pastAmount, startYear, endYear]);

  const activeResult = mode === 'future' ? futureResult : pastResult;
  const activeAmount = mode === 'future' ? amount : pastAmount;

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'future' | 'past')}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="future" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            Zukunftsprojektion
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            <Calendar className="h-4 w-4" />
            Vergangenheit (BFS)
          </TabsTrigger>
        </TabsList>

        {/* Future Tab */}
        <TabsContent value="future" className="space-y-6 mt-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Eingaben</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Betrag (CHF)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zeitraum: {years} Jahre</Label>
                  <Slider
                    value={[years]}
                    onValueChange={([v]) => setYears(v)}
                    min={1}
                    max={50}
                    step={1}
                    className="mt-3"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Inflationsrate: {rate}%</Label>
                  <Slider
                    value={[rate]}
                    onValueChange={([v]) => setRate(v)}
                    min={0.5}
                    max={8}
                    step={0.1}
                    className="mt-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Past Tab */}
        <TabsContent value="past" className="space-y-6 mt-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Historische Berechnung</CardTitle>
              <CardDescription>Basierend auf realen Inflationsdaten des BFS (Landesindex der Konsumentenpreise)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Betrag (CHF)</Label>
                  <Input
                    type="number"
                    value={pastAmount}
                    onChange={(e) => setPastAmount(Number(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Startjahr</Label>
                  <Input
                    type="number"
                    value={startYear}
                    onChange={(e) => setStartYear(Math.max(minYear, Math.min(maxYear - 1, Number(e.target.value) || minYear)))}
                    min={minYear}
                    max={maxYear - 1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endjahr</Label>
                  <Input
                    type="number"
                    value={endYear}
                    onChange={(e) => setEndYear(Math.max(startYear + 1, Math.min(maxYear, Number(e.target.value) || maxYear)))}
                    min={startYear + 1}
                    max={maxYear}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Result Hero */}
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Kaufkraft von CHF {formatCHF(activeAmount)}</p>
              <p className="text-3xl font-bold text-foreground tabular-nums">
                CHF {formatCHF(activeResult.endValue)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Kaufkraftverlust</p>
                <p className="text-2xl font-bold text-destructive tabular-nums">
                  –{activeResult.lossPercent}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Kaufkraftentwicklung</CardTitle>
        </CardHeader>
        <CardContent>
          <InflationChart data={activeResult.points} mode={mode} />
        </CardContent>
      </Card>

      {/* Life Examples – future mode only */}
      {mode === 'future' && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Was bedeutet das im Alltag?</h3>
          <p className="text-sm text-muted-foreground">
            So verändern sich Alltagspreise bei {rate}% Inflation über {years} Jahre:
          </p>
          <LifeExamples years={years} rate={rate} />
        </div>
      )}

      {/* Insight */}
      <Card className="bg-muted/40 border-muted">
        <CardContent className="py-5 flex gap-3">
          <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              Inflation wirkt langsam – aber konstant.
            </p>
            <p>
              Das bedeutet: Dein Geld verliert jedes Jahr an Wert, auch wenn du es nicht aktiv bemerkst.
              Nach 30 Jahren verliert dein Geld bei 2% Inflation rund 45% seiner Kaufkraft.
            </p>
            {mode === 'past' && (
              <p className="text-xs mt-2">
                Quelle: Bundesamt für Statistik (BFS) – Landesindex der Konsumentenpreise (LIK)
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
