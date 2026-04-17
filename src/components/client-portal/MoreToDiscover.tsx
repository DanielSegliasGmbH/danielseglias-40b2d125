import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, Flame, FileBarChart, Gift, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PrivateValue } from '@/components/client-portal/PrivateValue';
import { ActiveChallengeCards } from '@/components/client-portal/ActiveChallengeCard';
import { WeeklyOverviewCard } from '@/components/client-portal/WeeklyOverviewCard';
import { WeeklyCheckCard } from '@/components/client-portal/WeeklyCheckCard';
import { MorningBriefCard } from '@/components/client-portal/MorningBriefCard';
import { SundayReflectionCard } from '@/components/client-portal/SundayReflectionCard';
import { MoodCheckinCard } from '@/components/client-portal/MoodCheckinCard';
import { InflationTickerCard } from '@/components/client-portal/InflationTickerCard';
import { SuccessStoryRotator } from '@/components/client-portal/SuccessStoryRotator';
import { ShadowTwinCard } from '@/components/client-portal/ShadowTwinCard';
import { LastPlanDashboardCard } from '@/components/client-portal/LastPlanDashboardCard';
import { ProfessionDashboardTips } from '@/components/client-portal/ProfessionDashboardTips';
import { JourneyDashboardWidget } from '@/components/client-portal/JourneyDashboardWidget';
import { RankWarningBanner } from '@/components/client-portal/RankWarningBanner';
import { FreedomCountdown } from '@/components/client-portal/FreedomCountdown';

interface CockpitCard {
  label: string;
  value: string;
  path: string;
  highlight?: boolean;
}

interface FinanzTypInfo {
  emoji: string;
  shortTitle: string;
}

interface RecentAction {
  id: string;
  action_type: string;
  points_awarded: number;
  created_at: string;
}

interface NextStepResult {
  primary?: { title: string; reason: string; path: string };
}

interface MoreToDiscoverProps {
  isSundayReflection: boolean;
  firstOfMonth: boolean;
  lifeFilmCompleted: boolean;
  lifeFilmDifference: number;
  finanzTypCompleted: boolean;
  finanzTypInfo: FinanzTypInfo | null | undefined;
  cockpitCards: CockpitCard[];
  recentActions: RecentAction[];
  actionLabels: Record<string, string>;
  timeAgo: (date: string) => string;
  level: number;
  levelLabel: string;
  points: number;
  nextLevelMin: number;
  maxLevel: boolean;
  progressPercent: number;
  pointsToNext: number;
  streakDays: number;
  lastAwardedPoints: { id: string | number; amount: number } | null;
  LevelIcon: React.ComponentType<{ className?: string }>;
  nextStepResult: NextStepResult | undefined;
  navigate: (path: string) => void;
}

/**
 * SECTION B — "Meine Welt".
 * Collapsed by default. Reveals all secondary widgets.
 */
