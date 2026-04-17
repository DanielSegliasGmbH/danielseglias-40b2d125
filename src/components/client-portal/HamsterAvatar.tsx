import { motion } from 'framer-motion';
import { useHamster } from '@/hooks/useHamster';
import { cn } from '@/lib/utils';

interface HamsterAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showRank?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { wrap: 'w-10 h-10', emoji: 'text-xl', label: 'text-[10px] mt-1' },
  md: { wrap: 'w-16 h-16', emoji: 'text-3xl', label: 'text-xs mt-1.5' },
  lg: { wrap: 'w-28 h-28', emoji: 'text-5xl', label: 'text-sm mt-2 font-semibold' },
} as const;

// Per-rank background using semantic tokens (HSL via Tailwind/design system).
// Rank 1: muted (still in the wheel) → Rank 6: radiant gold gradient.
function rankBackgroundClasses(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-muted ring-1 ring-border';
    case 2:
      return 'bg-warning/15 ring-1 ring-warning/40';
    case 3:
      return 'bg-success/15 ring-1 ring-success/40';
    case 4:
      return 'bg-primary/15 ring-1 ring-primary/40';
    case 5:
      return 'bg-gradient-to-br from-primary/25 to-warning/25 ring-1 ring-primary/50';
    case 6:
      return 'bg-gradient-to-br from-warning/40 via-primary/30 to-warning/40 ring-2 ring-warning/60 shadow-lg shadow-warning/20';
    default:
      return 'bg-muted ring-1 ring-border';
  }
}

export function HamsterAvatar({ size = 'md', showRank = false, className }: HamsterAvatarProps) {
  const { rank, rankName, rankEmoji, loading } = useHamster();
  const s = SIZE_MAP[size];

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <motion.div
        className={cn(
          'rounded-full flex items-center justify-center select-none',
          s.wrap,
          rankBackgroundClasses(rank),
          loading && 'opacity-60'
        )}
        animate={{ y: [0, -3, 0] }}
        transition={{
          duration: 1.2,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 1.8,
        }}
        aria-label={`${rankName} (Rang ${rank})`}
      >
        <span className={s.emoji} role="img" aria-hidden>
          {rankEmoji}
        </span>
      </motion.div>
      {showRank && (
        <span className={cn('text-muted-foreground text-center leading-tight', s.label)}>
          {rankName}
        </span>
      )}
    </div>
  );
}
