import { useNavigate } from 'react-router-dom';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowUp, ArrowDown, Shield, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePeakScore, getPeakScoreGradient, getPeakScoreBorderColor, getRankForScore } from '@/hooks/usePeakScore';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useMemo } from 'react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

function PeakScoreTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  const rank = getRankForScore(d.score);
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-foreground">{d.score.toFixed(1)} Monate</p>
      <p className="text-muted-foreground">{d.label}</p>
      <p className="text-muted-foreground">{rank.emoji} {rank.name}</p>
    </div>
  );
}

export default function ClientPortalPeakScore() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { score, totalAssets, totalLiabilities, monthlyExpenses, trend, hasData, rank, assetCount, liabilityCount, expenseSource } = usePeakScore();

  const { data: history = [] } = useQuery({
    queryKey: ['peak-score-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('peak_scores')
        .select('score, calculated_at')
        .eq('user_id', user.id)
        .eq('is_snapshot', true)
        .order('calculated_at', { ascending: true })
        .limit(6);
      return data || [];
    },
    enabled: !!user,
  });

  const chartData = useMemo(() => {
    return history.map((h: any) => {
      const date = new Date(h.calculated_at);
      return {
        score: Number(h.score),
        label: `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`,
        month: MONTH_NAMES[date.getMonth()],
      };
    });
  }, [history]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const scores = chartData.map((d: any) => d.score);
    const maxVal = Math.max(...scores);
    const maxItem = chartData.find((d: any) => d.score === maxVal);
    const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    return {
      highest: maxVal,
      highestLabel: maxItem?.label || '',
      change: trend,
      average: Math.round(avg * 10) / 10,
    };
  }, [chartData, trend]);

  const fmtCHF = (v: number) => `CHF ${v.toLocaleString('de-CH', { maximumFractionDigits: 0 })}`;
  const displayScore = score !== null;
  const netWorth = totalAssets - totalLiabilities;

  const expenseSourceLabel = expenseSource === 'budget'
    ? 'Durchschnitt letzte 3 Monate'
    : expenseSource === 'profile'
    ? 'aus Finanzprofil'
    : '';

  // Generate improvement tips
  const tips = useMemo(() => {
    const t: { emoji: string; text: string; cta: string; route: string }[] = [];
    if (monthlyExpenses > 0) {
      const reduction = 200;
      const newScore = netWorth / Math.max(1, monthlyExpenses - reduction);
      const gain = Math.round((newScore - (score || 0)) * 10) / 10;
      if (gain > 0) {
        t.push({
          emoji: '💸',
          text: `Reduziere deine Ausgaben um CHF 200/Monat → +${gain} PeakScore`,
          cta: 'Budget öffnen',
          route: '/app/client-portal/budget',
        });
      }
    }
    if (totalAssets === 0) {
      t.push({
        emoji: '📈',
        text: 'Beginne zu investieren → Starte den Finanz-Coach',
        cta: 'Finanz-Coach starten',
        route: '/app/client-portal/coach',
      });
    }
    t.push({
      emoji: '🏦',
      text: 'Zahle in die Säule 3a ein → Spare zusätzlich Steuern',
      cta: '3a-Check starten',
      route: '/app/client-portal/tools/mini-3a-kurzcheck',
    });
    return t.slice(0, 3);
  }, [monthlyExpenses, totalAssets, netWorth, score]);

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/client-portal')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">PeakScore</h1>
        </div>

        {/* Hero score card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={cn(
            'rounded-2xl border overflow-hidden',
            displayScore ? `bg-gradient-to-br ${getPeakScoreGradient(score)} ${getPeakScoreBorderColor(score)}` : ''
          )}>
            <CardContent className="p-8 flex flex-col items-center text-center">
              <Shield className="h-6 w-6 text-muted-foreground/50 mb-2" />
              <span className="text-[56px] leading-none font-extrabold tracking-tight text-foreground">
                {displayScore ? score.toFixed(1) : '–'}
              </span>
              <span className="text-sm text-muted-foreground mt-1">Monate</span>
              {displayScore && (
                <span className="text-lg font-bold text-foreground/80 mt-1">
                  {rank.emoji} {rank.name}
                </span>
              )}
              {trend !== null && trend !== 0 && (
                <div className={cn(
                  'flex items-center gap-1 mt-2 text-sm font-medium',
                  trend > 0 ? 'text-emerald-600' : 'text-red-500'
                )}>
                  {trend > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {trend > 0 ? '+' : ''}{trend} seit letztem Monat
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Score breakdown */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Score-Zusammensetzung</h3>
            <div className="space-y-2.5">
              {breakdownItems.map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={cn('text-sm font-semibold', item.color)}>{item.value}</span>
                </div>
              ))}
              {displayScore && (
                <div className="border-t border-border pt-2 mt-2 flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">PeakScore</span>
                  <span className="text-sm font-bold text-foreground">
                    {fmtCHF(totalAssets - totalLiabilities)} ÷ {fmtCHF(monthlyExpenses)} = {score.toFixed(1)} Mt.
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Historical chart */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Verlauf (letzte 6 Monate)</h3>
            </div>

            {chartData.length >= 2 ? (
              <>
                <div className="h-[200px] -ml-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="peakScoreFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(60, 10%, 45%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(60, 10%, 45%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(60, 5%, 80%)" strokeOpacity={0.3} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: 'hsl(60, 5%, 50%)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'hsl(60, 5%, 50%)' }}
                        axisLine={false}
                        tickLine={false}
                        unit=" Mt."
                      />
                      <RechartsTooltip content={<PeakScoreTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(60, 10%, 45%)"
                        strokeWidth={2.5}
                        fill="url(#peakScoreFill)"
                        dot={{ r: 4, fill: 'hsl(60, 10%, 45%)', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: 'hsl(60, 10%, 40%)', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Stats below chart */}
                {stats && (
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Höchster</p>
                      <p className="text-sm font-bold text-foreground">{stats.highest.toFixed(1)}</p>
                      <p className="text-[10px] text-muted-foreground">{stats.highestLabel}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Veränderung</p>
                      <p className={cn(
                        'text-sm font-bold',
                        stats.change && stats.change > 0 ? 'text-emerald-600' : stats.change && stats.change < 0 ? 'text-red-500' : 'text-foreground'
                      )}>
                        {stats.change !== null ? `${stats.change > 0 ? '+' : ''}${stats.change}` : '–'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">letzter Monat</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Durchschnitt</p>
                      <p className="text-sm font-bold text-foreground">{stats.average.toFixed(1)}</p>
                      <p className="text-[10px] text-muted-foreground">Monate</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-8 px-4">
                <span className="text-3xl mb-3">📈</span>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  Dein Verlauf wird hier sichtbar sobald du die App einen Monat nutzt. Bleib dran!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coach CTA */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
          onClick={() => navigate('/app/client-portal/coach')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 grid place-content-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Wie verbessere ich meinen Score?</p>
              <p className="text-[11px] text-muted-foreground">Dein Finanz-Coach hilft dir weiter</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientPortalLayout>
  );
}
