import { AppLayout } from '@/components/AppLayout';
import { useViewMode } from '@/hooks/useViewMode';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, Compass, Search, Lightbulb, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const STEPS = [
  {
    icon: Compass,
    title: 'Ausgangslage verstehen',
    description:
      'Ich möchte zuerst verstehen, wo du heute stehst und was dir aktuell wichtig ist.',
  },
  {
    icon: Search,
    title: 'Analyse & Einordnung',
    description:
      'Wir schauen uns gemeinsam an, wie deine aktuelle Situation einzuordnen ist und wo du heute stehst.',
  },
  {
    icon: Lightbulb,
    title: 'Möglichkeiten & Optimierung',
    description:
      'Ich zeige dir, welche Optionen du hast und wo du konkret optimieren kannst.',
  },
  {
    icon: ArrowRight,
    title: 'Nächste Schritte',
    description:
      'Am Ende entscheidest du, was für dich Sinn macht und wie es weitergeht.',
  },
];

interface ConsultationProcessPageProps {
  visible?: boolean;
  onVisibilityChange?: (v: boolean) => void;
}

export default function ConsultationProcessPage({
  visible = true,
  onVisibilityChange,
}: ConsultationProcessPageProps) {
  const { isPresentation } = useViewMode();
  const [localVisible, setLocalVisible] = useState(visible);

  const isVisible = onVisibilityChange ? visible : localVisible;
  const setVisible = onVisibilityChange ?? setLocalVisible;

  /* ═══════════ PRESENTATION ═══════════ */
  if (isPresentation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 py-16 md:py-24 space-y-16">
          {/* Header */}
          <header
            className="space-y-3 animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
            style={{ animationDuration: '700ms' }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
              So gehen wir heute vor
            </h1>
          </header>

          {/* Steps */}
          <div className="space-y-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="flex gap-5 animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
                  style={{
                    animationDelay: `${100 + i * 120}ms`,
                    animationDuration: '600ms',
                  }}
                >
                  {/* Number + line */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-1">
                      {step.title}
                    </h2>
                    <p className="text-[15px] text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Closing */}
          <p
            className="text-base text-muted-foreground/80 animate-in fade-in fill-mode-both"
            style={{ animationDelay: '700ms', animationDuration: '600ms' }}
          >
            Passt das so für dich?
          </p>
        </div>
      </div>
    );
  }

  /* ═══════════ ADMIN ═══════════ */
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">
            So gehen wir heute vor
          </h1>
          <p className="text-sm text-muted-foreground">
            Dieser Abschnitt zeigt dem Kunden den Gesprächsablauf. Die Inhalte sind fix.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm text-foreground flex-1">
            Im Präsentationsmodus anzeigen
          </Label>
          <Switch checked={isVisible} onCheckedChange={setVisible} />
        </div>

        {/* Preview */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Vorschau</h2>
          <div className="rounded-xl border bg-card p-6 space-y-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
