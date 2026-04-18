import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Smartphone, Info } from 'lucide-react';
import { toast } from 'sonner';
import {
  getCurrentPermission,
  iOSRequiresInstall,
  isIOS,
  isLovablePreviewHost,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/push';

type State = 'unsupported' | 'preview' | 'ios-install' | 'default' | 'granted' | 'denied';

export function EnableNotifications() {
  const [state, setState] = useState<State>('default');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!isPushSupported()) return setState('unsupported');
      if (isLovablePreviewHost()) return setState('preview');
      if (iOSRequiresInstall()) return setState('ios-install');
      const p = await getCurrentPermission();
      if (p === 'unsupported') setState('unsupported');
      else setState(p as State);
    })();
  }, []);

  const handleEnable = async () => {
    setBusy(true);
    const res = await subscribeToPush();
    setBusy(false);
    if (res.ok) {
      setState('granted');
      toast.success('Push-Benachrichtigungen aktiviert');
    } else if (res.reason === 'denied') {
      setState('denied');
      toast.error('Du hast die Berechtigung abgelehnt. Bitte in den Browser-Einstellungen aktivieren.');
    } else if (res.reason === 'ios-needs-install') {
      setState('ios-install');
    } else {
      toast.error('Aktivierung fehlgeschlagen.');
    }
  };

  const handleDisable = async () => {
    setBusy(true);
    await unsubscribeFromPush();
    setBusy(false);
    setState('default');
    toast.success('Push-Benachrichtigungen deaktiviert');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" /> Push-Benachrichtigungen
        </CardTitle>
        <CardDescription>
          Werde direkt informiert bei neuen Chat-Nachrichten und fälligen Aufgaben.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {state === 'unsupported' && (
          <p className="text-sm text-muted-foreground flex gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            Dein Browser unterstützt keine Web-Push-Benachrichtigungen.
          </p>
        )}

        {state === 'preview' && (
          <p className="text-sm text-muted-foreground flex gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            Push-Benachrichtigungen funktionieren nur in der publizierten App, nicht in der Editor-Vorschau.
          </p>
        )}

        {state === 'ios-install' && (
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="flex gap-2">
              <Smartphone className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              Auf iPhone/iPad musst du die App zuerst zum Home-Bildschirm hinzufügen (iOS 16.4+):
            </p>
            <ol className="list-decimal pl-9 space-y-1">
              <li>Tippe in Safari unten auf das Teilen-Icon.</li>
              <li>Wähle „Zum Home-Bildschirm“.</li>
              <li>Öffne FinLife vom Home-Bildschirm und aktiviere die Benachrichtigungen.</li>
            </ol>
          </div>
        )}

        {state === 'default' && (
          <Button onClick={handleEnable} disabled={busy}>
            <Bell className="h-4 w-4 mr-2" />
            Benachrichtigungen aktivieren
          </Button>
        )}

        {state === 'granted' && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-foreground">✓ Aktiviert auf diesem Gerät</p>
            <Button variant="outline" onClick={handleDisable} disabled={busy}>
              <BellOff className="h-4 w-4 mr-2" />
              Deaktivieren
            </Button>
          </div>
        )}

        {state === 'denied' && (
          <p className="text-sm text-destructive">
            Berechtigung abgelehnt. Aktiviere Benachrichtigungen in den Browser-/System-Einstellungen.
          </p>
        )}

        {isIOS() && state !== 'ios-install' && (
          <p className="text-xs text-muted-foreground pt-2">
            Hinweis für iOS: Push funktioniert nur, wenn du FinLife zuvor zum Home-Bildschirm hinzugefügt hast.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
