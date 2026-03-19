/**
 * Client-facing global presentation view – section-aware.
 * Renders the appropriate customer view based on the current section
 * broadcast by the advisor.
 */
import { usePresentationReceiver, SECTION_ORDER, type PresentationState } from '@/hooks/usePresentationSync';
import { needsCategories } from '@/config/investmentNeedsConfig';
import { tileAnswerMap } from '@/config/investmentAnswersConfig';
import { riskReversalItems } from '@/config/investmentOfferConfig';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2, AlertTriangle, CircleDot, Loader2, Check,
  Target, Shield, Sparkles, Package, ArrowRight, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

/* ── Tile lookups ── */
const tileMap = Object.fromEntries(
  needsCategories.flatMap((c) => c.tiles.map((t) => [t.id, t]))
);
const tileCategoryMap: Record<string, string> = {};
needsCategories.forEach((cat) => {
  cat.tiles.forEach((t) => { tileCategoryMap[t.id] = cat.title; });
});

export default function InvestmentConsultingPresentation() {
  const { state, connected, sendStepClick, sendOfferAction } = usePresentationReceiver();
  const [transitioning, setTransitioning] = useState(false);
  const prevSectionRef = useRef(state.currentSection);

  // Smooth transition when section changes
  useEffect(() => {
    if (state.currentSection !== prevSectionRef.current) {
      setTransitioning(true);
      const timer = setTimeout(() => {
        setTransitioning(false);
        prevSectionRef.current = state.currentSection;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [state.currentSection]);

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

  const currentSectionMeta = SECTION_ORDER.find((s) => s.key === state.currentSection);
  const sectionIdx = currentSectionMeta?.order ?? 0;
  const totalSections = SECTION_ORDER.length;
  const globalProgress = ((sectionIdx + 1) / totalSections) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Top bar ── */}
      <div className="border-b bg-card/80 backdrop-blur px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Badge variant="outline" className="text-xs shrink-0">
            {currentSectionMeta?.label ?? 'Beratung'}
          </Badge>
          <div className="flex-1 max-w-xs">
            <Progress value={globalProgress} className="h-2" />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            Schritt {sectionIdx + 1} / {totalSections}
          </span>
        </div>
      </div>

      {/* ── Content with transition ── */}
      <div
        className={cn(
          'flex-1 flex items-center justify-center p-8 md:p-16 transition-all duration-300',
          transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0',
        )}
      >
        <SectionContent state={state} sendStepClick={sendStepClick} sendOfferAction={sendOfferAction} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Section-specific content renderer
   ════════════════════════════════════════════════════════════ */

function SectionContent({
  state,
  sendStepClick,
  sendOfferAction,
}: {
  state: PresentationState;
  sendStepClick: (tileId: string, step: string) => void;
  sendOfferAction: (action: string) => void;
}) {
  switch (state.currentSection) {
    case 'answers':
      return <AnswersView state={state} sendStepClick={sendStepClick} />;
    case 'offer':
      return <OfferView state={state} sendOfferAction={sendOfferAction} />;
    case 'summary':
      return <SummaryView state={state} />;
    case 'needs':
      return <NeedsView state={state} />;
    default:
      return <GenericSectionView state={state} />;
  }
}

/* ── Generic section (intro, company, advisor, customer, topics, consultation) ── */
function GenericSectionView({ state }: { state: PresentationState }) {
  return (
    <div className="max-w-3xl w-full space-y-8 text-center">
      <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
        {state.sectionTitle || SECTION_ORDER.find((s) => s.key === state.currentSection)?.label || 'Beratung'}
      </h1>
      {state.sectionSubtitle && (
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
          {state.sectionSubtitle}
        </p>
      )}
      {state.sectionItems.length > 0 && (
        <ul className="space-y-3 text-left max-w-xl mx-auto">
          {state.sectionItems.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-base text-foreground">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Needs view ── */
function NeedsView({ state }: { state: PresentationState }) {
  const selectedCount = state.selectedTileIds.length;
  return (
    <div className="max-w-3xl w-full space-y-8 text-center">
      <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
        {state.sectionTitle || 'Deine wichtigsten Fragen'}
      </h1>
      <p className="text-lg text-muted-foreground">
        {selectedCount > 0
          ? `${selectedCount} Themen ausgewählt`
          : 'Welche Themen sind dir besonders wichtig?'}
      </p>
      {selectedCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto">
          {state.selectedTileIds.map((id) => {
            const tile = tileMap[id];
            return (
              <div key={id} className="flex items-center gap-3 p-4 rounded-xl bg-card border">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="font-medium text-sm">{tile?.title ?? id}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Answers view (existing rich view) ── */
function AnswersView({
  state,
  sendStepClick,
}: {
  state: PresentationState;
  sendStepClick: (tileId: string, step: string) => void;
}) {
  const [clickedSteps, setClickedSteps] = useState<Record<string, Set<string>>>({});
  const { activeTileId, selectedTileIds, statuses } = state;
  const resolvedCount = Object.values(statuses).filter((s) => s === 'resolved').length;
  const progressPercent = selectedTileIds.length > 0 ? (resolvedCount / selectedTileIds.length) * 100 : 0;

  if (!activeTileId) {
    return (
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
    <div className="max-w-3xl w-full space-y-12">
      {/* Header */}
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

      {/* Interactive Steps */}
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
                      : 'border-border bg-card hover:border-primary/40',
                  )}
                >
                  <div className={cn(
                    'flex items-center justify-center h-8 w-8 rounded-full shrink-0 transition-colors',
                    isClicked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}>
                    {isClicked ? <Check className="h-4 w-4" /> : <span className="text-sm font-medium">?</span>}
                  </div>
                  <span className="text-base md:text-lg font-medium">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recognition block */}
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

      {/* Status */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <StatusIcon status={currentStatus} size={24} />
        <StatusLabel status={currentStatus} large />
      </div>
    </div>
  );
}

/* ── Summary view ── */
function SummaryView({ state }: { state: PresentationState }) {
  const { selectedTileIds, statuses } = state;
  const resolvedCount = Object.values(statuses).filter((s) => s === 'resolved').length;

  return (
    <div className="max-w-3xl w-full space-y-8 text-center">
      <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
        Zusammenfassung
      </h1>
      <p className="text-lg text-muted-foreground">
        {resolvedCount} von {selectedTileIds.length} Themen wurden geklärt
      </p>
      {selectedTileIds.length > 0 && (
        <div className="space-y-3 text-left max-w-2xl mx-auto">
          {selectedTileIds.map((id) => {
            const tile = tileMap[id];
            const status = statuses[id] ?? 'open';
            return (
              <div key={id} className="flex items-center gap-3 p-4 rounded-xl bg-card border">
                <StatusIcon status={status} size={20} />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{tile?.title ?? id}</p>
                </div>
                <StatusLabel status={status} />
              </div>
            );
          })}
        </div>
      )}
      {state.sectionItems.length > 0 && (
        <div className="text-left max-w-2xl mx-auto space-y-3 pt-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Erkenntnisse
          </p>
          <ul className="space-y-2">
            {state.sectionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Offer view (customer-facing) ── */
function OfferView({
  state,
  sendOfferAction,
}: {
  state: PresentationState;
  sendOfferAction: (action: string) => void;
}) {
  return (
    <div className="max-w-3xl w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
          Dein individuelles Konzept
        </h1>
        <p className="text-lg text-muted-foreground">
          Basierend auf unserem Gespräch zusammengestellt
        </p>
      </div>

      {/* Goal */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 justify-center">
          <Target className="w-5 h-5 text-primary" />
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Das Ziel</p>
        </div>
        {state.sectionItems.length > 0 && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {state.sectionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modules */}
      {state.offerModules.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 justify-center">
            <Package className="w-5 h-5 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Was du bekommst</p>
          </div>
          <div className="space-y-2 max-w-2xl mx-auto">
            {state.offerModules.map((mod, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{mod.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Value + Price */}
      {state.offerTotalValue && (
        <div className="text-center space-y-2">
          <div className="flex items-center gap-2 justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Gesamtwert</p>
          </div>
          <p className="text-2xl font-semibold text-foreground">{state.offerTotalValue}+</p>
        </div>
      )}

      {state.offerPrice && (
        <div className="text-center space-y-2 py-4">
          <p className="text-sm text-muted-foreground">Dein Preis heute</p>
          <p className="text-4xl font-bold text-primary">{state.offerPrice}</p>
        </div>
      )}

      {/* Risk reversal */}
      <div className="space-y-3 max-w-xl mx-auto">
        <div className="flex items-center gap-2 justify-center">
          <Shield className="w-5 h-5 text-primary" />
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Deine Sicherheit</p>
        </div>
        <ul className="space-y-2">
          {riskReversalItems.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <button
          onClick={() => sendOfferAction('start')}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-colors"
        >
          <Star className="w-5 h-5" />
          Zusammenarbeit starten
        </button>
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
