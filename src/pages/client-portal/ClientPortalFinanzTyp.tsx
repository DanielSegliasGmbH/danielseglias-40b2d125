import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

type FinanzType = {
  key: string;
  title: string;
  emoji: string;
  description: string;
  strengths: string[];
  tips: string[];
};

const FINANZ_TYPES: Record<string, FinanzType> = {
  sparfuchs: {
    key: 'sparfuchs',
    title: 'Der Sparfuchs',
    emoji: '🦊',
    description: 'Du bist diszipliniert und hast deine Finanzen gut im Griff. Du sparst regelmässig und denkst langfristig.',
    strengths: ['Hohe Sparquote', 'Diszipliniert', 'Vorausschauend'],
    tips: ['Prüfe, ob dein Geld für dich arbeitet', 'Optimiere deine Säule 3a Strategie', 'Diversifiziere deine Anlagen'],
  },
  balancer: {
    key: 'balancer',
    title: 'Der Balancer',
    emoji: '⚖️',
    description: 'Du findest eine gute Balance zwischen Sparen und Geniessen. Mit etwas mehr Struktur kannst du viel erreichen.',
    strengths: ['Ausgeglichener Lebensstil', 'Gutes Gespür für Prioritäten', 'Flexibel'],
    tips: ['Automatisiere dein Sparen', 'Setze dir konkrete Finanzziele', 'Starte mit der Säule 3a'],
  },
  geniesser: {
    key: 'geniesser',
    title: 'Der Geniesser',
    emoji: '🎉',
    description: 'Du lebst im Hier und Jetzt — das ist wunderbar! Aber dein zukünftiges Ich wird dir danken, wenn du jetzt anfängst.',
    strengths: ['Lebensfreude', 'Spontanität', 'Grosszügigkeit'],
    tips: ['Starte mit kleinen, automatischen Sparraten', 'Lerne die Basics der Vorsorge', 'Der beste Zeitpunkt zu starten ist JETZT'],
  },
  stratege: {
    key: 'stratege',
    title: 'Der Stratege',
    emoji: '🧠',
    description: 'Du denkst analytisch und hast bereits Erfahrung mit Finanzen. Du weisst, was möglich ist — und willst mehr.',
    strengths: ['Finanzkompetenz', 'Zielorientiert', 'Analytisches Denken'],
    tips: ['Optimiere deine Kostenstruktur', 'Prüfe alternative Anlagestrategien', 'Plane deine finanzielle Freiheit'],
  },
  entdecker: {
    key: 'entdecker',
    title: 'Der Entdecker',
    emoji: '🧭',
    description: 'Du stehst am Anfang deiner finanziellen Reise. Das Gute: Du bist hier — und das ist der wichtigste erste Schritt.',
    strengths: ['Offenheit', 'Lernbereitschaft', 'Neugier'],
    tips: ['Verschaffe dir einen Überblick über deine Situation', 'Verstehe die Grundlagen der Schweizer Vorsorge', 'Nutze den Finanz-Coach als Guide'],
  },
};

function calculateType(answers: Record<string, string>): string {
  const vals = Object.values(answers);
  const aCount = vals.filter(v => v === 'A').length;
  const cCount = vals.filter(v => v === 'C').length;

  // Q3=C and Q6=A → experienced
  if (answers.q3 === 'C' && answers.q6 === 'A') return 'stratege';
  // Mostly A → disciplined saver
  if (aCount >= 4) return 'sparfuchs';
  // Mostly C → enjoys life
  if (cCount >= 4) return 'geniesser';
  // Q3=B and Q6=C → beginner
  if (answers.q3 === 'B' && answers.q6 === 'C') return 'entdecker';
  // Default balanced
  return 'balancer';
}

export default function ClientPortalFinanzTyp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { awardPoints } = useGamification();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<FinanzType | null>(null);
  const [saving, setSaving] = useState(false);

  const totalSteps = QUESTIONS.length;
  const currentQ = QUESTIONS[step];
  const progressPercent = result ? 100 : Math.round((step / totalSteps) * 100);

  const selectAnswer = useCallback((value: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
  }, [currentQ]);

  const handleNext = useCallback(async () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
      return;
    }

    // Last question answered → calculate & save
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
    setSaving(false);
  }, [step, totalSteps, answers, currentQ, user, awardPoints]);

  // Result screen
  if (result) {
    return (
      <ClientPortalLayout>
        <div className="max-w-lg mx-auto space-y-6 pb-8">
          <Progress value={100} className="h-1.5" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2 pt-4"
          >
            <span className="text-6xl">{result.emoji}</span>
            <h1 className="text-2xl font-bold text-foreground">{result.title}</h1>
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" /> +200 XP
            </Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-5 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.description}
                </p>

                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Deine Stärken
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.strengths.map(s => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Nächste Schritte für dich
                  </h3>
                  <ul className="space-y-2">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-2">
            <Button
              className="w-full gap-2"
              onClick={() => navigate('/app/client-portal/coach')}
            >
              <Sparkles className="h-4 w-4" />
              Zum Finanz-Coach
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/app/client-portal')}
            >
              Zur Übersicht
            </Button>
          </div>
        </div>
      </ClientPortalLayout>
    );
  }

  // Quiz screen
  return (
    <ClientPortalLayout>
      <div className="max-w-lg mx-auto space-y-6 pb-8">
        <Progress value={progressPercent} className="h-1.5" />

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
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
                      selected
                        ? "ring-2 ring-primary border-primary bg-primary/5"
                        : "hover:border-primary/30"
                    )}
                    onClick={() => selectAnswer(opt.value)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
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
