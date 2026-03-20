import { useState, useCallback, useMemo, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  needsCategories,
  NeedsTile,
  NeedsTileState,
  allTileIds,
  tileMap,
  calculateProductScores,
} from '@/config/investmentNeedsConfig';
import { useInvestmentConsultationState } from '@/hooks/useInvestmentConsultationState';
import { usePresentationBroadcaster } from '@/hooks/usePresentationSync';
import { useSectionBroadcast } from '@/hooks/useSectionBroadcast';
import { useViewMode } from '@/hooks/useViewMode';
import { CheckCircle2, MessageSquare, Wrench, CheckCheck } from 'lucide-react';

export default function InvestmentConsultingNeeds() {
  const { consultationData, updateData: ctxUpdate } = useInvestmentConsultationState();
  const { onClientNeedsToggleRef } = usePresentationBroadcaster();
  const { isPresentation, isAdmin } = useViewMode();

  // Local state from persisted data
  const [tiles, setTiles] = useState<Record<string, NeedsTileState>>(() => {
    const saved = (consultationData?.additionalData as Record<string, unknown> | undefined)?.needs as { tiles?: Record<string, NeedsTileState> } | undefined;
    return saved?.tiles ?? {};
  });
  const [freeText, setFreeText] = useState<string>(() => {
    const saved = (consultationData?.additionalData as Record<string, unknown> | undefined)?.needs as { freeText?: string } | undefined;
    return saved?.freeText ?? '';
  });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const selectedTileIds = useMemo(
    () => Object.entries(tiles).filter(([, v]) => v.selected).map(([id]) => id),
    [tiles]
  );

  const selectedTileNames = useMemo(
    () => selectedTileIds.map((id) => tileMap[id]?.title ?? id),
    [selectedTileIds]
  );

  // Product scores (for downstream use)
  const productScores = useMemo(() => calculateProductScores(tiles), [tiles]);

  useSectionBroadcast({
    section: 'needs',
    title: 'Deine wichtigsten Fragen',
    subtitle:
      selectedTileIds.length > 0
        ? `${selectedTileIds.length} Themen ausgewählt`
        : 'Welche Themen sind dir besonders wichtig?',
    items: selectedTileNames,
    extra: { selectedTileIds } as Partial<import('@/hooks/usePresentationSync').PresentationState>,
  });

  // Persist into consultation context
  const persist = useCallback(
    (newTiles: Record<string, NeedsTileState>, newFreeText: string) => {
      if (ctxUpdate) {
        ctxUpdate((prev) => ({
          ...prev,
          additionalData: {
            ...prev.additionalData,
            needs: {
              tiles: newTiles,
              freeText: newFreeText,
              productScores: calculateProductScores(newTiles),
            },
          },
        }));
      }
    },
    [ctxUpdate]
  );

  const toggleTile = useCallback(
    (tileId: string) => {
      setTiles((prev) => {
        const current = prev[tileId] ?? { selected: false, note: '', usageCount: 0 };
        const nowSelected = !current.selected;
        const updated = {
          ...prev,
          [tileId]: {
            ...current,
            selected: nowSelected,
            usageCount: nowSelected ? (current.usageCount || 0) + 1 : current.usageCount,
            lastUsedAt: nowSelected ? new Date().toISOString() : current.lastUsedAt,
          },
        };
        persist(updated, freeText);
        return updated;
      });
    },
    [freeText, persist]
  );

  // Listen for client-side tile toggles from presentation
  useEffect(() => {
    onClientNeedsToggleRef.current = (tileId: string) => {
      toggleTile(tileId);
    };
    return () => {
      onClientNeedsToggleRef.current = null;
    };
  }, [onClientNeedsToggleRef, toggleTile]);

  const updateNote = (tileId: string, note: string) => {
    setTiles((prev) => {
      const current = prev[tileId] ?? { selected: true, note: '', usageCount: 1 };
      const updated = { ...prev, [tileId]: { ...current, note } };
      persist(updated, freeText);
      return updated;
    });
  };

  const handleFreeText = (value: string) => {
    setFreeText(value);
    persist(tiles, value);
  };

  const selectedCount = selectedTileIds.length;
  const totalCount = allTileIds.length;
  const allSelected = selectedCount === totalCount;

  const toggleAll = useCallback(() => {
    setTiles((prev) => {
      const nowSelect = !allSelected;
      const updated = { ...prev };
      for (const id of allTileIds) {
        const current = updated[id] ?? { selected: false, note: '', usageCount: 0 };
        updated[id] = {
          ...current,
          selected: nowSelect,
          usageCount: nowSelect ? Math.max((current.usageCount || 0), 1) : current.usageCount,
          lastUsedAt: nowSelect ? new Date().toISOString() : current.lastUsedAt,
        };
      }
      persist(updated, freeText);
      return updated;
    });
  }, [allSelected, freeText, persist]);

  const filteredCategories = activeCategory
    ? needsCategories.filter((c) => c.id === activeCategory)
    : needsCategories;

  // ─── PRESENTATION VIEW ─────────────────────────────────────────
  if (isPresentation) {
    const selectedTiles = selectedTileIds.map((id) => tileMap[id]).filter(Boolean);

    return (
      <AppLayout>
        <div className="min-h-screen bg-background">
          <div className="container max-w-2xl py-16 space-y-10">
            {/* Header */}
            <div className="space-y-3 animate-fade-in">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Deine wichtigsten Fragen
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Auf diese Themen legen wir heute den Fokus – weil sie für dich wirklich zählen.
              </p>
            </div>

            {/* Selected tiles */}
            {selectedTiles.length > 0 ? (
              <div className="space-y-3">
                {selectedTiles.map((tile, idx) => (
                  <div
                    key={tile.id}
                    className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border/50 shadow-sm animate-fade-in"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="text-base font-medium text-foreground">{tile.title}</p>
                      {tile.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{tile.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground animate-fade-in">
                <p className="text-lg">Noch keine Themen ausgewählt.</p>
                <p className="text-sm mt-1">Der Berater wählt die relevanten Themen gemeinsam mit dir aus.</p>
              </div>
            )}

            {/* Closing */}
            {selectedTiles.length > 0 && (
              <p className="text-sm text-muted-foreground text-center pt-4 animate-fade-in" style={{ animationDelay: `${selectedTiles.length * 80 + 200}ms` }}>
                Lass uns diese Punkte gemeinsam durchgehen.
              </p>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  // ─── ADMIN VIEW ─────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Was ist dir bei deiner Vorsorge wirklich wichtig?</h1>
                <p className="text-muted-foreground mt-1">
                  Wähle gemeinsam mit dem Kunden die wichtigsten Punkte aus. Mehrfachauswahl möglich.
                </p>
              </div>
              <Button
                variant={allSelected ? 'outline' : 'default'}
                size="sm"
                onClick={toggleAll}
                className="shrink-0 gap-1.5"
              >
                <CheckCheck className="h-4 w-4" />
                {allSelected ? 'Alle abwählen' : 'Alle auswählen'}
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {selectedCount > 0 && (
                <Badge variant="secondary">
                  {selectedCount}/{totalCount} {selectedCount === 1 ? 'Thema' : 'Themen'} ausgewählt
                </Badge>
              )}
              {Object.keys(productScores).length > 0 && (
                <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                  Scoring aktiv
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="container py-8 space-y-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                !activeCategory
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-muted-foreground border-border hover:border-primary/40'
              )}
            >
              Alle
            </button>
            {needsCategories.map((cat) => {
              const catSelectedCount = cat.tiles.filter(
                (t) => tiles[t.id]?.selected
              ).length;
              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setActiveCategory(activeCategory === cat.id ? null : cat.id)
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    activeCategory === cat.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent text-muted-foreground border-border hover:border-primary/40'
                  )}
                >
                  {cat.title}
                  {catSelectedCount > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                      {catSelectedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Categories & Tiles */}
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-3">
              <h2
                className={cn(
                  'text-sm font-semibold uppercase tracking-wide',
                  category.highlight ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {category.title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.tiles.map((tile) => (
                  <TileCard
                    key={tile.id}
                    tile={tile}
                    state={tiles[tile.id] ?? { selected: false, note: '', usageCount: 0 }}
                    highlight={category.highlight}
                    onToggle={() => toggleTile(tile.id)}
                    onNoteChange={(note) => updateNote(tile.id, note)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Free text section */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Weitere Gedanken / individuelle Situation
              </h3>
              <Textarea
                value={freeText}
                onChange={(e) => handleFreeText(e.target.value)}
                placeholder="Persönliche Umstände, emotionale Aussagen, spezielle Wünsche …"
                className="min-h-[120px] resize-none"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

/* ------------------------------------------------------------------ */

interface TileCardProps {
  tile: NeedsTile;
  state: NeedsTileState;
  highlight?: boolean;
  onToggle: () => void;
  onNoteChange: (note: string) => void;
}

function TileCard({ tile, state, highlight, onToggle, onNoteChange }: TileCardProps) {
  const hasTools = tile.linkedTools.length > 0;

  return (
    <Card
      className={cn(
        'group transition-all duration-200 select-none',
        state.selected
          ? 'ring-2 ring-primary bg-primary/5 shadow-md'
          : 'hover:shadow-md hover:border-primary/30',
        highlight && !state.selected && 'border-primary/20'
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Clickable header */}
        <button
          type="button"
          onClick={onToggle}
          className="w-full text-left flex items-start gap-3"
        >
          <div
            className={cn(
              'mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
              state.selected
                ? 'bg-primary border-primary text-primary-foreground scale-110'
                : 'border-muted-foreground/30 text-transparent group-hover:border-primary/50'
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
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
        </button>

        {/* Tool hint (admin only, when selected) */}
        {state.selected && hasTools && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-9">
            <Wrench className="h-3 w-3" />
            <span>
              {tile.linkedTools.length === 1
                ? 'Tool verfügbar'
                : `${tile.linkedTools.length} Tools verfügbar`}
            </span>
          </div>
        )}

        {/* Usage badge */}
        {state.selected && state.usageCount > 1 && (
          <div className="pl-9">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
              {state.usageCount}× genutzt
            </Badge>
          </div>
        )}

        {/* Note field – only shown when selected */}
        {state.selected && (
          <Textarea
            value={state.note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Notiz hinzufügen …"
            className="text-xs min-h-[60px] resize-none"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </CardContent>
    </Card>
  );
}
