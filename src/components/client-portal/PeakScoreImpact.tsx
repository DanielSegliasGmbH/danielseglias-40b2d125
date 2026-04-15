import { Shield, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PeakScoreImpactProps {
  impact: number | null; // positive = good, negative = bad
  show: boolean;
  className?: string;
}

/**
 * Small inline badge showing PeakScore impact after an action.
 * Usage: <PeakScoreImpact impact={-0.3} show={showAfterSave} />
 */
export function PeakScoreImpact({ impact, show, className }: PeakScoreImpactProps) {
  if (impact === null || impact === 0) return null;

  const positive = impact > 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium',
            positive ? 'text-emerald-600' : 'text-red-500',
            className
          )}
        >
          <Shield className="h-3 w-3" />
          <span>PeakScore Auswirkung:</span>
          {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          <span className="font-bold">{positive ? '+' : ''}{impact.toFixed(1)}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
