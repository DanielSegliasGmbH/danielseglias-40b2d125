import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Sparkles, Brain, Eye, Target, LayoutGrid, Shield, Settings2, TrendingUp, Rocket, Star, RotateCcw, Info, Lock, CheckCircle, Clock, Play, Zap, Film, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';
import { useAllCoachProgress, useCoachBadges, getModuleStatus } from '@/hooks/useCoachProgress';
import { useFinanzType } from '@/hooks/useFinanzType';
import { NEWCOMER_DB_PREFIX } from '@/config/coachNewcomerModules';
import { useState } from 'react';

const modules = [
  { id: 1, key: 'mindset', icon: Brain, title: 'Mindset', desc: 'Deine Denkmuster erkennen und bewusst steuern.', xp: 100, time: '15–20 Min.' },
  { id: 2, key: 'klarheit', icon: Eye, title: 'Klarheit', desc: 'Den Überblick über deine aktuelle Situation gewinnen.', xp: 100, time: '20–25 Min.' },
  { id: 3, key: 'ziele', icon: Target, title: 'Ziele', desc: 'Klare, messbare Finanzziele definieren.', xp: 100, time: '15–20 Min.' },
  { id: 4, key: 'struktur', icon: LayoutGrid, title: 'Struktur', desc: 'Deine Finanzen sauber organisieren.', xp: 100, time: '15–20 Min.' },
  { id: 5, key: 'absicherung', icon: Shield, title: 'Absicherung', desc: 'Die wichtigsten Risiken richtig absichern.', xp: 100, time: '15–20 Min.' },
  { id: 6, key: 'optimierung', icon: Settings2, title: 'Optimierung', desc: 'Bestehende Verträge und Kosten verbessern.', xp: 100, time: '15–20 Min.' },
  { id: 7, key: 'investment', icon: TrendingUp, title: 'Investment', desc: 'Dein Geld gezielt für dich arbeiten lassen.', xp: 100, time: '15–20 Min.' },
  { id: 8, key: 'skalierung', icon: Rocket, title: 'Skalierung', desc: 'Dein Vermögensaufbau auf die nächste Stufe bringen.', xp: 100, time: '15–20 Min.' },
  { id: 9, key: 'freiheit', icon: Star, title: 'Freiheit', desc: 'Finanzielle Unabhängigkeit konkret planen.', xp: 100, time: '15–20 Min.' },
  { id: 10, key: 'review', icon: RotateCcw, title: 'Review', desc: 'Regelmässig prüfen, anpassen und wachsen.', xp: 100, time: '10–15 Min.' },
];

const statusConfig = {
  not_started: { label: 'Nicht gestartet', variant: 'muted' as const, icon: null },
  in_progress: { label: 'In Bearbeitung', variant: 'warning' as const, icon: Play },
  completed: { label: 'Abgeschlossen', variant: 'success' as const, icon: CheckCircle },
};

