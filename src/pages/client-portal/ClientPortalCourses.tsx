import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lock, ChevronRight, Construction, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useCourseModules,
  useModuleAccess,
  useMyCustomerId,
  useAllCourseLessons,
} from '@/hooks/useCourseData';

export default function ClientPortalCourses() {
  const { t } = useTranslation();
  const { data: modules, isLoading: modulesLoading } = useCourseModules();
  const { data: customerId } = useMyCustomerId();
  const { data: moduleAccess } = useModuleAccess(customerId || undefined);
  const { data: allLessons } = useAllCourseLessons();

  const isModuleUnlocked = (moduleId: string) => {
    if (!moduleAccess) return false;
    const access = moduleAccess.find(a => a.module_id === moduleId);
    return access?.is_unlocked ?? false;
  };

  const getLessonCount = (moduleId: string) => {
    if (!allLessons) return 0;
    return allLessons.filter(l => l.module_id === moduleId).length;
  };

  return (
    <ClientPortalLayout>
      <ScreenHeader title="🎓 Videokurs" backTo="/app/client-portal" />
      <div className="max-w-5xl mx-auto space-y-6">

        {/* MVP Hinweis */}
        <Card className="border-primary/20 bg-[hsl(var(--accent))]/30">
          <CardContent className="p-5 lg:p-6">
            <div className="flex items-start gap-3">
              <Construction className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">
                  Dieser Kurs befindet sich aktuell im Aufbau
                </h3>
                <p className="text-sm text-muted-foreground">
                  Du kannst alle freigeschalteten Inhalte bereits nutzen und aktiv mitgestalten.
                  Dein Feedback hilft, diesen Bereich laufend zu verbessern.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules Grid */}
        {modulesLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 h-32" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {modules?.map((mod, idx) => {
              const unlocked = isModuleUnlocked(mod.id);
              const lessonCount = getLessonCount(mod.id);

              return (
                <Link
                  key={mod.id}
                  to={unlocked ? `/app/client-portal/courses/${mod.id}` : '#'}
                  className={cn(!unlocked && 'cursor-default')}
                  onClick={e => !unlocked && e.preventDefault()}
                >
                  <Card className={cn(
                    "h-full transition-all group",
                    unlocked
                      ? "hover:shadow-md cursor-pointer"
                      : "opacity-60"
                  )}>
                    <CardContent className="p-5 lg:p-6 flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl relative"
                        style={{ backgroundColor: `${mod.color}15` }}
                      >
                        <span>{mod.icon_emoji}</span>
                        {!unlocked && (
                          <Lock className="h-4 w-4 text-muted-foreground absolute -bottom-1 -right-1 bg-background rounded-full p-0.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Modul {idx + 1}
                            </p>
                            <h3 className="font-semibold text-foreground leading-tight">
                              {mod.title}
                            </h3>
                          </div>
                          {unlocked && (
                            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                          )}
                        </div>
                        {mod.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {mod.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {lessonCount} {lessonCount === 1 ? 'Lektion' : 'Lektionen'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {modules?.length === 0 && !modulesLoading && (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <GraduationCap className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Noch keine Module vorhanden</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Dein Berater wird hier bald Inhalte für dich freischalten.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ClientPortalLayout>
  );
}
