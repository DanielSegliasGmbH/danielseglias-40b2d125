import { PdfExportWrapper } from '../PdfExportWrapper';
import { ToolNextStep } from '../ToolNextStep';
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle, ChevronRight, BookOpen, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea, CartesianGrid } from 'recharts';
import { CRISES, CrisisEvent, generateLongTermSeries, SOURCES } from './crisisData';

interface Props {
  mode?: 'internal' | 'public';
}

export function RecoveryAnalyseTool({ mode = 'internal' }: Props) {
  const [selectedCrisis, setSelectedCrisis] = useState<CrisisEvent>(CRISES[4]); // Default: Finanzkrise
  const [viewMode, setViewMode] = useState<'overview' | 'zoom'>('overview');
  const isAdmin = mode === 'internal';

  const longTermData = useMemo(() => generateLongTermSeries(), []);

  // Zoom data: ±10 years around crisis
  const zoomData = useMemo(() => {
    const start = selectedCrisis.peakYear - 5;
    const end = selectedCrisis.recoveryYear + 8;
    return longTermData.filter(d => d.year >= start && d.year <= end);
  }, [selectedCrisis, longTermData]);

  const chartData = viewMode === 'zoom' ? zoomData : longTermData;

  const formatValue = (v: number) => v.toLocaleString('de-CH', { maximumFractionDigits: 0 });

  return (
    <PdfExportWrapper toolName="Recovery-Analyse" hideExport={mode === 'public'}>
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground leading-tight">
          Recovery-Analyse Weltaktienmarkt
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Wie lange brauchte ein breit diversifizierter Weltaktienmarkt historisch, um sich nach grossen Krisen wieder zu erholen?
        </p>
      </div>

      {/* Info Box */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4 flex gap-3 items-start">
          <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Als Grundlage dient eine historische Rekonstruktion des globalen Aktienmarkts für die Langfrist-Historie sowie ein moderner marktkapitalisierungsorientierter Weltaktienindex als heutige Referenz. So wird sichtbar, wie sich breite Weltaktienmärkte in grossen Krisen entwickelt und wie lange sie bis zur Erholung gebraucht haben.
          </p>
        </CardContent>
      </Card>

      {/* Crisis Cards */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Historische Krisen</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CRISES.map(crisis => (
            <button
              key={crisis.id}
              onClick={() => { setSelectedCrisis(crisis); setViewMode('zoom'); }}
              className={`text-left rounded-xl border p-3 transition-all duration-200 hover:shadow-md active:scale-[0.97] ${
                selectedCrisis.id === crisis.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground">{crisis.peakYear}</p>
              <p className="text-sm font-semibold text-foreground mt-1 leading-snug">{crisis.name}</p>
              <p className="text-lg font-bold text-destructive mt-2">{crisis.drawdownPct}%</p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Crisis Detail */}
      <Card>
        <CardContent className="py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-foreground">{selectedCrisis.name}</h3>
                <Badge variant="outline">{selectedCrisis.peakYear}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{selectedCrisis.shortDescription}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                onClick={() => setViewMode('overview')}
              >
                Gesamtübersicht
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'zoom' ? 'default' : 'outline'}
                onClick={() => setViewMode('zoom')}
              >
                Krisen-Zoom
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard
              icon={<TrendingDown className="h-4 w-4 text-destructive" />}
              label="Max. Verlust"
              value={`${selectedCrisis.drawdownPct}%`}
              color="text-destructive"
            />
            <MetricCard
              icon={<Clock className="h-4 w-4 text-orange-500" />}
              label="Peak → Tief"
              value={`${selectedCrisis.peakToTroughMonths} Monate`}
              color="text-orange-500"
            />
            <MetricCard
              icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
              label="Peak → Recovery"
              value={`${selectedCrisis.peakToRecoveryMonths} Monate`}
              color="text-amber-500"
            />
            <MetricCard
              icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}
              label="Tief → Recovery"
              value={`${selectedCrisis.troughToRecoveryMonths} Monate`}
              color="text-emerald-600"
            />
          </div>

          {/* Chart */}
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                  scale="log"
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  formatter={(value: number) => [formatValue(value), 'Index']}
                  labelFormatter={(label) => `Jahr ${label}`}
                />
                {/* Highlight crisis period */}
                <ReferenceArea
                  x1={selectedCrisis.peakYear}
                  x2={selectedCrisis.recoveryYear}
                  fill="hsl(var(--destructive))"
                  fillOpacity={0.06}
                />
                <ReferenceLine
                  x={selectedCrisis.peakYear}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <ReferenceLine
                  x={selectedCrisis.troughYear}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                />
                <ReferenceLine
                  x={selectedCrisis.recoveryYear}
                  stroke="hsl(var(--primary))"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-destructive inline-block" style={{ borderTop: '2px dashed' }} /> Peak / Tief
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-primary inline-block" style={{ borderTop: '2px dashed' }} /> Recovery
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-3 bg-destructive/10 inline-block rounded" /> Krisenphase
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Insight Box */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="py-5 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <h4 className="font-semibold text-foreground">Investiert geblieben</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Wenn du investiert geblieben wärst, hättest du historisch nach <strong className="text-foreground">{Math.round(selectedCrisis.peakToRecoveryMonths / 12 * 10) / 10} Jahren</strong> dein vorheriges Niveau wieder erreicht.
            </p>
          </CardContent>
        </Card>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="py-5 space-y-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <h4 className="font-semibold text-foreground">Am Tief verkauft</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Wenn du am Tiefpunkt verkauft hättest, wäre der Verlust von <strong className="text-destructive">{selectedCrisis.drawdownPct}%</strong> realisiert worden – ohne Chance auf Erholung.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Progress Visual */}
      <Card>
        <CardContent className="py-5 space-y-4">
          <h4 className="font-semibold text-foreground">Recovery-Verlauf: {selectedCrisis.name}</h4>
          <p className="text-sm text-muted-foreground">{selectedCrisis.detailDescription}</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Peak ({selectedCrisis.peakYear})</span>
              <span>Tief ({selectedCrisis.troughYear})</span>
              <span>Recovery ({selectedCrisis.recoveryYear})</span>
            </div>
            <div className="relative">
              <Progress value={100} className="h-3 bg-destructive/20" />
              <div
                className="absolute top-0 left-0 h-3 rounded-full bg-emerald-500 transition-all duration-700"
                style={{
                  width: `${(selectedCrisis.troughToRecoveryMonths / selectedCrisis.peakToRecoveryMonths) * 100}%`,
                  marginLeft: `${(selectedCrisis.peakToTroughMonths / selectedCrisis.peakToRecoveryMonths) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-destructive font-medium">Verlust: {selectedCrisis.drawdownPct}%</span>
              <span className="text-emerald-600 font-medium">Erholung: {selectedCrisis.troughToRecoveryMonths} Monate</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin: Conversation Guide */}
      {isAdmin && (
        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="py-5 space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-600" />
              <h4 className="font-semibold text-foreground">Interner Gesprächsleitfaden</h4>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
              <li>Krisen <strong>nicht verharmlosen</strong> – ehrlich sagen, dass sie schmerzhaft sein können.</li>
              <li>Dann zeigen, wie breit diversifizierte Märkte <strong>historisch reagiert</strong> haben.</li>
              <li>Fokus auf <strong>Zeit, Diversifikation und Verhalten</strong>.</li>
              <li>Zentrale Botschaft: «Die grössten Schäden entstehen oft nicht durch den Crash selbst, sondern durch <strong>falsches Verhalten</strong> im Crash.»</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Closing Statement */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6 text-center space-y-3">
          <TrendingUp className="h-8 w-8 text-primary mx-auto" />
          <p className="text-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Krisen gehören zum Aktienmarkt dazu. Die historische Betrachtung zeigt jedoch, dass ein breit diversifizierter Weltaktienmarkt bisher nicht an einzelnen Krisen gescheitert ist – entscheidend war vor allem, investiert zu bleiben und nicht im falschen Moment auszusteigen.
          </p>
        </CardContent>
      </Card>

      {/* Sources Accordion */}
      <Accordion type="single" collapsible>
        <AccordionItem value="sources">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Quellen & Methodik
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="space-y-3">
              {SOURCES.map(s => (
                <div key={s.name}>
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-xs text-muted-foreground">
              <p>⚠️ Historische Daten dienen der Einordnung, nicht der Zukunftsgarantie.</p>
              <p>Recovery-Daten sind kursbasiert (nominal, ohne Dividendenreinvestition) und teilweise annualisiert/periodisiert.</p>
              <p>Die Langfrist-Serie ist eine stilisierte Rekonstruktion zur Visualisierung – keine tagesgenaue historische Abbildung.</p>
            </div>

            {isAdmin && (
              <div className="border-t pt-3 space-y-2">
                <p className="text-xs font-medium text-amber-600">Admin: Methodische Hinweise</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                  <li>Drawdown-Zahlen beziehen sich auf den breiten, marktkapitalisierungsgewichteten Weltaktienmarkt.</li>
                  <li>Vor 1970: DMS-Rekonstruktion. Ab 1970: MSCI World / MSCI ACWI als Proxy.</li>
                  <li>Recovery = Zeitspanne vom Peak bis zum erneuten Erreichen des Vorkrisenniveaus (nominal, Price Return).</li>
                  <li>Einzelne Krisen können je nach Quelle leicht abweichende Drawdown-Werte aufweisen.</li>
                </ul>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
    </PdfExportWrapper>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border bg-card p-3 space-y-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
