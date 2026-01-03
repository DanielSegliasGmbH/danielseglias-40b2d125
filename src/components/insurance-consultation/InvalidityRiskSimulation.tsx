import { useState, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

type SimulationType = 'unfall' | 'krankheit';

interface RiskPhase {
  label: string;
  blocks: {
    id: string;
    percentage: string;
    title: string;
    subtitle?: string;
    pillar?: string;
    color: 'green' | 'teal' | 'blue' | 'red';
    row: number;
    colStart: number;
    colEnd: number;
  }[];
}

// Configuration for Unfall (Accident)
const unfallPhases: RiskPhase[] = [
  {
    label: 'Heute',
    blocks: [
      { id: 'u-lohn', percentage: '100%', title: 'normaler Lohn', color: 'green', row: 1, colStart: 1, colEnd: 2 },
    ],
  },
  {
    label: 'Tag X',
    blocks: [
      { id: 'u-lohnfortzahlung', percentage: '100%', title: 'Lohnfortzahlung', color: 'teal', row: 1, colStart: 2, colEnd: 3 },
    ],
  },
  {
    label: 'Dritter Tag',
    blocks: [
      { id: 'u-uvg-taggeld-1', percentage: '80%', title: 'UVG Taggeld', color: 'blue', row: 1, colStart: 3, colEnd: 4 },
    ],
  },
  {
    label: '1. Jahr',
    blocks: [
      { id: 'u-uvg-taggeld-2', percentage: '80%', title: 'UVG Taggeld', color: 'blue', row: 1, colStart: 4, colEnd: 5 },
      { id: 'u-iv-pruefen', percentage: '', title: 'Anspruch auf Invalidenrente prüfen', color: 'blue', row: 2, colStart: 4, colEnd: 5 },
    ],
  },
  {
    label: '2. Jahr',
    blocks: [
      { id: 'u-uvg-rente', percentage: '60%', title: 'UVG Rente', pillar: '2. Säule', color: 'blue', row: 1, colStart: 5, colEnd: 7 },
      { id: 'u-iv-rente', percentage: '30%', title: 'IV-Rente (AHV/IV)', pillar: '1. Säule', color: 'green', row: 2, colStart: 5, colEnd: 7 },
    ],
  },
];

// Configuration for Krankheit (Illness)
const krankheitPhases: RiskPhase[] = [
  {
    label: 'Heute',
    blocks: [
      { id: 'k-lohn', percentage: '100%', title: 'normaler Lohn', color: 'green', row: 1, colStart: 1, colEnd: 2 },
    ],
  },
  {
    label: 'Tag X',
    blocks: [
      { id: 'k-lohnfortzahlung', percentage: '100%', title: 'Lohnfortzahlung', color: 'teal', row: 1, colStart: 2, colEnd: 3 },
    ],
  },
  {
    label: 'In der Regel 30 Tage',
    blocks: [
      { id: 'k-ktg-1', percentage: '80%', title: 'Krankentaggeld (Freiwillige Versicherung Arbeitgeber)', color: 'blue', row: 1, colStart: 3, colEnd: 4 },
    ],
  },
  {
    label: '1. Jahr',
    blocks: [
      { id: 'k-ktg-2', percentage: '80%', title: 'Krankentaggeld (Freiwillige Versicherung Arbeitgeber)', color: 'blue', row: 1, colStart: 4, colEnd: 5 },
      { id: 'k-iv-pruefen', percentage: '', title: 'Anspruch auf Invalidenrente prüfen', color: 'blue', row: 2, colStart: 4, colEnd: 5 },
    ],
  },
  {
    label: '2. Jahr',
    blocks: [
      { id: 'k-risk', percentage: '', title: 'Risk', pillar: '3. Säule', color: 'red', row: 0, colStart: 5, colEnd: 7 },
      { id: 'k-pk-rente', percentage: '30%', title: 'Pensionskasse IV-Rente (BVG)', pillar: '2. Säule', color: 'blue', row: 1, colStart: 5, colEnd: 7 },
      { id: 'k-iv-rente', percentage: '30%', title: 'IV-Rente (AHV/IV)', pillar: '1. Säule', color: 'green', row: 2, colStart: 5, colEnd: 7 },
    ],
  },
];

const phaseLabels = ['Heute', 'Tag X', '', '1. Jahr', '2. Jahr', 'Pensionierung'];

const colorClasses = {
  green: 'bg-emerald-500',
  teal: 'bg-teal-500',
  blue: 'bg-blue-500',
  red: 'bg-red-500',
};

const colorClassesMuted = {
  green: 'bg-emerald-200',
  teal: 'bg-teal-200',
  blue: 'bg-blue-200',
  red: 'bg-red-200',
};

export function InvalidityRiskSimulation() {
  const [simulationType, setSimulationType] = useState<SimulationType>('unfall');
  const [sliderValue, setSliderValue] = useState([4]); // 0-4 for 5 phases

  const phases = simulationType === 'unfall' ? unfallPhases : krankheitPhases;
  const currentPhase = sliderValue[0];

  // Get all visible blocks based on current phase
  const visibleBlocks = useMemo(() => {
    const blocks: typeof phases[0]['blocks'] = [];
    for (let i = 0; i <= currentPhase; i++) {
      blocks.push(...phases[i].blocks);
    }
    return blocks;
  }, [phases, currentPhase]);

  // Get the label for phase 2 based on simulation type
  const phase2Label = simulationType === 'unfall' ? 'Dritter Tag' : 'In der Regel\n30 Tage';

  // Get max income text based on simulation type
  const incomeText = simulationType === 'unfall' 
    ? 'Die Grafik zeigt das durchschnittliche Risikoszenario eines Unfalls bei einem Jahreseinkommen von max. CHF 148\'200.'
    : 'Die Grafik zeigt das durchschnittliche Risikoszenario einer Krankheit bei einem Jahreseinkommen von max. CHF 90\'270.';

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
        <div className="relative h-[280px]">
          {/* Phase columns with vertical lines */}
          <div className="absolute inset-0 flex">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={cn(
                  "flex-1 border-r border-dashed border-border/50",
                  i === 5 && "border-r-0"
                )}
              />
            ))}
          </div>

          {/* Blocks */}
          <div className="absolute inset-0">
            {/* Phase 0: Normaler Lohn - vertical text */}
            <div
              className={cn(
                'absolute transition-all duration-500',
                currentPhase >= 0 ? colorClasses.green : colorClassesMuted.green
              )}
              style={{
                left: '0%',
                width: '16.66%',
                top: '20%',
                height: '80%',
              }}
            >
              <div className="h-full flex items-center justify-center">
                <span 
                  className="text-white text-xs font-medium whitespace-nowrap"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  100% normaler Lohn
                </span>
              </div>
            </div>

            {/* Phase 1: Lohnfortzahlung - vertical text */}
            <div
              className={cn(
                'absolute transition-all duration-500',
                currentPhase >= 1 ? colorClasses.teal : colorClassesMuted.teal
              )}
              style={{
                left: '16.66%',
                width: '16.66%',
                top: '20%',
                height: '80%',
              }}
            >
              <div className="h-full flex items-center justify-center">
                <span 
                  className="text-white text-xs font-medium whitespace-nowrap"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  100% Lohnfortzahlung
                </span>
              </div>
            </div>

            {/* Phase 2: Taggeld */}
            <div
              className={cn(
                'absolute transition-all duration-500',
                currentPhase >= 2 ? colorClasses.blue : colorClassesMuted.blue
              )}
              style={{
                left: '33.33%',
                width: '16.66%',
                top: '0%',
                height: '40%',
              }}
            >
              <div className="p-2 flex flex-col justify-center h-full">
                <span className="text-white text-lg font-bold">80%</span>
                <span className="text-white text-[10px] leading-tight">
                  {simulationType === 'unfall' ? 'UVG Taggeld' : 'Krankentaggeld (Freiwillige Versicherung Arbeitgeber)'}
                </span>
              </div>
            </div>

            {/* Phase 3: Taggeld + IV prüfen */}
            <div
              className={cn(
                'absolute transition-all duration-500',
                currentPhase >= 3 ? colorClasses.blue : colorClassesMuted.blue
              )}
              style={{
                left: '50%',
                width: '16.66%',
                top: '0%',
                height: '40%',
              }}
            >
              <div className="p-2 flex flex-col justify-center h-full">
                <span className="text-white text-lg font-bold">80%</span>
                <span className="text-white text-[10px] leading-tight">
                  {simulationType === 'unfall' ? 'UVG Taggeld' : 'Krankentaggeld (Freiwillige Versicherung Arbeitgeber)'}
                </span>
              </div>
            </div>

            {/* Phase 3: Anspruch prüfen */}
            <div
              className={cn(
                'absolute transition-all duration-500',
                currentPhase >= 3 ? colorClasses.blue : colorClassesMuted.blue
              )}
              style={{
                left: '50%',
                width: '16.66%',
                top: '40%',
                height: '30%',
              }}
            >
              <div className="p-2 flex items-center justify-center h-full">
                <span className="text-white text-[10px] text-center leading-tight">
                  Anspruch auf Invalidenrente prüfen
                </span>
              </div>
            </div>

            {/* Phase 4: Renten (different layout for Unfall vs Krankheit) */}
            {simulationType === 'unfall' ? (
              <>
                {/* UVG Rente - 2. Säule */}
                <div
                  className={cn(
                    'absolute transition-all duration-500',
                    currentPhase >= 4 ? colorClasses.blue : colorClassesMuted.blue
                  )}
                  style={{
                    left: '66.66%',
                    width: '33.33%',
                    top: '0%',
                    height: '40%',
                  }}
                >
                  <div className="p-2 flex flex-col justify-center h-full relative">
                    <span className="text-white text-lg font-bold">60%</span>
                    <span className="text-white text-[10px]">UVG Rente</span>
                    <span className="absolute top-2 right-2 text-white/70 text-[10px]">2. Säule</span>
                  </div>
                </div>
                {/* IV-Rente - 1. Säule */}
                <div
                  className={cn(
                    'absolute transition-all duration-500',
                    currentPhase >= 4 ? colorClasses.green : colorClassesMuted.green
                  )}
                  style={{
                    left: '66.66%',
                    width: '33.33%',
                    top: '40%',
                    height: '30%',
                  }}
                >
                  <div className="p-2 flex flex-col justify-center h-full relative">
                    <span className="text-white text-lg font-bold">30%</span>
                    <span className="text-white text-[10px]">IV-Rente (AHV/IV)</span>
                    <span className="absolute top-2 right-2 text-white/70 text-[10px]">1. Säule</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Risk - 3. Säule */}
                <div
                  className={cn(
                    'absolute transition-all duration-500',
                    currentPhase >= 4 ? colorClasses.red : colorClassesMuted.red
                  )}
                  style={{
                    left: '66.66%',
                    width: '33.33%',
                    top: '0%',
                    height: '20%',
                  }}
                >
                  <div className="p-2 flex items-center h-full relative">
                    <span className="text-white text-sm font-medium">Risk</span>
                    <span className="absolute top-2 right-2 text-white/70 text-[10px]">3. Säule</span>
                  </div>
                </div>
                {/* Pensionskasse IV-Rente - 2. Säule */}
                <div
                  className={cn(
                    'absolute transition-all duration-500',
                    currentPhase >= 4 ? colorClasses.blue : colorClassesMuted.blue
                  )}
                  style={{
                    left: '66.66%',
                    width: '33.33%',
                    top: '20%',
                    height: '25%',
                  }}
                >
                  <div className="p-2 flex flex-col justify-center h-full relative">
                    <span className="text-white text-lg font-bold">30%</span>
                    <span className="text-white text-[10px]">Pensionskasse IV-Rente (BVG)</span>
                    <span className="absolute top-2 right-2 text-white/70 text-[10px]">2. Säule</span>
                  </div>
                </div>
                {/* IV-Rente - 1. Säule */}
                <div
                  className={cn(
                    'absolute transition-all duration-500',
                    currentPhase >= 4 ? colorClasses.green : colorClassesMuted.green
                  )}
                  style={{
                    left: '66.66%',
                    width: '33.33%',
                    top: '45%',
                    height: '25%',
                  }}
                >
                  <div className="p-2 flex flex-col justify-center h-full relative">
                    <span className="text-white text-lg font-bold">30%</span>
                    <span className="text-white text-[10px]">IV-Rente (AHV/IV)</span>
                    <span className="absolute top-2 right-2 text-white/70 text-[10px]">1. Säule</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="flex mt-2 text-[10px] text-muted-foreground">
          <div className="flex-1 text-center">Heute</div>
          <div className="flex-1 text-center whitespace-pre-line">{phase2Label}</div>
          <div className="flex-1 text-center">1. Jahr</div>
          <div className="flex-1 text-center">2. Jahr</div>
          <div className="flex-1 text-center">Pensionierung</div>
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
