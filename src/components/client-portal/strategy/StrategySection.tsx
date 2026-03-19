import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DonutChart } from './DonutChart';
import { strategies, type Strategy } from './strategyData';

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export function StrategySection({ selected, onSelect }: Props) {
  const [cryptoEnabled, setCryptoEnabled] = useState(false);
  const activeStrategy = strategies.find((s) => s.id === selected) ?? strategies[0];

  return (
    <section className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold text-foreground">
        Wie wird dein Geld investiert?
      </h2>

      {/* Strategy tabs */}
      <div className="flex flex-wrap gap-2">
        {strategies.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              selected === s.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Strategy detail */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Chart */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-foreground">{activeStrategy.name}</h3>
                <p className="text-sm text-muted-foreground">{activeStrategy.subtitle}</p>
              </div>
              <DonutChart allocations={activeStrategy.allocations} cryptoEnabled={cryptoEnabled} />
              <p className="text-center text-sm text-muted-foreground">
                Ø Rendite seit 2021:{' '}
                <span className="font-semibold text-foreground">{activeStrategy.avgReturn}</span>
              </p>
            </div>

            {/* Right: Allocations */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Zusammensetzung
              </p>
              <div className="space-y-2">
                {activeStrategy.allocations.map((a) => {
                  const adjustedWeight = cryptoEnabled
                    ? Math.round(a.weight * 0.95)
                    : a.weight;
                  return (
                    <div key={a.region} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{a.region}</span>
                      <Badge variant="secondary" className="text-xs font-mono">
                        {adjustedWeight}%
                      </Badge>
                    </div>
                  );
                })}
                {cryptoEnabled && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground font-medium">Krypto</span>
                    <Badge variant="outline" className="text-xs font-mono border-primary text-primary">
                      5%
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Crypto toggle */}
          <div className="mt-6 pt-4 border-t flex items-center gap-3">
            <Switch
              id="crypto-toggle"
              checked={cryptoEnabled}
              onCheckedChange={setCryptoEnabled}
            />
            <Label htmlFor="crypto-toggle" className="text-sm cursor-pointer">
              + 5% Krypto beimischen
            </Label>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
