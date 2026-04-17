import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { HamsterAvatar } from '@/components/client-portal/HamsterAvatar';
import { useGoldNuts } from '@/hooks/useGoldNuts';
import { cn } from '@/lib/utils';

/*
// ARCHIVED - OLD MANIFEST
// ─────────────────────────────────────────────────────────────────────────────
// Das ursprüngliche „Geld ist nicht das Ziel"-Manifest. Wird über den
// „Das alte Manifest anzeigen"-Link am Ende des neuen Manifests eingeblendet.
// Code bleibt zur Referenz erhalten.
//
// const OLD_SECTIONS = [
//   { lines: ['Geld ist nicht das Ziel.'], pause: 2200 },
//   { lines: ['Geld ist das Werkzeug.'], pause: 2200 },
//   { lines: [
//       'Arbeiten musst du sowieso.',
//       'Rechnungen bezahlen musst du sowieso.',
//       'Entscheidungen treffen musst du sowieso.',
//     ], pause: 3200 },
//   { lines: [
//       'Die Frage ist nur:',
//       'Bist du der Spielball deines Geldes?',
//       'Oder bist du der Spieler?',
//     ], pause: 3200 },
//   { lines: ['Ab heute bist du der Spieler.'], pause: 2500, hero: true },
//   { lines: ['Etwas Grösseres wartet am Ende des Spielfelds.', 'Jede Runde bringt dich näher.'], pause: 2800 },
//   { lines: ['Lass uns spielen.'], pause: 0, final: true },
// ];
// ─────────────────────────────────────────────────────────────────────────────
*/

// Tone shifts: 'dark' (Hamsterrad), 'olive' (Ausweg), 'gold' (Aufwachen)
type Tone = 'dark' | 'olive' | 'gold';

interface Section {
  id: number;
  lines: string[];
  pause: number;
  size?: 'normal' | 'big' | 'huge';
  tone?: Tone;
  hamster?: boolean;
  final?: boolean;
}

const SECTIONS: Section[] = [
  { id: 1,  lines: ['Aufstehen.'],                                              pause: 1500, tone: 'dark' },
  { id: 2,  lines: ['Arbeiten.'],                                               pause: 1000, tone: 'dark' },
  { id: 3,  lines: ['Rechnungen bezahlen.'],                                    pause: 1000, tone: 'dark' },
  { id: 4,  lines: ['Schlafen.'],                                               pause: 1000, tone: 'dark' },
  { id: 5,  lines: [
      'Aufstehen. Arbeiten. Rechnungen. Schlafen.',
      'Aufstehen. Arbeiten. Rechnungen. Schlafen.',
    ], pause: 800, tone: 'dark' },
  { id: 6,  lines: ['Das Hamsterrad.'],                                         pause: 2000, tone: 'dark', size: 'huge' },
  { id: 7,  lines: [
      'Die meisten Menschen verbringen ihr ganzes Leben darin.',
      'Nicht weil sie es wollen.',
      'Sondern weil niemand ihnen gezeigt hat, wie man rauskommt.',
    ], pause: 2000, tone: 'dark' },
  { id: 8,  lines: [
      'FinLife ist dein Ausweg.',
      'Kein Kurs. Kein Verkäufer.',
      'Dein eigener digitaler Coach.',
    ], pause: 1500, tone: 'olive' },
  { id: 9,  lines: ['Dein Hamster schläft noch.', 'Weck ihn auf.'],             pause: 1000, tone: 'olive' },
  { id: 10, lines: ['Rang 1: Im Hamsterrad'],                                   pause: 1000, tone: 'gold', hamster: true, size: 'big' },
  { id: 11, lines: ['Heute fängt es an.'],                                      pause: 0,    tone: 'gold', size: 'huge', final: true },
];

