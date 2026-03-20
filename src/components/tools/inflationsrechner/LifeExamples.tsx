import { Beer, Home, Car, UtensilsCrossed, Plane, Shirt, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { lifeExamples, inflatePrice, formatCHF } from './inflationData';

const iconMap: Record<string, LucideIcon> = {
  Beer, Home, Car, UtensilsCrossed, Plane, Shirt,
};

interface Props {
  years: number;
  rate: number;
}

export function LifeExamples({ years, rate }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {lifeExamples.map((ex) => {
        const futurePrice = inflatePrice(ex.priceToday, years, rate);
        const Icon = iconMap[ex.icon];
        return (
          <Card key={ex.key} className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 text-primary" />}
              <span className="text-sm font-medium text-foreground">{ex.label}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Heute: <span className="font-semibold text-foreground">{formatCHF(ex.priceToday)} CHF</span>
            </div>
            <div className="text-xs text-muted-foreground">
              In {years} J.: <span className="font-semibold text-primary">{formatCHF(futurePrice)} CHF</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
