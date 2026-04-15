import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { usePeakScore } from '@/hooks/usePeakScore';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPeakScoreDuration } from '@/lib/peakScoreFormat';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const CELEBRATION_KEY = 'freedom_celebrated';

function getProgressColor(pct: number): string {
  if (pct >= 75) return 'bg-amber-500';
  if (pct >= 50) return 'bg-primary';
  if (pct >= 25) return 'bg-orange-500';
  return 'bg-destructive';
}

function getProgressTrack(pct: number): string {
  if (pct >= 75) return '[&>div]:bg-amber-500';
  if (pct >= 50) return '[&>div]:bg-primary';
  if (pct >= 25) return '[&>div]:bg-orange-500';
  return '[&>div]:bg-destructive';
}

export function FreedomCountdown() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { score, trend } = usePeakScore();
  const [showCelebration, setShowCelebration] = useState(false);

  const { data: metaProfile } = useQuery({
    queryKey: ['freedom-goal', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('meta_profiles')
        .select('freedom_target_age, freedom_life_expectancy')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const hasGoal = !!metaProfile?.freedom_target_age;
  const targetAge = metaProfile?.freedom_target_age ?? 55;
  const lifeExpectancy = metaProfile?.freedom_life_expectancy ?? 85;
  const requiredScore = Math.max(1, (lifeExpectancy - targetAge) * 12);

  const progressPct = score !== null ? Math.min(100, Math.round((score / requiredScore) * 100)) : 0;
  const remaining = score !== null ? Math.max(0, requiredScore - score) : requiredScore;
  const reached = score !== null && score >= requiredScore;

  // Projection: years to target based on monthly trend
  const monthlyGrowth = trend !== null && trend > 0 ? trend : null;
  const yearsToTarget = monthlyGrowth && remaining > 0
    ? Math.round(remaining / (monthlyGrowth * 12) * 10) / 10
    : null;

  // Celebration logic
  useEffect(() => {
    if (reached && hasGoal) {
      const celebrated = localStorage.getItem(CELEBRATION_KEY);
      if (!celebrated) {
        setShowCelebration(true);
        localStorage.setItem(CELEBRATION_KEY, 'true');
      }
    }
  }, [reached, hasGoal]);

  // No goal set → teaser
  if (!hasGoal) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card
          className="cursor-pointer active:scale-[0.99] transition-transform border-border/50"
          onClick={() => navigate('/app/client-portal/peak-score')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-xl">🔥</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                Wann willst du finanziell frei sein?
              </p>
              <p className="text-xs text-muted-foreground">Setze dein Ziel →</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-background/95 flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              className="text-center space-y-6 max-w-sm"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 120, delay: 0.2 }}
            >
              <motion.span
                className="text-8xl block"
                animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                🎉
              </motion.span>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                DU HAST ES GESCHAFFT!
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Du bist finanziell frei! Dein PeakScore von{' '}
                <span className="font-bold text-primary">{score?.toFixed(1)}</span>{' '}
                bedeutet, dass du{' '}
                <span className="font-bold text-primary">{formatPeakScoreDuration(score ?? 0)}</span>{' '}
                ohne Einkommen leben kannst.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30">
                <span className="text-lg">🏅</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  Finanziell Frei
                </span>
              </div>
              <p className="text-xs text-muted-foreground pt-4">Tippe zum Schliessen</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Countdown card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card
          className={cn(
            'cursor-pointer active:scale-[0.99] transition-transform overflow-hidden',
            reached ? 'border-amber-500/40 bg-amber-500/5' : 'border-border/50'
          )}
          onClick={() => navigate('/app/client-portal/peak-score')}
        >
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{reached ? '🏅' : '🔥'}</span>
                <span className="text-sm font-semibold text-foreground">
                  {reached
                    ? 'Finanziell Frei!'
                    : `Ziel: Finanziell frei mit ${targetAge}`}
                </span>
              </div>
              {reached && (
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Erreicht ✓
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <Progress
                value={progressPct}
                className={cn('h-2.5 rounded-full', getProgressTrack(progressPct))}
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {score?.toFixed(0) ?? 0} / {requiredScore} Punkte
                </span>
                <span className={cn(
                  'font-semibold',
                  progressPct >= 75 ? 'text-amber-600 dark:text-amber-400'
                    : progressPct >= 50 ? 'text-primary'
                    : progressPct >= 25 ? 'text-orange-500'
                    : 'text-destructive'
                )}>
                  {progressPct}% erreicht
                </span>
              </div>
            </div>

            {!reached && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Noch {remaining.toFixed(0)} Punkte</span>
                {yearsToTarget && (
                  <span>Bei aktuellem Tempo: ~{yearsToTarget} Jahre</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
