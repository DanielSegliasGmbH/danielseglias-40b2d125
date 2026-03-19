import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DonutChart } from './DonutChart';
import { getStrategiesForPlatform, type Strategy } from './strategyData';

interface Props {
  platformId: string;
  privacyMode?: boolean;
}

export function StrategySection({ platformId, privacyMode }: Props) {
  const strategies = getStrategiesForPlatform(platformId);
  const [selectedId, setSelectedId] = useState<string>('');
  const [cryptoEnabled, setCryptoEnabled] = useState(false);

  // Reset selection when platform changes
  useEffect(() => {
    if (strategies.length > 0) {
      setSelectedId(strategies[0].id);
    } else {
      setSelectedId('');
    }
  }, [platformId]);

  const activeStrategy = strategies.find((s) => s.id === selectedId) ?? strategies[0];

  // No strategies for this platform
  if (strategies.length === 0) {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Modellübersicht</h2>
          <p className="text-sm text-muted-foreground">
            Modellbasierte Betrachtung verschiedener Gewichtungen
          </p>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Für diese Plattform sind aktuell noch keine separaten Modellstrategien hinterlegt.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Modellübersicht</h2>
        <p className="text-sm text-muted-foreground">
          Modellbasierte Betrachtung verschiedener Gewichtungen
        </p>
      </div>

      {/* Strategy tabs - only show if more than 1 strategy */}
      {strategies.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {strategies.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                selectedId === s.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Strategy detail */}
      {activeStrategy && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Chart */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">{activeStrategy.name}</h3>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {activeStrategy.subtitle}
                  </Badge>
                </div>
                <DonutChart
                  allocations={activeStrategy.allocations}
                  cryptoEnabled={cryptoEnabled}
                  avgReturn={activeStrategy.avgReturn}
                  privacyMode={privacyMode}
                />
                <p className="text-center text-sm text-muted-foreground">
                  Ø Rendite:{' '}
                  <span className="font-semibold text-foreground">{activeStrategy.avgReturn}</span>
                  <span className="ml-1 text-xs">({activeStrategy.returnSince})</span>
                </p>
              </div>

              {/* Right: Allocations */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Zusammensetzung
                </p>
                <div className="space-y-2">
                  {activeStrategy.allocations.map((a, idx) => {
                    const adjustedWeight = cryptoEnabled
                      ? Math.round(a.weight * 0.95)
                      : a.weight;
                    return (
                      <div key={a.fundName} className="flex items-start justify-between gap-3">
                        <span className="text-sm text-foreground leading-snug">
                          {privacyMode ? `Baustein ${idx + 1}` : a.fundName}
                        </span>
                        {!privacyMode && (
                          <Badge variant="secondary" className="text-xs font-mono shrink-0">
                            {adjustedWeight}%
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                  {cryptoEnabled && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground font-medium">
                        {privacyMode ? `Baustein ${activeStrategy.allocations.length + 1}` : 'Krypto'}
                      </span>
                      {!privacyMode && (
                        <Badge variant="outline" className="text-xs font-mono border-primary text-primary">
                          5%
                        </Badge>
                      )}
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
      )}
    </section>
  );
}
