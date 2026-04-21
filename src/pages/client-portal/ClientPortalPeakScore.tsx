import { useNavigate } from 'react-router-dom';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowUp, ArrowDown, Shield, Sparkles, TrendingUp, ChevronRight, Target, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InfoHint } from '@/components/client-portal/InfoHint';
import { cn } from '@/lib/utils';
import { usePeakScore, getPeakScoreGradient, getPeakScoreBorderColor, getRankForScore } from '@/hooks/usePeakScore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useMemo, useState, useEffect } from 'react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

const FIRST_TIME_KEY = 'peakscore_intro_seen';

function PeakScoreTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { score: number; label: string } }> }) {
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

function formatScoreHuman(score: number): string {
  const months = Math.floor(score);
  const days = Math.round((score - months) * 30);
  if (months >= 24) {
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0 ? `${years} Jahre, ${rem} Monate` : `${years} Jahre`;
  }
  return days > 0 ? `${months} Monate, ${days} Tage` : `${months} Monate`;
}

export default function ClientPortalPeakScore() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { score, totalAssets, totalLiabilities, monthlyExpenses, trend, hasData, rank, assetCount, liabilityCount, expenseSource } = usePeakScore();

  // First-time overlay
  const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    if (score !== null && !localStorage.getItem(FIRST_TIME_KEY)) {
      setShowIntro(true);
    }
  }, [score]);

  const dismissIntro = () => {
    localStorage.setItem(FIRST_TIME_KEY, '1');
    setShowIntro(false);
  };

  // Freedom goal from meta_profiles
  const { data: freedomGoal } = useQuery({
    queryKey: ['freedom-goal', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('meta_profiles')
        .select('freedom_target_age, freedom_life_expectancy, age')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const [targetAge, setTargetAge] = useState(55);
  const [lifeExpectancy, setLifeExpectancy] = useState(85);

  useEffect(() => {
    if (freedomGoal) {
      setTargetAge(freedomGoal.freedom_target_age ?? 55);
      setLifeExpectancy(freedomGoal.freedom_life_expectancy ?? 85);
    }
  }, [freedomGoal]);

  const saveFreedomGoal = useMutation({
    mutationFn: async ({ age, life }: { age: number; life: number }) => {
      if (!user) return;
      const { error } = await supabase
        .from('meta_profiles')
        .update({ freedom_target_age: age, freedom_life_expectancy: life })
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['freedom-goal'] }),
  });

  // Debounced save
  useEffect(() => {
    const t = setTimeout(() => {
      if (freedomGoal && (targetAge !== freedomGoal.freedom_target_age || lifeExpectancy !== freedomGoal.freedom_life_expectancy)) {
        saveFreedomGoal.mutate({ age: targetAge, life: lifeExpectancy });
      }
    }, 800);
    return () => clearTimeout(t);
  }, [targetAge, lifeExpectancy]);

  const requiredScore = Math.max(0, (lifeExpectancy - targetAge) * 12);
  const freedomProgress = score !== null && requiredScore > 0 ? Math.min(100, Math.round((score / requiredScore) * 100)) : 0;

  // Estimate years to reach target based on monthly growth
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
    return history.map((h: { score: number; calculated_at: string }) => {
      const date = new Date(h.calculated_at);
      return {
        score: Number(h.score),
        label: `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`,
        month: MONTH_NAMES[date.getMonth()],
      };
    });
  }, [history]);

  const monthlyGrowthRate = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].score;
    const last = chartData[chartData.length - 1].score;
    const months = chartData.length - 1;
    return months > 0 ? (last - first) / months : null;
  }, [chartData]);

  const yearsToTarget = useMemo(() => {
    if (score === null || monthlyGrowthRate === null || monthlyGrowthRate <= 0) return null;
    const remaining = requiredScore - score;
    if (remaining <= 0) return 0;
    const monthsNeeded = remaining / monthlyGrowthRate;
    return Math.round(monthsNeeded / 12 * 10) / 10;
  }, [score, monthlyGrowthRate, requiredScore]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const scores = chartData.map((d: { score: number }) => d.score);
    const maxVal = Math.max(...scores);
    const maxItem = chartData.find((d: { score: number }) => d.score === maxVal);
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

  const tips = useMemo(() => {
    const t: { emoji: string; text: string; cta: string; route: string }[] = [];
    if (monthlyExpenses > 0) {
      const reduction = 200;
      const newScore = netWorth / Math.max(1, monthlyExpenses - reduction);
      const gain = Math.round((newScore - (score || 0)) * 10) / 10;
      if (gain > 0) {
        t.push({ emoji: '💸', text: `Reduziere deine Ausgaben um CHF 200/Monat → +${gain} PeakScore`, cta: 'Budget öffnen', route: '/app/client-portal/budget' });
      }
    }
    if (totalAssets === 0) {
      t.push({ emoji: '📈', text: 'Beginne zu investieren → Starte den Finanz-Coach', cta: 'Finanz-Coach starten', route: '/app/client-portal/coach' });
    }
    t.push({ emoji: '🏦', text: 'Zahle in die Säule 3a ein → Spare zusätzlich Steuern', cta: '3a-Check starten', route: '/app/client-portal/tools/mini-3a-kurzcheck' });
    return t.slice(0, 3);
  }, [monthlyExpenses, totalAssets, netWorth, score]);

  return (
    <ClientPortalLayout>
      <ScreenHeader title="PeakScore" backTo="/app/client-portal" />
      <div className="max-w-2xl mx-auto space-y-5">

        {/* First-time overlay */}
        <AnimatePresence>
          {showIntro && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-5 text-center">
                  <span className="text-3xl mb-2 block">🚀</span>
                  <p className="text-sm text-foreground leading-relaxed max-w-sm mx-auto">
                    Dein PeakScore zeigt dir, wie viele Monate du ohne Einkommen leben könntest. Je höher, desto freier. Dein Ziel? So hoch wie möglich.
                  </p>
                  <Button size="sm" className="mt-4" onClick={dismissIntro}>Verstanden</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero score card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={cn(
            'rounded-2xl border overflow-hidden',
            displayScore ? `bg-gradient-to-br ${getPeakScoreGradient(score)} ${getPeakScoreBorderColor(score)}` : ''
          )}>
            <CardContent className="p-8 flex flex-col items-center text-center">
              <Shield className="h-6 w-6 text-muted-foreground/50 mb-2" />
              {displayScore ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[56px] leading-none font-extrabold tracking-tight text-foreground">
                      {Math.floor(score)}
                    </span>
                    <span className="text-base text-muted-foreground font-medium">
                      {formatScoreHuman(score).replace(/^\d+\s*/, '')}
                    </span>
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-2 max-w-[280px] leading-relaxed">
                    So lange könntest du leben, ohne zu arbeiten.
                  </p>
                  <span className="text-lg font-bold text-foreground/80 mt-2">
                    {rank.emoji} {rank.name}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[56px] leading-none font-extrabold tracking-tight text-muted-foreground/40">–</span>
                  <span className="text-sm text-muted-foreground mt-1">
                    {!hasData ? 'Erfasse deine Finanzdaten' : 'Fixkosten fehlen'}
                  </span>
                </>
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
          <InfoHint
            text="Der PeakScore zeigt, wie viele Monate du von deinem Vermögen leben könntest – ohne Einkommen. Je höher, desto unabhängiger."
            articleId="unabhaengigkeit"
          />
        </motion.div>

        {/* "Was bedeutet dein Score?" */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Was bedeutet dein Score?</h3>
            <div className="space-y-2 mb-4">
              {[
                { score: 1, text: '1 Monat ohne Einkommen' },
                { score: 12, text: '1 Jahr' },
                { score: 120, text: '10 Jahre' },
                { score: 600, text: '50 Jahre' },
              ].map(r => (
                <div key={r.score} className="flex items-center gap-3 text-[13px]">
                  <span className="font-bold text-foreground w-14 text-right">{r.score}</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="text-muted-foreground">{r.text}</span>
                </div>
              ))}
            </div>
            {displayScore && (
              <div className="bg-muted/40 rounded-xl p-4">
                <p className="text-[13px] text-foreground leading-relaxed">
                  <strong>Dein Score von {score.toFixed(1)}:</strong> Du könntest <strong>{formatScoreHuman(score)}</strong> deinen aktuellen Lebensstil aufrechterhalten, ohne einen weiteren Franken zu verdienen.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Freedom Goal */}
        {displayScore && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Dein Freiheits-Ziel</h3>
              </div>

              {/* Target age slider */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[13px] text-muted-foreground">Finanziell frei mit</p>
                    <span className="text-sm font-bold text-foreground">{targetAge} Jahren</span>
                  </div>
                  <Slider
                    value={[targetAge]}
                    onValueChange={v => setTargetAge(v[0])}
                    min={35}
                    max={70}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[13px] text-muted-foreground">Lebenserwartung</p>
                    <span className="text-sm font-bold text-foreground">{lifeExpectancy} Jahre</span>
                  </div>
                  <Slider
                    value={[lifeExpectancy]}
                    onValueChange={v => setLifeExpectancy(v[0])}
                    min={70}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Result */}
              <div className="bg-muted/40 rounded-xl p-4 mt-4 space-y-3">
                <p className="text-[13px] text-foreground leading-relaxed">
                  Um mit <strong>{targetAge}</strong> finanziell frei zu sein, brauchst du einen PeakScore von <strong>{requiredScore}</strong>.
                </p>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-muted-foreground">{score.toFixed(0)} / {requiredScore}</span>
                    <span className="text-xs font-bold text-primary">{freedomProgress}%</span>
                  </div>
                  <Progress value={freedomProgress} className="h-2.5" />
                </div>

                <p className="text-[13px] text-foreground">
                  Du bist bei <strong>{freedomProgress}%</strong> deines Ziels.
                </p>

                {yearsToTarget !== null && yearsToTarget > 0 && (
                  <p className="text-[12px] text-muted-foreground">
                    📈 Bei deiner aktuellen Entwicklung erreichst du dieses Ziel in ca. <strong>{yearsToTarget}</strong> Jahren.
                  </p>
                )}
                {yearsToTarget === 0 && (
                  <p className="text-[12px] font-semibold text-emerald-600">
                    🎉 Du hast dein Freiheits-Ziel bereits erreicht!
                  </p>
                )}
                {yearsToTarget === null && chartData.length < 2 && (
                  <p className="text-[12px] text-muted-foreground">
                    Nutze die App einen Monat, um eine Prognose zu erhalten.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calculation breakdown */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">So berechnet sich dein PeakScore</h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">💰</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">Vermögen</p>
                    <p className="text-[11px] text-muted-foreground">{assetCount} Einträge</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-emerald-600">{fmtCHF(totalAssets)}</span>
              </div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">📉</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">Verbindlichkeiten</p>
                    <p className="text-[11px] text-muted-foreground">{liabilityCount} Einträge</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-red-500">- {fmtCHF(totalLiabilities)}</span>
              </div>
              <div className="border-t border-border my-1" />
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-foreground">= Nettovermögen</p>
                <span className={cn('text-sm font-bold', netWorth >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                  {netWorth < 0 ? '- ' : ''}{fmtCHF(Math.abs(netWorth))}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">÷ Monatliche Ausgaben</p>
                  {expenseSourceLabel && <p className="text-[11px] text-muted-foreground">{expenseSourceLabel}</p>}
                </div>
                <span className="text-sm font-semibold text-muted-foreground">÷ {fmtCHF(monthlyExpenses)} / Mt.</span>
              </div>
              <div className="border-t border-border my-1" />
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-foreground">= PeakScore</p>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-foreground">
                    {displayScore ? `${score.toFixed(1)} Monate` : '–'}
                  </span>
                  {displayScore && <span className="text-sm">{rank.emoji}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">So verbesserst du deinen Score</h3>
            <div className="space-y-3">
              {tips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.98]"
                  onClick={() => navigate(tip.route)}
                >
                  <span className="text-lg shrink-0">{tip.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground/80 leading-relaxed">{tip.text}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
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
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(60, 5%, 50%)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(60, 5%, 50%)' }} axisLine={false} tickLine={false} unit=" Mt." />
                      <RechartsTooltip content={<PeakScoreTooltip />} />
                      <Area type="monotone" dataKey="score" stroke="hsl(60, 10%, 45%)" strokeWidth={2.5} fill="url(#peakScoreFill)" dot={{ r: 4, fill: 'hsl(60, 10%, 45%)', stroke: 'hsl(var(--background))', strokeWidth: 2 }} activeDot={{ r: 6, fill: 'hsl(60, 10%, 40%)', stroke: 'hsl(var(--background))', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {stats && (
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Höchster</p>
                      <p className="text-sm font-bold text-foreground">{stats.highest.toFixed(1)}</p>
                      <p className="text-[10px] text-muted-foreground">{stats.highestLabel}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Veränderung</p>
                      <p className={cn('text-sm font-bold', stats.change && stats.change > 0 ? 'text-emerald-600' : stats.change && stats.change < 0 ? 'text-red-500' : 'text-foreground')}>
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
        <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]" onClick={() => navigate('/app/client-portal/coach')}>
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
