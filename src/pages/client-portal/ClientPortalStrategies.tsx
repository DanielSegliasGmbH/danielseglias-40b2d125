import { useState } from 'react';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { PlatformSelector } from '@/components/client-portal/strategy/PlatformSelector';
import { StrategySection } from '@/components/client-portal/strategy/StrategySection';
import { GlidepathSection } from '@/components/client-portal/strategy/GlidepathSection';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowRight, Info } from 'lucide-react';

export default function ClientPortalStrategies() {
  const [selectedPlatform, setSelectedPlatform] = useState('finpension');
  const [selectedStrategy, setSelectedStrategy] = useState('marketcap');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('moderate');

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
        <PlatformSelector selected={selectedPlatform} onSelect={setSelectedPlatform} />

        {/* Section 2: Strategy */}
        <StrategySection selected={selectedStrategy} onSelect={setSelectedStrategy} />

        {/* Section 3: Glidepath */}
        <GlidepathSection selected={selectedRiskLevel} onSelect={setSelectedRiskLevel} />

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

        {/* Disclaimer */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Diese Darstellung ist modellbasiert und dient nur zur Veranschaulichung. 
            Sie stellt keine Anlageempfehlung dar. Vergangene Renditen sind kein verlässlicher 
            Indikator für zukünftige Ergebnisse.
          </p>
        </div>
      </div>
    </ClientPortalLayout>
  );
}