export function MoreToDiscover(props: MoreToDiscoverProps) {
  const [open, setOpen] = useState(false);
  const isSunday = new Date().getDay() === 0;

  return (
    <div className="pt-1">
      <Button
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        className="w-full justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        aria-expanded={open}
      >
        <span>{open ? 'Weniger anzeigen' : 'Mehr entdecken'}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </Button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="more"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-5 pt-4">
              {/* Daily routines */}
              {isSunday && <SundayReflectionCard />}
              <MorningBriefCard />
              <MoodCheckinCard />
              <FreedomCountdown />
              <WeeklyCheckCard />
              <RankWarningBanner />
              <InflationTickerCard />

              {/* Finanz-Typ */}
              {!props.finanzTypCompleted ? (
                <Card
                  className="cursor-pointer active:scale-[0.99] transition-transform border-primary/20 bg-primary/5"
                  onClick={() => props.navigate('/app/client-portal/finanz-typ')}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 grid place-content-center text-xl">🧬</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm">Welcher Finanz-Typ bist du?</h3>
                      <p className="text-xs text-muted-foreground">In 60 Sekunden herausfinden</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              ) : props.finanzTypInfo ? (
                <Card
                  className="cursor-pointer active:scale-[0.99] transition-transform border-border/50"
                  onClick={() => props.navigate('/app/client-portal/finanz-typ')}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <span className="text-base">{props.finanzTypInfo.emoji}</span>
                    <p className="text-xs text-muted-foreground flex-1">
                      Dein Finanz-Typ:{' '}
                      <span className="font-bold text-foreground">{props.finanzTypInfo.shortTitle}</span>
                    </p>
                    <span className="text-xs text-primary font-medium">Details →</span>
                  </CardContent>
                </Card>
              ) : null}

              {/* XP / Level card */}
              <Card
                className="bg-foreground text-background overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
                onClick={() => props.navigate('/app/client-portal/premium')}
              >
                <CardContent className="p-5 relative">
                  <AnimatePresence>
                    {props.lastAwardedPoints !== null && (
                      <motion.div
                        key={props.lastAwardedPoints.id}
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 0, y: -24 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="absolute top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
                      >
                        <span className="text-sm font-bold">+{props.lastAwardedPoints.amount} XP</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center gap-1.5">
                      <props.LevelIcon className="h-4 w-4" />
                      Level {props.level} · {props.levelLabel}
                    </span>
                    <span className="font-mono text-xs opacity-80">
                      {props.points} / {props.maxLevel ? props.points : props.nextLevelMin}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-background/15 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={false}
                      animate={{ width: `${props.maxLevel ? 100 : props.progressPercent}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-2 opacity-70">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5" />
                      {props.streakDays} {props.streakDays === 1 ? 'Tag' : 'Tage'}
                    </span>
                    {!props.maxLevel && <span>{props.pointsToNext} XP bis nächstes Level</span>}
                  </div>
                </CardContent>
              </Card>

              {/* Finanz-Cockpit (KPIs) */}
              <div className="grid grid-cols-2 gap-2">
                {props.cockpitCards.map((card) => (
                  <Link key={card.label} to={card.path}>
                    <div
                      className={cn(
                        'p-3 rounded-2xl transition-shadow hover:shadow-md min-h-[80px] flex flex-col justify-center',
                        card.highlight ? 'bg-foreground text-background' : 'bg-card border border-border',
                      )}
                    >
                      <span
                        className={cn(
                          'text-[11px] leading-tight',
                          card.highlight ? 'opacity-70' : 'text-muted-foreground',
                        )}
                      >
                        {card.label}
                      </span>
                      {card.label === 'Offene Aufgaben' ? (
                        <span className="text-lg font-bold block mt-1 tracking-tight">
                          {card.value || '–'}
                        </span>
                      ) : (
                        <PrivateValue className="text-lg font-bold block mt-1 tracking-tight">
                          {card.value || '–'}
                        </PrivateValue>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              <ActiveChallengeCards />
              <WeeklyOverviewCard />

              {/* Monthly Report Teaser */}
              {props.firstOfMonth && (() => {
                const now = new Date();
                const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const mk = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
                const label = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'][prevMonth.getMonth()];
                return (
                  <Link to={`/app/client-portal/monthly-report?month=${mk}`}>
                    <Card className="bg-foreground text-background cursor-pointer active:scale-[0.98] transition-transform hover:shadow-lg">
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-background/10 grid place-content-center text-xl">📊</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold">Dein {label}-Rückblick ist da!</p>
                          <p className="text-xs opacity-60">Schau dir an, wie dein Monat war</p>
                        </div>
                        <ArrowRight className="h-5 w-5 opacity-50 shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })()}

              {/* Nächste Quest */}
              {props.nextStepResult?.primary && (
                <Card
                  className="bg-primary text-primary-foreground cursor-pointer active:scale-[0.98] transition-transform hover:shadow-lg"
                  onClick={() => props.navigate(props.nextStepResult!.primary!.path)}
                >
                  <CardContent className="p-5 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider opacity-80 mb-1">Nächste Quest</p>
                      <h3 className="text-base font-bold">{props.nextStepResult.primary.title}</h3>
                      <p className="text-sm opacity-80 mt-0.5 line-clamp-1">
                        {props.nextStepResult.primary.reason}
                      </p>
                    </div>
                    <div className="size-10 bg-primary-foreground/20 rounded-full grid place-content-center shrink-0 ml-3">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Letzte Aktivität */}
              {props.recentActions.length > 0 && (
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold mb-3">Letzte Aktivität</h4>
                    <div className="flex flex-col gap-2.5">
                      {props.recentActions.map((a) => (
                        <div key={a.id} className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{props.actionLabels[a.action_type] || a.action_type}</p>
                            <p className="text-[11px] text-muted-foreground">+{a.points_awarded} XP</p>
                          </div>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {props.timeAgo(a.created_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <JourneyDashboardWidget />
              <SuccessStoryRotator />
              <ShadowTwinCard />
              <LastPlanDashboardCard />
              <ProfessionDashboardTips />

              {/* Partner */}
              <Link to="/app/client-portal/partner">
                <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-primary/10 grid place-content-center">
                        <Heart className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Partner-Modus</p>
                        <p className="text-[11px] text-muted-foreground">Finanzen gemeinsam managen</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>

              {/* Monatsbericht */}
              <Link to="/app/client-portal/monthly-report">
                <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-primary/10 grid place-content-center">
                        <FileBarChart className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Mein Monatsbericht</p>
                        <p className="text-[11px] text-muted-foreground">Deine persönliche Monatsübersicht</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>

              {/* Referral */}
              <Link to="/app/client-portal/invite">
                <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] border-primary/20 bg-primary/5">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-primary/10 grid place-content-center">
                        <Gift className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Freunde einladen = +500 XP pro Freund 🎁</p>
                        <p className="text-[11px] text-muted-foreground">Teile deinen Code und sammle Bonus-XP</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
