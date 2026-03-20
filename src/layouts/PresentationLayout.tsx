import { Badge } from '@/components/ui/badge';
import { Monitor } from 'lucide-react';

interface PresentationLayoutProps {
  children: React.ReactNode;
}

export function PresentationLayout({ children }: PresentationLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle admin-only badge */}
      <div className="fixed top-3 right-3 z-50">
        <Badge variant="outline" className="gap-1.5 text-xs bg-background/80 backdrop-blur">
          <Monitor className="w-3 h-3" />
          Präsentationsmodus
        </Badge>
      </div>
      {children}
    </div>
  );
}
