import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Zap, AlertTriangle, Target, Share2, Download, Loader2, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { useMetaProfile } from '@/hooks/useMetaProfile';

/* ─── Questions ─── */
const QUESTIONS = [
  {
    id: 'q1',
    question: 'Am Ende des Monats ist auf deinem Konto meistens...',
    options: [
      { value: 'A', label: 'Mehr als am Anfang (ich spare regelmässig)' },
      { value: 'B', label: 'Ungefähr gleich viel' },
      { value: 'C', label: 'Weniger als am Anfang (es wird oft knapp)' },
    ],
  },
  {
    id: 'q2',
    question: 'Wenn du CHF 5\'000 geschenkt bekommst, was machst du?',
    options: [
      { value: 'A', label: 'Sofort anlegen oder sparen' },
      { value: 'B', label: 'Einen Teil sparen, einen Teil ausgeben' },
      { value: 'C', label: 'Mir etwas Schönes gönnen' },
    ],
  },
  {
    id: 'q3',
    question: 'Wie fühlst du dich beim Thema Investieren?',
    options: [
      { value: 'A', label: 'Interessiert, aber unsicher' },
      { value: 'B', label: 'Kenne mich nicht aus und will mich nicht damit befassen' },
      { value: 'C', label: 'Habe bereits Erfahrung' },
    ],
  },
  {
    id: 'q4',
    question: 'Wie oft schaust du auf deinen Kontostand?',
    options: [
      { value: 'A', label: 'Fast täglich' },
      { value: 'B', label: 'Ein paar Mal im Monat' },
      { value: 'C', label: 'Nur wenn ich muss (z.B. vor einer grösseren Ausgabe)' },
    ],
  },
  {
    id: 'q5',
    question: 'Was beschreibt dich besser?',
    options: [
      { value: 'A', label: 'Ich mache mir oft Sorgen ums Geld' },
      { value: 'B', label: 'Geld ist mir nicht so wichtig, Hauptsache es reicht' },
      { value: 'C', label: 'Ich weiss, dass ich mehr rausholen könnte' },
    ],
  },
  {
    id: 'q6',
    question: 'Deine Säule 3a...',
    options: [
      { value: 'A', label: 'Zahle ich jedes Jahr brav ein' },
      { value: 'B', label: 'Habe ich, aber nicht regelmässig' },
      { value: 'C', label: 'Was ist das genau?' },
    ],
  },
];

/* ─── Types ─── */
interface Quest {
  title: string;
  desc: string;
  route: string;
}

interface FinanzType {
  key: string;
  title: string;
  emoji: string;
  description: string;
  blindSpot: string;
  blindSpotCalc: (income: number) => string;
  motivation: string;
  quests: Quest[];
}

