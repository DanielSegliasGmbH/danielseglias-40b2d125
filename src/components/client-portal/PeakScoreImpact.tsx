import { Shield, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { formatExpenseImpact, formatAssetImpact, formatPeakScoreImpact } from '@/lib/peakScoreFormat';

interface PeakScoreImpactProps {
  impact: number | null; // positive = good, negative = bad
  show: boolean;
  className?: string;
  /** Context determines the sentence framing */
  context?: 'expense' | 'asset' | 'generic';
}

/**
 * Inline badge showing PeakScore impact after an action — in human-readable freedom terms.
 */
export function PeakScoreImpact({ impact, show, className, context = 'generic' }: PeakScoreImpactProps) {
  if (impact === null || impact === 0) return null;

  const positive = impact > 0;

  const getMessage = () => {
    switch (context) {
      case 'expense':
        return formatExpenseImpact(impact);
      case 'asset':
        return formatAssetImpact(impact);
      default:
        return formatPeakScoreImpact(impact);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg',
            positive
              ? 'text-primary bg-primary/10'
              : 'text-destructive bg-destructive/10',
            className
          )}
        >
          <Shield className="h-3.5 w-3.5 shrink-0" />
          {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          <span>{getMessage()}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
