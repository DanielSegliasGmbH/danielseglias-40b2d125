import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type ActionType =
  | 'daily_login'
  | 'task_completed'
  | 'goal_added'
  | 'coach_module_completed'
  | 'profile_completed'
  | 'insurance_added'
  | 'tool_used'
  | 'video_watched'
  | 'expense_added'
  | 'asset_added'
  | 'life_film_completed';

const POINTS_MAP: Record<ActionType, number> = {
  daily_login: 20,
  task_completed: 50,
  goal_added: 30,
  coach_module_completed: 100,
  profile_completed: 200,
  insurance_added: 40,
  tool_used: 10,
  video_watched: 15,
  expense_added: 10,
  asset_added: 25,
  life_film_completed: 150,
};

export const LEVELS = [
  { level: 1, min: 0, max: 200, label: 'Finanz-Einsteiger' },
  { level: 2, min: 201, max: 500, label: 'Finanz-Lehrling' },
  { level: 3, min: 501, max: 1000, label: 'Finanz-Profi' },
  { level: 4, min: 1001, max: 2000, label: 'Finanz-Experte' },
  { level: 5, min: 2001, max: 999999, label: 'Finanz-Meister' },
];

export function getLevel(points: number) {
  const lvl = LEVELS.find(l => points >= l.min && points <= l.max) || LEVELS[0];
  const nextLvl = LEVELS.find(l => l.level === lvl.level + 1);
  const progressInLevel = points - lvl.min;
  const levelRange = lvl.max - lvl.min + 1;
  const progressPercent = nextLvl
    ? Math.min(100, Math.round((progressInLevel / (nextLvl.min - lvl.min)) * 100))
    : 100;
  return {
    ...lvl,
    nextLevel: nextLvl,
    progressPercent,
    pointsToNext: nextLvl ? nextLvl.min - points : 0,
  };
}

// ─── Motivational messages ────────────────────────

const ACTION_MESSAGES: Partial<Record<ActionType, string[]>> = {
  task_completed: [
    'Erledigt! Du packst es an 💪',
    'Stark – Aufgabe abgehakt ✅',
    'Weiter so, du bist auf Kurs 🎯',
  ],
  goal_added: [
    'Neues Ziel gesetzt – der erste Schritt 🎯',
    'Gut, klare Ziele führen zum Erfolg 💎',
  ],
  coach_module_completed: [
    'Beeindruckend! Du wächst über dich hinaus 🚀',
    'Ein Modul mehr – ein grosser Schritt 🏆',
  ],
  profile_completed: [
    'Perfekt! Dein Profil ist jetzt komplett 🎉',
    'Super – wir können dich nun optimal beraten ✨',
  ],
  insurance_added: [
    'Versicherung erfasst – gut organisiert 🛡️',
    'Top, dein Überblick wird immer besser 📋',
  ],
  tool_used: [
    'Gute Entscheidung – Wissen ist Macht 🧠',
    'Jedes Tool bringt dir mehr Klarheit ✨',
  ],
  expense_added: [
    'Ausgabe erfasst – Überblick behalten 📊',
    'Gut getrackt – so behältst du die Kontrolle 💪',
  ],
  asset_added: [
    'Vermögenswert erfasst – dein Überblick wächst 📊',
    'Super, dein Vermögensbild wird klarer 💎',
  ],
};

const LEVEL_UP_MESSAGES = [
  'Du bist aufgestiegen! Dein Einsatz zahlt sich aus 🏆',
  'Neues Level erreicht – beeindruckend! 🎉',
  'Level up! Du gehörst zur Elite 💎',
];

const STREAK_MILESTONE_MESSAGES: Record<number, string> = {
  7: '🎉 Eine ganze Woche dran geblieben – Chapeau!',
  14: '🏅 2 Wochen am Stück – du bist unaufhaltbar!',
  30: '🏆 30-Tage-Streak! Absolute Weltklasse!',
};

function getActionMessage(actionType: ActionType): string {
  const messages = ACTION_MESSAGES[actionType] || ['Gute Arbeit! Weiter so ✨'];
  return messages[Math.floor(Math.random() * messages.length)];
}

function getLevelUpMessage(): string {
  return LEVEL_UP_MESSAGES[Math.floor(Math.random() * LEVEL_UP_MESSAGES.length)];
}

function getLocalDateStr(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isConsecutiveDay(prev: string, current: string): boolean {
  const prevDate = new Date(prev + 'T12:00:00');
  const currDate = new Date(current + 'T12:00:00');
  const diffMs = currDate.getTime() - prevDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) === 1;
}

function isSameDay(a: string, b: string): boolean {
  return a === b;
}

// Event emitter for level-up celebrations
type LevelUpListener = (newLevel: number, label: string) => void;
const levelUpListeners: LevelUpListener[] = [];

export function onLevelUp(listener: LevelUpListener) {
  levelUpListeners.push(listener);
  return () => {
    const idx = levelUpListeners.indexOf(listener);
    if (idx > -1) levelUpListeners.splice(idx, 1);
  };
}

function emitLevelUp(level: number, label: string) {
  levelUpListeners.forEach(fn => fn(level, label));
}

