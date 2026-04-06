import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ── Types ────────────────────────────────────────────
export interface DashboardKPIs {
  totalUsers: number;
  active7d: number;
  active30d: number;
  new7d: number;
  new30d: number;
  withLogin: number;
  withChat: number;
  inactive7d: number;
  totalSessions: number;
  totalEvents: number;
}

export interface UserSegmentRow {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  role?: string;
  created_at: string;
  last_activity?: string;
  session_count: number;
  event_count: number;
  login_count: number;
  tool_opened_count: number;
  tool_completed_count: number;
  chat_count: number;
  signal: 'high_interest' | 'engaged' | 'ready_next' | 'stuck' | 'inactive' | 'new' | 'none';
}

export interface ToolUsageStat {
  tool_key: string;
  opened: number;
  completed: number;
  completion_rate: number;
}

// ── KPIs ─────────────────────────────────────────────
export function useAdminKPIs() {
  return useQuery({
    queryKey: ['admin-dashboard-kpis'],
    queryFn: async () => {
      const now = new Date();
      const d7 = new Date(now.getTime() - 7 * 86400000).toISOString();
      const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();

      // Get all profiles
      const { data: profiles } = await supabase.from('profiles').select('id, created_at');
      const totalUsers = profiles?.length || 0;
      const new7d = profiles?.filter(p => p.created_at >= d7).length || 0;
      const new30d = profiles?.filter(p => p.created_at >= d30).length || 0;

      // Get tracking sessions for activity
      const { data: sessions } = await supabase
        .from('tracking_sessions')
        .select('user_id, started_at')
        .gte('started_at', d30);

      const usersWith7d = new Set<string>();
      const usersWith30d = new Set<string>();
      sessions?.forEach(s => {
        if (s.user_id) {
          usersWith30d.add(s.user_id);
          if (s.started_at >= d7) usersWith7d.add(s.user_id);
        }
      });

      // Get login events
      const { data: loginEvents } = await supabase
        .from('tracking_events')
        .select('user_id')
        .eq('event_type', 'login');
      const withLogin = new Set(loginEvents?.map(e => e.user_id).filter(Boolean)).size;

      // Chat messages
      const { data: chatEvents } = await supabase
        .from('tracking_events')
        .select('user_id')
        .eq('event_type', 'chat_message_sent');
      const withChat = new Set(chatEvents?.map(e => e.user_id).filter(Boolean)).size;

      // Inactive: have sessions but none in 7d
      const { data: allSessions } = await supabase
        .from('tracking_sessions')
        .select('user_id, started_at');
      const allUsersWithSessions = new Set(allSessions?.map(s => s.user_id).filter(Boolean));
      const inactive7d = [...allUsersWithSessions].filter(u => !usersWith7d.has(u!)).length;

      const totalSessions = allSessions?.length || 0;

      const { count: totalEvents } = await supabase
        .from('tracking_events')
        .select('id', { count: 'exact', head: true });

      return {
        totalUsers,
        active7d: usersWith7d.size,
        active30d: usersWith30d.size,
        new7d,
        new30d,
        withLogin,
        withChat,
        inactive7d,
        totalSessions,
        totalEvents: totalEvents || 0,
      } as DashboardKPIs;
    },
    staleTime: 60000,
  });
}

