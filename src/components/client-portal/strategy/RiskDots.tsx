import { cn } from '@/lib/utils';

const DOT_COLORS: Record<number, string> = {
  1: 'bg-green-500',
  2: 'bg-green-400',
  3: 'bg-yellow-400',
  4: 'bg-orange-400',
  5: 'bg-red-500',
};

interface Props {
  level: number; // 1-5
  className?: string;
}

export function RiskDots({ level, className }: Props) {
  const label = level <= 2 ? 'Tief' : level <= 3 ? 'Mittel' : level <= 4 ? 'Erhöht' : 'Hoch';

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              i < level ? DOT_COLORS[level] : 'bg-muted',
            )}
          />
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
