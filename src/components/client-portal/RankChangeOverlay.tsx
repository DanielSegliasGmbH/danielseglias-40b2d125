import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { RankChangeEvent } from '@/hooks/useRankSystem';

interface RankChangeOverlayProps {
  event: RankChangeEvent | null;
  onDismiss: () => void;
}

// Simple confetti particle
function ConfettiParticle({ index }: { index: number }) {
  const colors = ['#FFD700', '#FF6B35', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0'];
  const color = colors[index % colors.length];
  const left = 10 + Math.random() * 80;
  const delay = Math.random() * 0.6;
  const size = 6 + Math.random() * 6;
  const rotation = Math.random() * 360;

  return (
    <motion.div
      className="absolute rounded-sm pointer-events-none"
      style={{
        left: `${left}%`,
        top: '-5%',
        width: size,
        height: size,
        backgroundColor: color,
        rotate: rotation,
      }}
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: '120vh',
        opacity: [1, 1, 0],
        rotate: rotation + 720,
        x: [0, (Math.random() - 0.5) * 100],
      }}
      transition={{
        duration: 2.5 + Math.random(),
        delay,
        ease: 'easeIn',
      }}
    />
  );
}

// ARCHIVED for v1.0 — fires on every page load due to race condition between
// score calculation and savedRank DB fetch. Re-enable after fixing in Claude Code.
export function RankChangeOverlay(_props: RankChangeOverlayProps) {
  // ARCHIVED: return null until bug is fixed in Claude Code
  return null;
  // eslint-disable-next-line @typescript-eslint/no-unreachable, no-unreachable
  // @ts-ignore — original implementation preserved below for restoration
  // eslint-disable-next-line
  function _ArchivedImpl({ event, onDismiss }: RankChangeOverlayProps) {
  const navigate = useNavigate();

  // Auto-dismiss rank up after 5 seconds
  useEffect(() => {
    if (event?.type === 'rank_up') {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [event, onDismiss]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={event.type === 'rank_up' ? onDismiss : undefined}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

          {/* Confetti for rank up */}
          {event.type === 'rank_up' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 40 }).map((_, i) => (
                <ConfettiParticle key={i} index={i} />
              ))}
            </div>
          )}

          {/* Content */}
          <motion.div
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          >
            {event.type === 'rank_up' ? (
              <>
                {/* Rank Up */}
                <motion.span
                  className="text-7xl mb-4"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                >
                  {event.newRank.emoji}
                </motion.span>
                <h2 className="text-2xl font-extrabold text-foreground mb-2">
                  Aufstieg!
                </h2>
                <p className="text-lg text-foreground/80 mb-1">
                  Du bist jetzt <span className="font-bold">{event.newRank.emoji} {event.newRank.name}</span>!
                </p>
                <motion.div
                  className="mt-3 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  +200 XP
                </motion.div>
                <p className="text-xs text-muted-foreground mt-4">
                  Tippe zum Schliessen
                </p>
              </>
            ) : (
              <>
                {/* Rank Down */}
                <span className="text-5xl mb-4">⚠️</span>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Dein Rang ist gefallen
                </h2>
                <p className="text-sm text-muted-foreground mb-1">
                  Du bist jetzt <span className="font-semibold">{event.newRank.emoji} {event.newRank.name}</span>
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Deine Ausgaben sind gestiegen oder dein Vermögen hat sich verringert.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss();
                      navigate('/app/client-portal/peak-score');
                    }}
                  >
                    Was ist passiert?
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss();
                      navigate('/app/client-portal/coach');
                    }}
                  >
                    Zurückkämpfen
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  }
}
