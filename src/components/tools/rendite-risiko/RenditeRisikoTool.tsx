import { PdfExportWrapper } from '../PdfExportWrapper';
import { ToolNextStep } from '../ToolNextStep';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useMonteCarloSimulation, SCENARIOS, type ScenarioKey } from './useMonteCarloSimulation';
import { ScenarioSelector } from './ScenarioSelector';
import { SimulationChart } from './SimulationChart';
import { SourcesBlock } from './SourcesBlock';

interface Props {
  mode: 'internal' | 'public';
}

const PRIVATE_MODE_KEY = 'rendite-risiko-private-mode';

export function RenditeRisikoTool({ mode }: Props) {
  const [years, setYears] = useState(10);
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('realistic');
  const [isPrivateMode, setIsPrivateMode] = useState(() => {
    try {
      return localStorage.getItem(PRIVATE_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PRIVATE_MODE_KEY, String(isPrivateMode));
    } catch { /* ignore */ }
  }, [isPrivateMode]);
  const sim = useMonteCarloSimulation(years, scenarioKey);

  return (
    <PdfExportWrapper toolName="Rendite-Risiko-Simulation" hideExport={mode === 'public'}>
    <div className="space-y-6">
      {/* Title + Private Mode Toggle */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Risiko- und Renditesimulation
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Entwicklung von Verlustwahrscheinlichkeit und Renditechancen über die Zeit
          </p>
        </div>

        {mode === 'internal' && (
          <div className="flex items-center gap-2 shrink-0 pt-1">
            <Label
              htmlFor="private-mode"
              className="text-xs text-muted-foreground flex items-center gap-1.5 cursor-pointer"
            >
              {isPrivateMode ? (
                <><EyeOff className="h-3.5 w-3.5" /> Privatmodus</>
              ) : (
                <><Eye className="h-3.5 w-3.5" /> Öffentlich</>
              )}
            </Label>
            <Switch
              id="private-mode"
              checked={isPrivateMode}
              onCheckedChange={setIsPrivateMode}
            />
          </div>
        )}
      </div>

      {/* Scenario Selector */}
      <ScenarioSelector activeKey={scenarioKey} onChange={setScenarioKey} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-scale-2">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Verlustwahrscheinlichkeit
            </p>
            <p className="text-3xl font-bold text-scale-3 mt-1">
              {sim.lossProbability}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-scale-6">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Gewinnwahrscheinlichkeit
            </p>
            <p className="text-3xl font-bold text-scale-8 mt-1">
              {sim.gainProbability}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Anlagedauer</span>
              <span className="font-medium text-foreground">
                {years} {years === 1 ? 'Jahr' : 'Jahre'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mittlere Rendite</span>
              <span className="font-medium text-foreground">{sim.meanReturn}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ø pro Jahr</span>
              <span className="font-medium text-foreground">
                {sim.annualizedReturn}% p.a.
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Volatilität</span>
              <span className="font-medium text-foreground">{sim.volatility}% p.a.</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Max. sim. Rendite</span>
              <span className="font-medium text-foreground">{sim.maxReturn}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <SimulationChart buckets={sim.buckets} />

      {/* Slider */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-foreground">Anlagedauer</span>
            <span className="text-sm font-semibold text-scale-8 bg-scale-1/30 px-3 py-1 rounded-full">
              {years} {years === 1 ? 'Jahr' : 'Jahre'}
            </span>
          </div>
          <Slider
            value={[years]}
            onValueChange={(v) => setYears(v[0])}
            min={1}
            max={45}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>1 Jahr</span>
            <span>45 Jahre</span>
          </div>
        </CardContent>
      </Card>

      {/* Lesebeispiel + Hinweis */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4">
            <span className="text-sm font-semibold text-foreground min-w-[120px]">
              Lesebeispiel
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mit einer Wahrscheinlichkeit von{' '}
              {Math.round(sim.dominantBucket.probability)}% wird das Anlageergebnis
              zwischen {sim.dominantBucket.rangeStart}% und {sim.dominantBucket.rangeEnd}%
              liegen (respektive zwischen {sim.annualizedDominantLow}% und{' '}
              {sim.annualizedDominantHigh}% pro Jahr).
            </p>
          </div>
          <div className="flex gap-4">
            <span className="text-sm font-semibold text-foreground min-w-[120px]">
              Wichtiger Hinweis
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Die verwendeten Rendite- und Risikoschätzungen sind sorgfältig und eher
              vorsichtig berechnet. Sie lassen die Möglichkeit grosser Verluste zu, wie sie
              an Kapitalmärkten auftreten können. Beachten Sie, dass die Angaben auf
              Schätzungen beruhen und keinerlei Gewähr besteht, dass diese so eintreten.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Monte-Carlo Erklärung */}
      <Card>
        <CardContent className="p-6 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            Was ist eine Monte-Carlo-Simulation?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Eine Monte-Carlo-Simulation berechnet tausende mögliche Zukunftsverläufe auf
            Basis statistischer Annahmen. Jeder Durchlauf simuliert eine andere
            Marktentwicklung – einige optimistisch, andere pessimistisch. Das Ergebnis
            ist keine Prognose, sondern eine Verteilung von Wahrscheinlichkeiten. So
            lässt sich einschätzen, wie wahrscheinlich bestimmte Renditen oder Verluste
            sind – ohne eine einzelne Zukunft vorherzusagen.
          </p>
        </CardContent>
      </Card>

      {/* Quellen – only in public mode */}
      {!isPrivateMode && <SourcesBlock />}
    </div>
    </PdfExportWrapper>
  );
}
