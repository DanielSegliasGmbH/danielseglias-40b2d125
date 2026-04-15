import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Rocket, Share2, TrendingUp } from 'lucide-react';
import { ShareCard } from './ShareCard';
import { usePeakScore } from '@/hooks/usePeakScore';

// ── Optimized assumptions ──
const INFLATION = 0.02;
const OPTIMIZED_RETURN = 0.05;
const CURRENT_RETURN = 0.04;
const SAULE_3A_MAX = 7258;
const KK_SAVINGS_YEARLY = 600;
const PK_ANNUAL_FACTOR = 0.068;
const AHV_MAX_MONTHLY = 2450;

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

interface ComparisonRow {
  age: number;
  year: number;
  label: string;
  emoji: string;
  withoutChange: number;
  withFinLife: number;
}

function buildComparison(data: LifeFilmData): ComparisonRow[] {
  const { age, monthly_income, monthly_expenses, total_savings, target_retirement_age } = data;
  const currentYear = new Date().getFullYear();
  const monthlySavings = monthly_income - monthly_expenses;

  // Optimized path: +10% savings rate, -20% discretionary, +3a, +KK savings
  const discretionaryRatio = 0.4; // assume 40% of expenses are discretionary
  const expenseReduction = monthly_expenses * discretionaryRatio * 0.2;
  const additionalSavingsFromIncome = monthly_income * 0.1;
  const monthlyKKSavings = KK_SAVINGS_YEARLY / 12;
  const monthly3a = SAULE_3A_MAX / 12;

  const optimizedMonthlySavings = monthlySavings + expenseReduction + additionalSavingsFromIncome + monthlyKKSavings + monthly3a;

  // Milestone ages
  const milestones = [35, 40, 45, 50, 55, 60, 65].filter(a => a > age && a <= Math.max(target_retirement_age, 65));
  if (!milestones.includes(target_retirement_age) && target_retirement_age > age) {
    milestones.push(target_retirement_age);
  }
  milestones.sort((a, b) => a - b);

  const labels: Record<number, [string, string]> = {
    35: ['Karriere-Aufbau', '💼'],
    40: ['Halbzeit', '⚡'],
    45: ['Konsolidierung', '🏗️'],
    50: ['Späte Karriere', '🏛️'],
    55: ['Vor-Pension', '🎯'],
    60: ['Zielgerade', '🏁'],
    65: ['Pensionierung', '🌅'],
  };

  return milestones.map(milestoneAge => {
    const years = milestoneAge - age;

    const withoutChange = total_savings * Math.pow(1 + CURRENT_RETURN, years) +
      Math.max(0, monthlySavings) * 12 * ((Math.pow(1 + CURRENT_RETURN, years) - 1) / CURRENT_RETURN);

    const withFinLife = total_savings * Math.pow(1 + OPTIMIZED_RETURN, years) +
      Math.max(0, optimizedMonthlySavings) * 12 * ((Math.pow(1 + OPTIMIZED_RETURN, years) - 1) / OPTIMIZED_RETURN);

    const [label, emoji] = labels[milestoneAge] || [`Mit ${milestoneAge}`, '📅'];

    return {
      age: milestoneAge,
      year: currentYear + years,
      label,
      emoji,
      withoutChange: Math.max(0, withoutChange),
      withFinLife: Math.max(0, withFinLife),
    };
  });
}

