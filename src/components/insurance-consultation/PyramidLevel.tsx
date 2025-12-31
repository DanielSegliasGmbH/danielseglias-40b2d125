import { PyramidLevel as PyramidLevelType, PyramidItem } from '@/config/insurancePyramidConfig';
import { PyramidBlock } from './PyramidBlock';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PyramidLevelProps {
  level: PyramidLevelType;
  selectedItemId: string | null;
  onSelectItem: (item: PyramidItem) => void;
}

export function PyramidLevel({ level, selectedItemId, onSelectItem }: PyramidLevelProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Level Title */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {level.title}
        </h3>
        {level.infoText && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p>{level.infoText}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Items Row */}
      <div className="flex flex-wrap justify-center gap-3">
        {level.items.map((item) => (
          <PyramidBlock
            key={item.id}
            item={item}
            isSelected={selectedItemId === item.id}
            onSelect={onSelectItem}
          />
        ))}
      </div>
    </div>
  );
}
