import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  CheckCircle, FileText, Mail, Download, CheckCircle2, XCircle, AlertTriangle,
  Loader2, PenTool, MessageSquare, Lightbulb, ArrowRight, CircleDot,
} from 'lucide-react';
import { useInvestmentConsultationState } from '@/hooks/useInvestmentConsultationState';
import { AutoSaveIndicator } from '@/components/consultation/AutoSaveIndicator';
import { pyramidTopics } from '@/config/pyramidTopicsConfig';
import { needsCategories } from '@/config/investmentNeedsConfig';
import { cn } from '@/lib/utils';

/* ── Tile lookup helpers ── */
const tileMap = Object.fromEntries(
  needsCategories.flatMap((c) => c.tiles.map((t) => [t.id, t]))
);
const tileCategoryMap: Record<string, string> = {};
needsCategories.forEach((cat) => {
  cat.tiles.forEach((t) => { tileCategoryMap[t.id] = cat.title; });
});

/* ── Auto-insight generator ── */
function generateInsights(
  selectedTileIds: string[],
  statuses: Record<string, string>,
  notes: Record<string, string>,
): string[] {
  const insights: string[] = [];
  const categoryHits: Record<string, number> = {};

  selectedTileIds.forEach((id) => {
    const cat = tileCategoryMap[id];
    if (cat) categoryHits[cat] = (categoryHits[cat] ?? 0) + 1;
  });

  // Generate insights from category focus
  if (categoryHits['Vertrauen & Sicherheit'])
    insights.push('Vertrauen und Transparenz waren ein zentrales Thema.');
  if (categoryHits['Kosten & Gebühren'])
    insights.push('Kosten und Gebühren waren wichtig – Transparenz wurde hergestellt.');
  if (categoryHits['Risiko & Sicherheit'])
    insights.push('Risikoverständnis und Sicherheitsbedürfnis wurden geklärt.');
  if (categoryHits['Rendite & Entwicklung'])
    insights.push('Langfristige Entwicklung und Renditeerwartung wurden besprochen.');
  if (categoryHits['Flexibilität & Umsetzung'])
    insights.push('Flexibilität und Zugriff sind dir besonders wichtig.');
  if (categoryHits['Entscheidungsfragen'])
    insights.push('Entscheidungsgrundlagen wurden geschaffen.');

  // Status-based insights
  const resolvedCount = Object.values(statuses).filter((s) => s === 'resolved').length;
  const openCount = Object.values(statuses).filter((s) => s === 'open').length;
  if (resolvedCount === selectedTileIds.length && selectedTileIds.length > 0)
    insights.push('Alle ausgewählten Fragen wurden vollständig geklärt.');
  else if (openCount > 0)
    insights.push(`${openCount} Frage${openCount > 1 ? 'n' : ''} ${openCount > 1 ? 'sind' : 'ist'} noch offen.`);

  return insights.slice(0, 6);
}

