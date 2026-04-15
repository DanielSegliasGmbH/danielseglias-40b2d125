import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { useToolSnapshots } from '@/hooks/useToolSnapshots';

interface ToolSnapshotButtonProps {
  toolSlug: string;
  toolName: string;
  snapshotData: Record<string, unknown>;
  peakScoreEffect?: number;
  className?: string;
}

/**
 * Universal "📸 Ergebnis speichern" button for all tools.
 * Place at the bottom of any tool's result view.
 */
export function ToolSnapshotButton({
  toolSlug,
  toolName,
  snapshotData,
  peakScoreEffect,
  className,
}: ToolSnapshotButtonProps) {
  const { saveSnapshot } = useToolSnapshots();

  return (
    <Button
      variant="outline"
      onClick={() =>
        saveSnapshot.mutate({ toolSlug, toolName, snapshotData, peakScoreEffect })
      }
      disabled={saveSnapshot.isPending}
      className={className}
      data-pdf-hide="true"
    >
      {saveSnapshot.isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Camera className="h-4 w-4 mr-2" />
      )}
      Ergebnis speichern
    </Button>
  );
}
