import { useState, useMemo } from 'react';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { useToolSnapshots, ToolSnapshot } from '@/hooks/useToolSnapshots';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Archive, Trash2, GitCompareArrows, ArrowLeft, Clock, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function getKeyResult(snap: ToolSnapshot): string {
  const d = snap.snapshot_data as Record<string, any>;
  // Try common result keys
  if (d.keyResult) return String(d.keyResult);
  if (d.result?.label) return String(d.result.label);
  if (d.output?.summary) return String(d.output.summary);
  // Fallback: show first string value
  const firstVal = Object.values(d).find(v => typeof v === 'string' && v.length > 2 && v.length < 80);
  return firstVal ? String(firstVal) : 'Ergebnis gespeichert';
}

export default function ClientPortalToolArchive() {
  const { snapshots, isLoading, deleteSnapshot } = useToolSnapshots();
  const [toolFilter, setToolFilter] = useState<string>('all');
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Unique tools for filter dropdown
  const uniqueTools = useMemo(() => {
    const map = new Map<string, string>();
    snapshots.forEach(s => map.set(s.tool_slug, s.tool_name));
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [snapshots]);

  const filtered = toolFilter === 'all' ? snapshots : snapshots.filter(s => s.tool_slug === toolFilter);

  const toggleSelect = (id: string, toolSlug: string) => {
    if (!compareMode) return;
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      // Only allow selecting same tool
      const existing = snapshots.find(s => s.id === prev[0]);
      if (prev.length > 0 && existing?.tool_slug !== toolSlug) return prev;
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const comparisonPair = useMemo(() => {
    if (selected.length !== 2) return null;
    const a = snapshots.find(s => s.id === selected[0]);
    const b = snapshots.find(s => s.id === selected[1]);
    if (!a || !b) return null;
    return [a, b] as const;
  }, [selected, snapshots]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Archive className="h-5 w-5 text-primary" />
              Mein Archiv
            </h1>
            <p className="text-sm text-muted-foreground">Alle gespeicherten Tool-Ergebnisse</p>
          </div>
          <Button
            variant={compareMode ? 'default' : 'outline'}
            size="sm"
            className="gap-1.5"
            onClick={() => { setCompareMode(!compareMode); setSelected([]); }}
          >
            <GitCompareArrows className="h-3.5 w-3.5" />
            Vergleichen
          </Button>
        </div>

        {/* Filter */}
        <Select value={toolFilter} onValueChange={setToolFilter}>
          <SelectTrigger className="w-full h-9 rounded-xl bg-muted/50">
            <SelectValue placeholder="Alle Tools" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Tools</SelectItem>
            {uniqueTools.map(t => (
              <SelectItem key={t.slug} value={t.slug}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {compareMode && (
          <p className="text-xs text-muted-foreground text-center">
            Wähle 2 Ergebnisse desselben Tools zum Vergleichen.
            {selected.length > 0 && ` (${selected.length}/2 ausgewählt)`}
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Archive className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Noch keine Ergebnisse gespeichert</p>
            <p className="text-xs text-muted-foreground mt-1">Nutze die Werkzeuge und speichere deine Ergebnisse.</p>
          </div>
        )}

        {/* Snapshot list */}
        <div className="space-y-2">
          {filtered.map((snap, i) => {
            const isSelected = selected.includes(snap.id);
            const isExpanded = expandedId === snap.id;
            return (
              <motion.div
                key={snap.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-all",
                    isSelected && "ring-2 ring-primary",
                    compareMode && "hover:ring-1 hover:ring-primary/50"
                  )}
                  onClick={() => compareMode ? toggleSelect(snap.id, snap.tool_slug) : setExpandedId(isExpanded ? null : snap.id)}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{snap.tool_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" /> {formatDate(snap.created_at)}
                        </p>
                      </div>
                      {!compareMode && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); deleteSnapshot.mutate(snap.id); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{getKeyResult(snap)}</p>
                    {snap.peak_score_effect != null && snap.peak_score_effect > 0 && (
                      <p className="text-xs text-primary flex items-center gap-1">
                        <Flame className="h-3 w-3" /> PeakScore-Effekt: +{snap.peak_score_effect.toFixed(1)} Monate
                      </p>
                    )}
                    {isExpanded && !compareMode && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 p-3 bg-muted/30 rounded-lg"
                      >
                        <p className="text-xs font-medium text-muted-foreground mb-2">Vollständige Daten:</p>
                        <pre className="text-[11px] text-foreground/80 whitespace-pre-wrap break-all overflow-hidden max-h-64 overflow-y-auto">
                          {JSON.stringify(snap.snapshot_data, null, 2)}
                        </pre>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison view */}
        {compareMode && comparisonPair && (
          <Card className="border-primary/20">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-center text-foreground">Vergleich: {comparisonPair[0].tool_name}</p>
              <div className="grid grid-cols-2 gap-3">
                {comparisonPair.map((snap, idx) => (
                  <div key={snap.id} className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground text-center">
                      {formatDate(snap.created_at)}
                    </p>
                    <ComparisonData data={snap.snapshot_data} other={comparisonPair[1 - idx].snapshot_data} />
                    {snap.peak_score_effect != null && (
                      <p className="text-xs text-primary text-center">+{snap.peak_score_effect.toFixed(1)} PS</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ClientPortalLayout>
  );
}

/** Renders comparison data with color-coded deltas */
function ComparisonData({ data, other }: { data: Record<string, unknown>; other: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([, v]) => typeof v === 'number' || typeof v === 'string');

  return (
    <div className="space-y-1 text-xs">
      {entries.slice(0, 10).map(([key, val]) => {
        const otherVal = other[key];
        let deltaClass = '';
        if (typeof val === 'number' && typeof otherVal === 'number') {
          deltaClass = val > otherVal ? 'text-emerald-500' : val < otherVal ? 'text-destructive' : '';
        }
        return (
          <div key={key} className="flex justify-between gap-1">
            <span className="text-muted-foreground truncate">{key}</span>
            <span className={cn("font-medium", deltaClass)}>
              {typeof val === 'number' ? val.toLocaleString('de-CH') : String(val).slice(0, 30)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
