import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type ActionType =
  | 'daily_login'
  | 'tool_used'
  | 'coach_module_completed'
  | 'video_watched'
  | 'profile_completed';

const POINTS_MAP: Record<ActionType, number> = {
  daily_login: 5,
  tool_used: 10,
  coach_module_completed: 25,
  video_watched: 15,
  profile_completed: 20,
};

const LEVELS = [
  { level: 1, min: 100, max: 199, label: 'Starter' },
  { level: 2, min: 200, max: 349, label: 'Explorer' },
  { level: 3, min: 350, max: 549, label: 'Achiever' },
  { level: 4, min: 550, max: 799, label: 'Expert' },
  { level: 5, min: 800, max: 1000, label: 'Master' },
];

export function getLevel(points: number) {
  const lvl = LEVELS.find(l => points >= l.min && points <= l.max) || LEVELS[0];
  const nextLvl = LEVELS.find(l => l.level === lvl.level + 1);
  const progressInLevel = points - lvl.min;
  const levelRange = lvl.max - lvl.min + 1;
  const progressPercent = Math.min(100, Math.round((progressInLevel / levelRange) * 100));
  return { ...lvl, nextLevel: nextLvl, progressPercent, pointsToNext: nextLvl ? nextLvl.min - points : 0 };
}

// ─── Motivational messages by action type ────────────────────────

const ACTION_MESSAGES: Record<ActionType, string[]> = {
  daily_login: [
    'Willkommen zurück! Dein Einsatz zählt ✨',
    'Schön, dass du da bist – weiter so 💪',
    'Gute Gewohnheit! Jeder Tag bringt dich weiter 🎯',
  ],
  tool_used: [
    'Gute Entscheidung – Wissen ist Macht 🧠',
    'Stark! Du nimmst deine Finanzen in die Hand 💪',
    'Super – jedes Tool bringt dir mehr Klarheit ✨',
    'Gut gemacht! Du bist auf dem richtigen Weg 🎯',
  ],
  coach_module_completed: [
    'Beeindruckend! Du wächst über dich hinaus 🚀',
    'Ein Modul mehr – ein grosser Schritt für dich 🏆',
    'Stark! Du baust dein finanzielles Fundament auf 💎',
  ],
  video_watched: [
    'Wissen aufgebaut – gut investierte Zeit 📚',
    'Je mehr du lernst, desto sicherer wirst du ✨',
    'Weiter so – Verstehen ist der erste Schritt 🎯',
  ],
  profile_completed: [
    'Perfekt! Dein Profil ist jetzt komplett 🎉',
    'Super – wir kennen dich jetzt besser ✨',
  ],
};

const LEVEL_UP_MESSAGES = [
  'Du bist aufgestiegen! Dein Einsatz zahlt sich aus 🏆',
  'Neues Level erreicht – beeindruckend! 🎉',
  'Level up! Du gehörst zur Elite 💎',
];

function getActionMessage(actionType: ActionType): string {
  const messages = ACTION_MESSAGES[actionType];
  return messages[Math.floor(Math.random() * messages.length)];
}

function getLevelUpMessage(): string {
  return LEVEL_UP_MESSAGES[Math.floor(Math.random() * LEVEL_UP_MESSAGES.length)];
}

