import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, ExternalLink, Info } from 'lucide-react';
import { platforms, LAST_UPDATE_DATE, type Platform } from './strategyData';

interface Props {
  selected: string;
  onSelect: (id: string) => void;
  privacyMode?: boolean;
}

export function PlatformSelector({ selected, onSelect, privacyMode }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Mantel</h2>
          <p className="text-sm text-muted-foreground">
            Übersicht möglicher Modellstrategien zu Vorsorgeoptionen.
          </p>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Letztes Update: {LAST_UPDATE_DATE}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {platforms.map((p) => (
          <PlatformCard
            key={p.id}
            platform={p}
            isActive={selected === p.id}
            onClick={() => onSelect(p.id)}
            privacyMode={privacyMode}
          />
        ))}
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Diese Darstellung ist rein informativ und stellt keine Empfehlung im Sinne des FIDLEG dar.
        </p>
      </div>
    </section>
  );
}

function PlatformCard({
  platform,
  isActive,
  onClick,
  privacyMode,
}: {
  platform: Platform;
  isActive: boolean;
  onClick: () => void;
  privacyMode?: boolean;
}) {
  const displayName = privacyMode ? platform.privateName : platform.name;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        isActive
          ? 'border-primary ring-2 ring-primary/20 shadow-md'
          : 'border-border hover:border-primary/40',
      )}
    >
      <CardContent className="p-4 sm:p-5 space-y-2 sm:space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{displayName}</h3>
              {platform.badge && !privacyMode && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {platform.badge}
                </Badge>
              )}
            </div>
          </div>
          {isActive && (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Check className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{platform.description}</p>
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Produktkosten</span>
            <span className="font-medium text-foreground">{platform.productCosts}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Weitere Gebühren</span>
            <span className="font-medium text-foreground">{platform.otherFees}</span>
          </div>
        </div>
        {!privacyMode && (
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="text-xs h-7 flex-1">
              Mehr erfahren
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">
              Website <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
