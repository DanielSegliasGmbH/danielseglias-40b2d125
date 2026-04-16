import { ArrowLeft, CheckCircle, Lock, Crown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFeatureUnlock } from '@/hooks/useFeatureUnlock';
import { JOURNEY_PHASES } from '@/config/journeyPhases';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const FEATURE_LABELS: Record<string, string> = {
  onboarding: 'Onboarding',
  'finanz-typ': 'Finanz-Typ Quiz',
  avatar: 'Avatar',
  lebensfilm: 'Lebensfilm',
  manifest: 'Manifest',
  dashboard: 'Dashboard',
  peakscore: 'PeakScore',
  finanzprofil: 'Mein Finanzprofil',
  snapshot: 'Mein Snapshot',
  budget: 'Mein Budget',
  goals: 'Meine Ziele',
  tasks: 'Meine Aufgaben',
  library: 'Wissensbibliothek',
  'coach-newcomer': 'Finanz-Coach Newcomer',
  chat: 'Chat mit Berater',
  erinnerungen: 'Erinnerungen',
  'konten-modell': 'Konten-Modell',
  'was-kostet-das': 'Was kostet das wirklich?',
  'jetzt-vs-spaeter': 'Jetzt vs. Später',
  gewohnheiten: 'Gewohnheiten-Tracker',
  'community-read': 'Community (Lesen)',
  'freunde-einladen': 'Freunde einladen',
  'steuer-check': 'Steuer-Check',
  steuerrechner: 'Steuerrechner',
  'versicherungs-check': 'Versicherungs-Check',
  'krankenkassen-tracker': 'Krankenkassen-Tracker',
  'abo-audit': 'Abo-Audit',
  'notfall-check': 'Notfall-Check',
  '3-saeulen-rechner': '3-Säulen-Rechner',
  'guilty-pleasure': 'Guilty Pleasure',
  'coach-original': 'Finanz-Coach Original',
  humankapital: 'Humankapital-Tool',
  finanzplan: 'Mein Finanzplan',
  lohnerhoher: 'Lohnerhöher',
  strategien: 'Anlagestrategien',
  'community-post': 'Community (Posten)',
  'paar-modus': 'Paar-Modus',
  challenges: 'Challenges',
  'ahv-tracker': 'AHV-Tracker',
  sozialabgaben: 'Sozialabgaben',
  'letzter-plan': 'Mein letzter Plan',
  expat: 'Expat-Szenarien',
  immobilien: 'Investmentimmobilien',
  'schatten-zwilling': 'Schatten-Zwilling',
  'freiheits-goal-advanced': 'Freiheits-Goal',
  'all-remaining': 'Alle Features',
  'advanced-simulations': 'Simulationen',
  'finanz-meister-badge': 'Finanz-Meister',
};

export default function ClientPortalJourney() {
  const { currentPhase, daysSinceSignup, isUnlocked, isPremium, loading } = useFeatureUnlock();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalFeatures = JOURNEY_PHASES.flatMap(p => p.featureKeys).length;
  const unlockedCount = JOURNEY_PHASES.flatMap(p => p.featureKeys).filter(k => isUnlocked(k)).length;
  const progressPct = Math.round((unlockedCount / totalFeatures) * 100);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/app/client-portal" className="p-1.5 rounded-lg hover:bg-muted">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-base font-bold text-foreground">Mein Finanz-Pfad</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Progress summary */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Dein Fortschritt</p>
              <p className="text-2xl font-bold text-foreground">{progressPct}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Tag {daysSinceSignup}</p>
              <p className="text-sm font-semibold text-foreground">
                {JOURNEY_PHASES[currentPhase]?.emoji} {JOURNEY_PHASES[currentPhase]?.name}
              </p>
            </div>
          </div>
          <Progress value={progressPct} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {unlockedCount} von {totalFeatures} Features freigeschaltet
          </p>
          {isPremium && (
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/5 rounded-lg px-3 py-1.5">
              <Crown className="h-3.5 w-3.5" /> Premium — Alle Features sofort verfügbar
            </div>
          )}
        </div>

        {/* Phase timeline */}
        <div className="space-y-4">
          {JOURNEY_PHASES.map((phase, idx) => {
            const isActive = phase.phase === currentPhase;
            const isCompleted = phase.phase < currentPhase || isPremium;
            const isLocked = phase.phase > currentPhase && !isPremium;

            return (
              <div key={phase.phase} className="relative">
                {/* Connector line */}
                {idx > 0 && (
                  <div
                    className={cn(
                      'absolute -top-4 left-[19px] w-0.5 h-4',
                      isCompleted || isActive ? 'bg-primary' : 'bg-border',
                    )}
                  />
                )}

                <div
                  className={cn(
                    'border rounded-2xl p-4 transition-all',
                    isActive && 'border-primary bg-primary/5 shadow-sm',
                    isCompleted && !isActive && 'border-primary/30 bg-primary/[0.02]',
                    isLocked && 'border-border bg-muted/30 opacity-70',
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Phase indicator */}
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full shrink-0 text-lg',
                        isCompleted && 'bg-primary/15',
                        isActive && 'bg-primary/20 ring-2 ring-primary/30',
                        isLocked && 'bg-muted',
                      )}
                    >
                      {isCompleted && !isActive ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : isLocked ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <span>{phase.emoji}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={cn(
                          'text-sm font-bold',
                          isLocked ? 'text-muted-foreground' : 'text-foreground',
                        )}>
                          Phase {phase.phase}: {phase.name}
                        </h3>
                        {isActive && (
                          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            AKTUELL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{phase.description}</p>

                      {/* Gate conditions */}
                      {isLocked && phase.gate && (
                        <div className="mt-2 text-[11px] text-muted-foreground/70 space-y-0.5">
                          {phase.gate.daysSinceSignup && (
                            <p>• Tag {phase.gate.daysSinceSignup} erreichen</p>
                          )}
                          {phase.gate.minPeakScore && (
                            <p>• PeakScore ≥ {phase.gate.minPeakScore}</p>
                          )}
                          {phase.gate.minTasksCompleted && (
                            <p>• {phase.gate.minTasksCompleted} Aufgaben abschliessen</p>
                          )}
                          {phase.gate.minCoachModulesCompleted && (
                            <p>• {phase.gate.minCoachModulesCompleted} Coach-Module abschliessen</p>
                          )}
                        </div>
                      )}

                      {/* Feature list */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {phase.featureKeys.map(key => (
                          <span
                            key={key}
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded-full',
                              isUnlocked(key)
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'bg-muted text-muted-foreground',
                            )}
                          >
                            {isUnlocked(key) && <Sparkles className="h-2.5 w-2.5 inline mr-0.5" />}
                            {FEATURE_LABELS[key] || key}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
