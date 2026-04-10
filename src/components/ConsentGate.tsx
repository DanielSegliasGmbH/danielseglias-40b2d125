import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHasValidConsent, useSaveConsent, CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION, CURRENT_DISCLAIMER_VERSION } from '@/hooks/useConsent';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ConsentGateProps {
  children: React.ReactNode;
}

export function ConsentGate({ children }: ConsentGateProps) {
  const { user } = useAuth();
  const { hasValidConsent, isLoading } = useHasValidConsent(user?.id);
  const saveConsent = useSaveConsent();

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showError, setShowError] = useState(false);

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

  const handleSubmit = () => {
    if (!canSubmit) {
      setShowError(true);
      return;
    }
    if (user) {
      saveConsent.mutate({ userId: user.id });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Zustimmung erforderlich</h1>
          <p className="text-sm text-muted-foreground">
            Bitte akzeptiere die folgenden Bedingungen, um fortzufahren.
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
        </div>

        {showError && !canSubmit && (
          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Bitte bestätige alle drei Zustimmungen, um fortzufahren.</span>
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