export default function InvestmentConsultingSummary() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    topicStates,
    consultationData,
    completeConsultation,
    isLoading,
    currentTitle,
    autoSaveStatus,
    currentConsultationId,
  } = useInvestmentConsultationState();

  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  /* ── Pyramid topic stats (existing) ── */
  const importantTopics = pyramidTopics.filter((t) => topicStates[t.id]?.important);
  const prioritizedTopics = pyramidTopics.filter((t) => topicStates[t.id]?.prioritized);
  const discussedTopics = pyramidTopics.filter((t) => topicStates[t.id]?.discussed);
  const waiverTopics = pyramidTopics.filter((t) => topicStates[t.id]?.waiver);
  const pendingTopics = pyramidTopics.filter(
    (t) => !topicStates[t.id]?.discussed && !topicStates[t.id]?.waiver && topicStates[t.id]?.important
  );

  /* ── Advisor notes from pyramid topics ── */
  const allNotes: { topicTitle: string; relatedTopicTitle: string; notes: string }[] = [];
  pyramidTopics.forEach((topic) => {
    const topicState = topicStates[topic.id];
    if (topicState?.relatedTopicNotes) {
      Object.entries(topicState.relatedTopicNotes).forEach(([relatedTopicId, notes]) => {
        if (notes && notes.trim()) {
          const relatedTopic = topic.relatedTopics.find((rt) => rt.id === relatedTopicId);
          allNotes.push({
            topicTitle: topic.title,
            relatedTopicTitle: relatedTopic?.title || relatedTopicId,
            notes: notes.trim(),
          });
        }
      });
    }
  });

  /* ── Needs / Answers data ── */
  const needsData = (consultationData?.additionalData as any)?.needs as
    | { tiles: Record<string, { selected: boolean; note: string }>; freeText?: string }
    | undefined;

  const answersData = (consultationData?.additionalData as any)?.answers as
    | Record<string, { status: string; note: string }>
    | undefined;

  const selectedTileIds = useMemo(() => {
    if (!needsData?.tiles) return [];
    return Object.entries(needsData.tiles)
      .filter(([, v]) => v.selected)
      .map(([id]) => id);
  }, [needsData]);

  const statuses = useMemo(() => {
    if (!answersData) return {} as Record<string, string>;
    return Object.fromEntries(Object.entries(answersData).map(([k, v]) => [k, v.status]));
  }, [answersData]);

  const answerNotes = useMemo(() => {
    if (!answersData) return {} as Record<string, string>;
    return Object.fromEntries(
      Object.entries(answersData)
        .filter(([, v]) => v.note?.trim())
        .map(([k, v]) => [k, v.note])
    );
  }, [answersData]);

  const resolvedCount = selectedTileIds.filter((id) => statuses[id] === 'resolved').length;
  const partialCount = selectedTileIds.filter((id) => statuses[id] === 'partial').length;
  const openCount = selectedTileIds.filter((id) => !statuses[id] || statuses[id] === 'open').length;

  const insights = useMemo(
    () => generateInsights(selectedTileIds, statuses, answerNotes),
    [selectedTileIds, statuses, answerNotes]
  );

  const handleComplete = async () => {
    setIsCompleting(true);
    await completeConsultation();
    setIsCompleting(false);
    setIsCompleteDialogOpen(false);
    navigate('/app/investment-consulting/start');
  };

  return (
    <AppLayout>
      <div className="container py-6 space-y-6 max-w-5xl">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {t('investmentConsulting.summary', 'Zusammenfassung')}
            </h1>
            <p className="text-muted-foreground mt-1">Übersicht der Beratungsergebnisse</p>
          </div>
          <div className="flex items-center gap-3">
            <AutoSaveIndicator status={autoSaveStatus} title={currentTitle || undefined} />

            <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Beratung abschliessen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Beratung abschliessen</DialogTitle>
                  <DialogDescription>
                    Das Gespräch wird als abgeschlossen markiert. Alle Daten wurden bereits automatisch gespeichert.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>Abbrechen</Button>
                  <Button onClick={handleComplete} disabled={isCompleting}>
                    {isCompleting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Abschliessen…</>
                    ) : (
                      <><CheckCircle className="w-4 h-4 mr-2" />Abschliessen</>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Separator />

        {/* ════════════════════════════════════════════════════
            NEW: Questions & Answers Block
            ════════════════════════════════════════════════════ */}
        {selectedTileIds.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Deine wichtigsten Fragen & Antworten
              </CardTitle>
              <CardDescription>
                {resolvedCount} von {selectedTileIds.length} Fragen geklärt
                {partialCount > 0 && ` · ${partialCount} teilweise`}
                {openCount > 0 && ` · ${openCount} offen`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedTileIds.map((id) => {
                const tile = tileMap[id];
                const status = statuses[id] ?? 'open';
                const note = answerNotes[id];
                const needsNote = needsData?.tiles?.[id]?.note;

                return (
                  <div
                    key={id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                      status === 'resolved' && 'bg-primary/5 border-primary/20',
                      status === 'partial' && 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800',
                      status === 'open' && 'bg-card border-border',
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {status === 'resolved' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                      {status === 'partial' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                      {status === 'open' && <CircleDot className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{tile?.title ?? id}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {tileCategoryMap[id]}
                        </Badge>
                      </div>
                      {(note || needsNote) && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {note || needsNote}
                        </p>
                      )}
                    </div>
                    <span className={cn(
                      'text-xs font-medium shrink-0 mt-0.5',
                      status === 'resolved' && 'text-primary',
                      status === 'partial' && 'text-amber-600',
                      status === 'open' && 'text-muted-foreground',
                    )}>
                      {status === 'resolved' ? 'Geklärt' : status === 'partial' ? 'Teilweise' : 'Offen'}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* ════════════════════════════════════════════════════
            NEW: Auto-generated Insights
            ════════════════════════════════════════════════════ */}
        {insights.length > 0 && (
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                Erkenntnisse aus dem Gespräch
              </CardTitle>
              <CardDescription>Automatisch abgeleitet aus deinen Fragen und Antworten</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* ════════════════════════════════════════════════════
            NEW: Recommendation
            ════════════════════════════════════════════════════ */}
        {selectedTileIds.length > 0 && resolvedCount > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" />
                Empfehlung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground">
                Basierend auf unserem Gespräch und deinen Prioritäten ergibt sich folgendes Vorgehen:
              </p>
              <ul className="space-y-1.5 text-sm">
                {statuses['trust-1'] === 'resolved' && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Vertrauensbasis wurde geschaffen – Grundlage für die Zusammenarbeit steht.</span>
                  </li>
                )}
                {(statuses['costs-1'] === 'resolved' || statuses['costs-2'] === 'resolved') && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Kostenverständnis hergestellt – Transparenz als Basis für die Produktwahl.</span>
                  </li>
                )}
                {(statuses['risk-1'] === 'resolved' || statuses['risk-2'] === 'resolved') && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Risikoverständnis geklärt – passende Strategie kann definiert werden.</span>
                  </li>
                )}
                {(statuses['return-1'] === 'resolved' || statuses['return-2'] === 'resolved') && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Realistische Renditeerwartung gesetzt – langfristige Planung möglich.</span>
                  </li>
                )}
                {openCount > 0 && (
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{openCount} offene Frage{openCount > 1 ? 'n' : ''} sollte{openCount > 1 ? 'n' : ''} noch besprochen werden.</span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* ── Existing: Pyramid Topic Cards ── */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" />Wichtige Themen</CardTitle>
              <CardDescription>{importantTopics.length} Themen als wichtig markiert</CardDescription>
            </CardHeader>
            <CardContent>
              {importantTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine Themen als wichtig markiert</p>
              ) : (
                <ul className="space-y-2">{importantTopics.map((topic) => (
                  <li key={topic.id} className="flex items-center justify-between text-sm">
                    <span>{topic.title}</span>
                    {topicStates[topic.id]?.discussed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </li>
                ))}</ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" />Priorisierte Themen</CardTitle>
              <CardDescription>{prioritizedTopics.length} Themen priorisiert</CardDescription>
            </CardHeader>
            <CardContent>
              {prioritizedTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine Themen priorisiert</p>
              ) : (
                <ul className="space-y-2">{prioritizedTopics.map((topic) => (
                  <li key={topic.id} className="flex items-center justify-between text-sm">
                    <span>{topic.title}</span>
                    {topicStates[topic.id]?.discussed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Badge variant="outline" className="text-xs">Ausstehend</Badge>}
                  </li>
                ))}</ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" />Besprochene Themen</CardTitle>
              <CardDescription>{discussedTopics.length} von {pyramidTopics.length} Themen besprochen</CardDescription>
            </CardHeader>
            <CardContent>
              {discussedTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Themen besprochen</p>
              ) : (
                <ul className="space-y-2">{discussedTopics.map((topic) => <li key={topic.id} className="text-sm">{topic.title}</li>)}</ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><XCircle className="w-4 h-4 text-muted-foreground" />Beratungsverzicht</CardTitle>
              <CardDescription>{waiverTopics.length} Themen mit Verzicht</CardDescription>
            </CardHeader>
            <CardContent>
              {waiverTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground">Kein Beratungsverzicht erklärt</p>
              ) : (
                <ul className="space-y-2">{waiverTopics.map((topic) => <li key={topic.id} className="text-sm text-muted-foreground">{topic.title}</li>)}</ul>
              )}
            </CardContent>
          </Card>
        </div>

        {pendingTopics.length > 0 && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400"><AlertTriangle className="w-5 h-5" />Offene wichtige Themen</CardTitle>
              <CardDescription className="text-amber-600 dark:text-amber-500">Diese wichtigen Themen wurden noch nicht besprochen</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">{pendingTopics.map((topic) => <li key={topic.id} className="text-sm">{topic.title}</li>)}</ul>
            </CardContent>
          </Card>
        )}

        {allNotes.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><PenTool className="w-4 h-4 text-primary" />Daten für Berater</CardTitle>
              <CardDescription>Freihandnotizen aus der Beratung ({allNotes.length} Einträge)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">{allNotes.map((note, index) => (
                <li key={index} className="border-l-2 border-primary/30 pl-4">
                  <div className="text-xs text-muted-foreground mb-1">{note.topicTitle} → {note.relatedTopicTitle}</div>
                  <p className="text-sm whitespace-pre-wrap">{note.notes}</p>
                </li>
              ))}</ul>
            </CardContent>
          </Card>
        )}

        {/* ════════════════════════════════════════════════════
            NEW: Next Steps
            ════════════════════════════════════════════════════ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-primary" />
              Nächste Schritte
            </CardTitle>
            <CardDescription>Wie möchtest du weitermachen?</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/app/investment-consulting/answers')}>
              <MessageSquare className="w-4 h-4 mr-2" />
              {openCount > 0 ? 'Offene Fragen klären' : 'Details nochmals ansehen'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/app/investment-consulting/needs')}>
              Fragen anpassen
            </Button>
          </CardContent>
        </Card>

        {/* ── Existing: Export ── */}
        <Card>
          <CardHeader>
            <CardTitle>Export & Weiterverarbeitung</CardTitle>
            <CardDescription>Nutzen Sie die gespeicherten Daten für Dokumente und Kommunikation</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" disabled><FileText className="w-4 h-4 mr-2" />PDF generieren<Badge variant="secondary" className="ml-2 text-xs">Bald verfügbar</Badge></Button>
            <Button variant="outline" disabled><Mail className="w-4 h-4 mr-2" />E-Mail senden<Badge variant="secondary" className="ml-2 text-xs">Bald verfügbar</Badge></Button>
            <Button variant="outline" disabled><Download className="w-4 h-4 mr-2" />Daten exportieren<Badge variant="secondary" className="ml-2 text-xs">Bald verfügbar</Badge></Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
