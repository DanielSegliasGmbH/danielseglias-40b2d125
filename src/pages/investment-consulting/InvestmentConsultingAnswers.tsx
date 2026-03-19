import { useState, useCallback, useMemo, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { needsCategories } from '@/config/investmentNeedsConfig';
import { tileAnswerMap } from '@/config/investmentAnswersConfig';
import { categoryOfferMappings, type OfferModule } from '@/config/investmentOfferConfig';
import { useInvestmentConsultationState } from '@/hooks/useInvestmentConsultationState';
import { usePresentationBroadcaster, EMPTY_PRESENTATION_STATE, type PresentationState } from '@/hooks/usePresentationSync';
import { useSectionBroadcast } from '@/hooks/useSectionBroadcast';
import {
  CheckCircle2,
  AlertTriangle,
  CircleDot,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  StickyNote,
  Lightbulb,
  BookOpen,
  ShieldCheck,
  Heart,
  Package,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ClarificationStatus = 'resolved' | 'partial' | 'open';

interface AnswerState {
  status: ClarificationStatus;
  note: string;
  sourcesVisible: boolean;
  /** Offer module IDs selected for this tile */
  selectedModuleIds: string[];
}

/** Build a flat lookup: tileId → categoryTitle */
const tileCategoryMap: Record<string, string> = {};
const tileToCategoryId: Record<string, string> = {};
needsCategories.forEach((cat) => {
  cat.tiles.forEach((t) => {
    tileCategoryMap[t.id] = cat.title;
    tileToCategoryId[t.id] = cat.id;
  });
});

/** Flat tile lookup */
const tileMap = Object.fromEntries(
  needsCategories.flatMap((c) => c.tiles.map((t) => [t.id, t]))
);

export default function InvestmentConsultingAnswers() {
  const navigate = useNavigate();
  const { consultationData, updateData } = useInvestmentConsultationState();
  const { isPresenting, broadcast } = usePresentationBroadcaster();

  // Read selected tiles from needs page
  const needsData = (consultationData.additionalData as any)?.needs as
    | { tiles: Record<string, { selected: boolean; note: string }>; freeText?: string }
    | undefined;

  const selectedTileIds = useMemo(() => {
    if (!needsData?.tiles) return [];
    return Object.entries(needsData.tiles)
      .filter(([, v]) => v.selected)
      .map(([id]) => id);
  }, [needsData]);

  // Local answer states – initialised from consultationData if available
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(() => {
    const saved = (consultationData.additionalData as any)?.answers as Record<string, AnswerState> | undefined;
    if (saved) return saved;
    const init: Record<string, AnswerState> = {};
    selectedTileIds.forEach((id) => {
      // Auto-select all modules from matching category
      const catId = tileToCategoryId[id];
      const catModules = categoryOfferMappings.find((m) => m.categoryId === catId)?.modules ?? [];
      init[id] = { status: 'open', note: '', sourcesVisible: false, selectedModuleIds: catModules.map((m) => m.id) };
    });
    return init;
  });

  // Active question index for sidebar navigation
  const [activeIdx, setActiveIdx] = useState(0);

  // Broadcast section data
  const resolvedCount = Object.values(answers).filter((a) => a.status === 'resolved').length;

  useSectionBroadcast({
    section: 'answers',
    title: 'Antworten & Vertiefung',
    subtitle: `${resolvedCount} von ${selectedTileIds.length} Fragen geklärt`,
    items: selectedTileIds.map((id) => tileMap[id]?.title ?? id),
    extra: {
      activeTileId: selectedTileIds[activeIdx] ?? null,
      activeIdx,
      selectedTileIds,
      statuses: Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v.status])),
    },
  });

  const persist = useCallback(
    (newAnswers: Record<string, AnswerState>) => {
      updateData((prev) => ({
        ...prev,
        additionalData: {
          ...prev.additionalData,
          answers: newAnswers,
        },
      }));
    },
    [updateData]
  );

  const setStatus = (tileId: string, status: ClarificationStatus) => {
    setAnswers((prev) => {
      const updated = { ...prev, [tileId]: { ...prev[tileId], status } };
      persist(updated);
      return updated;
    });
  };

  const setNote = (tileId: string, note: string) => {
    setAnswers((prev) => {
      const updated = { ...prev, [tileId]: { ...prev[tileId], note } };
      persist(updated);
      return updated;
    });
  };

  const toggleSources = (tileId: string) => {
    setAnswers((prev) => {
      const updated = {
        ...prev,
        [tileId]: { ...prev[tileId], sourcesVisible: !prev[tileId]?.sourcesVisible },
      };
      return updated;
    });
  };

  const toggleOfferModule = (tileId: string, moduleId: string) => {
    setAnswers((prev) => {
      const current = prev[tileId]?.selectedModuleIds ?? [];
      const next = current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId];
      const updated = { ...prev, [tileId]: { ...prev[tileId], selectedModuleIds: next } };
      persist(updated);
      return updated;
    });
  };

  if (selectedTileIds.length === 0) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background">
          <div className="border-b bg-card">
            <div className="container py-6">
              <h1 className="text-2xl font-bold">Antworten &amp; Vertiefung</h1>
            </div>
          </div>
          <div className="container py-16 text-center space-y-4">
            <p className="text-muted-foreground">
              Es wurden noch keine Bedürfnisse ausgewählt. Bitte zuerst die Sektion
              «Vorsorgeoptimierung» ausfüllen.
            </p>
            <Button variant="outline" onClick={() => navigate('/app/investment-consulting/needs')}>
              Zur Vorsorgeoptimierung
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const activeTileId = selectedTileIds[activeIdx] ?? selectedTileIds[0];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container py-6">
            <div>
              <h1 className="text-2xl font-bold">Gemeinsam klären wir deine wichtigsten Fragen</h1>
              <p className="text-muted-foreground mt-1">
                Wir gehen Schritt für Schritt durch die Themen, die dir wichtig sind.
              </p>
              <Badge variant="secondary" className="mt-3">
                {resolvedCount} von {selectedTileIds.length} Fragen geklärt
              </Badge>
            </div>
          </div>
        </div>

        <div className="container py-8 flex gap-6">
          {/* Sidebar navigation */}
          <aside className="hidden lg:block w-64 shrink-0">
            <Card>
              <CardContent className="p-3 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 pb-1">
                  Fragen ({selectedTileIds.length})
                </p>
                <ScrollArea className="max-h-[60vh]">
                  {selectedTileIds.map((id, idx) => {
                    const tile = tileMap[id];
                    const status = answers[id]?.status ?? 'open';
                    return (
                      <button
                        key={id}
                        onClick={() => setActiveIdx(idx)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors',
                          idx === activeIdx
                            ? 'bg-accent text-foreground font-medium'
                            : 'text-muted-foreground hover:bg-muted/50'
                        )}
                      >
                        <StatusIcon status={status} className="shrink-0" />
                        <span className="truncate">{tile?.title ?? id}</span>
                      </button>
                    );
                  })}
                </ScrollArea>
              </CardContent>
            </Card>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Mobile question selector */}
            <div className="lg:hidden">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {selectedTileIds.map((id, idx) => {
                  const status = answers[id]?.status ?? 'open';
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveIdx(idx)}
                      className={cn(
                        'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5',
                        idx === activeIdx
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-transparent text-muted-foreground border-border'
                      )}
                    >
                      <StatusIcon status={status} size={12} />
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <AnswerCard
              tileId={activeTileId}
              answerState={answers[activeTileId] ?? { status: 'open', note: '', sourcesVisible: false, selectedModuleIds: [] }}
              customerNote={needsData?.tiles?.[activeTileId]?.note ?? ''}
              onSetStatus={(s) => setStatus(activeTileId, s)}
              onSetNote={(n) => setNote(activeTileId, n)}
              onToggleSources={() => toggleSources(activeTileId)}
              onNavigateToTool={(slug) => navigate(`/app/tools/${slug}`)}
              onToggleOfferModule={(moduleId) => toggleOfferModule(activeTileId, moduleId)}
            />

            {/* Prev / Next */}
            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={activeIdx <= 0}
                onClick={() => setActiveIdx((i) => i - 1)}
              >
                Vorherige Frage
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={activeIdx >= selectedTileIds.length - 1}
                onClick={() => setActiveIdx((i) => i + 1)}
              >
                Nächste Frage
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* ================================================================== */
/* Sub-components                                                      */
/* ================================================================== */

function StatusIcon({ status, className, size = 14 }: { status: ClarificationStatus; className?: string; size?: number }) {
  switch (status) {
    case 'resolved':
      return <CheckCircle2 className={cn('text-green-600', className)} size={size} />;
    case 'partial':
      return <AlertTriangle className={cn('text-amber-500', className)} size={size} />;
    default:
      return <CircleDot className={cn('text-muted-foreground', className)} size={size} />;
  }
}

interface AnswerCardProps {
  tileId: string;
  answerState: AnswerState;
  customerNote: string;
  onSetStatus: (s: ClarificationStatus) => void;
  onSetNote: (n: string) => void;
  onToggleSources: () => void;
  onNavigateToTool: (slug: string) => void;
  onToggleOfferModule: (moduleId: string) => void;
}

function AnswerCard({
  tileId,
  answerState,
  customerNote,
  onSetStatus,
  onSetNote,
  onToggleSources,
  onNavigateToTool,
  onToggleOfferModule,
}: AnswerCardProps) {
  const tile = tileMap[tileId];
  const category = tileCategoryMap[tileId];
  const catId = tileToCategoryId[tileId];
  const config = tileAnswerMap[tileId];

  // Get offer modules for this tile's category
  const categoryModules = categoryOfferMappings.find((m) => m.categoryId === catId)?.modules ?? [];
  const selectedModuleIds = answerState.selectedModuleIds ?? [];

  return (
    <div className="space-y-4">
      {/* A) Question header */}
      <Card>
        <CardContent className="p-6">
          <Badge variant="outline" className="mb-2 text-xs">
            {category}
          </Badge>
          <h2 className="text-lg font-semibold text-foreground">{tile?.title}</h2>
          {tile?.description && (
            <p className="text-sm text-muted-foreground mt-1">{tile.description}</p>
          )}
        </CardContent>
      </Card>

      {/* B) Customer context */}
      {customerNote && (
        <Card>
          <CardContent className="p-5 flex items-start gap-3">
            <StickyNote className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Kundenkontext
              </p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{customerNote}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* C + D) Recommended steps & tools */}
      {config?.steps && config.steps.length > 0 && (
        <Card>
          <CardContent className="p-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <ArrowRight className="h-3.5 w-3.5" />
              Empfohlene nächste Schritte
            </p>
            <div className="flex flex-wrap gap-2">
              {config.steps.map((step, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    if (step.toolSlug) onNavigateToTool(step.toolSlug);
                    if (step.externalUrl) window.open(step.externalUrl, '_blank');
                  }}
                >
                  {step.label}
                  {(step.toolSlug || step.externalUrl) && <ExternalLink className="h-3 w-3" />}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* E) Explanation – storyline or simple bullets */}
      {config?.storyline && config.storyline.length > 0 ? (
        <Card className={tileId === 'trust-1' ? 'border-primary/20 bg-primary/5' : ''}>
          <CardContent className="p-5 space-y-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" />
              Gesprächsleitfaden
            </p>
            {config.storyline.map((section, i) => (
              <div key={i} className="space-y-1.5">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                  {section.heading}
                </p>
                {section.lines.map((line, j) => (
                  <p key={j} className="text-sm text-foreground leading-relaxed pl-3 border-l-2 border-primary/30">
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : config?.explanation && config.explanation.length > 0 ? (
        <Card>
          <CardContent className="p-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" />
              Erklärung &amp; Argumente
            </p>
            <ul className="space-y-1.5">
              {config.explanation.map((line, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {/* Recognition block */}
      {config?.recognition && (
        <Card className="border-primary/20">
          <CardContent className="p-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              {config.recognition.title}
            </p>
            <ul className="space-y-2">
              {config.recognition.items.map((item, i) => (
                <li key={i} className="text-sm text-foreground flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* F) Sources (toggleable) */}
      {config?.sources && config.sources.length > 0 && (
        <Card>
          <CardContent className="p-5 space-y-2">
            <button
              onClick={onToggleSources}
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Quellen
              {answerState.sourcesVisible ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
            {answerState.sourcesVisible && (
              <ul className="space-y-1 pt-1">
                {config.sources.map((src, i) => (
                  <li key={i}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
                    >
                      {src.title}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* G) Status */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Status dieser Frage
          </p>
          <div className="flex flex-wrap gap-2">
            {([
              { value: 'resolved' as const, label: 'Vollständig geklärt', icon: CheckCircle2, color: 'text-green-600' },
              { value: 'partial' as const, label: 'Teilweise geklärt', icon: AlertTriangle, color: 'text-amber-500' },
              { value: 'open' as const, label: 'Noch offen', icon: CircleDot, color: 'text-muted-foreground' },
            ]).map(({ value, label, icon: Icon, color }) => (
              <Button
                key={value}
                variant={answerState.status === value ? 'default' : 'outline'}
                size="sm"
                className="gap-1.5"
                onClick={() => onSetStatus(value)}
              >
                <Icon className={cn('h-3.5 w-3.5', answerState.status === value ? '' : color)} />
                {label}
              </Button>
            ))}
          </div>

          {/* Resolved confirmation prompt */}
          {answerState.status === 'resolved' && config?.resolvedConfirmation && (
            <div className="flex items-center gap-2 pt-2 pl-1">
              <Checkbox id={`confirm-${tileId}`} />
              <label htmlFor={`confirm-${tileId}`} className="text-xs text-muted-foreground cursor-pointer">
                {config.resolvedConfirmation}
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* NEW: Offer modules for this question */}
      {categoryModules.length > 0 && (
        <Card className="border-primary/20">
          <CardContent className="p-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Was wir hier für dich optimieren können
            </p>
            <div className="space-y-2">
              {categoryModules.map((mod) => {
                const isSelected = selectedModuleIds.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                      isSelected
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border hover:border-primary/20'
                    )}
                    onClick={() => onToggleOfferModule(mod.id)}
                  >
                    <div className={cn(
                      'mt-0.5 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors',
                      isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'
                    )}>
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{mod.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* H) Additional notes */}
      <Card>
        <CardContent className="p-5 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Zusatznotizen
          </p>
          <Textarea
            value={answerState.note}
            onChange={(e) => onSetNote(e.target.value)}
            placeholder="Individuelle Ergänzungen, Kundenreaktionen, offene Punkte …"
            className="min-h-[80px] resize-none text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
}
