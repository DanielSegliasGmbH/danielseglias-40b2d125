import { pyramidConfig, PyramidItem, PyramidLevel as PyramidLevelType } from '@/config/insurancePyramidConfig';
import { desktopLayout, tabletLayout } from '@/config/pyramidLayoutConfig';
import { PyramidBlock } from './PyramidBlock';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface PyramidGridProps {
  selectedItemId: string | null;
  onSelectItem: (item: PyramidItem) => void;
}

export function PyramidGrid({ selectedItemId, onSelectItem }: PyramidGridProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobilePyramid
        selectedItemId={selectedItemId}
        onSelectItem={onSelectItem}
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full max-w-6xl mx-auto px-4">
        {/* Desktop/Tablet: 12/8-Spalten Grid */}
        <div 
          className="grid gap-y-6 lg:gap-y-8"
          style={{
            gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
            columnGap: '1rem',
          }}
        >
          {pyramidConfig.map((level) => (
            <PyramidLevelRow
              key={level.id}
              level={level}
              selectedItemId={selectedItemId}
              onSelectItem={onSelectItem}
            />
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

interface PyramidLevelRowProps {
  level: PyramidLevelType;
  selectedItemId: string | null;
  onSelectItem: (item: PyramidItem) => void;
}

function PyramidLevelRow({ level, selectedItemId, onSelectItem }: PyramidLevelRowProps) {
  const layout = desktopLayout[level.id];
  
  if (!layout) return null;

  return (
    <>
      {/* Level Title */}
      <div
        className="flex items-center gap-2 mt-4 first:mt-0"
        style={{
          gridColumn: `${layout.title.colStart} / ${layout.title.colEnd}`,
        }}
      >
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

      {/* Level Items */}
      {level.items.map((item, index) => {
        const itemLayout = layout.items[index];
        if (!itemLayout) return null;

        return (
          <div
            key={item.id}
            style={{
              gridColumn: `${itemLayout.colStart} / ${itemLayout.colEnd}`,
            }}
          >
            <PyramidBlock
              item={item}
              isSelected={selectedItemId === item.id}
              onSelect={onSelectItem}
              fullWidth
            />
          </div>
        );
      })}
    </>
  );
}

// Mobile: Horizontales Scrollen pro Level
function MobilePyramid({ 
  selectedItemId, 
  onSelectItem 
}: { 
  selectedItemId: string | null; 
  onSelectItem: (item: PyramidItem) => void;
}) {
  return (
    <TooltipProvider>
      <div className="w-full space-y-6 px-4">
        {pyramidConfig.map((level) => (
          <div key={level.id} className="space-y-3">
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

            {/* Horizontal Scroll Container */}
            <div className="overflow-x-auto -mx-4 px-4 pb-2">
              <div className="flex gap-3" style={{ minWidth: 'min-content' }}>
                {level.items.map((item) => (
                  <div key={item.id} className="w-[160px] flex-shrink-0">
                    <PyramidBlock
                      item={item}
                      isSelected={selectedItemId === item.id}
                      onSelect={onSelectItem}
                      fullWidth
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
