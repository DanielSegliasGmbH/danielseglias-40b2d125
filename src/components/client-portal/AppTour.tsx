import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRight, X } from 'lucide-react';

interface AppTourProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: 'Deine Finanz-Welt',
    text: 'Hier siehst du die 4 Bereiche deiner Finanzen. Tippe auf einen Bereich, um einzutauchen — zum Beispiel bei der Absicherung kannst du alle deine Versicherungsprodukte hinterlegen und hast sie immer griffbereit.',
  },
  {
    title: 'Absicherung & Versicherungen',
    text: 'Erfasse deine bestehenden Versicherungsprodukte. So hast du alles an einem Ort — Policenummern, Kontakte, direkte Links zu Portalen. Kein Suchen mehr.',
  },
  {
    title: 'Deine finanziellen Ziele',
    text: 'Definiere, was du erreichen möchtest — ein Notgroschen, ein Hauskauf, die Pensionierung. Deine Ziele geben deinen Finanzen eine Richtung.',
  },
  {
    title: 'Finanzwissen für dich',
    text: 'Verständliche Artikel zu den wichtigsten Finanzthemen. Von Versicherungen bis Anlagestrategie — alles ohne Fachjargon.',
  },
  {
    title: 'Deine Anlagestrategie',
    text: 'Hier findest du die Informationen, die du und ich in unserer persönlichen Beratung besprochen haben. Modelle, Plattformen und Szenarien — transparent und verständlich.',
  },
  {
    title: 'Finanzcoach & Werkzeuge',
    text: 'Der Finanzcoach ist ein KI-Prototyp — probiere ihn gerne aus und gib mir Feedback! Die Werkzeuge sind praktische Rechner für konkrete Fragen: 3a-Vergleich, Inflation, Zinseszins.',
  },
  {
    title: 'Alles klar — du bist startklar! 🎉',
    text: 'Erkunde die App in deinem eigenen Tempo. Bei Fragen bin ich immer über den Chat erreichbar.',
  },
];

export function AppTour({ open, onClose }: AppTourProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({ tour_completed: true })
        .eq('id', user.id);
    } finally {
      setSaving(false);
      onClose();
    }
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };

  if (!open) return null;
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/40 flex items-end justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) finish();
        }}
      >
        <motion.div
          key={`sheet-${step}`}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-2xl bg-card rounded-t-2xl p-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] shadow-xl border-t border-border"
          style={{ maxHeight: '70vh' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`block h-1.5 rounded-full transition-all ${
                    i === step
                      ? 'w-5 bg-primary'
                      : i < step
                      ? 'w-1.5 bg-primary/60'
                      : 'w-1.5 bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={finish}
              aria-label="Tour überspringen"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2">
            {current.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {current.text}
          </p>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={finish}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              disabled={saving}
            >
              Überspringen
            </button>
            <Button onClick={next} disabled={saving} className="rounded-xl">
              {isLast ? 'Tour beenden' : 'Weiter'}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
