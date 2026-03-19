import { useState, useCallback, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { needsCategories, NeedsTile } from '@/config/investmentNeedsConfig';
import { useInvestmentConsultationState } from '@/hooks/useInvestmentConsultationState';
import { useSectionBroadcast } from '@/hooks/useSectionBroadcast';
import { CheckCircle2, MessageSquare } from 'lucide-react';

/** Local state shape for a single tile */
interface TileState {
  selected: boolean;
  note: string;
}

export default function InvestmentConsultingNeeds() {
  const { consultationData, updateData: ctxUpdate } = useInvestmentConsultationState();

  // Local state – will be persisted into consultationData.additionalData.needs
  const [tiles, setTiles] = useState<Record<string, TileState>>(() => {
    const saved = (consultationData?.additionalData as any)?.needs?.tiles as Record<string, TileState> | undefined;
    return saved ?? {};
  });
  const [freeText, setFreeText] = useState<string>(() => {
    return ((consultationData?.additionalData as any)?.needs?.freeText as string) ?? '';
  });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const selectedTileIds = useMemo(() => {
    return Object.entries(tiles).filter(([, v]) => v.selected).map(([id]) => id);
  }, [tiles]);

  const selectedTileNames = useMemo(() => {
    const tileMap = Object.fromEntries(
      needsCategories.flatMap((c) => c.tiles.map((t) => [t.id, t.title]))
    );
    return selectedTileIds.map((id) => tileMap[id] ?? id);
  }, [selectedTileIds]);

  useSectionBroadcast({
    section: 'needs',
    title: 'Deine wichtigsten Fragen',
    subtitle: selectedTileIds.length > 0 ? `${selectedTileIds.length} Themen ausgewählt` : 'Welche Themen sind dir besonders wichtig?',
    items: selectedTileNames,
    extra: { selectedTileIds },
  });

  // Persist into consultation context whenever state changes
  const persist = useCallback((newTiles: Record<string, TileState>, newFreeText: string) => {
    if (ctxUpdate) {
      ctxUpdate((prev) => ({
        ...prev,
        additionalData: {
          ...prev.additionalData,
          needs: { tiles: newTiles, freeText: newFreeText },
        },
      }));
    }
  }, [ctxUpdate]);

  const toggleTile = (tileId: string) => {
    setTiles((prev) => {
      const current = prev[tileId] ?? { selected: false, note: '' };
      const updated = { ...prev, [tileId]: { ...current, selected: !current.selected } };
      persist(updated, freeText);
      return updated;
    });
  };

  const updateNote = (tileId: string, note: string) => {
    setTiles((prev) => {
      const current = prev[tileId] ?? { selected: true, note: '' };
      const updated = { ...prev, [tileId]: { ...current, note } };
      persist(updated, freeText);
      return updated;
    });
  };

  const handleFreeText = (value: string) => {
    setFreeText(value);
    persist(tiles, value);
  };

  const selectedCount = Object.values(tiles).filter((t) => t.selected).length;

  const filteredCategories = activeCategory
    ? needsCategories.filter((c) => c.id === activeCategory)
    : needsCategories;

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container py-6">
            <h1 className="text-2xl font-bold">Was ist dir bei deiner Vorsorge wirklich wichtig?</h1>
            <p className="text-muted-foreground mt-1">
              Wähle gemeinsam mit dem Kunden die wichtigsten Punkte aus. Mehrfachauswahl möglich.
            </p>
            {selectedCount > 0 && (
              <Badge variant="secondary" className="mt-3">
                {selectedCount} {selectedCount === 1 ? 'Thema' : 'Themen'} ausgewählt
              </Badge>
            )}
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
                  ? 'bg-scale-6 text-white border-scale-6'
                  : 'bg-transparent text-muted-foreground border-border hover:border-scale-5'
              )}
            >
              Alle
            </button>
            {needsCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  activeCategory === cat.id
                    ? 'bg-scale-6 text-white border-scale-6'
                    : 'bg-transparent text-muted-foreground border-border hover:border-scale-5'
                )}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Categories & Tiles */}
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-3">
              <h2 className={cn(
                'text-sm font-semibold uppercase tracking-wide',
                category.highlight ? 'text-scale-8' : 'text-muted-foreground'
              )}>
                {category.title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.tiles.map((tile) => (
                  <TileCard
                    key={tile.id}
                    tile={tile}
                    state={tiles[tile.id] ?? { selected: false, note: '' }}
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
                <MessageSquare className="h-4 w-4 text-scale-6" />
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
  state: TileState;
  highlight?: boolean;
  onToggle: () => void;
  onNoteChange: (note: string) => void;
}

function TileCard({ tile, state, highlight, onToggle, onNoteChange }: TileCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all select-none',
        state.selected
          ? 'ring-2 ring-scale-6 bg-scale-1/40'
          : 'hover:shadow-md',
        highlight && !state.selected && 'border-scale-4'
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Clickable header area */}
        <button
          type="button"
          onClick={onToggle}
          className="w-full text-left flex items-start gap-3"
        >
          <div className={cn(
            'mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
            state.selected
              ? 'bg-scale-6 border-scale-6 text-white'
              : 'border-scale-4 text-transparent'
          )}>
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
