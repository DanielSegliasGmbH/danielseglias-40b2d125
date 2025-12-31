import { pyramidConfig, PyramidItem } from '@/config/insurancePyramidConfig';
import { PyramidLevel } from './PyramidLevel';
import { TooltipProvider } from '@/components/ui/tooltip';

interface PyramidCanvasProps {
  selectedItemId: string | null;
  onSelectItem: (item: PyramidItem) => void;
}

export function PyramidCanvas({ selectedItemId, onSelectItem }: PyramidCanvasProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-col items-center gap-8 py-8">
        {pyramidConfig.map((level, index) => (
          <div
            key={level.id}
            className="w-full"
            style={{
              // Create pyramid effect: top levels narrower, bottom wider
              maxWidth: `${50 + (index * 15)}%`,
            }}
          >
            <PyramidLevel
              level={level}
              selectedItemId={selectedItemId}
              onSelectItem={onSelectItem}
            />
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
