import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { onGoldNutCelebration, type GoldNutCelebration } from '@/hooks/useGoldNuts';

/**
 * Vollbild-Celebration für eine neu gefundene Goldnuss.
 * Wird einmal global im ClientPortalLayout gemountet und reagiert
 * auf Events aus useGoldNuts.awardGoldNut().
 */
export function GoldNutCelebrationOverlay() {
  const [active, setActive] = useState<GoldNutCelebration | null>(null);

  useEffect(() => {
    return onGoldNutCelebration((c) => {
      setActive(c);
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(null), 4200);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={active.id}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActive(null)}
          role="dialog"
          aria-live="polite"
        >
          {/* Glow */}
          <motion.div
            className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-br from-warning/40 via-primary/20 to-transparent blur-3xl"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          <motion.div
            className="relative max-w-sm w-full rounded-2xl border border-warning/40 bg-card shadow-2xl p-8 text-center"
            initial={{ scale: 0.7, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="text-6xl mb-3"
              initial={{ rotate: -20, scale: 0.6 }}
              animate={{ rotate: [0, -10, 10, -6, 6, 0], scale: 1 }}
              transition={{ duration: 1.1 }}
              role="img"
              aria-label="Goldnuss"
            >
              🥜
            </motion.div>

            <p className="text-xs font-semibold uppercase tracking-wider text-warning mb-1">
              Goldnuss gefunden
            </p>
            <h2 className="text-2xl font-extrabold text-foreground mb-2">
              {active.nut.label}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {active.nut.description}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-warning/15 px-4 py-1.5 text-sm font-semibold text-foreground">
              <span aria-hidden>🪙</span>
              +{active.bonusCoins} Bonus-Münzen
            </div>

            <button
              onClick={() => setActive(null)}
              className="mt-6 block w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Tippen zum Schliessen
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
