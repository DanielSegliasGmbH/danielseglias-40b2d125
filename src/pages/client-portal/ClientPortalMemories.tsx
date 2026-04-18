import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/PageTransition';
import { useNavigate } from 'react-router-dom';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { PageHeader } from '@/components/client-portal/PageHeader';
import { useMemories, Memory } from '@/hooks/useMemories';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Clock, RotateCcw, Trash2, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const TOOL_LABELS: Record<string, string> = {
  'inflationsrechner': 'Inflationsrechner',
  'finanzcheck': 'Finanzcheck',
  'mini-3a-kurzcheck': 'Mini 3a-Kurzcheck',
  'tragbarkeitsrechner': 'Tragbarkeitsrechner',
  'kosten-impact-simulator': 'Kosten-Impact-Simulator',
  'vergleichsrechner-3a': 'Vergleichsrechner 3a',
  'verlustrechner-3a': 'Verlustrechner 3a',
  'rendite-risiko': 'Rendite-Risiko',
  'vorsorgecheck': 'Vorsorgecheck',
  'rolex-rechner': 'Rolex-Rechner',
  'was-kostet-das-wirklich': 'Was kostet das wirklich?',
  'guilty-pleasure-rechner': 'Guilty Pleasure Rechner',
  'notfall-check': 'Notfall-Check',
  'abo-audit': 'Abo-Audit',
  'lohnerhoher': 'Lohnerhöher',
  'mein-finanzplan': 'Mein Finanzplan',
  'konten-modell': 'Konten-Modell',
  'humankapital': 'Humankapital',
  'steuerrechner': 'Steuerrechner Schweiz',
  'ahv-tracker': 'AHV-Tracker',
  'krankenkassen-tracker': 'Krankenkassen-Tracker',
  'sozialabgaben-uebersicht': 'Sozialabgaben-Übersicht',
  'lebenserwartung': 'Lebenserwartung',
  'lebenzeit-rechner': 'Lebenszeit-Rechner',
  'recovery-analyse': 'Recovery-Analyse',
  'zeitverlust-simulator': 'Zeitverlust-Simulator',
  'wahrscheinlichkeitsrechner': 'Wahrscheinlichkeitsrechner',
  'sicherheitsvergleich': 'Sicherheitsvergleich',
  'kostenaufschluesselung': 'Kostenaufschlüsselung',
  'transparenz-check': 'Transparenz-Check',
  'zufalls-realitaets-check': 'Zufalls-Realitäts-Check',
};

function getToolLabel(slug: string): string {
  return TOOL_LABELS[slug] || slug;
}

function groupByDate(memories: Memory[]): { label: string; date: string; items: Memory[] }[] {
  const groups: Record<string, Memory[]> = {};
  for (const m of memories) {
    const dateKey = format(parseISO(m.created_at), 'yyyy-MM-dd');
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(m);
  }
  return Object.entries(groups).map(([dateKey, items]) => {
    const d = parseISO(dateKey);
    let label = format(d, 'EEEE, d. MMMM yyyy', { locale: de });
    if (isToday(d)) label = 'Heute';
    else if (isYesterday(d)) label = 'Gestern';
    return { label, date: dateKey, items };
  });
}

export default function ClientPortalMemories() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [toolFilter, setToolFilter] = useState<string>('all');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const { memories, totalCount, isLoading, page, setPage, pageSize, hasMore, deleteMemory } = useMemories({
    toolFilter: toolFilter === 'all' ? undefined : toolFilter,
    search: search || undefined,
  });

  const groups = groupByDate(memories);

  // Get unique tool slugs for filter
  const uniqueTools = [...new Set(memories.map(m => m.tool_slug))];

  const handleReopen = (memory: Memory) => {
    const params = new URLSearchParams();
    params.set('memoryId', memory.id);
    navigate(`/app/client-portal/tools/${memory.tool_slug}?${params.toString()}`);
  };

  return (
    <ClientPortalLayout>
      <div className="w-full max-w-2xl mx-auto space-y-5 overflow-x-hidden px-1">
      <PageHeader title={`📜 ${t('clientPortal.activityTitle', 'Mein Verlauf')}`} subtitle="Deine letzten Aktivitäten und Meilensteine" />
      <p className="text-sm text-muted-foreground mb-6">{t('clientPortal.activityDesc', 'Deine letzten Aktivitäten in der App.')}</p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={toolFilter} onValueChange={setToolFilter}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Alle Tools" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Tools</SelectItem>
            {uniqueTools.map(slug => (
              <SelectItem key={slug} value={slug}>{getToolLabel(slug)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : memories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Noch keine Erinnerungen</h3>
            <p className="text-sm text-muted-foreground">
              Nutze Tools und deine Aktivitäten werden hier automatisch gespeichert.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map(group => (
            <div key={group.date}>
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {group.label}
                </h3>
              </div>
              <div className="space-y-2">
                {group.items.map(memory => (
                  <Card
                    key={memory.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedMemory(memory)}
                  >
                    <CardContent className="py-3 px-4 flex items-center gap-3">
                      <div className="w-14 text-xs text-muted-foreground font-mono shrink-0">
                        {format(parseISO(memory.created_at), 'HH:mm')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">
                            {memory.title || memory.action}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {getToolLabel(memory.tool_slug)}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {memory.action}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalCount > pageSize && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Zurück
              </Button>
              <span className="text-sm text-muted-foreground">
                {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalCount)} von {totalCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasMore}
                onClick={() => setPage(p => p + 1)}
              >
                Weiter <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedMemory} onOpenChange={open => !open && setSelectedMemory(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base">
              {selectedMemory?.title || selectedMemory?.action}
            </DialogTitle>
          </DialogHeader>
          {selectedMemory && (
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 pb-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{format(parseISO(selectedMemory.created_at), 'dd.MM.yyyy, HH:mm', { locale: de })}</span>
                  <Badge variant="outline">{getToolLabel(selectedMemory.tool_slug)}</Badge>
                </div>

                <Separator />

                {/* Input Data */}
                {selectedMemory.input_data && Object.keys(selectedMemory.input_data).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Eingaben</h4>
                    <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                      {Object.entries(selectedMemory.input_data).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="text-foreground font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Output Data */}
                {selectedMemory.output_data && Object.keys(selectedMemory.output_data).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Ergebnisse</h4>
                    <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                      {Object.entries(selectedMemory.output_data).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="text-foreground font-medium">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex gap-2">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => {
                      handleReopen(selectedMemory);
                      setSelectedMemory(null);
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Erneut öffnen
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      deleteMemory.mutate(selectedMemory.id);
                      setSelectedMemory(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </ClientPortalLayout>
  );
}
