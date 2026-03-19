/**
 * Client-facing global presentation view – section-aware.
 * Renders the appropriate customer view based on the current section
 * broadcast by the advisor.
 */
import { usePresentationReceiver, SECTION_ORDER, type PresentationState } from '@/hooks/usePresentationSync';
import { needsCategories } from '@/config/investmentNeedsConfig';
import { tileAnswerMap } from '@/config/investmentAnswersConfig';
import { riskReversalItems, packageConfigs, formatCHF } from '@/config/investmentOfferConfig';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2, AlertTriangle, CircleDot, Loader2, Check,
  Target, Shield, Sparkles, Package, ArrowRight, Star, ExternalLink, Crown,
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
  const { state, connected, sendStepClick, sendOfferAction, sendNeedsTileToggle } = usePresentationReceiver();
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
        </div>
      </div>

      {/* ── Content with transition ── */}
      <div
        className={cn(
          'flex-1 flex items-center justify-center p-8 md:p-16 transition-all duration-300',
          transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0',
        )}
      >
        <SectionContent state={state} sendStepClick={sendStepClick} sendOfferAction={sendOfferAction} sendNeedsTileToggle={sendNeedsTileToggle} />
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
  sendNeedsTileToggle,
}: {
  state: PresentationState;
  sendStepClick: (tileId: string, step: string) => void;
  sendOfferAction: (action: string) => void;
  sendNeedsTileToggle: (tileId: string) => void;
}) {
  switch (state.currentSection) {
    case 'answers':
      return <AnswersView state={state} sendStepClick={sendStepClick} />;
    case 'offer':
      return <OfferView state={state} sendOfferAction={sendOfferAction} />;
    case 'summary':
      return <SummaryView state={state} />;
    case 'needs':
      return <NeedsView state={state} sendNeedsTileToggle={sendNeedsTileToggle} />;
    default:
      return <GenericSectionView state={state} />;
  }
}

/* ── Generic section ── */
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
function NeedsView({ state, sendNeedsTileToggle }: { state: PresentationState; sendNeedsTileToggle: (tileId: string) => void }) {
  const selectedIds = new Set(state.selectedTileIds);
  const selectedCount = selectedIds.size;

  return (
    <div className="max-w-4xl w-full space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
          {state.sectionTitle || 'Was ist dir besonders wichtig?'}
        </h1>
        <p className="text-lg text-muted-foreground">
          {selectedCount > 0
            ? `${selectedCount} ${selectedCount === 1 ? 'Thema' : 'Themen'} ausgewählt`
            : 'Wähle die Themen aus, die dich am meisten beschäftigen'}
        </p>
      </div>

      {needsCategories.map((category) => (
        <div key={category.id} className="space-y-3">
          <h2 className={cn(
            'text-sm font-semibold uppercase tracking-wide',
            category.highlight ? 'text-primary' : 'text-muted-foreground'
          )}>
            {category.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {category.tiles.map((tile) => {
              const isSelected = selectedIds.has(tile.id);
              return (
                <button
                  key={tile.id}
                  onClick={() => sendNeedsTileToggle(tile.id)}
                  className={cn(
                    'text-left p-5 rounded-2xl border-2 transition-all duration-200',
                    'hover:shadow-md hover:scale-[1.01] active:scale-[0.99]',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                      : 'border-border bg-card hover:border-primary/40',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                      isSelected
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted-foreground/30 text-transparent'
                    )}>
                      <Check className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground leading-snug block">
                        {tile.title}
                      </span>
                      {tile.description && (
                        <span className="text-xs text-muted-foreground mt-0.5 block">
                          {tile.description}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Answers view ── */
function AnswersView({
  state,
  sendStepClick,
}: {
  state: PresentationState;
  sendStepClick: (tileId: string, step: string) => void;
}) {
  const { activeTileId, selectedTileIds, statuses } = state;
  const resolvedCount = Object.values(statuses).filter((s) => s === 'resolved').length;

  if (!activeTileId) {
    return (
      <div className="max-w-2xl w-full space-y-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Deine wichtigsten Punkte
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

      {/* Steps as clickable CTA links */}
      {config?.steps && config.steps.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground text-center uppercase tracking-wider">
            Empfohlene nächste Schritte
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {config.steps.map((step) => {
              const url = step.externalUrl || (step.toolSlug ? `/app/tools/${step.toolSlug}` : null);

              return url ? (
                <a
                  key={step.label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sendStepClick(activeTileId, step.label)}
                  className={cn(
                    'flex items-center gap-3 p-5 rounded-2xl border-2 border-primary/20 text-left transition-all duration-200',
                    'hover:shadow-md hover:scale-[1.02] hover:border-primary/40 active:scale-[0.98]',
                    'bg-card group',
                  )}
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                  <span className="text-base md:text-lg font-medium flex-1">{step.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ) : (
                <button
                  key={step.label}
                  onClick={() => sendStepClick(activeTileId, step.label)}
                  className={cn(
                    'flex items-center gap-3 p-5 rounded-2xl border-2 border-border text-left transition-all duration-200',
                    'hover:shadow-md hover:scale-[1.02] hover:border-primary/40 active:scale-[0.98]',
                    'bg-card',
                  )}
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground shrink-0">
                    <ArrowRight className="h-4 w-4" />
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

      {/* Simplified offer preview for customer */}
      <div className="max-w-xl mx-auto space-y-3">
        <p className="text-sm font-semibold text-muted-foreground text-center uppercase tracking-wider">
          Was wir hier für dich optimieren können
        </p>
        <div className="space-y-2">
          {[
            'Klarheit über deine aktuelle Situation',
            'Bessere Struktur und Übersicht',
            'Konkrete Handlungsschritte',
            'Persönliche Begleitung',
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 p-4 rounded-xl bg-card border">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{item}</p>
            </div>
          ))}
        </div>
      </div>

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

/* ── Offer view (customer-facing with 3 tiers) ── */
function OfferView({
  state,
  sendOfferAction,
}: {
  state: PresentationState;
  sendOfferAction: (action: string) => void;
}) {
  return (
    <div className="max-w-4xl w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
          Dein individuelles Angebot
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

      {/* 3 Package Tiers */}
      {state.offerModules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 justify-center">
            <Package className="w-5 h-5 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Deine Optionen</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packageConfigs.map((pkg) => {
              const isRecommended = pkg.recommended;
              // Distribute modules across tiers for display
              const tierModuleCount = pkg.tier === 'starter' 
                ? Math.ceil(state.offerModules.length * 0.4)
                : pkg.tier === 'standard'
                  ? Math.ceil(state.offerModules.length * 0.7)
                  : state.offerModules.length;
              const tierModules = state.offerModules.slice(0, tierModuleCount);

              return (
                <div
                  key={pkg.tier}
                  className={cn(
                    'rounded-2xl border-2 p-6 space-y-4 transition-all',
                    isRecommended
                      ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20'
                      : 'border-border bg-card',
                  )}
                >
                  {isRecommended && (
                    <Badge className="bg-primary text-primary-foreground gap-1 mx-auto block w-fit">
                      <Star className="w-3 h-3" />
                      Empfohlen
                    </Badge>
                  )}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                      {pkg.tier === 'premium' && <Crown className="w-4 h-4 text-primary" />}
                      {pkg.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{pkg.description}</p>
                  </div>
                  <ul className="space-y-2">
                    {tierModules.map((mod, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{mod.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
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
          <p className="text-sm text-muted-foreground">Ab</p>
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
