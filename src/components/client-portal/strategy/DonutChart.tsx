import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DONUT_COLORS, type StrategyAllocation } from './strategyData';

interface Props {
  allocations: StrategyAllocation[];
  cryptoEnabled?: boolean;
  avgReturn?: string;
  privacyMode?: boolean;
  mini?: boolean;
}

export function DonutChart({ allocations, cryptoEnabled, avgReturn, privacyMode, mini }: Props) {
  let data = allocations.map((a, i) => ({
    name: privacyMode ? `Baustein ${i + 1}` : a.region,
    value: a.weight,
  }));

  if (cryptoEnabled) {
    const scale = 95 / 100;
    data = data.map((d) => ({ ...d, value: Math.round(d.value * scale) }));
    const remainder = 100 - data.reduce((s, d) => s + d.value, 0);
    data.push({ name: privacyMode ? `Baustein ${data.length + 1}` : 'Krypto', value: remainder });
  }

  const chartHeight = mini ? 64 : 220;
  const innerR = mini ? 18 : 55;
  const outerR = mini ? 30 : 90;

  return (
    <div className={`w-full relative`} style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerR}
            outerRadius={outerR}
            paddingAngle={mini ? 1 : 2}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
            ))}
          </Pie>
          {!privacyMode && !mini && (
            <Tooltip
              formatter={(value: number) => [`${value}%`, '']}
              contentStyle={{
                backgroundColor: 'hsl(0 0% 100%)',
                border: '1px solid hsl(60 9% 66%)',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      {avgReturn && !mini && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-sm font-bold text-foreground">{avgReturn}</span>
        </div>
      )}
    </div>
  );
}
