import { useLatestToolSnapshot } from '@/hooks/useToolSnapshots';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, RotateCcw, Eye } from 'lucide-react';
import { useState } from 'react';

interface ToolLastResultProps {
  toolSlug: string;
  /** Render the saved snapshot in read-only mode */
  renderSnapshot?: (data: Record<string, unknown>) => React.ReactNode;
  onNewCalculation?: () => void;
}

/**
 * Shows a banner when re-entering a previously used tool.
 * "Letztes Ergebnis: [date]" with options to view or recalculate.
 */
export function ToolLastResult({ toolSlug, renderSnapshot, onNewCalculation }: ToolLastResultProps) {
  const { data: lastSnapshot, isLoading } = useLatestToolSnapshot(toolSlug);
  const [showResult, setShowResult] = useState(false);

  if (isLoading || !lastSnapshot) return null;

  const date = new Date(lastSnapshot.created_at).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  if (showResult && renderSnapshot) {
    return (
      <div className="space-y-3" data-pdf-hide="true">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Gespeichertes Ergebnis vom {date}
          </p>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowResult(false)}>
            Schliessen
          </Button>
        </div>
        <div className="opacity-90 pointer-events-none">
          {renderSnapshot(lastSnapshot.snapshot_data)}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-primary/15 bg-primary/5" data-pdf-hide="true">
      <CardContent className="p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm text-foreground truncate">
            Letztes Ergebnis: <span className="font-medium">{date}</span>
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {renderSnapshot && (
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setShowResult(true)}>
              <Eye className="h-3 w-3" /> Anzeigen
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onNewCalculation}>
            <RotateCcw className="h-3 w-3" /> Neu berechnen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
