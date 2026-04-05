import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wrench, BookOpen, Compass } from 'lucide-react';
import type { Recommendation } from '@/config/recommendationConfig';

interface RecommendationCardsProps {
  recommendations: Recommendation[];
  title?: string;
}

export function RecommendationCards({
  recommendations,
  title = 'Dein nächster sinnvoller Schritt',
}: RecommendationCardsProps) {
  const navigate = useNavigate();

  if (!recommendations.length) return null;

  const handleClick = (rec: Recommendation) => {
    if (rec.type === 'tool') {
      navigate(`/app/client-portal/tools/${rec.ref}`);
    } else {
      navigate(`/app/client-portal/library`);
    }
  };

  return (
    <div className="space-y-3 mt-6" data-pdf-hide="true">
      <div className="flex items-center gap-2 px-1">
        <Compass className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.slice(0, 3).map((rec) => (
          <Card
            key={`${rec.type}-${rec.ref}`}
            className="border-border hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => handleClick(rec)}
          >
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {rec.type === 'tool' ? (
                    <Wrench className="h-4 w-4 text-primary" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-primary" />
                  )}
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {rec.type === 'tool' ? 'Werkzeug' : 'Artikel'}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1 leading-snug">{rec.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">{rec.description}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full justify-between text-primary group-hover:bg-primary/5"
              >
                Jetzt ansehen
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
