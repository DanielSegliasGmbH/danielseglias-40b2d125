import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ArrowRight, Info } from 'lucide-react';
import { scenario, solveRateForTarget, formatCHF, type ScenarioInputs } from './calcLogic';

function useNum(initial: number) {
  const [raw, setRaw] = useState(String(initial));
  const value = parseFloat(raw) || 0;
  return { raw, setRaw, value } as const;
}

export function Vergleichsrechner3aTool() {
  // Shared inputs
  const startkapital = useNum(50000);
  const monatlicheRate = useNum(587);
  const laufzeit = useNum(20);
  const rueckaufswert = useNum(40000);

  // Alt inputs
  const altRendite = useNum(4.0);
  const altTer = useNum(1.2);
  const altProd = useNum(1.5);
  const altAA = useNum(3.0);
  const altRueckk = useNum(0);
  const altMantel = useNum(0.5);
  const altFee = useNum(5000);

  // Neu inputs
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

  // Amortisation
  const yearlySaving = useMemo(() => {
    if (!isNeuBetter || targetRate >= monatlicheRate.value) return 0;
    return (monatlicheRate.value - targetRate) * 12;
  }, [isNeuBetter, targetRate, monatlicheRate.value]);

  const amortYears = yearlySaving > 0 ? Math.ceil(neuFee.value / yearlySaving) : null;

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

  const ResultCard = ({ title, badge, result, feeLabel }: {
    title: string; badge?: string; result: ReturnType<typeof scenario>; feeLabel: string;
  }) => (
    <Card className="flex-1 min-w-[280px]">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <ResultRow label="Bestehendes Kapital" value={`CHF ${formatCHF(result.existingCapital)}`} />
        <ResultRow label="Neue Einzahlungen" value={`CHF ${formatCHF(result.newDeposits)}`} />
        <ResultRow label="Summe Einzahlungen" value={`CHF ${formatCHF(result.totalDeposits)}`} bold />
        <Separator className="my-2" />
        <ResultRow label="Produktkosten" value={`CHF ${formatCHF(result.prodCost)}`} />
        <ResultRow label="TER-Kosten" value={`CHF ${formatCHF(result.terCost)}`} />
        <ResultRow label="Ausgabeaufschlag" value={`CHF ${formatCHF(result.costAA)}`} />
        <ResultRow label="Mantelkosten" value={`CHF ${formatCHF(result.mantelTotal)}`} />
        <ResultRow label="Rücknahmekommission" value={`CHF ${formatCHF(result.rueckCost)}`} />
        <ResultRow label={feeLabel} value={`CHF ${formatCHF(result.fee)}`} />
        <ResultRow label="Gesamtkosten" value={`CHF ${formatCHF(result.totalCosts)}`} highlight bold />
        <Separator className="my-2" />
        <ResultRow label="Summe bei Pension" value={`CHF ${formatCHF(result.endPayout)}`} bold />
        <ResultRow label="Monatliche Rente" value={`CHF ${formatCHF(result.monthlyPension)}`} bold />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Gemeinsame Eingaben */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gemeinsame Eingaben</CardTitle>
          <CardDescription>Grunddaten für den Vergleich</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InputField label="Startkapital" field={startkapital} suffix="CHF" />
            <InputField label="Monatliche Rate" field={monatlicheRate} suffix="CHF" />
            <InputField label="Laufzeit" field={laufzeit} suffix="Jahre" />
            <InputField label="Rückkaufswert" field={rueckaufswert} suffix="CHF" />
          </div>
        </CardContent>
      </Card>

      {/* Vergleichs-Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alt */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">3a alt</CardTitle>
            <CardDescription>Bestehende Lösung</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Rendite nominal" field={altRendite} suffix="%" />
              <InputField label="TER" field={altTer} suffix="%" />
              <InputField label="Produktkosten p.a." field={altProd} suffix="%" />
              <InputField label="Ausgabeaufschlag" field={altAA} suffix="%" />
              <InputField label="Rücknahmekommission" field={altRueckk} suffix="%" />
              <InputField label="Mantelkosten" field={altMantel} suffix="%" />
            </div>
            <InputField label="Fixe Kosten / Gesellschaftsprognose" field={altFee} suffix="CHF" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">3a neu</CardTitle>
            <CardDescription>Optimierte Lösung</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Rendite nominal" field={neuRendite} suffix="%" />
              <InputField label="TER" field={neuTer} suffix="%" />
              <InputField label="Produktkosten p.a." field={neuProd} suffix="%" />
              <InputField label="Ausgabeaufschlag" field={neuAA} suffix="%" />
              <InputField label="Rücknahmekommission" field={neuRueckk} suffix="%" />
              <InputField label="Mantelkosten" field={neuMantel} suffix="%" />
            </div>
            <InputField label="Honorar" field={neuFee} suffix="CHF" />
          </CardContent>
        </Card>
      </div>

      {/* Resultate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResultCard title="3a alt" badge="Bestehend" result={altResult} feeLabel="Fixe Kosten / Prognose" />
        <ResultCard title="3a neu" badge="Optimiert" result={neuResult} feeLabel="Honorar" />
      </div>

      {/* Vergleichsblock */}
      <Card className="border-primary/20">
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
                  Du hast <strong>CHF {formatCHF(Math.abs(diff))} mehr Kapital</strong> als mit der alten Lösung – oder du zahlst nur noch <strong>CHF {formatCHF(targetRate)} pro Monat</strong> ein und würdest auf das gleiche Ergebnis kommen.
                </>
              ) : (
                <>
                  Du hast <strong>CHF {formatCHF(Math.abs(diff))} weniger Kapital</strong> als mit der alten Lösung – oder du müsstest <strong>CHF {formatCHF(solveRateForTarget(altResult.endPayout, {
                    r: neuRendite.value, ter: neuTer.value, prod: neuProd.value,
                    aa: neuAA.value, rueckk: neuRueckk.value, mantel: neuMantel.value,
                    fee: neuFee.value, start: rueckaufswert.value, years: laufzeit.value,
                  }))} pro Monat</strong> einzahlen, um auf das gleiche Ergebnis zu kommen.
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
                  Dein Honorar hast du nach <strong>{amortYears} Jahren</strong> amortisiert; danach sparst du jährlich <strong>CHF {formatCHF(yearlySaving)}</strong>, die du nicht mehr einzahlen musst.
                </>
              ) : (
                'Mit deiner aktuellen Rate ergibt sich keine jährliche Einzahlungsreduktion gegenüber der alten Lösung.'
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground px-1">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <p>Diese Darstellung ist modellbasiert und dient nur zur Veranschaulichung. Keine Anlageempfehlung.</p>
      </div>
    </div>
  );
}
