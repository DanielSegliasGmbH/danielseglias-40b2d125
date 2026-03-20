import { Briefcase, Palmtree, Home, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCHF } from './calcLogic';

interface Props {
  loss: number;
}

const MEDIAN_INCOME = 88_000;

export function LifeImpactSection({ loss }: Props) {
  if (loss <= 0) return null;

  const yearsLost = loss / MEDIAN_INCOME;

  const examples = [
    {
      icon: Briefcase,
      text: `Das entspricht ungefähr ${yearsLost.toFixed(1).replace('.', ',')} Jahren Arbeit auf Basis eines durchschnittlichen Einkommens in der Schweiz.`,
    },
    {
      icon: Palmtree,
      text: 'Dieser Betrag könnte dir ermöglichen, mehrere Jahre früher in Pension zu gehen.',
    },
    {
      icon: Home,
      text: 'Dieser Betrag könnte den Eigenkapitalanteil für eine Immobilie darstellen oder deine Wohnsituation langfristig verbessern.',
    },
    {
      icon: Heart,
      text: 'Dieses Geld könnte die Ausbildung deiner Kinder finanzieren oder deiner Familie langfristige Sicherheit geben.',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Was dieser Betrag für dein Leben bedeutet
      </h3>

      <div className="grid sm:grid-cols-2 gap-3">
        {examples.map((ex, i) => {
          const Icon = ex.icon;
          return (
            <Card key={i}>
              <CardContent className="py-4 flex gap-3 items-start">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{ex.text}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground italic">
        Die meisten unterschätzen diesen Effekt massiv – weil er über viele Jahre entsteht.
      </p>
    </div>
  );
}
