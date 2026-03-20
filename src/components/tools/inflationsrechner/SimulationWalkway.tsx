import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Play, RotateCcw, Pause } from 'lucide-react';
import { formatCHF } from './inflationData';

const START_CAPITAL = 100_000;
const MAX_YEAR = 50;
const MS_PER_YEAR = 700;

function StickFigure({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 40 80" className={className} fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="10" r="6" fill={color} stroke="none" />
      <line x1="20" y1="16" x2="20" y2="45" />
      <line x1="20" y1="26" x2="10" y2="35" />
      <line x1="20" y1="26" x2="30" y2="20" />
      <line x1="20" y1="45" x2="12" y2="65" />
      <line x1="12" y1="65" x2="8" y2="75" />
      <line x1="20" y1="45" x2="28" y2="65" />
      <line x1="28" y1="65" x2="32" y2="75" />
    </svg>
  );
}

function calcRealWealth(startCapital: number, returnRate: number, inflation: number, year: number) {
  if (year === 0) return startCapital;
  return startCapital * Math.pow((1 + returnRate / 100) / (1 + inflation / 100), year);
}

function posFromWealth(wealth: number): number {
  // Map wealth to a 5–95% position. 100k = 50%.
  const ratio = wealth / START_CAPITAL;
  // log scale for better visual spread
  const pos = 50 + Math.log(ratio) * 18;
  return Math.max(5, Math.min(95, pos));
}

function getStatusText(twoPersons: boolean, wealthA: number, wealthB: number) {
  const aLosing = wealthA < START_CAPITAL;
  const bLosing = wealthB < START_CAPITAL;

  if (!twoPersons) {
    if (aLosing) return 'Du verlierst jedes Jahr Kaufkraft';
    if (Math.abs(wealthA - START_CAPITAL) < 500) return 'Du hältst deine Kaufkraft – aber baust nichts auf';
    return 'Du baust echten Wohlstand auf';
  }

  if (aLosing && bLosing) return 'Beide verlieren Kaufkraft – nur unterschiedlich schnell';
  if (aLosing && !bLosing) return 'Hier entsteht der Unterschied zwischen Sparen und Investieren';
  if (!aLosing && !bLosing) return 'Beide wachsen – aber unterschiedlich stark';
  return 'Person B verliert, Person A wächst';
}

