import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { platforms, type Platform } from './strategyData';

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export function PlatformSelector({ selected, onSelect }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold text-foreground">
        Wo investierst du deine Säule 3a?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {platforms.map((p) => (
          <PlatformCard
            key={p.id}
            platform={p}
            isActive={selected === p.id}
            onClick={() => onSelect(p.id)}
          />
        ))}
      </div>
    </section>
  );
}

function PlatformCard({
  platform,
  isActive,
  onClick,
}: {
  platform: Platform;
  isActive: boolean;
  onClick: () => void;
}) {
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
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-foreground">{platform.name}</h3>
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
      </CardContent>
    </Card>
  );
}
