import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { useClientNotifications, useUnreadNotificationCount, useMarkNotificationRead } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications } = useClientNotifications();
  const unreadCount = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();

  const handleOpen = () => setOpen(true);

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markRead.mutate(id);
    }
  };

  return (
    <>
      <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={handleOpen}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[10px] flex items-center justify-center bg-destructive text-destructive-foreground">
            {unreadCount}
          </Badge>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Benachrichtigungen</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {!notifications?.length ? (
              <div className="text-center py-12">
                <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Keine Benachrichtigungen</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id, n.is_read)}
                  className={cn(
                    "p-4 rounded-xl border transition-colors cursor-pointer",
                    n.is_read ? "bg-background border-border" : "bg-primary/5 border-primary/20"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground">{n.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{n.body}</p>
                      {n.link_url && n.link_label && (
                        <Link
                          to={n.link_url}
                          onClick={() => setOpen(false)}
                          className="text-sm text-primary font-medium mt-2 inline-block hover:underline"
                        >
                          {n.link_label} →
                        </Link>
                      )}
                      {n.published_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(n.published_at), 'dd.MM.yyyy', { locale: de })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
