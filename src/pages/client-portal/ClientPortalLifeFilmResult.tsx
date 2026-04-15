import { useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Film, TrendingUp, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { AlternativeTimeline } from '@/components/client-portal/life-film/AlternativeTimeline';
import { SwissComparison } from '@/components/client-portal/life-film/SwissComparison';
import { useGamification } from '@/hooks/useGamification';

// ── Constants ──
const INFLATION = 0.02;
const CHILD_COST_PER_MONTH = 1200;
const PK_ANNUAL_FACTOR = 0.068; // ~6.8% conversion rate
const AHV_MAX_MONTHLY = 2450; // simplified max AHV
const AVG_INVESTMENT_RETURN = 0.04;
const AVG_HOME_PRICE = 850000;
const HOME_EQUITY_RATIO = 0.20;

const fmtCHF = (v: number) =>
  `CHF ${Math.round(v).toLocaleString('de-CH')}`;

interface LifeFilmData {
  age: number;
  monthly_income: number;
  monthly_expenses: number;
  total_savings: number;
  life_goals: string[];
  desired_children: string;
  target_retirement_age: number;
  truth_mode: string;
}

interface TimelineEntry {
  year: number;
  age: number;
  title: string;
  emoji: string;
  events: string[];
  savings: number;
  monthlyExpenses: number;
  sentiment: 'positive' | 'neutral' | 'warning' | 'danger';
  highlight?: boolean;
}

function buildTimeline(data: LifeFilmData, firstName: string): TimelineEntry[] {
  const {
    age, monthly_income, monthly_expenses, total_savings,
    life_goals, desired_children, target_retirement_age, truth_mode,
  } = data;

  const isHard = truth_mode === 'realistic';
  const currentYear = new Date().getFullYear();
  const childCount = desired_children === '3+' ? 3 : parseInt(desired_children) || 0;
  const monthlySavings = monthly_income - monthly_expenses;
  const entries: TimelineEntry[] = [];

  const hasGoal = (g: string) => life_goals.includes(g);

  // Generate year-by-year projections
  const targetAge = Math.max(target_retirement_age, 65);
  const yearsToProject = targetAge - age;

  // Track running state
  let runSavings = total_savings;
  let runExpenses = monthly_expenses;
  let childrenBorn = 0;
  let childStartAge = hasGoal('familie') ? Math.max(age + 2, 28) : 0;

  // Key milestone ages
  const milestoneAges = new Set<number>();
  // Always show current age
  milestoneAges.add(age);
  // Family milestones
  if (hasGoal('familie') && childCount > 0) {
    for (let i = 0; i < childCount; i++) {
      milestoneAges.add(childStartAge + i * 3);
    }
  }
  // Eigenheim
  if (hasGoal('eigenheim')) milestoneAges.add(Math.max(age + 5, 33));
  // Career / travel
  if (hasGoal('weiterbildung')) milestoneAges.add(Math.max(age + 2, 30));
  if (hasGoal('unternehmen')) milestoneAges.add(Math.max(age + 4, 32));
  if (hasGoal('reisen')) milestoneAges.add(Math.max(age + 3, 28));
  if (hasGoal('traumauto')) milestoneAges.add(Math.max(age + 3, 30));
  if (hasGoal('auswandern')) milestoneAges.add(Math.max(age + 6, 35));
  // Standard milestones
  [35, 40, 45, 50, 55, 60, 65].forEach(a => {
    if (a > age && a <= targetAge) milestoneAges.add(a);
  });
  milestoneAges.add(target_retirement_age);

  const sortedAges = [...milestoneAges].sort((a, b) => a - b);

  for (const milestoneAge of sortedAges) {
    const yearsFromNow = milestoneAge - age;
    const year = currentYear + yearsFromNow;

    // Project savings with simple compound growth
    const inflatedExpenses = monthly_expenses * Math.pow(1 + INFLATION, yearsFromNow);
    const inflatedIncome = monthly_income * Math.pow(1 + INFLATION * 0.5, yearsFromNow); // income grows slower
    
    // Children cost adjustments
    let childCosts = 0;
    if (hasGoal('familie')) {
      for (let c = 0; c < childCount; c++) {
        const childAge = milestoneAge - (childStartAge + c * 3);
        if (childAge >= 0 && childAge <= 20) {
          childCosts += CHILD_COST_PER_MONTH * Math.pow(1 + INFLATION, yearsFromNow);
        }
      }
    }

    const effectiveMonthlyExpenses = inflatedExpenses + childCosts;
    const effectiveMonthlySavings = inflatedIncome - effectiveMonthlyExpenses;

    // Projected savings (simplified compound)
    runSavings = total_savings * Math.pow(1 + AVG_INVESTMENT_RETURN, yearsFromNow) +
      Math.max(0, monthlySavings) * 12 * ((Math.pow(1 + AVG_INVESTMENT_RETURN, yearsFromNow) - 1) / AVG_INVESTMENT_RETURN);

    // Subtract big purchases
    if (hasGoal('eigenheim') && milestoneAge >= Math.max(age + 5, 33)) {
      // One-time deduction (simplified)
      const equityNeeded = AVG_HOME_PRICE * HOME_EQUITY_RATIO;
      if (milestoneAge === Math.max(age + 5, 33)) {
        runSavings -= equityNeeded;
      }
    }

    runSavings = Math.max(0, runSavings);
    runExpenses = effectiveMonthlyExpenses;

    const events: string[] = [];
    let sentiment: TimelineEntry['sentiment'] = 'neutral';
    let emoji = '📅';
    let title = `Du bist ${milestoneAge}`;
    let highlight = false;

    // ── Current age ──
    if (milestoneAge === age) {
      emoji = '📍';
      title = 'Heute – Dein Startpunkt';
      events.push(`Einkommen: ${fmtCHF(monthly_income)}/Monat`);
      events.push(`Ausgaben: ${fmtCHF(monthly_expenses)}/Monat`);
      events.push(`Erspartes: ${fmtCHF(total_savings)}`);
      if (monthlySavings > 0) {
        events.push(`Du sparst ${fmtCHF(monthlySavings)}/Monat`);
        sentiment = 'positive';
      } else {
        events.push(`Du gibst mehr aus als du verdienst!`);
        sentiment = 'danger';
      }
    }

    // ── Family events ──
    if (hasGoal('familie') && childCount > 0) {
      for (let c = 0; c < childCount; c++) {
        if (milestoneAge === childStartAge + c * 3) {
          emoji = '👶';
          const ordinal = childCount === 1 ? 'Dein' : c === 0 ? 'Erstes' : c === 1 ? 'Zweites' : 'Drittes';
          title = `${ordinal} Kind kommt zur Welt`;
          events.push(`Zusätzliche Kosten: +${fmtCHF(CHILD_COST_PER_MONTH)}/Monat`);
          if (effectiveMonthlySavings < 0) {
            events.push(`⚠️ Dein Budget wird negativ!`);
            sentiment = 'danger';
          } else {
            events.push(`Monatlich übrig: ${fmtCHF(effectiveMonthlySavings)}`);
            sentiment = effectiveMonthlySavings > 500 ? 'positive' : 'warning';
          }
          highlight = true;
        }
      }
    }

    // ── Eigenheim ──
    if (hasGoal('eigenheim') && milestoneAge === Math.max(age + 5, 33)) {
      emoji = '🏠';
      title = 'Du versuchst, ein Haus zu kaufen';
      const equityNeeded = AVG_HOME_PRICE * HOME_EQUITY_RATIO;
      const hasEnough = runSavings + equityNeeded >= equityNeeded; // already deducted
      events.push(`Eigenkapital benötigt: ${fmtCHF(equityNeeded)}`);
      events.push(`Dein projiziertes Vermögen: ${fmtCHF(runSavings + equityNeeded)}`);
      if (runSavings + equityNeeded >= equityNeeded * 1.2) {
        events.push(`✅ Du hast genug Eigenkapital`);
        sentiment = 'positive';
      } else {
        events.push(`❌ Es fehlen ${fmtCHF(Math.max(0, equityNeeded - (runSavings + equityNeeded)))}`);
        sentiment = 'danger';
      }
      highlight = true;
    }

    // ── Weiterbildung ──
    if (hasGoal('weiterbildung') && milestoneAge === Math.max(age + 2, 30)) {
      emoji = '📚';
      title = 'Weiterbildung / Umschulung';
      events.push('Investition in dich selbst: ~CHF 15\'000–30\'000');
      events.push('Potenzielle Gehaltserhöhung: +10-20%');
      sentiment = 'positive';
    }

    // ── Unternehmen ──
    if (hasGoal('unternehmen') && milestoneAge === Math.max(age + 4, 32)) {
      emoji = '💼';
      title = 'Eigenes Unternehmen gründen';
      events.push('Startkapital empfohlen: CHF 50\'000–100\'000');
      events.push(`Dein Vermögen dann: ${fmtCHF(runSavings)}`);
      sentiment = runSavings >= 50000 ? 'positive' : 'warning';
    }

    // ── Reisen ──
    if (hasGoal('reisen') && milestoneAge === Math.max(age + 3, 28)) {
      emoji = '✈️';
      title = 'Grosse Reisepläne';
      events.push('Budget-Impact: ~CHF 5\'000–10\'000/Jahr');
      sentiment = 'neutral';
    }

    // ── Traumauto ──
    if (hasGoal('traumauto') && milestoneAge === Math.max(age + 3, 30)) {
      emoji = '🚗';
      title = 'Traumauto';
      events.push('Typische Kosten: CHF 40\'000–80\'000');
      events.push(`Dein Vermögen: ${fmtCHF(runSavings)}`);
      sentiment = runSavings >= 50000 ? 'positive' : 'warning';
    }

    // ── Auswandern ──
    if (hasGoal('auswandern') && milestoneAge === Math.max(age + 6, 35)) {
      emoji = '🌍';
      title = 'Auswandern';
      events.push('Umzugskosten & Buffer: CHF 30\'000–60\'000');
      events.push('PK-Bezug & Steuerplanung nötig');
      sentiment = 'neutral';
    }

    // ── Mid-life (40-45) ──
    if (milestoneAge === 40 || milestoneAge === 45) {
      if (events.length === 0) {
        emoji = '⚡';
        title = 'Halbzeit-Check';
        events.push(`Projiziertes Vermögen: ${fmtCHF(runSavings)}`);
        events.push(`Monatliche Kosten (inflationsbereinigt): ${fmtCHF(effectiveMonthlyExpenses)}`);
        if (isHard && milestoneAge === 40) {
          events.push('40% der Ehen in der Schweiz enden in Scheidung. Finanzielle Vorsorge schützt dich.');
        }
        sentiment = effectiveMonthlySavings > 0 ? 'neutral' : 'warning';
      }
    }

    // ── Late career (50-55) ──
    if (milestoneAge === 50 || milestoneAge === 55) {
      if (events.length === 0) {
        emoji = '🏛️';
        title = 'Späte Karrierephase';
        const pkProjection = runSavings * PK_ANNUAL_FACTOR;
        events.push(`Pensionskasse projiziert: ~${fmtCHF(pkProjection)}/Jahr Rente`);
        events.push(`Lebenshaltungskosten: ${fmtCHF(effectiveMonthlyExpenses * 12)}/Jahr`);
        const gap = effectiveMonthlyExpenses * 12 - pkProjection - AHV_MAX_MONTHLY * 12;
        if (gap > 0) {
          events.push(`⚠️ Lücke: ${fmtCHF(gap)}/Jahr`);
          sentiment = 'danger';
        } else {
          events.push('✅ Deine Vorsorge reicht voraussichtlich');
          sentiment = 'positive';
        }
        highlight = true;
      }
    }

    // ── Frühpension check ──
    if (hasGoal('fruehpension') && milestoneAge === 50) {
      events.push(`Frühpension ab 50: Du brauchst ${fmtCHF(effectiveMonthlyExpenses * 12 * 15)} Buffer`);
      events.push(`Du hast: ${fmtCHF(runSavings)}`);
      sentiment = runSavings >= effectiveMonthlyExpenses * 12 * 10 ? 'positive' : 'danger';
    }

    // ── Standard milestones with no specific events ──
    if (events.length === 0 && milestoneAge !== age) {
      events.push(`Projiziertes Vermögen: ${fmtCHF(runSavings)}`);
      events.push(`Monatliche Kosten: ${fmtCHF(effectiveMonthlyExpenses)}`);
      if (effectiveMonthlySavings > 0) {
        events.push(`Sparpotenzial: ${fmtCHF(effectiveMonthlySavings)}/Monat`);
        sentiment = 'positive';
      } else {
        sentiment = 'warning';
      }
    }

    entries.push({
      year, age: milestoneAge, title, emoji, events,
      savings: runSavings, monthlyExpenses: effectiveMonthlyExpenses,
      sentiment, highlight,
    });
  }

  return entries;
}

function computeFinalCard(data: LifeFilmData) {
  const yearsToRetirement = data.target_retirement_age - data.age;
  const monthlySavings = data.monthly_income - data.monthly_expenses;

  const projectedWealth = data.total_savings * Math.pow(1 + AVG_INVESTMENT_RETURN, yearsToRetirement) +
    Math.max(0, monthlySavings) * 12 * ((Math.pow(1 + AVG_INVESTMENT_RETURN, yearsToRetirement) - 1) / AVG_INVESTMENT_RETURN);

  const pkAnnual = projectedWealth * PK_ANNUAL_FACTOR;
  const monthlyPension = pkAnnual / 12 + AHV_MAX_MONTHLY;
  const retirementExpenses = data.monthly_expenses * Math.pow(1 + INFLATION, yearsToRetirement);
  const gap = retirementExpenses - monthlyPension;
  const peakScoreAtRetirement = projectedWealth > 0 && retirementExpenses > 0
    ? projectedWealth / retirementExpenses : 0;

  return {
    projectedWealth: Math.max(0, projectedWealth),
    monthlyPension,
    retirementExpenses,
    gap,
    peakScoreAtRetirement,
    yearsLeft: yearsToRetirement,
  };
}

const SENTIMENT_STYLES = {
  positive: 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20',
  neutral: 'border-l-primary bg-card',
  warning: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
  danger: 'border-l-destructive bg-destructive/5',
};

const DOT_STYLES = {
  positive: 'bg-emerald-500',
  neutral: 'bg-primary',
  warning: 'bg-amber-500',
  danger: 'bg-destructive',
};

export default function ClientPortalLifeFilmResult() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.user_metadata?.first_name || 'Du';
  const { awardXP } = useGamification();
  const xpAwarded = useRef(false);

  const { data: filmData, isLoading } = useQuery({
    queryKey: ['life-film-data', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('life_film_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)
        .maybeSingle();
      return data as LifeFilmData | null;
    },
    enabled: !!user,
  });

  const timeline = useMemo(() => {
    if (!filmData || !filmData.age) return [];
    return buildTimeline(filmData, firstName);
  }, [filmData, firstName]);

  const finalCard = useMemo(() => {
    if (!filmData || !filmData.age) return null;
    return computeFinalCard(filmData);
  }, [filmData]);

  // Award +100 XP for viewing the complete Lebensfilm (once)
  useEffect(() => {
    if (filmData && filmData.age && !xpAwarded.current) {
      xpAwarded.current = true;
      awardXP('life_film_viewed', 'life-film-result');
    }
  }, [filmData]);

  if (isLoading) {
    return (
      <ClientPortalLayout>
        <div className="max-w-lg mx-auto py-20 text-center">
          <Film className="h-8 w-8 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Dein Lebensfilm wird geladen...</p>
        </div>
      </ClientPortalLayout>
    );
  }

  if (!filmData || !filmData.age) {
    return (
      <ClientPortalLayout>
        <div className="max-w-lg mx-auto py-20 text-center space-y-4">
          <Film className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Noch kein Lebensfilm erstellt.</p>
          <Button onClick={() => navigate('/app/client-portal/life-film')}>Jetzt starten</Button>
        </div>
      </ClientPortalLayout>
    );
  }

  return (
    <ClientPortalLayout>
      <div className="max-w-lg mx-auto pb-12">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Dein Lebensfilm</h1>
            </div>
            <p className="text-xs text-muted-foreground">
              {firstName}, {filmData.age} – {filmData.target_retirement_age}
            </p>
          </div>
        </div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-foreground text-background overflow-hidden">
            <CardContent className="p-5 text-center space-y-2">
              <span className="text-3xl">🎬</span>
              <h2 className="text-lg font-bold">
                {filmData.truth_mode === 'realistic' ? 'Die harte Realität' : 'Deine finanzielle Zukunft'}
              </h2>
              <p className="text-sm opacity-80">
                Basierend auf deinen aktuellen Zahlen — Jahr für Jahr.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeline */}
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {timeline.map((entry, idx) => (
              <motion.div
                key={entry.year}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.3 }}
                className="relative"
              >
                {/* Dot */}
                <div className={cn(
                  'absolute -left-6 top-4 w-[9px] h-[9px] rounded-full ring-2 ring-background z-10',
                  DOT_STYLES[entry.sentiment]
                )} />

                <Card className={cn(
                  'border-l-4 transition-all',
                  SENTIMENT_STYLES[entry.sentiment],
                  entry.highlight && 'shadow-md'
                )}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{entry.emoji}</span>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">{entry.year}</p>
                          <h3 className="text-sm font-bold text-foreground">{entry.title}</h3>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] shrink-0"
                      >
                        {entry.age} Jahre
                      </Badge>
                    </div>

                    <div className="space-y-1 pt-1">
                      {entry.events.map((ev, i) => (
                        <p key={i} className={cn(
                          'text-xs leading-relaxed',
                          ev.startsWith('⚠️') || ev.startsWith('❌')
                            ? 'text-destructive font-medium'
                            : ev.startsWith('✅')
                            ? 'text-emerald-600 font-medium'
                            : 'text-muted-foreground'
                        )}>
                          {ev}
                        </p>
                      ))}
                    </div>

                    {/* Mini financial snapshot */}
                    <div className="flex gap-3 pt-1">
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-2.5 w-2.5" />
                        {fmtCHF(entry.savings)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {fmtCHF(entry.monthlyExpenses)}/Mt.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── FINAL CARD — Die Rechnung ── */}
        {finalCard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: timeline.length * 0.06 + 0.2 }}
            className="mt-8 space-y-4"
          >
            <Separator />

            <Card className="border-2 border-destructive/30 shadow-lg overflow-hidden">
              <CardContent className="p-6 space-y-5">
                <div className="text-center space-y-1">
                  <span className="text-3xl">📊</span>
                  <h2 className="text-lg font-bold text-foreground">Die Rechnung</h2>
                  <p className="text-xs text-muted-foreground">
                    Wenn du so weitermachst wie bisher:
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Vermögen bei Pensionierung</span>
                    <span className="text-sm font-bold text-foreground">{fmtCHF(finalCard.projectedWealth)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monatliche Rente (PK + AHV)</span>
                    <span className="text-sm font-bold text-foreground">{fmtCHF(finalCard.monthlyPension)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monatliche Ausgaben (inflationsbereinigt)</span>
                    <span className="text-sm font-bold text-foreground">{fmtCHF(finalCard.retirementExpenses)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground">
                      {finalCard.gap > 0 ? 'Lücke pro Monat' : 'Überschuss pro Monat'}
                    </span>
                    <span className={cn(
                      'text-xl font-black',
                      finalCard.gap > 0 ? 'text-destructive' : 'text-emerald-600'
                    )}>
                      {finalCard.gap > 0 ? '-' : '+'}{fmtCHF(Math.abs(finalCard.gap))}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
                  <span>PeakScore bei Pensionierung:</span>
                  <Badge variant="secondary" className="font-bold">
                    {finalCard.peakScoreAtRetirement.toFixed(1)} Monate
                  </Badge>
                </div>

                {filmData.truth_mode === 'realistic' && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs text-destructive">
                      Das Rentenalter könnte auf 67–70 steigen. Bist du vorbereitet?
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alternative Timeline */}
            <AlternativeTimeline
              filmData={filmData}
              baseDelay={timeline.length * 0.06 + 0.4}
            />
          </motion.div>
        )}
      </div>
    </ClientPortalLayout>
  );
}
