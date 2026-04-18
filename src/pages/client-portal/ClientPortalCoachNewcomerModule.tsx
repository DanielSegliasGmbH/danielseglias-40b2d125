import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useModuleProgress, useSaveCoachProgress, useEarnBadge } from '@/hooks/useCoachProgress';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, ChevronRight, CheckCircle, ExternalLink, Sparkles, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { NEWCOMER_MODULES, NEWCOMER_DB_PREFIX, NEWCOMER_BADGE_KEY } from '@/config/coachNewcomerModules';

export default function ClientPortalCoachNewcomerModule() {
  const { moduleKey } = useParams<{ moduleKey: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forceStart = searchParams.get('mode') === 'start';

  const mod = NEWCOMER_MODULES.find(m => m.key === moduleKey);
  const dbKey = mod ? `${NEWCOMER_DB_PREFIX}${mod.key}` : '';

  const { data: savedProgress, isLoading } = useModuleProgress(dbKey);
  const saveProgress = useSaveCoachProgress();
  const earnBadge = useEarnBadge();

  const [step, setStep] = useState<'intro' | 'questions' | 'action' | 'done'>('intro');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);

  if (!mod) {
    return (
      <ClientPortalLayout>
        <div className="p-8 text-center text-muted-foreground">Modul nicht gefunden.</div>
      </ClientPortalLayout>
    );
  }

  const Icon = mod.icon;
  const isCompleted = !forceStart && savedProgress?.status === 'completed';
  const totalSteps = mod.questions.length + 2; // intro + questions + action
  const currentStepNum = step === 'intro' ? 1 : step === 'questions' ? 2 + currentQ : step === 'action' ? totalSteps : totalSteps;
  const progressPct = Math.round((currentStepNum / totalSteps) * 100);

  const handleAnswer = (qId: string, answer: string) => {
    const newAnswers = { ...answers, [qId]: answer };
    setAnswers(newAnswers);

    // Save progress
    saveProgress.mutate({
      moduleKey: dbKey,
      updates: { status: 'in_progress', answers: JSON.stringify(newAnswers) },
    });

    // Move to next question or action step
    if (currentQ < mod.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setStep('action');
    }
  };

  const handleComplete = async () => {
    setStep('done');
    saveProgress.mutate({
      moduleKey: dbKey,
      updates: { status: 'completed', completed_at: new Date().toISOString(), answers: JSON.stringify(answers) },
    });

    // Award XP
    if (user) {
      await supabase.from('gamification_actions').insert({
        user_id: user.id,
        action_type: 'coach_newcomer_module',
        action_ref: dbKey,
        points_awarded: mod.xp,
      });
    }

    // Check if all newcomer modules completed
    if (user) {
      const { data: allProgress } = await supabase
        .from('coach_progress')
        .select('module_key, status')
        .eq('user_id', user.id)
        .like('module_key', 'newcomer_%');

      const completedKeys = new Set(
        (allProgress || []).filter(p => p.status === 'completed').map(p => p.module_key)
      );
      completedKeys.add(dbKey);

      const allDone = NEWCOMER_MODULES.every(m => completedKeys.has(`${NEWCOMER_DB_PREFIX}${m.key}`));
      if (allDone) {
        earnBadge.mutate({ moduleKey: NEWCOMER_BADGE_KEY, badgeType: 'finanz-starter' });
        toast.success('🎉 Badge freigeschaltet: Finanz-Starter!');
      }
    }
  };

  // Find next module
  const currentIdx = NEWCOMER_MODULES.findIndex(m => m.key === moduleKey);
  const nextModule = currentIdx < NEWCOMER_MODULES.length - 1 ? NEWCOMER_MODULES[currentIdx + 1] : null;

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-5 pb-8">
        {/* Back */}
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => navigate('/app/client-portal/coach')}>
          <ArrowLeft className="h-3.5 w-3.5" /> Zurück
        </Button>

        {/* Module header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{mod.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{mod.time}</span>
              <span>·</span>
              <span>+{mod.xp} XP</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={progressPct} className="h-1.5" />

        <AnimatePresence mode="wait">
          {/* Intro */}
          {step === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card>
                <CardContent className="py-8 px-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">{mod.intro}</p>
                  {isCompleted && (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="h-3 w-3" /> Bereits abgeschlossen
                    </Badge>
                  )}
                  <Button onClick={() => { setStep('questions'); setCurrentQ(0); }} className="gap-2">
                    {isCompleted ? 'Nochmal durchgehen' : 'Los geht\'s'} <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Questions */}
          {step === 'questions' && (
            <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card>
                <CardContent className="py-6 px-5 space-y-4">
                  <p className="text-xs text-muted-foreground">Frage {currentQ + 1} von {mod.questions.length}</p>
                  <p className="text-base font-medium text-foreground">{mod.questions[currentQ].question}</p>
                  {mod.questions[currentQ].type === 'choice' && (
                    <div className="space-y-2">
                      {mod.questions[currentQ].choices?.map(choice => (
                        <button
                          key={choice}
                          onClick={() => handleAnswer(mod.questions[currentQ].id, choice)}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                            answers[mod.questions[currentQ].id] === choice
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border hover:border-primary/50 text-foreground"
                          )}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action */}
          {step === 'action' && (
            <motion.div key="action" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card>
                <CardContent className="py-6 px-5 space-y-5 text-center">
                  <Sparkles className="h-8 w-8 text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">{mod.summary}</p>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => navigate(mod.actionLink.path)}
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> {mod.actionLink.label}
                  </Button>
                  <div className="pt-2">
                    <Button onClick={handleComplete} className="gap-2">
                      Modul abschliessen <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Done */}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-8 px-5 text-center space-y-4">
                  <PartyPopper className="h-10 w-10 text-primary mx-auto" />
                  <h2 className="text-lg font-bold text-foreground">Geschafft! 🎉</h2>
                  <p className="text-sm text-muted-foreground">+{mod.xp} XP verdient</p>
                  {nextModule ? (
                    <Button onClick={() => navigate(`/app/client-portal/coach-newcomer/${nextModule.key}?mode=start`)} className="gap-2">
                      Weiter: {nextModule.title} <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Badge variant="success" className="text-sm gap-1.5 px-3 py-1">
                        <CheckCircle className="h-4 w-4" /> Newcomer Coach abgeschlossen!
                      </Badge>
                      <p className="text-xs text-muted-foreground">Bereit für mehr? Der Original-Coach geht in die Tiefe.</p>
                      <Button variant="outline" onClick={() => navigate('/app/client-portal/coach')} className="gap-2">
                        Original Coach starten <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ClientPortalLayout>
  );
}
