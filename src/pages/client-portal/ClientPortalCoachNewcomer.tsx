import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Sparkles, CheckCircle, Clock, Zap, Play, Trophy, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAllCoachProgress, getModuleStatus } from '@/hooks/useCoachProgress';
import { NEWCOMER_MODULES, NEWCOMER_DB_PREFIX, NEWCOMER_TOTAL_XP } from '@/config/coachNewcomerModules';

export default function ClientPortalCoachNewcomer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: allProgress = [] } = useAllCoachProgress();

  const progressMap = new Map(allProgress.map(p => [p.module_key, p]));

  const completedCount = NEWCOMER_MODULES.filter(m =>
    getModuleStatus(progressMap.get(`${NEWCOMER_DB_PREFIX}${m.key}`)) === 'completed'
  ).length;
  const inProgressCount = NEWCOMER_MODULES.filter(m =>
    getModuleStatus(progressMap.get(`${NEWCOMER_DB_PREFIX}${m.key}`)) === 'in_progress'
  ).length;
  const progressPercent = Math.round(((completedCount + inProgressCount * 0.5) / NEWCOMER_MODULES.length) * 100);
  const allDone = completedCount === NEWCOMER_MODULES.length;

  const resumeModule = NEWCOMER_MODULES.find(m =>
    getModuleStatus(progressMap.get(`${NEWCOMER_DB_PREFIX}${m.key}`)) === 'in_progress'
  );
  const nextModule = NEWCOMER_MODULES.find(m =>
    getModuleStatus(progressMap.get(`${NEWCOMER_DB_PREFIX}${m.key}`)) !== 'completed'
  );

  const statusConfig = {
    not_started: { label: 'Nicht gestartet', variant: 'muted' as const },
    in_progress: { label: 'In Bearbeitung', variant: 'warning' as const },
    completed: { label: 'Abgeschlossen', variant: 'success' as const },
  };

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="pt-1 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">Newcomer Coach</h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Dein einfacher Einstieg in die Finanzwelt. 5 kurze Module, klare Schritte, sofort umsetzbar.
          </p>
        </div>

        {/* Resume banner */}
        {resumeModule && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Play className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Weiter machen</p>
                  <p className="text-xs text-muted-foreground truncate">«{resumeModule.title}» fortsetzen</p>
                </div>
              </div>
              <Button size="sm" onClick={() => navigate(`/app/client-portal/coach-newcomer/${resumeModule.key}`)} className="gap-1.5">
                Fortsetzen <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Dein Fortschritt</h2>
              <span className="text-xs font-medium text-muted-foreground">
                {completedCount} abgeschlossen{inProgressCount > 0 ? `, ${inProgressCount} in Bearbeitung` : ''} · {progressPercent}%
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>

        {/* Completion banner */}
        {allDone && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-5 text-center space-y-3">
              <Trophy className="h-8 w-8 text-primary mx-auto" />
              <h2 className="text-base font-bold text-foreground">Newcomer Coach abgeschlossen! 🎉</h2>
              <p className="text-sm text-muted-foreground">Du hast {NEWCOMER_TOTAL_XP} XP verdient und den «Finanz-Starter» Badge freigeschaltet.</p>
              <Button variant="outline" onClick={() => navigate('/app/client-portal/coach')} className="gap-2">
                Bereit für mehr? Original Coach starten <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modules */}
        <div className="space-y-2">
          {NEWCOMER_MODULES.map((mod, idx) => {
            const status = getModuleStatus(progressMap.get(`${NEWCOMER_DB_PREFIX}${mod.key}`));
            const statusInfo = statusConfig[status];
            const Icon = mod.icon;
            const isNext = mod.key === nextModule?.key && !resumeModule;

            return (
              <Card
                key={mod.id}
                className={cn(
                  "w-full transition-all active:scale-[0.98] touch-manipulation hover:shadow-md cursor-pointer",
                  isNext && "ring-1 ring-primary/30 shadow-md"
                )}
                onClick={() => navigate(`/app/client-portal/coach-newcomer/${mod.key}`)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      status === 'completed' ? "bg-green-100 dark:bg-green-900/30" : "bg-primary/10"
                    )}>
                      {status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <span className="text-xs font-bold text-primary">{idx + 1}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Icon className={cn("h-3.5 w-3.5 shrink-0", status === 'completed' ? "text-green-600" : "text-primary")} />
                        <h3 className="font-semibold text-sm text-foreground truncate">{mod.title}</h3>
                        {isNext && (
                          <Badge variant="default" className="text-[9px] px-1.5 py-0">Empfohlen</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{mod.desc}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Badge variant={statusInfo.variant} className="text-[10px] gap-1">
                          {status === 'completed' && <CheckCircle className="h-2.5 w-2.5" />}
                          {statusInfo.label}
                        </Badge>
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
      </div>
    </ClientPortalLayout>
  );
}
