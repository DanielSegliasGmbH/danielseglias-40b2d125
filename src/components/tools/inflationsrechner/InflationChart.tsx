import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCHF } from './inflationData';

interface Props {
  data: { year: number; value: number }[];
  mode: 'future' | 'past';
}

export function InflationChart({ data, mode }: Props) {
  const formatted = useMemo(
    () => data.map((d) => ({ ...d, display: formatCHF(d.value) })),
    [data],
  );

  const minVal = Math.min(...data.map((d) => d.value));
  const maxVal = Math.max(...data.map((d) => d.value));
  const domainMin = Math.floor(minVal * 0.9);

  return (
    <div className="w-full h-[300px] md:h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="inflGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            label={mode === 'future' ? { value: 'Jahre', position: 'insideBottomRight', offset: -4, fontSize: 11, fill: 'hsl(var(--muted-foreground))' } : undefined}
          />
          <YAxis
            domain={[domainMin, maxVal]}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${formatCHF(v)}`}
            width={70}
          />
          <Tooltip
            formatter={(v: number) => [`CHF ${formatCHF(v)}`, 'Kaufkraft']}
            labelFormatter={(l) => (mode === 'future' ? `Jahr ${l}` : `${l}`)}
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 12,
              fontSize: 13,
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#inflGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
