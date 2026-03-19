/**
 * Client-facing presentation view – minimal, interactive, distraction-free.
 * Displays only what the customer needs: the question, clickable steps,
 * a short recognition checklist, and the current status.
 */
import { usePresentationReceiver } from '@/hooks/usePresentationSync';
import { needsCategories } from '@/config/investmentNeedsConfig';
import { tileAnswerMap } from '@/config/investmentAnswersConfig';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, CircleDot, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';

/* ── Tile lookups ── */
const tileMap = Object.fromEntries(
  needsCategories.flatMap((c) => c.tiles.map((t) => [t.id, t]))
);
const tileCategoryMap: Record<string, string> = {};
needsCategories.forEach((cat) => {
  cat.tiles.forEach((t) => { tileCategoryMap[t.id] = cat.title; });
});

export default function InvestmentConsultingPresentation() {
  const { state, connected, sendStepClick } = usePresentationReceiver();
  const [clickedSteps, setClickedSteps] = useState<Record<string, Set<string>>>({});

  /* ── Waiting screen ── */
  if (!connected || !state.isActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mx-auto" />
          <p className="text-xl text-muted-foreground">Warte auf Berater …</p>
          <p className="text-sm text-muted-foreground/60">
            Die Präsentation wird vom Berater gesteuert.
          </p>
        </div>
      </div>
    );
  }

  const { activeTileId, selectedTileIds, statuses } = state;
  const resolvedCount = Object.values(statuses).filter((s) => s === 'resolved').length;
  const progressPercent = selectedTileIds.length > 0 ? (resolvedCount / selectedTileIds.length) * 100 : 0;

  /* ── Summary view ── */
  if (!activeTileId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Zusammenfassung deiner wichtigsten Punkte
          </h1>
          <div className="space-y-3 text-left">
            {selectedTileIds.map((id) => {
              const tile = tileMap[id];
              const status = statuses[id] ?? 'open';
              return (
                <div key={id} className="flex items-center gap-3 p-4 rounded-xl bg-card border">
                  <StatusIcon status={status} size={20} />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{tile?.title ?? id}</p>
                    <p className="text-xs text-muted-foreground">{tileCategoryMap[id]}</p>
                  </div>
                  <StatusLabel status={status} />
                </div>
              );
            })}
          </div>
          <p className="text-muted-foreground text-sm">
            {resolvedCount} von {selectedTileIds.length} Themen geklärt
          </p>
        </div>
      </div>
    );
  }

  const tile = tileMap[activeTileId];
  const config = tileAnswerMap[activeTileId];
  const currentStatus = statuses[activeTileId] ?? 'open';
  const tileClicked = clickedSteps[activeTileId] ?? new Set<string>();

  const handleStepClick = (label: string) => {
    setClickedSteps((prev) => {
      const current = new Set(prev[activeTileId] ?? []);
      current.add(label);
      return { ...prev, [activeTileId]: current };
    });
    sendStepClick(activeTileId, label);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Minimal top bar ── */}
      <div className="border-b bg-card/80 backdrop-blur px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Badge variant="outline" className="text-xs shrink-0">
            {tileCategoryMap[activeTileId]}
          </Badge>
          <div className="flex-1 max-w-xs">
            <Progress value={progressPercent} className="h-2" />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {resolvedCount} / {selectedTileIds.length} geklärt
          </span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16">
        <div className="max-w-3xl w-full space-y-12">

          {/* A) Header */}
          <div className="space-y-3 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
              {tile?.title}
            </h1>
            {tile?.description && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
                {tile.description}
              </p>
            )}
          </div>

          {/* B) Interactive Steps – the core feature */}
          {config?.steps && config.steps.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground text-center uppercase tracking-wider">
                Was möchtest du genauer wissen?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {config.steps.map((step) => {
                  const isClicked = tileClicked.has(step.label);
                  return (
                    <button
                      key={step.label}
                      onClick={() => handleStepClick(step.label)}
                      className={cn(
                        'relative flex items-center gap-3 p-5 rounded-2xl border-2 text-left transition-all duration-200',
                        'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
                        isClicked
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border bg-card hover:border-primary/40'
                      )}
                    >
                      <div className={cn(
                        'flex items-center justify-center h-8 w-8 rounded-full shrink-0 transition-colors',
                        isClicked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}>
                        {isClicked ? <Check className="h-4 w-4" /> : <span className="text-sm font-medium">?</span>}
                      </div>
                      <span className={cn(
                        'text-base md:text-lg font-medium',
                        isClicked ? 'text-foreground' : 'text-foreground'
                      )}>
                        {step.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* C) Mini recognition block */}
          {config?.recognition && (
            <div className="max-w-xl mx-auto space-y-3">
              <p className="text-sm font-semibold text-muted-foreground text-center uppercase tracking-wider">
                {config.recognition.title}
              </p>
              <ul className="space-y-2">
                {config.recognition.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-base text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* D) Status display */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <StatusIcon status={currentStatus} size={24} />
            <StatusLabel status={currentStatus} large />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */

function StatusIcon({ status, className, size = 16 }: { status: string; className?: string; size?: number }) {
  switch (status) {
    case 'resolved':
      return <CheckCircle2 className={cn('text-primary', className)} size={size} />;
    case 'partial':
      return <AlertTriangle className={cn('text-warning', className)} size={size} />;
    default:
      return <CircleDot className={cn('text-muted-foreground', className)} size={size} />;
  }
}

function StatusLabel({ status, large }: { status: string; large?: boolean }) {
  const labels: Record<string, string> = {
    resolved: 'Vollständig geklärt',
    partial: 'Teilweise geklärt',
    open: 'Noch offen',
  };
  return (
    <span className={cn('font-medium', large ? 'text-lg' : 'text-xs text-muted-foreground')}>
      {labels[status] ?? labels.open}
    </span>
  );
}