const FINANZ_TYPES: Record<string, FinanzType> = {
  skeptiker: {
    key: 'skeptiker',
    title: 'Der Sparsame Skeptiker',
    emoji: '🏦',
    description:
      'Du sparst fleissig, aber dein Geld arbeitet nicht für dich. Du hast Angst vor Verlusten und lässt dein Erspartes auf dem Konto liegen.',
    blindSpot:
      'Die Inflation frisst jährlich ca. 3% deines Ersparten. Bei CHF 50\'000 sind das CHF 1\'500/Jahr.',
    blindSpotCalc: () =>
      'Bei CHF 50\'000 Erspartem verlierst du ca. CHF 1\'500 pro Jahr an Kaufkraft.',
    motivation:
      'Sicherheit ist gut. Aber echte Sicherheit bedeutet, dass dein Geld wächst.',
    quests: [
      { title: 'Investment starten', desc: 'Lerne die Basics des Investierens', route: '/app/client-portal/coach/investment' },
      { title: '3a optimieren', desc: 'Vergleiche dein 3a-Produkt', route: '/app/client-portal/tools' },
      { title: 'Risikoprofil erstellen', desc: 'Finde heraus, welches Risiko zu dir passt', route: '/app/client-portal/coach/absicherung' },
    ],
  },
  geniesser: {
    key: 'geniesser',
    title: 'Der Planlose Geniesser',
    emoji: '🎢',
    description:
      'Du lebst im Moment – und das ist schön. Aber du hast keinen Plan und kein Polster. Eine unerwartete Ausgabe kann dich in Stress versetzen.',
    blindSpot:
      'Du verschwendest schätzungsweise 20% deines Einkommens.',
    blindSpotCalc: (income: number) => {
      const waste = Math.round(income * 0.2);
      return `Das sind ca. CHF ${waste.toLocaleString('de-CH')} pro Monat, die du nicht bewusst ausgibst.`;
    },
    motivation:
      'Du musst nicht auf Spass verzichten. Du musst nur wissen, wohin dein Geld geht.',
    quests: [
      { title: 'Budget erstellen', desc: 'Verschaffe dir Überblick über deine Ausgaben', route: '/app/client-portal/budget' },
      { title: '1 Woche tracken', desc: 'Notiere jede Ausgabe für 7 Tage', route: '/app/client-portal/budget' },
      { title: 'Erstes Sparziel setzen', desc: 'Definiere ein konkretes Ziel', route: '/app/client-portal/goals' },
    ],
  },
  pflichterfueller: {
    key: 'pflichterfueller',
    title: 'Der Pflichterfüller',
    emoji: '✅',
    description:
      'Du machst alles «richtig» – 3a, Versicherungen, Steuern abgeben. Aber du holst nicht das Maximum raus und lässt tausende Franken liegen.',
    blindSpot:
      'Falsches 3a-Produkt + nicht optimierte Krankenkasse = ca. CHF 2\'000–7\'000/Jahr Verlust.',
    blindSpotCalc: () =>
      'Durch Optimierung von 3a, Krankenkasse und Steuern kannst du CHF 2\'000–7\'000 pro Jahr sparen.',
    motivation:
      'Du bist nah dran. Mit ein paar Anpassungen sparst du tausende pro Jahr.',
    quests: [
      { title: '3a-Vergleich', desc: 'Ist dein 3a-Produkt wirklich das Beste?', route: '/app/client-portal/tools' },
      { title: 'Versicherungs-Check', desc: 'Zahlst du zu viel Prämie?', route: '/app/client-portal/tools' },
      { title: 'Steuer-Optimierung', desc: 'Nutzt du alle Abzüge?', route: '/app/client-portal/tools' },
    ],
  },
};

/* ─── Type Calculation ─── */
function calculateType(answers: Record<string, string>): string {
  const vals = Object.values(answers);
  const aCount = vals.filter(v => v === 'A').length;
  const bCount = vals.filter(v => v === 'B').length;
  const cCount = vals.filter(v => v === 'C').length;

  if (aCount >= 4) return 'skeptiker';
  if (cCount >= 4) return 'geniesser';
  if (bCount >= 4) return 'pflichterfueller';

  const weights: Record<string, number> = { q1: 2, q2: 2, q3: 1, q4: 1, q5: 1, q6: 1.5 };
  let sScore = 0, gScore = 0, pScore = 0;
  for (const [qid, answer] of Object.entries(answers)) {
    const w = weights[qid] || 1;
    if (answer === 'A') sScore += w;
    else if (answer === 'C') gScore += w;
    else if (answer === 'B') pScore += w;
  }

  if (sScore >= gScore && sScore >= pScore) return 'skeptiker';
  if (gScore >= sScore && gScore >= pScore) return 'geniesser';
  return 'pflichterfueller';
}