export function SimulationWalkway() {
  const [inflation, setInflation] = useState(2);
  const [returnA, setReturnA] = useState(0);
  const [returnB, setReturnB] = useState(6);
  const [twoPersons, setTwoPersons] = useState(true);

  const [year, setYear] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Band animation
  const [bandOffset, setBandOffset] = useState(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const wealthA = calcRealWealth(START_CAPITAL, returnA, inflation, year);
  const wealthB = calcRealWealth(START_CAPITAL, returnB, inflation, year);
  const posA = posFromWealth(wealthA);
  const posB = posFromWealth(wealthB);

  const statusText = getStatusText(twoPersons, wealthA, wealthB);

  // Band animation loop
  useEffect(() => {
    const tick = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      setBandOffset(prev => (prev - inflation * 6 * dt) % 60);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inflation]);

  // Year tick
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setYear(prev => {
        if (prev >= MAX_YEAR) {
          setRunning(false);
          return MAX_YEAR;
        }
        return prev + 1;
      });
    }, MS_PER_YEAR);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const handleStart = useCallback(() => {
    if (year >= MAX_YEAR) setYear(0);
    setRunning(true);
  }, [year]);

  const handlePause = useCallback(() => setRunning(false), []);

  const handleReset = useCallback(() => {
    setRunning(false);
    setYear(0);
  }, []);

  const changeA = wealthA - START_CAPITAL;
  const changeB = wealthB - START_CAPITAL;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Simulation: Inflation vs. dein Verhalten</CardTitle>
          <CardDescription>Zeigt, wie sich Vermögen über 50 Jahre entwickelt – abhängig von Verhalten</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm">Inflation: {inflation.toFixed(1)}%</Label>
              <Slider value={[inflation]} onValueChange={([v]) => { setInflation(v); if (!running) setYear(0); }} min={0} max={10} step={0.1} disabled={running} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={twoPersons} onCheckedChange={setTwoPersons} disabled={running} id="two-persons" />
              <Label htmlFor="two-persons" className="text-sm cursor-pointer">Zwei Personen vergleichen</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm">Person A – Rendite: {returnA.toFixed(1)}%</Label>
              <Slider value={[returnA]} onValueChange={([v]) => { setReturnA(v); if (!running) setYear(0); }} min={0} max={12} step={0.1} disabled={running} />
              <p className="text-xs text-muted-foreground">z.B. Bankkonto</p>
            </div>
            {twoPersons && (
              <div className="space-y-2">
                <Label className="text-sm">Person B – Rendite: {returnB.toFixed(1)}%</Label>
                <Slider value={[returnB]} onValueChange={([v]) => { setReturnB(v); if (!running) setYear(0); }} min={0} max={12} step={0.1} disabled={running} />
                <p className="text-xs text-muted-foreground">z.B. Investiert</p>
              </div>
            )}
          </div>

          {/* Start / Pause / Reset */}
          <div className="flex items-center justify-center gap-3">
            {!running ? (
              <Button onClick={handleStart} className="gap-2">
                <Play className="h-4 w-4" />
                {year > 0 && year < MAX_YEAR ? 'Fortsetzen' : 'Simulation starten'}
              </Button>
            ) : (
              <Button onClick={handlePause} variant="secondary" className="gap-2">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}
            {year > 0 && (
              <Button onClick={handleReset} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Neu starten
              </Button>
            )}
          </div>

          {/* Year + Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Jahr {year}</span>
              <span>{MAX_YEAR} Jahre</span>
            </div>
            <Progress value={(year / MAX_YEAR) * 100} className="h-2" />
          </div>

          {/* Status text */}
          <p className="text-center text-base font-semibold transition-colors duration-500 text-foreground">
            {year > 0 ? statusText : `Start: CHF ${formatCHF(START_CAPITAL)}`}
          </p>

          {/* Walkway scene */}
          <div className="relative h-44 rounded-lg bg-muted/30 overflow-hidden border border-border/50">
            {/* Moving band stripes */}
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-muted/60">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 w-8 h-1 rounded-full bg-border"
                  style={{ left: `${((i * 60 / 30) + bandOffset + 60) % 60 * (100 / 60)}%` }}
                />
              ))}
            </div>

            {/* Direction indicators */}
            <div className="absolute top-3 left-4 text-xs text-muted-foreground select-none">← Inflation</div>
            <div className="absolute top-3 right-4 text-xs text-muted-foreground select-none">Fortschritt →</div>

            {/* Center marker */}
            <div className="absolute top-8 bottom-14 left-1/2 -translate-x-1/2 w-px border-l border-dashed border-border/60" />
            <div className="absolute bottom-[3.75rem] left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap select-none">
              CHF {formatCHF(START_CAPITAL)}
            </div>

            {/* Person A */}
            <div className="absolute bottom-14 transition-[left] duration-500 ease-out" style={{ left: `${posA}%`, transform: 'translateX(-50%)' }}>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-medium text-muted-foreground mb-0.5">A</span>
                <StickFigure color="hsl(var(--muted-foreground))" className="h-16 w-8" />
              </div>
            </div>

            {/* Person B */}
            {twoPersons && (
              <div className="absolute bottom-14 transition-[left] duration-500 ease-out" style={{ left: `${posB}%`, transform: 'translateX(-50%)' }}>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-medium text-primary mb-0.5">B</span>
                  <StickFigure color="hsl(var(--primary))" className="h-16 w-8" />
                </div>
              </div>
            )}
          </div>

          {/* Wealth readout */}
          {year > 0 && (
            <div className={`grid gap-4 ${twoPersons ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div className="rounded-lg border p-3 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Person A – Bankkonto</p>
                <p className="text-lg font-bold tabular-nums">CHF {formatCHF(Math.round(wealthA))}</p>
                <p className={`text-xs tabular-nums ${changeA >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {changeA >= 0 ? '+' : '–'}CHF {formatCHF(Math.abs(Math.round(changeA)))}
                </p>
              </div>
              {twoPersons && (
                <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-3 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Person B – Investiert</p>
                  <p className="text-lg font-bold tabular-nums">CHF {formatCHF(Math.round(wealthB))}</p>
                  <p className={`text-xs tabular-nums ${changeB >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {changeB >= 0 ? '+' : '–'}CHF {formatCHF(Math.abs(Math.round(changeB)))}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Story element */}
          <p className="text-xs text-muted-foreground text-center italic pt-2">
            Die meisten Menschen bleiben stehen – und merken nicht, dass sie rückwärts gehen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