// ── User list with segments ──────────────────────────
export function useAdminUserSegments() {
  return useQuery({
    queryKey: ['admin-dashboard-users'],
    queryFn: async () => {
      const d7 = new Date(Date.now() - 7 * 86400000).toISOString();

      // Profiles
      const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name, created_at');

      // All events grouped by user (limited)
      const { data: events } = await supabase
        .from('tracking_events')
        .select('user_id, event_type, tool_key, created_at')
        .order('created_at', { ascending: false })
        .limit(5000);

      // Sessions
      const { data: sessions } = await supabase
        .from('tracking_sessions')
        .select('user_id, started_at')
        .order('started_at', { ascending: false });

      // Roles
      const { data: roles } = await supabase.from('user_roles').select('user_id, role');
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]));

      // Build per-user stats
      const userMap = new Map<string, UserSegmentRow>();

      for (const p of profiles || []) {
        userMap.set(p.id, {
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          role: roleMap.get(p.id) || 'unknown',
          created_at: p.created_at,
          session_count: 0,
          event_count: 0,
          login_count: 0,
          tool_opened_count: 0,
          tool_completed_count: 0,
          chat_count: 0,
          signal: 'none',
        });
      }

      // Count sessions per user
      for (const s of sessions || []) {
        const u = s.user_id && userMap.get(s.user_id);
        if (u) {
          u.session_count++;
          if (!u.last_activity || s.started_at > u.last_activity) {
            u.last_activity = s.started_at;
          }
        }
      }

      // Count events per user
      for (const e of events || []) {
        const u = e.user_id && userMap.get(e.user_id);
        if (u) {
          u.event_count++;
          if (e.event_type === 'login') u.login_count++;
          if (e.event_type === 'tool_opened') u.tool_opened_count++;
          if (e.event_type === 'tool_completed') u.tool_completed_count++;
          if (e.event_type === 'chat_message_sent') u.chat_count++;
        }
      }

      // Classify signals
      for (const u of userMap.values()) {
        u.signal = classifyUser(u, d7);
      }

      return Array.from(userMap.values()).sort((a, b) =>
        (b.last_activity || '').localeCompare(a.last_activity || '')
      );
    },
    staleTime: 60000,
  });
}

function classifyUser(u: UserSegmentRow, d7: string): UserSegmentRow['signal'] {
  const isNew = u.created_at >= d7;
  const isInactive = !u.last_activity || u.last_activity < d7;
  const hasLogins = u.login_count > 0;
  const hasTools = u.tool_opened_count > 0;
  const hasCompletions = u.tool_completed_count > 0;
  const hasChat = u.chat_count > 0;
  const highSessions = u.session_count >= 5;

  if (isNew && !hasLogins) return 'new';
  if (isInactive && hasLogins) return 'inactive';
  if (hasTools && !hasCompletions && u.session_count >= 2) return 'stuck';
  if (hasCompletions && highSessions) return 'high_interest';
  if (hasCompletions || hasChat) return 'ready_next';
  if (hasLogins && u.session_count >= 3) return 'engaged';
  if (isNew) return 'new';
  return 'none';
}

// ── Tool usage stats ─────────────────────────────────
export function useToolUsageStats() {
  return useQuery({
    queryKey: ['admin-dashboard-tool-usage'],
    queryFn: async () => {
      const { data: events } = await supabase
        .from('tracking_events')
        .select('event_type, tool_key')
        .in('event_type', ['tool_opened', 'tool_completed']);

      const statsMap = new Map<string, { opened: number; completed: number }>();

      for (const e of events || []) {
        if (!e.tool_key) continue;
        if (!statsMap.has(e.tool_key)) statsMap.set(e.tool_key, { opened: 0, completed: 0 });
        const s = statsMap.get(e.tool_key)!;
        if (e.event_type === 'tool_opened') s.opened++;
        if (e.event_type === 'tool_completed') s.completed++;
      }

      return Array.from(statsMap.entries())
        .map(([tool_key, s]) => ({
          tool_key,
          opened: s.opened,
          completed: s.completed,
          completion_rate: s.opened > 0 ? Math.round((s.completed / s.opened) * 100) : 0,
        }))
        .sort((a, b) => b.opened - a.opened) as ToolUsageStat[];
    },
    staleTime: 60000,
  });
}

// ── Signal config ────────────────────────────────────
export const SIGNAL_CONFIG: Record<UserSegmentRow['signal'], { label: string; color: string }> = {
  high_interest: { label: 'Hohes Interesse', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  engaged: { label: 'Engagiert', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  ready_next: { label: 'Bereit für nächsten Schritt', color: 'bg-primary/10 text-primary' },
  stuck: { label: 'Hängt fest', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  inactive: { label: 'Inaktiv', color: 'bg-muted text-muted-foreground' },
  new: { label: 'Neu', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400' },
  none: { label: '—', color: 'bg-muted text-muted-foreground' },
};
