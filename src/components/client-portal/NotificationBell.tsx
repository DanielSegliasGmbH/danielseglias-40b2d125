import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  useClientNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  getCategoryLabel,
} from '@/hooks/useNotifications';
import {
  useSmartNotificationsList,
  useMarkSmartNotificationRead,
  useMarkAllSmartNotificationsRead,
} from '@/hooks/useSmartNotifications';
import { cn } from '@/lib/utils';
import { format, isToday, isThisWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface UnifiedNotification {
  id: string;
  title: string;
  body: string;
  description?: string | null;
  link_url?: string | null;
  link_label?: string | null;
  category?: string;
  is_read: boolean;
  date: string;
  source: 'broadcast' | 'smart';
}

type ColorDot = 'blue' | 'green' | 'orange' | 'red';

function getCategoryDotColor(category: string): ColorDot {
  switch (category) {
    case 'update':
    case 'general':
      return 'blue';
    case 'new_tool':
    case 'new_content':
    case 'goal_milestone':
      return 'green';
    case 'task_due':
    case 'weekly_budget':
    case 'streak_reminder':
      return 'orange';
    case 'personal':
      return 'red';
    default:
      return 'blue';
  }
}

const dotColors: Record<ColorDot, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
};

interface GroupedNotifications {
  label: string;
  items: UnifiedNotification[];
}

function groupNotifications(items: UnifiedNotification[]): GroupedNotifications[] {
  const today: UnifiedNotification[] = [];
  const thisWeek: UnifiedNotification[] = [];
  const older: UnifiedNotification[] = [];

  items.forEach(n => {
    const d = new Date(n.date);
    if (isToday(d)) today.push(n);
    else if (isThisWeek(d, { weekStartsOn: 1 })) thisWeek.push(n);
    else older.push(n);
  });

  const groups: GroupedNotifications[] = [];
  if (today.length) groups.push({ label: 'Heute', items: today });
  if (thisWeek.length) groups.push({ label: 'Diese Woche', items: thisWeek });
  if (older.length) groups.push({ label: 'Älter', items: older });
  return groups;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: broadcastNotifs } = useClientNotifications();
  const { data: smartNotifs } = useSmartNotificationsList();
  const markBroadcastRead = useMarkNotificationRead();
  const markAllBroadcastRead = useMarkAllNotificationsRead();
  const markSmartRead = useMarkSmartNotificationRead();
  const markAllSmartRead = useMarkAllSmartNotificationsRead();

  const notifications = useMemo<UnifiedNotification[]>(() => {
    const items: UnifiedNotification[] = [];

    (broadcastNotifs || []).forEach(n => {
      items.push({
        id: n.id,
        title: n.title,
        body: n.body,
        description: n.description,
        link_url: n.link_url,
        link_label: n.link_label,
        category: n.category,
        is_read: n.is_read,
        date: n.published_at || n.created_at,
        source: 'broadcast',
      });
    });

    (smartNotifs || []).forEach(n => {
      items.push({
        id: n.id,
        title: n.title,
        body: n.body,
        link_url: n.link_url,
        link_label: n.link_label,
        category: n.notification_type,
        is_read: n.is_read,
        date: n.created_at,
        source: 'smart',
      });
    });

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items;
  }, [broadcastNotifs, smartNotifs]);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const grouped = groupNotifications(notifications);

  const handleClick = (n: UnifiedNotification) => {
    if (!n.is_read) {
      if (n.source === 'broadcast') markBroadcastRead.mutate(n.id);
      else markSmartRead.mutate(n.id);
    }
  };

  const handleMarkAllRead = () => {
    markAllBroadcastRead.mutate();
    markAllSmartRead.mutate();
  };

  let globalIdx = 0;

  return (
    <>
      <Button variant="ghost" size="icon" className="relative h-8 w-8" onClick={() => setOpen(true)}>
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[10px] flex items-center justify-center bg-destructive text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="px-5 pb-3 border-b border-border shrink-0" style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), 44px) + 8px)' }}>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base">🔔 Erinnerungen</SheetTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1.5 h-7 text-primary"
                  onClick={handleMarkAllRead}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Alle als gelesen markieren
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="overflow-y-auto flex-1" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)' }}>
            {!notifications.length ? (
              <div className="text-center py-20 px-6">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">Keine neuen Erinnerungen</p>
                <p className="text-xs text-muted-foreground">Du bist auf dem Laufenden!</p>
              </div>
            ) : (
              <div className="py-2">
                {grouped.map((group) => (
                  <div key={group.label}>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 pt-4 pb-1.5">
                      {group.label}
                    </p>
                    {group.items.map(n => {
                      const idx = globalIdx++;
                      const dotColor = getCategoryDotColor(n.category || 'general');
                      return (
                        <motion.div
                          key={`${n.source}-${n.id}`}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15, delay: idx * 0.02 }}
                        >
                          {n.link_url ? (
                            <Link
                              to={n.link_url}
                              onClick={() => { handleClick(n); setOpen(false); }}
                              className={cn(
                                "flex items-start gap-3 px-5 py-3 transition-colors",
                                !n.is_read ? "bg-primary/[0.04]" : "hover:bg-muted/50"
                              )}
                            >
                              <NotificationRow n={n} dotColor={dotColor} />
                            </Link>
                          ) : (
                            <div
                              onClick={() => handleClick(n)}
                              className={cn(
                                "flex items-start gap-3 px-5 py-3 transition-colors cursor-pointer",
                                !n.is_read ? "bg-primary/[0.04]" : "hover:bg-muted/50"
                              )}
                            >
                              <NotificationRow n={n} dotColor={dotColor} />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function NotificationRow({ n, dotColor }: { n: UnifiedNotification; dotColor: ColorDot }) {
  return (
    <>
      <div className={cn("w-2 h-2 rounded-full mt-[7px] shrink-0", dotColors[dotColor])} />
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-[15px] leading-snug",
          !n.is_read ? "font-semibold text-foreground" : "font-medium text-foreground/80"
        )}>
          {n.title}
        </p>
        <p className="text-[13px] text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>
        {n.link_label && (
          <span className="text-xs text-primary font-medium mt-1 inline-block">
            {n.link_label} →
          </span>
        )}
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          {format(new Date(n.date), 'dd. MMM, HH:mm', { locale: de })}
        </p>
      </div>
      {!n.is_read && (
        <div className="w-2 h-2 rounded-full bg-primary mt-[7px] shrink-0" />
      )}
    </>
  );
}
