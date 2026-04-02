import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle, Building2, FileText, TrendingUp, Wallet,
  Info, CheckCircle2, HelpCircle, ArrowLeft, Download, Loader2,
  BarChart3, Lightbulb, CircleAlert, Calculator, TrendingDown,
  MessageCircleQuestion, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnalysisData, AnalysisResult, AnalysisSection, ScorecardItem, CostPosition } from './types';
import { ReviewRequestForm } from './ReviewRequestForm';
import { MainComparisonChart, DifferenceHighlight, InflationComparisonChart, GrowthCurveChart } from './AnalysisVisualizations';

interface AnalysisScreenProps {
  data: AnalysisData;
  analysisId: string | null;
  onBack: () => void;
  onReset: () => void;
}

function ValueOrUnknown({ value, suffix }: { value: string | number | null; suffix?: string }) {
  if (value === null || value === undefined || value === '') {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground italic text-sm">
        <HelpCircle className="h-3.5 w-3.5" />
        nicht eindeutig erkennbar
      </span>
    );
  }
  return <span className="font-medium text-foreground">{value}{suffix || ''}</span>;
}

function formatCHF(value: number | null): string {
  if (value === null) return '–';
  return `CHF ${Math.round(value).toLocaleString('de-CH')}`;
}

function CostRow({ position }: { position: CostPosition }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground">{position.label}</span>
        {!position.isVerified && position.value !== null && (
          <Badge variant="outline" className="text-xs">unsicher</Badge>
        )}
      </div>
      <div>
        {position.value !== null ? (
          <span className={`text-sm font-medium ${position.isVerified ? 'text-foreground' : 'text-muted-foreground'}`}>
            CHF {position.value.toLocaleString('de-CH')}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-muted-foreground italic text-xs">
            <HelpCircle className="h-3 w-3" />
            nicht verifizierbar
          </span>
        )}
      </div>
    </div>
  );
}

// ── Scorecard ──

const SCORE_COLORS: Record<string, string> = {
  'hoch': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'eher hoch': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'mittel': 'bg-amber-50 text-amber-700 border-amber-200',
  'eher tief': 'bg-orange-50 text-orange-700 border-orange-200',
  'sehr tief': 'bg-red-50 text-red-700 border-red-200',
  'eher unklar und prüfenswert': 'bg-orange-50 text-orange-700 border-orange-200',
  'gemischt': 'bg-amber-50 text-amber-700 border-amber-200',
  'eher solide strukturiert': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'aktuell nur begrenzt beurteilbar': 'bg-slate-100 text-slate-600 border-slate-200',
};

function ScoreCard({ label, item }: { label: string; item: ScorecardItem }) {
  if (!item?.wert) return null;
  const colorClass = SCORE_COLORS[item.wert] || 'bg-muted text-muted-foreground border-border';
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <Badge variant="outline" className={`text-xs ${colorClass}`}>{item.wert}</Badge>
      {item.begruendung && (
        <p className="text-xs text-muted-foreground leading-relaxed">{item.begruendung}</p>
      )}
    </div>
  );
}

// ── Section renderer ──

