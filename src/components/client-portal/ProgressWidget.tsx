import { useGamification, LEVELS, getLevel } from '@/hooks/useGamification';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Star, Trophy, Award, Crown, Flame, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const LEVEL_ICONS = [null, Zap, Star, Trophy, Award, Crown];

export function ProgressWidget() {
  const { user } = useAuth();
  const {
    points, streakDays, level, levelLabel,
    progressPercent, pointsToNext, nextLevelMin, maxLevel, loading,
  } = useGamification();

  // Count completed tasks this month
  const { data: monthlyTasks = 0 } = useQuery({
    queryKey: ['monthly-completed-tasks', user?.id],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count, error } = await supabase
        .from('client_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('is_completed', true)
        .gte('completed_at', startOfMonth);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  if (loading) return null;

  const Icon = LEVEL_ICONS[level] || Zap;
  const currentLevelInfo = LEVELS.find(l => l.level === level)!;
  const currentLevelMin = currentLevelInfo.min;
  const xpInLevel = points - currentLevelMin;
  const xpForLevel = nextLevelMin ? nextLevelMin - currentLevelMin : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Dein Fortschritt</h3>
            <div className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full",
              streakDays >= 7 ? "bg-orange-500/10" : streakDays >= 3 ? "bg-amber-500/10" : "bg-muted"
            )}>
              <Flame className={cn(
                "h-4 w-4",
                streakDays >= 7 ? "text-orange-500" : streakDays >= 3 ? "text-amber-500" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-sm font-bold",
                streakDays >= 7 ? "text-orange-600" : streakDays >= 3 ? "text-amber-600" : "text-foreground"
              )}>
                {streakDays} {streakDays === 1 ? 'Tag' : 'Tage'}
              </span>
            </div>
          </div>

          {/* Level display */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-foreground">Level {level}</span>
                <span className="text-sm text-muted-foreground">· {levelLabel}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {maxLevel
                  ? `${points} XP – Maximum erreicht!`
                  : `${points} / ${nextLevelMin} XP`
                }
              </p>
            </div>
          </div>

          {/* XP Progress bar */}
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                initial={false}
                animate={{ width: `${maxLevel ? 100 : progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            {!maxLevel && (
              <p className="text-[11px] text-muted-foreground text-right">
                noch {pointsToNext} XP bis Level {level + 1}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span>
                <span className="font-semibold text-foreground">{monthlyTasks}</span> Aufgaben diesen Monat
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
