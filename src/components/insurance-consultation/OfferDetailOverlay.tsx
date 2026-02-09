import { useEffect, useCallback, useState } from 'react';
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
import { X, HandCoins, Receipt, Blend } from 'lucide-react';
import offerImg from '@/assets/pyramid/unser-angebot.png';
import paketLightImg from '@/assets/pyramid/paket-light.png';
import paketBasicImg from '@/assets/pyramid/paket-basic.png';
import paketPremiumImg from '@/assets/pyramid/paket-premium.png';
import { OfferPackageDialog } from './OfferPackageDialog';

interface OfferDetailOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export interface OfferPackage {
  name: string;
  price: string;
  imageUrl: string;
  highlight?: boolean;
  features: string[];
}

export const packages: OfferPackage[] = [
  {
    name: 'Light',
    price: 'CHF 400.–',
    imageUrl: paketLightImg,
    features: [
      'Basis-Analyse',
      'Bedarfsermittlung',
      'Produktvergleich',
      'Handlungsempfehlung',
    ],
  },
  {
    name: 'Basic',
    price: 'CHF 900.–',
    imageUrl: paketBasicImg,
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
    imageUrl: paketPremiumImg,
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

export function OfferDetailOverlay({ isOpen, onClose }: OfferDetailOverlayProps) {
  const isMobile = useIsMobile();
  const [selectedPackage, setSelectedPackage] = useState<OfferPackage | null>(null);

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
      {/* Hero Section */}
      <div className="relative h-48 shrink-0">
        <img src={offerImg} alt="Unser Angebot" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-scale-11/90 via-scale-8/50 to-transparent" />

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
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
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

          {/* Beratungspakete as clickable tiles with images */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Beratungspakete
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPackage(pkg)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPackage(pkg);
                    }
                  }}
                  className={cn(
                    'relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all',
                    'hover:scale-[1.02] hover:shadow-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                  )}
                >
                  {/* Package image */}
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-scale-11/60 via-scale-8/20 to-transparent" />

                  {/* Price badge */}
                  <Badge className="absolute top-2 left-2 bg-white/20 text-white text-[10px] px-2 hover:bg-white/30">
                    {pkg.price}
                  </Badge>

                  {/* Title */}
                  <span className="absolute bottom-2 left-2 right-2 text-white text-sm font-medium">
                    {pkg.name}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              Die Preisgestaltung wird vor Beratungsbeginn transparent vereinbart.
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

      {/* Package Detail Dialog */}
      <OfferPackageDialog
        pkg={selectedPackage}
        isOpen={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
      />
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
