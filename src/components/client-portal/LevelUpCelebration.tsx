import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onLevelUp, LEVELS } from '@/hooks/useGamification';
import { Crown, Trophy, Award, Star, Zap } from 'lucide-react';

const LEVEL_ICONS = [null, Zap, Star, Trophy, Award, Crown];

// Simple confetti particle
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const x = Math.random() * 100;
  const rotation = Math.random() * 720 - 360;

  return (
    <motion.div
      className="absolute w-2.5 h-2.5 rounded-sm"
      style={{
        left: `${x}%`,
        top: '-5%',
        backgroundColor: color,
      }}
      initial={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      animate={{
        opacity: [1, 1, 0],
        y: ['0vh', '100vh'],
        rotate: rotation,
        scale: [1, 0.8, 0.5],
        x: [0, (Math.random() - 0.5) * 200],
      }}
      transition={{
        duration: 2.5 + Math.random(),
        delay,
        ease: 'easeIn',
      }}
    />
  );
}

const CONFETTI_COLORS = [
  'hsl(var(--primary))',
  '#FFD700',
  '#FF6B6B',
  '#4ECDC4',
  '#A78BFA',
  '#FB923C',
  '#34D399',
];

export function LevelUpCelebration() {
  const [celebration, setCelebration] = useState<{ level: number; label: string } | null>(null);

  useEffect(() => {
    return onLevelUp((level, label) => {
      setCelebration({ level, label });
    });
  }, []);

  const dismiss = useCallback(() => setCelebration(null), []);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!celebration) return;
    const timer = setTimeout(dismiss, 5000);
    return () => clearTimeout(timer);
  }, [celebration, dismiss]);

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={dismiss}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 60 }).map((_, i) => (
              <ConfettiParticle
                key={i}
                delay={i * 0.04}
                color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
              />
            ))}
          </div>

          {/* Content */}
          <motion.div
            className="relative z-10 text-center px-8 py-10"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
          >
            {/* Icon */}
            <motion.div
              className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-primary/20 flex items-center justify-center"
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', delay: 0.4 }}
            >
              {(() => {
                const Icon = LEVEL_ICONS[celebration.level] || Trophy;
                return <Icon className="h-10 w-10 text-primary" />;
              })()}
            </motion.div>

            <motion.p
              className="text-lg font-bold text-white/70 mb-1"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              LEVEL UP!
            </motion.p>

            <motion.h2
              className="text-3xl font-black text-white mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Level {celebration.level}
            </motion.h2>

            <motion.p
              className="text-xl font-semibold text-primary"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {celebration.label}
            </motion.p>

            <motion.p
              className="text-sm text-white/50 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Tippe zum Fortfahren
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
