import { motion } from 'framer-motion';
import { Shield, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { HamsterAvatar } from '@/components/client-portal/HamsterAvatar';

interface PeakScoreCardProps {
  onClick: () => void;
}

export function PeakScoreCard({ onClick }: PeakScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.05, duration: 0.4, ease: 'easeOut' }}
    >
      <Card
        className={cn(
          'cursor-pointer active:scale-[0.98] transition-all duration-200 hover:shadow-lg',
          'rounded-2xl border overflow-hidden border-border',
          'bg-gradient-to-br from-muted/40 to-muted/10'
        )}
        onClick={onClick}
      >
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <HamsterAvatar size="sm" />
            <Shield className="h-5 w-5 text-muted-foreground/60" />
          </div>

          <span className="text-2xl font-extrabold tracking-tight text-foreground mt-1">
            PeakScore
          </span>

          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Bald verfügbar
            </span>
            <p className="text-[11px] text-muted-foreground max-w-[240px] leading-relaxed">
              Dein persönlicher Freiheits-Score wird in Kürze berechnet.
            </p>
          </div>

          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mt-4">
            Coming soon
          </span>
        </CardContent>
      </Card>
    </motion.div>
  );
}
