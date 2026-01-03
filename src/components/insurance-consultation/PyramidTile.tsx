import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface PyramidTileProps {
  id: string;
  title: string;
  imageUrl?: string;
  isImportant: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggleImportant: (e: React.MouseEvent) => void;
}

export function PyramidTile({
  title,
  imageUrl,
  isImportant,
  isSelected,
  onSelect,
  onToggleImportant,
}: PyramidTileProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        // Base styles
        'relative w-[var(--tile-w)] h-[var(--tile-h)] rounded-lg overflow-hidden cursor-pointer',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        // Hover state
        'hover:scale-[1.03] hover:shadow-xl',
        // Selected state
        isSelected 
          ? 'ring-2 ring-primary shadow-lg scale-[1.02]' 
          : 'shadow-md'
      )}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundColor: imageUrl ? undefined : 'hsl(var(--muted))',
        }}
      />
      
      {/* Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Important Badge - top left, always visible */}
      {/* scale-1 when not important, red when important */}
      <Badge 
        variant={isImportant ? "destructive" : "secondary"}
        className={cn(
          "absolute top-2 left-2 text-[10px] px-1.5 py-0.5 z-10 transition-colors duration-200",
          isImportant 
            ? "bg-red-600 text-white hover:bg-red-700" 
            : "bg-scale-1 text-scale-11 hover:bg-scale-2"
        )}
      >
        Wichtig
      </Badge>

      {/* Toggle Important Button - top right */}
      <button
        onClick={onToggleImportant}
        aria-label={isImportant ? 'Als nicht wichtig markieren' : 'Als wichtig markieren'}
        className={cn(
          'absolute top-2 right-2 w-6 h-6 rounded-full z-10',
          'flex items-center justify-center',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
          isImportant
            ? 'bg-red-600 text-white'
            : 'bg-white/90 border-2 border-white/50 hover:bg-white'
        )}
      >
        {isImportant && <Check className="w-4 h-4" />}
      </button>

      {/* Title - bottom left */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <span className="text-white text-sm font-medium leading-tight line-clamp-2">
          {title}
        </span>
      </div>
    </div>
  );
}
