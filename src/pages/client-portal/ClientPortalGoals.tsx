import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Trash2, Star, TrendingUp, Home, Briefcase, Plane, Heart, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalItem {
  id: string;
  title: string;
  description: string;
  category?: string;
  priority?: string;
  timeframe?: string;
  module: string;
  created_at: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  Sicherheit: Shield,
  Vermögensaufbau: TrendingUp,
  Wohnen: Home,
  Familie: Heart,
  Freiheit: Star,
  'Reisen / Erlebnisse': Plane,
  Business: Briefcase,
  Sonstiges: Sparkles,
};

const priorityColors: Record<string, string> = {
  hoch: 'text-red-600',
  mittel: 'text-amber-600',
  niedrig: 'text-muted-foreground',
};

export default function ClientPortalGoals() {
  const { t } = useTranslation();
  const [goals, setGoals] = useState<GoalItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('coach_goals');
    if (raw) setGoals(JSON.parse(raw));
  }, []);

  const handleDelete = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    localStorage.setItem('coach_goals', JSON.stringify(updated));
  };

  return (
    <ClientPortalLayout>
      <ScreenHeader title="Deine Ziele" showBack backTo="/app/client-portal" />
      <div className="max-w-2xl mx-auto space-y-4 p-4 pb-8">
        {goals.length === 0 ? (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1">Noch keine Ziele definiert</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Starte das Modul «Ziele» im Finanz-Coach, um deine persönlichen Finanzziele zu erarbeiten.
              </p>
            </CardContent>
          </Card>
        ) : (
          goals.map(goal => {
            const CatIcon = categoryIcons[goal.category || ''] || Target;
            return (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CatIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-foreground">{goal.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{goal.description}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {goal.category && (
                            <Badge variant="outline" className="text-[10px]">{goal.category}</Badge>
                          )}
                          {goal.priority && (
                            <span className={cn('text-[10px] font-medium', priorityColors[goal.priority] || '')}>
                              Priorität: {goal.priority}
                            </span>
                          )}
                          {goal.timeframe && (
                            <span className="text-[10px] text-muted-foreground">{goal.timeframe}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </ClientPortalLayout>
  );
}
