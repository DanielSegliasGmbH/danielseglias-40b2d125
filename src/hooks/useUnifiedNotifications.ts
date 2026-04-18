import { useMemo } from 'react';
import {
  useClientNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useToggleNotificationStar,
} from './useNotifications';
import {
  useSmartNotificationsList,
  useMarkSmartNotificationRead,
  useMarkAllSmartNotificationsRead,
  useToggleSmartNotificationStar,
} from './useSmartNotifications';

// ── UNIFIED NOTIFICATION SERVICE ────────────────────
// Single API across two underlying tables:
//   - notifications      (admin broadcast) + notification_reads (per-user state)
//   - smart_notifications (system-generated nudges, per-user)
// All UI should use this hook. The underlying hooks are
// kept for internal dispatch only.
// ────────────────────────────────────────────────────

export type NotificationSource = 'broadcast' | 'smart';

export interface UnifiedNotification {
  id: string;
  source: NotificationSource;
  title: string;
  body: string;
  description?: string | null;
  is_read: boolean;
  is_starred: boolean;
  category: string;
  created_at: string;
  link_url?: string | null;
  link_label?: string | null;
}

export interface UseUnifiedNotificationsReturn {
  all: UnifiedNotification[];
  unread: UnifiedNotification[];
  read: UnifiedNotification[];
  starred: UnifiedNotification[];
  unreadCount: number;
  starredCount: number;
  markRead: (id: string, source: NotificationSource) => void;
  markAllRead: () => void;
  toggleStar: (id: string, source: NotificationSource, isStarred: boolean) => void;
  isLoading: boolean;
}

export function useUnifiedNotifications(): UseUnifiedNotificationsReturn {
  const { data: broadcastNotifs, isLoading: loadingBroadcast } = useClientNotifications();
  const { data: smartNotifs, isLoading: loadingSmart } = useSmartNotificationsList();

  const markBroadcastRead = useMarkNotificationRead();
  const markAllBroadcastRead = useMarkAllNotificationsRead();
  const markSmartRead = useMarkSmartNotificationRead();
  const markAllSmartRead = useMarkAllSmartNotificationsRead();
  const toggleBroadcastStar = useToggleNotificationStar();
  const toggleSmartStar = useToggleSmartNotificationStar();

  const all = useMemo<UnifiedNotification[]>(() => {
    const items: UnifiedNotification[] = [];

    (broadcastNotifs || []).forEach(n => {
      items.push({
        id: n.id,
        source: 'broadcast',
        title: n.title,
        body: n.body,
        description: (n as any).description ?? null,
        is_read: n.is_read,
        is_starred: (n as any).is_starred ?? false,
        category: (n as any).category || 'general',
        created_at: n.published_at || n.created_at,
        link_url: n.link_url,
        link_label: n.link_label,
      });
    });

    (smartNotifs || []).forEach(n => {
      items.push({
        id: n.id,
        source: 'smart',
        title: n.title,
        body: n.body,
        description: null,
        is_read: n.is_read,
        is_starred: (n as any).is_starred ?? false,
        category: n.notification_type,
        created_at: n.created_at,
        link_url: n.link_url,
        link_label: n.link_label,
      });
    });

    items.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return items;
  }, [broadcastNotifs, smartNotifs]);

  const unread = useMemo(() => all.filter(n => !n.is_read), [all]);
  const read = useMemo(() => all.filter(n => n.is_read), [all]);
  const starred = useMemo(() => all.filter(n => n.is_starred), [all]);

  const markRead = (id: string, source: NotificationSource) => {
    if (source === 'broadcast') markBroadcastRead.mutate(id);
    else markSmartRead.mutate(id);
  };

  const markAllRead = () => {
    markAllBroadcastRead.mutate();
    markAllSmartRead.mutate();
  };

  const toggleStar = (id: string, source: NotificationSource, isStarred: boolean) => {
    if (source === 'broadcast') {
      toggleBroadcastStar.mutate({ notificationId: id, isStarred });
    } else {
      toggleSmartStar.mutate({ id, isStarred });
    }
  };

  return {
    all,
    unread,
    read,
    starred,
    unreadCount: unread.length,
    starredCount: starred.length,
    markRead,
    markAllRead,
    toggleStar,
    isLoading: loadingBroadcast || loadingSmart,
  };
}
