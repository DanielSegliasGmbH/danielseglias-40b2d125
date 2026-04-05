import { useGamification, getLevel } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';
import { Trophy, Star, Zap, Award, Crown } from 'lucide-react';

const LEVEL_ICONS = [null, Zap, Star, Trophy, Award, Crown];

export function GamificationBar() {
  const { points, level, levelLabel, progressPercent, pointsToNext, maxLevel, loading } = useGamification();

  if (loading) return null;

  const Icon = LEVEL_ICONS[level] || Zap;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl">
      {/* Level icon */}
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-foreground">
            Level {level} <span className="font-normal text-muted-foreground">• {points} Punkte</span>
          </span>
          {!maxLevel && (
            <span className="text-xs text-muted-foreground">
              noch {pointsToNext}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
            style={{ width: `${maxLevel ? 100 : progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[10px] text-muted-foreground">{levelLabel}</span>
          {!maxLevel && (
            <span className="text-[10px] text-muted-foreground">
              Level {level + 1}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
