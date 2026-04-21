import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DonutChart } from './DonutChart';
import { RiskDots } from './RiskDots';
import { StrategyDetailSheet } from './StrategyDetailSheet';
import { getStrategiesForPlatform, getRiskCategoryForTolerance, type Strategy } from './strategyData';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { Sparkles, ChevronRight } from 'lucide-react';

interface Props {
  platformId: string;
  privacyMode?: boolean;
}

export function StrategySection({ platformId, privacyMode }: Props) {
  const strategies = getStrategiesForPlatform(platformId);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [cryptoEnabled, setCryptoEnabled] = useState(false);

  const { profile: metaProfile } = useMetaProfile();
  const userRiskCategory = getRiskCategoryForTolerance(metaProfile?.risk_tolerance ?? null);

  // Reset when platform changes
  useEffect(() => {
    setSelectedStrategy(null);
  }, [platformId]);

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
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Modellübersicht</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Modellbasierte Betrachtung verschiedener Gewichtungen
        </p>
      </div>

      {/* Strategy cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {strategies.map((s) => {
          const isMatch = userRiskCategory !== null && s.riskCategory === userRiskCategory;
          return (
            <Card
              key={s.id}
              onClick={() => setSelectedStrategy(s)}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md relative group',
                isMatch
                  ? 'border-primary/50 ring-1 ring-primary/20'
                  : 'border-border hover:border-primary/40',
              )}
            >
              <CardContent className="p-4 sm:p-5 space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base leading-tight">
                      {s.name}
                    </h3>
                    <RiskDots level={s.riskLevel} />
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {isMatch && (
                      <Badge className="text-[10px] px-1.5 py-0 gap-0.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                        <Sparkles className="h-3 w-3" /> Passt zu dir
                      </Badge>
                    )}
                    {s.lastUpdated && (
                      <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                        Aktualisiert
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Short description */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {s.shortDescription}
                </p>

                {/* Mini donut + return range */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-12 h-12 shrink-0">
                    <DonutChart
                      allocations={s.allocations}
                      cryptoEnabled={false}
                      privacyMode={privacyMode}
                      mini
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-muted-foreground truncate">Erwartete Rendite</p>
                    <p className="text-sm font-semibold text-foreground break-words">{s.returnRange}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 break-words">
                      Ø {s.avgReturn} ({s.returnSince})
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Crypto toggle */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <Switch
            id="crypto-toggle"
            checked={cryptoEnabled}
            onCheckedChange={setCryptoEnabled}
          />
          <Label htmlFor="crypto-toggle" className="text-sm cursor-pointer">
            + 5% Krypto beimischen
          </Label>
        </CardContent>
      </Card>

      {/* Detail sheet */}
      {selectedStrategy && (
        <StrategyDetailSheet
          strategy={selectedStrategy}
          open={!!selectedStrategy}
          onOpenChange={(open) => { if (!open) setSelectedStrategy(null); }}
          cryptoEnabled={cryptoEnabled}
          privacyMode={privacyMode}
          isMatch={userRiskCategory !== null && selectedStrategy.riskCategory === userRiskCategory}
        />
      )}
    </section>
  );
}
