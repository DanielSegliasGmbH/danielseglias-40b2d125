import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Lock, Crown, Sparkles, Flame, ArrowRight, Map, TrendingUp, Award, Clock, Target } from 'lucide-react';
import { useFeatureUnlock } from '@/hooks/useFeatureUnlock';
import { useGamification } from '@/hooks/useGamification';
import { usePeakScore, getRankForScore } from '@/hooks/usePeakScore';
import { useNextBestStep } from '@/hooks/useNextBestStep';
import { JOURNEY_PHASES } from '@/config/journeyPhases';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';

const FEATURE_LABELS: Record<string, string> = {
  onboarding: 'Onboarding', 'finanz-typ': 'Finanz-Typ Quiz', avatar: 'Avatar',
  lebensfilm: 'Lebensfilm', manifest: 'Manifest', dashboard: 'Dashboard',
  peakscore: 'PeakScore', finanzprofil: 'Mein Finanzprofil', snapshot: 'Mein Snapshot',
  budget: 'Mein Budget', goals: 'Meine Ziele', tasks: 'Meine Aufgaben',
  library: 'Wissensbibliothek', 'coach-newcomer': 'Finanz-Coach Newcomer',
  chat: 'Chat mit Berater', erinnerungen: 'Erinnerungen',
  'konten-modell': 'Konten-Modell', 'was-kostet-das': 'Was kostet das wirklich?',
  'jetzt-vs-spaeter': 'Jetzt vs. Später', gewohnheiten: 'Gewohnheiten-Tracker',
  'community-read': 'Community (Lesen)', 'freunde-einladen': 'Freunde einladen',
  'steuer-check': 'Steuer-Check', steuerrechner: 'Steuerrechner',
  'versicherungs-check': 'Versicherungs-Check', 'krankenkassen-tracker': 'Krankenkassen-Tracker',
  'abo-audit': 'Abo-Audit', 'notfall-check': 'Notfall-Check',
  '3-saeulen-rechner': '3-Säulen-Rechner', 'guilty-pleasure': 'Guilty Pleasure',
  'coach-original': 'Finanz-Coach Original', humankapital: 'Humankapital-Tool',
  finanzplan: 'Mein Finanzplan', lohnerhoher: 'Lohnerhöher',
  strategien: 'Anlagestrategien', 'community-post': 'Community (Posten)',
  'paar-modus': 'Paar-Modus', challenges: 'Challenges',
  'ahv-tracker': 'AHV-Tracker', sozialabgaben: 'Sozialabgaben',
  'letzter-plan': 'Mein letzter Plan', expat: 'Expat-Szenarien',
  immobilien: 'Investmentimmobilien', 'schatten-zwilling': 'Schatten-Zwilling',
  'freiheits-goal-advanced': 'Freiheits-Goal', 'all-remaining': 'Alle Features',
  'advanced-simulations': 'Simulationen', 'finanz-meister-badge': 'Finanz-Meister',
};

