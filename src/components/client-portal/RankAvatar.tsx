import { cn } from '@/lib/utils';
import { User, Shield, Sword, Crown, Star, Gem } from 'lucide-react';

/**
 * Visual avatar that evolves per PeakScore rank.
 * `variant` controls current vs future styling.
 */
interface RankAvatarProps {
  rank: number;        // 1–6
  size?: 'sm' | 'md' | 'lg';
  variant?: 'current' | 'future';
  className?: string;
}

const RANK_ICONS: Record<number, React.ElementType> = {
  1: User,
  2: Shield,
  3: Sword,
  4: Gem,
  5: Crown,
  6: Star,
};

const RANK_STYLES: Record<number, { border: string; bg: string; icon: string }> = {
  1: { border: 'border-muted-foreground/30', bg: 'bg-muted', icon: 'text-muted-foreground' },
  2: { border: 'border-primary/40', bg: 'bg-primary/10', icon: 'text-primary' },
  3: { border: 'border-primary/60', bg: 'bg-primary/15', icon: 'text-primary' },
  4: { border: 'border-accent-foreground/40', bg: 'bg-accent/30', icon: 'text-accent-foreground' },
  5: { border: 'border-primary/80', bg: 'bg-primary/20', icon: 'text-primary' },
  6: { border: 'border-primary', bg: 'bg-primary/25', icon: 'text-primary' },
};

const SIZE_MAP = {
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4', border: 'border-2' },
  md: { container: 'w-12 h-12', icon: 'w-6 h-6', border: 'border-2' },
  lg: { container: 'w-20 h-20', icon: 'w-10 h-10', border: 'border-[3px]' },
};

export function RankAvatar({ rank, size = 'md', variant = 'current', className }: RankAvatarProps) {
  const Icon = RANK_ICONS[rank] || User;
  const style = RANK_STYLES[rank] || RANK_STYLES[1];
  const sizeStyle = SIZE_MAP[size];
  const isFuture = variant === 'future';

  return (
    <div className={cn('relative', className)}>
      {/* Glow for future variant */}
      {isFuture && (
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md scale-125" />
      )}
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center',
          sizeStyle.container,
          sizeStyle.border,
          isFuture ? 'border-primary bg-primary/15' : style.border,
          isFuture ? 'bg-primary/15' : style.bg,
        )}
      >
        <Icon className={cn(sizeStyle.icon, isFuture ? 'text-primary' : style.icon)} />
      </div>
    </div>
  );
}
