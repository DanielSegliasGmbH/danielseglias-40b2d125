import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Eye, Link2, Rocket, ChevronRight, Shield, Lock, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    icon: Sparkles,
    title: 'Willkommen – das hier ist kein normales Finanz-Tool',
    description: 'Vergiss alles, was du über Finanz-Apps denkst. Hier geht es nicht um Werbung, nicht um Produkte und nicht um Verkaufsgespräche. Hier geht es um dich.',
  },
  {
    icon: Eye,
    title: 'Hier geht es nicht um Produkte',
    description: 'Diese App hilft dir, deine Finanzen wirklich zu verstehen. Keine Floskeln, keine komplizierten Fachbegriffe – sondern echte Klarheit und bessere Entscheidungen.',
  },
  {
    icon: Sparkles,
    title: 'Du wirst Dinge erkennen, die dir sonst niemand zeigt',
    description: 'Versteckte Kosten, unnötige Risiken, verpasste Chancen – wir machen sichtbar, was normalerweise im Kleingedruckten verschwindet.',
  },
  {
    icon: Link2,
    title: 'Alles ist miteinander verbunden',
    description: 'Dein persönlicher Finanz-Coach begleitet dich Schritt für Schritt. Die Werkzeugkiste zeigt dir Zusammenhänge. Der Wissensbereich macht dich unabhängig.',
    showAreas: true,
  },
  {
    icon: Shield,
    title: 'Deine Daten gehören dir',
    description: 'Diese App wurde entwickelt, um dich zu schützen – nicht um dich auszunutzen.',
    isPrivacy: true,
  },
  {
    icon: Rocket,
    title: 'Starte hier',
    description: 'Entdecke dein Dashboard und beginne deinen Weg zu mehr Klarheit, Kontrolle und finanzieller Freiheit.',
    isFinal: true,
  },
];

interface AreaBubbleProps {
  label: string;
  icon: React.ReactNode;
  delay: number;
}

function AreaBubble({ label, icon, delay }: AreaBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="flex items-center gap-2.5 px-4 py-2.5 bg-card border border-border rounded-2xl shadow-sm"
    >
      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </motion.div>
  );
}

interface PrivacyPointProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function PrivacyPoint({ icon, title, description, delay }: PrivacyPointProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className="flex items-start gap-3 text-left"
    >
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);

  const handleNext = () => {
    if (current < slides.length - 1) {
      setDirection(1);
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
  const progress = ((current + 1) / slides.length) * 100;

  const isPrivacySlide = slide.isPrivacy === true;
  const canProceed = !isPrivacySlide || privacyAcknowledged;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-between px-6 py-10 safe-area-inset">
      {/* Top bar */}
      <div className="w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            {current + 1} / {slides.length}
          </span>
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] px-3"
          >
            Überspringen
          </button>
        </div>
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="flex-1 flex flex-col items-center justify-center text-center max-w-sm w-full"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
            <Icon className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4 leading-tight">{slide.title}</h1>
          <p className="text-muted-foreground text-base leading-relaxed mb-6">{slide.description}</p>

          {/* Connected areas (slide 4) */}
          {slide.showAreas && (
            <div className="flex flex-col gap-3 w-full mt-2">
              <AreaBubble label="Finanz-Coach" icon={<Sparkles className="h-4 w-4 text-primary" />} delay={0.1} />
              <AreaBubble label="Werkzeugkiste" icon={<Eye className="h-4 w-4 text-primary" />} delay={0.25} />
              <AreaBubble label="Wissensbereich" icon={<Link2 className="h-4 w-4 text-primary" />} delay={0.4} />
            </div>
          )}

          {/* Privacy slide */}
          {isPrivacySlide && (
            <div className="flex flex-col gap-4 w-full mt-2">
              <PrivacyPoint
                icon={<Lock className="h-4 w-4 text-primary" />}
                title="Kein Verkauf deiner Daten"
                description="Deine Daten werden nicht verkauft, nicht für Werbung genutzt und nicht an Dritte weitergegeben."
                delay={0.1}
              />
              <PrivacyPoint
                icon={<Sparkles className="h-4 w-4 text-primary" />}
                title="Nur für dich"
                description="Deine Daten dienen nur besseren Berechnungen, personalisierten Ergebnissen und automatischer Vorausfüllung."
                delay={0.2}
              />
              <PrivacyPoint
                icon={<EyeOff className="h-4 w-4 text-primary" />}
                title="Immer anonym"
                description="Falls wir Daten auswerten, dann nur anonym – ohne Rückschluss auf dich."
                delay={0.3}
              />
              <PrivacyPoint
                icon={<Shield className="h-4 w-4 text-primary" />}
                title="Du hast die Kontrolle"
                description="Du kannst deine Daten jederzeit einsehen, bearbeiten oder löschen."
                delay={0.4}
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.3 }}
                className="flex items-start gap-3 mt-3 pt-3 border-t border-border"
              >
                <Checkbox
                  id="privacy-ack"
                  checked={privacyAcknowledged}
                  onCheckedChange={(v) => setPrivacyAcknowledged(v === true)}
                  className="mt-0.5"
                />
                <label htmlFor="privacy-ack" className="text-xs text-muted-foreground text-left leading-relaxed cursor-pointer select-none">
                  Ich habe verstanden, wie meine Daten verwendet werden.
                </label>
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom */}
      <div className="w-full max-w-sm space-y-5">
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

        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className={cn(
            "w-full h-14 text-base font-semibold rounded-2xl gap-2",
            slide.isFinal && "animate-pulse"
          )}
        >
          {slide.isFinal ? (
            'Dashboard entdecken'
          ) : (
            <>Weiter <ChevronRight className="h-5 w-5" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
