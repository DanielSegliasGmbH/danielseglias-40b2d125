import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { riskProfiles } from './strategyData';

interface Props {
  selected: string;
  onSelect: (id: string) => void;
  privacyMode?: boolean;
}

export function GlidepathSection({ selected, onSelect, privacyMode }: Props) {
  const profile = riskProfiles.find((r) => r.id === selected) ?? riskProfiles[0];
  const ages = profile.rows.map((r) => r.age);
  const minAge = ages[0];
  const maxAge = ages[ages.length - 1];

  const [selectedAge, setSelectedAge] = useState<number>(minAge);

  // Reset slider when risk profile changes
  useEffect(() => {
    setSelectedAge(minAge);
  }, [selected, minAge]);

  const currentRow =
    profile.rows.find((r) => r.age === selectedAge) ?? profile.rows[0];

  const chartData = profile.rows.map((r) => ({
    age: r.age,
    stocks: r.stocks,
    bonds: r.bonds,
    liquidity: r.liquidity,
  }));

  return (
    <section className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
          Ablaufmanagement
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Modellbasierte Gewichtungen über die Altersjahre
        </p>
      </div>

      {/* Risk level tabs — full width on mobile */}
      <div className="grid grid-cols-3 gap-2">
        {riskProfiles.map((r) => (
          <button
            key={r.id}
            onClick={() => {
              onSelect(r.id);
              setSelectedAge(r.rows[0].age);
            }}
            className={cn(
              'py-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200',
              selected === r.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Age selector */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">
              Alter bei Pensionierung
            </span>
            <span className="text-2xl font-bold text-primary tabular-nums">
              {selectedAge}
            </span>
          </div>
          <Slider
            min={minAge}
            max={maxAge}
            step={1}
            value={[selectedAge]}
            onValueChange={(v) => setSelectedAge(v[0])}
            className="w-full"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
            <span>{minAge}</span>
            <span>{maxAge}</span>
          </div>
        </CardContent>
      </Card>

      {/* Allocation cards */}
      {!privacyMode && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <AllocationCard
            label="Aktien"
            value={currentRow.stocks}
            colorClass="bg-primary"
            highlight
          />
          <AllocationCard
            label="Obligationen"
            value={currentRow.bonds}
            colorClass="bg-secondary-foreground/60"
          />
          <AllocationCard
            label="Liquidität"
            value={currentRow.liquidity}
            colorClass="bg-muted-foreground/50"
          />
        </div>
      )}

      {/* Trend chart */}
      {!privacyMode && (
        <Card>
          <CardContent className="p-3 sm:p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Verlauf aller Altersjahre
            </h3>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gpStocks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="age"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, name: string) => [
                      `${value}%`,
                      name === 'stocks'
                        ? 'Aktien'
                        : name === 'bonds'
                          ? 'Obligationen'
                          : 'Liquidität',
                    ]}
                    labelFormatter={(label) => `Alter ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="stocks"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="url(#gpStocks)"
                  />
                  <Area
                    type="monotone"
                    dataKey="bonds"
                    stackId="1"
                    stroke="hsl(var(--secondary-foreground))"
                    fill="hsl(var(--secondary-foreground) / 0.4)"
                  />
                  <Area
                    type="monotone"
                    dataKey="liquidity"
                    stackId="1"
                    stroke="hsl(var(--muted-foreground))"
                    fill="hsl(var(--muted-foreground) / 0.3)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 justify-center text-[11px] text-muted-foreground">
              <LegendDot colorClass="bg-primary" label="Aktien" />
              <LegendDot colorClass="bg-secondary-foreground/60" label="Obligationen" />
              <LegendDot colorClass="bg-muted-foreground/50" label="Liquidität" />
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function AllocationCard({
  label,
  value,
  colorClass,
  highlight,
}: {
  label: string;
  value: number;
  colorClass: string;
  highlight?: boolean;
}) {
  return (
    <Card className={cn(highlight && 'border-primary/40 ring-1 ring-primary/10')}>
      <CardContent className="p-2.5 sm:p-3 space-y-2">
        <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight truncate">
          {label}
        </p>
        <p
          className={cn(
            'text-lg sm:text-2xl font-bold tabular-nums',
            highlight ? 'text-primary' : 'text-foreground',
          )}
        >
          {value}%
        </p>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-300', colorClass)}
            style={{ width: `${value}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function LegendDot({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('w-2.5 h-2.5 rounded-sm', colorClass)} />
      <span>{label}</span>
    </div>
  );
}
