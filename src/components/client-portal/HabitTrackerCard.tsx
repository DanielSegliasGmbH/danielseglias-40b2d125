import { useHabitTracker } from '@/hooks/useHabitTracker';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { CheckCircle2, Flame, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HabitTrackerCard() {
  const navigate = useNavigate();
  const { habits, weekDates, isChecked, weekStats, streaks, toggleHabit, isLoading } = useHabitTracker();

  const today = new Date().toISOString().slice(0, 10);
  const todayIndex = weekDates.indexOf(today);

  if (isLoading) {
    return <Skeleton className="h-32 w-full rounded-xl" />;
  }

  if (habits.length === 0) return null;

  // Show today's habits
  const todayHabits = habits.filter(h => {
    const dow = new Date(today).getDay();
    if (h.frequency === 'weekdays' && (dow === 0 || dow === 6)) return false;
    if (h.frequency === 'weekly' && dow !== 1) return false;
    return true;
  });

  const todayChecked = todayHabits.filter(h => isChecked(h.id, today)).length;
  const todayTotal = todayHabits.length;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
      <Card
        className="cursor-pointer active:scale-[0.99] transition-transform"
        onClick={() => navigate('/app/client-portal/habits')}
      >
        <CardContent className="p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">✅</span>
              <h3 className="text-sm font-bold text-foreground">Gewohnheiten</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                todayChecked === todayTotal && todayTotal > 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              )}>
                {todayChecked}/{todayTotal} heute
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Today's habits quick view */}
          <div className="space-y-1">
            {todayHabits.slice(0, 4).map(h => {
              const checked = isChecked(h.id, today);
              const streak = streaks[h.id] || 0;
              return (
                <div
                  key={h.id}
                  className="flex items-center gap-2"
                  onClick={e => {
                    e.stopPropagation();
                    if (!checked) toggleHabit.mutate({ habitId: h.id, date: today });
                  }}
                >
                  {checked
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    : <span className="w-3.5 h-3.5 rounded border border-muted-foreground/30 shrink-0" />
                  }
                  <span className={cn(
                    "text-xs truncate flex-1",
                    checked ? "text-muted-foreground line-through" : "text-foreground"
                  )}>
                    {h.emoji} {h.name}
                  </span>
                  {streak > 0 && (
                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                      <Flame className="h-2.5 w-2.5 text-amber-500" />{streak}
                    </span>
                  )}
                </div>
              );
            })}
            {todayHabits.length > 4 && (
              <p className="text-[10px] text-muted-foreground">+{todayHabits.length - 4} weitere</p>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={false}
              animate={{ width: todayTotal > 0 ? `${(todayChecked / todayTotal) * 100}%` : '0%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
