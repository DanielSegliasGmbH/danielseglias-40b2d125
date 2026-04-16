import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { usePeakScore, getPeakScoreGradient, getPeakScoreBorderColor, RANKS } from '@/hooks/usePeakScore';
import { useUserAvatar } from '@/hooks/useUserAvatar';

interface PeakScoreCardProps {
  onClick: () => void;
}

function formatScoreHuman(score: number): { months: number; days: number; text: string } {
  const months = Math.floor(score);
  const days = Math.round((score - months) * 30);
  if (months >= 12) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const text = remainingMonths > 0 ? `${years} Jahr${years > 1 ? 'e' : ''}, ${remainingMonths} Mt.` : `${years} Jahr${years > 1 ? 'e' : ''}`;
    return { months, days, text };
  }
  const text = days > 0 ? `${months} Monate, ${days} Tage` : `${months} Monate`;
  return { months, days, text };
}

export function PeakScoreCard({ onClick }: PeakScoreCardProps) {
  const { score, trend, loading, hasData, rank } = usePeakScore();
  const { completed: hasAvatar, futureSelfName, avatar } = useUserAvatar();
  const targetScore = RANKS[5].minScore; // Souverän = 120

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6 h-[140px]" />
      </Card>
    );
  }

  const displayScore = score !== null;
  const gradient = displayScore ? getPeakScoreGradient(score) : '';
  const borderColor = displayScore ? getPeakScoreBorderColor(score) : 'border-border';
  const human = displayScore ? formatScoreHuman(score) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.05, duration: 0.4, ease: 'easeOut' }}
    >
      <Card
        className={cn(
          'cursor-pointer active:scale-[0.98] transition-all duration-200 hover:shadow-lg',
          'rounded-2xl border overflow-hidden',
          borderColor,
          displayScore ? `bg-gradient-to-br ${gradient}` : 'bg-muted/30'
        )}
        onClick={onClick}
      >
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="mb-1">
            <Shield className="h-5 w-5 text-muted-foreground/60" />
          </div>

          {displayScore && human ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <motion.span
                  className="text-[48px] leading-none font-extrabold tracking-tight text-foreground"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.5, type: 'spring' }}
                >
                  {human.months}
                </motion.span>
                <span className="text-sm text-muted-foreground font-medium">{human.text.includes('Jahr') ? human.text : human.days > 0 ? `Mt., ${human.days}d` : 'Mt.'}</span>
              </div>

              <p className="text-[11px] text-muted-foreground mt-2 max-w-[220px] leading-relaxed">
                So lange könntest du leben, ohne zu arbeiten.
              </p>

              {/* Rank */}
              <span className="text-sm font-semibold text-foreground/80 mt-1.5">
                {rank.emoji} {rank.name}
              </span>

              {/* Future self progress */}
              {hasAvatar && futureSelfName && displayScore && (
                <div className="w-full mt-3 space-y-1.5">
                  <p className="text-[11px] text-muted-foreground text-center">
                    {futureSelfName} ist auf {targetScore}. Du bist auf {score}.
                  </p>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (score / targetScore) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {trend !== null && trend !== 0 && (
                <div className={cn(
                  'flex items-center gap-1 mt-2 text-xs font-medium',
                  trend > 0 ? 'text-emerald-600' : 'text-red-500'
                )}>
                  {trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  <span>
                    {trend > 0 ? '+' : ''}{trend} seit letztem Monat
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <span className="text-[48px] leading-none font-extrabold tracking-tight text-muted-foreground/40">
                –
              </span>
              <span className="text-xs text-muted-foreground mt-2">
                {!hasData ? 'Erfasse deine Finanzdaten' : 'Fixkosten fehlen'}
              </span>
            </>
          )}

          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mt-3">
            PeakScore
          </span>
        </CardContent>
      </Card>
    </motion.div>
  );
}
