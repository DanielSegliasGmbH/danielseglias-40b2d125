import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function NotificationPrompt({ className }: { className?: string }) {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('notification_prompt_dismissed') === 'true';
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('notification_prompt_dismissed', 'true');
    setDismissed(true);
  };

  const handleEnable = () => {
    // UI-only: would trigger real push permission in native app
    handleDismiss();
  };

  return (
    <Card className={cn('border-primary/20 bg-primary/5', className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground mb-1">Benachrichtigungen aktivieren</p>
            <p className="text-xs text-muted-foreground mb-3">
              Erhalte wichtige Updates zu deinen Analysen und Aufgaben.
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="h-9 rounded-xl text-xs" onClick={handleEnable}>
                Aktivieren
              </Button>
              <Button size="sm" variant="ghost" className="h-9 rounded-xl text-xs" onClick={handleDismiss}>
                Später
              </Button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
