import { PdfExportWrapper } from '../PdfExportWrapper';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  MessageCircle,
  Search,
  Brain,
  Eye,
  CheckCircle2,
  Rocket,
  RefreshCw,
  Mountain,
  ChevronUp,
} from 'lucide-react';

/* ─── Station Data ──────────────────────────────────────────── */
interface Station {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
}

const STATIONS: Station[] = [
  {
    id: 1,
    title: 'Interesse / Erstkontakt',
    subtitle: 'Der Anfang',
    description:
      'Du hast erkannt, dass du dich mit deinen Finanzen beschäftigen willst.',
    icon: MessageCircle,
  },
  {
    id: 2,
    title: 'Erstgespräch / Standortbestimmung',
    subtitle: 'Analyse',
    description: 'Analyse deiner aktuellen Situation.',
    icon: Search,
  },
  {
    id: 3,
    title: 'Tiefenanalyse / Strategieentwicklung',
    subtitle: 'Strategie',
    description: 'Individuelle Finanzstrategie wird erarbeitet.',
    icon: Brain,
  },
  {
    id: 4,
    title: 'Transparenz & Aufklärung',
    subtitle: 'Klarheit',
    description:
      'Produkte, Kosten, Risiken werden verständlich gemacht.',
    icon: Eye,
  },
  {
    id: 5,
    title: 'Entscheidungsphase',
    subtitle: 'Entscheidung',
    description:
      'Du entscheidest bewusst, was du umsetzen möchtest.',
    icon: CheckCircle2,
  },
  {
    id: 6,
    title: 'Umsetzung',
    subtitle: 'Aktion',
    description:
      'Konkrete Umsetzung der Strategie (z.\u00a0B. Säule 3a Optimierung, Anlagenstruktur).',
    icon: Rocket,
  },
  {
    id: 7,
    title: 'Begleitung & Optimierung',
    subtitle: 'Weiterentwicklung',
    description: 'Laufende Anpassung und Verbesserung.',
    icon: RefreshCw,
  },
  {
    id: 8,
    title: 'Finanzielle Klarheit',
    subtitle: 'Zielbild',
    description:
      'Struktur, Sicherheit und langfristiger Plan.',
    icon: Mountain,
  },
];

/* ─── Component ─────────────────────────────────────────────── */
interface BeratungsreiseToolProps {
  mode?: 'internal' | 'public';
}

export function BeratungsreiseTool({ mode = 'internal' }: BeratungsreiseToolProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggle = useCallback(
    (id: number) => setExpandedId((prev) => (prev === id ? null : id)),
    [],
  );

  const statusOf = (id: number) => {
    if (id < activeStep) return 'done';
    if (id === activeStep) return 'current';
    return 'upcoming';
  };

  const completedCount = activeStep - 1;

  return (
    <PdfExportWrapper toolName="Beratungsreise" hideExport={mode === 'public'}>
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
          Deine Finanz-Roadmap
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Dein Weg von der Unsicherheit zur finanziellen Klarheit – Schritt für Schritt.
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(completedCount / STATIONS.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground tabular-nums shrink-0">
          {completedCount}/{STATIONS.length}
        </span>
      </div>

      {/* Mountain Route */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-1">
          {[...STATIONS].reverse().map((station) => {
            const status = statusOf(station.id);
            const isExpanded = expandedId === station.id;
            const Icon = station.icon;

            return (
              <div key={station.id} className="relative">
                {/* Station row */}
                <button
                  onClick={() => toggle(station.id)}
                  className={cn(
                    'w-full flex items-start gap-4 px-3 py-3 rounded-2xl text-left transition-all duration-200',
                    'hover:bg-muted/60 active:scale-[0.99]',
                    isExpanded && 'bg-muted/50',
                  )}
                >
                  {/* Node */}
                  <div
                    className={cn(
                      'relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-full shrink-0 flex items-center justify-center border-2 transition-all duration-300',
                      status === 'done' &&
                        'bg-emerald-600/15 border-emerald-600/40 text-emerald-700 dark:text-emerald-400',
                      status === 'current' &&
                        'bg-primary/15 border-primary text-primary ring-4 ring-primary/10',
                      status === 'upcoming' &&
                        'bg-muted border-border text-muted-foreground',
                    )}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs font-medium uppercase tracking-wider',
                          status === 'done' && 'text-emerald-700 dark:text-emerald-400',
                          status === 'current' && 'text-primary',
                          status === 'upcoming' && 'text-muted-foreground/60',
                        )}
                      >
                        {station.subtitle}
                      </span>
                      {status === 'current' && (
                        <span className="text-[10px] font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                          Aktuell
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        'text-sm md:text-base font-medium mt-0.5',
                        status === 'upcoming'
                          ? 'text-muted-foreground'
                          : 'text-foreground',
                      )}
                    >
                      {station.title}
                    </p>
                  </div>

                  {/* Chevron */}
                  <ChevronUp
                    className={cn(
                      'w-4 h-4 text-muted-foreground/50 shrink-0 mt-2 transition-transform duration-200',
                      !isExpanded && 'rotate-180',
                    )}
                  />
                </button>

                {/* Expanded detail */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-out',
                    isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0',
                  )}
                >
                  <div className="ml-[3.25rem] md:ml-[4rem] pl-4 pr-4 pb-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {station.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Setter (admin / internal only) */}
      {mode === 'internal' && (
        <div className="border border-border rounded-2xl p-4 bg-muted/30 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Aktuellen Schritt setzen
          </p>
          <div className="flex flex-wrap gap-2">
            {STATIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200',
                  'active:scale-95',
                  activeStep === s.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
                )}
              >
                {s.id}. {s.subtitle}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
