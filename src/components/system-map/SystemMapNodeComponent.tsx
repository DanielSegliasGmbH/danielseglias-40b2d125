import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';

interface SystemNodeData {
  label: string;
  category: string;
  description: string | null;
  isSelected: boolean;
  isCompare: boolean;
  isOnPath: boolean;
  color: string;
}

export const SystemMapNodeComponent = memo(({ data }: NodeProps) => {
  const nodeData = data as unknown as SystemNodeData;
  const { label, category, isSelected, isCompare, isOnPath, color } = nodeData;

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
      <div
        className={cn(
          'px-4 py-3 rounded-lg border-2 shadow-sm transition-all duration-200 min-w-[140px] text-center',
          'bg-card hover:shadow-md cursor-pointer',
          isSelected && 'ring-4 ring-primary ring-offset-2 ring-offset-background',
          isCompare && 'ring-4 ring-chart-2 ring-offset-2 ring-offset-background',
          isOnPath && !isSelected && !isCompare && 'ring-2 ring-primary/50'
        )}
        style={{ borderColor: color }}
      >
        <div className="font-medium text-sm text-foreground">{label}</div>
        <div
          className="text-xs mt-1 capitalize px-2 py-0.5 rounded-full inline-block"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {category}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
    </>
  );
});

SystemMapNodeComponent.displayName = 'SystemMapNodeComponent';
