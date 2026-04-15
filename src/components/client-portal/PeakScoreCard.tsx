import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { usePeakScore, getPeakScoreRank, getPeakScoreGradient, getPeakScoreBorderColor } from '@/hooks/usePeakScore';

interface PeakScoreCardProps {
  onClick: () => void;
}

export function PeakScoreCard({ onClick }: PeakScoreCardProps) {
  const { score, trend, loading, hasData } = usePeakScore();

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
          {/* Shield icon */}
          <div className="mb-1">
            <Shield className="h-5 w-5 text-muted-foreground/60" />
          </div>

          {displayScore ? (
            <>
              {/* Score number */}
              <motion.span
                className="text-[48px] leading-none font-extrabold tracking-tight text-foreground"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5, type: 'spring' }}
              >
                {score.toFixed(1)}
              </motion.span>

              {/* Unit */}
              <span className="text-xs text-muted-foreground mt-1">Monate</span>

              {/* Rank */}
              <span className="text-sm font-semibold text-foreground/80 mt-1">
                {getPeakScoreRank(score)}
              </span>

              {/* Trend */}
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

          {/* Subtle label */}
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mt-3">
            PeakScore
          </span>
        </CardContent>
      </Card>
    </motion.div>
  );
}
