import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGamification } from '@/hooks/useGamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, ShieldCheck, ShieldAlert, ShieldX, ChevronRight, ChevronLeft, MessageCircle, FolderPlus, CheckCircle2, XCircle, HelpCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { InfoHint } from '@/components/client-portal/InfoHint';

type Status = 'yes' | 'no' | 'unclear' | null;

interface InsuranceItem {
  key: string;
  label: string;
  hint?: string;
  critical?: boolean;
  conditional?: string;
  articleId?: string;
}

interface Step {
  title: string;
  description: string;
  items: InsuranceItem[];
}

const STEPS: Step[] = [
  {
    title: 'Pflichtversicherungen',
    description: 'Gesetzlich vorgeschriebene Grundabsicherung',
    items: [
      { key: 'kvg', label: 'Krankenkasse Grundversicherung', critical: true, articleId: 'boersencrash-mythos' },
      { key: 'uvg', label: 'UVG (Unfallversicherung)', hint: 'Automatisch bei Anstellung', conditional: 'Nur bei Anstellung relevant', articleId: 'faq-sicherheit' },
      { key: 'ahv', label: 'AHV/IV Beiträge aktuell', critical: true, articleId: 'ahv-grundlagen' },
    ],
  },
  {
    title: 'Empfohlene Versicherungen',
    description: 'Wichtige Absicherungen für den Alltag',
    items: [
      { key: 'haftpflicht', label: 'Privathaftpflicht', critical: true, hint: 'Sehr empfohlen', articleId: 'faq-sicherheit' },
      { key: 'hausrat', label: 'Hausratversicherung', articleId: 'faq-sicherheit' },
      { key: 'rechtsschutz', label: 'Rechtsschutzversicherung', articleId: 'faq-sicherheit' },
      { key: 'krankentaggeld', label: 'Krankentaggeld', hint: 'Bei Selbstständigen kritisch', conditional: 'Besonders wichtig ohne Arbeitgeber', articleId: 'faq-sicherheit' },
    ],
  },
  {
    title: 'Situationsabhängig',
    description: 'Je nach Lebenssituation sinnvoll',
    items: [
      { key: 'leben', label: 'Lebensversicherung', conditional: 'Bei Familie oder Hypothek', critical: true, articleId: 'drei-saeulen-system' },
      { key: 'eu', label: 'Erwerbsunfähigkeitsversicherung', critical: true, articleId: 'faq-sicherheit' },
      { key: 'reise', label: 'Reiseversicherung' },
    ],
  },
];

const ALL_ITEMS = STEPS.flatMap(s => s.items);

