import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { DailyFocusCard } from '@/components/client-portal/DailyFocusCard';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { StrategyPasswordGate } from '@/components/client-portal/StrategyPasswordGate';
import { useGamification, LEVELS } from '@/hooks/useGamification';
import { useNextBestStep } from '@/hooks/useNextBestStep';
import { useCustomerPortalSettings } from '@/hooks/useClientPortal';
import { NotificationBell } from '@/components/client-portal/NotificationBell';
import { Sparkles, Wrench, Target, ArrowRight, Flame, Zap, Star, Trophy, Award, Crown, Landmark, Wallet, ClipboardList, TrendingUp, FileBarChart, Gift, Film, UserRound, Camera, CalendarDays, Heart } from 'lucide-react';
import { PrivateValue } from '@/components/client-portal/PrivateValue';
import { ActiveChallengeCards } from '@/components/client-portal/ActiveChallengeCard';
import { WeeklyOverviewCard } from '@/components/client-portal/WeeklyOverviewCard';
import { useFinanzType } from '@/hooks/useFinanzType';
import { QuickActionFAB } from '@/components/client-portal/QuickActionFAB';
import { WeeklyCheckCard } from '@/components/client-portal/WeeklyCheckCard';
import { MorningBriefCard } from '@/components/client-portal/MorningBriefCard';
import { SundayReflectionCard } from '@/components/client-portal/SundayReflectionCard';
import { MoodCheckinCard } from '@/components/client-portal/MoodCheckinCard';
import { InflationTickerCard } from '@/components/client-portal/InflationTickerCard';
import { PeakScoreCard } from '@/components/client-portal/PeakScoreCard';
import { SuccessStoryRotator } from '@/components/client-portal/SuccessStoryRotator';
import { ShadowTwinCard } from '@/components/client-portal/ShadowTwinCard';
import { LastPlanDashboardCard } from '@/components/client-portal/LastPlanDashboardCard';
import { ProfessionDashboardTips } from '@/components/client-portal/ProfessionDashboardTips';
import { JourneyDashboardWidget } from '@/components/client-portal/JourneyDashboardWidget';
import { JourneyNudgeCard } from '@/components/client-portal/JourneyNudgeCard';
import { RankWarningBanner } from '@/components/client-portal/RankWarningBanner';
import { RankChangeOverlay } from '@/components/client-portal/RankChangeOverlay';
import { useRankSystem } from '@/hooks/useRankSystem';
import { usePeakScore } from '@/hooks/usePeakScore';
import { FreedomCountdown } from '@/components/client-portal/FreedomCountdown';
import { LifeMapCard } from '@/components/client-portal/LifeMapCard';
import { useUserAvatar } from '@/hooks/useUserAvatar';

