import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import offerImg from '@/assets/pyramid/unser-angebot.png';

interface OfferTileProps {
  onSelect: () => void;
}

export function OfferTile({ onSelect }: OfferTileProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        'relative rounded-lg overflow-hidden cursor-pointer',
        'w-[clamp(140px,18vw,200px)] h-[clamp(90px,12vw,120px)]',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'hover:scale-[1.03] hover:shadow-xl',
        'shadow-md ring-1 ring-primary/20'
      )}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${offerImg})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Badge top-left */}
      <Badge
        variant="secondary"
        className="absolute top-2 left-2 text-[9px] px-1.5 py-0.5 z-10 bg-scale-1 text-scale-11"
      >
        Zusatz
      </Badge>

      {/* Title bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <span className="text-white text-sm font-medium leading-tight line-clamp-2">
          Unser Angebot
        </span>
      </div>
    </div>
  );
}
