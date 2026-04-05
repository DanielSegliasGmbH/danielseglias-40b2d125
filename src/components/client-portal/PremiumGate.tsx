import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

interface PremiumGateProps {
  feature?: string;
  children: React.ReactNode;
  isPremium: boolean;
}

/**
 * Wraps content that is premium-only.
 * If the user is not premium, shows a gentle upgrade invitation instead.
 */
export function PremiumGate({ feature, children, isPremium }: PremiumGateProps) {
  const navigate = useNavigate();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="py-10 px-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {feature ? `${feature} – Premium Feature` : 'Premium Feature'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Schalte den vollen Zugriff frei und nutze alle Werkzeuge, Module und Inhalte ohne Einschränkung.
          </p>
        </div>
        <Button
          onClick={() => navigate('/app/client-portal/premium')}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Premium entdecken
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Inline upgrade hint for when users hit a limit.
 */
export function UpgradeHint({ message }: { message?: string }) {
  const navigate = useNavigate();

  return (
    <Card className="border-amber-200/50 bg-amber-50/30 dark:bg-amber-950/10 dark:border-amber-800/30">
      <CardContent className="py-4 px-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {message || 'Du hast dein Tageslimit erreicht'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Mit Premium hast du unbegrenzten Zugriff.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/client-portal/premium')}
            className="shrink-0 gap-1.5"
          >
            Upgrade
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
