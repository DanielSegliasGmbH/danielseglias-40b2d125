import { useState, useEffect } from 'react';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { PlatformSelector } from '@/components/client-portal/strategy/PlatformSelector';
import { StrategySection } from '@/components/client-portal/strategy/StrategySection';
import { GlidepathSection } from '@/components/client-portal/strategy/GlidepathSection';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { useCustomerPortalSettings } from '@/hooks/useClientPortal';
import { StrategyPasswordGate } from '@/components/client-portal/StrategyPasswordGate';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function ClientPortalStrategies() {
  const [selectedPlatform, setSelectedPlatform] = useState('finpension');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('moderate');
  const [passwordGateOpen, setPasswordGateOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const { role } = useAuth();

  const { data: settings } = useCustomerPortalSettings();
  const privacyMode = settings?.show_strategy_privacy ?? false;
  const strategyPassword = (settings as any)?.strategy_access_password;
  const needsPassword = !!strategyPassword && role === 'client';

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

  return (
    <ClientPortalLayout>
      <div className="max-w-5xl mx-auto space-y-10 pb-12">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Anlageberatung</h1>
            <p className="text-muted-foreground">
              Plattform wählen, Strategie verstehen, Umsetzung nachvollziehen
            </p>
          </div>
        </div>

        {/* Section 1: Platform */}
        <PlatformSelector
          selected={selectedPlatform}
          onSelect={setSelectedPlatform}
          privacyMode={privacyMode}
        />

        {/* Section 2: Strategy */}
        <StrategySection
          platformId={selectedPlatform}
          privacyMode={privacyMode}
        />

        {/* Section 3: Glidepath */}
        <GlidepathSection
          selected={selectedRiskLevel}
          onSelect={setSelectedRiskLevel}
          privacyMode={privacyMode}
        />

        {/* CTA */}
        <section className="space-y-4">
          <div className="bg-card border rounded-2xl p-8 text-center space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Diese Strategie auf deine Situation anwenden
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Lass uns gemeinsam prüfen, welche Kombination aus Plattform, Strategie und
              Ablaufmanagement optimal zu deiner Situation passt.
            </p>
            <Button size="lg" className="mt-2">
              Kostenlose Analyse starten
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </section>
      </div>
    </ClientPortalLayout>
  );
}
