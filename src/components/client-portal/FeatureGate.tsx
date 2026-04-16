import { ReactNode } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPhaseForFeature, getUnlockConditionText } from '@/config/journeyPhases';
import { cn } from '@/lib/utils';

interface FeatureGateProps {
  featureKey: string;
  isUnlocked: boolean;
  daysSinceSignup: number;
  children: ReactNode;
  /** If true, completely hides the feature instead of showing locked state */
  hideWhenLocked?: boolean;
  className?: string;
}

export function FeatureGate({
  featureKey,
  isUnlocked,
  daysSinceSignup,
  children,
  hideWhenLocked = false,
  className,
}: FeatureGateProps) {
  if (isUnlocked) return <>{children}</>;
  if (hideWhenLocked) return null;

  const phase = getPhaseForFeature(featureKey);
  const conditionText = getUnlockConditionText(featureKey, daysSinceSignup);

  return (
    <div className={cn('relative', className)}>
      {/* Blurred/grayed children */}
      <div className="pointer-events-none select-none opacity-30 blur-[2px]">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/60 backdrop-blur-sm">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
          <Lock className="h-4.5 w-4.5 text-muted-foreground" />
        </div>
        {phase && (
          <p className="text-xs font-medium text-muted-foreground text-center px-4">
            Phase {phase.phase}: {phase.emoji} {phase.name}
          </p>
        )}
        {conditionText && (
          <p className="text-[11px] text-muted-foreground/70 text-center px-6 max-w-[200px]">
            {conditionText}
          </p>
        )}
        <Link
          to="/app/client-portal/journey"
          className="flex items-center gap-1 text-[11px] text-primary font-medium mt-1"
        >
          Pfad anzeigen <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
