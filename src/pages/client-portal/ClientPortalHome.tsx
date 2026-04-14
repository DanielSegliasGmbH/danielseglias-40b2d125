import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { StrategyPasswordGate } from '@/components/client-portal/StrategyPasswordGate';
import { useGamification, LEVELS } from '@/hooks/useGamification';
import { useNextBestStep } from '@/hooks/useNextBestStep';
import { useCustomerPortalSettings } from '@/hooks/useClientPortal';
import { NotificationBell } from '@/components/client-portal/NotificationBell';
import { Sparkles, Wrench, Target, ArrowRight, Flame, Zap, Star, Trophy, Award, Crown, Landmark, Wallet, ClipboardList, TrendingUp, FileBarChart } from 'lucide-react';

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

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [strategyUnlocked, setStrategyUnlocked] = useState(false);
  const [passwordGateOpen, setPasswordGateOpen] = useState(false);

  const {
    points, streakDays, level, levelLabel,
    progressPercent, pointsToNext, nextLevelMin, maxLevel,
    lastAwardedPoints, loading: gamLoading,
  } = useGamification();

  const { data: nextStepResult } = useNextBestStep();
  const firstName = user?.user_metadata?.first_name || 'Kunde';

  useEffect(() => {
    const done = localStorage.getItem('client_onboarding_complete');
    if (!done) setShowOnboarding(true);
  }, []);

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

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={() => {
          localStorage.setItem('client_onboarding_complete', 'true');
          setShowOnboarding(false);
        }}
      />
    );
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
    { icon: Target, label: 'Ziele', path: '/app/client-portal/goals', emoji: '🎯' },
  ];

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── 1. HEADER ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              {getGreeting(firstName)}
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-foreground mt-0.5">
              {firstName}
            </h1>
          </div>
          <NotificationBell />
        </div>

        {/* ── 2. LEVEL & STREAK BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card
            className="bg-foreground text-background overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
            onClick={() => navigate('/app/client-portal/premium')}
          >
            <CardContent className="p-5 relative">
              {/* XP popup */}
              <AnimatePresence>
                {lastAwardedPoints !== null && (
                  <motion.div
                    key={lastAwardedPoints.id}
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -24 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
                  >
                    <span className="text-sm font-bold text-primary-foreground">
                      +{lastAwardedPoints.amount} XP
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4" />
                  Level {level} · {levelLabel}
                </span>
                <span className="font-mono text-xs opacity-80">
                  {points} / {maxLevel ? points : nextLevelMin}
                </span>
              </div>
              <div className="w-full h-2 bg-background/15 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={false}
                  animate={{ width: `${maxLevel ? 100 : progressPercent}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between text-xs mt-2 opacity-70">
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" />
                  {streakDays} {streakDays === 1 ? 'Tag' : 'Tage'}
                </span>
                {!maxLevel && <span>{pointsToNext} XP bis nächstes Level</span>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── 3. FINANZ-COCKPIT ── */}
        <div
          className="flex gap-3 overflow-x-auto pb-1 snap-x"
          style={{ scrollbarWidth: 'none' }}
        >
          {cockpitCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              className="snap-start"
            >
              <Link to={card.path}>
                <div className={cn(
                  "min-w-[150px] p-4 rounded-2xl transition-shadow hover:shadow-md",
                  card.highlight
                    ? "bg-foreground text-background"
                    : "bg-card border border-border"
                )}>
                  <span className={cn(
                    "text-[11px]",
                    card.highlight ? "opacity-70" : "text-muted-foreground"
                  )}>
                    {card.label}
                  </span>
                  <span className="text-lg font-semibold block mt-1 tracking-tight">
                    {card.value}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── 4. NÄCHSTE QUEST ── */}
        {nextStepResult?.primary && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              className="bg-primary text-primary-foreground cursor-pointer active:scale-[0.98] transition-transform hover:shadow-lg"
              onClick={() => navigate(nextStepResult.primary!.path)}
            >
              <CardContent className="p-5 flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase tracking-wider opacity-80 mb-1">
                    Nächste Quest
                  </p>
                  <h3 className="text-base font-bold">
                    {nextStepResult.primary.title}
                  </h3>
                  <p className="text-sm opacity-80 mt-0.5 line-clamp-1">
                    {nextStepResult.primary.reason}
                  </p>
                </div>
                <div className="size-10 bg-primary-foreground/20 rounded-full grid place-content-center shrink-0 ml-3">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── 5. SCHNELLZUGRIFF ── */}
        <div className="grid grid-cols-4 gap-2.5">
          {quickAccess.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.04 }}
            >
              <Link to={item.path}>
                <div className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-1 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.96]">
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground">{item.label}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── 6. LETZTE AKTIVITÄT ── */}
        {recentActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold mb-3 text-foreground">Letzte Aktivität</h4>
                <div className="flex flex-col gap-2.5">
                  {recentActions.map((a: any) => (
                    <div key={a.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {ACTION_LABELS[a.action_type] || a.action_type}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          +{a.points_awarded} XP
                        </p>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {timeAgo(a.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── 7. MONATSBERICHT LINK ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Link to="/app/client-portal/monthly-report">
            <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-primary/10 grid place-content-center">
                    <FileBarChart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Mein Monatsbericht</p>
                    <p className="text-[11px] text-muted-foreground">Deine persönliche Monatsübersicht</p>
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
    </ClientPortalLayout>
  );
}