// Helper: get date string in local timezone
function getLocalDateStr(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Check if two date strings are consecutive days
function isConsecutiveDay(prev: string, current: string): boolean {
  const prevDate = new Date(prev + 'T12:00:00');
  const currDate = new Date(current + 'T12:00:00');
  const diffMs = currDate.getTime() - prevDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

function isSameDay(a: string, b: string): boolean {
  return a === b;
}

export function useGamification() {
  const { user } = useAuth();
  const [points, setPoints] = useState(100);
  const [streakDays, setStreakDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastAwardedPoints, setLastAwardedPoints] = useState<number | null>(null);
  const prevLevelRef = useRef<number>(1);
  const pointsRef = useRef(100);
  const initializedRef = useRef(false);

  // Clear the animated points indicator after a delay
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

        // Daily login check
        if (data.last_daily_login !== today) {
          await handleDailyLogin(data, today);
        }
      } else {
        // Create initial record with streak 1
        const { error: insertErr } = await supabase
          .from('user_gamification')
          .insert({ user_id: user.id, points: 100, streak_days: 1, last_daily_login: today });

        if (insertErr && !insertErr.message.includes('duplicate')) {
          console.error('Gamification init error:', insertErr);
        }

        setStreakDays(1);

        // Award first daily login
        await awardPointsInternal('daily_login', today, 100, false);

        // Welcome streak toast
        setTimeout(() => {
          toast('🔥 Tag 1 – Dein Streak beginnt!', {
            description: 'Komm morgen wieder und baue deinen Streak aus.',
            duration: 3500,
          });
        }, 1200);
      }

      initializedRef.current = true;
      setLoading(false);
    };

    init();
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

    // Award daily login points (+5)
    const awarded = await awardPointsInternal('daily_login', today, data.points, false);

    // Calculate streak bonus
    let streakBonus = 0;
    let streakBonusMessage = '';

    if (newStreak > 0 && newStreak % 7 === 0) {
      streakBonus = 25;
      streakBonusMessage = `🎉 7-Tage-Streak! +25 Bonuspunkte`;
    } else if (newStreak > 0 && newStreak % 3 === 0) {
      streakBonus = 10;
      streakBonusMessage = `🔥 3-Tage-Streak! +10 Bonuspunkte`;
    }

    // Apply streak bonus
    let currentPts = awarded ? Math.min(1000, data.points + 5) : data.points;
    if (streakBonus > 0) {
      const bonusRef = `streak_bonus_${today}_${newStreak}`;
      const { error: bonusErr } = await supabase
        .from('gamification_actions')
        .insert({
          user_id: user.id,
          action_type: 'daily_login',
          action_ref: bonusRef,
          points_awarded: streakBonus,
        });

      if (!bonusErr) {
        currentPts = Math.min(1000, currentPts + streakBonus);
      }
    }

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

    // Show streak toasts with emotional messages
    if (streakBroken) {
      toast('Neustart – heute beginnt dein neuer Lauf 💪', {
        description: 'Jeder Neuanfang ist ein Zeichen von Stärke. Ab heute zählt wieder jeder Tag!',
        duration: 3500,
      });
    } else if (awarded && newStreak > 1) {
      const daysToNext3 = 3 - (newStreak % 3);
      const daysToNext7 = 7 - (newStreak % 7);
      let hint = '';
      if (daysToNext7 === 1 || daysToNext3 === 1) {
        hint = 'Noch 1 Tag bis zum nächsten Bonus!';
      }

      toast(`🔥 ${newStreak} Tage in Folge – stark!`, {
        description: `+5 Punkte${hint ? ` · ${hint}` : ''} · Du bleibst dran, das macht den Unterschied.`,
        duration: 3000,
      });
    }

    // Streak bonus toast (delayed)
    if (streakBonusMessage) {
      setTimeout(() => {
        toast.success(streakBonusMessage, {
          description: `${newStreak} Tage Disziplin – das ist echte Stärke.`,
          duration: 4000,
        });
      }, 1500);
    }

    // Check level up
    const oldLevel = getLevel(data.points).level;
    const newLevel = getLevel(currentPts).level;
    if (newLevel > oldLevel) {
      setTimeout(() => {
        toast.success(`🏆 Level ${newLevel} – ${getLevel(currentPts).label}`, {
          description: getLevelUpMessage(),
          duration: 5000,
        });
      }, streakBonusMessage ? 3000 : 1500);
    }
  };

  const awardPointsInternal = async (
    actionType: ActionType,
    actionRef: string,
    currentPoints: number,
    showToast: boolean = true
  ): Promise<boolean> => {
    if (!user) return false;

    const pointsToAdd = POINTS_MAP[actionType];
    const newPoints = Math.min(1000, currentPoints + pointsToAdd);

    const { error: actionErr } = await supabase
      .from('gamification_actions')
      .insert({
        user_id: user.id,
        action_type: actionType,
        action_ref: actionRef,
        points_awarded: pointsToAdd,
      });

    if (actionErr) {
      if (actionErr.message.includes('duplicate') || actionErr.message.includes('unique')) {
        return false;
      }
      console.error('Action insert error:', actionErr);
      return false;
    }

    // Update points (for non-daily-login, also update the DB row)
    if (actionType !== 'daily_login') {
      const updateData: any = { points: newPoints, updated_at: new Date().toISOString() };
      if (actionType === 'profile_completed') {
        updateData.profile_completed_bonus = true;
      }
      await supabase
        .from('user_gamification')
        .update(updateData)
        .eq('user_id', user.id);
    }

    const oldLevel = getLevel(currentPoints).level;
    const newLevel = getLevel(newPoints).level;

    setPoints(newPoints);
    pointsRef.current = newPoints;

    if (showToast) {
      // Set animated points indicator
      setLastAwardedPoints(pointsToAdd);

      toast(`+${pointsToAdd} Punkte`, {
        description: getActionMessage(actionType),
        duration: 2500,
      });

      if (newLevel > oldLevel) {
        setTimeout(() => {
          toast.success(`🏆 Level ${newLevel} – ${getLevel(newPoints).label}`, {
            description: getLevelUpMessage(),
            duration: 5000,
          });
        }, 800);
      }
    }

    prevLevelRef.current = newLevel;
    return true;
  };

  const awardPoints = useCallback(
    async (actionType: ActionType, actionRef: string = '') => {
      if (!user || !initializedRef.current) return false;

      const ref = actionType === 'daily_login'
        ? getLocalDateStr()
        : actionRef;

      return awardPointsInternal(actionType, ref, pointsRef.current);
    },
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
    maxLevel: levelInfo.level === 5,
    awardPoints,
    lastAwardedPoints,
    loading,
  };
}
