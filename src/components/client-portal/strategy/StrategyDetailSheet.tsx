import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DonutChart } from './DonutChart';
import { RiskDots } from './RiskDots';
import { ChatDrawer } from '@/components/client-portal/ChatDrawer';
import { type Strategy } from './strategyData';
import { Sparkles, MessageCircle, TrendingUp, PieChart, BarChart3 } from 'lucide-react';

interface Props {
  strategy: Strategy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cryptoEnabled: boolean;
  privacyMode?: boolean;
  isMatch: boolean;
}

export function StrategyDetailSheet({
  strategy,
  open,
  onOpenChange,
  cryptoEnabled,
  privacyMode,
  isMatch,
}: Props) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <SheetTitle className="text-lg font-bold text-foreground">
                  {strategy.name}
                </SheetTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <RiskDots level={strategy.riskLevel} />
                  <Badge variant="secondary" className="text-[10px]">
                    {strategy.subtitle}
                  </Badge>
                  {isMatch && (
                    <Badge className="text-[10px] px-1.5 py-0 gap-0.5 bg-primary/10 text-primary border-primary/20">
                      <Sparkles className="h-3 w-3" /> Passt zu dir
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-5 py-4">
            {/* Full description */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Beschreibung
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {strategy.fullDescription}
                </p>
              </CardContent>
            </Card>

            {/* Historical performance */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Historische Performance
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 rounded-xl px-3 py-2 text-center">
                    <p className="text-lg font-bold text-primary">{strategy.avgReturn}</p>
                    <p className="text-[10px] text-muted-foreground">{strategy.returnSince}</p>
                  </div>
                  <div className="bg-muted rounded-xl px-3 py-2 text-center">
                    <p className="text-sm font-semibold text-foreground">{strategy.returnRange}</p>
                    <p className="text-[10px] text-muted-foreground">Erwartungsbereich</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {strategy.performanceContext}
                </p>
              </CardContent>
            </Card>

            {/* Allocation breakdown */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <PieChart className="h-4 w-4 text-primary" />
                  Aktuelle Zusammensetzung
                </div>
                <DonutChart
                  allocations={strategy.allocations}
                  cryptoEnabled={cryptoEnabled}
                  avgReturn={strategy.avgReturn}
                  privacyMode={privacyMode}
                />
                <div className="space-y-2 pt-2">
                  {strategy.allocations.map((a, idx) => {
                    const adjustedWeight = cryptoEnabled
                      ? Math.round(a.weight * 0.95)
                      : a.weight;
                    return (
                      <div key={a.fundName} className="flex items-start justify-between gap-2">
                        <span className="text-xs text-foreground leading-snug break-words min-w-0">
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
                      <span className="text-xs text-foreground font-medium">
                        {privacyMode ? `Baustein ${strategy.allocations.length + 1}` : 'Krypto'}
                      </span>
                      {!privacyMode && (
                        <Badge variant="outline" className="text-xs font-mono border-primary text-primary">
                          5%
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Button
              className="w-full h-12 rounded-xl gap-2"
              onClick={() => setChatOpen(true)}
            >
              <MessageCircle className="h-5 w-5" />
              Mit Berater besprechen
            </Button>

            <p className="text-[10px] text-center text-muted-foreground">
              Vergangene Renditen sind keine Garantie für zukünftige Ergebnisse.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      <ChatDrawer open={chatOpen} onOpenChange={setChatOpen} />
    </>
  );
}
