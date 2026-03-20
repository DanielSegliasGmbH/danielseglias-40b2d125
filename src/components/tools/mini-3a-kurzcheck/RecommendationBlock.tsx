import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface RecommendationBlockProps {
  text: string;
}

export function RecommendationBlock({ text }: RecommendationBlockProps) {
  return (
    <Card className="border-primary/20 bg-primary/[0.03]">
      <CardContent className="pt-5 pb-5">
        <div className="flex gap-3">
          <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">Empfehlung & nächster Schritt</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
