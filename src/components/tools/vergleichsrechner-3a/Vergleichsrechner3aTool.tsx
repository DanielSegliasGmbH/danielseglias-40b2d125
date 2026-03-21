import { PdfExportWrapper } from '../PdfExportWrapper';
import { ToolNextStep } from '../ToolNextStep';
import { ToolReflection, ToolTrustNote, ToolSoftCta } from '../ToolConversionElements';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Info,
  ChevronDown,
  AlertTriangle,
  Sparkles,
  Heart,
  Home,
  Clock,
  Briefcase,
} from 'lucide-react';
import { scenario, solveRateForTarget, formatCHF, type ScenarioInputs } from './calcLogic';

/* ─── helpers ─── */
function useNum(initial: number) {
  const [raw, setRaw] = useState(String(initial));
  const value = parseFloat(raw) || 0;
  return { raw, setRaw, value } as const;
}

const MEDIAN_YEARLY_INCOME = 88_000;

function lifeImpact(diff: number) {
  const workYears = diff / MEDIAN_YEARLY_INCOME;
  const monthSalaries = diff / (MEDIAN_YEARLY_INCOME / 12);
  const earlyRetireMonths = diff / (MEDIAN_YEARLY_INCOME / 12);
  const homePercent = (diff / 200_000) * 100; // 200k = avg down-payment
  const freedomYears = diff / (MEDIAN_YEARLY_INCOME * 0.7); // 70% living cost
  return { workYears, monthSalaries, earlyRetireMonths, homePercent, freedomYears };
}

