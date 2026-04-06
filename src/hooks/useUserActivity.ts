import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TrackingEvent {
  id: string;
  event_type: string;
  event_name: string | null;
  page_path: string | null;
  page_title: string | null;
  module_key: string | null;
  tool_key: string | null;
  content_key: string | null;
  duration_seconds: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface TrackingSession {
  id: string;
  started_at: string;
  last_activity_at: string;
  ended_at: string | null;
  user_agent: string | null;
}

export interface UserActivitySummary {
  totalEvents: number;
  totalSessions: number;
  totalLogins: number;
  totalPageViews: number;
  toolsOpened: string[];
  chatMessages: number;
  lastActivity: string | null;
  eventTypeCounts: Record<string, number>;
}

const PAGE_SIZE = 50;

export function useUserEvents(userId: string | undefined, filters?: {
  eventType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}) {
  const page = filters?.page ?? 0;

  return useQuery({
    queryKey: ['admin', 'user-events', userId, filters],
    queryFn: async () => {
      let query = supabase
        .from('tracking_events')
        .select('*', { count: 'exact' })
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (filters?.eventType && filters.eventType !== 'all') {
        query = query.eq('event_type', filters.eventType);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo + 'T23:59:59');
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { events: (data || []) as TrackingEvent[], totalCount: count ?? 0 };
    },
    enabled: !!userId,
  });
}

export function useUserSessions(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'user-sessions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracking_sessions')
        .select('*')
        .eq('user_id', userId!)
        .order('started_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as TrackingSession[];
    },
    enabled: !!userId,
  });
}

export function useUserActivitySummary(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'user-activity-summary', userId],
    queryFn: async () => {
      // Fetch all event type counts in one query
      const { data: events, error } = await supabase
        .from('tracking_events')
        .select('event_type, tool_key, created_at')
        .eq('user_id', userId!);

      if (error) throw error;

      const { data: sessions } = await supabase
        .from('tracking_sessions')
        .select('id')
        .eq('user_id', userId!);

      const eventTypeCounts: Record<string, number> = {};
      const toolsSet = new Set<string>();
      let lastActivity: string | null = null;

      for (const e of events || []) {
        eventTypeCounts[e.event_type] = (eventTypeCounts[e.event_type] || 0) + 1;
        if (e.tool_key) toolsSet.add(e.tool_key);
        if (!lastActivity || e.created_at > lastActivity) lastActivity = e.created_at;
      }

      const summary: UserActivitySummary = {
        totalEvents: events?.length ?? 0,
        totalSessions: sessions?.length ?? 0,
        totalLogins: eventTypeCounts['login'] ?? 0,
        totalPageViews: eventTypeCounts['page_view'] ?? 0,
        toolsOpened: Array.from(toolsSet),
        chatMessages: eventTypeCounts['chat_message_sent'] ?? 0,
        lastActivity,
        eventTypeCounts,
      };

      return summary;
    },
    enabled: !!userId,
  });
}
