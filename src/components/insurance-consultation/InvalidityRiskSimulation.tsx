import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

type SimulationType = 'unfall' | 'krankheit';

// Grid: 13 columns x 10 rows
const COLS = 13;
const ROWS = 10;

// Colors using design system
const colorClasses = {
  green: 'bg-emerald-500',
  teal: 'bg-teal-500',
  blue: 'bg-blue-500',
  red: 'bg-red-500',
};

export function InvalidityRiskSimulation() {
  const [simulationType, setSimulationType] = useState<SimulationType>('unfall');
  const [sliderValue, setSliderValue] = useState([4]); // 0-4 for 5 phases
  const currentPhase = sliderValue[0];

  // Get the label for phase 2 based on simulation type
  const phase2Label = simulationType === 'unfall' ? 'Dritter Tag' : 'In der Regel\n30 Tage';

  // Get max income text based on simulation type
  const incomeText = simulationType === 'unfall' 
    ? 'Die Grafik zeigt das durchschnittliche Risikoszenario eines Unfalls bei einem Jahreseinkommen von max. CHF 148\'200.'
    : 'Die Grafik zeigt das durchschnittliche Risikoszenario einer Krankheit bei einem Jahreseinkommen von max. CHF 90\'270.';

  // Helper to calculate position/size based on grid
  const getBlockStyle = (colStart: number, colSpan: number, rowStart: number, rowSpan: number) => ({
    left: `${((colStart - 1) / COLS) * 100}%`,
    width: `${(colSpan / COLS) * 100}%`,
    bottom: `${((rowStart - 1) / ROWS) * 100}%`,
    height: `${(rowSpan / ROWS) * 100}%`,
  });

  return (
    <div className="w-full space-y-6">
      {/* Toggle Unfall / Krankheit */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
          <button
            onClick={() => setSimulationType('unfall')}
            className={cn(
              'px-6 py-2 text-sm font-medium rounded-md transition-colors',
              simulationType === 'unfall'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Unfall
          </button>
          <button
            onClick={() => setSimulationType('krankheit')}
            className={cn(
              'px-6 py-2 text-sm font-medium rounded-md transition-colors',
              simulationType === 'krankheit'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Krankheit
          </button>
        </div>
      </div>

      {/* Risk Phase Visualization */}
      <div className="relative border border-border rounded-lg bg-background p-4">
        {/* Grid Container */}
        <div className="relative h-[320px]">
          {/* Phase column dividers */}
          <div className="absolute inset-0 flex">
            {/* Heute: col 1 */}
            <div className="border-r border-dashed border-border/50" style={{ width: `${(1/COLS)*100}%` }} />
            {/* Tag X: col 2 */}
            <div className="border-r border-dashed border-border/50" style={{ width: `${(1/COLS)*100}%` }} />
            {/* Dritter Tag: col 3-4 */}
            <div className="border-r border-dashed border-border/50" style={{ width: `${(2/COLS)*100}%` }} />
            {/* 1. Jahr: col 5-6 */}
            <div className="border-r border-dashed border-border/50" style={{ width: `${(2/COLS)*100}%` }} />
            {/* 2. Jahr: col 7-13 */}
            <div style={{ width: `${(7/COLS)*100}%` }} />
          </div>

          {/* Blocks */}
          <div className="absolute inset-0">
            {/* Phase 0: 100% normaler Lohn - Block 1, 10 rows high */}
            {currentPhase >= 0 && (
              <div
                className={cn('absolute transition-all duration-300', colorClasses.green)}
                style={getBlockStyle(1, 1, 1, 10)}
              >
                <div className="absolute bottom-2 left-1 flex items-end gap-1">
                  <span className="text-white text-lg font-bold">100%</span>
                  <span 
                    className="text-white text-[10px] font-medium whitespace-nowrap"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    normaler Lohn
                  </span>
                </div>
              </div>
            )}

            {/* Phase 1: 100% Lohnfortzahlung - Block 2, 10 rows high */}
            {currentPhase >= 1 && (
              <div
                className={cn('absolute transition-all duration-300', colorClasses.teal)}
                style={getBlockStyle(2, 1, 1, 10)}
              >
                <div className="absolute bottom-2 left-1 flex items-end gap-1">
                  <span className="text-white text-lg font-bold">100%</span>
                  <span 
                    className="text-white text-[10px] font-medium whitespace-nowrap"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    Lohnfortzahlung
                  </span>
                </div>
              </div>
            )}

            {/* Phase 2: 80% Taggeld - Block 3-4, 8 rows high */}
            {currentPhase >= 2 && (
              <div
                className={cn('absolute transition-all duration-300', colorClasses.blue)}
                style={getBlockStyle(3, 2, 1, 8)}
              >
                <div className="absolute top-2 left-2 flex flex-col">
                  <span className="text-white text-lg font-bold">80%</span>
                  <span className="text-white text-[10px] leading-tight">
                    {simulationType === 'unfall' ? 'Unfall-Taggeld' : 'Kranken-Taggeld (Freiwillige Versicherung durch Arbeitgeber)'}
                  </span>
                </div>
              </div>
            )}

            {/* Phase 3: 80% Taggeld + Anspruch prüfen - Block 5-6, total 8 rows */}
            {currentPhase >= 3 && (
              <>
                {/* 80% Taggeld - rows 5-8 (4 rows, top aligns with phase 2) */}
                <div
                  className={cn('absolute transition-all duration-300', colorClasses.blue)}
                  style={getBlockStyle(5, 2, 5, 4)}
                >
                  <div className="absolute top-2 left-2 flex flex-col">
                    <span className="text-white text-lg font-bold">80%</span>
                    <span className="text-white text-[10px] leading-tight">
                      {simulationType === 'unfall' ? 'Unfall-Taggeld' : 'Kranken-Taggeld (Freiwillige Versicherung durch Arbeitgeber)'}
                    </span>
                  </div>
                </div>
                {/* Anspruch auf Invalidenrente prüfen - rows 1-4 (below Taggeld) */}
                <div
                  className={cn('absolute transition-all duration-300', colorClasses.blue)}
                  style={getBlockStyle(5, 2, 1, 4)}
                >
                  <div className="absolute top-2 left-2">
                    <span className="text-white text-[9px] leading-tight">
                      Anspruch auf Invalidenrente prüfen
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Phase 4: Renten - Block 7-13 (different for Unfall vs Krankheit) */}
            {currentPhase >= 4 && (
              <>
                {simulationType === 'unfall' ? (
                  <>
                    {/* IV-Rente (AHV / IV) - 1. Säule - rows 1-3 */}
                    <div
                      className={cn('absolute transition-all duration-300', colorClasses.green)}
                      style={getBlockStyle(7, 7, 1, 3)}
                    >
                      <div className="p-2 flex flex-col justify-center h-full relative">
                        <span className="text-white text-lg font-bold">30%</span>
                        <span className="text-white text-[10px]">IV-Rente (AHV / IV)</span>
                        <span className="absolute top-1 right-2 text-white/70 text-[9px]">1. Säule</span>
                      </div>
                    </div>
                    {/* UVG Rente - rows 4-9 */}
                    <div
                      className={cn('absolute transition-all duration-300', colorClasses.blue)}
                      style={getBlockStyle(7, 7, 4, 6)}
                    >
                      <div className="p-2 flex flex-col justify-center h-full relative">
                        <span className="text-white text-lg font-bold">60%</span>
                        <span className="text-white text-[10px]">UVG Rente</span>
                        <span className="absolute top-1 right-2 text-white/70 text-[9px]">2. Säule</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* IV-Rente (AHV / IV) - 1. Säule - rows 1-3 */}
                    <div
                      className={cn('absolute transition-all duration-300', colorClasses.green)}
                      style={getBlockStyle(7, 7, 1, 3)}
                    >
                      <div className="p-2 flex flex-col justify-center h-full relative">
                        <span className="text-white text-lg font-bold">30%</span>
                        <span className="text-white text-[10px]">IV-Rente (AHV / IV)</span>
                        <span className="absolute top-1 right-2 text-white/70 text-[9px]">1. Säule</span>
                      </div>
                    </div>
                    {/* Pensionskasse IV-Rente - 2. Säule - rows 4-6 */}
                    <div
                      className={cn('absolute transition-all duration-300', colorClasses.blue)}
                      style={getBlockStyle(7, 7, 4, 3)}
                    >
                      <div className="p-2 flex flex-col justify-center h-full relative">
                        <span className="text-white text-lg font-bold">30%</span>
                        <span className="text-white text-[10px]">Pensionskasse IV-Rente</span>
                        <span className="absolute top-1 right-2 text-white/70 text-[9px]">2. Säule</span>
                      </div>
                    </div>
                    {/* UVG Rente - rows 4-9 (overlapping with PK, but only for Krankheit we show this differently) */}
                    {/* Actually for Krankheit: UVG doesn't apply, so we show Risk instead */}
                    {/* Risiko/Lücke - 3. Säule - rows 7-9 (same top edge as UVG Rente) */}
                    <div
                      className={cn('absolute transition-all duration-300', colorClasses.red)}
                      style={getBlockStyle(7, 7, 7, 3)}
                    >
                      <div className="p-2 flex flex-col justify-center h-full relative">
                        <span className="text-white text-sm font-medium">Risiko/Lücke</span>
                        <span className="absolute top-1 right-2 text-white/70 text-[9px]">3. Säule</span>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* X-Axis Labels - positioned at phase transition lines */}
        <div className="relative mt-2 h-6 text-[10px] text-muted-foreground">
          {/* Tag X - after Block 1 */}
          <div 
            className="absolute transform -translate-x-1/2 text-center"
            style={{ left: `${(1/COLS)*100}%` }}
          >
            Tag X
          </div>
          {/* Dritter Tag / In der Regel 30 Tage - after Block 2 */}
          <div 
            className="absolute transform -translate-x-1/2 text-center whitespace-pre-line"
            style={{ left: `${(2/COLS)*100}%` }}
          >
            {phase2Label}
          </div>
          {/* 1. Jahr - after Block 4 */}
          <div 
            className="absolute transform -translate-x-1/2 text-center"
            style={{ left: `${(4/COLS)*100}%` }}
          >
            1. Jahr
          </div>
          {/* 2. Jahr - after Block 6 */}
          <div 
            className="absolute transform -translate-x-1/2 text-center"
            style={{ left: `${(6/COLS)*100}%` }}
          >
            2. Jahr
          </div>
        </div>
      </div>

      {/* Slider Section */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          RISIKOPHASEN
        </p>
        <div className="px-2">
          <Slider
            value={sliderValue}
            onValueChange={setSliderValue}
            max={4}
            step={1}
            className="w-full"
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          {incomeText}
        </p>
      </div>
    </div>
  );
}
