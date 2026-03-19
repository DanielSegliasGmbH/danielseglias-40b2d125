import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useMonteCarloSimulation } from './useMonteCarloSimulation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Props {
  mode: 'internal' | 'public';
}

export function RenditeRisikoTool({ mode }: Props) {
  const [years, setYears] = useState(10);
  const sim = useMonteCarloSimulation(years);

  // Filter buckets with probability > 0 for cleaner chart
  const chartData = useMemo(
    () =>
      sim.buckets
        .filter((b) => b.probability > 0.05)
        .map((b) => ({
          label: `${b.rangeStart}%`,
          probability: Math.round(b.probability * 10) / 10,
          isNegative: b.isNegative,
          rangeStart: b.rangeStart,
          rangeEnd: b.rangeEnd,
        })),
    [sim.buckets]
  );

  const maxProbability = useMemo(
    () => Math.max(...chartData.map((d) => d.probability)),
    [chartData]
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Risiko- und Renditesimulation
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Entwicklung von Verlustwahrscheinlichkeit und Renditechancen über die Zeit
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Loss probability */}
        <Card className="border-scale-2">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Verlustwahrscheinlichkeit
            </p>
            <p className="text-3xl font-bold text-scale-3 mt-1">
              {sim.lossProbability}%
            </p>
          </CardContent>
        </Card>

        {/* Gain probability */}
        <Card className="border-scale-6">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Gewinnwahrscheinlichkeit
            </p>
            <p className="text-3xl font-bold text-scale-8 mt-1">
              {sim.gainProbability}%
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Anlagedauer</span>
              <span className="font-medium text-foreground">
                {years} {years === 1 ? 'Jahr' : 'Jahre'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mittlere Rendite</span>
              <span className="font-medium text-foreground">{sim.meanReturn}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ø pro Jahr</span>
              <span className="font-medium text-foreground">
                {sim.annualizedReturn}% p.a.
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Volatilität</span>
              <span className="font-medium text-foreground">{sim.volatility}% p.a.</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Max. sim. Rendite</span>
              <span className="font-medium text-foreground">{sim.maxReturn}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardContent className="p-4 pt-6">
          <p className="text-xs text-muted-foreground mb-2">Wahrscheinlichkeit</p>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 20 }}
              >
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'hsl(60 9% 40%)' }}
                  axisLine={{ stroke: 'hsl(60 9% 66%)' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                  label={{
                    value: 'Portfoliorendite',
                    position: 'insideBottom',
                    offset: -10,
                    fontSize: 12,
                    fill: 'hsl(60 9% 40%)',
                  }}
                />
                <YAxis
                  tickFormatter={(v: number) => `${v}%`}
                  tick={{ fontSize: 11, fill: 'hsl(60 9% 40%)' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, Math.ceil(maxProbability / 5) * 5]}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(60 9% 66% / 0.15)' }}
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(60 9% 66%)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Wahrscheinlichkeit']}
                  labelFormatter={(label: string) => `Rendite: ${label}`}
                />
                <Bar dataKey="probability" radius={[3, 3, 0, 0]} maxBarSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        entry.isNegative
                          ? 'hsl(60 9% 66%)'   /* scale-1 beige */
                          : 'hsl(60 10% 44%)'   /* scale-6 olive */
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Slider */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-foreground">Anlagedauer</span>
            <span className="text-sm font-semibold text-scale-8 bg-scale-1/30 px-3 py-1 rounded-full">
              {years} {years === 1 ? 'Jahr' : 'Jahre'}
            </span>
          </div>
          <Slider
            value={[years]}
            onValueChange={(v) => setYears(v[0])}
            min={1}
            max={45}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>1 Jahr</span>
            <span>45 Jahre</span>
          </div>
        </CardContent>
      </Card>

      {/* Lesebeispiel */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4">
            <span className="text-sm font-semibold text-foreground min-w-[120px]">
              Lesebeispiel
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mit einer Wahrscheinlichkeit von{' '}
              {Math.round(sim.dominantBucket.probability)}% wird das Anlageergebnis
              zwischen {sim.dominantBucket.rangeStart}% und {sim.dominantBucket.rangeEnd}%
              liegen (respektive zwischen {sim.annualizedDominantLow}% und{' '}
              {sim.annualizedDominantHigh}% pro Jahr).
            </p>
          </div>
          <div className="flex gap-4">
            <span className="text-sm font-semibold text-foreground min-w-[120px]">
              Wichtiger Hinweis
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Die verwendeten Rendite- und Risikoschätzungen sind sorgfältig und eher
              vorsichtig berechnet. Sie lassen die Möglichkeit grosser Verluste zu, wie sie
              an Kapitalmärkten auftreten können. Beachten Sie, dass die Angaben auf
              Schätzungen beruhen und keinerlei Gewähr besteht, dass diese so eintreten.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