export default function ClientPortalCoach() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isPremium, isLoading: subLoading } = useSubscription();
  const { user } = useAuth();
  const { data: allProgress = [] } = useAllCoachProgress();
  const { data: badges = [] } = useCoachBadges();
  const { completed: finanzTypCompleted, recommendedModules } = useFinanzType();

  const { data: lifeFilmCompleted = false } = useQuery({
    queryKey: ['life-film-completed', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('life_film_data')
        .select('completed')
        .eq('user_id', user.id)
        .eq('completed', true)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });
  const FREE_MODULE_COUNT = 3;

  // Build status map from DB
  const progressMap = new Map(allProgress.map(p => [p.module_key, p]));

  const completedCount = modules.filter(m => getModuleStatus(progressMap.get(m.key)) === 'completed').length;
  const progressPercent = Math.round((completedCount / modules.length) * 100);

  // Find next recommended module (first non-completed)
  const nextModuleKey = modules.find(m => {
    const status = getModuleStatus(progressMap.get(m.key));
    return status !== 'completed';
  })?.key;

  // Find resumable module (in_progress)
  const resumeModule = modules.find(m => getModuleStatus(progressMap.get(m.key)) === 'in_progress');

  // Check if user has started original coach
  const hasStartedOriginal = allProgress.some(p => !p.module_key.startsWith(NEWCOMER_DB_PREFIX) && (p.status === 'in_progress' || p.status === 'completed'));
  const [activeTab, setActiveTab] = useState<'original' | 'newcomer'>(hasStartedOriginal ? 'original' : 'newcomer');

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
          <p className="text-sm text-muted-foreground leading-relaxed">
            Wähle deinen Weg: Einfacher Einstieg oder tiefgreifende Analyse.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          <button
            onClick={() => setActiveTab('newcomer')}
            className={cn(
              "flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all",
              activeTab === 'newcomer'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            🌱 Newcomer Coach
          </button>
          <button
            onClick={() => setActiveTab('original')}
            className={cn(
              "flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all",
              activeTab === 'original'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            🧠 Original Coach
          </button>
        </div>

        {/* Newcomer redirect */}
        {activeTab === 'newcomer' && (
          <>
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-5 space-y-3">
                <h2 className="text-base font-bold text-foreground">Neu bei Finanzen?</h2>
                <p className="text-sm text-muted-foreground">
                  5 kurze Module, kein Fachchinesisch. In unter 1 Stunde hast du einen soliden Grundstein gelegt.
                </p>
                <Button onClick={() => navigate('/app/client-portal/coach-newcomer')} className="gap-2">
                  Newcomer Coach starten <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'original' && (
          <>
        <p className="text-sm font-medium text-muted-foreground">
          Ohne Verkaufsinteressen. Mit klarem Plan und echter Umsetzung.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Hier wirst du Schritt für Schritt durch deine finanzielle Entwicklung geführt.
          Nicht durch Theorie, sondern durch klare Entscheidungen, persönliche Reflexion und konkrete Umsetzung.
        </p>

        {/* Finanz-Typ CTA */}
        <FinanzTypTeaser userId={user?.id} navigate={navigate} />

        {/* Lebensfilm CTA */}
        {!lifeFilmCompleted && (
          <Card
            className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent cursor-pointer active:scale-[0.98] transition-transform hover:shadow-md"
            onClick={() => navigate('/app/client-portal/life-film')}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Film className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm text-foreground">Dein Lebensfilm 🎬</h3>
                <p className="text-xs text-muted-foreground">Entdecke deine finanzielle Zukunft — in nur 2 Minuten</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        )}

        {/* Resume Banner */}
        {resumeModule && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Play className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Weiter machen</p>
                    <p className="text-xs text-muted-foreground truncate">Modul «{resumeModule.title}» fortsetzen</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate(`/app/client-portal/coach/${resumeModule.key}`)}
                  className="shrink-0 gap-1.5"
                >
                  Fortsetzen
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Dein Fortschritt</h2>
              <span className="text-xs font-medium text-muted-foreground">{completedCount}/{modules.length} Module · {progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {badges.map(b => (
                  <Badge key={b.id} variant="secondary" className="text-[10px] gap-1">
                    <CheckCircle className="h-2.5 w-2.5 text-green-600" />
                    {modules.find(m => m.key === b.module_key)?.title || b.module_key}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modules */}
        <div className="space-y-2">
          {modules.map((mod, idx) => {
            const progress = progressMap.get(mod.key);
            const status = getModuleStatus(progress);
            const statusInfo = statusConfig[status];
            const Icon = mod.icon;
            const isLocked = !isPremium && !subLoading && idx >= FREE_MODULE_COUNT;
            const isNext = mod.key === nextModuleKey && !isLocked;
            const hasBadge = badges.some(b => b.module_key === mod.key);
            const isTypeRecommended = finanzTypCompleted && recommendedModules.includes(mod.key) && status !== 'completed';

            return (
              <Card
                key={mod.id}
                className={cn(
                  "w-full transition-all active:scale-[0.98] touch-manipulation hover:shadow-md cursor-pointer",
                  isLocked && "opacity-60",
                  isNext && !resumeModule && "ring-1 ring-primary/30 shadow-md"
                )}
                onClick={() => {
                  if (isLocked) {
                    navigate('/app/client-portal/premium');
                  } else {
                    navigate(`/app/client-portal/coach/${mod.key}`);
                  }
                }}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative",
                      isLocked ? "bg-muted" :
                      status === 'completed' ? "bg-green-100 dark:bg-green-900/30" :
                      "bg-primary/10"
                    )}>
                      {isLocked ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <span className="text-xs font-bold text-primary">{idx + 1}</span>
                      )}
                      {hasBadge && status === 'completed' && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                          <Star className="h-2.5 w-2.5 text-yellow-800" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Icon className={cn("h-3.5 w-3.5 shrink-0", isLocked ? "text-muted-foreground" : status === 'completed' ? "text-green-600" : "text-primary")} />
                        <h3 className="font-semibold text-sm text-foreground truncate">{mod.title}</h3>
                        {isLocked && (
                          <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary border-0 px-1.5 py-0">
                            Premium
                          </Badge>
                        )}
                        {isNext && !isLocked && !resumeModule && (
                          <Badge variant="default" className="text-[9px] px-1.5 py-0">
                            Empfohlen
                          </Badge>
                        )}
                        {isTypeRecommended && !isLocked && !isNext && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-0">
                            Für dich
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{mod.desc}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        {!isLocked && (
                          <Badge variant={statusInfo.variant} className="text-[10px] gap-1">
                            {statusInfo.icon && <statusInfo.icon className="h-2.5 w-2.5" />}
                            {statusInfo.label}
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {mod.time}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Zap className="h-2.5 w-2.5" /> +{mod.xp} XP
                        </span>
                      </div>
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
            Du kannst externe Links wie Google Drive, Dropbox oder iCloud verwenden.
          </p>
        </div>
          </>
        )}
      </div>
    </ClientPortalLayout>
  );
}

function FinanzTypTeaser({ userId, navigate }: { userId?: string; navigate: (path: string) => void }) {
  const { data: finanzType } = useQuery({
    queryKey: ['finanz-type', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('finanz_type_results')
        .select('finanz_type, completed')
        .eq('user_id', userId)
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

  const TYPE_LABELS: Record<string, { emoji: string; title: string }> = {
    skeptiker: { emoji: '🏦', title: 'Der Sparsame Skeptiker' },
    geniesser: { emoji: '🎢', title: 'Der Planlose Geniesser' },
    pflichterfueller: { emoji: '✅', title: 'Der Pflichterfüller' },
  };

  if (finanzType?.completed && finanzType.finanz_type) {
    const info = TYPE_LABELS[finanzType.finanz_type];
    if (!info) return null;
    return (
      <Card
        className="cursor-pointer active:scale-[0.98] transition-transform hover:shadow-md"
        onClick={() => navigate('/app/client-portal/finanz-typ')}
      >
        <CardContent className="p-3 flex items-center gap-3">
          <span className="text-2xl">{info.emoji}</span>
          <p className="text-sm text-foreground flex-1">
            Dein Finanz-Typ: <span className="font-semibold">{info.title}</span>
          </p>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent cursor-pointer active:scale-[0.98] transition-transform hover:shadow-md"
      onClick={() => navigate('/app/client-portal/finanz-typ')}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <UserRound className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm text-foreground">Dein Finanz-Typ 🧠</h3>
          <p className="text-xs text-muted-foreground">Finde heraus, welcher Finanz-Typ du bist — in 1 Minute</p>
        </div>
        <Badge variant="secondary" className="shrink-0 text-[10px] gap-1">
          <Zap className="h-2.5 w-2.5" /> +200 XP
        </Badge>
      </CardContent>
    </Card>
  );
}