/* ─── Component ─── */
export function Vergleichsrechner3aTool() {
  const [showInputs, setShowInputs] = useState(true);
  const [showSources, setShowSources] = useState(false);

  // Shared
  const startkapital = useNum(50000);
  const monatlicheRate = useNum(587);
  const laufzeit = useNum(20);
  const rueckaufswert = useNum(40000);

  // Alt
  const altRendite = useNum(4.0);
  const altTer = useNum(1.2);
  const altProd = useNum(1.5);
  const altAA = useNum(3.0);
  const altRueckk = useNum(0);
  const altMantel = useNum(0.5);
  const altFee = useNum(5000);

  // Neu
  const neuRendite = useNum(9.7);
  const neuTer = useNum(0);
  const neuProd = useNum(0.5);
  const neuAA = useNum(0);
  const neuRueckk = useNum(0);
  const neuMantel = useNum(0);
  const neuFee = useNum(15000);

  const altResult = useMemo(() => scenario({
    r: altRendite.value, ter: altTer.value, prod: altProd.value,
    aa: altAA.value, rueckk: altRueckk.value, mantel: altMantel.value,
    fee: altFee.value, start: startkapital.value, rate: monatlicheRate.value,
    years: laufzeit.value,
  }), [startkapital.value, monatlicheRate.value, laufzeit.value,
    altRendite.value, altTer.value, altProd.value, altAA.value,
    altRueckk.value, altMantel.value, altFee.value]);

  const neuResult = useMemo(() => scenario({
    r: neuRendite.value, ter: neuTer.value, prod: neuProd.value,
    aa: neuAA.value, rueckk: neuRueckk.value, mantel: neuMantel.value,
    fee: neuFee.value, start: rueckaufswert.value, rate: monatlicheRate.value,
    years: laufzeit.value,
  }), [rueckaufswert.value, monatlicheRate.value, laufzeit.value,
    neuRendite.value, neuTer.value, neuProd.value, neuAA.value,
    neuRueckk.value, neuMantel.value, neuFee.value]);

  const diff = neuResult.endPayout - altResult.endPayout;
  const isNeuBetter = diff > 0;
  const absDiff = Math.abs(diff);

  const targetRate = useMemo(() => {
    if (!isNeuBetter) return monatlicheRate.value;
    return solveRateForTarget(altResult.endPayout, {
      r: neuRendite.value, ter: neuTer.value, prod: neuProd.value,
      aa: neuAA.value, rueckk: neuRueckk.value, mantel: neuMantel.value,
      fee: neuFee.value, start: rueckaufswert.value, years: laufzeit.value,
    });
  }, [altResult.endPayout, isNeuBetter, rueckaufswert.value, laufzeit.value,
    monatlicheRate.value, neuRendite.value, neuTer.value, neuProd.value,
    neuAA.value, neuRueckk.value, neuMantel.value, neuFee.value]);

  const yearlySaving = useMemo(() => {
    if (!isNeuBetter || targetRate >= monatlicheRate.value) return 0;
    return (monatlicheRate.value - targetRate) * 12;
  }, [isNeuBetter, targetRate, monatlicheRate.value]);

  const amortYears = yearlySaving > 0 ? Math.ceil(neuFee.value / yearlySaving) : null;

  const impact = useMemo(() => lifeImpact(absDiff), [absDiff]);

  // Visual bar percentages
  const maxVal = Math.max(altResult.endPayout, neuResult.endPayout, 1);
  const altPct = (altResult.endPayout / maxVal) * 100;
  const neuPct = (neuResult.endPayout / maxVal) * 100;

  const InputField = ({ label, field, suffix }: { label: string; field: ReturnType<typeof useNum>; suffix: string }) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          step="any"
          value={field.raw}
          onChange={(e) => field.setRaw(e.target.value)}
          className="pr-12"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          {suffix}
        </span>
      </div>
    </div>
  );

  const ResultRow = ({ label, value, highlight, bold }: { label: string; value: string; highlight?: boolean; bold?: boolean }) => (
    <div className={`flex justify-between items-center py-1.5 ${highlight ? 'bg-muted/50 -mx-4 px-4 rounded-lg' : ''}`}>
      <span className={`text-sm ${bold ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{label}</span>
      <span className={`text-sm tabular-nums ${bold ? 'font-semibold text-foreground' : 'text-foreground'}`}>{value}</span>
    </div>
  );

  return (
    <PdfExportWrapper toolName="3a-Vergleichsrechner">
    <div className="space-y-6">

      {/* ═══ STORY INTRO ═══ */}
      <div
        className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-2"
        style={{ animationDuration: '600ms' }}
      >
        <p className="text-sm text-muted-foreground italic">
          „Die meisten erkennen diesen Unterschied erst viel zu spät."
        </p>
      </div>

      {/* ═══ INPUT SECTION ═══ */}
      <Collapsible open={showInputs} onOpenChange={setShowInputs}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Eingaben</CardTitle>
                  <CardDescription>Daten für den Vergleich</CardDescription>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${showInputs ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Shared */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3">Grunddaten</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InputField label="Startkapital" field={startkapital} suffix="CHF" />
                  <InputField label="Monatliche Rate" field={monatlicheRate} suffix="CHF" />
                  <InputField label="Laufzeit" field={laufzeit} suffix="Jahre" />
                  <InputField label="Rückkaufswert" field={rueckaufswert} suffix="CHF" />
                </div>
              </div>

              <Separator />

              {/* Alt vs Neu side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <p className="text-sm font-medium">Bestehende Lösung</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Rendite nominal" field={altRendite} suffix="%" />
                    <InputField label="TER" field={altTer} suffix="%" />
                    <InputField label="Produktkosten p.a." field={altProd} suffix="%" />
                    <InputField label="Ausgabeaufschlag" field={altAA} suffix="%" />
                    <InputField label="Rücknahmekommission" field={altRueckk} suffix="%" />
                    <InputField label="Mantelkosten" field={altMantel} suffix="%" />
                  </div>
                  <InputField label="Fixe Kosten / Prognose" field={altFee} suffix="CHF" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success/60" />
                    <p className="text-sm font-medium">Optimierte Lösung</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Rendite nominal" field={neuRendite} suffix="%" />
                    <InputField label="TER" field={neuTer} suffix="%" />
                    <InputField label="Produktkosten p.a." field={neuProd} suffix="%" />
                    <InputField label="Ausgabeaufschlag" field={neuAA} suffix="%" />
                    <InputField label="Rücknahmekommission" field={neuRueckk} suffix="%" />
                    <InputField label="Mantelkosten" field={neuMantel} suffix="%" />
                  </div>
                  <InputField label="Honorar" field={neuFee} suffix="CHF" />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ═══ VISUAL COMPARISON BAR ═══ */}
      <Card
        className="overflow-hidden animate-in fade-in slide-in-from-bottom-3"
        style={{ animationDelay: '100ms', animationFillMode: 'both', animationDuration: '600ms' }}
      >
        <CardContent className="p-6 space-y-5">
          <h3 className="text-base font-semibold text-foreground">Vergleich auf einen Blick</h3>

          <div className="space-y-4">
            {/* Alt bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-destructive/60" />
                  Bestehende Lösung
                </span>
                <span className="font-semibold tabular-nums text-foreground">CHF {formatCHF(altResult.endPayout)}</span>
              </div>
              <div className="h-8 bg-muted/50 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-destructive/20 rounded-lg transition-all duration-700 ease-out"
                  style={{ width: `${altPct}%` }}
                />
              </div>
            </div>

            {/* Neu bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-success/60" />
                  Optimierte Lösung
                </span>
                <span className="font-semibold tabular-nums text-foreground">CHF {formatCHF(neuResult.endPayout)}</span>
              </div>
              <div className="h-8 bg-muted/50 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-success/20 rounded-lg transition-all duration-700 ease-out"
                  style={{ width: `${neuPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Difference highlight */}
          <div className={`rounded-xl p-4 text-center ${isNeuBetter ? 'bg-success/10' : 'bg-destructive/10'}`}>
            <p className="text-xs text-muted-foreground mb-1">
              {isNeuBetter ? 'Dein Vorteil mit der optimierten Lösung' : 'Dein Nachteil gegenüber der bestehenden Lösung'}
            </p>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {isNeuBetter ? '+' : '-'} CHF {formatCHF(absDiff)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══ LOSS / GAIN HIGHLIGHT ═══ */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-3"
        style={{ animationDelay: '200ms', animationFillMode: 'both', animationDuration: '600ms' }}
      >
        {/* Loss card */}
        <Card className="border-destructive/20">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-xs font-medium text-destructive">Verpasste Chance</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {isNeuBetter
                ? 'Mit deiner bestehenden Lösung verlierst du voraussichtlich:'
                : 'Deine bestehende Lösung bringt dir mehr:'}
            </p>
            <p className="text-xl font-bold tabular-nums text-foreground">
              CHF {formatCHF(isNeuBetter ? absDiff : 0)}
            </p>
          </CardContent>
        </Card>

        {/* Gain card */}
        <Card className="border-success/20">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-success" />
              <p className="text-xs font-medium text-success">Mit optimierter Lösung</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Du hättest nach {laufzeit.value} Jahren:
            </p>
            <p className="text-xl font-bold tabular-nums text-foreground">
              CHF {formatCHF(neuResult.endPayout)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ═══ EMOTIONAL IMPACT ═══ */}
      {isNeuBetter && absDiff > 1000 && (
        <Card
          className="animate-in fade-in slide-in-from-bottom-3"
          style={{ animationDelay: '300ms', animationFillMode: 'both', animationDuration: '600ms' }}
        >
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-semibold text-foreground">Was bedeutet das konkret?</h3>
            <p className="text-sm text-muted-foreground">
              Ein Unterschied von <strong>CHF {formatCHF(absDiff)}</strong> klingt abstrakt.
              So sieht das in deinem Leben aus:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {impact.workYears >= 0.3 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <Briefcase className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {impact.workYears.toFixed(1)} Jahre Arbeit
                    </p>
                    <p className="text-xs text-muted-foreground">
                      basierend auf dem Schweizer Medianeinkommen
                    </p>
                  </div>
                </div>
              )}

              {impact.monthSalaries >= 1 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {Math.round(impact.monthSalaries)} Monatslöhne
                    </p>
                    <p className="text-xs text-muted-foreground">
                      die du nicht arbeiten müsstest
                    </p>
                  </div>
                </div>
              )}

              {impact.homePercent >= 5 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <Home className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {Math.min(100, Math.round(impact.homePercent))}% Eigenheim-Anteil
                    </p>
                    <p className="text-xs text-muted-foreground">
                      bezogen auf eine typische Eigenkapitalanforderung
                    </p>
                  </div>
                </div>
              )}

              {impact.freedomYears >= 0.5 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <Heart className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {impact.freedomYears.toFixed(1)} Jahre finanzielle Freiheit
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ohne auf Erwerbsarbeit angewiesen zu sein
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ RATE COMPARISON & AMORTISATION ═══ */}
      <Card
        className="border-primary/20 animate-in fade-in slide-in-from-bottom-3"
        style={{ animationDelay: '400ms', animationFillMode: 'both', animationDuration: '600ms' }}
      >
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            {isNeuBetter ? (
              <TrendingUp className="h-5 w-5 text-success mt-0.5 shrink-0" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            )}
            <p className="text-sm text-foreground leading-relaxed">
              {isNeuBetter ? (
                <>
                  Du hast <strong>CHF {formatCHF(absDiff)} mehr Kapital</strong> als mit der alten Lösung – oder du zahlst nur noch <strong>CHF {formatCHF(targetRate)} pro Monat</strong> ein und erreichst das gleiche Ergebnis.
                </>
              ) : (
                <>
                  Du hast <strong>CHF {formatCHF(absDiff)} weniger Kapital</strong> als mit der alten Lösung.
                </>
              )}
            </p>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <ArrowRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">
              {yearlySaving > 0 && amortYears !== null ? (
                <>
                  Dein Honorar hast du nach <strong>{amortYears} Jahren</strong> amortisiert; danach sparst du jährlich <strong>CHF {formatCHF(yearlySaving)}</strong>.
                </>
              ) : (
                'Mit deiner aktuellen Rate ergibt sich keine jährliche Einzahlungsreduktion gegenüber der alten Lösung.'
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══ DETAILED RESULTS (collapsible) ═══ */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground hover:text-foreground">
            <ChevronDown className="h-4 w-4" />
            Detaillierte Aufschlüsselung anzeigen
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alt result */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                  <CardTitle className="text-base">Bestehende Lösung</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <ResultRow label="Bestehendes Kapital" value={`CHF ${formatCHF(altResult.existingCapital)}`} />
                <ResultRow label="Neue Einzahlungen" value={`CHF ${formatCHF(altResult.newDeposits)}`} />
                <ResultRow label="Summe Einzahlungen" value={`CHF ${formatCHF(altResult.totalDeposits)}`} bold />
                <Separator className="my-2" />
                <ResultRow label="Produktkosten" value={`CHF ${formatCHF(altResult.prodCost)}`} />
                <ResultRow label="TER-Kosten" value={`CHF ${formatCHF(altResult.terCost)}`} />
                <ResultRow label="Ausgabeaufschlag" value={`CHF ${formatCHF(altResult.costAA)}`} />
                <ResultRow label="Mantelkosten" value={`CHF ${formatCHF(altResult.mantelTotal)}`} />
                <ResultRow label="Rücknahmekommission" value={`CHF ${formatCHF(altResult.rueckCost)}`} />
                <ResultRow label="Fixe Kosten" value={`CHF ${formatCHF(altResult.fee)}`} />
                <ResultRow label="Gesamtkosten" value={`CHF ${formatCHF(altResult.totalCosts)}`} highlight bold />
                <Separator className="my-2" />
                <ResultRow label="Summe bei Pension" value={`CHF ${formatCHF(altResult.endPayout)}`} bold />
                <ResultRow label="Monatliche Rente" value={`CHF ${formatCHF(altResult.monthlyPension)}`} bold />
              </CardContent>
            </Card>

            {/* Neu result */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
                  <CardTitle className="text-base">Optimierte Lösung</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <ResultRow label="Bestehendes Kapital" value={`CHF ${formatCHF(neuResult.existingCapital)}`} />
                <ResultRow label="Neue Einzahlungen" value={`CHF ${formatCHF(neuResult.newDeposits)}`} />
                <ResultRow label="Summe Einzahlungen" value={`CHF ${formatCHF(neuResult.totalDeposits)}`} bold />
                <Separator className="my-2" />
                <ResultRow label="Produktkosten" value={`CHF ${formatCHF(neuResult.prodCost)}`} />
                <ResultRow label="TER-Kosten" value={`CHF ${formatCHF(neuResult.terCost)}`} />
                <ResultRow label="Ausgabeaufschlag" value={`CHF ${formatCHF(neuResult.costAA)}`} />
                <ResultRow label="Mantelkosten" value={`CHF ${formatCHF(neuResult.mantelTotal)}`} />
                <ResultRow label="Rücknahmekommission" value={`CHF ${formatCHF(neuResult.rueckCost)}`} />
                <ResultRow label="Honorar" value={`CHF ${formatCHF(neuResult.fee)}`} />
                <ResultRow label="Gesamtkosten" value={`CHF ${formatCHF(neuResult.totalCosts)}`} highlight bold />
                <Separator className="my-2" />
                <ResultRow label="Summe bei Pension" value={`CHF ${formatCHF(neuResult.endPayout)}`} bold />
                <ResultRow label="Monatliche Rente" value={`CHF ${formatCHF(neuResult.monthlyPension)}`} bold />
              </CardContent>
            </Card>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ═══ STORY BRIDGE ═══ */}
      {isNeuBetter && absDiff > 5000 && (
        <div
          className="text-center py-4 animate-in fade-in"
          style={{ animationDelay: '500ms', animationFillMode: 'both', animationDuration: '800ms' }}
        >
          <p className="text-sm text-muted-foreground italic max-w-lg mx-auto">
            „Das ist genau der Punkt, wo sich eine Optimierung wirklich lohnt – 
            der Haken liegt oft genau hier, man sieht ihn nur nicht sofort."
          </p>
        </div>
      )}

      {/* ═══ SOURCES ═══ */}
      <Collapsible open={showSources} onOpenChange={setShowSources}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showSources ? 'rotate-180' : ''}`} />
            Quellen & Hinweise
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="flex items-start gap-2 text-xs text-muted-foreground px-1">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>
              Diese Darstellung ist modellbasiert und dient nur zur Veranschaulichung. Keine Anlageempfehlung. 
              Renditeerwartungen basieren auf historischen Daten des globalen Aktienmarktes (MSCI World, 
              UBS Global Investment Returns Yearbook). Die tatsächliche Entwicklung kann abweichen.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
      {/* ═══ REFLECTION ═══ */}
      <ToolReflection
        question="Du siehst jetzt schwarz auf weiss, was der Unterschied ausmacht. Die Frage ist: Möchtest du das so laufen lassen – oder aktiv verbessern?"
        context="Die meisten Optimierungen sind unkompliziert und lohnen sich schon im ersten Jahr."
      />

      {/* ═══ SOFT CTA ═══ */}
      <ToolSoftCta
        text="Lass uns gemeinsam anschauen, ob sich ein Wechsel für dich konkret lohnt – transparent und unverbindlich."
        note="Ich zeige dir genau, was sich ändert, was es kostet und was du davon hast."
        buttonLabel="Gespräch vereinbaren"
      />

      <ToolTrustNote text="Unabhängige Analyse · Keine Produktbindung · Du entscheidest jederzeit selbst" />

      <ToolNextStep
        insightText="Du siehst jetzt den konkreten Unterschied. Willst du alle Erkenntnisse zusammenführen?"
        primary={{
          question: "Bereit für deine Entscheidung?",
          description: "Führe alle Erkenntnisse zusammen und entscheide, was als Nächstes sinnvoll ist.",
          targetSlug: "finanz-entscheidung",
          buttonLabel: "Zur Entscheidung",
          recommended: true,
        }}
        secondary={{
          question: "Was kosten dich die Gebühren wirklich?",
          description: "Der Kosten-Impact-Simulator zeigt den langfristigen Effekt.",
          targetSlug: "kosten-impact-simulator",
          buttonLabel: "Kosten-Impact berechnen",
        }}
      />
    </div>
    </PdfExportWrapper>
  );
}
