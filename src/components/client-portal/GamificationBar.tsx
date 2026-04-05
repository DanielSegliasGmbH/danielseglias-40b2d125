import { useGamification } from '@/hooks/useGamification';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Trophy, Star, Zap, Award, Crown, Flame, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LEVEL_ICONS = [null, Zap, Star, Trophy, Award, Crown];

export function GamificationBar() {
  const { points, streakDays, level, progressPercent, pointsToNext, maxLevel, lastAwardedPoints, loading } = useGamification();
  const { isPremium, isLoading: subLoading } = useSubscription();
  const navigate = useNavigate();

  if (loading) return null;

  const Icon = LEVEL_ICONS[level] || Zap;

  return (
    <div className="relative flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-2xl overflow-hidden">
      {/* Animated points popup */}
      <AnimatePresence>
        {lastAwardedPoints !== null && (
          <motion.div
            key={lastAwardedPoints + '-' + Date.now()}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -28 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          >
            <span className="text-sm font-bold text-primary">
              +{lastAwardedPoints}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level icon */}
      <motion.div
        className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
        whileTap={{ scale: 0.9 }}
      >
        <Icon className="h-4 w-4 text-primary" />
      </motion.div>

      {/* Progress bar + labels */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-semibold text-foreground">
            Lv.{level} · {points} Pkt
          </span>
          {!maxLevel && (
            <span className="text-[10px] text-muted-foreground">
              noch {pointsToNext}
            </span>
          )}
        </div>
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={false}
            animate={{ width: `${maxLevel ? 100 : progressPercent}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Streak pill */}
      {streakDays > 0 && (
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full shrink-0",
          streakDays >= 7 ? "bg-orange-500/10" : streakDays >= 3 ? "bg-amber-500/10" : "bg-muted"
        )}>
          <Flame className={cn(
            "h-3.5 w-3.5",
            streakDays >= 7 ? "text-orange-500" : streakDays >= 3 ? "text-amber-500" : "text-muted-foreground"
          )} />
          <span className={cn(
            "text-[11px] font-semibold",
            streakDays >= 7 ? "text-orange-600" : streakDays >= 3 ? "text-amber-600" : "text-muted-foreground"
          )}>
            {streakDays}
          </span>
        </div>
      )}

      {/* Premium badge */}
      {!subLoading && (
        <button
          onClick={() => navigate('/app/client-portal/premium')}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-full shrink-0 transition-colors text-[11px] font-medium",
            isPremium
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className="h-3 w-3" />
          {isPremium ? 'PRO' : 'Upgrade'}
        </button>
      )}
    </div>
  );
}
