import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHasValidConsent, useSaveConsent, CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION, CURRENT_DISCLAIMER_VERSION } from '@/hooks/useConsent';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, AlertTriangle, Bell, Smartphone, Info } from 'lucide-react';
import {
  getCurrentPermission,
  iOSRequiresInstall,
  isLovablePreviewHost,
  isPushSupported,
  subscribeToPush,
} from '@/lib/push';
import { toast } from 'sonner';

interface ConsentGateProps {
  children: React.ReactNode;
}

type PushState = 'unsupported' | 'preview' | 'ios-install' | 'default' | 'granted' | 'denied';

export function ConsentGate({ children }: ConsentGateProps) {
  const { user } = useAuth();
  const { hasValidConsent, isLoading } = useHasValidConsent(user?.id);
  const saveConsent = useSaveConsent();

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [enablePush, setEnablePush] = useState(true); // opt-in by default — user can uncheck
  const [showError, setShowError] = useState(false);
  const [pushState, setPushState] = useState<PushState>('default');

  useEffect(() => {
    (async () => {
      if (!isPushSupported()) { setPushState('unsupported'); setEnablePush(false); return; }
      if (isLovablePreviewHost()) { setPushState('preview'); setEnablePush(false); return; }
      if (iOSRequiresInstall()) { setPushState('ios-install'); setEnablePush(false); return; }
      const p = await getCurrentPermission();
      if (p === 'unsupported') { setPushState('unsupported'); setEnablePush(false); }
      else if (p === 'granted') { setPushState('granted'); setEnablePush(true); }
      else if (p === 'denied') { setPushState('denied'); setEnablePush(false); }
      else setPushState('default');
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasValidConsent) {
    return <>{children}</>;
  }

  const canSubmit = termsAccepted && privacyAccepted && disclaimerAccepted && !saveConsent.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) {
      setShowError(true);
      return;
    }
    if (!user) return;

    // Save consent first.
    saveConsent.mutate({ userId: user.id });

    // If user opted in to push and the browser is in a state where we can ask, request now.
    // Errors here are non-fatal — they don't block consent.
    if (enablePush && pushState === 'default') {
      try {
        const res = await subscribeToPush();
        if (res.ok) toast.success('Push-Benachrichtigungen aktiviert');
        else if (res.reason === 'denied') toast.message('Du kannst Benachrichtigungen später in den Einstellungen aktivieren.');
      } catch {
        // ignore — user can enable later in settings
      }
    }
  };

  const pushSelectable = pushState === 'default' || pushState === 'granted';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Bevor es losgeht</h1>
          <p className="text-sm text-muted-foreground">
            Bitte bestätige die folgenden Punkte, um FinLife zu nutzen.
          </p>
        </div>

        <div className="space-y-4 bg-card border border-border rounded-xl p-5">
          {/* AGB */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent-terms"
              checked={termsAccepted}
              onCheckedChange={(v) => { setTermsAccepted(v === true); setShowError(false); }}
            />
            <label htmlFor="consent-terms" className="text-sm leading-snug text-foreground cursor-pointer">
              Ich akzeptiere die{' '}
              <a
                href="https://danielseglias.ch/agb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                Allgemeinen Geschäftsbedingungen
              </a>
              {' '}(Version {CURRENT_TERMS_VERSION}).
            </label>
          </div>

          {/* Datenschutz */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent-privacy"
              checked={privacyAccepted}
              onCheckedChange={(v) => { setPrivacyAccepted(v === true); setShowError(false); }}
            />
            <label htmlFor="consent-privacy" className="text-sm leading-snug text-foreground cursor-pointer">
              Ich habe die{' '}
              <a
                href="https://danielseglias.ch/datenschutz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                Datenschutzerklärung
              </a>
              {' '}gelesen und akzeptiere sie (Version {CURRENT_PRIVACY_VERSION}).
            </label>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-border pt-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent-disclaimer"
                checked={disclaimerAccepted}
                onCheckedChange={(v) => { setDisclaimerAccepted(v === true); setShowError(false); }}
              />
              <label htmlFor="consent-disclaimer" className="text-sm leading-snug text-foreground cursor-pointer">
                Ich bestätige, dass die Inhalte, Empfehlungen und Auswertungen in dieser App keine individuelle Finanzberatung darstellen. Mir ist bewusst, dass KI-basierte Inhalte fehleranfällig sein können und ich Ergebnisse nicht ungeprüft übernehmen sollte. Die App dient der Orientierung, Bildung und eigenständigen Vorbereitung – erstellte Pläne können anschliessend durch fachkundige Unterstützung geprüft werden.
                {' '}(Version {CURRENT_DISCLAIMER_VERSION})
              </label>
            </div>
          </div>

          {/* Push-Benachrichtigungen */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Push-Benachrichtigungen</p>
                <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                  Wir informieren dich über neue Chat-Nachrichten von deinem Berater, fällige Aufgaben und wichtige Coaching-Erinnerungen. Du kannst das jederzeit in den Einstellungen ändern.
                </p>
              </div>
            </div>

            {pushSelectable && (
              <div className="flex items-start gap-3 pl-12">
                <Checkbox
                  id="consent-push"
                  checked={enablePush}
                  onCheckedChange={(v) => setEnablePush(v === true)}
                  disabled={pushState === 'granted'}
                />
                <label htmlFor="consent-push" className="text-sm leading-snug text-foreground cursor-pointer">
                  {pushState === 'granted'
                    ? 'Bereits aktiviert auf diesem Gerät ✓'
                    : 'Ja, ich möchte Push-Benachrichtigungen erhalten.'}
                </label>
              </div>
            )}

            {pushState === 'preview' && (
              <p className="text-xs text-muted-foreground flex gap-2 pl-12">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                Push funktioniert nur in der publizierten App, nicht in der Editor-Vorschau.
              </p>
            )}

            {pushState === 'ios-install' && (
              <div className="text-xs text-muted-foreground space-y-1 pl-12">
                <p className="flex gap-2">
                  <Smartphone className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                  Auf iPhone/iPad: Bitte zuerst die App über Safari → „Zum Home-Bildschirm" hinzufügen, dann kannst du Benachrichtigungen aktivieren.
                </p>
              </div>
            )}

            {pushState === 'denied' && (
              <p className="text-xs text-destructive pl-12">
                Berechtigung wurde im Browser abgelehnt. Du kannst sie in den Browser-/System-Einstellungen wieder erlauben.
              </p>
            )}

            {pushState === 'unsupported' && (
              <p className="text-xs text-muted-foreground pl-12">
                Dein Browser unterstützt keine Web-Push-Benachrichtigungen.
              </p>
            )}
          </div>
        </div>

        {showError && !canSubmit && (
          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Bitte bestätige AGB, Datenschutz und Disclaimer, um fortzufahren.</span>
          </div>
        )}

        <Button
          className="w-full h-12 rounded-xl"
          disabled={saveConsent.isPending}
          onClick={handleSubmit}
        >
          {saveConsent.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Bestätigen und fortfahren'}
        </Button>
      </div>
    </div>
  );
}
