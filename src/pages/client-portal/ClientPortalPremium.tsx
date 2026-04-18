import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import {
  Sparkles, Check, Wrench, BookOpen, Brain, BarChart3,
  Loader2, CreditCard, Crown, ArrowRight, Shield,
} from 'lucide-react';

const FEATURES = [
  { icon: Wrench, text: 'Unbegrenzter Zugriff auf alle Werkzeuge' },
  { icon: Brain, text: 'Alle 10 Finanzcoach-Module' },
  { icon: BookOpen, text: 'Vollständige Wissensbibliothek' },
  { icon: BarChart3, text: 'Detaillierte Auswertungen & Analysen' },
  { icon: Shield, text: 'Priorisierter Support' },
];

export default function ClientPortalPremium() {
  const { isPremium, isLoading, subscriptionEnd, startCheckout, openCustomerPortal } = useSubscription();

  return (
    <ClientPortalLayout>
      <div className="w-full max-w-2xl mx-auto space-y-5 overflow-x-hidden px-1">
        <ScreenHeader title="Premium" backTo="/app/client-portal" />
        <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {isPremium ? 'Dein Premium-Zugang' : 'Premium freischalten'}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isPremium
              ? 'Du hast vollen Zugriff auf alle Funktionen und Inhalte.'
              : 'Schalte den vollen Zugriff frei und nutze die App ohne Einschränkungen.'}
          </p>
        </div>

        {/* Status card for premium users */}
        {isPremium && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Premium aktiv</p>
                    {subscriptionEnd && (
                      <p className="text-xs text-muted-foreground">
                        Nächste Verlängerung: {new Date(subscriptionEnd).toLocaleDateString('de-CH')}
                      </p>
                    )}
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary border-0">Aktiv</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing card */}
        <Card className={`border-2 ${isPremium ? 'border-primary/20' : 'border-primary/40'} overflow-hidden`}>
          <CardContent className="p-0">
            {!isPremium && (
              <div className="bg-primary/5 px-6 py-3 border-b border-primary/10">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Vollständiger Zugang</span>
                </div>
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Price */}
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">CHF 10</span>
                  <span className="text-muted-foreground">/ Monat</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Jederzeit kündbar</p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <f.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{f.text}</span>
                    <Check className="h-4 w-4 text-primary ml-auto shrink-0" />
                  </div>
                ))}
              </div>

              {/* CTA */}
              {isLoading ? (
                <Button className="w-full" disabled>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </Button>
              ) : isPremium ? (
                <Button variant="outline" className="w-full gap-2" onClick={openCustomerPortal}>
                  <CreditCard className="h-4 w-4" />
                  Abo verwalten
                </Button>
              ) : (
                <Button className="w-full gap-2 text-base h-12" onClick={startCheckout}>
                  <Sparkles className="h-4 w-4" />
                  Jetzt freischalten
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trust note */}
        <p className="text-center text-xs text-muted-foreground">
          Sichere Zahlung über Stripe. Du kannst jederzeit kündigen.
        </p>
      </div>
    </ClientPortalLayout>
  );
}