// ── Animated counter ──
function CountUpCHF({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{fmtCHF(display)}</span>;
}

interface AlternativeTimelineProps {
  filmData: LifeFilmData;
  baseDelay?: number;
}

export function AlternativeTimeline({ filmData, baseDelay = 0 }: AlternativeTimelineProps) {
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const { score: currentPeakScore, rank: peakRank } = usePeakScore();

  const comparison = useMemo(() => buildComparison(filmData), [filmData]);

  const lastRow = comparison[comparison.length - 1];
  const difference = lastRow ? lastRow.withFinLife - lastRow.withoutChange : 0;

  // PeakScore at 50
  const yearsTo50 = Math.max(50 - filmData.age, 0);
  const optimizedMonthlySavings = filmData.monthly_income * 0.1 +
    (filmData.monthly_income - filmData.monthly_expenses) +
    filmData.monthly_expenses * 0.4 * 0.2 +
    SAULE_3A_MAX / 12 + KK_SAVINGS_YEARLY / 12;
  const wealthAt50 = filmData.total_savings * Math.pow(1 + OPTIMIZED_RETURN, yearsTo50) +
    Math.max(0, optimizedMonthlySavings) * 12 * ((Math.pow(1 + OPTIMIZED_RETURN, yearsTo50) - 1) / OPTIMIZED_RETURN);
  const expensesAt50 = filmData.monthly_expenses * Math.pow(1 + INFLATION, yearsTo50);
  const peakScoreAt50 = expensesAt50 > 0 ? wealthAt50 / expensesAt50 : 0;

  // Earliest "could stop" age
  const monthlyExpenses = filmData.monthly_expenses;
  let couldStopAge = filmData.target_retirement_age;
  for (let testAge = filmData.age + 5; testAge <= 70; testAge++) {
    const y = testAge - filmData.age;
    const w = filmData.total_savings * Math.pow(1 + OPTIMIZED_RETURN, y) +
      Math.max(0, optimizedMonthlySavings) * 12 * ((Math.pow(1 + OPTIMIZED_RETURN, y) - 1) / OPTIMIZED_RETURN);
    const pkAnnual = w * PK_ANNUAL_FACTOR;
    const monthlyPension = pkAnnual / 12 + AHV_MAX_MONTHLY;
    const expThen = monthlyExpenses * Math.pow(1 + INFLATION, y);
    if (monthlyPension >= expThen * 0.9) {
      couldStopAge = testAge;
      break;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: baseDelay }}
      className="mt-10 space-y-6"
    >
      {/* Section header */}
      <div className="text-center space-y-2">
        <span className="text-2xl">📈</span>
        <h2 className="text-lg font-bold text-foreground">
          Was möglich ist, wenn du JETZT handelst
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Gleiche Lebensereignisse, aber mit optimiertem Finanzverhalten.
        </p>
      </div>

      {/* Assumptions pill */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {[
          '+10% Sparquote',
          '3a maximiert',
          '5% Rendite p.a.',
          '-20% Verschwendung',
          'KK optimiert',
        ].map(a => (
          <Badge key={a} variant="outline" className="text-[10px] font-normal">
            {a}
          </Badge>
        ))}
      </div>

      {/* Comparison rows */}
      <div className="space-y-3">
        {comparison.map((row, idx) => {
          const diff = row.withFinLife - row.withoutChange;
          const maxVal = Math.max(row.withFinLife, 1);
          const currentPct = (row.withoutChange / maxVal) * 100;

          return (
            <motion.div
              key={row.age}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: baseDelay + 0.1 + idx * 0.08 }}
            >
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{row.emoji}</span>
                      <div>
                        <p className="text-xs text-muted-foreground">{row.year}</p>
                        <h3 className="text-sm font-bold text-foreground">{row.label}</h3>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{row.age} J.</Badge>
                  </div>

                  {/* Side by side */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-muted p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">Ohne Änderung</p>
                      <p className="text-xs font-bold text-foreground">{fmtCHF(row.withoutChange)}</p>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-2.5 text-center border border-primary/20">
                      <p className="text-[10px] text-primary mb-0.5">Mit FinLife</p>
                      <p className="text-xs font-bold text-primary">{fmtCHF(row.withFinLife)}</p>
                    </div>
                  </div>

                  {/* Bar comparison */}
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-muted-foreground/30 transition-all duration-700"
                        style={{ width: `${currentPct}%` }}
                      />
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70 transition-all duration-700"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  {diff > 0 && (
                    <p className="text-[10px] text-primary font-medium text-right">
                      +{fmtCHF(diff)} mehr
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── Final comparison card ── */}
      <Separator />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: baseDelay + 0.1 + comparison.length * 0.08 + 0.2 }}
      >
        <Card className="border-2 border-primary/30 shadow-lg overflow-hidden bg-primary/5">
          <CardContent className="p-6 text-center space-y-4">
            <h2 className="text-base font-bold text-foreground">
              Der Unterschied über dein Leben:
            </h2>
            <p className="text-4xl font-black text-primary">
              <CountUpCHF value={difference} />
            </p>
            <p className="text-sm font-semibold text-muted-foreground">
              Das ist der Preis des Nichtstuns.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* PeakScore projection */}
      {filmData.age < 50 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: baseDelay + 0.1 + comparison.length * 0.08 + 0.5 }}
        >
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Dein möglicher PeakScore mit 50: <span className="text-primary">{peakScoreAt50.toFixed(1)} Monate</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Das bedeutet: Du könntest mit <span className="font-bold text-foreground">{couldStopAge}</span> aufhören zu MÜSSEN.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: baseDelay + 0.1 + comparison.length * 0.08 + 0.7 }}
        className="space-y-3"
      >
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={() => navigate('/app/client-portal/coach/mindset')}
        >
          <Rocket className="h-4 w-4" />
          Jetzt starten 🚀
        </Button>
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => {
            // Generate share-friendly view — simplified clipboard share
            const text = `Mein FinLife Lebensfilm:\n\nOhne Änderung: ${lastRow ? fmtCHF(lastRow.withoutChange) : '–'}\nMit FinLife: ${lastRow ? fmtCHF(lastRow.withFinLife) : '–'}\nUnterschied: ${fmtCHF(difference)}\n\nStarte deinen eigenen Lebensfilm auf FinLife ✦`;
            navigator.clipboard.writeText(text);
          }}
        >
          <Share2 className="h-4 w-4" />
          Lebensfilm teilen
        </Button>
      </motion.div>
    </motion.div>
  );
}
