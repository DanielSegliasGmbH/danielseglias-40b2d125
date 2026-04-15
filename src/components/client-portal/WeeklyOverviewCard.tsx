import { useWeeklyChallenges } from '@/hooks/useWeeklyChallenges';
import { useHabitTracker } from '@/hooks/useHabitTracker';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock, Flame, Sparkles, Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_EMOJI: Record<string, string> = {
  budget: '💰',
  knowledge: '📚',
  tracking: '📊',
  social: '👥',
  savings: '🐷',
};

export function WeeklyOverviewCard() {
  const navigate = useNavigate();
  const {
    challenges,
    completedCount,
    allDone,
    bonusClaimed,
    daysRemaining,
    isLoading: loadingQuests,
    completeChallenge,
  } = useWeeklyChallenges();

  const {
    habits,
    isChecked,
    streaks,
    toggleHabit,
    isLoading: loadingHabits,
  } = useHabitTracker();

  const today = new Date().toISOString().slice(0, 10);

  const todayHabits = habits.filter(h => {
    const dow = new Date(today).getDay();
    if (h.frequency === 'weekdays' && (dow === 0 || dow === 6)) return false;
    if (h.frequency === 'weekly' && dow !== 1) return false;
    return true;
  });
  const todayChecked = todayHabits.filter(h => isChecked(h.id, today)).length;

  if (loadingQuests || loadingHabits) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
    >
      <Card className={cn(
        "overflow-hidden",
        allDone && todayChecked === todayHabits.length && todayHabits.length > 0
          ? "border-emerald-500/30"
          : ""
      )}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              🎮 Deine Woche
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Noch {daysRemaining} {daysRemaining === 1 ? 'Tag' : 'Tage'}
            </div>
          </div>

          {/* Weekly Quests */}
          {challenges.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Swords className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Quests</span>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {completedCount}/{challenges.length}
                </span>
              </div>
              {challenges.map(challenge => (
                <div
                  key={challenge.id}
                  className={cn(
                    "flex items-center gap-2.5 py-1.5 px-2 rounded-lg transition-colors",
                    challenge.completed ? "bg-emerald-500/5" : "hover:bg-muted/30"
                  )}
                >
                  <Checkbox
                    checked={challenge.completed}
                    disabled={challenge.completed || completeChallenge.isPending}
                    onCheckedChange={() => completeChallenge.mutate(challenge.id)}
                    className="shrink-0"
                  />
                  <span className={cn(
                    "text-xs flex-1 min-w-0 truncate",
                    challenge.completed ? "text-muted-foreground line-through" : "text-foreground"
                  )}>
                    {CATEGORY_EMOJI[challenge.category] || '⚡'} {challenge.title}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                    challenge.completed
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-primary/10 text-primary"
                  )}>
                    +{challenge.xp}
                  </span>
                </div>
              ))}
              {/* Bonus */}
              <div className="flex items-center justify-between px-2 py-1 text-[10px]">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  {allDone && bonusClaimed ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Bonus erhalten!</span>
                  ) : (
                    'Bonus bei Vollständigkeit'
                  )}
                </span>
                <span className={cn(
                  "font-bold",
                  allDone ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                )}>+50 XP</span>
              </div>
            </div>
          )}

          {/* Divider */}
          {challenges.length > 0 && todayHabits.length > 0 && (
            <div className="border-t border-border/40" />
          )}

          {/* Today's habits summary */}
          {todayHabits.length > 0 && (
            <div
              className="flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
              onClick={() => navigate('/app/client-portal/habits')}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">✅</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {todayChecked}/{todayHabits.length} Gewohnheiten ✓
                  </p>
                  {todayHabits.some(h => (streaks[h.id] || 0) >= 3) && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Flame className="h-2.5 w-2.5 text-amber-500" />
                      Längster Streak: {Math.max(...todayHabits.map(h => streaks[h.id] || 0))} Tage
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {todayChecked === todayHabits.length && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          )}

          {/* Progress bar */}
          {(challenges.length > 0 || todayHabits.length > 0) && (
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={false}
                animate={{
                  width: `${challenges.length > 0
                    ? (completedCount / challenges.length) * 100
                    : todayHabits.length > 0
                      ? (todayChecked / todayHabits.length) * 100
                      : 0
                  }%`
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
