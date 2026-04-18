import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useUnifiedNotifications, type UnifiedNotification } from '@/hooks/useUnifiedNotifications';
import { cn } from '@/lib/utils';
import { format, isToday, isThisWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'framer-motion';

type ColorDot = 'blue' | 'green' | 'orange' | 'red';
type FilterTab = 'unread' | 'read' | 'starred' | 'all';

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
  const [activeTab, setActiveTab] = useState<FilterTab>('unread');
  const { data: broadcastNotifs } = useClientNotifications();
  const { data: smartNotifs } = useSmartNotificationsList();
  const markBroadcastRead = useMarkNotificationRead();
  const markAllBroadcastRead = useMarkAllNotificationsRead();
  const markSmartRead = useMarkSmartNotificationRead();
  const markAllSmartRead = useMarkAllSmartNotificationsRead();
  const toggleBroadcastStar = useToggleNotificationStar();
  const toggleSmartStar = useToggleSmartNotificationStar();

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
        is_starred: (n as any).is_starred ?? false,
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
        is_starred: (n as any).is_starred ?? false,
        date: n.created_at,
        source: 'smart',
      });
    });

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items;
  }, [broadcastNotifs, smartNotifs]);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const starredCount = notifications.filter(n => n.is_starred).length;

  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'unread': return notifications.filter(n => !n.is_read);
      case 'read': return notifications.filter(n => n.is_read);
      case 'starred': return notifications.filter(n => n.is_starred);
      case 'all':
      default: return notifications;
    }
  }, [notifications, activeTab]);

  const grouped = groupNotifications(filtered);

  const handleClick = (n: UnifiedNotification) => {
    if (!n.is_read) {
      if (n.source === 'broadcast') markBroadcastRead.mutate(n.id);
      else markSmartRead.mutate(n.id);
    }
  };

  const handleToggleStar = (e: React.MouseEvent, n: UnifiedNotification) => {
    e.preventDefault();
    e.stopPropagation();
    if (n.source === 'broadcast') {
      toggleBroadcastStar.mutate({ notificationId: n.id, isStarred: !n.is_starred });
    } else {
      toggleSmartStar.mutate({ id: n.id, isStarred: !n.is_starred });
    }
  };

  const handleMarkAllRead = () => {
    markAllBroadcastRead.mutate();
    markAllSmartRead.mutate();
  };

  const emptyMessage = (() => {
    switch (activeTab) {
      case 'unread': return { icon: '✅', title: 'Keine ungelesenen Erinnerungen', sub: 'Du bist auf dem Laufenden!' };
      case 'read': return { icon: '📭', title: 'Noch nichts gelesen', sub: 'Gelesene Erinnerungen erscheinen hier.' };
      case 'starred': return { icon: '⭐', title: 'Keine markierten Erinnerungen', sub: 'Tippe den Stern, um Wichtiges zu markieren.' };
      case 'all':
      default: return { icon: '🔔', title: 'Keine Erinnerungen', sub: 'Hier erscheinen alle Hinweise.' };
    }
  })();

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
          <SheetHeader className="px-5 pb-3 pr-16 border-b border-border shrink-0" style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), 44px) + 8px)' }}>
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
                  Alle gelesen
                </Button>
              )}
            </div>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)} className="flex flex-col flex-1 min-h-0">
            <div className="px-3 pt-3 shrink-0">
              <TabsList className="grid grid-cols-4 w-full h-9">
                <TabsTrigger value="unread" className="text-xs gap-1">
                  Ungelesen
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-destructive text-destructive-foreground rounded-full px-1.5 min-w-[18px]">
                      {unreadCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="read" className="text-xs">Gelesen</TabsTrigger>
                <TabsTrigger value="starred" className="text-xs gap-1">
                  Mit Stern
                  {starredCount > 0 && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full px-1.5 min-w-[18px]">
                      {starredCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs">Alle</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="flex-1 overflow-y-auto mt-0" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)' }}>
              {!filtered.length ? (
                <div className="text-center py-20 px-6">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">{emptyMessage.icon}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">{emptyMessage.title}</p>
                  <p className="text-xs text-muted-foreground">{emptyMessage.sub}</p>
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
                                <NotificationRow n={n} dotColor={dotColor} onToggleStar={(e) => handleToggleStar(e, n)} />
                              </Link>
                            ) : (
                              <div
                                onClick={() => handleClick(n)}
                                className={cn(
                                  "flex items-start gap-3 px-5 py-3 transition-colors cursor-pointer",
                                  !n.is_read ? "bg-primary/[0.04]" : "hover:bg-muted/50"
                                )}
                              >
                                <NotificationRow n={n} dotColor={dotColor} onToggleStar={(e) => handleToggleStar(e, n)} />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}

function NotificationRow({
  n,
  dotColor,
  onToggleStar,
}: {
  n: UnifiedNotification;
  dotColor: ColorDot;
  onToggleStar: (e: React.MouseEvent) => void;
}) {
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
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onToggleStar}
          className={cn(
            "p-1 rounded-md hover:bg-muted transition-colors",
            n.is_starred ? "text-amber-500" : "text-muted-foreground/40 hover:text-muted-foreground"
          )}
          aria-label={n.is_starred ? 'Stern entfernen' : 'Mit Stern markieren'}
        >
          <Star className={cn("h-4 w-4", n.is_starred && "fill-current")} />
        </button>
        {!n.is_read && (
          <div className="w-2 h-2 rounded-full bg-primary" />
        )}
      </div>
    </>
  );
}
