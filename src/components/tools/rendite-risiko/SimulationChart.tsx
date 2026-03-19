import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import type { SimulationResult } from './useMonteCarloSimulation';

interface Props {
  buckets: SimulationResult['buckets'];
}

export function SimulationChart({ buckets }: Props) {
  const chartData = useMemo(
    () =>
      buckets
        .filter((b) => b.probability > 0.05)
        .map((b) => ({
          label: `${b.rangeStart}%`,
          probability: Math.round(b.probability * 10) / 10,
          isNegative: b.isNegative,
          rangeStart: b.rangeStart,
          rangeEnd: b.rangeEnd,
        })),
    [buckets]
  );

  const maxProbability = useMemo(
    () => Math.max(...chartData.map((d) => d.probability)),
    [chartData]
  );

  return (
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
  );
}
