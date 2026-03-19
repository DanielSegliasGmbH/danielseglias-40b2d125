import { SCENARIOS, type ScenarioKey } from './useMonteCarloSimulation';
import { cn } from '@/lib/utils';

interface Props {
  activeKey: ScenarioKey;
  onChange: (key: ScenarioKey) => void;
}

export function ScenarioSelector({ activeKey, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {SCENARIOS.map((s) => {
        const isActive = s.key === activeKey;
        return (
          <button
            key={s.key}
            onClick={() => onChange(s.key)}
            className={cn(
              'rounded-xl border p-4 text-left transition-all',
              isActive
                ? 'border-scale-6 bg-scale-6/10 ring-1 ring-scale-6/30'
                : 'border-border bg-card hover:border-scale-3'
            )}
          >
            <span
              className={cn(
                'text-sm font-semibold',
                isActive ? 'text-scale-8' : 'text-foreground'
              )}
            >
              {s.label}
            </span>
            <p className="text-xs text-muted-foreground mt-1 leading-snug">
              {s.description}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {(s.annualReturn * 100).toFixed(1)}% Rendite · {(s.annualVolatility * 100).toFixed(0)}% Volatilität
            </p>
          </button>
        );
      })}
    </div>
  );
}
