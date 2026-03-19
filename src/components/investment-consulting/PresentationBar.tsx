/**
 * Floating presentation control bar shown on all investment consulting pages
 * when a presentation session is active.
 */
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, MonitorOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePresentationBroadcaster, SECTION_ORDER, sectionFromPath, type PresentationState } from '@/hooks/usePresentationSync';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PresentationBarProps {
  /** Extra state fields to merge into the broadcast (e.g. answers data) */
  extraState?: Partial<PresentationState>;
}

export function PresentationBar({ extraState }: PresentationBarProps) {
  const { isPresenting, broadcast, startPresentation, stopPresentation } = usePresentationBroadcaster();
  const location = useLocation();
  const navigate = useNavigate();

  const currentSection = sectionFromPath(location.pathname);
  const currentIdx = SECTION_ORDER.findIndex((s) => s.key === currentSection);

  if (!isPresenting) return null;

  const goToSection = (delta: number) => {
    const newIdx = currentIdx + delta;
    if (newIdx < 0 || newIdx >= SECTION_ORDER.length) return;
    const target = SECTION_ORDER[newIdx];
    navigate(`/app/investment-consulting/${target.key}`);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-card border shadow-lg rounded-full px-4 py-2">
        <Badge variant="default" className="gap-1.5 text-xs">
          <Monitor className="w-3 h-3" />
          Live
        </Badge>

        <div className="flex items-center gap-1 mx-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={currentIdx <= 0}
            onClick={() => goToSection(-1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-xs text-muted-foreground px-2 min-w-[100px] text-center">
            {SECTION_ORDER[currentIdx]?.label ?? 'Beratung'}
            <span className="text-muted-foreground/50 ml-1">
              ({currentIdx + 1}/{SECTION_ORDER.length})
            </span>
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={currentIdx >= SECTION_ORDER.length - 1}
            onClick={() => goToSection(1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="destructive"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={stopPresentation}
        >
          <MonitorOff className="w-3 h-3" />
          Beenden
        </Button>
      </div>
    </div>
  );
}
