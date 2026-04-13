import { useState, useEffect } from 'react';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { PlatformSelector } from '@/components/client-portal/strategy/PlatformSelector';
import { StrategySection } from '@/components/client-portal/strategy/StrategySection';
import { GlidepathSection } from '@/components/client-portal/strategy/GlidepathSection';
import { Button } from '@/components/ui/button';
import { TrendingUp, Lock, AlertTriangle } from 'lucide-react';
import { useCustomerPortalSettings } from '@/hooks/useClientPortal';
import { StrategyPasswordGate } from '@/components/client-portal/StrategyPasswordGate';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUserProfile } from '@/hooks/useUserManagement';
import { Card, CardContent } from '@/components/ui/card';

export default function ClientPortalStrategies() {
  const [selectedPlatform, setSelectedPlatform] = useState('finpension');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('moderate');
  const [passwordGateOpen, setPasswordGateOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const { role } = useAuth();
  const { data: profile, isLoading: profileLoading } = useCurrentUserProfile();

  const { data: settings } = useCustomerPortalSettings();
  const privacyMode = settings?.show_strategy_privacy ?? false;
  const needsPassword = (settings?.has_strategy_password ?? false) && role === 'client';

  // Strategy access check: user_type = customer AND has_strategy_access = true
  const hasStrategyAccess = role === 'admin' || role === 'staff' || (
    profile?.user_type === 'customer' && profile?.has_strategy_access === true
  );

  useEffect(() => {
    if (needsPassword) {
      const sessionUnlocked = sessionStorage.getItem('strategy_unlocked') === 'true';
      if (sessionUnlocked) {
        setUnlocked(true);
      } else {
        setPasswordGateOpen(true);
      }
    }
  }, [needsPassword]);

  useEffect(() => {
    const accepted = sessionStorage.getItem('strategy_disclaimer_accepted') === 'true';
    if (accepted) setDisclaimerAccepted(true);
  }, []);

  if (profileLoading) {
    return (
      <ClientPortalLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </ClientPortalLayout>
    );
  }

  // Access denied
  if (!hasStrategyAccess) {
    return (
      <ClientPortalLayout>
        <div className="max-w-md mx-auto mt-20">
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <Lock className="h-10 w-10 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Kein Zugriff</h2>
              <p className="text-muted-foreground text-sm">
                Anlagestrategien sind nur für berechtigte Kunden verfügbar.
                Bitte kontaktiere deinen Berater, um Zugang zu erhalten.
              </p>
              <Button variant="outline" onClick={() => window.history.back()}>
                Zurück
              </Button>
            </CardContent>
          </Card>
        </div>
      </ClientPortalLayout>
    );
  }

  // Password gate
  if (needsPassword && !unlocked) {
    return (
      <ClientPortalLayout>
        <div className="max-w-md mx-auto mt-20">
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <Lock className="h-10 w-10 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Geschützter Bereich</h2>
              <p className="text-muted-foreground">Dieser Bereich ist passwortgeschützt.</p>
              <Button onClick={() => setPasswordGateOpen(true)}>Passwort eingeben</Button>
            </CardContent>
          </Card>
        </div>
        <StrategyPasswordGate
          open={passwordGateOpen}
          onOpenChange={setPasswordGateOpen}
          onSuccess={() => {
            setUnlocked(true);
            setPasswordGateOpen(false);
          }}
        />
      </ClientPortalLayout>
    );
  }

  // Disclaimer
  if (!disclaimerAccepted) {
    return (
      <ClientPortalLayout>
        <div className="max-w-lg mx-auto mt-16">
          <Card>
            <CardContent className="py-8 space-y-5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
                <h2 className="text-lg font-bold text-foreground">Wichtiger Hinweis</h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Die hier dargestellten Anlagestrategien dienen ausschliesslich zu Informationszwecken
                  und stellen <strong className="text-foreground">keine individuelle Finanzberatung</strong> oder Anlageempfehlung dar.
                </p>
                <p>
                  Die Inhalte ersetzen keine professionelle Beratung und sind nur im Kontext
                  einer persönlichen Beratung gültig. Vergangene Renditen sind keine Garantie
                  für zukünftige Ergebnisse.
                </p>
                <p>
                  Bei Fragen wende dich bitte an deinen Berater.
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setDisclaimerAccepted(true);
                  sessionStorage.setItem('strategy_disclaimer_accepted', 'true');
                }}
              >
                Verstanden – weiter zur Übersicht
              </Button>
            </CardContent>
          </Card>
        </div>
      </ClientPortalLayout>
    );
  }

  return (
    <ClientPortalLayout>
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-10 pb-24 sm:pb-12 px-1 sm:px-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Anlageberatung</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Plattform wählen, Strategie verstehen, Umsetzung nachvollziehen
            </p>
          </div>
        </div>

        <PlatformSelector
          selected={selectedPlatform}
          onSelect={setSelectedPlatform}
          privacyMode={privacyMode}
        />

        <StrategySection
          platformId={selectedPlatform}
          privacyMode={privacyMode}
        />

        <GlidepathSection
          selected={selectedRiskLevel}
          onSelect={setSelectedRiskLevel}
          privacyMode={privacyMode}
        />

        <section className="space-y-4">
          <div className="bg-card border rounded-2xl p-5 sm:p-8 text-center space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
              Diese Strategie auf deine Situation anwenden
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Lass uns gemeinsam prüfen, welche Kombination aus Plattform, Strategie und
              Ablaufmanagement optimal zu deiner Situation passt.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Kontaktiere deinen Berater direkt über den Chat.
            </p>
          </div>
        </section>
      </div>
    </ClientPortalLayout>
  );
}
