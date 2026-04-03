import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, BarChart3, FileSearch, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const slides = [
  {
    icon: Shield,
    title: 'Deine Finanzen im Griff',
    description: 'Behalte den Überblick über Versicherungen, Vorsorge und Anlagelösungen – alles an einem Ort.',
  },
  {
    icon: FileSearch,
    title: 'Bestehende Lösungen analysieren',
    description: 'Lade Dokumente hoch und erhalte in wenigen Sekunden eine verständliche Einschätzung deiner aktuellen Situation.',
  },
  {
    icon: BarChart3,
    title: 'Bessere Entscheidungen treffen',
    description: 'Verstehe Kosten, Rendite und Optimierungspotenzial – transparent und ohne Verkaufsdruck.',
  },
];

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between px-6 py-12 safe-area-inset">
      {/* Skip */}
      <div className="w-full flex justify-end">
        <button
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] px-3"
        >
          Überspringen
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm page-transition" key={current}>
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
          <Icon className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">{slide.title}</h1>
        <p className="text-muted-foreground text-base leading-relaxed">{slide.description}</p>
      </div>

      {/* Bottom: dots + button */}
      <div className="w-full max-w-sm space-y-6">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === current ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
              )}
            />
          ))}
        </div>

        <Button onClick={handleNext} className="w-full h-14 text-base font-semibold rounded-2xl gap-2">
          {current < slides.length - 1 ? (
            <>Weiter <ChevronRight className="h-5 w-5" /></>
          ) : (
            'Loslegen'
          )}
        </Button>
      </div>
    </div>
  );
}
