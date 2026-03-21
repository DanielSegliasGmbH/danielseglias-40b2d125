import { PdfExportWrapper } from '../PdfExportWrapper';
import { ToolNextStep } from '../ToolNextStep';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  MARKET_DATA,
  LIFE_EVENTS,
  calculateResult,
  type Step2Answers,
  type InitiativeAnswer,
  type TimingAnswer,
  type FinalResult,
} from './calcLogic';
import { ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';

interface Props {
  mode?: 'internal' | 'public';
}

export function ZufallsRealitaetsCheckTool({ mode = 'internal' }: Props) {
  const [step, setStep] = useState(0); // 0=start, 1=market, 2=initiative, 3=future, 4=result
  const [initiative, setInitiative] = useState<InitiativeAnswer | ''>('');
  const [timing, setTiming] = useState<TimingAnswer | ''>('');
  const [result, setResult] = useState<FinalResult | null>(null);
  const [animatedEvent, setAnimatedEvent] = useState(-1);

  const handleNext = () => {
    if (step === 3) {
      // Calculate result
      const res = calculateResult({
        initiative: initiative || 'rather_not',
        timing: timing || 'never',
      });
      setResult(res);
      setStep(4);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handleReset = () => {
    setStep(0);
    setInitiative('');
    setTiming('');
    setResult(null);
    setAnimatedEvent(-1);
  };

  const canProceedStep2 = initiative !== '' && timing !== '';

  // Animate life events when entering step 3
  const onEnterStep3 = () => {
    setStep(3);
    setAnimatedEvent(-1);
    LIFE_EVENTS.forEach((_, i) => {
      setTimeout(() => setAnimatedEvent(i), (i + 1) * 400);
    });
  };

  const totalProviders = MARKET_DATA.banks + MARKET_DATA.insurers + MARKET_DATA.brokers;

  // Color helpers
  const getPctColor = (pct: number) => {
    if (pct <= 20) return 'text-destructive';
    if (pct <= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  return (
    <PdfExportWrapper toolName="Zufalls-Realitäts-Check" hideExport={mode === 'public'}>
    <div className="space-y-6">
      {/* Progress indicator */}
      {step > 0 && step < 4 && (
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      )}

      {/* STEP 0: Start */}
      {step === 0 && (
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="text-5xl mb-2">🎯</div>
            <h2 className="text-2xl font-bold text-foreground leading-tight text-wrap-balance">
              Wie wahrscheinlich ist es, dass du das Thema Finanzen wirklich richtig angehst?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Ein kurzer Realitäts-Check in 60 Sekunden – ehrlich, klar und ohne Fachchinesisch.
            </p>
            <Button onClick={() => setStep(1)} size="lg" className="mt-2">
              Check starten
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* STEP 1: Market Reality */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Schritt 1 von 3
            </p>
            <h2 className="text-xl font-bold text-foreground">Marktrealität Schweiz</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Banken', value: `~${MARKET_DATA.banks}`, icon: '🏦' },
              { label: 'Versicherungen', value: `~${MARKET_DATA.insurers}`, icon: '🛡️' },
              { label: 'Vermittler / Broker', value: `~${MARKET_DATA.brokers.toLocaleString('de-CH')}`, icon: '🤝' },
            ].map((item) => (
              <Card key={item.label} className="text-center">
                <CardContent className="pt-4 pb-3 px-3">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-lg font-bold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="pt-4 pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Provisionsbasierte Beratung</span>
                <span className="font-bold text-foreground">{MARKET_DATA.commissionBasedPct}%+</span>
              </div>
              <Progress value={MARKET_DATA.commissionBasedPct} className="h-2" />

              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-muted-foreground">Wirklich unabhängige Beratung</span>
                <span className="font-bold text-destructive">&lt;{MARKET_DATA.independentPct}%</span>
              </div>
              <Progress value={MARKET_DATA.independentPct} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-muted/40">
            <CardContent className="py-4">
              <p className="text-sm text-foreground leading-relaxed">
                Die Wahrscheinlichkeit, zufällig an eine wirklich unabhängige, transparente Beratung zu geraten, ist <strong className="text-destructive">sehr gering</strong>.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Geschätzt: unter {MARKET_DATA.independentPct}% aller Anbieter.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <Button onClick={() => setStep(2)}>
              Weiter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Self-initiative */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Schritt 2 von 3
            </p>
            <h2 className="text-xl font-bold text-foreground">Eigeninitiative</h2>
          </div>

          <Card>
            <CardContent className="pt-5 space-y-6">
              {/* Question 1 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">
                  Hättest du dich ohne dieses Gespräch aktiv mit deinen Finanzen beschäftigt?
                </Label>
                <RadioGroup
                  value={initiative}
                  onValueChange={(v) => setInitiative(v as InitiativeAnswer)}
                  className="grid gap-2"
                >
                  <label
                    className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                      initiative === 'yes'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <RadioGroupItem value="yes" />
                    <span className="text-sm">Ja</span>
                  </label>
                  <label
                    className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                      initiative === 'rather_not'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <RadioGroupItem value="rather_not" />
                    <span className="text-sm">Eher nicht</span>
                  </label>
                </RadioGroup>
              </div>

              {/* Question 2 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">
                  Wann hättest du dich realistisch damit beschäftigt?
                </Label>
                <RadioGroup
                  value={timing}
                  onValueChange={(v) => setTiming(v as TimingAnswer)}
                  className="grid gap-2"
                >
                  {[
                    { value: 'months', label: 'In den nächsten Monaten' },
                    { value: 'years', label: 'In ein paar Jahren' },
                    { value: 'never', label: 'Eher gar nicht konkret geplant' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                        timing === opt.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <RadioGroupItem value={opt.value} />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {(initiative === 'rather_not' || timing === 'years' || timing === 'never') && (
            <Card className="bg-muted/40">
              <CardContent className="py-4">
                <p className="text-sm text-foreground leading-relaxed">
                  Die meisten Menschen beschäftigen sich erst spät oder gar nicht aktiv mit ihrer finanziellen Zukunft.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Die Wahrscheinlichkeit, dass du es von dir aus zeitnah gemacht hättest, ist gering.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <Button onClick={onEnterStep3} disabled={!canProceedStep2}>
              Weiter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Future / Life Events */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Schritt 3 von 3
            </p>
            <h2 className="text-xl font-bold text-foreground">Zukunftsrealität</h2>
            <p className="text-sm text-muted-foreground">
              Typische Lebensereignisse, die dazwischenkommen
            </p>
          </div>

          <div className="space-y-3">
            {LIFE_EVENTS.map((event, idx) => (
              <div
                key={event.key}
                className={`flex items-center gap-4 border rounded-lg px-4 py-3 transition-all duration-500 ${
                  idx <= animatedEvent
                    ? 'opacity-100 translate-x-0 border-destructive/30 bg-destructive/5'
                    : 'opacity-0 translate-x-4'
                }`}
              >
                <span className="text-2xl">{event.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{event.label}</p>
                </div>
                <span className="text-xs font-medium text-destructive">
                  −{event.reductionPct}%
                </span>
              </div>
            ))}
          </div>

          <Card className="bg-muted/40">
            <CardContent className="py-4">
              <p className="text-sm text-foreground leading-relaxed">
                Wenn du dich heute nicht darum kümmerst, sinkt die Wahrscheinlichkeit massiv, dass du das Thema später nochmals <strong>wirklich</strong> angehst.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <Button onClick={handleNext}>
              Ergebnis anzeigen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Final Result */}
      {step === 4 && result && (
        <div className="space-y-6">
          {/* Main score */}
          <Card className="border-destructive/30">
            <CardContent className="py-8 text-center space-y-4">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Dein Ergebnis
              </p>
              <div className={`text-6xl font-bold ${getPctColor(result.actLaterPct)}`}>
                {result.actLaterPct}%
              </div>
              <p className="text-foreground font-medium max-w-md mx-auto text-wrap-balance">
                Wahrscheinlichkeit, dass du das Thema später nochmals richtig angehst
              </p>
            </CardContent>
          </Card>

          {/* Independent advisor */}
          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="py-5 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Wahrscheinlichkeit, dabei an eine wirklich unabhängige Beratung zu gelangen
              </p>
              <p className="text-3xl font-bold text-destructive">
                {result.independentAdvisorPct}%
              </p>
            </CardContent>
          </Card>

          {/* Combined */}
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="py-5 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Kombinierte Wahrscheinlichkeit: Später handeln UND unabhängig beraten werden
              </p>
              <p className="text-4xl font-bold text-destructive">
                ~{result.combinedPct}%
              </p>
            </CardContent>
          </Card>

          {/* Positive shift */}
          <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardContent className="py-5 space-y-2">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                ✨ Positiver Shift
              </p>
              <p className="text-foreground text-sm leading-relaxed">
                Dass du dich gerade jetzt damit beschäftigst, ist keine Selbstverständlichkeit – sondern eine <strong>echte Chance</strong>.
              </p>
              <p className="text-muted-foreground text-sm">
                Du bist bereits weiter als die grosse Mehrheit. Nutze diesen Moment.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Nochmals starten
            </Button>
          </div>
        </div>
      )}
    </div>
    </PdfExportWrapper>
  );
}
