import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

function StickFigure({ walking, className }: { walking: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 40 80" className={className} fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <circle cx="20" cy="10" r="6" fill="currentColor" stroke="none" />
      {/* Body */}
      <line x1="20" y1="16" x2="20" y2="45" />
      {/* Arms */}
      {walking ? (
        <>
          <line x1="20" y1="26" x2="10" y2="35" />
          <line x1="20" y1="26" x2="30" y2="20" />
        </>
      ) : (
        <>
          <line x1="20" y1="26" x2="10" y2="36" />
          <line x1="20" y1="26" x2="30" y2="36" />
        </>
      )}
      {/* Legs */}
      {walking ? (
        <>
          <line x1="20" y1="45" x2="12" y2="65" />
          <line x1="12" y1="65" x2="8" y2="75" />
          <line x1="20" y1="45" x2="28" y2="65" />
          <line x1="28" y1="65" x2="32" y2="75" />
        </>
      ) : (
        <>
          <line x1="20" y1="45" x2="14" y2="65" />
          <line x1="14" y1="65" x2="14" y2="75" />
          <line x1="20" y1="45" x2="26" y2="65" />
          <line x1="26" y1="65" x2="26" y2="75" />
        </>
      )}
    </svg>
  );
}

export function InflationWalkway() {
  const [inflation, setInflation] = useState(2);
  const [growth, setGrowth] = useState(0);
  const [bandOffset, setBandOffset] = useState(0);
  const [figurePos, setFigurePos] = useState(50); // percent from left
  const [walkFrame, setWalkFrame] = useState(false);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const delta = growth - inflation;
  const state = delta < -0.05 ? 'loss' : delta > 0.05 ? 'growth' : 'balance';

  const stateText = {
    loss: 'Du verlierst jedes Jahr Kaufkraft',
    balance: 'Du hältst deine Kaufkraft – aber baust nichts auf',
    growth: 'Du baust echten Wohlstand auf',
  }[state];

  const stateColor = {
    loss: 'text-destructive',
    balance: 'text-muted-foreground',
    growth: 'text-primary',
  }[state];

  useEffect(() => {
    const tick = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Band always moves left at inflation speed
      setBandOffset(prev => (prev - inflation * 8 * dt) % 60);

      // Figure position moves based on delta
      setFigurePos(prev => {
        const next = prev + delta * 3 * dt;
        return Math.max(5, Math.min(95, next));
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inflation, delta]);

  // Walk animation toggle
  useEffect(() => {
    if (state === 'loss') return;
    const interval = setInterval(() => setWalkFrame(f => !f), 350);
    return () => clearInterval(interval);
  }, [state]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Warum Stillstand Rückschritt ist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status text */}
        <p className={`text-center text-base font-semibold transition-colors duration-500 ${stateColor}`}>
          {stateText}
        </p>

        {/* Walkway scene */}
        <div className="relative h-36 rounded-lg bg-muted/30 overflow-hidden border border-border/50">
          {/* Moving band stripes */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-muted/60">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 w-8 h-1 rounded-full bg-border"
                style={{
                  left: `${((i * 60 / 30) + bandOffset + 60) % 60 * (100 / 60)}%`,
                  transition: 'none',
                }}
              />
            ))}
          </div>

          {/* Direction indicators */}
          <div className="absolute top-3 left-4 text-xs text-muted-foreground flex items-center gap-1 select-none">
            ← Inflation
          </div>
          <div className="absolute top-3 right-4 text-xs text-muted-foreground flex items-center gap-1 select-none">
            Fortschritt →
          </div>

          {/* Center marker */}
          <div className="absolute top-8 bottom-12 left-1/2 -translate-x-1/2 w-px border-l border-dashed border-border/60" />

          {/* Figure */}
          <div
            className="absolute bottom-12 transition-[left] duration-300 ease-out"
            style={{ left: `${figurePos}%`, transform: 'translateX(-50%)' }}
          >
            <StickFigure
              walking={state !== 'loss'}
              className="h-20 w-10 text-primary drop-shadow-sm"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm">Inflation: {inflation.toFixed(1)}%</Label>
            <Slider
              value={[inflation]}
              onValueChange={([v]) => setInflation(v)}
              min={0}
              max={10}
              step={0.1}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Deine Entwicklung: {growth.toFixed(1)}%</Label>
            <Slider
              value={[growth]}
              onValueChange={([v]) => setGrowth(v)}
              min={0}
              max={10}
              step={0.1}
            />
          </div>
        </div>

        {/* Story element */}
        <p className="text-xs text-muted-foreground text-center italic pt-2">
          Die meisten Menschen merken nicht, dass sie rückwärts gehen – weil es langsam passiert.
        </p>
      </CardContent>
    </Card>
  );
}