/* ─── Share Card ─── */
function FinanzTypShareCard({
  open, onOpenChange, typeInfo,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  typeInfo: FinanzType;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, useCORS: true, backgroundColor: null, logging: false,
      });
      return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/png', 1));
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleShare = useCallback(async () => {
    const blob = await generateImage();
    if (!blob) return;
    const file = new File([blob], 'mein-finanz-typ.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title: 'Mein Finanz-Typ', files: [file] });
      } catch { /* cancelled */ }
    } else {
      downloadBlob(blob);
    }
  }, [generateImage]);

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'mein-finanz-typ.png';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    toast.success('Bild gespeichert! 📸');
  };

  const handleDownload = useCallback(async () => {
    const blob = await generateImage();
    if (blob) downloadBlob(blob);
  }, [generateImage]);

  const supportsShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-4 gap-4">
        <div
          ref={cardRef}
          style={{
            width: 360, minHeight: 480,
            background: 'linear-gradient(160deg, #1a1a1a 0%, #2d2d1e 40%, #3d4a2a 100%)',
            borderRadius: 24, padding: 32,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            fontFamily: 'Inter, system-ui, sans-serif', color: '#ffffff',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>✦</span>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', opacity: 0.7, textTransform: 'uppercase' as const }}>
              Mein Finanz-Typ
            </span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
            <span style={{ fontSize: 56 }}>{typeInfo.emoji}</span>
            <p style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>{typeInfo.title}</p>
            <p style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.5 }}>{typeInfo.motivation}</p>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Was ist dein Finanz-Typ?</p>
            <p style={{ fontSize: 12, opacity: 0.4 }}>finlife.ch</p>
          </div>
        </div>
        <div className="flex gap-2">
          {supportsShare ? (
            <>
              <Button className="flex-1 gap-2" onClick={handleShare} disabled={generating}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />} Teilen
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleDownload} disabled={generating}>
                <Download className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button className="w-full gap-2" onClick={handleDownload} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Bild speichern
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Format date helper ─── */
function formatDateDE(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ─── Main Component ─── */
export default function ClientPortalFinanzTyp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { awardPoints } = useGamification();
  const { profile } = useMetaProfile();

  const [loading, setLoading] = useState(true);
  const [existingResult, setExistingResult] = useState<{ type: FinanzType; completedAt: string } | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [confirmRetakeOpen, setConfirmRetakeOpen] = useState(false);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<FinanzType | null>(null);
  const [saving, setSaving] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const totalSteps = QUESTIONS.length;
  const currentQ = QUESTIONS[step];
  const progressPercent = result ? 100 : Math.round((step / totalSteps) * 100);
  const monthlyIncome = (profile?.monthly_income as number) ?? 6000;

  // Load existing result on mount
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('finanz_type_results')
        .select('finanz_type, completed, updated_at')
        .eq('user_id', user.id)
        .eq('completed', true)
        .maybeSingle();

      if (data?.finanz_type && FINANZ_TYPES[data.finanz_type]) {
        setExistingResult({
          type: FINANZ_TYPES[data.finanz_type],
          completedAt: data.updated_at,
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const selectAnswer = useCallback((value: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
  }, [currentQ]);

  const handleNext = useCallback(async () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
      return;
    }

    setSaving(true);
    const finalAnswers = { ...answers, [currentQ.id]: answers[currentQ.id] };
    const typeKey = calculateType(finalAnswers);
    const typeInfo = FINANZ_TYPES[typeKey];

    if (user) {
      const { error } = await supabase.from('finanz_type_results').upsert({
        user_id: user.id,
        answers: finalAnswers,
        finanz_type: typeKey,
        completed: true,
      }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving finanz type:', error);
        toast.error('Fehler beim Speichern');
      } else {
        awardPoints('profile_completed', 'finanz-type-quiz');
      }
    }

    setResult(typeInfo);
    setExistingResult({ type: typeInfo, completedAt: new Date().toISOString() });
    setQuizMode(false);
    setSaving(false);
  }, [step, totalSteps, answers, currentQ, user, awardPoints]);

  const handleRetakeConfirm = () => {
    setConfirmRetakeOpen(false);
    setQuizMode(true);
    setStep(0);
    setAnswers({});
    setResult(null);
  };

  // Loading state
  if (loading) {
    return (
      <ClientPortalLayout>
        <ScreenHeader title="Finanz-Typ" backTo="/app/client-portal" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </ClientPortalLayout>
    );
  }

  // Determine what to show
  const displayResult = result || existingResult?.type;
  const completedAt = existingResult?.completedAt;
  const showResult = displayResult && !quizMode;

  /* ─── Result Screen ─── */
  if (showResult && displayResult) {
    return (
      <ClientPortalLayout>
        <ScreenHeader title="Finanz-Typ" backTo="/app/client-portal" />
        <div className="max-w-lg mx-auto space-y-6 pb-8">
          {/* Type Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2 pt-4"
          >
            <span className="text-6xl">{displayResult.emoji}</span>
            <h1 className="text-2xl font-bold text-foreground">{displayResult.title}</h1>
            {completedAt && (
              <p className="text-xs text-muted-foreground">
                Ermittelt am {formatDateDE(completedAt)}
              </p>
            )}
            {result && (
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" /> +100 XP
              </Badge>
            )}
          </motion.div>

          {/* Description Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {displayResult.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Blind Spot */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Dein grösster finanzieller Blind Spot
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {displayResult.blindSpot}
                </p>
                <p className="text-sm font-medium text-destructive">
                  {displayResult.blindSpotCalc(monthlyIncome)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Motivation */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-foreground italic">
                  «{displayResult.motivation}»
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quests */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Deine persönlichen Quests
            </h2>
            {displayResult.quests.map((quest, i) => (
              <Card
                key={i}
                className="cursor-pointer active:scale-[0.98] transition-all hover:shadow-md touch-manipulation"
                onClick={() => navigate(quest.route)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{quest.title}</h3>
                    <p className="text-xs text-muted-foreground">{quest.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full gap-2" onClick={() => navigate('/app/client-portal/coach')}>
              <Sparkles className="h-4 w-4" /> Zum Finanz-Coach
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={() => setShareOpen(true)}>
              <Share2 className="h-4 w-4" /> Typ teilen
            </Button>
          </div>

          <Separator />

          {/* Retake */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">Möchtest du deinen Typ neu bestimmen?</p>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => setConfirmRetakeOpen(true)}
            >
              <RotateCcw className="h-4 w-4" /> Test wiederholen 🔄
            </Button>
          </div>
        </div>

        <FinanzTypShareCard open={shareOpen} onOpenChange={setShareOpen} typeInfo={displayResult} />

        {/* Retake Confirmation Dialog */}
        <Dialog open={confirmRetakeOpen} onOpenChange={setConfirmRetakeOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Test wiederholen?</DialogTitle>
              <DialogDescription>
                Dein aktueller Typ wird überschrieben. Möchtest du fortfahren?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setConfirmRetakeOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleRetakeConfirm}>
                Ja, neu bestimmen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ClientPortalLayout>
    );
  }

  /* ─── Quiz Screen ─── */
  return (
    <ClientPortalLayout>
      <ScreenHeader title="Finanz-Typ" backTo="/app/client-portal" />
      <div className="max-w-lg mx-auto space-y-6 pb-8">
        <Progress value={progressPercent} className="h-1.5" />

        <div className="flex items-center justify-between">
          <Button
            variant="ghost" size="sm"
            onClick={() => {
              if (step > 0) {
                setStep(s => s - 1);
              } else if (existingResult) {
                setQuizMode(false);
              } else {
                navigate(-1);
              }
            }}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Zurück
          </Button>
          <span className="text-xs text-muted-foreground font-medium">
            {step + 1} / {totalSteps}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <h1 className="text-lg font-bold text-foreground leading-snug">
              {currentQ.question}
            </h1>

            <div className="space-y-2.5">
              {currentQ.options.map(opt => {
                const selected = answers[currentQ.id] === opt.value;
                return (
                  <Card
                    key={opt.value}
                    className={cn(
                      "cursor-pointer transition-all active:scale-[0.98] touch-manipulation",
                      selected ? "ring-2 ring-primary border-primary bg-primary/5" : "hover:border-primary/30"
                    )}
                    onClick={() => selectAnswer(opt.value)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                        selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {opt.value}
                      </div>
                      <span className="text-sm text-foreground">{opt.label}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <Button
          className="w-full gap-2"
          disabled={!answers[currentQ.id] || saving}
          onClick={handleNext}
        >
          {step < totalSteps - 1 ? (
            <>Weiter <ArrowRight className="h-4 w-4" /></>
          ) : saving ? 'Wird berechnet...' : (
            <>Ergebnis anzeigen <Sparkles className="h-4 w-4" /></>
          )}
        </Button>
      </div>
    </ClientPortalLayout>
  );
}
