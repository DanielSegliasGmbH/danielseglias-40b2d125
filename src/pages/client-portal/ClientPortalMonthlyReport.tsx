import { useState, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Json } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, Share2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ShareCardGenerator } from '@/components/client-portal/ShareCardGenerator';
import { getRankForScore, usePeakScore } from '@/hooks/usePeakScore';
import { Link, useSearchParams } from 'react-router-dom';

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getPrevMonthKey(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return getMonthKey(d);
}

function getMonthRange(monthKey: string) {
  const [y, m] = monthKey.split('-').map(Number);
  const start = `${monthKey}-01`;
  const end = new Date(y, m, 0).toISOString().slice(0, 10);
  return { start, end };
}

function fmtCHF(v: number) {
  return `CHF ${v.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const SLIDE_VARIANTS = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export default function ClientPortalMonthlyReport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [currentDate, setCurrentDate] = useState(() => {
    const mk = searchParams.get('month');
    if (mk) { const [y, m] = mk.split('-').map(Number); return new Date(y, m - 1, 1); }
    return new Date();
  });
  const [slide, setSlide] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const TOTAL_SLIDES = 5;

  const monthKey = getMonthKey(currentDate);
  const prevMonthKey = getPrevMonthKey(monthKey);
  const [y, m] = monthKey.split('-').map(Number);
  const monthLabel = `${MONTHS[m - 1]} ${y}`;
  const { start, end } = getMonthRange(monthKey);
  const prevRange = getMonthRange(prevMonthKey);

  const goMonth = (dir: number) => {
    setCurrentDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + dir); return d; });
    setSlide(0);
  };

  const goSlide = (dir: number) => {
    setSlideDir(dir);
    setSlide(s => Math.max(0, Math.min(TOTAL_SLIDES - 1, s + dir)));
  };

  // --- Data queries ---
  const { data: metaProfile } = useQuery({
    queryKey: ['report-meta', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from('meta_profiles').select('monthly_income').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: peakScoreCurrent } = useQuery({
    queryKey: ['report-peak-current', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from('peak_scores').select('score').eq('user_id', user.id).eq('is_snapshot', false).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: peakScoreSnapshot } = useQuery({
    queryKey: ['report-peak-snapshot', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from('peak_scores').select('score').eq('user_id', user.id).eq('is_snapshot', true).gte('created_at', `${start}T00:00:00`).lte('created_at', `${end}T23:59:59`).order('created_at', { ascending: false }).limit(1).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['report-expenses', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('budget_expenses').select('amount, category').eq('user_id', user.id).gte('expense_date', start).lte('expense_date', end);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: gamActions = [] } = useQuery({
    queryKey: ['report-gam', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('gamification_actions').select('action_type, points_awarded').eq('user_id', user.id).gte('created_at', `${start}T00:00:00`).lte('created_at', `${end}T23:59:59`);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: tasksCompleted = 0 } = useQuery({
    queryKey: ['report-tasks', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase.from('client_tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_completed', true).gte('completed_at', `${start}T00:00:00`).lte('completed_at', `${end}T23:59:59`);
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: goalsProgressed = 0 } = useQuery({
    queryKey: ['report-goals-count', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase.from('client_goals').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('updated_at', `${start}T00:00:00`).lte('updated_at', `${end}T23:59:59`);
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: coachSteps = 0 } = useQuery({
    queryKey: ['report-coach', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase.from('coach_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed').gte('completed_at', `${start}T00:00:00`).lte('completed_at', `${end}T23:59:59`);
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: streakDays = 0 } = useQuery({
    queryKey: ['report-streak', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data } = await supabase.from('gamification_actions').select('created_at').eq('user_id', user.id).eq('action_type', 'daily_login').order('created_at', { ascending: false }).limit(60);
      if (!data || data.length === 0) return 0;
      let streak = 0;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const loginDays = new Set(data.map((d: { created_at: string }) => new Date(d.created_at).toISOString().slice(0, 10)));
      for (let i = 0; i < 60; i++) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        if (loginDays.has(d.toISOString().slice(0, 10))) streak++;
        else if (i > 0) break;
      }
      return streak;
    },
    enabled: !!user,
  });

  // Saved summaries for browsing
  const { data: savedSummaries = [] } = useQuery({
    queryKey: ['monthly-summaries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('monthly_summaries').select('month_key, created_at').eq('user_id', user.id).order('month_key', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Save summary
  const saveSummary = useMutation({
    mutationFn: async (summaryData: Record<string, unknown>) => {
      if (!user) throw new Error('No user');
      const jsonData = summaryData as unknown as Json;
      const { data: existing } = await supabase.from('monthly_summaries')
        .select('id').eq('user_id', user.id).eq('month_key', monthKey).maybeSingle();
      if (existing) {
        const { error } = await supabase.from('monthly_summaries')
          .update({ summary_data: jsonData })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('monthly_summaries')
          .insert([{ user_id: user.id, month_key: monthKey, summary_data: jsonData }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-summaries'] });
    },
  });

  // --- Computed ---
  const income = metaProfile?.monthly_income || 0;
  const totalExpenses = useMemo(() => expenses.reduce((s: number, e: { amount: number }) => s + Number(e.amount), 0), [expenses]);
  const netSavings = income - totalExpenses;
  const savingsRate = income > 0 ? Math.round((netSavings / income) * 100) : 0;

  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e: { category: string; amount: number }) => { map[e.category] = (map[e.category] || 0) + Number(e.amount); });
    return map;
  }, [expenses]);

  const biggestCategory = useMemo(() => {
    let max = { category: '', amount: 0 };
    Object.entries(expensesByCategory).forEach(([cat, amt]) => {
      if (amt > max.amount) max = { category: cat, amount: amt };
    });
    return max;
  }, [expensesByCategory]);

  const xpThisMonth = useMemo(() => gamActions.reduce((s: number, a: { points_awarded: number }) => s + Number(a.points_awarded), 0), [gamActions]);

  const currentScore = peakScoreCurrent?.score ?? 0;
  const snapshotScore = peakScoreSnapshot?.score ?? currentScore;
  const peakDelta = Math.round((currentScore - snapshotScore) * 10) / 10;
  const currentRank = getRankForScore(currentScore);
  const snapshotRank = getRankForScore(snapshotScore);
  const rankChange = currentRank.rank > snapshotRank.rank ? 'up' : currentRank.rank < snapshotRank.rank ? 'down' : 'same';

  const resultMessage = savingsRate > 25
    ? { text: 'Herausragend! 🏆 Du sparst mehr als 95% der Schweizer.', level: 'gold' }
    : savingsRate >= 15
    ? { text: 'Starker Monat! 💪 Du bist auf Kurs.', level: 'silver' }
    : savingsRate >= 5
    ? { text: 'Solide. Nächsten Monat packen wir mehr! 📈', level: 'bronze' }
    : { text: 'Herausfordernder Monat. Lass uns einen Plan machen. 🎯', level: 'start' };

  // Auto-save on first view
  const handleSaveIfNeeded = useCallback(() => {
    if (!user) return;
    const alreadySaved = savedSummaries.some((s: { month_key: string }) => s.month_key === monthKey);
    if (!alreadySaved) {
      saveSummary.mutate({
        peakScore: currentScore,
        peakDelta,
        rank: currentRank.name,
        rankEmoji: currentRank.emoji,
        income,
        totalExpenses,
        netSavings,
        savingsRate,
        biggestCategory: biggestCategory.category,
        tasksCompleted,
        goalsProgressed,
        coachSteps,
        xpThisMonth,
        streakDays,
        resultMessage: resultMessage.text,
      });
    }
  }, [user, monthKey, savedSummaries, currentScore, peakDelta, currentRank, income, totalExpenses, netSavings, savingsRate, biggestCategory, tasksCompleted, goalsProgressed, coachSteps, xpThisMonth, streakDays, resultMessage, saveSummary]);


  // Progress dots
  const ProgressDots = () => (
    <div className="flex justify-center gap-1.5 py-3">
      {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
        <button
          key={i}
          onClick={() => { setSlideDir(i > slide ? 1 : -1); setSlide(i); }}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i === slide ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );

  // Touch swipe
  const touchStart = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goSlide(diff > 0 ? 1 : -1);
  };

  return (
    <ClientPortalLayout>
      <ScreenHeader title="📈 Monatsreport" backTo="/app/client-portal" />
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Month selector */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => goMonth(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">{monthLabel}</h1>
          <Button variant="ghost" size="icon" onClick={() => goMonth(1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <ProgressDots />

        {/* Slides */}
        <div
          className="relative overflow-hidden min-h-[380px]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence custom={slideDir} mode="wait">
            <motion.div
              key={slide}
              custom={slideDir}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full"
              onAnimationComplete={() => { if (slide === TOTAL_SLIDES - 1) handleSaveIfNeeded(); }}
            >
              {/* SCREEN 1: In Zahlen */}
              {slide === 0 && (
                <Card className="bg-foreground text-background">
                  <CardContent className="p-6 space-y-5">
                    <div className="text-center">
                      <p className="text-[11px] uppercase tracking-widest opacity-50 mb-1">Dein {MONTHS[m - 1]} in Zahlen</p>
                      <Sparkles className="h-8 w-8 mx-auto opacity-30 mb-3" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-background/10 rounded-xl p-4">
                        <div>
                          <p className="text-[11px] opacity-50">PeakScore</p>
                          <p className="text-2xl font-bold">{currentScore} <span className="text-sm opacity-60">Monate</span></p>
                        </div>
                        <div className={cn(
                          "text-lg font-bold flex items-center gap-1",
                          peakDelta > 0 ? "text-green-400" : peakDelta < 0 ? "text-red-400" : "opacity-60"
                        )}>
                          {peakDelta > 0 ? <TrendingUp className="h-5 w-5" /> : peakDelta < 0 ? <TrendingDown className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                          {peakDelta > 0 ? '+' : ''}{peakDelta}
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-background/10 rounded-xl p-4">
                        <div>
                          <p className="text-[11px] opacity-50">Rang</p>
                          <p className="text-xl font-bold">{currentRank.emoji} {currentRank.name}</p>
                        </div>
                        {rankChange !== 'same' && (
                          <span className={cn("text-sm font-medium", rankChange === 'up' ? "text-green-400" : "text-red-400")}>
                            {rankChange === 'up' ? '⬆️ Aufgestiegen' : '⬇️ Abgestiegen'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between bg-background/10 rounded-xl p-4">
                        <div>
                          <p className="text-[11px] opacity-50">Streak</p>
                          <p className="text-xl font-bold">🔥 {streakDays} Tage</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SCREEN 2: Dein Geld */}
              {slide === 1 && (
                <Card>
                  <CardContent className="p-6 space-y-5">
                    <div className="text-center">
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Dein Geld</p>
                      <p className="text-3xl mb-3">💰</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 rounded-xl p-4 text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">Einkommen</p>
                        <p className="text-lg font-bold text-foreground">{fmtCHF(income)}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4 text-center">
                        <p className="text-[10px] text-muted-foreground mb-1">Ausgaben</p>
                        <p className="text-lg font-bold text-foreground">{fmtCHF(totalExpenses)}</p>
                      </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
                      <p className="text-[10px] text-muted-foreground mb-1">Gespart</p>
                      <p className={cn("text-2xl font-bold", netSavings >= 0 ? "text-primary" : "text-destructive")}>
                        {fmtCHF(netSavings)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between bg-muted/50 rounded-xl p-4">
                      <span className="text-sm text-muted-foreground">Sparquote</span>
                      <span className="text-lg font-bold text-foreground">{savingsRate}%</span>
                    </div>

                    {biggestCategory.category && (
                      <div className="flex items-center justify-between bg-muted/50 rounded-xl p-4">
                        <span className="text-sm text-muted-foreground">Grösste Kategorie</span>
                        <span className="text-sm font-bold text-foreground">{biggestCategory.category} ({fmtCHF(biggestCategory.amount)})</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* SCREEN 3: Deine Quests */}
              {slide === 2 && (
                <Card>
                  <CardContent className="p-6 space-y-5">
                    <div className="text-center">
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Deine Quests</p>
                      <p className="text-3xl mb-3">⚔️</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Aufgaben erledigt', value: tasksCompleted, emoji: '✅' },
                        { label: 'Ziele vorangetrieben', value: goalsProgressed, emoji: '🎯' },
                        { label: 'Coach-Schritte', value: coachSteps, emoji: '📚' },
                        { label: 'XP verdient', value: xpThisMonth, emoji: '⚡' },
                      ].map(item => (
                        <div key={item.label} className="bg-muted/50 rounded-xl p-4 text-center">
                          <p className="text-2xl mb-1">{item.emoji}</p>
                          <p className="text-2xl font-bold text-foreground">{item.value}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SCREEN 4: Dein Ergebnis */}
              {slide === 3 && (
                <Card className={cn(
                  "border-2",
                  resultMessage.level === 'gold' ? "border-yellow-500/30 bg-yellow-500/5" :
                  resultMessage.level === 'silver' ? "border-primary/20 bg-primary/5" :
                  resultMessage.level === 'bronze' ? "border-orange-400/20 bg-orange-400/5" :
                  "border-border"
                )}>
                  <CardContent className="p-6 space-y-5">
                    <div className="text-center">
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Dein Ergebnis</p>
                      <p className="text-5xl mb-4">
                        {resultMessage.level === 'gold' ? '🏆' : resultMessage.level === 'silver' ? '💪' : resultMessage.level === 'bronze' ? '📈' : '🎯'}
                      </p>
                    </div>

                    <p className="text-lg font-bold text-foreground text-center leading-relaxed">
                      {resultMessage.text}
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Sparquote</p>
                        <p className="text-base font-bold text-foreground">{savingsRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">XP</p>
                        <p className="text-base font-bold text-foreground">{xpThisMonth}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Quests</p>
                        <p className="text-base font-bold text-foreground">{tasksCompleted}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SCREEN 5: Teilen */}
              {slide === 4 && (
                <div className="space-y-4 text-center">
                  <Card className="bg-muted/50">
                    <CardContent className="p-6 space-y-3">
                      <p className="text-3xl">📤</p>
                      <p className="text-base font-bold text-foreground">Teile deinen Rückblick</p>
                      <p className="text-sm text-muted-foreground">
                        Zeige deinen Freunden, wie dein {MONTHS[m - 1]} war!
                      </p>
                      <Button className="w-full gap-2" onClick={() => setShareOpen(true)}>
                        <Share2 className="h-4 w-4" />
                        Share-Card erstellen
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation arrows */}
        <div className="flex justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goSlide(-1)}
            disabled={slide === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Zurück
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goSlide(1)}
            disabled={slide === TOTAL_SLIDES - 1}
            className="gap-1"
          >
            Weiter <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Previous reports */}
        {savedSummaries.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Vergangene Berichte</p>
            <div className="flex flex-wrap gap-2">
              {savedSummaries.map((s: { month_key: string }) => {
                const [sy, sm] = s.month_key.split('-').map(Number);
                return (
                  <Button
                    key={s.month_key}
                    variant={s.month_key === monthKey ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setCurrentDate(new Date(sy, sm - 1, 1));
                      setSlide(0);
                    }}
                  >
                    {MONTHS[sm - 1].slice(0, 3)} {sy}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Share Card Dialog */}
      <ShareCardGenerator
        open={shareOpen}
        onOpenChange={setShareOpen}
        title={`Mein ${monthLabel}`}
        subtitle="Monatsrückblick"
        stats={[
          { label: 'PeakScore', value: `${currentScore}` },
          { label: 'Sparquote', value: `${savingsRate}%` },
          { label: 'XP', value: `${xpThisMonth}` },
          { label: 'Streak', value: `🔥 ${streakDays}` },
        ]}
        rank={{ emoji: currentRank.emoji, name: currentRank.name }}
        theme="dark"
        format="story"
        fileName={`finlife-rueckblick-${monthKey}`}
        cta="Was ist dein PeakScore?"
      />
    </ClientPortalLayout>
  );
}
