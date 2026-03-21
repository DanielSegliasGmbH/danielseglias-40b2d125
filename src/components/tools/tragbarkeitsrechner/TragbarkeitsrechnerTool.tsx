import { PdfExportWrapper } from '../PdfExportWrapper';
import { ToolNextStep } from '../ToolNextStep';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { HouseAffordabilityVisualization } from './HouseAffordabilityVisualization';
import { Home, TrendingUp, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { calculate, formatCHF, formatPct, type MortgageInputs } from './calcLogic';

function parseCHFInput(val: string): number {
  const cleaned = val.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

function formatInputCHF(n: number): string {
  return n > 0 ? n.toLocaleString('de-CH') : '';
}

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  isCurrency?: boolean;
  onChange: (v: number) => void;
}

function SliderField({ label, value, min, max, step, isCurrency = true, onChange }: SliderFieldProps) {
  const [inputValue, setInputValue] = useState(isCurrency ? formatInputCHF(value) : value.toFixed(2));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    if (isCurrency) {
      const n = parseCHFInput(raw);
      if (n >= min && n <= max) onChange(n);
    } else {
      const n = parseFloat(raw.replace(',', '.'));
      if (!isNaN(n) && n >= min && n <= max) onChange(n);
    }
  };

  const handleSliderChange = (vals: number[]) => {
    const v = vals[0];
    onChange(v);
    setInputValue(isCurrency ? formatInputCHF(v) : v.toFixed(2));
  };

  const handleBlur = () => {
    setInputValue(isCurrency ? formatInputCHF(value) : value.toFixed(2));
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="flex items-center gap-3">
        {isCurrency && <span className="text-sm text-muted-foreground font-medium shrink-0">CHF</span>}
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="flex-1"
        />
        {!isCurrency && <span className="text-sm text-muted-foreground font-medium shrink-0">%</span>}
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={handleSliderChange}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: 'ok' | 'tight' | 'critical' }) {
  if (status === 'ok')
    return (
      <Badge className="bg-success/15 text-success border-success/30 gap-1.5 text-sm px-3 py-1">
        <CheckCircle className="h-4 w-4" /> OK
      </Badge>
    );
  if (status === 'tight')
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700 gap-1.5 text-sm px-3 py-1">
        <AlertTriangle className="h-4 w-4" /> Knapp
      </Badge>
    );
  return (
    <Badge className="bg-destructive/15 text-destructive border-destructive/30 gap-1.5 text-sm px-3 py-1">
      <XCircle className="h-4 w-4" /> Zu hoch
    </Badge>
  );
}

interface Props {
  mode?: 'internal' | 'public';
}

