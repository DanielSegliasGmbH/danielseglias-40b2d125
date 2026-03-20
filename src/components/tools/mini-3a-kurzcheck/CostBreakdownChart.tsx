import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Mini3aResult } from './types';

interface CostBreakdownChartProps {
  costBreakdown: Mini3aResult['costBreakdown'];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(0 60% 55%)',
  'hsl(25 80% 55%)',
  'hsl(40 80% 55%)',
  'hsl(15 70% 50%)',
  'hsl(140 45% 45%)',
];

function formatCHF(val: number) {
  return `CHF ${val.toLocaleString('de-CH', { maximumFractionDigits: 0 })}`;
}

export function CostBreakdownChart({ costBreakdown }: CostBreakdownChartProps) {
  const data = [
    { name: 'Einzahlungen', value: costBreakdown.einzahlungen },
    { name: 'Abschlusskosten', value: costBreakdown.abschlusskosten },
    { name: 'Lfd. Kosten', value: costBreakdown.laufendeKosten },
    { name: 'Ausgabeaufschlag', value: costBreakdown.ausgabeaufschlag },
    { name: 'Rücknah.-Komm.', value: costBreakdown.ruecknahmekommission },
    { name: 'Zinsen (erw.)', value: costBreakdown.zinsen },
  ].filter(d => d.value > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Laufzeit-Übersicht (CHF)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis
                type="number"
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                formatter={(value: number) => formatCHF(value)}
                contentStyle={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Vereinfachte Schätzung auf Basis der eingegebenen Daten. Dient der Orientierung, nicht als verbindliche Berechnung.
        </p>
      </CardContent>
    </Card>
  );
}
