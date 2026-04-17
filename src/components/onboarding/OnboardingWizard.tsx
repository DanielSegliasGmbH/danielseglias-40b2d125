import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingState, ONBOARDING_TOTAL_STEPS } from '@/hooks/useOnboardingState';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getRankForScore } from '@/hooks/usePeakScore';
import { cn } from '@/lib/utils';

/* ───────── Finanz-Typ Quick-Quiz (6 fragen, identische Logik wie ClientPortalFinanzTyp) ───────── */
const FT_QUESTIONS = [
  { id: 'q1', q: 'Am Ende des Monats ist auf deinem Konto meistens...', opts: [
    { v: 'A', l: 'Mehr als am Anfang' }, { v: 'B', l: 'Ungefähr gleich viel' }, { v: 'C', l: 'Weniger als am Anfang' } ] },
  { id: 'q2', q: 'CHF 5\'000 geschenkt – was machst du?', opts: [
    { v: 'A', l: 'Sofort anlegen oder sparen' }, { v: 'B', l: 'Teil sparen, Teil ausgeben' }, { v: 'C', l: 'Mir etwas gönnen' } ] },
  { id: 'q3', q: 'Wie fühlst du dich beim Investieren?', opts: [
    { v: 'A', l: 'Interessiert, aber unsicher' }, { v: 'B', l: 'Will mich nicht damit befassen' }, { v: 'C', l: 'Habe Erfahrung' } ] },
  { id: 'q4', q: 'Wie oft schaust du auf deinen Kontostand?', opts: [
    { v: 'A', l: 'Fast täglich' }, { v: 'B', l: 'Ein paar Mal pro Monat' }, { v: 'C', l: 'Nur wenn ich muss' } ] },
  { id: 'q5', q: 'Was beschreibt dich besser?', opts: [
    { v: 'A', l: 'Ich sorge mich oft ums Geld' }, { v: 'B', l: 'Geld ist mir nicht so wichtig' }, { v: 'C', l: 'Ich könnte mehr rausholen' } ] },
  { id: 'q6', q: 'Deine Säule 3a...', opts: [
    { v: 'A', l: 'Zahle ich jedes Jahr ein' }, { v: 'B', l: 'Habe ich, aber nicht regelmässig' }, { v: 'C', l: 'Was ist das?' } ] },
] as const;

const FT_LABEL: Record<string, { title: string; emoji: string; desc: string }> = {
  skeptiker:    { title: 'Der Sparsame Skeptiker',  emoji: '🛡️', desc: 'Du bist vorsichtig und schützt, was du hast. Jetzt lernst du, dein Geld klug arbeiten zu lassen.' },
  abenteurer:   { title: 'Der Abenteurer',          emoji: '🚀', desc: 'Du bist mutig und bereit für Chancen. Wir geben deinem Mut eine Strategie.' },
  pragmatiker:  { title: 'Der Pragmatiker',         emoji: '⚖️', desc: 'Du suchst Balance. Mit System wird aus „okay" ein echtes Vermögen.' },
  geniesser:    { title: 'Der Genießer',            emoji: '🌿', desc: 'Du lebst im Jetzt. Wir zeigen dir, wie du das beibehältst, ohne morgen zu verlieren.' },
  unsichere:    { title: 'Der Unsichere',           emoji: '🧭', desc: 'Du brauchst Klarheit. Genau die bekommst du jetzt – Schritt für Schritt.' },
  visionaer:    { title: 'Der Visionär',            emoji: '🌟', desc: 'Du denkst gross. Lass uns deine Vision in einen Plan verwandeln.' },
};

function calcFinanzType(answers: Record<string, string>): string {
  const counts: Record<string, number> = { A: 0, B: 0, C: 0 };
  Object.values(answers).forEach(v => { if (v in counts) counts[v]++; });
  const a = counts.A, b = counts.B, c = counts.C;
  if (a >= 4) return 'skeptiker';
  if (c >= 4) return 'geniesser';
  if (b >= 3) return 'pragmatiker';
  if (a >= 2 && c >= 2) return 'visionaer';
  if (b >= 2 && c >= 2) return 'abenteurer';
  return 'unsichere';
}

