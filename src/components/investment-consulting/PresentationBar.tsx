/**
 * Floating presentation control bar.
 * Uses a simple localStorage flag to detect if presentation is active,
 * and navigates between sections.
 */
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, MonitorOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { SECTION_ORDER, sectionFromPath } from '@/hooks/usePresentationSync';
import { useLocation, useNavigate } from 'react-router-dom';

const PRESENTING_KEY = 'investment-presenting';

/** Call this when starting/stopping presentation */
export function setPresentingFlag(active: boolean) {
  if (active) {
    localStorage.setItem(PRESENTING_KEY, 'true');
    window.dispatchEvent(new StorageEvent('storage', { key: PRESENTING_KEY }));
  } else {
    localStorage.removeItem(PRESENTING_KEY);
    window.dispatchEvent(new StorageEvent('storage', { key: PRESENTING_KEY }));
  }
}

export function PresentationBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isPresenting, setIsPresenting] = useState(
    () => localStorage.getItem(PRESENTING_KEY) === 'true'
  );

  // Only show on investment-consulting routes
  const isInvestmentRoute = location.pathname.startsWith('/app/investment-consulting');

  useEffect(() => {
    const handler = () => {
      setIsPresenting(localStorage.getItem(PRESENTING_KEY) === 'true');
    };
    window.addEventListener('storage', handler);
    // Also poll in case same-tab events
    const interval = setInterval(handler, 1000);
    return () => {
      window.removeEventListener('storage', handler);
      clearInterval(interval);
    };
  }, []);

  if (!isPresenting || !isInvestmentRoute) return null;

  const currentSection = sectionFromPath(location.pathname);
  const currentIdx = SECTION_ORDER.findIndex((s) => s.key === currentSection);

  const goToSection = (delta: number) => {
    const newIdx = currentIdx + delta;
    if (newIdx < 0 || newIdx >= SECTION_ORDER.length) return;
    const target = SECTION_ORDER[newIdx];
    navigate(`/app/investment-consulting/${target.key}`);
  };

  const handleStop = () => {
    setPresentingFlag(false);
    // The broadcaster hook will detect this and close the window
    window.dispatchEvent(new CustomEvent('stop-presentation'));
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
              ({Math.max(currentIdx + 1, 1)}/{SECTION_ORDER.length})
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
          onClick={handleStop}
        >
          <MonitorOff className="w-3 h-3" />
          Beenden
        </Button>
      </div>
    </div>
  );
}
