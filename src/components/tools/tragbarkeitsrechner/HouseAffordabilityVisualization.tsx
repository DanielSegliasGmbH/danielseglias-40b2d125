import { cn } from '@/lib/utils';
import { formatCHF, formatPct } from './calcLogic';

interface Props {
  equityPct: number;
  ltvPct: number;
  loanAmount: number;
  affordabilityPct: number;
  status: 'ok' | 'tight' | 'critical';
}

export function HouseAffordabilityVisualization({
  equityPct,
  ltvPct,
  loanAmount,
  affordabilityPct,
  status,
}: Props) {
  const clampedEquity = Math.max(0, Math.min(100, equityPct));
  const isUnderMinimum = clampedEquity < 20;

  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-8 items-start">
      {/* Haus */}
      <div className="flex justify-center">
        <div className="w-48">
          {/* Dach */}
          <svg viewBox="0 0 200 80" className="w-full" aria-hidden>
            <polygon
              points="100,8 8,76 192,76"
              className="fill-muted stroke-border"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>

          {/* Hauskörper */}
          <div
            className={cn(
              'relative w-full h-56 border-2 rounded-b-lg overflow-hidden transition-colors duration-500',
              status === 'critical'
                ? 'border-destructive/60'
                : status === 'tight'
                  ? 'border-amber-400/60'
                  : 'border-border'
            )}
            style={{ marginTop: '-2px' }}
          >
            {/* Hypothek-Hintergrund */}
            <div className="absolute inset-0 bg-muted" />

            {/* Eigenmittel-Füllung */}
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out',
                isUnderMinimum ? 'bg-destructive/25' : 'bg-primary/25'
              )}
              style={{ height: `${clampedEquity}%` }}
            />

            {/* 20%-Linie */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-foreground/30 transition-all duration-300"
              style={{ bottom: '20%' }}
            >
              <span className="absolute right-1.5 -top-4 text-[9px] text-muted-foreground whitespace-nowrap">
                Min. 20 %
              </span>
            </div>

            {/* Labels im Haus */}
            {clampedEquity > 12 && (
              <div
                className="absolute left-0 right-0 flex items-center justify-center text-xs font-medium text-primary transition-all duration-700"
                style={{ bottom: `${clampedEquity / 2}%` }}
              >
                Eigenmittel
              </div>
            )}
            {ltvPct > 15 && (
              <div
                className="absolute left-0 right-0 flex items-center justify-center text-xs text-muted-foreground transition-all duration-700"
                style={{ top: `${Math.max(8, (100 - clampedEquity) / 2 - 6)}%` }}
              >
                Hypothek
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kennzahlen + Tragbarkeit */}
      <div className="space-y-6">
        {/* Kennzahlen */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Hypothek</span>
            <div className="text-right">
              <span className="text-lg font-bold text-foreground">{formatPct(ltvPct)} %</span>
              <span className="text-sm text-muted-foreground ml-2">
                CHF {formatCHF(loanAmount)}
              </span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Eigenmittel</span>
            <span className="text-lg font-bold text-foreground">{formatPct(equityPct)} %</span>
          </div>
        </div>

        {/* Tragbarkeitsbalken */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Tragbarkeit</span>
            <span
              className={cn(
                'text-sm font-semibold',
                status === 'ok' && 'text-success',
                status === 'tight' && 'text-amber-600 dark:text-amber-400',
                status === 'critical' && 'text-destructive'
              )}
            >
              {formatPct(affordabilityPct)} % –{' '}
              {status === 'ok' ? 'OK' : status === 'tight' ? 'Knapp' : 'Zu hoch'}
            </span>
          </div>

          <div className="relative h-3 rounded-full overflow-hidden bg-muted">
            <div className="absolute inset-y-0 left-0 rounded-l-full bg-success/60" style={{ width: '55%' }} />
            <div className="absolute inset-y-0 bg-amber-400/60" style={{ left: '55%', width: '11.7%' }} />
            <div className="absolute inset-y-0 right-0 rounded-r-full bg-destructive/45" style={{ left: '66.7%' }} />
            {/* Marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-background shadow-md transition-all duration-500 ease-out"
              style={{
                left: `calc(${Math.min(affordabilityPct / 60 * 100, 100)}% - 7px)`,
                backgroundColor:
                  status === 'ok'
                    ? 'hsl(var(--success))'
                    : status === 'tight'
                      ? '#d97706'
                      : 'hsl(var(--destructive))',
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0 %</span>
            <span>33 %</span>
            <span>40 %</span>
            <span>60 %</span>
          </div>
        </div>

        {/* Status-Hinweis */}
        {isUnderMinimum && (
          <p className="text-xs text-destructive/80">
            Die Eigenmittel liegen unter dem üblichen Minimum von 20 %. Die meisten Banken setzen mindestens 20 % voraus.
          </p>
        )}
      </div>
    </div>
  );
}