/* ───────── Component ───────── */
export function OnboardingWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { state, setStep, markComplete } = useOnboardingState();

  const [step, setStepLocal] = useState<number>(state?.currentStep ?? 1);

  // Resume: when state loads, jump to saved step
  useEffect(() => {
    if (state?.currentStep && state.currentStep !== step) {
      setStepLocal(state.currentStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.currentStep]);

  // Step 2 form state, prefilled from existing meta_profile (resume-safe)
  const { data: profileData } = useQuery({
    queryKey: ['onb-profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return null;
      const [{ data: p }, { data: m }] = await Promise.all([
        supabase.from('profiles').select('first_name').eq('id', user.id).maybeSingle(),
        supabase.from('meta_profiles').select('age, professional_status, monthly_income, fixed_costs, wealth').eq('user_id', user.id).maybeSingle(),
      ]);
      return { firstName: p?.first_name ?? '', meta: m };
    },
  });

  const [basics, setBasics] = useState({
    firstName: '',
    age: '' as string,
    professionalStatus: '' as 'employed' | 'self_employed' | 'student' | '',
    monthlyIncome: '' as string,
    monthlyExpenses: '' as string,
    wealth: '' as string,
  });

  useEffect(() => {
    if (!profileData) return;
    setBasics(b => ({
      firstName: b.firstName || profileData.firstName || '',
      age: b.age || (profileData.meta?.age?.toString() ?? ''),
      professionalStatus: b.professionalStatus || ((profileData.meta?.professional_status as 'employed'|'self_employed'|'student'|undefined) ?? ''),
      monthlyIncome: b.monthlyIncome || (profileData.meta?.monthly_income?.toString() ?? ''),
      monthlyExpenses: b.monthlyExpenses || (profileData.meta?.fixed_costs?.toString() ?? ''),
      wealth: b.wealth || (profileData.meta?.wealth?.toString() ?? ''),
    }));
  }, [profileData]);

  // Step 3 (Finanz-Typ) state
  const [ftAnswers, setFtAnswers] = useState<Record<string, string>>({});
  const [ftIndex, setFtIndex] = useState(0);
  const [ftResult, setFtResult] = useState<string | null>(null);
  const [ftSaving, setFtSaving] = useState(false);

  // Load existing FT result on resume
  useEffect(() => {
    if (!user || step !== 3) return;
    supabase.from('finanz_type_results').select('finanz_type, completed').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data?.completed && data.finanz_type) setFtResult(data.finanz_type);
    });
  }, [user, step]);

  // Step 4 (Avatar) state
  const [avatar, setAvatar] = useState({ name: '', age: 50, definingMoment: '' });
  const [avatarSaving, setAvatarSaving] = useState(false);

  useEffect(() => {
    if (!user || step !== 4) return;
    supabase.from('user_avatars').select('future_self_name, future_self_age, future_self_defining_moment').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data) setAvatar({
        name: data.future_self_name ?? '',
        age: data.future_self_age ?? 50,
        definingMoment: data.future_self_defining_moment ?? '',
      });
    });
  }, [user, step]);

  // Step 5 (Manifest)
  const [manifestAccepted, setManifestAccepted] = useState(false);

  // Step 6 PeakScore
  const peakScore = useMemo(() => {
    const exp = Number(basics.monthlyExpenses);
    const w = Number(basics.wealth);
    if (!exp || exp <= 0) return null;
    return Math.max(0, Math.round((w / exp) * 10) / 10);
  }, [basics.monthlyExpenses, basics.wealth]);

  const peakRank = peakScore !== null ? getRankForScore(peakScore) : null;

  /* ── Persist current step on change ── */
  const goToStep = async (next: number) => {
    const safe = Math.max(1, Math.min(ONBOARDING_TOTAL_STEPS, next));
    setStepLocal(safe);
    try { await setStep(safe); } catch (e) { /* non-blocking */ }
  };

  /* ── Step 2 save ── */
  const saveBasics = async (): Promise<boolean> => {
    if (!user) return false;
    if (!basics.firstName.trim() || !basics.age || !basics.professionalStatus || !basics.monthlyIncome || !basics.monthlyExpenses || !basics.wealth) {
      toast.error('Bitte alle Felder ausfüllen.');
      return false;
    }
    const ageNum = Number(basics.age);
    if (!Number.isFinite(ageNum) || ageNum < 14 || ageNum > 110) { toast.error('Bitte gültiges Alter eingeben.'); return false; }

    // 1. Profile first_name
    await supabase.from('profiles').update({ first_name: basics.firstName.trim() }).eq('id', user.id);

    // 2. meta_profile upsert
    const { error } = await supabase.from('meta_profiles').upsert({
      user_id: user.id,
      age: ageNum,
      professional_status: basics.professionalStatus,
      monthly_income: Number(basics.monthlyIncome),
      fixed_costs: Number(basics.monthlyExpenses),
      wealth: Number(basics.wealth),
      last_confirmed_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (error) { toast.error('Speichern fehlgeschlagen.'); return false; }
    qc.invalidateQueries({ queryKey: ['onb-profile', user.id] });
    return true;
  };

  /* ── Step 3 save ── */
  const saveFinanzType = async (typeKey: string) => {
    if (!user) return;
    setFtSaving(true);
    await supabase.from('finanz_type_results').upsert({
      user_id: user.id, answers: ftAnswers, finanz_type: typeKey, completed: true,
    }, { onConflict: 'user_id' });
    setFtSaving(false);
  };

  /* ── Step 4 save ── */
  const saveAvatar = async (): Promise<boolean> => {
    if (!user) return false;
    if (avatar.name.trim().length < 2 || avatar.definingMoment.trim().length < 3) {
      toast.error('Bitte Name und prägenden Moment ausfüllen.');
      return false;
    }
    setAvatarSaving(true);
    const { error } = await supabase.from('user_avatars').upsert({
      user_id: user.id,
      future_self_name: avatar.name.trim(),
      future_self_age: avatar.age,
      future_self_defining_moment: avatar.definingMoment.trim(),
      avatar_completed: true,
    }, { onConflict: 'user_id' });
    setAvatarSaving(false);
    if (error) { toast.error('Speichern fehlgeschlagen.'); return false; }
    return true;
  };

  /* ── Step 5 save ── */
  const saveManifest = async () => {
    if (!user) return;
    await supabase.from('user_manifest_acceptance').upsert({
      user_id: user.id, accepted_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    setManifestAccepted(true);
  };

  /* ── Step 6 save & complete ── */
  const [finishing, setFinishing] = useState(false);
  const finishOnboarding = async () => {
    if (!user || finishing) return;
    setFinishing(true);
    try {
      if (peakScore !== null) {
        const { error: psErr } = await supabase
          .from('peak_scores')
          .insert({ user_id: user.id, score: peakScore, is_snapshot: true });
        if (psErr) console.warn('[onboarding] peak_scores insert failed (non-fatal)', psErr);
      }
      try {
        await markComplete();
      } catch (err) {
        console.error('[onboarding] markComplete failed', err);
        toast.error('Abschluss fehlgeschlagen. Bitte erneut versuchen.');
        setFinishing(false);
        return;
      }
      // Ensure OnboardingGate re-reads the completed state immediately.
      await qc.invalidateQueries({ queryKey: ['onboarding-state', user.id] });
      await qc.refetchQueries({ queryKey: ['onboarding-state', user.id] });
      toast.success('Willkommen an Bord! 🎉');
      navigate('/app/client-portal', { replace: true });
    } finally {
      setFinishing(false);
    }
  };

  /* ───────── Render ───────── */
  const progress = (step / ONBOARDING_TOTAL_STEPS) * 100;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Sticky progress */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground tracking-wider">
              SCHRITT {step} VON {ONBOARDING_TOTAL_STEPS}
            </span>
            <span className="text-xs text-primary font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> FinLife
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      <div className="flex-1 mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
        <AnimatePresence mode="wait">
          {/* ─── STEP 1: Welcome ─── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="text-center pt-6">
              <div className="text-6xl mb-6">🌟</div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Willkommen bei FinLife</h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-3 max-w-md mx-auto">
                In den nächsten 5 Minuten richten wir alles für dich ein.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-md mx-auto">
                Danach kennst du deinen <strong className="text-foreground">PeakScore</strong>, deinen <strong className="text-foreground">Finanz-Typ</strong> und dein <strong className="text-foreground">Zukunfts-Ich</strong>.
              </p>
              <Button size="lg" className="text-base px-8 py-6 rounded-xl" onClick={() => goToStep(2)}>
                Los geht's <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {/* ─── STEP 2: Basis-Daten ─── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Deine Basis-Daten</h2>
              <p className="text-muted-foreground mb-6">Damit wir alles für dich berechnen können. Schätzungen reichen.</p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input id="firstName" value={basics.firstName} onChange={e => setBasics({ ...basics, firstName: e.target.value })} className="text-base" />
                </div>
                <div>
                  <Label htmlFor="age">Alter</Label>
                  <Input id="age" inputMode="numeric" value={basics.age} onChange={e => setBasics({ ...basics, age: e.target.value.replace(/\D/g, '') })} className="text-base" />
                </div>
                <div>
                  <Label>Beruflicher Status</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {([['employed','Angestellt'],['self_employed','Selbstständig'],['student','Student']] as const).map(([v,l]) => (
                      <button key={v} type="button" onClick={() => setBasics({ ...basics, professionalStatus: v })}
                        className={cn('rounded-lg border px-3 py-3 text-sm font-medium transition-colors',
                          basics.professionalStatus === v ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-background text-muted-foreground hover:bg-muted')}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="income">Monatliches Bruttoeinkommen (CHF)</Label>
                  <Input id="income" inputMode="numeric" value={basics.monthlyIncome} onChange={e => setBasics({ ...basics, monthlyIncome: e.target.value.replace(/\D/g, '') })} className="text-base" />
                </div>
                <div>
                  <Label htmlFor="exp">Monatliche Ausgaben gesamt (CHF)</Label>
                  <Input id="exp" inputMode="numeric" value={basics.monthlyExpenses} onChange={e => setBasics({ ...basics, monthlyExpenses: e.target.value.replace(/\D/g, '') })} className="text-base" />
                </div>
                <div>
                  <Label htmlFor="wealth">Aktuelles Vermögen (CHF, ungefähr)</Label>
                  <Input id="wealth" inputMode="numeric" value={basics.wealth} onChange={e => setBasics({ ...basics, wealth: e.target.value.replace(/\D/g, '') })} className="text-base" />
                </div>
              </div>
              <NavRow onBack={() => goToStep(1)} onNext={async () => { if (await saveBasics()) goToStep(3); }} />
            </motion.div>
          )}

          {/* ─── STEP 3: Finanz-Typ ─── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Dein Finanz-Typ</h2>
              <p className="text-muted-foreground mb-6">6 schnelle Fragen. Ehrlich antworten.</p>

              {!ftResult ? (
                <Card className="border-border">
                  <CardContent className="p-5 sm:p-6">
                    <p className="text-xs font-medium text-muted-foreground mb-3 tracking-wider">FRAGE {ftIndex + 1} / {FT_QUESTIONS.length}</p>
                    <p className="text-lg font-semibold text-foreground mb-5">{FT_QUESTIONS[ftIndex].q}</p>
                    <div className="space-y-2">
                      {FT_QUESTIONS[ftIndex].opts.map(opt => (
                        <button key={opt.v} type="button"
                          onClick={async () => {
                            const next = { ...ftAnswers, [FT_QUESTIONS[ftIndex].id]: opt.v };
                            setFtAnswers(next);
                            if (ftIndex + 1 < FT_QUESTIONS.length) {
                              setFtIndex(ftIndex + 1);
                            } else {
                              const typeKey = calcFinanzType(next);
                              await saveFinanzType(typeKey);
                              setFtResult(typeKey);
                            }
                          }}
                          className="w-full text-left rounded-lg border border-border bg-background p-4 text-sm hover:border-primary hover:bg-primary/5 transition-colors">
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-4">
                  <div className="text-6xl mb-4">{FT_LABEL[ftResult]?.emoji}</div>
                  <p className="text-sm text-muted-foreground mb-1">Du bist...</p>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{FT_LABEL[ftResult]?.title}</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">{FT_LABEL[ftResult]?.desc}</p>
                  <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> +100 XP
                  </div>
                </div>
              )}

              <NavRow onBack={() => goToStep(2)} onNext={() => goToStep(4)} disabled={!ftResult || ftSaving} />
            </motion.div>
          )}

          {/* ─── STEP 4: Avatar / Zukunfts-Ich ─── */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Dein Zukunfts-Ich</h2>
              <p className="text-muted-foreground mb-6">Wer wirst du in einigen Jahren sein? Gib deinem stärkeren Ich einen Namen.</p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="aname">Name deines Zukunfts-Ich</Label>
                  <Input id="aname" value={avatar.name} onChange={e => setAvatar({ ...avatar, name: e.target.value })}
                    placeholder="z.B. Alexander, Der Souverän, Free Spirit..." className="text-base" />
                  <p className="text-xs text-muted-foreground mt-1">Ein Zweitname, ein Vorbild oder ein erfundener Held.</p>
                </div>
                <div>
                  <Label htmlFor="aage">Alter deines Zukunfts-Ich</Label>
                  <Input id="aage" type="number" min={Number(basics.age || 30) + 5} max={100} value={avatar.age}
                    onChange={e => setAvatar({ ...avatar, age: Number(e.target.value) })} className="text-base" />
                </div>
                <div>
                  <Label htmlFor="adef">Was hat dieses Ich erreicht?</Label>
                  <Input id="adef" value={avatar.definingMoment} onChange={e => setAvatar({ ...avatar, definingMoment: e.target.value })}
                    placeholder="z.B. Finanzielle Freiheit, eigenes Haus..." className="text-base" />
                </div>
              </div>

              <div className="mt-5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> +100 XP nach Speichern
              </div>

              <NavRow onBack={() => goToStep(3)} onNext={async () => { if (await saveAvatar()) goToStep(5); }} disabled={avatarSaving} />
            </motion.div>
          )}

          {/* ─── STEP 5: Manifest ─── */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center min-h-[60vh] flex flex-col items-center justify-center">
              <p className="text-base sm:text-lg text-muted-foreground mb-4">Geld ist nicht das Ziel.</p>
              <p className="text-base sm:text-lg text-muted-foreground mb-8">Geld ist das Werkzeug.</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 max-w-md">
                Bist du der Spielball deines Geldes?
              </h2>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-8 max-w-md">
                Oder bist du der Spieler?
              </h2>
              <p className="text-base text-muted-foreground mb-8">Ab heute bist du der Spieler.</p>
              <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary mb-6">
                <Sparkles className="h-3.5 w-3.5" /> +250 XP
              </div>
              <NavRow
                onBack={() => goToStep(4)}
                onNext={async () => { await saveManifest(); goToStep(6); }}
                nextLabel="Spiel starten"
              />
            </motion.div>
          )}

          {/* ─── STEP 6: PeakScore + complete ─── */}
          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="text-center pt-4">
              <Confetti />
              <p className="text-sm text-muted-foreground mb-2 tracking-wider">DEIN ERSTER PEAKSCORE</p>
              <div className="text-6xl sm:text-7xl font-bold text-foreground mb-2">
                {peakScore !== null ? peakScore : '–'}
                <span className="text-2xl text-muted-foreground ml-2">Monate</span>
              </div>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                So lange könntest du heute leben, ohne zu arbeiten.
              </p>

              {peakRank && (
                <div className="mb-6">
                  <div className="text-5xl mb-2">{peakRank.emoji}</div>
                  <p className="text-lg font-semibold text-foreground">{peakRank.name}</p>
                  <p className="text-xs text-muted-foreground">Dein aktueller Rang</p>
                </div>
              )}

              {avatar.name && (
                <p className="text-sm text-muted-foreground mb-8">
                  Dein Ziel: <strong className="text-foreground">{avatar.name}</strong> wartet.
                </p>
              )}

              <Button size="lg" className="text-base px-8 py-6 rounded-xl" onClick={finishOnboarding} disabled={finishing}>
                {finishing ? 'Wird abgeschlossen…' : 'Dashboard öffnen'} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ───────── Helpers ───────── */
function NavRow({ onBack, onNext, nextLabel = 'Weiter', disabled }: { onBack?: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean }) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      {onBack ? (
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-1.5 h-4 w-4" /> Zurück</Button>
      ) : <span />}
      <Button onClick={onNext} disabled={disabled} className="rounded-xl">
        {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{nextLabel} <ArrowRight className="ml-1.5 h-4 w-4" /></>}
      </Button>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 24 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => (
        <motion.div key={i}
          initial={{ y: -20, x: `${(i / 24) * 100}%`, opacity: 0 }}
          animate={{ y: '100vh', opacity: [0, 1, 1, 0], rotate: 360 * (i % 2 ? 1 : -1) }}
          transition={{ duration: 2.5 + (i % 5) * 0.4, ease: 'easeOut', delay: (i % 6) * 0.1 }}
          className="absolute w-2 h-3 bg-primary rounded-sm" style={{ top: 0 }} />
      ))}
    </div>
  );
}
