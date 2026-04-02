import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, Cell } from 'recharts';
import { TrendingUp, ArrowUpDown, Info } from 'lucide-react';
import { AnalysisResult } from './types';

// Safely parse a value that might be string or number
function safeNum(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/['']/g, '').replace(',', '.').replace(/[^\d.\-]/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  }
  return null;
}

function formatCHF(value: number): string {
  return `CHF ${Math.round(value).toLocaleString('de-CH')}`;
}

function formatCHFShort(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000).toLocaleString('de-CH')}k`;
  return Math.round(value).toLocaleString('de-CH');
}

const BAR_COLORS = {
  einzahlung: 'hsl(var(--muted-foreground))',
  vertrag: 'hsl(var(--primary))',
  optimiert: '#4ade80',
};

// ── Custom Tooltip ──
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-foreground">{formatCHF(payload[0].value)}</p>
    </div>
  );
}

// ══════════════════════════════════════════════
// VISUALIZATION 1: Hauptvergleich (Bar Chart)
// ══════════════════════════════════════════════

interface MainComparisonProps {
  zahlenuebersicht: AnalysisResult['zahlenuebersicht'];
}

export function MainComparisonChart({ zahlenuebersicht }: MainComparisonProps) {
  const z = zahlenuebersicht;
  if (!z) return null;

  const einzahlung = safeNum(z.gesamteinzahlung);
  const prognose = safeNum(z.vertrag_prognose);
  const optimiert = safeNum(z.optimiertes_szenario);

  const chartData = [
    einzahlung !== null ? { name: 'Einzahlung', value: einzahlung, color: BAR_COLORS.einzahlung } : null,
    prognose !== null ? { name: 'Vertragsprognose', value: prognose, color: BAR_COLORS.vertrag } : null,
    optimiert !== null ? { name: 'Optimiert (8.5%)', value: optimiert, color: BAR_COLORS.optimiert } : null,
  ].filter(Boolean) as Array<{ name: string; value: number; color: string }>;

  if (chartData.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Info className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Für den Hauptvergleich fehlen aktuell noch belastbare Daten.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-primary" />
          Was du einzahlst vs. was daraus wird
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }} barSize={48}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCHFShort(v)}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} label={{ position: 'top', formatter: (v: number) => formatCHFShort(v), fontSize: 11, fill: 'hsl(var(--foreground))' }}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-3 justify-center">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════
// VISUALIZATION 2: Differenz-Highlight
// ══════════════════════════════════════════════

interface DifferenceHighlightProps {
  zahlenuebersicht: AnalysisResult['zahlenuebersicht'];
}

export function DifferenceHighlight({ zahlenuebersicht }: DifferenceHighlightProps) {
  const z = zahlenuebersicht;
  const diffAbs = safeNum(z?.differenz_absolut);
  const diffPct = safeNum(z?.differenz_prozent);
  if (!z || diffAbs === null) return null;

  return (
    <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Mögliche Differenz</p>
            <p className="text-3xl sm:text-4xl font-bold text-emerald-700 dark:text-emerald-400">
              +{formatCHF(diffAbs)}
            </p>
          </div>
          {diffPct !== null && (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700 text-sm px-3 py-1">
              +{diffPct.toFixed(1)}% mehr
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4 max-w-md mx-auto">
          Dies ist die berechnete Differenz zwischen deiner aktuellen Vertragsprognose und einem optimierten Szenario mit 8.5% Nettorendite.
        </p>
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════
// VISUALIZATION 3: Inflationsvergleich
// ══════════════════════════════════════════════

interface InflationComparisonProps {
  inflationssicht: AnalysisResult['inflationssicht'];
}

export function InflationComparisonChart({ inflationssicht }: InflationComparisonProps) {
  const inf = inflationssicht;
  if (!inf || (inf.realwert_vertrag === null && inf.realwert_optimiert === null)) return null;

  const chartData = [
    inf.realwert_vertrag !== null ? { name: 'Vertrag (real)', value: inf.realwert_vertrag, color: BAR_COLORS.vertrag } : null,
    inf.realwert_optimiert !== null ? { name: 'Optimiert (real)', value: inf.realwert_optimiert, color: BAR_COLORS.optimiert } : null,
  ].filter(Boolean) as Array<{ name: string; value: number; color: string }>;

  if (chartData.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowUpDown className="h-4 w-4 text-amber-600" />
          Kaufkraft nach Inflation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }} barSize={56}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCHFShort(v)}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} label={{ position: 'top', formatter: (v: number) => formatCHFShort(v), fontSize: 11, fill: 'hsl(var(--foreground))' }}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-muted/50">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            {inf.kommentar || 'Diese Werte zeigen die heutige Kaufkraft unter Berücksichtigung einer Inflation von 2.4% pro Jahr. Nominal höhere Beträge können real weniger wert sein.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════
// VISUALIZATION 4: Wachstumskurve (Growth Line)
// ══════════════════════════════════════════════

interface GrowthCurveProps {
  zahlenuebersicht: AnalysisResult['zahlenuebersicht'];
  laufzeitJahre: number | null;
  monatlichBeitrag: number | null;
}

export function GrowthCurveChart({ zahlenuebersicht, laufzeitJahre, monatlichBeitrag }: GrowthCurveProps) {
  const z = zahlenuebersicht;
  if (!z || !laufzeitJahre || !monatlichBeitrag || laufzeitJahre < 2) return null;
  if (z.vertrag_prognose === null && z.optimiertes_szenario === null) return null;

  // Approximate growth curves from start to end values using compound interest
  const years = Math.round(laufzeitJahre);
  const annual = monatlichBeitrag * 12;

  // Derive implicit rates from final values
  const deriveRate = (finalValue: number | null): number | null => {
    if (finalValue === null || finalValue <= 0) return null;
    // Simple approximation: solve for r in FV = annual * ((1+r)^n - 1) / r
    // Use bisection
    let lo = -0.05, hi = 0.2;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      let fv = 0;
      for (let y = 0; y < years; y++) fv = (fv + annual) * (1 + mid);
      if (fv < finalValue) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  };

  const rateVertrag = deriveRate(z.vertrag_prognose);
  const rateOptimiert = 0.085; // fixed at 8.5%

  const buildCurve = (rate: number) => {
    const points: number[] = [0];
    let val = 0;
    for (let y = 1; y <= years; y++) {
      val = (val + annual) * (1 + rate);
      points.push(Math.round(val));
    }
    return points;
  };

  const curveOptimiert = buildCurve(rateOptimiert);
  const curveVertrag = rateVertrag !== null ? buildCurve(rateVertrag) : null;

  const chartData = Array.from({ length: years + 1 }, (_, i) => ({
    jahr: i,
    optimiert: curveOptimiert[i],
    ...(curveVertrag ? { vertrag: curveVertrag[i] } : {}),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-primary" />
          Vermögensentwicklung über die Laufzeit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="jahr"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Jahre', position: 'insideBottom', offset: -2, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                tickFormatter={(v) => formatCHFShort(v)}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatCHF(value), name === 'optimiert' ? 'Optimiert (8.5%)' : 'Vertragslösung']}
                labelFormatter={(label) => `Jahr ${label}`}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
              />
              <Legend
                formatter={(value) => value === 'optimiert' ? 'Optimiert (8.5%)' : 'Vertragslösung'}
                wrapperStyle={{ fontSize: '12px' }}
              />
              {curveVertrag && (
                <Line type="monotone" dataKey="vertrag" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              )}
              <Line type="monotone" dataKey="optimiert" stroke="#4ade80" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Approximierte Darstellung basierend auf den berechneten Endwerten. Keine Garantie für tatsächliche Entwicklung.
        </p>
      </CardContent>
    </Card>
  );
}