const STATUS_CONFIG = {
  yes: { icon: CheckCircle2, label: '✓ Vorhanden', color: 'text-primary', bg: 'bg-primary/10 border-primary/30' },
  no: { icon: XCircle, label: '✗ Fehlt', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30' },
  unclear: { icon: HelpCircle, label: '? Unklar', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' },
};

interface Props {
  mode?: 'internal' | 'public';
}

export function VersicherungsCheckTool({ mode = 'internal' }: Props) {
  const navigate = useNavigate();
  const { awardPoints } = useGamification();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Status>>({});
  const [showResults, setShowResults] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  const setStatus = (key: string, status: Status) => {
    setAnswers(prev => ({ ...prev, [key]: prev[key] === status ? null : status }));
  };

  const stepProgress = ((currentStep + 1) / STEPS.length) * 100;

  const canProceed = useMemo(() => {
    const stepItems = STEPS[currentStep]?.items || [];
    return stepItems.every(item => answers[item.key] !== null && answers[item.key] !== undefined);
  }, [currentStep, answers]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResults(true);
      if (!xpAwarded && mode === 'internal') {
        awardPoints('tool_used', `versicherungs-check_${Date.now()}`);
        awardPoints('task_completed', `versicherungs-check-done_${Date.now()}`);
        setXpAwarded(true);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const results = useMemo(() => {
    const total = ALL_ITEMS.length;
    const covered = ALL_ITEMS.filter(i => answers[i.key] === 'yes').length;
    const missing = ALL_ITEMS.filter(i => answers[i.key] === 'no');
    const unclear = ALL_ITEMS.filter(i => answers[i.key] === 'unclear');
    const criticalMissing = missing.filter(i => i.critical);
    const fillPercent = Math.round((covered / total) * 100);
    return { total, covered, missing, unclear, criticalMissing, fillPercent };
  }, [answers]);

  if (showResults) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => { setShowResults(false); setCurrentStep(STEPS.length - 1); }} className="text-muted-foreground">
          ← Zurück zur Checkliste
        </Button>

        <Card className="border-primary/20">
          <CardContent className="py-8 text-center">
            <div className="relative inline-flex items-center justify-center mb-4">
              <Shield className={cn(
                "h-24 w-24",
                results.fillPercent >= 80 ? "text-primary" : results.fillPercent >= 50 ? "text-amber-500" : "text-destructive"
              )} />
              <span className="absolute text-lg font-bold text-foreground">{results.fillPercent}%</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {results.covered} von {results.total} Versicherungen vorhanden
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {results.fillPercent >= 80
                ? 'Sehr gut abgesichert! Nur wenige offene Punkte.'
                : results.fillPercent >= 50
                  ? 'Grundlegende Absicherung vorhanden, aber Lücken erkennbar.'
                  : 'Wichtige Versicherungen fehlen – Handlungsbedarf!'}
            </p>
          </CardContent>
        </Card>

        {results.criticalMissing.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="border-destructive/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                  <ShieldAlert className="h-4 w-4" /> Kritische Lücken
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {results.criticalMissing.map(item => (
                  <div key={item.key} className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/15">
                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      {item.conditional && <p className="text-[11px] text-muted-foreground">{item.conditional}</p>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {results.missing.filter(i => !i.critical).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-500">
                  <ShieldX className="h-4 w-4" /> Fehlend (optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {results.missing.filter(i => !i.critical).map(item => (
                  <div key={item.key} className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15">
                    <XCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <p className="text-sm">{item.label}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {results.unclear.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                  <HelpCircle className="h-4 w-4" /> Unklar – zu klären
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {results.unclear.map(item => (
                  <div key={item.key} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm">{item.label}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {results.covered > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-4 w-4" /> Gut abgesichert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {ALL_ITEMS.filter(i => answers[i.key] === 'yes').map(item => (
                    <span key={item.key} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1">
                      <CheckCircle2 className="h-3 w-3" /> {item.label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {mode === 'internal' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-col gap-2 pt-2">
            {(results.criticalMissing.length > 0 || results.unclear.length > 0) && (
              <Button className="w-full gap-2 h-12 rounded-xl" onClick={() => toast.success('Thema an Berater gesendet')}>
                <MessageCircle className="h-4 w-4" /> Lücken mit Berater besprechen
              </Button>
            )}
            <Button variant="outline" className="w-full gap-2 h-11 rounded-xl" onClick={() => navigate('/app/client-portal/insurances')}>
              <FolderPlus className="h-4 w-4" /> Versicherung jetzt hinterlegen
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  const step = STEPS[currentStep];

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Schritt {currentStep + 1} von {STEPS.length}</span>
          <span>{Math.round(stepProgress)}%</span>
        </div>
        <Progress value={stepProgress} className="h-2 transition-all duration-300" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-primary" />
                {step.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {step.items.map(item => {
                const current = answers[item.key];
                return (
                  <div key={item.key} className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        {item.hint && <p className="text-[11px] text-muted-foreground">{item.hint}</p>}
                        {item.conditional && <p className="text-[11px] text-muted-foreground italic">{item.conditional}</p>}
                        {item.articleId && <InfoHint text="" articleId={item.articleId} className="mt-0" />}
                      </div>
                      {item.critical && <span className="text-[10px] font-medium text-destructive bg-destructive/10 rounded px-1.5 py-0.5 shrink-0">Wichtig</span>}
                    </div>
                    <div className="flex gap-2">
                      {(['yes', 'no', 'unclear'] as const).map(status => {
                        const cfg = STATUS_CONFIG[status];
                        const Icon = cfg.icon;
                        const isActive = current === status;
                        return (
                          <button
                            key={status}
                            onClick={() => setStatus(item.key, status)}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border text-xs font-medium transition-all",
                              isActive ? cfg.bg : "border-border/50 bg-background hover:bg-accent/30"
                            )}
                          >
                            <Icon className={cn("h-3.5 w-3.5", isActive ? cfg.color : "text-muted-foreground")} />
                            <span className={isActive ? cfg.color : "text-muted-foreground"}>
                              {status === 'yes' ? 'Vorhanden' : status === 'no' ? 'Fehlt' : 'Unklar'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2">
        {currentStep > 0 && (
          <Button variant="outline" onClick={handleBack} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Zurück
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className={cn("flex-1 gap-2 h-11 rounded-xl", currentStep === STEPS.length - 1 && "bg-primary")}
        >
          {currentStep === STEPS.length - 1 ? (
            <>
              <Sparkles className="h-4 w-4" /> Auswertung anzeigen
            </>
          ) : (
            <>
              Weiter <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