export function TragbarkeitsrechnerTool({ mode = 'internal' }: Props) {
  const [inputs, setInputs] = useState<MortgageInputs>({
    purchasePrice: 1_000_000,
    equity: 200_000,
    grossIncome: 180_000,
    rate1stRank: 1.5,
    rate2ndRank: 2.5,
  });

  const update = (key: keyof MortgageInputs) => (v: number) => {
    setInputs(prev => {
      const next = { ...prev, [key]: v };
      // Eigenmittel dürfen nicht grösser als Kaufpreis sein
      if (key === 'equity' && v > prev.purchasePrice) next.equity = prev.purchasePrice;
      if (key === 'purchasePrice' && prev.equity > v) next.equity = v;
      return next;
    });
  };

  const result = useMemo(() => calculate(inputs), [inputs]);

  return (
    <PdfExportWrapper toolName="Tragbarkeitsrechner" hideExport={mode === 'public'}>
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Home className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Tragbarkeitsrechner für Immobilien in der Schweiz
          </h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
          Eine verständliche Einschätzung, wie hoch die benötigte Hypothek ist,
          wie die Belehnung aussieht und ob die Immobilie anhand der banküblichen
          Tragbarkeit grundsätzlich realistisch ist.
        </p>
      </div>

      {/* Info-Box */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4 flex gap-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <ul className="text-sm text-foreground/80 space-y-1 list-disc list-inside">
            <li>Banken rechnen oft mit einem kalkulatorischen Zinssatz von 5 %</li>
            <li>Wohnkosten unter 33 % des Einkommens gelten als tragbar</li>
            <li>Zwischen 33 % und 40 % wird es knapp</li>
            <li>Über 40 % ist es in der Regel kritisch</li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Eingabebereich */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Basisangaben</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SliderField
                label="Kaufpreis der Immobilie"
                value={inputs.purchasePrice}
                min={250_000}
                max={5_000_000}
                step={10_000}
                onChange={update('purchasePrice')}
              />
              <SliderField
                label="Deine Eigenmittel"
                value={inputs.equity}
                min={50_000}
                max={Math.min(3_000_000, inputs.purchasePrice)}
                step={10_000}
                onChange={update('equity')}
              />
              <SliderField
                label="Brutto-Haushaltseinkommen pro Jahr"
                value={inputs.grossIncome}
                min={50_000}
                max={1_000_000}
                step={5_000}
                onChange={update('grossIncome')}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Zinssätze</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SliderField
                label="Zins 1. Rang"
                value={inputs.rate1stRank}
                min={0.1}
                max={5}
                step={0.05}
                isCurrency={false}
                onChange={update('rate1stRank')}
              />
              <SliderField
                label="Zins 2. Rang"
                value={inputs.rate2ndRank}
                min={0.1}
                max={6}
                step={0.05}
                isCurrency={false}
                onChange={update('rate2ndRank')}
              />
            </CardContent>
          </Card>
        </div>

        {/* Ergebnisbereich */}
        <div className="space-y-6">
          {/* Hauptergebnis */}
          <Card>
            <CardHeader className="pb-4 flex-row items-center justify-between">
              <CardTitle className="text-base">Tragbarkeit</CardTitle>
              <StatusBadge status={result.status} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-4xl font-bold text-foreground">
                  {formatPct(result.stressPercent)}
                  <span className="text-xl ml-0.5">%</span>
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  Kalkulatorische Belastung deines Einkommens
                </p>
              </div>

              {/* Tragbarkeits-Skala */}
              <div className="relative h-4 rounded-full overflow-hidden bg-muted">
                <div className="absolute inset-y-0 left-0 bg-success/70 rounded-l-full" style={{ width: '33%' }} />
                <div className="absolute inset-y-0 bg-amber-400/70" style={{ left: '33%', width: '7%' }} />
                <div className="absolute inset-y-0 right-0 bg-destructive/50 rounded-r-full" style={{ left: '40%' }} />
                {/* Marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-background shadow-md transition-all"
                  style={{ left: `${Math.min(result.stressPercent, 60) / 60 * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0 %</span>
                <span>33 %</span>
                <span>40 %</span>
                <span>60 %</span>
              </div>
            </CardContent>
          </Card>

          {/* Kennzahlen */}
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Benötigte Hypothek" value={`CHF ${formatCHF(result.mortgage)}`} />
            <ResultCard label="Belehnung" value={`${formatPct(result.ltvPercent)} %`} />
            <ResultCard label="Eigenmittelquote" value={`${formatPct(result.equityPercent)} %`} />
            <ResultCard label="Monatliche Kosten" value={`CHF ${formatCHF(result.monthlyCost)}`} />
          </div>
          <ResultCard label="Jährliche Kosten" value={`CHF ${formatCHF(result.yearlyCost)}`} large />

          {/* Belehnungsbalken */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Belehnung &amp; Eigenmittel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative h-8 rounded-lg overflow-hidden bg-muted">
                <div
                  className="absolute inset-y-0 left-0 bg-primary/80 flex items-center justify-center text-[11px] text-primary-foreground font-medium transition-all"
                  style={{ width: `${result.equityPercent}%` }}
                >
                  {result.equityPercent >= 12 && `${formatPct(result.equityPercent)} %`}
                </div>
                <div
                  className="absolute inset-y-0 bg-primary/30 flex items-center justify-center text-[11px] text-foreground font-medium transition-all"
                  style={{ left: `${result.equityPercent}%`, width: `${result.ltvPercent}%` }}
                >
                  {result.ltvPercent >= 15 && `${formatPct(result.ltvPercent)} %`}
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-primary/80" /> Eigenmittel
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-primary/30" /> Hypothek
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Kostenaufschlüsselung */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Monatliche Kosten im Detail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <CostLine label="Zins 1. Rang" value={result.interestFirst} />
              <CostLine label="Zins 2. Rang" value={result.interestSecond} />
              <CostLine label="Amortisation" value={result.amortizationMonthly} />
              <CostLine label="Unterhalt / Nebenkosten" value={result.maintenanceMonthly} />
              <Separator />
              <div className="flex justify-between font-semibold text-foreground">
                <span>Total monatlich</span>
                <span>CHF {formatCHF(result.monthlyCost)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Haus-Visualisierung */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Deine Immobilie auf einen Blick</CardTitle>
        </CardHeader>
        <CardContent>
          <HouseAffordabilityVisualization
            equityPct={result.equityPercent}
            ltvPct={result.ltvPercent}
            loanAmount={result.mortgage}
            affordabilityPct={result.stressPercent}
            status={result.status}
          />
        </CardContent>
      </Card>

      {/* Info-Block */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            So wird häufig gerechnet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Mindestens 20 % Eigenmittel werden vorausgesetzt</li>
            <li>Die maximale Belehnung beträgt in der Regel 80 %</li>
            <li>Die Tragbarkeit sollte idealerweise unter 33 % liegen</li>
            <li>Banken rechnen oft mit einem kalkulatorischen Zins von 5 % statt dem aktuellen Marktzins</li>
          </ul>
        </CardContent>
      </Card>

      {/* Hinweis */}
      <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-4 space-y-1">
        <p className="font-medium text-foreground/70">Wichtiger Hinweis</p>
        <p>
          Diese Berechnung dient als grobe Orientierung. Die effektive Tragbarkeit kann je nach Bank,
          Objekt, Finanzierungsstruktur, Eigenmitteln und individueller Situation unterschiedlich
          beurteilt werden.
        </p>
      </div>

      <ToolNextStep
        insightText="Du kennst jetzt deine Tragbarkeit. Willst du sehen, wie sich dein Vermögen mit der richtigen Anlagestrategie entwickeln kann?"
        primary={{
          question: "Wie entwickelt sich dein Vermögen mit verschiedenen Strategien?",
          description: "Die Rendite-Risiko-Simulation zeigt dir, was realistisch möglich ist.",
          targetSlug: "rendite-risiko",
          buttonLabel: "Rendite simulieren",
          recommended: true,
        }}
      />
    </div>
    </PdfExportWrapper>
  );
}

function ResultCard({ label, value, large }: { label: string; value: string; large?: boolean }) {
  return (
    <Card className={large ? '' : ''}>
      <CardContent className={`${large ? 'py-4' : 'py-3'} text-center`}>
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className={`font-bold text-foreground ${large ? 'text-xl' : 'text-lg'}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function CostLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">CHF {formatCHF(value)}</span>
    </div>
  );
}
