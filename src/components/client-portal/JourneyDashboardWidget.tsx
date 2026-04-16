import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Map } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useFeatureUnlock } from '@/hooks/useFeatureUnlock';
import { JOURNEY_PHASES } from '@/config/journeyPhases';
import { Progress } from '@/components/ui/progress';

export function JourneyDashboardWidget() {
  const { currentPhase, daysSinceSignup, isUnlocked, isPremium, loading, nextPhaseInfo } = useFeatureUnlock();

  if (loading) return null;

  const totalFeatures = JOURNEY_PHASES.flatMap(p => p.featureKeys).length;
  const unlockedCount = JOURNEY_PHASES.flatMap(p => p.featureKeys).filter(k => isUnlocked(k)).length;
  const progressPct = Math.round((unlockedCount / totalFeatures) * 100);
  const phaseInfo = JOURNEY_PHASES[currentPhase] || JOURNEY_PHASES[0];

  const daysToNext = nextPhaseInfo?.gate.daysSinceSignup
    ? Math.max(0, nextPhaseInfo.gate.daysSinceSignup - daysSinceSignup)
    : null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <Link to="/app/client-portal/journey">
        <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] border-primary/15 bg-primary/[0.02]">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-primary/10 grid place-content-center">
                  <Map className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Phase {phaseInfo.phase}: {phaseInfo.emoji} {phaseInfo.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {isPremium
                      ? 'Alle Features freigeschaltet'
                      : daysToNext !== null && daysToNext > 0
                        ? `Nächste Freischaltung in ~${daysToNext} Tagen`
                        : nextPhaseInfo
                          ? `Nächste Phase: ${nextPhaseInfo.emoji} ${nextPhaseInfo.name}`
                          : 'Alle Phasen gemeistert!'
                    }
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
            <div className="flex items-center gap-2">
              <Progress value={progressPct} className="h-1.5 flex-1" />
              <span className="text-[10px] font-semibold text-muted-foreground shrink-0">{progressPct}%</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
