import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingState } from '@/hooks/useOnboardingState';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  Sparkles,
  Search,
  Handshake,
  Leaf,
  LayoutDashboard,
  MessageCircle,
  Wrench,
  CalendarDays,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import { isPushSupported, ensureServiceWorker, subscribeToPush } from '@/lib/push';

// Onboarding has 5 base steps (Willkommen, Haltung, Mitgliederbereich, Name, Fertig).
// When push notifications are supported and not yet decided, an extra step is
// inserted between step 3 and the name step (becoming step 4 → name=5 → finish=6).
const BASE_TOTAL_STEPS = 5;

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { state, setStep, markComplete } = useOnboardingState();

  const [showNotifStep] = useState(() => {
    return (
      isPushSupported() &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'default'
    );
  });
  const TOTAL_STEPS = showNotifStep ? BASE_TOTAL_STEPS + 1 : BASE_TOTAL_STEPS;
  // When notif step is shown, name step shifts from 4 → 5 and finish 5 → 6.
  const NAME_STEP = showNotifStep ? 5 : 4;
  const FINISH_STEP = showNotifStep ? 6 : 5;
  const NOTIF_STEP = 4; // only used when showNotifStep

  const [step, setStepLocal] = useState<number>(() => {
    const s = state?.currentStep ?? 1;
    return Math.max(1, Math.min(TOTAL_STEPS, s));
  });

  useEffect(() => {
    if (state?.currentStep) {
      setStepLocal(Math.max(1, Math.min(TOTAL_STEPS, state.currentStep)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.currentStep]);

  const [firstName, setFirstName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  // Prefill firstName from profile
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.first_name) setFirstName(data.first_name);
      });
  }, [user]);

  const goToStep = async (next: number) => {
    const safe = Math.max(1, Math.min(TOTAL_STEPS, next));
    setStepLocal(safe);
    try {
      await setStep(safe);
    } catch {
      /* non-blocking */
    }
  };

  const saveFirstName = async (): Promise<boolean> => {
    if (!user) return false;
    const trimmed = firstName.trim();
    if (trimmed.length < 2) {
      toast.error('Bitte gib deinen Vornamen ein.');
      return false;
    }
    setSavingName(true);
    const { error } = await supabase
      .from('profiles')
      .update({ first_name: trimmed })
      .eq('id', user.id);
    setSavingName(false);
    if (error) {
      toast.error('Speichern fehlgeschlagen.');
      return false;
    }
    return true;
  };

  const finishOnboarding = async () => {
    if (!user || finishing) return;
    setFinishing(true);
    try {
      await markComplete();
      await qc.invalidateQueries({ queryKey: ['onboarding-state', user.id] });
      await qc.refetchQueries({ queryKey: ['onboarding-state', user.id] });
      toast.success('Willkommen an Bord! 🎉');
      navigate('/app/client-portal', { replace: true });
    } catch (err) {
      console.error('[onboarding] markComplete failed', err);
      toast.error('Abschluss fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setFinishing(false);
    }
  };

  const handleEnableNotifications = async () => {
    if (notifLoading) return;
    setNotifLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Best-effort: register SW + subscribe in background
        try {
          await ensureServiceWorker();
          await subscribeToPush();
        } catch (e) {
          console.warn('[onboarding] push subscription failed', e);
        }
        toast.success('Danke! Du erhältst ab sofort Erinnerungen.');
      }
    } catch (e) {
      console.error('[onboarding] notification permission failed', e);
    } finally {
      setNotifLoading(false);
      goToStep(NAME_STEP);
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] relative overflow-hidden">
      {/* Subtle ambient gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at top, hsl(var(--primary) / 0.08), transparent 60%), radial-gradient(ellipse at bottom, hsl(var(--accent) / 0.06), transparent 60%)',
        }}
      />

      {/* Sticky progress */}
      <div className="sticky top-0 z-20 bg-background/85 backdrop-blur border-b border-border/50">
        <div className="mx-auto max-w-2xl px-5 pt-5 pb-3 sm:pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground tracking-wider">
              {step} / {TOTAL_STEPS}
            </span>
            <span className="text-xs text-primary font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> FinLife
            </span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      <div className="relative flex-1 mx-auto w-full max-w-2xl px-5 sm:px-6 pt-10 pb-14 sm:pt-14 sm:pb-20">
        <AnimatePresence mode="wait">
          {/* ─── STEP 1: Willkommen ─── */}
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 mb-8"
              >
                <span className="text-primary text-3xl leading-none">✦</span>
                <span className="text-2xl font-semibold tracking-tight text-foreground">
                  FinLife
                </span>
              </motion.div>

              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-5 leading-tight">
                Willkommen.
                <br />
                Du hast den ersten Schritt gemacht.
              </h1>
              <p className="text-base text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
                Diese App ist mehr als ein Finanz-Tool. Sie ist dein
                persönlicher Raum — um Klarheit zu gewinnen, Entscheidungen zu
                verstehen und finanziell in Ruhe zu kommen.
              </p>

              <div className="space-y-5 max-w-md mx-auto mb-12 text-left">
                <ValueRow
                  icon={<Search className="h-5 w-5" />}
                  title="Transparenz statt Intransparenz"
                  text="Du verstehst, was mit deinem Geld passiert. Immer. Ohne Fachjargon."
                />
                <ValueRow
                  icon={<Handshake className="h-5 w-5" />}
                  title="Wissen statt Unwissenheit"
                  text="Finanzwissen ist kein Privileg. Es gehört dir — verständlich und umsetzbar."
                />
                <ValueRow
                  icon={<Leaf className="h-5 w-5" />}
                  title="Gelassenheit statt Stress"
                  text="Finanzen müssen kein Angstthema sein. Wir bringen Ordnung, Klarheit und Ruhe."
                />
              </div>

              <Button
                size="lg"
                className="text-base px-8 py-6 rounded-xl"
                onClick={() => goToStep(2)}
              >
                Los geht's <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {/* ─── STEP 2: Unsere Haltung ─── */}
          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Unsere Haltung
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
                Was uns antreibt
              </h2>

              <div className="space-y-4 max-w-lg mx-auto text-left text-base sm:text-lg leading-relaxed text-foreground/90 mb-10">
                <p>Intransparenz gehört der Vergangenheit an.</p>
                <p>Unwissenheit ausnutzen gehört der Vergangenheit an.</p>
                <p>
                  Finanzprodukte, die niemand versteht, gehören der
                  Vergangenheit an.
                </p>
              </div>

              <div className="mx-auto w-16 h-px bg-border my-8" />

              <div className="max-w-lg mx-auto text-left space-y-5">
                <div>
                  <p className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
                    Was bleibt:
                  </p>
                  <p className="text-base sm:text-lg text-foreground/80 leading-relaxed">
                    Deine Ziele. Deine Werte. Dein Leben.
                  </p>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Wir glauben, dass jeder Mensch das Recht hat, seine
                  finanzielle Situation zu verstehen — nicht irgendwann,
                  sondern jetzt.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  — Daniel Seglias, Finanzberater
                </p>
              </div>

              <div className="mt-12 flex justify-center">
                <Button
                  size="lg"
                  className="text-base px-8 py-6 rounded-xl"
                  onClick={() => goToStep(3)}
                >
                  Das klingt richtig <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 3: Mitgliederbereich ─── */}
          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-10">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  Dein Mitgliederbereich
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                  Was dich erwartet
                </h2>
                <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Dein persönlicher Finanzbereich — strukturiert, vertraulich,
                  auf dich zugeschnitten.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto mb-10">
                <FeatureCard
                  icon={<LayoutDashboard className="h-5 w-5 text-primary" />}
                  title="Deine Finanz-Welt"
                  text="Absicherung, Ziele, Wissen und Anlagestrategie — alles an einem Ort."
                />
                <FeatureCard
                  icon={<MessageCircle className="h-5 w-5 text-primary" />}
                  title="Persönlicher Finanzcoach"
                  text="Ein KI-gestützter Assistent, der deine Fragen beantwortet. Immer verfügbar."
                />
                <FeatureCard
                  icon={<Wrench className="h-5 w-5 text-primary" />}
                  title="Finanzrechner"
                  text="Praktische Tools für konkrete Entscheidungen. Von 3a bis Zinseszins."
                />
                <FeatureCard
                  icon={<CalendarDays className="h-5 w-5 text-primary" />}
                  title="Dein Finanzkalender"
                  text="Erinnerungen für die Dinge, die wirklich wichtig sind. Kein wichtiger Termin geht vergessen."
                />
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="text-base px-8 py-6 rounded-xl"
                  onClick={() => goToStep(showNotifStep ? NOTIF_STEP : NAME_STEP)}
                >
                  Zeig mir mehr <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 4: Dein Name ─── */}
          {/* ─── STEP 4 (optional): Push-Benachrichtigungen ─── */}
          {showNotifStep && step === NOTIF_STEP && (
            <motion.div
              key="s-notif"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="text-center pt-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                <Bell className="h-7 w-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Bleib auf dem Laufenden 🔔
              </h2>
              <p className="text-base text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
                Erlaube Benachrichtigungen — so verpasst du keine wichtigen
                Erinnerungen mehr.
                <br />
                <span className="text-sm">
                  Wir senden dir nur relevante Hinweise, nie Spam.
                </span>
              </p>

              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <Button
                  size="lg"
                  className="text-base px-8 py-6 rounded-xl"
                  disabled={notifLoading}
                  onClick={handleEnableNotifications}
                >
                  {notifLoading ? 'Einen Moment…' : 'Benachrichtigungen erlauben'}
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-base"
                  disabled={notifLoading}
                  onClick={() => goToStep(NAME_STEP)}
                >
                  Später in den Einstellungen
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── STEP: Dein Name ─── */}
          {step === NAME_STEP && (
            <motion.div
              key="s4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="text-center pt-6"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Wie darf ich dich nennen?
              </h2>
              <p className="text-base text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
                Nur dein Vorname — damit die App sich wie ein persönlicher
                Raum anfühlt.
              </p>

              <div className="max-w-sm mx-auto">
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Dein Vorname"
                  autoFocus
                  className="text-center text-lg h-14 rounded-xl"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      if (await saveFirstName()) goToStep(5);
                    }
                  }}
                />
                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                  Deine Daten bleiben vertraulich. Erfahre mehr in unserer{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    Datenschutzerklärung
                  </a>
                  .
                </p>
              </div>

              <div className="mt-12 flex justify-center">
                <Button
                  size="lg"
                  className="text-base px-8 py-6 rounded-xl"
                  disabled={savingName}
                  onClick={async () => {
                    if (await saveFirstName()) goToStep(5);
                  }}
                >
                  Weiter <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 5: Du bist dabei ─── */}
          {step === 5 && (
            <motion.div
              key="s5"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center pt-4 relative"
            >
              <Confetti />
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 mt-4">
                Du bist dabei. 🎉
              </h2>
              <p className="text-base text-muted-foreground max-w-md mx-auto mb-12 leading-relaxed">
                Dein Mitgliederbereich ist bereit. Erkunde deine Finanz-Welt,
                stelle Fragen an den Finanzcoach oder schau dir die Werkzeuge
                an — in deinem eigenen Tempo.
              </p>

              <Button
                size="lg"
                className="text-base px-10 py-6 rounded-xl"
                onClick={finishOnboarding}
                disabled={finishing}
              >
                {finishing ? 'Wird abgeschlossen…' : 'Zur App'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <p className="mt-8 text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Bei Fragen erreichst du Daniel jederzeit über den Chat.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ───────── Helpers ───────── */

function ValueRow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm sm:text-base font-semibold text-foreground">
          {title}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-0.5">
          {text}
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 flex flex-col gap-2">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm font-semibold text-foreground mt-1">{title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 24 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: `${(i / 24) * 100}%`, opacity: 0 }}
          animate={{
            y: '100vh',
            opacity: [0, 1, 1, 0],
            rotate: 360 * (i % 2 ? 1 : -1),
          }}
          transition={{
            duration: 2.5 + (i % 5) * 0.4,
            ease: 'easeOut',
            delay: (i % 6) * 0.1,
          }}
          className="absolute w-2 h-3 bg-primary rounded-sm"
          style={{ top: 0 }}
        />
      ))}
    </div>
  );
}
