import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check } from 'lucide-react';
import type { OfferPackage } from './OfferDetailOverlay';

interface OfferPackageDialogProps {
  pkg: OfferPackage | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OfferPackageDialog({ pkg, isOpen, onClose }: OfferPackageDialogProps) {
  if (!pkg) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl">
        {/* Header with package image */}
        <div className="relative h-48">
          <img
            src={pkg.imageUrl}
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-scale-11/80 via-scale-8/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <DialogHeader>
              <DialogTitle className="text-white text-2xl font-bold">
                {pkg.name}
              </DialogTitle>
            </DialogHeader>
            <p className="text-white/90 text-2xl font-bold mt-2">{pkg.price}</p>
            <p className="text-white/70 text-xs mt-1">Einmaliges Beratungshonorar</p>
          </div>
        </div>

        {/* Features */}
        <div className="p-6 space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Leistungen
          </h4>
          <ul className="space-y-2.5">
            {pkg.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
