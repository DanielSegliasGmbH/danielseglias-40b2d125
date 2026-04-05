import { useGamification } from '@/hooks/useGamification';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Trophy, Star, Zap, Award, Crown, Flame, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const LEVEL_ICONS = [null, Zap, Star, Trophy, Award, Crown];

export function GamificationBar() {
  const { points, streakDays, level, levelLabel, progressPercent, pointsToNext, maxLevel, loading } = useGamification();
  const { isPremium, isLoading: subLoading } = useSubscription();
  const navigate = useNavigate();

  if (loading) return null;

  const Icon = LEVEL_ICONS[level] || Zap;

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-2xl">
      {/* Level icon + points */}
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4.5 w-4.5 text-primary" />
      </div>

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
          <div
            className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
            style={{ width: `${maxLevel ? 100 : progressPercent}%` }}
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
