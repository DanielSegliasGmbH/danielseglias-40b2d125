import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DONUT_COLORS, type StrategyAllocation } from './strategyData';

interface Props {
  allocations: StrategyAllocation[];
  cryptoEnabled?: boolean;
}

export function DonutChart({ allocations, cryptoEnabled }: Props) {
  let data = allocations.map((a) => ({ name: a.region, value: a.weight }));

  if (cryptoEnabled) {
    // Scale down existing and add 5% crypto
    const scale = 95 / 100;
    data = data.map((d) => ({ ...d, value: Math.round(d.value * scale) }));
    const remainder = 100 - data.reduce((s, d) => s + d.value, 0);
    data.push({ name: 'Krypto', value: remainder });
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value}%`, '']}
            contentStyle={{
              backgroundColor: 'hsl(0 0% 100%)',
              border: '1px solid hsl(60 9% 66%)',
              borderRadius: '12px',
              fontSize: '12px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
