import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useJourneyNudge } from '@/hooks/useJourneyNudge';

export function JourneyNudgeCard() {
  const { currentNudge, daysSinceSignup, dismiss, complete, loading } = useJourneyNudge();
  const navigate = useNavigate();

  if (loading || !currentNudge) return null;

  const isPhaseTransition = currentNudge.type === 'phase-transition';
  const isMonthly = currentNudge.type === 'monthly';

  const handleCta = () => {
    complete();
    navigate(currentNudge.cta);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <Card
          className={
            isPhaseTransition
              ? 'border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-md'
              : isMonthly
                ? 'border-accent/30 bg-accent/5'
                : 'border-border/60 bg-card'
          }
        >
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentNudge.emoji}</span>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Tag {daysSinceSignup}
                    {currentNudge.xp && (
                      <span className="ml-2 text-primary">+{currentNudge.xp} XP</span>
                    )}
                  </p>
                  <h3 className="text-sm font-bold text-foreground leading-tight">
                    {currentNudge.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={dismiss}
                className="p-1 rounded-md hover:bg-muted/60 transition-colors shrink-0"
                aria-label="Schliessen"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed pl-7">
              {currentNudge.content}
            </p>

            {/* CTA */}
            <div className="pl-7">
              <Button
                size="sm"
                variant={isPhaseTransition ? 'default' : 'outline'}
                onClick={handleCta}
                className="gap-1.5 text-xs"
              >
                {isPhaseTransition && <Sparkles className="h-3 w-3" />}
                {currentNudge.ctaLabel}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