function SectionCard({ section, icon }: { section?: AnalysisSection; icon: React.ReactNode }) {
  if (!section || !section.inhalt?.length) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {section.titel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {section.inhalt.map((punkt, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              {punkt}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// ── Zahlenübersicht ──

function ZahlenCard({ ar }: { ar: AnalysisResult }) {
  const z = ar.zahlenuebersicht;
  if (!z || (z.gesamteinzahlung === null && z.optimiertes_szenario === null)) return null;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4 text-primary" />
          Zahlenübersicht
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {z.gesamteinzahlung !== null && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Gesamteinzahlung</p>
              <p className="text-lg font-bold text-foreground">{formatCHF(z.gesamteinzahlung)}</p>
            </div>
          )}
          {z.vertrag_prognose !== null && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Vertragsprognose</p>
              <p className="text-lg font-bold text-foreground">{formatCHF(z.vertrag_prognose)}</p>
            </div>
          )}
          {z.optimiertes_szenario !== null && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <p className="text-xs text-muted-foreground mb-1">Optimiertes Szenario (8.5% p.a.)</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{formatCHF(z.optimiertes_szenario)}</p>
            </div>
          )}
          {z.differenz_absolut !== null && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
              <p className="text-xs text-muted-foreground mb-1">Differenz</p>
              <p className="text-lg font-bold text-red-700 dark:text-red-400">
                {formatCHF(z.differenz_absolut)}
                {z.differenz_prozent !== null && (
                  <span className="text-sm font-normal ml-2">({z.differenz_prozent.toFixed(1)}%)</span>
                )}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Inflationssicht ──

function InflationCard({ ar }: { ar: AnalysisResult }) {
  const inf = ar.inflationssicht;
  if (!inf || (inf.realwert_vertrag === null && inf.realwert_optimiert === null)) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingDown className="h-4 w-4 text-amber-600" />
          Kaufkraft nach Inflation (2.4% p.a.)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {inf.realwert_vertrag !== null && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Realer Vertragswert</p>
              <p className="text-lg font-bold text-foreground">{formatCHF(inf.realwert_vertrag)}</p>
            </div>
          )}
          {inf.realwert_optimiert !== null && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <p className="text-xs text-muted-foreground mb-1">Realer optimierter Wert</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{formatCHF(inf.realwert_optimiert)}</p>
            </div>
          )}
        </div>
        {inf.kommentar && (
          <p className="text-sm text-muted-foreground leading-relaxed">{inf.kommentar}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Kritische Fragen ──

function KritischeFragen({ fragen }: { fragen: string[] | null | undefined }) {
  if (!fragen?.length) return null;
  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircleQuestion className="h-4 w-4 text-amber-600" />
          Kritische Fragen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {fragen.map((frage, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-foreground leading-relaxed p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
              <span className="text-amber-600 mt-0.5 shrink-0 font-bold">?</span>
              {frage}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// ── Hauptprobleme ──

function Hauptprobleme({ probleme }: { probleme: string[] | null | undefined }) {
  if (!probleme?.length) return null;
  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="h-4 w-4 text-red-600" />
          Hauptprobleme
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {probleme.map((p, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
              <span className="text-red-500 mt-1.5 shrink-0">•</span>
              {p}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// ── Kostenlogik ──

function KostenlogikHinweise({ hinweise }: { hinweise: string[] | null | undefined }) {
  if (!hinweise?.length) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Info className="h-4 w-4 text-primary" />
          Hinweise zur Kostenlogik
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {hinweise.map((h, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
              <span className="mt-1.5 shrink-0">•</span>
              {h}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  versicherung: 'Versicherungsgebundene Säule 3a',
  bank: 'Banklösung',
  fonds: 'Fondslösung',
  gemischt: 'Gemischte Lösung',
  unbekannt: 'Nicht eindeutig zuordenbar',
};

export function AnalysisScreen({ data, analysisId, onBack, onReset }: AnalysisScreenProps) {
  const ar = data.analysisResult;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Zurück zum Upload
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {ar?.zusammenfassung?.titel || 'Erstanalyse deiner Säule 3a'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {ar?.zusammenfassung?.kurztext || 'Basierend auf den hochgeladenen Dokumenten. Fehlende oder unsichere Daten sind gekennzeichnet.'}
        </p>
      </div>

      {/* Einordnung */}
      {ar?.einordnung && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" />
              Einordnung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Produkttyp</p>
                <ValueOrUnknown value={ar.einordnung.produkttyp} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Struktur</p>
                <ValueOrUnknown value={ar.einordnung.struktur} />
              </div>
              {ar.einordnung.kritische_einordnung && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Kritische Einordnung</p>
                  <p className="text-sm text-foreground leading-relaxed">{ar.einordnung.kritische_einordnung}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scorecard */}
      {ar?.scorecard && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" />
              Bewertung auf einen Blick
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <ScoreCard label="Transparenz" item={ar.scorecard.transparenz} />
              <ScoreCard label="Flexibilität" item={ar.scorecard.flexibilitaet} />
              <ScoreCard label="Kostenklarheit" item={ar.scorecard.kostenklarheit} />
              <ScoreCard label="Anlageklarheit" item={ar.scorecard.anlageklarheit} />
              <div className="sm:col-span-2 lg:col-span-2">
                <ScoreCard label="Gesamteinordnung" item={ar.scorecard.gesamt_einordnung} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Visualisierungen ── */}
      {ar && (
        <>
          <Separator />
          <h3 className="text-lg font-semibold text-foreground">Visualisierung</h3>
          
          {ar.zahlenuebersicht ? (
            <>
              <MainComparisonChart zahlenuebersicht={ar.zahlenuebersicht} />
              <DifferenceHighlight zahlenuebersicht={ar.zahlenuebersicht} />
              <GrowthCurveChart
                zahlenuebersicht={ar.zahlenuebersicht}
                laufzeitJahre={data.remainingYears}
                monatlichBeitrag={data.contributionFrequency === 'monatlich' ? data.contributionAmount : data.contributionAmount ? data.contributionAmount / 12 : null}
              />
            </>
          ) : (
            <ZahlenCard ar={ar} />
          )}

          {ar.inflationssicht ? (
            <InflationComparisonChart inflationssicht={ar.inflationssicht} />
          ) : (
            <InflationCard ar={ar} />
          )}
        </>
      )}

      {/* Kritische Fragen */}
      {ar && <KritischeFragen fragen={ar.kritische_fragen} />}

      {/* Overview (extracted data) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" />
            Übersicht (extrahierte Daten)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Anbieter</p>
              <ValueOrUnknown value={data.provider} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Produktname</p>
              <ValueOrUnknown value={data.productName} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Produkttyp</p>
              <ValueOrUnknown value={data.productType ? PRODUCT_TYPE_LABELS[data.productType] || data.productType : null} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Beitrag</p>
              <ValueOrUnknown
                value={data.contributionAmount ? `CHF ${data.contributionAmount.toLocaleString('de-CH')}` : null}
                suffix={data.contributionFrequency ? ` / ${data.contributionFrequency === 'monatlich' ? 'Monat' : 'Jahr'}` : ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Sections */}
      <SectionCard section={ar?.struktur_analyse} icon={<FileText className="h-4 w-4 text-primary" />} />
      <SectionCard section={ar?.beitrags_und_laufzeit_analyse} icon={<Wallet className="h-4 w-4 text-primary" />} />
      <SectionCard section={ar?.anlage_analyse} icon={<TrendingUp className="h-4 w-4 text-primary" />} />

      {/* Costs (extracted data + AI analysis) */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4 text-primary" />
            Kosten und Gebühren
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <CostRow position={data.costs.acquisition} />
          <CostRow position={data.costs.ongoing} />
          <CostRow position={data.costs.management} />
          <CostRow position={data.costs.fundFees} />
          <CostRow position={data.costs.other} />

          {Object.values(data.costs).some(c => c.value === null) && (
            <>
              <Separator className="my-3" />
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Diese Kostenposition konnte aus den vorhandenen Unterlagen aktuell nicht eindeutig automatisch ermittelt werden.
                </p>
              </div>
            </>
          )}

          {/* AI cost analysis points */}
          {ar?.kosten_analyse?.inhalt?.length ? (
            <>
              <Separator className="my-3" />
              <ul className="space-y-1.5">
                {ar.kosten_analyse.inhalt.map((punkt, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                    <span className="mt-1.5 shrink-0">•</span>
                    {punkt}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Kostenlogik-Hinweise */}
      {ar && <KostenlogikHinweise hinweise={ar.kostenlogik_hinweise} />}

      {/* Hauptprobleme */}
      {ar && <Hauptprobleme probleme={ar.hauptprobleme} />}

      {/* Auffälligkeiten */}
      <SectionCard section={ar?.auffaelligkeiten} icon={<AlertTriangle className="h-4 w-4 text-amber-600" />} />

      {/* Fehlende Daten */}
      <SectionCard section={ar?.fehlende_daten_hinweise} icon={<CircleAlert className="h-4 w-4 text-muted-foreground" />} />

      {/* Ersteinschätzung */}
      {ar?.ersteinschaetzung?.inhalt?.length ? (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {ar.ersteinschaetzung.titel || 'Ersteinschätzung'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {ar.ersteinschaetzung.inhalt.map((punkt, idx) => (
                <li key={idx} className="text-sm text-foreground leading-relaxed flex items-start gap-2">
                  <span className="text-primary mt-1.5 shrink-0">•</span>
                  {punkt}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : data.initialAssessment ? (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Ersteinschätzung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {data.initialAssessment}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Nächste Schritte */}
      <SectionCard section={ar?.naechste_schritte} icon={<Lightbulb className="h-4 w-4 text-primary" />} />

      {/* CTA */}
      <Card>
        <CardContent className="pt-6 pb-6 text-center space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {ar?.cta_hinweis?.titel || 'Vertiefte Analyse möglich'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            {ar?.cta_hinweis?.text || 'Wenn du genau verstehen willst, was in deinem konkreten Fall passiert und wo mögliche Unterschiede entstehen, kann eine persönliche vertiefte Analyse sinnvoll sein.'}
          </p>
        </CardContent>
      </Card>

      {/* Review Request Form */}
      <ReviewRequestForm analysisId={analysisId} />

      {/* Reset */}
      <div className="text-center pt-4">
        <Button variant="outline" onClick={onReset}>
          Neue Analyse starten
        </Button>
      </div>
    </div>
  );
}
