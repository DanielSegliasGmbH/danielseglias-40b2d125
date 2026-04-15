import { useWeeklyChallenges } from '@/hooks/useWeeklyChallenges';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Swords, Clock, Sparkles } from 'lucide-react';

const CATEGORY_EMOJI: Record<string, string> = {
  budget: '💰',
  knowledge: '📚',
  tracking: '📊',
  social: '👥',
  savings: '🐷',
};

export function WeeklyQuestsCard() {
  const {
    challenges,
    completedCount,
    allDone,
    bonusClaimed,
    daysRemaining,
    isLoading,
    completeChallenge,
  } = useWeeklyChallenges();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
    >
      <Card className={cn(
        "overflow-hidden transition-colors",
        allDone && "border-emerald-500/30 bg-emerald-500/5"
      )}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Wöchentliche Quests</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Noch {daysRemaining} {daysRemaining === 1 ? 'Tag' : 'Tage'}</span>
            </div>
          </div>

          {/* Challenges */}
          <div className="space-y-2">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={cn(
                  "flex items-start gap-3 p-2.5 rounded-xl transition-colors",
                  challenge.completed
                    ? "bg-emerald-500/5"
                    : "bg-muted/30 hover:bg-muted/50"
                )}
              >
                <Checkbox
                  checked={challenge.completed}
                  disabled={challenge.completed || completeChallenge.isPending}
                  onCheckedChange={() => completeChallenge.mutate(challenge.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm leading-snug",
                    challenge.completed
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  )}>
                    <span className="mr-1.5">{CATEGORY_EMOJI[challenge.category] || '⚡'}</span>
                    {challenge.title}
                  </p>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                  challenge.completed
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-primary/10 text-primary"
                )}>
                  +{challenge.xp} XP
                </span>
              </div>
            ))}
          </div>

          {/* Bonus row */}
          <div className={cn(
            "flex items-center justify-between px-2.5 py-2 rounded-xl text-xs",
            allDone && bonusClaimed
              ? "bg-emerald-500/10"
              : "bg-muted/20"
          )}>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className={cn(
                "font-medium",
                allDone ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
              )}>
                {allDone ? 'Bonus erhalten!' : 'Bonus: Alle 3 erledigt'}
              </span>
            </span>
            <span className={cn(
              "font-bold px-1.5 py-0.5 rounded-full",
              allDone
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            )}>
              +50 XP
            </span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={false}
                animate={{ width: `${(completedCount / challenges.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              {completedCount}/{challenges.length}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
