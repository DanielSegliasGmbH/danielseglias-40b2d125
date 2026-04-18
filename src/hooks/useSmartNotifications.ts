import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const MONTHS_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

async function upsertNotification(
  userId: string,
  type: string,
  refKey: string,
  title: string,
  body: string,
  linkUrl?: string,
  linkLabel?: string,
) {
  await supabase.from('smart_notifications').upsert(
    {
      user_id: userId,
      notification_type: type,
      ref_key: refKey,
      title,
      body,
      link_url: linkUrl || null,
      link_label: linkLabel || null,
    },
    { onConflict: 'user_id,ref_key', ignoreDuplicates: true }
  );
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getMonthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function useSmartNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const checkAll = useCallback(async () => {
    if (!user) return;
    const uid = user.id;
    const now = new Date();
    const today = todayKey();

    try {
      // 1. DAILY STREAK REMINDER — if after 8pm and no login today
      if (now.getHours() >= 20) {
        const { data: loginToday } = await supabase
          .from('gamification_actions')
          .select('id')
          .eq('user_id', uid)
          .eq('action_type', 'daily_login')
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`)
          .limit(1);

        if (!loginToday?.length) {
          await upsertNotification(
            uid, 'streak_reminder', `streak-${today}`,
            '🔥 Dein Streak wartet!',
            'Öffne die App und sichere deinen Tages-Bonus.',
          );
        }
      }

      // 2. WEEKLY BUDGET CHECK — Monday
      if (now.getDay() === 1) {
        const weekKey = `budget-week-${today}`;
        await upsertNotification(
          uid, 'weekly_budget', weekKey,
          '📊 Neue Woche, neues Budget!',
          'Schau wie du letzte Woche abgeschnitten hast.',
          '/app/client-portal/budget', 'Budget öffnen'
        );
      }

      // 3. TASK DUE DATE REMINDER — 2 days before
      const twoDaysFromNow = new Date(now);
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
      const dueDateStr = twoDaysFromNow.toISOString().slice(0, 10);

      const { data: dueTasks } = await supabase
        .from('client_tasks')
        .select('id, title, due_date')
        .eq('user_id', uid)
        .eq('is_completed', false)
        .eq('due_date', dueDateStr);

      if (dueTasks?.length) {
        for (const task of dueTasks) {
          await upsertNotification(
            uid, 'task_due', `task-due-${task.id}-${dueDateStr}`,
            `⏰ Aufgabe fällig: «${task.title}»`,
            'Noch 2 Tage! Vergiss nicht, diese Aufgabe abzuschliessen.',
            '/app/client-portal/tasks', 'Aufgaben öffnen'
          );
        }
      }

      // 4. GOAL MILESTONES — 25%, 50%, 75%
      const { data: goals } = await supabase
        .from('client_goals')
        .select('id, title, mission_name, current_amount, target_amount')
        .eq('user_id', uid)
        .eq('is_completed', false);

      if (goals?.length) {
        for (const goal of goals) {
          if (!goal.target_amount || goal.target_amount <= 0) continue;
          const pct = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
          const goalLabel = (goal as any).mission_name || goal.title;
          const milestones = [25, 50, 75];
          for (const ms of milestones) {
            if (pct >= ms) {
              await upsertNotification(
                uid, 'goal_milestone', `goal-${goal.id}-${ms}`,
                `🎯 ${ms}% erreicht: «${goalLabel}»`,
                `Du hast ${ms}% deines Ziels erreicht – weiter so!`,
                '/app/client-portal/goals', 'Ziele öffnen'
              );
            }
          }
        }
      }

      // 5. MONTHLY REPORT READY — 1st of month
      if (now.getDate() <= 3) {
        // Notify about previous month's report
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthName = MONTHS_DE[prevMonth.getMonth()];
        const reportKey = `report-${getMonthKey(prevMonth)}`;
        await upsertNotification(
          uid, 'monthly_report', reportKey,
          `📅 Dein ${prevMonthName}-Bericht ist bereit!`,
          'Wie war dein Monat? Schau dir deine persönliche Zusammenfassung an.',
          '/app/client-portal/monthly-report', 'Bericht öffnen'
        );
      }

      // 6. SWISS FINANCIAL CALENDAR DEADLINES
      const calendarDeadlines = [
        { month: 3, day: 31, title: 'Steuererklärung Frist', desc: 'Prüfe die Frist in deinem Kanton.' },
        { month: 11, day: 30, title: 'Krankenkasse wechseln', desc: 'Letzte Möglichkeit für nächstes Jahr.' },
        { month: 12, day: 31, title: 'Säule 3a Einzahlung', desc: 'Letzter Tag für Einzahlungen dieses Jahr.' },
        { month: 12, day: 31, title: 'PK-Einkauf', desc: 'Letzter Tag für Pensionskassen-Einkäufe.' },
      ];

      for (const dl of calendarDeadlines) {
        const target = new Date(now.getFullYear(), dl.month - 1, dl.day);
        if (target < now) continue;
        const daysUntil = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil === 0) {
          await upsertNotification(
            uid, 'calendar_deadline', `cal-${dl.month}-${dl.day}-today-${now.getFullYear()}`,
            `🚨 Heute ist der letzte Tag für: ${dl.title}!`,
            dl.desc,
            '/app/client-portal/calendar', 'Kalender öffnen'
          );
        } else if (daysUntil <= 7) {
          await upsertNotification(
            uid, 'calendar_deadline', `cal-${dl.month}-${dl.day}-7d-${now.getFullYear()}`,
            `⏰ Noch ${daysUntil} Tage: ${dl.title}`,
            dl.desc,
            '/app/client-portal/calendar', 'Kalender öffnen'
          );
        } else if (daysUntil <= 30) {
          await upsertNotification(
            uid, 'calendar_deadline', `cal-${dl.month}-${dl.day}-30d-${now.getFullYear()}`,
            `📅 In ${daysUntil} Tagen: ${dl.title}`,
            dl.desc,
            '/app/client-portal/calendar', 'Kalender öffnen'
          );
        }
      }

      // 7. WEEKLY QUESTS NOTIFICATIONS
      const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon
      const weekYear = `${now.getFullYear()}-W${String(Math.ceil((Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7)).padStart(2, '0')}`;

      if (dayOfWeek === 1) {
        // Monday: new quests notification
        await upsertNotification(
          uid, 'weekly_quests', `wq-new-${weekYear}`,
          '🎮 Neue Wöchentliche Quests!',
          'Diese Woche warten 3 Herausforderungen auf dich.',
          '/app/client-portal/habits', 'Quests ansehen'
        );
      }

      if (dayOfWeek === 0) {
        // Sunday: check incomplete quests
        const { data: weekData } = await supabase
          .from('weekly_challenges')
          .select('challenges, bonus_claimed')
          .eq('user_id', uid)
          .eq('week_key', weekYear)
          .maybeSingle();

        if (weekData && !weekData.bonus_claimed) {
          const challenges = weekData.challenges as { completed: boolean }[];
          const remaining = challenges.filter(c => !c.completed).length;
          if (remaining > 0) {
            await upsertNotification(
              uid, 'weekly_quests', `wq-remind-${weekYear}`,
              `⏰ Noch ${remaining} Quest${remaining > 1 ? 's' : ''} offen bis morgen!`,
              'Schliesse deine Quests ab, bevor die Woche endet.',
              '/app/client-portal/habits', 'Quests öffnen'
            );
          }
        }
      }

      // Check if all quests just completed (bonus)
      {
        const { data: weekData } = await supabase
          .from('weekly_challenges')
          .select('challenges, bonus_claimed')
          .eq('user_id', uid)
          .eq('week_key', weekYear)
          .maybeSingle();

        if (weekData?.bonus_claimed) {
          await upsertNotification(
            uid, 'weekly_quests', `wq-done-${weekYear}`,
            '🏆 Alle Quests erledigt! +50 XP Bonus kassiert!',
            'Weiter so! Nächste Woche warten neue Herausforderungen.',
            '/app/client-portal/habits', 'Ansehen'
          );
        }
      }

      // Refresh the query
      queryClient.invalidateQueries({ queryKey: ['smart-notifications'] });
    } catch (err) {
      console.error('Smart notifications check failed:', err);
    }
  }, [user, queryClient]);

  // Run check on mount and every 30 minutes
  useEffect(() => {
    if (!user) return;
    checkAll();
    const interval = setInterval(checkAll, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, checkAll]);
}

export function useSmartNotificationsList() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['smart-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('smart_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useMarkSmartNotificationRead() {
  const queryClient = useQueryClient();

  return {
    mutate: async (id: string) => {
      await supabase
        .from('smart_notifications')
        .update({ is_read: true })
        .eq('id', id);
      queryClient.invalidateQueries({ queryKey: ['smart-notifications'] });
    },
  };
}

export function useMarkAllSmartNotificationsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return {
    mutate: async () => {
      if (!user) return;
      await supabase
        .from('smart_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      queryClient.invalidateQueries({ queryKey: ['smart-notifications'] });
    },
  };
}

export function useToggleSmartNotificationStar() {
  const queryClient = useQueryClient();

  return {
    mutate: async ({ id, isStarred }: { id: string; isStarred: boolean }) => {
      await supabase
        .from('smart_notifications')
        .update({ is_starred: isStarred })
        .eq('id', id);
      queryClient.invalidateQueries({ queryKey: ['smart-notifications'] });
    },
  };
}
