import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  useClientNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  getCategoryLabel,
} from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications } = useClientNotifications();
  const unreadCount = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markRead.mutate(id);
    }
  };

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
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base">Benachrichtigungen</SheetTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1.5 h-7"
                  onClick={() => markAllRead.mutate()}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Alle gelesen
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="overflow-y-auto max-h-[calc(100vh-5rem)]">
            {!notifications?.length ? (
              <div className="text-center py-16 px-4">
                <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Keine Benachrichtigungen</p>
                <p className="text-xs text-muted-foreground">Neue Mitteilungen erscheinen hier.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n.id, n.is_read)}
                    className={cn(
                      "px-5 py-4 transition-colors cursor-pointer",
                      !n.is_read && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className={cn("text-sm truncate", !n.is_read ? "font-semibold text-foreground" : "font-medium text-foreground")}>{n.title}</h4>
                          <Badge variant="outline" className="text-[10px] shrink-0 h-4 px-1.5">{getCategoryLabel(n.category)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{n.body}</p>
                        {n.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.description}</p>
                        )}
                        {n.link_url && n.link_label && (
                          <Link
                            to={n.link_url}
                            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                            className="text-xs text-primary font-medium mt-2 inline-block hover:underline"
                          >
                            {n.link_label} →
                          </Link>
                        )}
                        {n.published_at && (
                          <p className="text-[11px] text-muted-foreground mt-1.5">
                            {format(new Date(n.published_at), 'dd. MMMM yyyy', { locale: de })}
                          </p>
                        )}
                      </div>
                    </div>
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
