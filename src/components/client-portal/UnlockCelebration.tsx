import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPhaseForFeature } from '@/config/journeyPhases';

const FEATURE_LABELS: Record<string, string> = {
  'konten-modell': 'Konten-Modell',
  'was-kostet-das': 'Was kostet das wirklich?',
  'jetzt-vs-spaeter': 'Jetzt vs. Später',
  'gewohnheiten': 'Gewohnheiten-Tracker',
  'community-read': 'Community',
  'freunde-einladen': 'Freunde einladen',
  'steuer-check': 'Steuer-Check',
  'steuerrechner': 'Steuerrechner',
  'versicherungs-check': 'Versicherungs-Check',
  'krankenkassen-tracker': 'Krankenkassen-Tracker',
  'abo-audit': 'Abo-Audit',
  'notfall-check': 'Notfall-Check',
  '3-saeulen-rechner': '3-Säulen-Rechner',
  'guilty-pleasure': 'Guilty Pleasure Rechner',
  'coach-original': 'Finanz-Coach Original',
  'humankapital': 'Humankapital-Tool',
  'finanzplan': 'Mein Finanzplan',
  'lohnerhoher': 'Lohnerhöher',
  'strategien': 'Anlagestrategien',
  'community-post': 'Community (Beiträge)',
  'paar-modus': 'Paar-Modus',
  'challenges': 'Challenges',
  'ahv-tracker': 'AHV-Tracker',
  'sozialabgaben': 'Sozialabgaben-Übersicht',
  'letzter-plan': 'Mein letzter Plan',
  'expat': 'Expat-Szenarien',
  'immobilien': 'Investmentimmobilien',
  'schatten-zwilling': 'Schatten-Zwilling',
  'freiheits-goal-advanced': 'Freiheits-Goal Advanced',
  'all-remaining': 'Alle Features',
  'advanced-simulations': 'Advanced Simulationen',
  'finanz-meister-badge': 'Finanz-Meister Badge',
};

interface UnlockCelebrationProps {
  newlyUnlocked: string[];
  onDismiss: () => void;
}

export function UnlockCelebration({ newlyUnlocked, onDismiss }: UnlockCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      setVisible(true);
    }
  }, [newlyUnlocked]);

  if (!visible || newlyUnlocked.length === 0) return null;

  const phase = getPhaseForFeature(newlyUnlocked[0]);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md px-6"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
              className="text-5xl"
            >
              🔓
            </motion.div>

            <div className="space-y-1">
              {phase && (
                <p className="text-xs font-medium text-primary">
                  Phase {phase.phase}: {phase.emoji} {phase.name}
                </p>
              )}
              <h2 className="text-lg font-bold text-foreground">
                Neue Features freigeschaltet!
              </h2>
            </div>

            <div className="space-y-1.5">
              {newlyUnlocked.slice(0, 5).map(key => (
                <div
                  key={key}
                  className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">
                    {FEATURE_LABELS[key] || key}
                  </span>
                </div>
              ))}
              {newlyUnlocked.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  +{newlyUnlocked.length - 5} weitere
                </p>
              )}
            </div>

            <Button onClick={handleDismiss} className="w-full gap-2">
              Jetzt entdecken <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