export default function ClientPortalManifest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { awardGoldNut } = useGoldNuts();
  const [visibleSection, setVisibleSection] = useState(-1);
  const [showButton, setShowButton] = useState(false);
  const [awarding, setAwarding] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  // Auto-advance sections
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const advance = (idx: number) => {
      if (idx >= SECTIONS.length) return;
      setVisibleSection(idx);
      const section = SECTIONS[idx];
      if (section.final) {
        setTimeout(() => setShowButton(true), 1200);
        return;
      }
      const lineDelay = section.lines.length * 500;
      timeout = setTimeout(() => advance(idx + 1), section.pause + lineDelay);
    };
    timeout = setTimeout(() => advance(0), 600);
    return () => clearTimeout(timeout);
  }, []);

  const handleStart = useCallback(async () => {
    if (awarding) return;
    setAwarding(true);
    try {
      if (user) {
        await supabase.from('gamification_actions').insert({
          user_id: user.id,
          action_type: 'manifest_completed' as any,
          action_ref: 'manifest',
          points_awarded: 250,
        });
        // Award Goldnuss (best-effort — not in catalog yet, ignore failures)
        try { await awardGoldNut('manifest_seen'); } catch {}
        localStorage.setItem('manifest_seen', 'true');
      }
      toast.success('Hamster geweckt! +250 XP 🐹');
      navigate('/app/client-portal', { replace: true });
    } catch {
      navigate('/app/client-portal', { replace: true });
    }
  }, [user, navigate, awarding, awardGoldNut]);

  // Determine current tone (background + accent shift)
  const currentTone: Tone = visibleSection >= 0 ? (SECTIONS[visibleSection]?.tone ?? 'dark') : 'dark';

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto transition-colors duration-[1500ms]',
        currentTone === 'dark' && 'bg-[hsl(60_8%_8%)] text-[hsl(60_15%_92%)]',
        currentTone === 'olive' && 'bg-[hsl(72_18%_14%)] text-[hsl(60_18%_94%)]',
        currentTone === 'gold' && 'bg-gradient-to-b from-[hsl(72_22%_16%)] to-[hsl(45_30%_20%)] text-[hsl(45_40%_96%)]',
      )}
    >
      <div className="w-full max-w-xl mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          {SECTIONS.map((section, sIdx) => {
            if (sIdx > visibleSection) return null;
            const isCurrent = sIdx === visibleSection;
            const sizeClass =
              section.size === 'huge'
                ? 'text-4xl md:text-5xl font-bold leading-tight'
                : section.size === 'big'
                  ? 'text-2xl md:text-3xl font-bold leading-tight'
                  : 'text-lg md:text-xl font-medium leading-relaxed';

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: isCurrent ? 1 : 0.18 }}
                transition={{ duration: 1.0, ease: 'easeOut' }}
                className="w-full mb-10 text-center"
              >
                {section.hamster && (
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="flex justify-center mb-4"
                  >
                    <HamsterAvatar size="lg" />
                  </motion.div>
                )}

                {section.lines.map((line, lIdx) => (
                  <motion.p
                    key={lIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: lIdx * 0.5, duration: 0.9, ease: 'easeOut' }}
                    className={cn(sizeClass, lIdx > 0 && 'mt-2')}
                  >
                    {line}
                  </motion.p>
                ))}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* CTA */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-4 flex flex-col items-center gap-4"
            >
              <Button
                size="lg"
                onClick={handleStart}
                disabled={awarding}
                className="text-base px-10 py-6 rounded-2xl bg-[hsl(45_60%_55%)] text-[hsl(60_20%_10%)] hover:bg-[hsl(45_65%_60%)] shadow-xl"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                {awarding ? 'Wird geladen...' : 'Hamster aufwecken →'}
              </Button>

              <button
                onClick={() => setShowArchive(true)}
                className="text-xs text-current/60 hover:text-current/90 underline underline-offset-4"
              >
                Das alte Manifest anzeigen
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Archive overlay — original manifest preserved */}
      <AnimatePresence>
        {showArchive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-background text-foreground overflow-y-auto"
          >
            <div className="max-w-xl mx-auto px-6 py-16 space-y-10">
              <button
                onClick={() => setShowArchive(false)}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                ← Zurück zum neuen Manifest
              </button>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-center">
                Archiv — ursprüngliches Manifest
              </p>
              {[
                ['Geld ist nicht das Ziel.'],
                ['Geld ist das Werkzeug.'],
                ['Arbeiten musst du sowieso.', 'Rechnungen bezahlen musst du sowieso.', 'Entscheidungen treffen musst du sowieso.'],
                ['Die Frage ist nur:', 'Bist du der Spielball deines Geldes?', 'Oder bist du der Spieler?'],
                ['Ab heute bist du der Spieler.'],
                ['Etwas Grösseres wartet am Ende des Spielfelds.', 'Jede Runde bringt dich näher.'],
                ['Lass uns spielen.'],
              ].map((block, i) => (
                <div key={i} className="text-center space-y-2">
                  {block.map((line, j) => (
                    <p
                      key={j}
                      className={
                        i === 4
                          ? 'text-2xl md:text-3xl font-bold text-foreground leading-tight'
                          : 'text-lg md:text-xl text-foreground/85 leading-relaxed'
                      }
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
