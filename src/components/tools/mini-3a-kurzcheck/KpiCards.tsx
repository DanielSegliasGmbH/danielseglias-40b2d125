import { Card, CardContent } from '@/components/ui/card';
import { Star, TrendingUp, Calendar } from 'lucide-react';
import { Mini3aResult } from './types';

interface KpiCardsProps {
  result: Mini3aResult;
}

export function KpiCards({ result }: KpiCardsProps) {
  const fullStars = Math.floor(result.sterne);
  const hasHalf = result.sterne - fullStars >= 0.3;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Gesamtscore */}
      <Card className="border-primary/20">
        <CardContent className="pt-6 pb-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Gesamtscore</span>
          </div>
          <div className="text-4xl font-bold text-foreground tabular-nums">{result.gesamtscore}<span className="text-lg text-muted-foreground font-normal"> / 100</span></div>
          <p className="text-sm text-muted-foreground mt-1">{result.bewertungsText}</p>
        </CardContent>
      </Card>

      {/* Sterne */}
      <Card>
        <CardContent className="pt-6 pb-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Bewertung</span>
          </div>
          <div className="flex items-center justify-center gap-0.5 mb-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`h-7 w-7 ${
                  i < fullStars
                    ? 'text-primary fill-primary'
                    : i === fullStars && hasHalf
                    ? 'text-primary fill-primary/40'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground tabular-nums">{result.sterne.toFixed(1)} von 5 Sternen</p>
        </CardContent>
      </Card>

      {/* Jahre bis Pension */}
      <Card>
        <CardContent className="pt-6 pb-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Laufzeit</span>
          </div>
          <div className="text-4xl font-bold text-foreground tabular-nums">{result.jahreBisPension}</div>
          <p className="text-sm text-muted-foreground mt-1">Jahre bis zur Pension</p>
        </CardContent>
      </Card>
    </div>
  );
}
