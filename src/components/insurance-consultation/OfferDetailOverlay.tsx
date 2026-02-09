import { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { X, HandCoins, Receipt, Blend, Check } from 'lucide-react';
import offerImg from '@/assets/pyramid/unser-angebot.png';

interface OfferDetailOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const packages = [
  {
    name: 'Light',
    price: 'CHF 400.–',
    features: [
      'Basis-Analyse',
      'Bedarfsermittlung',
      'Produktvergleich',
      'Handlungsempfehlung',
    ],
  },
  {
    name: 'Mittel',
    price: 'CHF 900.–',
    highlight: true,
    features: [
      'Erweiterte Analyse',
      'Individuelle Strategie',
      'Marktvergleich mehrerer Anbieter',
      'Begleitung bei Umsetzung',
      '1 Servicegespräch pro Jahr',
    ],
  },
  {
    name: 'Premium',
    price: 'CHF 2\'500.–',
    features: [
      'Ganzheitliche Finanz- & Risikoanalyse',
      'Massgeschneidertes Gesamtkonzept',
      'Unabhängiger Marktvergleich',
      'Vertragsoptimierung bestehender Policen',
      'Laufende Betreuung',
      'Jährlicher Finanz-Check',
      'Priorisierter Support',
    ],
  },
];

const compensationModels = [
  {
    icon: HandCoins,
    title: 'Honorarberatung',
    text: 'Transparentes Fixhonorar gemäss gewähltem Paket',
  },
  {
    icon: Receipt,
    title: 'Provisionsberatung',
    text: 'Vergütung über die jeweilige Versicherungsgesellschaft – keine direkten Beratungskosten',
  },
  {
    icon: Blend,
    title: 'Kombinationsmodell',
    text: 'Individuell vereinbar',
  },
];

export function OfferDetailOverlay({ isOpen, onClose }: OfferDetailOverlayProps) {
  const isMobile = useIsMobile();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const panelContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Hero */}
      <div className="relative h-48 shrink-0">
        <img src={offerImg} alt="Unser Angebot" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors z-10"
          aria-label="Schliessen"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-semibold text-white">Unser Angebot</h2>
            <Badge className="bg-white/20 text-white text-[10px] hover:bg-white/30">
              Nicht Teil der 10 Schritte
            </Badge>
          </div>
          <p className="text-white/80 text-sm">Beratungsmodell – Honorar & Provision</p>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 bg-background">
        <div className="p-6 space-y-8">
          {/* Intro */}
          <p className="text-sm text-foreground leading-relaxed">
            Sie entscheiden, wie Sie beraten werden möchten. Volle Transparenz – wahlweise auf Honorarbasis oder auf Provisionsbasis.
          </p>

          {/* Vergütungsmodelle */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Vergütungsmodelle
            </h3>
            <div className="space-y-3">
              {compensationModels.map((model) => (
                <div key={model.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <model.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{model.title}</p>
                    <p className="text-xs text-muted-foreground">{model.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Beratungspakete */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Beratungspakete
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.name}
                  className={cn(
                    'rounded-xl border p-4 transition-all',
                    pkg.highlight
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border bg-card'
                  )}
                >
                  <div className="flex items-baseline justify-between mb-3">
                    <h4 className="text-base font-semibold text-foreground">{pkg.name}</h4>
                    <span className="text-lg font-bold text-primary">{pkg.price}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Hinweis */}
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              Die Preisgestaltung wird vor Beratungsbeginn transparent vereinbart. Alle Beträge verstehen sich als einmaliges Beratungshonorar.
            </p>
          </div>

          {/* Claim */}
          <div className="text-center py-4 border-t border-border">
            <p className="text-sm font-medium text-foreground tracking-wide">
              Transparenz. Fairness. Entscheidungsfreiheit.
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Unser Angebot</SheetTitle>
          </SheetHeader>
          {panelContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 transition-all duration-300',
          isOpen ? 'bg-black/30 backdrop-blur-sm opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed z-50 top-1/2 -translate-y-1/2 right-6',
          'w-[480px] max-h-[85vh]',
          'bg-card border rounded-xl shadow-2xl overflow-hidden',
          'transition-all duration-300 ease-out',
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
        )}
      >
        {panelContent}
      </div>
    </>
  );
}
