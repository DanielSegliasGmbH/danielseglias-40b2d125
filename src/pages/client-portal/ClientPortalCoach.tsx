import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Sparkles, Brain, Eye, Target, LayoutGrid, Shield, Settings2, TrendingUp, Rocket, Star, RotateCcw, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const modules = [
  { id: 1, key: 'mindset', icon: Brain, title: 'Mindset', desc: 'Deine Denkmuster erkennen und bewusst steuern.', status: 'not_started' as const },
  { id: 2, key: 'klarheit', icon: Eye, title: 'Klarheit', desc: 'Den Überblick über deine aktuelle Situation gewinnen.', status: 'not_started' as const },
  { id: 3, key: 'ziele', icon: Target, title: 'Ziele', desc: 'Klare, messbare Finanzziele definieren.', status: 'not_started' as const },
  { id: 4, key: 'struktur', icon: LayoutGrid, title: 'Struktur', desc: 'Deine Finanzen sauber organisieren.', status: 'not_started' as const },
  { id: 5, key: 'absicherung', icon: Shield, title: 'Absicherung', desc: 'Die wichtigsten Risiken richtig absichern.', status: 'not_started' as const },
  { id: 6, key: 'optimierung', icon: Settings2, title: 'Optimierung', desc: 'Bestehende Verträge und Kosten verbessern.', status: 'not_started' as const },
  { id: 7, key: 'investment', icon: TrendingUp, title: 'Investment', desc: 'Dein Geld gezielt für dich arbeiten lassen.', status: 'not_started' as const },
  { id: 8, key: 'skalierung', icon: Rocket, title: 'Skalierung', desc: 'Dein Vermögensaufbau auf die nächste Stufe bringen.', status: 'not_started' as const },
  { id: 9, key: 'freiheit', icon: Star, title: 'Freiheit', desc: 'Finanzielle Unabhängigkeit konkret planen.', status: 'not_started' as const },
  { id: 10, key: 'review', icon: RotateCcw, title: 'Review', desc: 'Regelmässig prüfen, anpassen und wachsen.', status: 'not_started' as const },
];

const statusConfig = {
  not_started: { label: 'Nicht gestartet', variant: 'muted' as const },
  in_progress: { label: 'In Bearbeitung', variant: 'warning' as const },
  completed: { label: 'Abgeschlossen', variant: 'success' as const },
};

export default function ClientPortalCoach() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Static progress for now
  const completedCount = modules.filter(m => (m.status as string) === 'completed').length;
  const progressPercent = Math.round((completedCount / modules.length) * 100);

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="pt-1 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">
              Dein persönlicher Finanz-Coach
            </h1>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Ohne Verkaufsinteressen. Mit klarem Plan und echter Umsetzung.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hier wirst du Schritt für Schritt durch deine finanzielle Entwicklung geführt.
            Nicht durch Theorie, sondern durch klare Entscheidungen und konkrete Umsetzung.
          </p>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Dein Fortschritt</h2>
              <span className="text-xs font-medium text-muted-foreground">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Du baust Schritt für Schritt dein finanzielles Fundament auf.
            </p>
          </CardContent>
        </Card>

        {/* Modules */}
        <div className="space-y-2">
          {modules.map((mod, idx) => {
            const statusInfo = statusConfig[mod.status];
            const Icon = mod.icon;

            return (
              <Card
                key={mod.id}
                className="w-full transition-all active:scale-[0.98] touch-manipulation hover:shadow-md cursor-pointer"
                onClick={() => navigate(`/app/client-portal/coach/${mod.key}`)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">{idx + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                        <h3 className="font-semibold text-sm text-foreground truncate">{mod.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{mod.desc}</p>
                      <Badge variant={statusInfo.variant} className="mt-1.5 text-[10px]">
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Data hint */}
        <div className="flex items-start gap-2.5 px-1 py-3">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Deine sensiblen Dokumente werden nicht in dieser App gespeichert.
            Du kannst externe Links (z.&nbsp;B. Google Drive) verwenden.
          </p>
        </div>
      </div>
    </ClientPortalLayout>
  );
}