const LEVEL_ICONS = [null, Zap, Star, Trophy, Award, Crown];

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Guten Morgen`;
  if (hour < 17) return `Hallo`;
  return `Guten Abend`;
}

function getMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function ClientPortalHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: settings } = useCustomerPortalSettings();

  const [strategyUnlocked, setStrategyUnlocked] = useState(false);
  const [passwordGateOpen, setPasswordGateOpen] = useState(false);

  const {
    points, streakDays, level, levelLabel,
    progressPercent, pointsToNext, nextLevelMin, maxLevel,
    lastAwardedPoints, loading: gamLoading,
  } = useGamification();

  const { data: nextStepResult } = useNextBestStep();
  const { rankChange, dismissRankChange } = useRankSystem();
  const { score, rank: peakRank } = usePeakScore();
  const { completed: finanzTypCompleted, info: finanzTypInfo } = useFinanzType();
  const firstName = user?.user_metadata?.first_name || 'Kunde';
  const { futureSelfName, completed: avatarCompleted } = useUserAvatar();

  // First-visit gating: hide overload-cards for first 7 days
  const isFirstWeek = useMemo(() => {
    const createdAt = (user as any)?.created_at;
    if (!createdAt) return false;
    const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return days < 7;
  }, [user]);

  const { data: lifeFilmData } = useQuery({
    queryKey: ['life-film-status', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('life_film_data')
        .select('completed, monthly_income, monthly_expenses, total_savings, age, target_retirement_age')
        .eq('user_id', user.id)
        .eq('completed', true)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const lifeFilmCompleted = !!lifeFilmData;

  // Compute potential difference for completed film summary
  const lifeFilmDifference = useMemo(() => {
    if (!lifeFilmData) return 0;
    const { monthly_income, monthly_expenses, total_savings, age, target_retirement_age } = lifeFilmData;
    const years = (target_retirement_age || 65) - (age || 30);
    const monthlySavings = (monthly_income || 0) - (monthly_expenses || 0);
    const discretionaryReduction = (monthly_expenses || 0) * 0.4 * 0.2;
    const additionalSavings = (monthly_income || 0) * 0.1;
    const extra3a = 7258 / 12;
    const extraKK = 600 / 12;
    const optimizedSavings = monthlySavings + discretionaryReduction + additionalSavings + extra3a + extraKK;
    const currentWealth = (total_savings || 0) * Math.pow(1.04, years) +
      Math.max(0, monthlySavings) * 12 * ((Math.pow(1.04, years) - 1) / 0.04);
    const optimizedWealth = (total_savings || 0) * Math.pow(1.05, years) +
      Math.max(0, optimizedSavings) * 12 * ((Math.pow(1.05, years) - 1) / 0.05);
    return Math.max(0, Math.round(optimizedWealth - currentWealth));
  }, [lifeFilmData]);

  // ── Data queries for cockpit cards ──
  const { data: assets = [] } = useQuery({
    queryKey: ['net-worth-assets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('net_worth_assets').select('value').eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: liabilities = [] } = useQuery({
    queryKey: ['net-worth-liabilities', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('net_worth_liabilities').select('amount').eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: metaProfile } = useQuery({
    queryKey: ['meta-profile-home', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from('meta_profiles').select('monthly_income').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const monthKey = getMonthKey();

  const { data: monthlyExpenses = 0 } = useQuery({
    queryKey: ['budget-expenses-total', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return 0;
      const startDate = `${monthKey}-01`;
      const [y, m] = monthKey.split('-').map(Number);
      const endDate = new Date(y, m, 0).toISOString().slice(0, 10);
      const { data } = await supabase
        .from('budget_expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('expense_date', startDate)
        .lte('expense_date', endDate);
      return (data || []).reduce((s: number, e: any) => s + Number(e.amount), 0);
    },
    enabled: !!user,
  });

  const { data: openTasks = 0 } = useQuery({
    queryKey: ['open-tasks-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from('client_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', false);
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: recentActions = [] } = useQuery({
    queryKey: ['recent-gamification', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('gamification_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!user,
  });

  const totalAssets = useMemo(() => assets.reduce((s: number, a: any) => s + Number(a.value), 0), [assets]);
  const totalLiabilities = useMemo(() => liabilities.reduce((s: number, l: any) => s + Number(l.amount), 0), [liabilities]);
  const netWorth = totalAssets - totalLiabilities;
  const monthlyIncome = metaProfile?.monthly_income || 0;
  const budgetRemaining = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round((budgetRemaining / monthlyIncome) * 100) : 0;

  const fmtCHF = (v: number) => `CHF ${v.toLocaleString('de-CH')}`;

  const Icon = LEVEL_ICONS[level] || Zap;
  const currentLevelMin = LEVELS.find(l => l.level === level)?.min || 0;

  const ACTION_LABELS: Record<string, string> = {
    daily_login: 'App geöffnet',
    task_completed: 'Aufgabe erledigt',
    goal_added: 'Neues Ziel gesetzt',
    coach_module_completed: 'Coach-Modul abgeschlossen',
    profile_completed: 'Profil vervollständigt',
    insurance_added: 'Versicherung hinzugefügt',
    tool_used: 'Tool verwendet',
    video_watched: 'Video geschaut',
    expense_added: 'Ausgabe erfasst',
    asset_added: 'Vermögenswert hinzugefügt',
    rank_up: 'Rang aufgestiegen 🏅',
  };

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'gerade eben';
    if (mins < 60) return `vor ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `vor ${hours}h`;
    const days = Math.floor(hours / 24);
    return `vor ${days}d`;
  }

  const cockpitCards = [
    {
      label: 'Nettovermögen',
      value: assets.length > 0 || liabilities.length > 0 ? fmtCHF(netWorth) : '–',
      path: '/app/client-portal/net-worth',
      highlight: true,
    },
    {
      label: 'Budget übrig',
      value: monthlyIncome > 0 ? fmtCHF(budgetRemaining) : '–',
      path: '/app/client-portal/budget',
    },
    {
      label: 'Sparquote',
      value: monthlyIncome > 0 ? `${savingsRate}%` : '–',
      path: '/app/client-portal/budget',
    },
    {
      label: 'Offene Aufgaben',
      value: String(openTasks),
      path: '/app/client-portal/tasks',
    },
  ];

  const quickAccess = [
    { icon: Sparkles, label: 'Coach', path: '/app/client-portal/coach', emoji: '✨' },
    { icon: Wrench, label: 'Tools', path: '/app/client-portal/tools', emoji: '🔧' },
    { icon: Wallet, label: 'Budget', path: '/app/client-portal/budget', emoji: '💰' },
    { icon: CalendarDays, label: 'Kalender', path: '/app/client-portal/calendar', emoji: '📅' },
    { icon: Camera, label: 'Snapshot', path: '/app/client-portal/snapshot', emoji: '📸' },
  ];

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-5 overflow-x-hidden w-full">

        {/* ── 1. HEADER ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              {avatarCompleted && futureSelfName
                ? `${futureSelfName} freut sich, dich zu sehen.`
                : getGreeting(firstName)}
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-foreground mt-0.5">
              {firstName}
              {score !== null && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {peakRank.emoji}
                </span>
              )}
            </h1>
          </div>
          <NotificationBell />
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION A — "Jetzt"  (immer sichtbar, max. 4-5 Elemente)
            One thing per moment. Auf einem iPhone ohne Scroll sichtbar.
            ═══════════════════════════════════════════════════════════ */}

        {/* Journey-Nudge (nur wenn aktiv) */}
        <JourneyNudgeCard />

        {/* PeakScore (immer) */}
        <PeakScoreCard onClick={() => navigate('/app/client-portal/peak-score')} />

        {/* DAILY FOCUS — die EINE Aktion für heute */}
        <DailyFocusCard />

        {/* Life Map */}
        <LifeMapCard />

        {/* Quick Access — 4 Icons, keine Labels nötig (mehr Ruhe) */}
        <div className="grid grid-cols-4 gap-2">
          {quickAccess.slice(0, 4).map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.04 }}
            >
              <Link to={item.path} aria-label={item.label}>
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.96] aspect-square">
                  <span className="text-2xl">{item.emoji}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION B — "Meine Welt"  (collapsed, NUR für returning users)
            ═══════════════════════════════════════════════════════════ */}
        {!isFirstWeek && (
          <MoreToDiscover
            isSundayReflection={new Date().getDay() === 0}
            firstOfMonth={new Date().getDate() <= 7}
            lifeFilmCompleted={lifeFilmCompleted}
            lifeFilmDifference={lifeFilmDifference}
            finanzTypCompleted={finanzTypCompleted}
            finanzTypInfo={finanzTypInfo}
            cockpitCards={cockpitCards}
            recentActions={recentActions}
            actionLabels={ACTION_LABELS}
            timeAgo={timeAgo}
            level={level}
            levelLabel={levelLabel}
            points={points}
            nextLevelMin={nextLevelMin}
            maxLevel={maxLevel}
            progressPercent={progressPercent}
            pointsToNext={pointsToNext}
            streakDays={streakDays}
            lastAwardedPoints={lastAwardedPoints}
            LevelIcon={Icon}
            nextStepResult={nextStepResult}
            navigate={navigate}
          />
        )}

        {/* ── 8. REFERRAL TEASER ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Link to="/app/client-portal/invite">
            <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-primary/10 grid place-content-center">
                    <Gift className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Freunde einladen = +500 XP pro Freund 🎁</p>
                    <p className="text-[11px] text-muted-foreground">Teile deinen Code und sammle Bonus-XP</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>

      <StrategyPasswordGate
        open={passwordGateOpen}
        onOpenChange={setPasswordGateOpen}
        onSuccess={() => {
          setStrategyUnlocked(true);
          setPasswordGateOpen(false);
          navigate('/app/client-portal/strategies');
        }}
      />
      <QuickActionFAB />
      <RankChangeOverlay event={rankChange} onDismiss={dismissRankChange} />
    </ClientPortalLayout>
  );
}
