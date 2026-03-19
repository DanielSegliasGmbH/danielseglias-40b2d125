/**
 * Client-facing presentation view for the investment consulting module.
 * Displays a minimal, distraction-free view of the current question,
 * synchronised in real-time from the advisor's tab via BroadcastChannel.
 */
import { usePresentationReceiver } from '@/hooks/usePresentationSync';
import { needsCategories } from '@/config/investmentNeedsConfig';
import { tileAnswerMap } from '@/config/investmentAnswersConfig';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, CircleDot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

/** Flat tile lookup */
const tileMap = Object.fromEntries(
  needsCategories.flatMap((c) => c.tiles.map((t) => [t.id, t]))
);
const tileCategoryMap: Record<string, string> = {};
needsCategories.forEach((cat) => {
  cat.tiles.forEach((t) => {
    tileCategoryMap[t.id] = cat.title;
  });
});

export default function InvestmentConsultingPresentation() {
  const { state, connected } = usePresentationReceiver();

  // Waiting screen
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

  const { activeTileId, selectedTileIds, statuses, openTool } = state;
  const resolvedCount = Object.values(statuses).filter((s) => s === 'resolved').length;
  const progressPercent = selectedTileIds.length > 0 ? (resolvedCount / selectedTileIds.length) * 100 : 0;

  // Summary view when no active tile or presentation ended
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
  const category = tileCategoryMap[activeTileId];
  const config = tileAnswerMap[activeTileId];
  const currentStatus = statuses[activeTileId] ?? 'open';

  // Tool overlay
  if (openTool) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">Tool wird angezeigt …</p>
          <p className="text-sm text-muted-foreground/60">{openTool}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal top bar with progress */}
      <div className="border-b bg-card/80 backdrop-blur px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Badge variant="outline" className="text-xs shrink-0">
            {category}
          </Badge>
          <div className="flex-1 max-w-xs">
            <Progress value={progressPercent} className="h-2" />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {resolvedCount} / {selectedTileIds.length} geklärt
          </span>
        </div>
      </div>

      {/* Main content – centered, large, clear */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16">
        <div className="max-w-3xl w-full space-y-10">
          {/* Question */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
              {tile?.title}
            </h1>
            {tile?.description && (
              <p className="text-lg md:text-xl text-muted-foreground">{tile.description}</p>
            )}
          </div>

          {/* Explanation – simplified for client */}
          {config?.storyline && config.storyline.length > 0 ? (
            <div className="space-y-6">
              {config.storyline.map((section, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.heading}
                  </p>
                  {section.lines.map((line, j) => (
                    <p key={j} className="text-lg text-foreground leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ) : config?.explanation && config.explanation.length > 0 ? (
            <ul className="space-y-3">
              {config.explanation.map((line, i) => (
                <li key={i} className="text-lg text-foreground flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {/* Recognition block */}
          {config?.recognition && (
            <div className="bg-card border rounded-2xl p-6 space-y-3">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {config.recognition.title}
              </p>
              <ul className="space-y-2">
                {config.recognition.items.map((item, i) => (
                  <li key={i} className="text-base text-foreground flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Status indicator */}
          <div className="flex items-center gap-3 pt-4">
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
      return <CheckCircle2 className={cn('text-green-600', className)} size={size} />;
    case 'partial':
      return <AlertTriangle className={cn('text-amber-500', className)} size={size} />;
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