export function useGamification() {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastAwardedPoints, setLastAwardedPoints] = useState<{ amount: number; id: number } | null>(null);
  const prevLevelRef = useRef<number>(1);
  const pointsRef = useRef(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (lastAwardedPoints !== null) {
      const timer = setTimeout(() => setLastAwardedPoints(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastAwardedPoints]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const init = async () => {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Gamification load error:', error);
        setLoading(false);
        return;
      }

      const today = getLocalDateStr();

      if (data) {
        setPoints(data.points);
        pointsRef.current = data.points;
        setStreakDays(data.streak_days || 0);
        prevLevelRef.current = getLevel(data.points).level;

        if (data.last_daily_login !== today) {
          await handleDailyLogin(data, today);
        }
      } else {
        const startingPoints = POINTS_MAP.daily_login; // 20
        const { error: insertErr } = await supabase
          .from('user_gamification')
          .insert({ user_id: user.id, points: startingPoints, streak_days: 1, last_daily_login: today });

        if (insertErr && !insertErr.message.includes('duplicate')) {
          console.error('Gamification init error:', insertErr);
        }

        setPoints(startingPoints);
        pointsRef.current = startingPoints;
        setStreakDays(1);

        await supabase.from('gamification_actions').insert({
          user_id: user.id,
          action_type: 'daily_login',
          action_ref: today,
          points_awarded: POINTS_MAP.daily_login,
        });

        setTimeout(() => {
          toast('🔥 Tag 1 – Dein Streak beginnt!', {
            description: 'Komm morgen wieder und baue deinen Streak aus.',
          });
        }, 1200);
      }

      initializedRef.current = true;
      setLoading(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleDailyLogin = async (data: any, today: string) => {
    if (!user) return;

    const lastLogin = data.last_daily_login;
    let newStreak: number;
    let streakBroken = false;

    if (lastLogin && isConsecutiveDay(lastLogin, today)) {
      newStreak = (data.streak_days || 0) + 1;
    } else if (lastLogin && isSameDay(lastLogin, today)) {
      return;
    } else {
      newStreak = 1;
      streakBroken = data.streak_days > 1;
    }

    // Award daily login XP
    const loginPoints = POINTS_MAP.daily_login;
    await supabase.from('gamification_actions').insert({
      user_id: user.id,
      action_type: 'daily_login',
      action_ref: today,
      points_awarded: loginPoints,
    });

    let currentPts = data.points + loginPoints;

    // Check streak milestone bonus
    const milestoneMsg = STREAK_MILESTONE_MESSAGES[newStreak];

    // Update gamification record
    await supabase
      .from('user_gamification')
      .update({
        points: currentPts,
        streak_days: newStreak,
        last_daily_login: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    setPoints(currentPts);
    pointsRef.current = currentPts;
    setStreakDays(newStreak);

    // Toasts
    if (streakBroken) {
      toast('Neustart – heute beginnt dein neuer Lauf 💪', {
        description: 'Ab heute zählt wieder jeder Tag!',
      });
    } else if (newStreak > 1) {
      toast(`🔥 ${newStreak} Tage in Folge!`, {
        description: `+${loginPoints} XP · Du bleibst dran!`,
      });
    }

    if (milestoneMsg) {
      setTimeout(() => {
        toast.success(milestoneMsg, {
          description: `${newStreak} Tage Disziplin – das ist echte Stärke.`,
        });
      }, 1500);
    }

    // Level up check
    const oldLevel = getLevel(data.points).level;
    const newLevelInfo = getLevel(currentPts);
    if (newLevelInfo.level > oldLevel) {
      emitLevelUp(newLevelInfo.level, newLevelInfo.label);
    }
    prevLevelRef.current = newLevelInfo.level;
  };

  const awardPoints = useCallback(
    async (actionType: ActionType, actionRef: string = '') => {
      if (!user || !initializedRef.current) return false;

      const ref = actionType === 'daily_login' ? getLocalDateStr() : actionRef || `${actionType}_${Date.now()}`;
      const pointsToAdd = POINTS_MAP[actionType];
      const currentPoints = pointsRef.current;
      const newPoints = currentPoints + pointsToAdd;

      // One-time check for profile_completed
      if (actionType === 'profile_completed') {
        const { data: gam } = await supabase
          .from('user_gamification')
          .select('profile_completed_bonus')
          .eq('user_id', user.id)
          .maybeSingle();
        if (gam?.profile_completed_bonus) return false;
      }

      const { error: actionErr } = await supabase
        .from('gamification_actions')
        .insert({
          user_id: user.id,
          action_type: actionType,
          action_ref: ref,
          points_awarded: pointsToAdd,
        });

      if (actionErr) {
        if (actionErr.message.includes('duplicate') || actionErr.message.includes('unique')) {
          return false;
        }
        console.error('Action insert error:', actionErr);
        return false;
      }

      const updateData: any = { points: newPoints, updated_at: new Date().toISOString() };
      if (actionType === 'profile_completed') {
        updateData.profile_completed_bonus = true;
      }
      await supabase
        .from('user_gamification')
        .update(updateData)
        .eq('user_id', user.id);

      const oldLevel = getLevel(currentPoints).level;
      const newLevelInfo = getLevel(newPoints);

      setPoints(newPoints);
      pointsRef.current = newPoints;
      setLastAwardedPoints({ amount: pointsToAdd, id: Date.now() });

      toast(`+${pointsToAdd} XP`, {
        description: getActionMessage(actionType),
      });

      if (newLevelInfo.level > oldLevel) {
        emitLevelUp(newLevelInfo.level, newLevelInfo.label);
      }

      prevLevelRef.current = newLevelInfo.level;
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  const levelInfo = getLevel(points);

  return {
    points,
    streakDays,
    level: levelInfo.level,
    levelLabel: levelInfo.label,
    progressPercent: levelInfo.progressPercent,
    pointsToNext: levelInfo.pointsToNext,
    nextLevelMin: levelInfo.nextLevel?.min ?? null,
    maxLevel: levelInfo.level === 5,
    awardPoints,
    lastAwardedPoints,
    loading,
  };
}
