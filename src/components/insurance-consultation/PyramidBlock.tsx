import { PyramidItem } from '@/config/insurancePyramidConfig';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface PyramidBlockProps {
  item: PyramidItem;
  isSelected: boolean;
  onSelect: (item: PyramidItem) => void;
  fullWidth?: boolean;
}

export function PyramidBlock({ item, isSelected, onSelect, fullWidth = false }: PyramidBlockProps) {
  // Dynamically get icon component
  const IconComponent = (Icons[item.icon as keyof typeof Icons] as LucideIcon) || Icons.Circle;

  const hasBadge = item.isImportant || item.status.prioritized || item.status.discussed;

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item);
        }
      }}
      className={cn(
        'relative cursor-pointer transition-all duration-200',
        'hover:shadow-lg hover:scale-[1.02] hover:border-primary/50',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'p-4 flex flex-col items-center gap-2 text-center min-h-[120px]',
        fullWidth ? 'w-full' : 'min-w-[140px] max-w-[180px]',
        isSelected && 'border-primary shadow-lg ring-2 ring-primary/20 bg-primary/5',
        !isSelected && 'border-border bg-card'
      )}
    >
      {/* Badges */}
      {hasBadge && (
        <div className="absolute -top-2 -right-2 flex gap-1">
          {item.isImportant && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
              Wichtig
            </Badge>
          )}
          {item.status.prioritized && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0.5">
              Priorisiert
            </Badge>
          )}
          {item.status.discussed && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
              Besprochen
            </Badge>
          )}
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        'w-12 h-12 rounded-full flex items-center justify-center',
        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      )}>
        <IconComponent className="w-6 h-6" />
      </div>

      {/* Title */}
      <span className={cn(
        'text-sm font-medium leading-tight',
        isSelected ? 'text-primary' : 'text-foreground'
      )}>
        {item.title}
      </span>
    </Card>
  );
}
