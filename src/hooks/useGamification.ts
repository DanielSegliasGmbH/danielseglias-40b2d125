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

const MOTIVATIONAL_MESSAGES = [
  'Nice! Du machst Fortschritt 💪',
  'Weiter so! Jeder Schritt zählt ✨',
  'Super! Du bist auf dem richtigen Weg 🎯',
  'Stark! Dein Einsatz zahlt sich aus 🚀',
];

function randomMotivation() {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
}

export function useGamification() {
  const { user } = useAuth();
  const [points, setPoints] = useState(100);
  const [loading, setLoading] = useState(true);
  const prevLevelRef = useRef<number>(1);
  const initializedRef = useRef(false);

  // Load or initialize gamification data
  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const init = async () => {
      // Try to load existing data
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

      if (data) {
        setPoints(data.points);
        prevLevelRef.current = getLevel(data.points).level;

        // Check daily login bonus
        const today = new Date().toISOString().split('T')[0];
        if (data.last_daily_login !== today) {
          await awardPointsInternal('daily_login', today, data.points);
        }
      } else {
        // Create initial record
        const { error: insertErr } = await supabase
          .from('user_gamification')
          .insert({ user_id: user.id, points: 100 });

        if (insertErr && !insertErr.message.includes('duplicate')) {
          console.error('Gamification init error:', insertErr);
        }

        // Award daily login for first visit
        const today = new Date().toISOString().split('T')[0];
        await awardPointsInternal('daily_login', today, 100);
      }

      initializedRef.current = true;
      setLoading(false);
    };

    init();
  }, [user?.id]);

  const awardPointsInternal = async (
    actionType: ActionType,
    actionRef: string,
    currentPoints: number
  ): Promise<boolean> => {
    if (!user) return false;

    const pointsToAdd = POINTS_MAP[actionType];
    const newPoints = Math.min(1000, currentPoints + pointsToAdd);

    // Try to insert action (unique constraint prevents dupes)
    const { error: actionErr } = await supabase
      .from('gamification_actions')
      .insert({
        user_id: user.id,
        action_type: actionType,
        action_ref: actionRef,
        points_awarded: pointsToAdd,
      });

    if (actionErr) {
      // Duplicate = already awarded
      if (actionErr.message.includes('duplicate') || actionErr.message.includes('unique')) {
        return false;
      }
      console.error('Action insert error:', actionErr);
      return false;
    }

    // Update points
    const updateData: any = { points: newPoints, updated_at: new Date().toISOString() };
    if (actionType === 'daily_login') {
      updateData.last_daily_login = actionRef;
    }
    if (actionType === 'profile_completed') {
      updateData.profile_completed_bonus = true;
    }

    await supabase
      .from('user_gamification')
      .update(updateData)
      .eq('user_id', user.id);

    const oldLevel = getLevel(currentPoints).level;
    const newLevel = getLevel(newPoints).level;

    setPoints(newPoints);

    // Show feedback
    toast(`+${pointsToAdd} Punkte`, {
      description: randomMotivation(),
      duration: 2500,
    });

    // Level up!
    if (newLevel > oldLevel) {
      setTimeout(() => {
        toast.success(`🎉 Level ${newLevel} erreicht!`, {
          description: `Du bist ein Level aufgestiegen – ${getLevel(newPoints).label}`,
          duration: 4000,
        });
      }, 800);
    }

    prevLevelRef.current = newLevel;
    return true;
  };

  const awardPoints = useCallback(
    async (actionType: ActionType, actionRef: string = '') => {
      if (!user || !initializedRef.current) return false;

      // For daily_login, use today's date as ref
      const ref = actionType === 'daily_login'
        ? new Date().toISOString().split('T')[0]
        : actionRef;

      return awardPointsInternal(actionType, ref, points);
    },
    [user, points]
  );

  const levelInfo = getLevel(points);

  return {
    points,
    level: levelInfo.level,
    levelLabel: levelInfo.label,
    progressPercent: levelInfo.progressPercent,
    pointsToNext: levelInfo.pointsToNext,
    maxLevel: levelInfo.level === 5,
    awardPoints,
    loading,
  };
}
