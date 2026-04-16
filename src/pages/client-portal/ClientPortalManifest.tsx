import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const SECTIONS = [
  { lines: ['Geld ist nicht das Ziel.'], pause: 2200 },
  { lines: ['Geld ist das Werkzeug.'], pause: 2200 },
  {
    lines: [
      'Arbeiten musst du sowieso.',
      'Rechnungen bezahlen musst du sowieso.',
      'Entscheidungen treffen musst du sowieso.',
    ],
    pause: 3200,
  },
  {
    lines: [
      'Die Frage ist nur:',
      'Bist du der Spielball deines Geldes?',
      'Oder bist du der Spieler?',
    ],
    pause: 3200,
  },
  { lines: ['Ab heute bist du der Spieler.'], pause: 2500, hero: true },
  {
    // Placeholder — futureName injected at render
    lines: ['__FUTURE_1__', 'Jede Runde bringt dich näher.'],
    pause: 2800,
  },
  { lines: ['Lass uns spielen.'], pause: 0, final: true },
];

export default function ClientPortalManifest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { futureSelfName } = useUserAvatar();
  const [visibleSection, setVisibleSection] = useState(-1);
  const [showButton, setShowButton] = useState(false);
  const [awarding, setAwarding] = useState(false);

  // Auto-advance sections
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const advance = (idx: number) => {
      if (idx >= SECTIONS.length) return;
      setVisibleSection(idx);
      const section = SECTIONS[idx];
      if (section.final) {
        // Show button after final line fades in
        setTimeout(() => setShowButton(true), 1200);
        return;
      }
      const lineDelay = section.lines.length * 600;
      timeout = setTimeout(() => advance(idx + 1), section.pause + lineDelay);
    };
    // Start after a brief initial pause
    timeout = setTimeout(() => advance(0), 800);
    return () => clearTimeout(timeout);
  }, []);

  const handleStart = useCallback(async () => {
    if (awarding) return;
    setAwarding(true);
    try {
      if (user) {
        // Award +250 XP
        await supabase.from('gamification_actions').insert({
          user_id: user.id,
          action_type: 'manifest_completed' as any,
          action_ref: 'manifest',
          points_awarded: 250,
        });
        // Mark as seen
        localStorage.setItem('manifest_seen', 'true');
      }
      toast.success(
        futureSelfName
          ? `${futureSelfName} ist stolz auf dich. +250 XP 🎉`
          : 'Manifest abgeschlossen! +250 XP 🎉'
      );
      navigate('/app/client-portal', { replace: true });
    } catch {
      navigate('/app/client-portal', { replace: true });
    }
  }, [user, futureSelfName, navigate, awarding]);

  const futureName = futureSelfName || 'Dein Zukunfts-Ich';

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-xl mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          {SECTIONS.map((section, sIdx) => {
            if (sIdx > visibleSection) return null;
            const isCurrent = sIdx === visibleSection;

            return (
              <motion.div
                key={sIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: isCurrent ? 1 : 0.25 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="w-full mb-12"
              >
                {section.lines.map((line, lIdx) => {
                  const displayLine =
                    line === '__FUTURE_1__'
                      ? `${futureName} wartet am Ende des Spielfelds.`
                      : line;

                  return (
                    <motion.p
                      key={lIdx}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: lIdx * 0.6,
                        duration: 0.7,
                        ease: 'easeOut',
                      }}
                      className={
                        section.hero
                          ? 'text-3xl md:text-4xl font-bold text-foreground text-center leading-tight'
                          : 'text-xl md:text-2xl font-medium text-foreground/90 text-center leading-relaxed mb-2'
                      }
                    >
                      {displayLine}
                    </motion.p>
                  );
                })}
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
              className="mt-4"
            >
              <Button
                size="lg"
                onClick={handleStart}
                disabled={awarding}
                className="text-base px-10 py-6 rounded-2xl"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                {awarding ? 'Wird geladen...' : 'Spiel starten →'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
