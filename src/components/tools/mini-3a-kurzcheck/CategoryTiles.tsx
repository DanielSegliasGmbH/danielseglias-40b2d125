import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CategoryScore } from './types';

interface CategoryTilesProps {
  categories: CategoryScore[];
}

function ratingColor(rating: 'gut' | 'mittel' | 'schwach') {
  switch (rating) {
    case 'gut': return 'text-emerald-700 bg-emerald-50';
    case 'mittel': return 'text-amber-700 bg-amber-50';
    case 'schwach': return 'text-red-700 bg-red-50';
  }
}

function ratingLabel(rating: 'gut' | 'mittel' | 'schwach') {
  switch (rating) {
    case 'gut': return 'Gut';
    case 'mittel': return 'Mittel';
    case 'schwach': return 'Schwach';
  }
}

function progressColor(rating: 'gut' | 'mittel' | 'schwach') {
  switch (rating) {
    case 'gut': return '[&>div]:bg-emerald-600';
    case 'mittel': return '[&>div]:bg-amber-500';
    case 'schwach': return '[&>div]:bg-red-500';
  }
}

export function CategoryTiles({ categories }: CategoryTilesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.map((cat) => (
        <Card key={cat.key} className="overflow-hidden">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-sm font-medium text-foreground leading-tight pr-2">{cat.label}</h4>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${ratingColor(cat.rating)}`}>
                {ratingLabel(cat.rating)}
              </span>
            </div>
            <div className="text-2xl font-bold tabular-nums text-foreground mb-2">{cat.score}</div>
            <Progress value={cat.score} className={`h-2 ${progressColor(cat.rating)}`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
