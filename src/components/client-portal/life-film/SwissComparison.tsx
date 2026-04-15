import { useMemo, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle, XCircle, Info } from 'lucide-react';

const fmtCHF = (v: number) =>
  `CHF ${Math.round(v).toLocaleString('de-CH')}`;

// ── Swiss statistical reference data (BFS / SNB approximations) ──
const MEDIAN_NET_WORTH: Record<string, number> = {
  '25-34': 47_000,
  '35-44': 135_000,
  '45-54': 245_000,
  '55-64': 420_000,
};

const AVG_SAVINGS_RATE_BY_AGE: Record<string, number> = {
  '25-34': 15,
  '35-44': 17,
  '45-54': 18,
  '55-64': 20,
};

const AVG_PEAK_SCORE_BY_AGE: Record<string, number> = {
  '25-34': 3.5,
  '35-44': 6.0,
  '45-54': 10.0,
  '55-64': 16.0,
};

function getAgeGroup(age: number): string {
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  return '55-64';
}

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

interface SwissComparisonProps {
  filmData: LifeFilmData;
  baseDelay?: number;
}

export function SwissComparison({ filmData, baseDelay = 0 }: SwissComparisonProps) {
  const ageGroup = getAgeGroup(filmData.age);

  // 1. Sparquote
  const userSavingsRate = filmData.monthly_income > 0
    ? Math.round(((filmData.monthly_income - filmData.monthly_expenses) / filmData.monthly_income) * 100)
    : 0;
  const avgSavingsRate = AVG_SAVINGS_RATE_BY_AGE[ageGroup] ?? 17;
  const savingsAboveAvg = userSavingsRate >= avgSavingsRate;

  // 2. Vermögen
  const medianNetWorth = MEDIAN_NET_WORTH[ageGroup] ?? 135_000;
  const wealthPercent = medianNetWorth > 0 ? Math.round((filmData.total_savings / medianNetWorth) * 100) : 0;

  // 3. Säule 3a
  const has3a = filmData.life_goals?.includes('3a') || filmData.total_savings > 20_000;
  // Simplified heuristic — if user answered "3a" or has meaningful savings

  // 4. PeakScore
  const userPeakScore = filmData.monthly_expenses > 0
    ? filmData.total_savings / filmData.monthly_expenses
    : 0;
  const avgPeakScore = AVG_PEAK_SCORE_BY_AGE[ageGroup] ?? 6;
  const peakAboveAvg = userPeakScore >= avgPeakScore;

  const items = [
    // Sparquote
    {
      emoji: '💰',
      label: 'Sparquote',
      content: (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Du sparst <span className="font-bold text-foreground">{userSavingsRate}%</span>. Der Schweizer Durchschnitt in deinem Alter ist <span className="font-bold text-foreground">{avgSavingsRate}%</span>.
          </p>
          <div className="relative h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                savingsAboveAvg ? 'bg-emerald-500' : 'bg-amber-500'
              )}
              style={{ width: `${Math.min(100, Math.max(5, (userSavingsRate / Math.max(avgSavingsRate * 1.5, 1)) * 100))}%` }}
            />
            {/* Average marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-foreground/40"
              style={{ left: `${(avgSavingsRate / Math.max(avgSavingsRate * 1.5, 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span>Ø {avgSavingsRate}%</span>
          </div>
        </div>
      ),
      positive: savingsAboveAvg,
    },
    // Vermögen
    {
      emoji: '🏦',
      label: 'Vermögen',
      content: (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Dein Vermögen: <span className="font-bold text-foreground">{fmtCHF(filmData.total_savings)}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Median ({ageGroup} J.): <span className="font-bold text-foreground">{fmtCHF(medianNetWorth)}</span>
          </p>
          <div className="relative h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                wealthPercent >= 100 ? 'bg-emerald-500' : wealthPercent >= 50 ? 'bg-amber-500' : 'bg-destructive'
              )}
              style={{ width: `${Math.min(100, Math.max(5, wealthPercent * 0.5))}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-foreground/40"
              style={{ left: '50%' }}
            />
          </div>
          <p className="text-xs font-medium text-center">
            <span className={cn(wealthPercent >= 100 ? 'text-emerald-600' : 'text-amber-600')}>
              {wealthPercent}% des Medians
            </span>
          </p>
        </div>
      ),
      positive: wealthPercent >= 100,
    },
    // Säule 3a
    {
      emoji: '🏛️',
      label: 'Säule 3a',
      content: (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            ~60% der Schweizer haben eine Säule 3a. Nur ~25% zahlen den Maximalbetrag ein.
          </p>
          <div className="flex items-center gap-2">
            {has3a ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <Badge variant="outline" className="text-emerald-600 border-emerald-300 text-xs">
                  Du nutzt die 3a ✓
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-amber-500" />
                <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                  Du nutzt die 3a noch nicht ✗
                </Badge>
              </>
            )}
          </div>
        </div>
      ),
      positive: has3a,
    },
    // PeakScore
    {
      emoji: '🛡️',
      label: 'PeakScore',
      content: (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Geschätzter Durchschnitts-PeakScore für {ageGroup}-Jährige: <span className="font-bold text-foreground">{avgPeakScore.toFixed(1)} Monate</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Dein PeakScore: <span className={cn('font-bold', peakAboveAvg ? 'text-emerald-600' : 'text-amber-600')}>
              {userPeakScore.toFixed(1)} Monate
            </span>
          </p>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              peakAboveAvg
                ? 'text-emerald-600 border-emerald-300'
                : 'text-amber-600 border-amber-300'
            )}
          >
            {peakAboveAvg ? '↑ Über dem Durchschnitt' : '↓ Unter dem Durchschnitt'}
          </Badge>
        </div>
      ),
      positive: peakAboveAvg,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: baseDelay }}
      className="mt-10 space-y-5"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <BarChart3 className="h-6 w-6 text-primary mx-auto" />
        <h2 className="text-lg font-bold text-foreground">
          Wo stehst du im Schweizer Vergleich?
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Deine Zahlen im Kontext der Schweizer Bevölkerung ({ageGroup} Jahre).
        </p>
      </div>

      {/* Comparison cards */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: baseDelay + 0.1 + idx * 0.1 }}
          >
            <Card className={cn(
              'border-l-4',
              item.positive
                ? 'border-l-emerald-500'
                : 'border-l-amber-500'
            )}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.emoji}</span>
                  <h3 className="text-sm font-bold text-foreground">{item.label}</h3>
                </div>
                {item.content}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: baseDelay + 0.6 }}
        className="flex items-start gap-2 px-2"
      >
        <Info className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Basierend auf Schweizer Durchschnittswerten (BFS/SNB). Deine individuelle Situation kann abweichen.
        </p>
      </motion.div>
    </motion.div>
  );
}
