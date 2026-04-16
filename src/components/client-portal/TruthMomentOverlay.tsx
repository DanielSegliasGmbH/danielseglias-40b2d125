import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTruthMoments, TruthMomentId } from '@/hooks/useTruthMoments';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatCHF(n: number): string {
  return n.toLocaleString('de-CH', { maximumFractionDigits: 0 });
}

/** Full-screen truth moment overlay */
export function TruthMomentOverlay() {
  const { moment, markShown } = useTruthMoments();
  const [dismissed, setDismissed] = useState(false);
  const [revealStep, setRevealStep] = useState(0);
  const navigate = useNavigate();

  const dismiss = useCallback(async () => {
    if (moment) await markShown(moment.id);
    setDismissed(true);
  }, [moment, markShown]);

  const handleCTA = useCallback(
    async (path: string) => {
      if (moment) await markShown(moment.id);
      setDismissed(true);
      navigate(path);
    },
    [moment, markShown, navigate]
  );

  if (!moment || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-background/98 flex items-center justify-center overflow-y-auto"
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground z-10"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 8px) + 8px)' }}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-full max-w-lg mx-auto px-6 py-16">
          {moment.id === 'gesamt_verdient' && (
            <GesamtVerdientContent
              payload={moment.payload}
              revealStep={revealStep}
              onReveal={() => setRevealStep(s => s + 1)}
              onCTA={handleCTA}
            />
          )}
          {moment.id === 'einkaufstasche' && (
            <EinkaufstascheContent
              payload={moment.payload}
              revealStep={revealStep}
              onReveal={() => setRevealStep(s => s + 1)}
              onCTA={handleCTA}
            />
          )}
          {moment.id === 'eigenheim' && (
            <EigenheimContent
              revealStep={revealStep}
              onReveal={() => setRevealStep(s => s + 1)}
              onCTA={handleCTA}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── MOMENT 1: Das Gesamt-Verdient ─── */
function GesamtVerdientContent({
  payload,
  revealStep,
  onReveal,
  onCTA,
}: {
  payload: Record<string, number | string>;
  revealStep: number;
  onReveal: () => void;
  onCTA: (path: string) => void;
}) {
  const totalEarned = Number(payload.totalEarned);
  const netWorth = Number(payload.netWorth);
  const percentage = Number(payload.percentage);

  return (
    <div className="space-y-10 text-center">
      <FadeSection visible>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Ein Moment der Wahrheit</p>
      </FadeSection>

      <FadeSection visible>
        <p className="text-xl text-foreground/90 leading-relaxed">
          Seit du arbeitest, hast du geschätzt verdient:
        </p>
        <p className="text-4xl font-bold text-foreground mt-3">
          CHF {formatCHF(totalEarned)}
        </p>
      </FadeSection>

      {revealStep < 1 ? (
        <FadeSection visible>
          <Button variant="ghost" onClick={onReveal} className="text-muted-foreground">
            Weiter →
          </Button>
        </FadeSection>
      ) : (
        <>
          <FadeSection visible={revealStep >= 1}>
            <p className="text-lg text-foreground/80">
              Schau auf dein aktuelles Vermögen:
            </p>
            <p className="text-3xl font-bold text-foreground mt-2">
              CHF {formatCHF(netWorth)}
            </p>
          </FadeSection>

          {revealStep < 2 ? (
            <FadeSection visible={revealStep >= 1}>
              <Button variant="ghost" onClick={onReveal} className="text-muted-foreground">
                Weiter →
              </Button>
            </FadeSection>
          ) : (
            <>
              <FadeSection visible={revealStep >= 2}>
                <p className="text-xl text-foreground/90 leading-relaxed">
                  Das ist <span className="font-bold text-primary">{percentage}%</span> von allem,
                  was du jemals verdient hast.
                </p>
              </FadeSection>

              {revealStep < 3 ? (
                <FadeSection visible={revealStep >= 2}>
                  <Button variant="ghost" onClick={onReveal} className="text-muted-foreground">
                    Weiter →
                  </Button>
                </FadeSection>
              ) : (
                <FadeSection visible={revealStep >= 3}>
                  <p className="text-2xl font-bold text-foreground mt-6">
                    Wo ist der Rest?
                  </p>
                  <Button
                    size="lg"
                    className="mt-8"
                    onClick={() => onCTA('/app/client-portal/tools/konten-modell')}
                  >
                    Das will ich ändern →
                  </Button>
                </FadeSection>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ─── MOMENT 2: Die Einkaufstasche ─── */
function EinkaufstascheContent({
  payload,
  revealStep,
  onReveal,
  onCTA,
}: {
  payload: Record<string, number | string>;
  revealStep: number;
  onReveal: () => void;
  onCTA: (path: string) => void;
}) {
  const futureValue = Number(payload.futureValue);

  return (
    <div className="space-y-10 text-center">
      <FadeSection visible>
        <p className="text-3xl">🛒</p>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mt-2">Die Tragtasche</p>
      </FadeSection>

      <FadeSection visible>
        <p className="text-lg text-foreground/90 leading-relaxed">
          Erinnerst du dich?
        </p>
        <p className="text-base text-foreground/80 mt-3 leading-relaxed">
          Vor 20 Jahren ging man für CHF 100 mit einem vollen Einkaufswagen nach Hause.
        </p>
        <p className="text-base text-foreground/80 mt-2 leading-relaxed">
          Heute reicht CHF 100 kaum für eine Tragtasche.
        </p>
      </FadeSection>

      {revealStep < 1 ? (
        <FadeSection visible>
          <Button variant="ghost" onClick={onReveal} className="text-muted-foreground">
            Weiter →
          </Button>
        </FadeSection>
      ) : (
        <>
          <FadeSection visible={revealStep >= 1}>
            <p className="text-lg text-foreground/90 leading-relaxed">
              Deine CHF 100 heute werden in 20 Jahren nur noch{' '}
              <span className="font-bold text-primary">CHF {futureValue}</span> wert sein.
            </p>
          </FadeSection>

          {revealStep < 2 ? (
            <FadeSection visible={revealStep >= 1}>
              <Button variant="ghost" onClick={onReveal} className="text-muted-foreground">
                Weiter →
              </Button>
            </FadeSection>
          ) : (
            <FadeSection visible={revealStep >= 2}>
              <p className="text-xl font-semibold text-foreground mt-4">
                Wenn du sie nicht investierst, verlierst du einfach nur Kaufkraft.
              </p>
              <Button
                size="lg"
                className="mt-8"
                onClick={() => onCTA('/app/client-portal/library')}
              >
                Inflation verstehen →
              </Button>
            </FadeSection>
          )}
        </>
      )}
    </div>
  );
}

/* ─── MOMENT 3: Das Eigenheim-Gespräch ─── */
function EigenheimContent({
  revealStep,
  onReveal,
  onCTA,
}: {
  revealStep: number;
  onReveal: () => void;
  onCTA: (path: string) => void;
}) {
  return (
    <div className="space-y-10 text-center">
      <FadeSection visible>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Ein ehrlicher Moment über Eigentum
        </p>
      </FadeSection>

      <FadeSection visible>
        <p className="text-base text-foreground/80 leading-relaxed">
          In der Schweiz kostet ein Eigenheim heute durchschnittlich{' '}
          <span className="font-bold text-foreground">CHF 1&apos;200&apos;000</span>.
        </p>
        <p className="text-base text-foreground/80 mt-2 leading-relaxed">
          Dafür brauchst du CHF 200&apos;000 Eigenkapital und ein Haushaltseinkommen von etwa CHF 15&apos;000/Monat.
        </p>
      </FadeSection>

      {revealStep < 1 ? (
        <FadeSection visible>
          <Button variant="ghost" onClick={onReveal} className="text-muted-foreground">
            Weiter →
          </Button>
        </FadeSection>
      ) : (
        <>
          <FadeSection visible={revealStep >= 1}>
            <p className="text-lg text-foreground/90 leading-relaxed">
              Das bedeutet: Für die meisten Schweizer deiner Generation bleibt Eigentum unerreichbar.
            </p>
          </FadeSection>

          {revealStep < 2 ? (
            <FadeSection visible={revealStep >= 1}>
              <Button variant="ghost" onClick={onReveal} className="text-muted-foreground">
                Weiter →
              </Button>
            </FadeSection>
          ) : (
            <FadeSection visible={revealStep >= 2}>
              <p className="text-xl font-semibold text-foreground mt-4 leading-relaxed">
                Du hast zwei Wege:
              </p>
              <div className="flex flex-col gap-3 mt-6">
                <Button
                  size="lg"
                  onClick={() => onCTA('/app/client-portal/tools/tragbarkeitsrechner')}
                >
                  Ich will kämpfen →
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onCTA('/app/client-portal/library')}
                >
                  Ich will Alternativen sehen
                </Button>
              </div>
            </FadeSection>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Shared animation wrapper ─── */
function FadeSection({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
