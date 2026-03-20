import { PdfExportWrapper } from '../PdfExportWrapper';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, ArrowRight, AlertTriangle, Info, TrendingDown } from 'lucide-react';
import { calculate, formatCHF, MAX_CONTRIBUTION, type KostenInputs } from './calcLogic';

interface Props {
  mode?: 'public' | 'internal';
}

export function KostenaufschluesselungTool({ mode = 'internal' }: Props) {
  const [inputs, setInputs] = useState<KostenInputs>({
    currentCapital: 15000,
    annualContribution: 7258,
    years: 30,
    grossReturn: 6,
    productType: 'versicherung',
    customCost: null,
  });

  const [showAssumptions, setShowAssumptions] = useState(false);

  const update = <K extends keyof KostenInputs>(key: K) => (v: KostenInputs[K]) =>
    setInputs(prev => ({ ...prev, [key]: v }));

  const result = useMemo(() => calculate(inputs), [inputs]);

  const totalCosts = result.visibleCosts + result.hiddenCosts;
  const visiblePct = totalCosts > 0 ? (result.visibleCosts / totalCosts) * 100 : 50;
  const hiddenPct = totalCosts > 0 ? (result.hiddenCosts / totalCosts) * 100 : 50;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Kostenaufschlüsselung</h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
          Finde heraus, wo deine Kosten wirklich entstehen – sichtbar und unsichtbar.
        </p>
      </div>

      {/* ─── Eingabe ─── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Deine Angaben</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-6">
          {/* Aktuelles Kapital */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Aktuelles Kapital (CHF)</Label>
            <Input
              type="number"
              min={0}
              value={inputs.currentCapital || ''}
              placeholder="0"
              onChange={e => update('currentCapital')(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>

          {/* Jährliche Einzahlung */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Jährliche Einzahlung (CHF)</Label>
            <Input
              type="number"
              min={0}
              max={MAX_CONTRIBUTION}
              value={inputs.annualContribution}
              onChange={e => update('annualContribution')(Math.min(Math.max(0, parseInt(e.target.value) || 0), MAX_CONTRIBUTION))}
            />
            <Slider
              min={0}
              max={MAX_CONTRIBUTION}
              step={100}
              value={[inputs.annualContribution]}
              onValueChange={v => update('annualContribution')(v[0])}
            />
          </div>

          {/* Laufzeit */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Laufzeit: {inputs.years} Jahre</Label>
            <Slider
              min={5}
              max={45}
              step={1}
              value={[inputs.years]}
              onValueChange={v => update('years')(v[0])}
            />
          </div>

          {/* Bruttorendite */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Erwartete Bruttorendite: {inputs.grossReturn} %</Label>
            <Slider
              min={1}
              max={10}
              step={0.5}
              value={[inputs.grossReturn]}
              onValueChange={v => update('grossReturn')(v[0])}
            />
          </div>

          {/* Produktart */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Produktart</Label>
            <Select
              value={inputs.productType}
              onValueChange={v => update('productType')(v as KostenInputs['productType'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sparkonto">Sparkonto</SelectItem>
                <SelectItem value="versicherung">Versicherung</SelectItem>
                <SelectItem value="wertschriften">Wertschriftenlösung</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Effektive Kosten */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Effektive Kosten % (optional)</Label>
            <Input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={inputs.customCost ?? ''}
              placeholder="automatisch"
              onChange={e => {
                const raw = e.target.value;
                update('customCost')(raw === '' ? null : Math.min(10, Math.max(0, parseFloat(raw) || 0)));
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* ─── Visualisierung: Sichtbar vs Unsichtbar ─── */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Sichtbare Kosten */}
        <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="py-6 space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-semibold text-foreground">Sichtbare Kosten</h3>
            </div>
            <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
              CHF {formatCHF(result.visibleCosts)}
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Direkte Gebühren</li>
              <li>• Abschlusskosten</li>
              <li>• Verwaltungsgebühren</li>
            </ul>
            <div className="text-xs text-muted-foreground pt-1">
              {visiblePct.toFixed(0)} % der Gesamtkosten
            </div>
          </CardContent>
        </Card>

        {/* Unsichtbare Kosten */}
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-6 space-y-3">
            <div className="flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-foreground">Unsichtbare Kosten</h3>
            </div>
            <p className="text-3xl font-bold text-destructive">
              CHF {formatCHF(result.hiddenCosts)}
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Entgangene Rendite</li>
              <li>• Hohe TER / Fondsstruktur</li>
              <li>• Ineffiziente Allokation</li>
              <li>• Kosten über Zeit (Zinseszins)</li>
            </ul>
            <div className="text-xs text-muted-foreground pt-1">
              {hiddenPct.toFixed(0)} % der Gesamtkosten
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Impact-Zahl ─── */}
      <Card className="border-destructive/30">
        <CardContent className="py-8 text-center space-y-2">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-sm text-muted-foreground">Gesamter Unterschied über {result.years} Jahre</p>
          <p className="text-5xl font-extrabold text-destructive tracking-tight">
            CHF {formatCHF(result.totalDifference)}
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto pt-2">
            So viel weniger Kapital hast du langfristig durch die Gesamtkosten deiner aktuellen Lösung.
          </p>
        </CardContent>
      </Card>

      {/* ─── Kostenverteilungs-Balken ─── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kostenverteilung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-8 rounded-lg overflow-hidden flex">
            <div
              className="bg-amber-400 dark:bg-amber-500 transition-all duration-700 flex items-center justify-center text-xs font-medium text-amber-950"
              style={{ width: `${Math.max(visiblePct, 8)}%` }}
            >
              {visiblePct >= 15 ? 'Sichtbar' : ''}
            </div>
            <div
              className="bg-destructive transition-all duration-700 flex items-center justify-center text-xs font-medium text-destructive-foreground"
              style={{ width: `${Math.max(hiddenPct, 8)}%` }}
            >
              {hiddenPct >= 15 ? 'Unsichtbar' : ''}
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>CHF {formatCHF(result.visibleCosts)}</span>
            <span>CHF {formatCHF(result.hiddenCosts)}</span>
          </div>
        </CardContent>
      </Card>

      {/* ─── Erkenntnis ─── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-6 space-y-3">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-foreground/90 leading-relaxed">
                Der grösste Teil der Kosten ist nicht direkt sichtbar, sondern entsteht über Zeit durch geringere Rendite und ineffiziente Struktur.
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed">
                Diese unsichtbaren Kosten machen oft den grössten Unterschied aus – {hiddenPct.toFixed(0)} % in deinem Fall.
              </p>
              <p className="text-sm text-foreground/70 italic">
                „Die meisten erkennen diesen Unterschied erst viel zu spät."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Admin: Annahmen ─── */}
      {mode === 'internal' && (
        <Card className="border-dashed">
          <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowAssumptions(!showAssumptions)}>
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Info className="h-4 w-4" />
              Berechnungsannahmen {showAssumptions ? '▲' : '▼'}
            </CardTitle>
          </CardHeader>
          {showAssumptions && (
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p>• Sparkonto: 0.2 % sichtbar, 1.5 % unsichtbar (Opportunitätskosten)</p>
              <p>• Versicherung: 0.8 % sichtbar, 2.5 % unsichtbar</p>
              <p>• Wertschriften: 0.5 % sichtbar, 1.0 % unsichtbar</p>
              <p>• Idealfall = Bruttorendite ohne Abzüge</p>
              <p>• Berechnung: Zinseszins über gesamte Laufzeit</p>
            </CardContent>
          )}
        </Card>
      )}

      {/* ─── CTA ─── */}
      <Button size="lg" className="w-full gap-2" asChild>
        <a
          href="https://calendar.app.google/LrIPZDNzivnrfq9w7"
          target="_blank"
          rel="noopener noreferrer"
        >
          Unterschied verstehen
          <ArrowRight className="h-4 w-4" />
        </a>
      </Button>

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-4">
        <p>
          Berechnung basiert auf vereinfachten Durchschnittswerten. Die tatsächlichen Kosten hängen von der konkreten Produktwahl, Anbieter und Marktentwicklung ab.
        </p>
      </div>
    </div>
  );
}