export default function ClientPortalJourney() {
  const navigate = useNavigate();
  const { currentPhase, daysSinceSignup, isUnlocked, isPremium, loading, nextPhaseInfo, currentPhaseInfo } = useFeatureUnlock();
  const { points, streakDays, awardPoints } = useGamification();
  const { score, rank: peakRank } = usePeakScore();
  const { data: nextStepResult } = useNextBestStep();
  const hasAwarded = useRef(false);

  // Award XP on first visit
  useEffect(() => {
    if (!hasAwarded.current && !loading) {
      hasAwarded.current = true;
      awardPoints('tool_used', 'journey-page');
    }
  }, [loading]);

  if (loading) {
    return (
      <ClientPortalLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </ClientPortalLayout>
    );
  }

  const totalFeatures = JOURNEY_PHASES.flatMap(p => p.featureKeys).length;
  const unlockedCount = JOURNEY_PHASES.flatMap(p => p.featureKeys).filter(k => isUnlocked(k)).length;
  const progressPct = Math.round((unlockedCount / totalFeatures) * 100);

  // Estimated days to next phase
  const daysToNext = nextPhaseInfo?.gate.daysSinceSignup
    ? Math.max(0, nextPhaseInfo.gate.daysSinceSignup - daysSinceSignup)
    : null;

  // Quick actions based on current state
  const quickActions: { label: string; path: string; emoji: string }[] = [];
  if (currentPhase <= 1) {
    quickActions.push(
      { label: 'Snapshot erstellen', path: '/app/client-portal/snapshot', emoji: '📸' },
      { label: 'Finanz-Coach starten', path: '/app/client-portal/coach-newcomer', emoji: '🧭' },
      { label: 'Erste Aufgabe erledigen', path: '/app/client-portal/tasks', emoji: '✅' },
    );
  } else if (currentPhase === 2) {
    quickActions.push(
      { label: 'Konten-Modell einrichten', path: '/app/client-portal/tools', emoji: '🏦' },
      { label: 'Gewohnheit starten', path: '/app/client-portal/habits', emoji: '📋' },
      { label: 'Community entdecken', path: '/app/client-portal/community', emoji: '👥' },
    );
  } else if (currentPhase === 3) {
    quickActions.push(
      { label: 'Steuer-Check machen', path: '/app/client-portal/tools', emoji: '📋' },
      { label: 'Versicherungs-Check', path: '/app/client-portal/tools', emoji: '🛡️' },
      { label: 'Notfall-Check', path: '/app/client-portal/tools', emoji: '🚨' },
    );
  } else {
    if (nextStepResult?.primary) {
      quickActions.push({ label: nextStepResult.primary.title, path: nextStepResult.primary.path, emoji: '⚡' });
    }
    quickActions.push(
      { label: 'Coach Modul fortsetzen', path: '/app/client-portal/coach', emoji: '🧠' },
      { label: 'Snapshot aktualisieren', path: '/app/client-portal/snapshot', emoji: '📸' },
    );
  }

  return (
    <ClientPortalLayout>
      <div className="w-full max-w-2xl mx-auto space-y-5 overflow-x-hidden px-1 pb-32">
        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/app/client-portal')} className="p-1.5 rounded-lg hover:bg-muted">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Deine Finanz-Reise</h1>
              <p className="text-xs text-muted-foreground">
                Tag {daysSinceSignup} von 365 · Phase {currentPhase}: {currentPhaseInfo.emoji} {currentPhaseInfo.name}
              </p>
            </div>
          </div>

          {/* Progress to next phase */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{progressPct}% freigeschaltet</span>
              <span className="text-muted-foreground">{unlockedCount}/{totalFeatures} Features</span>
            </div>
            <Progress value={progressPct} className="h-2.5" />
            {isPremium && (
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                <Crown className="h-3.5 w-3.5" /> Premium — Alle Features sofort verfügbar
              </div>
            )}
            {!isPremium && nextPhaseInfo && (
              <p className="text-[11px] text-muted-foreground">
                Nächste Phase: {nextPhaseInfo.emoji} {nextPhaseInfo.name}
                {daysToNext !== null && daysToNext > 0 && ` · in ~${daysToNext} Tagen`}
              </p>
            )}
          </div>
        </motion.div>

        {/* ── TODAY CARD ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-foreground text-background overflow-hidden">
            <CardContent className="p-5 space-y-3">
              <p className="text-xs opacity-60 uppercase tracking-wider">Heute</p>
              <p className="text-base font-bold leading-snug">
                „Heute ist ein wichtiger Tag, wenn du ihn dazu machst."
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span className="font-semibold">{streakDays}</span>
                  <span className="text-xs opacity-60">Tage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <span className="font-semibold">{points}</span>
                  <span className="text-xs opacity-60">XP</span>
                </div>
                {score !== null && (
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold">{score}</span>
                    <span className="text-xs opacity-60">Monate</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── QUICK ACTIONS ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-foreground px-1">Nächste Schritte heute</h3>
            <div className="space-y-1.5">
              {quickActions.slice(0, 3).map((action, i) => (
                <Link
                  key={i}
                  to={action.path}
                  className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 hover:shadow-sm transition-shadow active:scale-[0.98]"
                >
                  <span className="text-lg">{action.emoji}</span>
                  <span className="text-sm font-medium text-foreground flex-1">{action.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── ROADMAP TIMELINE ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-bold text-foreground px-1 mb-3">Dein Pfad</h3>
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border" />

            {JOURNEY_PHASES.map((phase, idx) => {
              const isActive = phase.phase === currentPhase;
              const isCompleted = phase.phase < currentPhase || isPremium;
              const isLocked = phase.phase > currentPhase && !isPremium;
              const phaseUnlockedCount = phase.featureKeys.filter(k => isUnlocked(k)).length;
              const phaseTotal = phase.featureKeys.length;

              // Gate status text
              let gateStatusText = '';
              if (isLocked && phase.gate.daysSinceSignup) {
                const remaining = Math.max(0, phase.gate.daysSinceSignup - daysSinceSignup);
                if (remaining > 0) gateStatusText = `~Tag ${phase.gate.daysSinceSignup}`;
              }

              return (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + idx * 0.07 }}
                  className={cn('relative pb-6 last:pb-0')}
                >
                  {/* Node dot */}
                  <div
                    className={cn(
                      'absolute -left-6 top-1 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center z-10',
                      isCompleted && 'bg-primary border-primary',
                      isActive && 'bg-primary/20 border-primary ring-4 ring-primary/10',
                      isLocked && 'bg-muted border-border',
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-3 w-3 text-primary-foreground" />
                    ) : isActive ? (
                      <span className="text-[10px]">{phase.emoji}</span>
                    ) : (
                      <Lock className="h-2.5 w-2.5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className={cn(
                      'ml-4 border rounded-2xl p-4 transition-all',
                      isActive && 'border-primary/40 bg-primary/[0.03] shadow-sm',
                      isCompleted && !isActive && 'border-primary/20 bg-primary/[0.01]',
                      isLocked && 'border-border bg-muted/20 opacity-60',
                    )}
                  >
                    {/* Phase header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{phase.emoji}</span>
                        <h4 className={cn(
                          'text-sm font-bold',
                          isLocked ? 'text-muted-foreground' : 'text-foreground',
                        )}>
                          Phase {phase.phase}: {phase.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isActive && (
                          <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                            Aktuell
                          </span>
                        )}
                        {isCompleted && !isActive && (
                          <span className="text-[9px] font-bold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded-full">
                            ✓ Fertig
                          </span>
                        )}
                        {isLocked && gateStatusText && (
                          <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                            {gateStatusText}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-2.5">{phase.description}</p>

                    {/* Phase progress bar */}
                    {(isActive || isCompleted) && (
                      <div className="mb-2.5">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                          <span>{phaseUnlockedCount}/{phaseTotal}</span>
                          <span>{Math.round((phaseUnlockedCount / phaseTotal) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${(phaseUnlockedCount / phaseTotal) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Feature items */}
                    <div className="space-y-1">
                      {phase.featureKeys.map(key => {
                        const unlocked = isUnlocked(key);
                        return (
                          <div key={key} className="flex items-center gap-2 py-0.5">
                            {unlocked ? (
                              <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                            ) : isActive ? (
                              <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            ) : (
                              <Lock className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                            )}
                            <span className={cn(
                              'text-xs',
                              unlocked ? 'text-foreground font-medium' : 'text-muted-foreground',
                            )}>
                              {FEATURE_LABELS[key] || key}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Gate conditions for locked phases */}
                    {isLocked && (
                      <div className="mt-3 pt-2 border-t border-border/50 space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Freischaltung</p>
                        {phase.gate.daysSinceSignup && (
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3" /> {phase.gate.daysSinceSignup} Tage Nutzung
                          </p>
                        )}
                        {phase.gate.minPeakScore && (
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <TrendingUp className="h-3 w-3" /> PeakScore ≥ {phase.gate.minPeakScore}
                          </p>
                        )}
                        {phase.gate.minTasksCompleted && (
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <Target className="h-3 w-3" /> {phase.gate.minTasksCompleted} Aufgaben abschliessen
                          </p>
                        )}
                        {phase.gate.minCoachModulesCompleted && (
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <Award className="h-3 w-3" /> {phase.gate.minCoachModulesCompleted} Coach-Module abschliessen
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── INSIGHTS ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <h3 className="text-sm font-bold text-foreground px-1 mb-3">Deine Reise in Zahlen</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Tage aktiv', value: String(daysSinceSignup), emoji: '📅' },
              { label: 'PeakScore', value: score !== null ? `${score} Monate` : '–', emoji: '📊' },
              { label: 'XP gesammelt', value: String(points), emoji: '✨' },
              { label: 'Rang', value: `${peakRank.emoji} ${peakRank.name}`, emoji: '' },
            ].map((stat) => (
              <Card key={stat.label} className="bg-card">
                <CardContent className="p-3.5 text-center space-y-0.5">
                  {stat.emoji && <span className="text-lg">{stat.emoji}</span>}
                  <p className="text-base font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </ClientPortalLayout>
  );
}
