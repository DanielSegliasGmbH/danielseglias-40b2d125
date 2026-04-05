import { useGamification, getLevel } from '@/hooks/useGamification';
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

  // Next streak bonus info
  const daysToNext3 = streakDays > 0 ? 3 - (streakDays % 3) : 3;
  const daysToNext7 = streakDays > 0 ? 7 - (streakDays % 7) : 7;
  const nextBonusDays = daysToNext7 <= daysToNext3 ? daysToNext7 : daysToNext3;
  const nextBonusIsWeekly = daysToNext7 <= daysToNext3;

  return (
    <div className="space-y-2">
      {/* Premium badge */}
      {!subLoading && (
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl border cursor-pointer transition-colors",
            isPremium
              ? "bg-primary/5 border-primary/20"
              : "bg-card border-border hover:border-primary/30"
          )}
          onClick={() => navigate('/app/client-portal/premium')}
        >
          <Sparkles className={cn("h-4 w-4", isPremium ? "text-primary" : "text-muted-foreground")} />
          <span className={cn("text-xs font-medium", isPremium ? "text-primary" : "text-muted-foreground")}>
            {isPremium ? 'Premium aktiv' : 'Upgrade verfügbar'}
          </span>
          {isPremium && (
            <Badge variant="secondary" className="ml-auto text-[9px] bg-primary/10 text-primary border-0 px-1.5 py-0">
              PRO
            </Badge>
          )}
        </div>
      )}
      {/* Main bar: Level + Points */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>

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

      {/* Streak bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-2xl">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          streakDays >= 7 ? "bg-orange-500/15" : streakDays >= 3 ? "bg-amber-500/15" : "bg-muted"
        )}>
          <Flame className={cn(
            "h-4 w-4",
            streakDays >= 7 ? "text-orange-500" : streakDays >= 3 ? "text-amber-500" : "text-muted-foreground"
          )} />
        </div>

        <div className="flex-1 min-w-0 flex items-center justify-between">
          <div>
            <span className={cn(
              "text-sm font-semibold",
              streakDays >= 3 ? "text-foreground" : "text-muted-foreground"
            )}>
              {streakDays > 0 ? `${streakDays} ${streakDays === 1 ? 'Tag' : 'Tage'}` : 'Kein Streak'}
            </span>
            {streakDays > 0 && (
              <span className="text-xs text-muted-foreground ml-1.5">Streak</span>
            )}
          </div>

          {streakDays > 0 && nextBonusDays > 0 && nextBonusDays <= 3 && (
            <span className="text-[10px] text-muted-foreground">
              {nextBonusDays === 1
                ? `Morgen +${nextBonusIsWeekly ? '25' : '10'} Bonus`
                : `Noch ${nextBonusDays} Tage bis Bonus`
              }
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
